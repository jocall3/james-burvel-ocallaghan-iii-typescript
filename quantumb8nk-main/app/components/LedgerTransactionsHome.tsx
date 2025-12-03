// Copyright James Burvel O’Callaghan III
// President CDBI (Cognitive Data-driven Banking Innovations)

import React, { useState, useEffect, useCallback } from "react";
import ListView from "~/app/components/ListView";
import {
  getLedgerTransactionSearchComponents,
  mapLedgerTransactionQueryToVariables,
} from "~/common/search_components/ledgerTransactionSearchComponents";
import { LedgerTransactionsHomeDocument } from "~/generated/dashboard/graphqlSchema";
import { LEDGER_TRANSACTION } from "~/generated/dashboard/types/resources";
import LedgerTransactionsEmptyState from "~/app/containers/LedgerTransactionsEmptyState";
import { ExportDataParams } from "~/app/components/ExportDataButton";

// --- New AI-powered Enhancements for CDBI ---

/**
 * @typedef {Object} AICDBITransaction
 * @property {string} id - Unique identifier for the transaction.
 * @property {string} amount - The transaction amount.
 * @property {string} currency - The currency of the transaction.
 * @property {string} description - A human-readable description of the transaction.
 * @property {string} status - Current status of the transaction (e.g., 'posted', 'pending', 'void').
 * @property {Date} effectiveDate - The date the transaction took effect.
 * @property {string} [metadata] - AI-generated metadata or tags.
 * @property {string} [aiCategory] - AI-predicted category for the transaction.
 * @property {number} [aiAnomalyScore] - A score indicating the likelihood of the transaction being an anomaly (0-1).
 * @property {string} [aiSentiment] - AI-determined sentiment of the transaction description (e.g., 'positive', 'neutral', 'negative').
 */
export interface AICDBITransaction {
  id: string;
  amount: string;
  currency: string;
  description: string;
  status: string;
  effectiveDate: Date;
  metadata?: string;
  aiCategory?: string;
  aiAnomalyScore?: number;
  aiSentiment?: string;
}

/**
 * @typedef {Object} KPI
 * @property {string} name - The name of the Key Performance Indicator.
 * @property {string} value - The current value of the KPI.
 * @property {string} unit - The unit of the KPI (e.g., '%', '$', 'count').
 * @property {string} trend - A description or indicator of the trend (e.g., 'up', 'down', 'stable').
 * @property {string} description - A detailed explanation of what the KPI measures.
 * @property {string} [geminiPrompt] - A suggested prompt to get more insights from Gemini about this KPI.
 */
export interface KPI {
  name: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable' | 'N/A';
  description: string;
  geminiPrompt?: string;
}

/**
 * @typedef {Object} ChartData
 * @property {string} id - Unique identifier for the chart.
 * @property {string} title - Title of the chart.
 * @property {string} type - Type of chart (e.g., 'line', 'bar', 'pie').
 * @property {any[]} data - Data points for the chart.
 * @property {any} [options] - Chart options (e.g., axis labels, colors).
 * @property {string} [geminiPrompt] - A suggested prompt to get more insights from Gemini about this chart's data.
 */
export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar';
  data: any[]; // In a real app, this would be more specific, e.g., { labels: string[], datasets: any[] }
  options?: any;
  geminiPrompt?: string;
}

/**
 * Interface for AI service response for transaction analysis.
 */
export interface AITransactionAnalysisResponse {
  insights: {
    totalTransactionsAnalyzed: number;
    averageAnomalyScore: number;
    topAnomalousTransactions: AICDBITransaction[];
    categoryDistribution: { [category: string]: number };
    sentimentDistribution: { positive: number; neutral: number; negative: number };
  };
  kpis: KPI[];
  charts: ChartData[];
}

/**
 * Interface for AI service response for financial forecasting.
 */
export interface AIForecastingResponse {
  forecastedTransactions: AICDBITransaction[];
  forecastSummary: string;
  liquidityOutlook: 'favorable' | 'moderate' | 'constrained';
  kpis: KPI[];
  charts: ChartData[];
}

/**
 * Interface for AI service response for smart reconciliation.
 */
export interface AISmartReconciliationResponse {
  unmatchedTransactions: AICDBITransaction[];
  suggestedMatches: { transactionId1: string; transactionId2: string; confidence: number }[];
  discrepancies: { transactionId: string; issue: string }[];
  kpis: KPI[];
  charts: ChartData[];
}

/**
 * Interface for AI service response for compliance and risk assessment.
 */
export interface AIComplianceRiskResponse {
  highRiskTransactions: AICDBITransaction[];
  flaggedRules: string[];
  riskScore: number; // 0-100
  complianceSummary: string;
  kpis: KPI[];
  charts: ChartData[];
}

/**
 * A mock AI service API client for CDBI. In a real application, this would
 * interact with a robust backend AI API (e.g., powered by Google Gemini).
 */
export const cdbiAIApi = {
  /**
   * Simulates fetching AI-powered transaction analysis for a given ledger.
   * @param ledgerId The ID of the ledger to analyze.
   * @returns A promise that resolves to AITransactionAnalysisResponse.
   */
  async getTransactionAnalysis(ledgerId: string): Promise<AITransactionAnalysisResponse> {
    console.log(`CDBI AI: Analyzing ledger transactions for ${ledgerId} with Gemini-powered insights...`);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockTransactions: AICDBITransaction[] = [
      { id: 'tx_123', amount: '100.00', currency: 'USD', description: 'Payment for cloud services', status: 'posted', effectiveDate: new Date(), aiCategory: 'IT Expenses', aiAnomalyScore: 0.1, aiSentiment: 'neutral' },
      { id: 'tx_124', amount: '-50.00', currency: 'USD', description: 'Refund for defective product', status: 'posted', effectiveDate: new Date(), aiCategory: 'Returns', aiAnomalyScore: 0.85, aiSentiment: 'negative' }, // High anomaly for refund
      { id: 'tx_125', amount: '1200.00', currency: 'USD', description: 'Invoice payment from ACME Corp', status: 'posted', effectiveDate: new Date(), aiCategory: 'Revenue', aiAnomalyScore: 0.05, aiSentiment: 'positive' },
      { id: 'tx_126', amount: '-25000.00', currency: 'USD', description: 'Large software license renewal', status: 'pending', effectiveDate: new Date(), aiCategory: 'Software Licenses', aiAnomalyScore: 0.6, aiSentiment: 'neutral' }, // Potentially anomalous due to size
      { id: 'tx_127', amount: '75.00', currency: 'USD', description: 'Office supplies purchase', status: 'posted', effectiveDate: new Date(), aiCategory: 'Office Supplies', aiAnomalyScore: 0.02, aiSentiment: 'positive' },
    ];

    return {
      insights: {
        totalTransactionsAnalyzed: mockTransactions.length,
        averageAnomalyScore: parseFloat((mockTransactions.reduce((acc, t) => acc + (t.aiAnomalyScore || 0), 0) / mockTransactions.length).toFixed(2)),
        topAnomalousTransactions: mockTransactions.filter(t => (t.aiAnomalyScore || 0) > 0.5).sort((a, b) => (b.aiAnomalyScore || 0) - (a.aiAnomalyScore || 0)),
        categoryDistribution: { 'IT Expenses': 1, 'Returns': 1, 'Revenue': 1, 'Software Licenses': 1, 'Office Supplies': 1 },
        sentimentDistribution: { positive: 2, neutral: 2, negative: 1 },
      },
      kpis: [
        { name: 'Avg. Anomaly Score', value: '0.38', unit: '', trend: 'up', description: 'Average AI-driven anomaly score across all transactions in this ledger. A higher score indicates more unusual activity.', geminiPrompt: 'Explain current anomaly trends in ledger ${ledgerId}.' },
        { name: 'High-Risk Transactions', value: '2', unit: 'count', trend: 'up', description: 'Number of transactions flagged by AI as potentially high-risk.', geminiPrompt: 'Summarize the risk factors for the 2 high-risk transactions.' },
        { name: 'Transaction Sentiment', value: 'Positive: 40%', unit: '', trend: 'stable', description: 'Distribution of AI-analyzed sentiment from transaction descriptions.', geminiPrompt: 'Analyze sentiment trends for transactions over the last quarter.' },
      ],
      charts: [
        {
          id: 'anomaly-score-distribution',
          title: 'AI Anomaly Score Distribution',
          type: 'bar',
          data: [{ label: '0-0.2', value: 2 }, { label: '0.2-0.4', value: 1 }, { label: '0.4-0.6', value: 1 }, { label: '0.6-0.8', value: 0 }, { label: '0.8-1.0', value: 1 }],
          options: { scales: { y: { beginAtZero: true } } },
          geminiPrompt: 'Generate a detailed report on transactions with anomaly scores above 0.7.'
        },
        {
          id: 'transaction-category-breakdown',
          title: 'AI Transaction Category Breakdown',
          type: 'pie',
          data: [{ label: 'IT Expenses', value: 1 }, { label: 'Returns', value: 1 }, { label: 'Revenue', value: 1 }, { label: 'Software Licenses', value: 1 }, { label: 'Office Supplies', value: 1 }],
          options: {},
          geminiPrompt: 'Identify the largest expense categories and suggest cost-saving opportunities.'
        }
      ]
    };
  },

  /**
   * Simulates fetching AI-powered financial forecasts.
   * @param ledgerId The ID of the ledger for forecasting.
   * @param period The forecasting period (e.g., '3 months', '6 months').
   * @returns A promise that resolves to AIForecastingResponse.
   */
  async getFinancialForecast(ledgerId: string, period: string = '3 months'): Promise<AIForecastingResponse> {
    console.log(`CDBI AI: Generating financial forecast for ${ledgerId} for ${period} with Gemini-powered predictions...`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      forecastedTransactions: [
        { id: 'fc_001', amount: '1500.00', currency: 'USD', description: 'Predicted revenue from key client', status: 'forecasted', effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), aiCategory: 'Predicted Revenue' },
        { id: 'fc_002', amount: '-800.00', currency: 'USD', description: 'Expected payroll expense', status: 'forecasted', effectiveDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), aiCategory: 'Predicted Expenses' },
      ],
      forecastSummary: `AI predicts a stable financial outlook for the next ${period}, with a slight increase in revenue and manageable expenses.`,
      liquidityOutlook: 'favorable',
      kpis: [
        { name: 'Predicted Net Flow (3M)', value: '+ $50,000', unit: 'USD', trend: 'up', description: 'AI-predicted net cash flow over the next 3 months.', geminiPrompt: 'Breakdown predicted net flow by major income and expense categories for ${ledgerId}.' },
        { name: 'Liquidity Confidence', value: 'High', unit: '', trend: 'stable', description: 'AI assessment of liquidity risk.', geminiPrompt: 'What are the main factors contributing to the high liquidity confidence?' },
      ],
      charts: [
        {
          id: 'cash-flow-forecast',
          title: 'AI Cash Flow Forecast (Next 3 Months)',
          type: 'line',
          data: [
            { month: 'Current', value: 100000 },
            { month: 'Month 1', value: 105000 },
            { month: 'Month 2', value: 112000 },
            { month: 'Month 3', value: 118000 }
          ],
          options: { scales: { y: { beginAtZero: false } } },
          geminiPrompt: 'Detail the potential events that could impact this cash flow forecast negatively.'
        }
      ]
    };
  },

  /**
   * Simulates AI-powered smart reconciliation.
   * @param ledgerId The ID of the ledger for reconciliation.
   * @param transactions A list of transactions to reconcile.
   * @returns A promise that resolves to AISmartReconciliationResponse.
   */
  async getSmartReconciliation(ledgerId: string, transactions: AICDBITransaction[]): Promise<AISmartReconciliationResponse> {
    console.log(`CDBI AI: Performing smart reconciliation for ${ledgerId} with Gemini-powered matching logic...`);
    await new Promise(resolve => setTimeout(resolve, 1800));

    return {
      unmatchedTransactions: transactions.filter(t => t.id === 'tx_124'), // Simulate one unmatched
      suggestedMatches: [
        { transactionId1: 'tx_123', transactionId2: 'bank_stmt_456', confidence: 0.95 },
      ],
      discrepancies: [
        { transactionId: 'tx_126', issue: 'Large amount mismatch with expected vendor payment.' },
      ],
      kpis: [
        { name: 'Auto-Match Rate', value: '85%', unit: '', trend: 'up', description: 'Percentage of transactions automatically matched by AI.', geminiPrompt: 'What factors prevent a 100% auto-match rate for ${ledgerId}?' },
        { name: 'Discrepancies Found', value: '1', unit: 'count', trend: 'stable', description: 'Number of discrepancies identified by AI.', geminiPrompt: 'Explain the details of the identified discrepancy.' },
      ],
      charts: [
        {
          id: 'reconciliation-status',
          title: 'AI Reconciliation Status',
          type: 'doughnut',
          data: [
            { label: 'Matched', value: 85 },
            { label: 'Unmatched', value: 10 },
            { label: 'Discrepancy', value: 5 }
          ],
          options: {},
          geminiPrompt: 'Provide actionable steps to reduce the number of unmatched transactions.'
        }
      ]
    };
  },

  /**
   * Simulates AI-powered compliance and risk assessment.
   * @param ledgerId The ID of the ledger to assess.
   * @param transactions A list of transactions for assessment.
   * @returns A promise that resolves to AIComplianceRiskResponse.
   */
  async getComplianceRiskAssessment(ledgerId: string, transactions: AICDBITransaction[]): Promise<AIComplianceRiskResponse> {
    console.log(`CDBI AI: Conducting compliance and risk assessment for ${ledgerId} with Gemini-powered risk models...`);
    await new Promise(resolve => setTimeout(resolve, 2200));

    return {
      highRiskTransactions: transactions.filter(t => (t.aiAnomalyScore || 0) > 0.5),
      flaggedRules: ['AML_RULE_001_LargeCashTransaction', 'FRAUD_DETECTION_003_UnusualRefundPattern'],
      riskScore: 75, // Out of 100
      complianceSummary: 'Several transactions flagged for further review due to potential AML and fraud risks. Overall compliance posture requires attention.',
      kpis: [
        { name: 'Overall Risk Score', value: '75', unit: '/100', trend: 'up', description: 'Aggregate AI-driven risk score for the ledger. Higher score means higher risk.', geminiPrompt: 'What are the top 3 contributing factors to the current risk score in ${ledgerId}?' },
        { name: 'Flagged Transactions', value: '2', unit: 'count', trend: 'up', description: 'Number of transactions identified by AI as potential compliance violations or fraud.', geminiPrompt: 'Provide a deep dive into the most critical flagged transaction.' },
      ],
      charts: [
        {
          id: 'risk-category-breakdown',
          title: 'AI Risk Category Breakdown',
          type: 'pie',
          data: [
            { label: 'AML', value: 40 },
            { label: 'Fraud', value: 30 },
            { label: 'Operational', value: 20 },
            { label: 'Compliance', value: 10 }
          ],
          options: {},
          geminiPrompt: 'Suggest mitigation strategies for the highest risk categories identified.'
        }
      ]
    };
  }
};

/**
 * A generic loading spinner component.
 */
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cdbi-blue"></div>
    <span className="ml-3 text-gray-600">Loading AI Insights...</span>
  </div>
);

/**
 * A placeholder for a chart rendering component.
 * In a real app, this would use a charting library like Chart.js or D3.
 * @param {ChartData} chart - The chart data.
 * @param {string} ledgerId - The ledger ID for Gemini prompts.
 */
const CDBIChartRenderer: React.FC<{ chart: ChartData; ledgerId: string }> = ({ chart, ledgerId }) => {
  // This is a placeholder. In a real application, you would render actual charts
  // using a library like Chart.js, Recharts, or Nivo.
  // The 'data' and 'options' properties are structured to be compatible with Chart.js.
  const geminiPromptWithId = chart.geminiPrompt ? chart.geminiPrompt.replace('${ledgerId}', ledgerId) : '';

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm bg-white">
      <h3 className="font-semibold text-lg mb-2 text-cdbi-text">{chart.title}</h3>
      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-md">
        <p className="text-gray-400 text-sm">
          [{chart.type.toUpperCase()} Chart Placeholder]<br />
          Data points: {JSON.stringify(chart.data)}
        </p>
      </div>
      {geminiPromptWithId && (
        <p className="mt-3 text-xs text-gray-500 italic">
          💡 Gemini Suggestion: "{geminiPromptWithId}"
        </p>
      )}
    </div>
  );
};


/**
 * The AI-powered insights panel for CDBI Ledger Transactions.
 * Displays various AI analyses, KPIs, and charts.
 * This component is self-contained and communicates with the mock AI API.
 */
export const AIBankInsightsPanel: React.FC<{ ledgerId: string }> = ({ ledgerId }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'forecast' | 'reconciliation' | 'risk'>('analysis');
  const [analysisData, setAnalysisData] = useState<AITransactionAnalysisResponse | null>(null);
  const [forecastData, setForecastData] = useState<AIForecastingResponse | null>(null);
  const [reconciliationData, setReconciliationData] = useState<AISmartReconciliationResponse | null>(null);
  const [riskData, setRiskData] = useState<AIComplianceRiskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // For demonstration, we'll fetch all on initial load. In a real app,
      // you might fetch on tab change for efficiency.
      const analysis = await cdbiAIApi.getTransactionAnalysis(ledgerId);
      setAnalysisData(analysis);

      const forecast = await cdbiAIApi.getFinancialForecast(ledgerId);
      setForecastData(forecast);

      // For reconciliation and risk, we'd need actual transaction data.
      // Mocking some AICDBITransaction data based on analysis output for consistency.
      const mockTransactionsForReconRisk: AICDBITransaction[] = analysis.insights.topAnomalousTransactions.concat([
        { id: 'tx_128', amount: '300.00', currency: 'USD', description: 'Vendor payment', status: 'posted', effectiveDate: new Date(), aiCategory: 'Expenses' },
      ]);
      const reconciliation = await cdbiAIApi.getSmartReconciliation(ledgerId, mockTransactionsForReconRisk);
      setReconciliationData(reconciliation);

      const risk = await cdbiAIApi.getComplianceRiskAssessment(ledgerId, mockTransactionsForReconRisk);
      setRiskData(risk);

    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
      setError("Failed to load AI insights. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [ledgerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderKPIs = (kpis: KPI[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {kpis.map((kpi, index) => {
        const geminiPromptWithId = kpi.geminiPrompt ? kpi.geminiPrompt.replace('${ledgerId}', ledgerId) : '';
        return (
          <div key={index} className="bg-cdbi-light-blue p-4 rounded-lg shadow-md border border-cdbi-blue-light flex flex-col justify-between">
            <div>
              <h4 className="font-medium text-cdbi-text text-sm mb-1">{kpi.name}</h4>
              <p className="text-3xl font-bold text-cdbi-blue-dark">{kpi.value} <span className="text-base font-normal text-cdbi-text">{kpi.unit}</span></p>
              <p className={`text-sm mt-1 ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                {kpi.trend === 'up' && '▲ '}
                {kpi.trend === 'down' && '▼ '}
                {kpi.trend === 'stable' && '● '}
                {kpi.description}
              </p>
            </div>
            {geminiPromptWithId && (
              <p className="mt-3 text-xs text-gray-500 italic">
                💡 Gemini Suggestion: "{geminiPromptWithId}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderCharts = (charts: ChartData[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {charts.map((chart, index) => (
        <CDBIChartRenderer key={index} chart={chart} ledgerId={ledgerId} />
      ))}
    </div>
  );

  return (
    <div className="bg-cdbi-bg p-6 rounded-lg shadow-xl mb-8 border border-cdbi-border">
      <h2 className="text-3xl font-extrabold text-cdbi-blue-dark mb-6">AI-Powered Ledger Insights <span className="text-cdbi-blue-light text-xl">from CDBI AI</span></h2>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg ${activeTab === 'analysis' ? 'border-cdbi-blue text-cdbi-blue-dark' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Transaction Analysis
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg ${activeTab === 'forecast' ? 'border-cdbi-blue text-cdbi-blue-dark' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Financial Forecasting
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg ${activeTab === 'reconciliation' ? 'border-cdbi-blue text-cdbi-blue-dark' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Smart Reconciliation
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg ${activeTab === 'risk' ? 'border-cdbi-blue text-cdbi-blue-dark' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Compliance & Risk
          </button>
        </nav>
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="text-red-600 p-4 bg-red-50 rounded-md">{error}</div>}

      {!loading && !error && (
        <div className="ai-content">
          {activeTab === 'analysis' && analysisData && (
            <div>
              <h3 className="text-2xl font-semibold text-cdbi-text mb-4">AI Transaction Overview</h3>
              {renderKPIs(analysisData.kpis)}
              <h3 className="text-2xl font-semibold text-cdbi-text mb-4 mt-6">AI Transaction Visuals</h3>
              {renderCharts(analysisData.charts)}
              <div className="mt-8 p-4 bg-cdbi-light-bg rounded-lg">
                <h4 className="font-semibold text-cdbi-text">Key Insights from Gemini:</h4>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Total transactions analyzed: {analysisData.insights.totalTransactionsAnalyzed}</li>
                  <li>Average AI Anomaly Score: {analysisData.insights.averageAnomalyScore}</li>
                  <li>Top anomalous transactions: {analysisData.insights.topAnomalousTransactions.map(t => t.id).join(', ')}</li>
                  <li>Category Distribution: {JSON.stringify(analysisData.insights.categoryDistribution)}</li>
                  <li>Sentiment Distribution: Positive {analysisData.insights.sentimentDistribution.positive}, Neutral {analysisData.insights.sentimentDistribution.neutral}, Negative {analysisData.insights.sentimentDistribution.negative}</li>
                </ul>
                <p className="mt-4 text-sm text-gray-600 italic">
                  *These insights are generated by CDBI AI, powered by a large language model like Gemini, to help identify patterns and anomalies.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'forecast' && forecastData && (
            <div>
              <h3 className="text-2xl font-semibold text-cdbi-text mb-4">AI Financial Forecast</h3>
              {renderKPIs(forecastData.kpis)}
              <h3 className="text-2xl font-semibold text-cdbi-text mb-4 mt-6">AI Forecast Visuals</h3>
              {renderCharts(forecastData.charts)}
              <div className="mt-8 p-4 bg-cdbi-light-bg rounded-lg">
                <h4 className="font-semibold text-cdbi-text">Gemini Forecast Summary:</h4>
                <p className="text-gray-700">{forecastData.forecastSummary}</p>
                <p className="mt-2 text-gray-700">Liquidity Outlook: <span className={`font-semibold ${forecastData.liquidityOutlook === 'favorable' ? 'text-green-600' : forecastData.liquidityOutlook === 'constrained' ? 'text-red-600' : 'text-orange-500'}`}>{forecastData.liquidityOutlook.toUpperCase()}</span></p>
                <p className="mt-4 text-sm text-gray-600 italic">
                  *CDBI AI provides forward-looking financial predictions based on historical data and market trends, powered by Gemini.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reconciliation' && reconciliationData && (
            <div>
              <h3 className="text-2xl font-semibold text-cdbi-text mb-4">AI Smart Reconciliation</h3>
              {renderKPIs(reconciliationData.kpis)}
              <h3 className="text-2xl font-semibold text-cdbi-text mb-4 mt-6">AI Reconciliation Visuals</h3>
              {renderCharts(reconciliationData.charts)}
              <div className="mt-8 p-4 bg-cdbi-light-bg rounded-lg">
                <h4 className="font-semibold text-cdbi-text">Gemini Reconciliation Insights:</h4>
                {reconciliationData.unmatchedTransactions.length > 0 && (
                  <p className="text-red-700">Unmatched Transactions: {reconciliationData.unmatchedTransactions.map(t => t.id).join(', ')}</p>
                )}
                {reconciliationData.discrepancies.length > 0 && (
                  <ul className="list-disc pl-5 text-red-700">
                    Discrepancies:
                    {reconciliationData.discrepancies.map((d, i) => (
                      <li key={i}>Transaction {d.transactionId}: {d.issue}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-gray-700">Suggested Matches count: {reconciliationData.suggestedMatches.length}</p>
                <p className="mt-4 text-sm text-gray-600 italic">
                  *CDBI AI leverages Gemini to intelligently match transactions and identify reconciliation discrepancies, streamlining your accounting process.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'risk' && riskData && (
            <div>
              <h3 className="text-2xl font-semibold text-cdbi-text mb-4">AI Compliance & Risk Assessment</h3>
              {renderKPIs(riskData.kpis)}
              <h3 className="text-2xl font-semibold text-cdbi-text mb-4 mt-6">AI Risk Visuals</h3>
              {renderCharts(riskData.charts)}
              <div className="mt-8 p-4 bg-cdbi-light-bg rounded-lg">
                <h4 className="font-semibold text-cdbi-text">Gemini Risk Summary:</h4>
                <p className="text-gray-700">{riskData.complianceSummary}</p>
                {riskData.highRiskTransactions.length > 0 && (
                  <p className="mt-2 text-red-700">High-Risk Transactions: {riskData.highRiskTransactions.map(t => t.id).join(', ')}</p>
                )}
                {riskData.flaggedRules.length > 0 && (
                  <p className="mt-2 text-red-700">Flagged Rules: {riskData.flaggedRules.join(', ')}</p>
                )}
                <p className="mt-4 text-sm text-gray-600 italic">
                  *CDBI AI continuously monitors transactions for potential compliance violations and fraud indicators, providing real-time risk assessments powered by Gemini.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- End New AI-powered Enhancements for CDBI ---


const STYLE_MAPPING = {
  prettyStatus: "max-w-20",
  // Add new AI-specific styles if needed, e.g., for AI anomaly score display
  aiAnomalyScore: "text-right font-mono",
  aiCategory: "font-semibold text-cdbi-blue-dark",
};

const CONSTANT_QUERY_PARAMS = ["tab"];

/**
 * Extends the existing LedgerTransactionsHome with AI capabilities.
 * Now includes the AI-powered insights panel.
 */
function LedgerTransactionsHome({
  ledgerId,
  initialShowSearchArea,
  onClickLedgerAccountLink,
}: {
  ledgerId: string;
  initialShowSearchArea: boolean;
  onClickLedgerAccountLink: () => void;
}) {
  const searchComponents = getLedgerTransactionSearchComponents();

  const editRow = (ids: string[]) => {
    if (ids.length > 0) {
      window.location.href = `/ledger_transactions/${ids[0]}/edit`;
    }

    return false;
  };

  const ACTIONS = {
    Edit: (_actionName, ids: string[]) => editRow(ids),
    // AI-driven Action Example: Analyze Selected Transactions
    // In a real app, this would send selected transaction IDs to the AI service
    // for a deeper, on-demand analysis.
    "AI Analyze": (_actionName, ids: string[]) => {
      alert(`CDBI AI: Sending ${ids.length} transactions for deep AI analysis!`);
      // Simulate calling an AI API endpoint with selected IDs
      // cdbiAIApi.analyzeSelectedTransactions(ledgerId, ids).then(results => {
      //   console.log("Deep AI analysis results:", results);
      //   // Potentially show a modal or redirect to a detailed analysis page
      // });
      return true;
    },
    // AI-driven Action Example: Auto-Categorize Selected Transactions
    "AI Auto-Categorize": (_actionName, ids: string[]) => {
      alert(`CDBI AI: Auto-categorizing ${ids.length} transactions...`);
      // cdbiAIApi.autoCategorizeTransactions(ledgerId, ids).then(updated => {
      //   console.log("Auto-categorized transactions:", updated);
      //   // Refresh the list view or show a notification
      // });
      return true;
    }
  };

  const exportDataParams: ExportDataParams = {
    params: { ledger_id: ledgerId },
  };

  return (
    <div className="bg-cdbi-bg min-h-screen p-8 font-sans text-cdbi-text">
      {/* CDBI AI Insights Panel */}
      <AIBankInsightsPanel ledgerId={ledgerId} />

      {/* Original ListView for transactions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-xl border border-cdbi-border">
        <h2 className="text-3xl font-extrabold text-cdbi-blue-dark mb-6">CDBI Ledger Transactions</h2>
        <ListView
          resource={LEDGER_TRANSACTION}
          graphqlDocument={LedgerTransactionsHomeDocument}
          styleMapping={STYLE_MAPPING}
          defaultSearchComponents={searchComponents.defaultComponents}
          additionalSearchComponents={searchComponents.additionalComponents}
          ListViewEmptyState={
            <div className="flex justify-center px-6 py-16">
              <LedgerTransactionsEmptyState
                onClickLedgerAccountLink={onClickLedgerAccountLink}
              />
            </div>
          }
          mapQueryToVariables={mapLedgerTransactionQueryToVariables}
          constantQueryParams={CONSTANT_QUERY_PARAMS}
          constantQueryVariables={{ ledgerId }}
          initialShowSearchArea={initialShowSearchArea}
          actions={ACTIONS}
          horizontalDefaultSearchComponents
          enableActions
          enableExportData
          exportDataParams={exportDataParams}
          // Assuming we want to show checkboxes now for AI actions
          // hideAllCheckboxes
          // We can also add new columns for AI insights if the ListView component supports custom columns,
          // which it likely does through `styleMapping` or a dedicated `columns` prop.
          // For now, `styleMapping` is how it hints at column presence.
          // Example:
          // columns={['id', 'description', 'amount', 'aiCategory', 'aiAnomalyScore', 'status', 'effectiveDate']}
        />
      </div>

      {/* Add a global style block for CDBI theme if not already in global CSS */}
      <style jsx global>{`
        :root {
          --cdbi-blue-dark: #1A3E6D; /* Deep corporate blue */
          --cdbi-blue: #007bff; /* Primary action blue */
          --cdbi-blue-light: #66b3ff; /* Lighter accent blue */
          --cdbi-text: #333; /* Main text color */
          --cdbi-bg: #F8F9FA; /* Light background */
          --cdbi-light-bg: #E9ECEF; /* Even lighter background for sections */
          --cdbi-light-blue: #E0F2F7; /* Very light blue for KPI cards */
          --cdbi-border: #DEE2E6; /* Border color */
        }
        .text-cdbi-blue-dark { color: var(--cdbi-blue-dark); }
        .bg-cdbi-blue-dark { background-color: var(--cdbi-blue-dark); }
        .text-cdbi-blue { color: var(--cdbi-blue); }
        .border-cdbi-blue { border-color: var(--cdbi-blue); }
        .text-cdbi-blue-light { color: var(--cdbi-blue-light); }
        .text-cdbi-text { color: var(--cdbi-text); }
        .bg-cdbi-bg { background-color: var(--cdbi-bg); }
        .bg-cdbi-light-bg { background-color: var(--cdbi-light-bg); }
        .bg-cdbi-light-blue { background-color: var(--cdbi-light-blue); }
        .border-cdbi-border { border-color: var(--cdbi-border); }
        .border-cdbi-blue-light { border-color: var(--cdbi-blue-light); }
      `}</style>
    </div>
  );
}

export default LedgerTransactionsHome;