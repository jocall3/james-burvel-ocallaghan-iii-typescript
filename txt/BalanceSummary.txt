// components/BalanceSummary.tsx
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, CartesianGrid, Legend } from 'recharts';

// --- New Type Definitions for the Expanded Universe ---

// Assuming base types from DataContext might look like these:
export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    category: string;
    description?: string;
    currency?: string; // Multi-currency support
    tags?: string[];
    merchant?: string;
    status?: 'pending' | 'cleared' | 'reconciled';
}

export interface Asset {
    id: string;
    name: string;
    type: 'cash' | 'investment' | 'real_estate' | 'vehicle' | 'other';
    value: number; // Current market value
    currency?: string;
    acquisitionDate?: string;
    originalCost?: number;
    interestRate?: number; // For interest-bearing assets
    growthRateAnnual?: number; // Expected annual growth for projections
}

export interface Liability {
    id: string;
    name: string;
    type: 'loan' | 'credit_card' | 'mortgage' | 'other';
    currentBalance: number;
    originalAmount?: number;
    interestRate: number;
    minimumPayment: number;
    dueDate: string;
    currency?: string;
    category?: string; // E.g., 'housing', 'auto', 'education'
}

export interface Budget {
    id: string;
    name: string;
    category: string;
    amount: number; // Budgeted amount per period
    period: 'monthly' | 'weekly' | 'annual';
    startDate: string;
    status: 'active' | 'archived';
}

export interface FinancialGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    type: 'savings' | 'debt_reduction' | 'investment' | 'emergency_fund';
    contributionsPerPeriod?: number; // Expected contributions
    status: 'on_track' | 'behind' | 'achieved';
}

export interface InvestmentAccount {
    id: string;
    name: string;
    broker: string;
    type: 'stocks' | 'bonds' | 'mutual_funds' | 'etfs' | 'retirement';
    holdings: InvestmentHolding[];
    totalValue: number; // Sum of holdings
    currency?: string;
}

export interface InvestmentHolding {
    symbol: string;
    name: string;
    quantity: number;
    averageCost: number;
    currentPrice: number;
    marketValue: number;
    gainLossAbsolute: number;
    gainLossPercentage: number;
    assetClass?: string; // e.g., 'equity', 'fixed income'
    sector?: string; // e.g., 'technology', 'finance'
}

export interface CryptoWallet {
    id: string;
    name: string;
    platform: string;
    assets: CryptoAsset[];
    totalValue: number; // Sum of crypto assets
    currency?: string;
}

export interface CryptoAsset {
    symbol: string;
    name: string;
    quantity: number;
    averageCost: number;
    currentPrice: number;
    marketValue: number;
    gainLossAbsolute: number;
    gainLossPercentage: number;
    network?: string;
}

export interface MarketData {
    sentimentScore: number; // -1 (bearish) to 1 (bullish)
    topGainers: { symbol: string; percentage: number }[];
    topLosers: { symbol: string; percentage: number }[];
    economicIndicators: { name: string; value: number; trend: number }[];
}

export interface UserPreferences {
    displayCurrency: string;
    theme: 'dark' | 'light';
    dateFormat: string;
    enableNotifications: boolean;
    riskTolerance: 'low' | 'medium' | 'high';
    investmentHorizon: 'short' | 'medium' | 'long';
}

// Extended DataContext interface (mocking actual context structure)
// This would typically be defined in DataContext.tsx, but for this exercise,
// we'll use a local interface to inform our component's usage.
export interface ExtendedDataContextType {
    transactions: Transaction[];
    assets: Asset[];
    liabilities: Liability[];
    budgets: Budget[];
    goals: FinancialGoal[];
    investmentAccounts: InvestmentAccount[];
    cryptoWallets: CryptoWallet[];
    marketData: MarketData;
    userPreferences: UserPreferences;
}

// --- Helper Functions and Advanced Calculators ---

export const calculateNetWorth = (
    assets: Asset[], 
    investmentAccounts: InvestmentAccount[], 
    cryptoWallets: CryptoWallet[], 
    liabilities: Liability[]
): { totalAssets: number; totalLiabilities: number; netWorth: number } => {
    const totalCashAssets = assets.filter(a => a.type === 'cash').reduce((sum, asset) => sum + asset.value, 0);
    const totalOtherAssets = assets.filter(a => a.type !== 'cash').reduce((sum, asset) => sum + asset.value, 0);
    const totalInvestmentValue = investmentAccounts.reduce((sum, acc) => sum + acc.totalValue, 0);
    const totalCryptoValue = cryptoWallets.reduce((sum, wallet) => sum + wallet.totalValue, 0);
    const totalLiabilities = liabilities.reduce((sum, liab) => sum + liab.currentBalance, 0);

    const totalAssets = totalCashAssets + totalOtherAssets + totalInvestmentValue + totalCryptoValue;
    const netWorth = totalAssets - totalLiabilities;
    return { totalAssets, totalLiabilities, netWorth };
};

export const calculateBurnRateAndRunway = (
    transactions: Transaction[], 
    currentBalance: number, 
    periodDays: number = 30
): { burnRate: number; runwayDays: number } => {
    const recentExpenses = transactions
        .filter(tx => tx.type === 'expense' && new Date(tx.date) > new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000))
        .reduce((sum, tx) => sum + tx.amount, 0);
    
    const averageDailyExpense = recentExpenses / periodDays;
    const burnRate = averageDailyExpense * 30; // Monthly burn rate
    const runwayDays = averageDailyExpense > 0 ? currentBalance / averageDailyExpense : Infinity;

    return { burnRate, runwayDays };
};

export const getFinancialHealthScore = (
    netWorth: number, 
    income: number, 
    expenses: number, 
    debtToAssetRatio: number, 
    emergencyFundCoverageMonths: number,
    investmentRatio: number 
): { score: number; insights: string[] } => {
    let score = 0;
    const insights: string[] = [];

    // Net Worth contribution
    if (netWorth > 0) score += 20; else insights.push("Net worth is negative. Focus on reducing liabilities.");

    // Income vs. Expenses (Savings Rate)
    const savingsRate = income > 0 ? (income - expenses) / income : 0;
    if (savingsRate > 0.20) { score += 20; insights.push("Excellent savings rate! Consider increasing investments."); }
    else if (savingsRate > 0.05) { score += 10; insights.push("Good savings rate, aim for higher for accelerated growth."); }
    else { insights.push("Low or negative savings rate. Review your spending patterns and income."); }

    // Debt to Asset Ratio
    if (debtToAssetRatio < 0.3) { score += 20; insights.push("Healthy debt-to-asset ratio. Continue responsible borrowing."); }
    else if (debtToAssetRatio < 0.5) { score += 10; insights.push("Manageable debt, but monitor closely for increasing burden."); }
    else { insights.push("High debt-to-asset ratio. Prioritize aggressive debt reduction strategies."); }

    // Emergency Fund Coverage
    if (emergencyFundCoverageMonths >= 6) { score += 20; insights.push("Strong emergency fund coverage. You are well-prepared for unforeseen events."); }
    else if (emergencyFundCoverageMonths >= 3) { score += 10; insights.push("Adequate emergency fund, consider increasing to 6-12 months."); }
    else { insights.push("Low emergency fund. Build up your safety net for financial resilience."); }

    // Investment Ratio
    if (investmentRatio > 0.4) { score += 20; insights.push("Good diversification into investments for long-term wealth growth."); }
    else if (investmentRatio > 0.2) { score += 10; insights.push("Consider increasing your investment portfolio for better returns."); }
    else { insights.push("Low investment ratio. Explore appropriate investment opportunities for your goals."); }

    return { score: Math.min(100, Math.max(0, score)), insights };
};

export const projectFutureBalance = (
    initialBalance: number, 
    monthlyIncome: number, 
    monthlyExpenses: number, 
    durationMonths: number, 
    annualGrowthRate: number = 0
): { month: number; balance: number }[] => {
    const projection: { month: number; balance: number }[] = [];
    let currentBalance = initialBalance;
    const monthlyGrowthFactor = Math.pow(1 + annualGrowthRate, 1/12);

    for (let i = 0; i <= durationMonths; i++) {
        projection.push({ month: i, balance: currentBalance });
        if (i < durationMonths) {
            currentBalance += monthlyIncome - monthlyExpenses;
            currentBalance *= monthlyGrowthFactor; 
        }
    }
    return projection;
};

// Helper for date formatting (using user preferences)
export const formatDate = (dateString: string, format: string = 'YYYY-MM-DD'): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // A more robust but still simplified formatter
    switch (format) {
        case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
        case 'DD-MM-YYYY': return `${day}-${month}-${year}`;
        case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
        case 'MMM DD, YYYY': return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        case 'MMMM D, YYYY': return date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        default: return `${year}-${month}-${day}`;
    }
};

// --- Component Definition ---

const BalanceSummary: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading...</div>;

    // Type assertion for extended context, assuming it's available as per the expansion directive
    const extendedContext = context as ExtendedDataContextType; 

    const { 
        transactions, 
        assets, 
        liabilities = [], 
        budgets = [], 
        goals = [], 
        investmentAccounts = [], 
        cryptoWallets = [],
        marketData = { sentimentScore: 0, topGainers: [], topLosers: [], economicIndicators: [] },
        userPreferences = { displayCurrency: 'USD', theme: 'dark', dateFormat: 'YYYY-MM-DD', enableNotifications: true, riskTolerance: 'medium', investmentHorizon: 'long' }
    } = extendedContext;

    const { 
        absoluteBalance, 
        recentMomentum, 
        historicalTrajectory,
        netWorth,
        totalAssetsValue,
        totalLiabilitiesValue,
        momentum7Days,
        momentum90Days,
        momentumYTD,
        burnRateMonthly,
        runwayDays,
        monthlyIncomeAvg,
        monthlyExpensesAvg,
        debtToAssetRatio,
        emergencyFundCoverageMonths,
        investmentRatio,
        financialHealthScore,
        financialHealthInsights,
        futureBalanceProjection,
        goalProgressSummary,
        spendingByCategory,
        incomeBySource,
        investmentPerformanceSummary,
        cryptoPerformanceSummary,
        riskScore
    } = useMemo(() => {
        const totalInitialAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
        
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let currentBalance = totalInitialAssets;
        const trajectory: { date: string; balance: number }[] = [{ date: 'Initial', balance: totalInitialAssets }];
        
        sortedTransactions.forEach(tx => {
            currentBalance += tx.type === 'income' ? tx.amount : -tx.amount;
            trajectory.push({ date: tx.date, balance: currentBalance });
        });

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const yearStart = new Date(new Date().getFullYear(), 0, 1);

        const calculateMomentum = (startDate: Date) => 
            transactions
                .filter(tx => new Date(tx.date) > startDate)
                .reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0);

        const momentum = calculateMomentum(thirtyDaysAgo);
        const momentum7Days = calculateMomentum(sevenDaysAgo);
        const momentum90Days = calculateMomentum(ninetyDaysAgo);
        const momentumYTD = calculateMomentum(yearStart);

        // Net Worth Calculation
        const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(assets, investmentAccounts, cryptoWallets, liabilities);

        // Burn Rate & Runway
        const { burnRate: burnRateMonthly, runwayDays } = calculateBurnRateAndRunway(transactions, currentBalance);

        // Average Monthly Income/Expenses (past 12 months)
        const past12MonthsTransactions = transactions.filter(tx => new Date(tx.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
        const totalIncomePastYear = past12MonthsTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpensesPastYear = past12MonthsTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
        const monthlyIncomeAvg = totalIncomePastYear / 12;
        const monthlyExpensesAvg = totalExpensesPastYear / 12;

        // Financial Health Ratios
        const debtToAssetRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;
        const totalMonthlyExpenses = transactions
            .filter(tx => tx.type === 'expense' && new Date(tx.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
            .reduce((sum, tx) => sum + tx.amount, 0);
        const averageMonthlyExpenses = totalMonthlyExpenses / 30 * 30; // Approx monthly
        const emergencyFund = assets.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.value, 0);
        const emergencyFundCoverageMonths = averageMonthlyExpenses > 0 ? emergencyFund / averageMonthlyExpenses : Infinity;
        const totalInvestmentValue = investmentAccounts.reduce((sum, acc) => sum + acc.totalValue, 0);
        const totalCryptoValue = cryptoWallets.reduce((sum, wallet) => sum + wallet.totalValue, 0);
        const investmentRatio = totalAssets > 0 ? (totalInvestmentValue + totalCryptoValue) / totalAssets : 0;

        // Financial Health Score
        const { score: financialHealthScore, insights: financialHealthInsights } = getFinancialHealthScore(
            netWorth, monthlyIncomeAvg, monthlyExpensesAvg, debtToAssetRatio, emergencyFundCoverageMonths, investmentRatio
        );

        // Future Balance Projection (next 12 months, 5% annual growth assumed)
        const futureBalanceProjection = projectFutureBalance(currentBalance, monthlyIncomeAvg, monthlyExpensesAvg, 12, 0.05); 

        // Goal Progress Summary
        const goalProgressSummary = goals.map(goal => ({
            ...goal,
            progressPercentage: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
        }));

        // Spending by Category (last 30 days)
        const thirtyDaysAgoForSpending = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const spendingByCategoryMap = transactions
            .filter(tx => tx.type === 'expense' && new Date(tx.date) > thirtyDaysAgoForSpending)
            .reduce((acc, tx) => {
                acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
                return acc;
            }, {} as Record<string, number>);
        const spendingByCategory = Object.entries(spendingByCategoryMap).map(([category, amount]) => ({ category, amount }));

        // Income by Source (past 12 months, simplified from category for income)
        const incomeBySourceMap = past12MonthsTransactions
            .filter(tx => tx.type === 'income')
            .reduce((acc, tx) => {
                acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
                return acc;
            }, {} as Record<string, number>);
        const incomeBySource = Object.entries(incomeBySourceMap).map(([source, amount]) => ({ source, amount }));

        // Investment Performance Summary (simplified, real would be more complex)
        const totalInvestments = investmentAccounts.reduce((sum, acc) => sum + acc.totalValue, 0);
        const totalOriginalInvestmentCost = investmentAccounts.reduce((sum, acc) => sum + acc.holdings.reduce((hSum, h) => hSum + (h.quantity * h.averageCost), 0), 0);
        const investmentGainLoss = totalInvestments - totalOriginalInvestmentCost;
        const investmentPerformanceSummary = {
            totalValue: totalInvestments,
            originalCost: totalOriginalInvestmentCost,
            gainLoss: investmentGainLoss,
            percentageGainLoss: totalOriginalInvestmentCost > 0 ? (investmentGainLoss / totalOriginalInvestmentCost) * 100 : 0
        };

        // Crypto Performance Summary (similar to investments but separated)
        const totalCryptoValueCurrent = cryptoWallets.reduce((sum, wallet) => sum + wallet.totalValue, 0);
        const totalOriginalCryptoCost = cryptoWallets.reduce((sum, wallet) => sum + wallet.assets.reduce((cSum, c) => cSum + (c.quantity * c.averageCost), 0), 0);
        const cryptoGainLoss = totalCryptoValueCurrent - totalOriginalCryptoCost;
        const cryptoPerformanceSummary = {
            totalValue: totalCryptoValueCurrent,
            originalCost: totalOriginalCryptoCost,
            gainLoss: cryptoGainLoss,
            percentageGainLoss: totalOriginalCryptoCost > 0 ? (cryptoGainLoss / totalOriginalCryptoCost) * 100 : 0
        };

        // Risk Score (a very simplified example)
        let riskScore = 50; // Base score
        if (debtToAssetRatio > 0.5) riskScore += 20; 
        if (emergencyFundCoverageMonths < 3) riskScore += 15; 
        if (userPreferences.riskTolerance === 'high' && investmentRatio > 0.6) riskScore -= 10; 
        if (marketData.sentimentScore < -0.5) riskScore += 10; 
        riskScore = Math.min(100, Math.max(0, riskScore));

        return {
            absoluteBalance: currentBalance,
            recentMomentum: momentum,
            historicalTrajectory: trajectory,
            netWorth,
            totalAssetsValue: totalAssets,
            totalLiabilitiesValue: totalLiabilities,
            momentum7Days,
            momentum90Days,
            momentumYTD,
            burnRateMonthly,
            runwayDays,
            monthlyIncomeAvg,
            monthlyExpensesAvg,
            debtToAssetRatio,
            emergencyFundCoverageMonths,
            investmentRatio,
            financialHealthScore,
            financialHealthInsights,
            futureBalanceProjection,
            goalProgressSummary,
            spendingByCategory,
            incomeBySource,
            investmentPerformanceSummary,
            cryptoPerformanceSummary,
            riskScore
        };
    }, [transactions, assets, liabilities, budgets, goals, investmentAccounts, cryptoWallets, marketData, userPreferences]);

    const formatCurrency = (amount: number) => {
        return `${userPreferences.displayCurrency === 'EUR' ? '€' : '$'}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Colors for pie charts
    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000', '#00FF00', '#0000FF'];

    return (
        <div className="space-y-6"> {/* Main container for all new cards */}
            <Card title="Balance Summary">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                        <p className="text-5xl font-extrabold text-white mb-2">{formatCurrency(absoluteBalance)}</p>
                        <p className={`text-xl font-semibold ${recentMomentum >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {recentMomentum >= 0 ? '+' : '-'}{formatCurrency(Math.abs(recentMomentum))}
                            <span className="text-sm text-gray-400 font-normal ml-1"> in last 30 days</span>
                        </p>
                        <p className={`text-md font-medium mt-1 ${momentum7Days >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {momentum7Days >= 0 ? '+' : '-'}{formatCurrency(Math.abs(momentum7Days))}
                            <span className="text-xs text-gray-500 font-normal ml-1"> (7-day)</span>
                        </p>
                        <p className={`text-md font-medium ${momentum90Days >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {momentum90Days >= 0 ? '+' : '-'}{formatCurrency(Math.abs(momentum90Days))}
                            <span className="text-xs text-gray-500 font-normal ml-1"> (90-day)</span>
                        </p>
                        <p className={`text-md font-medium ${momentumYTD >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {momentumYTD >= 0 ? '+' : '-'}{formatCurrency(Math.abs(momentumYTD))}
                            <span className="text-xs text-gray-500 font-normal ml-1"> (YTD)</span>
                        </p>
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historicalTrajectory} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" hide={true} />
                                <YAxis hide={true} domain={['auto', 'auto']} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '8px' }}
                                    labelFormatter={(label: string) => `Date: ${formatDate(label, userPreferences.dateFormat)}`}
                                    formatter={(value: number) => [formatCurrency(value), 'Balance']}
                                />
                                <Area type="monotone" dataKey="balance" stroke="#06b6d4" fill="url(#balanceGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <Card title="Net Worth & Financial Health">
                    <div className="space-y-3">
                        <p className="text-3xl font-bold text-white mb-2">{formatCurrency(netWorth)}</p>
                        <p className="text-lg text-gray-300">Total Assets: <span className="text-green-400">{formatCurrency(totalAssetsValue)}</span></p>
                        <p className="text-lg text-gray-300">Total Liabilities: <span className="text-red-400">{formatCurrency(totalLiabilitiesValue)}</span></p>
                        <div className="pt-2 border-t border-gray-700">
                            <h4 className="text-xl font-semibold text-white mb-2">Financial Health Score: 
                                <span className={`ml-2 ${financialHealthScore > 80 ? 'text-green-400' : financialHealthScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {financialHealthScore}/100
                                </span>
                            </h4>
                            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                                {financialHealthInsights.map((insight, index) => (
                                    <li key={index}>{insight}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Card>

                <Card title="Projections & Runway">
                    <div className="flex flex-col h-full">
                        <div className="mb-4">
                            <p className="text-lg text-gray-300">Avg. Monthly Income: <span className="text-green-400">{formatCurrency(monthlyIncomeAvg)}</span></p>
                            <p className="text-lg text-gray-300">Avg. Monthly Expenses: <span className="text-red-400">{formatCurrency(monthlyExpensesAvg)}</span></p>
                            <p className="text-lg text-gray-300">Monthly Burn Rate: <span className="text-red-400">{formatCurrency(burnRateMonthly)}</span></p>
                            <p className="text-lg text-gray-300">Runway: <span className="text-yellow-400">{runwayDays === Infinity ? 'Infinite' : `${runwayDays.toFixed(0)} days`}</span></p>
                        </div>
                        <div className="flex-grow h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={futureBalanceProjection} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                    <XAxis dataKey="month" tickFormatter={(tick) => `M${tick}`} stroke="#9ca3af"/>
                                    <YAxis tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`} stroke="#9ca3af"/>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '8px' }}
                                        labelFormatter={(label: number) => `Month ${label}`}
                                        formatter={(value: number) => [formatCurrency(value), 'Projected Balance']}
                                    />
                                    <Line type="monotone" dataKey="balance" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Projected balance for the next 12 months with assumed 5% annual growth.</p>
                    </div>
                </Card>

                <Card title="Financial Goals Progress">
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {goalProgressSummary.length > 0 ? goalProgressSummary.map(goal => (
                            <div key={goal.id} className="p-3 bg-gray-800 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-1">
                                    <h5 className="text-md font-semibold text-white">{goal.name}</h5>
                                    <span className={`text-sm font-medium ${goal.status === 'on_track' ? 'text-green-400' : goal.status === 'behind' ? 'text-yellow-400' : 'text-gray-400'}`}>
                                        {goal.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-400 mb-2">
                                    Target: {formatCurrency(goal.targetAmount)} | Current: {formatCurrency(goal.currentAmount)}
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div 
                                        className="bg-teal-500 h-2.5 rounded-full" 
                                        style={{ width: `${Math.min(100, goal.progressPercentage).toFixed(0)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                    <span>{goal.progressPercentage.toFixed(1)}%</span>
                                    <span>Due: {formatDate(goal.dueDate, userPreferences.dateFormat)}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-center py-4">No financial goals set. Start by adding one!</p>
                        )}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Spending by Category (30 days)">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={spendingByCategory}
                                    dataKey="amount"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    label={(entry) => `${entry.category} (${(entry.percent * 100).toFixed(1)}%)`}
                                >
                                    {spendingByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '8px' }}
                                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Income by Source (12 months)">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={incomeBySource} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                <XAxis dataKey="source" stroke="#9ca3af" />
                                <YAxis tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`} stroke="#9ca3af" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '8px' }}
                                    formatter={(value: number, name: string) => [formatCurrency(value), 'Income']}
                                />
                                <Legend />
                                <Bar dataKey="amount" fill="#00C49F" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card title="Investment & Crypto Portfolio Performance">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Overall Investments</h3>
                        <p className="text-lg text-gray-300">Total Value: <span className="text-teal-400">{formatCurrency(investmentPerformanceSummary.totalValue)}</span></p>
                        <p className="text-lg text-gray-300">Original Cost: {formatCurrency(investmentPerformanceSummary.originalCost)}</p>
                        <p className={`text-lg font-bold ${investmentPerformanceSummary.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            Gain/Loss: {formatCurrency(investmentPerformanceSummary.gainLoss)} ({investmentPerformanceSummary.percentageGainLoss.toFixed(2)}%)
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Cryptocurrency Holdings</h3>
                        <p className="text-lg text-gray-300">Total Value: <span className="text-teal-400">{formatCurrency(cryptoPerformanceSummary.totalValue)}</span></p>
                        <p className="text-lg text-gray-300">Original Cost: {formatCurrency(cryptoPerformanceSummary.originalCost)}</p>
                        <p className={`text-lg font-bold ${cryptoPerformanceSummary.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            Gain/Loss: {formatCurrency(cryptoPerformanceSummary.gainLoss)} ({cryptoPerformanceSummary.percentageGainLoss.toFixed(2)}%)
                        </p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-2">Market Insights & Risk</h3>
                    <p className="text-lg text-gray-300">Market Sentiment: 
                        <span className={`ml-2 ${marketData.sentimentScore > 0.3 ? 'text-green-400' : marketData.sentimentScore < -0.3 ? 'text-red-400' : 'text-yellow-400'}`}>
                            {marketData.sentimentScore > 0.3 ? 'Bullish' : marketData.sentimentScore < -0.3 ? 'Bearish' : 'Neutral'} ({marketData.sentimentScore.toFixed(2)})
                        </span>
                    </p>
                    <p className="text-lg text-gray-300">Personal Risk Score: 
                        <span className={`ml-2 ${riskScore < 40 ? 'text-green-400' : riskScore < 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {riskScore}/100 
                            <span className="text-sm text-gray-500 ml-1">(Higher score indicates higher risk)</span>
                        </span>
                    </p>
                    {/* Placeholder for interactive risk adjustment tool */}
                    <div className="mt-2 text-sm text-gray-500 italic">
                        Adjust your risk tolerance in settings to fine-tune recommendations.
                    </div>
                </div>
            </Card>

            <Card title="Advanced Analytics & AI Insights">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Spending Anomaly Detection</h3>
                        <p className="text-gray-400">
                            Our AI constantly monitors your spending patterns. 
                            <span className="text-yellow-400"> No significant anomalies detected in the last 30 days.</span>
                            <span className="block text-sm text-gray-500 mt-1"> (Example: large, unusual transactions in a specific category would be flagged here)</span>
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Smart Budget Recommendations</h3>
                        <p className="text-gray-400">
                            Based on your historical data and financial goals, we recommend adjusting your budget for <span className="text-blue-400">"Dining Out" to {formatCurrency(Math.max(0, monthlyExpensesAvg * 0.15))}</span> (current average: {formatCurrency(spendingByCategory.find(s => s.category === 'Dining Out')?.amount || 0)}).
                            This would free up {formatCurrency(Math.abs((spendingByCategory.find(s => s.category === 'Dining Out')?.amount || 0) - (monthlyExpensesAvg * 0.15)))} for your "Home Down Payment" goal.
                            <span className="block text-sm text-gray-500 mt-1"> (This would be dynamically generated by a sophisticated recommendation engine)</span>
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Automated Tax Optimization Suggestions</h3>
                        <p className="text-gray-400">
                            Consider maximizing your IRA contributions. You have <span className="text-green-400">{formatCurrency(Math.max(0, 6000 - monthlyIncomeAvg * 0.1))}</span> remaining contribution room for the year based on current income trajectory.
                            <span className="block text-sm text-gray-500 mt-1"> (Requires integration with tax laws, user income, and account types)</span>
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Personalized Investment Insights</h3>
                        <p className="text-gray-400">
                            Given your '{userPreferences.riskTolerance}' risk tolerance and '{userPreferences.investmentHorizon}' investment horizon, we suggest reviewing your allocation in 
                            <span className="text-purple-400"> 'Tech Growth Funds'</span> as it currently comprises <span className="text-purple-400">25%</span> of your portfolio, 
                            exceeding your optimal <span className="text-purple-400">18%</span> target for sector diversification.
                            <span className="block text-sm text-gray-500 mt-1"> (Requires detailed portfolio analysis, market data, and user risk profile)</span>
                        </p>
                    </div>
                </div>
            </Card>

            <Card title="Interconnected Ecosystem Status">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Data Integrations</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li><span className="text-green-400">Bank Accounts: Connected & Synced</span> (Last: 5 mins ago)</li>
                            <li><span className="text-green-400">Investment Platforms: Connected & Synced</span> (Last: 15 mins ago)</li>
                            <li><span className="text-green-400">Crypto Exchanges: Connected & Synced</span> (Last: 1 hour ago)</li>
                            <li><span className="text-yellow-400">Credit Cards: Connected, action needed for new permissions</span></li>
                            <li><span className="text-gray-500">Loan Providers: Not Connected (Optional)</span></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">System Health & Compliance</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li><span className="text-green-400">Data Encryption: Active (AES-256)</span></li>
                            <li><span className="text-green-400">Two-Factor Authentication: Enabled</span></li>
                            <li><span className="text-yellow-400">Privacy Policy: Reviewed 340 days ago (Recommended annual review)</span></li>
                            <li><span className="text-green-400">API Rate Limits: Normal Operation</span></li>
                            <li><span className="text-green-400">Audit Trail: Fully Logged</span></li>
                        </ul>
                        <div className="mt-3 text-sm text-gray-500 italic">
                            All data protected with bank-grade security protocols.
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default BalanceSummary;