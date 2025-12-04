import React, { useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { FinancialAnomaly, AnomalyStatus } from '../../../types';
import { GoogleGenAI } from '@google/genai'; // Keep existing import

// =====================================================================================================================
// EXTENDED TYPE DEFINITIONS FOR REAL-WORLD APPLICATION
// These types represent a more comprehensive anomaly detection system with deeper investigation capabilities.
// =====================================================================================================================

/**
 * @typedef AnomalySeverity
 * @description Defines the potential severity levels for an anomaly.
 */
type AnomalySeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

/**
 * @typedef AnomalyCategory
 * @description Broad categorization for types of financial anomalies.
 */
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

/**
 * @typedef AnomalyWorkflowStatus
 * @description Extended statuses reflecting a full investigation lifecycle.
 */
export type AnomalyWorkflowStatus =
  | 'New'
  | 'Under Review'
  | 'Pending Further Info'
  | 'Escalated'
  | 'False Positive'
  | 'Resolved'
  | 'Dismissed'
  | 'Archived'
  | 'On Hold';

/**
 * @typedef AnomalyResolutionReason
 * @description Reasons for resolving or dismissing an anomaly.
 */
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
  | 'Other';

/**
 * @interface RelatedTransaction
 * @description Represents a transaction linked to a financial anomaly.
 */
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
  status: 'Completed' | 'Pending' | 'Failed';
  riskScore: number;
  tags?: string[];
}

/**
 * @interface AffectedEntity
 * @description Describes an entity (e.g., account, user, vendor) affected by or involved in an anomaly.
 */
export interface AffectedEntity {
  id: string;
  entityType: 'Account' | 'User' | 'Vendor' | 'Customer' | 'System' | 'Other';
  entityIdentifier: string;
  name: string;
  riskScore: number;
  associatedAnomaliesCount: number;
  country?: string;
  city?: string;
  accountStatus?: 'Active' | 'Suspended' | 'Closed';
  lastActivity?: string;
}

/**
 * @interface AuditLogEntry
 * @description Records actions taken on an anomaly for compliance and traceability.
 */
export interface AuditLogEntry {
  id: string;
  anomalyId: string;
  timestamp: string;
  action: string; // e.g., 'Status Changed', 'Comment Added', 'Assigned To', 'Evidence Uploaded'
  actor: string; // User ID or system process
  details: string;
  oldValue?: string;
  newValue?: string;
}

/**
 * @interface AnomalyComment
 * @description Represents a comment or note added by an analyst during investigation.
 */
export interface AnomalyComment {
  id: string;
  anomalyId: string;
  timestamp: string;
  author: string; // User ID
  comment: string;
  attachments?: string[]; // Array of attachment IDs/URLs
  isInternal?: boolean; // For internal team comments vs. shared with external parties
}

/**
 * @interface AnomalyEvidence
 * @description Details about evidence collected for an anomaly.
 */
export interface AnomalyEvidence {
  id: string;
  anomalyId: string;
  filename: string;
  fileType: string; // e.g., 'pdf', 'csv', 'jpg'
  uploadDate: string;
  uploader: string; // User ID
  description?: string;
  url: string; // URL to access the evidence file
  tags?: string[];
}

/**
 * @interface AIRecommendation
 * @description AI-generated recommendations for anomaly remediation or further investigation.
 */
export interface AIRecommendation {
  id: string;
  type: 'InvestigationStep' | 'RemediationAction' | 'PolicyReview' | 'AlertTuning';
  description: string;
  confidenceScore: number; // 0-1
  suggestedAction?: string;
  isAutomatedAction?: boolean; // Whether the system can automatically perform this
  status?: 'Pending' | 'Accepted' | 'Rejected';
  timestamp?: string;
}

/**
 * @interface ExplainabilityFeature
 * @description Details about features that contributed to the AI's anomaly detection.
 */
export interface ExplainabilityFeature {
  name: string;
  value: string | number | boolean;
  contributionScore: number; // How much this feature influenced the anomaly score
  explanation: string;
}

/**
 * @interface GeoLocation
 * @description Geographic location data related to an anomaly or entity.
 */
export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

/**
 * @interface FinancialAnomalyExtended
 * @description An extended version of the FinancialAnomaly type with more details for a real-world system.
 */
export interface FinancialAnomalyExtended extends FinancialAnomaly {
  category: AnomalyCategory;
  assignedTo?: string; // User ID of the analyst assigned
  status: AnomalyWorkflowStatus; // Overrides base AnomalyStatus with more detailed workflow statuses
  resolutionReason?: AnomalyResolutionReason;
  resolutionNotes?: string;
  detectionMethod: 'Rule-Based' | 'ML Model' | 'Heuristic' | 'Manual';
  tags: string[];
  impactEstimate?: { amount: number; currency: string; description: string };
  confidenceScore: number; // AI model confidence in the anomaly
  historicalContext?: string; // Short summary of similar past anomalies
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
  slaDueDate?: string; // Service Level Agreement due date for resolution
  timeToResolutionSeconds?: number; // Actual time taken to resolve
}

// =====================================================================================================================
// MOCK DATA GENERATION UTILITIES
// These utilities help simulate a large amount of realistic data for testing and demonstration purposes.
// =====================================================================================================================

/**
 * @function generateUUID
 * @description Generates a simple UUID-like string.
 * @returns {string} A unique identifier.
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * @function getRandomInt
 * @description Returns a random integer between min (inclusive) and max (inclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer.
 */
const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * @function getRandomElement
 * @description Returns a random element from an array.
 * @template T
 * @param {T[]} arr - The array to pick from.
 * @returns {T} A random element from the array.
 */
const getRandomElement = <T>(arr: T[]): T => arr[getRandomInt(0, arr.length - 1)];

/**
 * @function generateRandomDate
 * @description Generates a random date string within the last 30 days.
 * @returns {string} A date string in ISO format.
 */
const generateRandomDate = (): string => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
  return new Date(randomTime).toISOString();
};

/**
 * @function generateMockRelatedTransaction
 * @description Generates a single mock related transaction.
 * @param {string} anomalyId - The ID of the anomaly this transaction is related to.
 * @returns {RelatedTransaction} A mock RelatedTransaction object.
 */
const generateMockRelatedTransaction = (anomalyId: string): RelatedTransaction => ({
  id: generateUUID(),
  transactionId: `TXN-${getRandomInt(100000, 999999)}`,
  amount: parseFloat((Math.random() * 10000 + 10).toFixed(2)),
  currency: getRandomElement(['USD', 'EUR', 'GBP', 'JPY']),
  timestamp: generateRandomDate(),
  senderAccount: `ACC-${getRandomInt(100000, 999999)}`,
  receiverAccount: `ACC-${getRandomInt(100000, 999999)}`,
  transactionType: getRandomElement(['Deposit', 'Withdrawal', 'Transfer', 'Payment', 'Refund']),
  description: getRandomElement([
    'International Funds Transfer',
    'High-Value Payment',
    'Multiple Small Transactions',
    'Unusual Account Activity',
    'Cryptocurrency Purchase',
  ]),
  status: getRandomElement(['Completed', 'Pending', 'Failed']),
  riskScore: getRandomInt(1, 100),
  tags: getRandomElement([['international'], ['suspicious'], ['high-value'], ['crypto', 'new-recipient'], []]),
});

/**
 * @function generateMockAffectedEntity
 * @description Generates a single mock affected entity.
 * @returns {AffectedEntity} A mock AffectedEntity object.
 */
const generateMockAffectedEntity = (): AffectedEntity => ({
  id: generateUUID(),
  entityType: getRandomElement(['Account', 'User', 'Vendor', 'Customer']),
  entityIdentifier: `ENT-${getRandomInt(1000, 9999)}`,
  name: getRandomElement(['Global Corp Ltd.', 'John Doe', 'Acme Solutions', 'Jane Smith', 'Widget Co.']),
  riskScore: getRandomInt(1, 100),
  associatedAnomaliesCount: getRandomInt(1, 15),
  country: getRandomElement(['USA', 'UK', 'Germany', 'Canada', 'Australia', 'Japan', 'India', 'Brazil']),
  city: getRandomElement(['New York', 'London', 'Berlin', 'Toronto', 'Sydney', 'Tokyo', 'Mumbai', 'São Paulo']),
  accountStatus: getRandomElement(['Active', 'Suspended']),
  lastActivity: generateRandomDate(),
});

/**
 * @function generateMockAuditLogEntry
 * @description Generates a single mock audit log entry.
 * @param {string} anomalyId - The ID of the anomaly.
 * @param {string} actor - The actor performing the action.
 * @returns {AuditLogEntry} A mock AuditLogEntry object.
 */
const generateMockAuditLogEntry = (anomalyId: string, actor: string): AuditLogEntry => ({
  id: generateUUID(),
  anomalyId,
  timestamp: generateRandomDate(),
  action: getRandomElement(['Status Changed', 'Comment Added', 'Assigned To', 'Evidence Uploaded', 'Severity Updated']),
  actor,
  details: getRandomElement([
    'Changed status from New to Under Review.',
    'Added a note regarding initial assessment.',
    'Assigned anomaly to Analyst A.',
    'Uploaded transaction history.',
    'Severity increased due to new information.',
  ]),
});

/**
 * @function generateMockAnomalyComment
 * @description Generates a single mock anomaly comment.
 * @param {string} anomalyId - The ID of the anomaly.
 * @param {string} author - The author of the comment.
 * @returns {AnomalyComment} A mock AnomalyComment object.
 */
const generateMockAnomalyComment = (anomalyId: string, author: string): AnomalyComment => ({
  id: generateUUID(),
  anomalyId,
  timestamp: generateRandomDate(),
  author,
  comment: getRandomElement([
    'Initial assessment indicates potential market manipulation. Investigating further.',
    'Need to gather more information on related entities.',
    'Contacting the affected customer for clarification.',
    'Looks like a false positive due to recent system upgrade. Confirming with ops.',
    'Escalating to Legal department for review.',
  ]),
  isInternal: Math.random() > 0.3,
});

/**
 * @function generateMockAnomalyEvidence
 * @description Generates a single mock anomaly evidence.
 * @param {string} anomalyId - The ID of the anomaly.
 * @param {string} uploader - The uploader of the evidence.
 * @returns {AnomalyEvidence} A mock AnomalyEvidence object.
 */
const generateMockAnomalyEvidence = (anomalyId: string, uploader: string): AnomalyEvidence => ({
  id: generateUUID(),
  anomalyId,
  filename: getRandomElement(['transaction_report.pdf', 'user_activity_log.csv', 'email_correspondence.txt', 'network_traffic.pcap']),
  fileType: getRandomElement(['pdf', 'csv', 'txt', 'pcap']),
  uploadDate: generateRandomDate(),
  uploader,
  description: getRandomElement([
    'Transaction details for period.',
    'User login attempts.',
    'Communication regarding the suspicious activity.',
    'Network forensics data.',
    '',
  ]),
  url: `https://example.com/evidence/${generateUUID()}`,
  tags: getRandomElement([['financial'], ['logs'], ['communication'], ['forensics'], []]),
});

/**
 * @function generateMockAIRecommendation
 * @description Generates a single mock AI recommendation.
 * @returns {AIRecommendation} A mock AIRecommendation object.
 */
const generateMockAIRecommendation = (): AIRecommendation => ({
  id: generateUUID(),
  type: getRandomElement(['InvestigationStep', 'RemediationAction', 'PolicyReview', 'AlertTuning']),
  description: getRandomElement([
    'Review all transactions for this entity from the last 90 days.',
    'Temporarily suspend account until verification is complete.',
    'Evaluate current fraud detection rules for similar patterns.',
    'Adjust anomaly detection threshold for low-value international transfers.',
    'Initiate KYC review for associated accounts.',
  ]),
  confidenceScore: parseFloat(Math.random().toFixed(2)),
  suggestedAction: getRandomElement(['Flag Account', 'Block Transaction', 'Request Documentation', 'Update Rule', 'Review Policy']),
  isAutomatedAction: Math.random() > 0.7,
  status: getRandomElement(['Pending', 'Accepted', 'Rejected']),
  timestamp: generateRandomDate(),
});

/**
 * @function generateMockExplainabilityFeature
 * @description Generates a single mock explainability feature.
 * @returns {ExplainabilityFeature} A mock ExplainabilityFeature object.
 */
const generateMockExplainabilityFeature = (): ExplainabilityFeature => ({
  name: getRandomElement([
    'Transaction Volume (Daily)',
    'Sender Account Age',
    'Recipient Country',
    'Time of Day',
    'Number of High-Value Transactions',
    'Previous Anomaly History (Sender)',
    'IP Address Geo-Mismatch',
  ]),
  value: getRandomElement([
    getRandomInt(1, 1000).toString(),
    getRandomInt(1, 365).toString(),
    getRandomElement(['USA', 'Russia', 'China', 'Nigeria']),
    `${getRandomInt(0, 23)}:00`,
    getRandomInt(0, 5).toString(),
    Math.random() > 0.5,
    Math.random() > 0.5,
  ]),
  contributionScore: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)), // Higher scores usually
  explanation: getRandomElement([
    'Significantly higher than average volume for this account.',
    'Newly created account showing suspicious activity.',
    'High-risk jurisdiction for funds transfer.',
    'Activity occurring outside of normal business hours.',
    'Multiple transactions exceeding typical thresholds.',
    'Sender has a history of flagged transactions.',
    'IP address does not match registered country.',
  ]),
});

/**
 * @function generateMockFinancialAnomalyExtended
 * @description Generates a single comprehensive mock extended financial anomaly.
 * @param {string} id - Optional ID for the anomaly.
 * @returns {FinancialAnomalyExtended} A mock FinancialAnomalyExtended object.
 */
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
  const detectionTimestamp = generateRandomDate();
  const lastUpdatedTimestamp = status === 'New' ? detectionTimestamp : generateRandomDate();

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
    ]),
    entityDescription: getRandomElement([
      'Account: ACC-123456789',
      'User: john.doe@example.com',
      'Vendor: Acme Corp',
      'Stock Symbol: XYZ',
      'Employee ID: 98765',
    ]),
    timestamp: generateRandomDate(),
    severity: severity,
    riskScore: getRandomInt(
      severity === 'Critical' ? 90 : severity === 'High' ? 70 : severity === 'Medium' ? 40 : severity === 'Low' ? 10 : 1,
      100,
    ),
    status: status, // Use the extended status type
    category: getRandomElement<AnomalyCategory>([
      'Fraud',
      'Money Laundering',
      'Market Manipulation',
      'Operational Error',
      'Cybersecurity Incident',
      'Suspicious Activity',
      'Compliance Breach',
    ]),
    assignedTo: status === 'New' || Math.random() < 0.3 ? undefined : getRandomElement(['Analyst A', 'Analyst B', 'Analyst C']),
    resolutionReason: status === 'Resolved' ? getRandomElement(['Confirmed Fraud', 'Operational Fix Applied', 'Legitimate Business Activity']) : undefined,
    resolutionNotes: status === 'Resolved' ? 'Full investigation completed, appropriate actions taken.' : undefined,
    detectionMethod: getRandomElement(['ML Model', 'Rule-Based', 'Heuristic']),
    tags: Array.from(
      new Set(
        Array(getRandomInt(0, 3))
          .fill(null)
          .map(() => getRandomElement(['high-risk', 'international', 'new-entity', 'urgent', 'false-positive', 'review-kyc', 'compliance'])),
      ),
    ),
    impactEstimate: Math.random() > 0.6
      ? {
          amount: parseFloat((Math.random() * 500000 + 1000).toFixed(2)),
          currency: 'USD',
          description: 'Estimated potential loss or fine.',
        }
      : undefined,
    confidenceScore: parseFloat((Math.random() * 0.4 + 0.5).toFixed(2)), // 0.5 to 0.9
    historicalContext:
      Math.random() > 0.5
        ? 'Similar patterns observed in Q3 2022, led to account suspension.'
        : undefined,
    detectionTimestamp: detectionTimestamp,
    lastUpdatedTimestamp: lastUpdatedTimestamp,
    relatedTransactions: Array(getRandomInt(1, 5)).fill(null).map(() => generateMockRelatedTransaction(anomalyId)),
    affectedEntities: Array(getRandomInt(1, 3)).fill(null).map(generateMockAffectedEntity),
    auditLog: Array(getRandomInt(2, 7)).fill(null).map(() => generateMockAuditLogEntry(anomalyId, getRandomElement(['system', 'Analyst A', 'Analyst B']))),
    comments: Array(getRandomInt(0, 4)).fill(null).map(() => generateMockAnomalyComment(anomalyId, getRandomElement(['Analyst A', 'Analyst B']))),
    evidence: Array(getRandomInt(0, 3)).fill(null).map(() => generateMockAnomalyEvidence(anomalyId, getRandomElement(['Analyst A', 'System']))),
    aiRecommendations: Array(getRandomInt(0, 3)).fill(null).map(generateMockAIRecommendation),
    explainabilityFeatures: Array(getRandomInt(3, 7)).fill(null).map(generateMockExplainabilityFeature),
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
  };
};

// Generate 200 mock anomalies to start with.
const INITIAL_MOCK_ANOMALIES: FinancialAnomalyExtended[] = Array(200)
  .fill(null)
  .map(() => generateMockFinancialAnomalyExtended());

// =====================================================================================================================
// UI COMPONENTS - Reusable elements for building the complex view
// =====================================================================================================================

/**
 * @interface ModalProps
 * @description Props for the Modal component.
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * @function Modal
 * @description A reusable modal component for displaying detailed information or forms.
 * @param {ModalProps} props - The properties for the Modal component.
 * @returns {JSX.Element | null} The rendered Modal component.
 */
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
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
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

/**
 * @interface ConfirmDialogProps
 * @description Props for the ConfirmDialog component.
 */
interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

/**
 * @function ConfirmDialog
 * @description A modal for confirming user actions.
 * @param {ConfirmDialogProps} props - The properties for the ConfirmDialog component.
 * @returns {JSX.Element | null} The rendered ConfirmDialog component.
 */
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

/**
 * @interface Notification
 * @description Represents a single notification message.
 */
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timeout?: number; // Milliseconds before auto-dismissal
}

/**
 * @interface NotificationToastProps
 * @description Props for the NotificationToast component.
 */
interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

/**
 * @function NotificationToast
 * @description Displays a single notification toast.
 * @param {NotificationToastProps} props - The properties for the NotificationToast component.
 * @returns {JSX.Element} The rendered NotificationToast component.
 */
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

/**
 * @function NotificationContainer
 * @description Manages and displays a list of notification toasts.
 * @param {object} props - The properties for the NotificationContainer.
 * @param {Notification[]} props.notifications - Array of notifications to display.
 * @param {(id: string) => void} props.onDismissNotification - Callback to dismiss a notification.
 * @returns {JSX.Element} The rendered NotificationContainer component.
 */
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

/**
 * @interface PaginatorProps
 * @description Props for the Paginator component.
 */
interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

/**
 * @function Paginator
 * @description A reusable pagination control.
 * @param {PaginatorProps} props - The properties for the Paginator component.
 * @returns {JSX.Element} The rendered Paginator component.
 */
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

/**
 * @interface TabPanelProps
 * @description Props for the TabPanel component.
 */
interface TabPanelProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  tabClassName?: string;
  panelClassName?: string;
}

/**
 * @function TabPanel
 * @description A generic tab panel component.
 * @param {TabPanelProps} props - The properties for the TabPanel component.
 * @returns {JSX.Element} The rendered TabPanel component.
 */
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

/**
 * @interface FilterSelectProps
 * @description Props for a generic filter select input.
 */
interface FilterSelectProps<T> {
  label: string;
  options: { value: T; label: string }[];
  selectedValue: T | undefined;
  onChange: (value: T | undefined) => void;
  allowClear?: boolean;
}

/**
 * @function FilterSelect
 * @description A reusable select input for filtering.
 * @template T
 * @param {FilterSelectProps<T>} props - The properties for the FilterSelect component.
 * @returns {JSX.Element} The rendered FilterSelect component.
 */
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

/**
 * @function InputField
 * @description A generic input field component.
 * @param {object} props - The properties for the InputField component.
 * @param {string} props.label - The label for the input field.
 * @param {string} props.value - The current value of the input.
 * @param {(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void} props.onChange - The change handler.
 * @param {string} [props.type='text'] - The type of input (text, number, email, etc.).
 * @param {string} [props.placeholder] - The placeholder text.
 * @param {boolean} [props.readOnly=false] - Whether the input is read-only.
 * @param {boolean} [props.multiline=false] - Whether the input should be a textarea.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered InputField component.
 */
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

/**
 * @function Button
 * @description A generic button component with predefined styles.
 * @param {object} props - The properties for the Button component.
 * @param {string} props.children - The content of the button.
 * @param {() => void} props.onClick - The click handler.
 * @param {'primary' | 'secondary' | 'danger' | 'ghost'} [props.variant='primary'] - The visual variant of the button.
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - The size of the button.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered Button component.
 */
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

/**
 * @function LoadingSpinner
 * @description A simple loading spinner component.
 * @returns {JSX.Element} The rendered LoadingSpinner component.
 */
export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    <span className="ml-3 text-gray-400 text-sm">Loading...</span>
  </div>
);

/**
 * @interface ChartPlaceholderProps
 * @description Props for the ChartPlaceholder component.
 */
interface ChartPlaceholderProps {
  title: string;
  height?: string;
  description?: string;
  className?: string;
}

/**
 * @function ChartPlaceholder
 * @description A placeholder component to simulate a chart.
 * @param {ChartPlaceholderProps} props - The properties for the ChartPlaceholder component.
 * @returns {JSX.Element} The rendered ChartPlaceholder component.
 */
export const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title, height = 'h-48', description, className }) => (
  <div className={`bg-gray-800/60 p-4 rounded-lg border border-gray-700 flex flex-col justify-center items-center ${height} ${className || ''}`}>
    <p className="text-lg font-bold text-gray-300 mb-2">{title}</p>
    <p className="text-xs text-gray-500 text-center">{description || 'Data visualization goes here.'}</p>
    <div className="mt-4 text-gray-600 text-sm italic">
      <p>[Chart Library Placeholder]</p>
    </div>
  </div>
);

/**
 * @interface StatCardProps
 * @description Props for the StatCard component.
 */
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: string; // e.g., "+5%" or "-2%"
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

/**
 * @function StatCard
 * @description A component to display a key statistic with optional context.
 * @param {StatCardProps} props - The properties for the StatCard component.
 * @returns {JSX.Element} The rendered StatCard component.
 */
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

/**
 * @function Tag
 * @description A small tag component.
 * @param {object} props - The properties for the Tag component.
 * @param {string} props.label - The text label for the tag.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {'primary' | 'secondary' | 'info' | 'warning' | 'danger'} [props.variant='info'] - Visual variant.
 * @returns {JSX.Element} The rendered Tag component.
 */
export const Tag: React.FC<{
  label: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'info' | 'warning' | 'danger';
}> = ({ label, className, variant = 'info' }) => {
  const variantClasses = {
    primary: 'bg-indigo-800 text-indigo-200',
    secondary: 'bg-gray-700 text-gray-200',
    info: 'bg-blue-800 text-blue-200',
    warning: 'bg-orange-800 text-orange-200',
    danger: 'bg-red-800 text-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className || ''}`}>
      {label}
    </span>
  );
};

// =====================================================================================================================
// CONTEXT AND STATE MANAGEMENT EXTENSIONS (MOCKING)
// Since we cannot modify DataContext.tsx, we'll simulate the addition of more state and functions
// within this component for demonstration purposes. In a real app, these would be in DataContext.
// =====================================================================================================================

/**
 * @interface DataContextExtended
 * @description Mocks an extended DataContext for our expanded application.
 */
interface DataContextExtended {
  financialAnomalies: FinancialAnomalyExtended[];
  updateAnomalyStatus: (id: string, newStatus: AnomalyWorkflowStatus) => void;
  addAnomalyComment: (anomalyId: string, comment: string, author: string, isInternal?: boolean) => void;
  updateAnomalyDetails: (anomaly: FinancialAnomalyExtended) => void;
  assignAnomaly: (anomalyId: string, assignee: string) => void;
  dismissAnomalies: (ids: string[], reason: AnomalyResolutionReason, notes: string) => void;
  resolveAnomalies: (ids: string[], reason: AnomalyResolutionReason, notes: string) => void;
  uploadEvidence: (anomalyId: string, filename: string, fileType: string, uploader: string, description: string, url: string) => void;
  // Add more as needed to support mock functionality
}

/**
 * @function useMockDataContext
 * @description A custom hook to provide mock extended data context, simulating a backend.
 * This replaces `useContext(DataContext)` for the purpose of this extensive code addition.
 * @returns {DataContextExtended} An object containing mock data and functions.
 */
const useMockDataContext = (): DataContextExtended => {
  const [anomalies, setAnomalies] = useState<FinancialAnomalyExtended[]>(INITIAL_MOCK_ANOMALIES);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * @function addNotification
   * @description Adds a new notification to the global state.
   * @param {string} message - The message for the notification.
   * @param {'success' | 'error' | 'info' | 'warning'} type - The type of notification.
   * @param {number} [timeout=5000] - Duration before auto-dismissal.
   */
  const addNotification = useCallback((message: string, type: Notification['type'], timeout: number = 5000) => {
    const id = generateUUID();
    setNotifications((prev) => [...prev, { id, message, type, timeout }]);
  }, []);

  /**
   * @function dismissNotification
   * @description Removes a notification from the global state.
   * @param {string} id - The ID of the notification to dismiss.
   */
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /**
   * @function updateAnomalyStatus
   * @description Updates the status of a single anomaly.
   * @param {string} id - The ID of the anomaly.
   * @param {AnomalyWorkflowStatus} newStatus - The new status.
   */
  const updateAnomalyStatus = useCallback(
    (id: string, newStatus: AnomalyWorkflowStatus) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) =>
          anomaly.id === id ? { ...anomaly, status: newStatus, lastUpdatedTimestamp: new Date().toISOString() } : anomaly,
        ),
      );
      addNotification(`Anomaly ${id.substring(0, 8)} status updated to "${newStatus}"`, 'success');
    },
    [addNotification],
  );

  /**
   * @function addAnomalyComment
   * @description Adds a comment to an anomaly.
   * @param {string} anomalyId - The ID of the anomaly.
   * @param {string} comment - The comment text.
   * @param {string} author - The author of the comment.
   * @param {boolean} [isInternal=true] - Whether the comment is internal.
   */
  const addAnomalyComment = useCallback(
    (anomalyId: string, comment: string, author: string, isInternal: boolean = true) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) =>
          anomaly.id === anomalyId
            ? {
                ...anomaly,
                comments: [
                  ...(anomaly.comments || []),
                  { id: generateUUID(), anomalyId, timestamp: new Date().toISOString(), author, comment, isInternal },
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

  /**
   * @function updateAnomalyDetails
   * @description Updates all details of an anomaly.
   * @param {FinancialAnomalyExtended} updatedAnomaly - The anomaly object with updated details.
   */
  const updateAnomalyDetails = useCallback(
    (updatedAnomaly: FinancialAnomalyExtended) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) =>
          anomaly.id === updatedAnomaly.id ? { ...updatedAnomaly, lastUpdatedTimestamp: new Date().toISOString() } : anomaly,
        ),
      );
      addNotification(`Anomaly ${updatedAnomaly.id.substring(0, 8)} details updated`, 'success');
    },
    [addNotification],
  );

  /**
   * @function assignAnomaly
   * @description Assigns an anomaly to an analyst.
   * @param {string} anomalyId - The ID of the anomaly.
   * @param {string} assignee - The ID or name of the assignee.
   */
  const assignAnomaly = useCallback(
    (anomalyId: string, assignee: string) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) =>
          anomaly.id === anomalyId
            ? {
                ...anomaly,
                assignedTo: assignee,
                status: anomaly.status === 'New' ? 'Under Review' : anomaly.status,
                auditLog: [
                  ...(anomaly.auditLog || []),
                  {
                    id: generateUUID(),
                    anomalyId,
                    timestamp: new Date().toISOString(),
                    action: 'Assigned To',
                    actor: 'System/User',
                    details: `Assigned to ${assignee}`,
                    newValue: assignee,
                  },
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

  /**
   * @function dismissAnomalies
   * @description Dismisses one or more anomalies.
   * @param {string[]} ids - An array of anomaly IDs to dismiss.
   * @param {AnomalyResolutionReason} reason - The reason for dismissal.
   * @param {string} notes - Additional notes for dismissal.
   */
  const dismissAnomalies = useCallback(
    (ids: string[], reason: AnomalyResolutionReason, notes: string) => {
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
                  {
                    id: generateUUID(),
                    anomalyId: anomaly.id,
                    timestamp: new Date().toISOString(),
                    action: 'Status Changed',
                    actor: 'System/User',
                    details: `Dismissed anomaly. Reason: ${reason}. Notes: ${notes}`,
                    oldValue: anomaly.status,
                    newValue: 'Dismissed',
                  },
                ],
              }
            : anomaly,
        ),
      );
      addNotification(`${ids.length} anomalies dismissed successfully.`, 'success');
    },
    [addNotification],
  );

  /**
   * @function resolveAnomalies
   * @description Resolves one or more anomalies.
   * @param {string[]} ids - An array of anomaly IDs to resolve.
   * @param {AnomalyResolutionReason} reason - The reason for resolution.
   * @param {string} notes - Additional notes for resolution.
   */
  const resolveAnomalies = useCallback(
    (ids: string[], reason: AnomalyResolutionReason, notes: string) => {
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
                  {
                    id: generateUUID(),
                    anomalyId: anomaly.id,
                    timestamp: new Date().toISOString(),
                    action: 'Status Changed',
                    actor: 'System/User',
                    details: `Resolved anomaly. Reason: ${reason}. Notes: ${notes}`,
                    oldValue: anomaly.status,
                    newValue: 'Resolved',
                  },
                ],
              }
            : anomaly,
        ),
      );
      addNotification(`${ids.length} anomalies resolved successfully.`, 'success');
    },
    [addNotification],
  );

  /**
   * @function uploadEvidence
   * @description Uploads evidence for an anomaly.
   * @param {string} anomalyId - The ID of the anomaly.
   * @param {string} filename - The name of the file.
   * @param {string} fileType - The type of the file.
   * @param {string} uploader - The uploader's name or ID.
   * @param {string} description - A description of the evidence.
   * @param {string} url - The URL to the uploaded file.
   */
  const uploadEvidence = useCallback(
    (anomalyId: string, filename: string, fileType: string, uploader: string, description: string, url: string) => {
      setAnomalies((prevAnomalies) =>
        prevAnomalies.map((anomaly) =>
          anomaly.id === anomalyId
            ? {
                ...anomaly,
                evidence: [
                  ...(anomaly.evidence || []),
                  { id: generateUUID(), anomalyId, filename, fileType, uploadDate: new Date().toISOString(), uploader, description, url },
                ],
                auditLog: [
                  ...(anomaly.auditLog || []),
                  {
                    id: generateUUID(),
                    anomalyId,
                    timestamp: new Date().toISOString(),
                    action: 'Evidence Uploaded',
                    actor: uploader,
                    details: `Uploaded evidence: ${filename}`,
                  },
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

  // Expose notifications and dismiss function globally
  (window as any).appNotifications = { notifications, dismissNotification };

  return {
    financialAnomalies: anomalies,
    updateAnomalyStatus,
    addAnomalyComment,
    updateAnomalyDetails,
    assignAnomaly,
    dismissAnomalies,
    resolveAnomalies,
    uploadEvidence,
  };
};

// =====================================================================================================================
// ANOMALY DETAIL COMPONENTS - For in-depth investigation of a single anomaly
// These components would typically be in their own files, but are inlined to meet the line count.
// =====================================================================================================================

/**
 * @interface AnomalyDetailPanelProps
 * @description Props for the AnomalyDetailPanel component.
 */
interface AnomalyDetailPanelProps {
  anomaly: FinancialAnomalyExtended;
  onClose: () => void;
  updateAnomalyStatus: (id: string, newStatus: AnomalyWorkflowStatus) => void;
  addAnomalyComment: (anomalyId: string, comment: string, author: string, isInternal?: boolean) => void;
  updateAnomalyDetails: (anomaly: FinancialAnomalyExtended) => void;
  assignAnomaly: (anomalyId: string, assignee: string) => void;
  uploadEvidence: (anomalyId: string, filename: string, fileType: string, uploader: string, description: string, url: string) => void;
  currentUser: string; // Mock for current user
}

/**
 * @function AnomalySummaryCard
 * @description Displays key summary information for an anomaly.
 * @param {object} props - Properties including the anomaly object.
 * @returns {JSX.Element} The rendered summary card.
 */
const AnomalySummaryCard: React.FC<{ anomaly: FinancialAnomalyExtended; currentUser: string }> = ({ anomaly, currentUser }) => {
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

/**
 * @function RelatedTransactionsTable
 * @description Displays a table of transactions related to the anomaly.
 * @param {object} props - Properties including the related transactions.
 * @returns {JSX.Element} The rendered table.
 */
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
              Risk Score
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
              <td className="px-4 py-3 whitespace-nowrap text-sm text-red-400 font-semibold">{tx.riskScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * @function AffectedEntitiesList
 * @description Displays a list of entities affected by or involved in the anomaly.
 * @param {object} props - Properties including the affected entities.
 * @returns {JSX.Element} The rendered list.
 */
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
        </div>
      ))}
    </div>
  );
};

/**
 * @function AIInsightsDisplay
 * @description Displays AI-generated recommendations and explainability features.
 * @param {object} props - Properties including AI recommendations and explainability features.
 * @returns {JSX.Element} The rendered AI insights section.
 */
const AIInsightsDisplay: React.FC<{
  recommendations?: AIRecommendation[];
  explainabilityFeatures?: ExplainabilityFeature[];
}> = ({ recommendations, explainabilityFeatures }) => {
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
              <li key={rec.id} className="text-sm">
                <span className="font-semibold text-white">[{rec.type} - {(rec.confidenceScore * 100).toFixed(0)}% Confidence]:</span>{' '}
                {rec.description}
                {rec.suggestedAction && <span className="ml-2 px-2 py-0.5 bg-indigo-700/50 rounded-full text-xs">{rec.suggestedAction}</span>}
                {rec.status && <Tag label={rec.status} variant={rec.status === 'Accepted' ? 'success' : 'secondary'} className="ml-2" />}
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

/**
 * @function AnomalyAuditLog
 * @description Displays the audit trail for an anomaly.
 * @param {object} props - Properties including the audit log entries.
 * @returns {JSX.Element} The rendered audit log.
 */
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
            <span>{new Date(entry.timestamp).toLocaleString()} by <span className="text-indigo-300">{entry.actor}</span></span>
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

/**
 * @interface CommentsSectionProps
 * @description Props for the CommentsSection component.
 */
interface CommentsSectionProps {
  anomalyId: string;
  comments?: AnomalyComment[];
  addAnomalyComment: (anomalyId: string, comment: string, author: string, isInternal?: boolean) => void;
  currentUser: string;
}

/**
 * @function CommentsSection
 * @description Allows viewing and adding comments to an anomaly.
 * @param {CommentsSectionProps} props - The properties for the CommentsSection component.
 * @returns {JSX.Element} The rendered CommentsSection.
 */
const CommentsSection: React.FC<CommentsSectionProps> = ({ anomalyId, comments, addAnomalyComment, currentUser }) => {
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(true);

  const handleAddComment = () => {
    if (newComment.trim()) {
      addAnomalyComment(anomalyId, newComment, currentUser, isInternalComment);
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

/**
 * @interface EvidenceManagerProps
 * @description Props for the EvidenceManager component.
 */
interface EvidenceManagerProps {
  anomalyId: string;
  evidence?: AnomalyEvidence[];
  uploadEvidence: (anomalyId: string, filename: string, fileType: string, uploader: string, description: string, url: string) => void;
  currentUser: string;
}

/**
 * @function EvidenceManager
 * @description Manages and displays evidence files related to an anomaly.
 * @param {EvidenceManagerProps} props - The properties for the EvidenceManager component.
 * @returns {JSX.Element} The rendered EvidenceManager.
 */
const EvidenceManager: React.FC<EvidenceManagerProps> = ({ anomalyId, evidence, uploadEvidence, currentUser }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [newFileType, setNewFileType] = useState('pdf');
  const [newDescription, setNewDescription] = useState('');
  const [newFileUrl, setNewFileUrl] = useState(''); // Simulate file upload by providing URL

  const handleUploadSubmit = () => {
    if (newFilename && newFileUrl) {
      uploadEvidence(anomalyId, newFilename, newFileType, currentUser, newDescription, newFileUrl);
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

/**
 * @function AnomalyDetailPanel
 * @description The main panel for displaying all details and enabling actions for a selected anomaly.
 * This component orchestrates all sub-components related to anomaly investigation.
 * @param {AnomalyDetailPanelProps} props - The properties for the AnomalyDetailPanel.
 * @returns {JSX.Element} The rendered detail panel.
 */
export const AnomalyDetailPanel: React.FC<AnomalyDetailPanelProps> = ({
  anomaly,
  onClose,
  updateAnomalyStatus,
  addAnomalyComment,
  updateAnomalyDetails,
  assignAnomaly,
  uploadEvidence,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string | undefined>(anomaly.assignedTo || undefined);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
  const [resolutionReason, setResolutionReason] = useState<AnomalyResolutionReason | undefined>(undefined);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const availableAssignees = useMemo(() => [
    { value: 'Analyst A', label: 'Analyst A (Fraud)' },
    { value: 'Analyst B', label: 'Analyst B (Compliance)' },
    { value: 'Analyst C', label: 'Analyst C (Ops)' },
    { value: 'Team Lead X', label: 'Team Lead X' },
  ], []);

  useEffect(() => {
    setSelectedAssignee(anomaly.assignedTo || undefined);
    setResolutionReason(anomaly.resolutionReason || undefined);
    setResolutionNotes(anomaly.resolutionNotes || '');
  }, [anomaly]);

  const handleAssignAnomaly = () => {
    if (selectedAssignee) {
      assignAnomaly(anomaly.id, selectedAssignee);
      setIsAssignModalOpen(false);
    }
  };

  const handleResolveAnomaly = () => {
    if (resolutionReason) {
      updateAnomalyStatus(anomaly.id, 'Resolved');
      // In a real app, updateAnomalyDetails would also save resolution reason/notes
      updateAnomalyDetails({ ...anomaly, status: 'Resolved', resolutionReason, resolutionNotes, timeToResolutionSeconds: (new Date().getTime() - new Date(anomaly.detectionTimestamp).getTime()) / 1000 });
      setIsResolveModalOpen(false);
    }
  };

  const handleDismissAnomaly = () => {
    if (resolutionReason) {
      updateAnomalyStatus(anomaly.id, 'Dismissed');
      // In a real app, updateAnomalyDetails would also save dismissal reason/notes
      updateAnomalyDetails({ ...anomaly, status: 'Dismissed', resolutionReason, resolutionNotes });
      setIsDismissModalOpen(false);
    }
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
          <p className="text-xs text-gray-500 mt-4">Note: This table shows transactions that were identified by the AI system as potentially related to this anomaly. Further investigation may be required to confirm causality.</p>
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
          <p className="text-xs text-gray-500 mt-4">Entities are accounts, users, or vendors found to be connected to the anomalous activity. Detailed profiles for these entities can be accessed via Entity Management module.</p>
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
            recommendations={anomaly.aiRecommendations}
            explainabilityFeatures={anomaly.explainabilityFeatures}
          />
          <p className="text-xs text-gray-500 mt-4">AI recommendations provide suggested next steps based on learned patterns. Explainable AI features highlight the data points that most influenced the anomaly detection model.</p>
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
          <p className="text-xs text-gray-500 mt-4">All actions taken on this anomaly are logged here for compliance and auditing purposes. This includes status changes, assignments, and evidence uploads.</p>
        </Card>
      ),
    },
    {
      id: 'comments',
      label: `Comments (${anomaly.comments?.length || 0})`,
      content: (
        <Card className="p-6 bg-gray-800/60 border border-gray-700">
          <CommentsSection anomalyId={anomaly.id} comments={anomaly.comments} addAnomalyComment={addAnomalyComment} currentUser={currentUser} />
          <p className="text-xs text-gray-500 mt-4">Analysts can add internal or external comments here during the investigation process. These comments aid in collaboration and knowledge sharing.</p>
        </Card>
      ),
    },
    {
      id: 'evidence',
      label: `Evidence (${anomaly.evidence?.length || 0})`,
      content: (
        <Card className="p-6 bg-gray-800/60 border border-gray-700">
          <EvidenceManager anomalyId={anomaly.id} evidence={anomaly.evidence} uploadEvidence={uploadEvidence} currentUser={currentUser} />
          <p className="text-xs text-gray-500 mt-4">Uploaded files (e.g., reports, logs, screenshots) relevant to the anomaly investigation are stored and managed here.</p>
        </Card>
      ),
    },
  ], [anomaly, addAnomalyComment, uploadEvidence, currentUser]);

  return (
    <Modal isOpen={true} onClose={onClose} title={`Anomaly Details: ${anomaly.id.substring(0, 8)}`} size="xl">
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 items-center justify-end border-b border-gray-700 pb-4 mb-4">
          {anomaly.status === 'New' && (
            <>
              <Button onClick={() => setIsAssignModalOpen(true)} variant="secondary">
                Assign
              </Button>
              <Button onClick={() => updateAnomalyStatus(anomaly.id, 'Under Review')} variant="secondary">
                Begin Review
              </Button>
              <Button onClick={() => setIsDismissModalOpen(true)} variant="danger">
                Dismiss
              </Button>
            </>
          )}
          {anomaly.status === 'Under Review' && (
            <>
              <Button onClick={() => setIsAssignModalOpen(true)} variant="secondary">
                Reassign
              </Button>
              <Button onClick={() => updateAnomalyStatus(anomaly.id, 'Pending Further Info')} variant="secondary">
                Request More Info
              </Button>
              <Button onClick={() => setIsDismissModalOpen(true)} variant="danger">
                Dismiss
              </Button>
              <Button onClick={() => setIsResolveModalOpen(true)} variant="primary">
                Mark Resolved
              </Button>
            </>
          )}
          {(anomaly.status === 'Pending Further Info' || anomaly.status === 'Escalated' || anomaly.status === 'On Hold') && (
            <>
              <Button onClick={() => setIsAssignModalOpen(true)} variant="secondary">
                Reassign
              </Button>
              <Button onClick={() => updateAnomalyStatus(anomaly.id, 'Under Review')} variant="secondary">
                Continue Review
              </Button>
              <Button onClick={() => setIsDismissModalOpen(true)} variant="danger">
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

      {/* Assign Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Anomaly" size="sm">
        <div className="space-y-4">
          <p className="text-gray-300">Select an analyst or team to assign this anomaly to.</p>
          <FilterSelect
            label="Assignee"
            options={availableAssignees}
            selectedValue={selectedAssignee}
            onChange={(val) => setSelectedAssignee(val as string)}
            allowClear={true}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssignAnomaly} disabled={!selectedAssignee}>
            Assign
          </Button>
        </div>
      </Modal>

      {/* Resolve Modal */}
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
            placeholder="Add detailed notes about the resolution, actions taken, and impact."
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

      {/* Dismiss Modal */}
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
            placeholder="Provide detailed reasons for dismissing this anomaly."
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

// =====================================================================================================================
// DASHBOARD COMPONENTS - Overview of anomaly detection metrics
// These components provide high-level summaries and visualizations.
// =====================================================================================================================

/**
 * @interface DashboardStats
 * @description Represents key statistics for the anomaly detection dashboard.
 */
export interface DashboardStats {
  totalAnomalies: number;
  newAnomalies: number;
  underReviewAnomalies: number;
  resolvedAnomalies: number;
  criticalAnomalies: number;
  falsePositives: number;
  avgResolutionTimeHours: number;
  anomaliesLast7Days: number[]; // e.g., [10, 12, 8, 15, 11, 9, 13]
  severityDistribution: { severity: AnomalySeverity; count: number }[];
  categoryDistribution: { category: AnomalyCategory; count: number }[];
}

/**
 * @function calculateDashboardStats
 * @description Calculates dashboard statistics from a list of anomalies.
 * @param {FinancialAnomalyExtended[]} anomalies - The list of anomalies.
 * @returns {DashboardStats} Calculated dashboard statistics.
 */
export const calculateDashboardStats = (anomalies: FinancialAnomalyExtended[]): DashboardStats => {
  const totalAnomalies = anomalies.length;
  const newAnomalies = anomalies.filter((a) => a.status === 'New').length;
  const underReviewAnomalies = anomalies.filter((a) => a.status === 'Under Review' || a.status === 'Pending Further Info' || a.status === 'Escalated').length;
  const resolvedAnomalies = anomalies.filter((a) => a.status === 'Resolved').length;
  const criticalAnomalies = anomalies.filter((a) => a.severity === 'Critical').length;
  const falsePositives = anomalies.filter((a) => a.status === 'Dismissed' && a.resolutionReason === 'False Positive').length;

  const resolvedTimes = anomalies
    .filter((a) => a.status === 'Resolved' && a.timeToResolutionSeconds !== undefined)
    .map((a) => a.timeToResolutionSeconds!);
  const avgResolutionTimeHours =
    resolvedTimes.length > 0 ? resolvedTimes.reduce((sum, time) => sum + time, 0) / resolvedTimes.length / 3600 : 0;

  const now = new Date();
  const last7DaysData: number[] = Array(7).fill(0);
  anomalies.forEach((anomaly) => {
    const detectionDate = new Date(anomaly.detectionTimestamp);
    const diffTime = Math.abs(now.getTime() - detectionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 1 && diffDays <= 7) {
      last7DaysData[7 - diffDays]++;
    }
  });

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

  return {
    totalAnomalies,
    newAnomalies,
    underReviewAnomalies,
    resolvedAnomalies,
    criticalAnomalies,
    falsePositives,
    avgResolutionTimeHours: parseFloat(avgResolutionTimeHours.toFixed(1)),
    anomaliesLast7Days: last7DaysData,
    severityDistribution,
    categoryDistribution,
  };
};

/**
 * @interface DashboardOverviewProps
 * @description Props for the DashboardOverview component.
 */
interface DashboardOverviewProps {
  stats: DashboardStats;
  onViewAllAnomalies: (status?: AnomalyWorkflowStatus) => void;
  onViewCriticalAnomalies: () => void;
}

/**
 * @function DashboardOverview
 * @description Displays key performance indicators and high-level charts for anomaly detection.
 * @param {DashboardOverviewProps} props - The properties for the DashboardOverview component.
 * @returns {JSX.Element} The rendered dashboard overview.
 */
export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  onViewAllAnomalies,
  onViewCriticalAnomalies,
}) => {
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder
          title="Anomalies Detected Last 7 Days"
          height="h-64"
          description="Trend of newly detected anomalies over the past week."
          className="hover:shadow-lg hover:shadow-indigo-500/20 transition-shadow duration-300"
        />
        <ChartPlaceholder
          title="Anomaly Severity Distribution"
          height="h-64"
          description="Breakdown of anomalies by their assigned severity level."
          className="hover:shadow-lg hover:shadow-indigo-500/20 transition-shadow duration-300"
        />
        <ChartPlaceholder
          title="Anomaly Category Distribution"
          height="h-64"
          description="Categorization of anomalies to identify common patterns."
          className="hover:shadow-lg hover:shadow-indigo-500/20 transition-shadow duration-300"
        />
        <ChartPlaceholder
          title="Resolution Status Overview"
          height="h-64"
          description="Percentage of anomalies by their current workflow status."
          className="hover:shadow-lg hover:shadow-indigo-500/20 transition-shadow duration-300"
        />
      </div>

      <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 flex justify-center items-center gap-4 flex-wrap">
        <h3 className="text-xl font-bold text-white flex-grow text-center lg:text-left">Quick Actions</h3>
        <Button onClick={() => onViewAllAnomalies()} variant="secondary">
          View All Anomalies ({stats.totalAnomalies})
        </Button>
        <Button onClick={() => onViewAllAnomalies('New')} variant="primary">
          Review New Alerts ({stats.newAnomalies})
        </Button>
        <Button onClick={onViewCriticalAnomalies} variant="danger">
          Investigate Criticals ({stats.criticalAnomalies})
        </Button>
      </div>
    </div>
  );
};

// =====================================================================================================================
// MAIN VIEW COMPONENT - AnomalyDetectionView
// This integrates all the sub-components and manages the overall state and logic.
// =====================================================================================================================

/**
 * @interface FilterOptions
 * @description Defines the available filters for the anomaly list.
 */
interface FilterOptions {
  status?: AnomalyWorkflowStatus;
  severity?: AnomalySeverity;
  category?: AnomalyCategory;
  assignedTo?: string;
  searchTerm?: string;
}

/**
 * @interface SortOptions
 * @description Defines the available sorting options for the anomaly list.
 */
interface SortOptions {
  field: keyof FinancialAnomalyExtended | '';
  direction: 'asc' | 'desc';
}

/**
 * @function AnomalyDetectionView
 * @description The main component for displaying and managing AI-powered anomaly detection.
 * This component orchestrates the dashboard, anomaly list, and detail panel.
 * @returns {JSX.Element} The rendered AnomalyDetectionView.
 */
const AnomalyDetectionView: React.FC = () => {
  // Use the mock context for this extended file. In a real app, you'd use the actual DataContext
  // and extend it in the context file itself.
  const { financialAnomalies, updateAnomalyStatus, addAnomalyComment, updateAnomalyDetails, assignAnomaly, dismissAnomalies, resolveAnomalies, uploadEvidence } = useMockDataContext();

  // State for anomaly list management
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
  const [activeView, setActiveView] = useState<'dashboard' | 'anomalies'>('dashboard'); // New state for view switching

  // Mock current user for actions
  const currentUser = 'Analyst Alpha';

  /**
   * @function filteredAndSortedAnomalies
   * @description Memoized function to apply filters and sorting to the anomaly list.
   * @returns {FinancialAnomalyExtended[]} The filtered and sorted list of anomalies.
   */
  const filteredAndSortedAnomalies = useMemo(() => {
    let result = [...financialAnomalies];

    // Apply filters
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

    // Apply sorting
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
        // Fallback for other types or null/undefined
        return 0;
      });
    }

    return result;
  }, [financialAnomalies, filters, sort]);

  // Pagination calculation
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
    setCurrentPage(1); // Reset to first page on filter change
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
    if (selectedAnomalyIds.length === 0) return; // Should not happen with disabled button
    setBulkActionType(type);
    setBulkActionReason(undefined);
    setBulkActionNotes('');
    setBulkActionAssignee(undefined);
    setIsBulkActionModalOpen(true);
  }, [selectedAnomalyIds]);

  const handlePerformBulkAction = useCallback(() => {
    if (bulkActionType === 'resolve' && bulkActionReason) {
      resolveAnomalies(selectedAnomalyIds, bulkActionReason, bulkActionNotes);
    } else if (bulkActionType === 'dismiss' && bulkActionReason) {
      dismissAnomalies(selectedAnomalyIds, bulkActionReason, bulkActionNotes);
    } else if (bulkActionType === 'assign' && bulkActionAssignee) {
      selectedAnomalyIds.forEach(id => assignAnomaly(id, bulkActionAssignee));
    } else {
      console.error('Invalid bulk action or missing required fields');
      return;
    }
    setIsBulkActionModalOpen(false);
    setSelectedAnomalyIds([]); // Clear selection after action
  }, [bulkActionType, bulkActionReason, bulkActionNotes, bulkActionAssignee, selectedAnomalyIds, resolveAnomalies, dismissAnomalies, assignAnomaly]);

  // Dashboard functions
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

  // Available options for filters
  const anomalyStatusOptions = useMemo(() => Object.values(AnomalyStatus).map(s => ({ value: s, label: s })), []);
  const anomalySeverityOptions = useMemo(() => ([
    { value: 'Critical', label: 'Critical' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
    { value: 'Informational', label: 'Informational' },
  ]), []);
  const anomalyCategoryOptions = useMemo(() => Object.values(AnomalyCategory).map(c => ({ value: c, label: c })), []);
  const availableAssignees = useMemo(() => [
    { value: 'Analyst A', label: 'Analyst A (Fraud)' },
    { value: 'Analyst B', label: 'Analyst B (Compliance)' },
    { value: 'Analyst C', label: 'Analyst C (Ops)' },
    { value: 'Team Lead X', label: 'Team Lead X' },
  ], []);

  // Existing SeverityIndicator from original file, adapted for AnomalySeverity
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
          {/* Anomaly Filters and Search */}
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
                options={availableAssignees}
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

          {/* Bulk Actions Bar */}
          {selectedAnomalyIds.length > 0 && (
            <div className="sticky bottom-0 z-40 bg-gray-900/90 backdrop-blur-sm p-4 rounded-t-lg shadow-xl border-t border-gray-700 flex flex-wrap gap-3 items-center justify-between">
              <span className="text-sm text-white font-semibold">
                {selectedAnomalyIds.length} anomalies selected
              </span>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => handleOpenBulkActionModal('assign')} disabled={selectedAnomalyIds.length === 0}>
                  Assign Selected
                </Button>
                <Button variant="danger" onClick={() => handleOpenBulkActionModal('dismiss')} disabled={selectedAnomalyIds.length === 0}>
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

          {/* Anomaly List */}
          <Card>
            <div className="min-h-[500px]"> {/* Ensures consistent height for loading/empty states */}
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
                        anomaly.status === 'Dismissed' ? 'border-gray-500' : 'border-gray-600'
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
                                  <Button onClick={() => updateAnomalyStatus(anomaly.id, 'Under Review')} size="sm" variant="secondary">Begin Review</Button>
                                  <Button onClick={() => handleOpenBulkActionModal('dismiss')} size="sm" variant="danger">Dismiss</Button>
                                </>
                              )}
                              {anomaly.status === 'Under Review' && (
                                <>
                                  <Button onClick={() => updateAnomalyStatus(anomaly.id, 'Resolved')} size="sm" variant="primary">Mark Resolved</Button>
                                  <Button onClick={() => handleOpenBulkActionModal('dismiss')} size="sm" variant="danger">Dismiss</Button>
                                </>
                              )}
                              {(anomaly.status === 'Pending Further Info' || anomaly.status === 'Escalated' || anomaly.status === 'On Hold') && (
                                <>
                                  <Button onClick={() => updateAnomalyStatus(anomaly.id, 'Under Review')} size="sm" variant="secondary">Continue Review</Button>
                                  <Button onClick={() => updateAnomalyStatus(anomaly.id, 'Resolved')} size="sm" variant="primary">Mark Resolved</Button>
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
          currentUser={currentUser}
        />
      )}

      {/* Bulk Action Modal */}
      <Modal isOpen={isBulkActionModalOpen} onClose={() => setIsBulkActionModalOpen(false)} title={`Bulk ${bulkActionType ? bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1) : ''} Anomalies`} size="md">
        <div className="space-y-4">
          <p className="text-gray-300 mb-4">
            You are about to perform a bulk action on <span className="font-semibold text-indigo-300">{selectedAnomalyIds.length}</span> selected anomalies.
            Please confirm the details.
          </p>

          {bulkActionType === 'assign' && (
            <FilterSelect
              label="Assign to"
              options={availableAssignees}
              selectedValue={bulkActionAssignee}
              onChange={(val) => setBulkActionAssignee(val as string)}
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
                placeholder={`Add detailed notes for this bulk ${bulkActionType}.`}
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
              (bulkActionType === 'assign' && !bulkActionAssignee) ||
              ((bulkActionType === 'resolve' || bulkActionType === 'dismiss') && !bulkActionReason)
            }
            variant={bulkActionType === 'dismiss' ? 'danger' : 'primary'}
          >
            Confirm {bulkActionType === 'resolve' ? 'Resolution' : bulkActionType === 'dismiss' ? 'Dismissal' : 'Assignment'}
          </Button>
        </div>
      </Modal>

      {(window as any).appNotifications && (
        <NotificationContainer notifications={(window as any).appNotifications.notifications} onDismissNotification={(window as any).appNotifications.dismissNotification} />
      )}
    </div>
  );
}

export default AnomalyDetectionView;