import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../../Card';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
    PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

// --- MOCK DATA GENERATION UTILITIES ---
// This section is designed to simulate a real backend feeding data for a complex application.
// In a real-world application, these would be API calls to a robust backend service.

/**
 * Generates a random floating-point number within a specified range.
 * @param min - The minimum value (inclusive).
 * @param max - The maximum value (exclusive).
 * @returns A random floating-point number.
 */
const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

/**
 * Generates a random integer within a specified range.
 * @param min - The minimum value (inclusive).
 * @param max - The maximum value (exclusive).
 * @returns A random integer.
 */
const getRandomInt = (min: number, max: number) => Math.floor(getRandom(min, max));

/**
 * Formats a large number (e.g., 1,250,000) into a more readable string (e.g., "1.25M").
 * @param num - The number to format.
 * @returns The formatted string.
 */
const formatLargeNumber = (num: number): string => {
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1)}k`;
    }
    return num.toLocaleString();
};

// --- MOCK DATA INTERFACE DEFINITIONS ---
// These interfaces define the structure of the data expected by various components.
// They are crucial for type safety and understanding the data model in a large application.

/**
 * Represents a summary of communication metrics for a specific channel.
 */
interface CommunicationSummary {
    channel: string;
    sent: number;
    delivered: number;
    failed: number;
    openRate?: number; // Specific to email
    clickRate?: number; // Specific to email
    optOutRate?: number; // Applicable to email/SMS
}

/**
 * Represents daily communication metrics across different channels.
 */
interface DailyMetric {
    date: string; // YYYY-MM-DD
    emailSent: number;
    smsSent: number;
    voiceMinutes: number;
    emailDelivered: number;
    smsDelivered: number;
}

/**
 * Represents a marketing or transactional communication campaign.
 */
interface Campaign {
    id: string;
    name: string;
    status: 'Scheduled' | 'Active' | 'Completed' | 'Draft' | 'Paused';
    channel: 'Email' | 'SMS' | 'Voice' | 'Multi-Channel';
    startDate: string; // ISO Date String
    endDate: string; // ISO Date String
    targetAudience: string; // Description of the target segment
    totalSent: number;
    delivered: number;
    openRate?: number; // For email campaigns
    clickRate?: number; // For email campaigns
    cost: number; // Estimated or actual cost
    creator: string; // User who created the campaign
    lastModified: string;
}

/**
 * Represents a reusable communication template.
 */
interface Template {
    id: string;
    name: string;
    channel: 'Email' | 'SMS' | 'Voice';
    subject?: string; // For email templates
    previewText: string; // Short text preview
    contentHtml?: string; // Actual HTML content for email (mocked)
    contentText?: string; // Plain text content for SMS/Voice (mocked)
    lastModified: string;
    version: number;
    status: 'Active' | 'Archived' | 'Draft';
    category: string;
    tags: string[]; // e.g., ['promotional', 'transactional', 'onboarding']
    createdBy: string;
}

/**
 * Represents an audience segment used for targeting communications.
 */
interface AudienceSegment {
    id: string;
    name: string;
    description: string;
    criteria: string[]; // e.g., ['age > 30', 'account_type = premium']
    memberCount: number;
    lastUpdated: string;
    createdBy: string;
    isDynamic: boolean; // Whether the segment updates automatically
}

/**
 * Represents a single entry in the system's audit log.
 */
interface AuditLogEntry {
    id: string;
    timestamp: string;
    user: string;
    action: string; // e.g., 'Created Campaign', 'Updated Template'
    details: string; // More descriptive information
    entityType?: string; // e.g., 'Campaign', 'Template'
    entityId?: string;
    ipAddress?: string; // For security auditing
}

/**
 * Represents the configuration settings for a communication channel gateway.
 */
interface ChannelConfiguration {
    id: string;
    name: string;
    type: 'Email' | 'SMS' | 'Voice';
    status: 'Active' | 'Inactive' | 'Pending';
    provider: string; // e.g., 'SendGrid', 'Twilio'
    apiKeyPreview: string; // Masked API key
    dailyLimit: number;
    currentDailyUsage: number;
    lastTested: string; // Timestamp of last successful test
    settings: { [key: string]: string | number | boolean }; // Provider-specific settings
}

/**
 * Represents a monthly summary of communication costs.
 */
interface CostSummary {
    month: string;
    emailCost: number;
    smsCost: number;
    voiceCost: number;
    totalCost: number;
    currency: string;
}

/**
 * Represents a configurable alert rule for monitoring communication metrics.
 */
interface AlertRule {
    id: string;
    name: string;
    metric: string; // e.g., 'emailDeliverability', 'smsFailureRate'
    threshold: number;
    operator: 'gt' | 'lt' | 'eq'; // greater than, less than, equals
    channel: 'email' | 'sms' | 'dashboard' | 'slack'; // Notification channel
    status: 'Active' | 'Inactive';
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    lastTriggered?: string;
    description: string;
}

/**
 * Represents a user profile within the communication platform.
 */
interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Analyst' | 'Viewer' | 'Auditor';
    lastLogin: string;
    status: 'Active' | 'Inactive' | 'Pending';
    permissions: string[]; // e.g., ['campaigns.view', 'templates.edit']
}

/**
 * Represents a scheduled background job or automation task.
 */
interface ScheduledJob {
    id: string;
    name: string;
    type: 'CampaignSend' | 'ReportGeneration' | 'DataSync' | 'AlertCheck' | 'AudienceRefresh';
    status: 'Scheduled' | 'Running' | 'Completed' | 'Failed' | 'Paused';
    schedule: string; // e.g., 'daily', 'weekly', 'CRON expression'
    lastRun: string; // Timestamp of the last execution
    nextRun: string; // Timestamp of the next scheduled execution
    details?: string; // Additional details about the job
    createdBy: string;
}

/**
 * Represents a real-time system health metric.
 */
interface SystemHealthMetric {
    name: string;
    value: number;
    unit: string;
    status: 'Normal' | 'Warning' | 'Critical';
    timestamp: string;
    description: string;
}

/**
 * Represents a communication message sent to a customer.
 * This would be part of a real-time feed.
 */
interface LiveMessage {
    id: string;
    timestamp: string;
    channel: 'Email' | 'SMS' | 'Voice';
    recipient: string; // Masked email/phone
    status: 'Sent' | 'Delivered' | 'Failed' | 'Opened' | 'Clicked' | 'Bounced';
    campaignId?: string;
    templateId?: string;
    errorReason?: string;
}

// --- MOCK DATA GENERATION FUNCTIONS ---
// These functions create realistic-looking dummy data for the components.

export const generateMockCommunicationSummaries = (): CommunicationSummary[] => [
    { channel: 'Email', sent: getRandomInt(1_200_000, 1_500_000), delivered: getRandomInt(1_180_000, 1_480_000), failed: getRandomInt(1000, 5000), openRate: getRandom(20, 30), clickRate: getRandom(2, 5), optOutRate: getRandom(0.1, 0.5) },
    { channel: 'SMS', sent: getRandomInt(800_000, 900_000), delivered: getRandomInt(790_000, 890_000), failed: getRandomInt(500, 2000), optOutRate: getRandom(0.05, 0.2) },
    { channel: 'Voice', sent: getRandomInt(40_000, 60_000), delivered: getRandomInt(39_000, 59_000), failed: getRandomInt(100, 500) },
];

export const generateMockDailyMetrics = (days: number): DailyMetric[] => {
    const data: DailyMetric[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() - i);
        const date = currentDate.toISOString().split('T')[0];

        const emailSent = getRandomInt(40000, 60000);
        const smsSent = getRandomInt(25000, 35000);
        const voiceMinutes = getRandomInt(1500, 2500);

        data.push({
            date,
            emailSent,
            smsSent,
            voiceMinutes,
            emailDelivered: Math.floor(emailSent * getRandom(0.99, 0.999)),
            smsDelivered: Math.floor(smsSent * getRandom(0.99, 0.998)),
        });
    }
    return data;
};

export const generateMockCampaigns = (count: number): Campaign[] => {
    const campaigns: Campaign[] = [];
    const statuses = ['Scheduled', 'Active', 'Completed', 'Draft', 'Paused'] as const;
    const channels = ['Email', 'SMS', 'Voice', 'Multi-Channel'] as const;
    const audiences = ['All Customers', 'High-Value Segment', 'Savings Account Holders', 'Loan Applicants', 'New Customers', 'Credit Card Users'];
    const creators = ['admin@bank.com', 'marketing@bank.com', 'john.doe@bank.com'];

    for (let i = 0; i < count; i++) {
        const status = statuses[getRandomInt(0, statuses.length)];
        const channel = channels[getRandomInt(0, channels.length)];
        const startDate = new Date(Date.now() - getRandomInt(0, 90) * 24 * 60 * 60 * 1000).toISOString();
        const endDate = new Date(Date.parse(startDate) + getRandomInt(7, 30) * 24 * 60 * 60 * 1000).toISOString();
        const totalSent = getRandomInt(50000, 500000);
        const delivered = Math.floor(totalSent * getRandom(0.98, 0.999));
        const cost = totalSent * (channel === 'Email' ? getRandom(0.001, 0.005) : channel === 'SMS' ? getRandom(0.01, 0.05) : getRandom(0.1, 0.3));

        campaigns.push({
            id: `CAMP-${1000 + i}`,
            name: `Q${getRandomInt(1, 4)} ${new Date().getFullYear()} ${channel} Promo ${i + 1}`,
            status: status,
            channel: channel,
            startDate: startDate,
            endDate: endDate,
            targetAudience: audiences[getRandomInt(0, audiences.length)],
            totalSent: totalSent,
            delivered: delivered,
            openRate: channel === 'Email' ? getRandom(15, 40) : undefined,
            clickRate: channel === 'Email' ? getRandom(1, 10) : undefined,
            cost: parseFloat(cost.toFixed(2)),
            creator: creators[getRandomInt(0, creators.length)],
            lastModified: new Date(Date.parse(startDate) + getRandomInt(0, (new Date().getTime() - Date.parse(startDate)) / 1000) * 1000).toISOString(),
        });
    }
    return campaigns.sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
};

export const generateMockTemplates = (count: number): Template[] => {
    const templates: Template[] = [];
    const channels = ['Email', 'SMS', 'Voice'] as const;
    const categories = ['Promotional', 'Transactional', 'Alerts', 'Marketing', 'Onboarding', 'Security'];
    const statuses = ['Active', 'Archived', 'Draft'] as const;
    const creators = ['admin@bank.com', 'designer@bank.com'];
    const allTags = ['promotional', 'account', 'security', 'alert', 'loan', 'savings', 'credit card', 'marketing', 'welcome'];

    for (let i = 0; i < count; i++) {
        const channel = channels[getRandomInt(0, channels.length)];
        const category = categories[getRandomInt(0, categories.length)];
        const selectedTags = Array.from({ length: getRandomInt(1, 3) }, () => allTags[getRandomInt(0, allTags.length)]);

        templates.push({
            id: `TPL-${1000 + i}`,
            name: `${channel} Template ${i + 1}: ${category} message`,
            channel: channel,
            subject: channel === 'Email' ? `Your Bank Update #${i + 1} - Important Info` : undefined,
            previewText: `This is a short preview of the ${channel} message content for template ${i + 1} regarding ${category.toLowerCase()}...`,
            contentHtml: channel === 'Email' ? `<p>Hello {{customer_name}},</p><p>This is a detailed HTML email for ${category}.</p>` : undefined,
            contentText: `Hello {{customer_name}}, This is a ${channel} message for ${category}. More details available online.`,
            lastModified: new Date(Date.now() - getRandomInt(0, 60) * 24 * 60 * 60 * 1000).toISOString(),
            version: getRandomInt(1, 5),
            status: statuses[getRandomInt(0, statuses.length)],
            category: category,
            tags: Array.from(new Set(selectedTags)), // Ensure unique tags
            createdBy: creators[getRandomInt(0, creators.length)],
        });
    }
    return templates.sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
};

export const generateMockAudienceSegments = (count: number): AudienceSegment[] => {
    const segments: AudienceSegment[] = [];
    const baseCriteria = [
        'Age > 25', 'Has Savings Account', 'Credit Score > 700', 'Active Loan',
        'Last Login < 30 days', 'High Net Worth', 'New Customer (last 90 days)',
        'Resides in specific region (e.g., California)', 'Opted-in for Promotions',
        'Monthly Spend > $1000', 'No Credit Card'
    ];
    const creators = ['admin@bank.com', 'marketing@bank.com'];

    for (let i = 0; i < count; i++) {
        const selectedCriteria = Array.from({ length: getRandomInt(1, 3) }, () => baseCriteria[getRandomInt(0, baseCriteria.length)]);
        segments.push({
            id: `SEG-${1000 + i}`,
            name: `Segment ${i + 1} - ${selectedCriteria[0].split(' ')[0]}`,
            description: `Customers matching criteria: ${selectedCriteria.join(', ')}. Automatically updated every 24 hours.`,
            criteria: selectedCriteria,
            memberCount: getRandomInt(10000, 500000),
            lastUpdated: new Date(Date.now() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: creators[getRandomInt(0, creators.length)],
            isDynamic: getRandom(0, 1) > 0.5,
        });
    }
    return segments.sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
};

export const generateMockAuditLogs = (count: number): AuditLogEntry[] => {
    const logs: AuditLogEntry[] = [];
    const users = ['admin@bank.com', 'manager@bank.com', 'analyst@bank.com', 'dev@bank.com', 'auditor@bank.com'];
    const actions = ['Created Campaign', 'Updated Template', 'Deleted Segment', 'Changed Channel Config', 'Exported Report', 'Logged In', 'Scheduled Message', 'Approved Campaign', 'Deactivated User'];
    const entityTypes = ['Campaign', 'Template', 'Audience Segment', 'Channel Configuration', 'User', 'Report'];

    for (let i = 0; i < count; i++) {
        const timestamp = new Date(Date.now() - getRandomInt(0, 7 * 24 * 60 * 60 * 1000)).toISOString();
        const action = actions[getRandomInt(0, actions.length)];
        const entityType = entityTypes[getRandomInt(0, entityTypes.length)];
        logs.push({
            id: `AUDIT-${1000 + i}`,
            timestamp: timestamp,
            user: users[getRandomInt(0, users.length)],
            action: action,
            details: `${action} on ${entityType} ID: ${getRandomInt(1000, 2000)} by ${users[getRandomInt(0, users.length)]}.`,
            entityType: entityType,
            entityId: `${entityType.substring(0, 3).toUpperCase()}-${getRandomInt(1000, 2000)}`,
            ipAddress: `192.168.${getRandomInt(0, 255)}.${getRandomInt(0, 255)}`,
        });
    }
    return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const generateMockChannelConfigurations = (count: number): ChannelConfiguration[] => {
    const configs: ChannelConfiguration[] = [];
    const types = ['Email', 'SMS', 'Voice'] as const;
    const providers = {
        Email: ['SendGrid', 'Mailgun', 'AWS SES', 'Google SMTP'],
        SMS: ['Twilio', 'Nexmo', 'Sinch', 'Vonage SMS'],
        Voice: ['Twilio Voice', 'Vonage Voice', 'Plivo']
    };
    const statuses = ['Active', 'Inactive', 'Pending'] as const;

    for (let i = 0; i < count; i++) {
        const type = types[getRandomInt(0, types.length)];
        const providerList = providers[type];
        const provider = providerList[getRandomInt(0, providerList.length)];
        const dailyLimit = getRandomInt(100000, 1000000);
        const currentDailyUsage = getRandomInt(0, dailyLimit);

        configs.push({
            id: `CHANNEL-${100 + i}`,
            name: `${provider} ${type} Gateway`,
            type: type,
            status: statuses[getRandomInt(0, statuses.length)],
            provider: provider,
            apiKeyPreview: `sk_${'x'.repeat(getRandomInt(4, 8))}...${'y'.repeat(4)}`,
            dailyLimit: dailyLimit,
            currentDailyUsage: currentDailyUsage,
            lastTested: new Date(Date.now() - getRandomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString(),
            settings: {
                region: ['us-east-1', 'eu-west-1', 'ap-southeast-2'][getRandomInt(0,3)],
                senderId: type === 'SMS' ? `BANKMSG${getRandomInt(100,999)}` : undefined,
                emailDomain: type === 'Email' ? `mail.bank${getRandomInt(1,3)}.com` : undefined,
                callForwarding: type === 'Voice' ? getRandom(0,1) > 0.5 : undefined,
            }
        });
    }
    return configs.sort((a,b) => a.name.localeCompare(b.name));
};

export const generateMockCostSummaries = (months: number): CostSummary[] => {
    const data: CostSummary[] = [];
    let currentMonth = new Date();
    currentMonth.setMonth(currentMonth.getMonth() - months);

    for (let i = 0; i < months; i++) {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        const monthName = currentMonth.toLocaleString('en-us', { month: 'short', year: 'numeric' });

        const emailCost = getRandom(1000, 5000);
        const smsCost = getRandom(5000, 15000);
        const voiceCost = getRandom(500, 2000);
        const totalCost = emailCost + smsCost + voiceCost;

        data.push({
            month: monthName,
            emailCost: parseFloat(emailCost.toFixed(2)),
            smsCost: parseFloat(smsCost.toFixed(2)),
            voiceCost: parseFloat(voiceCost.toFixed(2)),
            totalCost: parseFloat(totalCost.toFixed(2)),
            currency: 'USD',
        });
    }
    return data;
};

export const generateMockAlertRules = (count: number): AlertRule[] => {
    const rules: AlertRule[] = [];
    const metrics = ['emailDeliverability', 'smsDeliverability', 'emailBounceRate', 'smsFailureRate', 'campaignCostExceeded', 'templateUsageDrop', 'apiLatency'];
    const operators = ['gt', 'lt'] as const;
    const channels = ['email', 'sms', 'dashboard', 'slack'] as const;
    const statuses = ['Active', 'Inactive'] as const;
    const severities = ['Low', 'Medium', 'High', 'Critical'] as const;

    for (let i = 0; i < count; i++) {
        const metric = metrics[getRandomInt(0, metrics.length)];
        const operator = operators[getRandomInt(0, operators.length)];
        let threshold = getRandom(1, 100);
        if (metric.includes('Latency')) threshold = getRandom(100, 500); // ms
        if (metric.includes('CostExceeded')) threshold = getRandom(1000, 10000); // USD
        threshold = parseFloat(threshold.toFixed(1));

        const channel = channels[getRandomInt(0, channels.length)];
        const status = statuses[getRandomInt(0, statuses.length)];
        const severity = severities[getRandomInt(0, severities.length)];

        rules.push({
            id: `ALERT-${1000 + i}`,
            name: `Alert for ${metric} ${operator === 'gt' ? '>' : '<'} ${threshold}${metric.includes('Rate') || metric.includes('Deliverability') ? '%' : (metric.includes('Cost') ? '$' : (metric.includes('Latency') ? 'ms' : ''))}`,
            metric: metric,
            threshold: threshold,
            operator: operator,
            channel: channel,
            status: status,
            severity: severity,
            lastTriggered: status === 'Active' && getRandom(0, 1) > 0.5 ? new Date(Date.now() - getRandomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString() : undefined,
            description: `Triggers when ${metric} goes ${operator === 'gt' ? 'above' : 'below'} ${threshold}.`,
        });
    }
    return rules.sort((a,b) => a.name.localeCompare(b.name));
};

export const generateMockUserProfiles = (count: number): UserProfile[] => {
    const profiles: UserProfile[] = [];
    const roles = ['Admin', 'Manager', 'Analyst', 'Viewer', 'Auditor'] as const;
    const statuses = ['Active', 'Inactive', 'Pending'] as const;
    const defaultPermissions: { [key: string]: string[] } = {
        'Admin': ['all'],
        'Manager': ['campaigns.*', 'templates.*', 'audiences.*', 'reports.view'],
        'Analyst': ['campaigns.view', 'reports.*', 'audiences.view'],
        'Viewer': ['campaigns.view', 'reports.view'],
        'Auditor': ['auditlogs.view', 'reports.view', 'channelconfig.view'],
    };

    for (let i = 0; i < count; i++) {
        const role = roles[getRandomInt(0, roles.length)];
        const status = statuses[getRandomInt(0, statuses.length)];
        const firstName = `User${i + 1}`;
        const lastName = `Bank`;
        profiles.push({
            id: `USER-${1000 + i}`,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@bank.com`,
            role: role,
            lastLogin: new Date(Date.now() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
            status: status,
            permissions: defaultPermissions[role],
        });
    }
    return profiles.sort((a,b) => a.name.localeCompare(b.name));
};

export const generateMockScheduledJobs = (count: number): ScheduledJob[] => {
    const jobs: ScheduledJob[] = [];
    const types = ['CampaignSend', 'ReportGeneration', 'DataSync', 'AlertCheck', 'AudienceRefresh'] as const;
    const statuses = ['Scheduled', 'Running', 'Completed', 'Failed', 'Paused'] as const;
    const schedules = ['daily at 03:00 AM', 'weekly (Mon 02:00 AM)', 'monthly (1st 01:00 AM)', 'hourly', 'CRON * * * * *'];
    const creators = ['system', 'admin@bank.com', 'analyst@bank.com'];

    for (let i = 0; i < count; i++) {
        const type = types[getRandomInt(0, types.length)];
        const status = statuses[getRandomInt(0, statuses.length)];
        const schedule = schedules[getRandomInt(0, schedules.length)];
        const lastRun = new Date(Date.now() - getRandomInt(0, 14) * 24 * 60 * 60 * 1000).toISOString();
        const nextRun = new Date(Date.parse(lastRun) + getRandomInt(1, 7) * 24 * 60 * 60 * 1000).toISOString();

        jobs.push({
            id: `JOB-${1000 + i}`,
            name: `${type} - ${schedule} run`,
            type: type,
            status: status,
            schedule: schedule,
            lastRun: lastRun,
            nextRun: nextRun,
            details: `Job details for ${type} ${i + 1}. This job ensures ${type === 'CampaignSend' ? ' timely delivery of messages' : type === 'ReportGeneration' ? 'reports are up-to-date' : 'data consistency and freshness'}.`,
            createdBy: creators[getRandomInt(0, creators.length)],
        });
    }
    return jobs.sort((a,b) => new Date(b.nextRun).getTime() - new Date(a.nextRun).getTime());
};

export const generateMockSystemHealthMetrics = (): SystemHealthMetric[] => {
    const now = new Date().toISOString();
    return [
        { name: 'API Latency', value: getRandom(50, 200), unit: 'ms', status: getRandom(0, 100) > 90 ? 'Warning' : 'Normal', timestamp: now, description: 'Average response time for external API calls.' },
        { name: 'Message Queue Size', value: getRandomInt(10, 500), unit: 'messages', status: getRandom(0, 100) > 80 ? 'Warning' : 'Normal', timestamp: now, description: 'Number of messages waiting to be processed.' },
        { name: 'Database Connections', value: getRandomInt(20, 100), unit: '', status: 'Normal', timestamp: now, description: 'Active connections to the database server.' },
        { name: 'Service Uptime', value: parseFloat(getRandom(99.9, 100).toFixed(2)), unit: '%', status: 'Normal', timestamp: now, description: 'Percentage of time services have been operational.' },
        { name: 'SMS Gateway Health', value: getRandom(0, 100) > 95 ? 0 : getRandom(95,100), unit: '%', status: getRandom(0, 100) > 95 ? 'Critical' : 'Normal', timestamp: now, description: 'Current health status of the primary SMS gateway.' },
        { name: 'Email Send Rate', value: getRandomInt(10000, 50000), unit: '/min', status: 'Normal', timestamp: now, description: 'Current outgoing email volume per minute.' },
    ];
};

export const generateMockLiveMessages = (count: number): LiveMessage[] => {
    const messages: LiveMessage[] = [];
    const channels = ['Email', 'SMS', 'Voice'] as const;
    const statuses = ['Sent', 'Delivered', 'Failed', 'Opened', 'Clicked', 'Bounced'] as const;
    const failureReasons = ['Invalid Number', 'Blocked', 'Content Violation', 'Temporary Error', 'Opted Out'];

    for (let i = 0; i < count; i++) {
        const channel = channels[getRandomInt(0, channels.length)];
        const status = statuses[getRandomInt(0, statuses.length)];
        const recipient = channel === 'Email' ? `****${getRandomInt(100,999)}@bank.com` : `+1 (***) ***-${getRandomInt(1000,9999)}`;
        const campaignId = getRandom(0,1) > 0.5 ? `CAMP-${getRandomInt(1000,2000)}` : undefined;
        const templateId = getRandom(0,1) > 0.5 ? `TPL-${getRandomInt(1000,2000)}` : undefined;
        const errorReason = status === 'Failed' || status === 'Bounced' ? failureReasons[getRandomInt(0, failureReasons.length)] : undefined;

        messages.push({
            id: `MSG-${100000 + i}`,
            timestamp: new Date(Date.now() - getRandomInt(0, 60 * 60 * 1000)).toISOString(), // Last hour
            channel: channel,
            recipient: recipient,
            status: status,
            campaignId: campaignId,
            templateId: templateId,
            errorReason: errorReason,
        });
    }
    return messages.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};


// --- EXISTING DATA (from original file) ---
// These are kept as-is to integrate with the original structure.
const deliverabilityData = [
    { name: 'Mon', email: 99.8, sms: 99.5 }, { name: 'Tue', email: 99.9, sms: 99.6 },
    { name: 'Wed', email: 99.7, sms: 99.4 }, { name: 'Thu', email: 99.9, sms: 99.7 },
    { name: 'Fri', email: 99.8, sms: 99.5 }, { name: 'Sat', email: 99.9, sms: 99.8 },
    { name: 'Sun', email: 99.9, sms: 99.7 },
];

const usageData = [
    { name: 'Email', count: 1250000 },
    { name: 'SMS', count: 850000 },
    { name: 'Voice', count: 50000 },
];

// --- NEW DASHBOARD COMPONENTS & DATA ---

// Defined color palette for consistent charting throughout the application.
export const CHART_COLORS = ['#06b6d4', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#00c49f'];

/**
 * A detailed overview component for communication metrics across channels.
 * Displays key performance indicators like sent, delivered, failed, open rate, click rate, and opt-out rate.
 */
export const CommunicationOverviewMetrics: React.FC = () => {
    const [summary, setSummary] = useState<CommunicationSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Simulate an asynchronous API call to fetch data.
        const timer = setTimeout(() => {
            setSummary(generateMockCommunicationSummaries());
            setIsLoading(false);
        }, getRandomInt(300, 1000)); // Random delay for realism
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <div className="text-gray-400 text-center py-8">Loading detailed metrics...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {summary.map((item, index) => (
                <Card key={item.channel} className="text-center p-4 h-full flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{item.channel}</h3>
                        <p className="text-gray-400 text-sm mb-3">Last 30 days</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm flex-grow items-center">
                        <div className="flex flex-col items-center">
                            <p className="text-gray-400">Sent</p>
                            <p className="text-white text-lg font-bold">{formatLargeNumber(item.sent)}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-gray-400">Delivered</p>
                            <p className="text-white text-lg font-bold">{formatLargeNumber(item.delivered)}</p>
                        </div>
                        {item.openRate !== undefined && (
                            <>
                                <div className="flex flex-col items-center">
                                    <p className="text-gray-400">Open Rate</p>
                                    <p className="text-white text-lg font-bold">{item.openRate.toFixed(1)}%</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <p className="text-gray-400">Click Rate</p>
                                    <p className="text-white text-lg font-bold">{item.clickRate?.toFixed(1)}%</p>
                                </div>
                            </>
                        )}
                        {item.optOutRate !== undefined && (
                             <div className="flex flex-col items-center">
                                <p className="text-gray-400">Opt-Out Rate</p>
                                <p className="text-white text-lg font-bold">{item.optOutRate.toFixed(2)}%</p>
                            </div>
                        )}
                        <div className="flex flex-col items-center col-span-2 mt-2">
                            <p className="text-gray-400">Failed</p>
                            <p className="text-red-400 text-xl font-bold">{formatLargeNumber(item.failed)}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

/**
 * Displays a trend of daily communication volume (Emails, SMS, Voice Minutes) over the last 30 days.
 * Uses an AreaChart for visualizing cumulative trends.
 */
export const DailyCommunicationsTrend: React.FC = () => {
    const [data, setData] = useState<DailyMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setData(generateMockDailyMetrics(30)); // Last 30 days
            setIsLoading(false);
        }, getRandomInt(500, 1500));
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <Card title="Daily Communication Trends" className="min-h-[400px] flex items-center justify-center"><p className="text-gray-400">Loading daily trends...</p></Card>;
    }

    return (
        <Card title="Daily Communication Trends (Last 30 Days)">
            <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        {/* Gradient definitions for aesthetic area chart fills */}
                        <linearGradient id="colorEmailSent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSMSSent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorVoiceMinutes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#9ca3af" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis stroke="#9ca3af" />
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="emailSent" name="Emails Sent" stroke="#8884d8" fillOpacity={1} fill="url(#colorEmailSent)" />
                    <Area type="monotone" dataKey="smsSent" name="SMS Sent" stroke="#82ca9d" fillOpacity={1} fill="url(#colorSMSSent)" />
                    <Area type="monotone" dataKey="voiceMinutes" name="Voice Minutes" stroke="#ffc658" fillOpacity={1} fill="url(#colorVoiceMinutes)" />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
};

/**
 * Displays the distribution of communication usage by channel using a Pie Chart.
 * Utilizes existing `usageData` from the original file for simplicity.
 */
export const ChannelUsagePieChart: React.FC = () => {
    const [data, setData] = useState(usageData); // Using existing usageData for simplicity
    const [isLoading, setIsLoading] = useState(false); // No async call for this one, so always false

    return (
        <Card title="Usage Distribution by Channel">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};


// --- CAMPAIGN MANAGEMENT COMPONENTS ---

/**
 * Provides an interface for managing communication campaigns, including filtering, searching, and actions.
 */
export const CampaignList: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setCampaigns(generateMockCampaigns(20)); // Generate 20 mock campaigns
            setIsLoading(false);
        }, getRandomInt(500, 1500));
        return () => clearTimeout(timer);
    }, []);

    // Memoize filtered campaigns to prevent unnecessary re-renders
    const filteredCampaigns = useMemo(() => {
        let filtered = campaigns;
        if (filterStatus !== 'All') {
            filtered = filtered.filter(c => c.status === filterStatus);
        }
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.targetAudience.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.creator.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [campaigns, filterStatus, searchTerm]);

    const handleCreateCampaign = useCallback(() => {
        console.log("Navigating to campaign creation page...");
        // In a real application, this would use a router (e.g., Next.js Router, React Router)
        alert("Simulating: Navigate to Create Campaign Page (route: /campaigns/new)");
    }, []);

    const handleViewCampaign = useCallback((id: string) => {
        console.log(`Viewing campaign ${id}`);
        alert(`Simulating: View Campaign ID: ${id} (route: /campaigns/${id})`);
    }, []);

    const handleEditCampaign = useCallback((id: string) => {
        console.log(`Editing campaign ${id}`);
        alert(`Simulating: Edit Campaign ID: ${id} (route: /campaigns/${id}/edit)`);
    }, []);

    const handleDeleteCampaign = useCallback((id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete campaign "${name}" (ID: ${id})? This action cannot be undone.`)) {
            setCampaigns(prev => prev.filter(c => c.id !== id));
            alert(`Simulating: Campaign "${name}" deleted successfully.`);
        }
    }, []);


    if (isLoading) {
        return <Card title="Campaign Management" className="min-h-[600px] flex items-center justify-center"><p className="text-gray-400">Loading campaigns...</p></Card>;
    }

    return (
        <Card title="Campaign Management">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
                <div className="flex flex-wrap gap-2">
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Draft">Draft</option>
                        <option value="Paused">Paused</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 w-48 md:w-auto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleCreateCampaign}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
                >
                    + Create New Campaign
                </button>
            </div>

            <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Channel
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Audience
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Sent
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Deliverability
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Cost ($)
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Creator
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredCampaigns.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-8 whitespace-nowrap text-sm text-gray-500 text-center">
                                    No campaigns found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredCampaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-gray-800 transition duration-150 ease-in-out">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {campaign.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            campaign.status === 'Completed' ? 'bg-gray-200 text-gray-800' :
                                            campaign.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                            campaign.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-purple-100 text-purple-800' // For Draft
                                            }`}
                                        >
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {campaign.channel}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {campaign.targetAudience}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {formatLargeNumber(campaign.totalSent)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {((campaign.delivered / campaign.totalSent) * 100).toFixed(2)}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        ${campaign.cost.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {campaign.creator.split('@')[0]}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewCampaign(campaign.id)}
                                            className="text-indigo-400 hover:text-indigo-300 ml-4 px-2 py-1 rounded"
                                            title="View Campaign Details"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEditCampaign(campaign.id)}
                                            className="text-blue-400 hover:text-blue-300 ml-4 px-2 py-1 rounded"
                                            title="Edit Campaign"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCampaign(campaign.id, campaign.name)}
                                            className="text-red-400 hover:text-red-300 ml-4 px-2 py-1 rounded"
                                            title="Delete Campaign"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination Placeholder */}
            <div className="flex justify-center mt-6 text-gray-400 text-sm">
                <span className="cursor-not-allowed px-3 py-1 border border-gray-700 rounded-l-md bg-gray-800">Previous</span>
                <span className="px-3 py-1 border-t border-b border-gray-700 bg-gray-700 text-white">1</span>
                <span className="cursor-pointer px-3 py-1 border border-gray-700 rounded-r-md hover:bg-gray-700">Next</span>
            </div>
        </Card>
    );
};

/**
 * Manages communication templates across different channels. Includes filtering, searching, and actions for templates.
 */
export const TemplateManager: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterChannel, setFilterChannel] = useState<string>('All');
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setTemplates(generateMockTemplates(15)); // Generate 15 mock templates
            setIsLoading(false);
        }, getRandomInt(400, 1200));
        return () => clearTimeout(timer);
    }, []);

    const availableCategories = useMemo(() => ['All', ...new Set(templates.map(t => t.category))], [templates]);

    // Memoize filtered templates
    const filteredTemplates = useMemo(() => {
        let filtered = templates;
        if (filterChannel !== 'All') {
            filtered = filtered.filter(t => t.channel === filterChannel);
        }
        if (filterCategory !== 'All') {
            filtered = filtered.filter(t => t.category === filterCategory);
        }
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.subject && t.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
                t.previewText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        return filtered;
    }, [templates, filterChannel, filterCategory, searchTerm]);

    const handleCreateTemplate = useCallback(() => {
        console.log("Navigating to template creation page...");
        alert("Simulating: Navigate to Create Template Page (route: /templates/new)");
    }, []);

    const handleEditTemplate = useCallback((id: string) => {
        console.log(`Editing template ${id}`);
        alert(`Simulating: Edit Template ID: ${id} (route: /templates/${id}/edit)`);
    }, []);

    const handlePreviewTemplate = useCallback((id: string) => {
        alert(`Simulating: Preview Template ID: ${id}`);
    }, []);

    const handleDeleteTemplate = useCallback((id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete template "${name}" (ID: ${id})?`)) {
            setTemplates(prev => prev.filter(t => t.id !== id));
            alert(`Simulating: Template "${name}" deleted.`);
        }
    }, []);

    if (isLoading) {
        return <Card title="Template Management" className="min-h-[600px] flex items-center justify-center"><p className="text-gray-400">Loading templates...</p></Card>;
    }

    return (
        <Card title="Template Management">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
                <div className="flex flex-wrap gap-2">
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterChannel}
                        onChange={(e) => setFilterChannel(e.target.value)}
                    >
                        <option value="All">All Channels</option>
                        <option value="Email">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="Voice">Voice</option>
                    </select>
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        {availableCategories.map(category => <option key={category} value={category}>{category}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Search templates..."
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 w-48 md:w-auto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleCreateTemplate}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
                >
                    + Create New Template
                </button>
            </div>

            <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Channel
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Subject / Preview
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Version
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Last Modified
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredTemplates.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 whitespace-nowrap text-sm text-gray-500 text-center">
                                    No templates found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredTemplates.map((template) => (
                                <tr key={template.id} className="hover:bg-gray-800 transition duration-150 ease-in-out">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {template.name}
                                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${template.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            template.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'}`}
                                        >
                                            {template.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {template.channel}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                                        {template.subject || template.previewText}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {template.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {template.version}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {new Date(template.lastModified).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handlePreviewTemplate(template.id)}
                                            className="text-purple-400 hover:text-purple-300 ml-4 px-2 py-1 rounded"
                                            title="Preview Template"
                                        >
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => handleEditTemplate(template.id)}
                                            className="text-indigo-400 hover:text-indigo-300 ml-4 px-2 py-1 rounded"
                                            title="Edit Template"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTemplate(template.id, template.name)}
                                            className="text-red-400 hover:text-red-300 ml-4 px-2 py-1 rounded"
                                            title="Delete Template"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

/**
 * Manages audience segments for targeted communications. Allows creating, viewing, and deleting segments.
 */
export const AudienceSegmentManager: React.FC = () => {
    const [segments, setSegments] = useState<AudienceSegment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterDynamic, setFilterDynamic] = useState<string>('All');

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setSegments(generateMockAudienceSegments(10)); // Generate 10 mock segments
            setIsLoading(false);
        }, getRandomInt(300, 1000));
        return () => clearTimeout(timer);
    }, []);

    // Memoize filtered segments
    const filteredSegments = useMemo(() => {
        let filtered = segments;
        if (filterDynamic !== 'All') {
            const isDynamic = filterDynamic === 'Dynamic';
            filtered = filtered.filter(s => s.isDynamic === isDynamic);
        }
        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.criteria.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
                s.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [segments, searchTerm, filterDynamic]);

    const handleCreateSegment = useCallback(() => {
        alert("Simulating: Navigate to Create Segment Page (route: /audiences/new)");
    }, []);

    const handleViewSegment = useCallback((id: string) => {
        alert(`Simulating: View Segment ID: ${id} (route: /audiences/${id})`);
    }, []);

    const handleEditSegment = useCallback((id: string) => {
        alert(`Simulating: Edit Segment ID: ${id}`);
    }, []);

    const handleDeleteSegment = useCallback((id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete segment "${name}" (ID: ${id})?`)) {
            setSegments(prev => prev.filter(s => s.id !== id));
            alert(`Simulating: Segment "${name}" deleted.`);
        }
    }, []);

    if (isLoading) {
        return <Card title="Audience Segmentation" className="min-h-[400px] flex items-center justify-center"><p className="text-gray-400">Loading audience segments...</p></Card>;
    }

    return (
        <Card title="Audience Segmentation">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
                <div className="flex flex-wrap gap-2">
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterDynamic}
                        onChange={(e) => setFilterDynamic(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="Dynamic">Dynamic</option>
                        <option value="Static">Static</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search segments..."
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 w-48 md:w-auto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleCreateSegment}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
                >
                    + Create New Segment
                </button>
            </div>
            <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Members
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Last Updated
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Created By
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredSegments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 whitespace-nowrap text-sm text-gray-500 text-center">
                                    No segments found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredSegments.map((segment) => (
                                <tr key={segment.id} className="hover:bg-gray-800 transition duration-150 ease-in-out">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {segment.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                                        {segment.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {formatLargeNumber(segment.memberCount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${segment.isDynamic ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {segment.isDynamic ? 'Dynamic' : 'Static'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {new Date(segment.lastUpdated).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {segment.createdBy.split('@')[0]}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewSegment(segment.id)}
                                            className="text-indigo-400 hover:text-indigo-300 ml-4 px-2 py-1 rounded"
                                            title="View Segment Details"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEditSegment(segment.id)}
                                            className="text-blue-400 hover:text-blue-300 ml-4 px-2 py-1 rounded"
                                            title="Edit Segment"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSegment(segment.id, segment.name)}
                                            className="text-red-400 hover:text-red-300 ml-4 px-2 py-1 rounded"
                                            title="Delete Segment"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// --- REPORTING & AUDIT COMPONENTS ---

/**
 * Displays a searchable and filterable list of audit log entries, crucial for compliance and security.
 */
export const AuditLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterUser, setFilterUser] = useState<string>('All');
    const [filterAction, setFilterAction] = useState<string>('All');
    const [filterEntityType, setFilterEntityType] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setLogs(generateMockAuditLogs(30)); // Generate 30 mock logs
            setIsLoading(false);
        }, getRandomInt(400, 1200));
        return () => clearTimeout(timer);
    }, []);

    // Memoize options for filters
    const availableUsers = useMemo(() => ['All', ...new Set(logs.map(log => log.user))], [logs]);
    const availableActions = useMemo(() => ['All', ...new Set(logs.map(log => log.action))], [logs]);
    const availableEntityTypes = useMemo(() => ['All', ...new Set(logs.map(log => log.entityType || 'N/A'))], [logs]);

    // Memoize filtered logs
    const filteredLogs = useMemo(() => {
        let filtered = logs;
        if (filterUser !== 'All') {
            filtered = filtered.filter(log => log.user === filterUser);
        }
        if (filterAction !== 'All') {
            filtered = filtered.filter(log => log.action === filterAction);
        }
        if (filterEntityType !== 'All') {
            filtered = filtered.filter(log => (log.entityType || 'N/A') === filterEntityType);
        }
        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.entityId && log.entityId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.ipAddress && log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        return filtered;
    }, [logs, filterUser, filterAction, filterEntityType, searchTerm]);

    if (isLoading) {
        return <Card title="Audit Logs" className="min-h-[500px] flex items-center justify-center"><p className="text-gray-400">Loading audit logs...</p></Card>;
    }

    return (
        <Card title="Audit Logs">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
                <div className="flex flex-wrap gap-2">
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                    >
                        {availableUsers.map(user => <option key={user} value={user}>{user}</option>)}
                    </select>
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                    >
                        {availableActions.map(action => <option key={action} value={action}>{action}</option>)}
                    </select>
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterEntityType}
                        onChange={(e) => setFilterEntityType(e.target.value)}
                    >
                        {availableEntityTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Search log details..."
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 w-48 md:w-auto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Timestamp
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                User
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Action
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Entity Type / ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Details
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                IP Address
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 whitespace-nowrap text-sm text-gray-500 text-center">
                                    No audit logs found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-800 transition duration-150 ease-in-out">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {log.user.split('@')[0]}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {log.entityType || 'N/A'} {log.entityId ? `(${log.entityId})` : ''}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-lg truncate">
                                        {log.details}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {log.ipAddress || 'N/A'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// --- SETTINGS & CONFIGURATION COMPONENTS ---

/**
 * Manages the configuration settings for various communication channels (Email, SMS, Voice).
 * Allows viewing, editing, testing, and adding new channel configurations.
 */
export const ChannelConfigurationManager: React.FC = () => {
    const [configs, setConfigs] = useState<ChannelConfiguration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setConfigs(generateMockChannelConfigurations(8)); // Generate 8 mock configs
            setIsLoading(false);
        }, getRandomInt(300, 1000));
        return () => clearTimeout(timer);
    }, []);

    // Memoize filtered configurations
    const filteredConfigs = useMemo(() => {
        let filtered = configs;
        if (filterType !== 'All') {
            filtered = filtered.filter(c => c.type === filterType);
        }
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.apiKeyPreview.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [configs, filterType, searchTerm]);

    const handleEditConfig = useCallback((id: string) => {
        alert(`Simulating: Edit Channel Configuration ID: ${id} (route: /settings/channels/${id}/edit)`);
    }, []);

    const handleTestConfig = useCallback((id: string) => {
        alert(`Simulating: Testing connection for Channel ID: ${id}. Check logs for details.`);
    }, []);

    const handleAddConfig = useCallback(() => {
        alert("Simulating: Navigate to Add New Channel Configuration Page (route: /settings/channels/new)");
    }, []);

    if (isLoading) {
        return <Card title="Channel Configurations" className="min-h-[400px] flex items-center justify-center"><p className="text-gray-400">Loading channel configurations...</p></Card>;
    }

    return (
        <Card title="Channel Configurations">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
                <div className="flex flex-wrap gap-2">
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="Email">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="Voice">Voice</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search configurations..."
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 w-48 md:w-auto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleAddConfig}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
                >
                    + Add New Channel
                </button>
            </div>

            <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Provider
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                API Key Preview
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Daily Usage / Limit
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredConfigs.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 whitespace-nowrap text-sm text-gray-500 text-center">
                                    No channel configurations found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredConfigs.map((config) => (
                                <tr key={config.id} className="hover:bg-gray-800 transition duration-150 ease-in-out">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {config.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {config.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {config.provider}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${config.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            config.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'}`}
                                        >
                                            {config.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {config.apiKeyPreview}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {formatLargeNumber(config.currentDailyUsage)} / {formatLargeNumber(config.dailyLimit)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleTestConfig(config.id)}
                                            className="text-yellow-400 hover:text-yellow-300 ml-4 px-2 py-1 rounded"
                                            title="Test Channel Connection"
                                        >
                                            Test
                                        </button>
                                        <button
                                            onClick={() => handleEditConfig(config.id)}
                                            className="text-indigo-400 hover:text-indigo-300 ml-4 px-2 py-1 rounded"
                                            title="Edit Configuration"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

/**
 * Visualizes communication costs over time, broken down by channel. Uses a stacked AreaChart.
 */
export const CommunicationCostAnalysis: React.FC = () => {
    const [costData, setCostData] = useState<CostSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setCostData(generateMockCostSummaries(12)); // Last 12 months
            setIsLoading(false);
        }, getRandomInt(500, 1500));
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <Card title="Communication Cost Analysis" className="min-h-[400px] flex items-center justify-center"><p className="text-gray-400">Loading cost data...</p></Card>;
    }

    return (
        <Card title="Communication Cost Analysis (Last 12 Months)">
            <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={costData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}
                        formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="emailCost" stackId="1" name="Email Cost" stroke="#8884d8" fill="#8884d8" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="smsCost" stackId="1" name="SMS Cost" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="voiceCost" stackId="1" name="Voice Cost" stroke="#ffc658" fill="#ffc658" fillOpacity={0.8} />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
};

/**
 * Manages configurable alert rules for critical communication metrics.
 * Allows creating, editing, and toggling the status of alert rules.
 */
export const AlertRulesManager: React.FC = () => {
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterSeverity, setFilterSeverity] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setRules(generateMockAlertRules(10));
            setIsLoading(false);
        }, getRandomInt(300, 1000));
        return () => clearTimeout(timer);
    }, []);

    const availableSeverities = useMemo(() => ['All', 'Low', 'Medium', 'High', 'Critical'], []);

    // Memoize filtered rules
    const filteredRules = useMemo(() => {
        let filtered = rules;
        if (filterStatus !== 'All') {
            filtered = filtered.filter(rule => rule.status === filterStatus);
        }
        if (filterSeverity !== 'All') {
            filtered = filtered.filter(rule => rule.severity === filterSeverity);
        }
        if (searchTerm) {
            filtered = filtered.filter(rule =>
                rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rule.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rule.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [rules, filterStatus, filterSeverity, searchTerm]);

    const handleCreateRule = useCallback(() => {
        alert("Simulating: Navigate to Create New Alert Rule Page (route: /settings/alerts/new)");
    }, []);

    const handleEditRule = useCallback((id: string) => {
        alert(`Simulating: Edit Alert Rule ID: ${id}`);
    }, []);

    const handleToggleStatus = useCallback((id: string, currentStatus: string, name: string) => {
        setRules(prev => prev.map(rule => rule.id === id ? { ...rule, status: currentStatus === 'Active' ? 'Inactive' : 'Active' } : rule));
        alert(`Simulating: Toggled status for Alert Rule "${name}" to ${currentStatus === 'Active' ? 'Inactive' : 'Active'}.`);
    }, []);

    const handleDeleteRule = useCallback((id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete alert rule "${name}" (ID: ${id})?`)) {
            setRules(prev => prev.filter(r => r.id !== id));
            alert(`Simulating: Alert rule "${name}" deleted.`);
        }
    }, []);

    if (isLoading) {
        return <Card title="Alert Rules Management" className="min-h-[400px] flex items-center justify-center"><p className="text-gray-400">Loading alert rules...</p></Card>;
    }

    return (
        <Card title="Alert Rules Management">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
                <div className="flex flex-wrap gap-2">
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                    >
                        {availableSeverities.map(severity => <option key={severity} value={severity}>{severity}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Search rules..."
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 w-48 md:w-auto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleCreateRule}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
                >
                    + Create New Rule
                </button>
            </div>

            <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Metric
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Threshold
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Channel
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Severity
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Last Triggered
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredRules.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 whitespace-nowrap text-sm text-gray-500 text-center">
                                    No alert rules found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredRules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-gray-800 transition duration-150 ease-in-out">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {rule.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {rule.metric}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {rule.operator === 'gt' ? '>' : rule.operator === 'lt' ? '<' : '='} {rule.threshold}{rule.metric.includes('Rate') || rule.metric.includes('Deliverability') ? '%' : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {rule.channel}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${rule.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                                            rule.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                                            rule.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'}`}
                                        >
                                            {rule.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${rule.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                            {rule.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleToggleStatus(rule.id, rule.status, rule.name)}
                                            className={`${rule.status === 'Active' ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'} ml-4 px-2 py-1 rounded`}
                                            title={rule.status === 'Active' ? 'Deactivate Rule' : 'Activate Rule'}
                                        >
                                            {rule.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleEditRule(rule.id)}
                                            className="text-indigo-400 hover:text-indigo-300 ml-4 px-2 py-1 rounded"
                                            title="Edit Rule"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRule(rule.id, rule.name)}
                                            className="text-red-400 hover:text-red-300 ml-4 px-2 py-1 rounded"
                                            title="Delete Rule"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// --- ADMIN & SYSTEM TOOLS COMPONENTS ---

/**
 * Manages user accounts and roles within the communication platform, including permissions.
 */
export const UserAndRoleManagement: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterRole, setFilterRole] = useState<string>('All');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setUsers(generateMockUserProfiles(10)); // Generate 10 mock user profiles
            setIsLoading(false);
        }, getRandomInt(300, 1000));
        return () => clearTimeout(timer);
    }, []);

    const availableRoles = useMemo(() => ['All', 'Admin', 'Manager', 'Analyst', 'Viewer', 'Auditor'], []);
    const availableStatuses = useMemo(() => ['All', 'Active', 'Inactive', 'Pending'], []);

    // Memoize filtered users
    const filteredUsers = useMemo(() => {
        let filtered = users;
        if (filterRole !== 'All') {
            filtered = filtered.filter(user => user.role === filterRole);
        }
        if (filterStatus !== 'All') {
            filtered = filtered.filter(user => user.status === filterStatus);
        }
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [users, filterRole, filterStatus, searchTerm]);

    const handleInviteUser = useCallback(() => {
        alert("Simulating: Open 'Invite User' Modal/Page (route: /admin/users/invite)");
    }, []);

    const handleEditUser = useCallback((id: string) => {
        alert(`Simulating: Edit User ID: ${id} (route: /admin/users/${id}/edit)`);
    }, []);

    const handleToggleUserStatus = useCallback((id: string, currentStatus: string, name: string) => {
        setUsers(prev => prev.map(user => user.id === id ? { ...user, status: currentStatus === 'Active' ? 'Inactive' : 'Active' } : user));
        alert(`Simulating: Toggled status for User "${name}" to ${currentStatus === 'Active' ? 'Inactive' : 'Active'}.`);
    }, []);

    const handleDeleteUser = useCallback((id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete user "${name}" (ID: ${id})?`)) {
            setUsers(prev => prev.filter(u => u.id !== id));
            alert(`Simulating: User "${name}" deleted.`);
        }
    }, []);

    if (isLoading) {
        return <Card title="User & Role Management" className="min-h-[400px] flex items-center justify-center"><p className="text-gray-400">Loading user data...</p></Card>;
    }

    return (
        <Card title="User & Role Management">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
                <div className="flex flex-wrap gap-2">
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        {availableStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 w-48 md:w-auto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleInviteUser}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
                >
                    + Invite New User
                </button>
            </div>

            <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Last Login
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 whitespace-nowrap text-sm text-gray-500 text-center">
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-800 transition duration-150 ease-in-out">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {user.role}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${user.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            user.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'}`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {new Date(user.lastLogin).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleToggleUserStatus(user.id, user.status, user.name)}
                                            className={`${user.status === 'Active' ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'} ml-4 px-2 py-1 rounded`}
                                            title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                                        >
                                            {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleEditUser(user.id)}
                                            className="text-indigo-400 hover:text-indigo-300 ml-4 px-2 py-1 rounded"
                                            title="Edit User"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                            className="text-red-400 hover:text-red-300 ml-4 px-2 py-1 rounded"
                                            title="Delete User"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

/**
 * Monitors scheduled background jobs and automation tasks. Provides insights into their status and next run times.
 */
export const ScheduledJobsMonitor: React.FC = () => {
    const [jobs, setJobs] = useState<ScheduledJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterType, setFilterType] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setJobs(generateMockScheduledJobs(25));
            setIsLoading(false);
        }, getRandomInt(500, 1500));
        return () => clearTimeout(timer);
    }, []);

    const availableJobTypes = useMemo(() => ['All', ...new Set(jobs.map(job => job.type))], [jobs]);
    const availableJobStatuses = useMemo(() => ['All', ...new Set(jobs.map(job => job.status))], [jobs]);

    // Memoize filtered jobs
    const filteredJobs = useMemo(() => {
        let filtered = jobs;
        if (filterStatus !== 'All') {
            filtered = filtered.filter(job => job.status === filterStatus);
        }
        if (filterType !== 'All') {
            filtered = filtered.filter(job => job.type === filterType);
        }
        if (searchTerm) {
            filtered = filtered.filter(job =>
                job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (job.details && job.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
                job.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [jobs, filterStatus, filterType, searchTerm]);

    const handleRunJobNow = useCallback((id: string, name: string) => {
        alert(`Simulating: Running job "${name}" (ID: ${id}) now.`);
        // In a real app, this would trigger a backend API call.
        setJobs(prev => prev.map(job => job.id === id ? { ...job, status: 'Running', lastRun: new Date().toISOString() } : job));
    }, []);

    const handleViewDetails = useCallback((id: string) => {
        alert(`Simulating: Viewing details for job ${id}`);
    }, []);

    const handleCreateJob = useCallback(() => {
        alert("Simulating: Navigate to Create New Job/Automation Page (route: /admin/jobs/new)");
    }, []);

    if (isLoading) {
        return <Card title="Scheduled Jobs & Automation" className="min-h-[500px] flex items-center justify-center"><p className="text-gray-400">Loading scheduled jobs...</p></Card>;
    }

    return (
        <Card title="Scheduled Jobs & Automation">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
                <div className="flex flex-wrap gap-2">
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        {availableJobTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <select
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        {availableJobStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 w-48 md:w-auto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleCreateJob}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out"
                >
                    + Create New Job
                </button>
            </div>

            <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Schedule
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Last Run
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Next Run
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredJobs.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 whitespace-nowrap text-sm text-gray-500 text-center">
                                    No scheduled jobs found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredJobs.map((job) => (
                                <tr key={job.id} className="hover:bg-gray-800 transition duration-150 ease-in-out">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {job.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {job.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            job.status === 'Running' ? 'bg-blue-100 text-blue-800' :
                                            job.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                            job.status === 'Paused' ? 'bg-orange-100 text-orange-800' :
                                            'bg-red-100 text-red-800'}`}
                                        >
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {job.schedule}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {new Date(job.lastRun).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {new Date(job.nextRun).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleRunJobNow(job.id, job.name)}
                                            className="text-green-400 hover:text-green-300 ml-4 px-2 py-1 rounded"
                                            disabled={job.status === 'Running'}
                                            title="Manually run this job immediately"
                                        >
                                            Run Now
                                        </button>
                                        <button
                                            onClick={() => handleViewDetails(job.id)}
                                            className="text-indigo-400 hover:text-indigo-300 ml-4 px-2 py-1 rounded"
                                            title="View Job Details"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

/**
 * Provides a real-time overview of the system's operational health using various metrics.
 */
export const SystemHealthMonitor: React.FC = () => {
    const [metrics, setMetrics] = useState<SystemHealthMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Simulate real-time updates for system health metrics
        const interval = setInterval(() => {
            setMetrics(generateMockSystemHealthMetrics());
        }, 5000); // Update every 5 seconds
        // Initial load
        const initialLoadTimer = setTimeout(() => setIsLoading(false), 1000);
        return () => {
            clearInterval(interval);
            clearTimeout(initialLoadTimer);
        };
    }, []);

    if (isLoading) {
        return <Card title="System Health Monitoring" className="min-h-[250px] flex items-center justify-center"><p className="text-gray-400">Loading system health...</p></Card>;
    }

    return (
        <Card title="System Health Monitoring">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {metrics.map((metric) => (
                    <div key={metric.name} className={`p-4 rounded-lg shadow-md
                        ${metric.status === 'Critical' ? 'bg-red-900 border border-red-700' :
                        metric.status === 'Warning' ? 'bg-yellow-900 border border-yellow-700' :
                        'bg-gray-800 border border-gray-700'}`}>
                        <p className="text-lg font-medium text-white">{metric.name}</p>
                        <p className={`text-2xl font-bold mt-1
                            ${metric.status === 'Critical' ? 'text-red-300' :
                            metric.status === 'Warning' ? 'text-yellow-300' :
                            'text-green-300'}`}>
                            {metric.value.toFixed(metric.unit === '%' ? 2 : 0)}{metric.unit}
                        </p>
                        <p className="text-sm text-gray-400">{metric.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Last update: {new Date(metric.timestamp).toLocaleTimeString()}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

/**
 * Displays a live feed of recently sent messages, showing status updates in real-time.
 */
export const LiveCommunicationFeed: React.FC = () => {
    const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const interval = setInterval(() => {
            // Simulate new messages arriving or status updates
            setLiveMessages(prev => {
                const newMessages = generateMockLiveMessages(getRandomInt(1, 5)); // Add a few new ones
                const updatedMessages = prev.slice(0, 15).map(msg => { // Keep recent, maybe update status
                    if (msg.status === 'Sent' && getRandom(0, 1) > 0.7) {
                        return { ...msg, status: 'Delivered', timestamp: new Date().toISOString() };
                    }
                    if (msg.status === 'Delivered' && msg.channel === 'Email' && getRandom(0,1) > 0.8) {
                        return { ...msg, status: 'Opened', timestamp: new Date().toISOString() };
                    }
                    return msg;
                });
                return [...newMessages, ...updatedMessages].slice(0, 20); // Keep max 20 recent messages
            });
        }, 3000); // Update every 3 seconds

        const initialLoadTimer = setTimeout(() => {
            setLiveMessages(generateMockLiveMessages(getRandomInt(10, 20)));
            setIsLoading(false);
        }, 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(initialLoadTimer);
        };
    }, []);

    if (isLoading) {
        return <Card title="Live Communication Feed" className="min-h-[400px] flex items-center justify-center"><p className="text-gray-400">Loading live feed...</p></Card>;
    }

    const getStatusColor = (status: LiveMessage['status']) => {
        switch (status) {
            case 'Delivered':
            case 'Opened':
            case 'Clicked':
                return 'text-green-400';
            case 'Sent':
                return 'text-blue-400';
            case 'Failed':
            case 'Bounced':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <Card title="Live Communication Feed (Last Hour)">
            <div className="overflow-y-auto h-[350px] pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                {liveMessages.length === 0 ? (
                    <div className="text-gray-500 text-center py-4">No live messages to display.</div>
                ) : (
                    <ul className="space-y-3">
                        {liveMessages.map((msg) => (
                            <li key={msg.id} className="p-3 bg-gray-800 rounded-lg shadow-sm flex items-start space-x-3">
                                <div className="text-sm font-semibold text-gray-400 min-w-[70px]">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                                <div className="flex-grow">
                                    <p className="text-white text-base">
                                        <span className={`font-semibold ${getStatusColor(msg.status)}`}>{msg.status}</span>{' '}
                                        {msg.channel} to <span className="font-mono text-blue-300">{msg.recipient}</span>
                                    </p>
                                    {msg.campaignId && <p className="text-xs text-gray-500 mt-1">Campaign: {msg.campaignId}</p>}
                                    {msg.templateId && <p className="text-xs text-gray-500">Template: {msg.templateId}</p>}
                                    {msg.errorReason && (
                                        <p className="text-xs text-red-300 mt-1">Error: {msg.errorReason}</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Card>
    );
};

// --- MAIN VIEW COMPONENT (EXPANDED) ---

/**
 * The main component for the Demo Bank Communications Platform.
 * This component orchestrates various sub-components, providing a comprehensive dashboard
 * and navigation across different functional areas like campaigns, templates, audiences,
 * settings, reports, and administrative tools.
 */
const DemoBankCommunicationsView: React.FC = () => {
    // State to manage which section is currently active, simulating tabs or sidebar navigation.
    const [activeSection, setActiveSection] = useState('dashboard');

    // Dynamically render the active section based on the `activeSection` state.
    const renderSection = useCallback(() => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {/* Original summary cards */}
                            <Card className="text-center"><p className="text-3xl font-bold text-white">1.25M</p><p className="text-sm text-gray-400 mt-1">Emails Sent (30d)</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">850k</p><p className="text-sm text-gray-400 mt-1">SMS Sent (30d)</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">50k</p><p className="text-sm text-gray-400 mt-1">Voice Minutes (30d)</p></Card>
                        </div>

                        <CommunicationOverviewMetrics />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <ChannelUsagePieChart />
                            <Card title="Deliverability Rate (%)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={deliverabilityData}>
                                        <XAxis dataKey="name" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" domain={[98, 100]} unit="%" />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                        <Line type="monotone" dataKey="email" stroke="#8884d8" name="Email" />
                                        <Line type="monotone" dataKey="sms" stroke="#82ca9d" name="SMS" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                        <div className="mt-6">
                            <DailyCommunicationsTrend />
                        </div>
                    </>
                );
            case 'campaigns':
                return <CampaignList />;
            case 'templates':
                return <TemplateManager />;
            case 'audiences':
                return <AudienceSegmentManager />;
            case 'settings':
                return (
                    <div className="space-y-6">
                        <ChannelConfigurationManager />
                        <AlertRulesManager />
                    </div>
                );
            case 'reports':
                return (
                    <div className="space-y-6">
                        <CommunicationCostAnalysis />
                        <AuditLogViewer />
                    </div>
                );
            case 'admin':
                return (
                    <div className="space-y-6">
                        <UserAndRoleManagement />
                        <ScheduledJobsMonitor />
                        <SystemHealthMonitor />
                        <LiveCommunicationFeed />
                    </div>
                );
            default:
                return <div className="text-gray-400 text-center py-10">Select a section from the navigation above.</div>;
        }
    }, [activeSection]);

    /**
     * Helper component for rendering the top-level navigation tabs.
     * This acts as a primary navigation mechanism for the expanded application.
     */
    const NavigationTabs: React.FC = () => (
        <div className="flex flex-wrap gap-2 mb-6 p-2 bg-gray-800 rounded-lg shadow-xl">
            <button
                className={`py-2 px-4 rounded-md text-sm font-medium transition duration-200 ease-in-out
                    ${activeSection === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                onClick={() => setActiveSection('dashboard')}
            >
                Dashboard
            </button>
            <button
                className={`py-2 px-4 rounded-md text-sm font-medium transition duration-200 ease-in-out
                    ${activeSection === 'campaigns' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                onClick={() => setActiveSection('campaigns')}
            >
                Campaigns
            </button>
            <button
                className={`py-2 px-4 rounded-md text-sm font-medium transition duration-200 ease-in-out
                    ${activeSection === 'templates' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                onClick={() => setActiveSection('templates')}
            >
                Templates
            </button>
            <button
                className={`py-2 px-4 rounded-md text-sm font-medium transition duration-200 ease-in-out
                    ${activeSection === 'audiences' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                onClick={() => setActiveSection('audiences')}
            >
                Audiences
            </button>
            <button
                className={`py-2 px-4 rounded-md text-sm font-medium transition duration-200 ease-in-out
                    ${activeSection === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                onClick={() => setActiveSection('settings')}
            >
                Settings
            </button>
            <button
                className={`py-2 px-4 rounded-md text-sm font-medium transition duration-200 ease-in-out
                    ${activeSection === 'reports' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                onClick={() => setActiveSection('reports')}
            >
                Reports & Audit
            </button>
            <button
                className={`py-2 px-4 rounded-md text-sm font-medium transition duration-200 ease-in-out
                    ${activeSection === 'admin' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
                onClick={() => setActiveSection('admin')}
            >
                Admin Tools
            </button>
        </div>
    );


    return (
        <div className="space-y-6">
            {/* Main application header */}
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Communications Platform</h2>
            <p className="text-gray-400 text-lg">Comprehensive platform for managing customer communications across multiple channels, designed for enterprise banking operations.</p>
            
            {/* Top-level navigation for the application */}
            <NavigationTabs />

            {/* Render the content of the currently active section */}
            <div className="content-area min-h-[800px] flex flex-col">
                {renderSection()}
            </div>

            {/* Footer Placeholder for completeness */}
            <footer className="mt-10 text-center text-gray-500 text-sm py-4 border-t border-gray-700">
                <p>&copy; {new Date().getFullYear()} Demo Bank Communications. All rights reserved.</p>
                <p>Version 1.2.0 - Built for scale and compliance in the real world.</p>
            </footer>
        </div>
    );
};

export default DemoBankCommunicationsView;