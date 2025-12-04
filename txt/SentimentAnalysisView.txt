import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../../../Card';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Existing Data ---
const sentimentTrendData = [
    { name: 'Jan', positive: 85, negative: 10, neutral: 5 },
    { name: 'Feb', positive: 88, negative: 8, neutral: 4 },
    { name: 'Mar', positive: 82, negative: 15, neutral: 3 },
    { name: 'Apr', positive: 90, negative: 5, neutral: 5 },
    { name: 'May', positive: 92, negative: 4, neutral: 4 },
    { name: 'Jun', positive: 91, negative: 6, neutral: 3 },
];

const emergingTopics = [
    { topic: 'Mobile App Speed', sentiment: 'Negative', volume: 125, trend: 'increasing', impactScore: 7.2 },
    { topic: 'New Savings Feature', sentiment: 'Positive', volume: 350, trend: 'stable', impactScore: 8.9 },
    { topic: 'Customer Support Wait Times', sentiment: 'Negative', volume: 88, trend: 'critical', impactScore: 9.1 },
    { topic: 'Online Banking Security', sentiment: 'Neutral', volume: 210, trend: 'stable', impactScore: 6.5 },
    { topic: 'Credit Card Rewards Program', sentiment: 'Positive', volume: 420, trend: 'increasing', impactScore: 9.5 },
    { topic: 'ATM Network Availability', sentiment: 'Negative', volume: 60, trend: 'critical', impactScore: 8.0 },
    { topic: 'Mortgage Application Process', sentiment: 'Neutral', volume: 180, trend: 'decreasing', impactScore: 5.8 },
    { topic: 'Investment Portfolio Performance', sentiment: 'Positive', volume: 290, trend: 'increasing', impactScore: 8.7 },
    { topic: 'Website Navigation Issues', sentiment: 'Negative', volume: 110, trend: 'increasing', impactScore: 7.5 },
    { topic: 'Personal Loan Interest Rates', sentiment: 'Neutral', volume: 150, trend: 'stable', impactScore: 6.0 },
    { topic: 'Digital Wallet Integration', sentiment: 'Positive', volume: 280, trend: 'increasing', impactScore: 8.8 },
    { topic: 'Biometric Login Reliability', sentiment: 'Negative', volume: 75, trend: 'stable', impactScore: 7.0 },
    { topic: 'International Transfer Fees', sentiment: 'Negative', volume: 95, trend: 'increasing', impactScore: 8.2 },
    { topic: 'Account Opening Process', sentiment: 'Positive', volume: 300, trend: 'stable', impactScore: 9.0 },
    { topic: 'Financial Advisor Responsiveness', sentiment: 'Negative', volume: 55, trend: 'critical', impactScore: 8.5 },
];

// --- New Interfaces and Types ---

export type SentimentCategory = 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
export type SentimentTrend = 'increasing' | 'decreasing' | 'stable' | 'critical' | 'emerging';
export type TimeGranularity = 'daily' | 'weekly' | 'monthly' | 'quarterly';
export type DataSource = 'social_media' | 'reviews' | 'support_tickets' | 'news_articles' | 'forums' | 'surveys' | 'emails';
export type ProductService = 'checking_account' | 'savings_account' | 'credit_card' | 'loans' | 'investments' | 'mobile_app' | 'website' | 'customer_support';
export type GeoRegion = 'North America' | 'Europe' | 'Asia' | 'South America' | 'Africa' | 'Oceania';
export type DemographicGroup = 'Gen Z' | 'Millennials' | 'Gen X' | 'Baby Boomers' | 'Seniors';

export interface SentimentSummary {
    totalMentions: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
    mixedPercentage?: number;
    overallScore: number; // e.g., -1 to 1 or 0 to 100
    scoreChange24h?: number;
    previousPeriodScore?: number;
}

export interface DetailedSentimentTrendData {
    timestamp: string; // ISO string
    positive: number;
    negative: number;
    neutral: number;
    total: number;
    averageScore: number; // -1 to 1
}

export interface TopicDetail {
    id: string;
    topicName: string;
    keywords: string[];
    sentiment: SentimentCategory;
    volume: number;
    trend: SentimentTrend;
    impactScore: number; // 0-10, how much it affects overall sentiment/business
    description?: string;
    relatedTopics?: string[];
    sampleMentions?: SampleMention[];
}

export interface SampleMention {
    id: string;
    text: string;
    source: DataSource;
    sourceId: string; // e.g., tweet ID, review ID
    sentiment: SentimentCategory;
    timestamp: string;
    matchedKeywords?: string[];
    analysisScore?: number;
    userHandle?: string;
    link?: string;
}

export interface EntitySentiment {
    entity: string;
    entityType: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'PRODUCT' | 'SERVICE' | 'EVENT' | 'OTHER';
    sentiment: SentimentCategory;
    volume: number;
    mentions: SampleMention[];
}

export interface SentimentBySource {
    source: DataSource;
    positive: number;
    negative: number;
    neutral: number;
    total: number;
    overallScore: number;
}

export interface SentimentByProduct {
    product: ProductService;
    positive: number;
    negative: number;
    neutral: number;
    total: number;
    overallScore: number;
    keyIssues?: TopicDetail[];
}

export interface SentimentByGeo {
    region: GeoRegion;
    positive: number;
    negative: number;
    neutral: number;
    total: number;
    overallScore: number;
    topTopics?: TopicDetail[];
}

export interface SentimentByDemographic {
    demographic: DemographicGroup;
    positive: number;
    negative: number;
    neutral: number;
    total: number;
    overallScore: number;
    keyFeedback?: SampleMention[];
}

export interface KeywordSentimentAggregate {
    keyword: string;
    sentiment: SentimentCategory;
    volume: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    averageScore: number;
    trend: SentimentTrend;
    sampleMentions?: SampleMention[];
}

export interface AnomalyDetectionResult {
    id: string;
    timestamp: string;
    anomalyType: 'sentiment_drop' | 'volume_spike' | 'topic_shift';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedTopics?: string[];
    affectedSources?: DataSource[];
    currentSentiment?: number;
    expectedSentiment?: number;
    actionItems?: string[];
    status: 'detected' | 'investigated' | 'resolved';
}

export interface AlertConfiguration {
    id: string;
    name: string;
    type: 'sentiment_drop' | 'volume_spike' | 'keyword_mention' | 'topic_emergence';
    threshold: number;
    sentimentCategory?: SentimentCategory;
    keyword?: string;
    productService?: ProductService;
    source?: DataSource;
    recipients: string[];
    isActive: boolean;
}

export interface UserConfiguration {
    id: string;
    username: string;
    role: 'admin' | 'analyst' | 'viewer';
    email: string;
    preferences: {
        defaultDashboard: string;
        emailNotifications: boolean;
        darkMode: boolean;
    };
    accessLevel: string[]; // e.g., ['all_data', 'specific_product_A']
}

export interface ReportGenerationStatus {
    id: string;
    reportName: string;
    type: 'daily_summary' | 'weekly_deep_dive' | 'custom';
    status: 'pending' | 'generating' | 'completed' | 'failed';
    generatedAt?: string;
    downloadUrl?: string;
    requestedBy: string;
    parameters: any; // Dynamic parameters for custom reports
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
    targetId?: string;
    targetType?: string;
}

// --- Utility Functions (Exported if reusable, otherwise internal) ---

export const getSentimentColor = (sentiment: SentimentCategory | string) => {
    switch (sentiment) {
        case 'Positive': return 'text-green-400';
        case 'Negative': return 'text-red-400';
        case 'Neutral': return 'text-blue-400';
        case 'Mixed': return 'text-yellow-400';
        case 'critical': return 'text-red-500';
        case 'increasing': return 'text-green-500';
        case 'decreasing': return 'text-red-300';
        default: return 'text-gray-400';
    }
};

export const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

export const calculateOverallScore = (positive: number, negative: number, neutral: number, total: number): number => {
    if (total === 0) return 0;
    return ((positive - negative) / total) * 100;
};

export const generateRandomData = (count: number, startMonth: number = 0, startYear: number = 2023): DetailedSentimentTrendData[] => {
    const data = [];
    let currentPositive = 70;
    let currentNegative = 15;
    let currentNeutral = 10;

    for (let i = 0; i < count; i++) {
        const date = new Date(startYear, startMonth + i, 1);
        const name = date.toLocaleString('en-US', { month: 'short' });

        currentPositive = Math.max(50, Math.min(95, currentPositive + (Math.random() - 0.5) * 10));
        currentNegative = Math.max(5, Math.min(30, currentNegative + (Math.random() - 0.5) * 8));
        currentNeutral = 100 - currentPositive - currentNegative;
        if (currentNeutral < 0) currentNeutral = 0;
        if (currentNeutral > 30) currentNeutral = 30; // Cap neutral

        const total = Math.floor(100000 + Math.random() * 500000);
        const avgScore = (currentPositive - currentNegative) / 100;

        data.push({
            timestamp: date.toISOString(),
            positive: Math.round(currentPositive),
            negative: Math.round(currentNegative),
            neutral: Math.round(currentNeutral),
            total: total,
            averageScore: parseFloat(avgScore.toFixed(2)),
            name: name, // For recharts
        });
    }
    return data;
};

export const generateRandomMentions = (count: number, topics: TopicDetail[], sources: DataSource[], products: ProductService[]): SampleMention[] => {
    const mentions: SampleMention[] = [];
    const sentiments: SentimentCategory[] = ['Positive', 'Negative', 'Neutral', 'Mixed'];
    const keywords = ['app', 'support', 'feature', 'bank', 'card', 'loan', 'website', 'security', 'rates', 'rewards'];

    for (let i = 0; i < count; i++) {
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];
        const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
        const matchedKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days

        let text = `Regarding ${topic.topicName}, the service was ${sentiment.toLowerCase()}.`;
        if (sentiment === 'Positive') text = `Really happy with the new ${matchedKeyword} on the ${topic.topicName}! Great experience.`;
        if (sentiment === 'Negative') text = `So frustrated with the ${matchedKeyword} on ${topic.topicName}. Need urgent help!`;

        mentions.push({
            id: `mention-${Math.random().toString(36).substr(2, 9)}`,
            text: text,
            source: source,
            sourceId: `src-${Math.random().toString(36).substr(2, 5)}`,
            sentiment: sentiment,
            timestamp: date.toISOString(),
            matchedKeywords: [matchedKeyword, ...topic.keywords.slice(0, 1)],
            analysisScore: parseFloat((Math.random() * 2 - 1).toFixed(2)), // -1 to 1
            userHandle: Math.random() > 0.5 ? `@user${Math.floor(Math.random() * 1000)}` : undefined,
            link: Math.random() > 0.7 ? `http://example.com/mention/${i}` : undefined,
        });
    }
    return mentions;
};

// --- Large Dummy Data Sets ---
const allDataSources: DataSource[] = ['social_media', 'reviews', 'support_tickets', 'news_articles', 'forums', 'surveys', 'emails'];
const allProducts: ProductService[] = ['checking_account', 'savings_account', 'credit_card', 'loans', 'investments', 'mobile_app', 'website', 'customer_support'];
const allRegions: GeoRegion[] = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'];
const allDemographics: DemographicGroup[] = ['Gen Z', 'Millennials', 'Gen X', 'Baby Boomers', 'Seniors'];

// More detailed topic definitions
const detailedTopics: TopicDetail[] = [
    ...emergingTopics.map((t, idx) => ({
        id: `topic-${idx}`,
        topicName: t.topic,
        keywords: t.topic.toLowerCase().split(' ').filter(k => k.length > 2),
        sentiment: t.sentiment as SentimentCategory,
        volume: t.volume,
        trend: t.trend as SentimentTrend,
        impactScore: t.impactScore,
        description: `This topic covers issues related to ${t.topic.toLowerCase()}.`,
        relatedTopics: [`general_${t.topic.split(' ')[0].toLowerCase()}`],
        sampleMentions: [], // Will be filled later
    })),
    { id: 'topic-100', topicName: 'Fraud Protection Measures', keywords: ['fraud', 'protection', 'security'], sentiment: 'Positive', volume: 500, trend: 'stable', impactScore: 9.2, description: 'Discussions around security features and fraud prevention.', relatedTopics: ['Online Banking Security'] },
    { id: 'topic-101', topicName: 'Branch Experience', keywords: ['branch', 'in-person', 'teller', 'visit'], sentiment: 'Neutral', volume: 200, trend: 'decreasing', impactScore: 6.0, description: 'Feedback on physical branch visits and staff.', relatedTopics: [] },
    { id: 'topic-102', topicName: 'Account Setup Process', keywords: ['setup', 'open account', 'onboarding'], sentiment: 'Positive', volume: 380, trend: 'increasing', impactScore: 8.5, description: 'Ease and speed of setting up new accounts.', relatedTopics: ['Account Opening Process'] },
    { id: 'topic-103', topicName: 'Investment Returns', keywords: ['returns', 'portfolio', 'growth', 'profit'], sentiment: 'Positive', volume: 310, trend: 'increasing', impactScore: 8.9, description: 'Customer satisfaction with investment performance.', relatedTopics: ['Investment Portfolio Performance'] },
    { id: 'topic-104', topicName: 'Fees and Charges Transparency', keywords: ['fees', 'charges', 'transparent'], sentiment: 'Negative', volume: 190, trend: 'critical', impactScore: 7.8, description: 'Concerns about hidden or unclear fees.', relatedTopics: [] },
    { id: 'topic-105', topicName: 'Digital Banking Features', keywords: ['digital', 'features', 'online', 'app'], sentiment: 'Positive', volume: 600, trend: 'increasing', impactScore: 9.3, description: 'Overall satisfaction with digital banking tools.', relatedTopics: ['Mobile App Speed', 'Website Navigation Issues', 'Digital Wallet Integration'] },
    { id: 'topic-106', topicName: 'Mortgage Interest Rates', keywords: ['mortgage', 'rates', 'loan'], sentiment: 'Neutral', volume: 150, trend: 'stable', impactScore: 7.0, description: 'Discussions about mortgage interest rates.', relatedTopics: ['Mortgage Application Process'] },
    { id: 'topic-107', topicName: 'Customer Loyalty Programs', keywords: ['loyalty', 'rewards', 'program'], sentiment: 'Positive', volume: 250, trend: 'stable', impactScore: 8.0, description: 'Feedback on loyalty and rewards programs.', relatedTopics: ['Credit Card Rewards Program'] },
    { id: 'topic-108', topicName: 'Technical Glitches/Bugs', keywords: ['bug', 'glitch', 'error', 'technical'], sentiment: 'Negative', volume: 280, trend: 'increasing', impactScore: 8.5, description: 'Reports of technical issues with digital platforms.', relatedTopics: ['Mobile App Speed', 'Website Navigation Issues'] },
    { id: 'topic-109', topicName: 'Personalized Offers', keywords: ['personalized', 'offers', 'custom'], sentiment: 'Positive', volume: 180, trend: 'increasing', impactScore: 7.5, description: 'Customer response to personalized banking offers.', relatedTopics: [] },
    { id: 'topic-110', topicName: 'Accessibility for Disabled', keywords: ['accessibility', 'disabled', 'inclusive'], sentiment: 'Neutral', volume: 90, trend: 'stable', impactScore: 6.8, description: 'Feedback on banking accessibility for people with disabilities.', relatedTopics: [] },
    { id: 'topic-111', topicName: 'Interbank Transfer Speed', keywords: ['transfer', 'interbank', 'speed'], sentiment: 'Neutral', volume: 110, trend: 'stable', impactScore: 7.0, description: 'Perceived speed of transfers between different banks.', relatedTopics: [] },
    { id: 'topic-112', topicName: 'Small Business Loan Support', keywords: ['small business', 'loan', 'support'], sentiment: 'Positive', volume: 130, trend: 'increasing', impactScore: 7.9, description: 'Feedback on support for small business loan applications.', relatedTopics: ['Loans'] },
    { id: 'topic-113', topicName: 'Mobile Check Deposit', keywords: ['mobile', 'check', 'deposit'], sentiment: 'Positive', volume: 220, trend: 'stable', impactScore: 8.1, description: 'Ease and reliability of mobile check deposit feature.', relatedTopics: ['Mobile App Speed'] },
    { id: 'topic-114', topicName: 'ATM Transaction Limits', keywords: ['atm', 'limit', 'transaction'], sentiment: 'Negative', volume: 40, trend: 'stable', impactScore: 5.5, description: 'Concerns over daily ATM withdrawal or transaction limits.', relatedTopics: ['ATM Network Availability'] },
    { id: 'topic-115', topicName: 'Customer Education Resources', keywords: ['education', 'resources', 'guide'], sentiment: 'Positive', volume: 95, trend: 'increasing', impactScore: 7.3, description: 'Feedback on availability and usefulness of financial education materials.', relatedTopics: [] },
    { id: 'topic-116', topicName: 'Password Reset Process', keywords: ['password', 'reset', 'login'], sentiment: 'Negative', volume: 70, trend: 'critical', impactScore: 7.7, description: 'Difficulties or frustrations with resetting account passwords.', relatedTopics: ['Online Banking Security'] },
    { id: 'topic-117', topicName: 'International Card Usage', keywords: ['international', 'card', 'travel'], sentiment: 'Neutral', volume: 60, trend: 'stable', impactScore: 6.5, description: 'Experiences with using cards abroad, fees, and acceptance.', relatedTopics: ['International Transfer Fees'] },
];

const totalMentionsOverall = 1200000 + Math.floor(Math.random() * 50000);
const overallPositive = 0.91;
const overallNegative = 0.05;
const overallNeutral = 0.04;
const overallScore = calculateOverallScore(overallPositive, overallNegative, overallNeutral, 1); // Not correct, it's percentages. (0.91-0.05)*100 = 86

const generateSentimentSummary = (): SentimentSummary => {
    const positive = Math.round(totalMentionsOverall * overallPositive);
    const negative = Math.round(totalMentionsOverall * overallNegative);
    const neutral = Math.round(totalMentionsOverall * overallNeutral);
    const scoreChange = parseFloat(((Math.random() * 6) - 3).toFixed(2)); // -3 to 3
    const previousScore = 80 + scoreChange * 0.5;

    return {
        totalMentions: totalMentionsOverall,
        positivePercentage: overallPositive * 100,
        negativePercentage: overallNegative * 100,
        neutralPercentage: overallNeutral * 100,
        overallScore: 86 + scoreChange, // Based on initial 91% positive, 5% negative
        scoreChange24h: scoreChange,
        previousPeriodScore: previousScore,
    };
};

const sentimentSummaryData: SentimentSummary = generateSentimentSummary();

const sentimentDailyTrendData = generateRandomData(30, new Date().getMonth() - 1, new Date().getFullYear()).map(d => ({ ...d, name: new Date(d.timestamp).getDate().toString() }));
const sentimentWeeklyTrendData = generateRandomData(12, new Date().getMonth() - 6, new Date().getFullYear()).map((d, i) => ({ ...d, name: `Week ${i + 1}` }));
const sentimentMonthlyTrendData = generateRandomData(12, new Date().getMonth() - 11, new Date().getFullYear());


const sentimentBySourceData: SentimentBySource[] = allDataSources.map(source => {
    const total = Math.floor(50000 + Math.random() * 200000);
    const positive = Math.round(total * (0.6 + Math.random() * 0.3)); // 60-90%
    const negative = Math.round(total * (0.05 + Math.random() * 0.15)); // 5-20%
    const neutral = total - positive - negative;
    return {
        source,
        positive,
        negative,
        neutral,
        total,
        overallScore: calculateOverallScore(positive, negative, neutral, total),
    };
});

const sentimentByProductData: SentimentByProduct[] = allProducts.map(product => {
    const total = Math.floor(30000 + Math.random() * 150000);
    const positive = Math.round(total * (0.7 + Math.random() * 0.2));
    const negative = Math.round(total * (0.05 + Math.random() * 0.1));
    const neutral = total - positive - negative;
    const keyIssues = Math.random() > 0.5 ? detailedTopics.slice(0, 3).map(t => ({ ...t, volume: Math.floor(t.volume / 2) })) : [];
    return {
        product,
        positive,
        negative,
        neutral,
        total,
        overallScore: calculateOverallScore(positive, negative, neutral, total),
        keyIssues,
    };
});

const sentimentByGeoData: SentimentByGeo[] = allRegions.map(region => {
    const total = Math.floor(10000 + Math.random() * 100000);
    const positive = Math.round(total * (0.65 + Math.random() * 0.25));
    const negative = Math.round(total * (0.03 + Math.random() * 0.12));
    const neutral = total - positive - negative;
    const topTopics = Math.random() > 0.6 ? detailedTopics.slice(0, 2).map(t => ({ ...t, volume: Math.floor(t.volume / 3) })) : [];
    return {
        region,
        positive,
        negative,
        neutral,
        total,
        overallScore: calculateOverallScore(positive, negative, neutral, total),
        topTopics,
    };
});

const sentimentByDemographicData: SentimentByDemographic[] = allDemographics.map(demographic => {
    const total = Math.floor(15000 + Math.random() * 80000);
    const positive = Math.round(total * (0.6 + Math.random() * 0.3));
    const negative = Math.round(total * (0.07 + Math.random() * 0.13));
    const neutral = total - positive - negative;
    const keyFeedback = Math.random() > 0.5 ? generateRandomMentions(2, detailedTopics.slice(0, 5), ['surveys'], allProducts) : [];
    return {
        demographic,
        positive,
        negative,
        neutral,
        total,
        overallScore: calculateOverallScore(positive, negative, neutral, total),
        keyFeedback,
    };
});

const keywordSentimentData: KeywordSentimentAggregate[] = [
    { keyword: 'fast service', sentiment: 'Positive', volume: 5000, positiveCount: 4500, negativeCount: 200, neutralCount: 300, averageScore: 0.8, trend: 'increasing' },
    { keyword: 'high fees', sentiment: 'Negative', volume: 3000, positiveCount: 100, negativeCount: 2800, neutralCount: 100, averageScore: -0.9, trend: 'critical' },
    { keyword: 'easy to use', sentiment: 'Positive', volume: 7000, positiveCount: 6500, negativeCount: 100, neutralCount: 400, averageScore: 0.9, trend: 'stable' },
    { keyword: 'long wait times', sentiment: 'Negative', volume: 2500, positiveCount: 50, negativeCount: 2400, neutralCount: 50, averageScore: -0.95, trend: 'critical' },
    { keyword: 'secure app', sentiment: 'Positive', volume: 4000, positiveCount: 3800, negativeCount: 50, neutralCount: 150, averageScore: 0.92, trend: 'increasing' },
    { keyword: 'technical issues', sentiment: 'Negative', volume: 1800, positiveCount: 20, negativeCount: 1700, neutralCount: 80, averageScore: -0.9, trend: 'increasing' },
    { keyword: 'new features', sentiment: 'Positive', volume: 3500, positiveCount: 3200, negativeCount: 80, neutralCount: 220, averageScore: 0.85, trend: 'emerging' },
    { keyword: 'customer support', sentiment: 'Neutral', volume: 6000, positiveCount: 2500, negativeCount: 2000, neutralCount: 1500, averageScore: 0.08, trend: 'stable' },
    { keyword: 'poor communication', sentiment: 'Negative', volume: 1200, positiveCount: 10, negativeCount: 1150, neutralCount: 40, averageScore: -0.97, trend: 'critical' },
    { keyword: 'rewards program', sentiment: 'Positive', volume: 2800, positiveCount: 2600, negativeCount: 30, neutralCount: 170, averageScore: 0.9, trend: 'stable' },
    { keyword: 'account closure', sentiment: 'Negative', volume: 600, positiveCount: 5, negativeCount: 580, neutralCount: 15, averageScore: -0.98, trend: 'increasing' },
    { keyword: 'loan application', sentiment: 'Neutral', volume: 1500, positiveCount: 700, negativeCount: 300, neutralCount: 500, averageScore: 0.26, trend: 'stable' },
];

const anomalyDetectionResults: AnomalyDetectionResult[] = [
    { id: 'anom-001', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), anomalyType: 'sentiment_drop', description: 'Significant drop in positive sentiment for Mobile App Speed.', severity: 'high', affectedTopics: ['Mobile App Speed'], affectedSources: ['social_media', 'reviews'], currentSentiment: 0.3, expectedSentiment: 0.8, actionItems: ['Investigate app update issues', 'Notify dev team'], status: 'detected' },
    { id: 'anom-002', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), anomalyType: 'volume_spike', description: 'Unusual spike in mentions for New Savings Feature.', severity: 'medium', affectedTopics: ['New Savings Feature'], affectedSources: ['news_articles'], currentSentiment: 0.9, expectedSentiment: 0.7, actionItems: ['Monitor news coverage', 'Amplify positive PR'], status: 'investigated' },
    { id: 'anom-003', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), anomalyType: 'topic_shift', description: 'Emergence of "ATM Network Availability" as a critical negative topic in Asia.', severity: 'high', affectedTopics: ['ATM Network Availability'], affectedSources: ['support_tickets', 'forums'], currentSentiment: -0.6, expectedSentiment: -0.1, actionItems: ['Identify affected ATMs', 'Dispatch maintenance'], status: 'detected' },
    { id: 'anom-004', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), anomalyType: 'sentiment_drop', description: 'Sudden increase in "technical issues" mentions.', severity: 'critical', affectedTopics: ['Technical Glitches/Bugs'], affectedSources: ['social_media'], currentSentiment: -0.7, expectedSentiment: -0.2, actionItems: ['Escalate to engineering', 'Prepare customer comms'], status: 'detected' },
    { id: 'anom-005', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), anomalyType: 'volume_spike', description: 'High volume of positive mentions for "Digital Wallet Integration".', severity: 'low', affectedTopics: ['Digital Wallet Integration'], affectedSources: ['reviews'], currentSentiment: 0.8, expectedSentiment: 0.6, actionItems: ['Highlight success in marketing'], status: 'resolved' },
];

const reportGenerationHistory: ReportGenerationStatus[] = [
    { id: 'rep-001', reportName: 'Daily Sentiment Summary - 2023-07-20', type: 'daily_summary', status: 'completed', generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), downloadUrl: '/reports/daily_summary_2023-07-20.pdf', requestedBy: 'analyst_john', parameters: { date: '2023-07-20' } },
    { id: 'rep-002', reportName: 'Weekly Deep Dive - Jul 10-16', type: 'weekly_deep_dive', status: 'completed', generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), downloadUrl: '/reports/weekly_deep_dive_jul_10-16.xlsx', requestedBy: 'analyst_john', parameters: { startDate: '2023-07-10', endDate: '2023-07-16' } },
    { id: 'rep-003', reportName: 'Custom Report: Mobile App Performance', type: 'custom', status: 'generating', generatedAt: new Date().toISOString(), downloadUrl: undefined, requestedBy: 'admin_jane', parameters: { topics: ['Mobile App Speed', 'Digital Banking Features'], products: ['mobile_app'], dateRange: 'last_7_days' } },
    { id: 'rep-004', reportName: 'Daily Sentiment Summary - 2023-07-21', type: 'daily_summary', status: 'failed', generatedAt: new Date().toISOString(), downloadUrl: undefined, requestedBy: 'analyst_john', parameters: { date: '2023-07-21' } },
];

const auditLogData: AuditLogEntry[] = [
    { id: 'aud-001', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), user: 'analyst_john', action: 'view_dashboard', details: 'Accessed overall sentiment dashboard.' },
    { id: 'aud-002', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), user: 'admin_jane', action: 'update_alert_config', details: 'Modified alert threshold for "Mobile App Speed".', targetId: 'alert-001', targetType: 'AlertConfiguration' },
    { id: 'aud-003', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), user: 'analyst_john', action: 'export_data', details: 'Exported sentiment trend data for Q2 2023.', targetType: 'SentimentTrendData' },
    { id: 'aud-004', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), user: 'viewer_mike', action: 'view_report', details: 'Downloaded "Daily Sentiment Summary - 2023-07-20".', targetId: 'rep-001', targetType: 'ReportGenerationStatus' },
];

// Enrich topics with sample mentions
detailedTopics.forEach(topic => {
    topic.sampleMentions = generateRandomMentions(Math.floor(Math.random() * 5) + 2, [topic], allDataSources, allProducts);
});

// --- Constants for UI Styling ---
const CHART_COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#64748b'];
const PIE_COLORS = ['#10b981', '#ef4444', '#3b82f6']; // Positive, Negative, Neutral

// --- Main SentimentAnalysisView Component ---
const SentimentAnalysisView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'topics' | 'sources' | 'products' | 'geodemographics' | 'keywords' | 'anomalies' | 'reports' | 'settings' | 'audit'>('overview');
    const [dateRange, setDateRange] = useState<string>('last_30_days');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedTopicDetail, setSelectedTopicDetail] = useState<TopicDetail | null>(null);
    const [isTopicDetailModalOpen, setIsTopicDetailModalOpen] = useState<boolean>(false);
    const [alertConfigModalOpen, setAlertConfigModalOpen] = useState<boolean>(false);
    const [newAlertConfig, setNewAlertConfig] = useState<AlertConfiguration>({
        id: '', name: '', type: 'sentiment_drop', threshold: 0, recipients: [], isActive: true
    });
    const [allAlertConfigs, setAllAlertConfigs] = useState<AlertConfiguration[]>([
        { id: 'alert-001', name: 'Mobile App Sentiment Drop', type: 'sentiment_drop', threshold: -0.2, sentimentCategory: 'Negative', productService: 'mobile_app', recipients: ['admin@example.com'], isActive: true },
        { id: 'alert-002', name: 'Critical Topic Spike', type: 'volume_spike', threshold: 1000, keyword: 'customer support wait times', recipients: ['support_lead@example.com'], isActive: true },
    ]);
    const [userConfigs, setUserConfigs] = useState<UserConfiguration[]>([
        { id: 'user-001', username: 'admin_jane', role: 'admin', email: 'jane@example.com', preferences: { defaultDashboard: 'overview', emailNotifications: true, darkMode: true }, accessLevel: ['all_data'] },
        { id: 'user-002', username: 'analyst_john', role: 'analyst', email: 'john@example.com', preferences: { defaultDashboard: 'topics', emailNotifications: true, darkMode: false }, accessLevel: ['all_data'] },
        { id: 'user-003', username: 'viewer_mike', role: 'viewer', email: 'mike@example.com', preferences: { defaultDashboard: 'overview', emailNotifications: false, darkMode: false }, accessLevel: ['customer_support'] },
    ]);
    const [activeReportTab, setActiveReportTab] = useState<'generate' | 'history'>('history');

    // Simulated data fetching (useEffect)
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            // In a real app, this would fetch data based on `dateRange`
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, [dateRange]);

    const handleTopicClick = useCallback((topic: TopicDetail) => {
        setSelectedTopicDetail(topic);
        setIsTopicDetailModalOpen(true);
    }, []);

    const handleGenerateReport = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            const newReport: ReportGenerationStatus = {
                id: `rep-${Date.now()}`,
                reportName: `Custom Report: ${new Date().toLocaleDateString()}`,
                type: 'custom',
                status: 'completed',
                generatedAt: new Date().toISOString(),
                downloadUrl: `/reports/custom_${Date.now()}.pdf`,
                requestedBy: 'current_user',
                parameters: { dateRange, currentActiveTab: activeTab }
            };
            reportGenerationHistory.push(newReport); // Directly modifying, in real app would dispatch an action
            setIsLoading(false);
            setActiveReportTab('history');
            alert('Report generated successfully!');
        }, 2000);
    }, [dateRange, activeTab]);


    const renderSentimentBreakdownPie = (data: { positive: number; negative: number; neutral: number; }[], title: string = "Sentiment Breakdown") => (
        <Card title={title}>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={[
                            { name: 'Positive', value: data.reduce((acc, curr) => acc + curr.positive, 0) },
                            { name: 'Negative', value: data.reduce((acc, curr) => acc + curr.negative, 0) },
                            { name: 'Neutral', value: data.reduce((acc, curr) => acc + curr.neutral, 0) },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );

    const renderMetricCard = (title: string, value: string | number, subtext: string, valueColorClass: string = 'text-white') => (
        <Card className="text-center">
            <p className={`text-3xl font-bold ${valueColorClass}`}>{value}</p>
            <p className="text-sm text-gray-400 mt-1">{subtext}</p>
        </Card>
    );

    const renderChartCard = (title: string, chartComponent: React.ReactNode) => (
        <Card title={title}>
            <div className="h-80">
                {chartComponent}
            </div>
        </Card>
    );

    // This is the core component rendered in the return statement.
    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <h1 className="text-5xl font-extrabold text-center text-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-10 tracking-wide">
                Advanced AI Sentiment Platform
            </h1>

            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white tracking-wider">Sentiment Analysis Dashboard</h2>
                <div className="flex space-x-4">
                    <select
                        className="bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="last_24_hours">Last 24 Hours</option>
                        <option value="last_7_days">Last 7 Days</option>
                        <option value="last_30_days">Last 30 Days</option>
                        <option value="last_90_days">Last 90 Days</option>
                        <option value="last_6_months">Last 6 Months</option>
                        <option value="last_12_months">Last 12 Months</option>
                        <option value="custom">Custom Range</option>
                    </select>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300">
                        <i className="fas fa-refresh mr-2"></i> Refresh Data
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300" onClick={handleGenerateReport}>
                        <i className="fas fa-file-export mr-2"></i> Generate Report
                    </button>
                </div>
            </div>

            <nav className="mb-8 border-b border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-400">
                    <li className="mr-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${activeTab === 'overview' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${activeTab === 'trends' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('trends')}
                        >
                            Advanced Trends
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${activeTab === 'topics' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('topics')}
                        >
                            Topic Modeling
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${activeTab === 'sources' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('sources')}
                        >
                            Data Sources
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${activeTab === 'products' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('products')}
                        >
                            Products/Services
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${activeTab === 'geodemographics' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('geodemographics')}
                        >
                            Geo/Demographics
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${activeTab === 'keywords' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('keywords')}
                        >
                            Keywords
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${activeTab === 'anomalies' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('anomalies')}
                        >
                            Anomaly Detection
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${activeTab === 'reports' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('reports')}
                        >
                            Reports
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${activeTab === 'settings' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Settings
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${activeTab === 'audit' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                            onClick={() => setActiveTab('audit')}
                        >
                            Audit Log
                        </button>
                    </li>
                </ul>
            </nav>

            {isLoading && (
                <div className="flex items-center justify-center p-8 text-blue-400 text-lg">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading advanced sentiment data...
                </div>
            )}

            {!isLoading && activeTab === 'overview' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-200 mt-6 mb-4">Overall Performance Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {renderMetricCard('Overall Positive Sentiment', `${sentimentSummaryData.positivePercentage.toFixed(1)}%`, 'Current Period', 'text-green-400')}
                        {renderMetricCard('Overall Negative Sentiment', `${sentimentSummaryData.negativePercentage.toFixed(1)}%`, 'Current Period', 'text-red-400')}
                        {renderMetricCard('Total Sources Analyzed', formatNumber(sentimentSummaryData.totalMentions), `Last ${dateRange.replace('_', ' ').replace('last', '')}`)}
                        {renderMetricCard('Sentiment Score (0-100)', `${sentimentSummaryData.overallScore.toFixed(1)}`, `Change: ${sentimentSummaryData.scoreChange24h! > 0 ? '+' : ''}${sentimentSummaryData.scoreChange24h!.toFixed(1)}% (24h)`, sentimentSummaryData.scoreChange24h! >= 0 ? 'text-green-400' : 'text-red-400')}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Sentiment Trend (Last 6 Months)">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={sentimentMonthlyTrendData}>
                                    <XAxis dataKey="name" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" unit="%" />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="positive" name="Positive" stroke="#10b981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="negative" name="Negative" stroke="#ef4444" strokeWidth={2} />
                                    <Line type="monotone" dataKey="neutral" name="Neutral" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                        {renderSentimentBreakdownPie([{ positive: sentimentSummaryData.positivePercentage, negative: sentimentSummaryData.negativePercentage, neutral: sentimentSummaryData.neutralPercentage }], "Current Sentiment Distribution")}
                    </div>

                    <Card title="AI-Detected Emerging Topics (Top 5 Critical)">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Topic</th>
                                        <th scope="col" className="px-6 py-3">Sentiment</th>
                                        <th scope="col" className="px-6 py-3">Mention Volume</th>
                                        <th scope="col" className="px-6 py-3">Trend</th>
                                        <th scope="col" className="px-6 py-3">Impact Score</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emergingTopics.filter(t => t.trend === 'critical' || t.sentiment === 'Negative').slice(0, 5).map((topic, index) => (
                                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-white">{topic.topic}</td>
                                            <td className="px-6 py-4">
                                                <span className={getSentimentColor(topic.sentiment)}>{topic.sentiment}</span>
                                            </td>
                                            <td className="px-6 py-4">{formatNumber(topic.volume)}</td>
                                            <td className="px-6 py-4">
                                                <span className={getSentimentColor(topic.trend)}>
                                                    {topic.trend === 'increasing' && <i className="fas fa-arrow-up mr-1"></i>}
                                                    {topic.trend === 'decreasing' && <i className="fas fa-arrow-down mr-1"></i>}
                                                    {topic.trend === 'critical' && <i className="fas fa-exclamation-triangle mr-1"></i>}
                                                    {topic.trend}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{topic.impactScore.toFixed(1)}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => handleTopicClick(detailedTopics.find(d => d.topicName === topic.topic)!)} className="text-blue-500 hover:text-blue-400">Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {!isLoading && activeTab === 'trends' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-200 mt-6 mb-4">Detailed Sentiment Trend Analysis</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderChartCard('Daily Sentiment Trend (Last 30 Days)', (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sentimentDailyTrendData}>
                                    <XAxis dataKey="name" stroke="#9ca3af" />
                                    <YAxis yAxisId="left" stroke="#9ca3af" unit="%" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" label={{ value: 'Total Mentions', angle: -90, position: 'insideRight', fill: '#9ca3af' }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="positive" name="Positive %" stroke="#10b981" strokeWidth={2} />
                                    <Line yAxisId="left" type="monotone" dataKey="negative" name="Negative %" stroke="#ef4444" strokeWidth={2} />
                                    <Line yAxisId="left" type="monotone" dataKey="neutral" name="Neutral %" stroke="#3b82f6" strokeWidth={2} />
                                    <Bar yAxisId="right" dataKey="total" name="Mentions" fill="#60a5fa" opacity={0.3} />
                                </LineChart>
                            </ResponsiveContainer>
                        ))}
                        {renderChartCard('Weekly Sentiment Trend (Last 12 Weeks)', (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sentimentWeeklyTrendData}>
                                    <XAxis dataKey="name" stroke="#9ca3af" />
                                    <YAxis yAxisId="left" stroke="#9ca3af" unit="%" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" label={{ value: 'Total Mentions', angle: -90, position: 'insideRight', fill: '#9ca3af' }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Legend />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                    <Bar yAxisId="left" dataKey="positive" stackId="a" fill="#10b981" name="Positive" />
                                    <Bar yAxisId="left" dataKey="negative" stackId="a" fill="#ef4444" name="Negative" />
                                    <Bar yAxisId="left" dataKey="neutral" stackId="a" fill="#3b82f6" name="Neutral" />
                                    <Line yAxisId="right" type="monotone" dataKey="averageScore" name="Avg. Score" stroke="#f59e0b" strokeWidth={2} />
                                </BarChart>
                            </ResponsiveContainer>
                        ))}
                    </div>

                    <Card title="Sentiment Score Distribution (Historical)">
                        <p className="text-gray-400 text-sm mb-4">This chart represents the frequency of different average sentiment scores recorded over the selected period.</p>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={sentimentMonthlyTrendData.map(d => ({ name: d.name, score: d.averageScore * 100 }))}>
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" domain={[-100, 100]} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                <Legend />
                                <Line type="monotone" dataKey="score" name="Average Sentiment Score" stroke="#8b5cf6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card title="Comparative Sentiment Overlay">
                        <p className="text-gray-400 text-sm mb-4">Compare sentiment across different products or categories over time.</p>
                        <div className="flex space-x-4 mb-4">
                            <select className="bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Select Product A</option>
                                {allProducts.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
                            </select>
                            <select className="bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Select Product B</option>
                                {allProducts.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
                            </select>
                            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">Apply Comparison</button>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={sentimentMonthlyTrendData}>
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" unit="%" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                <Legend />
                                <Line type="monotone" dataKey="positive" name="Product A Positive" stroke="#10b981" strokeWidth={2} />
                                <Line type="monotone" dataKey="negative" name="Product A Negative" stroke="#ef4444" strokeWidth={2} />
                                <Line type="monotone" dataKey="positive" name="Product B Positive (Simulated)" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="3 4 5 2" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            )}

            {!isLoading && activeTab === 'topics' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-200 mt-6 mb-4">AI-Driven Topic Modeling & Insights</h3>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                placeholder="Search topic by keyword..."
                                className="bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select className="bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Filter by Sentiment</option>
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                                <option value="Neutral">Neutral</option>
                            </select>
                        </div>
                        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">
                            <i className="fas fa-magic mr-2"></i> Retrain Topic Model
                        </button>
                    </div>

                    <Card title="All Detected Topics & Their Sentiment">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Topic Name</th>
                                        <th scope="col" className="px-6 py-3">Sentiment</th>
                                        <th scope="col" className="px-6 py-3">Volume</th>
                                        <th scope="col" className="px-6 py-3">Trend</th>
                                        <th scope="col" className="px-6 py-3">Impact Score</th>
                                        <th scope="col" className="px-6 py-3">Keywords</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailedTopics.map((topic) => (
                                        <tr key={topic.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-white">{topic.topicName}</td>
                                            <td className="px-6 py-4"><span className={getSentimentColor(topic.sentiment)}>{topic.sentiment}</span></td>
                                            <td className="px-6 py-4">{formatNumber(topic.volume)}</td>
                                            <td className="px-6 py-4"><span className={getSentimentColor(topic.trend)}>{topic.trend}</span></td>
                                            <td className="px-6 py-4">{topic.impactScore.toFixed(1)}</td>
                                            <td className="px-6 py-4 text-gray-500">{topic.keywords.join(', ')}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => handleTopicClick(topic)} className="text-blue-500 hover:text-blue-400 mr-2">Details</button>
                                                <button className="text-yellow-500 hover:text-yellow-400">Merge</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title="Top Entities by Sentiment">
                        <p className="text-gray-400 text-sm mb-4">Automatically extracted key entities and their associated sentiment.</p>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart outerRadius={100} data={[
                                { name: 'Customer Service', A: 80, B: 60, fullMark: 100 },
                                { name: 'Mobile App', A: 90, B: 75, fullMark: 100 },
                                { name: 'Investment Products', A: 70, B: 85, fullMark: 100 },
                                { name: 'Banking Staff', A: 85, B: 70, fullMark: 100 },
                                { name: 'Online Portal', A: 65, B: 80, fullMark: 100 },
                            ]}>
                                <PolarGrid stroke="#4b5563" />
                                <PolarAngleAxis dataKey="name" stroke="#9ca3af" />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#4b5563" />
                                <Radar name="Positive Sentiment" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                <Radar name="Negative Sentiment" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            )}

            {!isLoading && activeTab === 'sources' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-200 mt-6 mb-4">Sentiment Breakdown by Data Source</h3>

                    <Card title="Sentiment Performance by Source">
                        <p className="text-gray-400 text-sm mb-4">Understand which data sources contribute most to positive/negative sentiment.</p>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={sentimentBySourceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                <XAxis dataKey="source" stroke="#9ca3af" />
                                <YAxis yAxisId="left" stroke="#9ca3af" label={{ value: 'Percentage', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} unit="%" domain={[0, 100]} />
                                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" label={{ value: 'Total Mentions', angle: -90, position: 'insideRight', fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number, name: string) => name.includes('%') ? `${value.toFixed(1)}%` : formatNumber(value)} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="positive" fill="#10b981" name="Positive %" stackId="a" />
                                <Bar yAxisId="left" dataKey="negative" fill="#ef4444" name="Negative %" stackId="a" />
                                <Bar yAxisId="left" dataKey="neutral" fill="#3b82f6" name="Neutral %" stackId="a" />
                                <Line yAxisId="right" type="monotone" dataKey="total" stroke="#f59e0b" name="Total Mentions" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card title="Detailed Source Analysis">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Source</th>
                                        <th scope="col" className="px-6 py-3">Positive</th>
                                        <th scope="col" className="px-6 py-3">Negative</th>
                                        <th scope="col" className="px-6 py-3">Neutral</th>
                                        <th scope="col" className="px-6 py-3">Total Volume</th>
                                        <th scope="col" className="px-6 py-3">Overall Score</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sentimentBySourceData.map((data, index) => (
                                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-white">{data.source.replace('_', ' ')}</td>
                                            <td className="px-6 py-4 text-green-400">{((data.positive / data.total) * 100 || 0).toFixed(1)}%</td>
                                            <td className="px-6 py-4 text-red-400">{((data.negative / data.total) * 100 || 0).toFixed(1)}%</td>
                                            <td className="px-6 py-4 text-blue-400">{((data.neutral / data.total) * 100 || 0).toFixed(1)}%</td>
                                            <td className="px-6 py-4">{formatNumber(data.total)}</td>
                                            <td className="px-6 py-4">{data.overallScore.toFixed(1)}</td>
                                            <td className="px-6 py-4">
                                                <button className="text-blue-500 hover:text-blue-400">Drill Down</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {!isLoading && activeTab === 'products' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-200 mt-6 mb-4">Product/Service-Specific Sentiment</h3>

                    <Card title="Sentiment by Product/Service">
                        <p className="text-gray-400 text-sm mb-4">View sentiment aggregated by specific offerings.</p>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={sentimentByProductData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                <XAxis type="number" stroke="#9ca3af" label={{ value: 'Percentage', position: 'insideBottom', fill: '#9ca3af' }} unit="%" domain={[0, 100]} />
                                <YAxis type="category" dataKey="product" stroke="#9ca3af" width={120} tickFormatter={(value: string) => value.replace('_', ' ')} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number, name: string, props: any) => [`${((value / props.payload.total) * 100 || 0).toFixed(1)}%`, name]} />
                                <Legend />
                                <Bar dataKey="positive" fill="#10b981" name="Positive" stackId="a" />
                                <Bar dataKey="negative" fill="#ef4444" name="Negative" stackId="a" />
                                <Bar dataKey="neutral" fill="#3b82f6" name="Neutral" stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card title="Key Issues per Product">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Product</th>
                                        <th scope="col" className="px-6 py-3">Overall Score</th>
                                        <th scope="col" className="px-6 py-3">Top Negative Issues</th>
                                        <th scope="col" className="px-6 py-3">Issue Sentiment</th>
                                        <th scope="col" className="px-6 py-3">Issue Volume</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sentimentByProductData.map((data, index) => (
                                        <React.Fragment key={index}>
                                            {data.keyIssues && data.keyIssues.length > 0 ? (
                                                data.keyIssues.map((issue, issueIndex) => (
                                                    <tr key={`${data.product}-${issueIndex}`} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                        {issueIndex === 0 && (
                                                            <>
                                                                <td rowSpan={data.keyIssues?.length} className="px-6 py-4 font-medium text-white border-r border-gray-800">{data.product.replace('_', ' ')}</td>
                                                                <td rowSpan={data.keyIssues?.length} className={`px-6 py-4 font-bold ${data.overallScore >= 0 ? 'text-green-400' : 'text-red-400'} border-r border-gray-800`}>{data.overallScore.toFixed(1)}</td>
                                                            </>
                                                        )}
                                                        <td className="px-6 py-4">{issue.topicName}</td>
                                                        <td className="px-6 py-4"><span className={getSentimentColor(issue.sentiment)}>{issue.sentiment}</span></td>
                                                        <td className="px-6 py-4">{formatNumber(issue.volume)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr key={data.product} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 font-medium text-white">{data.product.replace('_', ' ')}</td>
                                                    <td className={`px-6 py-4 font-bold ${data.overallScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>{data.overallScore.toFixed(1)}</td>
                                                    <td className="px-6 py-4 italic text-gray-500" colSpan={3}>No prominent issues detected.</td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {!isLoading && activeTab === 'geodemographics' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-200 mt-6 mb-4">Geographic and Demographic Sentiment Insights</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Sentiment by Geographic Region">
                            <p className="text-gray-400 text-sm mb-4">Compare sentiment performance across different regions.</p>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={sentimentByGeoData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                    <XAxis dataKey="region" stroke="#9ca3af" />
                                    <YAxis yAxisId="left" stroke="#9ca3af" label={{ value: 'Sentiment Score', position: 'insideLeft', fill: '#9ca3af' }} domain={[-100, 100]} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" label={{ value: 'Total Mentions', angle: -90, position: 'insideRight', fill: '#9ca3af' }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="overallScore" name="Overall Score" fill="#3b82f6" />
                                    <Line yAxisId="right" type="monotone" dataKey="total" name="Total Mentions" stroke="#f59e0b" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                        <Card title="Sentiment by Demographic Group">
                            <p className="text-gray-400 text-sm mb-4">Analyze how different demographic groups perceive your brand/products.</p>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={sentimentByDemographicData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                    <XAxis dataKey="demographic" stroke="#9ca3af" />
                                    <YAxis yAxisId="left" stroke="#9ca3af" label={{ value: 'Sentiment Score', position: 'insideLeft', fill: '#9ca3af' }} domain={[-100, 100]} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" label={{ value: 'Total Mentions', angle: -90, position: 'insideRight', fill: '#9ca3af' }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="overallScore" name="Overall Score" fill="#8b5cf6" />
                                    <Line yAxisId="right" type="monotone" dataKey="total" name="Total Mentions" stroke="#ec4899" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>

                    <Card title="Regional & Demographic Deep Dive">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Category</th>
                                        <th scope="col" className="px-6 py-3">Name</th>
                                        <th scope="col" className="px-6 py-3">Overall Score</th>
                                        <th scope="col" className="px-6 py-3">Top Positive Topics</th>
                                        <th scope="col" className="px-6 py-3">Top Negative Topics</th>
                                        <th scope="col" className="px-6 py-3">Sample Feedback</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...sentimentByGeoData.map(d => ({ ...d, type: 'Region' })), ...sentimentByDemographicData.map(d => ({ ...d, type: 'Demographic' }))].map((data, index) => (
                                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-white">{data.type}</td>
                                            <td className="px-6 py-4 text-white">{data.type === 'Region' ? data.region : data.demographic}</td>
                                            <td className={`px-6 py-4 font-bold ${data.overallScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>{data.overallScore.toFixed(1)}</td>
                                            <td className="px-6 py-4 text-green-300">
                                                {data.type === 'Region' && data.topTopics && data.topTopics.filter(t => t.sentiment === 'Positive').map(t => t.topicName).join(', ')}
                                                {data.type === 'Demographic' && 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-red-300">
                                                {data.type === 'Region' && data.topTopics && data.topTopics.filter(t => t.sentiment === 'Negative').map(t => t.topicName).join(', ')}
                                                {data.type === 'Demographic' && 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 italic text-gray-500">
                                                {data.type === 'Demographic' && data.keyFeedback && data.keyFeedback.length > 0 ? (
                                                    data.keyFeedback[0].text.substring(0, 70) + '...'
                                                ) : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {!isLoading && activeTab === 'keywords' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-200 mt-6 mb-4">Keyword-Level Sentiment Analysis</h3>

                    <Card title="Top Keywords by Sentiment and Volume">
                        <p className="text-gray-400 text-sm mb-4">Identify high-impact keywords and their sentiment drivers.</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Keyword</th>
                                        <th scope="col" className="px-6 py-3">Overall Sentiment</th>
                                        <th scope="col" className="px-6 py-3">Total Volume</th>
                                        <th scope="col" className="px-6 py-3">Positive Mentions</th>
                                        <th scope="col" className="px-6 py-3">Negative Mentions</th>
                                        <th scope="col" className="px-6 py-3">Average Score</th>
                                        <th scope="col" className="px-6 py-3">Trend</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {keywordSentimentData.sort((a, b) => b.volume - a.volume).map((keywordData, index) => (
                                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-white">{keywordData.keyword}</td>
                                            <td className="px-6 py-4"><span className={getSentimentColor(keywordData.sentiment)}>{keywordData.sentiment}</span></td>
                                            <td className="px-6 py-4">{formatNumber(keywordData.volume)}</td>
                                            <td className="px-6 py-4 text-green-400">{formatNumber(keywordData.positiveCount)}</td>
                                            <td className="px-6 py-4 text-red-400">{formatNumber(keywordData.negativeCount)}</td>
                                            <td className="px-6 py-4">{keywordData.averageScore.toFixed(2)}</td>
                                            <td className="px-6 py-4"><span className={getSentimentColor(keywordData.trend)}>{keywordData.trend}</span></td>
                                            <td className="px-6 py-4">
                                                <button className="text-blue-500 hover:text-blue-400">View Mentions</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title="Keyword Sentiment Trend">
                        <p className="text-gray-400 text-sm mb-4">Track sentiment of specific keywords over time.</p>
                        <div className="flex space-x-4 mb-4">
                            <select className="bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Select Keyword</option>
                                {keywordSentimentData.map(k => <option key={k.keyword} value={k.keyword}>{k.keyword}</option>)}
                            </select>
                            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">Show Trend</button>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={sentimentDailyTrendData.slice(0, 10)}>
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                <Legend />
                                <Line type="monotone" dataKey="averageScore" name="Keyword Sentiment Score" stroke="#f59e0b" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            )}

            {!isLoading && activeTab === 'anomalies' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-200 mt-6 mb-4">Real-time Anomaly Detection & Alerts</h3>

                    <Card title="Detected Anomalies">
                        <p className="text-gray-400 text-sm mb-4">Alerts for unusual shifts in sentiment or mention volume.</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Timestamp</th>
                                        <th scope="col" className="px-6 py-3">Anomaly Type</th>
                                        <th scope="col" className="px-6 py-3">Description</th>
                                        <th scope="col" className="px-6 py-3">Severity</th>
                                        <th scope="col" className="px-6 py-3">Affected Topics</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {anomalyDetectionResults.map((anomaly, index) => (
                                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-6 py-4 text-white">{new Date(anomaly.timestamp).toLocaleString()}</td>
                                            <td className="px-6 py-4">{anomaly.anomalyType.replace('_', ' ')}</td>
                                            <td className="px-6 py-4">{anomaly.description}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${anomaly.severity === 'critical' ? 'bg-red-900 text-red-300' : anomaly.severity === 'high' ? 'bg-orange-900 text-orange-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                                    {anomaly.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{anomaly.affectedTopics?.join(', ') || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${anomaly.status === 'detected' ? 'bg-red-800 text-red-200' : anomaly.status === 'investigated' ? 'bg-yellow-800 text-yellow-200' : 'bg-green-800 text-green-200'}`}>
                                                    {anomaly.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-blue-500 hover:text-blue-400 mr-2">View Details</button>
                                                {anomaly.status === 'detected' && (
                                                    <button className="text-green-500 hover:text-green-400">Mark as Investigated</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title="Alert Configurations">
                        <p className="text-gray-400 text-sm mb-4">Manage automated alerts for critical sentiment changes.</p>
                        <div className="flex justify-end mb-4">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md" onClick={() => setAlertConfigModalOpen(true)}>
                                <i className="fas fa-plus mr-2"></i> Create New Alert
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Alert Name</th>
                                        <th scope="col" className="px-6 py-3">Type</th>
                                        <th scope="col" className="px-6 py-3">Threshold</th>
                                        <th scope="col" className="px-6 py-3">Target</th>
                                        <th scope="col" className="px-6 py-3">Recipients</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allAlertConfigs.map((alert, index) => (
                                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-white">{alert.name}</td>
                                            <td className="px-6 py-4">{alert.type.replace('_', ' ')}</td>
                                            <td className="px-6 py-4">{alert.threshold}{alert.type === 'sentiment_drop' ? ' Score Drop' : ' Mentions'}</td>
                                            <td className="px-6 py-4">
                                                {alert.productService && `Product: ${alert.productService.replace('_', ' ')}`}
                                                {alert.keyword && `Keyword: "${alert.keyword}"`}
                                                {!alert.productService && !alert.keyword && 'Global'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{alert.recipients.join(', ')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${alert.isActive ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                                                    {alert.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-yellow-500 hover:text-yellow-400 mr-2">Edit</button>
                                                <button className="text-red-500 hover:text-red-400">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {!isLoading && activeTab === 'reports' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-200 mt-6 mb-4">Report Generation & History</h3>

                    <div className="mb-4 border-b border-gray-700">
                        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-400">
                            <li className="mr-2">
                                <button
                                    className={`inline-block p-4 border-b-2 ${activeReportTab === 'generate' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                                    onClick={() => setActiveReportTab('generate')}
                                >
                                    Generate New Report
                                </button>
                            </li>
                            <li className="mr-2">
                                <button
                                    className={`inline-block p-4 border-b-2 ${activeReportTab === 'history' ? 'text-blue-500 border-blue-500' : 'border-transparent hover:text-gray-300 hover:border-gray-300'}`}
                                    onClick={() => setActiveReportTab('history')}
                                >
                                    Report History
                                </button>
                            </li>
                        </ul>
                    </div>

                    {activeReportTab === 'generate' && (
                        <Card title="Configure New Report">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label htmlFor="reportName" className="block text-gray-300 text-sm font-bold mb-2">Report Name</label>
                                    <input type="text" id="reportName" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800" placeholder="e.g., Q3 Sentiment Analysis" />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="reportType" className="block text-gray-300 text-sm font-bold mb-2">Report Type</label>
                                    <select id="reportType" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800">
                                        <option value="daily_summary">Daily Summary</option>
                                        <option value="weekly_deep_dive">Weekly Deep Dive</option>
                                        <option value="custom">Custom Analysis</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="reportDateRange" className="block text-gray-300 text-sm font-bold mb-2">Date Range</label>
                                    <select id="reportDateRange" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                                        <option value="last_24_hours">Last 24 Hours</option>
                                        <option value="last_7_days">Last 7 Days</option>
                                        <option value="last_30_days">Last 30 Days</option>
                                        <option value="last_90_days">Last 90 Days</option>
                                        <option value="last_6_months">Last 6 Months</option>
                                        <option value="last_12_months">Last 12 Months</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="reportFormat" className="block text-gray-300 text-sm font-bold mb-2">Output Format</label>
                                    <select id="reportFormat" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800">
                                        <option value="pdf">PDF</option>
                                        <option value="xlsx">Excel (XLSX)</option>
                                        <option value="csv">CSV</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 mb-4">
                                    <label htmlFor="reportNotes" className="block text-gray-300 text-sm font-bold mb-2">Additional Notes</label>
                                    <textarea id="reportNotes" rows={3} className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800" placeholder="Include specific insights or data points..."></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-md" onClick={handleGenerateReport} disabled={isLoading}>
                                    {isLoading ? 'Generating...' : <><i className="fas fa-file-alt mr-2"></i> Generate Report</>}
                                </button>
                            </div>
                        </Card>
                    )}

                    {activeReportTab === 'history' && (
                        <Card title="Recent Report Generation History">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-400">
                                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Report Name</th>
                                            <th scope="col" className="px-6 py-3">Type</th>
                                            <th scope="col" className="px-6 py-3">Status</th>
                                            <th scope="col" className="px-6 py-3">Generated At</th>
                                            <th scope="col" className="px-6 py-3">Requested By</th>
                                            <th scope="col" className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportGenerationHistory.sort((a, b) => new Date(b.generatedAt!).getTime() - new Date(a.generatedAt!).getTime()).map((report, index) => (
                                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                <td className="px-6 py-4 font-medium text-white">{report.reportName}</td>
                                                <td className="px-6 py-4">{report.type.replace('_', ' ')}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${report.status === 'completed' ? 'bg-green-800 text-green-200' : report.status === 'generating' ? 'bg-blue-800 text-blue-200' : 'bg-red-800 text-red-200'}`}>
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{report.generatedAt ? new Date(report.generatedAt).toLocaleString() : 'N/A'}</td>
                                                <td className="px-6 py-4">{report.requestedBy}</td>
                                                <td className="px-6 py-4">
                                                    {report.status === 'completed' && report.downloadUrl && (
                                                        <a href={report.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400 mr-2">
                                                            <i className="fas fa-download mr-1"></i> Download
                                                        </a>
                                                    )}
                                                    {report.status === 'failed' && (
                                                        <button className="text-yellow-500 hover:text-yellow-400 mr-2">Retry</button>
                                                    )}
                                                    <button className="text-red-500 hover:text-red-400">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {!isLoading && activeTab === 'settings' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-200 mt-6 mb-4">Application Settings & User Management</h3>

                    <Card title="User Account Settings">
                        <p className="text-gray-400 text-sm mb-4">Manage your personal preferences.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label htmlFor="username" className="block text-gray-300 text-sm font-bold mb-2">Username</label>
                                <input type="text" id="username" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800" value={userConfigs[0].username} readOnly />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">Email</label>
                                <input type="email" id="email" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800" value={userConfigs[0].email} />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="role" className="block text-gray-300 text-sm font-bold mb-2">Role</label>
                                <input type="text" id="role" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800" value={userConfigs[0].role} readOnly />
                            </div>
                            <div className="mb-4 flex items-center mt-6">
                                <input type="checkbox" id="emailNotifications" className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600" checked={userConfigs[0].preferences.emailNotifications} />
                                <label htmlFor="emailNotifications" className="text-gray-300 text-sm font-bold">Receive Email Notifications</label>
                            </div>
                            <div className="md:col-span-2 flex items-center mt-2">
                                <input type="checkbox" id="darkMode" className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600" checked={userConfigs[0].preferences.darkMode} />
                                <label htmlFor="darkMode" className="text-gray-300 text-sm font-bold">Enable Dark Mode</label>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">Save Preferences</button>
                        </div>
                    </Card>

                    <Card title="Manage Users & Permissions">
                        <p className="text-gray-400 text-sm mb-4">Admin-only: Add, edit, or remove user accounts and their access levels.</p>
                        <div className="flex justify-end mb-4">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">
                                <i className="fas fa-user-plus mr-2"></i> Add New User
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Username</th>
                                        <th scope="col" className="px-6 py-3">Email</th>
                                        <th scope="col" className="px-6 py-3">Role</th>
                                        <th scope="col" className="px-6 py-3">Access Level</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userConfigs.map((user, index) => (
                                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-red-800 text-red-200' : user.role === 'analyst' ? 'bg-yellow-800 text-yellow-200' : 'bg-blue-800 text-blue-200'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{user.accessLevel.join(', ')}</td>
                                            <td className="px-6 py-4">
                                                <button className="text-yellow-500 hover:text-yellow-400 mr-2">Edit</button>
                                                <button className="text-red-500 hover:text-red-400">Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title="Custom Sentiment Lexicon Management">
                        <p className="text-gray-400 text-sm mb-4">Define custom keywords and phrases with their inherent sentiment to fine-tune the AI model.</p>
                        <div className="mb-4">
                            <label htmlFor="customPhrase" className="block text-gray-300 text-sm font-bold mb-2">New Phrase</label>
                            <input type="text" id="customPhrase" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800" placeholder="e.g., 'smooth onboarding'" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="phraseSentiment" className="block text-gray-300 text-sm font-bold mb-2">Assigned Sentiment</label>
                            <select id="phraseSentiment" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-800">
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                                <option value="Neutral">Neutral</option>
                            </select>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">Add Custom Phrase</button>
                        </div>
                    </Card>
                </div>
            )}

            {!isLoading && activeTab === 'audit' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-200 mt-6 mb-4">System Audit Log</h3>

                    <Card title="Recent System Activities">
                        <p className="text-gray-400 text-sm mb-4">Track all user and system actions for compliance and monitoring.</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Timestamp</th>
                                        <th scope="col" className="px-6 py-3">User</th>
                                        <th scope="col" className="px-6 py-3">Action</th>
                                        <th scope="col" className="px-6 py-3">Details</th>
                                        <th scope="col" className="px-6 py-3">Target</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log, index) => (
                                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-6 py-4 text-white">{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className="px-6 py-4">{log.user}</td>
                                            <td className="px-6 py-4">{log.action}</td>
                                            <td className="px-6 py-4 text-gray-500">{log.details}</td>
                                            <td className="px-6 py-4 text-gray-600">{log.targetType} {log.targetId ? `(${log.targetId})` : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}


            {/* Topic Detail Modal */}
            {isTopicDetailModalOpen && selectedTopicDetail && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-auto">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl border border-gray-700 relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
                            onClick={() => setIsTopicDetailModalOpen(false)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        <h3 className="text-3xl font-bold text-white mb-4">{selectedTopicDetail.topicName}</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div><p className="text-gray-400">Sentiment:</p><p className={`text-xl font-semibold ${getSentimentColor(selectedTopicDetail.sentiment)}`}>{selectedTopicDetail.sentiment}</p></div>
                            <div><p className="text-gray-400">Volume:</p><p className="text-xl font-semibold text-white">{formatNumber(selectedTopicDetail.volume)}</p></div>
                            <div><p className="text-gray-400">Trend:</p><p className={`text-xl font-semibold ${getSentimentColor(selectedTopicDetail.trend)}`}>{selectedTopicDetail.trend}</p></div>
                            <div><p className="text-gray-400">Impact Score:</p><p className="text-xl font-semibold text-white">{selectedTopicDetail.impactScore.toFixed(1)}</p></div>
                        </div>
                        <p className="text-gray-300 mb-4">{selectedTopicDetail.description}</p>
                        <div className="mb-6">
                            <p className="text-gray-400 mb-2">Keywords:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedTopicDetail.keywords.map((keyword, idx) => (
                                    <span key={idx} className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full">{keyword}</span>
                                ))}
                            </div>
                        </div>
                        {selectedTopicDetail.relatedTopics && selectedTopicDetail.relatedTopics.length > 0 && (
                            <div className="mb-6">
                                <p className="text-gray-400 mb-2">Related Topics:</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTopicDetail.relatedTopics.map((relTopic, idx) => (
                                        <span key={idx} className="bg-blue-700 text-blue-200 text-sm px-3 py-1 rounded-full">{relTopic}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedTopicDetail.sampleMentions && selectedTopicDetail.sampleMentions.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-xl font-bold text-gray-200 mb-3">Sample Mentions</h4>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                    {selectedTopicDetail.sampleMentions.map((mention, idx) => (
                                        <div key={idx} className="bg-gray-700 p-4 rounded-md border border-gray-600">
                                            <p className="text-sm text-gray-300 mb-2">{mention.text}</p>
                                            <div className="flex items-center text-xs text-gray-400 space-x-3">
                                                <span><i className="fas fa-calendar-alt mr-1"></i> {new Date(mention.timestamp).toLocaleDateString()}</span>
                                                <span><i className="fas fa-globe mr-1"></i> {mention.source.replace('_', ' ')}</span>
                                                <span className={`${getSentimentColor(mention.sentiment)} font-semibold`}><i className="fas fa-comment-dots mr-1"></i> {mention.sentiment}</span>
                                                {mention.userHandle && <span><i className="fas fa-user mr-1"></i> {mention.userHandle}</span>}
                                                {mention.link && <a href={mention.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline"><i className="fas fa-external-link-alt mr-1"></i> Link</a>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end mt-6">
                            <button
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md shadow-md"
                                onClick={() => setIsTopicDetailModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Configuration Modal */}
            {alertConfigModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-auto">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-xl border border-gray-700 relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
                            onClick={() => setAlertConfigModalOpen(false)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        <h3 className="text-3xl font-bold text-white mb-4">Create New Alert</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="alertName" className="block text-gray-300 text-sm font-bold mb-2">Alert Name</label>
                                <input type="text" id="alertName" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-900" placeholder="e.g., Critical Sentiment Drop Alert" />
                            </div>
                            <div>
                                <label htmlFor="alertType" className="block text-gray-300 text-sm font-bold mb-2">Alert Type</label>
                                <select id="alertType" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-900">
                                    <option value="sentiment_drop">Sentiment Drop</option>
                                    <option value="volume_spike">Volume Spike</option>
                                    <option value="keyword_mention">Keyword Mention</option>
                                    <option value="topic_emergence">Topic Emergence</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="alertThreshold" className="block text-gray-300 text-sm font-bold mb-2">Threshold</label>
                                <input type="number" id="alertThreshold" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-900" placeholder="e.g., 0.1 (for sentiment drop), 500 (for volume)" />
                            </div>
                            <div>
                                <label htmlFor="alertTarget" className="block text-gray-300 text-sm font-bold mb-2">Target (Optional)</label>
                                <select id="alertTarget" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-900">
                                    <option value="">Global</option>
                                    {allProducts.map(p => <option key={p} value={p}>{p.replace('_', ' ')} (Product)</option>)}
                                    {detailedTopics.map(t => <option key={t.id} value={t.topicName}>{t.topicName} (Topic)</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="alertRecipients" className="block text-gray-300 text-sm font-bold mb-2">Recipient Emails (comma-separated)</label>
                                <input type="text" id="alertRecipients" className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-900" placeholder="email1@example.com, email2@example.com" />
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="alertActive" className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600" defaultChecked />
                                <label htmlFor="alertActive" className="text-gray-300 text-sm font-bold">Activate Alert</label>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6 space-x-3">
                            <button
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md shadow-md"
                                onClick={() => setAlertConfigModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md"
                            >
                                Create Alert
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SentimentAnalysisView;