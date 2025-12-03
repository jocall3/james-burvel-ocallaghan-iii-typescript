// components/views/platform/DemoBankKnowledgeBaseView.tsx
import React, { useState, useReducer, useEffect, useMemo, useCallback } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// --- TYPE DEFINITIONS FOR A REAL-WORLD KNOWLEDGE BASE ---

export type UserRole = 'reader' | 'editor' | 'admin';
export type ArticleStatus = 'draft' | 'pending_review' | 'published' | 'archived';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl: string;
}

export interface Category {
    id: string;
    name: string;
    description: string;
    articleCount: number;
    slug: string;
}

export interface ArticleVersion {
    version: number;
    content: string;
    authorId: string;
    timestamp: string;
    changeSummary: string;
}

export interface Comment {
    id: string;
    authorId: string;
    timestamp: string;
    content: string;
    replies?: Comment[];
}

export interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;
    categoryId: string;
    authorId: string;
    status: ArticleStatus;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    helpfulVotes: number;
    unhelpfulVotes: number;

    history: ArticleVersion[];
    comments: Comment[];
}

export interface AppState {
    articles: Article[];
    categories: Category[];
    users: User[];
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;
    currentView: 'dashboard' | 'articles' | 'article_detail' | 'article_edit' | 'article_create' | 'categories' | 'settings';
    selectedArticleId: string | null;
    selectedCategoryId: string | null;
    notifications: Notification[];
}

export interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

// --- MOCK DATA FOR A REALISTIC APPLICATION ---

const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Alice Johnson', email: 'alice@demobank.com', role: 'admin', avatarUrl: `https://i.pravatar.cc/150?u=user-1` },
    { id: 'user-2', name: 'Bob Williams', email: 'bob@demobank.com', role: 'editor', avatarUrl: `https://i.pravatar.cc/150?u=user-2` },
    { id: 'user-3', name: 'Charlie Brown', email: 'charlie@demobank.com', role: 'editor', avatarUrl: `https://i.pravatar.cc/150?u=user-3` },
    { id: 'user-4', name: 'Diana Prince', email: 'diana@demobank.com', role: 'reader', avatarUrl: `https://i.pravatar.cc/150?u=user-4` },
    { id: 'user-5', name: 'Ethan Hunt', email: 'ethan@demobank.com', role: 'reader', avatarUrl: `https://i.pravatar.cc/150?u=user-5` },
];

const MOCK_CATEGORIES: Category[] = [
    { id: 'cat-1', name: 'Account Management', description: 'Everything about managing your Demo Bank account.', articleCount: 3, slug: 'account-management' },
    { id: 'cat-2', name: 'Payments & Transfers', description: 'Help with sending and receiving money.', articleCount: 2, slug: 'payments-transfers' },
    { id: 'cat-3', name: 'Security & Fraud', description: 'Keeping your account secure.', articleCount: 2, slug: 'security-fraud' },
    { id: 'cat-4', name: 'Mobile & Online Banking', description: 'Guides for our digital platforms.', articleCount: 1, slug: 'mobile-online-banking' },
    { id: 'cat-5', name: 'Uncategorized', description: 'Miscellaneous articles.', articleCount: 0, slug: 'uncategorized' },
];

const generateSlug = (title: string): string => title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

const createMockArticle = (id: number, title: string, categoryId: string, authorId: string, status: ArticleStatus, content: string, tags: string[]): Article => {
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    return {
        id: `article-${id}`,
        title,
        slug: generateSlug(title),
        categoryId,
        authorId,
        status,
        content,
        tags,
        createdAt,
        updatedAt: new Date(new Date(createdAt).getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        viewCount: Math.floor(Math.random() * 5000),
        helpfulVotes: Math.floor(Math.random() * 500),
        unhelpfulVotes: Math.floor(Math.random() * 50),
        history: [
            { version: 1, content, authorId, timestamp: createdAt, changeSummary: 'Initial draft created.' }
        ],
        comments: [
            {
                id: `comment-${id}-1`,
                authorId: 'user-4',
                timestamp: new Date(new Date(createdAt).getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
                content: 'This was really helpful, thanks!',
                replies: [
                     {
                        id: `comment-${id}-1-1`,
                        authorId: 'user-2',
                        timestamp: new Date(new Date(createdAt).getTime() + Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString(),
                        content: 'Glad we could help!',
                     }
                ]
            },
            {
                id: `comment-${id}-2`,
                authorId: 'user-5',
                timestamp: new Date(new Date(createdAt).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                content: 'I still have a question about step 3. Can you clarify?',
            }
        ]
    };
};

const MOCK_ARTICLES: Article[] = [
    createMockArticle(
        1,
        "How to Reset Your Password",
        'cat-1',
        'user-2',
        'published',
        `# How to Reset Your Password

If you've forgotten your password, don't worry! You can easily reset it by following these steps.

## Step-by-Step Guide

1.  **Navigate to the Login Page**: Open the Demo Bank app or visit our website and go to the login screen.
2.  **Click 'Forgot Password'**: Look for a link that says "Forgot Password?" or "Reset Password" and click on it.
3.  **Enter Your Email Address**: Provide the email address associated with your Demo Bank account. We will send a password reset link to this email.
4.  **Check Your Email**: Open your email inbox and find the email from Demo Bank. If you don't see it, check your spam or junk folder.
5.  **Follow the Link**: Click on the password reset link in the email. This will take you to a secure page to create a new password.
6.  **Create a New Password**: Enter a new, strong password. Make sure it meets our security requirements (e.g., at least 8 characters, includes uppercase, lowercase, numbers, and symbols).
7.  **Confirm Your New Password**: Re-enter your new password to confirm it.
8.  **Login**: You can now log in with your new password!

## Still Having Trouble?

If you're still unable to reset your password, please contact our support team at 1-800-DEMO-BANK.`,
        ['password', 'reset', 'account', 'security']
    ),
    createMockArticle(
        2,
        "Setting Up Two-Factor Authentication (2FA)",
        'cat-3',
        'user-1',
        'published',
        `# Setting Up Two-Factor Authentication (2FA)

Two-Factor Authentication adds an extra layer of security to your account.

## Instructions

1.  Log in to your account.
2.  Go to **Settings > Security**.
3.  Find the **Two-Factor Authentication** section and click 'Enable'.
4.  Follow the on-screen instructions to link an authenticator app or your phone number.
5.  Verify the setup by entering the code provided by your authenticator app or SMS.
6.  Save your recovery codes in a safe place.`,
        ['2fa', 'security', 'authentication', 'mfa']
    ),
    createMockArticle(
        3,
        "How to Send a Wire Transfer",
        'cat-2',
        'user-3',
        'published',
        `# How to Send a Wire Transfer

Follow these steps to securely send a wire transfer.

1.  From your dashboard, select **Transfers > Wire Transfer**.
2.  Choose the account you want to send funds from.
3.  Enter the recipient's bank details, including their account number, routing number, and bank address.
4.  Enter the amount you wish to send.
5.  Review the details and associated fees.
6.  Confirm the transfer. You may need to verify your identity with 2FA.`,
        ['wire', 'transfer', 'payments']
    ),
    createMockArticle(
        4,
        "Understanding Your Monthly Statement",
        'cat-1',
        'user-2',
        'pending_review',
        `# Understanding Your Monthly Statement

This article is a draft and needs review. It will explain all sections of our new statement format.`,
        ['statement', 'billing', 'account']
    ),
    createMockArticle(
        5,
        "Disputing a Transaction",
        'cat-2',
        'user-3',
        'draft',
        `# Disputing a Transaction

*Initial draft content goes here.*`,
        ['dispute', 'fraud', 'transaction']
    ),
    createMockArticle(
        6,
        "How to Deposit a Check with the Mobile App",
        'cat-4',
        'user-1',
        'published',
        `# Mobile Check Deposit

1.  Open the Demo Bank mobile app and log in.
2.  Tap on **Deposits** in the bottom menu.
3.  Select the account to deposit into.
4.  Enter the check amount.
5.  Endorse the back of the check with "For Mobile Deposit at Demo Bank Only" and your signature.
6.  Take a photo of the front and back of the check.
7.  Confirm the deposit.`,
        ['mobile', 'deposit', 'check']
    ),
     createMockArticle(
        7,
        "Reporting a Lost or Stolen Card",
        'cat-3',
        'user-1',
        'published',
        `# Reporting a Lost or Stolen Card
        
If your card is lost or stolen, it's crucial to act quickly to protect your account.

## Immediate Steps
1.  **Freeze Your Card**: Log into the Demo Bank app or website immediately. Navigate to 'Card Services' and select the option to 'Freeze' or 'Lock' your card. This will prevent any new transactions.
2.  **Contact Us**: Call our 24/7 support line at 1-800-DEMO-BANK to report the card as lost or stolen.
3.  **Review Transactions**: Check your recent transactions for any unauthorized activity. Report any suspicious charges to the support agent.
4.  **Order a New Card**: A support agent will help you order a replacement card, which will be mailed to your address on file.`,
        ['card', 'lost', 'stolen', 'fraud']
    ),
    createMockArticle(
        8,
        "Updating Your Contact Information",
        'cat-1',
        'user-2',
        'archived',
        `# Updating Your Contact Information (Old Version)

This article is outdated. Please see the new version for updated instructions.`,
        ['profile', 'contact', 'update']
    ),
];


// --- STATE MANAGEMENT (useReducer) ---

type Action =
    | { type: 'SET_VIEW'; payload: AppState['currentView'] }
    | { type: 'START_LOADING' }
    | { type: 'DATA_FETCH_SUCCESS'; payload: { articles: Article[]; categories: Category[]; users: User[]; currentUser: User } }
    | { type: 'FETCH_FAILURE'; payload: string }
    | { type: 'SELECT_ARTICLE'; payload: string | null }
    | { type: 'UPDATE_ARTICLE'; payload: Article }
    | { type: 'CREATE_ARTICLE'; payload: Article }
    | { type: 'DELETE_ARTICLE'; payload: string }
    | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> };

const initialState: AppState = {
    articles: [],
    categories: [],
    users: [],
    currentUser: null,
    isLoading: true,
    error: null,
    currentView: 'dashboard',
    selectedArticleId: null,
    selectedCategoryId: null,
    notifications: [],
};

function knowledgeBaseReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'SET_VIEW':
            return { ...state, currentView: action.payload };
        case 'START_LOADING':
            return { ...state, isLoading: true, error: null };
        case 'DATA_FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                articles: action.payload.articles,
                categories: action.payload.categories,
                users: action.payload.users,
                currentUser: action.payload.currentUser,
            };
        case 'FETCH_FAILURE':
            return { ...state, isLoading: false, error: action.payload };
        case 'SELECT_ARTICLE':
            return { ...state, selectedArticleId: action.payload, currentView: action.payload ? 'article_detail' : 'articles' };
        case 'UPDATE_ARTICLE':
            return {
                ...state,
                articles: state.articles.map(a => a.id === action.payload.id ? action.payload : a),
            };
        case 'CREATE_ARTICLE':
            return {
                ...state,
                articles: [action.payload, ...state.articles],
            };
        case 'DELETE_ARTICLE':
             return {
                ...state,
                articles: state.articles.filter(a => a.id !== action.payload),
             };
        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notifications: [...state.notifications, { ...action.payload, id: Date.now() }],
            };
        default:
            return state;
    }
}


// --- MOCK API SERVICE LAYER ---

/**
 * Simulates fetching all initial data for the knowledge base.
 * @returns A promise that resolves with all necessary data.
 */
export const fetchKnowledgeBaseData = async (): Promise<{ articles: Article[]; categories: Category[]; users: User[]; currentUser: User }> => {
    console.log("API: Fetching all knowledge base data...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    // In a real app, you'd check for a logged-in user session. Here, we'll just pick one.
    const currentUser = MOCK_USERS[0];
    return { articles: MOCK_ARTICLES, categories: MOCK_CATEGORIES, users: MOCK_USERS, currentUser };
};

/**
 * Simulates saving an article to the backend.
 * @param article The article data to save.
 * @returns A promise that resolves with the saved article (with updated timestamps).
 */
export const saveArticle = async (article: Article): Promise<Article> => {
    console.log(`API: Saving article "${article.title}"...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const isNew = !MOCK_ARTICLES.find(a => a.id === article.id);
    if (isNew) {
        const newArticle = { ...article, id: `article-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        MOCK_ARTICLES.unshift(newArticle);
        return newArticle;
    } else {
        const updatedArticle = { ...article, updatedAt: new Date().toISOString() };
        const index = MOCK_ARTICLES.findIndex(a => a.id === article.id);
        MOCK_ARTICLES[index] = updatedArticle;
        return updatedArticle;
    }
};

/**
 * Simulates deleting an article from the backend.
 * @param articleId The ID of the article to delete.
 * @returns A promise that resolves when deletion is complete.
 */
export const deleteArticle = async (articleId: string): Promise<{ success: boolean }> => {
    console.log(`API: Deleting article with ID "${articleId}"...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_ARTICLES.findIndex(a => a.id === articleId);
    if (index > -1) {
        MOCK_ARTICLES.splice(index, 1);
        return { success: true };
    }
    return { success: false };
};


// --- UTILITY & HELPER FUNCTIONS ---

/**
 * Formats an ISO date string into a more readable format.
 * @param isoString The ISO date string.
 * @returns A formatted date string (e.g., "Jan 1, 2023, 5:00 PM").
 */
export const formatDate = (isoString: string): string => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};

/**
 * A simple hook for managing notifications/toasts.
 */
export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    const addNotification = (message: string, type: Notification['type']) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };
    
    return { notifications, addNotification };
};


// --- UI COMPONENTS ---

/**
 * Renders a status badge for an article.
 */
export const StatusBadge: React.FC<{ status: ArticleStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    const statusMap = {
        published: "bg-green-500/20 text-green-300",
        pending_review: "bg-yellow-500/20 text-yellow-300",
        draft: "bg-gray-500/20 text-gray-300",
        archived: "bg-red-500/20 text-red-300",
    };
    const statusText = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    return <span className={`${baseClasses} ${statusMap[status]}`}>{statusText}</span>;
};

/**
 * Renders user avatar and name.
 */
export const UserDisplay: React.FC<{ userId: string; users: User[] }> = ({ userId, users }) => {
    const user = users.find(u => u.id === userId);
    if (!user) return <div className="text-gray-400">Unknown User</div>;
    return (
        <div className="flex items-center space-x-2">
            <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full" />
            <span className="text-sm text-gray-300">{user.name}</span>
        </div>
    );
};

/**
 * Search and filter bar for the articles list.
 */
export const ArticleFilterBar: React.FC<{ onFilterChange: (filters: any) => void; categories: Category[] }> = ({ onFilterChange, categories }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    
    useEffect(() => {
        const handler = setTimeout(() => {
            onFilterChange({ searchTerm, status: statusFilter, category: categoryFilter });
        }, 300); // Debounce search term
        return () => clearTimeout(handler);
    }, [searchTerm, statusFilter, categoryFilter, onFilterChange]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800/50 rounded-lg">
            <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="col-span-1 md:col-span-1 bg-gray-700/50 p-2 rounded text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
            <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="col-span-1 md:col-span-1 bg-gray-700/50 p-2 rounded text-white focus:ring-cyan-500 focus:border-cyan-500"
            >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="pending_review">Pending Review</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
            </select>
             <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="col-span-1 md:col-span-1 bg-gray-700/50 p-2 rounded text-white focus:ring-cyan-500 focus:border-cyan-500"
            >
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
        </div>
    );
};


/**
 * The main list view for all articles.
 */
export const ArticleListView: React.FC<{ 
    articles: Article[];
    categories: Category[];
    users: User[];
    dispatch: React.Dispatch<Action>;
}> = ({ articles, categories, users, dispatch }) => {
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState<{ key: keyof Article; order: 'asc' | 'desc' }>({ key: 'updatedAt', order: 'desc' });

    const filteredAndSortedArticles = useMemo(() => {
        let filtered = [...articles];

        const { searchTerm, status, category } = filters as any;
        if (searchTerm) {
            filtered = filtered.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (status) {
            filtered = filtered.filter(a => a.status === status);
        }
        if (category) {
            filtered = filtered.filter(a => a.categoryId === category);
        }

        return filtered.sort((a, b) => {
            const valA = a[sortBy.key];
            const valB = b[sortBy.key];
            if (valA < valB) return sortBy.order === 'asc' ? -1 : 1;
            if (valA > valB) return sortBy.order === 'asc' ? 1 : -1;
            return 0;
        });
    }, [articles, filters, sortBy]);
    
    const handleSort = (key: keyof Article) => {
        setSortBy(prev => ({
            key,
            order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc'
        }));
    };
    
    const SortableHeader: React.FC<{ sortKey: keyof Article; children: React.ReactNode }> = ({ sortKey, children }) => (
         <th onClick={() => handleSort(sortKey)} className="p-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700">
             <div className="flex items-center">
                {children}
                {sortBy.key === sortKey && <span className="ml-2">{sortBy.order === 'desc' ? '↓' : '↑'}</span>}
             </div>
         </th>
    );

    return (
        <Card title="Knowledge Base Articles">
            <ArticleFilterBar onFilterChange={setFilters} categories={categories} />
            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full bg-gray-900/50 rounded-lg">
                    <thead className="bg-gray-800/70">
                        <tr>
                            <SortableHeader sortKey="title">Title</SortableHeader>
                            <SortableHeader sortKey="status">Status</SortableHeader>
                            <th className="p-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Category</th>
                            <SortableHeader sortKey="updatedAt">Last Updated</SortableHeader>
                            <SortableHeader sortKey="viewCount">Views</SortableHeader>
                            <th className="p-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Author</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredAndSortedArticles.map(article => (
                            <tr key={article.id} className="hover:bg-gray-800/60 cursor-pointer" onClick={() => dispatch({ type: 'SELECT_ARTICLE', payload: article.id })}>
                                <td className="p-3 text-white">{article.title}</td>
                                <td className="p-3"><StatusBadge status={article.status} /></td>
                                <td className="p-3 text-gray-400">{categories.find(c => c.id === article.categoryId)?.name || 'N/A'}</td>
                                <td className="p-3 text-gray-400">{formatDate(article.updatedAt)}</td>
                                <td className="p-3 text-gray-400">{article.viewCount.toLocaleString()}</td>
                                <td className="p-3"><UserDisplay userId={article.authorId} users={users} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredAndSortedArticles.length === 0 && <p className="text-center text-gray-400 p-8">No articles match your criteria.</p>}
            </div>
        </Card>
    );
};

/**
 * View for displaying a single article's details.
 */
export const ArticleDetailView: React.FC<{
    article: Article;
    category: Category;
    users: User[];
    currentUser: User;
    dispatch: React.Dispatch<Action>;
    addNotification: (message: string, type: Notification['type']) => void;
}> = ({ article, category, users, currentUser, dispatch, addNotification }) => {

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) {
             try {
                await deleteArticle(article.id);
                dispatch({ type: 'DELETE_ARTICLE', payload: article.id });
                addNotification('Article deleted successfully.', 'success');
                dispatch({ type: 'SELECT_ARTICLE', payload: null });
            } catch (error) {
                addNotification('Failed to delete article.', 'error');
            }
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'articles' })} className="text-cyan-400 hover:text-cyan-300 mb-2">
                        &larr; Back to Articles
                    </button>
                    <h2 className="text-3xl font-bold text-white tracking-wider">{article.title}</h2>
                    <div className="flex items-center space-x-4 mt-2 text-gray-400 text-sm">
                        <span>Category: <span className="font-semibold text-cyan-400">{category.name}</span></span>
                        <span>|</span>
                        <span>Author: <span className="font-semibold text-gray-200">{users.find(u => u.id === article.authorId)?.name}</span></span>
                        <span>|</span>
                        <span>Last Updated: {formatDate(article.updatedAt)}</span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    {(currentUser.role === 'admin' || currentUser.role === 'editor') && (
                        <button 
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'article_edit' })}
                            className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
                        >
                            Edit
                        </button>
                    )}
                     {currentUser.role === 'admin' && (
                        <button 
                            onClick={handleDelete}
                            className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded transition-colors"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <Card>
                <div className="prose prose-invert prose-lg max-w-none text-gray-300 whitespace-pre-line">
                   {article.content}
                </div>
            </Card>

            {/* In a real app, comments and history would be their own complex components */}
            <Card title="Version History">
                 <ul className="space-y-2">
                    {article.history.map(v => (
                        <li key={v.version} className="text-sm p-2 bg-gray-800/50 rounded">
                            <span className="font-bold">Version {v.version}</span> by <UserDisplay userId={v.authorId} users={users} /> on {formatDate(v.timestamp)}
                            <p className="text-gray-400 italic mt-1">"{v.changeSummary}"</p>
                        </li>
                    ))}
                 </ul>
            </Card>

            <Card title="Comments">
                <div className="space-y-4">
                    {article.comments.map(c => (
                        <div key={c.id} className="p-3 bg-gray-800/50 rounded">
                            <div className="flex items-center justify-between mb-1">
                                <UserDisplay userId={c.authorId} users={users} />
                                <span className="text-xs text-gray-500">{formatDate(c.timestamp)}</span>
                            </div>
                            <p className="text-gray-300">{c.content}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};


/**
 * The original AI drafter component, now refactored.
 */
export const AiArticleDrafter: React.FC<{
    onDraftGenerated: (title: string, content: string) => void;
    initialPrompt?: string;
}> = ({ onDraftGenerated, initialPrompt = "How to reset your password" }) => {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [generatedArticle, setGeneratedArticle] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedArticle('');
        try {
            // NOTE: This uses an environment variable for the API key.
            // Ensure process.env.API_KEY is configured in your environment.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `You are a helpful technical writer for "Demo Bank". Write a simple, clear knowledge base article with step-by-step instructions for the topic: "${prompt}". The article should be ready to be published for customers. Use markdown for formatting, including a main header (H1), sub-headers (H2), and numbered or bulleted lists where appropriate.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            setGeneratedArticle(response.text);
        } catch (error) {
            console.error("AI Generation Error:", error);
            setGeneratedArticle("Error: Could not generate article draft. Please check your API key and network connection.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (generatedArticle && !generatedArticle.startsWith('Error:')) {
            onDraftGenerated(prompt, generatedArticle);
        }
    }, [generatedArticle, onDraftGenerated, prompt]);

    return (
        <Card title="AI Article Drafter">
            <p className="text-gray-400 mb-4">Enter the title of the help article you want the AI to write.</p>
            <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
            />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                {isLoading ? 'Drafting...' : 'Generate Article Draft'}
            </button>
            {(isLoading || generatedArticle) && (
                <div className="mt-4">
                    <h4 className="text-lg font-semibold text-white mb-2">Generated Draft Preview</h4>
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-line bg-gray-900/50 p-4 rounded max-h-60 overflow-auto">
                       {isLoading ? 'The AI is thinking...' : generatedArticle}
                    </div>
                </div>
            )}
        </Card>
    );
};

/**
 * Form for creating or editing an article.
 */
export const ArticleEditorView: React.FC<{
    article?: Article; // if present, we're editing
    categories: Category[];
    currentUser: User;
    dispatch: React.Dispatch<Action>;
    addNotification: (message: string, type: Notification['type']) => void;
}> = ({ article, categories, currentUser, dispatch, addNotification }) => {
    const [title, setTitle] = useState(article?.title || '');
    const [content, setContent] = useState(article?.content || '');
    const [categoryId, setCategoryId] = useState(article?.categoryId || categories[0]?.id || '');
    const [status, setStatus] = useState<ArticleStatus>(article?.status || 'draft');
    const [tags, setTags] = useState(article?.tags.join(', ') || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleAiDraft = useCallback((draftTitle: string, draftContent: string) => {
        setTitle(draftTitle);
        setContent(draftContent);
        addNotification("AI draft has been populated into the editor.", 'info');
    }, [addNotification]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const articleData: Article = {
            ...(article || { id: '', createdAt: new Date().toISOString(), slug: '', viewCount: 0, helpfulVotes: 0, unhelpfulVotes: 0, history: [], comments: [] }),
            title,
            content,
            categoryId,
            status,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            authorId: article?.authorId || currentUser.id,
            updatedAt: new Date().toISOString(),
        };

        // Add to version history
        const newVersion: ArticleVersion = {
            version: (article?.history.length || 0) + 1,
            content,
            authorId: currentUser.id,
            timestamp: new Date().toISOString(),
            changeSummary: article ? 'Content updated' : 'Initial version'
        };
        articleData.history = article ? [...article.history, newVersion] : [newVersion];
        
        try {
            const savedArticle = await saveArticle(articleData);
            if (article) {
                dispatch({ type: 'UPDATE_ARTICLE', payload: savedArticle });
            } else {
                dispatch({ type: 'CREATE_ARTICLE', payload: savedArticle });
            }
            addNotification(`Article "${savedArticle.title}" saved successfully!`, 'success');
            dispatch({ type: 'SELECT_ARTICLE', payload: savedArticle.id });
        } catch(error) {
             addNotification('Error saving article.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <button onClick={() => dispatch({ type: 'SET_VIEW', payload: article ? 'article_detail' : 'articles' })} className="text-cyan-400 hover:text-cyan-300 mb-2">
                &larr; Cancel
            </button>
            <h2 className="text-3xl font-bold text-white tracking-wider">{article ? 'Edit Article' : 'Create New Article'}</h2>

            {!article && <AiArticleDrafter onDraftGenerated={handleAiDraft} />}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card title="Article Content">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                className="w-full bg-gray-700/50 p-3 rounded text-white focus:ring-cyan-500 focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">Content (Markdown supported)</label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                required
                                rows={20}
                                className="w-full bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                            />
                        </div>
                    </div>
                </Card>
                <Card title="Metadata & Publishing">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                             <select
                                id="category"
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                                className="w-full bg-gray-700/50 p-3 rounded text-white focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                         </div>
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                             <select
                                id="status"
                                value={status}
                                onChange={e => setStatus(e.target.value as ArticleStatus)}
                                className="w-full bg-gray-700/50 p-3 rounded text-white focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="pending_review">Pending Review</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                         </div>
                         <div className="col-span-1 md:col-span-2">
                             <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">Tags (comma-separated)</label>
                            <input
                                id="tags"
                                type="text"
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                className="w-full bg-gray-700/50 p-3 rounded text-white focus:ring-cyan-500 focus:border-cyan-500"
                            />
                         </div>
                     </div>
                </Card>
                
                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="py-2 px-6 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                        {isSaving ? 'Saving...' : 'Save Article'}
                    </button>
                </div>
            </form>
        </div>
    );
};

/**
 * A dashboard view with statistics.
 */
export const DashboardView: React.FC<{ articles: Article[], categories: Category[] }> = ({ articles, categories }) => {
    const totalArticles = articles.length;
    const published = articles.filter(a => a.status === 'published').length;
    const drafts = articles.filter(a => a.status === 'draft').length;
    const pending = articles.filter(a => a.status === 'pending_review').length;
    const totalViews = articles.reduce((sum, a) => sum + a.viewCount, 0);

    const mostViewedArticles = [...articles].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

    const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
        <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Dashboard</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Articles" value={totalArticles} />
                <StatCard title="Published" value={published} />
                <StatCard title="Drafts & Pending" value={drafts + pending} />
                <StatCard title="Total Views" value={totalViews.toLocaleString()} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Most Viewed Articles">
                    <ul className="space-y-2">
                        {mostViewedArticles.map(a => (
                            <li key={a.id} className="flex justify-between items-center text-sm p-2 bg-gray-800/50 rounded">
                                <span className="text-gray-300">{a.title}</span>
                                <span className="font-semibold text-white">{a.viewCount.toLocaleString()} views</span>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card title="Articles by Category">
                    <ul className="space-y-2">
                        {categories.map(c => {
                            const count = articles.filter(a => a.categoryId === c.id).length;
                            return (
                                <li key={c.id} className="flex justify-between items-center text-sm p-2 bg-gray-800/50 rounded">
                                    <span className="text-gray-300">{c.name}</span>
                                    <span className="font-semibold text-white">{count} articles</span>
                                </li>
                            );
                        })}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

/**
 * The main application shell, handling routing and data fetching.
 */
const DemoBankKnowledgeBaseView: React.FC = () => {
    const [state, dispatch] = useReducer(knowledgeBaseReducer, initialState);
    const { notifications, addNotification } = useNotifications();
    
    useEffect(() => {
        const loadData = async () => {
            dispatch({ type: 'START_LOADING' });
            try {
                const data = await fetchKnowledgeBaseData();
                dispatch({ type: 'DATA_FETCH_SUCCESS', payload: data });
            } catch (error) {
                dispatch({ type: 'FETCH_FAILURE', payload: 'Failed to load knowledge base data.' });
            }
        };
        loadData();
    }, []);

    const selectedArticle = useMemo(() => {
        return state.articles.find(a => a.id === state.selectedArticleId) || null;
    }, [state.articles, state.selectedArticleId]);

    const renderView = () => {
        if (state.isLoading) {
            return <div className="text-center text-gray-400 p-8">Loading Knowledge Base...</div>;
        }
        if (state.error) {
            return <div className="text-center text-red-400 p-8">Error: {state.error}</div>;
        }

        switch (state.currentView) {
            case 'dashboard':
                return <DashboardView articles={state.articles} categories={state.categories} />;
            case 'articles':
                return <ArticleListView articles={state.articles} categories={state.categories} users={state.users} dispatch={dispatch} />;
            case 'article_detail':
                if (selectedArticle && state.currentUser) {
                    return <ArticleDetailView 
                        article={selectedArticle} 
                        category={state.categories.find(c => c.id === selectedArticle.categoryId)!}
                        users={state.users}
                        currentUser={state.currentUser}
                        dispatch={dispatch}
                        addNotification={addNotification}
                    />;
                }
                return <div className="text-red-400">Article not found.</div>;
            case 'article_edit':
                if (selectedArticle && state.currentUser) {
                     return <ArticleEditorView
                        article={selectedArticle}
                        categories={state.categories}
                        currentUser={state.currentUser}
                        dispatch={dispatch}
                        addNotification={addNotification}
                     />;
                }
                 return <div className="text-red-400">Article not found.</div>;
            case 'article_create':
                if(state.currentUser) {
                    return <ArticleEditorView
                        categories={state.categories}
                        currentUser={state.currentUser}
                        dispatch={dispatch}
                        addNotification={addNotification}
                     />;
                }
                return <div className="text-red-400">Cannot create article. User not found.</div>;
            default:
                return <div>View not implemented.</div>;
        }
    };
    
    const NavButton: React.FC<{ view: AppState['currentView']; children: React.ReactNode }> = ({ view, children }) => (
        <button 
            onClick={() => dispatch({ type: 'SET_VIEW', payload: view })}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${state.currentView === view ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
                <h1 className="text-3xl font-bold text-white tracking-wider">Demo Bank Knowledge Base</h1>
                {state.currentUser && (
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-300">Welcome, {state.currentUser.name}</span>
                         <button 
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'article_create' })}
                            className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded transition-colors text-sm font-semibold"
                        >
                            + New Article
                        </button>
                    </div>
                )}
            </div>
            
            <nav className="flex space-x-2 p-2 bg-gray-800/50 rounded-lg">
                <NavButton view="dashboard">Dashboard</NavButton>
                <NavButton view="articles">Articles</NavButton>
                {/* Future views could be added here */}
                {/* <NavButton view="categories">Categories</NavButton> */}
                {/* <NavButton view="settings">Settings</NavButton> */}
            </nav>

            <main>
                {renderView()}
            </main>

            {/* Notification Toasts */}
             <div className="fixed bottom-4 right-4 space-y-2 z-50">
                {notifications.map(n => (
                    <div key={n.id} className={`px-4 py-2 rounded-lg shadow-lg text-white ${n.type === 'success' ? 'bg-green-600' : n.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        {n.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DemoBankKnowledgeBaseView;