// components/views/platform/DemoBankCDPView.tsx
import React, { useState, useEffect, useCallback, useMemo, FC, ReactNode } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// SECTION: TYPES AND INTERFACES
// In a real application, these would be in a dedicated types directory.

/**
 * Represents the status of an asynchronous operation.
 */
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Represents a single rule in a segment definition.
 */
export interface SegmentRule {
    id: string;
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in_list' | 'is_true' | 'is_false' | 'last_seen_before' | 'last_seen_after';
    value: string | number | boolean | string[];
}

/**
 * Represents a group of rules, connected by a logical operator.
 */
export interface RuleGroup {
    id: string;
    combinator: 'AND' | 'OR';
    rules: (SegmentRule | RuleGroup)[];
}

/**
 * Represents an audience segment in the CDP.
 */
export interface AudienceSegment {
    id: number;
    name: string;
    description: string;
    size: number;
    status: 'Active' | 'Building' | 'Archived' | 'Draft';
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    definition: RuleGroup;
    tags: string[];
    activationTargets: string[]; // e.g., ['Google Ads', 'Facebook Ads', 'Braze']
}

/**
 * Represents a data source connected to the CDP.
 */
export interface DataSource {
    id: string;
    name: string;
    type: 'CRM' | 'Web Analytics' | 'Mobile App' | 'Transactional DB' | 'Support Desk';
    status: 'Connected' | 'Error' | 'Pending';
    lastIngested: string;
    ingestionVolume: number; // GB per month
}

/**
 * Represents a customer event.
 */
export interface CustomerEvent {
    id: string;
    timestamp: string;
    type: string; // e.g., 'page_view', 'purchase', 'app_open'
    properties: Record<string, any>;
}

/**
 * Represents a unified customer profile.
 */
export interface CustomerProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    createdAt: string;
    lastSeen: string;
    totalSpend: number;
    orderCount: number;
    segments: number[]; // Array of segment IDs
    attributes: Record<string, any>; // Custom attributes
    timeline: CustomerEvent[];
}

/**
 * Represents a data point for analytics charts.
 */
export interface AnalyticsDataPoint {
    date: string;
    value: number;
}

/**
 * Represents the overall dashboard metrics.
 */
export interface DashboardMetrics {
    unifiedProfiles: number;
    dataSources: number;
    activeSegments: number;
    profileGrowth: AnalyticsDataPoint[];
    segmentSizeDistribution: { name: string; value: number }[];
}

// NOTE: In a real app, this data would come from a dedicated file e.g., /data/platform/cdpData.ts
const segments = [
    { id: 1, name: 'High-Value Customers', size: 12_500, status: 'Active' },
    { id: 2, name: 'Churn Risk (Q2)', size: 3_200, status: 'Active' },
    { id: 3, name: 'New Leads - West Coast', size: 8_500, status: 'Building' },
];

// SECTION: MOCK API SERVICE
// This class simulates API calls to a backend service.
// In a real application, this would be in a separate file (e.g., /services/cdpApi.ts)
// and would use fetch or axios to make real HTTP requests.

export class MockCdpApiService {
    private segments: AudienceSegment[];
    private profiles: CustomerProfile[];
    private dataSources: DataSource[];
    private metrics: DashboardMetrics;

    constructor() {
        this.segments = MOCK_SEGMENTS;
        this.profiles = MOCK_PROFILES;
        this.dataSources = MOCK_DATA_SOURCES;
        this.metrics = MOCK_METRICS;
    }

    private simulateLatency<T>(data: T, delay: number = 500): Promise<T> {
        return new Promise(resolve => setTimeout(() => resolve(data), delay));
    }

    async getDashboardMetrics(): Promise<DashboardMetrics> {
        return this.simulateLatency(this.metrics);
    }

    async getSegments(
        page: number = 1,
        limit: number = 10,
        sortBy: keyof AudienceSegment = 'name',
        sortOrder: 'asc' | 'desc' = 'asc',
        filter: string = ''
    ): Promise<{ data: AudienceSegment[]; total: number }> {
        let filteredSegments = this.segments.filter(s =>
            s.name.toLowerCase().includes(filter.toLowerCase()) ||
            s.description.toLowerCase().includes(filter.toLowerCase())
        );

        filteredSegments.sort((a, b) => {
            const valA = a[sortBy];
            const valB = b[sortBy];
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        const paginatedData = filteredSegments.slice((page - 1) * limit, page * limit);
        return this.simulateLatency({ data: paginatedData, total: filteredSegments.length });
    }


    async getSegmentById(id: number): Promise<AudienceSegment | undefined> {
        const segment = this.segments.find(s => s.id === id);
        return this.simulateLatency(segment);
    }
    
    async createSegment(segmentData: Omit<AudienceSegment, 'id' | 'createdAt' | 'updatedAt' | 'size'>): Promise<AudienceSegment> {
        const newSegment: AudienceSegment = {
            ...segmentData,
            id: Math.max(...this.segments.map(s => s.id)) + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            size: Math.floor(Math.random() * 20000) + 1000, // Simulate size calculation
        };
        this.segments.push(newSegment);
        this.metrics.activeSegments++;
        return this.simulateLatency(newSegment, 800);
    }

    async updateSegment(id: number, updates: Partial<AudienceSegment>): Promise<AudienceSegment | undefined> {
        const segmentIndex = this.segments.findIndex(s => s.id === id);
        if (segmentIndex === -1) {
            return this.simulateLatency(undefined);
        }
        const updatedSegment = { ...this.segments[segmentIndex], ...updates, updatedAt: new Date().toISOString() };
        this.segments[segmentIndex] = updatedSegment;
        return this.simulateLatency(updatedSegment);
    }
    
    async deleteSegment(id: number): Promise<{ success: boolean }> {
        const initialLength = this.segments.length;
        this.segments = this.segments.filter(s => s.id !== id);
        if(this.segments.length < initialLength) {
            this.metrics.activeSegments--;
            return this.simulateLatency({ success: true });
        }
        return this.simulateLatency({ success: false });
    }
    
    async getSegmentAnalytics(segmentId: number, timeRange: '7d' | '30d' | '90d'): Promise<{ sizeHistory: AnalyticsDataPoint[] }> {
        const days = { '7d': 7, '30d': 30, '90d': 90 }[timeRange];
        const segment = this.segments.find(s => s.id === segmentId);
        const baseSize = segment ? segment.size : 10000;
        const sizeHistory: AnalyticsDataPoint[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const fluctuation = (Math.random() - 0.5) * 0.1; // +/- 10%
            const value = Math.round(baseSize * (1 + fluctuation));
            sizeHistory.push({ date: date.toISOString().split('T')[0], value });
        }
        return this.simulateLatency({ sizeHistory }, 700);
    }

    async getDataSources(): Promise<DataSource[]> {
        return this.simulateLatency(this.dataSources);
    }

    async searchProfiles(query: string): Promise<CustomerProfile[]> {
        if (!query) return this.simulateLatency([]);
        const lowerQuery = query.toLowerCase();
        const results = this.profiles.filter(p => 
            p.firstName.toLowerCase().includes(lowerQuery) ||
            p.lastName.toLowerCase().includes(lowerQuery) ||
            p.email.toLowerCase().includes(lowerQuery)
        ).slice(0, 10);
        return this.simulateLatency(results, 400);
    }

    async getProfileById(id: string): Promise<CustomerProfile | undefined> {
        const profile = this.profiles.find(p => p.id === id);
        return this.simulateLatency(profile);
    }

    async estimateAudienceSize(definition: RuleGroup): Promise<number> {
        // In a real app, this would be a complex query against the profile database.
        // Here, we just simulate it based on the number of rules.
        const complexity = JSON.stringify(definition).length;
        const baseSize = 1_500_000;
        const estimatedSize = Math.floor(baseSize / (complexity / 100 + 1) * (Math.random() * 0.4 + 0.8));
        return this.simulateLatency(estimatedSize, 1200);
    }
}

// Instantiate the service. In a real app, this would be provided through context or dependency injection.
export const cdpApiService = new MockCdpApiService();


// SECTION: MOCK DATA
// In a real application, this would be populated from a database.

export const MOCK_DATA_SOURCES: DataSource[] = [
    { id: 'ds-1', name: 'Salesforce CRM', type: 'CRM', status: 'Connected', lastIngested: '2023-10-27T10:00:00Z', ingestionVolume: 15.2 },
    { id: 'ds-2', name: 'Website Analytics (GA4)', type: 'Web Analytics', status: 'Connected', lastIngested: '2023-10-27T10:05:00Z', ingestionVolume: 45.8 },
    { id: 'ds-3', name: 'iOS App Events', type: 'Mobile App', status: 'Error', lastIngested: '2023-10-26T18:00:00Z', ingestionVolume: 22.1 },
    { id: 'ds-4', name: 'PostgreSQL Orders DB', type: 'Transactional DB', status: 'Connected', lastIngested: '2023-10-27T09:30:00Z', ingestionVolume: 8.5 },
    { id: 'ds-5', name: 'Zendesk Tickets', type: 'Support Desk', status: 'Pending', lastIngested: new Date().toISOString(), ingestionVolume: 2.1 },
];

export const MOCK_SEGMENTS: AudienceSegment[] = [
    { id: 1, name: 'High-Value Customers', description: "Customers with LTV > $5,000 and at least 5 orders.", size: 12500, status: 'Active', createdAt: '2023-01-15T14:20:11Z', updatedAt: '2023-10-25T09:15:00Z', createdBy: 'admin@demobank.com', tags: ['Loyalty', 'VIP'], activationTargets: ['Google Ads', 'Braze'], definition: { id: 'root', combinator: 'AND', rules: [{ id: 'rule1', field: 'lifetime_value', operator: 'greater_than', value: 5000 }, { id: 'rule2', field: 'total_orders', operator: 'greater_than', value: 5 }] } },
    { id: 2, name: 'Churn Risk (Q4)', description: "Active users who haven't made a purchase in 90 days.", size: 3200, status: 'Active', createdAt: '2023-02-20T11:00:00Z', updatedAt: '2023-10-20T18:00:00Z', createdBy: 'marketing@demobank.com', tags: ['Retention'], activationTargets: ['Facebook Ads'], definition: { id: 'root', combinator: 'AND', rules: [{ id: 'rule1', field: 'last_purchase_date', operator: 'last_seen_before', value: '90_days_ago' }, { id: 'rule2', field: 'status', operator: 'equals', value: 'active' }] } },
    { id: 3, name: 'New Leads - West Coast', description: "Users who signed up in the last 30 days from CA, WA, OR.", size: 8500, status: 'Building', createdAt: '2023-10-01T10:00:00Z', updatedAt: '2023-10-26T12:00:00Z', createdBy: 'sales.ops@demobank.com', tags: ['Acquisition', 'Regional'], activationTargets: [], definition: { id: 'root', combinator: 'AND', rules: [{ id: 'rule1', field: 'signup_date', operator: 'last_seen_after', value: '30_days_ago' }, { id: 'rule2', field: 'state', operator: 'in_list', value: ['CA', 'WA', 'OR'] }] } },
    { id: 4, name: 'Engaged App Users', description: "Users who opened the app at least 10 times in the last month.", size: 25400, status: 'Active', createdAt: '2023-05-10T09:00:00Z', updatedAt: '2023-10-24T10:00:00Z', createdBy: 'product@demobank.com', tags: ['Engagement', 'Mobile'], activationTargets: ['Braze'], definition: { id: 'root', combinator: 'AND', rules: [] } },
    { id: 5, name: 'Cart Abandoners (Last 7 Days)', description: "Users who added to cart but did not purchase in the last week.", size: 11250, status: 'Active', createdAt: '2023-06-01T16:00:00Z', updatedAt: '2023-10-27T08:00:00Z', createdBy: 'ecommerce@demobank.com', tags: ['Retargeting'], activationTargets: ['Google Ads', 'Facebook Ads'], definition: { id: 'root', combinator: 'AND', rules: [] } },
    { id: 6, name: 'Archived - Q2 Promos', description: "Old segment for a past campaign.", size: 19800, status: 'Archived', createdAt: '2022-04-01T00:00:00Z', updatedAt: '2022-07-01T00:00:00Z', createdBy: 'admin@demobank.com', tags: [], activationTargets: [], definition: { id: 'root', combinator: 'AND', rules: [] } },
    { id: 7, name: 'Upcoming: Holiday Shoppers', description: "Segment for the upcoming holiday season.", size: 0, status: 'Draft', createdAt: '2023-10-26T15:00:00Z', updatedAt: '2023-10-26T15:00:00Z', createdBy: 'marketing@demobank.com', tags: ['Seasonal'], activationTargets: [], definition: { id: 'root', combinator: 'AND', rules: [] } },
];

export const MOCK_PROFILES: CustomerProfile[] = Array.from({ length: 50 }, (_, i) => {
    const firstName = `User${i}`;
    const lastName = `Test${i}`;
    return {
        id: `user-${1000 + i}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+1-555-010-${i.toString().padStart(2, '0')}`,
        createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
        lastSeen: new Date(Date.now() - Math.random() * 1e8).toISOString(),
        totalSpend: Math.random() * 10000,
        orderCount: Math.floor(Math.random() * 50),
        segments: [1, 5],
        attributes: {
            city: 'New York',
            country: 'USA',
            plan_type: i % 3 === 0 ? 'Premium' : 'Standard',
            ltv_prediction: Math.random() * 5000 + 500,
        },
        timeline: [
            { id: `evt-${i}-1`, timestamp: new Date(Date.now() - Math.random() * 1e7).toISOString(), type: 'page_view', properties: { url: '/pricing' } },
            { id: `evt-${i}-2`, timestamp: new Date(Date.now() - Math.random() * 1e8).toISOString(), type: 'purchase', properties: { amount: 99.99, items: 3 } },
        ]
    }
});

export const MOCK_METRICS: DashboardMetrics = {
    unifiedProfiles: 1_500_000,
    dataSources: 12,
    activeSegments: 25,
    profileGrowth: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
            date: date.toISOString().split('T')[0],
            value: 1_450_000 + i * 1500 + Math.random() * 10000,
        };
    }),
    segmentSizeDistribution: MOCK_SEGMENTS.filter(s => s.status === 'Active').map(s => ({ name: s.name, value: s.size })),
};

// SECTION: HELPER UTILS & HOOKS

/**
 * A custom hook for debouncing a value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
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
}

/**
 * Formats a number into a compact, human-readable string.
 * @param num The number to format.
 * @returns A formatted string (e.g., 1.5M, 12.5k).
 */
export const formatCompactNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
    return num.toString();
};

/**
 * Formats an ISO date string into a more readable format.
 * @param dateString The ISO date string.
 * @returns A formatted date string (e.g., Oct 27, 2023).
 */
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};


// SECTION: UI COMPONENTS
// In a larger app, each of these would be in its own file.

/**
 * A simple line chart component using SVG.
 */
export const LineChart: FC<{ data: AnalyticsDataPoint[], width?: number, height?: number, color?: string }> = ({ data, width = 500, height = 200, color = 'cyan' }) => {
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min === 0 ? 1 : max - min;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * chartWidth;
        const y = chartHeight - ((d.value - min) / range) * chartHeight;
        return `${x},${y}`;
    }).join(' ');
    
    // Y-axis labels
    const yLabels = Array.from({length: 5}, (_, i) => {
        const value = min + (range / 4) * i;
        const y = chartHeight - ((value - min) / range) * chartHeight;
        return { value, y };
    });

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <g transform={`translate(${padding}, ${padding})`}>
                {/* Y-axis labels and grid lines */}
                {yLabels.map(({ value, y }, i) => (
                    <g key={i}>
                        <text x="-10" y={y + 5} textAnchor="end" className="text-xs fill-current text-gray-400">
                            {formatCompactNumber(value)}
                        </text>
                        <line x1="0" y1={y} x2={chartWidth} y2={y} className="stroke-current text-gray-700/50" strokeWidth="1" strokeDasharray="2,2" />
                    </g>
                ))}
                 {/* X-axis labels (start and end) */}
                 <text x="0" y={chartHeight + 20} textAnchor="start" className="text-xs fill-current text-gray-400">{formatDate(data[0].date)}</text>
                 <text x={chartWidth} y={chartHeight + 20} textAnchor="end" className="text-xs fill-current text-gray-400">{formatDate(data[data.length - 1].date)}</text>

                {/* Line */}
                <polyline fill="none" className={`stroke-current text-${color}-500`} strokeWidth="2" points={points} />
            </g>
        </svg>
    );
};

/**
 * A simple bar chart component using SVG.
 */
export const BarChart: FC<{ data: { name: string; value: number }[], width?: number, height?: number, color?: string }> = ({ data, width = 500, height = 250, color = 'cyan' }) => {
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
    
    const padding = { top: 20, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const max = Math.max(...data.map(d => d.value));
    const barWidth = chartWidth / data.length;
    
    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <g transform={`translate(${padding.left}, ${padding.top})`}>
                {data.map((d, i) => (
                    <g key={d.name}>
                        <rect
                            x={i * barWidth + barWidth * 0.1}
                            y={chartHeight - (d.value / max) * chartHeight}
                            width={barWidth * 0.8}
                            height={(d.value / max) * chartHeight}
                            className={`fill-current text-${color}-600 hover:text-${color}-500 transition-colors`}
                        />
                        <text
                            x={i * barWidth + barWidth / 2}
                            y={chartHeight + 15}
                            textAnchor="middle"
                            className="text-xs fill-current text-gray-400 transform -rotate-45"
                            transform={`rotate(-45, ${i * barWidth + barWidth / 2}, ${chartHeight + 15})`}
                        >
                            {d.name.length > 15 ? `${d.name.substring(0, 12)}...` : d.name}
                        </text>
                    </g>
                ))}
            </g>
        </svg>
    );
};


/**
 * Pill component for displaying tags or status.
 */
export const Pill: FC<{ text: string; color: 'green' | 'cyan' | 'gray' | 'yellow' | 'red' }> = ({ text, color }) => {
    const colorClasses = {
        green: 'bg-green-500/20 text-green-300',
        cyan: 'bg-cyan-500/20 text-cyan-300',
        gray: 'bg-gray-500/20 text-gray-300',
        yellow: 'bg-yellow-500/20 text-yellow-300',
        red: 'bg-red-500/20 text-red-300',
    };
    return (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${colorClasses[color]}`}>
            {text}
        </span>
    );
};

/**
 * A generic modal component.
 */
export const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className={`bg-gray-800 rounded-lg shadow-2xl w-full border border-gray-700 ${sizeClasses[size]}`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Enhanced AI Audience Builder Modal.
 */
export const AIAudienceBuilderModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreateSegment: (segmentData: Omit<AudienceSegment, 'id' | 'createdAt' | 'updatedAt' | 'size'>) => void;
}> = ({ isOpen, onClose, onCreateSegment }) => {
    const [prompt, setPrompt] = useState("High-value customers who haven't made a purchase in 3 months but have viewed the new product page.");
    const [generatedRules, setGeneratedRules] = useState<RuleGroup | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [segmentName, setSegmentName] = useState('');
    const [estimatedSize, setEstimatedSize] = useState<number | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedRules(null);
        setEstimatedSize(null);
        setSegmentName('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT, properties: {
                    segmentName: { type: Type.STRING },
                    rules: {
                        type: Type.OBJECT, properties: {
                            combinator: { type: Type.STRING, enum: ['AND', 'OR'] },
                            rules: {
                                type: Type.ARRAY, items: {
                                    type: Type.OBJECT, properties: {
                                        id: { type: Type.STRING },
                                        field: { type: Type.STRING },
                                        operator: { type: Type.STRING },
                                        value: { type: Type.ANY }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            const fullPrompt = `Translate the following natural language description into a structured set of rules for a customer data platform audience segment. Provide a suitable name for the segment. Description: "${prompt}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            const result = JSON.parse(response.text);
            const rulesWithIds = {
                id: 'root',
                combinator: result.rules.combinator,
                rules: result.rules.rules.map((r: any, i: number) => ({ ...r, id: `rule-${i}` }))
            };
            setGeneratedRules(rulesWithIds);
            setSegmentName(result.segmentName);
            const size = await cdpApiService.estimateAudienceSize(rulesWithIds);
            setEstimatedSize(size);

        } catch (error) {
            console.error("AI Generation Error:", error);
            // In a real app, show a user-facing error message
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCreate = () => {
        if (!generatedRules || !segmentName) return;
        const newSegmentData = {
            name: segmentName,
            description: `AI-generated segment for: "${prompt}"`,
            status: 'Draft' as const,
            createdBy: 'ai-builder@demobank.com',
            definition: generatedRules,
            tags: ['AI-Generated'],
            activationTargets: [],
        };
        onCreateSegment(newSegmentData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Audience Builder" size="xl">
            <div className="space-y-4">
                <p className="text-sm text-gray-400">Describe the customer segment you want to build in plain English. The AI will translate it into a structured ruleset.</p>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., 'Users from California who have spent more than $500 and visited the pricing page in the last 7 days'" className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500" />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isLoading ? 'Generating...' : 'Generate Rules'}</button>
                {(isLoading || generatedRules) && (
                    <Card title="Generated Segment">
                        <div className="space-y-4">
                            {isLoading ? (
                                <p className="text-sm text-gray-300">Generating rules and estimating audience size...</p>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center">
                                        <input
                                            type="text"
                                            value={segmentName}
                                            onChange={(e) => setSegmentName(e.target.value)}
                                            className="text-lg font-semibold bg-transparent text-white border-b border-gray-600 focus:outline-none focus:border-cyan-500"
                                        />
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-white">{estimatedSize?.toLocaleString() ?? '...'}</p>
                                            <p className="text-xs text-gray-400">Estimated Audience</p>
                                        </div>
                                    </div>
                                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded">{JSON.stringify(generatedRules, null, 2)}</pre>
                                    <button onClick={handleCreate} disabled={!generatedRules || !segmentName} className="w-full py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50">Create Segment</button>
                                </>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </Modal>
    );
};


/**
 * Main dashboard component, showing metrics and charts.
 */
export const MainDashboard: FC<{
    metrics: DashboardMetrics | null;
    onOpenBuilder: () => void;
}> = ({ metrics, onOpenBuilder }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank CDP</h2>
                <button onClick={onOpenBuilder} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Audience Builder</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">{metrics ? formatCompactNumber(metrics.unifiedProfiles) : '...'}</p>
                    <p className="text-sm text-gray-400 mt-1">Unified Profiles</p>
                </Card>
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">{metrics ? metrics.dataSources : '...'}</p>
                    <p className="text-sm text-gray-400 mt-1">Data Sources</p>
                </Card>
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">{metrics ? metrics.activeSegments : '...'}</p>
                    <p className="text-sm text-gray-400 mt-1">Active Segments</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Profile Growth (Last 30 Days)">
                    {metrics ? <LineChart data={metrics.profileGrowth} height={250} /> : <div className="h-[250px] flex items-center justify-center">Loading...</div>}
                </Card>
                <Card title="Active Segment Size Distribution">
                    {metrics ? <BarChart data={metrics.segmentSizeDistribution} height={250} /> : <div className="h-[250px] flex items-center justify-center">Loading...</div>}
                </Card>
            </div>
        </div>
    )
};


/**
 * Component for displaying and managing Audience Segments in a table.
 */
export const AudienceSegmentsTable: FC<{
    segments: AudienceSegment[];
    isLoading: boolean;
    onViewDetails: (segmentId: number) => void;
}> = ({ segments, isLoading, onViewDetails }) => {
    
    const getStatusPillColor = (status: AudienceSegment['status']): 'green' | 'cyan' | 'gray' | 'yellow' => {
        switch(status) {
            case 'Active': return 'green';
            case 'Building': return 'cyan';
            case 'Archived': return 'gray';
            case 'Draft': return 'yellow';
            default: return 'gray';
        }
    }

    return (
        <Card title="Audience Segments">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                     <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Size</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Created At</th>
                            <th className="px-6 py-3">Tags</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={6} className="text-center p-8">Loading segments...</td></tr>}
                        {!isLoading && segments.map(s => (
                            <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{s.name}</td>
                                <td className="px-6 py-4">{s.size.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <Pill text={s.status} color={getStatusPillColor(s.status)} />
                                </td>
                                <td className="px-6 py-4">{formatDate(s.createdAt)}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {s.tags.map(tag => <Pill key={tag} text={tag} color="gray" />)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => onViewDetails(s.id)} className="font-medium text-cyan-500 hover:underline">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}

/**
 * Detailed view for a single segment.
 */
export const SegmentDetailView: FC<{
    segmentId: number;
    onBack: () => void;
}> = ({ segmentId, onBack }) => {
    const [segment, setSegment] = useState<AudienceSegment | null>(null);
    const [analytics, setAnalytics] = useState<{ sizeHistory: AnalyticsDataPoint[] } | null>(null);
    const [status, setStatus] = useState<ApiStatus>('loading');

    useEffect(() => {
        const fetchSegmentData = async () => {
            setStatus('loading');
            try {
                const [segmentData, analyticsData] = await Promise.all([
                    cdpApiService.getSegmentById(segmentId),
                    cdpApiService.getSegmentAnalytics(segmentId, '30d')
                ]);
                if (segmentData) {
                    setSegment(segmentData);
                    setAnalytics(analyticsData);
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error("Failed to fetch segment details:", error);
                setStatus('error');
            }
        };
        fetchSegmentData();
    }, [segmentId]);

    if (status === 'loading') {
        return <div className="p-8 text-center">Loading segment details...</div>;
    }

    if (status === 'error' || !segment) {
        return <div className="p-8 text-center text-red-400">Failed to load segment. <button onClick={onBack} className="underline">Go back</button>.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300 mb-4">&larr; Back to all segments</button>
                <h2 className="text-3xl font-bold text-white">{segment.name}</h2>
                <p className="text-gray-400 mt-1">{segment.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-2xl font-bold text-white">{segment.size.toLocaleString()}</p><p className="text-sm text-gray-400 mt-1">Current Size</p></Card>
                <Card className="text-center"><p className="text-2xl font-bold text-white">{segment.status}</p><p className="text-sm text-gray-400 mt-1">Status</p></Card>
                <Card className="text-center"><p className="text-2xl font-bold text-white">{formatDate(segment.createdAt)}</p><p className="text-sm text-gray-400 mt-1">Created On</p></Card>
                <Card className="text-center"><p className="text-2xl font-bold text-white">{segment.activationTargets.length}</p><p className="text-sm text-gray-400 mt-1">Activations</p></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Size History (Last 30 Days)">
                        {analytics ? <LineChart data={analytics.sizeHistory} height={300} /> : "Loading analytics..."}
                    </Card>
                </div>
                <div className="space-y-6">
                     <Card title="Details">
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between">
                                <span className="text-gray-400">Created By:</span>
                                <span className="text-white font-mono">{segment.createdBy}</span>
                            </li>
                             <li className="flex justify-between">
                                <span className="text-gray-400">Last Updated:</span>
                                <span className="text-white">{formatDate(segment.updatedAt)}</span>
                            </li>
                        </ul>
                    </Card>
                     <Card title="Activation Targets">
                        {segment.activationTargets.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {segment.activationTargets.map(target => <li key={target} className="text-white">{target}</li>)}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No activation targets configured.</p>
                        )}
                    </Card>
                </div>
            </div>

            <Card title="Segment Definition">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded">{JSON.stringify(segment.definition, null, 2)}</pre>
            </Card>
        </div>
    );
};


// SECTION: MAIN COMPONENT

const DemoBankCDPView: React.FC = () => {
    const [currentView, setCurrentView] = useState<'dashboard' | 'segmentDetail'>('dashboard');
    const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);

    const [isBuilderOpen, setBuilderOpen] = useState(false);
    const [segments, setSegments] = useState<AudienceSegment[]>([]);
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
    const [isLoadingSegments, setIsLoadingSegments] = useState(true);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        setIsLoadingMetrics(true);
        try {
            const metrics = await cdpApiService.getDashboardMetrics();
            setDashboardMetrics(metrics);
        } catch (error) {
            console.error("Failed to fetch dashboard metrics:", error);
        } finally {
            setIsLoadingMetrics(false);
        }
    }, []);

    const fetchSegments = useCallback(async () => {
        setIsLoadingSegments(true);
        try {
            const { data } = await cdpApiService.getSegments();
            setSegments(data);
        } catch (error) {
            console.error("Failed to fetch segments:", error);
        } finally {
            setIsLoadingSegments(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
        fetchSegments();
    }, [fetchDashboardData, fetchSegments]);

    const handleViewSegmentDetails = (segmentId: number) => {
        setSelectedSegmentId(segmentId);
        setCurrentView('segmentDetail');
    };

    const handleBackToDashboard = () => {
        setSelectedSegmentId(null);
        setCurrentView('dashboard');
    };
    
    const handleCreateSegment = async (segmentData: Omit<AudienceSegment, 'id' | 'createdAt' | 'updatedAt' | 'size'>) => {
        try {
            await cdpApiService.createSegment(segmentData);
            // In a real app, you might show a success notification here.
            fetchSegments(); // Re-fetch segments to show the new one
            fetchDashboardData(); // Re-fetch metrics
        } catch (error) {
            console.error("Failed to create segment:", error);
            // Show an error notification
        }
    };

    const renderCurrentView = () => {
        switch (currentView) {
            case 'segmentDetail':
                return selectedSegmentId ? <SegmentDetailView segmentId={selectedSegmentId} onBack={handleBackToDashboard} /> : null;
            case 'dashboard':
            default:
                return (
                    <div className="space-y-6">
                        <MainDashboard metrics={dashboardMetrics} onOpenBuilder={() => setBuilderOpen(true)} />
                        <AudienceSegmentsTable segments={segments} isLoading={isLoadingSegments} onViewDetails={handleViewSegmentDetails} />
                    </div>
                );
        }
    };
    
    return (
        <>
            {renderCurrentView()}
            <AIAudienceBuilderModal
                isOpen={isBuilderOpen}
                onClose={() => setBuilderOpen(false)}
                onCreateSegment={handleCreateSegment}
            />
        </>
    );
};

export default DemoBankCDPView;