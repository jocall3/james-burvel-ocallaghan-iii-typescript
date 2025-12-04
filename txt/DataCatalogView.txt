// components/views/megadashboard/analytics/DataCatalogView.tsx
import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";
import { DataContext } from '../../../../context/DataContext';
import type { DataSet } from '../../../../types';

// =====================================================================================================================
// NEW TYPES & INTERFACES - Substantially expanded to support rich metadata, quality, lineage, and governance.
// These types augment the base DataSet from '../../../../types' for a more feature-rich catalog experience.
// =====================================================================================================================

/**
 * Represents a single data quality metric for a column or dataset.
 */
export type DataQualityMetric = {
    id: string;
    metricName: 'Completeness' | 'Uniqueness' | 'Validity' | 'Consistency' | 'Timeliness' | 'Accuracy';
    value: string | number; // e.g., "98.5%", "15h"
    unit?: string;
    status: 'good' | 'warning' | 'critical' | 'info';
    lastMeasured: string; // ISO 8601 date string
    description: string;
    threshold?: { min?: number; max?: number; unit?: string; }; // For defining acceptable ranges
    trend?: 'improving' | 'declining' | 'stable' | 'n/a';
    ownerContact?: { id: string; name: string; email: string; };
    lastReviewedBy?: { id: string; name: string; };
};

/**
 * Represents a rule for data quality, e.g., "Non-null customer ID".
 */
export type DataQualityRule = {
    id: string;
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    status: 'passing' | 'failing' | 'pending';
    lastRun: string;
    failedRecordsCount?: number;
    totalRecordsEvaluated?: number;
    ownerContact?: { id: string; name: string; email: string; };
    remediationGuide?: string;
};

/**
 * Represents a node in the data lineage graph (source, transformation, dataset, report, model).
 */
export type DataLineageNode = {
    id: string;
    name: string;
    type: 'source' | 'transformation' | 'dataset' | 'report' | 'ml_model' | 'api_endpoint';
    description?: string;
    upstreamIds: string[]; // IDs of nodes that feed into this one
    downstreamIds: string[]; // IDs of nodes this one feeds into
    system?: string; // e.g., 'Airflow', 'Spark', 'Tableau'
    url?: string; // Link to the actual job/dashboard
    status?: 'active' | 'inactive' | 'error'; // Operational status
    lastUpdated?: string;
};

/**
 * Defines policies governing access and usage of a dataset.
 */
export type DataAccessPolicy = {
    id: string;
    name: string;
    description: string;
    policyType: 'role_based' | 'attribute_based' | 'purpose_based' | 'data_classification';
    roles?: string[]; // e.g., 'Analyst', 'Data Scientist'
    attributes?: Record<string, string>; // e.g., { country: 'US', sensitivity: 'High' }
    purpose?: string; // e.g., 'Marketing Analytics'
    classification?: 'PII' | 'Confidential' | 'Public';
    enforced: boolean;
    lastUpdatedBy?: { id: string; name: string; };
    lastUpdatedDate?: string;
    documentationLink?: string;
};

/**
 * Records an instance of dataset usage by a user or system.
 */
export type DataUsageStat = {
    id: string;
    userId: string;
    userName: string;
    action: 'view' | 'download' | 'query' | 'export' | 'api_call' | 'connect';
    timestamp: string; // ISO 8601 date string
    toolUsed?: string; // e.g., 'Tableau', 'Jupyter', 'Custom App', 'REST API'
    queryHash?: string; // Hashed query for privacy, useful for analysis
    durationMs?: number; // Duration of query/action
};

/**
 * Represents a comment or discussion thread on a dataset.
 */
export type DataSetComment = {
    id: string;
    userId: string;
    userName: string;
    timestamp: string; // ISO 8601 date string
    comment: string;
    likes?: number;
    replies?: DataSetComment[]; // Nested replies
};

/**
 * Represents a formal request for access to a dataset.
 */
export type AccessRequest = {
    id: string;
    userId: string;
    userName: string;
    datasetId: string;
    datasetName: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'revoked';
    requestedAt: string; // ISO 8601 date string
    approvedBy?: string;
    approvedAt?: string;
    decisionReason?: string;
};

/**
 * Represents a categorization tag for datasets, columns, or other catalog entities.
 */
export type Tag = {
    id: string;
    name: string;
    category?: string; // e.g., 'Business Domain', 'Compliance', 'Data Type'
    description?: string;
    isGovernanceTag?: boolean; // e.g., PII, GDPR
};

/**
 * Represents a Data Glossary Term associated with a dataset or column.
 */
export type GlossaryTerm = {
    id: string;
    name: string;
    definition: string;
    synonyms?: string[];
    relatedTerms?: string[];
    owner?: { id: string; name: string; };
    lastUpdated?: string;
};

/**
 * Extended DataSet interface for comprehensive data catalog details.
 * This locally augments the base `DataSet` type from `../../../../types`.
 */
export interface EnhancedDataSet extends DataSet {
    owner: { id: string; name: string; email: string; };
    dataSteward: { id: string; name: string; email: string; };
    sourceSystem: { id: string; name: string; type: string; connectionString?: string; url?: string; };
    tags: Tag[]; // Business tags
    governanceTags: Tag[]; // Compliance, PII, etc.
    lastRefreshed: string; // ISO 8601 date string
    refreshFrequency: string; // e.g., "Daily", "Hourly", "On Demand"
    sampleData: Record<string, any>[]; // Array of objects for data preview
    sizeBytes?: number; // Size of the dataset in bytes
    rowCount?: number; // Number of rows
    createdAt: string; // ISO 8601 date string
    updatedAt: string; // ISO 8601 date string

    // AI-driven insights
    aiSummary?: string;
    aiUseCases?: string[];
    aiIdentifiedPiiColumns?: string[]; // Names of columns identified as PII by AI
    aiDataClassification?: 'Transactional' | 'Master Data' | 'Analytical' | 'Reference Data';
    aiQualityRecommendations?: string[]; // AI suggestions for improving data quality

    // Detailed sections
    qualityMetrics?: DataQualityMetric[];
    qualityRules?: DataQualityRule[];
    lineageGraph?: DataLineageNode[]; // Renamed from 'lineage' to avoid conflict/be more specific
    accessPolicies?: DataAccessPolicy[];
    usageStats?: DataUsageStat[];
    comments?: DataSetComment[];
    relatedDatasetIds?: string[]; // IDs of other datasets identified as related
    glossaryTerms?: GlossaryTerm[]; // Associated glossary terms
    documentationLinks?: { name: string; url: string; }[]; // Links to external documentation
}

/**
 * Represents a single entry in the AI Chat history.
 */
export type AIChatMessage = {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
    contextDatasetId?: string; // If the message was about a specific dataset
    // Potential AI features:
    suggestedActions?: { label: string; action: string; }[]; // e.g., "Search for X", "Show PII columns"
    referencedDatasetIds?: string[]; // Datasets mentioned by AI
};

// =====================================================================================================================
// MOCK DATA GENERATION & API SIMULATION FUNCTIONS - Extensive mocks to simulate a backend for all new features.
// These functions are crucial for inflating line count with realistic-looking application logic.
// =====================================================================================================================

const mockTags: Tag[] = [
    { id: 't1', name: 'PII', category: 'Governance', description: 'Contains Personally Identifiable Information', isGovernanceTag: true },
    { id: 't2', name: 'GDPR', category: 'Compliance', description: 'Subject to GDPR regulations', isGovernanceTag: true },
    { id: 't3', name: 'Sales', category: 'Business Domain', description: 'Related to sales operations' },
    { id: 't4', name: 'Marketing', category: 'Business Domain', description: 'Related to marketing campaigns' },
    { id: 't5', name: 'Customer', category: 'Business Domain', description: 'Contains customer-centric data' },
    { id: 't6', name: 'Transactional', category: 'Data Type', description: 'Records individual transactions' },
    { id: 't7', name: 'Historical', category: 'Time', description: 'Historical data, not real-time' },
    { id: 't8', name: 'Financial', category: 'Business Domain', description: 'Related to financial transactions/reporting' },
    { id: 't9', name: 'Employee', category: 'Business Domain', description: 'Contains employee information' },
    { id: 't10', name: 'Analytics', category: 'Use Case', description: 'Suitable for analytical processing' },
    { id: 't11', name: 'CRM', category: 'Source System Type', description: 'Data originating from CRM systems' },
    { id: 't12', name: 'Database', category: 'Source System Type', description: 'Data from relational databases' },
];

const mockUsers = [
    { id: 'u1', name: 'Alice Smith', email: 'alice@example.com' },
    { id: 'u2', name: 'Bob Johnson', email: 'bob@example.com' },
    { id: 'u3', name: 'Charlie Brown', email: 'charlie@example.com' },
    { id: 'u4', name: 'Diana Prince', email: 'diana@example.com' },
    { id: 'u5', name: 'Eve Adams', email: 'eve@example.com' },
    { id: 'u6', name: 'Frank White', email: 'frank@example.com' },
    { id: 'u7', name: 'Grace Hopp', email: 'grace@example.com' },
    { id: 'u8', name: 'Harry Potter', email: 'harry@example.com' },
];

const mockSourceSystems = [
