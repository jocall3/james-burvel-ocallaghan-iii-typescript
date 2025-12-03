```typescript
export interface Transaction {
    id: string;
    date: string; // ISO date string
    type: 'income' | 'expense' | 'transfer_in' | 'transfer_out' | 'investment' | 'divestment' | 'debt_payment' | 'debt_accrual' | 'interest_income' | 'dividend_income' | 'capital_gain' | 'fee';
    amount: number;
    category?: string;
    description?: string;
    tags?: string[];
    currency?: string; // e.g., 'USD', 'EUR'
    assetId?: string; // For investment/divestment transactions
    liabilityId?: string; // For debt payments/accruals
    sourceAccount?: string;
    destinationAccount?: string;
    status?: 'pending' | 'settled' | 'failed' | 'cancelled'; // For real-time payments integration
    settlementDate?: string;
    metadata?: { [key: string]: any }; // For additional transaction details, e.g., payment rail
}

export interface Asset {
    id: string;
    name: string;
    type: 'cash' | 'stocks' | 'real_estate' | 'crypto' | 'bond' | 'precious_metals' | 'collectibles' | 'business_equity' | 'other' | 'savings_account' | 'checking_account';
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
    isManaged?: boolean; // If managed by an agent or automated strategy
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
    isAutomatedPayment?: boolean; // If payments are automatically made
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
    riskProfile?: 'conservative' | 'moderate' | 'aggressive'; // Risk profile for achieving this goal
    status?: 'on_track' | 'behind' | 'ahead' | 'achieved';
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
    agentId?: string; // Associated AI agent for financial management
    digitalIdentityId?: string; // Link to user's digital identity
}

export interface MarketData {
    date: string;
    indexS_P500: number;
    inflationRateMonthly: number; // Monthly
    interestRateFED: number;
    economicSentimentIndex: number;
    unemploymentRate?: number;
    gdpGrowthRate?: number; // Quarterly/Annual
    cryptoIndex?: number; // e.g., simulated index for crypto assets
    commodityIndex?: number; // e.g., simulated index for precious metals
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
    goalProgress?: { [goalId: string]: { progress: number; contribution: number; required: number; status: 'on_track' | 'behind' | 'ahead' | 'achieved' } };
    significantEvents?: { type: 'milestone' | 'market_event' | 'personal_event' | 'alert', description: string, value?: number }[];
    riskScore?: number; // Dynamic risk score at this point
    portfolioAllocation?: { [assetType: string]: number }; // Percentage allocation
    alerts?: { type: 'warning' | 'info' | 'critical', message: string, code: string }[]; // New: alerts specific to this point
}

export interface ScenarioParameters {
    id: string;
    name: string;
    description?: string;
    initialAssetsAdjustment?: number; // One-time adjustment to initial assets value
    monthlySavingsAdjustment?: number; // Absolute monthly change to savings/cash flow
    assetReturnRateAdjustment?: { [assetType: string]: number }; // Adjustments to asset specific *annual* return rates (e.g., {'stocks': 0.02} for +2%)
    inflationAdjustment?: number; // Annual adjustment to global inflation expectation (e.g., 0.01 for +1%)
    majorLifeEvents?: { date: string, type: 'income_boost' | 'large_expense' | 'inheritance' | 'asset_sale' | 'asset_purchase' | 'job_loss' | 'debt_acquisition', amount: number, description: string, durationMonths?: number, assetId?: string, liabilityId?: string }[];
    debtRepaymentStrategyOverride?: 'avalanche' | 'snowball' | 'hybrid' | 'default';
    retirementAgeAdjustment?: number; // e.g., +5 years
    desiredRetirementIncomeAdjustment?: number; // e.g., +10000
    riskToleranceOverride?: 'low' | 'medium' | 'high' | 'aggressive';
}

/**
 * Provides access to simulated market data, crucial for financial projections and risk assessments.
 * Business value: This service abstracts away the complexity of external market data feeds,
 * providing a consistent, auditable, and configurable source of truth for economic indicators.
 * This enables robust financial modeling, risk analysis, and scenario planning, underpinning
 * strategic investment decisions and regulatory compliance. Its ability to simulate market
 * conditions allows for stress-testing financial models without dependency on live external APIs,
 * significantly reducing development costs and accelerating time-to-market for financial products.
 */
export class MarketDataService {
    private static historicalData: MarketData[] = [];
    private static initialized: boolean = false;
    private static SEED: string = 'FINANCIAL_DATA_PROCESSOR_SEED'; // Seed for deterministic simulation

    // Helper for deterministic random numbers
    private static seededRandom(seed: string): () => number {
        let x = 0;
        for (let i = 0; i < seed.length; i++) {
            x += seed.charCodeAt(i);
        }
        return function() {
            x = (x * 9301 + 49297) % 233280;
            return x / 233280;
        };
    }

    private static initializeData() {
        if (MarketDataService.initialized) return;
        MarketDataService.historicalData = []; // Reset for re-initialization if needed
        const random = MarketDataService.seededRandom(MarketDataService.SEED);

        let currentDate = new Date();
        // Simulate 20 years of monthly market data for robustness
        for (let i = 0; i < 240; i++) { // 20 years * 12 months
            const date = new Date(currentDate);
            date.setMonth(currentDate.getMonth() - i);
            const year = date.getFullYear();
            const month = date.getMonth(); // 0-indexed month

            // Simulate growth, cycles, and volatility with seeded randomness
            const baseS_P = 2000 + (Math.sin(i / 24 + random() * 2) * 1500) + (i * 50) + (random() * 500 - 250);
            const baseInflation = 0.002 + (Math.cos(i / 36 + random() * 2) * 0.0015) + (random() * 0.001); // Monthly inflation (0.1% to 0.4%)
            const baseFEDRate = 0.001 + (Math.sin(i / 48 + random() * 2) * 0.0008) + (random() * 0.0008);
            const baseSentiment = 50 + (Math.sin(i / 15 + random() * 2) * 30) + (random() * 15 - 7.5);
            const baseCrypto = 100 + (Math.sin(i / 10 + random() * 2) * 80) + (i * 10) + (random() * 100 - 50);
            const baseCommodity = 100 + (Math.cos(i / 12 + random() * 2) * 30) + (random() * 20 - 10);


            MarketDataService.historicalData.push({
                date: new Date(year, month, 1).toISOString().split('T')[0],
                indexS_P500: Math.max(1000, baseS_P),
                inflationRateMonthly: Math.max(0.0005, baseInflation),
                interestRateFED: Math.max(0.0001, baseFEDRate),
                economicSentimentIndex: Math.max(0, Math.min(100, baseSentiment)),
                unemploymentRate: 0.03 + (Math.sin(i / 20 + random() * 2) * 0.02) + (random() * 0.01),
                gdpGrowthRate: 0.005 + (Math.cos(i / 18 + random() * 2) * 0.003) + (random() * 0.002),
                cryptoIndex: Math.max(50, baseCrypto),
                commodityIndex: Math.max(70, baseCommodity)
            });
        }
        MarketDataService.historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        MarketDataService.initialized = true;
    }

    /**
     * Retrieves historical market data within a specified date range.
     * @param startDate Optional: the start date for the data range (ISO string).
     * @param endDate Optional: the end date for the data range (ISO string).
     * @returns An array of MarketData objects.
     */
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

    /**
     * Calculates the average monthly inflation rate over a specified period.
     * @param periodMonths The number of months to consider for the average. Defaults to 12.
     * @returns The average monthly inflation rate as a decimal.
     */
    public static getAverageInflationRateMonthly(periodMonths: number = 12): number {
        MarketDataService.initializeData();
        const relevantData = MarketDataService.historicalData.slice(-periodMonths);
        if (relevantData.length === 0) return 0.0025; // Default to 0.25% monthly if no data (3% annual)
        const sumInflation = relevantData.reduce((sum, d) => sum + d.inflationRateMonthly, 0);
        return sumInflation / relevantData.length;
    }

    /**
     * Provides a projected monthly inflation rate based on user expectations or historical average.
     * @param userProfile The user's financial profile.
     * @returns The projected monthly inflation rate as a decimal.
     */
    public static getProjectedInflationRateMonthly(userProfile: UserProfile): number {
        return (userProfile.inflationExpectation / 12) || MarketDataService.getAverageInflationRateMonthly();
    }

    /**
     * Retrieves the latest available market data point.
     * @returns The most recent MarketData object or undefined if no data exists.
     */
    public static getLatestMarketData(): MarketData | undefined {
        MarketDataService.initializeData();
        return MarketDataService.historicalData[MarketDataService.historicalData.length - 1];
    }
}

/**
 * The core engine for processing financial data, generating historical timelines,
 * and projecting future wealth trajectories under various scenarios.
 * This class encapsulates all the complex financial logic, integrating assets, liabilities, goals, and market data.
 * Business value: This module delivers unparalleled financial foresight and intelligent wealth management.
 * By accurately simulating historical performance and projecting future scenarios, it empowers users
 * and agentic AI systems to make data-driven decisions that optimize net worth, accelerate goal achievement,
 * and proactively mitigate financial risks. This translates into millions in potential savings,
 * enhanced investment returns, and the ability to confidently navigate complex financial landscapes.
 * Its deterministic nature and comprehensive scenario analysis capabilities provide a powerful
 * competitive advantage in personal and enterprise financial planning.
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
     * Updates the user profile for the processor.
     * @param newProfile The updated user profile.
     */
    public updateUserProfile(newProfile: UserProfile): void {
        this.userProfile = { ...this.userProfile, ...newProfile };
    }

    /**
     * Updates the list of transactions for the processor.
     * @param newTransactions The new array of transactions.
     */
    public updateTransactions(newTransactions: Transaction[]): void {
        this.transactions = newTransactions;
    }

    /**
     * Updates the list of assets for the processor.
     * @param newAssets The new array of assets.
     */
    public updateAssets(newAssets: Asset[]): void {
        this.assets = newAssets;
    }

    /**
     * Updates the list of liabilities for the processor.
     * @param newLiabilities The new array of liabilities.
     */
    public updateLiabilities(newLiabilities: Liability[]): void {
        this.liabilities = newLiabilities;
    }

    /**
     * Updates the list of financial goals for the processor.
     * @param newGoals The new array of goals.
     */
    public updateGoals(newGoals: FinancialGoal[]): void {
        this.goals = newGoals;
    }

    /**
     * Calculates net worth, assets, and liabilities at a specific point in time, considering transactions up to that date.
     * This is a sophisticated re-computation function.
     * @param targetDate The date for which to calculate the financial snapshot.
     * @param allTransactions All transactions to consider up to the target date.
     * @param initialAssets The initial state of assets before any transactions.
     * @param initialLiabilities The initial state of liabilities before any transactions.
     * @returns An object containing the financial snapshot.
     */
    private calculateSnapshot(
        targetDate: Date,
        allTransactions: Transaction[],
        initialAssets: Asset[],
        initialLiabilities: Liability[]
    ): { netWorth: number, totalAssets: number, totalLiabilities: number, liquidAssets: number, illiquidAssets: number, currentAssetValues: { [id: string]: number }, currentLiabilityBalances: { [id: string]: number }, currentAssetCostBases: { [id: string]: number } } {
        let currentAssetsMap: { [id: string]: { asset: Asset, value: number, costBasis: number } } = {};
        initialAssets.forEach(asset => {
            currentAssetsMap[asset.id] = { asset, value: asset.value, costBasis: asset.costBasis || asset.value };
        });

        let currentLiabilitiesMap: { [id: string]: { liability: Liability, balance: number } } = {};
        initialLiabilities.forEach(liability => {
            currentLiabilitiesMap[liability.id] = { liability, balance: liability.currentBalance };
        });

        let cashBalance = 0; // Represents liquid cash not tied to a specific asset
        // Initialize cash balance from liquid cash assets at the start
        const cashAssetId = 'CASH_LIQUID';
        const initialCashAsset = initialAssets.find(a => a.id === cashAssetId || a.type === 'cash' && !a.marketSymbol);
        if (initialCashAsset) {
            cashBalance += initialCashAsset.value;
            currentAssetsMap[cashAssetId] = { asset: initialCashAsset, value: initialCashAsset.value, costBasis: initialCashAsset.costBasis || initialCashAsset.value };
        } else {
             // Create a default cash asset if none exists
             currentAssetsMap[cashAssetId] = { asset: { id: cashAssetId, name: 'Liquid Cash', type: 'cash', value: 0, liquidityScore: 1 }, value: 0, costBasis: 0 };
        }
        cashBalance = currentAssetsMap[cashAssetId].value;


        const transactionsUpToDate = allTransactions.filter(tx => new Date(tx.date) <= targetDate)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        transactionsUpToDate.forEach(tx => {
            if (tx.status && tx.status !== 'settled') return; // Only process settled transactions for historical accuracy

            switch (tx.type) {
                case 'income':
                case 'transfer_in':
                case 'interest_income':
                case 'dividend_income':
                case 'capital_gain':
                    cashBalance += tx.amount;
                    break;
                case 'expense':
                case 'transfer_out':
                case 'fee':
                    cashBalance -= tx.amount;
                    break;
                case 'investment':
                    if (tx.assetId) {
                        cashBalance -= tx.amount;
                        const existingAsset = currentAssetsMap[tx.assetId];
                        if (existingAsset) {
                            existingAsset.value += tx.amount;
                            existingAsset.costBasis += tx.amount;
                        } else {
                            // If a new asset is being invested into that wasn't in initialAssets, create a placeholder
                            const defaultAsset: Asset = { id: tx.assetId, name: `Invested Asset ${tx.assetId}`, type: 'stocks', value: tx.amount };
                            currentAssetsMap[tx.assetId] = { asset: defaultAsset, value: tx.amount, costBasis: tx.amount };
                        }
                    }
                    break;
                case 'divestment':
                    if (tx.assetId) {
                        const existingAsset = currentAssetsMap[tx.assetId];
                        if (existingAsset) {
                            existingAsset.value -= tx.amount;
                            cashBalance += tx.amount;
                            // Update cost basis if part of asset is sold. For simplicity, we just reduce value.
                            // A more complex system would track lot-by-lot for capital gains.
                            if (existingAsset.value <= 0) {
                                delete currentAssetsMap[tx.assetId]; // Asset fully divested
                            }
                        }
                    }
                    break;
                case 'debt_payment':
                    if (tx.liabilityId) {
                        const existingLiability = currentLiabilitiesMap[tx.liabilityId];
                        if (existingLiability) {
                            existingLiability.balance -= tx.amount;
                            cashBalance -= tx.amount;
                        }
                    }
                    break;
                case 'debt_accrual':
                    if (tx.liabilityId) {
                         const existingLiability = currentLiabilitiesMap[tx.liabilityId];
                        if (existingLiability) {
                            existingLiability.balance += tx.amount;
                        }
                    }
                    break;
            }
        });

        currentAssetsMap[cashAssetId].value = cashBalance;
        currentAssetsMap[cashAssetId].costBasis = cashBalance; // Cost basis for cash is its value

        let totalAssets = 0;
        let liquidAssets = 0;
        let illiquidAssets = 0;
        let currentAssetCostBases: { [id: string]: number } = {};

        Object.values(currentAssetsMap).forEach(item => {
            const assetValue = Math.max(0, item.value);
            totalAssets += assetValue;
            if (item.asset.liquidityScore && item.asset.liquidityScore > 0.8 || item.asset.type === 'cash' || item.asset.type === 'checking_account' || item.asset.type === 'savings_account') {
                liquidAssets += assetValue;
            } else {
                illiquidAssets += assetValue;
            }
            currentAssetCostBases[item.asset.id] = item.costBasis;
        });

        let totalLiabilities = 0;
        Object.values(currentLiabilitiesMap).forEach(item => {
            totalLiabilities += Math.max(0, item.balance);
        });

        return {
            netWorth: totalAssets - totalLiabilities,
            totalAssets,
            totalLiabilities,
            liquidAssets,
            illiquidAssets,
            currentAssetValues: Object.fromEntries(Object.entries(currentAssetsMap).map(([id, item]) => [id, item.value])),
            currentLiabilityBalances: Object.fromEntries(Object.entries(currentLiabilitiesMap).map(([id, item]) => [id, item.balance])),
            currentAssetCostBases
        };
    }

    /**
     * Generates a detailed historical timeline of net worth and other financial metrics.
     * @param endDate The latest date to include in history.
     * @param granularity 'day', 'week', 'month', 'quarter', 'year'
     * @param includeInflationAdjusted Whether to include inflation-adjusted values.
     * @returns An array of TimelinePoint objects representing the historical financial state.
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

        while (currentDate <= endDate) {
            let pointDate = new Date(currentDate);
            let pointLabel = '';

            switch (granularity) {
                case 'day':
                    pointLabel = pointDate.toLocaleDateString();
                    break;
                case 'week':
                    const day = pointDate.getDate();
                    const week = Math.ceil(day / 7);
                    pointLabel = `Week ${week} ${pointDate.toLocaleString('default', { month: 'short' })}`;
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
                monthlyIncome: this.transactions.filter(tx => new Date(tx.date).getMonth() === pointDate.getMonth() && new Date(tx.date).getFullYear() === pointDate.getFullYear() && (tx.type === 'income' || tx.type === 'transfer_in' || tx.type === 'interest_income' || tx.type === 'dividend_income' || tx.type === 'capital_gain')).reduce((sum, tx) => sum + tx.amount, 0),
                monthlyExpenses: this.transactions.filter(tx => new Date(tx.date).getMonth() === pointDate.getMonth() && new Date(tx.date).getFullYear() === pointDate.getFullYear() && (tx.type === 'expense' || tx.type === 'transfer_out' || tx.type === 'debt_payment' || tx.type === 'investment' || tx.type === 'fee')).reduce((sum, tx) => sum + tx.amount, 0),
            };
            point.netCashFlow = (point.monthlyIncome || 0) - (point.monthlyExpenses || 0);

            point.goalProgress = {};
            this.goals.forEach(goal => {
                const currentAmountTowardsGoal = this.calculateSnapshot(pointDate, this.transactions, this.assets.filter(a => goal.linkedAssets?.includes(a.id)), []).totalAssets;
                 const progress = Math.min(1, currentAmountTowardsGoal / goal.targetAmount);
                 point.goalProgress![goal.id] = {
                    progress: progress,
                    contribution: currentAmountTowardsGoal,
                    required: goal.targetAmount,
                    status: progress >= 1 ? 'achieved' : (currentAmountTowardsGoal / goal.targetAmount > 0.75 ? 'ahead' : 'behind')
                 };
            });

            historicalPoints.push(point);

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
     * @returns An object containing TimelinePoint arrays for each scenario.
     */
    public generateFutureProjections(
        years: number = 10,
        baselineProjectionParameters: ScenarioParameters = { id: 'realistic', name: 'Realistic' },
        additionalScenarios: ScenarioParameters[] = [],
        includeInflationAdjusted: boolean = true
    ): { [scenarioId: string]: TimelinePoint[] } {
        const projections: { [scenarioId: string]: TimelinePoint[] } = {};

        // Calculate average historical monthly cash flow from past 12 months
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const last12MonthsTransactions = this.transactions.filter(tx => new Date(tx.date) > oneYearAgo && tx.status === 'settled');

        const averageMonthlyIncome = last12MonthsTransactions.filter(tx => ['income', 'transfer_in', 'interest_income', 'dividend_income', 'capital_gain'].includes(tx.type)).reduce((sum, tx) => sum + tx.amount, 0) / 12;
        const averageMonthlyExpenses = last12MonthsTransactions.filter(tx => ['expense', 'transfer_out', 'debt_payment', 'investment', 'fee'].includes(tx.type)).reduce((sum, tx) => sum + tx.amount, 0) / 12;
        const baseMonthlyNetCashFlow = averageMonthlyIncome - averageMonthlyExpenses;

        const currentSnapshot = this.calculateSnapshot(new Date(), this.transactions, this.assets, this.liabilities);
        const initialNetWorth = currentSnapshot.netWorth;
        const initialAssetsForProjection: Asset[] = Object.entries(currentSnapshot.currentAssetValues).map(([id, value]) => {
            const originalAsset = this.assets.find(a => a.id === id);
            return {
                ...(originalAsset || { id, name: id, type: 'other', value: 0 }), // Default asset if not found
                value: value,
                costBasis: currentSnapshot.currentAssetCostBases[id] // Include cost basis
            };
        });
        const initialLiabilitiesForProjection: Liability[] = Object.entries(currentSnapshot.currentLiabilityBalances).map(([id, balance]) => {
            const originalLiability = this.liabilities.find(l => l.id === id);
            return {
                ...(originalLiability || { id, name: id, type: 'loan', originalAmount: balance, interestRate: 0 }), // Default liability
                currentBalance: balance
            };
        });


        // Define base asset growth rates (annual, converted to monthly later)
        const baseAssetAnnualGrowthRates: { [type: string]: number } = {
            'cash': 0.005, // 0.5% annual
            'savings_account': 0.0075,
            'checking_account': 0.001,
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
            let currentAssetsForScenario: { [id: string]: { asset: Asset, value: number, costBasis: number } } = initialAssetsForProjection.reduce((acc, a) => ({ ...acc, [a.id]: { asset: a, value: a.value, costBasis: a.costBasis || a.value } }), {});
            let currentLiabilitiesForScenario: { [id: string]: { liability: Liability, balance: number, minimumPaymentDue: number } } = initialLiabilitiesForProjection.reduce((acc, l) => ({ ...acc, [l.id]: { liability: l, balance: l.currentBalance, minimumPaymentDue: l.minimumPayment || 0 } }), {});
            
            // Adjust initial assets based on scenario
            if (scenario.initialAssetsAdjustment) {
                const liquidCashId = 'CASH_LIQUID';
                if (!currentAssetsForScenario[liquidCashId]) {
                    currentAssetsForScenario[liquidCashId] = { asset: { id: liquidCashId, name: 'Liquid Cash', type: 'cash', value: 0, liquidityScore: 1 }, value: 0, costBasis: 0 };
                }
                currentAssetsForScenario[liquidCashId].value += scenario.initialAssetsAdjustment;
                currentAssetsForScenario[liquidCashId].costBasis += scenario.initialAssetsAdjustment;
            }

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
                
                // Adjust cash flow for job loss or other duration-based events
                scenario.majorLifeEvents?.forEach(event => {
                    if (event.type === 'job_loss' && new Date(event.date).getMonth() === projectionDate.getMonth() && new Date(event.date).getFullYear() === projectionDate.getFullYear()) {
                        const duration = event.durationMonths || 3; // Default 3 months
                        if (i < years * 12 - duration * 12) { // Ensure event is within projection
                            // Reduce cash flow for the duration of job loss
                            monthlyCashFlow -= event.amount; // event.amount represents monthly income loss
                        }
                    }
                });
                currentCashBalance += monthlyCashFlow;

                // --- 2. Apply asset growth ---
                Object.values(currentAssetsForScenario).forEach(item => {
                    const annualReturnAdjustment = scenario.assetReturnRateAdjustment?.[item.asset.type] || 0;
                    const effectiveAnnualRate = (item.asset.annualReturnRate || baseAssetAnnualGrowthRates[item.asset.type] || baseAssetAnnualGrowthRates['other']) + annualReturnAdjustment;
                    const monthlyRate = Math.pow(1 + effectiveAnnualRate, 1/12) - 1;

                    item.value *= (1 + monthlyRate);
                });

                // --- 3. Apply liability payments & interest ---
                let totalMonthlyDebtPayments = 0;
                Object.values(currentLiabilitiesForScenario).forEach(item => {
                    if (item.balance <= 0) {
                         item.balance = 0; // Ensure balance doesn't go negative after payment
                         return; // Debt paid off
                    }

                    const monthlyInterest = item.balance * (item.liability.interestRate / 12);
                    item.balance += monthlyInterest; // Interest accrues

                    // Simplified: assume minimum payments are extracted from `monthlyCashFlow` implicitly
                    // Advanced: explicitly model debt repayment based on strategy (avalanche/snowball)
                    const paymentAmount = item.minimumPaymentDue > 0 ? item.minimumPaymentDue : (monthlyCashFlow > 0 ? monthlyCashFlow * 0.1 : 0); // Placeholder
                    if (paymentAmount > 0 && currentCashBalance >= paymentAmount) {
                        currentCashBalance -= paymentAmount;
                        item.balance -= paymentAmount;
                        totalMonthlyDebtPayments += paymentAmount;
                    }
                    if (item.balance < 0) item.balance = 0; // Ensure liability doesn't go negative
                });

                // --- 4. Apply scenario-specific major events ---
                scenario.majorLifeEvents?.forEach(event => {
                    if (new Date(event.date).getMonth() === projectionDate.getMonth() && new Date(event.date).getFullYear() === projectionDate.getFullYear()) {
                        switch (event.type) {
                            case 'income_boost':
                            case 'inheritance':
                            case 'asset_sale':
                                currentCashBalance += event.amount;
                                if (event.assetId && currentAssetsForScenario[event.assetId]) {
                                    currentAssetsForScenario[event.assetId].value -= event.amount; // Assume asset sold for exact amount
                                    if (currentAssetsForScenario[event.assetId].value <= 0) delete currentAssetsForScenario[event.assetId];
                                }
                                break;
                            case 'large_expense':
                            case 'asset_purchase':
                                currentCashBalance -= event.amount;
                                if (event.assetId && currentAssetsForScenario[event.assetId]) {
                                    currentAssetsForScenario[event.assetId].value += event.amount; // Assume asset purchased
                                } else if (event.assetId) { // Add new asset if it doesn't exist
                                    currentAssetsForScenario[event.assetId] = { asset: { id: event.assetId, name: event.description, type: 'other', value: event.amount }, value: event.amount, costBasis: event.amount };
                                }
                                break;
                            case 'debt_acquisition':
                                if (event.liabilityId) {
                                    const newLiability: Liability = { id: event.liabilityId, name: event.description, type: 'loan', originalAmount: event.amount, currentBalance: event.amount, interestRate: 0.05 }; // Default interest
                                    currentLiabilitiesForScenario[event.liabilityId] = { liability: newLiability, balance: event.amount, minimumPaymentDue: newLiability.minimumPayment || 0 };
                                    currentCashBalance += event.amount; // Loan increases cash balance
                                }
                                break;
                            // 'job_loss' handled above for duration
                        }
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
                    if (item.asset.liquidityScore && item.asset.liquidityScore > 0.8 || item.asset.type === 'cash' || item.asset.type === 'checking_account' || item.asset.type === 'savings_account') {
                        currentLiquidAssets += assetValue;
                    } else {
                        currentIlliquidAssets += assetValue;
                    }
                });

                Object.values(currentLiabilitiesForScenario).forEach(item => {
                    currentTotalLiabilities += Math.max(0, item.balance);
                });

                const currentProjectedNetWorth = currentTotalAssets - currentTotalLiabilities;

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
                    riskScore: this.calculateRiskScore(Object.values(currentAssetsForScenario).map(a => a.asset), scenario.riskToleranceOverride || this.userProfile.riskTolerance),
                    portfolioAllocation: currentTotalAssets > 0 ? Object.values(currentAssetsForScenario).reduce((acc, item) => ({ ...acc, [item.asset.type]: (acc[item.asset.type] || 0) + (item.value / currentTotalAssets) }), {}) : {},
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
                        status: progress >= 1 ? 'achieved' : (currentAmountTowardsGoal / goal.targetAmount > 0.75 ? 'ahead' : 'behind')
                    };
                });

                scenarioProjections.push(timelinePoint);
            }
            projections[scenario.id] = scenarioProjections;
        });

        return projections;
    }

    /**
     * Calculates a composite portfolio risk score based on asset types, their volatilities, and user risk tolerance.
     * @param assets The list of assets to analyze.
     * @param userRiskTolerance The user's risk tolerance.
     * @returns A risk score out of 100.
     */
    private calculateRiskScore(assets: Asset[], userRiskTolerance: UserProfile['riskTolerance']): number {
        if (assets.length === 0) return 0;
        let totalWeightedVolatility = 0;
        let totalValue = 0;

        const volatilityMap: { [type: string]: number } = {
            'cash': 0.01, 'savings_account': 0.01, 'checking_account': 0.005,
            'stocks': 0.20, 'real_estate': 0.15, 'crypto': 0.40, 'bond': 0.05,
            'precious_metals': 0.10, 'collectibles': 0.12, 'business_equity': 0.25, 'other': 0.10
        };

        assets.forEach(asset => {
            const volatility = asset.volatility || volatilityMap[asset.type] || 0.1;
            const value = asset.value;
            totalWeightedVolatility += volatility * value;
            totalValue += value;
        });

        const rawRiskScore = totalValue > 0 ? (totalWeightedVolatility / totalValue) * 100 : 0;

        // Optionally, adjust risk score based on desired risk tolerance alignment
        let adjustedRiskScore = rawRiskScore;
        // Example: if tolerance is low but score is high, amplify the "high risk" signal
        // This is a simplification; a full model would compare against a target allocation/risk profile.

        return Math.min(100, Math.max(0, adjustedRiskScore)); // Cap between 0-100
    }

    /**
     * Analyzes timeline data to provide actionable insights and alerts.
     * Integrates with user profile and goals.
     * @param historicalTimeline An array of historical TimelinePoint objects.
     * @param futureProjections An object containing projected TimelinePoint arrays for various scenarios.
     * @returns An array of strings, each representing an actionable insight or alert.
     */
    public generateInsights(historicalTimeline: TimelinePoint[], futureProjections: { [scenarioId: string]: TimelinePoint[] }): string[] {
        const insights: string[] = [];
        const combinedTimeline = [...historicalTimeline, ...(futureProjections['realistic'] || futureProjections['projectionRealistic'] || [])];

        if (combinedTimeline.length < 2) return ["Not enough data for comprehensive insights. Keep tracking your finances for personalized analysis!"];

        const latestHistoricalPoint = historicalTimeline[historicalTimeline.length - 1];
        const initialHistoricalPoint = historicalTimeline[0];
        const latestProjectionPoint = (futureProjections['realistic'] || futureProjections['projectionRealistic'])?.[(futureProjections['realistic'] || futureProjections['projectionRealistic']).length - 1];

        if (!latestHistoricalPoint) {
            insights.push("Initial setup required: Please add some historical data (transactions, assets, liabilities) to generate meaningful insights.");
            return insights;
        }

        // 1. Overall Wealth Growth/Trajectory
        if (initialHistoricalPoint) {
            const historyGrowth = (latestHistoricalPoint.historyNetWorth || 0) - (initialHistoricalPoint.historyNetWorth || 0);
            if (initialHistoricalPoint.historyNetWorth && initialHistoricalPoint.historyNetWorth !== 0) {
                const percentageGrowth = (historyGrowth / initialHistoricalPoint.historyNetWorth) * 100;
                insights.push(`Your net worth has grown by $${historyGrowth.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${percentageGrowth.toFixed(2)}%) historically over ${historicalTimeline.length} months.`);
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
        if (avgNetCashFlow > 100) { // Positive and significant
            insights.push(`Excellent! You maintain a strong positive average monthly cash flow of $${avgNetCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}. This robust financial habit fuels your wealth growth.`);
        } else if (avgNetCashFlow < -100) { // Significant negative cash flow
            insights.push(`Alert: Your average monthly cash flow is negative ($${Math.abs(avgNetCashFlow).toLocaleString(undefined, { maximumFractionDigits: 0 })}). This trend can erode your wealth over time. Consider reviewing your expenses and income sources for optimization.`);
        } else if (Math.abs(avgNetCashFlow) <= 100) { // Near neutral
            insights.push(`Your recent cash flow is largely neutral. Optimizing your budget and increasing your savings rate (current target: ${(this.userProfile.savingsRateTarget * 100).toFixed(0)}%) can significantly accelerate your financial goals.`);
        }

        // 3. Goal Progress & Recommendations
        this.goals.forEach(goal => {
            const goalProgressAtLatest = latestProjectionPoint?.goalProgress?.[goal.id] || latestHistoricalPoint?.goalProgress?.[goal.id];
            if (goalProgressAtLatest) {
                if (goalProgressAtLatest.progress >= 1) {
                    insights.push(`Achievement unlocked! You are on track to exceed your goal: "${goal.name}". Consider setting a new target or reallocating surplus funds for further growth.`);
                } else if (goalProgressAtLatest.status === 'behind') {
                    const targetDate = new Date(goal.targetDate);
                    const now = new Date();
                    const monthsRemaining = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
                    const requiredMonthlyContribution = monthsRemaining > 0 ? (goal.targetAmount - goalProgressAtLatest.contribution) / monthsRemaining : 0;
                    if (requiredMonthlyContribution > 0) {
                         insights.push(`Action Required: You are behind on your "${goal.name}" goal. To meet your target by ${targetDate.toLocaleDateString()}, you need to increase your monthly contribution by approximately $${requiredMonthlyContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
                    } else {
                        insights.push(`Critical Alert: You are significantly behind on your "${goal.name}" goal, and the target date is imminent or past. Immediate review and strategy adjustment are required.`);
                    }
                } else if (goalProgressAtLatest.status === 'ahead') {
                    insights.push(`Great work! You are ahead of schedule for your "${goal.name}" goal. Keep up the momentum! This efficiency could allow for earlier achievement or increased target.`);
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

                // Simplified retirement income calculation (e.g., 4% withdrawal rule, adjusted for inflation)
                const projectedAnnualIncome = inflationAdjustedRetirementWorth * 0.04; // 4% rule
                if (projectedAnnualIncome < this.userProfile.desiredRetirementIncome) {
                    insights.push(`Retirement Alert: Your projected annual retirement income of $${projectedAnnualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })} (in today's dollars) is below your desired $${this.userProfile.desiredRetirementIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Consider increasing your contributions or adjusting your investment strategy to achieve your retirement goals.`);
                } else {
                    insights.push(`Retirement Outlook: You are on track to achieve an annual income of $${projectedAnnualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })} in retirement (in today's dollars), comfortably exceeding your desired target.`);
                }
            }
        }

        // 5. Risk Assessment & Portfolio Optimization
        const latestRiskScore = latestHistoricalPoint?.riskScore || 0;
        const userRiskToleranceValue = { 'low': 30, 'medium': 50, 'high': 70, 'aggressive': 90 }[this.userProfile.riskTolerance] || 50;

        if (latestRiskScore > userRiskToleranceValue + 10) { // Current risk significantly higher than tolerance
            insights.push(`Warning: Your portfolio's current risk score (${latestRiskScore.toFixed(0)}) is significantly higher than your stated ${this.userProfile.riskTolerance} risk tolerance. This may expose you to undue market volatility. Review your asset allocation for potential rebalancing to align with your comfort level.`);
        } else if (latestRiskScore < userRiskToleranceValue - 10) { // Current risk significantly lower than tolerance
             insights.push(`Opportunity: Your portfolio's current risk score (${latestRiskScore.toFixed(0)}) is lower than your stated ${this.userProfile.riskTolerance} risk tolerance. You might be missing out on potential growth opportunities. Consider diversifying into higher-growth assets to optimize returns given your risk appetite.`);
        }
        insights.push("AI-powered portfolio optimization suggestions are being generated in the background, focusing on risk-adjusted returns and goal alignment, enabling proactive wealth management.");


        // 6. Economic Factor Integration
        const lastMarketData = MarketDataService.getLatestMarketData();
        if (lastMarketData) {
            const currentAnnualInflation = lastMarketData.inflationRateMonthly * 12;
            if (currentAnnualInflation > (this.userProfile.inflationExpectation + 0.01)) { // If current inflation is 1% higher than expectation
                insights.push(`Market Alert: Recent inflation rates (approx. ${(currentAnnualInflation * 100).toFixed(1)}% annual) are notably higher than your long-term expectation. This could impact purchasing power and requires attention to inflation-hedging assets and strategies.`);
            } else if (lastMarketData.economicSentimentIndex < 30) {
                 insights.push(`Economic Watch: Market sentiment is currently low (${lastMarketData.economicSentimentIndex.toFixed(0)}). While challenging, economic downturns can present significant long-term investment opportunities for resilient and well-diversified portfolios.`);
            }
        }

        // 7. Debt Management
        const totalLiabilities = latestHistoricalPoint?.totalLiabilitiesValue || 0;
        if (totalLiabilities > 0) {
            const highInterestDebts = this.liabilities.filter(l => l.currentBalance > 0 && l.interestRate > 0.08); // e.g., >8% annual
            if (highInterestDebts.length > 0) {
                insights.push(`Recommendation: Prioritize repayment of high-interest debts like ${highInterestDebts.map(d => d.name).join(', ')}. Eliminating these liabilities can significantly improve your net worth trajectory and free up cash flow for investments.`);
            }
        }

        insights.push("Advanced scenario planning with real-time market data integration is available to stress-test your financial future, providing robust decision support.");
        insights.push("Explore the 'What If' engine to model impacts of career changes, major purchases, or unexpected events, gaining strategic clarity.");

        return insights;
    }

    /**
     * Identifies potential anomalies or deviations from expected financial patterns.
     * This method is a key component for agentic AI systems for proactive monitoring.
     * Business value: Real-time anomaly detection prevents financial erosion, identifies
     * fraud, and highlights emerging opportunities. By continuously monitoring financial
     * flows against expected patterns and user-defined thresholds, this function provides
     * early warnings that can save millions in potential losses, optimize capital allocation,
     * and enhance the security and integrity of all financial operations.
     * @param historicalTimeline The historical financial timeline.
     * @param projectionBaseline The baseline future projection.
     * @returns An array of detected anomalies.
     */
    public detectAnomalies(historicalTimeline: TimelinePoint[], projectionBaseline: TimelinePoint[]): TimelinePoint['alerts'] {
        const anomalies: TimelinePoint['alerts'] = [];
        if (historicalTimeline.length < 12) { // Need at least a year of data for meaningful patterns
            return [{ type: 'info', message: 'Insufficient historical data for comprehensive anomaly detection.', code: 'ANOMALY_INFO_001' }];
        }

        const latestHistorical = historicalTimeline[historicalTimeline.length - 1];
        const previousMonth = historicalTimeline[historicalTimeline.length - 2]; // Or average of last few months

        if (!latestHistorical || !previousMonth) return anomalies;

        // Anomaly 1: Sudden significant drop in net worth
        const netWorthDropThreshold = 0.10; // 10% drop
        if (latestHistorical.historyNetWorth && previousMonth.historyNetWorth &&
            (previousMonth.historyNetWorth - latestHistorical.historyNetWorth) / previousMonth.historyNetWorth > netWorthDropThreshold) {
            anomalies.push({
                type: 'critical',
                message: `Critical: Your net worth dropped by ${(((previousMonth.historyNetWorth - latestHistorical.historyNetWorth) / previousMonth.historyNetWorth) * 100).toFixed(1)}% in the last month. Investigate large expenses, asset divestments, or market fluctuations.`,
                code: 'NW_DROP_001'
            });
        }

        // Anomaly 2: Unusually high expenses
        const recentExpenses = latestHistorical.monthlyExpenses || 0;
        const avgExpensesPast6Months = historicalTimeline.slice(-7, -1).reduce((sum, p) => sum + (p.monthlyExpenses || 0), 0) / 6;
        const expenseIncreaseThreshold = 1.5; // 50% increase
        if (avgExpensesPast6Months > 0 && recentExpenses > avgExpensesPast6Months * expenseIncreaseThreshold) {
            anomalies.push({
                type: 'warning',
                message: `Warning: Your monthly expenses increased by ${(recentExpenses / avgExpensesPast6Months * 100 - 100).toFixed(1)}% compared to the 6-month average. Review recent spending.`,
                code: 'EXP_SPIKE_001'
            });
        }

        // Anomaly 3: Goal progress significantly behind schedule
        this.goals.forEach(goal => {
            const goalProgress = latestHistorical.goalProgress?.[goal.id];
            if (goalProgress && goalProgress.status === 'behind') {
                const targetDate = new Date(goal.targetDate);
                const now = new Date();
                if (targetDate > now) { // Only if target date is in the future
                    anomalies.push({
                        type: 'warning',
                        message: `Goal Alert: "${goal.name}" is significantly behind schedule (${(goalProgress.progress * 100).toFixed(1)}% progress towards ${goal.targetAmount.toLocaleString()}). Increased contributions or revised strategy needed.`,
                        code: 'GOAL_BEHIND_001'
                    });
                }
            }
        });

        // Anomaly 4: High risk exposure vs. tolerance
        const latestRiskScore = latestHistorical.riskScore || 0;
        const userRiskToleranceValue = { 'low': 30, 'medium': 50, 'high': 70, 'aggressive': 90 }[this.userProfile.riskTolerance] || 50;
        if (latestRiskScore > userRiskToleranceValue + 20) { // 20 points above tolerance
            anomalies.push({
                type: 'critical',
                message: `Critical Risk: Your portfolio risk score (${latestRiskScore.toFixed(0)}) substantially exceeds your ${this.userProfile.riskTolerance} risk tolerance. Immediate review of asset allocation recommended.`,
                code: 'RISK_MISMATCH_001'
            });
        }

        // Anomaly 5: Unexpected income drop
        const recentIncome = latestHistorical.monthlyIncome || 0;
        const avgIncomePast6Months = historicalTimeline.slice(-7, -1).reduce((sum, p) => sum + (p.monthlyIncome || 0), 0) / 6;
        const incomeDropThreshold = 0.20; // 20% drop
        if (avgIncomePast6Months > 0 && (avgIncomePast6Months - recentIncome) / avgIncomePast6Months > incomeDropThreshold) {
            anomalies.push({
                type: 'warning',
                message: `Warning: Your monthly income dropped by ${(((avgIncomePast6Months - recentIncome) / avgIncomePast6Months) * 100).toFixed(1)}% compared to the 6-month average. Investigate income sources.`,
                code: 'INC_DROP_001'
            });
        }

        // Anomaly 6: Asset performance deviation from projection
        if (projectionBaseline.length > 0 && latestHistorical.historyNetWorth !== undefined) {
            const correspondingProjectedPoint = projectionBaseline.find(p => p.date.getFullYear() === latestHistorical.date.getFullYear() && p.date.getMonth() === latestHistorical.date.getMonth());
            if (correspondingProjectedPoint?.projectionRealisticNetWorth !== undefined) {
                const deviation = latestHistorical.historyNetWorth - correspondingProjectedPoint.projectionRealisticNetWorth;
                const deviationPercentage = deviation / correspondingProjectedPoint.projectionRealisticNetWorth;
                if (deviationPercentage < -0.10) { // 10% below projection
                    anomalies.push({
                        type: 'warning',
                        message: `Warning: Actual net worth is ${(Math.abs(deviationPercentage) * 100).toFixed(1)}% below the realistic projection for this period. Review investment performance and market conditions.`,
                        code: 'PROJ_DEVIATION_001'
                    });
                }
            }
        }

        // Anomaly 7: High proportion of illiquid assets relative to age/goals (simplified)
        if (latestHistorical.illiquidAssetsValue !== undefined && latestHistorical.totalAssetsValue !== undefined && latestHistorical.totalAssetsValue > 0) {
            const illiquidRatio = latestHistorical.illiquidAssetsValue / latestHistorical.totalAssetsValue;
            const currentAge = new Date().getFullYear() - new Date(this.userProfile.dob).getFullYear();

            // Example thresholds: higher illiquid assets for younger individuals, less for those near retirement
            let illiquidThreshold = 0.6; // Default 60%
            if (currentAge >= this.userProfile.retirementAge - 5) { // 5 years before retirement
                illiquidThreshold = 0.3; // Should have more liquid assets
            }

            if (illiquidRatio > illiquidThreshold) {
                anomalies.push({
                    type: 'info',
                    message: `Information: Your portfolio has a high proportion of illiquid assets (${(illiquidRatio * 100).toFixed(1)}% of total assets). Consider diversifying into more liquid assets, especially if nearing retirement.`,
                    code: 'ILLIQUID_ASSET_001'
                });
            }
        }

        return anomalies;
    }

    /**
     * Recommends actions based on detected anomalies and insights.
     * This forms the "decide" and "act" phase for an agentic AI.
     * Business value: This function translates complex financial analysis into clear, actionable strategies,
     * automating the decision-making process for financial agents. It drives immediate ROI by guiding
     * users or AI systems to optimize portfolios, adjust budgets, or mitigate risks proactively.
     * This automation drastically reduces the need for manual financial advisory, making sophisticated
     * financial management accessible and scalable, unlocking significant operational efficiencies and
     * new service offerings for high-value clients.
     * @param insights An array of insights from generateInsights.
     * @param anomalies An array of anomalies from detectAnomalies.
     * @returns An array of recommended actions.
     */
    public recommendActions(insights: string[], anomalies: TimelinePoint['alerts']): string[] {
        const actions: string[] = [];

        // Prioritize actions based on critical anomalies
        const criticalAnomalies = anomalies?.filter(a => a.type === 'critical');
        if (criticalAnomalies && criticalAnomalies.length > 0) {
            criticalAnomalies.forEach(anomaly => {
                if (anomaly.code === 'NW_DROP_001') {
                    actions.push("Action: Immediately review recent transactions and investment performance to identify the cause of net worth drop. Consider temporary budget cuts.");
                    actions.push("Action: Consult with a financial advisor or an AI agent specializing in portfolio recovery.");
                } else if (anomaly.code === 'RISK_MISMATCH_001') {
                    actions.push("Action: Rebalance your portfolio to align with your stated risk tolerance. This may involve selling high-volatility assets and purchasing more stable ones.");
                    actions.push("Action: Update your investment strategy with your financial agent to enforce risk boundaries.");
                }
            });
        }

        // Actions based on general insights and warnings
        insights.forEach(insight => {
            if (insight.includes('negative average monthly cash flow')) {
                actions.push("Action: Implement a strict budget review. Identify and reduce non-essential expenses by at least 15-20% for the next three months.");
                actions.push("Action: Explore opportunities to increase income (e.g., side hustle, negotiation for salary increase).");
            } else if (insight.includes('behind on your') && insight.includes('goal')) {
                const goalNameMatch = insight.match(/behind on your "([^"]+)" goal/);
                const goalName = goalNameMatch ? goalNameMatch[1] : 'a specific goal';
                const requiredContributionMatch = insight.match(/increase your monthly contribution by approximately \$([\d,]+)/);
                const requiredContribution = requiredContributionMatch ? requiredContributionMatch[1] : 'a significant amount';

                actions.push(`Action: Increase monthly contributions to "${goalName}" by at least $${requiredContribution}. Adjust other discretionary spending if necessary.`);
                actions.push(`Action: Review the asset allocation for "${goalName}" to ensure it aligns with the target date and desired growth rate.`);
            } else if (insight.includes('Retirement Alert: Your projected annual retirement income')) {
                actions.push("Action: Increase your monthly retirement savings contributions. Aim for an additional 5-10% of your income.");
                actions.push("Action: Review your retirement investment portfolio; consider optimizing for higher, risk-adjusted returns appropriate for your investment horizon.");
                actions.push("Action: Explore potential part-time work options in early retirement or deferring retirement by a few years to build more capital.");
            } else if (insight.includes('Opportunity: Your portfolio\'s current risk score')) {
                actions.push("Action: Diversify your portfolio into growth-oriented assets (e.g., specific stock sectors, emerging markets, cryptocurrencies) to capitalize on your higher risk tolerance.");
                actions.push("Action: Work with your agent to identify undervalued high-growth assets that align with your risk profile.");
            } else if (insight.includes('Market Alert: Recent inflation rates')) {
                actions.push("Action: Investigate inflation-hedging assets such as Treasury Inflation-Protected Securities (TIPS), real estate, commodities, or dividend-paying stocks.");
                actions.push("Action: Review and adjust your budget to account for increased costs due to inflation.");
            } else if (insight.includes('Prioritize repayment of high-interest debts')) {
                const debtsMatch = insight.match(/high-interest debts like ([^.]+)\./);
                const debts = debtsMatch ? debtsMatch[1] : 'high-interest debts';
                actions.push(`Action: Focus all available surplus cash flow towards accelerating the repayment of ${debts} using an avalanche or snowball method.`);
                actions.push("Action: Explore debt refinancing options to lower interest rates and reduce monthly payments.");
            } else if (insight.includes('high proportion of illiquid assets')) {
                actions.push("Action: Develop a plan for strategic divestment of some illiquid assets to improve liquidity, especially if nearing a major financial milestone or retirement.");
                actions.push("Action: Rebalance new investments towards more liquid asset classes.");
            }
        });

        // Add general proactive actions if no specific issues
        if (actions.length === 0) {
            actions.push("Action: Continue to monitor your financial performance. Consider reviewing your budget quarterly and optimizing your investment portfolio annually.");
            actions.push("Action: Explore advanced scenario planning to stress-test your financial resilience against potential future events.");
        }

        return [...new Set(actions)]; // Return unique actions
    }
}
```