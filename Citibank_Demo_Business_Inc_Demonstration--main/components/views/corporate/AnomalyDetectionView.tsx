"""
This module provides a sophisticated, AI-driven view for real-time financial anomaly detection and intelligent remediation, forming a critical pillar of a next-generation financial infrastructure. It empowers financial institutions to proactively identify, investigate, and resolve complex financial threats, ranging from fraud and compliance breaches to operational errors, thereby safeguarding assets, ensuring regulatory adherence, and maintaining market integrity.

Commercially, this system delivers unparalleled operational efficiency by automating initial anomaly analysis and recommending precise remediation actions. It significantly reduces manual investigation time and costs, while enhancing detection accuracy and reducing false positives through advanced AI. The integration of digital identity and auditable workflows ensures robust governance and compliance, making every action transparent and secure.

This infrastructure generates long-term business value by transforming reactive incident response into proactive risk management. It protects revenue streams from financial crime, preserves brand reputation, and reduces regulatory penalties. By leveraging intelligent automation and real-time insights, the platform enables financial enterprises to scale their operations securely, innovate with programmable value, and build an unshakeable foundation for future digital finance, driving trillions in secured value.
"""

import React, { useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { FinancialAnomaly, AnomalyStatus } from '../../../types';
import { GoogleGenAI } from '@google/genai'; # Keep existing import

# This comment indicates that GoogleGenAI is not directly used in the current simulated UI,
# but conceptually represents the AI inference engine backing the intelligence layer.
# In a full integration, it would power dynamic AI responses, risk scoring, and recommendations.

"""
Defines extended type definitions for a comprehensive anomaly detection system,
enabling deeper investigation and workflow management capabilities crucial for enterprise-grade financial operations.
"""

type AnomalySeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type AnomalyCategory =
  | 'Fraud'
  | 'Compliance Breach'
  | 'Operational Error'
  | 'Market Manipulation'
  | 'Insider Trading'
  | 'Cybersecurity Incident'
  | 'Data Inconsistency'
  | 'Money Laundering'
  | 'Suspicious Activity'
  | 'Accounting Irregularity'
  | 'Unusual Transaction Volume'
  | 'Unexpected Price Movement'
  | 'Vendor Fraud'
  | 'Customer Fraud'
  | 'Employee Embezzlement'
  | 'System Glitch'
  | 'Regulatory Violation'
  | 'Unknown';

export type AnomalyWorkflowStatus =
  | 'New'
  | 'Under Review'
  | 'Pending Further Info'
  | 'Escalated'
  | 'False Positive'
  | 'Resolved'
  | 'Dismissed'
  | 'Archived'
  | 'On Hold'
  | 'Automated Remediation';

export type AnomalyResolutionReason =
  | 'Confirmed Fraud'
  | 'Operational Fix Applied'
  | 'Incorrect Data Input'
  | 'Legitimate Business Activity'
  | 'Policy Update'
  | 'Insufficient Evidence'
  | 'Duplicate Alert'
  | 'Investigation Complete - No Action'
  | 'Regulatory Reporting Filed'
  | 'System Error Correction'
  | 'Automated Action Completed'
  | 'Other';

export interface RelatedTransaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: string;
  senderAccount: string;
  receiverAccount: string;
  transactionType: string;
  description: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'On Hold' | 'Reversed';
  riskScore: number;
  tags?: string[];
  blockhainHash?: string; // For programmable token rails
}

export interface AffectedEntity {
  id: string;
  entityType: 'Account' | 'User' | 'Vendor' | 'Customer' | 'System' | 'Other' | 'Digital Identity';
  entityIdentifier: string;
  name: string;
  riskScore: number;
  associatedAnomaliesCount: number;
  country?: string;
  city?: string;
  accountStatus?: 'Active' | 'Suspended' | 'Closed' | 'Frozen';
  lastActivity?: string;
  digitalIdentityStatus?: 'Verified' | 'Pending Verification' | 'Revoked'; // Links to Digital Identity Layer
}

export interface AuditLogEntry {
  id: string;
  anomalyId: string;
  timestamp: string;
  action: string;
  actor: string;
  actorIdentityId?: string; // Links to Digital Identity Layer
  details: string;
  oldValue?: string;
  newValue?: string;
  cryptographicSignature?: string; // For tamper-evident logs
}

export interface AnomalyComment {
  id: string;
  anomalyId: string;
  timestamp: string;
  author: string;
  authorIdentityId?: string; // Links to Digital Identity Layer
  comment: string;
  attachments?: string[];
  isInternal?: boolean;
}

export interface AnomalyEvidence {
  id: string;
  anomalyId: string;
  filename: string;
  fileType: string;
  uploadDate: string;
  uploader: string;
  uploaderIdentityId?: string; // Links to Digital Identity Layer
  description?: string;
  url: string;
  tags?: string[];
  integrityHash?: string; // For cryptographic integrity
}

export interface AIRecommendation {
  id: string;
  type: 'InvestigationStep' | 'RemediationAction' | 'PolicyReview' | 'AlertTuning' | 'AgentActionTrigger';
  description: string;
  confidenceScore: number;
  suggestedAction?: string;
  isAutomatedAction?: boolean;
  requiresApproval?: boolean;
  status?: 'Pending' | 'Accepted' | 'Rejected' | 'Executing' | 'Completed';
  timestamp?: string;
  agentId?: string; // If recommendation comes from a specific agent
}

export interface ExplainabilityFeature {
  name: string;
  value: string | number | boolean;
  contributionScore: number;
  explanation: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface FinancialAnomalyExtended extends FinancialAnomaly {
  category: AnomalyCategory;
  assignedTo?: string;
  assignedToIdentityId?: string; // Links to Digital Identity Layer
  status: AnomalyWorkflowStatus;
  resolutionReason?: AnomalyResolutionReason;
  resolutionNotes?: string;
  detectionMethod: 'Rule-Based' | 'ML Model' | 'Heuristic' | 'Manual' | 'Agent-Initiated';
  tags: string[];
  impactEstimate?: { amount: number; currency: string; description: string };
  confidenceScore: number;
  historicalContext?: string;
  detectionTimestamp: string;
  lastUpdatedTimestamp: string;
  relatedTransactions?: RelatedTransaction[];
  affectedEntities?: AffectedEntity[];
  auditLog?: AuditLogEntry[];
  comments?: AnomalyComment[];
  evidence?: AnomalyEvidence[];
  aiRecommendations?: AIRecommendation[];
  explainabilityFeatures?: ExplainabilityFeature[];
  location?: GeoLocation;
  slaDueDate?: string;
  timeToResolutionSeconds?: number;
  currentRiskRating?: number; // Dynamic risk rating based on ongoing investigation
  policyViolations?: string[]; // Specific policies violated
  externalReferences?: { system: string; id: string; url: string }[]; // Links to other internal systems (e.g., KYC, AML)
}

"""
Provides utilities for generating realistic mock data, essential for demonstrating
and testing the system's capabilities without relying on live financial feeds.
This ensures a robust and self-contained development environment.
"""

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomElement = <T>(arr: T[]): T => arr[getRandomInt(0, arr.length - 1)];

const generateRandomDate = (daysAgo: number = 30): string => {
  const now = new Date();
  const ago = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const randomTime = ago.getTime() + Math.random() * (now.getTime() - ago.getTime());
  return new Date(randomTime).toISOString();
};

const generateMockRelatedTransaction = (anomalyId: string): RelatedTransaction => ({
  id: generateUUID(),
  transactionId: `TXN-${getRandomInt(100000, 999999)}`,
  amount: parseFloat((Math.random() * 10000 + 10).toFixed(2)),
  currency: getRandomElement(['USD', 'EUR', 'GBP', 'JPY', 'XRP', 'ETH']),
  timestamp: generateRandomDate(7),
  senderAccount: `ACC-${getRandomInt(100000, 999999)}`,
  receiverAccount: `ACC-${getRandomInt(100000, 999999)}`,
  transactionType: getRandomElement(['Deposit', 'Withdrawal', 'Transfer', 'Payment', 'Refund', 'Token Mint', 'Token Burn']),
  description: getRandomElement([
    'International Funds Transfer',
    'High-Value Payment',
    'Multiple Small Transactions',
    'Unusual Account Activity',
    'Cryptocurrency Purchase',
    'Cross-border Payment Rail',
    'Suspicious FX Swap',
  ]),
  status: getRandomElement(['Completed', 'Pending', 'Failed', 'On Hold', 'Reversed']),
  riskScore: getRandomInt(1, 100),
  tags: getRandomElement([['international'], ['suspicious'], ['high-value'], ['crypto', 'new-recipient'], ['cross-border', 'high-latency'], []]),
  blockhainHash: Math.random() > 0.5 ? `0x${generateUUID().replace(/-/g, '')}` : undefined,
});

const generateMockAffectedEntity = (): AffectedEntity => ({
  id: generateUUID(),
  entityType: getRandomElement(['Account', 'User', 'Vendor', 'Customer', 'Digital Identity']),
  entityIdentifier: `ENT-${getRandomInt(1000, 9999)}`,
  name: getRandomElement(['Global Corp Ltd.', 'John Doe', 'Acme Solutions', 'Jane Smith', 'Widget Co.', 'Digital ID Provider']),
  riskScore: getRandomInt(1, 100),
  associatedAnomaliesCount: getRandomInt(1, 15),
  country: getRandomElement(['USA', 'UK', 'Germany', 'Canada', 'Australia', 'Japan', 'India', 'Brazil', 'Singapore', 'UAE']),
  city: getRandomElement(['New York', 'London', 'Berlin', 'Toronto', 'Sydney', 'Tokyo', 'Mumbai', 'SÃ£o Paulo', 'Singapore', 'Dubai']),
  accountStatus: getRandomElement(['Active', 'Suspended', 'Frozen']),
  lastActivity: generateRandomDate(14),
  digitalIdentityStatus: Math.random() > 0.4 ? getRandomElement(['Verified', 'Pending Verification', 'Revoked']) : undefined,
});

const generateMockAuditLogEntry = (anomalyId: string, actor: string, actorIdentityId: string, action: string, details: string, oldValue?: string, newValue?: string): AuditLogEntry => ({
  id: generateUUID(),
  anomalyId,
  timestamp: new Date().toISOString(),
  action,
  actor,
  actorIdentityId,
  details,
  oldValue,
  newValue,
  cryptographicSignature: `SIG-${generateUUID().substring(0, 16)}`, // Simulated cryptographic signature
});

const generateMockAnomalyComment = (anomalyId: string, author: string, authorIdentityId: string): AnomalyComment => ({
  id: generateUUID(),
  anomalyId,
  timestamp: new Date().toISOString(),
  author,
  authorIdentityId,
  comment: getRandomElement([
    'Initial assessment indicates potential market manipulation. Investigating further.',
    'Need to gather more information on related entities.',
    'Contacting the affected customer for clarification.',
    'Looks like a false positive due to recent system upgrade. Confirming with ops.',
    'Escalating to Legal department for review.',
    'AI agent suggests reviewing transaction sequence for layering.',
    'Compliance check initiated for associated digital identities.',
  ]),
  isInternal: Math.random() > 0.3,
});

const generateMockAnomalyEvidence = (anomalyId: string, uploader: string, uploaderIdentityId: string): AnomalyEvidence => ({
  id: generateUUID(),
  anomalyId,
  filename: getRandomElement(['transaction_report.pdf', 'user_activity_log.csv', 'email_correspondence.txt', 'network_traffic.pcap', 'blockchain_ledger_snapshot.json']),
  fileType: getRandomElement(['pdf', 'csv', 'txt', 'pcap', 'json', 'jpg']),
  uploadDate: new Date().toISOString(),
  uploader,
  uploaderIdentityId,
  description: getRandomElement([
    'Transaction details for period.',
    'User login attempts.',
    'Communication regarding the suspicious activity.',
    'Network forensics data.',
    'Blockchain ledger entry for token transfer.',
    'Supporting document for policy review.',
    '',
  ]),
  url: `https://mock-storage.com/evidence/${generateUUID()}`,
  tags: getRandomElement([['financial'], ['logs'], ['communication'], ['forensics'], ['blockchain'], ['compliance'], []]),
  integrityHash: `HASH-${generateUUID().replace(/-/g, '').substring(0, 32)}`, // Simulated cryptographic hash
});

const generateMockAIRecommendation = (): AIRecommendation => ({
  id: generateUUID(),
  type: getRandomElement(['InvestigationStep', 'RemediationAction', 'PolicyReview', 'AlertTuning', 'AgentActionTrigger']),
  description: getRandomElement([
    'Review all transactions for this entity from the last 90 days.',
    'Temporarily suspend account until verification is complete.',
    'Evaluate current fraud detection rules for similar patterns.',
    'Adjust anomaly detection threshold for low-value international transfers.',
    'Initiate KYC review for associated accounts.',
    'Trigger automated funds hold on primary beneficiary account.',
    'Initiate identity re-verification for sender.',
    'Escalate to compliance agent for policy review.',
  ]),
  confidenceScore: parseFloat(Math.random().toFixed(2)),
  suggestedAction: getRandomElement(['Flag Account', 'Block Transaction', 'Request Documentation', 'Update Rule', 'Review Policy', 'Hold Funds', 'Verify Identity', 'Notify Regulator']),
  isAutomatedAction: Math.random() > 0.7,
  requiresApproval: Math.random() > 0.5,
  status: getRandomElement(['Pending', 'Accepted', 'Rejected']),
  timestamp: new Date().toISOString(),
  agentId: Math.random() > 0.3 ? `Agent-${getRandomInt(100, 999)}` : undefined,
});

const generateMockExplainabilityFeature = (): ExplainabilityFeature => ({
  name: getRandomElement([
    'Transaction Volume (Daily)',
    'Sender Account Age',
    'Recipient Country',
    'Time of Day',
    'Number of High-Value Transactions',
    'Previous Anomaly History (Sender)',
    'IP Address Geo-Mismatch',
    'Digital Identity Trust Score',
    'Compliance Rule Triggered',
  ]),
  value: getRandomElement([
    getRandomInt(1, 1000).toString(),
    getRandomInt(1, 365).toString(),
    getRandomElement(['USA', 'Russia', 'China', 'Nigeria', 'Cayman Islands']),
    `${getRandomInt(0, 23)}:00`,
    getRandomInt(0, 5).toString(),
    Math.random() > 0.5,
    Math.random() > 0.5,
    parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)), // Trust score
    `AML-${getRandomInt(1, 5)}`,
  ]),
  contributionScore: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
  explanation: getRandomElement([
    'Significantly higher than average volume for this account.',
    'Newly created account showing suspicious activity.',
    'High-risk jurisdiction for funds transfer.',
    'Activity occurring outside of normal business hours.',
    'Multiple transactions exceeding typical thresholds.',
    'Sender has a history of flagged transactions.',
    'IP address does not match registered country.',
    'Low digital identity trust score due to recent changes.',
    'Transaction pattern matches known money laundering rule.',
  ]),
});

const generateMockFinancialAnomalyExtended = (id?: string): FinancialAnomalyExtended => {
  const anomalyId = id || generateUUID();
  const severity: AnomalySeverity = getRandomElement(['Critical', 'High', 'Medium', 'Low', 'Informational']);
  const status: AnomalyWorkflowStatus = getRandomElement([
    'New',
    'Under Review',
    'Pending Further Info',
    'Escalated',
    'Resolved',
    'Dismissed',
  ]);
  const detectionTimestamp = generateRandomDate(30);
  const lastUpdatedTimestamp = status === 'New' ? detectionTimestamp : generateRandomDate(status === 'Resolved' || status === 'Dismissed' ? 7 : 0);

  const mockActor = getRandomElement(['Analyst A', 'Compliance Bot', 'System Monitor']);
  const mockActorId = `USER-${getRandomInt(100, 999)}`;

  const auditLogEntries: AuditLogEntry[] = [
    generateMockAuditLogEntry(anomalyId, 'System', 'SYS-ID-001', 'Anomaly Detected', 'Initial detection by ML model.'),
  ];
  if (status !== 'New') {
    auditLogEntries.push(generateMockAuditLogEntry(anomalyId, mockActor, mockActorId, 'Status Changed', `Status updated to ${status}.`));
    if (status === 'Under Review') {
      auditLogEntries.push(generateMockAuditLogEntry(anomalyId, mockActor, mockActorId, 'Assigned To', `Assigned to ${mockActor}.`, undefined, mockActor));
    }
  }

  const relatedTransactions = Array(getRandomInt(1, 5)).fill(null).map(() => generateMockRelatedTransaction(anomalyId));
  const affectedEntities = Array(getRandomInt(1, 3)).fill(null).map(generateMockAffectedEntity);
  const aiRecommendations = Array(getRandomInt(0, 3)).fill(null).map(generateMockAIRecommendation);
  const explainabilityFeatures = Array(getRandomInt(3, 7)).fill(null).map(generateMockExplainabilityFeature);

  return {
    id: anomalyId,
    description: getRandomElement([
      'Unusual Large Transaction to Offshore Account',
      'Multiple Small Transfers to New Beneficiaries',
      'Sudden Spike in Trading Volume on Penny Stock',
      'Employee Expense Claim Irregularity',
      'Customer Account Takeover Attempt Detected',
      'Vendor Payment Discrepancy',
      'Failed Login Attempts from High-Risk IP',
      'Unusual Cash Withdrawal Pattern',
      'Out-of-Pattern Trading Behavior by Executive',
      'Unauthorized Token Minting Attempt',
      'Cross-Chain Value Transfer Mismatch',
    ]),
    details: getRandomElement([
      'AI detected 3 transactions totaling $500,000 to an account in the Cayman Islands, which is atypical for this user profile. The transactions occurred within a 2-hour window.',
      'Pattern identified: 15 transactions under $500 over 2 days to 7 distinct, newly added beneficiaries, suggesting potential layering.',
      'A particular low-cap stock (XYZ) experienced a 500% surge in trading volume within an hour, indicating potential pump-and-dump scheme. AI confidence: 0.92.',
      'Employee John Doe submitted two duplicate expense claims for the same business trip. The system flagged the similarity in receipts and dates.',
      'Multiple login attempts from an IP address in Vietnam for a US-based customer account, followed by an attempt to change password. Risk score: 98.',
      'Payment to vendor "Alpha Services" was $15,000 higher than the invoiced amount. Discrepancy identified during automated reconciliation.',
      'Over 200 failed login attempts originating from IP range 192.168.1.x, suggesting brute-force attack. No successful logins detected.',
      'Account holder "Jane Smith" made 4 ATM withdrawals in different cities within a 3-hour period, which is geographically impossible. Total withdrawn: $2000.',
      'Executive "Amanda Green" executed large sell orders before a significant negative news announcement, raising insider trading concerns.',
      'A smart contract initiated a token minting request exceeding the approved governance policy limit by 200%. Automated block initiated.',
      'Cross-chain bridge reported a mismatch in settled value between SourceChain and DestChain for a high-value transfer, indicating potential exploit.',
    ]),
    entityDescription: getRandomElement([
      'Account: ACC-123456789',
      'User: john.doe@example.com',
      'Vendor: Acme Corp',
      'Stock Symbol: XYZ',
      'Employee ID: 98765',
      'Smart Contract: 0xAbcDef123',
    ]),
    timestamp: generateRandomDate(30),
    severity: severity,
    riskScore: getRandomInt(
      severity === 'Critical' ? 90 : severity === 'High' ? 70 : severity === 'Medium' ? 40 : severity === 'Low' ? 10 : 1,
      100,
    ),
    status: status,
    category: getRandomElement<AnomalyCategory>([
      'Fraud',
      'Money Laundering',
      'Market Manipulation',
      'Operational Error',
      'Cybersecurity Incident',
      'Suspicious Activity',
      'Compliance Breach',
      'Unusual Transaction Volume',
    ]),
    assignedTo: status === 'New' || Math.random() < 0.3 ? undefined : getRandomElement(['Analyst A', 'Analyst B', 'Agent_Compliance_1']),
    assignedToIdentityId: Math.random() > 0.5 ? `DID-${getRandomInt(1000, 9999)}` : undefined,
    resolutionReason: status === 'Resolved' ? getRandomElement(['Confirmed Fraud', 'Operational Fix Applied', 'Legitimate Business Activity', 'Automated Action Completed']) : undefined,
    resolutionNotes: status === 'Resolved' ? 'Full investigation completed, appropriate actions taken.' : undefined,
    detectionMethod: getRandomElement(['ML Model', 'Rule-Based', 'Heuristic', 'Agent-Initiated']),
    tags: Array.from(
      new Set(
        Array(getRandomInt(0, 3))
          .fill(null)
          .map(() => getRandomElement(['high-risk', 'international', 'new-entity', 'urgent', 'false-positive', 'review-kyc', 'compliance', 'programmable-value', 'digital-identity'])),
      ),
    ),
    impactEstimate: Math.random() > 0.6
      ? {
          amount: parseFloat((Math.random() * 500000 + 1000).toFixed(2)),
          currency: 'USD',
          description: 'Estimated potential loss or fine.',
        }
      : undefined,
    confidenceScore: parseFloat((Math.random() * 0.4 + 0.5).toFixed(2)),
    historicalContext:
      Math.random() > 0.5
        ? 'Similar patterns observed in Q3 2022, led to account suspension.'
        : undefined,
    detectionTimestamp: detectionTimestamp,
    lastUpdatedTimestamp: lastUpdatedTimestamp,
    relatedTransactions: relatedTransactions,
    affectedEntities: affectedEntities,
    auditLog: auditLogEntries,
    comments: Array(getRandomInt(0, 4)).fill(null).map(() => generateMockAnomalyComment(anomalyId, mockActor, mockActorId)),
    evidence: Array(getRandomInt(0, 3)).fill(null).map(() => generateMockAnomalyEvidence(anomalyId, getRandomElement(['Analyst A', 'System Collector']), mockActorId)),
    aiRecommendations: aiRecommendations,
    explainabilityFeatures: explainabilityFeatures,
    location: Math.random() > 0.7
      ? {
          latitude: parseFloat((Math.random() * 180 - 90).toFixed(6)),
          longitude: parseFloat((Math.random() * 360 - 180).toFixed(6)),
          city: getRandomElement(['New York', 'London', 'Tokyo', 'Singapore', 'Dubai', 'Zurich']),
          country: getRandomElement(['USA', 'UK', 'Japan', 'Singapore', 'UAE', 'Switzerland']),
        }
      : undefined,
    slaDueDate: Math.random() > 0.4 ? new Date(new Date().getTime() + getRandomInt(1, 14) * 24 * 60 * 60 * 1000).toISOString() : undefined,
    timeToResolutionSeconds: status === 'Resolved' ? getRandomInt(3600, 86400 * 7) : undefined,
    currentRiskRating: getRandomInt(1, 100),
    policyViolations: Math.random() > 0.6 ? [getRandomElement(['AML Policy A', 'Sanctions Policy B', 'KYC Rule C'])] : undefined,
    externalReferences: Math.random() > 0.5 ? [{ system: getRandomElement(['KYC', 'AML', 'RiskEngine']), id: `REF-${getRandomInt(100, 999)}`, url: 'https://mock-system.com/ref' }] : undefined,
  };
};

const INITIAL_MOCK_ANOMALIES: FinancialAnomalyExtended[] = Array(200)
  .fill(null)
  .map(() => generateMockFinancialAnomalyExtended());

"""
Provides a set of reusable UI components that form the building blocks
of the interactive and data-rich anomaly detection interface. These components
are designed for modularity, consistency, and a premium user experience.
"""

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full w-[95%]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 animate-fadeIn">
      <div
        className={`bg-gray-800 rounded-lg shadow-2xl p-6 ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 opacity-0 ${isOpen ? 'scale-100 opacity-100' : ''} ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg bg-gray-600 hover:bg-gray-700 text-white">
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-sm rounded-lg ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timeout?: number;
}

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (notification.timeout) {
      timerRef.current = setTimeout(() => {
        onDismiss(notification.id);
      }, notification.timeout);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification, onDismiss]);

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-orange-600',
  };

  return (
    <div
      className={`${bgColor[notification.type]} text-white p-4 rounded-lg shadow-lg mb-3 flex items-center justify-between animate-slideInRight`}
      role="alert"
    >
      <p className="text-sm font-medium">{notification.message}</p>
      <button onClick={() => onDismiss(notification.id)} className="ml-4 text-white hover:text-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const NotificationContainer: React.FC<{
  notifications: Notification[];
  onDismissNotification: (id: string) => void;
}> = ({ notifications, onDismissNotification }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] w-full max-w-sm">
      {notifications.map((notif) => (
        <NotificationToast key={notif.id} notification={notif} onDismiss={onDismissNotification} />
      ))}
    </div>
  );
};

export interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export const Paginator: React.FC<PaginatorProps> = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) => {
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage === 1 && endPage < totalPages) {
      endPage = Math.min(totalPages, startPage + 4);
    } else if (endPage === totalPages && startPage > 1) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex justify-between items-center text-sm text-gray-400 mt-6 p-3 bg-gray-800/50 rounded-lg">
      {totalItems !== undefined && itemsPerPage !== undefined && (
        <span className="text-xs">
          Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </span>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &laquo;
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &lsaquo;
        </button>
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &rsaquo;
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export interface TabPanelProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  tabClassName?: string;
  panelClassName?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ tabs, activeTab, onTabChange, className, tabClassName, panelClassName }) => {
  return (
    <div className={`tab-panel-container ${className || ''}`}>
      <div className="flex border-b border-gray-700 mb-4 overflow-x-auto whitespace-nowrap hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-4 text-sm font-medium ${activeTab === tab.id ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'} ${tabClassName || ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={`tab-panel-content ${panelClassName || ''}`}>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export interface FilterSelectProps<T> {
  label: string;
  options: { value: T; label: string }[];
  selectedValue: T | undefined;
  onChange: (value: T | undefined) => void;
  allowClear?: boolean;
}

export const FilterSelect = <T extends string | number | undefined>({
  label,
  options,
  selectedValue,
  onChange,
  allowClear = true,
}: FilterSelectProps<T>): JSX.Element => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-300">{label}</label>
      <select
        value={selectedValue === undefined ? '' : String(selectedValue)}
        onChange={(e) => onChange(e.target.value === '' ? undefined : (e.target.value as T))}
        className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
      >
        {allowClear && <option value="">All {label.toLowerCase()}</option>}
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const InputField: React.FC<{
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  multiline?: boolean;
  className?: string;
  id?: string;
  rows?: number;
}> = ({ label, value, onChange, type = 'text', placeholder, readOnly = false, multiline = false, className, id, rows = 3 }) => (
  <div className={`flex flex-col gap-1 ${className || ''}`}>
    <label htmlFor={id} className="text-xs font-semibold text-gray-300">
      {label}
    </label>
    {multiline ? (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
        className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-white focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed resize-y"
      />
    ) : (
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-white focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
      />
    )}
  </div>
);

export const Button: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}> = ({ children, onClick, variant = 'primary', size = 'md', disabled = false, className, type = 'button' }) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200';
  const sizeStyles = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-700 text-gray-300',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
    >
      {children}
    </button>
  );
};

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    <span className="ml-3 text-gray-400 text-sm">Loading...</span>
  </div>
);

export interface ChartPlaceholderProps {
  title: string;
  height?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title, height = 'h-48', description, className, children }) => (
  <div className={`bg-gray-800/60 p-4 rounded-lg border border-gray-700 flex flex-col justify-center items-center ${height} ${className || ''}`}>
    <p className="text-lg font-bold text-gray-300 mb-2">{title}</p>
    <p className="text-xs text-gray-500 text-center">{description || 'Data visualization goes here.'}</p>
    {children || (
      <div className="mt-4 text-gray-600 text-sm italic">
        <p>[Chart Library Placeholder]</p>
      </div>
    )}
  </div>
);

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, description, change, changeType, icon }) => {
  const changeColorClass = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400',
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-gray-800/50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</h4>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
      <p className="text-4xl font-extrabold text-white mb-2">{value}</p>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      {change && (
        <div className="flex items-center text-sm">
          <span className={`font-semibold ${changeColorClass[changeType || 'neutral']}`}>{change}</span>
          <span className="ml-1 text-gray-500">vs. last period</span>
        </div>
      )}
    </Card>
  );
};

export const Tag: React.FC<{
  label: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'info' | 'warning' | 'danger' | 'success';
}> = ({ label, className, variant = 'info' }) => {
  const variantClasses = {
    primary: 'bg-indigo-800 text-indigo-200',
    secondary: 'bg-gray-700 text-gray-200',
    info: 'bg-blue-800 text-blue-200',
    warning: 'bg-orange-800 text-orange-200',
    danger: 'bg-red-800 text-red-200',
    success: 'bg-green-800 text-green-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className || ''}`}>
      {label}
    </span>
  );
};

"""
Extends the application's data context with advanced state management and
mocked backend interactions. This layer simulates a robust, production-ready
financial system's interaction with UI components, enabling comprehensive
demonstration and testing without live dependencies. It integrates concepts
from the agentic intelligence layer, digital identity, and auditable governance.
"""

interface DataContextExtended {
  financialAnomalies: FinancialAnomalyExtended[];
  updateAnomalyStatus: (id: string, newStatus: AnomalyWorkflowStatus, actor: string, actorIdentityId: string, reason?: AnomalyResolutionReason, notes?: string) => void;
  addAnomalyComment: (anomalyId: string, comment: string, author: string, authorIdentityId: string, isInternal?: boolean) => void;
  updateAnomalyDetails: (anomaly: FinancialAnomalyExtended, actor: string, actorIdentityId: string, notes?: string) => void;
  assignAnomaly: (anomalyId: string, assignee: string, assigneeIdentityId: string, actor: string, actorIdentityId: string) => void;
  dismissAnomalies: (ids: string[], reason: AnomalyResolutionReason, notes: string, actor: string, actorIdentityId: string) => void;
  resolveAnomalies: (ids: string[], reason: AnomalyResolutionReason, notes: string, actor: string, actorIdentityId: string) => void;
  uploadEvidence: (anomalyId: string, filename: string, fileType: string, uploader: string, uploaderIdentityId: string, description: string, url: string) => void;
  applyAIRecommendation: (anomalyId: string, recommendationId: string, actor: string, actorIdentityId: string) => void;
  notifications: Notification[];
  dismissNotification: (id: string) => void;
}

const useMockDataContext = (): DataContextExtended => {
  const [anomalies, setAnomalies] = useState<FinancialAnomalyExtended[]>(INITIAL_MOCK_ANOMALIES);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: Notification['type'], timeout: number = 5000) => {
    const id = generateUUID();
    setNotifications((prev) => [...prev, { id, message, type, timeout }]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateAnomalyStatus = useCallback(
    (id: string, newStatus: AnomalyWorkflowStatus, actor: string, actorIdentityId: string, reason?: AnomalyResolutionReason, notes?: string) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) =>
          anomaly.id === id
            ? {
                ...anomaly,
                status: newStatus,
                resolutionReason: reason || anomaly.resolutionReason,
                resolutionNotes: notes || anomaly.resolutionNotes,
                lastUpdatedTimestamp: new Date().toISOString(),
                timeToResolutionSeconds: newStatus === 'Resolved' ? (new Date().getTime() - new Date(anomaly.detectionTimestamp).getTime()) / 1000 : anomaly.timeToResolutionSeconds,
                auditLog: [
                  ...(anomaly.auditLog || []),
                  generateMockAuditLogEntry(
                    id,
                    actor,
                    actorIdentityId,
                    'Status Changed',
                    `Status updated to "${newStatus}".${reason ? ` Reason: ${reason}.` : ''}${notes ? ` Notes: ${notes}.` : ''}`,
                    anomaly.status,
                    newStatus,
                  ),
                ],
              }
            : anomaly,
        ),
      );
      addNotification(`Anomaly ${id.substring(0, 8)} status updated to "${newStatus}"`, 'success');
    },
    [addNotification],
  );

  const addAnomalyComment = useCallback(
    (anomalyId: string, comment: string, author: string, authorIdentityId: string, isInternal: boolean = true) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) =>
          anomaly.id === anomalyId
            ? {
                ...anomaly,
                comments: [
                  ...(anomaly.comments || []),
                  generateMockAnomalyComment(anomalyId, author, authorIdentityId),
                ],
                auditLog: [
                  ...(anomaly.auditLog || []),
                  generateMockAuditLogEntry(
                    anomalyId,
                    author,
                    authorIdentityId,
                    'Comment Added',
                    `Added comment: "${comment.substring(0, 50)}..."`,
                  ),
                ],
                lastUpdatedTimestamp: new Date().toISOString(),
              }
            : anomaly,
        ),
      );
      addNotification(`Comment added to Anomaly ${anomalyId.substring(0, 8)}`, 'success');
    },
    [addNotification],
  );

  const updateAnomalyDetails = useCallback(
    (updatedAnomaly: FinancialAnomalyExtended, actor: string, actorIdentityId: string, notes?: string) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) =>
          anomaly.id === updatedAnomaly.id
            ? {
                ...updatedAnomaly,
                lastUpdatedTimestamp: new Date().toISOString(),
                auditLog: [
                  ...(anomaly.auditLog || []),
                  generateMockAuditLogEntry(
                    anomaly.id,
                    actor,
                    actorIdentityId,
                    'Details Updated',
                    `Anomaly details updated by user. ${notes || ''}`,
                  ),
                ],
              }
            : anomaly,
        ),
      );
      addNotification(`Anomaly ${updatedAnomaly.id.substring(0, 8)} details updated`, 'success');
    },
    [addNotification],
  );

  const assignAnomaly = useCallback(
    (anomalyId: string, assignee: string, assigneeIdentityId: string, actor: string, actorIdentityId: string) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) =>
          anomaly.id === anomalyId
            ? {
                ...anomaly,
                assignedTo: assignee,
                assignedToIdentityId: assigneeIdentityId,
                status: anomaly.status === 'New' ? 'Under Review' : anomaly.status,
                auditLog: [
                  ...(anomaly.auditLog || []),
                  generateMockAuditLogEntry(
                    anomalyId,
                    actor,
                    actorIdentityId,
                    'Assigned To',
                    `Assigned to ${assignee}.`,
                    anomaly.assignedTo,
                    assignee,
                  ),
                ],
                lastUpdatedTimestamp: new Date().toISOString(),
              }
            : anomaly,
        ),
      );
      addNotification(`Anomaly ${anomalyId.substring(0, 8)} assigned to ${assignee}`, 'success');
    },
    [addNotification],
  );

  const dismissAnomalies = useCallback(
    (ids: string[], reason: AnomalyResolutionReason, notes: string, actor: string, actorIdentityId: string) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) =>
          ids.includes(anomaly.id)
            ? {
                ...anomaly,
                status: 'Dismissed',
                resolutionReason: reason,
                resolutionNotes: notes,
                lastUpdatedTimestamp: new Date().toISOString(),
                auditLog: [
                  ...(anomaly.auditLog || []),
                  generateMockAuditLogEntry(
                    anomaly.id,
                    actor,
                    actorIdentityId,
                    'Status Changed',
                    `Dismissed anomaly. Reason: ${reason}. Notes: ${notes}`,
                    anomaly.status,
                    'Dismissed',
                  ),
                ],
              }
            : anomaly,
        ),
      );
      addNotification(`${ids.length} anomalies dismissed successfully.`, 'success');
    },
    [addNotification],
  );

  const resolveAnomalies = useCallback(
    (ids: string[], reason: AnomalyResolutionReason, notes: string, actor: string, actorIdentityId: string) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) =>
          ids.includes(anomaly.id)
            ? {
                ...anomaly,
                status: 'Resolved',
                resolutionReason: reason,
                resolutionNotes: notes,
                lastUpdatedTimestamp: new Date().toISOString(),
                timeToResolutionSeconds: (new Date().getTime() - new Date(anomaly.detectionTimestamp).getTime()) / 1000,
                auditLog: [
                  ...(anomaly.auditLog || []),
                  generateMockAuditLogEntry(
                    anomaly.id,
                    actor,
                    actorIdentityId,
                    'Status Changed',
                    `Resolved anomaly. Reason: ${reason}. Notes: ${notes}`,
                    anomaly.status,
                    'Resolved',
                  ),
                ],
              }
            : anomaly,
        ),
      );
      addNotification(`${ids.length} anomalies resolved successfully.`, 'success');
    },
    [addNotification],
  );

  const uploadEvidence = useCallback(
    (anomalyId: string, filename: string, fileType: string, uploader: string, uploaderIdentityId: string, description: string, url: string) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) =>
          anomaly.id === anomalyId
            ? {
                ...anomaly,
                evidence: [
                  ...(anomaly.evidence || []),
                  generateMockAnomalyEvidence(anomalyId, uploader, uploaderIdentityId),
                ],
                auditLog: [
                  ...(anomaly.auditLog || []),
                  generateMockAuditLogEntry(
                    anomalyId,
                    uploader,
                    uploaderIdentityId,
                    'Evidence Uploaded',
                    `Uploaded evidence: ${filename}`,
                  ),
                ],
                lastUpdatedTimestamp: new Date().toISOString(),
              }
            : anomaly,
        ),
      );
      addNotification(`Evidence "${filename}" uploaded for Anomaly ${anomalyId.substring(0, 8)}`, 'success');
    },
    [addNotification],
  );

  const applyAIRecommendation = useCallback(
    (anomalyId: string, recommendationId: string, actor: string, actorIdentityId: string) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) => {
          if (anomaly.id === anomalyId) {
            const updatedRecommendations = anomaly.aiRecommendations?.map(rec =>
              rec.id === recommendationId ? { ...rec, status: 'Completed' } : rec
            ) || [];
            const recommendation = anomaly.aiRecommendations?.find(rec => rec.id === recommendationId);
            let actionDetails = `AI Recommendation "${recommendation?.description || 'N/A'}" applied.`;
            let newStatus = anomaly.status;
            let resolutionReason = anomaly.resolutionReason;

            if (recommendation?.isAutomatedAction) {
                actionDetails = `Automated action triggered by AI Recommendation: "${recommendation.suggestedAction || 'N/A'}".`;
                newStatus = 'Automated Remediation';
                resolutionReason = 'Automated Action Completed';
            }

            return {
              ...anomaly,
              status: newStatus,
              resolutionReason: resolutionReason,
              aiRecommendations: updatedRecommendations,
              auditLog: [
                ...(anomaly.auditLog || []),
                generateMockAuditLogEntry(
                  anomalyId,
                  actor,
                  actorIdentityId,
                  'AI Recommendation Applied',
                  actionDetails,
                  anomaly.status,
                  newStatus,
                ),
              ],
              lastUpdatedTimestamp: new Date().toISOString(),
            };
          }
          return anomaly;
        }),
      );
      addNotification(`AI Recommendation applied for Anomaly ${anomalyId.substring(0, 8)}`, 'info');
    },
    [addNotification],
  );

  return {
    financialAnomalies: anomalies,
    updateAnomalyStatus,
    addAnomalyComment,
    updateAnomalyDetails,
    assignAnomaly,
    dismissAnomalies,
    resolveAnomalies,
    uploadEvidence,
    applyAIRecommendation,
    notifications,
    dismissNotification,
  };
};

"""
Provides focused components for the in-depth investigation of individual anomalies.
These elements enable analysts to drill down into specifics, review all related data,
and execute remediation actions, thereby driving efficiency in resolving complex financial incidents.
"""

export interface AnomalyDetailPanelProps {
  anomaly: FinancialAnomalyExtended;
  onClose: () => void;
  updateAnomalyStatus: (id: string, newStatus: AnomalyWorkflowStatus, actor: string, actorIdentityId: string, reason?: AnomalyResolutionReason, notes?: string) => void;
  addAnomalyComment: (anomalyId: string, comment: string, author: string, authorIdentityId: string, isInternal?: boolean) => void;
  updateAnomalyDetails: (anomaly: FinancialAnomalyExtended, actor: string, actorIdentityId: string, notes?: string) => void;
  assignAnomaly: (anomalyId: string, assignee: string, assigneeIdentityId: string, actor: string, actorIdentityId: string) => void;
  uploadEvidence: (anomalyId: string, filename: string, fileType: string, uploader: string, uploaderIdentityId: string, description: string, url: string) => void;
  applyAIRecommendation: (anomalyId: string, recommendationId: string, actor: string, actorIdentityId: string) => void;
  currentUser: { name: string; identityId: string; role: 'Analyst' | 'Admin' | 'Team Lead' };
}

const AnomalySummaryCard: React.FC<{ anomaly: FinancialAnomalyExtended; currentUser: { name: string; identityId: string; role: string } }> = ({ anomaly, currentUser }) => {
  const SeverityIndicator: React.FC<{ severity: AnomalySeverity }> = ({ severity }) => {
    const colors = {
      Critical: 'border-red-500 bg-red-900/30 text-red-300',
      High: 'border-orange-500 bg-orange-900/30 text-orange-300',
      Medium: 'border-yellow-500 bg-yellow-900/30 text-yellow-300',
      Low: 'border-blue-500 bg-blue-900/30 text-blue-300',
      Informational: 'border-green-500 bg-green-900/30 text-green-300',
    };
    const dotColors = {
      Critical: 'bg-red-500',
      High: 'bg-orange-500',
      Medium: 'bg-yellow-500',
      Low: 'bg-blue-500',
      Informational: 'bg-green-500',
    };
    return (
      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[severity]}`}>
        <div className={`w-2 h-2 rounded-full ${dotColors[severity]}`}></div>
        {severity}
      </div>
    );
  };

  return (
    <Card className="p-6 bg-gray-800/60 border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex-grow">
          <SeverityIndicator severity={anomaly.severity} />
          <h3 className="font-bold text-white text-2xl mt-3">{anomaly.description}</h3>
          <p className="text-sm text-gray-400 font-mono mt-1">
            {anomaly.entityDescription} - {new Date(anomaly.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="text-left sm:text-right flex-shrink-0">
          <p className="text-xs text-gray-400 uppercase">Risk Score</p>
          <p className="text-5xl font-extrabold text-red-400 leading-none">{anomaly.riskScore}</p>
        </div>
      </div>
      <p className="text-sm text-gray-300 italic bg-gray-900/30 p-4 rounded-lg border-l-4 border-cyan-500">
        <span className="font-bold text-cyan-300 not-italic">AI Analysis:</span> "{anomaly.details}"
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 text-sm">
        <div>
          <p className="text-gray-500">Current Status</p>
          <p className="font-semibold text-cyan-300">{anomaly.status}</p>
        </div>
        <div>
          <p className="text-gray-500">Assigned To</p>
          <p className="font-semibold text-white">{anomaly.assignedTo || 'Unassigned'}</p>
        </div>
        <div>
          <p className="text-gray-500">Category</p>
          <p className="font-semibold text-white">{anomaly.category}</p>
        </div>
        <div>
          <p className="text-gray-500">Confidence Score (AI)</p>
          <p className="font-semibold text-white">{(anomaly.confidenceScore * 100).toFixed(1)}%</p>
        </div>
        {anomaly.impactEstimate && (
          <div>
            <p className="text-gray-500">Estimated Impact</p>
            <p className="font-semibold text-red-300">
              {anomaly.impactEstimate.currency} {anomaly.impactEstimate.amount.toLocaleString()}
            </p>
          </div>
        )}
        {anomaly.slaDueDate && (
          <div>
            <p className="text-gray-500">SLA Due Date</p>
            <p className="font-semibold text-orange-300">
              {new Date(anomaly.slaDueDate).toLocaleDateString()}
            </p>
          </div>
        )}
        {anomaly.policyViolations && anomaly.policyViolations.length > 0 && (
          <div>
            <p className="text-gray-500">Policy Violations</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {anomaly.policyViolations.map((policy, idx) => (
                <Tag key={idx} label={policy} variant="danger" />
              ))}
            </div>
          </div>
        )}
        {anomaly.externalReferences && anomaly.externalReferences.length > 0 && (
          <div>
            <p className="text-gray-500">External References</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {anomaly.externalReferences.map((ref, idx) => (
                <a key={idx} href={ref.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-xs">
                  <Tag label={`${ref.system}:${ref.id}`} variant="info" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {anomaly.tags.map((tag, index) => (
          <Tag key={index} label={tag} variant="secondary" />
        ))}
        <Tag label={`Detected by: ${anomaly.detectionMethod}`} variant="info" />
      </div>

      {anomaly.historicalContext && (
        <p className="text-xs text-gray-500 mt-6 italic bg-gray-900/30 p-3 rounded-lg border-l-2 border-gray-600">
          <span className="font-bold text-gray-300 not-italic">Historical Context:</span>{' '}
          {anomaly.historicalContext}
        </p>
      )}
    </Card>
  );
};

const RelatedTransactionsTable: React.FC<{ transactions: RelatedTransaction[] }> = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <p className="text-gray-400 italic">No related transactions found.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Transaction ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Sender/Receiver
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Risk Score
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Blockchain Hash
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-800/70">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-mono">{tx.transactionId}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-green-300 font-bold">
                {tx.amount.toLocaleString()} {tx.currency}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{tx.transactionType}</td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                {new Date(tx.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-sm text-gray-300">
                <p className="truncate w-32">{tx.senderAccount}</p>
                <p className="truncate w-32 text-xs text-gray-500">to {tx.receiverAccount}</p>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <Tag label={tx.status} variant={
                  tx.status === 'Completed' ? 'success' :
                  tx.status === 'Failed' ? 'danger' :
                  tx.status === 'On Hold' ? 'warning' : 'info'
                } />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-red-400 font-semibold">{tx.riskScore}</td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
                {tx.blockhainHash ? `${tx.blockhainHash.substring(0, 8)}...` : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AffectedEntitiesList: React.FC<{ entities: AffectedEntity[] }> = ({ entities }) => {
  if (!entities || entities.length === 0) {
    return <p className="text-gray-400 italic">No affected entities identified.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {entities.map((entity) => (
        <div key={entity.id} className="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-base font-semibold text-white">{entity.name}</h5>
            <Tag label={entity.entityType} variant="primary" />
          </div>
          <p className="text-xs text-gray-400 font-mono mb-2">{entity.entityIdentifier}</p>
          <div className="flex justify-between items-center text-sm text-gray-300">
            <span>Risk: <span className="font-semibold text-red-300">{entity.riskScore}</span></span>
            <span>Anomalies: <span className="font-semibold text-yellow-300">{entity.associatedAnomaliesCount}</span></span>
          </div>
          {entity.country && <p className="text-xs text-gray-500 mt-2">Location: {entity.city}, {entity.country}</p>}
          {entity.digitalIdentityStatus && (
            <p className="text-xs text-gray-500 mt-1">
              Digital Identity: <Tag label={entity.digitalIdentityStatus} variant={
                entity.digitalIdentityStatus === 'Verified' ? 'success' :
                entity.digitalIdentityStatus === 'Revoked' ? 'danger' : 'warning'
              } />
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

interface AIInsightsDisplayProps {
  anomalyId: string;
  recommendations?: AIRecommendation[];
  explainabilityFeatures?: ExplainabilityFeature[];
  applyAIRecommendation: (anomalyId: string, recommendationId: string, actor: string, actorIdentityId: string) => void;
  currentUser: { name: string; identityId: string; role: string };
}

const AIInsightsDisplay: React.FC<AIInsightsDisplayProps> = ({ anomalyId, recommendations, explainabilityFeatures, applyAIRecommendation, currentUser }) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-900/30 rounded-lg border-l-4 border-cyan-600">
        <h4 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-1.25-3M15 10V5a3 3 0 00-3-3l-1-1H5a3 3 0 00-3 3v14a3 3 0 003 3h14a3 3 0 003-3V10a3 3 0 00-3-3h-3.25zM12 7l4 4m-4-4l-4 4m4-4v8" />
          </svg>
          AI Recommendations
        </h4>
        {(recommendations && recommendations.length > 0) ? (
          <ul className="list-disc list-inside space-y-3 text-gray-300 ml-2">
            {recommendations.map((rec) => (
              <li key={rec.id} className="text-sm flex items-center justify-between">
                <div className="flex-grow">
                  <span className="font-semibold text-white">[{rec.type} - {(rec.confidenceScore * 100).toFixed(0)}% Confidence]:</span>{' '}
                  {rec.description}
                  {rec.suggestedAction && <span className="ml-2 px-2 py-0.5 bg-indigo-700/50 rounded-full text-xs">{rec.suggestedAction}</span>}
                  {rec.status && <Tag label={rec.status} variant={rec.status === 'Accepted' || rec.status === 'Completed' ? 'success' : 'secondary'} className="ml-2" />}
                  {rec.agentId && <Tag label={`By Agent: ${rec.agentId}`} variant="info" className="ml-2" />}
                </div>
                {rec.status === 'Pending' && (
                  <Button
                    size="sm"
                    variant={rec.isAutomatedAction ? 'primary' : 'secondary'}
                    onClick={() => applyAIRecommendation(anomalyId, rec.id, currentUser.name, currentUser.identityId)}
                    disabled={rec.requiresApproval && currentUser.role === 'Analyst'} // Example RBAC
                    className="ml-4"
                  >
                    {rec.isAutomatedAction ? 'Trigger Automated Action' : 'Apply Suggestion'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 italic">No specific AI recommendations available for this anomaly.</p>
        )}
      </div>

      <div className="p-4 bg-gray-900/30 rounded-lg border-l-4 border-purple-600">
        <h4 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M12 21v-1m-4.663-3h4.663" />
          </svg>
          Explainable AI Features
        </h4>
        {(explainabilityFeatures && explainabilityFeatures.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {explainabilityFeatures.sort((a, b) => b.contributionScore - a.contributionScore).map((feature, index) => (
              <div key={index} className="bg-gray-800/70 p-3 rounded-lg border border-gray-700">
                <p className="text-sm text-white font-semibold flex items-center justify-between mb-1">
                  {feature.name}: <span className="text-yellow-300">{String(feature.value)}</span>
                </p>
                <p className="text-xs text-gray-400">
                  <span className="font-medium text-purple-200">Contribution:</span> {(feature.contributionScore * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1 italic">{feature.explanation}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">No AI explainability features available.</p>
        )}
      </div>
    </div>
  );
};

const AnomalyAuditLog: React.FC<{ auditLog?: AuditLogEntry[] }> = ({ auditLog }) => {
  if (!auditLog || auditLog.length === 0) {
    return <p className="text-gray-400 italic">No audit log entries for this anomaly.</p>;
  }

  const sortedLog = [...auditLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-4">
      {sortedLog.map((entry) => (
        <div key={entry.id} className="p-3 bg-gray-800/70 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
            <span className="font-semibold text-white">{entry.action}</span>
            <span className="flex items-center gap-2">
              <span className="text-indigo-300">{entry.actor}</span>
              <span className="text-gray-500">({entry.actorIdentityId || 'N/A'})</span>
              <span className="ml-2">{new Date(entry.timestamp).toLocaleString()}</span>
              <span className="ml-2 font-mono text-gray-600 cursor-help" title="Cryptographic Signature for tamper-evidence">{entry.cryptographicSignature?.substring(0, 8)}...</span>
            </span>
          </div>
          <p className="text-sm text-gray-300">{entry.details}</p>
          {(entry.oldValue || entry.newValue) && (
            <p className="text-xs text-gray-500 mt-1">
              {entry.oldValue && `From: ${entry.oldValue} `}
              {entry.newValue && `To: ${entry.newValue}`}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

interface CommentsSectionProps {
  anomalyId: string;
  comments?: AnomalyComment[];
  addAnomalyComment: (anomalyId: string, comment: string, author: string, authorIdentityId: string, isInternal?: boolean) => void;
  currentUser: { name: string; identityId: string; role: string };
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ anomalyId, comments, addAnomalyComment, currentUser }) => {
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(true);

  const handleAddComment = () => {
    if (newComment.trim()) {
      addAnomalyComment(anomalyId, newComment, currentUser.name, currentUser.identityId, isInternalComment);
      setNewComment('');
    }
  };

  const sortedComments = comments ? [...comments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-800/70 rounded-lg">
        <h4 className="text-lg font-bold text-white mb-3">Add New Comment</h4>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your investigation notes or observations here..."
          rows={4}
          className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-white focus:ring-indigo-500 focus:border-indigo-500 mb-3"
        ></textarea>
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm text-gray-300">
            <input
              type="checkbox"
              checked={isInternalComment}
              onChange={(e) => setIsInternalComment(e.target.checked)}
              className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out bg-gray-700 border-gray-600 rounded"
            />
            <span className="ml-2">Internal comment only</span>
          </label>
          <Button onClick={handleAddComment} size="sm" disabled={!newComment.trim()}>
            Add Comment
          </Button>
        </div>
      </div>

      <h4 className="text-lg font-bold text-white mt-6 mb-3">Previous Comments ({sortedComments.length})</h4>
      {sortedComments.length > 0 ? (
        <div className="space-y-3">
          {sortedComments.map((comment) => (
            <div key={comment.id} className="p-3 bg-gray-800/70 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                <span className="font-semibold text-indigo-300">{comment.author}</span>
                <span className="flex items-center gap-2">
                  {comment.isInternal && <Tag label="Internal" variant="secondary" className="bg-gray-600 text-gray-200" />}
                  {new Date(comment.timestamp).toLocaleString()}
                  <span className="ml-2 font-mono text-gray-600 cursor-help" title="Digital Identity of Author">{comment.authorIdentityId?.substring(0, 8)}...</span>
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{comment.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">No comments yet. Be the first to add one!</p>
      )}
    </div>
  );
};

interface EvidenceManagerProps {
  anomalyId: string;
  evidence?: AnomalyEvidence[];
  uploadEvidence: (anomalyId: string, filename: string, fileType: string, uploader: string, uploaderIdentityId: string, description: string, url: string) => void;
  currentUser: { name: string; identityId: string; role: string };
}

const EvidenceManager: React.FC<EvidenceManagerProps> = ({ anomalyId, evidence, uploadEvidence, currentUser }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [newFileType, setNewFileType] = useState('pdf');
  const [newDescription, setNewDescription] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');

  const handleUploadSubmit = () => {
    if (newFilename && newFileUrl) {
      uploadEvidence(anomalyId, newFilename, newFileType, currentUser.name, currentUser.identityId, newDescription, newFileUrl);
      setNewFilename('');
      setNewFileType('pdf');
      setNewDescription('');
      setNewFileUrl('');
      setIsUploadModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-gray-700">
        <h4 className="text-lg font-bold text-white">Evidence Files ({evidence?.length || 0})</h4>
        <Button onClick={() => setIsUploadModalOpen(true)} size="sm">
          Upload Evidence
        </Button>
      </div>

      {(evidence && evidence.length > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidence.map((file) => (
            <div key={file.id} className="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-semibold text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {file.filename}
                </a>
                <Tag label={file.fileType} variant="secondary" className="uppercase" />
              </div>
              <p className="text-xs text-gray-400 mb-2">Uploaded by {file.uploader} on {new Date(file.uploadDate).toLocaleDateString()}</p>
              {file.description && <p className="text-sm text-gray-300 italic">{file.description}</p>}
              {file.integrityHash && <p className="text-xs text-gray-500 mt-1 font-mono">Hash: {file.integrityHash.substring(0, 16)}...</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">No evidence files have been uploaded for this anomaly.</p>
      )}

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload New Evidence">
        <div className="space-y-4">
          <InputField
            label="File Name"
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
            placeholder="e.g., Transaction_Export_Q1.csv"
            id="evidence-filename"
          />
          <FilterSelect
            label="File Type"
            options={[
              { value: 'pdf', label: 'PDF Document' },
              { value: 'csv', label: 'CSV Data' },
              { value: 'txt', label: 'Text File' },
              { value: 'jpg', label: 'Image (JPG)' },
              { value: 'png', label: 'Image (PNG)' },
              { value: 'doc', label: 'Word Document' },
              { value: 'xls', label: 'Excel Spreadsheet' },
              { value: 'pcap', label: 'Network Capture (PCAP)' },
              { value: 'json', label: 'JSON Data' },
              { value: 'zip', label: 'ZIP Archive' },
            ]}
            selectedValue={newFileType}
            onChange={(val) => setNewFileType(val as string)}
            allowClear={false}
          />
          <InputField
            label="File URL (simulated upload)"
            value={newFileUrl}
            onChange={(e) => setNewFileUrl(e.target.value)}
            placeholder="https://your-storage.com/file.pdf"
            id="evidence-fileurl"
          />
          <InputField
            label="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Brief description of the evidence content."
            multiline
            rows={3}
            id="evidence-description"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUploadSubmit} disabled={!newFilename || !newFileUrl}>
            Upload
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export const AnomalyDetailPanel: React.FC<AnomalyDetailPanelProps> = ({
  anomaly,
  onClose,
  updateAnomalyStatus,
  addAnomalyComment,
  updateAnomalyDetails,
  assignAnomaly,
  uploadEvidence,
  applyAIRecommendation,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string | undefined>(anomaly.assignedTo || undefined);
  const [selectedAssigneeIdentityId, setSelectedAssigneeIdentityId] = useState<string | undefined>(anomaly.assignedToIdentityId || undefined);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
  const [resolutionReason, setResolutionReason] = useState<AnomalyResolutionReason | undefined>(undefined);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const availableAssignees = useMemo(() => [
    { value: 'Analyst A', label: 'Analyst A (Fraud)', identityId: 'DID-7890' },
    { value: 'Analyst B', label: 'Analyst B (Compliance)', identityId: 'DID-1234' },
    { value: 'Analyst C', label: 'Analyst C (Ops)', identityId: 'DID-5678' },
    { value: 'Team Lead X', label: 'Team Lead X', identityId: 'DID-9999' },
    { value: 'Agent_Compliance_1', label: 'AI Agent (Compliance)', identityId: 'AID-001' },
  ], []);

  useEffect(() => {
    setSelectedAssignee(anomaly.assignedTo || undefined);
    setSelectedAssigneeIdentityId(anomaly.assignedToIdentityId || undefined);
    setResolutionReason(anomaly.resolutionReason || undefined);
    setResolutionNotes(anomaly.resolutionNotes || '');
  }, [anomaly]);

  const handleAssignAnomaly = () => {
    if (selectedAssignee && selectedAssigneeIdentityId) {
      assignAnomaly(anomaly.id, selectedAssignee, selectedAssigneeIdentityId, currentUser.name, currentUser.identityId);
      setIsAssignModalOpen(false);
    }
  };

  const handleResolveAnomaly = () => {
    if (resolutionReason) {
      updateAnomalyStatus(anomaly.id, 'Resolved', currentUser.name, currentUser.identityId, resolutionReason, resolutionNotes);
      setIsResolveModalOpen(false);
    }
  };

  const handleDismissAnomaly = () => {
    if (resolutionReason) {
      updateAnomalyStatus(anomaly.id, 'Dismissed', currentUser.name, currentUser.identityId, resolutionReason, resolutionNotes);
      setIsDismissModalOpen(false);
    }
  };

  const handleStatusChange = (newStatus: AnomalyWorkflowStatus, reason?: AnomalyResolutionReason, notes?: string) => {
    updateAnomalyStatus(anomaly.id, newStatus, currentUser.name, currentUser.identityId, reason, notes);
  };

  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', content: <AnomalySummaryCard anomaly={anomaly} currentUser={currentUser} /> },
    {
      id: 'transactions',
      label: 'Related Transactions',
      content: (
        <Card className="p-6 bg-gray-800/60 border border-gray-700">
          <h4 className="text-xl font-bold text-white mb-4">Transactions Linked to Anomaly</h4>
          <RelatedTransactionsTable transactions={anomaly.relatedTransactions || []} />
          <p className="text-xs text-gray-500 mt-4">Note: This table shows transactions that were identified by the AI system as potentially related to this anomaly. Further investigation may be required to confirm causality, potentially involving the Programmable Token Rail Layer.</p>
        </Card>
      ),
    },
    {
      id: 'entities',
      label: 'Affected Entities',
      content: (
        <Card className="p-6 bg-gray-800/60 border border-gray-700">
          <h4 className="text-xl font-bold text-white mb-4">Entities Involved</h4>
          <AffectedEntitiesList entities={anomaly.affectedEntities || []} />
          <p className="text-xs text-gray-500 mt-4">Entities are accounts, users, or vendors found to be connected to the anomalous activity. Detailed profiles for these entities can be accessed via Entity Management module, leveraging the Digital Identity and Trust Layer for verification.</p>
        </Card>
      ),
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      content: (
        <Card className="p-6 bg-gray-800/60 border border-gray-700">
          <h4 className="text-xl font-bold text-white mb-4">AI Analysis and Recommendations</h4>
          <AIInsightsDisplay
            anomalyId={anomaly.id}
            recommendations={anomaly.aiRecommendations}
            explainabilityFeatures={anomaly.explainabilityFeatures}
            applyAIRecommendation={applyAIRecommendation}
            currentUser={currentUser}
          />
          <p className="text-xs text-gray-500 mt-4">AI recommendations provide suggested next steps based on learned patterns. Explainable AI features highlight the data points that most influenced the anomaly detection model, crucial for the Agentic Intelligence Layer.</p>
        </Card>
      ),
    },
    {
      id: 'history',
      label: 'Audit Log',
      content: (
        <Card className="p-6 bg-gray-800/60 border border-gray-700">
          <h4 className="text-xl font-bold text-white mb-4">Anomaly Activity History</h4>
          <AnomalyAuditLog auditLog={anomaly.auditLog} />
          <p className="text-xs text-gray-500 mt-4">All actions taken on this anomaly are logged here for compliance and auditing purposes, with cryptographic signatures ensuring tamper-evidence. This forms the backbone of the Governance, Observability, and Integrity system.</p>
        </Card>
      ),
    },
    {
      id: 'comments',
      label: `Comments (${anomaly.comments?.length || 0})`,
      content: (
        <Card className="p-6 bg-gray-800/60 border border-gray-700">
          <CommentsSection anomalyId={anomaly.id} comments={anomaly.comments} addAnomalyComment={addAnomalyComment} currentUser={currentUser} />
          <p className="text-xs text-gray-500 mt-4">Analysts can add internal or external comments here during the investigation process. These comments aid in collaboration and knowledge sharing, leveraging digital identities for attribution.</p>
        </Card>
      ),
    },
    {
      id: 'evidence',
      label: `Evidence (${anomaly.evidence?.length || 0})`,
      content: (
        <Card className="p-6 bg-gray-800/60 border border-gray-700">
          <EvidenceManager anomalyId={anomaly.id} evidence={anomaly.evidence} uploadEvidence={uploadEvidence} currentUser={currentUser} />
          <p className="text-xs text-gray-500 mt-4">Uploaded files (e.g., reports, logs, screenshots) relevant to the anomaly investigation are stored and managed here, with integrity hashes for verifiable authenticity.</p>
        </Card>
      ),
    },
  ], [anomaly, addAnomalyComment, uploadEvidence, currentUser, applyAIRecommendation]);

  const assigneeOptions = useMemo(() => availableAssignees.map(a => ({ value: a.value, label: a.label })), [availableAssignees]);

  return (
    <Modal isOpen={true} onClose={onClose} title={`Anomaly Details: ${anomaly.id.substring(0, 8)}`} size="xl">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3 items-center justify-end border-b border-gray-700 pb-4 mb-4">
          {anomaly.status === 'New' && (
            <>
              <Button onClick={() => setIsAssignModalOpen(true)} variant="secondary">
                Assign
              </Button>
              <Button onClick={() => handleStatusChange('Under Review')} variant="secondary">
                Begin Review
              </Button>
              <Button onClick={() => setIsDismissModalOpen(true)} variant="danger" disabled={currentUser.role === 'Analyst' && anomaly.severity === 'Critical'}>
                Dismiss
              </Button>
            </>
          )}
          {anomaly.status === 'Under Review' && (
            <>
              <Button onClick={() => setIsAssignModalOpen(true)} variant="secondary">
                Reassign
              </Button>
              <Button onClick={() => handleStatusChange('Pending Further Info')} variant="secondary">
                Request More Info
              </Button>
              <Button onClick={() => setIsDismissModalOpen(true)} variant="danger" disabled={currentUser.role === 'Analyst' && anomaly.severity === 'Critical'}>
                Dismiss
              </Button>
              <Button onClick={() => setIsResolveModalOpen(true)} variant="primary">
                Mark Resolved
              </Button>
            </>
          )}
          {(anomaly.status === 'Pending Further Info' || anomaly.status === 'Escalated' || anomaly.status === 'On Hold' || anomaly.status === 'Automated Remediation') && (
            <>
              <Button onClick={() => setIsAssignModalOpen(true)} variant="secondary">
                Reassign
              </Button>
              <Button onClick={() => handleStatusChange('Under Review')} variant="secondary">
                Continue Review
              </Button>
              <Button onClick={() => setIsDismissModalOpen(true)} variant="danger" disabled={currentUser.role === 'Analyst' && anomaly.severity === 'Critical'}>
                Dismiss
              </Button>
              <Button onClick={() => setIsResolveModalOpen(true)} variant="primary">
                Mark Resolved
              </Button>
            </>
          )}
          {(anomaly.status === 'Resolved' || anomaly.status === 'Dismissed' || anomaly.status === 'False Positive') && (
            <span className="text-sm text-gray-400 font-semibold">Anomaly is {anomaly.status}</span>
          )}
        </div>

        <TabPanel tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Anomaly" size="sm">
        <div className="space-y-4">
          <p className="text-gray-300">Select an analyst or intelligent agent to assign this anomaly to.</p>
          <FilterSelect
            label="Assignee"
            options={assigneeOptions}
            selectedValue={selectedAssignee}
            onChange={(val) => {
              setSelectedAssignee(val as string);
              const assigneeObj = availableAssignees.find(a => a.value === val);
              setSelectedAssigneeIdentityId(assigneeObj?.identityId);
            }}
            allowClear={true}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssignAnomaly} disabled={!selectedAssignee || !selectedAssigneeIdentityId}>
            Assign
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Resolve Anomaly" size="md">
        <div className="space-y-4">
          <p className="text-gray-300">Confirm resolution of anomaly: <span className="font-mono text-cyan-300">{anomaly.id.substring(0,8)}</span></p>
          <FilterSelect
            label="Resolution Reason"
            options={[
              { value: 'Confirmed Fraud', label: 'Confirmed Fraud' },
              { value: 'Operational Fix Applied', label: 'Operational Fix Applied' },
              { value: 'Incorrect Data Input', label: 'Incorrect Data Input' },
              { value: 'Legitimate Business Activity', label: 'Legitimate Business Activity' },
              { value: 'Policy Update', label: 'Policy Update' },
              { value: 'Regulatory Reporting Filed', label: 'Regulatory Reporting Filed' },
              { value: 'System Error Correction', label: 'System Error Correction' },
              { value: 'Automated Action Completed', label: 'Automated Action Completed' },
              { value: 'Other', label: 'Other' },
            ]}
            selectedValue={resolutionReason}
            onChange={(val) => setResolutionReason(val as AnomalyResolutionReason)}
          />
          <InputField
            label="Resolution Notes"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            multiline
            rows={4}
            placeholder="Add detailed notes about the resolution, actions taken, and impact. This will be recorded in the immutable audit log."
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsResolveModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleResolveAnomaly} disabled={!resolutionReason} variant="primary">
            Confirm Resolution
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isDismissModalOpen} onClose={() => setIsDismissModalOpen(false)} title="Dismiss Anomaly" size="md">
        <div className="space-y-4">
          <p className="text-gray-300">Are you sure you want to dismiss anomaly: <span className="font-mono text-cyan-300">{anomaly.id.substring(0,8)}</span>?</p>
          <FilterSelect
            label="Dismissal Reason"
            options={[
              { value: 'False Positive', label: 'False Positive' },
              { value: 'Insufficient Evidence', label: 'Insufficient Evidence' },
              { value: 'Duplicate Alert', label: 'Duplicate Alert' },
              { value: 'Investigation Complete - No Action', label: 'Investigation Complete - No Action' },
              { value: 'Policy Update', label: 'Policy Update (No longer an anomaly)' },
              { value: 'Other', label: 'Other' },
            ]}
            selectedValue={resolutionReason}
            onChange={(val) => setResolutionReason(val as AnomalyResolutionReason)}
          />
          <InputField
            label="Dismissal Notes"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            multiline
            rows={4}
            placeholder="Provide detailed reasons for dismissing this anomaly. This will be recorded in the immutable audit log."
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsDismissModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDismissAnomaly} disabled={!resolutionReason} variant="danger">
            Confirm Dismissal
          </Button>
        </div>
      </Modal>
    </Modal>
  );
};

"""
Offers a high-level overview of the anomaly detection system's health and performance.
This dashboard provides real-time key performance indicators and visualizations,
enabling executive-level insights into operational intelligence and risk posture.
"""

export interface DashboardStats {
  totalAnomalies: number;
  newAnomalies: number;
  underReviewAnomalies: number;
  resolvedAnomalies: number;
  criticalAnomalies: number;
  falsePositives: number;
  automatedRemediations: number; // New stat
  avgResolutionTimeHours: number;
  anomaliesLast7Days: number[];
  severityDistribution: { severity: AnomalySeverity; count: number }[];
  categoryDistribution: { category: AnomalyCategory; count: number }[];
  riskPostureIndex: number; // New aggregate risk metric
}

export const calculateDashboardStats = (anomalies: FinancialAnomalyExtended[]): DashboardStats => {
  const totalAnomalies = anomalies.length;
  const newAnomalies = anomalies.filter((a) => a.status === 'New').length;
  const underReviewAnomalies = anomalies.filter((a) => a.status === 'Under Review' || a.status === 'Pending Further Info' || a.status === 'Escalated').length;
  const resolvedAnomalies = anomalies.filter((a) => a.status === 'Resolved').length;
  const criticalAnomalies = anomalies.filter((a) => a.severity === 'Critical').length;
  const falsePositives = anomalies.filter((a) => a.status === 'Dismissed' && a.resolutionReason === 'False Positive').length;
  const automatedRemediations = anomalies.filter((a) => a.status === 'Automated Remediation' || (a.status === 'Resolved' && a.resolutionReason === 'Automated Action Completed')).length;

  const resolvedTimes = anomalies
    .filter((a) => a.status === 'Resolved' && a.timeToResolutionSeconds !== undefined)
    .map((a) => a.timeToResolutionSeconds!);
  const avgResolutionTimeHours =
    resolvedTimes.length > 0 ? resolvedTimes.reduce((sum, time) => sum + time, 0) / resolvedTimes.length / 3600 : 0;

  const now = new Date();
  const last7DaysData: number[] = Array(7).fill(0);
  for (let i = 0; i < 7; i++) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      last7DaysData[6 - i] = anomalies.filter(a => {
          const detectionDate = new Date(a.detectionTimestamp);
          return detectionDate >= dayStart && detectionDate < dayEnd;
      }).length;
  }

  const severityDistribution: { severity: AnomalySeverity; count: number }[] = [
    'Critical', 'High', 'Medium', 'Low', 'Informational'
  ].map(severity => ({
    severity: severity as AnomalySeverity,
    count: anomalies.filter(a => a.severity === severity).length
  }));

  const categoryDistributionMap = anomalies.reduce((acc, anomaly) => {
    acc[anomaly.category] = (acc[anomaly.category] || 0) + 1;
    return acc;
  }, {} as Record<AnomalyCategory, number>);

  const categoryDistribution = Object.entries(categoryDistributionMap).map(([category, count]) => ({
    category: category as AnomalyCategory,
    count,
  }));

  // Simple heuristic for risk posture: average risk score of active/critical anomalies
  const activeAnomalies = anomalies.filter(a => a.status !== 'Resolved' && a.status !== 'Dismissed');
  const riskPostureIndex = activeAnomalies.length > 0
    ? activeAnomalies.reduce((sum, a) => sum + (a.currentRiskRating || a.riskScore), 0) / activeAnomalies.length
    : 0;

  return {
    totalAnomalies,
    newAnomalies,
    underReviewAnomalies,
    resolvedAnomalies,
    criticalAnomalies,
    falsePositives,
    automatedRemediations,
    avgResolutionTimeHours: parseFloat(avgResolutionTimeHours.toFixed(1)),
    anomaliesLast7Days: last7DaysData,
    severityDistribution,
    categoryDistribution,
    riskPostureIndex: parseFloat(riskPostureIndex.toFixed(1)),
  };
};

export interface DashboardOverviewProps {
  stats: DashboardStats;
  onViewAllAnomalies: (status?: AnomalyWorkflowStatus) => void;
  onViewCriticalAnomalies: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  onViewAllAnomalies,
  onViewCriticalAnomalies,
}) => {
  const renderSimpleChart = (data: number[], labels: string[], title: string) => (
    <div className="relative w-full h-full p-4">
      <h5 className="text-md font-semibold text-gray-300 mb-2 text-center">{title}</h5>
      <div className="flex justify-around items-end h-full pt-4">
        {data.map((value, index) => {
          const maxValue = Math.max(...data);
          const height = maxValue > 0 ? (value / maxValue) * 80 + 10 : 0; // Scale height to max 90%, min 10% if > 0
          return (
            <div key={index} className="flex flex-col items-center flex-grow mx-1">
              <span className="text-xs text-white absolute top-0">{value}</span>
              <div
                className="w-4 bg-indigo-500 rounded-t-sm"
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-xs text-gray-400 mt-1">{labels[index]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const severityLabels = stats.severityDistribution.map(d => d.severity);
  const severityCounts = stats.severityDistribution.map(d => d.count);
  const categoryLabels = stats.categoryDistribution.map(d => d.category);
  const categoryCounts = stats.categoryDistribution.map(d => d.count);
  const last7DaysLabels = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Anomalies"
          value={stats.totalAnomalies}
          description="Detected across all systems"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V3m0 9v3m0 3.999V21M19.364 4.636l-1.414 1.414M4.636 19.364l1.414-1.414M20.707 12l-1.414-.707M3.293 12l1.414-.707M10 12H5" /></svg>}
        />
        <StatCard
          title="New Anomalies"
          value={stats.newAnomalies}
          description="Requiring immediate attention"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          change={stats.newAnomalies > 10 ? '+High' : '-Low'} changeType={stats.newAnomalies > 10 ? 'negative' : 'positive'}
        />
        <StatCard
          title="Under Review"
          value={stats.underReviewAnomalies}
          description="Currently being investigated"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
        />
        <StatCard
          title="Avg. Resolution Time"
          value={`${stats.avgResolutionTimeHours} h`}
          description="Mean time to resolve anomalies"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          change={stats.avgResolutionTimeHours > 24 ? '+Slow' : '-Fast'} changeType={stats.avgResolutionTimeHours > 24 ? 'negative' : 'positive'}
        />
        <StatCard
          title="Critical Anomalies"
          value={stats.criticalAnomalies}
          description="High-priority, high-impact risks"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          change={stats.criticalAnomalies > 5 ? '+High' : '-Low'} changeType={stats.criticalAnomalies > 5 ? 'negative' : 'positive'}
        />
        <StatCard
          title="Automated Remediations"
          value={stats.automatedRemediations}
          description="Agent-executed resolutions"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 17h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM12 15v-2m0 0v-2m0 2h2m-2 0H10" /></svg>}
          change={stats.automatedRemediations > 0 ? '+Active' : 'N/A'} changeType={stats.automatedRemediations > 0 ? 'positive' : 'neutral'}
        />
        <StatCard
          title="Risk Posture Index"
          value={stats.riskPostureIndex}
          description="Aggregate risk of active anomalies (0-100)"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          change={stats.riskPostureIndex > 50 ? '+Elevated' : '-Stable'} changeType={stats.riskPostureIndex > 50 ? 'negative' : 'positive'}
        />
        <StatCard
          title="False Positives"
          value={stats.falsePositives}
          description="Accuracy of detection models"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          change={stats.falsePositives > 10 ? '+High' : '-Low'} changeType={stats.falsePositives > 10 ? 'negative' : 'positive'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder
          title="Anomalies Detected Last 7 Days"
          height="h-64"
          description="Trend of newly detected anomalies over the past week, indicating system vigilance."
          className="hover:shadow-lg hover:shadow-indigo-500/20 transition-shadow duration-300"
        >
          {renderSimpleChart(stats.anomaliesLast7Days, last7DaysLabels, 'Daily Anomaly Count')}
        </ChartPlaceholder>
        <ChartPlaceholder
          title="Anomaly Severity Distribution"
          height="h-64"
          description="Breakdown of anomalies by their assigned severity level, highlighting critical risks."
          className="hover:shadow-lg hover:shadow-indigo-500/20 transition-shadow duration-300"
        >
          {renderSimpleChart(severityCounts, severityLabels, 'Severity Distribution')}
        </ChartPlaceholder>
        <ChartPlaceholder
          title="Anomaly Category Distribution"
          height="h-64"
          description="Categorization of anomalies to identify common patterns and systemic vulnerabilities."
          className="hover:shadow-lg hover:shadow-indigo-500/20 transition-shadow duration-300"
        >
          {renderSimpleChart(categoryCounts, categoryLabels, 'Category Distribution')}
        </ChartPlaceholder>
        <ChartPlaceholder
          title="Resolution Status Overview"
          height="h-64"
          description="Percentage of anomalies by their current workflow status, reflecting operational efficiency."
          className="hover:shadow-lg hover:shadow-indigo-500/20 transition-shadow duration-300"
        >
          {renderSimpleChart(
            [stats.resolvedAnomalies, stats.underReviewAnomalies, stats.newAnomalies, stats.dismissedAnomalies],
            ['Resolved', 'Under Review', 'New', 'Dismissed'],
            'Workflow Status'
          )}
        </ChartPlaceholder>
      </div>

      <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 flex justify-center items-center gap-4 flex-wrap">
        <h3 className="text-xl font-bold text-white flex-grow text-center lg:text-left">Strategic Actions</h3>
        <Button onClick={() => onViewAllAnomalies()} variant="secondary">
          View All Anomalies ({stats.totalAnomalies})
        </Button>
        <Button onClick={() => onViewAllAnomalies('New')} variant="primary">
          Review New Alerts ({stats.newAnomalies})
        </Button>
        <Button onClick={onViewCriticalAnomalies} variant="danger">
          Investigate Criticals ({stats.criticalAnomalies})
        </Button>
        <Button onClick={() => onViewAllAnomalies('Automated Remediation')} variant="info">
          Automated Remediation Logs ({stats.automatedRemediations})
        </Button>
      </div>
    </div>
  );
};

"""
Serves as the central orchestrator for the AI-powered anomaly detection and management system.
It integrates real-time data, intelligent automation, and comprehensive visualization tools
to provide a unified platform for risk mitigation and operational integrity across the financial ecosystem.
"""

export interface FilterOptions {
  status?: AnomalyWorkflowStatus;
  severity?: AnomalySeverity;
  category?: AnomalyCategory;
  assignedTo?: string;
  searchTerm?: string;
}

export interface SortOptions {
  field: keyof FinancialAnomalyExtended | '';
  direction: 'asc' | 'desc';
}

const AnomalyDetectionView: React.FC = () => {
  const { financialAnomalies, updateAnomalyStatus, addAnomalyComment, updateAnomalyDetails, assignAnomaly, dismissAnomalies, resolveAnomalies, uploadEvidence, applyAIRecommendation, notifications, dismissNotification } = useMockDataContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOptions>({ field: 'detectionTimestamp', direction: 'desc' });
  const [selectedAnomaly, setSelectedAnomaly] = useState<FinancialAnomalyExtended | null>(null);
  const [selectedAnomalyIds, setSelectedAnomalyIds] = useState<string[]>([]);
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'resolve' | 'dismiss' | 'assign' | null>(null);
  const [bulkActionReason, setBulkActionReason] = useState<AnomalyResolutionReason | undefined>(undefined);
  const [bulkActionNotes, setBulkActionNotes] = useState('');
  const [bulkActionAssignee, setBulkActionAssignee] = useState<string | undefined>(undefined);
  const [bulkActionAssigneeIdentityId, setBulkActionAssigneeIdentityId] = useState<string | undefined>(undefined);
  const [activeView, setActiveView] = useState<'dashboard' | 'anomalies'>('dashboard');

  const currentUser = useMemo(() => ({ name: 'Analyst Alpha', identityId: 'USER-001', role: 'Team Lead' as 'Analyst' | 'Admin' | 'Team Lead' }), []);

  const filteredAndSortedAnomalies = useMemo(() => {
    let result = [...financialAnomalies];

    if (filters.status) {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters.severity) {
      result = result.filter((a) => a.severity === filters.severity);
    }
    if (filters.category) {
      result = result.filter((a) => a.category === filters.category);
    }
    if (filters.assignedTo) {
      result = result.filter((a) => a.assignedTo === filters.assignedTo);
    }
    if (filters.searchTerm) {
      const lowerCaseSearchTerm = filters.searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          a.entityDescription.toLowerCase().includes(lowerCaseSearchTerm) ||
          a.id.toLowerCase().includes(lowerCaseSearchTerm),
      );
    }

    if (sort.field) {
      result.sort((a, b) => {
        const aValue = a[sort.field as keyof FinancialAnomalyExtended];
        const bValue = b[sort.field as keyof FinancialAnomalyExtended];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    return result;
  }, [financialAnomalies, filters, sort]);

  const totalPages = Math.ceil(filteredAndSortedAnomalies.length / itemsPerPage);
  const paginatedAnomalies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedAnomalies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedAnomalies, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const handleFilterChange = useCallback((key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((field: keyof FinancialAnomalyExtended) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleSelectAnomaly = useCallback((anomaly: FinancialAnomalyExtended) => {
    setSelectedAnomaly(anomaly);
  }, []);

  const handleCloseDetailPanel = useCallback(() => {
    setSelectedAnomaly(null);
  }, []);

  const handleToggleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedAnomalyIds(paginatedAnomalies.map((a) => a.id));
    } else {
      setSelectedAnomalyIds([]);
    }
  }, [paginatedAnomalies]);

  const handleToggleSelectAnomaly = useCallback((anomalyId: string) => {
    setSelectedAnomalyIds((prev) =>
      prev.includes(anomalyId) ? prev.filter((id) => id !== anomalyId) : [...prev, anomalyId],
    );
  }, []);

  const handleOpenBulkActionModal = useCallback((type: 'resolve' | 'dismiss' | 'assign') => {
    if (selectedAnomalyIds.length === 0) return;
    setBulkActionType(type);
    setBulkActionReason(undefined);
    setBulkActionNotes('');
    setBulkActionAssignee(undefined);
    setBulkActionAssigneeIdentityId(undefined);
    setIsBulkActionModalOpen(true);
  }, [selectedAnomalyIds]);

  const handlePerformBulkAction = useCallback(() => {
    if (bulkActionType === 'resolve' && bulkActionReason) {
      resolveAnomalies(selectedAnomalyIds, bulkActionReason, bulkActionNotes, currentUser.name, currentUser.identityId);
    } else if (bulkActionType === 'dismiss' && bulkActionReason) {
      dismissAnomalies(selectedAnomalyIds, bulkActionReason, bulkActionNotes, currentUser.name, currentUser.identityId);
    } else if (bulkActionType === 'assign' && bulkActionAssignee && bulkActionAssigneeIdentityId) {
      selectedAnomalyIds.forEach(id => assignAnomaly(id, bulkActionAssignee, bulkActionAssigneeIdentityId, currentUser.name, currentUser.identityId));
    } else {
      console.error('Invalid bulk action or missing required fields');
      return;
    }
    setIsBulkActionModalOpen(false);
    setSelectedAnomalyIds([]);
  }, [bulkActionType, bulkActionReason, bulkActionNotes, bulkActionAssignee, bulkActionAssigneeIdentityId, selectedAnomalyIds, resolveAnomalies, dismissAnomalies, assignAnomaly, currentUser]);

  const dashboardStats = useMemo(() => calculateDashboardStats(financialAnomalies), [financialAnomalies]);
  const handleViewAllAnomaliesFromDashboard = useCallback((status?: AnomalyWorkflowStatus) => {
    setFilters(status ? { status } : {});
    setActiveView('anomalies');
    setCurrentPage(1);
  }, []);

  const handleViewCriticalAnomalies = useCallback(() => {
    setFilters({ severity: 'Critical' });
    setActiveView('anomalies');
    setCurrentPage(1);
  }, []);

  const anomalyStatusOptions = useMemo(() => ([
    { value: 'New', label: 'New' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Pending Further Info', label: 'Pending Further Info' },
    { value: 'Escalated', label: 'Escalated' },
    { value: 'False Positive', label: 'False Positive' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Dismissed', label: 'Dismissed' },
    { value: 'Archived', label: 'Archived' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Automated Remediation', label: 'Automated Remediation' },
  ]), []);
  const anomalySeverityOptions = useMemo(() => ([
    { value: 'Critical', label: 'Critical' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
    { value: 'Informational', label: 'Informational' },
  ]), []);
  const anomalyCategoryOptions = useMemo(() => Object.values(AnomalyCategory).map(c => ({ value: c, label: c })), []);
  const availableAssignees = useMemo(() => [
    { value: 'Analyst A', label: 'Analyst A (Fraud)', identityId: 'DID-7890' },
    { value: 'Analyst B', label: 'Analyst B (Compliance)', identityId: 'DID-1234' },
    { value: 'Analyst C', label: 'Analyst C (Ops)', identityId: 'DID-5678' },
    { value: 'Team Lead X', label: 'Team Lead X', identityId: 'DID-9999' },
    { value: 'Agent_Compliance_1', label: 'AI Agent (Compliance)', identityId: 'AID-001' },
  ], []);

  const SeverityIndicator: React.FC<{ severity: AnomalySeverity }> = ({ severity }) => {
    const colors = {
      Critical: 'border-red-500',
      High: 'border-orange-500',
      Medium: 'border-yellow-500',
      Low: 'border-blue-500',
      Informational: 'border-green-500',
    };
    const textColors = {
      Critical: 'text-red-300',
      High: 'text-orange-300',
      Medium: 'text-yellow-300',
      Low: 'text-blue-300',
      Informational: 'text-green-300',
    };
    return (
      <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-900/50 border ${colors[severity]} ${textColors[severity]}`}>
        <div className={`w-2 h-2 rounded-full ${colors[severity].replace('border-', 'bg-')}`}></div>
        {severity}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white tracking-wider">AI-Powered Anomaly Detection</h2>
        <div className="flex gap-3">
          <Button
            onClick={() => setActiveView('dashboard')}
            variant={activeView === 'dashboard' ? 'primary' : 'secondary'}
            size="sm"
          >
            Dashboard
          </Button>
          <Button
            onClick={() => setActiveView('anomalies')}
            variant={activeView === 'anomalies' ? 'primary' : 'secondary'}
            size="sm"
          >
            Anomalies List
          </Button>
        </div>
      </div>

      {activeView === 'dashboard' && (
        <DashboardOverview
          stats={dashboardStats}
          onViewAllAnomalies={handleViewAllAnomaliesFromDashboard}
          onViewCriticalAnomalies={handleViewCriticalAnomalies}
        />
      )}

      {activeView === 'anomalies' && (
        <>
          <Card className="p-6 bg-gray-800/60 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Filter & Search Anomalies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField
                label="Search by ID/Description"
                value={filters.searchTerm || ''}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Search..."
              />
              <FilterSelect
                label="Status"
                options={anomalyStatusOptions}
                selectedValue={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
              />
              <FilterSelect
                label="Severity"
                options={anomalySeverityOptions}
                selectedValue={filters.severity}
                onChange={(value) => handleFilterChange('severity', value)}
              />
              <FilterSelect
                label="Category"
                options={anomalyCategoryOptions}
                selectedValue={filters.category}
                onChange={(value) => handleFilterChange('category', value)}
              />
              <FilterSelect
                label="Assigned To"
                options={availableAssignees.map(a => ({ value: a.value, label: a.label }))}
                selectedValue={filters.assignedTo}
                onChange={(value) => handleFilterChange('assignedTo', value)}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setFilters({})} variant="ghost" size="sm">
                Clear Filters
              </Button>
            </div>
          </Card>

          {selectedAnomalyIds.length > 0 && (
            <div className="sticky bottom-0 z-40 bg-gray-900/90 backdrop-blur-sm p-4 rounded-t-lg shadow-xl border-t border-gray-700 flex flex-wrap gap-3 items-center justify-between">
              <span className="text-sm text-white font-semibold">
                {selectedAnomalyIds.length} anomalies selected
              </span>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => handleOpenBulkActionModal('assign')} disabled={selectedAnomalyIds.length === 0}>
                  Assign Selected
                </Button>
                <Button variant="danger" onClick={() => handleOpenBulkActionModal('dismiss')} disabled={selectedAnomalyIds.length === 0 || (currentUser.role === 'Analyst' && selectedAnomalyIds.some(id => financialAnomalies.find(a => a.id === id)?.severity === 'Critical'))}>
                  Dismiss Selected
                </Button>
                <Button variant="primary" onClick={() => handleOpenBulkActionModal('resolve')} disabled={selectedAnomalyIds.length === 0}>
                  Resolve Selected
                </Button>
                <Button variant="ghost" onClick={() => setSelectedAnomalyIds([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          <Card>
            <div className="min-h-[500px]">
              {paginatedAnomalies.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-xl font-semibold">No Anomalies Found</p>
                  <p className="text-sm">Try adjusting your filters or search terms.</p>
                </div>
              )}
              {paginatedAnomalies.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 bg-gray-900/60 rounded-lg">
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                      <input
                        type="checkbox"
                        checked={selectedAnomalyIds.length === paginatedAnomalies.length && paginatedAnomalies.length > 0}
                        onChange={(e) => handleToggleSelectAll(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded"
                      />
                      Select All ({selectedAnomalyIds.length})
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Sort by:</span>
                      <FilterSelect
                        label=""
                        options={[
                          { value: 'detectionTimestamp', label: 'Date Detected' },
                          { value: 'riskScore', label: 'Risk Score' },
                          { value: 'severity', label: 'Severity' },
                          { value: 'status', label: 'Status' },
                        ]}
                        selectedValue={sort.field === '' ? 'detectionTimestamp' : sort.field}
                        onChange={(val) => handleSortChange(val as keyof FinancialAnomalyExtended)}
                        allowClear={false}
                      />
                      <Button onClick={() => setSort(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))} variant="ghost" size="sm" className="p-1">
                        {sort.direction === 'asc' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4 4m0 0l4-4m-4 4V4" /></svg>
                        )}
                      </Button>
                    </div>
                  </div>

                  {paginatedAnomalies.map((anomaly) => (
                    <div
                      key={anomaly.id}
                      className={`p-4 bg-gray-800/50 rounded-lg border-l-4 ${
                        anomaly.status === 'New' ? 'border-yellow-500' :
                        anomaly.status === 'Under Review' ? 'border-indigo-500' :
                        anomaly.status === 'Resolved' ? 'border-green-500' :
                        anomaly.status === 'Dismissed' ? 'border-gray-500' :
                        anomaly.status === 'Automated Remediation' ? 'border-blue-500' : 'border-gray-600'
                      } ${selectedAnomalyIds.includes(anomaly.id) ? 'ring-2 ring-indigo-500' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={selectedAnomalyIds.includes(anomaly.id)}
                            onChange={() => handleToggleSelectAnomaly(anomaly.id)}
                            className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                              <SeverityIndicator severity={anomaly.severity} />
                              <h4 className="font-semibold text-white mt-2 text-lg">
                                {anomaly.description}
                                <span className="ml-2 text-xs text-gray-500 font-mono">ID: {anomaly.id.substring(0, 8)}</span>
                              </h4>
                              <p className="text-xs text-gray-400 font-mono mt-1">
                                {anomaly.entityDescription} - {new Date(anomaly.detectionTimestamp).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Last Updated: {new Date(anomaly.lastUpdatedTimestamp).toLocaleString()}</p>
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0">
                              <p className="text-xs text-gray-400">Risk Score</p>
                              <p className="text-3xl font-bold text-red-400">{anomaly.riskScore}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mt-3 italic bg-gray-900/30 p-3 rounded-lg">
                            <span className="font-bold text-cyan-300 not-italic">AI Analysis:</span> "{anomaly.details}"
                          </p>
                          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                              <p className="text-sm text-gray-400">Status: <span className="font-semibold text-cyan-300">{anomaly.status}</span></p>
                              {anomaly.assignedTo && <p className="text-sm text-gray-400">Assigned: <span className="font-semibold text-indigo-300">{anomaly.assignedTo}</span></p>}
                              {anomaly.slaDueDate && new Date(anomaly.slaDueDate) < new Date() && anomaly.status !== 'Resolved' && anomaly.status !== 'Dismissed' && (
                                <p className="text-sm text-red-400 font-semibold flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  SLA Breach!
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {anomaly.status === 'New' && (
                                <>
                                  <Button onClick={() => updateAnomalyStatus(anomaly.id, 'Under Review', currentUser.name, currentUser.identityId)} size="sm" variant="secondary">Begin Review</Button>
                                  <Button onClick={() => handleOpenBulkActionModal('dismiss')} size="sm" variant="danger" disabled={currentUser.role === 'Analyst' && anomaly.severity === 'Critical'}>Dismiss</Button>
                                </>
                              )}
                              {anomaly.status === 'Under Review' && (
                                <>
                                  <Button onClick={() => updateAnomalyStatus(anomaly.id, 'Resolved', currentUser.name, currentUser.identityId)} size="sm" variant="primary">Mark Resolved</Button>
                                  <Button onClick={() => handleOpenBulkActionModal('dismiss')} size="sm" variant="danger" disabled={currentUser.role === 'Analyst' && anomaly.severity === 'Critical'}>Dismiss</Button>
                                </>
                              )}
                              {(anomaly.status === 'Pending Further Info' || anomaly.status === 'Escalated' || anomaly.status === 'On Hold' || anomaly.status === 'Automated Remediation') && (
                                <>
                                  <Button onClick={() => updateAnomalyStatus(anomaly.id, 'Under Review', currentUser.name, currentUser.identityId)} size="sm" variant="secondary">Continue Review</Button>
                                  <Button onClick={() => updateAnomalyStatus(anomaly.id, 'Resolved', currentUser.name, currentUser.identityId)} size="sm" variant="primary">Mark Resolved</Button>
                                </>
                              )}
                              <Button onClick={() => handleSelectAnomaly(anomaly)} size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 border border-indigo-500/30">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {paginatedAnomalies.length > 0 && (
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={filteredAndSortedAnomalies.length}
              />
            )}
          </Card>
        </>
      )}

      {selectedAnomaly && (
        <AnomalyDetailPanel
          anomaly={selectedAnomaly}
          onClose={handleCloseDetailPanel}
          updateAnomalyStatus={updateAnomalyStatus}
          addAnomalyComment={addAnomalyComment}
          updateAnomalyDetails={updateAnomalyDetails}
          assignAnomaly={assignAnomaly}
          uploadEvidence={uploadEvidence}
          applyAIRecommendation={applyAIRecommendation}
          currentUser={currentUser}
        />
      )}

      <Modal isOpen={isBulkActionModalOpen} onClose={() => setIsBulkActionModalOpen(false)} title={`Bulk ${bulkActionType ? bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1) : ''} Anomalies`} size="md">
        <div className="space-y-4">
          <p className="text-gray-300 mb-4">
            You are about to perform a bulk action on <span className="font-semibold text-indigo-300">{selectedAnomalyIds.length}</span> selected anomalies.
            Please confirm the details.
          </p>

          {bulkActionType === 'assign' && (
            <FilterSelect
              label="Assign to"
              options={availableAssignees.map(a => ({ value: a.value, label: a.label }))}
              selectedValue={bulkActionAssignee}
              onChange={(val) => {
                setBulkActionAssignee(val as string);
                const assigneeObj = availableAssignees.find(a => a.value === val);
                setBulkActionAssigneeIdentityId(assigneeObj?.identityId);
              }}
              allowClear={false}
            />
          )}

          {(bulkActionType === 'resolve' || bulkActionType === 'dismiss') && (
            <>
              <FilterSelect
                label={`${bulkActionType === 'resolve' ? 'Resolution' : 'Dismissal'} Reason`}
                options={
                  bulkActionType === 'resolve'
                    ? [
                        { value: 'Confirmed Fraud', label: 'Confirmed Fraud' },
                        { value: 'Operational Fix Applied', label: 'Operational Fix Applied' },
                        { value: 'Incorrect Data Input', label: 'Incorrect Data Input' },
                        { value: 'Legitimate Business Activity', label: 'Legitimate Business Activity' },
                        { value: 'Policy Update', label: 'Policy Update' },
                        { value: 'Regulatory Reporting Filed', label: 'Regulatory Reporting Filed' },
                        { value: 'System Error Correction', label: 'System Error Correction' },
                        { value: 'Automated Action Completed', label: 'Automated Action Completed' },
                        { value: 'Other', label: 'Other' },
                      ]
                    : [
                        { value: 'False Positive', label: 'False Positive' },
                        { value: 'Insufficient Evidence', label: 'Insufficient Evidence' },
                        { value: 'Duplicate Alert', label: 'Duplicate Alert' },
                        { value: 'Investigation Complete - No Action', label: 'Investigation Complete - No Action' },
                        { value: 'Policy Update', label: 'Policy Update (No longer an anomaly)' },
                        { value: 'Other', label: 'Other' },
                      ]
                }
                selectedValue={bulkActionReason}
                onChange={(val) => setBulkActionReason(val as AnomalyResolutionReason)}
              />
              <InputField
                label={`${bulkActionType === 'resolve' ? 'Resolution' : 'Dismissal'} Notes`}
                value={bulkActionNotes}
                onChange={(e) => setBulkActionNotes(e.target.value)}
                multiline
                rows={4}
                placeholder={`Add detailed notes for this bulk ${bulkActionType}. This will be recorded in the immutable audit log.`}
              />
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsBulkActionModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePerformBulkAction}
            disabled={
              (bulkActionType === 'assign' && (!bulkActionAssignee || !bulkActionAssigneeIdentityId)) ||
              ((bulkActionType === 'resolve' || bulkActionType === 'dismiss') && !bulkActionReason)
            }
            variant={bulkActionType === 'dismiss' ? 'danger' : 'primary'}
          >
            Confirm {bulkActionType === 'resolve' ? 'Resolution' : bulkActionType === 'dismiss' ? 'Dismissal' : 'Assignment'}
          </Button>
        </div>
      </Modal>

      <NotificationContainer notifications={notifications} onDismissNotification={dismissNotification} />
    </div>
  );
}

export default AnomalyDetectionView;