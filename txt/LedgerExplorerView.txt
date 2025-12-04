// components/views/platform/LedgerExplorerView.tsx
import React, { useState, useMemo, useReducer, useCallback, useEffect, useRef } from 'react';
import Card from '../../Card';
import { LedgerAccount } from '../../../types';
import { MOCK_LEDGER_ACCOUNTS } from '../../../data/ledgerAccounts'; // For fallback
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, Sankey, Layer } from 'recharts';

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];
const DEBIT_COLOR = '#06b6d4';
const CREDIT_COLOR = '#f59e0b';
const NET_COLOR = '#10b981';

// --- ENHANCED TYPES FOR A REAL-WORLD APPLICATION ---

/**
 * Represents a single entry in a ledger transaction.
 */
export interface LedgerEntry {
    id: string;
    ledger_account_id: string;
    direction: 'credit' | 'debit';
    amount: number;
    // other fields like currency, currency_exponent, etc.
}

/**
 * Represents a ledger transaction, which consists of one or more entries.
 */
export interface LedgerTransaction {
    id: string;
    object: 'ledger_transaction';
    live_mode: boolean;
    description: string | null;
    status: 'posted' | 'pending' | 'archived';
    metadata: Record<string, string>;
    ledger_entries: LedgerEntry[];
    posted_at: string;
    effective_date: string;
    ledger_id: string;
    ledgerable_type: string | null;
    ledgerable_id: string | null;
    reversed_by_id: string | null;
    reverses_id: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Represents the state for the entire Ledger Explorer view.
 */
export interface LedgerExplorerState {
    apiKey: string;
    isLoadingAccounts: boolean;
    isLoadingTransactions: boolean;
    isLoadingDetails: boolean;
    error: string | null;
    ledgerAccounts: LedgerAccount[];
    filteredAccounts: LedgerAccount[];
    ledgerTransactions: LedgerTransaction[];
    selectedAccount: LedgerAccount | null;
    selectedAccountTransactions: LedgerTransaction[];
    filters: {
        accountName: string;
        normalBalance: 'all' | 'debit' | 'credit';
        dateRange: { start: string, end: string };
    };
    pagination: {
        accounts: { currentPage: number; pageSize: number; };
        transactions: { currentPage: number; pageSize: number; };
    };
    isCreateModalOpen: boolean;
}

/**
 * Defines the actions that can be dispatched to update the explorer's state.
 */
export type LedgerExplorerAction =
    | { type: 'SET_API_KEY'; payload: string }
    | { type: 'FETCH_ACCOUNTS_START' }
    | { type: 'FETCH_ACCOUNTS_SUCCESS'; payload: LedgerAccount[] }
    | { type: 'FETCH_ACCOUNTS_FAILURE'; payload: string }
    | { type: 'FETCH_TRANSACTIONS_START' }
    | { type: 'FETCH_TRANSACTIONS_SUCCESS'; payload: LedgerTransaction[] }
    | { type: 'FETCH_TRANSACTIONS_FAILURE'; payload: string }
    | { type: 'SELECT_ACCOUNT_START'; payload: LedgerAccount }
    | { type: 'SELECT_ACCOUNT_SUCCESS'; payload: LedgerTransaction[] }
    | { type: 'SELECT_ACCOUNT_FAILURE'; payload: string }
    | { type: 'CLEAR_SELECTION' }
    | { type: 'SET_FILTER'; payload: { filter: keyof LedgerExplorerState['filters']; value: any } }
    | { type: 'APPLY_FILTERS' }
    | { type: 'SET_PAGINATION'; payload: { target: 'accounts' | 'transactions'; newPage: number } }
    | { type: 'TOGGLE_CREATE_MODAL'; payload: boolean };


// --- STATE MANAGEMENT (useReducer) ---

const getInitialState = (): LedgerExplorerState => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return {
        apiKey: '',
        isLoadingAccounts: false,
        isLoadingTransactions: false,
        isLoadingDetails: false,
        error: null,
        ledgerAccounts: [],
        filteredAccounts: [],
        ledgerTransactions: [],
        selectedAccount: null,
        selectedAccountTransactions: [],
        filters: {
            accountName: '',
            normalBalance: 'all',
            dateRange: {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
            },
        },
        pagination: {
            accounts: { currentPage: 1, pageSize: 10 },
            transactions: { currentPage: 1, pageSize: 10 },
        },
        isCreateModalOpen: false,
    };
};

const ledgerExplorerReducer = (state: LedgerExplorerState, action: LedgerExplorerAction): LedgerExplorerState => {
    switch (action.type) {
        case 'SET_API_KEY':
            return { ...state, apiKey: action.payload };
        case 'FETCH_ACCOUNTS_START':
            return { ...state, isLoadingAccounts: true, error: null, ledgerAccounts: [], filteredAccounts: [], selectedAccount: null };
        case 'FETCH_ACCOUNTS_SUCCESS':
            return { ...state, isLoadingAccounts: false, ledgerAccounts: action.payload, filteredAccounts: action.payload };
        case 'FETCH_ACCOUNTS_FAILURE':
            return { ...state, isLoadingAccounts: false, error: action.payload, ledgerAccounts: MOCK_LEDGER_ACCOUNTS, filteredAccounts: MOCK_LEDGER_ACCOUNTS };
        case 'FETCH_TRANSACTIONS_START':
             return { ...state, isLoadingTransactions: true, error: null, ledgerTransactions: [] };
        case 'FETCH_TRANSACTIONS_SUCCESS':
            return { ...state, isLoadingTransactions: false, ledgerTransactions: action.payload };
        case 'FETCH_TRANSACTIONS_FAILURE':
            return { ...state, isLoadingTransactions: false, error: action.payload };
        case 'SELECT_ACCOUNT_START':
            return { ...state, isLoadingDetails: true, selectedAccount: action.payload, selectedAccountTransactions: [] };
        case 'SELECT_ACCOUNT_SUCCESS':
            return { ...state, isLoadingDetails: false, selectedAccountTransactions: action.payload };
        case 'SELECT_ACCOUNT_FAILURE':
            return { ...state, isLoadingDetails: false, error: action.payload };
        case 'CLEAR_SELECTION':
            return { ...state, selectedAccount: null, selectedAccountTransactions: [] };
        case 'SET_FILTER':
            return { ...state, filters: { ...state.filters, [action.payload.filter]: action.payload.value } };
        case 'APPLY_FILTERS':
            const { accountName, normalBalance } = state.filters;
            const filtered = state.ledgerAccounts.filter(acc => {
                const nameMatch = acc.name.toLowerCase().includes(accountName.toLowerCase());
                const balanceMatch = normalBalance === 'all' || acc.normal_balance === normalBalance;
                return nameMatch && balanceMatch;
            });
            return { ...state, filteredAccounts: filtered, pagination: { ...state.pagination, accounts: { ...state.pagination.accounts, currentPage: 1 } } };
        case 'SET_PAGINATION':
            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    [action.payload.target]: { ...state.pagination[action.payload.target], currentPage: action.payload.newPage }
                }
            };
        case 'TOGGLE_CREATE_MODAL':
            return { ...state, isCreateModalOpen: action.payload };
        default:
            return state;
    }
};

// --- API HELPER CLASS ---

/**
 * A simple client for interacting with the Modern Treasury API.
 * In a real app, this would be in a separate file.
 */
export class ModernTreasuryAPI {
    private apiKey: string;
    private baseUrl = 'https://app.moderntreasury.com/api';

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error("API Key is required for ModernTreasuryAPI client.");
        }
        this.apiKey = apiKey;
    }

    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${this.apiKey}`
        };
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        // NOTE: This will be blocked by CORS in a browser. A backend proxy is required for production.
        const url = `${this.baseUrl}${endpoint}`;
        try {
            const response = await fetch(url, {
                ...options,
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: 'Failed to parse error response.' }));
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody.errors?.message || 'Unknown error'}`);
            }
            return response.json() as T;
        } catch (e: any) {
             console.error(`API request to ${endpoint} failed:`, e);
             throw new Error(`Network or API request failed: ${e.message}. Check browser console for CORS errors.`);
        }
    }

    public async getLedgerAccounts(perPage = 100): Promise<LedgerAccount[]> {
        return this.request<LedgerAccount[]>(`/ledger_accounts?per_page=${perPage}`);
    }
    
    public async getLedgerTransactions(params: { after_cursor?: string, per_page?: number, ledger_account_id?: string, posted_at_start?: string, posted_at_end?: string }): Promise<LedgerTransaction[]> {
        const query = new URLSearchParams();
        if(params.after_cursor) query.append('after_cursor', params.after_cursor);
        if(params.per_page) query.append('per_page', String(params.per_page));
        if(params.ledger_account_id) query.append('ledger_account_id', params.ledger_account_id);
        if(params.posted_at_start) query.append('posted_at[gte]', params.posted_at_start);
        if(params.posted_at_end) query.append('posted_at[lte]', params.posted_at_end);
        
        return this.request<LedgerTransaction[]>(`/ledger_transactions?${query.toString()}`);
    }

    public async createLedgerTransaction(payload: {
        description?: string;
        effective_date: string;
        ledger_entries: Array<{ amount: number; direction: 'credit' | 'debit'; ledger_account_id: string }>;
        metadata?: Record<string, string>;
    }): Promise<LedgerTransaction> {
        return this.request<LedgerTransaction>('/ledger_transactions', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
}


// --- UTILITY FUNCTIONS ---

/**
 * Formats a number into a currency string.
 * @param amount - The numeric amount.
 * @param currency - The currency code (e.g., 'USD').
 * @param exponent - The currency exponent.
 * @returns A formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'USD', exponent: number = 2): string => {
    const value = amount / Math.pow(10, exponent);
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(value);
};

/**
 * Generates a CSV string from an array of objects.
 * @param data - The array of objects.
 * @returns A string in CSV format.
 */
export const exportToCSV = (data: any[], filename: string = 'export.csv') => {
    if (data.length === 0) return;
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
        Object.values(row).map(val => {
            const str = String(val);
            // Handle commas and quotes in values
            if (str.includes(',') || str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(',')
    ).join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


// --- REUSABLE SUB-COMPONENTS ---

/**
 * A custom tooltip component for charts for better styling.
 */
export const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-gray-700/80 backdrop-blur-sm border border-gray-600 rounded-lg shadow-lg text-white">
                <p className="label font-bold text-cyan-400">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <div key={index} style={{ color: pld.color }}>
                        {`${pld.name}: ${formatCurrency(pld.value, 'USD', 2)}`}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

/**
 * A spinner component for loading states.
 */
export const Spinner = () => (
    <div className="flex justify-center items-center p-4">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-gray-300">Loading...</span>
    </div>
);


/**
 * A detailed, sortable, and paginated table for displaying ledger accounts.
 */
export const LedgerAccountTable: React.FC<{
    accounts: LedgerAccount[];
    onSelectAccount: (account: LedgerAccount) => void;
    currentPage: number;
    pageSize: number;
    onPageChange: (newPage: number) => void;
}> = ({ accounts, onSelectAccount, currentPage, pageSize, onPageChange }) => {
    const totalPages = Math.ceil(accounts.length / pageSize);
    const paginatedAccounts = accounts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Normal Balance</th>
                        <th scope="col" className="px-6 py-3">Posted Balance</th>
                        <th scope="col" className="px-6 py-3">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedAccounts.map(acc => (
                        <tr key={acc.id} onClick={() => onSelectAccount(acc)} className="border-b border-gray-700 hover:bg-gray-800/50 cursor-pointer">
                            <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{acc.name}</th>
                            <td className={`px-6 py-4 ${acc.normal_balance === 'debit' ? 'text-cyan-400' : 'text-amber-400'}`}>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${acc.normal_balance === 'debit' ? 'bg-cyan-900/50' : 'bg-amber-900/50'}`}>
                                    {acc.normal_balance}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-mono">{formatCurrency(acc.balances.posted_balance.amount, acc.balances.posted_balance.currency, acc.balances.posted_balance.currency_exponent)}</td>
                            <td className="px-6 py-4 max-w-sm truncate">{acc.description || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-400">
                    Showing {((currentPage-1)*pageSize)+1} to {Math.min(currentPage*pageSize, accounts.length)} of {accounts.length} accounts
                </span>
                <div className="flex gap-2">
                    <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50">Prev</button>
                    <span className="px-3 py-1 text-gray-300">{currentPage} / {totalPages}</span>
                    <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
};


/**
 * A chart to show the historical balance of a selected account.
 */
export const HistoricalBalanceChart: React.FC<{ transactions: LedgerTransaction[], initialBalance: LedgerAccount['balances']['posted_balance'] }> = ({ transactions, initialBalance }) => {
    const chartData = useMemo(() => {
        if (transactions.length === 0) return [];
        
        // Sort transactions by posted date
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime());
        
        let runningBalance = initialBalance.amount;
        
        // This is a simplified calculation. A real one would fetch balance at the start of the period.
        // For this demo, we work backwards from the current balance.
        const reversedTxns = sortedTransactions.slice().reverse();
        const dataPoints: { date: string, balance: number }[] = [];
        dataPoints.push({
            date: new Date().toISOString().split('T')[0],
            balance: runningBalance
        });

        reversedTxns.forEach(tx => {
            const entry = tx.ledger_entries.find(e => e.ledger_account_id === initialBalance.ledger_account_id);
            if(entry) {
                const change = entry.direction === 'debit' ? entry.amount : -entry.amount;
                runningBalance -= change;
                dataPoints.push({
                    date: new Date(tx.posted_at).toISOString().split('T')[0],
                    balance: runningBalance
                });
            }
        });
        
        return dataPoints.reverse();
    }, [transactions, initialBalance]);

    if (chartData.length === 0) {
        return <p className="text-gray-400 text-center">Not enough transaction data to display balance history.</p>
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(val) => formatCurrency(val, initialBalance.currency, initialBalance.currency_exponent)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="balance" name="Posted Balance" stroke={NET_COLOR} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

/**
 * A Sankey chart to visualize the flow of funds between accounts.
 */
export const FundFlowSankeyChart: React.FC<{ transactions: LedgerTransaction[], accounts: LedgerAccount[] }> = ({ transactions, accounts }) => {
    const sankeyData = useMemo(() => {
        const nodes = accounts.map(acc => ({ name: acc.name }));
        const links: { source: number; target: number; value: number }[] = [];
        const linkMap: Record<string, number> = {};

        transactions.forEach(tx => {
            if (tx.ledger_entries.length < 2) return;

            // Simplified: Assuming first debit is source, first credit is target
            const debitEntry = tx.ledger_entries.find(e => e.direction === 'debit');
            const creditEntry = tx.ledger_entries.find(e => e.direction === 'credit');

            if (debitEntry && creditEntry) {
                const sourceAccount = accounts.find(acc => acc.id === debitEntry.ledger_account_id);
                const targetAccount = accounts.find(acc => acc.id === creditEntry.ledger_account_id);
                
                if (sourceAccount && targetAccount) {
                    const sourceIndex = nodes.findIndex(n => n.name === sourceAccount.name);
                    const targetIndex = nodes.findIndex(n => n.name === targetAccount.name);
                    const value = debitEntry.amount / 100; // Assuming exponent 2

                    const key = `${sourceIndex}-${targetIndex}`;
                    if (linkMap[key]) {
                        linkMap[key] += value;
                    } else {
                        linkMap[key] = value;
                    }
                }
            }
        });

        for (const key in linkMap) {
            const [source, target] = key.split('-').map(Number);
            links.push({ source, target, value: linkMap[key] });
        }

        return { nodes, links };
    }, [transactions, accounts]);

    if (sankeyData.links.length === 0) {
        return <p className="text-gray-400 text-center">No transactions with clear fund flows found in the current date range.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={500}>
            <Sankey
                data={sankeyData}
                nodePadding={50}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                link={{ stroke: 'rgba(6, 182, 212, 0.5)' }}
                node={({ x, y, width, height, index, payload, containerWidth }) => (
                    <Layer key={`node-${index}`}>
                        <rect x={x} y={y} width={width} height={height} fill={COLORS[index % COLORS.length]} />
                        <text
                            x={x < containerWidth / 2 ? x + width + 6 : x - 6}
                            y={y + height / 2}
                            textAnchor={x < containerWidth / 2 ? 'start' : 'end'}
                            dominantBaseline="middle"
                            fill="#fff"
                        >
                            {payload.name}
                        </text>
                    </Layer>
                )}
            >
                 <Tooltip content={<CustomTooltip />} />
            </Sankey>
        </ResponsiveContainer>
    );
};

/**
 * Modal for creating a new ledger transaction.
 */
export const CreateTransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    accounts: LedgerAccount[];
    apiClient: ModernTreasuryAPI;
    onSuccess: () => void;
}> = ({ isOpen, onClose, accounts, apiClient, onSuccess }) => {
    const [debitAccountId, setDebitAccountId] = useState('');
    const [creditAccountId, setCreditAccountId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!debitAccountId || !creditAccountId || !amount || !effectiveDate) {
            setError('Please fill all required fields.');
            return;
        }
        if (debitAccountId === creditAccountId) {
            setError('Debit and Credit accounts cannot be the same.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await apiClient.createLedgerTransaction({
                description,
                effective_date: effectiveDate,
                ledger_entries: [
                    { amount: Math.round(parseFloat(amount) * 100), direction: 'debit', ledger_account_id: debitAccountId },
                    { amount: Math.round(parseFloat(amount) * 100), direction: 'credit', ledger_account_id: creditAccountId },
                ]
            });
            onSuccess();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative border border-gray-700">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">&times;</button>
                <h3 className="text-xl font-bold text-white mb-4">Create New Ledger Transaction</h3>
                {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-2 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Debit Account</label>
                        <select value={debitAccountId} onChange={e => setDebitAccountId(e.target.value)} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-lg p-2 text-white">
                            <option value="">Select an account</option>
                            {accounts.filter(a => a.normal_balance === 'debit').map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Credit Account</label>
                        <select value={creditAccountId} onChange={e => setCreditAccountId(e.target.value)} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-lg p-2 text-white">
                            <option value="">Select an account</option>
                            {accounts.filter(a => a.normal_balance === 'credit').map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Amount (USD)</label>
                        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 100.00" className="w-full mt-1 bg-gray-700 border-gray-600 rounded-lg p-2 text-white font-mono" />
                    </div>
                    <div className="flex gap-4">
                         <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-300">Effective Date</label>
                            <input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-lg p-2 text-white" />
                        </div>
                         <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-300">Description (Optional)</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Transaction details" className="w-full mt-1 bg-gray-700 border-gray-600 rounded-lg p-2 text-white" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50">
                            {isSubmitting ? 'Submitting...' : 'Create Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


/**
 * The main view component for the Ledger Explorer.
 */
const LedgerExplorerView: React.FC = () => {
    const [state, dispatch] = useReducer(ledgerExplorerReducer, getInitialState());
    const apiClient = useMemo(() => state.apiKey ? new ModernTreasuryAPI(state.apiKey) : null, [state.apiKey]);
    const initialFetchCompleted = useRef(false);

    const handleFetch = useCallback(async () => {
        if (!apiClient) {
            dispatch({ type: 'FETCH_ACCOUNTS_FAILURE', payload: "API Key is required." });
            return;
        }
        dispatch({ type: 'FETCH_ACCOUNTS_START' });
        try {
            const data = await apiClient.getLedgerAccounts();
            dispatch({ type: 'FETCH_ACCOUNTS_SUCCESS', payload: data });
        } catch (e: any) {
            dispatch({ type: 'FETCH_ACCOUNTS_FAILURE', payload: `Fetch failed: ${e.message}. For demonstration, mock data is loaded.` });
        }
    }, [apiClient]);

    const handleFetchTransactions = useCallback(async () => {
        if (!apiClient) return;
        dispatch({ type: 'FETCH_TRANSACTIONS_START' });
        try {
            const data = await apiClient.getLedgerTransactions({ 
                posted_at_start: state.filters.dateRange.start,
                posted_at_end: state.filters.dateRange.end,
                per_page: 100 // Fetch max for Sankey
            });
            dispatch({ type: 'FETCH_TRANSACTIONS_SUCCESS', payload: data });
        } catch(e: any) {
            dispatch({ type: 'FETCH_TRANSACTIONS_FAILURE', payload: `Failed to fetch transactions: ${e.message}`});
        }
    }, [apiClient, state.filters.dateRange]);
    
    // Fetch transactions automatically after accounts are fetched
    useEffect(() => {
        if (state.ledgerAccounts.length > 0 && !initialFetchCompleted.current) {
            handleFetchTransactions();
            initialFetchCompleted.current = true;
        }
    }, [state.ledgerAccounts, handleFetchTransactions]);

    const handleSelectAccount = useCallback(async (account: LedgerAccount) => {
        if (!apiClient) return;
        dispatch({ type: 'SELECT_ACCOUNT_START', payload: account });
        try {
            const txns = await apiClient.getLedgerTransactions({ ledger_account_id: account.id, per_page: 50 });
            dispatch({ type: 'SELECT_ACCOUNT_SUCCESS', payload: txns });
        } catch (e: any) {
            dispatch({ type: 'SELECT_ACCOUNT_FAILURE', payload: `Failed to fetch details for ${account.name}: ${e.message}`});
        }
    }, [apiClient]);

    const handleFilterChange = (filter: keyof LedgerExplorerState['filters'], value: any) => {
        dispatch({ type: 'SET_FILTER', payload: { filter, value } });
    };

    const handleDateRangeChange = (part: 'start' | 'end', value: string) => {
        const newRange = { ...state.filters.dateRange, [part]: value };
        dispatch({ type: 'SET_FILTER', payload: { filter: 'dateRange', value: newRange } });
    };

    const applyFiltersAndRefresh = () => {
        dispatch({ type: 'APPLY_FILTERS' });
        handleFetchTransactions();
    };

    const chartData = useMemo(() => {
        if (state.ledgerAccounts.length === 0) return { balances: [], composition: [] };
        
        const balances = state.ledgerAccounts.map(acc => {
            const amount = acc.balances.posted_balance.amount;
            return {
                name: acc.name,
                balance: acc.normal_balance === 'credit' ? -amount : amount,
            };
        });

        const composition = [
            { name: 'Assets (Debit)', value: 0 },
            { name: 'Liabilities/Equity (Credit)', value: 0 }
        ];
        state.ledgerAccounts.forEach(acc => {
            const amount = acc.balances.posted_balance.amount;
            if (acc.normal_balance === 'debit') {
                composition[0].value += amount;
            } else {
                composition[1].value += amount;
            }
        });

        return { balances, composition };
    }, [state.ledgerAccounts]);
    
    // --- RENDER LOGIC ---

    if (state.selectedAccount) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">{state.selectedAccount.name}</h2>
                    <button onClick={() => dispatch({ type: 'CLEAR_SELECTION' })} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg">&larr; Back to Overview</button>
                </div>
                {state.isLoadingDetails && <Card><Spinner /></Card>}
                {state.error && <Card><p className="text-center text-red-400">{state.error}</p></Card>}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card title="Account Details" className="md:col-span-1">
                        <div className="space-y-2 text-gray-300">
                           <p><strong>ID:</strong> <span className="font-mono text-sm">{state.selectedAccount.id}</span></p>
                           <p><strong>Description:</strong> {state.selectedAccount.description || 'N/A'}</p>
                           <p><strong>Normal Balance:</strong> <span className={`font-bold ${state.selectedAccount.normal_balance === 'debit' ? 'text-cyan-400' : 'text-amber-400'}`}>{state.selectedAccount.normal_balance}</span></p>
                           <p><strong>Posted Balance:</strong> <span className="font-mono text-lg font-bold text-white">{formatCurrency(state.selectedAccount.balances.posted_balance.amount, 'USD', 2)}</span></p>
                           <p><strong>Pending Balance:</strong> <span className="font-mono">{formatCurrency(state.selectedAccount.balances.pending_balance.amount, 'USD', 2)}</span></p>
                        </div>
                    </Card>
                    <Card title="Balance History" className="md:col-span-2">
                        <HistoricalBalanceChart transactions={state.selectedAccountTransactions} initialBalance={state.selectedAccount.balances.posted_balance} />
                    </Card>
                 </div>
                 <Card title="Recent Transactions">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Direction</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.selectedAccountTransactions.map(tx => {
                                const entry = tx.ledger_entries.find(e => e.ledger_account_id === state.selectedAccount?.id);
                                if (!entry) return null;
                                return (
                                <tr key={tx.id} className="border-b border-gray-700">
                                    <td className="px-6 py-4">{new Date(tx.posted_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{tx.description || 'N/A'}</td>
                                    <td className="px-6 py-4 font-mono">{formatCurrency(entry.amount, 'USD', 2)}</td>
                                    <td className={`px-6 py-4 font-semibold ${entry.direction === 'debit' ? 'text-cyan-400' : 'text-amber-400'}`}>{entry.direction}</td>
                                    <td className="px-6 py-4">{tx.status}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                 </Card>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-3xl font-bold text-white tracking-wider">Ledger Explorer</h2>
                <button onClick={() => dispatch({type: 'TOGGLE_CREATE_MODAL', payload: true})} disabled={!apiClient || state.ledgerAccounts.length === 0} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    + New Transaction
                </button>
            </div>
            
            <CreateTransactionModal
                isOpen={state.isCreateModalOpen}
                onClose={() => dispatch({type: 'TOGGLE_CREATE_MODAL', payload: false})}
                accounts={state.ledgerAccounts}
                apiClient={apiClient!}
                onSuccess={() => { handleFetch(); handleFetchTransactions(); }}
            />

            <Card title="Modern Treasury Connection">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="password"
                        value={state.apiKey}
                        onChange={e => dispatch({type: 'SET_API_KEY', payload: e.target.value})}
                        placeholder="Enter your Basic Auth API Key Token"
                        className="flex-grow bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white font-mono"
                    />
                    <button onClick={handleFetch} disabled={state.isLoadingAccounts || !state.apiKey} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50">
                        {state.isLoadingAccounts ? 'Fetching...' : 'Fetch Ledger Data'}
                    </button>
                </div>
            </Card>

            {state.error && !state.isLoadingAccounts && <Card><p className="text-center text-red-400">{state.error}</p></Card>}

            {state.ledgerAccounts.length > 0 && (
                <div className="space-y-6">
                    <Card title="Filters & Controls">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300">Search by Account Name</label>
                                <input type="text" value={state.filters.accountName} onChange={e => handleFilterChange('accountName', e.target.value)} className="w-full mt-1 bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Normal Balance</label>
                                <select value={state.filters.normalBalance} onChange={e => handleFilterChange('normalBalance', e.target.value)} className="w-full mt-1 bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white">
                                    <option value="all">All</option>
                                    <option value="debit">Debit</option>
                                    <option value="credit">Credit</option>
                                </select>
                            </div>
                            <button onClick={() => dispatch({ type: 'APPLY_FILTERS' })} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Apply Filters</button>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mt-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-300">Date Range (Start)</label>
                                <input type="date" value={state.filters.dateRange.start} onChange={e => handleDateRangeChange('start', e.target.value)} className="w-full mt-1 bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" />
                            </div>
                             <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-300">Date Range (End)</label>
                                <input type="date" value={state.filters.dateRange.end} onChange={e => handleDateRangeChange('end', e.target.value)} className="w-full mt-1 bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" />
                            </div>
                             <div className="md:col-span-2 flex items-end">
                                <button onClick={handleFetchTransactions} disabled={state.isLoadingTransactions} className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50">
                                     {state.isLoadingTransactions ? 'Refreshing...' : 'Refresh Transaction Data'}
                                </button>
                             </div>
                        </div>
                    </Card>

                    <Card title="Ledger Accounts Overview" actions={[{label: 'Export CSV', onAction: () => exportToCSV(state.filteredAccounts, 'ledger-accounts.csv')}]}>
                       {state.isLoadingAccounts ? <Spinner /> : <LedgerAccountTable 
                            accounts={state.filteredAccounts} 
                            onSelectAccount={handleSelectAccount}
                            currentPage={state.pagination.accounts.currentPage}
                            pageSize={state.pagination.accounts.pageSize}
                            onPageChange={(newPage) => dispatch({ type: 'SET_PAGINATION', payload: {target: 'accounts', newPage} })}
                        />}
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Ledger Account Balances">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.balances} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} interval={0} angle={-35} textAnchor="end" />
                                    <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="balance" name="Posted Balance">
                                        {chartData.balances.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.balance >= 0 ? DEBIT_COLOR : CREDIT_COLOR} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                        <Card title="Asset vs. Liability/Equity Composition">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={chartData.composition} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {chartData.composition.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>

                    <Card title={`Fund Flow (${state.filters.dateRange.start} to ${state.filters.dateRange.end})`}>
                        {state.isLoadingTransactions ? <Spinner /> : <FundFlowSankeyChart transactions={state.ledgerTransactions} accounts={state.ledgerAccounts}/> }
                    </Card>
                </div>
            )}
        </div>
    );
};

export default LedgerExplorerView;
