import React, { useState, useEffect, useRef, useCallback, useReducer, createContext, useContext } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";
// import type { MessageContent, Part } from "@google/genai"; // Assuming these types exist in @google/genai if we were to use them explicitly
import {
    ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, ChartBarIcon,
    BellIcon, CubeIcon, Squares2X2Icon, BoltIcon, Cog6ToothIcon, ClockIcon,
    ArrowPathIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon,
    PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon, PlayIcon, StopIcon,
    TableCellsIcon, CodeBracketIcon, ServerStackIcon, EyeIcon, AdjustmentsHorizontalIcon,
    FunnelIcon, ShareIcon, PrinterIcon, ArrowTopRightOnSquareIcon, MinusIcon, SunIcon, MoonIcon,
    Bars3BottomLeftIcon, XMarkIcon,
} from '@heroicons/react/24/outline'; // Assuming Heroicons for a richer UI

// --- Start of new code for 10000 lines ---

// #region 1. Global Constants and Configurations

/**
 * @file This file contains the ObservabilityView component, a comprehensive
 * dashboard for logs, metrics, traces, alerts, and AI-driven insights.
 * It is designed to be a "real application in the real world" by providing
 * a vast array of features and functionalities, even if some backend integrations
 * are simulated for the purpose of this example.
 *
 * The goal is to demonstrate a large-scale, enterprise-grade observability platform
 * within a single file, showcasing a wide range of React patterns, state management,
 * data structures, and UI components.
 */

export const APP_NAME = "MegaDashboard Observability";
export const API_BASE_URL = "/api/observability"; // Placeholder for API endpoints
export const DEFAULT_TIME_RANGE_MS = 60 * 60 * 1000; // 1 hour
export const REFRESH_INTERVAL_MS = 30 * 1000; // 30 seconds
export const MAX_LOG_LINES_DISPLAY = 1000;
export const MAX_AI_TOKEN_LENGTH = 4000; // Example for Gemini 1.0 Pro
export const VIRTUALIZED_ROW_HEIGHT = 28; // Pixels for log table rows

export enum ObservabilityTab {
    Logs = 'logs',
    Metrics = 'metrics',
    Traces = 'traces',
    Alerts = 'alerts',
    Dashboards = 'dashboards',
    AIInsights = 'ai-insights',
    Settings = 'settings',
}

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    CRITICAL = 'CRITICAL',
}

export enum MetricAggregationType {
    SUM = 'sum',
    AVG = 'avg',
    MIN = 'min',
    MAX = 'max',
    COUNT = 'count',
    P99 = 'p99',
    P95 = 'p95',
}

export enum AlertSeverity {
    INFO = 'info',
    WARNING = 'warning',
    CRITICAL = 'critical',
    EMERGENCY = 'emergency',
}

export enum DataSourceType {
    LOGS = 'logs',
    METRICS = 'metrics',
    TRACES = 'traces',
    COMBINED = 'combined', // For data sources that provide multiple types
}

export enum AIInsightType {
    SUMMARY = 'summary',
    ROOT_CAUSE = 'root_cause',
    ANOMALY_EXPLANATION = 'anomaly_explanation',
    RECOMMENDATION = 'recommendation',
    PREDICTION = 'prediction',
}

export const QUICK_TIME_RANGES = [
    { label: 'Last 5 minutes', value: 5 * 60 * 1000 },
    { label: 'Last 15 minutes', value: 15 * 60 * 1000 },
    { label: 'Last 30 minutes', value: 30 * 60 * 1000 },
    { label: 'Last 1 hour', value: 60 * 60 * 1000 },
    { label: 'Last 3 hours', value: 3 * 60 * 60 * 1000 },
    { label: 'Last 6 hours', value: 6 * 60 * 60 * 1000 },
    { label: 'Last 12 hours', value: 12 * 60 * 60 * 1000 },
    { label: 'Last 24 hours', value: 24 * 60 * 60 * 1000 },
    { label: 'Last 7 days', value: 7 * 24 * 60 * 60 * 1000 },
    { label: 'Last 30 days', value: 30 * 24 * 60 * 60 * 1000 },
];

export const SERVICE_NAMES = [
    'payments-api', 'auth-service', 'user-profile-service', 'inventory-service',
    'order-processing', 'notification-service', 'frontend-bff', 'data-ingestion-worker',
    'reporting-service', 'search-engine', 'billing-processor', 'shipping-tracker',
];

export const HTTP_STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 429, 500, 502, 503, 504];

export const LOG_FIELDS_COMMON = [
    'timestamp', 'level', 'service', 'message', 'traceId', 'spanId', 'userId',
    'requestId', 'statusCode', 'method', 'path', 'durationMs', 'region',
    'env', 'host', 'containerId', 'threadName', 'className',
];

// #endregion

// #region 2. Interfaces and Types

export interface TimeRange {
    start: number; // Unix timestamp in milliseconds
    end: number;   // Unix timestamp in milliseconds
    label?: string; // e.g., "Last 1 hour"
}

export interface LogEntry {
    id: string;
    timestamp: number; // Unix timestamp in milliseconds
    level: LogLevel;
    service: string;
    message: string;
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic log fields
    [key: string]: any; // Arbitrary additional fields
}

export interface LogFilter {
    timeRange: TimeRange;
    levels: LogLevel[];
    services: string[];
    searchText: string;
    fields: Record<string, string>; // e.g., { 'statusCode': '500' }
    pageSize: number;
    page: number;
    sortField: keyof LogEntry;
    sortOrder: 'asc' | 'desc';
}

export interface LogAggregationResult {
    timestamp: number;
    count: number;
    levels: Record<LogLevel, number>;
}

export interface MetricSeries {
    name: string;
    labels: Record<string, string>;
    datapoints: Array<[number, number]>; // [timestamp, value]
}

export interface MetricQueryConfig {
    metricName: string;
    aggregation: MetricAggregationType;
    groupBy: string[]; // Labels to group by
    filters: Record<string, string>; // Label filters
    timeRange: TimeRange;
    resolutionMs: number; // Interval between datapoints
}

export interface TraceSpan {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    serviceName: string;
    operationName: string;
    startTime: number; // Unix timestamp in microseconds
    duration: number;  // Microseconds
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic trace tags
    tags: Record<string, any>;
    logs?: LogEntry[]; // Associated logs
    error?: boolean;
}

export interface TraceSegment {
    id: string;
    parentId?: string;
    traceId: string;
    serviceName: string;
    operationName: string;
    startTime: number;
    duration: number;
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic trace tags
    tags: Record<string, any>;
    children: TraceSegment[];
    logs?: LogEntry[];
    error: boolean;
}

export interface AlertCondition {
    metricName: string;
    threshold: number;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    aggregation: MetricAggregationType;
    durationMs: number; // How long condition must be met
}

export interface AlertNotificationChannel {
    type: 'email' | 'slack' | 'webhook';
    target: string; // e.g., email address, slack channel ID, webhook URL
}

export interface AlertRule {
    id: string;
    name: string;
    description: string;
    severity: AlertSeverity;
    enabled: boolean;
    conditions: AlertCondition[];
    notificationChannels: AlertNotificationChannel[];
    lastEvaluated?: number;
    lastTriggered?: number;
}

export interface ActiveAlert extends AlertRule {
    triggeredAt: number;
    resolvedAt?: number;
    currentValue: number;
    triggeringCondition: AlertCondition;
    status: 'triggered' | 'acknowledged' | 'resolved';
}

export interface DashboardPanel {
    id: string;
    title: string;
    type: 'logTable' | 'metricChart' | 'traceServiceMap' | 'alertSummary' | 'customMarkdown';
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic panel config
    config: any; // e.g., LogFilter for logTable, MetricQueryConfig for metricChart
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface DashboardConfig {
    id: string;
    name: string;
    description?: string;
    panels: DashboardPanel[];
    layout: 'grid' | 'freeform';
    timeRange?: TimeRange;
    isPublic: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface DataSourceConfig {
    id: string;
    name: string;
    type: DataSourceType;
    endpoint: string;
    apiKey?: string;
    enabled: boolean;
    metadata?: Record<string, string>; // e.g., region, provider
}

export interface SavedQuery {
    id: string;
    name: string;
    description?: string;
    queryType: ObservabilityTab; // e.g., 'logs', 'metrics'
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic query config
    queryConfig: any; // e.g., LogFilter, MetricQueryConfig
    createdAt: number;
    lastUsedAt: number;
}

export interface AIAnalysisResult {
    id: string;
    type: AIInsightType;
    timestamp: number;
    summary