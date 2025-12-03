// components/MarketplaceView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now "Agora AI," a fully-featured, AI-curated marketplace. It generates
// personalized product recommendations using Gemini based on user transaction history.
// It has evolved over ten years into an expansive universe, incorporating advanced
// AI, dynamic personalization, community features, virtual experiences, and
// predictive analytics, becoming the world's largest and most intelligent marketplace.

import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { MarketplaceProduct, View, Transaction } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// ================================================================================================
// EXPANDED DATA MODELS & TYPES
// ================================================================================================

// Re-defining MarketplaceProduct with extensive features
export interface ProductSpecification {
    key: string;
    value: string;
}

export interface CommunityReview {
    id: string;
    userId: string;
    username: string;
    rating: number; // 1-5 stars
    title: string;
    comment: string;
    timestamp: string;
    upvotes: number;
    downvotes: number;
    aiSentimentScore: number; // AI-analyzed sentiment, -1 to 1
    aiGeneratedSummary?: string; // AI-generated summary of reviews
}

export interface SellerProfile {
    id: string;
    name: string;
    reputationScore: number; // AI-driven reputation score
    productsCount: number;
    joinedDate: string;
    aiTrustFactor: number; // AI-assessed trust factor
    contactEmail: string;
    storefrontUrl: string; // Link to seller's personalized storefront
}

export interface VirtualExperience {
    type: '3D_MODEL' | 'AR_PREVIEW' | 'VR_DEMO' | 'INTERACTIVE_SIMULATION';
    url: string; // Link to the virtual experience asset
    description: string;
    platformCompatibility: string[]; // e.g., ['Web', 'iOS', 'Android', 'Meta Quest']
}

export interface DynamicPricingData {
    currentPrice: number;
    historicalPrices: { date: string; price: number }[];
    demandLevel: 'low' | 'medium' | 'high' | 'surge'; // AI-analyzed demand
    pricePrediction7Days: { date: string; predictedPrice: number }[]; // AI price forecast
    competitorAnalysis: { competitor: string; price: number; timestamp: string }[]; // AI competitor analysis
}

export interface SubscriptionOption {
    id: string;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'annually' | 'quarterly';
    features: string[];
    aiValueProposition: string; // AI-generated benefit summary
}

export interface ExpandedMarketplaceProduct extends MarketplaceProduct {
    descriptionHtml: string;
    longDescription?: string; // AI-generated detailed description
    specifications: ProductSpecification[];
    ratings: { average: number; count: number; };
    reviews: CommunityReview[];
    sellerInfo: SellerProfile;
    relatedProducts: { id: string; name: string; imageUrl: string }[]; // AI-curated related products
    compatibilityInfo: string[]; // e.g., "Compatible with macOS, Windows 11, iOS 17"
    sustainabilityScore: number; // 0-100, AI-assessed environmental impact
    aiGeneratedTag: string[]; // AI-driven semantic tags for advanced filtering
    virtualExperience?: VirtualExperience;
    blockchainTokenId?: string; // For digital assets or verified ownership
    dynamicPricing?: DynamicPricingData;
    subscriptionOptions?: SubscriptionOption[]; // For services or subscription products
    discoveryRank: number; // AI-driven ranking for personalized discovery
    audienceTarget: string[]; // AI identifies target audience
    lifecycleStage: 'new' | 'trending' | 'established' | 'legacy'; // AI-determined product lifecycle
    realtimeStock: number; // Real-time inventory
    shippingEstimates: { method: string; cost: number; days: number }[];
    returnPolicy: string;
    warrantyInfo: string;
    aiPrognosis: string; // AI's long-term outlook on product value/relevance
}

export interface UserPreferenceProfile {
    id: string;
    userId: string;
    preferredCategories: string[];
    dislikedKeywords: string[];
    budgetRange: { min: number; max: number };
    notificationSettings: {
        priceDrops: boolean;
        newArrivals: boolean;
        personalizedAlerts: boolean;
    };
    aiPersonaTags: string[]; // AI-generated user persona tags (e.g., 'tech-enthusiast', 'eco-conscious parent')
    lastActivity: string;
}

export interface PersonalizedStorefrontConfig {
    id: string;
    userId: string;
    theme: string; // e.g., 'dark-elegant', 'minimalist-bright'
    layout: 'grid-default' | 'fluid-pinterest' | 'carousel-heavy';
    heroSectionContent: {
        title: string;
        subtitle: string;
        imageUrl: string;
        callToAction: { text: string; link: string };
        aiJustification: string;
    };
    featuredCollections: { id: string; name: string; productIds: string[]; aiReason: string }[];
    aiCuratedBanners: { imageUrl: string; link: string; type: 'promotional' | 'informational' | 'community' }[];
}

export interface AIRecommendationEngineSettings {
    id: string;
    userId: string;
    recommendationIntensity: 'low' | 'medium' | 'high' | 'hyper-personalized';
    diversityPreference: 'exploratory' | 'focused'; // Exploratory seeks novelty, focused refines existing interests
    privacyLevel: 'standard' | 'enhanced' | 'maximum'; // Controls data usage for recommendations
    feedbackProvided: { productId: string; liked: boolean; timestamp: string }[];
}

export interface AIDataInsight {
    id: string;
    type: 'market_trend' | 'personal_spending_pattern' | 'product_prognosis' | 'community_sentiment';
    title: string;
    summary: string;
    details: string;
    visualizationUrl?: string; // Link to an AI-generated chart/graph
    recommendation: string; // AI-driven action or suggestion
    timestamp: string;
    severity?: 'low' | 'medium' | 'high'; // For alerts or critical insights
}

export interface DynamicCategory {
    id: string;
    name: string;
    description: string;
    productCount: number;
    trendingScore: number; // AI-calculated trending score
    imageUrl: string;
    aiGeneratedKeywords: string[];
}

// ================================================================================================
// AI UTILITIES & SERVICES (SIMULATED)
// These functions simulate complex AI backend interactions.
// ================================================================================================

// Helper function to simulate network delay
const simulateNetworkDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export class AgoraAIService {
    private ai: GoogleGenAI;
    private userId: string; // For personalized AI calls

    constructor(apiKey: string, userId: string = 'guest_user') {
        this.ai = new GoogleGenAI({ apiKey });
        this.userId = userId;
    }

    /**
     * Generates advanced product recommendations considering various user data points.
     * @param userTransactions - User's transaction history.
     * @param userPreferences - User's detailed preference profile.
     * @param engineSettings - AI recommendation engine settings.
     * @returns Promise resolving to an array of ExpandedMarketplaceProduct.
     */
    public async generateAdvancedProductRecommendations(
        userTransactions: Transaction[],
        userPreferences: UserPreferenceProfile,
        engineSettings: AIRecommendationEngineSettings
    ): Promise<ExpandedMarketplaceProduct[]> {
        await simulateNetworkDelay(2000); // Simulate AI processing time

        const transactionSummary = userTransactions.slice(0, 10).map(t => t.description).join(', ');
        const preferenceSummary = `Categories: ${userPreferences.preferredCategories.join(', ')}. Disliked: ${userPreferences.dislikedKeywords.join(', ')}. Budget: $${userPreferences.budgetRange.min}-${userPreferences.budgetRange.max}. Persona: ${userPreferences.aiPersonaTags.join(', ')}.`;
        const prompt = `As Plato AI, a hyper-intelligent curator for Agora, generate 7 diverse, compelling, futuristic, and highly personalized product recommendations. Consider the user's recent purchases (${transactionSummary}), their detailed preferences (${preferenceSummary}), and an engine setting for ${engineSettings.recommendationIntensity} intensity and ${engineSettings.diversityPreference} diversity. Provide a short, one-sentence justification (Plato's Insight) and a longer, detailed AI-generated description. Include mock data for specifications, ratings, reviews (with AI sentiment), seller info, related products, compatibility, sustainability, AI tags, and potential virtual experiences. Ensure dynamic pricing data, subscription options if applicable, and an AI prognosis are included.`;

        const productSchema = {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
                category: { type: Type.STRING },
                imageUrl: { type: Type.STRING },
                aiJustification: { type: Type.STRING },
                descriptionHtml: { type: Type.STRING },
                longDescription: { type: Type.STRING },
                specifications: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { key: { type: Type.STRING }, value: { type: Type.STRING } }
                    }
                },
                ratings: {
                    type: Type.OBJECT,
                    properties: { average: { type: Type.NUMBER }, count: { type: Type.NUMBER } }
                },
                reviews: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING }, userId: { type: Type.STRING }, username: { type: Type.STRING },
                            rating: { type: Type.NUMBER }, title: { type: Type.STRING }, comment: { type: Type.STRING },
                            timestamp: { type: Type.STRING }, upvotes: { type: Type.NUMBER }, downvotes: { type: Type.NUMBER },
                            aiSentimentScore: { type: Type.NUMBER }
                        }
                    }
                },
                sellerInfo: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING }, name: { type: Type.STRING }, reputationScore: { type: Type.NUMBER },
                        productsCount: { type: Type.NUMBER }, joinedDate: { type: Type.STRING }, aiTrustFactor: { type: Type.NUMBER },
                        contactEmail: { type: Type.STRING }, storefrontUrl: { type: Type.STRING }
                    }
                },
                relatedProducts: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, imageUrl: { type: Type.STRING } }
                    }
                },
                compatibilityInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
                sustainabilityScore: { type: Type.NUMBER },
                aiGeneratedTag: { type: Type.ARRAY, items: { type: Type.STRING } },
                virtualExperience: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING }, url: { type: Type.STRING }, description: { type: Type.STRING },
                        platformCompatibility: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                },
                dynamicPricing: {
                    type: Type.OBJECT,
                    properties: {
                        currentPrice: { type: Type.NUMBER },
                        historicalPrices: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { date: { type: Type.STRING }, price: { type: Type.NUMBER } } } },
                        demandLevel: { type: Type.STRING },
                        pricePrediction7Days: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { date: { type: Type.STRING }, predictedPrice: { type: Type.NUMBER } } } },
                        competitorAnalysis: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { competitor: { type: Type.STRING }, price: { type: Type.NUMBER }, timestamp: { type: Type.STRING } } } }
                    }
                },
                subscriptionOptions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING }, name: { type: Type.STRING }, price: { type: Type.NUMBER },
                            billingCycle: { type: Type.STRING }, features: { type: Type.ARRAY, items: { type: Type.STRING } },
                            aiValueProposition: { type: Type.STRING }
                        }
                    }
                },
                discoveryRank: { type: Type.NUMBER },
                audienceTarget: { type: Type.ARRAY, items: { type: Type.STRING } },
                lifecycleStage: { type: Type.STRING },
                realtimeStock: { type: Type.NUMBER },
                shippingEstimates: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { method: { type: Type.STRING }, cost: { type: Type.NUMBER }, days: { type: Type.NUMBER } } } },
                returnPolicy: { type: Type.STRING },
                warrantyInfo: { type: Type.STRING },
                aiPrognosis: { type: Type.STRING }
            }
        };

        const response = await this.ai.models.generateContent({
            model: 'gemini-1.5-pro', // Using a more powerful model for complex schema
            contents: [{ text: prompt }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        products: {
                            type: Type.ARRAY,
                            items: productSchema
                        }
                    }
                }
            }
        });

        const parsed = JSON.parse(response.text);
        const products: ExpandedMarketplaceProduct[] = parsed.products.map((p: any) => ({
            ...p,
            id: p.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            imageUrl: p.imageUrl || `https://source.unsplash.com/random/400x300?${p.name.split(' ').join(',')},futuristic,tech`,
            descriptionHtml: p.descriptionHtml || `<p>A groundbreaking product curated by Plato AI.</p>`,
            specifications: p.specifications || [],
            ratings: p.ratings || { average: 4.5, count: 100 },
            reviews: p.reviews || [],
            sellerInfo: p.sellerInfo || { id: 'seller_agora', name: 'Agora Solutions', reputationScore: 95, productsCount: 500, joinedDate: '2023-01-01', aiTrustFactor: 0.98, contactEmail: 'info@agora.ai', storefrontUrl: '/agora-solutions' },
            relatedProducts: p.relatedProducts || [],
            compatibilityInfo: p.compatibilityInfo || ['Universal'],
            sustainabilityScore: p.sustainabilityScore || Math.floor(Math.random() * 100),
            aiGeneratedTag: p.aiGeneratedTag || [],
            dynamicPricing: p.dynamicPricing || {
                currentPrice: p.price,
                historicalPrices: [], demandLevel: 'medium', pricePrediction7Days: [], competitorAnalysis: []
            },
            discoveryRank: p.discoveryRank || Math.floor(Math.random() * 1000),
            audienceTarget: p.audienceTarget || ['Innovators', 'Early Adopters'],
            lifecycleStage: p.lifecycleStage || 'new',
            realtimeStock: p.realtimeStock || Math.floor(Math.random() * 500) + 10,
            shippingEstimates: p.shippingEstimates || [{ method: 'Standard', cost: 5.99, days: 5 }],
            returnPolicy: p.returnPolicy || '30-day no-questions-asked return.',
            warrantyInfo: p.warrantyInfo || '1-year manufacturer warranty.',
            aiPrognosis: p.aiPrognosis || 'Plato projects high long-term value.'
        }));
        return products;
    }

    /**
     * Fetches a personalized storefront configuration for the user.
     * @returns Promise resolving to PersonalizedStorefrontConfig.
     */
    public async fetchPersonalizedStorefrontConfig(userPreferences: UserPreferenceProfile): Promise<PersonalizedStorefrontConfig> {
        await simulateNetworkDelay(1000);
        // Simulate AI generating a config
        return {
            id: `store_cfg_${this.userId}`,
            userId: this.userId,
            theme: userPreferences.aiPersonaTags.includes('eco-conscious parent') ? 'natural-green' : 'cyberpunk-neon',
            layout: 'fluid-pinterest',
            heroSectionContent: {
                title: `Welcome back, ${this.userId.split('_')[0]}!`,
                subtitle: `Plato has curated your digital universe.`,
                imageUrl: `https://source.unsplash.com/random/1200x400?${userPreferences.preferredCategories[0] || 'futuristic,tech'},ai,universe`,
                callToAction: { text: 'Explore New Horizons', link: '/explore' },
                aiJustification: 'Based on your recent interests and preferred categories.'
            },
            featuredCollections: [
                { id: 'coll_1', name: 'Plato\'s Top Picks', productIds: [], aiReason: 'Hyper-personalized for your recent activity.' },
                { id: 'coll_2', name: 'Trending in Agora', productIds: [], aiReason: 'Based on real-time market sentiment.' }
            ],
            aiCuratedBanners: [
                { imageUrl: 'https://source.unsplash.com/random/800x200?ai,future,discount', link: '/promotions', type: 'promotional' }
            ]
        };
    }

    /**
     * Fetches user-specific AI analytics and insights.
     * @param userTransactions - User's transaction history.
     * @returns Promise resolving to an array of AIDataInsight.
     */
    public async fetchUserAnalyticsReport(userTransactions: Transaction[]): Promise<AIDataInsight[]> {
        await simulateNetworkDelay(1500);
        const spendingPatterns = userTransactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as { [key: string]: number });

        const topCategory = Object.entries(spendingPatterns).sort(([, a], [, b]) => b - a)[0]?.[0] || 'General';

        return [
            {
                id: 'insight_1',
                type: 'personal_spending_pattern',
                title: 'Your Top Spending Category',
                summary: `You spend most in "${topCategory}". Plato recommends exploring new innovations in this area.`,
                details: JSON.stringify(spendingPatterns),
                visualizationUrl: 'https://via.placeholder.com/400x200?text=Spending+Chart',
                recommendation: 'Consider subscribing to relevant Agora AI curated news feeds.',
                timestamp: new Date().toISOString()
            },
            {
                id: 'insight_2',
                type: 'market_trend',
                title: 'Emerging Tech Trend: Quantum Computing Accessories',
                summary: 'Plato predicts a surge in demand for quantum-ready peripherals.',
                details: 'Global investment in quantum research is accelerating, creating a niche market for compatible hardware.',
                visualizationUrl: 'https://via.placeholder.com/400x200?text=Trend+Graph',
                recommendation: 'Discover early access products in the "Quantum Frontier" collection.',
                timestamp: new Date().toISOString(),
                severity: 'high'
            }
        ];
    }

    /**
     * Submits a product review and gets AI feedback on it.
     */
    public async submitProductReview(productId: string, review: Omit<CommunityReview, 'id' | 'timestamp' | 'upvotes' | 'downvotes' | 'aiSentimentScore' | 'aiGeneratedSummary'>): Promise<CommunityReview> {
        await simulateNetworkDelay(500);
        const aiSentimentScore = Math.random() * 2 - 1; // Simulate sentiment analysis -1 to 1
        return {
            ...review,
            id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toISOString(),
            upvotes: 0,
            downvotes: 0,
            aiSentimentScore: aiSentimentScore,
            aiGeneratedSummary: aiSentimentScore > 0.5 ? 'Very positive!' : (aiSentimentScore < -0.5 ? 'Critical feedback identified.' : 'Neutral sentiment.')
        };
    }

    /**
     * Fetches dynamically generated categories and trending tags.
     */
    public async fetchDynamicCategories(): Promise<DynamicCategory[]> {
        await simulateNetworkDelay(800);
        return [
            { id: 'cat_1', name: 'Neural Interface Devices', description: 'Explore the latest in brain-computer interfaces.', productCount: 150, trendingScore: 0.95, imageUrl: 'https://source.unsplash.com/random/300x200?neural,interface', aiGeneratedKeywords: ['BCI', 'Neurotech', 'Cognitive Enhancement'] },
            { id: 'cat_2', name: 'Sustainable Synthetics', description: 'Eco-friendly materials and products of the future.', productCount: 230, trendingScore: 0.88, imageUrl: 'https://source.unsplash.com/random/300x200?eco,sustainable', aiGeneratedKeywords: ['GreenTech', 'Bio-materials', 'Circular Economy'] },
            { id: 'cat_3', name: 'Holographic Companions', description: 'Advanced AI companions and interactive holograms.', productCount: 75, trendingScore: 0.92, imageUrl: 'https://source.unsplash.com/random/300x200?hologram,ai,companion', aiGeneratedKeywords: ['Virtual Pet', 'AI Assistant', 'Mixed Reality'] },
        ];
    }
}

// ================================================================================================
// SUB-COMPONENTS (EXPANDED)
// ================================================================================================

/**
 * @description Renders a single product card in the marketplace.
 * Now displays richer information and interactive elements.
 * @param {object} props - Component props containing the product and buy/view handler.
 */
export const ProductCardExpanded: React.FC<{ product: ExpandedMarketplaceProduct; onBuy: (product: ExpandedMarketplaceProduct) => void; onViewDetails: (product: ExpandedMarketplaceProduct) => void; }> = ({ product, onBuy, onViewDetails }) => (
    <Card className="flex flex-col h-full hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300">
        <div className="aspect-video bg-gray-700 rounded-t-xl overflow-hidden relative group">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute top-2 right-2 bg-cyan-600 text-white text-xs px-2 py-1 rounded-full">{product.category}</div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-xs">
                <span className="font-semibold">{product.sustainabilityScore}% Sustainable</span>
            </div>
        </div>
        <div className="p-4 flex-grow flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-1">{product.name}</h3>
            <p className="text-xs text-gray-500 mb-2">Plato ID: {product.id}</p>
            <p className="text-sm text-gray-400 mt-1 flex-grow"><span className="font-semibold text-cyan-300">Plato's Insight:</span> {product.aiJustification}</p>
            <div className="flex items-center mt-2">
                <span className="text-yellow-400 text-sm">{'⭐'.repeat(Math.floor(product.ratings.average))}</span>
                <span className="text-gray-400 text-xs ml-1">({product.ratings.count} reviews)</span>
            </div>
            <div className="flex-grow"></div> {/* Spacer */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/60">
                <p className="font-mono text-2xl text-cyan-300">${product.dynamicPricing?.currentPrice.toFixed(2) || product.price.toFixed(2)}</p>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onViewDetails(product)}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Details
                    </button>
                    <button
                        onClick={() => onBuy(product)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    </Card>
);

/**
 * @description A loading skeleton component for Agora AI marketplace.
 */
export const MarketplaceSkeletonExpanded: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-96 bg-gray-800 rounded-lg p-8">
        <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
            <div className="absolute inset-4 border-4 border-t-cyan-500 border-transparent rounded-full animate-spin-slow"></div>
            <div className="absolute inset-8 border-4 border-r-purple-500 border-transparent rounded-full animate-spin-reverse"></div>
        </div>
        <p className="text-white text-2xl mt-8 font-extrabold animate-pulse tracking-wide">Plato AI is forging your universe...</p>
        <p className="text-gray-400 mt-2 text-md text-center max-w-md">Analyzing trillions of data points and your unique persona to craft the perfect Agora experience.</p>
        <div className="mt-6 flex space-x-4">
            <div className="w-20 h-3 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-24 h-3 bg-gray-700 rounded animate-pulse delay-100"></div>
            <div className="w-16 h-3 bg-gray-700 rounded animate-pulse delay-200"></div>
        </div>
    </div>
);

/**
 * @description Displays a personalized hero section based on AI configuration.
 */
export const PersonalizedHeroSection: React.FC<{ config: PersonalizedStorefrontConfig['heroSectionContent'] }> = ({ config }) => (
    <div className="relative h-96 bg-cover bg-center rounded-xl overflow-hidden shadow-lg" style={{ backgroundImage: `url(${config.imageUrl})` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center p-8">
            <div className="max-w-xl text-white">
                <p className="text-cyan-300 text-sm font-mono mb-2">{config.aiJustification}</p>
                <h1 className="text-5xl font-extrabold leading-tight tracking-tight mb-4">{config.title}</h1>
                <p className="text-lg text-gray-200 mb-6">{config.subtitle}</p>
                <a href={config.callToAction.link} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-lg font-bold rounded-full transition-colors shadow-xl">
                    {config.callToAction.text}
                </a>
            </div>
        </div>
    </div>
);

/**
 * @description Modal for displaying detailed product information.
 */
export const ProductDetailModal: React.FC<{ product: ExpandedMarketplaceProduct | null; onClose: () => void; onBuy: (product: ExpandedMarketplaceProduct) => void; }> = ({ product, onClose, onBuy }) => {
    if (!product) return null;

    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews' | 'virtual'>('description');
    const hasVirtualExperience = !!product.virtualExperience;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex justify-center items-center p-4">
            <Card className="relative w-full max-w-5xl max-h-[90vh] bg-gray-900 rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-light leading-none z-10">
                    &times;
                </button>
                <div className="flex-shrink-0 relative h-64 md:h-80 bg-gray-800 rounded-t-xl overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <h2 className="text-4xl font-extrabold text-white drop-shadow-lg">{product.name}</h2>
                        <span className="text-3xl font-mono text-cyan-300 drop-shadow-lg">${product.dynamicPricing?.currentPrice.toFixed(2) || product.price.toFixed(2)}</span>
                    </div>
                </div>

                <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                    <div className="border-b border-gray-700 mb-4">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('description')}
                                className={`${activeTab === 'description' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('specs')}
                                className={`${activeTab === 'specs' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                Specifications
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`${activeTab === 'reviews' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                Reviews ({product.ratings.count})
                            </button>
                            {hasVirtualExperience && (
                                <button
                                    onClick={() => setActiveTab('virtual')}
                                    className={`${activeTab === 'virtual' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    Virtual Experience
                                </button>
                            )}
                        </nav>
                    </div>

                    <div className="text-gray-300 text-sm">
                        {activeTab === 'description' && (
                            <div className="space-y-4">
                                <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                                {product.longDescription && (
                                    <>
                                        <h4 className="text-lg font-semibold text-white mt-6">Plato's Deep Dive:</h4>
                                        <p className="text-gray-400 text-sm">{product.longDescription}</p>
                                    </>
                                )}
                                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                                    <h4 className="text-lg font-semibold text-white">Plato's Prognosis:</h4>
                                    <p className="text-gray-400 text-sm">{product.aiPrognosis}</p>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {product.aiGeneratedTag.map((tag, i) => (
                                        <span key={i} className="bg-cyan-900/40 text-cyan-300 px-3 py-1 rounded-full text-xs font-medium">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'specs' && (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.specifications.map((spec, i) => (
                                    <li key={i} className="flex justify-between items-center border-b border-gray-700 pb-2">
                                        <span className="font-medium text-white">{spec.key}:</span>
                                        <span className="text-gray-400">{spec.value}</span>
                                    </li>
                                ))}
                                <li className="flex justify-between items-center border-b border-gray-700 pb-2 col-span-full">
                                    <span className="font-medium text-white">Compatibility:</span>
                                    <span className="text-gray-400">{product.compatibilityInfo.join(', ')}</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-gray-700 pb-2 col-span-full">
                                    <span className="font-medium text-white">Sustainability Score:</span>
                                    <span className="text-cyan-300 font-semibold">{product.sustainabilityScore}%</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-gray-700 pb-2 col-span-full">
                                    <span className="font-medium text-white">Realtime Stock:</span>
                                    <span className="text-gray-400">{product.realtimeStock} units</span>
                                </li>
                            </ul>
                        )}
                        {activeTab === 'reviews' && (
                            <CommunityReviewsSection reviews={product.reviews} productId={product.id} />
                        )}
                        {activeTab === 'virtual' && hasVirtualExperience && (
                            <VirtualProductExperience experience={product.virtualExperience} />
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 p-6 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
                    <p className="font-mono text-3xl text-cyan-300">${product.dynamicPricing?.currentPrice.toFixed(2) || product.price.toFixed(2)}</p>
                    <button
                        onClick={() => { onBuy(product); onClose(); }}
                        className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xl font-bold transition-colors"
                    >
                        Secure Purchase
                    </button>
                </div>
            </Card>
        </div>
    );
};

/**
 * @description Renders community reviews for a product. Includes AI sentiment analysis.
 */
export const CommunityReviewsSection: React.FC<{ reviews: CommunityReview[]; productId: string; }> = ({ reviews, productId }) => {
    const [newReview, setNewReview] = useState({ rating: 0, title: '', comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const context = useContext(DataContext);
    if (!context) throw new Error("CommunityReviewsSection must be within a DataProvider.");
    const { userId } = context; // Assuming userId is available in DataContext

    // This would be an AgoraAIService call in a real app
    const handleSubmitReview = async () => {
        if (newReview.rating === 0 || !newReview.title || !newReview.comment) {
            alert("Please provide a rating, title, and comment.");
            return;
        }
        setSubmitting(true);
        try {
            const agoraAI = new AgoraAIService(process.env.API_KEY as string, userId || 'anonymous');
            const submitted = await agoraAI.submitProductReview(productId, { ...newReview, userId: userId || 'anonymous', username: 'You' });
            // In a real app, you'd update the product's reviews state or refetch product details
            alert(`Review submitted! Plato AI sentiment: ${submitted.aiGeneratedSummary}`);
            setNewReview({ rating: 0, title: '', comment: '' });
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Customer Reviews</h4>
            {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet. Be the first to share your insights!</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center text-yellow-400">
                                        {'⭐'.repeat(review.rating)}
                                    </div>
                                    <h5 className="font-semibold text-white mt-1">{review.title}</h5>
                                </div>
                                <span className="text-xs text-gray-500">{new Date(review.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{review.comment}</p>
                            <div className="flex items-center text-xs text-gray-500">
                                <span className="mr-2">By {review.username}</span>
                                <span className="flex items-center mr-3">👍 {review.upvotes}</span>
                                <span className="flex items-center mr-3">👎 {review.downvotes}</span>
                                <span className={`font-semibold ${review.aiSentimentScore > 0.5 ? 'text-green-400' : review.aiSentimentScore < -0.5 ? 'text-red-400' : 'text-yellow-400'}`}>
                                    Plato Sentiment: {review.aiGeneratedSummary || review.aiSentimentScore.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4">Write a Review</h4>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="review-rating" className="block text-sm font-medium text-gray-300">Rating</label>
                        <div className="flex items-center space-x-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                    className={`text-2xl ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300 transition-colors`}
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="review-title" className="block text-sm font-medium text-gray-300">Review Title</label>
                        <input
                            type="text"
                            id="review-title"
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                            value={newReview.title}
                            onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Summarize your experience"
                        />
                    </div>
                    <div>
                        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-300">Your Review</label>
                        <textarea
                            id="review-comment"
                            rows={4}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                            value={newReview.comment}
                            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                            placeholder="Share your thoughts on the product..."
                        ></textarea>
                    </div>
                    <button
                        onClick={handleSubmitReview}
                        disabled={submitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * @description Embeds or links to a virtual product experience (3D model, AR, VR).
 */
export const VirtualProductExperience: React.FC<{ experience: VirtualExperience }> = ({ experience }) => {
    return (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Immersive Experience: {experience.type}</h4>
            <p className="text-gray-400 text-sm">{experience.description}</p>
            {experience.type === '3D_MODEL' || experience.type === 'AR_PREVIEW' ? (
                // For simplicity, using an iframe for a generic viewer or a link
                <iframe
                    src={experience.url} // This would be a specialized viewer URL
                    title="Virtual Product Experience"
                    className="w-full h-96 bg-gray-800 rounded-lg"
                    allowFullScreen
                    frameBorder="0"
                ></iframe>
            ) : (
                <div className="p-4 bg-gray-800 rounded-lg flex items-center justify-between">
                    <p className="text-gray-300">Click to launch the full {experience.type} in a compatible environment:</p>
                    <a href={experience.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                        Launch {experience.type}
                    </a>
                </div>
            )}
            <p className="text-xs text-gray-500">Compatible with: {experience.platformCompatibility.join(', ')}</p>
        </div>
    );
};

/**
 * @description Displays dynamic, AI-generated categories or trending tags.
 */
export const DynamicCategoriesNav: React.FC<{ categories: DynamicCategory[]; onSelectCategory: (category: string) => void; }> = ({ categories, onSelectCategory }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Plato's Trending Horizons</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.name)}
                        className="group relative flex flex-col items-center justify-center p-3 rounded-lg bg-gray-700 hover:bg-cyan-900/40 transition-colors h-32 overflow-hidden"
                    >
                        <img src={cat.imageUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-10 transition-opacity" />
                        <div className="relative z-10 text-center">
                            <h4 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">{cat.name}</h4>
                            <p className="text-xs text-gray-400 group-hover:text-gray-300">{cat.productCount} products</p>
                            <span className="text-xs text-green-400 font-medium mt-1">▲ {Math.round(cat.trendingScore * 100)}% Trending</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

/**
 * @description An AI-powered dashboard displaying personal insights and market trends.
 */
export const AIInsightsDashboard: React.FC<{ insights: AIDataInsight[] }> = ({ insights }) => {
    return (
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-cyan-400 text-4xl mr-3">💡</span> Plato AI Insights
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {insights.length === 0 ? (
                    <p className="col-span-full text-gray-500">Plato is still gathering enough data for your personalized insights. Keep exploring!</p>
                ) : (
                    insights.map(insight => (
                        <div key={insight.id} className={`p-5 rounded-lg border ${insight.severity === 'high' ? 'border-red-500 bg-red-900/20' : 'border-gray-700 bg-gray-800'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className={`text-lg font-semibold ${insight.severity === 'high' ? 'text-red-400' : 'text-white'}`}>{insight.title}</h4>
                                <span className="text-xs text-gray-500">{new Date(insight.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{insight.summary}</p>
                            {insight.visualizationUrl && (
                                <img src={insight.visualizationUrl} alt="Insight Visualization" className="w-full h-auto rounded-md mb-3" />
                            )}
                            <p className="text-cyan-300 text-xs font-mono">Plato's Action: {insight.recommendation}</p>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

/**
 * @description Allows users to configure AI recommendation settings.
 */
export const MarketplaceSettings: React.FC<{
    settings: AIRecommendationEngineSettings;
    onUpdateSettings: (newSettings: Partial<AIRecommendationEngineSettings>) => void;
}> = ({ settings, onUpdateSettings }) => {
    return (
        <Card className="p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Plato AI Settings</h3>
            <p className="text-gray-400 mb-6">Fine-tune how Plato AI curates your Agora experience. These settings impact your recommendations, storefront layout, and insights.</p>
            <div className="space-y-6">
                <div>
                    <label htmlFor="rec-intensity" className="block text-sm font-medium text-gray-300 mb-2">Recommendation Intensity</label>
                    <select
                        id="rec-intensity"
                        value={settings.recommendationIntensity}
                        onChange={(e) => onUpdateSettings({ recommendationIntensity: e.target.value as 'low' | 'medium' | 'high' | 'hyper-personalized' })}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                    >
                        <option value="low">Low (Broad suggestions)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="high">High (Strongly personalized)</option>
                        <option value="hyper-personalized">Hyper-Personalized (Aggressive tailoring)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Controls how aggressively Plato AI tailors content to your profile.</p>
                </div>
                <div>
                    <label htmlFor="diversity-pref" className="block text-sm font-medium text-gray-300 mb-2">Diversity Preference</label>
                    <select
                        id="diversity-pref"
                        value={settings.diversityPreference}
                        onChange={(e) => onUpdateSettings({ diversityPreference: e.target.value as 'exploratory' | 'focused' })}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                    >
                        <option value="exploratory">Exploratory (Discover new interests)</option>
                        <option value="focused">Focused (Refine existing interests)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Determines if Plato AI introduces novel items or refines known preferences.</p>
                </div>
                <div>
                    <label htmlFor="privacy-level" className="block text-sm font-medium text-gray-300 mb-2">Privacy Level</label>
                    <select
                        id="privacy-level"
                        value={settings.privacyLevel}
                        onChange={(e) => onUpdateSettings({ privacyLevel: e.target.value as 'standard' | 'enhanced' | 'maximum' })}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                    >
                        <option value="standard">Standard (Balanced experience and privacy)</option>
                        <option value="enhanced">Enhanced (Reduced data sharing, slight impact on personalization)</option>
                        <option value="maximum">Maximum (Minimal data usage, recommendations may be less relevant)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Adjusts the amount of personal data Plato AI uses for recommendations.</p>
                </div>
            </div>
            {/* Future: Add more detailed preference sliders, AI persona tag editor, etc. */}
        </Card>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT: MarketplaceView (Agora AI)
// ================================================================================================

export const MarketplaceView: React.FC = () => {
    const context = useContext(DataContext);
    const [products, setProducts] = useState<ExpandedMarketplaceProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Default to true as initial load will always fetch
    const [error, setError] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<ExpandedMarketplaceProduct | null>(null);
    const [storefrontConfig, setStorefrontConfig] = useState<PersonalizedStorefrontConfig | null>(null);
    const [userPreferences, setUserPreferences] = useState<UserPreferenceProfile>({
        id: 'user_pref_default', userId: 'agora_user_123', preferredCategories: ['Tech', 'Innovation'],
        dislikedKeywords: ['legacy', 'outdated'], budgetRange: { min: 0, max: 10000 },
        notificationSettings: { priceDrops: true, newArrivals: true, personalizedAlerts: true },
        aiPersonaTags: ['innovator', 'futurist', 'conscious-consumer'], lastActivity: new Date().toISOString()
    });
    const [aiEngineSettings, setAIEngineSettings] = useState<AIRecommendationEngineSettings>({
        id: 'ai_engine_cfg_default', userId: 'agora_user_123', recommendationIntensity: 'hyper-personalized',
        diversityPreference: 'exploratory', privacyLevel: 'standard', feedbackProvided: []
    });
    const [aiInsights, setAIInsights] = useState<AIDataInsight[]>([]);
    const [dynamicCategories, setDynamicCategories] = useState<DynamicCategory[]>([]);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

    if (!context) {
        throw new Error("MarketplaceView must be within a DataProvider.");
    }

    const { transactions, addProductToTransactions, userId } = context; // Assuming userId is now in DataContext

    const agoraAIService = useMemo(() => new AgoraAIService(process.env.API_KEY as string, userId || 'agora_user_123'), [userId]);

    /**
     * @description Fetches personalized product recommendations, storefront config, and insights.
     */
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // Fetch multiple AI-curated data points in parallel
            const [
                recommendedProducts,
                personalStorefront,
                analyticsReport,
                categories
            ] = await Promise.all([
                agoraAIService.generateAdvancedProductRecommendations(transactions, userPreferences, aiEngineSettings),
                agoraAIService.fetchPersonalizedStorefrontConfig(userPreferences),
                agoraAIService.fetchUserAnalyticsReport(transactions),
                agoraAIService.fetchDynamicCategories()
            ]);

            setProducts(recommendedProducts);
            setStorefrontConfig(personalStorefront);
            setAIInsights(analyticsReport);
            setDynamicCategories(categories);
        } catch (error) {
            console.error("Error fetching Agora AI data:", error);
            setError("Plato AI encountered an error while forging your universe. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [transactions, userPreferences, aiEngineSettings, agoraAIService]);

    // Initial data fetch and re-fetch on major dependency changes
    useEffect(() => {
        // Only fetch if products are empty or if a significant user/AI setting change occurred
        // For hyper-personalization, we might refetch more often.
        fetchData();
    }, [fetchData]); // userId, transactions, userPreferences, aiEngineSettings

    /**
     * @description Handles the "Buy Now" action for a product.
     */
    const handleBuy = useCallback((product: ExpandedMarketplaceProduct) => {
        addProductToTransactions(product);
        alert(`Secured "${product.name}"! Your universe expands.`);
        // In a real app, integrate with inventory management, payment gateway, etc.
        // Also, potentially refetch recommendations as transaction history changes.
        // fetchData(); // Uncomment to re-trigger recommendations on purchase
    }, [addProductToTransactions]);

    /**
     * @description Opens the detailed product modal.
     */
    const handleViewDetails = useCallback((product: ExpandedMarketplaceProduct) => {
        setSelectedProduct(product);
    }, []);

    /**
     * @description Updates AI engine settings and triggers a re-fetch of recommendations.
     */
    const handleUpdateAIEngineSettings = useCallback((newSettings: Partial<AIRecommendationEngineSettings>) => {
        setAIEngineSettings(prev => ({ ...prev, ...newSettings }));
        // Trigger re-fetch immediately for responsive settings changes
        // This might be debounced in a real application
        // fetchData(); // Uncomment if settings changes should instantly re-generate products
    }, []);

    const filteredProducts = useMemo(() => {
        if (!activeCategoryFilter) {
            return products;
        }
        return products.filter(p => p.category === activeCategoryFilter || p.aiGeneratedTag.includes(activeCategoryFilter));
    }, [products, activeCategoryFilter]);

    return (
        <div className="space-y-12 pb-16"> {/* Increased spacing and added padding-bottom */}
            {storefrontConfig?.heroSectionContent && (
                <PersonalizedHeroSection config={storefrontConfig.heroSectionContent} />
            )}

            <h2 className="text-5xl font-extrabold text-white tracking-wider text-center mt-12 mb-8">Agora AI Universe</h2>
            <Card className="p-8 bg-gray-800/60 border border-gray-700 rounded-2xl shadow-xl">
                <p className="text-gray-300 text-lg mb-8 text-center leading-relaxed">
                    Welcome to the nexus of possibility. Plato, our advanced AI, transcends mere recommendations, sculpting an entire personalized universe of products and services tailored to your evolving needs and aspirations.
                    Explore, discover, and expand your horizons.
                </p>
            </Card>

            <DynamicCategoriesNav categories={dynamicCategories} onSelectCategory={setActiveCategoryFilter} />

            <AIInsightsDashboard insights={aiInsights} />

            <MarketplaceSettings settings={aiEngineSettings} onUpdateSettings={handleUpdateAIEngineSettings} />

            <h3 className="text-4xl font-bold text-white mt-12 mb-8">
                {activeCategoryFilter ? `Curated in ${activeCategoryFilter}` : "Plato's Hyper-Curations"}
            </h3>

            {isLoading && <MarketplaceSkeletonExpanded />}
            {error && <p className="text-center text-red-400 py-12 text-xl font-medium">{error}</p>}
            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.length === 0 ? (
                        <p className="col-span-full text-center text-gray-400 py-12 text-lg">
                            No products found in this category. Plato is always learning, try adjusting your preferences!
                        </p>
                    ) : (
                        filteredProducts.map(product => (
                            <ProductCardExpanded
                                key={product.id}
                                product={product}
                                onBuy={handleBuy}
                                onViewDetails={handleViewDetails}
                            />
                        ))
                    )}
                </div>
            )}

            <ProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onBuy={handleBuy}
            />
        </div>
    );
};

export default MarketplaceView;