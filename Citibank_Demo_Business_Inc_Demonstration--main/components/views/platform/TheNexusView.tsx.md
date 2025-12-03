# The Nexus: The Map of Consequence

**(This is not a chart. This is the Nexus. The living map of the golden web, a real-time visualization of the emergent relationships between all the disparate parts of your financial life. This is the Instrument's consciousness, revealed.)**

The `TheNexusView` is the 27th module, the capstone of the Instrument's philosophy. It is the final revelation, the moment when abstract concepts are made tangible, visible, and interactive. It moves beyond the linear charts and siloed views of other modules to present a truly holistic, interconnected representation of your financial reality.

This is the place of seeing connections. The `NexusGraph` is a force-directed graph, a living constellation of nodes and links. Each `NexusNode` is an entity in your world: you (`The Visionary`), a `Goal`, a `Transaction`, a `Budget`. Each `NexusLink` is the relationship between them, the invisible thread of causality now rendered in light. You can see, not just be told, that a specific `Transaction` affects a specific `Budget`, which in turn is connected to your progress on a `Goal`.

The Nexus is a tool of profound insight. It reveals second and third-order consequences that are impossible to see in a simple list or chart. It might show that a cluster of small, seemingly unrelated transactions in one category is the primary force preventing a major goal from being achieved. It might reveal that a single source of income is the linchpin supporting the majority of your financial structure. It is a tool for understanding systemic risk and identifying points of leverage.

This view is interactive and exploratory. It invites you to become a cartographer of your own financial life. You can `drag` the nodes, pulling on the threads of the web to feel their tension and see how the entire constellation reconfigures itself. Selecting a `node` brings up its dossier, detailing its identity and its immediate connections. It is a tactile way of understanding the intricate, often hidden, architecture of your own financial life. To be in the Nexus is to see the symphony, not just the individual notes. It is the final graduation from managing a list to conducting an orchestra.

---

import React, { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from 'react';
import { a, useSpring, useSprings, animated } from '@react-spring/web';

//================================================================================================
// SECTION 1: CORE TYPES & ENUMS
// This section defines the fundamental data structures that power The Nexus.
//================================================================================================

/**
 * @enum {string}
 * @description Defines the comprehensive set of entity types that can exist as nodes within The Nexus.
 */
export enum NexusEntityType {
  VISIONARY = 'VISIONARY', // The central user node
  ACCOUNT = 'ACCOUNT', // Bank accounts, credit cards
  TRANSACTION = 'TRANSACTION', // Individual financial events
  BUDGET = 'BUDGET', // Spending categories and limits
  GOAL = 'GOAL', // Financial objectives
  INCOME_SOURCE = 'INCOME_SOURCE', // Salary, freelance, etc.
  INVESTMENT = 'INVESTMENT', // Stocks, bonds, funds
  DEBT = 'DEBT', // Loans, mortgages
  RECURRING_PAYMENT = 'RECURRING_PAYMENT', // Subscriptions, bills
  ASSET = 'ASSET', // Property, vehicles
  TAG = 'TAG', // User-defined tags for transactions/goals
  INSIGHT = 'INSIGHT', // AI-generated observations
}

/**
 * @enum {string}
 * @description Defines the types of relationships (links) between Nexus nodes.
 */
export enum NexusLinkType {
  OWNERSHIP = 'OWNERSHIP', // Visionary -> Account
  IMPACT = 'IMPACT', // Transaction -> Budget
  ALLOCATION = 'ALLOCATION', // Budget -> Goal
  FUNDING = 'FUNDING', // Income -> Account
  PAYMENT = 'PAYMENT', // Account -> Transaction
  CONTRIBUTION = 'CONTRIBUTION', // Account -> Investment
  LIABILITY = 'LIABILITY', // Account -> Debt
  SERVICE = 'SERVICE', // RecurringPayment -> Account
  APPRECIATION = 'APPRECIATION', // Investment -> Goal
  DEPRECIATION = 'DEPRECIATION', // Asset -> Net Worth (Implicit)
  TAGGING = 'TAGGING', // Tag -> Transaction
  EVIDENCE = 'EVIDENCE', // Transaction -> Insight
  RECOMMENDATION = 'RECOMMENDATION', // Insight -> Goal/Budget
  DEPENDENCY = 'DEPENDENCY', // Goal -> Goal
}

/**
 * @interface BaseNexusNode
 * @description The foundational structure for every node in the Nexus graph.
 */
export interface BaseNexusNode {
  id: string; // Unique identifier for the node
  type: NexusEntityType; // The type of the entity
  label: string; // Display name for the node
  timestamp: number; // Creation or last update timestamp
  metadata?: Record<string, any>; // Flexible store for additional data
}

// SECTION 1.1: SPECIFIC NODE TYPE DEFINITIONS

export interface VisionaryNode extends BaseNexusNode {
  type: NexusEntityType.VISIONARY;
  netWorth: number;
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface AccountNode extends BaseNexusNode {
  type: NexusEntityType.ACCOUNT;
  accountType: 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
  balance: number;
  currency: string;
  institution: string;
}

export interface TransactionNode extends BaseNexusNode {
  type: NexusEntityType.TRANSACTION;
  amount: number;
  currency: string;
  category: string;
  isRecurring: boolean;
  vendor: string;
}

export interface BudgetNode extends BaseNexusNode {
  type: NexusEntityType.BUDGET;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  variance: number; // percentage over/under
}

export interface GoalNode extends BaseNexusNode {
  type: NexusEntityType.GOAL;
  targetAmount: number;
  currentAmount: number;
  deadline: number; // timestamp
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number; // 0-1
}

export interface IncomeSourceNode extends BaseNexusNode {
  type: NexusEntityType.INCOME_SOURCE;
  monthlyAmount: number;
  isStable: boolean;
  sourceType: 'salary' | 'freelance' | 'investment' | 'other';
}

export interface InvestmentNode extends BaseNexusNode {
  type: NexusEntityType.INVESTMENT;
  value: number;
  assetClass: string; // e.g., 'equity', 'fixed-income', 'crypto'
  expectedReturn: number; // percentage
}

export interface DebtNode extends BaseNexusNode {
  type: NexusEntityType.DEBT;
  principal: number;
  interestRate: number;
  minPayment: number;
}

export interface RecurringPaymentNode extends BaseNexusNode {
  type: NexusEntityType.RECURRING_PAYMENT;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate: number;
}

export interface AssetNode extends BaseNexusNode {
  type: NexusEntityType.ASSET;
  currentValue: number;
  assetType: 'property' | 'vehicle' | 'collectible';
  appreciationRate: number;
}

export interface TagNode extends BaseNexusNode {
  type: NexusEntityType.TAG;
  color: string;
}

export interface InsightNode extends BaseNexusNode {
  type: NexusEntityType.INSIGHT;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  actionable: boolean;
}

/**
 * @type NexusNode
 * @description A union type representing any possible node in The Nexus.
 */
export type NexusNode =
  | VisionaryNode
  | AccountNode
  | TransactionNode
  | BudgetNode
  | GoalNode
  | IncomeSourceNode
  | InvestmentNode
  | DebtNode
  | RecurringPaymentNode
  | AssetNode
  | TagNode
  | InsightNode;

/**
 * @interface NexusLink
 * @description Defines the structure of a link connecting two nodes.
 */
export interface NexusLink {
  id: string; // Unique identifier for the link
  source: string; // ID of the source node
  target: string; // ID of the target node
  type: NexusLinkType;
  strength: number; // 0-1, represents the importance or magnitude of the relationship
  metadata?: Record<string, any>;
}

/**
 * @interface NexusGraphData
 * @description Represents the complete dataset for The Nexus visualization.
 */
export interface NexusGraphData {
  nodes: NexusNode[];
  links: NexusLink[];
}

//================================================================================================
// SECTION 2: SIMULATION & RENDERING TYPES
// Types related to the physics simulation and rendering state.
//================================================================================================

/**
 * @interface Vector2D
 * @description A simple 2D vector for position, velocity, and force calculations.
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * @interface SimulatedNode
 * @description Extends a NexusNode with simulation-specific properties.
 */
export interface SimulatedNode extends NexusNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number;
  fy: number;
  isFixed?: boolean;
}

/**
 * @interface SimulatedLink
 * @description Extends a NexusLink with references to the simulated nodes.
 */
export interface SimulatedLink extends NexusLink {
  sourceNode: SimulatedNode;
  targetNode: SimulatedNode;
}

/**
 * @interface ViewportTransform
 * @description Represents the current pan and zoom state of the canvas.
 */
export interface ViewportTransform {
  x: number;
  y: number;
  k: number; // scale
}

/**
 * @interface InteractionState
 * @description Manages the state of user interactions with the graph.
 */
export interface InteractionState {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  draggedNodeId: string | null;
  contextMenu: {
    isOpen: boolean;
    x: number;
    y: number;
    nodeId: string | null;
  } | null;
}

/**
 * @interface FilterState
 * @description Defines the active filters applied to the graph.
 */
export interface FilterState {
  enabledNodeTypes: Set<NexusEntityType>;
  dateRange: { start: number; end: number };
  amountRange: { min: number; max: number };
  searchTerm: string;
}

/**
 * @interface NexusTimeTravelState
 * @description State for the time travel feature.
 */
export interface NexusTimeTravelState {
  history: NexusGraphData[];
  currentIndex: number;
  isPlaying: boolean;
}


//================================================================================================
// SECTION 3: CONFIGURATION CONSTANTS
// Static configuration for visual appearance, simulation parameters, and theming.
//================================================================================================

/**
 * @const NODE_VISUAL_CONFIG
 * @description Configuration for the visual representation of each node type.
 */
export const NODE_VISUAL_CONFIG: Record<NexusEntityType, {
    baseRadius: number;
    colorKey: string;
    icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    mass: number;
}> = {
  [NexusEntityType.VISIONARY]: { baseRadius: 40, colorKey: 'accent1', icon: (p) => <svg {...p}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z"/></svg>, mass: 10 },
  [NexusEntityType.ACCOUNT]: { baseRadius: 25, colorKey: 'primary', icon: (p) => <svg {...p}><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>, mass: 5 },
  [NexusEntityType.TRANSACTION]: { baseRadius: 8, colorKey: 'neutral', icon: (p) => <svg {...p}><path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4v3z"/></svg>, mass: 1 },
  [NexusEntityType.BUDGET]: { baseRadius: 20, colorKey: 'secondary', icon: (p) => <svg {...p}><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V8h16v9c0 .55-.45 1-1 1z"/></svg>, mass: 4 },
  [NexusEntityType.GOAL]: { baseRadius: 30, colorKey: 'accent2', icon: (p) => <svg {...p}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>, mass: 8 },
  [NexusEntityType.INCOME_SOURCE]: { baseRadius: 22, colorKey: 'success', icon: (p) => <svg {...p}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5L6 12l1.41-1.41L10.5 14.67l7.09-7.09L19 9l-8.5 8.5z"/></svg>, mass: 4 },
  [NexusEntityType.INVESTMENT]: { baseRadius: 18, colorKey: 'accent3', icon: (p) => <svg {...p}><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.09-4-4L2 17.08l1.5 1.41z"/></svg>, mass: 3 },
  [NexusEntityType.DEBT]: { baseRadius: 18, colorKey: 'error', icon: (p) => <svg {...p}><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>, mass: 3 },
  [NexusEntityType.RECURRING_PAYMENT]: { baseRadius: 12, colorKey: 'warning', icon: (p) => <svg {...p}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>, mass: 2 },
  [NexusEntityType.ASSET]: { baseRadius: 28, colorKey: 'primary', icon: (p) => <svg {...p}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>, mass: 6 },
  [NexusEntityType.TAG]: { baseRadius: 10, colorKey: 'neutral', icon: (p) => <svg {...p}><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/></svg>, mass: 1 },
  [NexusEntityType.INSIGHT]: { baseRadius: 15, colorKey: 'accent2', icon: (p) => <svg {...p}><path d="M11 21c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2s2 .9 2 2v14c0 1.1-.9 2-2 2zm-7-7c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2s2 .9 2 2v7c0 1.1-.9 2-2 2zm14 0c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2s2 .9 2 2v7c0 1.1-.9 2-2 2z"/></svg>, mass: 2 },
};

/**
 * @const LINK_VISUAL_CONFIG
 * @description Configuration for the visual representation of each link type.
 */
export const LINK_VISUAL_CONFIG: Record<NexusLinkType, { colorKey: string; strokeWidth: number, dashed?: boolean }> = {
    [NexusLinkType.OWNERSHIP]: { colorKey: 'primary', strokeWidth: 3 },
    [NexusLinkType.IMPACT]: { colorKey: 'secondary', strokeWidth: 1 },
    [NexusLinkType.ALLOCATION]: { colorKey: 'accent2', strokeWidth: 2, dashed: true },
    [NexusLinkType.FUNDING]: { colorKey: 'success', strokeWidth: 2.5 },
    [NexusLinkType.PAYMENT]: { colorKey: 'neutral', strokeWidth: 1 },
    [NexusLinkType.CONTRIBUTION]: { colorKey: 'accent3', strokeWidth: 2 },
    [NexusLinkType.LIABILITY]: { colorKey: 'error', strokeWidth: 2 },
    [NexusLinkType.SERVICE]: { colorKey: 'warning', strokeWidth: 1.5, dashed: true },
    [NexusLinkType.APPRECIATION]: { colorKey: 'success', strokeWidth: 1.5, dashed: true },
    [NexusLinkType.DEPRECIATION]: { colorKey: 'error', strokeWidth: 1.5, dashed: true },
    [NexusLinkType.TAGGING]: { colorKey: 'neutral', strokeWidth: 0.5, dashed: true },
    [NexusLinkType.EVIDENCE]: { colorKey: 'info', strokeWidth: 1, dashed: true },
    [NexusLinkType.RECOMMENDATION]: { colorKey: 'accent1', strokeWidth: 2, dashed: true },
    [NexusLinkType.DEPENDENCY]: { colorKey: 'accent2', strokeWidth: 2, dashed: false },
};

/**
 * @const SIMULATION_CONFIG
 * @description Parameters for the force-directed graph simulation.
 */
export const SIMULATION_CONFIG = {
  chargeStrength: -150,
  chargeDistanceMin: 10,
  chargeDistanceMax: 800,
  linkDistance: 100,
  linkStrength: 0.5,
  centerForce: 0.05,
  velocityDecay: 0.4, // Friction
  simulationAlpha: 1, // Initial energy
  simulationAlphaMin: 0.001, // When simulation stops
  simulationAlphaDecay: 0.0228,
  dragAlphaTarget: 0.7,
};

/**
 * @const THEME
 * @description Color palettes for light and dark modes.
 */
export const THEME = {
  light: {
    background: '#f8f9fa',
    text: '#212529',
    textSecondary: '#6c757d',
    border: '#dee2e6',
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    accent1: '#6f42c1',
    accent2: '#d63384',
    accent3: '#fd7e14',
    neutral: '#adb5bd',
  },
  dark: {
    background: '#1a1a1a',
    text: '#e9ecef',
    textSecondary: '#adb5bd',
    border: '#495057',
    primary: '#4dabf7',
    secondary: '#adb5bd',
    success: '#40c057',
    error: '#fa5252',
    warning: '#fcc419',
    info: '#3bc9db',
    accent1: '#da77f2',
    accent2: '#f783ac',
    accent3: '#ff922b',
    neutral: '#868e96',
  },
};

type Theme = typeof THEME.light;
type ThemeName = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; themeName: ThemeName; toggleTheme: () => void; }>({
    theme: THEME.light,
    themeName: 'light',
    toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeName, setThemeName] = useState<ThemeName>('dark');
    const theme = THEME[themeName];
    const toggleTheme = () => setThemeName(prev => prev === 'light' ? 'dark' : 'light');

    useEffect(() => {
        document.body.style.backgroundColor = theme.background;
        document.body.style.color = theme.text;
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, themeName, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};


//================================================================================================
// SECTION 4: MOCK DATA & API LAYER
// This section simulates fetching and generating the complex financial data for The Nexus.
//================================================================================================

/**
 * @function generateMockNexusData
 * @description Creates a rich, interconnected dataset for demonstration purposes.
 * @returns {NexusGraphData} A complete graph data object.
 */
export const generateMockNexusData = (): NexusGraphData => {
  const nodes: NexusNode[] = [];
  const links: NexusLink[] = [];

  const visionaryId = 'visionary-01';
  nodes.push({
    id: visionaryId,
    type: NexusEntityType.VISIONARY,
    label: 'The Visionary',
    timestamp: Date.now(),
    netWorth: 125430.5,
    riskTolerance: 'medium',
  });
  
  // ... continue with a large amount of mock data generation
  const checkingAccountId = 'acc-chk-01';
  nodes.push({
    id: checkingAccountId,
    type: NexusEntityType.ACCOUNT,
    label: 'Primary Checking',
    timestamp: Date.now(),
    accountType: 'checking',
    balance: 5230.12,
    currency: 'USD',
    institution: 'Nexus Bank'
  });
  links.push({ id: `link-${visionaryId}-${checkingAccountId}`, source: visionaryId, target: checkingAccountId, type: NexusLinkType.OWNERSHIP, strength: 1.0 });

  const savingsAccountId = 'acc-sav-01';
  nodes.push({
    id: savingsAccountId,
    type: NexusEntityType.ACCOUNT,
    label: 'Emergency Fund',
    timestamp: Date.now(),
    accountType: 'savings',
    balance: 15000.00,
    currency: 'USD',
    institution: 'Nexus Bank'
  });
  links.push({ id: `link-${visionaryId}-${savingsAccountId}`, source: visionaryId, target: savingsAccountId, type: NexusLinkType.OWNERSHIP, strength: 1.0 });

  const creditCardId = 'acc-cc-01';
  nodes.push({
    id: creditCardId,
    type: NexusEntityType.ACCOUNT,
    label: 'Travel Rewards CC',
    timestamp: Date.now(),
    accountType: 'credit',
    balance: -1245.33,
    currency: 'USD',
    institution: 'Capital Two'
  });
  links.push({ id: `link-${visionaryId}-${creditCardId}`, source: visionaryId, target: creditCardId, type: NexusLinkType.OWNERSHIP, strength: 1.0 });
  
  const salaryId = 'inc-salary-01';
  nodes.push({
      id: salaryId,
      type: NexusEntityType.INCOME_SOURCE,
      label: 'Salary (Tech Corp)',
      timestamp: Date.now(),
      monthlyAmount: 6000,
      isStable: true,
      sourceType: 'salary'
  });
  links.push({id: `link-${salaryId}-${checkingAccountId}`, source: salaryId, target: checkingAccountId, type: NexusLinkType.FUNDING, strength: 0.9});

  const freelanceId = 'inc-freelance-01';
  nodes.push({
      id: freelanceId,
      type: NexusEntityType.INCOME_SOURCE,
      label: 'Freelance Design',
      timestamp: Date.now(),
      monthlyAmount: 800,
      isStable: false,
      sourceType: 'freelance'
  });
  links.push({id: `link-${freelanceId}-${checkingAccountId}`, source: freelanceId, target: checkingAccountId, type: NexusLinkType.FUNDING, strength: 0.1});


  const rentId = 'rpay-rent-01';
  nodes.push({
      id: rentId,
      type: NexusEntityType.RECURRING_PAYMENT,
      label: 'Apartment Rent',
      timestamp: Date.now(),
      amount: 2200,
      frequency: 'monthly',
      nextDueDate: new Date().setDate(1)
  });
  links.push({id: `link-${rentId}-${checkingAccountId}`, source: rentId, target: checkingAccountId, type: NexusLinkType.SERVICE, strength: 1.0});

  const groceriesBudgetId = 'bud-groceries-01';
  nodes.push({
      id: groceriesBudgetId,
      type: NexusEntityType.BUDGET,
      label: 'Groceries',
      limit: 400,
      spent: 250.78,
      period: 'monthly',
      variance: (250.78 / 400 - 1) * 100
  });

  const entertainmentBudgetId = 'bud-ent-01';
  nodes.push({
      id: entertainmentBudgetId,
      type: NexusEntityType.BUDGET,
      label: 'Entertainment',
      limit: 200,
      spent: 250,
      period: 'monthly',
      variance: (250 / 200 - 1) * 100
  });

  const transactions: TransactionNode[] = Array.from({ length: 50 }, (_, i) => {
    const isGroceries = Math.random() > 0.5;
    const amount = isGroceries ? (Math.random() * 50 + 10) : (Math.random() * 80 + 15);
    return {
        id: `txn-${i}`,
        type: NexusEntityType.TRANSACTION,
        label: `TXN #${i+1}`,
        timestamp: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000),
        amount: -amount,
        currency: 'USD',
        category: isGroceries ? 'Groceries' : 'Entertainment',
        isRecurring: false,
        vendor: isGroceries ? 'Whole Foods' : 'Cinema Paradiso',
    }
  });

  nodes.push(...transactions);
  transactions.forEach(txn => {
      links.push({ id: `link-${creditCardId}-${txn.id}`, source: creditCardId, target: txn.id, type: NexusLinkType.PAYMENT, strength: txn.amount / 100 });
      const budgetId = txn.category === 'Groceries' ? groceriesBudgetId : entertainmentBudgetId;
      links.push({ id: `link-${txn.id}-${budgetId}`, source: txn.id, target: budgetId, type: NexusLinkType.IMPACT, strength: txn.amount / 50 });
  });

  const houseGoalId = 'goal-house-01';
  nodes.push({
      id: houseGoalId,
      type: NexusEntityType.GOAL,
      label: 'House Down Payment',
      targetAmount: 50000,
      currentAmount: 15000,
      deadline: new Date().setFullYear(new Date().getFullYear() + 3),
      priority: 'critical',
      progress: 15000 / 50000
  });
  links.push({ id: `link-${savingsAccountId}-${houseGoalId}`, source: savingsAccountId, target: houseGoalId, type: NexusLinkType.ALLOCATION, strength: 1.0 });
  
  const vacationGoalId = 'goal-vacation-01';
  nodes.push({
      id: vacationGoalId,
      type: NexusEntityType.GOAL,
      label: 'Japan Trip',
      targetAmount: 8000,
      currentAmount: 6000,
      deadline: new Date().setFullYear(new Date().getFullYear() + 1),
      priority: 'high',
      progress: 6000 / 8000
  });

  const overspendingInsightId = 'ins-overspend-01';
  nodes.push({
      id: overspendingInsightId,
      type: NexusEntityType.INSIGHT,
      label: 'Entertainment Overspend',
      severity: 'warning',
      description: 'Entertainment spending is 25% over budget, potentially delaying the Japan Trip goal.',
      actionable: true
  });

  links.push({ id: `link-${entertainmentBudgetId}-${overspendingInsightId}`, source: entertainmentBudgetId, target: overspendingInsightId, type: NexusLinkType.EVIDENCE, strength: 0.8 });
  links.push({ id: `link-${overspendingInsightId}-${vacationGoalId}`, source: overspendingInsightId, target: vacationGoalId, type: NexusLinkType.RECOMMENDATION, strength: 0.8 });


  return { nodes, links };
};

/**
 * @function fetchNexusData
 * @description Simulates an asynchronous API call to get Nexus data.
 * @returns {Promise<NexusGraphData>} A promise that resolves with the graph data.
 */
export const fetchNexusData = async (): Promise<NexusGraphData> => {
  console.log('Fetching Nexus data...');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Nexus data received.');
      resolve(generateMockNexusData());
    }, 1500);
  });
};


//================================================================================================
// SECTION 5: UTILITY FUNCTIONS
// Helper functions for math, transformations, and other common tasks.
//================================================================================================

/**
 * @function clamp
 * @description Constrains a value between a minimum and maximum.
 */
export const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(value, max));

/**
 * @function distance
 * @description Calculates the Euclidean distance between two points.
 */
export const distance = (p1: Vector2D, p2: Vector2D): number => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

/**
 * @function getInterpolatedColor
 * @description Interpolates between two colors.
 */
export const getInterpolatedColor = (color1: string, color2: string, factor: number): string => {
  const c1 = parseInt(color1.substring(1), 16);
  const c2 = parseInt(color2.substring(1), 16);
  const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * @function formatCurrency
 * @description Formats a number as a currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};


//================================================================================================
// SECTION 6: CORE REACT HOOKS
// Custom hooks encapsulating the complex logic of The Nexus.
//================================================================================================

/**
 * @hook useNexusData
 * @description Manages fetching, processing, and filtering of the Nexus graph data.
 */
export const useNexusData = (filters: FilterState) => {
  const [rawData, setRawData] = useState<NexusGraphData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchNexusData();
        setRawData(data);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to fetch data'));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    if (!rawData) return null;

    const filteredNodes = rawData.nodes.filter(node => {
        if (!filters.enabledNodeTypes.has(node.type)) return false;
        
        const timestamp = node.timestamp;
        if (timestamp < filters.dateRange.start || timestamp > filters.dateRange.end) return false;

        if (filters.searchTerm && !node.label.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
            return false;
        }

        if ('amount' in node && typeof node.amount === 'number') {
            const absAmount = Math.abs(node.amount);
            if (absAmount < filters.amountRange.min || absAmount > filters.amountRange.max) return false;
        }

        return true;
    });

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    const filteredLinks = rawData.links.filter(link =>
      filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [rawData, filters]);

  return { graphData: filteredData, isLoading, error, initialData: rawData };
};

/**
 * @hook useForceSimulation
 * @description A from-scratch force-directed graph simulation engine.
 */
export const useForceSimulation = (
    graphData: NexusGraphData | null,
    width: number,
    height: number,
    draggedNodeId: string | null
) => {
    const [simulatedNodes, setSimulatedNodes] = useState<SimulatedNode[]>([]);
    const simulationRef = useRef<number>();

    const nodesMap = useMemo(() => {
        const map = new Map<string, SimulatedNode>();
        simulatedNodes.forEach(node => map.set(node.id, node));
        return map;
    }, [simulatedNodes]);

    const linksWithNodes = useMemo(() => {
        if (!graphData) return [];
        return graphData.links
            .map(link => ({
                ...link,
                sourceNode: nodesMap.get(link.source)!,
                targetNode: nodesMap.get(link.target)!,
            }))
            .filter(l => l.sourceNode && l.targetNode);
    }, [graphData, nodesMap]);


    // Initialize nodes when data changes
    useEffect(() => {
        if (!graphData) return;
        setSimulatedNodes(graphData.nodes.map(node => ({
            ...node,
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0,
            fx: 0,
            fy: 0,
        })));
    }, [graphData, width, height]);
    
    // The main simulation loop
    useEffect(() => {
        let alpha = SIMULATION_CONFIG.simulationAlpha;

        const tick = () => {
            if (alpha < SIMULATION_CONFIG.simulationAlphaMin) {
                cancelAnimationFrame(simulationRef.current!);
                simulationRef.current = undefined;
                return;
            }

            // Update alpha
            alpha += (SIMULATION_CONFIG.simulationAlphaMin - alpha) * SIMULATION_CONFIG.simulationAlphaDecay;

            setSimulatedNodes(currentNodes => {
                const newNodes = currentNodes.map(n => ({...n, fx: 0, fy: 0}));

                // Apply forces
                // 1. Link force (spring)
                linksWithNodes.forEach(link => {
                    const { sourceNode, targetNode } = link;
                    const dx = targetNode.x - sourceNode.x;
                    const dy = targetNode.y - sourceNode.y;
                    const d = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = (d - SIMULATION_CONFIG.linkDistance) / d * SIMULATION_CONFIG.linkStrength * alpha;
                    
                    const dxForce = dx * force;
                    const dyForce = dy * force;

                    const sourceMassRatio = targetNode.mass / (sourceNode.mass + targetNode.mass);
                    const targetMassRatio = sourceNode.mass / (sourceNode.mass + targetNode.mass);
                    
                    sourceNode.vx += dxForce * sourceMassRatio;
                    sourceNode.vy += dyForce * sourceMassRatio;
                    targetNode.vx -= dxForce * targetMassRatio;
                    targetNode.vy -= dyForce * targetMassRatio;
                });
                
                // 2. Charge force (repulsion)
                for (let i = 0; i < newNodes.length; i++) {
                    for (let j = i + 1; j < newNodes.length; j++) {
                        const nodeA = newNodes[i];
                        const nodeB = newNodes[j];
                        const dx = nodeB.x - nodeA.x;
                        const dy = nodeB.y - nodeA.y;
                        let d2 = dx * dx + dy * dy;
                        
                        if (d2 < SIMULATION_CONFIG.chargeDistanceMin ** 2) d2 = SIMULATION_CONFIG.chargeDistanceMin ** 2;
                        if (d2 > SIMULATION_CONFIG.chargeDistanceMax ** 2) continue;

                        const force = SIMULATION_CONFIG.chargeStrength / d2 * alpha;

                        const dxForce = dx * force;
                        const dyForce = dy * force;

                        nodeA.vx += dxForce;
                        nodeA.vy += dyForce;
                        nodeB.vx -= dxForce;
                        nodeB.vy -= dyForce;
                    }
                }

                // 3. Center force
                newNodes.forEach(node => {
                    node.vx += (width / 2 - node.x) * SIMULATION_CONFIG.centerForce * alpha;
                    node.vy += (height / 2 - node.y) * SIMULATION_CONFIG.centerForce * alpha;
                });

                // Update positions
                return newNodes.map(node => {
                    if (node.isFixed) {
                        return { ...node, vx: 0, vy: 0 };
                    }
                    
                    // Apply velocity decay (friction)
                    node.vx *= SIMULATION_CONFIG.velocityDecay;
                    node.vy *= SIMULATION_CONFIG.velocityDecay;

                    // Update position
                    node.x += node.vx;
                    node.y += node.vy;
                    
                    // Boundary collision (simple)
                    node.x = clamp(node.x, 0, width);
                    node.y = clamp(node.y, 0, height);

                    return node;
                });
            });

            simulationRef.current = requestAnimationFrame(tick);
        };
        
        simulationRef.current = requestAnimationFrame(tick);

        return () => {
            if (simulationRef.current) {
                cancelAnimationFrame(simulationRef.current);
            }
        };
    }, [linksWithNodes, width, height]);


    const updateNodePosition = useCallback((nodeId: string, pos: { x: number, y: number, isFixed: boolean }) => {
        setSimulatedNodes(nodes => nodes.map(n => n.id === nodeId ? { ...n, ...pos } : n));
        // Restart simulation
    }, []);

    return { simulatedNodes, linksWithNodes, updateNodePosition };
};


/**
 * @hook useGraphInteractions
 * @description Manages all user interactions: pan, zoom, drag, select, hover.
 */
export const useGraphInteractions = (
    svgRef: React.RefObject<SVGSVGElement>,
    updateNodePosition: (nodeId: string, pos: { x: number, y: number, isFixed: boolean }) => void
) => {
    const [viewport, setViewport] = useState<ViewportTransform>({ x: 0, y: 0, k: 1 });
    const [interaction, setInteraction] = useState<InteractionState>({
        selectedNodeId: null,
        hoveredNodeId: null,
        draggedNodeId: null,
        contextMenu: null,
    });
    
    const isDraggingRef = useRef(false);
    const startDragPointRef = useRef<{x: number, y: number} | null>(null);

    const getSVGPoint = useCallback((clientX: number, clientY: number) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const pt = svgRef.current.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const screenCTM = svgRef.current.getScreenCTM();
        if (screenCTM) {
            return pt.matrixTransform(screenCTM.inverse());
        }
        return pt;
    }, [svgRef]);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const { clientX, clientY, deltaY } = e;
        const point = getSVGPoint(clientX, clientY);
        
        const zoomFactor = Math.pow(1.001, -deltaY);
        
        setViewport(v => {
            const newK = clamp(v.k * zoomFactor, 0.1, 10);
            const newX = point.x - (point.x - v.x) * (newK / v.k);
            const newY = point.y - (point.y - v.y) * (newK / v.k);
            return { x: newX, y: newY, k: newK };
        });
    }, [getSVGPoint]);
    
    const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (e.button !== 0) return; // Only left-click
        isDraggingRef.current = true;
        startDragPointRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current || !startDragPointRef.current) return;
        const dx = e.clientX - startDragPointRef.current.x;
        const dy = e.clientY - startDragPointRef.current.y;
        
        setViewport(v => ({...v, x: v.x + dx / v.k, y: v.y + dy / v.k}));
        startDragPointRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        startDragPointRef.current = null;
    }, []);

    const onNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        setInteraction(i => ({...i, draggedNodeId: nodeId}));
        const point = getSVGPoint(e.clientX, e.clientY);
        updateNodePosition(nodeId, { x: point.x, y: point.y, isFixed: true });
    }, [getSVGPoint, updateNodePosition]);

    const onNodeMouseMove = useCallback((e: React.MouseEvent) => {
        if (interaction.draggedNodeId) {
            const point = getSVGPoint(e.clientX, e.clientY);
            updateNodePosition(interaction.draggedNodeId, { x: point.x, y: point.y, isFixed: true });
        }
    }, [interaction.draggedNodeId, getSVGPoint, updateNodePosition]);

    const onNodeMouseUp = useCallback((e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        updateNodePosition(nodeId, { x: e.clientX, y: e.clientY, isFixed: false });
        setInteraction(i => ({ ...i, draggedNodeId: null, selectedNodeId: nodeId }));
    }, [updateNodePosition]);


    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if(interaction.draggedNodeId) {
                const point = getSVGPoint(e.clientX, e.clientY);
                updateNodePosition(interaction.draggedNodeId, { x: point.x, y: point.y, isFixed: true });
            } else if (isDraggingRef.current && startDragPointRef.current) {
                const dx = e.clientX - startDragPointRef.current.x;
                const dy = e.clientY - startDragPointRef.current.y;
                setViewport(v => ({...v, x: v.x + dx, y: v.y + dy}));
                startDragPointRef.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleGlobalMouseUp = () => {
             if (interaction.draggedNodeId) {
                const lastPos = getSVGPoint(window.event.clientX, window.event.clientY);
                updateNodePosition(interaction.draggedNodeId, {x: lastPos.x, y: lastPos.y, isFixed: false});
                setInteraction(i => ({...i, draggedNodeId: null }));
             }
             if (isDraggingRef.current) {
                isDraggingRef.current = false;
                startDragPointRef.current = null;
             }
        };

        svg.addEventListener('wheel', handleWheel);
        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            svg.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [svgRef, handleWheel, interaction.draggedNodeId, getSVGPoint, updateNodePosition]);
    
    const onNodeClick = useCallback((e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        if (interaction.draggedNodeId) return; // Prevent click on drag end
        setInteraction(i => ({ ...i, selectedNodeId: i.selectedNodeId === nodeId ? null : nodeId }));
    }, [interaction.draggedNodeId]);
    
    const onNodeMouseEnter = useCallback((nodeId: string) => {
        setInteraction(i => ({ ...i, hoveredNodeId: nodeId }));
    }, []);

    const onNodeMouseLeave = useCallback(() => {
        setInteraction(i => ({ ...i, hoveredNodeId: null }));
    }, []);
    
    const onCanvasClick = useCallback(() => {
        setInteraction(i => ({...i, selectedNodeId: null}));
    }, []);


    return {
        viewport,
        interaction,
        onNodeMouseDown,
        onNodeMouseUp,
        onCanvasClick,
        onNodeClick,
        onNodeMouseEnter,
        onNodeMouseLeave,
        handleMouseDown,
        // onNodeMouseMove is handled globally
    };
};


//================================================================================================
// SECTION 7: UI COMPONENTS
// The building blocks of The Nexus view, from individual nodes to control panels.
//================================================================================================

/**
 * @component NexusNodeComponent
 * @description Renders a single node in the graph with appropriate styling and interactivity.
 */
export const NexusNodeComponent = React.memo(({
    node,
    onMouseDown,
    onMouseUp,
    onClick,
    onMouseEnter,
    onMouseLeave,
    isSelected,
    isHovered,
    isDragged,
}: {
    node: SimulatedNode;
    onMouseDown: (e: React.MouseEvent, id: string) => void;
    onMouseUp: (e: React.MouseEvent, id: string) => void;
    onClick: (e: React.MouseEvent, id: string) => void;
    onMouseEnter: (id: string) => void;
    onMouseLeave: () => void;
    isSelected: boolean;
    isHovered: boolean;
    isDragged: boolean;
}) => {
    const { theme } = useTheme();
    const config = NODE_VISUAL_CONFIG[node.type];
    const color = theme[config.colorKey as keyof Theme] || theme.neutral;
    const radius = config.baseRadius;
    const springProps = useSpring({
      transform: `translate(${node.x}, ${node.y})`,
      config: { mass: 1, tension: 500, friction: 40 }
    });
    
    const pulseSpring = useSpring({
       r: isSelected || isHovered ? radius * 1.2 : radius,
       strokeWidth: isSelected ? 4 : 2,
       config: { tension: 300, friction: 10 }
    });

    return (
        <animated.g
            transform={springProps.transform}
            onMouseDown={(e) => onMouseDown(e, node.id)}
            onMouseUp={(e) => onMouseUp(e, node.id)}
            onClick={(e) => onClick(e, node.id)}
            onMouseEnter={() => onMouseEnter(node.id)}
            onMouseLeave={onMouseLeave}
            style={{ cursor: isDragged ? 'grabbing' : 'grab' }}
        >
            <animated.circle
                r={pulseSpring.r}
                fill={color}
                stroke={isSelected ? theme.accent1 : theme.border}
                strokeWidth={pulseSpring.strokeWidth}
                opacity={isDragged ? 0.7 : 1}
            />
            <config.icon
                x={-radius * 0.6}
                y={-radius * 0.6}
                width={radius * 1.2}
                height={radius * 1.2}
                fill={theme.background}
            />
            {(isHovered || isSelected) && (
                <text
                    y={radius + 15}
                    textAnchor="middle"
                    fill={theme.text}
                    fontSize="12px"
                    paintOrder="stroke"
                    stroke={theme.background}
                    strokeWidth="3px"
                    strokeLinejoin="round"
                >
                    {node.label}
                </text>
            )}
        </animated.g>
    );
});

/**
 * @component NexusLinkComponent
 * @description Renders a single link between two nodes.
 */
export const NexusLinkComponent = React.memo(({ link }: { link: SimulatedLink }) => {
    const { theme } = useTheme();
    const config = LINK_VISUAL_CONFIG[link.type];
    const color = theme[config.colorKey as keyof Theme] || theme.neutral;
    
    const springProps = useSpring({
        d: `M${link.sourceNode.x},${link.sourceNode.y} L${link.targetNode.x},${link.targetNode.y}`,
        config: { mass: 1, tension: 500, friction: 40 }
    });

    return (
        <animated.path
            d={springProps.d}
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeDasharray={config.dashed ? '5,5' : 'none'}
            fill="none"
            opacity={0.6}
        />
    );
});

/**
 * @component NexusDossierPanel
 * @description A side panel that displays detailed information about the selected node.
 */
export const NexusDossierPanel = React.memo(({ node, onClose }: { node: NexusNode | null; onClose: () => void; }) => {
    const { theme } = useTheme();
    const springProps = useSpring({
        transform: node ? 'translateX(0%)' : 'translateX(100%)',
        config: { tension: 210, friction: 20 }
    });

    if (!node) return null;

    const renderNodeDetails = () => {
        switch (node.type) {
            case NexusEntityType.GOAL:
                const goal = node as GoalNode;
                return (
                    <>
                        <p>Target: {formatCurrency(goal.targetAmount)}</p>
                        <p>Saved: {formatCurrency(goal.currentAmount)}</p>
                        <p>Progress: {(goal.progress * 100).toFixed(1)}%</p>
                        <p>Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                        <p>Priority: {goal.priority}</p>
                    </>
                );
            case NexusEntityType.ACCOUNT:
                const account = node as AccountNode;
                return (
                    <>
                        <p>Balance: {formatCurrency(account.balance, account.currency)}</p>
                        <p>Institution: {account.institution}</p>
                        <p>Type: {account.accountType}</p>
                    </>
                );
            default:
                return <p>Details not available for this node type.</p>;
        }
    };
    
    return (
        <animated.div style={{
            ...springProps,
            position: 'absolute',
            top: 0,
            right: 0,
            width: '350px',
            height: '100%',
            backgroundColor: theme.background,
            borderLeft: `1px solid ${theme.border}`,
            padding: '20px',
            boxSizing: 'border-box',
            color: theme.text,
            overflowY: 'auto',
            boxShadow: '-5px 0 15px rgba(0,0,0,0.1)'
        }}>
            <button onClick={onClose} style={{ float: 'right', background: 'none', border: 'none', color: theme.text, fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            <h2>{node.label}</h2>
            <p style={{ color: theme.textSecondary, fontStyle: 'italic' }}>{node.type}</p>
            <hr style={{ borderColor: theme.border, margin: '20px 0' }}/>
            {renderNodeDetails()}
        </animated.div>
    );
});


/**
 * @component NexusControls
 * @description UI controls for filtering and interacting with the Nexus graph.
 */
export const NexusControls = React.memo(({ filters, setFilters, initialData } : {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    initialData: NexusGraphData | null;
}) => {
    const { theme, toggleTheme, themeName } = useTheme();

    const handleTypeToggle = (type: NexusEntityType) => {
        setFilters(f => {
            const newTypes = new Set(f.enabledNodeTypes);
            if (newTypes.has(type)) {
                newTypes.delete(type);
            } else {
                newTypes.add(type);
            }
            return { ...f, enabledNodeTypes: newTypes };
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(f => ({ ...f, searchTerm: e.target.value }));
    };

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: theme.background,
            padding: '15px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            width: '300px',
            zIndex: 10
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Nexus Controls</h3>
            <input 
              type="text"
              placeholder="Search nodes..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', background: theme.background, color: theme.text, border: `1px solid ${theme.border}` }}
            />
            <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Node Types</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {Object.values(NexusEntityType).map(type => (
                    <button
                        key={type}
                        onClick={() => handleTypeToggle(type)}
                        style={{
                            padding: '5px 10px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: filters.enabledNodeTypes.has(type) ? theme.primary : 'transparent',
                            color: filters.enabledNodeTypes.has(type) ? theme.background : theme.text
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>
            <button onClick={toggleTheme} style={{ marginTop: '20px', width: '100%', padding: '10px', background: theme.primary, color: theme.background, border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Switch to {themeName === 'light' ? 'Dark' : 'Light'} Mode
            </button>
        </div>
    );
});

/**
 * @component LoadingSpinner
 * @description A simple loading spinner.
 */
export const LoadingSpinner: React.FC = () => {
    const { theme } = useTheme();
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <div style={{
                border: `4px solid ${theme.border}`,
                borderTop: `4px solid ${theme.primary}`,
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '20px' }}>Awakening the Nexus...</p>
        </div>
    );
};

//================================================================================================
// SECTION 8: THE MAIN VIEW COMPONENT
// TheNexusView orchestrates all hooks and components to create the final experience.
//================================================================================================

export const TheNexusView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    enabledNodeTypes: new Set(Object.values(NexusEntityType)),
    dateRange: { start: 0, end: Date.now() },
    amountRange: { min: 0, max: Infinity },
    searchTerm: '',
  });

  const { graphData, isLoading, error, initialData } = useNexusData(filters);

  const { simulatedNodes, linksWithNodes, updateNodePosition } = useForceSimulation(
    graphData,
    dimensions.width,
    dimensions.height,
    null // This will be passed from interaction state later
  );

  const { viewport, interaction, onNodeMouseDown, onNodeMouseUp, onCanvasClick, onNodeClick, onNodeMouseEnter, onNodeMouseLeave, handleMouseDown } = useGraphInteractions(svgRef, updateNodePosition);
  
  const selectedNode = useMemo(() => {
      if (!interaction.selectedNodeId || !graphData) return null;
      return graphData.nodes.find(n => n.id === interaction.selectedNodeId) || null;
  }, [interaction.selectedNodeId, graphData]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <NexusControls filters={filters} setFilters={setFilters} initialData={initialData} />
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onClick={onCanvasClick}
        style={{ cursor: 'move' }}
      >
        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.k})`}>
          {linksWithNodes.map(link => (
            <NexusLinkComponent key={link.id} link={link} />
          ))}
          {simulatedNodes.map(node => (
            <NexusNodeComponent
              key={node.id}
              node={node}
              onMouseDown={onNodeMouseDown}
              onMouseUp={onNodeMouseUp}
              onClick={onNodeClick}
              onMouseEnter={onNodeMouseEnter}
              onMouseLeave={onNodeMouseLeave}
              isSelected={interaction.selectedNodeId === node.id}
              isHovered={interaction.hoveredNodeId === node.id}
              isDragged={interaction.draggedNodeId === node.id}
            />
          ))}
        </g>
      </svg>
      <NexusDossierPanel node={selectedNode} onClose={() => onCanvasClick()} />
    </div>
  );
};

/**
 * @function App
 * @description A wrapper component to provide the theme to TheNexusView.
 */
export const AppWrapper = () => {
    return (
        <ThemeProvider>
            <TheNexusView />
        </ThemeProvider>
    );
};

export default AppWrapper;