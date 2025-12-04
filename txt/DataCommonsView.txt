import React, { useState, useEffect, useReducer, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import Card from '../../Card';

// SECTION 1: TYPES & INTERFACES
// ============================================================================

/**
 * Describes a user profile within the Data Commons.
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  department: 'Engineering' | 'Data Science' | 'Product' | 'Marketing' | 'Sales' | 'Research';
  role: string;
}

/**
 * Represents a single tag or keyword for categorizing datasets.
 */
export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

/**
 * Defines the structure of a single column in a dataset's schema.
 */
export interface SchemaColumn {
  name: string;
  dataType: 'string' | 'integer' | 'float' | 'boolean' | 'datetime' | 'json' | 'geospatial';
  description: string;
  isNullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  foreignKeyReference?: {
    table: string;
    column: string;
  };
  sampleValues: (string | number | boolean | null)[];
}

/**
 * Represents the data quality metrics for a dataset.
 */
export interface DataQuality {
  completeness: number; // 0.0 to 1.0
  accuracy: number;     // 0.0 to 1.0
  timeliness: number;   // 0.0 to 1.0
  uniqueness: number;   // 0.0 to 1.0
  lastChecked: string;  // ISO 8601 timestamp
}

/**
 * Represents a node in the data lineage graph.
 */
export interface LineageNode {
  id: string;
  type: 'source' | 'transform' | 'dataset' | 'downstream_consumer';
  name: string;
  details?: Record<string, any>;
}

/**
 * Represents an edge connecting two nodes in the data lineage graph.
 */
export interface LineageEdge {
  from: string;
  to: string;
  type: 'produces' | 'consumes' | 'transforms';
}

/**
 * Represents the full data lineage graph.
 */
export interface DataLineage {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

/**
 * Represents metadata associated with a dataset.
 */
export interface DatasetMetadata {
  sourceSystem: string;
  updateFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually' | 'Ad-hoc' | 'Streaming';
  dataSteward: UserProfile;
  technicalOwner: UserProfile;
  businessDomain: string;
  sensitivityLevel: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  retentionPolicy: string; // e.g., "7 years"
}

/**

 * Represents a specific version of a dataset.
 */
export interface DatasetVersion {
  version: string; // e.g., "v1.0.0"
  releaseDate: string; // ISO 8601 timestamp
  changelog: string;
  isCurrent: boolean;
}

/**
 * Represents a discussion comment on a dataset.
 */
export interface DiscussionComment {
  id: string;
  author: UserProfile;
  timestamp: string; // ISO 8601 timestamp
  content: string;
  replies?: DiscussionComment[];
}

/**
 * Represents an access request for a restricted dataset.
 */
export interface AccessRequest {
  id: string;
  requester: UserProfile;
  datasetId: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string; // ISO 8601 timestamp
  reviewedBy?: UserProfile;
  reviewDate?: string; // ISO 8601 timestamp
  reviewComments?: string;
}

/**
 * The main interface for a dataset in the Data Commons.
 */
export interface Dataset {
  id: string;
  name: string;
  description: string;
  summary: string; // A shorter one-liner description
  owner: UserProfile;
  tags: Tag[];
  createdAt: string; // ISO 8601 timestamp
  lastUpdatedAt: string; // ISO 8601 timestamp
  schema: SchemaColumn[];
  metadata: DatasetMetadata;
  quality: DataQuality;
  versions: DatasetVersion[];
  lineage: DataLineage;
  discussions: DiscussionComment[];
  accessType: 'open' | 'request_required';
  sampleData: Record<string, any>[];
  popularityScore: number; // A score from 0 to 100 indicating relevance/usage
  documentationUrl?: string;
  apiEndpoint?: string;
}

/**
 * Generic API response structure.
 */
export interface APIResponse<T> {
  data: T;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  error?: string | null;
}

/**
 * Represents the available options for sorting datasets.
 */
export type SortOption = 'relevance' | 'name_asc' | 'name_desc' | 'last_updated_desc' | 'created_asc';

/**
 * Represents the display mode for the dataset list.
 */
export type ViewMode = 'grid' | 'list';

/**
 * Represents the filters that can be applied to the dataset search.
 */
export interface DatasetFilters {
    tags?: string[];
    updateFrequency?: DatasetMetadata['updateFrequency'][];
    sensitivityLevel?: DatasetMetadata['sensitivityLevel'][];
    businessDomain?: string[];
    ownerId?: string;
}

/**
 * State for the data commons view reducer.
 */
export interface DataCommonsState {
    datasets: Dataset[];
    isLoading: boolean;
    error: string | null;
    filters: DatasetFilters;
    searchQuery: string;
    sortOption: SortOption;
    currentPage: number;
    totalPages: number;
    totalCount: number;
    selectedDatasetId: string | null;
    isDetailModalOpen: boolean;
    isContributionWizardOpen: boolean;
    viewMode: ViewMode;
}

/**
 * Actions for the data commons view reducer.
 */
export type DataCommonsAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { datasets: Dataset[]; totalCount: number; totalPages: number } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: DatasetFilters }
  | { type: 'SET_SORT_OPTION'; payload: SortOption }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SELECT_DATASET'; payload: string | null }
  | { type: 'OPEN_CONTRIBUTION_WIZARD' }
  | { type: 'CLOSE_CONTRIBUTION_WIZARD' };

// SECTION 2: MOCK DATA & API SIMULATION
// ============================================================================

export const MOCK_USERS: UserProfile[] = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice.j@example.com', department: 'Data Science', role: 'Lead Data Scientist', avatarUrl: 'https://i.pravatar.cc/150?u=u1' },
  { id: 'u2', name: 'Bob Williams', email: 'bob.w@example.com', department: 'Engineering', role: 'Senior Data Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u3', name: 'Charlie Brown', email: 'charlie.b@example.com', department: 'Product', role: 'Product Manager, Data Platform', avatarUrl: 'https://i.pravatar.cc/150?u=u3' },
  { id: 'u4', name: 'Diana Prince', email: 'diana.p@example.com', department: 'Marketing', role: 'Marketing Analyst', avatarUrl: 'https://i.pravatar.cc/150?u=u4' },
  { id: 'u5', name: 'Ethan Hunt', email: 'ethan.h@example.com', department: 'Research', role: 'Research Scientist', avatarUrl: 'https://i.pravatar.cc/150?u=u5' },
];

export const MOCK_TAGS: Tag[] = [
  { id: 't1', name: 'Sales', color: '#3b82f6', description: 'Data related to sales transactions and performance.' },
  { id: 't2', name: 'Marketing', color: '#10b981', description: 'Data from marketing campaigns, social media, and customer engagement.' },
  { id: 't3', name: 'Finance', color: '#f97316', description: 'Financial data including revenue, expenses, and forecasts.' },
  { id: 't4', name: 'Customer', color: '#8b5cf6', description: 'Information about customers, demographics, and behavior.' },
  { id: 't5', name: 'Product', color: '#ec4899', description: 'Data related to product usage and features.' },
  { id: 't6', name: 'PII', color: '#ef4444', description: 'Contains Personally Identifiable Information. Access is restricted.' },
  { id: 't7', name: 'Geospatial', color: '#06b6d4', description: 'Contains geographic data like coordinates or addresses.' },
];

const generateSampleData = (schema: SchemaColumn[], count: number): Record<string, any>[] => {
    const data = [];
    for (let i = 0; i < count; i++) {
        const row: Record<string, any> = {};
        schema.forEach(col => {
            row[col.name] = col.sampleValues[i % col.sampleValues.length];
        });
        data.push(row);
    }
    return data;
};

export const MOCK_DATASETS: Dataset[] = [
  {
    id: 'ds_001',
    name: 'Quarterly Sales Transactions',
    summary: 'Aggregated sales data for all product lines, updated quarterly.',
    description: 'This dataset contains detailed records of every sales transaction across all regions and product categories. It includes information on the product sold, price, customer segment, and sales representative. It is the source of truth for all revenue reporting and sales performance analysis.',
    owner: MOCK_USERS[0],
    tags: [MOCK_TAGS[0], MOCK_TAGS[2]],
    createdAt: '2022-01-15T10:00:00Z',
    lastUpdatedAt: '2023-10-28T14:30:00Z',
    schema: [
      { name: 'transaction_id', dataType: 'string', description: 'Unique identifier for the transaction.', isNullable: false, isPrimaryKey: true, sampleValues: ['txn_12345', 'txn_12346', 'txn_12347'] },
      { name: 'product_id', dataType: 'integer', description: 'Identifier for the product sold.', isNullable: false, sampleValues: [101, 102, 103] },
      { name: 'customer_id', dataType: 'string', description: 'Identifier for the customer.', isNullable: false, sampleValues: ['cust_abc', 'cust_def', 'cust_ghi'] },
      { name: 'sale_amount', dataType: 'float', description: 'The total amount of the sale in USD.', isNullable: false, sampleValues: [99.99, 149.50, 25.00] },
      { name: 'transaction_date', dataType: 'datetime', description: 'Timestamp of the sale.', isNullable: false, sampleValues: ['2023-10-28T12:00:00Z', '2023-10-28T12:05:00Z', '2023-10-28T12:10:00Z'] },
      { name: 'region', dataType: 'string', description: 'Sales region (e.g., NA, EMEA, APAC).', isNullable: false, sampleValues: ['NA', 'EMEA', 'APAC'] },
    ],
    metadata: {
      sourceSystem: 'Salesforce CRM',
      updateFrequency: 'Quarterly',
      dataSteward: MOCK_USERS[0],
      technicalOwner: MOCK_USERS[1],
      businessDomain: 'Sales',
      sensitivityLevel: 'Confidential',
      retentionPolicy: '10 years',
    },
    quality: { completeness: 0.98, accuracy: 0.95, timeliness: 0.85, uniqueness: 1.0, lastChecked: '2023-10-28T09:00:00Z' },
    versions: [{ version: 'v2.1', releaseDate: '2023-07-01T00:00:00Z', changelog: 'Added region column and backfilled historical data.', isCurrent: true }],
    lineage: {
        nodes: [{id: 'salesforce', type: 'source', name: 'Salesforce CRM'}, {id: 'ds_001', type: 'dataset', name: 'Quarterly Sales Transactions'}],
        edges: [{from: 'salesforce', to: 'ds_001', type: 'produces'}]
    },
    discussions: [{ id: 'c1', author: MOCK_USERS[3], timestamp: '2023-09-15T11:00:00Z', content: 'Is it possible to get a daily refresh of this data?' }],
    accessType: 'request_required',
    sampleData: [], // will be generated
    popularityScore: 88,
    documentationUrl: 'https://wiki.example.com/data/quarterly-sales',
    apiEndpoint: '/api/v1/datasets/ds_001'
  },
  {
    id: 'ds_002',
    name: 'Customer Demographics',
    summary: 'Anonymized demographic information about our customer base.',
    description: 'This dataset contains anonymized customer information, including age range, geographic location (at city level), and engagement segments. It is crucial for marketing analysis and product personalization efforts. All PII has been removed or hashed.',
    owner: MOCK_USERS[3],
    tags: [MOCK_TAGS[3], MOCK_TAGS[1], MOCK_TAGS[5]],
    createdAt: '2021-11-20T09:00:00Z',
    lastUpdatedAt: '2023-11-01T05:00:00Z',
    schema: [
      { name: 'customer_hash', dataType: 'string', description: 'Anonymized unique identifier for the customer.', isNullable: false, isPrimaryKey: true, sampleValues: ['hash_a1b2', 'hash_c3d4', 'hash_e5f6'] },
      { name: 'age_range', dataType: 'string', description: 'Customer\'s age range (e.g., 18-24, 25-34).', isNullable: true, sampleValues: ['25-34', '35-44', '18-24'] },
      { name: 'city', dataType: 'string', description: 'City of residence.', isNullable: false, sampleValues: ['New York', 'London', 'Tokyo'] },
      { name: 'country', dataType: 'string', description: 'Country of residence.', isNullable: false, sampleValues: ['USA', 'UK', 'Japan'] },
      { name: 'first_seen_date', dataType: 'datetime', description: 'Date the customer first interacted with our services.', isNullable: false, sampleValues: ['2021-01-10T00:00:00Z', '2022-05-20T00:00:00Z', '2020-11-30T00:00:00Z'] },
      { name: 'engagement_segment', dataType: 'string', description: 'Segment based on user activity (e.g., Power User, Casual).', isNullable: true, sampleValues: ['Power User', 'Casual', 'New'] },
    ],
    metadata: {
      sourceSystem: 'Internal Customer Database',
      updateFrequency: 'Weekly',
      dataSteward: MOCK_USERS[3],
      technicalOwner: MOCK_USERS[1],
      businessDomain: 'Marketing',
      sensitivityLevel: 'Restricted',
      retentionPolicy: '5 years after customer churn',
    },
    quality: { completeness: 0.92, accuracy: 0.99, timeliness: 0.95, uniqueness: 1.0, lastChecked: '2023-11-01T04:00:00Z' },
    versions: [{ version: 'v1.0', releaseDate: '2021-11-20T09:00:00Z', changelog: 'Initial release.', isCurrent: true }],
    lineage: {
        nodes: [{id: 'customer_db', type: 'source', name: 'Customer DB'}, {id: 'pii_removal', type: 'transform', name: 'PII Removal Script'}, {id: 'ds_002', type: 'dataset', name: 'Customer Demographics'}],
        edges: [{from: 'customer_db', to: 'pii_removal', type: 'produces'}, {from: 'pii_removal', to: 'ds_002', type: 'produces'}]
    },
    discussions: [],
    accessType: 'request_required',
    sampleData: [],
    popularityScore: 95,
  },
  {
    id: 'ds_003',
    name: 'Product Usage Events',
    summary: 'Real-time stream of user interaction events with our products.',
    description: 'This dataset is a continuous stream of events generated by user interactions within our applications. It includes clicks, page views, feature usage, and session information. Ideal for product analytics, A/B testing, and building recommendation engines. Data is available with low latency.',
    owner: MOCK_USERS[2],
    tags: [MOCK_TAGS[4], MOCK_TAGS[3]],
    createdAt: '2023-02-01T12:00:00Z',
    lastUpdatedAt: new Date().toISOString(),
    schema: [
        { name: 'event_id', dataType: 'string', description: 'Unique ID for the event.', isNullable: false, sampleValues: ['evt_xyz', 'evt_pqr', 'evt_lmn'] },
        { name: 'user_hash', dataType: 'string', description: 'Anonymized user ID.', isNullable: false, sampleValues: ['hash_a1b2', 'hash_c3d4', 'hash_e5f6'] },
        { name: 'event_type', dataType: 'string', description: 'Type of event (e.g., page_view, click).', isNullable: false, sampleValues: ['page_view', 'click', 'feature_used'] },
        { name: 'timestamp', dataType: 'datetime', description: 'Precise time of the event.', isNullable: false, sampleValues: [new Date().toISOString(), new Date(Date.now() - 1000).toISOString(), new Date(Date.now() - 2000).toISOString()] },
        { name: 'event_properties', dataType: 'json', description: 'JSON blob with event-specific details.', isNullable: true, sampleValues: ['{"page": "/dashboard"}', '{"button": "save_button"}', '{"feature": "export_csv"}'] },
    ],
    metadata: {
      sourceSystem: 'Segment.io',
      updateFrequency: 'Streaming',
      dataSteward: MOCK_USERS[2],
      technicalOwner: MOCK_USERS[1],
      businessDomain: 'Product',
      sensitivityLevel: 'Internal',
      retentionPolicy: '1 year',
    },
    quality: { completeness: 1.0, accuracy: 1.0, timeliness: 1.0, uniqueness: 1.0, lastChecked: new Date().toISOString() },
    versions: [{ version: 'v3.2', releaseDate: '2023-09-01T00:00:00Z', changelog: 'Added new event properties for session tracking.', isCurrent: true }],
    lineage: {
        nodes: [{id: 'segment', type: 'source', name: 'Segment.io'}, {id: 'ds_003', type: 'dataset', name: 'Product Usage Events'}],
        edges: [{from: 'segment', to: 'ds_003', type: 'produces'}]
    },
    discussions: [],
    accessType: 'open',
    sampleData: [],
    popularityScore: 92,
    apiEndpoint: 'wss://api.example.com/v1/datasets/ds_003/stream'
  },
  {
    id: 'ds_004',
    name: 'Office Locations',
    summary: 'Geospatial data for all global company office locations.',
    description: 'A simple reference dataset containing the address and geographic coordinates of all company offices worldwide. Useful for internal applications and HR dashboards.',
    owner: MOCK_USERS[4],
    tags: [MOCK_TAGS[6]],
    createdAt: '2020-05-10T15:00:00Z',
    lastUpdatedAt: '2023-08-15T10:00:00Z',
    schema: [
        { name: 'office_id', dataType: 'string', description: 'Unique identifier for the office.', isNullable: false, isPrimaryKey: true, sampleValues: ['HQ-SF', 'EU-LON', 'APAC-TOK'] },
        { name: 'office_name', dataType: 'string', description: 'Common name for the office.', isNullable: false, sampleValues: ['San Francisco HQ', 'London Office', 'Tokyo Office'] },
        { name: 'address', dataType: 'string', description: 'Full street address.', isNullable: false, sampleValues: ['123 Market St, San Francisco, CA', '456 Regent St, London, UK', '789 Ginza, Tokyo, Japan'] },
        { name: 'latitude', dataType: 'float', description: 'Latitude coordinate.', isNullable: false, sampleValues: [37.7749, 51.5074, 35.6895] },
        { name: 'longitude', dataType: 'float', description: 'Longitude coordinate.', isNullable: false, sampleValues: [-122.4194, -0.1278, 139.6917] },
    ],
    metadata: {
      sourceSystem: 'HR Information System (Workday)',
      updateFrequency: 'Annually',
      dataSteward: MOCK_USERS[4],
      technicalOwner: MOCK_USERS[1],
      businessDomain: 'Corporate',
      sensitivityLevel: 'Public',
      retentionPolicy: 'Indefinite',
    },
    quality: { completeness: 1.0, accuracy: 1.0, timeliness: 0.7, uniqueness: 1.0, lastChecked: '2023-08-15T09:00:00Z' },
    versions: [{ version: 'v1.3', releaseDate: '2023-08-15T10:00:00Z', changelog: 'Added new office in Berlin.', isCurrent: true }],
    lineage: {
        nodes: [{id: 'workday', type: 'source', name: 'Workday HRIS'}, {id: 'ds_004', type: 'dataset', name: 'Office Locations'}],
        edges: [{from: 'workday', to: 'ds_004', type: 'produces'}]
    },
    discussions: [],
    accessType: 'open',
    sampleData: [],
    popularityScore: 45,
  },
  // Add more mock datasets to reach line count target
  {
    id: 'ds_005',
    name: 'Financial Projections',
    summary: 'Quarterly financial projections and forecasts.',
    description: 'This dataset contains forward-looking financial statements, including revenue forecasts, expense budgets, and profitability projections for the next 8 quarters. Highly sensitive data.',
    owner: MOCK_USERS[0],
    tags: [MOCK_TAGS[2]],
    createdAt: '2022-03-01T18:00:00Z',
    lastUpdatedAt: '2023-10-15T11:00:00Z',
    schema: [
      { name: 'projection_id', dataType: 'string', description: 'Unique ID for the projection record.', isNullable: false, sampleValues: ['proj_q423', 'proj_q124', 'proj_q224'] },
      { name: 'fiscal_quarter', dataType: 'string', description: 'The fiscal quarter being projected (e.g., Q4 2023).', isNullable: false, sampleValues: ['Q4 2023', 'Q1 2024', 'Q2 2024'] },
      { name: 'projected_revenue', dataType: 'float', description: 'Projected revenue in millions USD.', isNullable: false, sampleValues: [120.5, 125.0, 130.2] },
      { name: 'projected_cogs', dataType: 'float', description: 'Projected Cost of Goods Sold in millions USD.', isNullable: false, sampleValues: [40.2, 41.5, 42.0] },
      { name: 'projected_opex', dataType: 'float', description: 'Projected Operating Expenses in millions USD.', isNullable: false, sampleValues: [60.0, 62.1, 63.5] },
    ],
    metadata: {
      sourceSystem: 'Anaplan',
      updateFrequency: 'Quarterly',
      dataSteward: MOCK_USERS[0],
      technicalOwner: MOCK_USERS[1],
      businessDomain: 'Finance',
      sensitivityLevel: 'Restricted',
      retentionPolicy: '3 years',
    },
    quality: { completeness: 1.0, accuracy: 0.85, timeliness: 0.9, uniqueness: 1.0, lastChecked: '2023-10-15T10:00:00Z' },
    versions: [{ version: 'v1.0', releaseDate: '2023-10-15T11:00:00Z', changelog: 'Initial release for FY24 planning.', isCurrent: true }],
    lineage: {
        nodes: [{id: 'anaplan', type: 'source', name: 'Anaplan'}, {id: 'ds_005', type: 'dataset', name: 'Financial Projections'}],
        edges: [{from: 'anaplan', to: 'ds_005', type: 'produces'}]
    },
    discussions: [],
    accessType: 'request_required',
    sampleData: [],
    popularityScore: 75,
  },
].map(ds => ({...ds, sampleData: generateSampleData(ds.schema, 3)}));


const PAGE_SIZE = 12;

/**
 * A mock API to simulate fetching data from a backend.
 */
export const mockApi = {
  fetchDatasets: async (
    query: string,
    filters: DatasetFilters,
    sort: SortOption,
    page: number
  ): Promise<APIResponse<Dataset[]>> => {
    console.log('Fetching datasets with:', { query, filters, sort, page });
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    let results = MOCK_DATASETS;

    // Simulate search
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(ds =>
        ds.name.toLowerCase().includes(lowerQuery) ||
        ds.description.toLowerCase().includes(lowerQuery)
      );
    }

    // Simulate filtering
    if (filters.tags && filters.tags.length > 0) {
        results = results.filter(ds => ds.tags.some(tag => filters.tags!.includes(tag.id)));
    }
    if (filters.updateFrequency && filters.updateFrequency.length > 0) {
        results = results.filter(ds => filters.updateFrequency!.includes(ds.metadata.updateFrequency));
    }
    if (filters.sensitivityLevel && filters.sensitivityLevel.length > 0) {
        results = results.filter(ds => filters.sensitivityLevel!.includes(ds.metadata.sensitivityLevel));
    }

    // Simulate sorting
    results.sort((a, b) => {
        switch (sort) {
            case 'name_asc': return a.name.localeCompare(b.name);
            case 'name_desc': return b.name.localeCompare(a.name);
            case 'last_updated_desc': return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
            case 'created_asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'relevance':
            default:
                return b.popularityScore - a.popularityScore;
        }
    });

    const totalCount = results.length;
    const paginatedResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return {
      data: paginatedResults,
      totalCount: totalCount,
      page: page,
      pageSize: PAGE_SIZE,
      error: null,
    };
  },

  fetchDatasetById: async (id: string): Promise<APIResponse<Dataset | null>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const dataset = MOCK_DATASETS.find(ds => ds.id === id) || null;
    if (dataset) {
        return { data: dataset, error: null };
    }
    return { data: null, error: 'Dataset not found' };
  },

  submitAccessRequest: async (request: Omit<AccessRequest, 'id' | 'status' | 'requestDate'>): Promise<APIResponse<AccessRequest>> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newRequest: AccessRequest = {
        ...request,
        id: `ar_${Date.now()}`,
        status: 'pending',
        requestDate: new Date().toISOString(),
      };
      console.log('Submitted access request:', newRequest);
      // In a real app, this would be saved to a database.
      return { data: newRequest, error: null };
  },

  fetchFilterOptions: async (): Promise<APIResponse<{
      tags: Tag[],
      updateFrequencies: string[],
      sensitivityLevels: string[],
      businessDomains: string[]
  }>> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
          data: {
              tags: MOCK_TAGS,
              updateFrequencies: [...new Set(MOCK_DATASETS.map(d => d.metadata.updateFrequency))],
              sensitivityLevels: [...new Set(MOCK_DATASETS.map(d => d.metadata.sensitivityLevel))],
              businessDomains: [...new Set(MOCK_DATASETS.map(d => d.metadata.businessDomain))]
          },
          error: null
      };
  }
};


// SECTION 3: CUSTOM HOOKS
// ============================================================================

/**
 * Debounces a value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


// SECTION 4: UI COMPONENTS
// ============================================================================

// --- Icon Components ---
const SearchIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const GridIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const ListIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const CloseIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


// --- Loading and Error Components ---

export const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

export const SkeletonCard: React.FC = () => (
    <div className="bg-gray-800 p-4 rounded-lg animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="flex space-x-2">
            <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
            <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
        </div>
    </div>
);

export const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
        {onRetry && (
            <button onClick={onRetry} className="ml-4 bg-red-700 hover:bg-red-600 text-white font-bold py-1 px-3 rounded">
                Retry
            </button>
        )}
    </div>
);


// --- UI Components ---

export const TagComponent: React.FC<{ tag: Tag }> = ({ tag }) => (
    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full last:mr-0 mr-1" style={{ backgroundColor: tag.color, color: '#fff' }}>
        {tag.name}
    </span>
);

export const SearchBar: React.FC<{
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
}> = ({ query, onQueryChange, placeholder = "Search datasets..." }) => (
    <div className="relative flex-grow">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-5 w-5 text-gray-500" />
        </span>
        <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);


export const FilterPanel: React.FC<{
    filters: DatasetFilters;
    onFilterChange: (newFilters: DatasetFilters) => void;
    options: {
        tags: Tag[],
        updateFrequencies: string[],
        sensitivityLevels: string[],
        businessDomains: string[]
    }
}> = ({ filters, onFilterChange, options }) => {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        tags: true,
        frequency: true,
        sensitivity: false,
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCheckboxChange = (category: keyof DatasetFilters, value: string) => {
        const currentValues = filters[category] as string[] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange({ ...filters, [category]: newValues });
    };

    const renderSection = (title: string, key: string, children: React.ReactNode) => (
        <div className="py-4 border-b border-gray-700">
            <button onClick={() => toggleSection(key)} className="w-full flex justify-between items-center text-left text-lg font-semibold">
                {title}
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${expandedSections[key] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections[key] && <div className="mt-3 space-y-2">{children}</div>}
        </div>
    );

    return (
        <div className="w-64 flex-shrink-0 pr-8">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            {renderSection('Tags', 'tags',
                options.tags.map(tag => (
                    <label key={tag.id} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                        <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
                            checked={(filters.tags || []).includes(tag.id)}
                            onChange={() => handleCheckboxChange('tags', tag.id)}
                        />
                        <span>{tag.name}</span>
                    </label>
                ))
            )}
            {renderSection('Update Frequency', 'frequency',
                 options.updateFrequencies.map(freq => (
                    <label key={freq} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                        <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
                            checked={(filters.updateFrequency || []).includes(freq as any)}
                            onChange={() => handleCheckboxChange('updateFrequency', freq)}
                        />
                        <span>{freq}</span>
                    </label>
                ))
            )}
            {renderSection('Sensitivity', 'sensitivity',
                 options.sensitivityLevels.map(level => (
                    <label key={level} className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                        <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
                            checked={(filters.sensitivityLevel || []).includes(level as any)}
                            onChange={() => handleCheckboxChange('sensitivityLevel', level)}
                        />
                        <span>{level}</span>
                    </label>
                ))
            )}
        </div>
    );
};

export const DatasetCard: React.FC<{ dataset: Dataset; onSelect: (id: string) => void }> = ({ dataset, onSelect }) => (
    <div
        onClick={() => onSelect(dataset.id)}
        className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
    >
        <div>
            <h3 className="text-lg font-bold text-white truncate">{dataset.name}</h3>
            <p className="text-sm text-gray-400 mt-1 h-10 overflow-hidden">{dataset.summary}</p>
            <div className="text-xs text-gray-500 mt-2">
                Owned by: <span className="font-semibold">{dataset.owner.name}</span>
            </div>
            <div className="text-xs text-gray-500">
                Last updated: {new Date(dataset.lastUpdatedAt).toLocaleDateString()}
            </div>
        </div>
        <div className="mt-4">
            {dataset.tags.slice(0, 3).map(tag => (
                <TagComponent key={tag.id} tag={tag} />
            ))}
        </div>
    </div>
);


export const DatasetListItem: React.FC<{ dataset: Dataset; onSelect: (id: string) => void }> = ({ dataset, onSelect }) => (
    <div
        onClick={() => onSelect(dataset.id)}
        className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-all duration-200 flex items-center justify-between"
    >
        <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{dataset.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{dataset.summary}</p>
        </div>
        <div className="w-1/4 px-4">
            {dataset.tags.slice(0, 3).map(tag => (
                <TagComponent key={tag.id} tag={tag} />
            ))}
        </div>
        <div className="w-48 text-sm text-gray-400">
            <div>Owner: {dataset.owner.name}</div>
            <div>Updated: {new Date(dataset.lastUpdatedAt).toLocaleDateString()}</div>
        </div>
    </div>
);


export const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <nav className="flex items-center justify-center mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <div className="mx-4 flex space-x-2">
                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        {page}
                    </button>
                ))}
            </div>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </nav>
    );
};


export const DatasetDetailModal: React.FC<{
    datasetId: string;
    onClose: () => void;
}> = ({ datasetId, onClose }) => {
    const [dataset, setDataset] = useState<Dataset | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchDataset = async () => {
            setIsLoading(true);
            try {
                const response = await mockApi.fetchDatasetById(datasetId);
                if (response.error || !response.data) {
                    throw new Error(response.error || 'Dataset not found');
                }
                setDataset(response.data);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDataset();
    }, [datasetId]);

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const renderTabContent = () => {
        if (!dataset) return null;
        switch (activeTab) {
            case 'schema':
                return <SchemaViewer schema={dataset.schema} />;
            case 'sample':
                return <SampleDataViewer data={dataset.sampleData} schema={dataset.schema} />;
            case 'access':
                return <AccessPanel dataset={dataset} />;
            case 'overview':
            default:
                return <OverviewPanel dataset={dataset} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">{dataset?.name || 'Loading...'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                {isLoading && <LoadingSpinner />}
                {error && <div className="p-4"><ErrorMessage message={error} /></div>}
                {dataset && (
                    <div className="flex-grow overflow-y-auto">
                        <nav className="flex space-x-1 border-b border-gray-700 px-4">
                            {['overview', 'schema', 'sample', 'access'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium capitalize border-b-2 ${
                                        activeTab === tab
                                            ? 'border-blue-500 text-white'
                                            : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                        <div className="p-6">
                            {renderTabContent()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const OverviewPanel: React.FC<{ dataset: Dataset }> = ({ dataset }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Description</h3>
            <p className="text-gray-400">{dataset.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-200">Owner</h4>
                <p className="text-gray-400">{dataset.owner.name} ({dataset.owner.department})</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-200">Data Steward</h4>
                <p className="text-gray-400">{dataset.metadata.dataSteward.name}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-200">Update Frequency</h4>
                <p className="text-gray-400">{dataset.metadata.updateFrequency}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-200">Sensitivity Level</h4>
                <p className="text-gray-400">{dataset.metadata.sensitivityLevel}</p>
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
                {dataset.tags.map(tag => <TagComponent key={tag.id} tag={tag} />)}
            </div>
        </div>
    </div>
);


const SchemaViewer: React.FC<{ schema: SchemaColumn[] }> = ({ schema }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800 text-xs uppercase">
                <tr>
                    <th className="px-4 py-3">Column Name</th>
                    <th className="px-4 py-3">Data Type</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Nullable</th>
                </tr>
            </thead>
            <tbody>
                {schema.map(col => (
                    <tr key={col.name} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="px-4 py-3 font-mono">{col.name}</td>
                        <td className="px-4 py-3 font-mono">{col.dataType}</td>
                        <td className="px-4 py-3">{col.description}</td>
                        <td className="px-4 py-3">{col.isNullable ? 'Yes' : 'No'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const SampleDataViewer: React.FC<{ data: Record<string, any>[], schema: SchemaColumn[] }> = ({ data, schema }) => {
    if (data.length === 0) {
        return <p className="text-gray-400">No sample data available for this dataset.</p>;
    }
    const headers = schema.map(col => col.name);
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-800 text-xs uppercase">
                    <tr>
                        {headers.map(header => <th key={header} className="px-4 py-3">{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-700 hover:bg-gray-800">
                            {headers.map(header => (
                                <td key={header} className="px-4 py-3 font-mono whitespace-nowrap">
                                    {JSON.stringify(row[header])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const AccessPanel: React.FC<{ dataset: Dataset }> = ({ dataset }) => {
    const [justification, setJustification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!justification) return;
        setIsSubmitting(true);
        setSubmissionStatus('idle');
        try {
            // Assume current user is MOCK_USERS[4]
            await mockApi.submitAccessRequest({
                requester: MOCK_USERS[4],
                datasetId: dataset.id,
                justification: justification,
            });
            setSubmissionStatus('success');
        } catch (error) {
            setSubmissionStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (dataset.accessType === 'open') {
        return (
            <div>
                <h3 className="text-lg font-semibold text-green-400 mb-2">Open Access</h3>
                <p className="text-gray-400">This dataset is openly available to all internal users.</p>
                {dataset.apiEndpoint && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-gray-200">API Endpoint</h4>
                        <pre className="bg-gray-800 p-2 rounded mt-1 text-sm text-cyan-300 font-mono">{dataset.apiEndpoint}</pre>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Request Required</h3>
            <p className="text-gray-400 mb-4">You need to request access to use this dataset. Please provide a business justification below.</p>
            {submissionStatus === 'success' ? (
                 <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg">
                     Your request has been submitted successfully. You will be notified once it's reviewed.
                 </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        placeholder="e.g., I need this data for the Q4 marketing performance report."
                        className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        required
                    />
                    {submissionStatus === 'error' && <p className="text-red-400 text-sm mt-2">Failed to submit request. Please try again.</p>}
                    <button
                        type="submit"
                        disabled={isSubmitting || !justification}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            )}
        </div>
    );
};


// SECTION 5: REDUCER & CONTEXT
// ============================================================================

const initialState: DataCommonsState = {
    datasets: [],
    isLoading: true,
    error: null,
    filters: {},
    searchQuery: '',
    sortOption: 'relevance',
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    selectedDatasetId: null,
    isDetailModalOpen: false,
    isContributionWizardOpen: false,
    viewMode: 'grid',
};

function dataCommonsReducer(state: DataCommonsState, action: DataCommonsAction): DataCommonsState {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                datasets: action.payload.datasets,
                totalCount: action.payload.totalCount,
                totalPages: action.payload.totalPages,
            };
        case 'FETCH_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload, currentPage: 1 };
        case 'SET_FILTERS':
            return { ...state, filters: action.payload, currentPage: 1 };
        case 'SET_SORT_OPTION':
            return { ...state, sortOption: action.payload, currentPage: 1 };
        case 'SET_PAGE':
            return { ...state, currentPage: action.payload };
        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.payload };
        case 'SELECT_DATASET':
            return { ...state, selectedDatasetId: action.payload, isDetailModalOpen: !!action.payload };
        case 'OPEN_CONTRIBUTION_WIZARD':
            return { ...state, isContributionWizardOpen: true };
        case 'CLOSE_CONTRIBUTION_WIZARD':
            return { ...state, isContributionWizardOpen: false };
        default:
            return state;
    }
}


// SECTION 6: MAIN VIEW COMPONENT
// ============================================================================

const DataCommonsView: React.FC = () => {
    const [state, dispatch] = useReducer(dataCommonsReducer, initialState);
    const debouncedSearchQuery = useDebounce(state.searchQuery, 500);

    const [filterOptions, setFilterOptions] = useState<any>({ tags: [], updateFrequencies: [], sensitivityLevels: [] });
    useEffect(() => {
        mockApi.fetchFilterOptions().then(res => setFilterOptions(res.data));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_START' });
            try {
                const response = await mockApi.fetchDatasets(
                    debouncedSearchQuery,
                    state.filters,
                    state.sortOption,
                    state.currentPage
                );
                dispatch({
                    type: 'FETCH_SUCCESS',
                    payload: {
                        datasets: response.data,
                        totalCount: response.totalCount!,
                        totalPages: Math.ceil(response.totalCount! / PAGE_SIZE),
                    },
                });
            } catch (e: any) {
                dispatch({ type: 'FETCH_ERROR', payload: e.message || 'An unknown error occurred' });
            }
        };

        fetchData();
    }, [debouncedSearchQuery, state.filters, state.sortOption, state.currentPage]);

    const handleRetry = () => {
         dispatch({ type: 'SET_PAGE', payload: state.currentPage });
    };

    return (
        <Card title="Data Commons">
            <div className="flex flex-col space-y-6">
                <p className="text-gray-400">A centralized repository for discovering, accessing, and sharing curated datasets across the organization.</p>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <SearchBar
                        query={state.searchQuery}
                        onQueryChange={(q) => dispatch({ type: 'SET_SEARCH_QUERY', payload: q })}
                    />
                    <div className="flex items-center gap-4">
                         <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            Contribute Dataset
                        </button>
                    </div>
                </div>

                <div className="flex">
                    <FilterPanel
                        filters={state.filters}
                        onFilterChange={(f) => dispatch({ type: 'SET_FILTERS', payload: f })}
                        options={filterOptions}
                    />
                    <main className="flex-1 pl-8">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-gray-400">{state.totalCount} datasets found</div>
                            <div className="flex items-center gap-4">
                               <select
                                    value={state.sortOption}
                                    onChange={(e) => dispatch({ type: 'SET_SORT_OPTION', payload: e.target.value as SortOption })}
                                    className="bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="relevance">Sort by: Relevance</option>
                                    <option value="last_updated_desc">Sort by: Last Updated</option>
                                    <option value="name_asc">Sort by: Name (A-Z)</option>
                                    <option value="name_desc">Sort by: Name (Z-A)</option>
                                </select>
                                <div className="flex items-center rounded-md bg-gray-800 border border-gray-600">
                                    <button
                                        onClick={() => dispatch({type: 'SET_VIEW_MODE', payload: 'grid'})}
                                        className={`p-1.5 rounded-l-md ${state.viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                                    >
                                        <GridIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => dispatch({type: 'SET_VIEW_MODE', payload: 'list'})}
                                        className={`p-1.5 rounded-r-md ${state.viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                                    >
                                        <ListIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {state.isLoading ? (
                           state.viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
                                </div>
                           ) : (
                                <div className="space-y-4">
                                    {Array.from({ length: PAGE_SIZE }).map((_, i) => <div key={i} className="h-24 bg-gray-800 rounded-lg animate-pulse"></div>)}
                                </div>
                           )
                        ) : state.error ? (
                            <ErrorMessage message={state.error} onRetry={handleRetry} />
                        ) : state.datasets.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <h3 className="text-xl">No datasets found</h3>
                                <p>Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <>
                                {state.viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {state.datasets.map(ds => (
                                            <DatasetCard key={ds.id} dataset={ds} onSelect={(id) => dispatch({type: 'SELECT_DATASET', payload: id})} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                         {state.datasets.map(ds => (
                                            <DatasetListItem key={ds.id} dataset={ds} onSelect={(id) => dispatch({type: 'SELECT_DATASET', payload: id})} />
                                        ))}
                                    </div>
                                )}
                                <Pagination
                                    currentPage={state.currentPage}
                                    totalPages={state.totalPages}
                                    onPageChange={(p) => dispatch({ type: 'SET_PAGE', payload: p })}
                                />
                            </>
                        )}
                    </main>
                </div>
            </div>

            {state.isDetailModalOpen && state.selectedDatasetId && (
                <DatasetDetailModal
                    datasetId={state.selectedDatasetId}
                    onClose={() => dispatch({type: 'SELECT_DATASET', payload: null})}
                />
            )}
        </Card>
    );
};

export default DataCommonsView;