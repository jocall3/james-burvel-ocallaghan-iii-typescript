// components/views/platform/DemoBankEventGridView.tsx
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useRef, useReducer } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// --- GLOBAL CONSTANTS & CONFIGURATION ---
const EVENT_STREAM_INTERVAL_MS = 3000;
const MAX_EVENTS_IN_VIEW = 500;
const PAGINATION_PAGE_SIZE = 25;
const NOTIFICATION_DISPLAY_TIME_MS = 5000;
const AUDIT_LOG_RETENTION_DAYS = 90;
const AI_MODEL_NAME = 'gemini-2.5-flash';

// --- UTILITY FUNCTIONS ---
export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: Date, includeTime: boolean = true): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(includeTime && { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function getUniqueId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

export function deepClone<T>(obj: T): T {
    // A simple deep clone, might not handle all types (e.g., functions, complex objects)
    return JSON.parse(JSON.stringify(obj));
}

export function getEventSeverityColor(severity: EventSeverity): string {
    switch (severity) {
        case EventSeverity.Critical: return 'text-red-500 bg-red-900/20';
        case EventSeverity.High: return 'text-orange-500 bg-orange-900/20';
        case EventSeverity.Medium: return 'text-yellow-500 bg-yellow-900/20';
        case EventSeverity.Low: return 'text-green-500 bg-green-900/20';
        default: return 'text-gray-400 bg-gray-700/20';
    }
}

export function getEventStatusColor(status: EventStatus): string {
    switch (status) {
        case EventStatus.Pending: return 'text-yellow-500 bg-yellow-900/20';
        case EventStatus.Processed: return 'text-green-500 bg-green-900/20';
        case EventStatus.Failed: return 'text-red-500 bg-red-900/20';
        case EventStatus.Acknowledged: return 'text-blue-500 bg-blue-900/20';
        case EventStatus.Resolved: return 'text-green-600 bg-green-900/20';
        case EventStatus.Warning: return 'text-orange-500 bg-orange-900/20';
        case EventStatus.Info: return 'text-gray-400 bg-gray-700/20';
        default: return 'text-gray-400 bg-gray-700/20';
    }
}


// --- ENUMS & INTERFACES ---

export enum EventCategory {
    Transaction = 'Transaction',
    Security = 'Security',
    AccountManagement = 'AccountManagement',
    System = 'System',
    Compliance = 'Compliance',
    Marketing = 'Marketing',
    Login = 'Login',
    Fraud = 'Fraud'
}

export enum EventType {
    // Transaction events
    Deposit = 'Deposit',
    Withdrawal = 'Withdrawal',
    Transfer = 'Transfer',
    PaymentIn = 'PaymentIn',
    PaymentOut = 'PaymentOut',
    BillPay = 'BillPay',
    Purchase = 'Purchase',
    Refund = 'Refund',
    FeeCharged = 'FeeCharged',

    // Security events
    LoginSuccess = 'LoginSuccess',
    LoginFailure = 'LoginFailure',
    PasswordChange = 'PasswordChange',
    TwoFactorAuthAttempt = 'TwoFactorAuthAttempt',
    SecurityAlert = 'SecurityAlert',
    IPAddressChange = 'IPAddressChange',
    DeviceEnrollment = 'DeviceEnrollment',
    SessionTimeout = 'SessionTimeout',

    // Account Management events
    AccountOpened = 'AccountOpened',
    AccountClosed = 'AccountClosed',
    ProfileUpdate = 'ProfileUpdate',
    AddressChange = 'AddressChange',
    CardIssued = 'CardIssued',
    CardBlocked = 'CardBlocked',
    StatementGenerated = 'StatementGenerated',
    CreditLimitChange = 'CreditLimitChange',
    LoanApplication = 'LoanApplication',

    // System events
    SystemMaintenance = 'SystemMaintenance',
    APILimitExceeded = 'APILimitExceeded',
    ServiceDegradation = 'ServiceDegradation',
    DataExport = 'DataExport',
    DatabaseError = 'DatabaseError',
    CacheInvalidation = 'CacheInvalidation',

    // Compliance events
    KYCReviewNeeded = 'KYCReviewNeeded',
    AMLFlagged = 'AMLFlagged',
    RegulatoryReportGenerated = 'RegulatoryReportGenerated',
    SanctionScreeningHit = 'SanctionScreeningHit',

    // Marketing events
    OfferAccepted = 'OfferAccepted',
    ProductApplication = 'ProductApplication',
    NewsletterSubscription = 'NewsletterSubscription',

    // Fraud events
    PotentialFraudAlert = 'PotentialFraudAlert',
    TransactionReviewRequired = 'TransactionReviewRequired',
    ChargebackInitiated = 'ChargebackInitiated',
    FraudCaseOpened = 'FraudCaseOpened'
}

export enum EventSeverity {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical',
    Informational = 'Informational'
}

export enum EventStatus {
    Pending = 'Pending',
    Processed = 'Processed',
    Failed = 'Failed',
    Acknowledged = 'Acknowledged',
    Resolved = 'Resolved',
    Warning = 'Warning',
    Info = 'Info',
    Canceled = 'Canceled',
    Completed = 'Completed'
}

export interface BankEventData {
    amount?: number;
    currency?: string;
    fromAccount?: string;
    toAccount?: string;
    beneficiary?: string;
    merchant?: string;
    description?: string;
    loginAttemptIp?: string;
    userId?: string;
    accountId?: string;
    deviceId?: string;
    fraudScore?: number;
    reason?: string;
    details?: string;
    oldValue?: string;
    newValue?: string;
    statusDetail?: string;
    channel?: 'Web' | 'Mobile' | 'API' | 'Branch' | 'ATM' | 'POS';
    transactionId?: string;
    sessionDuration?: number; // for login events
    geographicalLocation?: string;
    cardType?: 'Visa' | 'MasterCard' | 'Amex' | 'Discover';
    lastFourDigits?: string;
    documentType?: 'ID' | 'Passport' | 'DriverLicense';
    serviceImpact?: 'None' | 'Partial' | 'Full';
    riskScore?: number;
    targetSystem?: string;
    complianceRuleId?: string;
    marketingCampaignId?: string;
}

export interface BankEvent {
    id: string;
    timestamp: Date;
    category: EventCategory;
    type: EventType;
    severity: EventSeverity;
    status: EventStatus;
    source: string; // e.g., 'Payments API', 'Auth Service', 'Core Banking'
    metadata: BankEventData;
    correlationId?: string; // Link related events
    tags: string[]; // e.g., 'critical', 'high-value', 'suspicious'
    isAcknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgmentTime?: Date;
    notes: EventNote[]; // For audit/investigation
}

export interface EventNote {
    id: string;
    timestamp: Date;
    userId: string;
    content: string;
}

export interface AdvancedFilter {
    key: string; // e.g., "metadata.amount", "type", "severity"
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty';
    value: string | number | boolean | null;
}

export interface EventFilter {
    subjectBeginsWith?: string; // For broad type matching, e.g., 'transaction.'
    category?: EventCategory[];
    type?: EventType[];
    severity?: EventSeverity[];
    status?: EventStatus[];
    source?: string[];
    minAmount?: number;
    maxAmount?: number;
    startDate?: Date;
    endDate?: Date;
    searchText?: string; // Full-text search across various fields
    userId?: string;
    accountId?: string;
    fraudFlagged?: boolean; // Convenience flag for fraud-related events
    advancedFilters?: AdvancedFilter[]; // For dynamic AI-generated or complex filters
    tags?: string[];
    isAcknowledged?: boolean;
}

export interface SortConfig {
    key: keyof BankEvent | `metadata.${keyof BankEventData}` | 'timestamp';
    direction: 'asc' | 'desc';
}

export interface PaginationConfig {
    currentPage: number;
    pageSize: number;
    totalItems: number;
}

export interface AlertRule {
    id: string;
    name: string;
    description: string;
    criteria: EventFilter; // Reuse event filter structure for alert conditions
    targetSeverity: EventSeverity;
    action: 'notify_email' | 'notify_sms' | 'create_ticket' | 'trigger_fraud_review' | 'escalate_to_team';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastTriggered?: Date;
    triggerCount: number;
    cooldownPeriodMinutes?: number; // How long to wait before triggering the same rule again for similar events
    notificationRecipients: string[]; // e.g., email addresses, user IDs
}

export interface ActiveAlert {
    id: string;
    ruleId: string;
    eventId: string;
    timestamp: Date;
    message: string;
    severity: EventSeverity;
    isResolved: boolean;
    resolvedBy?: string;
    resolvedAt?: Date;
    notes: string[]; // Additional notes for the specific alert instance
}

export interface UserActivity {
    id: string;
    timestamp: Date;
    userId: string;
    