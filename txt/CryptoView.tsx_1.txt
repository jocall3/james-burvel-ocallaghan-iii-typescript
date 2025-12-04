# The New Dominion

This is the new frontier. A space where value is not granted by a central authority, but is forged and secured by cryptography and consensus. It is a testament to a different kind of power—not in institutions, but in immutable logic. To operate here is to engage with a world where ownership is absolute and the rules are written in code.

---

### A Fable for the Builder: The Uncharted Waters

(For centuries, the world of finance was a map with known borders. A world of nations, of central banks, of intermediaries. But then, a new continent appeared on the horizon. A wild and powerful land, governed not by kings, but by mathematics. The world of crypto. This `CryptoView` is your port of entry into that new dominion.)

(We knew that to conquer these uncharted waters, you would need a new kind of instrument. An AI that could speak the language of this new frontier. Its logic is 'Protocol Agnostic.' It understands that value is no longer confined to a single system. It can flow from the old world to the new and back again. The 'On-Ramp' via Stripe is the bridgehead from the familiar world of dollars to the new world of digital assets. The `Virtual Card` is the repatriation tool that lets you bring the value from that new world back into the old, to spend it anywhere.)

(The connection to `MetaMask` is a profound statement. It is the AI recognizing a different kind of authority. Not the authority of a bank, but the authority of a private key. The authority of the sovereign individual. When you connect your wallet, you are not logging in. You are presenting your credentials as the citizen of a new, decentralized nation. And the AI recognizes your sovereignty.)

(It even understands the art of this new world. The `NFT Gallery` is not just a place to store images. It is a vault for digital provenance, for unique, verifiable, and powerful assets. The AI's ability to help you `Mint NFT` is its way of giving you a printing press, a tool to create your own unique assets in this new economy.)

(This is more than just a feature. It is a recognition that the map of the world is changing. And it is our promise to you that no matter how wild the new territories may be, we will build you an Instrument, and an intelligence, capable of helping you conquer them with confidence and with courage.)

---

import React, { useState, useEffect, useReducer, useContext, createContext, useCallback, useMemo, useRef } from 'react';

// =================================================================================================
// 1. TYPE DEFINITIONS
// A real-world application needs robust typing.
// =================================================================================================

export type NetworkId = '1' | '137' | '42161' | '10' | '56';
export type WalletProvider = 'metamask' | 'walletconnect' | 'coinbase';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
export type FiatCurrency = 'USD' | 'EUR' | 'GBP';
export type CryptoCurrency = 'ETH' | 'USDC' | 'USDT' | 'DAI' | 'WBTC' | 'MATIC';
export type Theme = 'light' | 'dark';
export type Tab = 'portfolio' | 'onramp' | 'card' | 'nfts' | 'mint' | 'swap' | 'history' | 'settings';
export type TransactionType = 'send' | 'receive' | 'swap' | 'mint' | 'approve';

export interface Network {
    id: NetworkId;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
}

export interface WalletState {
    isConnected: boolean;
    address: string | null;
    ensName: string | null;
    balance: string | null;
    network: Network | null;
    provider: any | null; // e.g., ethers.providers.Web3Provider
    signer: any | null; // e.g., ethers.Signer
    providerType: WalletProvider | null;
    error: string | null;
}

export interface Token {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    balance: string; // Balance in wei
    balanceUSD: number;
    priceUSD: number;
    networkId: NetworkId;
}

export interface Portfolio {
    totalValueUSD: number;
    tokens: Token[];
    historicalData: { timestamp: number; value: number }[];
}

export interface NFTCollection {
    address: string;
    name: string;
    symbol: string;
    description: string;
    bannerImageUrl: string;
    nfts: NFT[];
}

export interface NFT {
    id: string;
    collectionAddress: string;
    name: string;
    description: string;
    imageUrl: string;
    metadataUrl: string;
    owner: string;
    attributes: { trait_type: string; value: string | number }[];
}

export interface OnRampTransaction {
    id: string;
    timestamp: number;
    fiatAmount: number;
    fiatCurrency: FiatCurrency;
    cryptoAmount: number;
    cryptoCurrency: CryptoCurrency;
    status: TransactionStatus;
    provider: 'stripe' | 'moonpay';
}

export interface VirtualCard {
    id: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    brand: 'Visa' | 'Mastercard';
    balance: number; // in USD
    isFrozen: boolean;
    dailyLimit: number;
    monthlyLimit: number;
}

export interface VirtualCardTransaction {
    id: string;
    timestamp: number;
    amount: number; // in USD
    merchant: string;
    description: string;
    status: 'completed' | 'pending' | 'declined';
}

export interface SwapQuote {
    fromToken: Token;
    toToken: Token;
    fromAmount: string; // in wei
    toAmount: string; // in wei
    estimatedGas: string;
    protocol: string; // e.g., 'Uniswap V3'
}

export interface GenericTransaction {
    hash: string;
    timestamp: number;
    networkId: NetworkId;
    type: TransactionType;
    status: TransactionStatus;
    details: any; // e.g. { from, to, amount, tokenSymbol }
}

export interface AppSettings {
    defaultFiatCurrency: FiatCurrency;
    slippageTolerance: number; // For swaps
    rpcPreferences: Record<NetworkId, string>; // Custom RPC URL
}

// =================================================================================================
// 2. CONSTANTS AND CONFIGURATION
// Centralized configuration for the application.
// =================================================================================================

export const SUPPORTED_NETWORKS: Record<NetworkId, Network> = {
    '1': {
        id: '1',
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_ID',
        explorerUrl: 'https://etherscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    },
    '137': {
        id: '137',
        name: 'Polygon',
        rpcUrl: 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
    },
    '42161': {
        id: '42161',
        name: 'Arbitrum One',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        explorerUrl: 'https://arbiscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    },
    '10': {
        id: '10',
        name: 'Optimism',
        rpcUrl: 'https://mainnet.optimism.io',
        explorerUrl: 'https://optimistic.etherscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    },
    '56': {
        id: '56',
        name: 'BNB Smart Chain',
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        explorerUrl: 'https://bscscan.com',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    },
};

export const POPULAR_TOKENS: Record<NetworkId, Omit<Token, 'balance' | 'balanceUSD' | 'priceUSD'>[]> = {
    '1': [
        { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18, logoURI: 'https://token-icons.s3.amazonaws.com/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png', networkId: '1' },
        { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin', symbol: 'USDC', decimals: 6, logoURI: 'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png', networkId: '1' },
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether USD', symbol: 'USDT', decimals: 6, logoURI: 'https://token-icons.s3.amazonaws.com/0xdac17f958d2ee523a2206206994597c13d831ec7.png', networkId: '1' },
        { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18, logoURI: 'https://token-icons.s3.amazonaws.com/0x6b175474e89094c44da98b954eedeac495271d0f.png', networkId: '1' },
    ],
    '137': [
        { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', name: 'Wrapped Matic', symbol: 'WMATIC', decimals: 18, logoURI: 'https://token-icons.s3.amazonaws.com/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270.png', networkId: '137' },
        { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', name: 'USD Coin (PoS)', symbol: 'USDC', decimals: 6, logoURI: 'https://token-icons.s3.amazonaws.com/0x2791bca1f2de4661ed88a30c99a7a9449aa84174.png', networkId: '137' },
    ],
    '42161': [],
    '10': [],
    '56': [],
};

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_KEY';
export const OPENSEA_API_KEY = 'YOUR_OPENSEA_API_KEY';
export const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
export const IPFS_GATEWAY_URL = 'https://ipfs.io/ipfs/';
export const DEFAULT_THEME: Theme = 'dark';
export const APP_NAME = 'The New Dominion';

// =================================================================================================
// 3. MOCK LIBRARIES AND APIs
// To make this a single file, I'll mock external dependencies. In a real app, these would be separate files.
// =================================================================================================

/**
 * Mock implementation of the ethers.js library to avoid external dependencies.
 */
export const mockEthers = {
    providers: {
        Web3Provider: class {
            provider: any;
            constructor(provider: any) {
                this.provider = provider;
            }
            getSigner = () => ({
                getAddress: async () => '0x1234567890123456789012345678901234567890',
            });
            getNetwork = async () => ({ chainId: 1 });
            getBalance = async (address: string) => ({
                toString: () => '1000000000000000000', // 1 ETH
            });
            lookupAddress = async (address: string) => 'vitalik.eth';
        },
    },
    utils: {
        formatEther: (wei: any) => (parseInt(wei.toString()) / 1e18).toFixed(4),
        parseEther: (eth: string) => (parseFloat(eth) * 1e18).toString(),
        getAddress: (address: string) => address, // Basic validation
    },
    Contract: class {
        constructor(address: string, abi: any, signerOrProvider: any) {}
        // Mock contract methods
        balanceOf = async (address: string) => ({ toString: () => '50000000000000000000' }); // 50 tokens
        mint = async (to: string, uri: string) => ({
            hash: '0x_MOCK_TX_HASH_' + Date.now(),
            wait: async () => ({ status: 1, transactionHash: '0x_MOCK_TX_HASH_' + Date.now() }),
        });
    },
};


/**
 * Mock API client for CoinGecko.
 */
export const CoinGeckoAPI = {
    getPrice: async (tokenIds: string[]): Promise<Record<string, { usd: number }>> => {
        console.log(`Fetching prices for ${tokenIds.join(', ')}`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
        const prices: Record<string, { usd: number }> = {};
        tokenIds.forEach(id => {
            if (id === 'ethereum') prices[id] = { usd: 3000.50 };
            else if (id === 'usd-coin') prices[id] = { usd: 1.00 };
            else if (id === 'tether') prices[id] = { usd: 0.99 };
            else if (id === 'dai') prices[id] = { usd: 1.01 };
            else if (id === 'matic-network') prices[id] = { usd: 0.75 };
            else prices[id] = { usd: Math.random() * 100 };
        });
        return prices;
    },
    getChartData: async (tokenId: string, days: number): Promise<{ prices: [number, number][] }> => {
        console.log(`Fetching chart data for ${tokenId} for ${days} days`);
        await new Promise(resolve => setTimeout(resolve, 800));
        const prices: [number, number][] = [];
        const now = Date.now();
        let currentPrice = tokenId === 'ethereum' ? 3000 : 100;
        for (let i = 0; i < days * 24; i++) {
            const timestamp = now - (days * 24 - i) * 60 * 60 * 1000;
            currentPrice += (Math.random() - 0.5) * (currentPrice * 0.05);
            prices.push([timestamp, currentPrice]);
        }
        return { prices };
    }
};

/**
 * Mock API client for a service like Alchemy or OpenSea to fetch NFTs.
 */
export const NftAPI = {
    getNftsForOwner: async (ownerAddress: string, networkId: NetworkId): Promise<NFTCollection[]> => {
        console.log(`Fetching NFTs for ${ownerAddress} on network ${networkId}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Return mock data
        if (ownerAddress === '0x1234567890123456789012345678901234567890') {
            return [
                {
                    address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
                    name: 'Bored Ape Yacht Club',
                    symbol: 'BAYC',
                    description: 'A collection of 10,000 unique Bored Ape NFTs.',
                    bannerImageUrl: 'https://i.seadn.io/gae/i5dYZRkVCUK97bfprQ3WXyrT9BnLSZtVKGJlKQ919uaUB0sxbngVCioaiyu9r6snqfi2aaTyIux6DFBTcnKgaUpAbAmZFNOHldKOPHw?w=1920&auto=format',
                    nfts: [
                        { id: '101', collectionAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', name: 'Bored Ape #101', description: 'A cool ape.', imageUrl: 'https://i.seadn.io/gae/lHexKRMpw-aoSyB1WdFBff5yfANLReFxHzt1DOj_sg7mS14yARpuvYcUtsyyx-Nkpk6WTqdOKddy4_zhNgb-jflJ_gCYGUEHE5LveEA?w=500&auto=format', metadataUrl: '...', owner: ownerAddress, attributes: [{trait_type: 'Background', value: 'Blue'}]}
                    ]
                },
                {
                    address: '0xbd3531da5cf5857e7cfaa92426877b022e612cf8',
                    name: 'Pudgy Penguins',
                    symbol: 'PPG',
                    description: 'A collection of 8,888 cute, chubby penguins.',
                    bannerImageUrl: 'https://i.seadn.io/gae/yNi-3_g-Lgglot30nIjsd20jTSnaz_N-mIXwU5s23cUCg_1w_XJ4i_0Y-Vt1L0_d25H7G5QES012O_FDE2-dYh2bMy2Oex2TScgqgw?w=1920&auto=format',
                    nfts: [
                         { id: '202', collectionAddress: '0xbd3531da5cf5857e7cfaa92426877b022e612cf8', name: 'Pudgy Penguin #202', description: 'A fashionable penguin.', imageUrl: 'https://i.seadn.io/gae/VL9wEh3sd-UFSs_zL7abfR43T8E_o7L5y9K4o1i_wI-2sYigi9s4Jd5_DbrvW_s0gC220SshAtW05E-Gk0Ax48sL5f_0PXnMAgY?w=500&auto=format', metadataUrl: '...', owner: ownerAddress, attributes: [{trait_type: 'Skin', value: 'Gray'}, {trait_type: 'Head', value: 'Beanie'}]}
                    ]
                }
            ];
        }
        return [];
    }
}

/**
 * Mock service for IPFS uploads.
 */
export const IPFSService = {
    upload: async (file: File | Blob): Promise<{ ipfsHash: string; ipfsUrl: string }> => {
        console.log(`Uploading ${'name' in file ? file.name : 'data'} to IPFS...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockHash = 'Qm' + Array(44).fill(0).map(() => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 62))).join('');
        return {
            ipfsHash: mockHash,
            ipfsUrl: `${IPFS_GATEWAY_URL}${mockHash}`
        };
    }
}


// =================================================================================================
// 4. STATE MANAGEMENT (Context & Reducer)
// Using React Context and a reducer to manage the complex state of the application.
// =================================================================================================

export type AppState = {
    wallet: WalletState;
    portfolio: Portfolio | null;
    nfts: NFTCollection[] | null;
    virtualCard: VirtualCard | null;
    theme: Theme;
    onRampTxs: OnRampTransaction[];
    cardTxs: VirtualCardTransaction[];
    isLoading: Record<string, boolean>;
    errors: Record<string, string | null>;
};

export type AppAction =
    | { type: 'SET_WALLET_STATE'; payload: Partial<WalletState> }
    | { type: 'CONNECT_WALLET_START' }
    | { type: 'CONNECT_WALLET_SUCCESS'; payload: Omit<WalletState, 'error' | 'isConnected'> }
    | { type: 'CONNECT_WALLET_FAILURE'; payload: string }
    | { type: 'DISCONNECT_WALLET' }
    | { type: 'SET_PORTFOLIO'; payload: Portfolio }
    | { type: 'SET_NFTS'; payload: NFTCollection[] }
    | { type: 'SET_VIRTUAL_CARD'; payload: VirtualCard }
    | { type: 'ADD_ONRAMP_TX'; payload: OnRampTransaction }
    | { type: 'ADD_CARD_TX'; payload: VirtualCardTransaction }
    | { type: 'SET_LOADING'; payload: { key: string; value: boolean } }
    | { type: 'SET_ERROR'; payload: { key: string; value: string | null } }
    | { type: 'TOGGLE_THEME' };

export const initialState: AppState = {
    wallet: {
        isConnected: false,
        address: null,
        ensName: null,
        balance: null,
        network: null,
        provider: null,
        signer: null,
        providerType: null,
        error: null,
    },
    portfolio: null,
    nfts: null,
    virtualCard: {
        id: 'vc_123',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2028,
        brand: 'Visa',
        balance: 1337.42,
        isFrozen: false,
        dailyLimit: 2500,
        monthlyLimit: 10000,
    },
    theme: DEFAULT_THEME,
    onRampTxs: [],
    cardTxs: [],
    isLoading: {},
    errors: {},
};

export function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_WALLET_STATE':
            return { ...state, wallet: { ...state.wallet, ...action.payload } };
        case 'CONNECT_WALLET_START':
            return {
                ...state,
                isLoading: { ...state.isLoading, walletConnection: true },
                errors: { ...state.errors, walletConnection: null },
                wallet: { ...state.wallet, error: null }
            };
        case 'CONNECT_WALLET_SUCCESS':
            return {
                ...state,
                isLoading: { ...state.isLoading, walletConnection: false },
                wallet: { ...state.wallet, ...action.payload, isConnected: true, error: null },
            };
        case 'CONNECT_WALLET_FAILURE':
            return {
                ...state,
                isLoading: { ...state.isLoading, walletConnection: false },
                wallet: { ...initialState.wallet, error: action.payload },
            };
        case 'DISCONNECT_WALLET':
            return { ...state, wallet: initialState.wallet, portfolio: null, nfts: null };
        case 'SET_PORTFOLIO':
            return { ...state, portfolio: action.payload };
        case 'SET_NFTS':
            return { ...state, nfts: action.payload };
        case 'SET_VIRTUAL_CARD':
            return { ...state, virtualCard: action.payload };
        case 'TOGGLE_THEME':
            return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
        case 'SET_LOADING':
            return { ...state, isLoading: { ...state.isLoading, [action.payload.key]: action.payload.value } };
        case 'SET_ERROR':
             return { ...state, errors: { ...state.errors, [action.payload.key]: action.payload.value } };
        default:
            return state;
    }
}

export const AppContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
}>({
    state: initialState,
    dispatch: () => null,
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};


// =================================================================================================
// 5. CUSTOM HOOKS
// Encapsulating logic into reusable hooks.
// =================================================================================================

/**
 * Hook for managing wallet connection and interactions.
 */
export function useWallet() {
    const { state, dispatch } = useContext(AppContext);
    const { wallet } = state;

    const connectWallet = useCallback(async (providerType: WalletProvider) => {
        dispatch({ type: 'CONNECT_WALLET_START' });
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('No crypto wallet found. Please install it.');
            }
            
            // Using mock ethers
            const provider = new mockEthers.providers.Web3Provider(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            const { chainId } = await provider.getNetwork();
            const balanceWei = await provider.getBalance(address);
            const ensName = await provider.lookupAddress(address);

            const networkId = String(chainId) as NetworkId;
            if (!SUPPORTED_NETWORKS[networkId]) {
                throw new Error(`Unsupported network. Please switch to a supported network.`);
            }

            dispatch({
                type: 'CONNECT_WALLET_SUCCESS',
                payload: {
                    address,
                    ensName,
                    balance: balanceWei.toString(),
                    network: SUPPORTED_NETWORKS[networkId],
                    provider,
                    signer,
                    providerType,
                },
            });

            // Set up event listeners
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else {
                    connectWallet(providerType);
                }
            });

            window.ethereum.on('chainChanged', (newChainId: string) => {
                window.location.reload();
            });

        } catch (error: any) {
            dispatch({ type: 'CONNECT_WALLET_FAILURE', payload: error.message });
        }
    }, [dispatch]);

    const disconnectWallet = useCallback(() => {
        dispatch({ type: 'DISCONNECT_WALLET' });
        if (window.ethereum?.removeListener) {
            window.ethereum.removeListener('accountsChanged', ()=>{});
            window.ethereum.removeListener('chainChanged', ()=>{});
        }

    }, [dispatch]);
    
    const signMessage = useCallback(async (message: string): Promise<string> => {
        if (!wallet.signer) throw new Error("Wallet not connected");
        return await wallet.signer.signMessage(message);
    }, [wallet.signer]);

    return { ...wallet, connectWallet, disconnectWallet, signMessage };
}

/**
 * Hook to manage and fetch portfolio data.
 */
export function usePortfolio() {
    const { state, dispatch } = useContext(AppContext);
    const { wallet } = state;

    const fetchPortfolio = useCallback(async () => {
        if (!wallet.isConnected || !wallet.address || !wallet.network) return;

        dispatch({ type: 'SET_LOADING', payload: { key: 'portfolio', value: true } });
        try {
            const nativeBalance = parseFloat(mockEthers.utils.formatEther(wallet.balance || '0'));
            
            const tokenDefs = POPULAR_TOKENS[wallet.network.id];
            const tokenBalances = await Promise.all(tokenDefs.map(async (tokenDef) => {
                const mockContract = new mockEthers.Contract(tokenDef.address, [], wallet.provider);
                const balanceWei = await mockContract.balanceOf(wallet.address!);
                return { ...tokenDef, balance: balanceWei.toString() };
            }));

            const priceIds = ['ethereum', 'usd-coin', 'matic-network', 'dai', 'tether'];
            const prices = await CoinGeckoAPI.getPrice(priceIds);

            let totalValueUSD = 0;
            const nativePrice = prices['ethereum']?.usd || 0;
            totalValueUSD += nativeBalance * nativePrice;

            const tokens: Token[] = tokenBalances.map(tb => {
                const priceKey = tb.symbol === 'USDC' ? 'usd-coin' : tb.symbol === 'DAI' ? 'dai' : 'tether';
                const price = prices[priceKey]?.usd || 0;
                const balance = parseFloat(tb.balance) / (10 ** tb.decimals);
                const balanceUSD = balance * price;
                totalValueUSD += balanceUSD;
                return { ...tb, priceUSD: price, balanceUSD };
            });

            tokens.unshift({
                address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                name: wallet.network.nativeCurrency.name,
                symbol: wallet.network.nativeCurrency.symbol,
                decimals: 18,
                logoURI: '',
                balance: wallet.balance!,
                balanceUSD: nativeBalance * nativePrice,
                priceUSD: nativePrice,
                networkId: wallet.network.id
            });
            
            const chartData = await CoinGeckoAPI.getChartData('ethereum', 30);
            const historicalData = chartData.prices.map(([timestamp, value]) => ({ timestamp, value: value * nativeBalance }));

            dispatch({
                type: 'SET_PORTFOLIO',
                payload: { totalValueUSD, tokens, historicalData },
            });

        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: { key: 'portfolio', value: error.message } });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: { key: 'portfolio', value: false } });
        }
    }, [wallet, dispatch]);
    
    useEffect(() => {
        if (wallet.isConnected) {
            fetchPortfolio();
        }
    }, [wallet.isConnected, fetchPortfolio]);

    return { portfolio: state.portfolio, isLoading: state.isLoading.portfolio, error: state.errors.portfolio, refetch: fetchPortfolio };
}


/**
 * Hook to manage and fetch NFT data.
 */
export function useNFTs() {
    const { state, dispatch } = useContext(AppContext);
    const { wallet } = state;

    const fetchNFTs = useCallback(async () => {
        if (!wallet.isConnected || !wallet.address || !wallet.network) return;
        
        dispatch({ type: 'SET_LOADING', payload: { key: 'nfts', value: true } });
        try {
            const collections = await NftAPI.getNftsForOwner(wallet.address, wallet.network.id);
            dispatch({ type: 'SET_NFTS', payload: collections });
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: { key: 'nfts', value: error.message } });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: { key: 'nfts', value: false } });
        }
    }, [wallet, dispatch]);

    useEffect(() => {
        if (wallet.isConnected) {
            fetchNFTs();
        }
    }, [wallet.isConnected, fetchNFTs]);

    return { nfts: state.nfts, isLoading: state.isLoading.nfts, error: state.errors.nfts, refetch: fetchNFTs };
}


/**
 * Hook for using the theme.
 */
export function useTheme() {
    const { state, dispatch } = useContext(AppContext);
    const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), [dispatch]);
    return { theme: state.theme, toggleTheme };
}

/**
 * Hook for managing application settings.
 */
export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>({
        defaultFiatCurrency: 'USD',
        slippageTolerance: 0.5,
        rpcPreferences: {
            '1': SUPPORTED_NETWORKS['1'].rpcUrl,
            '137': SUPPORTED_NETWORKS['137'].rpcUrl,
            '10': SUPPORTED_NETWORKS['10'].rpcUrl,
            '56': SUPPORTED_NETWORKS['56'].rpcUrl,
            '42161': SUPPORTED_NETWORKS['42161'].rpcUrl
        },
    });
    
    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };
    
    return { settings, updateSettings };
}


// =================================================================================================
// 6. UTILITY FUNCTIONS
// Helper functions used throughout the application.
// =================================================================================================

/**
 * Shortens a wallet address.
 * @param address The full address.
 * @param chars The number of characters to show at the start and end.
 * @returns The shortened address.
 */
export function shortenAddress(address: string, chars = 4): string {
    if (!address) return '';
    const prefix = address.substring(0, chars + 2); // 0x...
    const suffix = address.substring(address.length - chars);
    return `${prefix}...${suffix}`;
}

/**
 * Formats a number as a currency string.
 * @param value The number to format.
 * @param currency The currency code.
 * @returns The formatted currency string.
 */
export function formatCurrency(value: number, currency: FiatCurrency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Formats a large number with abbreviations (K, M, B).
 * @param num The number to format.
 * @returns The formatted string.
 */
export function formatBigNumber(num: number): string {
    if (num < 1000) return num.toFixed(2);
    if (num < 1_000_000) return `${(num / 1000).toFixed(2)}K`;
    if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    return `${(num / 1_000_000_000).toFixed(2)}B`;
}

/**
 * Debounces a function.
 * @param func The function to debounce.
 * @param delay The debounce delay in ms.
 * @returns The debounced function.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (...args: Parameters<T>) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}


// =================================================================================================
// 7. UI COMPONENTS
// Building blocks for the main view. Defined in one file for this exercise.
// =================================================================================================

// --- Base Components ---

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeMap = { sm: '1.5rem', md: '3rem', lg: '5rem' };
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
        }}>
            <div style={{
                border: `4px solid rgba(255, 255, 255, 0.3)`,
                borderTopColor: '#3498db',
                borderRadius: '50%',
                width: sizeMap[size],
                height: sizeMap[size],
                animation: 'spin 1s linear infinite',
            }} />
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ children, variant = 'primary', style, ...props }) => {
    const baseStyle: React.CSSProperties = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'background-color 0.2s, transform 0.1s',
    };
    const variantStyle: React.CSSProperties = variant === 'primary' ? {
        backgroundColor: '#3498db',
        color: 'white',
    } : {
        backgroundColor: '#4a4a4a',
        color: 'white',
        border: '1px solid #666',
    };

    return <button style={{ ...baseStyle, ...variantStyle, ...style }} {...props}>{children}</button>;
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }} onClick={onClose}>
            <div style={{
                backgroundColor: '#2c2c2c',
                padding: '2rem',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'white', cursor: 'pointer' }}>&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export const Card: React.FC<{ children: React.ReactNode, style?: React.CSSProperties }> = ({ children, style }) => {
    return (
        <div style={{
            backgroundColor: 'rgba(44, 44, 44, 0.8)',
            border: '1px solid #444',
            borderRadius: '12px',
            padding: '1.5rem',
            backdropFilter: 'blur(10px)',
            ...style
        }}>
            {children}
        </div>
    );
}

// --- App-specific Components ---

export const WalletConnector: React.FC = () => {
    const { isConnected, address, balance, isLoading, connectWallet, disconnectWallet } = useWallet();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    if (isLoading.walletConnection) {
        return <Button disabled>Connecting...</Button>;
    }
    
    if (isConnected && address) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    backgroundColor: '#333',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span>{parseFloat(mockEthers.utils.formatEther(balance || '0')).toFixed(4)} ETH</span>
                    <span style={{ color: '#aaa' }}>|</span>
                    <span>{shortenAddress(address)}</span>
                </div>
                <Button onClick={disconnectWallet} variant="secondary">Disconnect</Button>
            </div>
        );
    }

    return (
        <>
            <Button onClick={() => setIsModalOpen(true)}>Connect Wallet</Button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Connect your wallet">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Button onClick={() => connectWallet('metamask')}>Connect MetaMask</Button>
                    <Button onClick={() => alert('WalletConnect not implemented yet.')} disabled>Connect with WalletConnect</Button>
                    {name && <p style={{ color: 'red', textAlign: 'center' }}>{name}</p>}
                </div>
            </Modal>
        </>
    );
};

export const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            borderBottom: '1px solid #444',
        }}>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{APP_NAME}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={toggleTheme} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem'}}>
                    {theme === 'light' ? '🌞' : '🌜'}
                </button>
                <WalletConnector />
            </div>
        </header>
    );
};

// =================================================================================================
// 8. TABBED VIEWS
// The core content of the dashboard, split into different views.
// =================================================================================================

// --- Portfolio View ---
export const PortfolioView: React.FC = () => {
    const { portfolio, isLoading, error } = usePortfolio();

    if (isLoading) return <Spinner />;
    if (error) return <Card><p style={{color: 'red'}}>Error loading portfolio: {error}</p></Card>;
    if (!portfolio) return <Card><p>No portfolio data available. Connect your wallet to see your assets.</p></Card>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card>
                <h2>Portfolio Overview</h2>
                <p style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>{formatCurrency(portfolio.totalValueUSD)}</p>
                <div style={{ height: '300px', color: 'white' }}>
                    <div style={{ border: '1px solid #555', borderRadius: '8px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222'}}>
                        [Portfolio Chart Placeholder]
                    </div>
                </div>
            </Card>
            <Card>
                <h2>Assets</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Asset</th>
                            <th style={tableHeaderStyle}>Price</th>
                            <th style={tableHeaderStyle}>Balance</th>
                            <th style={tableHeaderStyle}>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {portfolio.tokens.map(token => (
                            <tr key={token.address} style={{ borderBottom: '1px solid #444' }}>
                                <td style={tableCellStyle}>{token.name} ({token.symbol})</td>
                                <td style={tableCellStyle}>{formatCurrency(token.priceUSD)}</td>
                                <td style={tableCellStyle}>{(parseFloat(token.balance) / (10 ** token.decimals)).toFixed(4)}</td>
                                <td style={tableCellStyle}>{formatCurrency(token.balanceUSD)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
const tableHeaderStyle: React.CSSProperties = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #555' };
const tableCellStyle: React.CSSProperties = { padding: '12px', textAlign: 'left' };


// --- On-Ramp View ---
export const OnRampView: React.FC = () => {
    const [fiatAmount, setFiatAmount] = useState('100');
    const [cryptoAmount, setCryptoAmount] = useState('0.033');
    const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>('ETH');
    const { wallet } = useWallet();

    const handleBuy = () => {
        if (!wallet.isConnected) {
            alert('Please connect your wallet first.');
            return;
        }
        alert(`Initiating purchase of ${cryptoAmount} ${selectedCrypto} for $${fiatAmount} to address ${wallet.address}`);
    }

    return (
        <Card>
            <h2>Buy Crypto</h2>
            <p>Purchase digital assets directly with your card via Stripe.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: 'auto' }}>
                <div>
                    <label>You pay</label>
                    <div style={{ display: 'flex' }}>
                        <input
                            type="number"
                            value={fiatAmount}
                            onChange={e => setFiatAmount(e.target.value)}
                            style={inputStyle}
                        />
                         <select value="USD" style={selectStyle}>
                            <option>USD</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label>You receive</label>
                    <div style={{ display: 'flex' }}>
                        <input
                            type="number"
                            value={cryptoAmount}
                            onChange={e => setCryptoAmount(e.target.value)}
                            style={inputStyle}
                        />
                        <select
                            value={selectedCrypto}
                            onChange={e => setSelectedCrypto(e.target.value as CryptoCurrency)}
                            style={selectStyle}
                        >
                            <option>ETH</option>
                            <option>USDC</option>
                            <option>MATIC</option>
                        </select>
                    </div>
                </div>
                <p style={{fontSize: '0.9rem', color: '#aaa'}}>Rate: 1 ETH ≈ $3000 USD (includes fees)</p>
                <Button onClick={handleBuy}>Buy Now</Button>
            </div>
        </Card>
    );
};
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', backgroundColor: '#333', border: '1px solid #555', borderRadius: '8px 0 0 8px', color: 'white', fontSize: '1rem' };
const selectStyle: React.CSSProperties = { padding: '12px', backgroundColor: '#333', border: '1px solid #555', borderLeft: 'none', borderRadius: '0 8px 8px 0', color: 'white', fontSize: '1rem', cursor: 'pointer' };


// --- NFT Gallery View ---
export const NftGalleryView: React.FC = () => {
    const { nfts, isLoading, error } = useNFTs();
    const [selectedNft, setSelectedNft] = useState<NFT | null>(null);

    if (isLoading) return <Spinner />;
    if (error) return <Card><p style={{color: 'red'}}>Error loading NFTs: {error}</p></Card>;
    if (!nfts || nfts.length === 0) return <Card><p>No NFTs found in your wallet.</p></Card>;

    return (
        <>
            <NftDetailModal nft={selectedNft} onClose={() => setSelectedNft(null)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {nfts.map(collection => (
                    <Card key={collection.address}>
                        <h3>{collection.name}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {collection.nfts.map(nft => (
                                <div key={nft.id} onClick={() => setSelectedNft(nft)} style={{ border: '1px solid #555', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}>
                                    <img src={nft.imageUrl} alt={nft.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                    <div style={{ padding: '1rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0' }}>{nft.name}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </>
    );
};

// --- Mint NFT View ---
export const MintNftView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isMinting, setIsMinting] = useState(false);
    const [mintStatus, setMintStatus] = useState('');
    const [txHash, setTxHash] = useState<string | null>(null);
    const { wallet } = useWallet();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };
    
    const handleMint = async () => {
        if (!file || !name || !description) {
            alert('Please fill all fields and select an image.');
            return;
        }
        if (!wallet.isConnected || !wallet.signer || !wallet.address) {
            alert('Please connect your wallet first.');
            return;
        }

        setIsMinting(true);
        setTxHash(null);
        try {
            setMintStatus('Uploading image to IPFS...');
            const imageUploadResult = await IPFSService.upload(file);
            console.log('Image uploaded:', imageUploadResult.ipfsUrl);

            setMintStatus('Uploading metadata to IPFS...');
            const metadata = { name, description, image: imageUploadResult.ipfsUrl };
            const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
            const metadataUploadResult = await IPFSService.upload(metadataBlob);
            console.log('Metadata uploaded:', metadataUploadResult.ipfsUrl);

            setMintStatus('Sending transaction to the network...');
            const MOCK_NFT_CONTRACT_ADDRESS = '0x_MOCK_NFT_CONTRACT_';
            const nftContract = new mockEthers.Contract(MOCK_NFT_CONTRACT_ADDRESS, [], wallet.signer);
            const tx = await nftContract.mint(wallet.address, metadataUploadResult.ipfsUrl);
            setMintStatus('Waiting for transaction confirmation...');
            const receipt = await tx.wait();

            setMintStatus('NFT Minted Successfully!');
            setTxHash(receipt.transactionHash);

        } catch (error: any) {
            setMintStatus(`Error: ${error.message}`);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <Card>
            <h2>Create Your Own NFT</h2>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <label>Image</label>
                    <div style={{ width: '100%', height: '250px', border: '2px dashed #555', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#222', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%' }} />
                        {preview ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <p>Click to upload</p>}
                    </div>
                </div>
                <div style={{ flex: 2, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label htmlFor="nftName">Name</label>
                        <input id="nftName" type="text" value={name} onChange={e => setName(e.target.value)} style={{...inputStyle, borderRadius: '8px'}} />
                    </div>
                    <div>
                        <label htmlFor="nftDesc">Description</label>
                        <textarea id="nftDesc" value={description} onChange={e => setDescription(e.target.value)} style={{...inputStyle, borderRadius: '8px', minHeight: '100px', resize: 'vertical' }} />
                    </div>
                    <Button onClick={handleMint} disabled={isMinting}>
                        {isMinting ? 'Minting...' : 'Mint NFT'}
                    </Button>
                    {mintStatus && <p>{mintStatus}</p>}
                    {txHash && <p>Success! <a href={`${wallet.network?.explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">View on Explorer</a></p>}
                </div>
            </div>
        </Card>
    );
};


// --- Virtual Card View ---
export const VirtualCardView: React.FC = () => {
    const { state } = useContext(AppContext);
    const card = state.virtualCard;

    if (!card) return <Card><p>No virtual card found.</p></Card>;

    return (
        <Card>
            <h2>Virtual Card</h2>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                    width: '320px',
                    height: '200px',
                    borderRadius: '12px',
                    background: 'linear-gradient(45deg, #4e54c8, #8f94fb)',
                    padding: '1.5rem',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: 'monospace',
                    flexShrink: 0
                }}>
                    <div>
                        <p style={{textAlign: 'right', margin: 0, fontSize: '1.2rem'}}>VISA</p>
                    </div>
                    <div>
                        <p style={{fontSize: '1.5rem', margin: '1rem 0', letterSpacing: '2px'}}>**** **** **** {card.last4}</p>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <p style={{margin: 0}}>JOHN DOE</p>
                            <p style={{margin: 0}}>EXP: {card.expiryMonth}/{card.expiryYear % 100}</p>
                        </div>
                    </div>
                </div>
                <div style={{flex: 1}}>
                    <h3>Card Details</h3>
                    <p><strong>Balance:</strong> {formatCurrency(card.balance)}</p>
                    <p><strong>Status:</strong> <span style={{color: card.isFrozen ? 'orange' : 'lightgreen'}}>{card.isFrozen ? 'Frozen' : 'Active'}</span></p>
                    <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                        <Button variant='secondary'>Top Up</Button>
                        <Button variant='secondary'>{card.isFrozen ? 'Unfreeze' : 'Freeze'}</Button>
                        <Button variant='secondary'>Settings</Button>
                    </div>
                </div>
            </div>
            <div style={{marginTop: '2rem'}}>
                <h3>Recent Transactions</h3>
                <ul style={{listStyle: 'none', padding: 0}}>
                    <li style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #444'}}>
                        <span>Amazon Purchase</span><span>- {formatCurrency(49.99)}</span>
                    </li>
                    <li style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #444'}}>
                        <span>Starbucks</span><span>- {formatCurrency(5.75)}</span>
                    </li>
                     <li style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #444'}}>
                        <span>Top-up from USDC</span><span style={{color: 'lightgreen'}}>+ {formatCurrency(200.00)}</span>
                    </li>
                </ul>
            </div>
        </Card>
    );
};

// --- Swap View ---
export const SwapView: React.FC = () => {
    const { portfolio } = usePortfolio();
    const [fromToken, setFromToken] = useState<Token | null>(portfolio?.tokens[0] || null);
    const [toToken, setToToken] = useState<Token | null>(portfolio?.tokens[1] || null);
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [isSwapping, setIsSwapping] = useState(false);
    const [swapStatus, setSwapStatus] = useState('');
    
    const fetchQuote = useCallback(debounce(async (amount: string, from: Token, to: Token) => {
        if (!amount || parseFloat(amount) <= 0) {
            setToAmount('');
            return;
        }
        console.log(`Fetching quote for ${amount} ${from.symbol} to ${to.symbol}`);
        await new Promise(res => setTimeout(res, 500));
        const fromPrice = from.priceUSD;
        const toPrice = to.priceUSD;
        const estimatedToAmount = (parseFloat(amount) * fromPrice) / toPrice * 0.995;
        setToAmount(estimatedToAmount.toFixed(6));
    }, 500), []);
    
    useEffect(() => {
        if (fromAmount && fromToken && toToken) {
            fetchQuote(fromAmount, fromToken, toToken);
        }
    }, [fromAmount, fromToken, toToken, fetchQuote]);
    
    const handleSwap = async () => {
        setIsSwapping(true);
        setSwapStatus('Executing swap...');
        await new Promise(res => setTimeout(res, 3000));
        setSwapStatus('Swap successful!');
        setIsSwapping(false);
    };

    if (!portfolio || portfolio.tokens.length < 2) {
        return <Card><p>You need at least two different tokens to swap.</p></Card>
    }

    const TokenSelector = ({ selectedToken, onSelect, tokens }: { selectedToken: Token | null, onSelect: (token: Token) => void, tokens: Token[] }) => {
        return (
            <select
                value={selectedToken?.address}
                onChange={(e) => {
                    const token = tokens.find(t => t.address === e.target.value);
                    if (token) onSelect(token);
                }}
                style={{ ...selectStyle, width: '120px' }}
            >
                {tokens.map(t => <option key={t.address} value={t.address}>{t.symbol}</option>)}
            </select>
        );
    }

    return (
        <Card>
            <h2>Token Swap</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '450px', margin: 'auto' }}>
                <div style={{ border: '1px solid #555', borderRadius: '8px', padding: '1rem' }}>
                    <label>From</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input type="number" value={fromAmount} onChange={e => setFromAmount(e.target.value)} style={{...inputStyle, border: 'none'}} placeholder="0.0" />
                        <TokenSelector selectedToken={fromToken} onSelect={setFromToken} tokens={portfolio.tokens} />
                    </div>
                </div>
                 <div style={{ textAlign: 'center' }}>&#x2193;</div>
                <div style={{ border: '1px solid #555', borderRadius: '8px', padding: '1rem' }}>
                    <label>To (estimated)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input type="number" value={toAmount} readOnly style={{...inputStyle, border: 'none', background: 'transparent'}} placeholder="0.0" />
                        <TokenSelector selectedToken={toToken} onSelect={setToToken} tokens={portfolio.tokens} />
                    </div>
                </div>
                <Button onClick={handleSwap} disabled={isSwapping || !fromAmount || !toAmount}>
                    {isSwapping ? 'Swapping...' : 'Swap'}
                </Button>
                {swapStatus && <p style={{textAlign: 'center'}}>{swapStatus}</p>}
            </div>
        </Card>
    );
};

// --- Transaction History View ---
export const TransactionHistoryView: React.FC = () => {
    const { wallet } = useWallet();
    const [transactions, setTransactions] = useState<GenericTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const fetchTransactions = useCallback(async () => {
        if (!wallet.address || !wallet.network) return;
        setIsLoading(true);
        await new Promise(res => setTimeout(res, 1000));
        setTransactions([
            { hash: '0xabc...', timestamp: Date.now() - 1000*60*5, networkId: wallet.network.id, type: 'swap', status: 'confirmed', details: { from: 'ETH', to: 'USDC', amount: 0.5 }},
            { hash: '0xdef...', timestamp: Date.now() - 1000*60*60*2, networkId: wallet.network.id, type: 'receive', status: 'confirmed', details: { from: '0xsender...', amount: 100, tokenSymbol: 'DAI' }},
            { hash: '0xghi...', timestamp: Date.now() - 1000*60*60*24, networkId: wallet.network.id, type: 'mint', status: 'confirmed', details: { nftName: 'My First NFT' }},
            { hash: '0xjkl...', timestamp: Date.now() - 1000*60*60*25, networkId: wallet.network.id, type: 'send', status: 'failed', details: { to: '0xreceiver...', amount: 1000, tokenSymbol: 'USDT' }},
        ]);
        setIsLoading(false);
    }, [wallet.address, wallet.network]);
    
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const renderTxIcon = (type: TransactionType) => {
        switch (type) {
            case 'send': return '📤';
            case 'receive': return '📥';
            case 'swap': return '🔄';
            case 'mint': return '🎨';
            default: return '📄';
        }
    };

    const renderTxDetails = (tx: GenericTransaction) => {
        switch (tx.type) {
            case 'swap': return `Swapped ${tx.details.amount} ${tx.details.from} for ${tx.details.to}`;
            case 'receive': return `Received ${tx.details.amount} ${tx.details.tokenSymbol} from ${shortenAddress(tx.details.from)}`;
            case 'send': return `Sent ${tx.details.amount} ${tx.details.tokenSymbol} to ${shortenAddress(tx.details.to)}`;
            case 'mint': return `Minted NFT "${tx.details.nftName}"`;
            default: return 'Generic transaction';
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <Card>
            <h2>Transaction History</h2>
            <ul style={{listStyle: 'none', padding: 0}}>
                {transactions.map(tx => (
                    <li key={tx.hash} style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #444'}}>
                        <div style={{fontSize: '1.5rem', backgroundColor: '#333', padding: '10px', borderRadius: '50%'}}>{renderTxIcon(tx.type)}</div>
                        <div style={{flex: 1}}>
                            <p style={{margin: 0, fontWeight: 'bold'}}>{renderTxDetails(tx)}</p>
                            <p style={{margin: '4px 0 0', fontSize: '0.9rem', color: '#aaa'}}>{new Date(tx.timestamp).toLocaleString()}</p>
                        </div>
                        <div>
                            <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', color: 'white', background: tx.status === 'confirmed' ? 'green' : tx.status === 'failed' ? 'red' : 'orange' }}>
                                {tx.status}
                            </span>
                        </div>
                        <a href={`${wallet.network?.explorerUrl}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" style={{color: '#3498db'}}>&#x2197;</a>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

// --- Settings View ---
export const SettingsView: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    
    return (
        <Card>
            <h2>Settings</h2>
            <div style={{maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div>
                    <label>Default Fiat Currency</label>
                    <select
                        value={settings.defaultFiatCurrency}
                        onChange={(e) => updateSettings({ defaultFiatCurrency: e.target.value as FiatCurrency })}
                        style={{ ...selectStyle, borderRadius: '8px', border: '1px solid #555', width: '100%' }}
                    >
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                    </select>
                </div>
                <div>
                    <label>Slippage Tolerance for Swaps (%)</label>
                    <input
                        type="number"
                        value={settings.slippageTolerance}
                        onChange={(e) => updateSettings({ slippageTolerance: parseFloat(e.target.value) })}
                        style={{ ...inputStyle, borderRadius: '8px', width: '100%' }}
                    />
                </div>
                 <div>
                    <label>Custom RPC URL (Ethereum Mainnet)</label>
                    <input
                        type="text"
                        value={settings.rpcPreferences['1']}
                        onChange={(e) => updateSettings({ rpcPreferences: { ...settings.rpcPreferences, '1': e.target.value }})}
                        style={{ ...inputStyle, borderRadius: '8px', width: '100%' }}
                    />
                </div>
                <Button>Save Settings</Button>
            </div>
        </Card>
    );
};

// --- NFT Detail Modal ---
export const NftDetailModal: React.FC<{ nft: NFT | null; onClose: () => void }> = ({ nft, onClose }) => {
    if (!nft) return null;
    
    return (
        <Modal isOpen={!!nft} onClose={onClose} title={nft.name}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <img src={nft.imageUrl} alt={nft.name} style={{ width: '100%', borderRadius: '8px' }} />
                <p>{nft.description}</p>
                <h4>Attributes</h4>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                    {nft.attributes.map(attr => (
                        <div key={attr.trait_type} style={{backgroundColor: '#444', padding: '8px', borderRadius: '4px', textAlign: 'center'}}>
                            <p style={{margin: 0, fontSize: '0.8rem', color: '#aaa'}}>{attr.trait_type}</p>
                            <p style={{margin: '4px 0 0', fontWeight: 'bold'}}>{attr.value}</p>
                        </div>
                    ))}
                </div>
                <Button onClick={() => alert('Transfer not implemented.')}>Transfer NFT</Button>
            </div>
        </Modal>
    );
};

// =================================================================================================
// 9. MAIN COMPONENT (`CryptoView`)
// This component ties everything together.
// =================================================================================================
export const CryptoView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('portfolio');
    const { isConnected } = useWallet();

    const renderTabContent = () => {
        if (!isConnected) {
            return (
                <Card style={{textAlign: 'center', padding: '4rem'}}>
                    <h2>Welcome to the New Dominion</h2>
                    <p>Connect your wallet to enter the new frontier of finance.</p>
                </Card>
            );
        }
        switch (activeTab) {
            case 'portfolio': return <PortfolioView />;
            case 'onramp': return <OnRampView />;
            case 'card': return <VirtualCardView />;
            case 'nfts': return <NftGalleryView />;
            case 'mint': return <MintNftView />;
            case 'swap': return <SwapView />;
            case 'history': return <TransactionHistoryView />;
            case 'settings': return <SettingsView />;
            default: return <PortfolioView />;
        }
    };
    
    const TabButton: React.FC<{ tabId: Tab, children: React.ReactNode }> = ({ tabId, children }) => {
        const isActive = activeTab === tabId;
        return (
            <button
                onClick={() => setActiveTab(tabId)}
                style={{
                    padding: '10px 20px',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #3498db' : '2px solid transparent',
                    color: isActive ? '#3498db' : 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                }}
            >
                {children}
            </button>
        );
    }

    return (
        <div style={{
            backgroundColor: '#1a1a1a',
            color: 'white',
            minHeight: '100vh',
            fontFamily: 'sans-serif',
        }}>
            <Header />
            <main style={{ padding: '2rem' }}>
                <nav style={{ marginBottom: '2rem', borderBottom: '1px solid #444', display: 'flex', flexWrap: 'wrap' }}>
                    <TabButton tabId="portfolio">Portfolio</TabButton>
                    <TabButton tabId="swap">Swap</TabButton>
                    <TabButton tabId="onramp">On-Ramp</TabButton>
                    <TabButton tabId="card">Virtual Card</TabButton>
                    <TabButton tabId="nfts">NFT Gallery</TabButton>
                    <TabButton tabId="mint">Mint NFT</TabButton>
                    <TabButton tabId="history">History</TabButton>
                    <TabButton tabId="settings">Settings</TabButton>
                </nav>
                {renderTabContent()}
            </main>
        </div>
    );
};


// =================================================================================================
// 10. WRAPPER COMPONENT
// The main export that includes the provider.
// =================================================================================================
export const CryptoViewWrapper: React.FC = () => {
    return (
        <AppProvider>
            <CryptoView />
        </AppProvider>
    );
};

export default CryptoViewWrapper;