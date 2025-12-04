import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import Card from '../../../Card';
import { GoogleGenAI, Type } from "@google/genai";
import { FaDollarSign, FaEthereum, FaClock, FaExchangeAlt, FaBurn, FaPlayCircle, FaPauseCircle, FaGraduationCap, FaNetworkWired, FaCode, FaChartLine, FaCloudDownloadAlt, FaFileCode, FaLock, FaGlobe, FaCogs, FaProjectDiagram, FaBalanceScale, FaUsers, FaHandshake, FaChartBar, FaWallet, FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaBell } from 'react-icons/fa';

// --- Shared Types and Interfaces ---

export interface TokenConfig {
    id: string; // Unique ID for this token configuration
    name: string;
    symbol: string;
    description: string;
    type: 'ERC-20' | 'ERC-721' | 'ERC-1155' | 'Custom';
    totalSupply: number;
    decimals: number;
    initialSupply?: number; // For ERC-20, if different from total supply initially minted
    contractURI?: string; // For ERC-721/1155 metadata
    baseTokenURI?: string;
    logoUrl?: string;
    websiteUrl?: string;
    socialLinks: { twitter?: string; telegram?: string; discord?: string; github?: string; };
    features: {
        mintable: boolean;
        burnable: boolean;
        pausable: boolean;
        upgradable: boolean; // ERC-1967 Proxy
        snapshots: boolean;
        permit: boolean; // EIP-2612
        flashMint?: boolean; // ERC-3156
        erc1363?: boolean; // ERC-1363 payable token
        governanceModule?: boolean; // Placeholder for integration with governance contracts
    };
    aiGeneratedNotes?: string;
}

export type AllocationType = 'Team' | 'Investors (Seed)' | 'Investors (Private)' | 'Investors (Public)' | 'Ecosystem' | 'Treasury' | 'Advisors' | 'Marketing' | 'Liquidity' | 'Staking Rewards' | 'Community' | 'Airdrop';

export interface VestingSchedule {
    id: string; // Unique ID for this vesting schedule
    amount: number;
    cliff: number; // In months
    duration: number; // Total vesting duration in months
    releaseFrequency: 'monthly' | 'quarterly' | 'daily' | 'linear';
    startDate: string; // YYYY-MM-DD
    recipientAddresses: string[];
    description?: string;
}

export interface TokenAllocation {
    type: AllocationType;
    percentage: number;
    amount: number; // Calculated based on total supply
    vestingSchedule?: VestingSchedule;
    isLocked?: boolean; // If allocated tokens are initially locked without a vesting schedule
    lockUntil?: string; // YYYY-MM-DD
    details?: string;
}

export interface NetworkConfig {
    id: string;
    name: string;
    chainId: number;
    rpcUrl: string;
    blockExplorerUrl: string;
    isCustom?: boolean;
}

export interface DeploymentConfig {
    network: NetworkConfig;
    ownerAddress: string;
    gasPriceStrategy: 'standard' | 'fast' | 'custom';
    customGasPriceGwei?: number;
    frontRunProtection: boolean;
    proxyAdminAddress?: string; // For upgradable contracts
    salt?: string; // For create2 deployments
}

export interface DeploymentStatus {
    id: string;
    timestamp: string;
    status: 'pending' | 'deploying' | 'verifying' | 'completed' | 'failed';
    transactionHash?: string;
    contractAddress?: string;
    blockNumber?: number;
    error?: string;
    networkId: string;
    tokenConfigId: string;
}

export interface AirdropCampaign {
    id: string;
    name: string;
    tokenAddress: string;
    snapshotBlockNumber?: number;
    recipients: { address: string; amount: number; }[];
    totalAirdropAmount: number;
    status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
    scheduleDate?: string; // YYYY-MM-DD
    transactionHash?: string;
    description?: string;
    proofGenerationType: 'merkleTree' | 'directTransfer';
}

export interface GovernanceProposal {
    id: string;
    title: string;
    description: string;
    proposer: string;
    status: 'pending' | 'active' | 'executed' | 'defeated' | 'cancelled';
    startTime: string;
    endTime: string;
    snapshotBlock: number;
    quorum: number; // percentage
    threshold: number; // percentage
    votesFor: number;
    votesAgainst: number;
    votesAbstain: number;
    executedTransaction?: string;
}

export interface TokenSupplyMetric {
    date: string; // YYYY-MM-DD
    circulatingSupply: number;
    totalSupply: number;
    lockedSupply: number;
    burnedSupply: number;
}

// --- Context for Global State Management ---
interface TokenIssuanceContextType {
    currentTokenConfig: TokenConfig | null;
    setCurrentTokenConfig: React.Dispatch<React.SetStateAction<TokenConfig | null>>;
    tokenAllocations: TokenAllocation[];
    setTokenAllocations: React.Dispatch<React.SetStateAction<TokenAllocation[]>>;
    deploymentConfigs: DeploymentConfig[];
    setDeploymentConfigs: React.Dispatch<React.SetStateAction<DeploymentConfig[]>>;
    deploymentHistory: DeploymentStatus[];
    setDeploymentHistory: React.Dispatch<React.SetStateAction<DeploymentStatus[]>>;
    aiGeneratedTokenomics: any | null;
    setAiGeneratedTokenomics: React.Dispatch<React.SetStateAction<any | null>>;
    activeAirdropCampaigns: AirdropCampaign[];
    setActiveAirdropCampaigns: React.Dispatch<React.SetStateAction<AirdropCampaign[]>>;
    activeGovernanceProposals: GovernanceProposal[];
    setActiveGovernanceProposals: React.Dispatch<React.SetStateAction<GovernanceProposal[]>>;
    availableNetworks: NetworkConfig[];
    addCustomNetwork: (network: NetworkConfig) => void;
    showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const TokenIssuanceContext = createContext<TokenIssuanceContextType | undefined>(undefined);

export const useTokenIssuance = () => {
    const context = useContext(TokenIssuanceContext);
    if (!context) {
        throw new Error('useTokenIssuance must be used within a TokenIssuanceProvider');
    }
    return context;
};

export const TokenIssuanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTokenConfig, setCurrentTokenConfig] = useState<TokenConfig | null>(null);
    const [tokenAllocations, setTokenAllocations] = useState<TokenAllocation[]>([]);
    const [deploymentConfigs, setDeploymentConfigs] = useState<DeploymentConfig[]>([]);
    const [deploymentHistory, setDeploymentHistory] = useState<DeploymentStatus[]>([]);
    const [aiGeneratedTokenomics, setAiGeneratedTokenomics] = useState<any>(null);
    const [activeAirdropCampaigns, setActiveAirdropCampaigns] = useState<AirdropCampaign[]>([]);
    const [activeGovernanceProposals, setActiveGovernanceProposals] = useState<GovernanceProposal[]>([]);
    const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; }[]>([]);

    const initialNetworks: NetworkConfig[] = [
        { id: 'eth-mainnet', name: 'Ethereum Mainnet', chainId: 1, rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID', blockExplorerUrl: 'https://etherscan.io' },
        { id: 'goerli', name: 'Goerli Testnet', chainId: 5, rpcUrl: 'https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID', blockExplorerUrl: 'https://goerli.etherscan.io' },
        { id: 'sepolia', name: 'Sepolia Testnet', chainId: 11155111, rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID', blockExplorerUrl: 'https://sepolia.etherscan.io' },
        { id: 'polygon-mainnet', name: 'Polygon Mainnet', chainId: 137, rpcUrl: 'https://polygon-rpc.com', blockExplorerUrl: 'https://polygonscan.com' },
        { id: 'mumbai', name: 'Polygon Mumbai Testnet', chainId: 80001, rpcUrl: 'https://rpc-mumbai.maticvigil.com', blockExplorerUrl: 'https://mumbai.polygonscan.com' },
        // Add more networks as needed
    ];
    const [availableNetworks, setAvailableNetworks] = useState<NetworkConfig[]>(initialNetworks);

    const addCustomNetwork = useCallback((network: NetworkConfig) => {
        setAvailableNetworks(prev => [...prev, { ...network, isCustom: true }]);
        showNotification(`Custom network ${network.name} added!`, 'success');
    }, []);

    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    // Simulate loading existing data from a backend
    useEffect(() => {
        // NOTE: This is a simulated backend call
        const loadInitialData = async () => {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            // setCurrentTokenConfig(...);
            // setTokenAllocations(...);
            // setDeploymentHistory(...);
            // setAiGeneratedTokenomics(...);
        };
        loadInitialData();
    }, []);

    return (
        <TokenIssuanceContext.Provider
            value={{
                currentTokenConfig, setCurrentTokenConfig,
                tokenAllocations, setTokenAllocations,
                deploymentConfigs, setDeploymentConfigs,
                deploymentHistory, setDeploymentHistory,
                aiGeneratedTokenomics, setAiGeneratedTokenomics,
                activeAirdropCampaigns, setActiveAirdropCampaigns,
                activeGovernanceProposals, setActiveGovernanceProposals,
                availableNetworks, addCustomNetwork,
                showNotification,
            }}
        >
            {children}
            {/* Notification system display */}
            <div className="fixed bottom-4 right-4 z-[100] space-y-2">
                {notifications.map(note => (
                    <div key={note.id} className={`p-4 rounded-lg shadow-lg flex items-center space-x-3 
                        ${note.type === 'success' ? 'bg-green-600 text-white' : ''}
                        ${note.type === 'error' ? 'bg-red-600 text-white' : ''}
                        ${note.type === 'info' ? 'bg-blue-600 text-white' : ''}
                        ${note.type === 'warning' ? 'bg-yellow-600 text-white' : ''}
                    `}>
                        {note.type === 'success' && <FaCheckCircle className="text-xl" />}
                        {note.type === 'error' && <FaTimesCircle className="text-xl" />}
                        {note.type === 'info' && <FaBell className="text-xl" />}
                        {note.type === 'warning' && <FaExclamationTriangle className="text-xl" />}
                        <span>{note.message}</span>
                    </div>
                ))}
            </div>
        </TokenIssuanceContext.Provider>
    );
};

// --- Utility Components and Functions ---

export const ExportedProgressBar: React.FC<{ steps: string[]; currentStep: number }> = ({ steps, currentStep }) => {
    return (
        <div className="flex justify-between items-center w-full py-4">
            {steps.map((step, index) => (
                <div key={step} className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${index <= currentStep ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400'}
                    `}>
                        {index + 1}
                    </div>
                    <span className={`mt-2 text-xs text-center ${index <= currentStep ? 'text-white' : 'text-gray-500'}`}>
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <div className={`absolute left-0 right-0 h-1 bg-gray-700 top-1/2 -z-10 mx-2
                            ${index < currentStep ? 'bg-cyan-600' : 'bg-gray-700'}
                        `} style={{ width: `calc(100% / ${steps.length} - 1rem)` }}></div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const ExportedTooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
    return (
        <div className="relative flex items-center group">
            {children}
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-max p-2 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                {content}
            </div>
        </div>
    );
};

export const ExportedSpinner: React.FC = () => (
    <div className="flex items-center justify-center">
        <FaSpinner className="animate-spin text-cyan-500 text-2xl" />
    </div>
);

export const ExportedChart: React.FC<{ title: string; data: { label: string; value: number; color: string }[]; type?: 'pie' | 'bar' | 'line'; }> = ({ title, data, type = 'pie' }) => {
    // This is a simplified chart visualization. In a real app, you'd use a charting library like Chart.js or Recharts.
    const total = data.reduce((acc, item) => acc + item.value, 0);

    return (
        <Card title={title}>
            <div className="relative w-full h-48 flex items-center justify-center">
                {type === 'pie' && (
                    <div className="relative w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                        {/* Simplified pie chart visual */}
                        <div className="absolute inset-0 rounded-full" style={{
                            background: `conic-gradient(
                                ${data.map((item, i) => `${item.color} 0 ${data.slice(0, i + 1).reduce((sum, d) => sum + d.value, 0) / total * 360}deg`).join(', ')}
                            )`
                        }}></div>
                        <span className="z-10 bg-gray-800 p-2 rounded-full">{(total).toFixed(0)}</span>
                    </div>
                )}
                {type === 'bar' && (
                    <div className="flex w-full h-full space-x-2 items-end">
                        {data.map((item, index) => (
                            <div key={index} className="flex flex-col items-center h-full justify-end flex-1">
                                <div className="w-8 rounded-t-md" style={{ height: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%`, backgroundColor: item.color }}></div>
                                <span className="text-xs text-gray-400 mt-1">{item.label}</span>
                            </div>
                        ))}
                    </div>
                )}
                {type === 'line' && (
                    <div className="relative w-full h-full">
                        {/* Placeholder for line chart */}
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polyline
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="1"
                                points={data.map((item, i) => `${(i / (data.length - 1)) * 100},${100 - (item.value / Math.max(...data.map(d => d.value))) * 100}`).join(' ')}
                            />
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                {data.map((item, i) => (
                                    <stop key={i} offset={`${(i / (data.length - 1)) * 100}%`} stopColor={item.color} />
                                ))}
                            </linearGradient>
                        </svg>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700"></div>
                        <div className="absolute left-0 top-0 h-full w-1 bg-gray-700"></div>
                    </div>
                )}
            </div>
            <div className="mt-4 space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-gray-300">
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span>{item.label}</span>
                        </div>
                        <span>{item.value.toLocaleString()} ({((item.value / total) * 100).toFixed(2)}%)</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};


export const ExportedInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; icon?: React.ReactNode; }> = ({ label, error, icon, ...props }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            {icon && <span>{icon}</span>}
            <span>{label}</span>
        </label>
        <div className="relative">
            <input
                {...props}
                className={`w-full p-2 bg-gray-700/50 rounded text-white border ${error ? 'border-red-500' : 'border-gray-700'} focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    </div>
);

export const ExportedTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; }> = ({ label, error, ...props }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <textarea
            {...props}
            className={`w-full p-2 bg-gray-700/50 rounded text-white border ${error ? 'border-red-500' : 'border-gray-700'} focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-y ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const ExportedSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: { value: string; label: string; }[]; error?: string; }> = ({ label, options, error, ...props }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <select
            {...props}
            className={`w-full p-2 bg-gray-700/50 rounded text-white border ${error ? 'border-red-500' : 'border-gray-700'} focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const ExportedCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; }> = ({ label, ...props }) => (
    <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
        <input type="checkbox" {...props} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500" />
        <span className="text-sm">{label}</span>
    </label>
);

export const ExportedButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger'; loading?: boolean; icon?: React.ReactNode; }> = ({ children, variant = 'primary', loading, icon, ...props }) => {
    const baseClasses = "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2";
    let variantClasses = "";
    switch (variant) {
        case 'primary':
            variantClasses = "bg-cyan-600 hover:bg-cyan-700 text-white";
            break;
        case 'secondary':
            variantClasses = "bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600";
            break;
        case 'danger':
            variantClasses = "bg-red-600 hover:bg-red-700 text-white";
            break;
    }
    return (
        <button
            {...props}
            className={`${baseClasses} ${variantClasses} ${props.disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={props.disabled || loading}
        >
            {loading && <FaSpinner className="animate-spin" />}
            {icon && !loading && <span>{icon}</span>}
            <span>{children}</span>
        </button>
    );
};

// --- Step 1: Token Definition Form ---

export const ExportedTokenDefinitionForm: React.FC<{ onNext: () => void }> = ({ onNext }) => {
    const { currentTokenConfig, setCurrentTokenConfig, aiGeneratedTokenomics, showNotification } = useTokenIssuance();

    const [formState, setFormState] = useState<TokenConfig>(currentTokenConfig || {
        id: 'new-token-' + Date.now(),
        name: '',
        symbol: '',
        description: '',
        type: 'ERC-20',
        totalSupply: 0,
        decimals: 18,
        socialLinks: {},
        features: {
            mintable: false,
            burnable: true,
            pausable: false,
            upgradable: false,
            snapshots: false,
            permit: false,
        },
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (aiGeneratedTokenomics && !currentTokenConfig) {
            setFormState(prev => ({
                ...prev,
                name: aiGeneratedTokenomics.name || prev.name,
                symbol: aiGeneratedTokenomics.symbol || prev.symbol,
                totalSupply: aiGeneratedTokenomics.totalSupply || prev.totalSupply,
                description: aiGeneratedTokenomics.description || prev.description,
                aiGeneratedNotes: JSON.stringify(aiGeneratedTokenomics, null, 2),
            }));
            showNotification('Token details pre-filled by AI!', 'info');
        }
    }, [aiGeneratedTokenomics, currentTokenConfig, showNotification]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormState(prev => ({
            ...prev,
            features: { ...prev.features, [name]: checked }
        }));
    };

    const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [name]: value }
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formState.name.trim()) newErrors.name = 'Token name is required.';
        if (!formState.symbol.trim()) newErrors.symbol = 'Token symbol is required.';
        if (!/^[A-Z0-9]{2,10}$/.test(formState.symbol.trim())) newErrors.symbol = 'Symbol must be 2-10 uppercase alphanumeric characters.';
        if (formState.totalSupply <= 0) newErrors.totalSupply = 'Total supply must be greater than 0.';
        if (formState.decimals < 0 || formState.decimals > 18) newErrors.decimals = 'Decimals must be between 0 and 18.';
        if (!formState.description.trim()) newErrors.description = 'Description is required.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setCurrentTokenConfig(formState);
            showNotification('Token definition saved successfully!', 'success');
            onNext();
        } else {
            showNotification('Please correct the errors in the form.', 'error');
        }
    };

    return (
        <Card title="1. Define Your Token" icon={<FaDollarSign />}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <ExportedInput
                    label="Token Name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="e.g., MegaCorp Utility Token"
                    error={errors.name}
                    icon={<FaDollarSign />}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ExportedInput
                        label="Token Symbol"
                        name="symbol"
                        value={formState.symbol}
                        onChange={handleChange}
                        placeholder="e.g., MCT"
                        error={errors.symbol}
                        icon={<FaExchangeAlt />}
                    />
                    <ExportedSelect
                        label="Token Type"
                        name="type"
                        value={formState.type}
                        onChange={handleChange}
                        options={[
                            { value: 'ERC-20', label: 'ERC-20 (Fungible Token)' },
                            { value: 'ERC-721', label: 'ERC-721 (Non-Fungible Token - NFT)' },
                            { value: 'ERC-1155', label: 'ERC-1155 (Multi-Token Standard)' },
                            { value: 'Custom', label: 'Custom Standard' },
                        ]}
                        icon={<FaCode />}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formState.type === 'ERC-20' && (
                        <>
                            <ExportedInput
                                label="Total Supply"
                                name="totalSupply"
                                type="number"
                                value={formState.totalSupply === 0 ? '' : formState.totalSupply}
                                onChange={handleChange}
                                placeholder="e.g., 100000000"
                                error={errors.totalSupply}
                                icon={<FaChartBar />}
                            />
                            <ExportedInput
                                label="Decimals"
                                name="decimals"
                                type="number"
                                value={formState.decimals}
                                onChange={handleChange}
                                placeholder="e.g., 18"
                                error={errors.decimals}
                                icon={<FaBalanceScale />}
                            />
                        </>
                    )}
                    {(formState.type === 'ERC-721' || formState.type === 'ERC-1155') && (
                        <ExportedInput
                            label="Base URI (for Metadata)"
                            name="baseTokenURI"
                            value={formState.baseTokenURI || ''}
                            onChange={handleChange}
                            placeholder="e.g., https://api.megacorp.com/tokens/"
                            icon={<FaCloudDownloadAlt />}
                        />
                    )}
                </div>
                <ExportedTextArea
                    label="Token Description"
                    name="description"
                    value={formState.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Provide a detailed description of your token, its utility, and purpose."
                    error={errors.description}
                />
                <ExportedInput
                    label="Token Logo URL"
                    name="logoUrl"
                    type="url"
                    value={formState.logoUrl || ''}
                    onChange={handleChange}
                    placeholder="e.g., https://assets.megacorp.com/mct-logo.png"
                    icon={<FaGlobe />}
                />
                <ExportedInput
                    label="Official Website URL"
                    name="websiteUrl"
                    type="url"
                    value={formState.websiteUrl || ''}
                    onChange={handleChange}
                    placeholder="e.g., https://megacorp.com"
                    icon={<FaGlobe />}
                />

                <h3 className="text-lg font-semibold text-white mt-8 mb-4">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ExportedInput label="Twitter URL" name="twitter" type="url" value={formState.socialLinks.twitter || ''} onChange={handleSocialLinkChange} placeholder="e.g., https://twitter.com/megacorp" />
                    <ExportedInput label="Telegram URL" name="telegram" type="url" value={formState.socialLinks.telegram || ''} onChange={handleSocialLinkChange} placeholder="e.g., https://t.me/megacorp_official" />
                    <ExportedInput label="Discord URL" name="discord" type="url" value={formState.socialLinks.discord || ''} onChange={handleSocialLinkChange} placeholder="e.g., https://discord.gg/megacorp" />
                    <ExportedInput label="GitHub URL" name="github" type="url" value={formState.socialLinks.github || ''} onChange={handleSocialLinkChange} placeholder="e.g., https://github.com/megacorp" />
                </div>

                <h3 className="text-lg font-semibold text-white mt-8 mb-4">Advanced Features (ERC-20 only)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <ExportedCheckbox
                        label={<ExportedTooltip content="Allow new tokens to be created after initial deployment.">Mintable</ExportedTooltip>}
                        name="mintable"
                        checked={formState.features.mintable}
                        onChange={handleFeatureChange}
                        disabled={formState.type !== 'ERC-20'}
                    />
                    <ExportedCheckbox
                        label={<ExportedTooltip content="Allow tokens to be removed from circulation permanently.">Burnable</ExportedTooltip>}
                        name="burnable"
                        checked={formState.features.burnable}
                        onChange={handleFeatureChange}
                        disabled={formState.type !== 'ERC-20'}
                    />
                    <ExportedCheckbox
                        label={<ExportedTooltip content="Allow pausing and unpausing of all token transfers and approvals. Useful for emergencies.">Pausable</ExportedTooltip>}
                        name="pausable"
                        checked={formState.features.pausable}
                        onChange={handleFeatureChange}
                        disabled={formState.type !== 'ERC-20'}
                    />
                    <ExportedCheckbox
                        label={<ExportedTooltip content="Enable the contract to be upgraded in the future, typically via an ERC-1967 Proxy.">Upgradable (Proxy)</ExportedTooltip>}
                        name="upgradable"
                        checked={formState.features.upgradable}
                        onChange={handleFeatureChange}
                        disabled={formState.type !== 'ERC-20'}
                    />
                    <ExportedCheckbox
                        label={<ExportedTooltip content="Allow tracking of historical balances at specific block numbers. Useful for governance or airdrops.">Snapshots</ExportedTooltip>}
                        name="snapshots"
                        checked={formState.features.snapshots}
                        onChange={handleFeatureChange}
                        disabled={formState.type !== 'ERC-20'}
                    />
                    <ExportedCheckbox
                        label={<ExportedTooltip content="Enable gasless approvals for ERC-20 tokens using signed messages (EIP-2612).">Permit (EIP-2612)</ExportedTooltip>}
                        name="permit"
                        checked={formState.features.permit}
                        onChange={handleFeatureChange}
                        disabled={formState.type !== 'ERC-20'}
                    />
                    <ExportedCheckbox
                        label={<ExportedTooltip content="Integrate with a governance module for decentralized decision-making. (Requires additional setup)">Governance Module</ExportedTooltip>}
                        name="governanceModule"
                        checked={formState.features.governanceModule || false}
                        onChange={handleFeatureChange}
                        disabled={formState.type !== 'ERC-20'}
                    />
                </div>
                {formState.aiGeneratedNotes && (
                    <Card title="AI Generated Notes" className="mt-6">
                        <pre className="text-xs text-gray-300 overflow-auto max-h-40">{formState.aiGeneratedNotes}</pre>
                        <p className="mt-2 text-xs text-gray-400">Review and adjust these AI-suggested details as needed.</p>
                    </Card>
                )}
                <div className="flex justify-end pt-4">
                    <ExportedButton type="submit">
                        Save & Next <span className="ml-2">&rarr;</span>
                    </ExportedButton>
                </div>
            </form>
        </Card>
    );
};

// --- Step 2: Tokenomics Allocation Form ---

export const ExportedTokenomicsAllocationForm: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
    const { currentTokenConfig, tokenAllocations, setTokenAllocations, aiGeneratedTokenomics, showNotification } = useTokenIssuance();

    const [allocations, setAllocations] = useState<TokenAllocation[]>(tokenAllocations.length > 0 ? tokenAllocations : []);
    const [newAllocationType, setNewAllocationType] = useState<AllocationType>('Team');
    const [newAllocationPercentage, setNewAllocationPercentage] = useState<number>(0);

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (aiGeneratedTokenomics && aiGeneratedTokenomics.allocation && allocations.length === 0 && currentTokenConfig?.totalSupply) {
            const aiAllocations: TokenAllocation[] = Object.entries(aiGeneratedTokenomics.allocation).map(([type, percentage]) => ({
                type: type as AllocationType,
                percentage: typeof percentage === 'number' ? percentage : 0,
                amount: typeof percentage === 'number' ? (percentage / 100) * currentTokenConfig.totalSupply : 0,
                vestingSchedule: type === 'Team' || type.includes('Investors') ? {
                    id: 'vesting-' + type.toLowerCase() + '-' + Date.now(),
                    amount: typeof percentage === 'number' ? (percentage / 100) * currentTokenConfig.totalSupply : 0,
                    cliff: type === 'Team' ? 12 : 6,
                    duration: type === 'Team' ? 36 : 24,
                    releaseFrequency: 'monthly',
                    startDate: new Date().toISOString().split('T')[0],
                    recipientAddresses: ['0xAIAutoGenAddressPlaceholder'],
                } : undefined,
                details: `AI-generated allocation for ${type}`,
            }));
            setAllocations(aiAllocations);
            showNotification('Tokenomics allocations pre-filled by AI!', 'info');
        }
    }, [aiGeneratedTokenomics, currentTokenConfig?.totalSupply, allocations.length, showNotification]);

    const calculateTotalPercentage = useCallback(() => {
        return allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
    }, [allocations]);

    const handleAddAllocation = () => {
        if (!currentTokenConfig?.totalSupply) {
            showNotification('Please define Token Supply in Step 1 first.', 'error');
            return;
        }

        if (newAllocationPercentage <= 0) {
            setErrors(prev => ({ ...prev, newAllocationPercentage: 'Percentage must be greater than 0.' }));
            return;
        }

        const currentTotal = calculateTotalPercentage();
        if (currentTotal + newAllocationPercentage > 100.01) { // Adding small buffer for floating point
            setErrors(prev => ({ ...prev, newAllocationPercentage: `Total percentage cannot exceed 100%. Remaining: ${100 - currentTotal.toFixed(2)}%` }));
            return;
        }

        const newAllocation: TokenAllocation = {
            type: newAllocationType,
            percentage: newAllocationPercentage,
            amount: (newAllocationPercentage / 100) * currentTokenConfig.totalSupply,
            details: '',
        };

        setAllocations(prev => [...prev, newAllocation]);
        setNewAllocationPercentage(0);
        setErrors(prev => ({ ...prev, newAllocationPercentage: '' }));
    };

    const handleRemoveAllocation = (index: number) => {
        setAllocations(prev => prev.filter((_, i) => i !== index));
    };

    const handleAllocationChange = (index: number, field: keyof TokenAllocation, value: any) => {
        if (!currentTokenConfig?.totalSupply) return;

        setAllocations(prev => {
            const updated = [...prev];
            if (field === 'percentage') {
                const newPercentage = parseFloat(value);
                if (isNaN(newPercentage)) return prev;

                const currentTotalExcludingThis = prev.filter((_, i) => i !== index).reduce((sum, alloc) => sum + alloc.percentage, 0);
                if (currentTotalExcludingThis + newPercentage > 100.01) {
                    showNotification(`Total percentage cannot exceed 100%. Remaining: ${100 - currentTotalExcludingThis.toFixed(2)}%`, 'warning');
                    return prev; // Prevent update
                }

                updated[index].percentage = newPercentage;
                updated[index].amount = (newPercentage / 100) * currentTokenConfig.totalSupply;
            } else {
                (updated[index] as any)[field] = value;
            }
            return updated;
        });
    };

    const handleVestingChange = (allocationIndex: number, field: keyof VestingSchedule, value: any) => {
        setAllocations(prev => {
            const updated = [...prev];
            const currentVesting = updated[allocationIndex].vestingSchedule;
            if (!currentVesting) return prev; // Should not happen if vesting is enabled

            (currentVesting as any)[field] = value;
            return updated;
        });
    };

    const validateForm = () => {
        const total = calculateTotalPercentage();
        if (total < 99.99 || total > 100.01) { // Allow slight floating point discrepancies
            showNotification('Total allocation percentage must be exactly 100%.', 'error');
            return false;
        }
        setErrors({});
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setTokenAllocations(allocations);
            showNotification('Tokenomics allocations saved!', 'success');
            onNext();
        } else {
            showNotification('Please adjust allocations to total exactly 100%.', 'error');
        }
    };

    const allocationOptions = [
        { value: 'Team', label: 'Team' },
        { value: 'Investors (Seed)', label: 'Investors (Seed)' },
        { value: 'Investors (Private)', label: 'Investors (Private)' },
        { value: 'Investors (Public)', label: 'Investors (Public)' },
        { value: 'Ecosystem', label: 'Ecosystem' },
        { value: 'Treasury', label: 'Treasury' },
        { value: 'Advisors', label: 'Advisors' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Liquidity', label: 'Liquidity' },
        { value: 'Staking Rewards', label: 'Staking Rewards' },
        { value: 'Community', label: 'Community' },
        { value: 'Airdrop', label: 'Airdrop' },
    ];

    const vestingReleaseFrequencyOptions = [
        { value: 'linear', label: 'Linear' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'daily', label: 'Daily' },
    ];

    const chartData = allocations.map(alloc => ({
        label: alloc.type,
        value: alloc.percentage,
        color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}` // Random color for now
    }));

    return (
        <Card title="2. Define Tokenomics & Allocations" icon={<FaProjectDiagram />}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {!currentTokenConfig?.totalSupply && (
                    <div className="bg-yellow-800/50 p-4 rounded-lg text-yellow-300 flex items-center space-x-2">
                        <FaExclamationTriangle />
                        <span>Please complete "1. Define Your Token" to set the total supply before configuring allocations.</span>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Allocation Breakdown</h3>
                        <div className="space-y-4">
                            {allocations.length === 0 && (
                                <p className="text-gray-400">No allocations added yet. Use the form below to add your first allocation.</p>
                            )}
                            {allocations.map((alloc, index) => (
                                <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-700 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-white text-md">{alloc.type}</h4>
                                        <ExportedButton variant="danger" type="button" onClick={() => handleRemoveAllocation(index)} className="p-2 h-auto text-xs">Remove</ExportedButton>
                                    </div>
                                    <ExportedInput
                                        label="Percentage (%)"
                                        type="number"
                                        step="0.01"
                                        value={alloc.percentage}
                                        onChange={(e) => handleAllocationChange(index, 'percentage', parseFloat(e.target.value))}
                                        placeholder="e.g., 20"
                                        min="0"
                                        max="100"
                                        disabled={!currentTokenConfig?.totalSupply}
                                    />
                                    <p className="text-sm text-gray-400">Amount: {alloc.amount.toLocaleString(undefined, { maximumFractionDigits: currentTokenConfig?.decimals || 0 })} {currentTokenConfig?.symbol}</p>
                                    <ExportedTextArea
                                        label="Details/Purpose"
                                        value={alloc.details || ''}
                                        onChange={(e) => handleAllocationChange(index, 'details', e.target.value)}
                                        rows={2}
                                        placeholder="e.g., For core development team, 1-year cliff."
                                    />

                                    <ExportedCheckbox
                                        label="Enable Vesting Schedule"
                                        checked={!!alloc.vestingSchedule}
                                        onChange={(e) => handleAllocationChange(index, 'vestingSchedule', e.target.checked ? {
                                            id: `vesting-${alloc.type.toLowerCase().replace(/ /g, '-')}-${Date.now()}`,
                                            amount: alloc.amount,
                                            cliff: 0,
                                            duration: 0,
                                            releaseFrequency: 'linear',
                                            startDate: new Date().toISOString().split('T')[0],
                                            recipientAddresses: [],
                                        } : undefined)}
                                    />

                                    {alloc.vestingSchedule && (
                                        <div className="bg-gray-800 p-4 rounded-md space-y-3 border border-gray-700">
                                            <h5 className="font-semibold text-gray-200 text-sm">Vesting Details</h5>
                                            <ExportedInput
                                                label="Vesting Start Date"
                                                type="date"
                                                value={alloc.vestingSchedule.startDate}
                                                onChange={(e) => handleVestingChange(index, 'startDate', e.target.value)}
                                            />
                                            <ExportedInput
                                                label="Cliff (Months)"
                                                type="number"
                                                min="0"
                                                value={alloc.vestingSchedule.cliff}
                                                onChange={(e) => handleVestingChange(index, 'cliff', parseInt(e.target.value))}
                                            />
                                            <ExportedInput
                                                label="Total Vesting Duration (Months)"
                                                type="number"
                                                min="0"
                                                value={alloc.vestingSchedule.duration}
                                                onChange={(e) => handleVestingChange(index, 'duration', parseInt(e.target.value))}
                                            />
                                            <ExportedSelect
                                                label="Release Frequency"
                                                value={alloc.vestingSchedule.releaseFrequency}
                                                options={vestingReleaseFrequencyOptions}
                                                onChange={(e) => handleVestingChange(index, 'releaseFrequency', e.target.value as VestingSchedule['releaseFrequency'])}
                                            />
                                            <ExportedTextArea
                                                label="Recipient Wallet Addresses (one per line)"
                                                value={alloc.vestingSchedule.recipientAddresses.join('\n')}
                                                onChange={(e) => handleVestingChange(index, 'recipientAddresses', e.target.value.split('\n').map(addr => addr.trim()).filter(addr => addr))}
                                                rows={3}
                                                placeholder="0xabc...&#10;0xdef..."
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-700 space-y-4">
                            <h3 className="text-lg font-semibold text-white">Add New Allocation</h3>
                            <ExportedSelect
                                label="Allocation Type"
                                value={newAllocationType}
                                options={allocationOptions.filter(opt => !allocations.some(a => a.type === opt.value))} // Prevent adding duplicate types for simplicity
                                onChange={(e) => setNewAllocationType(e.target.value as AllocationType)}
                            />
                            <ExportedInput
                                label="Percentage (%)"
                                type="number"
                                step="0.01"
                                value={newAllocationPercentage === 0 ? '' : newAllocationPercentage}
                                onChange={(e) => setNewAllocationPercentage(parseFloat(e.target.value))}
                                placeholder="e.g., 15"
                                min="0"
                                max="100"
                                error={errors.newAllocationPercentage}
                                disabled={!currentTokenConfig?.totalSupply}
                            />
                            <ExportedButton type="button" onClick={handleAddAllocation} disabled={!currentTokenConfig?.totalSupply || newAllocationPercentage <= 0}>
                                Add Allocation
                            </ExportedButton>
                            <p className="mt-4 text-sm text-gray-400">Total Allocated: {calculateTotalPercentage().toFixed(2)}%</p>
                            <p className={`text-sm ${calculateTotalPercentage().toFixed(2) === '100.00' ? 'text-green-500' : 'text-yellow-500'}`}>
                                Remaining: {(100 - calculateTotalPercentage()).toFixed(2)}%
                            </p>
                        </div>
                    </div>
                    <div>
                        <ExportedChart title="Token Allocation Distribution" data={chartData} />
                        <Card title="Token Supply Dynamics Simulator" className="mt-6">
                            <p className="text-sm text-gray-400 mb-4">Visualize how your token supply will evolve over time based on vesting schedules and planned releases.</p>
                            {/* Placeholder for interactive supply curve chart */}
                            <div className="w-full h-64 bg-gray-800 rounded flex items-center justify-center text-gray-500 text-sm">
                                <FaChartLine className="text-4xl mr-2" />
                                Interactive Supply Curve Chart (TODO)
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-gray-300">
                                <p><strong>Estimated Initial Circulating Supply:</strong> {
                                    allocations.filter(a => !a.vestingSchedule && !a.isLocked).reduce((sum, a) => sum + a.amount, 0).toLocaleString()
                                } {currentTokenConfig?.symbol}</p>
                                <p><strong>Max Circulating Supply (at full vest):</strong> {currentTokenConfig?.totalSupply?.toLocaleString()} {currentTokenConfig?.symbol}</p>
                            </div>
                            <ExportedButton variant="secondary" className="w-full mt-4">Simulate Vesting & Supply</ExportedButton>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-700">
                    <ExportedButton type="button" onClick={onPrev} variant="secondary">
                        &larr; Previous
                    </ExportedButton>
                    <ExportedButton type="submit">
                        Save & Next <span className="ml-2">&rarr;</span>
                    </ExportedButton>
                </div>
            </form>
        </Card>
    );
};

// --- Step 3: Smart Contract Configuration ---

export const ExportedSmartContractConfiguration: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
    const { currentTokenConfig, setCurrentTokenConfig, showNotification } = useTokenIssuance();
    const [gasEstimate, setGasEstimate] = useState<number | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);

    const formState = currentTokenConfig || {
        id: '', name: '', symbol: '', description: '', type: 'ERC-20', totalSupply: 0, decimals: 18, socialLinks: {},
        features: { mintable: false, burnable: true, pausable: false, upgradable: false, snapshots: false, permit: false }
    };

    const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setCurrentTokenConfig(prev => prev ? {
            ...prev,
            features: { ...prev.features, [name]: checked }
        } : null);
    };

    const estimateGasCosts = async () => {
        setIsEstimating(true);
        setGasEstimate(null);
        // NOTE: This is a simulated gas estimation. In a real app, this would involve Web3 RPC calls.
        await new Promise(resolve => setTimeout(resolve, 1500));
        let estimate = 0;
        if (formState.type === 'ERC-20') {
            estimate += 250000; // Base ERC-20 deployment
            if (formState.features.mintable) estimate += 50000;
            if (formState.features.burnable) estimate += 20000;
            if (formState.features.pausable) estimate += 30000;
            if (formState.features.upgradable) estimate += 150000; // Proxy contract adds significant cost
            if (formState.features.snapshots) estimate += 40000;
            if (formState.features.permit) estimate += 30000;
        } else if (formState.type === 'ERC-721') {
            estimate += 400000; // Base ERC-721
            if (formState.features.upgradable) estimate += 150000;
        } else if (formState.type === 'ERC-1155') {
            estimate += 500000; // Base ERC-1155
            if (formState.features.upgradable) estimate += 150000;
        }
        setGasEstimate(estimate);
        setIsEstimating(false);
        showNotification('Gas estimation complete!', 'info');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTokenConfig) {
            showNotification('Token configuration not found. Please complete previous steps.', 'error');
            return;
        }
        showNotification('Smart contract configuration saved!', 'success');
        onNext();
    };

    return (
        <Card title="3. Configure Smart Contract" icon={<FaFileCode />}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {!currentTokenConfig && (
                    <div className="bg-yellow-800/50 p-4 rounded-lg text-yellow-300 flex items-center space-x-2">
                        <FaExclamationTriangle />
                        <span>Please complete "1. Define Your Token" before configuring the smart contract.</span>
                    </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-4">Selected Token Type: {formState.type}</h3>
                <p className="text-gray-400 text-sm">
                    Based on your selected token type ({formState.type}), enable or disable specific functionalities for your smart contract.
                    These features directly impact the contract's code, complexity, and deployment gas costs.
                </p>

                {formState.type === 'ERC-20' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ExportedCheckbox
                            label={<ExportedTooltip content="Allow creating new tokens after initial deployment.">Mintable</ExportedTooltip>}
                            name="mintable"
                            checked={formState.features.mintable}
                            onChange={handleFeatureChange}
                        />
                        <ExportedCheckbox
                            label={<ExportedTooltip content="Allow token holders to permanently destroy their tokens.">Burnable</ExportedTooltip>}
                            name="burnable"
                            checked={formState.features.burnable}
                            onChange={handleFeatureChange}
                        />
                        <ExportedCheckbox
                            label={<ExportedTooltip content="Enable stopping/resuming all token transfers and approvals (e.g., in case of emergency).">Pausable</ExportedTooltip>}
                            name="pausable"
                            checked={formState.features.pausable}
                            onChange={handleFeatureChange}
                        />
                        <ExportedCheckbox
                            label={<ExportedTooltip content="Allows the contract logic to be upgraded in the future, typically via a proxy pattern.">Upgradable (Proxy)</ExportedTooltip>}
                            name="upgradable"
                            checked={formState.features.upgradable}
                            onChange={handleFeatureChange}
                        />
                        <ExportedCheckbox
                            label={<ExportedTooltip content="Allows querying historical balances at specific block numbers.">Snapshots</ExportedTooltip>}
                            name="snapshots"
                            checked={formState.features.snapshots}
                            onChange={handleFeatureChange}
                        />
                        <ExportedCheckbox
                            label={<ExportedTooltip content="Adds EIP-2612 permit function for gasless approvals.">Permit (EIP-2612)</ExportedTooltip>}
                            name="permit"
                            checked={formState.features.permit}
                            onChange={handleFeatureChange}
                        />
                         <ExportedCheckbox
                            label={<ExportedTooltip content="Enable the ERC-3156 standard for flash minting.">Flash Mint (ERC-3156)</ExportedTooltip>}
                            name="flashMint"
                            checked={formState.features.flashMint || false}
                            onChange={handleFeatureChange}
                        />
                        <ExportedCheckbox
                            label={<ExportedTooltip content="Implement ERC-1363 allowing tokens to be paid directly to a contract method.">ERC-1363 (Payable Token)</ExportedTooltip>}
                            name="erc1363"
                            checked={formState.features.erc1363 || false}
                            onChange={handleFeatureChange}
                        />
                        <ExportedCheckbox
                            label={<ExportedTooltip content="Integrate a basic governance module to allow token holders to vote on proposals.">Governance Module</ExportedTooltip>}
                            name="governanceModule"
                            checked={formState.features.governanceModule || false}
                            onChange={handleFeatureChange}
                        />
                    </div>
                ) : (
                    <div className="bg-gray-800/50 p-4 rounded-lg text-gray-300">
                        <p>Advanced features are currently limited for {formState.type} token types.</p>
                        <p className="mt-2 text-xs">For ERC-721 and ERC-1155, options like "Upgradable" might be available, but other features like "Mintable" often depend on the specific NFT/multi-token implementation (e.g., lazyl minting, presales).</p>
                        <ExportedCheckbox
                            label={<ExportedTooltip content="Allows the contract logic to be upgraded in the future, typically via a proxy pattern.">Upgradable (Proxy)</ExportedTooltip>}
                            name="upgradable"
                            checked={formState.features.upgradable}
                            onChange={handleFeatureChange}
                        />
                    </div>
                )}

                <div className="mt-8 border-t border-gray-700 pt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Gas Cost Estimation</h3>
                    <p className="text-gray-400 text-sm">
                        Get an approximate estimate of the gas required to deploy your smart contract with the selected features.
                        Actual costs may vary depending on network congestion and chosen gas price.
                    </p>
                    <ExportedButton type="button" onClick={estimateGasCosts} loading={isEstimating} icon={<FaCalculator />}>
                        {isEstimating ? 'Estimating...' : 'Estimate Deployment Gas'}
                    </ExportedButton>
                    {gasEstimate !== null && (
                        <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                            <p className="text-gray-300 text-sm">
                                Estimated Gas Units: <strong className="text-cyan-400">{gasEstimate.toLocaleString()}</strong>
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                                (Rough estimate, not including transaction costs like `gasPrice * gasUsed`)
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                                *Note: This is a simulated estimate. Real-world gas costs depend on the target network, current network conditions, and specific compiler optimizations.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-700">
                    <ExportedButton type="button" onClick={onPrev} variant="secondary">
                        &larr; Previous
                    </ExportedButton>
                    <ExportedButton type="submit">
                        Save & Next <span className="ml-2">&rarr;</span>
                    </ExportedButton>
                </div>
            </form>
        </Card>
    );
};


// --- Step 4: Deployment Settings ---

export const ExportedDeploymentSettings: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
    const { currentTokenConfig, deploymentConfigs, setDeploymentConfigs, availableNetworks, addCustomNetwork, showNotification } = useTokenIssuance();
    const [selectedNetworkId, setSelectedNetworkId] = useState<string>(availableNetworks[0]?.id || '');
    const [ownerAddress, setOwnerAddress] = useState<string>('');
    const [gasPriceStrategy, setGasPriceStrategy] = useState<'standard' | 'fast' | 'custom'>('standard');
    const [customGasPriceGwei, setCustomGasPriceGwei] = useState<number>(30);
    const [frontRunProtection, setFrontRunProtection] = useState<boolean>(true);
    const [proxyAdminAddress, setProxyAdminAddress] = useState<string>('');
    const [showCustomNetworkModal, setShowCustomNetworkModal] = useState(false);
    const [customNetworkForm, setCustomNetworkForm] = useState<NetworkConfig>({ id: '', name: '', chainId: 0, rpcUrl: '', blockExplorerUrl: '' });
    const [customNetworkErrors, setCustomNetworkErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        // Load existing deployment config if available or set defaults
        if (deploymentConfigs.length > 0) {
            const lastConfig = deploymentConfigs[deploymentConfigs.length - 1];
            setSelectedNetworkId(lastConfig.network.id);
            setOwnerAddress(lastConfig.ownerAddress);
            setGasPriceStrategy(lastConfig.gasPriceStrategy);
            setCustomGasPriceGwei(lastConfig.customGasPriceGwei || 30);
            setFrontRunProtection(lastConfig.frontRunProtection);
            setProxyAdminAddress(lastConfig.proxyAdminAddress || '');
        } else {
            // Simulate wallet connection to get owner address
            setOwnerAddress('0xYourConnectedWalletAddressGoesHere_Simulated');
        }
    }, [deploymentConfigs]);

    const handleCustomNetworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomNetworkForm(prev => ({ ...prev, [name]: value }));
        setCustomNetworkErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateCustomNetworkForm = () => {
        const errors: Record<string, string> = {};
        if (!customNetworkForm.name.trim()) errors.name = 'Network name is required.';
        if (!customNetworkForm.chainId || customNetworkForm.chainId <= 0) errors.chainId = 'Valid Chain ID is required.';
        if (!customNetworkForm.rpcUrl.trim()) errors.rpcUrl = 'RPC URL is required.';
        if (!customNetworkForm.blockExplorerUrl.trim()) errors.blockExplorerUrl = 'Block Explorer URL is required.';
        setCustomNetworkErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddCustomNetwork = () => {
        if (validateCustomNetworkForm()) {
            const newNetwork: NetworkConfig = {
                ...customNetworkForm,
                id: `custom-${customNetworkForm.chainId}-${Date.now()}`,
                chainId: parseInt(customNetworkForm.chainId as any) // Ensure chainId is number
            };
            addCustomNetwork(newNetwork);
            setSelectedNetworkId(newNetwork.id);
            setShowCustomNetworkModal(false);
            setCustomNetworkForm({ id: '', name: '', chainId: 0, rpcUrl: '', blockExplorerUrl: '' });
            setCustomNetworkErrors({});
        } else {
            showNotification('Please fill all required fields for custom network.', 'error');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTokenConfig) {
            showNotification('Token configuration not found. Please complete previous steps.', 'error');
            return;
        }
        if (!ownerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            showNotification('Please enter a valid owner wallet address.', 'error');
            return;
        }
        if (currentTokenConfig.features.upgradable && !proxyAdminAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            showNotification('Please enter a valid proxy admin wallet address for upgradable contracts.', 'error');
            return;
        }

        const selectedNetwork = availableNetworks.find(net => net.id === selectedNetworkId);
        if (!selectedNetwork) {
            showNotification('Please select a valid network.', 'error');
            return;
        }

        const newDeploymentConfig: DeploymentConfig = {
            network: selectedNetwork,
            ownerAddress,
            gasPriceStrategy,
            customGasPriceGwei: gasPriceStrategy === 'custom' ? customGasPriceGwei : undefined,
            frontRunProtection,
            proxyAdminAddress: currentTokenConfig.features.upgradable ? proxyAdminAddress : undefined,
        };
        setDeploymentConfigs(prev => [...prev, newDeploymentConfig]);
        showNotification('Deployment settings saved!', 'success');
        onNext();
    };

    return (
        <Card title="4. Deployment Settings" icon={<FaNetworkWired />}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {!currentTokenConfig && (
                    <div className="bg-yellow-800/50 p-4 rounded-lg text-yellow-300 flex items-center space-x-2">
                        <FaExclamationTriangle />
                        <span>Please complete "1. Define Your Token" before configuring deployment.</span>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ExportedSelect
                        label="Target Network"
                        value={selectedNetworkId}
                        onChange={(e) => setSelectedNetworkId(e.target.value)}
                        options={availableNetworks.map(net => ({ value: net.id, label: net.name }))}
                        icon={<FaEthereum />}
                    />
                    <div className="flex items-end">
                        <ExportedButton type="button" variant="secondary" onClick={() => setShowCustomNetworkModal(true)} className="w-full">
                            Add Custom Network <FaPlus className="ml-2" />
                        </ExportedButton>
                    </div>
                </div>

                <ExportedInput
                    label={<ExportedTooltip content="The wallet address that will own and control the deployed contract.">Contract Owner Address</ExportedTooltip>}
                    value={ownerAddress}
                    onChange={(e) => setOwnerAddress(e.target.value)}
                    placeholder="0x..."
                    icon={<FaWallet />}
                />
                {currentTokenConfig?.features.upgradable && (
                    <ExportedInput
                        label={<ExportedTooltip content="Address of the proxy admin contract or an EOA that will manage upgrades.">Proxy Admin Address</ExportedTooltip>}
                        value={proxyAdminAddress}
                        onChange={(e) => setProxyAdminAddress(e.target.value)}
                        placeholder="0x..."
                        icon={<FaCogs />}
                    />
                )}

                <h3 className="text-lg font-semibold text-white mt-8 mb-4">Gas Price Strategy</h3>
                <div className="space-y-3">
                    <ExportedSelect
                        label="Gas Price Strategy"
                        value={gasPriceStrategy}
                        onChange={(e) => setGasPriceStrategy(e.target.value as 'standard' | 'fast' | 'custom')}
                        options={[
                            { value: 'standard', label: 'Standard (Recommended)' },
                            { value: 'fast', label: 'Fast (Higher priority, higher cost)' },
                            { value: 'custom', label: 'Custom (Manual Gwei)' },
                        ]}
                    />
                    {gasPriceStrategy === 'custom' && (
                        <ExportedInput
                            label="Custom Gas Price (Gwei)"
                            type="number"
                            value={customGasPriceGwei}
                            onChange={(e) => setCustomGasPriceGwei(parseFloat(e.target.value))}
                            min="1"
                            step="1"
                            placeholder="e.g., 50"
                        />
                    )}
                </div>

                <ExportedCheckbox
                    label={<ExportedTooltip content="Attempt to prevent front-running attacks during deployment by using a private transaction relay or similar service.">Enable Front-Run Protection</ExportedTooltip>}
                    checked={frontRunProtection}
                    onChange={(e) => setFrontRunProtection(e.target.checked)}
                />

                <div className="flex justify-between pt-6 border-t border-gray-700">
                    <ExportedButton type="button" onClick={onPrev} variant="secondary">
                        &larr; Previous
                    </ExportedButton>
                    <ExportedButton type="submit">
                        Save & Next <span className="ml-2">&rarr;</span>
                    </ExportedButton>
                </div>
            </form>

            {/* Custom Network Modal */}
            {showCustomNetworkModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowCustomNetworkModal(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Add Custom Network</h3></div>
                        <div className="p-6 space-y-4">
                            <ExportedInput label="Network Name" name="name" value={customNetworkForm.name} onChange={handleCustomNetworkChange} error={customNetworkErrors.name} placeholder="e.g., Optimism Mainnet" />
                            <ExportedInput label="Chain ID" name="chainId" type="number" value={customNetworkForm.chainId === 0 ? '' : customNetworkForm.chainId} onChange={handleCustomNetworkChange} error={customNetworkErrors.chainId} placeholder="e.g., 10" />
                            <ExportedInput label="RPC URL" name="rpcUrl" type="url" value={customNetworkForm.rpcUrl} onChange={handleCustomNetworkChange} error={customNetworkErrors.rpcUrl} placeholder="e.g., https://mainnet.optimism.io" />
                            <ExportedInput label="Block Explorer URL" name="blockExplorerUrl" type="url" value={customNetworkForm.blockExplorerUrl} onChange={handleCustomNetworkChange} error={customNetworkErrors.blockExplorerUrl} placeholder="e.g., https://optimistic.etherscan.io" />
                            <div className="flex justify-end space-x-4 mt-6">
                                <ExportedButton type="button" variant="secondary" onClick={() => setShowCustomNetworkModal(false)}>Cancel</ExportedButton>
                                <ExportedButton type="button" onClick={handleAddCustomNetwork}>Add Network</ExportedButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

// --- Step 5: Smart Contract Preview & Compile ---

export const ExportedSmartContractPreview: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
    const { currentTokenConfig, deploymentConfigs, showNotification } = useTokenIssuance();
    const [solidityCode, setSolidityCode] = useState<string>('// Generating contract code...');
    const [abi, setAbi] = useState<string>('// ABI will appear here after compilation...');
    const [bytecode, setBytecode] = useState<string>('// Bytecode will appear here after compilation...');
    const [isCompiling, setIsCompiling] = useState(false);
    const [compilationSuccess, setCompilationSuccess] = useState<boolean | null>(null);

    const generateSolidityCode = useCallback(() => {
        if (!currentTokenConfig) return '// No token configuration available.';

        let code = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
${currentTokenConfig.features.mintable ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Mintable.sol";' : ''}
${currentTokenConfig.features.burnable ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";' : ''}
${currentTokenConfig.features.pausable ? 'import "@openzeppelin/contracts/security/Pausable.sol";' : ''}
${currentTokenConfig.features.upgradable ? 'import "@openzeppelin/contracts/proxy/utils/Initializable.sol";' : ''}
${currentTokenConfig.features.snapshots ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";' : ''}
${currentTokenConfig.features.permit ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";' : ''}
${currentTokenConfig.features.flashMint ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20FlashMint.sol";' : ''}
${currentTokenConfig.features.erc1363 ? 'import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";' : ''} // ERC-1363 usually combined with pausable
import "@openzeppelin/contracts/access/Ownable.sol";

// For custom ERC-1363 (simplified)
${currentTokenConfig.features.erc1363 ? `
interface IERC1363Receiver {
    function onTokensReceived(address operator, address from, uint256 amount, bytes calldata data) external returns (bytes4);
}
interface IERC1363Spender {
    function onCallReceived(address operator, uint256 value, bytes calldata data) external returns (bytes4);
}
` : ''}

${currentTokenConfig.features.upgradable ? `contract ${currentTokenConfig.name.replace(/[^a-zA-Z0-9]/g, '')}V1 is Initializable, ERC20` : `contract ${currentTokenConfig.name.replace(/[^a-zA-Z0-9]/g, '')} is ERC20`}
${currentTokenConfig.features.mintable ? ', ERC20Mintable' : ''}
${currentTokenConfig.features.burnable ? ', ERC20Burnable' : ''}
${currentTokenConfig.features.pausable ? ', Pausable' : ''}
${currentTokenConfig.features.snapshots ? ', ERC20Snapshot' : ''}
${currentTokenConfig.features.permit ? ', ERC20Permit' : ''}
${currentTokenConfig.features.flashMint ? ', ERC20FlashMint' : ''}
${currentTokenConfig.features.erc1363 ? ', IERC1363Receiver, IERC1363Spender' : ''} // Simplified integration
, Ownable {

    string private _description;
    string private _websiteUrl;
    mapping(string => string) private _socialLinks;

    /// @custom:security-contact security@megacorp.com
    /// @dev This contract was generated by the MegaDashboard Token Issuance Platform.
    /// @notice A fungible token for ${currentTokenConfig.description || 'a decentralized application.'}

    ${currentTokenConfig.features.upgradable ? `
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        address owner_
    ) public initializer {
        __ERC20_init(name_, symbol_);
        __Ownable_init(owner_);
        ${currentTokenConfig.features.pausable ? '__Pausable_init();' : ''}
        ${currentTokenConfig.features.snapshots ? '__ERC20Snapshot_init();' : ''}
        ${currentTokenConfig.features.permit ? `_deployer = msg.sender;` : ''} // Internal state for permit
        
        _mint(owner_, initialSupply_); // Mint initial supply to owner
        _description = "${currentTokenConfig.description.replace(/"/g, '\\"')}";
        _websiteUrl = "${currentTokenConfig.websiteUrl || ''}";
        // Populate social links
        ${Object.entries(currentTokenConfig.socialLinks).map(([platform, link]) => `_socialLinks["${platform}"] = "${link}";`).join('\n        ')}
    }
    ` : `
    constructor(uint256 initialSupply_, address owner_) ERC20("${currentTokenConfig.name}", "${currentTokenConfig.symbol}") {
        _mint(owner_, initialSupply_);
        _transferOwnership(owner_);
        _description = "${currentTokenConfig.description.replace(/"/g, '\\"')}";
        _websiteUrl = "${currentTokenConfig.websiteUrl || ''}";
        // Populate social links
        ${Object.entries(currentTokenConfig.socialLinks).map(([platform, link]) => `_socialLinks["${platform}"] = "${link}";`).join('\n        ')}
    }
    `}

    ${currentTokenConfig.features.pausable ? `
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20 ${currentTokenConfig.features.snapshots ? ', ERC20Snapshot' : ''} ${currentTokenConfig.features.flashMint ? ', ERC20FlashMint' : ''} ) {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "ERC20Pausable: token transfer while paused");
    }
    ` : `
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20 ${currentTokenConfig.features.snapshots ? ', ERC20Snapshot' : ''} ${currentTokenConfig.features.flashMint ? ', ERC20FlashMint' : ''} ) {
        super._beforeTokenTransfer(from, to, amount);
    }
    `}

    ${currentTokenConfig.features.mintable ? `
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    ` : ''}

    ${currentTokenConfig.features.snapshots ? `
    function snapshot() public onlyOwner {
        _snapshot();
    }
    ` : ''}

    // Extended metadata functions
    function description() public view returns (string memory) {
        return _description;
    }

    function websiteUrl() public view returns (string memory) {
        return _websiteUrl;
    }

    function socialLink(string memory platform) public view returns (string memory) {
        return _socialLinks[platform];
    }

    // Custom ERC-1363 functions (simplified for demonstration)
    ${currentTokenConfig.features.erc1363 ? `
    function transferAndCall(address recipient, uint256 amount, bytes calldata data) public returns (bool) {
        _transfer(msg.sender, recipient, amount);
        require(recipient.code.length > 0, "ERC1363: transferAndCall to non-contract");
        bytes4 retval = IERC1363Receiver(recipient).onTokensReceived(msg.sender, address(this), amount, data);
        require(retval == IERC1363Receiver.onTokensReceived.selector, "ERC1363: onTokensReceived reverted");
        return true;
    }

    function approveAndCall(address spender, uint256 amount, bytes calldata data) public returns (bool) {
        _approve(msg.sender, spender, amount);
        require(spender.code.length > 0, "ERC1363: approveAndCall to non-contract");
        bytes4 retval = IERC1363Spender(spender).onCallReceived(msg.sender, amount, data);
        require(retval == IERC1363Spender.onCallReceived.selector, "ERC1363: onCallReceived reverted");
        return true;
    }

    function transferFromAndCall(address sender, address recipient, uint256 amount, bytes calldata data) public returns (bool) {
        _transfer(sender, recipient, amount);
        require(recipient.code.length > 0, "ERC1363: transferFromAndCall to non-contract");
        bytes4 retval = IERC1363Receiver(recipient).onTokensReceived(_msgSender(), sender, amount, data);
        require(retval == IERC1363Receiver.onTokensReceived.selector, "ERC1363: onTokensReceived reverted");
        return true;
    }
    ` : ''}
}
        `;

        // Add imports based on features (simplified, actual imports would be more complex)
        if (currentTokenConfig.type === 'ERC-721') {
            code = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
${currentTokenConfig.features.upgradable ? 'import "@openzeppelin/contracts/proxy/utils/Initializable.sol";' : ''}

${currentTokenConfig.features.upgradable ? `contract ${currentTokenConfig.name.replace(/[^a-zA-Z0-9]/g, '')}V1 is Initializable, ERC721` : `contract ${currentTokenConfig.name.replace(/[^a-zA-Z0-9]/g, '')} is ERC721`}
, Ownable {
    string private _baseTokenURI;

    ${currentTokenConfig.features.upgradable ? `
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        string memory baseTokenURI_,
        address owner_
    ) public initializer {
        __ERC721_init(name_, symbol_);
        __Ownable_init(owner_);
        _baseTokenURI = baseTokenURI_;
    }
    ` : `
    constructor(string memory name_, string memory symbol_, string memory baseTokenURI_, address owner_)
        ERC721(name_, symbol_) {
        _baseTokenURI = baseTokenURI_;
        _transferOwnership(owner_);
    }
    `}

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
            `;
        } else if (currentTokenConfig.type === 'ERC-1155') {
            code = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
${currentTokenConfig.features.upgradable ? 'import "@openzeppelin/contracts/proxy/utils/Initializable.sol";' : ''}

${currentTokenConfig.features.upgradable ? `contract ${currentTokenConfig.name.replace(/[^a-zA-Z0-9]/g, '')}V1 is Initializable, ERC1155` : `contract ${currentTokenConfig.name.replace(/[^a-zA-Z0-9]/g, '')} is ERC1155`}
, Ownable {
    string private _uri;

    ${currentTokenConfig.features.upgradable ? `
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory uri_,
        address owner_
    ) public initializer {
        __ERC1155_init(uri_);
        __Ownable_init(owner_);
        _uri = uri_;
    }
    ` : `
    constructor(string memory uri_, address owner_) ERC1155(uri_) {
        _uri = uri_;
        _transferOwnership(owner_);
    }
    `}

    function uri(uint256) public view override returns (string memory) {
        return _uri;
    }

    function setURI(string memory newuri) public onlyOwner {
        _uri = newuri;
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }
}
            `;
        }

        setSolidityCode(code);
    }, [currentTokenConfig]);

    useEffect(() => {
        generateSolidityCode();
    }, [generateSolidityCode]);

    const handleCompile = async () => {
        setIsCompiling(true);
        setCompilationSuccess(null);
        setAbi('// Compiling...');
        setBytecode('// Compiling...');

        // NOTE: This is a simulated compilation. In a real app, this would involve a Solidity compiler service.
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Simulate successful compilation
            const dummyAbi = JSON.stringify([{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }], null, 2);
            const dummyBytecode = `0x6080604052348015610010575f80fd5b50610...`; // Truncated dummy bytecode
            setAbi(dummyAbi);
            setBytecode(dummyBytecode);
            setCompilationSuccess(true);
            showNotification('Smart contract compiled successfully!', 'success');
        } catch (error) {
            console.error('Simulated compilation error:', error);
            setCompilationSuccess(false);
            setAbi('// Compilation failed.');
            setBytecode('// Compilation failed.');
            showNotification('Smart contract compilation failed. Please check the code for errors.', 'error');
        } finally {
            setIsCompiling(false);
        }
    };

    const handleDeploy = (e: React.FormEvent) => {
        e.preventDefault();
        if (!compilationSuccess) {
            showNotification('Please compile the contract successfully before deploying.', 'error');
            return;
        }
        onNext();
    };

    const hasErrors = !currentTokenConfig || !deploymentConfigs.length;

    return (
        <Card title="5. Smart Contract Preview & Compile" icon={<FaFileCode />}>
            <form onSubmit={handleDeploy} className="space-y-6">
                {hasErrors && (
                    <div className="bg-yellow-800/50 p-4 rounded-lg text-yellow-300 flex items-center space-x-2">
                        <FaExclamationTriangle />
                        <span>Please complete "1. Define Your Token" and "4. Deployment Settings" before reviewing and compiling.</span>
                    </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-4">Generated Solidity Code</h3>
                <p className="text-gray-400 text-sm mb-4">
                    Review the automatically generated Solidity smart contract code based on your configurations.
                    Ensure it meets your requirements before proceeding to compilation.
                </p>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-300 overflow-auto max-h-96 border border-gray-700">
                    <pre><code>{solidityCode}</code></pre>
                </div>
                <ExportedButton type="button" onClick={handleCompile} loading={isCompiling} disabled={hasErrors} icon={<FaCogs />}>
                    {isCompiling ? 'Compiling...' : 'Compile Contract'}
                </ExportedButton>

                {compilationSuccess !== null && (
                    <div className={`mt-6 p-4 rounded-lg ${compilationSuccess ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}`}>
                        {compilationSuccess ? (
                            <p className="flex items-center"><FaCheckCircle className="mr-2" /> Compilation Successful!</p>
                        ) : (
                            <p className="flex items-center"><FaTimesCircle className="mr-2" /> Compilation Failed. Check console for errors.</p>
                        )}
                    </div>
                )}

                {compilationSuccess && (
                    <div className="space-y-4 mt-6">
                        <h3 className="text-lg font-semibold text-white">Compiled Artifacts</h3>
                        <Card title="Contract ABI (Application Binary Interface)">
                            <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-blue-300 overflow-auto max-h-48 border border-gray-700">
                                <pre><code>{abi}</code></pre>
                            </div>
                        </Card>
                        <Card title="Contract Bytecode">
                            <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-yellow-300 overflow-auto max-h-48 border border-gray-700">
                                <pre><code>{bytecode}</code></pre>
                            </div>
                        </Card>
                        <p className="text-gray-400 text-sm">
                            These artifacts are essential for deploying and interacting with your smart contract on the blockchain.
                        </p>
                    </div>
                )}

                <div className="flex justify-between pt-6 border-t border-gray-700">
                    <ExportedButton type="button" onClick={onPrev} variant="secondary">
                        &larr; Previous
                    </ExportedButton>
                    <ExportedButton type="submit" disabled={!compilationSuccess}>
                        Deploy Contract <span className="ml-2">&rarr;</span>
                    </ExportedButton>
                </div>
            </form>
        </Card>
    );
};

// --- Step 6: Deployment Monitor ---

export const ExportedDeploymentMonitor: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
    const { currentTokenConfig, deploymentConfigs, deploymentHistory, setDeploymentHistory, showNotification } = useTokenIssuance();
    const [isDeploying, setIsDeploying] = useState(false);
    const [currentDeploymentStatus, setCurrentDeploymentStatus] = useState<DeploymentStatus | null>(null);

    const latestDeploymentConfig = deploymentConfigs[deploymentConfigs.length - 1];

    const simulateDeployment = useCallback(async () => {
        if (!currentTokenConfig || !latestDeploymentConfig) {
            showNotification('Missing token config or deployment settings.', 'error');
            return;
        }

        setIsDeploying(true);
        setDeploymentHistory(prev => []); // Clear previous for a new deployment simulation

        const deploymentId = `deploy-${Date.now()}`;
        const initialStatus: DeploymentStatus = {
            id: deploymentId,
            timestamp: new Date().toISOString(),
            status: 'pending',
            networkId: latestDeploymentConfig.network.id,
            tokenConfigId: currentTokenConfig.id,
        };
        setCurrentDeploymentStatus(initialStatus);
        setDeploymentHistory([initialStatus]);
        showNotification('Deployment initiated...', 'info');

        // Simulate deployment steps
        await new Promise(resolve => setTimeout(resolve, 3000));
        setCurrentDeploymentStatus(prev => prev ? { ...prev, status: 'deploying' } : null);
        setDeploymentHistory(prev => [{ ...initialStatus, status: 'deploying' }]);
        showNotification('Contract is being deployed to the network...', 'info');

        await new Promise(resolve => setTimeout(resolve, 5000));
        const transactionHash = `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        const contractAddress = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        setCurrentDeploymentStatus(prev => prev ? { ...prev, status: 'verifying', transactionHash, contractAddress } : null);
        setDeploymentHistory(prev => [{ ...initialStatus, status: 'verifying', transactionHash, contractAddress }]);
        showNotification('Transaction confirmed! Verifying contract...', 'info');

        await new Promise(resolve => setTimeout(resolve, 4000));
        const finalStatus: DeploymentStatus = {
            ...initialStatus,
            status: 'completed',
            transactionHash,
            contractAddress,
            blockNumber: Math.floor(Math.random() * 1000000) + 10000000,
        };
        setCurrentDeploymentStatus(finalStatus);
        setDeploymentHistory(prev => [{ ...finalStatus }]);
        setIsDeploying(false);
        showNotification('Contract deployed and verified successfully!', 'success');

        // Automatically move to the next step after a short delay
        setTimeout(() => onNext(), 2000);

    }, [currentTokenConfig, latestDeploymentConfig, setDeploymentHistory, showNotification, onNext]);

    useEffect(() => {
        // Trigger deployment automatically when component mounts, if not already deploying
        if (!isDeploying && latestDeploymentConfig && currentTokenConfig && deploymentHistory.length === 0) {
            simulateDeployment();
        }
    }, [isDeploying, latestDeploymentConfig, currentTokenConfig, deploymentHistory.length, simulateDeployment]);

    const deploymentSteps = [
        { label: 'Pending', status: 'pending' },
        { label: 'Deploying', status: 'deploying' },
        { label: 'Verifying', status: 'verifying' },
        { label: 'Completed', status: 'completed' },
    ];

    const currentStepIndex = deploymentSteps.findIndex(s => s.status === currentDeploymentStatus?.status);

    const blockExplorerLink = currentDeploymentStatus?.contractAddress && latestDeploymentConfig?.network.blockExplorerUrl
        ? `${latestDeploymentConfig.network.blockExplorerUrl}/address/${currentDeploymentStatus.contractAddress}`
        : '';
    const transactionLink = currentDeploymentStatus?.transactionHash && latestDeploymentConfig?.network.blockExplorerUrl
        ? `${latestDeploymentConfig.network.blockExplorerUrl}/tx/${currentDeploymentStatus.transactionHash}`
        : '';

    const hasErrors = !currentTokenConfig || !latestDeploymentConfig;

    return (
        <Card title="6. Deployment Monitor" icon={<FaEthereum />}>
            <div className="space-y-6">
                {hasErrors && (
                    <div className="bg-yellow-800/50 p-4 rounded-lg text-yellow-300 flex items-center space-x-2">
                        <FaExclamationTriangle />
                        <span>Please complete "1. Define Your Token" and "4. Deployment Settings" before deploying.</span>
                    </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-4">Live Deployment Status</h3>
                <p className="text-gray-400 text-sm">
                    Your smart contract is currently being deployed to the <strong className="text-cyan-400">{latestDeploymentConfig?.network.name || 'selected'}</strong> network.
                    Please monitor the progress below. This process can take a few minutes depending on network conditions.
                </p>

                <div className="relative flex justify-between items-center w-full py-4 px-4 bg-gray-800 rounded-lg">
                    {deploymentSteps.map((step, index) => (
                        <div key={step.label} className="flex flex-col items-center flex-1 z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                                ${index <= currentStepIndex ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400'}
                            `}>
                                {index <= currentStepIndex && <FaCheckCircle />}
                                {index > currentStepIndex && index < deploymentSteps.length -1 && <FaClock />}
                                {index === deploymentSteps.length -1 && index > currentStepIndex && <FaPlayCircle />}
                            </div>
                            <span className={`mt-2 text-xs text-center ${index <= currentStepIndex ? 'text-white' : 'text-gray-500'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                    <div className="absolute left-0 right-0 h-1 bg-gray-700 top-[calc(50%-2px)] mx-8 -z-0">
                        <div className="h-full bg-cyan-600 transition-all duration-500" style={{ width: `${(currentStepIndex / (deploymentSteps.length - 1)) * 100}%` }}></div>
                    </div>
                </div>

                {currentDeploymentStatus && (
                    <div className="bg-gray-800 p-6 rounded-lg space-y-4 border border-gray-700">
                        <p className="flex items-center space-x-2 text-gray-300">
                            <FaSpinner className={isDeploying ? "animate-spin text-cyan-500" : "text-gray-500"} />
                            <span>Current Status: <strong className={`font-semibold ${isDeploying ? 'text-cyan-400' : currentDeploymentStatus.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>{currentDeploymentStatus.status.toUpperCase()}</strong></span>
                        </p>
                        {currentDeploymentStatus.transactionHash && (
                            <p className="text-gray-300 text-sm">
                                Transaction Hash: <a href={transactionLink} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline break-all">{currentDeploymentStatus.transactionHash}</a>
                            </p>
                        )}
                        {currentDeploymentStatus.contractAddress && (
                            <p className="text-gray-300 text-sm">
                                Contract Address: <a href={blockExplorerLink} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline break-all">{currentDeploymentStatus.contractAddress}</a>
                            </p>
                        )}
                        {currentDeploymentStatus.blockNumber && (
                            <p className="text-gray-300 text-sm">
                                Deployed at Block: <span className="text-cyan-400">{currentDeploymentStatus.blockNumber.toLocaleString()}</span>
                            </p>
                        )}
                        {currentDeploymentStatus.error && (
                            <p className="text-red-500 text-sm">Error: {currentDeploymentStatus.error}</p>
                        )}
                        <p className="text-gray-400 text-xs">Timestamp: {new Date(currentDeploymentStatus.timestamp).toLocaleString()}</p>
                    </div>
                )}

                {!isDeploying && currentDeploymentStatus?.status !== 'completed' && (
                    <div className="mt-8 pt-6 border-t border-gray-700 flex justify-center">
                        <ExportedButton type="button" onClick={simulateDeployment} disabled={hasErrors}>
                            Retry Deployment
                        </ExportedButton>
                    </div>
                )}

                <div className="flex justify-between pt-6 border-t border-gray-700">
                    <ExportedButton type="button" onClick={onPrev} variant="secondary" disabled={isDeploying || currentDeploymentStatus?.status === 'completed'}>
                        &larr; Previous
                    </ExportedButton>
                    <ExportedButton type="button" onClick={onNext} disabled={isDeploying || currentDeploymentStatus?.status !== 'completed'}>
                        Go to Dashboard <span className="ml-2">&rarr;</span>
                    </ExportedButton>
                </div>
            </div>
        </Card>
    );
};

// --- Step 7: Post-Issuance Dashboard ---

export const ExportedPostIssuanceDashboard: React.FC<{ onPrev: () => void }> = ({ onPrev }) => {
    const { currentTokenConfig, deploymentHistory, tokenAllocations, activeAirdropCampaigns, activeGovernanceProposals, showNotification } = useTokenIssuance();
    const latestDeployment = deploymentHistory.find(d => d.status === 'completed');

    const [currentSupply, setCurrentSupply] = useState<number>(currentTokenConfig?.totalSupply || 0);
    const [totalBurned, setTotalBurned] = useState<number>(0);
    const [currentHolders, setCurrentHolders] = useState<number>(1); // Owner is 1
    const [marketCap, setMarketCap] = useState<number | null>(null);
    const [price, setPrice] = useState<number | null>(null);

    const [isMinting, setIsMinting] = useState(false);
    const [mintAmount, setMintAmount] = useState<number>(0);
    const [mintRecipient, setMintRecipient] = useState<string>('');

    const [isBurning, setIsBurning] = useState(false);
    const [burnAmount, setBurnAmount] = useState<number>(0);

    const [isPausing, setIsPausing] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (currentTokenConfig) {
            // Simulate initial market data
            setPrice(Math.random() * 0.1 + 0.01); // Between 0.01 and 0.11
            setCurrentSupply(currentTokenConfig.totalSupply);
            // Simulate an initial distribution to a few holders
            setCurrentHolders(5 + Math.floor(Math.random() * 10));
        }
    }, [currentTokenConfig]);

    useEffect(() => {
        if (currentTokenConfig && price) {
            setMarketCap(currentSupply * price);
        }
    }, [currentSupply, price, currentTokenConfig]);

    const handleMint = async () => {
        if (!currentTokenConfig?.features.mintable) {
            showNotification('Minting is not enabled for this token.', 'error');
            return;
        }
        if (!mintAmount || mintAmount <= 0) {
            showNotification('Mint amount must be greater than 0.', 'error');
            return;
        }
        if (!mintRecipient.match(/^0x[a-fA-F0-9]{40}$/)) {
            showNotification('Please enter a valid recipient address.', 'error');
            return;
        }

        setIsMinting(true);
        showNotification(`Minting ${mintAmount} ${currentTokenConfig.symbol} to ${mintRecipient}...`, 'info');
        // Simulate transaction
        await new Promise(resolve => setTimeout(resolve, 3000));
        setCurrentSupply(prev => prev + mintAmount);
        setMintAmount(0);
        setMintRecipient('');
        setIsMinting(false);
        showNotification(`${mintAmount} ${currentTokenConfig.symbol} minted successfully!`, 'success');
        // Simulate holder increase
        setCurrentHolders(prev => prev + 1);
    };

    const handleBurn = async () => {
        if (!currentTokenConfig?.features.burnable) {
            showNotification('Burning is not enabled for this token.', 'error');
            return;
        }
        if (!burnAmount || burnAmount <= 0) {
            showNotification('Burn amount must be greater than 0.', 'error');
            return;
        }
        if (burnAmount > currentSupply) {
            showNotification('Cannot burn more tokens than currently exist.', 'error');
            return;
        }

        setIsBurning(true);
        showNotification(`Burning ${burnAmount} ${currentTokenConfig.symbol}...`, 'info');
        // Simulate transaction
        await new Promise(resolve => setTimeout(resolve, 3000));
        setCurrentSupply(prev => prev - burnAmount);
        setTotalBurned(prev => prev + burnAmount);
        setBurnAmount(0);
        setIsBurning(false);
        showNotification(`${burnAmount} ${currentTokenConfig.symbol} burned successfully!`, 'success');
    };

    const handleTogglePause = async () => {
        if (!currentTokenConfig?.features.pausable) {
            showNotification('Pausing is not enabled for this token.', 'error');
            return;
        }

        setIsPausing(true);
        showNotification(isPaused ? 'Unpausing token transfers...' : 'Pausing token transfers...', 'info');
        // Simulate transaction
        await new Promise(resolve => setTimeout(resolve, 3000));
        setIsPaused(prev => !prev);
        setIsPausing(false);
        showNotification(isPaused ? 'Token unpaused successfully!' : 'Token paused successfully!', 'success');
    };

    const supplyBreakdownData = [
        { label: 'Circulating Supply', value: currentSupply - totalBurned, color: '#34d399' },
        { label: 'Locked/Vesting Supply', value: tokenAllocations.filter(a => a.vestingSchedule || a.isLocked).reduce((sum, a) => sum + a.amount, 0), color: '#fbbf24' },
        { label: 'Burned Supply', value: totalBurned, color: '#ef4444' },
    ];
    // Adjust total to ensure it matches currentTokenConfig.totalSupply for percentages,
    // or currentSupply for actual breakdown. Let's use currentTokenConfig.totalSupply as base.
    const totalForChart = currentTokenConfig?.totalSupply || 1;

    return (
        <Card title="7. Post-Issuance Dashboard" icon={<FaChartLine />}>
            <div className="space-y-8">
                {(!currentTokenConfig || !latestDeployment) && (
                    <div className="bg-yellow-800/50 p-4 rounded-lg text-yellow-300 flex items-center space-x-2">
                        <FaExclamationTriangle />
                        <span>Please ensure token configuration is complete and the token has been deployed to view the dashboard.</span>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardMetric label="Contract Address" value={latestDeployment?.contractAddress || 'N/A'} isAddress={true} />
                    <DashboardMetric label="Total Supply" value={currentTokenConfig?.totalSupply.toLocaleString() || 'N/A'} suffix={currentTokenConfig?.symbol} />
                    <DashboardMetric label="Current Circulating Supply" value={(currentSupply - totalBurned).toLocaleString()} suffix={currentTokenConfig?.symbol} />
                    <DashboardMetric label="Total Burned" value={totalBurned.toLocaleString()} suffix={currentTokenConfig?.symbol} />
                    <DashboardMetric label="Current Price (Simulated)" value={price ? `$${price.toFixed(4)}` : 'N/A'} />
                    <DashboardMetric label="Market Cap (Simulated)" value={marketCap ? `$${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'} />
                    <DashboardMetric label="Total Holders (Simulated)" value={currentHolders.toLocaleString()} />
                    <DashboardMetric label="Status" value={isPaused ? 'Paused' : 'Active'} color={isPaused ? 'text-red-500' : 'text-green-500'} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <ExportedChart
                        title="Token Supply Breakdown"
                        data={supplyBreakdownData.map(d => ({ ...d, value: d.value }))}
                    />
                    <Card title="Recent Activity (Simulated)" className="relative overflow-hidden">
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                            <ActivityLogItem type="deployment" message={`Contract deployed to ${latestDeployment?.networkId || 'N/A'}`} timestamp={latestDeployment?.timestamp || new Date().toISOString()} />
                            <ActivityLogItem type="transfer" message={`0x... minted 10,000 ${currentTokenConfig?.symbol}`} timestamp={new Date(Date.now() - 3600000).toISOString()} />
                            <ActivityLogItem type="transfer" message={`0x... transferred 500 ${currentTokenConfig?.symbol} to 0x...`} timestamp={new Date(Date.now() - 7200000).toISOString()} />
                            <ActivityLogItem type="burn" message={`0x... burned 2,000 ${currentTokenConfig?.symbol}`} timestamp={new Date(Date.now() - 10800000).toISOString()} />
                            <ActivityLogItem type="mint" message={`Owner minted 5,000 ${currentTokenConfig?.symbol} for liquidity.`} timestamp={new Date(Date.now() - 14400000).toISOString()} />
                            <ActivityLogItem type="update" message={`Vesting schedule updated for Team allocation.`} timestamp={new Date(Date.now() - 18000000).toISOString()} />
                        </div>
                        <ExportedButton variant="secondary" className="w-full mt-4">View All Transactions</ExportedButton>
                    </Card>
                </div>

                {currentTokenConfig && latestDeployment && (
                    <div className="mt-8 space-y-6 pt-6 border-t border-gray-700">
                        <h2 className="text-2xl font-bold text-white">Token Management Panel</h2>
                        <p className="text-gray-400 text-sm">
                            Execute privileged operations on your deployed token contract.
                            <strong className="text-red-400"> Use with caution.</strong>
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card title="Mint Tokens" icon={<FaPlayCircle />}>
                                {currentTokenConfig.features.mintable ? (
                                    <div className="space-y-4">
                                        <ExportedInput
                                            label="Amount to Mint"
                                            type="number"
                                            value={mintAmount === 0 ? '' : mintAmount}
                                            onChange={(e) => setMintAmount(parseFloat(e.target.value))}
                                            placeholder="e.g., 10000"
                                            min="1"
                                        />
                                        <ExportedInput
                                            label="Recipient Address"
                                            value={mintRecipient}
                                            onChange={(e) => setMintRecipient(e.target.value)}
                                            placeholder="0x..."
                                        />
                                        <ExportedButton onClick={handleMint} loading={isMinting} disabled={isPaused || !currentTokenConfig.features.mintable} className="w-full">
                                            {isMinting ? 'Minting...' : 'Mint Tokens'}
                                        </ExportedButton>
                                        {isPaused && <p className="text-red-400 text-sm mt-2">Cannot mint while token is paused.</p>}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">Minting is not enabled for this token contract.</p>
                                )}
                            </Card>

                            <Card title="Burn Tokens" icon={<FaBurn />}>
                                {currentTokenConfig.features.burnable ? (
                                    <div className="space-y-4">
                                        <ExportedInput
                                            label="Amount to Burn"
                                            type="number"
                                            value={burnAmount === 0 ? '' : burnAmount}
                                            onChange={(e) => setBurnAmount(parseFloat(e.target.value))}
                                            placeholder="e.g., 5000"
                                            min="1"
                                        />
                                        <ExportedButton onClick={handleBurn} loading={isBurning} disabled={isPaused || !currentTokenConfig.features.burnable} className="w-full" variant="danger">
                                            {isBurning ? 'Burning...' : 'Burn Tokens'}
                                        </ExportedButton>
                                        {isPaused && <p className="text-red-400 text-sm mt-2">Cannot burn while token is paused.</p>}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">Burning is not enabled for this token contract.</p>
                                )}
                            </Card>

                            <Card title="Pause/Unpause Transfers" icon={isPaused ? <FaPlayCircle /> : <FaPauseCircle />}>
                                {currentTokenConfig.features.pausable ? (
                                    <div className="space-y-4">
                                        <p className="text-gray-300">Current Status: <strong className={isPaused ? 'text-red-500' : 'text-green-500'}>{isPaused ? 'PAUSED' : 'ACTIVE'}</strong></p>
                                        <ExportedButton onClick={handleTogglePause} loading={isPausing} disabled={isPausing || !currentTokenConfig.features.pausable} className="w-full" variant={isPaused ? 'primary' : 'danger'}>
                                            {isPausing ? 'Processing...' : (isPaused ? 'Unpause Transfers' : 'Pause Transfers')}
                                        </ExportedButton>
                                        {isPaused && <p className="text-yellow-400 text-sm mt-2">All token transfers and approvals are currently halted.</p>}
                                        {!isPaused && <p className="text-gray-400 text-sm mt-2">Token transfers are active.</p>}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">Pausing functionality is not enabled for this token contract.</p>
                                )}
                            </Card>

                            <Card title="Manage Ownership" icon={<FaUsers />}>
                                <div className="space-y-4">
                                    <p className="text-gray-300 text-sm">Current Owner: <span className="text-cyan-400 break-all">{latestDeployment?.ownerAddress || 'N/A'}</span></p>
                                    <ExportedInput label="New Owner Address" placeholder="0x..." />
                                    <ExportedButton className="w-full" variant="secondary" disabled>
                                        Transfer Ownership (TODO)
                                    </ExportedButton>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-6 border-t border-gray-700">
                    <ExportedButton type="button" onClick={onPrev} variant="secondary">
                        &larr; Back to Deployment Monitor
                    </ExportedButton>
                </div>
            </div>
        </Card>
    );
};

export const DashboardMetric: React.FC<{ label: string; value: string | number; suffix?: string; isAddress?: boolean; color?: string; }> = ({ label, value, suffix, isAddress, color }) => (
    <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center justify-center text-center space-y-2 border border-gray-700">
        <p className="text-sm text-gray-400">{label}</p>
        {isAddress ? (
            <a href={`https://etherscan.io/address/${value}`} target="_blank" rel="noopener noreferrer" className="text-cyan-500 text-md font-semibold hover:underline break-all">
                {String(value).substring(0, 6)}...{String(value).substring(String(value).length - 4)}
            </a>
        ) : (
            <p className={`text-xl font-bold ${color || 'text-white'}`}>{value}{suffix && <span className="text-sm ml-1 text-gray-300">{suffix}</span>}</p>
        )}
    </div>
);

export const ActivityLogItem: React.FC<{ type: 'deployment' | 'transfer' | 'mint' | 'burn' | 'update'; message: string; timestamp: string }> = ({ type, message, timestamp }) => {
    let icon;
    let colorClass;
    switch (type) {
        case 'deployment': icon = <FaCheckCircle />; colorClass = 'text-green-500'; break;
        case 'transfer': icon = <FaExchangeAlt />; colorClass = 'text-blue-400'; break;
        case 'mint': icon = <FaPlayCircle />; colorClass = 'text-cyan-400'; break;
        case 'burn': icon = <FaBurn />; colorClass = 'text-red-400'; break;
        case 'update': icon = <FaCogs />; colorClass = 'text-yellow-400'; break;
        default: icon = <FaBell />; colorClass = 'text-gray-400';
    }

    return (
        <div className="flex items-start space-x-3 p-2 bg-gray-700/30 rounded-md">
            <span className={`flex-shrink-0 ${colorClass}`}>{icon}</span>
            <div className="flex-grow">
                <p className="text-sm text-gray-300">{message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(timestamp).toLocaleString()}</p>
            </div>
        </div>
    );
};

// --- Additional Views/Components for a Real-World Application ---

export const ExportedAirdropManager: React.FC = () => {
    const { currentTokenConfig, activeAirdropCampaigns, setActiveAirdropCampaigns, latestDeployment, showNotification } = useTokenIssuance();
    const [campaignName, setCampaignName] = useState('');
    const [recipientsInput, setRecipientsInput] = useState(''); // CSV or JSON input
    const [totalAirdropAmount, setTotalAirdropAmount] = useState(0);
    const [proofType, setProofType] = useState<'merkleTree' | 'directTransfer'>('directTransfer');
    const [scheduleDate, setScheduleDate] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleCreateAirdrop = async () => {
        if (!currentTokenConfig || !latestDeployment?.contractAddress) {
            showNotification('Token not deployed. Cannot create airdrop.', 'error');
            return;
        }

        const newErrors: Record<string, string> = {};
        if (!campaignName.trim()) newErrors.campaignName = 'Campaign name is required.';
        if (!recipientsInput.trim()) newErrors.recipientsInput = 'Recipient list is required.';
        if (totalAirdropAmount <= 0) newErrors.totalAirdropAmount = 'Total amount must be greater than 0.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showNotification('Please fill all required fields.', 'error');
            return;
        }

        setIsLoading(true);
        // Simulate parsing recipients and amounts
        const recipientsArray: { address: string; amount: number; }[] = recipientsInput.split('\n').map(line => {
            const parts = line.split(',');
            return { address: parts[0].trim(), amount: parseFloat(parts[1].trim() || '0') };
        }).filter(r => r.address.match(/^0x[a-fA-F0-9]{40}$/) && r.amount > 0);

        if (recipientsArray.length === 0) {
            newErrors.recipientsInput = 'No valid recipients found. Format: address,amount per line.';
            setErrors(newErrors);
            setIsLoading(false);
            showNotification('Invalid recipient list format.', 'error');
            return;
        }
        const calculatedTotal = recipientsArray.reduce((sum, r) => sum + r.amount, 0);
        if (calculatedTotal !== totalAirdropAmount) {
            newErrors.totalAirdropAmount = `Sum of recipient amounts (${calculatedTotal}) does not match Total Airdrop Amount.`;
            setErrors(newErrors);
            setIsLoading(false);
            showNotification('Total airdrop amount mismatch.', 'error');
            return;
        }


        const newCampaign: AirdropCampaign = {
            id: `airdrop-${Date.now()}`,
            name: campaignName,
            tokenAddress: latestDeployment.contractAddress,
            recipients: recipientsArray,
            totalAirdropAmount: totalAirdropAmount,
            status: scheduleDate ? 'scheduled' : 'draft',
            scheduleDate: scheduleDate || undefined,
            description: description,
            proofGenerationType: proofType,
            snapshotBlockNumber: proofType === 'merkleTree' ? Math.floor(Math.random() * 100000) + 10000000 : undefined, // Simulate a snapshot block for merkle
        };

        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        setActiveAirdropCampaigns(prev => [...prev, newCampaign]);
        showNotification(`Airdrop campaign "${campaignName}" created successfully!`, 'success');
        setIsLoading(false);
        // Reset form
        setCampaignName('');
        setRecipientsInput('');
        setTotalAirdropAmount(0);
        setScheduleDate('');
        setDescription('');
        setErrors({});
    };

    const handleExecuteAirdrop = async (campaignId: string) => {
        setIsLoading(true);
        showNotification('Executing airdrop...', 'info');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate execution
        setActiveAirdropCampaigns(prev => prev.map(campaign =>
            campaign.id === campaignId ? { ...campaign, status: 'completed', transactionHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` } : campaign
        ));
        setIsLoading(false);
        showNotification('Airdrop executed successfully!', 'success');
    };

    const handleCancelAirdrop = async (campaignId: string) => {
        setIsLoading(true);
        showNotification('Cancelling airdrop...', 'warning');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setActiveAirdropCampaigns(prev => prev.map(campaign =>
            campaign.id === campaignId ? { ...campaign, status: 'cancelled' } : campaign
        ));
        setIsLoading(false);
        showNotification('Airdrop cancelled.', 'info');
    };


    return (
        <Card title="Airdrop Manager" icon={<FaCloudDownloadAlt />} className="col-span-2">
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Create New Airdrop Campaign</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ExportedInput
                        label="Campaign Name"
                        value={campaignName}
                        onChange={(e) => { setCampaignName(e.target.value); setErrors(p => ({ ...p, campaignName: '' })); }}
                        placeholder="e.g., Early Adopter Airdrop"
                        error={errors.campaignName}
                    />
                    <ExportedInput
                        label="Total Airdrop Amount"
                        type="number"
                        value={totalAirdropAmount === 0 ? '' : totalAirdropAmount}
                        onChange={(e) => { setTotalAirdropAmount(parseFloat(e.target.value)); setErrors(p => ({ ...p, totalAirdropAmount: '' })); }}
                        placeholder="e.g., 100000"
                        min="1"
                        error={errors.totalAirdropAmount}
                    />
                </div>
                <ExportedTextArea
                    label="Recipient Addresses & Amounts (Address,Amount per line)"
                    value={recipientsInput}
                    onChange={(e) => { setRecipientsInput(e.target.value); setErrors(p => ({ ...p, recipientsInput: '' })); }}
                    rows={6}
                    placeholder="0xabc...123,1000&#10;0xdef...456,500&#10;0xghi...789,250"
                    error={errors.recipientsInput}
                />
                <ExportedSelect
                    label={<ExportedTooltip content="Merkle Tree is gas-efficient for large recipient lists. Direct Transfer is simpler for small lists.">Airdrop Proof Type</ExportedTooltip>}
                    value={proofType}
                    options={[
                        { value: 'directTransfer', label: 'Direct Transfer (ERC-20)' },
                        { value: 'merkleTree', label: 'Merkle Tree (Gas Efficient)' },
                    ]}
                    onChange={(e) => setProofType(e.target.value as 'merkleTree' | 'directTransfer')}
                />
                {proofType === 'merkleTree' && (
                    <div className="bg-blue-800/50 p-3 rounded text-blue-300 text-sm flex items-center space-x-2">
                        <FaInfoCircle />
                        <span>A Merkle Tree will be generated for off-chain proofs, allowing users to claim their airdrop. This requires a claim smart contract.</span>
                    </div>
                )}
                <ExportedInput
                    label="Schedule Date (Optional)"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                />
                <ExportedTextArea
                    label="Campaign Description (Optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe the purpose of this airdrop..."
                />
                <ExportedButton onClick={handleCreateAirdrop} loading={isLoading} disabled={isLoading || !currentTokenConfig || !latestDeployment?.contractAddress} className="w-full">
                    {isLoading ? 'Creating Campaign...' : 'Create Airdrop Campaign'}
                </ExportedButton>

                <h3 className="text-xl font-semibold text-white mt-8 pt-6 border-t border-gray-700">Active Campaigns</h3>
                {activeAirdropCampaigns.length === 0 ? (
                    <p className="text-gray-400">No active airdrop campaigns.</p>
                ) : (
                    <div className="space-y-4">
                        {activeAirdropCampaigns.map(campaign => (
                            <Card key={campaign.id} className="bg-gray-700/50">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-white">{campaign.name}</h4>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        campaign.status === 'active' ? 'bg-green-600' :
                                        campaign.status === 'scheduled' ? 'bg-blue-600' :
                                        campaign.status === 'completed' ? 'bg-gray-600' :
                                        'bg-red-600'
                                    } text-white`}>{campaign.status.toUpperCase()}</span>
                                </div>
                                <p className="text-sm text-gray-300">Total Amount: {campaign.totalAirdropAmount.toLocaleString()} {currentTokenConfig?.symbol}</p>
                                <p className="text-sm text-gray-300">Recipients: {campaign.recipients.length}</p>
                                {campaign.scheduleDate && <p className="text-sm text-gray-300">Scheduled: {new Date(campaign.scheduleDate).toLocaleDateString()}</p>}
                                {campaign.transactionHash && <p className="text-sm text-gray-300 break-all">Tx Hash: <a href={`#`} className="text-cyan-400 hover:underline">{campaign.transactionHash}</a></p>}
                                <div className="mt-4 flex space-x-2">
                                    {campaign.status === 'draft' || campaign.status === 'scheduled' ? (
                                        <>
                                            <ExportedButton onClick={() => handleExecuteAirdrop(campaign.id)} disabled={isLoading} icon={<FaPlayCircle />}>
                                                Execute Now
                                            </ExportedButton>
                                            <ExportedButton variant="danger" onClick={() => handleCancelAirdrop(campaign.id)} disabled={isLoading} icon={<FaTimesCircle />}>
                                                Cancel
                                            </ExportedButton>
                                        </>
                                    ) : campaign.status === 'completed' && (
                                        <ExportedButton variant="secondary" disabled>View Report</ExportedButton>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};


export const ExportedGovernanceSetup: React.FC = () => {
    const { currentTokenConfig, activeGovernanceProposals, setActiveGovernanceProposals, latestDeployment, showNotification } = useTokenIssuance();
    const [proposalTitle, setProposalTitle] = useState('');
    const [proposalDescription, setProposalDescription] = useState('');
    const [votingDurationDays, setVotingDurationDays] = useState(7);
    const [quorumPercentage, setQuorumPercentage] = useState(10);
    const [thresholdPercentage, setThresholdPercentage] = useState(50);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleCreateProposal = async () => {
        if (!currentTokenConfig || !latestDeployment?.contractAddress) {
            showNotification('Token not deployed. Cannot create governance proposal.', 'error');
            return;
        }
        if (!currentTokenConfig.features.governanceModule) {
            showNotification('Governance module not enabled for this token.', 'error');
            return;
        }

        const newErrors: Record<string, string> = {};
        if (!proposalTitle.trim()) newErrors.proposalTitle = 'Proposal title is required.';
        if (!proposalDescription.trim()) newErrors.proposalDescription = 'Proposal description is required.';
        if (votingDurationDays <= 0) newErrors.votingDurationDays = 'Voting duration must be greater than 0.';
        if (quorumPercentage <= 0 || quorumPercentage > 100) newErrors.quorumPercentage = 'Quorum must be between 1-100.';
        if (thresholdPercentage <= 0 || thresholdPercentage > 100) newErrors.thresholdPercentage = 'Threshold must be between 1-100.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showNotification('Please fill all required fields correctly.', 'error');
            return;
        }

        setIsLoading(true);
        const startTime = new Date().toISOString();
        const endTime = new Date(Date.now() + votingDurationDays * 24 * 60 * 60 * 1000).toISOString();
        const newProposal: GovernanceProposal = {
            id: `proposal-${Date.now()}`,
            title: proposalTitle,
            description: proposalDescription,
            proposer: latestDeployment.ownerAddress, // Simplified, would be connected wallet
            status: 'active',
            startTime,
            endTime,
            snapshotBlock: Math.floor(Math.random() * 100000) + 10000000, // Simulate snapshot block
            quorum: quorumPercentage,
            threshold: thresholdPercentage,
            votesFor: 0,
            votesAgainst: 0,
            votesAbstain: 0,
        };

        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        setActiveGovernanceProposals(prev => [...prev, newProposal]);
        showNotification(`Governance proposal "${proposalTitle}" created successfully!`, 'success');
        setIsLoading(false);
        // Reset form
        setProposalTitle('');
        setProposalDescription('');
        setVotingDurationDays(7);
        setQuorumPercentage(10);
        setThresholdPercentage(50);
        setErrors({});
    };

    const handleSimulateVote = (proposalId: string) => {
        setActiveGovernanceProposals(prev => prev.map(p =>
            p.id === proposalId && p.status === 'active' ? {
                ...p,
                votesFor: p.votesFor + Math.floor(Math.random() * 100) + 1,
                votesAgainst: p.votesAgainst + Math.floor(Math.random() * 50),
                votesAbstain: p.votesAbstain + Math.floor(Math.random() * 20),
            } : p
        ));
        showNotification('Simulated votes added.', 'info');
    };

    const handleEndVoting = (proposalId: string) => {
        setActiveGovernanceProposals(prev => prev.map(p => {
            if (p.id === proposalId) {
                const totalVotes = p.votesFor + p.votesAgainst + p.votesAbstain;
                const quorumMet = (totalVotes / (currentTokenConfig?.totalSupply || 1)) * 100 >= p.quorum;
                const passedThreshold = (p.votesFor / totalVotes) * 100 >= p.threshold;
                let status: GovernanceProposal['status'] = 'defeated';
                if (quorumMet && passedThreshold) {
                    status = 'executed'; // Simulate execution
                } else if (quorumMet && !passedThreshold) {
                    status = 'defeated';
                } else {
                    status = 'defeated'; // Quorum not met
                }

                return { ...p, status, endTime: new Date().toISOString() };
            }
            return p;
        }));
        showNotification('Voting ended for proposal.', 'info');
    };

    return (
        <Card title="Governance Setup" icon={<FaBalanceScale />} className="col-span-2">
            <div className="space-y-6">
                {!currentTokenConfig?.features.governanceModule && (
                    <div className="bg-yellow-800/50 p-4 rounded-lg text-yellow-300 flex items-center space-x-2">
                        <FaExclamationTriangle />
                        <span>Governance module is not enabled for this token in Step 3. Functionality will be limited.</span>
                    </div>
                )}
                <h3 className="text-xl font-semibold text-white">Create New Governance Proposal</h3>
                <ExportedInput
                    label="Proposal Title"
                    value={proposalTitle}
                    onChange={(e) => { setProposalTitle(e.target.value); setErrors(p => ({ ...p, proposalTitle: '' })); }}
                    placeholder="e.g., Implement Buyback Program"
                    error={errors.proposalTitle}
                    disabled={!currentTokenConfig?.features.governanceModule}
                />
                <ExportedTextArea
                    label="Proposal Description"
                    value={proposalDescription}
                    onChange={(e) => { setProposalDescription(e.target.value); setErrors(p => ({ ...p, proposalDescription: '' })); }}
                    rows={5}
                    placeholder="Provide detailed context, pros, cons, and implementation plan for the proposal..."
                    error={errors.proposalDescription}
                    disabled={!currentTokenConfig?.features.governanceModule}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ExportedInput
                        label="Voting Duration (Days)"
                        type="number"
                        value={votingDurationDays}
                        onChange={(e) => { setVotingDurationDays(parseInt(e.target.value)); setErrors(p => ({ ...p, votingDurationDays: '' })); }}
                        min="1"
                        error={errors.votingDurationDays}
                        disabled={!currentTokenConfig?.features.governanceModule}
                    />
                    <ExportedInput
                        label="Quorum (%)"
                        type="number"
                        value={quorumPercentage}
                        onChange={(e) => { setQuorumPercentage(parseInt(e.target.value)); setErrors(p => ({ ...p, quorumPercentage: '' })); }}
                        min="1"
                        max="100"
                        error={errors.quorumPercentage}
                        disabled={!currentTokenConfig?.features.governanceModule}
                    />
                    <ExportedInput
                        label="Threshold (%) to Pass"
                        type="number"
                        value={thresholdPercentage}
                        onChange={(e) => { setThresholdPercentage(parseInt(e.target.value)); setErrors(p => ({ ...p, thresholdPercentage: '' })); }}
                        min="1"
                        max="100"
                        error={errors.thresholdPercentage}
                        disabled={!currentTokenConfig?.features.governanceModule}
                    />
                </div>
                <ExportedButton onClick={handleCreateProposal} loading={isLoading} disabled={isLoading || !currentTokenConfig?.features.governanceModule} className="w-full">
                    {isLoading ? 'Creating Proposal...' : 'Create Proposal'}
                </ExportedButton>

                <h3 className="text-xl font-semibold text-white mt-8 pt-6 border-t border-gray-700">Active & Past Proposals</h3>
                {activeGovernanceProposals.length === 0 ? (
                    <p className="text-gray-400">No governance proposals yet.</p>
                ) : (
                    <div className="space-y-4">
                        {activeGovernanceProposals.map(proposal => (
                            <Card key={proposal.id} className="bg-gray-700/50">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-white">{proposal.title}</h4>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        proposal.status === 'active' ? 'bg-green-600' :
                                        proposal.status === 'executed' ? 'bg-blue-600' :
                                        proposal.status === 'defeated' ? 'bg-red-600' :
                                        'bg-gray-600'
                                    } text-white`}>{proposal.status.toUpperCase()}</span>
                                </div>
                                <p className="text-sm text-gray-400 mb-2 max-h-24 overflow-y-auto">{proposal.description}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                                    <p>Proposer: <span className="text-cyan-400 break-all">{proposal.proposer.substring(0, 6)}...</span></p>
                                    <p>Voting Ends: {new Date(proposal.endTime).toLocaleDateString()} {new Date(proposal.endTime).toLocaleTimeString()}</p>
                                    <p>Quorum: {proposal.quorum}%</p>
                                    <p>Threshold: {proposal.threshold}%</p>
                                    <p className="flex items-center"><FaCheckCircle className="text-green-500 mr-1" /> For: {proposal.votesFor.toLocaleString()}</p>
                                    <p className="flex items-center"><FaTimesCircle className="text-red-500 mr-1" /> Against: {proposal.votesAgainst.toLocaleString()}</p>
                                    <p className="flex items-center"><FaBan className="text-yellow-500 mr-1" /> Abstain: {proposal.votesAbstain.toLocaleString()}</p>
                                    <p>Total Votes: {(proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain).toLocaleString()}</p>
                                </div>
                                {proposal.status === 'active' && (
                                    <div className="mt-4 flex space-x-2">
                                        <ExportedButton onClick={() => handleSimulateVote(proposal.id)} icon={<FaVoteYea />}>
                                            Simulate Vote
                                        </ExportedButton>
                                        <ExportedButton onClick={() => handleEndVoting(proposal.id)} variant="secondary" icon={<FaFlag />}>
                                            End Voting Now
                                        </ExportedButton>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};

export const ExportedAuditAndSecurityReport: React.FC = () => {
    const { currentTokenConfig, deploymentHistory } = useTokenIssuance();
    const latestDeployment = deploymentHistory.find(d => d.status === 'completed');

    const [auditResults, setAuditResults] = useState<{ id: string; type: 'info' | 'warning' | 'critical'; message: string; remediation?: string; }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const runSimulatedAudit = async () => {
        setIsLoading(true);
        setAuditResults([]);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate audit duration

        const results: typeof auditResults = [];

        // General checks
        if (!currentTokenConfig?.description) {
            results.push({ id: 'D001', type: 'warning', message: 'Token description is missing. This can impact investor clarity.', remediation: 'Add a comprehensive token description in the token definition step.' });
        }
        if (!currentTokenConfig?.websiteUrl) {
            results.push({ id: 'D002', type: 'warning', message: 'Official website URL is missing. Important for legitimacy and information.', remediation: 'Add an official website URL in the token definition step.' });
        }
        if (!currentTokenConfig?.socialLinks || Object.keys(currentTokenConfig.socialLinks).length === 0) {
            results.push({ id: 'D003', type: 'info', message: 'No social media links provided. Consider adding them for community engagement.', remediation: 'Add relevant social media links in the token definition step.' });
        }

        // ERC-20 specific checks
        if (currentTokenConfig?.type === 'ERC-20') {
            if (currentTokenConfig.totalSupply === 0) {
                results.push({ id: 'T001', type: 'critical', message: 'Total supply is 0. Token will be unusable.', remediation: 'Set a valid total supply in the token definition step.' });
            }
            if (currentTokenConfig.decimals > 18 || currentTokenConfig.decimals < 0) {
                results.push({ id: 'T002', type: 'warning', message: 'Uncommon decimal count. Standard is 18.', remediation: 'Consider setting decimals to 18 for broad compatibility, or justify a different value.' });
            }
            if (currentTokenConfig.features.mintable && latestDeployment?.ownerAddress) {
                results.push({ id: 'F001', type: 'warning', message: 'Mintable token with single owner control. Centralized minting carries risk.', remediation: 'Consider implementing multi-sig for minting or decentralized governance for minting authorization.' });
            }
            if (currentTokenConfig.features.pausable && latestDeployment?.ownerAddress) {
                results.push({ id: 'F002', type: 'warning', message: 'Pausable token with single owner control. Centralized pause/unpause carries risk.', remediation: 'Consider implementing multi-sig for pausing or decentralized governance for pause authorization.' });
            }
            if (currentTokenConfig.features.upgradable && !latestDeployment?.proxyAdminAddress) { // Simplified check
                results.push({ id: 'F003', type: 'critical', message: 'Upgradable contract selected but no proxy admin address defined or recognized. This could lead to a non-upgradable or unmanaged proxy.', remediation: 'Ensure a valid proxy admin address is specified and properly configured for upgradable contracts.' });
            }
            if (currentTokenConfig.features.erc1363 && !currentTokenConfig.features.pausable) {
                 results.push({ id: 'F004', type: 'info', message: 'ERC-1363 is often combined with Pausable to prevent malicious contract interactions during a pause.', remediation: 'Consider enabling Pausable feature for ERC-1363 token for enhanced security.' });
            }
        }

        // Deployment checks
        if (!latestDeployment) {
            results.push({ id: 'D004', type: 'critical', message: 'Token has not been deployed yet. No live contract to audit.', remediation: 'Complete the deployment process to run a full audit.' });
        } else {
            if (latestDeployment.gasPriceStrategy === 'custom' && latestDeployment.customGasPriceGwei && latestDeployment.customGasPriceGwei > 200) { // Arbitrary high value
                results.push({ id: 'D005', type: 'warning', message: 'High custom gas price (over 200 Gwei) used for deployment. Could indicate excessive transaction cost or network congestion.', remediation: 'Review network gas prices before deploying with custom settings.' });
            }
            if (!latestDeployment.frontRunProtection) {
                results.push({ id: 'D006', type: 'info', message: 'Front-run protection was not enabled. While not always critical, it can be beneficial for fair launch and avoiding MEV attacks.', remediation: 'Consider enabling front-run protection for sensitive deployments.' });
            }
            if (latestDeployment.ownerAddress === '0x0000000000000000000000000000000000000000') {
                results.push({ id: 'D007', type: 'critical', message: 'Contract deployed with zero address as owner. This effectively relinquishes ownership, making the contract unmanageable.', remediation: 'Ensure a valid, controlled owner address is set for deployment.' });
            }
        }

        // Tokenomics checks (simplified)
        // NOTE: A real audit would deeply analyze vesting, distribution, etc.
        const totalAllocPercentage = 100; // Assuming it sums to 100 from previous step
        if (totalAllocPercentage !== 100) {
            results.push({ id: 'A001', type: 'critical', message: 'Total allocation percentage is not 100%. This will result in an incorrect token distribution.', remediation: 'Adjust token allocations to sum exactly 100% in the tokenomics step.' });
        }
        if (currentTokenConfig?.type === 'ERC-20' && currentTokenConfig.totalSupply > 10**27) { // Extremely large number for example
            results.push({ id: 'A002', type: 'warning', message: 'Extremely high total supply (e.g., more than 10^27). May lead to precision issues or unexpected behavior in some dApps.', remediation: 'Review and consider reducing total supply or adjusting decimals.' });
        }


        setAuditResults(results);
        setIsLoading(false);
    };

    return (
        <Card title="Audit & Security Report" icon={<FaLock />} className="col-span-2">
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Simulated Smart Contract Audit</h3>
                <p className="text-gray-400 text-sm">
                    This report provides a simulated security audit and best practice recommendations based on your token configuration and deployment settings.
                    <strong className="text-red-400"> This is NOT a real audit and does not replace professional security assessments.</strong>
                </p>

                <ExportedButton onClick={runSimulatedAudit} loading={isLoading} icon={<FaShieldAlt />}>
                    {isLoading ? 'Running Audit...' : 'Run Simulated Audit'}
                </ExportedButton>

                {auditResults.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-700 space-y-4">
                        <h4 className="text-lg font-semibold text-white">Audit Findings ({auditResults.length} issues)</h4>
                        {auditResults.map(finding => (
                            <div key={finding.id} className={`p-4 rounded-lg border-l-4 ${
                                finding.type === 'critical' ? 'bg-red-800/50 border-red-500' :
                                finding.type === 'warning' ? 'bg-yellow-800/50 border-yellow-500' :
                                'bg-blue-800/50 border-blue-500'
                            } `}>
                                <div className="flex items-center space-x-2 text-sm font-semibold">
                                    {finding.type === 'critical' && <FaExclamationTriangle className="text-red-400" />}
                                    {finding.type === 'warning' && <FaExclamationTriangle className="text-yellow-400" />}
                                    {finding.type === 'info' && <FaInfoCircle className="text-blue-400" />}
                                    <span className="text-gray-200">[{finding.id}] {finding.type.toUpperCase()}:</span>
                                </div>
                                <p className="text-gray-300 mt-2 text-sm">{finding.message}</p>
                                {finding.remediation && (
                                    <p className="text-gray-400 text-xs mt-2"><strong>Remediation:</strong> {finding.remediation}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};

// --- Main Token Issuance View Component ---

const TokenIssuanceView: React.FC = () => {
    const { aiGeneratedTokenomics, setAiGeneratedTokenomics, isLoading, setIsLoading, showNotification } = useTokenIssuance();
    const [isGeneratorOpen, setGeneratorOpen] = useState(false);
    const [prompt, setPrompt] = useState("a utility token for a decentralized cloud storage network");
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        "Token Definition",
        "Tokenomics & Allocation",
        "Contract Configuration",
        "Deployment Settings",
        "Code Review & Compile",
        "Deployment Monitor",
        "Post-Issuance Dashboard",
        // Add more steps for Airdrop, Governance, Audit later as needed, or make them sub-modules of dashboard
    ];

    const handleGenerate = async () => {
        setIsLoading(true);
        setAiGeneratedTokenomics(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            // Expanded schema for more detailed tokenomics generation
            const schema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Suggestive token name" },
                    symbol: { type: Type.STRING, description: "Suggestive token symbol (2-10 uppercase chars)" },
                    description: { type: Type.STRING, description: "Detailed token purpose and utility" },
                    totalSupply: { type: Type.NUMBER, description: "Total supply of the token" },
                    decimals: { type: Type.NUMBER, description: "Number of decimals, typically 18" },
                    allocation: {
                        type: Type.OBJECT,
                        properties: {
                            team: { type: Type.NUMBER, description: "Percentage for team, e.g., 20" },
                            investors: { type: Type.NUMBER, description: "Percentage for investors (seed, private, public combined), e.g., 30" },
                            ecosystem: { type: Type.NUMBER, description: "Percentage for ecosystem development and grants, e.g., 25" },
                            treasury: { type: Type.NUMBER, description: "Percentage for project treasury, e.g., 15" },
                            marketing: { type: Type.NUMBER, description: "Percentage for marketing and partnerships, e.g., 5" },
                            liquidity: { type: Type.NUMBER, description: "Percentage for initial liquidity provisioning, e.g., 5" },
                        },
                        required: ["team", "investors", "ecosystem", "treasury", "marketing", "liquidity"]
                    },
                    vestingRecommendations: {
                        type: Type.OBJECT,
                        properties: {
                            team: { type: Type.STRING, description: "Vesting recommendation for team, e.g., 3-year linear, 1-year cliff" },
                            investors: { type: Type.STRING, description: "Vesting recommendation for investors, e.g., 2-year linear, 6-month cliff" },
                        }
                    },
                    utilitySuggestions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Key utility features for the token"
                    }
                }
            };
            const fullPrompt = `Generate a detailed tokenomics model in JSON format for this token concept: "${prompt}". Include name, symbol, a detailed description, total supply (realistic number, e.g., 100M-1B), decimals (default 18), and a percentage allocation breakdown for team, investors, ecosystem, treasury, marketing, and liquidity. Ensure total allocation sums to 100%. Also provide vesting recommendations for team and investors, and a few utility suggestions.`;
            const response = await ai.models.generateContent({ model: 'gemini-1.5-flash', contents: [{ text: fullPrompt }], config: { responseMimeType: "application/json", responseSchema: schema } });
            const parsedResponse = JSON.parse(response.text);

            // Ensure allocations sum to 100%, adjust if needed (simple normalization)
            if (parsedResponse.allocation) {
                const totalAllocSum = Object.values(parsedResponse.allocation).reduce((sum: number, val) => sum + (typeof val === 'number' ? val : 0), 0);
                if (totalAllocSum !== 100 && totalAllocSum > 0) {
                    const factor = 100 / totalAllocSum;
                    for (const key in parsedResponse.allocation) {
                        if (typeof parsedResponse.allocation[key] === 'number') {
                            parsedResponse.allocation[key] = Math.round((parsedResponse.allocation[key] as number) * factor * 100) / 100; // Round to 2 decimal places
                        }
                    }
                    showNotification('AI tokenomics allocation adjusted to sum 100%.', 'warning');
                }
            }
            setAiGeneratedTokenomics(parsedResponse);
            setGeneratorOpen(false); // Close generator on success
            showNotification('AI tokenomics model generated successfully!', 'success');

        } catch (error) {
            console.error("AI Generation Error:", error);
            showNotification(`AI generation failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
            setAiGeneratedTokenomics({ error: error instanceof Error ? error.message : String(error) });
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return <ExportedTokenDefinitionForm onNext={() => setCurrentStep(1)} />;
            case 1: return <ExportedTokenomicsAllocationForm onNext={() => setCurrentStep(2)} onPrev={() => setCurrentStep(0)} />;
            case 2: return <ExportedSmartContractConfiguration onNext={() => setCurrentStep(3)} onPrev={() => setCurrentStep(1)} />;
            case 3: return <ExportedDeploymentSettings onNext={() => setCurrentStep(4)} onPrev={() => setCurrentStep(2)} />;
            case 4: return <ExportedSmartContractPreview onNext={() => setCurrentStep(5)} onPrev={() => setCurrentStep(3)} />;
            case 5: return <ExportedDeploymentMonitor onNext={() => setCurrentStep(6)} onPrev={() => setCurrentStep(4)} />;
            case 6: return (
                <>
                    <ExportedPostIssuanceDashboard onPrev={() => setCurrentStep(5)} />
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ExportedAirdropManager />
                        <ExportedGovernanceSetup />
                        <ExportedAuditAndSecurityReport />
                        {/* Placeholder for other management tools */}
                        <Card title="Token Treasury Management" icon={<FaBriefcase />} className="col-span-1">
                            <p className="text-gray-400 text-sm">
                                Manage the project's token treasury, including fund transfers, budget allocations, and reporting.
                                (Requires integration with a multi-sig or governance-controlled treasury contract).
                            </p>
                            <div className="space-y-3 mt-4">
                                <ExportedInput label="Treasury Balance (Simulated)" value="10,000,000 MCT" disabled />
                                <ExportedInput label="Recipient Address" placeholder="0x..." />
                                <ExportedInput label="Amount to Transfer" type="number" placeholder="e.g., 1000" />
                                <ExportedButton disabled className="w-full" variant="secondary">
                                    Propose Treasury Transfer (TODO)
                                </ExportedButton>
                                <ExportedButton disabled className="w-full" variant="secondary">
                                    View Treasury Reports (TODO)
                                </ExportedButton>
                            </div>
                        </Card>
                        <Card title="Staking & Rewards Management" icon={<FaLock />} className="col-span-1">
                            <p className="text-gray-400 text-sm">
                                Configure and monitor staking pools, distribute rewards, and manage liquidity mining programs.
                            </p>
                            <div className="space-y-3 mt-4">
                                <ExportedInput label="Staking Pool Balance (Simulated)" value="5,000,000 MCT" disabled />
                                <ExportedInput label="Reward Rate (%)" type="number" placeholder="e.g., 10" />
                                <ExportedButton disabled className="w-full" variant="secondary">
                                    Configure Staking Pool (TODO)
                                </ExportedButton>
                                <ExportedButton disabled className="w-full" variant="secondary">
                                    Distribute Rewards (TODO)
                                </ExportedButton>
                            </div>
                        </Card>
                        <Card title="Legal & Compliance" icon={<FaBalanceScale />} className="col-span-1">
                            <p className="text-gray-400 text-sm">
                                Tools and resources to ensure your token adheres to relevant legal and regulatory frameworks.
                                <strong className="text-red-400"> This is critical for real-world applications.</strong>
                            </p>
                            <div className="space-y-3 mt-4">
                                <ExportedCheckbox label="KYC/AML Integration (Simulated)" checked disabled />
                                <ExportedCheckbox label="Accredited Investor Verification (Simulated)" checked disabled />
                                <ExportedButton disabled className="w-full" variant="secondary">
                                    Generate Legal Disclaimers (TODO)
                                </ExportedButton>
                                <ExportedButton disabled className="w-full" variant="secondary">
                                    Security Token Offering (STO) Tools (TODO)
                                </ExportedButton>
                            </div>
                        </Card>
                    </div>
                </>
            );
            default: return <p>Unknown Step</p>;
        }
    };
    
    return (
        <TokenIssuanceProvider>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Token Issuance Platform</h2>
                    <ExportedButton onClick={() => setGeneratorOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Tokenomics Modeler</ExportedButton>
                </div>

                <div className="relative">
                    <ExportedProgressBar steps={steps} currentStep={currentStep} />
                </div>

                {renderStepContent()}
            </div>
            {isGeneratorOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setGeneratorOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">AI Tokenomics Modeler</h3>
                            <button onClick={() => setGeneratorOpen(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <ExportedTextArea
                                label="Describe your token concept (e.g., utility, industry, target users)..."
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="a utility token for a decentralized cloud storage network"
                                rows={4}
                            />
                            <ExportedButton onClick={handleGenerate} loading={isLoading} className="w-full">
                                {isLoading ? 'Generating...' : 'Generate Model'}
                            </ExportedButton>
                            {aiGeneratedTokenomics && aiGeneratedTokenomics.error && (
                                <Card title="AI Error" className="bg-red-800/50 border-red-700">
                                    <pre className="text-xs text-red-300">{aiGeneratedTokenomics.error}</pre>
                                </Card>
                            )}
                            {aiGeneratedTokenomics && !aiGeneratedTokenomics.error && (
                                <Card title="Generated Tokenomics Preview">
                                    <pre className="text-xs text-gray-300 overflow-auto max-h-60">{JSON.stringify(aiGeneratedTokenomics, null, 2)}</pre>
                                    <p className="mt-2 text-xs text-gray-400">This model will be used to pre-fill the token definition and allocation forms.</p>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </TokenIssuanceProvider>
    );
};

export default TokenIssuanceView;
