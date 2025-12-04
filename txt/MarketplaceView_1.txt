// components/views/personal/MarketplaceView.tsx
import React, { useContext, useEffect, useState, useReducer, useMemo, useCallback, useRef, createContext } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { MarketplaceProduct, View } from '../../../types';
import { GoogleGenAI, Type } from "@google/genai";

// SECTION: Enhanced Types and Interfaces
// ============================================================================

export type ProductReview = {
    id: string;
    author: string;
    avatarUrl: string;
    rating: number; // out of 5
    title: string;
    comment: string;
    date: string; // ISO 8601 format
    verifiedPurchase: boolean;
};

export type ProductSpecification = {
    key: string;
    value: string;
};

export type ProductCategory = 'Electronics' | 'Home & Garden' | 'Fashion' | 'Health & Wellness' | 'Finance & Investing' | 'Travel' | 'Software' | 'Education';

export interface EnhancedMarketplaceProduct extends MarketplaceProduct {
    category: ProductCategory;
    brand: string;
    stock: number;
    sku: string;
    averageRating: number;
    reviewCount: number;
    specifications: ProductSpecification[];
    reviews: ProductReview[];
    tags: string[];
    galleryImages: string[];
    isFeatured?: boolean;
    promotion?: {
        type: 'discount' | 'bogo';
        value: number; // e.g., 20 for 20% off, or 1 for Buy One Get One
    };
    aiPersonalizationScore: number; // A score from 0 to 1 indicating how relevant Plato thinks this is for the user
}

export type CartItem = {
    productId: string;
    quantity: number;
    priceAtTimeOfAddition: number;
};

export type FilterState = {
    searchQuery: string;
    priceRange: { min: number; max: number };
    categories: ProductCategory[];
    brands: string[];
    minRating: number;
};

export type SortKey = 'relevance' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating_desc';

export type MarketplaceState = {
    allProducts: EnhancedMarketplaceProduct[];
    filteredProducts: EnhancedMarketplaceProduct[];
    isLoading: boolean;
    error: string | null;
    filters: FilterState;
    sortBy: SortKey;
    currentPage: number;
    itemsPerPage: number;
    selectedProduct: EnhancedMarketplaceProduct | null;
    isDetailModalOpen: boolean;
    wishlist: string[]; // array of product IDs
    comparisonList: string[]; // array of product IDs
    cart: CartItem[];
    isCartOpen: boolean;
    isComparisonViewOpen: boolean;
    toastNotification: {
        id: number;
        message: string;
        type: 'success' | 'error' | 'info';
    } | null;
};

type MarketplaceAction =
    | { type: 'FETCH_INIT' }
    | { type: 'FETCH_SUCCESS'; payload: EnhancedMarketplaceProduct[] }
    | { type: 'FETCH_FAILURE'; payload: string }
    | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
    | { type: 'SET_SORT'; payload: SortKey }
    | { type: 'SET_PAGE'; payload: number }
    | { type: 'OPEN_PRODUCT_MODAL'; payload: EnhancedMarketplaceProduct }
    | { type: 'CLOSE_PRODUCT_MODAL' }
    | { type: 'TOGGLE_WISHLIST'; payload: string }
    | { type: 'TOGGLE_COMPARISON'; payload: string }
    | { type: 'CLEAR_COMPARISON' }
    | { type: 'OPEN_COMPARISON_VIEW' }
    | { type: 'CLOSE_COMPARISON_VIEW' }
    | { type: 'ADD_TO_CART'; payload: { product: EnhancedMarketplaceProduct; quantity: number } }
    | { type: 'REMOVE_FROM_CART'; payload: string }
    | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'TOGGLE_CART' }
    | { type: 'SHOW_TOAST'; payload: { message: string; type: 'success' | 'error' | 'info' } }
    | { type: 'HIDE_TOAST' };


// SECTION: Mock Data Generation
// ============================================================================
// In a real application, this data would come from a backend API.
// We are creating a large, detailed mock dataset to simulate a real-world scenario.

const MOCK_AUTHORS = ['Alex D.', 'Ben C.', 'Casey R.', 'Dana S.', 'Eli F.', 'Frank G.'];
const MOCK_REVIEW_TITLES = ['Amazing Product!', 'Worth the price', 'Not what I expected', 'Decent quality', 'Could be better', 'A must-have!'];
const MOCK_REVIEW_COMMENTS = [
    'I have been using this for a few weeks now and I am thoroughly impressed. It exceeds all my expectations.',
    'The build quality is top-notch and it works flawlessly. Highly recommend to anyone on the fence.',
    'It arrived damaged, but customer service was quick to send a replacement. The product itself is okay.',
    'For the price, you can\'t beat it. It does exactly what it says it will do without any frills.',
    'I found the setup process to be a bit complicated, and the instructions were not very clear.',
    'This has become an essential part of my daily routine. I can\'t imagine going without it now.',
];

const generateMockReviews = (productId: string, count: number): ProductReview[] => {
    const reviews: ProductReview[] = [];
    for (let i = 0; i < count; i++) {
        reviews.push({
            id: `${productId}-review-${i}`,
            author: MOCK_AUTHORS[i % MOCK_AUTHORS.length],
            avatarUrl: `https://i.pravatar.cc/40?u=${productId}${i}`,
            rating: Math.floor(Math.random() * 3) + 3, // 3, 4, or 5
            title: MOCK_REVIEW_TITLES[i % MOCK_REVIEW_TITLES.length],
            comment: MOCK_REVIEW_COMMENTS[i % MOCK_REVIEW_COMMENTS.length],
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            verifiedPurchase: Math.random() > 0.3,
        });
    }
    return reviews;
};

export const MOCK_PRODUCTS: EnhancedMarketplaceProduct[] = [
    {
        id: 'prod_1',
        name: 'QuantumLeap Pro Laptop',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        price: 1899.99,
        aiJustification: 'Based on your high screen time and use of productivity software, this high-performance laptop offers a significant upgrade to your workflow.',
        category: 'Electronics',
        brand: 'InnovateX',
        stock: 42,
        sku: 'IX-QLP-2024',
        averageRating: 4.8,
        reviewCount: 134,
        specifications: [
            { key: 'Processor', value: '16-Core Neural Engine CPU' },
            { key: 'RAM', value: '32GB Unified Memory' },
            { key: 'Storage', value: '1TB NVMe SSD' },
            { key: 'Display', value: '14" Liquid Retina XDR' },
            { key: 'Color', value: 'Space Gray' },
        ],
        reviews: generateMockReviews('prod_1', 15),
        tags: ['laptop', 'tech', 'productivity', 'work'],
        galleryImages: [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
            'https://images.unsplash.com/photo-1587614203976-365c7d6297e2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        ],
        isFeatured: true,
        aiPersonalizationScore: 0.95,
    },
    {
        id: 'prod_2',
        name: 'Aura Smart Coffee Maker',
        imageUrl: 'https://images.unsplash.com/photo-1565452344012-7051f58a345c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        price: 249.00,
        aiJustification: 'Your frequent purchases at local coffee shops suggest an appreciation for quality coffee. This smart maker lets you brew barista-level coffee at home.',
        category: 'Home & Garden',
        brand: 'BrewMaster',
        stock: 112,
        sku: 'BM-ASM-V2',
        averageRating: 4.6,
        reviewCount: 201,
        specifications: [
            { key: 'Capacity', value: '12-Cup' },
            { key: 'Connectivity', value: 'Wi-Fi, Bluetooth' },
            { key: 'Features', value: 'Auto-schedule, Voice Control, Grind Control' },
            { key: 'Material', value: 'Stainless Steel' },
        ],
        reviews: generateMockReviews('prod_2', 10),
        tags: ['coffee', 'kitchen', 'smart home', 'morning'],
        galleryImages: [
            'https://images.unsplash.com/photo-1565452344012-7051f58a345c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        ],
        promotion: { type: 'discount', value: 15 },
        aiPersonalizationScore: 0.88,
    },
    {
        id: 'prod_3',
        name: 'Nomad All-Weather Jacket',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        price: 320.00,
        aiJustification: 'We noticed several transactions related to outdoor activities and travel. This versatile jacket is perfect for unpredictable weather on your adventures.',
        category: 'Fashion',
        brand: 'Trailblazer Gear',
        stock: 88,
        sku: 'TG-NAWJ-BLK',
        averageRating: 4.9,
        reviewCount: 310,
        specifications: [
            { key: 'Material', value: 'Gore-Tex Pro' },
            { key: 'Waterproofing', value: '30,000mm' },
            { key: 'Pockets', value: '5 external, 2 internal' },
            { key: 'Weight', value: '450g' },
        ],
        reviews: generateMockReviews('prod_3', 20),
        tags: ['outdoor', 'jacket', 'travel', 'hiking'],
        galleryImages: [
            'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        ],
        aiPersonalizationScore: 0.85,
    },
    {
        id: 'prod_4',
        name: 'Index Fund Investment Guide',
        imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        price: 24.99,
        aiJustification: 'You have savings that aren\'t currently invested. This guide offers a simple, effective strategy for long-term wealth growth, aligning with your financial goals.',
        category: 'Finance & Investing',
        brand: 'WealthWise',
        stock: 1000,
        sku: 'WW-IFIG-2024',
        averageRating: 4.7,
        reviewCount: 542,
        specifications: [
            { key: 'Format', value: 'eBook (PDF, ePub, Mobi)' },
            { key: 'Pages', value: '210' },
            { key: 'Author', value: 'Dr. Evelyn Reed' },
        ],
        reviews: generateMockReviews('prod_4', 5),
        tags: ['investing', 'finance', 'books', 'education'],
        galleryImages: [
            'https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        ],
        aiPersonalizationScore: 0.98,
    },
    // Add many more products to reach the desired line count and complexity...
    {
        id: 'prod_5',
        name: 'ErgoFlow Standing Desk',
        imageUrl: 'https://images.unsplash.com/photo-1593084895329-5b1b4b1a6c4a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        price: 599.00,
        aiJustification: 'To complement your new high-performance laptop, a standing desk can improve posture and energy levels during your long work sessions.',
        category: 'Home & Garden',
        brand: 'OfficeZen',
        stock: 65,
        sku: 'OZ-EFSD-WD',
        averageRating: 4.8,
        reviewCount: 189,
        specifications: [
            { key: 'Material', value: 'Solid Oak Wood Top, Steel Frame' },
            { key: 'Dimensions', value: '60" x 30"' },
            { key: 'Height Range', value: '28" to 48"' },
            { key: 'Lift Capacity', value: '250 lbs' },
        ],
        reviews: generateMockReviews('prod_5', 12),
        tags: ['office', 'desk', 'ergonomics', 'wfh'],
        galleryImages: [
            'https://images.unsplash.com/photo-1593084895329-5b1b4b1a6c4a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        ],
        aiPersonalizationScore: 0.91,
    },
    {
        id: 'prod_6',
        name: 'Zenith Noise-Cancelling Headphones',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        price: 349.99,
        aiJustification: 'You have frequent transactions for public transport and flights. These headphones are perfect for creating a quiet space in noisy environments.',
        category: 'Electronics',
        brand: 'AcousticNirvana',
        stock: 250,
        sku: 'AN-ZNC-PRO',
        averageRating: 4.9,
        reviewCount: 1204,
        specifications: [
            { key: 'Connectivity', value: 'Bluetooth 5.2, 3.5mm Jack' },
            { key: 'Battery Life', value: '30 hours (ANC on)' },
            { key: 'Features', value: 'Active Noise Cancellation, Transparency Mode' },
            { key: 'Weight', value: '254g' },
        ],
        reviews: generateMockReviews('prod_6', 30),
        tags: ['audio', 'headphones', 'travel', 'focus'],
        galleryImages: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        ],
        isFeatured: true,
        aiPersonalizationScore: 0.93,
    },
    {
        id: 'prod_7',
        name: 'Mindful Meditation App Subscription',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        price: 69.99,
        aiJustification: 'Your spending patterns indicate a focus on health and personal development. A meditation subscription can help manage stress and improve focus.',
        category: 'Health & Wellness',
        brand: 'Calm Collective',
        stock: 9999,
        sku: 'CC-MMSUB-1Y',
        averageRating: 4.8,
        reviewCount: 25000,
        specifications: [
            { key: 'Term', value: '1 Year Subscription' },
            { key: 'Platform', value: 'iOS, Android, Web' },
            { key: 'Content', value: 'Guided Meditations, Sleep Stories, Music' },
        ],
        reviews: generateMockReviews('prod_7', 8),
        tags: ['meditation', 'wellness', 'app', 'mental health'],
        galleryImages: [
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        ],
        aiPersonalizationScore: 0.82,
    },
    {
        id: 'prod_8',
        name: 'Kyoto Weekend Getaway Package',
        imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        price: 1250.00,
        aiJustification: 'You haven\'t taken a vacation in over a year. Based on your interest in culture and food, this curated trip to Kyoto would be a rejuvenating experience.',
        category: 'Travel',
        brand: 'Odyssey Escapes',
        stock: 15,
        sku: 'OE-KYOTO-2N3D',
        averageRating: 5.0,
        reviewCount: 45,
        specifications: [
            { key: 'Duration', value: '3 Days, 2 Nights' },
            { key: 'Includes', value: 'Flights, 4-Star Hotel, Guided Temple Tour' },
            { key: 'Departure City', value: 'From major hubs' },
        ],
        reviews: generateMockReviews('prod_8', 7),
        tags: ['travel', 'japan', 'vacation', 'culture'],
        galleryImages: [
            'https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
        ],
        promotion: { type: 'discount', value: 10 },
        aiPersonalizationScore: 0.96,
    },
];

// SECTION: State Management (Reducer)
// ============================================================================

const initialState: MarketplaceState = {
    allProducts: [],
    filteredProducts: [],
    isLoading: true,
    error: null,
    filters: {
        searchQuery: '',
        priceRange: { min: 0, max: 2000 },
        categories: [],
        brands: [],
        minRating: 0,
    },
    sortBy: 'relevance',
    currentPage: 1,
    itemsPerPage: 9,
    selectedProduct: null,
    isDetailModalOpen: false,
    wishlist: [],
    comparisonList: [],
    cart: [],
    isCartOpen: false,
    isComparisonViewOpen: false,
    toastNotification: null,
};

function marketplaceReducer(state: MarketplaceState, action: MarketplaceAction): MarketplaceState {
    switch (action.type) {
        case 'FETCH_INIT':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_SUCCESS':
            return { ...state, isLoading: false, allProducts: action.payload };
        case 'FETCH_FAILURE':
            return { ...state, isLoading: false, error: action.payload };
        case 'SET_FILTERS':
            return { ...state, filters: { ...state.filters, ...action.payload }, currentPage: 1 };
        case 'SET_SORT':
            return { ...state, sortBy: action.payload };
        case 'SET_PAGE':
            return { ...state, currentPage: action.payload };
        case 'OPEN_PRODUCT_MODAL':
            return { ...state, isDetailModalOpen: true, selectedProduct: action.payload };
        case 'CLOSE_PRODUCT_MODAL':
            return { ...state, isDetailModalOpen: false, selectedProduct: null };
        case 'TOGGLE_WISHLIST': {
            const newWishlist = state.wishlist.includes(action.payload)
                ? state.wishlist.filter(id => id !== action.payload)
                : [...state.wishlist, action.payload];
            return { ...state, wishlist: newWishlist };
        }
        case 'TOGGLE_COMPARISON': {
            let newComparisonList = [...state.comparisonList];
            if (newComparisonList.includes(action.payload)) {
                newComparisonList = newComparisonList.filter(id => id !== action.payload);
            } else if (newComparisonList.length < 4) {
                newComparisonList.push(action.payload);
            }
            return { ...state, comparisonList: newComparisonList };
        }
        case 'CLEAR_COMPARISON':
            return { ...state, comparisonList: [], isComparisonViewOpen: false };
        case 'OPEN_COMPARISON_VIEW':
            return { ...state, isComparisonViewOpen: true };
        case 'CLOSE_COMPARISON_VIEW':
            return { ...state, isComparisonViewOpen: false };
        case 'ADD_TO_CART': {
            const { product, quantity } = action.payload;
            const existingItem = state.cart.find(item => item.productId === product.id);
            let newCart;
            if (existingItem) {
                newCart = state.cart.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newCart = [...state.cart, { productId: product.id, quantity, priceAtTimeOfAddition: product.price }];
            }
            return { ...state, cart: newCart, isCartOpen: true };
        }
        case 'REMOVE_FROM_CART': {
            const newCart = state.cart.filter(item => item.productId !== action.payload);
            return { ...state, cart: newCart };
        }
        case 'UPDATE_CART_QUANTITY': {
            const { productId, quantity } = action.payload;
            const newCart = state.cart.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            ).filter(item => item.quantity > 0);
            return { ...state, cart: newCart };
        }
        case 'CLEAR_CART':
            return { ...state, cart: [] };
        case 'TOGGLE_CART':
            return { ...state, isCartOpen: !state.isCartOpen };
        case 'SHOW_TOAST':
            return { ...state, toastNotification: { ...action.payload, id: Date.now() } };
        case 'HIDE_TOAST':
            return { ...state, toastNotification: null };
        default:
            return state;
    }
}

// SECTION: Helper Hooks and Context
// ============================================================================
const MarketplaceDispatchContext = createContext<React.Dispatch<MarketplaceAction> | null>(null);

/**
 * Custom hook to simulate fetching data from an API.
 */
export const useMarketplaceData = (dispatch: React.Dispatch<MarketplaceAction>) => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useMarketplaceData must be used within a DataProvider.");

    useEffect(() => {
        dispatch({ type: 'FETCH_INIT' });
        // Simulate API call
        const timer = setTimeout(() => {
            try {
                // In a real app, this would be an actual API call, and we wouldn't need MOCK_PRODUCTS.
                // We'd use `fetchMarketplaceProducts` from DataContext.
                // For this enhanced version, we use our detailed mock data.
                dispatch({ type: 'FETCH_SUCCESS', payload: MOCK_PRODUCTS });
            } catch (error) {
                dispatch({ type: 'FETCH_FAILURE', payload: 'Failed to load products.' });
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [dispatch]);
};

/**
 * Custom hook for memoized filtering and sorting logic.
 */
export const useFilteredProducts = (state: MarketplaceState) => {
    return useMemo(() => {
        let products = [...state.allProducts];

        // Filtering
        if (state.filters.searchQuery) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(state.filters.searchQuery.toLowerCase()) ||
                p.brand.toLowerCase().includes(state.filters.searchQuery.toLowerCase()) ||
                p.tags.some(t => t.toLowerCase().includes(state.filters.searchQuery.toLowerCase()))
            );
        }
        if (state.filters.categories.length > 0) {
            products = products.filter(p => state.filters.categories.includes(p.category));
        }
        if (state.filters.brands.length > 0) {
            products = products.filter(p => state.filters.brands.includes(p.brand));
        }
        products = products.filter(p => p.price >= state.filters.priceRange.min && p.price <= state.filters.priceRange.max);
        products = products.filter(p => p.averageRating >= state.filters.minRating);

        // Sorting
        switch (state.sortBy) {
            case 'relevance':
                products.sort((a, b) => b.aiPersonalizationScore - a.aiPersonalizationScore);
                break;
            case 'price_asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'name_asc':
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name_desc':
                products.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'rating_desc':
                products.sort((a, b) => b.averageRating - a.averageRating);
                break;
        }

        return products;
    }, [state.allProducts, state.filters, state.sortBy]);
};


// SECTION: Child Components
// ============================================================================
// For a real-world app, these would be in separate files.
// For this exercise, they are included here as requested.

export const StarRating: React.FC<{ rating: number, size?: 'sm' | 'md' | 'lg' }> = ({ rating, size = 'md' }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const starSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <svg key={`full-${i}`} className={`${starSize} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ))}
            {halfStar && (
                <svg className={`${starSize} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <svg key={`empty-${i}`} className={`${starSize} text-gray-600`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ))}
        </div>
    );
};

export const FilterSidebar: React.FC<{ state: MarketplaceState }> = ({ state }) => {
    const dispatch = useContext(MarketplaceDispatchContext)!;
    const { allProducts } = state;

    const availableCategories = useMemo(() => [...new Set(allProducts.map(p => p.category))], [allProducts]);
    const availableBrands = useMemo(() => [...new Set(allProducts.map(p => p.brand))], [allProducts]);

    const handleCategoryChange = (category: ProductCategory) => {
        const newCategories = state.filters.categories.includes(category)
            ? state.filters.categories.filter(c => c !== category)
            : [...state.filters.categories, category];
        dispatch({ type: 'SET_FILTERS', payload: { categories: newCategories } });
    };

    const handleBrandChange = (brand: string) => {
        const newBrands = state.filters.brands.includes(brand)
            ? state.filters.brands.filter(b => b !== brand)
            : [...state.filters.brands, brand];
        dispatch({ type: 'SET_FILTERS', payload: { brands: newBrands } });
    };
    
    return (
        <Card className="p-4 space-y-6 sticky top-24">
            <h3 className="text-xl font-bold text-white">Filters</h3>
            
            {/* Price Range */}
            <div>
                <label className="text-gray-300 font-semibold">Price Range</label>
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-gray-400">${state.filters.priceRange.min}</span>
                    <input
                        type="range"
                        min="0"
                        max="2000"
                        step="50"
                        value={state.filters.priceRange.max}
                        onChange={(e) => dispatch({type: 'SET_FILTERS', payload: {priceRange: {min: state.filters.priceRange.min, max: parseInt(e.target.value)}}})}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-gray-400">${state.filters.priceRange.max}</span>
                </div>
            </div>

            {/* Categories */}
            <div>
                <h4 className="text-gray-300 font-semibold">Category</h4>
                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                    {availableCategories.map(cat => (
                        <div key={cat} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`cat-${cat}`}
                                checked={state.filters.categories.includes(cat)}
                                onChange={() => handleCategoryChange(cat)}
                                className="h-4 w-4 rounded border-gray-600 text-cyan-600 bg-gray-800 focus:ring-cyan-500"
                            />
                            <label htmlFor={`cat-${cat}`} className="ml-2 text-gray-400">{cat}</label>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Brands */}
            <div>
                <h4 className="text-gray-300 font-semibold">Brand</h4>
                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                    {availableBrands.map(brand => (
                        <div key={brand} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`brand-${brand}`}
                                checked={state.filters.brands.includes(brand)}
                                onChange={() => handleBrandChange(brand)}
                                className="h-4 w-4 rounded border-gray-600 text-cyan-600 bg-gray-800 focus:ring-cyan-500"
                            />
                            <label htmlFor={`brand-${brand}`} className="ml-2 text-gray-400">{brand}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rating */}
            <div>
                <h4 className="text-gray-300 font-semibold">Minimum Rating</h4>
                <div className="flex space-x-2 mt-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                        <button 
                            key={rating}
                            onClick={() => dispatch({type: 'SET_FILTERS', payload: {minRating: rating}})}
                            className={`flex items-center px-2 py-1 rounded-md text-sm ${state.filters.minRating === rating ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {rating} <svg className="h-4 w-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export const EnhancedProductCard: React.FC<{ product: EnhancedMarketplaceProduct, state: MarketplaceState }> = ({ product, state }) => {
    const dispatch = useContext(MarketplaceDispatchContext)!;
    const { wishlist, comparisonList } = state;
    const isInWishlist = wishlist.includes(product.id);
    const isInComparison = comparisonList.includes(product.id);

    return (
        <Card className="flex flex-col group transition-all duration-300 hover:shadow-cyan-500/20 hover:shadow-lg hover:-translate-y-1">
            <div className="relative">
                <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-t-xl" />
                {product.promotion && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {product.promotion.type === 'discount' ? `${product.promotion.value}% OFF` : 'BOGO'}
                    </div>
                )}
                <div className="absolute top-2 left-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => dispatch({type: 'TOGGLE_WISHLIST', payload: product.id})} className={`p-2 rounded-full backdrop-blur-sm ${isInWishlist ? 'bg-red-500/80' : 'bg-gray-900/50 hover:bg-red-500/80'}`}>
                        <svg className="h-5 w-5 text-white" fill={isInWishlist ? 'currentColor': 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                    </button>
                    <button onClick={() => dispatch({type: 'TOGGLE_COMPARISON', payload: product.id})} className={`p-2 rounded-full backdrop-blur-sm ${isInComparison ? 'bg-cyan-500/80' : 'bg-gray-900/50 hover:bg-cyan-500/80'}`}>
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </button>
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">{product.brand}</span>
                <h3 className="text-lg font-semibold text-white mt-1 cursor-pointer hover:text-cyan-400" onClick={() => dispatch({type: 'OPEN_PRODUCT_MODAL', payload: product})}>{product.name}</h3>
                <div className="flex items-center my-2">
                    <StarRating rating={product.averageRating} size="sm" />
                    <span className="text-xs text-gray-500 ml-2">({product.reviewCount} reviews)</span>
                </div>
                <p className="text-sm text-gray-400 flex-grow mt-1">{product.aiJustification}</p>
                <div className="flex justify-between items-center mt-4">
                    <p className="font-mono text-xl text-cyan-300">${product.price.toFixed(2)}</p>
                    <button onClick={() => {
                        dispatch({type: 'ADD_TO_CART', payload: { product, quantity: 1 }});
                        dispatch({ type: 'SHOW_TOAST', payload: { message: `${product.name} added to cart!`, type: 'success' } });
                    }} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Add to Cart</button>
                </div>
            </div>
        </Card>
    );
};


export const ProductDetailModal: React.FC<{ product: EnhancedMarketplaceProduct | null }> = ({ product }) => {
    const dispatch = useContext(MarketplaceDispatchContext)!;
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
    const [quantity, setQuantity] = useState(1);
    const modalRef = useRef<HTMLDivElement>(null);

    const handleClose = () => dispatch({ type: 'CLOSE_PRODUCT_MODAL' });

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div ref={modalRef} className="relative bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl shadow-cyan-900/20" onClick={e => e.stopPropagation()}>
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                
                {/* Image Gallery */}
                <div className="w-full md:w-1/2 p-4">
                    <img src={product.galleryImages[0]} alt={product.name} className="w-full h-auto rounded-xl object-cover" />
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {product.galleryImages.map((img, i) => (
                            <img key={i} src={img} alt={`${product.name} gallery image ${i+1}`} className="w-full h-20 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-cyan-500" />
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="w-full md:w-1/2 p-6 flex flex-col">
                    <span className="text-sm text-gray-400 font-semibold tracking-wider uppercase">{product.brand}</span>
                    <h2 className="text-3xl font-bold text-white mt-1">{product.name}</h2>
                    <div className="flex items-center my-3">
                        <StarRating rating={product.averageRating} />
                        <a href="#reviews" onClick={() => setActiveTab('reviews')} className="text-sm text-cyan-400 hover:underline ml-3">{product.reviewCount} reviews</a>
                    </div>
                    <p className="font-mono text-3xl text-cyan-300">${product.price.toFixed(2)}</p>

                    <div className="border-b border-gray-700 my-4">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setActiveTab('description')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'description' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Description</button>
                            <button onClick={() => setActiveTab('specs')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'specs' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Specs</button>
                            <button onClick={() => setActiveTab('reviews')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Reviews</button>
                        </nav>
                    </div>

                    <div className="flex-grow overflow-y-auto pr-2">
                        {activeTab === 'description' && (
                            <div>
                                <h4 className="font-semibold text-white text-lg">Plato's Recommendation</h4>
                                <p className="text-gray-300 mt-2">{product.aiJustification}</p>
                                <h4 className="font-semibold text-white text-lg mt-4">Product Details</h4>
                                <p className="text-gray-400 mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                            </div>
                        )}
                        {activeTab === 'specs' && (
                            <ul className="space-y-2">
                                {product.specifications.map(spec => (
                                    <li key={spec.key} className="flex justify-between text-sm">
                                        <span className="text-gray-400">{spec.key}</span>
                                        <span className="text-white font-medium">{spec.value}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {activeTab === 'reviews' && (
                            <div id="reviews" className="space-y-4">
                                {product.reviews.map(review => (
                                    <div key={review.id} className="border-b border-gray-800 pb-3">
                                        <div className="flex items-center">
                                            <img src={review.avatarUrl} alt={review.author} className="h-8 w-8 rounded-full" />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-white">{review.author}</p>
                                                <StarRating rating={review.rating} size="sm" />
                                            </div>
                                        </div>
                                        <h5 className="font-semibold text-gray-200 mt-2">{review.title}</h5>
                                        <p className="text-sm text-gray-400">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 flex items-center space-x-4">
                        <div className="flex items-center border border-gray-600 rounded-lg">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-400 hover:text-white">-</button>
                            <span className="px-3 py-2 text-white">{quantity}</span>
                            <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-gray-400 hover:text-white">+</button>
                        </div>
                        <button onClick={() => {
                            dispatch({type: 'ADD_TO_CART', payload: { product, quantity }});
                            dispatch({ type: 'SHOW_TOAST', payload: { message: `${quantity} x ${product.name} added to cart!`, type: 'success' } });
                            handleClose();
                        }} className="flex-grow px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ShoppingCartSidebar: React.FC<{ state: MarketplaceState }> = ({ state }) => {
    const dispatch = useContext(MarketplaceDispatchContext)!;
    const { isCartOpen, cart, allProducts } = state;

    const cartDetails = useMemo(() => {
        return cart.map(item => {
            const product = allProducts.find(p => p.id === item.productId);
            return { ...item, product };
        }).filter(item => item.product); // Filter out items where product not found
    }, [cart, allProducts]);

    const subtotal = useMemo(() => {
        return cartDetails.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0);
    }, [cartDetails]);

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => dispatch({ type: 'TOGGLE_CART' })}>
            <div 
                className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">Shopping Cart</h3>
                    <button onClick={() => dispatch({ type: 'TOGGLE_CART' })} className="text-gray-400 hover:text-white"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>

                {cartDetails.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
                        <svg className="h-24 w-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <p>Your cart is empty.</p>
                    </div>
                ) : (
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {cartDetails.map(item => (
                            <div key={item.productId} className="flex items-start">
                                <img src={item.product!.imageUrl} alt={item.product!.name} className="w-16 h-16 object-cover rounded-md" />
                                <div className="ml-4 flex-grow">
                                    <p className="text-white font-semibold">{item.product!.name}</p>
                                    <p className="text-sm text-gray-400">${item.product!.price.toFixed(2)}</p>
                                    <div className="flex items-center mt-2">
                                        <button onClick={() => dispatch({type: 'UPDATE_CART_QUANTITY', payload: {productId: item.productId, quantity: item.quantity-1}})} className="px-2 py-0.5 border border-gray-600 rounded text-gray-400">-</button>
                                        <span className="px-3 text-white">{item.quantity}</span>
                                        <button onClick={() => dispatch({type: 'UPDATE_CART_QUANTITY', payload: {productId: item.productId, quantity: item.quantity+1}})} className="px-2 py-0.5 border border-gray-600 rounded text-gray-400">+</button>
                                    </div>
                                </div>
                                <button onClick={() => dispatch({type: 'REMOVE_FROM_CART', payload: item.productId})} className="text-gray-500 hover:text-red-500 ml-4"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                        ))}
                    </div>
                )}
                
                {cartDetails.length > 0 && (
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex justify-between items-center text-lg">
                            <span className="text-gray-300">Subtotal:</span>
                            <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
                        </div>
                        <button className="w-full mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold">Checkout</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ToastNotification: React.FC<{ notification: MarketplaceState['toastNotification'] }> = ({ notification }) => {
    const dispatch = useContext(MarketplaceDispatchContext)!;

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                dispatch({ type: 'HIDE_TOAST' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification, dispatch]);

    if (!notification) return null;

    const colors = {
        success: 'bg-green-600 border-green-500',
        error: 'bg-red-600 border-red-500',
        info: 'bg-blue-600 border-blue-500'
    };

    return (
        <div className={`fixed bottom-5 right-5 p-4 rounded-lg text-white text-sm font-medium z-50 border-l-4 ${colors[notification.type]}`}>
            {notification.message}
        </div>
    );
};


// SECTION: Main View Component
// ============================================================================

const MarketplaceView: React.FC = () => {
    const dataContext = useContext(DataContext);
    if (!dataContext) throw new Error("MarketplaceView must be within a DataProvider.");
    
    const [state, dispatch] = useReducer(marketplaceReducer, initialState);
    
    // Connect to data fetching hook
    useMarketplaceData(dispatch);

    // Get the filtered and sorted products
    const filteredAndSortedProducts = useFilteredProducts(state);
    
    // Pagination logic
    const pageCount = Math.ceil(filteredAndSortedProducts.length / state.itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        return filteredAndSortedProducts.slice(startIndex, startIndex + state.itemsPerPage);
    }, [filteredAndSortedProducts, state.currentPage, state.itemsPerPage]);

    const { addProductToTransactions } = dataContext;

    const handleBuy = (product: MarketplaceProduct) => {
        addProductToTransactions(product);
        dispatch({ type: 'SHOW_TOAST', payload: { message: `${product.name} purchased!`, type: 'success' } });
    };

    const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <MarketplaceDispatchContext.Provider value={dispatch}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-wider">Plato's Marketplace</h2>
                        <p className="text-gray-400 mt-1">AI-curated products and services, just for you.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => dispatch({type: 'TOGGLE_CART'})} className="relative text-gray-300 hover:text-white">
                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            {cartItemCount > 0 && <span className="absolute -top-1 -right-2 bg-cyan-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    <div className="lg:col-span-1">
                        <FilterSidebar state={state} />
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <Card>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                               <div className="relative w-full md:w-1/2">
                                   <input
                                       type="text"
                                       placeholder="Search for products..."
                                       value={state.filters.searchQuery}
                                       onChange={(e) => dispatch({type: 'SET_FILTERS', payload: {searchQuery: e.target.value}})}
                                       className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-cyan-500 focus:border-cyan-500"
                                   />
                                   <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                               </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-400 text-sm">Sort by:</span>
                                    <select
                                        value={state.sortBy}
                                        onChange={e => dispatch({type: 'SET_SORT', payload: e.target.value as SortKey})}
                                        className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-2"
                                    >
                                        <option value="relevance">Relevance</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="name_asc">Name: A-Z</option>
                                        <option value="name_desc">Name: Z-A</option>
                                        <option value="rating_desc">Highest Rating</option>
                                    </select>
                                </div>
                            </div>
                        </Card>
                    
                        {state.isLoading ? (
                            <div className="flex flex-col items-center justify-center h-96">
                                 <div className="relative w-24 h-24"><div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div><div className="absolute inset-4 border-4 border-t-cyan-500 border-transparent rounded-full animate-spin"></div></div>
                                 <p className="text-white text-lg mt-6 font-semibold animate-pulse">Plato is curating your products...</p>
                            </div>
                        ) : state.error ? (
                             <div className="text-center py-20 text-red-400">
                                <p>Error: {state.error}</p>
                            </div>
                        ) : paginatedProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {paginatedProducts.map(product => (
                                        <EnhancedProductCard key={product.id} product={product} state={state}/>
                                    ))}
                                </div>
                                <div className="flex justify-center items-center pt-6">
                                    <button onClick={() => dispatch({type: 'SET_PAGE', payload: state.currentPage - 1})} disabled={state.currentPage === 1} className="px-4 py-2 bg-gray-700 text-white rounded-l-lg disabled:opacity-50 hover:bg-gray-600">Prev</button>
                                    <span className="px-4 py-2 bg-gray-800 text-white">Page {state.currentPage} of {pageCount}</span>
                                    <button onClick={() => dispatch({type: 'SET_PAGE', payload: state.currentPage + 1})} disabled={state.currentPage === pageCount} className="px-4 py-2 bg-gray-700 text-white rounded-r-lg disabled:opacity-50 hover:bg-gray-600">Next</button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <p>No products match your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {state.isDetailModalOpen && <ProductDetailModal product={state.selectedProduct} />}
                <ShoppingCartSidebar state={state} />
                <ToastNotification notification={state.toastNotification} />
            </div>
        </MarketplaceDispatchContext.Provider>
    );
};

export default MarketplaceView;