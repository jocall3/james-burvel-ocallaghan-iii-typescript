```typescript
// components/views/personal/DashboardView.tsx
import React, { useState, useEffect, useMemo, useCallback, useReducer, createContext, useContext } from 'react';
import { View } from '../../../types';

// Import the restored widget components
import BalanceSummary from '../../BalanceSummary';
import RecentTransactions from '../../RecentTransactions';
import InvestmentPortfolio from '../../InvestmentPortfolio';
import AIInsights from '../../AIInsights';
import ImpactTracker from '../../ImpactTracker';
import WealthTimeline from '../../WealthTimeline';

// --- START OF EXPANDED CODE ---

// SECTION 1: ADVANCED TYPES & INTERFACES
// =================================================================

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD';
export type AccountType = 'checking' | 'savings' | 'investment' | 'credit_card' | 'loan' | 'real_estate' | 'crypto';
export type TransactionCategory = 'Groceries' | 'Utilities' | 'Rent' | 'Transportation' | 'Dining Out' | 'Shopping' | 'Health' | 'Entertainment' | 'Income' | 'Investment' | 'Other';
export type AssetClass = 'Stocks' | 'Bonds' | 'Real Estate' | 'Crypto' | 'Cash' | 'Commodities';
export type GoalType = 'Retirement' | 'House Down Payment' | 'Vacation' | 'Emergency Fund' | 'Education';
export type AlertLevel = 'info' | 'warning' | 'critical';
export type ReportFormat = 'pdf' | 'csv' | 'json';
export type MarketTrend = 'up' | 'down' | 'stable';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    riskTolerance: 'low' | 'medium' | 'high';
    financialGoals: string[];
    preferredCurrency: Currency;
    lastLogin: string;
}

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: Currency;
    institution: string;
    lastUpdated: string;
    interestRate?: number;
    creditLimit?: number;
}

export interface Transaction {
    id: string;
    accountId: string;
    date: string;
    description: string;
    amount: number;
    category: TransactionCategory;
    isRecurring: boolean;
}

export interface InvestmentHolding {
    id: string;
    ticker: string;
    name: string;
    shares: number;
    purchasePrice: number;
    currentPrice: number;
    assetClass: AssetClass;
}

export interface FinancialGoal {
    id: string;
    name: string;
    type: GoalType;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    priority: 'high' | 'medium' | 'low';
}

export interface Budget {
    category: TransactionCategory;
    allocated: number;
    spent: number;
}

export interface Alert {
    id: string;
    title: string;
    message: string;
    level: AlertLevel;
    timestamp: string;
}

export interface MarketNewsArticle {
    id: string;
    source: string;
    headline: string;
    summary: string;
    url: string;
    publishedAt: string;
    trend: MarketTrend;
}

export interface UpcomingBill {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    isAutoPay: boolean;
    category: TransactionCategory;
}

export interface InsurancePolicy {
    id: string;
    provider: string;
    type: 'Life' | 'Health' | 'Auto' | 'Home';
    policyNumber: string;
    coverage: number;
    premium: number;
    nextPaymentDate: string;
}

export interface FinancialHealthMetrics {
    creditScore: number;
    savingsRate: number; // percentage
    debtToIncomeRatio: number; // percentage
    emergencyFundCoverage: number; // in months
    investmentAllocation: Record<AssetClass, number>;
}

export interface DashboardWidget {
    id: string;
    component: React.ComponentType<any>;
    title: string;
    gridSpan: number;
    defaultPosition: number;
}

// SECTION 2: MOCK DATA & API SIMULATION
// =================================================================

const mockUserProfile: UserProfile = {
    id: 'user-123',
    name: 'Alex Ryder',
    email: 'alex.ryder@example.com',
    avatarUrl: `https://i.pravatar.cc/150?u=alexryder`,
    riskTolerance: 'medium',
    financialGoals: ['Retirement', 'Buy a new car'],
    preferredCurrency: 'USD',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
};

const mockAccounts: Account[] = [
    { id: 'acc-001', name: 'Main Checking', type: 'checking', balance: 12540.50, currency: 'USD', institution: 'Global Bank', lastUpdated: new Date().toISOString() },
    { id: 'acc-002', name: 'High-Yield Savings', type: 'savings', balance: 55200.00, currency: 'USD', institution: 'Digital Trust', lastUpdated: new Date().toISOString(), interestRate: 4.5 },
    { id: 'acc-003', name: 'Visa Sapphire', type: 'credit_card', balance: -1850.75, currency: 'USD', institution: 'Global Bank', lastUpdated: new Date().toISOString(), creditLimit: 15000 },
    { id: 'acc-004', name: 'Brokerage Account', type: 'investment', balance: 125000.00, currency: 'USD', institution: 'InvestForward', lastUpdated: new Date().toISOString() },
    { id: 'acc-005', name: '401(k) Retirement', type: 'investment', balance: 350000.00, currency: 'USD', institution: 'FutureSecure', lastUpdated: new Date().toISOString() },
    { id: 'acc-006', name: 'Mortgage', type: 'loan', balance: -250000.00, currency: 'USD', institution: 'Home Loans Inc.', lastUpdated: new Date().toISOString(), interestRate: 3.25 },
    { id: 'acc-007', name: 'Crypto Wallet', type: 'crypto', balance: 8345.21, currency: 'USD', institution: 'CryptoVault', lastUpdated: new Date().toISOString() },
    { id: 'acc-008', name: 'Primary Residence', type: 'real_estate', balance: 450000.00, currency: 'USD', institution: 'Self-Valued', lastUpdated: new Date().toISOString() },
];

const mockTransactions: Transaction[] = Array.from({ length: 50 }, (_, i) => {
    const categories: TransactionCategory[] = ['Groceries', 'Utilities', 'Rent', 'Transportation', 'Dining Out', 'Shopping', 'Health', 'Entertainment', 'Income', 'Investment'];
    const type = Math.random() > 0.2 ? 'expense' : 'income';
    const category = type === 'income' ? 'Income' : categories[Math.floor(Math.random() * (categories.length - 1))];
    const amount = type === 'income' ? Math.random() * 5000 + 1000 : -(Math.random() * 500 + 5);
    return {
        id: `txn-${i}`,
        accountId: mockAccounts[Math.floor(Math.random() * 3)].id,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Transaction ${i}`,
        amount: parseFloat(amount.toFixed(2)),
        category,
        isRecurring: Math.random() > 0.8,
    };
});

const mockHoldings: InvestmentHolding[] = [
    { id: 'h-01', ticker: 'AAPL', name: 'Apple Inc.', shares: 50, purchasePrice: 150, currentPrice: 195.50, assetClass: 'Stocks' },
    { id: 'h-02', ticker: 'VOO', name: 'Vanguard S&P 500 ETF', shares: 100, purchasePrice: 380, currentPrice: 430.10, assetClass: 'Stocks' },
    { id: 'h-03', ticker: 'BND', name: 'Vanguard Total Bond Market ETF', shares: 150, purchasePrice: 75, currentPrice: 72.50, assetClass: 'Bonds' },
    { id: 'h-04', ticker: 'BTC', name: 'Bitcoin', shares: 0.1, purchasePrice: 30000, currentPrice: 41726.05, assetClass: 'Crypto' },
    { id: 'h-05', ticker: 'REIT.L', name: 'Real Estate Investment Trust', shares: 200, purchasePrice: 90, currentPrice: 110.00, assetClass: 'Real Estate' },
];

const mockGoals: FinancialGoal[] = [
    { id: 'g-01', name: 'Retirement Fund', type: 'Retirement', targetAmount: 2000000, currentAmount: 350000, targetDate: '2050-01-01', priority: 'high' },
    { id: 'g-02', name: 'House Down Payment', type: 'House Down Payment', targetAmount: 100000, currentAmount: 55200, targetDate: '2027-06-01', priority: 'high' },
    { id: 'g-03', name: 'European Vacation', type: 'Vacation', targetAmount: 15000, currentAmount: 3500, targetDate: '2025-08-01', priority: 'medium' },
];

const mockBudgets: Budget[] = [
    { category: 'Groceries', allocated: 800, spent: 650.25 },
    { category: 'Dining Out', allocated: 400, spent: 450.80 },
    { category: 'Shopping', allocated: 500, spent: 250.00 },
    { category: 'Transportation', allocated: 300, spent: 280.50 },
    { category: 'Entertainment', allocated: 200, spent: 150.00 },
];

const mockAlerts: Alert[] = [
    { id: 'al-01', title: 'Large Transaction', message: 'A transaction of $1,200 to "TechStore" was just made.', level: 'info', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'al-02', title: 'Credit Limit Approaching', message: 'You have used 85% of your Visa Sapphire credit limit.', level: 'warning', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'al-03', title: 'Upcoming Bill', message: 'Your mortgage payment of $1,800 is due in 3 days.', level: 'critical', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
];

const mockNews: MarketNewsArticle[] = [
    { id: 'n-01', source: 'Finance Today', headline: 'Tech Stocks Rally on Positive Inflation Report', summary: 'Major tech indices saw significant gains as new inflation data suggests a cooling economy...', url: '#', publishedAt: new Date().toISOString(), trend: 'up' },
    { id: 'n-02', source: 'MarketWatch', headline: 'Federal Reserve Hints at Pausing Rate Hikes', summary: 'In a recent speech, the Fed chair suggested that current monetary policy may be sufficiently restrictive...', url: '#', publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(), trend: 'stable' },
    { id: 'n-03', source: 'Crypto News', headline: 'Volatility in Crypto Markets as Regulatory Scrutiny Increases', summary: 'Bitcoin and Ethereum experience sharp price swings amid news of potential new regulations...', url: '#', publishedAt: new Date(Date.now() - 86400000).toISOString(), trend: 'down' },
];

const mockBills: UpcomingBill[] = [
    { id: 'b-01', name: 'Mortgage', amount: 1800.00, dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), isAutoPay: true, category: 'Rent' },
    { id: 'b-02', name: 'Car Payment', amount: 450.00, dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), isAutoPay: true, category: 'Transportation' },
    { id: 'b-03', name: 'Netflix Subscription', amount: 19.99, dueDate: new Date(Date.now() + 10 * 86400000).toISOString(), isAutoPay: true, category: 'Entertainment' },
    { id: 'b-04', name: 'Electricity Bill', amount: 120.50, dueDate: new Date(Date.now() + 15 * 86400000).toISOString(), isAutoPay: false, category: 'Utilities' },
];

export const useMockApi = <T>(data: T, delay: number = 1000): { data: T | null; loading: boolean; error: string | null } => {
    const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (Math.random() > 0.95) { // 5% chance of error
                setState({ data: null, loading: false, error: 'Failed to fetch data. Please try again.' });
            } else {
                setState({ data, loading: false, error: null });
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [data, delay]);

    return state;
};


// SECTION 3: UTILITY FUNCTIONS & HOOKS
// =================================================================

export const formatCurrency = (amount: number, currency: Currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {}): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    };
    return new Date(dateString).toLocaleDateString('en-US', defaultOptions);
};

export const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const units = [
        { name: 'year', seconds: 31536000 },
        { name: 'month', seconds: 2592000 },
        { name: 'week', seconds: 604800 },
        { name: 'day', seconds: 86400 },
        { name: 'hour', seconds: 3600 },
        { name: 'minute', seconds: 60 },
        { name: 'second', seconds: 1 },
    ];

    for (const unit of units) {
        const interval = Math.floor(diffInSeconds / unit.seconds);
        if (interval >= 1) {
            return `${interval} ${unit.name}${interval > 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
};


export const getCategoryIcon = (category: TransactionCategory): React.ReactNode => {
    const iconMap: Record<TransactionCategory, React.ReactNode> = {
        'Groceries': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        'Utilities': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
        'Rent': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        'Transportation': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.25c0 .414.336.75.75.75h.01a.75.75 0 00.74- .652l.45-2.098a.75.75 0 00-.74- .848H12a.75.75 0 00-.75.75v2.098c0 .414.336.75.75.75h.01a.75.75 0 00.74-.652l.45-2.098a.75.75 0 00-.74-.848H12v2.848zM12 18.25c0 .414-.336.75-.75.75h-.01a.75.75 0 01-.74-.652l-.45-2.098a.75.75 0 01.74-.848H12a.75.75 0 01.75.75v2.098z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        'Dining Out': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>,
        'Shopping': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
        'Health': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
        'Entertainment': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" /></svg>,
        'Income': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
        'Investment': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
        'Other': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };
    return iconMap[category] || iconMap['Other'];
};

export const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
};

// SECTION 4: GENERIC UI COMPONENTS
// =================================================================

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => (
    <div className={`bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 ${className}`}>
        {(title || action) && (
            <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
                {action}
            </div>
        )}
        <div className="p-4">
            {children}
        </div>
    </div>
);

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-5 w-5',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };
    return (
        <div className="flex justify-center items-center h-full">
            <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-500 border-t-purple-500`}></div>
        </div>
    );
};

interface ErrorDisplayProps {
    message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => (
    <div className="bg-red-900 bg-opacity-50 text-red-300 p-4 rounded-lg border border-red-700">
        <p className="font-semibold">An error occurred</p>
        <p>{message}</p>
    </div>
);

interface ProgressBarProps {
    value: number;
    max: number;
    colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, colorClass = 'bg-green-500' }) => {
    const percentage = (value / max) * 100;
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl border border-gray-700 m-4" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};


// SECTION 5: ADVANCED WIDGETS
// =================================================================

// WIDGET 5.1: Financial Health Score
// -----------------------------------------------------------------

const calculateFinancialHealth = (metrics: FinancialHealthMetrics): { score: number; feedback: string[] } => {
    let score = 0;
    const feedback: string[] = [];

    // Credit Score (25%)
    const creditScorePoints = (Math.max(0, metrics.creditScore - 500) / 350) * 25;
    score += creditScorePoints;
    if (metrics.creditScore < 670) feedback.push('Improving your credit score could open up better financial products.');
    else if (metrics.creditScore > 800) feedback.push('Excellent credit score! Keep up the good work.');

    // Savings Rate (30%)
    const savingsRatePoints = (Math.min(metrics.savingsRate, 25) / 25) * 30;
    score += savingsRatePoints;
    if (metrics.savingsRate < 10) feedback.push('Aim to increase your savings rate to at least 15% of your income.');
    else feedback.push('Great job on your savings rate! You are building a strong financial future.');

    // Debt-to-Income Ratio (25%)
    const dtiPoints = (1 - Math.min(metrics.debtToIncomeRatio, 50) / 50) * 25;
    score += dtiPoints;
    if (metrics.debtToIncomeRatio > 40) feedback.push('Your debt-to-income ratio is high. Focus on paying down debt.');
    else feedback.push('Your debt levels are manageable. Well done!');

    // Emergency Fund (20%)
    const emergencyFundPoints = (Math.min(metrics.emergencyFundCoverage, 6) / 6) * 20;
    score += emergencyFundPoints;
    if (metrics.emergencyFundCoverage < 3) feedback.push('Your emergency fund is low. Aim for 3-6 months of living expenses.');
    else feedback.push('You have a solid emergency fund, providing great financial security.');

    return { score: Math.round(score), feedback };
};

export const FinancialHealthScore: React.FC = () => {
    const { data, loading, error } = useMockApi<FinancialHealthMetrics>({
        creditScore: 780,
        savingsRate: 18,
        debtToIncomeRatio: 25,
        emergencyFundCoverage: 4.5,
        investmentAllocation: { 'Stocks': 60, 'Bonds': 25, 'Real Estate': 10, 'Crypto': 5, 'Cash': 0, 'Commodities': 0 },
    }, 1500);

    if (loading) return <Card title="Financial Health Score"><LoadingSpinner /></Card>;
    if (error || !data) return <Card title="Financial Health Score"><ErrorDisplay message={error || 'No data available'} /></Card>;

    const { score, feedback } = calculateFinancialHealth(data);
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getScoreColor = (s: number) => {
        if (s < 50) return 'text-red-400';
        if (s < 75) return 'text-yellow-400';
        return 'text-green-400';
    };

    return (
        <Card title="Financial Health Score">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="52" stroke="currentColor" strokeWidth="12" className="text-gray-700" fill="transparent" />
                        <circle cx="64" cy="64" r="52" stroke="currentColor" strokeWidth="12"
                            className={getScoreColor(score)}
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                        />
                    </svg>
                    <span className={`absolute text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
                </div>
                <div className="flex-1">
                    <h4 className="text-xl font-semibold text-white">Your Score Analysis</h4>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-gray-300">
                        {feedback.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            </div>
        </Card>
    );
};

// WIDGET 5.2: Budgeting & Spending Analysis
// -----------------------------------------------------------------
export const SpendingAnalysis: React.FC = () => {
    const { data: budgets, loading, error } = useMockApi<Budget[]>(mockBudgets, 1200);
    const [viewMode, setViewMode] = useState<'overview' | 'details'>('overview');

    if (loading) return <Card title="Spending Analysis"><LoadingSpinner /></Card>;
    if (error || !budgets) return <Card title="Spending Analysis"><ErrorDisplay message={error || 'No data available'} /></Card>;

    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const remaining = totalAllocated - totalSpent;

    return (
        <Card title="Spending Analysis" action={
            <div className="text-sm text-gray-400">
                {formatCurrency(totalSpent)} spent of {formatCurrency(totalAllocated)}
            </div>
        }>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-white">Total Progress</span>
                        <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(remaining)} {remaining >= 0 ? 'left' : 'over'}
                        </span>
                    </div>
                    <ProgressBar value={totalSpent} max={totalAllocated} colorClass={remaining >= 0 ? 'bg-purple-600' : 'bg-red-600'}/>
                </div>
                <div className="space-y-3 pt-2">
                    {budgets.map(budget => {
                        const isOverBudget = budget.spent > budget.allocated;
                        return (
                            <div key={budget.category}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-300 flex items-center">
                                        <span className="mr-2 opacity-70">{getCategoryIcon(budget.category)}</span>
                                        {budget.category}
                                    </span>
                                    <span className={`text-sm ${isOverBudget ? 'text-red-400' : 'text-gray-400'}`}>
                                        {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                                    </span>
                                </div>
                                <ProgressBar value={budget.spent} max={budget.allocated} colorClass={isOverBudget ? 'bg-red-500' : 'bg-indigo-500'} />
                            </div>
                        )
                    })}
                </div>
            </div>
        </Card>
    );
};


// WIDGET 5.3: Financial Goals Tracker
// -----------------------------------------------------------------
export const GoalTracker: React.FC = () => {
    const { data: goals, loading, error } = useMockApi<FinancialGoal[]>(mockGoals, 1800);
    const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);

    const handleCloseModal = () => setSelectedGoal(null);

    if (loading) return <Card title="Financial Goals"><LoadingSpinner /></Card>;
    if (error || !goals) return <Card title="Financial Goals"><ErrorDisplay message={error || 'No data available'} /></Card>;

    return (
        <>
            <Card title="Financial Goals" action={<button className="text-purple-400 text-sm hover:text-purple-300">Add Goal</button>}>
                <div className="space-y-4">
                    {goals.map(goal => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100;
                        const daysLeft = Math.round((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        return (
                            <div key={goal.id} className="cursor-pointer" onClick={() => setSelectedGoal(goal)}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-white">{goal.name}</span>
                                    <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
                                </div>
                                <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{formatCurrency(goal.currentAmount)}</span>
                                    <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Past due'}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
            <Modal isOpen={!!selectedGoal} onClose={handleCloseModal} title={selectedGoal?.name || 'Goal Details'}>
                {selectedGoal && (
                    <div className="space-y-4 text-gray-300">
                        <p><strong>Type:</strong> {selectedGoal.type}</p>
                        <p><strong>Target Amount:</strong> {formatCurrency(selectedGoal.targetAmount)}</p>
                        <p><strong>Current Amount:</strong> {formatCurrency(selectedGoal.currentAmount)}</p>
                        <p><strong>Target Date:</strong> {formatDate(selectedGoal.targetDate)}</p>
                        <p><strong>Priority:</strong> <span className="capitalize">{selectedGoal.priority}</span></p>
                        <div className="mt-4">
                            <h4 className="font-semibold text-white mb-2">Progress</h4>
                            <ProgressBar value={selectedGoal.currentAmount} max={selectedGoal.targetAmount} colorClass="bg-green-500" />
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

// WIDGET 5.4: Upcoming Bills & Subscriptions
// -----------------------------------------------------------------
export const UpcomingPayments: React.FC = () => {
    const { data: bills, loading, error } = useMockApi<UpcomingBill[]>(mockBills, 900);

    if (loading) return <Card title="Upcoming Payments"><LoadingSpinner /></Card>;
    if (error || !bills) return <Card title="Upcoming Payments"><ErrorDisplay message={error || 'No data available'} /></Card>;

    return (
        <Card title="Upcoming Payments" action={<a href="#" className="text-sm text-purple-400 hover:text-purple-300">View Calendar</a>}>
            <ul className="divide-y divide-gray-700">
                {bills.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(bill => {
                    const daysUntilDue = Math.ceil((new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    const urgencyColor = daysUntilDue <= 3 ? 'text-red-400' : daysUntilDue <= 7 ? 'text-yellow-400' : 'text-gray-400';
                    return (
                        <li key={bill.id} className="py-3 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-gray-700 ${urgencyColor}`}>
                                    {getCategoryIcon(bill.category)}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{bill.name}</p>
                                    <p className={`text-sm ${urgencyColor}`}>
                                        Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-white">{formatCurrency(bill.amount)}</p>
                                {bill.isAutoPay && <p className="text-xs text-green-400">Auto-Pay</p>}
                            </div>
                        </li>
                    )
                })}
            </ul>
        </Card>
    );
};

// WIDGET 5.5: Market News & Insights
// -----------------------------------------------------------------
export const MarketNews: React.FC = () => {
    const { data: news, loading, error } = useMockApi<MarketNewsArticle[]>(mockNews, 2200);

    const trendIcon = (trend: MarketTrend) => {
        if (trend === 'up') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>;
        if (trend === 'down') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" /></svg>;
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>;
    };

    if (loading) return <Card title="Market News"><LoadingSpinner /></Card>;
    if (error || !news) return <Card title="Market News"><ErrorDisplay message={error || 'No data available'} /></Card>;

    return (
        <Card title="Market News">
            <div className="space-y-4">
                {news.map(article => (
                    <a href={article.url} key={article.id} className="block p-3 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition-colors">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-semibold text-white">{article.headline}</p>
                                <p className="text-sm text-gray-400 mt-1">{article.source} &middot; {getRelativeTime(article.publishedAt)}</p>
                            </div>
                            {trendIcon(article.trend)}
                        </div>
                    </a>
                ))}
            </div>
        </Card>
    );
};


// SECTION 6: DASHBOARD STATE MANAGEMENT & LAYOUT
// =================================================================

type DashboardAction =
    | { type: 'SET_LAYOUT'; payload: string[] }
    | { type: 'MOVE_WIDGET'; payload: { fromIndex: number; toIndex: number } }
    | { type: 'TOGGLE_WIDGET'; payload: string }
    | { type: 'SET_EDIT_MODE'; payload: boolean };

interface DashboardState {
    widgetOrder: string[];
    availableWidgets: Record<string, DashboardWidget>;
    editMode: boolean;
}

const WIDGETS_MAP: Record<string, DashboardWidget> = {
    balanceSummary: { id: 'balanceSummary', component: BalanceSummary, title: 'Balance Summary', gridSpan: 2, defaultPosition: 0 },
    recentTransactions: { id: 'recentTransactions', component: RecentTransactions, title: 'Recent Transactions', gridSpan: 2, defaultPosition: 1 },
    wealthTimeline: { id: 'wealthTimeline', component: WealthTimeline, title: 'Wealth Timeline', gridSpan: 2, defaultPosition: 2 },
    investmentPortfolio: { id: 'investmentPortfolio', component: InvestmentPortfolio, title: 'Investment Portfolio', gridSpan: 1, defaultPosition: 3 },
    aiInsights: { id: 'aiInsights', component: AIInsights, title: 'AI Insights', gridSpan: 1, defaultPosition: 4 },
    impactTracker: { id: 'impactTracker', component: ImpactTracker, title: 'Impact Tracker', gridSpan: 1, defaultPosition: 5 },
    financialHealth: { id: 'financialHealth', component: FinancialHealthScore, title: 'Financial Health', gridSpan: 2, defaultPosition: 6 },
    spendingAnalysis: { id: 'spendingAnalysis', component: SpendingAnalysis, title: 'Spending Analysis', gridSpan: 1, defaultPosition: 7 },
    goalTracker: { id: 'goalTracker', component: GoalTracker, title: 'Goal Tracker', gridSpan: 1, defaultPosition: 8 },
    upcomingPayments: { id: 'upcomingPayments', component: UpcomingPayments, title: 'Upcoming Payments', gridSpan: 1, defaultPosition: 9 },
    marketNews: { id: 'marketNews', component: MarketNews, title: 'Market News', gridSpan: 1, defaultPosition: 10 },
};

const initialDashboardState: DashboardState = {
    widgetOrder: Object.keys(WIDGETS_MAP),
    availableWidgets: WIDGETS_MAP,
    editMode: false,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
    switch (action.type) {
        case 'SET_LAYOUT':
            return { ...state, widgetOrder: action.payload };
        case 'MOVE_WIDGET': {
            const { fromIndex, toIndex } = action.payload;
            const newOrder = Array.from(state.widgetOrder);
            const [removed] = newOrder.splice(fromIndex, 1);
            newOrder.splice(toIndex, 0, removed);
            return { ...state, widgetOrder: newOrder };
        }
        case 'TOGGLE_WIDGET': {
             const widgetId = action.payload;
             const isVisible = state.widgetOrder.includes(widgetId);
             if (isVisible) {
                 return { ...state, widgetOrder: state.widgetOrder.filter(id => id !== widgetId) };
             } else {
                 const defaultPos = state.availableWidgets[widgetId].defaultPosition;
                 const newOrder = [...state.widgetOrder];
                 newOrder.splice(defaultPos, 0, widgetId);
                 return { ...state, widgetOrder: newOrder };
             }
        }
        case 'SET_EDIT_MODE':
            return { ...state, editMode: action.payload };
        default:
            return state;
    }
}


// SECTION 7: MAIN DASHBOARD VIEW COMPONENT
// =================================================================

interface DashboardViewProps {
    setActiveView: (view: View) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
    const [persistedState, setPersistedState] = useLocalStorage('dashboardLayout', initialDashboardState);
    const [state, dispatch] = useReducer(dashboardReducer, persistedState);

    useEffect(() => {
        setPersistedState(state);
    }, [state, setPersistedState]);
    
    const { data: userProfile, loading: userLoading } = useMockApi(mockUserProfile, 500);

    const handleSaveLayout = () => {
        dispatch({ type: 'SET_EDIT_MODE', payload: false });
        // Here you would typically make an API call to save the user's layout
        console.log("Layout saved:", state.widgetOrder);
    };

    const handleResetLayout = () => {
        dispatch({ type: 'SET_LAYOUT', payload: Object.keys(WIDGETS_MAP) });
    };

    const welcomeMessage = useMemo(() => {
        if (userLoading || !userProfile) return "Welcome!";
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
        return `Good ${timeOfDay}, ${userProfile.name.split(' ')[0]}!`;
    }, [userProfile, userLoading]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-wider">{welcomeMessage}</h2>
                    <p className="text-gray-400 mt-1">Here's your complete financial overview.</p>
                </div>
                <div>
                    {state.editMode ? (
                        <div className="flex items-center gap-2">
                            <button onClick={handleSaveLayout} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Save Layout
                            </button>
                             <button onClick={handleResetLayout} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Reset
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => dispatch({ type: 'SET_EDIT_MODE', payload: true })} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Customize Dashboard
                        </button>
                    )}
                </div>
            </div>

            {state.editMode && <DashboardCustomizationPanel state={state} dispatch={dispatch} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {state.widgetOrder.map(widgetId => {
                    const widget = state.availableWidgets[widgetId];
                    if (!widget) return null;
                    const Component = widget.component as React.FC<any>;
                    const gridClass = widget.gridSpan === 2 ? 'lg:col-span-2' : '';
                    
                    return (
                        <div key={widgetId} className={gridClass}>
                            <Component setActiveView={setActiveView} />
                        </div>
                    );
                })}

                {!state.widgetOrder.length && (
                    <div className="lg:col-span-3 text-center py-12">
                        <p className="text-gray-400">Your dashboard is empty. Go to "Customize Dashboard" to add widgets.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// SECTION 8: DASHBOARD CUSTOMIZATION PANEL
// =================================================================

interface DashboardCustomizationPanelProps {
    state: DashboardState;
    dispatch: React.Dispatch<DashboardAction>;
}

export const DashboardCustomizationPanel: React.FC<DashboardCustomizationPanelProps> = ({ state, dispatch }) => {
    return (
        <Card title="Customize Your Dashboard">
            <p className="text-gray-400 mb-4">Select the widgets you want to see on your dashboard.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.values(state.availableWidgets).map(widget => {
                    const isVisible = state.widgetOrder.includes(widget.id);
                    return (
                        <button
                            key={widget.id}
                            onClick={() => dispatch({ type: 'TOGGLE_WIDGET', payload: widget.id })}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center text-center
                                ${isVisible ? 'bg-purple-800 border-purple-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                        >
                            <span className="font-semibold">{widget.title}</span>
                            <span className="text-xs mt-1">{isVisible ? 'Visible' : 'Hidden'}</span>
                        </button>
                    );
                })}
            </div>
             <p className="text-gray-400 mt-6 text-sm">Note: Drag and drop to reorder widgets is not implemented in this view. Use "Save Layout" to confirm changes.</p>
        </Card>
    );
};


export default DashboardView;
// --- END OF EXPANDED CODE ---
```