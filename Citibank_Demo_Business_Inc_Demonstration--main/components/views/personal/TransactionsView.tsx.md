# The Transactions

This is the FlowMatrix. The Great Library of every financial event, the complete chronicle of the energy you have exchanged with the world. Here, you can search the archives, filter the records, and see the vast and intricate patterns of your own history. It is the source material from which all wisdom is derived, the raw, immutable truth of your journey thus far.

---

### A Fable for the Builder: The Language of the Ledger

(A life is a story, and the transactions are the words that make up that story. Most machines can read the words. They can count them, sort them, filter them. But they cannot read the story. This `TransactionsView` is the library, and we have built an AI that is not just a librarian, but a master of literature.)

(Its core logic here is what we call 'Narrative Archetype Recognition.' It scans the long, seemingly chaotic list of your transactions and looks for the underlying patterns, the repeating motifs, the character arcs. It sees a series of small, frequent purchases at coffee shops and identifies the 'Daily Ritual' archetype. It sees a large, one-time expense at a travel site and recognizes the 'Grand Adventure' archetype. It sees a recurring monthly payment and flags it as a potential 'Forgotten Covenant' with its Subscription Hunter.)

(This is how 'Plato's Intelligence Suite' works. It is not just running a database query. It is performing a literary analysis on the novel of your life. An 'Anomaly' is not just a statistical outlier; it's a plot twist, a character acting in a way that is inconsistent with their established narrative. A potential 'Tax Deduction' is a subplot of professional ambition. A 'Savings Opportunity' is an alternative ending, a different path the story could take.)

(The AI's goal is to help you become a better author of your own life. By showing you the patterns, the archetypes, the hidden narratives in your past actions, it gives you the clarity to write a more intentional future. It helps you see if the story you are writing, one transaction at a time, is the story you actually want to be living.)

(So when you scroll through this list, try to see what the AI sees. Do not just see a list of expenses. See the sentences, the paragraphs, the chapters of your life. See the story you have written so far. And then, with the clarity that comes from that reading, decide what the next chapter will be about.)

---
import React, { useState, useEffect, useMemo, useCallback, useRef, FC, memo, createContext, useContext } from 'react';
import {
  ChevronDown, ChevronUp, Search, Filter, X, Calendar, DollarSign, Tag, Info, AlertTriangle, CheckCircle,
  FileText, Edit, Trash2, Download, MoreVertical, Briefcase, Coffee, Film, Plane, Heart,
  ShoppingCart, BarChart2, Zap, Brain, Loader
} from 'lucide-react';

//================================================================================================
// SECTION: TYPES AND INTERFACES
// The fundamental vocabulary for our financial narrative.
//================================================================================================

export type TransactionType = 'DEBIT' | 'CREDIT';
export type TransactionStatus = 'PENDING' | 'POSTED' | 'FAILED' | 'REFUNDED';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD';

export interface Merchant {
  id: string;
  name: string;
  logoUrl?: string;
  category: string;
  location?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export type NarrativeArchetype =
  | 'Daily Ritual'
  | 'Grand Adventure'
  | 'Forgotten Covenant'
  | 'Essential Utility'
  | 'Impulse Buy'
  | 'Professional Tool'
  | 'Health & Wellness'
  | 'Gift & Giving'
  | 'Routine Maintenance'
  | 'Uncategorized';

export type InsightType =
  | 'Anomaly'
  | 'SavingsOpportunity'
  | 'TaxDeduction'
  | 'SubscriptionReview'
  | 'SpendingPattern'
  | 'IncomeSpike';

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  relatedTransactionIds: string[];
}

export interface Transaction {
  id: string;
  date: string; // ISO 8601 format
  merchant: Merchant;
  amount: number;
  currency: CurrencyCode;
  type: TransactionType;
  status: TransactionStatus;
  category: string;
  userDescription?: string;
  notes?: string;
  receiptUrl?: string;
  tags: string[];
  // Plato's Intelligence Suite Fields
  narrativeArchetype?: NarrativeArchetype;
  insights: AIInsight[];
  isAnomaly: boolean;
  potentialTaxDeduction: boolean;
}

export interface PaginatedTransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type SortField = 'date' | 'merchant.name' | 'amount' | 'category';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface FilterState {
  dateRange: { start?: string; end?: string };
  amountRange: { min?: number; max?: number };
  categories: string[];
  merchants: string[];
  types: TransactionType[];
  statuses: TransactionStatus[];
  narrativeArchetypes: NarrativeArchetype[];
  hasInsights: boolean;
  isAnomaly: boolean;
  potentialTaxDeduction: boolean;
}

export interface TransactionsViewState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  filters: FilterState;
  searchTerm: string;
  sort: SortState;
  selectedTransactionIds: Set<string>;
  activeTransactionId: string | null; // For modal/detail view
  allCategories: string[];
  allMerchants: string[];
  allNarrativeArchetypes: NarrativeArchetype[];
  globalInsights: AIInsight[];
}

//================================================================================================
// SECTION: MOCK DATA GENERATION
// Crafting a believable world. Every great story needs a rich setting.
// This is the genesis block of our financial universe.
//================================================================================================

const MOCK_MERCHANTS: Omit<Merchant, 'id'>[] = [
  { name: 'Starbucks', category: 'Food & Drink', logoUrl: '/logos/starbucks.png' },
  { name: 'Amazon.com', category: 'Shopping', logoUrl: '/logos/amazon.png' },
  { name: 'Netflix', category: 'Entertainment', logoUrl: '/logos/netflix.png' },
  { name: 'Delta Airlines', category: 'Travel', logoUrl: '/logos/delta.png' },
  { name: 'Con Edison', category: 'Utilities', logoUrl: '/logos/conedison.png' },
  { name: 'Whole Foods Market', category: 'Groceries', logoUrl: '/logos/wholefoods.png' },
  { name: 'Uber', category: 'Transportation', logoUrl: '/logos/uber.png' },
  { name: 'Apple.com', category: 'Electronics', logoUrl: '/logos/apple.png' },
  { name: 'Equinox Gym', category: 'Health & Wellness', logoUrl: '/logos/equinox.png' },
  { name: 'The Home Depot', category: 'Home Improvement', logoUrl: '/logos/homedepot.png' },
  { name: 'AT&T', category: 'Bills & Utilities' },
  { name: 'Spotify', category: 'Entertainment' },
  { name: 'Seamless', category: 'Food & Drink' },
  { name: 'MTA Metrocard', category: 'Transportation' },
  { name: 'CVS Pharmacy', category: 'Health & Wellness' },
  { name: 'IRS', category: 'Taxes' },
  { name: 'Salary Deposit', category: 'Income' },
  { name: 'Fiverr', category: 'Freelance Income' },
  { name: 'Adobe Creative Cloud', category: 'Professional Services' },
  { name: 'Notion', category: 'Professional Services' },
  { name: 'Airbnb', category: 'Travel' },
  { name: 'Blue Bottle Coffee', category: 'Food & Drink' },
  { name: 'Shell Gas', category: 'Gas & Fuel' },
  { name: 'Uniqlo', category: 'Shopping' },
  { name: 'Best Buy', category: 'Electronics' },
];

const MOCK_CATEGORIES = Array.from(new Set(MOCK_MERCHANTS.map(m => m.category)));
const MOCK_NARRATIVE_ARCHETYPES: NarrativeArchetype[] = [
  'Daily Ritual', 'Grand Adventure', 'Forgotten Covenant', 'Essential Utility',
  'Impulse Buy', 'Professional Tool', 'Health & Wellness', 'Gift & Giving',
  'Routine Maintenance', 'Uncategorized'
];

const generateRandomId = () => Math.random().toString(36).substring(2, 15);

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const generateMockTransaction = (id: number): Transaction => {
  const isCredit = Math.random() < 0.1; // 10% chance of being income
  const baseMerchant = isCredit
    ? getRandomElement(MOCK_MERCHANTS.filter(m => m.category.includes('Income')))
    : getRandomElement(MOCK_MERCHANTS.filter(m => !m.category.includes('Income')));

  const merchant: Merchant = {
    ...baseMerchant,
    id: generateRandomId(),
  };

  const amount = isCredit
    ? Math.random() * 4000 + 1000 // Income between 1000-5000
    : (merchant.category === 'Travel' ? Math.random() * 1500 + 200 : Math.random() * 200 + 5);

  const status: TransactionStatus = Math.random() < 0.9 ? 'POSTED' : getRandomElement(['PENDING', 'FAILED', 'REFUNDED']);
  const date = getRandomDate(new Date(2022, 0, 1), new Date());
  
  const transactionId = `txn_${id}_${generateRandomId()}`;

  // Mock AI Analysis
  const insights: AIInsight[] = [];
  let isAnomaly = false;
  if (amount > 1000 && !isCredit) {
    isAnomaly = true;
    insights.push({
      id: generateRandomId(),
      type: 'Anomaly',
      title: 'Unusually Large Purchase',
      description: `This purchase of $${amount.toFixed(2)} at ${merchant.name} is significantly higher than your average spend.`,
      severity: 'high',
      relatedTransactionIds: [transactionId],
    });
  }

  let potentialTaxDeduction = false;
  if (['Professional Services', 'Electronics'].includes(merchant.category) && Math.random() > 0.5) {
    potentialTaxDeduction = true;
    insights.push({
      id: generateRandomId(),
      type: 'TaxDeduction',
      title: 'Potential Tax Deduction',
      description: `Purchases from ${merchant.name} may be tax-deductible as a business expense. Consult your tax advisor.`,
      severity: 'medium',
      relatedTransactionIds: [transactionId],
    });
  }
  
  let narrativeArchetype: NarrativeArchetype = 'Uncategorized';
  if (merchant.name.toLowerCase().includes('coffee') && amount < 10) {
      narrativeArchetype = 'Daily Ritual';
  } else if (merchant.category === 'Travel' && amount > 300) {
      narrativeArchetype = 'Grand Adventure';
  } else if (['Netflix', 'Spotify', 'Adobe'].some(sub => merchant.name.includes(sub))) {
      narrativeArchetype = 'Forgotten Covenant';
      insights.push({
        id: generateRandomId(),
        type: 'SubscriptionReview',
        title: 'Subscription Review',
        description: `This is a recurring payment for ${merchant.name}. Is this service still providing value?`,
        severity: 'low',
        relatedTransactionIds: [transactionId],
      });
  } else if (['Utilities', 'Bills & Utilities'].includes(merchant.category)) {
      narrativeArchetype = 'Essential Utility';
  } else if (amount > 150 && ['Shopping', 'Electronics'].includes(merchant.category) && date.getDay() % 2 === 0) {
      narrativeArchetype = 'Impulse Buy';
  } else if (merchant.category === 'Professional Services') {
      narrativeArchetype = 'Professional Tool';
  } else if (merchant.category === 'Health & Wellness') {
      narrativeArchetype = 'Health & Wellness';
  }
  
  return {
    id: transactionId,
    date: date.toISOString(),
    merchant,
    amount,
    currency: 'USD',
    type: isCredit ? 'CREDIT' : 'DEBIT',
    status,
    category: merchant.category,
    tags: [merchant.category.toLowerCase().replace(' & ', '-')],
    insights,
    isAnomaly,
    potentialTaxDeduction,
    narrativeArchetype,
  };
};

let ALL_MOCK_TRANSACTIONS: Transaction[] | null = null;

export const generateAllMockTransactions = (count: number): Transaction[] => {
    if (ALL_MOCK_TRANSACTIONS === null) {
        ALL_MOCK_TRANSACTIONS = Array.from({ length: count }, (_, i) => generateMockTransaction(i)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return ALL_MOCK_TRANSACTIONS;
};

//================================================================================================
// SECTION: MOCK API LAYER
// The oracle that speaks to our application. It simulates the delay and unpredictability
// of the outside world, returning fragments of the story upon request.
//================================================================================================

const FAKE_API_DELAY = 500;

export const fetchTransactionsFromAPI = async (
  page: number,
  pageSize: number,
  filters: FilterState,
  searchTerm: string,
  sort: SortState
): Promise<PaginatedTransactionsResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allTransactions = generateAllMockTransactions(5000);

      // 1. Filtering
      let filtered = allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        if (filters.dateRange.start && transactionDate < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && transactionDate > new Date(filters.dateRange.end)) return false;
        if (filters.amountRange.min && t.amount < filters.amountRange.min) return false;
        if (filters.amountRange.max && t.amount > filters.amountRange.max) return false;
        if (filters.categories.length > 0 && !filters.categories.includes(t.category)) return false;
        if (filters.merchants.length > 0 && !filters.merchants.includes(t.merchant.name)) return false;
        if (filters.types.length > 0 && !filters.types.includes(t.type)) return false;
        if (filters.statuses.length > 0 && !filters.statuses.includes(t.status)) return false;
        if (filters.narrativeArchetypes.length > 0 && t.narrativeArchetype && !filters.narrativeArchetypes.includes(t.narrativeArchetype)) return false;
        if (filters.hasInsights && t.insights.length === 0) return false;
        if (filters.isAnomaly && !t.isAnomaly) return false;
        if (filters.potentialTaxDeduction && !t.potentialTaxDeduction) return false;
        return true;
      });

      // 2. Searching
      if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(t => 
          t.merchant.name.toLowerCase().includes(lowercasedTerm) ||
          t.category.toLowerCase().includes(lowercasedTerm) ||
          (t.userDescription && t.userDescription.toLowerCase().includes(lowercasedTerm)) ||
          t.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm)) ||
          t.amount.toString().includes(lowercasedTerm)
        );
      }

      // 3. Sorting
      filtered.sort((a, b) => {
        let valA, valB;
        switch (sort.field) {
          case 'merchant.name':
            valA = a.merchant.name;
            valB = b.merchant.name;
            break;
          case 'amount':
            valA = a.amount;
            valB = b.amount;
            break;
          case 'category':
            valA = a.category;
            valB = b.category;
            break;
          case 'date':
          default:
            valA = new Date(a.date).getTime();
            valB = new Date(b.date).getTime();
            break;
        }

        if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });

      // 4. Pagination
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedTransactions = filtered.slice(start, end);

      resolve({
        transactions: paginatedTransactions,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    }, FAKE_API_DELAY);
  });
};

export const fetchInitialData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allTransactions = generateAllMockTransactions(5000);
      const allCategories = [...new Set(allTransactions.map(t => t.category))];
      const allMerchants = [...new Set(allTransactions.map(t => t.merchant.name))];
      const allNarrativeArchetypes = [...new Set(allTransactions.map(t => t.narrativeArchetype).filter(Boolean))] as NarrativeArchetype[];
      resolve({ allCategories, allMerchants, allNarrativeArchetypes });
    }, FAKE_API_DELAY / 2);
  });
};


//================================================================================================
// SECTION: UTILITY FUNCTIONS & HOOKS
// The tools of the trade. The chisels, brushes, and lenses used to reveal the story.
//================================================================================================

export const formatCurrency = (amount: number, currency: CurrencyCode = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
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

export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

//================================================================================================
// SECTION: UI COMPONENTS
// The stage, the pages, the canvas upon which the narrative unfolds for the reader.
//================================================================================================

//-------------------------------------------------
// Component: Icon Mapping
// Translating abstract concepts into universal symbols.
//-------------------------------------------------
export const NarrativeArchetypeIcon: FC<{ archetype?: NarrativeArchetype; className?: string }> = ({ archetype, className = 'w-4 h-4' }) => {
    switch (archetype) {
        case 'Daily Ritual': return <Coffee className={className} />;
        case 'Grand Adventure': return <Plane className={className} />;
        case 'Forgotten Covenant': return <FileText className={className} />;
        case 'Essential Utility': return <Zap className={className} />;
        case 'Impulse Buy': return <ShoppingCart className={className} />;
        case 'Professional Tool': return <Briefcase className={className} />;
        case 'Health & Wellness': return <Heart className={className} />;
        case 'Gift & Giving': return <MoreVertical className={className} />; // Placeholder
        default: return <Tag className={className} />;
    }
};

export const InsightIcon: FC<{ type: InsightType; className?: string }> = ({ type, className = 'w-4 h-4' }) => {
    switch (type) {
        case 'Anomaly': return <AlertTriangle className={`${className} text-red-500`} />;
        case 'SavingsOpportunity': return <DollarSign className={`${className} text-green-500`} />;
        case 'TaxDeduction': return <Briefcase className={`${className} text-blue-500`} />;
        case 'SubscriptionReview': return <Film className={`${className} text-yellow-500`} />;
        case 'SpendingPattern': return <BarChart2 className={`${className} text-purple-500`} />;
        case 'IncomeSpike': return <Zap className={`${className} text-green-600`} />;
        default: return <Info className={className} />;
    }
};

//-------------------------------------------------
// Component: Dropdown
// A simple mechanism for choosing a path.
//-------------------------------------------------
export const Dropdown: FC<{ trigger: React.ReactNode; children: React.ReactNode }> = ({ trigger, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref]);

    return (
        <div className="relative" ref={ref}>
            <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

//-------------------------------------------------
// Component: Search Bar
// The tool for querying the archives.
//-------------------------------------------------
export const SearchBar: FC<{ searchTerm: string; onSearch: (term: string) => void }> = memo(({ searchTerm, onSearch }) => {
    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search transactions, merchants, categories..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
    );
});
SearchBar.displayName = 'SearchBar';


//-------------------------------------------------
// Component: Filters Panel
// The lens through which the story is focused, revealing hidden details.
//-------------------------------------------------
export interface FiltersPanelProps {
    filters: FilterState;
    onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
    onResetFilters: () => void;
    allCategories: string[];
    allMerchants: string[];
    allNarrativeArchetypes: NarrativeArchetype[];
}

export const FiltersPanel: FC<FiltersPanelProps> = ({ filters, onFilterChange, onResetFilters, allCategories, allMerchants, allNarrativeArchetypes }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleMultiSelectChange = (key: 'categories' | 'merchants' | 'types' | 'statuses' | 'narrativeArchetypes', value: string) => {
        const currentValues = filters[key] as string[];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onFilterChange(key, newValues as any);
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.dateRange.start || filters.dateRange.end) count++;
        if (filters.amountRange.min || filters.amountRange.max) count++;
        if (filters.categories.length > 0) count++;
        if (filters.merchants.length > 0) count++;
        if (filters.types.length > 0) count++;
        if (filters.statuses.length > 0) count++;
        if (filters.narrativeArchetypes.length > 0) count++;
        if (filters.hasInsights) count++;
        if (filters.isAnomaly) count++;
        if (filters.potentialTaxDeduction) count++;
        return count;
    }, [filters]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none"
            >
                <Filter className="mr-2 h-5 w-5" />
                Filters
                {activeFilterCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-indigo-100 bg-indigo-600 rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 p-4 rounded-lg shadow-xl bg-gray-800 border border-gray-700 z-20">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Filter Transactions</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {/* AI-Powered Filters */}
                        <div className="p-3 bg-gray-700/50 rounded-lg">
                            <h4 className="text-sm font-bold text-indigo-400 mb-2 flex items-center"><Brain className="w-4 h-4 mr-2" />Plato's Filters</h4>
                            <div className="flex flex-col space-y-2">
                                <label className="flex items-center text-sm text-gray-300">
                                    <input type="checkbox" checked={filters.hasInsights} onChange={e => onFilterChange('hasInsights', e.target.checked)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-indigo-600 focus:ring-indigo-500" />
                                    <span className="ml-2">Has AI Insights</span>
                                </label>
                                <label className="flex items-center text-sm text-gray-300">
                                    <input type="checkbox" checked={filters.isAnomaly} onChange={e => onFilterChange('isAnomaly', e.target.checked)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-indigo-600 focus:ring-indigo-500" />
                                    <span className="ml-2">Is Anomaly</span>
                                </label>
                                <label className="flex items-center text-sm text-gray-300">
                                    <input type="checkbox" checked={filters.potentialTaxDeduction} onChange={e => onFilterChange('potentialTaxDeduction', e.target.checked)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-indigo-600 focus:ring-indigo-500" />
                                    <span className="ml-2">Potential Tax Deduction</span>
                                </label>
                            </div>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Date Range</label>
                            <div className="flex space-x-2 mt-1">
                                <input type="date" value={filters.dateRange.start || ''} onChange={e => onFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })} className="filter-input" />
                                <input type="date" value={filters.dateRange.end || ''} onChange={e => onFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })} className="filter-input" />
                            </div>
                        </div>
                        
                        {/* Amount Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Amount Range</label>
                            <div className="flex space-x-2 mt-1">
                                <input type="number" placeholder="Min" value={filters.amountRange.min || ''} onChange={e => onFilterChange('amountRange', { ...filters.amountRange, min: e.target.value ? parseFloat(e.target.value) : undefined })} className="filter-input" />
                                <input type="number" placeholder="Max" value={filters.amountRange.max || ''} onChange={e => onFilterChange('amountRange', { ...filters.amountRange, max: e.target.value ? parseFloat(e.target.value) : undefined })} className="filter-input" />
                            </div>
                        </div>

                        {/* Multi-Select Filters */}
                        {[
                            { key: 'types', label: 'Type', options: ['DEBIT', 'CREDIT'] },
                            { key: 'statuses', label: 'Status', options: ['PENDING', 'POSTED', 'FAILED', 'REFUNDED'] },
                            { key: 'narrativeArchetypes', label: 'Narrative Archetype', options: allNarrativeArchetypes },
                            { key: 'categories', label: 'Category', options: allCategories },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block text-sm font-medium text-gray-300">{f.label}</label>
                                <div className="mt-1 max-h-32 overflow-y-auto space-y-1 p-2 bg-gray-900 rounded-md">
                                    {f.options.map(option => (
                                        <label key={option} className="flex items-center text-sm text-gray-400">
                                            <input
                                                type="checkbox"
                                                checked={(filters[f.key as keyof FilterState] as string[]).includes(option)}
                                                onChange={() => handleMultiSelectChange(f.key as any, option)}
                                                className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="ml-2">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={onResetFilters}
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

//-------------------------------------------------
// Component: Table Header
// The column headings, defining the structure of our chronicle.
//-------------------------------------------------
export interface TableHeaderProps {
    sort: SortState;
    onSort: (field: SortField) => void;
    onSelectAll: (checked: boolean) => void;
    isAllSelected: boolean;
    hasSelection: boolean;
}

export const TableHeader: FC<TableHeaderProps> = memo(({ sort, onSort, onSelectAll, isAllSelected, hasSelection }) => {
    const SortableHeader: FC<{ field: SortField; label: string }> = ({ field, label }) => (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => onSort(field)}>
            <div className="flex items-center">
                {label}
                {sort.field === field ? (
                    sort.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                ) : null}
            </div>
        </th>
    );

    return (
        <thead className="bg-gray-800">
            <tr>
                <th scope="col" className="p-4">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600"
                        checked={isAllSelected} onChange={(e) => onSelectAll(e.target.checked)} />
                </th>
                <SortableHeader field="date" label="Date" />
                <SortableHeader field="merchant.name" label="Merchant" />
                <SortableHeader field="category" label="Category" />
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Archetype
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                </th>
                <SortableHeader field="amount" label="Amount" />
                <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                </th>
            </tr>
        </thead>
    );
});
TableHeader.displayName = 'TableHeader';


//-------------------------------------------------
// Component: Transaction Row
// A single sentence in the grand story of a life.
//-------------------------------------------------
export interface TransactionRowProps {
    transaction: Transaction;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onViewDetails: (id: string) => void;
}

export const TransactionRow: FC<TransactionRowProps> = memo(({ transaction, isSelected, onSelect, onViewDetails }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusColor = (status: TransactionStatus) => {
        switch (status) {
            case 'POSTED': return 'bg-green-500';
            case 'PENDING': return 'bg-yellow-500';
            case 'FAILED': return 'bg-red-500';
            case 'REFUNDED': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <>
            <tr className={`bg-gray-900 hover:bg-gray-800/50 ${isSelected ? 'bg-gray-700/50' : ''}`}>
                <td className="p-4">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600"
                        checked={isSelected} onChange={() => onSelect(transaction.id)} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(transaction.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{transaction.merchant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{transaction.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="flex items-center" title={transaction.narrativeArchetype}>
                        <NarrativeArchetypeIcon archetype={transaction.narrativeArchetype} />
                        <span className="ml-2 hidden md:inline">{transaction.narrativeArchetype}</span>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)} text-white`}>
                        {transaction.status}
                    </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'CREDIT' ? 'text-green-400' : 'text-gray-200'}`}>
                    {transaction.type === 'CREDIT' ? '+' : ''}{formatCurrency(transaction.amount, transaction.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div className="flex items-center space-x-2">
                        {transaction.insights.length > 0 && (
                            <div className="flex -space-x-1">
                                {transaction.insights.slice(0, 3).map(insight => (
                                    <InsightIcon key={insight.id} type={insight.type} className="w-5 h-5" />
                                ))}
                            </div>
                        )}
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-indigo-400">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        <Dropdown trigger={<button className="text-gray-400 hover:text-indigo-400"><MoreVertical className="w-5 h-5" /></button>}>
                            <a href="#" onClick={(e) => { e.preventDefault(); onViewDetails(transaction.id); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">View Details</a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Edit</a>
                            <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-700">Delete</a>
                        </Dropdown>
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-800">
                    <td colSpan={8} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <h4 className="font-semibold text-white mb-2">Details</h4>
                                <p className="text-gray-400"><strong>ID:</strong> {transaction.id}</p>
                                {transaction.userDescription && <p className="text-gray-400"><strong>Description:</strong> {transaction.userDescription}</p>}
                                <p className="text-gray-400"><strong>Tags:</strong> {transaction.tags.join(', ')}</p>
                            </div>
                            <div className="col-span-2">
                                <h4 className="font-semibold text-white mb-2 flex items-center"><Brain className="w-4 h-4 mr-2 text-indigo-400"/>Plato's Insights</h4>
                                {transaction.insights.length > 0 ? (
                                    <ul className="space-y-2">
                                        {transaction.insights.map(insight => (
                                            <li key={insight.id} className="flex items-start p-2 bg-gray-700/50 rounded-md">
                                                <InsightIcon type={insight.type} className="w-5 h-5 mt-1 mr-3 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-gray-200">{insight.title}</p>
                                                    <p className="text-gray-400">{insight.description}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">No specific insights for this transaction.</p>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
});
TransactionRow.displayName = 'TransactionRow';


//-------------------------------------------------
// Component: Pagination
// Navigating the chapters of the financial story.
//-------------------------------------------------
export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    // Logic to show a limited number of page links (e.g., first, last, current, and neighbors)
    const MAX_PAGES_SHOWN = 7;
    if (totalPages <= MAX_PAGES_SHOWN) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        pageNumbers.push(1);
        if (currentPage > 3) {
            pageNumbers.push('...');
        }
        if (currentPage > 2) {
            pageNumbers.push(currentPage - 1);
        }
        if (currentPage !== 1 && currentPage !== totalPages) {
            pageNumbers.push(currentPage);
        }
        if (currentPage < totalPages - 1) {
            pageNumbers.push(currentPage + 1);
        }
        if (currentPage < totalPages - 2) {
            pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
    }

    if (totalPages <= 1) return null;

    return (
        <nav className="bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50">
                    Previous
                </button>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50">
                    Next
                </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {pageNumbers.map((p, i) =>
                            typeof p === 'number' ? (
                                <button
                                    key={`${p}-${i}`}
                                    onClick={() => onPageChange(p)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        currentPage === p
                                            ? 'z-10 bg-indigo-600 border-indigo-500 text-white'
                                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    {p}
                                </button>
                            ) : (
                                <span key={`${p}-${i}`} className="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-800 text-sm font-medium text-gray-500">
                                    ...
                                </span>
                            )
                        )}
                    </nav>
                </div>
            </div>
        </nav>
    );
};


//-------------------------------------------------
// Component: Bulk Actions Toolbar
// The power to edit entire paragraphs of the story at once.
//-------------------------------------------------
export interface BulkActionsToolbarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onDelete: () => void;
    onCategorize: (category: string) => void;
    onExport: () => void;
    allCategories: string[];
}

export const BulkActionsToolbar: FC<BulkActionsToolbarProps> = ({ selectedCount, onClearSelection, onDelete, onCategorize, onExport, allCategories }) => {
    if (selectedCount === 0) return null;

    return (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl z-10 p-2">
            <div className="bg-indigo-700 text-white rounded-lg shadow-lg flex items-center justify-between p-3">
                <div className="flex items-center space-x-4">
                    <button onClick={onClearSelection} className="p-1 rounded-full hover:bg-indigo-600">
                        <X className="w-5 h-5" />
                    </button>
                    <span className="font-semibold">{selectedCount} selected</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={onExport} className="flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-indigo-600 text-sm">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                    <button onClick={onDelete} className="flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-indigo-600 text-sm">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                     <Dropdown trigger={<button className="flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-indigo-600 text-sm"><Tag className="w-4 h-4" /><span>Categorize</span></button>}>
                        {allCategories.map(cat => (
                           <a key={cat} href="#" onClick={(e) => { e.preventDefault(); onCategorize(cat); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">{cat}</a>
                        ))}
                    </Dropdown>
                </div>
            </div>
        </div>
    );
};

//-------------------------------------------------
// Component: Loading Skeleton
// A placeholder for stories yet to be told.
//-------------------------------------------------
export const LoadingSkeleton: FC = () => {
    return (
        <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="bg-gray-800 rounded-lg p-4">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-700 last:border-b-0">
                        <div className="h-4 w-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                        <div className="h-4 bg-gray-700 rounded w-2/6"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                        <div className="flex-1 h-4 bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

//================================================================================================
// SECTION: MAIN VIEW COMPONENT
// The library itself. The grand hall where all the elements come together.
//================================================================================================

const INITIAL_FILTER_STATE: FilterState = {
    dateRange: {},
    amountRange: {},
    categories: [],
    merchants: [],
    types: [],
    statuses: [],
    narrativeArchetypes: [],
    hasInsights: false,
    isAnomaly: false,
    potentialTaxDeduction: false,
};

export const TransactionsView: FC = () => {
    const [state, setState] = useState<TransactionsViewState>({
        transactions: [],
        isLoading: true,
        error: null,
        pagination: {
            currentPage: 1,
            pageSize: 25,
            totalCount: 0,
            totalPages: 0,
        },
        filters: INITIAL_FILTER_STATE,
        searchTerm: '',
        sort: { field: 'date', direction: 'desc' },
        selectedTransactionIds: new Set(),
        activeTransactionId: null,
        allCategories: [],
        allMerchants: [],
        allNarrativeArchetypes: [],
        globalInsights: [],
    });

    const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

    const loadTransactions = useCallback(async () => {
        setState(s => ({ ...s, isLoading: true, error: null }));
        try {
            const response = await fetchTransactionsFromAPI(
                state.pagination.currentPage,
                state.pagination.pageSize,
                state.filters,
                debouncedSearchTerm,
                state.sort
            );
            setState(s => ({
                ...s,
                transactions: response.transactions,
                pagination: {
                    ...s.pagination,
                    totalCount: response.total,
                    totalPages: response.totalPages,
                },
                isLoading: false,
            }));
        } catch (err) {
            setState(s => ({ ...s, isLoading: false, error: 'Failed to fetch transactions.' }));
        }
    }, [state.pagination.currentPage, state.pagination.pageSize, state.filters, debouncedSearchTerm, state.sort]);
    
    useEffect(() => {
        const loadInitialData = async () => {
            const { allCategories, allMerchants, allNarrativeArchetypes } = (await fetchInitialData()) as any;
            setState(s => ({ ...s, allCategories, allMerchants, allNarrativeArchetypes }));
        };
        loadInitialData();
        loadTransactions();
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const handlePageChange = (page: number) => {
        setState(s => ({ ...s, pagination: { ...s.pagination, currentPage: page } }));
    };

    const handleSort = (field: SortField) => {
        setState(s => {
            const direction: SortDirection = (s.sort.field === field && s.sort.direction === 'asc') ? 'desc' : 'asc';
            return { ...s, sort: { field, direction }, pagination: { ...s.pagination, currentPage: 1 } };
        });
    };

    const handleFilterChange = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        setState(s => ({
            ...s,
            filters: { ...s.filters, [key]: value },
            pagination: { ...s.pagination, currentPage: 1 },
        }));
    }, []);
    
    const handleResetFilters = useCallback(() => {
        setState(s => ({ ...s, filters: INITIAL_FILTER_STATE, pagination: { ...s.pagination, currentPage: 1 } }));
    }, []);
    
    const handleSearch = (term: string) => {
        setState(s => ({ ...s, searchTerm: term, pagination: { ...s.pagination, currentPage: 1 } }));
    };

    const handleSelectTransaction = (id: string) => {
        setState(s => {
            const newSelection = new Set(s.selectedTransactionIds);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            return { ...s, selectedTransactionIds: newSelection };
        });
    };
    
    const handleSelectAll = (checked: boolean) => {
        setState(s => {
            const newSelection = new Set<string>();
            if (checked) {
                s.transactions.forEach(t => newSelection.add(t.id));
            }
            return { ...s, selectedTransactionIds: newSelection };
        });
    };

    const handleBulkDelete = () => {
        console.log('Deleting:', state.selectedTransactionIds);
        // Here you would call an API to delete transactions
        setState(s => ({ ...s, selectedTransactionIds: new Set() }));
        loadTransactions(); // Refresh
    };
    
    const handleBulkCategorize = (category: string) => {
        console.log(`Categorizing ${state.selectedTransactionIds.size} transactions to ${category}`);
        // API call to update categories
        setState(s => ({ ...s, selectedTransactionIds: new Set() }));
        loadTransactions();
    };

    const handleBulkExport = () => {
        console.log('Exporting:', state.selectedTransactionIds);
        // Logic to convert selected transactions to CSV and trigger download
    };

    if (state.isLoading && state.transactions.length === 0) {
        return (
            <div className="p-8 text-white bg-gray-900 min-h-screen">
                <LoadingSkeleton />
            </div>
        );
    }
    
    if (state.error) {
        return (
            <div className="p-8 text-white bg-gray-900 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                    <h2 className="mt-2 text-lg font-medium text-red-400">An Error Occurred</h2>
                    <p className="mt-1 text-sm text-gray-400">{state.error}</p>
                    <button onClick={loadTransactions} className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 text-white bg-gray-900 min-h-screen font-sans">
            <header className="mb-6">
                <h1 className="text-4xl font-bold tracking-tight text-white">The FlowMatrix</h1>
                <p className="mt-2 text-lg text-gray-400">The complete chronicle of your financial journey.</p>
            </header>

            <div className="space-y-4">
                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="w-full md:w-1/2 lg:w-2/3">
                        <SearchBar searchTerm={state.searchTerm} onSearch={handleSearch} />
                    </div>
                    <div className="flex items-center gap-2">
                        <FiltersPanel
                            filters={state.filters}
                            onFilterChange={handleFilterChange}
                            onResetFilters={handleResetFilters}
                            allCategories={state.allCategories}
                            allMerchants={state.allMerchants}
                            allNarrativeArchetypes={state.allNarrativeArchetypes}
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-gray-800/50 rounded-lg shadow-lg relative">
                    <BulkActionsToolbar
                        selectedCount={state.selectedTransactionIds.size}
                        onClearSelection={() => setState(s => ({ ...s, selectedTransactionIds: new Set() }))}
                        onDelete={handleBulkDelete}
                        onCategorize={handleBulkCategorize}
                        onExport={handleBulkExport}
                        allCategories={state.allCategories}
                    />

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <TableHeader
                                sort={state.sort}
                                onSort={handleSort}
                                onSelectAll={handleSelectAll}
                                isAllSelected={state.transactions.length > 0 && state.selectedTransactionIds.size === state.transactions.length}
                                hasSelection={state.selectedTransactionIds.size > 0}
                            />
                            <tbody className="bg-gray-900 divide-y divide-gray-800">
                                {state.isLoading && (
                                    <tr><td colSpan={8} className="text-center p-8"><Loader className="w-8 h-8 text-indigo-400 animate-spin mx-auto" /></td></tr>
                                )}
                                {!state.isLoading && state.transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center p-12 text-gray-500">
                                            <h3 className="text-lg font-medium">No Transactions Found</h3>
                                            <p>Your search or filters returned no results. Try adjusting your query.</p>
                                        </td>
                                    </tr>
                                )}
                                {!state.isLoading && state.transactions.map(transaction => (
                                    <TransactionRow
                                        key={transaction.id}
                                        transaction={transaction}
                                        isSelected={state.selectedTransactionIds.has(transaction.id)}
                                        onSelect={handleSelectTransaction}
                                        onViewDetails={(id) => setState(s => ({ ...s, activeTransactionId: id }))}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <Pagination
                        currentPage={state.pagination.currentPage}
                        totalPages={state.pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
};

// Add a placeholder style for filter-input class for context
const style = document.createElement('style');
style.innerHTML = `
.filter-input {
    display: block;
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #4a5568;
    border-radius: 0.375rem;
    background-color: #2d3748;
    color: #e2e8f0;
}
.filter-input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 1px #6366f1;
}
::-webkit-calendar-picker-indicator {
    filter: invert(1);
}
`;
document.head.appendChild(style);
