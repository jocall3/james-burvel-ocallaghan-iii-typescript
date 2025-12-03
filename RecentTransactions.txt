
// components/RecentTransactions.tsx
import React, { useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import { View } from '../types';
import Card from './Card';

// --- NEW TYPES AND INTERFACES ---

// Expanded Transaction type to include many new features
export interface AugmentedTransaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string; // ISO date string preferred for consistency
    carbonFootprint?: number;
    merchantId?: string;
    location?: { lat: number; lon: number; name?: string; geohash?: string; timezone?: string };
    sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
    attachments?: { type: 'receipt' | 'invoice' | 'note' | 'media' | 'contract'; url: string; preview?: string; sizeKB?: number; uploadedBy?: string; uploadDate?: string }[];
    notes?: string;
    isRecurring?: boolean;
    recurringPaymentId?: string;
    recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    splitParticipants?: { userId: string; amount: number; status: 'pending' | 'completed' | 'declined'; sharePercentage?: number }[];
    flaggedForReview?: boolean; // e.g., by anomaly detection
    ethicalScore?: { environment: number; labor: number; community: number; governance: number; overall: number; breakdown?: { [key: string]: number } };
    aiRecommendation?: string; // e.g., "Consider switching to 'EcoBank' for better rates."
    spendingImpactMetric?: {
        netWorthChange: number;
        budgetCategoryAllocation?: { category: string; spent: number; budget: number; remaining: number; percentage: number };
        financialGoalProgress?: { goalId: string; progressDelta: number; newProgressPercentage: number };
        cashFlowImpact?: number;
        liquidityEffect?: 'high' | 'medium' | 'low';
    };
    loyaltyPointsEarned?: { program: string; points: number; multiplier?: number; status?: 'pending' | 'credited' }[];
    taxImplications?: { isDeductible: boolean; taxCategory?: string; estimatedSaving?: number; requiredDocumentation?: string[] };
    blockchainRef?: string; // For future proofing with distributed ledgers
    quantumSecurityStatus?: 'encrypted' | 'quantum-encrypted' | 'legacy-encrypted' | 'unencrypted' | 'breached';
    dataAuditTrail?: { timestamp: string; action: string; userId: string; details?: string; ipAddress?: string }[];
    regulatoryCompliance?: { status: 'compliant' | 'non-compliant' | 'pending-review'; regulation?: string; details?: string; severity?: 'low' | 'medium' | 'high' };
    realtimeMarketImpact?: { asset: string; priceChange: number; holdingChange?: number; portfolioValueChange?: number }[]; // e.g., if a purchase affects a stock you hold
    hapticFeedbackPattern?: string; // e.g., 'short-buzz', 'long-vibration', 'triple-tap'
    neuroSensoryEnhancement?: { visualEffect: string; auditoryCue: string; intensity?: number }; // For immersive UIs
    semanticTags?: string[]; // e.g., #sustainable #local #investment #digital_good
    linkedAssets?: { assetId: string; type: string; impact: 'positive' | 'negative' | 'neutral'; valueChange?: number }[]; // e.g., links to a stock buy
    carbonOffsetPurchase?: { amount: number; project: string; status: 'pending' | 'completed' | 'failed'; certificateUrl?: string; offsetDate?: string };
    localizedCurrency?: { currencyCode: string; amount: number; exchangeRate: number; baseCurrencyAmount?: number }; // Original amount if converted
    voiceCommandLog?: { command: string; timestamp: string; recognizedIntent?: string; confidence?: number }[];
    userFeedback?: { rating: number; comment: string; timestamp: string; sentiment?: 'positive' | 'negative' }[];
    contextualMetadata?: { device: string; ipAddress: string; browser: string; appVersion: string; biometricAuthUsed?: boolean };
    anomalyType?: 'high_spending' | 'unusual_location' | 'new_merchant' | 'fraud_risk' | 'duplicate_transaction' | 'unusual_time';
    predictedFutureImpact?: { carbon: number; savings: number; budgetStrain: number; financialRiskScore: number };
    merchantRatingByUser?: number; // 1-5 stars
    categorizationConfidence?: number; // 0-1, confidence of AI category
    financialHealthScoreDelta?: number; // How this transaction impacts overall score
    gamificationPointsAwarded?: number;
    blockchainTransactionId?: string; // If it's crypto related
    linkedSmartContract?: { contractId: string; functionCalled: string; status: 'executed' | 'pending' | 'failed' }[];
    privacyEnhancementLevel?: 'default' | 'anonymized' | 'private_compute';
    regulatoryFlagReason?: string;
    geospatialContext?: { weather?: string; localEvent?: string }; // e.g., "sunny", "local festival"
    supplyChainTraceability?: { productId: string; supplierInfo: string; ethicalCertifications: string[] }[]; // For products purchased
    digitalAssetFingerprint?: string; // For digital goods, unique identifier
    quantumResistanceProof?: string; // Cryptographic proof of quantum resistance
    biometricApprovalStatus?: 'approved' | 'pending' | 'rejected';
    crossDimensionalAnalyticsTag?: string; // For hypothetical multi-dimensional data analysis
}

// Global user preferences for personalized features
export interface UserPreferences {
    enableAIInsights: boolean;
    enableGamification: boolean;
    enableCarbonTracking: boolean;
    preferredCurrency: string;
    hapticFeedbackEnabled: boolean;
    neuroSensoryEnabled: boolean;
    privacyLevel: 'low' | 'medium' | 'high' | 'quantum_secure_only';
    defaultViewPreset: string; // e.g., 'Eco-conscious', 'Budget-focused', 'Investment-centric', 'Privacy-Maximized'
    notificationSettings: {
        anomalyAlerts: boolean;
        budgetExceeded: boolean;
        ethicalWarnings: boolean;
        transactionSummary: boolean;
        goalProgress: boolean;
        securityAlerts: boolean;
    };
    linkedAccounts: { type: string; id: string; status: 'active' | 'inactive'; lastSynced: string; integrationVersion?: string }[];
    customCategories: string[];
    dataRetentionPolicy: '7y' | '10y' | 'forever' | 'on_demand_delete';
    voiceCommandEnabled: boolean;
    themePreference: 'dark' | 'light' | 'amoled';
    accessibilityMode: 'default' | 'high_contrast' | 'dyslexia_friendly';
    language: string;
}

// AI Model Interface
export interface AIModelStatus {
    modelId: string;
    version: string;
    lastUpdated: string;
    status: 'training' | 'active' | 'inactive' | 'error' | 'deprecated';
    accuracyScore?: number;
    latencyMs?: number;
    inferenceCount?: number;
    nextScheduledUpdate?: string;
    modelProvider?: string;
}

// Financial Goal Interface
export interface FinancialGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    startDate: string;
    endDate: string;
    category?: string;
    status: 'active' | 'completed' | 'paused' | 'failed' | 'on_hold';
    priority: 'low' | 'medium' | 'high' | 'critical';
    contributingTransactions: string[]; // IDs of transactions contributing to this goal
    autoContributionPercentage?: number;
    alertsEnabled: boolean;
    visualizerType?: 'line' | 'bar' | 'radial';
}

// Merchant Profile Interface
export interface MerchantProfile {
    id: string;
    name: string;
    description: string;
    ethicalRating?: { environment: number; labor: number; community: number; governance: number; overall: number; lastUpdated?: string };
    carbonFootprintAverage?: number; // Avg footprint per transaction at this merchant
    popularCategories?: string[];
    userReviews?: { userId: string; rating: number; comment: string; timestamp: string }[];
    loyaltyPrograms?: { name: string; link: string; userStatus?: 'member' | 'not_member'; pointsBalance?: number }[];
    contactInfo?: { email?: string; phone?: string; website?: string; socialMedia?: { platform: string; url: string }[] };
    geoFence?: { lat: number; lon: number; radiusKm: number; lastChecked?: string }; // For location-based insights
    businessModel?: 'B2C' | 'B2B' | 'D2C';
    blockchainVerified?: boolean;
    supportedPaymentMethods?: string[];
    AI_predicted_churn_rate?: number; // AI for merchant relationships
}

// User Profile for social and gamification
export interface UserProfile {
    id: string;
    username: string;
    avatarUrl: string;
    level: number;
    experiencePoints: number;
    nextLevelXP: number; // XP required for next level
    badges: { id: string; name: string; earnedDate: string; tier: string; description?: string; iconUrl?: string }[];
    financialGoals: FinancialGoal[];
    socialConnections: string[]; // User IDs
    privacySettings: {
        shareAchievements: boolean;
        shareSpendingTrends: boolean;
        allowDataForCommunityInsights: boolean;
    };
    karmaScore?: number; // For positive financial actions (e.g., carbon offsets, charity)
    streaks?: { type: 'budget_adherence' | 'savings' | 'no_red_carbon'; current: number; longest: number };
    customizationSettings?: {
        transactionIconPack: string; // e.g., 'minimalist', 'vibrant', 'fantasy'
        fontFamily: string;
        accentColor: string;
    };
    recentActivities?: { activity: string; timestamp: string; relatedTxId?: string }[];
}

// --- NEW CONTEXT & HOOKS (Simulated as they would interact with a global state) ---

// This would typically come from a larger context, but for this file, we simulate it.
interface ExpandedDataContextType {
    transactions: AugmentedTransaction[];
    userPreferences: UserPreferences;
    aiModelsStatus: AIModelStatus[];
    financialGoals: FinancialGoal[];
    merchantProfiles: { [id: string]: MerchantProfile };
    userProfile: UserProfile;
    updateUserPreference: (key: keyof UserPreferences, value: any) => void;
    addTransaction: (tx: AugmentedTransaction) => void;
    // ... many more actions like `fetchMerchantProfile`, `updateFinancialGoal`, etc.
}

// Simulate use of a more comprehensive context
const useExpandedData = (): ExpandedDataContextType => {
    const context = useContext(DataContext); // This is the original context
    const [localTransactions, setLocalTransactions] = useState<AugmentedTransaction[]>(
        (context?.transactions || []).map(tx => ({
            ...tx,
            // Simulate adding some new fields to existing transactions for demonstration
            notes: 'Initial imported transaction. This is a default note added by the advanced system.',
            sentiment: Math.random() > 0.7 ? 'positive' : Math.random() > 0.4 ? 'neutral' : 'negative',
            ethicalScore: { environment: Math.random() * 5, labor: Math.random() * 5, community: Math.random() * 5, governance: Math.random() * 5, overall: Math.random() * 5 },
            aiRecommendation: Math.random() > 0.85 ? 'Consider optimizing your subscriptions.' : Math.random() > 0.7 ? 'This expense aligns with your sustainability goals.' : undefined,
            isRecurring: Math.random() > 0.8,
            carbonOffsetPurchase: Math.random() > 0.9 ? { amount: Math.random() * 5, project: 'Forest Reforestation', status: 'completed', certificateUrl: '#', offsetDate: new Date().toISOString() } : undefined,
            semanticTags: ['essential', Math.random() > 0.5 ? 'personal' : 'business', Math.random() > 0.7 ? 'digital' : 'physical'],
            blockchainRef: `TX${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            quantumSecurityStatus: Math.random() > 0.8 ? 'quantum-encrypted' : 'encrypted',
            hapticFeedbackPattern: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'short-buzz' : 'long-vibration') : undefined,
            merchantId: Math.random() > 0.5 ? (Math.random() > 0.5 ? 'm1' : 'm2') : undefined,
            flaggedForReview: Math.random() > 0.88,
            anomalyType: Math.random() > 0.95 ? 'fraud_risk' : Math.random() > 0.9 ? 'high_spending' : undefined,
            attachments: Math.random() > 0.7 ? [{ type: 'receipt', url: '#', preview: 'receipt.png' }] : undefined,
            predictedFutureImpact: Math.random() > 0.7 ? { carbon: Math.random() * 20, savings: Math.random() * 100, budgetStrain: Math.random() * 10, financialRiskScore: Math.random() * 5 } : undefined,
            categorizationConfidence: 0.8 + Math.random() * 0.2,
            financialHealthScoreDelta: tx.type === 'income' ? Math.random() * 0.5 + 0.1 : -(Math.random() * 0.5 + 0.1),
            gamificationPointsAwarded: Math.floor(Math.random() * 100),
            neuroSensoryEnhancement: Math.random() > 0.8 ? { visualEffect: 'glow', auditoryCue: Math.random() > 0.5 ? 'chime' : 'click', intensity: Math.floor(Math.random() * 3) + 1 } : undefined,
        }))
    );

    const [userPreferences, setUserPreferences] = useState<UserPreferences>({
        enableAIInsights: true,
        enableGamification: true,
        enableCarbonTracking: true,
        preferredCurrency: 'USD',
        hapticFeedbackEnabled: true,
        neuroSensoryEnabled: false,
        privacyLevel: 'medium',
        defaultViewPreset: 'Eco-conscious',
        notificationSettings: { anomalyAlerts: true, budgetExceeded: true, ethicalWarnings: true, transactionSummary: true, goalProgress: true, securityAlerts: true },
        linkedAccounts: [{ type: 'bank', id: 'bank123', status: 'active', lastSynced: new Date().toISOString() }],
        customCategories: ['Home Maintenance', 'Digital Services'],
        dataRetentionPolicy: '10y',
        voiceCommandEnabled: true,
        themePreference: 'dark',
        accessibilityMode: 'default',
        language: 'en-US',
    });

    const [aiModelsStatus, setAiModelsStatus] = useState<AIModelStatus[]>([
        { modelId: 'tx-categorizer-v3', version: '3.1.2', lastUpdated: '2024-03-10T10:00:00Z', status: 'active', accuracyScore: 0.98, latencyMs: 25, nextScheduledUpdate: '2024-04-10', modelProvider: 'NeuralNetCorp' },
        { modelId: 'anomaly-detector-v2', version: '2.0.5', lastUpdated: '2024-03-05T12:30:00Z', status: 'active', accuracyScore: 0.95, latencyMs: 30, nextScheduledUpdate: '2024-04-05', modelProvider: 'GuardianAI' },
        { modelId: 'carbon-footprint-v1', version: '1.0.1', lastUpdated: '2023-11-20T15:00:00Z', status: 'active', accuracyScore: 0.92, latencyMs: 50, nextScheduledUpdate: '2024-05-01', modelProvider: 'GreenSense' },
        { modelId: 'sentiment-analyzer-v1', version: '1.0.0', lastUpdated: '2024-01-01T08:00:00Z', status: 'active', accuracyScore: 0.88, latencyMs: 40, modelProvider: 'AffectiveAI' },
    ]);

    const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([
        { id: 'g1', name: 'Save for House', targetAmount: 100000, currentAmount: 35000, startDate: '2023-01-01', endDate: '2028-12-31', status: 'active', priority: 'high', contributingTransactions: [], alertsEnabled: true, visualizerType: 'radial', autoContributionPercentage: 10 },
        { id: 'g2', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 8500, startDate: '2023-06-01', endDate: '2024-06-01', status: 'active', priority: 'critical', contributingTransactions: [], alertsEnabled: true, visualizerType: 'bar' },
        { id: 'g3', name: 'Carbon Offset Project', targetAmount: 500, currentAmount: 120, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active', priority: 'medium', contributingTransactions: [], alertsEnabled: true, visualizerType: 'line' },
    ]);

    const [merchantProfiles, setMerchantProfiles] = useState<{ [id: string]: MerchantProfile }>({
        'm1': { id: 'm1', name: 'GreenGrocer', description: 'Sustainable grocery store specializing in organic and local produce.', ethicalRating: { environment: 5, labor: 4, community: 5, governance: 4.5, overall: 4.6, lastUpdated: '2024-02-01' }, carbonFootprintAverage: 0.5, popularCategories: ['Groceries', 'Organic'], loyaltyPrograms: [{ name: 'EcoRewards', link: '#', userStatus: 'member', pointsBalance: 1250 }], contactInfo: { website: 'greengrocer.com' }, blockchainVerified: true },
        'm2': { id: 'm2', name: 'TechMart Electronics', description: 'Large electronics retailer offering a wide range of gadgets and home appliances.', ethicalRating: { environment: 2, labor: 3, community: 3, governance: 3, overall: 2.7, lastUpdated: '2024-01-15' }, carbonFootprintAverage: 1.2, popularCategories: ['Electronics', 'Home Goods'], loyaltyPrograms: [{ name: 'TechPoints', link: '#', userStatus: 'not_member' }], contactInfo: { website: 'techmart.com' } },
        'm3': { id: 'm3', name: 'Global Cafe', description: 'A local coffee shop with a focus on fair trade beans and community events.', ethicalRating: { environment: 4, labor: 5, community: 5, governance: 4, overall: 4.5, lastUpdated: '2024-03-01' }, carbonFootprintAverage: 0.2, popularCategories: ['Dining', 'Coffee'], supportedPaymentMethods: ['Credit Card', 'Crypto'] },
    });

    const [userProfile, setUserProfile] = useState<UserProfile>({
        id: 'user123',
        username: 'fin_guru_X',
        avatarUrl: 'https://avatar.url/user123.jpg',
        level: 42,
        experiencePoints: 123456,
        nextLevelXP: 130000,
        badges: [
            { id: 'b1', name: 'EcoChampion', earnedDate: '2023-10-15', tier: 'gold', description: 'Achieved significant carbon footprint reduction.', iconUrl: 'icon-eco.svg' },
            { id: 'b2', name: 'BudgetMaster', earnedDate: '2024-01-20', tier: 'silver', description: 'Consistently met budget goals for 3 months.', iconUrl: 'icon-budget.svg' },
            { id: 'b3', name: 'AI Apprentice', earnedDate: '2024-03-01', tier: 'bronze', description: 'Used AI insights for 100+ transactions.', iconUrl: 'icon-ai.svg' },
        ],
        financialGoals: financialGoals.map(g => g), // Link existing goals
        socialConnections: ['friend456', 'colleague789'],
        privacySettings: { shareAchievements: true, shareSpendingTrends: false, allowDataForCommunityInsights: true },
        karmaScore: 850,
        streaks: { type: 'budget_adherence', current: 5, longest: 12 },
        customizationSettings: { transactionIconPack: 'vibrant', fontFamily: 'Inter', accentColor: '#8B5CF6' },
        recentActivities: [{ activity: 'Analyzed weekly spending trends.', timestamp: new Date().toISOString() }],
    });

    const updateUserPreference = useCallback((key: keyof UserPreferences, value: any) => {
        setUserPreferences(prev => ({ ...prev, [key]: value }));
    }, []);

    const addTransaction = useCallback((tx: AugmentedTransaction) => {
        setLocalTransactions(prev => [...prev, tx]);
        // Simulate XP gain
        setUserProfile(prev => ({ ...prev, experiencePoints: prev.experiencePoints + (tx.gamificationPointsAwarded || 5) }));
    }, []);

    // Effect to link original context transactions if they update
    useEffect(() => {
        if (context?.transactions) {
            setLocalTransactions(
                context.transactions.map(tx => {
                    const existing = localTransactions.find(ltx => ltx.id === tx.id);
                    return existing ? existing : {
                        ...tx,
                        notes: 'Initial imported transaction. This is a default note added by the advanced system.',
                        sentiment: Math.random() > 0.7 ? 'positive' : Math.random() > 0.4 ? 'neutral' : 'negative',
                        ethicalScore: { environment: Math.random() * 5, labor: Math.random() * 5, community: Math.random() * 5, governance: Math.random() * 5, overall: Math.random() * 5 },
                        aiRecommendation: Math.random() > 0.85 ? 'Consider optimizing your subscriptions.' : Math.random() > 0.7 ? 'This expense aligns with your sustainability goals.' : undefined,
                        isRecurring: Math.random() > 0.8,
                        carbonOffsetPurchase: Math.random() > 0.9 ? { amount: Math.random() * 5, project: 'Forest Reforestation', status: 'completed', certificateUrl: '#', offsetDate: new Date().toISOString() } : undefined,
                        semanticTags: ['essential', Math.random() > 0.5 ? 'personal' : 'business', Math.random() > 0.7 ? 'digital' : 'physical'],
                        blockchainRef: `TX${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                        quantumSecurityStatus: Math.random() > 0.8 ? 'quantum-encrypted' : 'encrypted',
                        hapticFeedbackPattern: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'short-buzz' : 'long-vibration') : undefined,
                        merchantId: Math.random() > 0.5 ? (Math.random() > 0.5 ? 'm1' : 'm2') : undefined,
                        flaggedForReview: Math.random() > 0.88,
                        anomalyType: Math.random() > 0.95 ? 'fraud_risk' : Math.random() > 0.9 ? 'high_spending' : undefined,
                        attachments: Math.random() > 0.7 ? [{ type: 'receipt', url: '#', preview: 'receipt.png' }] : undefined,
                        predictedFutureImpact: Math.random() > 0.7 ? { carbon: Math.random() * 20, savings: Math.random() * 100, budgetStrain: Math.random() * 10, financialRiskScore: Math.random() * 5 } : undefined,
                        categorizationConfidence: 0.8 + Math.random() * 0.2,
                        financialHealthScoreDelta: tx.type === 'income' ? Math.random() * 0.5 + 0.1 : -(Math.random() * 0.5 + 0.1),
                        gamificationPointsAwarded: Math.floor(Math.random() * 100),
                        neuroSensoryEnhancement: Math.random() > 0.8 ? { visualEffect: 'glow', auditoryCue: Math.random() > 0.5 ? 'chime' : 'click', intensity: Math.floor(Math.random() * 3) + 1 } : undefined,
                    };
                })
            );
        }
    }, [context?.transactions]); // eslint-disable-line react-hooks/exhaustive-deps
    // The above eslint-disable is for demonstration purposes within a single file.
    // In a real app, `localTransactions` would be stable or managed differently to avoid unnecessary re-creation.

    return {
        transactions: localTransactions,
        userPreferences,
        aiModelsStatus,
        financialGoals,
        merchantProfiles,
        userProfile,
        updateUserPreference,
        addTransaction,
    };
};

// --- NEW HELPER COMPONENTS ---

// Expanded TransactionIcon component with more categories, animations, and icon packs
export const TransactionIcon: React.FC<{ category: string; size?: string; animate?: boolean; color?: string; iconPack?: string }> = ({ category, size = "h-5 w-5", animate = false, color = "currentColor", iconPack = 'default' }) => {
    // In a real app, iconPack would dynamically load SVG components
    const defaultIcons: { [key: string]: React.ReactElement } = useMemo(() => ({
        'Dining': <svg xmlns="http://www.w3.org/2000/svg" className={`${size} ${animate ? 'animate-pulse' : ''}`} viewBox="0 0 20 20" fill={color}><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /><path d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /><path d="M4 15a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" /></svg>,
        'Shopping': <svg xmlns="http://www.w3.org/2000/svg" className={`${size} ${animate ? 'animate-bounce' : ''}`} viewBox="0 0 20 20" fill={color}><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>,
        'Transport': <svg xmlns="http://www.w3.org/2000/svg" className={`${size} ${animate ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5.5 8a.5.5 0 000 1h9a.5.5 0 000-1h-9z" clipRule="evenodd" /></svg>,
        'Income': <svg xmlns="http://www.w3.org/2000/svg" className={`${size} ${animate ? 'animate-pulse' : ''}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>,
        'Groceries': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.125c.916.212 1.674.61 2.31 1.086.299.23.56.491.79.767l1.428 1.785A3.987 3.987 0 0118 9.875V11a1 1 0 01-1 1h-1.125c-.212.916-.61 1.674-1.086 2.31-.23.299-.491.56-.767.79l-1.785 1.428A3.987 3.987 0 0110.125 18H9a1 1 0 01-1-1v-1.125c-.916-.212-.61-1.674-1.086-2.31-.23-.299-.491-.56-.767-.79L3.428 12.31A3.987 3.987 0 012 10.125V9a1 1 0 011-1h1.125c.212-.916.61-1.674 1.086-2.31.23-.299.491-.56.79-.767L8.31 4.572A3.987 3.987 0 019.875 2H10zm-.125 2H9a1 1 0 00-1 1v1a1 1 0 102 0V5a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
        'Utilities': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v2.055a8.959 8.959 0 013.829 2.197 1 1 0 11-1.422 1.422 6.959 6.959 0 00-3.122-1.583V9a1 1 0 01-2 0V7.091A6.96 6.96 0 005.15 8.514a1 1 0 11-1.422-1.422 8.959 8.959 0 013.829-2.197V2a1 1 0 011.7-.954L10 2.072l.3-.153zM8.423 10.129a1 1 0 01.17 1.09l-.427.854a1.99 1.99 0 00.323 2.176l.79.79a1.99 1.99 0 002.176.323l.854-.427a1 1 0 011.09.17l.218.436a1.99 1.99 0 01-.118 2.083l-.79.79a1.99 1.99 0 01-2.176-.323l-.854.427a1 1 0 01-1.09-.17l-.218-.436a1.99 1.99 0 01.118-2.083l.79-.79a1.99 1.99 0 00-.323-2.176l-.854.427a1 1 0 01-1.09-.17l-.218-.436a1.99 1.99 0 01.118-2.083z" clipRule="evenodd" /></svg>,
        'Healthcare': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v5a1 1 0 11-2 0V8zm0 7a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
        'Entertainment': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>,
        'Education': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
        'Investments': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v5a1 1 0 11-2 0V8zm0 7a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>, // Reusing for simplicity
        'Loan Repayment': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5-8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
        'Refund': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" /></svg>,
        'Travel': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M12 1.586l-4 4A2 2 0 007 7.414V16a2 2 0 002 2h2a2 2 0 002-2V7.414a2 2 0 00-.586-1.414l-4-4zM10 3.414L11.586 5H8.414L10 3.414zM10 7a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
        'Pet Care': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
        'Subscription': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0V8a1 1 0 112 0v6zm-2-2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
        'Charity': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17.555 17.039l-1.921-2.401A4.962 4.962 0 0013 13h-1.217c.228-.48.423-.974.58-1.488l2.21-3.684a1 1 0 00-.862-1.455l-2.037.288a3.96 3.96 0 00-2.316-1.236 3.961 3.961 0 00-2.784.887L6.03 6.953a1 1 0 00-1.405-.224L1.755 9.176A1 1 0 001.077 10.32l2.399 1.921c-.482.228-.976.423-1.489.58L.32 15.714a1 1 0 00.712 1.484l2.037-.288A3.962 3.962 0 007 18h11a1 1 0 00.555-.225zM13 15a1 1 0 10-2 0v-2a1 1 0 102 0v2z" /></svg>,
        'Cryptocurrency': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 9h2V7H5a1 1 0 00-1 1v4a1 1 0 001 1h2v-2H5V9zm6 0h2V7h-2a1 1 0 00-1 1v4a1 1 0 001 1h2v-2h-2V9zm-3 7a1 1 0 100-2H8v2h-2a1 1 0 00-1 1v1a1 1 0 001 1h6a1 1 0 001-1v-1a1 1 0 00-1-1h-2v-2z" clipRule="evenodd" /></svg>,
        'Fine Dining': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm-5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
        'Default': <svg xmlns="http://www.w3.org/2000/svg" className={`${size}`} viewBox="0 0 20 20" fill={color}><path d="M8.433 7.418c.158-.103.346-.103.504 0l.968.636a.5.5 0 00.744-.582l-.46-1.15a.5.5 0 00-.814-.265L9.2 6.5a.5.5 0 00-.01.527l-.736 1.01a.5.5 0 00.744.582l.968-.636zM10 18a8 8 0 100-16 8 8 0 000 16z" /></svg>,
    }), [size, animate, color]);

    // This would be replaced with a system that loads icon packs
    const getIconsForPack = (pack: string) => {
        if (pack === 'vibrant') {
            // Return a different set of icons, maybe with different styles or more color
            // For now, reuse default for demonstration, but imagine unique SVGs
            return { ...defaultIcons, 'Dining': <svg xmlns="http://www.w3.org/2000/svg" className={`${size} text-pink-400`} viewBox="0 0 24 24" fill="currentColor"><path d="M21 13H3c-.6 0-1-.4-1-1s.4-1 1-1h18c.6 0 1 .4 1 1s-.4 1-1 1zm-1-7h-9c-.6 0-1-.4-1-1s.4-1 1-1h9c.6 0 1 .4 1 1s-.4 1-1 1zm-1 12h-9c-.6 0-1-.4-1-1s.4-1 1-1h9c.6 0 1 .4 1 1s-.4 1-1 1z"/></svg> };
        }
        return defaultIcons;
    };

    const icons = getIconsForPack(iconPack);

    const key = useMemo(() => {
        if (category in icons) return category;
        if (['Salary', 'Freelance', 'Bonus', 'Dividend', 'Interest'].includes(category)) return 'Income';
        if (['Subscription Fee', 'Membership', 'Software License'].includes(category)) return 'Subscription';
        if (['Bank Fees', 'ATM Withdrawal'].includes(category)) return 'Default'; // General finance
        if (['Bitcoin', 'Ethereum', 'NFT Purchase'].includes(category)) return 'Cryptocurrency';
        return 'Default';
    }, [category, icons]);

    return icons[key];
};

export const CarbonFootprintBadge: React.FC<{ value: number; showTrend?: boolean }> = ({ value, showTrend = false }) => {
    const color = value > 20 ? 'bg-red-500/20 text-red-300' : value > 10 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300';
    const trendIcon = showTrend && value > 15 ? '⬆️' : showTrend && value < 5 ? '⬇️' : '';
    return <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${color}`}>{value.toFixed(1)}kg COâ‚‚ {trendIcon}</span>;
}

export const EthicalScoreBadge: React.FC<{ score: number; type?: 'overall' | 'environment' | 'labor' | 'community' | 'governance' }> = ({ score, type = 'overall' }) => {
    let color = 'bg-gray-500/20 text-gray-300';
    if (score >= 4) color = 'bg-green-500/20 text-green-300';
    else if (score >= 2.5) color = 'bg-yellow-500/20 text-yellow-300';
    else if (score < 2.5) color = 'bg-red-500/20 text-red-300';
    return <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${color}`}>{type.slice(0, 1).toUpperCase() + type.slice(1)}: {score.toFixed(1)}/5</span>;
};

export const AISentimentBadge: React.FC<{ sentiment: 'positive' | 'neutral' | 'negative' | 'mixed' }> = ({ sentiment }) => {
    const map = {
        positive: { color: 'bg-green-600/20 text-green-200', icon: '😊' },
        neutral: { color: 'bg-yellow-600/20 text-yellow-200', icon: '😐' },
        negative: { color: 'bg-red-600/20 text-red-200', icon: '😞' },
        mixed: { color: 'bg-orange-600/20 text-orange-200', icon: ' ambivalent' },
    };
    const { color, icon } = map[sentiment];
    return <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${color}`}>{icon} {sentiment}</span>;
};

export const AnomalyDetectionBadge: React.FC<{ type: AugmentedTransaction['anomalyType'] }> = ({ type }) => {
    if (!type) return null;
    let text = "Anomaly";
    let color = "bg-red-700/30 text-red-200";
    if (type === 'high_spending') text = 'High Spend';
    if (type === 'unusual_location') text = 'Unusual Loc.';
    if (type === 'new_merchant') text = 'New Merchant';
    if (type === 'fraud_risk') { text = 'FRAUD RISK!'; color = 'bg-red-800/50 text-red-100 animate-pulse'; }
    if (type === 'duplicate_transaction') text = 'Duplicate';
    if (type === 'unusual_time') text = 'Unusual Time';

    return <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${color}`}>{text}</span>;
};

export const AIRecommendationBadge: React.FC<{ recommendation: string }> = ({ recommendation }) => {
    return (
        <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-200 cursor-help"
            title={recommendation}>
            AI Insight 🧠
        </span>
    );
};

export const RecurringTransactionBadge: React.FC<{ isRecurring: boolean; recurringPaymentId?: string; recurrencePattern?: string }> = ({ isRecurring, recurringPaymentId, recurrencePattern }) => {
    if (!isRecurring) return null;
    return (
        <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-purple-600/20 text-purple-200 cursor-pointer"
            title={recurringPaymentId ? `Part of recurring payment: ${recurringPaymentId} (${recurrencePattern || 'N/A'})` : "Recurring Transaction"}>
            🔄 Recurring
        </span>
    );
};

export const FinancialGoalImpact: React.FC<{ impact?: AugmentedTransaction['spendingImpactMetric']['financialGoalProgress'] }> = ({ impact }) => {
    if (!impact) return null;
    const { progressDelta, goalId, newProgressPercentage } = impact;
    const color = progressDelta > 0 ? 'text-green-400' : 'text-orange-400';
    const sign = progressDelta > 0 ? '+' : '';
    return (
        <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full bg-gray-600/20 ${color}`}
            title={`Impacts goal ${goalId || 'N/A'}. New progress: ${newProgressPercentage?.toFixed(1) || 'N/A'}%`}>
            🎯 {sign}{progressDelta.toFixed(2)}% Goal
        </span>
    );
};

export const LoyaltyPointsBadge: React.FC<{ pointsEarned?: AugmentedTransaction['loyaltyPointsEarned'] }> = ({ pointsEarned }) => {
    if (!pointsEarned || pointsEarned.length === 0) return null;
    const totalPoints = pointsEarned.reduce((acc, p) => acc + p.points, 0);
    return (
        <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-indigo-600/20 text-indigo-200"
            title={pointsEarned.map(p => `${p.points} ${p.program} (${p.status || 'pending'})`).join(', ')}>
            ✨ {totalPoints} Pts
        </span>
    );
};

export const TaxImplicationFlag: React.FC<{ taxImplications?: AugmentedTransaction['taxImplications'] }> = ({ taxImplications }) => {
    if (!taxImplications || !taxImplications.isDeductible) return null;
    return (
        <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-teal-600/20 text-teal-200 cursor-help"
            title={`Potentially tax-deductible under ${taxImplications.taxCategory || 'N/A'}. Est. savings: $${taxImplications.estimatedSaving?.toFixed(2) || 'N/A'}. Docs needed: ${taxImplications.requiredDocumentation?.join(', ') || 'None'}`}>
            🧾 Tax Deductible
        </span>
    );
};

export const QuantumSecurityStatusBadge: React.FC<{ status: AugmentedTransaction['quantumSecurityStatus'] }> = ({ status }) => {
    if (!status) return null;
    const map = {
        'quantum-encrypted': { color: 'bg-purple-800/50 text-purple-200', text: 'Quantum Encrypted' },
        'encrypted': { color: 'bg-green-700/30 text-green-300', text: 'Encrypted' },
        'legacy-encrypted': { color: 'bg-yellow-700/30 text-yellow-300', text: 'Legacy Enc.' },
        'unencrypted': { color: 'bg-red-700/30 text-red-300', text: 'Unencrypted!' },
        'breached': { color: 'bg-black/50 text-red-500 animate-pulse', text: 'BREACHED!' },
    };
    const { color, text } = map[status] || map.unencrypted; // Fallback
    return <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${color}`} title={`Data security status: ${text}`}>{text}</span>;
};

export const DataAuditTrailIndicator: React.FC<{ auditTrail?: AugmentedTransaction['dataAuditTrail'] }> = ({ auditTrail }) => {
    if (!auditTrail || auditTrail.length === 0) return null;
    const lastAction = auditTrail[auditTrail.length - 1];
    return (
        <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-gray-600/20 text-gray-400 cursor-help"
            title={`Last audit: ${lastAction.action} by ${lastAction.userId} on ${new Date(lastAction.timestamp).toLocaleDateString()}. IP: ${lastAction.ipAddress || 'N/A'}`}>
            🔒 Audited
        </span>
    );
};

export const CarbonOffsetBadge: React.FC<{ offset?: AugmentedTransaction['carbonOffsetPurchase'] }> = ({ offset }) => {
    if (!offset) return null;
    const color = offset.status === 'completed' ? 'bg-emerald-600/20 text-emerald-200' : 'bg-orange-600/20 text-orange-200';
    return (
        <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${color}`}
            title={`Offsetting ${offset.amount.toFixed(2)} kg CO₂ via ${offset.project} (${offset.status})`}>
            🌱 Offset
        </span>
    );
};

export const TransactionAttachmentsDisplay: React.FC<{ attachments?: AugmentedTransaction['attachments'] }> = ({ attachments }) => {
    if (!attachments || attachments.length === 0) return null;
    const attachmentCount = attachments.length;
    return (
        <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-200 cursor-pointer"
            title={attachments.map(a => `${a.type}: ${a.url} (${a.sizeKB}KB)`).join('\n')}
            onClick={() => console.log('Opening attachments:', attachments)}>
            📎 {attachmentCount}
        </span>
    );
};

export const SemanticTagsDisplay: React.FC<{ tags?: string[] }> = ({ tags }) => {
    if (!tags || tags.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {tags.map((tag, index) => (
                <span key={index} className="text-xs px-1 py-0.5 rounded-md bg-zinc-700/50 text-zinc-300">
                    #{tag}
                </span>
            ))}
        </div>
    );
};

export const HapticFeedbackController: React.FC<{ pattern?: string; enabled: boolean }> = ({ pattern, enabled }) => {
    const triggerHaptic = useCallback((patt: string) => {
        if (enabled && 'vibrate' in navigator) {
            switch (patt) {
                case 'short-buzz': navigator.vibrate(50); break;
                case 'long-vibration': navigator.vibrate(200); break;
                case 'double-buzz': navigator.vibrate([50, 20, 50]); break;
                case 'triple-tap': navigator.vibrate([30, 10, 30, 10, 30]); break;
                default: navigator.vibrate(50);
            }
        }
    }, [enabled]);

    useEffect(() => {
        if (enabled && pattern) {
            triggerHaptic(pattern);
        }
    }, [pattern, enabled, triggerHaptic]);

    return null; // Purely for side effects
};

export const NeuroSensoryVisualizer: React.FC<{ enhancement?: AugmentedTransaction['neuroSensoryEnhancement']; enabled: boolean; type: AugmentedTransaction['type'] }> = ({ enhancement, enabled, type }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (enabled && enhancement && containerRef.current) {
            const element = containerRef.current;
            const intensityFactor = enhancement.intensity || 1; // Default intensity

            if (enhancement.visualEffect === 'glow') {
                const glowColor = type === 'income' ? 'rgba(134, 239, 172, 0.7)' : 'rgba(248, 113, 113, 0.7)'; // Green or Red
                element.style.boxShadow = `0 0 ${5 * intensityFactor}px ${2 * intensityFactor}px ${glowColor}`;
                element.style.transition = 'box-shadow 0.3s ease-in-out';
            } else if (enhancement.visualEffect === 'pulse') {
                element.style.animation = `pulse-effect ${1.5 / intensityFactor}s infinite alternate`;
                // Add keyframes via a style tag or global CSS for 'pulse-effect'
            }

            if (enhancement.auditoryCue && 'AudioContext' in window) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                const audioCtx = new AudioContext();
                const oscillator = audioCtx.createOscillator();
                oscillator.type = 'sine';
                const frequency = type === 'income' ? 880 + (intensityFactor - 1) * 100 : 440 - (intensityFactor - 1) * 50;
                oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
                oscillator.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.1 * intensityFactor); // Duration scales with intensity
            }
        } else if (containerRef.current) {
            containerRef.current.style.boxShadow = '';
            containerRef.current.style.animation = '';
        }
    }, [enhancement, enabled, type]);

    return <div ref={containerRef} className="absolute inset-0 pointer-events-none rounded-xl"></div>;
};

export const BiometricApprovalStatus: React.FC<{ status?: AugmentedTransaction['biometricApprovalStatus'] }> = ({ status }) => {
    if (!status) return null;
    const map = {
        'approved': { color: 'bg-green-600/20 text-green-200', icon: '✅' },
        'pending': { color: 'bg-yellow-600/20 text-yellow-200 animate-pulse', icon: '⏳' },
        'rejected': { color: 'bg-red-600/20 text-red-200', icon: '❌' },
    };
    const { color, icon } = map[status];
    return <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${color}`}>{icon} Bio {status}</span>;
};

export const FinancialHealthScoreImpact: React.FC<{ delta?: number }> = ({ delta }) => {
    if (delta === undefined) return null;
    const color = delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-gray-400';
    const sign = delta > 0 ? '+' : '';
    return (
        <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full bg-gray-600/20 ${color}`}
            title={`Impact on Financial Health Score`}>
            ❤️ {sign}{delta.toFixed(2)} FHS
        </span>
    );
};

export const GamificationPointsDisplay: React.FC<{ points?: number }> = ({ points }) => {
    if (!points) return null;
    return (
        <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-amber-600/20 text-amber-200"
            title={`Awarded for this transaction`}>
            🌟 {points} XP
        </span>
    );
};

export const PredictiveImpactForecast: React.FC<{ impact?: AugmentedTransaction['predictedFutureImpact'] }> = ({ impact }) => {
    if (!impact) return null;
    return (
        <div className="flex flex-wrap gap-1 mt-1 justify-end">
            <span className="text-xs font-mono px-1 py-0.5 rounded-md bg-gray-700/50 text-gray-400" title="Predicted Carbon Footprint">C: {impact.carbon.toFixed(1)}kg</span>
            <span className="text-xs font-mono px-1 py-0.5 rounded-md bg-gray-700/50 text-gray-400" title="Predicted Savings Impact">S: ${impact.savings.toFixed(2)}</span>
            <span className="text-xs font-mono px-1 py-0.5 rounded-md bg-gray-700/50 text-gray-400" title="Predicted Budget Strain">B: {impact.budgetStrain.toFixed(1)}%</span>
            <span className="text-xs font-mono px-1 py-0.5 rounded-md bg-gray-700/50 text-gray-400" title="Predicted Financial Risk Score">R: {impact.financialRiskScore.toFixed(1)}</span>
        </div>
    );
};

// --- ADVANCED TRANSACTION ITEM ---

export const AdvancedTransactionItem: React.FC<{ tx: AugmentedTransaction; userPreferences: UserPreferences }> = ({ tx, userPreferences }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { merchantProfiles } = useExpandedData(); // Access merchant profiles

    const merchant = tx.merchantId ? merchantProfiles[tx.merchantId] : undefined;
    const merchantName = merchant?.name || 'Unknown Merchant';
    const transactionRef = useRef<HTMLLIElement>(null);

    const handleExpandToggle = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // Prevent expanding if clicking on a specific actionable element within the transaction.
        if (target.closest('button') || target.closest('.actionable-badge') || target.closest('.no-expand-toggle')) {
            return;
        }
        setIsExpanded(!isExpanded);
    };

    return (
        <li ref={transactionRef} key={tx.id} className="flex flex-col border-b border-gray-700/50 py-3 last:border-b-0 cursor-pointer relative rounded-xl hover:bg-gray-800/20 transition-all duration-200"
            onClick={handleExpandToggle}
            style={{ fontFamily: userPreferences.customizationSettings?.fontFamily || 'Inter' }}
        >
             {userPreferences.neuroSensoryEnabled && tx.neuroSensoryEnhancement &&
                <NeuroSensoryVisualizer enhancement={tx.neuroSensoryEnhancement} enabled={userPreferences.neuroSensoryEnabled} type={tx.type} />
            }
            {userPreferences.hapticFeedbackEnabled && tx.hapticFeedbackPattern &&
                <HapticFeedbackController pattern={tx.hapticFeedbackPattern} enabled={userPreferences.hapticFeedbackEnabled} />
            }
            <div className="flex items-center justify-between z-10"> {/* Ensure content is above sensory effects */}
                <div className="flex items-center gap-3 flex-grow min-w-0">
                    <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <TransactionIcon category={tx.category} animate={tx.flaggedForReview || false} iconPack={userPreferences.customizationSettings?.transactionIconPack} />
                    </div>
                    <div className="flex-grow min-w-0">
                        <p className="font-semibold text-white truncate">{tx.description}</p>
                        <p className="text-sm text-gray-400 flex items-center gap-2 flex-wrap truncate">
                            {new Date(tx.date).toLocaleDateString(userPreferences.language)} - <span className="text-gray-300">{merchantName}</span>
                            {tx.location?.name && <span className="ml-1 text-blue-400/70 text-xs truncate">({tx.location.name})</span>}
                            {tx.geospatialContext?.weather && <span className="ml-1 text-sky-400/70 text-xs">☁️ {tx.geospatialContext.weather}</span>}
                            {tx.categorizationConfidence && tx.categorizationConfidence < 0.9 && (
                                <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-orange-600/20 text-orange-200 cursor-help no-expand-toggle" title={`AI Confidence: ${(tx.categorizationConfidence * 100).toFixed(0)}%. Review category.`}>🤔 AI Low Conf.</span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end min-w-[140px] flex-shrink-0">
                    <p className={`font-mono font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                        {tx.localizedCurrency && ` (${tx.localizedCurrency.currencyCode} ${tx.localizedCurrency.amount.toFixed(2)})`}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1 justify-end">
                        {userPreferences.enableCarbonTracking && tx.carbonFootprint && <CarbonFootprintBadge value={tx.carbonFootprint} showTrend={true} />}
                        {userPreferences.enableAIInsights && tx.sentiment && <AISentimentBadge sentiment={tx.sentiment} />}
                        {userPreferences.enableAIInsights && tx.flaggedForReview && tx.anomalyType && <AnomalyDetectionBadge type={tx.anomalyType} />}
                        {userPreferences.enableAIInsights && tx.aiRecommendation && <AIRecommendationBadge recommendation={tx.aiRecommendation} />}
                        {tx.isRecurring && <RecurringTransactionBadge isRecurring={tx.isRecurring} recurringPaymentId={tx.recurringPaymentId} recurrencePattern={tx.recurrencePattern} />}
                        {tx.ethicalScore && userPreferences.defaultViewPreset === 'Eco-conscious' && <EthicalScoreBadge score={tx.ethicalScore.overall} />}
                        {tx.spendingImpactMetric?.financialGoalProgress && <FinancialGoalImpact impact={tx.spendingImpactMetric.financialGoalProgress} />}
                        {tx.loyaltyPointsEarned && <LoyaltyPointsBadge pointsEarned={tx.loyaltyPointsEarned} />}
                        {tx.taxImplications?.isDeductible && <TaxImplicationFlag taxImplications={tx.taxImplications} />}
                        {tx.quantumSecurityStatus && <QuantumSecurityStatusBadge status={tx.quantumSecurityStatus} />}
                        {tx.dataAuditTrail && <DataAuditTrailIndicator auditTrail={tx.dataAuditTrail} />}
                        {tx.carbonOffsetPurchase && <CarbonOffsetBadge offset={tx.carbonOffsetPurchase} />}
                        {tx.attachments && <TransactionAttachmentsDisplay attachments={tx.attachments} />}
                        {tx.biometricApprovalStatus && <BiometricApprovalStatus status={tx.biometricApprovalStatus} />}
                        {userPreferences.enableGamification && tx.gamificationPointsAwarded && <GamificationPointsDisplay points={tx.gamificationPointsAwarded} />}
                        {tx.financialHealthScoreDelta !== undefined && <FinancialHealthScoreImpact delta={tx.financialHealthScoreDelta} />}
                    </div>
                    {tx.predictedFutureImpact && userPreferences.enableAIInsights && <PredictiveImpactForecast impact={tx.predictedFutureImpact} />}
                </div>
            </div>

            {isExpanded && (
                <div className="pl-12 pt-2 text-sm text-gray-300 z-10">
                    {tx.notes && <p className="mt-1"><span className="font-bold text-gray-200">Notes:</span> {tx.notes}</p>}
                    {tx.description && <p className="mt-1"><span className="font-bold text-gray-200">Full Description:</span> {tx.description}</p>}
                    {merchant && (
                        <div className="mt-2 p-2 bg-gray-800/50 rounded-md">
                            <p className="font-bold text-gray-200">Merchant Profile: {merchant.name} {merchant.blockchainVerified && <span className="text-blue-400 text-xs ml-1">✓ Blockchain Verified</span>}</p>
                            <p className="text-gray-400 text-xs italic">{merchant.description}</p>
                            {merchant.ethicalRating && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    <EthicalScoreBadge score={merchant.ethicalRating.environment} type="environment" />
                                    <EthicalScoreBadge score={merchant.ethicalRating.labor} type="labor" />
                                    <EthicalScoreBadge score={merchant.ethicalRating.community} type="community" />
                                    <EthicalScoreBadge score={merchant.ethicalRating.governance} type="governance" />
                                    <EthicalScoreBadge score={merchant.ethicalRating.overall} type="overall" />
                                </div>
                            )}
                            {merchant.loyaltyPrograms && merchant.loyaltyPrograms.length > 0 && (
                                <p className="text-gray-400 mt-1">Loyalty Programs: {merchant.loyaltyPrograms.map(p => `${p.name} (${p.userStatus === 'member' ? `${p.pointsBalance || 0} pts` : 'not member'})`).join(', ')}</p>
                            )}
                             {merchant.contactInfo?.website && <p className="text-gray-400 mt-1">Website: <a href={merchant.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{merchant.contactInfo.website}</a></p>}
                        </div>
                    )}
                    {tx.semanticTags && <SemanticTagsDisplay tags={tx.semanticTags} />}

                    <div className="mt-3 flex flex-wrap gap-2">
                        <button className="px-3 py-1 text-xs bg-blue-700/50 hover:bg-blue-600/50 rounded-md transition actionable-badge">
                            Edit Transaction
                        </button>
                        {tx.flaggedForReview && (
                            <button className="px-3 py-1 text-xs bg-orange-700/50 hover:bg-orange-600/50 rounded-md transition actionable-badge">
                                Review Anomaly
                            </button>
                        )}
                        {tx.isRecurring && (
                            <button className="px-3 py-1 text-xs bg-purple-700/50 hover:bg-purple-600/50 rounded-md transition actionable-badge">
                                Manage Recurring
                            </button>
                        )}
                        {tx.splitParticipants && tx.splitParticipants.length > 0 && (
                            <button className="px-3 py-1 text-xs bg-indigo-700/50 hover:bg-indigo-600/50 rounded-md transition actionable-badge">
                                View Split ({tx.splitParticipants.filter(p => p.status === 'pending').length} pending)
                            </button>
                        )}
                        {tx.blockchainRef && (
                             <button className="px-3 py-1 text-xs bg-sky-700/50 hover:bg-sky-600/50 rounded-md transition actionable-badge"
                                onClick={() => alert(`Opening blockchain explorer for ${tx.blockchainRef}`)}>
                                View Blockchain
                            </button>
                        )}
                        {tx.realtimeMarketImpact && tx.realtimeMarketImpact.length > 0 && (
                             <button className="px-3 py-1 text-xs bg-lime-700/50 hover:bg-lime-600/50 rounded-md transition actionable-badge"
                                onClick={() => alert(`Showing market impact for: ${tx.realtimeMarketImpact.map(i => i.asset).join(', ')}`)}>
                                Market Impact
                            </button>
                        )}
                        {tx.linkedSmartContract && tx.linkedSmartContract.length > 0 && (
                            <button className="px-3 py-1 text-xs bg-cyan-700/50 hover:bg-cyan-600/50 rounded-md transition actionable-badge">
                                Smart Contract Details
                            </button>
                        )}
                        <button className="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-600/50 rounded-md transition actionable-badge">
                            Dispute Transaction
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
};

// --- MAIN COMPONENT ---

export const RecentTransactions: React.FC<{ setActiveView: (view: View) => void }> = ({ setActiveView }) => {
    const { transactions, userPreferences, aiModelsStatus, financialGoals, userProfile, updateUserPreference } = useExpandedData();

    // Memoized and filtered transactions
    const displayedTransactions = useMemo(() => {
        // Implement advanced filtering, sorting, and search based on userPreferences or external inputs
        let filtered = transactions;

        // Example: Filter by privacy level
        if (userPreferences.privacyLevel === 'quantum_secure_only') {
            filtered = filtered.filter(tx => tx.quantumSecurityStatus === 'quantum-encrypted');
        } else if (userPreferences.privacyLevel === 'high') {
             filtered = filtered.filter(tx => tx.quantumSecurityStatus !== 'unencrypted');
        }

        // Example: Filter by view preset
        if (userPreferences.defaultViewPreset === 'Eco-conscious') {
            filtered = filtered.sort((a, b) => (b.carbonFootprint || 0) - (a.carbonFootprint || 0));
        } else if (userPreferences.defaultViewPreset === 'Budget-focused') {
            // Sort by impact on budget or highlight transactions that push limits
        }

        // Add more complex filtering/sorting logic here
        return filtered.slice(0, 10); // Display top 10 for expansion demo
    }, [transactions, userPreferences.privacyLevel, userPreferences.defaultViewPreset]);


    // Simulation of AI insights processing
    const aiInsightSummary = useMemo(() => {
        if (!userPreferences.enableAIInsights) return null;
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const highCarbonTx = transactions.filter(t => (t.carbonFootprint || 0) > 15);
        const recurringCount = transactions.filter(t => t.isRecurring).length;
        const potentialFraud = transactions.filter(t => t.anomalyType === 'fraud_risk').length;

        let advice = [];
        if (highCarbonTx.length > 0) advice.push(`You have ${highCarbonTx.length} high-carbon transactions recently. Consider alternatives for better planetary impact.`);
        if (recurringCount > 2) advice.push(`You have ${recurringCount} recurring payments. Review them for potential subscription savings or optimization.`);
        if (totalExpense > 5000) advice.push(`Your spending is high this period. Check your budget allocation and potential overspending triggers!`);
        if (potentialFraud > 0) advice.push(`⚠️ Detected ${potentialFraud} potential fraud risk transactions. Review them immediately.`);
        if (userProfile.experiencePoints >= userProfile.nextLevelXP) advice.push(`Congratulations! You've reached a new Fin-Guru level!`);

        return advice.length > 0 ? advice.join(' | ') : 'No immediate AI insights. Your financial universe is stable.';
    }, [transactions, userPreferences.enableAIInsights, userProfile.experiencePoints, userProfile.nextLevelXP]);


    const cardHeaderActions = useMemo(() => {
        const actions = [
            { id: 'view-all', label: 'View All', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>, onClick: () => setActiveView(View.Transactions) },
            { id: 'add-tx', label: 'Add New', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>, onClick: () => console.log('Open Add Transaction Modal') },
            { id: 'filter', label: 'Filter', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>, onClick: () => console.log('Open Filter Modal') },
            { id: 'search', label: 'Search', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, onClick: () => console.log('Open Search Bar') },
        ];
        if (userPreferences.enableGamification) {
            actions.push({ id: 'leaderboard', label: 'Leaderboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.329 1.176l1.519 4.674c.3.921-.755 1.688-1.539 1.175l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.513-1.838-.254-1.539-1.175l1.519-4.674a1 1 0 00-.329-1.176l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" /></svg>, onClick: () => setActiveView(View.Leaderboard || View.Transactions) }); // Assuming a Leaderboard view
        }
        actions.push({ id: 'voice-command', label: 'Voice', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v3a3 3 0 01-3 3z" /></svg>, onClick: () => console.log('Activate Voice Command') });
        return actions;
    }, [setActiveView, userPreferences.enableGamification]);


    if (!transactions) return <div>Loading the Financial Universe...</div>;

    return (
        <Card title="Recent Transactions: A Multiverse Overview" headerActions={cardHeaderActions}>
            {/* AI Insights & Alerts */}
            {userPreferences.enableAIInsights && aiInsightSummary && (
                <div className="mb-4 p-3 bg-indigo-900/40 rounded-lg text-indigo-200 text-sm flex items-start gap-2 border border-indigo-700/50"
                     style={{boxShadow: userPreferences.defaultViewPreset === 'AI-driven' ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M12 21v-1M5.343 17.343l-.707.707m12.728 0l-.707-.707M6.002 10C10.15 10 13 7 13 4c0 3 2.849 6 7 6H6.002zm9.998 0H19c0 3-2.849 6-7 6a8.941 8.941 0 01-2.314-.322M4.657 17.343A8.986 8.986 0 0112 20c4.15 0 7-3 7-6H5.002c-.067 0-.131.004-.196.012l-2.047 2.047a.5.5 0 00.707.707L6.002 10z" /></svg>
                    <p className="flex-grow">{aiInsightSummary}</p>
                    <button className="text-indigo-300 hover:text-indigo-100 text-xs ml-auto shrink-0 no-expand-toggle" onClick={() => console.log('Dismiss AI insight')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}

            {/* Dynamic View Preset Information */}
            {userPreferences.defaultViewPreset === 'Eco-conscious' && (
                <div className="mb-4 p-3 bg-emerald-900/40 rounded-lg text-emerald-200 text-sm flex items-center gap-2 border border-emerald-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>
                    <p>Eco-Conscious Mode Active: Prioritizing environmental impact in your feed.</p>
                </div>
            )}
            {userPreferences.defaultViewPreset === 'Privacy-Maximized' && (
                <div className="mb-4 p-3 bg-zinc-900/40 rounded-lg text-zinc-300 text-sm flex items-center gap-2 border border-zinc-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2h2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    <p>Privacy-Maximized Mode Active: Only displaying quantum-encrypted transactions.</p>
                    <button className="text-zinc-400 hover:text-zinc-100 text-xs ml-auto no-expand-toggle" onClick={() => updateUserPreference('privacyLevel', 'high')}>Adjust</button>
                </div>
            )}

            <ul className="space-y-3 divide-y divide-gray-700/50">
                {displayedTransactions.length === 0 ? (
                    <li className="text-gray-400 text-center py-4">No recent transactions to display in this universe based on current filters.</li>
                ) : (
                    displayedTransactions.map(tx => (
                        <AdvancedTransactionItem key={tx.id} tx={tx} userPreferences={userPreferences} />
                    ))
                )}
            </ul>
            {userPreferences.enableGamification && userProfile && (
                <div className="mt-6 p-4 bg-zinc-800/60 rounded-lg text-zinc-300 border border-zinc-700/50">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        Your Fin-Universe Journey: Level {userProfile.level}
                        <span className="text-sm font-normal text-zinc-400">({userProfile.karmaScore || 0} Karma)</span>
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-full bg-gray-700 rounded-full h-2.5 relative">
                            <div className="bg-lime-500 h-2.5 rounded-full" style={{ width: `${(userProfile.experiencePoints / userProfile.nextLevelXP) * 100}%` }}></div>
                            <span className="absolute right-0 -top-5 text-xs text-zinc-400">{userProfile.experiencePoints} / {userProfile.nextLevelXP} XP</span>
                        </div>
                    </div>
                    {userProfile.streaks && (
                        <p className="text-sm text-zinc-400 mt-2">
                            🔥 {userProfile.streaks.type === 'budget_adherence' ? 'Budget Adherence' : userProfile.streaks.type === 'savings' ? 'Savings' : 'Carbon Neutral'} Streak: {userProfile.streaks.current} (Longest: {userProfile.streaks.longest})
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {userProfile.badges.map(badge => (
                            <span key={badge.id} className={`px-2 py-1 text-xs rounded-full font-semibold ${badge.tier === 'gold' ? 'bg-amber-500/30 text-amber-200' : badge.tier === 'silver' ? 'bg-slate-400/30 text-slate-200' : 'bg-zinc-600/30 text-zinc-300'}`}
                                title={badge.description || badge.name}>
                                {badge.iconUrl && <img src={badge.iconUrl} alt={badge.name} className="inline h-3 w-3 mr-1" />}
                                {badge.name}
                            </span>
                        ))}
                    </div>
                    {userProfile.financialGoals.length > 0 && (
                        <div className="mt-3">
                            <p className="font-semibold text-sm mb-1 text-gray-200">Active Goals:</p>
                            <ul className="text-xs space-y-1">
                                {userProfile.financialGoals.map(goal => (
                                    <li key={goal.id} className="flex items-center justify-between bg-zinc-700/30 p-2 rounded-md">
                                        <span>{goal.name}: ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}</span>
                                        <span className={`${goal.status === 'completed' ? 'text-green-400' : goal.priority === 'critical' ? 'text-red-400' : 'text-blue-400'}`}>
                                            {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}% ({goal.status})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {aiModelsStatus.length > 0 && (
                <div className="mt-6 p-4 bg-gray-900/40 rounded-lg text-gray-400 text-xs border border-gray-700/50">
                    <h3 className="font-semibold text-gray-300 mb-2">AI Engine Status: Core Intelligences</h3>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {aiModelsStatus.map(model => (
                            <li key={model.modelId} className="flex items-center gap-1 w-full md:w-1/2 lg:w-1/3">
                                <span className={`w-2 h-2 rounded-full ${model.status === 'active' ? 'bg-green-500' : model.status === 'training' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                                <span>{model.modelId} <span className="text-gray-500 italic">v{model.version}</span> ({model.status})</span>
                                {model.accuracyScore && <span className="text-gray-500">Acc: {(model.accuracyScore * 100).toFixed(1)}%</span>}
                                {model.latencyMs && <span className="text-gray-500">Lat: {model.latencyMs}ms</span>}
                                {model.modelProvider && <span className="text-gray-500 hidden sm:inline">Provider: {model.modelProvider}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
             {userPreferences.linkedAccounts.length > 0 && (
                <div className="mt-6 p-4 bg-gray-900/40 rounded-lg text-gray-400 text-xs border border-gray-700/50">
                    <h3 className="font-semibold text-gray-300 mb-2">Linked Financial Ecosystems:</h3>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {userPreferences.linkedAccounts.map(account => (
                            <li key={account.id} className="flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${account.status === 'active' ? 'bg-blue-500' : 'bg-orange-500'}`}></span>
                                <span>{account.type.charAt(0).toUpperCase() + account.type.slice(1)} ({account.status})</span>
                                <span className="text-gray-500 text-xs">Last Sync: {new Date(account.lastSynced).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
};

export default RecentTransactions;
