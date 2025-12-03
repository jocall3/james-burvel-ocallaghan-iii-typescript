// components/views/megadashboard/userclient/UserInsightsView.tsx
// This component has been architected as a comprehensive user insights dashboard.
// It features multiple complex charts using the Recharts library to visualize
// key business metrics like user growth, cohort engagement, churn, and satisfaction.
// The code is intentionally detailed to represent a production-quality analytics view.

import React, { useState, useEffect, useReducer, useMemo, useCallback } from 'react';
import Card from '../../../Card';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Funnel, FunnelChart, LabelList, Treemap } from 'recharts';

// ================================================================================================
// MOCK DATA FOR CHARTS (Original)
// ================================================================================================

const userGrowthData = [
    { name: 'Jan', users: 4000 }, { name: 'Feb', users: 4300 },
    { name: 'Mar', users: 5000 }, { name: 'Apr', users: 5800 },
    { name: 'May', users: 6500 }, { name: 'Jun', users: 7800 },
];

const engagementByCohortData = [
    { cohort: 'Jan \'24', w1: 85, w2: 72, w3: 65, w4: 60 },
    { cohort: 'Feb \'24', w1: 88, w2: 78, w3: 70, w4: 68 },
    { cohort: 'Mar \'24', w1: 92, w2: 85, w3: 80, w4: 78 },
    { cohort: 'Apr \'24', w1: 90, w2: 82, w3: 75, w4: 71 },
];

const churnPredictionData = [
    { month: 'Jul', actual: 2.1, predicted: 2.2 },
    { month: 'Aug', actual: 2.3, predicted: 2.3 },
    { month: 'Sep', actual: 2.2, predicted: 2.4 },
    { month: 'Oct', predicted: 2.5 },
    { month: 'Nov', predicted: 2.6 },
];

const userSatisfactionData = [
    { name: 'CSAT', value: 91, fill: '#10b981' },
    { name: 'NPS', value: 65, fill: '#06b6d4' },
    { name: 'CES', value: 85, fill: '#6366f1' },
];

// ================================================================================================
// AI INSIGHTS (STATIC MOCK) (Original)
// ================================================================================================

const aiInsights = [
    "The March '24 cohort shows significantly higher week-over-week retention. Investigate marketing campaigns from that period.",
    "Predicted churn is trending upwards for Q4. Proactive retention campaigns are recommended for at-risk user segments.",
    "User growth is accelerating, but the average Customer Effort Score (CES) has slightly decreased. Monitor support tickets for friction points."
];


// ================================================================================================
// NEW - ADVANCED TYPESCRIPT INTERFACES
// ================================================================================================

export type DateRange = '7d' | '30d' | '90d' | '12m' | 'all';
export type UserSegment = 'all' | 'new' | 'power' | 'at_risk' | 'churned';
export type Region = 'all' | 'NA' | 'EU' | 'APAC' | 'LATAM';

export interface DashboardFilters {
    dateRange: DateRange;
    userSegment: UserSegment;
    region: Region;
}

export interface UserDemographics {
    age: { '18-24': number; '25-34': number; '35-44': number; '45-54': number; '55+': number; };
    gender: { male: number; female: number; other: number; };
    location: { name: string; value: number }[];
}

export interface AcquisitionChannel {
    channel: string;
    visitors: number;
    signups: number;
    paid: number;
    cost: number;
}

export interface FeatureAdoption {
    feature: string;
    adoptionRate: number;
    avgTimeSpent: number; // in minutes
}

export interface UserFeedback {
    id: string;
    timestamp: string;
    user: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    comment: string;
    tags: string[];
}

export interface DetailedUser {
    id: string;
    name: string;
    email: string;
    region: Region;
    segment: UserSegment;
    signupDate: string;
    lastSeen: string;
    ltv: number;
    healthScore: number;
}

export interface LtvCacDataPoint {
    month: string;
    ltv: number;
    cac: number;
}

export interface SubscriptionTier {
    name: 'Free' | 'Pro' | 'Enterprise';
    count: number;
    mrr: number;
}

export interface ABTestResult {
    testName: string;
    variantA_conversions: number;
    variantA_users: number;
    variantB_conversions: number;
    variantB_users: number;
    significance: number;
    winner: 'A' | 'B' | null;
}

export interface FullDashboardData {
    kpis: {
        totalActiveUsers: number;
        mauPercentage: number;
        ltv: number;
        monthlyChurn: number;
        dau: number;
        wou: number;
        arppu: number;
        cac: number;
    };
    userGrowth: { name: string; users: number }[];
    engagementByCohort: { cohort: string; w1: number; w2: number; w3: number; w4: number }[];
    churnPrediction: { month: string; actual?: number; predicted: number }[];
    userSatisfaction: { name: string; value: number; fill: string }[];
    demographics: UserDemographics;
    acquisitionChannels: AcquisitionChannel[];
    featureAdoption: FeatureAdoption[];
    recentFeedback: UserFeedback[];
    detailedUsers: DetailedUser[];
    ltvCac: LtvCacDataPoint[];
    subscriptionTiers: SubscriptionTier[];
    abTests: ABTestResult[];
}

export interface DashboardState {
    loading: boolean;
    error: string | null;
    filters: DashboardFilters;
    data: FullDashboardData | null;
}

export type DashboardAction =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: FullDashboardData }
    | { type: 'FETCH_ERROR'; payload: string }
    | { type: 'SET_FILTERS'; payload: Partial<DashboardFilters> };

// ================================================================================================
// NEW - UTILITY & FORMATTING FUNCTIONS
// ================================================================================================

/**
 * Formats a number as currency.
 * @param value The number to format.
 * @returns A string representing the currency.
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

/**
 * Formats a number as a percentage.
 * @param value The number to format (e.g., 0.85 for 85%).
 * @param decimals The number of decimal places.
 * @returns A string representing the percentage.
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Generates a random integer within a given range.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns A random integer.
 */
export const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * A simple debounce function.
 * @param func The function to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns A debounced function.
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

// ================================================================================================
// NEW - MOCK DATA GENERATION
// ================================================================================================

const REGIONS: Region[] = ['NA', 'EU', 'APAC', 'LATAM'];
const SEGMENTS: UserSegment[] = ['new', 'power', 'at_risk', 'churned'];
const FIRST_NAMES = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah'];
const LAST_NAMES = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
const FEATURES = ['Dashboard', 'Reporting', 'Integrations', 'Team Management', 'API Access', 'Custom Fields'];

/**
 * Generates realistic-looking mock data for the entire dashboard.
 * @param filters The current dashboard filters to apply.
 * @returns A complete set of dashboard data.
 */
export const generateMockData = (filters: DashboardFilters): FullDashboardData => {
    // This function can be extremely complex to simulate real data filtering on the backend.
    const baseUserCount = 12500;
    const filterMultiplier = (filters.region === 'all' ? 1 : 0.4) * (filters.userSegment === 'all' ? 1 : 0.3);
    const userCount = Math.floor(baseUserCount * filterMultiplier);

    const generatedUserGrowth = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(2023, i, 1).toLocaleString('default', { month: 'short' });
        return { name: month, users: Math.floor(userCount * (0.6 + i * 0.04) * (1 + (Math.random() - 0.5) * 0.1)) };
    });

    const generatedDemographics: UserDemographics = {
        age: { '18-24': getRandomInt(15, 25), '25-34': getRandomInt(30, 40), '35-44': getRandomInt(20, 30), '45-54': getRandomInt(10, 15), '55+': getRandomInt(5, 10) },
        gender: { male: getRandomInt(45, 55), female: getRandomInt(40, 50), other: getRandomInt(1, 5) },
        location: [{ name: 'USA', value: 400 }, { name: 'Germany', value: 250 }, { name: 'UK', value: 200 }, { name: 'Japan', value: 150 }, { name: 'Brazil', value: 120 }, { name: 'India', value: 100 }]
    };

    const generatedAcquisitionChannels: AcquisitionChannel[] = [
        { channel: 'Organic Search', visitors: getRandomInt(18000, 22000), signups: getRandomInt(800, 1200), paid: getRandomInt(200, 300), cost: 0 },
        { channel: 'Paid Social', visitors: getRandomInt(12000, 15000), signups: getRandomInt(1000, 1400), paid: getRandomInt(300, 400), cost: 25000 },
        { channel: 'Referral', visitors: getRandomInt(8000, 10000), signups: getRandomInt(1200, 1600), paid: getRandomInt(400, 500), cost: 5000 },
        { channel: 'Direct', visitors: getRandomInt(5000, 7000), signups: getRandomInt(400, 600), paid: getRandomInt(150, 250), cost: 0 },
        { channel: 'Email Marketing', visitors: getRandomInt(20000, 25000), signups: getRandomInt(600, 900), paid: getRandomInt(250, 350), cost: 8000 },
    ];
    
    const generatedFeatureAdoption: FeatureAdoption[] = FEATURES.map(f => ({
        feature: f,
        adoptionRate: getRandomInt(20, 95),
        avgTimeSpent: getRandomInt(5, 60)
    }));
    
    const generatedRecentFeedback: UserFeedback[] = Array.from({ length: 20 }, (_, i) => {
        const sentimentVal = Math.random();
        return {
            id: `feedback-${i}`,
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            user: `${FIRST_NAMES[getRandomInt(0, 7)]} ${LAST_NAMES[getRandomInt(0, 7)][0]}.`,
            sentiment: sentimentVal > 0.7 ? 'positive' : sentimentVal < 0.3 ? 'negative' : 'neutral',
            comment: `This is a sample user comment number ${i + 1}. The new feature is ${sentimentVal > 0.5 ? 'great' : 'a bit confusing'}.`,
            tags: ['ui', 'performance']
        };
    });

    const generatedDetailedUsers: DetailedUser[] = Array.from({ length: 100 }, (_, i) => ({
        id: `user-${1000 + i}`,
        name: `${FIRST_NAMES[getRandomInt(0, 7)]} ${LAST_NAMES[getRandomInt(0, 7)]}`,
        email: `user${i}@example.com`,
        region: REGIONS[getRandomInt(0, 3)],
        segment: SEGMENTS[getRandomInt(0, 3)],
        signupDate: new Date(Date.now() - getRandomInt(30, 365) * 86400000).toISOString().split('T')[0],
        lastSeen: new Date(Date.now() - getRandomInt(1, 45) * 86400000).toISOString().split('T')[0],
        ltv: getRandomInt(50, 1500),
        healthScore: getRandomInt(20, 100),
    }));

    const generatedLtvCac: LtvCacDataPoint[] = Array.from({length: 12}, (_, i) => {
        const month = new Date(2023, i, 1).toLocaleString('default', { month: 'short' });
        return {
            month,
            ltv: getRandomInt(100 + i*5, 120 + i*8),
            cac: getRandomInt(70 - i*2, 80 - i*2.5)
        }
    });

    const generatedSubscriptionTiers: SubscriptionTier[] = [
        { name: 'Free', count: Math.floor(userCount * 0.6), mrr: 0 },
        { name: 'Pro', count: Math.floor(userCount * 0.3), mrr: Math.floor(userCount * 0.3) * 25 },
        { name: 'Enterprise', count: Math.floor(userCount * 0.1), mrr: Math.floor(userCount * 0.1) * 150 }
    ];

    const generatedABTests: ABTestResult[] = [
        { testName: 'New Onboarding Flow', variantA_conversions: 450, variantA_users: 1000, variantB_conversions: 520, variantB_users: 1000, significance: 98.5, winner: 'B'},
        { testName: 'Homepage CTA Button Color', variantA_conversions: 1203, variantA_users: 10000, variantB_conversions: 1215, variantB_users: 10000, significance: 60.1, winner: null },
        { testName: 'Pricing Page Layout', variantA_conversions: 88, variantA_users: 500, variantB_conversions: 121, variantB_users: 500, significance: 99.8, winner: 'B' },
    ];
    
    return {
        kpis: {
            totalActiveUsers: userCount,
            mauPercentage: 85,
            ltv: 125,
            monthlyChurn: 2.2,
            dau: Math.floor(userCount * 0.35),
            wou: Math.floor(userCount * 0.60),
            arppu: 42,
            cac: 78,
        },
        userGrowth: generatedUserGrowth,
        engagementByCohort,
        churnPrediction,
        userSatisfaction,
        demographics: generatedDemographics,
        acquisitionChannels: generatedAcquisitionChannels,
        featureAdoption: generatedFeatureAdoption,
        recentFeedback: generatedRecentFeedback,
        detailedUsers: generatedDetailedUsers,
        ltvCac: generatedLtvCac,
        subscriptionTiers: generatedSubscriptionTiers,
        abTests: generatedABTests,
    };
};

// ================================================================================================
// NEW - SIMULATED API CLIENT
// ================================================================================================

/**
 * A mock API client to simulate network requests.
 */
export class ApiClient {
    /**
     * Fetches the complete dashboard data.
     * @param filters The filters to apply to the data query.
     * @returns A promise that resolves with the full dashboard data.
     */
    static fetchUserInsightsData(filters: DashboardFilters): Promise<FullDashboardData> {
        console.log('Fetching data with filters:', filters);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.05) { // 5% chance of API failure
                    reject(new Error('Failed to fetch user insights. A transient network error occurred.'));
                } else {
                    resolve(generateMockData(filters));
                }
            }, getRandomInt(500, 1500)); // Simulate network latency
        });
    }
}

// ================================================================================================
// NEW - STATE MANAGEMENT (useReducer)
// ================================================================================================

export const initialState: DashboardState = {
    loading: true,
    error: null,
    filters: {
        dateRange: '30d',
        userSegment: 'all',
        region: 'all',
    },
    data: null,
};

/**
 * Reducer function for managing the dashboard's state.
 * @param state The current state.
 * @param action The dispatched action.
 * @returns The new state.
 */
export function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, data: action.payload };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
        case 'SET_FILTERS':
            return { ...state, filters: { ...state.filters, ...action.payload } };
        default:
            return state;
    }
}

// ================================================================================================
// NEW - CUSTOM SUB-COMPONENTS
// ================================================================================================

export interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

/**
 * A custom tooltip component for Recharts to match the dashboard's theme.
 */
export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-gray-800 bg-opacity-90 border border-gray-600 rounded-lg shadow-lg">
                <p className="label text-gray-300 font-bold">{`${label}`}</p>
                {payload.map((p, index) => (
                    <p key={index} style={{ color: p.color }} className="intro">
                        {`${p.name}: ${p.value.toLocaleString()}${p.unit || ''}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

/**
 * A component to display filter controls for the dashboard.
 */
export const FilterBar: React.FC<{ filters: DashboardFilters; onFilterChange: (filters: Partial<DashboardFilters>) => void; disabled: boolean }> = ({ filters, onFilterChange, disabled }) => {
    const commonSelectClasses = "bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-colors disabled:opacity-50";

    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="dateRange" className="block mb-2 text-sm font-medium text-gray-300">Date Range</label>
                    <select id="dateRange" value={filters.dateRange} onChange={e => onFilterChange({ dateRange: e.target.value as DateRange })} className={commonSelectClasses} disabled={disabled}>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="12m">Last 12 Months</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="userSegment" className="block mb-2 text-sm font-medium text-gray-300">User Segment</label>
                    <select id="userSegment" value={filters.userSegment} onChange={e => onFilterChange({ userSegment: e.target.value as UserSegment })} className={commonSelectClasses} disabled={disabled}>
                        <option value="all">All Segments</option>
                        <option value="new">New Users</option>
                        <option value="power">Power Users</option>
                        <option value="at_risk">At Risk</option>
                        <option value="churned">Churned</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="region" className="block mb-2 text-sm font-medium text-gray-300">Region</label>
                    <select id="region" value={filters.region} onChange={e => onFilterChange({ region: e.target.value as Region })} className={commonSelectClasses} disabled={disabled}>
                        <option value="all">All Regions</option>
                        <option value="NA">North America</option>
                        <option value="EU">Europe</option>
                        <option value="APAC">Asia-Pacific</option>
                        <option value="LATAM">Latin America</option>
                    </select>
                </div>
            </div>
        </Card>
    );
};

const PIE_CHART_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f97316', '#8b5cf6'];

/**
 * A component for rendering user demographics charts.
 */
export const DemographicsCharts: React.FC<{ data: UserDemographics }> = ({ data }) => {
    const ageData = Object.entries(data.age).map(([name, value]) => ({ name, value }));
    const genderData = Object.entries(data.gender).map(([name, value]) => ({ name, value }));
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Age Distribution" className="md:col-span-1">
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={ageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {ageData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
            <Card title="Gender Distribution" className="md:col-span-1">
                 <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5}>
                             {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
             <Card title="Top Locations" className="md:col-span-1">
                 <ResponsiveContainer width="100%" height={250}>
                    <Treemap
                        data={data.location}
                        dataKey="value"
                        ratio={4 / 3}
                        stroke="#fff"
                        fill="#8884d8"
                        content={<CustomizedTreeMapContent colors={PIE_CHART_COLORS} />}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export const CustomizedTreeMapContent: React.FC<any> = ({ root, depth, x, y, width, height, index, colors, name }) => {
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: depth === 1 ? colors[index % colors.length] : 'none',
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {depth === 1 && width > 50 && height > 25 ? (
                <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
                    {name}
                </text>
            ) : null}
        </g>
    );
};

/**
 * A funnel chart to visualize user acquisition channels.
 */
export const AcquisitionFunnelChart: React.FC<{ data: AcquisitionChannel[] }> = ({ data }) => {
    const funnelData = [
        { value: data.reduce((sum, item) => sum + item.visitors, 0), name: 'Visitors', fill: '#6366f1' },
        { value: data.reduce((sum, item) => sum + item.signups, 0), name: 'Signups', fill: '#3b82f6' },
        { value: data.reduce((sum, item) => sum + item.paid, 0), name: 'Paid Users', fill: '#10b981' },
    ];

    return (
        <Card title="Acquisition Funnel">
            <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                        <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                        <LabelList position="center" fill="#000" stroke="none" dataKey="value" formatter={(value: number) => value.toLocaleString()} />
                    </Funnel>
                </FunnelChart>
            </ResponsiveContainer>
        </Card>
    );
};

/**
 * A bar chart to show performance of different acquisition channels.
 */
export const AcquisitionChannelPerformance: React.FC<{ data: AcquisitionChannel[] }> = ({ data }) => {
    const processedData = data.map(item => ({
        ...item,
        cpa: item.cost > 0 && item.paid > 0 ? item.cost / item.paid : 0,
        signupRate: item.visitors > 0 ? item.signups / item.visitors : 0
    }));

    return (
        <Card title="Channel Performance (CPA & Signup Rate)">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis type="category" dataKey="channel" stroke="#9ca3af" width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="cpa" fill="#ef4444" name="Cost Per Acquisition ($)" />
                    <Bar dataKey="signupRate" fill="#06b6d4" name="Signup Rate (%)" formatter={(value: number) => value.toFixed(2)} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    )
}

/**
 * A component to visualize feature adoption rates.
 */
export const FeatureAdoptionChart: React.FC<{ data: FeatureAdoption[] }> = ({ data }) => {
    return (
        <Card title="Feature Adoption & Engagement">
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis type="number" stroke="#9ca3af" unit="%" domain={[0, 100]} />
                    <YAxis dataKey="feature" type="category" stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="adoptionRate" name="Adoption Rate" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};


/**
 * A component displaying a real-time feed of user feedback.
 */
export const UserFeedbackStream: React.FC<{ feedback: UserFeedback[] }> = ({ feedback }) => {
    const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
        if (sentiment === 'positive') return 'border-green-500';
        if (sentiment === 'negative') return 'border-red-500';
        return 'border-gray-500';
    };

    return (
        <Card title="Live User Feedback Stream" className="lg:col-span-2">
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {feedback.map(item => (
                    <div key={item.id} className={`p-3 border-l-4 ${getSentimentColor(item.sentiment)} bg-gray-800 rounded-r-md`}>
                        <p className="text-sm text-gray-300">"{item.comment}"</p>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs font-semibold text-indigo-400">{item.user}</span>
                            <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

/**
 * Renders A/B test results.
 */
export const ABTestResults: React.FC<{ data: ABTestResult[] }> = ({ data }) => {
    const getWinnerClass = (winner: 'A' | 'B' | null) => {
        if (winner === 'A') return 'bg-blue-500 text-white';
        if (winner === 'B') return 'bg-green-500 text-white';
        return 'bg-gray-500 text-white';
    };

    const calculateConversionRate = (conversions: number, users: number) => {
        if (users === 0) return '0.00%';
        return ((conversions / users) * 100).toFixed(2) + '%';
    };

    return (
         <Card title="A/B Test Results" className="lg:col-span-3">
             <div className="space-y-4">
                 {data.map((test, index) => (
                     <div key={index} className="p-3 bg-gray-800 rounded-lg">
                         <div className="flex justify-between items-center">
                             <h4 className="font-bold text-white">{test.testName}</h4>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getWinnerClass(test.winner)}`}>
                                    {test.winner ? `Winner: Variant ${test.winner}` : 'Inconclusive'}
                                </span>
                                <span className={`text-xs font-mono px-2 py-1 rounded ${test.significance >= 95 ? 'bg-green-600' : 'bg-yellow-600'}`}>
                                    {test.significance}% sig.
                                </span>
                              </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4 mt-3 text-center">
                             <div>
                                 <p className="text-gray-400 text-sm">Variant A</p>
                                 <p className="text-lg font-semibold text-white">{calculateConversionRate(test.variantA_conversions, test.variantA_users)}</p>
                                 <p className="text-xs text-gray-500">{test.variantA_conversions.toLocaleString()} / {test.variantA_users.toLocaleString()}</p>
                             </div>
                             <div>
                                 <p className="text-gray-400 text-sm">Variant B</p>
                                 <p className="text-lg font-semibold text-white">{calculateConversionRate(test.variantB_conversions, test.variantB_users)}</p>
                                 <p className="text-xs text-gray-500">{test.variantB_conversions.toLocaleString()} / {test.variantB_users.toLocaleString()}</p>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
        </Card>
    );
};

// ================================================================================================
// MAIN VIEW COMPONENT (REFACTORED & EXPANDED)
// ================================================================================================

const UserInsightsView: React.FC = () => {
    const [state, dispatch] = useReducer(dashboardReducer, initialState);

    const fetchData = useCallback((filters: DashboardFilters) => {
        dispatch({ type: 'FETCH_START' });
        ApiClient.fetchUserInsightsData(filters)
            .then(data => {
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            })
            .catch(error => {
                dispatch({ type: 'FETCH_ERROR', payload: error.message });
            });
    }, []);

    useEffect(() => {
        fetchData(state.filters);
    }, [state.filters, fetchData]);

    const handleFilterChange = useCallback((newFilters: Partial<DashboardFilters>) => {
        dispatch({ type: 'SET_FILTERS', payload: newFilters });
    }, []);
    
    // Using useMemo to prevent re-rendering of expensive components if data hasn't changed
    const memoizedCharts = useMemo(() => {
        if (!state.data) return null;
        return (
            <>
                {/* Enhanced KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    <Card className="text-center"><p className="text-2xl font-bold text-white">{state.data.kpis.totalActiveUsers.toLocaleString()}</p><p className="text-xs text-gray-400 mt-1">Total Active Users</p></Card>
                    <Card className="text-center"><p className="text-2xl font-bold text-white">{state.data.kpis.dau.toLocaleString()}</p><p className="text-xs text-gray-400 mt-1">Daily Active</p></Card>
                    <Card className="text-center"><p className="text-2xl font-bold text-white">{state.data.kpis.wou.toLocaleString()}</p><p className="text-xs text-gray-400 mt-1">Weekly Active</p></Card>
                    <Card className="text-center"><p className="text-2xl font-bold text-white">{state.data.kpis.mauPercentage}%</p><p className="text-xs text-gray-400 mt-1">Monthly Active</p></Card>
                    <Card className="text-center"><p className="text-2xl font-bold text-white">{formatCurrency(state.data.kpis.ltv)}</p><p className="text-xs text-gray-400 mt-1">Lifetime Value</p></Card>
                    <Card className="text-center"><p className="text-2xl font-bold text-white">{formatCurrency(state.data.kpis.arppu)}</p><p className="text-xs text-gray-400 mt-1">ARPPU</p></Card>
                    <Card className="text-center"><p className="text-2xl font-bold text-white">{formatCurrency(state.data.kpis.cac)}</p><p className="text-xs text-gray-400 mt-1">Acquisition Cost</p></Card>
                    <Card className="text-center"><p className="text-2xl font-bold text-red-400">{state.data.kpis.monthlyChurn}%</p><p className="text-xs text-gray-400 mt-1">Monthly Churn</p></Card>
                </div>
                
                 {/* Main Charts (Originals) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="User Growth">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={state.data.userGrowth}>
                                <defs><linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs>
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="users" stroke="#8884d8" fill="url(#colorUsers)" name="Active Users" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card title="Engagement by Cohort (Weekly Retention %)">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={state.data.engagementByCohort}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                <XAxis dataKey="cohort" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" unit="%" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="w1" fill="#06b6d4" name="Week 1" />
                                <Bar dataKey="w2" fill="#3b82f6" name="Week 2" />
                                <Bar dataKey="w3" fill="#6366f1" name="Week 3" />
                                <Bar dataKey="w4" fill="#8b5cf6" name="Week 4" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
                
                 {/* New - Demographics Section */}
                <DemographicsCharts data={state.data.demographics} />
                
                {/* New - Acquisition Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AcquisitionFunnelChart data={state.data.acquisitionChannels} />
                    <AcquisitionChannelPerformance data={state.data.acquisitionChannels} />
                </div>
                
                {/* Churn & Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <Card title="AI-Generated Key Insights" className="lg:col-span-2">
                        <ul className="space-y-4 list-disc list-inside text-gray-300">
                           {aiInsights.map((insight, index) => <li key={index}>{insight}</li>)}
                        </ul>
                   </Card>
                   <Card title="Churn Prediction (%)" className="lg:col-span-3">
                        <ResponsiveContainer width="100%" height={300}>
                           <LineChart data={state.data.churnPrediction}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                               <XAxis dataKey="month" stroke="#9ca3af" />
                               <YAxis stroke="#9ca3af" domain={[2, 3]} unit="%" />
                               <Tooltip content={<CustomTooltip />} />
                               <Legend />
                               <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual Churn" strokeWidth={2} />
                               <Line type="monotone" dataKey="predicted" stroke="#ef4444" name="AI Predicted Churn" strokeWidth={2} strokeDasharray="5 5" />
                           </LineChart>
                       </ResponsiveContainer>
                   </Card>
                </div>
                
                {/* New - Feature Adoption and LTV/CAC */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FeatureAdoptionChart data={state.data.featureAdoption} />
                    <Card title="LTV vs CAC Analysis">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={state.data.ltvCac}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                <XAxis dataKey="month" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" unit="$" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="ltv" name="Lifetime Value (LTV)" stroke="#10b981" strokeWidth={2} />
                                <Line type="monotone" dataKey="cac" name="Customer Acquisition Cost (CAC)" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
                
                {/* Satisfaction and Feedback */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="User Satisfaction Scores">
                         <ResponsiveContainer width="100%" height={300}>
                             <RadialBarChart 
                                innerRadius="20%" 
                                outerRadius="80%" 
                                data={userSatisfactionData} 
                                startAngle={180} 
                                endAngle={0}
                            >
                                <RadialBar 
                                    minAngle={15} 
                                    background 
                                    clockwise
                                    dataKey="value" 
                                />
                                <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" align="center" />
                                <Tooltip content={<CustomTooltip />} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </Card>
                    <UserFeedbackStream feedback={state.data.recentFeedback} />
                </div>

                {/* A/B Testing & Subscription Tiers */}
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <ABTestResults data={state.data.abTests} />
                    <Card title="Subscription Tiers" className="lg:col-span-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie 
                                    data={state.data.subscriptionTiers} 
                                    dataKey="count" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={100} 
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {state.data.subscriptionTiers.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value, name, props) => [`${(value as number).toLocaleString()} users`, name]} content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            </>
        );
    }, [state.data]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-white tracking-wider">User & Client Insights</h2>
                {/* Add Export buttons or other actions here */}
                <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50" disabled={state.loading}>Export CSV</button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50" disabled={state.loading}>Generate Report</button>
                </div>
            </div>

            <FilterBar filters={state.filters} onFilterChange={handleFilterChange} disabled={state.loading} />

            {state.loading && (
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            )}
            
            {state.error && (
                <Card className="bg-red-900 border-red-700">
                    <h3 className="text-lg font-bold text-red-200">An Error Occurred</h3>
                    <p className="text-red-300 mt-2">{state.error}</p>
                    <button onClick={() => fetchData(state.filters)} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold">
                        Retry
                    </button>
                </Card>
            )}

            {!state.loading && !state.error && state.data && memoizedCharts}
        </div>
    );
};

export default UserInsightsView;
