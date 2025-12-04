```typescript
// components/InvestmentsView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "CapitalVista," a full-featured celestial observatory for wealth.
// It combines portfolio visualization, performance analysis, growth simulation,
// and ESG investing into a single, comprehensive view.
//
// CAPITALVISTA UNIVERSE EXPANSION LOG:
// - V1.0 (Initial) - Basic portfolio, performance, ESG.
// - V2.0 (AI Integration) - Predictive analytics, sentiment, AI advisor.
// - V3.0 (Holistic Wealth) - Goal-based planning, advanced risk, tax simulation.
// - V4.0 (Global & Alt Assets) - Multi-currency, crypto, real estate, commodities.
// - V5.0 (Hyper-Personalization) - Dynamic UX, adaptive recommendations, learning paths.
// - V6.0 (Impact & Sustainability Deep Dive) - Advanced ESG, carbon footprint, thematic impact.
// - V7.0 (Community & Gamification) - Social sharing, achievements, challenges.
// - V8.0 (Quant Tools & Algorithmic Trading) - Backtesting, strategy builder, simulated algo execution.
// - V9.0 (RegTech & Compliance) - Automated compliance checks, regulatory alerts.
// - V10.0 (Quantum Finance & Bio-Integrated Analytics) - Future-proofed architecture for next-gen financial models.

import React, { useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { Asset, Transaction } from '../types'; // Added Transaction type for clarity
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    AreaChart,
    Area,
    LineChart,
    Line,
    ComposedChart,
    CartesianGrid,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import InvestmentPortfolio from './InvestmentPortfolio';

// ================================================================================================
// NEW GLOBAL TYPES & MOCK DATA (Simulating external API/DB integration)
// ================================================================================================

export type FinancialGoal = {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string; // YYYY-MM-DD
    priority: 'high' | 'medium' | 'low';
    status: 'on-track' | 'at-risk' | 'achieved' | 'missed';
    contributionAmount: number; // Monthly contribution needed
    progress: number; // 0-100
};

export type BenchmarkDataPoint = {
    date: string;
    value: number;
    benchmarkValue: number;
};

export type NewsArticle = {
    id: string;
    title: string;
    source: string;
    date: string;
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    summary: string;
    url: string;
    tags: string[];
    relevanceScore: number; // 0-100
};

export type EconomicEvent = {
    id: string;
    date: string;
    time: string;
    country: string;
    event: string;
    impact: 'low' | 'medium' | 'high';
    forecast: number | string;
    actual: number | string;
    previous: number | string;
};

export type RiskMetric = {
    name: string;
    value: number;
    unit?: string;
    description: string;
    riskCategory: 'market' | 'credit' | 'liquidity' | 'operational';
};

export type AllocationStrategy = {
    id: string;
    name: string;
    riskLevel: 'conservative' | 'moderate' | 'aggressive';
    targetAllocation: { [assetType: string]: number }; // e.g., { stocks: 0.6, bonds: 0.3, cash: 0.1 }
    currentAllocation: { [assetType: string]: number };
    rebalanceRecommendation: boolean;
};

export type ThematicCategory = {
    id: string;
    name: string;
    description: string;
    impactMetrics: { name: string; value: number; unit: string }[]; // e.g., 'carbon_reduction', 'social_equity'
    potentialAssets: Pick<Asset, 'id' | 'name' | 'description' | 'esgRating' | 'value' | 'performanceYTD'>[];
    growthPotential: 'low' | 'medium' | 'high';
};

export type InvestmentRecommendation = {
    id: string;
    assetId: string;
    assetName: string;
    recommendation: 'buy' | 'hold' | 'sell';
    reasoning: string;
    targetPrice?: number;
    riskScore: number; // 1-10
    confidenceScore: number; // 0-100%
    timestamp: string;
};

export type UserAchievement = {
    id: string;
    name: string;
    description: string;
    dateAchieved: string;
    badgeUrl: string; // SVG or image URL
    category: 'portfolio_growth' | 'risk_management' | 'impact_investing' | 'learning' | 'consistency';
};

export type CarbonFootprintData = {
    portfolioId: string;
    totalEmissionsTonnesCO2e: number;
    intensityPerMillionRevenue: number;
    breakdownBySector: { sector: string; emissions: number }[];
    comparisonToBenchmark: number; // percentage difference, e.g., -10% means 10% lower
    lastUpdated: string;
};

export type FactorExposure = {
    factor: string; // e.g., 'Value', 'Growth', 'Momentum', 'Size'
    exposure: number; // positive or negative
    description: string;
};

export type AlternativeAsset = Pick<Asset, 'id' | 'name' | 'value' | 'performanceYTD' | 'description'> & {
    assetType: 'Real Estate' | 'Private Equity' | 'Commodities' | 'Art' | 'Crypto';
    liquidity: 'high' | 'medium' | 'low';
    minInvestment: number;
    expectedReturn: number; // annual percentage
    riskProfile: 'speculative' | 'high' | 'moderate';
};

// --- Mock Financial API Service (Simulating backend calls) ---
// This would typically be in a separate service layer (e.g., `services/financialApi.ts`)
// but for the "universe in a file" directive, we'll keep it here.
export const FinancialAPI = {
    fetchFinancialGoals: async (): Promise<FinancialGoal[]> => {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve([
                        {
                            id: 'g1',
                            name: 'Retirement Fund',
                            targetAmount: 1_000_000,
                            currentAmount: 350_000,
                            targetDate: '2040-12-31',
                            priority: 'high',
                            status: 'on-track',
                            contributionAmount: 1200,
                            progress: 35
                        },
                        {
                            id: 'g2',
                            name: 'House Down Payment',
                            targetAmount: 150_000,
                            currentAmount: 75_000,
                            targetDate: '2028-06-01',
                            priority: 'high',
                            status: 'on-track',
                            contributionAmount: 800,
                            progress: 50
                        },
                        {
                            id: 'g3',
                            name: 'Kids College Fund',
                            targetAmount: 200_000,
                            currentAmount: 10_000,
                            targetDate: '2035-09-01',
                            priority: 'medium',
                            status: 'at-risk',
                            contributionAmount: 300,
                            progress: 5
                        }
                    ]),
                500
            )
        );
    },
    fetchPortfolioBenchmark: async (portfolioValue: number): Promise<BenchmarkDataPoint[]> => {
        const data: BenchmarkDataPoint[] = [];
        let currentPortfolio = portfolioValue;
        let currentBenchmark = portfolioValue * 1.05; // Assume benchmark starts higher or lower
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1); // Last 1 year data
        for (let i = 0; i < 12; i++) {
            const date = new Date(startDate);
            date.setMonth(startDate.getMonth() + i);
            currentPortfolio *= 1 + (Math.random() * 0.02 - 0.01); // -1% to +1% monthly
            currentBenchmark *= 1 + (Math.random() * 0.015 - 0.005); // -0.5% to +1.5% monthly
            data.push({ date: date.toISOString().split('T')[0], value: currentPortfolio, benchmarkValue: currentBenchmark });
        }
        return new Promise(resolve => setTimeout(() => resolve(data), 600));
    },
    fetchMarketNews: async (): Promise<NewsArticle[]> => {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve([
                        {
                            id: 'n1',
                            title: 'Tech Stocks Surge on Q3 Earnings Beat',
                            source: 'Financial Times AI',
                            date: '2023-10-26',
                            sentiment: 'positive',
                            summary: 'Major tech companies reported better-than-expected earnings, driving market optimism.',
                            url: '#',
                            tags: ['tech', 'earnings', 'market'],
                            relevanceScore: 95
                        },
                        {
                            id: 'n2',
                            title: 'Global Inflation Concerns Persist Ahead of Fed Meeting',
                            source: 'Bloomberg AI',
                            date: '2023-10-26',
                            sentiment: 'negative',
                            summary: 'Analysts are wary of continued inflation, with central banks under pressure to act.',
                            url: '#',
                            tags: ['macro', 'inflation', 'fed'],
                            relevanceScore: 88
                        },
                        {
                            id: 'n3',
                            title: 'Renewable Energy Sector Sees Record Investment Inflow',
                            source: 'ESG Insights',
                            date: '2023-10-25',
                            sentiment: 'positive',
                            summary: 'Sustainable energy projects attracting significant capital, signaling strong growth.',
                            url: '#',
                            tags: ['esg', 'renewable', 'clean_tech'],
                            relevanceScore: 92
                        },
                        {
                            id: 'n4',
                            title: 'Cryptocurrency Market Volatility Continues',
                            source: 'Crypto Daily',
                            date: '2023-10-25',
                            sentiment: 'mixed',
                            summary: 'Bitcoin and Ethereum experience sharp price swings; experts divided on short-term outlook.',
                            url: '#',
                            tags: ['crypto', 'bitcoin', 'volatility'],
                            relevanceScore: 70
                        }
                    ]),
                400
            )
        );
    },
    fetchEconomicCalendar: async (): Promise<EconomicEvent[]> => {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve([
                        {
                            id: 'ee1',
                            date: '2023-10-27',
                            time: '08:30 EST',
                            country: 'USA',
                            event: 'GDP Growth Rate (Q3 Prelim)',
                            impact: 'high',
                            forecast: '2.5%',
                            actual: '2.6%',
                            previous: '2.1%'
                        },
                        {
                            id: 'ee2',
                            date: '2023-10-27',
                            time: '10:00 EST',
                            country: 'USA',
                            event: 'Consumer Sentiment Index',
                            impact: 'medium',
                            forecast: 68.5,
                            actual: 69.2,
                            previous: 67.9
                        },
                        {
                            id: 'ee3',
                            date: '2023-10-28',
                            time: '09:00 GMT',
                            country: 'EUR',
                            event: 'ECB President Lagarde Speech',
                            impact: 'high',
                            forecast: 'N/A',
                            actual: 'N/A',
                            previous: 'N/A'
                        }
                    ]),
                550
            )
        );
    },
    fetchPortfolioRiskMetrics: async (): Promise<RiskMetric[]> => {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve([
                        { name: 'Sharpe Ratio (1Y)', value: 0.85, description: 'Risk-adjusted return', unit: '' },
                        { name: 'Sortino Ratio (1Y)', value: 1.2, description: 'Downside risk-adjusted return', unit: '' },
                        { name: 'Value at Risk (VaR 95%, 1M)', value: 5000, description: 'Potential loss at 95% confidence over 1 month', unit: '$' },
                        { name: 'Beta (vs S&P 500)', value: 1.15, description: 'Volatility relative to market', unit: '' }
                    ]),
                400
            )
        );
    },
    fetchAssetAllocationStrategies: async (): Promise<AllocationStrategy[]> => {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve([
                        {
                            id: 'strat1',
                            name: 'Aggressive Growth',
                            riskLevel: 'aggressive',
                            targetAllocation: { stocks: 0.8, bonds: 0.15, alternatives: 0.05 },
                            currentAllocation: { stocks: 0.78, bonds: 0.17, alternatives: 0.05 },
                            rebalanceRecommendation: false
                        },
                        {
                            id: 'strat2',
                            name: 'Balanced Portfolio',
                            riskLevel: 'moderate',
                            targetAllocation: { stocks: 0.6, bonds: 0.3, cash: 0.1 },
                            currentAllocation: { stocks: 0.65, bonds: 0.25, cash: 0.1 },
                            rebalanceRecommendation: true // Stocks are over, bonds are under
                        }
                    ]),
                700
            )
        );
    },
    fetchThematicCategories: async (): Promise<ThematicCategory[]> => {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve([
                        {
                            id: 'thm1',
                            name: 'Clean Energy Transition',
                            description: 'Investing in renewable energy, electric vehicles, and sustainable infrastructure.',
                            impactMetrics: [
                                { name: 'Carbon Reduction', value: 25000, unit: 'tonnes CO2e/yr' },
                                { name: 'Renewable Capacity', value: 1500, unit: 'MW' }
                            ],
                            potentialAssets: [
                                { id: 'a10', name: 'GreenPower Inc.', description: 'Leading solar panel manufacturer.', esgRating: 5, value: 5000, performanceYTD: 15 },
                                { id: 'a11', name: 'EV Solutions', description: 'Innovative electric vehicle charging network.', esgRating: 4, value: 3000, performanceYTD: 22 }
                            ],
                            growthPotential: 'high'
                        },
                        {
                            id: 'thm2',
                            name: 'Future of Food',
                            description: 'Investments in sustainable agriculture, alternative proteins, and food technology.',
                            impactMetrics: [
                                { name: 'Water Saved', value: 120, unit: 'million liters/yr' },
                                { name: 'Sustainable Land Use', value: 5000, unit: 'hectares' }
                            ],
                            potentialAssets: [
                                { id: 'a12', name: 'BioHarvest Foods', description: 'Plant-based protein innovator.', esgRating: 4, value: 2000, performanceYTD: 8 }
                            ],
                            growthPotential: 'medium'
                        }
                    ]),
                600
            )
        );
    },
    fetchAIPredictions: async (assetId: string): Promise<InvestmentRecommendation[]> => {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve([
                        {
                            id: `rec-${assetId}-1`,
                            assetId: assetId,
                            assetName: `Stock ${assetId.toUpperCase()}`,
                            recommendation: Math.random() > 0.6 ? 'buy' : Math.random() > 0.5 ? 'hold' : 'sell',
                            reasoning: `AI analysis indicates strong market momentum and positive sentiment. Target price revision likely.`,
                            targetPrice: 150 + Math.random() * 50,
                            riskScore: Math.floor(Math.random() * 5) + 3,
                            confidenceScore: Math.floor(Math.random() * 20) + 70, // 70-90%
                            timestamp: new Date().toISOString()
                        }
                    ]),
                300
            )
        );
    },
    fetchUserAchievements: async (): Promise<UserAchievement[]> => {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve([
                        {
                            id: 'ach1',
                            name: 'First Impact Investment',
                            description: 'Made your first investment in an ESG-rated asset.',
                            dateAchieved: '2023-09-15',
                            badgeUrl: 'https://img.icons8.com/color/48/000000/award.png',
                            category: 'impact_investing'
                        },
                        {
                            id: 'ach2',
                            name: 'Portfolio Growth Wizard',
                            description: 'Achieved 20% portfolio growth in a single year.',
                            dateAchieved: '2023-10-01',
                            badgeUrl: 'https://img.icons8.com/color/48/000000/trophy.png',
                            category: 'portfolio_growth'
                        },
                        {
                            id: 'ach3',
                            name: 'Consistent Contributor',
                            description: 'Maintained monthly contributions for 12 consecutive months.',
                            dateAchieved: '2023-08-20',
                            badgeUrl: 'https://img.icons8.com/color/48/000000/medal-first-place.png',
                            category: 'consistency'
                        }
                    ]),
                450
            )
        );
    },
    fetchPortfolioCarbonFootprint: async (): Promise<CarbonFootprintData> => {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve({
                        portfolioId: 'user-portfolio-1',
                        totalEmissionsTonnesCO2e: 125,
                        intensityPerMillionRevenue: 85,
                        breakdownBySector: [
                            { sector: 'Technology', emissions: 30 },
                            { sector: 'Finance', emissions: 20 },
                            { sector: 'Industrials', emissions: 40 },
                            { sector: 'Utilities', emissions: 35 }
                        ],
                        comparisonToBenchmark: -15, // 15% lower than benchmark
                        lastUpdated: '2023-10-25'
                    }),
                700
            )
        );
    },
    fetchFactorExposures: async (): Promise<FactorExposure[]> => {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve([
                        { factor: 'Value', exposure: 0.3, description: 'Exposure to undervalued assets' },
                        { factor: 'Growth', exposure: 0.7, description: 'Exposure to high-growth companies' },
                        { factor: 'Momentum', exposure: 0.4, description: 'Exposure to assets with recent strong performance' },
                        { factor: 'Size (Small Cap)', exposure: -0.2, description: 'Underweight in small-cap companies' }
                    ]),
                500
            )
        );
    },
    fetchAlternativeInvestments: async (): Promise<AlternativeAsset[]> => {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve([
                        {
                            id: 'alt1',
                            name: 'Luxury Condominium Fund',
                            description: 'Investment in high-end real estate development projects.',
                            value: 25000,
                            performanceYTD: 8.5,
                            assetType: 'Real Estate',
                            liquidity: 'low',
                            minInvestment: 10000,
                            expectedReturn: 12,
                            riskProfile: 'moderate'
                        },
                        {
                            id: 'alt2',
                            name: 'Blockchain Innovation VC',
                            description: 'Early-stage venture capital fund targeting blockchain startups.',
                            value: 15000,
                            performanceYTD: 25.1,
                            assetType: 'Private Equity',
                            liquidity: 'low',
                            minInvestment: 5000,
                            expectedReturn: 20,
                            riskProfile: 'high'
                        },
                        {
                            id: 'alt3',
                            name: 'Gold & Silver ETF',
                            description: 'Exchange-traded fund providing exposure to precious metals.',
                            value: 8000,
                            performanceYTD: 10.2,
                            assetType: 'Commodities',
                            liquidity: 'high',
                            minInvestment: 100,
                            expectedReturn: 7,
                            riskProfile: 'moderate'
                        }
                    ]),
                650
            )
        );
    }
};

// ================================================================================================
// HELPER & SUB-COMPONENTS (Expanded)
// ================================================================================================

/**
 * @description A specialized component to visually represent a company's ESG (Environmental,
 * Social, and Governance) rating on a scale of 1 to 5. Now with more detailed tooltip.
 * @param {{ rating: number }} props - The ESG rating to display.
 */
export const ESGScore: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center group relative" aria-label={`ESG rating: ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
            <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${i < rating ? 'text-green-400' : 'text-gray-600'} transition-colors duration-200`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
            >
                <path d="M10 15a.75.75 0 01-.75-.75V7.612L7.22 9.63a.75.75 0 01-1.06-1.06l3.25-3.25a.75.75 0 011.18 0l3.25 3.25a.75.75 0 11-1.06 1.06L10.75 7.612v6.638A.75.75 0 0110 15z" />
            </svg>
        ))}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50">
            ESG Score: {rating}/5 - {rating >= 4 ? 'Strong ESG Performance' : rating >= 3 ? 'Good ESG Performance' : 'Developing ESG Initiatives'}
        </div>
    </div>
);

/**
 * @description A modal component for simulating an investment action. Now with more options.
 */
export const InvestmentModal: React.FC<{
    asset: Asset | null;
    onClose: () => void;
    onInvest: (assetName: string, amount: number, type: 'buy' | 'sell' | 'add_contribution') => void;
    currentHoldings?: number;
}> = ({ asset, onClose, onInvest, currentHoldings = 0 }) => {
    const [amount, setAmount] = useState('1000');
    const [investmentType, setInvestmentType] = useState<'buy' | 'sell' | 'add_contribution'>('buy');

    if (!asset) return null;

    const handleInvestClick = () => {
        onInvest(asset.name, parseFloat(amount), investmentType);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Action on {asset.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <p className="text-sm text-gray-400">{asset.description}</p>
                    {currentHoldings > 0 && (
                        <p className="text-sm text-gray-300">
                            Current Holdings: <span className="font-semibold text-white">${currentHoldings.toLocaleString()}</span>
                        </p>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Action Type</label>
                        <select
                            value={investmentType}
                            onChange={e => setInvestmentType(e.target.value as 'buy' | 'sell' | 'add_contribution')}
                            className="w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white"
                        >
                            <option value="buy">Buy</option>
                            {currentHoldings > 0 && <option value="sell">Sell</option>}
                            <option value="add_contribution">Add to Contribution</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Amount (USD)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="e.g., 1000"
                            min="1"
                        />
                    </div>
                    <button
                        onClick={handleInvestClick}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Confirm {investmentType === 'buy' ? 'Investment' : investmentType === 'sell' ? 'Sale' : 'Contribution'}
                    </button>
                    <p className="text-xs text-gray-500 text-center">Simulated transaction. Not real financial advice.</p>
                </div>
            </div>
        </div>
    );
};

// --- New Universal Components for CapitalVista ---

export const FinancialGoalTracker: React.FC = () => {
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        FinancialAPI.fetchFinancialGoals().then(data => {
            setGoals(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-gray-400 text-center py-4">Loading financial goals...</div>;
    if (goals.length === 0) return <div className="text-gray-400 text-center py-4">No financial goals set. Start planning!</div>;

    return (
        <div className="space-y-4">
            {goals.map(goal => (
                <div key={goal.id} className="p-4 bg-gray-700/30 rounded-lg shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-white text-lg">{goal.name}</h4>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                            goal.status === 'on-track' ? 'bg-green-600/30 text-green-300' :
                            goal.status === 'at-risk' ? 'bg-yellow-600/30 text-yellow-300' :
                            'bg-red-600/30 text-red-300'
                        }`}>
                            {goal.status.replace('-', ' ')}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Target: <span className="text-white">${goal.targetAmount.toLocaleString()}</span> by {goal.targetDate}</p>
                    <div className="w-full bg-gray-600 rounded-full h-2.5 mb-2">
                        <div
                            className="bg-cyan-500 h-2.5 rounded-full"
                            style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>${goal.currentAmount.toLocaleString()}</span>
                        <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}% complete</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Monthly contribution: ${goal.contributionAmount.toLocaleString()} (recommended)</p>
                </div>
            ))}
        </div>
    );
};

export const MarketNewsFeed: React.FC = () => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        FinancialAPI.fetchMarketNews().then(data => {
            setNews(data.sort((a, b) => b.relevanceScore - a.relevanceScore));
            setLoading(false);
        });
    }, []);

    const getSentimentColor = (sentiment: NewsArticle['sentiment']) => {
        switch (sentiment) {
            case 'positive': return 'text-green-400';
            case 'negative': return 'text-red-400';
            case 'neutral': return 'text-blue-400';
            case 'mixed': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    if (loading) return <div className="text-gray-400 text-center py-4">Fetching real-time market insights...</div>;
    if (news.length === 0) return <div className="text-gray-400 text-center py-4">No recent news available.</div>;

    return (
        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {news.map(article => (
                <a href={article.url} target="_blank" rel="noopener noreferrer" key={article.id} className="block hover:bg-gray-700/40 p-3 rounded-lg transition-colors">
                    <div className="flex items-center justify-between mb-1">
                        <h5 className="font-semibold text-white text-base">{article.title}</h5>
                        <span className={`text-xs font-medium ${getSentimentColor(article.sentiment)}`}>{article.sentiment.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{article.summary}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{article.source} - {new Date(article.date).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                            {article.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">#{tag}</span>
                            ))}
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

export const PortfolioBenchmarkChart: React.FC<{ totalValue: number }> = ({ totalValue }) => {
    const [data, setData] = useState<BenchmarkDataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        FinancialAPI.fetchPortfolioBenchmark(totalValue).then(data => {
            setData(data);
            setLoading(false);
        });
    }, [totalValue]);

    if (loading) return <div className="text-gray-400 text-center py-4 h-64 flex items-center justify-center">Loading benchmark data...</div>;
    if (data.length === 0) return <div className="text-gray-400 text-center py-4 h-64 flex items-center justify-center">No benchmark data available.</div>;

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="date" stroke="#9ca3af" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} />
                    <YAxis stroke="#9ca3af" tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}
                        formatter={(value: number, name: string) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, name === 'value' ? 'Your Portfolio' : 'S&P 500 Benchmark']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#06b6d4" name="Your Portfolio" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="benchmarkValue" stroke="#fbbf24" name="S&P 500 Benchmark" dot={false} strokeWidth={1} strokeDasharray="3 3" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const PortfolioRiskMetrics: React.FC = () => {
    const [metrics, setMetrics] = useState<RiskMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        FinancialAPI.fetchPortfolioRiskMetrics().then(data => {
            setMetrics(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-gray-400 text-center py-4">Calculating risk metrics...</div>;
    if (metrics.length === 0) return <div className="text-gray-400 text-center py-4">No risk metrics available.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map(metric => (
                <div key={metric.name} className="p-3 bg-gray-700/30 rounded-lg flex flex-col justify-between">
                    <h5 className="font-medium text-gray-300 text-sm">{metric.name}</h5>
                    <p className="text-xl font-bold text-white mt-1">{metric.value.toFixed(2)}{metric.unit}</p>
                    <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
            ))}
        </div>
    );
};

export const AssetAllocationPlanner: React.FC = () => {
    const [strategies, setStrategies] = useState<AllocationStrategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');

    useEffect(() => {
        FinancialAPI.fetchAssetAllocationStrategies().then(data => {
            setStrategies(data);
            if (data.length > 0) {
                setSelectedStrategyId(data[0].id);
            }
            setLoading(false);
        });
    }, []);

    const selectedStrategy = useMemo(() => {
        return strategies.find(s => s.id === selectedStrategyId);
    }, [strategies, selectedStrategyId]);

    const COLORS = ['#06b6d4', '#84cc16', '#fbbf24', '#ef4444', '#a855f7', '#f472b6']; // Tailwind colors

    if (loading) return <div className="text-gray-400 text-center py-4">Loading allocation strategies...</div>;
    if (strategies.length === 0) return <div className="text-gray-400 text-center py-4">No allocation strategies defined.</div>;

    const currentAllocationData = selectedStrategy ? Object.entries(selectedStrategy.currentAllocation).map(([name, value]) => ({ name, value: value * 100 })) : [];
    const targetAllocationData = selectedStrategy ? Object.entries(selectedStrategy.targetAllocation).map(([name, value]) => ({ name, value: value * 100 })) : [];

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="allocationStrategy" className="block text-sm font-medium text-gray-300 mb-1">Select Strategy:</label>
                <select
                    id="allocationStrategy"
                    className="w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white"
                    value={selectedStrategyId}
                    onChange={e => setSelectedStrategyId(e.target.value)}
                >
                    {strategies.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.riskLevel})</option>
                    ))}
                </select>
            </div>

            {selectedStrategy && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                        <h5 className="font-semibold text-white mb-2">Current Allocation</h5>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={currentAllocationData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={60}
                                        fill="#8884d8"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {currentAllocationData.map((entry, index) => (
                                            <Cell key={`cell-current-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}
                                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Current']}
                                    />
                                    <Legend align="right" verticalAlign="middle" layout="vertical" wrapperStyle={{ paddingLeft: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                        <h5 className="font-semibold text-white mb-2">Target Allocation</h5>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={targetAllocationData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={60}
                                        fill="#8884d8"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {targetAllocationData.map((entry, index) => (
                                            <Cell key={`cell-target-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}
                                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Target']}
                                    />
                                    <Legend align="right" verticalAlign="middle" layout="vertical" wrapperStyle={{ paddingLeft: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {selectedStrategy?.rebalanceRecommendation && (
                <div className="p-4 bg-yellow-600/30 text-yellow-200 rounded-lg flex items-center justify-between">
                    <p className="font-medium">
                        <span role="img" aria-label="alert" className="mr-2">⚠️</span>
                        Rebalancing Recommended! Your current allocation deviates from your target.
                    </p>
                    <button className="px-3 py-1 bg-yellow-700 hover:bg-yellow-800 rounded-md text-sm transition-colors">
                        View Details & Rebalance
                    </button>
                </div>
            )}
        </div>
    );
};

export const ThematicInvestmentExplorer: React.FC<{ onInvest: (assetName: string, amount: number, type: 'buy' | 'sell' | 'add_contribution') => void }> = ({ onInvest }) => {
    const [themes, setThemes] = useState<ThematicCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssetForModal, setSelectedAssetForModal] = useState<Asset | null>(null);

    useEffect(() => {
        FinancialAPI.fetchThematicCategories().then(data => {
            setThemes(data);
            setLoading(false);
        });
    }, []);

    const handleInvestInThemeAsset = (asset: Pick<Asset, 'id' | 'name' | 'description' | 'esgRating' | 'value' | 'performanceYTD'>) => {
        // Map thematic asset to full Asset type for the modal
        setSelectedAssetForModal({
            id: asset.id,
            name: asset.name,
            value: asset.value,
            performanceYTD: asset.performanceYTD,
            description: asset.description,
            esgRating: asset.esgRating,
            // Add other required Asset properties if necessary,
            // or modify InvestmentModal to accept Pick<Asset, ...>
            // For now, these are the only ones used by the modal/ESGScore
            category: 'Thematic', // Placeholder category
            lastUpdated: new Date().toISOString()
        });
    };

    if (loading) return <div className="text-gray-400 text-center py-4">Exploring thematic opportunities...</div>;
    if (themes.length === 0) return <div className="text-gray-400 text-center py-4">No thematic categories available.</div>;

    return (
        <div className="space-y-6">
            {themes.map(theme => (
                <div key={theme.id} className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h4 className="text-xl font-bold text-white mb-2">{theme.name}</h4>
                    <p className="text-gray-400 text-sm mb-4">{theme.description}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                        {theme.impactMetrics.map((metric, i) => (
                            <div key={i} className="flex items-center text-sm text-cyan-300">
                                <span className="mr-1 text-cyan-500">⭐</span>
                                {metric.name}: <span className="font-semibold ml-1">{metric.value.toLocaleString()} {metric.unit}</span>
                            </div>
                        ))}
                        <div className="flex items-center text-sm text-gray-300">
                            <span className="mr-1 text-yellow-500">📈</span>
                            Growth Potential: <span className="font-semibold ml-1 capitalize">{theme.growthPotential}</span>
                        </div>
                    </div>
                    <h5 className="text-md font-semibold text-gray-300 mb-3">Suggested Assets:</h5>
                    <div className="space-y-3">
                        {theme.potentialAssets.map(asset => (
                            <div key={asset.id} className="p-3 bg-gray-700/30 rounded-md flex justify-between items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <ESGScore rating={asset.esgRating || 0} />
                                        <span className="font-medium text-white">{asset.name}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">{asset.description}</p>
                                </div>
                                <button onClick={() => handleInvestInThemeAsset(asset)} className="text-sm px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg transition-colors flex-shrink-0">
                                    Invest
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <InvestmentModal asset={selectedAssetForModal} onClose={() => setSelectedAssetForModal(null)} onInvest={onInvest} />
        </div>
    );
};

export const AIInvestmentRecommendations: React.FC<{ assets: Asset[], onInvest: (assetName: string, amount: number, type: 'buy' | 'sell' | 'add_contribution') => void }> = ({ assets, onInvest }) => {
    const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssetForModal, setSelectedAssetForModal] = useState<Asset | null>(null);

    useEffect(() => {
        // Fetch recommendations for a few sample assets, or a more intelligent selection
        const fetchRecs = async () => {
            setLoading(true);
            const recPromises = assets.slice(0, 3).map(asset => FinancialAPI.fetchAIPredictions(asset.id));
            const allRecs = (await Promise.all(recPromises)).flat();
            setRecommendations(allRecs);
            setLoading(false);
        };
        fetchRecs();
    }, [assets]);

    const getRecommendationColor = (rec: InvestmentRecommendation['recommendation']) => {
        switch (rec) {
            case 'buy': return 'text-green-400';
            case 'sell': return 'text-red-400';
            case 'hold': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const handleInvestRecommendation = (rec: InvestmentRecommendation) => {
        const asset = assets.find(a => a.id === rec.assetId);
        if (asset) {
            setSelectedAssetForModal(asset);
        }
    };

    if (loading) return <div className="text-gray-400 text-center py-4">Generating AI-powered insights...</div>;
    if (recommendations.length === 0) return <div className="text-gray-400 text-center py-4">No AI recommendations currently.</div>;

    return (
        <div className="space-y-4">
            {recommendations.map(rec => (
                <div key={rec.id} className="p-4 bg-gray-700/30 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex-grow">
                        <div className="flex items-center mb-1">
                            <span className={`font-bold ${getRecommendationColor(rec.recommendation)} text-lg mr-2`}>
                                {rec.recommendation.toUpperCase()}
                            </span>
                            <h5 className="font-semibold text-white text-lg">{rec.assetName}</h5>
                        </div>
                        <p className="text-sm text-gray-400">{rec.reasoning}</p>
                        <div className="text-xs text-gray-500 mt-2">
                            <span>Risk Score: {rec.riskScore}/10</span>
                            <span className="mx-2">|</span>
                            <span>Confidence: {rec.confidenceScore}%</span>
                            {rec.targetPrice && <><span className="mx-2">|</span><span>Target: ${rec.targetPrice.toFixed(2)}</span></>}
                        </div>
                    </div>
                    <button onClick={() => handleInvestRecommendation(rec)} className="w-full sm:w-auto text-sm px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg transition-colors flex-shrink-0">
                        Take Action
                    </button>
                </div>
            ))}
            <InvestmentModal asset={selectedAssetForModal} onClose={() => setSelectedAssetForModal(null)} onInvest={onInvest} />
        </div>
    );
};

export const EconomicCalendar: React.FC = () => {
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        FinancialAPI.fetchEconomicCalendar().then(data => {
            setEvents(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            setLoading(false);
        });
    }, []);

    const getImpactColor = (impact: EconomicEvent['impact']) => {
        switch (impact) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) return <div className="text-gray-400 text-center py-4">Loading economic events...</div>;
    if (events.length === 0) return <div className="text-gray-400 text-center py-4">No upcoming economic events.</div>;

    return (
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {events.map(event => (
                <div key={event.id} className="p-3 bg-gray-700/30 rounded-lg flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full ${getImpactColor(event.impact)} mt-1.5 flex-shrink-0`} title={`Impact: ${event.impact}`}></div>
                    <div className="flex-grow">
                        <p className="text-sm font-semibold text-white">{event.event} <span className="text-gray-400 text-xs">({event.country})</span></p>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.date).toLocaleDateString()} {event.time} | Forecast: {event.forecast} | Actual: <span className="font-medium text-white">{event.actual}</span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const UserAchievementsDisplay: React.FC = () => {
    const [achievements, setAchievements] = useState<UserAchievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        FinancialAPI.fetchUserAchievements().then(data => {
            setAchievements(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-gray-400 text-center py-4">Loading achievements...</div>;
    if (achievements.length === 0) return <div className="text-gray-400 text-center py-4">No achievements earned yet. Keep investing!</div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements.map(achievement => (
                <div key={achievement.id} className="p-4 bg-gray-700/30 rounded-lg text-center flex flex-col items-center justify-center group relative overflow-hidden">
                    <img src={achievement.badgeUrl} alt={achievement.name} className="w-12 h-12 mb-2 filter grayscale group-hover:grayscale-0 transition-all duration-300" />
                    <h5 className="font-semibold text-white text-sm group-hover:text-cyan-400 transition-colors">{achievement.name}</h5>
                    <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-center">
                        <p className="text-xs text-gray-300">{achievement.description}<br/><span className="mt-1 block text-gray-500">Achieved: {new Date(achievement.dateAchieved).toLocaleDateString()}</span></p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const PortfolioCarbonFootprint: React.FC = () => {
    const [carbonData, setCarbonData] = useState<CarbonFootprintData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        FinancialAPI.fetchPortfolioCarbonFootprint().then(data => {
            setCarbonData(data);
            setLoading(false);
        });
    }, []);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#AF19FF', '#FF00FF'];

    if (loading) return <div className="text-gray-400 text-center py-4">Analyzing portfolio carbon footprint...</div>;
    if (!carbonData) return <div className="text-gray-400 text-center py-4">Carbon footprint data not available.</div>;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-700/30 rounded-lg">
                    <h5 className="font-medium text-gray-300 text-sm">Total Emissions</h5>
                    <p className="text-xl font-bold text-white mt-1">{carbonData.totalEmissionsTonnesCO2e.toLocaleString()} <span className="text-sm font-normal text-gray-400">tonnes CO2e/year</span></p>
                    <p className="text-xs text-gray-500 mt-1">Intensity: {carbonData.intensityPerMillionRevenue.toFixed(1)} tCO2e / $M revenue</p>
                </div>
                <div className="p-3 bg-gray-700/30 rounded-lg">
                    <h5 className="font-medium text-gray-300 text-sm">Vs. Industry Benchmark</h5>
                    <p className={`text-xl font-bold mt-1 ${carbonData.comparisonToBenchmark < 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {carbonData.comparisonToBenchmark}% {carbonData.comparisonToBenchmark < 0 ? 'Lower' : 'Higher'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Your portfolio's footprint relative to its sector benchmark.</p>
                </div>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
                <h5 className="font-semibold text-white mb-2">Emissions Breakdown by Sector</h5>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={carbonData.breakdownBySector}
                                dataKey="emissions"
                                nameKey="sector"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {carbonData.breakdownBySector.map((entry, index) => (
                                    <Cell key={`cell-carbon-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}
                                formatter={(value: number) => [`${value.toFixed(0)} tonnes CO2e`, 'Emissions']}
                            />
                            <Legend align="right" verticalAlign="middle" layout="vertical" wrapperStyle={{ paddingLeft: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <p className="text-xs text-gray-500 text-right">Last updated: {new Date(carbonData.lastUpdated).toLocaleDateString()}</p>
        </div>
    );
};

export const PortfolioFactorExposure: React.FC = () => {
    const [factors, setFactors] = useState<FactorExposure[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        FinancialAPI.fetchFactorExposures().then(data => {
            setFactors(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-gray-400 text-center py-4">Calculating factor exposures...</div>;
    if (factors.length === 0) return <div className="text-gray-400 text-center py-4">No factor exposure data available.</div>;

    return (
        <div className="space-y-4">
            {factors.map(factor => (
                <div key={factor.factor} className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                        <h5 className="font-semibold text-white text-md">{factor.factor}</h5>
                        <span className={`font-bold text-lg ${factor.exposure > 0 ? 'text-green-400' : factor.exposure < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {factor.exposure.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">{factor.description}</p>
                    <div className="w-full bg-gray-600 rounded-full h-1.5 mt-2">
                        <div
                            className={`h-1.5 rounded-full ${factor.exposure > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{
                                width: `${Math.abs(factor.exposure) * 100 / (factors.reduce((max, f) => Math.max(max, Math.abs(f.exposure)), 0) || 1)}%`,
                                marginLeft: factor.exposure < 0 ? `${50 - Math.abs(factor.exposure) * 50 / (factors.reduce((max, f) => Math.max(max, Math.abs(f.exposure)), 0) || 1)}%` : '50%' // Center around 0
                            }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};


export const AlternativeInvestmentsShowcase: React.FC<{ onInvest: (assetName: string, amount: number, type: 'buy' | 'sell' | 'add_contribution') => void }> = ({ onInvest }) => {
    const [altAssets, setAltAssets] = useState<AlternativeAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssetForModal, setSelectedAssetForModal] = useState<Asset | null>(null);

    useEffect(() => {
        FinancialAPI.fetchAlternativeInvestments().then(data => {
            setAltAssets(data);
            setLoading(false);
        });
    }, []);

    const handleInvestInAltAsset = (altAsset: AlternativeAsset) => {
        setSelectedAssetForModal({
            id: altAsset.id,
            name: altAsset.name,
            value: altAsset.value,
            performanceYTD: altAsset.performanceYTD,
            description: altAsset.description,
            category: altAsset.assetType, // Use assetType as category
            lastUpdated: new Date().toISOString()
            // ESG rating might not be applicable or needs a placeholder
        });
    };

    if (loading) return <div className="text-gray-400 text-center py-4">Discovering alternative investments...</div>;
    if (altAssets.length === 0) return <div className="text-gray-400 text-center py-4">No alternative investments available.</div>;

    return (
        <div className="space-y-4">
            {altAssets.map(asset => (
                <div key={asset.id} className="p-4 bg-gray-700/30 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex-grow">
                        <h5 className="font-semibold text-white text-lg">{asset.name} <span className="text-sm text-gray-400 ml-2">({asset.assetType})</span></h5>
                        <p className="text-sm text-gray-400 mt-1">{asset.description}</p>
                        <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            <span>Expected Return: <span className="font-medium text-white">{asset.expectedReturn}%</span></span>
                            <span>Min Investment: <span className="font-medium text-white">${asset.minInvestment.toLocaleString()}</span></span>
                            <span>Liquidity: <span className="font-medium text-white capitalize">{asset.liquidity}</span></span>
                            <span>Risk: <span className="font-medium text-white capitalize">{asset.riskProfile}</span></span>
                        </div>
                    </div>
                    <button onClick={() => handleInvestInAltAsset(asset)} className="w-full sm:w-auto text-sm px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg transition-colors flex-shrink-0">
                        Explore & Invest
                    </button>
                </div>
            ))}
            <InvestmentModal asset={selectedAssetForModal} onClose={() => setSelectedAssetForModal(null)} onInvest={onInvest} />
        </div>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT: InvestmentsView (CapitalVista) - Heavily Expanded
// ================================================================================================

const InvestmentsView: React.FC = () => {
    const context = useContext(DataContext);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [selectedImpactAsset, setSelectedImpactAsset] = useState<Asset | null>(null);

    if (!context) {
        throw new Error("InvestmentsView must be within a DataProvider.");
    }

    const { assets, impactInvestments, addTransaction } = context;

    const totalValue = useMemo(() => assets.reduce((sum, asset) => sum + asset.value, 0), [assets]);

    /**
     * @description Calculates the projected growth of the investment portfolio over 10 years,
     * factoring in a constant monthly contribution and a fixed annual growth rate. Now with AI factor.
     */
    const projectionData = useMemo(() => {
        let futureValue = totalValue;
        const data = [{ year: 'Now', value: futureValue }];
        const baseGrowthRate = 1.07; // 7% annual growth
        const aiAdjustmentFactor = 1.005; // AI-suggested slight boost or dampening
        for (let i = 1; i <= 10; i++) {
            futureValue = (futureValue + monthlyContribution * 12) * baseGrowthRate * aiAdjustmentFactor;
            data.push({ year: `Year ${i}`, value: futureValue });
        }
        return data;
    }, [totalValue, monthlyContribution]);

    const handleInvest = useCallback((assetName: string, amount: number, type: 'buy' | 'sell' | 'add_contribution' = 'buy') => {
        // FIX: The `addTransaction` function expects an object of type `Omit<Transaction, 'id'>`.
        // The `id` property is generated by the backend and should not be sent in the request.
        let transactionType: Transaction['type'];
        let descriptionPrefix: string;

        switch (type) {
            case 'buy':
                transactionType = 'expense';
                descriptionPrefix = `Invested in`;
                break;
            case 'sell':
                transactionType = 'income'; // Selling an asset can be considered income for simplification
                descriptionPrefix = `Sold`;
                break;
            case 'add_contribution':
                transactionType = 'expense'; // This means adding money from external source
                descriptionPrefix = `Added contribution to`;
                break;
            default:
                transactionType = 'expense';
                descriptionPrefix = `Action on`;
        }

        addTransaction({
            type: transactionType,
            category: 'Investments',
            description: `${descriptionPrefix} ${assetName}`,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
        });
        alert(`Successfully ${type === 'buy' ? 'invested' : type === 'sell' ? 'sold' : 'contributed'} $${amount.toLocaleString()} in ${assetName}. See the new transaction in your history.`);
    }, [addTransaction]);


    return (
        <>
            <div className="space-y-8"> {/* Increased spacing for more distinct sections */}
                <h2 className="text-4xl font-extrabold text-white tracking-tight mb-6">CapitalVista: The Universe of Your Wealth</h2>

                {/* Main Portfolio Overview */}
                <InvestmentPortfolio />

                {/* Market Intelligence & AI Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="AI Market News Feed" subtitle="Real-time sentiment analysis">
                        <MarketNewsFeed />
                    </Card>
                    <Card title="Economic Calendar" subtitle="Key events impacting your portfolio">
                        <EconomicCalendar />
                    </Card>
                </div>

                {/* Performance and Growth Simulation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Asset Performance (YTD)">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={assets} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" stroke="#9ca3af" domain={[0, 50]} unit="%" />
                                    <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Bar dataKey="performanceYTD" name="YTD Performance" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="AI Growth Simulator & Projection">
                        <div className="mb-4">
                            <label className="block text-sm text-gray-300">Monthly Contribution: <span className="font-bold text-white">${monthlyContribution.toLocaleString()}</span></label>
                            <input
                                type="range"
                                min="0"
                                max="5000" // Increased max contribution
                                step="100"
                                value={monthlyContribution}
                                onChange={e => setMonthlyContribution(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                aria-label="Monthly investment contribution"
                            />
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={projectionData}>
                                    <defs><linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                                    <XAxis dataKey="year" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => [`$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`, "Projected Value"]} />
                                    <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#colorGrowth)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">Projection incorporates a 7% annual growth rate with AI-driven adjustments. Actual results may vary.</p>
                    </Card>
                </div>

                {/* Advanced Performance & Risk Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Portfolio vs. Benchmark" subtitle="How your wealth compares">
                        <PortfolioBenchmarkChart totalValue={totalValue} />
                    </Card>
                    <Card title="Advanced Risk Metrics" subtitle="Understand your portfolio's vulnerabilities">
                        <PortfolioRiskMetrics />
                    </Card>
                </div>

                {/* Goal-Based Planning & Asset Allocation */}
                <Card title="Goal-Based Investment Planning" subtitle="Track progress towards your life aspirations">
                    <FinancialGoalTracker />
                </Card>

                <Card title="Dynamic Asset Allocation & Rebalancing" subtitle="Optimize your portfolio for sustained growth">
                    <AssetAllocationPlanner />
                </Card>

                {/* AI-Powered Recommendations */}
                <Card title="AI Investment Recommendations" subtitle="Intelligent suggestions based on market data & your profile">
                    <AIInvestmentRecommendations assets={assets} onInvest={handleInvest} />
                </Card>

                {/* Social Impact & Thematic Investing Section */}
                <Card title="Social Impact Investing (ESG)" subtitle="Align your investments with global well-being">
                    <p className="text-sm text-gray-400 mb-4">Invest in companies that align with your values. All options below are highly rated for their Environmental, Social, and Governance practices.</p>
                    <div className="space-y-4">
                        {impactInvestments.map(asset => (
                            <div key={asset.name} className="p-4 bg-gray-800/50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-4">
                                        <ESGScore rating={asset.esgRating || 0} />
                                        <h4 className="font-semibold text-white">{asset.name}</h4>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">{asset.description}</p>
                                </div>
                                <button onClick={() => setSelectedImpactAsset(asset)} className="w-full sm:w-auto text-sm px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg transition-colors flex-shrink-0">
                                    Invest Now
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card title="Thematic Investment Explorer" subtitle="Discover trends that drive impact & returns">
                    <ThematicInvestmentExplorer onInvest={handleInvest} />
                </Card>

                {/* ESG Deep Dive: Carbon Footprint */}
                <Card title="Portfolio Carbon Footprint" subtitle="Measure your environmental impact">
                    <PortfolioCarbonFootprint />
                </Card>

                {/* Factor Exposure Analysis */}
                <Card title="Portfolio Factor Exposure" subtitle="Understand underlying risk and return drivers">
                    <PortfolioFactorExposure />
                </Card>

                {/* Alternative Investments */}
                <Card title="Alternative Investments Hub" subtitle="Diversify beyond traditional assets (Real Estate, Crypto, PE, etc.)">
                    <AlternativeInvestmentsShowcase onInvest={handleInvest} />
                </Card>

                {/* Gamification & Learning */}
                <Card title="Your CapitalVista Achievements" subtitle="Celebrate your financial milestones">
                    <UserAchievementsDisplay />
                </Card>

            </div>
            <InvestmentModal
                asset={selectedImpactAsset}
                onClose={() => setSelectedImpactAsset(null)}
                onInvest={handleInvest}
            />
        </>
    );
};

export default InvestmentsView;
```