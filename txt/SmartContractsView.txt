// components/views/megadashboard/digitalassets/SmartContractsView.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// --- START: Utility Types and Interfaces ---

// Represents a connected wallet
export interface WalletState {
    isConnected: boolean;
    address: string | null;
    balance: string | null; // e.g., "1.23 ETH"
    networkId: number | null;
    networkName: string | null;
}

// Represents a supported blockchain network
export interface NetworkConfig {
    id: number;
    name: string;
    rpcUrl: string;
    chainId: string; // Hex string e.g., "0x1"
    currency: string;
    explorerUrl: string;
}

// Represents a deployed smart contract
export interface DeployedContract {
    id: string; // Unique ID for the UI
    name: string;
    address: string;
    abi: any[]; // JSON ABI
    bytecode: string;
    deploymentTxHash: string;
    deployerAddress: string;
    network: NetworkConfig;
    timestamp: number;
    sourceCode: string;
    version: string;
}

// Represents a smart contract event
export interface ContractEvent {
    id: string;
    contractAddress: string;
    eventName: string;
    args: { [key: string]: any };
    blockNumber: number;
    transactionHash: string;
    timestamp: number;
}

// Represents a pending or completed transaction
export interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string; // In native currency units
    gasPrice: string;
    gasUsed: string;
    status: 'pending' | 'success' | 'failed';
    timestamp: number;
    description?: string;
}

// Represents a contract template
export interface ContractTemplate {
    id: string;
    name: string;
    description: string;
    solidityCode: string;
    tags: string[];
    author: string;
    version: string;
}

// Represents a DeFi staking position
export interface StakingPosition {
    id: string;
    contractAddress: string;
    tokenSymbol: string;
    stakedAmount: string;
    rewardsEarned: string;
    lastClaimed: number;
    apy: string;
    userAddress: string;
}

// Represents an NFT
export interface NFTAsset {
    id: string;
    tokenId: string;
    contractAddress: string;
    name: string;
    description: string;
    imageUrl: string;
    owner: string;
    mintedBy: string;
    mintTimestamp: number;
}

// AI Audit Report details
export interface AIAuditReport {
    summary: string;
    vulnerabilities: {
        type: string;
        severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
        description: string;
        lineNumbers: number[];
        recommendation: string;
    }[];
    gasOptimizations: string[];
    securityScore: number; // 0-100
    timestamp: number;
}

// AI Code Assistant response
export interface AICodeAssistantResponse {
    type: 'generate' | 'explain' | 'optimize' | 'debug';
    content: string;
    suggestions?: string[];
    timestamp: number;
}

// --- END: Utility Types and Interfaces ---

// --- START: Mock Data and Constants ---

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
    { id: 1, name: 'Ethereum Mainnet', rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY', chainId: '0x1', currency: 'ETH', explorerUrl: 'https://etherscan.io' },
    { id: 137, name: 'Polygon Mainnet', rpcUrl: 'https://polygon-rpc.com', chainId: '0x89', currency: 'MATIC', explorerUrl: 'https://polygonscan.com' },
    { id: 43114, name: 'Avalanche C-Chain', rpcUrl: 'https://api.avax.network/ext/bc/C/rpc', chainId: '0xA86A', currency: 'AVAX', explorerUrl: 'https://snowtrace.io' },
    { id: 5, name: 'Goerli Testnet', rpcUrl: 'https://goerli.infura.io/v3/YOUR_INFURA_API_KEY', chainId: '0x5', currency: 'GoerliETH', explorerUrl: 'https://goerli.etherscan.io' },
];

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
    {
        id: 'erc20',
        name: 'ERC-20 Standard Token',
        description: 'A standard fungible token contract, compatible with all ERC-20 wallets and exchanges.',
        solidityCode: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol)
        ERC20(name, symbol)
    {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1,000,000 tokens to deployer
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
        `,
        tags: ['token', 'erc20', 'openzeppelin'],
        author: 'OpenZeppelin / Modified',
        version: '0.8.0'
    },
    {
        id: 'erc721',
        name: 'ERC-721 NFT',
        description: 'A standard non-fungible token contract, ideal for digital art, collectibles, and gaming items.',
        solidityCode: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    string private _baseTokenURI;

    constructor(string memory name, string memory symbol, string memory baseTokenURI)
        ERC721(name, symbol)
    {
        _baseTokenURI = baseTokenURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function safeMint(address to) public onlyOwner {
        uint256 newItemId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, newItemId);
    }
}
        `,
        tags: ['nft', 'erc721', 'openzeppelin'],
        author: 'OpenZeppelin / Modified',
        version: '0.8.0'
    },
    {
        id: 'simple-dao',
        name: 'Simple DAO Governance',
        description: 'A basic contract for decentralized autonomous organization with proposal and voting features.',
        solidityCode: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleDAO {
    struct Proposal {
        uint id;
        string description;
        uint voteCount;
        mapping(address => bool) voted;
        bool executed;
    }

    address public owner;
    uint public nextProposalId;
    mapping(uint => Proposal) public proposals;

    constructor() {
        owner = msg.sender;
        nextProposalId = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function createProposal(string memory _description) public onlyOwner {
        proposals[nextProposalId].id = nextProposalId;
        proposals[nextProposalId].description = _description;
        nextProposalId++;
    }

    function vote(uint _proposalId) public {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.voted[msg.sender], "Already voted.");
        proposal.voted[msg.sender] = true;
        proposal.voteCount++;
    }

    function executeProposal(uint _proposalId) public onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed.");
        require(proposal.voteCount >= 2, "Not enough votes to execute."); // Example threshold
        proposal.executed = true;
        // In a real DAO, this would trigger an action (e.g., call another contract)
        // For simplicity, we just mark it as executed here.
    }
}
        `,
        tags: ['dao', 'governance'],
        author: 'Community',
        version: '0.8.0'
    },
    {
        id: 'multisig',
        name: 'Simple Multi-Sig Wallet',
        description: 'A basic multi-signature wallet requiring multiple owners to confirm transactions.',
        solidityCode: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleMultiSig {
    event Deposit(address indexed sender, uint amount);
    event Submission(uint indexed transactionId);
    event Confirmation(address indexed owner, uint indexed transactionId);
    event Execution(uint indexed transactionId);

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public required;

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
        uint numConfirmations;
    }

    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public confirmations;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier txExists(uint _txId) {
        require(_txId < transactions.length, "Transaction does not exist");
        _;
    }

    modifier notExecuted(uint _txId) {
        require(!transactions[_txId].executed, "Transaction already executed");
        _;
    }

    modifier notConfirmed(uint _txId) {
        require(!confirmations[_txId][msg.sender], "Transaction already confirmed");
        _;
    }

    constructor(address[] memory _owners, uint _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid number of required confirmations");

        for (uint i = 0; i < _owners.length; i++) {
            require(!isOwner[_owners[i]], "Owner not unique");
            isOwner[_owners[i]] = true;
            owners.push(_owners[i]);
        }
        required = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submitTransaction(
        address _destination,
        uint _value,
        bytes memory _data
    ) public onlyOwner returns (uint transactionId) {
        transactionId = transactions.length;
        transactions.push(
            Transaction({
                destination: _destination,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );
        emit Submission(transactionId);
        return transactionId;
    }

    function confirmTransaction(uint _txId)
        public
        onlyOwner
        txExists(_txId)
        notExecuted(_txId)
        notConfirmed(_txId)
    {
        confirmations[_txId][msg.sender] = true;
        transactions[_txId].numConfirmations++;
        emit Confirmation(msg.sender, _txId);

        if (transactions[_txId].numConfirmations >= required) {
            executeTransaction(_txId);
        }
    }

    function executeTransaction(uint _txId)
        public
        onlyOwner
        txExists(_txId)
        notExecuted(_txId)
    {
        Transaction storage txn = transactions[_txId];
        require(txn.numConfirmations >= required, "Cannot execute tx");
        
        txn.executed = true;
        (bool success, ) = txn.destination.call{value: txn.value}(txn.data);
        require(success, "Tx failed");
        emit Execution(_txId);
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }
}
        `,
        tags: ['wallet', 'multisig', 'security'],
        author: 'Community',
        version: '0.8.0'
    },
];

// --- END: Mock Data and Constants ---

// --- START: Mock API / Blockchain Interaction Functions ---

// Helper to simulate async operations
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Wallet Connection
export const mockConnectWallet = async (): Promise<WalletState> => {
    await sleep(1500); // Simulate network latency
    const randomAddress = `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`;
    const selectedNetwork = SUPPORTED_NETWORKS[0]; // Default to first network
    return {
        isConnected: true,
        address: randomAddress,
        balance: `${(Math.random() * 100).toFixed(4)} ${selectedNetwork.currency}`,
        networkId: selectedNetwork.id,
        networkName: selectedNetwork.name,
    };
};

// Mock Wallet Disconnection
export const mockDisconnectWallet = async (): Promise<WalletState> => {
    await sleep(500);
    return {
        isConnected: false,
        address: null,
        balance: null,
        networkId: null,
        networkName: null,
    };
};

// Mock Network Switching
export const mockSwitchNetwork = async (networkId: number): Promise<WalletState> => {
    await sleep(1000);
    const network = SUPPORTED_NETWORKS.find(n => n.id === networkId);
    if (!network) throw new Error('Network not found');

    const wallet = await mockConnectWallet(); // Re-connect wallet to new network
    return {
        ...wallet,
        networkId: network.id,
        networkName: network.name,
        balance: `${(Math.random() * 100).toFixed(4)} ${network.currency}`, // Simulate new balance for new network
    };
};


// Mock Contract Compilation (simplified, assumes success)
export const mockCompileContract = async (sourceCode: string): Promise<{ bytecode: string; abi: any[] }> => {
    await sleep(2000);
    // In a real app, this would call a Solidity compiler service (e.g., Hardhat, Remix API)
    // For now, generate mock data.
    const mockBytecode = `0x${Math.random().toString(16).slice(2, 600).padStart(598, '0')}`;
    const mockABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "myNumber", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "x", "type": "uint256" }], "name": "set", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
    return { bytecode: mockBytecode, abi: mockABI };
};

// Mock Contract Deployment
export const mockDeployContract = async (
    network: NetworkConfig,
    deployerAddress: string,
    contractName: string,
    bytecode: string,
    abi: any[],
    constructorArgs: any[] = []
): Promise<DeployedContract> => {
    await sleep(4000); // Simulate deployment time
    const newAddress = `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`;
    const txHash = `0x${Math.random().toString(16).slice(2, 66).padStart(64, '0')}`;

    return {
        id: `contract-${Date.now()}`,
        name: contractName,
        address: newAddress,
        abi: abi,
        bytecode: bytecode,
        deploymentTxHash: txHash,
        deployerAddress: deployerAddress,
        network: network,
        timestamp: Date.now(),
        sourceCode: `// Placeholder source for ${contractName}`, // Source would typically be stored
        version: '1.0.0'
    };
};

// Mock Interaction with a Deployed Contract (read function)
export const mockCallContractReadMethod = async (
    contract: DeployedContract,
    methodName: string,
    args: any[]
): Promise<any> => {
    await sleep(1000);
    // In a real app, this would use ethers.js/web3.js to call a view/pure function
    console.log(`Mock calling ${methodName} on ${contract.name} with args:`, args);
    const mockResponses: { [key: string]: any } = {
        'myNumber': Math.floor(Math.random() * 1000),
        'name': `${contract.name} Token`,
        'symbol': contract.name.substring(0, 3).toUpperCase(),
        'balanceOf': Math.floor(Math.random() * 1000000),
        'totalSupply': 1000000000,
        'owner': contract.deployerAddress,
        'getOwners': [contract.deployerAddress, `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`],
        'getTransactionCount': Math.floor(Math.random() * 50),
        'proposals': { id: 1, description: "Implement feature X", voteCount: 5, executed: false },
        'default': 'Mock response for ' + methodName + '(' + args.join(', ') + ')',
    };
    return mockResponses[methodName] || mockResponses['default'];
};

// Mock Interaction with a Deployed Contract (write function)
export const mockCallContractWriteMethod = async (
    contract: DeployedContract,
    methodName: string,
    args: any[],
    fromAddress: string,
    value: string = '0'
): Promise<Transaction> => {
    await sleep(3000);
    // In a real app, this would sign and send a transaction
    console.log(`Mock calling ${methodName} on ${contract.name} with args:`, args, `from: ${fromAddress}`);
    const txHash = `0x${Math.random().toString(16).slice(2, 66).padStart(64, '0')}`;
    const gasPrice = (Math.random() * 50 + 10).toFixed(0); // 10-60 Gwei
    const gasUsed = (Math.random() * 100000 + 21000).toFixed(0);

    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate

    return {
        hash: txHash,
        from: fromAddress,
        to: contract.address,
        value: value,
        gasPrice: gasPrice,
        gasUsed: gasUsed,
        status: success ? 'success' : 'failed',
        timestamp: Date.now(),
        description: `Call ${methodName} on ${contract.name}`,
    };
};

// Mock Fetching Contract Events
export const mockFetchContractEvents = async (contractAddress: string, network: NetworkConfig, eventName?: string): Promise<ContractEvent[]> => {
    await sleep(2500);
    const numEvents = Math.floor(Math.random() * 5) + 2; // 2-6 events
    const events: ContractEvent[] = [];
    for (let i = 0; i < numEvents; i++) {
        events.push({
            id: `${contractAddress}-${eventName || 'All'}-${Date.now()}-${i}`,
            contractAddress: contractAddress,
            eventName: eventName || (i % 2 === 0 ? 'Transfer' : 'Approval'),
            args: { from: `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`, to: `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`, value: (Math.random() * 1000).toFixed(2) },
            blockNumber: Math.floor(Math.random() * 10000000) + 12000000,
            transactionHash: `0x${Math.random().toString(16).slice(2, 66).padStart(64, '0')}`,
            timestamp: Date.now() - (i * 3600000) - (Math.random() * 86400000), // Events from last few days/hours
        });
    }
    return events;
};

// Mock Staking/Unstaking
export const mockStakeTokens = async (contractAddress: string, tokenSymbol: string, amount: string, userAddress: string): Promise<StakingPosition> => {
    await sleep(3000);
    console.log(`Mock staking ${amount} ${tokenSymbol} at ${contractAddress} by ${userAddress}`);
    return {
        id: `stake-${Date.now()}`,
        contractAddress,
        tokenSymbol,
        stakedAmount: amount,
        rewardsEarned: '0.00',
        lastClaimed: Date.now(),
        apy: `${(Math.random() * 50 + 5).toFixed(2)}%`,
        userAddress,
    };
};

export const mockUnstakeTokens = async (positionId: string, amount: string): Promise<void> => {
    await sleep(2000);
    console.log(`Mock unstaking ${amount} from position ${positionId}`);
    if (Math.random() < 0.1) throw new Error("Mock Unstake failed!"); // Simulate failure
};

// Mock NFT Minting
export const mockMintNFT = async (contractAddress: string, toAddress: string, tokenURI: string, minterAddress: string): Promise<NFTAsset> => {
    await sleep(4000);
    const tokenId = Math.floor(Math.random() * 1000000).toString();
    console.log(`Mock minting NFT ${tokenId} to ${toAddress} with URI ${tokenURI}`);
    return {
        id: `nft-${Date.now()}`,
        tokenId: tokenId,
        contractAddress: contractAddress,
        name: `MyNFT #${tokenId}`,
        description: `A unique digital collectible: ${tokenURI}`,
        imageUrl: `https://ipfs.io/ipfs/QmVG...mockimage.png`, // Placeholder image
        owner: toAddress,
        mintedBy: minterAddress,
        mintTimestamp: Date.now(),
    };
};

// Mock Transaction History Fetch
export const mockFetchTransactionHistory = async (address: string, network: NetworkConfig): Promise<Transaction[]> => {
    await sleep(2000);
    const numTxs = Math.floor(Math.random() * 10) + 5;
    const transactions: Transaction[] = [];
    for (let i = 0; i < numTxs; i++) {
        const isOutbound = Math.random() > 0.5;
        transactions.push({
            hash: `0x${Math.random().toString(16).slice(2, 66).padStart(64, '0')}`,
            from: isOutbound ? address : `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`,
            to: isOutbound ? `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}` : address,
            value: `${(Math.random() * 0.5).toFixed(4)}`,
            gasPrice: `${(Math.random() * 50 + 10).toFixed(0)}`,
            gasUsed: `${(Math.random() * 100000 + 21000).toFixed(0)}`,
            status: Math.random() > 0.1 ? 'success' : 'failed',
            timestamp: Date.now() - (i * 120000) - (Math.random() * 300000),
            description: `Transfer ${isOutbound ? 'out' : 'in'} on ${network.name}`,
        });
    }
    return transactions.sort((a, b) => b.timestamp - a.timestamp);
};


// --- END: Mock API / Blockchain Interaction Functions ---


// --- START: AI Integration (using GoogleGenAI) ---

export const analyzeSmartContractWithAI = async (code: string): Promise<AIAuditReport> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `You are a smart contract security auditor. Analyze the following Solidity code for potential vulnerabilities like reentrancy, integer overflow, access control issues, front-running, denial of service, timestamp dependency, and gas inefficiencies. Also identify potential gas optimizations. Provide a comprehensive report in a structured JSON-like format or clear paragraphs, including a security score out of 100, a summary, a list of specific vulnerabilities (type, severity, description, line numbers, recommendation), and a list of gas optimizations. 

        Example format (adapt as needed for clear parsing):
        \`\`\`json
        {
          "summary": "This contract is generally secure but has minor gas inefficiencies.",
          "securityScore": 85,
          "vulnerabilities": [
            {
              "type": "Reentrancy",
              "severity": "High",
              "description": "Potential reentrancy vulnerability in the withdraw function if external calls are not handled carefully.",
              "lineNumbers": [120, 125],
              "recommendation": "Implement Checks-Effects-Interactions pattern or use reentrancy guard."
            }
          ],
          "gasOptimizations": [
            "Use calldata instead of memory for external function parameters.",
            "Cache array length in loops."
          ]
        }
        \`\`\`

        If the code is simple and has no major issues, state that. For very simple contracts, provide a minimal, accurate report.

        Code: \`\`\`solidity\n${code}\n\`\`\``;

        const response = await ai.models.generateContent({ model: 'gemini-1.5-pro', contents: [{ text: prompt }] });
        const textResponse = response.text;

        // Attempt to parse JSON from the response, if the model provides it.
        // Otherwise, fallback to a generic audit report structure.
        let report: AIAuditReport;
        try {
            const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                const parsedJson = JSON.parse(jsonMatch[1]);
                report = {
                    summary: parsedJson.summary || "AI audit completed.",
                    vulnerabilities: parsedJson.vulnerabilities || [],
                    gasOptimizations: parsedJson.gasOptimizations || [],
                    securityScore: parsedJson.securityScore || 75,
                    timestamp: Date.now(),
                };
            } else {
                // Fallback if AI doesn't return perfect JSON
                report = {
                    summary: textResponse.substring(0, 500) + (textResponse.length > 500 ? "..." : ""),
                    vulnerabilities: [{ type: "General Analysis", severity: "Informational", description: textResponse, lineNumbers: [], recommendation: "Review AI output carefully." }],
                    gasOptimizations: [],
                    securityScore: Math.max(50, 100 - (textResponse.split('vulnerability').length - 1) * 10), // Heuristic
                    timestamp: Date.now(),
                };
            }
        } catch (parseError) {
            console.warn("Failed to parse AI audit report JSON, using raw text.", parseError);
            report = {
                summary: textResponse.substring(0, 500) + (textResponse.length > 500 ? "..." : ""),
                vulnerabilities: [{ type: "Parsing Error", severity: "Informational", description: `Could not parse structured report. Raw output: ${textResponse}`, lineNumbers: [], recommendation: "Review AI output carefully." }],
                gasOptimizations: [],
                securityScore: 60,
                timestamp: Date.now(),
            };
        }
        return report;

    } catch (err) {
        console.error("AI Audit Error:", err);
        return {
            summary: "Error generating audit report due to AI service issue.",
            vulnerabilities: [{ type: "Service Error", severity: "Critical", description: `AI service failed: ${err instanceof Error ? err.message : String(err)}`, lineNumbers: [], recommendation: "Check API key and try again." }],
            gasOptimizations: [],
            securityScore: 0,
            timestamp: Date.now(),
        };
    }
};


export const getAICodeSuggestion = async (
    type: 'generate' | 'explain' | 'optimize' | 'debug',
    input: string,
    context?: string
): Promise<AICodeAssistantResponse> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        let prompt = '';
        const model = 'gemini-1.5-pro'; // Or 'gemini-1.5-flash' for quicker, less detailed responses

        switch (type) {
            case 'generate':
                prompt = `You are an expert Solidity developer. Generate a Solidity smart contract for the following description: "${input}". Ensure it is secure and follows best practices. ${context ? `Additional context: ${context}` : ''} Provide only the contract code within a markdown block.`;
                break;
            case 'explain':
                prompt = `You are a smart contract expert. Explain the following Solidity code in simple terms, highlighting its purpose, main functions, and any potential security considerations. Code: \`\`\`solidity\n${input}\n\`\`\` ${context ? `Additional context: ${context}` : ''}`;
                break;
            case 'optimize':
                prompt = `You are a Solidity gas optimization expert. Analyze the following Solidity code and suggest gas optimizations. Provide the optimized code snippet if applicable, or a list of concrete recommendations. Code: \`\`\`solidity\n${input}\n\`\`\` ${context ? `Additional context: ${context}` : ''}`;
                break;
            case 'debug':
                prompt = `You are a Solidity debugger. Identify potential bugs, errors, or logical flaws in the following Solidity code and suggest fixes. Code: \`\`\`solidity\n${input}\n\`\`\` ${context ? `Additional context: ${context}` : ''}`;
                break;
            default:
                throw new Error('Unknown AI assistant type');
        }

        const response = await ai.models.generateContent({ model: model, contents: [{ text: prompt }] });
        const textResponse = response.text;

        // Extract code block if present
        const codeMatch = textResponse.match(/```solidity\n([\s\S]*?)\n```/);
        const codeContent = codeMatch && codeMatch[1] ? codeMatch[1] : textResponse;

        return {
            type,
            content: codeContent,
            suggestions: codeMatch ? undefined : textResponse.split('\n').filter(line => line.trim().length > 0 && !line.startsWith('```')), // If no code block, split into suggestions
            timestamp: Date.now(),
        };

    } catch (err) {
        console.error(`AI Code Assistant Error (${type}):`, err);
        return {
            type,
            content: `Error communicating with AI service for ${type}: ${err instanceof Error ? err.message : String(err)}`,
            timestamp: Date.now(),
        };
    }
};

// --- END: AI Integration ---


// --- START: Reusable UI Components (internal to this file for now) ---

interface CodeEditorProps {
    value: string;
    onChange: (newValue: string) => void;
    readOnly?: boolean;
    height?: string;
    placeholder?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, readOnly = false, height = 'h-64', placeholder = 'Enter Solidity code here...' }) => {
    return (
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full ${height} bg-gray-900/50 p-3 rounded-lg text-white font-mono text-sm border border-gray-700 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-y`}
            readOnly={readOnly}
            placeholder={placeholder}
            spellCheck="false"
        />
    );
};

interface LabeledInputProps {
    label: string;
    value: string;
    onChange: (newValue: string) => void;
    placeholder?: string;
    type?: string;
    id: string;
    disabled?: boolean;
}

export const LabeledInput: React.FC<LabeledInputProps> = ({ label, value, onChange, placeholder, type = 'text', id, disabled = false }) => (
    <div className="flex flex-col space-y-1">
        <label htmlFor={id} className="text-gray-300 text-sm font-medium">{label}</label>
        <input
            id={id}
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-900/50 p-2 rounded-lg text-white font-mono text-sm border border-gray-700 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
        />
    </div>
);

interface LabeledSelectProps {
    label: string;
    value: string | number;
    onChange: (newValue: string) => void;
    options: { value: string | number; label: string; }[];
    id: string;
    disabled?: boolean;
}

export const LabeledSelect: React.FC<LabeledSelectProps> = ({ label, value, onChange, options, id, disabled = false }) => (
    <div className="flex flex-col space-y-1">
        <label htmlFor={id} className="text-gray-300 text-sm font-medium">{label}</label>
        <select
            id={id}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-gray-900/50 p-2 rounded-lg text-white font-mono text-sm border border-gray-700 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);


interface TabProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
    count?: number; // Optional count for notifications, etc.
}

export const Tab: React.FC<TabProps> = ({ label, isActive, onClick, count }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 flex items-center gap-2
            ${isActive
                ? 'bg-gray-700 text-cyan-400 border-b-2 border-cyan-500'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border-b border-gray-700 hover:border-gray-600'
            }`}
    >
        {label}
        {count !== undefined && count > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-cyan-600 text-white rounded-full">
                {count}
            </span>
        )}
    </button>
);

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string; // e.g., 'max-w-2xl', 'max-w-4xl'
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm" onClick={onClose}>
            <div className={`bg-gray-800 rounded-xl shadow-3xl ${maxWidth} w-full border border-gray-700`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- END: Reusable UI Components ---


// --- START: Main SmartContractsView Component and its Sub-Sections ---

const SmartContractsView: React.FC = () => {
    // --- Global State Management ---
    const [activeTab, setActiveTab] = useState('dashboard');
    const [wallet, setWallet] = useState<WalletState>({
        isConnected: false,
        address: null,
        balance: null,
        networkId: null,
        networkName: null,
    });
    const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig>(SUPPORTED_NETWORKS[0]);
    const [deployedContracts, setDeployedContracts] = useState<DeployedContract[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingGlobal, setIsLoadingGlobal] = useState(false); // For global actions like wallet connection


    // --- AI Security Auditor State ---
    const [isAuditorOpen, setAuditorOpen] = useState(false);
    const [auditCode, setAuditCode] = useState('contract SimpleStore { uint256 public myNumber; function set(uint256 x) public { myNumber = x; } }');
    const [auditReport, setAuditReport] = useState<AIAuditReport | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);

    // --- Contract Deployment State ---
    const [isDeploymentModalOpen, setDeploymentModalOpen] = useState(false);
    const [deployContractName, setDeployContractName] = useState('');
    const [deploySourceCode, setDeploySourceCode] = useState(CONTRACT_TEMPLATES[0].solidityCode);
    const [deployConstructorArgs, setDeployConstructorArgs] = useState('[]'); // JSON string
    const [isCompiling, setIsCompiling] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [compiledBytecode, setCompiledBytecode] = useState('');
    const [compiledABI, setCompiledABI] = useState<any[]>([]);
    const [deploymentError, setDeploymentError] = useState('');

    // --- Contract Interaction State ---
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const selectedContract = useMemo(() => deployedContracts.find(c => c.id === selectedContractId), [selectedContractId, deployedContracts]);
    const [interactionMethod, setInteractionMethod] = useState('');
    const [interactionArgs, setInteractionArgs] = useState('[]'); // JSON string
    const [interactionResult, setInteractionResult] = useState<any>(null);
    const [isInteracting, setIsInteracting] = useState(false);
    const [interactionError, setInteractionError] = useState('');
    const [readResultLoading, setReadResultLoading] = useState(false);

    // --- Event Monitoring State ---
    const [contractEvents, setContractEvents] = useState<ContractEvent[]>([]);
    const [isFetchingEvents, setIsFetchingEvents] = useState(false);
    const [eventMonitorContractId, setEventMonitorContractId] = useState<string | null>(null);
    const eventMonitorContract = useMemo(() => deployedContracts.find(c => c.id === eventMonitorContractId), [eventMonitorContractId, deployedContracts]);


    // --- AI Code Assistant State ---
    const [isAICodeAssistantOpen, setAICodeAssistantOpen] = useState(false);
    const [aiCodeAssistantMode, setAICodeAssistantMode] = useState<'generate' | 'explain' | 'optimize' | 'debug'>('generate');
    const [aiCodeAssistantInput, setAICodeAssistantInput] = useState('');
    const [aiCodeAssistantContext, setAICodeAssistantContext] = useState('');
    const [aiCodeAssistantOutput, setAICodeAssistantOutput] = useState<AICodeAssistantResponse | null>(null);
    const [isAICodeAssistantLoading, setIsAICodeAssistantLoading] = useState(false);
    const [showCopyMessage, setShowCopyMessage] = useState(false);


    // --- Contract Templates State ---
    const [isTemplateBrowserOpen, setTemplateBrowserOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
    const [templatePreviewCode, setTemplatePreviewCode] = useState('');


    // --- DeFi Tools State ---
    const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
    const [isStakingLoading, setIsStakingLoading] = useState(false);
    const [stakeContractAddress, setStakeContractAddress] = useState('');
    const [stakeTokenSymbol, setStakeTokenSymbol] = useState('');
    const [stakeAmount, setStakeAmount] = useState('');
    const [unstakePositionId, setUnstakePositionId] = useState('');
    const [unstakeAmount, setUnstakeAmount] = useState('');


    // --- NFT Minting State ---
    const [nftAssets, setNftAssets] = useState<NFTAsset[]>([]);
    const [isMintingNFT, setIsMintingNFT] = useState(false);
    const [mintNFTContractAddress, setMintNFTContractAddress] = useState('');
    const [mintNFTToAddress, setMintNFTToAddress] = useState('');
    const [mintNFTTokenURI, setMintNFTTokenURI] = useState('');


    // --- Settings State ---
    const [developerMode, setDeveloperMode] = useState(false);
    const [gasPriceGwei, setGasPriceGwei] = useState('50'); // Mock setting


    // --- Effects & Callbacks ---

    // Load initial wallet state (mock)
    useEffect(() => {
        const loadWallet = async () => {
            setIsLoadingGlobal(true);
            try {
                const initialWallet = await mockConnectWallet();
                setWallet(initialWallet);
                if (initialWallet.networkId) {
                    const network = SUPPORTED_NETWORKS.find(n => n.id === initialWallet.networkId);
                    if (network) setCurrentNetwork(network);
                }
            } catch (error) {
                console.error("Failed to connect wallet on load:", error);
            } finally {
                setIsLoadingGlobal(false);
            }
        };
        loadWallet();
    }, []);

    // Fetch transactions when wallet or network changes
    useEffect(() => {
        if (wallet.isConnected && wallet.address && currentNetwork) {
            const fetchTxs = async () => {
                setIsLoadingGlobal(true);
                try {
                    const txs = await mockFetchTransactionHistory(wallet.address!, currentNetwork);
                    setTransactions(txs);
                } catch (error) {
                    console.error("Failed to fetch transactions:", error);
                } finally {
                    setIsLoadingGlobal(false);
                }
            };
            fetchTxs();
        } else {
            setTransactions([]);
        }
    }, [wallet.isConnected, wallet.address, currentNetwork]);


    // Handles wallet connection
    const handleConnectWallet = useCallback(async () => {
        setIsLoadingGlobal(true);
        try {
            const newWallet = await mockConnectWallet();
            setWallet(newWallet);
            if (newWallet.networkId) {
                const network = SUPPORTED_NETWORKS.find(n => n.id === newWallet.networkId);
                if (network) setCurrentNetwork(network);
            }
        } catch (error) {
            console.error("Wallet connection failed:", error);
            alert("Failed to connect wallet. See console for details.");
        } finally {
            setIsLoadingGlobal(false);
        }
    }, []);

    // Handles wallet disconnection
    const handleDisconnectWallet = useCallback(async () => {
        setIsLoadingGlobal(true);
        try {
            const disconnectedWallet = await mockDisconnectWallet();
            setWallet(disconnectedWallet);
        } catch (error) {
            console.error("Wallet disconnection failed:", error);
            alert("Failed to disconnect wallet. See console for details.");
        } finally {
            setIsLoadingGlobal(false);
        }
    }, []);

    // Handles network switching
    const handleNetworkChange = useCallback(async (networkId: number) => {
        if (networkId === currentNetwork.id) return;

        setIsLoadingGlobal(true);
        try {
            const newWalletState = await mockSwitchNetwork(networkId);
            setWallet(newWalletState);
            const newNetwork = SUPPORTED_NETWORKS.find(n => n.id === networkId);
            if (newNetwork) {
                setCurrentNetwork(newNetwork);
            }
        } catch (error) {
            console.error("Failed to switch network:", error);
            alert(`Failed to switch to network ID ${networkId}.`);
        } finally {
            setIsLoadingGlobal(false);
        }
    }, [currentNetwork.id]);


    // --- AI Security Auditor Handlers ---
    const handleAudit = useCallback(async () => {
        setIsAuditing(true);
        setAuditReport(null);
        try {
            const report = await analyzeSmartContractWithAI(auditCode);
            setAuditReport(report);
        } catch (err) {
            console.error("Error during AI audit:", err);
            setAuditReport({
                summary: "Error generating audit report.",
                vulnerabilities: [{ type: "Application Error", severity: "Critical", description: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`, lineNumbers: [], recommendation: "Try again or check network." }],
                gasOptimizations: [],
                securityScore: 0,
                timestamp: Date.now(),
            });
        } finally {
            setIsAuditing(false);
        }
    }, [auditCode]);


    // --- Contract Deployment Handlers ---
    const handleOpenDeploymentModal = useCallback(() => {
        setDeploymentModalOpen(true);
        setDeploySourceCode(CONTRACT_TEMPLATES[0].solidityCode); // Default to a template
        setDeployContractName('');
        setDeployConstructorArgs('[]');
        setCompiledBytecode('');
        setCompiledABI([]);
        setDeploymentError('');
    }, []);

    const handleCompileAndDeploy = useCallback(async () => {
        if (!wallet.isConnected || !wallet.address || !currentNetwork) {
            setDeploymentError("Please connect your wallet and select a network first.");
            return;
        }

        setDeploymentError('');
        setIsCompiling(true);
        setIsDeploying(false); // Reset deploy state

        let bytecode: string = '';
        let abi: any[] = [];

        try {
            const compilationResult = await mockCompileContract(deploySourceCode);
            bytecode = compilationResult.bytecode;
            abi = compilationResult.abi;
            setCompiledBytecode(bytecode);
            setCompiledABI(abi);
        } catch (error) {
            setDeploymentError(`Compilation failed: ${error instanceof Error ? error.message : String(error)}`);
            setIsCompiling(false);
            return;
        } finally {
            setIsCompiling(false);
        }

        setIsDeploying(true);
        try {
            const args = JSON.parse(deployConstructorArgs);
            const newContract = await mockDeployContract(
                currentNetwork,
                wallet.address,
                deployContractName || 'NewContract',
                bytecode,
                abi,
                args
            );
            setDeployedContracts(prev => [...prev, newContract]);
            setSelectedContractId(newContract.id); // Auto-select new contract for interaction
            setDeploymentModalOpen(false); // Close modal on success
            alert(`Contract "${newContract.name}" deployed successfully at ${newContract.address}!`);
        } catch (error) {
            setDeploymentError(`Deployment failed: ${error instanceof Error ? error.message : String(error)}. Ensure constructor arguments are valid JSON and match ABI.`);
        } finally {
            setIsDeploying(false);
        }
    }, [wallet, currentNetwork, deploySourceCode, deployContractName, deployConstructorArgs]);


    // --- Contract Interaction Handlers ---
    const handleInteractWithContract = useCallback(async (isReadCall: boolean) => {
        if (!selectedContract) {
            setInteractionError("No contract selected for interaction.");
            return;
        }
        if (!interactionMethod) {
            setInteractionError("No method selected.");
            return;
        }
        if (!wallet.isConnected || !wallet.address) {
            setInteractionError("Connect wallet to interact with contract.");
            return;
        }

        setInteractionError('');
        setInteractionResult(null);

        const methodABI = selectedContract.abi.find(item => item.name === interactionMethod && (item.type === 'function'));
        if (!methodABI) {
            setInteractionError("Selected method not found in contract ABI.");
            return;
        }

        let parsedArgs: any[] = [];
        try {
            parsedArgs = JSON.parse(interactionArgs);
            if (!Array.isArray(parsedArgs)) {
                throw new Error("Arguments must be a JSON array.");
            }
            // Basic type checking - ensure args length matches ABI inputs
            if (methodABI.inputs && methodABI.inputs.length !== parsedArgs.length) {
                console.warn(`Mismatch in argument count: ABI expects ${methodABI.inputs.length}, provided ${parsedArgs.length}.`);
                // This might be acceptable for some overloaded functions, but for a simple UI, it's a warning.
            }
        } catch (e) {
            setInteractionError(`Invalid arguments: ${e instanceof Error ? e.message : String(e)}`);
            return;
        }

        if (isReadCall) {
            setReadResultLoading(true);
            try {
                const result = await mockCallContractReadMethod(selectedContract, interactionMethod, parsedArgs);
                setInteractionResult(JSON.stringify(result, null, 2));
            } catch (error) {
                setInteractionError(`Read call failed: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                setReadResultLoading(false);
            }
        } else { // Write call
            setIsInteracting(true);
            try {
                const tx = await mockCallContractWriteMethod(selectedContract, interactionMethod, parsedArgs, wallet.address);
                setInteractionResult(`Transaction sent! Hash: ${tx.hash}\nStatus: ${tx.status}`);
                setTransactions(prev => [tx, ...prev]); // Add to transaction history
                alert(`Transaction for ${selectedContract.name}.${interactionMethod} ${tx.status}! Hash: ${tx.hash}`);
            } catch (error) {
                setInteractionError(`Write call failed: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                setIsInteracting(false);
            }
        }
    }, [selectedContract, interactionMethod, interactionArgs, wallet]);


    // --- Event Monitoring Handlers ---
    const handleFetchContractEvents = useCallback(async () => {
        if (!eventMonitorContract) {
            setInteractionError("No contract selected for event monitoring."); // Reuse interactionError for simplicity
            return;
        }
        setIsFetchingEvents(true);
        setContractEvents([]);
        try {
            const events = await mockFetchContractEvents(eventMonitorContract.address, eventMonitorContract.network);
            setContractEvents(events);
        } catch (error) {
            console.error("Failed to fetch events:", error);
            alert(`Failed to fetch events: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsFetchingEvents(false);
        }
    }, [eventMonitorContract]);

    // --- AI Code Assistant Handlers ---
    const handleAICodeAssistant = useCallback(async () => {
        if (!aiCodeAssistantInput.trim()) {
            alert('Please provide input for the AI assistant.');
            return;
        }
        setIsAICodeAssistantLoading(true);
        setAICodeAssistantOutput(null);
        try {
            const response = await getAICodeSuggestion(aiCodeAssistantMode, aiCodeAssistantInput, aiCodeAssistantContext);
            setAICodeAssistantOutput(response);
        } catch (error) {
            console.error("AI Code Assistant Error:", error);
            setAICodeAssistantOutput({
                type: aiCodeAssistantMode,
                content: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: Date.now(),
            });
        } finally {
            setIsAICodeAssistantLoading(false);
        }
    }, [aiCodeAssistantMode, aiCodeAssistantInput, aiCodeAssistantContext]);

    const handleCopyAICodeOutput = useCallback(() => {
        if (aiCodeAssistantOutput?.content) {
            navigator.clipboard.writeText(aiCodeAssistantOutput.content);
            setShowCopyMessage(true);
            setTimeout(() => setShowCopyMessage(false), 2000);
        }
    }, [aiCodeAssistantOutput]);

    // --- Template Browser Handlers ---
    const handleSelectTemplate = useCallback((template: ContractTemplate) => {
        setSelectedTemplate(template);
        setTemplatePreviewCode(template.solidityCode);
    }, []);

    const handleApplyTemplate = useCallback(() => {
        if (selectedTemplate) {
            setDeploySourceCode(selectedTemplate.solidityCode);
            setDeployContractName(selectedTemplate.name.replace(/[^a-zA-Z0-9]/g, '')); // Basic sanitization
            setTemplateBrowserOpen(false);
            setDeploymentModalOpen(true); // Open deployment modal with pre-filled code
            setSelectedTemplate(null); // Clear selected template
        }
    }, [selectedTemplate]);


    // --- DeFi Tools Handlers ---
    const handleStakeTokens = useCallback(async () => {
        if (!wallet.isConnected || !wallet.address || !stakeContractAddress || !stakeTokenSymbol || !stakeAmount) {
            alert('Please connect wallet and fill all staking fields.');
            return;
        }
        setIsStakingLoading(true);
        try {
            const newPosition = await mockStakeTokens(stakeContractAddress, stakeTokenSymbol, stakeAmount, wallet.address);
            setStakingPositions(prev => [...prev, newPosition]);
            alert(`Staked ${newPosition.stakedAmount} ${newPosition.tokenSymbol}!`);
            // Reset fields
            setStakeContractAddress('');
            setStakeTokenSymbol('');
            setStakeAmount('');
        } catch (error) {
            console.error("Staking failed:", error);
            alert(`Staking failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsStakingLoading(false);
        }
    }, [wallet, stakeContractAddress, stakeTokenSymbol, stakeAmount]);

    const handleUnstakeTokens = useCallback(async () => {
        if (!unstakePositionId || !unstakeAmount) {
            alert('Please select a position and enter amount to unstake.');
            return;
        }
        setIsStakingLoading(true);
        try {
            await mockUnstakeTokens(unstakePositionId, unstakeAmount);
            setStakingPositions(prev => prev.filter(pos => pos.id !== unstakePositionId)); // Remove for simplicity
            alert(`Successfully unstaked from position ${unstakePositionId}!`);
            // Reset fields
            setUnstakePositionId('');
            setUnstakeAmount('');
        } catch (error) {
            console.error("Unstaking failed:", error);
            alert(`Unstaking failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsStakingLoading(false);
        }
    }, [unstakePositionId, unstakeAmount]);


    // --- NFT Minting Handlers ---
    const handleMintNFT = useCallback(async () => {
        if (!wallet.isConnected || !wallet.address || !mintNFTContractAddress || !mintNFTToAddress || !mintNFTTokenURI) {
            alert('Please connect wallet and fill all NFT minting fields.');
            return;
        }
        setIsMintingNFT(true);
        try {
            const newNFT = await mockMintNFT(mintNFTContractAddress, mintNFTToAddress, mintNFTTokenURI, wallet.address);
            setNftAssets(prev => [...prev, newNFT]);
            alert(`Successfully minted NFT #${newNFT.tokenId} to ${newNFT.owner}!`);
            // Reset fields
            setMintNFTContractAddress('');
            setMintNFTToAddress('');
            setMintNFTTokenURI('');
        } catch (error) {
            console.error("NFT Minting failed:", error);
            alert(`NFT Minting failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsMintingNFT(false);
        }
    }, [wallet, mintNFTContractAddress, mintNFTToAddress, mintNFTTokenURI]);


    // --- Render Logic ---

    // Filter available methods for interaction based on selected contract ABI
    const availableMethods = useMemo(() => {
        if (!selectedContract) return [];
        return selectedContract.abi
            .filter(item => item.type === 'function')
            .map(item => ({
                value: item.name,
                label: `${item.name}(${item.inputs.map((input: any) => `${input.type} ${input.name}`).join(', ')}) - ${item.stateMutability}`
            }));
    }, [selectedContract]);

    const currentMethodABI = useMemo(() => {
        if (!selectedContract || !interactionMethod) return null;
        return selectedContract.abi.find(item => item.name === interactionMethod && item.type === 'function');
    }, [selectedContract, interactionMethod]);


    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">Smart Contract Workbench</h2>
                    <div className="flex items-center space-x-3">
                        <LabeledSelect
                            id="network-selector"
                            label="Network"
                            value={currentNetwork.id}
                            onChange={(value) => handleNetworkChange(Number(value))}
                            options={SUPPORTED_NETWORKS.map(net => ({ value: net.id, label: net.name }))}
                            disabled={isLoadingGlobal}
                        />
                        {wallet.isConnected ? (
                            <button
                                onClick={handleDisconnectWallet}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                disabled={isLoadingGlobal}
                            >
                                Disconnect Wallet ({wallet.address?.substring(0, 6)}...)
                            </button>
                        ) : (
                            <button
                                onClick={handleConnectWallet}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                disabled={isLoadingGlobal}
                            >
                                Connect Wallet
                            </button>
                        )}
                        <button onClick={() => setAuditorOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">AI Security Auditor</button>
                    </div>
                </div>

                {wallet.isConnected && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                        <Card title="Wallet Address" className="bg-gray-800/50">
                            <span className="font-mono text-cyan-400 text-sm">{wallet.address}</span>
                        </Card>
                        <Card title="Balance" className="bg-gray-800/50">
                            <span className="font-bold text-green-400 text-lg">{wallet.balance || '0.00 ETH'}</span>
                        </Card>
                        <Card title="Connected Network" className="bg-gray-800/50">
                            <span className="font-semibold text-white text-md">{wallet.networkName} (ID: {wallet.networkId})</span>
                        </Card>
                        <Card title="Active Contracts" className="bg-gray-800/50">
                            <span className="font-bold text-purple-400 text-lg">{deployedContracts.length}</span>
                        </Card>
                    </div>
                )}


                {/* Tab Navigation */}
                <div className="flex border-b border-gray-700 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <Tab label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <Tab label="Deploy & Manage" isActive={activeTab === 'deploy'} onClick={() => setActiveTab('deploy')} count={deployedContracts.length} />
                    <Tab label="Interact" isActive={activeTab === 'interact'} onClick={() => setActiveTab('interact')} />
                    <Tab label="Monitor" isActive={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} count={contractEvents.length > 0 || transactions.length > 0 ? (contractEvents.length + transactions.length) : undefined} />
                    <Tab label="AI Tools" isActive={activeTab === 'ai-tools'} onClick={() => setActiveTab('ai-tools')} />
                    <Tab label="Templates" isActive={activeTab === 'templates'} onClick={() => setTemplateBrowserOpen(true)} />
                    <Tab label="DeFi Tools" isActive={activeTab === 'defi'} onClick={() => setActiveTab('defi')} />
                    <Tab label="NFT Tools" isActive={activeTab === 'nft'} onClick={() => setActiveTab('nft')} />
                    <Tab label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </div>

                {/* Tab Content */}
                <div className="py-6 space-y-6">
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card title="Recent Transactions" className="col-span-1 md:col-span-2">
                                {transactions.length === 0 ? (
                                    <p className="text-gray-400">No recent transactions found.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm text-left text-gray-400">
                                            <thead className="text-xs text-gray-200 uppercase bg-gray-700">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2">Hash</th>
                                                    <th scope="col" className="px-4 py-2">Type</th>
                                                    <th scope="col" className="px-4 py-2">Value</th>
                                                    <th scope="col" className="px-4 py-2">Status</th>
                                                    <th scope="col" className="px-4 py-2">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.slice(0, 5).map(tx => (
                                                    <tr key={tx.hash} className="border-b border-gray-700 hover:bg-gray-800">
                                                        <td className="px-4 py-2 font-mono text-xs"><a href={`${currentNetwork.explorerUrl}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{tx.hash.substring(0, 10)}...</a></td>
                                                        <td className="px-4 py-2">{tx.from === wallet.address ? 'Outgoing' : 'Incoming'}</td>
                                                        <td className="px-4 py-2">{tx.value} {currentNetwork.currency}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2">{new Date(tx.timestamp).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>

                            <Card title="Deployed Contracts Overview">
                                <ul className="space-y-2 text-sm text-gray-300">
                                    {deployedContracts.length === 0 ? (
                                        <li className="text-gray-400">No contracts deployed yet.</li>
                                    ) : (
                                        deployedContracts.slice(0, 5).map(contract => (
                                            <li key={contract.id} className="flex justify-between items-center p-2 bg-gray-900/40 rounded-lg">
                                                <span className="font-semibold text-white">{contract.name}</span>
                                                <span className="font-mono text-cyan-300 text-xs">{contract.address.substring(0, 10)}...</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                                {deployedContracts.length > 5 && (
                                    <button onClick={() => setActiveTab('deploy')} className="mt-4 text-cyan-500 hover:text-cyan-400 text-sm">View all contracts &rarr;</button>
                                )}
                            </Card>

                            <Card title="Quick Actions" className="lg:col-span-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    <button onClick={handleOpenDeploymentModal} className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Deploy New Contract</button>
                                    <button onClick={() => setAuditorOpen(true)} className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">AI Security Audit</button>
                                    <button onClick={() => { setAICodeAssistantOpen(true); setAICodeAssistantMode('generate'); }} className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">AI Code Generator</button>
                                    <button onClick={() => setActiveTab('defi')} className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors">Explore DeFi Tools</button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'deploy' && (
                        <div className="space-y-8">
                            <Card title="Deployed Smart Contracts">
                                {deployedContracts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 text-lg mb-4">No contracts deployed yet. Get started by deploying one!</p>
                                        <button onClick={handleOpenDeploymentModal} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-md font-medium transition-colors">
                                            Deploy Your First Contract
                                        </button>
                                        <p className="mt-4 text-gray-500 text-sm">Or explore <button onClick={() => setTemplateBrowserOpen(true)} className="text-cyan-500 hover:text-cyan-400 underline">Contract Templates</button></p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm text-left text-gray-400">
                                            <thead className="text-xs text-gray-200 uppercase bg-gray-700">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2">Name</th>
                                                    <th scope="col" className="px-4 py-2">Address</th>
                                                    <th scope="col" className="px-4 py-2">Network</th>
                                                    <th scope="col" className="px-4 py-2">Deployer</th>
                                                    <th scope="col" className="px-4 py-2">Deployed On</th>
                                                    <th scope="col" className="px-4 py-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {deployedContracts.map(contract => (
                                                    <tr key={contract.id} className="border-b border-gray-700 hover:bg-gray-800">
                                                        <td className="px-4 py-2 font-semibold text-white">{contract.name}</td>
                                                        <td className="px-4 py-2 font-mono text-xs text-cyan-400">
                                                            <a href={`${contract.network.explorerUrl}/address/${contract.address}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                                {contract.address.substring(0, 10)}...{contract.address.slice(-8)}
                                                            </a>
                                                        </td>
                                                        <td className="px-4 py-2">{contract.network.name}</td>
                                                        <td className="px-4 py-2 font-mono text-xs">{contract.deployerAddress.substring(0, 6)}...</td>
                                                        <td className="px-4 py-2 text-xs">{new Date(contract.timestamp).toLocaleString()}</td>
                                                        <td className="px-4 py-2 flex space-x-2">
                                                            <button
                                                                onClick={() => { setSelectedContractId(contract.id); setActiveTab('interact'); }}
                                                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
                                                            >
                                                                Interact
                                                            </button>
                                                            <button
                                                                onClick={() => { setEventMonitorContractId(contract.id); setActiveTab('monitor'); handleFetchContractEvents(); }}
                                                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                                                            >
                                                                Monitor
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>

                            <button onClick={handleOpenDeploymentModal} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-md font-medium transition-colors flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Deploy New Contract
                            </button>
                        </div>
                    )}

                    {activeTab === 'interact' && (
                        <div className="space-y-6">
                            <Card title="Interact with Smart Contract">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <LabeledSelect
                                        id="select-contract-to-interact"
                                        label="Select Deployed Contract"
                                        value={selectedContractId || ''}
                                        onChange={setSelectedContractId}
                                        options={[
                                            { value: '', label: '--- Select a contract ---' },
                                            ...deployedContracts.map(c => ({ value: c.id, label: `${c.name} (${c.address.substring(0, 6)}...)` }))
                                        ]}
                                        disabled={deployedContracts.length === 0}
                                    />
                                    <LabeledSelect
                                        id="select-method-to-call"
                                        label="Select Method"
                                        value={interactionMethod}
                                        onChange={setInteractionMethod}
                                        options={[
                                            { value: '', label: '--- Select a method ---' },
                                            ...availableMethods
                                        ]}
                                        disabled={!selectedContract}
                                    />
                                </div>

                                {selectedContract && interactionMethod && currentMethodABI && (
                                    <div className="mt-6 space-y-4">
                                        <LabeledInput
                                            id="interaction-args"
                                            label={`Arguments (JSON array for: ${currentMethodABI.inputs.map((input: any) => input.name || `arg${input.type}`).join(', ')})`}
                                            value={interactionArgs}
                                            onChange={setInteractionArgs}
                                            placeholder='e.g., ["value1", 123, true]'
                                            type="text"
                                        />

                                        {currentMethodABI.stateMutability === 'payable' && (
                                            <LabeledInput
                                                id="interaction-value"
                                                label={`Value (in ${currentNetwork.currency})`}
                                                value={'0'} // TODO: Add a state for this
                                                onChange={() => {}} // TODO: Implement value
                                                placeholder='e.g., 0.1'
                                                type="number"
                                            />
                                        )}

                                        <div className="flex gap-4 pt-2">
                                            {['view', 'pure'].includes(currentMethodABI.stateMutability) ? (
                                                <button
                                                    onClick={() => handleInteractWithContract(true)}
                                                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                                    disabled={isInteracting || readResultLoading || !wallet.isConnected}
                                                >
                                                    {readResultLoading ? 'Reading...' : 'Read Contract State'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleInteractWithContract(false)}
                                                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                                    disabled={isInteracting || readResultLoading || !wallet.isConnected}
                                                >
                                                    {isInteracting ? 'Sending Transaction...' : 'Execute Transaction'}
                                                </button>
                                            )}
                                        </div>

                                        {interactionError && (
                                            <p className="text-red-400 text-sm bg-red-900/30 p-3 rounded-lg border border-red-800">Error: {interactionError}</p>
                                        )}

                                        {interactionResult && (
                                            <Card title="Interaction Result">
                                                <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-900/50 p-3 rounded-lg text-cyan-300 overflow-x-auto min-h-[5rem]">
                                                    {interactionResult}
                                                </pre>
                                            </Card>
                                        )}
                                    </div>
                                )}
                                {!selectedContract && (
                                    <p className="text-gray-500 text-center py-4">Select a contract from your deployed list to interact.</p>
                                )}
                            </Card>
                        </div>
                    )}

                    {activeTab === 'monitor' && (
                        <div className="space-y-6">
                            <Card title="Contract Event Monitor">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <LabeledSelect
                                        id="select-contract-to-monitor"
                                        label="Select Deployed Contract"
                                        value={eventMonitorContractId || ''}
                                        onChange={setEventMonitorContractId}
                                        options={[
                                            { value: '', label: '--- Select a contract ---' },
                                            ...deployedContracts.map(c => ({ value: c.id, label: `${c.name} (${c.address.substring(0, 6)}...)` }))
                                        ]}
                                        disabled={deployedContracts.length === 0 || isFetchingEvents}
                                    />
                                    <button
                                        onClick={handleFetchContractEvents}
                                        className="mt-7 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                        disabled={!eventMonitorContract || isFetchingEvents}
                                    >
                                        {isFetchingEvents ? 'Fetching Events...' : 'Fetch Events'}
                                    </button>
                                </div>
                                <div className="mt-6">
                                    {eventMonitorContract && contractEvents.length === 0 && !isFetchingEvents ? (
                                        <p className="text-gray-400 text-center py-4">No events found for this contract.</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm text-left text-gray-400">
                                                <thead className="text-xs text-gray-200 uppercase bg-gray-700">
                                                    <tr>
                                                        <th scope="col" className="px-4 py-2">Event Name</th>
                                                        <th scope="col" className="px-4 py-2">Args</th>
                                                        <th scope="col" className="px-4 py-2">Block</th>
                                                        <th scope="col" className="px-4 py-2">Tx Hash</th>
                                                        <th scope="col" className="px-4 py-2">Timestamp</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {contractEvents.map(event => (
                                                        <tr key={event.id} className="border-b border-gray-700 hover:bg-gray-800">
                                                            <td className="px-4 py-2 font-semibold text-white">{event.eventName}</td>
                                                            <td className="px-4 py-2 font-mono text-xs">{JSON.stringify(event.args, null, 2)}</td>
                                                            <td className="px-4 py-2">{event.blockNumber}</td>
                                                            <td className="px-4 py-2 font-mono text-xs"><a href={`${currentNetwork.explorerUrl}/tx/${event.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{event.transactionHash.substring(0, 10)}...</a></td>
                                                            <td className="px-4 py-2 text-xs">{new Date(event.timestamp).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card title="Transaction History">
                                {transactions.length === 0 ? (
                                    <p className="text-gray-400 text-center py-4">No transactions found for the connected wallet.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm text-left text-gray-400">
                                            <thead className="text-xs text-gray-200 uppercase bg-gray-700">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2">Hash</th>
                                                    <th scope="col" className="px-4 py-2">From</th>
                                                    <th scope="col" className="px-4 py-2">To</th>
                                                    <th scope="col" className="px-4 py-2">Value</th>
                                                    <th scope="col" className="px-4 py-2">Status</th>
                                                    <th scope="col" className="px-4 py-2">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map(tx => (
                                                    <tr key={tx.hash} className="border-b border-gray-700 hover:bg-gray-800">
                                                        <td className="px-4 py-2 font-mono text-xs"><a href={`${currentNetwork.explorerUrl}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{tx.hash.substring(0, 10)}...</a></td>
                                                        <td className="px-4 py-2 font-mono text-xs">{tx.from.substring(0, 6)}...</td>
                                                        <td className="px-4 py-2 font-mono text-xs">{tx.to.substring(0, 6)}...</td>
                                                        <td className="px-4 py-2">{tx.value} {currentNetwork.currency}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-xs">{new Date(tx.timestamp).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {activeTab === 'ai-tools' && (
                        <div className="space-y-6">
                            <Card title="AI Code Assistant">
                                <div className="flex space-x-2 border-b border-gray-700 mb-4">
                                    <button
                                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${aiCodeAssistantMode === 'generate' ? 'bg-gray-700 text-cyan-400 border-b-2 border-cyan-500' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                        onClick={() => setAICodeAssistantMode('generate')}
                                    >
                                        Generate Code
                                    </button>
                                    <button
                                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${aiCodeAssistantMode === 'explain' ? 'bg-gray-700 text-cyan-400 border-b-2 border-cyan-500' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                        onClick={() => setAICodeAssistantMode('explain')}
                                    >
                                        Explain Code
                                    </button>
                                    <button
                                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${aiCodeAssistantMode === 'optimize' ? 'bg-gray-700 text-cyan-400 border-b-2 border-cyan-500' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                        onClick={() => setAICodeAssistantMode('optimize')}
                                    >
                                        Optimize Code
                                    </button>
                                    <button
                                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${aiCodeAssistantMode === 'debug' ? 'bg-gray-700 text-cyan-400 border-b-2 border-cyan-500' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                        onClick={() => setAICodeAssistantMode('debug')}
                                    >
                                        Debug Code
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {aiCodeAssistantMode === 'generate' ? (
                                        <LabeledInput
                                            id="ai-generate-input"
                                            label="Describe the contract you want to generate"
                                            value={aiCodeAssistantInput}
                                            onChange={setAICodeAssistantInput}
                                            placeholder="e.g., An ERC-20 token with a fixed supply and a burn function."
                                        />
                                    ) : (
                                        <div className="flex flex-col space-y-1">
                                            <label htmlFor="ai-code-input" className="text-gray-300 text-sm font-medium">Solidity Code Input</label>
                                            <CodeEditor
                                                value={aiCodeAssistantInput}
                                                onChange={setAICodeAssistantInput}
                                                height="h-40"
                                                placeholder="Paste your Solidity code here..."
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-col space-y-1">
                                        <label htmlFor="ai-context-input" className="text-gray-300 text-sm font-medium">Additional Context (Optional)</label>
                                        <textarea
                                            id="ai-context-input"
                                            value={aiCodeAssistantContext}
                                            onChange={e => setAICodeAssistantContext(e.target.value)}
                                            className="w-full h-24 bg-gray-900/50 p-2 rounded-lg text-white font-mono text-sm border border-gray-700 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-y"
                                            placeholder="Any specific requirements, constraints, or areas to focus on."
                                        />
                                    </div>

                                    <button
                                        onClick={handleAICodeAssistant}
                                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                        disabled={isAICodeAssistantLoading || !aiCodeAssistantInput.trim()}
                                    >
                                        {isAICodeAssistantLoading ? `Processing ${aiCodeAssistantMode}...` : `Get AI ${aiCodeAssistantMode} Suggestion`}
                                    </button>

                                    {aiCodeAssistantOutput && (
                                        <Card title="AI Output">
                                            <div className="relative">
                                                <CodeEditor
                                                    value={aiCodeAssistantOutput.content}
                                                    readOnly
                                                    height="h-64"
                                                    placeholder="AI generated content will appear here..."
                                                />
                                                <button
                                                    onClick={handleCopyAICodeOutput}
                                                    className="absolute top-3 right-3 p-2 bg-gray-700/80 hover:bg-gray-600 rounded-lg text-white text-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-4 0a2 2 0 01-2 2H8a2 2 0 01-2-2"></path></svg>
                                                </button>
                                                {showCopyMessage && (
                                                    <span className="absolute top-10 right-20 bg-green-500 text-white text-xs px-2 py-1 rounded-md">Copied!</span>
                                                )}
                                            </div>
                                            {aiCodeAssistantOutput.suggestions && aiCodeAssistantOutput.suggestions.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-md font-semibold text-white mb-2">Suggestions:</h4>
                                                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                                        {aiCodeAssistantOutput.suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </Card>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'defi' && (
                        <div className="space-y-6">
                            <Card title="DeFi Staking Tools">
                                <h3 className="text-xl font-semibold text-white mb-4">Stake Tokens</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <LabeledInput
                                        id="stake-contract-address"
                                        label="Staking Contract Address"
                                        value={stakeContractAddress}
                                        onChange={setStakeContractAddress}
                                        placeholder="0x..."
                                        disabled={isStakingLoading || !wallet.isConnected}
                                    />
                                    <LabeledInput
                                        id="stake-token-symbol"
                                        label="Token Symbol (e.g., USDC, DAI)"
                                        value={stakeTokenSymbol}
                                        onChange={setStakeTokenSymbol}
                                        placeholder="USDC"
                                        disabled={isStakingLoading || !wallet.isConnected}
                                    />
                                    <LabeledInput
                                        id="stake-amount"
                                        label="Amount to Stake"
                                        value={stakeAmount}
                                        onChange={setStakeAmount}
                                        type="number"
                                        placeholder="100.0"
                                        disabled={isStakingLoading || !wallet.isConnected}
                                    />
                                    <button
                                        onClick={handleStakeTokens}
                                        className="mt-7 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                        disabled={isStakingLoading || !wallet.isConnected || !stakeContractAddress || !stakeTokenSymbol || !stakeAmount}
                                    >
                                        {isStakingLoading ? 'Staking...' : 'Stake Tokens'}
                                    </button>
                                </div>

                                <h3 className="text-xl font-semibold text-white mt-8 mb-4">Your Staking Positions</h3>
                                {stakingPositions.length === 0 ? (
                                    <p className="text-gray-400">No active staking positions.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm text-left text-gray-400">
                                            <thead className="text-xs text-gray-200 uppercase bg-gray-700">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2">Contract</th>
                                                    <th scope="col" className="px-4 py-2">Token</th>
                                                    <th scope="col" className="px-4 py-2">Amount</th>
                                                    <th scope="col" className="px-4 py-2">APY</th>
                                                    <th scope="col" className="px-4 py-2">Rewards</th>
                                                    <th scope="col" className="px-4 py-2">Last Claimed</th>
                                                    <th scope="col" className="px-4 py-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stakingPositions.map(pos => (
                                                    <tr key={pos.id} className="border-b border-gray-700 hover:bg-gray-800">
                                                        <td className="px-4 py-2 font-mono text-xs">{pos.contractAddress.substring(0, 10)}...</td>
                                                        <td className="px-4 py-2">{pos.tokenSymbol}</td>
                                                        <td className="px-4 py-2 font-bold text-white">{pos.stakedAmount}</td>
                                                        <td className="px-4 py-2 text-green-400">{pos.apy}</td>
                                                        <td className="px-4 py-2 text-yellow-400">{pos.rewardsEarned}</td>
                                                        <td className="px-4 py-2 text-xs">{new Date(pos.lastClaimed).toLocaleString()}</td>
                                                        <td className="px-4 py-2">
                                                            <button
                                                                onClick={() => { setUnstakePositionId(pos.id); setUnstakeAmount(pos.stakedAmount); }}
                                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                                            >
                                                                Unstake
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {stakingPositions.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-gray-700 space-y-4">
                                        <h3 className="text-xl font-semibold text-white">Unstake Tokens</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <LabeledSelect
                                                id="unstake-position-id"
                                                label="Select Position to Unstake From"
                                                value={unstakePositionId}
                                                onChange={setUnstakePositionId}
                                                options={[
                                                    { value: '', label: '--- Select a position ---' },
                                                    ...stakingPositions.map(pos => ({ value: pos.id, label: `${pos.tokenSymbol} - ${pos.stakedAmount} staked` }))
                                                ]}
                                                disabled={isStakingLoading || !wallet.isConnected}
                                            />
                                            <LabeledInput
                                                id="unstake-amount"
                                                label="Amount to Unstake"
                                                value={unstakeAmount}
                                                onChange={setUnstakeAmount}
                                                type="number"
                                                placeholder="Amount from position"
                                                disabled={isStakingLoading || !wallet.isConnected}
                                            />
                                            <button
                                                onClick={handleUnstakeTokens}
                                                className="md:col-span-2 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                                disabled={isStakingLoading || !wallet.isConnected || !unstakePositionId || !unstakeAmount}
                                            >
                                                {isStakingLoading ? 'Unstaking...' : 'Unstake Selected'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {activeTab === 'nft' && (
                        <div className="space-y-6">
                            <Card title="NFT Minting & Management">
                                <h3 className="text-xl font-semibold text-white mb-4">Mint New NFT</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <LabeledInput
                                        id="mint-nft-contract-address"
                                        label="NFT Contract Address (ERC-721)"
                                        value={mintNFTContractAddress}
                                        onChange={setMintNFTContractAddress}
                                        placeholder="0x..."
                                        disabled={isMintingNFT || !wallet.isConnected}
                                    />
                                    <LabeledInput
                                        id="mint-nft-to-address"
                                        label="Recipient Address"
                                        value={mintNFTToAddress}
                                        onChange={setMintNFTToAddress}
                                        placeholder="0x..."
                                        disabled={isMintingNFT || !wallet.isConnected}
                                    />
                                    <LabeledInput
                                        id="mint-nft-token-uri"
                                        label="Token URI (IPFS link to metadata)"
                                        value={mintNFTTokenURI}
                                        onChange={setMintNFTTokenURI}
                                        placeholder="ipfs://Qm..."
                                        disabled={isMintingNFT || !wallet.isConnected}
                                    />
                                    <button
                                        onClick={handleMintNFT}
                                        className="mt-7 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                        disabled={isMintingNFT || !wallet.isConnected || !mintNFTContractAddress || !mintNFTToAddress || !mintNFTTokenURI}
                                    >
                                        {isMintingNFT ? 'Minting NFT...' : 'Mint NFT'}
                                    </button>
                                </div>

                                <h3 className="text-xl font-semibold text-white mt-8 mb-4">Your NFT Assets</h3>
                                {nftAssets.length === 0 ? (
                                    <p className="text-gray-400">No NFT assets found for your wallet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {nftAssets.map(nft => (
                                            <Card key={nft.id} title={nft.name} className="relative group overflow-hidden">
                                                <img src={nft.imageUrl} alt={nft.name} className="w-full h-48 object-cover rounded-md mb-3" />
                                                <p className="text-sm text-gray-300 font-semibold">{nft.description.substring(0, 50)}...</p>
                                                <p className="text-xs text-gray-500 mt-1">Token ID: <span className="font-mono text-cyan-400">{nft.tokenId}</span></p>
                                                <p className="text-xs text-gray-500">Owner: <span className="font-mono text-gray-300">{nft.owner.substring(0, 8)}...</span></p>
                                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm">View Details</button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <Card title="Application Settings">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                                        <label htmlFor="developer-mode-toggle" className="text-gray-300 font-medium">Developer Mode</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                id="developer-mode-toggle"
                                                className="sr-only peer"
                                                checked={developerMode}
                                                onChange={(e) => setDeveloperMode(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-300">{developerMode ? 'Enabled' : 'Disabled'}</span>
                                        </label>
                                    </div>

                                    <LabeledInput
                                        id="gas-price-gwei"
                                        label="Default Gas Price (Gwei)"
                                        type="number"
                                        value={gasPriceGwei}
                                        onChange={setGasPriceGwei}
                                        placeholder="50"
                                        disabled={!developerMode}
                                    />

                                    <div className="p-3 bg-gray-900/50 rounded-lg">
                                        <h4 className="text-white text-md mb-2">Data Management</h4>
                                        <p className="text-sm text-gray-400 mb-3">Clear all locally stored application data, including deployed contracts and transaction history.</p>
                                        <button
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to clear all local data? This action cannot be undone.")) {
                                                    setDeployedContracts([]);
                                                    setTransactions([]);
                                                    setStakingPositions([]);
                                                    setNftAssets([]);
                                                    setContractEvents([]);
                                                    setSelectedContractId(null);
                                                    setAuditReport(null);
                                                    setAICodeAssistantOutput(null);
                                                    alert('All local data cleared!');
                                                }
                                            }}
                                            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-medium"
                                        >
                                            Clear All Local Data
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Security Auditor Modal */}
            <Modal
                isOpen={isAuditorOpen}
                onClose={() => setAuditorOpen(false)}
                title="AI Smart Contract Security Auditor"
                maxWidth="max-w-4xl"
            >
                <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="auditor-code" className="text-gray-300 text-sm font-medium">Solidity Code to Audit</label>
                        <CodeEditor
                            value={auditCode}
                            onChange={setAuditCode}
                            height="h-64"
                            placeholder="Paste your Solidity code here for AI analysis..."
                        />
                    </div>
                    <button
                        onClick={handleAudit}
                        disabled={isAuditing || !auditCode.trim()}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isAuditing ? 'Auditing...' : 'Audit Code with AI'}
                    </button>
                    <Card title="Audit Report">
                        <div className="min-h-[10rem] text-sm text-gray-300 whitespace-pre-line bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                            {isAuditing ? (
                                <p className="text-center text-cyan-400">Analyzing code for vulnerabilities and optimizations...</p>
                            ) : auditReport ? (
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-white">Summary: <span className="font-normal text-gray-300">{auditReport.summary}</span></h4>
                                    <p className="text-md font-semibold text-white">Security Score: <span className={`font-bold ${auditReport.securityScore > 80 ? 'text-green-400' : auditReport.securityScore > 60 ? 'text-yellow-400' : 'text-red-400'}`}>{auditReport.securityScore}/100</span></p>

                                    {auditReport.vulnerabilities.length > 0 && (
                                        <div>
                                            <h5 className="text-lg font-semibold text-white">Potential Vulnerabilities:</h5>
                                            <ul className="list-disc list-inside space-y-2 mt-2">
                                                {auditReport.vulnerabilities.map((vuln, index) => (
                                                    <li key={index} className="bg-gray-700/30 p-3 rounded-lg">
                                                        <p className={`font-semibold ${vuln.severity === 'Critical' ? 'text-red-400' : vuln.severity === 'High' ? 'text-orange-400' : vuln.severity === 'Medium' ? 'text-yellow-400' : 'text-white'}`}>
                                                            {vuln.type} (Severity: {vuln.severity})
                                                        </p>
                                                        <p className="text-sm text-gray-300">{vuln.description}</p>
                                                        {vuln.lineNumbers && vuln.lineNumbers.length > 0 && (
                                                            <p className="text-xs text-gray-400">Lines: {vuln.lineNumbers.join(', ')}</p>
                                                        )}
                                                        <p className="text-sm text-cyan-400 mt-1">Recommendation: {vuln.recommendation}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {auditReport.gasOptimizations.length > 0 && (
                                        <div>
                                            <h5 className="text-lg font-semibold text-white mt-4">Gas Optimizations:</h5>
                                            <ul className="list-disc list-inside space-y-1 mt-2">
                                                {auditReport.gasOptimizations.map((opt, index) => (
                                                    <li key={index} className="text-sm text-gray-300 bg-gray-700/30 p-2 rounded-lg">{opt}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-4">Report generated on: {new Date(auditReport.timestamp).toLocaleString()}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500">The audit report will appear here after analysis.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </Modal>

            {/* Deploy New Contract Modal */}
            <Modal
                isOpen={isDeploymentModalOpen}
                onClose={() => setDeploymentModalOpen(false)}
                title="Deploy New Smart Contract"
                maxWidth="max-w-4xl"
            >
                <div className="space-y-4">
                    <LabeledInput
                        id="deploy-contract-name"
                        label="Contract Name"
                        value={deployContractName}
                        onChange={setDeployContractName}
                        placeholder="MyAwesomeContract"
                    />
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="deploy-source-code" className="text-gray-300 text-sm font-medium">Solidity Source Code</label>
                        <CodeEditor
                            value={deploySourceCode}
                            onChange={setDeploySourceCode}
                            height="h-72"
                            placeholder="Paste your Solidity code here..."
                        />
                    </div>
                    <LabeledInput
                        id="deploy-constructor-args"
                        label="Constructor Arguments (JSON array)"
                        value={deployConstructorArgs}
                        onChange={setDeployConstructorArgs}
                        placeholder='e.g., ["MyToken", "MTK", 1000]'
                    />

                    {deploymentError && (
                        <p className="text-red-400 text-sm bg-red-900/30 p-3 rounded-lg border border-red-800">Deployment Error: {deploymentError}</p>
                    )}

                    <button
                        onClick={handleCompileAndDeploy}
                        disabled={isCompiling || isDeploying || !deploySourceCode.trim() || !wallet.isConnected}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isCompiling ? 'Compiling...' : isDeploying ? 'Deploying...' : 'Compile & Deploy Contract'}
                    </button>
                    {!wallet.isConnected && <p className="text-red-400 text-sm text-center">Connect your wallet to deploy contracts.</p>}

                    {compiledABI.length > 0 && (
                        <Card title="Compiled ABI (JSON)" className="max-h-64 overflow-y-auto">
                            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{JSON.stringify(compiledABI, null, 2)}</pre>
                        </Card>
                    )}
                    {compiledBytecode && (
                        <Card title="Compiled Bytecode" className="max-h-64 overflow-y-auto">
                            <pre className="text-xs text-gray-300 font-mono break-all">{compiledBytecode}</pre>
                        </Card>
                    )}
                </div>
            </Modal>

            {/* Contract Templates Browser Modal */}
            <Modal
                isOpen={isTemplateBrowserOpen}
                onClose={() => { setTemplateBrowserOpen(false); setSelectedTemplate(null); setTemplatePreviewCode(''); }}
                title="Browse Smart Contract Templates"
                maxWidth="max-w-6xl"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Available Templates</h3>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                            {CONTRACT_TEMPLATES.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => handleSelectTemplate(template)}
                                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200
                                        ${selectedTemplate?.id === template.id
                                            ? 'bg-cyan-900/40 border-cyan-500 ring-1 ring-cyan-500'
                                            : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/60'
                                        }`}
                                >
                                    <h4 className="text-lg font-semibold text-white">{template.name}</h4>
                                    <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {template.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white">Template Preview</h3>
                        {selectedTemplate ? (
                            <div className="mt-4 space-y-4">
                                <Card title={selectedTemplate.name}>
                                    <p className="text-gray-300 text-sm mb-2">{selectedTemplate.description}</p>
                                    <p className="text-gray-400 text-xs">Author: {selectedTemplate.author} | Version: {selectedTemplate.version}</p>
                                </Card>
                                <CodeEditor
                                    value={templatePreviewCode}
                                    readOnly
                                    height="h-72"
                                />
                                <button
                                    onClick={handleApplyTemplate}
                                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                                    disabled={!selectedTemplate}
                                >
                                    Use This Template for Deployment
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-500 mt-4 text-center py-10">Select a template from the list to view its code and details.</p>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default SmartContractsView;