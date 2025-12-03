import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// --- MOCK DATA AND TYPE DEFINITIONS (START) ---
/**
 * @typedef {object} Transaction
 * @property {string} hash - Unique transaction hash.
 * @property {string} from - Sender address.
 * @property {string} to - Receiver or contract address.
 * @property {string} value - Value transferred (in ETH/token, string for large numbers).
 * @property {string} tokenSymbol - Symbol of the token if it's a token transfer.
 * @property {number} gasUsed - Gas consumed by the transaction.
 * @property {string} gasPrice - Gas price (wei, string).
 * @property {number} timestamp - Unix timestamp of the block.
 * @property {string} status - 'success' | 'failed' | 'pending'.
 * @property {string} type - 'transfer' | 'contract_call' | 'swap' | 'mint' | 'burn'.
 * @property {string} blockNumber - Block number.
 * @property {string} [contractAddress] - Contract address if applicable.
 * @property {string} [method] - Method called for contract interactions.
 * @property {string} fee - Calculated transaction fee in ETH.
 */
export interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    tokenSymbol?: string;
    gasUsed: number;
    gasPrice: string;
    timestamp: number;
    status: 'success' | 'failed' | 'pending';
    type: 'transfer' | 'contract_call' | 'swap' | 'mint' | 'burn';
    blockNumber: string;
    contractAddress?: string;
    method?: string;
    fee: string;
}

/**
 * @typedef {object} TokenBalance
 * @property {string} symbol - Token symbol (e.g., ETH, USDC).
 * @property {string} name - Full token name.
 * @property {string} address - Contract address of the token.
 * @property {string} balance - Raw balance (string, for precision).
 * @property {number} decimals - Number of decimals for the token.
 * @property {number} valueUsd - Current USD value of the balance.
 * @property {number} priceUsd - Current price per token in USD.
 * @property {string} [logoUrl] - URL for the token logo.
 */
export interface TokenBalance {
    symbol: string;
    name: string;
    address: string;
    balance: string;
    decimals: number;
    valueUsd: number;
    priceUsd: number;
    logoUrl?: string;
}

/**
 * @typedef {object} WalletActivity
 * @property {string} address - Wallet address.
 * @property {TokenBalance[]} balances - Array of token balances.
 * @property {Transaction[]} recentTransactions - Array of recent transactions.
 * @property {string} totalValueUsd - Total USD value of the wallet.
 * @property {number} transactionCount - Total number of transactions.
 * @property {number} firstSeenTimestamp - Timestamp when wallet first had activity.
 */
export interface WalletActivity {
    address: string;
    balances: TokenBalance[];
    recentTransactions: Transaction[];
    totalValueUsd: string;
    transactionCount: number;
    firstSeenTimestamp: number;
}

/**
 * @typedef {object} DeFiProtocol
 * @property {string} name - Name of the protocol (e.g., Uniswap, Aave).
 * @property {string} category - e.g., 'DEX', 'Lending'.
 * @property {string} address - Main contract address or identifier.
 * @property {number} tvlUsd - Total Value Locked in USD.
 * @property {number} volume24hUsd - 24-hour trading/lending volume in USD.
 * @property {string} [logoUrl] - URL for the protocol logo.
 * @property {string} description - Brief description.
 */
export interface DeFiProtocol {
    name: string;
    category: 'DEX' | 'Lending' | 'Borrowing' | 'Staking' | 'Yield Farming';
    address: string;
    tvlUsd: number;
    volume24hUsd: number;
    logoUrl?: string;
    description: string;
}

/**
 * @typedef {object} NFTCollection
 * @property {string} name - Collection name.
 * @property {string} contractAddress - Contract address.
 * @property {number} floorPriceEth - Current floor price in ETH.
 * @property {number} floorPriceUsd - Current floor price in USD.
 * @property {number} volume24hEth - 24-hour volume in ETH.
 * @property {number} volume24hUsd - 24-hour volume in USD.
 * @property {number} totalVolumeEth - Total volume in ETH.
 * @property {number} uniqueHolders - Number of unique holders.
 * @property {string} [imageUrl] - Collection image URL.
 */
export interface NFTCollection {
    name: string;
    contractAddress: string;
    floorPriceEth: number;
    floorPriceUsd: number;
    volume24hEth: number;
    volume24hUsd: number;
    totalVolumeEth: number;
    uniqueHolders: number;
    imageUrl?: string;
}

/**
 * @typedef {object} GasPriceInfo
 * @property {number} standardGwei - Standard gas price in Gwei.
 * @property {number} fastGwei - Fast gas price in Gwei.
 * @property {number} rapidGwei - Rapid gas price in Gwei.
 * @property {number} baseFeeGwei - Current base fee in Gwei.
 * @property {number} priorityFeeGwei - Recommended priority fee in Gwei.
 * @property {number} lastBlock - Block number for this info.
 */
export interface GasPriceInfo {
    standardGwei: number;
    fastGwei: number;
    rapidGwei: number;
    baseFeeGwei: number;
    priorityFeeGwei: number;
    lastBlock: number;
}

/**
 * @typedef {object} ChartDataPoint
 * @property {number} timestamp - Unix timestamp.
 * @property {number} value - Numeric value for the chart.
 */
export interface ChartDataPoint {
    timestamp: number;
    value: number;
}

/**
 * @typedef {object} ProtocolOverview
 * @property {string} name
 * @property {number} tvl
 * @property {number} volume24h
 * @property {string} category
 * @property {string} logo
 */
export interface ProtocolOverview {
    name: string;
    tvl: number;
    volume24h: number;
    category: string;
    logo: string;
}


// --- UTILITY FUNCTIONS ---
/**
 * Shortens an Ethereum address for display.
 * @param {string} address - The full Ethereum address.
 * @param {number} [chars=4] - Number of characters to show at start/end.
 * @returns {string} The shortened address (e.g., "0xabc...xyz").
 */
export const shortenAddress = (address: string, chars = 4): string => {
    if (!address) return '';
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};

/**
 * Formats a large number as currency.
 * @param {number} value - The numeric value.
 * @param {string} [currency='$'] - The currency symbol (e.g., "$", "Ξ").
 * @param {number} [decimals=2] - Number of decimal places.
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (value: number, currency: string = '$', decimals: number = 2): string => {
    if (value === null || value === undefined || isNaN(value)) return `${currency}0.00`;
    return `${currency}${value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

/**
 * Formats a number for display.
 * @param {number} value - The numeric value.
 * @param {number} [decimals=2] - Number of decimal places.
 * @returns {string} Formatted number string.
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
    if (value === null || value === undefined || isNaN(value)) return '0.00';
    return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

/**
 * Converts a Unix timestamp to a human-readable date string.
 * @param {number} timestamp - Unix timestamp.
 * @returns {string} Formatted date string.
 */
export const formatDate = (timestamp: number): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
};

/**
 * Calculates time ago from a Unix timestamp.
 * @param {number} timestamp - Unix timestamp.
 * @returns {string} Time ago string (e.g., "5 minutes ago").
 */
export const timeAgo = (timestamp: number): string => {
    if (!timestamp) return 'N/A';
    const seconds = Math.floor((new Date().getTime() - timestamp * 1000) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

/**
 * Converts wei to ETH.
 * @param {string} wei - Value in wei.
 * @returns {number} Value in ETH.
 */
export const weiToEth = (wei: string): number => {
    if (!wei) return 0;
    try {
        return parseFloat(BigInt(wei).toString()) / 1e18;
    } catch {
        return 0; // Handle invalid BigInt strings
    }
};

/**
 * Converts Gwei to ETH.
 * @param {number} gwei - Value in Gwei.
 * @returns {number} Value in ETH.
 */
export const gweiToEth = (gwei: number): number => {
    return gwei / 1e9;
};

/**
 * Calculate transaction fee in ETH.
 * @param {number} gasUsed - Gas consumed.
 * @param {string} gasPrice - Gas price in wei.
 * @returns {string} Fee in ETH (formatted).
 */
export const calculateFeeEth = (gasUsed: number, gasPrice: string): string => {
    if (!gasUsed || !gasPrice) return '0';
    try {
        const feeWei = BigInt(gasUsed) * BigInt(gasPrice);
        return weiToEth(feeWei.toString()).toFixed(6);
    } catch {
        return '0';
    }
};


// --- MOCK API FUNCTIONS (SIMULATED BACKEND INTERACTION) ---
/**
 * Simulates fetching global blockchain metrics.
 */
export const fetchGlobalMetrics = async (): Promise<{
    totalVolume24hUsd: number;
    totalTransactions24h: number;
    activeWallets24h: number;
    averageGasPriceGwei: number;
    ethPriceUsd: number;
}> => {
    return new Promise(resolve => setTimeout(() => resolve({
        totalVolume24hUsd: Math.random() * 10_000_000_000 + 500_000_000,
        totalTransactions24h: Math.floor(Math.random() * 2_000_000 + 500_000),
        activeWallets24h: Math.floor(Math.random() * 500_000 + 100_000),
        averageGasPriceGwei: Math.random() * 50 + 10,
        ethPriceUsd: Math.random() * 1000 + 1500, // Simulate ETH price around $1500-$2500
    }), 800 + Math.random() * 400));
};

/**
 * Simulates fetching recent transactions.
 * @param {number} [count=10] - Number of transactions to fetch.
 */
export const fetchRecentTransactions = async (count: number = 10): Promise<Transaction[]> => {
    const transactions: Transaction[] = [];
    const now = Math.floor(Date.now() / 1000);
    const ethPrice = (await fetchGlobalMetrics()).ethPriceUsd; // Ensure ethPrice is fetched.

    for (let i = 0; i < count; i++) {
        const valueEth = Math.random() * 10 + 0.1;
        const gasUsed = Math.floor(Math.random() * 200000 + 21000);
        const gasPriceGwei = Math.random() * 50 + 10;
        const gasPriceWei = (gasPriceGwei * 1e9).toFixed(0);
        const timestamp = now - Math.floor(Math.random() * 3600 * 24 * 7); // Last 7 days
        const typeOptions = ['transfer', 'contract_call', 'swap', 'mint', 'burn'];
        const selectedType = typeOptions[Math.floor(Math.random() * typeOptions.length)];

        transactions.push({
            hash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            from: `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            to: `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            value: (valueEth * 1e18).toFixed(0),
            tokenSymbol: Math.random() > 0.5 ? 'ETH' : (Math.random() > 0.5 ? 'USDC' : 'DAI'),
            gasUsed: gasUsed,
            gasPrice: gasPriceWei,
            timestamp: timestamp,
            status: Math.random() > 0.1 ? 'success' : 'failed',
            type: selectedType,
            blockNumber: (Math.floor(Math.random() * 1000000) + 18000000).toString(),
            contractAddress: selectedType !== 'transfer' ? `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` : undefined,
            method: selectedType === 'contract_call' ? (Math.random() > 0.5 ? 'swapExactETHForTokens' : 'transferFrom') : undefined,
            fee: calculateFeeEth(gasUsed, gasPriceWei),
        });
    }
    return new Promise(resolve => setTimeout(() => resolve(transactions), 1000 + Math.random() * 500));
};

/**
 * Simulates fetching top tokens by market cap/volume.
 * @param {number} [count=10] - Number of tokens to fetch.
 */
export const fetchTopTokens = async (count: number = 10): Promise<TokenBalance[]> => {
    const tokenList = [
        { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18, logoUrl: '/logos/eth.png' },
        { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, logoUrl: '/logos/usdc.png' },
        { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, logoUrl: '/logos/usdt.png' },
        { symbol: 'BNB', name: 'Binance Coin', address: '0xB8c77482e45F1F44dE1745F52C67B5B7D7c4f74B', decimals: 18, logoUrl: '/logos/bnb.png' },
        { symbol: 'SOL', name: 'Solana', address: '0xd31a59c85ae9d8edec1e70ef6091ee40a029d3cf', decimals: 9, logoUrl: '/logos/sol.png' },
        { symbol: 'XRP', name: 'XRP', address: '0x1D2F0aF783B0Ea591eF66986FfC35E2F68A48c08', decimals: 6, logoUrl: '/logos/xrp.png' },
        { symbol: 'ADA', name: 'Cardano', address: '0x3ee2200efb3400fabb9aace3bc3996230f3073d4', decimals: 6, logoUrl: '/logos/ada.png' },
        { symbol: 'DOGE', name: 'Dogecoin', address: '0x7466EaC25b1E51b689a94C56a908C6856C9542B7', decimals: 8, logoUrl: '/logos/doge.png' },
        { symbol: 'TRX', name: 'TRON', address: '0xf230b790E053903415fdC4aEAA533E97f6D66E61', decimals: 6, logoUrl: '/logos/trx.png' },
        { symbol: 'LINK', name: 'Chainlink', address: '0x514910771af9ca656af8407ff8582ae2ea2f7d28', decimals: 18, logoUrl: '/logos/link.png' },
        { symbol: 'AVAX', name: 'Avalanche', address: '0x6eF95b211B56F42C1a5d62512Ff5E724F534241a', decimals: 18, logoUrl: '/logos/avax.png' },
    ];
    const ethPrice = (await fetchGlobalMetrics()).ethPriceUsd;

    return new Promise(resolve => setTimeout(() => {
        const tokens = tokenList.slice(0, count).map(token => {
            let priceUsd;
            if (token.symbol === 'ETH') priceUsd = ethPrice;
            else if (token.symbol === 'USDC' || token.symbol === 'USDT') priceUsd = 1.0;
            else priceUsd = Math.random() * 100 + 0.1;
            
            const balanceValue = Math.random() * 100000000 + 1000000;
            const balanceRaw = (balanceValue / priceUsd).toFixed(token.decimals);

            return {
                ...token,
                balance: balanceRaw,
                valueUsd: balanceValue,
                priceUsd: priceUsd,
            };
        });
        resolve(tokens);
    }, 900 + Math.random() * 400));
};

/**
 * Simulates fetching DeFi protocol data.
 * @param {number} [count=5] - Number of protocols to fetch.
 */
export const fetchDeFiProtocols = async (count: number = 5): Promise<DeFiProtocol[]> => {
    const protocolList = [
        { name: 'Uniswap V3', category: 'DEX', address: '0x1F98431c8aD98523631AE4a59f267346aFd3bF1a', description: 'Leading decentralized exchange.' },
        { name: 'Aave V3', category: 'Lending', address: '0x7d2768dE32b0b80b07a761e1edE2bCd7Daa87Ddf', description: 'Decentralized lending and borrowing protocol.' },
        { name: 'Compound', category: 'Lending', address: '0x3d9819210A31b4961b30EF54bE2aeD79DcbE76C2', description: 'Algorithmic money market protocol.' },
        { name: 'Curve Finance', category: 'DEX', address: '0xD533a949740bb3306d119Ebbd726Aef1B1b0Cf9C', description: 'Exchange for stablecoins and pegged assets.' },
        { name: 'MakerDAO', category: 'Lending', address: '0x9f8F72aa9304c8B593d555F12eF6589cC3A579A2', description: 'Creator of the DAI stablecoin.' },
        { name: 'Lido', category: 'Staking', address: '0x5A98FcE30Ad1C88FbB96f86644f568b2e50570b5', description: 'Liquid staking for ETH 2.0.' },
    ];
    return new Promise(resolve => setTimeout(() => {
        const protocols = protocolList.slice(0, count).map(protocol => ({
            ...protocol,
            tvlUsd: Math.random() * 10_000_000_000 + 100_000_000,
            volume24hUsd: Math.random() * 1_000_000_000 + 10_000_000,
            logoUrl: `/logos/${protocol.name.toLowerCase().replace(/\s/g, '-')}.png`,
        }));
        resolve(protocols);
    }, 700 + Math.random() * 300));
};

/**
 * Simulates fetching NFT collection data.
 * @param {number} [count=5] - Number of collections to fetch.
 */
export const fetchNFTCollections = async (count: number = 5): Promise<NFTCollection[]> => {
    const collectionsList = [
        { name: 'Bored Ape Yacht Club', contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a93fE1Ad', imageUrl: '/logos/bayc.png' },
        { name: 'CryptoPunks', contractAddress: '0xb47e3cd837dDF8e4c57F05d70ab865de6e193bbb', imageUrl: '/logos/cryptopunks.png' },
        { name: 'Mutant Ape Yacht Club', contractAddress: '0x60E4d786628Fea6478F785A6d7ce6Fb0EEb5Feac', imageUrl: '/logos/mayc.png' },
        { name: 'Azuki', contractAddress: '0xED5AF388653567Af2F388E6224dCDfC4b0455F2A', imageUrl: '/logos/azuki.png' },
        { name: 'DeGods', contractAddress: '0x8821Be2e5390772C50811e582b130a0F284B903E', imageUrl: '/logos/degods.png' },
    ];
    const ethPrice = (await fetchGlobalMetrics()).ethPriceUsd;

    return new Promise(resolve => setTimeout(() => {
        const collections = collectionsList.slice(0, count).map(collection => {
            const floorEth = Math.random() * 50 + 5;
            const volume24hEth = Math.random() * 1000 + 100;
            const totalVolumeEth = Math.random() * 1000000 + 10000;
            return {
                ...collection,
                floorPriceEth: floorEth,
                floorPriceUsd: floorEth * ethPrice,
                volume24hEth: volume24hEth,
                volume24hUsd: volume24hEth * ethPrice,
                totalVolumeEth: totalVolumeEth,
                uniqueHolders: Math.floor(Math.random() * 10000 + 1000),
            };
        });
        resolve(collections);
    }, 1100 + Math.random() * 500));
};

/**
 * Simulates fetching historical chart data.
 * @param {string} type - Type of data ('ethPrice', 'gas', 'totalTx').
 * @param {'7d' | '30d' | '90d' | '1y'} duration - Duration of the chart data.
 */
export const fetchChartData = async (type: string, duration: '7d' | '30d' | '90d' | '1y'): Promise<ChartDataPoint[]> => {
    return new Promise(resolve => setTimeout(() => {
        const data: ChartDataPoint[] = [];
        const now = Math.floor(Date.now() / 1000);
        let numPoints = 0;
        let interval = 0; // seconds

        switch (duration) {
            case '7d': numPoints = 7 * 24; interval = 3600; break; // hourly
            case '30d': numPoints = 30; interval = 86400; break; // daily
            case '90d': numPoints = 90; interval = 86400; break; // daily
            case '1y': numPoints = 365; interval = 86400; break; // daily
        }

        let baseValue = type === 'gas' ? 30 : (type === 'ethPrice' ? 2000 : 1000000);
        let volatility = type === 'gas' ? 5 : (type === 'ethPrice' ? 100 : 100000);

        for (let i = 0; i < numPoints; i++) {
            const timestamp = now - (numPoints - i) * interval;
            const value = baseValue + (Math.random() - 0.5) * volatility * 2;
            data.push({ timestamp, value: Math.max(0, value) }); // Ensure value is not negative
        }
        resolve(data);
    }, 600 + Math.random() * 300));
};

/**
 * Simulates fetching detailed wallet activity.
 * @param {string} address - Wallet address.
 */
export const fetchWalletActivity = async (address: string): Promise<WalletActivity> => {
    const ethPrice = (await fetchGlobalMetrics()).ethPriceUsd;
    const now = Math.floor(Date.now() / 1000);

    const balances: TokenBalance[] = [
        {
            symbol: 'ETH', name: 'Ethereum', address: '0x0', decimals: 18,
            balance: (Math.random() * 5 + 0.1).toFixed(18),
            priceUsd: ethPrice,
            valueUsd: (Math.random() * 5 + 0.1) * ethPrice,
            logoUrl: '/logos/eth.png'
        },
        {
            symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6,
            balance: (Math.random() * 5000 + 100).toFixed(6),
            priceUsd: 1.0,
            valueUsd: (Math.random() * 5000 + 100) * 1.0,
            logoUrl: '/logos/usdc.png'
        },
        {
            symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18,
            balance: (Math.random() * 2000 + 50).toFixed(18),
            priceUsd: 1.0,
            valueUsd: (Math.random() * 2000 + 50) * 1.0,
            logoUrl: '/logos/dai.png'
        },
    ];

    const recentTransactions = await fetchRecentTransactions(20);
    const totalValueUsd = balances.reduce((sum, b) => sum + b.valueUsd, 0).toFixed(2);

    return new Promise(resolve => setTimeout(() => resolve({
        address: address,
        balances: balances,
        recentTransactions: recentTransactions,
        totalValueUsd: totalValueUsd,
        transactionCount: Math.floor(Math.random() * 5000 + 100),
        firstSeenTimestamp: now - Math.floor(Math.random() * 365 * 24 * 3600), // Up to 1 year ago
    }), 1500 + Math.random() * 500));
};

/**
 * Simulates fetching current gas prices.
 */
export const fetchGasPriceInfo = async (): Promise<GasPriceInfo> => {
    return new Promise(resolve => setTimeout(() => resolve({
        standardGwei: Math.floor(Math.random() * 10) + 20,
        fastGwei: Math.floor(Math.random() * 10) + 30,
        rapidGwei: Math.floor(Math.random() * 10) + 40,
        baseFeeGwei: Math.floor(Math.random() * 5) + 15,
        priorityFeeGwei: Math.floor(Math.random() * 2) + 1,
        lastBlock: Math.floor(Math.random() * 100) + 18000000,
    }), 500 + Math.random() * 200));
};


// --- AI INTERACTION MODULES ---
/**
 * @typedef {object} WalletAnalysisResult
 * @property {string} summary - General overview of wallet activity.
 * @property {string[]} topTokens - List of top held tokens.
 * @property {string[]} topProtocols - List of top interacted DeFi protocols.
 * @property {string} riskScoreExplanation - Explanation of a hypothetical risk score.
 * @property {string[]} potentialAnomalies - List of detected anomalies.
 */
export interface WalletAnalysisResult {
    summary: string;
    topTokens: string[];
    topProtocols: string[];
    riskScoreExplanation: string;
    potentialAnomalies: string[];
}

/**
 * AI service to analyze a wallet's activity and holdings.
 * @param {string} address - Wallet address to analyze.
 * @param {WalletActivity} activityData - The fetched wallet activity data.
 */
export const analyzeWalletWithAI = async (address: string, activityData: WalletActivity): Promise<WalletAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `Analyze the Ethereum wallet "${address}" based on its recent activity:
    Total Value: ${activityData.totalValueUsd} USD
    Number of Transactions: ${activityData.transactionCount}
    Balances: ${activityData.balances.map(b => `${formatNumber(weiToEth(b.balance), 4)} ${b.symbol}`).join(', ')}
    Recent Transactions types: ${activityData.recentTransactions.map(tx => tx.type).join(', ')}.
    Provide a concise summary, identify top tokens and protocols, explain a hypothetical risk score, and list potential anomalies.`;

    console.log("AI Wallet Analysis Prompt:", prompt);
    
    return new Promise(resolve => setTimeout(() => {
        const mockSummary = `This wallet appears to be moderately active, holding a diversified portfolio of stablecoins and ETH. It engages in regular transfers and some DeFi interactions.`;
        const mockTopTokens = activityData.balances.filter(b => b.valueUsd > 100).sort((a,b) => b.valueUsd - a.valueUsd).map(b => b.name);
        const mockTopProtocols = ['Uniswap', 'Aave', 'OpenSea'];
        const mockRiskExplanation = `Risk score of 3/10: Low risk due to stablecoin dominance and no apparent interaction with high-risk smart contracts. Some exposure to volatile assets (ETH).`;
        const mockAnomalies: string[] = Math.random() > 0.7 ? [`Unusual large outgoing transfer of ${formatCurrency(Math.random()*1000+500, '$')} USDC detected on ${formatDate(activityData.recentTransactions[0]?.timestamp || Date.now()/1000)}.`] : [];

        resolve({
            summary: mockSummary,
            topTokens: mockTopTokens,
            topProtocols: mockTopProtocols,
            riskScoreExplanation: mockRiskExplanation,
            potentialAnomalies: mockAnomalies,
        });
    }, 2000 + Math.random() * 1000));
};

/**
 * @typedef {object} SmartContractAnalysisResult
 * @property {string} purpose - AI-generated description of the contract's main purpose.
 * @property {string[]} keyFunctions - List of important functions.
 * @property {string} securityInsights - AI-driven security review summary.
 * @property {string[]} knownVulnerabilities - Any known issues.
 * @property {string} commonInteractions - How users typically interact.
 */
export interface SmartContractAnalysisResult {
    purpose: string;
    keyFunctions: string[];
    securityInsights: string;
    knownVulnerabilities: string[];
    commonInteractions: string;
}

/**
 * AI service to analyze a smart contract.
 * @param {string} contractAddress - Address of the smart contract.
 * @param {string} abi - Contract ABI (simulated).
 */
export const analyzeSmartContractWithAI = async (contractAddress: string, abi: string): Promise<SmartContractAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `Analyze the Ethereum smart contract "${contractAddress}" with the following (simulated) ABI snippet: ${abi.substring(0, 200)}...
    Explain its main purpose, list key functions, provide security insights, known vulnerabilities (if any), and common user interactions.`;

    console.log("AI Contract Analysis Prompt:", prompt);

    return new Promise(resolve => setTimeout(() => {
        const mockPurpose = `This contract appears to be a token exchange contract, likely part of a decentralized exchange (DEX). It enables users to swap various ERC-20 tokens.`;
        const mockKeyFunctions = ['swapExactTokensForTokens', 'addLiquidity', 'removeLiquidity', 'getAmountsOut'];
        const mockSecurityInsights = `The contract seems to use standard DEX patterns. Audit reports are generally available for major DEXs. Users should be aware of potential slippage and impermanent loss in liquidity pools.`;
        const mockVulnerabilities: string[] = Math.random() > 0.8 ? ['Potential reentrancy vulnerability in `transferTokens` if not properly guarded. (Hypothetical)'] : [];
        const mockCommonInteractions = `Users typically interact with this contract to exchange tokens, provide liquidity, or withdraw liquidity from pools.`;

        resolve({
            purpose: mockPurpose,
            keyFunctions: mockKeyFunctions,
            securityInsights: mockSecurityInsights,
            knownVulnerabilities: mockVulnerabilities,
            commonInteractions: mockCommonInteractions,
        });
    }, 2500 + Math.random() * 1500));
};

/**
 * @typedef {object} TokenSentimentAnalysisResult
 * @property {string} sentimentScore - Overall sentiment (e.g., 'Positive', 'Neutral', 'Negative').
 * @property {string} explanation - Detailed explanation of the sentiment.
 * @property {string[]} keywords - Key positive/negative keywords identified.
 * @property {string[]} influentialSources - Where the sentiment was detected.
 */
export interface TokenSentimentAnalysisResult {
    sentimentScore: 'Positive' | 'Neutral' | 'Negative';
    explanation: string;
    keywords: string[];
    influentialSources: string[];
}

/**
 * AI service for token sentiment analysis (simulated).
 * @param {string} tokenSymbol - Symbol of the token (e.g., ETH, USDC).
 */
export const analyzeTokenSentimentWithAI = async (tokenSymbol: string): Promise<TokenSentimentAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `Perform a sentiment analysis for the token "${tokenSymbol}" based on recent news and social media trends.`;

    console.log("AI Token Sentiment Prompt:", prompt);

    return new Promise(resolve => setTimeout(() => {
        const scores: TokenSentimentAnalysisResult['sentimentScore'][] = ['Positive', 'Neutral', 'Negative'];
        const sentiment = scores[Math.floor(Math.random() * scores.length)];

        let explanation = '';
        let keywords: string[] = [];
        let sources = ['Twitter', 'Reddit', 'News Articles'];

        switch (sentiment) {
            case 'Positive':
                explanation = `${tokenSymbol} is currently experiencing strong positive sentiment driven by recent product updates and growing adoption. Community engagement is high.`;
                keywords = ['bullish', 'innovation', 'growth', 'adoption', 'strong'];
                break;
            case 'Neutral':
                explanation = `Sentiment for ${tokenSymbol} is largely neutral, with no significant news or events driving strong positive or negative emotions. Steady market performance.`;
                keywords = ['stable', 'steady', 'holding', 'wait-and-see'];
                break;
            case 'Negative':
                explanation = `${tokenSymbol} shows negative sentiment due to recent FUD (Fear, Uncertainty, Doubt) and a market downturn. Some concerns about regulatory pressure.`;
                keywords = ['bearish', 'concern', 'sell-off', 'regulatory', 'weak'];
                break;
        }

        resolve({
            sentimentScore: sentiment,
            explanation: explanation,
            keywords: keywords,
            influentialSources: sources,
        });
    }, 1800 + Math.random() * 800));
};


// --- DASHBOARD COMPONENTS ---
/**
 * Props for the ChartPlaceholder component.
 * @property {string} title - The title of the chart.
 * @property {ChartDataPoint[]} data - Array of data points for the chart.
 * @property {string} xLabel - Label for the x-axis.
 * @property {string} yLabel - Label for the y-axis.
 * @property {string} [color='cyan-500'] - Tailwind CSS color class for the line.
 */
export interface ChartProps {
    title: string;
    data: ChartDataPoint[];
    xLabel: string;
    yLabel: string;
    color?: string;
}

/**
 * A placeholder component that simulates a line chart using SVG and basic styling.
 * This avoids needing a heavy charting library for the given line count task.
 */
export const ChartPlaceholder: React.FC<ChartProps> = ({ title, data, xLabel, yLabel, color = 'cyan-500' }) => {
    if (!data || data.length === 0) {
        return <Card title={title}><div className="p-4 text-center text-gray-400">No data available for {title}.</div></Card>;
    }
    const maxVal = Math.max(...data.map(d => d.value));
    const minVal = Math.min(...data.map(d => d.value));

    // Prepare CSS variable for the stroke color
    const colorClassParts = color.split('-'); // e.g., ['cyan', '500']
    const cssVar = `var(--color-${colorClassParts[0]}-${colorClassParts[1]})`;

    // Simulate drawing a very simple line chart using divs and styling
    const points = data.map((d, i) => {
        const xPos = (i / (data.length - 1)) * 100;
        const yPos = 100 - ((d.value - minVal) / (maxVal - minVal)) * 100;
        return `${xPos}% ${yPos}%`;
    }).join(',');

    return (
        <Card title={title}>
            <div className="relative h-64 w-full bg-gray-900 rounded-lg p-2">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline fill="none" stroke={cssVar} strokeWidth="1" points={points} />
                </svg>
                <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500">{xLabel}</div>
                <div className="absolute top-0 left-0 bottom-0 text-left text-xs text-gray-500 transform -rotate-90 origin-bottom-left pt-2">{yLabel}</div>
                <div className="absolute top-2 right-2 text-xs text-gray-400">
                    Max: {formatNumber(maxVal, 2)} | Min: {formatNumber(minVal, 2)}
                </div>
            </div>
        </Card>
    );
};


/**
 * Props for the GlobalMetricsOverview component.
 * @property {Awaited<ReturnType<typeof fetchGlobalMetrics>> | null} metrics - Global metrics data.
 * @property {boolean} isLoading - Loading state.
 */
export interface GlobalMetricsProps {
    metrics: Awaited<ReturnType<typeof fetchGlobalMetrics>> | null;
    isLoading: boolean;
}

/**
 * Displays key global blockchain metrics in a card layout.
 */
export const GlobalMetricsOverview: React.FC<GlobalMetricsProps> = ({ metrics, isLoading }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="24h Volume">
                {isLoading ? <div className="h-6 w-3/4 bg-gray-700 animate-pulse rounded"></div> : <div className="text-2xl font-bold text-white">{formatCurrency(metrics?.totalVolume24hUsd || 0, '$', 0)}</div>}
                <div className="text-sm text-gray-400 mt-1">Total traded across chains</div>
            </Card>
            <Card title="24h Transactions">
                {isLoading ? <div className="h-6 w-3/4 bg-gray-700 animate-pulse rounded"></div> : <div className="text-2xl font-bold text-white">{formatNumber(metrics?.totalTransactions24h || 0, 0)}</div>}
                <div className="text-sm text-gray-400 mt-1">Total transactions processed</div>
            </Card>
            <Card title="Active Wallets (24h)">
                {isLoading ? <div className="h-6 w-3/4 bg-gray-700 animate-pulse rounded"></div> : <div className="text-2xl font-bold text-white">{formatNumber(metrics?.activeWallets24h || 0, 0)}</div>}
                <div className="text-sm text-gray-400 mt-1">Unique active addresses</div>
            </Card>
            <Card title="Avg. Gas Price">
                {isLoading ? <div className="h-6 w-3/4 bg-gray-700 animate-pulse rounded"></div> : <div className="text-2xl font-bold text-white">{formatNumber(metrics?.averageGasPriceGwei || 0)} Gwei</div>}
                <div className="text-sm text-gray-400 mt-1">Ethereum network average</div>
            </Card>
        </div>
    );
};

/**
 * Props for the RecentTransactionsTable component.
 * @property {Transaction[]} transactions - Array of transaction data.
 * @property {boolean} isLoading - Loading state.
 */
export interface RecentTransactionsTableProps {
    transactions: Transaction[];
    isLoading: boolean;
}

/**
 * Displays a table of recent blockchain transactions.
 */
export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ transactions, isLoading }) => {
    return (
        <Card title="Recent Transactions">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hash</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">From</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">To</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Fee</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time Ago</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-24 bg-gray-700 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-16 bg-gray-700 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-20 bg-gray-700 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-20 bg-gray-700 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right"><div className="h-4 w-12 bg-gray-700 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right"><div className="h-4 w-10 bg-gray-700 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-16 bg-gray-700 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-12 bg-gray-700 animate-pulse rounded"></div></td>
                                </tr>
                            ))
                        ) : (
                            transactions.map(tx => (
                                <tr key={tx.hash} className="hover:bg-gray-700/50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-cyan-400 cursor-pointer" onClick={() => window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank')}>{shortenAddress(tx.hash, 8)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{tx.type.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-green-400">{shortenAddress(tx.from)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-red-400">{shortenAddress(tx.to)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">{formatNumber(weiToEth(tx.value), 4)} {tx.tokenSymbol || 'ETH'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-400">{tx.fee} ETH</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{timeAgo(tx.timestamp)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

/**
 * Props for the TopTokensTable component.
 * @property {TokenBalance[]} tokens - Array of top token data.
 * @property {boolean} isLoading - Loading state.
 */
export interface TopTokensTableProps {
    tokens: TokenBalance[];
    isLoading: boolean;
}

/**
 * Displays a table of top tokens by simulated market cap.
 */
export const TopTokensTable: React.FC<TopTokensTableProps> = ({ tokens, isLoading }) => {
    return (
        <Card title="Top Tokens by Market Cap (Simulated)">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price (USD)</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Market Cap (Simulated)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-20 bg-gray-700 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-12 bg-gray-700 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right"><div className="h-4 w-16 bg-gray-700 animate-pulse rounded"></div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right"><div className="h-4 w-24 bg-gray-700 animate-pulse rounded"></div></td>
                                </tr>
                            ))
                        ) : (
                            tokens.map(token => (
                                <tr key={token.address}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        <div className="flex items-center">
                                            {token.logoUrl && <img src={token.logoUrl} alt={token.symbol} className="h-6 w-6 mr-2 rounded-full" />}
                                            {token.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 uppercase">{token.symbol}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">{formatCurrency(token.priceUsd)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">{formatCurrency(token.valueUsd, '$', 0)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

/**
 * Props for the DeFiProtocolsOverview component.
 * @property {DeFiProtocol[]} protocols - Array of DeFi protocol data.
 * @property {boolean} isLoading - Loading state.
 */
export interface DeFiProtocolsOverviewProps {
    protocols: DeFiProtocol[];
    isLoading: boolean;
}

/**
 * Displays an overview of top DeFi protocols.
 */
export const DeFiProtocolsOverview: React.FC<DeFiProtocolsOverviewProps> = ({ protocols, isLoading }) => {
    return (
        <Card title="Top DeFi Protocols">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 bg-gray-800/50 p-4 rounded-lg animate-pulse">
                            <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
                                <div className="h-3 w-1/2 bg-gray-700 rounded"></div>
                            </div>
                            <div className="h-5 w-1/4 bg-gray-700 rounded"></div>
                        </div>
                    ))
                ) : (
                    protocols.map(protocol => (
                        <div key={protocol.address} className="flex items-center space-x-4 bg-gray-800/50 p-4 rounded-lg hover:bg-gray-700/50 transition-colors duration-150">
                            {protocol.logoUrl && <img src={protocol.logoUrl} alt={protocol.name} className="h-10 w-10 rounded-full" />}
                            <div className="flex-1">
                                <h4 className="text-white font-semibold">{protocol.name} <span className="text-xs text-gray-500">({protocol.category})</span></h4>
                                <p className="text-sm text-gray-400">TVL: {formatCurrency(protocol.tvlUsd, '$', 0)}</p>
                                <p className="text-xs text-gray-500">24h Vol: {formatCurrency(protocol.volume24hUsd, '$', 0)}</p>
                            </div>
                            <button className="text-cyan-400 hover:text-cyan-300 text-sm">Details</button>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

/**
 * Props for the NFTMarketOverview component.
 * @property {NFTCollection[]} collections - Array of NFT collection data.
 * @property {boolean} isLoading - Loading state.
 */
export interface NFTMarketOverviewProps {
    collections: NFTCollection[];
    isLoading: boolean;
}

/**
 * Displays an overview of top NFT collections.
 */
export const NFTMarketOverview: React.FC<NFTMarketOverviewProps> = ({ collections, isLoading }) => {
    return (
        <Card title="Top NFT Collections">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-gray-800/50 p-4 rounded-lg animate-pulse">
                            <div className="h-32 w-full bg-gray-700 rounded mb-4"></div>
                            <div className="h-4 w-3/4 bg-gray-700 rounded mb-2"></div>
                            <div className="h-3 w-1/2 bg-gray-700 rounded"></div>
                        </div>
                    ))
                ) : (
                    collections.map(collection => (
                        <div key={collection.contractAddress} className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-700/50 transition-colors duration-150">
                            {collection.imageUrl && <img src={collection.imageUrl} alt={collection.name} className="h-32 w-full object-cover rounded mb-4" />}
                            <h4 className="text-white font-semibold">{collection.name}</h4>
                            <p className="text-sm text-gray-400">Floor Price: {formatNumber(collection.floorPriceEth, 2)} ETH ({formatCurrency(collection.floorPriceUsd, '$', 0)})</p>
                            <p className="text-xs text-gray-500">24h Volume: {formatNumber(collection.volume24hEth, 2)} ETH</p>
                            <p className="text-xs text-gray-500">Holders: {formatNumber(collection.uniqueHolders, 0)}</p>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

/**
 * Props for the GasPriceTracker component.
 * @property {GasPriceInfo | null} gasInfo - Gas price information.
 * @property {boolean} isLoading - Loading state.
 */
export interface GasPriceTrackerProps {
    gasInfo: GasPriceInfo | null;
    isLoading: boolean;
}

/**
 * Displays current Ethereum gas prices.
 */
export const GasPriceTracker: React.FC<GasPriceTrackerProps> = ({ gasInfo, isLoading }) => {
    return (
        <Card title="Ethereum Gas Price">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-400">Standard</p>
                    {isLoading ? <div className="h-6 w-1/2 mx-auto bg-gray-700 animate-pulse rounded mt-2"></div> : <p className="text-2xl font-bold text-white mt-1">{gasInfo?.standardGwei || '--'} Gwei</p>}
                </div>
                <div className="p-3 bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-400">Fast</p>
                    {isLoading ? <div className="h-6 w-1/2 mx-auto bg-gray-700 animate-pulse rounded mt-2"></div> : <p className="text-2xl font-bold text-white mt-1">{gasInfo?.fastGwei || '--'} Gwei</p>}
                </div>
                <div className="p-3 bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-400">Rapid</p>
                    {isLoading ? <div className="h-6 w-1/2 mx-auto bg-gray-700 animate-pulse rounded mt-2"></div> : <p className="text-2xl font-bold text-white mt-1">{gasInfo?.rapidGwei || '--'} Gwei</p>}
                </div>
            </div>
            <div className="text-xs text-gray-500 mt-4">
                {isLoading ? <div className="h-3 w-3/4 bg-gray-700 animate-pulse rounded mx-auto"></div> : `Base Fee: ${gasInfo?.baseFeeGwei || '--'} Gwei | Priority Fee: ${gasInfo?.priorityFeeGwei || '--'} Gwei (Last Block: ${gasInfo?.lastBlock || '--'})`}
            </div>
        </Card>
    );
};

/**
 * A component for analyzing a specific Ethereum wallet using AI.
 */
export const WalletAnalyzer: React.FC = () => {
    const [address, setAddress] = useState('');
    const [walletData, setWalletData] = useState<WalletActivity | null>(null);
    const [analysisResult, setAnalysisResult] = useState<WalletAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!address) {
            setError("Please enter a wallet address.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setWalletData(null);
        setAnalysisResult(null);

        try {
            const fetchedData = await fetchWalletActivity(address);
            setWalletData(fetchedData);
            const result = await analyzeWalletWithAI(address, fetchedData);
            setAnalysisResult(result);

        } catch (err) {
            console.error("Wallet analysis error:", err);
            setError("Failed to analyze wallet. Please check the address or try again. (Simulated data/AI error)");
            setWalletData(null);
            setAnalysisResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="AI Wallet Analyzer">
            <div className="space-y-4">
                <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Enter Ethereum Wallet Address (e.g., 0x...)"
                    className="w-full bg-gray-700/50 p-2 rounded text-white font-mono placeholder-gray-500"
                />
                <button onClick={handleAnalyze} disabled={isLoading || !address} className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50">
                    {isLoading ? 'Analyzing Wallet...' : 'Analyze Wallet'}
                </button>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                {isLoading && !walletData && !analysisResult && (
                    <div className="p-4 text-center text-gray-400">Fetching data and running AI analysis...</div>
                )}

                {walletData && (
                    <div className="bg-gray-900 p-4 rounded-lg space-y-3">
                        <h4 className="text-lg font-semibold text-white">Wallet Overview: {shortenAddress(walletData.address)}</h4>
                        <p className="text-gray-300">Total Value: <span className="font-bold">{formatCurrency(parseFloat(walletData.totalValueUsd))}</span></p>
                        <p className="text-gray-300">Total Transactions: {formatNumber(walletData.transactionCount, 0)}</p>
                        <p className="text-gray-300">First Seen: {formatDate(walletData.firstSeenTimestamp)}</p>
                        <h5 className="font-semibold text-gray-200 mt-3">Balances:</h5>
                        <ul className="list-disc list-inside text-sm text-gray-400">
                            {walletData.balances.map(b => (
                                <li key={b.symbol}>{formatNumber(weiToEth(b.balance), 4)} {b.symbol} ({formatCurrency(b.valueUsd)})</li>
                            ))}
                        </ul>
                    </div>
                )}

                {analysisResult && (
                    <div className="bg-gray-900 p-4 rounded-lg space-y-3">
                        <h4 className="text-lg font-semibold text-white">AI Analysis Insights:</h4>
                        <p className="text-gray-300"><span className="font-semibold">Summary:</span> {analysisResult.summary}</p>
                        <p className="text-gray-300"><span className="font-semibold">Risk Score:</span> {analysisResult.riskScoreExplanation}</p>
                        {analysisResult.topTokens.length > 0 && (
                            <p className="text-gray-300"><span className="font-semibold">Top Tokens:</span> {analysisResult.topTokens.join(', ')}</p>
                        )}
                        {analysisResult.topProtocols.length > 0 && (
                            <p className="text-gray-300"><span className="font-semibold">Top Protocols:</span> {analysisResult.topProtocols.join(', ')}</p>
                        )}
                        {analysisResult.potentialAnomalies.length > 0 && (
                            <div className="mt-3">
                                <h5 className="font-semibold text-red-400">Potential Anomalies:</h5>
                                <ul className="list-disc list-inside text-sm text-red-300">
                                    {analysisResult.potentialAnomalies.map((anomaly, i) => <li key={i}>{anomaly}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

/**
 * A component for analyzing a specific smart contract using AI.
 */
export const SmartContractAnalyzer: React.FC = () => {
    const [contractAddress, setContractAddress] = useState('');
    const [abiInput, setAbiInput] = useState(''); // Simulated ABI input
    const [analysisResult, setAnalysisResult] = useState<SmartContractAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!contractAddress) {
            setError("Please enter a contract address.");
            return;
        }
        // In a real app, you'd fetch the ABI from Etherscan or similar
        const simulatedAbi = abiInput || `[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"}, {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]`;

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeSmartContractWithAI(contractAddress, simulatedAbi);
            setAnalysisResult(result);
        } catch (err) {
            console.error("Smart contract analysis error:", err);
            setError("Failed to analyze smart contract. Please check the address or try again. (Simulated AI error)");
            setAnalysisResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="AI Smart Contract Analyzer">
            <div className="space-y-4">
                <input
                    type="text"
                    value={contractAddress}
                    onChange={e => setContractAddress(e.target.value)}
                    placeholder="Enter Smart Contract Address (e.g., 0x...)"
                    className="w-full bg-gray-700/50 p-2 rounded text-white font-mono placeholder-gray-500"
                />
                <textarea
                    value={abiInput}
                    onChange={e => setAbiInput(e.target.value)}
                    placeholder="Optional: Paste ABI JSON here (e.g., from Etherscan)"
                    rows={4}
                    className="w-full bg-gray-700/50 p-2 rounded text-white font-mono placeholder-gray-500"
                ></textarea>
                <button onClick={handleAnalyze} disabled={isLoading || !contractAddress} className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded disabled:opacity-50">
                    {isLoading ? 'Analyzing Contract...' : 'Analyze Contract'}
                </button>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                {isLoading && !analysisResult && (
                    <div className="p-4 text-center text-gray-400">Running AI analysis on contract...</div>
                )}

                {analysisResult && (
                    <div className="bg-gray-900 p-4 rounded-lg space-y-3">
                        <h4 className="text-lg font-semibold text-white">AI Contract Insights:</h4>
                        <p className="text-gray-300"><span className="font-semibold">Purpose:</span> {analysisResult.purpose}</p>
                        <p className="text-gray-300"><span className="font-semibold">Key Functions:</span> {analysisResult.keyFunctions.join(', ')}</p>
                        <p className="text-gray-300"><span className="font-semibold">Security Insights:</span> {analysisResult.securityInsights}</p>
                        {analysisResult.knownVulnerabilities.length > 0 && (
                            <div className="mt-3">
                                <h5 className="font-semibold text-red-400">Known Vulnerabilities:</h5>
                                <ul className="list-disc list-inside text-sm text-red-300">
                                    {analysisResult.knownVulnerabilities.map((vuln, i) => <li key={i}>{vuln}</li>)}
                                </ul>
                            </div>
                        )}
                        <p className="text-gray-300"><span className="font-semibold">Common Interactions:</span> {analysisResult.commonInteractions}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

/**
 * A component for analyzing token sentiment using AI.
 */
export const TokenSentimentAnalyzer: React.FC = () => {
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [analysisResult, setAnalysisResult] = useState<TokenSentimentAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!tokenSymbol) {
            setError("Please enter a token symbol (e.g., ETH, USDC).");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeTokenSentimentWithAI(tokenSymbol);
            setAnalysisResult(result);
        } catch (err) {
            console.error("Token sentiment analysis error:", err);
            setError("Failed to analyze token sentiment. Please check the symbol or try again. (Simulated AI error)");
            setAnalysisResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="AI Token Sentiment Analyzer">
            <div className="space-y-4">
                <input
                    type="text"
                    value={tokenSymbol}
                    onChange={e => setTokenSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter Token Symbol (e.g., ETH, USDC)"
                    className="w-full bg-gray-700/50 p-2 rounded text-white font-mono placeholder-gray-500"
                />
                <button onClick={handleAnalyze} disabled={isLoading || !tokenSymbol} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50">
                    {isLoading ? 'Analyzing Sentiment...' : 'Analyze Sentiment'}
                </button>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                {isLoading && !analysisResult && (
                    <div className="p-4 text-center text-gray-400">Running AI sentiment analysis...</div>
                )}

                {analysisResult && (
                    <div className="bg-gray-900 p-4 rounded-lg space-y-3">
                        <h4 className="text-lg font-semibold text-white">AI Sentiment Insights for {tokenSymbol}:</h4>
                        <p className="text-gray-300"><span className="font-semibold">Overall Sentiment:</span> <span className={
                            analysisResult.sentimentScore === 'Positive' ? 'text-green-400' :
                            analysisResult.sentimentScore === 'Negative' ? 'text-red-400' : 'text-yellow-400'
                        }>{analysisResult.sentimentScore}</span></p>
                        <p className="text-gray-300"><span className="font-semibold">Explanation:</span> {analysisResult.explanation}</p>
                        {analysisResult.keywords.length > 0 && (
                            <p className="text-gray-300"><span className="font-semibold">Keywords:</span> {analysisResult.keywords.join(', ')}</p>
                        )}
                        {analysisResult.influentialSources.length > 0 && (
                            <p className="text-gray-300"><span className="font-semibold">Influential Sources:</span> {analysisResult.influentialSources.join(', ')}</p>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};


/**
 * Props for the SearchFilterBar component.
 * @property {(query: string) => void} onSearch - Callback for search queries.
 * @property {(filters: { type?: string; status?: string; dateRange?: string }) => void} onFilterChange - Callback for filter changes.
 * @property {string} currentQuery - The current search query string.
 * @property {{ type?: string; status?: string; dateRange?: string }} currentFilters - The currently applied filters.
 */
export interface SearchFilterBarProps {
    onSearch: (query: string) => void;
    onFilterChange: (filters: { type?: string; status?: string; dateRange?: string }) => void;
    currentQuery: string;
    currentFilters: { type?: string; status?: string; dateRange?: string };
}

/**
 * A search and filter bar for transaction data.
 */
export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ onSearch, onFilterChange, currentQuery, currentFilters }) => {
    const [searchQuery, setSearchQuery] = useState(currentQuery);
    const [selectedType, setSelectedType] = useState(currentFilters.type || '');
    const [selectedStatus, setSelectedStatus] = useState(currentFilters.status || '');
    const [selectedDateRange, setSelectedDateRange] = useState(currentFilters.dateRange || '');

    useEffect(() => {
        setSearchQuery(currentQuery);
        setSelectedType(currentFilters.type || '');
        setSelectedStatus(currentFilters.status || '');
        setSelectedDateRange(currentFilters.dateRange || '');
    }, [currentQuery, currentFilters]);

    const handleSearchClick = () => {
        onSearch(searchQuery);
    };

    const handleFilterChangeInternal = (key: string, value: string) => {
        const newFilters = { ...currentFilters, [key]: value };
        onFilterChange(newFilters);
        if (key === 'type') setSelectedType(value);
        if (key === 'status') setSelectedStatus(value);
        if (key === 'dateRange') setSelectedDateRange(value);
    };

    return (
        <Card title="Analytics Search & Filters">
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by address, hash, or block..."
                        className="flex-grow bg-gray-700/50 p-2 rounded text-white placeholder-gray-500"
                        onKeyPress={(e) => { if (e.key === 'Enter') handleSearchClick(); }}
                    />
                    <button onClick={handleSearchClick} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">Search</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="transaction-type" className="block text-sm font-medium text-gray-300 mb-1">Transaction Type</label>
                        <select
                            id="transaction-type"
                            value={selectedType}
                            onChange={e => handleFilterChangeInternal('type', e.target.value)}
                            className="w-full bg-gray-700/50 p-2 rounded text-white"
                        >
                            <option value="">All Types</option>
                            <option value="transfer">Transfer</option>
                            <option value="contract_call">Contract Call</option>
                            <option value="swap">Swap</option>
                            <option value="mint">Mint</option>
                            <option value="burn">Burn</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="transaction-status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                        <select
                            id="transaction-status"
                            value={selectedStatus}
                            onChange={e => handleFilterChangeInternal('status', e.target.value)}
                            className="w-full bg-gray-700/50 p-2 rounded text-white"
                        >
                            <option value="">All Statuses</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date-range" className="block text-sm font-medium text-gray-300 mb-1">Date Range</label>
                        <select
                            id="date-range"
                            value={selectedDateRange}
                            onChange={e => handleFilterChangeInternal('dateRange', e.target.value)}
                            className="w-full bg-gray-700/50 p-2 rounded text-white"
                        >
                            <option value="">All Time</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                            <option value="1y">Last Year</option>
                        </select>
                    </div>
                </div>
            </div>
        </Card>
    );
};


/**
 * Props for the TransactionExplainerModal component.
 * @property {boolean} isOpen - Controls the visibility of the modal.
 * @property {() => void} onClose - Callback function to close the modal.
 * @property {string} [initialTxHash=""] - Optional initial transaction hash to pre-fill the input.
 */
export interface TransactionExplainerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTxHash?: string;
}

/**
 * A modal component for AI-powered transaction explanation.
 */
export const TransactionExplainerModal: React.FC<TransactionExplainerModalProps> = ({ isOpen, onClose, initialTxHash = "" }) => {
    const [txHash, setTxHash] = useState(initialTxHash);
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setTxHash(initialTxHash);
            setExplanation(''); // Clear previous explanation
            setError(null);    // Clear previous error
        }
    }, [isOpen, initialTxHash]);

    const handleExplain = async () => {
        if (!txHash || txHash.trim() === "") {
            setError("Please enter a valid transaction hash.");
            return;
        }
        setIsLoading(true);
        setExplanation('');
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            // Simulate fetching transaction data first (not implemented here, assumed successful)
            // In a real application, you would make an actual API call to Etherscan, Alchemy, etc.
            const mockTxData: Transaction = {
                hash: txHash,
                from: '0xabc123def4567890abc123def4567890abc123de',
                to: '0xdef456abc123def456abc123def456abc123de12',
                value: '1000000000000000000', // 1 ETH
                tokenSymbol: 'ETH',
                gasUsed: 21000,
                gasPrice: '20000000000', // 20 Gwei
                timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600 * 24 * 3), // within last 3 days
                status: Math.random() > 0.1 ? 'success' : 'failed',
                type: Math.random() > 0.7 ? 'swap' : (Math.random() > 0.5 ? 'contract_call' : 'transfer'),
                blockNumber: (Math.floor(Math.random() * 1000000) + 18000000).toString(),
                fee: calculateFeeEth(21000, '20000000000'),
            }; 
            
            const prompt = `Explain the following Ethereum transaction in simple terms, focusing on what it represents. If it's a common DeFi interaction like a swap, liquidity provision, or token transfer, describe that.
            
            Transaction Details:
            - Hash: ${mockTxData.hash}
            - From Address: ${mockTxData.from}
            - To Address: ${mockTxData.to}
            - Value: ${weiToEth(mockTxData.value)} ${mockTxData.tokenSymbol || 'ETH'}
            - Type: ${mockTxData.type.replace('_', ' ')}
            - Status: ${mockTxData.status}
            - Gas Fee: ${mockTxData.fee} ETH
            - Timestamp: ${formatDate(mockTxData.timestamp)}
            
            Based on these details, what did this transaction likely achieve on the Ethereum blockchain? Provide a clear, concise, and easy-to-understand explanation for a non-technical user. Assume context if it looks like a common protocol (e.g., Uniswap swap, Aave deposit).`;
            
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: [{text: prompt}] });
            setExplanation(response.text.replace(/(\*\*)/g, '')); // Remove markdown bold for simpler display
        } catch (err) {
            console.error("AI explanation error:", err);
            setError("Error explaining transaction. Please ensure the API key is valid and the transaction hash is correct. (Simulated AI error/API limit)");
            setExplanation("Could not generate explanation.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">AI Transaction Explainer</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <input
                        type="text"
                        value={txHash}
                        onChange={e => setTxHash(e.target.value)}
                        placeholder="Enter Transaction Hash (e.g., 0x123...abc)"
                        className="w-full bg-gray-700/50 p-2 rounded text-white font-mono placeholder-gray-500"
                    />
                    <button onClick={handleExplain} disabled={isLoading || !txHash.trim()} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded disabled:opacity-50">
                        {isLoading ? 'Analyzing...' : 'Explain Transaction'}
                    </button>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <Card title="Explanation">
                        <div className="min-h-[10rem] text-sm text-gray-300 whitespace-pre-line overflow-y-auto max-h-80">
                            {isLoading ? 'Generating AI explanation...' : (explanation || 'Enter a transaction hash and click "Explain Transaction" to get an AI-generated explanation.')}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};


// Main OnChainAnalyticsView component - Orchestrates all other components
const OnChainAnalyticsView: React.FC = () => {
    // Original AI Explainer state
    const [isExplainerOpen, setExplainerOpen] = useState(false);
    const [explainerTxHash, setExplainerTxHash] = useState("0x272b16a4f91e984a9e574d618d350d7a22906ed28956973e87858c89b2767098"); // Example Uniswap Tx Hash

    // Global Metrics State
    const [globalMetrics, setGlobalMetrics] = useState<Awaited<ReturnType<typeof fetchGlobalMetrics>> | null>(null);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

    // Transactions State
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
    const [transactionSearchQuery, setTransactionSearchQuery] = useState('');
    const [transactionFilters, setTransactionFilters] = useState<{ type?: string; status?: string; dateRange?: string }>({});

    // Top Tokens State
    const [topTokens, setTopTokens] = useState<TokenBalance[]>([]);
    const [isLoadingTopTokens, setIsLoadingTopTokens] = useState(true);

    // DeFi Protocols State
    const [defiProtocols, setDeFiProtocols] = useState<DeFiProtocol[]>([]);
    const [isLoadingDeFiProtocols, setIsLoadingDeFiProtocols] = useState(true);

    // NFT Collections State
    const [nftCollections, setNftCollections] = useState<NFTCollection[]>([]);
    const [isLoadingNftCollections, setIsLoadingNftCollections] = useState(true);

    // Gas Price State
    const [gasPriceInfo, setGasPriceInfo] = useState<GasPriceInfo | null>(null);
    const [isLoadingGasPrice, setIsLoadingGasPrice] = useState(true);

    // Chart Data States (ETH Price, Gas Price, Total Tx)
    const [ethPriceChartData, setEthPriceChartData] = useState<ChartDataPoint[]>([]);
    const [gasPriceChartData, setGasPriceChartData] = useState<ChartDataPoint[]>([]);
    const [totalTxChartData, setTotalTxChartData] = useState<ChartDataPoint[]>([]);
    const [isLoadingCharts, setIsLoadingCharts] = useState(true);
    const [chartDuration, setChartDuration] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

    // Data Fetching Effects
    useEffect(() => {
        const loadAllData = async () => {
            // Global Metrics
            setIsLoadingMetrics(true);
            try {
                const metrics = await fetchGlobalMetrics();
                setGlobalMetrics(metrics);
            } catch (error) { console.error("Failed to fetch global metrics", error); }
            finally { setIsLoadingMetrics(false); }

            // Recent Transactions
            setIsLoadingTransactions(true);
            try {
                const txs = await fetchRecentTransactions(15);
                setRecentTransactions(txs);
            } catch (error) { console.error("Failed to fetch recent transactions", error); }
            finally { setIsLoadingTransactions(false); }

            // Top Tokens
            setIsLoadingTopTokens(true);
            try {
                const tokens = await fetchTopTokens(10);
                setTopTokens(tokens);
            } catch (error) { console.error("Failed to fetch top tokens", error); }
            finally { setIsLoadingTopTokens(false); }

            // DeFi Protocols
            setIsLoadingDeFiProtocols(true);
            try {
                const protocols = await fetchDeFiProtocols(6);
                setDeFiProtocols(protocols);
            } catch (error) { console.error("Failed to fetch DeFi protocols", error); }
            finally { setIsLoadingDeFiProtocols(false); }

            // NFT Collections
            setIsLoadingNftCollections(true);
            try {
                const nfts = await fetchNFTCollections(5);
                setNftCollections(nfts);
            } catch (error) { console.error("Failed to fetch NFT collections", error); }
            finally { setIsLoadingNftCollections(false); }

            // Gas Price
            setIsLoadingGasPrice(true);
            try {
                const gas = await fetchGasPriceInfo();
                setGasPriceInfo(gas);
            } catch (error) { console.error("Failed to fetch gas price", error); }
            finally { setIsLoadingGasPrice(false); }
        };
        loadAllData();

        // Refresh gas price every 30 seconds
        const gasRefreshInterval = setInterval(() => {
            fetchGasPriceInfo().then(setGasPriceInfo).catch(err => console.error("Failed to refresh gas price", err));
        }, 30000);

        return () => clearInterval(gasRefreshInterval);
    }, []);

    // Effect for Charts data based on duration
    useEffect(() => {
        setIsLoadingCharts(true);
        const loadChartData = async () => {
            try {
                const [ethData, gasData, txData] = await Promise.all([
                    fetchChartData('ethPrice', chartDuration),
                    fetchChartData('gas', chartDuration),
                    fetchChartData('totalTx', chartDuration)
                ]);
                setEthPriceChartData(ethData);
                setGasPriceChartData(gasData);
                setTotalTxChartData(txData);
            } catch (error) {
                console.error("Failed to fetch chart data:", error);
            } finally {
                setIsLoadingCharts(false);
            }
        };
        loadChartData();
    }, [chartDuration]);

    // Memoized and filtered transactions for the table
    const filteredTransactions = useMemo(() => {
        return recentTransactions.filter(tx => {
            let matches = true;
            // Search Query
            if (transactionSearchQuery) {
                const queryLower = transactionSearchQuery.toLowerCase();
                matches = matches && (
                    tx.hash.toLowerCase().includes(queryLower) ||
                    tx.from.toLowerCase().includes(queryLower) ||
                    tx.to.toLowerCase().includes(queryLower) ||
                    (tx.contractAddress && tx.contractAddress.toLowerCase().includes(queryLower)) ||
                    (tx.method && tx.method.toLowerCase().includes(queryLower))
                );
            }

            // Type Filter
            if (transactionFilters.type && transactionFilters.type !== '') {
                matches = matches && tx.type === transactionFilters.type;
            }

            // Status Filter
            if (transactionFilters.status && transactionFilters.status !== '') {
                matches = matches && tx.status === transactionFilters.status;
            }

            // Date Range Filter (simplistic, real implementation would convert range to timestamps)
            if (transactionFilters.dateRange && transactionFilters.dateRange !== '') {
                const now = Math.floor(Date.now() / 1000);
                let cutoffTimestamp = 0;
                switch (transactionFilters.dateRange) {
                    case '24h': cutoffTimestamp = now - 24 * 3600; break;
                    case '7d': cutoffTimestamp = now - 7 * 24 * 3600; break;
                    case '30d': cutoffTimestamp = now - 30 * 24 * 3600; break;
                    case '90d': cutoffTimestamp = now - 90 * 24 * 3600; break;
                    case '1y': cutoffTimestamp = now - 365 * 24 * 3600; break;
                    default: break;
                }
                matches = matches && tx.timestamp >= cutoffTimestamp;
            }

            return matches;
        });
    }, [recentTransactions, transactionSearchQuery, transactionFilters]);

    // Callback for search and filter bar
    const handleSearch = useCallback((query: string) => {
        setTransactionSearchQuery(query);
    }, []);

    const handleFilterChange = useCallback((filters: { type?: string; status?: string; dateRange?: string }) => {
        setTransactionFilters(filters);
    }, []);

    return (
        <>
            <div className="space-y-8 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">On-Chain Analytics Hub</h2>
                    <div className="flex gap-3">
                        <button onClick={() => setExplainerOpen(true)} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-base font-semibold transition-transform transform hover:scale-105 shadow-lg">
                            AI Transaction Explainer
                        </button>
                    </div>
                </div>

                {/* Global Metrics Section */}
                <section>
                    <h3 className="text-2xl font-bold text-white mb-4">Global Overview</h3>
                    <GlobalMetricsOverview metrics={globalMetrics} isLoading={isLoadingMetrics} />
                </section>

                {/* Charts Section */}
                <section>
                    <h3 className="text-2xl font-bold text-white mb-4">Historical Trends</h3>
                    <div className="flex justify-end mb-4">
                        <select
                            value={chartDuration}
                            onChange={e => setChartDuration(e.target.value as '7d' | '30d' | '90d' | '1y')}
                            className="bg-gray-700/50 p-2 rounded text-white text-sm"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                            <option value="1y">Last Year</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ChartPlaceholder title="ETH Price (USD)" data={ethPriceChartData} xLabel="Time" yLabel="Price ($)" color="green-500" />
                        <ChartPlaceholder title="Average Gas Price (Gwei)" data={gasPriceChartData} xLabel="Time" yLabel="Gwei" color="orange-500" />
                        <ChartPlaceholder title="Total Transactions" data={totalTxChartData} xLabel="Time" yLabel="Transactions" color="purple-500" />
                    </div>
                </section>

                {/* Transaction Explorer Section */}
                <section>
                    <h3 className="text-2xl font-bold text-white mb-4">Transaction Explorer</h3>
                    <SearchFilterBar
                        onSearch={handleSearch}
                        onFilterChange={handleFilterChange}
                        currentQuery={transactionSearchQuery}
                        currentFilters={transactionFilters}
                    />
                    <div className="mt-6">
                        <RecentTransactionsTable transactions={filteredTransactions} isLoading={isLoadingTransactions} />
                    </div>
                </section>

                {/* Top Assets and DeFi Section */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Top Digital Assets</h3>
                        <TopTokensTable tokens={topTokens} isLoading={isLoadingTopTokens} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Decentralized Finance</h3>
                        <DeFiProtocolsOverview protocols={defiProtocols} isLoading={isLoadingDeFiProtocols} />
                    </div>
                </section>

                {/* NFT and Gas Price Section */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">NFT Market Insights</h3>
                        <NFTMarketOverview collections={nftCollections} isLoading={isLoadingNftCollections} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Network Health</h3>
                        <GasPriceTracker gasInfo={gasPriceInfo} isLoading={isLoadingGasPrice} />
                    </div>
                </section>

                {/* AI Powered Insights Section */}
                <section>
                    <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Insights</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <WalletAnalyzer />
                        <SmartContractAnalyzer />
                        <TokenSentimentAnalyzer />
                    </div>
                </section>
            </div>

            {/* AI Transaction Explainer Modal */}
            <TransactionExplainerModal isOpen={isExplainerOpen} onClose={() => setExplainerOpen(false)} initialTxHash={explainerTxHash} />
        </>
    );
};

export default OnChainAnalyticsView;