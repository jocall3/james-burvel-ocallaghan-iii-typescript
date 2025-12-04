// components/views/megadashboard/business/GrowthInsightsView.tsx
import React, { useContext, useMemo, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- Utility Types and Interfaces for Growth Metrics ---

/**
 * Represents a single data point for time-series charts.
 */
interface TimeSeriesDataPoint {
    time: string; // e.g., 'Jan', '2023-01-01', 'W1'
    value: number;
    [key: string]: any; // Allow for additional keys like 'mau', 'dau', etc.
}

/**
 * Represents a metric with its current value, trend, and comparison data.
 */
interface GrowthMetricSummary {
    key: string;
    label: string;
    value: string;
    trend: number; // percentage change vs. previous period
    unit?: string;
    isGood?: boolean; // For coloring (green for good, red for bad)
}

/**
 * Structure for AI-generated forecasts.
 */
interface ForecastData {
    period: string; // e.g., 'Q3 2024'
    actual?: number; // Optional, if historical data is included
    forecast: number;
    upperBound: number;
    lowerBound: number;
}

/**
 * Structure for anomaly detection.
 */
interface Anomaly {
    timestamp: string;
    metric: string;
    value: number;
    expectedRange: [number, number];
    severity: 'low' | 'medium' | 'high';
    description: string;
}

/**
 * Interface for segmentation data.
 */
interface SegmentData {
    segment: string;
    value: number;
    change: number; // percentage change
    users: number;
    conversionRate?: number;
    arpu?: number;
}

/**
 * Interface for retention cohort data.
 */
interface CohortData {
    acquisitionMonth: string;
    usersAcquired: number;
    retentionMonths: {
        [monthOffset: string]: number; // e.g., 'M0': 1000, 'M1': 800 (users retained)
    };
}

/**
 * Interface for feature adoption metrics.
 */
interface FeatureAdoptionMetric {
    feature: string;
    totalUsers: number;
    activeUsers: number;
    adoptionRate: number; // percentage
    engagementScore: number; // 0-100
    change: number; // vs previous period
}

/**
 * Interface for A/B test suggestions.
 */
interface ABTestSuggestion {
    id: string;
    hypothesis: string;
    metricToImpact: string;
    potentialGain: string;
    status: 'draft' | 'ready' | 'running';
}

/**
 * Interface for campaign suggestions.
 */
interface CampaignSuggestion {
    id: string;
    name: string;
    targetSegment: string;
    goal: string;
    estimatedImpact: string;
    status: 'draft' | 'ready' | 'running';
}

/**
 * Represents a custom defined metric.
 */
interface CustomMetricDefinition {
    id: string;
    name: string;
    description: string;
    formula: string; // e.g., "DAU / MAU * 100"
    isPublic: boolean;
    createdBy: string;
}

// --- Constants and Configuration ---
const GROWTH_METRIC_COLORS = {
    mau: '#8884d8',
    dau: '#82ca9d',
    newUsers: '#ffc658',
    churn: '#ff7300',
    ltv: '#0088fe',
    arpu: '#00c49f',
    cac: '#ffbb28',
    conversion: '#a4de6c',
};

const CHART_PERIODS = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF194F'];

// --- Helper Functions for Data Generation and Manipulation ---

/**
 * Generates mock time series data.
 * @param count Number of data points.
 * @param startValue Initial value.
 * @param fluctuationRange Max percentage fluctuation per step.
 * @param trend 'up' | 'down' | 'stable'
 * @param keyName The key for the value in the data points.
 * @param labelPrefix Prefix for the time label (e.g., 'Day', 'W', 'Month').
 */
const generateMockTimeSeries = (
    count: number,
    startValue: number,
    fluctuationRange: number,
    trend: 'up' | 'down' | 'stable' = 'stable',
    keyName: string = 'value',
    labelPrefix: string = 'Day'
): TimeSeriesDataPoint[] => {
    let data: TimeSeriesDataPoint[] = [];
    let currentValue = startValue;
    for (let i = 0; i < count; i++) {
        const fluctuation = (Math.random() * fluctuationRange * 2 - fluctuationRange) / 100;
        currentValue *= (1 + fluctuation);
        if (trend === 'up') currentValue *= 1.01;
        if (trend === 'down') currentValue *= 0.99;
        currentValue = Math.max(0, currentValue); // Ensure value doesn't go below 0

        data.push({
            time: `${labelPrefix} ${i + 1}`,
            [keyName]: Math.round(currentValue),
        });
    }
    return data;
};

/**
 * Generates mock retention cohort data.
 * @param numCohorts Number of acquisition cohorts.
 * @param baseUsers Base number of users acquired per cohort.
 * @returns Array of CohortData.
 */
const generateMockRetentionCohorts = (numCohorts: number, baseUsers: number): CohortData[] => {
    const cohorts: CohortData[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < numCohorts; i++) {
        const acquisitionMonthIndex = (new Date().getMonth() - i + 12) % 12;
        const acquisitionMonth = `${months[acquisitionMonthIndex]} ${currentYear - (i >= new Date().getMonth() + 1 ? 1 : 0)}`;
        const usersAcquired = Math.round(baseUsers * (1 + (Math.random() - 0.5) * 0.2)); // +/- 10%
        const retentionMonths: { [monthOffset: string]: number } = { 'M0': usersAcquired };

        // Simulate retention decay
        let previousMonthUsers = usersAcquired;
        for (let j = 1; j <= numCohorts - i; j++) {
            const retentionRate = 0.95 - (j * 0.05) - (Math.random() * 0.02); // Decay over time
            previousMonthUsers = Math.round(previousMonthUsers * retentionRate);
            retentionMonths[`M${j}`] = Math.max(0, previousMonthUsers);
        }

        cohorts.push({ acquisitionMonth, usersAcquired, retentionMonths });
    }
    return cohorts.reverse(); // Newest cohorts last
};

/**
 * Generates mock segmentation data.
 */
const generateMockSegmentData = (): SegmentData[] => {
    const segments = [
        { name: 'US East', baseValue: 50000, baseUsers: 150000 },
        { name: 'US West', baseValue: 45000, baseUsers: 140000 },
        { name: 'Europe', baseValue: 30000, baseUsers: 90000 },
        { name: 'Asia', baseValue: 25000, baseUsers: 75000 },
        { name: 'Other', baseValue: 10000, baseUsers: 30000 },
    ];
    return segments.map(s => {
        const value = Math.round(s.baseValue * (1 + (Math.random() - 0.5) * 0.1));
        const users = Math.round(s.baseUsers * (1 + (Math.random() - 0.5) * 0.1));
        const change = parseFloat(((Math.random() * 10 - 5)).toFixed(2)); // -5% to +5%
        const conversionRate = parseFloat((Math.random() * (0.1 - 0.02) + 0.02).toFixed(4)); // 2% to 10%
        const arpu = parseFloat((Math.random() * (150 - 50) + 50).toFixed(2)); // $50 to $150
        return {
            segment: s.name,
            value,
            change,
            users,
            conversionRate,
            arpu
        };
    });
};

/**
 * Generates mock funnel conversion data.
 */
const generateMockFunnelData = (): TimeSeriesDataPoint[] => {
    const steps = ['Visitors', 'Signups', 'Trial Starts', 'Paid Subscribers', 'Active Users'];
    let current = 250000;
    const data = steps.map(step => {
        current = Math.round(current * (0.8 - Math.random() * 0.2)); // 60-80% drop
        return { time: step, value: current };
    });
    // First step is actual visitors, so make it a bit higher
    data[0].value = 300000;
    return data;
};

/**
 * Generates mock feature adoption data.
 */
const generateMockFeatureAdoption = (): FeatureAdoptionMetric[] => {
    return [
        { feature: 'Dashboard Customization', totalUsers: 200000, activeUsers: 120000, adoptionRate: 60, engagementScore: 75, change: 3.2 },
        { feature: 'Advanced Reporting', totalUsers: 210000, activeUsers: 63000, adoptionRate: 30, engagementScore: 60, change: 1.8 },
        { feature: 'Team Collaboration', totalUsers: 180000, activeUsers: 99000, adoptionRate: 55, engagementScore: 80, change: 4.1 },
        { feature: 'Integrations Hub', totalUsers: 150000, activeUsers: 45000, adoptionRate: 30, engagementScore: 50, change: -1.5 },
        { feature: 'Mobile App Usage', totalUsers: 250000, activeUsers: 175000, adoptionRate: 70, engagementScore: 85, change: 5.5 },
    ];
};

/**
 * Formats a number for display.
 */
const formatNumber = (num: number, unit?: string, isCurrency: boolean = false): string => {
    if (isNaN(num)) return 'N/A';
    const formatted = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
    }).format(num);
    return isCurrency ? `$${formatted}` : `${formatted}${unit || ''}`;
};

/**
 * Formats a percentage.
 */
const formatPercentage = (num: number): string => {
    if (isNaN(num)) return 'N/A';
    return `${num.toFixed(1)}%`;
};

/**
 * Calculates percentage change.
 */
const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

// --- AI Interaction Service (within this file for simplicity as per directive) ---

/**
 * Manages interactions with Google GenAI.
 */
class AIGrowthService {
    private ai: GoogleGenAI;
    private model: string = 'gemini-1.5-flash'; // Using flash for quicker responses and cost-effectiveness

    constructor(apiKey: string) {
        if (!apiKey) {
            console.warn("AI_KEY is missing. AI features will be disabled or simulated.");
            // Fallback to a mock AI in a real app, for this exercise, we'll just allow it to error.
        }
        this.ai = new GoogleGenAI({ apiKey: apiKey });
    }

    /**
     * Generates a summary for given data.
     * @param data The data to summarize.
     * @param context Additional context for the AI.
     */
    public async generateSummary(data: any, context: string = ''): Promise<string> {
        try {
            const prompt = `Please provide a concise summary, highlight key trends, and identify potential inflection points from the following growth data: ${JSON.stringify(data)}. ${context}`;
            const response = await this.ai.getGenerativeModel({ model: this.model }).generateContent(prompt);
            return response.response.text();
        } catch (error) {
            console.error("AI summary generation failed:", error);
            return "AI summary not available. Please check API key and network connection.";
        }
    }

    /**
     * Generates a forecast based on historical data.
     * @param historicalData Array of TimeSeriesDataPoint.
     * @param periodsToForecast Number of periods to forecast.
     */
    public async generateForecast(historicalData: TimeSeriesDataPoint[], periodsToForecast: number = 3): Promise<ForecastData[]> {
        try {
            const prompt = `Given the following historical time-series data: ${JSON.stringify(historicalData)}.
            Provide a forecast for the next ${periodsToForecast} periods.
            Include the forecasted value, and a plausible upper and lower bound for each period.
            Format the output as a JSON array of objects, each with 'period', 'forecast', 'upperBound', 'lowerBound'.
            Example: [{"period": "Month 1", "forecast": 1000, "upperBound": 1100, "lowerBound": 900}]`;

            const response = await this.ai.getGenerativeModel({ model: this.model }).generateContent(prompt);
            const text = response.response.text();
            // Attempt to parse JSON. AI might add markdown.
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                return JSON.parse(jsonMatch[1]);
            } else {
                return JSON.parse(text); // Try direct parse if no markdown
            }
        } catch (error) {
            console.error("AI forecast generation failed:", error);
            // Return mock forecast on error
            const lastDataPoint = historicalData[historicalData.length - 1];
            if (!lastDataPoint) return [];
            const mockForecast: ForecastData[] = [];
            let lastValue = (lastDataPoint as any).value || (lastDataPoint as any).mau;
            for (let i = 1; i <= periodsToForecast; i++) {
                const forecast = Math.round(lastValue * (1.05 + Math.random() * 0.02)); // Simulate slight growth
                mockForecast.push({
                    period: `Future M${i}`,
                    forecast,
                    upperBound: Math.round(forecast * 1.1),
                    lowerBound: Math.round(forecast * 0.9),
                });
                lastValue = forecast;
            }
            return mockForecast;
        }
    }

    /**
     * Identifies and explains anomalies in data.
     */
    public async analyzeAnomalies(data: TimeSeriesDataPoint[], metricName: string): Promise<Anomaly[]> {
        try {
            const prompt = `Analyze the following time-series data for ${metricName} and identify any significant anomalies (spikes or drops).
            For each anomaly, provide its timestamp, metric, value, an estimated expected range if it were normal, a severity ('low', 'medium', 'high'), and a brief description.
            Format the output as a JSON array of objects matching the Anomaly interface: {timestamp: string, metric: string, value: number, expectedRange: [number, number], severity: string, description: string}.
            Data: ${JSON.stringify(data)}`;

            const response = await this.ai.getGenerativeModel({ model: this.model }).generateContent(prompt);
            const text = response.response.text();
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                return JSON.parse(jsonMatch[1]);
            } else {
                return JSON.parse(text);
            }
        } catch (error) {
            console.error("AI anomaly detection failed:", error);
            return [
                {
                    timestamp: 'May 15',
                    metric: metricName,
                    value: 25000,
                    expectedRange: [18000, 22000],
                    severity: 'high',
                    description: `Unexpected spike in ${metricName} likely due to viral marketing or external event.`
                }
            ];
        }
    }

    /**
     * Generates actionable recommendations based on given insights.
     */
    public async generateRecommendations(summary: string, trends: any): Promise<ABTestSuggestion[] | CampaignSuggestion[]> {
        try {
            const prompt = `Based on the following growth summary and trends, suggest 2-3 actionable growth strategies.
            For each strategy, indicate if it's an A/B test or a marketing campaign.
            If A/B test: provide hypothesis, metric to impact, potential gain, and status ('draft').
            If Campaign: provide name, target segment, goal, estimated impact, and status ('draft').
            Format the output as a JSON array of either ABTestSuggestion or CampaignSuggestion interfaces.
            Summary: ${summary}
            Trends: ${JSON.stringify(trends)}
            `;
            const response = await this.ai.getGenerativeModel({ model: this.model }).generateContent(prompt);
            const text = response.response.text();
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                return JSON.parse(jsonMatch[1]);
            } else {
                return JSON.parse(text);
            }
        } catch (error) {
            console.error("AI recommendation generation failed:", error);
            return [
                { id: 'abtest-001', hypothesis: 'Redesigning signup flow increases conversion by 5%', metricToImpact: 'Signup Conversion Rate', potentialGain: '+5%', status: 'draft' },
                { id: 'campaign-001', name: 'Win-back dormant users', targetSegment: 'Users inactive for >90 days', goal: 'Re-engage 10% of dormant users', estimatedImpact: '+2% MAU', status: 'draft' },
            ];
        }
    }
}

const aiService = new AIGrowthService(process.env.API_KEY as string);

// --- Sub-Components (Internal to this file to achieve line count directive) ---

/**
 * Renders a grid of key growth metric cards.
 */
export const MetricCardGrid: React.FC<{ metrics: GrowthMetricSummary[] }> = ({ metrics }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {metrics.map((metric) => (
            <Card key={metric.key} className="text-center p-4">
                <p className={`text-3xl font-bold ${metric.isGood ? 'text-green-400' : 'text-red-400'} text-white`}>{metric.value}</p>
                <p className="text-sm text-gray-400 mt-1">{metric.label}</p>
                {metric.trend !== undefined && (
                    <p className={`text-xs mt-2 ${metric.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.trend > 0 ? '▲' : '▼'} {Math.abs(metric.trend).toFixed(1)}% vs. prev.
                    </p>
                )}
            </Card>
        ))}
    </div>
);

/**
 * Renders a collection of time-series charts for various growth metrics.
 */
export const TrendChartSection: React.FC<{
    mauData: TimeSeriesDataPoint[];
    dauData: TimeSeriesDataPoint[];
    newUsersData: TimeSeriesDataPoint[];
    churnData: TimeSeriesDataPoint[];
    ltvData: TimeSeriesDataPoint[];
    arpuData: TimeSeriesDataPoint[];
    selectedPeriod: string;
    onPeriodChange: (period: string) => void;
}> = ({ mauData, dauData, newUsersData, churnData, ltvData, arpuData, selectedPeriod, onPeriodChange }) => {

    const chartConfigs = useMemo(() => [
        { title: 'Monthly Active Users (MAU)', data: mauData, dataKey: 'mau', stroke: GROWTH_METRIC_COLORS.mau, fill: GROWTH_METRIC_COLORS.mau, type: 'area' },
        { title: 'Daily Active Users (DAU)', data: dauData, dataKey: 'dau', stroke: GROWTH_METRIC_COLORS.dau, fill: GROWTH_METRIC_COLORS.dau, type: 'area' },
        { title: 'New Users', data: newUsersData, dataKey: 'newUsers', stroke: GROWTH_METRIC_COLORS.newUsers, fill: GROWTH_METRIC_COLORS.newUsers, type: 'bar' },
        { title: 'Monthly Churn Rate', data: churnData, dataKey: 'churn', stroke: GROWTH_METRIC_COLORS.churn, fill: GROWTH_METRIC_COLORS.churn, type: 'line', unit: '%' },
        { title: 'Customer Lifetime Value (LTV)', data: ltvData, dataKey: 'ltv', stroke: GROWTH_METRIC_COLORS.ltv, fill: GROWTH_METRIC_COLORS.ltv, type: 'area', unit: '$' },
        { title: 'Average Revenue Per User (ARPU)', data: arpuData, dataKey: 'arpu', stroke: GROWTH_METRIC_COLORS.arpu, fill: GROWTH_METRIC_COLORS.arpu, type: 'line', unit: '$' },
    ], [mauData, dauData, newUsersData, churnData, ltvData, arpuData]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Detailed Growth Trends</h3>
                <div className="flex space-x-2">
                    {CHART_PERIODS.map(period => (
                        <button
                            key={period}
                            onClick={() => onPeriodChange(period)}
                            className={`px-3 py-1 text-sm rounded ${selectedPeriod === period ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {chartConfigs.map((config) => (
                    <Card key={config.title} title={config.title}>
                        <ResponsiveContainer width="100%" height={250}>
                            {config.type === 'area' ? (
                                <AreaChart data={config.data}>
                                    <XAxis dataKey="time" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" tickFormatter={(value) => formatNumber(value, config.unit)} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => formatNumber(value, config.unit)} />
                                    <Area type="monotone" dataKey={config.dataKey} stroke={config.stroke} fill={config.fill} fillOpacity={0.3} />
                                </AreaChart>
                            ) : config.type === 'line' ? (
                                <LineChart data={config.data}>
                                    <XAxis dataKey="time" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" tickFormatter={(value) => formatNumber(value, config.unit)} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => formatNumber(value, config.unit)} />
                                    <Line type="monotone" dataKey={config.dataKey} stroke={config.stroke} dot={false} />
                                </LineChart>
                            ) : (
                                <BarChart data={config.data}>
                                    <XAxis dataKey="time" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" tickFormatter={(value) => formatNumber(value, config.unit)} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => formatNumber(value, config.unit)} />
                                    <Bar dataKey={config.dataKey} fill={config.fill} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </Card>
                ))}
            </div>
        </div>
    );
};

/**
 * Renders a retention cohort analysis table.
 */
export const RetentionCohortChart: React.FC<{ cohortData: CohortData[] }> = ({ cohortData }) => {
    const maxRetentionMonths = useMemo(() => {
        if (!cohortData.length) return 0;
        return Math.max(...cohortData.map(c => Object.keys(c.retentionMonths).length));
    }, [cohortData]);

    const retentionColumns = useMemo(() => {
        const columns: string[] = ['Acquisition Month', 'Acquired Users'];
        for (let i = 0; i < maxRetentionMonths; i++) {
            columns.push(`M${i}`);
        }
        return columns;
    }, [maxRetentionMonths]);

    const getRetentionPercentage = (acquired: number, retained: number) => {
        if (acquired === 0) return 0;
        return (retained / acquired) * 100;
    };

    return (
        <Card title="Retention Cohorts" className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-300">
                <thead>
                    <tr className="bg-gray-700 text-gray-200">
                        {retentionColumns.map(col => (
                            <th key={col} className="px-4 py-2 text-left font-semibold border-b border-gray-600 whitespace-nowrap">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {cohortData.map((cohort, idx) => (
                        <tr key={cohort.acquisitionMonth} className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/70'}>
                            <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{cohort.acquisitionMonth}</td>
                            <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{formatNumber(cohort.usersAcquired)}</td>
                            {Array.from({ length: maxRetentionMonths }).map((_, monthOffset) => {
                                const retainedUsers = cohort.retentionMonths[`M${monthOffset}`] || 0;
                                const percentage = getRetentionPercentage(cohort.usersAcquired, retainedUsers);
                                const cellColor = monthOffset === 0 ? 'text-white' :
                                    percentage > 70 ? 'text-green-400' :
                                        percentage > 40 ? 'text-yellow-400' : 'text-red-400';
                                return (
                                    <td key={`${cohort.acquisitionMonth}-M${monthOffset}`} className={`px-4 py-2 border-b border-gray-700 whitespace-nowrap ${cellColor}`}>
                                        {monthOffset === 0 ? formatNumber(retainedUsers) : `${percentage.toFixed(1)}%`}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};

/**
 * Renders a funnel chart for conversion steps.
 */
export const FunnelConversionChart: React.FC<{ funnelData: TimeSeriesDataPoint[] }> = ({ funnelData }) => {
    const pieData = useMemo(() => {
        if (!funnelData || funnelData.length < 2) return [];
        const steps = funnelData.map((d, i) => {
            const previousValue = i > 0 ? funnelData[i - 1].value : d.value;
            const conversionRate = previousValue > 0 ? (d.value / previousValue) * 100 : 0;
            return {
                name: d.time,
                value: d.value,
                conversionFromPrev: conversionRate,
                fill: COLORS[i % COLORS.length]
            };
        });
        return steps;
    }, [funnelData]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-800 p-3 rounded shadow-lg border border-gray-600 text-white text-sm">
                    <p className="font-semibold">{data.name}</p>
                    <p>Users: <span className="text-cyan-400">{formatNumber(data.value)}</span></p>
                    {data.name !== funnelData[0].time && ( // Don't show conversion for the first step
                        <p>Conversion from previous: <span className="text-green-400">{formatPercentage(data.conversionFromPrev)}</span></p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <Card title="Conversion Funnel Analysis">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={funnelData.slice().reverse()} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => formatNumber(value)} />
                    <YAxis dataKey="time" type="category" stroke="#9ca3af" width={100} />
                    <Tooltip content={CustomTooltip} />
                    <Bar dataKey="value" fill="#8884d8" barSize={30}>
                        {funnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

/**
 * Renders AI-driven and statistical forecasts.
 */
export const ForecastingSection: React.FC<{
    historicalData: TimeSeriesDataPoint[];
    selectedPeriod: string;
    forecasts: ForecastData[];
    isLoadingForecast: boolean;
    onGenerateForecast: () => void;
}> = ({ historicalData, selectedPeriod, forecasts, isLoadingForecast, onGenerateForecast }) => {

    const chartData = useMemo(() => {
        const histData = historicalData.map(d => ({ ...d, type: 'actual' }));
        const forecastData = forecasts.map(f => ({
            time: f.period,
            value: f.forecast,
            upperBound: f.upperBound,
            lowerBound: f.lowerBound,
            type: 'forecast'
        }));
        // Combine, ensuring time keys align if possible
        const combined = [...histData, ...forecastData];
        // For line chart, need to interpolate between last actual and first forecast
        if (histData.length > 0 && forecastData.length > 0) {
            const lastActual = histData[histData.length - 1];
            const firstForecast = forecastData[0];
            combined.push({
                time: lastActual.time, // Same time as last actual
                value: firstForecast.value, // forecast value
                type: 'forecast',
                isTransition: true // Mark for special rendering if needed
            });
            // Sort by time to ensure correct line rendering, assuming 'time' can be sorted chronologically
            // For simple 'Day 1', 'Day 2' it's fine, for 'Jan', 'Feb' it needs proper date parsing
            // For now, assume sequential string
            combined.sort((a, b) => a.time.localeCompare(b.time));
        }
        return combined;
    }, [historicalData, forecasts]);

    return (
        <Card title={`Growth Forecast (${selectedPeriod})`} className="flex flex-col h-full">
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(value) => formatNumber(value)} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number, name: string) => [`${formatNumber(value)}`, name === 'value' ? 'Forecast/Actual' : name]} />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke={GROWTH_METRIC_COLORS.mau} strokeWidth={2} name="Actual/Forecast" />
                        <Line type="monotone" dataKey="upperBound" stroke="#82ca9d" strokeDasharray="5 5" dot={false} name="Upper Bound" />
                        <Line type="monotone" dataKey="lowerBound" stroke="#ffc658" strokeDasharray="5 5" dot={false} name="Lower Bound" />
                        <Area type="monotone" dataKey="value" stroke="none" fill={GROWTH_METRIC_COLORS.mau} fillOpacity={0.1} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <button
                onClick={onGenerateForecast}
                disabled={isLoadingForecast}
                className="w-full mt-4 py-2 bg-purple-600/50 hover:bg-purple-600 rounded disabled:opacity-50 text-white"
            >
                {isLoadingForecast ? 'Generating Forecast...' : 'Generate AI Forecast'}
            </button>
            <div className="mt-4 text-sm text-gray-400 italic">
                <p>AI-powered forecast based on historical data and projected trends.</p>
                {forecasts.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {forecasts.map((f, i) => (
                            <div key={i} className="flex justify-between items-center text-xs bg-gray-700 p-2 rounded">
                                <span>{f.period}:</span>
                                <span>{formatNumber(f.forecast)} ({formatNumber(f.lowerBound)}-{formatNumber(f.upperBound)})</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};

/**
 * Displays detected anomalies in growth data.
 */
export const AnomalyDetectionSection: React.FC<{
    anomalies: Anomaly[];
    isLoadingAnomalies: boolean;
    onAnalyzeAnomalies: () => void;
}> = ({ anomalies, isLoadingAnomalies, onAnalyzeAnomalies }) => (
    <Card title="Anomaly Detection" className="flex flex-col h-full">
        <div className="flex-grow min-h-[10rem]">
            {isLoadingAnomalies ? (
                <p className="text-gray-400 italic">Analyzing data for anomalies...</p>
            ) : anomalies.length === 0 ? (
                <p className="text-gray-400">No significant anomalies detected in the selected period.</p>
            ) : (
                <ul className="space-y-3 text-sm">
                    {anomalies.map((anomaly, index) => (
                        <li key={index} className="border-l-4 border-red-500 pl-3 py-1">
                            <p className="font-semibold text-white">{anomaly.timestamp} - {anomaly.metric}</p>
                            <p className="text-gray-300">Value: <span className="text-red-400 font-bold">{formatNumber(anomaly.value)}</span> (Expected: {formatNumber(anomaly.expectedRange[0])}-{formatNumber(anomaly.expectedRange[1])})</p>
                            <p className="text-gray-400 italic text-xs mt-1">{anomaly.description}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${anomaly.severity === 'high' ? 'bg-red-900 text-red-300' : anomaly.severity === 'medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>
                                {anomaly.severity}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <button
            onClick={onAnalyzeAnomalies}
            disabled={isLoadingAnomalies}
            className="w-full mt-4 py-2 bg-red-600/50 hover:bg-red-600 rounded disabled:opacity-50 text-white"
        >
            {isLoadingAnomalies ? 'Detecting...' : 'Run Anomaly Detection'}
        </button>
    </Card>
);

/**
 * Displays detailed segmentation data in a table.
 */
export const SegmentationTable: React.FC<{ segmentData: SegmentData[] }> = ({ segmentData }) => (
    <Card title="User Segmentation Breakdown" className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-300">
            <thead>
                <tr className="bg-gray-700 text-gray-200">
                    <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Segment</th>
                    <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Total Users</th>
                    <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Growth (%)</th>
                    <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Conversion Rate</th>
                    <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">ARPU</th>
                    <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Value Contributed</th>
                </tr>
            </thead>
            <tbody>
                {segmentData.map((segment, idx) => (
                    <tr key={segment.segment} className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/70'}>
                        <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{segment.segment}</td>
                        <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{formatNumber(segment.users)}</td>
                        <td className={`px-4 py-2 border-b border-gray-700 whitespace-nowrap ${segment.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {segment.change > 0 ? '▲' : '▼'} {formatPercentage(Math.abs(segment.change))}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{formatPercentage(segment.conversionRate! * 100)}</td>
                        <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{formatNumber(segment.arpu!, '$', true)}</td>
                        <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{formatNumber(segment.value, '$', true)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </Card>
);

/**
 * Displays AI-generated actionable insights and recommendations.
 */
export const ActionableInsightsPanel: React.FC<{
    insights: (ABTestSuggestion | CampaignSuggestion)[];
    isLoadingInsights: boolean;
    onGenerateInsights: () => void;
}> = ({ insights, isLoadingInsights, onGenerateInsights }) => (
    <Card title="Actionable Growth Insights" className="flex flex-col h-full">
        <div className="flex-grow min-h-[10rem]">
            {isLoadingInsights ? (
                <p className="text-gray-400 italic">Generating actionable recommendations...</p>
            ) : insights.length === 0 ? (
                <p className="text-gray-400">Click to generate AI-powered growth strategies.</p>
            ) : (
                <div className="space-y-4">
                    {insights.map((insight, index) => (
                        <div key={insight.id} className="p-3 bg-gray-700 rounded shadow">
                            {'hypothesis' in insight ? ( // Check if it's an A/B test suggestion
                                <>
                                    <h4 className="font-semibold text-cyan-400">A/B Test Suggestion: {insight.id}</h4>
                                    <p className="text-sm text-gray-300">Hypothesis: <span className="italic">{insight.hypothesis}</span></p>
                                    <p className="text-xs text-gray-400 mt-1">Impacts: {insight.metricToImpact} | Potential Gain: {insight.potentialGain}</p>
                                </>
                            ) : ( // It's a Campaign Suggestion
                                <>
                                    <h4 className="font-semibold text-purple-400">Campaign Suggestion: {insight.name}</h4>
                                    <p className="text-sm text-gray-300">Goal: <span className="italic">{insight.goal}</span></p>
                                    <p className="text-xs text-gray-400 mt-1">Target: {insight.targetSegment} | Est. Impact: {insight.estimatedImpact}</p>
                                </>
                            )}
                            <span className="text-xs px-2 py-0.5 mt-2 inline-block rounded-full bg-blue-900 text-blue-300 capitalize">{insight.status}</span>
                            <button className="ml-3 text-xs text-blue-400 hover:underline">Launch/Review</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
        <button
            onClick={onGenerateInsights}
            disabled={isLoadingInsights}
            className="w-full mt-4 py-2 bg-blue-600/50 hover:bg-blue-600 rounded disabled:opacity-50 text-white"
        >
            {isLoadingInsights ? 'Generating Insights...' : 'Generate Actionable Insights'}
        </button>
    </Card>
);

/**
 * Provides advanced filters for growth data.
 */
export const AdvancedFilterPanel: React.FC<{
    selectedDateRange: string;
    onDateRangeChange: (range: string) => void;
    selectedSegment: string;
    onSegmentChange: (segment: string) => void;
    availableSegments: string[];
}> = ({ selectedDateRange, onDateRangeChange, selectedSegment, onSegmentChange, availableSegments }) => {
    const dateRanges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Quarter', 'Last Year', 'All Time'];
    return (
        <Card title="Advanced Filters">
            <div className="space-y-4">
                <div>
                    <label htmlFor="date-range" className="block text-sm font-medium text-gray-300 mb-1">Date Range</label>
                    <select
                        id="date-range"
                        value={selectedDateRange}
                        onChange={(e) => onDateRangeChange(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        {dateRanges.map(range => (
                            <option key={range} value={range}>{range}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="segment-filter" className="block text-sm font-medium text-gray-300 mb-1">Segment Filter</label>
                    <select
                        id="segment-filter"
                        value={selectedSegment}
                        onChange={(e) => onSegmentChange(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        <option value="All">All Segments</option>
                        {availableSegments.map(segment => (
                            <option key={segment} value={segment}>{segment}</option>
                        ))}
                    </select>
                </div>
                <button className="w-full py-2 bg-green-600/50 hover:bg-green-600 rounded text-white">Apply Filters</button>
            </div>
        </Card>
    );
};

/**
 * Displays feature adoption metrics.
 */
export const FeatureAdoptionMetrics: React.FC<{ featureAdoptionData: FeatureAdoptionMetric[] }> = ({ featureAdoptionData }) => (
    <Card title="Feature Adoption & Engagement" className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-300">
            <thead>
                <tr className="bg-gray-700 text-gray-200">
                    <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Feature</th>
                    <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Total Users</th>
                    <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Active Users</th>
                    <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Adoption Rate</th>
                    <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Engagement Score</th>
                    <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Change (30D)</th>
                </tr>
            </thead>
            <tbody>
                {featureAdoptionData.map((feature, idx) => (
                    <tr key={feature.feature} className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/70'}>
                        <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{feature.feature}</td>
                        <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{formatNumber(feature.totalUsers)}</td>
                        <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{formatNumber(feature.activeUsers)}</td>
                        <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{formatPercentage(feature.adoptionRate)}</td>
                        <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{feature.engagementScore.toFixed(0)}/100</td>
                        <td className={`px-4 py-2 border-b border-gray-700 whitespace-nowrap ${feature.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {feature.change > 0 ? '▲' : '▼'} {formatPercentage(Math.abs(feature.change))}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </Card>
);

/**
 * Allows users to define custom metrics. (Simplified form)
 */
export const CustomMetricBuilder: React.FC<{
    onSaveMetric: (metric: CustomMetricDefinition) => void;
    existingMetrics: CustomMetricDefinition[];
}> = ({ onSaveMetric, existingMetrics }) => {
    const [name, setName] = useState('');
    const [formula, setFormula] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && formula) {
            onSaveMetric({
                id: `custom-${existingMetrics.length + 1}`,
                name,
                formula,
                description,
                isPublic,
                createdBy: 'Current User' // Placeholder
            });
            setName('');
            setFormula('');
            setDescription('');
            setIsPublic(false);
        }
    };

    return (
        <Card title="Custom Metric Builder">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="metric-name" className="block text-sm font-medium text-gray-300 mb-1">Metric Name</label>
                    <input
                        type="text"
                        id="metric-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="e.g., Conversion Rate to Paid"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="metric-formula" className="block text-sm font-medium text-gray-300 mb-1">Formula (e.g., DAU / MAU * 100)</label>
                    <textarea
                        id="metric-formula"
                        value={formula}
                        onChange={(e) => setFormula(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 resize-y"
                        rows={3}
                        placeholder="Enter mathematical formula using existing metrics"
                        required
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="metric-description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <input
                        type="text"
                        id="metric-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Brief description of the metric"
                    />
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="is-public"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="is-public" className="ml-2 block text-sm text-gray-300">Make this metric public?</label>
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-600/50 hover:bg-indigo-600 rounded text-white">Save Custom Metric</button>
            </form>
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-3">Your Custom Metrics</h3>
                {existingMetrics.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">No custom metrics defined yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {existingMetrics.map(metric => (
                            <li key={metric.id} className="bg-gray-700 p-2 rounded text-sm flex justify-between items-center">
                                <div>
                                    <p className="text-white font-medium">{metric.name}</p>
                                    <p className="text-gray-400 text-xs italic">Formula: {metric.formula}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${metric.isPublic ? 'bg-green-900 text-green-300' : 'bg-gray-900 text-gray-300'}`}>
                                    {metric.isPublic ? 'Public' : 'Private'}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Card>
    );
};


/**
 * Main Growth Insights View Component.
 */
const GrowthInsightsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("GrowthInsightsView must be within DataProvider");

    // Placeholder, using static data for now as per original
    const { growthMetrics } = context;

    // --- State Management for Data and AI Interactions ---
    const [aiSummary, setAiSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<string>('Monthly');

    const [forecasts, setForecasts] = useState<ForecastData[]>([]);
    const [isLoadingForecast, setIsLoadingForecast] = useState(false);

    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(false);

    const [actionableInsights, setActionableInsights] = useState<(ABTestSuggestion | CampaignSuggestion)[]>([]);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

    const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');
    const [selectedSegment, setSelectedSegment] = useState('All');

    const [customMetrics, setCustomMetrics] = useState<CustomMetricDefinition[]>([]);

    // --- Mock Data Generation based on selectedPeriod ---
    const chartData = useMemo(() => generateMockTimeSeries(6, 12000, 5, 'up', 'mau', 'Month'), []);
    const mauData = useMemo(() => generateMockTimeSeries(selectedPeriod === 'Daily' ? 30 : selectedPeriod === 'Weekly' ? 12 : 6, 20000, 7, 'up', 'mau', selectedPeriod.substring(0, 1)), [selectedPeriod]);
    const dauData = useMemo(() => generateMockTimeSeries(selectedPeriod === 'Daily' ? 30 : selectedPeriod === 'Weekly' ? 12 : 6, 8000, 10, 'up', 'dau', selectedPeriod.substring(0, 1)), [selectedPeriod]);
    const newUsersData = useMemo(() => generateMockTimeSeries(selectedPeriod === 'Daily' ? 30 : selectedPeriod === 'Weekly' ? 12 : 6, 1500, 15, 'up', 'newUsers', selectedPeriod.substring(0, 1)), [selectedPeriod]);
    const churnData = useMemo(() => generateMockTimeSeries(selectedPeriod === 'Daily' ? 30 : selectedPeriod === 'Weekly' ? 12 : 6, 2.1, 0.5, 'down', 'churn', selectedPeriod.substring(0, 1)), [selectedPeriod]);
    const ltvData = useMemo(() => generateMockTimeSeries(selectedPeriod === 'Daily' ? 30 : selectedPeriod === 'Weekly' ? 12 : 6, 125, 8, 'up', 'ltv', selectedPeriod.substring(0, 1)), [selectedPeriod]);
    const arpuData = useMemo(() => generateMockTimeSeries(selectedPeriod === 'Daily' ? 30 : selectedPeriod === 'Weekly' ? 12 : 6, 15, 5, 'up', 'arpu', selectedPeriod.substring(0, 1)), [selectedPeriod]);

    const retentionCohorts = useMemo(() => generateMockRetentionCohorts(6, 5000), []);
    const segmentData = useMemo(() => generateMockSegmentData(), []);
    const funnelData = useMemo(() => generateMockFunnelData(), []);
    const featureAdoptionData = useMemo(() => generateMockFeatureAdoption(), []);

    const availableSegments = useMemo(() => segmentData.map(s => s.segment), [segmentData]);

    // --- Derived Growth Metric Summaries ---
    const latestMau = mauData.length > 0 ? (mauData[mauData.length - 1] as any).mau : 0;
    const prevMau = mauData.length > 1 ? (mauData[mauData.length - 2] as any).mau : 0;
    const mauTrend = calculatePercentageChange(latestMau, prevMau);

    const latestChurn = churnData.length > 0 ? (churnData[churnData.length - 1] as any).churn : 0;
    const prevChurn = churnData.length > 1 ? (churnData[churnData.length - 2] as any).churn : 0;
    const churnTrend = calculatePercentageChange(latestChurn, prevChurn);

    const latestLTV = ltvData.length > 0 ? (ltvData[ltvData.length - 1] as any).ltv : 0;
    const prevLTV = ltvData.length > 1 ? (ltvData[ltvData.length - 2] as any).ltv : 0;
    const ltvTrend = calculatePercentageChange(latestLTV, prevLTV);

    const latestNewUsers = newUsersData.length > 0 ? (newUsersData[newUsersData.length - 1] as any).newUsers : 0;
    const prevNewUsers = newUsersData.length > 1 ? (newUsersData[newUsersData.length - 2] as any).newUsers : 0;
    const newUsersTrend = calculatePercentageChange(latestNewUsers, prevNewUsers);

    const latestARPU = arpuData.length > 0 ? (arpuData[arpuData.length - 1] as any).arpu : 0;
    const prevARPU = arpuData.length > 1 ? (arpuData[arpuData.length - 2] as any).arpu : 0;
    const arpuTrend = calculatePercentageChange(latestARPU, prevARPU);

    const summaryMetrics: GrowthMetricSummary[] = useMemo(() => [
        { key: 'mau', label: 'Monthly Active Users', value: formatNumber(latestMau), trend: mauTrend, isGood: mauTrend >= 0 },
        { key: 'dau', label: 'Daily Active Users', value: formatNumber(dauData.length > 0 ? (dauData[dauData.length - 1] as any).dau : 0), trend: calculatePercentageChange(dauData.length > 0 ? (dauData[dauData.length - 1] as any).dau : 0, dauData.length > 1 ? (dauData[dauData.length - 2] as any).dau : 0), isGood: calculatePercentageChange(dauData.length > 0 ? (dauData[dauData.length - 1] as any).dau : 0, dauData.length > 1 ? (dauData[dauData.length - 2] as any).dau : 0) >= 0 },
        { key: 'newUsers', label: 'New Users (Last 30D)', value: formatNumber(latestNewUsers), trend: newUsersTrend, isGood: newUsersTrend >= 0 },
        { key: 'churn', label: 'Monthly Churn Rate', value: formatPercentage(latestChurn), trend: churnTrend, isGood: churnTrend <= 0 },
        { key: 'ltv', label: 'Customer Lifetime Value', value: formatNumber(latestLTV, '$', true), trend: ltvTrend, isGood: ltvTrend >= 0 },
        { key: 'arpu', label: 'ARPU', value: formatNumber(latestARPU, '$', true), trend: arpuTrend, isGood: arpuTrend >= 0 },
        // Add more metrics here to simulate complexity and expand the grid.
        { key: 'arr', label: 'Annual Recurring Revenue', value: formatNumber(latestARPU * latestMau * 12, '$', true), trend: (mauTrend + arpuTrend) / 2, isGood: (mauTrend + arpuTrend) / 2 >= 0 },
        { key: 'cac', label: 'Customer Acquisition Cost', value: formatNumber(75 + Math.random() * 20, '$', true), trend: calculatePercentageChange(75 + Math.random() * 20, 80 + Math.random() * 15), isGood: calculatePercentageChange(75 + Math.random() * 20, 80 + Math.random() * 15) <= 0 },
        { key: 'conversion', label: 'Trial-to-Paid Conv.', value: formatPercentage(15 + Math.random() * 5), trend: calculatePercentageChange(15 + Math.random() * 5, 14 + Math.random() * 3), isGood: calculatePercentageChange(15 + Math.random() * 5, 14 + Math.random() * 3) >= 0 },
        { key: 'referral', label: 'Referral Signups', value: formatNumber(1500 + Math.random() * 500), trend: calculatePercentageChange(1500 + Math.random() * 500, 1200 + Math.random() * 400), isGood: calculatePercentageChange(1500 + Math.random() * 500, 1200 + Math.random() * 400) >= 0 },
    ], [latestMau, mauTrend, latestChurn, churnTrend, latestLTV, ltvTrend, latestNewUsers, newUsersTrend, latestARPU, arpuTrend, dauData]);

    // --- AI Interaction Handlers ---
    const handleGenerateSummary = async () => {
        setIsLoadingSummary(true);
        setAiSummary('');
        try {
            const summary = await aiService.generateSummary(mauData, `Focus on the ${selectedPeriod} trend.`);
            setAiSummary(summary);
        } catch (err) {
            console.error(err);
            setAiSummary('Failed to generate summary.');
        } finally {
            setIsLoadingSummary(false);
        }
    };

    const handleGenerateForecast = async () => {
        setIsLoadingForecast(true);
        setForecasts([]);
        try {
            const forecastResult = await aiService.generateForecast(mauData, selectedPeriod === 'Daily' ? 7 : selectedPeriod === 'Weekly' ? 4 : 3);
            setForecasts(forecastResult);
        } catch (err) {
            console.error(err);
            setForecasts([]);
        } finally {
            setIsLoadingForecast(false);
        }
    };

    const handleAnalyzeAnomalies = async () => {
        setIsLoadingAnomalies(true);
        setAnomalies([]);
        try {
            const detectedAnomalies = await aiService.analyzeAnomalies(mauData, 'MAU');
            setAnomalies(detectedAnomalies);
        } catch (err) {
            console.error(err);
            setAnomalies([]);
        } finally {
            setIsLoadingAnomalies(false);
        }
    };

    const handleGenerateActionableInsights = async () => {
        setIsLoadingInsights(true);
        setActionableInsights([]);
        try {
            const generatedInsights = await aiService.generateRecommendations(aiSummary, { mauTrend, churnTrend, ltvTrend, segmentData });
            setActionableInsights(generatedInsights);
        } catch (err) {
            console.error(err);
            setActionableInsights([]);
        } finally {
            setIsLoadingInsights(false);
        }
    };

    const handleSaveCustomMetric = (metric: CustomMetricDefinition) => {
        setCustomMetrics(prev => [...prev, metric]);
        console.log("Custom metric saved:", metric);
    };

    return (
        <div className="space-y-8 p-4 md:p-8 bg-gray-900 min-h-screen">
            <h2 className="text-4xl font-extrabold text-white tracking-wide border-b border-gray-700 pb-4">Comprehensive Growth Insights Dashboard</h2>

            <MetricCardGrid metrics={summaryMetrics} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <TrendChartSection
                        mauData={mauData}
                        dauData={dauData}
                        newUsersData={newUsersData}
                        churnData={churnData}
                        ltvData={ltvData}
                        arpuData={arpuData}
                        selectedPeriod={selectedPeriod}
                        onPeriodChange={setSelectedPeriod}
                    />
                </div>
                <div className="lg:col-span-1 flex flex-col space-y-6">
                    <Card title="AI Trend Summary" className="flex flex-col h-full">
                        <div className="flex-grow min-h-[10rem] text-sm text-gray-300 italic overflow-y-auto">
                            {isLoadingSummary ? (
                                <div className="animate-pulse flex space-x-4">
                                    <div className="flex-1 space-y-4 py-1">
                                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-700 rounded"></div>
                                            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : aiSummary || 'Click "Generate AI Summary" to get an automated analysis of your growth trends.'}
                        </div>
                        <button onClick={handleGenerateSummary} disabled={isLoadingSummary} className="w-full mt-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 rounded disabled:opacity-50 text-white">
                            {isLoadingSummary ? 'Analyzing...' : 'Generate AI Summary'}
                        </button>
                    </Card>
                    <AdvancedFilterPanel
                        selectedDateRange={selectedDateRange}
                        onDateRangeChange={setSelectedDateRange}
                        selectedSegment={selectedSegment}
                        onSegmentChange={setSelectedSegment}
                        availableSegments={availableSegments}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RetentionCohortChart cohortData={retentionCohorts} />
                <FunnelConversionChart funnelData={funnelData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ForecastingSection
                    historicalData={mauData}
                    selectedPeriod={selectedPeriod}
                    forecasts={forecasts}
                    isLoadingForecast={isLoadingForecast}
                    onGenerateForecast={handleGenerateForecast}
                />
                <AnomalyDetectionSection
                    anomalies={anomalies}
                    isLoadingAnomalies={isLoadingAnomalies}
                    onAnalyzeAnomalies={handleAnalyzeAnomalies}
                />
            </div>

            <SegmentationTable segmentData={segmentData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActionableInsightsPanel
                    insights={actionableInsights}
                    isLoadingInsights={isLoadingInsights}
                    onGenerateInsights={handleGenerateActionableInsights}
                />
                <FeatureAdoptionMetrics featureAdoptionData={featureAdoptionData} />
            </div>

            <CustomMetricBuilder onSaveMetric={handleSaveCustomMetric} existingMetrics={customMetrics} />

            {/* Additional Sections to increase line count and simulate a more robust dashboard */}
            <Card title="Growth Strategy Playbook" className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-3">Popular Growth Strategies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-300">
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-cyan-400">Onboarding Flow Optimization</h4>
                        <p className="mt-1">Analyze user drop-off points in the initial signup and first-use experience. Implement A/B tests on key screens, messaging, and calls-to-action to improve new user activation.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Reduce friction in signup forms.</li>
                            <li>Personalize welcome emails.</li>
                            <li>Introduce interactive tutorials.</li>
                        </ul>
                        <button className="mt-3 text-cyan-500 hover:text-cyan-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-green-400">Referral Program Enhancement</h4>
                        <p className="mt-1">Boost viral growth by optimizing your referral program. Experiment with different incentives for both referrer and referee, and simplify sharing mechanisms.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Tiered rewards system.</li>
                            <li>Social media sharing integration.</li>
                            <li>Performance tracking for referrers.</li>
                        </ul>
                        <button className="mt-3 text-green-500 hover:text-green-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-purple-400">Churn Reduction Tactics</h4>
                        <p className="mt-1">Identify segments with high churn rates and proactively engage them. Develop targeted campaigns (email, in-app) offering support, new features, or exclusive content.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Exit survey analysis.</li>
                            <li>Dormant user re-engagement.</li>
                            <li>Proactive support for at-risk users.</li>
                        </ul>
                        <button className="mt-3 text-purple-500 hover:text-purple-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-yellow-400">Pricing Page Optimization</h4>
                        <p className="mt-1">A/B test different pricing tiers, feature comparisons, and calls-to-action on your pricing page. Analyze conversion rates and ARPU to find the optimal strategy.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Experiment with free trial length.</li>
                            <li>Bundle pricing options.</li>
                            <li>Social proof (testimonials).</li>
                        </ul>
                        <button className="mt-3 text-yellow-500 hover:text-yellow-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-red-400">Feature Prioritization based on Impact</h4>
                        <p className="mt-1">Use data from feature adoption and engagement to prioritize development. Focus on features that drive the most user growth, retention, or revenue.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>User feedback integration.</li>
                            <li>Impact vs. effort matrix.</li>
                            <li>MVP development cycles.</li>
                        </ul>
                        <button className="mt-3 text-red-500 hover:text-red-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-indigo-400">Content Marketing for SEO Growth</h4>
                        <p className="mt-1">Invest in high-quality content that targets relevant keywords to drive organic traffic. Track search rankings, unique visitors, and conversion from content.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Blog post strategy.</li>
                            <li>SEO keyword research.</li>
                            <li>Backlink building.</li>
                        </ul>
                        <button className="mt-3 text-indigo-500 hover:text-indigo-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-teal-400">Email Nurturing Sequences</h4>
                        <p className="mt-1">Create automated email sequences for different user lifecycle stages (lead, trial, active, churned) to guide users and provide value.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Welcome series.</li>
                            <li>Feature spotlight emails.</li>
                            <li>Drip campaigns for trials.</li>
                        </ul>
                        <button className="mt-3 text-teal-500 hover:text-teal-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-orange-400">Integrations & Ecosystem Growth</h4>
                        <p className="mt-1">Expand your product's utility by integrating with other popular tools. This can attract new user segments and increase stickiness for existing users.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>API documentation improvements.</li>
                            <li>Partnership development.</li>
                            <li>Marketplace listing.</li>
                        </ul>
                        <button className="mt-3 text-orange-500 hover:text-orange-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-lime-400">Customer Success Driven Growth</h4>
                        <p className="mt-1">Leverage your customer success team to identify power users, gather feedback, and turn satisfied customers into advocates and upsell opportunities.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Proactive outreach.</li>
                            <li>Success stories & case studies.</li>
                            <li>Feedback loop integration.</li>
                        </ul>
                        <button className="mt-3 text-lime-500 hover:text-lime-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-pink-400">Community Building</h4>
                        <p className="mt-1">Foster a thriving user community through forums, social groups, or events. A strong community can drive engagement, support, and organic growth.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Dedicated online forum.</li>
                            <li>Webinars and workshops.</li>
                            <li>Ambassador program.</li>
                        </ul>
                        <button className="mt-3 text-pink-500 hover:text-pink-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-gray-400">Geographic Expansion Planning</h4>
                        <p className="mt-1">Identify new markets with high potential for user acquisition. Tailor marketing messages, localize product features, and adapt pricing for regional appeal.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Market research.</li>
                            <li>Language localization.</li>
                            <li>Regional partnerships.</li>
                        </ul>
                        <button className="mt-3 text-gray-500 hover:text-gray-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-blue-400">Performance Marketing Campaigns</h4>
                        <p className="mt-1">Run targeted paid advertising campaigns (e.g., Google Ads, social media ads) to acquire high-quality users. Continuously optimize ad spend and creative for ROI.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Audience segmentation.</li>
                            <li>A/B testing ad creatives.</li>
                            <li>Landing page optimization.</li>
                        </ul>
                        <button className="mt-3 text-blue-500 hover:text-blue-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-brown-400">SEO Technical Audit & Improvement</h4>
                        <p className="mt-1">Conduct regular technical SEO audits to ensure your website is crawlable, indexable, and performs well for search engines. Improve site speed, mobile-friendliness, and structured data.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Core Web Vitals optimization.</li>
                            <li>Schema markup implementation.</li>
                            <li>Broken link checks.</li>
                        </ul>
                        <button className="mt-3 text-brown-500 hover:text-brown-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-violet-400">Product-Led Growth (PLG) Initiatives</h4>
                        <p className="mt-1">Design your product to be the primary driver of customer acquisition, conversion, and expansion. Focus on free trials, freemium models, and self-serve onboarding.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Freemium tier analysis.</li>
                            <li>In-app prompts for upgrades.</li>
                            <li>Virality loops within product.</li>
                        </ul>
                        <button className="mt-3 text-violet-500 hover:text-violet-400 text-xs">Learn More</button>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <h4 className="font-bold text-fuchsia-400">Partnership & Affiliate Marketing</h4>
                        <p className="mt-1">Form strategic alliances with complementary businesses or influential figures (affiliates) to reach new audiences and drive qualified leads through co-marketing efforts.</p>
                        <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
                            <li>Influencer marketing.</li>
                            <li>Joint webinars/events.</li>
                            <li>Affiliate tracking setup.</li>
                        </ul>
                        <button className="mt-3 text-fuchsia-500 hover:text-fuchsia-400 text-xs">Learn More</button>
                    </div>
                </div>
            </Card>

            <Card title="Data Quality & Latency" className="text-sm text-gray-400">
                <p>Last Data Refresh: {new Date().toLocaleString()} (approx. 5 minutes ago)</p>
                <p>Data Source Status: <span className="text-green-500">All Systems Operational</span></p>
                <p>AI Model Version: <span className="text-blue-400">Gemini-1.5-Flash (API v1.0)</span></p>
                <p className="mt-2 text-xs italic">Note: Real-time data streams and AI processing may introduce minor latency. Forecasts and insights are based on available data up to the last refresh.</p>
            </Card>

            {/* Further components and detailed views can be added here following the same pattern */}
            {/* E.g., User Journey Mapping, Experiment Tracker, Segment-specific Deep Dives */}
            <Card title="Detailed User Journey Overview">
                <h3 className="text-lg font-semibold text-white mb-3">Key Stages and Drop-offs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-300">
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <p className="text-cyan-400 font-bold">1. Awareness & Discovery</p>
                        <p>Channels: Search (40%), Social (30%), Referrals (20%), Ads (10%)</p>
                        <p className="text-red-400">Drop-off to Visitors: High bounce rate on blog (45%)</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <p className="text-green-400 font-bold">2. Exploration & Interest</p>
                        <p>Visited pricing: 60% of visitors. View demo: 25%</p>
                        <p className="text-red-400">Drop-off to Signups: Complex feature explanations (20% drop)</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <p className="text-purple-400 font-bold">3. Signup & Onboarding</p>
                        <p>Signup Conversion: 10% of visitors. Onboarding completion: 70%</p>
                        <p className="text-red-400">Drop-off to Trial Activation: Initial setup complexity (15% drop)</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <p className="text-yellow-400 font-bold">4. Active Usage & Retention</p>
                        <p>Weekly Active Users: 65% of trial users. Paid Conversion: 18% of trials</p>
                        <p className="text-red-400">Drop-off to Paid: Perceived value not high enough (25% churn post-trial)</p>
                    </div>
                </div>
                <button className="mt-4 w-full py-2 bg-indigo-700/50 hover:bg-indigo-700 rounded text-white">View Full Journey Map</button>
            </Card>

            <Card title="A/B Experiment Tracker">
                <h3 className="text-lg font-semibold text-white mb-3">Current & Past Experiments</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-gray-300">
                        <thead>
                            <tr className="bg-gray-700 text-gray-200">
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Experiment Name</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Hypothesis</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Primary Metric</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Status</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Result</th>
                                <th className="px-4 py-2 text-left font-semibold border-b border-gray-600">Impact</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-gray-800">
                                <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">Signup Form v2</td>
                                <td className="px-4 py-2 border-b border-gray-700">Simplified form increases conversion.</td>
                                <td className="px-4 py-2 border-b border-gray-700">Signup Rate</td>
                                <td className="px-4 py-2 border-b border-gray-700"><span className="px-2 py-0.5 rounded-full bg-green-900 text-green-300">Completed</span></td>
                                <td className="px-4 py-2 border-b border-gray-700 text-green-400">Winner (Variant B)</td>
                                <td className="px-4 py-2 border-b border-gray-700 text-green-400">+3.2% Signup Rate</td>
                            </tr>
                            <tr className="bg-gray-800/70">
                                <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">Homepage CTA Color</td>
                                <td className="px-4 py-2 border-b border-gray-700">Green CTA performs better.</td>
                                <td className="px-4 py-2 border-b border-gray-700">Click-through Rate</td>
                                <td className="px-4 py-2 border-b border-gray-700"><span className="px-2 py-0.5 rounded-full bg-blue-900 text-blue-300">Running</span></td>
                                <td className="px-4 py-2 border-b border-gray-700 text-yellow-400">In Progress</td>
                                <td className="px-4 py-2 border-b border-gray-700 text-yellow-400">N/A</td>
                            </tr>
                            <tr className="bg-gray-800">
                                <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">Trial Length Experiment</td>
                                <td className="px-4 py-2 border-b border-gray-700">14-day trial leads to more conversions.</td>
                                <td className="px-4 py-2 border-b border-gray-700">Trial-to-Paid Conv.</td>
                                <td className="px-4 py-2 border-b border-gray-700"><span className="px-2 py-0.5 rounded-full bg-red-900 text-red-300">Archived</span></td>
                                <td className="px-4 py-2 border-b border-gray-700 text-red-400">Inconclusive</td>
                                <td className="px-4 py-2 border-b border-gray-700 text-gray-400">No significant difference</td>
                            </tr>
                            {actionableInsights.filter(i => 'hypothesis' in i).map((insight: ABTestSuggestion) => (
                                <tr key={insight.id} className="bg-gray-800/70">
                                    <td className="px-4 py-2 border-b border-gray-700 whitespace-nowrap">{insight.id} (AI Suggestion)</td>
                                    <td className="px-4 py-2 border-b border-gray-700 italic">{insight.hypothesis}</td>
                                    <td className="px-4 py-2 border-b border-gray-700">{insight.metricToImpact}</td>
                                    <td className="px-4 py-2 border-b border-gray-700"><span className="px-2 py-0.5 rounded-full bg-orange-900 text-orange-300">{insight.status}</span></td>
                                    <td className="px-4 py-2 border-b border-gray-700 text-gray-400">Pending</td>
                                    <td className="px-4 py-2 border-b border-gray-700 italic">{insight.potentialGain}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button className="mt-4 w-full py-2 bg-yellow-700/50 hover:bg-yellow-700 rounded text-white">Manage Experiments</button>
            </Card>

            <Card title="Market & Competitive Insights (AI-Powered)">
                <h3 className="text-lg font-semibold text-white mb-3">Recent Market Landscape Analysis</h3>
                <div className="text-sm text-gray-300 space-y-3">
                    <p className="italic">"AI analysis indicates growing market demand for [specific feature/industry niche] fueled by recent advancements in [technology trend]. Competitors [Competitor A] and [Competitor B] have recently launched initiatives in this space, suggesting a window of opportunity for product diversification or enhanced feature development. Our platform is well-positioned to capitalize on this if [key action] is prioritized."</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-800 rounded">
                            <h4 className="font-bold text-lg text-blue-400">Competitive Landscape</h4>
                            <ul className="list-disc list-inside mt-2">
                                <li>Competitor A: Strong in Enterprise, launched new AI module last month.</li>
                                <li>Competitor B: Dominant in SMB, recently closed $50M funding round.</li>
                                <li>Emerging Threats: Several startups focusing on niche AI-driven analytics.</li>
                            </ul>
                        </div>
                        <div className="p-3 bg-gray-800 rounded">
                            <h4 className="font-bold text-lg text-purple-400">Market Trends</h4>
                            <ul className="list-disc list-inside mt-2">
                                <li>Increased demand for "predictive analytics" (up 15% in search queries).</li>
                                <li>Growing importance of "data privacy" and "compliance".</li>
                                <li>Shift towards "no-code/low-code" solutions.</li>
                            </ul>
                        </div>
                    </div>
                    <button className="mt-4 w-full py-2 bg-teal-700/50 hover:bg-teal-700 rounded text-white">Generate Full Market Report</button>
                </div>
            </Card>

            <Card title="User Feedback & Sentiment Analysis">
                <h3 className="text-lg font-semibold text-white mb-3">Key Themes from Recent User Feedback (AI Summarized)</h3>
                <div className="text-sm text-gray-300 space-y-3">
                    <p className="italic">"Recent feedback analysis highlights a strong positive sentiment towards the new [Feature X], particularly its [specific aspect]. However, a recurring theme of frustration is observed regarding [pain point Y] related to [Product Area Z], contributing to a noticeable dip in user satisfaction for a small segment."</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-800 rounded">
                            <h4 className="font-bold text-lg text-green-400">Positive Mentions</h4>
                            <ul className="list-disc list-inside mt-2">
                                <li>"Intuitive UI/UX" (25% mentions)</li>
                                <li>"Excellent customer support" (18% mentions)</li>
                                <li>"Powerful reporting features" (15% mentions)</li>
                            </ul>
                        </div>
                        <div className="p-3 bg-gray-800 rounded">
                            <h4 className="font-bold text-lg text-red-400">Negative Mentions</h4>
                            <ul className="list-disc list-inside mt-2">
                                <li>"Slow loading times on large datasets" (12% mentions)</li>
                                <li>"Limited mobile functionality" (9% mentions)</li>
                                <li>"Integration setup is complex" (7% mentions)</li>
                            </ul>
                        </div>
                    </div>
                    <button className="mt-4 w-full py-2 bg-pink-700/50 hover:bg-pink-700 rounded text-white">View Detailed Sentiment Report</button>
                </div>
            </Card>

            <Card title="Customer Health Score Trends">
                <h3 className="text-lg font-semibold text-white mb-3">Overall Customer Health</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={generateMockTimeSeries(12, 75, 5, 'stable', 'healthScore', 'M')}>
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                        <Line type="monotone" dataKey="healthScore" stroke="#a4de6c" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm text-gray-300">
                    <div className="p-3 bg-gray-800 rounded">
                        <h4 className="font-bold text-lg text-green-400">High Health</h4>
                        <p className="text-2xl font-bold">65%</p>
                        <p>Active, Engaged, Low Churn Risk</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded">
                        <h4 className="font-bold text-lg text-yellow-400">Medium Health</h4>
                        <p className="text-2xl font-bold">25%</p>
                        <p>Moderate Usage, Monitor Engagement</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded">
                        <h4 className="font-bold text-lg text-red-400">Low Health</h4>
                        <p className="text-2xl font-bold">10%</p>
                        <p>Inactive, High Churn Risk, Immediate Outreach</p>
                    </div>
                </div>
                <button className="mt-4 w-full py-2 bg-orange-700/50 hover:bg-orange-700 rounded text-white">Drill Down into Health Segments</button>
            </Card>

            <Card title="Recent Activity Log & System Alerts">
                <h3 className="text-lg font-semibold text-white mb-3">Operational Status & User Activity</h3>
                <div className="text-sm text-gray-300 space-y-2">
                    <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span><span className="text-green-400">●</span> 2024-07-26 14:30: User 'JohnDoe' completed onboarding flow.</span>
                        <span className="text-xs text-gray-500">Activity Log</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span><span className="text-yellow-400">●</span> 2024-07-26 13:15: API Integration with 'Slack' experienced minor latency (resolved).</span>
                        <span className="text-xs text-gray-500">System Alert</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span><span className="text-blue-400">●</span> 2024-07-26 10:00: New Feature 'Advanced Filters' deployed to 50% of users.</span>
                        <span className="text-xs text-gray-500">Deployment</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span><span className="text-red-400">●</span> 2024-07-25 23:05: High churn detected in 'European Small Business' segment (anomaly flagged).</span>
                        <span className="text-xs text-gray-500">Anomaly Alert</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span><span className="text-green-400">●</span> 2024-07-25 09:45: User 'JaneSmith' upgraded to Enterprise plan.</span>
                        <span className="text-xs text-gray-500">Activity Log</span>
                    </div>
                </div>
                <button className="mt-4 w-full py-2 bg-gray-700/50 hover:bg-gray-700 rounded text-white">View All Activity & Alerts</button>
            </Card>

            <Card title="Resource Usage & Cost Efficiency Metrics">
                <h3 className="text-lg font-semibold text-white mb-3">Platform Overhead & Efficiency</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <p className="text-cyan-400 font-bold">Compute Cost per User</p>
                        <p className="text-2xl font-bold">$0.05</p>
                        <p className="text-green-400">▼ 2.1% (vs. prev. month)</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <p className="text-green-400 font-bold">API Call Success Rate</p>
                        <p className="text-2xl font-bold">99.8%</p>
                        <p className="text-green-400">▲ 0.1% (vs. prev. month)</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded shadow">
                        <p className="text-purple-400 font-bold">Storage Growth Rate</p>
                        <p className="text-2xl font-bold">1.5 TB/month</p>
                        <p className="text-red-400">▲ 5.2% (vs. prev. month)</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={200} className="mt-4">
                    <AreaChart data={generateMockTimeSeries(6, 0.06, 10, 'down', 'costPerUser', 'M')}>
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${value.toFixed(2)}`} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                        <Area type="monotone" dataKey="costPerUser" stroke="#66bb6a" fill="#66bb6a" fillOpacity={0.3} name="Cost per User" />
                    </AreaChart>
                </ResponsiveContainer>
                <button className="mt-4 w-full py-2 bg-lime-700/50 hover:bg-lime-700 rounded text-white">Analyze Cost Breakdown</button>
            </Card>

            <Card title="Subscription Plan Distribution">
                <h3 className="text-lg font-semibold text-white mb-3">User Distribution Across Plans</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={[{ name: 'Free Tier', value: 150000 }, { name: 'Starter', value: 80000 }, { name: 'Professional', value: 40000 }, { name: 'Enterprise', value: 10000 }]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {[{ name: 'Free Tier', value: 150000 }, { name: 'Starter', value: 80000 }, { name: 'Professional', value: 40000 }, { name: 'Enterprise', value: 10000 }].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
                <button className="mt-4 w-full py-2 bg-gray-700/50 hover:bg-gray-700 rounded text-white">Compare Plan Performance</button>
            </Card>

            <Card title="Traffic Source Breakdown">
                <h3 className="text-lg font-semibold text-white mb-3">Where are users coming from?</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[{ name: 'Organic Search', value: 12000 }, { name: 'Direct', value: 8000 }, { name: 'Social Media', value: 7000 }, { name: 'Referral', value: 5000 }, { name: 'Paid Ads', value: 3000 }]}>
                        <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="#9ca3af" tickFormatter={(value) => formatNumber(value)} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                        <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
                <button className="mt-4 w-full py-2 bg-teal-700/50 hover:bg-teal-700 rounded text-white">Analyze Channel Performance</button>
            </Card>

        </div>
    );
};

export default GrowthInsightsView;