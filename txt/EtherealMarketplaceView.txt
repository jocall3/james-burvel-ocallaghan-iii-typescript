import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';

// --- Global Constants & Configuration (Mocked) ---
/**
 * @typedef {Object} MarketplaceConfig
 * @property {number} ITEMS_PER_PAGE - Number of NFT items to display per page in the marketplace.
 * @property {number} MINT_FEE_ETH - The cost in ETH to mint a new Dream NFT.
 * @property {number} ROYALTY_PERCENTAGE - The percentage of sale price that goes to the creator as royalty on secondary sales.
 * @property {number} MAX_PROMPT_LENGTH - Maximum character length allowed for a dream prompt.
 * @property {string[]} SUPPORTED_DREAM_STYLES - Array of artistic styles supported for dream generation.
 * @property {Array<{id: string, name: string, description: string}>} LICENSING_OPTIONS - Available licensing tiers for minted NFTs.
 * @property {number} DEFAULT_WALLET_BALANCE - Initial mock ETH balance for new users.
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
};

// --- Interfaces & Types ---

/**
 * @interface DreamNFT
 * @property {string} tokenId - Unique identifier for the NFT on the blockchain.
 * @property {string} prompt - The text prompt used to generate the dream.
 * @property {string} neuralPatternUrl - URL to the raw neural pattern data (high-resolution, if available).
 * @property {string} visualizationUrl - URL to the artistic visualization image of the dream.
 * @property {string} owner - Wallet address of the current owner.
 * @property {string} creator - Wallet address of the original minter.
 * @property {number | undefined} priceEth - Current listing price in ETH if the NFT is for sale.
 * @property {number | undefined} lastSoldPriceEth - The price at which the NFT was last sold.
 * @property {boolean} isForSale - True if the NFT is currently listed for sale.
 * @property {number} timestampMinted - Unix timestamp when the NFT was minted.
 * @property {string[]} tags - Keywords or categories describing the dream.
 * @property {string} style - The artistic style applied during dream generation.
 * @property {number} rarityScore - A simulated score indicating the rarity or uniqueness (0-100).
 * @property {'personal' | 'commercial_standard' | 'commercial_extended' | 'exclusive_full'} licensingOption - The licensing tier associated with the NFT.
 * @property {string | undefined} description - A detailed description of the dream.
 * @property {boolean} hasHighResAccess - Indicates if the owner has access to the high-resolution neural pattern.
 * @property {TransactionHistoryItem[]} history - Chronological list of major transactions related to the NFT.
 * @property {number} viewCount - Simulated number of times this NFT has been viewed.
 * @property {number} likeCount - Simulated number of likes this NFT has received.
 * @property {string[]} currentBidders - Mock list of addresses that have placed bids (simplified).
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
  history: TransactionHistoryItem[]; // Transaction history
  viewCount: number;
  likeCount: number;
  currentBidders: string[];
}

/**
 * @interface UserProfile
 * @property {string} walletAddress - The unique blockchain address of the user.
 * @property {string} username - User-chosen display name.
 * @property {string} profilePictureUrl - URL to the user's avatar or profile image.
 * @property {string} bio - A short description or introduction about the user.
 * @property {number} joinedTimestamp - Unix timestamp when the user joined the platform.
 * @property {string[]} ownedNFTs - Array of tokenId's owned by this user.
 * @property {string[]} favoriteNFTs - Array of tokenId's marked as favorites by this user.
 * @property {number} balanceEth - Current mock ETH balance of the user's wallet.
 * @property {{newBid: boolean, saleConfirmation: boolean, dreamMinted: boolean}} notificationSettings - User preferences for notifications.
 * @property {boolean} isVerified - Mock indicator for a verified user account.
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
}

/**
 * @interface Bid
 * @property {string} bidder - Wallet address of the bidder.
 * @property {number} amountEth - The amount of the bid in ETH.
 * @property {number} timestamp - Unix timestamp when the bid was placed.
 */
export interface Bid {
  bidder: string; // Wallet address
  amountEth: number;
  timestamp: number;
}

/**
 * @interface TransactionHistoryItem
 * @property {'mint' | 'sale' | 'bid_placed' | 'bid_accepted' | 'transfer' | 'listing_cancelled'} type - Type of transaction.
 * @property {number} timestamp - Unix timestamp of the transaction.
 * @property {string} initiator - Wallet address of the person initiating the action.
 * @property {string} targetNFT - Token ID of the NFT involved in the transaction.
 * @property {string} details - A human-readable description of the transaction.
 * @property {number | undefined} amountEth - Relevant monetary amount for sales/bids/mint fees.
 */
export interface TransactionHistoryItem {
  type: 'mint' | 'sale' | 'bid_placed' | 'bid_accepted' | 'transfer' | 'listing_cancelled';
  timestamp: number;
  initiator: string; // Wallet address of the person initiating the action
  targetNFT: string; // Token ID
  details: string; // e.g., "Minted by 0x...", "Sold for 1.2 ETH", "Bid of 0.8 ETH placed"
  amountEth?: number; // Relevant for sales/bids
}

/**
 * @interface MintRequestParams
 * @property {string} prompt - The user's input prompt for dream generation.
 * @property {string} style - Desired artistic style.
 * @property {'public' | 'private'} privacy - Visibility setting for the minted dream.
 * @property {'personal' | 'commercial_standard' | 'commercial_extended' | 'exclusive_full'} licensing - Selected licensing option.
 * @property {string[]} tags - Keywords for categorization.
 * @property {string} emotionTone - Desired emotional tone of the dream.
 * @property {number | undefined} complexityScore - An optional score indicating desired visual complexity.
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
 * @interface MarketplaceFilters
 * @property {[number, number]} priceRange - Min and max price for filtering.
 * @property {string[]} styles - Selected artistic styles to filter by.
 * @property {string[]} tags - Selected tags to filter by.
 * @property {string | undefined} owner - Wallet address to filter NFTs by owner.
 * @property {boolean} isForSaleOnly - If true, only show NFTs currently listed for sale.
 * @property {string} searchQuery - General search term for prompts, owners, tags.
 * @property {number | undefined} minRarity - Minimum rarity score.
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
 * @interface MarketplaceSort
 * @property {'price' | 'timestamp' | 'rarity' | 'prompt' | 'viewCount' | 'likeCount'} by - The attribute to sort by.
 * @property {'asc' | 'desc'} direction - Sorting direction (ascending or descending).
 */
export interface MarketplaceSort {
  by: 'price' | 'timestamp' | 'rarity' | 'prompt' | 'viewCount' | 'likeCount';
  direction: 'asc' | 'desc';
}

// --- Context for global state (mocked within this file) ---
/**
 * @interface AppContextType
 * @property {UserProfile | null} currentUser - The profile of the currently connected user. Null if not connected.
 * @property {React.Dispatch<React.SetStateAction<UserProfile | null>>} setCurrentUser - Setter for currentUser.
 * @property {() => Promise<UserProfile>} walletConnect - Function to simulate connecting a wallet and fetching/creating a user profile.
 * @property {() => void} walletDisconnect - Function to disconnect the current wallet.
 * @property {boolean} isLoadingWallet - True if a wallet connection is in progress.
 * @property {DreamNFT[]} marketData - Array of all DreamNFTs available in the marketplace.
 * @property {() => Promise<void>} fetchMarketData - Function to refresh all marketplace data.
 * @property {(tokenId: string, updates: Partial<DreamNFT>) => void} updateMarketItem - Updates a specific NFT in marketData.
 * @property {(nft: DreamNFT) => void} addMarketItem - Adds a new NFT to marketData.
 * @property {(tokenId: string) => void} removeMarketItem - Removes an NFT from marketData.
 * @property {UserProfile[]} userProfiles - Array of all known user profiles.
 * @property {(walletAddress: string, updates: Partial<UserProfile>) => void} updateUserProfile - Updates a specific user profile.
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Custom hook to access the AppContext.
 * Throws an error if used outside of an AppProvider.
 * @returns {AppContextType} The context value containing global state and actions.
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// --- Utility & Helper Functions ---

/**
 * Generates a random mock Ethereum wallet address.
 * @returns {string} A 42-character hexadecimal string starting with "0x".
 */
export const generateRandomWalletAddress = (): string => {
  return `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
};

/**
 * Formats an ETH amount to a fixed number of decimal places with "ETH" suffix.
 * @param {number} amount - The amount of ETH to format.
 * @returns {string} Formatted string, e.g., "1.2345 ETH".
 */
export const formatEth = (amount: number): string => `${amount.toFixed(4)} ETH`;

/**
 * Formats a Unix timestamp into a localized date and time string.
 * @param {number} timestamp - The Unix timestamp.
 * @returns {string} Formatted date/time string.
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

/**
 * Truncates a long wallet address for display purposes.
 * Shows the first few and last few characters with an ellipsis in between.
 * @param {string} address - The full wallet address.
 * @param {number} chars - Number of characters to show at the beginning and end.
 * @returns {string} Truncated address string.
 */
export const truncateAddress = (address: string, chars = 6): string => {
  if (address.length <= chars * 2 + 2) return address; // Already short enough
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};

/**
 * Generates a random set of tags from a predefined list.
 * @param {number} count - The number of tags to generate.
 * @returns {string[]} An array of random tags.
 */
export const generateRandomTags = (count: number): string[] => {
  const availableTags = ['dreamscape', 'ethereal', 'digitalart', 'surrealism', 'fantasy', 'abstract', 'nftart', 'blockchain', 'imagination', 'visionary', 'cyberpunk', 'nature', 'cityscape', 'futuristic', 'ancient', 'spiritual', 'cosmic', 'bioluminescent', 'gothic', 'steampunk', 'vaporwave', 'mythology', 'folklore', 'machinelearning'];
  const shuffled = availableTags.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, availableTags.length));
};

/**
 * Generates a mock DreamNFT object with random properties.
 * This function is central to populating the marketplace with synthetic data.
 * @param {string} ownerAddress - The wallet address of the NFT's owner.
 * @param {string} creatorAddress - The wallet address of the NFT's original creator (minter).
 * @param {string} [promptText] - Optional, specific prompt text for the dream. If not provided, a random one is generated.
 * @param {boolean} [isForSale=false] - Whether the NFT should initially be listed for sale.
 * @returns {DreamNFT} A fully formed mock DreamNFT object.
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
    },
  ];

  if (isForSale && priceEth) {
      initialHistory.push({
          type: 'sale',
          timestamp: timestamp + Math.floor(Math.random() * 3600 * 1000 * 24 * 7), // A few days after mint
          initiator: ownerAddress,
          targetNFT: tokenId,
          details: `Listed for sale by ${truncateAddress(ownerAddress)} for ${formatEth(priceEth)}`,
          amountEth: priceEth
      });
  }
  if (!isForSale && lastSoldPriceEth && Math.random() < 0.3) { // 30% chance for a past sale even if not currently for sale
      initialHistory.push({
          type: 'sale',
          timestamp: timestamp + Math.floor(Math.random() * 3600 * 1000 * 24 * 30),
          initiator: generateRandomWalletAddress(), // Mock buyer
          targetNFT: tokenId,
          details: `Sold previously for ${formatEth(lastSoldPriceEth)}`,
          amountEth: lastSoldPriceEth
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
    description: `This unique piece, "${style} Dream of ${generatedTags[0]}", was generated by the Ethereal Dream Engine on ${formatTimestamp(timestamp)}. It captures a profound subconscious narrative, visualized through advanced neural rendering. Its rarity score of ${rarityScore}/100 indicates its distinctive pattern complexity. This digital asset embodies the intersection of technology and imagination.`,
    hasHighResAccess: Math.random() > 0.3, // 70% chance of high-res access
    history: initialHistory,
    viewCount: Math.floor(Math.random() * 5000) + 100, // 100 to 5100 views
    likeCount: Math.floor(Math.random() * 1000) + 10, // 10 to 1010 likes
    currentBidders: [], // Dynamically updated by mock backend
  };
};

/**
 * Generates a mock UserProfile object with random data.
 * @param {string} [walletAddress] - Optional, specific wallet address for the user. If not provided, a random one is generated.
 * @returns {UserProfile} A fully formed mock UserProfile object.
 */
export const generateMockUserProfile = (walletAddress?: string): UserProfile => {
  const address = walletAddress || generateRandomWalletAddress();
  const username = `Dreamer_${Math.floor(Math.random() * 1000000)}`;
  const joinedTimestamp = Date.now() - Math.floor(Math.random() * 2 * 365 * 24 * 60 * 60 * 1000); // Up to 2 years ago
  const bioOptions = [
      `Passionate collector of digital dreams and neural patterns. Exploring the frontiers of subconscious artistry since ${new Date(joinedTimestamp).getFullYear()}.`,
      `A visionary artist in the ethereal realm. My collection reflects the deepest corners of imagination.`,
      `Curating a gallery of AI-generated wonders. Inspired by the nexus of art and technology.`,
      `Dedicated to the preservation and appreciation of digital consciousness. Follow my journey through the metaverse.`,
      `Seeker of rare patterns and unique styles. Always on the lookout for the next groundbreaking piece.`
  ];
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
  };
};

/**
 * Generates a large set of mock dreams and users for marketplace initialization.
 * This helps in creating a realistic initial state for the application.
 * @param {number} numDreams - The total number of mock DreamNFTs to generate.
 * @param {number} numUsers - The total number of mock UserProfiles to generate.
 * @returns {{users: {[address: string]: UserProfile}, dreams: {[tokenId: string]: DreamNFT}}} An object containing generated users and dreams.
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
                if (type === 'sale' && dream.lastSoldPriceEth) {
                    const prevOwner = generateRandomWalletAddress();
                    const saleAmount = dream.lastSoldPriceEth * (0.9 + Math.random() * 0.2); // +/- 10% from last sold
                    dream.history.push({
                        type: 'sale',
                        timestamp: dream.timestampMinted + (j + 1) * 3600 * 1000 * 24 * 30 * (0.5 + Math.random()), // Monthly sales
                        initiator: prevOwner,
                        targetNFT: dream.tokenId,
                        details: `Resold by ${truncateAddress(prevOwner)} for ${formatEth(saleAmount)}`,
                        amountEth: saleAmount
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
                        amountEth: bidAmount
                    });
                    dream.currentBidders.push(bidder); // Add to current bidders
                }
            }
        }
    }
    return { users: localUsers, dreams: localDreams };
};


// --- Mock API & Blockchain Interactions ---
/**
 * `mockBackend` simulates a server-side API and blockchain interaction.
 * It manages an in-memory store of users and dreams, providing asynchronous
 * methods for fetching, minting, selling, and buying NFTs. This allows the
 * frontend to function without a real backend or blockchain connection.
 * @namespace mockBackend
 */
export const mockBackend = (() => {
  const users: { [address: string]: UserProfile } = {};
  const dreams: { [tokenId: string]: DreamNFT } = {};

  /**
   * Initializes the mock backend with a predefined set of users and dreams.
   * This function populates the in-memory data store.
   */
  const init = () => {
    // Generate a robust set of mock data
    const { users: generatedUsers, dreams: generatedDreams } = generateManyMockDreamsAndUsers(500, 100); // 500 dreams, 100 users
    Object.assign(users, generatedUsers);
    Object.assign(dreams, generatedDreams);
  };

  init(); // Call init immediately to populate data on module load.

  return {
    /**
     * Simulates fetching all DreamNFTs from the marketplace.
     * Includes a delay to mimic network latency.
     * @returns {Promise<DreamNFT[]>} A promise that resolves to an array of all DreamNFTs, sorted by minting timestamp (newest first).
     */
    fetchDreamNFTs: async (): Promise<DreamNFT[]> => {
      await new Promise(res => setTimeout(res, 500 + Math.random() * 500)); // Simulate network delay
      return Object.values(dreams).sort((a, b) => b.timestampMinted - a.timestampMinted);
    },

    /**
     * Simulates fetching a single user's profile.
     * If the user doesn't exist, a new mock profile is created.
     * @param {string} address - The wallet address of the user.
     * @returns {Promise<UserProfile | null>} A promise that resolves to the UserProfile or null if an error occurs.
     */
    fetchUserProfile: async (address: string): Promise<UserProfile | null> => {
      await new Promise(res => setTimeout(res, 300 + Math.random() * 300));
      if (!users[address]) {
        users[address] = generateMockUserProfile(address); // Create if not exists
      }
      return users[address];
    },

    /**
     * Simulates updating a user's profile information.
     * @param {string} address - The wallet address of the user to update.
     * @param {Partial<UserProfile>} updates - An object containing the fields to update.
     * @returns {Promise<UserProfile>} A promise that resolves to the updated UserProfile.
     * @throws {Error} If the user is not found.
     */
    updateUserProfile: async (address: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
      await new Promise(res => setTimeout(res, 300));
      if (!users[address]) throw new Error("User not found for update operation.");
      users[address] = { ...users[address], ...updates };
      return users[address];
    },

    /**
     * Simulates the minting of a new DreamNFT on the blockchain.
     * Deducts the minting fee from the minter's balance.
     * @param {MintRequestParams} params - Parameters for minting the dream.
     * @param {string} minterAddress - The wallet address of the minter.
     * @returns {Promise<DreamNFT>} A promise that resolves to the newly minted DreamNFT.
     * @throws {Error} If the minter has insufficient funds.
     */
    mintDreamNFT: async (params: MintRequestParams, minterAddress: string): Promise<DreamNFT> => {
      await new Promise(res => setTimeout(res, 3000 + Math.random() * 2000)); // Longer for minting

      if (!users[minterAddress]) {
        users[minterAddress] = generateMockUserProfile(minterAddress);
      }

      if (users[minterAddress].balanceEth < MARKETPLACE_CONFIG.MINT_FEE_ETH) {
        throw new Error("Insufficient funds to mint dream. Please deposit more ETH.");
      }

      users[minterAddress].balanceEth = parseFloat((users[minterAddress].balanceEth - MARKETPLACE_CONFIG.MINT_FEE_ETH).toFixed(4));

      const newNFT = generateMockDreamNFT(minterAddress, minterAddress, params.prompt, false);
      newNFT.style = params.style;
      newNFT.tags = params.tags.slice(0, MARKETPLACE_CONFIG.MAX_TAGS_PER_NFT); // Enforce max tags
      newNFT.licensingOption = params.licensing;
      newNFT.description = `A freshly minted dream based on the prompt "${params.prompt}" with an emotional tone of '${params.emotionTone}'. This piece encapsulates a ${params.style.toLowerCase()} vision. Complexity score: ${params.complexityScore || 'N/A'}.`;
      newNFT.history.push({
        type: 'mint',
        timestamp: Date.now(),
        initiator: minterAddress,
        targetNFT: newNFT.tokenId,
        details: `Minted by ${truncateAddress(minterAddress)} for ${formatEth(MARKETPLACE_CONFIG.MINT_FEE_ETH)}`,
        amountEth: MARKETPLACE_CONFIG.MINT_FEE_ETH,
      });

      dreams[newNFT.tokenId] = newNFT;
      users[minterAddress].ownedNFTs.push(newNFT.tokenId);

      return newNFT;
    },

    /**
     * Simulates listing an NFT for sale on the marketplace.
     * @param {string} tokenId - The ID of the NFT to list.
     * @param {string} sellerAddress - The wallet address of the seller.
     * @param {number} priceEth - The asking price in ETH.
     * @returns {Promise<DreamNFT>} A promise that resolves to the updated DreamNFT.
     * @throws {Error} If the NFT is not found or not owned by the seller.
     */
    listNFTForSale: async (tokenId: string, sellerAddress: string, priceEth: number): Promise<DreamNFT> => {
      await new Promise(res => setTimeout(res, 1000));
      const dream = dreams[tokenId];
      if (!dream || dream.owner !== sellerAddress) {
        throw new Error("NFT not found or not owned by seller, cannot list for sale.");
      }
      if (priceEth <= 0) {
          throw new Error("Listing price must be a positive value.");
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
      });
      return dream;
    },

    /**
     * Simulates cancelling an NFT listing.
     * @param {string} tokenId - The ID of the NFT whose listing is to be cancelled.
     * @param {string} sellerAddress - The wallet address of the seller.
     * @returns {Promise<DreamNFT>} A promise that resolves to the updated DreamNFT.
     * @throws {Error} If the NFT is not found or not owned by the seller.
     */
    cancelListing: async (tokenId: string, sellerAddress: string): Promise<DreamNFT> => {
      await new Promise(res => setTimeout(res, 800));
      const dream = dreams[tokenId];
      if (!dream || dream.owner !== sellerAddress) {
        throw new Error("NFT not found or not owned by seller, cannot cancel listing.");
      }
      dream.isForSale = false;
      dream.priceEth = undefined;
      dream.history.push({
        type: 'listing_cancelled',
        timestamp: Date.now(),
        initiator: sellerAddress,
        targetNFT: tokenId,
        details: `Listing cancelled by ${truncateAddress(sellerAddress)}`,
      });
      return dream;
    },

    /**
     * Simulates buying an NFT directly from a listing.
     * Transfers funds and ownership, and applies royalties.
     * @param {string} tokenId - The ID of the NFT to buy.
     * @param {string} buyerAddress - The wallet address of the buyer.
     * @param {number} amountEth - The amount of ETH paid (must match listing price).
     * @returns {Promise<DreamNFT>} A promise that resolves to the updated DreamNFT.
     * @throws {Error} For various reasons like not for sale, insufficient funds, or buying own NFT.
     */
    buyNFT: async (tokenId: string, buyerAddress: string, amountEth: number): Promise<DreamNFT> => {
      await new Promise(res => setTimeout(res, 2500 + Math.random() * 1000));
      const dream = dreams[tokenId];
      if (!dream || !dream.isForSale || dream.priceEth === undefined || amountEth < dream.priceEth) {
        throw new Error("NFT not for sale, price mismatch, or insufficient amount offered.");
      }
      if (dream.owner === buyerAddress) {
        throw new Error("Cannot purchase your own NFT.");
      }
      if (!users[buyerAddress] || users[buyerAddress].balanceEth < amountEth) {
        throw new Error("Insufficient funds in your wallet to complete this purchase.");
      }

      const sellerAddress = dream.owner;
      if (!users[sellerAddress]) {
        users[sellerAddress] = generateMockUserProfile(sellerAddress); // Ensure seller profile exists
      }

      // Transfer funds and apply royalties
      const royaltyAmount = amountEth * (MARKETPLACE_CONFIG.ROYALTY_PERCENTAGE / 100);
      const sellerReceives = amountEth - royaltyAmount;

      users[buyerAddress].balanceEth = parseFloat((users[buyerAddress].balanceEth - amountEth).toFixed(4));
      users[sellerAddress].balanceEth = parseFloat((users[sellerAddress].balanceEth + sellerReceives).toFixed(4));

      // Creator royalty
      if (dream.creator !== sellerAddress && users[dream.creator]) {
        users[dream.creator].balanceEth = parseFloat((users[dream.creator].balanceEth + royaltyAmount).toFixed(4));
      } else if (dream.creator === sellerAddress) {
          // If seller is creator, they get both seller share and royalty (or royalty is already factored into their share)
          // For simplicity in mock, if seller is creator, just assume they get total amount - platform fee (not implemented)
      } else {
          // Mock royalty payment to a phantom creator if their profile doesn't exist
          // In a real system, this would go to the creator's wallet regardless of profile existence.
      }


      // Update ownership: Remove from seller, add to buyer
      const prevOwnerOwnedNFTs = users[sellerAddress].ownedNFTs.filter(id => id !== tokenId);
      users[sellerAddress].ownedNFTs = prevOwnerOwnedNFTs;

      if (!users[buyerAddress].ownedNFTs.includes(tokenId)) {
        users[buyerAddress].ownedNFTs.push(tokenId);
      }
      dream.owner = buyerAddress;
      dream.isForSale = false;
      dream.lastSoldPriceEth = amountEth;
      dream.priceEth = undefined; // No longer listed
      dream.currentBidders = []; // Clear bids after sale

      dream.history.push({
        type: 'sale',
        timestamp: Date.now(),
        initiator: buyerAddress,
        targetNFT: tokenId,
        details: `Purchased by ${truncateAddress(buyerAddress)} from ${truncateAddress(sellerAddress)} for ${formatEth(amountEth)}`,
        amountEth: amountEth,
      });

      return dream;
    },

    /**
     * Simulates placing a bid on an NFT.
     * @param {string} tokenId - The ID of the NFT to bid on.
     * @param {string} bidderAddress - The wallet address of the bidder.
     * @param {number} bidAmountEth - The amount of the bid in ETH.
     * @returns {Promise<DreamNFT>} A promise that resolves to the updated DreamNFT.
     * @throws {Error} For various reasons like NFT not found, not for sale, or insufficient funds.
     */
    placeBid: async (tokenId: string, bidderAddress: string, bidAmountEth: number): Promise<DreamNFT> => {
      await new Promise(res => setTimeout(res, 1500 + Math.random() * 500));
      const dream = dreams[tokenId];
      if (!dream) {
        throw new Error("NFT not found for bidding.");
      }
      if (!dream.isForSale) {
        throw new Error("NFT not currently listed for sale, cannot place a bid.");
      }
      if (bidderAddress === dream.owner) {
        throw new Error("Cannot bid on your own NFT.");
      }
      if (dream.priceEth && bidAmountEth < dream.priceEth * 0.5) { // Bid must be at least 50% of list price
          throw new Error("Bid amount is too low. Must be at least 50% of the current listing price for a valid offer.");
      }
      if (!users[bidderAddress] || users[bidderAddress].balanceEth < bidAmountEth) {
        throw new Error("Insufficient funds in your wallet to cover this bid. Please ensure you have enough ETH.");
      }

      // For simplicity, we just add to history and track current bidders.
      // A real auction system would manage highest bid, bid retractions, etc.
      dream.history.push({
          type: 'bid_placed',
          timestamp: Date.now(),
          initiator: bidderAddress,
          targetNFT: tokenId,
          details: `Bid of ${formatEth(bidAmountEth)} placed by ${truncateAddress(bidderAddress)}`,
          amountEth: bidAmountEth,
      });

      if (!dream.currentBidders.includes(bidderAddress)) {
          dream.currentBidders.push(bidderAddress);
      }

      return dream;
    },

    /**
     * Retrieves all user profiles stored in the mock backend.
     * @returns {Promise<UserProfile[]>} A promise that resolves to an array of all UserProfiles.
     */
    getAllUserProfiles: async (): Promise<UserProfile[]> => {
        await new Promise(res => setTimeout(res, 200));
        return Object.values(users);
    },

    /**
     * Simulates incrementing the view count for an NFT.
     * This would typically be handled by a analytics service in a real application.
     * @param {string} tokenId - The ID of the NFT to increment views for.
     */
    incrementViewCount: async (tokenId: string): Promise<void> => {
        // Minimal delay for this light operation
        await new Promise(res => setTimeout(res, 50));
        if (dreams[tokenId]) {
            dreams[tokenId].viewCount++;
        }
    },

    /**
     * Simulates a user liking an NFT.
     * @param {string} tokenId - The ID of the NFT to like.
     */
    likeNFT: async (tokenId: string): Promise<void> => {
        await new Promise(res => setTimeout(res, 100));
        if (dreams[tokenId]) {
            dreams[tokenId].likeCount++;
        }
    },

    /**
     * Simulates adding an NFT to a user's favorites.
     * @param {string} userAddress - The address of the user.
     * @param {string} tokenId - The ID of the NFT to favorite.
     */
    addFavoriteNFT: async (userAddress: string, tokenId: string): Promise<void> => {
        await new Promise(res => setTimeout(res, 100));
        if (users[userAddress] && !users[userAddress].favoriteNFTs.includes(tokenId)) {
            users[userAddress].favoriteNFTs.push(tokenId);
        }
    },

    /**
     * Simulates removing an NFT from a user's favorites.
     * @param {string} userAddress - The address of the user.
     * @param {string} tokenId - The ID of the NFT to unfavorite.
     */
    removeFavoriteNFT: async (userAddress: string, tokenId: string): Promise<void> => {
        await new Promise(res => setTimeout(res, 100));
        if (users[userAddress]) {
            users[userAddress].favoriteNFTs = users[userAddress].favoriteNFTs.filter(id => id !== tokenId);
        }
    },
  };
})();


// --- React Components (UI Building Blocks) ---

/**
 * A styled button component with predefined variants and sizes.
 * Provides consistent styling and handles disabled states.
 * @param {object} props - Component props, including standard button attributes and custom `variant`, `size`.
 * @returns {JSX.Element} The rendered button component.
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
 * A styled input component for text, numbers, etc.
 * Provides consistent styling and focus effects.
 * @param {object} props - Standard input HTML attributes.
 * @returns {JSX.Element} The rendered input component.
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
 * A styled textarea component for multi-line text input.
 * @param {object} props - Standard textarea HTML attributes.
 * @returns {JSX.Element} The rendered textarea component.
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
 * A styled select (dropdown) component.
 * @param {object} props - Standard select HTML attributes.
 * @returns {JSX.Element} The rendered select component.
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
 * A simple loading spinner component.
 * @returns {JSX.Element} The rendered loading spinner.
 */
export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
    <span className="sr-only">Loading...</span>
  </div>
);

/**
 * Displays an error message in a styled block.
 * @param {object} props - Component props.
 * @param {string} props.message - The error message to display.
 * @returns {JSX.Element} The rendered error message component.
 */
export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div role="alert" className="bg-red-900 text-red-200 p-3 rounded-lg mt-4 text-sm border border-red-700">
    <p className="font-semibold">Error:</p>
    <p>{message}</p>
  </div>
);

/**
 * Displays a success message in a styled block.
 * @param {object} props - Component props.
 * @param {string} props.message - The success message to display.
 * @returns {JSX.Element} The rendered success message component.
 */
export const SuccessMessage: React.FC<{ message: string }> = ({ message }) => (
  <div role="status" className="bg-green-900 text-green-200 p-3 rounded-lg mt-4 text-sm border border-green-700">
    <p className="font-semibold">Success:</p>
    <p>{message}</p>
  </div>
);

/**
 * A reusable modal component.
 * It provides a consistent overlay and content area for various dialogs.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {() => void} props.onClose - Function to call when the modal is requested to close.
 * @param {string} props.title - The title displayed at the top of the modal.
 * @param {React.ReactNode} props.children - The content to render inside the modal.
 * @returns {JSX.Element | null} The rendered modal or null if not open.
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
 * Component for displaying pagination controls.
 * @param {object} props - Component props.
 * @param {number} props.currentPage - The currently active page number.
 * @param {number} props.totalPages - The total number of pages available.
 * @param {(page: number) => void} props.onPageChange - Callback function for when a page changes.
 * @returns {JSX.Element} The rendered pagination controls.
 */
export const PaginationControls: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    const maxPagesToShow = 5; // e.g., 1 ... 4 5 6 ... 10
    if (totalPages <= maxPagesToShow + 2) { // +2 for edge cases of ellipses
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > maxPagesToShow / 2 + 1) pages.push('...');

      const startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2) + 1);
      const endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPagesToShow / 2) - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - maxPagesToShow / 2) pages.push('...');
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

// --- AppProvider (Wraps the entire application for context) ---
/**
 * `AppProvider` is a React Context Provider that manages and provides global
 * state and functions to all components within its tree. This centralizes
 * data management for the marketplace, including user authentication (mocked),
 * marketplace listings, and user profiles.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to be rendered within the provider's scope.
 * @returns {JSX.Element} The context provider component.
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [marketData, setMarketData] = useState<DreamNFT[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);

  /**
   * Fetches all market data (NFTs and user profiles) from the mock backend.
   * This function is crucial for initial data loading and refreshing the marketplace.
   */
  const fetchMarketData = useCallback(async () => {
    try {
      const data = await mockBackend.fetchDreamNFTs();
      setMarketData(data);
      const allUsers = await mockBackend.getAllUserProfiles();
      setUserProfiles(allUsers);
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      // In a real app, this would trigger a global error notification
    }
  }, []);

  /**
   * Simulates connecting a cryptocurrency wallet.
   * Generates a random wallet address and fetches/creates a corresponding user profile.
   * @returns {Promise<UserProfile>} A promise resolving to the connected user's profile.
   */
  const walletConnect = useCallback(async () => {
    setIsLoadingWallet(true);
    try {
      const address = generateRandomWalletAddress(); // Simulate connecting to a wallet
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
   * Disconnects the current user's wallet by clearing the `currentUser` state.
   */
  const walletDisconnect = useCallback(() => {
    setCurrentUser(null);
  }, []);

  /**
   * Updates a specific DreamNFT in the `marketData` state.
   * Used when an NFT's properties (e.g., price, owner, sale status) change.
   * @param {string} tokenId - The ID of the NFT to update.
   * @param {Partial<DreamNFT>} updates - An object containing partial updates for the NFT.
   */
  const updateMarketItem = useCallback((tokenId: string, updates: Partial<DreamNFT>) => {
    setMarketData(prev =>
      prev.map(nft => (nft.tokenId === tokenId ? { ...nft, ...updates } : nft))
    );
  }, []);

  /**
   * Adds a new DreamNFT to the `marketData` state.
   * Typically used after a successful minting operation.
   * @param {DreamNFT} nft - The new DreamNFT object to add.
   */
  const addMarketItem = useCallback((nft: DreamNFT) => {
    setMarketData(prev => [nft, ...prev]);
  }, []);

  /**
   * Removes a DreamNFT from the `marketData` state.
   * (Less common in a marketplace, but useful for moderation or specific scenarios).
   * @param {string} tokenId - The ID of the NFT to remove.
   */
  const removeMarketItem = useCallback((tokenId: string) => {
    setMarketData(prev => prev.filter(nft => nft.tokenId !== tokenId));
  }, []);

  /**
   * Updates a specific user profile in the `userProfiles` state, and also
   * updates `currentUser` if the updated profile belongs to the current user.
   * @param {string} walletAddress - The wallet address of the user whose profile is being updated.
   * @param {Partial<UserProfile>} updates - An object containing partial updates for the user profile.
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


// --- Feature Components (Reusable UI Blocks for the Marketplace View) ---

/**
 * Displays the current user's wallet information or a prompt to connect the wallet.
 * Includes user profile summary and options to edit or disconnect.
 * @returns {JSX.Element} The rendered wallet info panel.
 */
export const WalletInfoPanel: React.FC = () => {
  const { currentUser, walletConnect, walletDisconnect, isLoadingWallet } = useAppContext();
  const [profileEditOpen, setProfileEditOpen] = useState(false);

  // Render loading state while wallet connection is in progress
  if (isLoadingWallet) {
    return (
      <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center justify-center min-h-[150px] animate-pulse">
        <LoadingSpinner />
        <p className="mt-3 text-lg text-gray-300">Connecting Wallet securely...</p>
      </div>
    );
  }

  // Render prompt to connect wallet if no user is connected
  if (!currentUser) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg flex flex-col items-center shadow-md border border-gray-600">
        <p className="text-xl font-semibold mb-4 text-white">Connect your wallet</p>
        <p className="text-gray-400 text-center mb-6">Unlock full marketplace features: mint, buy, sell dreams.</p>
        <StyledButton onClick={walletConnect} size="lg" className="w-full sm:w-auto">
          Connect Wallet
        </StyledButton>
      </div>
    );
  }

  const ownedNFTCount = currentUser.ownedNFTs.length;

  // Render connected user's profile summary
  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
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
 * Modal component for editing the current user's profile.
 * Allows updating username and bio, interacting with `mockBackend` for persistence.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls modal visibility.
 * @param {() => void} props.onClose - Callback to close the modal.
 * @param {UserProfile} props.currentUser - The profile of the user being edited.
 * @returns {JSX.Element} The rendered edit profile modal.
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
   * Handles the form submission for profile updates.
   * Performs client-side validation, calls mock backend, and updates global state.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (!username.trim()) {
      setError("Username cannot be empty.");
      setLoading(false);
      return;
    }
    if (username.length > MARKETPLACE_CONFIG.MAX_USERNAME_LENGTH) {
        setError(`Username exceeds maximum length of ${MARKETPLACE_CONFIG.MAX_USERNAME_LENGTH} characters.`);
        setLoading(false);
        return;
    }
    if (!bio.trim()) {
        setError("Bio cannot be empty.");
        setLoading(false);
        return;
    }
    if (bio.length > MARKETPLACE_CONFIG.MAX_BIO_LENGTH) {
        setError(`Bio exceeds maximum length of ${MARKETPLACE_CONFIG.MAX_BIO_LENGTH} characters.`);
        setLoading(false);
        return;
    }

    try {
      await mockBackend.updateUserProfile(currentUser.walletAddress, { username, bio });
      updateUserProfile(currentUser.walletAddress, { username, bio }); // Update global context immediately
      await fetchMarketData(); // Re-fetch to ensure all user data is consistent
      setSuccess("Profile updated successfully!");
      // Optionally, onClose(); could be called here after a short delay
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
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
          <p id="username-help" className="text-xs text-gray-500 mt-1">Choose a unique display name (max {MARKETPLACE_CONFIG.MAX_USERNAME_LENGTH} characters).</p>
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">Bio <span className="text-red-400">*</span></label>
          <StyledTextarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about your passions, collection, or artistic vision..."
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
 * Modal component for minting a new Dream NFT.
 * Provides a form with various parameters for dream generation and licensing.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls modal visibility.
 * @param {() => void} props.onClose - Callback to close the modal.
 * @returns {JSX.Element} The rendered mint dream modal.
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
      setLicensing(MARKETPLACE_CONFIG.LICENSING_OPTIONS[0].id as MintRequestParams['licensing']);
      setTagsInput('');
      setEmotionTone('neutral');
      setComplexityScore(50);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  /**
   * Handles the form submission for minting a new dream.
   * Validates input, calls mock backend for minting, and updates global state.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Please connect your wallet to mint a dream NFT.");
      return;
    }
    if (!prompt.trim()) {
      setError("Dream prompt cannot be empty. Please describe your vision.");
      return;
    }
    if (prompt.length > MARKETPLACE_CONFIG.MAX_PROMPT_LENGTH) {
        setError(`Prompt exceeds maximum length of ${MARKETPLACE_CONFIG.MAX_PROMPT_LENGTH} characters. Please shorten your description.`);
        return;
    }

    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    if (tags.length > MARKETPLACE_CONFIG.MAX_TAGS_PER_NFT) {
        setError(`You can add a maximum of ${MARKETPLACE_CONFIG.MAX_TAGS_PER_NFT} tags. Please remove some.`);
        return;
    }

    setIsMinting(true);
    setError(null);
    setSuccess(null);

    try {
      const mintedDream = await mockBackend.mintDreamNFT({
        prompt, style, privacy, licensing, tags, emotionTone, complexityScore
      }, currentUser.walletAddress);
      addMarketItem(mintedDream); // Add new dream to local state immediately
      await fetchMarketData(); // Re-fetch all data to ensure balances and owned NFTs are updated
      setSuccess("Dream minted successfully! It's now in your collection.");
      // onClose(); // Optionally close modal after success
    } catch (err: any) {
      console.error("Minting error:", err);
      setError(err.message || "Failed to mint dream. An unknown error occurred.");
      if (err.message.includes("Insufficient funds")) {
          setError(`${err.message} Please ensure your wallet has ${formatEth(MARKETPLACE_CONFIG.MINT_FEE_ETH)} to cover the minting fee.`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  const currentTagsCount = tagsInput.split(',').filter(t => t.trim() !== '').length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mint a New Ethereal Dream NFT">
      <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="mint-dream-form-title">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">Dream Prompt <span className="text-red-400">*</span></label>
          <StyledTextarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the dream you wish to materialize (e.g., 'A bioluminescent forest under twin moons')"
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
            <StyledSelect id="emotionTone" value={emotionTone} onChange={(e) => setEmotionTone(e.target.value)} aria-label="Select emotional tone">
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
            aria-label={`Set visual complexity to ${complexityScore}`}
          />
          <p className="text-xs text-gray-500 mt-1">Lower scores for simpler designs, higher for more intricate details.</p>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">Tags (comma-separated, max {MARKETPLACE_CONFIG.MAX_TAGS_PER_NFT})</label>
          <StyledInput
            id="tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g., fantasy, nature, abstract, space"
            aria-describedby="tags-info"
          />
          <p id="tags-info" className="text-xs text-gray-400 mt-1">{currentTagsCount}/{MARKETPLACE_CONFIG.MAX_TAGS_PER_NFT} tags entered</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="privacy" className="block text-sm font-medium text-gray-300 mb-1">Privacy</label>
            <StyledSelect id="privacy" value={privacy} onChange={(e) => setPrivacy(e.target.value as 'public' | 'private')} aria-label="Select dream privacy setting">
              <option value="public">Public (Visible to all on marketplace)</option>
              <option value="private">Private (Only visible to owner, not listed publicly)</option>
            </StyledSelect>
            <p className="text-xs text-gray-500 mt-1">Private dreams can be shared later, but aren't initially listed on the public marketplace.</p>
          </div>
          <div>
            <label htmlFor="licensing" className="block text-sm font-medium text-gray-300 mb-1">Licensing</label>
            <StyledSelect id="licensing" value={licensing} onChange={(e) => setLicensing(e.target.value as MintRequestParams['licensing'])} aria-label="Select licensing option">
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
            <p className="text-sm text-gray-300 font-semibold">Minting Fee: <span className="text-cyan-400">{formatEth(MARKETPLACE_CONFIG.MINT_FEE_ETH)}</span></p>
            {currentUser && (
                <p className="text-xs text-gray-400">Your current balance: <span className="text-cyan-400">{formatEth(currentUser.balanceEth)}</span>
                {currentUser.balanceEth < MARKETPLACE_CONFIG.MINT_FEE_ETH && <span className="text-red-400 ml-2 font-bold"> (Insufficient funds!)</span>}
                </p>
            )}
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <div className="flex justify-end space-x-2 pt-2 border-t border-gray-700 mt-6">
          <StyledButton type="button" variant="secondary" onClick={onClose} disabled={isMinting} aria-label="Cancel minting process">
            Cancel
          </StyledButton>
          <StyledButton type="submit" disabled={isMinting || !currentUser || currentUser.balanceEth < MARKETPLACE_CONFIG.MINT_FEE_ETH} aria-label="Mint your dream as an NFT">
            {isMinting ? <LoadingSpinner /> : 'Mint Dream as NFT'}
          </StyledButton>
        </div>
      </form>
    </Modal>
  );
};


/**
 * Displays a single Dream NFT as a card in a grid layout.
 * Provides a visual summary and an action to view details.
 * @param {object} props - Component props.
 * @param {DreamNFT} props.dream - The DreamNFT object to display.
 * @param {(dream: DreamNFT) => void} props.onDetailsClick - Callback for when the details button is clicked.
 * @returns {JSX.Element} The rendered dream card.
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
 * Modal component for displaying detailed information about a selected NFT.
 * Includes transaction history, and actions like buy, bid, list for sale, or cancel listing.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls modal visibility.
 * @param {() => void} props.onClose - Callback to close the modal.
 * @param {DreamNFT | null} props.dream - The DreamNFT object whose details are to be displayed. Null if no dream is selected.
 * @returns {JSX.Element | null} The rendered NFT detail modal or null if no dream is provided.
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

      // Increment view count for the dream if it's opened
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
  const highestBid = dream.history
      .filter(item => item.type === 'bid_placed' && item.amountEth !== undefined)
      .reduce((max, item) => Math.max(max, item.amountEth!), 0);
  const currentHighestBid = dream.currentBidders.length > 0
    ? dream.history
        .filter(item => item.type === 'bid_placed' && dream.currentBidders.includes(item.initiator))
        .reduce((max, item) => Math.max(max, item.amountEth || 0), 0)
    : 0;


  /**
   * Handles the direct purchase of an NFT.
   * @async
   */
  const handleBuyNow = async () => {
    if (!currentUser) {
      setError("Please connect your wallet to buy this NFT.");
      return;
    }
    if (!dream.isForSale || dream.priceEth === undefined) {
      setError("This NFT is not currently listed for sale.");
      return;
    }
    if (currentUser.balanceEth < dream.priceEth) {
      setError(`Insufficient funds. Your wallet balance is ${formatEth(currentUser.balanceEth)}, but you need ${formatEth(dream.priceEth)}.`);
      return;
    }

    setIsBuying(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedDream = await mockBackend.buyNFT(dream.tokenId, currentUser.walletAddress, dream.priceEth);
      updateMarketItem(dream.tokenId, updatedDream);
      await fetchMarketData(); // Re-fetch all data to update balances and owned NFTs
      setSuccess(`Successfully purchased "${dream.prompt}" for ${formatEth(dream.priceEth)}! It's now in your collection.`);
      // onClose(); // Optionally close after successful transaction
    } catch (err: any) {
      console.error("Buy NFT error:", err);
      setError(err.message || "Failed to complete purchase. Please try again.");
    } finally {
      setIsBuying(false);
    }
  };

  /**
   * Handles placing a bid on an NFT.
   * @param {React.FormEvent} e - The form submission event.
   * @async
   */
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Please connect your wallet to place a bid.");
      return;
    }
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid bid amount (e.g., 0.5 ETH).");
      return;
    }
    if (currentUser.balanceEth < amount) {
      setError(`Insufficient funds. Your wallet balance is ${formatEth(currentUser.balanceEth)}, but you need ${formatEth(amount)} to cover this bid.`);
      return;
    }
    if (dream.priceEth && amount < dream.priceEth * 0.5) { // Bid must be at least 50% of list price
        setError(`Bid is too low. Must be at least 50% of current listing price (${formatEth(dream.priceEth * 0.5)}).`);
        return;
    }
    if (amount <= currentHighestBid) {
        setError(`Your bid must be higher than the current highest bid of ${formatEth(currentHighestBid)}.`);
        return;
    }

    setIsPlacingBid(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedDream = await mockBackend.placeBid(dream.tokenId, currentUser.walletAddress, amount);
      updateMarketItem(dream.tokenId, updatedDream);
      await fetchMarketData(); // Re-fetch to update all relevant data globally
      setSuccess(`Your bid of ${formatEth(amount)} has been successfully placed!`);
      setBidAmount(''); // Clear bid input
    } catch (err: any) {
      console.error("Place bid error:", err);
      setError(err.message || "Failed to place bid. An unexpected error occurred.");
    } finally {
      setIsPlacingBid(false);
    }
  };

  /**
   * Handles listing the current user's NFT for sale.
   * @async
   */
  const handleListForSale = async () => {
    if (!currentUser || currentUser.walletAddress !== dream.owner) {
        setError("You must be the owner of this NFT to list it for sale.");
        return;
    }
    const price = parseFloat(listPrice);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid listing price greater than 0 ETH.");
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
      setError(err.message || "Failed to list NFT for sale. Please verify details.");
    } finally {
      setIsListing(false);
    }
  };

  /**
   * Handles cancelling the current user's NFT listing.
   * @async
   */
  const handleCancelListing = async () => {
    if (!currentUser || currentUser.walletAddress !== dream.owner) {
        setError("You must be the owner of this NFT to cancel its listing.");
        return;
    }
    if (!dream.isForSale) {
        setError("This NFT is not currently listed for sale.");
        return;
    }

    setIsCancelling(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedDream = await mockBackend.cancelListing(dream.tokenId, currentUser.walletAddress);
      updateMarketItem(dream.tokenId, updatedDream);
      await fetchMarketData();
      setSuccess("Listing successfully cancelled!");
    } catch (err: any) {
      console.error("Cancel listing error:", err);
      setError(err.message || "Failed to cancel listing. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  /**
   * Handles the 'Like' action for an NFT.
   * @async
   */
  const handleLikeNFT = async () => {
      if (!currentUser) {
          setError("Please connect your wallet to like NFTs.");
          return;
      }
      try {
          await mockBackend.likeNFT(dream.tokenId);
          updateMarketItem(dream.tokenId, { likeCount: (dream.likeCount || 0) + 1 });
      } catch (err) {
          console.error("Error liking NFT:", err);
      }
  };

  /**
   * Handles adding/removing an NFT from user favorites.
   * @async
   */
  const handleToggleFavorite = async () => {
    if (!currentUser) {
        setError("Please connect your wallet to manage favorites.");
        return;
    }
    try {
        const isCurrentlyFavorite = currentUser.favoriteNFTs.includes(dream.tokenId);
        if (isCurrentlyFavorite) {
            await mockBackend.removeFavoriteNFT(currentUser.walletAddress, dream.tokenId);
            updateUserProfile(currentUser.walletAddress, { favoriteNFTs: currentUser.favoriteNFTs.filter(id => id !== dream.tokenId) });
        } else {
            await mockBackend.addFavoriteNFT(currentUser.walletAddress, dream.tokenId);
            updateUserProfile(currentUser.walletAddress, { favoriteNFTs: [...currentUser.favoriteNFTs, dream.tokenId] });
        }
    } catch (err) {
        console.error("Error toggling favorite:", err);
        setError("Failed to update favorites.");
    }
  };


  const isFavorite = currentUser?.favoriteNFTs.includes(dream.tokenId);

  const getLicensingDescription = (id: string) => MARKETPLACE_CONFIG.LICENSING_OPTIONS.find(opt => opt.id === id)?.description || 'N/A';
  const getLicensingName = (id: string) => MARKETPLACE_CONFIG.LICENSING_OPTIONS.find(opt => opt.id === id)?.name || 'Unknown License';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Dream Details: ${dream.prompt}`}>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 flex flex-col items-center">
          <img src={dream.visualizationUrl} alt={`Visualization of ${dream.prompt}`} className="w-full max-w-md rounded-lg shadow-md mb-4 border border-gray-600" />
          <div className="text-center w-full">
            <h4 className="text-xl font-bold text-white mb-2">{dream.prompt}</h4>
            <p className="text-gray-400 text-sm mb-4 italic max-h-32 overflow-y-auto custom-scrollbar">{dream.description || "No description provided for this dream."}</p>
            <div className="flex justify-center space-x-4 mb-4 text-gray-300">
                <span className="flex items-center" title="View Count">
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
          <h4 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2 text-white">NFT Information</h4>
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
                    Download Raw Neural Pattern Data (.bin)
                </a>
            )}
          </div>

          <h4 className="text-lg font-semibold mt-4 mb-3 border-b border-gray-700 pb-2 text-white">Market Interactions</h4>
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
                  <p className="text-md text-gray-300 mt-3">This is your dream currently listed for sale.</p>
                  <StyledButton variant="danger" onClick={handleCancelListing} disabled={isCancelling} className="w-full mt-3">
                    {isCancelling ? <LoadingSpinner /> : 'Cancel Listing'}
                  </StyledButton>
                </>
              ) : (
                <>
                  <StyledButton onClick={handleBuyNow} disabled={isBuying || !currentUser || currentUser.balanceEth < (dream.priceEth || 0)} className="w-full mt-3">
                    {isBuying ? <LoadingSpinner /> : 'Buy Now'}
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
                      disabled={isPlacingBid || !currentUser}
                      aria-label="Enter bid amount"
                    />
                    <StyledButton type="submit" disabled={isPlacingBid || !currentUser || parseFloat(bidAmount || '0') <= 0 || (currentUser && currentUser.balanceEth < parseFloat(bidAmount || '0'))}>
                      {isPlacingBid ? <LoadingSpinner /> : 'Submit Bid'}
                    </StyledButton>
                  </form>
                  {!currentUser && <p className="text-red-400 text-xs mt-2">Connect your wallet to enable buying and bidding.</p>}
                </>
              )}
            </div>
          ) : (
            !isOwner && <p className="text-md font-semibold text-gray-400 bg-gray-700 p-4 rounded-lg border border-gray-600 mb-4">This dream is not currently listed for sale.</p>
          )}

          {!dream.isForSale && isOwner && (
            <div className="bg-gray-700 p-4 rounded-lg mb-4 border border-gray-600">
              <p className="text-md text-gray-300 mb-3">Your dream is not currently listed for sale.</p>
              <div className="flex flex-col space-y-2">
                <label htmlFor="list-price" className="text-sm font-medium text-gray-300">List for Sale:</label>
                <StyledInput
                  id="list-price"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  placeholder="e.g., 1.2 ETH"
                  disabled={isListing}
                  aria-label="Enter listing price in ETH"
                />
                <StyledButton onClick={handleListForSale} disabled={isListing || parseFloat(listPrice || '0') <= 0} className="w-full">
                  {isListing ? <LoadingSpinner /> : 'List NFT'}
                </StyledButton>
              </div>
            </div>
          )}

          {dream.lastSoldPriceEth !== undefined && (
            <p className="text-sm text-gray-400 mt-2">Last Sold: <span className="font-semibold text-green-400">{formatEth(dream.lastSoldPriceEth)}</span></p>
          )}

          <h4 className="text-lg font-semibold mt-6 mb-3 border-b border-gray-700 pb-2 text-white">Transaction History</h4>
          <div className="flex-grow max-h-60 overflow-y-auto custom-scrollbar bg-gray-700 p-3 rounded-lg border border-gray-600">
            {dream.history.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No transaction history found for this NFT.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {dream.history.slice().reverse().map((item, index) => ( // Reverse to show latest first
                  <li key={index} className="border-b border-gray-600 pb-2 last:border-b-0 last:pb-0">
                    <p className="font-medium text-gray-200">{item.details}</p>
                    <p className="text-xs text-gray-500">{formatTimestamp(item.timestamp)}</p>
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
 * Panel component for applying filters to the marketplace listings.
 * Includes search, price range, style, and tag filters.
 * @param {object} props - Component props.
 * @param {MarketplaceFilters} props.filters - Current filter settings.
 * @param {React.Dispatch<React.SetStateAction<MarketplaceFilters>>} props.setFilters - Setter for filter settings.
 * @param {(query: string) => void} props.onSearch - Callback for when a search is performed.
 * @param {string[]} props.allTags - Array of all available tags for filtering.
 * @returns {JSX.Element} The rendered filters panel.
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
   * Handles changes to the price range input fields.
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
   * Handles changes to the minimum rarity input field.
   */
  const handleRarityChange = useCallback(() => {
    const rarity = parseInt(minRarity || '0');
    setFilters(prev => ({
      ...prev,
      minRarity: isNaN(rarity) || rarity < 0 ? undefined : Math.min(rarity, 100)
    }));
  }, [minRarity, setFilters]);

  /**
   * Handles changes to the style filter checkboxes.
   * @param {string} style - The style being toggled.
   * @param {boolean} isChecked - Whether the checkbox is checked.
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
   * Handles changes to the tag filter checkboxes.
   * @param {string} tag - The tag being toggled.
   * @param {boolean} isChecked - Whether the checkbox is checked.
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
   * Handles the submission of the search query.
   * @param {React.FormEvent} e - The form submission event.
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
      <h3 className="text-xl font-bold mb-4 text-white">Filter & Search Marketplace</h3>

      <form onSubmit={handleSearchSubmit} className="mb-6 border-b border-gray-600 pb-6">
        <label htmlFor="search-query" className="block text-sm font-medium text-gray-300 mb-2">Search Dreams</label>
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
        <label className="block text-sm font-medium text-gray-300 mb-2">Styles</label>
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
          <span className="ml-2">Show only "For Sale"</span>
        </label>
        {resetButton}
      </div>
    </div>
  );
};


/**
 * Panel component for sorting marketplace listings.
 * @param {object} props - Component props.
 * @param {MarketplaceSort} props.sort - Current sort settings.
 * @param {React.Dispatch<React.SetStateAction<MarketplaceSort>>} props.setSort - Setter for sort settings.
 * @returns {JSX.Element} The rendered sort panel.
 */
export const MarketplaceSortPanel: React.FC<{
  sort: MarketplaceSort;
  setSort: React.Dispatch<React.SetStateAction<MarketplaceSort>>;
}> = ({ sort, setSort }) => {
  /**
   * Handles changes to the sort dropdown.
   * Parses the selected value to update sort criteria.
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event from the select element.
   */
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [by, direction] = e.target.value.split(':');
    setSort({ by: by as MarketplaceSort['by'], direction: direction as MarketplaceSort['direction'] });
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-lg border border-gray-600">
      <label htmlFor="sort-by" className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
      <StyledSelect id="sort-by" value={`${sort.by}:${sort.direction}`} onChange={handleSortChange} aria-label="Sort marketplace items by">
        <option value="timestamp:desc">Newest First</option>
        <option value="timestamp:asc">Oldest First</option>
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
 * Displays a panel showing recent activity across the marketplace.
 * Aggregates transaction history from all NFTs.
 * @returns {JSX.Element} The rendered activity feed panel.
 */
export const ActivityFeedPanel: React.FC = () => {
    const { marketData, currentUser } = useAppContext();
    const [activityItems, setActivityItems] = useState<TransactionHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Effect hook to aggregate and sort all transaction histories
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        try {
            const allHistory: TransactionHistoryItem[] = [];
            marketData.forEach(dream => {
                allHistory.push(...dream.history);
            });
            // Sort by timestamp, newest first
            allHistory.sort((a, b) => b.timestamp - a.timestamp);
            setActivityItems(allHistory.slice(0, 50)); // Show latest 50 activities for performance
        } catch (err: any) {
            setError("Failed to load activity feed. Please refresh.");
            console.error("Activity feed aggregation error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [marketData]);

    /**
     * Renders a single activity item with appropriate icon and styling.
     * @param {TransactionHistoryItem} item - The transaction history item to render.
     * @returns {JSX.Element} The rendered list item for activity feed.
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
                altText = 'Mint icon';
                break;
            case 'sale':
                icon = '💰';
                colorClass = 'text-yellow-400';
                altText = 'Sale icon';
                break;
            case 'bid_placed':
                icon = '📈'; // Chart or upward trend
                colorClass = 'text-blue-400';
                altText = 'Bid icon';
                break;
            case 'listing_cancelled':
                icon = '❌';
                colorClass = 'text-red-400';
                altText = 'Listing cancelled icon';
                break;
            case 'bid_accepted': // Not explicitly used but good for future
            case 'transfer': // Not explicitly used but good for future
            default:
                icon = '📝'; // Generic note icon
                colorClass = 'text-gray-400';
                altText = 'Activity icon';
        }

        return (
            <li key={`${item.targetNFT}-${item.timestamp}-${item.type}`} className="border-b border-gray-600 py-3 last:border-b-0" aria-label={`Activity: ${item.details}`}>
                <div className="flex items-start">
                    <span className={`text-xl mr-3 flex-shrink-0 ${colorClass}`} role="img" aria-label={altText}>{icon}</span>
                    <div className="flex-grow">
                        <p className={`font-medium ${isUserRelated ? 'text-cyan-300' : 'text-gray-200'}`}>{item.details}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            <time dateTime={new Date(item.timestamp).toISOString()}>{formatTimestamp(item.timestamp)}</time>
                            {item.amountEth !== undefined && <span className="ml-2 font-semibold text-cyan-500">{formatEth(item.amountEth)}</span>}
                        </p>
                    </div>
                </div>
            </li>
        );
    };

    return (
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
            <h3 className="text-xl font-bold mb-4 text-white">Recent Marketplace Activity</h3>
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {!isLoading && !error && (
                activityItems.length === 0 ? (
                    <p className="text-gray-400 italic text-center py-4">No recent activity to display yet.</p>
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
 * Displays a grid of NFTs owned by the current user.
 * @returns {JSX.Element} The rendered user owned NFTs panel.
 */
export const UserOwnedNFTsPanel: React.FC = () => {
  const { currentUser, marketData, isLoadingWallet } = useAppContext();
  const [selectedDream, setSelectedDream] = useState<DreamNFT | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Memoize the list of owned NFTs to avoid re-calculation on every render
  const ownedNFTs = useMemo(() => {
    if (!currentUser) return [];
    return marketData.filter(dream => currentUser.ownedNFTs.includes(dream.tokenId)).sort((a,b) => b.timestampMinted - a.timestampMinted);
  }, [currentUser, marketData]);

  /**
   * Handles clicking on a dream card to view its details in a modal.
   * @param {DreamNFT} dream - The dream NFT selected for details view.
   */
  const handleDetailsClick = useCallback((dream: DreamNFT) => {
    setSelectedDream(dream);
    setIsDetailModalOpen(true);
  }, []);

  /**
   * Closes the NFT detail modal and clears the selected dream.
   */
  const closeDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedDream(null);
  }, []);

  // Render loading state while wallet is connecting
  if (isLoadingWallet) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg flex items-center justify-center min-h-[200px] shadow-md border border-gray-600">
        <LoadingSpinner />
        <span className="ml-3 text-lg text-gray-400">Loading your ethereal dreams...</span>
      </div>
    );
  }

  // Render message if no user is connected
  if (!currentUser) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg text-center shadow-md border border-gray-600">
        <p className="text-gray-400 text-lg">Connect your wallet to view your owned dreams.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
      <h3 className="text-xl font-bold mb-4 text-white">Your Owned Dreams ({ownedNFTs.length})</h3>
      {ownedNFTs.length === 0 ? (
        <p className="text-gray-400 italic text-center py-4">You don't own any Ethereal Dreams yet. Mint one or buy from the marketplace to start your collection!</p>
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
 * Displays key statistics and overview of the marketplace.
 * Calculates metrics like total dreams, items for sale, average price, etc.
 * @returns {JSX.Element} The rendered market statistics panel.
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

    // Effect hook to calculate market statistics whenever marketData changes
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
            // Reset stats if no data
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
            <h3 className="text-xl font-bold mb-4 text-white">Market Overview & Statistics</h3>
            {isLoading ? <LoadingSpinner /> : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col p-2 bg-gray-600 rounded-md">
                        <span className="text-gray-400">Total Dreams:</span>
                        <span className="text-lg font-semibold text-white">{stats.totalDreams.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-600 rounded-md">
                        <span className="text-gray-400">Dreams for Sale:</span>
                        <span className="text-lg font-semibold text-white">{stats.forSaleCount.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-6