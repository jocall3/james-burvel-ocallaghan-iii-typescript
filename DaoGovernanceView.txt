import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// --- START: NEW IMPORTS FOR EXTENDED FUNCTIONALITY ---
// Assuming these are standard icon libraries or similar, not creating them for line count
// import { FiPieChart, FiUsers, FiDollarSign, FiZap, FiSettings, FiPlusCircle, FiBarChart2, FiGlobe, FiMessageSquare, FiBell, FiChevronRight } from 'react-icons/fi';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Placeholder for charts
// --- END: NEW IMPORTS FOR EXTENDED FUNCTIONALITY ---

// --- START: MOCK DATA AND TYPE DEFINITIONS (adds significant lines) ---

// Utility types
type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

// DAO specific types
export enum ProposalStatus {
    Pending = 'Pending',
    Active = 'Active',
    Passed = 'Passed',
    Failed = 'Failed',
    Executed = 'Executed',
    Canceled = 'Canceled',
}

export enum VoteOption {
    For = 'For',
    Against = 'Against',
    Abstain = 'Abstain',
}

export interface Proposal {
    id: string;
    title: string;
    description: string;
    proposer: string;
    status: ProposalStatus;
    votingPeriodStart: Date;
    votingPeriodEnd: Date;
    forVotes: number;
    againstVotes: number;
    abstainVotes: number;
    totalVotes: number;
    quorumThreshold: number; // percentage, e.g., 0.20 for 20%
    passThreshold: number; // percentage of 'for' votes needed, e.g., 0.50 for 50%
    detailsLink: string;
    tags: string[];
    contractInteraction: {
        method: string;
        targetAddress: string;
        value: string; // e.g., "1000 ETH"
        parameters: { name: string; type: string; value: string; }[];
    } | null;
    aiSummary?: string;
    aiImpactAnalysis?: string;
    aiRiskAssessment?: string;
}

export interface Vote {
    proposalId: string;
    voterAddress: string;
    option: VoteOption;
    votingPower: number;
    timestamp: Date;
    transactionHash: string;
}

export interface TreasuryAsset {
    id: string;
    name: string;
    symbol: string;
    amount: number;
    usdValue: number;
    contractAddress: string;
    logoUrl: string;
}

export interface Grant {
    id: string;
    proposalId: string;
    title: string;
    description: string;
    recipient: string;
    amount: number;
    tokenSymbol: string;
    status: 'Approved' | 'Pending' | 'Rejected' | 'Paid';
    milestones: { description: string; status: 'Completed' | 'Pending'; payment: number; }[];
    applicationDate: Date;
    approvalDate?: Date;
}

export interface Delegate {
    address: string;
    name: string;
    bio: string;
    votingPower: number;
    proposalsVoted: number;
    forRate: number; // percentage of 'for' votes
    againstRate: number; // percentage of 'against' votes
    lastActive: Date;
    socialLinks: { twitter?: string; github?: string; website?: string; };
    image?: string;
}

export interface UserProfile {
    walletAddress: string;
    currentVotingPower: number;
    delegatedTo?: string; // Address of delegate
    delegators: string[]; // Addresses of users who delegated to this user
    tokenBalance: number;
    nftHoldings: { id: string; name: string; imageUrl: string; }[];
    notifications: Notification[];
}

export enum NotificationType {
    NewProposal = 'NewProposal',
    ProposalStatusChange = 'ProposalStatusChange',
    VoteOutcome = 'VoteOutcome',
    DelegationChange = 'DelegationChange',
    GrantUpdate = 'GrantUpdate',
    SystemMessage = 'SystemMessage',
}

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: Date;
    read: boolean;
    relatedEntityId?: string; // e.g., proposalId, grantId
}

export interface GovernanceMetric {
    date: Date;
    totalProposals: number;
    activeProposals: number;
    passedProposals: number;
    failedProposals: number;
    totalVotesCast: number;
    uniqueVoters: number;
    participationRate: number; // percentage
    treasuryValue: number;
}

// Mock Data Generators (to simulate a large dataset)
const generateRandomAddress = () => `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
const generateRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

export const mockProposals: Proposal[] = Array.from({ length: 50 }).map((_, i) => {
    const statusOptions = Object.values(ProposalStatus);
    const status = statusOptions[randomInt(0, statusOptions.length - 1)];
    const startDate = generateRandomDate(new Date(2023, 0, 1), new Date());
    const endDate = new Date(startDate.getTime() + randomInt(3, 7) * 24 * 60 * 60 * 1000); // 3-7 days later

    const forVotes = randomInt(10000, 500000);
    const againstVotes = randomInt(5000, 200000);
    const abstainVotes = randomInt(1000, 50000);
    const totalVotes = forVotes + againstVotes + abstainVotes;

    return {
        id: `prop-${i + 1}`,
        title: `Proposal to ${['Enhance', 'Optimize', 'Fund', 'Decentralize', 'Integrate'][randomInt(0, 4)]} DAO ${['Treasury', 'Protocol', 'Community', 'Security', 'User Experience'][randomInt(0, 4)]} - v${randomInt(1, 5)}.${randomInt(0, 9)}`,
        description: `This proposal outlines a plan to ${['allocate funds for a new initiative', 'update the core smart contracts', 'engage more community members', 'improve governance mechanisms', 'expand partnerships'][randomInt(0, 4)]} by doing X, Y, and Z. We believe this will result in A, B, and C. The estimated cost is ${randomInt(10000, 1000000)} tokens, to be sourced from the DAO treasury. This is a detailed description of the proposal aiming to improve the overall ecosystem health and sustainability. It covers technical specifications, financial implications, and community benefits. We encourage all token holders to review the full details linked below and cast their vote. This action is critical for the long-term growth and success of the DAO.`,
        proposer: generateRandomAddress(),
        status: status,
        votingPeriodStart: startDate,
        votingPeriodEnd: endDate,
        forVotes: forVotes,
        againstVotes: againstVotes,
        abstainVotes: abstainVotes,
        totalVotes: totalVotes,
        quorumThreshold: 0.10 + randomFloat(0, 0.20), // 10-30%
        passThreshold: 0.50 + randomFloat(0, 0.20), // 50-70%
        detailsLink: `https://example.com/proposals/prop-${i + 1}`,
        tags: [
            ['Treasury', 'Protocol', 'Community', 'Grants', 'Security'][randomInt(0, 4)],
            ['Development', 'Marketing', 'Ecosystem', 'Operations'][randomInt(0, 3)]
        ],
        contractInteraction: i % 3 === 0 ? {
            method: 'transfer',
            targetAddress: generateRandomAddress(),
            value: `${randomInt(1000, 100000)} ETH`,
            parameters: [
                { name: 'recipient', type: 'address', value: generateRandomAddress() },
                { name: 'amount', type: 'uint256', value: randomInt(100, 10000).toString() }
            ]
        } : null,
        aiSummary: i % 5 === 0 ? `Key Points: 1. Allocate ${randomInt(10, 50)}% treasury for new grant. 2. Establish 3-person review committee. 3. Focus on ecosystem growth and developer incentives.` : undefined,
        aiImpactAnalysis: i % 5 === 1 ? `Predicted Impact: High positive on developer engagement, moderate on token value. Potential risks include misuse of funds without strict oversight.` : undefined,
        aiRiskAssessment: i % 5 === 2 ? `Risk Assessment: Low technical risk, moderate financial risk due to new expenditure, low governance risk.` : undefined,
    };
});

export const mockVotes: Vote[] = Array.from({ length: 200 }).map((_, i) => ({
    proposalId: mockProposals[randomInt(0, mockProposals.length - 1)].id,
    voterAddress: generateRandomAddress(),
    option: Object.values(VoteOption)[randomInt(0, 2)],
    votingPower: randomInt(10, 100000),
    timestamp: generateRandomDate(new Date(2023, 0, 1), new Date()),
    transactionHash: `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`
}));

export const mockTreasuryAssets: TreasuryAsset[] = [
    { id: '1', name: 'Ethereum', symbol: 'ETH', amount: 5000 + randomInt(0, 1000), usdValue: (5000 + randomInt(0, 1000)) * 3000, contractAddress: '0x...', logoUrl: '/eth.png' },
    { id: '2', name: 'DAO Token', symbol: 'DAO', amount: 10000000 + randomInt(0, 1000000), usdValue: (10000000 + randomInt(0, 1000000)) * 0.5, contractAddress: '0x...', logoUrl: '/dao.png' },
    { id: '3', name: 'USDC', symbol: 'USDC', amount: 2000000 + randomInt(0, 500000), usdValue: (2000000 + randomInt(0, 500000)) * 1, contractAddress: '0x...', logoUrl: '/usdc.png' },
    { id: '4', name: 'Wrapped BTC', symbol: 'WBTC', amount: 50 + randomInt(0, 10), usdValue: (50 + randomInt(0, 10)) * 60000, contractAddress: '0x...', logoUrl: '/wbtc.png' },
    { id: '5', name: 'Aave', symbol: 'AAVE', amount: 10000 + randomInt(0, 1000), usdValue: (10000 + randomInt(0, 1000)) * 100, contractAddress: '0x...', logoUrl: '/aave.png' },
];

export const mockGrants: Grant[] = Array.from({ length: 15 }).map((_, i) => ({
    id: `grant-${i + 1}`,
    proposalId: mockProposals[randomInt(0, mockProposals.length - 1)].id,
    title: `Grant for ${['Front-end Development', 'Smart Contract Audit', 'Community Engagement', 'Educational Content', 'Research Initiative'][randomInt(0, 4)]}`,
    description: `This grant aims to support the development of a key feature for the DAO, ensuring its long-term viability and competitiveness in the ecosystem.`,
    recipient: generateRandomAddress(),
    amount: randomInt(5000, 50000),
    tokenSymbol: ['DAO', 'USDC'][randomInt(0, 1)],
    status: ['Approved', 'Pending', 'Rejected', 'Paid'][randomInt(0, 3)],
    milestones: [
        { description: 'Phase 1 Completion', status: 'Completed', payment: randomInt(1000, 5000) },
        { description: 'Phase 2 Completion', status: 'Pending', payment: randomInt(1000, 5000) },
    ],
    applicationDate: generateRandomDate(new Date(2023, 6, 1), new Date()),
    approvalDate: i % 2 === 0 ? generateRandomDate(new Date(2023, 9, 1), new Date()) : undefined,
}));

export const mockDelegates: Delegate[] = Array.from({ length: 20 }).map((_, i) => ({
    address: generateRandomAddress(),
    name: `Delegate ${String.fromCharCode(65 + i)}`,
    bio: `Experienced in ${['protocol governance', 'financial analysis', 'community building', 'technical development'][randomInt(0, 3)]}. Committed to the long-term success of the DAO.`,
    votingPower: randomInt(100000, 5000000),
    proposalsVoted: randomInt(20, 100),
    forRate: randomFloat(0.6, 0.9),
    againstRate: randomFloat(0.1, 0.3),
    lastActive: generateRandomDate(new Date(2024, 0, 1), new Date()),
    socialLinks: {
        twitter: `https://twitter.com/delegate${i}`,
        github: i % 3 === 0 ? `https://github.com/delegate${i}` : undefined,
    },
    image: `https://i.pravatar.cc/150?img=${i + 10}` // Placeholder avatars
}));

export const mockUserProfile: UserProfile = {
    walletAddress: '0xMyWalletAddressABCDEF1234567890abcdef',
    currentVotingPower: 15000,
    delegatedTo: mockDelegates[0].address,
    delegators: Array.from({ length: 5 }).map(() => generateRandomAddress()),
    tokenBalance: 25000,
    nftHoldings: [
        { id: 'nft-1', name: 'DAO Founder Pass #123', imageUrl: 'https://via.placeholder.com/100/0000FF/FFFFFF?text=NFT1' },
        { id: 'nft-2', name: 'DAO Contributor Badge', imageUrl: 'https://via.placeholder.com/100/FF0000/FFFFFF?text=NFT2' },
    ],
    notifications: Array.from({ length: 7 }).map((_, i) => ({
        id: `notif-${i}`,
        type: Object.values(NotificationType)[randomInt(0, Object.values(NotificationType).length - 1)],
        message: `Notification ${i + 1}: Proposal #${mockProposals[i % mockProposals.length].id} ${['updated', 'passed', 'failed', 'newly created'][randomInt(0, 3)]}.`,
        timestamp: generateRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
        read: i % 3 === 0,
    })),
};

export const mockGovernanceMetrics: GovernanceMetric[] = Array.from({ length: 12 }).map((_, i) => {
    const baseProposals = 10 + i * 2;
    const baseVotes = 50000 + i * 10000;
    const baseTreasury = 10000000 + i * 500000;
    return {
        date: new Date(2023, i + 1, 1),
        totalProposals: baseProposals + randomInt(-2, 2),
        activeProposals: randomInt(1, 5),
        passedProposals: randomInt(baseProposals * 0.6, baseProposals * 0.8),
        failedProposals: randomInt(baseProposals * 0.1, baseProposals * 0.2),
        totalVotesCast: baseVotes + randomInt(-5000, 5000),
        uniqueVoters: randomInt(baseVotes / 100, baseVotes / 50),
        participationRate: randomFloat(0.05, 0.25),
        treasuryValue: baseTreasury + randomInt(-1000000, 1000000),
    };
});

// Context for global state (e.g., wallet connection)
export interface WalletContextType {
    isConnected: boolean;
    address: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    userProfile: UserProfile | null;
    fetchUserProfile: (address: string) => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

// Wallet Provider Component (for future expansion, keeping within file for line count)
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [address, setAddress] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const connectWallet = useCallback(async () => {
        // Simulate wallet connection logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsConnected(true);
        setAddress(mockUserProfile.walletAddress);
        // In a real app, this would fetch the actual profile for the connected address
        setUserProfile(mockUserProfile);
        console.log("Wallet connected:", mockUserProfile.walletAddress);
    }, []);

    const disconnectWallet = useCallback(() => {
        setIsConnected(false);
        setAddress(null);
        setUserProfile(null);
        console.log("Wallet disconnected.");
    }, []);

    const fetchUserProfile = useCallback(async (walletAddress: string) => {
        // Simulate fetching user profile from backend/blockchain
        await new Promise(resolve => setTimeout(resolve, 500));
        if (walletAddress === mockUserProfile.walletAddress) {
            setUserProfile(mockUserProfile);
        } else {
            // Simulate a generic profile for an unconnected user or different address
            setUserProfile({
                walletAddress,
                currentVotingPower: randomInt(0, 5000),
                delegators: [],
                nftHoldings: [],
                notifications: [],
                tokenBalance: randomInt(0, 10000),
            });
        }
    }, []);

    const contextValue = useMemo(() => ({
        isConnected,
        address,
        connectWallet,
        disconnectWallet,
        userProfile,
        fetchUserProfile,
    }), [isConnected, address, connectWallet, disconnectWallet, userProfile, fetchUserProfile]);

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
};

// Placeholder for an actual chart component using recharts
export const MockLineChart: React.FC<{ data: any[]; dataKey: string; name: string }> = ({ data, dataKey, name }) => (
    <div className="w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center text-gray-400">
        <p className="text-center">
            {name} Chart Placeholder<br/>
            (Data points: {data.length})
        </p>
    </div>
);

// --- END: MOCK DATA AND TYPE DEFINITIONS ---


// --- START: NEW COMPONENTS AND HELPER FUNCTIONS (adds significant lines) ---

// Helper to format large numbers
export const formatNumber = (num: number, currency: boolean = false, decimals: number = 0) => {
    if (num >= 1000000) {
        return `${currency ? '$' : ''}${(num / 1000000).toFixed(decimals)}M`;
    }
    if (num >= 1000) {
        return `${currency ? '$' : ''}${(num / 1000).toFixed(decimals)}K`;
    }
    return `${currency ? '$' : ''}${num.toFixed(decimals)}`;
};

export const formatAddress = (address: string, chars = 6) => {
    if (!address) return '';
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
        case ProposalStatus.Active: return 'bg-blue-600';
        case ProposalStatus.Passed: return 'bg-green-600';
        case ProposalStatus.Failed: return 'bg-red-600';
        case ProposalStatus.Executed: return 'bg-purple-600';
        case ProposalStatus.Pending: return 'bg-yellow-600';
        case ProposalStatus.Canceled: return 'bg-gray-600';
        default: return 'bg-gray-500';
    }
};

// Custom Hook for AI Interactions
export interface AIInteractionOptions {
    model: string;
    apiKey: string;
}

export const useAIInteraction = (options: AIInteractionOptions) => {
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState<boolean>(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const generateContent = useCallback(async (prompt: string): Promise<string | null> => {
        setAiLoading(true);
        setAiError(null);
        setAiResponse(null);
        try {
            const ai = new GoogleGenAI({ apiKey: options.apiKey });
            const response = await ai.models.generateContent({ model: options.model, contents: prompt });
            const text = response.text || '';
            setAiResponse(text);
            return text;
        } catch (err: any) {
            console.error("AI Generation Error:", err);
            setAiError(err.message || "Failed to generate AI content.");
            return null;
        } finally {
            setAiLoading(false);
        }
    }, [options.apiKey, options.model]);

    return { aiResponse, aiLoading, aiError, generateContent };
};

// Proposal Card Component
export const ProposalCard: React.FC<{ proposal: Proposal; onViewDetails: (proposal: Proposal) => void }> = ({ proposal, onViewDetails }) => {
    const now = new Date();
    const isVotingActive = proposal.status === ProposalStatus.Active && now >= proposal.votingPeriodStart && now <= proposal.votingPeriodEnd;
    const votesForPercentage = proposal.totalVotes > 0 ? (proposal.forVotes / proposal.totalVotes) * 100 : 0;
    const votesAgainstPercentage = proposal.totalVotes > 0 ? (proposal.againstVotes / proposal.totalVotes) * 100 : 0;
    const votesAbstainPercentage = proposal.totalVotes > 0 ? (proposal.abstainVotes / proposal.totalVotes) * 100 : 0;

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col space-y-4 hover:shadow-lg hover:shadow-cyan-900/30 transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-white leading-tight">{proposal.title}</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)} text-white`}>
                    {proposal.status}
                </span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-3">{proposal.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                <div><span className="font-medium text-gray-300">Proposer:</span> {formatAddress(proposal.proposer)}</div>
                <div><span className="font-medium text-gray-300">Ends:</span> {proposal.votingPeriodEnd.toLocaleDateString()}</div>
                <div><span className="font-medium text-gray-300">Total Votes:</span> {formatNumber(proposal.totalVotes)}</div>
                <div><span className="font-medium text-gray-300">Quorum:</span> {(proposal.quorumThreshold * 100).toFixed(0)}%</div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>For: {formatNumber(proposal.forVotes)} ({votesForPercentage.toFixed(1)}%)</span>
                    <span>Against: {formatNumber(proposal.againstVotes)} ({votesAgainstPercentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                        className="bg-green-500 h-2.5 rounded-l-full"
                        style={{ width: `${votesForPercentage}%` }}
                    ></div>
                    <div
                        className="bg-red-500 h-2.5 rounded-r-full -mt-2.5"
                        style={{ width: `${votesAgainstPercentage}%`, marginLeft: `${votesForPercentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-700 mt-auto">
                {isVotingActive && (
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium mr-2">
                        Vote Now
                    </button>
                )}
                <button
                    onClick={() => onViewDetails(proposal)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

// Proposal Details Modal Component
export const ProposalDetailsModal: React.FC<{ proposal: Proposal; onClose: () => void; onVote: (proposalId: string, option: VoteOption) => Promise<void> }> = ({ proposal, onClose, onVote }) => {
    const { isConnected, address, userProfile } = useWallet();
    const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null);
    const [isVoting, setIsVoting] = useState(false);
    const [voteMessage, setVoteMessage] = useState<string | null>(null);

    const now = new Date();
    const isVotingActive = proposal.status === ProposalStatus.Active && now >= proposal.votingPeriodStart && now <= proposal.votingPeriodEnd;
    const hasVoted = mockVotes.some(v => v.proposalId === proposal.id && v.voterAddress === address); // Simplified check

    const handleCastVote = async () => {
        if (!isConnected || !address || !selectedVote) {
            setVoteMessage("Please connect wallet and select a vote option.");
            return;
        }
        setIsVoting(true);
        setVoteMessage(null);
        try {
            await onVote(proposal.id, selectedVote);
            setVoteMessage("Vote cast successfully!");
            // Optionally refresh proposal data
        } catch (error: any) {
            setVoteMessage(`Voting failed: ${error.message || "Unknown error"}`);
        } finally {
            setIsVoting(false);
        }
    };

    const votesForPercentage = proposal.totalVotes > 0 ? (proposal.forVotes / proposal.totalVotes) * 100 : 0;
    const votesAgainstPercentage = proposal.totalVotes > 0 ? (proposal.againstVotes / proposal.totalVotes) * 100 : 0;
    const votesAbstainPercentage = proposal.totalVotes > 0 ? (proposal.abstainVotes / proposal.totalVotes) * 100 : 0;
    const currentQuorum = proposal.totalVotes / (mockTreasuryAssets[1]?.amount || 1) * 100; // Total DAO tokens
    const isQuorumMet = currentQuorum >= (proposal.quorumThreshold * 100);
    const isPassedThresholdMet = votesForPercentage >= (proposal.passThreshold * 100);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">{proposal.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 space-y-6 text-gray-300">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-200">Proposer: {formatAddress(proposal.proposer)}</span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)} text-white`}>
                            {proposal.status}
                        </span>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg text-white mb-2">Description</h4>
                        <p className="whitespace-pre-line">{proposal.description}</p>
                        {proposal.detailsLink && (
                            <a href={proposal.detailsLink} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline text-sm mt-2 block">
                                Read full proposal
                            </a>
                        )}
                    </div>

                    {proposal.contractInteraction && (
                        <div>
                            <h4 className="font-semibold text-lg text-white mb-2">On-chain Action</h4>
                            <div className="bg-gray-900 p-4 rounded text-sm font-mono space-y-2">
                                <p>Method: <span className="text-purple-400">{proposal.contractInteraction.method}</span></p>
                                <p>Target: <span className="text-cyan-400">{formatAddress(proposal.contractInteraction.targetAddress, 10)}</span></p>
                                <p>Value: <span className="text-green-400">{proposal.contractInteraction.value}</span></p>
                                <p>Parameters:</p>
                                <ul className="list-disc list-inside ml-4">
                                    {proposal.contractInteraction.parameters.map((p, idx) => (
                                        <li key={idx}>
                                            {p.name} (<span className="text-yellow-400">{p.type}</span>): {p.value}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="font-semibold text-lg text-white mb-2">Voting Results</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>For: <span className="font-medium text-green-400">{formatNumber(proposal.forVotes)} ({votesForPercentage.toFixed(1)}%)</span></span>
                                <span>Against: <span className="font-medium text-red-400">{formatNumber(proposal.againstVotes)} ({votesAgainstPercentage.toFixed(1)}%)</span></span>
                                <span>Abstain: <span className="font-medium text-yellow-400">{formatNumber(proposal.abstainVotes)} ({votesAbstainPercentage.toFixed(1)}%)</span></span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3 flex overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${votesForPercentage}%` }}></div>
                                <div className="bg-red-500 h-full" style={{ width: `${votesAgainstPercentage}%` }}></div>
                                <div className="bg-yellow-500 h-full" style={{ width: `${votesAbstainPercentage}%` }}></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium text-gray-200">Quorum:</span> {(proposal.quorumThreshold * 100).toFixed(0)}% ({currentQuorum.toFixed(1)}% currently) <span className={`ml-1 text-xs font-semibold ${isQuorumMet ? 'text-green-400' : 'text-red-400'}`}>{isQuorumMet ? 'MET' : 'NOT MET'}</span></div>
                                <div><span className="font-medium text-gray-200">Pass Threshold:</span> {(proposal.passThreshold * 100).toFixed(0)}% For <span className={`ml-1 text-xs font-semibold ${isPassedThresholdMet ? 'text-green-400' : 'text-red-400'}`}>{isPassedThresholdMet ? 'MET' : 'NOT MET'}</span></div>
                            </div>
                        </div>
                    </div>

                    {proposal.aiSummary && (
                        <Card title="AI Summary (Gemini)" className="bg-gray-900/50">
                            <div className="text-sm text-gray-300 whitespace-pre-line">{proposal.aiSummary}</div>
                        </Card>
                    )}
                    {proposal.aiImpactAnalysis && (
                        <Card title="AI Impact Analysis (Gemini)" className="bg-gray-900/50">
                            <div className="text-sm text-gray-300 whitespace-pre-line">{proposal.aiImpactAnalysis}</div>
                        </Card>
                    )}
                     {proposal.aiRiskAssessment && (
                        <Card title="AI Risk Assessment (Gemini)" className="bg-gray-900/50">
                            <div className="text-sm text-gray-300 whitespace-pre-line">{proposal.aiRiskAssessment}</div>
                        </Card>
                    )}

                    {isVotingActive && isConnected && !hasVoted && (
                        <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-gray-700">
                            <h4 className="font-semibold text-lg text-white">Cast Your Vote</h4>
                            <div className="flex space-x-4">
                                {Object.values(VoteOption).map(option => (
                                    <button
                                        key={option}
                                        onClick={() => setSelectedVote(option)}
                                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200
                                                    ${selectedVote === option ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleCastVote}
                                disabled={isVoting || !selectedVote || !userProfile?.currentVotingPower}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isVoting ? 'Submitting Vote...' : `Vote with ${formatNumber(userProfile?.currentVotingPower || 0)} Power`}
                            </button>
                            {voteMessage && <p className={`text-center text-sm ${voteMessage.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>{voteMessage}</p>}
                        </div>
                    )}
                    {!isConnected && isVotingActive && (
                        <div className="p-4 bg-yellow-900/30 text-yellow-300 rounded-lg text-center">
                            Connect your wallet to cast a vote.
                        </div>
                    )}
                    {hasVoted && isConnected && (
                        <div className="p-4 bg-green-900/30 text-green-300 rounded-lg text-center">
                            You have already voted on this proposal.
                        </div>
                    )}
                    {!isVotingActive && (
                        <div className="p-4 bg-gray-900/50 text-gray-400 rounded-lg text-center">
                            Voting for this proposal is currently {proposal.status}.
                        </div>
                    )}

                    {/* Placeholder for comments/discussion */}
                    <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-gray-700">
                        <h4 className="font-semibold text-lg text-white">Discussion & Comments (Mock)</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-gray-700 p-3 rounded-md text-sm">
                                <p className="font-semibold text-white">{formatAddress(generateRandomAddress(), 8)} <span className="text-gray-400 font-normal text-xs ml-2">{new Date().toLocaleDateString()}</span></p>
                                <p className="text-gray-300 mt-1">Great proposal, looking forward to seeing this implemented!</p>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-md text-sm">
                                <p className="font-semibold text-white">{formatAddress(generateRandomAddress(), 8)} <span className="text-gray-400 font-normal text-xs ml-2">{new Date(Date.now() - 3600000).toLocaleDateString()}</span></p>
                                <p className="text-gray-300 mt-1">Concerns about the budget allocation, could we get a more detailed breakdown?</p>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-md text-sm">
                                <p className="font-semibold text-white">{formatAddress(generateRandomAddress(), 8)} <span className="text-gray-400 font-normal text-xs ml-2">{new Date(Date.now() - 7200000).toLocaleDateString()}</span></p>
                                <p className="text-gray-300 mt-1">How will this impact the current treasury reserves? Any long-term projections?</p>
                            </div>
                        </div>
                        {isConnected && (
                            <div className="flex flex-col space-y-2">
                                <textarea
                                    className="w-full h-20 bg-gray-900/50 p-2 rounded text-white text-sm border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500"
                                    placeholder="Add your comment..."
                                ></textarea>
                                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium self-end">
                                    Post Comment
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};


// Proposal Creation Form Component
export const ProposalCreationForm: React.FC<{ onCreateProposal: (proposalData: Partial<Proposal>) => Promise<void>; onClose: () => void }> = ({ onCreateProposal, onClose }) => {
    const { isConnected, address } = useWallet();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [detailsLink, setDetailsLink] = useState('');
    const [contractInteractionEnabled, setContractInteractionEnabled] = useState(false);
    const [targetAddress, setTargetAddress] = useState('');
    const [method, setMethod] = useState('');
    const [value, setValue] = useState('');
    const [parameters, setParameters] = useState<{ name: string; type: string; value: string; }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const addParameter = () => setParameters([...parameters, { name: '', type: '', value: '' }]);
    const updateParameter = (index: number, field: string, val: string) => {
        const newParams = [...parameters];
        (newParams[index] as any)[field] = val;
        setParameters(newParams);
    };
    const removeParameter = (index: number) => setParameters(parameters.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected || !address) {
            setErrorMessage("Please connect your wallet to create a proposal.");
            return;
        }
        if (!title || !description) {
            setErrorMessage("Title and description are required.");
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        const newProposalData: Partial<Proposal> = {
            title,
            description,
            proposer: address, // Set connected user as proposer
            status: ProposalStatus.Pending, // New proposals start as pending
            votingPeriodStart: new Date(), // Placeholder, typically set by governance
            votingPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            forVotes: 0, againstVotes: 0, abstainVotes: 0, totalVotes: 0,
            quorumThreshold: 0.20, // Default values
            passThreshold: 0.50, // Default values
            detailsLink: detailsLink || undefined,
            tags: ['Community', 'New'], // Default tags
            contractInteraction: contractInteractionEnabled && targetAddress && method ? {
                method,
                targetAddress,
                value,
                parameters: parameters.filter(p => p.name && p.type && p.value),
            } : null,
        };

        try {
            await onCreateProposal(newProposalData);
            setSuccessMessage("Proposal submitted successfully!");
            // Clear form
            setTitle(''); setDescription(''); setDetailsLink('');
            setContractInteractionEnabled(false); setTargetAddress(''); setMethod(''); setValue(''); setParameters([]);
            // onClose(); // Optionally close immediately
        } catch (error: any) {
            setErrorMessage(`Failed to create proposal: ${error.message || "Unknown error"}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Create New Proposal</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6 text-gray-300">
                    <div className="form-group">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1">Proposal Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-900/50 p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                            placeholder="e.g., Allocate funds for Ecosystem Grants Program"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={8}
                            className="w-full bg-gray-900/50 p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                            placeholder="Provide a detailed explanation of your proposal..."
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="detailsLink" className="block text-sm font-medium text-gray-200 mb-1">External Details Link (Optional)</label>
                        <input
                            type="url"
                            id="detailsLink"
                            value={detailsLink}
                            onChange={(e) => setDetailsLink(e.target.value)}
                            className="w-full bg-gray-900/50 p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                            placeholder="e.g., https://forum.dao.com/t/proposal-discussion-x-y-z"
                        />
                    </div>

                    <div className="form-group flex items-center">
                        <input
                            type="checkbox"
                            id="contractInteraction"
                            checked={contractInteractionEnabled}
                            onChange={(e) => setContractInteractionEnabled(e.target.checked)}
                            className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700"
                        />
                        <label htmlFor="contractInteraction" className="ml-2 block text-sm font-medium text-gray-200">
                            Include On-chain Contract Interaction
                        </label>
                    </div>

                    {contractInteractionEnabled && (
                        <div className="bg-gray-900/50 p-4 rounded-lg space-y-4 border border-gray-700">
                            <h4 className="font-semibold text-lg text-white">Contract Interaction Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="targetAddress" className="block text-sm font-medium text-gray-200 mb-1">Target Contract Address</label>
                                    <input
                                        type="text"
                                        id="targetAddress"
                                        value={targetAddress}
                                        onChange={(e) => setTargetAddress(e.target.value)}
                                        className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500 text-white font-mono text-sm"
                                        placeholder="0x..."
                                        required={contractInteractionEnabled}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="method" className="block text-sm font-medium text-gray-200 mb-1">Method Name</label>
                                    <input
                                        type="text"
                                        id="method"
                                        value={method}
                                        onChange={(e) => setMethod(e.target.value)}
                                        className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500 text-white font-mono text-sm"
                                        placeholder="e.g., transfer, updateConfig"
                                        required={contractInteractionEnabled}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="value" className="block text-sm font-medium text-gray-200 mb-1">Value (e.g., ETH to send)</label>
                                <input
                                    type="text"
                                    id="value"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500 text-white font-mono text-sm"
                                    placeholder="e.g., 0.5 ETH, 1000000 WEI"
                                />
                            </div>

                            <h5 className="font-medium text-md text-white mt-4 mb-2">Parameters</h5>
                            {parameters.map((param, index) => (
                                <div key={index} className="flex gap-2 items-center bg-gray-700 p-3 rounded-md">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={param.name}
                                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                                        className="flex-1 bg-gray-800 p-2 rounded border border-gray-600 text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Type (e.g., address, uint256)"
                                        value={param.type}
                                        onChange={(e) => updateParameter(index, 'type', e.target.value)}
                                        className="flex-1 bg-gray-800 p-2 rounded border border-gray-600 text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={param.value}
                                        onChange={(e) => updateParameter(index, 'value', e.target.value)}
                                        className="flex-2 bg-gray-800 p-2 rounded border border-gray-600 text-white text-sm"
                                    />
                                    <button type="button" onClick={() => removeParameter(index)} className="p-2 text-red-400 hover:text-red-300">
                                        &times;
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addParameter} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                                Add Parameter
                            </button>
                        </div>
                    )}

                    {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
                    {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !isConnected}
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Submitting...' : 'Submit Proposal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Delegate Card Component
export const DelegateCard: React.FC<{ delegate: Delegate; onDelegate: (delegateAddress: string) => void; isDelegatedTo: boolean }> = ({ delegate, onDelegate, isDelegatedTo }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 flex flex-col items-center text-center space-y-3">
            <img src={delegate.image || `https://i.pravatar.cc/150?img=${delegate.address.charCodeAt(2)}`} alt={delegate.name} className="w-20 h-20 rounded-full object-cover border-2 border-cyan-500" />
            <h4 className="text-lg font-semibold text-white">{delegate.name}</h4>
            <p className="text-gray-400 text-sm line-clamp-2">{delegate.bio}</p>
            <div className="text-gray-300 text-sm">
                <p><span className="font-medium">Voting Power:</span> {formatNumber(delegate.votingPower)}</p>
                <p><span className="font-medium">Proposals Voted:</span> {delegate.proposalsVoted}</p>
                <p><span className="font-medium">For Rate:</span> {(delegate.forRate * 100).toFixed(0)}%</p>
            </div>
            <div className="flex space-x-2 mt-2">
                {delegate.socialLinks.twitter && (
                    <a href={delegate.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                        {/* <FiGlobe /> // Placeholder for actual icon */}
                        <span className="sr-only">Twitter</span>
                        <span className="text-xs">Twitter</span>
                    </a>
                )}
                {delegate.socialLinks.github && (
                    <a href={delegate.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                        {/* <FiGithub /> */}
                        <span className="sr-only">GitHub</span>
                        <span className="text-xs">GitHub</span>
                    </a>
                )}
            </div>
            <button
                onClick={() => onDelegate(delegate.address)}
                disabled={isDelegatedTo}
                className={`w-full py-2 rounded-lg text-sm font-medium mt-4 ${isDelegatedTo ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
                {isDelegatedTo ? 'Delegated' : 'Delegate Vote'}
            </button>
        </div>
    );
};

// Grant Card Component
export const GrantCard: React.FC<{ grant: Grant }> = ({ grant }) => {
    const getGrantStatusColor = (status: Grant['status']) => {
        switch (status) {
            case 'Approved': return 'bg-green-600';
            case 'Pending': return 'bg-yellow-600';
            case 'Rejected': return 'bg-red-600';
            case 'Paid': return 'bg-purple-600';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 space-y-3">
            <div className="flex justify-between items-start">
                <h4 className="text-lg font-semibold text-white">{grant.title}</h4>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getGrantStatusColor(grant.status)} text-white`}>
                    {grant.status}
                </span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{grant.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                <div><span className="font-medium text-gray-300">Recipient:</span> {formatAddress(grant.recipient)}</div>
                <div><span className="font-medium text-gray-300">Amount:</span> {formatNumber(grant.amount)} {grant.tokenSymbol}</div>
                <div><span className="font-medium text-gray-300">Application:</span> {grant.applicationDate.toLocaleDateString()}</div>
                {grant.approvalDate && <div><span className="font-medium text-gray-300">Approved:</span> {grant.approvalDate.toLocaleDateString()}</div>}
            </div>
            <div>
                <h5 className="font-medium text-gray-300 text-sm mt-2">Milestones:</h5>
                <ul className="list-disc list-inside ml-2 text-gray-400 text-xs">
                    {grant.milestones.map((milestone, idx) => (
                        <li key={idx} className={milestone.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}>
                            {milestone.description} ({formatNumber(milestone.payment)} {grant.tokenSymbol}) - {milestone.status}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-end">
                <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium">
                    View Grant
                </button>
            </div>
        </div>
    );
};

// Activity Feed Item Component
export const ActivityFeedItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.NewProposal: return '💡';
            case NotificationType.ProposalStatusChange: return '📢';
            case NotificationType.VoteOutcome: return '🗳️';
            case NotificationType.DelegationChange: return '🤝';
            case NotificationType.GrantUpdate: return '💸';
            case NotificationType.SystemMessage: return '⚙️';
            default: return '💬';
        }
    };

    const getNotificationColor = (read: boolean) => read ? 'text-gray-500' : 'text-white';
    const getNotificationBg = (read: boolean) => read ? 'bg-gray-900' : 'bg-gray-700 hover:bg-gray-600';

    return (
        <div className={`flex items-center space-x-3 p-3 rounded-lg ${getNotificationBg(notification.read)} transition-colors duration-200`}>
            <span className={`text-xl ${getNotificationColor(notification.read)}`}>{getNotificationIcon(notification.type)}</span>
            <div className="flex-1">
                <p className={`text-sm ${getNotificationColor(notification.read)}`}>{notification.message}</p>
                <p className={`text-xs text-gray-400 mt-0.5`}>{notification.timestamp.toLocaleString()}</p>
            </div>
            {!notification.read && <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>}
        </div>
    );
};


// Main DAO Governance View Component
export const DaoGovernanceView: React.FC = () => {
    // Original AI Summarizer State
    const [isSummarizerOpen, setSummarizerOpen] = useState(false);
    const [proposalText, setProposalText] = useState("Proposal to allocate 5% of treasury funds to a new grant program for ecosystem developers, subject to a 3-person committee review for grants over 10,000 tokens...");
    const { aiResponse: summary, aiLoading: isLoading, aiError: summaryError, generateContent: handleSummarizeAI } = useAIInteraction({
        apiKey: process.env.NEXT_PUBLIC_API_KEY as string, // Ensure API key is accessible for client-side
        model: 'gemini-pro', // Using gemini-pro for more general purpose use
    });

    // New State for expanded features
    const { isConnected, address, connectWallet, userProfile, disconnectWallet } = useWallet();

    // Proposal Management
    const [proposals, setProposals] = useState<Proposal[]>(mockProposals);
    const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Passed' | 'Failed' | 'Pending'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'latest' | 'mostVoted'>('latest');
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [isProposalCreationOpen, setProposalCreationOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const proposalsPerPage = 8;

    // Treasury Management
    const [treasuryAssets, setTreasuryAssets] = useState<TreasuryAsset[]>(mockTreasuryAssets);
    const [grants, setGrants] = useState<Grant[]>(mockGrants);

    // Delegation
    const [delegates, setDelegates] = useState<Delegate[]>(mockDelegates);
    const [myDelegatedTo, setMyDelegatedTo] = useState<string | undefined>(userProfile?.delegatedTo);

    // Notifications
    const [notifications, setNotifications] = useState<Notification[]>(mockUserProfile.notifications);
    const unreadNotificationsCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    // Governance Metrics
    const [governanceMetrics, setGovernanceMetrics] = useState<GovernanceMetric[]>(mockGovernanceMetrics);

    // AI additional functions
    const { aiResponse: impactAnalysis, aiLoading: impactLoading, generateContent: generateImpactAnalysis } = useAIInteraction({
        apiKey: process.env.NEXT_PUBLIC_API_KEY as string,
        model: 'gemini-pro',
    });
    const { aiResponse: riskAssessment, aiLoading: riskLoading, generateContent: generateRiskAssessment } = useAIInteraction({
        apiKey: process.env.NEXT_PUBLIC_API_KEY as string,
        model: 'gemini-pro',
    });


    // Effects
    useEffect(() => {
        // Simulate fetching initial data
        setProposals(mockProposals);
        setTreasuryAssets(mockTreasuryAssets);
        setGrants(mockGrants);
        setDelegates(mockDelegates);
        if (userProfile) {
            setMyDelegatedTo(userProfile.delegatedTo);
            setNotifications(userProfile.notifications);
        }
        setGovernanceMetrics(mockGovernanceMetrics);
    }, [userProfile]); // Refresh if userProfile changes (e.g., wallet connect)

    // Handlers for Proposal Management
    const handleFilterProposals = useMemo(() => {
        let filtered = proposals;
        if (activeTab !== 'All') {
            filtered = filtered.filter(p => p.status === activeTab);
        }
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.proposer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (sortOrder === 'latest') {
            filtered.sort((a, b) => b.votingPeriodStart.getTime() - a.votingPeriodStart.getTime());
        } else if (sortOrder === 'mostVoted') {
            filtered.sort((a, b) => b.totalVotes - a.totalVotes);
        }
        return filtered;
    }, [proposals, activeTab, searchTerm, sortOrder]);

    const paginatedProposals = useMemo(() => {
        const startIndex = (currentPage - 1) * proposalsPerPage;
        const endIndex = startIndex + proposalsPerPage;
        return handleFilterProposals.slice(startIndex, endIndex);
    }, [handleFilterProposals, currentPage, proposalsPerPage]);

    const totalPages = Math.ceil(handleFilterProposals.length / proposalsPerPage);

    const handleVote = useCallback(async (proposalId: string, option: VoteOption) => {
        console.log(`User ${address} voting ${option} on proposal ${proposalId}`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Update mock data: find proposal, increment vote count
        setProposals(prev => prev.map(p => {
            if (p.id === proposalId) {
                const newP = { ...p };
                if (option === VoteOption.For) newP.forVotes += (userProfile?.currentVotingPower || 0);
                if (option === VoteOption.Against) newP.againstVotes += (userProfile?.currentVotingPower || 0);
                if (option === VoteOption.Abstain) newP.abstainVotes += (userProfile?.currentVotingPower || 0);
                newP.totalVotes += (userProfile?.currentVotingPower || 0);
                return newP;
            }
            return p;
        }));
        // Add user's vote to mockVotes
        mockVotes.push({
            proposalId,
            voterAddress: address!,
            option,
            votingPower: userProfile?.currentVotingPower || 0,
            timestamp: new Date(),
            transactionHash: generateRandomAddress(),
        });
        setSelectedProposal(prev => prev ? { ...prev,
            forVotes: prev.forVotes + (option === VoteOption.For ? (userProfile?.currentVotingPower || 0) : 0),
            againstVotes: prev.againstVotes + (option === VoteOption.Against ? (userProfile?.currentVotingPower || 0) : 0),
            abstainVotes: prev.abstainVotes + (option === VoteOption.Abstain ? (userProfile?.currentVotingPower || 0) : 0),
            totalVotes: prev.totalVotes + (userProfile?.currentVotingPower || 0),
        } : null);
        console.log("Vote recorded.");
    }, [address, userProfile]);

    const handleCreateProposal = useCallback(async (newProposalData: Partial<Proposal>) => {
        console.log("Creating new proposal:", newProposalData);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const newProposal: Proposal = {
            id: `prop-${proposals.length + 1}-${Date.now()}`,
            proposer: address!,
            status: ProposalStatus.Pending,
            votingPeriodStart: new Date(),
            votingPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
            forVotes: 0, againstVotes: 0, abstainVotes: 0, totalVotes: 0,
            quorumThreshold: 0.20, passThreshold: 0.50,
            tags: ['Community', 'New'],
            detailsLink: '',
            ...newProposalData,
            description: newProposalData.description || "No description provided.",
            title: newProposalData.title || "Untitled Proposal",
            contractInteraction: newProposalData.contractInteraction || null,
        };
        setProposals(prev => [...prev, newProposal]);
        setNotifications(prev => [{
            id: `notif-${Date.now()}`,
            type: NotificationType.NewProposal,
            message: `New proposal created: "${newProposal.title}"`,
            timestamp: new Date(),
            read: false,
            relatedEntityId: newProposal.id,
        }, ...prev]);
        console.log("Proposal created:", newProposal.id);
        setProposalCreationOpen(false); // Close form after creation
    }, [address, proposals.length]);


    // Handlers for Delegation
    const handleDelegateVote = useCallback(async (delegateAddress: string) => {
        if (!isConnected || !address) {
            console.warn("Wallet not connected to delegate.");
            return;
        }
        console.log(`Delegating ${userProfile?.currentVotingPower} power to ${delegateAddress}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMyDelegatedTo(delegateAddress);
        if (userProfile) {
            userProfile.delegatedTo = delegateAddress;
            // In a real app, update on-chain and refresh user profile
        }
        setNotifications(prev => [{
            id: `notif-${Date.now()}`,
            type: NotificationType.DelegationChange,
            message: `You delegated your voting power to ${formatAddress(delegateAddress)}.`,
            timestamp: new Date(),
            read: false,
        }, ...prev]);
        console.log("Delegation successful.");
    }, [isConnected, address, userProfile]);

    const handleUndelegateVote = useCallback(async () => {
        if (!isConnected || !address) return;
        console.log("Undelegating voting power.");
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMyDelegatedTo(undefined);
        if (userProfile) {
            userProfile.delegatedTo = undefined;
        }
        setNotifications(prev => [{
            id: `notif-${Date.now()}`,
            type: NotificationType.DelegationChange,
            message: `You undelegated your voting power.`,
            timestamp: new Date(),
            read: false,
        }, ...prev]);
        console.log("Undelegation successful.");
    }, [isConnected, address, userProfile]);

    // Handle AI Summarizer
    const triggerSummarize = useCallback(async () => {
        if (!process.env.NEXT_PUBLIC_API_KEY) {
            alert("API Key not configured for AI summarizer.");
            return;
        }
        await handleSummarizeAI(`Summarize the key points of the following DAO governance proposal into 3 simple bullet points. Proposal: "${proposalText}"`);
    }, [proposalText, handleSummarizeAI]);

    const totalTreasuryValue = useMemo(() => treasuryAssets.reduce((sum, asset) => sum + asset.usdValue, 0), [treasuryAssets]);

    // Function to mark notifications as read
    const markNotificationAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    return (
        <WalletProvider> {/* Wrap the whole component tree in WalletProvider to provide context */}
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-4xl font-extrabold text-white tracking-wider">DAO Governance Dashboard</h2>
                    <div className="flex items-center space-x-4">
                        {isConnected ? (
                            <>
                                <div className="relative">
                                    <button onClick={() => { /* Toggle notification dropdown */ }} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 relative">
                                        {/* <FiBell className="w-5 h-5" /> */}
                                        🔔
                                        {unreadNotificationsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {unreadNotificationsCount}
                                            </span>
                                        )}
                                    </button>
                                    {/* Notification Dropdown (mocked) */}
                                    {/* <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                                        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                                            <h4 className="font-semibold text-white">Notifications</h4>
                                            <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="text-xs text-cyan-500 hover:underline">Mark All Read</button>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <p className="p-3 text-sm text-gray-400 text-center">No new notifications.</p>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div key={notif.id} onClick={() => markNotificationAsRead(notif.id)} className="cursor-pointer">
                                                        <ActivityFeedItem notification={notif} />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-gray-700 text-center">
                                            <button className="text-sm text-cyan-500 hover:underline">View All</button>
                                        </div>
                                    </div> */}
                                </div>
                                <span className="text-gray-300 text-sm">{formatAddress(address!)}</span>
                                <button onClick={disconnectWallet} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Disconnect</button>
                            </>
                        ) : (
                            <button onClick={connectWallet} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">Connect Wallet</button>
                        )}
                        <button onClick={() => setSummarizerOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Proposal Summarizer</button>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Treasury Overview Card */}
                    <Card className="col-span-1 lg:col-span-1" title="Treasury Overview" icon="FiDollarSign">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                                <p className="text-lg text-gray-300">Total Value:</p>
                                <p className="text-2xl font-bold text-green-400">{formatNumber(totalTreasuryValue, true, 2)} USD</p>
                            </div>
                            <h4 className="text-md font-semibold text-white">Top Assets:</h4>
                            <ul className="space-y-2">
                                {treasuryAssets.slice(0, 3).map(asset => (
                                    <li key={asset.id} className="flex justify-between items-center text-sm text-gray-400">
                                        <div className="flex items-center space-x-2">
                                            <img src={asset.logoUrl || `https://via.placeholder.com/20/random?text=${asset.symbol}`} alt={asset.symbol} className="w-5 h-5 rounded-full" />
                                            <span>{asset.name} ({asset.symbol})</span>
                                        </div>
                                        <span className="font-medium text-gray-300">{formatNumber(asset.amount, false, 2)} ({formatNumber(asset.usdValue, true, 0)})</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-end pt-2 border-t border-gray-700">
                                <button className="text-cyan-500 hover:underline text-sm">View Full Treasury</button>
                            </div>
                        </div>
                    </Card>

                    {/* My Voting Power Card */}
                    <Card className="col-span-1" title="My Voting Power" icon="FiZap">
                        <div className="space-y-4">
                            {isConnected && userProfile ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <p className="text-lg text-gray-300">Available Power:</p>
                                        <p className="text-2xl font-bold text-purple-400">{formatNumber(userProfile.tokenBalance)} DAO</p>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                                        <p className="text-md text-gray-400">Delegated Power:</p>
                                        <p className="text-xl font-semibold text-cyan-400">{formatNumber(userProfile.currentVotingPower)} Votes</p>
                                    </div>
                                    {myDelegatedTo ? (
                                        <div className="text-sm text-gray-400">
                                            Currently delegated to: <span className="text-cyan-300 font-medium">{formatAddress(myDelegatedTo)}</span>
                                            <button onClick={handleUndelegateVote} className="ml-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium">Undelegate</button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">
                                            Your voting power is not delegated. Consider delegating to an experienced delegate.
                                        </p>
                                    )}
                                    <div className="flex justify-end pt-2 border-t border-gray-700">
                                        <button className="text-cyan-500 hover:underline text-sm" onClick={() => setActiveTab('Delegation')}>Manage Delegation</button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-400 text-center py-8">Connect your wallet to see your voting power.</p>
                            )}
                        </div>
                    </Card>

                    {/* Governance Metrics Summary Card */}
                    <Card className="col-span-1" title="Governance Metrics" icon="FiBarChart2">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Total Proposals (Last 30D)</p>
                                    <p className="text-xl font-bold text-white">{formatNumber(governanceMetrics.slice(-1)[0]?.totalProposals || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Voting Participation (Avg)</p>
                                    <p className="text-xl font-bold text-white">{(governanceMetrics.slice(-1)[0]?.participationRate * 100 || 0).toFixed(1)}%</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Successful Proposals</p>
                                    <p className="text-xl font-bold text-green-400">{formatNumber(governanceMetrics.reduce((sum, m) => sum + m.passedProposals, 0))}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Active Delegates</p>
                                    <p className="text-xl font-bold text-cyan-400">{delegates.length}</p>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2 border-t border-gray-700">
                                <button className="text-cyan-500 hover:underline text-sm">View Full Analytics</button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Proposals Section */}
                <Card className="col-span-3" title="DAO Proposals">
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex space-x-2">
                                {['All', 'Active', 'Passed', 'Failed', 'Pending'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => { setActiveTab(tab as any); setCurrentPage(1); }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        {tab} ({handleFilterProposals.filter(p => tab === 'All' || p.status === tab).length})
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search proposals..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full sm:w-60 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                />
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as any)}
                                    className="w-full sm:w-auto px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="latest">Sort by Latest</option>
                                    <option value="mostVoted">Sort by Most Voted</option>
                                </select>
                                {isConnected && (
                                     <button onClick={() => setProposalCreationOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium w-full sm:w-auto">
                                        {/* <FiPlusCircle className="inline-block mr-1" /> */}
                                        + Create Proposal
                                    </button>
                                )}

                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedProposals.length > 0 ? (
                                paginatedProposals.map(proposal => (
                                    <ProposalCard key={proposal.id} proposal={proposal} onViewDetails={setSelectedProposal} />
                                ))
                            ) : (
                                <p className="col-span-full text-center text-gray-400 py-10">No proposals found matching your criteria.</p>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-4 mt-6">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-gray-300 text-sm">Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Delegates Section */}
                <Card title="DAO Delegates" icon="FiUsers">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {delegates.map(delegate => (
                            <DelegateCard
                                key={delegate.address}
                                delegate={delegate}
                                onDelegate={handleDelegateVote}
                                isDelegatedTo={isConnected && userProfile?.delegatedTo === delegate.address}
                            />
                        ))}
                    </div>
                    {delegates.length === 0 && (
                         <p className="col-span-full text-center text-gray-400 py-10">No delegates found.</p>
                    )}
                </Card>

                {/* Grant Programs Section */}
                <Card title="Grant Programs" icon="FiGlobe">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {grants.length > 0 ? (
                            grants.map(grant => <GrantCard key={grant.id} grant={grant} />)
                        ) : (
                            <p className="col-span-full text-center text-gray-400 py-10">No active grant programs.</p>
                        )}
                    </div>
                </Card>

                {/* Governance Activity Feed */}
                <Card title="Recent Governance Activity" icon="FiMessageSquare">
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div key={notif.id} onClick={() => markNotificationAsRead(notif.id)} className="cursor-pointer">
                                    <ActivityFeedItem notification={notif} />
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 py-10">No recent activity.</p>
                        )}
                    </div>
                </Card>

                {/* Advanced Governance Analytics Chart */}
                <Card title="Historical Governance Metrics" icon="FiPieChart">
                    <div className="h-96 w-full">
                        <MockLineChart
                            data={governanceMetrics.map(m => ({
                                name: m.date.toLocaleString('default', { month: 'short', year: 'numeric' }),
                                'Total Proposals': m.totalProposals,
                                'Votes Cast': m.totalVotesCast / 1000, // Scale for chart
                                'Participation Rate': m.participationRate * 100,
                                'Treasury Value (M)': m.treasuryValue / 1000000,
                            }))}
                            dataKey="Total Proposals"
                            name="Proposals Over Time"
                        />
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-sm text-gray-400">
                            <p>Total Metrics: {governanceMetrics.length} months</p>
                            <p>Avg. Proposals/Month: {(governanceMetrics.reduce((sum, m) => sum + m.totalProposals, 0) / governanceMetrics.length).toFixed(1)}</p>
                            <p>Avg. Participation Rate: {(governanceMetrics.reduce((sum, m) => sum + m.participationRate, 0) / governanceMetrics.length * 100).toFixed(1)}%</p>
                            <p>Max Treasury Value: {formatNumber(Math.max(...governanceMetrics.map(m => m.treasuryValue)), true, 0)}</p>
                        </div>
                    </div>
                </Card>

            </div>

            {/* AI Proposal Summarizer Modal */}
            {isSummarizerOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSummarizerOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">AI Proposal Summarizer</h3>
                            <button onClick={() => setSummarizerOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                             <textarea
                                value={proposalText}
                                onChange={e => setProposalText(e.target.value)}
                                className="w-full h-40 bg-gray-900/50 p-2 rounded text-white text-sm border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder="Paste your detailed DAO proposal here for an AI summary..."
                            />
                             <button
                                onClick={triggerSummarize}
                                disabled={isLoading}
                                className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50 hover:bg-cyan-700 text-white font-medium"
                            >
                                {isLoading ? 'Summarizing...' : 'Summarize Proposal'}
                            </button>
                            <Card title="Summary (Gemini AI)">
                                <div className="min-h-[6rem] text-sm text-gray-300 whitespace-pre-line">
                                    {isLoading ? '...' : (summary || summaryError || 'Enter proposal text and click summarize.')}
                                </div>
                                {summaryError && <p className="text-red-400 text-xs mt-2">{summaryError}</p>}
                            </Card>
                            <Card title="AI Impact Analysis (Optional - Mock)" className="bg-gray-900/50">
                                <button
                                    onClick={() => generateImpactAnalysis(`Analyze the potential impact of the following DAO governance proposal, considering its effects on tokenomics, community engagement, and protocol security. Proposal: "${proposalText}"`)}
                                    disabled={impactLoading || !proposalText}
                                    className="w-full py-2 bg-purple-600 rounded disabled:opacity-50 hover:bg-purple-700 text-white text-sm font-medium"
                                >
                                    {impactLoading ? 'Analyzing Impact...' : 'Generate Impact Analysis'}
                                </button>
                                <div className="min-h-[4rem] text-sm text-gray-300 whitespace-pre-line mt-2">
                                    {impactLoading ? '...' : (impactAnalysis || 'Click to analyze impact.')}
                                </div>
                            </Card>
                            <Card title="AI Risk Assessment (Optional - Mock)" className="bg-gray-900/50">
                                <button
                                    onClick={() => generateRiskAssessment(`Identify potential risks associated with the following DAO governance proposal, including financial, technical, and governance risks. Suggest mitigation strategies. Proposal: "${proposalText}"`)}
                                    disabled={riskLoading || !proposalText}
                                    className="w-full py-2 bg-red-600 rounded disabled:opacity-50 hover:bg-red-700 text-white text-sm font-medium"
                                >
                                    {riskLoading ? 'Assessing Risks...' : 'Generate Risk Assessment'}
                                </button>
                                <div className="min-h-[4rem] text-sm text-gray-300 whitespace-pre-line mt-2">
                                    {riskLoading ? '...' : (riskAssessment || 'Click to assess risks.')}
                                </div>
                            </Card>
                        </div>
                    </div>
                 </div>
            )}

            {/* Proposal Details Modal */}
            {selectedProposal && (
                <ProposalDetailsModal
                    proposal={selectedProposal}
                    onClose={() => setSelectedProposal(null)}
                    onVote={handleVote}
                />
            )}

            {/* Proposal Creation Modal */}
            {isProposalCreationOpen && (
                <ProposalCreationForm
                    onCreateProposal={handleCreateProposal}
                    onClose={() => setProposalCreationOpen(false)}
                />
            )}
        </>
        </WalletProvider>
    );
};

export default DaoGovernanceView;
```typescript
// components/views/megadashboard/digitalassets/DaoGovernanceView.tsx
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// --- START: NEW IMPORTS FOR EXTENDED FUNCTIONALITY ---
// Assuming these are standard icon libraries or similar, not creating them for line count
// import { FiPieChart, FiUsers, FiDollarSign, FiZap, FiSettings, FiPlusCircle, FiBarChart2, FiGlobe, FiMessageSquare, FiBell, FiChevronRight } from 'react-icons/fi';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Placeholder for charts
// --- END: NEW IMPORTS FOR EXTENDED FUNCTIONALITY ---

// --- START: MOCK DATA AND TYPE DEFINITIONS (adds significant lines) ---

// Utility types
type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

// DAO specific types
export enum ProposalStatus {
    Pending = 'Pending',
    Active = 'Active',
    Passed = 'Passed',
    Failed = 'Failed',
    Executed = 'Executed',
    Canceled = 'Canceled',
}

export enum VoteOption {
    For = 'For',
    Against = 'Against',
    Abstain = 'Abstain',
}

export interface Proposal {
    id: string;
    title: string;
    description: string;
    proposer: string;
    status: ProposalStatus;
    votingPeriodStart: Date;
    votingPeriodEnd: Date;
    forVotes: number;
    againstVotes: number;
    abstainVotes: number;
    totalVotes: number;
    quorumThreshold: number; // percentage, e.g., 0.20 for 20%
    passThreshold: number; // percentage of 'for' votes needed, e.g., 0.50 for 50%
    detailsLink: string;
    tags: string[];
    contractInteraction: {
        method: string;
        targetAddress: string;
        value: string; // e.g., "1000 ETH"
        parameters: { name: string; type: string; value: string; }[];
    } | null;
    aiSummary?: string;
    aiImpactAnalysis?: string;
    aiRiskAssessment?: string;
}

export interface Vote {
    proposalId: string;
    voterAddress: string;
    option: VoteOption;
    votingPower: number;
    timestamp: Date;
    transactionHash: string;
}

export interface TreasuryAsset {
    id: string;
    name: string;
    symbol: string;
    amount: number;
    usdValue: number;
    contractAddress: string;
    logoUrl: string;
}

export interface Grant {
    id: string;
    proposalId: string;
    title: string;
    description: string;
    recipient: string;
    amount: number;
    tokenSymbol: string;
    status: 'Approved' | 'Pending' | 'Rejected' | 'Paid';
    milestones: { description: string; status: 'Completed' | 'Pending'; payment: number; }[];
    applicationDate: Date;
    approvalDate?: Date;
}

export interface Delegate {
    address: string;
    name: string;
    bio: string;
    votingPower: number;
    proposalsVoted: number;
    forRate: number; // percentage of 'for' votes
    againstRate: number; // percentage of 'against' votes
    lastActive: Date;
    socialLinks: { twitter?: string; github?: string; website?: string; };
    image?: string;
}

export interface UserProfile {
    walletAddress: string;
    currentVotingPower: number;
    delegatedTo?: string; // Address of delegate
    delegators: string[]; // Addresses of users who delegated to this user
    tokenBalance: number;
    nftHoldings: { id: string; name: string; imageUrl: string; }[];
    notifications: Notification[];
}

export enum NotificationType {
    NewProposal = 'NewProposal',
    ProposalStatusChange = 'ProposalStatusChange',
    VoteOutcome = 'VoteOutcome',
    DelegationChange = 'DelegationChange',
    GrantUpdate = 'GrantUpdate',
    SystemMessage = 'SystemMessage',
}

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: Date;
    read: boolean;
    relatedEntityId?: string; // e.g., proposalId, grantId
}

export interface GovernanceMetric {
    date: Date;
    totalProposals: number;
    activeProposals: number;
    passedProposals: number;
    failedProposals: number;
    totalVotesCast: number;
    uniqueVoters: number;
    participationRate: number; // percentage
    treasuryValue: number;
}

// Mock Data Generators (to simulate a large dataset)
const generateRandomAddress = () => `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
const generateRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

export const mockProposals: Proposal[] = Array.from({ length: 50 }).map((_, i) => {
    const statusOptions = Object.values(ProposalStatus);
    const status = statusOptions[randomInt(0, statusOptions.length - 1)];
    const startDate = generateRandomDate(new Date(2023, 0, 1), new Date());
    const endDate = new Date(startDate.getTime() + randomInt(3, 7) * 24 * 60 * 60 * 1000); // 3-7 days later

    const forVotes = randomInt(10000, 500000);
    const againstVotes = randomInt(5000, 200000);
    const abstainVotes = randomInt(1000, 50000);
    const totalVotes = forVotes + againstVotes + abstainVotes;

    return {
        id: `prop-${i + 1}`,
        title: `Proposal to ${['Enhance', 'Optimize', 'Fund', 'Decentralize', 'Integrate'][randomInt(0, 4)]} DAO ${['Treasury', 'Protocol', 'Community', 'Security', 'User Experience'][randomInt(0, 4)]} - v${randomInt(1, 5)}.${randomInt(0, 9)}`,
        description: `This proposal outlines a plan to ${['allocate funds for a new initiative', 'update the core smart contracts', 'engage more community members', 'improve governance mechanisms', 'expand partnerships'][randomInt(0, 4)]} by doing X, Y, and Z. We believe this will result in A, B, and C. The estimated cost is ${randomInt(10000, 1000000)} tokens, to be sourced from the DAO treasury. This is a detailed description of the proposal aiming to improve the overall ecosystem health and sustainability. It covers technical specifications, financial implications, and community benefits. We encourage all token holders to review the full details linked below and cast their vote. This action is critical for the long-term growth and success of the DAO.`,
        proposer: generateRandomAddress(),
        status: status,
        votingPeriodStart: startDate,
        votingPeriodEnd: endDate,
        forVotes: forVotes,
        againstVotes: againstVotes,
        abstainVotes: abstainVotes,
        totalVotes: totalVotes,
        quorumThreshold: 0.10 + randomFloat(0, 0.20), // 10-30%
        passThreshold: 0.50 + randomFloat(0, 0.20), // 50-70%
        detailsLink: `https://example.com/proposals/prop-${i + 1}`,
        tags: [
            ['Treasury', 'Protocol', 'Community', 'Grants', 'Security'][randomInt(0, 4)],
            ['Development', 'Marketing', 'Ecosystem', 'Operations'][randomInt(0, 3)]
        ],
        contractInteraction: i % 3 === 0 ? {
            method: 'transfer',
            targetAddress: generateRandomAddress(),
            value: `${randomInt(1000, 100000)} ETH`,
            parameters: [
                { name: 'recipient', type: 'address', value: generateRandomAddress() },
                { name: 'amount', type: 'uint256', value: randomInt(100, 10000).toString() }
            ]
        } : null,
        aiSummary: i % 5 === 0 ? `Key Points: 1. Allocate ${randomInt(10, 50)}% treasury for new grant. 2. Establish 3-person review committee. 3. Focus on ecosystem growth and developer incentives.` : undefined,
        aiImpactAnalysis: i % 5 === 1 ? `Predicted Impact: High positive on developer engagement, moderate on token value. Potential risks include misuse of funds without strict oversight.` : undefined,
        aiRiskAssessment: i % 5 === 2 ? `Risk Assessment: Low technical risk, moderate financial risk due to new expenditure, low governance risk.` : undefined,
    };
});

export const mockVotes: Vote[] = Array.from({ length: 200 }).map((_, i) => ({
    proposalId: mockProposals[randomInt(0, mockProposals.length - 1)].id,
    voterAddress: generateRandomAddress(),
    option: Object.values(VoteOption)[randomInt(0, 2)],
    votingPower: randomInt(10, 100000),
    timestamp: generateRandomDate(new Date(2023, 0, 1), new Date()),
    transactionHash: `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`
}));

export const mockTreasuryAssets: TreasuryAsset[] = [
    { id: '1', name: 'Ethereum', symbol: 'ETH', amount: 5000 + randomInt(0, 1000), usdValue: (5000 + randomInt(0, 1000)) * 3000, contractAddress: '0x...', logoUrl: '/eth.png' },
    { id: '2', name: 'DAO Token', symbol: 'DAO', amount: 10000000 + randomInt(0, 1000000), usdValue: (10000000 + randomInt(0, 1000000)) * 0.5, contractAddress: '0x...', logoUrl: '/dao.png' },
    { id: '3', name: 'USDC', symbol: 'USDC', amount: 2000000 + randomInt(0, 500000), usdValue: (2000000 + randomInt(0, 500000)) * 1, contractAddress: '0x...', logoUrl: '/usdc.png' },
    { id: '4', name: 'Wrapped BTC', symbol: 'WBTC', amount: 50 + randomInt(0, 10), usdValue: (50 + randomInt(0, 10)) * 60000, contractAddress: '0x...', logoUrl: '/wbtc.png' },
    { id: '5', name: 'Aave', symbol: 'AAVE', amount: 10000 + randomInt(0, 1000), usdValue: (10000 + randomInt(0, 1000)) * 100, contractAddress: '0x...', logoUrl: '/aave.png' },
];

export const mockGrants: Grant[] = Array.from({ length: 15 }).map((_, i) => ({
    id: `grant-${i + 1}`,
    proposalId: mockProposals[randomInt(0, mockProposals.length - 1)].id,
    title: `Grant for ${['Front-end Development', 'Smart Contract Audit', 'Community Engagement', 'Educational Content', 'Research Initiative'][randomInt(0, 4)]}`,
    description: `This grant aims to support the development of a key feature for the DAO, ensuring its long-term viability and competitiveness in the ecosystem.`,
    recipient: generateRandomAddress(),
    amount: randomInt(5000, 50000),
    tokenSymbol: ['DAO', 'USDC'][randomInt(0, 1)],
    status: ['Approved', 'Pending', 'Rejected', 'Paid'][randomInt(0, 3)],
    milestones: [
        { description: 'Phase 1 Completion', status: 'Completed', payment: randomInt(1000, 5000) },
        { description: 'Phase 2 Completion', status: 'Pending', payment: randomInt(1000, 5000) },
    ],
    applicationDate: generateRandomDate(new Date(2023, 6, 1), new Date()),
    approvalDate: i % 2 === 0 ? generateRandomDate(new Date(2023, 9, 1), new Date()) : undefined,
}));

export const mockDelegates: Delegate[] = Array.from({ length: 20 }).map((_, i) => ({
    address: generateRandomAddress(),
    name: `Delegate ${String.fromCharCode(65 + i)}`,
    bio: `Experienced in ${['protocol governance', 'financial analysis', 'community building', 'technical development'][randomInt(0, 3)]}. Committed to the long-term success of the DAO.`,
    votingPower: randomInt(100000, 5000000),
    proposalsVoted: randomInt(20, 100),
    forRate: randomFloat(0.6, 0.9),
    againstRate: randomFloat(0.1, 0.3),
    lastActive: generateRandomDate(new Date(2024, 0, 1), new Date()),
    socialLinks: {
        twitter: `https://twitter.com/delegate${i}`,
        github: i % 3 === 0 ? `https://github.com/delegate${i}` : undefined,
    },
    image: `https://i.pravatar.cc/150?img=${i + 10}` // Placeholder avatars
}));

export const mockUserProfile: UserProfile = {
    walletAddress: '0xMyWalletAddressABCDEF1234567890abcdef',
    currentVotingPower: 15000,
    delegatedTo: mockDelegates[0].address,
    delegators: Array.from({ length: 5 }).map(() => generateRandomAddress()),
    tokenBalance: 25000,
    nftHoldings: [
        { id: 'nft-1', name: 'DAO Founder Pass #123', imageUrl: 'https://via.placeholder.com/100/0000FF/FFFFFF?text=NFT1' },
        { id: 'nft-2', name: 'DAO Contributor Badge', imageUrl: 'https://via.placeholder.com/100/FF0000/FFFFFF?text=NFT2' },
    ],
    notifications: Array.from({ length: 7 }).map((_, i) => ({
        id: `notif-${i}`,
        type: Object.values(NotificationType)[randomInt(0, Object.values(NotificationType).length - 1)],
        message: `Notification ${i + 1}: Proposal #${mockProposals[i % mockProposals.length].id} ${['updated', 'passed', 'failed', 'newly created'][randomInt(0, 3)]}.`,
        timestamp: generateRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
        read: i % 3 === 0,
    })),
};

export const mockGovernanceMetrics: GovernanceMetric[] = Array.from({ length: 12 }).map((_, i) => {
    const baseProposals = 10 + i * 2;
    const baseVotes = 50000 + i * 10000;
    const baseTreasury = 10000000 + i * 500000;
    return {
        date: new Date(2023, i + 1, 1),
        totalProposals: baseProposals + randomInt(-2, 2),
        activeProposals: randomInt(1, 5),
        passedProposals: randomInt(baseProposals * 0.6, baseProposals * 0.8),
        failedProposals: randomInt(baseProposals * 0.1, baseProposals * 0.2),
        totalVotesCast: baseVotes + randomInt(-5000, 5000),
        uniqueVoters: randomInt(baseVotes / 100, baseVotes / 50),
        participationRate: randomFloat(0.05, 0.25),
        treasuryValue: baseTreasury + randomInt(-1000000, 1000000),
    };
});

// Context for global state (e.g., wallet connection)
export interface WalletContextType {
    isConnected: boolean;
    address: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    userProfile: UserProfile | null;
    fetchUserProfile: (address: string) => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

// Wallet Provider Component (for future expansion, keeping within file for line count)
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [address, setAddress] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const connectWallet = useCallback(async () => {
        // Simulate wallet connection logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsConnected(true);
        setAddress(mockUserProfile.walletAddress);
        // In a real app, this would fetch the actual profile for the connected address
        setUserProfile(mockUserProfile);
        console.log("Wallet connected:", mockUserProfile.walletAddress);
    }, []);

    const disconnectWallet = useCallback(() => {
        setIsConnected(false);
        setAddress(null);
        setUserProfile(null);
        console.log("Wallet disconnected.");
    }, []);

    const fetchUserProfile = useCallback(async (walletAddress: string) => {
        // Simulate fetching user profile from backend/blockchain
        await new Promise(resolve => setTimeout(resolve, 500));
        if (walletAddress === mockUserProfile.walletAddress) {
            setUserProfile(mockUserProfile);
        } else {
            // Simulate a generic profile for an unconnected user or different address
            setUserProfile({
                walletAddress,
                currentVotingPower: randomInt(0, 5000),
                delegators: [],
                nftHoldings: [],
                notifications: [],
                tokenBalance: randomInt(0, 10000),
            });
        }
    }, []);

    const contextValue = useMemo(() => ({
        isConnected,
        address,
        connectWallet,
        disconnectWallet,
        userProfile,
        fetchUserProfile,
    }), [isConnected, address, connectWallet, disconnectWallet, userProfile, fetchUserProfile]);

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
};

// Placeholder for an actual chart component using recharts
export const MockLineChart: React.FC<{ data: any[]; dataKey: string; name: string }> = ({ data, dataKey, name }) => (
    <div className="w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center text-gray-400">
        <p className="text-center">
            {name} Chart Placeholder<br/>
            (Data points: {data.length})
        </p>
    </div>
);

// --- END: MOCK DATA AND TYPE DEFINITIONS ---


// --- START: NEW COMPONENTS AND HELPER FUNCTIONS (adds significant lines) ---

// Helper to format large numbers
export const formatNumber = (num: number, currency: boolean = false, decimals: number = 0) => {
    if (num >= 1000000) {
        return `${currency ? '$' : ''}${(num / 1000000).toFixed(decimals)}M`;
    }
    if (num >= 1000) {
        return `${currency ? '$' : ''}${(num / 1000).toFixed(decimals)}K`;
    }
    return `${currency ? '$' : ''}${num.toFixed(decimals)}`;
};

export const formatAddress = (address: string, chars = 6) => {
    if (!address) return '';
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
        case ProposalStatus.Active: return 'bg-blue-600';
        case ProposalStatus.Passed: return 'bg-green-600';
        case ProposalStatus.Failed: return 'bg-red-600';
        case ProposalStatus.Executed: return 'bg-purple-600';
        case ProposalStatus.Pending: return 'bg-yellow-600';
        case ProposalStatus.Canceled: return 'bg-gray-600';
        default: return 'bg-gray-500';
    }
};

// Custom Hook for AI Interactions
export interface AIInteractionOptions {
    model: string;
    apiKey: string;
}

export const useAIInteraction = (options: AIInteractionOptions) => {
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState<boolean>(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const generateContent = useCallback(async (prompt: string): Promise<string | null> => {
        setAiLoading(true);
        setAiError(null);
        setAiResponse(null);
        try {
            const ai = new GoogleGenAI({ apiKey: options.apiKey });
            const model = ai.getGenerativeModel({ model: options.model }); // Corrected method for getting model
            const result = await model.generateContent(prompt); // Adjusted to use model.generateContent
            const response = await result.response; // Get the response object
            const text = response.text() || ''; // Extract text content
            setAiResponse(text);
            return text;
        } catch (err: any) {
            console.error("AI Generation Error:", err);
            setAiError(err.message || "Failed to generate AI content.");
            return null;
        } finally {
            setAiLoading(false);
        }
    }, [options.apiKey, options.model]);

    return { aiResponse, aiLoading, aiError, generateContent };
};

// Proposal Card Component
export const ProposalCard: React.FC<{ proposal: Proposal; onViewDetails: (proposal: Proposal) => void }> = ({ proposal, onViewDetails }) => {
    const now = new Date();
    const isVotingActive = proposal.status === ProposalStatus.Active && now >= proposal.votingPeriodStart && now <= proposal.votingPeriodEnd;
    const votesForPercentage = proposal.totalVotes > 0 ? (proposal.forVotes / proposal.totalVotes) * 100 : 0;
    const votesAgainstPercentage = proposal.totalVotes > 0 ? (proposal.againstVotes / proposal.totalVotes) * 100 : 0;
    // const votesAbstainPercentage = proposal.totalVotes > 0 ? (proposal.abstainVotes / proposal.totalVotes) * 100 : 0;

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col space-y-4 hover:shadow-lg hover:shadow-cyan-900/30 transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-white leading-tight">{proposal.title}</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)} text-white`}>
                    {proposal.status}
                </span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-3">{proposal.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                <div><span className="font-medium text-gray-300">Proposer:</span> {formatAddress(proposal.proposer)}</div>
                <div><span className="font-medium text-gray-300">Ends:</span> {proposal.votingPeriodEnd.toLocaleDateString()}</div>
                <div><span className="font-medium text-gray-300">Total Votes:</span> {formatNumber(proposal.totalVotes)}</div>
                <div><span className="font-medium text-gray-300">Quorum:</span> {(proposal.quorumThreshold * 100).toFixed(0)}%</div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>For: {formatNumber(proposal.forVotes)} ({votesForPercentage.toFixed(1)}%)</span>
                    <span>Against: {formatNumber(proposal.againstVotes)} ({votesAgainstPercentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                        className="bg-green-500 h-2.5 rounded-l-full"
                        style={{ width: `${votesForPercentage}%` }}
                    ></div>
                    <div
                        className="bg-red-500 h-2.5 rounded-r-full -mt-2.5"
                        style={{ width: `${votesAgainstPercentage}%`, marginLeft: `${votesForPercentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-700 mt-auto">
                {isVotingActive && (
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium mr-2">
                        Vote Now
                    </button>
                )}
                <button
                    onClick={() => onViewDetails(proposal)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

// Proposal Details Modal Component
export const ProposalDetailsModal: React.FC<{ proposal: Proposal; onClose: () => void; onVote: (proposalId: string, option: VoteOption) => Promise<void> }> = ({ proposal, onClose, onVote }) => {
    const { isConnected, address, userProfile } = useWallet();
    const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null);
    const [isVoting, setIsVoting] = useState(false);
    const [voteMessage, setVoteMessage] = useState<string | null>(null);

    const now = new Date();
    const isVotingActive = proposal.status === ProposalStatus.Active && now >= proposal.votingPeriodStart && now <= proposal.votingPeriodEnd;
    const hasVoted = mockVotes.some(v => v.proposalId === proposal.id && v.voterAddress === address); // Simplified check

    const handleCastVote = async () => {
        if (!isConnected || !address || !selectedVote) {
            setVoteMessage("Please connect wallet and select a vote option.");
            return;
        }
        setIsVoting(true);
        setVoteMessage(null);
        try {
            await onVote(proposal.id, selectedVote);
            setVoteMessage("Vote cast successfully!");
            // Optionally refresh proposal data
        } catch (error: any) {
            setVoteMessage(`Voting failed: ${error.message || "Unknown error"}`);
        } finally {
            setIsVoting(false);
        }
    };

    const votesForPercentage = proposal.totalVotes > 0 ? (proposal.forVotes / proposal.totalVotes) * 100 : 0;
    const votesAgainstPercentage = proposal.totalVotes > 0 ? (proposal.againstVotes / proposal.totalVotes) * 100 : 0;
    const votesAbstainPercentage = proposal.totalVotes > 0 ? (proposal.abstainVotes / proposal.totalVotes) * 100 : 0;
    const currentQuorum = proposal.totalVotes / (mockTreasuryAssets[1]?.amount || 1) * 100; // Total DAO tokens
    const isQuorumMet = currentQuorum >= (proposal.quorumThreshold * 100);
    const isPassedThresholdMet = votesForPercentage >= (proposal.passThreshold * 100);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">{proposal.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 space-y-6 text-gray-300">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-200">Proposer: {formatAddress(proposal.proposer)}</span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)} text-white`}>
                            {proposal.status}
                        </span>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg text-white mb-2">Description</h4>
                        <p className="whitespace-pre-line">{proposal.description}</p>
                        {proposal.detailsLink && (
                            <a href={proposal.detailsLink} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline text-sm mt-2 block">
                                Read full proposal
                            </a>
                        )}
                    </div>

                    {proposal.contractInteraction && (
                        <div>
                            <h4 className="font-semibold text-lg text-white mb-2">On-chain Action</h4>
                            <div className="bg-gray-900 p-4 rounded text-sm font-mono space-y-2">
                                <p>Method: <span className="text-purple-400">{proposal.contractInteraction.method}</span></p>
                                <p>Target: <span className="text-cyan-400">{formatAddress(proposal.contractInteraction.targetAddress, 10)}</span></p>
                                <p>Value: <span className="text-green-400">{proposal.contractInteraction.value}</span></p>
                                <p>Parameters:</p>
                                <ul className="list-disc list-inside ml-4">
                                    {proposal.contractInteraction.parameters.map((p, idx) => (
                                        <li key={idx}>
                                            {p.name} (<span className="text-yellow-400">{p.type}</span>): {p.value}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="font-semibold text-lg text-white mb-2">Voting Results</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>For: <span className="font-medium text-green-400">{formatNumber(proposal.forVotes)} ({votesForPercentage.toFixed(1)}%)</span></span>
                                <span>Against: <span className="font-medium text-red-400">{formatNumber(proposal.againstVotes)} ({votesAgainstPercentage.toFixed(1)}%)</span></span>
                                <span>Abstain: <span className="font-medium text-yellow-400">{formatNumber(proposal.abstainVotes)} ({votesAbstainPercentage.toFixed(1)}%)</span></span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3 flex overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${votesForPercentage}%` }}></div>
                                <div className="bg-red-500 h-full" style={{ width: `${votesAgainstPercentage}%` }}></div>
                                <div className="bg-yellow-500 h-full" style={{ width: `${votesAbstainPercentage}%` }}></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium text-gray-200">Quorum:</span> {(proposal.quorumThreshold * 100).toFixed(0)}% ({currentQuorum.toFixed(1)}% currently) <span className={`ml-1 text-xs font-semibold ${isQuorumMet ? 'text-green-400' : 'text-red-400'}`}>{isQuorumMet ? 'MET' : 'NOT MET'}</span></div>
                                <div><span className="font-medium text-gray-200">Pass Threshold:</span> {(proposal.passThreshold * 100).toFixed(0)}% For <span className={`ml-1 text-xs font-semibold ${isPassedThresholdMet ? 'text-green-400' : 'text-red-400'}`}>{isPassedThresholdMet ? 'MET' : 'NOT MET'}</span></div>
                            </div>
                        </div>
                    </div>

                    {proposal.aiSummary && (
                        <Card title="AI Summary (Gemini)" className="bg-gray-900/50">
                            <div className="text-sm text-gray-300 whitespace-pre-line">{proposal.aiSummary}</div>
                        </Card>
                    )}
                    {proposal.aiImpactAnalysis && (
                        <Card title="AI Impact Analysis (Gemini)" className="bg-gray-900/50">
                            <div className="text-sm text-gray-300 whitespace-pre-line">{proposal.aiImpactAnalysis}</div>
                        </Card>
                    )}
                     {proposal.aiRiskAssessment && (
                        <Card title="AI Risk Assessment (Gemini)" className="bg-gray-900/50">
                            <div className="text-sm text-gray-300 whitespace-pre-line">{proposal.aiRiskAssessment}</div>
                        </Card>
                    )}

                    {isVotingActive && isConnected && !hasVoted && (
                        <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-gray-700">
                            <h4 className="font-semibold text-lg text-white">Cast Your Vote</h4>
                            <div className="flex space-x-4">
                                {Object.values(VoteOption).map(option => (
                                    <button
                                        key={option}
                                        onClick={() => setSelectedVote(option)}
                                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200
                                                    ${selectedVote === option ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleCastVote}
                                disabled={isVoting || !selectedVote || !userProfile?.currentVotingPower}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isVoting ? 'Submitting Vote...' : `Vote with ${formatNumber(userProfile?.currentVotingPower || 0)} Power`}
                            </button>
                            {voteMessage && <p className={`text-center text-sm ${voteMessage.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>{voteMessage}</p>}
                        </div>
                    )}
                    {!isConnected && isVotingActive && (
                        <div className="p-4 bg-yellow-900/30 text-yellow-300 rounded-lg text-center">
                            Connect your wallet to cast a vote.
                        </div>
                    )}
                    {hasVoted && isConnected && (
                        <div className="p-4 bg-green-900/30 text-green-300 rounded-lg text-center">
                            You have already voted on this proposal.
                        </div>
                    )}
                    {!isVotingActive && (
                        <div className="p-4 bg-gray-900/50 text-gray-400 rounded-lg text-center">
                            Voting for this proposal is currently {proposal.status}.
                        </div>
                    )}

                    {/* Placeholder for comments/discussion */}
                    <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-gray-700">
                        <h4 className="font-semibold text-lg text-white">Discussion & Comments (Mock)</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-gray-700 p-3 rounded-md text-sm">
                                <p className="font-semibold text-white">{formatAddress(generateRandomAddress(), 8)} <span className="text-gray-400 font-normal text-xs ml-2">{new Date().toLocaleDateString()}</span></p>
                                <p className="text-gray-300 mt-1">Great proposal, looking forward to seeing this implemented!</p>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-md text-sm">
                                <p className="font-semibold text-white">{formatAddress(generateRandomAddress(), 8)} <span className="text-gray-400 font-normal text-xs ml-2">{new Date(Date.now() - 3600000).toLocaleDateString()}</span></p>
                                <p className="text-gray-300 mt-1">Concerns about the budget allocation, could we get a more detailed breakdown?</p>
                            </div>
                            <div className="bg-gray-700 p-3 rounded-md text-sm">
                                <p className="font-semibold text-white">{formatAddress(generateRandomAddress(), 8)} <span className="text-gray-400 font-normal text-xs ml-2">{new Date(Date.now() - 7200000).toLocaleDateString()}</span></p>
                                <p className="text-gray-300 mt-1">How will this impact the current treasury reserves? Any long-term projections?</p>
                            </div>
                        </div>
                        {isConnected && (
                            <div className="flex flex-col space-y-2">
                                <textarea
                                    className="w-full h-20 bg-gray-900/50 p-2 rounded text-white text-sm border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500"
                                    placeholder="Add your comment..."
                                ></textarea>
                                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium self-end">
                                    Post Comment
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};


// Proposal Creation Form Component
export const ProposalCreationForm: React.FC<{ onCreateProposal: (proposalData: Partial<Proposal>) => Promise<void>; onClose: () => void }> = ({ onCreateProposal, onClose }) => {
    const { isConnected, address } = useWallet();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [detailsLink, setDetailsLink] = useState('');
    const [contractInteractionEnabled, setContractInteractionEnabled] = useState(false);
    const [targetAddress, setTargetAddress] = useState('');
    const [method, setMethod] = useState('');
    const [value, setValue] = useState('');
    const [parameters, setParameters] = useState<{ name: string; type: string; value: string; }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const addParameter = () => setParameters([...parameters, { name: '', type: '', value: '' }]);
    const updateParameter = (index: number, field: string, val: string) => {
        const newParams = [...parameters];
        (newParams[index] as any)[field] = val;
        setParameters(newParams);
    };
    const removeParameter = (index: number) => setParameters(parameters.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected || !address) {
            setErrorMessage("Please connect your wallet to create a proposal.");
            return;
        }
        if (!title || !description) {
            setErrorMessage("Title and description are required.");
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        const newProposalData: Partial<Proposal> = {
            title,
            description,
            proposer: address, // Set connected user as proposer
            status: ProposalStatus.Pending, // New proposals start as pending
            votingPeriodStart: new Date(), // Placeholder, typically set by governance
            votingPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            forVotes: 0, againstVotes: 0, abstainVotes: 0, totalVotes: 0,
            quorumThreshold: 0.20, // Default values
            passThreshold: 0.50, // Default values
            detailsLink: detailsLink || undefined,
            tags: ['Community', 'New'], // Default tags
            contractInteraction: contractInteractionEnabled && targetAddress && method ? {
                method,
                targetAddress,
                value,
                parameters: parameters.filter(p => p.name && p.type && p.value),
            } : null,
        };

        try {
            await onCreateProposal(newProposalData);
            setSuccessMessage("Proposal submitted successfully!");
            // Clear form
            setTitle(''); setDescription(''); setDetailsLink('');
            setContractInteractionEnabled(false); setTargetAddress(''); setMethod(''); setValue(''); setParameters([]);
            // onClose(); // Optionally close immediately
        } catch (error: any) {
            setErrorMessage(`Failed to create proposal: ${error.message || "Unknown error"}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Create New Proposal</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6 text-gray-300">
                    <div className="form-group">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1">Proposal Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-900/50 p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                            placeholder="e.g., Allocate funds for Ecosystem Grants Program"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={8}
                            className="w-full bg-gray-900/50 p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                            placeholder="Provide a detailed explanation of your proposal..."
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="detailsLink" className="block text-sm font-medium text-gray-200 mb-1">External Details Link (Optional)</label>
                        <input
                            type="url"
                            id="detailsLink"
                            value={detailsLink}
                            onChange={(e) => setDetailsLink(e.target.value)}
                            className="w-full bg-gray-900/50 p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 text-white"
                            placeholder="e.g., https://forum.dao.com/t/proposal-discussion-x-y-z"
                        />
                    </div>

                    <div className="form-group flex items-center">
                        <input
                            type="checkbox"
                            id="contractInteraction"
                            checked={contractInteractionEnabled}
                            onChange={(e) => setContractInteractionEnabled(e.target.checked)}
                            className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700"
                        />
                        <label htmlFor="contractInteraction" className="ml-2 block text-sm font-medium text-gray-200">
                            Include On-chain Contract Interaction
                        </label>
                    </div>

                    {contractInteractionEnabled && (
                        <div className="bg-gray-900/50 p-4 rounded-lg space-y-4 border border-gray-700">
                            <h4 className="font-semibold text-lg text-white">Contract Interaction Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="targetAddress" className="block text-sm font-medium text-gray-200 mb-1">Target Contract Address</label>
                                    <input
                                        type="text"
                                        id="targetAddress"
                                        value={targetAddress}
                                        onChange={(e) => setTargetAddress(e.target.value)}
                                        className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500 text-white font-mono text-sm"
                                        placeholder="0x..."
                                        required={contractInteractionEnabled}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="method" className="block text-sm font-medium text-gray-200 mb-1">Method Name</label>
                                    <input
                                        type="text"
                                        id="method"
                                        value={method}
                                        onChange={(e) => setMethod(e.target.value)}
                                        className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500 text-white font-mono text-sm"
                                        placeholder="e.g., transfer, updateConfig"
                                        required={contractInteractionEnabled}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="value" className="block text-sm font-medium text-gray-200 mb-1">Value (e.g., ETH to send)</label>
                                <input
                                    type="text"
                                    id="value"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500 text-white font-mono text-sm"
                                    placeholder="e.g., 0.5 ETH, 1000000 WEI"
                                />
                            </div>

                            <h5 className="font-medium text-md text-white mt-4 mb-2">Parameters</h5>
                            {parameters.map((param, index) => (
                                <div key={index} className="flex gap-2 items-center bg-gray-700 p-3 rounded-md">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={param.name}
                                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                                        className="flex-1 bg-gray-800 p-2 rounded border border-gray-600 text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Type (e.g., address, uint256)"
                                        value={param.type}
                                        onChange={(e) => updateParameter(index, 'type', e.target.value)}
                                        className="flex-1 bg-gray-800 p-2 rounded border border-gray-600 text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={param.value}
                                        onChange={(e) => updateParameter(index, 'value', e.target.value)}
                                        className="flex-2 bg-gray-800 p-2 rounded border border-gray-600 text-white text-sm"
                                    />
                                    <button type="button" onClick={() => removeParameter(index)} className="p-2 text-red-400 hover:text-red-300">
                                        &times;
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addParameter} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                                Add Parameter
                            </button>
                        </div>
                    )}

                    {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
                    {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !isConnected}
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Submitting...' : 'Submit Proposal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Delegate Card Component
export const DelegateCard: React.FC<{ delegate: Delegate; onDelegate: (delegateAddress: string) => void; isDelegatedTo: boolean }> = ({ delegate, onDelegate, isDelegatedTo }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 flex flex-col items-center text-center space-y-3">
            <img src={delegate.image || `https://i.pravatar.cc/150?img=${delegate.address.charCodeAt(2)}`} alt={delegate.name} className="w-20 h-20 rounded-full object-cover border-2 border-cyan-500" />
            <h4 className="text-lg font-semibold text-white">{delegate.name}</h4>
            <p className="text-gray-400 text-sm line-clamp-2">{delegate.bio}</p>
            <div className="text-gray-300 text-sm">
                <p><span className="font-medium">Voting Power:</span> {formatNumber(delegate.votingPower)}</p>
                <p><span className="font-medium">Proposals Voted:</span> {delegate.proposalsVoted}</p>
                <p><span className="font-medium">For Rate:</span> {(delegate.forRate * 100).toFixed(0)}%</p>
            </div>
            <div className="flex space-x-2 mt-2">
                {delegate.socialLinks.twitter && (
                    <a href={delegate.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                        {/* <FiGlobe /> // Placeholder for actual icon */}
                        <span className="sr-only">Twitter</span>
                        <span className="text-xs">Twitter</span>
                    </a>
                )}
                {delegate.socialLinks.github && (
                    <a href={delegate.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                        {/* <FiGithub /> */}
                        <span className="sr-only">GitHub</span>
                        <span className="text-xs">GitHub</span>
                    </a>
                )}
            </div>
            <button
                onClick={() => onDelegate(delegate.address)}
                disabled={isDelegatedTo}
                className={`w-full py-2 rounded-lg text-sm font-medium mt-4 ${isDelegatedTo ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
                {isDelegatedTo ? 'Delegated' : 'Delegate Vote'}
            </button>
        </div>
    );
};

// Grant Card Component
export const GrantCard: React.FC<{ grant: Grant }> = ({ grant }) => {
    const getGrantStatusColor = (status: Grant['status']) => {
        switch (status) {
            case 'Approved': return 'bg-green-600';
            case 'Pending': return 'bg-yellow-600';
            case 'Rejected': return 'bg-red-600';
            case 'Paid': return 'bg-purple-600';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 space-y-3">
            <div className="flex justify-between items-start">
                <h4 className="text-lg font-semibold text-white">{grant.title}</h4>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getGrantStatusColor(grant.status)} text-white`}>
                    {grant.status}
                </span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{grant.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                <div><span className="font-medium text-gray-300">Recipient:</span> {formatAddress(grant.recipient)}</div>
                <div><span className="font-medium text-gray-300">Amount:</span> {formatNumber(grant.amount)} {grant.tokenSymbol}</div>
                <div><span className="font-medium text-gray-300">Application:</span> {grant.applicationDate.toLocaleDateString()}</div>
                {grant.approvalDate && <div><span className="font-medium text-gray-300">Approved:</span> {grant.approvalDate.toLocaleDateString()}</div>}
            </div>
            <div>
                <h5 className="font-medium text-gray-300 text-sm mt-2">Milestones:</h5>
                <ul className="list-disc list-inside ml-2 text-gray-400 text-xs">
                    {grant.milestones.map((milestone, idx) => (
                        <li key={idx} className={milestone.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}>
                            {milestone.description} ({formatNumber(milestone.payment)} {grant.tokenSymbol}) - {milestone.status}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-end">
                <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium">
                    View Grant
                </button>
            </div>
        </div>
    );
};

// Activity Feed Item Component
export const ActivityFeedItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.NewProposal: return '💡';
            case NotificationType.ProposalStatusChange: return '📢';
            case NotificationType.VoteOutcome: return '🗳️';
            case NotificationType.DelegationChange: return '🤝';
            case NotificationType.GrantUpdate: return '💸';
            case NotificationType.SystemMessage: return '⚙️';
            default: return '💬';
        }
    };

    const getNotificationColor = (read: boolean) => read ? 'text-gray-500' : 'text-white';
    const getNotificationBg = (read: boolean) => read ? 'bg-gray-900' : 'bg-gray-700 hover:bg-gray-600';

    return (
        <div className={`flex items-center space-x-3 p-3 rounded-lg ${getNotificationBg(notification.read)} transition-colors duration-200`}>
            <span className={`text-xl ${getNotificationColor(notification.read)}`}>{getNotificationIcon(notification.type)}</span>
            <div className="flex-1">
                <p className={`text-sm ${getNotificationColor(notification.read)}`}>{notification.message}</p>
                <p className={`text-xs text-gray-400 mt-0.5`}>{notification.timestamp.toLocaleString()}</p>
            </div>
            {!notification.read && <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>}
        </div>
    );
};


// Main DAO Governance View Component
export const DaoGovernanceView: React.FC = () => {
    // Original AI Summarizer State
    const [isSummarizerOpen, setSummarizerOpen] = useState(false);
    const [proposalText, setProposalText] = useState("Proposal to allocate 5% of treasury funds to a new grant program for ecosystem developers, subject to a 3-person committee review for grants over 10,000 tokens...");
    const { aiResponse: summary, aiLoading: isLoading, aiError: summaryError, generateContent: handleSummarizeAI } = useAIInteraction({
        apiKey: process.env.NEXT_PUBLIC_API_KEY as string, // Ensure API key is accessible for client-side
        model: 'gemini-pro', // Using gemini-pro for more general purpose use
    });

    // New State for expanded features
    const { isConnected, address, connectWallet, userProfile, disconnectWallet } = useWallet();

    // Proposal Management
    const [proposals, setProposals] = useState<Proposal[]>(mockProposals);
    const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Passed' | 'Failed' | 'Pending'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'latest' | 'mostVoted'>('latest');
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [isProposalCreationOpen, setProposalCreationOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const proposalsPerPage = 8;

    // Treasury Management
    const [treasuryAssets, setTreasuryAssets] = useState<TreasuryAsset[]>(mockTreasuryAssets);
    const [grants, setGrants] = useState<Grant[]>(mockGrants);

    // Delegation
    const [delegates, setDelegates] = useState<Delegate[]>(mockDelegates);
    const [myDelegatedTo, setMyDelegatedTo] = useState<string | undefined>(userProfile?.delegatedTo);

    // Notifications
    const [notifications, setNotifications] = useState<Notification[]>(mockUserProfile.notifications);
    const unreadNotificationsCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    // Governance Metrics
    const [governanceMetrics, setGovernanceMetrics] = useState<GovernanceMetric[]>(mockGovernanceMetrics);

    // AI additional functions
    const { aiResponse: impactAnalysis, aiLoading: impactLoading, generateContent: generateImpactAnalysis } = useAIInteraction({
        apiKey: process.env.NEXT_PUBLIC_API_KEY as string,
        model: 'gemini-pro',
    });
    const { aiResponse: riskAssessment, aiLoading: riskLoading, generateContent: generateRiskAssessment } = useAIInteraction({
        apiKey: process.env.NEXT_PUBLIC_API_KEY as string,
        model: 'gemini-pro',
    });


    // Effects
    useEffect(() => {
        // Simulate fetching initial data
        setProposals(mockProposals);
        setTreasuryAssets(mockTreasuryAssets);
        setGrants(mockGrants);
        setDelegates(mockDelegates);
        if (userProfile) {
            setMyDelegatedTo(userProfile.delegatedTo);
            setNotifications(userProfile.notifications);
        }
        setGovernanceMetrics(mockGovernanceMetrics);
    }, [userProfile]); // Refresh if userProfile changes (e.g., wallet connect)

    // Handlers for Proposal Management
    const handleFilterProposals = useMemo(() => {
        let filtered = proposals;
        if (activeTab !== 'All') {
            filtered = filtered.filter(p => p.status === activeTab);
        }
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.proposer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (sortOrder === 'latest') {
            filtered.sort((a, b) => b.votingPeriodStart.getTime() - a.votingPeriodStart.getTime());
        } else if (sortOrder === 'mostVoted') {
            filtered.sort((a, b) => b.totalVotes - a.totalVotes);
        }
        return filtered;
    }, [proposals, activeTab, searchTerm, sortOrder]);

    const paginatedProposals = useMemo(() => {
        const startIndex = (currentPage - 1) * proposalsPerPage;
        const endIndex = startIndex + proposalsPerPage;
        return handleFilterProposals.slice(startIndex, endIndex);
    }, [handleFilterProposals, currentPage, proposalsPerPage]);

    const totalPages = Math.ceil(handleFilterProposals.length / proposalsPerPage);

    const handleVote = useCallback(async (proposalId: string, option: VoteOption) => {
        console.log(`User ${address} voting ${option} on proposal ${proposalId}`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Update mock data: find proposal, increment vote count
        setProposals(prev => prev.map(p => {
            if (p.id === proposalId) {
                const newP = { ...p };
                if (option === VoteOption.For) newP.forVotes += (userProfile?.currentVotingPower || 0);
                if (option === VoteOption.Against) newP.againstVotes += (userProfile?.currentVotingPower || 0);
                if (option === VoteOption.Abstain) newP.abstainVotes += (userProfile?.currentVotingPower || 0);
                newP.totalVotes += (userProfile?.currentVotingPower || 0);
                return newP;
            }
            return p;
        }));
        // Add user's vote to mockVotes
        mockVotes.push({
            proposalId,
            voterAddress: address!,
            option,
            votingPower: userProfile?.currentVotingPower || 0,
            timestamp: new Date(),
            transactionHash: generateRandomAddress(),
        });
        setSelectedProposal(prev => prev ? { ...prev,
            forVotes: prev.forVotes + (option === VoteOption.For ? (userProfile?.currentVotingPower || 0) : 0),
            againstVotes: prev.againstVotes + (option === VoteOption.Against ? (userProfile?.currentVotingPower || 0) : 0),
            abstainVotes: prev.abstainVotes + (option === VoteOption.Abstain ? (userProfile?.currentVotingPower || 0) : 0),
            totalVotes: prev.totalVotes + (userProfile?.currentVotingPower || 0),
        } : null);
        console.log("Vote recorded.");
    }, [address, userProfile]);

    const handleCreateProposal = useCallback(async (newProposalData: Partial<Proposal>) => {
        console.log("Creating new proposal:", newProposalData);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const newProposal: Proposal = {
            id: `prop-${proposals.length + 1}-${Date.now()}`,
            proposer: address!,
            status: ProposalStatus.Pending,
            votingPeriodStart: new Date(),
            votingPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
            forVotes: 0, againstVotes: 0, abstainVotes: 0, totalVotes: 0,
            quorumThreshold: 0.20, passThreshold: 0.50,
            tags: ['Community', 'New'],
            detailsLink: '',
            ...newProposalData,
            description: newProposalData.description || "No description provided.",
            title: newProposalData.title || "Untitled Proposal",
            contractInteraction: newProposalData.contractInteraction || null,
        };
        setProposals(prev => [...prev, newProposal]);
        setNotifications(prev => [{
            id: `notif-${Date.now()}`,
            type: NotificationType.NewProposal,
            message: `New proposal created: "${newProposal.title}"`,
            timestamp: new Date(),
            read: false,
            relatedEntityId: newProposal.id,
        }, ...prev]);
        console.log("Proposal created:", newProposal.id);
        setProposalCreationOpen(false); // Close form after creation
    }, [address, proposals.length]);


    // Handlers for Delegation
    const handleDelegateVote = useCallback(async (delegateAddress: string) => {
        if (!isConnected || !address) {
            console.warn("Wallet not connected to delegate.");
            return;
        }
        console.log(`Delegating ${userProfile?.currentVotingPower} power to ${delegateAddress}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMyDelegatedTo(delegateAddress);
        if (userProfile) {
            userProfile.delegatedTo = delegateAddress;
            // In a real app, update on-chain and refresh user profile
        }
        setNotifications(prev => [{
            id: `notif-${Date.now()}`,
            type: NotificationType.DelegationChange,
            message: `You delegated your voting power to ${formatAddress(delegateAddress)}.`,
            timestamp: new Date(),
            read: false,
        }, ...prev]);
        console.log("Delegation successful.");
    }, [isConnected, address, userProfile]);

    const handleUndelegateVote = useCallback(async () => {
        if (!isConnected || !address) return;
        console.log("Undelegating voting power.");
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMyDelegatedTo(undefined);
        if (userProfile) {
            userProfile.delegatedTo = undefined;
        }
        setNotifications(prev => [{
            id: `notif-${Date.now()}`,
            type: NotificationType.DelegationChange,
            message: `You undelegated your voting power.`,
            timestamp: new Date(),
            read: false,
        }, ...prev]);
        console.log("Undelegation successful.");
    }, [isConnected, address, userProfile]);

    // Handle AI Summarizer
    const triggerSummarize = useCallback(async () => {
        if (!process.env.NEXT_PUBLIC_API_KEY) {
            alert("API Key not configured for AI summarizer.");
            return;
        }
        await handleSummarizeAI(`Summarize the key points of the following DAO governance proposal into 3 simple bullet points. Proposal: "${proposalText}"`);
    }, [proposalText, handleSummarizeAI]);

    const totalTreasuryValue = useMemo(() => treasuryAssets.reduce((sum, asset) => sum + asset.usdValue, 0), [treasuryAssets]);

    // Function to mark notifications as read
    const markNotificationAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    return (
        <WalletProvider> {/* Wrap the whole component tree in WalletProvider to provide context */}
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-4xl font-extrabold text-white tracking-wider">DAO Governance Dashboard</h2>
                    <div className="flex items-center space-x-4">
                        {isConnected ? (
                            <>
                                <div className="relative">
                                    <button onClick={() => { /* Toggle notification dropdown */ }} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 relative">
                                        {/* <FiBell className="w-5 h-5" /> */}
                                        🔔
                                        {unreadNotificationsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {unreadNotificationsCount}
                                            </span>
                                        )}
                                    </button>
                                    {/* Notification Dropdown (mocked) */}
                                    {/* <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                                        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                                            <h4 className="font-semibold text-white">Notifications</h4>
                                            <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="text-xs text-cyan-500 hover:underline">Mark All Read</button>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <p className="p-3 text-sm text-gray-400 text-center">No new notifications.</p>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div key={notif.id} onClick={() => markNotificationAsRead(notif.id)} className="cursor-pointer">
                                                        <ActivityFeedItem notification={notif} />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-gray-700 text-center">
                                            <button className="text-sm text-cyan-500 hover:underline">View All</button>
                                        </div>
                                    </div> */}
                                </div>
                                <span className="text-gray-300 text-sm">{formatAddress(address!)}</span>
                                <button onClick={disconnectWallet} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Disconnect</button>
                            </>
                        ) : (
                            <button onClick={connectWallet} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">Connect Wallet</button>
                        )}
                        <button onClick={() => setSummarizerOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Proposal Summarizer</button>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Treasury Overview Card */}
                    <Card className="col-span-1 lg:col-span-1" title="Treasury Overview" icon="FiDollarSign">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                                <p className="text-lg text-gray-300">Total Value:</p>
                                <p className="text-2xl font-bold text-green-400">{formatNumber(totalTreasuryValue, true, 2)} USD</p>
                            </div>
                            <h4 className="text-md font-semibold text-white">Top Assets:</h4>
                            <ul className="space-y-2">
                                {treasuryAssets.slice(0, 3).map(asset => (
                                    <li key={asset.id} className="flex justify-between items-center text-sm text-gray-400">
                                        <div className="flex items-center space-x-2">
                                            <img src={asset.logoUrl || `https://via.placeholder.com/20/random?text=${asset.symbol}`} alt={asset.symbol} className="w-5 h-5 rounded-full" />
                                            <span>{asset.name} ({asset.symbol})</span>
                                        </div>
                                        <span className="font-medium text-gray-300">{formatNumber(asset.amount, false, 2)} ({formatNumber(asset.usdValue, true, 0)})</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-end pt-2 border-t border-gray-700">
                                <button className="text-cyan-500 hover:underline text-sm">View Full Treasury</button>
                            </div>
                        </div>
                    </Card>

                    {/* My Voting Power Card */}
                    <Card className="col-span-1" title="My Voting Power" icon="FiZap">
                        <div className="space-y-4">
                            {isConnected && userProfile ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <p className="text-lg text-gray-300">Available Power:</p>
                                        <p className="text-2xl font-bold text-purple-400">{formatNumber(userProfile.tokenBalance)} DAO</p>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                                        <p className="text-md text-gray-400">Delegated Power:</p>
                                        <p className="text-xl font-semibold text-cyan-400">{formatNumber(userProfile.currentVotingPower)} Votes</p>
                                    </div>
                                    {myDelegatedTo ? (
                                        <div className="text-sm text-gray-400">
                                            Currently delegated to: <span className="text-cyan-300 font-medium">{formatAddress(myDelegatedTo)}</span>
                                            <button onClick={handleUndelegateVote} className="ml-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium">Undelegate</button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">
                                            Your voting power is not delegated. Consider delegating to an experienced delegate.
                                        </p>
                                    )}
                                    <div className="flex justify-end pt-2 border-t border-gray-700">
                                        <button className="text-cyan-500 hover:underline text-sm" onClick={() => setActiveTab('Delegation')}>Manage Delegation</button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-400 text-center py-8">Connect your wallet to see your voting power.</p>
                            )}
                        </div>
                    </Card>

                    {/* Governance Metrics Summary Card */}
                    <Card className="col-span-1" title="Governance Metrics" icon="FiBarChart2">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Total Proposals (Last 30D)</p>
                                    <p className="text-xl font-bold text-white">{formatNumber(governanceMetrics.slice(-1)[0]?.totalProposals || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Voting Participation (Avg)</p>
                                    <p className="text-xl font-bold text-white">{(governanceMetrics.slice(-1)[0]?.participationRate * 100 || 0).toFixed(1)}%</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Successful Proposals</p>
                                    <p className="text-xl font-bold text-green-400">{formatNumber(governanceMetrics.reduce((sum, m) => sum + m.passedProposals, 0))}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Active Delegates</p>
                                    <p className="text-xl font-bold text-cyan-400">{delegates.length}</p>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2 border-t border-gray-700">
                                <button className="text-cyan-500 hover:underline text-sm">View Full Analytics</button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Proposals Section */}
                <Card className="col-span-3" title="DAO Proposals">
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex space-x-2">
                                {['All', 'Active', 'Passed', 'Failed', 'Pending'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => { setActiveTab(tab as any); setCurrentPage(1); }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        {tab} ({handleFilterProposals.filter(p => tab === 'All' || p.status === tab).length})
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search proposals..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full sm:w-60 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                />
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as any)}
                                    className="w-full sm:w-auto px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="latest">Sort by Latest</option>
                                    <option value="mostVoted">Sort by Most Voted</option>
                                </select>
                                {isConnected && (
                                     <button onClick={() => setProposalCreationOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium w-full sm:w-auto">
                                        {/* <FiPlusCircle className="inline-block mr-1" /> */}
                                        + Create Proposal
                                    </button>
                                )}

                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedProposals.length > 0 ? (
                                paginatedProposals.map(proposal => (
                                    <ProposalCard key={proposal.id} proposal={proposal} onViewDetails={setSelectedProposal} />
                                ))
                            ) : (
                                <p className="col-span-full text-center text-gray-400 py-10">No proposals found matching your criteria.</p>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-4 mt-6">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-gray-300 text-sm">Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Delegates Section */}
                <Card title="DAO Delegates" icon="FiUsers">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {delegates.map(delegate => (
                            <DelegateCard
                                key={delegate.address}
                                delegate={delegate}
                                onDelegate={handleDelegateVote}
                                isDelegatedTo={isConnected && userProfile?.delegatedTo === delegate.address}
                            />
                        ))}
                    </div>
                    {delegates.length === 0 && (
                         <p className="col-span-full text-center text-gray-400 py-10">No delegates found.</p>
                    )}
                </Card>

                {/* Grant Programs Section */}
                <Card title="Grant Programs" icon="FiGlobe">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {grants.length > 0 ? (
                            grants.map(grant => <GrantCard key={grant.id} grant={grant} />)
                        ) : (
                            <p className="col-span-full text-center text-gray-400 py-10">No active grant programs.</p>
                        )}
                    </div>
                </Card>

                {/* Governance Activity Feed */}
                <Card title="Recent Governance Activity" icon="FiMessageSquare">
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div key={notif.id} onClick={() => markNotificationAsRead(notif.id)} className="cursor-pointer">
                                    <ActivityFeedItem notification={notif} />
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 py-10">No recent activity.</p>
                        )}
                    </div>
                </Card>

                {/* Advanced Governance Analytics Chart */}
                <Card title="Historical Governance Metrics" icon="FiPieChart">
                    <div className="h-96 w-full">
                        <MockLineChart
                            data={governanceMetrics.map(m => ({
                                name: m.date.toLocaleString('default', { month: 'short', year: 'numeric' }),
                                'Total Proposals': m.totalProposals,
                                'Votes Cast': m.totalVotesCast / 1000, // Scale for chart
                                'Participation Rate': m.participationRate * 100,
                                'Treasury Value (M)': m.treasuryValue / 1000000,
                            }))}
                            dataKey="Total Proposals"
                            name="Proposals Over Time"
                        />
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-sm text-gray-400">
                            <p>Total Metrics: {governanceMetrics.length} months</p>
                            <p>Avg. Proposals/Month: {(governanceMetrics.reduce((sum, m) => sum + m.totalProposals, 0) / governanceMetrics.length).toFixed(1)}</p>
                            <p>Avg. Participation Rate: {(governanceMetrics.reduce((sum, m) => sum + m.participationRate, 0) / governanceMetrics.length * 100).toFixed(1)}%</p>
                            <p>Max Treasury Value: {formatNumber(Math.max(...governanceMetrics.map(m => m.treasuryValue)), true, 0)}</p>
                        </div>
                    </div>
                </Card>

            </div>

            {/* AI Proposal Summarizer Modal */}
            {isSummarizerOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSummarizerOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">AI Proposal Summarizer</h3>
                            <button onClick={() => setSummarizerOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                             <textarea
                                value={proposalText}
                                onChange={e => setProposalText(e.target.value)}
                                className="w-full h-40 bg-gray-900/50 p-2 rounded text-white text-sm border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder="Paste your detailed DAO proposal here for an AI summary..."
                            />
                             <button
                                onClick={triggerSummarize}
                                disabled={isLoading}
                                className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50 hover:bg-cyan-700 text-white font-medium"
                            >
                                {isLoading ? 'Summarizing...' : 'Summarize Proposal'}
                            </button>
                            <Card title="Summary (Gemini AI)">
                                <div className="min-h-[6rem] text-sm text-gray-300 whitespace-pre-line">
                                    {isLoading ? '...' : (summary || summaryError || 'Enter proposal text and click summarize.')}
                                </div>
                                {summaryError && <p className="text-red-400 text-xs mt-2">{summaryError}</p>}
                            </Card>
                            <Card title="AI Impact Analysis (Optional - Mock)" className="bg-gray-900/50">
                                <button
                                    onClick={() => generateImpactAnalysis(`Analyze the potential impact of the following DAO governance proposal, considering its effects on tokenomics, community engagement, and protocol security. Proposal: "${proposalText}"`)}
                                    disabled={impactLoading || !proposalText}
                                    className="w-full py-2 bg-purple-600 rounded disabled:opacity-50 hover:bg-purple-700 text-white text-sm font-medium"
                                >
                                    {impactLoading ? 'Analyzing Impact...' : 'Generate Impact Analysis'}
                                </button>
                                <div className="min-h-[4rem] text-sm text-gray-300 whitespace-pre-line mt-2">
                                    {impactLoading ? '...' : (impactAnalysis || 'Click to analyze impact.')}
                                </div>
                            </Card>
                            <Card title="AI Risk Assessment (Optional - Mock)" className="bg-gray-900/50">
                                <button
                                    onClick={() => generateRiskAssessment(`Identify potential risks associated with the following DAO governance proposal, including financial, technical, and governance risks. Suggest mitigation strategies. Proposal: "${proposalText}"`)}
                                    disabled={riskLoading || !proposalText}
                                    className="w-full py-2 bg-red-600 rounded disabled:opacity-50 hover:bg-red-700 text-white text-sm font-medium"
                                >
                                    {riskLoading ? 'Assessing Risks...' : 'Generate Risk Assessment'}
                                </button>
                                <div className="min-h-[4rem] text-sm text-gray-300 whitespace-pre-line mt-2">
                                    {riskLoading ? '...' : (riskAssessment || 'Click to assess risks.')}
                                </div>
                            </Card>
                        </div>
                    </div>
                 </div>
            )}

            {/* Proposal Details Modal */}
            {selectedProposal && (
                <ProposalDetailsModal
                    proposal={selectedProposal}
                    onClose={() => setSelectedProposal(null)}
                    onVote={handleVote}
                />
            )}

            {/* Proposal Creation Modal */}
            {isProposalCreationOpen && (
                <ProposalCreationForm
                    onCreateProposal={handleCreateProposal}
                    onClose={() => setProposalCreationOpen(false)}
                />
            )}
        </>
        </WalletProvider>
    );
};

export default DaoGovernanceView;
```