export interface MarketData {
    date: string;
    indexS_P500: number;
    inflationRateMonthly: number; // Monthly
    interestRateFED: number;
    economicSentimentIndex: number;
    unemploymentRate?: number;
    gdpGrowthRate?: number; // Quarterly/Annual
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