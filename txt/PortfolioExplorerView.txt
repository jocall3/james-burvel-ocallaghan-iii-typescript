// components/views/personal/PortfolioExplorerView.tsx
import React, { useContext, useMemo, useState, useEffect, useCallback, useReducer, createContext, FC, ReactNode } from 'react';
import Card from '../../Card';
import { DataContext } from '../../../context/DataContext';
import { PortfolioAsset } from '../../../types';
// FIX: Imported 'Cell' from recharts to be used inside the Treemap component.
import { ResponsiveContainer, Treemap, Tooltip, Cell, PieChart, Pie, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, ComposedChart, Area } from 'recharts';
import { FaFileCsv, FaFilePdf, FaCog, FaChartLine, FaChartPie, FaTable, FaSearch, FaFilter, FaSync, FaExclamationTriangle, FaInfoCircle, FaCalendarAlt, FaStar, FaRegStar } from 'react-icons/fa';

// --- ENHANCED TYPES AND CONSTANTS FOR REAL-WORLD APPLICATION ---

const ASSET_CLASSES = ['All', 'Equities', 'Fixed Income', 'Alternatives', 'Digital Assets', 'Cash & Equivalents', 'Real Estate', 'Commodities'];
const REGIONS = ['All', 'North America', 'Europe', 'Asia', 'Emerging Markets', 'Global', 'Latin America', 'Africa & Middle East'];
const SECTORS = ['All', 'Technology', 'Healthcare', 'Financials', 'Consumer Discretionary', 'Consumer Staples', 'Industrials', 'Energy', 'Utilities', 'Real Estate', 'Materials', 'Communication Services'];
const MARKET_CAP_BANDS = ['All', 'Mega-Cap (> $200B)', 'Large-Cap ($10B - $200B)', 'Mid-Cap ($2B - $10B)', 'Small-Cap ($300M - $2B)', 'Micro-Cap (< $300M)'];
const CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'CAD', 'CHF', 'AUD', 'CNY'];
const RISK_LEVELS = ['All', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];

type SortKey = 'name' | 'value' | 'change24h' | 'assetClass' | 'region' | 'sector' | 'marketCap' | 'peRatio' | 'dividendYield' | 'ytdReturn';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'treemap' | 'table' | 'allocation' | 'performance' | 'analysis';
type AllocationChartType = 'assetClass' | 'region' | 'sector';
type PerformanceTimeframe = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | 'YTD' | 'MAX';

export interface EnhancedPortfolioAsset extends PortfolioAsset {
    sector: string;
    marketCap: number; // in USD
    currency: string;
    peRatio?: number;
    dividendYield?: number;
    beta?: number;
    ytdReturn: number;
    riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
    analystRating?: number; // 1 to 5
    isWatchlisted: boolean;
}

export interface Transaction {
    id: string;
    assetId: string;
    type: 'buy' | 'sell';
    date: string; // ISO 8601
    quantity: number;
    price: number; // price per unit in asset's currency
    fees: number;
    notes?: string;
}

export interface HistoricalDataPoint {
    date: string; // YYYY-MM-DD
    value: number;
}

export interface NewsArticle {
    id: string;
    source: string;
    headline: string;
    summary: string;
    url: string;
    publishedAt: string; // ISO 8601
}

export interface PortfolioMetrics {
    beta: number;
    sharpeRatio: number;
    standardDeviation: number;
    bestPerformer: { name: string; change: number; };
    worstPerformer: { name: string; change: number; };
}

export interface ScenarioResult {
    scenarioName: string;
    projectedReturn: number; // percentage
    projectedValueChange: number; // USD
    confidence: number; // 0 to 1
}

// --- MOCK API SERVICE ---

export class MockFinancialDataService {
    private static latency = (ms: number) => new Promise(res => setTimeout(res, ms));

    static async fetchAssetDetails(assetId: string): Promise<{ transactions: Transaction[], news: NewsArticle[], notes: string }> {
        await this.latency(800);
        console.log(`Fetching details for asset ${assetId}...`);
        // In a real app, this would be a network request
        if (Math.random() < 0.05) {
            throw new Error("Failed to fetch asset details. Network error.");
        }
        return {
            transactions: Array.from({ length: Math.floor(Math.random() * 20) + 1 }, (_, i) => ({
                id: `txn_${assetId}_${i}`,
                assetId,
                type: Math.random() > 0.4 ? 'buy' : 'sell',
                date: new Date(Date.now() - Math.random() * 3e10).toISOString(),
                quantity: Math.random() * 100,
                price: Math.random() * 500 + 10,
                fees: Math.random() * 5,
            })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            news: Array.from({ length: 5 }, (_, i) => ({
                id: `news_${assetId}_${i}`,
                source: ['Reuters', 'Bloomberg', 'WSJ', 'Financial Times'][Math.floor(Math.random() * 4)],
                headline: `Major News Regarding Asset ${assetId}`,
                summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                url: '#',
                publishedAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
            })),
            notes: "User notes for this asset go here. Can be used to track investment thesis, price targets, etc."
        };
    }

    static async fetchHistoricalData(assetId: string, timeframe: PerformanceTimeframe): Promise<HistoricalDataPoint[]> {
        await this.latency(1200);
        console.log(`Fetching historical data for asset ${assetId} over ${timeframe}`);

        const days = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365, '5Y': 1825, 'YTD': new Date().getMonth() * 30, 'MAX': 3650 }[timeframe];
        const data: HistoricalDataPoint[] = [];
        let value = Math.random() * 1000 + 100;
        for (let i = days; i > 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            value += (Math.random() - 0.49) * (value * 0.05); // Random walk
            value = Math.max(value, 1); // Ensure value doesn't go below 1
            data.push({
                date: date.toISOString().split('T')[0],
                value,
            });
        }
        return data;
    }
    
    static async runPortfolioAnalysis(assets: EnhancedPortfolioAsset[]): Promise<{ metrics: PortfolioMetrics, correlationMatrix: number[][] }> {
        await this.latency(2000);
        console.log(`Running analysis on ${assets.length} assets...`);
        if (!assets.length) {
            return {
                metrics: { beta: 0, sharpeRatio: 0, standardDeviation: 0, bestPerformer: { name: 'N/A', change: 0 }, worstPerformer: { name: 'N/A', change: 0 } },
                correlationMatrix: [],
            };
        }
        const sortedByChange = [...assets].sort((a,b) => b.change24h - a.change24h);
        const metrics: PortfolioMetrics = {
            beta: Math.random() * 0.5 + 0.8, // Simulate a plausible portfolio beta
            sharpeRatio: Math.random() * 1.5 + 0.5,
            standardDeviation: Math.random() * 10 + 5,
            bestPerformer: { name: sortedByChange[0].name, change: sortedByChange[0].change24h },
            worstPerformer: { name: sortedByChange[sortedByChange.length - 1].name, change: sortedByChange[sortedByChange.length - 1].change24h },
        };
        const correlationMatrix = assets.map(() => 
            assets.map(() => parseFloat((Math.random() * 2 - 1).toFixed(2)))
        );
        assets.forEach((_, i) => correlationMatrix[i][i] = 1);

        return { metrics, correlationMatrix };
    }
    
    static async runStressTest(assets: EnhancedPortfolioAsset[], scenario: string): Promise<ScenarioResult> {
        await this.latency(2500);
        console.log(`Running stress test for scenario: ${scenario}`);
        const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
        let projectedReturn;
        switch (scenario) {
            case 'Market Crash (-20%)': projectedReturn = -20 + (Math.random() * 5 - 2.5); break;
            case 'Interest Rate Hike': projectedReturn = -5 + (Math.random() * 4 - 2); break;
            case 'Tech Bubble Burst': projectedReturn = -15 + (Math.random() * 6 - 3); break;
            default: projectedReturn = 0;
        }
        return {
            scenarioName: scenario,
            projectedReturn: projectedReturn,
            projectedValueChange: totalValue * (projectedReturn / 100),
            confidence: Math.random() * 0.2 + 0.75,
        };
    }
}


// --- STATE MANAGEMENT (useReducer) ---

type ExplorerState = {
    // Filters
    assetClassFilter: string;
    regionFilter: string;
    sectorFilter: string;
    marketCapFilter: string;
    riskLevelFilter: string;
    searchQuery: string;
    
    // Sorting
    sortConfig: { key: SortKey; direction: SortDirection };
    
    // UI State
    viewMode: ViewMode;
    isFiltersVisible: boolean;
    isSettingsVisible: boolean;
    
    // Data & Async State
    isLoading: boolean;
    error: string | null;
    analysisData: { metrics: PortfolioMetrics | null; correlationMatrix: number[][] | null; };
    isAnalysisRunning: boolean;
    
    // Asset Detail Modal
    selectedAsset: EnhancedPortfolioAsset | null;
    isModalOpen: boolean;
    modalData: {
        transactions: Transaction[];
        news: NewsArticle[];
        notes: string;
        historicalData: HistoricalDataPoint[];
    } | null;
    isModalLoading: boolean;
    modalError: string | null;
    
    // Watchlist
    watchlist: Set<string>;
};

type ExplorerAction =
    | { type: 'SET_FILTER'; payload: { filter: keyof ExplorerState; value: string } }
    | { type: 'SET_SORT'; payload: SortKey }
    | { type: 'SET_VIEW_MODE'; payload: ViewMode }
    | { type: 'TOGGLE_VISIBILITY'; payload: 'filters' | 'settings' }
    | { type: 'OPEN_ASSET_MODAL'; payload: EnhancedPortfolioAsset }
    | { type: 'CLOSE_ASSET_MODAL' }
    | { type: 'FETCH_MODAL_DATA_START' }
    | { type: 'FETCH_MODAL_DATA_SUCCESS'; payload: Exclude<ExplorerState['modalData'], null> }
    | { type: 'FETCH_MODAL_DATA_FAILURE'; payload: string }
    | { type: 'UPDATE_ASSET_NOTES'; payload: string }
    | { type: 'RUN_ANALYSIS_START' }
    | { type: 'RUN_ANALYSIS_SUCCESS'; payload: { metrics: PortfolioMetrics, correlationMatrix: number[][] } }
    | { type: 'RUN_ANALYSIS_FAILURE'; payload: string }
    | { type: 'TOGGLE_WATCHLIST'; payload: string };


export const initialState: ExplorerState = {
    assetClassFilter: 'All',
    regionFilter: 'All',
    sectorFilter: 'All',
    marketCapFilter: 'All',
    riskLevelFilter: 'All',
    searchQuery: '',
    sortConfig: { key: 'value', direction: 'desc' },
    viewMode: 'treemap',
    isFiltersVisible: true,
    isSettingsVisible: false,
    isLoading: false,
    error: null,
    analysisData: { metrics: null, correlationMatrix: null },
    isAnalysisRunning: false,
    selectedAsset: null,
    isModalOpen: false,
    modalData: null,
    isModalLoading: false,
    modalError: null,
    watchlist: new Set(),
};

export function explorerReducer(state: ExplorerState, action: ExplorerAction): ExplorerState {
    switch (action.type) {
        case 'SET_FILTER':
            const filterKey = action.payload.filter as keyof ExplorerState;
            return { ...state, [filterKey]: action.payload.value };
        case 'SET_SORT':
            const newDirection = state.sortConfig.key === action.payload && state.sortConfig.direction === 'desc' ? 'asc' : 'desc';
            return { ...state, sortConfig: { key: action.payload, direction: newDirection } };
        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.payload };
        case 'TOGGLE_VISIBILITY':
            if (action.payload === 'filters') return { ...state, isFiltersVisible: !state.isFiltersVisible };
            if (action.payload === 'settings') return { ...state, isSettingsVisible: !state.isSettingsVisible };
            return state;
        case 'OPEN_ASSET_MODAL':
            return { ...state, isModalOpen: true, selectedAsset: action.payload, modalError: null };
        case 'CLOSE_ASSET_MODAL':
            return { ...state, isModalOpen: false, selectedAsset: null, modalData: null };
        case 'FETCH_MODAL_DATA_START':
            return { ...state, isModalLoading: true };
        case 'FETCH_MODAL_DATA_SUCCESS':
            return { ...state, isModalLoading: false, modalData: action.payload };
        case 'FETCH_MODAL_DATA_FAILURE':
            return { ...state, isModalLoading: false, modalError: action.payload };
        case 'UPDATE_ASSET_NOTES':
             if (!state.modalData) return state;
             return { ...state, modalData: { ...state.modalData, notes: action.payload } };
        case 'RUN_ANALYSIS_START':
            return { ...state, isAnalysisRunning: true };
        case 'RUN_ANALYSIS_SUCCESS':
            return { ...state, isAnalysisRunning: false, analysisData: action.payload };
        case 'RUN_ANALYSIS_FAILURE':
            return { ...state, isAnalysisRunning: false, error: action.payload };
        case 'TOGGLE_WATCHLIST':
            const newWatchlist = new Set(state.watchlist);
            if (newWatchlist.has(action.payload)) {
                newWatchlist.delete(action.payload);
            } else {
                newWatchlist.add(action.payload);
            }
            return { ...state, watchlist: newWatchlist };
        default:
            return state;
    }
}

// --- HELPER FUNCTIONS ---

export const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(value);
};

export const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
};

export const getColorForChange = (change: number) => {
    if (change > 2) return '#10b981';   // Strong green
    if (change > 0) return '#34d399';    // Green
    if (change === 0) return '#6b7280'; // Gray
    if (change < -2) return '#ef4444'; // Strong red
    return '#f87171';     // Red
};

export const getMarketCapBand = (marketCap: number): string => {
    if (marketCap > 200e9) return 'Mega-Cap (> $200B)';
    if (marketCap > 10e9) return 'Large-Cap ($10B - $200B)';
    if (marketCap > 2e9) return 'Mid-Cap ($2B - $10B)';
    if (marketCap > 300e6) return 'Small-Cap ($300M - $2B)';
    return 'Micro-Cap (< $300M)';
}

// --- REUSABLE UI COMPONENTS ---

export const ToolbarButton: FC<{ icon: React.ElementType, label: string, onClick?: () => void, isActive?: boolean, disabled?: boolean }> = ({ icon: Icon, label, onClick, isActive, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={label}
    >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
    </button>
);

export const LoadingSpinner: FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
    return (
        <div className="flex justify-center items-center">
            <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-400`}></div>
        </div>
    );
};

export const ErrorDisplay: FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
        <FaExclamationTriangle className="inline-block mr-2" />
        <span className="block sm:inline">{message}</span>
    </div>
);

export const SkeletonLoader: FC<{ className?: string }> = ({ className = "h-4 bg-gray-700 rounded w-3/4" }) => (
    <div className={`animate-pulse ${className}`}></div>
);


// --- CUSTOM CONTENT RENDERERS & TOOLTIPS ---

export const CustomTreemapContent = (props: any) => {
    const { depth, x, y, width, height, index, name, value, change24h, sector } = props;
    const isRoot = depth === 0;

    if (isRoot || width < 60 || height < 40) return null;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: 'transparent',
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 0.5 / (depth + 1e-10),
                }}
            />
            <foreignObject x={x + 5} y={y + 5} width={width - 10} height={height - 10}>
                <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between', 
                    color: 'white',
                    fontSize: '12px',
                    overflow: 'hidden'
                }}>
                    <div>
                      <div className="font-bold truncate text-sm">{name}</div>
                      <div className="text-xs text-gray-300 truncate">{sector}</div>
                    </div>
                    <div>
                        <div className="font-mono text-base">{formatCurrency(value)}</div>
                        <div className={`font-mono text-sm ${change24h >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </foreignObject>
        </g>
    );
};

export const CustomChartTooltip: FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800/90 border border-gray-600 p-3 rounded-lg shadow-lg">
                <p className="label text-gray-300">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color }} className="intro font-medium">
                        {`${pld.name}: ${formatCurrency(pld.value)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};


// --- ADVANCED SUB-COMPONENTS ---

export const AdvancedFilters: FC<{ state: ExplorerState; dispatch: React.Dispatch<ExplorerAction> }> = ({ state, dispatch }) => {
    const handleFilterChange = (filter: keyof ExplorerState, value: string) => {
        dispatch({ type: 'SET_FILTER', payload: { filter, value } });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
                <label className="text-sm text-gray-400">Asset Class</label>
                <select value={state.assetClassFilter} onChange={e => handleFilterChange('assetClassFilter', e.target.value)} className="w-full mt-1 bg-gray-700/50 border-gray-600 rounded p-2 text-white">
                    {ASSET_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm text-gray-400">Region</label>
                <select value={state.regionFilter} onChange={e => handleFilterChange('regionFilter', e.target.value)} className="w-full mt-1 bg-gray-700/50 border-gray-600 rounded p-2 text-white">
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm text-gray-400">Sector</label>
                <select value={state.sectorFilter} onChange={e => handleFilterChange('sectorFilter', e.target.value)} className="w-full mt-1 bg-gray-700/50 border-gray-600 rounded p-2 text-white">
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm text-gray-400">Market Cap</label>
                <select value={state.marketCapFilter} onChange={e => handleFilterChange('marketCapFilter', e.target.value)} className="w-full mt-1 bg-gray-700/50 border-gray-600 rounded p-2 text-white">
                    {MARKET_CAP_BANDS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm text-gray-400">Risk Level</label>
                <select value={state.riskLevelFilter} onChange={e => handleFilterChange('riskLevelFilter', e.target.value)} className="w-full mt-1 bg-gray-700/50 border-gray-600 rounded p-2 text-white">
                    {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
        </div>
    );
};

export const AssetDetailModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    asset: EnhancedPortfolioAsset | null;
    modalData: ExplorerState['modalData'];
    isLoading: boolean;
    error: string | null;
    dispatch: React.Dispatch<ExplorerAction>;
}> = ({ isOpen, onClose, asset, modalData, isLoading, error, dispatch }) => {
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setActiveTab('overview');
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    if (!isOpen || !asset) return null;

    const tabs = ['overview', 'chart', 'fundamentals', 'transactions', 'news', 'notes'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-white">{asset.name} ({asset.ticker})</h3>
                        <p className="text-gray-400">{asset.assetClass} - {asset.sector} - {asset.region}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </header>
                <div className="flex-grow flex overflow-hidden">
                    <nav className="w-48 border-r border-gray-700 p-4">
                        <ul>
                            {tabs.map(tab => (
                                <li key={tab}>
                                    <button 
                                        onClick={() => setActiveTab(tab)}
                                        className={`w-full text-left p-2 rounded capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
                                    >
                                        {tab}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <main className="flex-grow p-6 overflow-y-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div> :
                         error ? <ErrorDisplay message={error} /> :
                         modalData && (
                            <>
                                {activeTab === 'overview' && (
                                    <div>
                                       <h4 className="text-xl font-semibold text-white mb-4">Overview</h4>
                                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="bg-gray-800/50 p-3 rounded">
                                                <p className="text-sm text-gray-400">Market Value</p>
                                                <p className="text-lg font-mono text-white">{formatCurrency(asset.value)}</p>
                                            </div>
                                            <div className="bg-gray-800/50 p-3 rounded">
                                                <p className="text-sm text-gray-400">24h Change</p>
                                                <p className={`text-lg font-mono ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                                                </p>
                                            </div>
                                             <div className="bg-gray-800/50 p-3 rounded">
                                                <p className="text-sm text-gray-400">YTD Return</p>
                                                <p className={`text-lg font-mono ${asset.ytdReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {asset.ytdReturn >= 0 ? '+' : ''}{asset.ytdReturn.toFixed(2)}%
                                                </p>
                                            </div>
                                       </div>
                                    </div>
                                )}
                                {activeTab === 'chart' && (
                                    <div>
                                       <h4 className="text-xl font-semibold text-white mb-4">Historical Performance</h4>
                                       <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={modalData.historicalData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                                <XAxis dataKey="date" stroke="#a0aec0" />
                                                <YAxis stroke="#a0aec0" tickFormatter={(val) => formatCurrency(val, asset.currency)} />
                                                <Tooltip content={<CustomChartTooltip />} />
                                                <Line type="monotone" dataKey="value" name={asset.ticker} stroke="#3b82f6" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                {activeTab === 'fundamentals' && (
                                    <div>
                                       <h4 className="text-xl font-semibold text-white mb-4">Fundamental Data</h4>
                                       {/* Table of fundamentals */}
                                    </div>
                                )}
                                {activeTab === 'transactions' && (
                                    <div>
                                       <h4 className="text-xl font-semibold text-white mb-4">Transaction History</h4>
                                       <div className="overflow-auto max-h-[60vh]">
                                           <table className="w-full text-sm">
                                               <thead>
                                                    <tr className="text-left text-gray-400">
                                                        <th className="p-2">Date</th>
                                                        <th className="p-2">Type</th>
                                                        <th className="p-2 text-right">Quantity</th>
                                                        <th className="p-2 text-right">Price</th>
                                                        <th className="p-2 text-right">Total</th>
                                                    </tr>
                                               </thead>
                                               <tbody>
                                                   {modalData.transactions.map(tx => (
                                                        <tr key={tx.id} className="border-t border-gray-700">
                                                            <td className="p-2 text-gray-300">{new Date(tx.date).toLocaleDateString()}</td>
                                                            <td className={`p-2 capitalize font-semibold ${tx.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{tx.type}</td>
                                                            <td className="p-2 text-right font-mono text-white">{tx.quantity.toFixed(4)}</td>
                                                            <td className="p-2 text-right font-mono text-white">{formatCurrency(tx.price, asset.currency)}</td>
                                                            <td className="p-2 text-right font-mono text-white">{formatCurrency(tx.price * tx.quantity + tx.fees, asset.currency)}</td>
                                                        </tr>
                                                   ))}
                                               </tbody>
                                           </table>
                                       </div>
                                    </div>
                                )}
                                {activeTab === 'news' && (
                                    <div>
                                       <h4 className="text-xl font-semibold text-white mb-4">Related News</h4>
                                       <ul className="space-y-4">
                                            {modalData.news.map(n => (
                                                <li key={n.id} className="bg-gray-800/50 p-3 rounded-lg">
                                                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">{n.headline}</a>
                                                    <p className="text-sm text-gray-400 mt-1">{n.source} - {new Date(n.publishedAt).toLocaleString()}</p>
                                                    <p className="text-sm text-gray-300 mt-2">{n.summary}</p>
                                                </li>
                                            ))}
                                       </ul>
                                    </div>
                                )}
                                {activeTab === 'notes' && (
                                    <div>
                                       <h4 className="text-xl font-semibold text-white mb-4">My Notes</h4>
                                        <textarea
                                            value={modalData.notes}
                                            onChange={(e) => dispatch({type: 'UPDATE_ASSET_NOTES', payload: e.target.value})}
                                            className="w-full h-64 bg-gray-800 text-white p-3 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Your private notes and analysis for this asset..."
                                        />
                                        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Notes</button>
                                    </div>
                                )}
                            </>
                         )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export const AllocationCharts: FC<{ data: EnhancedPortfolioAsset[] }> = ({ data }) => {
    const [chartType, setChartType] = useState<AllocationChartType>('assetClass');

    const allocationData = useMemo(() => {
        const grouped = data.reduce((acc, asset) => {
            const key = asset[chartType];
            if (!acc[key]) {
                acc[key] = { name: key, value: 0 };
            }
            acc[key].value += asset.value;
            return acc;
        }, {} as { [key: string]: { name: string, value: number } });
        return Object.values(grouped);
    }, [data, chartType]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF', '#19FFFF', '#FFC300'];

    return (
        <Card title="Portfolio Allocation">
            <div className="mb-4 flex justify-center space-x-2">
                <button onClick={() => setChartType('assetClass')} className={`px-3 py-1 rounded ${chartType === 'assetClass' ? 'bg-blue-600' : 'bg-gray-700'}`}>Asset Class</button>
                <button onClick={() => setChartType('region')} className={`px-3 py-1 rounded ${chartType === 'region' ? 'bg-blue-600' : 'bg-gray-700'}`}>Region</button>
                <button onClick={() => setChartType('sector')} className={`px-3 py-1 rounded ${chartType === 'sector' ? 'bg-blue-600' : 'bg-gray-700'}`}>Sector</button>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};

// --- MAIN COMPONENT ---

const PortfolioExplorerView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("PortfolioExplorerView must be within a DataProvider");

    const { portfolioAssets } = context;

    // Enhance original assets with more data for this view
    const enhancedAssets: EnhancedPortfolioAsset[] = useMemo(() => {
        return portfolioAssets.map(asset => ({
            ...asset,
            sector: SECTORS[Math.floor(Math.random() * (SECTORS.length - 1)) + 1],
            marketCap: Math.random() * 500e9 + 1e9,
            currency: 'USD',
            peRatio: Math.random() * 30 + 10,
            dividendYield: Math.random() * 5,
            beta: Math.random() * 1.5 + 0.5,
            ytdReturn: Math.random() * 50 - 15,
            riskLevel: RISK_LEVELS[Math.floor(Math.random() * (RISK_LEVELS.length - 1)) + 1] as any,
            isWatchlisted: Math.random() > 0.8,
        }));
    }, [portfolioAssets]);

    const [state, dispatch] = useReducer(explorerReducer, initialState);
    
    const filteredAssets = useMemo(() => {
        return enhancedAssets
            .filter(asset => state.assetClassFilter === 'All' || asset.assetClass === state.assetClassFilter)
            .filter(asset => state.regionFilter === 'All' || asset.region === state.regionFilter)
            .filter(asset => state.sectorFilter === 'All' || asset.sector === state.sectorFilter)
            .filter(asset => state.riskLevelFilter === 'All' || asset.riskLevel === state.riskLevelFilter)
            .filter(asset => state.marketCapFilter === 'All' || getMarketCapBand(asset.marketCap) === state.marketCapFilter)
            .filter(asset => 
                asset.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                asset.ticker.toLowerCase().includes(state.searchQuery.toLowerCase())
            );
    }, [enhancedAssets, state.assetClassFilter, state.regionFilter, state.sectorFilter, state.riskLevelFilter, state.marketCapFilter, state.searchQuery]);

    const sortedAssets = useMemo(() => {
        const sortableAssets = [...filteredAssets];
        sortableAssets.sort((a, b) => {
            const aVal = a[state.sortConfig.key];
            const bVal = b[state.sortConfig.key];
            if (aVal === undefined || aVal === null) return 1;
            if (bVal === undefined || bVal === null) return -1;
            if (aVal < bVal) return state.sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return state.sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sortableAssets;
    }, [filteredAssets, state.sortConfig]);

    const totalValue = useMemo(() => filteredAssets.reduce((sum, asset) => sum + asset.value, 0), [filteredAssets]);
    const overallChange = useMemo(() => {
        if (totalValue === 0) return 0;
        const weightedChange = filteredAssets.reduce((sum, asset) => sum + asset.value * asset.change24h, 0);
        return weightedChange / totalValue;
    }, [filteredAssets, totalValue]);

    const handleSort = useCallback((key: SortKey) => {
        dispatch({ type: 'SET_SORT', payload: key });
    }, []);

    const handleAssetClick = useCallback((asset: EnhancedPortfolioAsset) => {
        dispatch({ type: 'OPEN_ASSET_MODAL', payload: asset });
        dispatch({ type: 'FETCH_MODAL_DATA_START' });
        Promise.all([
            MockFinancialDataService.fetchAssetDetails(asset.id),
            MockFinancialDataService.fetchHistoricalData(asset.id, '1Y'),
        ]).then(([details, history]) => {
            dispatch({ type: 'FETCH_MODAL_DATA_SUCCESS', payload: { ...details, historicalData: history } });
        }).catch(err => {
            dispatch({ type: 'FETCH_MODAL_DATA_FAILURE', payload: err.message });
        });
    }, []);
    
    const renderSortArrow = (key: SortKey) => {
        if (state.sortConfig.key !== key) return null;
        return state.sortConfig.direction === 'desc' ? ' ↓' : ' ↑';
    };

    const renderCurrentView = () => {
        switch (state.viewMode) {
            case 'treemap':
                return (
                    <Card title="Portfolio Composition by Value">
                         <ResponsiveContainer width="100%" height={500}>
                            <Treemap
                                data={sortedAssets}
                                dataKey="value"
                                ratio={16 / 9}
                                stroke="#fff"
                                fill="#8884d8"
                                isAnimationActive={true}
                                content={<CustomTreemapContent />}
                                onClick={(item) => handleAssetClick(item as any)}
                            >
                                 {sortedAssets.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={getColorForChange(entry.change24h)} />
                                ))}
                            </Treemap>
                        </ResponsiveContainer>
                    </Card>
                );
            case 'table':
                return (
                    <Card title="Asset Details">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th onClick={() => handleSort('name')} className="px-6 py-3 cursor-pointer">Name {renderSortArrow('name')}</th>
                                        <th onClick={() => handleSort('value')} className="px-6 py-3 cursor-pointer text-right">Value {renderSortArrow('value')}</th>
                                        <th onClick={() => handleSort('change24h')} className="px-6 py-3 cursor-pointer text-right">24h % {renderSortArrow('change24h')}</th>
                                        <th onClick={() => handleSort('ytdReturn')} className="px-6 py-3 cursor-pointer text-right">YTD % {renderSortArrow('ytdReturn')}</th>
                                        <th onClick={() => handleSort('sector')} className="px-6 py-3 cursor-pointer">Sector {renderSortArrow('sector')}</th>
                                        <th onClick={() => handleSort('region')} className="px-6 py-3 cursor-pointer">Region {renderSortArrow('region')}</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedAssets.map(asset => (
                                        <tr key={asset.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => handleAssetClick(asset)}>
                                            <td className="px-6 py-4 font-medium text-white">
                                                {asset.name}
                                                <span className="block text-xs text-gray-500">{asset.ticker} - {asset.assetClass}</span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-right text-white">{formatCurrency(asset.value)}</td>
                                            <td className={`px-6 py-4 font-mono text-right ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                                            </td>
                                            <td className={`px-6 py-4 font-mono text-right ${asset.ytdReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {asset.ytdReturn >= 0 ? '+' : ''}{asset.ytdReturn.toFixed(2)}%
                                            </td>
                                            <td className="px-6 py-4">{asset.sector}</td>
                                            <td className="px-6 py-4">{asset.region}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_WATCHLIST', payload: asset.id })}} className="text-yellow-400 hover:text-yellow-200">
                                                    {state.watchlist.has(asset.id) ? <FaStar /> : <FaRegStar />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                );
            case 'allocation':
                return <AllocationCharts data={filteredAssets} />;
            default:
                return <ErrorDisplay message={`View mode "${state.viewMode}" is not implemented.`} />;
        }
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-3xl font-bold text-white tracking-wider">Portfolio Explorer</h2>
              <div className="flex items-center space-x-2">
                <ToolbarButton icon={FaFileCsv} label="Export CSV" />
                <ToolbarButton icon={FaFilePdf} label="Export PDF" />
                <ToolbarButton icon={FaCog} label="Settings" onClick={() => dispatch({type: 'TOGGLE_VISIBILITY', payload: 'settings'})} />
              </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</p><p className="text-sm text-gray-400 mt-1">Filtered Value</p></Card>
                <Card className="text-center"><p className={`text-3xl font-bold ${overallChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{overallChange >= 0 ? '+' : ''}{overallChange.toFixed(2)}%</p><p className="text-sm text-gray-400 mt-1">24h Weighted Change</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{filteredAssets.length}</p><p className="text-sm text-gray-400 mt-1">Assets Shown</p></Card>
            </div>
            
            <Card>
                <div className="flex flex-wrap justify-between items-center gap-4">
                   <div className="relative flex-grow max-w-xs">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or ticker..."
                            value={state.searchQuery}
                            onChange={e => dispatch({type: 'SET_FILTER', payload: {filter: 'searchQuery', value: e.target.value}})}
                            className="w-full bg-gray-700/50 border-gray-600 rounded p-2 pl-10 text-white"
                        />
                   </div>
                   <div className="flex items-center space-x-2">
                       <ToolbarButton 
                           icon={FaFilter} 
                           label={state.isFiltersVisible ? 'Hide Filters' : 'Show Filters'} 
                           onClick={() => dispatch({type: 'TOGGLE_VISIBILITY', payload: 'filters'})} 
                           isActive={state.isFiltersVisible}
                       />
                   </div>
                </div>
                {state.isFiltersVisible && (
                    <div className="mt-6 border-t border-gray-700 pt-6">
                        <AdvancedFilters state={state} dispatch={dispatch} />
                    </div>
                )}
            </Card>

            <Card>
                <div className="flex flex-wrap gap-2">
                    <ToolbarButton icon={FaChartPie} label="Treemap" onClick={() => dispatch({type: 'SET_VIEW_MODE', payload: 'treemap'})} isActive={state.viewMode === 'treemap'} />
                    <ToolbarButton icon={FaTable} label="Table" onClick={() => dispatch({type: 'SET_VIEW_MODE', payload: 'table'})} isActive={state.viewMode === 'table'} />
                    <ToolbarButton icon={FaChartLine} label="Allocation" onClick={() => dispatch({type: 'SET_VIEW_MODE', payload: 'allocation'})} isActive={state.viewMode === 'allocation'} />
                    {/* Placeholder for more views */}
                </div>
            </Card>

            {renderCurrentView()}

            <AssetDetailModal
                isOpen={state.isModalOpen}
                onClose={() => dispatch({ type: 'CLOSE_ASSET_MODAL' })}
                asset={state.selectedAsset}
                modalData={state.modalData}
                isLoading={state.isModalLoading}
                error={state.modalError}
                dispatch={dispatch}
            />
        </div>
    );
};

export default PortfolioExplorerView;