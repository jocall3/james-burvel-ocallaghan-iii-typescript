/**
 * This module implements the core Key Performance Indicator (KPI) Data Service, a crucial component for real-time financial
 * and operational intelligence within the Money20/20 build phase architecture. It provides a robust, extensible framework for
 * defining, generating, and simulating KPI data, forecasts, anomalies, and agent-driven insights across various business domains.
 *
 * Business Value:
 * - **Accelerated Decision-Making**: Delivers real-time, high-fidelity KPI data, enabling instant visibility into financial health,
 *   operational efficiency, and strategic performance. This drastically reduces the time from data ingestion to actionable insight,
 *   providing a competitive edge.
 * - **Enhanced Automation via Agentic AI**: Seamlessly integrates with AI agents by generating rich, context-aware insights and
 *   supporting the simulation of agent-initiated actions based on KPI deviations. This automates monitoring, anomaly detection,
 *   and initial response, freeing human capital for higher-value tasks.
 * - **Foundation for Token Rails & Real-time Payments**: Simulates financial KPIs directly influenced by transactional data from
 *   token rails and real-time payment infrastructure. This allows for predictive monitoring of liquidity, transaction volumes,
 *   and settlement statuses, which is essential for risk management and operational uptime in a high-velocity payment ecosystem.
 * - **Robust Observability & Governance**: Provides comprehensive data points including goals, anomalies, events, and insights,
 *   creating a transparent, auditable ledger of performance and system interventions. This ensures regulatory compliance,
 *   tamper-evident reporting, and effective performance governance.
 * - **Scalable & Configurable Intelligence**: Designed for scalability, this service can easily incorporate new KPI definitions,
 *   integrate with diverse data sources (simulated or real), and adapt its forecasting and anomaly detection capabilities
 *   to evolving business needs, driving continuous improvement and new revenue opportunities through data-driven products.
 */
import { format, subDays, addDays, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, eachYearOfInterval, differenceInDays } from 'date-fns';

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
  sourceSystem?: string; // e.g., 'ERP', 'CRM', 'Google Analytics', 'Manual', 'PaymentRail'
  aggregationMethod?: 'sum' | 'average' | 'count' | 'min' | 'max' | 'latest';
  transformations?: string[]; // e.g., ['daily_to_monthly_sum', 'currency_conversion_usd_eur']
}

/**
 * Represents a single data point for a KPI, extended with advanced analytics features.
 */
export interface KpiDataPoint {
  timestamp: string; // ISO string or specific format like 'YYYY-MM-DD'
  periodLabel: string; // e.g., "Jan", "2024-01-15", "Q1-2024"
  value?: number; // Primary value for the metric, potentially derived or specific to a single-metric query
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
  ownerId?: string; // User ID of the goal owner, tied to digital identity
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
  actionTaken?: string; // Remediation action, potentially by an agent
  resolved?: boolean;
  resolvedBy?: string; // Agent ID or User ID
  resolutionTimestamp?: string;
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
  modelUsed?: string; // e.g., 'ARIMA', 'Prophet', 'Neural Network', 'AI_Predictor_v3.1'
  generationDate?: string;
}

/**
 * Represents a significant event or intervention related to a KPI, enabling robust audit trails.
 */
export interface KpiEvent {
  eventId: string;
  timestamp: string;
  metricId?: string; // Optional, if event impacts multiple or is general
  eventType: 'data_change' | 'goal_set' | 'anomaly_detected' | 'system_update' | 'user_comment' | 'external_factor' | 'agent_action' | 'payment_settled' | 'fraud_alert';
  description: string;
  details?: Record<string, any>; // e.g., old value, new value, user, reason, transactionId, agentId
  initiatorId?: string; // User or Agent ID responsible for the event
  securityContext?: {
    signature?: string; // Cryptographic signature for tamper-evidence
    publicKey?: string; // Public key of initiator
  };
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
  sourceAI?: string; // e.g., 'TrendAnalyzer', 'RootCauseEngine', 'OptimizationAI', 'AgentX'
  feedbackProvided?: boolean; // User feedback on insight
  actionable?: boolean; // Can an agent act on this?
  potentialActions?: AgentAction[];
}

/**
 * Defines an action an autonomous agent might take based on KPI insights.
 * This links KPI monitoring directly to agentic AI system actions.
 */
export interface AgentAction {
  actionId: string;
  agentId: string;
  timestamp: string;
  insightId?: string; // Linked to a specific insight that triggered the action
  actionType: 'budget_adjustment' | 'payment_initiation' | 'risk_mitigation' | 'data_correction' | 'alert_human' | 'system_config_update';
  targetSystem?: string; // e.g., 'PaymentRail', 'ERP', 'RiskEngine'
  details: Record<string, any>; // Specific parameters for the action, e.g., { metricId: 'discretionarySpending', adjustment: -500 }
  status: 'pending' | 'completed' | 'failed' | 'reverted';
  transactionId?: string; // If related to a payment or financial transaction
  auditTrail?: KpiEvent[]; // Events generated by this action
}

/**
 * Represents a simulated external data source for KPIs, such as a payment rail or ERP system.
 */
export interface KpiDataSource {
  id: string;
  name: string;
  type: 'API' | 'Database' | 'PaymentRail' | 'CRM' | 'Ledger';
  status: 'connected' | 'disconnected' | 'degraded';
  description?: string;
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
  externalDataSources?: KpiDataSource[];
  performanceMonitoringEnabled?: boolean;
  securityLoggingEnabled?: boolean;
  agentIntegrationEnabled?: boolean;
}

/**
 * Defines common parameters for fetching KPI data.
 */
export interface KpiFetchParams {
  kpiId: string;
  timeRange?: KpiUniverseConfig['defaultTimeRange'];
  granularity?: 'daily' | 'monthly' | 'yearly';
  comparisonPeriod?: 'none' | 'prev_period' | 'prev_year';
  customStartDate?: string;
  customEndDate?: string;
}

/**
 * Provides context for user authentication and authorization, linking to the digital identity system.
 */
export interface UserContext {
  userId: string;
  roles: string[]; // e.g., ['admin', 'finance_manager', 'kpi_viewer']
  isAuthenticated: boolean;
  permissions: Record<string, 'read' | 'write' | 'admin'>; // Resource-based permissions
}

/**
 * Custom error class for KPI data service operations.
 * Ensures consistent error handling and allows for specific error types.
 */
export class KpiDataServiceError extends Error {
  constructor(message: string, public code: string = 'KPI_SERVICE_ERROR') {
    super(message);
    this.name = 'KpiDataServiceError';
  }
}

/**
 * Data structure for the comprehensive response from KPI data queries,
 * including various analytical overlays.
 */
export interface KpiUniverseResponse {
  data: KpiDataPoint[];
  metrics: KpiMetricDefinition[];
  goals: KpiGoal[];
  anomalies: KpiAnomaly[];
  forecasts: KpiForecast[];
  insights: KpiInsight[];
  events: KpiEvent[]; // Added for observability and audit
  config: KpiUniverseConfig;
}

/**
 * Mock data for KPI definitions, simulating a repository of available metrics.
 */
export const _mockKpiDefinitions: Record<string, KpiMetricDefinition[]> = {
  'financial_overview': [
    { id: 'income', name: 'Total Income', type: 'currency', unit: '$', chartType: 'area', color: '#10b981', yAxisId: 'left', isForecastable: true, isGoal: true, isAnomalyDetectable: true, sourceSystem: 'ERP', aggregationMethod: 'sum' },
    { id: 'discretionarySpending', name: 'Discretionary Spending', type: 'currency', unit: '$', chartType: 'line', color: '#0ea5e9', yAxisId: 'left', isForecastable: true, isGoal: true, isAnomalyDetectable: true, sourceSystem: 'ERP', aggregationMethod: 'sum' },
    { id: 'incomeGrowth', name: 'Income Growth', type: 'percentage', unit: '%', chartType: 'line', color: '#f97316', yAxisId: 'right', isForecastable: true, isAnomalyDetectable: true, sourceSystem: 'ERP', aggregationMethod: 'average' },
    { id: 'savingsRate', name: 'Savings Rate', type: 'percentage', unit: '%', chartType: 'bar', color: '#8b5cf6', yAxisId: 'right', isForecastable: true, isGoal: true, isAnomalyDetectable: true, sourceSystem: 'ERP', aggregationMethod: 'average' },
    { id: 'netWorth', name: 'Net Worth', type: 'currency', unit: '$', chartType: 'line', color: '#ec4899', yAxisId: 'left', isForecastable: true, isGoal: true, isAnomalyDetectable: true, sourceSystem: 'Investments', aggregationMethod: 'latest' },
    { id: 'debtToIncomeRatio', name: 'Debt-to-Income Ratio', type: 'ratio', unit: '', chartType: 'line', color: '#ef4444', yAxisId: 'right', isForecastable: true, isGoal: true, isAnomalyDetectable: true, sourceSystem: 'CreditBureauAPI', aggregationMethod: 'latest' },
    { id: 'paymentVolume', name: 'Payment Volume', type: 'currency', unit: '$', chartType: 'area', color: '#3b82f6', yAxisId: 'left', isForecastable: true, isAnomalyDetectable: true, sourceSystem: 'PaymentRail', aggregationMethod: 'sum' },
    { id: 'transactionCount', name: 'Transaction Count', type: 'number', unit: 'transactions', chartType: 'bar', color: '#14b8a6', yAxisId: 'right', isForecastable: true, isAnomalyDetectable: true, sourceSystem: 'PaymentRail', aggregationMethod: 'count' },
    { id: 'fraudRate', name: 'Fraud Rate', type: 'percentage', unit: '%', chartType: 'line', color: '#f43f5e', yAxisId: 'right', isForecastable: true, isAnomalyDetectable: true, sourceSystem: 'RiskEngine', aggregationMethod: 'average' },
  ],
  'operational_efficiency': [
    { id: 'processCycleTime', name: 'Process Cycle Time', type: 'number', unit: 'days', chartType: 'bar', color: '#3b82f6', isGoal: true, isForecastable: true, isAnomalyDetectable: true, sourceSystem: 'Operations' },
    { id: 'defectRate', name: 'Defect Rate', type: 'percentage', unit: '%', chartType: 'line', color: '#ef4444', isGoal: true, isForecastable: true, isAnomalyDetectable: true, sourceSystem: 'QualityControl' },
    { id: 'employeeProductivity', name: 'Employee Productivity', type: 'number', unit: 'units/hr', chartType: 'area', color: '#059669', isGoal: true, isForecastable: true, isAnomalyDetectable: true, sourceSystem: 'HR' },
  ],
  'marketing_performance': [
    { id: 'conversionRate', name: 'Conversion Rate', type: 'percentage', unit: '%', chartType: 'line', color: '#fbbf24', isGoal: true, isForecastable: true, isAnomalyDetectable: true, sourceSystem: 'CRM' },
    { id: 'customerAcquisitionCost', name: 'Customer Acquisition Cost', type: 'currency', unit: '$', chartType: 'bar', color: '#eab308', isGoal: true, isForecastable: true, isAnomalyDetectable: true, sourceSystem: 'Marketing' },
    { id: 'websiteTraffic', name: 'Website Traffic', type: 'number', unit: 'visits', chartType: 'area', color: '#6366f1', isForecastable: true, isAnomalyDetectable: true, sourceSystem: 'GoogleAnalytics' },
  ],
};

/**
 * Mock data for KPI goals.
 */
export const _mockGoals: KpiGoal[] = [
  { goalId: 'goal-income-1', metricId: 'income', targetValue: 7000, startDate: '2024-01-01', endDate: '2024-12-31', status: 'in_progress', priority: 'high', description: 'Increase monthly income by 40% by year-end.' },
  { goalId: 'goal-spending-1', metricId: 'discretionarySpending', targetValue: 2000, startDate: '2024-01-01', endDate: '2024-12-31', status: 'at_risk', priority: 'medium', description: 'Keep discretionary spending below $2000.' },
  { goalId: 'goal-savings-1', metricId: 'savingsRate', targetValue: 20, startDate: '2024-06-01', endDate: '2024-12-31', status: 'in_progress', priority: 'high', description: 'Achieve 20% savings rate.' },
  { goalId: 'goal-fraud-1', metricId: 'fraudRate', targetValue: 0.1, startDate: '2024-01-01', endDate: '2024-12-31', status: 'in_progress', priority: 'critical', description: 'Maintain fraud rate below 0.1%.' },
];

/**
 * Mock data for KPI Universe configuration.
 */
export const _mockUniverseConfig: KpiUniverseConfig = {
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
    { id: 'erp-finance', name: 'ERP Finance', type: 'API', status: 'connected', description: 'Enterprise Resource Planning system for core financial data.' },
    { id: 'crm-sales', name: 'CRM Sales', type: 'Database', status: 'connected', description: 'Customer Relationship Management system for sales and marketing KPIs.' },
    { id: 'ga-web', name: 'Google Analytics', type: 'API', status: 'connected', description: 'Web analytics platform for website traffic and user behavior.' },
    { id: 'payment-rail-alpha', name: 'Alpha Payment Rail', type: 'PaymentRail', status: 'connected', description: 'Simulated real-time payment rail for transaction data.' },
    { id: 'risk-engine', name: 'Risk & Fraud Engine', type: 'Ledger', status: 'connected', description: 'Internal engine for real-time fraud detection and risk scoring.' },
  ],
  performanceMonitoringEnabled: true,
  securityLoggingEnabled: true,
  agentIntegrationEnabled: true,
};

/**
 * A centralized KPI Data Service managing the retrieval, simulation, and analytical processing of KPI data.
 * This service acts as the gateway to the KPI Universe, providing rich, real-time insights
 * crucial for operational excellence and strategic decision-making.
 */
export class KpiDataService {
  private kpiDefinitions: Record<string, KpiMetricDefinition[]>;
  private goals: KpiGoal[];
  private universeConfig: KpiUniverseConfig;
  private events: KpiEvent[]; // Internal store for audit events
  private anomalies: KpiAnomaly[]; // Internal store for detected anomalies
  private agentActions: AgentAction[]; // Internal store for agent actions

  /**
   * Constructs the KpiDataService.
   * @param initialKpiDefinitions Initial set of KPI definitions.
   * @param initialGoals Initial set of KPI goals.
   * @param initialConfig Initial KPI Universe configuration.
   */
  constructor(
    initialKpiDefinitions: Record<string, KpiMetricDefinition[]> = _mockKpiDefinitions,
    initialGoals: KpiGoal[] = _mockGoals,
    initialConfig: KpiUniverseConfig = _mockUniverseConfig
  ) {
    this.kpiDefinitions = initialKpiDefinitions;
    this.goals = initialGoals;
    this.universeConfig = initialConfig;
    this.events = [];
    this.anomalies = [];
    this.agentActions = [];
  }

  /**
   * Authenticates a user context. In a real system, this would interact with the Digital Identity service.
   * @param userId The ID of the user.
   * @param roles The roles assigned to the user.
   * @returns A simulated UserContext.
   */
  public async authenticateUser(userId: string, roles: string[] = []): Promise<UserContext> {
    // This is a simulation. In production, this would involve token validation,
    // public/private key verification, and integration with a centralized identity provider.
    // For now, we grant admin permissions if the user is 'admin', read for others.
    const permissions: Record<string, 'read' | 'write' | 'admin'> = {
      'kpi_data': 'read',
      'kpi_goals': 'read',
      'kpi_admin': 'read',
    };

    if (roles.includes('admin')) {
      permissions['kpi_data'] = 'admin';
      permissions['kpi_goals'] = 'admin';
      permissions['kpi_admin'] = 'admin';
    } else if (roles.includes('finance_manager')) {
      permissions['kpi_goals'] = 'write';
    }

    return {
      userId,
      roles,
      isAuthenticated: true,
      permissions,
    };
  }

  /**
   * Retrieves KPI definitions, optionally filtered by category and respecting user permissions.
   * @param category An optional category to filter KPI definitions.
   * @param userContext The authenticated user's context for authorization.
   * @returns A promise resolving to an array of KpiMetricDefinition.
   * @throws KpiDataServiceError if unauthorized.
   */
  public async getKpiDefinitions(category?: string, userContext?: UserContext): Promise<KpiMetricDefinition[]> {
    if (userContext && !userContext.permissions['kpi_data']) {
      throw new KpiDataServiceError('Unauthorized access to KPI definitions.', 'AUTH_ERROR');
    }

    await this._simulateLatency();
    const allDefinitions = Object.values(this.kpiDefinitions).flat();
    return category ? allDefinitions.filter(def => this.kpiDefinitions[category]?.some(k => k.id === def.id)) : allDefinitions;
  }

  /**
   * Fetches comprehensive KPI data including historical points, forecasts, anomalies, and insights.
   * This method simulates a sophisticated AI-driven backend, generating dynamic data based on input parameters.
   * It also simulates data from various sources including a "PaymentRail" for financial KPIs.
   * @param params Parameters for fetching KPI data (kpiId, timeRange, granularity, comparisonPeriod, custom dates).
   * @param userContext The authenticated user's context for authorization and personalization.
   * @returns A promise resolving to KpiUniverseResponse, containing all relevant KPI data and analytics.
   * @throws KpiDataServiceError if the requested KPI category is not found or unauthorized.
   */
  public async getKpiData(params: KpiFetchParams, userContext?: UserContext): Promise<KpiUniverseResponse> {
    if (userContext && !userContext.permissions['kpi_data']) {
      throw new KpiDataServiceError('Unauthorized access to KPI data.', 'AUTH_ERROR');
    }

    await this._simulateLatency();

    const { kpiId, timeRange = this.universeConfig.defaultTimeRange, granularity = 'monthly', comparisonPeriod = 'none', customStartDate, customEndDate } = params;

    const metricsToLoadCategory = Object.keys(this.kpiDefinitions).find(cat => this.kpiDefinitions[cat].some(m => m.id === kpiId));
    const metricsToLoad = metricsToLoadCategory ? this.kpiDefinitions[metricsToLoadCategory] : _mockKpiDefinitions['financial_overview']; // Default if kpiId is not found in a specific category

    if (!metricsToLoad) {
      throw new KpiDataServiceError(`KPI category for ID ${kpiId} not found.`, 'KPI_NOT_FOUND');
    }

    let startDate = new Date();
    let endDate = new Date();

    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    } else {
      switch (timeRange) {
        case '1m': startDate = subDays(new Date(), 30); break;
        case '3m': startDate = subDays(new Date(), 90); break;
        case '6m': startDate = subDays(new Date(), 180); break;
        case '1y': startDate = subDays(new Date(), 365); break;
        case 'ytd': startDate = startOfYear(new Date()); break;
        case 'all': startDate = subDays(new Date(), 5 * 365); break; // Simulate 5 years for 'all'
        case 'custom':
        default: startDate = subDays(new Date(), 365); break; // Default to 1 year
      }
      endDate = new Date();
    }

    // Adjust start/end to month/year boundaries for consistency, unless daily
    if (granularity === 'monthly') {
      startDate = startOfMonth(startDate);
      endDate = endOfMonth(endDate);
    } else if (granularity === 'yearly') {
      startDate = startOfYear(startDate);
      endDate = endOfYear(endDate);
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
        labelFormat = 'MMM yyyy';
        break;
      case 'yearly':
        timeIntervals = eachYearOfInterval({ start: startDate, end: endDate });
        labelFormat = 'yyyy';
        break;
    }

    const data: KpiDataPoint[] = timeIntervals.map((date, i) => {
      // Simulate base financial data
      const baseIncome = 5000 + (i * 150) + (Math.sin(i / 3) * 1000);
      const income = baseIncome + (Math.random() * 500);
      const discretionarySpending = (income * (0.4 + Math.random() * 0.25));
      const incomeGrowth = i > 0 ? ((income / (5000 + ((i - 1) * 150) + (Math.sin((i - 1) / 3) * 1000))) - 1) * 100 : 0;
      const savingsRate = ((income - discretionarySpending) / income) * 100 * (0.8 + Math.random() * 0.4);
      const netWorth = (baseIncome * i * 10) + (Math.random() * 10000);
      const debtToIncomeRatio = (0.3 + Math.random() * 0.2) * (1 + (i / 100));

      // Simulate payment rail data
      const paymentVolume = (baseIncome * 0.8) + (Math.random() * 1000) * 5;
      const transactionCount = Math.floor(paymentVolume / (50 + Math.random() * 100));
      const fraudRate = Math.max(0.01, Math.min(0.5, 0.05 + (Math.random() * 0.1 - 0.05) - (i * 0.001))); // Simulate slight improvement over time

      // Simulate operational data
      const processCycleTime = 10 - (i * 0.1) + (Math.random() * 2); // Decreasing
      const defectRate = 5 - (i * 0.05) + (Math.random() * 1); // Decreasing
      const employeeProductivity = 100 + (i * 0.5) + (Math.random() * 10); // Increasing

      // Simulate marketing data
      const conversionRate = 2 + (i * 0.05) + (Math.random() * 0.5); // Increasing
      const customerAcquisitionCost = 50 - (i * 0.2) + (Math.random() * 10); // Decreasing
      const websiteTraffic = 10000 + (i * 500) + (Math.random() * 2000); // Increasing

      const dataPoint: KpiDataPoint = {
        timestamp: date.toISOString(),
        periodLabel: format(date, labelFormat),
        income: parseFloat(income.toFixed(2)),
        discretionarySpending: parseFloat(discretionarySpending.toFixed(2)),
        incomeGrowth: parseFloat(incomeGrowth.toFixed(2)),
        savingsRate: parseFloat(Math.max(0, Math.min(100, savingsRate)).toFixed(2)),
        netWorth: parseFloat(netWorth.toFixed(2)),
        debtToIncomeRatio: parseFloat(debtToIncomeRatio.toFixed(2)),
        paymentVolume: parseFloat(paymentVolume.toFixed(2)),
        transactionCount: transactionCount,
        fraudRate: parseFloat(fraudRate.toFixed(2)),
        processCycleTime: parseFloat(processCycleTime.toFixed(2)),
        defectRate: parseFloat(defectRate.toFixed(2)),
        employeeProductivity: parseFloat(employeeProductivity.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        customerAcquisitionCost: parseFloat(customerAcquisitionCost.toFixed(2)),
        websiteTraffic: parseFloat(websiteTraffic.toFixed(2)),
        spendingExceededThreshold: (discretionarySpending / income) > 0.6,
      };

      // Apply comparison data simulation
      if (comparisonPeriod === 'prev_period' && i >= timeIntervals.length / 2) {
        // Simplified comparison for brevity; a real implementation would map correctly.
        const prevPeriodIndex = i - Math.floor(timeIntervals.length / 2);
        if (data[prevPeriodIndex]) {
          metricsToLoad.forEach(metric => {
            if (dataPoint[metric.id] !== undefined) {
              dataPoint[`${metric.id}_prev`] = data[prevPeriodIndex][metric.id] * (0.9 + Math.random() * 0.2);
            }
          });
        }
      }
      if (comparisonPeriod === 'prev_year') {
        // More complex logic for exact year comparison
        metricsToLoad.forEach(metric => {
          if (dataPoint[metric.id] !== undefined) {
            dataPoint[`${metric.id}_prev_year`] = dataPoint[metric.id] * (0.8 + Math.random() * 0.3);
          }
        });
      }

      return dataPoint;
    });

    // Simulate Forecasts
    const forecasts: KpiForecast[] = this.universeConfig.enableForecasting ? metricsToLoad
      .filter(m => m.isForecastable)
      .flatMap(metric => {
        const lastDataPoint = data.length > 0 ? data[data.length - 1] : undefined;
        if (!lastDataPoint || lastDataPoint[metric.id] === undefined) return [];

        const futurePoints: KpiForecast[] = [];
        for (let j = 1; j <= 3; j++) { // Forecast 3 periods into the future
          const futureDate = addDays(new Date(lastDataPoint.timestamp), j * (granularity === 'daily' ? 1 : granularity === 'monthly' ? 30 : 365));
          const predictedValue = lastDataPoint[metric.id] * (1 + (Math.random() * 0.05 - 0.02)); // Simple growth/decline
          futurePoints.push({
            forecastId: `${userContext?.userId || 'system'}-forecast-${metric.id}-${j}-${Date.now()}`,
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

    // Simulate Anomalies based on generated data
    const generatedAnomalies: KpiAnomaly[] = this.universeConfig.enableAnomalyDetection ? data.flatMap((dp, idx) => {
      const currentAnomalies: KpiAnomaly[] = [];

      // Anomaly for discretionary spending
      if (dp.spendingExceededThreshold) {
        const expected = dp.income * 0.5;
        currentAnomalies.push({
          anomalyId: `${userContext?.userId || 'system'}-anomaly-spending-${dp.timestamp}-${idx}-${Date.now()}`,
          metricId: 'discretionarySpending',
          timestamp: dp.timestamp,
          actualValue: dp.discretionarySpending,
          expectedValue: expected,
          deviation: dp.discretionarySpending - expected,
          severity: 'high',
          reason: 'Discretionary spending significantly above typical percentage of income.',
          actionTaken: 'Review budget categories or trigger agent to adjust budget.',
          resolved: false,
        });
      }

      // Anomaly for fraud rate spike (simulated)
      if (dp.fraudRate > 0.1) { // Example threshold
        const expectedFraudRate = _mockGoals.find(g => g.metricId === 'fraudRate')?.targetValue || 0.05;
        currentAnomalies.push({
          anomalyId: `${userContext?.userId || 'system'}-anomaly-fraud-${dp.timestamp}-${idx}-${Date.now()}`,
          metricId: 'fraudRate',
          timestamp: dp.timestamp,
          actualValue: dp.fraudRate,
          expectedValue: expectedFraudRate,
          deviation: dp.fraudRate - expectedFraudRate,
          severity: 'critical',
          reason: `Fraud rate (${(dp.fraudRate * 100).toFixed(2)}%) exceeded threshold.`,
          actionTaken: 'Trigger fraud detection agent to block suspicious transactions.',
          resolved: false,
        });
      }
      return currentAnomalies;
    }) : [];
    this.anomalies.push(...generatedAnomalies); // Add to internal store

    // Simulate AI Insights based on anomalies and trends
    const insights: KpiInsight[] = [];
    if (this.universeConfig.enableNLQ) {
      if (generatedAnomalies.length > 0) {
        const criticalAnomalies = generatedAnomalies.filter(a => a.severity === 'critical');
        if (criticalAnomalies.length > 0) {
          const firstCritical = criticalAnomalies[0];
          insights.push({
            insightId: `${userContext?.userId || 'system'}-ai-insight-critical-${Date.now()}`,
            timestamp: new Date().toISOString(),
            metricId: firstCritical.metricId,
            severity: 'critical',
            title: `Critical Anomaly Detected in ${firstCritical.metricId}`,
            description: `A critical anomaly was detected on ${format(new Date(firstCritical.timestamp), 'MMM d, yyyy')} with an actual value of ${firstCritical.actualValue} vs. expected ${firstCritical.expectedValue}. Reason: ${firstCritical.reason}`,
            recommendations: ['Immediately investigate root cause.', `Consider triggering automated remediation for ${firstCritical.metricId}.`],
            sourceAI: 'AnomalyDetectorAgent',
            actionable: true,
            potentialActions: [{
              actionId: `action-${Date.now()}`,
              agentId: 'AnomalyResponseAgent',
              timestamp: new Date().toISOString(),
              insightId: `${userContext?.userId || 'system'}-ai-insight-critical-${Date.now()}`,
              actionType: 'risk_mitigation',
              targetSystem: 'RiskEngine',
              details: { anomalyId: firstCritical.anomalyId, metricId: firstCritical.metricId, severity: firstCritical.severity, triggerAutomatedResponse: true },
              status: 'pending',
            }],
          });
        }
      }

      // General trend insight
      insights.push({
        insightId: `${userContext?.userId || 'system'}-ai-insight-trend-${Date.now()}`,
        timestamp: new Date().toISOString(),
        metricId: kpiId,
        severity: 'info',
        title: `${metricsToLoad[0]?.name} Trend Analysis`,
        description: `Your ${metricsToLoad[0]?.name} has shown a steady upward trend over the last year, indicating healthy financial progress. Consider reinvesting a portion of this growth.`,
        recommendations: ['Explore high-yield savings options.', 'Consult a financial advisor for investment strategies.'],
        sourceAI: 'TrendAnalyzerAgent',
        actionable: false,
      });
    }

    // Simulate initial events
    const generatedEvents: KpiEvent[] = [{
      eventId: `initial-load-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'system_update',
      description: `KPI data loaded for ${kpiId} by ${userContext?.userId || 'System'}.`,
      initiatorId: userContext?.userId || 'System',
      details: {
        kpiId,
        timeRange,
        granularity,
        comparisonPeriod,
      },
    }];
    if (generatedAnomalies.length > 0) {
      generatedEvents.push({
        eventId: `anomaly-report-${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'anomaly_detected',
        description: `Multiple anomalies detected during data generation for ${kpiId}.`,
        initiatorId: 'AnomalyDetectorAgent',
        details: { count: generatedAnomalies.length, firstAnomalyId: generatedAnomalies[0].anomalyId },
      });
    }
    this.events.push(...generatedEvents);

    return {
      data,
      metrics: metricsToLoad.filter(m => m.id === kpiId), // Return only relevant metrics for the query
      goals: this.goals.filter(g => metricsToLoad.some(m => m.id === g.metricId)),
      anomalies: generatedAnomalies,
      forecasts,
      insights,
      events: this.events.slice(-50), // Return a subset of recent events for observability
      config: this.universeConfig,
    };
  }

  /**
   * Creates a new KPI goal. Requires write permissions for KPI goals.
   * @param goal The KpiGoal to create.
   * @param userContext The authenticated user's context.
   * @returns A promise resolving to the created KpiGoal.
   * @throws KpiDataServiceError if unauthorized or goal invalid.
   */
  public async createKpiGoal(goal: KpiGoal, userContext: UserContext): Promise<KpiGoal> {
    if (!userContext.permissions['kpi_goals'] || userContext.permissions['kpi_goals'] === 'read') {
      throw new KpiDataServiceError('Unauthorized to create KPI goals.', 'AUTH_ERROR');
    }
    await this._simulateLatency();

    // Basic validation
    if (!goal.metricId || !this.getKpiDefinitions().some(d => d.id === goal.metricId)) {
      throw new KpiDataServiceError(`Metric ID ${goal.metricId} not found.`, 'INVALID_GOAL');
    }

    const newGoal: KpiGoal = {
      ...goal,
      goalId: `goal-${goal.metricId}-${Date.now()}`,
      ownerId: userContext.userId,
      lastUpdated: new Date().toISOString(),
    };
    this.goals.push(newGoal);

    this.events.push({
      eventId: `goal-created-${newGoal.goalId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'goal_set',
      description: `New KPI goal "${newGoal.description}" set for ${newGoal.metricId}.`,
      initiatorId: userContext.userId,
      details: { goalId: newGoal.goalId, metricId: newGoal.metricId, targetValue: newGoal.targetValue },
    });

    return newGoal;
  }

  /**
   * Records a detected anomaly into the system.
   * @param anomaly The KpiAnomaly to report.
   * @param userContext The authenticated user's context (can be an agent).
   * @returns A promise resolving to the reported KpiAnomaly.
   */
  public async reportAnomaly(anomaly: KpiAnomaly, userContext: UserContext): Promise<KpiAnomaly> {
    // For reporting, read permission is usually sufficient for users, agents might have specific 'report_anomaly' permission
    if (!userContext.permissions['kpi_data']) {
      throw new KpiDataServiceError('Unauthorized to report anomalies.', 'AUTH_ERROR');
    }
    await this._simulateLatency();

    const reportedAnomaly: KpiAnomaly = {
      ...anomaly,
      anomalyId: anomaly.anomalyId || `reported-anomaly-${anomaly.metricId}-${Date.now()}`,
    };
    this.anomalies.push(reportedAnomaly);

    this.events.push({
      eventId: `anomaly-reported-${reportedAnomaly.anomalyId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'anomaly_detected',
      description: `Anomaly reported for ${reportedAnomaly.metricId}: ${reportedAnomaly.reason}.`,
      initiatorId: userContext.userId,
      details: {
        anomalyId: reportedAnomaly.anomalyId,
        metricId: reportedAnomaly.metricId,
        severity: reportedAnomaly.severity,
        actualValue: reportedAnomaly.actualValue,
        expectedValue: reportedAnomaly.expectedValue,
      },
    });

    return reportedAnomaly;
  }

  /**
   * Records an action taken by an autonomous agent in response to insights or anomalies.
   * Crucial for agentic AI auditability and governance.
   * @param action The AgentAction performed.
   * @param userContext The authenticated agent's or user's context.
   * @returns A promise resolving to the recorded AgentAction.
   * @throws KpiDataServiceError if unauthorized.
   */
  public async recordAgentAction(action: AgentAction, userContext: UserContext): Promise<AgentAction> {
    if (!userContext.roles.includes('agent') && userContext.permissions['kpi_admin'] !== 'admin') {
      throw new KpiDataServiceError('Unauthorized to record agent actions.', 'AUTH_ERROR');
    }
    await this._simulateLatency();

    const recordedAction: AgentAction = {
      ...action,
      actionId: action.actionId || `agent-action-${action.agentId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.agentActions.push(recordedAction);

    this.events.push({
      eventId: `agent-action-${recordedAction.actionId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'agent_action',
      description: `Agent ${recordedAction.agentId} performed action "${recordedAction.actionType}" with status "${recordedAction.status}".`,
      initiatorId: recordedAction.agentId,
      details: {
        actionId: recordedAction.actionId,
        actionType: recordedAction.actionType,
        targetSystem: recordedAction.targetSystem,
        insightId: recordedAction.insightId,
        status: recordedAction.status,
        ...recordedAction.details,
      },
      securityContext: {
        // In a real system, agent actions would be cryptographically signed
        signature: `simulated_signature_by_${recordedAction.agentId}`,
        publicKey: `simulated_public_key_for_${recordedAction.agentId}`,
      },
    });

    return recordedAction;
  }

  /**
   * Retrieves a history of KPI-related events, filtered by metric ID and respecting permissions.
   * Provides auditability and a timeline of critical changes and interventions.
   * @param metricId Optional metric ID to filter events.
   * @param userContext The authenticated user's context.
   * @returns A promise resolving to an array of KpiEvent.
   * @throws KpiDataServiceError if unauthorized.
   */
  public async getKpiEvents(metricId?: string, userContext?: UserContext): Promise<KpiEvent[]> {
    if (userContext && !userContext.permissions['kpi_admin'] && !userContext.permissions['kpi_data']) {
      throw new KpiDataServiceError('Unauthorized access to KPI events.', 'AUTH_ERROR');
    }
    await this._simulateLatency();

    let filteredEvents = this.events;
    if (metricId) {
      filteredEvents = filteredEvents.filter(event => event.metricId === metricId || event.details?.metricId === metricId);
    }
    return filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Simulates a "real-time" update for a specific KPI, adding a new data point and potential new analytics.
   * This method demonstrates the continuous flow of data vital for real-time payment infrastructures.
   * @param metricId The ID of the KPI to update.
   * @param value The new value for the KPI.
   * @param userContext The context of the initiator (e.g., system or specific agent).
   * @returns A promise resolving to a KpiDataPoint, possibly with new anomalies/insights.
   * @throws KpiDataServiceError if the metric does not exist.
   */
  public async simulateRealtimeUpdate(metricId: string, value: number, userContext?: UserContext): Promise<KpiDataPoint> {
    await this._simulateLatency();

    const metricDef = this.getKpiDefinitions().find(m => m.id === metricId);
    if (!metricDef) {
      throw new KpiDataServiceError(`Metric ID ${metricId} not found for real-time update.`, 'METRIC_NOT_FOUND');
    }

    const timestamp = new Date().toISOString();
    const periodLabel = format(new Date(), 'MMM d, HH:mm');

    const newPoint: KpiDataPoint = {
      timestamp,
      periodLabel,
      [metricId]: value,
    };

    // Simulate basic anomaly detection for the new point
    if (metricDef.isAnomalyDetectable) {
      // Very simple anomaly check: if value deviates significantly from recent average
      const recentDataPoints = (await this.getKpiData({ kpiId: metricId, timeRange: '1m', granularity: 'daily' }, userContext)).data;
      const recentValues = recentDataPoints.map(dp => dp[metricId] as number).filter(v => typeof v === 'number');
      if (recentValues.length > 0) {
        const average = recentValues.reduce((sum, v) => sum + v, 0) / recentValues.length;
        if (Math.abs(value - average) / average > 0.20) { // 20% deviation
          const anomaly: KpiAnomaly = {
            anomalyId: `rt-anomaly-${metricId}-${Date.now()}`,
            metricId,
            timestamp,
            actualValue: value,
            expectedValue: average,
            deviation: value - average,
            severity: 'medium',
            reason: `Real-time value (${value}) for ${metricId} deviated significantly from recent average (${average.toFixed(2)}).`,
            resolved: false,
          };
          this.anomalies.push(anomaly);
          this.events.push({
            eventId: `rt-anomaly-event-${anomaly.anomalyId}-${Date.now()}`,
            timestamp,
            eventType: 'anomaly_detected',
            description: `Real-time anomaly detected for ${metricId}.`,
            initiatorId: 'RealtimeMonitorAgent',
            details: { anomalyId: anomaly.anomalyId, metricId, value, expected: average },
          });
        }
      }
    }

    this.events.push({
      eventId: `rt-data-change-${metricId}-${Date.now()}`,
      timestamp,
      eventType: 'data_change',
      description: `Real-time update for ${metricId} to value ${value}.`,
      initiatorId: userContext?.userId || 'RealtimeDataSource',
      details: { metricId, newValue: value },
    });

    return newPoint;
  }

  /**
   * Internal utility to simulate network latency for API calls.
   */
  private async _simulateLatency(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 300));
  }
}

/**
 * Exports a default instance of the KpiDataService for immediate use across the application.
 * This simplifies module imports and ensures a singleton-like behavior for the mock data layer.
 * In a production environment, this might be managed via dependency injection.
 */
export const kpiDataService = new KpiDataService();