import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceArea, Bar, Scatter, CartesianGrid, Brush, LineChart, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';
import { format, subDays, addDays, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, eachYearOfInterval, differenceInDays } from 'date-fns';

// --- Global Configuration and Type Definitions for the KPI Universe ---

/**
 * Defines the structure for a single KPI metric.
 * This is the metadata about what a KPI *is*, not its actual data.
 */
export interface KpiMetricDefinition {
  id: string;
  name: string;
  type: 'currency' | 'percentage' | 'number' | 'ratio' | 'text' | 'boolean';
  description: string;
  unit?: string;
  chartType?: 'line' | 'area' | 'bar' | 'scatter' | 'pie' | 'radialBar';
  color?: string;
  yAxisId?: string; // 'left' or 'right' for charts
  isGoal?: boolean; // Can this metric be a goal?
  isForecastable?: boolean; // Can we predict this metric?
  isAnomalyDetectable?: boolean; // Can we detect anomalies in this metric?
  sourceSystem?: string; // e.g., 'ERP', 'CRM', 'Google Analytics', 'Manual'
  aggregationMethod?: 'sum' | 'average' | 'count' | 'min' | 'max' | 'latest';
  transformations?: string[]; // e.g., ['daily_to_monthly_sum', 'currency_conversion_usd_eur']
}

/**
 * Represents a single data point for a KPI, extended with advanced analytics features.
 */
export interface KpiDataPoint {
  timestamp: string; // ISO string or specific format like 'YYYY-MM-DD'
  periodLabel: string; // e.g., "Jan", "2024-01-15", "Q1-2024"
  value: number; // Primary value for the metric
  [key: string]: any; // Allows for additional dynamic properties like 'income', 'discretionarySpending', 'incomeGrowth', 'forecast', 'lowerBound', 'upperBound', 'anomalyScore', 'sentimentScore', etc.
}

/**
 * Defines a specific goal associated with a KPI.
 */
export interface KpiGoal {
  goalId: string;
  metricId: string; // Which metric this goal applies to
  targetValue: number;
  startDate: string;
  endDate: string;
  status: 'achieved' | 'in_progress' | 'missed' | 'at_risk';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  ownerId?: string; // User ID of the goal owner
  lastUpdated?: string;
}

/**
 * Represents a detected anomaly in the KPI data.
 */
export interface KpiAnomaly {
  anomalyId: string;
  metricId: string;
  timestamp: string;
  actualValue: number;
  expectedValue: number;
  deviation: number; // actual - expected
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason?: string; // AI-generated or user-inputted reason
  actionTaken?: string;
  resolved?: boolean;
}

/**
 * Represents a predictive forecast for a KPI.
 */
export interface KpiForecast {
  forecastId: string;
  metricId: string;
  timestamp: string;
  predictedValue: number;
  confidenceLowerBound?: number;
  confidenceUpperBound?: number;
  modelUsed?: string; // e.g., 'ARIMA', 'Prophet', 'Neural Network'
  generationDate?: string;
}

/**
 * Represents a significant event or intervention related to a KPI.
 */
export interface KpiEvent {
  eventId: string;
  timestamp: string;
  metricId?: string; // Optional, if event impacts multiple or is general
  eventType: 'data_change' | 'goal_set' | 'anomaly_detected' | 'system_update' | 'user_comment' | 'external_factor';
  description: string;
  details?: Record<string, any>; // e.g., old value, new value, user, reason
}

/**
 * Represents AI-generated insights or recommendations.
 */
export interface KpiInsight {
  insightId: string;
  timestamp: string;
  metricId?: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendations?: string[];
  sourceAI?: string; // e.g., 'TrendAnalyzer', 'RootCauseEngine', 'OptimizationAI'
  feedbackProvided?: boolean; // User feedback on insight
}

/**
 * Configuration for how the KPI universe behaves and looks.
 */
export interface KpiUniverseConfig {
  defaultTimeRange: '1m' | '3m' | '6m' | '1y' | 'ytd' | 'all' | 'custom';
  supportedTimeGranularities: ('daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly')[];
  enableForecasting: boolean;
  enableAnomalyDetection: boolean;
  enableGoalTracking: boolean;
  enableNLQ: boolean; // Natural Language Query
  theme: 'dark' | 'light' | 'custom';
  allowedChartTypes: KpiMetricDefinition['chartType'][];
  realtimeUpdateIntervalSeconds?: number;
  dataRetentionDays?: number;
  externalDataSources?: { id: string; name: string; type: string; status: 'connected' | 'disconnected' }[];
  performanceMonitoringEnabled?: boolean;
}

// --- Mock Data & API Simulation Layer ---

const mockKpiDefinitions: Record<string, KpiMetricDefinition[]> = {
  'financial_overview': [
    { id: 'income', name: 'Total Income', type: 'currency', unit: '$', chartType: 'area', color: '#10b981', yAxisId: 'left', isForecastable: true, isGoal: true, isAnomalyDetectable: true, sourceSystem: 'ERP', aggregationMethod: 'sum' },
    { id: 'discretionarySpending', name: 'Discretionary Spending', type: 'currency', unit: '$', chartType: 'line', color: '#0ea5e9', yAxisId: 'left', isForecastable: true, isGoal: true, isAnomalyDetectable: true, sourceSystem: 'ERP', aggregationMethod: 'sum' },
    { id: 'incomeGrowth', name: 'Income Growth', type: 'percentage', unit: '%', chartType: 'line', color: '#f97316', yAxisId: 'right', isForecastable: true, isAnomalyDetectable: true, sourceSystem: 'ERP', aggregationMethod: 'average' },
    { id: 'savingsRate', name: 'Savings Rate', type: 'percentage', unit: '%', chartType: 'bar', color: '#8b5cf6', yAxisId: 'right', isForecastable: true, isGoal: true, isAnomalyDetectable: true, sourceSystem: 'ERP', aggregationMethod: 'average' },
    { id: 'netWorth', name: 'Net Worth', type: 'currency', unit: '$', chartType: 'line', color: '#ec4899', yAxisId: 'left', isForecastable: true, isGoal: true, isAnomalyDetectable: true, sourceSystem: 'Investments', aggregationMethod: 'latest' },
    { id: 'debtToIncomeRatio', name: 'Debt-to-Income Ratio', type: 'ratio', unit: '', chartType: 'line', color: '#ef4444', yAxisId: 'right', isForecastable: true, isGoal: true, isAnomalyDetectable: true, sourceSystem: 'CreditBureauAPI', aggregationMethod: 'latest' },
  ],
  'operational_efficiency': [
    { id: 'processCycleTime', name: 'Process Cycle Time', type: 'number', unit: 'days', chartType: 'bar', color: '#3b82f6', isGoal: true },
    { id: 'defectRate', name: 'Defect Rate', type: 'percentage', unit: '%', chartType: 'line', color: '#ef4444', isGoal: true },
    { id: 'employeeProductivity', name: 'Employee Productivity', type: 'number', unit: 'units/hr', chartType: 'area', color: '#059669', isGoal: true },
  ],
  'marketing_performance': [
    { id: 'conversionRate', name: 'Conversion Rate', type: 'percentage', unit: '%', chartType: 'line', color: '#fbbf24', isGoal: true },
    { id: 'customerAcquisitionCost', name: 'Customer Acquisition Cost', type: 'currency', unit: '$', chartType: 'bar', color: '#eab308', isGoal: true },
    { id: 'websiteTraffic', name: 'Website Traffic', type: 'number', unit: 'visits', chartType: 'area', color: '#6366f1', isForecastable: true },
  ],
};

const mockGoals: KpiGoal[] = [
  { goalId: 'goal-income-1', metricId: 'income', targetValue: 7000, startDate: '2024-01-01', endDate: '2024-12-31', status: 'in_progress', priority: 'high', description: 'Increase monthly income by 40% by year-end.' },
  { goalId: 'goal-spending-1', metricId: 'discretionarySpending', targetValue: 2000, startDate: '2024-01-01', endDate: '2024-12-31', status: 'at_risk', priority: 'medium', description: 'Keep discretionary spending below $2000.' },
  { goalId: 'goal-savings-1', metricId: 'savingsRate', targetValue: 20, startDate: '2024-06-01', endDate: '2024-12-31', status: 'in_progress', priority: 'high', description: 'Achieve 20% savings rate.' },
];

const mockUniverseConfig: KpiUniverseConfig = {
  defaultTimeRange: '1y',
  supportedTimeGranularities: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
  enableForecasting: true,
  enableAnomalyDetection: true,
  enableGoalTracking: true,
  enableNLQ: true,
  theme: 'dark',
  allowedChartTypes: ['line', 'area', 'bar', 'scatter', 'pie', 'radialBar'],
  realtimeUpdateIntervalSeconds: 300,
  dataRetentionDays: 3650, // 10 years
  externalDataSources: [
    { id: 'erp-finance', name: 'ERP Finance', type: 'API', status: 'connected' },
    { id: 'crm-sales', name: 'CRM Sales', type: 'Database', status: 'connected' },
    { id: 'ga-web', name: 'Google Analytics', type: 'API', status: 'connected' },
  ],
  performanceMonitoringEnabled: true,
};

/**
 * Simulates fetching data from a dynamic, AI-powered backend.
 * This is the heart of the "universe" data generation.
 * It now generates data for multiple metrics, forecasts, and anomalies.
 */
export const fetchKpiUniverseData = async (
  kpiId: string,
  timeRange: KpiUniverseConfig['defaultTimeRange'] = '1y',
  granularity: 'daily' | 'monthly' | 'yearly' = 'monthly',
  comparisonPeriod: 'none' | 'prev_period' | 'prev_year' = 'none',
): Promise<{
  data: KpiDataPoint[];
  metrics: KpiMetricDefinition[];
  goals: KpiGoal[];
  anomalies: KpiAnomaly[];
  forecasts: KpiForecast[];
  insights: KpiInsight[];
  config: KpiUniverseConfig;
}> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const metricsToLoad = mockKpiDefinitions[kpiId] || mockKpiDefinitions['financial_overview'];
        const kpiUniverseConfig = mockUniverseConfig;

        let startDate = new Date();
        let endDate = new Date();

        switch (timeRange) {
          case '1m':
            startDate = startOfMonth(subDays(new Date(), 30));
            endDate = endOfMonth(new Date());
            break;
          case '3m':
            startDate = startOfMonth(subDays(new Date(), 90));
            endDate = endOfMonth(new Date());
            break;
          case '6m':
            startDate = startOfMonth(subDays(new Date(), 180));
            endDate = endOfMonth(new Date());
            break;
          case '1y':
            startDate = startOfMonth(subDays(new Date(), 365));
            endDate = endOfMonth(new Date());
            break;
          case 'ytd':
            startDate = startOfYear(new Date());
            endDate = new Date();
            break;
          case 'all': // Simulate 5 years of data for 'all'
            startDate = startOfYear(subDays(new Date(), 5 * 365));
            endDate = endOfMonth(new Date());
            break;
          case 'custom': // Not implemented in mock, defaults to 1y
          default:
            startDate = startOfMonth(subDays(new Date(), 365));
            endDate = endOfMonth(new Date());
            break;
        }

        let timeIntervals: Date[] = [];
        let labelFormat: string;
        switch (granularity) {
          case 'daily':
            timeIntervals = eachDayOfInterval({ start: startDate, end: endDate });
            labelFormat = 'MMM d';
            break;
          case 'monthly':
            timeIntervals = eachMonthOfInterval({ start: startDate, end: endDate });
            labelFormat = 'MMM';
            break;
          case 'yearly':
            timeIntervals = eachYearOfInterval({ start: startDate, end: endDate });
            labelFormat = 'yyyy';
            break;
        }

        const data: KpiDataPoint[] = timeIntervals.map((date, i) => {
          const baseIncome = 5000 + (i * 150) + (Math.sin(i / 3) * 1000);
          const income = baseIncome + (Math.random() * 500);
          const discretionarySpending = (income * (0.4 + Math.random() * 0.25));
          const incomeGrowth = i > 0 ? ((income / (5000 + ((i-1) * 150) + (Math.sin((i-1) / 3) * 1000))) - 1) * 100 : 0;
          const savingsRate = ((income - discretionarySpending) / income) * 100 * (0.8 + Math.random() * 0.4); // Simulate some fluctuation
          const netWorth = (baseIncome * i * 10) + (Math.random() * 10000);
          const debtToIncomeRatio = (0.3 + Math.random() * 0.2) * (1 + (i / 100)); // Slight increase over time

          const dataPoint: KpiDataPoint = {
            timestamp: date.toISOString(),
            periodLabel: format(date, labelFormat),
            income: parseFloat(income.toFixed(2)),
            discretionarySpending: parseFloat(discretionarySpending.toFixed(2)),
            incomeGrowth: parseFloat(incomeGrowth.toFixed(2)),
            savingsRate: parseFloat(Math.max(0, Math.min(100, savingsRate)).toFixed(2)), // Clamp between 0 and 100
            netWorth: parseFloat(netWorth.toFixed(2)),
            debtToIncomeRatio: parseFloat(debtToIncomeRatio.toFixed(2)),
            spendingExceededThreshold: (discretionarySpending / income) > 0.6, // Original KPI feature
            // Add more simulated metrics here as per mockKpiDefinitions
          };

          // Simulate comparison data
          if (comparisonPeriod === 'prev_period' && i >= timeIntervals.length / 2) {
            const prevPeriodIndex = i - Math.floor(timeIntervals.length / 2); // Simplified
            if (data[prevPeriodIndex]) {
              dataPoint.income_prev = data[prevPeriodIndex].income * (0.9 + Math.random() * 0.2);
              dataPoint.discretionarySpending_prev = data[prevPeriodIndex].discretionarySpending * (0.9 + Math.random() * 0.2);
            }
          }
          if (comparisonPeriod === 'prev_year') {
            // More complex logic would be needed here for exact year comparison
            dataPoint.income_prev_year = income * (0.8 + Math.random() * 0.3);
            dataPoint.discretionarySpending_prev_year = discretionarySpending * (0.8 + Math.random() * 0.3);
          }

          return dataPoint;
        });

        // Simulate Forecasts
        const forecasts: KpiForecast[] = kpiUniverseConfig.enableForecasting ? metricsToLoad
          .filter(m => m.isForecastable)
          .flatMap(metric => {
            const lastDataPoint = data[data.length - 1];
            const futurePoints: KpiForecast[] = [];
            for (let j = 1; j <= 3; j++) { // Forecast 3 periods into the future
              const futureDate = addDays(new Date(lastDataPoint.timestamp), j * 30); // Simple month advance
              const predictedValue = lastDataPoint[metric.id] * (1 + (Math.random() * 0.05 - 0.02)); // Simple growth
              futurePoints.push({
                forecastId: `forecast-${metric.id}-${j}`,
                metricId: metric.id,
                timestamp: futureDate.toISOString(),
                predictedValue: parseFloat(predictedValue.toFixed(2)),
                confidenceLowerBound: parseFloat((predictedValue * 0.9).toFixed(2)),
                confidenceUpperBound: parseFloat((predictedValue * 1.1).toFixed(2)),
                modelUsed: 'AI_Predictor_v3.1',
                generationDate: new Date().toISOString(),
              });
            }
            return futurePoints;
          }) : [];

        // Simulate Anomalies
        const anomalies: KpiAnomaly[] = kpiUniverseConfig.enableAnomalyDetection ? data.filter(dp => dp.spendingExceededThreshold).map((dp, idx) => ({
          anomalyId: `anomaly-${dp.timestamp}-${idx}`,
          metricId: 'discretionarySpending',
          timestamp: dp.timestamp,
          actualValue: dp.discretionarySpending,
          expectedValue: dp.income * 0.5, // Simplified expected
          deviation: dp.discretionarySpending - (dp.income * 0.5),
          severity: 'high',
          reason: 'Discretionary spending significantly above typical percentage of income.',
          actionTaken: 'Review budget categories',
          resolved: false,
        })) : [];

        // Simulate AI Insights
        const insights: KpiInsight[] = [];
        if (kpiUniverseConfig.enableNLQ) {
            insights.push({
                insightId: 'ai-insight-1',
                timestamp: new Date().toISOString(),
                metricId: 'incomeGrowth',
                severity: 'info',
                title: 'Income Growth Trend Analysis',
                description: 'Your income growth has shown a steady upward trend over the last year, indicating healthy financial progress. Consider reinvesting a portion of this growth.',
                recommendations: ['Explore high-yield savings options.', 'Consult a financial advisor for investment strategies.'],
                sourceAI: 'TrendAnalyzer',
            });
            if (anomalies.length > 0) {
                insights.push({
                    insightId: 'ai-insight-anomaly',
                    timestamp: new Date().toISOString(),
                    metricId: 'discretionarySpending',
                    severity: 'critical',
                    title: 'Anomaly Detected in Spending',
                    description: `An unusually high discretionary spending was detected on ${format(new Date(anomalies[0].timestamp), 'MMM d, yyyy')}. This is significantly higher than your typical spending pattern.`,
                    recommendations: ['Review transaction history for the period.', 'Adjust budget allocations for upcoming months.'],
                    sourceAI: 'AnomalyDetector',
                });
            }
        }


        resolve({
          data,
          metrics: metricsToLoad,
          goals: mockGoals.filter(g => metricsToLoad.some(m => m.id === g.metricId)),
          anomalies,
          forecasts,
          insights,
          config: kpiUniverseConfig,
        });
      } catch (err: any) {
        reject(err);
      }
    }, 1500 + Math.random() * 1000); // Simulate variable network latency
  });
};

// --- Helper Components & Hooks (Internal to DynamicKpiLoader, not exported) ---

const TooltipContent: React.FC<any> = ({ active, payload, label, definitions }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700 text-sm text-gray-100">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => {
          const metricDef = definitions.find((def: KpiMetricDefinition) => def.id === entry.dataKey || `${def.id}_prev` === entry.dataKey || `${def.id}_prev_year` === entry.dataKey);
          const name = entry.name.replace(/_prev_year|_prev/g, ' (Previous)');
          const unit = metricDef?.unit || '';
          const isCurrency = metricDef?.type === 'currency';
          const formattedValue = isCurrency ? `$${entry.value.toFixed(2)}` : entry.value.toFixed(2) + unit;
          return (
            <p key={`tooltip-item-${index}`} style={{ color: entry.color }}>
              {name}: <span className="font-semibold">{formattedValue}</span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

interface KpiComparisonSelectorProps {
  onSelect: (comparison: 'none' | 'prev_period' | 'prev_year') => void;
  currentSelection: 'none' | 'prev_period' | 'prev_year';
}

const KpiComparisonSelector: React.FC<KpiComparisonSelectorProps> = ({ onSelect, currentSelection }) => (
  <div className="flex space-x-2 text-xs">
    <button
      className={`px-3 py-1 rounded ${currentSelection === 'none' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
      onClick={() => onSelect('none')}
    >
      No Comparison
    </button>
    <button
      className={`px-3 py-1 rounded ${currentSelection === 'prev_period' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
      onClick={() => onSelect('prev_period')}
    >
      Previous Period
    </button>
    <button
      className={`px-3 py-1 rounded ${currentSelection === 'prev_year' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
      onClick={() => onSelect('prev_year')}
    >
      Previous Year
    </button>
  </div>
);

interface KpiTimeRangeSelectorProps {
  onSelect: (range: KpiUniverseConfig['defaultTimeRange']) => void;
  currentSelection: KpiUniverseConfig['defaultTimeRange'];
  onGranularityChange: (granularity: 'daily' | 'monthly' | 'yearly') => void;
  currentGranularity: 'daily' | 'monthly' | 'yearly';
}

const KpiTimeRangeSelector: React.FC<KpiTimeRangeSelectorProps> = ({ onSelect, currentSelection, onGranularityChange, currentGranularity }) => (
  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
    <div className="flex space-x-1 text-xs">
      {['1m', '3m', '6m', '1y', 'ytd', 'all'].map(range => (
        <button
          key={range}
          className={`px-2 py-1 rounded ${currentSelection === range ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          onClick={() => onSelect(range as KpiUniverseConfig['defaultTimeRange'])}
        >
          {range.toUpperCase()}
        </button>
      ))}
    </div>
    <div className="flex space-x-1 text-xs">
      <span className="text-gray-400 self-center mr-1">Granularity:</span>
      {['daily', 'monthly', 'yearly'].map(granularity => (
        <button
          key={granularity}
          className={`px-2 py-1 rounded ${currentGranularity === granularity ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          onClick={() => onGranularityChange(granularity as 'daily' | 'monthly' | 'yearly')}
        >
          {granularity.charAt(0).toUpperCase() + granularity.slice(1)}
        </button>
      ))}
    </div>
  </div>
);


// --- Main DynamicKpiLoader Component (The Universe Orchestrator) ---

interface DynamicKpiLoaderProps {
  kpiId: string; // This now refers to a 'category' of KPIs, e.g., 'financial_overview'
}

export const DynamicKpiLoader: React.FC<DynamicKpiLoaderProps> = ({ kpiId }) => {
  const [data, setData] = useState<KpiDataPoint[]>([]);
  const [metrics, setMetrics] = useState<KpiMetricDefinition[]>([]);
  const [goals, setGoals] = useState<KpiGoal[]>([]);
  const [anomalies, setAnomalies] = useState<KpiAnomaly[]>([]);
  const [forecasts, setForecasts] = useState<KpiForecast[]>([]);
  const [insights, setInsights] = useState<KpiInsight[]>([]);
  const [universeConfig, setUniverseConfig] = useState<KpiUniverseConfig | null>(null);

  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [activeMetricIds, setActiveMetricIds] = useState<string[]>([]); // User selected metrics to display
  const [selectedTimeRange, setSelectedTimeRange] = useState<KpiUniverseConfig['defaultTimeRange']>(mockUniverseConfig.defaultTimeRange);
  const [selectedGranularity, setSelectedGranularity] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [selectedComparison, setSelectedComparison] = useState<'none' | 'prev_period' | 'prev_year'>('none');
  const [chartTypePreference, setChartTypePreference] = useState<Record<string, KpiMetricDefinition['chartType']>>({});
  const [nlqInput, setNlqInput] = useState('');
  const [nlqResponse, setNlqResponse] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'composed' | 'single' | 'multiview'>('composed'); // Chart display mode

  const loadingStartTimeRef = useRef<number>(0);
  const [lastLoadDuration, setLastLoadDuration] = useState<number | null>(null);

  // Unified data fetching logic
  const loadKpiData = useCallback(async (
    currentKpiId: string,
    range: KpiUniverseConfig['defaultTimeRange'],
    granularity: 'daily' | 'monthly' | 'yearly',
    comparison: 'none' | 'prev_period' | 'prev_year'
  ) => {
    setKpiLoading(true);
    setKpiError(null);
    loadingStartTimeRef.current = performance.now();
    try {
      const result = await fetchKpiUniverseData(currentKpiId, range, granularity, comparison);
      setData(result.data);
      setMetrics(result.metrics);
      setGoals(result.goals);
      setAnomalies(result.anomalies);
      setForecasts(result.forecasts);
      setInsights(result.insights);
      setUniverseConfig(result.config);

      // Initialize active metrics to all available for the kpiId
      setActiveMetricIds(result.metrics.map(m => m.id));
      // Initialize chart type preferences if not already set
      if (Object.keys(chartTypePreference).length === 0) {
        const initialChartTypes = result.metrics.reduce((acc, m) => ({ ...acc, [m.id]: m.chartType || 'line' }), {});
        setChartTypePreference(initialChartTypes);
      }

    } catch (err: any) {
      setKpiError(err.message || 'Failed to load KPI universe data.');
    } finally {
      setKpiLoading(false);
      setLastLoadDuration(performance.now() - loadingStartTimeRef.current);
    }
  }, [chartTypePreference]);

  useEffect(() => {
    loadKpiData(kpiId, selectedTimeRange, selectedGranularity, selectedComparison);
  }, [kpiId, selectedTimeRange, selectedGranularity, selectedComparison, loadKpiData]);

  // Derived data for charts
  const chartMetrics = useMemo(() => {
    return metrics.filter(m => activeMetricIds.includes(m.id));
  }, [metrics, activeMetricIds]);

  const yAxisLeftMetrics = useMemo(() => chartMetrics.filter(m => m.yAxisId === 'left' || !m.yAxisId), [chartMetrics]);
  const yAxisRightMetrics = useMemo(() => chartMetrics.filter(m => m.yAxisId === 'right'), [chartMetrics]);

  // Helper for formatting Y-axis ticks
  const getYAxisFormatter = useCallback((metricType: KpiMetricDefinition['type']) => (value: number) => {
    if (metricType === 'currency') return `$${(value / 1000).toFixed(1)}k`;
    if (metricType === 'percentage') return `${value.toFixed(0)}%`;
    return value.toLocaleString();
  }, []);

  const handleMetricToggle = useCallback((metricId: string) => {
    setActiveMetricIds(prev =>
      prev.includes(metricId) ? prev.filter(id => id !== metricId) : [...prev, metricId]
    );
  }, []);

  const handleChartTypeChange = useCallback((metricId: string, type: KpiMetricDefinition['chartType']) => {
    setChartTypePreference(prev => ({ ...prev, [metricId]: type }));
  }, []);

  const handleNlqSubmit = async () => {
    if (!nlqInput.trim()) return;
    setNlqResponse('Thinking...'); // Simulate AI processing
    // In a real scenario, this would call an API to an NLQ engine
    setTimeout(() => {
      if (nlqInput.toLowerCase().includes('spending trends')) {
        setNlqResponse("Based on the data, discretionary spending has fluctuated but generally shown an upward trend in relation to income, sometimes exceeding 60% of income, indicated by red highlights. This suggests areas for potential budget review.");
      } else if (nlqInput.toLowerCase().includes('income growth')) {
        setNlqResponse("Income growth has been positive and steady over the observed period. The AI predicts continued stable growth in the near future.");
      } else if (nlqInput.toLowerCase().includes('goals')) {
        setNlqResponse("You have three active goals: 'Increase monthly income by 40% by year-end' (High priority, in progress), 'Keep discretionary spending below $2000' (Medium priority, at risk), and 'Achieve 20% savings rate' (High priority, in progress).");
      } else {
        setNlqResponse("I'm sorry, I can only provide insights based on predefined patterns in this simulation. Please try questions about spending or income trends, or goals.");
      }
    }, 1500);
  };

  if (kpiLoading) return <div className="text-gray-400 p-4 text-center">Loading AI-driven KPI Universe...</div>;
  if (kpiError) return <div className="text-red-400 p-4 text-center">Error loading KPI Universe: {kpiError}</div>;
  if (data.length === 0) return <div className="text-gray-400 p-4 text-center">No data available for this KPI category.</div>;

  // --- Render Logic for the KPI Universe ---
  return (
    <div className="flex flex-col p-4 bg-gray-900 text-gray-100 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6">
        {kpiId.replace(/_/g, ' ').toUpperCase()} KPI Universe
      </h1>

      {/* Universe Controls: Time Range, Granularity, Comparison, Chart Mode */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 bg-gray-800 p-4 rounded-lg shadow-md">
        <KpiTimeRangeSelector
          onSelect={setSelectedTimeRange}
          currentSelection={selectedTimeRange}
          onGranularityChange={setSelectedGranularity}
          currentGranularity={selectedGranularity}
        />
        <KpiComparisonSelector onSelect={setSelectedComparison} currentSelection={selectedComparison} />
        <div className="flex space-x-2 text-xs">
          <span className="text-gray-400 self-center mr-1">Chart View:</span>
          {['composed', 'single', 'multiview'].map(mode => (
            <button
              key={mode}
              className={`px-3 py-1 rounded ${chartMode === mode ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => setChartMode(mode as 'composed' | 'single' | 'multiview')}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Monitoring */}
      {universeConfig?.performanceMonitoringEnabled && lastLoadDuration !== null && (
        <div className="text-right text-gray-500 text-xs">
          Data loaded in {lastLoadDuration.toFixed(2)} ms.
        </div>
      )}

      {/* KPI Selection and Configuration Panel */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-indigo-300">Metrics Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {metrics.map(metric => (
            <div key={metric.id} className="flex items-center space-x-2 p-2 bg-gray-700 rounded-md">
              <input
                type="checkbox"
                id={`metric-${metric.id}`}
                checked={activeMetricIds.includes(metric.id)}
                onChange={() => handleMetricToggle(metric.id)}
                className="form-checkbox h-4 w-4 text-indigo-500 rounded border-gray-600 focus:ring-indigo-500"
              />
              <label htmlFor={`metric-${metric.id}`} className="text-gray-300 text-sm flex-grow">
                {metric.name}
              </label>
              <select
                className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                value={chartTypePreference[metric.id] || metric.chartType || 'line'}
                onChange={(e) => handleChartTypeChange(metric.id, e.target.value as KpiMetricDefinition['chartType'])}
              >
                {universeConfig?.allowedChartTypes.map(type => type && (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Main KPI Visualization Area */}
      <div className="h-96 w-full bg-gray-800 rounded-lg p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-indigo-300">Interactive KPI Chart</h2>
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'composed' && (
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="periodLabel" stroke="#9ca3af" fontSize={12} />
              {yAxisLeftMetrics.length > 0 && (
                <YAxis
                  yAxisId="left"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={getYAxisFormatter(yAxisLeftMetrics[0]?.type || 'number')}
                />
              )}
              {yAxisRightMetrics.length > 0 && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={getYAxisFormatter(yAxisRightMetrics[0]?.type || 'number')}
                />
              )}
              <Tooltip
                content={<TooltipContent definitions={metrics} />}
                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '8px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#e5e7eb', paddingTop: '10px' }} />
              <Brush dataKey="periodLabel" height={30} stroke="#8884d8" fill="#4a5568" gap={5} />

              {/* Dynamic Gradients for Area Charts */}
              <defs>
                {chartMetrics.filter(m => m.chartType === 'area').map(metric => (
                  <linearGradient key={`gradient-${metric.id}`} id={`${metric.id}Gradient`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric.color || '#8884d8'} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={metric.color || '#8884d8'} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>

              {/* Reference Areas for Anomalies and Goals */}
              {anomalies.map((anomaly, index) => (
                <ReferenceArea
                  key={`anomaly-ref-${index}`}
                  x1={format(new Date(anomaly.timestamp), selectedGranularity === 'monthly' ? 'MMM' : 'MMM d')}
                  x2={format(addDays(new Date(anomaly.timestamp), 0), selectedGranularity === 'monthly' ? 'MMM' : 'MMM d')} // Highlight single point/period
                  fill="#ef4444"
                  fillOpacity={0.3}
                  label={{ value: 'Anomaly', position: 'top', fill: '#ef4444', fontSize: 10 }}
                />
              ))}
              {goals.map((goal, index) => {
                const goalMetric = metrics.find(m => m.id === goal.metricId);
                if (!goalMetric) return null;
                const goalYAxisId = goalMetric.yAxisId || 'left';
                return (
                  <ReferenceArea
                    key={`goal-ref-${index}`}
                    yAxisId={goalYAxisId}
                    y={goal.targetValue * 0.9} // Slight band around goal
                    y2={goal.targetValue * 1.1}
                    fill={goal.status === 'achieved' ? '#10b981' : goal.status === 'at_risk' ? '#fbbf24' : '#6b7280'}
                    fillOpacity={0.1}
                  />
                );
              })}

              {/* Render Metrics */}
              {chartMetrics.map(metric => {
                const metricColor = metric.color || '#8884d8';
                const yAxis = metric.yAxisId || (metric.type === 'percentage' ? 'right' : 'left');

                // Render current data
                let ChartComponent: any = Line; // Default
                switch (chartTypePreference[metric.id] || metric.chartType) {
                  case 'area': ChartComponent = Area; break;
                  case 'bar': ChartComponent = Bar; break;
                  case 'scatter': ChartComponent = Scatter; break;
                  default: ChartComponent = Line; break;
                }

                const chartElements = [
                  <ChartComponent
                    key={metric.id}
                    yAxisId={yAxis}
                    type="monotone" // Only applicable for line/area
                    dataKey={metric.id}
                    stroke={metricColor}
                    fillOpacity={chartTypePreference[metric.id] === 'area' ? 1 : 0}
                    fill={chartTypePreference[metric.id] === 'area' ? `url(#${metric.id}Gradient)` : undefined}
                    name={metric.name}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, fill: metricColor }}
                  />
                ];

                // Render comparison data
                if (selectedComparison !== 'none') {
                  const compDataKey = `${metric.id}_${selectedComparison === 'prev_period' ? 'prev' : 'prev_year'}`;
                  chartElements.push(
                    <ChartComponent
                      key={`${metric.id}-comparison`}
                      yAxisId={yAxis}
                      type="monotone"
                      dataKey={compDataKey}
                      stroke={metricColor}
                      strokeDasharray="3 3"
                      fillOpacity={chartTypePreference[metric.id] === 'area' ? 0.3 : 0}
                      fill={chartTypePreference[metric.id] === 'area' ? `url(#${metric.id}Gradient)` : undefined}
                      name={`${metric.name} (Prev.)`}
                      dot={false}
                    />
                  );
                }

                // Render Forecasts
                if (universeConfig?.enableForecasting && metric.isForecastable) {
                  const metricForecasts = forecasts.filter(f => f.metricId === metric.id);
                  if (metricForecasts.length > 0) {
                    const forecastData = [...data, ...metricForecasts.map(f => ({
                      ...data[data.length - 1], // Inherit last data point properties
                      periodLabel: format(new Date(f.timestamp), selectedGranularity === 'monthly' ? 'MMM' : 'MMM d'),
                      [metric.id]: f.predictedValue,
                      isForecast: true,
                    }))];

                    chartElements.push(
                      <Line
                        key={`${metric.id}-forecast`}
                        yAxisId={yAxis}
                        type="monotone"
                        dataKey={metric.id}
                        stroke={metricColor}
                        strokeDasharray="5 5"
                        name={`${metric.name} (Forecast)`}
                        dot={false}
                        data={forecastData.slice(data.length - 1)} // Only show forecast segment
                      />
                    );
                  }
                }

                return chartElements;
              })}
            </ComposedChart>
          )}

          {chartMode === 'single' && chartMetrics.length > 0 && (
            // Display only the first selected metric in its preferred chart type
            <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="periodLabel" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={getYAxisFormatter(chartMetrics[0].type)} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#e5e7eb', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey={chartMetrics[0].id}
                stroke={chartMetrics[0].color || '#8884d8'}
                name={chartMetrics[0].name}
                dot={false}
              />
              {/* Add similar comparison/forecast lines as in composed chart if needed for single view */}
            </LineChart>
          )}

          {chartMode === 'multiview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full">
              {chartMetrics.map(metric => (
                <div key={`multiview-${metric.id}`} className="h-full w-full border border-gray-700 rounded-md p-2">
                  <h3 className="text-sm font-semibold text-gray-300 text-center mb-1">{metric.name}</h3>
                  <ResponsiveContainer width="100%" height="calc(100% - 25px)">
                    {(() => {
                      const ChartComponent: any =
                        metric.chartType === 'area' ? Area :
                        metric.chartType === 'bar' ? Bar :
                        metric.chartType === 'scatter' ? Scatter :
                        Line;
                      const BaseChart: any =
                        metric.chartType === 'bar' ? ComposedChart :
                        ComposedChart; // Use ComposedChart for more flexibility here too.

                      return (
                        <BaseChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <XAxis dataKey="periodLabel" hide />
                          <YAxis yAxisId="left" hide tickFormatter={getYAxisFormatter(metric.type)} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '8px' }} />
                          <ChartComponent
                            yAxisId="left"
                            type="monotone"
                            dataKey={metric.id}
                            stroke={metric.color || '#8884d8'}
                            fillOpacity={metric.chartType === 'area' ? 1 : 0}
                            fill={metric.chartType === 'area' ? metric.color || '#8884d8' : undefined}
                            name={metric.name}
                            dot={false}
                          />
                        </BaseChart>
                      );
                    })()}
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          )}
        </ResponsiveContainer>
      </div>

      {/* AI Insights & Natural Language Query */}
      {universeConfig?.enableNLQ && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="md:w-1/2 flex flex-col space-y-3">
            <h2 className="text-xl font-semibold text-indigo-300">AI Insights & Recommendations</h2>
            {insights.length > 0 ? (
              <div className="space-y-2">
                {insights.map((insight) => (
                  <div key={insight.insightId} className="p-3 bg-gray-700 rounded-md border border-gray-600">
                    <h3 className="font-semibold" style={{ color: insight.severity === 'critical' ? '#ef4444' : insight.severity === 'warning' ? '#fbbf24' : '#60a5fa' }}>
                      {insight.title}
                    </h3>
                    <p className="text-gray-300 text-sm mt-1">{insight.description}</p>
                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-gray-400 mt-2">
                        {insight.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                      </ul>
                    )}
                    <span className="text-xs text-gray-500 block mt-2">Source: {insight.sourceAI} at {format(new Date(insight.timestamp), 'MMM d, h:mm a')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No new AI insights available at the moment.</p>
            )}
          </div>
          <div className="md:w-1/2 flex flex-col space-y-3">
            <h2 className="text-xl font-semibold text-indigo-300">Natural Language Query</h2>
            <textarea
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Ask a question about your KPI data, e.g., 'Show me spending trends' or 'What are my goals?'"
              value={nlqInput}
              onChange={(e) => setNlqInput(e.target.value)}
            ></textarea>
            <button
              onClick={handleNlqSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Get AI Response
            </button>
            {nlqResponse && (
              <div className="p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm">
                <span className="font-semibold text-indigo-400">AI Response: </span>{nlqResponse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Goal Tracking & Management */}
      {universeConfig?.enableGoalTracking && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-indigo-300">Goal Tracking & Scenario Planning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-200">Your Active Goals</h3>
              {goals.length > 0 ? (
                <ul className="space-y-2">
                  {goals.map((goal) => {
                    const metricDef = metrics.find(m => m.id === goal.metricId);
                    const currentValue = data.length > 0 ? data[data.length - 1][goal.metricId] : 'N/A';
                    return (
                      <li key={goal.goalId} className="p-3 bg-gray-700 rounded-md border border-gray-600 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-300">{metricDef?.name || goal.metricId}: {goal.targetValue}{metricDef?.unit}</p>
                          <p className="text-sm text-gray-400">{goal.description}</p>
                          <p className="text-xs text-gray-500">Status: <span className={`font-medium ${goal.status === 'achieved' ? 'text-green-400' : goal.status === 'at_risk' ? 'text-yellow-400' : 'text-gray-400'}`}>{goal.status.replace(/_/g, ' ').toUpperCase()}</span> | Current: <span className="text-indigo-400 font-medium">{metricDef?.type === 'currency' ? `$${currentValue}` : `${currentValue}${metricDef?.unit}`}</span></p>
                        </div>
                        <button className="text-indigo-400 hover:text-indigo-300 text-sm">Manage</button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">No goals defined yet. Set new targets!</p>
              )}
            </div>
            {/* Conceptual Scenario Planning Interface */}
            <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
              <h3 className="text-lg font-medium mb-2 text-gray-200">Scenario Planning (What-If Analysis)</h3>
              <p className="text-gray-400 text-sm mb-3">
                Simulate different outcomes by adjusting key variables. How would a 10% increase in marketing spend affect conversion rates and customer acquisition costs?
              </p>
              <div className="space-y-2">
                <label htmlFor="scenario-variable" className="block text-sm font-medium text-gray-300">Adjust variable:</label>
                <select id="scenario-variable" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100">
                  <option value="marketingSpend">Marketing Spend</option>
                  <option value="productionEfficiency">Production Efficiency</option>
                  <option value="pricingStrategy">Pricing Strategy</option>
                </select>
                <label htmlFor="scenario-change" className="block text-sm font-medium text-gray-300">Percentage change:</label>
                <input type="number" id="scenario-change" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100" defaultValue={10} />
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                  Run Simulation
                </button>
                <div className="mt-3 p-3 bg-gray-600 rounded-md text-gray-200 text-sm">
                  <p className="font-semibold text-green-300">Simulation Result (Mock):</p>
                  <p>A 10% increase in marketing spend is predicted to increase conversion rate by 5% and increase CAC by 8%, potentially impacting net profit by -2% in the short term, but +3% in the long term.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anomalies & Alerts Management */}
      {universeConfig?.enableAnomalyDetection && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-indigo-300">Anomaly & Alert Management</h2>
          {anomalies.length > 0 ? (
            <ul className="space-y-2">
              {anomalies.map(anomaly => (
                <li key={anomaly.anomalyId} className="p-3 bg-gray-700 rounded-md border border-gray-600">
                  <p className="font-semibold text-red-400">Anomaly in {metrics.find(m => m.id === anomaly.metricId)?.name || anomaly.metricId}</p>
                  <p className="text-sm text-gray-300">
                    Detected on {format(new Date(anomaly.timestamp), 'MMM d, yyyy')}: Actual {anomaly.actualValue.toFixed(2)} (Expected {anomaly.expectedValue.toFixed(2)})
                  </p>
                  <p className="text-xs text-gray-400">{anomaly.reason}</p>
                  <div className="flex justify-end space-x-2 mt-2">
                    <button className="text-sm text-indigo-400 hover:text-indigo-300">Investigate</button>
                    <button className="text-sm text-green-400 hover:text-green-300">Mark as Resolved</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No critical anomalies detected recently.</p>
          )}
          <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium mb-2 text-gray-200">Alert Rule Management</h3>
            <p className="text-gray-400 text-sm">Define custom rules for email, Slack, or webhook notifications.</p>
            <button className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">Create New Alert Rule</button>
          </div>
        </div>
      )}

      {/* Data Source Management & Audit Trail */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-indigo-300">Data Governance & Audit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-200">Connected Data Sources</h3>
            <ul className="space-y-2">
              {universeConfig?.externalDataSources?.map(source => (
                <li key={source.id} className="p-3 bg-gray-700 rounded-md border border-gray-600 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-300">{source.name} ({source.type})</p>
                    <p className="text-xs text-gray-400">Status: <span className={source.status === 'connected' ? 'text-green-400' : 'text-red-400'}>{source.status.toUpperCase()}</span></p>
                  </div>
                  <button className="text-indigo-400 hover:text-indigo-300 text-sm">Manage</button>
                </li>
              ))}
            </ul>
            <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Add New Data Source</button>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-200">System Audit Log (Mock)</h3>
            <ul className="space-y-2 text-sm text-gray-400 h-48 overflow-y-auto custom-scrollbar">
              <li className="p-2 bg-gray-700 rounded-md border border-gray-600">
                <span className="font-semibold">[2024-07-20 10:30]</span> User 'admin' updated 'income' goal target.
              </li>
              <li className="p-2 bg-gray-700 rounded-md border border-gray-600">
                <span className="font-semibold">[2024-07-19 14:05]</span> Anomaly detected for 'discretionarySpending'.
              </li>
              <li className="p-2 bg-gray-700 rounded-md border border-gray-600">
                <span className="font-semibold">[2024-07-18 09:15]</span> Data sync from ERP completed successfully.
              </li>
              <li className="p-2 bg-gray-700 rounded-md border border-gray-600">
                <span className="font-semibold">[2024-07-17 11:45]</span> New forecast model 'AI_Predictor_v3.1' deployed.
              </li>
              <li className="p-2 bg-gray-700 rounded-md border border-gray-600">
                <span className="font-semibold">[2024-07-16 16:00]</span> User 'analyst' generated a report for 'financial_overview'.
              </li>
              <li className="p-2 bg-gray-700 rounded-md border border-gray-600">
                <span className="font-semibold">[2024-07-15 08:00]</span> Scheduled data refresh executed.
              </li>
              {/* More audit entries... */}
            </ul>
            <button className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">View Full Log</button>
          </div>
        </div>
      </div>

      {/* Custom Metric Builder & Advanced Settings (Conceptual) */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-indigo-300">Customization & Advanced Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-200">Custom Metric Builder</h3>
            <p className="text-gray-400 text-sm mb-3">
              Combine existing metrics with mathematical operations to create new, personalized KPIs.
            </p>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Create Custom Metric</button>
            <div className="mt-3 p-3 bg-gray-700 rounded-md border border-gray-600 text-gray-300 text-sm">
              <p className="font-semibold">Example: "Disposable Income %"</p>
              <code className="block mt-1 bg-gray-800 p-1 rounded">((Income - Discretionary Spending) / Income) * 100</code>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-200">User Preferences & Theming</h3>
            <p className="text-gray-400 text-sm mb-3">
              Personalize your KPI Universe experience. (Mock: 'Dark' theme active).
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Change Theme / Layout</button>
            <div className="mt-3 p-3 bg-gray-700 rounded-md border border-gray-600 text-gray-300 text-sm">
              <p className="font-semibold">Active Theme: Dark</p>
              <p>Default Chart Layout: Composed Chart</p>
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration & Sharing (Conceptual) */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-indigo-300">Collaboration & Sharing</h2>
        <p className="text-gray-400 text-sm mb-3">
          Share insights, comment on data points, and collaborate with your team.
        </p>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">Share Dashboard</button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">Export Report (PDF/CSV)</button>
        </div>
      </div>
    </div>
  );
};

export default DynamicKpiLoader;