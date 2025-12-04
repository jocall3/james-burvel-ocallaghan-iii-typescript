import {
    Transaction,
    Asset,
    Liability,
    FinancialGoal,
    UserProfile,
    ScenarioParameters,
    TimelinePoint,
    FinancialDataProcessor, // Import the processor to leverage its projection capabilities
    MarketDataService, // For market data insights
} from '../components/WealthTimeline'; // Adjust path as necessary based on file location

/**
 * Provides advanced algorithms to analyze financial data and suggest optimal strategies
 * for debt repayment, asset allocation, and goal achievement, aiming to maximize long-term wealth.
 */
export class FinancialOptimizer {
    private transactions: Transaction[];
    private assets: Asset[];
    private liabilities: Liability[];
    private goals: FinancialGoal[];
    private userProfile: UserProfile;
    private financialProcessor: FinancialDataProcessor;

    constructor(
        transactions: Transaction[],
        assets: Asset[],
        liabilities: Liability[],
        goals: FinancialGoal[],
        userProfile: UserProfile
    ) {
        this.transactions = transactions;
        this.assets = assets;
        this.liabilities = liabilities;
        this.goals = goals;
        this.userProfile = userProfile;
        this.financialProcessor = new FinancialDataProcessor(transactions, assets, liabilities, goals, userProfile);
    }

    /**
     * Helper to get base annual growth rates if not specified on asset.
     */
    private getBaseAssetAnnualGrowthRate(assetType: Asset['type']): number {
        switch (assetType) {
            case 'cash': return 0.005;
            case 'stocks': return 0.08;
            case 'real_estate': return 0.05;
            case 'crypto': return 0.15;
            case 'bond': return 0.03;
            case 'precious_metals': return 0.04;
            case 'collectibles': return 0.03;
            case 'business_equity': return 0.10;
            default: return 0.04; // 'other' or unknown
        }
    }

    /**
     * Helper to get base asset volatility.
     */
    private getBaseAssetVolatility(assetType: Asset['type']): number {
        switch (assetType) {
            case 'cash': return 0.001;
            case 'stocks': return 0.15;
            case 'real_estate': return 0.10;
            case 'crypto': return 0.30;
            case 'bond': return 0.05;
            case 'precious_metals': return 0.12;
            case 'collectibles': return 0.10;
            case 'business_equity': return 0.20;
            default: return 0.10; // 'other' or unknown
        }
    }

    /**
     * Simulates debt repayment for a single liability over time with a fixed monthly payment.
     * @returns { totalInterestPaid: number, monthsToPayoff: number, payoffDate: Date }
     */
    private simulateDebtRepayment(liability: Liability, monthlyPayment: number): { totalInterestPaid: number; monthsToPayoff: number; payoffDate: Date } {
        if (monthlyPayment <= 0 || monthlyPayment < (liability.minimumPayment || 0)) {
            // Cannot pay off or paying less than minimum, consider it never paid off with this payment
            return { totalInterestPaid: Infinity, monthsToPayoff: Infinity, payoffDate: new Date(9999, 0, 1) };
        }

        let currentBalance = liability.currentBalance;
        let totalInterestPaid = 0;
        let months = 0;
        const monthlyInterestRate = liability.interestRate / 12;
        const startDate = new Date();

        while (currentBalance > 0 && months < 1200) { // Cap at 100 years to prevent infinite loops
            const interestPayment = currentBalance * monthlyInterestRate;
            totalInterestPaid += interestPayment;
            currentBalance += interestPayment; // Interest accrues

            const principalPayment = monthlyPayment - interestPayment;
            currentBalance -= principalPayment; // Payment reduces balance

            if (currentBalance < 0) {
                currentBalance = 0; // Debt fully paid
            }
            months++;
        }

        const payoffDate = new Date(startDate);
        payoffDate.setMonth(startDate.getMonth() + months);

        return { totalInterestPaid, monthsToPayoff: months, payoffDate };
    }

    /**
     * Suggests an optimal debt repayment strategy (avalanche or snowball)
     * given an additional monthly budget for debt payments.
     * @param additionalMonthlyPayment The extra amount available each month to put towards debt.
     * @returns An object detailing the recommended strategy, interest saved, and payoff dates.
     */
    public optimizeDebtRepayment(
        additionalMonthlyPayment: number = 0,
        baseMonthlyMinimumPayments: { [liabilityId: string]: number } = {}
    ): {
        strategy: 'avalanche' | 'snowball';
        optimizedPayments: { liabilityId: string; amount: number }[];
        totalInterestSavedVsDefault: number;
        newPayoffDates: { liabilityId: string; date: string }[];
        rationale: string[];
    } {
        const activeLiabilities = this.liabilities.filter(l => l.currentBalance > 0);
        if (activeLiabilities.length === 0) {
            return {
                strategy: 'N/A',
                optimizedPayments: [],
                totalInterestSavedVsDefault: 0,
                newPayoffDates: [],
                rationale: ["No active liabilities to optimize."]
            } as any;
        }

        const rationale: string[] = [];
        let bestStrategy: 'avalanche' | 'snowball' = 'avalanche';
        let minTotalInterestPaid = Infinity;
        let bestOptimizedPayments: { liabilityId: string; amount: number }[] = [];
        let bestNewPayoffDates: { liabilityId: string; date: string }[] = [];

        // Calculate default scenario for comparison
        let defaultTotalInterestPaid = 0;
        const defaultPayoffDates: { liabilityId: string; date: string }[] = [];
        activeLiabilities.forEach(l => {
            const monthlyMinPayment = baseMonthlyMinimumPayments[l.id] || l.minimumPayment || 0;
            const simulation = this.simulateDebtRepayment(l, monthlyMinPayment);
            defaultTotalInterestPaid += simulation.totalInterestPaid;
            defaultPayoffDates.push({ liabilityId: l.id, date: simulation.payoffDate.toISOString() });
        });

        // Test Avalanche strategy (highest interest rate first)
        let avalancheLiabilities = [...activeLiabilities].sort((a, b) => b.interestRate - a.interestRate);
        let avalancheTotalInterest = 0;
        let avalanchePayments: { liabilityId: string; amount: number }[] = [];
        let avalanchePayoffDates: { liabilityId: string; date: string }[] = [];
        let remainingPaymentBudget = additionalMonthlyPayment;

        // Initialize payments with minimums
        avalancheLiabilities.forEach(l => {
            avalanchePayments.push({ liabilityId: l.id, amount: l.minimumPayment || 0 });
        });

        // Then apply additional budget to highest interest
        for (const liability of avalancheLiabilities) {
            if (remainingPaymentBudget <= 0) break;
            const existingPaymentIdx = avalanchePayments.findIndex(p => p.liabilityId === liability.id);
            const currentPaymentAmount = avalanchePayments[existingPaymentIdx]?.amount || (liability.minimumPayment || 0);

            // Calculate remaining balance after interest accrues (if only minimums were paid)
            const balanceAfterMinPayment = liability.currentBalance + (liability.currentBalance * (liability.interestRate / 12)) - (liability.minimumPayment || 0);
            
            // Amount to apply is either the remaining budget or enough to pay off this debt
            const amountToApply = Math.min(remainingPaymentBudget, Math.max(0, balanceAfterMinPayment - currentPaymentAmount)); 
            
            if (amountToApply > 0) {
                if (existingPaymentIdx !== -1) {
                    avalanchePayments[existingPaymentIdx].amount += amountToApply;
                } else {
                    avalanchePayments.push({ liabilityId: liability.id, amount: (liability.minimumPayment || 0) + amountToApply });
                }
                remainingPaymentBudget -= amountToApply;
            }
        }
        
        // If there's still budget after attempting to pay off liabilities with it, distribute remaining to the highest interest one
        if (remainingPaymentBudget > 0 && avalancheLiabilities.length > 0) {
            const highestInterestLiability = avalancheLiabilities[0];
            const existingPaymentIdx = avalanchePayments.findIndex(p => p.liabilityId === highestInterestLiability.id);
            if (existingPaymentIdx !== -1) {
                avalanchePayments[existingPaymentIdx].amount += remainingPaymentBudget;
            } else {
                avalanchePayments.push({ liabilityId: highestInterestLiability.id, amount: (highestInterestLiability.minimumPayment || 0) + remainingPaymentBudget });
            }
            remainingPaymentBudget = 0;
        }

        // Simulate with the calculated avalanche payments
        avalancheLiabilities.forEach(l => {
            const payment = avalanchePayments.find(p => p.liabilityId === l.id)?.amount || (l.minimumPayment || 0);
            const simulation = this.simulateDebtRepayment(l, payment);
            avalancheTotalInterest += simulation.totalInterestPaid;
            avalanchePayoffDates.push({ liabilityId: l.id, date: simulation.payoffDate.toISOString() });
        });

        if (avalancheTotalInterest < minTotalInterestPaid) {
            minTotalInterestPaid = avalancheTotalInterest;
            bestStrategy = 'avalanche';
            bestOptimizedPayments = avalanchePayments;
            bestNewPayoffDates = avalanchePayoffDates;
        }

        // Test Snowball strategy (smallest balance first)
        let snowballLiabilities = [...activeLiabilities].sort((a, b) => a.currentBalance - b.currentBalance);
        let snowballTotalInterest = 0;
        let snowballPayments: { liabilityId: string; amount: number }[] = [];
        let snowballPayoffDates: { liabilityId: string; date: string }[] = [];
        remainingPaymentBudget = additionalMonthlyPayment;

        // Initialize payments with minimums
        snowballLiabilities.forEach(l => {
            snowballPayments.push({ liabilityId: l.id, amount: l.minimumPayment || 0 });
        });

        // Then apply additional budget to smallest balance
        for (const liability of snowballLiabilities) {
            if (remainingPaymentBudget <= 0) break;
            const existingPaymentIdx = snowballPayments.findIndex(p => p.liabilityId === liability.id);
            const currentPaymentAmount = snowballPayments[existingPaymentIdx]?.amount || (liability.minimumPayment || 0);

            const balanceAfterMinPayment = liability.currentBalance + (liability.currentBalance * (liability.interestRate / 12)) - (liability.minimumPayment || 0);

            const amountToApply = Math.min(remainingPaymentBudget, Math.max(0, balanceAfterMinPayment - currentPaymentAmount));
            
            if (amountToApply > 0) {
                if (existingPaymentIdx !== -1) {
                    snowballPayments[existingPaymentIdx].amount += amountToApply;
                } else {
                    snowballPayments.push({ liabilityId: liability.id, amount: (liability.minimumPayment || 0) + amountToApply });
                }
                remainingPaymentBudget -= amountToApply;
            }
        }

        // If still budget, add to smallest balance one
        if (remainingPaymentBudget > 0 && snowballLiabilities.length > 0) {
            const smallestBalanceLiability = snowballLiabilities[0];
            const existingPaymentIdx = snowballPayments.findIndex(p => p.liabilityId === smallestBalanceLiability.id);
            if (existingPaymentIdx !== -1) {
                snowballPayments[existingPaymentIdx].amount += remainingPaymentBudget;
            } else {
                snowballPayments.push({ liabilityId: smallestBalanceLiability.id, amount: (smallestBalanceLiability.minimumPayment || 0) + remainingPaymentBudget });
            }
            remainingPaymentBudget = 0;
        }

        // Simulate with the calculated snowball payments
        snowballLiabilities.forEach(l => {
            const payment = snowballPayments.find(p => p.liabilityId === l.id)?.amount || (l.minimumPayment || 0);
            const simulation = this.simulateDebtRepayment(l, payment);
            snowballTotalInterest += simulation.totalInterestPaid;
            snowballPayoffDates.push({ liabilityId: l.id, date: simulation.payoffDate.toISOString() });
        });

        if (snowballTotalInterest < minTotalInterestPaid) {
            minTotalInterestPaid = snowballTotalInterest;
            bestStrategy = 'snowball';
            bestOptimizedPayments = snowballPayments;
            bestNewPayoffDates = snowballPayoffDates;
        }

        const totalInterestSavedVsDefault = defaultTotalInterestPaid - minTotalInterestPaid;
        rationale.push(`By using the ${bestStrategy} strategy with an additional $${additionalMonthlyPayment.toLocaleString()} per month, you can save approximately $${totalInterestSavedVsDefault.toLocaleString(undefined, { maximumFractionDigits: 0 })} in total interest compared to paying only minimums.`);
        rationale.push("Recommended payments per liability:");
        bestOptimizedPayments.forEach(p => {
            const liability = activeLiabilities.find(l => l.id === p.liabilityId);
            rationale.push(`- ${liability?.name || p.liabilityId}: $${p.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month.`);
        });
        
        return {
            strategy: bestStrategy,
            optimizedPayments: bestOptimizedPayments,
            totalInterestSavedVsDefault,
            newPayoffDates: bestNewPayoffDates,
            rationale
        };
    }

    /**
     * Recommends an optimal asset allocation based on user profile, goals, and market conditions.
     * This is a simplified heuristic, not a full Mean-Variance Optimization.
     * @param investmentHorizonYears The number of years for the investment horizon.
     * @returns An object describing the recommended allocation and its rationale.
     */
    public optimizeAssetAllocation(
        investmentHorizonYears: number = this.userProfile.investmentHorizonYears
    ): {
        recommendedAllocation: { assetType: Asset['type']; percentage: number }[];
        expectedAnnualReturn: number;
        projectedRiskScore: number;
        rationale: string[];
    } {
        const rationale: string[] = ["Recommending optimal asset allocation:"];
        const riskTolerance = this.userProfile.riskTolerance;
        const yearsToRetirement = Math.max(0, this.userProfile.retirementAge - (new Date().getFullYear() - new Date(this.userProfile.dob).getFullYear()));
        const effectiveHorizon = Math.min(investmentHorizonYears, yearsToRetirement > 0 ? yearsToRetirement : investmentHorizonYears);

        let targetAllocation: { [key in Asset['type']]?: number } = {
            'cash': 0.05,
            'stocks': 0.60,
            'bond': 0.20,
            'real_estate': 0.10,
            'crypto': 0.05,
            'precious_metals': 0,
            'collectibles': 0,
            'business_equity': 0,
            'other': 0
        };

        // Adjust allocation based on risk tolerance
        switch (riskTolerance) {
            case 'low':
                targetAllocation = {
                    'cash': 0.20, 'stocks': 0.30, 'bond': 0.40, 'real_estate': 0.10, 'crypto': 0
                };
                rationale.push("Adjusting allocation for 'Low' risk tolerance: higher allocation to stable assets like cash and bonds.");
                break;
            case 'medium':
                targetAllocation = {
                    'cash': 0.10, 'stocks': 0.50, 'bond': 0.25, 'real_estate': 0.10, 'crypto': 0.05
                };
                rationale.push("Adjusting allocation for 'Medium' risk tolerance: balanced approach with growth and stability.");
                break;
            case 'high':
                targetAllocation = {
                    'cash': 0.05, 'stocks': 0.65, 'bond': 0.10, 'real_estate': 0.10, 'crypto': 0.10
                };
                rationale.push("Adjusting allocation for 'High' risk tolerance: favoring higher growth potential assets like stocks and crypto.");
                break;
            case 'aggressive':
                targetAllocation = {
                    'cash': 0.02, 'stocks': 0.75, 'bond': 0.05, 'real_estate': 0.08, 'crypto': 0.10
                };
                rationale.push("Adjusting allocation for 'Aggressive' risk tolerance: maximizing exposure to high-growth assets, minimal cash/bonds.");
                break;
        }

        // Further adjust based on investment horizon (closer to retirement = more conservative)
        if (effectiveHorizon < 10) {
            targetAllocation.stocks = (targetAllocation.stocks || 0) * 0.7;
            targetAllocation.bond = (targetAllocation.bond || 0) + (1 - (targetAllocation.stocks || 0)) * 0.2; // Shift to bonds
            targetAllocation.cash = (targetAllocation.cash || 0) + (1 - (targetAllocation.stocks || 0)) * 0.1; // Shift to cash
            rationale.push(`Further adjusting due to shorter investment horizon (${effectiveHorizon} years): increasing allocation to less volatile assets.`);
        } else if (effectiveHorizon > 20) {
            targetAllocation.stocks = (targetAllocation.stocks || 0) * 1.1;
            targetAllocation.crypto = (targetAllocation.crypto || 0) + (1 - (targetAllocation.stocks || 0)) * 0.05;
            targetAllocation.bond = (targetAllocation.bond || 0) * 0.8;
            rationale.push(`Leveraging longer investment horizon (${effectiveHorizon} years) for higher growth potential: increasing exposure to growth assets.`);
        }

        // Normalize allocation to 100% (handling potential floating point issues)
        const total = Object.values(targetAllocation).reduce((sum, val) => sum + (val || 0), 0);
        for (const type in targetAllocation) {
            targetAllocation[type as Asset['type']] = (targetAllocation[type as Asset['type']] || 0) / total;
        }

        const recommendedAllocation: { assetType: Asset['type']; percentage: number }[] = Object.entries(targetAllocation)
            .filter(([, percentage]) => percentage > 0.001) // Filter out negligible percentages
            .map(([type, percentage]) => ({ assetType: type as Asset['type'], percentage: percentage || 0 }));


        // Calculate expected return and projected risk score for this allocation
        let expectedAnnualReturn = 0;
        let projectedRiskScore = 0;
        recommendedAllocation.forEach(item => {
            const baseReturn = this.getBaseAssetAnnualGrowthRate(item.assetType);
            const volatility = this.getBaseAssetVolatility(item.assetType);
            expectedAnnualReturn += item.percentage * baseReturn;
            projectedRiskScore += item.percentage * volatility;
        });

        rationale.push(`Your recommended allocation aims for an expected annual return of ${(expectedAnnualReturn * 100).toFixed(2)}% with a projected portfolio risk score of ${(projectedRiskScore * 100).toFixed(0)} (out of 100).`);
        rationale.push("Consider reviewing your current asset holdings and rebalancing to align with these recommendations, especially if your actual allocation deviates significantly.");

        return {
            recommendedAllocation,
            expectedAnnualReturn,
            projectedRiskScore: projectedRiskScore * 100, // Scale to 100
            rationale
        };
    }

    /**
     * Recommends how to distribute a monthly contribution budget across various financial goals
     * to optimize their achievement based on priority and target dates.
     * @param monthlyContributionBudget The total amount available monthly for goal contributions.
     * @returns An object detailing recommended contributions per goal and achievement status.
     */
    public optimizeGoalContributions(
        monthlyContributionBudget: number
    ): {
        recommendedContributions: { goalId: string; amount: number; goalName: string }[];
        achievableGoals: { goalId: string; status: 'on_track' | 'adjusted' | 'at_risk' | 'achieved'; goalName: string; }[];
        rationale: string[];
    } {
        const rationale: string[] = ["Optimizing monthly contributions across your goals:"];
        const recommendedContributions: { goalId: string; amount: number; goalName: string }[] = [];
        const achievableGoals: { goalId: string; status: 'on_track' | 'adjusted' | 'at_risk' | 'achieved'; goalName: string; }[] = [];

        if (monthlyContributionBudget <= 0 || this.goals.length === 0) {
            rationale.push("No budget or no goals to optimize.");
            return { recommendedContributions, achievableGoals, rationale };
        }

        // Sort goals by priority (highest first) and then by closest target date
        const sortedGoals = [...this.goals].sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        });

        let remainingBudget = monthlyContributionBudget;

        sortedGoals.forEach(goal => {
            const monthsToTarget = Math.max(1, ((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.4375))); // Average month length
            const neededAmount = goal.targetAmount - goal.currentProgress;
            
            if (neededAmount <= 0) {
                recommendedContributions.push({ goalId: goal.id, amount: 0, goalName: goal.name });
                achievableGoals.push({ goalId: goal.id, status: 'achieved', goalName: goal.name });
                rationale.push(`- Goal "${goal.name}" is already achieved or overfunded.`);
                return;
            }

            const idealMonthlyContribution = neededAmount / monthsToTarget;
            let actualContributionForGoal = 0;

            if (remainingBudget >= idealMonthlyContribution) {
                actualContributionForGoal = idealMonthlyContribution;
                remainingBudget -= actualContributionForGoal;
                achievableGoals.push({ goalId: goal.id, status: 'on_track', goalName: goal.name });
                rationale.push(`- Allocated $${actualContributionForGoal.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month to "${goal.name}" to stay on track.`);
            } else if (remainingBudget > 0) {
                actualContributionForGoal = remainingBudget;
                remainingBudget = 0;
                // If the allocated amount is significantly less than ideal, mark as at_risk
                if (actualContributionForGoal < idealMonthlyContribution * 0.5) { // If less than 50% of ideal
                    achievableGoals.push({ goalId: goal.id, status: 'at_risk', goalName: goal.name });
                    rationale.push(`- Allocated remaining $${actualContributionForGoal.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month to "${goal.name}". This goal may be at risk of not being met by its target date.`);
                } else {
                    achievableGoals.push({ goalId: goal.id, status: 'adjusted', goalName: goal.name });
                    rationale.push(`- Allocated $${actualContributionForGoal.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month to "${goal.name}". This is a reduced contribution, goal may be delayed.`);
                }
            } else {
                achievableGoals.push({ goalId: goal.id, status: 'at_risk', goalName: goal.name });
                rationale.push(`- No budget available for "${goal.name}". This goal is currently at risk.`);
            }

            recommendedContributions.push({ goalId: goal.id, amount: actualContributionForGoal, goalName: goal.name });
        });

        if (remainingBudget > 0) {
            rationale.push(`An unallocated surplus of $${remainingBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })} remains. Consider increasing contributions to high-priority goals or starting a new savings goal.`);
        }

        return {
            recommendedContributions,
            achievableGoals,
            rationale
        };
    }

    /**
     * Provides an overall wealth maximization strategy by combining debt repayment and asset allocation suggestions.
     * This method evaluates different approaches to monthly savings/investment to project the highest net worth.
     * @param years The number of years for the projection.
     * @param availableMonthlyCashFlow The total cash flow available each month for debt payment or investment (beyond basic expenses).
     * @returns An optimized scenario, projected net worth, and rationale.
     */
    public maximizeNetWorth(
        years: number,
        availableMonthlyCashFlow: number
    ): {
        optimizedScenarioId: string;
        optimizedScenarioName: string;
        projectedNetWorth: number;
        rationale: string[];
    } {
        const rationale: string[] = ["Analyzing various strategies to maximize your long-term wealth:"];
        let bestNetWorth = 0;
        let bestScenarioId: string = '';
        let bestScenarioName: string = '';

        // Strategy 1: Default (Realistic projection from FinancialDataProcessor)
        const defaultProjections = this.financialProcessor.generateFutureProjections(years, { id: 'default_realistic', name: 'Default Realistic' }, [], false);
        const defaultNetWorth = defaultProjections['default_realistic']?.[defaultProjections['default_realistic'].length - 1]?.projectionRealisticNetWorth || 0;
        bestNetWorth = defaultNetWorth;
        bestScenarioId = 'default_realistic';
        bestScenarioName = 'Default Realistic Projection';
        rationale.push(`- Default Realistic Projection over ${years} years: $${defaultNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);


        // Strategy 2: Prioritize Debt Repayment with availableMonthlyCashFlow
        const debtOptimization = this.optimizeDebtRepayment(availableMonthlyCashFlow, {}); // Pass an empty map for base minimums, as this is an additional cash flow
        const debtPaymentsMap = debtOptimization.optimizedPayments.reduce((acc, p) => ({ ...acc, [p.liabilityId]: p.amount }), {});

        // Create a temporary set of liabilities with accelerated payments
        const liabilitiesWithAcceleratedPayments: Liability[] = this.liabilities.map(l => {
            if (debtPaymentsMap[l.id]) {
                // Adjust minimumPayment in temp liability to reflect the optimized payment
                return { ...l, minimumPayment: debtPaymentsMap[l.id] }; 
            }
            return l;
        });

        const debtRepaymentScenario: ScenarioParameters = {
            id: 'debt_focus_scenario',
            name: 'Debt Focus Strategy',
            description: 'Prioritize paying down high-interest debt first using additional monthly cash flow.',
            debtRepaymentStrategyOverride: 'avalanche',
            monthlySavingsAdjustment: 0, // All available cash flow directed to debt, so no 'savings' here
        };

        const tempProcessorForDebt = new FinancialDataProcessor(this.transactions, this.assets, liabilitiesWithAcceleratedPayments, this.goals, this.userProfile);
        const debtProjections = tempProcessorForDebt.generateFutureProjections(years, debtRepaymentScenario, [], false);
        const debtFocusNetWorth = debtProjections['debt_focus_scenario']?.[debtProjections['debt_focus_scenario'].length - 1]?.projectionRealisticNetWorth || 0;
        
        rationale.push(`- Debt Focus Strategy over ${years} years (using $${availableMonthlyCashFlow.toLocaleString()} for acceleration): $${debtFocusNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}. ${debtOptimization.rationale[0]}`);

        if (debtFocusNetWorth > bestNetWorth) {
            bestNetWorth = debtFocusNetWorth;
            bestScenarioId = debtRepaymentScenario.id;
            bestScenarioName = debtRepaymentScenario.name;
        }

        // Strategy 3: Maximize Investment with availableMonthlyCashFlow
        // Assume minimal payments on debt (default minimums) and direct all additional cash flow to investment.
        // The asset allocation strategy from optimizeAssetAllocation can inform how this investment is implicitly handled.
        const assetAllocation = this.optimizeAssetAllocation(years);
        
        const investmentFocusScenario: ScenarioParameters = {
            id: 'investment_focus_scenario',
            name: 'Investment Focus Strategy',
            description: 'Prioritize investing all additional monthly cash flow into a diversified portfolio.',
            monthlySavingsAdjustment: availableMonthlyCashFlow, // All cash flow goes to savings/investment
        };
        const investmentProjections = this.financialProcessor.generateFutureProjections(years, investmentFocusScenario, [], false);
        const investmentFocusNetWorth = investmentProjections['investment_focus_scenario']?.[investmentProjections['investment_focus_scenario'].length - 1]?.projectionRealisticNetWorth || 0;
        
        rationale.push(`- Investment Focus Strategy over ${years} years (investing $${availableMonthlyCashFlow.toLocaleString()} monthly): $${investmentFocusNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
        rationale.push(`  Recommended asset allocation for this strategy: ${assetAllocation.recommendedAllocation.map(a => `${a.assetType} ${(a.percentage * 100).toFixed(0)}%`).join(', ')}.`);


        if (investmentFocusNetWorth > bestNetWorth) {
            bestNetWorth = investmentFocusNetWorth;
            bestScenarioId = investmentFocusScenario.id;
            bestScenarioName = investmentFocusScenario.name;
        }

        // Strategy 4: Balanced Approach (e.g., 50/50 split of cash flow or based on a heuristic)
        const balancedDebtPaymentBudget = availableMonthlyCashFlow * 0.5;
        const balancedInvestmentBudget = availableMonthlyCashFlow * 0.5;

        const balancedDebtOptimization = this.optimizeDebtRepayment(balancedDebtPaymentBudget, {});
        const balancedDebtPaymentsMap = balancedDebtOptimization.optimizedPayments.reduce((acc, p) => ({ ...acc, [p.liabilityId]: p.amount }), {});

        const balancedLiabilities: Liability[] = this.liabilities.map(l => {
            if (balancedDebtPaymentsMap[l.id]) {
                return { ...l, minimumPayment: balancedDebtPaymentsMap[l.id] };
            }
            return l;
        });

        const balancedScenario: ScenarioParameters = {
            id: 'balanced_strategy',
            name: 'Balanced Strategy (Debt & Investment)',
            description: 'Split additional cash flow between accelerated debt repayment and investments.',
            monthlySavingsAdjustment: balancedInvestmentBudget, // For investment
        };
        const tempProcessorForBalanced = new FinancialDataProcessor(this.transactions, this.assets, balancedLiabilities, this.goals, this.userProfile);
        const balancedProjections = tempProcessorForBalanced.generateFutureProjections(years, balancedScenario, [], false);
        const balancedNetWorth = balancedProjections['balanced_strategy']?.[balancedProjections['balanced_strategy'].length - 1]?.projectionRealisticNetWorth || 0;

        rationale.push(`- Balanced Strategy over ${years} years (using $${balancedDebtPaymentBudget.toLocaleString()} for debt and $${balancedInvestmentBudget.toLocaleString()} for investment): $${balancedNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);

        if (balancedNetWorth > bestNetWorth) {
            bestNetWorth = balancedNetWorth;
            bestScenarioId = balancedScenario.id;
            bestScenarioName = balancedScenario.name;
        }


        if (bestScenarioId) {
            rationale.push(`\nConclusion: The **${bestScenarioName}** strategy is projected to yield the highest net worth of $${bestNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })} over ${years} years.`);
            rationale.push("Consider this strategy as a strong recommendation, but always review the underlying assumptions and adapt to your personal circumstances and market changes.");
        } else {
            rationale.push("Could not determine an optimal strategy. Ensure you have financial data and an available cash flow for analysis.");
        }

        return {
            optimizedScenarioId: bestScenarioId,
            optimizedScenarioName: bestScenarioName,
            projectedNetWorth: bestNetWorth,
            rationale
        };
    }
}