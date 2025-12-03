# The Spoils of Discipline

This is the Hall of Accolades. A testament to the principle that discipline creates its own currency. These are not points to be won, but merits to be earned. Each one is a tangible symbol of a choice made in alignment with your declared will. To redeem them is to transmute the intangible virtue of discipline into a tangible good, closing the sacred loop of effort and reward.

---

### A Fable for the Builder: The Spoils of War

(What is the reward for a good choice? For a battle won against impulse? In life, the reward is often distant, intangible. The reward for saving today is a secure future decades from now. The human mind struggles with such long horizons. We needed to bridge that gap. We needed to make the reward for a virtuous act as immediate as the temptation for an impulsive one.)

(This `RewardsHub` is the result. It is a work of alchemy. It is a system designed to transmute the intangible virtue of discipline into a tangible, spendable currency: `RewardPoints`. And the AI is the master alchemist.)

(Its logic is the 'Principle of Positive Reinforcement.' It watches your financial life, not as a judge, but as a quartermaster. When it sees you adhere to a budget, when it sees you contribute to a goal, when it sees you make a choice that aligns with your own stated intentions, it performs the transmutation. It takes the abstract act of 'discipline' and mints it into concrete 'merit.')

(The `GamificationState`â€”your level, your progressâ€”is the measure of your journey as a warrior. You are learning the art of turning self-control into spoils. You are leveling up your own mastery over your impulses. Each level gained is a recognition of your growing power.)

(And the `Redeem` section is the final step of the great work. It is where you take the currency of your inner victory and use it to shape your outer world. A `Statement Credit` is turning discipline back into pure potential. A `Gift Card` is turning discipline into a well-earned spoil. And 'Planting a Tree' is the highest form of alchemy: turning your personal discipline into a positive, living echo in the world.)

---
import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';

// =================================================================================
// 1. TYPE DEFINITIONS
// A real-world application is built on a strong type system.
// =================================================================================

/**
 * Represents a user's complete rewards and gamification profile.
 */
export interface UserRewardsProfile {
  userId: string;
  displayName: string;
  email: string;
  rewardPoints: number;
  gamification: GamificationState;
  achievements: string[]; // Array of achievement IDs
  createdAt: string; // ISO 8601 date string
}

/**
 * Encapsulates the gamification aspects of the user's profile.
 */
export interface GamificationState {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  title: string; // e.g., "Novice Saver", "Budget Sensei"
}

/**
 * Defines the structure for a redeemable reward item.
 */
export type RewardCategory = 'Statement Credit' | 'Gift Card' | 'Donation' | 'Experience' | 'Physical Good';

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  cost: number; // in Reward Points
  imageUrl: string;
  stock: number | 'infinite'; // Number of items available, or infinite
  vendor: string;
  termsAndConditions: string;
  redeemable: boolean; // Is it currently available for redemption
}

/**
 * Represents a single transaction in the user's reward points history.
 */
export type TransactionType = 'earn' | 'redeem';

export interface Transaction {
  id: string;
  timestamp: string; // ISO 8601 date string
  type: TransactionType;
  amount: number; // The number of points, always positive
  description: string;
  relatedEntityId?: string; // e.g., ID of the reward redeemed or the goal achieved
}

/**
 * Defines an achievement or badge a user can earn.
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  xpValue: number; // XP awarded for earning this achievement
}

/**
 * Defines the shape of the API responses for better type checking.
 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}


// =================================================================================
// 2. MOCK API SERVICE
// In a real application, this would be in a separate file (e.g., `services/api.ts`)
// and would use a library like Axios or fetch to make real HTTP requests.
// Here, we simulate it with timeouts to mimic network latency.
// =================================================================================

const MOCK_LATENCY = 800; // ms

// --- Mock Database ---

const mockUser: UserRewardsProfile = {
  userId: 'user-123',
  displayName: 'Alex Mercer',
  email: 'alex.mercer@example.com',
  rewardPoints: 42570,
  gamification: {
    level: 12,
    currentXp: 3450,
    xpToNextLevel: 5000,
    title: 'Financial Virtuoso',
  },
  achievements: ['ach_001', 'ach_002', 'ach_005', 'ach_007'],
  createdAt: '2022-01-15T10:00:00Z',
};

const mockAchievements: Achievement[] = [
  { id: 'ach_001', name: 'First Steps', description: 'Set up your first budget.', iconUrl: '/icons/achievements/first_steps.svg', xpValue: 100 },
  { id: 'ach_002', name: 'Budget Master', description: 'Stick to your budget for a full month.', iconUrl: '/icons/achievements/budget_master.svg', xpValue: 500 },
  { id: 'ach_003', name: 'Emergency Fund Starter', description: 'Save your first $500 in an emergency fund.', iconUrl: '/icons/achievements/emergency_fund.svg', xpValue: 750 },
  { id: 'ach_004', name: 'Debt Destroyer', description: 'Pay off a credit card completely.', iconUrl: '/icons/achievements/debt_destroyer.svg', xpValue: 1500 },
  { id: 'ach_005', name: 'Savings Streak', description: 'Contribute to a savings goal for 10 consecutive weeks.', iconUrl: '/icons/achievements/savings_streak.svg', xpValue: 1000 },
  { id: 'ach_006', name: 'Investment Novice', description: 'Make your first investment.', iconUrl: '/icons/achievements/investment.svg', xpValue: 800 },
  { id: 'ach_007', name: 'Level 10 Reached', description: 'Achieve level 10 in your financial journey.', iconUrl: '/icons/achievements/level_10.svg', xpValue: 2000 },
  { id: 'ach_008', name: 'Millionaire Mindset', description: 'Reach a net worth of $10,000.', iconUrl: '/icons/achievements/millionaire.svg', xpValue: 5000 },
];

const mockRewards: RewardItem[] = [
  { id: 'rew_001', name: '$5 Statement Credit', description: 'Apply a $5 credit directly to your account statement.', category: 'Statement Credit', cost: 5000, imageUrl: '/images/rewards/statement_credit_5.png', stock: 'infinite', vendor: 'Internal', termsAndConditions: 'Credit applied within 5-7 business days.', redeemable: true },
  { id: 'rew_002', name: '$10 Statement Credit', description: 'Apply a $10 credit directly to your account statement.', category: 'Statement Credit', cost: 9500, imageUrl: '/images/rewards/statement_credit_10.png', stock: 'infinite', vendor: 'Internal', termsAndConditions: 'Credit applied within 5-7 business days.', redeemable: true },
  { id: 'rew_003', name: '$25 Statement Credit', description: 'Apply a $25 credit directly to your account statement.', category: 'Statement Credit', cost: 22500, imageUrl: '/images/rewards/statement_credit_25.png', stock: 'infinite', vendor: 'Internal', termsAndConditions: 'Credit applied within 5-7 business days.', redeemable: true },
  { id: 'rew_004', name: '$10 Amazon Gift Card', description: 'Get a $10 digital gift card for Amazon.', category: 'Gift Card', cost: 10000, imageUrl: '/images/rewards/amazon_10.png', stock: 150, vendor: 'Amazon', termsAndConditions: 'Digital code will be sent to your registered email.', redeemable: true },
  { id: 'rew_005', name: '$25 Starbucks Gift Card', description: 'Fuel your day with a $25 Starbucks gift card.', category: 'Gift Card', cost: 25000, imageUrl: '/images/rewards/starbucks_25.png', stock: 80, vendor: 'Starbucks', termsAndConditions: 'Digital code will be sent to your registered email.', redeemable: true },
  { id: 'rew_006', name: 'Plant a Tree', description: 'Partner with us to plant a tree and help the environment.', category: 'Donation', cost: 1000, imageUrl: '/images/rewards/plant_tree.png', stock: 'infinite', vendor: 'One Tree Planted', termsAndConditions: 'A tree will be planted on your behalf. You will receive a certificate via email.', redeemable: true },
  { id: 'rew_007', name: 'Donate $5 to Charity', description: 'Donate $5 to the Charity of the Month: World Central Kitchen.', category: 'Donation', cost: 4800, imageUrl: '/images/rewards/charity_5.png', stock: 'infinite', vendor: 'World Central Kitchen', termsAndConditions: 'Donation will be made at the end of the calendar month.', redeemable: true },
  { id: 'rew_008', name: 'Financial Consultation', description: 'A 30-minute one-on-one consultation with a certified financial planner.', category: 'Experience', cost: 75000, imageUrl: '/images/rewards/consultation.png', stock: 10, vendor: 'Internal Financial Advisors', termsAndConditions: 'Booking required. Subject to availability.', redeemable: true },
  { id: 'rew_009', name: 'Premium App Subscription (1 Year)', description: 'Unlock all premium features of this app for one year.', category: 'Experience', cost: 50000, imageUrl: '/images/rewards/premium_sub.png', stock: 'infinite', vendor: 'Internal', termsAndConditions: 'Applied instantly to your account.', redeemable: true },
  { id: 'rew_010', name: 'Branded Thermal Flask', description: 'A high-quality, insulated thermal flask with our logo.', category: 'Physical Good', cost: 30000, imageUrl: '/images/rewards/flask.png', stock: 50, vendor: 'Internal Merchandise', termsAndConditions: 'Requires shipping address. Please allow 2-4 weeks for delivery.', redeemable: true },
  { id: 'rew_011', name: '$50 Uber Eats Voucher', description: 'Enjoy a meal on us with a $50 Uber Eats voucher.', category: 'Gift Card', cost: 50000, imageUrl: '/images/rewards/uber_eats_50.png', stock: 0, vendor: 'Uber Eats', termsAndConditions: 'This item is currently out of stock.', redeemable: false },
];

const mockTransactions: Transaction[] = [
  { id: 'txn_001', timestamp: '2023-10-26T10:00:00Z', type: 'earn', amount: 500, description: 'On-time bill payment' },
  { id: 'txn_002', timestamp: '2023-10-25T14:30:00Z', type: 'earn', amount: 1000, description: 'Met monthly savings goal' },
  { id: 'txn_003', timestamp: '2023-10-24T09:15:00Z', type: 'redeem', amount: 10000, description: 'Redeemed: $10 Amazon Gift Card', relatedEntityId: 'rew_004' },
  { id: 'txn_004', timestamp: '2023-10-23T18:00:00Z', type: 'earn', amount: 250, description: 'Budget adherence bonus' },
  { id: 'txn_005', timestamp: '2023-10-22T11:45:00Z', type: 'earn', amount: 100, description: 'Daily login bonus' },
  { id: 'txn_006', timestamp: '2023-10-20T16:20:00Z', type: 'earn', amount: 2000, description: 'Achievement: Savings Streak' },
  { id: 'txn_007', timestamp: '2023-10-18T08:00:00Z', type: 'earn', amount: 500, description: 'On-time bill payment' },
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `txn_${String(i + 8).padStart(3, '0')}`,
    timestamp: new Date(Date.now() - (i + 8) * 24 * 60 * 60 * 1000).toISOString(),
    type: (i % 3 === 0) ? 'redeem' : 'earn' as TransactionType,
    amount: (i % 3 === 0) ? 5000 : Math.floor(Math.random() * 500 + 100),
    description: (i % 3 === 0) ? 'Redeemed: $5 Statement Credit' : 'Budget adherence bonus',
  })),
];


export const mockApiService = {
  /**
   * Fetches the current user's complete rewards profile.
   */
  fetchUserProfile: async (): Promise<UserRewardsProfile> => {
    console.log('API: Fetching user profile...');
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('API: User profile fetched.');
        resolve(mockUser);
      }, MOCK_LATENCY);
    });
  },

  /**
   * Fetches the full catalog of available rewards.
   */
  fetchRewardsCatalog: async (): Promise<RewardItem[]> => {
    console.log('API: Fetching rewards catalog...');
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('API: Rewards catalog fetched.');
        resolve(mockRewards);
      }, MOCK_LATENCY);
    });
  },

  /**
   * Fetches a paginated list of user's transactions.
   */
  fetchTransactionHistory: async (page: number, pageSize: number): Promise<PaginatedResponse<Transaction>> => {
    console.log(`API: Fetching transaction history (page ${page}, size ${pageSize})...`);
    return new Promise(resolve => {
      setTimeout(() => {
        const sortedTransactions = [...mockTransactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedData = sortedTransactions.slice(start, end);
        console.log('API: Transaction history fetched.');
        resolve({
          data: paginatedData,
          page,
          pageSize,
          totalItems: sortedTransactions.length,
          totalPages: Math.ceil(sortedTransactions.length / pageSize),
        });
      }, MOCK_LATENCY / 2); // Faster for better UX
    });
  },

  /**
   * Fetches details for all possible achievements.
   */
  fetchAllAchievements: async (): Promise<Achievement[]> => {
    console.log('API: Fetching all achievements...');
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('API: Achievements fetched.');
        resolve(mockAchievements);
      }, MOCK_LATENCY);
    });
  },

  /**
   * Simulates redeeming a reward.
   * @param rewardId The ID of the reward to redeem.
   * @param userId The ID of the user redeeming the reward.
   */
  redeemReward: async (rewardId: string, userId: string): Promise<{ success: boolean; message: string; newPointsBalance: number; }> => {
    console.log(`API: User ${userId} attempting to redeem reward ${rewardId}...`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const reward = mockRewards.find(r => r.id === rewardId);
        if (!reward) {
          console.error('API Error: Reward not found.');
          return reject({ success: false, message: 'Reward not found.' });
        }
        if (!reward.redeemable || reward.stock === 0) {
          console.error('API Error: Reward is not available.');
          return reject({ success: false, message: 'This reward is currently unavailable.' });
        }
        if (mockUser.rewardPoints < reward.cost) {
          console.error('API Error: Insufficient points.');
          return reject({ success: false, message: 'You do not have enough points to redeem this reward.' });
        }

        // Simulate success
        mockUser.rewardPoints -= reward.cost;
        if (typeof reward.stock === 'number') {
          reward.stock -= 1;
        }

        const newTransaction: Transaction = {
            id: `txn_${String(mockTransactions.length + 1).padStart(3, '0')}`,
            timestamp: new Date().toISOString(),
            type: 'redeem',
            amount: reward.cost,
            description: `Redeemed: ${reward.name}`,
            relatedEntityId: reward.id,
        };
        mockTransactions.unshift(newTransaction);

        console.log('API: Redemption successful.');
        resolve({
          success: true,
          message: `Successfully redeemed ${reward.name}!`,
          newPointsBalance: mockUser.rewardPoints,
        });
      }, MOCK_LATENCY * 1.5);
    });
  },
};

// =================================================================================
// 3. UTILITY FUNCTIONS
// Helper functions used across multiple components.
// =================================================================================

/**
 * Formats a number into a currency string (e.g., 10000 -> "10,000").
 * @param value The number to format.
 * @returns A formatted string.
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Formats an ISO date string into a more readable format.
 * @param isoString The ISO date string.
 * @returns A formatted date string (e.g., "October 26, 2023").
 */
export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Calculates the percentage progress towards the next level.
 * @param currentXp The user's current experience points.
 * @param xpToNextLevel The total XP needed for the next level.
 * @returns A number between 0 and 100.
 */
export const calculateLevelProgress = (currentXp: number, xpToNextLevel: number): number => {
    if (xpToNextLevel === 0) return 100;
    return Math.min(100, Math.max(0, (currentXp / xpToNextLevel) * 100));
};

// =================================================================================
// 4. UI HELPER & PRIMITIVE COMPONENTS
// Reusable, generic components that form the building blocks of the UI.
// =================================================================================

/**
 * Generic Loading Spinner Component
 */
export const Spinner = ({ size = '24px', color = '#4F46E5' }: { size?: string; color?: string }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
    <div style={{
      border: `4px solid rgba(0, 0, 0, 0.1)`,
      width: size,
      height: size,
      borderRadius: '50%',
      borderLeftColor: color,
      animation: 'spin 1s ease-in-out infinite',
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

/**
 * Generic Card Component
 */
export const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        border: '1px solid #E5E7EB',
        ...style
    }}>
        {children}
    </div>
);

/**
 * Generic Button Component
 */
export const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  style
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: React.CSSProperties;
}) => {
  const baseStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out, opacity 0.2s',
    fontSize: '1rem',
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#4F46E5',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#E5E7EB',
      color: '#111827',
    },
    danger: {
      backgroundColor: '#EF4444',
      color: 'white',
    }
  };

  const disabledStyle: React.CSSProperties = disabled ? {
    opacity: 0.5,
    cursor: 'not-allowed',
  } : {};
  
  const hoverStyle = !disabled ? {
      primary: { backgroundColor: '#4338CA' },
      secondary: { backgroundColor: '#D1D5DB' },
      danger: { backgroundColor: '#DC2626' }
  } : {};
  
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...(isHovered ? hoverStyle[variant] : {}),
        ...disabledStyle,
        ...style
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
};


/**
 * Generic Modal Component
 */
export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}
    onClick={onClose}
    >
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        minWidth: '400px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6B7280' }}>&times;</button>
        </div>
        <div>{children}</div>
      </div>
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
    `}</style>
    </div>
  );
};


/**
 * Icon components for UI elements. In a real app, this would be an icon library.
 */
export const PointIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '1em', height: '1em' }}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);
export const LevelUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '1em', height: '1em' }}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.601a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);
export const EarnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '1em', height: '1em', color: '#10B981' }}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 00-1.1-1.02l-1.95 2.1V6.75z" clipRule="evenodd" />
    </svg>
);
export const RedeemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '1em', height: '1em', color: '#EF4444' }}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
    </svg>
);

// =================================================================================
// 5. FEATURE-SPECIFIC COMPONENTS
// These components are the core building blocks of the Rewards Hub view.
// =================================================================================

/**
 * Displays the user's current reward points balance in a prominent way.
 * @param points The number of points to display.
 */
export const PointsBalanceDisplay = ({ points }: { points: number }) => (
    <Card style={{ textAlign: 'center', background: 'linear-gradient(45deg, #4F46E5, #7C3AED)' }}>
        <h3 style={{ color: '#E0E7FF', margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Spoils</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span style={{ color: '#FBBF24', fontSize: '2.5rem' }}><PointIcon /></span>
            <p style={{ color: 'white', margin: 0, fontSize: '3rem', fontWeight: 'bold' }}>{formatNumber(points)}</p>
        </div>
        <p style={{ color: '#C7D2FE', margin: '8px 0 0 0', fontStyle: 'italic' }}>Merits earned, not given.</p>
    </Card>
);

/**
 * Displays the user's gamification level and progress.
 * @param gamification The user's gamification state.
 */
export const GamificationProgress = ({ gamification }: { gamification: GamificationState }) => {
    const progress = calculateLevelProgress(gamification.currentXp, gamification.xpToNextLevel);

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Level {gamification.level}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#4F46E5', fontWeight: '600' }}>{gamification.title}</p>
                </div>
                <div style={{ fontSize: '2rem', color: '#10B981' }}>
                    <LevelUpIcon />
                </div>
            </div>
            <div>
                <div style={{ height: '12px', backgroundColor: '#E5E7EB', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#4F46E5', transition: 'width 0.5s ease-in-out', borderRadius: '6px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6B7280' }}>
                    <span>{formatNumber(gamification.currentXp)} XP</span>
                    <span>{formatNumber(gamification.xpToNextLevel)} XP to Level {gamification.level + 1}</span>
                </div>
            </div>
        </Card>
    );
};


/**
 * A single card representing a redeemable reward in the catalog.
 */
export const RewardCard = ({ reward, userPoints, onRedeem }: { reward: RewardItem; userPoints: number; onRedeem: (rewardId: string) => void; }) => {
    const canAfford = userPoints >= reward.cost;
    const isAvailable = reward.redeemable && reward.stock !== 0;

    return (
        <Card style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
            {!isAvailable && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 1,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                }}>
                    <span style={{
                        transform: 'rotate(-15deg)',
                        color: '#DC2626',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        border: '2px solid #DC2626',
                        padding: '8px 16px',
                        borderRadius: '8px',
                    }}>
                        {reward.stock === 0 ? 'Out of Stock' : 'Unavailable'}
                    </span>
                </div>
            )}
            <img src={reward.imageUrl} alt={reward.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }} />
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '500', textTransform: 'uppercase' }}>{reward.category}</span>
                <h4 style={{ margin: '4px 0 8px 0', fontSize: '1.125rem', color: '#111827', flexGrow: 1 }}>{reward.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                    <span style={{ color: '#FBBF24', fontSize: '1.25rem' }}><PointIcon /></span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>{formatNumber(reward.cost)}</span>
                </div>
                <Button onClick={() => onRedeem(reward.id)} disabled={!canAfford || !isAvailable}>
                    {canAfford ? 'Redeem' : 'Not Enough Points'}
                </Button>
            </div>
        </Card>
    );
};


/**
 * The catalog of all available rewards, with filtering and sorting.
 */
export const RewardsCatalog = ({ rewards, userPoints, onRedeem }: { rewards: RewardItem[]; userPoints: number; onRedeem: (rewardId: string) => void; }) => {
    const [filterCategory, setFilterCategory] = useState<RewardCategory | 'All'>('All');
    const [sortBy, setSortBy] = useState<'cost-asc' | 'cost-desc' | 'name-asc'>('cost-asc');
    const [searchQuery, setSearchQuery] = useState('');

    const categories: (RewardCategory | 'All')[] = ['All', ...new Set(rewards.map(r => r.category))];

    const filteredAndSortedRewards = useMemo(() => {
        return rewards
            .filter(reward => {
                const categoryMatch = filterCategory === 'All' || reward.category === filterCategory;
                const searchMatch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) || reward.description.toLowerCase().includes(searchQuery.toLowerCase());
                return categoryMatch && searchMatch;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'cost-asc': return a.cost - b.cost;
                    case 'cost-desc': return b.cost - a.cost;
                    case 'name-asc': return a.name.localeCompare(b.name);
                    default: return 0;
                }
            });
    }, [rewards, filterCategory, sortBy, searchQuery]);

    const controlRowStyle: React.CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#F9FAFB',
        borderRadius: '8px'
    };

    const inputStyle: React.CSSProperties = {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #D1D5DB',
        fontSize: '1rem',
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '16px', color: '#111827' }}>Redeem Your Merits</h2>
            <div style={controlRowStyle}>
                <input
                    type="text"
                    placeholder="Search rewards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{...inputStyle, flexGrow: 1, minWidth: '200px' }}
                />
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as RewardCategory | 'All')} style={inputStyle}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={inputStyle}>
                    <option value="cost-asc">Cost: Low to High</option>
                    <option value="cost-desc">Cost: High to Low</option>
                    <option value="name-asc">Name: A-Z</option>
                </select>
            </div>
            
            {filteredAndSortedRewards.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                    {filteredAndSortedRewards.map(reward => (
                        <RewardCard key={reward.id} reward={reward} userPoints={userPoints} onRedeem={onRedeem} />
                    ))}
                </div>
            ) : (
                <Card style={{ textAlign: 'center', padding: '48px' }}>
                    <p style={{ margin: 0, fontSize: '1.125rem', color: '#6B7280' }}>No rewards match your criteria. Try adjusting your filters.</p>
                </Card>
            )}
        </div>
    );
};


/**
 * A row in the transaction history list.
 */
export const TransactionRow = ({ transaction }: { transaction: Transaction }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>
                {transaction.type === 'earn' ? <EarnIcon /> : <RedeemIcon />}
            </span>
            <div>
                <p style={{ margin: 0, fontWeight: '600', color: '#111827' }}>{transaction.description}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>{formatDate(transaction.timestamp)}</p>
            </div>
        </div>
        <div style={{
            fontSize: '1.125rem',
            fontWeight: 'bold',
            color: transaction.type === 'earn' ? '#10B981' : '#EF4444',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        }}>
            {transaction.type === 'earn' ? '+' : '-'} {formatNumber(transaction.amount)}
            <span style={{ color: '#FBBF24', fontSize: '1rem', marginLeft: '4px' }}><PointIcon /></span>
        </div>
    </div>
);


/**
 * Displays a paginated list of point transactions.
 */
export const TransactionHistoryList = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        const loadTransactions = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await mockApiService.fetchTransactionHistory(currentPage, pageSize);
                setTransactions(response.data);
                setTotalPages(response.totalPages);
            } catch (err) {
                setError('Failed to load transaction history.');
            } finally {
                setLoading(false);
            }
        };
        loadTransactions();
    }, [currentPage]);

    return (
        <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '16px', color: '#111827' }}>Points Ledger</h2>
            <Card style={{ padding: 0 }}>
                {loading && <Spinner />}
                {error && <p style={{ color: '#DC2626', padding: '16px' }}>{error}</p>}
                {!loading && !error && transactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
                {!loading && !error && transactions.length === 0 && <p style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>No transactions yet.</p>}
            </Card>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1}>Previous</Button>
                <span style={{ color: '#374151' }}>Page {currentPage} of {totalPages}</span>
                <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Next</Button>
            </div>
        </div>
    );
};


/**
 * Displays user's achievements.
 */
export const AchievementsGallery = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userAchievementIds, setUserAchievementIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [allAchievements, userProfile] = await Promise.all([
                    mockApiService.fetchAllAchievements(),
                    mockApiService.fetchUserProfile()
                ]);
                setAchievements(allAchievements);
                setUserAchievementIds(new Set(userProfile.achievements));
            } catch (error) {
                console.error("Failed to load achievements", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    
    if (loading) return <Spinner />;

    return (
        <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '16px', color: '#111827' }}>Hall of Accolades</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {achievements.map(ach => {
                    const earned = userAchievementIds.has(ach.id);
                    return (
                        <Card key={ach.id} style={{ opacity: earned ? 1 : 0.5, transition: 'opacity 0.3s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <img src={ach.iconUrl} alt={ach.name} style={{ width: '60px', height: '60px' }}/>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.125rem', color: '#111827' }}>{ach.name}</h4>
                                    <p style={{ margin: '4px 0 0 0', color: '#6B7280' }}>{ach.description}</p>
                                    {earned && <p style={{ margin: '8px 0 0 0', color: '#10B981', fontWeight: 'bold' }}>Earned!</p>}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Context for handling notifications/toasts.
 */
type NotificationContextType = {
    addNotification: (message: string, type: 'success' | 'error') => void;
};
export const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

    const addNotification = useCallback((message: string, type: 'success' | 'error') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {notifications.map(n => (
                    <div key={n.id} style={{
                        padding: '16px',
                        borderRadius: '8px',
                        color: 'white',
                        backgroundColor: n.type === 'success' ? '#10B981' : '#EF4444',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                        animation: 'slideIn 0.5s ease-out'
                    }}>
                        {n.message}
                    </div>
                ))}
            </div>
             <style>{`
                @keyframes slideIn {
                  from { opacity: 0; transform: translateX(100%); }
                  to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </NotificationContext.Provider>
    );
};


/**
 * A modal for confirming a reward redemption.
 */
export const RedemptionConfirmationModal = ({
    reward,
    isOpen,
    onClose,
    onConfirm,
    isConfirming,
} : {
    reward: RewardItem | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isConfirming: boolean;
}) => {
    if (!reward) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Redemption">
            <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '1.125rem', color: '#374151', margin: '0 0 24px 0' }}>
                    Are you sure you want to redeem your points for:
                </p>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', marginBottom: '24px'
                }}>
                    <img src={reward.imageUrl} alt={reward.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}/>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{reward.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#111827', marginTop: '8px' }}>
                            <span style={{ color: '#FBBF24' }}><PointIcon/></span>
                            <span style={{ fontWeight: 'bold' }}>{formatNumber(reward.cost)} Points</span>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#111827' }}>Terms & Conditions</h4>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0, maxHeight: '100px', overflowY: 'auto' }}>
                        {reward.termsAndConditions}
                    </p>
                </div>
                
                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button variant="secondary" onClick={onClose} disabled={isConfirming}>Cancel</Button>
                    <Button variant="primary" onClick={onConfirm} disabled={isConfirming}>
                        {isConfirming ? <Spinner size="16px" color="white" /> : 'Confirm & Redeem'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


// =================================================================================
// 6. MAIN VIEW COMPONENT
// This is the top-level component that assembles all the pieces.
// =================================================================================

/**
 * The main container for the entire Rewards Hub experience.
 * It fetches all necessary data and manages the primary state.
 */
export const RewardsHubViewContent = () => {
    // --- State Management ---
    const [userProfile, setUserProfile] = useState<UserRewardsProfile | null>(null);
    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Redemption Modal State
    const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

    const { addNotification } = useNotification();

    // --- Data Fetching ---
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [profileData, rewardsData] = await Promise.all([
                    mockApiService.fetchUserProfile(),
                    mockApiService.fetchRewardsCatalog(),
                ]);
                setUserProfile(profileData);
                setRewards(rewardsData);
            } catch (err) {
                console.error("Failed to load rewards hub data:", err);
                setError("We couldn't load the Rewards Hub. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // --- Event Handlers ---
    const handleRedeemClick = useCallback((rewardId: string) => {
        const reward = rewards.find(r => r.id === rewardId);
        if (reward) {
            setSelectedReward(reward);
            setIsModalOpen(true);
        }
    }, [rewards]);

    const handleConfirmRedemption = async () => {
        if (!selectedReward || !userProfile) return;

        setIsRedeeming(true);
        try {
            const result = await mockApiService.redeemReward(selectedReward.id, userProfile.userId);
            setUserProfile(prev => prev ? { ...prev, rewardPoints: result.newPointsBalance } : null);
            addNotification(result.message, 'success');
        } catch (error: any) {
            addNotification(error.message || 'An unexpected error occurred during redemption.', 'error');
        } finally {
            setIsRedeeming(false);
            setIsModalOpen(false);
            setSelectedReward(null);
        }
    };

    // --- Render Logic ---
    if (loading) {
        return <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spinner size="48px" /></div>;
    }

    if (error) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#DC2626' }}>{error}</div>;
    }

    if (!userProfile) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>No user data available.</div>;
    }

    const containerStyle: React.CSSProperties = {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        backgroundColor: '#F3F4F6',
        color: '#374151',
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
    };
    
    const headerStyle: React.CSSProperties = {
        marginBottom: '40px',
        borderBottom: '1px solid #D1D5DB',
        paddingBottom: '24px'
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h1 style={{ fontSize: '2.5rem', color: '#111827', margin: '0 0 8px 0' }}>The Spoils of Discipline</h1>
                <p style={{ fontSize: '1.125rem', color: '#4B5563', margin: 0 }}>Welcome, {userProfile.displayName}. This is your Hall of Accolades.</p>
            </header>
            
            <main style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <PointsBalanceDisplay points={userProfile.rewardPoints} />
                    <GamificationProgress gamification={userProfile.gamification} />
                </section>
                
                <section>
                    <RewardsCatalog rewards={rewards} userPoints={userProfile.rewardPoints} onRedeem={handleRedeemClick} />
                </section>

                <section>
                    <AchievementsGallery />
                </section>

                <section>
                    <TransactionHistoryList />
                </section>
            </main>

            <RedemptionConfirmationModal
                reward={selectedReward}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmRedemption}
                isConfirming={isRedeeming}
            />
        </div>
    );
};


/**
 * The final exported component, wrapping the main content with necessary providers.
 */
export const RewardsHubView = () => (
    <NotificationProvider>
        <RewardsHubViewContent />
    </NotificationProvider>
);
