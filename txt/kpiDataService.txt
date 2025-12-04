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

export const mockKpiDefinitions: Record<string, KpiMetricDefinition[]> = {
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

export const mockGoals: KpiGoal[] = [
  { goalId: 'goal-income-1', metricId: 'income', targetValue: 7000, startDate: '2024-01-01', endDate: '2024-12-31', status: 'in_progress', priority: 'high', description: 'Increase monthly income by 40% by year-end.' },
  { goalId: 'goal-spending-1', metricId: 'discretionarySpending', targetValue: 2000, startDate: '2024-01-01', endDate: '2024-12-31', status: 'at_risk', priority: 'medium', description: 'Keep discretionary spending below $2000.' },
  { goalId: 'goal-savings-1', metricId: 'savingsRate', targetValue: 20, startDate: '2024-06-01', endDate: '2024-12-31', status: 'in_progress', priority: 'high', description: 'Achieve 20% savings rate.' },
];

export const mockUniverseConfig: KpiUniverseConfig = {
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