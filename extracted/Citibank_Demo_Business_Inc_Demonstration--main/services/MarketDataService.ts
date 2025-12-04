/**
 * This module, `MarketDataService`, is a cornerstone of the financial intelligence platform, providing
 * both historical and projected market data crucial for agentic AI decision-making, risk management,
 * and personalized financial product delivery. Business value: It enables predictive analytics and
 * proactive risk mitigation strategies, allowing AI agents to optimize investment portfolios,
 * identify market opportunities, and protect against adverse economic shifts. By simulating
 * diverse economic scenarios and detecting anomalies, this service empowers the platform to deliver
 * superior financial outcomes, drive new revenue streams through advanced advisory capabilities,
 * and provide a competitive advantage in a volatile market. Its deterministic simulation capabilities
 * are invaluable for rigorous testing and validation of agent strategies, ensuring reliability and
 * compliance in a high-stakes financial environment.
 */

/**
 * Interface defining the structure for a single point of market data.
 * This comprehensive set of indicators supports sophisticated financial modeling and risk assessment.
 */
export interface MarketData {
    date: string;
    indexS_P500: number;
    inflationRateMonthly: number; // Monthly
    interestRateFED: number;
    economicSentimentIndex: number;
    unemploymentRate?: number;
    gdpGrowthRate?: number; // Quarterly/Annual
    volatilityIndexVIX?: number; // Market volatility indicator
    treasuryYield10Y?: number; // 10-Year Treasury Bond Yield
    commodityPriceIndex?: number; // General commodity price level
    consumerConfidenceIndex?: number; // Consumer outlook on the economy
}

/**
 * Interface defining a user's financial profile, used for personalized market data projections
 * and financial planning.
 */
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

/**
 * Interface for representing a detected anomaly in market data, crucial for agentic AI's
 * monitoring and remediation skills.
 */
export interface MarketDataAnomaly {
    date: string;
    type: 'S&P_DIP' | 'VIX_SPIKE' | 'HIGH_INFLATION' | 'LOW_SENTIMENT' | 'OTHER';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    dataPoint: MarketData;
}

/**
 * `SeededRandom` implements a simple Linear Congruential Generator (LCG)
 * to provide a deterministic sequence of pseudo-random numbers. This is critical
 * for ensuring reproducible simulations and test outcomes, which is a key
 * commercial-grade requirement for validating agentic AI behaviors and financial models.
 * Business value: Guarantees auditability and testability of complex financial
 * simulations, reducing development and QA cycles and increasing trust in automated systems.
 */
export class SeededRandom {
    private seed: number;
    private readonly M: number = 2147483647; // A common prime modulus (2^31 - 1)
    private readonly A: number = 16807;      // Multiplier (Park-Miller)
    private readonly C: number = 0;           // Increment (standard LCG)

    constructor(seed: number) {
        this.seed = seed % this.M;
        if (this.seed <= 0) this.seed += (this.M - 1); // Ensure seed is positive
    }

    /**
     * Generates the next pseudo-random number in the sequence (between 0 and 1, exclusive).
     * @returns A float between 0 (inclusive) and 1 (exclusive).
     */
    next(): number {
        this.seed = (this.A * this.seed + this.C) % this.M;
        return this.seed / this.M;
    }

    /**
     * Generates a random integer within a specified range [min, max].
     * @param min The minimum value (inclusive).
     * @param max The maximum value (inclusive).
     * @returns A random integer.
     */
    nextInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}

/**
 * Manages fetching, generating, and processing historical and projected market data.
 * This service is a critical component for AI agents to make informed decisions,
 * perform risk assessments, and generate financial projections. It provides a robust
 * simulation of market dynamics, enabling comprehensive testing and validation of
 * complex financial strategies without reliance on external APIs, ensuring
 * operational continuity and data integrity.
 * Business value: Accelerates development and testing cycles for new financial products,
 * supports advanced agentic AI capabilities for portfolio optimization and anomaly
 * detection, and provides a resilient foundation for real-time financial insights.
 */
export class MarketDataService {
    private static historicalData: MarketData[] = [];
    private static initialized: boolean = false;
    private static _random: SeededRandom = new SeededRandom(Date.now()); // Default seed

    /**
     * Sets the seed for deterministic market data generation, critical for reproducible tests
     * and simulations of agentic AI behavior and financial model validation.
     * @param seed The numeric seed to use for pseudo-random number generation.
     */
    public static setSimulationSeed(seed: number): void {
        MarketDataService._random = new SeededRandom(seed);
        // Re-initialize data if already initialized to apply new seed
        if (MarketDataService.initialized) {
            MarketDataService.historicalData = [];
            MarketDataService.initialized = false;
            MarketDataService.initializeData();
        }
        console.log(`MarketDataService: Simulation seed set to ${seed}.`);
    }

    /**
     * Initializes the static historical data array with simulated financial market data.
     * This method ensures that the service is always ready with a robust dataset for analysis.
     * The simulation generates data spanning multiple decades, incorporating cyclical trends,
     * volatility, and various economic indicators to mimic real-world market complexity.
     */
    private static initializeData(): void {
        if (MarketDataService.initialized) return;

        const startDate = new Date();
        const numMonths = 480; // Simulate 40 years of monthly market data for extensive historical context

        for (let i = 0; i < numMonths; i++) {
            const date = new Date(startDate);
            date.setMonth(startDate.getMonth() - i);
            const year = date.getFullYear();
            const month = date.getMonth();

            // Simulate long-term growth with cycles and noise
            const indexS_P = 2500 + (Math.sin(i / 36) * 2000) + (Math.cos(i / 120) * 1000) + (i * 30) + (MarketDataService._random.next() * 800 - 400);

            // Simulate inflation with cycles
            const inflationMonthly = 0.0015 + (Math.sin(i / 48) * 0.001) + (Math.cos(i / 18) * 0.0005) + (MarketDataService._random.next() * 0.0008);

            // Simulate FED rate following inflation and sentiment
            const fedRate = 0.0005 + (Math.sin(i / 60) * 0.001) + (inflationMonthly * 0.5) + (MarketDataService._random.next() * 0.0005);

            // Economic sentiment index
            const sentiment = 45 + (Math.sin(i / 24) * 40) + (Math.cos(i / 72) * 20) + (MarketDataService._random.next() * 20 - 10);

            // Unemployment rate (inverse to sentiment/GDP generally)
            const unemployment = 0.04 + (Math.sin(i / 30) * 0.025) - (sentiment / 2000) + (MarketDataService._random.next() * 0.015 - 0.005);

            // GDP Growth Rate
            const gdpGrowth = 0.004 + (Math.cos(i / 20) * 0.003) + (Math.sin(i / 80) * 0.002) + (MarketDataService._random.next() * 0.003 - 0.0015);

            // VIX - volatility (inverse to S&P generally, direct to fear)
            const vix = 12 + (Math.cos(i / 15) * 10) + (indexS_P < 3000 ? (3000 - indexS_P) / 100 : 0) + (MarketDataService._random.next() * 8 - 4);

            // 10-Year Treasury Yield (influenced by FED rate and inflation)
            const treasuryYield = 0.01 + (fedRate * 0.8) + (inflationMonthly * 2) + (MarketDataService._random.next() * 0.01 - 0.005);

            // Commodity Price Index
            const commodityIndex = 100 + (Math.sin(i / 40) * 30) + (inflationMonthly * 5000) + (MarketDataService._random.next() * 15 - 7.5);

            // Consumer Confidence Index (similar to economic sentiment)
            const consumerConfidence = 80 + (Math.sin(i / 22) * 25) + (Math.cos(i / 68) * 15) + (MarketDataService._random.next() * 10 - 5);

            MarketDataService.historicalData.push({
                date: new Date(year, month, 1).toISOString().split('T')[0],
                indexS_P500: Math.max(1000, indexS_P),
                inflationRateMonthly: Math.max(0.0001, inflationMonthly), // Min 0.01% monthly
                interestRateFED: Math.max(0.0001, fedRate), // Min 0.01%
                economicSentimentIndex: Math.max(0, Math.min(100, sentiment)),
                unemploymentRate: Math.max(0.01, Math.min(0.15, unemployment)),
                gdpGrowthRate: gdpGrowth,
                volatilityIndexVIX: Math.max(5, vix),
                treasuryYield10Y: Math.max(0.001, treasuryYield),
                commodityPriceIndex: Math.max(50, commodityIndex),
                consumerConfidenceIndex: Math.max(30, Math.min(150, consumerConfidence))
            });
        }
        MarketDataService.historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        MarketDataService.initialized = true;
        console.log(`MarketDataService: Initialized ${MarketDataService.historicalData.length} historical data points.`);
    }

    /**
     * Retrieves historical market data within a specified date range.
     * Essential for backtesting strategies and understanding past market performance.
     * @param startDate Optional start date for the data range (ISO string).
     * @param endDate Optional end date for the data range (ISO string).
     * @returns An array of `MarketData` objects.
     */
    public static getHistoricalData(startDate?: string, endDate?: string): MarketData[] {
        MarketDataService.initializeData();
        let data = MarketDataService.historicalData;

        if (startDate && new Date(startDate).toString() === 'Invalid Date') {
            console.error(`MarketDataService: Invalid startDate provided: ${startDate}`);
            throw new Error('Invalid start date format.');
        }
        if (endDate && new Date(endDate).toString() === 'Invalid Date') {
            console.error(`MarketDataService: Invalid endDate provided: ${endDate}`);
            throw new Error('Invalid end date format.');
        }

        if (startDate) {
            const start = new Date(startDate);
            data = data.filter(d => new Date(d.date) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            data = data.filter(d => new Date(d.date) <= end);
        }
        console.log(`MarketDataService: Retrieved ${data.length} historical data points.`);
        return data;
    }

    /**
     * Returns the latest available market data point, providing agents with the most
     * current snapshot of market conditions.
     * @returns The most recent `MarketData` object.
     */
    public static getLatestMarketData(): MarketData | undefined {
        MarketDataService.initializeData();
        return MarketDataService.historicalData.length > 0
            ? MarketDataService.historicalData[MarketDataService.historicalData.length - 1]
            : undefined;
    }

    /**
     * Calculates the average monthly inflation rate over a specified period.
     * This metric is vital for financial planning, particularly for long-term
     * investment and retirement planning.
     * @param periodMonths The number of past months to consider for the average.
     * @returns The average monthly inflation rate.
     */
    public static getAverageInflationRateMonthly(periodMonths: number = 12): number {
        MarketDataService.initializeData();
        const relevantData = MarketDataService.historicalData.slice(-periodMonths);
        if (relevantData.length === 0) {
            console.warn('MarketDataService: No historical data available for inflation average, returning default.');
            return 0.0025; // Default to 0.25% monthly if no data (3% annual)
        }
        const sumInflation = relevantData.reduce((sum, d) => sum + d.inflationRateMonthly, 0);
        return sumInflation / relevantData.length;
    }

    /**
     * Projects the monthly inflation rate based on user expectations or historical averages.
     * This personalization is crucial for tailored financial advice and investment strategies.
     * @param userProfile The user's profile containing their inflation expectation.
     * @returns The projected monthly inflation rate.
     */
    public static getProjectedInflationRateMonthly(userProfile: UserProfile): number {
        const annualExpectation = userProfile.inflationExpectation;
        if (annualExpectation !== undefined && annualExpectation !== null) {
            return annualExpectation / 1200; // Convert annual percentage to monthly decimal
        }
        console.log('MarketDataService: User inflation expectation not available, using historical average for projection.');
        return MarketDataService.getAverageInflationRateMonthly();
    }

    /**
     * Generates projected market data for a specified number of years into the future,
     * building upon current market conditions and user-specific expectations. This
     * enables scenario analysis, long-term financial planning, and risk modeling
     * for agentic AI systems.
     * Business value: Provides foresight, enabling strategic decision-making and
     * optimized resource allocation in future market environments.
     * @param userProfile The user's profile to personalize projections.
     * @param projectionYears The number of years to project forward.
     * @param startDate Optional starting date for projections. If not provided, uses latest historical data date.
     * @returns An array of projected `MarketData` objects.
     */
    public static getProjectedMarketData(userProfile: UserProfile, projectionYears: number, startDate?: string): MarketData[] {
        MarketDataService.initializeData();
        const projections: MarketData[] = [];
        const numMonths = projectionYears * 12;

        let lastData: MarketData | undefined;
        if (startDate) {
            const historical = MarketDataService.getHistoricalData(undefined, startDate);
            lastData = historical[historical.length - 1];
            if (!lastData) {
                console.warn(`MarketDataService: No historical data found up to ${startDate}, using latest available.`);
                lastData = MarketDataService.getLatestMarketData();
            }
        } else {
            lastData = MarketDataService.getLatestMarketData();
        }

        if (!lastData) {
            console.error('MarketDataService: Cannot generate projections without any historical data.');
            return [];
        }

        let currentDate = new Date(lastData.date);

        const annualInflationExpectation = userProfile.inflationExpectation / 100; // Annual decimal
        const avgHistoricalSPGrowth = MarketDataService.calculateAverageSPGrowth(120); // Last 10 years
        const avgHistoricalVIX = MarketDataService.calculateAverageVIX(120);
        const avgHistoricalTreasuryYield = MarketDataService.calculateAverageTreasuryYield(120);

        for (let i = 0; i < numMonths; i++) {
            currentDate.setMonth(currentDate.getMonth() + 1);
            const nextMonthDate = currentDate.toISOString().split('T')[0];

            // Project S&P 500: Blend historical growth, user risk tolerance, and random walk
            let projectedSP = lastData.indexS_P500 * (1 + (avgHistoricalSPGrowth / 12) * (1 + (userProfile.riskTolerance === 'aggressive' ? 0.02 : userProfile.riskTolerance === 'high' ? 0.01 : userProfile.riskTolerance === 'medium' ? 0 : -0.01)));
            projectedSP += (MarketDataService._random.next() - 0.5) * (projectedSP * 0.015); // Monthly noise

            // Project Inflation: User expectation with noise
            let projectedInflationMonthly = annualInflationExpectation / 12;
            projectedInflationMonthly += (MarketDataService._random.next() - 0.5) * 0.001; // Noise
            projectedInflationMonthly = Math.max(0.0005, projectedInflationMonthly);

            // Project FED Rate: Lag inflation, influenced by sentiment
            let projectedFEDRate = lastData.interestRateFED + (projectedInflationMonthly - lastData.inflationRateMonthly) * 0.5;
            projectedFEDRate += (MarketDataService._random.next() - 0.5) * 0.0005;
            projectedFEDRate = Math.max(0.0001, projectedFEDRate);

            // Project Sentiment: Trend towards recent average, with noise
            let projectedSentiment = lastData.economicSentimentIndex + (MarketDataService._random.next() - 0.5) * 5;
            projectedSentiment = Math.max(0, Math.min(100, projectedSentiment));

            // Project VIX: Revert to mean, inversely related to S&P movement
            let projectedVIX = lastData.volatilityIndexVIX || avgHistoricalVIX;
            projectedVIX = (projectedVIX + avgHistoricalVIX) / 2; // Revert to mean
            projectedVIX += (MarketDataService._random.next() - 0.5) * 3;
            if (projectedSP < lastData.indexS_P500) projectedVIX += 2 * MarketDataService._random.next(); // Spike on downturn
            projectedVIX = Math.max(10, projectedVIX);

            // Project 10Y Treasury: Follows FED rate and inflation, with noise
            let projectedTreasuryYield = (lastData.treasuryYield10Y || avgHistoricalTreasuryYield) + (projectedFEDRate - lastData.interestRateFED) * 0.7;
            projectedTreasuryYield += (projectedInflationMonthly - lastData.inflationRateMonthly) * 1.5;
            projectedTreasuryYield += (MarketDataService._random.next() - 0.5) * 0.005;
            projectedTreasuryYield = Math.max(0.005, projectedTreasuryYield);


            const newMarketData: MarketData = {
                date: nextMonthDate,
                indexS_P500: projectedSP,
                inflationRateMonthly: projectedInflationMonthly,
                interestRateFED: projectedFEDRate,
                economicSentimentIndex: projectedSentiment,
                unemploymentRate: undefined, // Simpler projection for core metrics
                gdpGrowthRate: undefined,
                volatilityIndexVIX: projectedVIX,
                treasuryYield10Y: projectedTreasuryYield,
                commodityPriceIndex: undefined,
                consumerConfidenceIndex: undefined,
            };
            projections.push(newMarketData);
            lastData = newMarketData;
        }
        console.log(`MarketDataService: Generated ${projections.length} months of market data projections.`);
        return projections;
    }

    /**
     * Detects significant anomalies in recent market data, crucial for triggering
     * agentic AI's anomaly detection and remediation workflows. This function
     * simulates real-time risk monitoring, identifying deviations that could
     * signal market distress or opportunities.
     * Business value: Enables proactive risk management, fraud detection (when combined with transaction data),
     * and rapid response to critical market shifts, safeguarding assets and optimizing
     * investment performance.
     * @param lookbackMonths The number of recent months to analyze for anomalies.
     * @param thresholdFactor A multiplier for standard deviation to define an anomaly threshold.
     * @returns An array of detected `MarketDataAnomaly` objects.
     */
    public static detectMarketAnomalies(lookbackMonths: number = 24, thresholdFactor: number = 2.0): MarketDataAnomaly[] {
        MarketDataService.initializeData();
        const anomalies: MarketDataAnomaly[] = [];
        const recentData = MarketDataService.historicalData.slice(-lookbackMonths);

        if (recentData.length < 2) {
            return anomalies; // Need at least two data points to compare
        }

        const latest = recentData[recentData.length - 1];
        const previous = recentData[recentData.length - 2];

        // --- S&P 500 Anomaly ---
        if (latest.indexS_P500 && previous.indexS_P500) {
            const spChange = (latest.indexS_P500 - previous.indexS_P500) / previous.indexS_P500;
            const spChanges = recentData.slice(0, -1).map((d, idx) => (recentData[idx + 1].indexS_P500 - d.indexS_P500) / d.indexS_P500);
            const spMean = spChanges.reduce((sum, val) => sum + val, 0) / spChanges.length;
            const spStdDev = Math.sqrt(spChanges.map(val => (val - spMean) ** 2).reduce((sum, val) => sum + val, 0) / spChanges.length);

            if (spChange < spMean - thresholdFactor * spStdDev && spChange < -0.05) { // Significant drop, e.g., >5%
                anomalies.push({
                    date: latest.date,
                    type: 'S&P_DIP',
                    description: `Significant S&P 500 drop detected: ${spChange * 100}% in one month.`,
                    severity: 'high',
                    dataPoint: latest
                });
            }
        }

        // --- VIX Spike Anomaly ---
        if (latest.volatilityIndexVIX && previous.volatilityIndexVIX) {
            const vixChange = latest.volatilityIndexVIX - previous.volatilityIndexVIX;
            const vixValues = recentData.map(d => d.volatilityIndexVIX || 0); // Handle undefined
            const vixMean = vixValues.reduce((sum, val) => sum + val, 0) / vixValues.length;
            const vixStdDev = Math.sqrt(vixValues.map(val => (val - vixMean) ** 2).reduce((sum, val) => sum + val, 0) / vixValues.length);

            if (vixChange > thresholdFactor * vixStdDev && vixChange > 5 && latest.volatilityIndexVIX > 25) { // VIX spike, e.g., >5 points and over 25 total
                anomalies.push({
                    date: latest.date,
                    type: 'VIX_SPIKE',
                    description: `Volatility Index (VIX) spiked by ${vixChange.toFixed(2)} points to ${latest.volatilityIndexVIX!.toFixed(2)}.`,
                    severity: 'critical',
                    dataPoint: latest
                });
            }
        }

        // --- High Inflation Anomaly ---
        if (latest.inflationRateMonthly) {
            const historicalInflation = recentData.map(d => d.inflationRateMonthly);
            const inflationMean = historicalInflation.reduce((sum, val) => sum + val, 0) / historicalInflation.length;
            const inflationStdDev = Math.sqrt(historicalInflation.map(val => (val - inflationMean) ** 2).reduce((sum, val) => sum + val, 0) / historicalInflation.length);

            if (latest.inflationRateMonthly > inflationMean + thresholdFactor * inflationStdDev && latest.inflationRateMonthly > 0.005) { // Monthly inflation > 0.5%
                anomalies.push({
                    date: latest.date,
                    type: 'HIGH_INFLATION',
                    description: `Monthly inflation rate is significantly high at ${ (latest.inflationRateMonthly * 100).toFixed(2)}%.`,
                    severity: 'medium',
                    dataPoint: latest
                });
            }
        }

        // --- Low Economic Sentiment Anomaly ---
        if (latest.economicSentimentIndex && previous.economicSentimentIndex) {
            const sentimentChange = latest.economicSentimentIndex - previous.economicSentimentIndex;
            const sentimentValues = recentData.map(d => d.economicSentimentIndex || 0);
            const sentimentMean = sentimentValues.reduce((sum, val) => sum + val, 0) / sentimentValues.length;
            const sentimentStdDev = Math.sqrt(sentimentValues.map(val => (val - sentimentMean) ** 2).reduce((sum, val) => sum + val, 0) / sentimentValues.length);

            if (sentimentChange < sentimentMean - thresholdFactor * sentimentStdDev && latest.economicSentimentIndex < 40) { // Sentiment significantly low or dropping fast
                anomalies.push({
                    date: latest.date,
                    type: 'LOW_SENTIMENT',
                    description: `Economic sentiment index dropped to ${latest.economicSentimentIndex.toFixed(0)}.`,
                    severity: 'low',
                    dataPoint: latest
                });
            }
        }

        if (anomalies.length > 0) {
            console.warn(`MarketDataService: Detected ${anomalies.length} market anomalies.`);
        }
        return anomalies;
    }

    /**
     * Simulates a real-time stream of market data updates, continuously pushing the latest
     * or next projected data point. This functionality is vital for agentic AI systems
     * requiring live data feeds to react dynamically to market changes, enabling
     * real-time trading strategies and immediate risk alerts.
     * Business value: Facilitates development and testing of ultra-low-latency financial
     * applications, providing a robust, configurable environment for validating real-time
     * agent behaviors.
     * @param callback A function to call with each new `MarketData` update.
     * @param intervalMs The interval in milliseconds between data pushes.
     * @param maxUpdates The maximum number of updates to send before stopping the stream.
     * @returns A function to stop the simulated stream.
     */
    public static simulateRealtimeStream(callback: (data: MarketData) => void, intervalMs: number = 5000, maxUpdates: number = 100): () => void {
        MarketDataService.initializeData();
        let currentIndex = MarketDataService.historicalData.length - 1;
        let updateCount = 0;
        console.log(`MarketDataService: Starting simulated real-time market data stream every ${intervalMs}ms.`);

        const intervalId = setInterval(() => {
            if (updateCount >= maxUpdates) {
                clearInterval(intervalId);
                console.log('MarketDataService: Simulated real-time stream stopped (max updates reached).');
                return;
            }

            // For simulation, either send latest historical or project next month's data
            let dataToSend: MarketData;
            if (currentIndex < MarketDataService.historicalData.length -1) {
                // If there's more historical data to "catch up" with (e.g., if stream started mid-history)
                currentIndex++;
                dataToSend = MarketDataService.historicalData[currentIndex];
            } else {
                // Otherwise, project the next month's data
                const userProfile: UserProfile = { // A default profile for general projection
                    id: 'sim-user', name: 'Simulator', dob: '1980-01-01', riskTolerance: 'medium',
                    inflationExpectation: MarketDataService.getAverageInflationRateMonthly() * 1200, // Annualize monthly avg
                    taxRateIncome: 0.25, taxRateCapitalGains: 0.15, savingsRateTarget: 0.1,
                    retirementAge: 65, lifeExpectancy: 85, desiredRetirementIncome: 80000,
                    investmentHorizonYears: 30
                };
                const projected = MarketDataService.getProjectedMarketData(userProfile, 1, MarketDataService.getLatestMarketData()?.date);
                if (projected.length > 0) {
                    dataToSend = projected[0];
                    // Append to historical for consistency (optional, depends on use case)
                    MarketDataService.historicalData.push(dataToSend);
                } else {
                    console.error('MarketDataService: Failed to generate next projected data point for stream.');
                    return;
                }
            }

            console.log(`MarketDataService: Streaming update #${updateCount + 1} for date ${dataToSend.date}. S&P: ${dataToSend.indexS_P500.toFixed(2)}, VIX: ${dataToSend.volatilityIndexVIX?.toFixed(2)}`);
            callback(dataToSend);
            updateCount++;
        }, intervalMs);

        return () => {
            clearInterval(intervalId);
            console.log('MarketDataService: Simulated real-time stream manually stopped.');
        };
    }

    /**
     * Helper to calculate average S&P 500 growth rate over a period.
     * @param lookbackMonths
     * @returns
     */
    private static calculateAverageSPGrowth(lookbackMonths: number): number {
        const data = MarketDataService.historicalData.slice(-lookbackMonths);
        if (data.length < 2) return 0.005; // Default annual growth if not enough data
        const firstSP = data[0].indexS_P500;
        const lastSP = data[data.length - 1].indexS_P500;
        return (Math.pow(lastSP / firstSP, 12 / data.length) - 1); // Annualized monthly growth
    }

    /**
     * Helper to calculate average VIX over a period.
     * @param lookbackMonths
     * @returns
     */
    private static calculateAverageVIX(lookbackMonths: number): number {
        const data = MarketDataService.historicalData.slice(-lookbackMonths);
        if (data.length === 0) return 20; // Default VIX
        const sumVIX = data.reduce((sum, d) => sum + (d.volatilityIndexVIX || 0), 0);
        return sumVIX / data.length;
    }

    /**
     * Helper to calculate average 10Y Treasury Yield over a period.
     * @param lookbackMonths
     * @returns
     */
    private static calculateAverageTreasuryYield(lookbackMonths: number): number {
        const data = MarketDataService.historicalData.slice(-lookbackMonths);
        if (data.length === 0) return 0.02; // Default 10Y Yield
        const sumYield = data.reduce((sum, d) => sum + (d.treasuryYield10Y || 0), 0);
        return sumYield / data.length;
    }
}