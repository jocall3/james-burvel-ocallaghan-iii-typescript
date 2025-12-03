import React, { useState, useEffect, useMemo, useCallback, createContext, useContext, ReactNode, Reducer, useReducer } from 'react';
import Card from '../../Card';

// SECTION: Types and Interfaces
// =================================================================================

export type DataProductLifecycleStatus = 'DRAFT' | 'PUBLISHED' | 'DEPRECATED' | 'RETIRED';
export type PortType = 'input' | 'output';
export type DataType = 'string' | 'integer' | 'float' | 'boolean' | 'timestamp' | 'json' | 'binary';
export type ComplianceTag = 'PII' | 'Confidential' | 'Sensitive' | 'Public';
export type DataQualitySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ChangeType = 'SCHEMA_CHANGE' | 'SLA_UPDATE' | 'OWNER_CHANGE' | 'NEW_VERSION';
export type UserRole = 'ADMIN' | 'OWNER' | 'CONSUMER' | 'GUEST';

export interface Owner {
    id: string;
    name: string;
    email: string;
    team: string;
}

export interface Domain {
    id: string;
    name: string;
    description: string;
    owner: Owner;
}

export interface SchemaField {
    name: string;
    type: DataType;
    description: string;
    nullable: boolean;
    tags?: ComplianceTag[];
    nestedFields?: SchemaField[];
}

export interface Port {
    id: string;
    name: string;
    type: PortType;
    description: string;
    schema: SchemaField[];
    format: 'JSON' | 'AVRO' | 'PARQUET' | 'CSV';
    location: string; // e.g., S3 URI, Kafka topic, API endpoint
}

export interface SLA {
    freshness: string; // e.g., '1 hour', '24 hours'
    uptime: number; // e.g., 99.9
    supportResponseTime: string; // e.g., '4 business hours'
}

export interface DataQualityMetric {
    id: string;
    metricName: string; // e.g., 'Completeness', 'Uniqueness', 'Validity'
    value: number; // e.g., 0.98 (98%)
    threshold: number;
    lastChecked: string;
    description: string;
}

export interface DataQualityIssue {
    id: string;
    description: string;
    severity: DataQualitySeverity;
    detectedAt: string;
    resolvedAt?: string;
    assignedTo?: Owner;
}

export interface VersionHistory {
    version: string;
    date: string;
    author: string;
    summary: string;
    changes: { type: ChangeType; description: string }[];
}

export interface AccessControlPolicy {
    role: string;
    permissions: ('READ' | 'WRITE' | 'CONSUME')[];
}

export interface DataProduct {
    id: string;
    name: string;
    domain: Domain;
    description: string;
    owner: Owner;
    status: DataProductLifecycleStatus;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    inputPorts: Port[];
    outputPorts: Port[];
    dependencies: string[]; // Array of DataProduct IDs
    dependents: string[]; // Array of DataProduct IDs
    sla: SLA;
    dataQualityScore: number;
    qualityMetrics: DataQualityMetric[];
    qualityIssues: DataQualityIssue[];
    version: string;
    versionHistory: VersionHistory[];
    accessControl: AccessControlPolicy[];
    documentationLink: string;
    cost: number; // monthly cost estimate
}

// SECTION: Mock Data and API Layer
// =================================================================================

const MOCK_OWNERS: Owner[] = [
    { id: 'owner-1', name: 'Alice Johnson', email: 'alice.j@example.com', team: 'Marketing Analytics' },
    { id: 'owner-2', name: 'Bob Williams', email: 'bob.w@example.com', team: 'Finance BI' },
    { id: 'owner-3', name: 'Charlie Brown', email: 'charlie.b@example.com', team: 'Sales Operations' },
    { id: 'owner-4', name: 'Diana Prince', email: 'diana.p@example.com', team: 'Product Insights' },
];

const MOCK_DOMAINS: Domain[] = [
    { id: 'domain-1', name: 'Marketing', description: 'Data products related to marketing campaigns, customer engagement, and lead generation.', owner: MOCK_OWNERS[0] },
    { id: 'domain-2', name: 'Finance', description: 'Core financial data, including revenue, expenses, and forecasts.', owner: MOCK_OWNERS[1] },
    { id: 'domain-3', name: 'Sales', description: 'Sales performance, CRM data, and customer account information.', owner: MOCK_OWNERS[2] },
    { id: 'domain-4', name: 'Product', description: 'User behavior, product features, and application telemetry.', owner: MOCK_OWNERS[3] },
];

const MOCK_DATA_PRODUCTS: DataProduct[] = [
    {
        id: 'dp-001',
        name: 'Customer 360 View',
        domain: MOCK_DOMAINS[0],
        description: 'A comprehensive, aggregated view of customer interactions across all touchpoints.',
        owner: MOCK_OWNERS[0],
        status: 'PUBLISHED',
        tags: ['customer', 'analytics', 'golden-record'],
        createdAt: '2023-01-15T09:30:00Z',
        updatedAt: '2023-10-28T14:00:00Z',
        inputPorts: [],
        outputPorts: [{
            id: 'port-1-out',
            name: 'Customer360-Parquet-S3',
            type: 'output',
            description: 'Daily snapshot of the C360 view in Parquet format.',
            schema: [
                { name: 'customer_id', type: 'string', description: 'Unique customer identifier', nullable: false, tags: ['PII'] },
                { name: 'full_name', type: 'string', description: 'Customer full name', nullable: false, tags: ['PII'] },
                { name: 'email', type: 'string', description: 'Customer email address', nullable: true, tags: ['PII'] },
                { name: 'first_seen_date', type: 'timestamp', description: 'Date of first interaction', nullable: false },
                { name: 'last_seen_date', type: 'timestamp', description: 'Date of most recent interaction', nullable: false },
                { name: 'total_orders', type: 'integer', description: 'Total number of orders placed', nullable: false },
                { name: 'lifetime_value', type: 'float', description: 'Predicted customer lifetime value', nullable: true },
                {
                    name: 'address', type: 'json', description: 'Customer primary address', nullable: true, tags: ['PII'],
                    nestedFields: [
                        { name: 'street', type: 'string', description: 'Street address', nullable: true },
                        { name: 'city', type: 'string', description: 'City', nullable: true },
                        { name: 'zip_code', type: 'string', description: 'ZIP code', nullable: true },
                    ]
                }
            ],
            format: 'PARQUET',
            location: 's3://data-mesh-prod/marketing/customer_360/'
        }],
        dependencies: ['dp-003', 'dp-005'],
        dependents: ['dp-002'],
        sla: { freshness: '24 hours', uptime: 99.9, supportResponseTime: '8 business hours' },
        dataQualityScore: 0.98,
        qualityMetrics: [
            { id: 'qm-1', metricName: 'Completeness', value: 0.99, threshold: 0.95, lastChecked: '2023-11-10T08:00:00Z', description: 'All required fields are present.' },
            { id: 'qm-2', metricName: 'Uniqueness (customer_id)', value: 1.0, threshold: 1.0, lastChecked: '2023-11-10T08:00:00Z', description: 'No duplicate customer IDs.' }
        ],
        qualityIssues: [],
        version: '2.1.0',
        versionHistory: [
            { version: '2.1.0', date: '2023-10-28', author: 'Alice Johnson', summary: 'Added lifetime_value field.', changes: [{ type: 'SCHEMA_CHANGE', description: 'Added `lifetime_value` (float) to output port.' }] },
            { version: '2.0.0', date: '2023-09-01', author: 'Alice Johnson', summary: 'Major schema refactor for performance.', changes: [{ type: 'SCHEMA_CHANGE', description: 'Changed address from string to nested JSON.' }] }
        ],
        accessControl: [{ role: 'Marketing Analysts', permissions: ['CONSUME'] }, { role: 'BI Team', permissions: ['CONSUME'] }],
        documentationLink: 'https://confluence.example.com/display/DATA/Customer+360+View',
        cost: 1200.50
    },
    {
        id: 'dp-002',
        name: 'Quarterly Revenue Forecast',
        domain: MOCK_DOMAINS[1],
        description: 'Predictive model output for the upcoming quarter\'s revenue.',
        owner: MOCK_OWNERS[1],
        status: 'PUBLISHED',
        tags: ['finance', 'forecasting', 'revenue'],
        createdAt: '2023-02-20T11:00:00Z',
        updatedAt: '2023-11-01T10:00:00Z',
        inputPorts: [{
            id: 'port-2-in',
            name: 'Customer360-Consumer',
            type: 'input',
            description: 'Consumes the daily C360 view.',
            schema: [], // Inferred from dp-001
            format: 'PARQUET',
            location: 's3://data-mesh-prod/marketing/customer_360/'
        }],
        outputPorts: [{
            id: 'port-2-out',
            name: 'Forecast-CSV-S3',
            type: 'output',
            description: 'CSV file with product-level revenue forecasts.',
            schema: [
                { name: 'product_sku', type: 'string', description: 'Product SKU', nullable: false },
                { name: 'forecast_date', type: 'timestamp', description: 'Date of the forecast', nullable: false },
                { name: 'predicted_revenue', type: 'float', description: 'Predicted revenue amount in USD', nullable: false },
                { name: 'confidence_interval_low', type: 'float', description: 'Lower bound of the 95% confidence interval', nullable: false },
                { name: 'confidence_interval_high', type: 'float', description: 'Upper bound of the 95% confidence interval', nullable: false },
            ],
            format: 'CSV',
            location: 's3://data-mesh-prod/finance/quarterly_forecast/'
        }],
        dependencies: ['dp-001'],
        dependents: [],
        sla: { freshness: '90 days', uptime: 99.5, supportResponseTime: '24 business hours' },
        dataQualityScore: 0.92,
        qualityMetrics: [
            { id: 'qm-3', metricName: 'Timeliness', value: 0.95, threshold: 0.9, lastChecked: '2023-11-01T09:00:00Z', description: 'Forecast is generated on schedule.' },
        ],
        qualityIssues: [
            { id: 'qi-1', description: 'Revenue prediction for SKU X-123 seems abnormally high.', severity: 'MEDIUM', detectedAt: '2023-11-02T14:00:00Z', assignedTo: MOCK_OWNERS[1] }
        ],
        version: '1.3.2',
        versionHistory: [
             { version: '1.3.2', date: '2023-11-01', author: 'Bob Williams', summary: 'Updated model algorithm for seasonality.', changes: [{ type: 'NEW_VERSION', description: 'Deployed new forecasting model v2.4.' }] }
        ],
        accessControl: [{ role: 'Finance Leadership', permissions: ['CONSUME'] }],
        documentationLink: 'https://confluence.example.com/display/DATA/Quarterly+Revenue+Forecast',
        cost: 450.00
    },
    {
        id: 'dp-003',
        name: 'CRM Contact Data',
        domain: MOCK_DOMAINS[2],
        description: 'Raw export of contact information from the corporate CRM system.',
        owner: MOCK_OWNERS[2],
        status: 'DEPRECATED',
        tags: ['crm', 'sales', 'raw-data'],
        createdAt: '2022-05-10T18:00:00Z',
        updatedAt: '2023-09-15T12:00:00Z',
        inputPorts: [],
        outputPorts: [],
        dependencies: [],
        dependents: ['dp-001'],
        sla: { freshness: '12 hours', uptime: 99.99, supportResponseTime: '4 business hours' },
        dataQualityScore: 0.75,
        qualityMetrics: [],
        qualityIssues: [
             { id: 'qi-2', description: 'High percentage of null values in `phone_number` field.', severity: 'HIGH', detectedAt: '2023-08-01T10:00:00Z' }
        ],
        version: '3.0.0',
        versionHistory: [],
        accessControl: [],
        documentationLink: 'https://confluence.example.com/display/DATA/CRM+Contact+Data',
        cost: 250.00
    },
    {
        id: 'dp-004',
        name: 'App Clickstream Events',
        domain: MOCK_DOMAINS[3],
        description: 'Real-time stream of user interaction events from the mobile and web applications.',
        owner: MOCK_OWNERS[3],
        status: 'PUBLISHED',
        tags: ['product', 'events', 'real-time', 'kafka'],
        createdAt: '2023-06-01T00:00:00Z',
        updatedAt: '2023-11-05T18:30:00Z',
        inputPorts: [],
        outputPorts: [{
            id: 'port-4-out',
            name: 'Clickstream-Kafka-Topic',
            type: 'output',
            description: 'Kafka topic with AVRO-formatted clickstream events.',
            schema: [
                { name: 'event_id', type: 'string', description: 'Unique event identifier', nullable: false },
                { name: 'user_id', type: 'string', description: 'User identifier', nullable: true, tags: ['PII'] },
                { name: 'session_id', type: 'string', description: 'Session identifier', nullable: false },
                { name: 'event_timestamp', type: 'timestamp', description: 'Timestamp of the event', nullable: false },
                { name: 'event_type', type: 'string', description: 'Type of event (e.g., page_view, click, purchase)', nullable: false },
                { name: 'payload', type: 'json', description: 'JSON object with event-specific data', nullable: true },
            ],
            format: 'AVRO',
            location: 'kafka://kafka-prod-bus/topics/app_clickstream'
        }],
        dependencies: [],
        dependents: ['dp-005'],
        sla: { freshness: '1 second', uptime: 99.95, supportResponseTime: '2 business hours' },
        dataQualityScore: 0.99,
        qualityMetrics: [],
        qualityIssues: [],
        version: '1.0.0',
        versionHistory: [
            { version: '1.0.0', date: '2023-06-01', author: 'Diana Prince', summary: 'Initial release of the event stream.', changes: [{ type: 'NEW_VERSION', description: 'First published version.' }] }
        ],
        accessControl: [{ role: 'Product Analytics', permissions: ['CONSUME'] }],
        documentationLink: 'https://confluence.example.com/display/DATA/App+Clickstream+Events',
        cost: 3500.75
    },
    {
        id: 'dp-005',
        name: 'User Session Aggregates',
        domain: MOCK_DOMAINS[3],
        description: 'Hourly aggregated user session data derived from the clickstream.',
        owner: MOCK_OWNERS[3],
        status: 'DRAFT',
        tags: ['product', 'analytics', 'aggregates'],
        createdAt: '2023-10-10T10:10:10Z',
        updatedAt: '2023-11-09T17:00:00Z',
        inputPorts: [{
            id: 'port-5-in',
            name: 'Clickstream-Consumer',
            type: 'input',
            description: 'Consumes the real-time clickstream topic.',
            schema: [],
            format: 'AVRO',
            location: 'kafka://kafka-prod-bus/topics/app_clickstream'
        }],
        outputPorts: [],
        dependencies: ['dp-004'],
        dependents: ['dp-001'],
        sla: { freshness: '1 hour', uptime: 99.9, supportResponseTime: '8 business hours' },
        dataQualityScore: 0.0,
        qualityMetrics: [],
        qualityIssues: [],
        version: '0.1.0',
        versionHistory: [],
        accessControl: [],
        documentationLink: '',
        cost: 800.00
    }
];

export const mockApi = {
    fetchDataProducts: async (): Promise<DataProduct[]> => {
        console.log('Fetching data products...');
        return new Promise(resolve => setTimeout(() => resolve(MOCK_DATA_PRODUCTS), 1000));
    },
    fetchDomains: async (): Promise<Domain[]> => {
        console.log('Fetching domains...');
        return new Promise(resolve => setTimeout(() => resolve(MOCK_DOMAINS), 500));
    },
    fetchOwners: async (): Promise<Owner[]> => {
        console.log('Fetching owners...');
        return new Promise(resolve => setTimeout(() => resolve(MOCK_OWNERS), 500));
    },
    fetchDataProductById: async (id: string): Promise<DataProduct | undefined> => {
        console.log(`Fetching data product with id: ${id}`);
        return new Promise(resolve => setTimeout(() => resolve(MOCK_DATA_PRODUCTS.find(dp => dp.id === id)), 700));
    }
};

// SECTION: UI Utility Components
// =================================================================================

export const Spinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
);

export const Badge: React.FC<{ color: string; children: ReactNode }> = ({ color, children }) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
        {children}
    </span>
);

export const StatusBadge: React.FC<{ status: DataProductLifecycleStatus }> = ({ status }) => {
    const statusMap: Record<DataProductLifecycleStatus, { text: string; color: string }> = {
        PUBLISHED: { text: 'Published', color: 'bg-green-500/20 text-green-300' },
        DRAFT: { text: 'Draft', color: 'bg-yellow-500/20 text-yellow-300' },
        DEPRECATED: { text: 'Deprecated', color: 'bg-orange-500/20 text-orange-300' },
        RETIRED: { text: 'Retired', color: 'bg-red-500/20 text-red-300' },
    };
    const { text, color } = statusMap[status];
    return <Badge color={color}>{text}</Badge>;
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const Tooltip: React.FC<{ text: string; children: ReactNode }> = ({ text, children }) => (
    <div className="relative group">
        {children}
        <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {text}
        </div>
    </div>
);

// SECTION: SVG Icons
// =================================================================================

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export const GridIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

export const ListIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

export const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

// SECTION: Data Product Sub-Components
// =================================================================================

export const DataProductCard: React.FC<{ product: DataProduct; onSelect: (product: DataProduct) => void }> = ({ product, onSelect }) => {
    return (
        <div onClick={() => onSelect(product)} className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-blue-400 mb-1">{product.name}</h3>
                    <StatusBadge status={product.status} />
                </div>
                <p className="text-sm text-gray-400 mb-2">Domain: <span className="font-semibold text-gray-300">{product.domain.name}</span></p>
                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
            </div>
            <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Owner: {product.owner.name}</span>
                    <Tooltip text={`Data Quality Score: ${product.dataQualityScore * 100}%`}>
                        <div className="flex items-center">
                            <span className="mr-1">{`Q: ${(product.dataQualityScore * 100).toFixed(0)}%`}</span>
                            <div className={`w-2 h-2 rounded-full ${product.dataQualityScore > 0.95 ? 'bg-green-500' : product.dataQualityScore > 0.8 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        </div>
                    </Tooltip>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                    {product.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} color="bg-gray-600 text-gray-300">{tag}</Badge>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const SchemaViewer: React.FC<{ schema: SchemaField[] }> = ({ schema }) => {
    const renderField = (field: SchemaField, level: number) => (
        <div key={field.name} style={{ marginLeft: `${level * 20}px` }} className="py-2 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <code className="text-purple-400">{field.name}</code>
                    <span className="text-gray-500 mx-2">:</span>
                    <code className="text-cyan-400">{field.type}</code>
                    {!field.nullable && <span className="ml-2 text-red-400 text-xs font-mono">REQUIRED</span>}
                </div>
                <div className="flex items-center gap-2">
                    {field.tags?.map(tag => <Badge key={tag} color="bg-red-500/30 text-red-300">{tag}</Badge>)}
                </div>
            </div>
            <p className="text-sm text-gray-400 mt-1">{field.description}</p>
            {field.nestedFields && (
                <div className="mt-2 border-l-2 border-gray-600 pl-2">
                    {field.nestedFields.map(nested => renderField(nested, level + 1))}
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg font-mono text-sm">
            {schema.map(field => renderField(field, 0))}
        </div>
    );
};

export const DataProductDetailsModal: React.FC<{ product: DataProduct | null; onClose: () => void }> = ({ product, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'lineage' | 'quality' | 'access'>('overview');

    if (!product) return null;
    
    const TabButton: React.FC<{ tabId: typeof activeTab; children: ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tabId
                    ? 'border-b-2 border-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
            }`}
        >
            {children}
        </button>
    );

    return (
        <Modal isOpen={!!product} onClose={onClose} title={product.name}>
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-4">
                    <TabButton tabId="overview">Overview</TabButton>
                    <TabButton tabId="schema">Schema</TabButton>
                    <TabButton tabId="lineage">Lineage</TabButton>
                    <TabButton tabId="quality">Data Quality</TabButton>
                    <TabButton tabId="access">Access Control</TabButton>
                </nav>
            </div>
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="md:col-span-2 space-y-4">
                            <div><strong className="text-gray-400">Description:</strong> <p className="text-gray-300">{product.description}</p></div>
                            <div><strong className="text-gray-400">Domain:</strong> <span className="text-gray-300">{product.domain.name}</span></div>
                            <div><strong className="text-gray-400">Owner:</strong> <span className="text-gray-300">{product.owner.name} ({product.owner.email})</span></div>
                            <div><strong className="text-gray-400">Status:</strong> <StatusBadge status={product.status} /></div>
                            <div><strong className="text-gray-400">Version:</strong> <span className="text-gray-300">{product.version}</span></div>
                        </div>
                        <div className="space-y-4 bg-gray-700/50 p-4 rounded-lg">
                            <div><strong className="text-gray-400">Created:</strong> <span className="text-gray-300">{new Date(product.createdAt).toLocaleDateString()}</span></div>
                            <div><strong className="text-gray-400">Last Updated:</strong> <span className="text-gray-300">{new Date(product.updatedAt).toLocaleDateString()}</span></div>
                            <div>
                                <strong className="text-gray-400">Documentation:</strong>
                                <a href={product.documentationLink} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:underline flex items-center">
                                    Confluence <ExternalLinkIcon className="w-4 h-4 ml-1" />
                                </a>
                            </div>
                            <div><strong className="text-gray-400">Est. Monthly Cost:</strong> <span className="text-gray-300">${product.cost.toFixed(2)}</span></div>
                        </div>
                    </div>
                )}
                {activeTab === 'schema' && (
                    <div className="space-y-6">
                       {product.outputPorts.map(port => (
                           <div key={port.id}>
                               <h4 className="text-lg font-semibold text-gray-200 mb-2">{port.name} ({port.format})</h4>
                               <p className="text-gray-400 mb-2 text-sm">{port.description}</p>
                               <SchemaViewer schema={port.schema} />
                           </div>
                       ))}
                       {product.outputPorts.length === 0 && <p className="text-gray-500">No output ports defined for this data product.</p>}
                    </div>
                )}
                {activeTab === 'lineage' && (
                    <div>
                        <h4 className="text-lg font-semibold text-gray-200 mb-4">Data Lineage</h4>
                        <div className="p-4 bg-gray-900 rounded-lg text-center text-gray-400">
                           <p className="font-bold mb-2">Lineage Graph Visualization</p>
                           <p className="text-sm">This would be a graph visualization (e.g., using D3.js) showing upstream dependencies and downstream consumers.</p>
                           <div className="my-4 text-left space-y-2">
                               <p><strong className="text-gray-300">Dependencies (Upstream):</strong> {product.dependencies.join(', ') || 'None'}</p>
                               <p><strong className="text-gray-300">Dependents (Downstream):</strong> {product.dependents.join(', ') || 'None'}</p>
                           </div>
                        </div>
                    </div>
                )}
                 {activeTab === 'quality' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-200 mb-2">Overall Quality Score</h4>
                            <div className="text-3xl font-bold text-green-400">{(product.dataQualityScore * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-200 mb-2">Quality Metrics</h4>
                             {product.qualityMetrics.map(metric => (
                                <div key={metric.id} className="p-3 bg-gray-700/50 rounded mb-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">{metric.metricName}</span>
                                        <span className={metric.value >= metric.threshold ? 'text-green-400' : 'text-red-400'}>
                                            {(metric.value * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">{metric.description}</p>
                                </div>
                             ))}
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-200 mb-2">Active Issues</h4>
                            {product.qualityIssues.filter(i => !i.resolvedAt).map(issue => (
                               <div key={issue.id} className="p-3 border-l-4 border-red-500 bg-red-500/10 rounded mb-2">
                                    <p className="font-semibold">{issue.description}</p>
                                    <p className="text-xs text-gray-400">
                                        Severity: {issue.severity} | Detected: {new Date(issue.detectedAt).toLocaleString()}
                                    </p>
                               </div>
                            ))}
                            {product.qualityIssues.length === 0 && <p className="text-gray-500">No active quality issues.</p>}
                        </div>
                    </div>
                )}
                {activeTab === 'access' && (
                    <div>
                         <h4 className="text-lg font-semibold text-gray-200 mb-4">Access Control Policies</h4>
                         <div className="overflow-x-auto">
                            <table className="min-w-full bg-gray-800 border border-gray-700">
                                <thead>
                                    <tr className="bg-gray-700/50">
                                        <th className="text-left p-3 text-sm font-semibold text-gray-300">Role/Group</th>
                                        <th className="text-left p-3 text-sm font-semibold text-gray-300">Permissions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {product.accessControl.map((policy, index) => (
                                    <tr key={index} className="border-t border-gray-700">
                                        <td className="p-3 text-gray-300">{policy.role}</td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                {policy.permissions.map(p => <Badge key={p} color="bg-blue-500/20 text-blue-300">{p}</Badge>)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

// SECTION: Filters and State Management
// =================================================================================

export interface DataMeshFilters {
    searchTerm: string;
    domains: Set<string>;
    owners: Set<string>;
    statuses: Set<DataProductLifecycleStatus>;
    tags: string[];
}

type FilterAction =
    | { type: 'SET_SEARCH_TERM'; payload: string }
    | { type: 'TOGGLE_DOMAIN'; payload: string }
    | { type: 'TOGGLE_OWNER'; payload: string }
    | { type: 'TOGGLE_STATUS'; payload: DataProductLifecycleStatus }
    | { type: 'RESET_FILTERS' };

export const initialFilters: DataMeshFilters = {
    searchTerm: '',
    domains: new Set(),
    owners: new Set(),
    statuses: new Set(),
    tags: [],
};

export function filtersReducer(state: DataMeshFilters, action: FilterAction): DataMeshFilters {
    switch (action.type) {
        case 'SET_SEARCH_TERM':
            return { ...state, searchTerm: action.payload };
        case 'TOGGLE_DOMAIN': {
            const newDomains = new Set(state.domains);
            if (newDomains.has(action.payload)) newDomains.delete(action.payload);
            else newDomains.add(action.payload);
            return { ...state, domains: newDomains };
        }
        case 'TOGGLE_OWNER': {
            const newOwners = new Set(state.owners);
            if (newOwners.has(action.payload)) newOwners.delete(action.payload);
            else newOwners.add(action.payload);
            return { ...state, owners: newOwners };
        }
        case 'TOGGLE_STATUS': {
            const newStatuses = new Set(state.statuses);
            if (newStatuses.has(action.payload)) newStatuses.delete(action.payload);
            else newStatuses.add(action.payload);
            return { ...state, statuses: newStatuses };
        }
        case 'RESET_FILTERS':
            return initialFilters;
        default:
            return state;
    }
}

export const FilterSidebar: React.FC<{
    domains: Domain[];
    owners: Owner[];
    filters: DataMeshFilters;
    dispatch: React.Dispatch<FilterAction>;
}> = ({ domains, owners, filters, dispatch }) => {
    
    const FilterSection: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
        <div className="py-4 border-b border-gray-700">
            <h4 className="font-semibold text-gray-300 mb-2 px-4">{title}</h4>
            {children}
        </div>
    );
    
    const CheckboxItem: React.FC<{ label: string; id: string; checked: boolean; onChange: () => void; }> = ({ label, id, checked, onChange }) => (
        <label htmlFor={id} className="flex items-center space-x-2 px-4 py-1 cursor-pointer hover:bg-gray-700/50 rounded">
            <input type="checkbox" id={id} checked={checked} onChange={onChange} className="form-checkbox bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500/50" />
            <span className="text-gray-400 text-sm">{label}</span>
        </label>
    );

    return (
        <div className="w-64 bg-gray-800/50 border-r border-gray-700 h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white">Filters</h3>
            </div>
            <FilterSection title="Status">
                {(['PUBLISHED', 'DRAFT', 'DEPRECATED', 'RETIRED'] as DataProductLifecycleStatus[]).map(status => (
                     <CheckboxItem 
                        key={status}
                        id={`status-${status}`}
                        label={status.charAt(0) + status.slice(1).toLowerCase()}
                        checked={filters.statuses.has(status)}
                        onChange={() => dispatch({ type: 'TOGGLE_STATUS', payload: status })}
                     />
                ))}
            </FilterSection>
            <FilterSection title="Domains">
                {domains.map(domain => (
                    <CheckboxItem
                        key={domain.id}
                        id={`domain-${domain.id}`}
                        label={domain.name}
                        checked={filters.domains.has(domain.id)}
                        onChange={() => dispatch({ type: 'TOGGLE_DOMAIN', payload: domain.id })}
                    />
                ))}
            </FilterSection>
            <FilterSection title="Owners">
                 {owners.map(owner => (
                    <CheckboxItem
                        key={owner.id}
                        id={`owner-${owner.id}`}
                        label={owner.name}
                        checked={filters.owners.has(owner.id)}
                        onChange={() => dispatch({ type: 'TOGGLE_OWNER', payload: owner.id })}
                    />
                ))}
            </FilterSection>
             <div className="p-4">
                <button 
                    onClick={() => dispatch({ type: 'RESET_FILTERS' })}
                    className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
                >
                    Reset All Filters
                </button>
            </div>
        </div>
    );
};

// SECTION: Main View and Layout
// =================================================================================

const DataMeshView: React.FC = () => {
    const [dataProducts, setDataProducts] = useState<DataProduct[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [owners, setOwners] = useState<Owner[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, dispatch] = useReducer(filtersReducer, initialFilters);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedProduct, setSelectedProduct] = useState<DataProduct | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [productsData, domainsData, ownersData] = await Promise.all([
                    mockApi.fetchDataProducts(),
                    mockApi.fetchDomains(),
                    mockApi.fetchOwners(),
                ]);
                setDataProducts(productsData);
                setDomains(domainsData);
                setOwners(ownersData);
            } catch (err) {
                setError('Failed to load data mesh resources.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredDataProducts = useMemo(() => {
        return dataProducts.filter(product => {
            const searchTermMatch = filters.searchTerm.length === 0 ||
                product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                product.tags.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase()));

            const domainMatch = filters.domains.size === 0 || filters.domains.has(product.domain.id);
            const ownerMatch = filters.owners.size === 0 || filters.owners.has(product.owner.id);
            const statusMatch = filters.statuses.size === 0 || filters.statuses.has(product.status);

            return searchTermMatch && domainMatch && ownerMatch && statusMatch;
        });
    }, [dataProducts, filters]);

    const handleSelectProduct = useCallback((product: DataProduct) => {
        setSelectedProduct(product);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedProduct(null);
    }, []);
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value });
    };

    const Header = () => (
        <div className="flex justify-between items-center p-4 bg-gray-900/50 border-b border-gray-700">
            <div>
                <h1 className="text-2xl font-bold text-white">Data Mesh Explorer</h1>
                <p className="text-gray-400">Discover, understand, and use data products across the enterprise.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search data products..."
                        value={filters.searchTerm}
                        onChange={handleSearchChange}
                        className="bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                 <div className="flex items-center bg-gray-800 border border-gray-600 rounded-lg p-1">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
                        <GridIcon className="w-5 h-5 text-white" />
                    </button>
                     <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
                        <ListIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    Create Data Product
                </button>
            </div>
        </div>
    );

    const MainContent = () => {
        if (isLoading) return <Spinner />;
        if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
        if (filteredDataProducts.length === 0) return <div className="p-8 text-center text-gray-500">No data products match your criteria.</div>;

        if (viewMode === 'grid') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                    {filteredDataProducts.map(product => (
                        <DataProductCard key={product.id} product={product} onSelect={handleSelectProduct} />
                    ))}
                </div>
            );
        }

        // List View (placeholder for more complex table)
        return (
            <div className="p-4">
                <table className="min-w-full bg-gray-800">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="text-left p-3 text-sm font-semibold text-gray-300">Name</th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-300">Domain</th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-300">Owner</th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-300">Status</th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-300">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDataProducts.map(p => (
                            <tr key={p.id} onClick={() => handleSelectProduct(p)} className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer">
                                <td className="p-3 text-blue-400 font-semibold">{p.name}</td>
                                <td className="p-3 text-gray-300">{p.domain.name}</td>
                                <td className="p-3 text-gray-300">{p.owner.name}</td>
                                <td className="p-3"><StatusBadge status={p.status} /></td>
                                <td className="p-3 text-gray-400">{new Date(p.updatedAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <Card title="Data Mesh">
            <div className="bg-gray-900 text-gray-200 min-h-[80vh] flex flex-col">
                <Header />
                <div className="flex flex-grow overflow-hidden">
                    <FilterSidebar domains={domains} owners={owners} filters={filters} dispatch={dispatch} />
                    <main className="flex-grow overflow-y-auto">
                        <MainContent />
                    </main>
                </div>
                <DataProductDetailsModal product={selectedProduct} onClose={handleCloseModal} />
            </div>
        </Card>
    );
};

export default DataMeshView;
