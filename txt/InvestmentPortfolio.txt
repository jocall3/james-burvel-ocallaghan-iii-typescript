```typescript
// components/InvestmentPortfolio.tsx
import React, { useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, XAxis, YAxis, CartesianGrid, Legend, Bar, LineChart, Line, AreaChart, Area } from 'recharts';
import moment from 'moment'; // For date/time calculations, e.g., for historical data

// --- Core Data Structures (Expanded to "Universe" Scale) ---

// Represents an individual financial transaction in extensive detail
export type Transaction = {
    id: string;
    assetId: string; // References EnhancedAsset.id
    brokerageAccountId: string; // For multi-broker management
    type: 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST' | 'FEE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'SPLIT' | 'MERGER' | 'REBALANCE_BUY' | 'REBALANCE_SELL' | 'CRYPTO_STAKING_REWARD' | 'CRYPTO_MINING_REWARD' | 'NFT_PURCHASE' | 'NFT_SALE' | 'REAL_ESTATE_RENTAL_INCOME' | 'FOREX_TRADE';
    date: string; // ISO string
    quantity: number;
    pricePerUnit: number; // Price in transaction currency
    amount: number; // Total amount in transaction currency
    currency: string; // e.g., 'USD', 'EUR', 'BTC'
    exchangeRateToHomeCurrency?: number; // Rate at time of transaction
    homeCurrencyAmount: number; // Amount converted to user's primary currency
    fees: number; // In transaction currency
    feeInHomeCurrency: number;
    notes?: string;
    orderId?: string; // Reference to a specific order from an OMS
    settlementDate?: string; // ISO string
    taxImplications?: {
        gainLoss: number; // Capital gain/loss in home currency
        shortTerm: boolean;
        washSaleApplicable: boolean;
        taxCategory: string; // e.g., 'long_term_capital_gain', 'ordinary_income', 'crypto_taxable_event'
        taxYear: number;
        taxJurisdictionSpecificRulesApplied: string[]; // e.g., 'FIFO', 'LIFO', 'AvgCost'
    };
    relatedParty?: string; // e.g., counterparty for OTC deals
    blockchainTxHash?: string; // For crypto transactions
    gasFees?: number; // For crypto transactions, in native chain currency
};

// Represents a historical price point for an asset, including adjusted prices for splits/dividends
export type HistoricalPrice = {
    date: string; // ISO string
    open: number;
    high: number;
    low: number;
    close: number;
    adjustedClose: number; // Adjusted for splits, dividends
    volume: number;
    marketCap?: number; // For stocks/crypto
};

// Represents an analyst's rating for a stock or crypto
export type AnalystRating = {
    source: string; // e.g., 'Morningstar', 'S&P', 'Internal AI Model', 'Community Consensus'
    date: string; // ISO string
    rating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' | 'Outperform' | 'Neutral' | 'Underperform';
    targetPrice?: number; // In asset's native currency
    analystName?: string;
    confidenceScore?: number; // 0-100
    rationaleSummary?: string;
    sentiment?: 'Positive' | 'Neutral' | 'Negative'; // Derived from rationale
};

// Represents ESG (Environmental, Social, Governance) scores for an asset or portfolio
export type ESGScore = {
    provider: string; // e.g., 'MSCI', 'Sustainalytics', 'Proprietary AI', 'Ethical AI'
    date: string; // ISO string
    overallScore: number; // 0-100
    environmentalScore: number;
    socialScore: number;
    governanceScore: number;
    controversyLevel: 'None' | 'Low' | 'Medium' | 'High' | 'Severe';
    positiveImpactCategories?: string[]; // e.g., 'Renewable Energy', 'Community Development'
    negativeImpactCategories?: string[]; // e.g., 'Carbon Emissions', 'Labor Violations'
    alignmentToSDGs?: { SDG: number; score: number; }[]; // Alignment to UN Sustainable Development Goals
};

// Represents a calculated risk metric for an asset or portfolio
export type RiskMetric = {
    type: 'VaR_99_1D' | 'VaR_95_1D' | 'Beta_SP500' | 'Sharpe_Ratio_Annualized' | 'Sortino_Ratio_Annualized' | 'Max_Drawdown' | 'Volatility_Annualized' | 'Correlation_To_Market' | 'Liquidity_Risk_Score';
    value: number;
    period?: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | '10Y' | 'YTD' | 'inception';
    dateCalculated: string; // ISO string
    benchmark?: string; // e.g., 'SPY', 'BTC/USD'
    unit?: string; // e.g., '%', 'ratio'
};

// Represents an external economic indicator
export type EconomicIndicator = {
    name: string; // e.g., 'Inflation_CPI', 'Interest_Rate_FedFunds', 'GDP_Growth_QoQ', 'Unemployment_Rate'
    value: number;
    date: string; // ISO string
    unit?: string; // e.g., '%', 'index points', 'USD Billions'
    source?: string; // e.g., 'Federal Reserve', 'BLS', 'Eurostat'
    forecasts?: { date: string; value: number; source: string; }[];
    impactAnalysis?: string; // AI-driven summary of impact on portfolio
};

// Represents aggregated market sentiment
export type MarketSentiment = {
    provider: string; // e.g., 'AI_News_Sentiment_Aggregate', 'Social_Media_Aggregate', 'Analyst_Survey'
    score: number; // e.g., -1.0 (very negative) to 1.0 (very positive)
    date: string; // ISO string
    category: 'Overall' | 'Technology' | 'Financials' | 'Cryptocurrency' | 'RealEstate_Global' | string; // specific category
    keywords?: string[]; // Top influencing keywords
    dataPointsCount?: number; // Number of sources considered
};

// Represents a customizable alert
export type PortfolioAlert = {
    id: string;
    type: 'PRICE' | 'PERFORMANCE_DROP' | 'NEWS_IMPACT' | 'REBALANCING_REQUIRED' | 'RISK_THRESHOLD_EXCEEDED' | 'GOAL_STATUS_CHANGE' | 'ESG_RATING_CHANGE' | 'DIVIDEND_ANNOUNCEMENT' | 'EARNINGS_ANNOUNCEMENT' | 'MACRO_ECONOMIC_SHIFT';
    targetId: string; // assetId or portfolioId, or a specific indicator
    threshold: number | string; // e.g., 1.5 (for price), 'Strong Sell' (for rating)
    direction?: 'ABOVE' | 'BELOW' | 'CHANGE_BY' | 'EQUALS' | 'ANY_CHANGE';
    messageTemplate: string; // Customizable notification message
    isActive: boolean;
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    channels: ('email' | 'sms' | 'app_notification' | 'webhook' | 'push_notification')[];
    conditions?: any; // More complex rule definitions
};

// Represents a financial goal with detailed tracking
export type FinancialGoal = {
    id: string;
    name: string;
    category: 'Retirement' | 'Education' | 'Home Purchase' | 'Wealth Preservation' | 'Major Purchase' | 'Charitable Giving' | 'Custom';
    targetAmount: number; // In home currency
    targetDate: string; // ISO string
    currentProgress: number; // Sum of linked asset values + dedicated savings in home currency
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    linkedAssetIds: string[]; // Assets contributing to this goal
    dedicatedSavingsAccountId?: string; // Link to a savings account
    contributions: { date: string; amount: number; source: string; isAutomated: boolean; }[];
    withdrawals: { date: string; amount: number; purpose: string; }[];
    status: 'On Track' | 'At Risk' | 'Behind Schedule' | 'Achieved' | 'Deferred';
    projectedCompletionDate?: string; // AI-driven projection
    projectedShortfallSurplus?: number; // AI-driven projection
    autoInvestStrategyId?: string; // Strategy to automate contributions/investments
    riskToleranceProfile?: 'Conservative' | 'Moderate' | 'Aggressive'; // Goal-specific risk
};

// Represents a customizable dashboard layout or reporting template
export type DashboardLayout = {
    id: string;
    name: string;
    isPublic: boolean; // For sharing with advisors or community
    widgets: {
        type: 'portfolio_summary' | 'performance_chart' | 'asset_allocation_pie' | 'asset_allocation_bar' | 'risk_metrics' | 'news_feed' | 'transactions_table' | 'goals_progress' | 'economic_calendar' | 'sentiment_meter' | 'custom_chart' | 'esg_dashboard' | 'tax_summary' | 'liquidity_analysis' | 'scenario_analysis_tool' | 'correlation_heatmap';
        position: { x: number; y: number; width: number; height: number; }; // Grid or pixel positions
        config?: any; // Specific configuration for the widget (e.g., chart range, asset filters)
        titleOverride?: string;
    }[];
    sharingPermissions?: { userId: string; level: 'view' | 'edit'; }[];
};

// Represents a sophisticated investment strategy
export type InvestmentStrategy = {
    id: string;
    name: string;
    type: 'Rebalancing_TargetAllocation' | 'DollarCostAveraging_Schedule' | 'FactorInvesting_Value' | 'FactorInvesting_Growth' | 'FactorInvesting_Momentum' | 'ThematicInvesting_AI' | 'ESGFocused_HighImpact' | 'RiskParity' | 'VolatilityTargeting' | 'TaxLossHarvesting_Automated';
    description: string;
    parameters: any; // e.g., { targetAllocations: { Stock: 0.6, Bond: 0.2 }, rebalanceThreshold: 0.05 }
    isActive: boolean;
    lastRunDate?: string;
    nextRunDate?: string;
    performanceMetrics?: {
        annualizedReturn: number;
        sharpeRatio: number;
        maxDrawdown: number;
        trackingError: number; // Relative to benchmark
    };
    backtestResults?: {
        period: string;
        simulatedReturn: number;
        benchmarkReturn: number;
        alpha: number;
    }[];
    riskProfileAlignment?: 'Conservative' | 'Moderate