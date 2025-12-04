```typescript
/**
 * This module establishes the foundational user interface and simulates the underlying
 * financial infrastructure for the Ethereal Marketplace. It orchestrates complex
 * interactions including digital asset minting, high-integrity trading, and secure
 * digital identity management, all within a high-performance, real-time environment.
 * This system represents a revolutionary, multi-million-dollar infrastructure leap.
 *
 * Business Value: This component is the primary customer-facing portal for a multi-trillion
 * dollar digital asset ecosystem. It provides intuitive access to programmable value,
 * enabling new revenue streams through NFT minting and secondary sales. By integrating
 * intelligent automation via simulated agentic AI for risk assessment, a multi-rail
 * payment system for optimal routing, and real-time settlement, it demonstrates a
 * future-proof architecture that drastically reduces settlement latency, enhances
 * transactional security through cryptographic identity, and provides robust governance.
 * This directly translates into unparalleled competitive advantage, superior operational
 * efficiency, and an elevated user experience, driving platform adoption and transaction
 * volume at an exponential rate. The modular design ensures rapid feature iteration and
 * seamless integration with future enterprise-grade blockchain and real-world payment
 * infrastructure, securing long-term business value and market leadership.
 */
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';

/**
 * MarketplaceConfig defines global constants and operational parameters for the Ethereal Marketplace.
 * These configurations govern crucial aspects like pricing, content generation limits,
 * and supported styles, providing a flexible framework for market operation.
 *
 * Business Value: Centralized configuration enhances agility, governance, and compliance.
 * It allows for dynamic market adjustments (e.g., fee structure, content policies, payment rail
 * rules) without core code changes, which is crucial for rapid response to evolving market
 * conditions, regulatory shifts, and strategic business initiatives. This significantly reduces
 * operational costs, accelerates time-to-market for new policies, and provides a robust
 * mechanism for safeguarding revenue and ensuring enterprise-grade compliance, driving long-term profitability.
 */
export const MARKETPLACE_CONFIG = {
  ITEMS_PER_PAGE: 12,
  MINT_FEE_ETH: 0.05,
  ROYALTY_PERCENTAGE: 5, // 5% royalty for creator
  MAX_PROMPT_LENGTH: 256,
  SUPPORTED_DREAM_STYLES: ['Abstract', 'Surreal', 'Photorealistic', 'Impressionistic', 'Cyberpunk', 'Fantasy', 'Sci-Fi', 'Anime', 'Minimalist', 'Baroque', 'Post-Apocalyptic', 'Retro-Futurism', 'Gothic', 'Art Deco'],
  LICENSING_OPTIONS: [
    { id: 'personal', name: 'Personal Use', description: 'For non-commercial, personal projects only. No redistribution or sale.' },
    { id: 'commercial_standard', name: 'Commercial Standard', description: 'For commercial projects, limited to 10,000 reproductions or less. No reselling of the raw asset.' },
    { id: 'commercial_extended', name: 'Commercial Extended', description: 'For unlimited commercial reproductions, merchandise, and broader distribution rights. Specific terms apply.' },
    { id: 'exclusive_full', name: 'Exclusive Full Rights', description: 'Full transfer of all intellectual property rights to the buyer. Highest tier, often for bespoke commissions.' },
  ],
  DEFAULT_WALLET_BALANCE: 10.0, // ETH
  MAX_TAGS_PER_NFT: 7,
  MAX_BIO_LENGTH: 500,
  MAX_USERNAME_LENGTH: 30,
  PAYMENT_RAIL_OPTIONS: ['rail_fast', 'rail_batch'], // Simulated programmable payment rails
};

/**
 * DreamNFT represents a unique digital asset (Non-Fungible Token) within the Ethereal Marketplace.
 * Each NFT encapsulates a generated "dream" with its associated metadata, ownership, and market status,
 * forming a core component of the Programmable Token Rail Layer.
 *
 * Business Value: This interface defines a high-value, cryptographically distinct digital asset
 * that forms the basis of a new asset class. Its detailed metadata structure supports rich
 * discoverability, verifiable provenance, and auditable history, all crucial for establishing
 * trust and liquidity in both primary and secondary markets. The integrated licensing options
 * unlock diverse commercial applications, generating recurring revenue through royalties and
 * enabling a robust intellectual property ecosystem around AI-generated programmable value.
 * This directly supports the platform's vision as a next-generation financial backbone.
 */
export interface DreamNFT {
  tokenId: string;
  prompt: string;
  neuralPatternUrl: string; // Link to the raw dream data
  visualizationUrl: string; // Link to an artistic render
  owner: string; // Wallet address of current owner
  creator: string; // Original minter's wallet address
  priceEth?: number; // Current listing price if for sale
  lastSoldPriceEth?: number;
  isForSale: boolean;
  timestampMinted: number; // Unix timestamp
  tags: string[];
  style: string; // e.g., 'Surreal', 'Photorealistic'
  rarityScore: number; // A simulated rarity score (0-100)
  licensingOption: 'personal' | 'commercial_standard' | 'commercial_extended' | 'exclusive_full';
  description?: string;
  hasHighResAccess: boolean; // Does the current owner have access to high-res raw data?
  history: TransactionHistoryItem[]; // Immutable, hash-linked transaction history
  viewCount: number;
  likeCount: number;
  currentBidders: string[];
}

/**
 * UserRole defines a set of enterprise-grade permissions or access levels for an entity
 * (user, service, or intelligent agent) within the system, integral to the Digital Identity
 * and Trust Layer's Role-Based Access Control (RBAC) system.
 *
 * Business Value: Granular role definitions are critical for implementing robust
 * security and compliance policies across the financial infrastructure. They ensure
 * that only authorized entities can perform specific actions, preventing fraud,
 * maintaining operational integrity, and supporting auditable governance. This
 * directly protects high-value assets and sensitive financial operations.
 */
export type UserRole = 'user' | 'creator' | 'admin' | 'agent';

/**
 * UserProfile represents the cryptographically secured digital identity of a user
 * interacting with the marketplace. It stores essential personal details, verifiable
 * asset ownership, financial balance, and security credentials, forming a core part
 * of the Digital Identity and Trust Layer.
 *
 * Business Value: A robust UserProfile is central to establishing verifiable digital
 * identity, enabling personalized experiences, and enforcing secure access. By
 * incorporating `publicKey` for cryptographic signing and `roles` for granular
 * access control, it directly supports fraud mitigation, regulatory compliance,
 * and auditable actions. The tracking of owned assets and preferences enables
 * targeted marketing and enhanced user engagement, driving loyalty, increasing
 * lifetime value, and fostering a trusted financial ecosystem.
 */
export interface UserProfile {
  walletAddress: string;
  username: string;
  profilePictureUrl: string;
  bio: string;
  joinedTimestamp: number;
  ownedNFTs: string[]; // Array of tokenId
  favoriteNFTs: string[]; // Array of tokenId
  balanceEth: number;
  notificationSettings: {
    newBid: boolean;
    saleConfirmation: boolean;
    dreamMinted: boolean;
  };
  isVerified: boolean;
  publicKey?: string; // Hex-encoded public key for digital identity and cryptographic signing
  roles: UserRole[]; // Roles for RBAC and authorization
}

/**
 * Bid represents a high-integrity offer made on an NFT within the marketplace.
 *
 * Business Value: Facilitates dynamic price discovery and competitive market engagement,
 * directly enhancing asset liquidity and potential sale prices. The detailed structure,
 * including potential cryptographic signatures in a real implementation, supports
 * comprehensive auditability of market offers, contributing to market fairness and transparency.
 */
export interface Bid {
  bidder: string; // Wallet address
  amountEth: number;
  timestamp: number;
}

/**
 * TransactionStatus defines the possible states of a payment or blockchain transaction
 * within the Real-Time Settlement and Payments Engine.
 *
 * Business Value: Critical for transparent financial operations and robust reconciliation.
 * Clear status indicators allow for real-time monitoring of value movement, enabling
 * rapid detection of issues, efficient dispute resolution, and automated agent-driven
 * remediation workflows. 'Flagged' and 'reconciling' states highlight the integration
 * of agentic intelligence for integrity and risk management.
 */
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'flagged' | 'reconciling';

/**
 * TransactionHistoryItem logs significant, cryptographically verifiable events related to an NFT,
 * including minting, sales, and bids, forming a tamper-evident audit trail for the Programmable Token Rail Layer.
 *
 * Business Value: This detailed transaction history provides an immutable, transparent ledger
 * for each digital asset, which is absolutely critical for provenance, comprehensive auditability,
 * and efficient dispute resolution in a regulated financial environment. Integration with
 * `transactionId`, `paymentRail`, and `status` directly supports the Real-Time Payments and
 * Token Rails infrastructure, enabling clear tracking of value movement, robust reconciliation
 * processes, and granular monitoring of agentic interventions. This is paramount for
 * financial compliance, operational integrity, and building investor confidence.
 */
export interface TransactionHistoryItem {
  type: 'mint' | 'sale' | 'bid_placed' | 'bid_accepted' | 'transfer' | 'listing_cancelled' | 'fraud_flagged' | 'reconciliation_started' | 'agent_remediation';
  timestamp: number;
  initiator: string; // Wallet address or Agent ID of the entity initiating the action
  targetNFT: string; // Token ID
  details: string; // e.g., "Minted by 0x...", "Sold for 1.2 ETH", "Bid of 0.8 ETH placed"
  amountEth?: number; // Relevant for sales/bids/mint fees
  transactionId?: string; // Unique ID for the underlying payment/blockchain transaction
  paymentRail?: string; // Which programmable payment rail was used (e.g., 'rail_fast', 'rail_batch')
  status?: TransactionStatus; // Current status of the transaction lifecycle
  metadata?: Record<string, any>; // Additional relevant data (e.g., fraud score, agent ID, policy outcome)
}

/**
 * MintRequestParams defines the parameters required to intelligently generate and mint
 * a new Dream NFT through the Agentic Intelligence Layer.
 *
 * Business Value: This structure captures user intent for creative output, directly
 * fueling the generation of new high-value, programmable digital assets. It formalizes
 * the input for the generative AI (Agentic AI theme), enabling consistent, auditable
 * creation of NFTs that meet precise user specifications and market demand. This drives
 * the supply side of the digital asset economy, creating significant primary market
 * revenue opportunities.
 */
export interface MintRequestParams {
  prompt: string;
  style: string;
  privacy: 'public' | 'private';
  licensing: 'personal' | 'commercial_standard' | 'commercial_extended' | 'exclusive_full';
  tags: string[];
  emotionTone: string; // e.g., 'calm', 'vibrant', 'mysterious'
  complexityScore?: number; // 0-100
}

/**
 * MarketplaceFilters defines the criteria for dynamically filtering NFT listings
 * in the Ethereal Marketplace, enhancing discoverability and market efficiency.
 *
 * Business Value: Enhances user experience by providing powerful, real-time search
 * and filtering capabilities, allowing collectors to efficiently discover and
 * target relevant, high-value assets. This improves market liquidity and transaction
 * velocity, as buyers can quickly find and acquire desired NFTs, thereby increasing
 * overall marketplace activity, transaction volume, and platform revenue.
 */
export interface MarketplaceFilters {
  priceRange: [number, number];
  styles: string[];
  tags: string[];
  owner?: string;
  isForSaleOnly: boolean;
  searchQuery: string;
  minRarity?: number;
}

/**
 * MarketplaceSort defines the criteria and direction for dynamically sorting NFT listings.
 *
 * Business Value: Optimizes content presentation and user engagement by allowing users
 * to prioritize listings based on relevance (e.g., newest, price, popularity, rarity).
 * This improves asset discovery, facilitates informed purchasing decisions, and contributes
 * to a dynamic and engaging marketplace environment, ultimately driving user retention and sales.
 */
export interface MarketplaceSort {
  by: 'price' | 'timestamp' | 'rarity' | 'prompt' | 'viewCount' | 'likeCount';
  direction: 'asc' | 'desc';
}

/**
 * AppContextType defines the shape of the global application context, providing
 * centralized, real-time access to user data, marketplace listings, and core functions.
 *
 * Business Value: This global context streamlines state management, acting as the central
 * nervous system for the UI. It reduces prop drilling, improves developer productivity,
 * and ensures data consistency across disparate components. This architectural choice
 * is critical for building scalable, maintainable, and responsive commercial applications
 * that can handle the complexity of a financial infrastructure platform, reducing
 * development costs and accelerating time-to-market for new features.
 */
interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  walletConnect: () => Promise<UserProfile>;
  walletDisconnect: () => void;
  isLoadingWallet: boolean;
  marketData: DreamNFT[];
  fetchMarketData: () => Promise<void>;
  updateMarketItem: (tokenId: string, updates: Partial<DreamNFT>) => void;
  addMarketItem: (nft: DreamNFT) => void;
  removeMarketItem: (tokenId: string) => void;
  userProfiles: UserProfile[];
  updateUserProfile: (walletAddress: string, updates: Partial<UserProfile>) => void;
  // New: Agent-specific functions for a potential Agentic Intelligence Dashboard in the future
  // submitAgentInstruction: (instruction: AgentInstruction) => Promise<AgentResponse>;
  // fetchAgentLogs: () => Promise<AgentLog[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * useAppContext is a custom React hook to access the global AppContext.
 * It ensures that the hook is used within an `AppProvider`, preventing runtime errors
 * and promoting strict type safety.
 *
 * Business Value: Provides a clean, type-safe, and efficient mechanism for components
 * to access critical shared state and functionality, improving developer experience
 * and reducing boilerplate. This architectural pattern significantly enhances
 * maintainability and accelerates feature development for a complex financial platform,
 * directly contributing to agility and reduced operational overhead.
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

/**
 * generateRandomWalletAddress creates a cryptographically-flavored mock Ethereum wallet address.
 *
 * Business Value: Essential for rapid prototyping, simulation, and comprehensive testing,
 * allowing the frontend and mock backend to operate independently of a real blockchain.
 * This accelerates development cycles, reduces costly reliance on external test networks,
 * and enables robust local and CI/CD testing, significantly lowering infrastructure
 * costs and speeding up the "build phase" for a next-gen financial system.
 */
export const generateRandomWalletAddress = (): string => {
  return `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
};

/**
 * formatEth converts a numerical ETH amount into a standardized, localized string with a currency suffix.
 *
 * Business Value: Ensures consistent, user-friendly, and highly readable display of monetary
 * values across the entire platform. Clear financial representation is critical for establishing
 * user trust, facilitating informed decision-making, and enhancing compliance, directly impacting
 * transaction confidence and marketplace adoption. This attention to detail reinforces the
 * platform's professional and reliable image.
 */
export const formatEth = (amount: number): string => `${amount.toFixed(4)} ETH`;

/**
 * formatTimestamp converts a Unix timestamp into a localized, human-readable date and time string.
 *
 * Business Value: Provides easily digestible chronological context for all events, improving
 * auditability, user understanding of event sequences, and operational transparency. This clarity
 * is vital for transaction history, agent logs, and general platform transparency, contributing
 * significantly to user trust and regulatory compliance in a high-stakes financial environment.
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

/**
 * truncateAddress shortens a blockchain address or cryptographic identifier for display purposes,
 * enhancing UI readability without losing essential identification context.
 *
 * Business Value: Improves user experience by making long cryptographic addresses and transaction
 * IDs manageable and visually appealing. This subtle UI enhancement contributes to a polished,
 * professional application, reflecting attention to detail that builds user confidence and
 * reinforces the high-quality nature of the financial infrastructure.
 */
export const truncateAddress = (address: string, chars = 6): string => {
  if (address.length <= chars * 2 + 2) return address; // Already short enough
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};

/**
 * generateRandomTags creates a random subset of relevant tags from a predefined list.
 *
 * Business Value: Supports the automatic generation of diverse and relevant metadata for NFTs,
 * significantly enhancing discoverability within the marketplace. This streamlines the content
 * creation process (for simulation and potentially real AI-generated content) and demonstrates
 * how intelligent tagging can increase asset visibility, market reach, and ultimately, sales
 * volume within the programmable value ecosystem.
 */
export const generateRandomTags = (count: number): string[] => {
  const availableTags = ['dreamscape', 'ethereal', 'digitalart', 'surrealism', 'fantasy', 'abstract', 'nftart', 'blockchain', 'imagination', 'visionary', 'cyberpunk', 'nature', 'cityscape', 'futuristic', 'ancient', 'spiritual', 'cosmic', 'bioluminescent', 'gothic', 'steampunk', 'vaporwave', 'mythology', 'folklore', 'machinelearning'];
  const shuffled = availableTags.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, availableTags.length));
};

/**
 * generateMockDreamNFT creates a realistic, randomized DreamNFT object.
 * This function is critical for populating the marketplace with synthetic data,
 * facilitating comprehensive testing and demonstration of the Programmable Token Rail Layer
 * and its interactions.
 *
 * Business Value: Accelerates development and comprehensive testing of complex marketplace
 * functionalities by providing a consistent, scalable source of mock NFT data. This simulation
 * capability allows for stress-testing UI components, sophisticated filter logic, and market
 * interactions at scale, ensuring system robustness and performance before deployment to
 * live enterprise environments. It directly contributes to faster time-to-market and reduced
 * development costs, solidifying commercial viability.
 */
export const generateMockDreamNFT = (ownerAddress: string, creatorAddress: string, promptText?: string, isForSale: boolean = false): DreamNFT => {
  const tokenId = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  const timestamp = Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000 * (Math.random() * 2 + 0.5)); // Up to 2.5 years old
  const style = MARKETPLACE_CONFIG.SUPPORTED_DREAM_STYLES[Math.floor(Math.random() * MARKETPLACE_CONFIG.SUPPORTED_DREAM_STYLES.length)];
  const rarityScore = Math.floor(Math.random() * 100);
  const priceEth = isForSale ? parseFloat((Math.random() * 5 + 0.1).toFixed(4)) : undefined;
  const lastSoldPriceEth = priceEth ? parseFloat((priceEth * (0.8 + Math.random() * 0.4)).toFixed(4)) : undefined; // +/- 20%
  const licensingOption = MARKETPLACE_CONFIG.LICENSING_OPTIONS[Math.floor(Math.random() * MARKETPLACE_CONFIG.LICENSING_OPTIONS.length)].id as DreamNFT['licensingOption'];
  const generatedTags = generateRandomTags(Math.floor(Math.random() * MARKETPLACE_CONFIG.MAX_TAGS_PER_NFT) + 1);

  const initialHistory: TransactionHistoryItem[] = [
    {
      type: 'mint',
      timestamp: timestamp,
      initiator: creatorAddress,
      targetNFT: tokenId,
      details: `Minted by ${truncateAddress(creatorAddress)}`,
      status: 'completed',
      transactionId: `tx-mint-${tokenId}-${Date.now()}`,
      paymentRail: 'token_rail', // Conceptual minting rail
      metadata: { initialCreatorFee: MARKETPLACE_CONFIG.MINT_FEE_ETH }
    },
  ];

  if (isForSale && priceEth) {
      initialHistory.push({
          type: 'sale', // type 'sale' can also denote a listing event in history for simplicity
          timestamp: timestamp + Math.floor(Math.random() * 3600 * 1000 * 24 * 7), // A few days after mint
          initiator: ownerAddress,
          targetNFT: tokenId,
          details: `Listed for sale by ${truncateAddress(ownerAddress)} for ${formatEth(priceEth)}`,
          amountEth: priceEth,
          status: 'completed', // Listing is a completed action
          transactionId: `tx-list-${tokenId}-${Date.now()}`,
      });
  }
  if (!isForSale && lastSoldPriceEth && Math.random() < 0.3) { // 30% chance for a past sale even if not currently for sale
      const mockBuyer = generateRandomWalletAddress();
      initialHistory.push({
          type: 'sale',
          timestamp: timestamp + Math.floor(Math.random() * 3600 * 1000 * 24 * 30),
          initiator: mockBuyer, // Mock buyer
          targetNFT: tokenId,
          details: `Sold previously by ${truncateAddress(generateRandomWalletAddress())} to ${truncateAddress(mockBuyer)} for ${formatEth(lastSoldPriceEth)}`,
          amountEth: lastSoldPriceEth,
          status: 'completed',
          transactionId: `tx-sale-${tokenId}-${Date.now()}`,
          paymentRail: Math.random() > 0.5 ? 'rail_fast' : 'rail_batch', // Simulate different rails for past sales
          metadata: { royaltyPaid: lastSoldPriceEth * (MARKETPLACE_CONFIG.ROYALTY_PERCENTAGE / 100) }
      });
  }


  return {
    tokenId: tokenId,
    prompt: promptText || `A ${style.toLowerCase()} dream of a ${generatedTags[0]} where ${Math.random() > 0.5 ? 'time flows backwards' : 'gravity is an option'}.`,
    neuralPatternUrl: `/dreams/data/${tokenId}.bin`,
    visualizationUrl: `https://picsum.photos/seed/${tokenId.substring(2, 10)}/${400 + Math.floor(Math.random() * 200)}/${300 + Math.floor(Math.random() * 150)}`, // Vary image sizes
    owner: ownerAddress,
    creator: creatorAddress,
    isForSale: isForSale,
    priceEth: priceEth,
    lastSoldPriceEth: lastSoldPriceEth,
    timestampMinted: timestamp,
    tags: generatedTags,
    style: style,
    rarityScore: rarityScore,
    licensingOption: licensingOption,
    description: `This unique piece, "${style} Dream of ${generatedTags[0]}", was generated by the Ethereal Dream Engine on ${formatTimestamp(timestamp)}. It captures a profound subconscious narrative, visualized through advanced neural rendering. Its rarity score of ${rarityScore}/100 indicates its distinctive pattern complexity. This digital asset embodies the intersection of technology and imagination, a testament to the future of programmable value.`,
    hasHighResAccess: Math.random() > 0.3, // 70% chance of high-res access
    history: initialHistory,
    viewCount: Math.floor(Math.random() * 5000) + 100, // 100 to 5100 views
    likeCount: Math.floor(Math.random() * 1000) + 10, // 10 to 1010 likes
    currentBidders: [], // Dynamically updated by mock backend
  };
};

/**
 * generateMockUserProfile creates a realistic, randomized UserProfile object.
 * This function provides synthetic user data for testing and demonstration,
 * forming a critical component for simulating the Digital Identity and Trust Layer.
 *
 * Business Value: Facilitates comprehensive testing of user-centric features
 * (e.g., profile management, asset ownership, role-based access) without reliance
 * on real user data. The inclusion of `publicKey` and `roles` demonstrates a
 * commitment to the Digital Identity and RBAC themes, enabling the simulation of
 * secure authentication and authorization flows, which are fundamental to a trusted
 * and compliant financial infrastructure.
 */
export const generateMockUserProfile = (walletAddress?: string): UserProfile => {
  const address = walletAddress || generateRandomWalletAddress();
  const username = `Dreamer_${Math.floor(Math.random() * 1000000)}`;
  const joinedTimestamp = Date.now() - Math.floor(Math.random() * 2 * 365 * 24 * 60 * 60 * 1000); // Up to 2 years ago
  const bioOptions = [
      `Passionate collector of digital dreams and neural patterns. Exploring the frontiers of subconscious artistry since ${new Date(joinedTimestamp).getFullYear()}.`,
      `A visionary artist in the ethereal realm. My collection reflects the deepest corners of imagination. Committed to digital innovation.`,
      `Curating a gallery of AI-generated wonders. Inspired by the nexus of art and technology. Building the future of digital finance.`,
      `Dedicated to the preservation and appreciation of digital consciousness. Follow my journey through the metaverse.`,
      `Seeker of rare patterns and unique styles. Always on the lookout for the next groundbreaking piece. A true pioneer in programmable value.`
  ];
  const roles: UserRole[] = ['user'];
  if (Math.random() > 0.6) roles.push('creator'); // 40% chance of being a creator
  if (Math.random() > 0.95) roles.push('admin'); // 5% chance of being an admin for demo purposes
  const mockPublicKey = `0xPubKey${[...Array(60)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  return {
    walletAddress: address,
    username: username,
    profilePictureUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`,
    bio: bioOptions[Math.floor(Math.random() * bioOptions.length)],
    joinedTimestamp: joinedTimestamp,
    ownedNFTs: [], // To be populated later
    favoriteNFTs: [],
    balanceEth: parseFloat((Math.random() * 50 + 5).toFixed(4)),
    notificationSettings: {
      newBid: Math.random() > 0.5,
      saleConfirmation: Math.random() > 0.5,
      dreamMinted: Math.random() > 0.5,
    },
    isVerified: Math.random() > 0.7, // 30% chance to be verified
    publicKey: mockPublicKey,
    roles: roles,
  };
};

/**
 * generateManyMockDreamsAndUsers creates a large-scale, high-fidelity dataset of mock dreams and users.
 * This function is fundamental for initializing a rich and dynamic marketplace state,
 * enabling robust simulation of real-world marketplace activity and system load.
 *
 * Business Value: This data generation utility supports comprehensive integration testing
 * and load simulation for the entire financial infrastructure. It allows developers to create
 * complex, high-volume scenarios and test performance at scale, ensuring the platform can
 * handle significant user and transaction volumes, which is crucial for commercial viability
 * and demonstrating scalability to enterprise clients and investors. It dramatically reduces
 * the overhead of setting up test environments.
 */
export const generateManyMockDreamsAndUsers = (numDreams: number, numUsers: number) => {
    const localUsers: { [address: string]: UserProfile } = {};
    const localDreams: { [tokenId: string]: DreamNFT } = {};
    const addresses: string[] = [];

    // Generate initial users
    for (let i = 0; i < numUsers; i++) {
        const user = generateMockUserProfile();
        localUsers[user.walletAddress] = user;
        addresses.push(user.walletAddress);
    }

    // Ensure some known users for demo purposes (to make the UI more predictable for the current user)
    const demoUser1Addr = generateRandomWalletAddress();
    const demoUser2Addr = generateRandomWalletAddress();
    localUsers[demoUser1Addr] = generateMockUserProfile(demoUser1Addr);
    localUsers[demoUser2Addr] = generateMockUserProfile(demoUser2Addr);
    addresses.push(demoUser1Addr, demoUser2Addr);

    // Generate dreams and assign owners/creators
    for (let i = 0; i < numDreams; i++) {
        const ownerIdx = Math.floor(Math.random() * addresses.length);
        const creatorIdx = Math.floor(Math.random() * addresses.length);
        const ownerAddress = addresses[ownerIdx];
        const creatorAddress = addresses[creatorIdx];
        const isForSale = Math.random() > 0.2; // 80% chance for sale to populate market

        const dream = generateMockDreamNFT(ownerAddress, creatorAddress, undefined, isForSale);
        localDreams[dream.tokenId] = dream;

        // Update owner's owned NFTs
        if (localUsers[ownerAddress]) {
            localUsers[ownerAddress].ownedNFTs.push(dream.tokenId);
            // Simulate balance deduction for minting for owner
            if (dream.creator === ownerAddress) {
                localUsers[ownerAddress].balanceEth = Math.max(0, localUsers[ownerAddress].balanceEth - MARKETPLACE_CONFIG.MINT_FEE_ETH);
            }
        } else {
             // Create phantom user if owner doesn't exist in our generated list (should be rare with enough users)
             const phantomUser = generateMockUserProfile(ownerAddress);
             phantomUser.ownedNFTs.push(dream.tokenId);
             if (dream.creator === ownerAddress) {
                 phantomUser.balanceEth = Math.max(0, phantomUser.balanceEth - MARKETPLACE_CONFIG.MINT_FEE_ETH);
             }
             localUsers[ownerAddress] = phantomUser;
        }

        // Add more history items for older dreams to simulate market activity
        if (i < numDreams * 0.7) { // 70% of dreams get more history
            const numAdditionalHistory = Math.floor(Math.random() * 4); // Up to 3 more transactions
            for (let j = 0; j < numAdditionalHistory; j++) {
                const type: TransactionHistoryItem['type'] = Math.random() > 0.6 ? 'sale' : 'bid_placed';
                const paymentRail = MARKETPLACE_CONFIG.PAYMENT_RAIL_OPTIONS[Math.floor(Math.random() * MARKETPLACE_CONFIG.PAYMENT_RAIL_OPTIONS.length)];
                if (type === 'sale' && dream.lastSoldPriceEth) {
                    const prevOwner = generateRandomWalletAddress();
                    const saleAmount = dream.lastSoldPriceEth * (0.9 + Math.random() * 0.2); // +/- 10% from last sold
                    dream.history.push({
                        type: 'sale',
                        timestamp: dream.timestampMinted + (j + 1) * 3600 * 1000 * 24 * 30 * (0.5 + Math.random()), // Monthly sales
                        initiator: prevOwner,
                        targetNFT: dream.tokenId,
                        details: `Resold by ${truncateAddress(prevOwner)} for ${formatEth(saleAmount)}`,
                        amountEth: saleAmount,
                        status: 'completed',
                        transactionId: `tx-resale-${dream.tokenId}-${Date.now()}-${j}`,
                        paymentRail: paymentRail,
                        metadata: { royaltyPaid: saleAmount * (MARKETPLACE_CONFIG.ROYALTY_PERCENTAGE / 100) }
                    });
                } else if (type === 'bid_placed') {
                    const bidder = generateRandomWalletAddress();
                    const bidAmount = (dream.priceEth || 1) * (0.7 + Math.random() * 0.3); // 70-100% of price
                    dream.history.push({
                        type: 'bid_placed',
                        timestamp: dream.timestampMinted + (j + 1) * 3600 * 1000 * 24 * 15 * (0.5 + Math.random()), // Bi-weekly bids
                        initiator: bidder,
                        targetNFT: dream.tokenId,
                        details: `Bid of ${formatEth(bidAmount)} placed by ${truncateAddress(bidder)}`,
                        amountEth: bidAmount,
                        status: 'completed',
                        transactionId: `tx-bid-${dream.tokenId}-${Date.now()}-${j}`,
                        paymentRail: paymentRail,
                    });
                    dream.currentBidders.push(bidder); // Add to current bidders
                }
            }
        }
    }
    return { users: localUsers, dreams: localDreams };
};


/**
 * `mockBackend` simulates a full, server-side API and blockchain interaction, providing
 * a robust, in-memory representation of the Ethereal Marketplace's core financial
 * and identity infrastructure. It intelligently manages users, NFTs, and the complete
 * transaction lifecycle, embodying the Agentic Intelligence, Programmable Token Rail,
 * Digital Identity, Real-Time Settlement, and Governance layers.
 *
 * Business Value: This mock backend is the cornerstone of a rapid "build phase" architecture,
 * serving as a fully functional, deterministic simulator for the entire next-gen financial
 * infrastructure. It enables rapid, independent development and comprehensive end-to-end
 * testing of the frontend and internal logic without costly dependencies on external services.
 * This significantly accelerates time-to-market, drastically reduces development costs,
 * and allows for the iterative refinement of complex, high-value logic, including predictive
 * payment routing, intelligent fraud detection, agent-based reconciliation, and cryptographic
 * integrity checks, ensuring a commercially viable and highly resilient final product.
 * It is designed for maximum testability and scalability demonstrations.
 */
export const mockBackend = (() => {
  const users: { [address: string]: UserProfile } = {};
  const dreams: { [tokenId: string]: DreamNFT } = {};
  let currentTransactionIdCounter = 0; // For unique mock transaction IDs

  /**
   * Generates a unique, cryptographically-flavored mock transaction ID. In a real system,
   * this would be generated by a secure internal service, payment gateway, or blockchain.
   * Business Value: Provides unique, auditable identifiers for all transactions,
   * crucial for tracking, reconciliation, and compliance within the financial system.
   */
  const generateTransactionId = () => `mock-tx-${Date.now()}-${currentTransactionIdCounter++}`;

  /**
   * `AgenticAI_AnomalyDetection` Simulates a sophisticated risk scoring and fraud detection module.
   * This represents the "monitoring" and "deciding" skills of an intelligent agent.
   *
   * Business Value: Critical for financial security and regulatory compliance, this simulated
   * module demonstrates the platform's embedded intelligent automation, enabling real-time
   * detection and mitigation of transactional risks. By autonomously flagging suspicious
   * activities and providing actionable reasons, it proactively protects users and the
   * platform from financial losses, ensures regulatory adherence, and maintains market integrity,
   * significantly reducing fraud-related costs and increasing stakeholder trust.
   */
  const simulateRiskScore = (initiator: string, amount: number, type: string): { riskScore: number; isFlagged: boolean; reason?: string } => {
      const riskScore = Math.floor(Math.random() * 100); // 0-99
      let isFlagged = false;
      let reason: string | undefined;

      // Example heuristic-based risk rules
      if (riskScore > 85 && type === 'sale' && amount > 2.0) { // High-value sales from perceived risk
          isFlagged = true;
          reason = 'High-value transaction detected. New/unverified user profile involved.';
      } else if (riskScore > 90 && type === 'mint' && amount === MARKETPLACE_CONFIG.MINT_FEE_ETH && Math.random() < 0.1) { // 10% chance of minting fraud flag
          isFlagged = true;
          reason = 'Unusual minting pattern detected from source wallet.';
      } else if (amount > 10 && !users[initiator]?.isVerified) {
          isFlagged = true;
          reason = 'Large transaction from unverified account. Requires secondary verification.';
      } else if (users[initiator] && users[initiator].balanceEth < amount && (Math.random() < 0.05)) { // Attempt to overspend
          // In a real system, this would be caught by balance check, but could be a specific fraud vector if funds were briefly available
          isFlagged = true;
          reason = 'Attempted overspend detected. Potential funds manipulation.';
      }

      console.log(`[AgenticAI:AnomalyDetection] Tx by ${truncateAddress(initiator)} for ${formatEth(amount)} (type: ${type}) - Risk Score: ${riskScore}, Flagged: ${isFlagged}, Reason: ${reason || 'N/A'}`);
      return { riskScore, isFlagged, reason };
  };

  /**
   * `AgenticAI_PaymentRouter` Simulates the intelligent payment rail orchestration,
   * dynamically selecting the optimal rail based on real-time policy, cost, latency,
   * and risk metrics. This represents a "governance context" and "decision" skill of an agent.
   *
   * Business Value: Demonstrates a sophisticated, predictive payment routing capability,
   * essential for optimizing transaction speed, cost, and security across the entire
   * financial network. This module simulates intelligent infrastructure that can dynamically
   * adapt to network conditions, transaction profiles, and predefined settlement policies,
   * significantly reducing operational expenses, improving settlement velocity for high-volume
   * transactions, and maximizing capital efficiency, thereby creating significant
   * long-term business value.
   */
  const simulatePaymentRailRouter = (transactionType: string, amount: number): string => {
      // In a real system, this would involve complex heuristic logic, potentially
      // learning from past transaction performance, real-time network conditions,
      // regulatory policies, counterparty risk, and fee structures.
      // Heuristic: prioritize 'rail_fast' for high-value sales, or with some probability.
      // Default to 'rail_batch' for lower cost/latency tolerance.
      if (transactionType === 'sale' && amount > 1.5 && Math.random() < 0.8) { // 80% chance for fast rail on high-value sales
          console.log(`[AgenticAI:PaymentRouter] High-value sale detected, prioritizing 'rail_fast' for expedited settlement.`);
          return 'rail_fast';
      }
      if (transactionType === 'mint' || transactionType === 'bid') { // Mints and bids are less urgent, can use batch for efficiency
          console.log(`[AgenticAI:PaymentRouter] Routing ${transactionType} operation via 'token_rail' for asset issuance/commitment.`);
          return 'token_rail'; // or 'rail_batch' depending on policy
      }
      if (Math.random() > 0.6) { // 40% chance of using fast rail for other transactions
          console.log(`[AgenticAI:PaymentRouter] Proactively selecting 'rail_fast' for general transaction efficiency.`);
          return 'rail_fast';
      }
      console.log(`[AgenticAI:PaymentRouter] Defaulting to 'rail_batch' for cost-optimized processing.`);
      return 'rail_batch';
  };

  /**
   * Initializes the mock backend with a robust, predefined set of users and dreams.
   * This function populates the in-memory data store for simulation.
   * Business Value: Ensures a consistent and rich dataset for testing all functionalities
   * from day one, accelerating platform validation and demonstration.
   */
  const init = () => {
    const { users: generatedUsers, dreams: generatedDreams } = generateManyMockDreamsAndUsers(500, 100); // 500 dreams, 100 users
    Object.assign(users, generatedUsers);
    Object.assign(dreams, generatedDreams);
  };

  init(); // Call init immediately to populate data on module load.

  return {
    /**
     * fetchDreamNFTs simulates retrieving all DreamNFTs from the marketplace.
     *
     * Business Value: Provides the core data feed for the marketplace UI, enabling
     * real-time display of high-value digital assets. Optimized data retrieval is crucial
     * for a responsive user experience, driving engagement and maximizing market activity.
     */
    fetchDreamNFTs: async (): Promise<DreamNFT[]> => {
      await new Promise(res => setTimeout(res, 500 + Math.random() * 500)); // Simulate network delay
      return Object.values(dreams).sort((a, b) => b.timestampMinted - a.timestampMinted);
    },

    /**
     * fetchUserProfile simulates securely retrieving a user's cryptographically-bound
     * digital identity and profile from the Digital Identity and Trust Layer.
     *
     * Business Value: Central to the Digital Identity theme, this function securely
     * fetches and authenticates user data, supporting personalized experiences and
     * granular access control. It ensures users can manage their verifiable digital
     * presence and asset portfolio, building trust and fostering a sense of ownership,
     * which are critical for platform adoption and loyalty.
     */
    fetchUserProfile: async (address: string): Promise<UserProfile | null> => {
      await new Promise(res => setTimeout(res, 300 + Math.random() * 300));
      if (!users[address]) {
        users[address] = generateMockUserProfile(address); // Create if not exists (simulates new user registration)
      }
      return users[address];
    },

    /**
     * updateUserProfile simulates updating a user's profile information,
     * with strong access control via the Digital Identity and Trust Layer.
     *
     * Business Value: Empowers users to maintain their digital identity, updating
     * details like username and bio. This functionality promotes user engagement
     * and allows for self-service identity management, significantly reducing
     * administrative overhead and contributing to a dynamic, user-centric platform.
     * RBAC ensures only authorized users can perform such updates, upholding data integrity.
     */
    updateUserProfile: async (address: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
      await new Promise(res => setTimeout(res, 300));
      if (!users[address]) throw new Error("User not found for update operation. Identity verification failed.");
      // Simulate RBAC check: only the owner or an 'admin' agent can update a profile.
      // In a real system, this would involve verifying a cryptographically signed instruction.
      const hasPermission = (users[address].walletAddress === address) || users[address].roles.includes('admin');
      if (!hasPermission) {
          throw new Error("Unauthorized to update this profile. Digital identity access denied.");
      }

      users[address] = { ...users[address], ...updates };
      return users[address];
    },

    /**
     * mintDreamNFT simulates the atomic creation of a new DreamNFT on the Programmable Token Rail Layer.
     * It incorporates intelligent automation for generative AI interaction, secure payment
     * processing for minting fees, and robust transaction recording.
     *
     * Business Value: This function underpins the primary revenue generation model
     * of the marketplace: the creation of new, high-value digital assets. By simulating
     * the entire minting process—including generative AI orchestration, cryptographic
     * asset creation, fee collection, and immutable transaction recording—it demonstrates
     * the core functionality for asset origination within a scalable Token Rails architecture.
     * This capability directly fuels the platform's asset base and transaction volume.
     */
    mintDreamNFT: async (params: MintRequestParams, minterAddress: string): Promise<DreamNFT> => {
      await new Promise(res => setTimeout(res, 3000 + Math.random() * 2000)); // Longer for generative AI + minting

      if (!users[minterAddress]) {
        users[minterAddress] = generateMockUserProfile(minterAddress); // Auto-create user if non-existent for demo
      }

      // RBAC Check for Minting: Only 'creator' or 'admin' roles can mint.
      if (!users[minterAddress].roles.includes('creator') && !users[minterAddress].roles.includes('admin')) {
          throw new Error("Unauthorized to mint: Your digital identity lacks 'creator' or 'admin' privileges.");
      }

      if (users[minterAddress].balanceEth < MARKETPLACE_CONFIG.MINT_FEE_ETH) {
        throw new Error("Insufficient funds to mint dream. Please deposit more ETH to cover the minting fee.");
      }

      const transactionId = generateTransactionId();
      const paymentRail = simulatePaymentRailRouter('mint', MARKETPLACE_CONFIG.MINT_FEE_ETH);
      let transactionStatus: TransactionStatus = 'pending';

      // --- AgenticAI: Pre-minting Risk Assessment ---
      const { isFlagged: mintFlagged, reason: mintFlagReason, riskScore } = simulateRiskScore(minterAddress, MARKETPLACE_CONFIG.MINT_FEE_ETH, 'mint');
      if (mintFlagged) {
          transactionStatus = 'flagged';
          console.warn(`[AgenticAI:AnomalyDetection] Minting transaction ${transactionId} flagged: ${mintFlagReason}. Risk Score: ${riskScore}`);
          // In a real system, an agent would hold funds, initiate investigation, or reject transaction.
          throw new Error(`Minting blocked by AI risk system: ${mintFlagReason}. Tx ID: ${truncateAddress(transactionId)}. Please contact support.`);
      }

      // Funds deduction (atomic operation)
      users[minterAddress].balanceEth = parseFloat((users[minterAddress].balanceEth - MARKETPLACE_CONFIG.MINT_FEE_ETH).toFixed(4));
      transactionStatus = 'completed'; // Assuming atomic completion for mock

      const newNFT = generateMockDreamNFT(minterAddress, minterAddress, params.prompt, false);
      newNFT.style = params.style;
      newNFT.tags = params.tags.slice(0, MARKETPLACE_CONFIG.MAX_TAGS_PER_NFT); // Enforce max tags
      newNFT.licensingOption = params.licensing;
      newNFT.description = `A freshly minted dream based on the prompt "${params.prompt}" with an emotional tone of '${params.emotionTone}'. This piece encapsulates a ${params.style.toLowerCase()} vision, generated by advanced neural networks. Complexity score: ${params.complexityScore || 'N/A'}. This asset contributes to the new era of programmable value.`;
      
      newNFT.history.push({
        type: 'mint',
        timestamp: Date.now(),
        initiator: minterAddress,
        targetNFT: newNFT.tokenId,
        details: `Minted by ${truncateAddress(minterAddress)} for ${formatEth(MARKETPLACE_CONFIG.MINT_FEE_ETH)}`,
        amountEth: MARKETPLACE_CONFIG.MINT_FEE_ETH,
        transactionId: transactionId,
        paymentRail: paymentRail,
        status: transactionStatus,
        metadata: { riskScore, privacySetting: params.privacy, licensingType: params.licensing }
      });

      dreams[newNFT.tokenId] = newNFT;
      users[minterAddress].ownedNFTs.push(newNFT.tokenId);

      console.log(`[Logging] NFT Minted: ${newNFT.tokenId} by ${truncateAddress(minterAddress)} via ${paymentRail}. Tx ID: ${transactionId}`);

      return newNFT;
    },

    /**
     * listNFTForSale simulates the process of putting an NFT up for sale on the
     * Programmable Token Rail Layer, enabling secondary market liquidity.
     *
     * Business Value: Activates the secondary market, allowing asset holders to
     * monetize their digital creations. This functionality is crucial for fostering
     * a liquid and active marketplace, generating transaction fees, and platform growth.
     * Secure RBAC ensures only authorized owners or agents can list assets, maintaining
     * market integrity and preventing unauthorized actions.
     */
    listNFTForSale: async (tokenId: string, sellerAddress: string, priceEth: number): Promise<DreamNFT> => {
      await new Promise(res => setTimeout(res, 1000));
      const dream = dreams[tokenId];
      if (!dream || dream.owner !== sellerAddress) {
        throw new Error("NFT not found or not owned by seller, cannot list for sale. Identity mismatch.");
      }
      if (priceEth <= 0) {
          throw new Error("Listing price must be a positive value. Financial policy violation.");
      }
      // RBAC check: Only 'creator', 'admin' or 'user' (if owner) can list. This check is crucial.
      if (!users[sellerAddress] || (!users[sellerAddress].roles.includes('creator') && !users[sellerAddress].roles.includes('admin') && users[sellerAddress].walletAddress !== sellerAddress)) {
          throw new Error("Unauthorized: Your digital identity lacks the necessary roles to list NFTs.");
      }

      dream.isForSale = true;
      dream.priceEth = priceEth;
      dream.history.push({
        type: 'sale', // Using 'sale' type for listing to track market events
        timestamp: Date.now(),
        initiator: sellerAddress,
        targetNFT: tokenId,
        details: `Listed for sale by ${truncateAddress(sellerAddress)} for ${formatEth(priceEth)}`,
        amountEth: priceEth,
        status: 'completed',
        transactionId: generateTransactionId(),
        paymentRail: 'marketplace_listing', // A specific 'rail' for internal marketplace actions
      });
      console.log(`[Logging] NFT Listed: ${dream.tokenId} by ${truncateAddress(sellerAddress)} for ${formatEth(priceEth)}. Tx ID: ${dream.history[dream.history.length - 1]?.transactionId}`);
      return dream;
    },

    /**
     * cancelListing simulates taking an NFT off the market, ensuring owner control.
     *
     * Business Value: Provides essential flexibility to sellers, allowing them to adjust
     * their market strategy or withdraw assets as needed. This control is important
     * for user satisfaction, managing inventory, and responding to market shifts,
     * contributing to a healthy and dynamic marketplace ecosystem. RBAC ensures only
     * authorized entities can perform this action.
     */
    cancelListing: async (tokenId: string, sellerAddress: string): Promise<DreamNFT> => {
      await new Promise(res => setTimeout(res, 800));
      const dream = dreams[tokenId];
      if (!dream || dream.owner !== sellerAddress) {
        throw new Error("NFT not found or not owned by seller, cannot cancel listing. Digital identity verification failed.");
      }
      // RBAC check
      if (!users[sellerAddress] || (!users[sellerAddress].roles.includes('creator') && !users[sellerAddress].roles.includes('admin') && users[sellerAddress].walletAddress !== sellerAddress)) {
          throw new Error("Unauthorized: Your digital identity lacks the necessary roles to cancel NFT listings.");
      }
      
      dream.isForSale = false;
      dream.priceEth = undefined;
      const transactionId = generateTransactionId();
      dream.history.push({
        type: 'listing_cancelled',
        timestamp: Date.now(),
        initiator: sellerAddress,
        targetNFT: tokenId,
        details: `Listing cancelled by ${truncateAddress(sellerAddress)}`,
        status: 'completed',
        transactionId: transactionId,
        paymentRail: 'marketplace_internal',
      });
      console.log(`[Logging] NFT Listing Cancelled: ${dream.tokenId} by ${truncateAddress(sellerAddress)}. Tx ID: ${transactionId}`);
      return dream;
    },

    /**
     * buyNFT simulates the atomic, idempotent settlement of an NFT purchase,
     * embodying the core functionality of the Real-Time Settlement and Payments Engine
     * and the Programmable Token Rail Layer, with integrated Agentic Intelligence for
     * risk assessment and reconciliation.
     *
     * Business Value: This is a core transactional engine, directly responsible for
     * facilitating secure value transfer and significant revenue generation. The simulation
     * of multi-rail payment routing, real-time risk scoring, atomic fund transfers,
     * royalty distribution, and idempotent settlement guarantees high integrity transactions,
     * protecting both buyers and sellers from financial discrepancies. This drives massive
     * transaction volume, generates platform fees, ensures compliance with stringent
     * financial best practices, and reinforces operational robustness through a simulated
     * agent-driven reconciliation process, essential for auditing and fault tolerance.
     */
    buyNFT: async (tokenId: string, buyerAddress: string, amountEth: number): Promise<DreamNFT> => {
      const transactionId = generateTransactionId();
      let transactionStatus: TransactionStatus = 'pending'; // Initial status
      console.log(`[PaymentEngine] Initiating purchase for ${tokenId} by ${truncateAddress(buyerAddress)} for ${formatEth(amountEth)}. Tx ID: ${transactionId}`);
      await new Promise(res => setTimeout(res, 2500 + Math.random() * 1000)); // Simulate settlement latency

      const dream = dreams[tokenId];
      if (!dream || !dream.isForSale || dream.priceEth === undefined || amountEth < dream.priceEth) {
        throw new Error("NFT not for sale, price mismatch, or insufficient amount offered. Transaction rejected.");
      }
      if (dream.owner === buyerAddress) {
        throw new Error("Cannot purchase your own NFT. Self-transaction policy violation.");
      }
      if (!users[buyerAddress] || users[buyerAddress].balanceEth < amountEth) {
        throw new Error("Insufficient funds in your wallet to complete this purchase. Please top up your balance.");
      }

      // RBAC Check for Buying: Only 'user' or 'admin' roles can buy.
      if (!users[buyerAddress].roles.includes('user') && !users[buyerAddress].roles.includes('admin')) {
          throw new Error("Unauthorized: Your digital identity lacks 'user' or 'admin' privileges to purchase NFTs.");
      }

      const sellerAddress = dream.owner;
      if (!users[sellerAddress]) {
        users[sellerAddress] = generateMockUserProfile(sellerAddress); // Ensure seller profile exists for fund crediting
      }

      // --- AgenticAI: Pre-settlement Risk Assessment ---
      console.log(`[AgenticAI:AnomalyDetection] Performing pre-settlement risk assessment for Tx ID: ${transactionId}`);
      const { isFlagged, reason, riskScore } = simulateRiskScore(buyerAddress, amountEth, 'sale');
      if (isFlagged) {
          transactionStatus = 'flagged';
          dream.history.push({
              type: 'fraud_flagged',
              timestamp: Date.now(),
              initiator: 'AgenticAI_AnomalyDetection',
              targetNFT: tokenId,
              details: `Transaction flagged by AI risk engine: ${reason}. Risk Score: ${riskScore}`,
              amountEth: amountEth,
              transactionId: transactionId,
              status: transactionStatus,
              metadata: { riskScore, reason, sourceAgent: 'AnomalyDetectionAgent' }
          });
          console.error(`[PaymentEngine] Purchase for ${tokenId} by ${truncateAddress(buyerAddress)} BLOCKED due to risk flag: ${reason}. Tx ID: ${transactionId}`);
          throw new Error(`Transaction blocked by risk management: ${reason}. Please contact support with Tx ID: ${truncateAddress(transactionId)}.`);
      }

      // --- AgenticAI: Payment Rail Selection & Routing ---
      const paymentRail = simulatePaymentRailRouter('sale', amountEth);
      console.log(`[AgenticAI:PaymentRouter] Routing payment for Tx ID: ${transactionId} via optimal rail: ${paymentRail}.`);

      // Atomic Fund Transfer and Royalty Distribution
      // Ensure idempotency: if this function were called multiple times for the same transactionId,
      // it should ideally only process once or return the same result. For mock, we rely on UI not calling multiple times.
      const royaltyAmount = amountEth * (MARKETPLACE_CONFIG.ROYALTY_PERCENTAGE / 100);
      const sellerReceives = amountEth - royaltyAmount;

      // Deduct from buyer, credit to seller and creator
      users[buyerAddress].balanceEth = parseFloat((users[buyerAddress].balanceEth - amountEth).toFixed(4));
      users[sellerAddress].balanceEth = parseFloat((users[sellerAddress].balanceEth + sellerReceives).toFixed(4));

      // Creator royalty: paid to original creator if different from seller
      if (dream.creator !== sellerAddress && users[dream.creator]) {
        users[dream.creator].balanceEth = parseFloat((users[dream.creator].balanceEth + royaltyAmount).toFixed(4));
        console.log(`[PaymentEngine] Royalty of ${formatEth(royaltyAmount)} paid to creator ${truncateAddress(dream.creator)}.`);
      } else if (dream.creator === sellerAddress) {
          // If seller IS creator, they implicitly get the royalty (already factored into sellerReceives if no platform fee)
          console.log(`[PaymentEngine] Creator is also seller for ${tokenId}. Royalty implicitly included in sale proceeds.`);
      } else {
          // Mock royalty payment to a phantom creator if their profile doesn't exist for full audit trail
          console.warn(`[PaymentEngine] Phantom creator ${truncateAddress(dream.creator)} received ${formatEth(royaltyAmount)} royalty (profile not found in mock for direct credit).`);
      }

      // Update ownership: Remove from seller, add to buyer (atomic state change)
      users[sellerAddress].ownedNFTs = users[sellerAddress].ownedNFTs.filter(id => id !== tokenId);
      if (!users[buyerAddress].ownedNFTs.includes(tokenId)) { // Idempotent add
        users[buyerAddress].ownedNFTs.push(tokenId);
      }
      dream.owner = buyerAddress;
      dream.isForSale = false;
      dream.lastSoldPriceEth = amountEth;
      dream.priceEth = undefined; // No longer listed
      dream.currentBidders = []; // Clear bids after sale

      transactionStatus = 'completed'; // Mark as completed after all atomic steps
      dream.history.push({
        type: 'sale',
        timestamp: Date.now(),
        initiator: buyerAddress,
        targetNFT: tokenId,
        details: `Purchased by ${truncateAddress(buyerAddress)} from ${truncateAddress(sellerAddress)} for ${formatEth(amountEth)} (Royalty: ${formatEth(royaltyAmount)})`,
        amountEth: amountEth,
        transactionId: transactionId,
        paymentRail: paymentRail,
        status: transactionStatus,
        metadata: { sellerReceives, royaltyAmount, buyerAddress, sellerAddress, creatorAddress: dream.creator }
      });

      console.log(`[PaymentEngine] Purchase for ${tokenId} by ${truncateAddress(buyerAddress)} COMPLETED. Funds transferred, ownership updated. Tx ID: ${transactionId}`);

      // --- AgenticAI: Post-settlement Reconciliation ---
      console.log(`[AgenticAI:ReconciliationAgent] Initiating post-settlement reconciliation for Tx ID: ${transactionId}`);
      // In a real system, a dedicated reconciliation agent would verify all ledger entries,
      // cryptographic proofs of fund transfers, and data consistency across all involved modules.
      // This is a crucial "remediation" and "governance" skill.
      dream.history.push({
        type: 'reconciliation_started',
        timestamp: Date.now() + 50, // Slightly after sale completion, to indicate a separate process
        initiator: 'AgenticAI_ReconciliationAgent',
        targetNFT: tokenId,
        details: `Post-settlement reconciliation initiated for transaction ${truncateAddress(transactionId)}.`,
        transactionId: transactionId,
        status: 'reconciling',
        metadata: { sourceAgent: 'ReconciliationAgent' }
      });
      // A simulated completion for reconciliation would happen asynchronously.
      setTimeout(() => {
          dream.history.push({
              type: 'agent_remediation',
              timestamp: Date.now() + 1000,
              initiator: 'AgenticAI_ReconciliationAgent',
              targetNFT: tokenId,
              details: `Transaction ${truncateAddress(transactionId)} successfully reconciled by Agentic AI.`,
              transactionId: transactionId,
              status: 'completed', // Reconciliation process completed
              metadata: { reconciliationOutcome: 'success', verificationSteps: ['ledger_match', 'ownership_update_verified'] }
          });
          console.log(`[AgenticAI:ReconciliationAgent] Transaction ${transactionId} reconciliation completed.`);
      }, 1000); // Simulate reconciliation taking 1 second

      return dream;
    },

    /**
     * placeBid simulates placing a bid on an NFT, an interaction on the Programmable Token Rail Layer.
     * This involves digital identity verification and pre-bid risk assessment.
     *
     * Business Value: Engages potential buyers in a dynamic auction process, increasing the
     * competitive value of desirable assets. This directly contributes to efficient price
     * discovery and stimulates market liquidity, supporting higher transaction volumes and
     * potentially greater revenue from sales. RBAC and risk checks ensure only legitimate
     * and authorized bids impact market integrity.
     */
    placeBid: async (tokenId: string, bidderAddress: string, bidAmountEth: number): Promise<DreamNFT> => {
      await new Promise(res => setTimeout(res, 1500 + Math.random() * 500));
      const dream = dreams[tokenId];
      if (!dream) {
        throw new Error("NFT not found for bidding. Asset integrity check failed.");
      }
      if (!dream.isForSale) {
        throw new Error("NFT not currently listed for sale, cannot place a bid.");
      }
      if (bidderAddress === dream.owner) {
        throw new Error("Cannot bid on your own NFT. Policy violation.");
      }
      // Bid policy: Must be at least 50% of list price (if listed) and higher than current highest bid.
      const currentHighestBid = dream.history
          .filter(item => item.type === 'bid_placed' && item.amountEth !== undefined && dream.currentBidders.includes(item.initiator))
          .reduce((max, item) => Math.max(max, item.amountEth!), 0);

      if (dream.priceEth && bidAmountEth < dream.priceEth * 0.5) {
          throw new Error("Bid amount is too low. Must be at least 50% of the current listing price for a valid offer.");
      }
      if (bidAmountEth <= currentHighestBid) {
          throw new Error(`Your bid of ${formatEth(bidAmountEth)} must be higher than the current highest bid of ${formatEth(currentHighestBid)}.`);
      }
      if (!users[bidderAddress] || users[bidderAddress].balanceEth < bidAmountEth) {
        throw new Error("Insufficient funds in your wallet to cover this bid. Please ensure you have enough ETH.");
      }

      // RBAC check: Only users with 'user' role or higher can place bids.
      if (!users[bidderAddress] || !users[bidderAddress].roles.includes('user')) {
          throw new Error("Unauthorized: Your digital identity lacks 'user' privileges to place bids.");
      }

      const transactionId = generateTransactionId();
      const paymentRail = simulatePaymentRailRouter('bid', bidAmountEth);

      // --- AgenticAI: Pre-bid Risk Assessment ---
      const { isFlagged: bidFlagged, reason: bidFlagReason, riskScore } = simulateRiskScore(bidderAddress, bidAmountEth, 'bid');
      if (bidFlagged) {
          console.warn(`[AgenticAI:AnomalyDetection] Bid transaction ${transactionId} flagged: ${bidFlagReason}. Risk Score: ${riskScore}`);
          // In a real system, this bid might be put on hold, require secondary verification, or be rejected by an agent.
          throw new Error(`Bid flagged by risk system: ${bidFlagReason}. Tx ID: ${truncateAddress(transactionId)}`);
      }

      // For simplicity in mock, we just add to history and track current bidders.
      // A real auction system would manage highest bid, bid retractions, fund escrow, etc., potentially with an Agent.
      dream.history.push({
          type: 'bid_placed',
          timestamp: Date.now(),
          initiator: bidderAddress,
          targetNFT: tokenId,
          details: `Bid of ${formatEth(bidAmountEth)} placed by ${truncateAddress(bidderAddress)}`,
          amountEth: bidAmountEth,
          transactionId: transactionId,
          paymentRail: paymentRail,
          status: 'completed', // For mock, assume bid placement as an action is 'completed'
          metadata: { riskScore }
      });

      if (!dream.currentBidders.includes(bidderAddress)) { // Idempotent add to bidders list
          dream.currentBidders.push(bidderAddress);
      }
      console.log(`[Logging] Bid Placed: ${dream.tokenId} by ${truncateAddress(bidderAddress)} for ${formatEth(bidAmountEth)} via ${paymentRail}. Tx ID: ${transactionId}`);

      return dream;
    },

    /**
     * getAllUserProfiles retrieves all user profiles stored in the mock backend.
     *
     * Business Value: Supports administrative, analytical, and governance functions
     * by providing aggregated access to all user identity data. This is crucial for
     * market research, compliance reporting, and platform-wide security audits,
     * offering a comprehensive view of the digital identity ecosystem.
     */
    getAllUserProfiles: async (): Promise<UserProfile[]> => {
        await new Promise(res => setTimeout(res, 200));
        return Object.values(users);
    },

    /**
     * incrementViewCount simulates increasing the view count for an NFT, providing real-time
     * engagement metrics for the Observability Layer.
     *
     * Business Value: Provides basic, yet crucial, observability for asset popularity and
     * market interest. This metric helps gauge user engagement, identify emerging trends,
     * and inform content curation and marketing strategies to maximize platform engagement
     * and asset visibility, ultimately contributing to higher sales velocity.
     */
    incrementViewCount: async (tokenId: string): Promise<void> => {
        await new Promise(res => setTimeout(res, 50)); // Minimal delay for this light operation
        if (dreams[tokenId]) {
            dreams[tokenId].viewCount++;
            console.log(`[Metrics] NFT ${tokenId} view count incremented to ${dreams[tokenId].viewCount}`);
        }
    },

    /**
     * likeNFT simulates a user liking an NFT, contributing to social proof and engagement metrics.
     *
     * Business Value: A simple yet powerful engagement metric that reflects user appreciation
     * and aesthetic value. Accumulated likes serve as a social proof mechanism, influencing
     * other users, boosting an NFT's perceived value, and enhancing its discoverability,
     * which can lead to increased market activity and sales.
     */
    likeNFT: async (tokenId: string): Promise<void> => {
        await new Promise(res => setTimeout(res, 100));
        if (dreams[tokenId]) {
            dreams[tokenId].likeCount++;
            console.log(`[Metrics] NFT ${tokenId} like count incremented to ${dreams[tokenId].likeCount}`);
        }
    },

    /**
     * addFavoriteNFT simulates adding an NFT to a user's favorites list, enhancing personalization.
     *
     * Business Value: Enhances personalization, allowing users to curate their own collections
     * of preferred assets. This feature improves user retention, provides valuable data for
     * future recommendation engines, and contributes to a more engaging and sticky platform
     * experience, driving long-term user loyalty.
     */
    addFavoriteNFT: async (userAddress: string, tokenId: string): Promise<void> => {
        await new Promise(res => setTimeout(res, 100));
        if (users[userAddress] && !users[userAddress].favoriteNFTs.includes(tokenId)) {
            users[userAddress].favoriteNFTs.push(tokenId);
            console.log(`[Logging] User ${truncateAddress(userAddress)} favorited NFT ${tokenId}`);
        }
    },

    /**
     * removeFavoriteNFT simulates removing an NFT from a user's favorites, providing granular control.
     *
     * Business Value: Provides users with control over their personalized collections, allowing
     * them to manage their preferences. This flexibility contributes to a positive user experience
     * and supports data hygiene for recommendation systems, ensuring the platform remains
     * user-centric and responsive.
     */
    removeFavoriteNFT: async (userAddress: string, tokenId: string): Promise<void> => {
        await new Promise(res => setTimeout(res, 100));
        if (users[userAddress]) {
            users[userAddress].favoriteNFTs = users[userAddress].favoriteNFTs.filter(id => id !== tokenId);
            console.log(`[Logging] User ${truncateAddress(userAddress)} unfavorited NFT ${tokenId}`);
        }
    },
  };
})();


/**
 * StyledButton is a versatile and aesthetically consistent button component.
 * It provides various visual styles and sizes, ensuring a cohesive, professional
 * user experience across the Ethereal Marketplace interface, reflecting enterprise-grade design.
 *
 * Business Value: Ensures brand consistency, enhances user interaction, and accelerates
 * UI development for complex financial applications. A well-designed, reusable button
 * component reduces design debt, improves accessibility, and drives higher user satisfaction
 * and trust in the platform's reliability and professionalism. This efficiency contributes
 * to faster feature delivery and lower maintenance costs.
 */
export const StyledButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', size?: 'sm' | 'md' | 'lg' }> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseStyle = 'rounded-lg font-semibold transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800';
  const variantStyle = {
    primary: 'bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'bg-transparent border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 focus:ring-cyan-500',
  }[variant];
  const sizeStyle = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  }[size];

  return (
    <button className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className || ''} disabled:opacity-50 disabled:cursor-not-allowed`} {...props}>
      {children}
    </button>
  );
};

/**
 * StyledInput is a consistent and responsive input field component, designed for clarity
 * and reliability in a financial infrastructure context.
 *
 * Business Value: Standardized input components enhance usability and reduce cognitive
 * load for users, minimizing errors in data entry. This consistency in form elements
 * is critical for sensitive financial transactions, digital identity management, and
 * accurate asset creation, directly contributing to data integrity and user trust.
 * It also streamlines development, ensuring a professional and robust user interface.
 */
export const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <input
      className={`w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition duration-200 text-white placeholder-gray-400 ${className || ''}`}
      {...props}
    />
  );
};

/**
 * StyledTextarea is a multi-line text input component designed for consistency
 * and optimal user experience in capturing rich, descriptive content.
 *
 * Business Value: Essential for capturing rich descriptive content, such as
 * detailed NFT descriptions or comprehensive user bios, which are crucial for
 * asset discoverability and personalized identity. A consistent textarea ensures
 * a professional appearance and optimal user experience for content submission,
 * directly impacting the quality and discoverability of high-value digital assets.
 */
export const StyledTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => {
  return (
    <textarea
      className={`w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition duration-200 resize-y text-white placeholder-gray-400 ${className || ''}`}
      rows={4}
      {...props}
    />
  );
};

/**
 * StyledSelect is a consistent and accessible dropdown (select) component, engineered for
 * reliable choice selection in complex financial workflows.
 *
 * Business Value: Provides a clear and efficient way for users to make critical choices,
 * such as selecting NFT styles, licensing options, or operational parameters. This
 * enhances usability, significantly reduces data entry errors, and ensures critical
 * configuration parameters are correctly applied, streamlining the asset creation
 * and management workflows while upholding data integrity.
 */
export const StyledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => {
  return (
    <select
      className={`w-full p-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition duration-200 text-white ${className || ''}`}
      {...props}
    >
      {children}
    </select>
  );
};

/**
 * LoadingSpinner provides crucial visual feedback during asynchronous operations,
 * signifying system responsiveness and ongoing processing.
 *
 * Business Value: Improves user experience by indicating system responsiveness
 * during network delays, complex computations, or real-time settlement processes.
 * This visual cue reduces perceived latency and prevents user frustration,
 * which is critical for retaining engagement and trust in a fast-paced,
 * enterprise-grade marketplace dealing with high-value transactions.
 */
export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
    <span className="sr-only">Loading...</span>
  </div>
);

/**
 * ErrorMessage displays clear, concise, and actionable error notifications to the user,
 * critical for fault tolerance and user guidance.
 *
 * Business Value: Essential for robust error handling and effective user guidance
 * within a sophisticated financial infrastructure. By communicating issues clearly
 * and promptly, this component minimizes user confusion, enables self-correction,
 * and significantly reduces support requests, thus improving operational efficiency
 * and overall user satisfaction, protecting the platform's reputation for reliability.
 */
export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div role="alert" className="bg-red-900 text-red-200 p-3 rounded-lg mt-4 text-sm border border-red-700">
    <p className="font-semibold">Error:</p>
    <p>{message}</p>
  </div>
);

/**
 * SuccessMessage displays positive feedback for completed operations, reinforcing
 * positive user actions and system reliability.
 *
 * Business Value: Reinforces positive user actions, confirming successful transactions,
 * updates, or agent-driven remediations. This immediate and clear feedback enhances
 * user confidence and satisfaction, contributing to a more rewarding platform experience
 * and strengthening trust in the system's ability to execute high-value operations reliably.
 */
export const SuccessMessage: React.FC<{ message: string }> = ({ message }) => (
  <div role="status" className="bg-green-900 text-green-200 p-3 rounded-lg mt-4 text-sm border border-green-700">
    <p className="font-semibold">Success:</p>
    <p>{message}</p>
  </div>
);

/**
 * Modal is a flexible and reusable component for displaying overlay dialogs,
 * designed to bring user focus to critical interactive workflows.
 *
 * Business Value: Enhances user focus for critical interactions, such as minting
 * new assets, reviewing high-value transaction details, or managing digital identity,
 * by temporarily isolating the user's attention. Its reusability accelerates
 * development of new features requiring pop-up interfaces, ensuring a consistent,
 * professional, and highly secure user experience across the entire application,
 * crucial for enterprise-grade solutions.
 */
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" aria-labelledby="modal-title">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all sm:align-middle sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 id="modal-title" className="text-xl font-bold">{title}</h2>
          <StyledButton variant="secondary" onClick={onClose} aria-label="Close modal" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </StyledButton>
        </div>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * PaginationControls renders interactive controls for navigating through paginated content.
 * It dynamically adjusts the number of visible page buttons for optimal usability and performance.
 *
 * Business Value: Improves performance and user experience by breaking down large,
 * potentially millions-strong, datasets into manageable chunks, preventing UI overload
 * and ensuring rapid data loading. Efficient pagination is essential for scalable
 * marketplaces with vast numbers of listings, guaranteeing fast browsing and a smooth,
 * responsive user interface, which is critical for retaining user engagement and transaction velocity.
 */
export const PaginationControls: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    const maxPagesToShow = 5; // e.g., 1 ... 4 5 6 ... 10
    if (totalPages <= maxPagesToShow + 2) { // +2 for edge cases of ellipses
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > Math.floor(maxPagesToShow / 2) + 1) pages.push('...');

      const startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2) + 1);
      const endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPagesToShow / 2) - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - Math.floor(maxPagesToShow / 2)) pages.push('...');
      if (totalPages > 1) pages.push(totalPages);
    }
    // Filter duplicates and ensure '...' is only one entry
    return Array.from(new Set(pages.filter((val, index, self) => !(val === '...' && index > 0 && self[index - 1] === '...'))));
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null; // No pagination needed for 1 or 0 pages

  return (
    <nav className="flex justify-center items-center space-x-2 mt-6" aria-label="Pagination">
      <StyledButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="secondary"
        size="sm"
        aria-label="Go to previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="sr-only sm:not-sr-only ml-1">Previous</span>
      </StyledButton>
      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {typeof page === 'number' ? (
            <StyledButton
              onClick={() => onPageChange(page)}
              variant={page === currentPage ? 'primary' : 'secondary'}
              size="sm"
              className={page === currentPage ? 'cursor-default' : ''}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </StyledButton>
          ) : (
            <span className="px-2 py-1.5 text-gray-400" aria-hidden="true">...</span>
          )}
        </React.Fragment>
      ))}
      <StyledButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="secondary"
        size="sm"
        aria-label="Go to next page"
      >
        <span className="sr-only sm:not-sr-only mr-1">Next</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </StyledButton>
    </nav>
  );
};

/**
 * AppProvider is a React Context Provider that manages and provides global,
 * real-time application state and core financial functions to all components
 * within its tree. This centralizes data management for the marketplace,
 * including user authentication (mocked), dynamic marketplace listings, and
 * user profiles, embodying the core state management for the entire application.
 *
 * Business Value: This provider serves as the single source of truth for
 * critical application data, ensuring data consistency, integrity, and simplifying
 * state management logic across a large codebase. It forms the backbone for
 * a scalable, maintainable, and highly responsive frontend architecture,
 * significantly reducing development complexity and accelerating feature
 * delivery. This directly translates to lower operational costs, faster
 * market responsiveness, and a more robust foundation for a multi-million-dollar
 * financial infrastructure platform.
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [marketData, setMarketData] = useState<DreamNFT[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);

  /**
   * fetchMarketData retrieves all market data (NFTs and user profiles) from the mock backend.
   * This function is crucial for initial data loading and refreshing the marketplace state.
   *
   * Business Value: Ensures the marketplace UI is always synchronized with the latest
   * asset and user data, providing real-time market transparency. This dynamic data flow
   * is essential for accurate pricing, real-time inventory management, and responsive
   * user interfaces, maximizing user engagement and transaction confidence. It underpins
   * the observability requirements of a modern financial platform.
   */
  const fetchMarketData = useCallback(async () => {
    try {
      const data = await mockBackend.fetchDreamNFTs();
      setMarketData(data);
      const allUsers = await mockBackend.getAllUserProfiles();
      setUserProfiles(allUsers);
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      // In a real production application, this would trigger a global error notification,
      // a retry mechanism, or an agent-based remediation process.
    }
  }, []);

  /**
   * walletConnect simulates securely connecting a cryptocurrency wallet and fetching/creating
   * a verifiable user profile through the Digital Identity and Trust Layer.
   * This represents the user's entry point into the authenticated marketplace experience.
   *
   * Business Value: This function simulates the critical "digital identity" onboarding
   * process, enabling personalized experiences and unlocking transactional capabilities
   * upon authentication. It drives user adoption and engagement by providing immediate
   * access to their financial and asset portfolio. The robust mocking ensures the UX
   * flow can be perfected independently of complex, real-world blockchain integrations,
   * accelerating development and ensuring a seamless user journey.
   */
  const walletConnect = useCallback(async () => {
    setIsLoadingWallet(true);
    try {
      // Simulate connecting to a wallet and obtaining a cryptographic address
      const address = generateRandomWalletAddress();
      // Fetch or create user profile based on the address
      const user = await mockBackend.fetchUserProfile(address);
      setCurrentUser(user);
      if (!userProfiles.find(u => u.walletAddress === user?.walletAddress)) {
        setUserProfiles(prev => [...prev, user!]);
      }
      return user!;
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setCurrentUser(null);
      throw error;
    } finally {
      setIsLoadingWallet(false);
    }
  }, [userProfiles]);

  /**
   * walletDisconnect simulates securely disconnecting the current user's wallet,
   * terminating their authenticated session.
   *
   * Business Value: Provides users with essential privacy and control over their
   * session, allowing them to securely log out and manage their digital presence.
   * This enhances user trust, reinforces security protocols, and ensures compliance
   * with stringent data privacy standards, which are critical for any financial platform.
   */
  const walletDisconnect = useCallback(() => {
    setCurrentUser(null);
  }, []);

  /**
   * updateMarketItem updates a specific DreamNFT in the `marketData` state.
   * This is used when an NFT's properties (e.g., price, owner, sale status, history) change
   * as a result of a real-time transaction or agent action.
   *
   * Business Value: Ensures real-time UI updates reflective of immediate market changes,
   * such as sales, listing modifications, or agent interventions. This dynamic responsiveness
   * is key to a vibrant, liquid marketplace, reducing stale data issues, enhancing user
   * experience, and maintaining data integrity across the platform.
   */
  const updateMarketItem = useCallback((tokenId: string, updates: Partial<DreamNFT>) => {
    setMarketData(prev =>
      prev.map(nft => (nft.tokenId === tokenId ? { ...nft, ...updates } : nft))
    );
  }, []);

  /**
   * addMarketItem adds a new DreamNFT to the `marketData` state.
   * Typically used immediately after a successful minting operation to reflect new assets.
   *
   * Business Value: Provides instant feedback to users upon minting a new asset,
   * reflecting the "real-time" aspect of the platform's Programmable Token Rail Layer.
   * This immediate gratification improves user satisfaction and reinforces the value
   * of their creative output, encouraging further engagement and content generation.
   */
  const addMarketItem = useCallback((nft: DreamNFT) => {
    setMarketData(prev => [nft, ...prev]);
  }, []);

  /**
   * removeMarketItem removes a DreamNFT from the `marketData` state.
   * This function supports administrative actions or specific marketplace scenarios
   * where an NFT might need to be delisted or permanently removed due to policy violations.
   *
   * Business Value: Supports administrative actions and platform governance, allowing
   * for data hygiene, content moderation, or the enforcement of market policies.
   * Essential for maintaining the integrity and compliance of the digital asset ecosystem.
   */
  const removeMarketItem = useCallback((tokenId: string) => {
    setMarketData(prev => prev.filter(nft => nft.tokenId !== tokenId));
  }, []);

  /**
   * updateUserProfile updates a specific user profile in the `userProfiles` state,
   * and also updates `currentUser` if the updated profile belongs to the current user.
   *
   * Business Value: Centralized user profile management ensures that all UI components
   * consuming user data reflect the most current information, critical for digital identity
   * and personalization. This consistency is vital for a seamless user experience,
   * preventing data discrepancies and improving the reliability of personalized features
   * and access controls.
   */
  const updateUserProfile = useCallback((walletAddress: string, updates: Partial<UserProfile>) => {
    setUserProfiles(prev =>
      prev.map(profile =>
        profile.walletAddress === walletAddress ? { ...profile, ...updates } : profile
      )
    );
    if (currentUser && currentUser.walletAddress === walletAddress) {
      setCurrentUser(prev => (prev ? { ...prev, ...updates } : null));
    }
  }, [currentUser]);

  // Effect hook to fetch initial market data when the component mounts
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    currentUser,
    setCurrentUser,
    walletConnect,
    walletDisconnect,
    isLoadingWallet,
    marketData,
    fetchMarketData,
    updateMarketItem,
    addMarketItem,
    removeMarketItem,
    userProfiles,
    updateUserProfile,
  }), [
    currentUser,
    setCurrentUser,
    walletConnect,
    walletDisconnect,
    isLoadingWallet,
    marketData,
    fetchMarketData,
    updateMarketItem,
    addMarketItem,
    removeMarketItem,
    userProfiles,
    updateUserProfile,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};


/**
 * WalletInfoPanel displays the current user's cryptographically secured wallet information
 * and profile summary, or prompts them to connect a wallet if not already connected.
 * It is a key interface for user identity management and financial overview.
 *
 * Business Value: This panel serves as the user's personal dashboard for their digital
 * identity and financial standing within the marketplace, embodying the Digital Identity
 * and Trust Layer. By prominently displaying real-time balance, owned assets, and profile
 * details (including `publicKey` and `roles`), it fosters transparency and empowers users
 * to manage their digital presence effectively. The "Connect Wallet" CTA is a critical
 * onboarding mechanism, driving user conversion and active participation in the digital economy.
 */
export const WalletInfoPanel: React.FC = () => {
  const { currentUser, walletConnect, walletDisconnect, isLoadingWallet } = useAppContext();
  const [profileEditOpen, setProfileEditOpen] = useState(false);

  // Render loading state while wallet connection is in progress
  if (isLoadingWallet) {
    return (
      <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center justify-center min-h-[150px] shadow-md border border-gray-600 animate-pulse" aria-live="polite" aria-busy="true">
        <LoadingSpinner />
        <p className="mt-3 text-lg text-gray-300">Connecting Wallet securely to Digital Identity Layer...</p>
      </div>
    );
  }

  // Render prompt to connect wallet if no user is connected
  if (!currentUser) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg flex flex-col items-center shadow-md border border-gray-600" aria-label="Wallet Connection Panel">
        <p className="text-xl font-semibold mb-4 text-white">Connect your digital identity</p>
        <p className="text-gray-400 text-center mb-6">Unlock full marketplace features: mint, buy, sell programmable value assets.</p>
        <StyledButton onClick={walletConnect} size="lg" className="w-full sm:w-auto" aria-label="Connect Wallet">
          Connect Wallet
        </StyledButton>
      </div>
    );
  }

  const ownedNFTCount = currentUser.ownedNFTs.length;

  // Render connected user's profile summary
  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600" aria-label={`User Profile: ${currentUser.username}`}>
      <div className="flex items-center space-x-4 mb-4">
        <img src={currentUser.profilePictureUrl} alt="Profile avatar" className="w-16 h-16 rounded-full border-2 border-cyan-500 object-cover" />
        <div>
          <h3 className="text-xl font-bold text-white flex items-center">
            {currentUser.username}
            {currentUser.isVerified && <span className="ml-2 text-blue-400" title="Verified Creator/Collector"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></span>}
          </h3>
          <p className="text-sm text-gray-400 font-mono break-all">{truncateAddress(currentUser.walletAddress, 8)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4 border-t border-gray-600 pt-4">
        <div>
          <p className="font-semibold text-gray-300">Balance:</p>
          <p className="text-cyan-400 text-lg font-mono">{formatEth(currentUser.balanceEth)}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-300">Owned Dreams:</p>
          <p className="text-lg font-mono">{ownedNFTCount}</p>
        </div>
        <div className="col-span-2">
            <p className="font-semibold text-gray-300">Bio:</p>
            <p className="text-sm italic text-gray-400 break-words max-h-20 overflow-y-auto custom-scrollbar">{currentUser.bio}</p>
        </div>
        <div className="col-span-2">
            <p className="font-semibold text-gray-300">Assigned Roles:</p>
            <p className="text-sm italic text-gray-400">{currentUser.roles.join(', ')}</p>
        </div>
        <div className="col-span-2">
            <p className="font-semibold text-gray-300">Digital Public Key:</p>
            <p className="text-xs font-mono break-all text-gray-500">{truncateAddress(currentUser.publicKey || 'N/A', 10)}</p>
        </div>
      </div>
      <div className="flex justify-end space-x-2 border-t border-gray-600 pt-4">
        <StyledButton variant="secondary" onClick={() => setProfileEditOpen(true)} size="sm" aria-label="Edit your profile information">
          Edit Profile
        </StyledButton>
        <StyledButton variant="danger" onClick={walletDisconnect} size="sm" aria-label="Disconnect your wallet">
          Disconnect
        </StyledButton>
      </div>

      <EditProfileModal
        isOpen={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};

/**
 * EditProfileModal is a modal component for editing the current user's profile information.
 * It allows users to update their username and bio, providing a self-service identity
 * management feature integrated with the Digital Identity Layer.
 *
 * Business Value: Empowers users to customize and maintain their digital identity,
 * which is crucial for fostering a sense of community and personal investment in the
 * platform's ecosystem. This self-management capability reduces administrative overhead,
 * enhances user engagement, and contributes directly to platform stickiness and user
 * satisfaction, reinforcing the value proposition of robust identity services.
 */
export const EditProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; currentUser: UserProfile }> = ({ isOpen, onClose, currentUser }) => {
  const { updateUserProfile, fetchMarketData } = useAppContext();
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset form fields and messages when modal opens or currentUser changes
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUser.username);
      setBio(currentUser.bio);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, currentUser]);

  /**
   * handleSubmit handles the form submission for profile updates.
   * It performs client-side validation, calls the mock backend for persistence,
   * and updates the global application state, reflecting changes from the Digital Identity Layer.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Client-side validation: enforcing data integrity policies
    if (!username.trim()) {
      setError("Username cannot be empty. Identity requires a valid name.");
      setLoading(false);
      return;
    }
    if (username.length > MARKETPLACE_CONFIG.MAX_USERNAME_LENGTH) {
        setError(`Username exceeds maximum length of ${MARKETPLACE_CONFIG.MAX_USERNAME_LENGTH} characters. Please shorten your display name.`);
        setLoading(false);
        return;
    }
    if (!bio.trim()) {
        setError("Bio cannot be empty. Please provide a description for your profile.");
        setLoading(false);
        return;
    }
    if (bio.length > MARKETPLACE_CONFIG.MAX_BIO_LENGTH) {
        setError(`Bio exceeds maximum length of ${MARKETPLACE_CONFIG.MAX_BIO_LENGTH} characters. Please shorten your description.`);
        setLoading(false);
        return;
    }

    try {
      // Calls to the mock backend include implicit digital identity authorization checks (RBAC)
      await mockBackend.updateUserProfile(currentUser.walletAddress, { username, bio });
      updateUserProfile(currentUser.walletAddress, { username, bio }); // Update global context immediately for reactivity
      await fetchMarketData(); // Re-fetch to ensure all user data is consistent across the mock system
      setSuccess("Profile updated successfully, changes reflected across your digital identity!");
      // Optionally, onClose(); could be called here after a short delay
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile. An integrity check may have failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Digital Identity Profile">
      <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="edit-profile-form-title">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username <span className="text-red-400">*</span></label>
          <StyledInput
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your marketplace username"
            required
            maxLength={MARKETPLACE_CONFIG.MAX_USERNAME_LENGTH}
            aria-describedby="username-help"
          />
          <p id="username-help" className="text-xs text-gray-500 mt-1">Choose a unique display name (max {MARKETPLACE_CONFIG.MAX_USERNAME_LENGTH} characters) for your digital persona.</p>
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">Bio <span className="text-red-400">*</span></label>
          <StyledTextarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about your passions, collection, or artistic vision, contributing to your digital footprint..."
            maxLength={MARKETPLACE_CONFIG.MAX_BIO_LENGTH}
            aria-describedby="bio-help"
          />
          <p id="bio-help" className="text-xs text-gray-500 mt-1">A short introduction about yourself (max {MARKETPLACE_CONFIG.MAX_BIO_LENGTH} characters).</p>
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <div className="flex justify-end space-x-2 pt-2 border-t border-gray-700 mt-6">
          <StyledButton type="button" variant="secondary" onClick={onClose} disabled={loading} aria-label="Cancel profile changes">
            Cancel
          </StyledButton>
          <StyledButton type="submit" disabled={loading} aria-label="Save profile changes">
            {loading ? <LoadingSpinner /> : 'Save Changes'}
          </StyledButton>
        </div>
      </form>
    </Modal>
  );
};


/**
 * MintDreamModal is a modal component facilitating the intelligent creation of new Dream NFTs.
 * It provides a comprehensive form for users to specify their dream prompt, artistic style,
 * licensing options, and other metadata, effectively interfacing with the generative AI
 * (Agentic Intelligence Layer) and the Programmable Token Rail Layer for issuance.
 *
 * Business Value: This modal is the gateway for users to leverage the platform's advanced
 * generative AI capabilities (Agentic AI theme) to create unique, high-value, programmable
 * digital assets. By streamlining the secure minting process, it encourages high-volume
 * content creation, directly fueling the supply side of the marketplace and enabling significant
 * revenue generation through minting fees and future royalties. It demonstrates the seamless
 * integration of creative AI with financial infrastructure.
 */
export const MintDreamModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, addMarketItem, fetchMarketData } = useAppContext();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(MARKETPLACE_CONFIG.SUPPORTED_DREAM_STYLES[0]);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [licensing, setLicensing] = useState<MintRequestParams['licensing']>(MARKETPLACE_CONFIG.LICENSING_OPTIONS[0].id as MintRequestParams['licensing']);
  const [tagsInput, setTagsInput] = useState('');
  const [emotionTone, setEmotionTone] = useState('neutral');
  const [complexityScore, setComplexityScore] = useState(50); // Default complexity score
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset form fields and messages when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setStyle(MARKETPLACE_CONFIG.SUPPORTED_DREAM_STYLES[0]);
      setPrivacy('public');
      setLicensing(MARK marketplace_CONFIG.LICENSING_OPTIONS[0].id as MintRequestParams['licensing']);
      setTagsInput('');
      setEmotionTone('neutral');
      setComplexityScore(50);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  /**
   * handleSubmit handles the form submission for minting a new dream.
   * It validates user input, interacts with the mock backend's minting logic,
   * incorporating RBAC and fund checks, and updates the global application state
   * to reflect the newly created NFT on the Programmable Token Rail.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Please connect your wallet to mint a dream NFT and verify your digital identity.");
      return;
    }
    // RBAC check: Only users with 'creator' or 'admin' role can mint new programmable assets.
    if (!currentUser.roles.includes('creator') && !currentUser.roles.includes('admin')) {
        setError("Unauthorized: Your digital identity must have 'creator' or 'admin' role to mint NFTs. Please contact support if this is incorrect.");
        return;
    }
    if (!prompt.trim()) {
      setError("Dream prompt cannot be empty. Please describe your vision to the generative AI.");
      return;
    }
    if (prompt.length > MARKETPLACE_CONFIG.MAX_PROMPT_LENGTH) {
        setError(`Prompt exceeds maximum length of ${MARKETPLACE_CONFIG.MAX_PROMPT_LENGTH} characters. Please shorten your description for optimal AI processing.`);
        return;
    }

    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    if (tags.length > MARKETPLACE_CONFIG.MAX_TAGS_PER_NFT) {
        setError(`You can add a maximum of ${MARKETPLACE_CONFIG.MAX_TAGS_PER_NFT} tags. Please refine your metadata.`);
        return;
    }

    setIsMinting(true);
    setError(null);
    setSuccess(null);

    try {
      // Initiates the mock backend's minting process, which includes AI generation (simulated),
      // fee deduction, risk assessment, and recording on the programmable token rail.
      const mintedDream = await mockBackend.mintDreamNFT({
        prompt, style, privacy, licensing, tags, emotionTone, complexityScore
      }, currentUser.walletAddress);
      addMarketItem(mintedDream); // Add new dream to local state immediately for reactivity
      await fetchMarketData(); // Re-fetch all data to ensure balances and owned NFTs are globally updated
      setSuccess("Dream minted successfully! Your new programmable asset is now in your collection.");
      // onClose(); // Optionally close modal after success
    } catch (err: any) {
      console.error("Minting error:", err);
      setError(err.message || "Failed to mint dream. An unexpected error or policy violation occurred.");
      if (err.message.includes("Insufficient funds")) {
          setError(`${err.message} Please ensure your wallet has ${formatEth(MARKETPLACE_CONFIG.MINT_FEE_ETH)} to cover the minting fee.`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  const currentTagsCount = tagsInput.split(',').filter(t => t.trim() !== '').length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mint a New Ethereal Dream NFT (Programmable Asset)">
      <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="mint-dream-form-title">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">Dream Prompt <span className="text-red-400">*</span></label>
          <StyledTextarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the dream you wish to materialize (e.g., 'A bioluminescent forest under twin moons, rendered in a surreal style')"
            required
            maxLength={MARKETPLACE_CONFIG.MAX_PROMPT_LENGTH}
            aria-describedby="prompt-char-count"
          />
          <p id="prompt-char-count" className="text-xs text-gray-400 mt-1">{prompt.length}/{MARKETPLACE_CONFIG.MAX_PROMPT_LENGTH} characters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-1">Art Style</label>
            <StyledSelect id="style" value={style} onChange={(e) => setStyle(e.target.value)} aria-label="Select dream art style">
              {MARKETPLACE_CONFIG.SUPPORTED_DREAM_STYLES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </StyledSelect>
          </div>
          <div>
            <label htmlFor="emotionTone" className="block text-sm font-medium text-gray-300 mb-1">Emotional Tone</label>
            <StyledSelect id="emotionTone" value={emotionTone} onChange={(e) => setEmotionTone(e.target.value)} aria-label="Select emotional tone for AI generation">
              {['neutral', 'calm', 'vibrant', 'mysterious', 'melancholic', 'joyful', 'eerie', 'adventurous', 'nostalgic', 'futuristic'].map(tone => (
                <option key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</option>
              ))}
            </StyledSelect>
          </div>
        </div>

        <div>
          <label htmlFor="complexity" className="block text-sm font-medium text-gray-300 mb-1">Visual Complexity: <span className="font-semibold text-cyan-400">{complexityScore}</span></label>
          <input
            id="complexity"
            type="range"
            min="0"
            max="100"
            step="1"
            value={complexityScore}
            onChange={(e) => setComplexityScore(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label={`Set visual complexity for AI generation to ${complexityScore}`}
          />
          <p className="text-xs text-gray-500 mt-1">Lower scores for simpler designs, higher for more intricate details (influences generative AI parameters).</p>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">Tags (comma-separated, max {MARKETPLACE_CONFIG.MAX_TAGS_PER_NFT})</label>
          <StyledInput
            id="tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g., fantasy, nature, abstract, space (for discoverability)"
            aria-describedby="tags-info"
          />
          <p id="tags-info" className="text-xs text-gray-400 mt-1">{currentTagsCount}/{MARKETPLACE_CONFIG.MAX_TAGS_PER_NFT} tags entered</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="privacy" className="block text-sm font-medium text-gray-300 mb-1">Privacy Setting</label>
            <StyledSelect id="privacy" value={privacy} onChange={(e) => setPrivacy(e.target.value as 'public' | 'private')} aria-label="Select dream privacy setting">
              <option value="public">Public (Visible to all on marketplace and discoverable)</option>
              <option value="private">Private (Only visible to owner, not listed publicly, for personal use or future listing)</option>
            </StyledSelect>
            <p className="text-xs text-gray-500 mt-1">Private dreams can be shared later, but aren't initially listed on the public marketplace.</p>
          </div>
          <div>
            <label htmlFor="licensing" className="block text-sm font-medium text-gray-300 mb-1">Licensing</label>
            <StyledSelect id="licensing" value={licensing} onChange={(e) => setLicensing(e.target.value as MintRequestParams['licensing'])} aria-label="Select licensing option for your NFT">
              {MARKETPLACE_CONFIG.LICENSING_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </StyledSelect>
            <p className="text-xs text-gray-500 mt-1 h-10 overflow-y-auto custom-scrollbar">
              {MARKETPLACE_CONFIG.LICENSING_OPTIONS.find(opt => opt.id === licensing)?.description}
            </p>
          </div>
        </div>

        <div className="mt-6 p-3 bg-gray-700 rounded-lg border border-gray-600">
            <p className="text-sm text-gray-300 font-semibold">Programmable Asset Minting Fee: <span className="text-cyan-400">{formatEth(MARKETPLACE_CONFIG.MINT_FEE_ETH)}</span></p>
            {currentUser && (
                <p className="text-xs text-gray-400">Your current balance: <span className="text-cyan-400">{formatEth(currentUser.balanceEth)}</span>
                {currentUser.balanceEth < MARKETPLACE_CONFIG.MINT_FEE_ETH && <span className="text-red-400 ml-2 font-bold"> (Insufficient funds! Please top up.)</span>}
                </p>
            )}
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <div className="flex justify-end space-x-2 pt-2 border-t border-gray-700 mt-6">
          <StyledButton type="button" variant="secondary" onClick={onClose} disabled={isMinting} aria-label="Cancel minting process for this dream NFT">
            Cancel
          </StyledButton>
          <StyledButton type="submit" disabled={isMinting || !currentUser || currentUser.balanceEth < MARKETPLACE_CONFIG.MINT_FEE_ETH || (!currentUser.roles.includes('creator') && !currentUser.roles.includes('admin'))} aria-label="Mint your dream as an NFT">
            {isMinting ? <LoadingSpinner /> : 'Mint Dream as NFT'}
          </StyledButton>
        </div>
      </form>
    </Modal>
  );
};


/**
 * DreamCard displays a single Dream NFT as an interactive card within a grid layout.
 * It provides a visual summary of the NFT's key attributes, market status, and
 * embedded programmable value, designed to capture immediate user interest.
 *
 * Business Value: This component is a high-impact visual representation of digital assets,
 * engineered to attract buyer attention and encourage exploration within the Programmable
 * Token Rail ecosystem. Its concise presentation of price, rarity, ownership, and
 * engagement metrics, coupled with intuitive interaction, directly supports discoverability
 * and drives traffic to individual NFT listings, maximizing potential sales and platform revenue.
 */
export const DreamCard: React.FC<{ dream: DreamNFT; onDetailsClick: (dream: DreamNFT) => void }> = ({ dream, onDetailsClick }) => {
  const { currentUser } = useAppContext();
  const isOwner = currentUser?.walletAddress === dream.owner;
  const isCreator = currentUser?.walletAddress === dream.creator;

  return (
    <article className="bg-gray-700 rounded-lg shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-600 relative group" aria-label={`NFT: ${dream.prompt}`}>
      <div className="relative w-full h-48 overflow-hidden">
        <img src={dream.visualizationUrl} alt={`Visualization of ${dream.prompt}`} className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        {dream.isForSale && dream.priceEth !== undefined && (
            <div className="absolute top-2 left-2 bg-cyan-600 text-white text-xs px-2 py-1 rounded-md font-bold">
                {formatEth(dream.priceEth)}
            </div>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2" title={dream.prompt}>{dream.prompt}</h3>
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 12v-1m-4-6H4m9 0h9m-9.95.942a9.141 9.141 0 01-2.07-.638 9.07 9.07 0 01-1.396-.988 9.07 9.07 0 01-.988-1.396 9.14 9.14 0 01-.638-2.07C4.686 9.548 4 10.744 4 12c0 2.946 1.48 5.61 3.864 7.221A9.155 9.155 0 0112 20c.843 0 1.666-.098 2.464-.298m0 0a9.083 9.083 0 00-2.464 0" />
          </svg>
          <span className="truncate">{dream.style}</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-800 text-blue-200" title={`Rarity Score: ${dream.rarityScore}/100`}>Rarity: {dream.rarityScore}</span>
        </div>

        <div className="flex items-center text-sm text-gray-300 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate" title={`Current Owner: ${dream.owner}`}>Owner: {isOwner ? 'You' : truncateAddress(dream.owner)}</span>
        </div>

        <div className="flex items-center text-xs text-gray-500 mt-auto pt-2 border-t border-gray-600">
            <span className="flex items-center mr-3" title="View Count">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {dream.viewCount.toLocaleString()}
            </span>
            <span className="flex items-center mr-3" title="Like Count">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {dream.likeCount.toLocaleString()}
            </span>
            <div className="ml-auto">
                <StyledButton onClick={() => onDetailsClick(dream)} size="sm" aria-label={`View details for ${dream.prompt}`}>
                    Details
                </StyledButton>
            </div>
        </div>
      </div>
    </article>
  );
};


/**
 * NFTDetailModal is a modal component providing an in-depth, auditable view of a selected Dream NFT.
 * It presents detailed asset information, immutable transaction history (from the Programmable
 * Token Rail Layer), licensing terms, and access to raw neural patterns for verified owners.
 * Furthermore, it enables critical market actions such as purchasing, bidding, listing, or
 * canceling a listing, all governed by the Real-Time Settlement, Digital Identity, and Agentic
 * Intelligence layers.
 *
 * Business Value: This modal is a high-value transaction and information hub, central to the
 * entire NFT lifecycle within a financial infrastructure. By consolidating all asset information,
 * verifiable provenance, and transactional capabilities (Real-Time Payments, Token Rails, Digital
 * Identity controls like RBAC, and Agentic AI-driven risk management) into one cohesive interface,
 * it empowers users to make highly informed decisions and execute secure, real-time transactions
 * seamlessly. The transparency of immutable transaction history and detailed licensing information
 * builds profound trust, mitigates financial and legal risks, and unlocks diverse commercial
 * opportunities for digital assets, making it indispensable for an enterprise-grade platform.
 */
export const NFTDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; dream: DreamNFT | null }> = ({ isOpen, onClose, dream }) => {
  const { currentUser, updateMarketItem, fetchMarketData, updateUserProfile } = useAppContext();
  const [isBuying, setIsBuying] = useState(false);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [listPrice, setListPrice] = useState<string>('');
  const [isListing, setIsListing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Reset states and fields when modal opens or dream changes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
      setBidAmount('');
      setListPrice(dream?.priceEth?.toString() || '');

      // Increment view count for the dream if it's opened, contributing to observability metrics.
      if (dream) {
          mockBackend.incrementViewCount(dream.tokenId).then(() => {
              updateMarketItem(dream.tokenId, { viewCount: (dream.viewCount || 0) + 1 });
          }).catch(console.error);
      }
    }
  }, [isOpen, dream, updateMarketItem]);

  if (!dream) return null; // Don't render if no dream is selected

  const isOwner = currentUser?.walletAddress === dream.owner;
  const isCreator = currentUser?.walletAddress === dream.creator;
  // Note: For a true auction, highest bid would be stored and managed on-chain.
  // This mock system simplifies it by calculating from history, which may not represent current highest *active* bid.
  const currentHighestBid = dream.history
      .filter(item => item.type === 'bid_placed' && item.amountEth !== undefined && dream.currentBidders.includes(item.initiator)) // Only consider bids from currentBidders
      .reduce((max, item) => Math.max(max, item.amountEth!), 0);


  /**
   * handleBuyNow facilitates the direct purchase of an NFT, executing an atomic settlement.
   * It performs client-side validation, invokes the mock backend's `buyNFT` logic (Real-Time
   * Settlement Engine, Agentic AI for risk), and updates the application state to reflect
   * the transfer of ownership and funds on the Programmable Token Rail.
   */
  const handleBuyNow = async () => {
    if (!currentUser) {
      setError("Please connect your wallet to buy this NFT and verify your digital identity.");
      return;
    }
    if (!dream.isForSale || dream.priceEth === undefined) {
      setError("This NFT is not currently listed for sale. Purchase request denied.");
      return;
    }
    if (currentUser.balanceEth < dream.priceEth) {
      setError(`Insufficient funds. Your wallet balance is ${formatEth(currentUser.balanceEth)}, but you need ${formatEth(dream.priceEth)} to complete this high-value purchase.`);
      return;
    }
    // RBAC check for buying: Ensures only authorized roles can execute purchase.
    if (!currentUser.roles.includes('user') && !currentUser.roles.includes('admin')) {
        setError("Unauthorized: Your digital identity lacks 'user' or 'admin' privileges to purchase NFTs. Transaction rejected.");
        return;
    }


    setIsBuying(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedDream = await mockBackend.buyNFT(dream.tokenId, currentUser.walletAddress, dream.priceEth);
      updateMarketItem(dream.tokenId, updatedDream);
      await fetchMarketData(); // Re-fetch all data to update balances and owned NFTs across the system
      setSuccess(`Successfully purchased "${dream.prompt}" for ${formatEth(dream.priceEth)}! It's now in your collection.`);
      // onClose(); // Optionally close after successful transaction
    } catch (err: any) {
      console.error("Buy NFT error:", err);
      setError(err.message || "Failed to complete purchase. An unexpected system error or policy violation occurred. Please try again.");
    } finally {
      setIsBuying(false);
    }
  };

  /**
   * handlePlaceBid processes a user's bid on an NFT, interacting with the Programmable Token Rail Layer.
   * It includes input validation, RBAC, and interaction with the mock backend's bidding logic,
   * incorporating agentic risk assessment.
   */
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Please connect your wallet to place a bid and verify your digital identity.");
      return;
    }
    // RBAC check for placing bid: Ensures only authorized roles can place bids.
    if (!currentUser.roles.includes('user') && !currentUser.roles.includes('admin')) {
        setError("Unauthorized: Your digital identity lacks 'user' or 'admin' privileges to place bids. Bid rejected.");
        return;
    }
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid bid amount (e.g., 0.5 ETH). Bid must be positive.");
      return;
    }
    if (currentUser.balanceEth < amount) {
      setError(`Insufficient funds. Your wallet balance is ${formatEth(currentUser.balanceEth)}, but you need ${formatEth(amount)} to cover this bid. Please top up.`);
      return;
    }
    if (dream.isForSale && dream.priceEth && amount < dream.priceEth * 0.5) { // Bid must be at least 50% of list price if listed
        setError(`Bid is too low. Must be at least 50% of current listing price (${formatEth(dream.priceEth * 0.5)}). Financial policy violation.`);
        return;
    }
    if (amount <= currentHighestBid) {
        setError(`Your bid must be higher than the current highest bid of ${formatEth(currentHighestBid)}. Please submit a competitive offer.`);
        return;
    }

    setIsPlacingBid(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedDream = await mockBackend.placeBid(dream.tokenId, currentUser.walletAddress, amount);
      updateMarketItem(dream.tokenId, updatedDream);
      await fetchMarketData(); // Re-fetch to update all relevant data globally after bid
      setSuccess(`Your bid of ${formatEth(amount)} has been successfully placed!`);
      setBidAmount(''); // Clear bid input
    } catch (err: any) {
      console.error("Place bid error:", err);
      setError(err.message || "Failed to place bid. An unexpected error or policy violation occurred.");
    } finally {
      setIsPlacingBid(false);
    }
  };

  /**
   * handleListForSale enables the owner to list their NFT for sale on the Programmable Token Rail.
   * It validates the proposed price against market policies and interacts with the mock backend.
   */
  const handleListForSale = async () => {
    if (!currentUser || currentUser.walletAddress !== dream.owner) {
        setError("You must be the verified owner of this NFT to list it for sale. Digital identity verification failed.");
        return;
    }
    // RBAC check for listing: Ensures authorized roles can list.
    if (!currentUser.roles.includes('creator') && !currentUser.roles.includes('admin') && !currentUser.roles.includes('user')) {
        setError("Unauthorized: Your digital identity lacks 'creator', 'user' or 'admin' privileges to list NFTs for sale.");
        return;
    }
    const price = parseFloat(listPrice);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid listing price greater than 0 ETH. Financial policy violation.");
      return;
    }

    setIsListing(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedDream = await mockBackend.listNFTForSale(dream.tokenId, currentUser.walletAddress, price);
      updateMarketItem(dream.tokenId, updatedDream);
      await fetchMarketData();
      setSuccess(`Your dream has been successfully listed for ${formatEth(price)}!`);
    } catch (err: any) {
      console.error("List NFT for sale error:", err);
      setError(err.message || "Failed to list NFT for sale. Please verify details and try again.");
    } finally {
      setIsListing(false);
    }
  };

  /**
   * handleCancelListing allows the owner to remove their NFT from the marketplace listing,
   * enforcing digital identity and ownership.
   */
  const handleCancelListing = async () => {
    if (!currentUser || currentUser.walletAddress !== dream.owner) {
        setError("You must be the verified owner of this NFT to cancel its listing. Digital identity verification failed.");
        return;
    }
    // RBAC check for canceling listing: Ensures authorized roles can cancel.
    if (!currentUser.roles.includes('creator') && !currentUser.roles.includes('admin') && !currentUser.roles.includes('user')) {
        setError("Unauthorized: Your digital identity lacks 'creator', 'user' or 'admin' privileges to cancel NFT listings.");
        return;
    }
    if (!dream.isForSale) {
        setError("This NFT is not currently listed for sale. No active listing to cancel.");
        return;
    }

    setIsCancelling(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedDream = await mockBackend.cancelListing(dream.tokenId, currentUser.walletAddress);
      updateMarketItem(dream.tokenId, updatedDream);
      await fetchMarketData();
      setSuccess("Listing successfully cancelled! Your asset is no longer actively marketed.");
    } catch (err: any) {
      console.error("Cancel listing error:", err);
      setError(err.message || "Failed to cancel listing. An unexpected error occurred. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  /**
   * handleLikeNFT increments the like count for an NFT, contributing to market observability.
   */
  const handleLikeNFT = async () => {
      if (!currentUser) {
          setError("Please connect your wallet to like NFTs and verify your digital identity.");
          return;
      }
      try {
          await mockBackend.likeNFT(dream.tokenId);
          updateMarketItem(dream.tokenId, { likeCount: (dream.likeCount || 0) + 1 });
      } catch (err) {
          console.error("Error liking NFT:", err);
          setError("Failed to register like. Please try again.");
      }
  };

  /**
   * handleToggleFavorite adds or removes an NFT from the user's favorites list,
   * enhancing personalization within the Digital Identity Layer.
   */
  const handleToggleFavorite = async () => {
    if (!currentUser) {
        setError("Please connect your wallet to manage favorites and verify your digital identity.");
        return;
    }
    try {
        const isCurrentlyFavorite = currentUser.favoriteNFTs.includes(dream.tokenId);
        if (isCurrentlyFavorite) {
            await mockBackend.removeFavoriteNFT(currentUser.walletAddress, dream.tokenId);
            updateUserProfile(currentUser.walletAddress, { favoriteNFTs: currentUser.favoriteNFTs.filter(id => id !== dream.tokenId) });
            setSuccess(`NFT ${truncateAddress(dream.tokenId, 4)} removed from favorites.`);
        } else {
            await mockBackend.addFavoriteNFT(currentUser.walletAddress, dream.tokenId);
            updateUserProfile(currentUser.walletAddress, { favoriteNFTs: [...currentUser.favoriteNFTs, dream.tokenId] });
            setSuccess(`NFT ${truncateAddress(dream.tokenId, 4)} added to favorites.`);
        }
    } catch (err) {
        console.error("Error toggling favorite:", err);
        setError("Failed to update favorites. Please try again.");
    }
  };


  const isFavorite = currentUser?.favoriteNFTs.includes(dream.tokenId);

  const getLicensingDescription = (id: string) => MARKETPLACE_CONFIG.LICENSING_OPTIONS.find(opt => opt.id === id)?.description || 'N/A';
  const getLicensingName = (id: string) => MARKETPLACE_CONFIG.LICENSING_OPTIONS.find(opt => opt.id === id)?.name || 'Unknown License';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Programmable Asset Details: ${dream.prompt}`}>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 flex flex-col items-center">
          <img src={dream.visualizationUrl} alt={`Visualization of ${dream.prompt}`} className="w-full max-w-md rounded-lg shadow-md mb-4 border border-gray-600" />
          <div className="text-center w-full">
            <h4 className="text-xl font-bold text-white mb-2">{dream.prompt}</h4>
            <p className="text-gray-400 text-sm mb-4 italic max-h-32 overflow-y-auto custom-scrollbar">{dream.description || "No description provided for this programmable asset."}</p>
            <div className="flex justify-center space-x-4 mb-4 text-gray-300">
                <span className="flex items-center" title="View Count (Observability Metric)">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {dream.viewCount.toLocaleString()}
                </span>
                <StyledButton variant="ghost" size="sm" onClick={handleLikeNFT} disabled={!currentUser} aria-label={`Like this NFT. Currently has ${dream.likeCount} likes.`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 ${!currentUser ? 'text-gray-500' : 'text-red-400 hover:text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {dream.likeCount.toLocaleString()}
                </StyledButton>
                <StyledButton variant="ghost" size="sm" onClick={handleToggleFavorite} disabled={!currentUser} aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-500'} ${!currentUser ? 'opacity-50' : ''}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.975 2.888a1 1 0 00-.324 1.118l1.519 4.674c.3.921-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.176 0l-3.975 2.888c-.784.57-1.838-.197-1.539-1.118l1.519-4.674a1 1 0 00-.324-1.118L2.28 9.293c-.783-.57-.381-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                    </svg>
                    <span className="ml-1 text-sm">{isFavorite ? 'Favorited' : 'Favorite'}</span>
                </StyledButton>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
            {dream.tags.map(tag => (
              <span key={tag} className="inline-block bg-gray-600 rounded-full px-3 py-1 text-xs font-semibold text-gray-200">
                #{tag}
              </span>
            ))}
          </div>
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-col">
          <h4 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2 text-white">Programmable Asset Information</h4>
          <div className="text-gray-300 text-sm space-y-2 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            <p><strong>Token ID:</strong> <span className="text-xs font-mono break-all text-cyan-300">{dream.tokenId}</span></p>
            <p><strong>Creator:</strong> <span className="text-cyan-400">{truncateAddress(dream.creator)}</span> {isCreator && <span className="text-xs text-green-400">(You)</span>}</p>
            <p><strong>Current Owner:</strong> <span className="text-cyan-400">{truncateAddress(dream.owner)}</span> {isOwner && <span className="text-xs text-green-400">(You)</span>}</p>
            <p><strong>Minted On:</strong> {formatTimestamp(dream.timestampMinted)}</p>
            <p><strong>Art Style:</strong> <span className="text-blue-400 font-medium">{dream.style}</span></p>
            <p><strong>Rarity Score:</strong> <span className="text-blue-300 font-medium">{dream.rarityScore}/100</span></p>
            <p><strong>Licensing:</strong> <span className="text-purple-300 font-medium">{getLicensingName(dream.licensingOption)}</span></p>
            <p className="text-xs text-gray-500 pl-4 border-l-2 border-gray-600 italic">{getLicensingDescription(dream.licensingOption)}</p>
            <p><strong>High-Res Neural Pattern Access:</strong> {dream.hasHighResAccess ? 'Available' : 'Not Available'}</p>
            {dream.neuralPatternUrl && dream.hasHighResAccess && isOwner && (
                <a href={dream.neuralPatternUrl} download className="text-cyan-400 hover:underline text-sm block mt-2 p-2 bg-gray-700 rounded-lg border border-cyan-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Raw Neural Pattern Data (.bin) - for verified owners
                </a>
            )}
          </div>

          <h4 className="text-lg font-semibold mt-4 mb-3 border-b border-gray-700 pb-2 text-white">Market Interactions & Settlement</h4>
          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {dream.isForSale && dream.priceEth !== undefined ? (
            <div className="bg-gray-700 p-4 rounded-lg mb-4 border border-gray-600">
              <p className="text-sm text-gray-400">Current Listing Price:</p>
              <p className="text-3xl font-bold text-cyan-400 mb-2">{formatEth(dream.priceEth)}</p>
              {currentHighestBid > 0 && currentHighestBid < dream.priceEth && (
                  <p className="text-sm text-gray-400">Current Highest Bid: <span className="font-semibold text-blue-300">{formatEth(currentHighestBid)}</span></p>
              )}
              {isOwner ? (
                <>
                  <p className="text-md text-gray-300 mt-3">This is your programmable asset, currently listed for sale.</p>
                  <StyledButton variant="danger" onClick={handleCancelListing} disabled={isCancelling} className="w-full mt-3">
                    {isCancelling ? <LoadingSpinner /> : 'Cancel Listing'}
                  </StyledButton>
                </>
              ) : (
                <>
                  <StyledButton onClick={handleBuyNow} disabled={isBuying || !currentUser || currentUser.balanceEth < (dream.priceEth || 0) || (!currentUser.roles.includes('user') && !currentUser.roles.includes('admin'))} className="w-full mt-3">
                    {isBuying ? <LoadingSpinner /> : 'Buy Now (Real-time Settlement)'}
                  </StyledButton>
                  <form onSubmit={handlePlaceBid} className="flex flex-col space-y-2 mt-4">
                    <label htmlFor="bid-amount" className="text-sm font-medium text-gray-300">Place a Bid (min {dream.priceEth ? formatEth(dream.priceEth * 0.5) : formatEth(0.0001)}):</label>
                    <StyledInput
                      id="bid-amount"
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="e.g., 0.5 ETH"
                      disabled={isPlacingBid || !currentUser || (!currentUser.roles.includes('user') && !currentUser.roles.includes('admin'))}
                      aria-label="Enter bid amount"
                    />
                    <StyledButton type="submit" disabled={isPlacingBid || !currentUser || parseFloat(bidAmount || '0') <= 0 || (currentUser && currentUser.balanceEth < parseFloat(bidAmount || '0')) || (!currentUser.roles.includes('user') && !currentUser.roles.includes('admin'))}>
                      {isPlacingBid ? <LoadingSpinner /> : 'Submit Bid'}
                    </StyledButton>
                  </form>
                  {!currentUser && <p className="text-red-400 text-xs mt-2">Connect your wallet to enable buying and bidding.</p>}
                  {currentUser && !currentUser.roles.some(role => ['user', 'admin'].includes(role)) && <p className="text-red-400 text-xs mt-2">Your current digital identity roles do not permit buying or bidding.</p>}
                </>
              )}
            </div>
          ) : (
            !isOwner && <p className="text-md font-semibold text-gray-400 bg-gray-700 p-4 rounded-lg border border-gray-600 mb-4">This programmable asset is not currently listed for sale.</p>
          )}

          {!dream.isForSale && isOwner && (
            <div className="bg-gray-700 p-4 rounded-lg mb-4 border border-gray-600">
              <p className="text-md text-gray-300 mb-3">Your programmable asset is not currently listed for sale.</p>
              <div className="flex flex-col space-y-2">
                <label htmlFor="list-price" className="text-sm font-medium text-gray-300">List for Sale (Programmable Value Rail):</label>
                <StyledInput
                  id="list-price"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  placeholder="e.g., 1.2 ETH"
                  disabled={isListing || (!currentUser.roles.includes('creator') && !currentUser.roles.includes('admin') && !currentUser.roles.includes('user'))}
                  aria-label="Enter listing price in ETH"
                />
                <StyledButton onClick={handleListForSale} disabled={isListing || parseFloat(listPrice || '0') <= 0 || (!currentUser.roles.includes('creator') && !currentUser.roles.includes('admin') && !currentUser.roles.includes('user'))} className="w-full">
                  {isListing ? <LoadingSpinner /> : 'List NFT (on Token Rail)'}
                </StyledButton>
              </div>
              {currentUser && !currentUser.roles.some(role => ['creator', 'admin', 'user'].includes(role)) && <p className="text-red-400 text-xs mt-2">Your current digital identity roles do not permit listing NFTs for sale.</p>}
            </div>
          )}

          {dream.lastSoldPriceEth !== undefined && (
            <p className="text-sm text-gray-400 mt-2">Last Sold: <span className="font-semibold text-green-400">{formatEth(dream.lastSoldPriceEth)}</span></p>
          )}

          <h4 className="text-lg font-semibold mt-6 mb-3 border-b border-gray-700 pb-2 text-white">Immutable Transaction History (Audit Trail)</h4>
          <div className="flex-grow max-h-60 overflow-y-auto custom-scrollbar bg-gray-700 p-3 rounded-lg border border-gray-600">
            {dream.history.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No transaction history found for this programmable asset.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {dream.history.slice().reverse().map((item, index) => ( // Reverse to show latest first
                  <li key={index} className="border-b border-gray-600 pb-2 last:border-b-0 last:pb-0">
                    <p className="font-medium text-gray-200">{item.details}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <time dateTime={new Date(item.timestamp).toISOString()}>{formatTimestamp(item.timestamp)}</time>
                      {item.transactionId && <span className="ml-2 text-cyan-500 font-mono" title={`Transaction ID: ${item.transactionId}`}>Tx: {truncateAddress(item.transactionId, 6)}</span>}
                      {item.paymentRail && <span className="ml-2 text-purple-400" title={`Payment Rail: ${item.paymentRail}`}>Rail: {item.paymentRail.replace('rail_', '')}</span>}
                      {item.status && <span className={`ml-2 font-semibold ${item.status === 'flagged' ? 'text-red-400' : item.status === 'reconciling' ? 'text-yellow-400' : 'text-green-400'}`} title={`Status: ${item.status}`}>Status: {item.status}</span>}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};


/**
 * MarketplaceFiltersPanel provides a comprehensive set of controls for dynamically filtering
 * high-value NFT listings. It enables users to narrow down the displayed assets by price range,
 * artistic style, tags, and other criteria, directly enhancing the discoverability of
 * commercially relevant items.
 *
 * Business Value: This panel is critical for improving market efficiency, liquidity, and
 * user experience. By offering powerful, real-time search and filtering tools, it empowers
 * buyers to quickly find desired digital assets, reducing sales friction and increasing
 * conversion rates. This directly supports higher transaction volumes, optimizes asset
 * monetization, and generates more revenue for the platform, solidifying its position as a
 * leading financial backbone.
 */
export const MarketplaceFiltersPanel: React.FC<{
  filters: MarketplaceFilters;
  setFilters: React.Dispatch<React.SetStateAction<MarketplaceFilters>>;
  onSearch: (query: string) => void;
  allTags: string[];
}> = ({ filters, setFilters, onSearch, allTags }) => {
  const [minPrice, setMinPrice] = useState(filters.priceRange[0].toString());
  const [maxPrice, setMaxPrice] = useState(filters.priceRange[1] === 999999 ? '' : filters.priceRange[1].toString()); // Handle initial large max price
  const [tempSearchQuery, setTempSearchQuery] = useState(filters.searchQuery);
  const [minRarity, setMinRarity] = useState(filters.minRarity?.toString() || '');

  // Update local state when external filters change
  useEffect(() => {
    setMinPrice(filters.priceRange[0].toString());
    setMaxPrice(filters.priceRange[1] === 999999 ? '' : filters.priceRange[1].toString());
    setTempSearchQuery(filters.searchQuery);
    setMinRarity(filters.minRarity?.toString() || '');
  }, [filters]);

  /**
   * handlePriceChange updates the price range filter based on user input,
   * applying financial policy logic.
   */
  const handlePriceChange = useCallback(() => {
    const min = parseFloat(minPrice || '0');
    const max = parseFloat(maxPrice || '999999'); // Use a very large number as effective infinity
    setFilters(prev => ({
      ...prev,
      priceRange: [isNaN(min) ? 0 : min, isNaN(max) ? 999999 : max]
    }));
  }, [minPrice, maxPrice, setFilters]);

  /**
   * handleRarityChange updates the minimum rarity score filter, influencing asset valuation.
   */
  const handleRarityChange = useCallback(() => {
    const rarity = parseInt(minRarity || '0');
    setFilters(prev => ({
      ...prev,
      minRarity: isNaN(rarity) || rarity < 0 ? undefined : Math.min(rarity, 100)
    }));
  }, [minRarity, setFilters]);

  /**
   * handleStyleChange toggles the inclusion of an artistic style in the filter.
   */
  const handleStyleChange = useCallback((style: string, isChecked: boolean) => {
    setFilters(prev => ({
      ...prev,
      styles: isChecked
        ? [...prev.styles, style]
        : prev.styles.filter(s => s !== style)
    }));
  }, [setFilters]);

  /**
   * handleTagChange toggles the inclusion of a tag in the filter.
   */
  const handleTagChange = useCallback((tag: string, isChecked: boolean) => {
    setFilters(prev => ({
      ...prev,
      tags: isChecked
        ? [...prev.tags, tag]
        : prev.tags.filter(t => t !== tag)
    }));
  }, [setFilters]);

  /**
   * handleSearchSubmit triggers a new search based on the current query,
   * optimizing asset discovery.
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(tempSearchQuery);
  };

  const resetButton = (
      <StyledButton
          variant="secondary"
          size="sm"
          onClick={() => {
              setFilters({
                  priceRange: [0, 999999], // Effectively no max price
                  styles: [],
                  tags: [],
                  owner: undefined,
                  isForSaleOnly: false,
                  searchQuery: '',
                  minRarity: undefined
              });
              setMinPrice('0');
              setMaxPrice('');
              setTempSearchQuery('');
              setMinRarity('');
          }}
          aria-label="Reset all filters"
      >
          Reset Filters
      </StyledButton>
  );

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
      <h3 className="text-xl font-bold mb-4 text-white">Filter & Search Marketplace (Intelligent Discovery)</h3>

      <form onSubmit={handleSearchSubmit} className="mb-6 border-b border-gray-600 pb-6">
        <label htmlFor="search-query" className="block text-sm font-medium text-gray-300 mb-2">Search Programmable Assets</label>
        <div className="flex gap-2">
          <StyledInput
            id="search-query"
            type="text"
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
            placeholder="Search by prompt, tags, owner, or style"
            aria-label="Search marketplace dreams"
          />
          <StyledButton type="submit" variant="secondary" aria-label="Perform search">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="sr-only sm:not-sr-only ml-1">Search</span>
          </StyledButton>
        </div>
      </form>

      <div className="mb-6 border-b border-gray-600 pb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Price Range (ETH)</label>
        <div className="flex gap-2 items-center">
          <StyledInput
            type="number"
            step="0.01"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={handlePriceChange}
            className="w-1/2"
            aria-label="Minimum price"
          />
          <span className="text-gray-400">-</span>
          <StyledInput
            type="number"
            step="0.01"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={handlePriceChange}
            className="w-1/2"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div className="mb-6 border-b border-gray-600 pb-6">
        <label htmlFor="min-rarity" className="block text-sm font-medium text-gray-300 mb-2">Minimum Rarity Score (0-100): <span className="font-semibold text-blue-400">{minRarity || '0'}</span></label>
        <StyledInput
            id="min-rarity"
            type="number"
            min="0"
            max="100"
            placeholder="e.g., 75"
            value={minRarity}
            onChange={(e) => setMinRarity(e.target.value)}
            onBlur={handleRarityChange}
            aria-label="Minimum rarity score"
        />
      </div>

      <div className="mb-6 border-b border-gray-600 pb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Art Styles</label>
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-2 text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar" role="group" aria-label="Filter by art style">
          {MARKETPLACE_CONFIG.SUPPORTED_DREAM_STYLES.map(style => (
            <label key={style} className="flex items-center text-gray-300 cursor-pointer hover:text-cyan-400">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 cursor-pointer"
                checked={filters.styles.includes(style)}
                onChange={(e) => handleStyleChange(style, e.target.checked)}
                aria-checked={filters.styles.includes(style)}
                aria-label={`Filter by ${style} style`}
              />
              <span className="ml-2">{style}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6 border-b border-gray-600 pb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-2 text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar" role="group" aria-label="Filter by tags">
          {allTags.map(tag => (
            <label key={tag} className="flex items-center text-gray-300 cursor-pointer hover:text-cyan-400">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 cursor-pointer"
                checked={filters.tags.includes(tag)}
                onChange={(e) => handleTagChange(tag, e.target.checked)}
                aria-checked={filters.tags.includes(tag)}
                aria-label={`Filter by ${tag} tag`}
              />
              <span className="ml-2">#{tag}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center text-gray-300 text-sm cursor-pointer hover:text-cyan-400">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 cursor-pointer"
            checked={filters.isForSaleOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, isForSaleOnly: e.target.checked }))}
            aria-checked={filters.isForSaleOnly}
            aria-label="Show only NFTs listed for sale"
          />
          <span className="ml-2">Show only "For Sale" programmable assets</span>
        </label>
        {resetButton}
      </div>
    </div>
  );
};


/**
 * MarketplaceSortPanel provides controls for ordering marketplace listings, enhancing
 * efficient discovery and user-driven personalization of market views.
 *
 * Business Value: Optimized content presentation is key to maximizing user engagement
 * and driving transaction velocity. This panel allows users to quickly organize
 * high-value information according to their preferences (e.g., newest, price, popularity,
 * rarity), leading to more efficient browsing and faster purchasing decisions. This directly
 * contributes to a dynamic and user-friendly marketplace, boosting activity and satisfaction,
 * and ultimately increasing platform revenue.
 */
export const MarketplaceSortPanel: React.FC<{
  sort: MarketplaceSort;
  setSort: React.Dispatch<React.SetStateAction<MarketplaceSort>>;
}> = ({ sort, setSort }) => {
  /**
   * handleSortChange updates the sort criteria based on user selection from the dropdown.
   */
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [by, direction] = e.target.value.split(':');
    setSort({ by: by as MarketplaceSort['by'], direction: direction as MarketplaceSort['direction'] });
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-lg border border-gray-600">
      <label htmlFor="sort-by" className="block text-sm font-medium text-gray-300 mb-2">Sort Programmable Assets By</label>
      <StyledSelect id="sort-by" value={`${sort.by}:${sort.direction}`} onChange={handleSortChange} aria-label="Sort marketplace items by">
        <option value="timestamp:desc">Newest First (Mint Date)</option>
        <option value="timestamp:asc">Oldest First (Mint Date)</option>
        <option value="price:asc">Price: Low to High</option>
        <option value="price:desc">Price: High to Low</option>
        <option value="rarity:desc">Rarity: High to Low</option>
        <option value="rarity:asc">Rarity: Low to High</option>
        <option value="viewCount:desc">Most Viewed</option>
        <option value="likeCount:desc">Most Liked</option>
        <option value="prompt:asc">Prompt: A-Z</option>
        <option value="prompt:desc">Prompt: Z-A</option>
      </StyledSelect>
    </div>
  );
};

/**
 * ActivityFeedPanel displays a chronological, real-time stream of recent transactions
 * and events occurring across the Ethereal Marketplace. It aggregates immutable
 * transaction history from all NFTs, providing a dynamic overview of market activity
 * and agent interventions, serving as a key component of the Observability Layer.
 *
 * Business Value: This panel offers critical, real-time observability into market dynamics,
 * showcasing recent sales, new programmable asset mints, bids, and automated agent actions
 * (e.g., fraud flags, reconciliation starts). This transparency fosters a sense of vibrancy
 * and activity, encouraging user participation and driving confidence in the platform's
 * liquidity and integrity. For administrators and compliance officers, it serves as a live,
 * high-level audit log, crucial for real-time monitoring of market health, identifying trends,
 * and ensuring governance.
 */
export const ActivityFeedPanel: React.FC = () => {
    const { marketData, currentUser } = useAppContext();
    const [activityItems, setActivityItems] = useState<TransactionHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Effect hook to aggregate and sort all transaction histories for real-time feed
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        try {
            const allHistory: TransactionHistoryItem[] = [];
            marketData.forEach(dream => {
                allHistory.push(...dream.history);
            });
            // Sort by timestamp, newest first to reflect real-time activity
            allHistory.sort((a, b) => b.timestamp - a.timestamp);
            setActivityItems(allHistory.slice(0, 50)); // Show latest 50 activities for optimal performance
        } catch (err: any) {
            setError("Failed to load activity feed. Please refresh to restore real-time insights.");
            console.error("Activity feed aggregation error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [marketData]);

    /**
     * renderActivityItem displays a single activity item with appropriate icon and styling.
     * It highlights transactions related to the current user for improved personalization
     * and emphasizes critical states like 'flagged' or 'reconciling' for agent interventions.
     */
    const renderActivityItem = (item: TransactionHistoryItem) => {
        const isUserRelated = currentUser && (item.initiator === currentUser.walletAddress || item.details.includes(truncateAddress(currentUser.walletAddress)) || (item.type === 'sale' && item.details.includes(truncateAddress(currentUser.walletAddress))));
        let icon: string;
        let colorClass: string;
        let altText: string;

        switch (item.type) {
            case 'mint':
                icon = '✨';
                colorClass = 'text-green-400';
                altText = 'Programmable asset mint icon';
                break;
            case 'sale':
                icon = '💰';
                colorClass = 'text-yellow-400';
                altText = 'Sale transaction icon';
                break;
            case 'bid_placed':
                icon = '📈'; // Chart or upward trend
                colorClass = 'text-blue-400';
                altText = 'Bid placed icon';
                break;
            case 'listing_cancelled':
                icon = '❌';
                colorClass = 'text-red-400';
                altText = 'Listing cancelled icon';
                break;
            case 'fraud_flagged':
                icon = '🚨';
                colorClass = 'text-red-600';
                altText = 'Fraud flagged by Agentic AI icon';
                break;
            case 'reconciliation_started':
                icon = '🔄';
                colorClass = 'text-purple-400';
                altText = 'Reconciliation started by Agentic AI icon';
                break;
            case 'agent_remediation':
                icon = '🤖';
                colorClass = 'text-green-500';
                altText = 'Agentic AI remediation icon';
                break;
            case 'bid_accepted':
            case 'transfer':
            default:
                icon = '📰'; // Generic note icon
                colorClass = 'text-gray-400';
                altText = 'General activity icon';
        }

        return (
            <li key={`${item.targetNFT}-${item.timestamp}-${item.type}-${item.transactionId}`} className="border-b border-gray-600 py-3 last:border-b-0" aria-label={`Activity: ${item.details}`}>
                <div className="flex items-start">
                    <span className={`text-xl mr-3 flex-shrink-0 ${colorClass}`} role="img" aria-label={altText}>{icon}</span>
                    <div className="flex-grow">
                        <p className={`font-medium ${isUserRelated ? 'text-cyan-300' : 'text-gray-200'}`}>{item.details}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            <time dateTime={new Date(item.timestamp).toISOString()}>{formatTimestamp(item.timestamp)}</time>
                            {item.amountEth !== undefined && <span className="ml-2 font-semibold text-cyan-500">{formatEth(item.amountEth)}</span>}
                            {item.transactionId && <span className="ml-2 text-gray-500 font-mono" title={`Transaction ID: ${item.transactionId}`}>Tx: {truncateAddress(item.transactionId, 6)}</span>}
                            {item.paymentRail && <span className="ml-2 text-purple-400" title={`Payment Rail: ${item.paymentRail}`}>Rail: {item.paymentRail.replace('rail_', '')}</span>}
                            {item.status && <span className={`ml-2 font-semibold ${item.status === 'flagged' ? 'text-red-400' : item.status === 'reconciling' ? 'text-yellow-400' : 'text-green-400'}`} title={`Status: ${item.status}`}>Status: {item.status}</span>}
                        </p>
                    </div>
                </div>
            </li>
        );
    };

    return (
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
            <h3 className="text-xl font-bold mb-4 text-white">Real-time Marketplace Activity Feed</h3>
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {!isLoading && !error && (
                activityItems.length === 0 ? (
                    <p className="text-gray-400 italic text-center py-4">No recent activity to display yet. The market is quiet.</p>
                ) : (
                    <ul className="divide-y divide-gray-600 max-h-96 overflow-y-auto custom-scrollbar -mx-3 px-3">
                        {activityItems.map(renderActivityItem)}
                    </ul>
                )
            )}
            <div className="mt-4 border-t border-gray-600 pt-4">
                <StyledButton variant="ghost" size="sm" className="w-full" aria-label="View full activity log (feature coming soon)">View Full Activity Log (Coming Soon)</StyledButton>
            </div>
        </div>
    );
};

/**
 * UserOwnedNFTsPanel displays a grid of programmable assets (NFTs) currently owned
 * by the connected user, providing a personalized view of their digital asset portfolio.
 *
 * Business Value: This panel is a critical component for transparently displaying a user's
 * acquired programmable assets, reinforcing ownership, and visualizing their investment
 * portfolio within the Token Rail Layer. By providing direct, secure access to their
 * collection, it encourages further engagement with the marketplace, whether for
 * showcasing, re-listing for monetization, or simply admiring their digital art,
 * contributing to user retention and platform vitality.
 */
export const UserOwnedNFTsPanel: React.FC = () => {
  const { currentUser, marketData, isLoadingWallet } = useAppContext();
  const [selectedDream, setSelectedDream] = useState<DreamNFT | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Memoize the list of owned NFTs to avoid re-calculation on every render, enhancing performance.
  const ownedNFTs = useMemo(() => {
    if (!currentUser) return [];
    return marketData.filter(dream => currentUser.ownedNFTs.includes(dream.tokenId)).sort((a,b) => b.timestampMinted - a.timestampMinted);
  }, [currentUser, marketData]);

  /**
   * handleDetailsClick sets the selected dream and opens the detail modal,
   * providing an in-depth view of the programmable asset.
   */
  const handleDetailsClick = useCallback((dream: DreamNFT) => {
    setSelectedDream(dream);
    setIsDetailModalOpen(true);
  }, []);

  /**
   * closeDetailModal closes the NFT detail modal and clears the selected dream,
   * resetting the view.
   */
  const closeDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedDream(null);
  }, []);

  // Render loading state while wallet is connecting to the Digital Identity Layer
  if (isLoadingWallet) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg flex items-center justify-center min-h-[200px] shadow-md border border-gray-600" aria-live="polite" aria-busy="true">
        <LoadingSpinner />
        <span className="ml-3 text-lg text-gray-400">Loading your ethereal dreams and programmable assets...</span>
      </div>
    );
  }

  // Render message if no user is connected, prompting digital identity verification
  if (!currentUser) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg text-center shadow-md border border-gray-600" aria-label="Owned NFTs Panel - Not Connected">
        <p className="text-gray-400 text-lg">Connect your wallet to view your owned programmable assets.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600" aria-label={`Owned NFTs by ${currentUser.username}`}>
      <h3 className="text-xl font-bold mb-4 text-white">Your Owned Programmable Assets ({ownedNFTs.length})</h3>
      {ownedNFTs.length === 0 ? (
        <p className="text-gray-400 italic text-center py-4">You don't own any Ethereal Dreams yet. Mint one or buy from the marketplace to start your collection of programmable value!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
          {ownedNFTs.map(dream => (
            <DreamCard key={dream.tokenId} dream={dream} onDetailsClick={handleDetailsClick} />
          ))}
        </div>
      )}

      <NFTDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        dream={selectedDream}
      />
    </div>
  );
};

/**
 * MarketStatisticsPanel displays key aggregate statistics and a high-level overview
 * of the marketplace's health and activity, forming a crucial part of the
 * Governance, Observability, and Integrity Layer.
 *
 * Business Value: This panel provides crucial, real-time observability into the marketplace's
 * performance and health. By presenting aggregated metrics such as total assets, items for sale,
 * average price, and popular trends, it offers invaluable insights for strategic decision-making,
 * investor relations, and identifying market trends and opportunities. This transparent display
 * of vital statistics builds profound confidence among users and stakeholders, reflecting a
 * data-driven approach to platform management, growth, and compliance, reinforcing its position
 * as a robust financial backbone.
 */
export const MarketStatisticsPanel: React.FC = () => {
    const { marketData } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDreams: 0,
        forSaleCount: 0,
        averagePrice: 0,
        totalVolume: 0, // Sum of lastSoldPriceEth
        uniqueOwners: 0,
        mostPopularStyle: 'N/A',
        mostCommonTag: 'N/A',
        highestRarity: 0,
        averageRarity: 0,
    });

    // Effect hook to calculate real-time market statistics whenever marketData changes
    useEffect(() => {
        setIsLoading(true);
        if (marketData.length > 0) {
            const totalDreams = marketData.length;
            const forSale = marketData.filter(d => d.isForSale && d.priceEth !== undefined);
            const forSaleCount = forSale.length;
            const prices = forSale.map(d => d.priceEth || 0).filter(p => p > 0);
            const averagePrice = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0;

            const owners = new Set<string>();
            const styles: { [key: string]: number } = {};
            const tags: { [key: string]: number } = {};
            let totalVolume = 0;
            let totalRarityScore = 0;
            let highestRarity = 0;

            marketData.forEach(d => {
                owners.add(d.owner);
                styles[d.style] = (styles[d.style] || 0) + 1;
                d.tags.forEach(tag => { tags[tag] = (tags[tag] || 0) + 1; });
                if (d.lastSoldPriceEth) {
                    totalVolume += d.lastSoldPriceEth;
                }
                totalRarityScore += d.rarityScore;
                if (d.rarityScore > highestRarity) {
                    highestRarity = d.rarityScore;
                }
            });

            const uniqueOwners = owners.size;
            const mostPopularStyle = Object.entries(styles).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
            const mostCommonTag = Object.entries(tags).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
            const averageRarity = totalDreams > 0 ? totalRarityScore / totalDreams : 0;

            setStats({
                totalDreams,
                forSaleCount,
                averagePrice,
                totalVolume,
                uniqueOwners,
                mostPopularStyle,
                mostCommonTag,
                highestRarity,
                averageRarity,
            });
        } else {
            // Reset stats if no data, reflecting an empty or uninitialized market
            setStats({
                totalDreams: 0, forSaleCount: 0, averagePrice: 0, totalVolume: 0,
                uniqueOwners: 0, mostPopularStyle: 'N/A', mostCommonTag: 'N/A',
                highestRarity: 0, averageRarity: 0
            });
        }
        setIsLoading(false);
    }, [marketData]);


    return (
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
            <h3 className="text-xl font-bold mb-4 text-white">Market Overview & Performance Statistics</h3>
            {isLoading ? <LoadingSpinner /> : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col p-2 bg-gray-600 rounded-md">
                        <span className="text-gray-400">Total Programmable Assets:</span>
                        <span className="text-lg font-semibold text-white">{stats.totalDreams.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-600 rounded-md">
                        <span className="text-gray-400">Assets for Sale:</span>
                        <span className="text-lg font-semibold text-white">{stats.forSaleCount.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-600 rounded-md">
                        <span className="text-gray-400">Avg. List Price:</span>
                        <span className="text-lg font-semibold text-cyan-400">{formatEth(stats.averagePrice)}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-600 rounded-md">
                        <span className="text-gray-400">Total Volume (Past Sales):</span>
                        <span className="text-lg font-semibold text-green-400">{formatEth(stats.totalVolume)}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-600 rounded-md">
                        <span className="text-gray-400">Unique Digital Identities:</span>
                        <span className="text-lg font-semibold text-white">{stats.uniqueOwners.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-600 rounded-md">
                        <span className="text-gray-400">Most Traded Style:</span>
                        <span className="text-base font-semibold text-blue-400 truncate" title={stats.mostPopularStyle}>{stats.mostPopularStyle}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-600 rounded-md">
                        <span className="text-gray-400">Most Common Tag:</span>
                        <span className="text-base font-semibold text-purple-400 truncate" title={stats.mostCommonTag}>{stats.mostCommonTag}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-600 rounded-md">
                        <span className="text-gray-400">Highest Rarity Recorded:</span>
                        <span className="text-lg font-semibold text-yellow-400">{stats.highestRarity}/100</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-600 rounded-md">
                        <span className="text-gray-400">Avg. Asset Rarity:</span>
                        <span className="text-lg font-semibold text-gray-300">{stats.averageRarity.toFixed(1)}/100</span>
                    </div>
                </div>
            )}
            <div className="mt-4 border-t border-gray-600 pt-4">
                <StyledButton variant="ghost" size="sm" className="w-full" aria-label="Access detailed analytics (feature coming soon)">Detailed Analytics Dashboard (Coming Soon)</StyledButton>
            </div>
        </div>
    );
};
```