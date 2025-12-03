```typescript
import React from 'react'; // Assuming React is available in the scope

/**
 * @namespace TheFinancialInstrumentForge
 * @description A comprehensive suite for the design, analysis, and minting of bespoke financial instruments.
 * This namespace encapsulates the entire lifecycle of a financial product, from blueprint selection to AI-driven risk analysis
 * and final on-chain or off-chain issuance. It serves as a virtual assembly line for financial engineering.
 */
export namespace TheFinancialInstrumentForge {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SECTION 1: CORE DOMAIN MODELS & TYPES
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    /**
     * Defines the high-level classification of a financial product.
     * - **Structured**: Instruments created by combining traditional assets with derivatives.
     * - **Decentralized**: Instruments native to blockchain ecosystems (DeFi).
     * - **Personal**: Instruments tailored for individual needs, like annuities or bespoke loans.
     * - **Insurance**: Products focused on risk mitigation and transfer.
     * - **Alternative**: Investments in non-traditional asset classes like real estate, commodities, or private equity.
     */
    export type FinancialProductClass = "Structured" | "Decentralized" | "Personal" | "Insurance" | "Alternative";

    /**
     * Defines the type of input parameter for an instrument.
     */
    export type ParameterType = "number" | "percentage" | "date" | "select" | "currency" | "boolean" | "asset_picker";

    /**
     * Defines the structure for a configurable parameter within a blueprint.
     */
    export interface IParameterDefinition {
        readonly key: string;
        readonly label: string;
        readonly description: string;
        readonly type: ParameterType;
        readonly defaultValue: any;
        readonly validationRules?: {
            readonly required?: boolean;
            readonly minValue?: number;
            readonly maxValue?: number;
            readonly options?: Array<{ value: string | number; label: string }>;
        };
    }

    /**
     * Represents the foundational template for a financial product.
     * It contains all the immutable properties and rules of a specific type of instrument.
     */
    export interface IProductBlueprint {
        readonly id: string;
        readonly name: string;
        readonly description: string;
        readonly productClass: FinancialProductClass;
        readonly underlyingAssets: string[]; // e.g., ['SPX', 'NDX', 'BTC']
        readonly payoffFormula: string; // A mathematical or logical representation of the payoff
        readonly legalFramework: "ISDA" | "Custom" | "SmartContract";
        readonly jurisdiction: "US" | "EU" | "UK" | "SG" | "Global";
        readonly configurableParameters: IParameterDefinition[];
    }

    /**
     * Represents a user-customized instance of a financial instrument, ready for analysis and minting.
     */
    export interface ICustomInstrument {
        readonly instanceId: string; // Unique ID for this specific instance
        readonly blueprint: IProductBlueprint;
        readonly principal: number;
        readonly termInYears: number;
        readonly riskProfile: "Conservative" | "Moderate" | "Aggressive" | "Speculative";
        readonly customParameters: Record<string, any>;
        readonly investorId: string;
        readonly creationDate: Date;
        status: "Draft" | "Analyzed" | "Minted" | "Matured";
    }

    /**
     * Encapsulates the complete AI-driven analysis of a custom instrument.
     */
    export interface IAIAnalysisResult {
        readonly timestamp: Date;
        readonly risk: {
            summary: string;
            valueAtRisk95: number; // 95% VaR
            expectedShortfall95: number;
            volatility: number;
            sensitivityAnalysis: Record<string, number>; // Greeks: Delta, Gamma, Vega, Theta
        };
        readonly reward: {
            summary: string;
            expectedReturn: number;
            sharpeRatio: number;
            bestCaseScenario: number;
            worstCaseScenario: number;
        };
        readonly suitability: {
            summary: string;
            score: number; // 0-100
            warnings: string[];
        };
        readonly complianceChecks: {
            mifidII: "Pass" | "Fail" | "N/A";
            doddFrank: "Pass" | "Fail" | "N/A";
            localRegs: "Pass" | "Fail" | "N/A";
        };
        readonly simulationData?: {
            payoffDistribution: Array<{ value: number; probability: number }>;
            monteCarloPaths?: number[][];
        };
        readonly backtestResult?: IBacktestResult;
    }

    /**
     * Represents the outcome of a backtesting simulation.
     */
    export interface IBacktestResult {
        readonly period: { start: Date; end: Date };
        readonly strategyReturns: number;
        readonly benchmarkReturns: number; // e.g., S&P 500 returns over the same period
        readonly maxDrawdown: number;
        readonly annualisedSharpeRatio: number;
        readonly summary: string;
    }


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SECTION 2: MOCK SERVICES & DATA PROVIDERS
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    /**
     * @class LoggerService
     * @description A simple singleton for application-wide logging.
     */
    export class LoggerService {
        private static instance: LoggerService;
        private logs: string[] = [];

        private constructor() { }

        public static getInstance(): LoggerService {
            if (!LoggerService.instance) {
                LoggerService.instance = new LoggerService();
            }
            return LoggerService.instance;
        }

        public log(level: 'INFO' | 'WARN' | 'ERROR', message: string, context?: object) {
            const logEntry = `[${new Date().toISOString()}] [${level}] ${message} ${context ? JSON.stringify(context) : ''}`;
            console.log(logEntry);
            this.logs.push(logEntry);
        }

        public getLogs(): string[] {
            return [...this.logs];
        }
    }
    
    /**
     * @class MarketDataService
     * @description Simulates fetching market data required for financial calculations.
     * In a real application, this would connect to APIs like Bloomberg, Reuters, or crypto exchanges.
     */
    export class MarketDataService {
        private logger = LoggerService.getInstance();
        private riskFreeRate: number = 0.05; // 5% risk-free rate (e.g., T-Bill yield)

        constructor() {
            this.logger.log('INFO', 'MarketDataService initialized.');
        }

        public getRiskFreeRate(): number {
            this.logger.log('INFO', 'Fetching risk-free rate.', { rate: this.riskFreeRate });
            return this.riskFreeRate;
        }

        public getAssetData(assetId: string): { price: number; volatility: number; dividendYield: number } {
            this.logger.log('INFO', `Fetching data for asset: ${assetId}`);
            // In a real app, this would be a complex lookup. Here we simulate it.
            switch (assetId) {
                case 'SPX':
                    return { price: 4500, volatility: 0.20, dividendYield: 0.015 };
                case 'NDX':
                    return { price: 15000, volatility: 0.25, dividendYield: 0.008 };
                case 'BTC':
                    return { price: 60000, volatility: 0.80, dividendYield: 0 };
                case 'ETH':
                    return { price: 3000, volatility: 0.95, dividendYield: 0.02 }; // Staking yield
                default:
                    this.logger.log('WARN', `No data for asset ${assetId}. Using fallback.`);
                    return { price: 100, volatility: 0.30, dividendYield: 0.01 };
            }
        }

        public getHistoricalData(assetId: string, years: number): number[] {
            this.logger.log('INFO', `Fetching ${years} years of historical data for ${assetId}.`);
            const data = this.getAssetData(assetId);
            const days = years * 252; // Trading days
            const dailyDrift = (this.riskFreeRate - data.dividendYield - 0.5 * data.volatility ** 2) / 252;
            const dailyStDev = data.volatility / Math.sqrt(252);
            
            let prices: number[] = [data.price];
            let currentPrice = data.price;

            for (let i = 1; i < days; i++) {
                const epsilon = this.standardNormalRandom();
                currentPrice *= Math.exp(dailyDrift + dailyStDev * epsilon);
                prices.push(currentPrice);
            }
            return prices.reverse(); // Simulate from past to present
        }

        // Box-Muller transform to get a standard normal random variable
        private standardNormalRandom(): number {
            let u = 0, v = 0;
            while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
            while(v === 0) v = Math.random();
            return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        }
    }

    /**
     * @class BlueprintService
     * @description Provides the catalog of available financial product blueprints.
     */
    export class BlueprintService {
        private logger = LoggerService.getInstance();
        private blueprints: IProductBlueprint[];

        constructor() {
            this.logger.log('INFO', 'BlueprintService initialized.');
            this.blueprints = this.loadBlueprints();
        }

        public getBlueprints(): IProductBlueprint[] {
            return this.blueprints;
        }

        public getBlueprintById(id: string): IProductBlueprint | undefined {
            return this.blueprints.find(b => b.id === id);
        }

        private loadBlueprints(): IProductBlueprint[] {
            this.logger.log('INFO', 'Loading financial product blueprints from internal catalog.');
            return [
                {
                    id: "ppn_spx_1",
                    name: "Principal Protected Note on S&P 500",
                    description: "A structured product that guarantees the return of principal at maturity while offering participation in the potential upside of the S&P 500 index.",
                    productClass: "Structured",
                    underlyingAssets: ["SPX"],
                    payoffFormula: "Principal + Principal * ParticipationRate * MAX(0, (SPX_Final / SPX_Initial) - 1)",
                    legalFramework: "ISDA",
                    jurisdiction: "US",
                    configurableParameters: [
                        { key: "participationRate", label: "Participation Rate", description: "The percentage of the index's upside the investor captures.", type: "percentage", defaultValue: 0.7, validationRules: { minValue: 0.1, maxValue: 1.5 } },
                        { key: "cap", label: "Upside Cap", description: "The maximum return potential from the index exposure.", type: "percentage", defaultValue: 0.2, validationRules: { minValue: 0.05 } }
                    ]
                },
                {
                    id: "rcn_ndx_1",
                    name: "Reverse Convertible Note on Nasdaq 100",
                    description: "A yield-enhancement product that pays a high coupon. At maturity, if the underlying asset (Nasdaq 100) is above a certain barrier, the principal is returned. Otherwise, the investor receives the depreciated asset.",
                    productClass: "Structured",
                    underlyingAssets: ["NDX"],
                    payoffFormula: "IF(NDX_Final > KnockInBarrier, Principal, Principal * (NDX_Final / NDX_Initial))",
                    legalFramework: "ISDA",
                    jurisdiction: "EU",
                    configurableParameters: [
                        { key: "couponRate", label: "Annual Coupon Rate", description: "The fixed annual interest paid to the investor.", type: "percentage", defaultValue: 0.12, validationRules: { minValue: 0.05, maxValue: 0.25 } },
                        { key: "knockInBarrier", label: "Knock-In Barrier", description: "The price level below which the principal becomes at risk (as a % of initial price).", type: "percentage", defaultValue: 0.75, validationRules: { minValue: 0.5, maxValue: 0.95 } }
                    ]
                },
                {
                    id: "defi_lending_aave_1",
                    name: "Aave Variable Rate Lending Pool",
                    description: "Deposit assets into the Aave protocol to earn a variable interest rate based on market supply and demand for borrowing.",
                    productClass: "Decentralized",
                    underlyingAssets: ["ETH", "USDC", "DAI"],
                    payoffFormula: "Principal * (1 + AverageVariableAPY)^Term",
                    legalFramework: "SmartContract",
                    jurisdiction: "Global",
                    configurableParameters: [
                        { key: "depositAsset", label: "Deposit Asset", description: "The cryptocurrency asset to deposit.", type: "select", defaultValue: "USDC", validationRules: { options: [{ value: 'USDC', label: 'USD Coin' }, { value: 'ETH', label: 'Ethereum' }, { value: 'DAI', label: 'Dai Stablecoin' }] } }
                    ]
                },
                {
                    id: "pra_dynamic_1",
                    name: "Personalized Retirement Annuity",
                    description: "A bespoke annuity product where contributions are invested in a portfolio dynamically adjusted based on the investor's age and risk tolerance.",
                    productClass: "Personal",
                    underlyingAssets: ["VTI", "BND", "GLD"], // Vanguard Total Stock Market, Total Bond Market, Gold ETF
                    payoffFormula: "Complex portfolio growth model with scheduled payouts.",
                    legalFramework: "Custom",
                    jurisdiction: "UK",
                    configurableParameters: [
                        { key: "retirementAge", label: "Target Retirement Age", description: "The age at which payouts will begin.", type: "number", defaultValue: 65, validationRules: { minValue: 50, maxValue: 80 } },
                        { key: "payoutFrequency", label: "Payout Frequency", description: "How often to receive payments in retirement.", type: "select", defaultValue: "monthly", validationRules: { options: [{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }, { value: 'annually', label: 'Annually' }] } }
                    ]
                }
            ];
        }
    }


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SECTION 3: FINANCIAL ENGINEERING AI CORE
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    /**
     * @class TheFinancialEngineerAI
     * @description The core intelligence of the forge. This class is responsible for performing
     * complex quantitative analysis on custom financial instruments.
     */
    export class TheFinancialEngineerAI {
        private readonly marketDataService: MarketDataService;
        private readonly logger: LoggerService;

        constructor(marketDataService: MarketDataService) {
            this.marketDataService = marketDataService;
            this.logger = LoggerService.getInstance();
            this.logger.log('INFO', 'TheFinancialEngineerAI has been activated.');
        }

        /**
         * Main entry point for instrument analysis. Delegates to specific methods based on blueprint ID.
         * @param instrument - The custom instrument to analyze.
         * @returns A comprehensive analysis result object.
         */
        public analyzeInstrument(instrument: ICustomInstrument): IAIAnalysisResult {
            this.logger.log('INFO', `Starting analysis for instrument: ${instrument.instanceId}`, { blueprint: instrument.blueprint.id });

            try {
                let analysisResult: IAIAnalysisResult;
                switch (instrument.blueprint.id) {
                    case "ppn_spx_1":
                        analysisResult = this.analyzePrincipalProtectedNote(instrument);
                        break;
                    case "rcn_ndx_1":
                        analysisResult = this.analyzeReverseConvertibleNote(instrument);
                        break;
                    case "defi_lending_aave_1":
                        analysisResult = this.analyzeDeFiLending(instrument);
                        break;
                    default:
                         return this.getPendingAnalysis(instrument);
                }
                analysisResult = {
                    ...analysisResult,
                    backtestResult: this.backtestStrategy(instrument)
                };
                this.logger.log('INFO', 'Analysis complete.', { instanceId: instrument.instanceId });
                return analysisResult;
            } catch (error) {
                this.logger.log('ERROR', 'An error occurred during instrument analysis.', { error, instanceId: instrument.instanceId });
                return this.getErrorAnalysis(error as Error);
            }
        }

        private getPendingAnalysis(instrument: ICustomInstrument): IAIAnalysisResult {
            return {
                timestamp: new Date(),
                risk: { summary: "Analysis pending for this instrument type.", valueAtRisk95: 0, expectedShortfall95: 0, volatility: 0, sensitivityAnalysis: {} },
                reward: { summary: "Analysis pending.", expectedReturn: 0, sharpeRatio: 0, bestCaseScenario: 0, worstCaseScenario: 0 },
                suitability: { summary: "Analysis pending.", score: 0, warnings: [] },
                complianceChecks: { mifidII: "N/A", doddFrank: "N/A", localRegs: "N/A" }
            };
        }

        private getErrorAnalysis(error: Error): IAIAnalysisResult {
             return {
                timestamp: new Date(),
                risk: { summary: `Analysis failed: ${error.message}`, valueAtRisk95: 0, expectedShortfall95: 0, volatility: 0, sensitivityAnalysis: {} },
                reward: { summary: "Analysis failed.", expectedReturn: 0, sharpeRatio: 0, bestCaseScenario: 0, worstCaseScenario: 0 },
                suitability: { summary: "Analysis failed.", score: 0, warnings: ["Critical error during analysis. Results are invalid."] },
                complianceChecks: { mifidII: "Fail", doddFrank: "Fail", localRegs: "Fail" }
            };
        }

        private runMonteCarloSimulation(
            initialPrice: number,
            termInYears: number,
            riskFreeRate: number,
            volatility: number,
            dividendYield: number,
            numSimulations: number = 10000
        ): { paths: number[][], finalPrices: number[] } {
            const dt = 1 / 252; // Time step per day
            const numSteps = Math.floor(termInYears * 252);
            const drift = (riskFreeRate - dividendYield - 0.5 * volatility * volatility) * dt;
            const diffusion = volatility * Math.sqrt(dt);
            
            const paths: number[][] = [];
            const finalPrices: number[] = [];

            for (let i = 0; i < numSimulations; i++) {
                const path = [initialPrice];
                let currentPrice = initialPrice;
                for (let j = 0; j < numSteps; j++) {
                    const randomShock = this.standardNormalRandom();
                    currentPrice *= Math.exp(drift + diffusion * randomShock);
                    path.push(currentPrice);
                }
                paths.push(path);
                finalPrices.push(currentPrice);
            }

            return { paths, finalPrices };
        }
        
        // Helper from the MarketDataService, duplicated here for internal use
        private standardNormalRandom(): number {
            let u = 0, v = 0;
            while(u === 0) u = Math.random();
            while(v === 0) v = Math.random();
            return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        }

        private analyzePrincipalProtectedNote(instrument: ICustomInstrument): IAIAnalysisResult {
            const assetId = instrument.blueprint.underlyingAssets[0];
            const assetData = this.marketDataService.getAssetData(assetId);
            const riskFreeRate = this.marketDataService.getRiskFreeRate();
            
            const participationRate = instrument.customParameters.participationRate;
            const cap = instrument.customParameters.cap;

            // Bond component valuation (for principal protection)
            const bondValue = instrument.principal / Math.pow(1 + riskFreeRate, instrument.termInYears);
            
            // Option component valuation (for upside)
            const optionBudget = instrument.principal - bondValue;
            // This is a simplification. In reality, we'd use Black-Scholes or similar to price the call option
            // and derive the participation rate or cap from the option budget. Here, we'll use simulation.

            const sim = this.runMonteCarloSimulation(assetData.price, instrument.termInYears, riskFreeRate, assetData.volatility, assetData.dividendYield);
            
            const payoffs = sim.finalPrices.map(finalPrice => {
                const assetReturn = (finalPrice / assetData.price) - 1;
                const cappedReturn = Math.min(assetReturn, cap);
                const optionPayoff = instrument.principal * participationRate * Math.max(0, cappedReturn);
                return instrument.principal + optionPayoff;
            });

            return this.compileAnalysisFromPayoffs(instrument, payoffs, sim.paths);
        }

        private analyzeReverseConvertibleNote(instrument: ICustomInstrument): IAIAnalysisResult {
            const assetId = instrument.blueprint.underlyingAssets[0];
            const assetData = this.marketDataService.getAssetData(assetId);
            const riskFreeRate = this.marketDataService.getRiskFreeRate();
            
            const couponRate = instrument.customParameters.couponRate;
            const knockInBarrier = instrument.customParameters.knockInBarrier * assetData.price;
            
            // This instrument is equivalent to being long a bond and short a put option.
            const totalCouponValue = instrument.principal * couponRate * instrument.termInYears;

            const sim = this.runMonteCarloSimulation(assetData.price, instrument.termInYears, riskFreeRate, assetData.volatility, assetData.dividendYield);

            const payoffs = sim.finalPrices.map(finalPrice => {
                let finalPrincipal;
                if (finalPrice < knockInBarrier) {
                    // Knock-in event: Investor receives depreciated asset
                    finalPrincipal = instrument.principal * (finalPrice / assetData.price);
                } else {
                    // No knock-in: Investor receives full principal
                    finalPrincipal = instrument.principal;
                }
                return finalPrincipal + totalCouponValue;
            });

            return this.compileAnalysisFromPayoffs(instrument, payoffs, sim.paths);
        }
        
        private analyzeDeFiLending(instrument: ICustomInstrument): IAIAnalysisResult {
            // DeFi analysis has different risk factors: smart contract risk, oracle risk, etc.
            // We'll simulate APY fluctuations.
            const avgAPY = 0.05; // Assume 5% average APY for USDC lending
            const apyVolatility = 0.5; // High volatility in APYs
            
            const sim = this.runMonteCarloSimulation(avgAPY, instrument.termInYears, 0, apyVolatility, 0, 5000);
            
            // We simulate the final value based on a fluctuating APY path.
            const payoffs = sim.paths.map(path => {
                let value = instrument.principal;
                const dailyRatePath = path.map(apy => apy / 365);
                for(const rate of dailyRatePath) {
                    value *= (1 + Math.max(0, rate)); // APY can't be negative
                }
                return value;
            });
            
            const analysis = this.compileAnalysisFromPayoffs(instrument, payoffs);
            
            analysis.risk.summary = "Primary risks are smart contract vulnerabilities, oracle failures, and extreme APY volatility. Principal is not guaranteed and can be lost in a protocol failure. Low market risk for stablecoins.";
            analysis.suitability.warnings.push("DeFi protocols are experimental technology. Do not invest more than you can afford to lose.");
            analysis.complianceChecks.mifidII = "N/A"; // Often outside traditional frameworks
            
            return analysis;
        }

        private compileAnalysisFromPayoffs(instrument: ICustomInstrument, payoffs: number[], paths?: number[][]): IAIAnalysisResult {
            const n = payoffs.length;
            const returns = payoffs.map(p => (p / instrument.principal) - 1);
            const totalReturn = returns.reduce((sum, r) => sum + r, 0) / n;
            const expectedAnnualReturn = Math.pow(1 + totalReturn, 1 / instrument.termInYears) - 1;
            
            const riskFreeRate = this.marketDataService.getRiskFreeRate();
            const excessReturns = returns.map(r => r - (Math.pow(1 + riskFreeRate, instrument.termInYears) - 1));
            const stdDev = Math.sqrt(excessReturns.reduce((sum, r) => sum + Math.pow(r - totalReturn, 2), 0) / (n - 1));
            const annualVolatility = stdDev / Math.sqrt(instrument.termInYears);
            
            const sharpeRatio = (expectedAnnualReturn - riskFreeRate) / annualVolatility;

            const sortedReturns = [...returns].sort((a, b) => a - b);
            const varIndex = Math.floor(0.05 * n);
            const valueAtRisk95 = -sortedReturns[varIndex] * instrument.principal;
            const expectedShortfall95 = -sortedReturns.slice(0, varIndex).reduce((a, b) => a + b, 0) / varIndex * instrument.principal;
            
            const bestCaseScenario = Math.max(...payoffs);
            const worstCaseScenario = Math.min(...payoffs);

            const suitabilityScore = this.calculateSuitabilityScore(instrument, expectedAnnualReturn, annualVolatility);

            // Create payoff distribution for charting
            const minPayoff = Math.min(...payoffs);
            const maxPayoff = Math.max(...payoffs);
            const numBins = 20;
            const binWidth = (maxPayoff - minPayoff) / numBins;
            const bins = Array(numBins).fill(0);
            for (const p of payoffs) {
                const binIndex = Math.min(numBins - 1, Math.floor((p - minPayoff) / binWidth));
                bins[binIndex]++;
            }
            const payoffDistribution = bins.map((count, i) => ({
                value: minPayoff + i * binWidth,
                probability: count / n
            }));

            return {
                timestamp: new Date(),
                risk: {
                    summary: this.getRiskSummary(annualVolatility, valueAtRisk95, instrument.principal),
                    valueAtRisk95,
                    expectedShortfall95,
                    volatility: annualVolatility,
                    sensitivityAnalysis: {}, // Placeholder for Greeks
                },
                reward: {
                    summary: this.getRewardSummary(expectedAnnualReturn, bestCaseScenario, instrument.principal),
                    expectedReturn: expectedAnnualReturn,
                    sharpeRatio,
                    bestCaseScenario,
                    worstCaseScenario,
                },
                suitability: {
                    summary: `With a score of ${suitabilityScore.toFixed(0)}/100, this instrument is ${suitabilityScore > 70 ? "highly suitable" : suitabilityScore > 40 ? "moderately suitable" : "potentially unsuitable"} for a ${instrument.riskProfile.toLowerCase()} investor.`,
                    score: suitabilityScore,
                    warnings: suitabilityScore < 50 ? ["High risk/reward mismatch for stated profile."] : [],
                },
                complianceChecks: { mifidII: "Pass", doddFrank: "Pass", localRegs: "Pass" }, // Mocked
                simulationData: {
                    payoffDistribution,
                    monteCarloPaths: paths?.slice(0, 50) // Return a subset of paths for visualization
                }
            };
        }
        
        private getRiskSummary(volatility: number, vaR: number, principal: number): string {
            if (volatility < 0.05) {
                return `Extremely low risk. The 95% Value-at-Risk is $${vaR.toFixed(2)}, indicating a 5% chance of losing more than this amount. Volatility is very low.`;
            } else if (volatility < 0.15) {
                return `Low to moderate risk. The 95% Value-at-Risk is $${vaR.toFixed(2)}. The instrument exhibits some sensitivity to market movements but has protective features.`;
            } else if (volatility < 0.30) {
                 return `Significant risk. The 95% Value-at-Risk is $${vaR.toFixed(2)}. Principal is exposed to considerable market fluctuations.`;
            } else {
                return `High risk. The 95% Value-at-Risk is $${vaR.toFixed(2)}. This is a speculative instrument with a high probability of significant loss.`;
            }
        }
        
        private getRewardSummary(expectedReturn: number, bestCase: number, principal: number): string {
            const bestCasePct = (bestCase/principal - 1) * 100;
             if (expectedReturn < 0.04) {
                return `Conservative reward potential. Expected annual return is ${(expectedReturn*100).toFixed(2)}%. The best-case scenario could yield a ${bestCasePct.toFixed(2)}% total return.`;
            } else if (expectedReturn < 0.10) {
                return `Moderate reward potential. Expected annual return is ${(expectedReturn*100).toFixed(2)}%, with a best-case scenario return of ${bestCasePct.toFixed(2)}%.`;
            } else {
                return `High reward potential. Expected annual return is ${(expectedReturn*100).toFixed(2)}%. This comes with significant risk, but the best-case scenario could yield a substantial ${bestCasePct.toFixed(2)}% return.`;
            }
        }

        private calculateSuitabilityScore(instrument: ICustomInstrument, expectedReturn: number, volatility: number): number {
            let score = 50;
            const profile = instrument.riskProfile;

            if (profile === "Conservative") {
                if (volatility < 0.05) score += 40;
                else if (volatility > 0.15) score -= 40;
                if (instrument.blueprint.id.startsWith('ppn')) score += 20;
            } else if (profile === "Moderate") {
                if (volatility > 0.08 && volatility < 0.20) score += 30;
                else score -= 20;
            } else if (profile === "Aggressive") {
                if (volatility > 0.20) score += 30;
                else if (volatility < 0.10) score -= 30;
                 if (expectedReturn > 0.10) score += 15;
            } else if (profile === "Speculative") {
                if (volatility > 0.40) score += 40;
                 if (expectedReturn > 0.15) score += 20;
            }

            return Math.max(0, Math.min(100, score));
        }
        
        public backtestStrategy(instrument: ICustomInstrument): IBacktestResult {
            const years = 5;
            const assetId = instrument.blueprint.underlyingAssets[0];
            if (!assetId) {
                 return {
                    period: { start: new Date(), end: new Date() },
                    strategyReturns: 0, benchmarkReturns: 0, maxDrawdown: 0, annualisedSharpeRatio: 0,
                    summary: "Backtesting not applicable for this instrument."
                };
            }
            const histData = this.marketDataService.getHistoricalData(assetId, years);
            const benchmarkData = this.marketDataService.getHistoricalData("SPX", years);

            // This is a highly simplified backtest. A real one would be event-driven.
            const initialAssetPrice = histData[0];
            const finalAssetPrice = histData[histData.length - 1];
            const initialBenchmarkPrice = benchmarkData[0];
            const finalBenchmarkPrice = benchmarkData[benchmarkData.length - 1];

            const assetReturn = (finalAssetPrice / initialAssetPrice) - 1;
            const benchmarkReturn = (finalBenchmarkPrice / initialBenchmarkPrice) - 1;
            
            let strategyReturn = 0;
            // Simplified payoff calculation based on blueprint
            if (instrument.blueprint.id.startsWith('ppn')) {
                 const participationRate = instrument.customParameters.participationRate;
                 const cap = instrument.customParameters.cap;
                 strategyReturn = participationRate * Math.min(cap, Math.max(0, assetReturn));
            } else if (instrument.blueprint.id.startsWith('rcn')) {
                 const coupon = instrument.customParameters.couponRate * instrument.termInYears;
                 const knockInBarrier = instrument.customParameters.knockInBarrier;
                 if ((finalAssetPrice / initialAssetPrice) < knockInBarrier) {
                     strategyReturn = (finalAssetPrice / initialAssetPrice) - 1 + coupon;
                 } else {
                     strategyReturn = coupon;
                 }
            }
            
            return {
                period: { start: new Date(new Date().setFullYear(new Date().getFullYear() - years)), end: new Date() },
                strategyReturns: strategyReturn,
                benchmarkReturns: benchmarkReturn,
                maxDrawdown: 0.1, // Mocked
                annualisedSharpeRatio: 0.8, // Mocked
                summary: `Over the last ${years} years, this strategy would have returned ${(strategyReturn*100).toFixed(2)}%, compared to the benchmark's ${(benchmarkReturn*100).toFixed(2)}%.`
            };
        }
    }


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SECTION 4: REACT UI COMPONENTS (Using React.createElement as per original)
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    const e = React.createElement;

    /**
     * @component TheForgeComponent
     * @description The main container component for the entire Financial Instrument Forge application.
     * It manages the application state and orchestrates the interaction between sub-components.
     * @deprecated Replaced by the more modern FinancialInstrumentForgeView functional component.
     */
    class TheForgeComponent {
        private readonly engineerAI: TheFinancialEngineerAI;
        
        constructor() {
            this.engineerAI = new TheFinancialEngineerAI(new MarketDataService());
        }
        
        public render(): React.ReactElement {
            const TabbedBlueprintSelector = e('div', { className: 'forge-placeholder' }, 'TabbedBlueprintSelector (Legacy)');
            const ParameterWorkbench = e('div', { className: 'forge-placeholder' }, 'ParameterWorkbench (Legacy)');
            const AIAnalysisSection = e('div', { className: 'forge-placeholder' }, 'AIAnalysisSection (Legacy)');
            const MintButton = e('button', { className: 'forge-placeholder' }, 'Mint (Legacy)');
            
            const view = e('div', { className: 'legacy-forge-view' },
                e('h1', null, 'The Financial Instrument Forge (Legacy)'),
                TabbedBlueprintSelector,
                ParameterWorkbench,
                AIAnalysisSection,
                MintButton
            );
            return view;
        }
    }

    /**
     * @interface FinancialInstrumentForgeViewProps
     * @description Props for the main view component.
     */
    export interface IFinancialInstrumentForgeViewProps {
        blueprintService: BlueprintService;
        engineerAI: TheFinancialEngineerAI;
        logger: LoggerService;
        defaultInvestorId: string;
    }

    /**
     * @component FinancialInstrumentForgeView
     * @description The primary functional component for the application, using React Hooks.
     */
    export const FinancialInstrumentForgeView: React.FC<IFinancialInstrumentForgeViewProps> = (props) => {
        const { blueprintService, engineerAI, logger, defaultInvestorId } = props;

        const [blueprints] = React.useState<IProductBlueprint[]>(() => blueprintService.getBlueprints());
        const [selectedBlueprintId, setSelectedBlueprintId] = React.useState<string | null>(blueprints[0]?.id || null);
        const [instrument, setInstrument] = React.useState<ICustomInstrument | null>(null);
        const [analysis, setAnalysis] = React.useState<IAIAnalysisResult | null>(null);
        const [isLoading, setIsLoading] = React.useState<boolean>(false);
        const [error, setError] = React.useState<string | null>(null);

        const selectedBlueprint = React.useMemo(() => {
            return blueprints.find(b => b.id === selectedBlueprintId) || null;
        }, [selectedBlueprintId, blueprints]);

        React.useEffect(() => {
            if (selectedBlueprint) {
                // Create a new draft instrument whenever the blueprint changes
                const defaultCustomParams: Record<string, any> = {};
                selectedBlueprint.configurableParameters.forEach(p => {
                    defaultCustomParams[p.key] = p.defaultValue;
                });

                setInstrument({
                    instanceId: `inst_${Date.now()}`,
                    blueprint: selectedBlueprint,
                    principal: 100000,
                    termInYears: 5,
                    riskProfile: 'Moderate',
                    customParameters: defaultCustomParams,
                    investorId: defaultInvestorId,
                    creationDate: new Date(),
                    status: 'Draft',
                });
                setAnalysis(null); // Clear previous analysis
            }
        }, [selectedBlueprint, defaultInvestorId]);

        const handleParameterChange = React.useCallback((key: string, value: any) => {
            if (!instrument) return;

            // Simple validation
            const paramDef = instrument.blueprint.configurableParameters.find(p => p.key === key);
            let parsedValue = value;
            if (paramDef?.type === 'number' || paramDef?.type === 'percentage') {
                parsedValue = parseFloat(value);
                if (isNaN(parsedValue)) parsedValue = 0;
            }

            setInstrument(prev => prev ? ({
                ...prev,
                customParameters: {
                    ...prev.customParameters,
                    [key]: parsedValue
                },
                status: 'Draft'
            }) : null);
            setAnalysis(null); // Clear analysis on parameter change
        }, [instrument]);
        
        const handleCoreParamChange = React.useCallback((key: 'principal' | 'termInYears' | 'riskProfile', value: any) => {
            if (!instrument) return;
             setInstrument(prev => prev ? ({ ...prev, [key]: value, status: 'Draft' }) : null);
             setAnalysis(null);
        }, [instrument]);

        const handleAnalyzeClick = React.useCallback(() => {
            if (!instrument) return;
            logger.log('INFO', 'User initiated analysis.', { instanceId: instrument.instanceId });
            setIsLoading(true);
            setError(null);
            
            // Simulate async operation
            setTimeout(() => {
                try {
                    const result = engineerAI.analyzeInstrument(instrument);
                    setAnalysis(result);
                    setInstrument(prev => prev ? ({ ...prev, status: 'Analyzed' }) : null);
                } catch (e) {
                    const err = e as Error;
                    logger.log('ERROR', 'Analysis UI caught an error.', { error: err.message });
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            }, 1500); // Simulate network/computation latency
        }, [instrument, engineerAI, logger]);

        const handleMintClick = React.useCallback(() => {
            if (instrument?.status !== 'Analyzed') {
                alert("Please analyze the instrument before minting.");
                return;
            }
            logger.log('INFO', 'User initiated minting process.', { instanceId: instrument.instanceId });
            alert(`Minting instrument ${instrument.instanceId} for $${instrument.principal}. This is a simulation.`);
            setInstrument(prev => prev ? ({ ...prev, status: 'Minted' }) : null);
        }, [instrument, logger]);


        return e('div', { className: 'forge-container' },
            e('h1', { className: 'forge-title' }, 'The Financial Instrument Forge'),
            e('div', { className: 'forge-main-layout' },
                e('div', { className: 'forge-left-panel' },
                    e(BlueprintSelector, { blueprints, selectedId: selectedBlueprintId, onSelect: setSelectedBlueprintId }),
                    instrument && e(ParameterWorkbench, { instrument, onCoreChange: handleCoreParamChange, onCustomChange: handleParameterChange })
                ),
                e('div', { className: 'forge-right-panel' },
                    e(AnalysisDashboard, { analysis, isLoading, error }),
                    e(MintingConsole, {
                        instrumentStatus: instrument?.status || 'Draft',
                        onAnalyze: handleAnalyzeClick,
                        onMint: handleMintClick,
                        isLoading
                    })
                )
            )
        );
    };

    /**
     * @component BlueprintSelector
     * @description A component for selecting a financial product blueprint from a list.
     */
    export const BlueprintSelector: React.FC<{
        blueprints: IProductBlueprint[];
        selectedId: string | null;
        onSelect: (id: string) => void;
    }> = ({ blueprints, selectedId, onSelect }) => {
        const categories = [...new Set(blueprints.map(b => b.productClass))];
        
        return e('div', { className: 'widget blueprint-selector' },
            e('h2', { className: 'widget-title' }, '1. Select Blueprint'),
            categories.map(category => e('div', { key: category, className: 'category-group' },
                e('h3', { className: 'category-title' }, category),
                blueprints.filter(b => b.productClass === category).map(blueprint => 
                    e('div', {
                        key: blueprint.id,
                        className: `blueprint-item ${selectedId === blueprint.id ? 'selected' : ''}`,
                        onClick: () => onSelect(blueprint.id),
                    },
                        e('div', { className: 'blueprint-item-name' }, blueprint.name),
                        e('div', { className: 'blueprint-item-desc' }, blueprint.description)
                    )
                )
            ))
        );
    };

    /**
     * @component ParameterWorkbench
     * @description A dynamic form for configuring the parameters of the selected instrument.
     */
    export const ParameterWorkbench: React.FC<{
        instrument: ICustomInstrument;
        onCoreChange: (key: 'principal' | 'termInYears' | 'riskProfile', value: any) => void;
        onCustomChange: (key: string, value: any) => void;
    }> = ({ instrument, onCoreChange, onCustomChange }) => {
        const renderInputField = (param: IParameterDefinition, value: any, onChange: (v: any) => void) => {
            const id = `param-${param.key}`;
            const inputProps = {
                id,
                value,
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(e.target.value),
                className: 'param-input'
            };
            
            let inputElement;
            switch(param.type) {
                case 'select':
                    inputElement = e('select', inputProps,
                        param.validationRules?.options?.map(opt =>
                            e('option', { key: opt.value, value: opt.value }, opt.label)
                        )
                    );
                    break;
                default:
                    inputElement = e('input', { ...inputProps, type: 'number', step: param.type === 'percentage' ? 0.01 : 1 });
            }

            return e('div', { key: param.key, className: 'param-field' },
                e('label', { htmlFor: id, className: 'param-label', title: param.description }, param.label),
                inputElement
            );
        };
        
        const coreParams = [
            e('div', { key: 'principal', className: 'param-field' },
                e('label', { htmlFor: 'core-principal', className: 'param-label' }, 'Principal Amount'),
                e('input', { id: 'core-principal', type: 'number', value: instrument.principal, onChange: (e) => onCoreChange('principal', Number(e.target.value) || 0), className: 'param-input' })
            ),
            e('div', { key: 'term', className: 'param-field' },
                e('label', { htmlFor: 'core-term', className: 'param-label' }, 'Term (Years)'),
                e('input', { id: 'core-term', type: 'number', value: instrument.termInYears, onChange: (e) => onCoreChange('termInYears', Number(e.target.value) || 0), className: 'param-input' })
            ),
             e('div', { key: 'risk', className: 'param-field' },
                e('label', { htmlFor: 'core-risk', className: 'param-label' }, 'Investor Risk Profile'),
                e('select', { id: 'core-risk', value: instrument.riskProfile, onChange: (e) => onCoreChange('riskProfile', e.target.value), className: 'param-input' },
                    e('option', { value: 'Conservative' }, 'Conservative'),
                    e('option', { value: 'Moderate' }, 'Moderate'),
                    e('option', { value: 'Aggressive' }, 'Aggressive'),
                    e('option', { value: 'Speculative' }, 'Speculative'),
                )
            ),
        ];

        return e('div', { className: 'widget parameter-workbench' },
            e('h2', { className: 'widget-title' }, '2. Configure Parameters'),
            e('h3', { className: 'category-title' }, 'Core Parameters'),
            ...coreParams,
            e('h3', { className: 'category-title' }, 'Blueprint-Specific Parameters'),
            instrument.blueprint.configurableParameters.map(param =>
                render