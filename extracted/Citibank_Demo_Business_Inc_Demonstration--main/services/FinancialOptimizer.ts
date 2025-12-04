```typescript
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

import { Agent } from '../agents/Agent'; // Agent abstraction for future integration
import { TokenLedger, SettlementTransaction } from '../token_rail_layer/TokenLedger'; // Token rail for transactional insights
import { DigitalIdentity } from '../identity/DigitalIdentity'; // Digital Identity for secure operations
import { PaymentEngine } from '../payments_infrastructure/PaymentEngine'; // Payment engine for real-time payment context
import { LogManager, LogLevel } from '../utils/LogManager'; // For commercial-grade observability

/**
 * This module implements the FinancialOptimizer, a core component that applies advanced algorithmic intelligence
 * to an individual's or entity's financial data to recommend optimal strategies across debt, investments, and goals.
 *
 * Business value: This optimizer provides a substantial competitive advantage by moving beyond simple aggregation
 * to actionable, data-driven recommendations. It transforms raw financial data into a dynamic roadmap for wealth
 * maximization, offering unparalleled value in personalized financial guidance. By integrating with agentic AI,
 * token rails, and real-time payments infrastructure, it can not only suggest strategies but also orchestrate
 * their execution. This capability enables automated rebalancing, dynamic debt payments, and intelligent goal
 * funding, leading to optimized financial outcomes, reduced human error, and significant time savings for users.
 * Its predictive capabilities and scenario analysis tools empower users to make informed decisions, leading
 * to increased financial resilience and accelerated wealth accumulation, representing millions in direct user
 * value and platform stickiness.
 */
export class FinancialOptimizer {
    private transactions: Transaction[];
    private assets: Asset[];
    private liabilities: Liability[];
    private goals: FinancialGoal[];
    private userProfile: UserProfile;
    private financialProcessor: FinancialDataProcessor;
    private marketDataService: MarketDataService;
    private logger: LogManager;

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
        this.marketDataService = new MarketDataService(); // Initialize MarketDataService
        this.logger = new LogManager('FinancialOptimizer');
    }

    /**
     * Helper to get base annual growth rates if not specified on asset.
     */
    private getBaseAssetAnnualGrowthRate(assetType: Asset['type']): number {
        // Incorporate current market data for more dynamic rates
        const marketSentiment = this.marketDataService.getMarketSentiment(); // Simplified
        let baseRate: number;
        switch (assetType) {
            case 'cash': baseRate = 0.005; break;
            case 'stocks': baseRate = 0.08; break;
            case 'real_estate': baseRate = 0.05; break;
            case 'crypto': baseRate = 0.15; break;
            case 'bond': baseRate = 0.03; break;
            case 'precious_metals': baseRate = 0.04; break;
            case 'collectibles': baseRate = 0.03; break;
            case 'business_equity': baseRate = 0.10; break;
            default: baseRate = 0.04; // 'other' or unknown
        }
        // Adjust based on market sentiment (simplified model)
        return baseRate * (1 + marketSentiment.overallImpactFactor);
    }

    /**
     * Helper to get base asset volatility.
     */
    private getBaseAssetVolatility(assetType: Asset['type']): number {
        const marketVolatilityIndex = this.marketDataService.getMarketVolatilityIndex(); // Simplified
        let baseVolatility: number;
        switch (assetType) {
            case 'cash': baseVolatility = 0.001; break;
            case 'stocks': baseVolatility = 0.15; break;
            case 'real_estate': baseVolatility = 0.10; break;
            case 'crypto': baseVolatility = 0.30; break;
            case 'bond': baseVolatility = 0.05; break;
            case 'precious_metals': baseVolatility = 0.12; break;
            case 'collectibles': baseVolatility = 0.10; break;
            case 'business_equity': baseVolatility = 0.20; break;
            default: baseVolatility = 0.10; // 'other' or unknown
        }
        return baseVolatility * (1 + marketVolatilityIndex / 100); // Scale by market index
    }

    /**
     * Simulates debt repayment for a single liability over time with a fixed monthly payment.
     * This method provides a deterministic projection of debt payoff, crucial for accurate scenario analysis.
     * @param liability The liability object to simulate repayment for.
     * @param monthlyPayment The fixed monthly payment amount.
     * @returns An object containing total interest paid, months to payoff, and the estimated payoff date.
     */
    private simulateDebtRepayment(liability: Liability, monthlyPayment: number): { totalInterestPaid: number; monthsToPayoff: number; payoffDate: Date } {
        if (monthlyPayment <= 0 || (liability.minimumPayment && monthlyPayment < liability.minimumPayment)) {
            this.logger.log(LogLevel.WARN, `Monthly payment of ${monthlyPayment} for liability ${liability.id} is insufficient or zero. Cannot realistically pay off.`);
            // Cannot pay off or paying less than minimum, consider it never paid off with this payment
            return { totalInterestPaid: Infinity, monthsToPayoff: Infinity, payoffDate: new Date(9999, 0, 1) };
        }

        let currentBalance = liability.currentBalance;
        let totalInterestPaid = 0;
        let months = 0;
        const monthlyInterestRate = liability.interestRate / 12;
        const startDate = new Date();

        while (currentBalance > 0 && months < 1200) { // Cap at 100 years to prevent infinite loops for edge cases
            const interestPayment = currentBalance * monthlyInterestRate;
            totalInterestPaid += interestPayment;
            currentBalance += interestPayment; // Interest accrues

            let principalPayment = monthlyPayment - interestPayment;
            if (principalPayment <= 0 && currentBalance > 0) { // Ensure at least minimum principal is paid if interest exceeds payment
                principalPayment = monthlyPayment; // If monthly payment cannot cover interest, still reduce by full payment
            }

            currentBalance -= principalPayment; // Payment reduces balance

            if (currentBalance < 0) {
                // If the last payment overshot, adjust totalInterestPaid if necessary for exact payoff
                const overpayment = -currentBalance;
                totalInterestPaid -= (overpayment / monthlyPayment) * interestPayment; // Rough adjustment
                currentBalance = 0; // Debt fully paid
            }
            months++;
        }

        const payoffDate = new Date(startDate);
        payoffDate.setMonth(startDate.getMonth() + months);

        this.logger.log(LogLevel.INFO, `Simulated repayment for liability ${liability.id}: Months=${months}, Total Interest=$${totalInterestPaid.toFixed(2)}.`);
        return { totalInterestPaid, monthsToPayoff: months, payoffDate };
    }

    /**
     * Suggests an optimal debt repayment strategy (avalanche or snowball) by intelligently
     * allocating an additional monthly budget to minimize total interest paid or accelerate payoff.
     * This function provides a clear, actionable plan for users to reduce their liabilities,
     * enhancing financial control and saving significant capital.
     * @param additionalMonthlyPayment The extra amount available each month to put towards debt.
     * @param baseMonthlyMinimumPayments A map of liability IDs to their base minimum payments.
     * @returns An object detailing the recommended strategy, interest saved, and new payoff dates.
     */
    public optimizeDebtRepayment(
        additionalMonthlyPayment: number = 0,
        baseMonthlyMinimumPayments: { [liabilityId: string]: number } = {}
    ): {
        strategy: 'avalanche' | 'snowball' | 'N/A';
        optimizedPayments: { liabilityId: string; amount: number }[];
        totalInterestSavedVsDefault: number;
        newPayoffDates: { liabilityId: string; date: string }[];
        rationale: string[];
    } {
        const activeLiabilities = this.liabilities.filter(l => l.currentBalance > 0);
        if (activeLiabilities.length === 0) {
            this.logger.log(LogLevel.INFO, "No active liabilities to optimize debt repayment for.");
            return {
                strategy: 'N/A',
                optimizedPayments: [],
                totalInterestSavedVsDefault: 0,
                newPayoffDates: [],
                rationale: ["No active liabilities to optimize."]
            };
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
        this.logger.log(LogLevel.DEBUG, `Default scenario total interest: ${defaultTotalInterestPaid.toFixed(2)}`);

        // Test Avalanche strategy (highest interest rate first)
        // Sort by interest rate descending
        let avalancheLiabilities = [...activeLiabilities].sort((a, b) => b.interestRate - a.interestRate);
        let avalancheTotalInterest = 0;
        let avalanchePayments: { liabilityId: string; amount: number }[] = avalancheLiabilities.map(l => ({ liabilityId: l.id, amount: l.minimumPayment || 0 }));
        let remainingPaymentBudget = additionalMonthlyPayment;

        // Apply additional budget to highest interest liabilities
        for (const liability of avalancheLiabilities) {
            if (remainingPaymentBudget <= 0) break;

            const existingPaymentEntry = avalanchePayments.find(p => p.liabilityId === liability.id);
            if (!existingPaymentEntry) continue; // Should not happen with pre-populated payments

            const currentBalance = liability.currentBalance;
            const idealPaymentToPayoff = currentBalance > 0 ? (currentBalance * (1 + liability.interestRate / 12)) / 1 : Infinity; // Simplified immediate payoff
            const amountNeededToPayOff = currentBalance + (currentBalance * liability.interestRate / 12) - existingPaymentEntry.amount; // Rough estimate of what's needed beyond min for next month

            const amountToApply = Math.min(remainingPaymentBudget, Math.max(0, amountNeededToPayOff));

            if (amountToApply > 0) {
                existingPaymentEntry.amount += amountToApply;
                remainingPaymentBudget -= amountToApply;
            }
        }

        // If there's still budget, apply remaining to the highest interest liability
        if (remainingPaymentBudget > 0 && avalancheLiabilities.length > 0) {
            const highestInterestLiability = avalancheLiabilities[0];
            const existingPaymentEntry = avalanchePayments.find(p => p.liabilityId === highestInterestLiability.id);
            if (existingPaymentEntry) {
                existingPaymentEntry.amount += remainingPaymentBudget;
                remainingPaymentBudget = 0;
            }
        }
        
        // Simulate with the calculated avalanche payments
        let avalanchePayoffDates: { liabilityId: string; date: string }[] = [];
        avalancheLiabilities.forEach(l => {
            const payment = avalanchePayments.find(p => p.liabilityId === l.id)?.amount || (l.minimumPayment || 0);
            const simulation = this.simulateDebtRepayment(l, payment);
            avalancheTotalInterest += simulation.totalInterestPaid;
            avalanchePayoffDates.push({ liabilityId: l.id, date: simulation.payoffDate.toISOString() });
        });

        this.logger.log(LogLevel.DEBUG, `Avalanche strategy total interest: ${avalancheTotalInterest.toFixed(2)}`);

        if (avalancheTotalInterest < minTotalInterestPaid) {
            minTotalInterestPaid = avalancheTotalInterest;
            bestStrategy = 'avalanche';
            bestOptimizedPayments = avalanchePayments;
            bestNewPayoffDates = avalanchePayoffDates;
        }

        // Test Snowball strategy (smallest balance first)
        // Sort by current balance ascending
        let snowballLiabilities = [...activeLiabilities].sort((a, b) => a.currentBalance - b.currentBalance);
        let snowballTotalInterest = 0;
        let snowballPayments: { liabilityId: string; amount: number }[] = snowballLiabilities.map(l => ({ liabilityId: l.id, amount: l.minimumPayment || 0 }));
        remainingPaymentBudget = additionalMonthlyPayment;

        // Apply additional budget to smallest balance liabilities
        for (const liability of snowballLiabilities) {
            if (remainingPaymentBudget <= 0) break;

            const existingPaymentEntry = snowballPayments.find(p => p.liabilityId === liability.id);
            if (!existingPaymentEntry) continue;

            const currentBalance = liability.currentBalance;
            const amountNeededToPayOff = currentBalance + (currentBalance * liability.interestRate / 12) - existingPaymentEntry.amount;

            const amountToApply = Math.min(remainingPaymentBudget, Math.max(0, amountNeededToPayOff));
            
            if (amountToApply > 0) {
                existingPaymentEntry.amount += amountToApply;
                remainingPaymentBudget -= amountToApply;
            }
        }

        // If still budget, add to smallest balance one
        if (remainingPaymentBudget > 0 && snowballLiabilities.length > 0) {
            const smallestBalanceLiability = snowballLiabilities[0];
            const existingPaymentEntry = snowballPayments.find(p => p.liabilityId === smallestBalanceLiability.id);
            if (existingPaymentEntry) {
                existingPaymentEntry.amount += remainingPaymentBudget;
                remainingPaymentBudget = 0;
            }
        }

        // Simulate with the calculated snowball payments
        let snowballPayoffDates: { liabilityId: string; date: string }[] = [];
        snowballLiabilities.forEach(l => {
            const payment = snowballPayments.find(p => p.liabilityId === l.id)?.amount || (l.minimumPayment || 0);
            const simulation = this.simulateDebtRepayment(l, payment);
            snowballTotalInterest += simulation.totalInterestPaid;
            snowballPayoffDates.push({ liabilityId: l.id, date: simulation.payoffDate.toISOString() });
        });
        this.logger.log(LogLevel.DEBUG, `Snowball strategy total interest: ${snowballTotalInterest.toFixed(2)}`);


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
            rationale.push(`- ${liability?.name || p.liabilityId}: $${p.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}/month.`);
        });
        this.logger.log(LogLevel.INFO, `Optimized debt repayment using ${bestStrategy} strategy. Total interest saved: $${totalInterestSavedVsDefault.toFixed(2)}.`);
        
        return {
            strategy: bestStrategy,
            optimizedPayments: bestOptimizedPayments,
            totalInterestSavedVsDefault,
            newPayoffDates: bestNewPayoffDates,
            rationale
        };
    }

    /**
     * Recommends an optimal asset allocation based on user profile, goals, and dynamic market conditions.
     * This module leverages market data and sophisticated heuristics to suggest a portfolio strategy
     * that aligns with the user's risk tolerance and investment horizon, maximizing long-term capital growth.
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
        const currentYear = new Date().getFullYear();
        const userAge = currentYear - new Date(this.userProfile.dob).getFullYear();
        const yearsToRetirement = Math.max(0, this.userProfile.retirementAge - userAge);
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
            default:
                this.logger.log(LogLevel.WARN, `Unknown risk tolerance: ${riskTolerance}. Using default balanced allocation.`);
                // Fall through to initial default
                break;
        }

        // Further adjust based on investment horizon (closer to retirement = more conservative)
        if (effectiveHorizon < 10) {
            targetAllocation.stocks = ((targetAllocation.stocks || 0) * 0.7);
            targetAllocation.bond = (targetAllocation.bond || 0) + (0.2); // Shift to bonds
            targetAllocation.cash = (targetAllocation.cash || 0) + (0.1); // Shift to cash
            targetAllocation.crypto = (targetAllocation.crypto || 0) * 0.5; // Reduce crypto exposure
            rationale.push(`Further adjusting due to shorter investment horizon (${effectiveHorizon} years): increasing allocation to less volatile assets.`);
        } else if (effectiveHorizon > 20) {
            targetAllocation.stocks = ((targetAllocation.stocks || 0) * 1.1);
            targetAllocation.crypto = (targetAllocation.crypto || 0) + (0.05);
            targetAllocation.bond = (targetAllocation.bond || 0) * 0.8;
            targetAllocation.cash = (targetAllocation.cash || 0) * 0.5;
            rationale.push(`Leveraging longer investment horizon (${effectiveHorizon} years) for higher growth potential: increasing exposure to growth assets.`);
        }

        // Normalize allocation to 100% (handling potential floating point issues)
        const total = Object.values(targetAllocation).reduce((sum, val) => sum + (val || 0), 0);
        if (total > 0) {
            for (const type in targetAllocation) {
                targetAllocation[type as Asset['type']] = (targetAllocation[type as Asset['type']] || 0) / total;
            }
        } else {
            this.logger.log(LogLevel.ERROR, "Total allocation sum is zero, unable to normalize. Defaulting to a conservative allocation.");
            targetAllocation = { 'cash': 0.30, 'stocks': 0.30, 'bond': 0.40 }; // Fallback
        }


        const recommendedAllocation: { assetType: Asset['type']; percentage: number }[] = Object.entries(targetAllocation)
            .filter(([, percentage]) => (percentage || 0) > 0.001) // Filter out negligible percentages
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
        this.logger.log(LogLevel.INFO, `Optimized asset allocation. Expected return: ${(expectedAnnualReturn * 100).toFixed(2)}%, Projected risk: ${projectedRiskScore.toFixed(2)}.`);

        return {
            recommendedAllocation,
            expectedAnnualReturn,
            projectedRiskScore: projectedRiskScore * 100, // Scale to 100
            rationale
        };
    }

    /**
     * Recommends how to distribute a monthly contribution budget across various financial goals
     * to optimize their achievement based on priority, target dates, and current progress.
     * This feature enables users to effectively manage their savings towards multiple objectives,
     * ensuring that high-priority goals are adequately funded and tracking progress towards financial milestones.
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

        if (monthlyContributionBudget <= 0) {
            rationale.push("No budget to optimize for goal contributions.");
            this.logger.log(LogLevel.WARN, "Monthly contribution budget is zero or negative. No goal optimization performed.");
            return { recommendedContributions, achievableGoals, rationale };
        }
        if (this.goals.length === 0) {
            rationale.push("No goals defined to optimize contributions for.");
            this.logger.log(LogLevel.INFO, "No goals found for optimization.");
            return { recommendedContributions, achievableGoals, rationale };
        }

        // Sort goals by priority (highest first) and then by closest target date
        const sortedGoals = [...this.goals].sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        });

        let remainingBudget = monthlyContributionBudget;

        sortedGoals.forEach(goal => {
            const now = new Date();
            const targetDate = new Date(goal.targetDate);
            if (targetDate <= now) { // Goal target date is in the past or now
                const neededAmount = goal.targetAmount - goal.currentProgress;
                if (neededAmount <= 0) {
                    recommendedContributions.push({ goalId: goal.id, amount: 0, goalName: goal.name });
                    achievableGoals.push({ goalId: goal.id, status: 'achieved', goalName: goal.name });
                    rationale.push(`- Goal "${goal.name}" (target ${goal.targetDate}) is achieved or past its target date with sufficient funds.`);
                    this.logger.log(LogLevel.DEBUG, `Goal ${goal.name} already achieved or past due.`);
                } else {
                    // Goal is past due and not met, try to allocate if possible
                    const amountToAllocate = Math.min(remainingBudget, neededAmount);
                    recommendedContributions.push({ goalId: goal.id, amount: amountToAllocate, goalName: goal.name });
                    remainingBudget -= amountToAllocate;
                    if (amountToAllocate > 0) {
                        achievableGoals.push({ goalId: goal.id, status: 'at_risk', goalName: goal.name }); // Still at risk as past due
                        rationale.push(`- Allocated $${amountToAllocate.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month to overdue goal "${goal.name}". Goal remains at risk.`);
                    } else {
                        achievableGoals.push({ goalId: goal.id, status: 'at_risk', goalName: goal.name });
                        rationale.push(`- No budget available for overdue goal "${goal.name}". This goal is significantly at risk.`);
                    }
                }
                return;
            }

            const monthsToTarget = Math.max(1, ((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4375))); // Average month length
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
                rationale.push(`- Allocated $${actualContributionForGoal.toLocaleString(undefined, { maximumFractionDigits: 2 })}/month to "${goal.name}" to stay on track.`);
            } else if (remainingBudget > 0) {
                actualContributionForGoal = remainingBudget;
                remainingBudget = 0;
                // If the allocated amount is significantly less than ideal, mark as at_risk
                if (actualContributionForGoal < idealMonthlyContribution * 0.5) { // If less than 50% of ideal
                    achievableGoals.push({ goalId: goal.id, status: 'at_risk', goalName: goal.name });
                    rationale.push(`- Allocated remaining $${actualContributionForGoal.toLocaleString(undefined, { maximumFractionDigits: 2 })}/month to "${goal.name}". This goal may be at risk of not being met by its target date.`);
                } else {
                    achievableGoals.push({ goalId: goal.id, status: 'adjusted', goalName: goal.name });
                    rationale.push(`- Allocated $${actualContributionForGoal.toLocaleString(undefined, { maximumFractionDigits: 2 })}/month to "${goal.name}". This is a reduced contribution; goal may be delayed.`);
                }
            } else {
                achievableGoals.push({ goalId: goal.id, status: 'at_risk', goalName: goal.name });
                rationale.push(`- No budget available for "${goal.name}". This goal is currently at risk.`);
            }

            recommendedContributions.push({ goalId: goal.id, amount: actualContributionForGoal, goalName: goal.name });
        });

        if (remainingBudget > 0) {
            rationale.push(`An unallocated surplus of $${remainingBudget.toLocaleString(undefined, { maximumFractionDigits: 2 })} remains. Consider increasing contributions to high-priority goals or starting a new savings goal.`);
            this.logger.log(LogLevel.INFO, `Unallocated budget remaining: $${remainingBudget.toFixed(2)}.`);
        }
        this.logger.log(LogLevel.INFO, `Goal contributions optimized. Achievable goals: ${achievableGoals.filter(g => g.status === 'on_track').length}/${this.goals.length}.`);

        return {
            recommendedContributions,
            achievableGoals,
            rationale
        };
    }

    /**
     * Provides an overall wealth maximization strategy by combining debt repayment, asset allocation,
     * and goal funding suggestions into a cohesive plan. This method evaluates different approaches
     * to monthly savings/investment to project the highest net worth over a specified period.
     * This is a strategic orchestrator of financial planning, enabling users to achieve their highest
     * financial potential through automated, intelligent decision-making.
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

        if (availableMonthlyCashFlow <= 0) {
            rationale.push("No additional monthly cash flow available for optimization. Strategies will focus on existing financial structure.");
            this.logger.log(LogLevel.WARN, "Zero or negative availableMonthlyCashFlow, limiting optimization strategies.");
        }

        // Strategy 1: Default (Realistic projection from FinancialDataProcessor)
        // This baseline provides a reference for the impact of optimized strategies.
        const defaultScenario: ScenarioParameters = { id: 'default_realistic', name: 'Default Realistic', description: 'Baseline projection with current financial behaviors.', monthlySavingsAdjustment: 0 };
        const defaultProjections = this.financialProcessor.generateFutureProjections(years, defaultScenario, [], false);
        const defaultNetWorth = defaultProjections[defaultScenario.id]?.[defaultProjections[defaultScenario.id].length - 1]?.projectionRealisticNetWorth || 0;
        bestNetWorth = defaultNetWorth;
        bestScenarioId = defaultScenario.id;
        bestScenarioName = defaultScenario.name;
        rationale.push(`- ${defaultScenario.name} over ${years} years: $${defaultNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
        this.logger.log(LogLevel.INFO, `Baseline net worth projection: $${defaultNetWorth.toFixed(2)}.`);

        // Strategy 2: Prioritize Debt Repayment with availableMonthlyCashFlow
        // This strategy targets high-interest liabilities first to reduce interest burdens.
        const debtOptimization = this.optimizeDebtRepayment(availableMonthlyCashFlow, {}); 
        const debtPaymentsMap = debtOptimization.optimizedPayments.reduce((acc, p) => ({ ...acc, [p.liabilityId]: p.amount }), {});

        // Create a temporary set of liabilities with accelerated payments for simulation
        const liabilitiesWithAcceleratedPayments: Liability[] = this.liabilities.map(l => {
            if (debtPaymentsMap[l.id]) {
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

        // Use a temporary processor to simulate this scenario's impact
        const tempProcessorForDebt = new FinancialDataProcessor(this.transactions, this.assets, liabilitiesWithAcceleratedPayments, this.goals, this.userProfile);
        const debtProjections = tempProcessorForDebt.generateFutureProjections(years, debtRepaymentScenario, [], false);
        const debtFocusNetWorth = debtProjections[debtRepaymentScenario.id]?.[debtProjections[debtRepaymentScenario.id].length - 1]?.projectionRealisticNetWorth || 0;
        
        rationale.push(`- ${debtRepaymentScenario.name} over ${years} years (using $${availableMonthlyCashFlow.toLocaleString()} for acceleration): $${debtFocusNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}. ${debtOptimization.rationale[0]}`);

        if (debtFocusNetWorth > bestNetWorth) {
            bestNetWorth = debtFocusNetWorth;
            bestScenarioId = debtRepaymentScenario.id;
            bestScenarioName = debtRepaymentScenario.name;
            this.logger.log(LogLevel.INFO, `Debt Focus Strategy yielded a new best net worth: $${debtFocusNetWorth.toFixed(2)}.`);
        }

        // Strategy 3: Maximize Investment with availableMonthlyCashFlow
        // This strategy assumes minimal payments on debt (default minimums) and directs all additional cash flow to investment.
        const assetAllocation = this.optimizeAssetAllocation(years);
        
        const investmentFocusScenario: ScenarioParameters = {
            id: 'investment_focus_scenario',
            name: 'Investment Focus Strategy',
            description: 'Prioritize investing all additional monthly cash flow into a diversified portfolio.',
            monthlySavingsAdjustment: availableMonthlyCashFlow, // All cash flow goes to savings/investment
        };
        const investmentProjections = this.financialProcessor.generateFutureProjections(years, investmentFocusScenario, [], false);
        const investmentFocusNetWorth = investmentProjections[investmentFocusScenario.id]?.[investmentProjections[investmentFocusScenario.id].length - 1]?.projectionRealisticNetWorth || 0;
        
        rationale.push(`- ${investmentFocusScenario.name} over ${years} years (investing $${availableMonthlyCashFlow.toLocaleString()} monthly): $${investmentFocusNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
        rationale.push(`  Recommended asset allocation for this strategy: ${assetAllocation.recommendedAllocation.map(a => `${a.assetType} ${(a.percentage * 100).toFixed(0)}%`).join(', ')}.`);


        if (investmentFocusNetWorth > bestNetWorth) {
            bestNetWorth = investmentFocusNetWorth;
            bestScenarioId = investmentFocusScenario.id;
            bestScenarioName = investmentFocusScenario.name;
            this.logger.log(LogLevel.INFO, `Investment Focus Strategy yielded a new best net worth: $${investmentFocusNetWorth.toFixed(2)}.`);
        }

        // Strategy 4: Balanced Approach (e.g., 50/50 split of cash flow or based on a heuristic)
        // This strategy seeks a middle ground, balancing debt reduction with investment growth.
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
        const balancedNetWorth = balancedProjections[balancedScenario.id]?.[balancedProjections[balancedScenario.id].length - 1]?.projectionRealisticNetWorth || 0;

        rationale.push(`- ${balancedScenario.name} over ${years} years (using $${balancedDebtPaymentBudget.toLocaleString()} for debt and $${balancedInvestmentBudget.toLocaleString()} for investment): $${balancedNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);

        if (balancedNetWorth > bestNetWorth) {
            bestNetWorth = balancedNetWorth;
            bestScenarioId = balancedScenario.id;
            bestScenarioName = balancedScenario.name;
            this.logger.log(LogLevel.INFO, `Balanced Strategy yielded a new best net worth: $${balancedNetWorth.toFixed(2)}.`);
        }


        if (bestScenarioId) {
            rationale.push(`\nConclusion: The **${bestScenarioName}** strategy is projected to yield the highest net worth of $${bestNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })} over ${years} years.`);
            rationale.push("Consider this strategy as a strong recommendation, but always review the underlying assumptions and adapt to your personal circumstances and market changes.");
            this.logger.log(LogLevel.INFO, `Overall optimal strategy identified: ${bestScenarioName} with projected net worth: $${bestNetWorth.toFixed(2)}.`);
        } else {
            rationale.push("Could not determine an optimal strategy. Ensure you have financial data and an available cash flow for analysis.");
            this.logger.log(LogLevel.ERROR, "Failed to identify an optimal wealth maximization strategy.");
        }

        return {
            optimizedScenarioId: bestScenarioId,
            optimizedScenarioName: bestScenarioName,
            projectedNetWorth: bestNetWorth,
            rationale
        };
    }

    /**
     * Executes recommended financial actions using integrated payment rails and agentic systems.
     * This function embodies the "act" phase of an agentic system, transforming optimized financial plans
     * into real-world transactions. It facilitates automated execution, leveraging token rails for
     * atomic settlements and digital identity for secure authorization, thereby enabling
     * real-time, programmable money movement.
     * @param actions A list of actions to execute, e.g., debt payments, investment contributions.
     * @param digitalIdentity The digital identity for authorizing transactions.
     * @param paymentEngine The payment engine to route and settle transactions.
     * @param tokenLedger The token ledger for recording stablecoin transactions.
     * @returns A summary of executed actions and their status.
     */
    public async executeOptimizedActions(
        actions: FinancialAction[],
        digitalIdentity: DigitalIdentity,
        paymentEngine: PaymentEngine,
        tokenLedger: TokenLedger // Pass ledger for direct interaction or settlement details
    ): Promise<FinancialActionExecutionResult> {
        this.logger.log(LogLevel.INFO, `Attempting to execute ${actions.length} optimized financial actions.`);
        const results: { action: FinancialAction; status: 'success' | 'failed'; message: string; settlementTx?: SettlementTransaction }[] = [];

        for (const action of actions) {
            this.logger.log(LogLevel.DEBUG, `Processing action: ${action.type} for target ${action.targetId} with amount ${action.amount}.`);
            try {
                // Example: Authorize payment using digital identity
                const transactionPayload = {
                    sourceAccountId: this.userProfile.id, // Assuming userProfile ID is source
                    destinationAccountId: action.targetId,
                    amount: action.amount,
                    currency: this.userProfile.currency,
                    actionType: action.type,
                    timestamp: new Date().toISOString(),
                    metadata: { optimizerRunId: 'auto-generated-id' } // Link to optimization run
                };

                // Sign the transaction with the user's digital identity
                const signedPayload = await digitalIdentity.signData(JSON.stringify(transactionPayload));
                
                // Route payment through the payment engine
                // PaymentEngine will interact with TokenLedger (simulated or real)
                const paymentResult = await paymentEngine.processPayment({
                    id: `OPT-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`, // Idempotency key
                    payerIdentityId: digitalIdentity.getIdentityId(),
                    payeeAccountId: action.targetId, // Example: Liability ID or Investment account ID
                    amount: action.amount,
                    currency: this.userProfile.currency,
                    description: `Optimized financial action: ${action.type}`,
                    signedData: signedPayload // Include signed payload for verification
                });

                if (paymentResult.success) {
                    this.logger.log(LogLevel.INFO, `Successfully executed action ${action.type} for ${action.targetId}.`);
                    results.push({
                        action,
                        status: 'success',
                        message: `Payment successful via rail: ${paymentResult.railUsed}`,
                        settlementTx: paymentResult.settlementTransaction // The actual token rail transaction
                    });
                    // After successful payment, potentially update local state (e.g., liability balance)
                    this.updateFinancialStateAfterAction(action);
                } else {
                    this.logger.log(LogLevel.ERROR, `Failed to execute action ${action.type} for ${action.targetId}: ${paymentResult.errorMessage}`);
                    results.push({
                        action,
                        status: 'failed',
                        message: `Payment failed: ${paymentResult.errorMessage}`
                    });
                }
            } catch (error: any) {
                this.logger.log(LogLevel.ERROR, `Error during execution of action ${action.type} for ${action.targetId}: ${error.message}`);
                results.push({
                    action,
                    status: 'failed',
                    message: `Exception during execution: ${error.message}`
                });
            }
        }
        this.logger.log(LogLevel.INFO, `Finished executing optimized actions. ${results.filter(r => r.status === 'success').length} successful, ${results.filter(r => r.status === 'failed').length} failed.`);
        return {
            overallStatus: results.every(r => r.status === 'success') ? 'complete' : 'partial_failure',
            actionResults: results
        };
    }

    /**
     * Updates the internal financial state (assets, liabilities, goals) based on a successfully executed action.
     * This ensures the optimizer's data accurately reflects real-world changes.
     * @param action The financial action that was executed.
     */
    private updateFinancialStateAfterAction(action: FinancialAction): void {
        switch (action.type) {
            case 'debt_payment':
                const liability = this.liabilities.find(l => l.id === action.targetId);
                if (liability) {
                    liability.currentBalance = Math.max(0, liability.currentBalance - action.amount);
                    this.logger.log(LogLevel.DEBUG, `Updated liability ${liability.id} balance to ${liability.currentBalance}.`);
                }
                break;
            case 'investment_contribution':
                const asset = this.assets.find(a => a.id === action.targetId);
                if (asset) {
                    asset.currentValue = (asset.currentValue || 0) + action.amount;
                    this.logger.log(LogLevel.DEBUG, `Updated asset ${asset.id} value to ${asset.currentValue}.`);
                } else {
                    // If targetId is not an existing asset, it might be a new investment allocation
                    // For simplicity, we can log this or create a new 'other' asset
                    this.logger.log(LogLevel.WARN, `Investment contribution to unknown asset targetId: ${action.targetId}. Consider creating a new asset or updating a portfolio.`);
                    // A more robust implementation would distribute this into existing asset categories based on allocation strategy
                }
                break;
            case 'goal_contribution':
                const goal = this.goals.find(g => g.id === action.targetId);
                if (goal) {
                    goal.currentProgress = (goal.currentProgress || 0) + action.amount;
                    this.logger.log(LogLevel.DEBUG, `Updated goal ${goal.id} progress to ${goal.currentProgress}.`);
                }
                break;
            default:
                this.logger.log(LogLevel.WARN, `Unhandled action type for state update: ${action.type}`);
        }
        // Re-initialize financialProcessor to ensure it uses the updated data for subsequent calls
        this.financialProcessor = new FinancialDataProcessor(this.transactions, this.assets, this.liabilities, this.goals, this.userProfile);
    }
}

/**
 * Defines a financial action that can be executed by the optimizer.
 * This structure allows for a standardized way to represent proposed financial movements.
 */
export interface FinancialAction {
    type: 'debt_payment' | 'investment_contribution' | 'goal_contribution';
    targetId: string; // The ID of the liability, asset, or goal
    amount: number;
    description?: string;
}

/**
 * Represents the result of executing a batch of financial actions.
 * Provides a clear audit trail and status for each action.
 */
export interface FinancialActionExecutionResult {
    overallStatus: 'complete' | 'partial_failure' | 'failed';
    actionResults: {
        action: FinancialAction;
        status: 'success' | 'failed';
        message: string;
        settlementTx?: SettlementTransaction; // Link to the actual settlement transaction on the token rail
    }[];
}

// Export any new types or interfaces
export { FinancialAction, FinancialActionExecutionResult };
```