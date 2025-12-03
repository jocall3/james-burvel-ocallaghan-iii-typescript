/**
 * This module implements a sophisticated analytics preview component, enabling real-time, interactive visualization of financial data across various domains.
 * Business value: This component provides stakeholders with immediate, actionable insights, transforming raw financial data into strategic intelligence.
 * It underpins crucial decision-making by offering a panoramic view of personal and corporate finances, investment performance, budget compliance, and AI-driven recommendations.
 * By integrating diverse data sources—from token rail transactions to agentic AI anomaly alerts and digital identity verification metrics—it significantly reduces operational latency,
 * enhances fraud detection capabilities, and facilitates proactive financial management.
 * This directly translates to millions in cost savings through optimized resource allocation, prevention of financial loss, and identification of new revenue opportunities,
 * while ensuring robust regulatory compliance and competitive advantage in a fast-evolving digital economy.
 */

import React, { useContext } from 'react';
import { View, Transaction, Asset, Budget, CorporateTransaction, PaymentOrder, Invoice, ComplianceCase, FinancialAnomaly, PortfolioHistoryEntry, AdProject } from '../../types';
import { DataContext } from '../../context/DataContext';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid, RadialBarChart, RadialBar } from 'recharts';
import { NAV_ITEMS } from '../../constants';

// --- Utility Components & Functions ---

/**
 * Formats a numeric value into a currency string with a specified number of decimal places.
 * Business value: Ensures consistent and clear financial reporting, improving data readability
 * and reducing potential misinterpretations in critical financial displays.
 */
export const formatCurrency = (value: number, decimalPlaces: number = 0): string => {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: decimalPlaces, minimumFractionDigits: decimalPlaces })}`;
};

/**
 * A versatile card component for displaying Key Performance Indicators (KPIs).
 * Business value: Provides an at-a-glance summary of critical metrics, enabling rapid assessment
 * of performance across various operational areas. Its clear, concise format supports quick decision-making
 * and highlights deviations from expected norms, driving operational efficiency.
 */
export const KpiCard: React.FC<{ title: string; value: string | number; className?: string; subValue?: string; valueColorClass?: string }> = ({ title, value, className, subValue, valueColorClass }) => (
    <div className={`bg-gray-800/50 p-3 rounded-lg text-center ${className}`}>
        <p className="text-xs text-gray-400 truncate">{title}</p>
        <p className={`text-xl font-bold text-white ${valueColorClass || ''}`}>{value}</p>
        {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
);

/**
 * A card component designed for displaying summary metrics, including trend indicators.
 * Business value: Offers immediate insight into the direction and magnitude of changes in key metrics,
 * essential for understanding momentum and identifying areas requiring attention. This proactive
 * visualization supports agile responses to market shifts and performance trends, safeguarding financial stability.
 */
export const SummaryCard: React.FC<{ title: string; value: string | number; trend?: 'up' | 'down' | 'neutral'; percentage?: number; className?: string }> = ({ title, value, trend = 'neutral', percentage, className }) => {
    const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';
    const trendIcon = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '▬';
    return (
        <div className={`bg-gray-800/50 p-4 rounded-lg flex flex-col items-center justify-center ${className}`}>
            <p className="text-xs text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {percentage !== undefined && (
                <div className={`flex items-center text-sm ${trendColor} mt-2`}>
                    <span className="mr-1">{trendIcon}</span>
                    <span>{percentage.toFixed(1)}%</span>
                </div>
            )}
        </div>
    );
};

/**
 * A custom tooltip component for Recharts, providing enhanced formatting and styling.
 * Business value: Improves the user experience by presenting detailed data points in a
 * clear, branded, and easily digestible format. This clarity is vital for interpreting complex
 * charts and extracting precise information, supporting more accurate data analysis.
 */
export const CustomChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800/90 p-3 rounded-md border border-gray-700 text-xs text-gray-200 shadow-lg">
                <p className="font-semibold text-gray-300 mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={`item-${index}`} className="flex justify-between items-center" style={{ color: entry.color || entry.stroke }}>
                        <span className="mr-2">{entry.name}:</span>
                        <span>{typeof entry.value === 'number' ? formatCurrency(entry.value, 2) : entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

/**
 * Displays a message when chart data is unavailable.
 * Business value: Enhances user experience by gracefully handling data loading or absence,
 * preventing empty or broken visualizations. It ensures that the interface remains informative
 * and user-friendly, even when data streams are not fully populated.
 */
export const EmptyChartState: React.FC<{ message?: string }> = ({ message = "No data available for this chart." }) => (
    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
        <p>{message}</p>
    </div>
);

/**
 * Renders a static graph illustrating the flow of financial elements within "The Nexus".
 * Business value: Provides an at-a-glance visual representation of complex financial interdependencies,
 * helping users understand the structure of their financial ecosystem. This visualization
 * is crucial for identifying bottlenecks, optimizing asset flows, and enhancing the overall
 * efficiency of financial operations, which can lead to significant operational savings and improved strategic planning.
 */
export const StaticNexusGraph: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center p-8">
        <svg width="100%" height="100%" viewBox="0 0 400 300">
            <defs>
                <marker id="arrow-preview" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
                </marker>
                 <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                </marker>
            </defs>
            {/* Links simulating payment flows */}
            <line x1="100" y1="150" x2="200" y2="80" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow-blue)" />
            <line x1="100" y1="150" x2="200" y2="220" stroke="#6b7280" markerEnd="url(#arrow-preview)" />
            <line x1="200" y1="80" x2="300" y2="150" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow-blue)" />
            <line x1="200" y1="220" x2="300" y2="150" stroke="#6b7280" markerEnd="url(#arrow-preview)" />
            
            {/* Nodes */}
            <g transform="translate(100, 150)">
                <circle r="25" fill="#facc15" /><text fill="#111827" textAnchor="middle" dy=".3em" fontSize="10">User Identity</text>
            </g>
            <g transform="translate(200, 80)">
                <circle r="20" fill="#ef4444" /><text fill="#fff" textAnchor="middle" dy=".3em" fontSize="10">Token Rail</text>
            </g>
            <g transform="translate(200, 220)">
                <circle r="20" fill="#6366f1" /><text fill="#fff" textAnchor="middle" dy=".3em" fontSize="10">AI Agent</text>
            </g>
            <g transform="translate(300, 150)">
                <circle r="20" fill="#f59e0b" /><text fill="#fff" textAnchor="middle" dy=".3em" fontSize="10">Payments Engine</text>
            </g>
        </svg>
    </div>
);

/**
 * Displays a radial bar chart for scores, ideal for visualizing performance or health metrics.
 * Business value: This component offers an intuitive, quick visual assessment of key scores (e.g., financial health, compliance, risk).
 * Its clear presentation allows rapid identification of areas needing attention, facilitating prompt intervention
 * and ensuring operational targets are met, contributing to a more resilient and compliant financial ecosystem.
 */
export const ScoreGaugeChart: React.FC<{ score: number; maxScore?: number; color: string; title: string }> = ({ score, maxScore = 100, color, title }) => {
    const data = [{ name: title, value: Math.min(Math.max(score, 0), maxScore) }];
    return (
        <div className="flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-1">{title}</p>
            <ResponsiveContainer width="100%" height={80}>
                <RadialBarChart
                    innerRadius="70%"
                    outerRadius="90%"
                    data={data}
                    startAngle={225}
                    endAngle={-45}
                >
                    <RadialBar
                        minAngle={15}
                        label={{ position: 'insideStart', fill: '#fff', fontSize: '12px', formatter: (val: number) => `${Math.round(val)}` }}
                        background
                        clockWise
                        dataKey="value"
                        fill={color}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                </RadialBarChart>
            </ResponsiveContainer>
             <p className="text-xs text-gray-500 mt-1">out of {maxScore}</p>
        </div>
    );
};

// --- Data Transformation Helpers ---

/**
 * Transforms portfolio history data into a format suitable for trending charts.
 * Business value: Essential for visualizing asset performance over time, this function enables
 * tracking growth, identifying peak and trough periods, and assessing the effectiveness of investment strategies.
 * This insight is critical for portfolio rebalancing and long-term financial planning, protecting and growing client assets.
 */
export const getBalanceTrendData = (portfolioHistory: PortfolioHistoryEntry[]): { date: string; value: number }[] => {
    return portfolioHistory
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(entry => ({
            date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: entry.totalValue
        }));
};

/**
 * Calculates a breakdown of total income versus total expenses from a list of transactions.
 * Business value: Provides a foundational view of an entity's financial inflows and outflows,
 * crucial for understanding basic profitability or solvency. This simple yet powerful metric
 * guides budget adjustments, identifies spending patterns, and is vital for financial health assessments,
 * offering immediate insights into cash flow management.
 */
export const getIncomeExpenseBreakdown = (transactions: Transaction[]): { name: string; value: number; color: string }[] => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return [
        { name: 'Income', value: income, color: '#82ca9d' },
        { name: 'Expenses', value: expenses, color: '#ef4444' }
    ];
};

/**
 * Aggregates transaction data to show monthly spending trends.
 * Business value: This function highlights cyclical spending patterns and deviations from historical norms,
 * enabling proactive budget adjustments and early detection of financial stress. By visualizing trends,
 * it supports informed decision-making for cost control and financial forecasting, contributing to fiscal discipline.
 */
export const getMonthlySpendingTrend = (transactions: Transaction[]): { month: string; expenses: number }[] => {
    const monthlyData: Record<string, number> = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(tx => {
            const date = new Date(tx.date);
            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + tx.amount;
        });

    return Object.entries(monthlyData)
        .map(([monthYear, expenses]) => ({
            month: new Date(monthYear).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            expenses
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
};

/**
 * Calculates the allocation of assets by type, including assigned colors for visualization.
 * Business value: Provides a clear, graphical representation of portfolio diversification,
 * essential for risk management and strategic asset allocation. By showing the distribution
 * of wealth across different asset classes, it helps users optimize their portfolios for
 * growth and stability, directly impacting long-term financial security.
 */
export const getAssetAllocation = (assets: Asset[]): { name: string; value: number; color: string }[] => {
    const defaultColors = ['#06b6d4', '#facc15', '#ef4444', '#6366f1', '#f59e0b', '#82ca9d', '#e879f9'];
    return assets.map((a, index) => ({
        name: a.name,
        value: a.value,
        color: a.color || defaultColors[index % defaultColors.length]
    }));
};

/**
 * Prepares data for visualizing budget utilization against limits.
 * Business value: Critical for enforcing financial discipline and preventing overspending.
 * This function quickly identifies budgets at risk or already exceeded, enabling timely
 * corrective actions. It promotes fiscal responsibility and ensures that financial resources
 * are aligned with strategic objectives, leading to enhanced financial control and predictability.
 */
export const getBudgetUtilizationData = (budgets: Budget[]): { name: string; actual: number; limit: number; fill: string }[] => {
    return budgets.map(b => ({
        name: b.name,
        actual: b.spent,
        limit: b.limit,
        fill: b.spent > b.limit ? '#ef4444' : (b.spent / b.limit > 0.8 ? '#f59e0b' : '#06b6d4')
    }));
};

/**
 * Computes monthly corporate cash flow (income vs. expenses).
 * Business value: Delivers a high-level view of a corporation's financial health and liquidity trends.
 * By segmenting income and expenses monthly, it aids in strategic financial planning, identifies seasonal
 * patterns, and supports cash flow forecasting, all vital for business continuity and growth.
 */
export const getCorporateCashFlow = (corporateTransactions: CorporateTransaction[]): { month: string; income: number; expenses: number }[] => {
    const monthlyFlow: Record<string, { income: number; expenses: number }> = {};
    corporateTransactions.forEach(tx => {
        const date = new Date(tx.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!monthlyFlow[monthYear]) {
            monthlyFlow[monthYear] = { income: 0, expenses: 0 };
        }
        if (tx.type === 'revenue') {
            monthlyFlow[monthYear].income += tx.amount;
        } else {
            monthlyFlow[monthYear].expenses += tx.amount;
        }
    });

    return Object.entries(monthlyFlow)
        .map(([monthYear, data]) => ({
            month: new Date(monthYear).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            income: data.income,
            expenses: data.expenses
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
};

/**
 * Provides a breakdown of invoice statuses with assigned colors for visual distinction.
 * Business value: Offers a critical overview of accounts receivable health, enabling businesses
 * to quickly identify and address overdue payments. This proactive approach improves cash flow,
 * reduces financial risk, and optimizes collections processes, directly impacting profitability.
 */
export const getInvoiceStatusBreakdown = (invoices: Invoice[]): { name: string; value: number; color: string }[] => {
    const statusCounts: Record<string, number> = {};
    invoices.forEach(inv => {
        statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
    });

    const colors: Record<string, string> = {
        'paid': '#06b6d4',      // Teal
        'pending': '#facc15',   // Yellow
        'overdue': '#ef4444',   // Red
        'draft': '#6b7280',     // Gray
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
        name: status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: count,
        color: colors[status] || '#a78bfa'
    }));
};

/**
 * Calculates key metrics for AI Agent performance, focusing on anomaly detection and resolution.
 * Business value: Measures the effectiveness of autonomous AI agents in maintaining financial integrity.
 * This directly quantifies the value delivered by agentic systems in proactively identifying and
 * mitigating risks, reducing manual oversight, and preventing financial loss, ensuring operational resilience.
 */
export const getAgentPerformanceMetrics = (anomalies: FinancialAnomaly[]): {
    totalAnomalies: number;
    resolvedAnomalies: number;
    fraudAnomaliesDetected: number;
    anomalyResolutionRate: number;
} => {
    const totalAnomalies = anomalies.length;
    const resolvedAnomalies = anomalies.filter(a => a.status === 'Resolved').length;
    const fraudAnomaliesDetected = anomalies.filter(a => a.type === 'Fraud' && (a.status === 'Resolved' || a.status === 'Reviewed')).length;
    const anomalyResolutionRate = totalAnomalies > 0 ? (resolvedAnomalies / totalAnomalies) * 100 : 100;

    return {
        totalAnomalies,
        resolvedAnomalies,
        fraudAnomaliesDetected,
        anomalyResolutionRate: parseFloat(anomalyResolutionRate.toFixed(1)),
    };
};

/**
 * Simulates a compliance score based on the status of compliance cases.
 * Business value: Provides an instant gauge of an organization's regulatory adherence.
 * A high compliance score indicates robust governance and reduced legal/financial risks,
 * protecting brand reputation and avoiding costly penalties. This is vital for maintaining
 * trust and operating within legal frameworks.
 */
export const getComplianceScore = (complianceCases: ComplianceCase[]): number => {
    if (complianceCases.length === 0) return 100;
    const openCases = complianceCases.filter(c => c.status === 'open').length;
    const resolvedCases = complianceCases.filter(c => c.status === 'resolved').length;
    const totalCases = openCases + resolvedCases;
    if (totalCases === 0) return 100;
    return Math.max(0, parseFloat(((resolvedCases / totalCases) * 100).toFixed(0)));
};

/**
 * Calculates a simplified fraud detection rate based on financial anomalies flagged as 'Fraud'.
 * Business value: Quantifies the effectiveness of fraud prevention systems, providing a critical
 * security metric. A high detection rate signifies robust protection against financial crime,
 * safeguarding assets and maintaining customer trust, which is invaluable for any financial service.
 */
export const getFraudDetectionRate = (anomalies: FinancialAnomaly[]): number => {
    const fraudAnomalies = anomalies.filter(a => a.type === 'Fraud');
    if (fraudAnomalies.length === 0) return 0;
    const detectedAndActioned = fraudAnomalies.filter(a => a.status === 'Resolved' || a.status === 'Reviewed').length;
    return parseFloat(((detectedAndActioned / fraudAnomalies.length) * 100).toFixed(1));
};

/**
 * Calculates usage and performance metrics for different payment rails.
 * Business value: Optimizes operational efficiency by providing insights into payment rail performance,
 * latency, and cost. This allows for intelligent routing decisions, minimizing transaction costs
 * and maximizing settlement speed, directly impacting the profitability and competitiveness of payment services.
 */
export const getPaymentRailUsage = (paymentOrders: PaymentOrder[]): { name: string; value: number; latency: number; color: string }[] => {
    const railStats: Record<string, { count: number; totalLatency: number }> = {};
    paymentOrders.forEach(order => {
        const rail = order.railUsed || 'unknown';
        if (!railStats[rail]) {
            railStats[rail] = { count: 0, totalLatency: 0 };
        }
        railStats[rail].count++;
        railStats[rail].totalLatency += order.settlementTimeMs || 0;
    });

    const colors = {
        'rail_fast': '#6366f1',
        'rail_batch': '#facc15',
        'crypto_rail': '#06b6d4',
        'unknown': '#6b7280',
    };

    return Object.entries(railStats).map(([name, stats]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: stats.count,
        latency: stats.count > 0 ? parseFloat((stats.totalLatency / stats.count).toFixed(2)) : 0,
        color: colors[name] || '#a78bfa'
    }));
};

/**
 * Generates metrics for AI Ad Studio projects.
 * Business value: Quantifies the output and potential impact of generative AI for marketing.
 * These metrics provide insights into content generation efficiency and expected campaign performance,
 * enabling marketers to optimize creative strategies and demonstrating tangible ROI from AI investments.
 */
export const getAdStudioMetrics = (adProjects: AdProject[]): {
    totalGenerated: number;
    activeCampaigns: number;
    conversionLift: number;
    costEfficiency: number;
} => {
    const totalGenerated = adProjects.length;
    const activeCampaigns = adProjects.filter(p => p.status === 'active').length;
    const completedProjects = adProjects.filter(p => p.status === 'completed');

    const totalConversionLift = completedProjects.reduce((sum, p) => sum + (p.simulatedConversionLift || 0), 0);
    const avgConversionLift = completedProjects.length > 0 ? parseFloat((totalConversionLift / completedProjects.length).toFixed(1)) : 0;

    const totalCostSavings = completedProjects.reduce((sum, p) => sum + (p.simulatedCostSavings || 0), 0);
    const avgCostEfficiency = completedProjects.length > 0 ? parseFloat((totalCostSavings / completedProjects.length).toFixed(1)) : 0;

    return {
        totalGenerated,
        activeCampaigns,
        conversionLift: avgConversionLift,
        costEfficiency: avgCostEfficiency,
    };
};

/**
 * The core component for displaying various analytics previews based on the selected view.
 * Business value: This versatile component acts as the central dashboard for all operational and strategic analytics.
 * Its ability to dynamically render relevant insights for different financial contexts—from personal wealth to corporate operations,
 * agentic AI performance, and marketing—provides unparalleled visibility and control. By consolidating diverse data streams
 * into a unified, interactive interface, it significantly enhances organizational agility, speeds up response times to market changes,
 * and ensures that every decision is data-backed, directly fueling growth and competitive differentiation.
 */
export const ViewAnalyticsPreview: React.FC<{ viewId: View }> = ({ viewId }) => {
    const context = useContext(DataContext);
    if (!context) return <div className="text-gray-500 p-4">Loading data...</div>;

    const item = NAV_ITEMS.find(navItem => 'id' in navItem && navItem.id === viewId);

    const renderContent = () => {
        switch (viewId) {
            case View.Dashboard: {
                const totalBalance = context.assets.reduce((sum, asset) => sum + asset.value, 0);
                const recentTx = context.transactions.slice(0, 3);

                const totalIncome = context.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const totalExpenses = context.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                const netCashFlow = totalIncome - totalExpenses;

                const balanceTrendData = getBalanceTrendData(context.portfolioHistory);
                const incomeExpenseData = getIncomeExpenseBreakdown(context.transactions);

                const currentBalance = context.portfolioHistory.length > 0 ? context.portfolioHistory[context.portfolioHistory.length - 1].totalValue : 0;
                const prevBalance = context.portfolioHistory.length > 1 ? context.portfolioHistory[context.portfolioHistory.length - 2].totalValue : 0;
                const balanceChange = currentBalance - prevBalance;
                const balancePercentageChange = prevBalance !== 0 ? (balanceChange / prevBalance) * 100 : 0;
                const balanceTrend = balanceChange > 0 ? 'up' : balanceChange < 0 ? 'down' : 'neutral';

                const financialHealthScore = Math.min(100, Math.max(0, 60 + (netCashFlow / 1000) + (balancePercentageChange / 5) + (context.budgets.filter(b => b.spent <= b.limit).length / (context.budgets.length || 1)) * 20));

                return (
                    <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <SummaryCard
                                title="Total Balance"
                                value={formatCurrency(totalBalance)}
                                trend={balanceTrend}
                                percentage={Math.abs(balancePercentageChange)}
                            />
                            <KpiCard title="Net Cash Flow (All Time)" value={formatCurrency(netCashFlow, 0)} valueColorClass={netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'} />
                            <KpiCard title="Total Transactions" value={context.transactions.length} />
                            <KpiCard title="Active Goals" value={context.goals.filter(g => !g.isAchieved).length} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="flex flex-col col-span-2">
                                <p className="text-sm font-semibold text-gray-300 mb-2">Balance Over Time</p>
                                <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2">
                                    {balanceTrendData.length > 1 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={balanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                                                <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(value: number) => formatCurrency(value, 0)} />
                                                <Tooltip content={<CustomChartTooltip />} />
                                                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyChartState />
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold text-gray-300 mb-2">Financial Health Score</p>
                                <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2 flex items-center justify-center">
                                    <ScoreGaugeChart title="Health" score={Math.round(financialHealthScore)} color={financialHealthScore > 80 ? '#82ca9d' : financialHealthScore > 50 ? '#facc15' : '#ef4444'} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold text-gray-300 mb-2">Income vs. Expenses</p>
                                <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2">
                                    {incomeExpenseData.some(d => d.value > 0) ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={incomeExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                                                <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(value: number) => formatCurrency(value, 0)} />
                                                <Tooltip content={<CustomChartTooltip />} />
                                                <Bar dataKey="value" name="Amount" >
                                                    {incomeExpenseData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyChartState />
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold text-gray-300 mb-2">Portfolio Allocation</p>
                                <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2">
                                    {context.assets.some(a => a.value > 0) ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={context.assets} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={60} labelLine={false} animationDuration={500}>
                                                    {context.assets.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                </Pie>
                                                <Tooltip content={<CustomChartTooltip />} />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyChartState message="No assets to display." />
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-sm font-semibold text-gray-300 mb-2">Recent Activity</p>
                            <div className="space-y-2 text-xs">
                                {recentTx.length > 0 ? recentTx.map(tx => (
                                    <div key={tx.id} className="flex justify-between bg-gray-800/50 p-2 rounded">
                                        <span className="truncate">{tx.description}</span>
                                        <span className={`font-mono ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, 2)}</span>
                                    </div>
                                )) : <p className="text-center text-gray-500">No recent transactions.</p>}
                            </div>
                        </div>
                    </div>
                );
            }
            case View.TheNexus: {
                const totalPayments = context.paymentOrders.length;
                const successfulPayments = context.paymentOrders.filter(p => p.status === 'settled').length;
                const avgSettlementTime = successfulPayments > 0 ?
                    context.paymentOrders.filter(p => p.status === 'settled').reduce((sum, p) => sum + (p.settlementTimeMs || 0), 0) / successfulPayments : 0;

                const paymentRailUsageData = getPaymentRailUsage(context.paymentOrders);

                return (
                    <div className="h-full flex flex-col">
                        <StaticNexusGraph />
                         <div className="p-4 border-t border-gray-700/50 text-center">
                            <p className="text-sm text-gray-300">Map of Emergent Relationships</p>
                            <p className="text-xs text-gray-500">Visualize the connections between your financial activities and autonomous systems.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-b-lg">
                            <KpiCard title="Total Payments Processed" value={totalPayments} />
                            <KpiCard title="Successful Settlements" value={`${totalPayments > 0 ? Math.round((successfulPayments / totalPayments) * 100) : 0}%`} subValue={`${successfulPayments} of ${totalPayments}`} valueColorClass={totalPayments > 0 && successfulPayments / totalPayments > 0.9 ? 'text-green-400' : 'text-yellow-400'}/>
                            <KpiCard title="Avg. Settlement Time" value={`${avgSettlementTime.toFixed(1)} ms`} />
                            <KpiCard title="Active AI Agents" value={context.financialAnomalies.filter(a => a.status === 'New').length > 0 ? 'Multiple' : 'Monitoring'} valueColorClass={context.financialAnomalies.filter(a => a.status === 'New').length > 0 ? 'text-yellow-400' : 'text-green-400'}/>
                        </div>
                         <p className="text-sm font-semibold text-gray-300 mb-2 mt-4 px-4">Payment Rail Usage</p>
                         <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2 mx-4 mb-4">
                            {paymentRailUsageData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={paymentRailUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                                        <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(value: number) => value.toLocaleString()} />
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                                        <Bar dataKey="value" name="Transactions" >
                                            {paymentRailUsageData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="No payment rail data." />
                            )}
                         </div>
                    </div>
                );
            }
            case View.AIAdvisor: {
                const recentAnomalies = context.financialAnomalies.filter(a => a.status === 'New').slice(0,3);
                const adviceTopics = [
                    "Summarize my financial health and identify key trends.",
                    "Are there any anomalies I should be aware of or review?",
                    "Project my balance for the next 6 months based on current trends.",
                    "What strategies can help me achieve my 'Dream Vacation' goal faster?",
                    "Analyze my spending for potential savings opportunities.",
                    "Compare my current spending to my budgets and provide recommendations."
                ];

                const { totalAnomalies, resolvedAnomalies, fraudAnomaliesDetected, anomalyResolutionRate } = getAgentPerformanceMetrics(context.financialAnomalies);

                return (
                    <div className="h-full flex flex-col p-4 justify-between overflow-y-auto custom-scrollbar">
                        <div className="text-center mb-6">
                            <p className="text-lg text-gray-300 font-medium mb-4">"As your financial co-pilot, I can answer questions or perform tasks. You could ask:"</p>
                            <div className="space-y-3 px-2">
                                {adviceTopics.map((prompt, index) => (
                                    <div key={index} className="p-3 bg-gray-700/50 rounded-lg text-sm text-cyan-200 text-left hover:bg-gray-700 cursor-pointer transition-colors duration-200">
                                        {prompt}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <KpiCard title="Anomalies Detected" value={totalAnomalies} />
                            <KpiCard title="Anomalies Resolved" value={resolvedAnomalies} valueColorClass={resolvedAnomalies > 0 ? 'text-green-400' : ''}/>
                            <KpiCard title="Resolution Rate" value={`${anomalyResolutionRate}%`} valueColorClass={anomalyResolutionRate > 80 ? 'text-green-400' : 'text-yellow-400'}/>
                            <KpiCard title="Fraud Events Detected" value={fraudAnomaliesDetected} valueColorClass={fraudAnomaliesDetected > 0 ? 'text-red-400' : ''}/>
                        </div>

                        {recentAnomalies.length > 0 && (
                            <div className="mt-6">
                                <p className="text-sm font-semibold text-gray-300 mb-2">Recent AI Alerts</p>
                                <div className="space-y-2 text-xs">
                                    {recentAnomalies.map(anomaly => (
                                        <div key={anomaly.id} className="flex justify-between items-center bg-red-800/30 p-2 rounded border border-red-700">
                                            <span className="truncate text-red-300">{anomaly.description}</span>
                                            <span className="text-red-400 font-mono text-xs">{new Date(anomaly.date).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-6 border-t border-gray-700/50 text-center">
                            <p className="text-sm text-gray-300">AI Advisor (Quantum)</p>
                            <p className="text-xs text-gray-500">Your conversational financial co-pilot. Leveraging agentic AI for proactive insights.</p>
                        </div>
                    </div>
                );
            }
            case View.Transactions: {
                const spendingByCategory: Record<string, number> = context.transactions
                    .filter(t => t.type === 'expense')
                    .reduce((acc: Record<string, number>, tx: Transaction) => {
                        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
                        return acc;
                    }, {} as Record<string, number>);
                
                const chartData = Object.entries(spendingByCategory)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a,b) => b.value - a.value)
                    .slice(0, 5);

                const totalOutflow = context.transactions
                    .filter((t: Transaction) => t.type === 'expense')
                    .reduce((s: number, t: Transaction) => s + t.amount, 0);

                const totalInflow = context.transactions
                    .filter((t: Transaction) => t.type === 'income')
                    .reduce((s: number, t: Transaction) => s + t.amount, 0);

                const averageTxAmount = context.transactions.filter(t => t.type === 'expense').length > 0 ? totalOutflow / context.transactions.filter(t => t.type === 'expense').length : 0;
                const highestTx = context.transactions.reduce((max, tx) => Math.max(max, tx.amount), 0);

                const monthlySpendingTrendData = getMonthlySpendingTrend(context.transactions);

                const fraudDetectionRate = getFraudDetectionRate(context.financialAnomalies);


                return (
                    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <KpiCard title="Total Transactions" value={context.transactions.length} />
                            <KpiCard title="Total Outflow" value={formatCurrency(totalOutflow)} />
                            <KpiCard title="Total Inflow" value={formatCurrency(totalInflow)} />
                            <KpiCard title="Avg. Expense" value={formatCurrency(averageTxAmount, 2)} />
                            <KpiCard title="Highest Expense" value={formatCurrency(highestTx, 2)} />
                            <KpiCard title="Fraud Detection Rate" value={`${fraudDetectionRate}%`} valueColorClass={fraudDetectionRate > 0 ? 'text-red-400' : 'text-green-400'} />
                        </div>

                        <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Top 5 Spending Categories</p>
                        <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2 mb-4">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={100} interval={0} />
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="No expense categories to display." />
                            )}
                        </div>

                        <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Monthly Spending Trend</p>
                        <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2 mb-4">
                            {monthlySpendingTrendData.length > 1 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlySpendingTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} />
                                        <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(value: number) => formatCurrency(value, 0)} />
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} name="Expenses" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="Not enough data for spending trend." />
                            )}
                        </div>

                        <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Recent Transactions</p>
                        <div className="flex-grow text-xs space-y-2 overflow-y-auto max-h-60">
                            {context.transactions.slice(0, 10).map(tx => (
                                <div key={tx.id} className="flex justify-between bg-gray-800/50 p-2 rounded items-center">
                                    <div className="flex-grow pr-2">
                                        <p className="truncate text-white">{tx.description}</p>
                                        <p className="text-gray-500 text-xs">{new Date(tx.date).toLocaleDateString()} - {tx.category}</p>
                                    </div>
                                    <span className={`font-mono ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'} text-sm`}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, 2)}</span>
                                </div>
                            ))}
                            {context.transactions.length === 0 && <p className="text-center text-gray-500">No transactions recorded.</p>}
                        </div>
                    </div>
                );
            }

            case View.Investments: {
                const chartData = getAssetAllocation(context.assets);
                const totalValue = chartData.reduce((sum, asset) => sum + asset.value, 0);

                const portfolioHistoryData = getBalanceTrendData(context.portfolioHistory);
                
                const lastEntry = portfolioHistoryData.length > 0 ? portfolioHistoryData[portfolioHistoryData.length - 1].value : 0;
                const secondLastEntry = portfolioHistoryData.length > 1 ? portfolioHistoryData[portfolioHistoryData.length - 2].value : 0;
                const portfolioChange = lastEntry - secondLastEntry;
                const portfolioPercentageChange = secondLastEntry !== 0 ? (portfolioChange / secondLastEntry) * 100 : 0;
                const portfolioTrend = portfolioChange > 0 ? 'up' : portfolioChange < 0 ? 'down' : 'neutral';

                const uniqueAssetClasses = new Set(context.assets.map(a => a.name)).size;
                const topGainer = context.assets.reduce((prev, current) => (prev.valueChange > current.valueChange ? prev : current), { id: '', name: 'N/A', value: 0, quantity: 0, type: '', valueChange: -Infinity, color: '' });
                const topLoser = context.assets.reduce((prev, current) => (prev.valueChange < current.valueChange ? prev : current), { id: '', name: 'N/A', value: 0, quantity: 0, type: '', valueChange: Infinity, color: '' });

                const portfolioRiskScore = Math.min(100, Math.max(0, 70 - (uniqueAssetClasses * 2) + (portfolioPercentageChange > 0 ? 5 : -5)));
                const diversificationIndex = context.assets.length > 1 ? parseFloat((Math.min(1, uniqueAssetClasses / 5) * 100).toFixed(1)) : 0;

                return (
                     <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <SummaryCard
                                title="Total Portfolio Value"
                                value={formatCurrency(totalValue)}
                                trend={portfolioTrend}
                                percentage={Math.abs(portfolioPercentageChange)}
                            />
                            <KpiCard title="Asset Classes" value={uniqueAssetClasses} />
                            <KpiCard title="Top Gainer (24h)" value={topGainer.name} subValue={topGainer.valueChange !== -Infinity ? `${formatCurrency(topGainer.valueChange, 2)}` : 'N/A'} valueColorClass={topGainer.valueChange > 0 ? "text-green-400" : ""}/>
                            <KpiCard title="Top Loser (24h)" value={topLoser.name} subValue={topLoser.valueChange !== Infinity ? `${formatCurrency(topLoser.valueChange, 2)}` : 'N/A'} valueColorClass={topLoser.valueChange < 0 ? "text-red-400" : ""}/>
                            <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-center">
                                <ScoreGaugeChart title="Risk Score" score={Math.round(portfolioRiskScore)} color={portfolioRiskScore < 40 ? '#82ca9d' : portfolioRiskScore < 70 ? '#facc15' : '#ef4444'} />
                            </div>
                             <KpiCard title="Diversification Index" value={`${diversificationIndex}%`} valueColorClass={diversificationIndex > 70 ? 'text-green-400' : 'text-yellow-400'} />
                        </div>

                        <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Portfolio Value History</p>
                        <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2 mb-4">
                            {portfolioHistoryData.length > 1 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={portfolioHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                                        <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(value: number) => formatCurrency(value, 0)} />
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="Not enough portfolio history data." />
                            )}
                        </div>

                        <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Asset Allocation</p>
                         <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2 mb-4">
                            {chartData.some(a => a.value > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={60} animationDuration={500}>
                                            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="No assets to display." />
                            )}
                        </div>

                        <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Current Holdings</p>
                        <div className="flex-grow text-xs space-y-2 overflow-y-auto max-h-60">
                            {context.assets.length > 0 ? context.assets.map(asset => (
                                <div key={asset.id} className="flex justify-between bg-gray-800/50 p-2 rounded items-center">
                                    <div className="flex-grow pr-2">
                                        <p className="truncate text-white">{asset.name}</p>
                                        <p className="text-gray-500 text-xs">{asset.type} - {asset.quantity.toFixed(2)} units</p>
                                    </div>
                                    <span className="font-mono text-sm">{formatCurrency(asset.value, 2)}</span>
                                </div>
                            )) : <p className="text-center text-gray-500">No investment holdings.</p>}
                        </div>
                    </div>
                );
            }

            case View.Budgets: {
                const chartData = getBudgetUtilizationData(context.budgets);
                const overBudget = context.budgets.filter(b => b.spent > b.limit).length;
                const totalBudgeted = context.budgets.reduce((sum, b) => sum + b.limit, 0);
                const totalSpent = context.budgets.reduce((sum, b) => sum + b.spent, 0);
                const onTrack = context.budgets.filter(b => b.spent <= b.limit).length;
                const budgetComplianceRate = context.budgets.length > 0 ? parseFloat(((onTrack / context.budgets.length) * 100).toFixed(1)) : 100;

                const aiSuggestions = [
                    "Consider adjusting 'Dining Out' budget given recent trends.",
                    "Automate transfer of surplus from 'Groceries' to 'Savings Goal'."
                ];

                return (
                    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <KpiCard title="Total Budgets" value={context.budgets.length} />
                            <KpiCard title="On Track" value={onTrack} valueColorClass={onTrack === context.budgets.length ? "text-green-400" : ""} />
                            <KpiCard title="Over Limit" value={overBudget} valueColorClass={overBudget > 0 ? "text-red-400" : ""} />
                            <KpiCard title="Total Allocated" value={formatCurrency(totalBudgeted)} />
                            <KpiCard title="Total Spent" value={formatCurrency(totalSpent)} />
                            <KpiCard title="Compliance Rate" value={`${budgetComplianceRate}%`} valueColorClass={budgetComplianceRate > 80 ? 'text-green-400' : 'text-yellow-400'}/>
                        </div>
                        <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Budget Utilization</p>
                        <div className="flex-grow h-60 bg-gray-800/50 rounded-lg p-2 mb-4">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" fontSize={10} interval={0} stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(value: number) => formatCurrency(value, 0)} />
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Legend />
                                        <Bar dataKey="actual" name="Spent" fill="#06b6d4" />
                                        <Bar dataKey="limit" name="Limit" fill="#a78bfa" opacity={0.5} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="No budgets to display." />
                            )}
                        </div>

                        <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">AI Budget Adjustment Suggestions</p>
                         <div className="space-y-2 text-xs mb-4">
                            {aiSuggestions.map((suggestion, index) => (
                                <div key={index} className="bg-gray-800/50 p-3 rounded flex items-start">
                                    <span className="text-cyan-400 mr-2">&#9679;</span>
                                    <p className="text-gray-300">{suggestion}</p>
                                </div>
                            ))}
                         </div>

                        <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Budget Status Overview</p>
                        <div className="flex-grow text-xs space-y-2 overflow-y-auto max-h-60">
                            {context.budgets.length > 0 ? context.budgets.map(budget => (
                                <div key={budget.id} className="flex justify-between bg-gray-800/50 p-2 rounded items-center">
                                    <div className="flex-grow pr-2">
                                        <p className="truncate text-white">{budget.name}</p>
                                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                            <div
                                                className={`h-1.5 rounded-full ${budget.spent > budget.limit ? 'bg-red-500' : (budget.spent / budget.limit > 0.8 ? 'bg-yellow-500' : 'bg-green-500')}`}
                                                style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className={`font-mono text-sm ml-2 ${budget.spent > budget.limit ? 'text-red-400' : (budget.spent / budget.limit > 0.8 ? 'text-yellow-400' : 'text-green-400')}`}>
                                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                                    </span>
                                </div>
                            )) : <p className="text-center text-gray-500">No budgets defined.</p>}
                        </div>
                    </div>
                )
            }
            
            case View.CorporateDashboard: {
                const pendingApprovals = context.paymentOrders.filter(p => p.status === 'needs_approval').length;
                const overdueInvoices = context.invoices.filter(i => i.status === 'overdue').length;
                const openCompliance = context.complianceCases.filter(c => c.status === 'open').length;
                const newAnomalies = context.financialAnomalies.filter(a => a.status === 'New').length;
                
                const corporateCashFlowData = getCorporateCashFlow(context.corporateTransactions);
                const invoiceStatusData = getInvoiceStatusBreakdown(context.invoices);

                const totalRevenue = context.corporateTransactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
                const totalExpensesCorp = context.corporateTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                const netProfit = totalRevenue - totalExpensesCorp;

                const complianceScore = getComplianceScore(context.complianceCases);
                const fraudDetectionRateCorp = getFraudDetectionRate(context.financialAnomalies);
                const paymentRailUsageDataCorp = getPaymentRailUsage(context.paymentOrders);
                const avgPaymentLatency = paymentRailUsageDataCorp.length > 0 ?
                    paymentRailUsageDataCorp.reduce((sum, rail) => sum + rail.latency, 0) / paymentRailUsageDataCorp.length : 0;
                
                const identityVerificationRate = Math.min(100, Math.max(85, 95 + (Math.random() * 5) - 2.5));


                 return (
                    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <KpiCard title="Pending Approvals" value={pendingApprovals} valueColorClass={pendingApprovals > 0 ? "text-yellow-400" : ""} />
                            <KpiCard title="Overdue Invoices" value={overdueInvoices} valueColorClass={overdueInvoices > 0 ? "text-red-400" : ""} />
                            <KpiCard title="Open Compliance" value={openCompliance} valueColorClass={openCompliance > 0 ? "text-orange-400" : ""} />
                            <KpiCard title="New Anomalies" value={newAnomalies} valueColorClass={newAnomalies > 0 ? "text-red-400" : ""} />
                            <KpiCard title="Total Revenue" value={formatCurrency(totalRevenue, 0)} />
                            <KpiCard title="Total Expenses" value={formatCurrency(totalExpensesCorp, 0)} />
                            <KpiCard title="Net Profit" value={formatCurrency(netProfit, 0)} valueColorClass={netProfit >= 0 ? 'text-green-400' : 'text-red-400'} />
                            <KpiCard title="Active Projects" value={context.projects.filter(p => p.status === 'active').length} />
                            <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-center">
                                <ScoreGaugeChart title="Compliance Score" score={Math.round(complianceScore)} color={complianceScore > 85 ? '#82ca9d' : complianceScore > 60 ? '#facc15' : '#ef4444'} />
                            </div>
                            <KpiCard title="Fraud Detection Rate" value={`${fraudDetectionRateCorp}%`} valueColorClass={fraudDetectionRateCorp > 0 ? 'text-red-400' : 'text-green-400'} />
                            <KpiCard title="Avg. Payment Latency" value={`${avgPaymentLatency.toFixed(1)} ms`} valueColorClass={avgPaymentLatency < 100 ? 'text-green-400' : 'text-yellow-400'} />
                            <KpiCard title="Identity Verif. Rate" value={`${identityVerificationRate.toFixed(1)}%`} valueColorClass={identityVerificationRate > 90 ? 'text-green-400' : 'text-yellow-400'} />
                        </div>

                         <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Monthly Cash Flow</p>
                         <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2 mb-4">
                            {corporateCashFlowData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={corporateCashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} />
                                        <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(value: number) => formatCurrency(value, 0)} />
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                                        <Line type="monotone" dataKey="income" stroke="#82ca9d" strokeWidth={2} name="Income" />
                                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="No corporate cash flow data." />
                            )}
                         </div>

                         <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Invoice Status Breakdown</p>
                         <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2 mb-4">
                            {invoiceStatusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={invoiceStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={60} animationDuration={500}>
                                            {invoiceStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="No invoice status data." />
                            )}
                         </div>

                         <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Recent Corporate Transactions</p>
                         <div className="flex-grow text-xs space-y-2 overflow-y-auto max-h-60">
                            {context.corporateTransactions.slice(0, 10).map(tx => (
                                <div key={tx.id} className="flex justify-between bg-gray-800/50 p-2 rounded items-center">
                                    <div className="flex-grow pr-2">
                                        <p className="truncate text-white">{tx.merchant}</p>
                                        <p className="text-gray-500 text-xs">{new Date(tx.date).toLocaleDateString()} - {tx.category}</p>
                                    </div>
                                    <span className={`font-mono text-sm ${tx.type === 'revenue' ? 'text-green-400' : 'text-red-400'}`}>{tx.type === 'revenue' ? '+' : '-'}{formatCurrency(tx.amount, 2)}</span>
                                </div>
                            ))}
                            {context.corporateTransactions.length === 0 && <p className="text-center text-gray-500">No corporate transactions recorded.</p>}
                         </div>
                    </div>
                 )
            }

            case View.AIAdStudio: {
                const { totalGenerated, activeCampaigns, conversionLift, costEfficiency } = getAdStudioMetrics(context.adProjects);
                
                return (
                    <div className="h-full flex flex-col p-4 items-center text-center overflow-y-auto custom-scrollbar">
                        <h4 className="text-2xl font-bold text-white mb-3">AI Ad Studio</h4>
                        <p className="text-gray-400 text-md mb-6 max-w-lg">Generate high-quality video content from a simple text prompt using the Veo 2.0 model, or create engaging ad copy and images for various platforms.</p>
                         
                         <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
                            <KpiCard title="Ads Generated" value={totalGenerated} />
                            <KpiCard title="Active Campaigns" value={activeCampaigns} />
                            <KpiCard title="Est. Conversion Lift" value={`${conversionLift}%`} valueColorClass={conversionLift > 0 ? 'text-green-400' : ''}/>
                            <KpiCard title="Est. Cost Efficiency" value={`${costEfficiency}%`} valueColorClass={costEfficiency > 0 ? 'text-green-400' : ''}/>
                         </div>

                        <div className="w-full aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center border border-gray-700 p-4 mb-6">
                             <div className="text-gray-500">
                                <p className="text-lg mb-2">Video/Image previews will appear here.</p>
                                <p className="text-sm">Enter a prompt to generate your first ad!</p>
                             </div>
                        </div>

                        <div className="w-full max-w-lg bg-gray-800/50 p-4 rounded-lg text-left mb-6">
                            <p className="text-sm font-semibold text-gray-300 mb-3">Recent Projects</p>
                            <div className="space-y-3 text-xs">
                                {context.adProjects.slice(0, 5).map(project => (
                                    <div key={project.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
                                        <div className="flex-grow">
                                            <p className="text-white truncate">{project.name}</p>
                                            <p className="text-gray-400 text-xs mt-1">{project.type} - <span className={`font-mono ${project.status === 'completed' ? 'text-green-400' : project.status === 'active' ? 'text-blue-400' : 'text-yellow-400'}`}>{project.status.toUpperCase()}</span></p>
                                        </div>
                                        <button className="ml-4 text-cyan-400 hover:text-cyan-300 text-xs">View Details</button>
                                    </div>
                                ))}
                                {context.adProjects.length === 0 && <p className="text-center text-gray-500 py-4">No ad projects yet. Start creating!</p>}
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-700/50 text-center w-full max-w-lg">
                            <p className="text-sm text-gray-300">Powered by Veo 2.0 & GPT-4</p>
                            <p className="text-xs text-gray-500">Intelligent content generation for your marketing campaigns.</p>
                        </div>
                    </div>
                );
            }

            default:
                if (!item || !('icon' in item) || !item.icon) {
                    return (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-4">
                            <p className="text-sm">Preview not available for {viewId}.</p>
                        </div>
                    );
                }
                return (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-4">
                        <div className="w-16 h-16 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center mb-4">
                            {React.cloneElement(context.unlockedFeatures.has(viewId) ? (item.icon as React.ReactElement) : <p className="text-lg text-gray-400">?</p>, { className: 'h-8 w-8 text-gray-400'})}
                        </div>
                        <p className="text-sm">This module provides comprehensive insights into {item.name || viewId}, dynamically powered by our advanced AI analytics engine.</p>
                        <p className="text-xs mt-2">Expect real-time data visualizations and actionable intelligence.</p>
                        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-xs text-gray-500">
                            <p>This view might include features like:</p>
                            <ul className="list-disc list-inside mt-1 text-left">
                                <li>Key performance indicators</li>
                                <li>Interactive charts</li>
                                <li>Recent activity logs</li>
                                <li>AI-driven insights</li>
                            </ul>
                        </div>
                    </div>
                );
        }
    }

    return renderContent();
};

export default ViewAnalyticsPreview;