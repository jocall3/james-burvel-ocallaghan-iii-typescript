import React, { useContext } from 'react';
import { View, Transaction, Asset, Budget, CorporateTransaction, PaymentOrder, Invoice, ComplianceCase, FinancialAnomaly, PortfolioHistoryEntry } from '../../types';
import { DataContext } from '../../context/DataContext';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { NAV_ITEMS } from '../../constants';

// --- Utility Components & Functions (New) ---

export const formatCurrency = (value: number, decimalPlaces: number = 0): string => {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: decimalPlaces, minimumFractionDigits: decimalPlaces })}`;
};

export const KpiCard: React.FC<{ title: string; value: string | number; className?: string; subValue?: string }> = ({ title, value, className, subValue }) => (
    <div className={`bg-gray-800/50 p-3 rounded-lg text-center ${className}`}>
        <p className="text-xs text-gray-400 truncate">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
);

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

export const CustomChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800/90 p-3 rounded-md border border-gray-700 text-xs text-gray-200 shadow-lg">
                <p className="font-semibold text-gray-300 mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={`item-${index}`} className="flex justify-between items-center" style={{ color: entry.color }}>
                        <span className="mr-2">{entry.name}:</span>
                        <span>{typeof entry.value === 'number' ? formatCurrency(entry.value, 2) : entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const EmptyChartState: React.FC<{ message?: string }> = ({ message = "No data available for this chart." }) => (
    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
        <p>{message}</p>
    </div>
);

export const StaticNexusGraph: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center p-8">
        <svg width="100%" height="100%" viewBox="0 0 400 300">
            <defs>
                <marker id="arrow-preview" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
                </marker>
            </defs>
            {/* Links */}
            <line x1="100" y1="150" x2="200" y2="80" stroke="#6b7280" markerEnd="url(#arrow-preview)" />
            <line x1="100" y1="150" x2="200" y2="220" stroke="#6b7280" markerEnd="url(#arrow-preview)" />
            <line x1="200" y1="80" x2="300" y2="150" stroke="#6b7280" markerEnd="url(#arrow-preview)" />
            <line x1="200" y1="220" x2="300" y2="150" stroke="#6b7280" markerEnd="url(#arrow-preview)" />
            
            {/* Nodes */}
            <g transform="translate(100, 150)">
                <circle r="25" fill="#facc15" /><text fill="#111827" textAnchor="middle" dy=".3em" fontSize="10">User</text>
            </g>
            <g transform="translate(200, 80)">
                <circle r="20" fill="#ef4444" /><text fill="#fff" textAnchor="middle" dy=".3em" fontSize="10">TXN</text>
            </g>
            <g transform="translate(200, 220)">
                <circle r="20" fill="#6366f1" /><text fill="#fff" textAnchor="middle" dy=".3em" fontSize="10">Goal</text>
            </g>
            <g transform="translate(300, 150)">
                <circle r="20" fill="#f59e0b" /><text fill="#fff" textAnchor="middle" dy=".3em" fontSize="10">Budget</text>
            </g>
        </svg>
    </div>
);

// --- Data Transformation Helpers (New) ---

export const getBalanceTrendData = (portfolioHistory: PortfolioHistoryEntry[]): { date: string; value: number }[] => {
    return portfolioHistory
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(entry => ({
            date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: entry.totalValue
        }));
};

export const getIncomeExpenseBreakdown = (transactions: Transaction[]): { name: string; value: number }[] => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return [{ name: 'Income', value: income }, { name: 'Expenses', value: expenses }];
};

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

export const getAssetAllocation = (assets: Asset[]): { name: string; value: number; color: string }[] => {
    return assets.map(a => ({ name: a.name, value: a.value, color: a.color }));
};

export const getBudgetUtilizationData = (budgets: Budget[]): { name: string; actual: number; limit: number; fill: string }[] => {
    return budgets.map(b => ({
        name: b.name,
        actual: b.spent,
        limit: b.limit,
        fill: b.spent > b.limit ? '#ef4444' : (b.spent / b.limit > 0.8 ? '#f59e0b' : '#06b6d4')
    }));
};

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

export const getInvoiceStatusBreakdown = (invoices: Invoice[]): { name: string; value: number; color: string }[] => {
    const statusCounts: Record<string, number> = {};
    invoices.forEach(inv => {
        statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
    });

    // Assign consistent colors
    const colors: Record<string, string> = {
        'paid': '#06b6d4',      // Teal
        'pending': '#facc15',   // Yellow
        'overdue': '#ef4444',   // Red
        'draft': '#6b7280',     // Gray
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
        name: status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), // Format status
        value: count,
        color: colors[status] || '#a78bfa' // Default purple if status color not defined
    }));
};

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

                return (
                    <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <SummaryCard
                                title="Total Balance"
                                value={formatCurrency(totalBalance)}
                                trend={balanceTrend}
                                percentage={Math.abs(balancePercentageChange)}
                            />
                            <KpiCard title="Net Cash Flow (All Time)" value={formatCurrency(netCashFlow, 0)} className={netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'} />
                            <KpiCard title="Total Transactions" value={context.transactions.length} />
                            <KpiCard title="Active Goals" value={context.goals.filter(g => !g.isAchieved).length} />
                        </div>

                        <div className="flex-grow flex flex-col">
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="flex-grow flex flex-col">
                                <p className="text-sm font-semibold text-gray-300 mb-2">Income vs. Expenses</p>
                                <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2">
                                    {incomeExpenseData.some(d => d.value > 0) ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={incomeExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                                                <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(value: number) => formatCurrency(value, 0)} />
                                                <Tooltip content={<CustomChartTooltip />} />
                                                <Legend />
                                                <Bar dataKey="value" name="Amount" fill="#06b6d4" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyChartState />
                                    )}
                                </div>
                            </div>
                            <div className="flex-grow flex flex-col">
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
                return (
                    <div className="h-full flex flex-col">
                        <StaticNexusGraph />
                         <div className="p-4 border-t border-gray-700/50 text-center">
                            <p className="text-sm text-gray-300">Map of Emergent Relationships</p>
                            <p className="text-xs text-gray-500">Visualize the connections between your financial activities.</p>
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-b-lg mt-auto">
                            <p className="text-xs text-gray-400 mb-2">Nexus Insights</p>
                            <ul className="text-xs text-gray-500 space-y-1">
                                <li>- Identified 3 high-impact spending categories.</li>
                                <li>- 2 budgets directly linked to savings goals.</li>
                                <li>- Potential for automating transfers to investments.</li>
                            </ul>
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
                            <p className="text-xs text-gray-500">Your conversational financial co-pilot.</p>
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

                const averageTxAmount = context.transactions.length > 0 ? totalOutflow / context.transactions.filter(t => t.type === 'expense').length : 0;
                const highestTx = context.transactions.reduce((max, tx) => Math.max(max, tx.amount), 0);

                const monthlySpendingTrendData = getMonthlySpendingTrend(context.transactions);

                return (
                    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <KpiCard title="Total Transactions" value={context.transactions.length} />
                            <KpiCard title="Total Outflow" value={formatCurrency(totalOutflow)} />
                            <KpiCard title="Total Inflow" value={formatCurrency(totalInflow)} />
                            <KpiCard title="Avg. Expense" value={formatCurrency(averageTxAmount, 2)} />
                            <KpiCard title="Highest Expense" value={formatCurrency(highestTx, 2)} />
                        </div>

                        <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Top 5 Spending Categories</p>
                        <div className="flex-grow h-48 bg-gray-800/50 rounded-lg p-2 mb-4">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={100} interval={0} />
                                        <Tooltip content={<CustomChartTooltip formatter={(v: number) => formatCurrency(v, 2)} />} />
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
                const topGainer = context.assets.reduce((prev, current) => (prev.valueChange > current.valueChange ? prev : current), { name: '', valueChange: -Infinity });
                const topLoser = context.assets.reduce((prev, current) => (prev.valueChange < current.valueChange ? prev : current), { name: '', valueChange: Infinity });


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
                            <KpiCard title="Top Gainer (24h)" value={topGainer.name} subValue={topGainer.valueChange !== -Infinity ? `${formatCurrency(topGainer.valueChange, 2)}` : 'N/A'} className={topGainer.valueChange > 0 ? "text-green-400" : ""}/>
                            <KpiCard title="Top Loser (24h)" value={topLoser.name} subValue={topLoser.valueChange !== Infinity ? `${formatCurrency(topLoser.valueChange, 2)}` : 'N/A'} className={topLoser.valueChange < 0 ? "text-red-400" : ""}/>
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

                return (
                    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <KpiCard title="Total Budgets" value={context.budgets.length} />
                            <KpiCard title="On Track" value={onTrack} className={onTrack === context.budgets.length ? "text-green-400" : ""} />
                            <KpiCard title="Over Limit" value={overBudget} className={overBudget > 0 ? "text-red-400" : ""} />
                            <KpiCard title="Total Allocated" value={formatCurrency(totalBudgeted)} />
                            <KpiCard title="Total Spent" value={formatCurrency(totalSpent)} />
                        </div>
                        <p className="text-sm font-semibold text-gray-300 mb-2 mt-4">Budget Utilization</p>
                        <div className="flex-grow h-60 bg-gray-800/50 rounded-lg p-2 mb-4">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" fontSize={10} interval={0} stroke="#9ca3af" />
                                        <YAxis unit="%" domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
                                        <Tooltip content={<CustomChartTooltip formatter={(v:number) => `${v.toFixed(1)}%`}/>} />
                                        <Legend />
                                        <Bar dataKey="actual" name="Spent" fill="#06b6d4" />
                                        <Bar dataKey="limit" name="Limit" fill="#a78bfa" opacity={0.5} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="No budgets to display." />
                            )}
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


                 return (
                    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <KpiCard title="Pending Approvals" value={pendingApprovals} className={pendingApprovals > 0 ? "text-yellow-400" : ""} />
                            <KpiCard title="Overdue Invoices" value={overdueInvoices} className={overdueInvoices > 0 ? "text-red-400" : ""} />
                            <KpiCard title="Open Compliance" value={openCompliance} className={openCompliance > 0 ? "text-orange-400" : ""} />
                            <KpiCard title="New Anomalies" value={newAnomalies} className={newAnomalies > 0 ? "text-red-400" : ""} />
                            <KpiCard title="Total Revenue" value={formatCurrency(totalRevenue, 0)} />
                            <KpiCard title="Total Expenses" value={formatCurrency(totalExpensesCorp, 0)} />
                            <KpiCard title="Net Profit" value={formatCurrency(netProfit, 0)} className={netProfit >= 0 ? 'text-green-400' : 'text-red-400'} />
                            <KpiCard title="Active Projects" value={context.projects.filter(p => p.status === 'active').length} />
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
                const totalAdsGenerated = context.adProjects.length;
                const activeCampaigns = context.adProjects.filter(p => p.status === 'active').length;
                const campaignsCompleted = context.adProjects.filter(p => p.status === 'completed').length;

                return (
                    <div className="h-full flex flex-col p-4 items-center text-center overflow-y-auto custom-scrollbar">
                        <h4 className="text-2xl font-bold text-white mb-3">AI Ad Studio</h4>
                        <p className="text-gray-400 text-md mb-6 max-w-lg">Generate high-quality video content from a simple text prompt using the Veo 2.0 model, or create engaging ad copy and images for various platforms.</p>
                         
                         <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
                            <KpiCard title="Ads Generated" value={totalAdsGenerated} />
                            <KpiCard title="Active Campaigns" value={activeCampaigns} />
                            <KpiCard title="Completed Campaigns" value={campaignsCompleted} />
                            <KpiCard title="Drafts" value={context.adProjects.filter(p => p.status === 'draft').length} />
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
                        <p className="text-sm">A detailed preview for this module is being generated by our AI.</p>
                        <p className="text-xs mt-2">(Placeholder for {viewId})</p>
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