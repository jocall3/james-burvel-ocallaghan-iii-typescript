import React, { useContext, useState, useEffect, useCallback, useReducer, useRef } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";
import type { Incident } from '../../../../types';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { EditorState, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { v4 as uuidv4 } from 'uuid';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export type IncidentStatus = 'ACTIVE' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
export type IncidentSeverity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4' | 'SEV5';
export type IncidentSource = 'MONITORING_ALERT' | 'USER_REPORT' | 'API_ERROR' | 'SYSTEM_LOG' | 'MANUAL';

export interface DetailedIncident extends Incident {
    status: IncidentStatus;
    severity: IncidentSeverity;
    source: IncidentSource;
    description: string;
    impactDescription: string;
    rootCauseDescription: string;
    affectedServices: string[];
    affectedComponents: string[];
    detectionTime: string; // ISO string
    startTime: string; // ISO string
    mitigationTime: string | null; // ISO string
    resolutionTime: string | null; // ISO string
    ownerId: string | null;
    currentTeam: string | null;
    relatedAlertIds: string[];
    timelineEvents: IncidentTimelineEvent[];
    actionItems: IncidentActionItem[];
    postmortemDoc: PostmortemDocument | null;
    linkedPlaybookId: string | null;
    tags: string[];
    comments: IncidentComment[];
    createdAt: string; // From base Incident type, ensure it's here too
    updatedAt: string; // To track last update time
}

export interface IncidentTimelineEvent {
    id: string;
    timestamp: string; // ISO string
    eventType: 'STATUS_CHANGE' | 'COMMENT_ADDED' | 'OWNER_ASSIGNED' | 'SEVERITY_CHANGED' | 'ACTION_ITEM_ADDED' | 'MITIGATION_STEP' | 'RESOLUTION_STEP' | 'CUSTOM_EVENT' | 'PLAYBOOK_STEP_EXECUTION';
    description: string;
    details?: Record<string, any>;
    userId?: string;
}

export type ActionItemStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

export interface IncidentActionItem {
    id: string;
    description: string;
    assignedTo: string; // User ID
    status: ActionItemStatus;
    dueDate: string | null; // ISO string
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
}

export type PostmortemSectionType = 'SUMMARY' | 'IMPACT' | 'ROOT_CAUSE' | 'RESOLUTION' | 'ACTION_ITEMS' | 'LESSONS_LEARNED' | 'PREVENTION' | 'TIMELINE';

export interface PostmortemSection {
    id: string;
    title: string;
    content: string; // HTML or Markdown content, stored as JSON string from Draft.js raw
    type: PostmortemSectionType;
    generatedByAI: boolean;
}

export interface PostmortemDocument {
    id: string;
    incidentId: string;
    title: string;
    sections: PostmortemSection[];
    status: 'DRAFT' | 'REVIEW' | 'PUBLISHED';
    createdAt: string;
    updatedAt: string;
    reviewedBy?: string[]; // User IDs
    approvedBy?: string | null; // User ID
}

export interface ServiceHealthMetric {
    serviceName: string;
    status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
    lastUpdated: string;
    incidentsLast24h: number;
    responseTimeMs: number;
    errorRate: number; // percentage
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'ENGINEER' | 'MANAGER' | 'VIEWER';
    onCall: boolean;
    slackId?: string;
}

export interface Playbook {
    id: string;
    name: string;
    description: string;
    steps: PlaybookStep[];
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export type PlaybookStepType = 'COMMAND' | 'MANUAL_TASK' | 'NOTIFICATION' | 'API_CALL' | 'CHECK_METRIC';
export type PlaybookStepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'FAILED';

export interface PlaybookStep {
    id: string;
    description: string;
    type: PlaybookStepType;
    command?: string; // e.g., 'kubectl get pods'
    target?: string; // e.g., 'Kubernetes', 'Slack'
    expectedOutput?: string;
    status: PlaybookStepStatus;
    executionLog?: string;
    assignedTo?: string; // User ID
    manualConfirmationRequired?: boolean;
    metricToCheck?: {
        service: string;
        metricName: string; // e.g., 'responseTime', 'errorRate'
        operator: 'gt' | 'lt' | 'eq';
        value: number;
    }
}

export interface IncidentComment {
    id: string;
    incidentId: string;
    userId: string;
    userName: string;
    timestamp: string;
    content: string;
}

export interface MetricDataPoint {
    timestamp: string; // ISO string
    value: number;
}

export interface TimeSeriesMetric {
    name: string;
    unit: string;
    data: MetricDataPoint[];
}

const mockUsers: UserProfile[] = [
    { id: 'usr-1', name: 'Alice Smith', email: 'alice@example.com', role: 'ENGINEER', onCall: true, slackId: 'U01ABC' },
    { id: 'usr-2', name: 'Bob Johnson', email: 'bob@example.com', role: 'MANAGER', onCall: false, slackId: 'U01DEF' },
    { id: 'usr-3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'ENGINEER', onCall: true, slackId: 'U01GHI' },
    { id: 'usr-4', name: 'Diana Prince', email: 'diana@example.com', role: 'ADMIN', onCall: false, slackId: 'U01JKL' },
    { id: 'usr-5', name: 'Eve Adams', email: 'eve@example.com', role: 'ENGINEER', onCall: false, slackId: 'U01MNO' },
    { id: 'usr-6', name: 'Frank White', email: 'frank@example.com', role: 'ENGINEER', onCall: false, slackId: 'U01PQR' },
    { id: 'usr-7', name: 'Grace Lee', email: 'grace@example.com', role: 'VIEWER', onCall: false, slackId: 'U01STU' },
    { id: 'usr-8', name: 'Henry King', email: 'henry@example.com', role: 'MANAGER', onCall: true, slackId: 'U01VWX' },
];

const mockServices: ServiceHealthMetric[] = [
    { serviceName: 'AuthService', status: 'OPERATIONAL', lastUpdated: new Date().toISOString(), incidentsLast24h: 0, responseTimeMs: 50, errorRate: 0.01 },
    { serviceName: 'PaymentGateway', status: 'DEGRADED', lastUpdated: new Date().toISOString(), incidentsLast24h: 1, responseTimeMs: 350, errorRate: 0.5 },
    { serviceName: 'NotificationService', status: 'OPERATIONAL', lastUpdated: new Date().toISOString(), incidentsLast24h: 0, responseTimeMs: 80, errorRate: 0.02 },
    { serviceName: 'DataAnalytics', status: 'OUTAGE', lastUpdated: new Date().toISOString(), incidentsLast24h: 1, responseTimeMs: 0, errorRate: 100 },
    { serviceName: 'UserManagement', status: 'OPERATIONAL', lastUpdated: new Date().toISOString(), incidentsLast24h: 0, responseTimeMs: 60, errorRate: 0.005 },
    { serviceName: 'ImageProcessing', status: 'DEGRADED', lastUpdated: new Date().toISOString(), incidentsLast24h: 0, responseTimeMs: 200, errorRate: 0.1 },
];

const generateMockMetrics = (name: string, unit: string, base: number, fluctuation: number, points: number = 60): TimeSeriesMetric => {
    const data: MetricDataPoint[] = [];
    let currentValue = base;
    for (let i = 0; i < points; i++) {
        const timestamp = new Date(Date.now() - (points - 1 - i) * 60 * 1000).toISOString(); // Last 60 minutes
        currentValue += (Math.random() - 0.5) * fluctuation;
        currentValue = Math.max(0, currentValue); // Ensure non-negative
        data.push({ timestamp, value: parseFloat(currentValue.toFixed(2)) });
    }
    return { name, unit, data };
};

const mockIncidentDetails: DetailedIncident[] = [
    {
        id: 'inc-1', title: 'Payment Gateway Latency Spike', severity: 'SEV2', status: 'INVESTIGATING',
        source: 'MONITORING_ALERT', description: 'Observed a significant increase in latency for the Payment Gateway service, affecting user transactions.',
        impactDescription: 'Users experiencing delays in payment processing, potential revenue loss.',
        rootCauseDescription: '', affectedServices: ['PaymentGateway'], affectedComponents: ['payment-api', 'transaction-db'],
        detectionTime: new Date(Date.now() - 3600 * 1000).toISOString(), startTime: new Date(Date.now() - 3700 * 1000).toISOString(),
        mitigationTime: null, resolutionTime: null, ownerId: 'usr-1', currentTeam: 'SRE-Payments', relatedAlertIds: ['alert-pg-latency-high-1', 'alert-pg-latency-high-2'],
        timelineEvents: [
            { id: uuidv4(), timestamp: new Date(Date.now() - 3700 * 1000).toISOString(), eventType: 'CUSTOM_EVENT', description: 'Issue detected by Prometheus alert.', userId: 'system' },
            { id: uuidv4(), timestamp: new Date(Date.now() - 3600 * 1000).toISOString(), eventType: 'STATUS_CHANGE', description: 'Status changed to ACTIVE.', details: { oldStatus: 'NEW', newStatus: 'ACTIVE' }, userId: 'usr-4' },
            { id: uuidv4(), timestamp: new Date(Date.now() - 3550 * 1000).toISOString(), eventType: 'OWNER_ASSIGNED', description: 'Assigned to Alice Smith.', details: { oldOwner: null, newOwner: 'usr-1' }, userId: 'usr-4' },
            { id: uuidv4(), timestamp: new Date(Date.now() - 3500 * 1000).toISOString(), eventType: 'COMMENT_ADDED', description: 'Initial investigation ongoing, checking recent deployments.', userId: 'usr-1' },
            { id: uuidv4(), timestamp: new Date(Date.now() - 3000 * 1000).toISOString(), eventType: 'STATUS_CHANGE', description: 'Status changed to INVESTIGATING.', details: { oldStatus: 'ACTIVE', newStatus: 'INVESTIGATING' }, userId: 'usr-1' },
        ],
        actionItems: [
            { id: uuidv4(), description: 'Review recent deployments in Payment Gateway service.', assignedTo: 'usr-1', status: 'IN_PROGRESS', dueDate: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: uuidv4(), description: 'Check database connection pool for Payment Gateway.', assignedTo: 'usr-3', status: 'OPEN', dueDate: new Date(Date.now() + 3 * 3600 * 1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ],
        postmortemDoc: null, linkedPlaybookId: 'pb-1', tags: ['payments', 'latency', 'production'], comments: [],
        createdAt: new Date(Date.now() - 3700 * 1000).toISOString(), updatedAt: new Date(Date.now() - 3000 * 1000).toISOString(),
    },
    {
        id: 'inc-2', title: 'Data Analytics Service Outage', severity: 'SEV1', status: 'ACTIVE',
        source: 'MONITORING_ALERT', description: 'The Data Analytics service is completely down, leading to reporting failures.',
        impactDescription: 'Critical business reporting unavailable, impacting decision-making.',
        rootCauseDescription: '', affectedServices: ['DataAnalytics'], affectedComponents: ['analytics-backend', 'data-pipeline'],
        detectionTime: new Date(Date.now() - 1200 * 1000).toISOString(), startTime: new Date(Date.now() - 1300 * 1000).toISOString(),
        mitigationTime: null, resolutionTime: null, ownerId: 'usr-3', currentTeam: 'SRE-Data', relatedAlertIds: ['alert-da-down'],
        timelineEvents: [
            { id: uuidv4(), timestamp: new Date(Date.now() - 1300 * 1000).toISOString(), eventType: 'CUSTOM_EVENT', description: 'Paging triggered for Data Analytics team.', userId: 'system' },
            { id: uuidv4(), timestamp: new Date(Date.now() - 1250 * 1000).toISOString(), eventType: 'OWNER_ASSIGNED', description: 'Assigned to Charlie Brown.', details: { oldOwner: null, newOwner: 'usr-3' }, userId: 'usr-4' },
            { id: uuidv4(), timestamp: new Date(Date.now() - 1200 * 1000).toISOString(), eventType: 'STATUS_CHANGE', description: 'Status changed to ACTIVE.', details: { oldStatus: 'NEW', newStatus: 'ACTIVE' }, userId: 'usr-3' },
            { id: uuidv4(), timestamp: new Date(Date.now() - 1100 * 1000).toISOString(), eventType: 'COMMENT_ADDED', description: 'Restarted analytics-backend pods, observing logs.', userId: 'usr-3' },
        ],
        actionItems: [
             { id: uuidv4(), description: 'Escalate to Tier 2 support for database investigation.', assignedTo: 'usr-8', status: 'OPEN', dueDate: new Date(Date.now() + 1 * 3600 * 1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ],
        postmortemDoc: null, linkedPlaybookId: 'pb-2', tags: ['data', 'outage', 'critical'], comments: [],
        createdAt: new Date(Date.now() - 1300 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1100 * 1000).toISOString(),
    },
    {
        id: 'inc-3', title: 'Authentication Service Login Failures', severity: 'SEV3', status: 'MITIGATED',
        source: 'USER_REPORT', description: 'Users reporting intermittent login failures on authentication service.',
        impactDescription: 'Some users unable to log in, affecting user experience.',
        rootCauseDescription: 'Database connection pool exhaustion due to misconfigured max connections.',
        affectedServices: ['AuthService'], affectedComponents: ['auth-api', 'user-db'],
        detectionTime: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), startTime: new Date(Date.now() - 10 * 24 * 3600 * 1000 - 60 * 60 * 1000).toISOString(),
        mitigationTime: new Date(Date.now() - 10 * 24 * 3600 * 1000 + 30 * 60 * 1000).toISOString(),
        resolutionTime: new Date(Date.now() - 10 * 24 * 3600 * 1000 + 2 * 3600 * 1000).toISOString(),
        ownerId: 'usr-1', currentTeam: 'SRE-Auth', relatedAlertIds: ['alert-auth-login-fail'],
        timelineEvents: [
            { id: uuidv4(), timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000 - 60 * 60 * 1000).toISOString(), eventType: 'CUSTOM_EVENT', description: 'Users report login failures.' },
            { id: uuidv4(), timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), eventType: 'STATUS_CHANGE', description: 'Incident set to ACTIVE.' },
            { id: uuidv4(), timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000 + 30 * 60 * 1000).toISOString(), eventType: 'MITIGATION_STEP', description: 'Increased DB connection pool size.' },
            { id: uuidv4(), timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000 + 2 * 3600 * 1000).toISOString(), eventType: 'RESOLUTION_STEP', description: 'Root cause identified and remediated.' },
        ],
        actionItems: [
            { id: uuidv4(), description: 'Update DB connection pool configuration in production.', assignedTo: 'usr-4', status: 'DONE', dueDate: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: uuidv4(), description: 'Add monitoring for DB connection pool utilization.', assignedTo: 'usr-2', status: 'DONE', dueDate: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: uuidv4(), description: 'Review all service configurations for similar pitfalls.', assignedTo: 'usr-2', status: 'OPEN', dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ],
        postmortemDoc: {
            id: 'pm-3', incidentId: 'inc-3', title: 'Postmortem for Auth Service Login Failures', status: 'PUBLISHED',
            createdAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(), updatedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
            sections: [
                { id: uuidv4(), type: 'SUMMARY', title: 'Summary', content: JSON.stringify(convertToRaw(ContentState.createFromText('On YYYY-MM-DD, the Authentication Service experienced intermittent login failures for a duration of ~2 hours due to database connection pool exhaustion.'))), generatedByAI: false },
                { id: uuidv4(), type: 'IMPACT', title: 'Impact', content: JSON.stringify(convertToRaw(ContentState.createFromText('Approximately 15% of login attempts failed, resulting in degraded user experience and potential loss of active users during the incident window.'))), generatedByAI: false },
                { id: uuidv4(), type: 'ROOT_CAUSE', title: 'Root Cause', content: JSON.stringify(convertToRaw(ContentState.createFromText('The primary root cause was an incorrectly configured `max_connections` parameter in the database connection pool, which was exhausted under peak load. A recent deployment increased traffic without adjusting this setting.'))), generatedByAI: false },
                { id: uuidv4(), type: 'RESOLUTION', title: 'Resolution', content: JSON.stringify(convertToRaw(ContentState.createFromText('The incident was mitigated by increasing the `max_connections` parameter and restarting the AuthService instances. Full resolution involved a configuration update.'))), generatedByAI: false },
                { id: uuidv4(), type: 'ACTION_ITEMS', title: 'Action Items', content: JSON.stringify(convertToRaw(ContentState.createFromText('1. Update DB connection pool configuration (DONE). 2. Add monitoring for DB connection pool utilization (DONE). 3. Review all service configurations for similar pitfalls (OPEN).'))), generatedByAI: false },
            ],
            approvedBy: 'usr-2',
        },
        linkedPlaybookId: null, tags: ['auth', 'database', 'resolved'], comments: [],
        createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000 - 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    },
    ...Array.from({ length: 20 }).map((_, i) => {
        const id = `inc-${i + 4}`;
        const severity: IncidentSeverity = ['SEV1', 'SEV2', 'SEV3', 'SEV4', 'SEV5'][Math.floor(Math.random() * 5)] as IncidentSeverity;
        const status: IncidentStatus = ['ACTIVE', 'INVESTIGATING', 'MITIGATED', 'RESOLVED', 'CLOSED'][Math.floor(Math.random() * 5)] as IncidentStatus;
        const services = ['AuthService', 'PaymentGateway', 'NotificationService', 'DataAnalytics', 'UserManagement', 'ImageProcessing'];
        const affectedService = services[Math.floor(Math.random() * services.length)];
        const title = `${affectedService} - Random Issue ${i + 1}`;
        const startTime = new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString();
        const detectionTime = new Date(new Date(startTime).getTime() + Math.random() * 60 * 1000).toISOString();
        const ownerId = mockUsers[Math.floor(Math.random() * mockUsers.length)].id;
        const hasPostmortem = Math.random() > 0.5;

        return {
            id, title, severity, status,
            source: 'MONITORING_ALERT', description: `Simulated incident for ${affectedService}. Details about performance degradation.`,
            impactDescription: `Minor impact on ${affectedService} users.`,
            rootCauseDescription: hasPostmortem ? 'Simulated root cause for testing purposes.' : '',
            affectedServices: [affectedService], affectedComponents: [],
            detectionTime, startTime,
            mitigationTime: status === 'MITIGATED' || status === 'RESOLVED' || status === 'CLOSED' ? new Date(new Date(detectionTime).getTime() + Math.random() * 30 * 60 * 1000).toISOString() : null,
            resolutionTime: status === 'RESOLVED' || status === 'CLOSED' ? new Date(new Date(detectionTime).getTime() + Math.random() * 120 * 60 * 1000).toISOString() : null,
            ownerId, currentTeam: 'SRE-General', relatedAlertIds: [], timelineEvents: [], actionItems: [],
            postmortemDoc: hasPostmortem ? {
                id: `pm-${id}`, incidentId: id, title: `Postmortem for ${id}`, status: Math.random() > 0.5 ? 'PUBLISHED' : 'DRAFT',
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sections: [],
            } : null,
            linkedPlaybookId: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'pb-1' : 'pb-2') : null, tags: [affectedService.toLowerCase(), 'simulated'], comments: [],
            createdAt: startTime, updatedAt: new Date().toISOString(),
        };
    })
];


const mockPlaybooks: Playbook[] = [
    {
        id: 'pb-1', name: 'Payment Gateway Latency Debug', description: 'Steps to debug and resolve payment gateway latency issues.',
        steps: [
            { id: uuidv4(), description: 'Check Payment Gateway service metrics for high response times.', type: 'CHECK_METRIC', metricToCheck: { service: 'PaymentGateway', metricName: 'responseTime', operator: 'gt', value: 200 }, status: 'PENDING', assignedTo: 'usr-1' },
            { id: uuidv4(), description: 'Review recent deployments to Payment Gateway service.', type: 'MANUAL_TASK', status: 'PENDING', assignedTo: 'usr-1' },
            { id: uuidv4(), description: 'Scale up Payment Gateway application instances.', type: 'COMMAND', command: 'kubectl scale deployment payment-gateway --replicas=5', target: 'Kubernetes', status: 'PENDING' },
            { id: uuidv4(), description: 'Notify #payment-alerts Slack channel of ongoing issue.', type: 'NOTIFICATION', target: 'Slack', status: 'PENDING' },
            { id: uuidv4(), description: 'Verify latency reduction via monitoring dashboards.', type: 'CHECK_METRIC', metricToCheck: { service: 'PaymentGateway', metricName: 'responseTime', operator: 'lt', value: 100 }, status: 'PENDING', assignedTo: 'usr-1' },
        ],
        tags: ['payments', 'playbook'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
        id: 'pb-2', name: 'Data Analytics Service Restart', description: 'Procedure to restart and verify the Data Analytics service.',
        steps: [
            { id: uuidv4(), description: 'Confirm Data Analytics service is down via monitoring.', type: 'MANUAL_TASK', status: 'PENDING', assignedTo: 'usr-3', manualConfirmationRequired: true },
            { id: uuidv4(), description: 'Restart analytics-backend pods.', type: 'COMMAND', command: 'kubectl rollout restart deployment analytics-backend', target: 'Kubernetes', status: 'PENDING' },
            { id: uuidv4(), description: 'Verify service status and data processing via dashboards.', type: 'MANUAL_TASK', status: 'PENDING', assignedTo: 'usr-3' },
            { id: uuidv4(), description: 'Post update in #data-analytics Slack channel.', type: 'NOTIFICATION', target: 'Slack', status: 'PENDING' },
        ],
        tags: ['data', 'playbook'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
];

let incidentDataStore: DetailedIncident[] = [...mockIncidentDetails];

export const IncidentApiService = {
    fetchIncidents: async (filters?: { status?: IncidentStatus[], severity?: IncidentSeverity[], service?: string, search?: string }): Promise<DetailedIncident[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        let filtered = incidentDataStore;

        if (filters?.status && filters.status.length > 0) {
            filtered = filtered.filter(inc => filters.status!.includes(inc.status));
        }
        if (filters?.severity && filters.severity.length > 0) {
            filtered = filtered.filter(inc => filters.severity!.includes(inc.severity));
        }
        if (filters?.service) {
            filtered = filtered.filter(inc => inc.affectedServices.includes(filters.service!));
        }
        if (filters?.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(inc =>
                inc.title.toLowerCase().includes(searchTerm) ||
                inc.description.toLowerCase().includes(searchTerm) ||
                inc.id.toLowerCase().includes(searchTerm) ||
                inc.affectedServices.some(s => s.toLowerCase().includes(searchTerm)) ||
                inc.tags.some(t => t.toLowerCase().includes(searchTerm))
            );
        }

        return JSON.parse(JSON.stringify(filtered));
    },

    fetchIncidentById: async (id: string): Promise<DetailedIncident | null> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return JSON.parse(JSON.stringify(incidentDataStore.find(inc => inc.id === id) || null));
    },

    updateIncident: async (incident: DetailedIncident, userId: string = 'system'): Promise<DetailedIncident> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = incidentDataStore.findIndex(inc => inc.id === incident.id);
        if (index > -1) {
            const oldIncident = incidentDataStore[index];
            const updatedIncident = { ...oldIncident, ...incident, updatedAt: new Date().toISOString() };

            const newTimelineEvents: IncidentTimelineEvent[] = [];
            if (oldIncident.status !== updatedIncident.status) {
                newTimelineEvents.push({
                    id: uuidv4(), timestamp: new Date().toISOString(), eventType: 'STATUS_CHANGE',
                    description: `Status changed from ${oldIncident.status} to ${updatedIncident.status}.`,
                    details: { oldStatus: oldIncident.status, newStatus: updatedIncident.status }, userId
                });
            }
            if (oldIncident.severity !== updatedIncident.severity) {
                newTimelineEvents.push({
                    id: uuidv4(), timestamp: new Date().toISOString(), eventType: 'SEVERITY_CHANGED',
                    description: `Severity changed from ${oldIncident.severity} to ${updatedIncident.severity}.`,
                    details: { oldSeverity: oldIncident.severity, newSeverity: updatedIncident.severity }, userId
                });
            }
            if (oldIncident.ownerId !== updatedIncident.ownerId) {
                const oldOwnerName = mockUsers.find(u => u.id === oldIncident.ownerId)?.name || 'Unassigned';
                const newOwnerName = mockUsers.find(u => u.id === updatedIncident.ownerId)?.name || 'Unassigned';
                newTimelineEvents.push({
                    id: uuidv4(), timestamp: new Date().toISOString(), eventType: 'OWNER_ASSIGNED',
                    description: `Owner changed from ${oldOwnerName} to ${newOwnerName}.`,
                    details: { oldOwner: oldIncident.ownerId, newOwner: updatedIncident.ownerId }, userId
                });
            }
            // Add other field change tracking as needed

            updatedIncident.timelineEvents = [...updatedIncident.timelineEvents, ...newTimelineEvents];
            incidentDataStore[index] = updatedIncident;
            return JSON.parse(JSON.stringify(incidentDataStore[index]));
        }
        throw new Error('Incident not found');
    },

    createIncident: async (newIncidentData: Partial<DetailedIncident>, userId: string = 'system'): Promise<DetailedIncident> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const now = new Date().toISOString();
        const newIncident: DetailedIncident = {
            id: `inc-${uuidv4().substring(0, 8)}`,
            title: newIncidentData.title || 'New Incident',
            severity: newIncidentData.severity || 'SEV3',
            status: newIncidentData.status || 'ACTIVE',
            source: newIncidentData.source || 'MANUAL',
            description: newIncidentData.description || 'No description provided.',
            impactDescription: newIncidentData.impactDescription || '',
            rootCauseDescription: '',
            affectedServices: newIncidentData.affectedServices || [],
            affectedComponents: newIncidentData.affectedComponents || [],
            detectionTime: newIncidentData.detectionTime || now,
            startTime: newIncidentData.startTime || now,
            mitigationTime: null,
            resolutionTime: null,
            ownerId: newIncidentData.ownerId || null,
            currentTeam: newIncidentData.currentTeam || null,
            relatedAlertIds: newIncidentData.relatedAlertIds || [],
            timelineEvents: [
                { id: uuidv4(), timestamp: now, eventType: 'CUSTOM_EVENT', description: 'Incident created.', userId }
            ],
            actionItems: [],
            postmortemDoc: null,
            linkedPlaybookId: newIncidentData.linkedPlaybookId || null,
            tags: newIncidentData.tags || [],
            comments: [],
            createdAt: now,
            updatedAt: now,
        };
        incidentDataStore.push(newIncident);
        return JSON.parse(JSON.stringify(newIncident));
    },

    fetchUsers: async (): Promise<UserProfile[]> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return JSON.parse(JSON.stringify(mockUsers));
    },

    fetchServiceHealth: async (): Promise<ServiceHealthMetric[]> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return JSON.parse(JSON.stringify(mockServices));
    },

    fetchMetricData: async (metricName: string, serviceName?: string, durationMinutes: number = 60): Promise<TimeSeriesMetric> => {
        await new Promise(resolve => setTimeout(resolve, 150));
        let baseValue = 0;
        let fluctuation = 0;
        let unit = '';

        if (metricName === 'responseTime') {
            baseValue = serviceName === 'PaymentGateway' ? 300 : (serviceName === 'DataAnalytics' ? 0 : 80);
            fluctuation = serviceName === 'PaymentGateway' ? 100 : 20;
            unit = 'ms';
        } else if (metricName === 'errorRate') {
            baseValue = serviceName === 'PaymentGateway' ? 0.5 : (serviceName === 'DataAnalytics' ? 100 : 0.05);
            fluctuation = serviceName === 'PaymentGateway' ? 0.3 : 0.03;
            unit = '%';
        } else if (metricName === 'incidentCount') {
            baseValue = 1;
            fluctuation = 0.5;
            unit = 'incidents';
        } else {
            baseValue = 100;
            fluctuation = 10;
            unit = 'units';
        }
        return generateMockMetrics(metricName, unit, baseValue, fluctuation, durationMinutes);
    },

    addIncidentComment: async (incidentId: string, userId: string, userName: string, content: string): Promise<IncidentComment> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const incident = incidentDataStore.find(inc => inc.id === incidentId);
        if (!incident) throw new Error('Incident not found');

        const now = new Date().toISOString();
        const newComment: IncidentComment = {
            id: uuidv4(),
            incidentId,
            userId,
            userName,
            timestamp: now,
            content,
        };
        incident.comments.push(newComment);
        incident.timelineEvents.push({
            id: uuidv4(), timestamp: now, eventType: 'COMMENT_ADDED', description: `Comment added by ${userName}.`, userId
        });
        incident.updatedAt = now;
        return JSON.parse(JSON.stringify(newComment));
    },

    addActionItem: async (incidentId: string, description: string, assignedTo: string, dueDate: string | null, userId: string = 'system'): Promise<IncidentActionItem> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const incident = incidentDataStore.find(inc => inc.id === incidentId);
        if (!incident) throw new Error('Incident not found');

        const now = new Date().toISOString();
        const newActionItem: IncidentActionItem = {
            id: uuidv4(),
            description,
            assignedTo,
            status: 'OPEN',
            dueDate,
            createdAt: now,
            updatedAt: now,
        };
        incident.actionItems.push(newActionItem);
        const assigneeName = mockUsers.find(u => u.id === assignedTo)?.name || 'Unknown User';
        incident.timelineEvents.push({
            id: uuidv4(), timestamp: now, eventType: 'ACTION_ITEM_ADDED', description: `Action item created: "${description}" assigned to ${assigneeName}.`, userId
        });
        incident.updatedAt = now;
        return JSON.parse(JSON.stringify(newActionItem));
    },

    updateActionItem: async (incidentId: string, actionItem: IncidentActionItem, userId: string = 'system'): Promise<IncidentActionItem> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const incident = incidentDataStore.find(inc => inc.id === incidentId);
        if (!incident) throw new Error('Incident not found');

        const index = incident.actionItems.findIndex(ai => ai.id === actionItem.id);
        if (index > -1) {
            const oldStatus = incident.actionItems[index].status;
            incident.actionItems[index] = { ...incident.actionItems[index], ...actionItem, updatedAt: new Date().toISOString() };
            if (oldStatus !== actionItem.status) {
                incident.timelineEvents.push({
                    id: uuidv4(), timestamp: new Date().toISOString(), eventType: 'CUSTOM_EVENT', description: `Action item "${actionItem.description}" status updated from ${oldStatus} to ${actionItem.status}.`, userId
                });
            }
            incident.updatedAt = new Date().toISOString();
            return JSON.parse(JSON.stringify(incident.actionItems[index]));
        }
        throw new Error('Action item not found');
    },

    fetchPlaybooks: async (): Promise<Playbook[]> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return JSON.parse(JSON.stringify(mockPlaybooks));
    },

    fetchPlaybookById: async (id: string): Promise<Playbook | null> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return JSON.parse(JSON.stringify(mockPlaybooks.find(pb => pb.id === id) || null));
    },

    updatePlaybookStepStatus: async (incidentId: string, playbookId: string, stepId: string, status: PlaybookStepStatus, userId: string = 'system'): Promise<Playbook> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const playbook = mockPlaybooks.find(pb => pb.id === playbookId);
        if (!playbook) throw new Error('Playbook not found');

        const step = playbook.steps.find(s => s.id === stepId);
        if (!step) throw new Error('Playbook step not found');

        const oldStatus = step.status;
        step.status = status;
        step.executionLog = (step.executionLog || '') + `\n[${formatTimestamp(new Date().toISOString())}] Step status changed to ${status} by ${mockUsers.find(u => u.id === userId)?.name || 'System'}.`;

        const incident = incidentDataStore.find(inc => inc.id === incidentId);
        if (incident && oldStatus !== status) {
            incident.timelineEvents.push({
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                eventType: 'PLAYBOOK_STEP_EXECUTION',
                description: `Playbook step "${step.description}" status changed to ${status}.`,
                details: { playbookId, stepId, oldStatus, newStatus: status },
                userId
            });
            incident.updatedAt = new Date().toISOString();
        }
        return JSON.parse(JSON.stringify(playbook));
    },

    savePostmortem: async (postmortem: PostmortemDocument, userId: string = 'system'): Promise<PostmortemDocument> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const incident = incidentDataStore.find(inc => inc.id === postmortem.incidentId);
        if (!incident) throw new Error('Incident not found for postmortem');

        const now = new Date().toISOString();
        if (!incident.postmortemDoc) {
            incident.postmortemDoc = { ...postmortem, id: `pm-${incident.id}`, createdAt: now, updatedAt: now };
        } else {
            incident.postmortemDoc = { ...incident.postmortemDoc, ...postmortem, updatedAt: now };
        }
        incident.timelineEvents.push({
            id: uuidv4(), timestamp: now, eventType: 'CUSTOM_EVENT', description: `Postmortem document saved (Status: ${postmortem.status}).`, userId
        });
        incident.updatedAt = now;
        return JSON.parse(JSON.stringify(incident.postmortemDoc));
    },

    submitPostmortemForReview: async (pmId: string, incidentId: string, userId: string = 'system'): Promise<PostmortemDocument> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const incident = incidentDataStore.find(inc => inc.id === incidentId);
        if (!incident?.postmortemDoc || incident.postmortemDoc.id !== pmId) throw new Error('Postmortem not found');

        incident.postmortemDoc.status = 'REVIEW';
        incident.postmortemDoc.updatedAt = new Date().toISOString();
        incident.timelineEvents.push({
            id: uuidv4(), timestamp: new Date().toISOString(), eventType: 'CUSTOM_EVENT', description: 'Postmortem submitted for review.', userId
        });
        incident.updatedAt = new Date().toISOString();
        return JSON.parse(JSON.stringify(incident.postmortemDoc));
    },

    approvePostmortem: async (pmId: string, incidentId: string, approverId: string): Promise<PostmortemDocument> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const incident = incidentDataStore.find(inc => inc.id === incidentId);
        if (!incident?.postmortemDoc || incident.postmortemDoc.id !== pmId) throw new Error('Postmortem not found');

        incident.postmortemDoc.status = 'PUBLISHED';
        incident.postmortemDoc.approvedBy = approverId;
        incident.postmortemDoc.updatedAt = new Date().toISOString();
        incident.timelineEvents.push({
            id: uuidv4(), timestamp: new Date().toISOString(), eventType: 'CUSTOM_EVENT', description: `Postmortem approved and published by ${mockUsers.find(u => u.id === approverId)?.name || 'Unknown'}.`, userId: approverId
        });
        incident.updatedAt = new Date().toISOString();
        return JSON.parse(JSON.stringify(incident.postmortemDoc));
    },
};

export const formatTimestamp = (isoString: string | null, includeTime: boolean = true): string => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: includeTime ? '2-digit' : undefined,
        minute: includeTime ? '2-digit' : undefined,
        second: includeTime ? '2-digit' : undefined,
        hour12: false
    });
};

export const getSeverityColorClass = (severity: IncidentSeverity): string => {
    switch (severity) {
        case 'SEV1': return 'bg-red-700 text-white';
        case 'SEV2': return 'bg-orange-600 text-white';
        case 'SEV3': return 'bg-yellow-500 text-black';
        case 'SEV4': return 'bg-blue-500 text-white';
        case 'SEV5': return 'bg-green-500 text-white';
        default: return 'bg-gray-500 text-white';
    }
};

export const getStatusColorClass = (status: IncidentStatus): string => {
    switch (status) {
        case 'ACTIVE': return 'text-red-400';
        case 'INVESTIGATING': return 'text-orange-400';
        case 'MITIGATED': return 'text-yellow-400';
        case 'RESOLVED': return 'text-green-400';
        case 'CLOSED': return 'text-gray-500';
        case 'CANCELLED': return 'text-gray-600';
        default: return 'text-gray-400';
    }
};

export const IncidentDetailsModal: React.FC<{
    incident: DetailedIncident;
    users: UserProfile[];
    onClose: () => void;
    onUpdateIncident: (incident: DetailedIncident) => void;
}> = ({ incident, users, onClose, onUpdateIncident }) => {
    const [currentIncident, setCurrentIncident] = useState<DetailedIncident>(incident);
    const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'action-items' | 'comments' | 'postmortem' | 'playbook' | 'metrics'>('overview');
    const [isSaving, setIsSaving] = useState(false);
    const { currentUser } = useContext(DataContext);

    useEffect(() => {
        setCurrentIncident(incident);
        if (incident.linkedPlaybookId && activeTab !== 'playbook' && activeTab !== 'overview' && activeTab !== 'metrics') {
            setActiveTab('playbook'); // Automatically switch to playbook if linked and not already on a primary tab
        } else if (!incident.linkedPlaybookId && activeTab === 'playbook') {
            setActiveTab('overview'); // Switch back if playbook unlinked
        }
    }, [incident]);

    const handleFieldChange = useCallback((field: keyof DetailedIncident, value: any) => {
        setCurrentIncident(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSaveIncident = async () => {
        setIsSaving(true);
        try {
            const updated = await IncidentApiService.updateIncident(currentIncident, currentUser?.id || 'system');
            onUpdateIncident(updated);
            alert('Incident updated successfully!');
        } catch (error) {
            console.error('Failed to update incident:', error);
            alert('Failed to update incident.');
        } finally {
            setIsSaving(false);
        }
    };

    const getOwnerName = (ownerId: string | null) => users.find(u => u.id === ownerId)?.name || 'Unassigned';
    const getAssigneeName = (assigneeId: string) => users.find(u => u.id === assigneeId)?.name || 'Unknown User';

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">{currentIncident.title} <span className={`ml-2 text-sm px-2 py-1 rounded-full ${getSeverityColorClass(currentIncident.severity)}`}>{currentIncident.severity}</span></h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold leading-none">&times;</button>
                </div>
                <div className="flex-grow flex flex-col">
                    <div className="flex border-b border-gray-700 overflow-x-auto">
                        {['overview', 'timeline', 'action-items', 'comments', 'postmortem', (currentIncident.linkedPlaybookId ? 'playbook' : null), 'metrics'].filter(Boolean).map(tab => (
                            <button
                                key={tab}
                                className={`flex-shrink-0 py-3 px-6 text-sm font-medium ${activeTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                                onClick={() => setActiveTab(tab as any)}
                            >
                                {tab?.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </button>
                        ))}
                    </div>

                    <div className="flex-grow p-6 space-y-4 overflow-y-auto">
                        {activeTab === 'overview' && (
                            <IncidentOverviewTab incident={currentIncident} users={users} onFieldChange={handleFieldChange} onSave={handleSaveIncident} isSaving={isSaving} getOwnerName={getOwnerName} />
                        )}
                        {activeTab === 'timeline' && (
                            <IncidentTimelineTab incident={currentIncident} users={users} />
                        )}
                        {activeTab === 'action-items' && (
                            <IncidentActionItemsTab incident={currentIncident} users={users} onUpdateIncident={onUpdateIncident} getAssigneeName={getAssigneeName} />
                        )}
                        {activeTab === 'comments' && (
                            <IncidentCommentsTab incident={currentIncident} users={users} onUpdateIncident={onUpdateIncident} />
                        )}
                        {activeTab === 'postmortem' && (
                            <IncidentPostmortemTab incident={currentIncident} users={users} onUpdateIncident={onUpdateIncident} />
                        )}
                        {activeTab === 'playbook' && currentIncident.linkedPlaybookId && (
                            <IncidentPlaybookTab incident={currentIncident} users={users} onUpdateIncident={onUpdateIncident} />
                        )}
                        {activeTab === 'metrics' && (
                            <IncidentMetricsTab incident={currentIncident} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const IncidentOverviewTab: React.FC<{
    incident: DetailedIncident;
    users: UserProfile[];
    onFieldChange: (field: keyof DetailedIncident, value: any) => void;
    onSave: () => void;
    isSaving: boolean;
    getOwnerName: (ownerId: string | null) => string;
}> = ({ incident, users, onFieldChange, onSave, isSaving, getOwnerName }) => {
    const { currentUser } = useContext(DataContext);
    const [selectedUserForAssignment, setSelectedUserForAssignment] = useState(incident.ownerId || '');

    useEffect(() => {
        if (selectedUserForAssignment !== incident.ownerId) {
            onFieldChange('ownerId', selectedUserForAssignment || null);
        }
    }, [selectedUserForAssignment, incident.ownerId, onFieldChange]);

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
        onFieldChange('tags', tags);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2 space-y-4">
                <label className="block text-gray-300 text-sm font-bold mb-1">Title:</label>
                <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                    value={incident.title}
                    onChange={(e) => onFieldChange('title', e.target.value)}
                />

                <label className="block text-gray-300 text-sm font-bold mb-1">Description:</label>
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 h-24"
                    value={incident.description}
                    onChange={(e) => onFieldChange('description', e.target.value)}
                />

                <label className="block text-gray-300 text-sm font-bold mb-1">Impact Description:</label>
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 h-20"
                    value={incident.impactDescription}
                    onChange={(e) => onFieldChange('impactDescription', e.target.value)}
                />
            </div>

            <div>
                <label className="block text-gray-300 text-sm font-bold mb-1">Severity:</label>
                <select
                    className="shadow border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                    value={incident.severity}
                    onChange={(e) => onFieldChange('severity', e.target.value as IncidentSeverity)}
                >
                    {['SEV1', 'SEV2', 'SEV3', 'SEV4', 'SEV5'].map(sev => <option key={sev} value={sev}>{sev}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-gray-300 text-sm font-bold mb-1">Status:</label>
                <select
                    className="shadow border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                    value={incident.status}
                    onChange={(e) => onFieldChange('status', e.target.value as IncidentStatus)}
                >
                    {['ACTIVE', 'INVESTIGATING', 'MITIGATED', 'RESOLVED', 'CLOSED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-gray-300 text-sm font-bold mb-1">Owner:</label>
                <select
                    className="shadow border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                    value={selectedUserForAssignment}
                    onChange={(e) => setSelectedUserForAssignment(e.target.value)}
                >
                    <option value="">Unassigned</option>
                    {users.filter(u => u.role === 'ENGINEER' || u.role === 'MANAGER' || u.onCall).map(user => (
                        <option key={user.id} value={user.id}>{user.name} {user.onCall && '(On-Call)'}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-gray-300 text-sm font-bold mb-1">Current Team:</label>
                <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                    value={incident.currentTeam || ''}
                    onChange={(e) => onFieldChange('currentTeam', e.target.value)}
                />
            </div>
            <div className="col-span-1 md:col-span-2">
                <label className="block text-gray-300 text-sm font-bold mb-1">Affected Services (comma-separated):</label>
                <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                    value={incident.affectedServices.join(', ')}
                    onChange={(e) => onFieldChange('affectedServices', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
            </div>
            <div className="col-span-1 md:col-span-2">
                <label className="block text-gray-300 text-sm font-bold mb-1">Tags (comma-separated):</label>
                <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                    value={incident.tags.join(', ')}
                    onChange={handleTagsChange}
                />
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
                <button
                    onClick={onSave}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            <div className="col-span-1 md:col-span-2 mt-4 text-sm text-gray-400 border-t border-gray-700 pt-4">
                <p><strong>Incident ID:</strong> {incident.id}</p>
                <p><strong>Source:</strong> {incident.source}</p>
                <p><strong>Created At:</strong> {formatTimestamp(incident.createdAt)}</p>
                <p><strong>Last Updated:</strong> {formatTimestamp(incident.updatedAt)}</p>
                <p><strong>Detected:</strong> {formatTimestamp(incident.detectionTime)}</p>
                <p><strong>Started:</strong> {formatTimestamp(incident.startTime)}</p>
                <p><strong>Mitigated:</strong> {formatTimestamp(incident.mitigationTime)}</p>
                <p><strong>Resolved:</strong> {formatTimestamp(incident.resolutionTime)}</p>
                <p><strong>Assigned Owner:</strong> {getOwnerName(incident.ownerId)}</p>
                {incident.linkedPlaybookId && <p><strong>Linked Playbook:</strong> {incident.linkedPlaybookId}</p>}
                {incident.relatedAlertIds.length > 0 && <p><strong>Related Alerts:</strong> {incident.relatedAlertIds.join(', ')}</p>}
            </div>
        </div>
    );
};

export const IncidentTimelineTab: React.FC<{
    incident: DetailedIncident;
    users: UserProfile[];
}> = ({ incident, users }) => {
    const getUserName = (userId: string | undefined) => users.find(u => u.id === userId)?.name || 'System';

    const sortedEvents = [...incident.timelineEvents].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return (
        <div className="space-y-6">
            <h4 className="text-xl font-bold text-white mb-4">Incident Timeline</h4>
            {sortedEvents.length === 0 ? (
                <p className="text-gray-400">No timeline events recorded.</p>
            ) : (
                <div className="relative pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                    {sortedEvents.map((event, index) => (
                        <div key={event.id} className="mb-8 flex items-start relative">
                            <div className="absolute left-0 -ml-2 w-4 h-4 rounded-full bg-cyan-500 border-2 border-gray-800"></div>
                            <div className="ml-8 w-full">
                                <p className="text-gray-400 text-xs mb-1">{formatTimestamp(event.timestamp)}</p>
                                <p className="font-semibold text-white">{event.description}</p>
                                <p className="text-gray-500 text-sm">by {getUserName(event.userId)}</p>
                                {event.details && (
                                    <div className="mt-2 text-xs text-gray-500 bg-gray-700/50 p-2 rounded-md">
                                        <p className="font-semibold">Details:</p>
                                        <pre className="whitespace-pre-wrap">{JSON.stringify(event.details, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const IncidentActionItemsTab: React.FC<{
    incident: DetailedIncident;
    users: UserProfile[];
    onUpdateIncident: (incident: DetailedIncident) => void;
    getAssigneeName: (assigneeId: string) => string;
}> = ({ incident, users, onUpdateIncident, getAssigneeName }) => {
    const [actionItems, setActionItems] = useState<IncidentActionItem[]>(incident.actionItems);
    const [newActionItemDescription, setNewActionItemDescription] = useState('');
    const [newActionItemAssignee, setNewActionItemAssignee] = useState('');
    const [newActionItemDueDate, setNewActionItemDueDate] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const { currentUser } = useContext(DataContext);

    useEffect(() => {
        setActionItems(incident.actionItems);
    }, [incident.actionItems]);

    const handleAddActionItem = async () => {
        if (!newActionItemDescription || !newActionItemAssignee) {
            alert('Description and Assignee are required.');
            return;
        }
        setIsAdding(true);
        try {
            const addedItem = await IncidentApiService.addActionItem(
                incident.id,
                newActionItemDescription,
                newActionItemAssignee,
                newActionItemDueDate || null,
                currentUser?.id || 'system'
            );
            const updatedIncident = await IncidentApiService.fetchIncidentById(incident.id); // Re-fetch for full timeline updates
            if(updatedIncident) {
                onUpdateIncident(updatedIncident);
            }
            setNewActionItemDescription('');
            setNewActionItemAssignee('');
            setNewActionItemDueDate('');
        } catch (error) {
            console.error('Failed to add action item:', error);
            alert('Failed to add action item.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdateActionItemStatus = async (item: IncidentActionItem, newStatus: ActionItemStatus) => {
        const updatedItem = { ...item, status: newStatus };
        try {
            await IncidentApiService.updateActionItem(incident.id, updatedItem, currentUser?.id || 'system');
            const updatedIncident = await IncidentApiService.fetchIncidentById(incident.id); // Re-fetch for full timeline updates
            if(updatedIncident) {
                onUpdateIncident(updatedIncident);
            }
        } catch (error) {
            console.error('Failed to update action item status:', error);
            alert('Failed to update action item status.');
        }
    };

    return (
        <div className="space-y-6">
            <h4 className="text-xl font-bold text-white">Action Items</h4>

            <div className="p-4 bg-gray-700/50 rounded-md space-y-3">
                <h5 className="text-lg font-semibold text-white">Add New Action Item</h5>
                <input
                    type="text"
                    placeholder="Description"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-600"
                    value={newActionItemDescription}
                    onChange={(e) => setNewActionItemDescription(e.target.value)}
                />
                <select
                    className="shadow border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-600"
                    value={newActionItemAssignee}
                    onChange={(e) => setNewActionItemAssignee(e.target.value)}
                >
                    <option value="">Select Assignee</option>
                    {users.filter(u => u.role === 'ENGINEER' || u.role === 'MANAGER' || u.onCall).map(user => (
                        <option key={user.id} value={user.id}>{user.name} {user.onCall && '(On-Call)'}</option>
                    ))}
                </select>
                <input
                    type="date"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-600"
                    value={newActionItemDueDate}
                    onChange={(e) => setNewActionItemDueDate(e.target.value)}
                />
                <button
                    onClick={handleAddActionItem}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    disabled={isAdding}
                >
                    {isAdding ? 'Adding...' : 'Add Action Item'}
                </button>
            </div>

            <div className="space-y-4">
                {actionItems.length === 0 && <p className="text-gray-400">No action items for this incident.</p>}
                {actionItems.map(item => (
                    <Card key={item.id} className="p-4 bg-gray-800 border border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold text-white">{item.description}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'DONE' ? 'bg-green-600' : item.status === 'IN_PROGRESS' ? 'bg-blue-600' : item.status === 'BLOCKED' ? 'bg-red-600' : 'bg-gray-600'} text-white`}>
                                {item.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400">Assigned To: {getAssigneeName(item.assignedTo)}</p>
                        {item.dueDate && <p className="text-sm text-gray-400">Due: {formatTimestamp(item.dueDate, false)}</p>}
                        <div className="mt-3 flex space-x-2">
                            {item.status !== 'DONE' && (
                                <button
                                    onClick={() => handleUpdateActionItemStatus(item, 'DONE')}
                                    className="bg-green-700 hover:bg-green-800 text-white text-xs px-3 py-1 rounded"
                                >
                                    Mark Done
                                </button>
                            )}
                            {item.status !== 'IN_PROGRESS' && item.status !== 'DONE' && (
                                <button
                                    onClick={() => handleUpdateActionItemStatus(item, 'IN_PROGRESS')}
                                    className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-3 py-1 rounded"
                                >
                                    In Progress
                                </button>
                            )}
                            {item.status !== 'OPEN' && item.status !== 'DONE' && (
                                <button
                                    onClick={() => handleUpdateActionItemStatus(item, 'OPEN')}
                                    className="bg-gray-700 hover:bg-gray-800 text-white text-xs px-3 py-1 rounded"
                                >
                                    Re-open
                                </button>
                            )}
                             {item.status !== 'BLOCKED' && item.status !== 'DONE' && (
                                <button
                                    onClick={() => handleUpdateActionItemStatus(item, 'BLOCKED')}
                                    className="bg-red-700 hover:bg-red-800 text-white text-xs px-3 py-1 rounded"
                                >
                                    Blocked
                                </button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export const IncidentCommentsTab: React.FC<{
    incident: DetailedIncident;
    users: UserProfile[];
    onUpdateIncident: (incident: DetailedIncident) => void;
}> = ({ incident, users, onUpdateIncident }) => {
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const { currentUser } = useContext(DataContext);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        if (!currentUser) {
            alert('Current user context missing. Cannot post comment.');
            return;
        }

        setIsPosting(true);
        try {
            await IncidentApiService.addIncidentComment(
                incident.id,
                currentUser.id,
                currentUser.name,
                newComment
            );
            const updatedIncident = await IncidentApiService.fetchIncidentById(incident.id);
            if(updatedIncident) {
                onUpdateIncident(updatedIncident);
            }
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
            alert('Failed to add comment.');
        } finally {
            setIsPosting(false);
        }
    };

    const getCommenterName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';

    return (
        <div className="space-y-6">
            <h4 className="text-xl font-bold text-white">Comments</h4>

            <div className="p-4 bg-gray-700/50 rounded-md space-y-3">
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-600 h-24"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                    onClick={handlePostComment}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    disabled={isPosting || !newComment.trim()}
                >
                    {isPosting ? 'Posting...' : 'Post Comment'}
                </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {incident.comments.length === 0 && <p className="text-gray-400">No comments yet.</p>}
                {incident.comments.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(comment => (
                    <Card key={comment.id} className="p-4 bg-gray-800 border border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold text-white">{getCommenterName(comment.userId)}</p>
                            <p className="text-xs text-gray-400">{formatTimestamp(comment.timestamp)}</p>
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-line">{comment.content}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export const IncidentPostmortemTab: React.FC<{
    incident: DetailedIncident;
    users: UserProfile[];
    onUpdateIncident: (incident: DetailedIncident) => void;
}> = ({ incident, users, onUpdateIncident }) => {
    const [postmortemDoc, setPostmortemDoc] = useState<PostmortemDocument | null>(incident.postmortemDoc);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editorStates, setEditorStates] = useState<Record<string, EditorState>>({});
    const { currentUser } = useContext(DataContext);
    const [aiGeneratingSection, setAiGeneratingSection] = useState<PostmortemSectionType | null>(null);

    const initializeEditorStates = useCallback((pmDoc: PostmortemDocument) => {
        const initialEditorStates: Record<string, EditorState> = {};
        pmDoc.sections.forEach(section => {
            try {
                const contentState = section.content ? convertFromRaw(JSON.parse(section.content)) : ContentState.createFromText('');
                initialEditorStates[section.id] = EditorState.createWithContent(contentState);
            } catch (e) {
                initialEditorStates[section.id] = EditorState.createWithContent(ContentState.createFromText(section.content || ''));
            }
        });
        setEditorStates(initialEditorStates);
    }, []);

    useEffect(() => {
        setPostmortemDoc(incident.postmortemDoc);
        if (incident.postmortemDoc) {
            initializeEditorStates(incident.postmortemDoc);
        } else {
            setEditorStates({});
        }
    }, [incident.postmortemDoc, initializeEditorStates]);

    const handleGenerateAISection = async (sectionType: PostmortemSectionType) => {
        setIsLoadingAI(true);
        setAiGeneratingSection(sectionType);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            let prompt = `For the incident titled "${incident.title}" (Incident ID: ${incident.id}, Severity: ${incident.severity}, Status: ${incident.status}, Description: "${incident.description}"), generate a detailed "${sectionType.replace(/_/g, ' ')}" section for a postmortem report. Focus on factual and concise information.`;

            if (sectionType === 'ROOT_CAUSE' && incident.timelineEvents.length > 0) {
                prompt += ` Consider the following incident details and timeline events:\n`;
                prompt += `Affected Services: ${incident.affectedServices.join(', ')}\n`;
                prompt += `Timeline: ${incident.timelineEvents.map(e => `${formatTimestamp(e.timestamp)}: ${e.description}`).join('; ')}\n`;
                prompt += `Impact Description: ${incident.impactDescription}\n`;
                prompt += `Based on this, what are the most likely root causes?`;
            } else if (sectionType === 'ACTION_ITEMS') {
                prompt += ` Current status: ${incident.status}. Previous action items: ${incident.actionItems.map(ai => `- ${ai.description} (${ai.status})`).join('\n') || 'None'}. Suggest specific, actionable, and measurable items to prevent recurrence or improve response time. Categorize them by short-term and long-term.`;
            } else if (sectionType === 'IMPACT') {
                prompt += ` The incident had impact: "${incident.impactDescription}". Elaborate on the quantitative and qualitative impact on users, business, and reputation.`;
            } else if (sectionType === 'RESOLUTION') {
                prompt += ` The incident is currently ${incident.status}. If it's mitigated or resolved, describe the steps taken, tools used, and the personnel involved in resolving the incident.`;
            } else if (sectionType === 'SUMMARY') {
                prompt += ` Summarize the incident, including when it started, when it was detected, key impacts, and its current status.`;
            } else if (sectionType === 'LESSONS_LEARNED') {
                prompt += ` Based on the incident, what are the key lessons learned regarding detection, response, communication, and prevention?`;
            } else if (sectionType === 'PREVENTION') {
                prompt += ` What concrete steps can be taken to prevent a similar incident from happening again, or to minimize its impact if it does?`;
            } else if (sectionType === 'TIMELINE') {
                 prompt += ` Reconstruct a detailed timeline from these events, focusing on key milestones and actions.
                Events: ${incident.timelineEvents.map(e => `${formatTimestamp(e.timestamp)} (${e.eventType}): ${e.description} by ${users.find(u => u.id === e.userId)?.name || 'System'}`).join('\n')}`;
            }

            prompt += ` Provide the response in a structured text format suitable for a report, no more than 500 words.`;

            const response = await ai.models.generateContent({ model: 'gemini-1.5-flash', contents: [{ text: prompt }] });
            const generatedContent = response.text;

            const newSection: PostmortemSection = {
                id: uuidv4(),
                type: sectionType,
                title: sectionType.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                content: JSON.stringify(convertToRaw(ContentState.createFromText(generatedContent))),
                generatedByAI: true,
            };

            let updatedSections: PostmortemSection[] = [];
            let currentPostmortem = postmortemDoc;
            if (currentPostmortem) {
                const existingIndex = currentPostmortem.sections.findIndex(s => s.type === sectionType);
                if (existingIndex > -1) {
                    updatedSections = currentPostmortem.sections.map((s, idx) => idx === existingIndex ? newSection : s);
                } else {
                    updatedSections = [...currentPostmortem.sections, newSection];
                }
            } else {
                updatedSections = [newSection];
            }

            const newPostmortemDoc: PostmortemDocument = currentPostmortem ?
                { ...currentPostmortem, sections: updatedSections } :
                {
                    id: `pm-${incident.id}`,
                    incidentId: incident.id,
                    title: `Postmortem for ${incident.title}`,
                    sections: updatedSections,
                    status: 'DRAFT',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

            const savedPm = await IncidentApiService.savePostmortem(newPostmortemDoc, currentUser?.id || 'system');
            onUpdateIncident({ ...incident, postmortemDoc: savedPm });
            setPostmortemDoc(savedPm); // Update local state for immediate re-render
            initializeEditorStates(savedPm); // Re-initialize editors with new content
            alert(`${sectionType} section generated by AI and saved.`);

        } catch (err) {
            console.error(`Error generating AI ${sectionType} section:`, err);
            alert(`Failed to generate AI ${sectionType} section. Check console for details.`);
        } finally {
            setIsLoadingAI(false);
            setAiGeneratingSection(null);
        }
    };

    const handleSavePostmortem = async () => {
        if (!postmortemDoc) return;
        setIsSaving(true);
        try {
            const updatedSections = postmortemDoc.sections.map(section => ({
                ...section,
                content: JSON.stringify(convertToRaw(editorStates[section.id]?.getCurrentContent() || ContentState.createFromText('')))
            }));
            const updatedPostmortemDoc = { ...postmortemDoc, sections: updatedSections };
            const savedPm = await IncidentApiService.savePostmortem(updatedPostmortemDoc, currentUser?.id || 'system');
            onUpdateIncident({ ...incident, postmortemDoc: savedPm });
            setPostmortemDoc(savedPm);
            alert('Postmortem saved successfully!');
        } catch (error) {
            console.error('Failed to save postmortem:', error);
            alert('Failed to save postmortem.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditorStateChange = (sectionId: string, newEditorState: EditorState) => {
        setEditorStates(prev => ({ ...prev, [sectionId]: newEditorState }));
    };

    const handleAddSection = (type: PostmortemSectionType) => {
        const newSection: PostmortemSection = {
            id: uuidv4(),
            type,
            title: type.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            content: '',
            generatedByAI: false,
        };
        const updatedDoc = postmortemDoc ? { ...postmortemDoc, sections: [...postmortemDoc.sections, newSection] } : {
            id: `pm-${incident.id}`, incidentId: incident.id, title: `Postmortem for ${incident.title}`, sections: [newSection], status: 'DRAFT',
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        setPostmortemDoc(updatedDoc);
        setEditorStates(prev => ({ ...prev, [newSection.id]: EditorState.createEmpty() }));
    };

    const handleRemoveSection = (sectionId: string) => {
        if (!postmortemDoc) return;
        const updatedSections = postmortemDoc.sections.filter(s => s.id !== sectionId);
        setPostmortemDoc({ ...postmortemDoc, sections: updatedSections });
        setEditorStates(prev => {
            const newStates = { ...prev };
            delete newStates[sectionId];
            return newStates;
        });
    };

    const handleStatusUpdate = async (newStatus: 'REVIEW' | 'PUBLISHED') => {
        if (!postmortemDoc) return;
        setIsSaving(true);
        try {
            let updatedPm: PostmortemDocument;
            if (newStatus === 'REVIEW') {
                updatedPm = await IncidentApiService.submitPostmortemForReview(postmortemDoc.id, incident.id, currentUser?.id || 'system');
            } else { // PUBLISHED
                if (!currentUser) { alert('Current user context missing for approval.'); return; }
                updatedPm = await IncidentApiService.approvePostmortem(postmortemDoc.id, incident.id, currentUser.id);
            }
            onUpdateIncident({ ...incident, postmortemDoc: updatedPm });
            setPostmortemDoc(updatedPm);
            alert(`Postmortem status updated to ${newStatus}.`);
        } catch (error) {
            console.error('Failed to update postmortem status:', error);
            alert('Failed to update postmortem status.');
        } finally {
            setIsSaving(false);
        }
    };

    const renderPostmortemContent = (section: PostmortemSection) => {
        if (section.content) {
            try {
                const contentState = convertFromRaw(JSON.parse(section.content));
                return <div className="text-sm text-gray-300 read-only-editor" dangerouslySetInnerHTML={{ __html: editorStates[section.id] ? (EditorState.createWithContent(contentState) as any).toHTML() : '' }}></div>;
            } catch (e) {
                return <div className="prose prose-invert text-sm text-gray-300 whitespace-pre-line">{section.content}</div>;
            }
        }
        return <p className="text-gray-500 text-sm">No content yet.</p>;
    };

    const canEdit = postmortemDoc?.status === 'DRAFT';
    const canSubmitForReview = postmortemDoc?.status === 'DRAFT' && postmortemDoc.sections.length > 0;
    const canApprove = postmortemDoc?.status === 'REVIEW' && (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER');
    const canGenerateAI = true; // AI generation is always possible, but content can be overwritten

    return (
        <div className="space-y-6">
            <h4 className="text-xl font-bold text-white">Postmortem Document</h4>

            {!postmortemDoc ? (
                <div className="text-center p-8 bg-gray-700/50 rounded-md">
                    <p className="text-gray-300 mb-4">No postmortem document exists yet for this incident.</p>
                    <button
                        onClick={() => {
                            const newPm = {
                                id: `pm-${incident.id}`, incidentId: incident.id, title: `Postmortem for ${incident.title}`, sections: [], status: 'DRAFT' as 'DRAFT',
                                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
                            };
                            setPostmortemDoc(newPm);
                            IncidentApiService.savePostmortem(newPm, currentUser?.id || 'system');
                        }}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Create New Postmortem
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center bg-gray-700/50 p-4 rounded-md">
                        <p className="text-gray-300 mb-2 md:mb-0">Status: <span className={`font-semibold ${postmortemDoc.status === 'PUBLISHED' ? 'text-green-400' : postmortemDoc.status === 'REVIEW' ? 'text-orange-400' : 'text-gray-400'}`}>{postmortemDoc.status}</span></p>
                        <div className="flex space-x-2 flex-wrap justify-end">
                            {canEdit && (
                                <button
                                    onClick={handleSavePostmortem}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm disabled:opacity-50 min-w-[120px] mb-2 md:mb-0"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Save Postmortem'}
                                </button>
                            )}
                            {canSubmitForReview && (
                                <button
                                    onClick={() => handleStatusUpdate('REVIEW')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm disabled:opacity-50 min-w-[120px] mb-2 md:mb-0"
                                    disabled={isSaving}
                                >
                                    Submit for Review
                                </button>
                            )}
                            {canApprove && (
                                <button
                                    onClick={() => handleStatusUpdate('PUBLISHED')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm disabled:opacity-50 min-w-[120px] mb-2 md:mb-0"
                                    disabled={isSaving}
                                >
                                    Approve & Publish
                                </button>
                            )}
                             {(postmortemDoc.status === 'REVIEW' || postmortemDoc.status === 'PUBLISHED') && !canEdit && (
                                <button
                                    onClick={() => alert('Feature to revert to draft or make a new version is not implemented.')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm disabled:opacity-50 min-w-[120px]"
                                    disabled={true} // Placeholder to indicate this is a future feature
                                >
                                    Revert/New Version
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-gray-700/50 rounded-md space-y-3">
                        <h5 className="text-lg font-semibold text-white">AI Generation & Section Management</h5>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {['SUMMARY', 'IMPACT', 'ROOT_CAUSE', 'RESOLUTION', 'ACTION_ITEMS', 'LESSONS_LEARNED', 'PREVENTION', 'TIMELINE'].map(type => (
                                <div key={type} className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleGenerateAISection(type as PostmortemSectionType)}
                                        className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        disabled={isLoadingAI && aiGeneratingSection === type}
                                    >
                                        {isLoadingAI && aiGeneratingSection === type ? `Generating ${type.replace(/_/g, ' ')}...` : `Generate AI ${type.replace(/_/g, ' ')}`}
                                    </button>
                                    {canEdit && (
                                        <button
                                            onClick={() => handleAddSection(type as PostmortemSectionType)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-2 rounded disabled:opacity-50 transition-colors"
                                            title="Add empty section"
                                        >
                                            +
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        {postmortemDoc.sections.length === 0 && <p className="text-gray-400">No sections added to postmortem yet.</p>}
                        {postmortemDoc.sections.map(section => (
                            <Card key={section.id} className="p-6 bg-gray-800 border border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-xl font-semibold text-white">{section.title}</h5>
                                    <div className="flex items-center space-x-2">
                                        {section.generatedByAI && <span className="text-xs text-indigo-400">AI Generated</span>}
                                        {canEdit && (
                                            <button
                                                onClick={() => handleRemoveSection(section.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                                title="Remove section"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {canEdit ? (
                                    <div className="bg-gray-900 border border-gray-600 rounded p-2 min-h-[10rem]">
                                        <Editor
                                            editorState={editorStates[section.id] || EditorState.createEmpty()}
                                            onEditorStateChange={(newState) => handleEditorStateChange(section.id, newState)}
                                            wrapperClassName="draft-editor-wrapper"
                                            editorClassName="draft-editor-content text-white"
                                            toolbarClassName="draft-editor-toolbar bg-gray-700 border-gray-600 rounded-t"
                                            toolbar={{
                                                options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'emoji', 'remove', 'history'],
                                                inline: { inDropdown: false, options: ['bold', 'italic', 'underline', 'strikethrough'] },
                                                list: { inDropdown: false, options: ['unordered', 'ordered'] },
                                                textAlign: { inDropdown: true },
                                            }}
                                        />
                                    </div>
                                ) : (
                                    renderPostmortemContent(section)
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const IncidentPlaybookTab: React.FC<{
    incident: DetailedIncident;
    users: UserProfile[];
    onUpdateIncident: (incident: DetailedIncident) => void;
}> = ({ incident, users, onUpdateIncident }) => {
    const [playbook, setPlaybook] = useState<Playbook | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [executingStepId, setExecutingStepId] = useState<string | null>(null);
    const { currentUser } = useContext(DataContext);
    const [metricCheckResults, setMetricCheckResults] = useState<Record<string, boolean | null>>({});

    const fetchPlaybookData = useCallback(async () => {
        if (incident.linkedPlaybookId) {
            setIsLoading(true);
            try {
                const pb = await IncidentApiService.fetchPlaybookById(incident.linkedPlaybookId);
                setPlaybook(pb);
            } catch (error) {
                console.error('Failed to fetch playbook:', error);
                setPlaybook(null);
            } finally {
                setIsLoading(false);
            }
        } else {
            setPlaybook(null);
            setIsLoading(false);
        }
    }, [incident.linkedPlaybookId]);

    useEffect(() => {
        fetchPlaybookData();
    }, [fetchPlaybookData]);

    const handleStepStatusChange = async (stepId: string, newStatus: PlaybookStepStatus) => {
        if (!playbook) return;
        setExecutingStepId(stepId);
        try {
            await IncidentApiService.updatePlaybookStepStatus(incident.id, playbook.id, stepId, newStatus, currentUser?.id || 'system');
            const updatedIncident = await IncidentApiService.fetchIncidentById(incident.id);
            if(updatedIncident) {
                onUpdateIncident(updatedIncident);
            }
            fetchPlaybookData(); // Re-fetch playbook to get updated status
        } catch (error) {
            console.error('Failed to update playbook step status:', error);
            alert('Failed to update playbook step status.');
        } finally {
            setExecutingStepId(null);
        }
    };

    const handleExecuteCommand = async (step: PlaybookStep) => {
        if (!step.command) return;
        setExecutingStepId(step.id);
        alert(`Simulating execution of command: ${step.command} on ${step.target || 'N/A'}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate command execution time
        await handleStepStatusChange(step.id, 'COMPLETED'); // Mark as completed after simulation
        setExecutingStepId(null);
    };

    const handleMetricCheck = async (step: PlaybookStep) => {
        if (!step.metricToCheck) return;
        setExecutingStepId(step.id);
        const { service, metricName, operator, value } = step.metricToCheck;
        try {
            const metric = await IncidentApiService.fetchMetricData(metricName, service, 5); // Fetch last 5 mins
            const latestValue = metric.data[metric.data.length - 1]?.value;

            if (latestValue === undefined) {
                setMetricCheckResults(prev => ({ ...prev, [step.id]: null })); // Indicate no data
                alert(`No data for ${metricName} on ${service}.`);
                await handleStepStatusChange(step.id, 'FAILED');
                return;
            }

            let checkPassed = false;
            switch (operator) {
                case 'gt': checkPassed = latestValue > value; break;
                case 'lt': checkPassed = latestValue < value; break;
                case 'eq': checkPassed = latestValue === value; break;
            }

            setMetricCheckResults(prev => ({ ...prev, [step.id]: checkPassed }));
            if (checkPassed) {
                alert(`Metric check passed! ${metricName} (${latestValue}) is ${operator} ${value}.`);
                await handleStepStatusChange(step.id, 'COMPLETED');
            } else {
                alert(`Metric check failed! ${metricName} (${latestValue}) is NOT ${operator} ${value}.`);
                await handleStepStatusChange(step.id, 'FAILED');
            }
        } catch (error) {
            console.error('Error during metric check:', error);
            alert('Failed to perform metric check.');
            setMetricCheckResults(prev => ({ ...prev, [step.id]: null }));
            await handleStepStatusChange(step.id, 'FAILED');
        } finally {
            setExecutingStepId(null);
        }
    };


    if (isLoading) {
        return <p className="text-gray-400">Loading playbook...</p>;
    }

    if (!playbook) {
        return <p className="text-gray-400">No linked playbook for this incident.</p>;
    }

    return (
        <div className="space-y-6">
            <h4 className="text-xl font-bold text-white">Linked Playbook: {playbook.name}</h4>
            <p className="text-gray-400">{playbook.description}</p>

            <div className="space-y-4">
                {playbook.steps.map((step, index) => (
                    <Card key={step.id} className="p-4 bg-gray-800 border border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold text-white">Step {index + 1}: {step.description}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${step.status === 'COMPLETED' ? 'bg-green-600' : step.status === 'IN_PROGRESS' ? 'bg-blue-600' : step.status === 'FAILED' ? 'bg-red-600' : 'bg-gray-600'} text-white`}>
                                {step.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400">Type: {step.type.replace('_', ' ')}</p>
                        {step.assignedTo && <p className="text-sm text-gray-400">Assigned To: {users.find(u => u.id === step.assignedTo)?.name || 'Unassigned'}</p>}
                        {step.command && <p className="text-sm text-gray-400">Command: <code className="bg-gray-700 px-2 py-1 rounded text-cyan-300">{step.command}</code></p>}
                        {step.target && <p className="text-sm text-gray-400">Target: {step.target}</p>}
                        {step.metricToCheck && (
                            <p className="text-sm text-gray-400">Metric Check: {step.metricToCheck.service} - {step.metricToCheck.metricName} {step.metricToCheck.operator} {step.metricToCheck.value}</p>
                        )}
                        {step.executionLog && <p className="text-sm text-gray-500 mt-2 italic">Log: {step.executionLog}</p>}
                        {step.manualConfirmationRequired && <p className="text-sm text-orange-400 font-medium mt-1">Manual Confirmation Required</p>}
                        {metricCheckResults[step.id] !== undefined && metricCheckResults[step.id] !== null && (
                            <p className={`text-sm mt-1 ${metricCheckResults[step.id] ? 'text-green-400' : 'text-red-400'}`}>
                                Metric Check Result: {metricCheckResults[step.id] ? 'Passed' : 'Failed'}
                            </p>
                        )}
                        {metricCheckResults[step.id] === null && (
                            <p className="text-sm mt-1 text-gray-500">Metric Check Result: No data.</p>
                        )}

                        <div className="mt-3 flex space-x-2 flex-wrap">
                            {step.status !== 'COMPLETED' && step.status !== 'FAILED' && step.type === 'MANUAL_TASK' && (
                                <button
                                    onClick={() => handleStepStatusChange(step.id, 'COMPLETED')}
                                    className="bg-green-700 hover:bg-green-800 text-white text-xs px-3 py-1 rounded disabled:opacity-50"
                                    disabled={executingStepId === step.id}
                                >
                                    {executingStepId === step.id ? 'Completing...' : 'Mark Completed'}
                                </button>
                            )}
                            {step.status !== 'COMPLETED' && step.status !== 'FAILED' && step.type === 'COMMAND' && (
                                <button
                                    onClick={() => handleExecuteCommand(step)}
                                    className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-3 py-1 rounded disabled:opacity-50"
                                    disabled={executingStepId === step.id}
                                >
                                    {executingStepId === step.id ? 'Executing...' : 'Execute Command'}
                                </button>
                            )}
                            {step.status !== 'COMPLETED' && step.status !== 'FAILED' && step.type === 'CHECK_METRIC' && (
                                <button
                                    onClick={() => handleMetricCheck(step)}
                                    className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs px-3 py-1 rounded disabled:opacity-50"
                                    disabled={executingStepId === step.id}
                                >
                                    {executingStepId === step.id ? 'Checking Metric...' : 'Run Metric Check'}
                                </button>
                            )}
                             {step.status !== 'FAILED' && step.status !== 'COMPLETED' && (
                                <button
                                    onClick={() => handleStepStatusChange(step.id, 'FAILED')}
                                    className="bg-red-700 hover:bg-red-800 text-white text-xs px-3 py-1 rounded disabled:opacity-50"
                                    disabled={executingStepId === step.id}
                                >
                                    {executingStepId === step.id ? 'Failing...' : 'Mark Failed'}
                                </button>
                            )}
                            {step.status !== 'IN_PROGRESS' && step.status !== 'COMPLETED' && step.status !== 'FAILED' && (
                                <button
                                    onClick={() => handleStepStatusChange(step.id, 'IN_PROGRESS')}
                                    className="bg-gray-700 hover:bg-gray-800 text-white text-xs px-3 py-1 rounded disabled:opacity-50"
                                    disabled={executingStepId === step.id}
                                >
                                    {executingStepId === step.id ? 'Starting...' : 'Start Progress'}
                                </button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export const IncidentMetricsTab: React.FC<{
    incident: DetailedIncident;
}> = ({ incident }) => {
    const [metricData, setMetricData] = useState<Record<string, TimeSeriesMetric | null>>({});
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<string>('responseTime');
    const [duration, setDuration] = useState<number>(60); // In minutes

    const affectedService = incident.affectedServices.length > 0 ? incident.affectedServices[0] : null;

    const fetchMetrics = useCallback(async () => {
        if (!affectedService) {
            setMetricData({});
            return;
        }

        setIsLoadingMetrics(true);
        try {
            const responseTime = await IncidentApiService.fetchMetricData('responseTime', affectedService, duration);
            const errorRate = await IncidentApiService.fetchMetricData('errorRate', affectedService, duration);
            const incidentCount = await IncidentApiService.fetchMetricData('incidentCount', affectedService, duration);
            setMetricData({ responseTime, errorRate, incidentCount });
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
            setMetricData({});
        } finally {
            setIsLoadingMetrics(false);
        }
    }, [affectedService, duration]);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                },
            },
            title: {
                display: true,
                text: `${affectedService || 'Service'} - ${selectedMetric === 'responseTime' ? 'Response Time' : selectedMetric === 'errorRate' ? 'Error Rate' : 'Incident Count'} (Last ${duration} mins)`,
                color: 'white',
            },
        },
        scales: {
            x: {
                ticks: {
                    color: 'gray',
                    callback: function(this: any, val: any, index: number) {
                        return index % Math.ceil(duration / 10) === 0 ? formatTimestamp(this.getLabelForValue(val) as string, true).split(' ')[1] : '';
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            y: {
                ticks: {
                    color: 'gray',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                title: {
                    display: true,
                    text: metricData[selectedMetric]?.unit || '',
                    color: 'white',
                },
            },
        },
    };

    const currentMetric = metricData[selectedMetric];
    const chartData = {
        labels: currentMetric?.data.map(dp => dp.timestamp) || [],
        datasets: [
            {
                label: currentMetric?.name || '',
                data: currentMetric?.data.map(dp => dp.value) || [],
                borderColor: selectedMetric === 'responseTime' ? 'rgb(75, 192, 192)' : selectedMetric === 'errorRate' ? 'rgb(255, 99, 132)' : 'rgb(54, 162, 235)',
                backgroundColor: selectedMetric === 'responseTime' ? 'rgba(75, 192, 192, 0.2)' : selectedMetric === 'errorRate' ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)',
                tension: 0.1,
                fill: true,
            },
        ],
    };

    if (!affectedService) {
        return <p className="text-gray-400">No affected services identified to display metrics.</p>;
    }

    if (isLoadingMetrics) {
        return <p className="text-gray-400">Loading metrics...</p>;
    }

    return (
        <div className="space-y-6">
            <h4 className="text-xl font-bold text-white">Service Metrics for {affectedService}</h4>
            <div className="flex flex-wrap gap-4">
                <div className="flex space-x-2">
                    {['responseTime', 'errorRate', 'incidentCount'].map(metric => (
                        <button
                            key={metric}
                            onClick={() => setSelectedMetric(metric)}
                            className={`py-2 px-4 rounded ${selectedMetric === metric ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                            {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </button>
                    ))}
                </div>
                <div className="flex space-x-2">
                    {[30, 60, 120, 240].map(d => (
                        <button
                            key={d}
                            onClick={() => setDuration(d)}
                            className={`py-2 px-4 rounded ${duration === d ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                            {d}m
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-96">
                {currentMetric && currentMetric.data.length > 0 ? (
                    <Line data={chartData} options={chartOptions as any} />
                ) : (
                    <p className="text-gray-400">No metric data available for {selectedMetric}.</p>
                )}
            </div>
        </div>
    );
};

export const MetricCard: React.FC<{
    title: string;
    value: string;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    colorClass?: string;
}> = ({ title, value, unit, trend, trendValue, colorClass = 'text-white' }) => {
    const trendIcon = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '▬';
    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

    return (
        <Card className="text-center p-4">
            <p className={`text-4xl font-bold ${colorClass}`}>{value}{unit && <span className="text-xl ml-1">{unit}</span>}</p>
            <p className="text-sm text-gray-400 mt-2">{title}</p>
            {trend && trendValue && (
                <p className={`text-xs mt-1 ${trendColor}`}>
                    {trendIcon} {trendValue}
                </p>
            )}
        </Card>
    );
};

export const ServiceHealthStatus: React.FC<{
    serviceMetrics: ServiceHealthMetric[];
}> = ({ serviceMetrics }) => {
    return (
        <Card title="Service Health Overview" className="p-4">
            <div className="space-y-3">
                {serviceMetrics.length === 0 && <p className="text-gray-400">No service health data available.</p>}
                {serviceMetrics.map(service => (
                    <div key={service.serviceName} className="flex justify-between items-center py-2 px-3 bg-gray-800 rounded-md">
                        <p className="font-semibold text-white">{service.serviceName}</p>
                        <div className="flex items-center space-x-2">
                            <span className={`text-sm px-2 py-1 rounded-full ${service.status === 'OPERATIONAL' ? 'bg-green-600' : service.status === 'DEGRADED' ? 'bg-orange-600' : 'bg-red-600'} text-white`}>
                                {service.status}
                            </span>
                            <p className="text-xs text-gray-400">Incidents: {service.incidentsLast24h}</p>
                            <p className="text-xs text-gray-400">RT: {service.responseTimeMs}ms</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export const IncidentSummaryMetrics: React.FC<{
    incidents: DetailedIncident[];
}> = ({ incidents }) => {
    const activeSev1 = incidents.filter(i => i.severity === 'SEV1' && i.status === 'ACTIVE').length;
    const activeSev2 = incidents.filter(i => i.severity === 'SEV2' && i.status === 'ACTIVE').length;
    const activeSev3 = incidents.filter(i => i.severity === 'SEV3' && i.status === 'ACTIVE').length;

    const calculateMTTA = (incList: DetailedIncident[]) => {
        const relevantIncidents = incList.filter(inc => inc.detectionTime && inc.startTime && new Date(inc.startTime).getTime() >= new Date(inc.detectionTime).getTime());
        if (relevantIncidents.length === 0) return 'N/A';
        const totalTimeToAcknowledge = relevantIncidents.reduce((sum, inc) => {
            const detection = new Date(inc.detectionTime).getTime();
            const start = new Date(inc.startTime).getTime();
            return sum + (start - detection);
        }, 0);
        const avgMinutes = totalTimeToAcknowledge / relevantIncidents.length / 60 / 1000;
        return `${Math.round(avgMinutes)}m`;
    };

    const calculateMTTR = (incList: DetailedIncident[]) => {
        const relevantIncidents = incList.filter(inc => inc.resolutionTime && inc.startTime && new Date(inc.resolutionTime!).getTime() >= new Date(inc.startTime).getTime());
        if (relevantIncidents.length === 0) return 'N/A';
        const totalTimeToResolve = relevantIncidents.reduce((sum, inc) => {
            const start = new Date(inc.startTime).getTime();
            const resolution = new Date(inc.resolutionTime!).getTime();
            return sum + (resolution - start);
        }, 0);
        const avgMinutes = totalTimeToResolve / relevantIncidents.length / 60 / 1000;
        return `${Math.round(avgMinutes)}m`;
    };

    const incidentsLast24h = incidents.filter(i => new Date(i.createdAt).getTime() > Date.now() - 24 * 3600 * 1000).length;
    const totalOpenIncidents = incidents.filter(i => i.status !== 'CLOSED' && i.status !== 'RESOLVED' && i.status !== 'CANCELLED').length;
    const thirtyDayUptime = '99.98%'; // Placeholder, would integrate with actual SLOs

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Active SEV1" value={activeSev1.toString()} colorClass="text-red-400" />
            <MetricCard title="Active SEV2" value={activeSev2.toString()} colorClass="text-orange-400" />
            <MetricCard title="Active SEV3" value={activeSev3.toString()} colorClass="text-yellow-400" />
            <MetricCard title="Total Open Incidents" value={totalOpenIncidents.toString()} />
            <MetricCard title="MTTA (30d)" value={calculateMTTA(incidents)} unit="" />
            <MetricCard title="MTTR (30d)" value={calculateMTTR(incidents)} unit="" />
            <MetricCard title="Uptime (30d)" value={thirtyDayUptime} unit="" colorClass="text-green-400" />
            <MetricCard title="New Incidents (24h)" value={incidentsLast24h.toString()} />
        </div>
    );
};

export const GlobalSearch: React.FC<{
    onSearch: (searchTerm: string) => void;
}> = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    return (
        <form onSubmit={handleSearchSubmit} className="flex-grow max-w-lg">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search incidents, services, tags..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-cyan-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </form>
    );
};

export const FilterPanel: React.FC<{
    onFilterChange: (filters: { status?: IncidentStatus[], severity?: IncidentSeverity[], service?: string }) => void;
    currentFilters: { status: IncidentStatus[], severity: IncidentSeverity[], service: string };
    allServices: string[];
}> = ({ onFilterChange, currentFilters, allServices }) => {
    const [open, setOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    const handleStatusChange = (status: IncidentStatus, checked: boolean) => {
        const newStatuses = checked
            ? [...currentFilters.status, status]
            : currentFilters.status.filter(s => s !== status);
        onFilterChange({ ...currentFilters, status: newStatuses });
    };

    const handleSeverityChange = (severity: IncidentSeverity, checked: boolean) => {
        const newSeverities = checked
            ? [...currentFilters.severity, severity]
            : currentFilters.severity.filter(s => s !== severity);
        onFilterChange({ ...currentFilters, severity: newSeverities });
    };

    const handleServiceChange = (service: string) => {
        onFilterChange({ ...currentFilters, service: service === '' ? undefined : service });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={filterRef}>
            <button
                onClick={() => setOpen(!open)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
                <span>Filters</span>
                {(currentFilters.status.length > 0 || currentFilters.severity.length > 0 || currentFilters.service) && (
                    <span className="ml-2 px-2 py-0.5 bg-cyan-600 rounded-full text-xs">
                        {currentFilters.status.length + currentFilters.severity.length + (currentFilters.service ? 1 : 0)}
                    </span>
                )}
            </button>

            {open && (
                <Card className="absolute left-0 mt-2 p-4 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                    <div className="mb-4">
                        <h6 className="text-sm font-semibold text-gray-300 mb-2">Status</h6>
                        <div className="flex flex-col space-y-1">
                            {['ACTIVE', 'INVESTIGATING', 'MITIGATED', 'RESOLVED', 'CLOSED', 'CANCELLED'].map(status => (
                                <label key={status} className="flex items-center text-gray-400 text-sm">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                                        checked={currentFilters.status.includes(status as IncidentStatus)}
                                        onChange={(e) => handleStatusChange(status as IncidentStatus, e.target.checked)}
                                    />
                                    <span className="ml-2">{status}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <h6 className="text-sm font-semibold text-gray-300 mb-2">Severity</h6>
                        <div className="flex flex-col space-y-1">
                            {['SEV1', 'SEV2', 'SEV3', 'SEV4', 'SEV5'].map(severity => (
                                <label key={severity} className="flex items-center text-gray-400 text-sm">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                                        checked={currentFilters.severity.includes(severity as IncidentSeverity)}
                                        onChange={(e) => handleSeverityChange(severity as IncidentSeverity, e.target.checked)}
                                    />
                                    <span className="ml-2">{severity}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h6 className="text-sm font-semibold text-gray-300 mb-2">Service</h6>
                        <select
                            className="w-full py-2 px-3 rounded-md bg-gray-700 border border-gray-600 text-white text-sm"
                            value={currentFilters.service || ''}
                            onChange={(e) => handleServiceChange(e.target.value)}
                        >
                            <option value="">All Services</option>
                            {allServices.map(service => (
                                <option key={service} value={service}>{service}</option>
                            ))}
                        </select>
                    </div>
                </Card>
            )}
        </div>
    );
};

export const NewIncidentModal: React.FC<{
    onClose: () => void;
    onIncidentCreated: (incident: DetailedIncident) => void;
    users: UserProfile[];
    services: ServiceHealthMetric[];
}> = ({ onClose, onIncidentCreated, users, services }) => {
    const [newIncident, setNewIncident] = useState<Partial<DetailedIncident>>({
        title: '',
        description: '',
        severity: 'SEV3',
        status: 'ACTIVE',
        source: 'MANUAL',
        affectedServices: [],
        ownerId: '',
        tags: [],
    });
    const [isCreating, setIsCreating] = useState(false);
    const { currentUser } = useContext(DataContext);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewIncident(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setNewIncident(prev => ({ ...prev, affectedServices: selectedOptions }));
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
        setNewIncident(prev => ({ ...prev, tags }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIncident.title || !newIncident.description) {
            alert('Title and Description are required.');
            return;
        }

        setIsCreating(true);
        try {
            const createdIncident = await IncidentApiService.createIncident(newIncident, currentUser?.id || 'system');
            onIncidentCreated(createdIncident);
            onClose();
            alert('Incident created successfully!');
        } catch (error) {
            console.error('Error creating incident:', error);
            alert('Failed to create incident.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Create New Incident</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-1" htmlFor="title">Title:</label>
                        <input
                            type="text" id="title" name="title"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                            value={newIncident.title} onChange={handleInputChange} required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-1" htmlFor="description">Description:</label>
                        <textarea
                            id="description" name="description"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 h-24"
                            value={newIncident.description} onChange={handleInputChange} required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-1" htmlFor="impactDescription">Impact Description:</label>
                        <textarea
                            id="impactDescription" name="impactDescription"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 h-16"
                            value={newIncident.impactDescription || ''} onChange={handleInputChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-bold mb-1" htmlFor="severity">Severity:</label>
                            <select
                                id="severity" name="severity"
                                className="shadow border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                                value={newIncident.severity} onChange={handleInputChange}
                            >
                                {['SEV1', 'SEV2', 'SEV3', 'SEV4', 'SEV5'].map(sev => <option key={sev} value={sev}>{sev}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-bold mb-1" htmlFor="source">Source:</label>
                            <select
                                id="source" name="source"
                                className="shadow border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                                value={newIncident.source} onChange={handleInputChange}
                            >
                                {['MANUAL', 'MONITORING_ALERT', 'USER_REPORT', 'API_ERROR', 'SYSTEM_LOG'].map(src => <option key={src} value={src}>{src.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-1" htmlFor="affectedServices">Affected Services:</label>
                        <select
                            id="affectedServices" name="affectedServices" multiple
                            className="shadow border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 h-24"
                            value={newIncident.affectedServices} onChange={handleServiceSelect}
                        >
                            {services.map(s => <option key={s.serviceName} value={s.serviceName}>{s.serviceName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-1" htmlFor="ownerId">Assign Owner:</label>
                        <select
                            id="ownerId" name="ownerId"
                            className="shadow border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                            value={newIncident.ownerId} onChange={handleInputChange}
                        >
                            <option value="">Unassigned</option>
                            {users.filter(u => u.role === 'ENGINEER' || u.role === 'MANAGER' || u.onCall).map(user => (
                                <option key={user.id} value={user.id}>{user.name} {user.onCall && '(On-Call)'}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-1" htmlFor="tags">Tags (comma-separated):</label>
                        <input
                            type="text" id="tags" name="tags"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                            value={newIncident.tags?.join(', ') || ''} onChange={handleTagsChange}
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                            disabled={isCreating}
                        >
                            {isCreating ? 'Creating...' : 'Create Incident'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const IncidentResponseView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("IncidentResponseView must be within DataProvider");

    const { currentUser } = context;
    const [incidents, setIncidents] = useState<DetailedIncident[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<DetailedIncident | null>(null);
    const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
    const [serviceHealthMetrics, setServiceHealthMetrics] = useState<ServiceHealthMetric[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);
    const [filters, setFilters] = useState<{ status: IncidentStatus[], severity: IncidentSeverity[], service: string, search: string }>({
        status: ['ACTIVE', 'INVESTIGATING'],
        severity: [],
        service: '',
        search: ''
    });

    const fetchAllData = useCallback(async () => {
        setIsLoadingIncidents(true);
        try {
            const fetchedIncidents = await IncidentApiService.fetchIncidents(filters);
            setIncidents(fetchedIncidents);

            const fetchedServiceHealth = await IncidentApiService.fetchServiceHealth();
            setServiceHealthMetrics(fetchedServiceHealth);

            const fetchedUsers = await IncidentApiService.fetchUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoadingIncidents(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchAllData();
        const intervalId = setInterval(fetchAllData, 30000);
        return () => clearInterval(intervalId);
    }, [fetchAllData]);

    const handleIncidentSelect = async (inc: Incident) => {
        try {
            const detailedInc = await IncidentApiService.fetchIncidentById(inc.id);
            if (detailedInc) {
                setSelectedIncident(detailedInc);
            } else {
                console.error('Detailed incident not found:', inc.id);
            }
        } catch (error) {
            console.error('Error fetching detailed incident:', error);
        }
    };

    const handleUpdateIncidentInList = (updatedIncident: DetailedIncident) => {
        setIncidents(prev => prev.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc));
        setSelectedIncident(updatedIncident);
        fetchAllData();
    };

    const handleFilterChange = (newFilters: Partial<{ status: IncidentStatus[], severity: IncidentSeverity[], service: string }>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleSearch = (searchTerm: string) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
    };

    const handleNewIncidentCreated = (newIncident: DetailedIncident) => {
        setIncidents(prev => [newIncident, ...prev]);
        fetchAllData(); // Refresh all data to ensure metrics etc. are up to date
    };

    const availableServices = [...new Set(serviceHealthMetrics.map(s => s.serviceName))];

    const [originalSelectedIncidentForPostmortem, setOriginalSelectedIncidentForPostmortem] = useState<Incident | null>(null);
    const [originalPostmortemText, setOriginalPostmortemText] = useState('');
    const [originalIsLoading, setOriginalIsLoading] = useState(false);

    const handleOriginalGenerate = async (incident: Incident) => {
        setOriginalSelectedIncidentForPostmortem(incident);
        setOriginalIsLoading(true); setOriginalPostmortemText('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `Generate a postmortem for this incident: "${incident.title}" (Severity: ${incident.severity}). Include sections for Summary, Impact, Root Cause, and Action Items.`;
            const response = await ai.models.generateContent({model: 'gemini-1.5-flash', contents: [{ text: prompt }]});
            setOriginalPostmortemText(response.text);
        } catch(err) { console.error(err); } finally { setOriginalIsLoading(false); }
    };

    return (
        <>
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                <h2 className="text-4xl font-extrabold text-white tracking-wider flex-shrink-0">Incident Response Dashboard</h2>
                <div className="flex flex-grow w-full md:w-auto items-center space-x-4 justify-end">
                    <GlobalSearch onSearch={handleSearch} />
                    <FilterPanel onFilterChange={handleFilterChange} currentFilters={filters} allServices={availableServices} />
                    <button onClick={() => setIsNewIncidentModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        <span>New Incident</span>
                    </button>
                </div>
            </div>

            <IncidentSummaryMetrics incidents={incidents} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Incident Queue" className="h-full">
                        {isLoadingIncidents ? (
                            <p className="text-gray-400 text-center py-8">Loading incidents...</p>
                        ) : incidents.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No incidents found matching current filters.</p>
                        ) : (
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="min-w-full text-sm divide-y divide-gray-700">
                                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left font-medium">ID</th>
                                            <th scope="col" className="px-6 py-3 text-left font-medium">Title</th>
                                            <th scope="col" className="px-6 py-3 text-left font-medium">Severity</th>
                                            <th scope="col" className="px-6 py-3 text-left font-medium">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left font-medium">Owner</th>
                                            <th scope="col" className="px-6 py-3 text-left font-medium">Affected Services</th>
                                            <th scope="col" className="px-6 py-3 text-left font-medium">Created</th>
                                            <th scope="col" className="px-6 py-3 text-left font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {incidents.map(inc => (
                                            <tr key={inc.id} className="hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4 text-gray-400">{inc.id}</td>
                                                <td className="px-6 py-4 text-white font-medium cursor-pointer hover:text-cyan-400" onClick={() => handleIncidentSelect(inc)}>
                                                    {inc.title}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColorClass(inc.severity)}`}>
                                                        {inc.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-semibold ${getStatusColorClass(inc.status)}`}>
                                                        {inc.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">
                                                    {users.find(u => u.id === inc.ownerId)?.name || 'Unassigned'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">
                                                    {inc.affectedServices.join(', ') || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 text-xs">
                                                    {formatTimestamp(inc.createdAt, false)}
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <button onClick={() => handleIncidentSelect(inc)} className="text-xs text-cyan-400 hover:text-cyan-300 mr-2">View Details</button>
                                                    <button onClick={() => handleOriginalGenerate(inc)} className="text-xs text-indigo-400 hover:text-indigo-300">AI Postmortem (Legacy)</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
                <div className="lg:col-span-1 flex flex-col space-y-6">
                    <ServiceHealthStatus serviceMetrics={serviceHealthMetrics} />
                    <Card title="On-Call Engineers" className="p-4">
                        <div className="space-y-3">
                            {users.filter(u => u.onCall).length === 0 && <p className="text-gray-400">No one is currently on-call.</p>}
                            {users.filter(u => u.onCall).map(user => (
                                <div key={user.id} className="flex items-center space-x-3 py-2 px-3 bg-gray-800 rounded-md">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <p className="font-semibold text-white">{user.name}</p>
                                    <p className="text-sm text-gray-400 flex-grow text-right">{user.role}</p>
                                    {user.slackId && (
                                        <a href={`https://slack.com/app_redirect?channel=${user.slackId}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-sm hover:underline">Slack</a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            <Card title="Historical Incident Trends (Last 30 Days)">
                <div className="h-72 w-full flex items-center justify-center text-gray-500">
                    <p>Advanced charting for incident volume, MTTR, etc. over time would be implemented here using a charting library.</p>
                </div>
            </Card>

        </div>
        {selectedIncident && (
            <IncidentDetailsModal
                incident={selectedIncident}
                users={users}
                onClose={() => setSelectedIncident(null)}
                onUpdateIncident={handleUpdateIncidentInList}
            />
        )}
        {isNewIncidentModalOpen && (
            <NewIncidentModal
                onClose={() => setIsNewIncidentModalOpen(false)}
                onIncidentCreated={handleNewIncidentCreated}
                users={users}
                services={serviceHealthMetrics}
            />
        )}
        {originalSelectedIncidentForPostmortem && (
             <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setOriginalSelectedIncidentForPostmortem(null)}>
                <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full" onClick={e=>e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Postmortem for {originalSelectedIncidentForPostmortem.id} (Legacy)</h3></div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                       <div className="min-h-[15rem] whitespace-pre-line text-sm text-gray-300">{originalIsLoading ? 'Generating...' : originalPostmortemText}</div>
                    </div>
                    <div className="p-4 border-t border-gray-700 flex justify-end">
                        <button onClick={() => setOriginalSelectedIncidentForPostmortem(null)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Close</button>
                    </div>
                </div>
             </div>
        )}
        </>
    );
};

export default IncidentResponseView;