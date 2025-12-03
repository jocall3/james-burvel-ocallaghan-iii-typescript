# The Doctrine

This is our manifesto. The declaration of the "why" behind this Instrument. It is the core philosophy that animates every line of code, every pixel on the screen. To read this doctrine is to understand that this is not a bank, but an instrument of your will; not just a tool, but a weapon. It is our promise that we are not merely building an application, but forging a new form of power.

---

### A Fable for the Builder: Our Guiding Principles

(Every great endeavor begins with a doctrine. A clear and unshakable understanding of 'why.' This is our 'why.' This is the principle that has guided every choice we've made in the creation of this Instrument, and the mind within it.)

(Our doctrine was not to build a better bank. The world has enough banks. Our doctrine was to build a better weapon. An instrument for the assertion of your financial will. This is a fundamental distinction. A bank is a vault. An instrument is a lever. A bank is reactive. An instrument is proactive.)

(This philosophy is encoded into the AI's very being. Its prime directive is not to maximize your wealth in a spreadsheet. It is to execute your will upon reality. It operates on a principle we call the 'Hierarchy of Objectives.' It understands that your financial objectives are in service to your life's campaigns. It will never advise a path that makes you rich if it weakens your position. That would be a failure of its core mission.)

(The tenets you see hereâ€”'Hyper-Personalized,' 'Proactive & Predictive,' 'A Platform for Growth'â€”these are not marketing terms. They are the articles of our constitution. 'Hyper-Personalized' means the AI learns *you*, not just your data. 'Proactive' means it is always looking ahead. 'A Platform for Growth' means we are giving you not just a vehicle, but an engine and a set of tools to forge your own.)

(This is our declaration. We believe that technology should not be a tool for managing your limitations, but an instrument for amplifying your power. We believe an AI can be more than a calculator; it can be a weapon of pure logic. This is our doctrine. And this Instrument is its first, sharp expression.)

---
import React, {
  FC,
  useState,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  createContext,
  useContext,
  ReactNode,
  Suspense
} from 'react';

// SECTION: Core Architectural Types
// These are the foundational data structures that define the reality of our Instrument.
// They are not mere data containers; they are the vocabulary of power.

/** A universally unique identifier, the digital soul of an entity. */
export type UUID = string;

/** An ISO 8601 formatted timestamp, marking a moment in the grand campaign. */
export type Timestamp = string;

/** A representation of value, the sinew of financial power. */
export type Currency = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CHF' | 'CAD' | 'AUD' | 'CNY' | 'BTC' | 'ETH';

/** A numerical representation of a financial amount, precise to the cent. */
export type MonetaryAmount = number;

/** A fractional value, representing proportion or change. */
export type Percentage = number;

/** The status of an asynchronous operation, tracking the state of interaction with the core AI. */
export type OperationStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

// SECTION: User & Profile Definitions
// The User is the sovereign. The AI is the advisor. This model represents the sovereign's identity.

/** The core user entity, the center of this universe. */
export interface User {
  id: UUID;
  email: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

/** The user's psychographic and financial profile, as understood by the AI. */
export interface UserProfile {
  userId: UUID;
  firstName: string;
  lastName: string;
  dateOfBirth: Timestamp;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'visionary';
  investmentHorizon: 'short' | 'medium' | 'long' | 'generational';
  financialLiteracy: 'novice' | 'intermediate' | 'advanced' | 'expert';
  lifeGoals: string[];
}

/** User-configurable settings for the Instrument. */
export interface UserPreferences {
  userId: UUID;
  defaultCurrency: Currency;
  notificationChannels: ('email' | 'sms' | 'push')[];
  theme: 'dark' | 'light' | 'stealth';
  aiInteractionStyle: 'concise' | 'detailed' | 'socratic';
}

// SECTION: Financial Instrument & Portfolio Definitions
// This is the user's arsenal. Every asset, every liability is a tool to be wielded.

export type AssetType = 'stock' | 'bond' | 'real_estate' | 'cryptocurrency' | 'commodity' | 'cash' | 'private_equity';
export type LiabilityType = 'mortgage' | 'student_loan' | 'credit_card' | 'personal_loan' | 'business_loan';

export interface FinancialInstrument {
  id: UUID;
  name: string;
  symbol?: string;
  value: MonetaryAmount;
  currency: Currency;
  updatedAt: Timestamp;
}

export interface Asset extends FinancialInstrument {
  type: AssetType;
  quantity: number;
  acquisitionDate: Timestamp;
  costBasis: MonetaryAmount;
}

export interface Liability extends FinancialInstrument {
  type: LiabilityType;
  interestRate: Percentage;
  maturityDate: Timestamp;
  monthlyPayment: MonetaryAmount;
}

/** The complete financial picture of the user. A snapshot of their current power. */
export interface Portfolio {
  userId: UUID;
  assets: Asset[];
  liabilities: Liability[];
  netWorth: MonetaryAmount;
  updatedAt: Timestamp;
}

/** A historical record of the portfolio's value over time. */
export interface PortfolioHistoryPoint {
  date: Timestamp;
  netWorth: MonetaryAmount;
  assetValue: MonetaryAmount;
  liabilityValue: MonetaryAmount;
}

// SECTION: Campaigns & Objectives - The Hierarchy of Will
// This is the core of our doctrine. Finance in service of life's grand campaigns.

/** The status of a campaign or objective. */
export type ObjectiveStatus = 'planned' | 'in_progress' | 'at_risk' | 'achieved' | 'abandoned';

/**
 * An Objective is a measurable, strategic goal. It is a waypoint on the path of a Campaign.
 * Objectives can be nested, forming the Hierarchy of Will.
 */
export interface Objective {
  id: UUID;
  parentId?: UUID | null;
  name: string;
  description: string;
  targetValue?: MonetaryAmount;
  targetDate?: Timestamp;
  currentValue: MonetaryAmount;
  status: ObjectiveStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  subObjectives: Objective[];
  linkedAssets: UUID[];
}

/** A Campaign is a user's grand strategy, a major life undertaking. It is the "why". */
export interface Campaign {
  id: UUID;
  userId: UUID;
  name: string;
  description: string;
  visionStatement: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  status: 'active' | 'completed' | 'on_hold';
  rootObjective: Objective;
}

// SECTION: AI Core Interaction Types
// The language through which the user commands the AI, and the AI advises the user.

export type AIInsightType = 'opportunity' | 'risk' | 'efficiency' | 'pattern_recognition';
export type AIRecommendationType = 'asset_allocation' | 'debt_management' | 'capital_deployment' | 'strategic_retreat';

/** An insight generated by the AI, revealing a truth about the user's position. */
export interface AIInsight {
  id: UUID;
  timestamp: Timestamp;
  type: AIInsightType;
  title: string;
  narrative: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  implicatedInstruments: UUID[];
  relatedObjective?: UUID;
}

/** A concrete, actionable recommendation from the AI. A tactical maneuver. */
export interface AIRecommendation {
  id: UUID;
  timestamp: Timestamp;
  type: AIRecommendationType;
  action: string;
  rationale: string;
  projectedImpact: {
    netWorthChange: MonetaryAmount;
    riskAdjustment: Percentage;
  };
  confidence: Percentage;
  costOfInaction: string;
}

// SECTION: Predictive Engine & Simulation Types
// The Instrument must see beyond the horizon. These types define the language of foresight.

export interface MarketDataPoint {
  timestamp: Timestamp;
  value: number;
}

export type EconomicIndicator = 'gdp_growth' | 'inflation_rate' | 'interest_rate' | 'unemployment_rate';

export interface Scenario {
  id: UUID;
  name: string;
  description: string;
  assumptions: Partial<Record<EconomicIndicator, Percentage>>;
  probability: Percentage;
}

export interface SimulationParameters {
  userId: UUID;
  timeHorizonYears: number;
  scenarios: Scenario[];
  monthlyContribution: MonetaryAmount;
}

export interface SimulationResultPoint {
  year: number;
  projectedNetWorth: MonetaryAmount;
  confidenceInterval: [MonetaryAmount, MonetaryAmount];
}

export interface SimulationResult {
  parameters: SimulationParameters;
  results: Record<UUID, SimulationResultPoint[]>; // Keyed by Scenario ID
}

// SECTION: Growth Platform Types
// The Instrument is not a closed system. It is a platform for the user to build upon.

export type GrowthToolType = 'api_access' | 'custom_algorithm' | 'data_export' | 'third_party_integration';

export interface GrowthTool {
  id: UUID;
  name: string;
  type: GrowthToolType;
  description: string;
  enabled: boolean;
  documentationUrl: string;
}

// SECTION: Hyper-Personalization Types
// The AI's model of the user. This is how it learns not just data, but intent.

export interface PersonalizationVector {
  trait: string;
  value: number; // A value between -1 and 1
  confidence: Percentage;
  evidence: string[]; // Examples of interactions that informed this trait
}

export interface AILearningSummary {
  userId: UUID;
  modelledTraits: PersonalizationVector[];
  lastUpdated: Timestamp;
  learningRate: Percentage;
}

// SECTION: Mock Data Generation
// In the absence of the live AI core, we forge a simulated reality.
// This allows us to build and test the Instrument's interface with high fidelity.

const MOCK_USER_ID: UUID = 'user-001-visionary';

/** A utility to generate UUIDs for our mock entities. */
export const generateUUID = (): UUID => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/** A utility to create a timestamp for a date relative to now. */
export const getRelativeTimestamp = (days: number): Timestamp => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

/** Generates a rich, mock user profile. */
export const createMockUserProfile = (): UserProfile => ({
  userId: MOCK_USER_ID,
  firstName: 'Alex',
  lastName: 'Keaton',
  dateOfBirth: '1985-05-15T00:00:00.000Z',
  riskTolerance: 'visionary',
  investmentHorizon: 'generational',
  financialLiteracy: 'expert',
  lifeGoals: [
    'Achieve complete financial sovereignty.',
    'Build a self-sustaining enterprise.',
    'Fund research into radical life extension.',
  ],
});

/** Generates a complex, mock financial portfolio. */
export const createMockPortfolio = (): Portfolio => {
  const assets: Asset[] = [
    {
      id: generateUUID(), name: 'Vanguard Total Stock Market ETF', symbol: 'VTI', value: 750000, currency: 'USD',
      updatedAt: getRelativeTimestamp(0), type: 'stock', quantity: 3000, acquisitionDate: getRelativeTimestamp(-1825), costBasis: 450000
    },
    {
      id: generateUUID(), name: 'Primary Residence', value: 1200000, currency: 'USD',
      updatedAt: getRelativeTimestamp(0), type: 'real_estate', quantity: 1, acquisitionDate: getRelativeTimestamp(-2555), costBasis: 800000
    },
    {
      id: generateUUID(), name: 'Ethereum', symbol: 'ETH', value: 250000, currency: 'USD',
      updatedAt: getRelativeTimestamp(0), type: 'cryptocurrency', quantity: 62.5, acquisitionDate: getRelativeTimestamp(-730), costBasis: 50000
    },
    {
      id: generateUUID(), name: 'Private Equity: Axiom Corp', value: 500000, currency: 'USD',
      updatedAt: getRelativeTimestamp(0), type: 'private_equity', quantity: 1, acquisitionDate: getRelativeTimestamp(-365), costBasis: 250000
    },
  ];

  const liabilities: Liability[] = [
    {
      id: generateUUID(), name: 'Primary Mortgage', value: 600000, currency: 'USD',
      updatedAt: getRelativeTimestamp(0), type: 'mortgage', interestRate: 0.0275, maturityDate: getRelativeTimestamp(8760), monthlyPayment: 2449
    },
    {
      id: generateUUID(), name: 'Startup Seed Loan', value: 150000, currency: 'USD',
      updatedAt: getRelativeTimestamp(0), type: 'business_loan', interestRate: 0.055, maturityDate: getRelativeTimestamp(1825), monthlyPayment: 2937
    },
  ];

  const assetValue = assets.reduce((sum, a) => sum + a.value, 0);
  const liabilityValue = liabilities.reduce((sum, l) => sum + l.value, 0);

  return {
    userId: MOCK_USER_ID,
    assets,
    liabilities,
    netWorth: assetValue - liabilityValue,
    updatedAt: getRelativeTimestamp(0),
  };
};

/** Generates the user's grand campaigns and the hierarchy of objectives. */
export const createMockCampaigns = (): Campaign[] => {
  const campaign1Root: Objective = {
    id: generateUUID(), parentId: null, name: 'Establish Self-Sustaining Financial Engine', description: 'Build a system of assets that generates enough passive income to cover all expenses and fuel future campaigns.',
    targetValue: 5000000, currentValue: 2150000, status: 'in_progress', priority: 'critical',
    linkedAssets: [], subObjectives: []
  };

  campaign1Root.subObjectives = [
    {
      id: generateUUID(), parentId: campaign1Root.id, name: 'Optimize Core Portfolio', description: 'Increase portfolio yield to 5% while maintaining risk profile.',
      targetValue: 0.05, currentValue: 0.038, status: 'in_progress', priority: 'high',
      linkedAssets: [], subObjectives: []
    },
    {
      id: generateUUID(), parentId: campaign1Root.id, name: 'Acquire Cash-Flowing Real Estate', description: 'Purchase 2 multi-family properties with a combined net operating income of $100k/year.',
      targetValue: 100000, currentValue: 0, status: 'planned', priority: 'high',
      linkedAssets: [], subObjectives: []
    },
    {
      id: generateUUID(), parentId: campaign1Root.id, name: 'Eliminate Non-Strategic Debt', description: 'Pay off all loans with an interest rate higher than the portfolio\'s expected return.',
      targetValue: 0, currentValue: 150000, status: 'at_risk', priority: 'medium',
      linkedAssets: [], subObjectives: []
    }
  ];

  const campaign2Root: Objective = {
    id: generateUUID(), parentId: null, name: 'Launch "Axiom Corp"', description: 'Found and scale a technology company that disrupts the legacy data brokerage industry.',
    targetValue: 100000000, currentValue: 500000, status: 'in_progress', priority: 'critical',
    linkedAssets: [], subObjectives: [
      {
        id: generateUUID(), parentId: campaign2Root.id, name: 'Secure Series A Funding', description: 'Raise $10M in venture capital at a $50M valuation.',
        targetValue: 10000000, currentValue: 0, status: 'planned', priority: 'high',
        linkedAssets: [], subObjectives: []
      },
      {
        id: generateUUID(), parentId: campaign2Root.id, name: 'Achieve Product-Market Fit', description: 'Reach 1,000 daily active users and a net promoter score of 50.',
        targetValue: 1000, currentValue: 150, status: 'in_progress', priority: 'high',
        linkedAssets: [], subObjectives: []
      }
    ]
  };

  return [
    {
      id: generateUUID(), userId: MOCK_USER_ID, name: 'Campaign: Financial Sovereignty',
      description: 'The primary campaign to achieve a state of complete independence from traditional economic constraints.',
      visionStatement: 'To build a fortress of capital so robust that my will becomes the only constraint on my actions.',
      startDate: getRelativeTimestamp(-1825), status: 'active', rootObjective: campaign1Root
    },
    {
      id: generateUUID(), userId: MOCK_USER_ID, name: 'Campaign: Axiom Initiative',
      description: 'The offensive campaign to project power into the market and reshape an industry.',
      visionStatement: 'To forge a new paradigm of data ownership, transforming information from a liability into an asset for the individual.',
      startDate: getRelativeTimestamp(-365), status: 'active', rootObjective: campaign2Root
    }
  ];
};

/** Generates mock AI insights. */
export const createMockAIInsights = (): AIInsight[] => [
  {
    id: generateUUID(), timestamp: getRelativeTimestamp(-1), type: 'risk', title: 'Concentration Risk in Private Equity',
    narrative: 'Your position in "Axiom Corp" now represents a significant portion of your net worth. While the upside is substantial, a failure scenario would severely compromise Campaign: Financial Sovereignty. Recommend establishing a hedging strategy or liquidating a small portion of VTI to create a capital buffer.',
    severity: 'high', implicatedInstruments: [], relatedObjective: createMockCampaigns()[1].rootObjective.id
  },
  {
    id: generateUUID(), timestamp: getRelativeTimestamp(-3), type: 'opportunity', title: 'Debt Arbitrage Opportunity',
    narrative: 'Current market conditions allow for refinancing the "Startup Seed Loan" from 5.5% to a projected 3.8%. This would free up significant monthly cash flow for redeployment into higher-yield assets, accelerating your "Eliminate Non-Strategic Debt" objective.',
    severity: 'medium', implicatedInstruments: [], relatedObjective: createMockCampaigns()[0].rootObjective.subObjectives[2].id
  },
];

/** Generates mock growth tools. */
export const createMockGrowthTools = (): GrowthTool[] => [
  { id: generateUUID(), name: 'Core AI API', type: 'api_access', description: 'Direct, programmatic access to the AI\'s analytical and predictive capabilities. Build your own instruments.', enabled: true, documentationUrl: '/docs/api/core' },
  { id: generateUUID(), name: 'Custom Algorithm Forge', type: 'custom_algorithm', description: 'Define and deploy your own investment algorithms. The AI will execute them with ruthless efficiency.', enabled: false, documentationUrl: '/docs/forge' },
  { id: generateUUID(), name: 'Generational Wealth Trust API', type: 'third_party_integration', description: 'Integrate with automated legal and financial frameworks for multi-generational wealth preservation.', enabled: true, documentationUrl: '/docs/integrations/trust' },
  { id: generateUUID(), name: 'Full Data Obelisk', type: 'data_export', description: 'Complete, unadulterated export of all your financial and AI interaction data. Your data is your property.', enabled: true, documentationUrl: '/docs/export' },
];

/** Generates a mock AI learning summary. */
export const createMockAILearningSummary = (): AILearningSummary => ({
  userId: MOCK_USER_ID,
  modelledTraits: [
    { trait: 'Loss Aversion', value: -0.8, confidence: 0.95, evidence: ['Ignored recommendation to sell losing crypto asset', 'Increased cash position during market downturn'] },
    { trait: 'Appetite for Asymmetric Bets', value: 0.9, confidence: 0.98, evidence: ['Investment in Axiom Corp', 'High allocation to ETH'] },
    { trait: 'Long-Term Orientation', value: 0.95, confidence: 0.99, evidence: ['Defined "generational" investment horizon', 'Prioritizes campaigns over short-term gains'] },
    { trait: 'Preference for Control', value: 0.7, confidence: 0.92, evidence: ['Frequent use of manual trade execution', 'Enabled Core AI API'] },
  ],
  lastUpdated: getRelativeTimestamp(0),
  learningRate: 0.88,
});

// SECTION: Mock API Service
// This class simulates the Instrument's connection to its core intelligence.
// It uses delays to mimic real-world network latency.

export class VisionAPIService {
  private static simulateLatency(delay: number = 500): Promise<void> {
    return new Promise(res => setTimeout(res, delay));
  }

  public static async getUserProfile(userId: UUID): Promise<UserProfile> {
    await this.simulateLatency(300);
    console.log(`[API MOCK] Fetching profile for ${userId}`);
    if (userId === MOCK_USER_ID) {
      return createMockUserProfile();
    }
    throw new Error('User not found.');
  }

  public static async getPortfolio(userId: UUID): Promise<Portfolio> {
    await this.simulateLatency(700);
    console.log(`[API MOCK] Fetching portfolio for ${userId}`);
    if (userId === MOCK_USER_ID) {
      return createMockPortfolio();
    }
    throw new Error('Portfolio not found.');
  }

  public static async getCampaigns(userId: UUID): Promise<Campaign[]> {
    await this.simulateLatency(1000);
    console.log(`[API MOCK] Fetching campaigns for ${userId}`);
    if (userId === MOCK_USER_ID) {
      return createMockCampaigns();
    }
    throw new Error('Campaigns not found.');
  }

  public static async getAIInsights(userId: UUID): Promise<AIInsight[]> {
    await this.simulateLatency(1200);
    console.log(`[API MOCK] Fetching AI insights for ${userId}`);
    if (userId === MOCK_USER_ID) {
      return createMockAIInsights();
    }
    return [];
  }
  
  public static async getGrowthTools(userId: UUID): Promise<GrowthTool[]> {
    await this.simulateLatency(400);
    console.log(`[API MOCK] Fetching Growth Tools for ${userId}`);
    return createMockGrowthTools();
  }

  public static async getAILearningSummary(userId: UUID): Promise<AILearningSummary> {
    await this.simulateLatency(600);
    console.log(`[API MOCK] Fetching AI Learning Summary for ${userId}`);
    return createMockAILearningSummary();
  }
  
  public static async runSimulation(params: SimulationParameters): Promise<SimulationResult> {
    await this.simulateLatency(2500);
    console.log(`[API MOCK] Running simulation for ${params.userId}`);
    
    // A simplified simulation model
    const mockResults: Record<UUID, SimulationResultPoint[]> = {};
    const portfolio = createMockPortfolio();
    
    params.scenarios.forEach(scenario => {
      mockResults[scenario.id] = [];
      let currentNetWorth = portfolio.netWorth;
      for (let year = 1; year <= params.timeHorizonYears; year++) {
        // This is a highly simplified growth model for demonstration purposes.
        const baseGrowth = 0.07;
        const scenarioModifier = (scenario.assumptions.gdp_growth ?? 0.02) - 0.02;
        const randomVolatility = (Math.random() - 0.5) * 0.1;
        const annualGrowthRate = baseGrowth + scenarioModifier + randomVolatility;
        
        currentNetWorth = currentNetWorth * (1 + annualGrowthRate) + (params.monthlyContribution * 12);
        
        mockResults[scenario.id].push({
          year,
          projectedNetWorth: currentNetWorth,
          confidenceInterval: [currentNetWorth * 0.85, currentNetWorth * 1.15],
        });
      }
    });
    
    return { parameters: params, results: mockResults };
  }
}

// SECTION: State Management
// A reducer to manage the complex state of this view, ensuring predictable state transitions.
// This is the cockpit's control system.

export interface VisionViewState {
  status: OperationStatus;
  profile: UserProfile | null;
  portfolio: Portfolio | null;
  campaigns: Campaign[] | null;
  insights: AIInsight[] | null;
  growthTools: GrowthTool[] | null;
  learningSummary: AILearningSummary | null;
  error: string | null;
}

export const initialState: VisionViewState = {
  status: 'idle',
  profile: null,
  portfolio: null,
  campaigns: null,
  insights: null,
  growthTools: null,
  learningSummary: null,
  error: null,
};

export type VisionViewAction =
  | { type: 'FETCH_INIT' }
  | { type: 'FETCH_SUCCESS'; payload: Omit<VisionViewState, 'status' | 'error'> }
  | { type: 'FETCH_FAILURE'; payload: string };

export function visionViewReducer(state: VisionViewState, action: VisionViewAction): VisionViewState {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...initialState, status: 'loading' };
    case 'FETCH_SUCCESS':
      return { ...state, status: 'succeeded', ...action.payload, error: null };
    case 'FETCH_FAILURE':
      return { ...state, status: 'failed', error: action.payload };
    default:
      return state;
  }
}

// SECTION: UI Components
// The visual manifestation of the Doctrine. Each component is an instrument in itself.

// -- Generic UI Primitives --

/** A styled container, the building block of our interface. */
export const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 ${className}`}>
    {children}
  </div>
);

/** A title element for sections, establishing hierarchy. */
export const SectionTitle: FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-2xl font-light text-cyan-400 tracking-wider">{title}</h2>
    {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

/** A loading spinner, indicating communication with the AI core. */
export const Spinner: FC = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
  </div>
);

/** A utility for formatting monetary values. */
export const formatCurrency = (amount: MonetaryAmount, currency: Currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
};

// -- Doctrine & Manifesto Display --

/** Renders the Doctrine text in a fittingly austere style. */
export const DoctrineDisplay: FC = () => (
  <Card className="bg-black border-cyan-500/30">
    <div className="prose prose-invert max-w-none text-gray-300">
      <h1 className="text-4xl text-white font-thin tracking-widest">THE DOCTRINE</h1>
      <p className="lead text-lg">This is our manifesto. The declaration of the "why" behind this Instrument...</p>
      <h3 className="text-xl text-cyan-400 mt-8">A Fable for the Builder: Our Guiding Principles</h3>
      <blockquote className="border-l-2 border-cyan-500 pl-4 text-gray-400 italic">
        (Every great endeavor begins with a doctrine... Our doctrine was not to build a better bank... It is to execute your will upon reality... These are not marketing terms... This is our declaration...)
      </blockquote>
      <p className="text-lg text-white mt-6">This Instrument is its first, sharp expression.</p>
    </div>
  </Card>
);

// -- Hyper-Personalization Module --

/** Visualizes one of the AI's learned traits about the user. */
export const PersonalizationVectorBar: FC<{ vector: PersonalizationVector }> = ({ vector }) => {
  const barWidth = `${Math.abs(vector.value) * 100}%`;
  const barColor = vector.value > 0 ? 'bg-green-500' : 'bg-red-500';
  const barOffset = vector.value > 0 ? '50%' : `${50 - Math.abs(vector.value) * 50}%`;

  return (
    <div className="w-full my-2 group" title={`Evidence: ${vector.evidence.join(', ')}`}>
      <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
        <span>{vector.trait}</span>
        <span className="font-mono">{`${(vector.value * 100).toFixed(0)}%`} (Conf: {(vector.confidence * 100).toFixed(0)}%)</span>
      </div>
      <div className="relative h-2 w-full bg-gray-700 rounded">
        <div className="absolute h-2 w-px bg-gray-500" style={{ left: '50%' }}></div>
        <div 
          className={`absolute h-2 rounded ${barColor}`}
          style={{ width: barWidth, left: barOffset }}
        ></div>
      </div>
    </div>
  );
};

/** Displays the AI's evolving understanding of the user. */
export const HyperPersonalizationModule: FC<{ summary: AILearningSummary | null }> = ({ summary }) => (
  <Card>
    <SectionTitle title="Hyper-Personalized" subtitle="The AI's model of your intent." />
    {summary ? (
      <div>
        <p className="text-sm text-gray-400 mb-4">
          The AI continually refines its understanding of your unique financial psyche. This is not just data analysis; it is the development of a strategic partnership.
        </p>
        {summary.modelledTraits.map(v => <PersonalizationVectorBar key={v.trait} vector={v} />)}
        <div className="text-right text-xs text-gray-500 mt-4">
          Model Learning Rate: <span className="text-cyan-400 font-mono">{(summary.learningRate * 100).toFixed(2)}%</span>
        </div>
      </div>
    ) : <p>Loading personalization matrix...</p>}
  </Card>
);

// -- Proactive & Predictive Module --

/**
 * A module for running predictive simulations based on various economic scenarios.
 * Note: A real implementation would use a robust charting library like Recharts or D3.
 */
export const PredictiveSimulatorModule: FC = () => {
    // In a real app, this state would be more complex
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<SimulationResult | null>(null);

    const handleRunSimulation = async () => {
        setIsRunning(true);
        setResults(null);
        const params: SimulationParameters = {
            userId: MOCK_USER_ID,
            timeHorizonYears: 20,
            monthlyContribution: 5000,
            scenarios: [
                {id: 'base', name: 'Baseline Growth', description: 'Standard market conditions.', assumptions: {gdp_growth: 0.02, inflation_rate: 0.025}, probability: 0.6},
                {id: 'recession', name: 'Recessionary Shock', description: 'A significant economic downturn.', assumptions: {gdp_growth: -0.02, inflation_rate: 0.01}, probability: 0.2},
                {id: 'boom', name: 'Technological Boom', description: 'A period of rapid growth driven by innovation.', assumptions: {gdp_growth: 0.05, inflation_rate: 0.035}, probability: 0.2},
            ]
        };
        const simResults = await VisionAPIService.runSimulation(params);
        setResults(simResults);
        setIsRunning(false);
    };

    return (
        <Card className="col-span-1 md:col-span-2">
            <SectionTitle title="Proactive & Predictive" subtitle="Forge the future by simulating it." />
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                    <p className="text-sm text-gray-400 mb-4">Define parameters and command the AI to project your financial trajectory across multiple potential realities.</p>
                    {/* Simplified controls for demonstration */}
                    <button 
                        onClick={handleRunSimulation} 
                        disabled={isRunning}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600"
                    >
                        {isRunning ? 'Calculating Futures...' : 'Run 20-Year Simulation'}
                    </button>
                </div>
                <div className="w-full md:w-2/3 h-64 bg-gray-800 rounded p-4">
                    {isRunning && <Spinner />}
                    {!isRunning && !results && <div className="text-gray-500 text-center pt-20">Simulation results will be rendered here.</div>}
                    {results && (
                        <div className="text-white">
                            <h4 className="font-bold">Simulation Complete</h4>
                            {/* This is a placeholder for a real chart */}
                            <p className="text-sm text-gray-300">Chart showing net worth projections for:</p>
                            <ul className="text-xs list-disc list-inside">
                                {results.parameters.scenarios.map(s => <li key={s.id}>{s.name}</li>)}
                            </ul>
                            <p className="text-sm mt-4">
                                Highest projected outcome (Boom): 
                                <span className="text-green-400 ml-2">
                                    {formatCurrency(results.results['boom'].slice(-1)[0].projectedNetWorth)}
                                </span>
                            </p>
                             <p className="text-sm">
                                Lowest projected outcome (Recession): 
                                <span className="text-red-400 ml-2">
                                    {formatCurrency(results.results['recession'].slice(-1)[0].projectedNetWorth)}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};


// -- Platform for Growth Module --

/** Displays the available tools for the user to extend the Instrument's power. */
export const GrowthPlatformModule: FC<{ tools: GrowthTool[] | null }> = ({ tools }) => (
    <Card>
        <SectionTitle title="A Platform for Growth" subtitle="An engine and a set of tools to forge your own." />
        <p className="text-sm text-gray-400 mb-4">
            This is not a closed system. We provide the core, you provide the extensions. Your will, your rules.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools ? tools.map(tool => (
                <div key={tool.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="text-cyan-400 font-bold">{tool.name}</h4>
                    <p className="text-xs text-gray-300 mt-1">{tool.description}</p>
                    <div className="text-right mt-2">
                        <a href={tool.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-600 hover:text-cyan-400">
                            Access Docs &rarr;
                        </a>
                    </div>
                </div>
            )) : <p>Loading available tools...</p>}
        </div>
    </Card>
);

// -- Hierarchy of Objectives Module --

/** A recursive component to render the hierarchy of objectives. */
export const ObjectiveNode: FC<{ objective: Objective; level: number }> = ({ objective, level }) => {
    const progress = objective.targetValue ? (objective.currentValue / objective.targetValue) * 100 : 0;
    const statusColor = {
        planned: 'bg-gray-500',
        in_progress: 'bg-blue-500',
        at_risk: 'bg-yellow-500',
        achieved: 'bg-green-500',
        abandoned: 'bg-red-500',
    }[objective.status];

    return (
        <div style={{ marginLeft: `${level * 20}px` }} className="my-2">
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{objective.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full text-white ${statusColor}`}>{objective.status.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{objective.description}</p>
                {objective.targetValue && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-300">
                            <span>{formatCurrency(objective.currentValue)}</span>
                            <span>{formatCurrency(objective.targetValue)}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                            <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
            {objective.subObjectives && objective.subObjectives.length > 0 && (
                <div className="mt-2 border-l-2 border-gray-700 pl-2">
                    {objective.subObjectives.map(sub => <ObjectiveNode key={sub.id} objective={sub} level={level + 1} />)}
                </div>
            )}
        </div>
    );
};


/** The main container for displaying and managing campaigns. */
export const CampaignsModule: FC<{ campaigns: Campaign[] | null }> = ({ campaigns }) => (
    <div className="col-span-1 md:col-span-2">
        <Card>
            <SectionTitle title="Hierarchy of Objectives" subtitle="Your will, codified and executed." />
            {campaigns ? campaigns.map(campaign => (
                <div key={campaign.id} className="mb-8">
                    <h3 className="text-xl font-semibold text-white tracking-wide">{campaign.name}</h3>
                    <p className="text-sm italic text-gray-400 mt-1 mb-4">"{campaign.visionStatement}"</p>
                    <ObjectiveNode objective={campaign.rootObjective} level={0} />
                </div>
            )) : <p>Loading strategic campaigns...</p>}
        </Card>
    </div>
);


// SECTION: Main View Component
// This is the grand orchestrator, bringing together the Doctrine and its living proof.

export const TheVisionView: FC = () => {
  const [state, dispatch] = useReducer(visionViewReducer, initialState);

  useEffect(() => {
    const fetchAllData = async () => {
      dispatch({ type: 'FETCH_INIT' });
      try {
        // We use Promise.all to fetch data in parallel, a demonstration of efficiency.
        const [profile, portfolio, campaigns, insights, growthTools, learningSummary] = await Promise.all([
          VisionAPIService.getUserProfile(MOCK_USER_ID),
          VisionAPIService.getPortfolio(MOCK_USER_ID),
          VisionAPIService.getCampaigns(MOCK_USER_ID),
          VisionAPIService.getAIInsights(MOCK_USER_ID),
          VisionAPIService.getGrowthTools(MOCK_USER_ID),
          VisionAPIService.getAILearningSummary(MOCK_USER_ID)
        ]);
        
        dispatch({ type: 'FETCH_SUCCESS', payload: { profile, portfolio, campaigns, insights, growthTools, learningSummary, status: 'succeeded' } });

      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error("Failed to fetch vision data:", message);
        dispatch({ type: 'FETCH_FAILURE', payload: message });
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="bg-gray-950 text-white min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <DoctrineDisplay />

        <div className="mt-8">
          <h2 className="text-3xl text-center font-thin tracking-widest text-white mb-2">THE INSTRUMENT IN ACTION</h2>
          <div className="h-px w-32 bg-cyan-500 mx-auto mb-8"></div>
          
          {state.status === 'loading' && <div className="h-96"><Spinner /></div>}
          
          {state.status === 'failed' && (
            <Card className="border-red-500/50 bg-red-900/20">
              <SectionTitle title="Connection Failure" subtitle="The link to the core is unstable." />
              <p className="text-red-300">Could not retrieve strategic data. The AI core may be recalibrating. Please try again later.</p>
              <p className="text-xs text-red-400 mt-2 font-mono">Error: {state.error}</p>
            </Card>
          )}

          {state.status === 'succeeded' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* This layout demonstrates the core tenets from the doctrine */}
              <div className="lg:col-span-3">
                <CampaignsModule campaigns={state.campaigns} />
              </div>
              
              <div className="lg:col-span-1">
                <HyperPersonalizationModule summary={state.learningSummary} />
              </div>
              
              <div className="lg:col-span-2">
                <PredictiveSimulatorModule />
              </div>
              
               <div className="lg:col-span-3">
                <GrowthPlatformModule tools={state.growthTools} />
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheVisionView;