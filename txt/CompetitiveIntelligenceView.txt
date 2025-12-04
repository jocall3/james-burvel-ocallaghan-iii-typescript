// components/views/megadashboard/business/CompetitiveIntelligenceView.tsx
import React, { useContext, useMemo, useState, useCallback, useEffect } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend, BarChart, XAxis, YAxis, Tooltip, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- Utility Types and Interfaces ---

export interface CompetitorFinancials {
    revenue: number; // in millions
    profitMargin: number; // percentage
    marketCap: number; // in billions
    growthRate: number; // annual percentage
    roa: number; // return on assets
    roe: number; // return on equity
    debtToEquity: number;
}

export interface CompetitorProductFeature {
    name: string;
    ourRating: number; // 1-5
    competitorRating: number; // 1-5
    description: string;
    isKeyDifferentiator: boolean;
}

export interface CompetitorProduct {
    id: string;
    name: string;
    category: string;
    pricingModel: string; // e.g., "Subscription", "Transaction-based", "Freemium"
    basePrice: number;
    features: CompetitorProductFeature[];
    userReviews: { score: number; comment: string; sentiment: 'positive' | 'negative' | 'neutral' }[];
    marketShare: number; // percentage
    startDate: string; // YYYY-MM-DD
}

export interface CompetitorInvestment {
    date: string; // YYYY-MM-DD
    investor: string;
    amount: number; // in millions
    round: string;
}

export interface CompetitorExecutive {
    name: string;
    role: string;
    tenure: string;
    pastExperience: string[];
}

export interface Competitor {
    id: string;
    name: string;
    logoUrl: string;
    industry: string;
    hqLocation: string;
    foundingYear: number;
    marketSegments: string[];
    description: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    financials: CompetitorFinancials;
    products: CompetitorProduct[];
    investments: CompetitorInvestment[];
    executives: CompetitorExecutive[];
    strategicMoves: { date: string; description: string; impact: string }[];
    newsArticles: NewsArticle[];
    socialMediaMentions: SocialMediaMention[];
    customerBaseSize: number;
    churnRate: number; // percentage
    customerSatisfactionScore: number; // CSAT 1-100
    employeeCount: number;
}

export interface MarketTrend {
    id: string;
    name: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    category: string; // e.g., "Regulatory", "Technological", "Societal"
    growthProjection: number; // annual percentage
    startDate: string; // YYYY-MM-DD
}

export interface RegulatoryUpdate {
    id: string;
    title: string;
    description: string;
    effectiveDate: string;
    impactLevel: 'low' | 'medium' | 'high';
    affectedProducts: string[];
}

export interface NewsArticle {
    id: string;
    title: string;
    source: string;
    date: string; // YYYY-MM-DD
    url: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords: string[];
    summary: string;
}

export interface SocialMediaMention {
    id: string;
    platform: string;
    username: string;
    date: string; // YYYY-MM-DD
    content: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    likes: number;
    reposts: number;
    comments: number;
    keywords: string[];
}

export interface Recommendation {
    id: string;
    category: string; // e.g., "Product Development", "Marketing", "Pricing", "Operations"
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    potentialImpact: string;
    aiConfidence: number; // 0-100
}

export interface UserInteractionLog {
    timestamp: string;
    action: string;
    details: string;
}

export interface CompetitorBenchmarkingData {
    metric: string;
    ourValue: number;
    competitorValue: number;
    unit: string;
}

// --- Simulated Data Generation Utilities ---

const generateRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

const generateRandomNumber = (min: number, max: number, decimals: number = 0) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateFinancials = (): CompetitorFinancials => ({
    revenue: generateRandomNumber(500, 5000, 0), // millions
    profitMargin: generateRandomNumber(10, 40, 2), // percentage
    marketCap: generateRandomNumber(5, 50, 2), // billions
    growthRate: generateRandomNumber(5, 25, 2), // percentage
    roa: generateRandomNumber(5, 15, 2),
    roe: generateRandomNumber(10, 30, 2),
    debtToEquity: generateRandomNumber(0.1, 1.5, 2),
});

const generateProductFeature = (name: string): CompetitorProductFeature => ({
    name,
    ourRating: generateRandomNumber(1, 5),
    competitorRating: generateRandomNumber(1, 5),
    description: `Detailed description for ${name} feature.`,
    isKeyDifferentiator: Math.random() > 0.7,
});

const generateProduct = (id: string, competitorName: string): CompetitorProduct => {
    const categories = ['Savings', 'Checking', 'Loans', 'Investments', 'Credit Cards', 'Wealth Management'];
    const pricingModels = ['Subscription', 'Transaction-based', 'Freemium', 'Tiered'];
    const featureNames = ['Online Banking', 'Mobile App', '24/7 Support', 'Low Fees', 'High Interest', 'Quick Approvals', 'Advanced Analytics'];

    return {
        id: `prod-${id}`,
        name: `${competitorName} ${pickRandom(categories)} Product ${id}`,
        category: pickRandom(categories),
        pricingModel: pickRandom(pricingModels),
        basePrice: generateRandomNumber(0, 50),
        features: featureNames.map(generateProductFeature),
        userReviews: Array.from({ length: generateRandomNumber(5, 20) }).map(() => {
            const score = generateRandomNumber(1, 5);
            let sentiment: 'positive' | 'negative' | 'neutral';
            if (score >= 4) sentiment = 'positive';
            else if (score <= 2) sentiment = 'negative';
            else sentiment = 'neutral';
            return {
                score,
                comment: `User review comment for product ${id} with score ${score}.`,
                sentiment,
            };
        }),
        marketShare: generateRandomNumber(1, 15, 2),
        startDate: generateRandomDate(new Date('2010-01-01'), new Date('2022-01-01')),
    };
};

const generateInvestment = (competitorName: string): CompetitorInvestment => ({
    date: generateRandomDate(new Date('2015-01-01'), new Date('2023-01-01')),
    investor: pickRandom(['Sequoia Capital', 'Andreessen Horowitz', 'SoftBank', 'Tiger Global', 'BlackRock']),
    amount: generateRandomNumber(10, 500), // millions
    round: pickRandom(['Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'IPO']),
});

const generateExecutive = (): CompetitorExecutive => ({
    name: `Exec ${Math.random().toString(36).substring(7)}`,
    role: pickRandom(['CEO', 'CTO', 'CFO', 'CMO', 'Head of Product']),
    tenure: `${generateRandomNumber(1, 10)} years`,
    pastExperience: Array.from({ length: generateRandomNumber(1, 3) }).map(() => `Company ${Math.random().toString(36).substring(7)}`),
});

const generateNewsArticle = (competitorName: string): NewsArticle => {
    const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];
    return {
        id: `news-${Math.random().toString(36).substring(7)}`,
        title: `${competitorName} in the News: ${Math.random().toString(36).substring(2, 10)}`,
        source: pickRandom(['TechCrunch', 'Bloomberg', 'Reuters', 'Wall Street Journal', 'Financial Times']),
        date: generateRandomDate(new Date('2023-01-01'), new Date()),
        url: `https://example.com/news/${Math.random().toString(36).substring(7)}`,
        sentiment: pickRandom(sentiments),
        keywords: pickRandom([['finance', 'tech'], ['investment', 'growth'], ['regulation', 'market']]),
        summary: `Summary of the news article about ${competitorName} and its recent activities.`,
    };
};

const generateSocialMediaMention = (competitorName: string): SocialMediaMention => {
    const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];
    return {
        id: `social-${Math.random().toString(36).substring(7)}`,
        platform: pickRandom(['Twitter', 'LinkedIn', 'Reddit', 'Facebook']),
        username: `@user${Math.random().toString(36).substring(7)}`,
        date: generateRandomDate(new Date('2023-01-01'), new Date()),
        content: `A social media post mentioning ${competitorName}: ${Math.random().toString(36).substring(2, 20)}`,
        sentiment: pickRandom(sentiments),
        likes: generateRandomNumber(0, 1000),
        reposts: generateRandomNumber(0, 200),
        comments: generateRandomNumber(0, 50),
        keywords: pickRandom([['#fintech', '#innovation'], ['#banking', '#competitor']]),
    };
};

const generateCompetitor = (id: string, name: string): Competitor => {
    const marketSegments = ['Retail Banking', 'SME Banking', 'Corporate Banking', 'Wealth Management', 'Digital Payments'];
    const descriptions = [
        `Leading digital-first bank focusing on seamless user experience.`,
        `Traditional banking giant with a strong physical presence and expanding digital offerings.`,
        `Niche fintech player specializing in lending solutions for small businesses.`,
        `Global investment bank with a growing retail arm.`,
    ];
    const strengths = ['Strong brand recognition', 'Robust technology stack', 'Extensive customer base', 'Innovative product development'];
    const weaknesses = ['Legacy systems', 'High operational costs', 'Limited digital presence', 'Niche market focus'];
    const opportunities = ['Market expansion', 'Strategic partnerships', 'Emerging technologies', 'Regulatory changes'];
    const threats = ['New market entrants', 'Economic downturn', 'Cybersecurity risks', 'Intense price competition'];

    const numProducts = generateRandomNumber(2, 5);
    const numInvestments = generateRandomNumber(0, 3);
    const numExecutives = generateRandomNumber(3, 7);
    const numNews = generateRandomNumber(3, 10);
    const numSocial = generateRandomNumber(5, 15);
    const strategicMovesDescriptions = [
        'Acquired a smaller fintech startup to expand digital offerings.',
        'Launched a new AI-powered customer service platform.',
        'Expanded into a new international market.',
        'Announced a partnership with a major e-commerce provider.',
        'Revised pricing model for premium accounts.',
    ];
    const impactLevels = ['Low', 'Medium', 'High'];

    return {
        id,
        name,
        logoUrl: `/logos/${name.toLowerCase().replace(/\s/g, '')}.png`, // Placeholder
        industry: 'Fintech/Banking',
        hqLocation: pickRandom(['New York', 'London', 'Singapore', 'Berlin', 'San Francisco']),
        foundingYear: generateRandomNumber(1980, 2020),
        marketSegments: Array.from({ length: generateRandomNumber(1, 3) }).map(() => pickRandom(marketSegments)),
        description: pickRandom(descriptions),
        strengths: Array.from({ length: generateRandomNumber(2, 4) }).map(() => pickRandom(strengths)),
        weaknesses: Array.from({ length: generateRandomNumber(2, 4) }).map(() => pickRandom(weaknesses)),
        opportunities: Array.from({ length: generateRandomNumber(2, 4) }).map(() => pickRandom(opportunities)),
        threats: Array.from({ length: generateRandomNumber(2, 4) }).map(() => pickRandom(threats)),
        financials: generateFinancials(),
        products: Array.from({ length: numProducts }).map((_, i) => generateProduct(`${id}-${i}`, name)),
        investments: Array.from({ length: numInvestments }).map(() => generateInvestment(name)),
        executives: Array.from({ length: numExecutives }).map(generateExecutive),
        strategicMoves: Array.from({ length: generateRandomNumber(2, 5) }).map(() => ({
            date: generateRandomDate(new Date('2022-01-01'), new Date()),
            description: pickRandom(strategicMovesDescriptions),
            impact: pickRandom(impactLevels),
        })),
        newsArticles: Array.from({ length: numNews }).map(() => generateNewsArticle(name)),
        socialMediaMentions: Array.from({ length: numSocial }).map(() => generateSocialMediaMention(name)),
        customerBaseSize: generateRandomNumber(100000, 10000000),
        churnRate: generateRandomNumber(0.5, 5, 2),
        customerSatisfactionScore: generateRandomNumber(70, 95),
        employeeCount: generateRandomNumber(1000, 50000),
    };
};

const generateMarketTrend = (): MarketTrend => {
    const categories = ['Regulatory', 'Technological', 'Economic', 'Societal'];
    const impacts = ['low', 'medium', 'high'];
    return {
        id: `trend-${Math.random().toString(36).substring(7)}`,
        name: `Trend: ${Math.random().toString(36).substring(2, 10)}`,
        description: `Description for market trend focusing on ${pickRandom(categories)} changes.`,
        impact: pickRandom(impa<ctrl60>```typescript
// components/views/megadashboard/business/CompetitiveIntelligenceView.tsx
import React, { useContext, useMemo, useState, useCallback, useEffect } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend, BarChart, XAxis, YAxis, Tooltip, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- Utility Types and Interfaces ---

export interface CompetitorFinancials {
    revenue: number; // in millions
    profitMargin: number; // percentage
    marketCap: number; // in billions
    growthRate: number; // annual percentage
    roa: number; // return on assets
    roe: number; // return on equity
    debtToEquity: number;
}

export interface CompetitorProductFeature {
    name: string;
    ourRating: number; // 1-5
    competitorRating: number; // 1-5
    description: string;
    isKeyDifferentiator: boolean;
}

export interface CompetitorProduct {
    id: string;
    name: string;
    category: string;
    pricingModel: string; // e.g., "Subscription", "Transaction-based", "Freemium"
    basePrice: number;
    features: CompetitorProductFeature[];
    userReviews: { score: number; comment: string; sentiment: 'positive' | 'negative' | 'neutral' }[];
    marketShare: number; // percentage
    startDate: string; // YYYY-MM-DD
}

export interface CompetitorInvestment {
    date: string; // YYYY-MM-DD
    investor: string;
    amount: number; // in millions
    round: string;
}

export interface CompetitorExecutive {
    name: string;
    role: string;
    tenure: string;
    pastExperience: string[];
}

export interface Competitor {
    id: string;
    name: string;
    logoUrl: string;
    industry: string;
    hqLocation: string;
    foundingYear: number;
    marketSegments: string[];
    description: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    financials: CompetitorFinancials;
    products: CompetitorProduct[];
    investments: CompetitorInvestment[];
    executives: CompetitorExecutive[];
    strategicMoves: { date: string; description: string; impact: string }[];
    newsArticles: NewsArticle[];
    socialMediaMentions: SocialMediaMention[];
    customerBaseSize: number;
    churnRate: number; // percentage
    customerSatisfactionScore: number; // CSAT 1-100
    employeeCount: number;
}

export interface MarketTrend {
    id: string;
    name: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    category: string; // e.g., "Regulatory", "Technological", "Societal"
    growthProjection: number; // annual percentage
    startDate: string; // YYYY-MM-DD
}

export interface RegulatoryUpdate {
    id: string;
    title: string;
    description: string;
    effectiveDate: string;
    impactLevel: 'low' | 'medium' | 'high';
    affectedProducts: string[];
}

export interface NewsArticle {
    id: string;
    title: string;
    source: string;
    date: string; // YYYY-MM-DD
    url: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords: string[];
    summary: string;
}

export interface SocialMediaMention {
    id: string;
    platform: string;
    username: string;
    date: string; // YYYY-MM-DD
    content: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    likes: number;
    reposts: number;
    comments: number;
    keywords: string[];
}

export interface Recommendation {
    id: string;
    category: string; // e.g., "Product Development", "Marketing", "Pricing", "Operations"
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    potentialImpact: string;
    aiConfidence: number; // 0-100
}

export interface UserInteractionLog {
    timestamp: string;
    action: string;
    details: string;
}

export interface CompetitorBenchmarkingData {
    metric: string;
    ourValue: number;
    competitorValue: number;
    unit: string;
}

// --- Simulated Data Generation Utilities ---

const generateRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

const generateRandomNumber = (min: number, max: number, decimals: number = 0) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateFinancials = (): CompetitorFinancials => ({
    revenue: generateRandomNumber(500, 5000, 0), // millions
    profitMargin: generateRandomNumber(10, 40, 2), // percentage
    marketCap: generateRandomNumber(5, 50, 2), // billions
    growthRate: generateRandomNumber(5, 25, 2), // percentage
    roa: generateRandomNumber(5, 15, 2),
    roe: generateRandomNumber(10, 30, 2),
    debtToEquity: generateRandomNumber(0.1, 1.5, 2),
});

const generateProductFeature = (name: string): CompetitorProductFeature => ({
    name,
    ourRating: generateRandomNumber(1, 5),
    competitorRating: generateRandomNumber(1, 5),
    description: `Detailed description for ${name} feature.`,
    isKeyDifferentiator: Math.random() > 0.7,
});

const generateProduct = (id: string, competitorName: string): CompetitorProduct => {
    const categories = ['Savings', 'Checking', 'Loans', 'Investments', 'Credit Cards', 'Wealth Management'];
    const pricingModels = ['Subscription', 'Transaction-based', 'Freemium', 'Tiered'];
    const featureNames = ['Online Banking', 'Mobile App', '24/7 Support', 'Low Fees', 'High Interest', 'Quick Approvals', 'Advanced Analytics'];

    return {
        id: `prod-${id}`,
        name: `${competitorName} ${pickRandom(categories)} Product ${id}`,
        category: pickRandom(categories),
        pricingModel: pickRandom(pricingModels),
        basePrice: generateRandomNumber(0, 50),
        features: featureNames.map(generateProductFeature),
        userReviews: Array.from({ length: generateRandomNumber(5, 20) }).map(() => {
            const score = generateRandomNumber(1, 5);
            let sentiment: 'positive' | 'negative' | 'neutral';
            if (score >= 4) sentiment = 'positive';
            else if (score <= 2) sentiment = 'negative';
            else sentiment = 'neutral';
            return {
                score,
                comment: `User review comment for product ${id} with score ${score}.`,
                sentiment,
            };
        }),
        marketShare: generateRandomNumber(1, 15, 2),
        startDate: generateRandomDate(new Date('2010-01-01'), new Date('2022-01-01')),
    };
};

const generateInvestment = (competitorName: string): CompetitorInvestment => ({
    date: generateRandomDate(new Date('2015-01-01'), new Date('2023-01-01')),
    investor: pickRandom(['Sequoia Capital', 'Andreessen Horowitz', 'SoftBank', 'Tiger Global', 'BlackRock']),
    amount: generateRandomNumber(10, 500), // millions
    round: pickRandom(['Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'IPO']),
});

const generateExecutive = (): CompetitorExecutive => ({
    name: `Exec ${Math.random().toString(36).substring(7)}`,
    role: pickRandom(['CEO', 'CTO', 'CFO', 'CMO', 'Head of Product']),
    tenure: `${generateRandomNumber(1, 10)} years`,
    pastExperience: Array.from({ length: generateRandomNumber(1, 3) }).map(() => `Company ${Math.random().toString(36).substring(7)}`),
});

const generateNewsArticle = (competitorName: string): NewsArticle => {
    const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];
    return {
        id: `news-${Math.random().toString(36).substring(7)}`,
        title: `${competitorName} in the News: ${Math.random().toString(36).substring(2, 10)}`,
        source: pickRandom(['TechCrunch', 'Bloomberg', 'Reuters', 'Wall Street Journal', 'Financial Times']),
        date: generateRandomDate(new Date('2023-01-01'), new Date()),
        url: `https://example.com/news/${Math.random().toString(36).substring(7)}`,
        sentiment: pickRandom(sentiments),
        keywords: pickRandom([['finance', 'tech'], ['investment', 'growth'], ['regulation', 'market']]),
        summary: `Summary of the news article about ${competitorName} and its recent activities.`,
    };
};

const generateSocialMediaMention = (competitorName: string): SocialMediaMention => {
    const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];
    return {
        id: `social-${Math.random().toString(36).substring(7)}`,
        platform: pickRandom(['Twitter', 'LinkedIn', 'Reddit', 'Facebook']),
        username: `@user${Math.random().toString(36).substring(7)}`,
        date: generateRandomDate(new Date('2023-01-01'), new Date()),
        content: `A social media post mentioning ${competitorName}: ${Math.random().toString(36).substring(2, 20)}`,
        sentiment: pickRandom(sentiments),
        likes: generateRandomNumber(0, 1000),
        reposts: generateRandomNumber(0, 200),
        comments: generateRandomNumber(0, 50),
        keywords: pickRandom([['#fintech', '#innovation'], ['#banking', '#competitor']]),
    };
};

const generateCompetitor = (id: string, name: string): Competitor => {
    const marketSegments = ['Retail Banking', 'SME Banking', 'Corporate Banking', 'Wealth Management', 'Digital Payments'];
    const descriptions = [
        `Leading digital-first bank focusing on seamless user experience.`,
        `Traditional banking giant with a strong physical presence and expanding digital offerings.`,
        `Niche fintech player specializing in lending solutions for small businesses.`,
        `Global investment bank with a growing retail arm.`,
    ];
    const strengths = ['Strong brand recognition', 'Robust technology stack', 'Extensive customer base', 'Innovative product development'];
    const weaknesses = ['Legacy systems', 'High operational costs', 'Limited digital presence', 'Niche market focus'];
    const opportunities = ['Market expansion', 'Strategic partnerships', 'Emerging technologies', 'Regulatory changes'];
    const threats = ['New market entrants', 'Economic downturn', 'Cybersecurity risks', 'Intense price competition'];

    const numProducts = generateRandomNumber(2, 5);
    const numInvestments = generateRandomNumber(0, 3);
    const numExecutives = generateRandomNumber(3, 7);
    const numNews = generateRandomNumber(3, 10);
    const numSocial = generateRandomNumber(5, 15);
    const strategicMovesDescriptions = [
        'Acquired a smaller fintech startup to expand digital offerings.',
        'Launched a new AI-powered customer service platform.',
        'Expanded into a new international market.',
        'Announced a partnership with a major e-commerce provider.',
        'Revised pricing model for premium accounts.',
    ];
    const impactLevels = ['Low', 'Medium', 'High'];

    return {
        id,
        name,
        logoUrl: `/logos/${name.toLowerCase().replace(/\s/g, '')}.png`, // Placeholder
        industry: 'Fintech/Banking',
        hqLocation: pickRandom(['New York', 'London', 'Singapore', 'Berlin', 'San Francisco']),
        foundingYear: generateRandomNumber(1980, 2020),
        marketSegments: Array.from({ length: generateRandomNumber(1, 3) }).map(() => pickRandom(marketSegments)),
        description: pickRandom(descriptions),
        strengths: Array.from({ length: generateRandomNumber(2, 4) }).map(() => pickRandom(strengths)),
        weaknesses: Array.from({ length: generateRandomNumber(2, 4) }).map(() => pickRandom(weaknesses)),
        opportunities: Array.from({ length: generateRandomNumber(2, 4) }).map(() => pickRandom(opportunities)),
        threats: Array.from({ length: generateRandomNumber(2, 4) }).map(() => pickRandom(threats)),
        financials: generateFinancials(),
        products: Array.from({ length: numProducts }).map((_, i) => generateProduct(`${id}-${i}`, name)),
        investments: Array.from({ length: numInvestments }).map(() => generateInvestment(name)),
        executives: Array.from({ length: numExecutives }).map(generateExecutive),
        strategicMoves: Array.from({ length: generateRandomNumber(2, 5) }).map(() => ({
            date: generateRandomDate(new Date('2022-01-01'), new Date()),
            description: pickRandom(strategicMovesDescriptions),
            impact: pickRandom(impactLevels),
        })),
        newsArticles: Array.from({ length: numNews }).map(() => generateNewsArticle(name)),
        socialMediaMentions: Array.from({ length: numSocial }).map(() => generateSocialMediaMention(name)),
        customerBaseSize: generateRandomNumber(100000, 10000000),
        churnRate: generateRandomNumber(0.5, 5, 2),
        customerSatisfactionScore: generateRandomNumber(70, 95),
        employeeCount: generateRandomNumber(1000, 50000),
    };
};

const generateMarketTrend = (): MarketTrend => {
    const categories = ['Regulatory', 'Technological', 'Economic', 'Societal'];
    const impacts = ['low', 'medium', 'high'];
    return {
        id: `trend-${Math.random().toString(36).substring(7)}`,
        name: `Trend: ${Math.random().toString(36).substring(2, 10)}`,
        description: `Description for market trend focusing on ${pickRandom(categories)} changes.`,
        impact: pickRandom(impacts),
        category: pickRandom(categories),
        growthProjection: generateRandomNumber(1, 20, 2),
        startDate: generateRandomDate(new Date('2020-01-01'), new Date('2023-01-01')),
    };
};

const generateRegulatoryUpdate = (): RegulatoryUpdate => {
    const impactLevels = ['low', 'medium', 'high'];
    const affected = ['Savings', 'Loans', 'Investments', 'Digital Payments', 'Data Privacy'];
    return {
        id: `reg-${Math.random().toString(36).substring(7)}`,
        title: `New Regulation on ${pickRandom(affected)}`,
        description: `Summary of the new regulatory update affecting ${pickRandom(affected)} products.`,
        effectiveDate: generateRandomDate(new Date('2024-01-01'), new Date('2025-01-01')),
        impactLevel: pickRandom(impactLevels),
        affectedProducts: Array.from({ length: generateRandomNumber(1, 3) }).map(() => pickRandom(affected)),
    };
};

// --- Mock Data Store (Expanded) ---
const mockCompetitors: Competitor[] = [
    generateCompetitor('comp-1', 'FinFuture Inc.'),
    generateCompetitor('comp-2', 'GlobalBank Digital'),
    generateCompetitor('comp-3', 'Innovate Finance'),
    generateCompetitor('comp-4', 'SecureTrust Bank'),
    generateCompetitor('comp-5', 'NextGen Payments'),
];

export const mockMarketTrends: MarketTrend[] = Array.from({ length: 10 }).map(generateMarketTrend);
export const mockRegulatoryUpdates: RegulatoryUpdate[] = Array.from({ length: 7 }).map(generateRegulatoryUpdate);


// --- AI Service Mock/Wrapper (Expanded) ---
export const aiService = {
    _apiKey: process.env.API_KEY as string,
    _model: 'gemini-2.5-flash',
    _ai: new GoogleGenAI({apiKey: process.env.API_KEY as string}),

    async generateContent(prompt: string): Promise<string> {
        if (!this._apiKey) {
            console.warn("API_KEY is not set for GoogleGenAI. Returning mock AI response.");
            return this._mockAiResponse(prompt);
        }
        try {
            const response = await this._ai.models.generateContent({ model: this._model, contents: [{ role: 'user', parts: [{ text: prompt }] }] });
            const result = await response.response;
            return result.text();
        } catch (error) {
            console.error("Error calling Google GenAI:", error);
            return this._mockAiResponse(prompt); // Fallback to mock on error
        }
    },

    _mockAiResponse(prompt: string): string {
        if (prompt.includes("SWOT analysis")) {
            return `**Strengths for Demo Bank:**
- Strong customer loyalty in key demographics.
- Innovative mobile banking features.
- Robust security infrastructure.
- Agile product development cycle.

**Weaknesses for Demo Bank:**
- Limited branch network compared to incumbents.
- Brand recognition still growing in new markets.
- Higher transaction fees for certain services.
- Dependence on third-party APIs for some advanced features.

**Opportunities for Demo Bank:**
- Expansion into underserved market segments.
- Partnerships with fintech startups for specialized services.
- Leveraging AI for personalized financial advice.
- Growing demand for sustainable banking options.

**Threats for Demo Bank:**
- Intense competition from established banks and new fintechs.
- Rapidly changing regulatory landscape.
- Potential for economic downturn impacting consumer spending.
- Cybersecurity breaches impacting customer trust.`;
        } else if (prompt.includes("competitor analysis for FinFuture Inc.")) {
            return `**FinFuture Inc. Deep Dive:**
FinFuture Inc. is a leading digital challenger bank known for its aggressive pricing strategy and a highly intuitive mobile application.

**Key Offerings:**
- Zero-fee checking accounts with high-yield savings options.
- AI-driven budget planning tools.
- Instant loan approvals up to $10,000.
- Integration with popular payment apps.

**Strategic Insights:**
- **Product Focus:** FinFuture prioritizes customer acquisition through low-cost, high-value digital products. Their recent investment in blockchain-based payment solutions indicates a move towards faster, cheaper international transfers.
- **Marketing:** Heavily relies on social media campaigns and influencer marketing, targeting younger, tech-savvy demographics.
- **Technology:** Built on a microservices architecture, allowing for rapid iteration and scalability. They excel in data analytics to personalize user experience.

**Potential Counter-Strategies for Demo Bank:**
1.  **Enhance Value Proposition:** Introduce tiered loyalty programs or premium features that justify Demo Bank's potentially higher fees.
2.  **Target Niche Markets:** Focus on segments less served by FinFuture, e.g., small businesses needing specific financial tools or affluent customers seeking personalized wealth management.
3.  **Customer Service Differentiator:** Emphasize superior, human-centric customer support, leveraging our existing branch network if applicable, as a counterpoint to FinFuture's purely digital approach.`;
        } else if (prompt.includes("product roadmap suggestions")) {
            return `**Product Roadmap Suggestions based on FinFuture Analysis:**

1.  **AI-Powered Financial Assistant (Q2 2025):** Develop a conversational AI that can help users with budgeting, investment advice, and predictive spending analysis, similar to FinFuture's smart tools but with a stronger focus on personalized, actionable insights.
2.  **Gamified Savings Challenges (Q3 2025):** Introduce engaging challenges and rewards within the mobile app to encourage savings, leveraging behavioral economics principles.
3.  **SME Lending Automation (Q4 2025):** Streamline the small business loan application and approval process using AI-driven credit scoring and automated workflows to compete with FinFuture's rapid loan offerings.
4.  **Open Banking API Initiatives (Q1 2026):** Explore partnerships and API integrations to offer a wider ecosystem of financial services, including third-party investment platforms or specialized insurance.`;
        } else if (prompt.includes("pricing strategy recommendation")) {
            return `**Pricing Strategy Recommendation:**

Given FinFuture's aggressive zero-fee model, a direct price match is unsustainable and undesirable for Demo Bank, which offers a broader value.

**Recommendation:**
Adopt a **"Value-Driven Tiered Pricing"** strategy.

1.  **Freemium/Basic Tier (Competitive):** Offer a basic digital-only checking/savings account with essential features and limited or no monthly fees to attract entry-level customers, matching FinFuture on basic functionality.
2.  **Standard Tier (Balanced):** A mid-tier offering with a moderate monthly fee (or fee waived with minimum balance/direct deposit) that includes enhanced features like advanced budgeting tools, a limited number of free wire transfers, and priority customer support.
3.  **Premium Tier (Differentiated):** A higher-fee tier targeting affluent customers or those needing comprehensive services. This tier would include personalized financial advisory, dedicated relationship managers, higher interest rates on savings, advanced investment tools, and exclusive perks.

**Justification:** This approach allows us to compete on price for basic services while differentiating and monetizing our superior value, personalized service, and broader product suite at higher tiers.`;
        } else if (prompt.includes("marketing campaign ideas")) {
            return `**Marketing Campaign Ideas to Counter FinFuture:**

1.  **"Beyond Zero Fees: The True Value of Your Bank" Campaign:**
    *   **Focus:** Highlight the holistic value Demo Bank provides beyond just low fees – superior customer service, personalized advice, robust security, and a wider range of trusted financial products.
    *   **Channels:** Digital video ads (YouTube, CTV), content marketing (blog posts, whitepapers comparing "true cost" vs. just "fee cost"), social media testimonials.
2.  **"Your Financial Partner for Life" Campaign:**
    *   **Focus:** Emphasize Demo Bank's role as a long-term partner, catering to evolving financial needs from savings to investments to wealth management, contrasting with FinFuture's likely transactional focus.
    *   **Channels:** LinkedIn, professional networking events, thought leadership articles, podcasts.
3.  **Hyper-Local Community Engagement:**
    *   **Focus:** Leverage our physical presence (if applicable) and community involvement to build trust and local brand affinity that digital-only competitors struggle to replicate.
    *   **Channels:** Local events, sponsorships, partnerships with local businesses, localized digital ads.`;
        } else if (prompt.includes("customer sentiment analysis")) {
            return `**Overall Customer Sentiment for FinFuture Inc.:**

*   **Positive (60%):** Customers highly praise the ease of use of their mobile app, the speed of transactions, and the attractive interest rates on savings. Many appreciate the "no-frills" approach to banking.
*   **Neutral (25%):** Some users find the customer support to be purely digital, lacking a human touch, and wish for more comprehensive financial planning tools.
*   **Negative (15%):** Criticisms often revolve around perceived lack of personalized service for complex issues, occasional app glitches during peak times, and limited options for international banking.

**Key Takeaways:** FinFuture excels in digital convenience and cost-effectiveness, appealing to a segment prioritizing these. However, there's a clear opportunity for Demo Bank to differentiate by emphasizing superior human-assisted customer support and holistic financial solutions.`;
        } else if (prompt.includes("generate a detailed profile")) {
            return `**Detailed AI-Generated Profile for GlobalBank Digital:**

**Overview:** GlobalBank Digital is a subsidiary of a major international banking conglomerate, launched specifically to capture the digital-first market. It aims to combine the trust and regulatory compliance of its parent company with the agility and user experience of a fintech startup.

**Key Offerings:**
*   **Global Accounts:** Multi-currency accounts with competitive exchange rates, targeting international travelers and expatriates.
*   **Advanced Investment Platforms:** Robust self-service investment tools, including access to global markets, robo-advisory, and fractional share investing.
*   **Business Banking:** Strong suite of digital tools for SMEs, including integrated invoicing, payroll, and international payment solutions.

**Strategic Focus:**
*   **International Reach:** Leveraging the parent company's global network, GlobalBank Digital prioritizes cross-border services and appeals to a diverse, internationally mobile customer base.
*   **Hybrid Model:** While primarily digital, they offer access to limited physical branch services of their parent bank for complex issues, providing a sense of security.
*   **Technology & Compliance:** High investment in secure, scalable cloud infrastructure and advanced KYC/AML technologies, showcasing a commitment to both innovation and regulatory adherence.

**Market Position:**
*   **Competes with:** Neo-banks for digital convenience, but also traditional banks for comprehensive global services.
*   **Target Audience:** Affluent digital natives, international professionals, and SMEs with global aspirations.

**Recent Activities (AI Synthesized):**
*   Q1 2024: Launched a new blockchain-powered trade finance platform for corporate clients.
*   Q4 2023: Expanded its multi-currency account offerings to include five new Asian currencies.
*   Q3 2023: Partnered with a leading cybersecurity firm to enhance data protection for its investment platform.

**Predicted Future Moves:**
*   Likely to acquire smaller regional fintechs to expand local market penetration and specialized service offerings.
*   Expect increased focus on AI in customer support to manage their growing global user base efficiently.
*   Potential for entering the crypto asset management space under strict regulatory guidance.

**Impact on Demo Bank:** GlobalBank Digital poses a significant threat in the global banking and sophisticated investment sectors. Demo Bank should assess its own international service capabilities and advanced investment tools. Partnerships for global reach or specialization might be a strategic counter.`;
        } else if (prompt.includes("simulate a 'what-if' scenario")) {
            return `**What-If Scenario Simulation: FinFuture Cuts Loan Rates by 0.5%**

**Scenario Details:** FinFuture Inc. announces an across-the-board 0.5% reduction in interest rates for all personal and small business loans, effective immediately.

**Predicted Impact on Demo Bank:**

1.  **Loan Portfolio (High Impact):**
    *   **New Loan Applications:** Expect a 10-15% drop in new loan applications for Demo Bank, especially for unsecured personal loans and small business lines of credit where rate sensitivity is high.
    *   **Existing Customers:** Increased risk of churn (2-3%) among existing Demo Bank loan customers, particularly those with newer loans or considering refinancing. Competitor FinFuture's aggressive rate could be a significant draw.
    *   **Revenue:** Estimated 5-8% reduction in projected loan interest income over the next 12 months, assuming no counter-action.

2.  **Customer Acquisition (Medium Impact):**
    *   FinFuture's attractive rates will strengthen their marketing message, potentially diverting general customer acquisition efforts, even for non-loan products.
    *   Difficulty in acquiring rate-sensitive customers.

3.  **Brand Perception (Medium Impact):**
    *   Demo Bank might be perceived as less competitive on pricing in the lending space, potentially impacting overall brand appeal, especially for value-conscious customers.

**Recommended Counter-Actions for Demo Bank:**

1.  **Targeted Rate Match/Offer (Immediate):**
    *   **Option A:** Introduce a limited-time promotional rate for new loan customers that matches FinFuture's rate, or offers an introductory lower rate for the first 6-12 months.
    *   **Option B:** Offer existing loyal customers (e.g., those with multiple products, high balances) a rate review or a small reduction to mitigate churn risk.

2.  **Emphasize Value & Service (Ongoing):**
    *   Intensify marketing campaigns highlighting Demo Bank's superior customer service, personalized financial advice, faster loan processing, and flexible repayment terms, which may not be FinFuture's strong suits.
    *   Showcase successful customer stories and testimonials.

3.  **Diversify Loan Products (Medium-term):**
    *   Accelerate development of specialized loan products where FinFuture may not compete directly, e.g., niche industry loans, green financing, or complex structured lending.

**Overall Strategic Implication:** This move by FinFuture underscores the need for Demo Bank to clearly define its value proposition beyond just pricing in the lending market. Focus on customer segments that value service, relationships, and comprehensive solutions over purely the lowest rate.`;
        } else if (prompt.includes("identify market trends")) {
            return `**AI-Identified Market Trends & Impact:**

1.  **Trend: Hyper-Personalization of Financial Services:**
    *   **Description:** Leveraging AI and big data to offer highly customized products, services, and advice based on individual customer behavior, goals, and life events.
    *   **Impact on Demo Bank:** High. Competitors are heavily investing here. Demo Bank must enhance its data analytics capabilities and develop AI-driven recommendation engines to stay competitive and prevent customer migration to more "understanding" platforms.
    *   **Opportunities:** Increased customer satisfaction, higher product adoption, improved cross-selling.

2.  **Trend: Embedded Finance:**
    *   **Description:** Integration of financial services directly into non-financial platforms and apps (e.g., e-commerce sites offering instant credit, ride-sharing apps offering payment accounts).
    *   **Impact on Demo Bank:** Medium-High. This trend could disintermediate traditional banks. Demo Bank should explore partnerships with non-financial industry players and develop API-first financial products to be part of these ecosystems.
    *   **Threats:** Loss of direct customer touchpoints, reduced transaction volume through proprietary channels.

3.  **Trend: Sustainable & Ethical Banking (ESG):**
    *   **Description:** Growing consumer demand for financial institutions that demonstrate strong environmental, social, and governance (ESG) practices, including green loans, ethical investments, and transparent operations.
    *   **Impact on Demo Bank:** Medium. While not an immediate threat, it's a growing differentiator. Demo Bank can attract a significant segment by developing and promoting ESG-compliant products and showcasing its own sustainability efforts.
    *   **Opportunities:** Attract new, socially conscious customer segments, enhance brand reputation, meet evolving regulatory expectations.

4.  **Trend: Web3 and Decentralized Finance (DeFi) Exploration:**
    *   **Description:** Investigation into blockchain, cryptocurrencies, NFTs, and decentralized autonomous organizations (DAOs) for new financial paradigms.
    *   **Impact on Demo Bank:** Low-Medium, but evolving. While mainstream adoption is still nascent, ignoring this area completely is risky. Demo Bank should monitor developments, perhaps explore pilot programs or partnerships in regulated blockchain spaces (e.g., tokenized assets, stablecoins).
    *   **Threats:** New, highly disruptive competitors emerging from the crypto space if traditional finance fails to adapt.`;
        } else if (prompt.includes("identify key regulatory changes")) {
            return `**AI-Identified Key Regulatory Changes & Impact:**

1.  **Regulation: Open Banking Mandates (e.g., PSD3, GDPR-like extensions):**
    *   **Description:** Expansion of existing open banking frameworks, requiring banks to share more customer data (with consent) with third-party providers via secure APIs, and enhancing data privacy rights.
    *   **Impact on Demo Bank:** High. Requires significant investment in API infrastructure, data security, and consent management systems. It also creates opportunities for new data-driven services and partnerships.
    *   **Strategic Imperative:** Proactively build out robust, secure APIs and explore partnership opportunities rather than just meeting compliance minimums.

2.  **Regulation: Increased Scrutiny on AI/ML in Lending & Risk:**
    *   **Description:** Regulators are becoming more concerned about algorithmic bias, fairness, transparency, and explainability in AI models used for credit scoring, fraud detection, and other critical financial decisions.
    *   **Impact on Demo Bank:** Medium-High. If Demo Bank uses AI for these functions, it must ensure its models are auditable, fair, and non-discriminatory. Requires investment in explainable AI (XAI) tools and rigorous model validation.
    *   **Risk Mitigation:** Establish clear governance frameworks for AI model development and deployment, conduct regular bias audits.

3.  **Regulation: Digital Asset & Cryptocurrency Frameworks:**
    *   **Description:** Governments globally are working to establish clearer regulatory frameworks for digital assets, including stablecoins, crypto exchanges, and DLT-based financial instruments.
    *   **Impact on Demo Bank:** Low-Medium, but growing. If Demo Bank plans to enter or expand services related to digital assets, understanding and complying with these evolving rules is critical. This could include licensing, custody requirements, and anti-money laundering (AML) protocols specific to crypto.
    *   **Opportunity/Threat:** Early movers who can navigate this complexity can gain an advantage; laggards risk being left behind or facing penalties.

**Overall Strategic Implication:** The regulatory environment is becoming more complex and demanding, especially concerning data, AI, and new digital assets. Demo Bank needs robust compliance functions and forward-thinking technology investments to navigate these changes effectively and turn compliance into a competitive advantage.`;
        }
        return `AI Response for: "${prompt.substring(0, 100)}..." (Mocked response, add more specific mocks)`;
    },
};

// --- Helper Components for UI elements ---

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">{children}</h3>
);

export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <span className="ml-3 text-gray-400">Loading AI insights...</span>
    </div>
);

export const FeatureTable: React.FC<{ features: CompetitorProductFeature[]; title: string }> = ({ features, title }) => (
    <div className="overflow-x-auto">
        <h4 className="text-lg font-medium text-gray-200 mb-2">{title}</h4>
        <table className="min-w-full divide-y divide-gray-700 bg-gray-800 rounded-md">
            <thead>
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Feature</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Our Rating</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Competitor Rating</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Differentiator</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
                {features.map((f, i) => (
                    <tr key={i}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">{f.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{f.ourRating}/5</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{f.competitorRating}/5</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{f.isKeyDifferentiator ? 'Yes' : 'No'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const DataListItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-1 border-b border-gray-700 last:border-b-0">
        <span className="text-sm font-medium text-gray-400">{label}:</span>
        <span className="text-sm text-white">{value}</span>
    </div>
);

export const MetricCard: React.FC<{ title: string; value: string | number; description: string; colorClass?: string }> = ({ title, value, description, colorClass = "text-cyan-400" }) => (
    <Card title={title}>
        <div className="flex flex-col items-center justify-center p-4">
            <p className={`text-4xl font-bold ${colorClass} mb-2`}>{value}</p>
            <p className="text-sm text-gray-400 text-center">{description}</p>
        </div>
    </Card>
);

export const AiResponseDisplay: React.FC<{ content: string; isLoading: boolean; defaultText: string }> = ({ content, isLoading, defaultText }) => (
    <div className="min-h-[12rem] max-h-96 overflow-y-auto whitespace-pre-line text-sm text-gray-300 bg-gray-900 p-4 rounded-md">
        {isLoading ? <LoadingSpinner /> : (content || defaultText)}
    </div>
);

// --- Expanded Sub-Components for various sections ---

export const CompetitorOverview: React.FC<{ competitor: Competitor }> = ({ competitor }) => (
    <div className="space-y-4">
        <div className="flex items-center space-x-4">
            {/* <img src={competitor.logoUrl} alt={`${competitor.name} logo`} className="w-16 h-16 object-contain rounded-full bg-white p-1" /> */}
            <h3 className="text-2xl font-bold text-white">{competitor.name}</h3>
        </div>
        <p className="text-gray-300 text-sm italic">{competitor.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DataListItem label="Industry" value={competitor.industry} />
            <DataListItem label="HQ Location" value={competitor.hqLocation} />
            <DataListItem label="Founding Year" value={competitor.foundingYear} />
            <DataListItem label="Market Segments" value={competitor.marketSegments.join(', ')} />
            <DataListItem label="Employee Count" value={competitor.employeeCount.toLocaleString()} />
            <DataListItem label="Customer Base" value={`${(competitor.customerBaseSize / 1000000).toFixed(1)}M`} />
        </div>
        <div className="mt-4">
            <SectionTitle>Key Financials</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DataListItem label="Revenue (Millions)" value={`$${competitor.financials.revenue.toLocaleString()}`} />
                <DataListItem label="Market Cap (Billions)" value={`$${competitor.financials.marketCap.toLocaleString()}B`} />
                <DataListItem label="Growth Rate" value={`${competitor.financials.growthRate}%`} />
                <DataListItem label="Profit Margin" value={`${competitor.financials.profitMargin}%`} />
                <DataListItem label="ROE" value={`${competitor.financials.roe}%`} />
                <DataListItem label="Debt to Equity" value={competitor.financials.debtToEquity} />
            </div>
            <ResponsiveContainer width="100%" height={250} className="mt-4">
                <BarChart data={[
                    { name: 'Revenue', value: competitor.financials.revenue / 1000, unit: 'B' },
                    { name: 'Market Cap', value: competitor.financials.marketCap, unit: 'B' },
                    { name: 'Growth', value: competitor.financials.growthRate, unit: '%' },
                ]}>
                    <XAxis dataKey="name" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip formatter={(value: number, name: string, props: any) => [`${value}${props.payload.unit}`, name]} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', color: '#e5e7eb' }} />
                    <Legend />
                    <Bar dataKey="value" fill="#06b6d4" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const CompetitorProductDetail: React.FC<{ product: CompetitorProduct }> = ({ product }) => (
    <div className="border border-gray-700 rounded-lg p-4 mb-4 space-y-3 bg-gray-800">
        <h4 className="text-xl font-semibold text-white">{product.name}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
            <DataListItem label="Category" value={product.category} />
            <DataListItem label="Pricing Model" value={product.pricingModel} />
            <DataListItem label="Base Price" value={product.basePrice === 0 ? 'Free' : `$${product.basePrice}`} />
            <DataListItem label="Market Share" value={`${product.marketShare}%`} />
            <DataListItem label="Launch Date" value={product.startDate} />
        </div>
        <FeatureTable title="Key Features" features={product.features} />
        <div className="mt-4">
            <h5 className="text-lg font-medium text-gray-200 mb-2">User Review Sentiment</h5>
            <div className="grid grid-cols-3 gap-2">
                {['positive', 'neutral', 'negative'].map(sentiment => {
                    const count = product.userReviews.filter(r => r.sentiment === sentiment).length;
                    return (
                        <div key={sentiment} className={`p-2 rounded-md text-center text-sm ${
                            sentiment === 'positive' ? 'bg-green-600/30 text-green-300' :
                            sentiment === 'neutral' ? 'bg-yellow-600/30 text-yellow-300' :
                            'bg-red-600/30 text-red-300'
                        }`}>
                            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}: {count}
                        </div>
                    );
                })}
            </div>
            <details className="mt-3">
                <summary className="cursor-pointer text-cyan-400 text-sm hover:underline">View all reviews ({product.userReviews.length})</summary>
                <ul className="mt-2 text-xs text-gray-400 max-h-48 overflow-y-auto space-y-1">
                    {product.userReviews.map((review, i) => (
                        <li key={i} className="border-b border-gray-700 pb-1 last:border-b-0">
                            <span className={`font-semibold ${review.sentiment === 'positive' ? 'text-green-400' : review.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'}`}>{review.score}/5:</span> {review.comment}
                        </li>
                    ))}
                </ul>
            </details>
        </div>
    </div>
);

export const CompetitorProductsSection: React.FC<{ competitor: Competitor }> = ({ competitor }) => (
    <div className="space-y-4">
        <SectionTitle>Products & Services</SectionTitle>
        {competitor.products.map(product => (
            <CompetitorProductDetail key={product.id} product={product} />
        ))}
    </div>
);

export const CompetitorStrategicMoves: React.FC<{ competitor: Competitor }> = ({ competitor }) => (
    <div className="space-y-4">
        <SectionTitle>Strategic Moves & Investments</SectionTitle>
        <h4 className="text-lg font-medium text-gray-200 mb-2">Recent Strategic Initiatives</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitor.strategicMoves.map((move, i) => (
                <div key={i} className="border border-gray-700 p-3 rounded-lg bg-gray-800">
                    <p className="text-sm font-semibold text-white">{move.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Date: {move.date} | Impact: {move.impact}</p>
                </div>
            ))}
        </div>
        <h4 className="text-lg font-medium text-gray-200 mb-2 mt-4">Funding Rounds</h4>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 bg-gray-800 rounded-md">
                <thead>
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Investor</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount (M)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Round</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {competitor.investments.map((inv, i) => (
                        <tr key={i}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{inv.date}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{inv.investor}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">${inv.amount.toLocaleString()}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{inv.round}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const NewsAndSocialMonitoring: React.FC<{ competitor: Competitor }> = ({ competitor }) => {
    const [activeTab, setActiveTab] = useState<'news' | 'social'>('news');

    const newsSentimentData = useMemo(() => {
        const counts = { positive: 0, neutral: 0, negative: 0 };
        competitor.newsArticles.forEach(article => counts[article.sentiment]++);
        return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    }, [competitor.newsArticles]);

    const socialSentimentData = useMemo(() => {
        const counts = { positive: 0, neutral: 0, negative: 0 };
        competitor.socialMediaMentions.forEach(mention => counts[mention.sentiment]++);
        return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    }, [competitor.socialMediaMentions]);

    const COLORS = { positive: '#82ca9d', neutral: '#ffc658', negative: '#ef4444' };

    return (
        <div className="space-y-4">
            <SectionTitle>News & Social Media Monitoring</SectionTitle>
            <div className="flex space-x-2 border-b border-gray-700 mb-4">
                <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'news' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('news')}
                >
                    News Articles ({competitor.newsArticles.length})
                </button>
                <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'social' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('social')}
                >
                    Social Mentions ({competitor.socialMediaMentions.length})
                </button>
            </div>

            {activeTab === 'news' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4 max-h-96 overflow-y-auto pr-2">
                        {competitor.newsArticles.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(article => (
                            <div key={article.id} className="border border-gray-700 p-3 rounded-lg bg-gray-800">
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-semibold text-base">{article.title}</a>
                                <p className="text-xs text-gray-400 mt-1">Source: {article.source} | Date: {article.date} | Sentiment: <span className={article.sentiment === 'positive' ? 'text-green-400' : article.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'}>{article.sentiment}</span></p>
                                <p className="text-sm text-gray-300 mt-2">{article.summary}</p>
                            </div>
                        ))}
                    </div>
                    <Card title="News Sentiment Distribution">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={newsSentimentData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {newsSentimentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', color: '#e5e7eb' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            )}

            {activeTab === 'social' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4 max-h-96 overflow-y-auto pr-2">
                        {competitor.socialMediaMentions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(mention => (
                            <div key={mention.id} className="border border-gray-700 p-3 rounded-lg bg-gray-800">
                                <p className="text-sm font-semibold text-white">@{mention.username} on {mention.platform}</p>
                                <p className="text-xs text-gray-400 mt-1">Date: {mention.date} | Sentiment: <span className={mention.sentiment === 'positive' ? 'text-green-400' : mention.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'}>{mention.sentiment}</span></p>
                                <p className="text-sm text-gray-300 mt-2">{mention.content}</p>
                                <div className="flex text-xs text-gray-500 mt-2 space-x-4">
                                    <span>Likes: {mention.likes}</span>
                                    <span>Reposts: {mention.reposts}</span>
                                    <span>Comments: {mention.comments}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Card title="Social Media Sentiment">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={socialSentimentData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {socialSentimentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', color: '#e5e7eb' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            )}
        </div>
    );
};

export const MarketTrendsSection: React.FC<{ marketTrends: MarketTrend[] }> = ({ marketTrends }) => (
    <div className="space-y-4">
        <SectionTitle>Market Trends</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketTrends.map(trend => (
                <Card key={trend.id} title={trend.name}>
                    <p className="text-sm text-gray-300">{trend.description}</p>
                    <div className="mt-2 text-xs text-gray-400 space-y-1">
                        <DataListItem label="Category" value={trend.category} />
                        <DataListItem label="Impact" value={<span className={`font-semibold ${trend.impact === 'high' ? 'text-red-400' : trend.impact === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>{trend.impact.toUpperCase()}</span>} />
                        <DataListItem label="Growth Projection" value={`${trend.growthProjection}% p.a.`} />
                        <DataListItem label="Identified" value={trend.startDate} />
                    </div>
                </Card>
            ))}
        </div>
    </div>
);

export const RegulatoryUpdatesSection: React.FC<{ regulatoryUpdates: RegulatoryUpdate[] }> = ({ regulatoryUpdates }) => (
    <div className="space-y-4">
        <SectionTitle>Regulatory Updates</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regulatoryUpdates.map(update => (
                <Card key={update.id} title={update.title}>
                    <p className="text-sm text-gray-300">{update.description}</p>
                    <div className="mt-2 text-xs text-gray-400 space-y-1">
                        <DataListItem label="Effective Date" value={update.effectiveDate} />
                        <DataListItem label="Impact Level" value={<span className={`font-semibold ${update.impactLevel === 'high' ? 'text-red-400' : update.impactLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>{update.impactLevel.toUpperCase()}</span>} />
                        <DataListItem label="Affected Products" value={update.affectedProducts.join(', ')} />
                    </div>
                </Card>
            ))}
        </div>
    </div>
);


export const AIScenarioPlanning: React.FC<{ currentCompetitor: Competitor | null }> = ({ currentCompetitor }) => {
    const [scenarioPrompt, setScenarioPrompt] = useState('');
    const [scenarioResult, setScenarioResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateScenario = useCallback(async () => {
        if (!currentCompetitor || !scenarioPrompt.trim()) return;

        setIsLoading(true);
        setScenarioResult('');
        try {
            const prompt = `Simulate a 'what-if' scenario for Demo Bank. The competitor ${currentCompetitor.name} makes the following move: "${scenarioPrompt}". Analyze the predicted impact on Demo Bank's loan portfolio, customer acquisition, and brand perception. Recommend 2-3 immediate counter-actions for Demo Bank.`;
            const response = await aiService.generateContent(prompt);
            setScenarioResult(response);
        } catch (err) {
            console.error(err);
            setScenarioResult("Failed to generate scenario. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [currentCompetitor, scenarioPrompt]);

    return (
        <Card title="AI Scenario Planning">
            <p className="text-sm text-gray-400 mb-4">Simulate competitor moves and get AI-driven insights on potential impacts and counter-strategies for Demo Bank.</p>
            {!currentCompetitor ? (
                <p className="text-yellow-400 text-sm">Please select a competitor to run scenario simulations.</p>
            ) : (
                <div className="space-y-4">
                    <textarea
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                        rows={4}
                        placeholder={`e.g., "${currentCompetitor.name} cuts their prime loan rate by 0.5%"`}
                        value={scenarioPrompt}
                        onChange={(e) => setScenarioPrompt(e.target.value)}
                        disabled={isLoading}
                    ></textarea>
                    <button
                        onClick={handleGenerateScenario}
                        disabled={isLoading || !scenarioPrompt.trim()}
                        className="w-full py-2 bg-purple-600/50 hover:bg-purple-600 rounded disabled:opacity-50 text-white font-semibold"
                    >
                        {isLoading ? 'Running Simulation...' : 'Generate Scenario Analysis'}
                    </button>

                    <AiResponseDisplay content={scenarioResult} isLoading={isLoading} defaultText="AI simulation results will appear here." />
                </div>
            )}
        </Card>
    );
};


export const AIRecommendationEngine: React.FC<{ currentCompetitor: Competitor | null; ourCompanyDescription: string }> = ({ currentCompetitor, ourCompanyDescription }) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('All');

    const handleGenerateRecommendations = useCallback(async () => {
        if (!currentCompetitor) return;

        setIsLoading(true);
        setRecommendations([]);
        try {
            const competitorSummary = `Competitor: ${currentCompetitor.name}. Description: ${currentCompetitor.description}. Strengths: ${currentCompetitor.strengths.join(', ')}. Weaknesses: ${currentCompetitor.weaknesses.join(', ')}. Key Products: ${currentCompetitor.products.map(p => p.name).join(', ')}.`;
            const prompt = `Based on the following information about Demo Bank ("Our Company": ${ourCompanyDescription}) and our top competitor (${competitorSummary}), generate 5 actionable strategic recommendations for Demo Bank. Each recommendation should include:
- id (unique string)
- category (e.g., "Product Development", "Marketing", "Pricing", "Operations")
- title (brief summary)
- description (detailed explanation of the recommendation)
- priority ('low', 'medium', 'high', 'critical')
- potentialImpact (how it benefits Demo Bank)
- aiConfidence (0-100, AI's confidence in this recommendation)

Format the output as a JSON array of objects.`;

            const responseText = await aiService.generateContent(prompt);
            try {
                const parsedRecommendations: Recommendation[] = JSON.parse(responseText);
                setRecommendations(parsedRecommendations);
            } catch (jsonError) {
                console.error("Failed to parse AI recommendations JSON:", jsonError, responseText);
                setRecommendations([{
                    id: 'fallback-1',
                    category: 'General',
                    title: 'Failed to Parse AI Recommendations',
                    description: `AI output was not in expected JSON format. Raw output: ${responseText.substring(0, 500)}...`,
                    priority: 'critical',
                    potentialImpact: 'Review AI response parsing logic',
                    aiConfidence: 0
                }]);
            }
        } catch (err) {
            console.error(err);
            setRecommendations([{
                id: 'error-1',
                category: 'System',
                title: 'Recommendation Generation Error',
                description: 'An error occurred while generating recommendations. Please check API key and network.',
                priority: 'critical',
                potentialImpact: 'System stability',
                aiConfidence: 0
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [currentCompetitor, ourCompanyDescription]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set(recommendations.map(r => r.category));
        return ['All', ...Array.from(uniqueCategories)];
    }, [recommendations]);

    const filteredRecommendations = useMemo(() => {
        if (activeCategory === 'All') {
            return recommendations;
        }
        return recommendations.filter(r => r.category === activeCategory);
    }, [recommendations, activeCategory]);

    useEffect(() => {
        if (currentCompetitor) {
            handleGenerateRecommendations();
        }
    }, [currentCompetitor, handleGenerateRecommendations]); // Regenerate when competitor changes

    const getPriorityColor = (priority: Recommendation['priority']) => {
        switch (priority) {
            case 'critical': return 'text-red-400';
            case 'high': return 'text-orange-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <Card title="AI Strategic Recommendations">
            <p className="text-sm text-gray-400 mb-4">AI-driven actionable insights for Demo Bank based on competitor intelligence.</p>
            {!currentCompetitor ? (
                <p className="text-yellow-400 text-sm">Please select a competitor to generate strategic recommendations.</p>
            ) : (
                <div className="space-y-4">
                    <button
                        onClick={handleGenerateRecommendations}
                        disabled={isLoading}
                        className="w-full py-2 bg-teal-600/50 hover:bg-teal-600 rounded disabled:opacity-50 text-white font-semibold"
                    >
                        {isLoading ? 'Generating Recommendations...' : 'Regenerate AI Recommendations'}
                    </button>

                    {isLoading && <LoadingSpinner />}

                    {!isLoading && recommendations.length > 0 && (
                        <div>
                            <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        className={`px-4 py-2 text-sm rounded-full ${activeCategory === category ? 'bg-cyan-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                        onClick={() => setActiveCategory(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {filteredRecommendations.map(rec => (
                                    <div key={rec.id} className="border border-gray-700 p-4 rounded-lg bg-gray-800">
                                        <h4 className="text-lg font-semibold text-white">{rec.title}</h4>
                                        <p className="text-sm text-gray-400">{rec.category}</p>
                                        <p className="text-sm text-gray-300 mt-2">{rec.description}</p>
                                        <div className="flex justify-between items-center mt-3 text-xs">
                                            <span className={`font-medium ${getPriorityColor(rec.priority)}`}>Priority: {rec.priority.toUpperCase()}</span>
                                            <span className="text-gray-500">AI Confidence: {rec.aiConfidence}%</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Potential Impact: {rec.potentialImpact}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {!isLoading && recommendations.length === 0 && (
                        <p className="text-gray-400 text-sm">No recommendations generated yet. Click the button above to generate.</p>
                    )}
                </div>
            )}
        </Card>
    );
};

export const PerformanceBenchmarking: React.FC<{ competitors: Competitor[]; ourCompanyData: { [key: string]: number; name: string } }> = ({ competitors, ourCompanyData }) => {
    const defaultCompetitor = competitors[0] || null;
    const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(defaultCompetitor);

    useEffect(() => {
        setSelectedCompetitor(competitors[0] || null);
    }, [competitors]);

    const benchmarkingData = useMemo(() => {
        if (!selectedCompetitor || !ourCompanyData) return [];

        const data: CompetitorBenchmarkingData[] = [
            { metric: 'Revenue (M)', ourValue: ourCompanyData.revenue, competitorValue: selectedCompetitor.financials.revenue, unit: '$' },
            { metric: 'Profit Margin (%)', ourValue: ourCompanyData.profitMargin, competitorValue: selectedCompetitor.financials.profitMargin, unit: '%' },
            { metric: 'Growth Rate (%)', ourValue: ourCompanyData.growthRate, competitorValue: selectedCompetitor.financials.growthRate, unit: '%' },
            { metric: 'Market Share (%)', ourValue: ourCompanyData.marketShare, competitorValue: selectedCompetitor.products.reduce((acc, p) => acc + p.marketShare, 0) / selectedCompetitor.products.length, unit: '%' },
            { metric: 'Customer Sat. (CSAT)', ourValue: ourCompanyData.customerSatisfactionScore, competitorValue: selectedCompetitor.customerSatisfactionScore, unit: '' },
            { metric: 'Churn Rate (%)', ourValue: ourCompanyData.churnRate, competitorValue: selectedCompetitor.churnRate, unit: '%' },
        ];
        return data.filter(d => d.ourValue !== undefined && d.competitorValue !== undefined);
    }, [selectedCompetitor, ourCompanyData]);

    const formatValue = (value: number, unit: string) => {
        if (unit === '$') return `$${value.toLocaleString()}`;
        if (unit === '%') return `${value.toFixed(2)}%`;
        return value.toLocaleString();
    };

    return (
        <Card title="Performance Benchmarking">
            <p className="text-sm text-gray-400 mb-4">Compare Demo Bank's key metrics against selected competitors.</p>
            <div className="mb-4">
                <label htmlFor="competitor-select" className="block text-sm font-medium text-gray-300">Select Competitor:</label>
                <select
                    id="competitor-select"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md text-white"
                    value={selectedCompetitor?.id || ''}
                    onChange={(e) => setSelectedCompetitor(competitors.find(c => c.id === e.target.value) || null)}
                >
                    {competitors.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                </select>
            </div>

            {selectedCompetitor && benchmarkingData.length > 0 ? (
                <div className="space-y-6">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={benchmarkingData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis dataKey="metric" stroke="#cbd5e1" />
                            <YAxis stroke="#cbd5e1" />
                            <Tooltip formatter={(value: number, name: string, props: any) => [`${formatValue(value, props.payload.unit)}`, name === 'ourValue' ? 'Demo Bank' : selectedCompetitor.name]} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', color: '#e5e7eb' }} />
                            <Legend />
                            <Bar dataKey="ourValue" name="Demo Bank" fill="#06b6d4" />
                            <Bar dataKey="competitorValue" name={selectedCompetitor.name} fill="#f43f5e" />
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full divide-y divide-gray-700 bg-gray-800 rounded-md">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Metric</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Demo Bank</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{selectedCompetitor.name}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Difference</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {benchmarkingData.map((data, i) => {
                                    const diff = data.ourValue - data.competitorValue;
                                    const diffColor = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-yellow-400';
                                    return (
                                        <tr key={i}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">{data.metric}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{formatValue(data.ourValue, data.unit)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{formatValue(data.competitorValue, data.unit)}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap text-sm ${diffColor}`}>
                                                {diff > 0 ? '+' : ''}{formatValue(diff, data.unit)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <p className="text-gray-400 text-sm">No benchmarking data available or competitor not selected.</p>
            )}
        </Card>
    );
};


// --- Main CompetitiveIntelligenceView Component ---

const CompetitiveIntelligenceView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("CompetitiveIntelligenceView must be within DataProvider");

    const { competitors: contextCompetitors } = context; // Original context competitors
    const ourCompanyData = useMemo(() => ({
        name: 'Demo Bank',
        revenue: generateRandomNumber(1000, 3000, 0), // millions
        profitMargin: generateRandomNumber(15, 35, 2),
        growthRate: generateRandomNumber(8, 20, 2),
        marketShare: generateRandomNumber(10, 25, 2),
        customerSatisfactionScore: generateRandomNumber(80, 98),
        churnRate: generateRandomNumber(0.8, 3, 2),
        description: 'Demo Bank is an innovative financial institution focusing on customer-centric digital solutions and robust community engagement.',
    }), []);

    // Use mock competitors for deeper detail for this expansive file
    const competitors = useMemo(() => mockCompetitors, []);
    const marketTrends = useMemo(() => mockMarketTrends, []);
    const regulatoryUpdates = useMemo(() => mockRegulatoryUpdates, []);

    const [swot, setSwot] = useState('');
    const [isLoadingSwot, setIsLoadingSwot] = useState(false);
    const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>(competitors[0]?.id || '');

    const selectedCompetitor = useMemo(() => competitors.find(c => c.id === selectedCompetitorId) || null, [selectedCompetitorId, competitors]);

    const chartData = useMemo(() => {
        const baseFeatures = [
            { subject: 'Features', ourRating: 90, competitorRating: 75, fullMark: 100 },
            { subject: 'Pricing', ourRating: 70, competitorRating: 85, fullMark: 100 },
            { subject: 'UX/UI', ourRating: 95, competitorRating: 80, fullMark: 100 },
            { subject: 'Support', ourRating: 85, competitorRating: 90, fullMark: 100 },
            { subject: 'API', ourRating: 92, competitorRating: 70, fullMark: 100 },
            { subject: 'Security', ourRating: 90, competitorRating: 88, fullMark: 100 },
            { subject: 'Innovation', ourRating: 88, competitorRating: 82, fullMark: 100 },
        ];

        if (selectedCompetitor) {
            // Dynamically adjust ratings based on selected competitor's overall profile
            return baseFeatures.map(item => ({
                ...item,
                ourRating: item.ourRating + generateRandomNumber(-5, 5, 0),
                competitorRating: item.competitorRating + generateRandomNumber(-5, 5, 0),
            }));
        }
        return baseFeatures;
    }, [selectedCompetitor]);


    const handleGenerateSwot = useCallback(async () => {
        setIsLoadingSwot(true); setSwot('');
        if (!selectedCompetitor) {
            setSwot("Please select a competitor to generate SWOT analysis.");
            setIsLoadingSwot(false);
            return;
        }
        try {
            const prompt = `Generate a comprehensive SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for Demo Bank against our top competitor, ${selectedCompetitor.name}. Consider Demo Bank's strengths as a customer-centric digital bank and ${selectedCompetitor.name}'s profile including its strengths: ${selectedCompetitor.strengths.join(', ')} and weaknesses: ${selectedCompetitor.weaknesses.join(', ')}. Provide detailed points for each section.`;
            const response = await aiService.generateContent(prompt);
            setSwot(response);
        } catch(err) {
            console.error(err);
            setSwot("Failed to generate SWOT analysis. Please check AI service.");
        } finally {
            setIsLoadingSwot(false);
        }
    }, [selectedCompetitor]);

    useEffect(() => {
        // Automatically generate SWOT when selected competitor changes
        if (selectedCompetitor) {
            handleGenerateSwot();
        } else {
            setSwot("Select a competitor to view their profile and AI-driven insights.");
        }
    }, [selectedCompetitor, handleGenerateSwot]);


    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'benchmarking' | 'ai-strategy' | 'market' | 'news'>('overview');

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Competitive Intelligence Dashboard</h2>

            <div className="flex items-center space-x-4 mb-6">
                <label htmlFor="competitor-selector" className="text-gray-300 text-lg">Analyze Competitor:</label>
                <select
                    id="competitor-selector"
                    className="flex-grow max-w-sm p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500"
                    value={selectedCompetitorId}
                    onChange={(e) => setSelectedCompetitorId(e.target.value)}
                >
                    {competitors.map((comp) => (
                        <option key={comp.id} value={comp.id}>
                            {comp.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="border-b border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('overview')} className={`${activeTab === 'overview' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Overview & SWOT
                    </button>
                    <button onClick={() => setActiveTab('products')} className={`${activeTab === 'products' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Product Deep Dive
                    </button>
                    <button onClick={() => setActiveTab('benchmarking')} className={`${activeTab === 'benchmarking' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Performance Benchmarking
                    </button>
                    <button onClick={() => setActiveTab('ai-strategy')} className={`${activeTab === 'ai-strategy' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        AI Strategy & Scenarios
                    </button>
                    <button onClick={() => setActiveTab('market')} className={`${activeTab === 'market' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Market & Regulatory
                    </button>
                    <button onClick={() => setActiveTab('news')} className={`${activeTab === 'news' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        News & Social
                    </button>
                </nav>
            </div>

            {selectedCompetitor ? (
                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card title={`Overview: ${selectedCompetitor.name}`}>
                                <CompetitorOverview competitor={selectedCompetitor} />
                            </Card>
                            <div className="lg:col-span-2 space-y-6">
                                <Card title="AI SWOT Analysis">
                                    <div className="flex flex-col h-full">
                                        <AiResponseDisplay content={swot} isLoading={isLoadingSwot} defaultText="Click 'Generate AI SWOT' for analysis." />
                                        <button onClick={handleGenerateSwot} disabled={isLoadingSwot} className="mt-4 w-full py-2 bg-cyan-600/50 hover:bg-cyan-600 rounded disabled:opacity-50">{isLoadingSwot ? 'Analyzing...' : 'Generate AI SWOT'}</button>
                                    </div>
                                </Card>
                                <Card title={`Feature Comparison (Demo Bank vs. ${selectedCompetitor.name})`}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" />
                                            <Radar name="Demo Bank" dataKey="ourRating" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                                            <Radar name={selectedCompetitor.name} dataKey="competitorRating" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.6} />
                                            <Legend />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && <CompetitorProductsSection competitor={selectedCompetitor} />}
                    {activeTab === 'benchmarking' && <PerformanceBenchmarking competitors={competitors} ourCompanyData={ourCompanyData} />}
                    {activeTab === 'ai-strategy' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AIScenarioPlanning currentCompetitor={selectedCompetitor} />
                            <AIRecommendationEngine currentCompetitor={selectedCompetitor} ourCompanyDescription={ourCompanyData.description} />
                        </div>
                    )}
                    {activeTab === 'market' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <MarketTrendsSection marketTrends={marketTrends} />
                            <RegulatoryUpdatesSection regulatoryUpdates={regulatoryUpdates} />
                        </div>
                    )}
                    {activeTab === 'news' && <NewsAndSocialMonitoring competitor={selectedCompetitor} />}

                    <CompetitorStrategicMoves competitor={selectedCompetitor} />

                </div>
            ) : (
                <Card title="No Competitor Selected">
                    <p className="text-gray-400 text-lg">Please select a competitor from the dropdown above to view their detailed intelligence dashboard.</p>
                </Card>
            )}
        </div>
    );
};

export default CompetitiveIntelligenceView;
```