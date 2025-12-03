// components/TransactionsView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "FlowMatrix," the complete Great Library for all financial events.
// It features advanced filtering, sorting, and the integrated "Plato's Intelligence Suite"
// for powerful, AI-driven transaction analysis.

import React, { useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { Transaction, DetectedSubscription } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// ================================================================================================
// EXTENDED DATA TYPES AND INTERFACES (FlowMatrix Universe Expansion)
// ================================================================================================

/**
 * @description Represents an attachment linked to a transaction, such as a receipt or invoice.
 */
export interface TransactionAttachment {
    id: string;
    filename: string;
    url: string; // URL to storage (e.g., S3, IPFS)
    mimeType: string;
    uploadedAt: string;
    tags?: string[];
    aiExtractedText?: string; // Text extracted by AI from the attachment
}

/**
 * @description Represents a sub-transaction or split payment within a larger transaction.
 */
export interface SubTransaction {
    id: string;
    description: string;
    amount: number;
    category: string;
    notes?: string;
    relatedPartyId?: string; // e.g., for splitting bills with friends
}

/**
 * @description Extends the base Transaction type with richer metadata and relationships.
 */
export interface FlowMatrixTransaction extends Transaction {
    attachments?: TransactionAttachment[];
    subTransactions?: SubTransaction[];
    merchantDetails?: {
        name: string;
        location?: { lat: number; lng: number; address: string; };
        industry?: string;
        logoUrl?: string;
        contactInfo?: string;
        // AI-inferred merchant reputation score
        aiReputationScore?: number;
    };
    tags?: string[]; // User-defined tags for advanced filtering
    budgetImpact?: {
        budgetId: string;
        categoryBudgetRemaining: number;
        overallBudgetRemaining: number;
    };
    aiInsights?: {
        riskScore?: number; // AI-calculated risk of fraud or unusual activity
        sentiment?: 'positive' | 'neutral' | 'negative'; // AI-derived sentiment (e.g., for discretionary spending)
        carbonFootprintCategory?: string; // More specific carbon category
        predictedFutureTrend?: 'increasing' | 'decreasing' | 'stable';
    };
    blockchainDetails?: {
        txHash: string;
        blockNumber?: number;
        assetType: 'crypto' | 'NFT' | 'tokenized_asset';
        network: string; // e.g., 'Ethereum', 'Polygon'
        walletAddress?: string;
        smartContractInteraction?: {
            contractAddress: string;
            functionName: string;
            valueTransferred: string;
        };
    };
    auditLog?: TransactionAuditLogEntry[]; // History of changes/interactions
    isReconciled?: boolean; // For professional accounting workflows
    isReviewed?: boolean; // User review status
    relatedTransactionIds?: string[]; // For linking refunds, chargebacks, or complex flows
    currency: string; // e.g., USD, EUR, BTC
    exchangeRateToUserBaseCurrency?: number; // Rate at time of transaction
}

/**
 * @description Represents an entry in a transaction's audit log.
 */
export interface TransactionAuditLogEntry {
    timestamp: string;
    userId: string;
    action: string; // e.g., 'created', 'updated_category', 'viewed', 'flagged_fraud'
    details?: string;
}

/**
 * @description Represents a user's financial goal.
 */
export interface FinancialGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    startDate: string;
    targetDate: string;
    progressPercentage: number;
    linkedCategories: string[]; // Categories whose transactions contribute to this goal
    aiProjection?: {
        isAchievable: boolean;
        timeToAchieve: string; // e.g., "3 months at current pace"
        recommendations: string[];
    };
}

/**
 * @description Represents a budget allocation for a category.
 */
export interface CategoryBudget {
    id: string;
    category: string;
    monthlyLimit: number;
    spentThisMonth: number;
    remaining: number;
    alertsConfig?: {
        thresholdPercentage: number; // e.g., 80% of budget spent
        alertType: 'email' | 'notification' | 'SMS';
    };
    aiOptimizationSuggestion?: {
        optimizedLimit: number;
        reasoning: string;
    };
}

/**
 * @description Represents an AI-generated actionable insight or recommendation.
 */
export interface AIRecommendation {
    id: string;
    title: string;
    description: string;
    category: 'savings' | 'investment' | 'debt' | 'budget' | 'security' | 'sustainability';
    actionableItems: Array<{
        text: string;
        actionUrl?: string; // Deep link within the app or external service
    }>;
    relevanceScore: number; // AI-determined relevance
    generatedAt: string;
    isDismissed?: boolean;
    feedback?: 'helpful' | 'unhelpful';
}

/**
 * @description Represents an AI-driven financial alert.
 */
export interface FinancialAlert {
    id: string;
    type: 'fraud' | 'over_budget' | 'subscription_due' | 'unusual_spending' | 'goal_risk';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
    transactionId?: string; // If related to a specific transaction
    isResolved: boolean;
    resolutionNotes?: string;
}

// ================================================================================================
// MODAL & DETAIL COMPONENTS (Expanded for FlowMatrix Richness)
// ================================================================================================

/**
 * @description A modal that displays detailed information about a single transaction, now supporting FlowMatrixTransaction.
 * This component provides a "magnifying glass" view into a specific financial event, including sub-transactions, attachments, and AI insights.
 * @param {{ transaction: FlowMatrixTransaction | null; onClose: () => void }} props
 */
export const TransactionDetailModal: React.FC<{ transaction: FlowMatrixTransaction | null; onClose: () => void }> = ({ transaction, onClose }) => {
    if (!transaction) return null;

    const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'subtransactions' | 'aiinsights' | 'blockchain' | 'audit'>('details');

    const renderAttachment = (attachment: TransactionAttachment) => (
        <div key={attachment.id} className="border border-gray-700 rounded-md p-2 text-xs flex flex-col gap-1">
            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{attachment.filename}</a>
            <span className="text-gray-500">Uploaded: {new Date(attachment.uploadedAt).toLocaleString()}</span>
            {attachment.aiExtractedText && (
                <div className="mt-1 p-1 bg-gray-700/50 rounded text-gray-400 max-h-20 overflow-y-auto">
                    <p className="font-semibold">AI Extract:</p>
                    <p>{attachment.aiExtractedText}</p>
                </div>
            )}
        </div>
    );

    const renderSubTransaction = (subTx: SubTransaction) => (
        <div key={subTx.id} className="border border-gray-700 rounded-md p-2 text-xs">
            <div className="flex justify-between">
                <span className="text-white">{subTx.description}</span>
                <span className={`font-mono ${subTx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>{subTx.amount >= 0 ? '+' : '-'}${Math.abs(subTx.amount).toFixed(2)}</span>
            </div>
            {subTx.category && <span className="text-gray-500">Category: {subTx.category}</span>}
            {subTx.notes && <p className="text-gray-500 italic mt-1">{subTx.notes}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Transaction Details: {transaction.description}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl" aria-label="Close modal">&times;</button>
                </div>
                <div className="flex border-b border-gray-700">
                    <button className={`py-2 px-4 text-sm font-medium ${activeTab === 'details' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`} onClick={() => setActiveTab('details')}>Overview</button>
                    {transaction.attachments && transaction.attachments.length > 0 && (
                        <button className={`py-2 px-4 text-sm font-medium ${activeTab === 'attachments' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`} onClick={() => setActiveTab('attachments')}>Attachments ({transaction.attachments.length})</button>
                    )}
                    {transaction.subTransactions && transaction.subTransactions.length > 0 && (
                        <button className={`py-2 px-4 text-sm font-medium ${activeTab === 'subtransactions' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`} onClick={() => setActiveTab('subtransactions')}>Splits ({transaction.subTransactions.length})</button>
                    )}
                    {transaction.aiInsights && (
                        <button className={`py-2 px-4 text-sm font-medium ${activeTab === 'aiinsights' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`} onClick={() => setActiveTab('aiinsights')}>AI Insights</button>
                    )}
                    {transaction.blockchainDetails && (
                        <button className={`py-2 px-4 text-sm font-medium ${activeTab === 'blockchain' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`} onClick={() => setActiveTab('blockchain')}>Blockchain</button>
                    )}
                    {transaction.auditLog && transaction.auditLog.length > 0 && (
                        <button className={`py-2 px-4 text-sm font-medium ${activeTab === 'audit' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`} onClick={() => setActiveTab('audit')}>Audit Log</button>
                    )}
                </div>
                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {activeTab === 'details' && (
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm"><span className="text-gray-400">Description:</span> <span className="text-white font-semibold">{transaction.description}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-400">Amount:</span> <span className={`font-mono font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{transaction.type === 'income' ? '+' : '-'}{transaction.currency}{transaction.amount.toFixed(2)}</span></div>
                            {transaction.exchangeRateToUserBaseCurrency && (
                                <div className="flex justify-between text-sm"><span className="text-gray-400">Exchange Rate:</span> <span className="text-gray-300">1 {transaction.currency} = {transaction.exchangeRateToUserBaseCurrency.toFixed(4)} USD</span></div>
                            )}
                            <div className="flex justify-between text-sm"><span className="text-gray-400">Date:</span> <span className="text-white">{transaction.date}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-400">Category:</span> <span className="text-white">{transaction.category}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-400">Transaction ID:</span> <span className="text-white font-mono text-xs">{transaction.id}</span></div>
                            {transaction.tags && transaction.tags.length > 0 && <div className="flex justify-between text-sm"><span className="text-gray-400">Tags:</span> <span className="text-cyan-300">{transaction.tags.join(', ')}</span></div>}
                            {transaction.carbonFootprint && <div className="flex justify-between text-sm"><span className="text-gray-400">Carbon Footprint:</span> <span className="text-green-300">{transaction.carbonFootprint.toFixed(1)} kg CO₂ {transaction.aiInsights?.carbonFootprintCategory && `(${transaction.aiInsights.carbonFootprintCategory})`}</span></div>}
                            {transaction.merchantDetails && (
                                <div className="space-y-1">
                                    <h4 className="text-gray-300 text-sm font-semibold mt-2">Merchant Details:</h4>
                                    <p className="text-xs text-gray-400 flex items-center gap-2">
                                        {transaction.merchantDetails.logoUrl && <img src={transaction.merchantDetails.logoUrl} alt="Merchant Logo" className="h-5 w-5 rounded-full" />}
                                        <span className="text-white">{transaction.merchantDetails.name}</span>
                                        {transaction.merchantDetails.industry && <span className="text-gray-500">({transaction.merchantDetails.industry})</span>}
                                        {transaction.merchantDetails.aiReputationScore && <span className={`text-xs p-1 rounded ${transaction.merchantDetails.aiReputationScore > 7 ? 'bg-green-700' : transaction.merchantDetails.aiReputationScore > 4 ? 'bg-yellow-700' : 'bg-red-700'} text-white`}>Reputation: {transaction.merchantDetails.aiReputationScore}/10</span>}
                                    </p>
                                    {transaction.merchantDetails.location && <p className="text-xs text-gray-500 ml-7">{transaction.merchantDetails.location.address}</p>}
                                </div>
                            )}
                            <div className="flex justify-between text-sm"><span className="text-gray-400">Reconciled:</span> <span className={transaction.isReconciled ? 'text-green-400' : 'text-yellow-400'}>{transaction.isReconciled ? 'Yes' : 'No'}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-400">User Reviewed:</span> <span className={transaction.isReviewed ? 'text-green-400' : 'text-red-400'}>{transaction.isReviewed ? 'Yes' : 'No'}</span></div>
                        </div>
                    )}
                    {activeTab === 'attachments' && transaction.attachments && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {transaction.attachments.map(renderAttachment)}
                        </div>
                    )}
                    {activeTab === 'subtransactions' && transaction.subTransactions && (
                        <div className="space-y-3">
                            {transaction.subTransactions.map(renderSubTransaction)}
                            {transaction.subTransactions.length === 0 && <p className="text-gray-500">No sub-transactions found.</p>}
                        </div>
                    )}
                    {activeTab === 'aiinsights' && transaction.aiInsights && (
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Risk Score:</span> <span className={`font-semibold ${transaction.aiInsights.riskScore && transaction.aiInsights.riskScore > 70 ? 'text-red-400' : transaction.aiInsights.riskScore && transaction.aiInsights.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>{transaction.aiInsights.riskScore}%</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Sentiment:</span> <span className={`font-semibold ${transaction.aiInsights.sentiment === 'positive' ? 'text-green-400' : transaction.aiInsights.sentiment === 'negative' ? 'text-red-400' : 'text-gray-400'}`}>{transaction.aiInsights.sentiment}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Predicted Trend:</span> <span className="text-cyan-300">{transaction.aiInsights.predictedFutureTrend}</span></div>
                            {transaction.budgetImpact && (
                                <div className="space-y-1">
                                    <h4 className="text-gray-300 text-sm font-semibold mt-2">Budget Impact:</h4>
                                    <p className="text-xs text-gray-400">Category Remaining: <span className="text-white">${transaction.budgetImpact.categoryBudgetRemaining.toFixed(2)}</span></p>
                                    <p className="text-xs text-gray-400">Overall Remaining: <span className="text-white">${transaction.budgetImpact.overallBudgetRemaining.toFixed(2)}</span></p>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'blockchain' && transaction.blockchainDetails && (
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Tx Hash:</span> <a href={`https://etherscan.io/tx/${transaction.blockchainDetails.txHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-mono text-xs max-w-[70%] overflow-hidden text-ellipsis">{transaction.blockchainDetails.txHash}</a></div>
                            <div className="flex justify-between"><span className="text-gray-400">Network:</span> <span className="text-white">{transaction.blockchainDetails.network}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Asset Type:</span> <span className="text-white">{transaction.blockchainDetails.assetType}</span></div>
                            {transaction.blockchainDetails.walletAddress && <div className="flex justify-between"><span className="text-gray-400">Wallet:</span> <span className="text-white font-mono text-xs">{transaction.blockchainDetails.walletAddress}</span></div>}
                            {transaction.blockchainDetails.smartContractInteraction && (
                                <div className="space-y-1">
                                    <h4 className="text-gray-300 text-sm font-semibold mt-2">Smart Contract Interaction:</h4>
                                    <p className="text-xs text-gray-400">Contract: <span className="text-white font-mono">{transaction.blockchainDetails.smartContractInteraction.contractAddress}</span></p>
                                    <p className="text-xs text-gray-400">Function: <span className="text-white">{transaction.blockchainDetails.smartContractInteraction.functionName}</span></p>
                                    <p className="text-xs text-gray-400">Value: <span className="text-white">{transaction.blockchainDetails.smartContractInteraction.valueTransferred}</span></p>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'audit' && transaction.auditLog && (
                        <div className="space-y-2">
                            {transaction.auditLog.map((log, index) => (
                                <div key={index} className="border-b border-gray-800 pb-2 text-xs">
                                    <p className="text-gray-300"><strong>{log.action}</strong> by User {log.userId} at {new Date(log.timestamp).toLocaleString()}</p>
                                    {log.details && <p className="text-gray-500 italic mt-1">{log.details}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-end">
                    <button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-200">Done</button>
                </div>
            </div>
        </div>
    );
};

// ================================================================================================
// PLATO'S INTELLIGENCE SUITE (AI WIDGETS & Core AI Logic) - Expanded Universe
// ================================================================================================

/**
 * @description A generic, reusable component for displaying an AI-generated insight
 * based on the user's transaction history. It handles the loading state, error state,
 * and rendering of the result, which can be either plain text or structured JSON.
 * Expanded to include contextual prompts, AI model selection, and richer error handling.
 */
export const AITransactionWidget: React.FC<{
    title: string;
    prompt: string;
    transactions: FlowMatrixTransaction[]; // Now uses FlowMatrixTransaction
    responseSchema?: any; // Allows passing a response schema for structured JSON
    children?: (result: any) => React.ReactNode; // Custom renderer for structured data
    model?: string; // Specify AI model, e.g., 'gemini-2.5-flash', 'gemini-1.5-pro'
    contextualData?: Record<string, any>; // Additional data for prompt engineering
    autoGenerate?: boolean; // Automatically generate on mount
}> = ({ title, prompt, transactions, responseSchema, children, model = 'gemini-2.5-flash', contextualData, autoGenerate = false }) => {
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const generateInsight = useCallback(async () => {
        if (!process.env.NEXT_PUBLIC_API_KEY) { // Use NEXT_PUBLIC for client-side API keys
            setError('Plato AI API key is not configured.');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY as string });
            // Create a concise summary of recent transactions, including new FlowMatrix fields.
            const transactionSummary = transactions.slice(0, 50).map(t =>
                `${t.date} - ${t.description} (${t.category}): ${t.type === 'income' ? '+' : '-'}${t.currency}${t.amount.toFixed(2)}` +
                (t.tags && t.tags.length > 0 ? ` [Tags: ${t.tags.join(', ')}]` : '') +
                (t.aiInsights?.riskScore ? ` [Risk: ${t.aiInsights.riskScore}%]` : '')
            ).join('\n');

            let fullPrompt = `${prompt}\n\nHere are the most recent transactions for context:\n${transactionSummary}`;

            if (contextualData) {
                fullPrompt += `\n\nAdditional Context:\n${JSON.stringify(contextualData, null, 2)}`;
            }

            // Configure the API call based on whether a structured JSON response is expected.
            const config: any = { responseMimeType: responseSchema ? "application/json" : "text/plain" };
            if (responseSchema) {
                config.responseSchema = responseSchema;
            }

            const response = await ai.models.generateContent({
                model: model,
                contents: [{ text: fullPrompt }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 64,
                    maxOutputTokens: 2048,
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                ],
            });

            const textResult = response.text.trim();
            setResult(responseSchema ? JSON.parse(textResult) : textResult);

        } catch (err) {
            console.error(`Error generating ${title}:`, err);
            setError(`Plato AI could not generate this insight: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    }, [title, prompt, transactions, responseSchema, model, contextualData]);

    useEffect(() => {
        if (autoGenerate) {
            generateInsight();
        }
    }, [autoGenerate, generateInsight]);

    return (
        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 h-full flex flex-col">
            <h4 className="font-semibold text-gray-200 text-sm mb-2">{title}</h4>
            <div className="space-y-2 min-h-[5rem] flex-grow flex flex-col justify-center">
                {error && <p className="text-red-400 text-xs text-center p-2">{error}</p>}
                {isLoading && (
                    <div className="flex items-center justify-center space-x-2">
                         <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                         <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                         <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                )}
                {!isLoading && result && children && children(result)}
                {!isLoading && result && !children && <p className="text-gray-300 text-xs p-2 whitespace-pre-wrap">{result}</p>}
                {!isLoading && !result && !error && (
                    <div className="text-center">
                        <button onClick={generateInsight} className="text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors">
                            Ask Plato AI
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * @description Conversational AI interface for interactive queries about finances.
 */
export const PlatoAIChat: React.FC<{ transactions: FlowMatrixTransaction[] }> = ({ transactions }) => {
    const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !process.env.NEXT_PUBLIC_API_KEY) return;

        const userMessage = { sender: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY as string });
            const transactionSummary = transactions.slice(0, 100).map(t =>
                `${t.date} - ${t.description} (${t.category}): ${t.type === 'income' ? '+' : '-'}${t.currency}${t.amount.toFixed(2)}`
            ).join('\n');

            const fullPrompt = `You are Plato, a highly intelligent financial assistant. Answer the user's question concisely based on their transaction data. If you need more context, ask for it. Do not invent information.\n\nUser Question: ${input}\n\nRecent Transactions:\n${transactionSummary}`;

            const response = await ai.models.generateContent({
                model: 'gemini-1.5-pro', // Using a more capable model for chat
                contents: [{ text: fullPrompt }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 1024,
                },
            });

            setMessages(prev => [...prev, { sender: 'ai', text: response.text.trim() }]);
        } catch (error) {
            console.error('Plato AI Chat Error:', error);
            setMessages(prev => [...prev, { sender: 'ai', text: "I'm sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 h-full flex flex-col">
            <h4 className="font-semibold text-gray-200 text-sm mb-2">Plato AI Chat</h4>
            <div className="flex-grow overflow-y-auto space-y-3 p-2 bg-gray-800 rounded-md">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2 rounded-lg text-sm max-w-[80%] ${msg.sender === 'user' ? 'bg-cyan-700 text-white' : 'bg-gray-700 text-gray-200'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="p-2 rounded-lg text-sm bg-gray-700 text-gray-200">
                            Plato is thinking...
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Plato anything about your finances..."
                    className="flex-grow bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1.5 px-3 rounded text-sm transition duration-200"
                    disabled={isLoading || !input.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    );
};


/**
 * @description Component to display and manage AI-generated actionable recommendations.
 */
export const AIRecommendationsPanel: React.FC<{ recommendations: AIRecommendation[] }> = ({ recommendations }) => {
    return (
        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 h-full flex flex-col">
            <h4 className="font-semibold text-gray-200 text-sm mb-2">Plato's Proactive Recommendations</h4>
            <div className="flex-grow overflow-y-auto space-y-3 p-2">
                {recommendations.length === 0 ? (
                    <p className="text-gray-500 text-center text-xs">No new recommendations from Plato AI.</p>
                ) : (
                    recommendations.map(rec => (
                        <div key={rec.id} className="bg-gray-800 border border-gray-700 rounded-md p-3 space-y-1">
                            <h5 className="font-semibold text-cyan-300 text-sm">{rec.title} ({rec.category})</h5>
                            <p className="text-gray-400 text-xs">{rec.description}</p>
                            <ul className="list-disc list-inside text-gray-500 text-xs mt-2">
                                {rec.actionableItems.map((item, idx) => (
                                    <li key={idx}>
                                        {item.actionUrl ? (
                                            <a href={item.actionUrl} className="text-cyan-400 hover:underline">{item.text}</a>
                                        ) : item.text}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-end gap-2 text-xs">
                                {!rec.isDismissed && (
                                    <button className="text-gray-500 hover:text-white">Dismiss</button>
                                )}
                                <span className="text-gray-600">Generated: {new Date(rec.generatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Placeholder for an AI-driven categorization engine that runs in the background
export const AIAutomatedCategorizationEngine = () => {
    // This would be a service or a hook that processes uncategorized transactions
    // and suggests/applies categories based on patterns and descriptions.
    // For this file, it's a conceptual export.
    const runCategorization = (transactions: FlowMatrixTransaction[]) => {
        console.log("AI Categorization Engine running for", transactions.length, "transactions.");
        // Imagine complex AI logic here
    };

    return { runCategorization };
};

// ================================================================================================
// ADVANCED FILTERING & SORTING COMPONENTS
// ================================================================================================

/**
 * @description A multi-select tag filter component.
 */
export const TagFilter: React.FC<{ allTags: string[]; selectedTags: string[]; onTagChange: (tags: string[]) => void }> = ({ allTags, selectedTags, onTagChange }) => {
    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onTagChange(selectedTags.filter(t => t !== tag));
        } else {
            onTagChange([...selectedTags, tag]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-700/30 rounded-lg border border-gray-600/50">
            <span className="text-gray-400 text-sm mr-2">Tags:</span>
            {allTags.map(tag => (
                <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                        selectedTags.includes(tag) ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                >
                    {tag}
                </button>
            ))}
        </div>
    );
};

/**
 * @description Date range selector component.
 */
export const DateRangeFilter: React.FC<{ startDate: string; endDate: string; onDateChange: (start: string, end: string) => void }> = ({ startDate, endDate, onDateChange }) => {
    return (
        <div className="flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg border border-gray-600/50">
            <span className="text-gray-400 text-sm">From:</span>
            <input type="date" value={startDate} onChange={e => onDateChange(e.target.value, endDate)} className="bg-gray-700/50 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
            <span className="text-gray-400 text-sm">To:</span>
            <input type="date" value={endDate} onChange={e => onDateChange(startDate, e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
        </div>
    );
};

/**
 * @description Amount range filter component.
 */
export const AmountRangeFilter: React.FC<{ minAmount: number | ''; maxAmount: number | ''; onAmountChange: (min: number | '', max: number | '') => void }> = ({ minAmount, maxAmount, onAmountChange }) => {
    return (
        <div className="flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg border border-gray-600/50">
            <span className="text-gray-400 text-sm">Min:</span>
            <input type="number" value={minAmount} onChange={e => onAmountChange(e.target.value === '' ? '' : parseFloat(e.target.value), maxAmount)} className="w-24 bg-gray-700/50 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
            <span className="text-gray-400 text-sm">Max:</span>
            <input type="number" value={maxAmount} onChange={e => onAmountChange(minAmount, e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-24 bg-gray-700/50 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
        </div>
    );
};

// ================================================================================================
// REPORTING & VISUALIZATION COMPONENTS
// ================================================================================================

/**
 * @description A highly simplified chart representation component. In a real app, this would be a charting library.
 */
export const TrendAnalysisChart: React.FC<{ data: { label: string; value: number; }[]; title: string }> = ({ data, title }) => {
    // This is a placeholder for a real charting library like Chart.js or D3.
    // It's just a visual representation of the concept.
    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 h-full flex flex-col">
            <h4 className="font-semibold text-gray-200 text-sm mb-2">{title}</h4>
            <div className="flex-grow flex items-end h-32 p-2 bg-gray-800 rounded-md">
                {data.map((item, index) => (
                    <div key={index} className="flex-grow flex flex-col items-center mx-0.5">
                        <div
                            className="bg-cyan-500 w-4 rounded-t-sm"
                            style={{ height: `${(item.value / maxVal) * 100}%`, minHeight: '3px' }}
                            title={`${item.label}: $${item.value.toFixed(2)}`}
                        ></div>
                        <span className="text-gray-500 text-xxs mt-1">{item.label}</span>
                    </div>
                ))}
            </div>
            <p className="text-gray-400 text-xs mt-2 text-center">Data visualization placeholder (e.g., spending trends)</p>
        </div>
    );
};

/**
 * @description Component to display financial goals and their progress.
 */
export const FinancialGoalTracker: React.FC<{ goals: FinancialGoal[] }> = ({ goals }) => {
    return (
        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 h-full flex flex-col">
            <h4 className="font-semibold text-gray-200 text-sm mb-2">Financial Goals</h4>
            <div className="flex-grow overflow-y-auto space-y-3 p-2">
                {goals.length === 0 ? (
                    <p className="text-gray-500 text-center text-xs">No active financial goals. Start setting one!</p>
                ) : (
                    goals.map(goal => (
                        <div key={goal.id} className="bg-gray-800 border border-gray-700 rounded-md p-3 space-y-1">
                            <h5 className="font-semibold text-green-400 text-sm">{goal.name}</h5>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Target: ${goal.targetAmount.toFixed(2)}</span>
                                <span>Current: ${goal.currentAmount.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Progress: {goal.progressPercentage.toFixed(1)}%</p>
                            {goal.aiProjection && (
                                <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs text-gray-400">
                                    <p className="font-semibold">Plato AI Projection:</p>
                                    <p className={goal.aiProjection.isAchievable ? 'text-green-300' : 'text-red-300'}>Status: {goal.aiProjection.isAchievable ? 'Achievable' : 'At Risk'}</p>
                                    <p>Estimated Time: {goal.aiProjection.timeToAchieve}</p>
                                    <ul className="list-disc list-inside mt-1">
                                        {goal.aiProjection.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ================================================================================================
// MAIN TRANSACTIONS VIEW (FlowMatrix - Universe Core)
// ================================================================================================
export const TransactionsView: React.FC = () => {
    const context = useContext(DataContext);
    const [selectedTransaction, setSelectedTransaction] = useState<FlowMatrixTransaction | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterTags, setFilterTags] = useState<string[]>([]);
    const [filterStartDate, setFilterStartDate] = useState<string>('');
    const [filterEndDate, setFilterEndDate] = useState<string>('');
    const [filterMinAmount, setFilterMinAmount] = useState<number | ''>('');
    const [filterMaxAmount, setFilterMaxAmount] = useState<number | ''>('');
    const [sort, setSort] = useState<'date' | 'amount' | 'description' | 'category' | 'riskScore'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage] = useState(20);
    const [selectedTransactionsForBulk, setSelectedTransactionsForBulk] = useState<string[]>([]);

    if (!context) {
        throw new Error("TransactionsView must be within a DataProvider");
    }
    // Assuming DataContext now provides FlowMatrixTransaction[]
    const { transactions: rawTransactions, budgets, goals, addTransaction, updateTransaction, deleteTransaction } = context;

    // Simulate enriching raw transactions to FlowMatrixTransactions (in a real app, this would come from a backend)
    const transactions: FlowMatrixTransaction[] = useMemo(() => {
        return rawTransactions.map(tx => {
            // This is where a real-world system would enrich basic transactions
            // with attachments, AI insights, blockchain details, etc., likely from a database join or AI service.
            // For demonstration, we'll add some mock data and extend existing fields.
            const flowMatrixTx: FlowMatrixTransaction = {
                ...tx,
                currency: tx.currency || 'USD', // Default currency
                exchangeRateToUserBaseCurrency: tx.exchangeRateToUserBaseCurrency || 1.0,
                // Mocking AI insights
                aiInsights: {
                    riskScore: Math.floor(Math.random() * 100),
                    sentiment: Math.random() < 0.2 ? 'negative' : Math.random() < 0.6 ? 'neutral' : 'positive',
                    carbonFootprintCategory: tx.category === 'groceries' ? 'Food & Drink' : tx.category === 'travel' ? 'Transportation' : 'General',
                    predictedFutureTrend: Math.random() < 0.3 ? 'increasing' : Math.random() < 0.6 ? 'decreasing' : 'stable',
                },
                // Mocking tags
                tags: [...new Set(['Personal', tx.category, Math.random() > 0.7 ? 'Urgent' : undefined].filter(Boolean) as string[])],
                // Mocking merchant details
                merchantDetails: {
                    name: tx.description.split(' ')[0], // Simple mock
                    industry: tx.category,
                    logoUrl: `https://via.placeholder.com/20?text=${tx.description[0]}`,
                    aiReputationScore: Math.floor(Math.random() * 10) + 1,
                },
                // Mocking reconciliation status
                isReconciled: Math.random() > 0.5,
                isReviewed: Math.random() > 0.3,
            };

            // Add mock attachments for some transactions
            if (Math.random() > 0.7) {
                flowMatrixTx.attachments = [{
                    id: `att-${tx.id}`,
                    filename: `receipt-${tx.id}.pdf`,
                    url: 'https://example.com/mock-receipt.pdf',
                    mimeType: 'application/pdf',
                    uploadedAt: new Date().toISOString(),
                    aiExtractedText: `AI extracted: Purchase of ${tx.description} for $${tx.amount.toFixed(2)} on ${tx.date}.`
                }];
            }
            // Add mock sub-transactions for some expenses
            if (tx.type === 'expense' && Math.random() > 0.6) {
                flowMatrixTx.subTransactions = [
                    { id: `${tx.id}-sub1`, description: 'Item A', amount: tx.amount * 0.6, category: tx.category },
                    { id: `${tx.id}-sub2`, description: 'Item B', amount: tx.amount * 0.4, category: tx.category },
                ];
            }
            // Add mock blockchain details for some transactions
            if (Math.random() > 0.85) {
                flowMatrixTx.blockchainDetails = {
                    txHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
                    network: Math.random() > 0.5 ? 'Ethereum' : 'Polygon',
                    assetType: 'crypto',
                    walletAddress: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
                };
            }
            // Add mock audit log
            flowMatrixTx.auditLog = [
                { timestamp: new Date(new Date(tx.date).getTime() - 86400000).toISOString(), userId: 'System', action: 'created' },
                { timestamp: new Date().toISOString(), userId: 'User123', action: 'viewed' },
            ];

            return flowMatrixTx;
        });
    }, [rawTransactions]);

    const allCategories = useMemo(() => {
        const categories = new Set<string>();
        transactions.forEach(tx => categories.add(tx.category));
        return ['all', ...Array.from(categories)].sort();
    }, [transactions]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        transactions.forEach(tx => tx.tags?.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [transactions]);

    const filteredAndSortedTransactions = useMemo(() => {
        let currentTransactions = transactions;

        // Apply type filter
        currentTransactions = currentTransactions.filter(tx => filterType === 'all' || tx.type === filterType);

        // Apply category filter
        currentTransactions = currentTransactions.filter(tx => filterCategory === 'all' || tx.category === filterCategory);

        // Apply tag filter
        if (filterTags.length > 0) {
            currentTransactions = currentTransactions.filter(tx => tx.tags && filterTags.every(tag => tx.tags?.includes(tag)));
        }

        // Apply date range filter
        if (filterStartDate) {
            currentTransactions = currentTransactions.filter(tx => new Date(tx.date) >= new Date(filterStartDate));
        }
        if (filterEndDate) {
            currentTransactions = currentTransactions.filter(tx => new Date(tx.date) <= new Date(filterEndDate));
        }

        // Apply amount range filter
        if (filterMinAmount !== '') {
            currentTransactions = currentTransactions.filter(tx => tx.amount >= filterMinAmount);
        }
        if (filterMaxAmount !== '') {
            currentTransactions = currentTransactions.filter(tx => tx.amount <= filterMaxAmount);
        }

        // Apply search term filter
        currentTransactions = currentTransactions.filter(tx =>
            tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.merchantDetails?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Apply sorting
        currentTransactions = currentTransactions.sort((a, b) => {
            let compare = 0;
            if (sort === 'date') {
                compare = new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (sort === 'amount') {
                compare = a.amount - b.amount;
            } else if (sort === 'description') {
                compare = a.description.localeCompare(b.description);
            } else if (sort === 'category') {
                compare = a.category.localeCompare(b.category);
            } else if (sort === 'riskScore' && a.aiInsights?.riskScore !== undefined && b.aiInsights?.riskScore !== undefined) {
                compare = a.aiInsights.riskScore - b.aiInsights.riskScore;
            }

            return sortDirection === 'asc' ? compare : -compare;
        });

        return currentTransactions;
    }, [transactions, filterType, filterCategory, filterTags, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount, searchTerm, sort, sortDirection]);

    // Pagination
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = filteredAndSortedTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
    const totalPages = Math.ceil(filteredAndSortedTransactions.length / transactionsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Bulk actions
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTransactionsForBulk(currentTransactions.map(tx => tx.id));
        } else {
            setSelectedTransactionsForBulk([]);
        }
    };

    const handleSelectTransaction = (txId: string) => {
        setSelectedTransactionsForBulk(prev =>
            prev.includes(txId) ? prev.filter(id => id !== txId) : [...prev, txId]
        );
    };

    const handleBulkTag = (tag: string) => {
        // Implement logic to update transactions in context/backend
        console.log(`Bulk tagging ${selectedTransactionsForBulk.length} transactions with: ${tag}`);
        // Example: updateTransaction(txId, { tags: [...existingTags, tag] })
        setSelectedTransactionsForBulk([]); // Clear selection after action
    };

    const subscriptionSchema = {
        type: Type.OBJECT,
        properties: {
            subscriptions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        estimatedAmount: { type: Type.NUMBER },
                        currency: { type: Type.STRING },
                        lastCharged: { type: Type.STRING },
                        frequency: { type: Type.STRING, enum: ['monthly', 'annually', 'quarterly'] },
                        aiConfidence: { type: Type.NUMBER }
                    },
                    required: ['name', 'estimatedAmount', 'currency', 'lastCharged', 'frequency']
                }
            }
        }
    };

    const fraudDetectionSchema = {
        type: Type.OBJECT,
        properties: {
            fraudulentTransactions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        transactionId: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
                        suggestedAction: { type: Type.STRING }
                    },
                    required: ['transactionId', 'reason', 'severity', 'suggestedAction']
                }
            },
            overallRiskScore: { type: Type.NUMBER }
        }
    };

    const spendingPatternSchema = {
        type: Type.OBJECT,
        properties: {
            keyPatterns: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        averageMonthlySpend: { type: Type.NUMBER },
                        changeVsLastMonth: { type: Type.NUMBER }, // percentage
                        insight: { type: Type.STRING }
                    }
                }
            },
            summary: { type: Type.STRING }
        }
    };

    const investmentOpportunitySchema = {
        type: Type.OBJECT,
        properties: {
            opportunities: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['stock', 'bond', 'crypto', 'real_estate_fund', 'ETF', 'savings_account'] },
                        estimatedReturn: { type: Type.NUMBER }, // annual percentage
                        riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                        reasoning: { type: Type.STRING },
                        actionLink: { type: Type.STRING } // Link to external platform or internal investment module
                    }
                }
            }
        }
    };


    // Mock data for AI recommendations and goals for demonstration
    const mockAIRecommendations: AIRecommendation[] = useMemo(() => [
        {
            id: 'rec1',
            title: 'Optimize Grocery Spending',
            description: 'Your grocery spending increased by 15% last month. Consider exploring cheaper alternatives or meal planning.',
            category: 'budget',
            actionableItems: [{ text: 'View grocery categories', actionUrl: '#'}, {text: 'Create meal plan template', actionUrl: '#'}],
            relevanceScore: 0.8,
            generatedAt: new Date().toISOString(),
        },
        {
            id: 'rec2',
            title: 'High-Interest Savings Account',
            description: 'Based on your liquid cash, Plato recommends moving some funds to a higher-yield savings account.',
            category: 'investment',
            actionableItems: [{ text: 'Compare top savings accounts', actionUrl: 'https://bankrate.com/savings-accounts' }],
            relevanceScore: 0.9,
            generatedAt: new Date().toISOString(),
        },
    ], []); // Empty dependency array as this is mock data

    // Example mock data for goals, assuming they come from DataContext
    const mockGoals: FinancialGoal[] = useMemo(() => goals || [
        {
            id: 'goal1',
            name: 'Emergency Fund',
            targetAmount: 5000,
            currentAmount: 3200,
            startDate: '2023-01-15',
            targetDate: '2024-01-15',
            progressPercentage: (3200 / 5000) * 100,
            linkedCategories: ['savings'],
            aiProjection: {
                isAchievable: true,
                timeToAchieve: "4 months at current pace",
                recommendations: ["Increase monthly savings by $150", "Review discretionary expenses"],
            }
        },
        {
            id: 'goal2',
            name: 'New Car Down Payment',
            targetAmount: 10000,
            currentAmount: 1500,
            startDate: '2023-06-01',
            targetDate: '2024-06-01',
            progressPercentage: (1500 / 10000) * 100,
            linkedCategories: ['auto_savings'],
            aiProjection: {
                isAchievable: false,
                timeToAchieve: "18 months at current pace",
                recommendations: ["Consider a smaller down payment", "Increase income stream"],
            }
        }
    ], [goals]);

    // Handle currency display based on user preference (mocked USD as base currency)
    const formatAmount = useCallback((amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
    }, []);

    return (
        <>
            <div className="space-y-6">
                 <h2 className="text-4xl font-extrabold text-white tracking-wider mb-8 drop-shadow-lg">FlowMatrix: The Universal Transaction Ledger</h2>

                 {/* Plato's Intelligence Suite - Expanded */}
                 <Card title="Plato's Intelligence Suite: Command Center" isCollapsible>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AITransactionWidget
                            title="Subscription Hunter"
                            prompt="Analyze these transactions to find potential recurring subscriptions the user might have forgotten about. Focus on identifying the exact name, estimated recurring amount, last charge date, and frequency. Assume the user's base currency is USD."
                            transactions={transactions}
                            responseSchema={subscriptionSchema}
                            model="gemini-1.5-pro"
                        >
                           {(result: { subscriptions: DetectedSubscription[] }) => (
                                <ul className="text-xs text-gray-300 space-y-1 p-2 max-h-32 overflow-y-auto">
                                    {result.subscriptions.length > 0 ? result.subscriptions.map(sub => <li key={sub.name}>- {sub.name} (~{sub.currency}{sub.estimatedAmount.toFixed(2)} {sub.frequency})</li>) : <li>No potential subscriptions found.</li>}
                                </ul>
                           )}
                        </AITransactionWidget>
                        <AITransactionWidget
                            title="Anomaly & Fraud Detection"
                            prompt="Scan these transactions for unusual patterns, amounts, or merchant activity that could indicate an anomaly or potential fraud. Provide transaction IDs, reasons, severity, and suggested actions (e.g., 'flag for review', 'contact bank')."
                            transactions={transactions}
                            responseSchema={fraudDetectionSchema}
                            model="gemini-1.5-pro"
                        >
                            {(result: { fraudulentTransactions: any[], overallRiskScore: number }) => (
                                <div className="text-xs text-gray-300 space-y-1 p-2 max-h-32 overflow-y-auto">
                                    {result.fraudulentTransactions.length > 0 ? (
                                        <>
                                            <p className="font-semibold">Overall Risk Score: <span className={result.overallRiskScore > 50 ? 'text-red-400' : 'text-yellow-400'}>{result.overallRiskScore}%</span></p>
                                            <ul className="list-disc list-inside">
                                                {result.fraudulentTransactions.map(item => (
                                                    <li key={item.transactionId}>
                                                        Tx <span className="font-mono text-cyan-300 text-xxs">{item.transactionId.substring(0,6)}...</span> - {item.reason} ({item.severity}). Action: {item.suggestedAction}
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : <li>No significant anomalies detected.</li>}
                                </div>
                            )}
                        </AITransactionWidget>
                        <AITransactionWidget
                            title="Spending Pattern Analysis"
                            prompt="Summarize the user's key spending patterns across categories. For each category, provide average monthly spend, percentage change from the previous month, and a brief insight or observation. Assume average month is 30 days."
                            transactions={transactions}
                            responseSchema={spendingPatternSchema}
                            model="gemini-1.5-pro"
                            contextualData={{ currentTime: new Date().toISOString() }}
                        >
                            {(result: { keyPatterns: any[], summary: string }) => (
                                <div className="text-xs text-gray-300 space-y-1 p-2 max-h-32 overflow-y-auto">
                                    <p className="italic text-gray-400">{result.summary}</p>
                                    <ul className="list-disc list-inside mt-2">
                                        {result.keyPatterns.map((pattern, idx) => (
                                            <li key={idx}>
                                                {pattern.category}: ${pattern.averageMonthlySpend.toFixed(2)}/month ({pattern.changeVsLastMonth > 0 ? '+' : ''}{pattern.changeVsLastMonth.toFixed(1)}%). {pattern.insight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </AITransactionWidget>
                        <AITransactionWidget
                            title="Investment Opportunity Scanner"
                            prompt="Based on the user's income, expenses, and current saving habits, identify potential low-risk investment opportunities. Suggest concrete investment types (e.g., specific ETFs, high-yield savings, diversified bonds) along with estimated annual returns, risk level, and a brief reasoning. Assume a conservative investment profile."
                            transactions={transactions}
                            responseSchema={investmentOpportunitySchema}
                            model="gemini-1.5-pro"
                            contextualData={{ currentSavingsBalance: '5000', netIncomeLastMonth: '3000' }} // Mock contextual data
                        >
                            {(result: { opportunities: any[] }) => (
                                <div className="text-xs text-gray-300 space-y-1 p-2 max-h-32 overflow-y-auto">
                                    {result.opportunities.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {result.opportunities.map((opp, idx) => (
                                                <li key={idx}>
                                                    <a href={opp.actionLink} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{opp.name} ({opp.type})</a>: Est. {opp.estimatedReturn.toFixed(1)}% return, Risk: {opp.riskLevel}. {opp.reasoning}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <li>No specific investment opportunities detected right now.</li>}
                                </div>
                            )}
                        </AITransactionWidget>
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        <PlatoAIChat transactions={transactions} />
                        <AIRecommendationsPanel recommendations={mockAIRecommendations} />
                     </div>
                </Card>

                {/* FlowMatrix Controls & Filters */}
                <Card title="FlowMatrix Controls">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 flex-wrap">
                        <input
                            type="text"
                            placeholder="Search descriptions, categories, merchants, tags..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full md:w-1/3 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                        <div className="flex items-center gap-4 flex-wrap">
                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value as any)}
                                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                            <select
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {allCategories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                             <select
                                value={sort}
                                onChange={e => setSort(e.target.value as any)}
                                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                <option value="date">Sort by Date</option>
                                <option value="amount">Sort by Amount</option>
                                <option value="description">Sort by Description</option>
                                <option value="category">Sort by Category</option>
                                <option value="riskScore">Sort by AI Risk Score</option>
                            </select>
                            <button
                                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {sortDirection === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4">
                        <TagFilter allTags={allTags} selectedTags={filterTags} onTagChange={setFilterTags} />
                        <DateRangeFilter startDate={filterStartDate} endDate={filterEndDate} onDateChange={(start, end) => { setFilterStartDate(start); setFilterEndDate(end); }} />
                        <AmountRangeFilter minAmount={filterMinAmount} maxAmount={filterMaxAmount} onAmountChange={(min, max) => { setFilterMinAmount(min); setFilterMaxAmount(max); }} />
                    </div>
                    {selectedTransactionsForBulk.length > 0 && (
                        <div className="mt-4 p-3 bg-cyan-900/30 border border-cyan-700 rounded-lg flex items-center gap-4">
                            <span className="text-white text-sm">{selectedTransactionsForBulk.length} transactions selected.</span>
                            <button onClick={() => handleBulkTag('Reviewed')} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1 rounded">Mark as Reviewed</button>
                            <button onClick={() => handleBulkTag('Flagged')} className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded">Add 'Flagged' Tag</button>
                            <button onClick={() => { /* bulk export logic */ }} className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded">Export Selected</button>
                            <button onClick={() => setSelectedTransactionsForBulk([])} className="text-gray-400 hover:text-white text-xs ml-auto">Clear Selection</button>
                        </div>
                    )}
                </Card>

                {/* FlowMatrix Transaction Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                             <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <input type="checkbox" onChange={handleSelectAll} checked={selectedTransactionsForBulk.length === currentTransactions.length && currentTransactions.length > 0} className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500" />
                                    </th>
                                    <th scope="col" className="px-6 py-3">Description</th>
                                    <th scope="col" className="px-6 py-3">Category</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Tags</th>
                                    <th scope="col" className="px-6 py-3">AI Risk</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount ({transactions.length > 0 ? transactions[0].currency : 'USD'})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No transactions match your criteria.</td>
                                    </tr>
                                ) : (
                                    currentTransactions.map(tx => (
                                        <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                                            <td className="w-4 p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTransactionsForBulk.includes(tx.id)}
                                                    onChange={() => handleSelectTransaction(tx.id)}
                                                    onClick={e => e.stopPropagation()} // Prevent modal from opening
                                                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                                />
                                            </td>
                                            <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap" onClick={() => setSelectedTransaction(tx)}>
                                                {tx.description}
                                                {tx.attachments && tx.attachments.length > 0 && <span className="ml-2 text-cyan-500 text-xs">(📄)</span>}
                                                {tx.blockchainDetails && <span className="ml-1 text-purple-500 text-xs">(⛓️)</span>}
                                            </th>
                                            <td className="px-6 py-4" onClick={() => setSelectedTransaction(tx)}>{tx.category}</td>
                                            <td className="px-6 py-4" onClick={() => setSelectedTransaction(tx)}>{tx.date}</td>
                                            <td className="px-6 py-4" onClick={() => setSelectedTransaction(tx)}>
                                                {tx.tags && tx.tags.map((tag, idx) => <span key={idx} className="inline-block bg-gray-700 text-cyan-300 text-xxs px-2 py-0.5 rounded-full mr-1">{tag}</span>)}
                                            </td>
                                            <td className="px-6 py-4" onClick={() => setSelectedTransaction(tx)}>
                                                {tx.aiInsights?.riskScore !== undefined ? (
                                                    <span className={`font-mono text-xs ${tx.aiInsights.riskScore > 70 ? 'text-red-400' : tx.aiInsights.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                        {tx.aiInsights.riskScore}%
                                                    </span>
                                                ) : <span className="text-gray-500 text-xs">N/A</span>}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-mono ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`} onClick={() => setSelectedTransaction(tx)}>
                                                {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount, tx.currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`px-3 py-1 rounded-lg ${currentPage === number ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                >
                                    {number}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </Card>

                {/* Reporting & Analytics Section */}
                <Card title="FlowMatrix Analytics & Reporting" isCollapsible>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <TrendAnalysisChart
                            title="Monthly Spending Trends (Last 6 Months)"
                            data={[
                                { label: 'Jan', value: 1200 }, { label: 'Feb', value: 1500 }, { label: 'Mar', value: 1350 },
                                { label: 'Apr', value: 1600 }, { label: 'May', value: 1450 }, { label: 'Jun', value: 1700 }
                            ]}
                        />
                         <TrendAnalysisChart
                            title="Income vs. Expense (Last 6 Months)"
                            data={[
                                { label: 'Jan', value: 2000 }, { label: 'Feb', value: 2200 }, { label: 'Mar', value: 1900 },
                                { label: 'Apr', value: 2100 }, { label: 'May', value: 2300 }, { label: 'Jun', value: 2050 }
                            ]} // In a real app, this would be net or separate bars
                        />
                        <FinancialGoalTracker goals={mockGoals} />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">Generate Custom Report</button>
                        <button className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded text-sm">Export All to CSV</button>
                    </div>
                </Card>

                {/* Simulated External Integration Block (Conceptual Expansion) */}
                <Card title="FlowMatrix Ecosystem Integrations" isCollapsible>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
                            <h4 className="font-semibold text-gray-200 text-sm mb-2">Blockchain Wallet Sync</h4>
                            <p className="text-gray-400 text-xs">Connect your decentralized wallets to automatically track crypto and NFT transactions.</p>
                            <button className="mt-3 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded">Connect Wallet</button>
                        </div>
                        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
                            <h4 className="font-semibold text-gray-200 text-sm mb-2">Open Banking API Hub</h4>
                            <p className="text-gray-400 text-xs">Securely link to other financial institutions for a consolidated view.</p>
                            <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded">Manage Connections</button>
                        </div>
                        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
                            <h4 className="font-semibold text-gray-200 text-sm mb-2">Carbon Offset Program</h4>
                            <p className="text-gray-400 text-xs">Automatically calculate and offset your transaction-based carbon footprint.</p>
                            <button className="mt-3 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded">View Programs</button>
                        </div>
                    </div>
                </Card>

            </div>
            <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
        </>
    );
};

export default TransactionsView;