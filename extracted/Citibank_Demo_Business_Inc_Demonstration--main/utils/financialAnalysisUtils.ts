import { 
    Transaction, Asset, Liability, FinancialGoal, 
    InvestmentAccount, CryptoWallet, UserPreferences,
    MarketData, InvestmentHolding, CryptoAsset,
    calculateNetWorth, calculateBurnRateAndRunway, getFinancialHealthScore 
} from '../components/BalanceSummary';
export interface EconomicIndicatorSnapshot {
    date: string;
    gdpGrowthRate: number; 
    inflationRate: number;
    unemploymentRate: number;
    consumerConfidenceIndex: number; 
    centralBankRate: number; 
    housingStarts: number; 
    manufacturingPMI: number; 
}
export interface ScenarioResult {
    scenarioName: string;
    projectedNetWorth: number;
    maxDrawdown: number; 
    recoveryTimeMonths: number;
    stressTestImpact: {
        assetDevaluation: number; 
        incomeReduction: number; 
        liabilityIncrease: number; 
    };
    probabilityOfSuccess: number; 
}
export interface DebtOptimizationPlan {
    strategy: 'avalanche' | 'snowball' | 'custom';
    recommendedPayments: { liabilityId: string; amount: number; }[];
    projectedSavings: number; 
    estimatedPayoffDate: string;
}
export interface TaxEfficiencyReport {
    taxableIncome: number;
    totalTaxPaid: number;
    effectiveTaxRate: number;
    potentialSavings: {
        iraContributions: number;
        _401kContributions: number;
        taxLossHarvesting: number;
        otherDeductions: number;
    };
    recommendations: string[];
}
export interface LiquidityAnalysis {
    currentRatio: number; 
    quickRatio: number; 
    cashConversionCycle: number; 
    freeCashFlow: number; 
    liquidityScore: number; 
    insights: string[];
}
export interface ESGScore {
    environment: number; 
    social: number; 
    governance: number; 
    overall: number; 
    controversies: string[];
}
export interface InvestmentRiskProfile {
    volatilityScore: number; 
    diversificationIndex: number; 
    correlationMatrix: { [key: string]: { [key: string]: number } }; 
    betaWeightedPortfolio: number; 
    riskAdjustedReturn: number; 
    stressTestResults: ScenarioResult[];
}
export interface GoalProgressProjection {
    goalId: string;
    monthlyContributionsRequired: number;
    projectedCompletionDate: string;
    pathDeviationRisk: number; 
    milestones: { date: string; targetAmount: number; }[];
}
export interface MachineLearningModelConfig {
    modelId: string;
    algorithm: 'linear_regression' | 'random_forest' | 'neural_network' | 'arima';
    trainingDataSize: number;
    featuresUsed: string[];
    performanceMetrics: {
        rSquared?: number;
        mae?: number; 
        rmse?: number; 
        accuracy?: number; 
    };
    lastTrained: string;
}
export interface UserBehaviorMetrics {
    loginCountLast30Days: number;
    featureUsageFrequency: Record<string, number>;
    averageSessionDurationMinutes: number;
    notificationResponseRate: number; 
    riskAssessmentFrequency: number; 
}
export interface ComplianceAuditReport {
    auditDate: string;
    auditor: string;
    findings: string[];
    recommendations: string[];
    overallComplianceRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    actionItems: {itemId: string; description: string; dueDate: string; status: 'Open' | 'Closed'}[];
}
export interface PortfolioRebalanceRecommendation {
    symbol: string;
    action: 'buy' | 'sell';
    quantity: number;
    reason: string;
    targetWeight?: number;
    currentWeight?: number;
}
export interface RetirementProjection {
    projectedSavingsAtRetirement: number; 
    incomeNeededAdjustedForInflation: number;
    canSustainForYears: number;
    retirementGap: number; 
    recommendations: string[];
}
export interface CashFlowProjectionMonthly {
    month: string;
    startingBalance: number;
    income: number;
    expenses: number;
    irregularNet: number;
    endingBalance: number;
}
export interface SpendingPatternAnalysis {
    spendingByMonth: { month: string; total: number; }[];
    anomalyAlerts: string[];
    categoryDistribution: { category: string; amount: number; percent: number; }[];
}
export interface PerformanceMetricHistory {
    date: string;
    value: number;
    metricType: string; 
}
export interface ScenarioConfiguration {
    id: string;
    name: string;
    description: string;
    params: Record<string, any>; 
    isActive: boolean;
    creationDate: string;
}
export interface InvestmentStrategy {
    strategyId: string;
    name: string;
    type: 'growth' | 'value' | 'dividend' | 'momentum' | 'balanced' | 'sustainable';
    riskProfileMatch: 'low' | 'medium' | 'high';
    targetAllocation: Record<string, number>; 
    expectedAnnualReturn: number;
    expectedVolatility: number;
}
export interface RegulatoryComplianceCheck {
    ruleId: string;
    ruleDescription: string;
    complianceStatus: 'Compliant' | 'Non-Compliant' | 'Warning';
    lastChecked: string;
    actionRequired?: string;
    severity: 'High' | 'Medium' | 'Low';
}
export interface EconomicPolicyEffect {
    policyName: string;
    policyType: 'fiscal' | 'monetary' | 'regulatory';
    startDate: string;
    projectedImpactGDP: number; 
    projectedImpactInflation: number; 
    impactDurationMonths: number;
    assessment: string;
}
export interface PortfolioOptimizationResult {
    optimizedAllocation: Record<string, number>;
    expectedReturn: number;
    expectedRisk: number;
    sharpeRatio: number;
    optimizationMethod: 'monte_carlo' | 'mean_variance' | 'risk_parity';
    efficiencyScore: number;
}
export interface DebtServiceCoverageRatio {
    netOperatingIncome: number;
    totalDebtService: number;
    dsCR: number;
    interpretation: string; 
}
export interface AdvancedLoanAmortization {
    loanId: string;
    startDate: string;
    payments: {
        paymentNumber: number;
        paymentDate: string;
        startingBalance: number;
        interestPaid: number;
        principalPaid: number;
        endingBalance: number;
    }[];
    totalInterestPaid: number;
    totalPayments: number;
}
export interface CurrencyExchangeRate {
    baseCurrency: string;
    targetCurrency: string;
    rate: number;
    lastUpdated: string;
    trend: 'up' | 'down' | 'stable';
}
export interface RealEstateValuation {
    propertyId: string;
    address: string;
    valuationDate: string;
    marketValue: number;
    rentalIncomePotential: number;
    capRate: number; 
    valuationMethod: 'comparable_sales' | 'income_approach' | 'cost_approach';
}
export interface AlternativeInvestmentDetails {
    assetType: 'art' | 'collectibles' | 'private_equity' | 'venture_capital' | 'real_estate_crowdfunding';
    name: string;
    investmentAmount: number;
    currentValuation: number;
    acquisitionDate: string;
    liquidityHorizonYears: number; 
    projectedIRR: number; 
}
export interface DerivativeContract {
    contractId: string;
    instrumentType: 'option' | 'future' | 'swap';
    underlyingAsset: string;
    strikePrice?: number; 
    expirationDate: string;
    quantity: number;
    premiumPaidReceived?: number;
    currentValue: number;
    riskFactor: number;
}
export interface BlockchainTransactionDetails {
    transactionHash: string;
    blockNumber: number;
    fromAddress: string;
    toAddress: string;
    value: number; 
    gasFee: number;
    timestamp: string;
    status: 'confirmed' | 'pending' | 'failed';
    network: string;
}
export interface AI_AssistedTradingStrategy {
    strategyName: string;
    modelConfig: MachineLearningModelConfig;
    entryConditions: string[];
    exitConditions: string[];
    backtestResults: {
        winRate: number;
        profitFactor: number;
        maxDrawdown: number;
        annualizedReturn: number;
    };
    isActive: boolean;
}
export interface FinancialReportingStandard {
    standardName: string; 
    effectiveDate: string;
    keyPrinciples: string[];
    complianceGuidance: string;
}
export const DEFAULT_ANNUAL_INFLATION_RATE: number = 0.035;
export const DEFAULT_MARKET_GROWTH_EXPECTATION: number = 0.07;
export const DEFAULT_RISK_FREE_RATE: number = 0.02;
export const EMERGENCY_FUND_TARGET_MONTHS: number = 6;
export const MAX_DEBT_TO_INCOME_RATIO: number = 0.36;
export const TAX_BRACKET_INCREMENT_FACTOR: number = 1.02; 
export const MIN_DIVERSIFICATION_THRESHOLD: number = 0.7; 
export const DEFAULT_SIMULATION_ITERATIONS: number = 1000;
export const CRITICAL_LIQUIDITY_THRESHOLD: number = 1.5; 
export const HISTORICAL_DATA_WINDOW_YEARS: number = 5;
export const REBALANCING_THRESHOLD_PERCENT: number = 0.05;
export const RETIREMENT_WITHDRAWAL_RATE: number = 0.04;
export const MAX_RETIREMENT_AGE: number = 90;
export const MIN_CREDIT_SCORE: number = 300;
export const MAX_CREDIT_SCORE: number = 850;
export const ANOMALY_DETECTION_MULTIPLIER: number = 2.5;
export const calculateAnnuityFutureValue = (
    paymentAmount: number, 
    interestRatePerPeriod: number, 
    numberOfPeriods: number
): number => {
    if (interestRatePerPeriod === 0) {
        return paymentAmount * numberOfPeriods;
    }
    const factor = Math.pow(1 + interestRatePerPeriod, numberOfPeriods) - 1;
    return paymentAmount * (factor / interestRatePerPeriod);
};
export const calculateAnnuityPresentValue = (
    paymentAmount: number,
    interestRatePerPeriod: number,
    numberOfPeriods: number
): number => {
    if (interestRatePerPeriod === 0) {
        return paymentAmount * numberOfPeriods;
    }
    const factor = 1 - Math.pow(1 + interestRatePerPeriod, -numberOfPeriods);
    return paymentAmount * (factor / interestRatePerPeriod);
};
export const runMonteCarloPortfolioSimulation = (
    initialPortfolioValue: number,
    annualReturnMean: number,
    annualReturnStdDev: number,
    annualContributions: number,
    simulationYears: number,
    numSimulations: number = DEFAULT_SIMULATION_ITERATIONS
): number[] => {
    const simulationResults: number[] = [];
    for (let i = 0; i < numSimulations; i++) {
        let currentPortfolioValue = initialPortfolioValue;
        for (let year = 0; year < simulationYears; year++) {
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            const annualReturn = annualReturnMean + annualReturnStdDev * z;
            currentPortfolioValue = (currentPortfolioValue + annualContributions) * (1 + annualReturn);
        }
        simulationResults.push(currentPortfolioValue);
    }
    return simulationResults;
};
export const evaluateStressScenario = (
    currentAssets: number,
    currentLiabilities: number,
    scenario: { assetDevaluation: number; incomeReduction: number; liabilityIncrease: number; },
    scenarioName: string = 'Custom Stress Test'
): ScenarioResult => {
    const adjustedAssets = currentAssets * (1 - scenario.assetDevaluation);
    const adjustedLiabilities = currentLiabilities * (1 + scenario.liabilityIncrease);
    const projectedNetWorth = adjustedAssets - adjustedLiabilities;
    const maxDrawdown = Math.random() * (0.1 + scenario.assetDevaluation);
    const recoveryTimeMonths = Math.max(1, Math.floor(Math.random() * 24 * (1 + scenario.liabilityIncrease)));
    const probabilityOfSuccess = Math.max(0, Math.min(1, 1 - (scenario.assetDevaluation + scenario.liabilityIncrease) / 3));
    return {
        scenarioName,
        projectedNetWorth,
        maxDrawdown: parseFloat(maxDrawdown.toFixed(4)),
        recoveryTimeMonths,
        stressTestImpact: scenario,
        probabilityOfSuccess: parseFloat(probabilityOfSuccess.toFixed(4)),
    };
};
export const generateDebtOptimizationPlan = (
    liabilities: Liability[],
    extraMonthlyPayment: number,
    strategy: 'avalanche' | 'snowball'
): DebtOptimizationPlan => {
    let sortedLiabilities: Liability[];
    if (strategy === 'avalanche') {
        sortedLiabilities = [...liabilities].sort((a, b) => b.interestRate - a.interestRate);
    } else { 
        sortedLiabilities = [...liabilities].sort((a, b) => a.currentBalance - b.currentBalance);
    }
    const recommendedPayments: { liabilityId: string; amount: number; }[] = [];
    let projectedSavings = 0;
    let remainingExtraPayment = extraMonthlyPayment;
    let workingLiabilities = sortedLiabilities.map(l => ({ ...l, remainingBalance: l.currentBalance }));
    for (const lib of workingLiabilities) {
        recommendedPayments.push({ liabilityId: lib.id, amount: lib.minimumPayment });
    }
    for (const lib of workingLiabilities) {
        if (remainingExtraPayment > 0) {
            const paymentToAdd = Math.min(remainingExtraPayment, lib.remainingBalance + lib.minimumPayment * 0.5);
            const existingPaymentIndex = recommendedPayments.findIndex(rp => rp.liabilityId === lib.id);
            if (existingPaymentIndex !== -1) {
                recommendedPayments[existingPaymentIndex].amount += paymentToAdd;
            } else {
                 recommendedPayments.push({ liabilityId: lib.id, amount: lib.minimumPayment + paymentToAdd });
            }
            remainingExtraPayment -= paymentToAdd;
        }
    }
    let totalInterestPaidWithoutOptimization = liabilities.reduce((sum, l) => sum + l.currentBalance * (l.interestRate / 12), 0) * 60;
    projectedSavings = totalInterestPaidWithoutOptimization * (0.15 + Math.random() * 0.1); 
    let overallPayoffDate = new Date();
    overallPayoffDate.setMonth(overallPayoffDate.getMonth() + Math.floor(Math.random() * 120) + 12);
    return {
        strategy,
        recommendedPayments,
        projectedSavings: parseFloat(projectedSavings.toFixed(2)),
        estimatedPayoffDate: overallPayoffDate.toISOString().split('T')[0],
    };
};
export const assessLiquidityPosition = (
    assets: Asset[],
    liabilities: Liability[],
    monthlyExpenses: number
): LiquidityAnalysis => {
    const currentAssets = assets.filter(a => ['cash', 'investment'].includes(a.type)).reduce((sum, a) => sum + a.value, 0);
    const currentLiabilities = liabilities.filter(l => new Date(l.dueDate).getMonth() === new Date().getMonth()).reduce((sum, l) => sum + l.currentBalance, 0);
    const inventoryAssets = assets.filter(a => a.type === 'other').reduce((sum, a) => sum + a.value, 0);
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : Infinity;
    const quickRatio = currentLiabilities > 0 ? (currentAssets - inventoryAssets) / currentLiabilities : Infinity;
    const cashConversionCycle = Math.floor(Math.random() * 60 + 30);
    const estimatedMonthlyOperatingCashFlow = monthlyExpenses * (1.5 + Math.random() * 0.5);
    const capitalExpenditures = monthlyExpenses * (0.1 + Math.random() * 0.05);
    const freeCashFlow = estimatedMonthlyOperatingCashFlow - capitalExpenditures;
    let liquidityScore = 0;
    const insights: string[] = [];
    if (currentRatio > CRITICAL_LIQUIDITY_THRESHOLD) {
        liquidityScore += 40;
        insights.push("Excellent current ratio, indicating strong ability to cover short-term obligations.");
    } else if (currentRatio > 1.0) {
        liquidityScore += 20;
        insights.push("Adequate current ratio, but room for improvement in short-term solvency.");
    } else {
        insights.push("Low current ratio, consider increasing liquid assets or reducing short-term debt.");
    }
    if (quickRatio > 1.0) {
        liquidityScore += 30;
        insights.push("Strong quick ratio, indicating good liquidity even without selling less liquid assets.");
    } else {
        insights.push("Review quick assets, reliance on less liquid assets might be high.");
    }
    if (freeCashFlow > 0.5 * monthlyExpenses) {
        liquidityScore += 20;
        insights.push("Positive and strong free cash flow, allows for investments and debt reduction.");
    } else if (freeCashFlow > 0) {
        liquidityScore += 10;
        insights.push("Positive free cash flow, but could be stronger. Monitor expenditures.");
    } else {
        insights.push("Negative free cash flow, indicating spending exceeds generated cash. Urgent review needed.");
    }
    return {
        currentRatio: parseFloat(currentRatio.toFixed(2)),
        quickRatio: parseFloat(quickRatio.toFixed(2)),
        cashConversionCycle,
        freeCashFlow: parseFloat(freeCashFlow.toFixed(2)),
        liquidityScore: Math.min(100, liquidityScore + Math.floor(Math.random() * 10)),
        insights,
    };
};
export const calculateESGScores = (
    investmentHoldings: InvestmentHolding[],
    marketData: MarketData
): ESGScore => {
    let envScore = 0, socialScore = 0, govScore = 0;
    const controversies: string[] = [];
    investmentHoldings.forEach(holding => {
        const sectorFactor = holding.sector?.length || 5;
        envScore += Math.random() * 10 * (holding.marketValue > 10000 ? 1.5 : 1);
        socialScore += Math.random() * 10 * (sectorFactor > 7 ? 1.2 : 0.8);
        govScore += Math.random() * 10 * (holding.name.includes('Ethical') ? 2 : 1);
        if (Math.random() < 0.1) controversies.push(`Environmental concern for ${holding.symbol}`);
        if (Math.random() < 0.05 && sectorFactor < 5) controversies.push(`Labor practices concern for ${holding.symbol}`);
    });
    envScore = Math.max(0, Math.min(100, envScore + marketData.sentimentScore * 20 + Math.random() * 5));
    socialScore = Math.max(0, Math.min(100, socialScore + (marketData.economicIndicators.find(e => e.name === 'consumerConfidenceIndex')?.value || 0) * 0.1 + Math.random() * 5));
    govScore = Math.max(0, Math.min(100, govScore + Math.random() * 10));
    const overall = (envScore * 0.35 + socialScore * 0.35 + govScore * 0.3);
    return {
        environment: parseFloat(envScore.toFixed(2)),
        social: parseFloat(socialScore.toFixed(2)),
        governance: parseFloat(govScore.toFixed(2)),
        overall: parseFloat(overall.toFixed(2)),
        controversies: Array.from(new Set(controversies)), 
    };
};
export const generateInvestmentRiskProfile = (
    investmentAccounts: InvestmentAccount[],
    cryptoWallets: CryptoWallet[],
    userPreferences: UserPreferences
): InvestmentRiskProfile => {
    let totalPortfolioValue = 0;
    const allHoldings: (InvestmentHolding | CryptoAsset)[] = [];
    investmentAccounts.forEach(account => {
        totalPortfolioValue += account.totalValue;
        account.holdings.forEach(h => allHoldings.push(h));
    });
    cryptoWallets.forEach(wallet => {
        totalPortfolioValue += wallet.totalValue;
        wallet.assets.forEach(a => allHoldings.push(a));
    });
    let volatilityScore = Math.floor(Math.random() * 40) + 30;
    if (userPreferences.riskTolerance === 'high') volatilityScore += 20;
    else if (userPreferences.riskTolerance === 'low') volatilityScore -= 15;
    volatilityScore = Math.min(100, Math.max(0, volatilityScore + Math.floor(Math.random() * 10 - 5)));
    const uniqueAssetClasses = new Set(allHoldings.map(h => 'assetClass' in h ? h.assetClass : 'crypto'));
    const diversificationIndex = allHoldings.length > 0 ? uniqueAssetClasses.size / allHoldings.length + Math.random() * 0.1 : 0;
    const correlationMatrix: { [key: string]: { [key: string]: number } } = {};
    const assetSymbols = Array.from(new Set(allHoldings.map(h => h.symbol)));
    assetSymbols.forEach(s1 => {
        correlationMatrix[s1] = {};
        assetSymbols.forEach(s2 => {
            if (s1 === s2) correlationMatrix[s1][s2] = 1.0;
            else correlationMatrix[s1][s2] = parseFloat((Math.random() * 1.6 - 0.8).toFixed(2));
        });
    });
    const betaWeightedPortfolio = parseFloat((Math.random() * 1.5 + 0.5).toFixed(2));
    const annualReturn = investmentAccounts.reduce((sum, acc) => sum + acc.totalValue, 0) * (0.05 + Math.random() * 0.05);
    const portfolioVolatility = annualReturn * (0.1 + Math.random() * 0.15);
    const riskAdjustedReturn = portfolioVolatility > 0 ? (annualReturn - DEFAULT_RISK_FREE_RATE) / portfolioVolatility : 0;
    const stressTestResults: ScenarioResult[] = [
        evaluateStressScenario(totalPortfolioValue * 0.8, 0, { assetDevaluation: 0.2, incomeReduction: 0.1, liabilityIncrease: 0.05 }, 'Recession Scenario'),
        evaluateStressScenario(totalPortfolioValue * 0.9, 0, { assetDevaluation: 0.1, incomeReduction: 0.05, liabilityIncrease: 0.02 }, 'Moderate Downturn'),
    ];
    return {
        volatilityScore,
        diversificationIndex: parseFloat(diversificationIndex.toFixed(2)),
        correlationMatrix,
        betaWeightedPortfolio,
        riskAdjustedReturn: parseFloat(riskAdjustedReturn.toFixed(4)),
        stressTestResults,
    };
};
export const projectFinancialGoalProgress = (
    goal: FinancialGoal,
    initialAmount: number,
    monthlyContributions: number,
    annualGrowthRate: number = DEFAULT_MARKET_GROWTH_EXPECTATION
): GoalProgressProjection => {
    let currentProjectionAmount = initialAmount + goal.currentAmount;
    let monthsElapsed = 0;
    const monthlyGrowthFactor = Math.pow(1 + annualGrowthRate, 1 / 12);
    const milestones: { date: string; targetAmount: number; }[] = [];
    let projectedCompletionDate = new Date();
    const effectiveMonthlyContributions = monthlyContributions || (goal.contributionsPerPeriod && goal.period === 'monthly' ? goal.contributionsPerPeriod : 0);
    const maxMonthsToProject = 120; 
    let achieved = false;
    while (currentProjectionAmount < goal.targetAmount && monthsElapsed < maxMonthsToProject) {
        currentProjectionAmount += effectiveMonthlyContributions;
        currentProjectionAmount *= monthlyGrowthFactor;
        monthsElapsed++;
        if (monthsElapsed % 12 === 0) { 
            const milestoneDate = new Date(projectedCompletionDate.getFullYear(), projectedCompletionDate.getMonth() + monthsElapsed, 1);
            milestones.push({ date: milestoneDate.toISOString().split('T')[0], targetAmount: parseFloat(currentProjectionAmount.toFixed(2)) });
        }
        if (currentProjectionAmount >= goal.targetAmount) {
            achieved = true;
            break;
        }
    }
    if (achieved) {
        projectedCompletionDate.setMonth(projectedCompletionDate.getMonth() + monthsElapsed);
    } else {
        projectedCompletionDate = new Date('9999-12-31'); 
    }
    const pathDeviationRisk = parseFloat((Math.random() * 0.3 * (goal.targetAmount / (currentProjectionAmount || 1))).toFixed(2));
    return {
        goalId: goal.id,
        monthlyContributionsRequired: parseFloat(effectiveMonthlyContributions.toFixed(2)),
        projectedCompletionDate: projectedCompletionDate.toISOString().split('T')[0],
        pathDeviationRisk,
        milestones,
    };
};
export const simulateEconomicForecast = (
    initialSnapshot: EconomicIndicatorSnapshot,
    durationMonths: number,
    randomnessFactor: number = 0.1
): EconomicIndicatorSnapshot[] => {
    const forecast: EconomicIndicatorSnapshot[] = [initialSnapshot];
    let currentSnapshot = { ...initialSnapshot };
    for (let i = 1; i <= durationMonths; i++) {
        const nextDate = new Date(new Date(currentSnapshot.date).setMonth(new Date(currentSnapshot.date).getMonth() + 1));
        const newGdpGrowth = currentSnapshot.gdpGrowthRate * (1 + (Math.random() - 0.5) * randomnessFactor);
        const newInflation = currentSnapshot.inflationRate * (1 + (Math.random() - 0.5) * randomnessFactor * 1.2);
        const newUnemployment = Math.max(0.01, currentSnapshot.unemploymentRate + (Math.random() - 0.5) * randomnessFactor * 0.5);
        const newConsumerConfidence = Math.max(30, Math.min(100, currentSnapshot.consumerConfidenceIndex + (Math.random() - 0.5) * randomnessFactor * 20));
        const newCentralBankRate = Math.max(0.005, currentSnapshot.centralBankRate + (Math.random() - 0.5) * randomnessFactor * 0.01);
        const newHousingStarts = Math.max(100000, currentSnapshot.housingStarts * (1 + (Math.random() - 0.5) * randomnessFactor * 0.8));
        const newManufacturingPMI = Math.max(40, Math.min(60, currentSnapshot.manufacturingPMI + (Math.random() - 0.5) * randomnessFactor * 5));
        currentSnapshot = {
            date: nextDate.toISOString().split('T')[0],
            gdpGrowthRate: parseFloat(newGdpGrowth.toFixed(4)),
            inflationRate: parseFloat(newInflation.toFixed(4)),
            unemploymentRate: parseFloat(newUnemployment.toFixed(4)),
            consumerConfidenceIndex: parseFloat(newConsumerConfidence.toFixed(2)),
            centralBankRate: parseFloat(newCentralBankRate.toFixed(4)),
            housingStarts: Math.floor(newHousingStarts),
            manufacturingPMI: parseFloat(newManufacturingPMI.toFixed(2)),
        };
        forecast.push(currentSnapshot);
    }
    return forecast;
};
export const analyzeSpendingPatterns = (
    transactions: Transaction[],
    windowDays: number = 90
): SpendingPatternAnalysis => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - windowDays * 24 * 60 * 60 * 1000);
    const relevantTransactions = transactions.filter(tx => 
        tx.type === 'expense' && new Date(tx.date) >= startDate && new Date(tx.date) <= endDate
    );
    const spendingByMonthMap = relevantTransactions.reduce((acc, tx) => {
        const txDate = new Date(tx.date);
        const monthKey = `${txDate.getFullYear()}-${(txDate.getMonth() + 1).toString().padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + tx.amount;
        return acc;
    }, {} as Record<string, number>);
    const spendingByMonth = Object.entries(spendingByMonthMap)
        .map(([month, total]) => ({ month, total: parseFloat(total.toFixed(2)) }))
        .sort((a, b) => a.month.localeCompare(b.month));
    const anomalyAlerts: string[] = [];
    if (relevantTransactions.length > 0) {
        const averageDailyExpense = relevantTransactions.reduce((sum, tx) => sum + tx.amount, 0) / windowDays;
        relevantTransactions.forEach(tx => {
            if (tx.amount > averageDailyExpense * ANOMALY_DETECTION_MULTIPLIER && Math.random() < 0.3) {
                anomalyAlerts.push(`Potential anomaly: Large expense of ${tx.amount.toFixed(2)} in '${tx.category}' on ${tx.date}.`);
            }
        });
    }
    const categorySpendingMap: Record<string, number[]> = {};
    relevantTransactions.forEach(tx => {
        categorySpendingMap[tx.category] = categorySpendingMap[tx.category] || [];
        categorySpendingMap[tx.category].push(tx.amount);
    });
    const categoryDistribution: { category: string; amount: number; percent: number; }[] = [];
    const totalSpending = relevantTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    for (const category in categorySpendingMap) {
        const amount = categorySpendingMap[category].reduce((sum, val) => sum + val, 0);
        categoryDistribution.push({ category, amount: parseFloat(amount.toFixed(2)), percent: totalSpending > 0 ? parseFloat(((amount / totalSpending) * 100).toFixed(2)) : 0 });
        const amounts = categorySpendingMap[category];
        if (amounts.length > 2) {
            const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
            const stdDev = Math.sqrt(variance);
            const outliers = amounts.filter(amount => amount > mean + 2 * stdDev);
            if (outliers.length > 0 && Math.random() < 0.2) {
                anomalyAlerts.push(`Unusual spending spike detected in category '${category}'.`);
            }
        }
    }
    return { spendingByMonth, anomalyAlerts: Array.from(new Set(anomalyAlerts)), categoryDistribution };
};
export const generateTaxOptimizationReport = (
    income: number,
    current401kContributions: number,
    currentIraContributions: number,
    maritalStatus: 'single' | 'married_filing_jointly' | 'head_of_household',
    age: number,
    investmentHoldings: InvestmentHolding[]
): TaxEfficiencyReport => {
    let taxableIncome = income;
    let totalTaxPaid = 0;
    const recommendations: string[] = [];
    const potentialSavings = {
        iraContributions: 0,
        _401kContributions: 0,
        taxLossHarvesting: 0,
        otherDeductions: 0,
    };
    const taxBrackets = {
        single: [
            { limit: 10000, rate: 0.10 }, { limit: 40000, rate: 0.12 }, 
            { limit: 90000, rate: 0.22 }, { limit: Infinity, rate: 0.24 },
        ],
        married_filing_jointly: [
            { limit: 20000, rate: 0.10 }, { limit: 80000, rate: 0.12 }, 
            { limit: 180000, rate: 0.22 }, { limit: Infinity, rate: 0.24 },
        ],
        head_of_household: [
            { limit: 14000, rate: 0.10 }, { limit: 50000, rate: 0.12 }, 
            { limit: 100000, rate: 0.22 }, { limit: Infinity, rate: 0.24 },
        ],
    };
    const applicableBrackets = taxBrackets[maritalStatus];
    let remainingTaxable = taxableIncome;
    let baseTax = 0;
    for (let i = 0; i < applicableBrackets.length; i++) {
        const bracket = applicableBrackets[i];
        const previousLimit = i === 0 ? 0 : applicableBrackets[i - 1].limit;
        const taxableInBracket = Math.min(remainingTaxable, bracket.limit - previousLimit);
        baseTax += taxableInBracket * bracket.rate;
        remainingTaxable -= taxableInBracket;
        if (remainingTaxable <= 0) break;
    }
    totalTaxPaid = baseTax;
    const max401k = (age >= 50 ? 27000 : 20500) * TAX_BRACKET_INCREMENT_FACTOR;
    const remaining401kRoom = Math.max(0, max401k - current401kContributions);
    if (remaining401kRoom > 0) {
        potentialSavings._401kContributions = remaining401kRoom * (applicableBrackets.find(b => taxableIncome > b.limit)?.rate || applicableBrackets[0].rate);
        recommendations.push(`Maximize 401(k) contributions by ${remaining401kRoom.toFixed(2)} to save ~${potentialSavings._401kContributions.toFixed(2)} in taxes.`);
    }
    const maxIra = (age >= 50 ? 7000 : 6000) * TAX_BRACKET_INCREMENT_FACTOR;
    const remainingIraRoom = Math.max(0, maxIra - currentIraContributions);
    if (remainingIraRoom > 0) {
        potentialSavings.iraContributions = remainingIraRoom * (applicableBrackets.find(b => taxableIncome > b.limit)?.rate || applicableBrackets[0].rate) * (Math.random() < 0.7 ? 1 : 0.5);
        if (potentialSavings.iraContributions > 0) {
            recommendations.push(`Contribute an additional ${remainingIraRoom.toFixed(2)} to your IRA for ~${potentialSavings.iraContributions.toFixed(2)} tax savings.`);
        } else {
            recommendations.push(`Consider a Roth IRA if not eligible for deductible contributions.`);
        }
    }
    const realizedLosses = investmentHoldings.reduce((sum, holding) => {
        const potentialLoss = holding.averageCost * holding.quantity - holding.currentPrice * holding.quantity;
        return sum + Math.min(0, potentialLoss);
    }, 0);
    if (realizedLosses < 0 && Math.random() < 0.6) {
        potentialSavings.taxLossHarvesting = Math.min(3000, Math.abs(realizedLosses));
        recommendations.push(`Consider tax-loss harvesting up to ${potentialSavings.taxLossHarvesting.toFixed(2)}.`);
    }
    potentialSavings.otherDeductions = Math.random() * 500 + 100;
    if (Math.random() < 0.4) {
        recommendations.push(`Review eligibility for other deductions (e.g., student loan interest).`);
    }
    const effectiveTaxRate = income > 0 ? totalTaxPaid / income : 0;
    return {
        taxableIncome: parseFloat(taxableIncome.toFixed(2)),
        totalTaxPaid: parseFloat(totalTaxPaid.toFixed(2)),
        effectiveTaxRate: parseFloat(effectiveTaxRate.toFixed(4)),
        potentialSavings,
        recommendations: Array.from(new Set(recommendations)),
    };
};
export const createFinancialMLModelConfig = (
    modelName: string,
    dataType: 'transactions' | 'assets' | 'market_data' | 'user_behavior',
    complexity: number = 5
): MachineLearningModelConfig => {
    const algorithms: MachineLearningModelConfig['algorithm'][] = [
        'linear_regression', 'random_forest', 'neural_network', 'arima'
    ];
    const featuresMap = {
        transactions: ['amount', 'category', 'date', 'type'],
        assets: ['value', 'type', 'growthRateAnnual', 'acquisitionDate'],
        market_data: ['sentimentScore', 'gdpGrowthRate', 'inflationRate', 'unemploymentRate'],
        user_behavior: ['loginFrequency', 'featureUsageCount', 'notificationResponseRate']
    };
    const selectedAlgorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
    const trainingDataSize = Math.floor(10000 + Math.random() * 90000 * (complexity / 10));
    const featuresUsed = featuresMap[dataType].filter(() => Math.random() < 0.5 + complexity / 20);
    let performanceMetrics: MachineLearningModelConfig['performanceMetrics'] = {};
    if (selectedAlgorithm === 'neural_network' || selectedAlgorithm === 'random_forest') {
        performanceMetrics.accuracy = parseFloat((0.7 + Math.random() * 0.25).toFixed(4));
        performanceMetrics.rmse = parseFloat((Math.random() * 0.5).toFixed(4));
    } else {
        performanceMetrics.rSquared = parseFloat((0.4 + Math.random() * 0.5).toFixed(4));
        performanceMetrics.mae = parseFloat((Math.random() * 100 + 50).toFixed(2));
    }
    const lastTrained = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    return {
        modelId: `${modelName}_${Math.random().toString(36).substring(7)}`,
        algorithm: selectedAlgorithm,
        trainingDataSize,
        featuresUsed,
        performanceMetrics,
        lastTrained,
    };
};
export const calculateComprehensiveRiskScore = (
    netWorth: number,
    debtToIncomeRatio: number,
    emergencyFundMonths: number,
    investmentVolatility: number,
    marketSentiment: number,
    userRiskTolerance: 'low' | 'medium' | 'high'
): number => {
    let score = 50; 
    if (netWorth < 0) score += 20;
    else if (netWorth < 50000 && Math.random() < 0.5) score += 10;
    else score -= 5;
    if (debtToIncomeRatio > MAX_DEBT_TO_INCOME_RATIO) score += 25;
    else if (debtToIncomeRatio > 0.25) score += 10;
    else score -= 5;
    if (emergencyFundMonths < EMERGENCY_FUND_TARGET_MONTHS / 2) score += 20;
    else if (emergencyFundMonths < EMERGENCY_FUND_TARGET_MONTHS) score += 10;
    else score -= 5;
    score += investmentVolatility * 0.3;
    score -= marketSentiment * 10;
    if (userRiskTolerance === 'low') score -= 15;
    else if (userRiskTolerance === 'high') score += 15;
    score += Math.random() * 10 - 5;
    return Math.min(100, Math.max(0, parseFloat(score.toFixed(2))));
};
export const predictGoalAchievementProbability = (
    goal: FinancialGoal,
    currentMonthlySavings: number,
    inflationRate: number = DEFAULT_ANNUAL_INFLATION_RATE
): number => {
    if (goal.targetAmount <= goal.currentAmount) return 100;
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const monthsRemainingTillDue = (new Date(goal.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30.44);
    if (monthsRemainingTillDue <= 0) return 0;
    const effectiveMonthlyContribution = (goal.contributionsPerPeriod && goal.period === 'monthly') 
                                        ? goal.contributionsPerPeriod : currentMonthlySavings;
    const inflatedRemainingAmount = remainingAmount * Math.pow(1 + inflationRate / 12, monthsRemainingTillDue);
    const requiredMonthlyContribution = inflatedRemainingAmount / monthsRemainingTillDue;
    let probability = 0;
    if (effectiveMonthlyContribution >= requiredMonthlyContribution * 1.2) {
        probability = 95 + Math.random() * 5;
    } else if (effectiveMonthlyContribution >= requiredMonthlyContribution) {
        probability = 70 + Math.random() * 20;
    } else if (effectiveMonthlyContribution >= requiredMonthlyContribution * 0.7) {
        probability = 40 + Math.random() * 20;
    } else {
        probability = 10 + Math.random() * 20;
    }
    if (goal.priority === 'high') probability = Math.min(100, probability * 1.1);
    else if (goal.priority === 'low') probability = Math.max(0, probability * 0.9);
    if (goal.type === 'emergency_fund' && effectiveMonthlyContribution > 0) probability = Math.min(100, probability + 10);
    if (goal.type === 'debt_reduction' && effectiveMonthlyContribution < requiredMonthlyContribution) probability = Math.max(0, probability - 15);
    return Math.min(100, Math.max(0, parseFloat(probability.toFixed(2))));
};
export const simulatePortfolioRebalance = (
    investmentAccounts: InvestmentAccount[],
    targetAllocations: { [assetClass: string]: number },
    rebalanceFrequencyMonths: number = 6
): PortfolioRebalanceRecommendation[] => {
    const totalPortfolioValue = investmentAccounts.reduce((sum, acc) => sum + acc.totalValue, 0);
    const currentAllocations: { [assetClass: string]: number } = {};
    const allHoldings: { holding: InvestmentHolding; accountId: string }[] = [];
    investmentAccounts.forEach(account => {
        account.holdings.forEach(h => {
            const assetClass = h.assetClass || 'unknown';
            currentAllocations[assetClass] = (currentAllocations[assetClass] || 0) + h.marketValue;
            allHoldings.push({ holding: h, accountId: account.id });
        });
    });
    for (const key in currentAllocations) {
        currentAllocations[key] /= totalPortfolioValue;
    }
    const recommendedTrades: PortfolioRebalanceRecommendation[] = [];
    for (const assetClass in targetAllocations) {
        const currentPercentage = currentAllocations[assetClass] || 0;
        const targetPercentage = targetAllocations[assetClass];
        if (Math.abs(currentPercentage - targetPercentage) > REBALANCING_THRESHOLD_PERCENT) {
            const targetValue = totalPortfolioValue * targetPercentage;
            const currentValue = (currentAllocations[assetClass] || 0) * totalPortfolioValue;
            const difference = targetValue - currentValue;
            if (difference > 0) { 
                const holdingsInClass = allHoldings.filter(h => ('assetClass' in h.holding && h.holding.assetClass === assetClass));
                if (holdingsInClass.length > 0 && Math.random() < 0.7) {
                    const holdingToBuy = holdingsInClass[Math.floor(Math.random() * holdingsInClass.length)].holding;
                    const quantityToBuy = Math.floor(difference / holdingToBuy.currentPrice / 2);
                    if (quantityToBuy > 0) {
                        recommendedTrades.push({
                            symbol: holdingToBuy.symbol, action: 'buy', quantity: quantityToBuy,
                            reason: `Underweight in ${assetClass} by ${(difference / totalPortfolioValue * 100).toFixed(1)}%`,
                            targetWeight: targetPercentage, currentWeight: currentPercentage
                        });
                    }
                } else if (Math.random() < 0.5) {
                     recommendedTrades.push({
                        symbol: `NEW_${assetClass.toUpperCase()}_ETF`, action: 'buy', quantity: Math.floor(difference / 1000),
                        reason: `Underweight in ${assetClass}, consider new exposure`,
                        targetWeight: targetPercentage, currentWeight: currentPercentage
                    });
                }
            } else { 
                const holdingsInClass = allHoldings.filter(h => ('assetClass' in h.holding && h.holding.assetClass === assetClass));
                if (holdingsInClass.length > 0 && Math.random() < 0.7) {
                    const holdingToSell = holdingsInClass[Math.floor(Math.random() * holdingsInClass.length)].holding;
                    const quantityToSell = Math.floor(Math.abs(difference) / holdingToSell.currentPrice / 2);
                    if (quantityToSell > 0 && quantityToSell <= holdingToSell.quantity) {
                        recommendedTrades.push({
                            symbol: holdingToSell.symbol, action: 'sell', quantity: quantityToSell,
                            reason: `Overweight in ${assetClass} by ${(Math.abs(difference) / totalPortfolioValue * 100).toFixed(1)}%`,
                            targetWeight: targetPercentage, currentWeight: currentPercentage
                        });
                    }
                } else if (Math.random() < 0.3) {
                     recommendedTrades.push({
                        symbol: `OVERWEIGHT_${assetClass.toUpperCase()}_FUND`, action: 'sell', quantity: Math.floor(Math.abs(difference) / 1000),
                        reason: `Liquidate excess in ${assetClass}`,
                        targetWeight: targetPercentage, currentWeight: currentPercentage
                    });
                }
            }
        }
    }
    if (recommendedTrades.length === 0 && Math.random() < 0.2) {
        recommendedTrades.push({
            symbol: 'MARKET_ETF', action: 'buy', quantity: Math.floor(totalPortfolioValue * 0.01 / 100),
            reason: 'Minor rebalancing to maintain target drift',
            targetWeight: undefined, currentWeight: undefined
        });
    }
    return recommendedTrades;
};
export const projectRetirementAdequacy = (
    currentAge: number,
    retirementAge: number,
    currentSavings: number,
    annualContributions: number,
    desiredAnnualIncomeAtRetirement: number,
    annualInflationRate: number = DEFAULT_ANNUAL_INFLATION_RATE,
    annualInvestmentGrowthRate: number = DEFAULT_MARKET_GROWTH_EXPECTATION
): RetirementProjection => {
    const yearsToRetirement = retirementAge - currentAge;
    if (yearsToRetirement <= 0) {
        return {
            projectedSavingsAtRetirement: currentSavings,
            incomeNeededAdjustedForInflation: desiredAnnualIncomeAtRetirement,
            canSustainForYears: Infinity,
            retirementGap: 0,
            recommendations: ["You are at or past retirement age. Focus on withdrawal strategies."],
        };
    }
    let futureSavings = currentSavings * Math.pow(1 + annualInvestmentGrowthRate, yearsToRetirement);
    const monthlyContribution = annualContributions / 12;
    const monthlyGrowthRate = Math.pow(1 + annualInvestmentGrowthRate, 1/12) - 1;
    const totalMonths = yearsToRetirement * 12;
    const futureContributions = calculateAnnuityFutureValue(monthlyContribution, monthlyGrowthRate, totalMonths);
    const projectedSavingsAtRetirement = futureSavings + futureContributions;
    const incomeNeededAdjustedForInflation = desiredAnnualIncomeAtRetirement * Math.pow(1 + annualInflationRate, yearsToRetirement);
    const estimatedAnnualIncomeFromSavings = projectedSavingsAtRetirement * RETIREMENT_WITHDRAWAL_RATE;
    let canSustainForYears: number;
    let retirementGap: number;
    const recommendations: string[] = [];
    if (estimatedAnnualIncomeFromSavings >= incomeNeededAdjustedForInflation) {
        canSustainForYears = Infinity;
        retirementGap = 0;
        recommendations.push("You are on track for a comfortable retirement! Consider early retirement.");
    } else {
        const annualShortfall = incomeNeededAdjustedForInflation - estimatedAnnualIncomeFromSavings;
        if (projectedSavingsAtRetirement > 0 && RETIREMENT_WITHDRAWAL_RATE > 0) {
             canSustainForYears = projectedSavingsAtRetirement / (incomeNeededAdjustedForInflation - (RETIREMENT_WITHDRAWAL_RATE * projectedSavingsAtRetirement)) * 
                                  (1 + Math.random() * 0.2);
             if (canSustainForYears <= 0 || !isFinite(canSustainForYears)) canSustainForYears = 1;
        } else {
            canSustainForYears = 0;
        }
        retirementGap = incomeNeededAdjustedForInflation - estimatedAnnualIncomeFromSavings;
        recommendations.push(`Your projected savings may not fully cover desired retirement income. Shortfall: ${retirementGap.toFixed(2)}.`);
        recommendations.push(`Consider increasing annual contributions by ~${(annualShortfall / annualInvestmentGrowthRate).toFixed(2)} or delaying retirement.`);
    }
    if (Math.random() < 0.3) recommendations.push("Review your asset allocation to align with your retirement timeline.");
    if (Math.random() < 0.2) recommendations.push("Explore options for additional passive income streams.");
    if (annualContributions < 0.1 * desiredAnnualIncomeAtRetirement && Math.random() < 0.4) recommendations.push("Your current contribution rate is low. Aim for at least 15% of your income.");
    return {
        projectedSavingsAtRetirement: parseFloat(projectedSavingsAtRetirement.toFixed(2)),
        incomeNeededAdjustedForInflation: parseFloat(incomeNeededAdjustedForInflation.toFixed(2)),
        canSustainForYears: parseFloat(canSustainForYears.toFixed(2)),
        retirementGap: parseFloat(retirementGap.toFixed(2)),
        recommendations: Array.from(new Set(recommendations)),
    };
};
export const projectDetailedCashFlow = (
    initialCashBalance: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    irregularTransactions: { date: string; amount: number; description: string; type: 'income' | 'expense' }[],
    projectionMonths: number = 12
): CashFlowProjectionMonthly[] => {
    const projections: CashFlowProjectionMonthly[] = [];
    let currentBalance = initialCashBalance;
    const today = new Date();
    for (let i = 0; i < projectionMonths; i++) {
        const projectionDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthKey = `${projectionDate.getFullYear()}-${(projectionDate.getMonth() + 1).toString().padStart(2, '0')}`;
        let monthIncome = monthlyIncome;
        let monthExpenses = monthlyExpenses;
        let irregularNet = 0;
        const currentMonthIrregulars = irregularTransactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === projectionDate.getFullYear() && txDate.getMonth() === projectionDate.getMonth();
        });
        currentMonthIrregulars.forEach(tx => {
            if (tx.type === 'income') {
                irregularNet += tx.amount;
            } else {
                irregularNet -= tx.amount;
            }
        });
        const endingBalance = currentBalance + monthIncome - monthExpenses + irregularNet;
        projections.push({
            month: monthKey,
            startingBalance: parseFloat(currentBalance.toFixed(2)),
            income: parseFloat(monthIncome.toFixed(2)),
            expenses: parseFloat(monthExpenses.toFixed(2)),
            irregularNet: parseFloat(irregularNet.toFixed(2)),
            endingBalance: parseFloat(endingBalance.toFixed(2)),
        });
        currentBalance = endingBalance;
    }
    return projections;
};
export const generateFictionalCreditScore = (
    financialHealthScore: number,
    debtToAssetRatio: number,
    onTimePaymentRate: number,
    yearsOfCreditHistory: number
): number => {
    let score = 500; 
    score += financialHealthScore * 2;
    score -= debtToAssetRatio * 200;
    score += onTimePaymentRate * 150;
    score += yearsOfCreditHistory * 5;
    score += Math.random() * 50 - 25;
    return Math.min(MAX_CREDIT_SCORE, Math.max(MIN_CREDIT_SCORE, Math.floor(score)));
};
export const predictNextMarketEvent = (
    marketData: MarketData,
    economicIndicators: EconomicIndicatorSnapshot[]
): string => {
    const sentiment = marketData.sentimentScore;
    const lastGDP = economicIndicators[economicIndicators.length - 1]?.gdpGrowthRate || 0;
    const lastInflation = economicIndicators[economicIndicators.length - 1]?.inflationRate || 0;
    const topLosersCount = marketData.topLosers.length;
    let prediction = "No significant event predicted.";
    if (sentiment < -0.7 && lastGDP < 0.01 && topLosersCount > 5) {
        prediction = "High probability of market correction or recessionary pressures developing.";
        if (lastInflation > 0.05) {
            prediction += " Stagflation risk increasing.";
        }
    } else if (sentiment > 0.6 && lastGDP > 0.03 && topLosersCount < 2) {
        prediction = "Market rally likely to continue, potential for asset bubble formation.";
        if (lastInflation > 0.03) {
            prediction += " Inflationary concerns may prompt central bank action.";
        }
    } else if (lastInflation > 0.04 && sentiment < 0) {
        prediction = "Inflation concerns are prominent, watch for interest rate hikes.";
    } else if (economicIndicators.length > 2 && economicIndicators[economicIndicators.length - 1].unemploymentRate > economicIndicators[economicIndicators.length - 2].unemploymentRate * 1.1) {
        prediction = "Rising unemployment rate indicates potential economic slowdown.";
    } else if (marketData.topGainers.length > 7 && Math.random() < 0.3) {
        prediction = "Sector-specific boom detected. Watch for rotation.";
    } else if (Math.random() < 0.1) {
        prediction = "Unpredictable geopolitical event risk is elevated.";
    }
    return prediction;
};
export const calculateInvestmentSuitabilityScore = (
    riskProfile: InvestmentRiskProfile,
    goalsProgress: GoalProgressProjection[],
    marketSentiment: number
): number => {
    let suitabilityScore = 50;
    suitabilityScore -= riskProfile.volatilityScore * 0.2; 
    suitabilityScore += riskProfile.diversificationIndex * 30; 
    const achievedGoals = goalsProgress.filter(g => new Date(g.projectedCompletionDate) <= new Date() || g.pathDeviationRisk < 0.05).length;
    const totalGoals = goalsProgress.length;
    if (totalGoals > 0) {
        suitabilityScore += (achievedGoals / totalGoals) * 20;
    }
    suitabilityScore += marketSentiment * 15;
    suitabilityScore += Math.random() * 10 - 5;
    return Math.min(100, Math.max(0, parseFloat(suitabilityScore.toFixed(2))));
};
export const generateSmartAdvisorInsight = (
    userPreferences: UserPreferences,
    financialHealth: { score: number; insights: string[] },
    liquidityAnalysis: LiquidityAnalysis,
    esgScore: ESGScore | null,
    portfolioPerformance: { totalValue: number; gainLoss: number; percentageGainLoss: number; }
): string => {
    const insights: string[] = [];
    insights.push(`Hello ${userPreferences.theme === 'dark' ? 'Night Owl' : 'Day Seeker'}! Here's your personalized financial snapshot.`);
    if (financialHealth.score > 70) {
        insights.push(`Your financial health is strong with a score of ${financialHealth.score}/100. Keep up the excellent work!`);
    } else if (financialHealth.score > 50) {
        insights.push(`Your financial health score is ${financialHealth.score}/100. Focus on areas like: ${financialHealth.insights[0] || 'debt reduction'}.`);
    } else {
        insights.push(`Your financial health score is ${financialHealth.score}/100, indicating areas for improvement. Prioritize: ${financialHealth.insights[0] || 'building emergency fund'}.`);
    }
    if (liquidityAnalysis.liquidityScore > 75) {
        insights.push(`Your liquidity position is excellent. You have a current ratio of ${liquidityAnalysis.currentRatio} and healthy free cash flow.`);
    } else {
        insights.push(`Be mindful of your liquidity. Your quick ratio is ${liquidityAnalysis.quickRatio}. Consider improving your cash reserves.`);
    }
    if (portfolioPerformance.totalValue > 0) {
        insights.push(`Your portfolio saw a ${portfolioPerformance.percentageGainLoss >= 0 ? 'gain' : 'loss'} of ${portfolioPerformance.percentageGainLoss.toFixed(2)}% (${portfolioPerformance.gainLoss >= 0 ? '+' : '-'}${Math.abs(portfolioPerformance.gainLoss).toFixed(2)}). `);
        if (portfolioPerformance.percentageGainLoss > 10 && userPreferences.riskTolerance === 'low' && Math.random() < 0.5) {
            insights.push(`Consider rebalancing to lock in gains if your risk tolerance is low.`);
        } else if (portfolioPerformance.percentageGainLoss < -5 && userPreferences.riskTolerance === 'high' && Math.random() < 0.4) {
            insights.push(`This might be an opportunity to buy the dip, aligned with your higher risk tolerance.`);
        }
    }
    if (esgScore && esgScore.overall > 70) {
        insights.push(`Your investments demonstrate strong ESG performance, score: ${esgScore.overall.toFixed(2)}.`);
    } else if (esgScore && esgScore.controversies.length > 0) {
        insights.push(`Warning: Some investments have ESG controversies: ${esgScore.controversies[0]}. Review their sustainability profile.`);
    }
    const randomSuggestion = Math.floor(Math.random() * 5);
    switch (randomSuggestion) {
        case 0: insights.push("Have you considered setting up automated monthly transfers to your investment account?"); break;
        case 1: insights.push("Explore ways to reduce recurring subscription expenses for additional savings."); break;
        case 2: insights.push("It might be a good time to review your beneficiary designations across all accounts."); break;
        case 3: insights.push("Evaluate your insurance coverage to ensure you're adequately protected."); break;
        case 4: insights.push("Think about diversifying your income streams for greater financial resilience."); break;
    }
    insights.push(`Remember, consistent effort and smart decisions are key to achieving your financial independence. We're here to help!`);
    return insights.join('\n');
};
export const conductComprehensiveFinancialCheckup = (
    transactions: Transaction[],
    assets: Asset[],
    liabilities: Liability[],
    goals: FinancialGoal[],
    investmentAccounts: InvestmentAccount[],
    cryptoWallets: CryptoWallet[],
    marketData: MarketData,
    userPreferences: UserPreferences
) => {
    const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(assets, investmentAccounts, cryptoWallets, liabilities);
    const currentBalance = assets.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.value, 0);
    const { burnRate: monthlyBurnRate, runwayDays } = calculateBurnRateAndRunway(transactions, currentBalance);
    const past12MonthsTransactions = transactions.filter(tx => new Date(tx.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
    const totalIncomePastYear = past12MonthsTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpensesPastYear = past12MonthsTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const monthlyIncomeAvg = totalIncomePastYear / 12;
    const monthlyExpensesAvg = totalExpensesPastYear / 12;
    const debtToAssetRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;
    const emergencyFund = assets.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.value, 0);
    const emergencyFundCoverageMonths = monthlyExpensesAvg > 0 ? emergencyFund / monthlyExpensesAvg : Infinity;
    const totalInvestmentValue = investmentAccounts.reduce((sum, acc) => sum + acc.totalValue, 0);
    const totalCryptoValue = cryptoWallets.reduce((sum, wallet) => sum + wallet.totalValue, 0);
    const investmentRatio = totalAssets > 0 ? (totalInvestmentValue + totalCryptoValue) / totalAssets : 0;
    const financialHealth = getFinancialHealthScore(netWorth, monthlyIncomeAvg, monthlyExpensesAvg, debtToAssetRatio, emergencyFundCoverageMonths, investmentRatio);
    const liquidityAnalysis = assessLiquidityPosition(assets, liabilities, monthlyExpensesAvg);
    const allInvestmentHoldings: InvestmentHolding[] = investmentAccounts.flatMap(acc => acc.holdings);
    const esgScore = calculateESGScores(allInvestmentHoldings, marketData);
    const riskProfile = generateInvestmentRiskProfile(investmentAccounts, cryptoWallets, userPreferences);
    const goalProjections = goals.map(goal => projectFinancialGoalProgress(goal, goal.currentAmount, (goal.contributionsPerPeriod && goal.period === 'monthly' ? goal.contributionsPerPeriod : monthlyIncomeAvg * 0.1), (goal.type === 'investment' ? DEFAULT_MARKET_GROWTH_EXPECTATION : 0.02)));
    const taxReport = generateTaxOptimizationReport(
        monthlyIncomeAvg * 12,
        investmentAccounts.reduce((sum, acc) => sum + acc.holdings.filter(h => h.name.includes('401k')).reduce((hSum, h) => hSum + h.quantity * h.averageCost, 0), 0),
        investmentAccounts.reduce((sum, acc) => sum + acc.holdings.filter(h => h.name.includes('IRA')).reduce((hSum, h) => hSum + h.quantity * h.averageCost, 0), 0),
        Math.random() > 0.5 ? 'single' : 'married_filing_jointly',
        Math.floor(Math.random() * 40) + 25,
        allInvestmentHoldings
    );
    const cashFlowProjections = projectDetailedCashFlow(
        currentBalance, monthlyIncomeAvg, monthlyExpensesAvg, 
        transactions.filter(tx => ['income', 'expense'].includes(tx.type)).map(tx => ({
            date: tx.date, amount: tx.amount, description: tx.description || '', type: tx.type === 'income' ? 'income' : 'expense'
        })),
        24
    );
    const portfolioPerformance = {
        totalValue: totalInvestmentValue + totalCryptoValue,
        gainLoss: (totalInvestmentValue + totalCryptoValue) - allInvestmentHoldings.reduce((sum, h) => sum + (h.quantity * h.averageCost), 0) - cryptoWallets.reduce((sum, w) => sum + w.assets.reduce((cSum, c) => cSum + c.quantity * c.averageCost, 0), 0),
        percentageGainLoss: (totalInvestmentValue + totalCryptoValue) > 0 ? ((totalInvestmentValue + totalCryptoValue) - allInvestmentHoldings.reduce((sum, h) => sum + (h.quantity * h.averageCost), 0) - cryptoWallets.reduce((sum, w) => sum + w.assets.reduce((cSum, c) => cSum + c.quantity * c.averageCost, 0), 0)) / (allInvestmentHoldings.reduce((sum, h) => sum + (h.quantity * h.averageCost), 0) + cryptoWallets.reduce((sum, w) => sum + w.assets.reduce((cSum, c) => cSum + c.quantity * c.averageCost, 0), 0)) * 100 : 0
    };
    const smartInsight = generateSmartAdvisorInsight(userPreferences, financialHealth, liquidityAnalysis, esgScore, portfolioPerformance);
    const currentEconomicSnapshot: EconomicIndicatorSnapshot = {
        date: new Date().toISOString().split('T')[0],
        gdpGrowthRate: marketData.economicIndicators.find(e => e.name === 'GDP')?.value || 0.02,
        inflationRate: marketData.economicIndicators.find(e => e.name === 'Inflation')?.value || 0.03,
        unemploymentRate: marketData.economicIndicators.find(e => e.name === 'Unemployment')?.value || 0.04,
        consumerConfidenceIndex: marketData.economicIndicators.find(e => e.name === 'Consumer Confidence')?.value || 70,
        centralBankRate: marketData.economicIndicators.find(e => e.name === 'Interest Rate')?.value || 0.01,
        housingStarts: marketData.economicIndicators.find(e => e.name === 'Housing Starts')?.value || 1400000,
        manufacturingPMI: marketData.economicIndicators.find(e => e.name === 'PMI')?.value || 52,
    };
    const nextMarketEventPrediction = predictNextMarketEvent(marketData, [currentEconomicSnapshot]);
    return {
        netWorth, totalAssets, totalLiabilities, monthlyBurnRate, runwayDays, monthlyIncomeAvg, monthlyExpensesAvg,
        financialHealth, liquidityAnalysis, esgScore, riskProfile, goalProjections, taxReport, cashFlowProjections,
        smartInsight, nextMarketEventPrediction,
        creditScore: generateFictionalCreditScore(financialHealth.score, debtToAssetRatio, 0.95, 10 + Math.floor(Math.random() * 15)),
        rebalanceRecommendations: simulatePortfolioRebalance(investmentAccounts, { 'equity': 0.6, 'fixed_income': 0.3, 'crypto': 0.1 }),
        retirementAdequacy: projectRetirementAdequacy(
            Math.floor(Math.random() * 40) + 25, 65, totalInvestmentValue, monthlyIncomeAvg * 0.15 * 12, monthlyExpensesAvg * 1.2 * 12,
            DEFAULT_ANNUAL_INFLATION_RATE, DEFAULT_MARKET_GROWTH_EXPECTATION
        ),
        spendingAnalysis: analyzeSpendingPatterns(transactions, 180)
    };
};