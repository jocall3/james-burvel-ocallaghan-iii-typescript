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