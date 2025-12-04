import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useRef, FC, ReactNode } from 'react';

//================================================================================================
// SECTION: TYPES AND INTERFACES
// Description: Core data structures for the entire financial dashboard.
//================================================================================================

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD';

export interface Money {
    amount: number;
    currency: Currency;
}

export type TransactionCategory =
    | 'Groceries'
    | 'Utilities'
    | 'Rent'
    | 'Mortgage'
    | 'Transportation'
    | 'Dining Out'
    | 'Entertainment'
    | 'Shopping'
    | 'Health & Wellness'
    | 'Travel'
    | 'Education'
    | 'Investments'
    | 'Income'
    | 'Other';

export interface Transaction {
    id: string;
    date: string; // ISO 8601 format
    description: string;
    amount: number;
    currency: Currency;
    category: TransactionCategory;
    accountId: string;
    status: 'pending' | 'completed' | 'failed';
}

export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' | 'mortgage' | 'property';

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: Currency;
    institution: string;
    interestRate?: number; // Annual percentage rate
    creditLimit?: number;
}

export interface InvestmentHolding {
    id: string;
    ticker: string;
    name: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    assetClass: 'stock' | 'bond' | 'etf' | 'crypto' | 'other';
}

export interface InvestmentAccount extends Account {
    holdings: InvestmentHolding[];
    type: 'investment';
}

export interface AIInsight {
    id: string;
    title: string;
    summary: string;
    severity: 'info' | 'warning' | 'critical';
    category: 'spending' | 'saving' | 'investment' | 'debt';
    actionable: boolean;
    actionText?: string;
}

export interface FinancialGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string; // ISO 8601 format
    priority: 'low' | 'medium' | 'high';
}

export interface Budget {
    category: TransactionCategory;
    allocated: number;
    spent: number;
    currency: Currency;
}

export interface Bill {
    id: string;
    name: string;
    amount: number;
    dueDate: string; // ISO 8601 format
    isRecurring: boolean;
    frequency?: 'weekly' | 'monthly' | 'annually';
    status: 'paid' | 'due' | 'overdue';
}

export interface CreditScore {
    score: number;
    provider: string;
    lastUpdated: string; // ISO 8601 format
    factors: {
        paymentHistory: 'excellent' | 'good' | 'fair' | 'poor';
        creditUtilization: 'excellent' | 'good' | 'fair' | 'poor';
        creditAge: 'excellent' | 'good' | 'fair' | 'poor';
        newCredit: 'excellent' | 'good' | 'fair' | 'poor';
    };
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    preferredCurrency: Currency;
    theme: 'light' | 'dark';
    onboardingComplete: boolean;
}

export interface DashboardData {
    profile: UserProfile;
    accounts: Account[];
    transactions: Transaction[];
    insights: AIInsight[];
    goals: FinancialGoal[];
    budgets: Budget[];
    bills: Bill[];
    creditScore: CreditScore;
    wealthHistory: { date: string; netWorth: number }[];
}


//================================================================================================
// SECTION: MOCK DATA GENERATION
// Description: Simulates a realistic data backend for development and testing.
//================================================================================================

const MOCK_INSTITUTIONS = ['Sovereign Trust', 'Apex Financial', 'Horizon Bank', 'Quantum Credit Union', 'Meridian Capital'];
const MOCK_DESCRIPTIONS = {
    Groceries: ['SuperMart', 'Organic Foods Co.', 'Corner Store', 'Farm Fresh'],
    Utilities: ['City Power & Light', 'AquaFlow Water', 'ConnectNet Internet', 'Gas Co.'],
    Rent: ['Property Management LLC', 'Landlord Payment'],
    Transportation: ['Metro Transit', 'RideShare Inc.', 'Gas Station', 'Vehicle Maintenance'],
    'Dining Out': ['The Gourmet Place', 'Quick Bites Cafe', 'Pizza Palace', 'Sushi Bar'],
    Entertainment: ['Cinema Plex', 'Streaming Service', 'Concert Tickets', 'Online Gaming'],
    Shopping: ['MegaMall', 'Boutique Finds', 'Online Retailer', 'Tech Store'],
    'Health & Wellness': ['Pharmacy', 'Gym Membership', 'Doctor Visit Co-pay'],
    Travel: ['Airline Tickets', 'Hotel Booking', 'Rental Car'],
    Income: ['Employer Payroll', 'Freelance Project', 'Investment Dividend'],
};

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min: number, max: number, decimals: number = 2): number => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};
const subtractDays = (date: Date, days: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - days);
    return newDate;
};

export const generateMockData = (): DashboardData => {
    const profile: UserProfile = {
        id: 'user-123',
        name: 'Alex Sovereign',
        email: 'alex.s@example.com',
        preferredCurrency: 'USD',
        theme: 'dark',
        onboardingComplete: true,
    };

    const accounts: Account[] = [
        { id: 'acc-1', name: 'Primary Checking', type: 'checking', balance: getRandomNumber(5000, 15000), currency: 'USD', institution: 'Sovereign Trust' },
        { id: 'acc-2', name: 'High-Yield Savings', type: 'savings', balance: getRandomNumber(25000, 75000), currency: 'USD', institution: 'Apex Financial', interestRate: 4.5 },
        { id: 'acc-3', name: 'Travel Rewards Card', type: 'credit_card', balance: -getRandomNumber(500, 2500), currency: 'USD', institution: 'Horizon Bank', creditLimit: 15000 },
        { id: 'acc-4', name: 'Retirement Portfolio', type: 'investment', balance: getRandomNumber(120000, 250000), currency: 'USD', institution: 'Meridian Capital' },
        { id: 'acc-5', name: 'Home Mortgage', type: 'mortgage', balance: -getRandomNumber(250000, 350000), currency: 'USD', institution: 'Sovereign Trust' },
        { id: 'acc-6', name: 'Primary Residence', type: 'property', balance: getRandomNumber(450000, 600000), currency: 'USD', institution: 'Self-Valued' },
    ];

    const transactions: Transaction[] = [];
    let currentDate = new Date();
    for (let i = 0; i < 500; i++) {
        const date = subtractDays(currentDate, i % 30);
        const category = getRandomElement(Object.keys(MOCK_DESCRIPTIONS) as TransactionCategory[]);
        const isIncome = category === 'Income';
        transactions.push({
            id: `txn-${i}`,
            date: date.toISOString(),
            description: getRandomElement(MOCK_DESCRIPTIONS[category]!),
            amount: isIncome ? getRandomNumber(2000, 4000) : -getRandomNumber(10, 300),
            currency: 'USD',
            category,
            accountId: isIncome ? 'acc-1' : getRandomElement(['acc-1', 'acc-3']),
            status: 'completed',
        });
    }

    const insights: AIInsight[] = [
        { id: 'ins-1', title: 'High Spending in Dining Out', summary: 'Your spending on Dining Out was $450 last month, which is 35% higher than your average. Consider cooking at home more often.', severity: 'warning', category: 'spending', actionable: true, actionText: 'Create Budget' },
        { id: 'ins-2', title: 'Emergency Fund Goal Met', summary: 'Congratulations! Your High-Yield Savings account now has over 3 months of your average expenses.', severity: 'info', category: 'saving', actionable: false },
        { id: 'ins-3', title: 'Unusual Subscription Charge', summary: 'We detected a new recurring charge of $29.99 from "WebServicesPro". Is this an expected transaction?', severity: 'critical', category: 'spending', actionable: true, actionText: 'Review Transaction' },
        { id: 'ins-4', title: 'Investment Opportunity', summary: 'Based on market trends and your risk profile, consider diversifying your portfolio with international ETFs.', severity: 'info', category: 'investment', actionable: true, actionText: 'Explore Investments' },
    ];

    const goals: FinancialGoal[] = [
        { id: 'goal-1', name: 'Vacation to Japan', targetAmount: 8000, currentAmount: 3500, targetDate: new Date(new Date().getFullYear() + 1, 5, 1).toISOString(), priority: 'medium' },
        { id: 'goal-2', name: 'New Car Down Payment', targetAmount: 10000, currentAmount: 9500, targetDate: new Date(new Date().getFullYear(), 11, 1).toISOString(), priority: 'high' },
        { id: 'goal-3', name: 'Emergency Fund', targetAmount: 15000, currentAmount: 15000, targetDate: new Date(new Date().getFullYear(), 8, 1).toISOString(), priority: 'high' },
    ];

    const budgets: Budget[] = [
        { category: 'Groceries', allocated: 600, spent: 510.50, currency: 'USD' },
        { category: 'Dining Out', allocated: 250, spent: 295.80, currency: 'USD' },
        { category: 'Transportation', allocated: 200, spent: 180.25, currency: 'USD' },
        { category: 'Entertainment', allocated: 150, spent: 145.00, currency: 'USD' },
        { category: 'Shopping', allocated: 300, spent: 120.00, currency: 'USD' },
    ];
    
    const bills: Bill[] = [
        { id: 'bill-1', name: 'ConnectNet Internet', amount: 69.99, dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString(), isRecurring: true, frequency: 'monthly', status: 'paid' },
        { id: 'bill-2', name: 'Mortgage Payment', amount: 1850.75, dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(), isRecurring: true, frequency: 'monthly', status: 'due' },
        { id: 'bill-3', name: 'Streaming Service', amount: 15.99, dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5).toISOString(), isRecurring: true, frequency: 'monthly', status: 'due' },
        { id: 'bill-4', name: 'Car Insurance', amount: 89.50, dueDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 20).toISOString(), isRecurring: true, frequency: 'monthly', status: 'overdue' },
    ];

    const creditScore: CreditScore = {
        score: 785,
        provider: 'Equifax',
        lastUpdated: new Date().toISOString(),
        factors: {
            paymentHistory: 'excellent',
            creditUtilization: 'good',
            creditAge: 'excellent',
            newCredit: 'good',
        },
    };

    const wealthHistory: { date: string; netWorth: number }[] = [];
    let initialNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0) - 50000;
    for (let i = 365; i >= 0; i--) {
        const date = subtractDays(new Date(), i);
        initialNetWorth += getRandomNumber(-200, 500);
        wealthHistory.push({ date: date.toISOString(), netWorth: initialNetWorth });
    }

    return { profile, accounts, transactions, insights, goals, budgets, bills, creditScore, wealthHistory };
};


//================================================================================================
// SECTION: DATA CONTEXT
// Description: Manages the application's state and provides it to all components.
//================================================================================================

interface DataContextType {
    data: DashboardData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
    updateGoal: (goal: FinancialGoal) => void;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: FC<{children: ReactNode}> = ({ children }) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockData = generateMockData();
            setData(mockData);
        } catch (e) {
            setError(e as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateGoal = useCallback((updatedGoal: FinancialGoal) => {
        setData(prevData => {
            if (!prevData) return null;
            return {
                ...prevData,
                goals: prevData.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g),
            };
        });
    }, []);
    
    const addTransaction = useCallback((newTransaction: Omit<Transaction, 'id'>) => {
        setData(prevData => {
            if (!prevData) return null;
            const fullTransaction: Transaction = {
                ...newTransaction,
                id: `txn-new-${Date.now()}`,
            };
            return {
                ...prevData,
                transactions: [fullTransaction, ...prevData.transactions],
            };
        });
    }, []);


    const value = useMemo(() => ({
        data,
        loading,
        error,
        refetch: fetchData,
        updateGoal,
        addTransaction,
    }), [data, loading, error, fetchData, updateGoal, addTransaction]);

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

//================================================================================================
// SECTION: UTILITY & HELPER COMPONENTS
// Description: Reusable components and functions for formatting, UI elements, etc.
//================================================================================================

export const formatCurrency = (amount: number, currency: Currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
    return new Date(dateString).toLocaleDateString('en-US', options || {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const getProgressPercentage = (current: number, target: number): number => {
    if (target <= 0) return 0;
    return Math.min(Math.max((current / target) * 100, 0), 100);
};

export const SkeletonLoader: FC<{ className?: string }> = ({ className }) => {
    return <div className={`bg-gray-700 animate-pulse rounded-md ${className}`} />;
};

export const DashboardCard: FC<{ title: string, children: ReactNode, className?: string }> = ({ title, children, className }) => {
    return (
        <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg ${className}`}>
            <h2 className="text-xl font-semibold text-gray-200 mb-4">{title}</h2>
            {children}
        </div>
    );
};

export const ProgressBar: FC<{ percentage: number, colorClass?: string }> = ({ percentage, colorClass = 'bg-blue-500' }) => {
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};


//================================================================================================
// SECTION: DASHBOARD WIDGETS
// Description: Individual components that make up the dashboard layout.
//================================================================================================

// --------------------------------------------------
// WIDGET: BalanceSummary
// --------------------------------------------------
export const BalanceSummary: FC = () => {
    const { data, loading } = useData();

    const summary = useMemo(() => {
        if (!data) return { assets: 0, liabilities: 0, netWorth: 0 };
        const assets = data.accounts
            .filter(acc => acc.type !== 'credit_card' && acc.type !== 'loan' && acc.type !== 'mortgage')
            .reduce((sum, acc) => sum + acc.balance, 0);
        const liabilities = data.accounts
            .filter(acc => acc.type === 'credit_card' || acc.type === 'loan' || acc.type === 'mortgage')
            .reduce((sum, acc) => sum + acc.balance, 0);
        const netWorth = assets + liabilities; // Liabilities are negative
        return { assets, liabilities, netWorth };
    }, [data]);
    
    const netWorthChange = useMemo(() => {
        if (!data || data.wealthHistory.length < 2) return { amount: 0, percentage: 0 };
        const last = data.wealthHistory[data.wealthHistory.length - 1].netWorth;
        const prev = data.wealthHistory[data.wealthHistory.length - 2].netWorth;
        const amount = last - prev;
        const percentage = (amount / prev) * 100;
        return { amount, percentage };
    }, [data]);

    if (loading) return <BalanceSummarySkeleton />;

    const isPositiveChange = netWorthChange.amount >= 0;

    return (
        <DashboardCard title="Strategic Overview" className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                    <p className="text-sm text-gray-400">Total Assets</p>
                    <p className="text-3xl font-bold text-green-400">{formatCurrency(summary.assets, data?.profile.preferredCurrency)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Total Liabilities</p>
                    <p className="text-3xl font-bold text-red-400">{formatCurrency(Math.abs(summary.liabilities), data?.profile.preferredCurrency)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Net Worth</p>
                    <p className="text-4xl font-extrabold text-white">{formatCurrency(summary.netWorth, data?.profile.preferredCurrency)}</p>
                    <div className={`flex items-center justify-center text-sm mt-1 ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositiveChange ? '▲' : '▼'}
                        <span className="ml-1">{formatCurrency(netWorthChange.amount)} ({netWorthChange.percentage.toFixed(2)}%)</span>
                        <span className="text-gray-400 ml-1">vs yesterday</span>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
};

export const BalanceSummarySkeleton: FC = () => (
    <DashboardCard title="Strategic Overview" className="col-span-1 md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
                <SkeletonLoader className="h-4 w-24 mx-auto mb-2" />
                <SkeletonLoader className="h-9 w-40 mx-auto" />
            </div>
            <div>
                <SkeletonLoader className="h-4 w-28 mx-auto mb-2" />
                <SkeletonLoader className="h-9 w-36 mx-auto" />
            </div>
            <div>
                <SkeletonLoader className="h-4 w-20 mx-auto mb-2" />
                <SkeletonLoader className="h-10 w-48 mx-auto" />
                <SkeletonLoader className="h-4 w-32 mx-auto mt-2" />
            </div>
        </div>
    </DashboardCard>
);


// --------------------------------------------------
// WIDGET: RecentTransactions
// --------------------------------------------------
const TRANSACTIONS_PER_PAGE = 7;

export const RecentTransactions: FC = () => {
    const { data, loading } = useData();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<TransactionCategory | 'all'>('all');
    
    const filteredTransactions = useMemo(() => {
        if (!data) return [];
        return data.transactions
            .filter(t => 
                (t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 t.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (filterCategory === 'all' || t.category === filterCategory)
            );
    }, [data, searchTerm, filterCategory]);
    
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
        return filteredTransactions.slice(startIndex, startIndex + TRANSACTIONS_PER_PAGE);
    }, [filteredTransactions, currentPage]);

    const totalPages = Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };
    
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    if (loading) return <RecentTransactionsSkeleton />;
    
    const categories = useMemo(() => {
        if (!data) return [];
        return ['all', ...Array.from(new Set(data.transactions.map(t => t.category)))];
    }, [data]);

    return (
        <DashboardCard title="Recent Dispatches" className="col-span-1 md:col-span-3">
             <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <input
                    type="text"
                    placeholder="Search dispatches..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                />
                 <select
                     value={filterCategory}
                     onChange={(e) => {
                         setFilterCategory(e.target.value as TransactionCategory | 'all');
                         setCurrentPage(1);
                     }}
                     className="bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                 >
                     {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
                 </select>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedTransactions.map((tx) => (
                            <tr key={tx.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{tx.description}</td>
                                <td className="px-6 py-4">{formatDate(tx.date, { month: 'short', day: 'numeric' })}</td>
                                <td className="px-6 py-4">{tx.category}</td>
                                <td className={`px-6 py-4 text-right font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatCurrency(tx.amount, tx.currency)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {totalPages > 1 && (
                 <div className="flex justify-between items-center mt-4">
                     <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-600 rounded-md disabled:opacity-50">Previous</button>
                     <span className="text-gray-400">Page {currentPage} of {totalPages}</span>
                     <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-600 rounded-md disabled:opacity-50">Next</button>
                 </div>
             )}
        </DashboardCard>
    );
};

export const RecentTransactionsSkeleton: FC = () => (
    <DashboardCard title="Recent Dispatches" className="col-span-1 md:col-span-3">
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                    <div className="flex-1">
                        <SkeletonLoader className="h-5 w-3/4 mb-1" />
                        <SkeletonLoader className="h-3 w-1/2" />
                    </div>
                    <SkeletonLoader className="h-6 w-24" />
                </div>
            ))}
        </div>
    </DashboardCard>
);

// --------------------------------------------------
// WIDGET: AIInsights
// --------------------------------------------------
export const AIInsights: FC = () => {
    const { data, loading } = useData();

    const getSeverityClasses = (severity: AIInsight['severity']) => {
        switch (severity) {
            case 'critical': return 'border-red-500 bg-red-900/20';
            case 'warning': return 'border-yellow-500 bg-yellow-900/20';
            case 'info': return 'border-blue-500 bg-blue-900/20';
            default: return 'border-gray-600 bg-gray-700/20';
        }
    };

    if (loading) return <AIInsightsSkeleton />;

    return (
        <DashboardCard title="A Communique From Your Agent">
            <div className="space-y-4">
                {data?.insights.map((insight) => (
                    <div key={insight.id} className={`p-4 border-l-4 rounded-r-lg ${getSeverityClasses(insight.severity)}`}>
                        <h3 className="font-semibold text-white">{insight.title}</h3>
                        <p className="text-sm text-gray-300 mt-1">{insight.summary}</p>
                        {insight.actionable && (
                            <button className="mt-2 text-sm text-blue-400 hover:text-blue-300 font-semibold">
                                {insight.actionText || 'Take Action'} &rarr;
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
};

export const AIInsightsSkeleton: FC = () => (
    <DashboardCard title="A Communique From Your Agent">
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border-l-4 border-gray-600 rounded-r-lg">
                    <SkeletonLoader className="h-5 w-3/4 mb-2" />
                    <SkeletonLoader className="h-3 w-full" />
                    <SkeletonLoader className="h-3 w-5/6 mt-1" />
                </div>
            ))}
        </div>
    </DashboardCard>
);

// --------------------------------------------------
// WIDGET: WealthTimeline
// --------------------------------------------------
const SVG_WIDTH = 500;
const SVG_HEIGHT = 200;
const PADDING = { top: 20, right: 20, bottom: 30, left: 50 };

export const WealthTimeline: FC = () => {
    const { data, loading } = useData();
    const [timeframe, setTimeframe] = useState<'1M' | '3M' | '1Y' | 'ALL'>('1Y');

    const chartData = useMemo(() => {
        if (!data) return [];
        const now = new Date();
        const filtered = data.wealthHistory.filter(({ date }) => {
            const d = new Date(date);
            switch (timeframe) {
                case '1M': return d > subtractDays(now, 30);
                case '3M': return d > subtractDays(now, 90);
                case '1Y': return d > subtractDays(now, 365);
                case 'ALL': return true;
                default: return true;
            }
        });
        return filtered.map(d => ({...d, date: new Date(d.date)}));
    }, [data, timeframe]);

    const path = useMemo(() => {
        if (chartData.length < 2) return "";

        const xMin = chartData[0].date.getTime();
        const xMax = chartData[chartData.length - 1].date.getTime();
        const yMin = Math.min(...chartData.map(d => d.netWorth));
        const yMax = Math.max(...chartData.map(d => d.netWorth));
        
        const xScale = (time: number) => PADDING.left + ((time - xMin) / (xMax - xMin)) * (SVG_WIDTH - PADDING.left - PADDING.right);
        const yScale = (value: number) => PADDING.top + (SVG_HEIGHT - PADDING.top - PADDING.bottom) * (1 - (value - yMin) / (yMax - yMin));

        return chartData.map((d, i) => {
            const x = xScale(d.date.getTime());
            const y = yScale(d.netWorth);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        }).join(' ');
    }, [chartData]);
    
    if (loading) return <WealthTimelineSkeleton />;
    
    const yAxisLabels = useMemo(() => {
        if (chartData.length < 2) return [];
        const yMin = Math.min(...chartData.map(d => d.netWorth));
        const yMax = Math.max(...chartData.map(d => d.netWorth));
        const labels = [];
        for (let i = 0; i < 5; i++) {
            labels.push(yMin + (i / 4) * (yMax - yMin));
        }
        return labels;
    }, [chartData]);

    const yMin = Math.min(...chartData.map(d => d.netWorth));
    const yMax = Math.max(...chartData.map(d => d.netWorth));
    const yScale = (value: number) => PADDING.top + (SVG_HEIGHT - PADDING.top - PADDING.bottom) * (1 - (value - yMin) / (yMax - yMin));


    return (
        <DashboardCard title="Campaign Trajectory" className="col-span-1 md:col-span-2">
            <div className="flex justify-end mb-2">
                {(['1M', '3M', '1Y', 'ALL'] as const).map(tf => (
                    <button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1 text-sm rounded-md ${timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                        {tf}
                    </button>
                ))}
            </div>
            <div className="relative">
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto">
                    <defs>
                        <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    
                    {/* Y-Axis Grid Lines & Labels */}
                    {yAxisLabels.map((label, i) => (
                        <g key={i}>
                            <line
                                x1={PADDING.left} y1={yScale(label)}
                                x2={SVG_WIDTH - PADDING.right} y2={yScale(label)}
                                stroke="#4a5568" strokeWidth="0.5"
                            />
                            <text
                                x={PADDING.left - 8} y={yScale(label) + 3}
                                textAnchor="end" fill="#9ca3af" fontSize="10">
                                {`${(label / 1000).toFixed(0)}k`}
                            </text>
                        </g>
                    ))}
                    
                    <path d={path} fill="none" stroke="#10b981" strokeWidth="2" />
                    <path d={`${path} L ${SVG_WIDTH - PADDING.right} ${SVG_HEIGHT - PADDING.bottom} L ${PADDING.left} ${SVG_HEIGHT - PADDING.bottom} Z`} fill="url(#wealthGradient)" />
                </svg>
            </div>
        </DashboardCard>
    );
};

export const WealthTimelineSkeleton: FC = () => (
    <DashboardCard title="Campaign Trajectory" className="col-span-1 md:col-span-2">
        <div className="w-full h-48 bg-gray-700 animate-pulse rounded-md" />
    </DashboardCard>
);

// --------------------------------------------------
// WIDGET: SpendingByCategory
// --------------------------------------------------
export const SpendingByCategory: FC = () => {
    const { data, loading } = useData();

    const spendingData = useMemo(() => {
        if (!data) return [];
        const spendingMap = new Map<TransactionCategory, number>();
        data.transactions
            .filter(t => t.amount < 0 && t.category !== 'Investments')
            .forEach(t => {
                const current = spendingMap.get(t.category) || 0;
                spendingMap.set(t.category, current + Math.abs(t.amount));
            });
        
        return Array.from(spendingMap.entries())
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [data]);
    
    if (loading) return <SpendingByCategorySkeleton />;
    
    const totalSpent = spendingData.reduce((sum, item) => sum + item.amount, 0);

    return (
        <DashboardCard title="Spending Breakdown">
            <div className="space-y-3">
                {spendingData.slice(0, 5).map(({ category, amount }) => (
                    <div key={category}>
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-gray-300">{category}</span>
                            <span className="text-sm font-medium text-gray-300">{formatCurrency(amount, data?.profile.preferredCurrency)}</span>
                        </div>
                        <ProgressBar percentage={(amount / totalSpent) * 100} colorClass="bg-purple-500" />
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
};

export const SpendingByCategorySkeleton: FC = () => (
    <DashboardCard title="Spending Breakdown">
         <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i}>
                    <div className="flex justify-between mb-1">
                        <SkeletonLoader className="h-4 w-24" />
                        <SkeletonLoader className="h-4 w-16" />
                    </div>
                    <SkeletonLoader className="h-2.5 w-full" />
                </div>
            ))}
        </div>
    </DashboardCard>
);

// --------------------------------------------------
// WIDGET: FinancialGoals
// --------------------------------------------------
export const FinancialGoals: FC = () => {
    const { data, loading } = useData();
    
    if (loading) return <FinancialGoalsSkeleton />;

    const sortedGoals = data ? [...data.goals].sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount)) : [];

    return (
        <DashboardCard title="Financial Goals">
            <div className="space-y-4">
                {sortedGoals.map(goal => (
                    <div key={goal.id}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-white">{goal.name}</span>
                            <span className="text-sm text-gray-400">
                                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                            </span>
                        </div>
                        <ProgressBar percentage={getProgressPercentage(goal.currentAmount, goal.targetAmount)} />
                        <p className="text-xs text-right text-gray-500 mt-1">Target: {formatDate(goal.targetDate, { month: 'long', year: 'numeric' })}</p>
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
};

export const FinancialGoalsSkeleton: FC = () => (
    <DashboardCard title="Financial Goals">
         <div className="space-y-5">
            {[...Array(3)].map((_, i) => (
                <div key={i}>
                    <div className="flex justify-between mb-2">
                        <SkeletonLoader className="h-5 w-32" />
                        <SkeletonLoader className="h-4 w-40" />
                    </div>
                    <SkeletonLoader className="h-2.5 w-full" />
                </div>
            ))}
        </div>
    </DashboardCard>
);

// --------------------------------------------------
// WIDGET: BillsAndSubscriptions
// --------------------------------------------------
export const BillsAndSubscriptions: FC = () => {
    const { data, loading } = useData();
    
    const getStatusColor = (status: Bill['status']) => {
        if (status === 'overdue') return 'text-red-400';
        if (status === 'due') return 'text-yellow-400';
        return 'text-green-400';
    };

    if (loading) return <BillsAndSubscriptionsSkeleton />;
    
    const sortedBills = data ? [...data.bills].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) : [];

    return (
        <DashboardCard title="Upcoming Bills & Subscriptions">
            <ul className="space-y-3">
                {sortedBills.map(bill => (
                    <li key={bill.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-medium text-white">{bill.name}</p>
                            <p className="text-sm text-gray-400">Due: {formatDate(bill.dueDate)}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-semibold text-lg text-white">{formatCurrency(bill.amount)}</p>
                           <p className={`text-sm font-bold capitalize ${getStatusColor(bill.status)}`}>{bill.status}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </DashboardCard>
    );
};

export const BillsAndSubscriptionsSkeleton: FC = () => (
    <DashboardCard title="Upcoming Bills & Subscriptions">
        <ul className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <li key={i} className="flex justify-between items-center">
                    <div>
                        <SkeletonLoader className="h-5 w-32 mb-1" />
                        <SkeletonLoader className="h-4 w-24" />
                    </div>
                    <SkeletonLoader className="h-6 w-20" />
                </li>
            ))}
        </ul>
    </DashboardCard>
);


//================================================================================================
// SECTION: MAIN DASHBOARD VIEW
// Description: The primary component that assembles all widgets into the final layout.
//================================================================================================

/**
 * # The Command Center
 * A Guide to the Sovereign's Throne Room
 *
 * ## The Concept
 *
 * The `DashboardView.tsx` component is the sovereign's "Command Center." It's the point of ultimate oversight and the starting point for any strategic action within the application. It is designed not as a dense report, but as a calm, clear, and powerful overview of your entire domain. Its purpose is to provide a sense of absolute control and clarity at a single glance.
 *
 * ### A Simple Metaphor: The War Room
 *
 * Think of the Dashboard as your personal war room. It's a perfectly organized space with all your most critical intelligence and strategic assets laid out and ready for command.
 *
 * -   **The Strategic Map (`BalanceSummary`)**: This is the main map on the central table. It shows you the current state of your resources—your total assets and the direction of their momentum.
 *
 * -   **Recent Dispatches (`RecentTransactions`)**: This is your field log, showing the last few significant actions taken within your domain. It's a quick summary of recent movements.
 *
 * -   **A Communique from your Agent (`AIInsights`)**: This is a high-priority intelligence report from your AI field agent. It points out a critical pattern or an exploitable opportunity you might have missed.
 *
 * -   **The Campaign Trajectory (`WealthTimeline`)**: This is the grand strategy chart on the wall, showing not just past campaigns but the projected path of your current one. It maps out your history of conquest and your probable future.
 *
 * ### How It Works
 *
 * 1.  **Gathering Intelligence**: When the Command Center is accessed, it reaches into the `DataContext` (the system's core truth) and gathers all necessary intelligence: the latest transaction records, the state of your assets, any directives from the AI, etc.
 *
 * 2.  **Organizing the Instruments**: It then arranges this intelligence into the various "instrument panel" components (`BalanceSummary`, `RecentTransactions`, etc.). Each instrument is specialized to present one piece of intelligence with absolute clarity.
 *
 * 3.  **The Holistic View**: By arranging these instruments together in a clean grid, the Command Center provides a holistic, "at-a-glance" view of your entire domain. You do not have to dig for intelligence; the most critical truths are presented to you, clearly and calmly.
 *
 * ### The Philosophy: From Chaos to Command
 *
 * The purpose of the Command Center is to transform the often chaotic and complex world of finance into a calm, clear, and commandable picture. It is a space designed to eliminate doubt, not create it. By presenting a balanced and insightful overview, the Command Center empowers the sovereign to begin their session feeling informed, confident, and in absolute control.
 */
export const DashboardViewContent: FC = () => {
    const { data, loading, error } = useData();

    if (error) {
        return (
            <div className="text-center text-red-500 bg-red-900/50 p-8 rounded-lg">
                <h2 className="text-2xl font-bold">Error Fetching Command Center Data</h2>
                <p className="mt-2">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-900 text-white min-h-screen">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-100">
                    {loading ? <SkeletonLoader className="h-10 w-80" /> : `Welcome, ${data?.profile.name}`}
                </h1>
                <p className="text-lg text-gray-400">
                    {loading ? <SkeletonLoader className="h-6 w-96 mt-2" /> : `Here is your financial command center overview for ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`}
                </p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
                    <BalanceSummary />
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2">
                    <WealthTimeline />
                </div>
                
                <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2">
                     <AIInsights />
                </div>
                
                <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
                    <RecentTransactions />
                </div>

                <div className="col-span-1 md:col-span-1 lg:col-span-1">
                    <SpendingByCategory />
                </div>

                <div className="col-span-1 md:col-span-1 lg:col-span-1">
                    <FinancialGoals />
                </div>
                
                <div className="col-span-1 md:col-span-1 lg:col-span-1">
                    <BillsAndSubscriptions />
                </div>
                
                {/* Additional widgets can be added here easily */}

            </main>
        </div>
    );
};

export const DashboardView: FC = () => (
    <DataProvider>
        <DashboardViewContent />
    </DataProvider>
);

export default DashboardView;