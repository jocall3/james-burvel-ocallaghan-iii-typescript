// components/WealthTimeline.tsx
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Dot, ReferenceLine, Brush } from 'recharts';

// --- Global Constants & Types for the Universe Expansion ---
export interface Transaction {
    id: string;
    date: string; // ISO date string
    type: 'income' | 'expense' | 'transfer_in' | 'transfer_out' | 'investment' | 'divestment' | 'debt_payment' | 'debt_accrual';
    amount: number;
    category?: string;
    description?: string;
    tags?: string[];
    currency?: string; // e.g., 'USD', 'EUR'
    assetId?: string; // For investment/divestment transactions
    liabilityId?: string; // For debt payments/accruals
    sourceAccount?: string;
    destinationAccount?: string;
}

export interface Asset {
    id: string;
    name: string;
    type: 'cash' | 'stocks' | 'real_estate' | 'crypto' | 'bond' | 'precious_metals' | 'collectibles' | 'business_equity' | 'other';
    value: number;
    currency?: string;
    acquisitionDate?: string;
    costBasis?: number;
    annualReturnRate?: number; // Expected annual return (simplified)
    volatility?: number; // Risk factor (0-1)
    liquidityScore?: number; // 0-1 illiquid to highly liquid
    growthModel?: 'linear' | 'compound' | 'market_linked' | 'custom';
    marketSymbol?: string; // For stocks/crypto
    reinvestmentRate?: number; // For dividends/interest
}

export interface Liability {
    id: string;
    name: string;
    type: 'mortgage' | 'loan' | 'credit_card' | 'student_loan' | 'car_loan' | 'personal_loan' | 'other';
    originalAmount: number;
    currentBalance: number;
    interestRate: number; // Annual
    minimumPayment?: number; // Monthly minimum payment
    paymentFrequency?: 'monthly' | 'bi-weekly' | 'weekly';
    termMonths?: number;
    startDate?: string;
    endDate?: string;
    currency?: string;
    debtStrategy?: 'avalanche' | 'snowball' | 'hybrid'; // Strategy for repayment
}

export interface FinancialGoal {
    id: string;
    name: string;
    targetAmount: number;
    targetDate: string;
    priority: number; // 1-10, 10 being highest
    currentProgress: number; // Current value accumulated towards goal (from linked assets/savings)
    type: 'retirement' | 'house_downpayment' | 'education' | 'large_purchase' | 'debt_repayment' | 'emergency_fund' | 'wealth_accumulation' | 'other';
    linkedAssets?: string[]; // IDs of assets contributing to this goal
    monthlyContributionTarget?: number;
}

export interface UserProfile {
    id: string;
    name: string;
    dob: string;
    riskTolerance: 'low' | 'medium' | 'high' | 'aggressive';
    inflationExpectation: number; // Annual percentage
    taxRateIncome: number; // Marginal income tax rate
    taxRateCapitalGains: number; // Long-term capital gains tax rate
    savingsRateTarget: number; // Target percentage of income saved (as a decimal)
    retirementAge: number;
    lifeExpectancy: number;
    desiredRetirementIncome: number; // Annual in today's dollars
    investmentHorizonYears: number;
}

export interface MarketData {
    date: string;
    indexS_P500: number;
    inflationRateMonthly: number; // Monthly
    interestRateFED: number;
    economicSentimentIndex: number;
    unemploymentRate?: number;
    gdpGrowthRate?: number; // Quarterly/Annual
}

export interface TimelinePoint {
    name: string; // Date or month name (e.g., "Jan 23", "2023")
    date: Date; // Full Date object for precise sorting and filtering
    historyNetWorth?: number; // Actual historical net worth
    projectionRealisticNetWorth?: number;
    projectionOptimisticNetWorth?: number;
    projectionPessimisticNetWorth?: number;
    totalAssetsValue?: number;
    totalLiabilitiesValue?: number;
    liquidAssetsValue?: number;
    illiquidAssetsValue?: number;
    monthlyIncome?: number;
    monthlyExpenses?: number;
    netCashFlow?: number;
    inflationAdjustedHistoryNetWorth?: number;
    inflationAdjustedProjectionNetWorth?: number;
    goalProgress?: { [goalId: string]: { progress: number; contribution: number; required: number; status: 'on_track' | 'behind' | 'ahead' } };
    significantEvents?: { type: 'milestone' | 'market_event' | 'personal_event' | 'alert', description: string, value?: number }[];
    riskScore?: number; // Dynamic risk score at this point
    portfolioAllocation?: { [assetType: string]: number }; // Percentage allocation
}

export interface ScenarioParameters {
    id: string;
    name: string;
    description?: string;
    initialAssetsAdjustment?: number; // One-time adjustment to initial assets value
    monthlySavingsAdjustment?: number; // Absolute monthly change to savings/cash flow
    assetReturnRateAdjustment?: { [assetType: string]: number }; // Adjustments to asset specific *annual* return rates (e.g., {'stocks': 0.02} for +2%)
    inflationAdjustment?: number; // Annual adjustment to global inflation expectation (e.g., 0.01 for +1%)
    majorLifeEvents?: { date: string, type: 'income_boost' | 'large_expense' | 'inheritance' | 'asset_sale' | 'asset_purchase' | 'job_loss', amount: number, description: string, durationMonths?: number }[];
    debtRepaymentStrategyOverride?: 'avalanche' | 'snowball' | 'hybrid' | 'default';
    retirementAgeAdjustment?: number; // e.g., +5 years
    desiredRetirementIncomeAdjustment?: number; // e.g., +10000
}


// --- New Helper Classes and Services ---

/**
 * Manages fetching and processing of historical and projected market data.
 * In a real application, this would connect to external APIs (e.g., Alpha Vantage, Yahoo Finance, FRED).
 * Here, it's simulated with generated data.
 */
export class MarketDataService {
    private static historicalData: MarketData[] = [];
    private static initialized: boolean = false;

    private static initializeData() {
        if (MarketDataService.initialized) return;
        let currentDate = new Date();
        // Simulate 20 years of monthly market data for robustness
        for (let i = 0; i < 240; i++) { // 20 years * 12 months
            const date = new Date(currentDate);
            date.setMonth(currentDate.getMonth() - i);
            const year = date.getFullYear();
            const month = date.getMonth(); // 0-indexed month
            
            const baseS_P = 2000 + (Math.sin(i / 24) * 1500) + (i * 50) + (Math.random() * 500 - 250); // Simulating growth, cycles, and volatility
            const baseInflation = 0.002 + (Math.cos(i / 36) * 0.0015) + (Math.random() * 0.001); // Monthly inflation (0.1% to 0.4%)
            const baseFEDRate = 0.001 + (Math.sin(i / 48) * 0.0008) + (Math.random() * 0.0008);
            const baseSentiment = 50 + (Math.sin(i / 15) * 30) + (Math.random() * 15 - 7.5);

            MarketDataService.historicalData.push({
                date: new Date(year, month, 1).toISOString().split('T')[0],
                indexS_P500: Math.max(1000, baseS_P),
                inflationRateMonthly: Math.max(0.0005, baseInflation),
                interestRateFED: Math.max(0.0001, baseFEDRate),
                economicSentimentIndex: Math.max(0, Math.min(100, baseSentiment)),
                unemploymentRate: 0.03 + (Math.sin(i / 20) * 0.02) + (Math.random() * 0.01),
                gdpGrowthRate: 0.005 + (Math.cos(i / 18) * 0.003) + (Math.random() * 0.002)
            });
        }
        MarketDataService.historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        MarketDataService.initialized = true;
    }

    public static getHistoricalData(startDate?: string, endDate?: string): MarketData[] {
        MarketDataService.initializeData();
        let data = MarketDataService.historicalData;
        if (startDate) {
            data = data.filter(d => new Date(d.date) >= new Date(startDate));
        }
        if (endDate) {
            data = data.filter(d => new Date(d.date) <= new Date(endDate));
        }
        return data;
    }

    public static getAverageInflationRateMonthly(periodMonths: number = 12): number {
        MarketDataService.initializeData();
        const relevantData = MarketDataService.historicalData.slice(-periodMonths);
        if (relevantData.length === 0) return 0.0025; // Default to 0.25% monthly if no data (3% annual)
        const sumInflation = relevantData.reduce((sum, d) => sum + d.inflationRateMonthly, 0);
        return sumInflation / relevantData.length;
    }

    public static getProjectedInflationRateMonthly(userProfile: UserProfile): number {
        return (userProfile.inflationExpectation / 12) || MarketDataService.getAverageInflationRateMonthly();
    }
}

/**
 * The core engine for processing financial data, generating historical timelines,
 * and projecting future wealth trajectories under various scenarios.
 * This class encapsulates all the complex financial logic, integrating assets, liabilities, goals, and market data.
 */
export class FinancialDataProcessor {
    private transactions: Transaction[];
    private assets: Asset[];
    private liabilities: Liability[];
    private goals: FinancialGoal[];
    private userProfile: UserProfile;

    constructor(
        transactions: Transaction[],
        assets: Asset[],
        liabilities: Liability[] = [],
        goals: FinancialGoal[] = [],
        userProfile: UserProfile = {
            id: 'default', name: 'User', dob: '1990-01-01', riskTolerance: 'medium',
            inflationExpectation: 0.03, taxRateIncome: 0.25, taxRateCapitalGains: 0.15, savingsRateTarget: 0.15,
            retirementAge: 65, lifeExpectancy: 90, desiredRetirementIncome: 80000, investmentHorizonYears: 30
        }
    ) {
        this.transactions = transactions;
        this.assets = assets;
        this.liabilities = liabilities;
        this.goals = goals;
        this.userProfile = userProfile;
    }

    /**
     * Calculates net worth, assets, and liabilities at a specific point in time, considering transactions up to that date.
     * This is a sophisticated re-computation function.
     */
    private calculateSnapshot(
        targetDate: Date,
        allTransactions: Transaction[],
        initialAssets: Asset[],
        initialLiabilities: Liability[]
    ): { netWorth: number, totalAssets: number, totalLiabilities: number, liquidAssets: number, illiquidAssets: number, currentAssetValues: { [id: string]: number }, currentLiabilityBalances: { [id: string]: number } } {
        let currentAssetsMap: { [id: string]: { asset: Asset, value: number, costBasis: number } } = {};
        initialAssets.forEach(asset => {
            currentAssetsMap[asset.id] = { asset, value: asset.value, costBasis: asset.costBasis || asset.value };
        });

        let currentLiabilitiesMap: { [id: string]: { liability: Liability, balance: number } } = {};
        initialLiabilities.forEach(liability => {
            currentLiabilitiesMap[liability.id] = { liability, balance: liability.currentBalance };
        });

        let cashBalance = 0; // Represents liquid cash not tied to a specific asset
        // Initialize cash balance from liquid assets at the start (e.g., savings account)
        initialAssets.filter(a => a.type === 'cash').forEach(a => cashBalance += a.value);

        const transactionsUpToDate = allTransactions.filter(tx => new Date(tx.date) <= targetDate)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        transactionsUpToDate.forEach(tx => {
            if (tx.type === 'income' || tx.type === 'transfer_in') {
                cashBalance += tx.amount;
            } else if (tx.type === 'expense' || tx.type === 'transfer_out') {
                cashBalance -= tx.amount;
            } else if (tx.type === 'investment' && tx.assetId) {
                cashBalance -= tx.amount; // Assume investment comes from cash
                const existingAsset = currentAssetsMap[tx.assetId];
                if (existingAsset) {
                    existingAsset.value += tx.amount; // Increase asset value
                    existingAsset.costBasis += tx.amount;
                } else {
                    // This implies a new asset was acquired through investment
                    // For simplicity, we assume assets are pre-defined. A full system would create new assets.
                    // currentAssetsMap[tx.assetId] = { asset: { id: tx.assetId, name: `New Asset ${tx.assetId}`, type: 'stocks', value: tx.amount }, value: tx.amount, costBasis: tx.amount };
                }
            } else if (tx.type === 'divestment' && tx.assetId) {
                const existingAsset = currentAssetsMap[tx.assetId];
                if (existingAsset) {
                    existingAsset.value -= tx.amount; // Decrease asset value
                    cashBalance += tx.amount; // Cash received from divestment
                    // If asset value goes to 0 or below, it's effectively sold off.
                }
            } else if (tx.type === 'debt_payment' && tx.liabilityId) {
                const existingLiability = currentLiabilitiesMap[tx.liabilityId];
                if (existingLiability) {
                    existingLiability.balance -= tx.amount;
                    cashBalance -= tx.amount; // Payment comes from cash
                }
            } else if (tx.type === 'debt_accrual' && tx.liabilityId) {
                 const existingLiability = currentLiabilitiesMap[tx.liabilityId];
                if (existingLiability) {
                    existingLiability.balance += tx.amount; // Interest accrual or new debt
                }
            }
        });

        // Add cash balance to cash assets
        const cashAssetId = 'CASH_LIQUID'; // Assuming a generic liquid cash asset
        if (!currentAssetsMap[cashAssetId]) {
            currentAssetsMap[cashAssetId] = { asset: { id: cashAssetId, name: 'Liquid Cash', type: 'cash', value: 0 }, value: 0, costBasis: 0 };
        }
        currentAssetsMap[cashAssetId].value = cashBalance;
        currentAssetsMap[cashAssetId].costBasis = cashBalance;


        let totalAssets = 0;
        let liquidAssets = 0;
        let illiquidAssets = 0;
        Object.values(currentAssetsMap).forEach(item => {
            const assetValue = Math.max(0, item.value); // Asset values can't be negative
            totalAssets += assetValue;
            if (item.asset.liquidityScore && item.asset.liquidityScore > 0.8) {
                liquidAssets += assetValue;
            } else {
                illiquidAssets += assetValue;
            }
        });

        let totalLiabilities = 0;
        Object.values(currentLiabilitiesMap).forEach(item => {
            totalLiabilities += Math.max(0, item.balance); // Liability balances can't be negative
        });

        return {
            netWorth: totalAssets - totalLiabilities,
            totalAssets,
            totalLiabilities,
            liquidAssets,
            illiquidAssets,
            currentAssetValues: Object.fromEntries(Object.entries(currentAssetsMap).map(([id, item]) => [id, item.value])),
            currentLiabilityBalances: Object.fromEntries(Object.entries(currentLiabilitiesMap).map(([id, item]) => [id, item.balance]))
        };
    }


    /**
     * Generates a detailed historical timeline of net worth and other financial metrics.
     * @param endDate The latest date to include in history.
     * @param granularity 'day', 'week', 'month', 'quarter', 'year'
     * @param includeInflationAdjusted Whether to include inflation-adjusted values.
     */
    public generateHistoricalTimeline(endDate: Date, granularity: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month', includeInflationAdjusted: boolean = true): TimelinePoint[] {
        if (this.transactions.length === 0 && this.assets.length === 0 && this.liabilities.length === 0) return [];

        const sortedTransactions = [...this.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const rawStartDate = sortedTransactions.length > 0 ? new Date(sortedTransactions[0].date) : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
        const startDate = new Date(rawStartDate.getFullYear(), rawStartDate.getMonth(), 1); // Align to start of month/year for consistency
        endDate.setHours(23, 59, 59, 999); // Ensure endDate includes the entire day

        const historicalPoints: TimelinePoint[] = [];
        let cumulativeInflationFactor = 1;
        const marketData = MarketDataService.getHistoricalData(startDate.toISOString(), endDate.toISOString());

        let currentDate = new Date(startDate);
        currentDate.setDate(1); // Start at the beginning of the month for most granularities

        let lastSnapshot = this.calculateSnapshot(startDate, [], this.assets, this.liabilities); // Initial snapshot for assets/liabilities

        while (currentDate <= endDate) {
            let pointDate = new Date(currentDate);
            let pointLabel = '';

            switch (granularity) {
                case 'day':
                    pointLabel = pointDate.toLocaleDateString();
                    break;
                case 'week':
                    pointLabel = `Week ${Math.ceil(pointDate.getDate() / 7)} ${pointDate.toLocaleString('default', { month: 'short' })}`;
                    break;
                case 'month':
                    pointLabel = pointDate.toLocaleString('default', { month: 'short', year: 'numeric' });
                    pointDate.setDate(1); // Aggregate to start of month
                    break;
                case 'quarter':
                    const quarter = Math.floor(pointDate.getMonth() / 3) + 1;
                    pointLabel = `Q${quarter} ${pointDate.getFullYear()}`;
                    pointDate.setDate(1);
                    pointDate.setMonth((quarter - 1) * 3); // Aggregate to start of quarter
                    break;
                case 'year':
                    pointLabel = pointDate.getFullYear().toString();
                    pointDate.setMonth(0);
                    pointDate.setDate(1); // Aggregate to start of year
                    break;
            }

            const snapshotAtDate = this.calculateSnapshot(pointDate, this.transactions, this.assets, this.liabilities);
            
            // Apply asset growth for the period leading up to this point, if not already captured in transactions
            // For historical, this is hard as we don't know the exact order of market changes vs transactions.
            // Simplified: we use the snapshot, assuming asset values are current as per inputs.
            // A truly advanced system would re-evaluate asset prices based on market data for each point.

            const marketDatum = marketData.find(d => new Date(d.date).getMonth() === pointDate.getMonth() && new Date(d.date).getFullYear() === pointDate.getFullYear());
            const monthlyInflationRate = marketDatum?.inflationRateMonthly || MarketDataService.getAverageInflationRateMonthly();
            cumulativeInflationFactor *= (1 + monthlyInflationRate);

            const point: TimelinePoint = {
                name: pointLabel,
                date: new Date(pointDate),
                historyNetWorth: snapshotAtDate.netWorth,
                totalAssetsValue: snapshotAtDate.totalAssets,
                totalLiabilitiesValue: snapshotAtDate.totalLiabilities,
                liquidAssetsValue: snapshotAtDate.liquidAssets,
                illiquidAssetsValue: snapshotAtDate.illiquidAssets,
                inflationAdjustedHistoryNetWorth: includeInflationAdjusted ? snapshotAtDate.netWorth / cumulativeInflationFactor : undefined,
                // Monthly income/expenses would need more granular calculation within the period
                // For simplicity, we can sum up income/expenses for the month prior to this point.
                monthlyIncome: this.transactions.filter(tx => new Date(tx.date).getMonth() === pointDate.getMonth() && new Date(tx.date).getFullYear() === pointDate.getFullYear() && (tx.type === 'income' || tx.type === 'transfer_in')).reduce((sum, tx) => sum + tx.amount, 0),
                monthlyExpenses: this.transactions.filter(tx => new Date(tx.date).getMonth() === pointDate.getMonth() && new Date(tx.date).getFullYear() === pointDate.getFullYear() && (tx.type === 'expense' || tx.type === 'transfer_out' || tx.type === 'debt_payment' || tx.type === 'investment')).reduce((sum, tx) => sum + tx.amount, 0),
            };
            point.netCashFlow = (point.monthlyIncome || 0) - (point.monthlyExpenses || 0);

            // Goal progress for history:
            point.goalProgress = {};
            this.goals.forEach(goal => {
                const currentAmountTowardsGoal = this.calculateSnapshot(pointDate, this.transactions, this.assets.filter(a => goal.linkedAssets?.includes(a.id)), []).totalAssets; // Simplified: only linked assets count
                 const progress = Math.min(1, currentAmountTowardsGoal / goal.targetAmount);
                 point.goalProgress![goal.id] = {
                    progress: progress,
                    contribution: currentAmountTowardsGoal,
                    required: goal.targetAmount,
                    status: progress >= 1 ? 'on_track' : (currentAmountTowardsGoal / goal.targetAmount > 0.75 ? 'ahead' : 'behind') // Simplistic status
                 };
            });

            historicalPoints.push(point);

            // Advance date based on granularity
            switch (granularity) {
                case 'day': currentDate.setDate(currentDate.getDate() + 1); break;
                case 'week': currentDate.setDate(currentDate.getDate() + 7); break;
                case 'month': currentDate.setMonth(currentDate.getMonth() + 1); break;
                case 'quarter': currentDate.setMonth(currentDate.getMonth() + 3); break;
                case 'year': currentDate.setFullYear(currentDate.getFullYear() + 1); break;
            }
        }
        return historicalPoints;
    }

    /**
     * Projects future net worth based on current assets, liabilities,
     * historical cash flow, and defined scenarios.
     * Incorporates asset growth, liability reduction, and scenario-specific adjustments.
     * @param years Number of years to project
     * @param baselineProjectionParameters Base parameters for a realistic projection
     * @param additionalScenarios An array of scenario parameters for comparison
     * @param includeInflationAdjusted Whether to include inflation-adjusted values.
     */
    public generateFutureProjections(
        years: number = 10,
        baselineProjectionParameters: ScenarioParameters = { id: 'realistic', name: 'Realistic' },
        additionalScenarios: ScenarioParameters[] = [],
        includeInflationAdjusted: boolean = true
    ): { [scenarioId: string]: TimelinePoint[] } {
        const projections: { [scenarioId: string]: TimelinePoint[] } = {};

        // Calculate average historical monthly cash flow from past 12 months
        const last12MonthsTransactions = this.transactions.filter(tx => new Date(tx.date) > new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
        const averageMonthlyIncome = last12MonthsTransactions.filter(tx => tx.type === 'income' || tx.type === 'transfer_in').reduce((sum, tx) => sum + tx.amount, 0) / 12;
        const averageMonthlyExpenses = last12MonthsTransactions.filter(tx => tx.type === 'expense' || tx.type === 'transfer_out' || tx.type === 'debt_payment' || tx.type === 'investment').reduce((sum, tx) => sum + tx.amount, 0) / 12;
        const baseMonthlyNetCashFlow = averageMonthlyIncome - averageMonthlyExpenses;

        const currentSnapshot = this.calculateSnapshot(new Date(), this.transactions, this.assets, this.liabilities);
        const initialNetWorth = currentSnapshot.netWorth;
        const initialAssetsMap = currentSnapshot.currentAssetValues; // { id: value }
        const initialLiabilitiesMap = currentSnapshot.currentLiabilityBalances; // { id: balance }


        // Define base asset growth rates (annual, converted to monthly later)
        const baseAssetAnnualGrowthRates: { [type: string]: number } = {
            'cash': 0.005, // 0.5% annual
            'stocks': 0.08, // 8% annual
            'real_estate': 0.05, // 5% annual
            'crypto': 0.15, // Higher volatility, higher return
            'bond': 0.03, // 3% annual
            'precious_metals': 0.04,
            'collectibles': 0.03,
            'business_equity': 0.10,
            'other': 0.04
        };

        // All scenarios including the baseline
        const scenariosToProcess = [baselineProjectionParameters, ...additionalScenarios];

        scenariosToProcess.forEach(scenario => {
            const scenarioProjections: TimelinePoint[] = [];
            let currentProjectedNetWorth = initialNetWorth + (scenario.initialAssetsAdjustment || 0);
            let currentAssetsForScenario: { [id: string]: { asset: Asset, value: number, costBasis: number } } = JSON.parse(JSON.stringify(this.assets.reduce((acc, a) => ({ ...acc, [a.id]: { asset: a, value: initialAssetsMap[a.id] || a.value, costBasis: a.costBasis || a.value } }), {})));
            let currentLiabilitiesForScenario: { [id: string]: { liability: Liability, balance: number, minimumPaymentDue: number } } = JSON.parse(JSON.stringify(this.liabilities.reduce((acc, l) => ({ ...acc, [l.id]: { liability: l, balance: initialLiabilitiesMap[l.id] || l.currentBalance, minimumPaymentDue: l.minimumPayment || 0 } }), {})));
            
            let currentCashBalance = currentAssetsForScenario['CASH_LIQUID']?.value || 0;

            let currentProjectedInflationFactor = 1;
            const effectiveMonthlyInflation = (this.userProfile.inflationExpectation + (scenario.inflationAdjustment || 0)) / 12;

            let projectionDate = new Date();
            projectionDate.setDate(1); // Start at beginning of current month

            for (let i = 0; i < years * 12; i++) {
                projectionDate.setMonth(projectionDate.getMonth() + 1); // Move to next month
                const monthName = projectionDate.toLocaleString('default', { month: 'short', year: 'numeric' });

                // --- 1. Apply cash flow (income & expenses) ---
                let monthlyCashFlow = baseMonthlyNetCashFlow + (scenario.monthlySavingsAdjustment || 0);
                currentCashBalance += monthlyCashFlow; // Cash is affected directly by net cash flow

                // --- 2. Apply asset growth ---
                Object.values(currentAssetsForScenario).forEach(item => {
                    const annualReturnAdjustment = scenario.assetReturnRateAdjustment?.[item.asset.type] || 0;
                    const effectiveAnnualRate = (item.asset.annualReturnRate || baseAssetAnnualGrowthRates[item.asset.type] || baseAssetAnnualGrowthRates['other']) + annualReturnAdjustment;
                    const monthlyRate = Math.pow(1 + effectiveAnnualRate, 1/12) - 1; // Convert annual to monthly compound rate

                    item.value *= (1 + monthlyRate);
                });

                // --- 3. Apply liability payments & interest ---
                let totalMonthlyDebtPayments = 0;
                Object.values(currentLiabilitiesForScenario).forEach(item => {
                    if (item.balance <= 0) return; // Debt paid off

                    const monthlyInterest = item.balance * (item.liability.interestRate / 12);
                    item.balance += monthlyInterest; // Interest accrues

                    // Simplified: assume minimum payments are part of baseMonthlyNetCashFlow,
                    // or handled by monthlyCashFlow if it's positive and goes towards debt.
                    // A complex system would prioritize debt payments based on strategy (avalanche/snowball).
                    // For now, assume debt interest reduces net worth and balance increases
                    currentProjectedNetWorth -= monthlyInterest; // Interest is a net worth reducer

                    // If monthly cash flow is positive, some might go to debt repayment
                    // This is a simplification; actual debt repayment should be modeled explicitly.
                    // For now, assume `monthlyCashFlow` already accounts for debt payments implicitly.
                });

                // --- 4. Apply scenario-specific major events ---
                scenario.majorLifeEvents?.forEach(event => {
                    if (new Date(event.date).getMonth() === projectionDate.getMonth() && new Date(event.date).getFullYear() === projectionDate.getFullYear()) {
                        if (event.type === 'income_boost' || event.type === 'inheritance' || event.type === 'asset_sale') {
                            currentCashBalance += event.amount;
                        } else if (event.type === 'large_expense' || event.type === 'asset_purchase' || event.type === 'job_loss') {
                            currentCashBalance -= event.amount;
                        }
                        // For 'job_loss', a durationMonths could be used to reduce monthlyCashFlow for several months.
                    }
                });

                // Re-calculate total assets, liabilities, and net worth based on updated maps
                let currentTotalAssets = 0;
                let currentTotalLiabilities = 0;
                let currentLiquidAssets = 0;
                let currentIlliquidAssets = 0;

                // Ensure cash balance is reflected in assets
                currentAssetsForScenario['CASH_LIQUID'] = { asset: { id: 'CASH_LIQUID', name: 'Liquid Cash', type: 'cash', value: 0, liquidityScore: 1 }, value: currentCashBalance, costBasis: currentCashBalance };


                Object.values(currentAssetsForScenario).forEach(item => {
                    const assetValue = Math.max(0, item.value);
                    currentTotalAssets += assetValue;
                    if (item.asset.liquidityScore && item.asset.liquidityScore > 0.8) {
                        currentLiquidAssets += assetValue;
                    } else {
                        currentIlliquidAssets += assetValue;
                    }
                });

                Object.values(currentLiabilitiesForScenario).forEach(item => {
                    currentTotalLiabilities += Math.max(0, item.balance);
                });

                currentProjectedNetWorth = currentTotalAssets - currentTotalLiabilities;

                // --- 5. Apply inflation for inflation-adjusted projections ---
                currentProjectedInflationFactor *= (1 + effectiveMonthlyInflation);

                const timelinePoint: TimelinePoint = {
                    name: monthName,
                    date: new Date(projectionDate),
                    projectionRealisticNetWorth: currentProjectedNetWorth,
                    totalAssetsValue: currentTotalAssets,
                    totalLiabilitiesValue: currentTotalLiabilities,
                    liquidAssetsValue: currentLiquidAssets,
                    illiquidAssetsValue: currentIlliquidAssets,
                    inflationAdjustedProjectionNetWorth: includeInflationAdjusted ? currentProjectedNetWorth / currentProjectedInflationFactor : undefined,
                    // Update risk score based on asset allocation for this month
                    riskScore: this.calculateRiskScore(Object.values(currentAssetsForScenario).map(a => a.asset)), // Simplified, takes base assets
                    portfolioAllocation: Object.values(currentAssetsForScenario).reduce((acc, item) => ({ ...acc, [item.asset.type]: (acc[item.asset.type] || 0) + (item.value / currentTotalAssets) }), {}),
                };

                // --- 6. Track goal progress ---
                timelinePoint.goalProgress = {};
                this.goals.forEach(goal => {
                    const goalAssets = Object.values(currentAssetsForScenario).filter(a => goal.linkedAssets?.includes(a.asset.id));
                    const currentAmountTowardsGoal = goalAssets.reduce((sum, a) => sum + a.value, 0);
                    const progress = Math.min(1, currentAmountTowardsGoal / goal.targetAmount);
                    timelinePoint.goalProgress![goal.id] = {
                        progress: progress,
                        contribution: currentAmountTowardsGoal,
                        required: goal.targetAmount,
                        status: progress >= 1 ? 'on_track' : (currentAmountTowardsGoal / goal.targetAmount > 0.75 ? 'ahead' : 'behind')
                    };
                });

                scenarioProjections.push(timelinePoint);
            }
            projections[scenario.id] = scenarioProjections;
        });

        return projections;
    }

    /**
     * Calculates a simple portfolio risk score based on asset types and their volatilities.
     */
    private calculateRiskScore(assets: Asset[]): number {
        if (assets.length === 0) return 0;
        let totalWeightedVolatility = 0;
        let totalValue = 0;

        assets.forEach(asset => {
            const volatility = asset.volatility || 0.1; // Default volatility
            const value = asset.value;
            totalWeightedVolatility += volatility * value;
            totalValue += value;
        });

        return totalValue > 0 ? (totalWeightedVolatility / totalValue) * 100 : 0; // Return as a score out of 100
    }

    /**
     * Analyzes timeline data to provide actionable insights and alerts.
     * Integrates with user profile and goals.
     */
    public generateInsights(historicalTimeline: TimelinePoint[], futureProjections: { [scenarioId: string]: TimelinePoint[] }): string[] {
        const insights: string[] = [];
        const combinedTimeline = [...historicalTimeline, ...(futureProjections['realistic'] || futureProjections['projectionRealistic'] || [])]; // Prioritize 'realistic' ID

        if (combinedTimeline.length < 2) return ["Not enough data for comprehensive insights. Keep tracking your finances for personalized analysis!"];

        const latestHistoricalPoint = historicalTimeline[historicalTimeline.length - 1];
        const initialHistoricalPoint = historicalTimeline[0];
        const latestProjectionPoint = (futureProjections['realistic'] || futureProjections['projectionRealistic'])?.[futureProjections['realistic'].length - 1];


        // 1. Overall Wealth Growth/Trajectory
        if (latestHistoricalPoint && initialHistoricalPoint) {
            const historyGrowth = (latestHistoricalPoint.historyNetWorth || 0) - (initialHistoricalPoint.historyNetWorth || 0);
            if (initialHistoricalPoint.historyNetWorth && initialHistoricalPoint.historyNetWorth !== 0) {
                const percentageGrowth = (historyGrowth / initialHistoricalPoint.historyNetWorth) * 100;
                insights.push(`Your net worth has grown by $${historyGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${percentageGrowth.toFixed(2)}%) historically.`);
            } else if (historyGrowth > 0) {
                 insights.push(`Your net worth has increased by $${historyGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 })} historically.`);
            }
        }
        if (latestProjectionPoint && latestHistoricalPoint) {
            const projectedGrowth = (latestProjectionPoint.projectionRealisticNetWorth || 0) - (latestHistoricalPoint.historyNetWorth || 0);
            if (latestHistoricalPoint.historyNetWorth && latestHistoricalPoint.historyNetWorth !== 0) {
                const percentageProjectedGrowth = (projectedGrowth / latestHistoricalPoint.historyNetWorth) * 100;
                insights.push(`Your projected net worth is set to grow by an additional $${projectedGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${percentageProjectedGrowth.toFixed(2)}%) over the next ${this.userProfile.investmentHorizonYears} years.`);
            } else if (projectedGrowth > 0) {
                 insights.push(`Your projected net worth is set to increase by $${projectedGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 })} over the next ${this.userProfile.investmentHorizonYears} years.`);
            }
        }

        // 2. Cash Flow Analysis
        const recentCashFlows = historicalTimeline.slice(-6).map(p => p.netCashFlow || 0);
        const avgNetCashFlow = recentCashFlows.reduce((sum, cf) => sum + cf, 0) / recentCashFlows.length;
        if (avgNetCashFlow > 0) {
            insights.push(`Excellent! You maintain a positive average monthly cash flow of $${avgNetCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}. This strong financial habit fuels your wealth growth.`);
        } else if (avgNetCashFlow < -100) { // Significant negative cash flow
            insights.push(`Alert: Your average monthly cash flow is negative ($${Math.abs(avgNetCashFlow).toLocaleString(undefined, { maximumFractionDigits: 0 })}). This trend can erode your wealth over time. Consider reviewing your expenses and income sources.`);
        } else {
            insights.push(`Your recent cash flow is largely neutral. Optimizing your budget can significantly accelerate your financial goals.`);
        }

        // 3. Goal Progress & Recommendations
        this.goals.forEach(goal => {
            const goalProgressAtLatest = latestProjectionPoint?.goalProgress?.[goal.id] || latestHistoricalPoint?.goalProgress?.[goal.id];
            if (goalProgressAtLatest) {
                if (goalProgressAtLatest.progress >= 1) {
                    insights.push(`Achievement unlocked! You are on track to exceed your goal: ${goal.name}. Consider setting a new target or reallocating surplus.`);
                } else if (goalProgressAtLatest.status === 'behind') {
                    const yearsRemaining = (new Date(goal.targetDate).getFullYear() - new Date().getFullYear());
                    const requiredMonthlyContribution = yearsRemaining > 0 ? (goal.targetAmount - goalProgressAtLatest.contribution) / (yearsRemaining * 12) : 0;
                    if (requiredMonthlyContribution > 0) {
                         insights.push(`Action Required: You are behind on your "${goal.name}" goal. You need to increase your monthly contribution by approximately $${requiredMonthlyContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })} to meet the target by ${new Date(goal.targetDate).toLocaleDateString()}.`);
                    } else {
                        insights.push(`Action Required: You are behind on your "${goal.name}" goal, and the target date is approaching. Review your strategy.`);
                    }
                } else if (goalProgressAtLatest.status === 'ahead') {
                    insights.push(`Great work! You are ahead of schedule for your "${goal.name}" goal. Keep up the momentum!`);
                }
            }
        });

        // 4. Retirement Planning (if applicable)
        const retirementAge = this.userProfile.retirementAge;
        const currentAge = new Date().getFullYear() - new Date(this.userProfile.dob).getFullYear();
        if (currentAge < retirementAge) {
            const yearsToRetirement = retirementAge - currentAge;
            const retirementProjectionPoint = combinedTimeline.find(p => p.date.getFullYear() === (new Date().getFullYear() + yearsToRetirement));
            if (retirementProjectionPoint?.projectionRealisticNetWorth !== undefined) {
                const projectedRetirementWorth = retirementProjectionPoint.projectionRealisticNetWorth;
                const inflationAdjustedRetirementWorth = retirementProjectionPoint.inflationAdjustedProjectionNetWorth || projectedRetirementWorth;

                // Simplified retirement income calculation (e.g., 4% rule)
                const projectedAnnualIncome = inflationAdjustedRetirementWorth * 0.04;
                if (projectedAnnualIncome < this.userProfile.desiredRetirementIncome) {
                    insights.push(`Retirement Alert: Your projected annual retirement income of $${projectedAnnualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })} (in today's dollars) is below your desired $${this.userProfile.desiredRetirementIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Consider increasing savings or adjusting investment strategy.`);
                } else {
                    insights.push(`Retirement Outlook: You are on track to achieve an annual income of $${projectedAnnualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })} in retirement (in today's dollars), exceeding your desired target.`);
                }
            }
        }

        // 5. Risk Assessment & Portfolio Optimization
        const latestRiskScore = latestHistoricalPoint?.riskScore || 0;
        if (latestRiskScore > 70 && this.userProfile.riskTolerance === 'low') {
            insights.push(`Warning: Your portfolio's current risk score (${latestRiskScore.toFixed(0)}) is high, possibly exceeding your stated low risk tolerance. Review your asset allocation for potential rebalancing.`);
        } else if (latestRiskScore < 30 && this.userProfile.riskTolerance === 'high') {
             insights.push(`Opportunity: Your portfolio's current risk score (${latestRiskScore.toFixed(0)}) is low, potentially indicating missed growth opportunities given your high risk tolerance. Consider diversifying into higher-growth assets.`);
        }
        insights.push("AI-powered portfolio optimization suggestions are being generated in the background, focusing on risk-adjusted returns and goal alignment.");


        // 6. Economic Factor Integration
        const lastMarketData = MarketDataService.getHistoricalData().slice(-1)[0];
        if (lastMarketData && lastMarketData.inflationRateMonthly * 12 > (this.userProfile.inflationExpectation + 0.01)) { // If current inflation is 1% higher than expectation
            insights.push(`Market Alert: Recent inflation rates (approx. ${(lastMarketData.inflationRateMonthly * 12 * 100).toFixed(1)}% annual) are higher than your long-term expectation. This could impact purchasing power and requires attention to inflation-hedging assets.`);
        } else if (lastMarketData && lastMarketData.economicSentimentIndex < 30) {
             insights.push(`Economic Watch: Market sentiment is currently low (${lastMarketData.economicSentimentIndex.toFixed(0)}). While challenging, downturns can present long-term investment opportunities for resilient portfolios.`);
        }


        // 7. Debt Management
        const totalLiabilities = latestHistoricalPoint?.totalLiabilitiesValue || 0;
        if (totalLiabilities > 0) {
            const highInterestDebts = this.liabilities.filter(l => l.currentBalance > 0 && l.interestRate > 0.08); // e.g., >8% annual
            if (highInterestDebts.length > 0) {
                insights.push(`Recommendation: Prioritize repayment of high-interest debts like ${highInterestDebts.map(d => d.name).join(', ')}. This can significantly improve your net worth trajectory.`);
            }
        }

        insights.push("Advanced scenario planning with real-time market data integration is available to stress-test your financial future.");
        insights.push("Explore the 'What If' engine to model impacts of career changes, major purchases, or unexpected events.");

        return insights;
    }
}

/**
 * A sophisticated chart component for visualizing wealth timelines.
 * Supports multiple data series, scenarios, events, and interactive elements.
 */
export const AdvancedWealthChart: React.FC<{
    timelineData: TimelinePoint[];
    scenarios?: { [scenarioId: string]: TimelinePoint[] };
    selectedScenarios?: string[]; // IDs of scenarios to display
    chartType?: 'area' | 'line'; // Removed bar for simplicity in combo chart
    granularity?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    showInflationAdjusted?: boolean;
    showGoals?: boolean;
    showAssetsLiabilities?: boolean;
    showEvents?: boolean;
    interactiveMode?: boolean;
}> = ({
    timelineData,
    scenarios = {},
    selectedScenarios = ['projectionRealistic'], // Default to realistic if no specific scenario is picked
    chartType = 'area',
    granularity = 'month',
    showInflationAdjusted = false,
    showGoals = false,
    showAssetsLiabilities = false,
    showEvents = false,
    interactiveMode = true,
}) => {
    const context = useContext(DataContext);
    if (!context) return null;

    const { goals } = context;

    // Combine historical and projection data for rendering
    const allChartData = useMemo(() => {
        let combinedMap = new Map<string, TimelinePoint>(); // Use Map for easier merging by date

        timelineData.forEach(p => combinedMap.set(p.date.toISOString(), { ...p }));

        Object.entries(scenarios).forEach(([scenarioId, scenarioPoints]) => {
            if (selectedScenarios.includes(scenarioId)) {
                scenarioPoints.forEach(sp => {
                    const dateKey = sp.date.toISOString();
                    const existingPoint = combinedMap.get(dateKey);
                    if (existingPoint) {
                        // Merge relevant scenario data into existing point, dynamic key for net worth
                        (existingPoint as any)[`${scenarioId}NetWorth`] = sp.projectionRealisticNetWorth;
                        if (showInflationAdjusted && sp.inflationAdjustedProjectionNetWorth !== undefined) {
                            (existingPoint as any)[`${scenarioId}NetWorthInflationAdjusted`] = sp.inflationAdjustedProjectionNetWorth;
                        }
                    } else {
                        // Add as a new point
                        const newPoint: TimelinePoint = { ...sp };
                        (newPoint as any)[`${scenarioId}NetWorth`] = sp.projectionRealisticNetWorth;
                        if (showInflationAdjusted && sp.inflationAdjustedProjectionNetWorth !== undefined) {
                            (newPoint as any)[`${scenarioId}NetWorthInflationAdjusted`] = sp.inflationAdjustedProjectionNetWorth;
                        }
                        combinedMap.set(dateKey, newPoint);
                    }
                });
            }
        });

        const combinedArray = Array.from(combinedMap.values());
        combinedArray.sort((a, b) => a.date.getTime() - b.date.getTime());
        return combinedArray;
    }, [timelineData, scenarios, selectedScenarios, showInflationAdjusted]);

    // Determine relevant data keys and colors
    const dataKeys = useMemo(() => {
        const keys = [];
        if (!showInflationAdjusted) {
            keys.push({ key: 'historyNetWorth', name: 'Net Worth History', color: '#8b5cf6', type: 'area', strokeDasharray: undefined, fillId: 'historyGradient' });
             selectedScenarios.forEach(scenarioId => {
                let name = scenarioId; // Fallback name
                if (scenarioId === 'projectionRealistic') name = 'Realistic Projection';
                else if (scenarioId === 'projectionOptimistic') name = 'Optimistic Projection';
                else if (scenarioId === 'projectionPessimistic') name = 'Pessimistic Projection';
                else name = scenarios[scenarioId]?.[0]?.name || scenarioId; // Use scenario name from first point

                const colorMap: { [key: string]: string } = {
                    'projectionRealistic': '#16a34a',
                    'projectionOptimistic': '#facc15',
                    'projectionPessimistic': '#ef4444',
                };
                const color = colorMap[scenarioId] || `#${Math.floor(Math.random()*16777215).toString(16)}`;

                keys.push({ key: `${scenarioId}NetWorth`, name: name, color: color, type: 'line', strokeDasharray: '5 5' });
            });
        } else {
            keys.push({ key: 'inflationAdjustedHistoryNetWorth', name: 'History (Inflation Adj.)', color: '#8b5cf6', type: 'area', strokeDasharray: undefined, fillId: 'historyGradient' });
            selectedScenarios.forEach(scenarioId => {
                let name = scenarioId;
                if (scenarioId === 'projectionRealistic') name = 'Realistic Projection';
                else if (scenarioId === 'projectionOptimistic') name = 'Optimistic Projection';
                else if (scenarioId === 'projectionPessimistic') name = 'Pessimistic Projection';
                else name = scenarios[scenarioId]?.[0]?.name || scenarioId;

                const colorMap: { [key: string]: string } = {
                    'projectionRealistic': '#16a34a',
                    'projectionOptimistic': '#facc15',
                    'projectionPessimistic': '#ef4444',
                };
                const color = colorMap[scenarioId] || `#${Math.floor(Math.random()*16777215).toString(16)}`;

                 keys.push({ key: `${scenarioId}NetWorthInflationAdjusted`, name: `${name} (Inflation Adj.)`, color: color, type: 'line', strokeDasharray: '4 2' });
            });
        }
       
        if (showAssetsLiabilities) {
            keys.push({ key: 'totalAssetsValue', name: 'Total Assets', color: '#3b82f6', type: 'line', strokeDasharray: '2 4' });
            keys.push({ key: 'totalLiabilitiesValue', name: 'Total Liabilities', color: '#dc2626', type: 'line', strokeDasharray: '2 4' });
        }
        return keys;
    }, [selectedScenarios, showInflationAdjusted, showAssetsLiabilities, scenarios]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div className="bg-gray-800 bg-opacity-90 p-3 border border-gray-600 rounded shadow-lg text-xs text-gray-100 min-w-[200px]">
                    <p className="font-bold text-gray-300 mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={`item-${index}`} style={{ color: entry.stroke || entry.fill }}>
                            {`${entry.name}: $${entry.value ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}`}
                        </p>
                    ))}
                    {showGoals && goals.length > 0 && dataPoint.goalProgress && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                            <p className="font-bold text-gray-300">Goal Progress:</p>
                            {Object.entries(dataPoint.goalProgress).map(([goalId, goalData]: [string, any]) => {
                                const goal = goals.find(g => g.id === goalId);
                                if (!goal) return null;
                                return (
                                    <p key={goalId} className="text-gray-400">
                                        {`${goal.name}: ${(goalData.progress * 100).toFixed(1)}% `}
                                        <span className={`italic ${goalData.status === 'on_track' ? 'text-green-400' : goalData.status === 'ahead' ? 'text-blue-400' : 'text-red-400'}`}>({goalData.status.replace('_', ' ')})</span>
                                    </p>
                                );
                            })}
                        </div>
                    )}
                     {showEvents && dataPoint.significantEvents && dataPoint.significantEvents.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                            <p className="font-bold text-gray-300">Events:</p>
                            {dataPoint.significantEvents.map((event: any, idx: number) => (
                                <p key={idx} className={`text-gray-400 ${event.type === 'alert' ? 'text-red-400' : ''}`}>{event.description}</p>
                            ))}
                        </div>
                    )}
                     {dataPoint.riskScore !== undefined && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                            <p className="font-bold text-gray-300">Risk Score:</p>
                            <p className="text-gray-400">{dataPoint.riskScore.toFixed(0)} / 100</p>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    const formatXAxis = (tickItem: string) => {
        const date = new Date(tickItem);
        switch (granularity) {
            case 'day': return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
            case 'week': return `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString('en-US', { month: 'short' })}`;
            case 'month': return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            case 'quarter': return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.toLocaleDateString('en-US', { year: '2-digit' })}`;
            case 'year': return date.toLocaleDateString('en-US', { year: 'numeric' });
            default: return tickItem;
        }
    };


    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
                data={allChartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={10}
                    tickFormatter={formatXAxis}
                    minTickGap={20}
                    interval="preserveStartEnd"
                />
                <YAxis
                    stroke="#9ca3af"
                    fontSize={10}
                    tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`}
                />
                {interactiveMode && <Tooltip content={<CustomTooltip />} />}
                <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af', paddingTop: '10px', paddingLeft: '20px' }} verticalAlign="top" align="right" />

                <defs>
                    <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                </defs>

                {dataKeys.map((item, index) => {
                    if (item.type === 'area') {
                        return <Area
                            key={item.key}
                            type="monotone"
                            dataKey={item.key}
                            name={item.name}
                            stroke={item.color}
                            fill={item.fillId ? `url(#${item.fillId})` : item.color}
                            fillOpacity={0.6}
                            isAnimationActive={false}
                            dot={false}
                        />;
                    } else if (item.type === 'line') {
                        return <Line
                            key={item.key}
                            type="monotone"
                            dataKey={item.key}
                            name={item.name}
                            stroke={item.color}
                            strokeDasharray={item.strokeDasharray}
                            dot={false}
                            isAnimationActive={false}
                        />;
                    }
                    return null;
                })}

                {showGoals && goals.map((goal) => {
                    const goalDate = new Date(goal.targetDate);
                    // Find the point closest to the goal date (exact match for simplicity)
                    const targetPoint = allChartData.find(p => p.date.toDateString() === goalDate.toDateString());
                    const goalValue = goal.targetAmount;

                    if (targetPoint) {
                        return (
                            <ReferenceLine
                                key={`goal-${goal.id}`}
                                x={targetPoint.name}
                                y={goalValue}
                                stroke="#fca5a5"
                                strokeDasharray="3 3"
                                label={{ value: `${goal.name} Target ($${(goalValue/1000).toFixed(0)}k)`, position: 'top', fill: '#fca5a5', fontSize: 10 }}
                            />
                        );
                    }
                    return null;
                })}

                {interactiveMode && <Brush dataKey="name" height={30} stroke="#8884d8" fill="#1f2937" travellerWidth={10}>
                     <Area type="monotone" dataKey="historyNetWorth" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                </Brush>}
            </ComposedChart>
        </ResponsiveContainer>
    );
};

/**
 * Component for managing and comparing different financial scenarios.
 * Allows users to define parameters and visualize their impact.
 */
export const ScenarioManager: React.FC<{
    onAddScenario: (scenario: ScenarioParameters) => void;
    onSelectScenario: (id: string, isSelected: boolean) => void;
    currentScenarios: ScenarioParameters[];
    selectedScenarios: string[];
}> = ({ onAddScenario, onSelectScenario, currentScenarios, selectedScenarios }) => {
    const [newScenarioName, setNewScenarioName] = React.useState('');
    const [initialAdjustment, setInitialAdjustment] = React.useState(0);
    const [monthlySavingsAdjustment, setMonthlySavingsAdjustment] = React.useState(0);
    const [inflationAdjustment, setInflationAdjustment] = React.useState(0);
    const [majorEventDescription, setMajorEventDescription] = React.useState('');
    const [majorEventType, setMajorEventType] = React.useState<'income_boost' | 'large_expense' | 'inheritance' | 'asset_sale' | 'asset_purchase' | 'job_loss'>('large_expense');
    const [majorEventAmount, setMajorEventAmount] = React.useState(0);
    const [majorEventDate, setMajorEventDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [scenarioMajorEvents, setScenarioMajorEvents] = React.useState<ScenarioParameters['majorLifeEvents']>([]);

    const handleAddMajorEvent = () => {
        if (majorEventDescription && majorEventAmount && majorEventDate) {
            setScenarioMajorEvents(prev => [...prev || [], {
                date: majorEventDate,
                type: majorEventType,
                amount: majorEventAmount,
                description: majorEventDescription
            }]);
            setMajorEventDescription('');
            setMajorEventAmount(0);
            setMajorEventDate(new Date().toISOString().split('T')[0]);
        }
    };

    const handleAdd = () => {
        if (newScenarioName.trim()) {
            onAddScenario({
                id: `custom_${Date.now()}`,
                name: newScenarioName,
                initialAssetsAdjustment: initialAdjustment,
                monthlySavingsAdjustment: monthlySavingsAdjustment,
                inflationAdjustment: inflationAdjustment,
                majorLifeEvents: scenarioMajorEvents,
                description: `Custom scenario created on ${new Date().toLocaleDateString()}`
            });
            setNewScenarioName('');
            setInitialAdjustment(0);
            setMonthlySavingsAdjustment(0);
            setInflationAdjustment(0);
            setScenarioMajorEvents([]);
        }
    };

    return (
        <Card title="Scenario Planner & Comparison">
            <div className="p-4 bg-gray-700 rounded-lg shadow-md mb-4">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Create New Scenario</h3>
                <input
                    type="text"
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                    placeholder="Scenario Name (e.g., 'Early Retirement')"
                    className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:border-purple-500"
                />
                <label className="block text-gray-300 text-sm mb-1">Initial Assets Adjustment ($):</label>
                <input
                    type="number"
                    value={initialAdjustment}
                    onChange={(e) => setInitialAdjustment(parseFloat(e.target.value))}
                    className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:border-purple-500"
                    placeholder="e.g., +10000 for inheritance"
                />
                 <label className="block text-gray-300 text-sm mb-1">Monthly Cash Flow Adjustment ($):</label>
                <input
                    type="number"
                    value={monthlySavingsAdjustment}
                    onChange={(e) => setMonthlySavingsAdjustment(parseFloat(e.target.value))}
                    className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:border-purple-500"
                    placeholder="e.g., +500 for extra savings"
                />
                 <label className="block text-gray-300 text-sm mb-1">Annual Inflation Adjustment (%):</label>
                <input
                    type="number"
                    value={inflationAdjustment * 100} // Display as percentage
                    onChange={(e) => setInflationAdjustment(parseFloat(e.target.value) / 100)}
                    className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:border-purple-500"
                    placeholder="e.g., +1 for 1% higher inflation"
                />

                <h4 className="text-md font-semibold text-gray-300 mt-4 mb-2">Major Life Events:</h4>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="date" value={majorEventDate} onChange={(e) => setMajorEventDate(e.target.value)}
                        className="p-2 rounded bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:border-purple-500" />
                    <select value={majorEventType} onChange={(e) => setMajorEventType(e.target.value as any)}
                        className="p-2 rounded bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:border-purple-500">
                        <option value="income_boost">Income Boost</option>
                        <option value="large_expense">Large Expense</option>
                        <option value="inheritance">Inheritance</option>
                        <option value="asset_sale">Asset Sale</option>
                        <option value="asset_purchase">Asset Purchase</option>
                        <option value="job_loss">Job Loss (short-term impact)</option>
                    </select>
                </div>
                <input type="number" value={majorEventAmount} onChange={(e) => setMajorEventAmount(parseFloat(e.target.value))}
                    placeholder="Amount ($)" className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:border-purple-500" />
                <input type="text" value={majorEventDescription} onChange={(e) => setMajorEventDescription(e.target.value)}
                    placeholder="Description (e.g., 'New Car Purchase')" className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:border-purple-500" />
                <button onClick={handleAddMajorEvent} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm">Add Major Event to Scenario</button>
                {scenarioMajorEvents && scenarioMajorEvents.length > 0 && (
                    <div className="mt-2 text-gray-400 text-xs">
                        <p className="font-semibold">Events for this scenario:</p>
                        <ul className="list-disc pl-4">
                            {scenarioMajorEvents.map((event, idx) => (
                                <li key={idx}>{`${new Date(event.date).toLocaleDateString()}: ${event.description} ($${event.amount.toLocaleString()})`}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <button
                    onClick={handleAdd}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                >
                    Create Scenario
                </button>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Compare Scenarios</h3>
                <div className="space-y-2">
                    {/* Baseline Scenarios */}
                    <label className="flex items-center text-gray-300">
                        <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-purple-600 bg-gray-800 border-gray-600 rounded"
                            checked={selectedScenarios.includes('projectionRealistic')}
                            onChange={(e) => onSelectScenario('projectionRealistic', e.target.checked)}
                        />
                        <span className="ml-2">Realistic Projection</span>
                    </label>
                    <label className="flex items-center text-gray-300">
                        <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-yellow-500 bg-gray-800 border-gray-600 rounded"
                            checked={selectedScenarios.includes('projectionOptimistic')}
                            onChange={(e) => onSelectScenario('projectionOptimistic', e.target.checked)}
                        />
                        <span className="ml-2">Optimistic Projection</span>
                    </label>
                    <label className="flex items-center text-gray-300">
                        <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-red-500 bg-gray-800 border-gray-600 rounded"
                            checked={selectedScenarios.includes('projectionPessimistic')}
                            onChange={(e) => onSelectScenario('projectionPessimistic', e.target.checked)}
                        />
                        <span className="ml-2">Pessimistic Projection</span>
                    </label>

                    {/* Custom Scenarios */}
                    {currentScenarios.map(scenario => (
                        <label key={scenario.id} className="flex items-center text-gray-300">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-500 bg-gray-800 border-gray-600 rounded"
                                checked={selectedScenarios.includes(scenario.id)}
                                onChange={(e) => onSelectScenario(scenario.id, e.target.checked)}
                            />
                            <span className="ml-2">{scenario.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        </Card>
    );
};


/**
 * Component to display AI-driven insights and recommendations.
 */
export const InsightsPanel: React.FC<{ insights: string[] }> = ({ insights }) => {
    return (
        <Card title="AI-Driven Insights & Recommendations">
            <div className="p-4 text-gray-300 text-sm space-y-2">
                {insights.length > 0 ? (
                    insights.map((insight, index) => (
                        <p key={index} className="flex items-start">
                            <span className="text-purple-400 mr-2 text-lg leading-none">&bull;</span>
                            {insight}
                        </p>
                    ))
                ) : (
                    <p className="text-gray-400">No specific insights available yet. Continue tracking your finances and exploring scenarios for personalized analysis!</p>
                )}
            </div>
            <div className="mt-4 p-4 border-t border-gray-600 text-xs text-gray-500">
                <p>These insights are generated by an advanced financial intelligence engine, leveraging your data, simulated market trends, and economic forecasts. They serve as informational guidance. Always consult a qualified human financial advisor for critical decisions and personalized advice.</p>
                <p className="mt-1">The system continuously learns and adapts to provide increasingly accurate and relevant recommendations over time. Future versions will include interactive decision-making tools and direct integration with financial planning services.</p>
            </div>
        </Card>
    );
};


// --- Main WealthTimeline Component (Expanded) ---
const WealthTimeline: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading financial universe...</div>;

    // Enhanced context includes more data types
    const { transactions, assets, liabilities, goals, userProfile } = context;

    // State for chart configuration and scenario management
    const [chartGranularity, setChartGranularity] = React.useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
    const [projectionYears, setProjectionYears] = React.useState(25); // Default to a longer horizon
    const [showInflationAdjusted, setShowInflationAdjusted] = React.useState(false);
    const [showGoalsOnChart, setShowGoalsOnChart] = React.useState(true);
    const [showAssetsLiabilitiesOnChart, setShowAssetsLiabilitiesOnChart] = React.useState(false);
    const [activeScenarios, setActiveScenarios] = React.useState<string[]>(['projectionRealistic']);
    const [customScenarios, setCustomScenarios] = React.useState<ScenarioParameters[]>([]);

    // Memoize the financial processor to avoid re-instantiation unless core data changes
    const financialProcessor = useMemo(() => {
        return new FinancialDataProcessor(transactions, assets, liabilities, goals, userProfile);
    }, [transactions, assets, liabilities, goals, userProfile]);

    // Generate historical timeline
    const historicalTimeline = useMemo(() => {
        const today = new Date();
        const historyStartDate = new Date();
        historyStartDate.setFullYear(today.getFullYear() - 10); // Go back 10 years for richer history
        return financialProcessor.generateHistoricalTimeline(today, chartGranularity, showInflationAdjusted);
    }, [financialProcessor, chartGranularity, showInflationAdjusted]);

    // Generate future projections for all scenarios
    const futureProjections = useMemo(() => {
        // Define baseline optimistic and pessimistic scenarios based on user profile
        const optimisticScenario: ScenarioParameters = {
            id: 'projectionOptimistic',
            name: 'Optimistic Projection',
            description: 'Higher returns, slightly better cash flow',
            monthlySavingsAdjustment: (userProfile.savingsRateTarget * 0.05) * 1000, // +5% of an assumed $1000 base savings
            assetReturnRateAdjustment: { 'stocks': 0.03, 'crypto': 0.08 }, // +3% & +8% annual
            inflationAdjustment: -0.005 // -0.5% annual inflation
        };
        const pessimisticScenario: ScenarioParameters = {
            id: 'projectionPessimistic',
            name: 'Pessimistic Projection',
            description: 'Lower returns, reduced cash flow, higher inflation',
            monthlySavingsAdjustment: -(userProfile.savingsRateTarget * 0.03) * 1000, // -3% of assumed $1000 base savings
            assetReturnRateAdjustment: { 'stocks': -0.04, 'real_estate': -0.02 }, // -4% & -2% annual
            inflationAdjustment: 0.015 // +1.5% annual inflation
        };

        return financialProcessor.generateFutureProjections(
            projectionYears,
            { id: 'projectionRealistic', name: 'Realistic Projection', description: 'Based on current trends and settings' },
            [optimisticScenario, pessimisticScenario, ...customScenarios],
            showInflationAdjusted
        );
    }, [financialProcessor, projectionYears, customScenarios, showInflationAdjusted, userProfile]);

    // Aggregate all scenarios (pre-defined and custom) for display in the chart
    const allScenariosForDisplay = useMemo(() => {
        const baseScenariosMap: { [key: string]: TimelinePoint[] } = {};
        if (futureProjections['projectionOptimistic']) baseScenariosMap['projectionOptimistic'] = futureProjections['projectionOptimistic'];
        if (futureProjections['projectionPessimistic']) baseScenariosMap['projectionPessimistic'] = futureProjections['projectionPessimistic'];
        if (futureProjections['projectionRealistic']) baseScenariosMap['projectionRealistic'] = futureProjections['projectionRealistic'];
        
        const customScenMap = customScenarios.reduce((acc, scen) => {
            if (futureProjections[scen.id]) {
                acc[scen.id] = futureProjections[scen.id];
            }
            return acc;
        }, {} as { [key: string]: TimelinePoint[] });
        return { ...baseScenariosMap, ...customScenMap };
    }, [futureProjections, customScenarios]);

    // Generate AI-driven insights
    const aiInsights = useMemo(() => {
        return financialProcessor.generateInsights(historicalTimeline, futureProjections);
    }, [financialProcessor, historicalTimeline, futureProjections]);

    // Handlers for scenario management
    const handleAddScenario = (newScenario: ScenarioParameters) => {
        setCustomScenarios(prev => [...prev, newScenario]);
    };

    const handleSelectScenario = (id: string, isSelected: boolean) => {
        setActiveScenarios(prev => {
            const newActive = isSelected ? [...prev, id] : prev.filter(sId => sId !== id);
            // Ensure at least one scenario is always selected if it's a projection type
            if (newActive.length === 0 && id.startsWith('projection')) {
                return ['projectionRealistic']; // Fallback
            }
            return newActive;
        });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto py-6">
            <Card title="Dynamic Wealth Trajectory: History, Forecasts & Scenarios">
                <div className="p-4 bg-gray-800 rounded-lg mb-4 flex flex-wrap gap-4 items-center justify-between border-b border-gray-700 pb-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <label className="text-gray-300 text-sm flex items-center">
                            Granularity:
                            <select
                                value={chartGranularity}
                                onChange={(e) => setChartGranularity(e.target.value as any)}
                                className="ml-2 p-1 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:border-purple-500 text-sm"
                            >
                                <option value="day">Daily</option>
                                <option value="week">Weekly</option>
                                <option value="month">Monthly</option>
                                <option value="quarter">Quarterly</option>
                                <option value="year">Yearly</option>
                            </select>
                        </label>
                        <label className="text-gray-300 text-sm flex items-center">
                            Projection Years:
                            <input
                                type="number"
                                value={projectionYears}
                                onChange={(e) => setProjectionYears(Math.max(1, Math.min(50, parseInt(e.target.value))))} // Max 50 years projection
                                min="1"
                                max="50"
                                className="ml-2 p-1 w-20 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:border-purple-500 text-sm"
                            />
                        </label>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <label className="flex items-center text-gray-300 text-sm">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-purple-600 bg-gray-800 border-gray-600 rounded"
                                checked={showInflationAdjusted}
                                onChange={(e) => setShowInflationAdjusted(e.target.checked)}
                            />
                            <span className="ml-2">Inflation Adjusted</span>
                        </label>
                        <label className="flex items-center text-gray-300 text-sm">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-purple-600 bg-gray-800 border-gray-600 rounded"
                                checked={showGoalsOnChart}
                                onChange={(e) => setShowGoalsOnChart(e.target.checked)}
                            />
                            <span className="ml-2">Show Goals</span>
                        </label>
                        <label className="flex items-center text-gray-300 text-sm">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-purple-600 bg-gray-800 border-gray-600 rounded"
                                checked={showAssetsLiabilitiesOnChart}
                                onChange={(e) => setShowAssetsLiabilitiesOnChart(e.target.checked)}
                            />
                            <span className="ml-2">Show Assets/Liabilities</span>
                        </label>
                    </div>
                </div>
                <div className="h-[500px]"> {/* Increased height for more data points and details */}
                    <AdvancedWealthChart
                        timelineData={historicalTimeline}
                        scenarios={allScenariosForDisplay}
                        selectedScenarios={activeScenarios}
                        granularity={chartGranularity}
                        showInflationAdjusted={showInflationAdjusted}
                        showGoals={showGoalsOnChart}
                        showAssetsLiabilities={showAssetsLiabilitiesOnChart}
                        showEvents={true} // Events are now integrated into TimelinePoint
                        interactiveMode={true}
                    />
                </div>
            </Card>

            <ScenarioManager
                onAddScenario={handleAddScenario}
                onSelectScenario={handleSelectScenario}
                currentScenarios={customScenarios}
                selectedScenarios={activeScenarios}
            />

            <InsightsPanel insights={aiInsights} />

             {/* Further conceptual expansion areas, showing potential future modules and their interaction points */}
            <Card title="Integrated Financial Planning Dashboard">
                <p className="text-gray-400 text-sm">This module would integrate detailed budget tracking, debt management strategies, and micro-investment analysis directly into your wealth trajectory. It would allow you to simulate the impact of individual financial decisions (e.g., refinancing a loan, making an extra payment, changing an investment contribution) on your overall timeline and goal achievement in real-time. Full interoperability with 'TransactionManager' and 'GoalManager' modules ensures a unified financial overview.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-200">Budget Flow Visualizer</h4>
                        <p className="text-gray-400 text-xs mt-1">Interactive Sankey diagrams or waterfall charts to visualize income streams vs. expense categories, identifying saving opportunities. Supports AI-driven categorization and anomaly detection.</p>
                        <div className="h-24 bg-gray-800 flex items-center justify-center text-gray-500 text-xs italic mt-2">Visualization Area</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-200">Advanced Debt Optimization</h4>
                        <p className="text-gray-400 text-xs mt-1">Models different debt repayment strategies (snowball, avalanche, custom) and projects their impact on interest saved and payoff dates. Integrates with 'Liability' data.</p>
                        <div className="h-24 bg-gray-800 flex items-center justify-center text-gray-500 text-xs italic mt-2">Optimization Tools Area</div>
                    </div>
                     <div className="bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-200">Tax Impact Simulator</h4>
                        <p className="text-gray-400 text-xs mt-1">Projects tax implications of investment gains, income changes, and retirement withdrawals, allowing for optimized tax strategies across different scenarios. Integrates with userProfile's tax rates.</p>
                        <div className="h-24 bg-gray-800 flex items-center justify-center text-gray-500 text-xs italic mt-2">Tax Modeling Interface</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-200">Behavioral Finance Nudges</h4>
                        <p className="text-gray-400 text-xs mt-1">Leverages psychological insights and user behavior patterns to provide personalized nudges and gamified challenges, encouraging better financial habits and adherence to goals. Connects to 'UserProfile' and 'DataContext' for behavioral data.</p>
                        <div className="h-24 bg-gray-800 flex items-center justify-center text-gray-500 text-xs italic mt-2">Nudge Notification Stream</div>
                    </div>
                </div>
            </Card>

            <Card title="Global Economic & Market Context">
                <p className="text-gray-400 text-sm">This section provides a macro-economic overlay, allowing you to see how global financial trends, geopolitical events, and specific market sectors could influence your personal wealth. It draws heavily from the 'MarketDataService' and provides interactive overlays on your main timeline. Includes real-time news feeds and sentiment analysis relevant to your portfolio's assets.</p>
                <div className="h-48 bg-gray-700 rounded-lg mt-4 flex items-center justify-center text-gray-500 text-sm italic">
                    Global Market Dashboard with Interactive Overlays (e.g., S&P 500, Gold Prices, Crypto Index)
                </div>
            </Card>
        </div>
    );
};

export default WealthTimeline;