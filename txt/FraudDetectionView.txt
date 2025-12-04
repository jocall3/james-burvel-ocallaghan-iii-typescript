import React, { useContext, useMemo, useState, useEffect, useCallback, createContext } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';
import { FraudCase } from '../../../../types'; // Original FraudCase type
import { GoogleGenAI } from '@google/genai';

// --- NEW TYPES AND INTERFACES (approx. 200-300 lines) ---
/**
 * @typedef {Object} TransactionDetail Represents a single transaction associated with a fraud case.
 * This provides granular data for forensic analysis.
 */
export interface TransactionDetail {
    transactionId: string;
    amount: number;
    currency: string;
    timestamp: string;
    merchantId: string;
    merchantName: string;
    paymentMethod: string; // e.g., 'Credit Card', 'PayPal', 'Bitcoin'
    cardType?: string; // e.g., 'Visa', 'Mastercard'
    cardNumberLast4?: string;
    billingAddress: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    ipAddress: string;
    deviceInfo: string; // e.g., 'Chrome on Windows 10', 'iOS Safari'
    geolocation: {
        latitude: number;
        longitude: number;
        city: string;
        country: string;
    };
    status: 'Approved' | 'Declined' | 'Pending'; // Transaction status
    riskScore: number; // Transaction-specific risk score
    fraudModelScores?: { // Scores from various internal/external fraud models
        modelA: number;
        modelB: number;
        modelC: number;
    };
    flags?: string[]; // e.g., 'HighVelocity', 'IPMismatch', 'NewDevice', 'CardTesting'
}

/**
 * @typedef {Object} UserProfile Represents the profile details of the user involved in a fraud case.
 */
export interface UserProfile {
    userId: string;
    username: string;
    email: string;
    accountCreationDate: string;
    lastLoginDate: string;
    totalTransactions: number;
    totalAmountSpent: number;
    associatedAccounts: string[]; // Other accounts linked to this user
    KYCStatus: 'Verified' | 'Pending' | 'Unverified' | 'Failed';
    loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    reputationScore: number; // Internal reputation score based on past behavior
    phoneNumber?: string;
    addressHistory?: Array<{ street: string; city: string; state: string; zip: string; country: string; validFrom: string; validTo?: string }>;
}

/**
 * @typedef {Object} DeviceFingerprint Stores details about the device used for the transaction.
 */
export interface DeviceFingerprint {
    fingerprintId: string;
    browser: string;
    os: string;
    deviceType: string; // 'Mobile', 'Desktop', 'Tablet'
    screenWidth: number;
    screenHeight: number;
    plugins: string[]; // List of browser plugins detected
    userAgent: string;
    firstSeen: string; // Timestamp when this device was first seen
    lastSeen: string; // Timestamp when this device was last seen
    associatedUserIds: string[]; // Other users linked to this device
    vpnDetected?: boolean;
    proxyDetected?: boolean;
    timezoneOffset?: number;
    language?: string;
}

/**
 * @typedef {Object} Comment Represents a comment or note added by an analyst to a fraud case.
 */
export interface Comment {
    id: string;
    analystId: string;
    analystName: string;
    timestamp: string;
    content: string;
    edited?: boolean; // Indicates if the comment was later edited
}

/**
 * @typedef {Object} Attachment Represents a document or file attached to a fraud case.
 */
export interface Attachment {
    id: string;
    filename: string;
    fileType: string;
    url: string; // URL to access the attachment
    uploadedBy: string;
    uploadedAt: string;
}

/**
 * @typedef {Object} AuditLogEntry Records a significant action or change related to a fraud case.
 */
export interface AuditLogEntry {
    id: string;
    timestamp: string;
    action: string; // e.g., 'Status Changed', 'Analyst Assigned', 'Comment Added', 'Rule Applied'
    analystId: string;
    analystName: string;
    details: Record<string, any>; // Specific details about the action
}

/**
 * @typedef {Object} RiskFactorBreakdown Provides a granular view of different risk contributors.
 */
export interface RiskFactorBreakdown {
    ipVelocity: number; // Score based on IP address usage velocity
    deviceVelocity: number; // Score based on device usage velocity
    geoMismatch: number; // Score for IP vs. billing/shipping address mismatch
    amountThreshold: number; // Score for transaction amount exceeding thresholds
    newAccount: number; // Score for new accounts showing risky behavior
    suspiciousPattern: number; // Score for general suspicious patterns
    identityVerification: number; // Score from ID verification services
    paymentMethodRisk: number; // Risk associated with the payment method
    behavioralAnalytics: number; // Score from user behavioral analytics
    totalScore: number; // Overall aggregated risk score
}

/**
 * @typedef {Object} FraudRule Defines a specific rule for fraud detection.
 */
export interface FraudRule {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Inactive' | 'Draft';
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    condition: string; // e.g., "transaction.amount > 1000 && user.country != transaction.ip.country"
    action: 'Flag' | 'Deny' | 'Review' | 'Escalate';
    createdBy: string;
    createdAt: string;
    lastUpdatedBy: string;
    lastUpdatedAt: string;
    hitCount: number; // Number of times this rule has triggered an alert
    falsePositiveRate?: number; // % of false positives
    falseNegativeRate?: number; // % of false negatives (missed fraud)
    priorityOrder: number; // Order in which rules are evaluated
    tags?: string[]; // e.g., 'High-Value', 'IP-Risk', 'New-User'
}

/**
 * @typedef {Object} Analyst Represents a fraud analyst user in the system.
 */
export interface Analyst {
    id: string;
    name: string;
    role: 'Junior Analyst' | 'Senior Analyst' | 'Lead Investigator' | 'Admin';
    email: string;
    assignedCases: string[]; // List of case IDs assigned to this analyst
    active: boolean; // Account active status
    photoUrl: string;
    lastLogin?: string;
    teamId?: string;
    teamName?: string;
}

/**
 * @typedef {Object} AlertNotification Represents an alert generated by the system or a rule.
 */
export interface AlertNotification {
    id: string;
    caseId?: string; // Optional: ID of the fraud case linked to this alert
    ruleId?: string; // Optional: ID of the rule that triggered this alert
    type: 'System' | 'Rule Trigger' | 'Manual' | 'Anomaly';
    message: string;
    severity: 'Info' | 'Warning' | 'Critical';
    timestamp: string;
    read: boolean;
    actionTaken?: string; // e.g., 'Reviewed', 'Dismissed'
    category?: 'Transaction' | 'Login' | 'Account' | 'System';
}

/**
 * @typedef {Object} FraudTrendData Data point for historical fraud trends.
 */
export interface FraudTrendData {
    date: string; // YYYY-MM-DD
    newCases: number;
    resolvedCases: number;
    amountFlagged: number;
    averageRiskScore: number;
    falsePositives: number;
}

/**
 * @typedef {Object} GeoFraudData Data point for geographical fraud distribution.
 */
export interface GeoFraudData {
    country: string;
    cases: number;
    amount: number;
    riskScore: number;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}

/**
 * @typedef {Object} ReportDefinition Defines the structure for a predefined or custom report.
 */
export interface ReportDefinition {
    id: string;
    name: string;
    description: string;
    type: 'summary' | 'trend' | 'geographic' | 'custom' | 'performance';
    params: Record<string, any>;
    lastGenerated: string;
    generatedBy: string;
    status: 'Generated' | 'Pending' | 'Failed';
    downloadLink?: string;
}

// Extend the original FraudCase type conceptually for this file's usage.
// In a real app, FraudCase in types.ts would be updated or a new type would inherit.
export interface ExtendedFraudCase extends FraudCase {
    caseId: string; // Adding explicit caseId for consistency
    analystId?: string;
    analystName?: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    fraudType: 'Account Takeover' | 'Synthetic ID' | 'Chargeback Fraud' | 'Friendly Fraud' | 'Phishing' | 'Mule Account' | 'Refund Abuse';
    transactionDetails: TransactionDetail[];
    userProfile: UserProfile;
    deviceFingerprint: DeviceFingerprint;
    riskFactors: RiskFactorBreakdown;
    comments: Comment[];
    attachments: Attachment[];
    auditLog: AuditLogEntry[];
    recommendedAction?: string; // AI recommendation for next steps
    resolutionNotes?: string;
    resolutionDate?: string;
    relatedCases?: string[]; // Other cases potentially linked to this one
    decisionHistory?: {
        decidedBy: string;
        decidedAt: string;
        decision: 'Investigate' | 'Resolve' | 'Dismiss' | 'Escalate' | 'Approve';
        reason?: string;
    }[];
    lastUpdatedBy?: string;
    lastUpdatedAt?: string;
    sourceRuleId?: string; // If flagged by a specific rule
    modelPredictionConfidence?: number; // AI model's confidence in fraud prediction
}


// --- UTILITY FUNCTIONS (approx. 300-400 lines) ---
/**
 * Generates a unique ID.
 * @returns {string} A unique identifier.
 */
export const generateId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Formats a number as currency.
 * @param {number} amount - The amount to format.
 * @param {string} currency - The currency symbol (e.g., '$').
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = '$'): string => `${currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Formats a date string into a more readable format.
 * @param {string} dateString - The date string to format.
 * @returns {string} Formatted date string.
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

/**
 * Calculates a color based on risk score (red for high, green for low).
 * @param {number} score - The risk score (0-100).
 * @returns {string} Tailwind CSS class for text color.
 */
export const getRiskScoreColor = (score: number): string => {
    if (score > 85) return 'text-red-400';
    if (score > 70) return 'text-orange-400';
    if (score > 55) return 'text-yellow-400';
    return 'text-green-400';
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The input string.
 * @returns {string} The string with the first letter capitalized.
 */
export const capitalize = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Generates a random number within a range.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} Random number.
 */
export const getRandom = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generates a random date within a range.
 * @param {Date} start - Start date.
 * @param {Date} end - End date.
 * @returns {string} Random date as ISO string.
 */
export const getRandomDate = (start: Date, end: Date): string => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString();
};

/**
 * Helper to get a random item from an array.
 * @param {Array<T>} arr - The array.
 * @returns {T} A random item from the array.
 */
export const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Mock geo coordinates for major cities
const MOCK_CITIES = [
    { city: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
    { city: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
    { city: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917 },
    { city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
    { city: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
    { city: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050 },
    { city: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
    { city: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
    { city: 'San Francisco', country: 'USA', lat: 37.7749, lon: -122.4194 },
    { city: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
    { city: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737 },
    { city: 'Sao Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333 },
    { city: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332 },
    { city: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
    { city: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173 },
];

/**
 * Generates mock transaction details.
 */
export const generateMockTransactionDetails = (userId: string, timestamp: string): TransactionDetail => {
    const amount = parseFloat((Math.random() * 5000 + 50).toFixed(2));
    const merchantName = getRandomItem(['Amazon', 'eBay', 'PayPal', 'Stripe', 'Walmart', 'Target', 'BestBuy', 'Shein', 'Alibaba', 'Zara', 'Steam', 'Netflix']);
    const paymentMethod = getRandomItem(['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Bitcoin', 'Apple Pay', 'Google Pay']);
    const cardType = paymentMethod.includes('Card') ? getRandomItem(['Visa', 'Mastercard', 'Amex', 'Discover']) : undefined;
    const cardNumberLast4 = cardType ? String(getRandom(1000, 9999)) : undefined;
    const cityData = getRandomItem(MOCK_CITIES);
    const ip = `${getRandom(1, 255)}.${getRandom(1, 255)}.${getRandom(1, 255)}.${getRandom(1, 255)}`;
    const device = getRandomItem(['Chrome on Windows 10', 'Safari on iOS', 'Firefox on MacOS', 'Edge on Android', 'Brave on Linux', 'Opera on ChromeOS']);

    return {
        transactionId: `TXN-${generateId().toUpperCase()}`,
        amount: amount,
        currency: 'USD',
        timestamp: timestamp,
        merchantId: `M-${getRandom(10000, 99999)}`,
        merchantName: merchantName,
        paymentMethod: paymentMethod,
        cardType: cardType,
        cardNumberLast4: cardNumberLast4,
        billingAddress: {
            street: `${getRandom(100, 999)} Main St`,
            city: cityData.city,
            state: 'CA', // Simplified
            zip: String(getRandom(10000, 99999)),
            country: cityData.country,
        },
        ipAddress: ip,
        deviceInfo: device,
        geolocation: {
            latitude: cityData.lat + (Math.random() - 0.5) * 0.1, // Small variation
            longitude: cityData.lon + (Math.random() - 0.5) * 0.1,
            city: cityData.city,
            country: cityData.country,
        },
        status: getRandomItem(['Approved', 'Declined', 'Pending']),
        riskScore: getRandom(30, 99),
        fraudModelScores: {
            modelA: getRandom(20, 95),
            modelB: getRandom(20, 95),
            modelC: getRandom(20, 95),
        },
        flags: getRandomItem([
            [], ['HighVelocity'], ['IPMismatch'], ['NewDevice'], ['HighVelocity', 'IPMismatch'], ['CardTesting', 'NewDevice']
        ]),
    };
};

/**
 * Generates mock user profile.
 */
export const generateMockUserProfile = (baseId: string): UserProfile => {
    const creationDate = getRandomDate(new Date(2020, 0, 1), new Date());
    const lastLogin = getRandomDate(new Date(creationDate), new Date());
    return {
        userId: `USR-${baseId}`,
        username: `user_${baseId}`,
        email: `user.${baseId}@example.com`,
        accountCreationDate: creationDate,
        lastLoginDate: lastLogin,
        totalTransactions: getRandom(10, 500),
        totalAmountSpent: parseFloat((Math.random() * 100000 + 500).toFixed(2)),
        associatedAccounts: Array.from({ length: getRandom(0, 2) }).map(() => `ACC-${generateId().substring(0, 8)}`),
        KYCStatus: getRandomItem(['Verified', 'Pending', 'Unverified', 'Failed']),
        loyaltyTier: getRandomItem(['Bronze', 'Silver', 'Gold', 'Platinum']),
        reputationScore: getRandom(300, 900),
        phoneNumber: `+1-${getRandom(200, 999)}-${getRandom(200, 999)}-${getRandom(1000, 9999)}`,
        addressHistory: Array.from({ length: getRandom(1, 2) }).map((_, idx) => ({
            street: `${getRandom(100, 999)} Oak Ave`,
            city: getRandomItem(MOCK_CITIES).city,
            state: 'TX',
            zip: String(getRandom(10000, 99999)),
            country: getRandomItem(['USA', 'Canada']).country,
            validFrom: getRandomDate(new Date(2018, 0, 1), new Date(2022, 0, 1)),
            validTo: idx === 0 ? getRandomDate(new Date(2022, 1, 1), new Date(2023, 0, 1)) : undefined,
        }))
    };
};

/**
 * Generates mock device fingerprint.
 */
export const generateMockDeviceFingerprint = (): DeviceFingerprint => {
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
    const oses = ['Windows 10', 'macOS', 'iOS', 'Android', 'Linux'];
    const deviceTypes = ['Mobile', 'Desktop', 'Tablet'];
    const plugins = ['Flash', 'Java', 'PDF Viewer', 'AdBlocker', 'WebRTC'];

    const firstSeen = getRandomDate(new Date(2021, 0, 1), new Date());
    const lastSeen = getRandomDate(new Date(firstSeen), new Date());

    return {
        fingerprintId: `FP-${generateId().toUpperCase()}`,
        browser: getRandomItem(browsers),
        os: getRandomItem(oses),
        deviceType: getRandomItem(deviceTypes),
        screenWidth: getRandomItem([1920, 1440, 1366, 375, 414, 768]),
        screenHeight: getRandomItem([1080, 900, 768, 667, 896, 1024]),
        plugins: Array.from({ length: getRandom(1, 3) }).map(() => getRandomItem(plugins)),
        userAgent: `Mozilla/5.0 (${getRandomItem(oses)}) AppleWebKit/537.36 (KHTML, like Gecko) ${getRandomItem(browsers)}`,
        firstSeen: firstSeen,
        lastSeen: lastSeen,
        associatedUserIds: [], // To be filled later if needed
        vpnDetected: Math.random() > 0.7,
        proxyDetected: Math.random() > 0.8,
        timezoneOffset: getRandom(-12 * 60, 12 * 60), // In minutes
        language: getRandomItem(['en-US', 'es-ES', 'fr-FR', 'de-DE']),
    };
};

/**
 * Generates mock comments.
 */
export const generateMockComments = (num: number, analystIds: string[], analystNames: string[]): Comment[] => {
    return Array.from({ length: num }).map(() => {
        const analystIndex = getRandom(0, analystIds.length - 1);
        return {
            id: generateId(),
            analystId: analystIds[analystIndex],
            analystName: analystNames[analystIndex],
            timestamp: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
            content: getRandomItem([
                'Initial review suggests potential IP spoofing due to multiple login attempts from different geos.',
                'Cross-referenced with internal watchlist. User has previous suspicious activity flags.',
                'Requested additional documentation from user. Awaiting response.',
                'Transaction velocity is unusually high for this account profile.',
                'Fraudulent chargeback pattern detected in associated transactions.',
                'Seems to be a legitimate transaction after further investigation. Lowering priority.',
                'Escalated to senior analyst due to high amount and complex pattern.',
                'Confirmed identity via third-party IDV service. Transaction appears legitimate.',
                'Blocked associated IPs and devices. Notifying user of account compromise.',
            ]),
            edited: Math.random() > 0.8,
        };
    });
};

/**
 * Generates mock attachments.
 */
export const generateMockAttachments = (num: number, uploadedBy: string[]): Attachment[] => {
    return Array.from({ length: num }).map(() => ({
        id: generateId(),
        filename: getRandomItem(['invoice.pdf', 'screenshot.png', 'bank_statement.jpg', 'chat_log.txt', 'id_document.jpeg', 'transaction_receipt.pdf']),
        fileType: getRandomItem(['application/pdf', 'image/png', 'image/jpeg', 'text/plain']),
        url: `https://example.com/attachments/${generateId()}`,
        uploadedBy: getRandomItem(uploadedBy),
        uploadedAt: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
    }));
};

/**
 * Generates mock audit log entries for a case.
 */
export const generateMockAuditLog = (caseId: string, analystIds: string[], analystNames: string[], creationDate: string): AuditLogEntry[] => {
    const logs: AuditLogEntry[] = [];
    const initialTimestamp = new Date(creationDate).getTime();

    // Initial creation log
    logs.push({
        id: generateId(),
        timestamp: creationDate,
        action: 'Case Created',
        analystId: analystIds[0],
        analystName: analystNames[0],
        details: { caseId: caseId, initialStatus: 'New' },
    });

    // Simulate status changes
    const statuses: Array<ExtendedFraudCase['status']> = ['New', 'Investigating', 'Resolved', 'Dismissed'];
    let currentStatus = 'New';
    let currentTimestamp = initialTimestamp;

    for (let i = 0; i < getRandom(1, 3); i++) {
        const nextStatus = getRandomItem(statuses.filter(s => s !== currentStatus));
        currentTimestamp += getRandom(1, 7) * 24 * 60 * 60 * 1000; // Add 1-7 days
        if (currentTimestamp > Date.now()) break; // Don't generate future logs
        const analystIndex = getRandom(0, analystIds.length - 1);
        logs.push({
            id: generateId(),
            timestamp: new Date(currentTimestamp).toISOString(),
            action: 'Status Changed',
            analystId: analystIds[analystIndex],
            analystName: analystNames[analystIndex],
            details: { from: currentStatus, to: nextStatus },
        });
        currentStatus = nextStatus;
    }

    // Simulate analyst assignment
    if (Math.random() > 0.5) {
        currentTimestamp += getRandom(1, 3) * 24 * 60 * 60 * 1000;
        if (currentTimestamp < Date.now()) {
            const analystIndex = getRandom(0, analystIds.length - 1);
            logs.push({
                id: generateId(),
                timestamp: new Date(currentTimestamp).toISOString(),
                action: 'Analyst Assigned',
                analystId: analystIds[analystIndex],
                analystName: analystNames[analystIndex],
                details: { assignedTo: analystNames[analystIndex], analystId: analystIds[analystIndex] },
            });
        }
    }

    // Simulate other actions
    if (Math.random() > 0.4) {
        currentTimestamp += getRandom(1, 2) * 24 * 60 * 60 * 1000;
        if (currentTimestamp < Date.now()) {
            const analystIndex = getRandom(0, analystIds.length - 1);
            logs.push({
                id: generateId(),
                timestamp: new Date(currentTimestamp).toISOString(),
                action: 'Comment Added',
                analystId: analystIds[analystIndex],
                analystName: analystNames[analystIndex],
                details: { contentPreview: "Added initial findings." },
            });
        }
    }

    if (Math.random() > 0.6) {
        currentTimestamp += getRandom(1, 2) * 24 * 60 * 60 * 1000;
        if (currentTimestamp < Date.now()) {
            const analystIndex = getRandom(0, analystIds.length - 1);
            logs.push({
                id: generateId(),
                timestamp: new Date(currentTimestamp).toISOString(),
                action: 'Evidence Attached',
                analystId: analystIds[analystIndex],
                analystName: analystNames[analystIndex],
                details: { filename: "screenshot.png", type: "image/png" },
            });
        }
    }

    return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

/**
 * Generates a mock extended fraud case.
 */
export const generateMockExtendedFraudCase = (index: number, analysts: Analyst[], rules: FraudRule[]): ExtendedFraudCase => {
    const analystIds = analysts.map(a => a.id);
    const analystNames = analysts.map(a => a.name);
    const id = `CASE-${generateId().substring(0, 8).toUpperCase()}`;
    const timestamp = getRandomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date()); // Last 60 days
    const riskScore = getRandom(50, 99);
    const amount = parseFloat((Math.random() * 10000 + 100).toFixed(2));
    const status: ExtendedFraudCase['status'] = getRandomItem(['New', 'Investigating', 'Resolved', 'Dismissed']);
    const priority: ExtendedFraudCase['priority'] = getRandomItem(['Low', 'Medium', 'High', 'Critical']);
    const fraudType: ExtendedFraudCase['fraudType'] = getRandomItem([
        'Account Takeover', 'Synthetic ID', 'Chargeback Fraud', 'Friendly Fraud', 'Phishing', 'Mule Account', 'Refund Abuse'
    ]);
    const caseAnalyst = getRandomItem(analysts);

    const description = getRandomItem([
        'Multiple failed login attempts followed by a successful login from a new IP and device.',
        'High value transaction to a new merchant, inconsistent with past user behavior and geolocation.',
        'Customer claims unrecognized transaction on statement, potential card compromise or friendly fraud.',
        'Account created with suspicious personal details (e.g., disposable email), attempting large purchases immediately.',
        'Multiple small transactions rapidly, potentially card testing, followed by a large purchase.',
        'Large international wire transfer from a recently created account with unverified KYC.',
        'User complaint about unauthorized access to their email, leading to password reset and subsequent transactions.',
        'Suspicious pattern of gift card purchases followed by immediate redemption from a different region.',
        'Identity details used across multiple accounts, potential synthetic identity fraud or account farming.',
        'Repeated refund requests on digital goods without clear reason, potential refund abuse.',
        'Unusual spending pattern: sudden spike in luxury item purchases after prolonged inactivity.',
    ]);

    const transactionDetails = Array.from({ length: getRandom(1, 3) }).map(() => generateMockTransactionDetails(caseAnalyst.userId, timestamp));
    const userProfile = generateMockUserProfile(caseAnalyst.userId);
    const deviceFingerprint = generateMockDeviceFingerprint();

    // Link device fingerprint to user
    deviceFingerprint.associatedUserIds.push(userProfile.userId);

    const riskFactors: RiskFactorBreakdown = {
        ipVelocity: getRandom(10, 90),
        deviceVelocity: getRandom(10, 90),
        geoMismatch: getRandom(10, 90),
        amountThreshold: getRandom(10, 90),
        newAccount: getRandom(10, 90),
        suspiciousPattern: getRandom(10, 90),
        identityVerification: getRandom(10, 90),
        paymentMethodRisk: getRandom(10, 90),
        behavioralAnalytics: getRandom(10, 90),
        totalScore: riskScore,
    };

    const comments = generateMockComments(getRandom(0, 3), analystIds, analystNames);
    const attachments = generateMockAttachments(getRandom(0, 2), analystNames);
    const auditLog = generateMockAuditLog(id, analystIds, analystNames, timestamp);

    const resolved = status === 'Resolved' || status === 'Dismissed';
    const resolutionDate = resolved ? getRandomDate(new Date(new Date(timestamp).getTime() + 2 * 24 * 60 * 60 * 1000), new Date()) : undefined; // 2 days after creation
    const resolutionNotes = resolved ? getRandomItem([
        'Investigation complete. Funds recovered and account secured.',
        'Case dismissed due to insufficient evidence. Account placed under enhanced monitoring.',
        'Transaction confirmed as legitimate after user verification. False positive.',
        'User confirmed transaction was authorized after initial dispute, closed as friendly fraud.',
        'Account locked, fraudulent transactions reversed. User notified.',
        'Resolved after successfully challenging chargeback. Merchant protected.',
    ]) : undefined;

    const sourceRule = Math.random() > 0.5 ? getRandomItem(rules) : undefined;

    return {
        id: id,
        caseId: id,
        timestamp: timestamp,
        description: description,
        amount: amount,
        riskScore: riskScore,
        status: status,
        analystId: caseAnalyst.id,
        analystName: caseAnalyst.name,
        priority: priority,
        fraudType: fraudType,
        transactionDetails: transactionDetails,
        userProfile: userProfile,
        deviceFingerprint: deviceFingerprint,
        riskFactors: riskFactors,
        comments: comments,
        attachments: attachments,
        auditLog: auditLog,
        recommendedAction: riskScore > 80 ? 'Escalate to Senior Analyst for deeper investigation' : riskScore > 60 ? 'Review associated transactions and user activity' : 'Monitor account for further suspicious patterns',
        resolutionNotes: resolutionNotes,
        resolutionDate: resolutionDate,
        relatedCases: Array.from({ length: getRandom(0, 1) }).map(() => `CASE-${generateId().substring(0, 8).toUpperCase()}`),
        decisionHistory: auditLog
            .filter(log => log.action === 'Status Changed')
            .map(log => ({
                decidedBy: log.analystName,
                decidedAt: log.timestamp,
                decision: log.details.to === 'Investigating' ? 'Investigate' : log.details.to === 'Resolved' ? 'Resolve' : log.details.to === 'Dismissed' ? 'Dismiss' : 'Approve', // Add 'Approve' for initial acceptance
                reason: `Status changed from ${log.details.from} to ${log.details.to}`,
            })),
        lastUpdatedBy: caseAnalyst.name,
        lastUpdatedAt: new Date().toISOString(),
        sourceRuleId: sourceRule?.id,
        modelPredictionConfidence: parseFloat((Math.random() * (0.99 - 0.5) + 0.5).toFixed(2)), // 50-99% confidence
    };
};

/**
 * Generates mock analysts.
 */
export const generateMockAnalysts = (num: number): Analyst[] => {
    const roles: Analyst['role'][] = ['Junior Analyst', 'Senior Analyst', 'Lead Investigator', 'Admin'];
    const names = [
        'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Adams',
        'Frank White', 'Grace Hoppe', 'Harry Potter', 'Ivy Green', 'Jack Black',
        'Karen Miller', 'Liam Nelson', 'Mia Wilson', 'Noah Davis', 'Olivia Taylor'
    ];
    const teamNames = ['Blue Team', 'Red Team', 'Green Team', 'Yellow Team'];
    return Array.from({ length: num }).map((_, i) => ({
        id: `ANL-${i + 1}`,
        name: names[i % names.length],
        role: getRandomItem(roles),
        email: `analyst${i + 1}@megacorp.com`,
        assignedCases: [], // Filled dynamically if needed
        active: true,
        photoUrl: `https://i.pravatar.cc/150?img=${getRandom(1, 70)}`, // Mock avatar
        lastLogin: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        teamId: `TEAM-${getRandom(1, 4)}`,
        teamName: getRandomItem(teamNames),
    }));
};

/**
 * Generates mock fraud rules.
 */
export const generateMockFraudRules = (num: number, analysts: Analyst[]): FraudRule[] => {
    const conditions = [
        "transaction.amount > 5000 && transaction.ip.country != user.country",
        "user.accountAge < 7 days && transaction.count > 3 in 24h",
        "device.fingerprint.new && user.loginAttemptsFailed > 5",
        "paymentMethod == 'Bitcoin' && transaction.amount > 1000",
        "riskScore > 90",
        "user.reputationScore < 400 && user.kycStatus == 'Unverified'",
        "shippingAddress != billingAddress && transaction.geolocation.distance > 500km",
        "multiple credit cards used within 1 hour across different geographical locations",
        "chargeback rate for merchant exceeds 5%",
        "sequential transactions of identical amounts in short intervals",
        "transaction.productCategory == 'Gift Cards' && transaction.amount > 500",
        "user.lastLoginDate < 90 days ago && new_device_detected",
        "geolocation.city changed by > 500km in 10 minutes",
        "billingAddress.zipCode mismatch with card issuer region",
        "transaction.currency mismatch with user.country currency and large amount"
    ];
    const actions = ['Flag', 'Deny', 'Review', 'Escalate'];
    const severities = ['Low', 'Medium', 'High', 'Critical'];
    const statuses = ['Active', 'Inactive', 'Draft'];
    const tags = ['High-Value', 'IP-Risk', 'New-User', 'Card-Fraud', 'Account-Takeover', 'Geo-Anomaly'];
    const createdByAnalysts = analysts.map(a => a.name);

    return Array.from({ length: num }).map((_, i) => {
        const creator = getRandomItem(createdByAnalysts);
        const createdAt = getRandomDate(new Date(2022, 0, 1), new Date());
        const lastUpdatedBy = Math.random() > 0.3 ? getRandomItem(createdByAnalysts) : creator;
        const lastUpdatedAt = Math.random() > 0.3 ? getRandomDate(new Date(createdAt), new Date()) : createdAt;

        return {
            id: `RULE-${generateId().substring(0, 8).toUpperCase()}`,
            name: `Rule ${i + 1}: ${getRandomItem(['High Risk IP Geo', 'New Account Velocity', 'Suspicious Payment Method', 'High Risk Score Threshold', 'KYC & Reputation Check', 'Gift Card Abuse Detector'])}`,
            description: getRandomItem(conditions),
            status: getRandomItem(statuses),
            severity: getRandomItem(severities),
            condition: getRandomItem(conditions),
            action: getRandomItem(actions),
            createdBy: creator,
            createdAt: createdAt,
            lastUpdatedBy: lastUpdatedBy,
            lastUpdatedAt: lastUpdatedAt,
            hitCount: getRandom(10, 15000),
            falsePositiveRate: parseFloat((Math.random() * 0.1).toFixed(3)), // 0-10%
            falseNegativeRate: parseFloat((Math.random() * 0.05).toFixed(3)), // 0-5%
            priorityOrder: getRandom(1, 100),
            tags: Array.from({ length: getRandom(1, 3) }).map(() => getRandomItem(tags))
        };
    });
};

/**
 * Generates mock alert notifications.
 */
export const generateMockAlerts = (num: number, caseIds: string[]): AlertNotification[] => {
    const types = ['System', 'Rule Trigger', 'Manual', 'Anomaly'];
    const severities = ['Info', 'Warning', 'Critical'];
    const messages = [
        'New high-risk case detected. Risk score: 92.',
        'Rule "High Value International Transfer" triggered for TXN-12345.',
        'System anomaly detected in payment gateway transactions volume.',
        'Unusual login activity detected on multiple accounts from same IP range.',
        'Case status updated to "Investigating" by Alice Johnson.',
        'Attachment "proof_of_id.pdf" added to case by Bob Smith.',
        'High velocity of transactions from a new device fingerprint detected.',
        'Payment method changed on account USR-7890 after suspicious login attempt.',
        'Potential synthetic identity detected with multiple matching parameters.',
    ];
    const categories = ['Transaction', 'Login', 'Account', 'System'];

    return Array.from({ length: num }).map(() => ({
        id: generateId(),
        caseId: Math.random() > 0.3 ? getRandomItem(caseIds) : undefined,
        type: getRandomItem(types),
        message: getRandomItem(messages),
        severity: getRandomItem(severities),
        timestamp: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
        read: Math.random() > 0.5,
        actionTaken: Math.random() > 0.7 ? 'Reviewed' : undefined,
        category: getRandomItem(categories)
    }));
};

/**
 * Generates mock fraud trend data.
 */
export const generateMockFraudTrendData = (days: number): FraudTrendData[] => {
    const data: FraudTrendData[] = [];
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - days);

    for (let i = 0; i <= days; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + i);
        data.push({
            date: date.toISOString().split('T')[0],
            newCases: getRandom(10, 50),
            resolvedCases: getRandom(5, 40),
            amountFlagged: getRandom(5000, 50000),
            averageRiskScore: parseFloat(getRandom(60, 95).toFixed(2)),
            falsePositives: getRandom(1, 10)
        });
    }
    return data;
};

/**
 * Generates mock geographical fraud data.
 */
export const generateMockGeoFraudData = (): GeoFraudData[] => {
    return MOCK_CITIES.map(city => ({
        country: city.country,
        cases: getRandom(50, 500),
        amount: getRandom(10000, 500000),
        riskScore: parseFloat(getRandom(70, 90).toFixed(2)),
        coordinates: { latitude: city.lat, longitude: city.lon }
    }));
};

/**
 * Generates mock report definitions.
 */
export const generateMockReportDefinitions = (analysts: Analyst[]): ReportDefinition[] => {
    const analystNames = analysts.map(a => a.name);
    return [
        {
            id: 'RPT-001',
            name: 'Monthly Fraud Summary',
            description: 'Overview of fraud activities for the last month, including new cases, resolved cases, and total amount at risk.',
            type: 'summary',
            params: { timeframe: 'Last 30 days', severity: ['High', 'Critical'] },
            lastGenerated: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
            generatedBy: getRandomItem(analystNames),
            status: 'Generated',
            downloadLink: 'https://mockcdn.com/reports/monthly_summary.pdf',
        },
        {
            id: 'RPT-002',
            name: 'Quarterly Fraud Trends',
            description: 'Long-term trends of new cases, resolved cases, and average risk scores over the last quarter.',
            type: 'trend',
            params: { timeframe: 'Last 90 days' },
            lastGenerated: getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)),
            generatedBy: getRandomItem(analystNames),
            status: 'Generated',
            downloadLink: 'https://mockcdn.com/reports/quarterly_trends.pdf',
        },
        {
            id: 'RPT-003',
            name: 'Geographic Fraud Hotspots',
            description: 'Identification of top countries by fraud volume and amount, with average risk scores.',
            type: 'geographic',
            params: { topN: 10 },
            lastGenerated: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
            generatedBy: getRandomItem(analystNames),
            status: 'Generated',
            downloadLink: 'https://mockcdn.com/reports/geo_hotspots.pdf',
        },
        {
            id: 'RPT-004',
            name: 'High-Risk Transaction Breakdown',
            description: 'Detailed analysis of individual transactions with risk scores above a certain threshold.',
            type: 'custom',
            params: { minRiskScore: 80, limit: 100, fraudType: 'Account Takeover' },
            lastGenerated: getRandomDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), new Date()),
            generatedBy: getRandomItem(analystNames),
            status: 'Generated',
            downloadLink: 'https://mockcdn.com/reports/high_risk_txns.pdf',
        },
        {
            id: 'RPT-005',
            name: 'Rule Performance Metrics',
            description: 'Evaluation of fraud detection rules including hit count, false positive, and false negative rates.',
            type: 'performance',
            params: { timeframe: 'Last 30 days', ruleStatus: 'Active' },
            lastGenerated: getRandomDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), new Date()),
            generatedBy: getRandomItem(analystNames),
            status: 'Generated',
            downloadLink: 'https://mockcdn.com/reports/rule_performance.pdf',
        }
    ];
};

// --- MOCK DATA GENERATION (approx. 500-1000 lines for a good set) ---
// Generate a large set of mock data to simulate a real-world application.
// This data will be used throughout the expanded view.

const MOCK_ANALYSTS: Analyst[] = generateMockAnalysts(15);
const MOCK_FRAUD_RULES: FraudRule[] = generateMockFraudRules(70, MOCK_ANALYSTS);
const MOCK_EXTENDED_FRAUD_CASES: ExtendedFraudCase[] = Array.from({ length: 1200 }).map((_, i) => generateMockExtendedFraudCase(i, MOCK_ANALYSTS, MOCK_FRAUD_RULES));
const MOCK_ALERT_NOTIFICATIONS: AlertNotification[] = generateMockAlerts(250, MOCK_EXTENDED_FRAUD_CASES.map(c => c.id));
const MOCK_FRAUD_TREND_DATA: FraudTrendData[] = generateMockFraudTrendData(180); // Last 180 days
const MOCK_GEO_FRAUD_DATA: GeoFraudData[] = generateMockGeoFraudData();
const MOCK_REPORT_DEFINITIONS: ReportDefinition[] = generateMockReportDefinitions(MOCK_ANALYSTS);


// --- CONTEXT EXTENSION (conceptual for this file) ---
// In a real app, DataContext would be updated. Here, we'll simulate the richer data.
// We assume context.fraudCases actually contains ExtendedFraudCase data.
interface DataContextExtension {
    fraudCases: ExtendedFraudCase[];
    updateFraudCaseStatus: (id: string, status: FraudCase['status']) => void;
    // New functions to update extended data
    updateFraudCaseDetails: (id: string, updates: Partial<ExtendedFraudCase>) => void;
    addFraudCaseComment: (caseId: string, comment: Comment) => void;
    addFraudCaseAttachment: (caseId: string, attachment: Attachment) => void;
    updateFraudRule: (id: string, updates: Partial<FraudRule>) => void;
    addFraudRule: (rule: FraudRule) => void;
    deleteFraudRule: (id: string) => void;
    markAlertAsRead: (alertId: string) => void;
    deleteAlert: (alertId: string) => void;
    updateReportDefinition: (id: string, updates: Partial<ReportDefinition>) => void;
    addReportDefinition: (report: ReportDefinition) => void;
    deleteReportDefinition: (id: string) => void;
}

// Mock implementation of extended context functions
const useExtendedDataContext = (): DataContextExtension => {
    const baseContext = useContext(DataContext);
    if (!baseContext) throw new Error("FraudDetectionView must be within a DataProvider");

    // We're casting and enhancing the fraudCases provided by the base context.
    // In a real scenario, DataContext itself would provide the ExtendedFraudCase type.
    const [localFraudCases, setLocalFraudCases] = useState<ExtendedFraudCase[]>(MOCK_EXTENDED_FRAUD_CASES);
    const [localFraudRules, setLocalFraudRules] = useState<FraudRule[]>(MOCK_FRAUD_RULES);
    const [localAlerts, setLocalAlerts] = useState<AlertNotification[]>(MOCK_ALERT_NOTIFICATIONS);
    const [localReportDefinitions, setLocalReportDefinitions] = useState<ReportDefinition[]>(MOCK_REPORT_DEFINITIONS);


    const updateFraudCaseStatus = useCallback((id: string, status: FraudCase['status']) => {
        setLocalFraudCases(prevCases => prevCases.map(c => c.id === id ? { ...c, status, lastUpdatedAt: new Date().toISOString(), lastUpdatedBy: MOCK_ANALYSTS[0].name } : c));
        // Simulate adding to audit log
        const caseToUpdate = localFraudCases.find(c => c.id === id);
        if (caseToUpdate) {
            const analyst = MOCK_ANALYSTS[0]; // Assume first analyst for mock actions
            const newAuditLogEntry: AuditLogEntry = {
                id: generateId(),
                timestamp: new Date().toISOString(),
                action: 'Status Changed',
                analystId: analyst.id,
                analystName: analyst.name,
                details: { from: caseToUpdate.status, to: status },
            };
            setLocalFraudCases(prevCases => prevCases.map(c =>
                c.id === id ? { ...c, auditLog: [...c.auditLog, newAuditLogEntry] } : c
            ));
        }
    }, [localFraudCases]);

    const updateFraudCaseDetails = useCallback((id: string, updates: Partial<ExtendedFraudCase>) => {
        setLocalFraudCases(prevCases => prevCases.map(c => c.id === id ? { ...c, ...updates, lastUpdatedAt: new Date().toISOString(), lastUpdatedBy: MOCK_ANALYSTS[0].name } : c));
        const caseToUpdate = localFraudCases.find(c => c.id === id);
        if (caseToUpdate) {
            const analyst = MOCK_ANALYSTS[0];
            const newAuditLogEntry: AuditLogEntry = {
                id: generateId(),
                timestamp: new Date().toISOString(),
                action: 'Case Details Updated',
                analystId: analyst.id,
                analystName: analyst.name,
                details: { updatedFields: Object.keys(updates) },
            };
            setLocalFraudCases(prevCases => prevCases.map(c =>
                c.id === id ? { ...c, auditLog: [...c.auditLog, newAuditLogEntry] } : c
            ));
        }
    }, [localFraudCases]);

    const addFraudCaseComment = useCallback((caseId: string, comment: Comment) => {
        setLocalFraudCases(prevCases => prevCases.map(c =>
            c.id === caseId ? { ...c, comments: [...c.comments, comment], lastUpdatedAt: new Date().toISOString(), lastUpdatedBy: MOCK_ANALYSTS[0].name } : c
        ));
        const analyst = MOCK_ANALYSTS.find(a => a.id === comment.analystId) || MOCK_ANALYSTS[0];
        const newAuditLogEntry: AuditLogEntry = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            action: 'Comment Added',
            analystId: analyst.id,
            analystName: analyst.name,
            details: { commentId: comment.id, contentPreview: comment.content.substring(0, 50) + '...' },
        };
        setLocalFraudCases(prevCases => prevCases.map(c =>
            c.id === caseId ? { ...c, auditLog: [...c.auditLog, newAuditLogEntry] } : c
        ));
    }, []);

    const addFraudCaseAttachment = useCallback((caseId: string, attachment: Attachment) => {
        setLocalFraudCases(prevCases => prevCases.map(c =>
            c.id === caseId ? { ...c, attachments: [...c.attachments, attachment], lastUpdatedAt: new Date().toISOString(), lastUpdatedBy: MOCK_ANALYSTS[0].name } : c
        ));
        const analyst = MOCK_ANALYSTS.find(a => a.name === attachment.uploadedBy) || MOCK_ANALYSTS[0];
        const newAuditLogEntry: AuditLogEntry = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            action: 'Attachment Added',
            analystId: analyst.id,
            analystName: analyst.name,
            details: { filename: attachment.filename, fileType: attachment.fileType },
        };
        setLocalFraudCases(prevCases => prevCases.map(c =>
            c.id === caseId ? { ...c, auditLog: [...c.auditLog, newAuditLogEntry] } : c
        ));
    }, []);

    const updateFraudRule = useCallback((id: string, updates: Partial<FraudRule>) => {
        setLocalFraudRules(prevRules => prevRules.map(r => r.id === id ? { ...r, ...updates, lastUpdatedAt: new Date().toISOString(), lastUpdatedBy: MOCK_ANALYSTS[0].name } : r));
    }, []);

    const addFraudRule = useCallback((rule: FraudRule) => {
        setLocalFraudRules(prevRules => [...prevRules, { ...rule, id: `RULE-${generateId().substring(0, 8).toUpperCase()}`, createdAt: new Date().toISOString(), createdBy: MOCK_ANALYSTS[0].name, lastUpdatedAt: new Date().toISOString(), lastUpdatedBy: MOCK_ANALYSTS[0].name, hitCount: 0 }]);
    }, []);

    const deleteFraudRule = useCallback((id: string) => {
        setLocalFraudRules(prevRules => prevRules.filter(r => r.id !== id));
    }, []);

    const markAlertAsRead = useCallback((alertId: string) => {
        setLocalAlerts(prevAlerts => prevAlerts.map(a => a.id === alertId ? { ...a, read: true } : a));
    }, []);

    const deleteAlert = useCallback((alertId: string) => {
        setLocalAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alertId));
    }, []);

    const updateReportDefinition = useCallback((id: string, updates: Partial<ReportDefinition>) => {
        setLocalReportDefinitions(prevReports => prevReports.map(r => r.id === id ? { ...r, ...updates } : r));
    }, []);

    const addReportDefinition = useCallback((report: ReportDefinition) => {
        setLocalReportDefinitions(prevReports => [...prevReports, { ...report, id: `RPT-${generateId().substring(0, 8).toUpperCase()}`, generatedBy: MOCK_ANALYSTS[0].name, lastGenerated: new Date().toISOString(), status: 'Generated' }]);
    }, []);

    const deleteReportDefinition = useCallback((id: string) => {
        setLocalReportDefinitions(prevReports => prevReports.filter(r => r.id !== id));
    }, []);

    useEffect(() => {
        // This effect makes sure that if the original DataContext's fraudCases were to change,
        // our local state would update. For this exercise, it will just initialize.
        if (baseContext.fraudCases.length === 0) {
            // This branch is unlikely to be hit if DataContext itself has mock data.
            // We'll rely on localFraudCases as the primary source for this heavily extended view.
        }
    }, [baseContext.fraudCases]);


    return {
        fraudCases: localFraudCases,
        updateFraudCaseStatus,
        updateFraudCaseDetails,
        addFraudCaseComment,
        addFraudCaseAttachment,
        updateFraudRule,
        addFraudRule,
        deleteFraudRule,
        markAlertAsRead,
        deleteAlert,
        updateReportDefinition,
        addReportDefinition,
        deleteReportDefinition,
    };
};

// --- REUSABLE UI COMPONENTS (approx. 100-200 lines each, many components) ---

/**
 * @typedef {Object} StatusBadgeProps
 * @property {FraudCase['status']} status - The status of the fraud case.
 */
export const StatusBadge: React.FC<{ status: FraudCase['status'] }> = ({ status }) => {
    const colors = {
        'New': 'bg-red-500/20 text-red-300',
        'Investigating': 'bg-yellow-500/20 text-yellow-300',
        'Resolved': 'bg-green-500/20 text-green-300',
        'Dismissed': 'bg-gray-500/20 text-gray-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
};

/**
 * @typedef {Object} PriorityBadgeProps
 * @property {ExtendedFraudCase['priority']} priority - The priority of the fraud case.
 */
export const PriorityBadge: React.FC<{ priority: ExtendedFraudCase['priority'] }> = ({ priority }) => {
    const colors = {
        'Low': 'bg-green-600/20 text-green-400',
        'Medium': 'bg-blue-600/20 text-blue-400',
        'High': 'bg-orange-600/20 text-orange-400',
        'Critical': 'bg-red-600/20 text-red-400',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority]}`}>{priority}</span>;
};

/**
 * @typedef {Object} LoadingSpinnerProps
 * @property {string} [message='Loading...'] - Message to display while loading.
 */
export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
    <div className="flex items-center justify-center p-4">
        <svg className="animate-spin h-5 w-5 mr-3 text-cyan-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-gray-400">{message}</span>
    </div>
);

/**
 * @typedef {Object} ErrorMessageProps
 * @property {string} message - The error message to display.
 */
export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-900/30 text-red-300 p-4 rounded border border-red-800 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span>Error: {message}</span>
    </div>
);

/**
 * A tab navigation component.
 * @typedef {Object} TabsProps
 * @property {string[]} tabs - Array of tab titles.
 * @property {string} activeTab - The currently active tab title.
 * @property {(tab: string) => void} onTabChange - Callback when a tab is clicked.
 */
export const Tabs: React.FC<{ tabs: string[]; activeTab: string; onTabChange: (tab: string) => void }> = ({ tabs, activeTab, onTabChange }) => (
    <div className="flex border-b border-gray-700 mb-4 -mx-4 px-4">
        {tabs.map(tab => (
            <button
                key={tab}
                className={`py-2 px-4 -mb-px border-b-2 text-sm font-medium focus:outline-none transition duration-150 ease-in-out ${
                    activeTab === tab
                        ? 'border-cyan-500 text-cyan-400'
                        : 'border-transparent text-gray-500 hover:text-gray-200 hover:border-gray-500'
                }`}
                onClick={() => onTabChange(tab)}
            >
                {tab}
            </button>
        ))}
    </div>
);


// --- NEW COMPONENT: CASE DETAILS MODAL (approx. 500-1000 lines, very detailed) ---
/**
 * FraudCaseDetailModalProps interface defines the props for the FraudCaseDetailModal component.
 * @typedef {Object} FraudCaseDetailModalProps
 * @property {ExtendedFraudCase} fraudCase - The fraud case to display details for.
 * @property {() => void} onClose - Callback function to close the modal.
 * @property {(id: string, status: FraudCase['status']) => void} onUpdateStatus - Callback to update case status.
 * @property {(id: string, updates: Partial<ExtendedFraudCase>) => void} onUpdateDetails - Callback to update case details.
 * @property {(caseId: string, comment: Comment) => void} onAddComment - Callback to add a new comment.
 * @property {(caseId: string, attachment: Attachment) => void} onAddAttachment - Callback to add a new attachment.
 * @property {string} aiSummary - The AI generated summary for the case.
 * @property {boolean} isSummaryLoading - Loading state for AI summary.
 * @property {(fraudCase: FraudCase) => Promise<void>} getAiSummary - Function to fetch AI summary.
 * @property {Analyst[]} analysts - List of available analysts for assignment.
 * @property {(caseItem: ExtendedFraudCase) => void} onOpenRelatedCase - Callback to open a related case in the modal.
 */
interface FraudCaseDetailModalProps {
    fraudCase: ExtendedFraudCase;
    onClose: () => void;
    onUpdateStatus: (id: string, status: FraudCase['status']) => void;
    onUpdateDetails: (id: string, updates: Partial<ExtendedFraudCase>) => void;
    onAddComment: (caseId: string, comment: Comment) => void;
    onAddAttachment: (caseId: string, attachment: Attachment) => void;
    aiSummary: string;
    isSummaryLoading: boolean;
    getAiSummary: (fraudCase: FraudCase) => Promise<void>;
    analysts: Analyst[];
    onOpenRelatedCase: (caseItem: ExtendedFraudCase) => void; // Added for opening related cases
}

export const FraudCaseDetailModal: React.FC<FraudCaseDetailModalProps> = ({
    fraudCase,
    onClose,
    onUpdateStatus,
    onUpdateDetails,
    onAddComment,
    onAddAttachment,
    aiSummary,
    isSummaryLoading,
    getAiSummary,
    analysts,
    onOpenRelatedCase,
}) => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [newCommentText, setNewCommentText] = useState('');
    const [newAttachmentFile, setNewAttachmentFile] = useState<File | null>(null);
    const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
    const [isUpdatingCase, setIsUpdatingCase] = useState(false);
    const [selectedAnalystId, setSelectedAnalystId] = useState(fraudCase.analystId || '');

    // Current user for mock actions (assume first analyst is logged in)
    const currentUser = MOCK_ANALYSTS[0];

    useEffect(() => {
        // Automatically fetch AI summary when case changes
        getAiSummary(fraudCase);
        setSelectedAnalystId(fraudCase.analystId || ''); // Reset analyst selection
        setActiveTab('Overview'); // Reset tab when case changes
    }, [fraudCase, getAiSummary]);

    const handleStatusUpdate = async (status: FraudCase['status']) => {
        setIsUpdatingCase(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            onUpdateStatus(fraudCase.id, status);
            // Optionally, add a decision history entry
            onUpdateDetails(fraudCase.id, {
                decisionHistory: [
                    ...(fraudCase.decisionHistory || []),
                    {
                        decidedBy: currentUser.name,
                        decidedAt: new Date().toISOString(),
                        decision: status === 'Investigating' ? 'Investigate' : status === 'Resolved' ? 'Resolve' : 'Dismiss',
                        reason: `Status manually changed to ${status}`,
                    }
                ]
            });
        } finally {
            setIsUpdatingCase(false);
        }
    };

    const handleAddComment = async () => {
        if (!newCommentText.trim()) return;
        const newComment: Comment = {
            id: generateId(),
            analystId: currentUser.id,
            analystName: currentUser.name,
            timestamp: new Date().toISOString(),
            content: newCommentText.trim(),
        };
        setIsUpdatingCase(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
            onAddComment(fraudCase.id, newComment);
            setNewCommentText('');
        } finally {
            setIsUpdatingCase(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setNewAttachmentFile(event.target.files[0]);
        }
    };

    const handleUploadAttachment = async () => {
        if (!newAttachmentFile) return;

        setIsUploadingAttachment(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate file upload
            const newAttachment: Attachment = {
                id: generateId(),
                filename: newAttachmentFile.name,
                fileType: newAttachmentFile.type,
                url: `https://mock-cdn.com/${generateId()}/${newAttachmentFile.name}`,
                uploadedBy: currentUser.name,
                uploadedAt: new Date().toISOString(),
            };
            onAddAttachment(fraudCase.id, newAttachment);
            setNewAttachmentFile(null);
        } finally {
            setIsUploadingAttachment(false);
        }
    };

    const handleAnalystAssignment = async () => {
        if (selectedAnalystId === fraudCase.analystId) return; // No change
        const assignedAnalyst = analysts.find(a => a.id === selectedAnalystId);
        if (assignedAnalyst) {
            setIsUpdatingCase(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                onUpdateDetails(fraudCase.id, {
                    analystId: assignedAnalyst.id,
                    analystName: assignedAnalyst.name,
                });
            } finally {
                setIsUpdatingCase(false);
            }
        }
    };

    const OverviewTab: React.FC = () => (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-2">Case Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Case ID:</span> <span className="text-white">{fraudCase.caseId}</span></div>
                <div><span className="text-gray-400">Timestamp:</span> <span className="text-white">{formatDate(fraudCase.timestamp)}</span></div>
                <div><span className="text-gray-400">Amount:</span> <span className="text-white">{formatCurrency(fraudCase.amount)}</span></div>
                <div><span className="text-gray-400">Risk Score:</span> <span className={`font-mono ${getRiskScoreColor(fraudCase.riskScore)}`}>{fraudCase.riskScore}</span></div>
                <div><span className="text-gray-400">Status:</span> <StatusBadge status={fraudCase.status} /></div>
                <div><span className="text-gray-400">Priority:</span> <PriorityBadge priority={fraudCase.priority} /></div>
                <div><span className="text-gray-400">Fraud Type:</span> <span className="text-white">{fraudCase.fraudType}</span></div>
                <div><span className="text-gray-400">Model Confidence:</span> <span className="text-white">{fraudCase.modelPredictionConfidence ? `${(fraudCase.modelPredictionConfidence * 100).toFixed(1)}%` : 'N/A'}</span></div>
                <div><span className="text-gray-400">Last Updated:</span> <span className="text-white">{fraudCase.lastUpdatedAt ? formatDate(fraudCase.lastUpdatedAt) : 'N/A'} by {fraudCase.lastUpdatedBy || 'System'}</span></div>
                <div><span className="text-gray-400">Assigned Analyst:</span>
                    <select
                        className="bg-gray-700 border border-gray-600 text-white text-xs rounded-lg p-1 ml-2 focus:ring-cyan-500 focus:border-cyan-500"
                        value={selectedAnalystId}
                        onChange={(e) => setSelectedAnalystId(e.target.value)}
                        onBlur={handleAnalystAssignment} // Save on blur
                        disabled={isUpdatingCase}
                    >
                        <option value="">Unassigned</option>
                        {analysts.map(analyst => (
                            <option key={analyst.id} value={analyst.id}>{analyst.name} ({analyst.role})</option>
                        ))}
                    </select>
                    {isUpdatingCase && <span className="text-cyan-400 ml-2">Updating...</span>}
                </div>
            </div>
            <p className="text-gray-300 mt-4">{fraudCase.description}</p>

            <Card title="AI Summary & Recommended Actions" className="mt-4">
                {isSummaryLoading ? <LoadingSpinner message="Generating AI summary..." /> : (
                    <>
                        <p className="text-sm text-gray-300 whitespace-pre-line mb-2">{aiSummary || "No AI summary available."}</p>
                        {fraudCase.recommendedAction && (
                            <div className="text-sm text-cyan-300 mt-2 p-2 bg-gray-900 rounded-md border border-gray-700">
                                <strong>AI Recommendation:</strong> {fraudCase.recommendedAction}
                            </div>
                        )}
                    </>
                )}
            </Card>

            <h4 className="text-lg font-semibold text-white mt-6 mb-2">Key Risk Factors Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-300">
                {Object.entries(fraudCase.riskFactors).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                        <span className="font-medium mr-2">{capitalize(key.replace(/([A-Z])/g, ' $1'))}:</span>
                        <span className={`${getRiskScoreColor(value)} font-mono`}>{value}</span>
                    </div>
                ))}
            </div>

            {fraudCase.resolutionNotes && (
                <Card title="Resolution Details" className="mt-4 bg-green-900/10 border-green-800">
                    <p className="text-sm text-green-300">{fraudCase.resolutionNotes}</p>
                    <p className="text-xs text-green-500 mt-2">Resolved on: {formatDate(fraudCase.resolutionDate!)} by {fraudCase.decisionHistory?.[0]?.decidedBy || 'System'}</p>
                </Card>
            )}

            <h4 className="text-lg font-semibold text-white mt-6 mb-2">Case Actions</h4>
            <div className="flex gap-2 flex-wrap">
                <button onClick={() => handleStatusUpdate('Investigating')} disabled={isUpdatingCase || fraudCase.status === 'Investigating'} className="text-sm px-3 py-1 bg-yellow-600/50 hover:bg-yellow-600 rounded disabled:opacity-50">
                    {isUpdatingCase && fraudCase.status === 'Investigating' ? 'Updating...' : 'Set Investigating'}
                </button>
                <button onClick={() => handleStatusUpdate('Resolved')} disabled={isUpdatingCase || fraudCase.status === 'Resolved'} className="text-sm px-3 py-1 bg-green-600/50 hover:bg-green-600 rounded disabled:opacity-50">
                    {isUpdatingCase && fraudCase.status === 'Resolved' ? 'Updating...' : 'Mark Resolved'}
                </button>
                <button onClick={() => handleStatusUpdate('Dismissed')} disabled={isUpdatingCase || fraudCase.status === 'Dismissed'} className="text-sm px-3 py-1 bg-gray-600/50 hover:bg-gray-600 rounded disabled:opacity-50">
                    {isUpdatingCase && fraudCase.status === 'Dismissed' ? 'Updating...' : 'Dismiss Case'}
                </button>
                <button onClick={() => onUpdateDetails(fraudCase.id, { priority: getRandomItem(['Low', 'Medium', 'High', 'Critical']) })} className="text-sm px-3 py-1 bg-purple-600/50 hover:bg-purple-600 rounded">
                    Random Priority
                </button>
            </div>
            {fraudCase.relatedCases && fraudCase.relatedCases.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-lg font-semibold text-white mb-2">Related Cases</h4>
                    <div className="flex flex-wrap gap-2">
                        {fraudCase.relatedCases.map(relatedCaseId => (
                            <button
                                key={relatedCaseId}
                                onClick={() => {
                                    const relatedCase = MOCK_EXTENDED_FRAUD_CASES.find(c => c.id === relatedCaseId);
                                    if (relatedCase) onOpenRelatedCase(relatedCase);
                                }}
                                className="text-sm px-3 py-1 bg-blue-600/50 hover:bg-blue-600 rounded text-white"
                            >
                                {relatedCaseId}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const TransactionsTab: React.FC = () => (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-2">Associated Transactions ({fraudCase.transactionDetails.length})</h4>
            {fraudCase.transactionDetails.length === 0 ? (
                <p className="text-gray-500">No associated transactions found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-4 py-2">ID</th>
                                <th scope="col" className="px-4 py-2">Amount</th>
                                <th scope="col" className="px-4 py-2">Merchant</th>
                                <th scope="col" className="px-4 py-2">Method</th>
                                <th scope="col" className="px-4 py-2">Risk</th>
                                <th scope="col" className="px-4 py-2">IP</th>
                                <th scope="col" className="px-4 py-2">Geo</th>
                                <th scope="col" className="px-4 py-2">Status</th>
                                <th scope="col" className="px-4 py-2">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fraudCase.transactionDetails.map((tx, idx) => (
                                <tr key={tx.transactionId} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-4 py-2 font-medium text-white">{tx.transactionId}</td>
                                    <td className="px-4 py-2 font-mono">{formatCurrency(tx.amount, tx.currency)}</td>
                                    <td className="px-4 py-2">{tx.merchantName}</td>
                                    <td className="px-4 py-2">{tx.paymentMethod}</td>
                                    <td className={`px-4 py-2 font-mono ${getRiskScoreColor(tx.riskScore)}`}>{tx.riskScore}</td>
                                    <td className="px-4 py-2">{tx.ipAddress}</td>
                                    <td className="px-4 py-2">{tx.geolocation.city}, {tx.geolocation.country}</td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs font-medium rounded-full ${tx.status === 'Approved' ? 'bg-green-500/20 text-green-300' : tx.status === 'Declined' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{tx.status}</span></td>
                                    <td className="px-4 py-2 text-xs">{formatDate(tx.timestamp)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <h4 className="text-lg font-semibold