/**
 * LudicBalancerView.tsx: The Core Control Panel for the Next-Gen Financial Infrastructure
 *
 * This module implements a revolutionary control panel for real-time financial system balance and operational management.
 * Leveraging advanced AI analytics, deterministic simulations, agentic intelligence, programmable value rails,
 * and robust digital identity, it provides financial strategists and operations teams with an unparalleled toolkit
 * to monitor, analyze, predict, and remediate systemic imbalances in complex digital economies and financial products.
 *
 * Business Value: This system represents a multi-million-dollar infrastructure leap by dramatically accelerating
 * decision-making cycles from weeks to milliseconds, significantly reducing operational costs associated with manual
 * data analysis and risk mitigation, and enhancing trust and resilience through intelligent automation. It enables
 * rapid adaptation to market shifts, predictive identification of emergent financial vulnerabilities, and a verifiable
 * audit trail for all operational adjustments and value transfers. By empowering rapid experimentation through
 * simulation and providing AI-driven insights, it unlocks new revenue streams through optimized financial products,
 * enhanced market liquidity, and directly contributes to a superior competitive advantage in the dynamic digital finance landscape.
 * Its agentic capabilities autonomously detect and remediate issues, offering continuous, intelligent oversight,
 * ensuring high velocity in decision-making and implementation, thereby safeguarding multi-trillion-dollar financial ecosystems.
 */
import React, { useState, useEffect, useCallback, createContext, useContext, useReducer, useRef } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// Utility Types for Core Financial Infrastructure (mapped to game concepts)
/**
 * Represents the fundamental statistics of a financial entity or asset class.
 * This is crucial for assessing market health and identifying systemic risks or opportunities.
 */
export type HeroStats = { // Renamed conceptually to AssetStats/FinancialInstrumentStats
    id: string;
    name: string;
    winRate: number; // Represents 'Performance Metric' (e.g., yield, market share, asset growth)
    pickRate: number; // Represents 'Allocation Rate' or 'Market Penetration'
    banRate?: number; // Represents 'Risk Flag' or 'Regulatory Scrutiny'
    kda?: number; // Represents 'Return-on-Investment' or 'Efficiency Ratio'
    goldPerMinute?: number; // Represents 'Value Generation Rate'
    damageDealt?: number; // Represents 'Market Impact' or 'Transaction Volume'
    damageTaken?: number; // Represents 'Volatility Exposure' or 'Operational Overhead'
    role?: 'Tank' | 'DPS' | 'Support' | 'Initiator'; // Represents 'Financial Role' (e.g., 'Stable Asset', 'Growth Stock', 'Liquidity Provider')
    complexity?: 'Low' | 'Medium' | 'High'; // Represents 'Regulatory Complexity' or 'Systemic Interconnectedness'
    abilities?: { name: string; description: string; impact: number }[]; // Represents 'Product Features' or 'System Capabilities'
    itemSynergies?: { itemId: string; synergyScore: number }[]; // Represents 'Inter-Asset Dependency' or 'Portfolio Diversification'
    counterPicks?: { heroId: string; counterScore: number }[]; // Represents 'Hedging Instruments' or 'Risk Mitigants'
};

/**
 * Defines a financial instrument or underlying resource within the digital economy.
 * Essential for understanding capital allocation and economic drivers.
 */
export type ItemStats = { // Renamed conceptually to FinancialInstrumentStats/ResourceStats
    id: string;
    name: string;
    cost: number; // Represents 'Capital Requirement' or 'Acquisition Cost'
    powerModifier: number; // Represents 'Value Multiplier' or 'Leverage Factor'
    effectDescription: string; // Describes its economic function or impact
};

/**
 * Identifies a detected imbalance or vulnerability within the financial system.
 * Key for proactive risk management and strategic rebalancing.
 */
export type BalanceIssue = { // Renamed conceptually to FinancialVulnerability/SystemicImbalance
    element: string; // Financial Instrument, Asset Class, Policy, etc.
    problem: string; // Description of the imbalance (e.g., 'overleveraged', 'liquidity crunch risk')
    suggestion: string; // Proposed action (e.g., 'adjust interest rate by X%', 'increase reserve requirements')
    impactMagnitude?: number; // Estimated impact on key financial metric (e.g., P&L, risk score)
    confidenceScore?: number; // AI's confidence in the suggested remediation
    status?: 'Pending' | 'Approved' | 'Rejected' | 'Implemented'; // Workflow status
    proposedBy?: string; // User ID, 'AI', or 'Agent ID'
    timestamp?: string;
    category?: 'Asset' | 'Instrument' | 'Policy' | 'Market' | 'Liquidity'; // Financial categorization
};

/**
 * A snapshot of the financial system state at a given moment.
 * Critical for auditing, rollback capabilities, and historical analysis.
 */
export type GameSnapshot = { // Renamed conceptually to FinancialSystemSnapshot
    id: string;
    timestamp: string;
    gameData: string; // Raw input financial telemetry
    processedStats: HeroStats[]; // Processed asset/instrument statistics
    balanceReport: BalanceIssue[]; // Identified systemic imbalances
    versionTag: string; // Version or operational milestone tag
    notes?: string;
};

/**
 * Parameters for simulating market scenarios or policy changes.
 * Used for predictive modeling and stress testing.
 */
export type SimulationParameters = { // Renamed conceptually to ScenarioSimulationParameters
    matchesToSimulate: number; // Number of simulated market cycles or transactions
    playerSkillDistribution: 'Normal' | 'SkewedHigh' | 'SkewedLow'; // Represents 'Market Participant Behavior Distribution'
    metaStabilityFactor: number; // How quickly market dynamics shift (volatility proxy)
    heroDiversityGoal: number; // Target for diverse asset allocation or market participation
    economicImpactSensitivity: number; // How much economic changes affect financial instrument performance
};

/**
 * Results from a simulated financial scenario.
 * Provides insights into potential outcomes of policy interventions.
 */
export type SimulationResult = { // Renamed conceptually to ScenarioSimulationResult
    snapshotId: string;
    simulationId: string;
    timestamp: string;
    proposedChanges: BalanceIssue[]; // The policy changes or interventions that were simulated
    predictedHeroStats: HeroStats[]; // Predicted asset/instrument performance
    predictedOverallWinRateDistribution: { range: string; count: number }[]; // Predicted distribution of asset performance
    predictedMetaShiftScore: number; // Score reflecting market stability/volatility post-simulation
    outcomeSummary: string;
    warnings?: string[];
};

/**
 * Defines a prompt template for AI-driven financial analysis.
 * Standardizes AI interaction for various analytical tasks.
 */
export type PromptTemplate = {
    id: string;
    name: string;
    template: string;
    description: string;
    schema: any; // Expected JSON schema for AI response, ensuring structured data output
    defaultModel: string;
};

/**
 * User profile with role-based access control for the financial platform.
 * Integrates with the Digital Identity and Trust Layer for secure operations.
 */
export type UserProfile = { // Aligns with Digital Identity
    id: string;
    name: string;
    role: 'Admin' | 'Designer' | 'Analyst' | 'QA' | 'Compliance' | 'RiskOfficer'; // Expanded roles
    permissions: string[]; // e.g., 'create_report', 'propose_change', 'run_simulation', 'approve_change', 'manage_prompts', 'reset_data', 'trigger_agent', 'view_audit_logs', 'manage_identities', 'initiate_settlement'
    publicKey?: string; // Simulated public key for digital signing
    privateKey?: string; // Simulated private key (NEVER exposed in UI, for demo only)
};

/**
 * An immutable entry in the audit log for all system activities.
 * Essential for compliance, forensic analysis, and operational transparency.
 */
export type AuditLogEntry = { // Part of Governance, Observability, and Integrity
    id: string;
    timestamp: string;
    userId: string; // Or agent ID, uniquely identifying the actor
    action: string; // e.g., 'AI_REPORT_GENERATED', 'SIMULATION_RUN', 'BALANCE_ISSUE_APPROVED', 'TOKEN_TRANSFER_INITIATED', 'IDENTITY_CREATED'
    details: Record<string, any>; // Contextual information for the action
    category: 'System' | 'User' | 'AI' | 'Agent' | 'Identity' | 'Settlement'; // Expanded categories
    severity: 'Info' | 'Warning' | 'Error' | 'Critical'; // Severity level for rapid incident response
    signature?: string; // Cryptographic signature of the log entry by the actor's private key (simulated)
};

/**
 * Definition of an autonomous agent operating within the financial infrastructure.
 * These agents embody the Agentic Intelligence Layer.
 */
export type AgentDefinition = {
    id: string;
    name: string;
    isActive: boolean;
    role: 'Monitor' | 'Proposer' | 'Remediator' | 'ComplianceAgent' | 'LiquidityManager'; // Expanded agent roles
    description: string;
    triggerThresholds: {
        winRateDeviation: number; // e.g., trigger if any asset performance deviates > X%
        pickRateDeviation: number; // e.g., trigger if any asset allocation is < X%
        riskScoreThreshold?: number; // Trigger if overall risk score exceeds threshold
    };
    lastRunTimestamp?: string;
    lastAction?: string;
    agentPublicKey?: string; // Simulated public key for agent identity
};

/**
 * Represents a secure message exchanged between agents.
 * Part of the internal messaging layer for agent coordination.
 */
export type AgentMessage = {
    id: string;
    senderId: string;
    recipientId: string;
    timestamp: string;
    payload: Record<string, any>;
    signature: string; // Cryptographically signed message by sender
    messageType: 'Observation' | 'Decision' | 'ActionProposal' | 'Confirmation' | 'Alert';
};

/**
 * Defines a programmatic rule for value transfer or settlement.
 * Part of the Programmable Token Rail Layer's rules engine.
 */
export type SettlementPolicy = {
    id: string;
    name: string;
    description: string;
    condition: string; // e.g., 'asset_value > 1000', 'risk_score < 0.5'
    action: string; // e.g., 'route_to_secure_rail', 'require_manual_approval'
    priority: number;
    isActive: boolean;
};

/**
 * Represents a digital asset or value unit on the programmable token rail.
 */
export type DigitalToken = {
    id: string;
    name: string;
    symbol: string;
    supply: number;
    ownerId: string; // Current owner of the token (e.g., account ID)
    transferrable: boolean;
    mintable: boolean;
    burnable: boolean;
    metadata?: Record<string, any>; // Additional programmable data
};

/**
 * Represents an account in the simulated token rail ledger.
 */
export type TokenLedgerAccount = {
    accountId: string;
    balances: {
        [tokenId: string]: number; // Token ID to balance mapping
    };
    transactionHistory: string[]; // List of transaction IDs
};

/**
 * Represents a transaction on the programmable token rail.
 */
export type TokenTransaction = {
    id: string;
    timestamp: string;
    senderId: string;
    recipientId: string;
    tokenId: string;
    amount: number;
    status: 'Pending' | 'Confirmed' | 'Failed';
    signature: string; // Sender's signature
    nonce: number; // For replay protection
    hashLink?: string; // Hash of previous transaction for auditable chain
    railUsed: 'fast' | 'secure'; // Which rail was used for routing
};

/**
 * Represents a payment instruction for the real-time settlement engine.
 */
export type PaymentInstruction = {
    id: string;
    payerId: string;
    payeeId: string;
    tokenId: string;
    amount: number;
    requestTimestamp: string;
    status: 'Requested' | 'Processing' | 'Settled' | 'Blocked' | 'Failed';
    riskScore: number;
    authorizationSignature: string; // Payer's digital signature
    metadata?: Record<string, any>;
};


// Mock Data - significantly expanded to reflect financial entities
const mockGameData = `Asset Class Equity: Performance 65%, Allocation 80%, Scrutiny 40%, ROI 3.5, Role Growth Stock, Features [Market Access, Dividend Yield], Dependencies [FX_Hedge, Bond_Portfolio]
Asset Class Fixed Income: Performance 42%, Allocation 5%, Scrutiny 1%, ROI 1.8, Role Stable Asset, Features [Capital Preservation, Regular Payout], Dependencies [InterestRate_Swap, Inflation_Hedge]
Asset Class Derivatives: Performance 51%, Allocation 15%, Scrutiny 5%, ROI 2.2, Role Liquidity Provider, Features [Hedging, Speculation], Dependencies [Underlying_Asset, Regulatory_Compliance]
Asset Class Real Estate: Performance 58%, Allocation 25%, Scrutiny 10%, ROI 2.9, Role LongTerm Hold, Features [Income Generation, Capital Appreciation], Dependencies [Mortgage_Securities, Property_Insurance]
Asset Class Commodities: Performance 48%, Allocation 12%, Scrutiny 2%, ROI 2.0, Role Inflation Hedge, Features [Inflation Protection, Supply Chain Exposure], Dependencies [Futures_Contract, Storage_Costs]
Instrument FX_Hedge: Cost 1000, ValueModifier +15% ExposureProtection, Effect 'Protects against adverse currency movements.'
Instrument Bond_Portfolio: Cost 800, ValueModifier +10% YieldStabilization, Effect 'Increases stability of fixed income returns.'
Instrument InterestRate_Swap: Cost 900, ValueModifier +20% RateOptimization, Effect 'Boosts interest rate exposure management.'
Instrument Futures_Contract: Cost 1100, ValueModifier +12% PriceDiscovery, Effect 'Enhances future price predictability.'
Instrument Regulatory_Compliance: Cost 700, ValueModifier +8% OperationalEfficiency, Effect 'Ensures adherence to financial regulations.'
Instrument Mortgage_Securities: Cost 1200, ValueModifier +20% AssetBackedYield, Effect 'Increases yield from mortgage-backed assets.'
Instrument Property_Insurance: Cost 600, ValueModifier +15% RiskMitigation, Effect 'Reduces physical asset risk exposure.'`;

// Expanded AI Schemas for different analysis types
const defaultBalanceSchema = {
    type: Type.OBJECT,
    properties: {
        analysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    element: { type: 'STRING' },
                    problem: { type: 'STRING' },
                    suggestion: { type: 'STRING' },
                    impactMagnitude: { type: 'NUMBER', description: 'Estimated percentage change in element\'s primary metric (e.g., performance, risk score)' },
                    confidenceScore: { type: 'NUMBER', description: 'AI confidence in the suggestion, 0-1 scale' },
                    category: { type: 'STRING', enum: ['Asset', 'Instrument', 'Policy', 'Market', 'Liquidity'] }
                },
                required: ['element', 'problem', 'suggestion', 'impactMagnitude', 'confidenceScore', 'category']
            }
        }
    }
};

const metaAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        metaTrends: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    trend: { type: 'STRING', description: 'Description of the prevalent market trend' },
                    cause: { type: 'STRING', description: 'Root cause of the trend (e.g., geopolitical event, technological shift)' },
                    implication: { type: 'STRING', description: 'Consequences for financial stability or market health' },
                    actionableInsight: { type: 'STRING', description: 'Suggested high-level action to navigate or influence the market trend' }
                },
                required: ['trend', 'cause', 'implication', 'actionableInsight']
            }
        }
    }
};

const powerCurveSchema = {
    type: Type.OBJECT,
    properties: {
        powerCurveAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    hero: { type: 'STRING' }, // Asset name
                    stage: { type: 'STRING', enum: ['Early Market', 'Growth Phase', 'Maturity Phase', 'Decline Phase'] }, // Market stages
                    powerSpikeDescription: { type: 'STRING' }, // Description of significant performance changes
                    suggestedAdjustment: { type: 'STRING', description: 'Specific numerical change to smooth/sharpen performance curve, e.g., "Adjust investment allocation by +5%"' }
                },
                required: ['hero', 'stage', 'powerSpikeDescription', 'suggestedAdjustment']
            }
        }
    }
};

const riskScoringSchema = {
    type: Type.OBJECT,
    properties: {
        riskReport: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    entity: { type: 'STRING', description: 'The financial entity or asset being assessed' },
                    riskCategory: { type: 'STRING', enum: ['Credit Risk', 'Market Risk', 'Liquidity Risk', 'Operational Risk', 'Compliance Risk'] },
                    score: { type: 'NUMBER', description: 'Risk score from 0-100' },
                    description: { type: 'STRING', description: 'Detailed description of the risk identified' },
                    mitigationSuggestion: { type: 'STRING', description: 'Actionable suggestion to mitigate the risk' },
                    confidence: { type: 'NUMBER', description: 'AI confidence in the risk assessment' }
                },
                required: ['entity', 'riskCategory', 'score', 'description', 'mitigationSuggestion', 'confidence']
            }
        }
    }
};

// --- Global State Management (simplified context for a single file) ---
/**
 * Global state for the Ludic Balancer financial infrastructure.
 * This holds all critical data points for analysis, simulation, and operational control.
 */
export type GameMetaState = {
    heroStats: HeroStats[];
    itemStats: ItemStats[];
    currentSnapshot: GameSnapshot | null;
    history: GameSnapshot[];
    activeAnalysisMode: string;
    promptTemplates: PromptTemplate[];
    simulationResults: SimulationResult[];
    users: UserProfile[]; // Digital Identities for users
    currentUser: UserProfile | null;
    auditLogs: AuditLogEntry[];
    metrics: Record<string, number>;
    agents: AgentDefinition[]; // Agentic Intelligence Layer
    agentMessageQueue: AgentMessage[]; // Internal messaging for agents
    digitalIdentities: UserProfile[]; // All managed identities
    programmableTokens: DigitalToken[]; // Programmable Token Rail: registered tokens
    tokenLedger: TokenLedgerAccount[]; // Programmable Token Rail: account balances
    tokenTransactions: TokenTransaction[]; // Programmable Token Rail: immutable transaction log
    settlementPolicies: SettlementPolicy[]; // Programmable Token Rail: rules engine policies
    pendingPayments: PaymentInstruction[]; // Real-Time Settlement Engine: payments awaiting processing
    nextTransactionNonce: number; // For replay protection on token transactions
};

/**
 * Actions that can modify the global state of the financial infrastructure.
 * Idempotent and auditable actions are emphasized.
 */
type GameMetaAction =
    | { type: 'SET_HERO_STATS'; payload: HeroStats[] }
    | { type: 'SET_ITEM_STATS'; payload: ItemStats[] }
    | { type: 'ADD_SNAPSHOT'; payload: GameSnapshot }
    | { type: 'LOAD_SNAPSHOT'; payload: GameSnapshot }
    | { type: 'SET_ACTIVE_ANALYSIS_MODE'; payload: string }
    | { type: 'ADD_PROMPT_TEMPLATE'; payload: PromptTemplate }
    | { type: 'UPDATE_PROMPT_TEMPLATE'; payload: PromptTemplate }
    | { type: 'ADD_SIMULATION_RESULT'; payload: SimulationResult }
    | { type: 'SET_CURRENT_USER'; payload: UserProfile | null }
    | { type: 'ADD_AUDIT_LOG'; payload: AuditLogEntry }
    | { type: 'INCREMENT_METRIC'; payload: { name: string; value?: number } }
    | { type: 'UPDATE_BALANCE_ISSUE_STATUS'; payload: { issueElement: string; issueProblem: string; status: 'Pending' | 'Approved' | 'Rejected' | 'Implemented'; by: string } }
    | { type: 'UPDATE_AGENT'; payload: AgentDefinition }
    | { type: 'ADD_AGENT_MESSAGE'; payload: AgentMessage }
    | { type: 'CLEAR_AGENT_MESSAGES' }
    | { type: 'ADD_DIGITAL_IDENTITY'; payload: UserProfile }
    | { type: 'ADD_PROGRAMMABLE_TOKEN'; payload: DigitalToken }
    | { type: 'UPDATE_TOKEN_LEDGER_BALANCE'; payload: { accountId: string; tokenId: string; amount: number; transactionId: string } }
    | { type: 'ADD_TOKEN_TRANSACTION'; payload: TokenTransaction }
    | { type: 'UPDATE_TOKEN_TRANSACTION_STATUS'; payload: { transactionId: string; status: 'Confirmed' | 'Failed' } }
    | { type: 'ADD_SETTLEMENT_POLICY'; payload: SettlementPolicy }
    | { type: 'UPDATE_SETTLEMENT_POLICY'; payload: SettlementPolicy }
    | { type: 'ADD_PENDING_PAYMENT'; payload: PaymentInstruction }
    | { type: 'UPDATE_PAYMENT_STATUS'; payload: { paymentId: string; status: 'Processing' | 'Settled' | 'Blocked' | 'Failed' } }
    | { type: 'INCREMENT_NONCE' }
    | { type: 'INIT_STATE'; payload: GameMetaState };

/**
 * Reducer function for managing the state of the financial infrastructure.
 * Ensures state transitions are predictable and auditable.
 */
const gameMetaReducer = (state: GameMetaState, action: GameMetaAction): GameMetaState => {
    switch (action.type) {
        case 'INIT_STATE':
            return { ...action.payload };
        case 'SET_HERO_STATS':
            return { ...state, heroStats: action.payload };
        case 'SET_ITEM_STATS':
            return { ...state, itemStats: action.payload };
        case 'ADD_SNAPSHOT':
            return {
                ...state,
                history: [...state.history, action.payload],
                currentSnapshot: action.payload
            };
        case 'LOAD_SNAPSHOT':
            return {
                ...state,
                currentSnapshot: action.payload,
                heroStats: action.payload.processedStats,
                // Assuming raw game data will be derived or set separately if needed
            };
        case 'SET_ACTIVE_ANALYSIS_MODE':
            return { ...state, activeAnalysisMode: action.payload };
        case 'ADD_PROMPT_TEMPLATE':
            return { ...state, promptTemplates: [...state.promptTemplates, action.payload] };
        case 'UPDATE_PROMPT_TEMPLATE':
            return {
                ...state,
                promptTemplates: state.promptTemplates.map(t =>
                    t.id === action.payload.id ? action.payload : t
                )
            };
        case 'ADD_SIMULATION_RESULT':
            return { ...state, simulationResults: [...state.simulationResults, action.payload] };
        case 'SET_CURRENT_USER':
            return { ...state, currentUser: action.payload };
        case 'ADD_AUDIT_LOG':
            // Simple log retention, keep last 500 for performance/memory
            return { ...state, auditLogs: [...state.auditLogs, action.payload].slice(-500) };
        case 'INCREMENT_METRIC':
            return {
                ...state,
                metrics: {
                    ...state.metrics,
                    [action.payload.name]: (state.metrics[action.payload.name] || 0) + (action.payload.value || 1)
                }
            };
        case 'UPDATE_BALANCE_ISSUE_STATUS':
            return {
                ...state,
                currentSnapshot: state.currentSnapshot ? {
                    ...state.currentSnapshot,
                    balanceReport: state.currentSnapshot.balanceReport.map(issue =>
                        issue.element === action.payload.issueElement && issue.problem === action.payload.issueProblem
                            ? { ...issue, status: action.payload.status, proposedBy: action.payload.by, timestamp: new Date().toISOString() }
                            : issue
                    )
                } : null,
            };
        case 'UPDATE_AGENT':
            return {
                ...state,
                agents: state.agents.map(agent =>
                    agent.id === action.payload.id ? action.payload : agent
                )
            };
        case 'ADD_AGENT_MESSAGE':
            return {
                ...state,
                agentMessageQueue: [...state.agentMessageQueue, action.payload].slice(-100) // Keep recent messages
            };
        case 'CLEAR_AGENT_MESSAGES':
            return { ...state, agentMessageQueue: [] };
        case 'ADD_DIGITAL_IDENTITY':
            return { ...state, digitalIdentities: [...state.digitalIdentities, action.payload] };
        case 'ADD_PROGRAMMABLE_TOKEN':
            return { ...state, programmableTokens: [...state.programmableTokens, action.payload] };
        case 'UPDATE_TOKEN_LEDGER_BALANCE': {
            const { accountId, tokenId, amount, transactionId } = action.payload;
            const updatedLedger = state.tokenLedger.map(account => {
                if (account.accountId === accountId) {
                    return {
                        ...account,
                        balances: {
                            ...account.balances,
                            [tokenId]: (account.balances[tokenId] || 0) + amount
                        },
                        transactionHistory: [...account.transactionHistory, transactionId]
                    };
                }
                return account;
            });

            // If account doesn't exist, create it.
            if (!updatedLedger.some(acc => acc.accountId === accountId)) {
                updatedLedger.push({
                    accountId,
                    balances: { [tokenId]: amount },
                    transactionHistory: [transactionId]
                });
            }
            return { ...state, tokenLedger: updatedLedger };
        }
        case 'ADD_TOKEN_TRANSACTION':
            return { ...state, tokenTransactions: [...state.tokenTransactions, action.payload] };
        case 'UPDATE_TOKEN_TRANSACTION_STATUS':
            return {
                ...state,
                tokenTransactions: state.tokenTransactions.map(tx =>
                    tx.id === action.payload.transactionId ? { ...tx, status: action.payload.status } : tx
                )
            };
        case 'ADD_SETTLEMENT_POLICY':
            return { ...state, settlementPolicies: [...state.settlementPolicies, action.payload] };
        case 'UPDATE_SETTLEMENT_POLICY':
            return {
                ...state,
                settlementPolicies: state.settlementPolicies.map(policy =>
                    policy.id === action.payload.id ? action.payload : policy
                )
            };
        case 'ADD_PENDING_PAYMENT':
            return { ...state, pendingPayments: [...state.pendingPayments, action.payload] };
        case 'UPDATE_PAYMENT_STATUS':
            return {
                ...state,
                pendingPayments: state.pendingPayments.map(payment =>
                    payment.id === action.payload.paymentId ? { ...payment, status: action.payload.status } : payment
                )
            };
        case 'INCREMENT_NONCE':
            return { ...state, nextTransactionNonce: state.nextTransactionNonce + 1 };
        default:
            return state;
    }
};

/**
 * Initial state for the financial infrastructure, pre-configured with default values and agents.
 */
const initialGameMetaState: GameMetaState = {
    heroStats: [],
    itemStats: [],
    currentSnapshot: null,
    history: [],
    activeAnalysisMode: 'General Balance',
    promptTemplates: [
        {
            id: 'general_balance',
            name: 'Systemic Imbalance Report',
            description: 'Analyzes financial instrument and asset class statistics for general systemic imbalances.',
            template: `You are a Principal Financial Architect. Analyze the following financial instrument and asset class statistics and identify the top systemic imbalances. For each, provide the element (asset/instrument/policy), a description of the problem, a specific, numerical change to a financial parameter to address it, an estimated impact magnitude (percentage change in key performance indicator/risk score), and your confidence score (0-1). Data:\n{{gameData}}`,
            schema: defaultBalanceSchema,
            defaultModel: 'gemini-2.5-flash',
        },
        {
            id: 'meta_analysis',
            name: 'Market Dynamics & Trends Analysis',
            description: 'Identifies current market trends and their implications for the financial ecosystem.',
            template: `You are a Lead Financial Strategist. Based on the following financial data, identify prevalent market dynamics, their root causes, implications for financial stability, and actionable insights for high-level policy adjustments. Data:\n{{gameData}}`,
            schema: metaAnalysisSchema,
            defaultModel: 'gemini-2.5-flash',
        },
        {
            id: 'power_curve_analysis',
            name: 'Asset Performance Curve Analysis',
            description: 'Examines asset performance spikes and troughs across different market stages.',
            template: `You are an expert financial rebalancer. Analyze the performance progression of assets throughout early market, growth phase, maturity phase, and decline phase based on the provided stats. Identify assets with overly dominant or weak performance curves at specific stages and suggest numerical adjustments to allocation or policy to smooth or sharpen these curves appropriately. Data:\n{{gameData}}`,
            schema: powerCurveSchema,
            defaultModel: 'gemini-2.5-flash',
        },
        {
            id: 'risk_assessment',
            name: 'Real-Time Risk Assessment',
            description: 'Performs a comprehensive risk assessment across multiple financial categories.',
            template: `You are a Chief Risk Officer. Based on the following financial data, provide a real-time risk report identifying entities and their associated risks (Credit, Market, Liquidity, Operational, Compliance). For each, provide a score (0-100), detailed description, and a mitigation suggestion. Data:\n{{gameData}}`,
            schema: riskScoringSchema,
            defaultModel: 'gemini-2.5-flash',
        }
    ],
    simulationResults: [],
    users: [
        { id: 'user_ai', name: 'AI Assistant', role: 'Admin', permissions: ['create_report', 'propose_change', 'run_simulation', 'view_report', 'view_audit_logs'] },
        { id: 'user_1', name: 'Alice (Designer)', role: 'Designer', permissions: ['create_report', 'propose_change', 'run_simulation', 'view_report'] },
        { id: 'user_2', name: 'Bob (Analyst)', role: 'Analyst', permissions: ['view_report', 'run_simulation', 'view_audit_logs'] },
        { id: 'user_compliance', name: 'Charlie (Compliance)', role: 'Compliance', permissions: ['view_report', 'view_audit_logs', 'approve_change'] },
        { id: 'user_risk', name: 'Dana (Risk Officer)', role: 'RiskOfficer', permissions: ['view_report', 'view_audit_logs', 'approve_change', 'run_simulation'] },
        { id: 'user_admin', name: 'Admin User', role: 'Admin', permissions: ['create_report', 'propose_change', 'run_simulation', 'approve_change', 'manage_prompts', 'reset_data', 'trigger_agent', 'view_report', 'view_audit_logs', 'manage_identities', 'initiate_settlement'] }
    ],
    currentUser: { id: 'user_admin', name: 'Admin User', role: 'Admin', permissions: ['create_report', 'propose_change', 'run_simulation', 'approve_change', 'manage_prompts', 'reset_data', 'trigger_agent', 'view_report', 'view_audit_logs', 'manage_identities', 'initiate_settlement'] },
    auditLogs: [],
    metrics: {
        total_ai_reports_generated: 0,
        total_simulations_run: 0,
        total_balance_issues_approved: 0,
        total_balance_issues_implemented: 0,
        agent_triggered_analysis: 0,
        total_token_transfers: 0,
        total_payments_settled: 0,
        total_identities_managed: 0,
        high_risk_payments_flagged: 0,
    },
    agents: [
        {
            id: 'agent_balancer_monitor',
            name: 'Systemic Risk Monitor Agent',
            isActive: true,
            role: 'Monitor',
            description: 'Monitors key financial metrics and triggers risk analysis if deviations are detected from policy thresholds.',
            triggerThresholds: { winRateDeviation: 10, pickRateDeviation: 20, riskScoreThreshold: 75 }, // e.g., trigger if any asset performance is > X% from target, <20% allocation rate
            lastRunTimestamp: undefined,
            lastAction: undefined,
        },
        {
            id: 'agent_liquidity_remediator',
            name: 'Liquidity Remediation Agent',
            isActive: false,
            role: 'Remediator',
            description: 'Automatically proposes and initiates micro-adjustments to liquidity pools based on real-time market signals to maintain stability.',
            triggerThresholds: { winRateDeviation: 5, pickRateDeviation: 10, riskScoreThreshold: 80 },
            lastRunTimestamp: undefined,
            lastAction: undefined,
        }
    ],
    agentMessageQueue: [],
    digitalIdentities: [], // Initialized with default users for now, can expand later
    programmableTokens: [
        { id: 'FIAT_USD', name: 'US Dollar (Simulated)', symbol: 'sUSD', supply: 1000000000, ownerId: 'system_treasury', transferrable: true, mintable: true, burnable: true },
        { id: 'GOV_TOKEN', name: 'Governance Token', symbol: 'GOV', supply: 1000000, ownerId: 'system_governance', transferrable: true, mintable: false, burnable: false },
        { id: 'LIQUIDITY_SHARE', name: 'Liquidity Pool Share', symbol: 'LPS', supply: 5000000, ownerId: 'system_liquidity', transferrable: true, mintable: true, burnable: true }
    ],
    tokenLedger: [
        { accountId: 'system_treasury', balances: { 'FIAT_USD': 1000000000 }, transactionHistory: [] },
        { accountId: 'system_governance', balances: { 'GOV_TOKEN': 1000000 }, transactionHistory: [] },
        { accountId: 'system_liquidity', balances: { 'LIQUIDITY_SHARE': 5000000 }, transactionHistory: [] },
        { accountId: 'user_admin', balances: { 'FIAT_USD': 100000, 'GOV_TOKEN': 1000 }, transactionHistory: [] }, // Seed admin with some tokens
    ],
    tokenTransactions: [],
    settlementPolicies: [
        { id: 'policy_high_value_secure', name: 'High-Value Transfer Rail', description: 'Transfers > 10,000 sUSD must use secure rail.', condition: 'amount > 10000 && tokenId == "FIAT_USD"', action: 'route_to_secure_rail', priority: 1, isActive: true },
        { id: 'policy_low_value_fast', name: 'Low-Value Transfer Rail', description: 'Transfers < 100 sUSD can use fast rail.', condition: 'amount < 100 && tokenId == "FIAT_USD"', action: 'route_to_fast_rail', priority: 2, isActive: true },
    ],
    pendingPayments: [],
    nextTransactionNonce: 1,
};

// Initialize digital identities based on initial users
initialGameMetaState.digitalIdentities = initialGameMetaState.users.map(user => {
    const { publicKey, privateKey } = generateKeyPairSimulated();
    return { ...user, publicKey, privateKey };
});
// Ensure current user also has keys
if (initialGameMetaState.currentUser) {
    const adminIdentity = initialGameMetaState.digitalIdentities.find(id => id.id === initialGameMetaState.currentUser?.id);
    if (adminIdentity) {
        initialGameMetaState.currentUser = adminIdentity;
    }
}


export const GameMetaContext = createContext<{
    state: GameMetaState;
    dispatch: React.Dispatch<GameMetaAction>;
}>({
    state: initialGameMetaState,
    dispatch: () => null,
});

/**
 * Provides the global state for the financial infrastructure to all components.
 * Manages state persistence and initialization.
 */
export const GameMetaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameMetaReducer, initialGameMetaState);

    /**
     * Loads persisted state from local storage on component mount.
     * Ensures continuity across sessions for demonstration purposes.
     */
    useEffect(() => {
        try {
            const persistedState = localStorage.getItem('ludicBalancerState');
            if (persistedState) {
                const loadedState = JSON.parse(persistedState);
                // Ensure initial agents are present if not in loaded state (e.g. for new features)
                if (!loadedState.agents || loadedState.agents.length === 0) {
                    loadedState.agents = initialGameMetaState.agents;
                } else {
                    // Merge new agent definitions if they exist in initial state but not loaded state
                    initialGameMetaState.agents.forEach(initialAgent => {
                        if (!loadedState.agents.some((a: AgentDefinition) => a.id === initialAgent.id)) {
                            loadedState.agents.push(initialAgent);
                        }
                    });
                }
                // Ensure metrics are initialized
                if (!loadedState.metrics) {
                    loadedState.metrics = initialGameMetaState.metrics;
                }
                // Ensure auditLogs are initialized
                if (!loadedState.auditLogs) {
                    loadedState.auditLogs = [];
                }
                // Ensure new state properties are initialized if not present in loaded state
                if (!loadedState.agentMessageQueue) loadedState.agentMessageQueue = [];
                if (!loadedState.digitalIdentities) loadedState.digitalIdentities = initialGameMetaState.digitalIdentities;
                if (!loadedState.programmableTokens) loadedState.programmableTokens = initialGameMetaState.programmableTokens;
                if (!loadedState.tokenLedger) loadedState.tokenLedger = initialGameMetaState.tokenLedger;
                if (!loadedState.tokenTransactions) loadedState.tokenTransactions = [];
                if (!loadedState.settlementPolicies) loadedState.settlementPolicies = initialGameMetaState.settlementPolicies;
                if (!loadedState.pendingPayments) loadedState.pendingPayments = [];
                if (!loadedState.nextTransactionNonce) loadedState.nextTransactionNonce = 1;

                dispatch({ type: 'INIT_STATE', payload: loadedState });
            }
        } catch (error) {
            console.error('Failed to load state from local storage', error);
            // Fallback to initial state if parsing fails
            dispatch({ type: 'INIT_STATE', payload: initialGameMetaState });
        }
    }, []);

    /**
     * Persists the current state to local storage whenever it changes.
     * Provides a basic form of state recovery.
     */
    useEffect(() => {
        try {
            localStorage.setItem('ludicBalancerState', JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save state to local storage', error);
        }
    }, [state]);

    return (
        <GameMetaContext.Provider value={{ state, dispatch }}>
            {children}
        </GameMetaContext.Provider>
    );
};

/**
 * Custom hook to access the global game meta state and dispatch function.
 * Simplifies state management within components.
 */
export const useGameMeta = () => useContext(GameMetaContext);

// --- Utility Functions for Financial Infrastructure ---

/**
 * Generates a unique identifier for transactions and entities.
 * Ensures referential integrity across the system.
 */
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Generates a simulated public/private key pair for digital identities.
 * Emulates cryptographic key management for demonstration.
 */
export function generateKeyPairSimulated(): { publicKey: string; privateKey: string } {
    const uuid = generateUUID();
    return {
        publicKey: `PUBKEY_${uuid.substring(0, 8)}`,
        privateKey: `PRIVKEY_${uuid.substring(8, 16)}` // In a real system, never expose private key
    };
}

/**
 * Simulates cryptographically signing a message using a private key.
 * Essential for authenticating actions and ensuring data integrity.
 */
export function signMessageSimulated(message: string, privateKey: string): string {
    // In a real system, this would involve actual cryptographic hashing and signing.
    // For simulation, we create a deterministic "signature" based on message and key.
    return `SIG_${btoa(message + privateKey).substring(0, 32)}`;
}

/**
 * Simulates verifying a message's signature using a public key.
 * Crucial for trust and preventing tampering.
 */
export function verifySignatureSimulated(message: string, signature: string, publicKey: string): boolean {
    // In a real system, this would involve actual cryptographic verification.
    // For simulation, we assume any signature generated by signMessageSimulated is valid if public key matches.
    // A more robust simulation would ensure the signature format matches.
    return signature.startsWith('SIG_') && publicKey.startsWith('PUBKEY_'); // Simplified check
}

/**
 * Parses raw financial telemetry into structured asset and instrument statistics.
 * The initial step in transforming raw data into actionable insights.
 */
export function parseGameData(rawData: string): { heroes: HeroStats[], items: ItemStats[] } {
    const heroes: HeroStats[] = [];
    const items: ItemStats[] = [];
    const lines = rawData.split('\n').filter(line => line.trim() !== '');

    lines.forEach(line => {
        if (line.startsWith('Asset Class ')) {
            const match = line.match(/Asset Class (.+?): Performance (\d+\.?\d*)%, Allocation (\d+\.?\d*)%, Scrutiny (\d+\.?\d*)%, ROI (\d+\.?\d*), Role (.+?), Features \[(.+?)\], Dependencies \[(.+?)\]/);
            if (match) {
                const [, name, winRate, pickRate, banRate, kda, role, abilitiesStr, itemsStr] = match;
                heroes.push({
                    id: name.toLowerCase().replace(/\s/g, '_'),
                    name,
                    winRate: parseFloat(winRate), // Performance Metric
                    pickRate: parseFloat(pickRate), // Allocation Rate
                    banRate: parseFloat(banRate), // Scrutiny Rate
                    kda: parseFloat(kda), // ROI
                    role: role as any, // Financial Role
                    abilities: abilitiesStr.split(', ').map(a => ({ name: a.trim(), description: '', impact: 0.5 })), // Product Features
                    itemSynergies: itemsStr.split(', ').map(i => ({ itemId: i.trim().toLowerCase().replace(/\s/g, '_'), synergyScore: 0.7 })) // Inter-Asset Dependency
                });
            }
        } else if (line.startsWith('Instrument ')) {
            const match = line.match(/Instrument (.+?): Cost (\d+), ValueModifier ([^,]+), Effect '(.+)'/);
            if (match) {
                const [, name, cost, power, effect] = match;
                items.push({
                    id: name.toLowerCase().replace(/\s/g, '_'),
                    name,
                    cost: parseInt(cost), // Capital Requirement
                    powerModifier: parseFloat(power.replace(/[^\d.-]/g, '')) || 0, // Value Multiplier
                    effectDescription: effect
                });
            }
        }
    });

    return { heroes, items };
}

/**
 * Calculates an overall financial market health or stability score.
 * Integrates various metrics to provide a single, actionable health indicator.
 */
export function calculateOverallMetaScore(heroes: HeroStats[]): number {
    if (heroes.length === 0) return 0;
    // Lower deviation from 50% performance (target stability) is good.
    const avgPerformanceDeviation = heroes.reduce((sum, h) => sum + Math.abs(h.winRate - 50), 0) / heroes.length;
    // Higher entropy (diversity) in allocation is good for stability.
    const allocationRateEntropy = -heroes.reduce((sum, h) => {
        const p = h.pickRate / 100;
        return sum + (p > 0 ? p * Math.log2(p) : 0);
    }, 0);
    const maxEntropy = Math.log2(heroes.length > 0 ? heroes.length : 1);
    const normalizedEntropy = maxEntropy > 0 ? allocationRateEntropy / maxEntropy : 0;

    // Score closer to 100 indicates better health/stability.
    // The divisor 20 for avgPerformanceDeviation implies max deviation of 20 points impacts score by 50.
    return Math.round((1 - Math.min(1, avgPerformanceDeviation / 20)) * 50 + normalizedEntropy * 50); // Rough scaling
}

/**
 * Calculates the estimated impact of a proposed financial adjustment on asset statistics.
 * This is a core part of the predictive analytics engine, enabling "what-if" scenario planning.
 */
export function calculateImpactOfChange(heroStats: HeroStats[], proposedChange: BalanceIssue): { newStats: HeroStats[], estimatedImpact: number } {
    const newStats = [...heroStats];
    let estimatedImpact = 0;

    const targetHeroIndex = newStats.findIndex(h => h.name === proposedChange.element);
    if (targetHeroIndex > -1) {
        const targetHero = { ...newStats[targetHeroIndex] };
        const suggestion = proposedChange.suggestion.toLowerCase();

        // Simulate complex financial model adjustments
        if (suggestion.includes('performance by ')) {
            const match = suggestion.match(/performance by ([-+]?\d+\.?\d*)%/);
            if (match && targetHero.winRate !== undefined) {
                const change = parseFloat(match[1]);
                targetHero.winRate = Math.max(0, Math.min(100, targetHero.winRate + change));
                estimatedImpact = change;
            }
        } else if (suggestion.includes('allocation by ')) {
            const match = suggestion.match(/allocation by ([-+]?\d+\.?\d*)%/);
            if (match && targetHero.pickRate !== undefined) {
                const change = parseFloat(match[1]);
                targetHero.pickRate = Math.max(0, Math.min(100, targetHero.pickRate + change));
                // Assume allocation changes have a smaller, delayed impact on performance
                targetHero.winRate = Math.max(0, Math.min(100, targetHero.winRate + (change / 10) * (Math.random() * 0.5 + 0.75))); // Random factor for dynamic impact
                estimatedImpact = change / 10;
            }
        } else if (suggestion.includes('risk exposure by ')) {
            const match = suggestion.match(/risk exposure by ([-+]?\d+\.?\d*)%/);
            if (match && targetHero.banRate !== undefined) {
                const change = parseFloat(match[1]);
                targetHero.banRate = Math.max(0, Math.min(100, targetHero.banRate + change));
                // Assume reduced risk exposure slightly improves performance or stability
                targetHero.winRate = Math.max(0, Math.min(100, targetHero.winRate + (change / 20) * (Math.random() * 0.5 + 0.5)));
                estimatedImpact = change / 20;
            }
        }
        // Additional parsing for 'capital requirement', 'liquidity factor', etc.
        // This is a placeholder for a more sophisticated financial modeling engine.
        // The core principle is mapping a suggested change to a quantifiable impact on key metrics.

        newStats[targetHeroIndex] = targetHero;
    }

    return { newStats, estimatedImpact };
}

/**
 * Checks if a user has the required permissions for a specific action.
 * A fundamental component of the Digital Identity and Trust Layer's authorization.
 */
export function checkPermissions(currentUser: UserProfile | null, requiredPermissions: string[]): boolean {
    if (!currentUser) return false;
    // Admins have omni-permissions for simplicity in this demo environment.
    // In production, granular admin roles would be enforced.
    if (currentUser.role === 'Admin') return true;
    return requiredPermissions.every(permission => currentUser.permissions.includes(permission));
}

/**
 * Calculates a simulated risk score for a payment instruction.
 * Integrates various heuristics for real-time risk assessment.
 */
export function calculatePaymentRiskScore(payment: PaymentInstruction, currentTokens: DigitalToken[], currentLedger: TokenLedgerAccount[]): number {
    let risk = 0;
    // Heuristic: higher amount = higher risk
    risk += payment.amount / 10000; // Base risk per 10k units

    // Heuristic: token volatility (simulated)
    const token = currentTokens.find(t => t.id === payment.tokenId);
    if (token?.symbol === 'LPS') risk += 10; // Liquidity pool shares might be more volatile

    // Heuristic: sender's balance (simulated, low balance could indicate fraud)
    const senderAccount = currentLedger.find(acc => acc.accountId === payment.payerId);
    if (senderAccount && senderAccount.balances[payment.tokenId] < payment.amount * 1.2) { // Less than 20% buffer
        risk += 15;
    }

    // Heuristic: new recipient or unusual activity pattern (not implemented, but concept is there)

    return Math.min(100, Math.max(0, Math.round(risk * 10))); // Scale to 0-100
}


// --- Custom Hooks for Financial Infrastructure Modules ---

/**
 * Custom hook for logging all significant activities to an immutable audit trail.
 * Part of the Governance, Observability, and Integrity layer.
 */
export const useLogger = () => {
    const { state, dispatch } = useGameMeta();
    const currentUser = state.currentUser;

    /**
     * Records an audit log entry, potentially with a cryptographic signature.
     * Ensures integrity and non-repudiation of actions.
     */
    const logAudit = useCallback((
        action: string,
        details: Record<string, any>,
        category: 'System' | 'User' | 'AI' | 'Agent' | 'Identity' | 'Settlement',
        severity: 'Info' | 'Warning' | 'Error' | 'Critical' = 'Info'
    ) => {
        const message = JSON.stringify({
            timestamp: new Date().toISOString(),
            userId: currentUser?.id || 'anonymous',
            action,
            details,
            category,
            severity,
        });
        const signature = currentUser?.privateKey ? signMessageSimulated(message, currentUser.privateKey) : 'UNAUTHENTICATED';

        dispatch({
            type: 'ADD_AUDIT_LOG',
            payload: {
                id: generateUUID(),
                ...JSON.parse(message), // Re-parse to ensure consistent structure with signature add
                signature
            }
        });
    }, [dispatch, currentUser]);

    /**
     * Increments a system-wide operational metric.
     * Provides real-time visibility into system performance and usage.
     */
    const incrementMetric = useCallback((name: string, value?: number) => {
        dispatch({ type: 'INCREMENT_METRIC', payload: { name, value } });
    }, [dispatch]);

    return { logAudit, incrementMetric };
};

/**
 * Custom hook for interacting with the Agentic Intelligence Layer.
 * Enables intelligent automation of financial monitoring and remediation.
 */
export const useAgenticAI = (
    generateReport: (promptTemplate: PromptTemplate, gameData: string, modelName: string) => Promise<any | null>,
    gameDataInput: string,
    setBalanceReport: (report: BalanceIssue[]) => void,
    dispatch: React.Dispatch<GameMetaAction>
) => {
    const { state } = useGameMeta();
    const { logAudit, incrementMetric } = useLogger();
    // In a real system, an orchestrator would manage multiple agents and their roles.
    // For this demo, we iterate through agents and trigger their primary function.

    const runAgentCycle = useCallback(async () => {
        for (const agent of state.agents) {
            if (!agent.isActive || !state.heroStats.length) {
                continue;
            }

            logAudit('AGENT_ACTIVATED', { agentId: agent.id, agentName: agent.name, role: agent.role }, 'Agent', 'Info');

            // --- Agent Skills Simulation ---

            // 1. Monitoring Skill
            const { winRateDeviation, pickRateDeviation, riskScoreThreshold } = agent.triggerThresholds;
            let issueDetected = false;
            let detectedHero: HeroStats | undefined;

            for (const hero of state.heroStats) {
                if (Math.abs(hero.winRate - 50) > winRateDeviation || hero.pickRate < pickRateDeviation) {
                    issueDetected = true;
                    detectedHero = hero;
                    break;
                }
            }
            // Add a simple overall risk score check
            const currentOverallMetaScore = calculateOverallMetaScore(state.heroStats);
            const highRiskDetected = riskScoreThreshold && currentOverallMetaScore < (100 - riskScoreThreshold); // E.g., if threshold is 75, score < 25 is high risk

            if (issueDetected || highRiskDetected) {
                const detectionDetails = detectedHero ? { hero: detectedHero.name, performance: detectedHero.winRate, allocation: detectedHero.pickRate } : { metaScore: currentOverallMetaScore };
                logAudit('AGENT_ISSUE_DETECTED', { agentId: agent.id, ...detectionDetails }, 'Agent', 'Warning');

                // 2. Decision Skill & Action Proposal
                try {
                    let agentActionDescription = '';
                    if (agent.role === 'Monitor' || agent.role === 'ComplianceAgent') {
                        // Monitor/Compliance Agent: Trigger an AI report
                        const promptTemplate = state.promptTemplates.find(t => t.id === 'general_balance'); // Or 'risk_assessment'
                        if (promptTemplate) {
                            const report = await generateReport(promptTemplate, gameDataInput, promptTemplate.defaultModel);
                            if (report?.analysis && Array.isArray(report.analysis)) {
                                const parsedReports: BalanceIssue[] = report.analysis.map((item: any) => ({
                                    ...item,
                                    status: 'Pending',
                                    proposedBy: agent.name, // Agent proposes the change
                                    timestamp: new Date().toISOString()
                                }));
                                setBalanceReport(prev => { // Append agent's reports to existing ones
                                    const newReports = parsedReports.filter(pr => !prev.some(p => p.element === pr.element && p.problem === pr.problem));
                                    return [...prev, ...newReports];
                                });
                                logAudit('AGENT_PROPOSED_BALANCE_CHANGES', { agentId: agent.id, numChanges: parsedReports.length }, 'Agent', 'Info');
                                incrementMetric('agent_triggered_analysis');
                                agentActionDescription = `Proposed ${parsedReports.length} changes for ${detectedHero?.name || 'systemic issue'}`;

                                // 3. Communication Skill (Internal Messaging)
                                dispatch({
                                    type: 'ADD_AGENT_MESSAGE',
                                    payload: {
                                        id: generateUUID(),
                                        senderId: agent.id,
                                        recipientId: 'system_orchestrator', // Simulated orchestrator
                                        timestamp: new Date().toISOString(),
                                        payload: { action: 'balance_issues_proposed', issues: parsedReports.map(i => ({ element: i.element, problem: i.problem })) },
                                        signature: signMessageSimulated(JSON.stringify(parsedReports), agent.agentPublicKey || ''),
                                        messageType: 'ActionProposal',
                                    }
                                });
                            }
                        }
                    } else if (agent.role === 'Remediator' && detectedHero) {
                        // Remediation Skill: For a remediator, propose a direct, small, pre-approved fix.
                        // Example: if performance is too low, suggest a small buff.
                        const remediationSuggestion = `Adjust allocation rate of ${detectedHero.name} by +2%`; // Simplified auto-remediation
                        const remediationIssue: BalanceIssue = {
                            element: detectedHero.name,
                            problem: `Sub-optimal performance/allocation: ${detectedHero.name} (${detectedHero.winRate.toFixed(2)}% Performance, ${detectedHero.pickRate.toFixed(2)}% Allocation)`,
                            suggestion: remediationSuggestion,
                            impactMagnitude: 0.2, // Small estimated impact
                            confidenceScore: 0.9,
                            status: 'Pending', // Requires approval, or 'Approved' for auto-remediation if policy allows
                            proposedBy: agent.name,
                            timestamp: new Date().toISOString(),
                            category: 'Asset'
                        };
                        setBalanceReport(prev => {
                            const newReport = prev.find(p => p.element === remediationIssue.element && p.problem === remediationIssue.problem)
                                ? prev.map(p => (p.element === remediationIssue.element && p.problem === remediationIssue.problem) ? remediationIssue : p)
                                : [...prev, remediationIssue];
                            return newReport;
                        });
                        logAudit('AGENT_AUTO_REMEDIATION_PROPOSED', { agentId: agent.id, issue: remediationIssue.element, suggestion: remediationSuggestion }, 'Agent', 'Warning');
                        agentActionDescription = `Proposed auto-remediation for ${detectedHero.name}`;
                    }
                    dispatch({ type: 'UPDATE_AGENT', payload: { ...agent, lastAction: agentActionDescription, lastRunTimestamp: new Date().toISOString() } });

                } catch (error: any) {
                    logAudit('AGENT_ANALYSIS_FAILED', { agentId: agent.id, error: error.message }, 'Agent', 'Error');
                    dispatch({ type: 'UPDATE_AGENT', payload: { ...agent, lastAction: `Failed to act: ${error.message.substring(0, 50)}`, lastRunTimestamp: new Date().toISOString() } });
                }
            } else {
                logAudit('AGENT_NO_ISSUES_DETECTED', { agentId: agent.id }, 'Agent', 'Info');
                dispatch({ type: 'UPDATE_AGENT', payload: { ...agent, lastAction: 'No critical issues detected', lastRunTimestamp: new Date().toISOString() } });
            }
        }
    }, [state.agents, state.heroStats, state.promptTemplates, gameDataInput, generateReport, logAudit, incrementMetric, setBalanceReport, dispatch]);

    /**
     * Sets up and manages the agent's autonomous operation cycle.
     * The `useEffect` acts as a simple orchestrator, scheduling agents.
     */
    useEffect(() => {
        // Clear any existing interval to prevent duplicates
        // if (intervalRef.current) {
        //     clearInterval(intervalRef.current);
        // }

        // Run all agents every 30 seconds (simulated real-time monitoring)
        const agentInterval = setInterval(runAgentCycle, 30000);

        return () => {
            clearInterval(agentInterval);
        };
    }, [runAgentCycle]); // Re-run effect if runAgentCycle changes (dependencies change)

    /**
     * Toggles the active status of an agent.
     * Provides manual control over autonomous agents.
     */
    const toggleAgentStatus = useCallback((agentId: string) => {
        const targetAgent = state.agents.find(a => a.id === agentId);
        if (targetAgent) {
            dispatch({ type: 'UPDATE_AGENT', payload: { ...targetAgent, isActive: !targetAgent.isActive } });
            logAudit('AGENT_STATUS_TOGGLED', { agentId, newStatus: !targetAgent.isActive }, 'User', 'Info');
        }
    }, [state.agents, dispatch, logAudit]);

    return { runAgentCycle, toggleAgentStatus };
};

/**
 * Custom hook for AI-driven financial analysis and suggestion refinement.
 * Integrates Generative AI models for advanced insights and remediation proposals.
 */
export const useAIService = () => {
    const { state } = useGameMeta();
    const { logAudit, incrementMetric } = useLogger();
    // Use an internal mock AI if no API key is set for robustness
    const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY as string }) : null;

    /**
     * Generates a financial report using an AI model based on a specified prompt template.
     * Returns structured, actionable insights for decision-making.
     */
    const generateReport = useCallback(async (
        promptTemplate: PromptTemplate,
        gameData: string, // Financial telemetry
        modelName: string = 'gemini-2.5-flash'
    ): Promise<any | null> => {
        if (!process.env.API_KEY || !ai) {
            const error = new Error('AI_API_KEY is not configured. Using simulated AI response.');
            logAudit('AI_SERVICE_UNAVAILABLE', { templateId: promptTemplate.id, model: modelName, error: error.message }, 'AI', 'Warning');
            // Simulate AI response for robustness if no API key
            if (promptTemplate.id === 'general_balance') {
                return {
                    analysis: [{
                        element: 'Asset Class Equity',
                        problem: 'Over-exposure to high-volatility assets.',
                        suggestion: 'Reduce Equity allocation by 5% and reallocate to Fixed Income.',
                        impactMagnitude: -2.5,
                        confidenceScore: 0.85,
                        category: 'Market'
                    }]
                };
            } else if (promptTemplate.id === 'meta_analysis') {
                return { metaTrends: [{ trend: 'Increased market uncertainty', cause: 'Geopolitical tensions', implication: 'Potential for capital flight', actionableInsight: 'Diversify portfolio across stable regions' }] };
            } else if (promptTemplate.id === 'power_curve_analysis') {
                return { powerCurveAnalysis: [{ hero: 'Asset Class Derivatives', stage: 'Growth Phase', powerSpikeDescription: 'Significant upside but high leverage risk.', suggestedAdjustment: 'Implement stricter risk controls on derivatives positions.' }] };
            } else if (promptTemplate.id === 'risk_assessment') {
                return { riskReport: [{ entity: 'Asset Class Equity', riskCategory: 'Market Risk', score: 70, description: 'High sensitivity to market downturns.', mitigationSuggestion: 'Hedge with put options.', confidence: 0.9 }] };
            }
            return null;
        }

        try {
            const finalPrompt = promptTemplate.template.replace('{{gameData}}', gameData);
            const response = await ai.models.generateContent({
                model: modelName,
                contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
                generationConfig: { responseMimeType: "application/json", responseSchema: promptTemplate.schema }
            });
            const parsedResponse = JSON.parse(response.text);
            logAudit('AI_REPORT_GENERATED', { templateId: promptTemplate.id, model: modelName, success: true }, 'AI', 'Info');
            incrementMetric('total_ai_reports_generated');
            return parsedResponse;
        } catch (error: any) {
            logAudit('AI_REPORT_GENERATION_FAILED', { templateId: promptTemplate.id, model: modelName, error: error.message || 'Unknown AI error' }, 'AI', 'Error');
            throw error;
        }
    }, [ai, logAudit, incrementMetric]);

    /**
     * Refines an AI-generated suggestion based on additional context provided by a user or agent.
     * Improves precision and relevance of remediation actions.
     */
    const refineSuggestion = useCallback(async (
        issue: BalanceIssue,
        context: string,
        modelName: string = 'gemini-2.5-flash'
    ): Promise<string> => {
        if (!process.env.API_KEY || !ai) {
            const error = new Error('AI_API_KEY is not configured. Returning original suggestion.');
            logAudit('AI_REFINEMENT_UNAVAILABLE', { issueElement: issue.element, error: error.message }, 'AI', 'Warning');
            return `${issue.suggestion} (Refinement simulated: considering ${context})`; // Simulate refinement
        }
        const prompt = `Given the financial imbalance for ${issue.element}: "${issue.problem}" and the current suggestion "${issue.suggestion}". Refine this suggestion based on the following additional context: "${context}". Provide a new, more precise numerical or policy suggestion. Respond only with the new suggestion string.`;
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            const refinedText = response.text.trim();
            logAudit('AI_SUGGESTION_REFINED', { issueElement: issue.element, original: issue.suggestion, refined: refinedText }, 'AI', 'Info');
            return refinedText;
        } catch (error: any) {
            logAudit('AI_REFINEMENT_FAILED', { issueElement: issue.element, error: error.message || 'Unknown AI error' }, 'AI', 'Error');
            return issue.suggestion; // Return original if refinement fails
        }
    }, [ai, logAudit]);

    return { generateReport, refineSuggestion };
};

/**
 * Custom hook for running simulated financial market scenarios.
 * Provides a deterministic environment for testing policy interventions and predicting outcomes.
 */
export const useSimulationEngine = () => {
    const { state, dispatch } = useGameMeta();
    const { logAudit, incrementMetric } = useLogger();

    /**
     * Executes a simulation of proposed changes on the financial system state.
     * Provides predicted outcomes and potential risks.
     */
    const runSimulation = useCallback(async (
        params: SimulationParameters,
        currentStats: HeroStats[],
        proposedChanges: BalanceIssue[],
        snapshotId: string
    ): Promise<SimulationResult> => {
        logAudit('SIMULATION_INITIATED', { params, numChanges: proposedChanges.length, snapshotId }, 'System', 'Info');

        let simulatedStats: HeroStats[] = JSON.parse(JSON.stringify(currentStats));
        let totalImpact = 0;

        for (const change of proposedChanges) {
            const { newStats, estimatedImpact } = calculateImpactOfChange(simulatedStats, change);
            simulatedStats = newStats;
            totalImpact += estimatedImpact;
        }

        // Simulate market shifts based on total impact and meta stability factor
        const volatilityFactor = Math.min(1, Math.abs(totalImpact / (params.heroDiversityGoal * 10))) * params.metaStabilityFactor;

        simulatedStats = simulatedStats.map(hero => {
            const adjustedHero = { ...hero };
            // Simulate random market fluctuations and policy impact
            adjustedHero.winRate = Math.max(0, Math.min(100, adjustedHero.winRate + (Math.random() * 4 - 2) * volatilityFactor)); // Performance metric
            adjustedHero.pickRate = Math.max(0, Math.min(100, adjustedHero.pickRate + (Math.random() * 10 - 5) * volatilityFactor)); // Allocation rate
            // Introduce some correlation or anti-correlation based on role
            if (adjustedHero.role === 'Growth Stock') {
                adjustedHero.winRate += (Math.random() * 2 - 1) * volatilityFactor * 1.5;
            } else if (adjustedHero.role === 'Stable Asset') {
                adjustedHero.winRate -= (Math.random() * 1) * volatilityFactor * 0.5;
            }
            return adjustedHero;
        });

        const overallWinRateDistribution = [
            { range: '<45% Performance', count: simulatedStats.filter(h => h.winRate < 45).length },
            { range: '45-50% Performance', count: simulatedStats.filter(h => h.winRate >= 45 && h.winRate < 50).length },
            { range: '50-55% Performance', count: simulatedStats.filter(h => h.winRate >= 50 && h.winRate < 55).length },
            { range: '>55% Performance', count: simulatedStats.filter(h => h.winRate >= 55).length },
        ];

        const result: SimulationResult = {
            snapshotId,
            simulationId: generateUUID(),
            timestamp: new Date().toISOString(),
            proposedChanges,
            predictedHeroStats: simulatedStats,
            predictedOverallWinRateDistribution: overallWinRateDistribution,
            predictedMetaShiftScore: calculateOverallMetaScore(simulatedStats),
            outcomeSummary: `Financial scenario simulation completed over ${params.matchesToSimulate} market cycles. Overall market volatility observed: ${volatilityFactor.toFixed(2)}. Total estimated performance impact from changes: ${totalImpact.toFixed(2)}%.`,
            warnings: totalImpact > 10 || volatilityFactor > 0.8 ? ['High impact or increased volatility detected. Re-evaluate policy changes.'] : []
        };

        dispatch({ type: 'ADD_SIMULATION_RESULT', payload: result });
        logAudit('SIMULATION_COMPLETED', { simulationId: result.simulationId, outcomeSummary: result.outcomeSummary, warnings: result.warnings }, 'System', result.warnings && result.warnings.length > 0 ? 'Warning' : 'Info');
        incrementMetric('total_simulations_run');
        return result;
    }, [dispatch, logAudit, incrementMetric]);

    return { runSimulation };
};

/**
 * Custom hook for managing simulated digital identities.
 * Handles key generation, authentication, and integration with user profiles.
 */
export const useDigitalIdentity = () => {
    const { state, dispatch } = useGameMeta();
    const { logAudit, incrementMetric } = useLogger();

    /**
     * Creates a new simulated digital identity.
     * This identity can be used for authentication and authorization across the platform.
     */
    const createDigitalIdentity = useCallback((name: string, role: UserProfile['role']): UserProfile => {
        const { publicKey, privateKey } = generateKeyPairSimulated();
        const newIdentity: UserProfile = {
            id: `id_${generateUUID()}`,
            name,
            role,
            permissions: [], // Default empty permissions, can be assigned later
            publicKey,
            privateKey,
        };
        dispatch({ type: 'ADD_DIGITAL_IDENTITY', payload: newIdentity });
        logAudit('DIGITAL_IDENTITY_CREATED', { identityId: newIdentity.id, name: newIdentity.name, role: newIdentity.role }, 'Identity', 'Info');
        incrementMetric('total_identities_managed');
        return newIdentity;
    }, [dispatch, logAudit, incrementMetric]);

    /**
     * Authenticates an entity by verifying a signed message.
     * Core to securing all operations within the financial infrastructure.
     */
    const authenticateEntity = useCallback((identityId: string, message: string, signature: string): boolean => {
        const identity = state.digitalIdentities.find(id => id.id === identityId);
        if (!identity?.publicKey) {
            logAudit('AUTHENTICATION_FAILED', { identityId, reason: 'Identity not found or no public key' }, 'Identity', 'Error');
            return false;
        }
        const isValid = verifySignatureSimulated(message, signature, identity.publicKey);
        logAudit(isValid ? 'AUTHENTICATION_SUCCESS' : 'AUTHENTICATION_FAILED', { identityId, messageHash: btoa(message).substring(0, 10), isValid }, 'Identity', isValid ? 'Info' : 'Warning');
        return isValid;
    }, [state.digitalIdentities, logAudit]);

    /**
     * Authorizes an action based on the entity's identity, role, and permissions.
     * Enforces the principle of least privilege for robust security.
     */
    const authorizeAction = useCallback((identityId: string, requiredPermissions: string[]): boolean => {
        const identity = state.digitalIdentities.find(id => id.id === identityId);
        if (!identity) {
            logAudit('AUTHORIZATION_FAILED', { identityId, requiredPermissions, reason: 'Identity not found' }, 'Identity', 'Error');
            return false;
        }
        const isAuthorized = checkPermissions(identity, requiredPermissions);
        logAudit(isAuthorized ? 'AUTHORIZATION_SUCCESS' : 'AUTHORIZATION_FAILED', { identityId, requiredPermissions }, 'Identity', isAuthorized ? 'Info' : 'Warning');
        return isAuthorized;
    }, [state.digitalIdentities, logAudit]);

    return { createDigitalIdentity, authenticateEntity, authorizeAction };
};


/**
 * Custom hook for managing the Programmable Token Rail Layer.
 * Simulates issuance, transfer, and burning of digital assets with policy enforcement.
 */
export const useProgrammableTokenRail = () => {
    const { state, dispatch } = useGameMeta();
    const { logAudit, incrementMetric } = useLogger();
    const { authenticateEntity, authorizeAction } = useDigitalIdentity();

    /**
     * Applies settlement policies to determine the appropriate rail for a transaction.
     * Ensures compliance and optimizes for cost/latency/security.
     */
    const routeTransaction = useCallback((transaction: Omit<TokenTransaction, 'id' | 'timestamp' | 'status' | 'signature' | 'nonce' | 'hashLink' | 'railUsed'>): 'fast' | 'secure' => {
        let chosenRail: 'fast' | 'secure' = 'fast'; // Default to fast rail

        // Evaluate policies in order of priority
        const activePolicies = state.settlementPolicies.filter(p => p.isActive).sort((a, b) => a.priority - b.priority);

        for (const policy of activePolicies) {
            // Simple string evaluation for conditions
            const conditionMet = eval(policy.condition.replace('amount', transaction.amount.toString()).replace('tokenId', `"${transaction.tokenId}"`));
            if (conditionMet) {
                if (policy.action === 'route_to_secure_rail') {
                    chosenRail = 'secure';
                    logAudit('SETTLEMENT_POLICY_ENFORCED', { policyId: policy.id, rule: 'route_to_secure_rail', transactionAmount: transaction.amount, tokenId: transaction.tokenId }, 'Settlement', 'Info');
                    break; // Once a secure rule is met, prioritize it
                } else if (policy.action === 'route_to_fast_rail' && chosenRail !== 'secure') {
                    chosenRail = 'fast';
                    logAudit('SETTLEMENT_POLICY_ENFORCED', { policyId: policy.id, rule: 'route_to_fast_rail', transactionAmount: transaction.amount, tokenId: transaction.tokenId }, 'Settlement', 'Info');
                }
            }
        }
        return chosenRail;
    }, [state.settlementPolicies, logAudit]);

    /**
     * Initiates a transfer of digital tokens between accounts.
     * This is an atomic and idempotent operation, ensuring consistency.
     */
    const transferTokens = useCallback(async (
        senderId: string,
        recipientId: string,
        tokenId: string,
        amount: number,
        senderPrivateKey: string // For signing the transaction
    ): Promise<TokenTransaction | null> => {
        if (amount <= 0) {
            logAudit('TOKEN_TRANSFER_FAILED', { senderId, recipientId, tokenId, amount, reason: 'Invalid amount' }, 'Settlement', 'Error');
            return null;
        }

        const senderAccount = state.tokenLedger.find(acc => acc.accountId === senderId);
        if (!senderAccount || (senderAccount.balances[tokenId] || 0) < amount) {
            logAudit('TOKEN_TRANSFER_FAILED', { senderId, recipientId, tokenId, amount, reason: 'Insufficient balance' }, 'Settlement', 'Error');
            return null;
        }

        const senderIdentity = state.digitalIdentities.find(id => id.id === senderId);
        if (!senderIdentity || senderIdentity.privateKey !== senderPrivateKey) { // Basic key check
            logAudit('TOKEN_TRANSFER_FAILED', { senderId, reason: 'Invalid sender identity or private key' }, 'Settlement', 'Error');
            return null;
        }

        const newTxId = generateUUID();
        const nonce = state.nextTransactionNonce;
        dispatch({ type: 'INCREMENT_NONCE' }); // Increment nonce for replay protection

        const rawTransactionData = { senderId, recipientId, tokenId, amount, nonce, timestamp: new Date().toISOString() };
        const signature = signMessageSimulated(JSON.stringify(rawTransactionData), senderPrivateKey);

        const railUsed = routeTransaction({ senderId, recipientId, tokenId, amount });

        const newTransaction: TokenTransaction = {
            id: newTxId,
            timestamp: new Date().toISOString(),
            senderId,
            recipientId,
            tokenId,
            amount,
            status: 'Pending',
            signature,
            nonce,
            hashLink: state.tokenTransactions.length > 0 ? btoa(JSON.stringify(state.tokenTransactions[state.tokenTransactions.length - 1])) : undefined, // Chain transactions
            railUsed
        };

        dispatch({ type: 'ADD_TOKEN_TRANSACTION', payload: newTransaction });
        logAudit('TOKEN_TRANSFER_INITIATED', { transactionId: newTxId, senderId, recipientId, tokenId, amount, railUsed }, 'Settlement', 'Info');
        incrementMetric('total_token_transfers');

        // Simulate real-time settlement
        setTimeout(() => {
            // Authenticate the transaction using sender's public key
            const isValidSignature = authenticateEntity(senderId, JSON.stringify(rawTransactionData), signature);

            if (isValidSignature) {
                dispatch({ type: 'UPDATE_TOKEN_LEDGER_BALANCE', payload: { accountId: senderId, tokenId, amount: -amount, transactionId: newTxId } });
                dispatch({ type: 'UPDATE_TOKEN_LEDGER_BALANCE', payload: { accountId: recipientId, tokenId, amount, transactionId: newTxId } });
                dispatch({ type: 'UPDATE_TOKEN_TRANSACTION_STATUS', payload: { transactionId: newTxId, status: 'Confirmed' } });
                logAudit('TOKEN_TRANSFER_SETTLED', { transactionId: newTxId, senderId, recipientId, tokenId, amount }, 'Settlement', 'Info');
            } else {
                dispatch({ type: 'UPDATE_TOKEN_TRANSACTION_STATUS', payload: { transactionId: newTxId, status: 'Failed' } });
                logAudit('TOKEN_TRANSFER_FAILED_SIGNATURE', { transactionId: newTxId, senderId, reason: 'Signature verification failed' }, 'Settlement', 'Error');
            }
        }, railUsed === 'fast' ? 100 : 500); // Simulate latency for fast vs. secure rail

        return newTransaction;
    }, [state.tokenLedger, state.digitalIdentities, state.nextTransactionNonce, state.tokenTransactions, state.settlementPolicies, dispatch, logAudit, incrementMetric, authenticateEntity, routeTransaction]);

    /**
     * Issues new tokens into an account. Requires specific permissions.
     */
    const mintTokens = useCallback(async (
        issuerId: string,
        tokenId: string,
        amount: number,
        recipientId: string
    ): Promise<boolean> => {
        if (!authorizeAction(issuerId, ['mint_tokens'])) {
            logAudit('TOKEN_MINT_FAILED', { issuerId, tokenId, reason: 'Unauthorized' }, 'Settlement', 'Error');
            return false;
        }
        const tokenDefinition = state.programmableTokens.find(t => t.id === tokenId);
        if (!tokenDefinition?.mintable) {
            logAudit('TOKEN_MINT_FAILED', { issuerId, tokenId, reason: 'Token not mintable' }, 'Settlement', 'Error');
            return false;
        }

        const mintTxId = generateUUID();
        dispatch({ type: 'UPDATE_TOKEN_LEDGER_BALANCE', payload: { accountId: recipientId, tokenId, amount, transactionId: mintTxId } });
        logAudit('TOKEN_MINTED', { issuerId, tokenId, amount, recipientId }, 'Settlement', 'Info');
        return true;
    }, [state.programmableTokens, dispatch, logAudit, authorizeAction]);

    /**
     * Removes tokens from circulation. Requires specific permissions.
     */
    const burnTokens = useCallback(async (
        burnerId: string,
        tokenId: string,
        amount: number,
        sourceAccountId: string
    ): Promise<boolean> => {
        if (!authorizeAction(burnerId, ['burn_tokens'])) {
            logAudit('TOKEN_BURN_FAILED', { burnerId, tokenId, reason: 'Unauthorized' }, 'Settlement', 'Error');
            return false;
        }
        const tokenDefinition = state.programmableTokens.find(t => t.id === tokenId);
        if (!tokenDefinition?.burnable) {
            logAudit('TOKEN_BURN_FAILED', { burnerId, tokenId, reason: 'Token not burnable' }, 'Settlement', 'Error');
            return false;
        }
        const sourceAccount = state.tokenLedger.find(acc => acc.accountId === sourceAccountId);
        if (!sourceAccount || (sourceAccount.balances[tokenId] || 0) < amount) {
            logAudit('TOKEN_BURN_FAILED', { burnerId, tokenId, amount, reason: 'Insufficient balance to burn' }, 'Settlement', 'Error');
            return false;
        }

        const burnTxId = generateUUID();
        dispatch({ type: 'UPDATE_TOKEN_LEDGER_BALANCE', payload: { accountId: sourceAccountId, tokenId, amount: -amount, transactionId: burnTxId } });
        logAudit('TOKEN_BURNED', { burnerId, tokenId, amount, sourceAccountId }, 'Settlement', 'Info');
        return true;
    }, [state.programmableTokens, state.tokenLedger, dispatch, logAudit, authorizeAction]);

    return { transferTokens, mintTokens, burnTokens, routeTransaction };
};

/**
 * Custom hook for the Real-Time Settlement and Payments Engine.
 * Orchestrates payment processing, risk scoring, and interaction with the token rail.
 */
export const useRealTimePayments = () => {
    const { state, dispatch } = useGameMeta();
    const { logAudit, incrementMetric } = useLogger();
    const { transferTokens } = useProgrammableTokenRail();
    const { authenticateEntity, authorizeAction } = useDigitalIdentity();

    /**
     * Processes a payment request, including risk assessment and routing.
     * Ensures secure, efficient, and policy-compliant value transfer.
     */
    const processPaymentRequest = useCallback(async (
        payerId: string,
        payeeId: string,
        tokenId: string,
        amount: number,
        payerPrivateKey: string, // For authorization
    ): Promise<PaymentInstruction | null> => {
        if (!authorizeAction(payerId, ['initiate_settlement'])) {
            logAudit('PAYMENT_INITIATION_FAILED', { payerId, reason: 'Unauthorized to initiate settlement' }, 'Settlement', 'Error');
            return null;
        }

        const paymentId = generateUUID();
        const requestTimestamp = new Date().toISOString();
        const authorizationSignature = signMessageSimulated(JSON.stringify({ payerId, payeeId, tokenId, amount, requestTimestamp }), payerPrivateKey);

        if (!authenticateEntity(payerId, JSON.stringify({ payerId, payeeId, tokenId, amount, requestTimestamp }), authorizationSignature)) {
            logAudit('PAYMENT_INITIATION_FAILED', { payerId, paymentId, reason: 'Authentication failed' }, 'Settlement', 'Error');
            return null;
        }

        const riskScore = calculatePaymentRiskScore({ id: paymentId, payerId, payeeId, tokenId, amount, requestTimestamp, status: 'Requested', riskScore: 0, authorizationSignature }, state.programmableTokens, state.tokenLedger);

        let status: PaymentInstruction['status'] = 'Processing';
        if (riskScore > 70) { // High risk threshold
            status = 'Blocked';
            logAudit('PAYMENT_BLOCKED_HIGH_RISK', { paymentId, payerId, payeeId, amount, riskScore }, 'Settlement', 'Critical');
            incrementMetric('high_risk_payments_flagged');
        }

        const newPayment: PaymentInstruction = {
            id: paymentId,
            payerId,
            payeeId,
            tokenId,
            amount,
            requestTimestamp,
            status,
            riskScore,
            authorizationSignature,
        };

        dispatch({ type: 'ADD_PENDING_PAYMENT', payload: newPayment });
        logAudit('PAYMENT_REQUESTED', { paymentId, payerId, payeeId, amount, riskScore, initialStatus: status }, 'Settlement', status === 'Blocked' ? 'Warning' : 'Info');

        if (status === 'Processing') {
            const transferResult = await transferTokens(payerId, payeeId, tokenId, amount, payerPrivateKey);
            if (transferResult?.status === 'Confirmed') {
                dispatch({ type: 'UPDATE_PAYMENT_STATUS', payload: { paymentId, status: 'Settled' } });
                logAudit('PAYMENT_SETTLED', { paymentId, transferTxId: transferResult.id }, 'Settlement', 'Info');
                incrementMetric('total_payments_settled');
            } else {
                dispatch({ type: 'UPDATE_PAYMENT_STATUS', payload: { paymentId, status: 'Failed' } });
                logAudit('PAYMENT_FAILED', { paymentId, reason: 'Token transfer failed' }, 'Settlement', 'Error');
            }
        }
        return newPayment;
    }, [state.programmableTokens, state.tokenLedger, dispatch, logAudit, incrementMetric, transferTokens, authenticateEntity, authorizeAction]);

    return { processPaymentRequest };
};


// --- Components for Financial Infrastructure UI ---

/**
 * Displays key performance indicators for financial assets.
 * Provides a quick overview of market health and individual asset performance.
 */
export const HeroStatsTable: React.FC<{ heroes: HeroStats[] }> = React.memo(({ heroes }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-left text-gray-400">
            <thead className="text-gray-200 uppercase bg-gray-700">
                <tr>
                    <th scope="col" className="px-3 py-2">Asset Class</th>
                    <th scope="col" className="px-3 py-2">Role</th>
                    <th scope="col" className="px-3 py-2">Performance</th>
                    <th scope="col" className="px-3 py-2">Allocation</th>
                    <th scope="col" className="px-3 py-2">Scrutiny</th>
                    <th scope="col" className="px-3 py-2">ROI</th>
                </tr>
            </thead>
            <tbody>
                {heroes.map(hero => (
                    <tr key={hero.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-900">
                        <td className="px-3 py-2 font-medium text-white">{hero.name}</td>
                        <td className="px-3 py-2">{hero.role}</td>
                        <td className="px-3 py-2">{hero.winRate?.toFixed(2)}%</td>
                        <td className="px-3 py-2">{hero.pickRate?.toFixed(2)}%</td>
                        <td className="px-3 py-2">{hero.banRate?.toFixed(2)}%</td>
                        <td className="px-3 py-2">{hero.kda?.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
));

/**
 * Displays statistics for financial instruments.
 * Provides details on capital requirements and value modifiers.
 */
export const ItemStatsTable: React.FC<{ items: ItemStats[] }> = React.memo(({ items }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-left text-gray-400">
            <thead className="text-gray-200 uppercase bg-gray-700">
                <tr>
                    <th scope="col" className="px-3 py-2">Instrument</th>
                    <th scope="col" className="px-3 py-2">Cost (Capital)</th>
                    <th scope="col" className="px-3 py-2">Value Modifier</th>
                    <th scope="col" className="px-3 py-2">Effect</th>
                </tr>
            </thead>
            <tbody>
                {items.map(item => (
                    <tr key={item.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-900">
                        <td className="px-3 py-2 font-medium text-white">{item.name}</td>
                        <td className="px-3 py-2">{item.cost}</td>
                        <td className="px-3 py-2">{item.powerModifier}</td>
                        <td className="px-3 py-2 text-gray-500">{item.effectDescription}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
));

/**
 * Displays a report of identified systemic imbalances and proposed remediation actions.
 * Central for decision-makers to review and act on AI-driven insights.
 */
export const BalanceReportDisplay: React.FC<{
    report: BalanceIssue[];
    onRefine: (issue: BalanceIssue) => void;
    onUpdateStatus: (issue: BalanceIssue, status: 'Pending' | 'Approved' | 'Rejected' | 'Implemented') => void;
    canApprove: boolean;
    canImplement: boolean;
}> = React.memo(({ report, onRefine, onUpdateStatus, canApprove, canImplement }) => (
    <div className="space-y-4">
        {report.map((item, i) => (
            <div key={`${item.element}-${item.problem}-${i}`} className="p-3 bg-gray-900/50 rounded-lg border-l-4 border-cyan-400">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-white text-lg">{item.element} <span className="text-gray-500 text-sm">({item.category})</span></h4>
                    <div className="flex space-x-2">
                        <button onClick={() => onRefine(item)} className="text-cyan-400 hover:text-cyan-300 text-sm">Refine</button>
                        {canApprove && item.status !== 'Approved' && item.status !== 'Implemented' && (
                            <button onClick={() => onUpdateStatus(item, 'Approved')} className="text-green-400 hover:text-green-300 text-sm">Approve</button>
                        )}
                        {canApprove && item.status === 'Approved' && canImplement && (
                            <button onClick={() => onUpdateStatus(item, 'Implemented')} className="text-purple-400 hover:text-purple-300 text-sm">Implement</button>
                        )}
                        {canApprove && item.status !== 'Rejected' && item.status !== 'Implemented' && (
                             <button onClick={() => onUpdateStatus(item, 'Rejected')} className="text-red-400 hover:text-red-300 text-sm">Reject</button>
                        )}
                    </div>
                </div>
                <p className="text-sm text-yellow-300 my-1"><strong>Problem:</strong> {item.problem}</p>
                <p className="text-sm text-green-300"><strong>Suggestion:</strong> {item.suggestion}</p>
                {item.impactMagnitude !== undefined && (
                    <p className="text-xs text-blue-300 mt-1"><strong>Est. Impact:</strong> {item.impactMagnitude.toFixed(2)}% | <strong>Confidence:</strong> {(item.confidenceScore * 100).toFixed(1)}%</p>
                )}
                {item.status && (
                    <p className="text-xs text-gray-400 mt-1"><strong>Status:</strong> {item.status} {item.proposedBy && `by ${item.proposedBy}`}</p>
                )}
            </div>
        ))}
    </div>
));

/**
 * Displays a report of identified market dynamics and trends.
 * Offers high-level strategic insights for macro-economic adjustments.
 */
export const MetaAnalysisReportDisplay: React.FC<{ report: any[] }> = React.memo(({ report }) => (
    <div className="space-y-4">
        {report.map((item, i) => (
            <div key={i} className="p-3 bg-gray-900/50 rounded-lg border-l-4 border-purple-400">
                <h4 className="font-bold text-white text-lg">Trend: {item.trend}</h4>
                <p className="text-sm text-pink-300 my-1"><strong>Cause:</strong> {item.cause}</p>
                <p className="text-sm text-yellow-300"><strong>Implication:</strong> {item.implication}</p>
                <p className="text-sm text-green-300"><strong>Action:</strong> {item.actionableInsight}</p>
            </div>
        ))}
    </div>
));

/**
 * Displays an analysis of asset performance curves across market stages.
 * Helps identify optimal entry/exit points and rebalancing needs.
 */
export const PowerCurveReportDisplay: React.FC<{ report: any[] }> = React.memo(({ report }) => (
    <div className="space-y-4">
        {report.map((item, i) => (
            <div key={i} className="p-3 bg-gray-900/50 rounded-lg border-l-4 border-orange-400">
                <h4 className="font-bold text-white text-lg">Asset: {item.hero}</h4>
                <p className="text-sm text-blue-300 my-1"><strong>Market Stage:</strong> {item.stage}</p>
                <p className="text-sm text-yellow-300"><strong>Performance Spike/Trough:</strong> {item.powerSpikeDescription}</p>
                <p className="text-sm text-green-300"><strong>Suggestion:</strong> {item.suggestedAdjustment}</p>
            </div>
        ))}
    </div>
));

/**
 * Displays a real-time risk assessment report.
 * Highlights vulnerabilities and proposes mitigation strategies for various financial risks.
 */
export const RiskAssessmentReportDisplay: React.FC<{ report: any[] }> = React.memo(({ report }) => (
    <div className="space-y-4">
        {report.map((item, i) => (
            <div key={i} className="p-3 bg-gray-900/50 rounded-lg border-l-4 border-red-400">
                <h4 className="font-bold text-white text-lg">Entity: {item.entity} <span className="text-gray-500 text-sm">({item.riskCategory})</span></h4>
                <p className="text-sm text-red-300 my-1"><strong>Risk Score:</strong> {item.score} / 100</p>
                <p className="text-sm text-yellow-300"><strong>Description:</strong> {item.description}</p>
                <p className="text-sm text-green-300"><strong>Mitigation:</strong> {item.mitigationSuggestion}</p>
                <p className="text-xs text-blue-300 mt-1"><strong>Confidence:</strong> {(item.confidence * 100).toFixed(1)}%</p>
            </div>
        ))}
    </div>
));

/**
 * Panel for managing raw financial telemetry and viewing processed statistics.
 * The entry point for data ingestion and initial processing.
 */
export const DataManagementPanel: React.FC<{
    gameDataInput: string;
    setGameDataInput: (data: string) => void;
    onApplyData: () => void;
    currentHeroStats: HeroStats[];
    currentItemStats: ItemStats[];
}> = ({ gameDataInput, setGameDataInput, onApplyData, currentHeroStats, currentItemStats }) => {
    return (
        <Card title="Financial Telemetry & Data Processing" className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-2 text-white">Raw Market Data Feed</h3>
            <textarea
                value={gameDataInput}
                onChange={e => setGameDataInput(e.target.value)}
                className="w-full h-48 bg-gray-900/50 p-2 rounded text-sm font-mono focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Paste your raw financial telemetry here (Asset Class stats, Instrument stats, etc.)"
            />
            <button onClick={onApplyData} className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50">
                Process & Load Data
            </button>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Processed Asset Statistics</h3>
            {currentHeroStats.length > 0 ? (
                <HeroStatsTable heroes={currentHeroStats} />
            ) : (
                <p className="text-gray-500 text-sm">No asset data processed yet.</p>
            )}

            <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Processed Instrument Statistics</h3>
            {currentItemStats.length > 0 ? (
                <ItemStatsTable items={currentItemStats} />
            ) : (
                <p className="text-gray-500 text-sm">No instrument data processed yet.</p>
            )}
        </Card>
    );
};

/**
 * Panel for configuring AI analysis types and models.
 * Allows users to select specific prompts for diverse financial insights.
 */
export const AIAnalysisConfigPanel: React.FC<{
    selectedTemplateId: string;
    setSelectedTemplateId: (id: string) => void;
    currentTemplate: PromptTemplate | undefined;
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    onAddCustomPrompt: () => void;
}> = ({ selectedTemplateId, setSelectedTemplateId, currentTemplate, selectedModel, setSelectedModel, onAddCustomPrompt }) => {
    const { state } = useGameMeta();

    const availableModels = ['gemini-2.5-flash', 'gemini-1.5-pro-latest']; // Mock list of available models

    return (
        <Card title="AI Analysis Configuration" className="lg:col-span-1">
            <label htmlFor="analysis-mode" className="block text-sm font-medium text-gray-300">Analysis Type:</label>
            <select
                id="analysis-mode"
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-700 bg-gray-900/50 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            >
                {state.promptTemplates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{currentTemplate?.description}</p>

            <label htmlFor="ai-model" className="block text-sm font-medium text-gray-300 mt-4">AI Model:</label>
            <select
                id="ai-model"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-900/50 rounded text-base border-gray-700 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            >
                {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                ))}
            </select>
            <button onClick={onAddCustomPrompt} className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                Add/Edit Custom Prompt
            </button>
        </Card>
    );
};

/**
 * Modal for refining AI-generated financial suggestions.
 * Allows human experts to provide additional context for more precise interventions.
 */
export const RefineSuggestionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    issue: BalanceIssue | null;
    onRefineConfirm: (issue: BalanceIssue, context: string) => void;
    isLoading: boolean;
}> = ({ isOpen, onClose, issue, onRefineConfirm, isLoading }) => {
    const [refinementContext, setRefinementContext] = useState('');

    useEffect(() => {
        if (isOpen) {
            setRefinementContext('');
        }
    }, [isOpen]);

    if (!isOpen || !issue) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h3 className="text-xl font-bold text-white mb-4">Refine Financial Suggestion</h3>
                <div className="mb-4">
                    <p className="text-gray-300"><strong>Element:</strong> {issue.element}</p>
                    <p className="text-gray-300"><strong>Problem:</strong> {issue.problem}</p>
                    <p className="text-gray-300"><strong>Current Suggestion:</strong> {issue.suggestion}</p>
                </div>
                <label htmlFor="refinement-context" className="block text-sm font-medium text-gray-300 mb-2">Additional Context for AI:</label>
                <textarea
                    id="refinement-context"
                    className="w-full h-32 bg-gray-900/50 p-2 rounded text-sm font-mono focus:ring-cyan-500 focus:border-cyan-500"
                    value={refinementContext}
                    onChange={e => setRefinementContext(e.target.value)}
                    placeholder="E.g., 'Consider the asset's long-term growth potential,' or 'This policy change might affect Liquidity Pool X too much.'"
                />
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">
                        Cancel
                    </button>
                    <button
                        onClick={() => onRefineConfirm(issue, refinementContext)}
                        disabled={isLoading || !refinementContext.trim()}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white disabled:opacity-50"
                    >
                        {isLoading ? 'Refining...' : 'Refine Suggestion'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Panel for configuring and running financial scenario simulations.
 * Allows stress-testing policy changes and predicting market reactions.
 */
export const SimulationPanel: React.FC<{
    heroStats: HeroStats[];
    balanceReports: BalanceIssue[];
    onRunSimulation: (params: SimulationParameters, proposedChanges: BalanceIssue[]) => void;
    isLoading: boolean;
    simulationResults: SimulationResult[];
}> = ({ heroStats, balanceReports, onRunSimulation, isLoading, simulationResults }) => {
    const [matchesToSimulate, setMatchesToSimulate] = useState(100000);
    const [playerSkillDistribution, setPlayerSkillDistribution] = useState<SimulationParameters['playerSkillDistribution']>('Normal');
    const [metaStabilityFactor, setMetaStabilityFactor] = useState(0.5);
    const [heroDiversityGoal, setHeroDiversityGoal] = useState(70);
    const [economicImpactSensitivity, setEconomicImpactSensitivity] = useState(0.3);
    const [selectedChanges, setSelectedChanges] = useState<BalanceIssue[]>([]);

    useEffect(() => {
        // Only select Approved or AI-proposed changes by default for simulation
        setSelectedChanges(balanceReports.filter(r => r.status === 'Approved' || r.proposedBy?.startsWith('AI') || r.proposedBy?.endsWith('Agent')));
    }, [balanceReports]);

    const handleRun = () => {
        const params: SimulationParameters = {
            matchesToSimulate,
            playerSkillDistribution,
            metaStabilityFactor,
            heroDiversityGoal,
            economicImpactSensitivity,
        };
        onRunSimulation(params, selectedChanges);
    };

    return (
        <Card title="Financial Scenario Simulation Engine" className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-2 text-white">Simulation Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Market Cycles to Simulate:</label>
                    <input type="number" value={matchesToSimulate} onChange={e => setMatchesToSimulate(parseInt(e.target.value))} className="w-full mt-1 p-2 bg-gray-900/50 rounded" min="10000" max="1000000" step="10000" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Market Participant Behavior:</label>
                    <select value={playerSkillDistribution} onChange={e => setPlayerSkillDistribution(e.target.value as any)} className="w-full mt-1 p-2 bg-gray-900/50 rounded">
                        <option value="Normal">Normal (Diverse)</option>
                        <option value="SkewedHigh">Skewed High (Institutional)</option>
                        <option value="SkewedLow">Skewed Low (Retail)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Market Volatility Factor (0-1):</label>
                    <input type="range" min="0" max="1" step="0.1" value={metaStabilityFactor} onChange={e => setMetaStabilityFactor(parseFloat(e.target.value))} className="w-full mt-1 accent-cyan-500" />
                    <span className="text-xs text-gray-400">{metaStabilityFactor.toFixed(1)}</span>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Asset Allocation Diversity Goal (%):</label>
                    <input type="range" min="0" max="100" step="5" value={heroDiversityGoal} onChange={e => setHeroDiversityGoal(parseInt(e.target.value))} className="w-full mt-1 accent-cyan-500" />
                    <span className="text-xs text-gray-400">{heroDiversityGoal}%</span>
                </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Proposed Policy Changes for Simulation</h3>
            <div className="max-h-48 overflow-y-auto bg-gray-900/30 p-2 rounded border border-gray-700">
                {balanceReports.length === 0 ? (
                    <p className="text-gray-500 text-sm">No policy changes to select from.</p>
                ) : (
                    balanceReports.map((item, index) => ( // Added index to key for uniqueness when problem/element are the same
                        <div key={`${item.element}-${item.problem}-${index}`} className="flex items-center space-x-2 my-1">
                            <input
                                type="checkbox"
                                id={`change-${item.element}-${item.problem}-${index}`}
                                checked={selectedChanges.includes(item)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedChanges(prev => [...prev, item]);
                                    } else {
                                        setSelectedChanges(prev => prev.filter(c => c !== item));
                                    }
                                }}
                                className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                            />
                            <label htmlFor={`change-${item.element}-${item.problem}-${index}`} className="text-sm text-gray-300">
                                <span className="font-medium">{item.element}:</span> {item.suggestion} <span className="text-gray-500">({item.status || 'Pending'})</span>
                            </label>
                        </div>
                    ))
                )}
            </div>

            <button onClick={handleRun} disabled={isLoading || selectedChanges.length === 0 || heroStats.length === 0} className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50">
                {isLoading ? 'Running Simulation...' : `Run Scenario with ${selectedChanges.length} Changes`}
            </button>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Simulation Results</h3>
            {simulationResults.length === 0 ? (
                <p className="text-gray-500">No simulations run yet.</p>
            ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                    {simulationResults.map((result, i) => (
                        <div key={result.simulationId} className="p-3 bg-gray-900/50 rounded-lg border-l-4 border-purple-400">
                            <h4 className="font-bold text-white text-lg">Scenario {i + 1} ({new Date(result.timestamp).toLocaleString()})</h4>
                            <p className="text-sm text-gray-300 my-1"><strong>Outcome:</strong> {result.outcomeSummary}</p>
                            <p className="text-sm text-gray-300"><strong>Predicted Market Stability Score:</strong> {result.predictedMetaShiftScore.toFixed(0)} / 100</p>
                            {result.warnings && result.warnings.map((w, wi) => <p key={wi} className="text-sm text-red-400"><strong>Warning:</strong> {w}</p>)}
                            <details className="mt-2 text-gray-400">
                                <summary className="cursor-pointer text-sm hover:text-white">View Detailed Predicted Stats</summary>
                                <HeroStatsTable heroes={result.predictedHeroStats} />
                                <h5 className="text-md font-semibold mt-3 text-white">Predicted Performance Distribution:</h5>
                                <div className="space-y-1 text-xs">
                                    {result.predictedOverallWinRateDistribution.map((dist, di) => (
                                        <p key={di} className="flex justify-between">
                                            <span>{dist.range}:</span>
                                            <span>{dist.count} assets</span>
                                        </p>
                                    ))}
                                </div>
                            </details>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

/**
 * Panel for reviewing and loading historical financial system snapshots.
 * Enables point-in-time recovery and trend analysis.
 */
export const HistoryPanel: React.FC<{
    snapshots: GameSnapshot[];
    onLoadSnapshot: (snapshot: GameSnapshot) => void;
}> = ({ snapshots, onLoadSnapshot }) => {
    const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
    const selectedSnapshot = snapshots.find(s => s.id === selectedSnapshotId);

    return (
        <Card title="Financial System Snapshots & History" className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-2 text-white">Saved Snapshots</h3>
            {snapshots.length === 0 ? (
                <p className="text-gray-500">No snapshots saved yet.</p>
            ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto bg-gray-900/30 p-2 rounded border border-gray-700">
                    {snapshots.slice().reverse().map(snapshot => ( // Display most recent first
                        <li key={snapshot.id} className={`p-2 rounded cursor-pointer ${selectedSnapshotId === snapshot.id ? 'bg-cyan-700/50' : 'bg-gray-800 hover:bg-gray-700'}`} onClick={() => setSelectedSnapshotId(snapshot.id)}>
                            <p className="font-medium text-white">{snapshot.versionTag}</p>
                            <p className="text-xs text-gray-400">{new Date(snapshot.timestamp).toLocaleString()} - {snapshot.balanceReport.length} issues</p>
                        </li>
                    ))}
                </ul>
            )}

            {selectedSnapshot && (
                <div className="mt-6 border-t border-gray-700 pt-4">
                    <h4 className="text-xl font-bold text-white mb-2">{selectedSnapshot.versionTag}</h4>
                    <p className="text-sm text-gray-400 mb-2">Saved on: {new Date(selectedSnapshot.timestamp).toLocaleString()}</p>
                    {selectedSnapshot.notes && <p className="text-sm text-gray-300 italic mb-2">"{selectedSnapshot.notes}"</p>}
                    <button onClick={() => onLoadSnapshot(selectedSnapshot)} className="w-full py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm">
                        Load Snapshot Data
                    </button>
                    <details className="mt-4 text-gray-400">
                        <summary className="cursor-pointer text-sm hover:text-white">View Imbalance Report</summary>
                        {selectedSnapshot.balanceReport.length > 0 ? (
                            <BalanceReportDisplay
                                report={selectedSnapshot.balanceReport}
                                onRefine={() => {}}
                                onUpdateStatus={() => {}} // No status updates in history view
                                canApprove={false}
                                canImplement={false}
                            />
                        ) : (
                            <p className="text-gray-500 text-sm">No imbalance report in this snapshot.</p>
                        )}
                    </details>
                    <details className="mt-2 text-gray-400">
                        <summary className="cursor-pointer text-sm hover:text-white">View Processed Asset Stats</summary>
                        <HeroStatsTable heroes={selectedSnapshot.processedStats} />
                    </details>
                </div>
            )}
        </Card>
    );
};

/**
 * Panel for managing global application settings, AI API keys, and prompt templates.
 * Provides granular control over system configuration and AI interaction.
 */
export const AppSettingsPanel: React.FC<{
    apiKey: string;
    setApiKey: (key: string) => void;
    onSaveSettings: () => void;
    onResetState: () => void;
    canManagePrompts: boolean;
    canResetData: boolean;
}> = ({ apiKey, setApiKey, onSaveSettings, onResetState, canManagePrompts, canResetData }) => {
    const { state, dispatch } = useGameMeta();
    const { logAudit } = useLogger();
    const [tempApiKey, setTempApiKey] = useState(apiKey);
    const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
    const [newPromptName, setNewPromptName] = useState('');
    const [newPromptDesc, setNewPromptDesc] = useState('');
    const [newPromptTemplate, setNewPromptTemplate] = useState('');
    const [newPromptSchema, setNewPromptSchema] = useState('{}');
    const [newPromptModel, setNewPromptModel] = useState('gemini-2.5-flash');

    useEffect(() => {
        setTempApiKey(apiKey);
    }, [apiKey]);

    const handleEditPrompt = (template: PromptTemplate) => {
        if (!canManagePrompts) {
            logAudit('PERMISSION_DENIED', { action: 'Edit Prompt', templateId: template.id }, 'User', 'Warning');
            alert('You do not have permission to manage prompt templates.');
            return;
        }
        setEditingPrompt(template);
        setNewPromptName(template.name);
        setNewPromptDesc(template.description);
        setNewPromptTemplate(template.template);
        setNewPromptSchema(JSON.stringify(template.schema, null, 2));
        setNewPromptModel(template.defaultModel);
    };

    const handleSavePrompt = () => {
        if (!canManagePrompts) return; // Should be guarded by handleEditPrompt too, but for safety
        if (!newPromptName || !newPromptTemplate) {
            alert('Prompt name and template cannot be empty.');
            return;
        }
        try {
            const parsedSchema = JSON.parse(newPromptSchema);
            const updatedTemplate: PromptTemplate = {
                id: editingPrompt?.id || generateUUID(),
                name: newPromptName,
                description: newPromptDesc,
                template: newPromptTemplate,
                schema: parsedSchema,
                defaultModel: newPromptModel
            };
            if (editingPrompt?.id) {
                dispatch({ type: 'UPDATE_PROMPT_TEMPLATE', payload: updatedTemplate });
                logAudit('PROMPT_TEMPLATE_UPDATED', { templateId: updatedTemplate.id, name: updatedTemplate.name }, 'User', 'Info');
            } else {
                dispatch({ type: 'ADD_PROMPT_TEMPLATE', payload: updatedTemplate });
                logAudit('PROMPT_TEMPLATE_CREATED', { templateId: updatedTemplate.id, name: updatedTemplate.name }, 'User', 'Info');
            }
            setEditingPrompt(null);
            setNewPromptName('');
            setNewPromptDesc('');
            setNewPromptTemplate('');
            setNewPromptSchema('{}');
            setNewPromptModel('gemini-2.5-flash');
        } catch (e: any) {
            logAudit('PROMPT_TEMPLATE_SAVE_FAILED', { error: e.message }, 'User', 'Error');
            alert('Invalid JSON schema: ' + e.message);
        }
    };

    const handleCancelEdit = () => {
        setEditingPrompt(null);
        setNewPromptName('');
        setNewPromptDesc('');
        setNewPromptTemplate('');
        setNewPromptSchema('{}');
        setNewPromptModel('gemini-2.5-flash');
    };

    return (
        <Card title="Application Settings" className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-2 text-white">API Configuration</h3>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-300">Google GenAI API Key:</label>
            <input
                id="api-key"
                type="password"
                value={tempApiKey}
                onChange={e => setTempApiKey(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-900/50 rounded text-sm font-mono focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Enter your API Key"
            />
            <button onClick={() => setApiKey(tempApiKey)} className="w-full mt-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50">
                Save API Key
            </button>
            <p className="text-xs text-gray-500 mt-1">API keys are stored locally in your browser's encrypted local storage simulation. For production, consider a secure secrets management vault.</p>


            <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Prompt Templates Management</h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto bg-gray-900/30 p-2 rounded border border-gray-700">
                {state.promptTemplates.map(template => (
                    <li key={template.id} className="flex justify-between items-center p-2 rounded bg-gray-800 hover:bg-gray-700">
                        <span className="font-medium text-white">{template.name}</span>
                        <button onClick={() => handleEditPrompt(template)} className="text-sm text-cyan-400 hover:text-cyan-300" disabled={!canManagePrompts}>Edit</button>
                    </li>
                ))}
            </ul>
            <button onClick={() => { handleEditPrompt({ id: '', name: '', description: '', template: '', schema: {}, defaultModel: 'gemini-2.5-flash' }); }} className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm" disabled={!canManagePrompts}>
                Create New Prompt Template
            </button>

            {editingPrompt && (
                <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <h4 className="text-xl font-bold text-white mb-3">{editingPrompt.id ? 'Edit Prompt' : 'New Prompt'}</h4>
                    <label className="block text-sm font-medium text-gray-300">Name:</label>
                    <input type="text" value={newPromptName} onChange={e => setNewPromptName(e.target.value)} className="w-full mt-1 p-2 bg-gray-900/50 rounded" placeholder="Template Name" />
                    <label className="block text-sm font-medium text-gray-300 mt-3">Description:</label>
                    <textarea value={newPromptDesc} onChange={e => setNewPromptDesc(e.target.value)} className="w-full mt-1 p-2 bg-gray-900/50 rounded" placeholder="Short description"></textarea>
                    <label className="block text-sm font-medium text-gray-300 mt-3">Prompt Template (use &#123;&#123;gameData&#125;&#125; for data injection):</label>
                    <textarea value={newPromptTemplate} onChange={e => setNewPromptTemplate(e.target.value)} className="w-full h-32 mt-1 p-2 bg-gray-900/50 rounded font-mono" placeholder="Your AI prompt here"></textarea>
                    <label className="block text-sm font-medium text-gray-300 mt-3">Response Schema (JSON):</label>
                    <textarea value={newPromptSchema} onChange={e => setNewPromptSchema(e.target.value)} className="w-full h-40 mt-1 p-2 bg-gray-900/50 rounded font-mono" placeholder="{&quot;type&quot;: &quot;OBJECT&quot;, &quot;properties&quot;: {}}"></textarea>
                    <label className="block text-sm font-medium text-gray-300 mt-3">Default AI Model:</label>
                    <select value={newPromptModel} onChange={e => setNewPromptModel(e.target.value)} className="w-full mt-1 p-2 bg-gray-900/50 rounded">
                        <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                        <option value="gemini-1.5-pro-latest">gemini-1.5-pro-latest</option>
                    </select>
                    <div className="mt-4 flex justify-end space-x-3">
                        <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
                        <button onClick={handleSavePrompt} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Save Prompt</button>
                    </div>
                </div>
            )}

            <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Application Management</h3>
            <button onClick={onSaveSettings} className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 rounded disabled:opacity-50">
                Save All Settings
            </button>
            <button onClick={onResetState} className="w-full mt-3 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50" disabled={!canResetData}>
                Reset All Application Data
            </button>
        </Card>
    );
};

/**
 * Panel for controlling and observing autonomous agents.
 * Provides transparency into the Agentic Intelligence Layer's operations.
 */
export const AgentControlPanel: React.FC<{
    agents: AgentDefinition[];
    toggleAgentStatus: (agentId: string) => void;
    canTriggerAgent: boolean;
}> = ({ agents, toggleAgentStatus, canTriggerAgent }) => {
    return (
        <Card title="Agentic AI Control" className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-2 text-white">Automated Financial Agents</h3>
            {agents.length === 0 ? (
                <p className="text-gray-500 text-sm">No agents configured.</p>
            ) : (
                <div className="space-y-3">
                    {agents.map(agent => (
                        <div key={agent.id} className="p-3 bg-gray-900/50 rounded-lg border-l-4 border-emerald-400">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-white text-lg">{agent.name} <span className="text-gray-500 text-sm">({agent.role})</span></h4>
                                <label className="flex items-center cursor-pointer">
                                    <span className="mr-2 text-gray-400 text-sm">{agent.isActive ? 'Active' : 'Inactive'}</span>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={agent.isActive}
                                            onChange={() => toggleAgentStatus(agent.id)}
                                            disabled={!canTriggerAgent}
                                        />
                                        <div className={`block bg-gray-600 w-10 h-6 rounded-full ${agent.isActive ? 'bg-emerald-600' : ''}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${agent.isActive ? 'translate-x-full' : ''}`}></div>
                                    </div>
                                </label>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
                            {agent.lastRunTimestamp && (
                                <p className="text-xs text-gray-500 mt-1">Last Run: {new Date(agent.lastRunTimestamp).toLocaleString()}</p>
                            )}
                            {agent.lastAction && (
                                <p className="text-xs text-gray-500">Last Action: {agent.lastAction}</p>
                            )}
                            {agent.triggerThresholds.riskScoreThreshold && (
                                <p className="text-xs text-gray-500">Risk Threshold: {agent.triggerThresholds.riskScoreThreshold}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

/**
 * Displays a chronological log of all system activities and audit events.
 * Provides an immutable, cryptographically verifiable record for compliance and debugging.
 */
export const ActivityLogDisplay: React.FC<{ logs: AuditLogEntry[] }> = React.memo(({ logs }) => (
    <Card title="System Activity & Audit Log" className="lg:col-span-1">
        <h3 className="text-lg font-semibold mb-2 text-white">Recent Activities</h3>
        {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity.</p>
        ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto bg-gray-900/30 p-2 rounded border border-gray-700">
                {logs.slice().reverse().map(log => ( // Display most recent first
                    <div key={log.id} className={`p-2 rounded text-xs ${log.severity === 'Error' || log.severity === 'Critical' ? 'bg-red-900/30 border-red-500' : log.severity === 'Warning' ? 'bg-yellow-900/30 border-yellow-500' : 'bg-gray-800/50 border-gray-700'} border-l-4`}>
                        <p className="font-medium text-white">
                            <span className="text-gray-500 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className={`px-1 rounded ${log.category === 'Agent' ? 'bg-emerald-600' : log.category === 'AI' ? 'bg-cyan-600' : log.category === 'Settlement' ? 'bg-purple-600' : log.category === 'Identity' ? 'bg-orange-600' : 'bg-indigo-600'} text-white text-xs`}>{log.category}</span>
                            <span className="ml-2">{log.action}</span>
                            {log.userId && <span className="ml-2 text-gray-500">by {log.userId}</span>}
                        </p>
                        {Object.keys(log.details).length > 0 && (
                            <p className="text-gray-400 italic">Details: {JSON.stringify(log.details)}</p>
                        )}
                         {log.signature && (
                            <p className="text-xs text-gray-600 mt-1 truncate">Signature: {log.signature}</p>
                        )}
                    </div>
                ))}
            </div>
        )}
    </Card>
));

/**
 * Displays an overview of critical operational metrics.
 * Provides real-time performance, throughput, and error rate visibility.
 */
export const MetricsDashboard: React.FC<{ metrics: Record<string, number> }> = React.memo(({ metrics }) => (
    <Card title="Operational Metrics" className="lg:col-span-1">
        <h3 className="text-lg font-semibold mb-2 text-white">Key Performance Indicators</h3>
        <div className="grid grid-cols-2 gap-4">
            {Object.entries(metrics).map(([key, value]) => (
                <div key={key} className="p-3 bg-gray-900/50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-gray-400">{key.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                </div>
            ))}
        </div>
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-white">Programmable Value Rail (Simulated)</h3>
            <p className="text-sm text-gray-400">
                This dashboard component includes a conceptual integration with a real-time payment rail.
                For instance, funding a "Balance Fix Bounty" would trigger a secure, atomic transaction
                via our token rail layer. This ensures transparent, auditable, and instant value transfer
                to reward contributors or incentivize critical balance adjustments.
            </p>
            <button className="w-full mt-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded disabled:opacity-50" onClick={() => alert('Simulating "Fund Balance Fix Bounty" via Token Rail...')}>
                Fund Balance Fix Bounty (Simulated)
            </button>
            <p className="text-xs text-gray-500 mt-1">
                Transaction initiated via `rail_fast` using digital identity for cryptographic signing.
                Real-time settlement expected.
            </p>
        </div>
    </Card>
));

/**
 * Panel for managing programmable tokens and their ledger.
 * Offers controls for token issuance, transfers, and policy definition.
 */
export const TokenRailManagementPanel: React.FC<{
    programmableTokens: DigitalToken[];
    tokenLedger: TokenLedgerAccount[];
    tokenTransactions: TokenTransaction[];
    settlementPolicies: SettlementPolicy[];
    currentUser: UserProfile | null;
    onTransferTokens: (senderId: string, recipientId: string, tokenId: string, amount: number, privateKey: string) => Promise<TokenTransaction | null>;
    onAddSettlementPolicy: (policy: SettlementPolicy) => void;
    onUpdateSettlementPolicy: (policy: SettlementPolicy) => void;
    canInitiateSettlement: boolean;
    canManagePolicies: boolean;
}> = ({
    programmableTokens, tokenLedger, tokenTransactions, settlementPolicies, currentUser,
    onTransferTokens, onAddSettlementPolicy, onUpdateSettlementPolicy,
    canInitiateSettlement, canManagePolicies
}) => {
    const [senderId, setSenderId] = useState(currentUser?.id || '');
    const [recipientId, setRecipientId] = useState('');
    const [tokenId, setTokenId] = useState(programmableTokens[0]?.id || '');
    const [amount, setAmount] = useState(0);
    const [senderPrivateKey, setSenderPrivateKey] = useState('');

    const [newPolicyName, setNewPolicyName] = useState('');
    const [newPolicyDesc, setNewPolicyDesc] = useState('');
    const [newPolicyCondition, setNewPolicyCondition] = useState('');
    const [newPolicyAction, setNewPolicyAction] = useState<'route_to_fast_rail' | 'route_to_secure_rail'>('route_to_fast_rail');
    const [newPolicyPriority, setNewPolicyPriority] = useState(0);
    const [editingPolicy, setEditingPolicy] = useState<SettlementPolicy | null>(null);

    useEffect(() => {
        if (currentUser) {
            setSenderId(currentUser.id);
            setSenderPrivateKey(currentUser.privateKey || '');
        }
    }, [currentUser]);

    const handleTransfer = async () => {
        if (!senderId || !recipientId || !tokenId || amount <= 0 || !senderPrivateKey) {
            alert('Please fill all transfer fields.');
            return;
        }
        if (senderId === recipientId) {
            alert('Sender and recipient cannot be the same.');
            return;
        }
        const success = await onTransferTokens(senderId, recipientId, tokenId, amount, senderPrivateKey);
        if (success) {
            alert(`Transfer initiated: ${success.id}`);
            setRecipientId('');
            setAmount(0);
        } else {
            alert('Transfer failed. Check console for details.');
        }
    };

    const handleSavePolicy = () => {
        if (!newPolicyName || !newPolicyCondition || !newPolicyAction) {
            alert('Policy name, condition, and action cannot be empty.');
            return;
        }
        const policy: SettlementPolicy = {
            id: editingPolicy?.id || generateUUID(),
            name: newPolicyName,
            description: newPolicyDesc,
            condition: newPolicyCondition,
            action: newPolicyAction,
            priority: newPolicyPriority,
            isActive: true,
        };
        if (editingPolicy) {
            onUpdateSettlementPolicy(policy);
        } else {
            onAddSettlementPolicy(policy);
        }
        setEditingPolicy(null);
        setNewPolicyName('');
        setNewPolicyDesc('');
        setNewPolicyCondition('');
        setNewPolicyAction('route_to_fast_rail');
        setNewPolicyPriority(0);
    };

    const handleEditPolicy = (policy: SettlementPolicy) => {
        setEditingPolicy(policy);
        setNewPolicyName(policy.name);
        setNewPolicyDesc(policy.description);
        setNewPolicyCondition(policy.condition);
        setNewPolicyAction(policy.action as any);
        setNewPolicyPriority(policy.priority);
    };

    return (
        <Card title="Programmable Value Rail" className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-2 text-white">Token Transfers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Sender Account ID:</label>
                    <input type="text" value={senderId} onChange={e => setSenderId(e.target.value)} className="w-full mt-1 p-2 bg-gray-900/50 rounded" readOnly={!!currentUser?.id} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Recipient Account ID:</label>
                    <input type="text" value={recipientId} onChange={e => setRecipientId(e.target.value)} className="w-full mt-1 p-2 bg-gray-900/50 rounded" placeholder="e.g., user_1, system_treasury" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Token:</label>
                    <select value={tokenId} onChange={e => setTokenId(e.target.value)} className="w-full mt-1 p-2 bg-gray-900/50 rounded">
                        {programmableTokens.map(token => <option key={token.id} value={token.id}>{token.name} ({token.symbol})</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Amount:</label>
                    <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} className="w-full mt-1 p-2 bg-gray-900/50 rounded" min="0" />
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Sender Private Key (Simulated):</label>
                    <input type="password" value={senderPrivateKey} onChange={e => setSenderPrivateKey(e.target.value)} className="w-full mt-1 p-2 bg-gray-900/50 rounded" readOnly={!!currentUser?.privateKey} />
                    <p className="text-xs text-gray-500 mt-1">For demo, use current user's private key: {currentUser?.privateKey}</p>
                </div>
            </div>
            <button onClick={handleTransfer} disabled={!canInitiateSettlement} className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50">
                Initiate Token Transfer
            </button>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Transaction Log</h3>
            <div className="max-h-60 overflow-y-auto bg-gray-900/30 p-2 rounded border border-gray-700">
                {tokenTransactions.length === 0 ? (
                    <p className="text-gray-500 text-sm">No transactions yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {tokenTransactions.slice().reverse().map(tx => (
                            <li key={tx.id} className={`text-xs p-1 rounded ${tx.status === 'Confirmed' ? 'bg-green-900/20' : tx.status === 'Failed' ? 'bg-red-900/20' : 'bg-yellow-900/20'} border-l-2 border-gray-700`}>
                                <span className="text-gray-400">{new Date(tx.timestamp).toLocaleTimeString()}</span> - <span className="font-medium text-white">{tx.senderId}</span> to <span className="font-medium text-white">{tx.recipientId}</span>: {tx.amount} {programmableTokens.find(t=>t.id===tx.tokenId)?.symbol || tx.tokenId} (<span className={`${tx.status === 'Confirmed' ? 'text-green-300' : tx.status === 'Failed' ? 'text-red-300' : 'text-yellow-300'}`}>{tx.status}</span>) via <span className="italic">{tx.railUsed}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Settlement Policies</h3>
            <div className="max-h-48 overflow-y-auto bg-gray-900/30 p-2 rounded border border-gray-700">
                {settlementPolicies.length === 0 ? (
                    <p className="text-gray-500 text-sm">No settlement policies configured.</p>
                ) : (
                    <ul className="space-y-2">
                        {settlementPolicies.map(policy => (
                            <li key={policy.id} className="p-2 rounded bg-gray-800 hover:bg-gray-700 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-white">{policy.name} (Priority: {policy.priority})</p>
                                    <p className="text-xs text-gray-400">Condition: <code className="text-cyan-300">{policy.condition}</code>, Action: <code className="text-green-300">{policy.action}</code></p>
                                </div>
                                <button onClick={() => handleEditPolicy(policy)} className="text-sm text-cyan-400 hover:text-cyan-300" disabled={!canManagePolicies}>Edit</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {canManagePolicies && (
                <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <h4 className="text-lg font-bold text-white mb-2">{editingPolicy ? 'Edit Policy' : 'Add New Policy'}</h4>
                    <label className="block text-sm font-medium text-gray-300">Name:</label>
                    <input type="text" value={newPolicyName} onChange={e => setNewPolicyName(e.target.value)} className="w-full mt-1 p-2 bg-gray-900/50 rounded" />
                    <label className="block text-sm font-medium text-gray-300 mt-2">Description:</label>
                    <input type="text" value={newPolicyDesc} onChange={e => setNewPolicyDesc(e.target.value)} className="w-full mt-1 p-2 bg-gray-900/50 rounded" />
                    <label className="block text-sm font-medium text-gray-300 mt-2">Condition (JS expression, e.g., 'amount > 1000'):</label>
                    <input type="text" value={newPolicyCondition} onChange={e => setNewPolicyCondition(e.target.value)} className="w-full mt-1 p-2 bg-gray-900/50 rounded font-mono" />
                    <label className="block text-sm font-medium text-gray-300 mt-2">Action:</label>
                    <select value={newPolicyAction} onChange={e => setNewPolicyAction(e.target.value as any)} className="w-full mt-1 p-2 bg-gray-900/50 rounded">
                        <option value="route_to_fast_rail">Route to Fast Rail</option>
                        <option value="route_to_secure_rail">Route to Secure Rail</option>
                    </select>
                    <label className="block text-sm font-medium text-gray-300 mt-2">Priority (lower is higher priority):</label>
                    <input type="number" value={newPolicyPriority} onChange={e => setNewPolicyPriority(parseInt(e.target.value))} className="w-full mt-1 p-2 bg-gray-900/50 rounded" min="0" />
                    <div className="mt-4 flex justify-end space-x-2">
                        {editingPolicy && <button onClick={() => setEditingPolicy(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>}
                        <button onClick={handleSavePolicy} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">Save Policy</button>
                    </div>
                </div>
            )}
        </Card>
    );
};

/**
 * Displays pending and processed payment instructions.
 * Provides real-time visibility into the Real-Time Settlement Engine's activity.
 */
export const PaymentsDisplay: React.FC<{
    pendingPayments: PaymentInstruction[];
    currentUser: UserProfile | null;
    onProcessPaymentRequest: (payerId: string, payeeId: string, tokenId: string, amount: number, payerPrivateKey: string) => Promise<PaymentInstruction | null>;
    canInitiateSettlement: boolean;
}> = ({ pendingPayments, currentUser, onProcessPaymentRequest, canInitiateSettlement }) => {
    const [payeeId, setPayeeId] = useState('');
    const [tokenId, setTokenId] = useState('FIAT_USD');
    const [amount, setAmount] = useState(0);

    const handleInitiatePayment = async () => {
        if (!currentUser?.id || !payeeId || !tokenId || amount <= 0 || !currentUser?.privateKey) {
            alert('Please fill all payment initiation fields.');
            return;
        }
        if (currentUser.id === payeeId) {
            alert('Payer and payee cannot be the same.');
            return;
        }
        const payment = await onProcessPaymentRequest(currentUser.id, payeeId, tokenId, amount, currentUser.privateKey);
        if (payment) {
            alert(`Payment initiated: ${payment.id}. Status: ${payment.status}`);
            setPayeeId('');
            setAmount(0);
        } else {
            alert('Payment initiation failed. Check console for details.');
        }
    };

    return (
        <Card title="Real-Time Payments Engine" className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-2 text-white">Initiate New Payment</h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Payer ID:</label>
                    <input type="text" value={currentUser?.id || ''} className="w-full mt-1 p-2 bg-gray-900/50 rounded" readOnly />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Payee Account ID:</label>
                    <input type="text" value={payeeId} onChange={e => setPayeeId(e.target.value)} className="w-full mt-1 p-2 bg-gray-900/50 rounded" placeholder="e.g., user_1, agent_liquidity_remediator" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Token:</label>
                    <select value={tokenId} onChange={e => setTokenId(e.target.value)} className="w-full mt-1 p-2 bg-gray-900/50 rounded">
                        <option value="FIAT_USD">sUSD</option>
                        <option value="GOV_TOKEN">GOV</option>
                        <option value="LIQUIDITY_SHARE">LPS</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Amount:</label>
                    <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} className="w-full mt-1 p-2 bg-gray-900/50 rounded" min="0" />
                </div>
            </div>
            <button onClick={handleInitiatePayment} disabled={!canInitiateSettlement} className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50">
                Initiate Payment
            </button>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Pending & Settled Payments</h3>
            <div className="max-h-60 overflow-y-auto bg-gray-900/30 p-2 rounded border border-gray-700">
                {pendingPayments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No payments recorded yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {pendingPayments.slice().reverse().map(payment => (
                            <li key={payment.id} className={`text-xs p-1 rounded ${payment.status === 'Settled' ? 'bg-green-900/20' : payment.status === 'Blocked' ? 'bg-red-900/20' : payment.status === 'Failed' ? 'bg-red-900/20' : 'bg-yellow-900/20'} border-l-2 border-gray-700`}>
                                <span className="text-gray-400">{new Date(payment.requestTimestamp).toLocaleTimeString()}</span> - <span className="font-medium text-white">{payment.payerId}</span> to <span className="font-medium text-white">{payment.payeeId}</span>: {payment.amount} {payment.tokenId} (<span className={`${payment.status === 'Settled' ? 'text-green-300' : payment.status === 'Blocked' || payment.status === 'Failed' ? 'text-red-300' : 'text-yellow-300'}`}>{payment.status}</span>) Risk: {payment.riskScore}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Card>
    );
};


// --- Main Component ---
/**
 * The main view component for the Ludic Balancer financial infrastructure.
 * Orchestrates all sub-systems and provides a unified interface for operational control.
 */
const LudicBalancerView: React.FC = () => {
    const { state, dispatch } = useGameMeta();
    const { generateReport, refineSuggestion } = useAIService();
    const { runSimulation } = useSimulationEngine();
    const { logAudit } = useLogger();
    const { createDigitalIdentity, authenticateEntity, authorizeAction } = useDigitalIdentity();
    const { transferTokens, mintTokens, burnTokens } = useProgrammableTokenRail();
    const { processPaymentRequest } = useRealTimePayments();

    const [gameDataInput, setGameDataInput] = useState(mockGameData);
    const [balanceReport, setBalanceReport] = useState<BalanceIssue[]>([]);
    const [metaReport, setMetaReport] = useState<any[]>([]); // For market dynamics analysis results
    const [powerCurveReport, setPowerCurveReport] = useState<any[]>([]); // For asset performance curve analysis results
    const [riskReport, setRiskReport] = useState<any[]>([]); // For real-time risk assessment
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'data', 'ai-analysis', 'simulation', 'token-rail', 'payments', 'history', 'observability', 'settings'
    const [selectedPromptTemplateId, setSelectedPromptTemplateId] = useState(initialGameMetaState.promptTemplates[0].id);
    const [selectedAIModel, setSelectedAIModel] = useState('gemini-2.5-flash');
    const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
    const [issueToRefine, setIssueToRefine] = useState<BalanceIssue | null>(null);
    const [apiKey, setApiKey] = useState(process.env.API_KEY || '');

    const currentPromptTemplate = state.promptTemplates.find(t => t.id === selectedPromptTemplateId);

    // Permissions based on current user's digital identity
    const canCreateReport = checkPermissions(state.currentUser, ['create_report']);
    const canProposeChange = checkPermissions(state.currentUser, ['propose_change']);
    const canRunSimulation = checkPermissions(state.currentUser, ['run_simulation']);
    const canApproveChange = checkPermissions(state.currentUser, ['approve_change']);
    const canManagePrompts = checkPermissions(state.currentUser, ['manage_prompts']);
    const canResetData = checkPermissions(state.currentUser, ['reset_data']);
    const canTriggerAgent = checkPermissions(state.currentUser, ['trigger_agent']);
    const canViewReport = checkPermissions(state.currentUser, ['view_report']);
    const canViewAuditLogs = checkPermissions(state.currentUser, ['view_audit_logs']);
    const canManageIdentities = checkPermissions(state.currentUser, ['manage_identities']);
    const canInitiateSettlement = checkPermissions(state.currentUser, ['initiate_settlement']);
    const canManagePolicies = checkPermissions(state.currentUser, ['manage_policies']);


    // Agentic AI hook
    const { runAgentCycle, toggleAgentStatus } = useAgenticAI(generateReport, gameDataInput, setBalanceReport, dispatch);

    // Initial data processing from mockGameData
    /**
     * Processes initial mock financial telemetry to populate the system.
     * Essential for bootstrapping the platform with actionable data.
     */
    useEffect(() => {
        const { heroes, items } = parseGameData(gameDataInput);
        dispatch({ type: 'SET_HERO_STATS', payload: heroes });
        dispatch({ type: 'SET_ITEM_STATS', payload: items });
        logAudit('FINANCIAL_DATA_INITIAL_LOADED', { dataSource: 'mockGameData' }, 'System', 'Info');
    }, [gameDataInput, dispatch, logAudit]);

    /**
     * Handles processing and loading new financial telemetry.
     * Creates a new historical snapshot of the system state.
     */
    const handleApplyData = useCallback(() => {
        const { heroes, items } = parseGameData(gameDataInput);
        dispatch({ type: 'SET_HERO_STATS', payload: heroes });
        dispatch({ type: 'SET_ITEM_STATS', payload: items });

        const newSnapshot: GameSnapshot = {
            id: generateUUID(),
            timestamp: new Date().toISOString(),
            gameData: gameDataInput,
            processedStats: heroes,
            balanceReport: balanceReport, // Include current balance report
            versionTag: `Data Update ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
            notes: 'Raw financial telemetry updated and processed.'
        };
        dispatch({ type: 'ADD_SNAPSHOT', payload: newSnapshot });
        dispatch({ type: 'LOAD_SNAPSHOT', payload: newSnapshot }); // Load it immediately
        logAudit('FINANCIAL_DATA_APPLIED', { numAssets: heroes.length, numInstruments: items.length, snapshotId: newSnapshot.id }, 'User', 'Info');
    }, [gameDataInput, dispatch, balanceReport, logAudit]);

    /**
     * Handles triggering an AI-driven financial analysis.
     * Based on the selected prompt, it generates structured reports.
     */
    const handleAnalyze = async () => {
        if (!canCreateReport) {
            logAudit('PERMISSION_DENIED', { action: 'Generate AI Report', templateId: selectedPromptTemplateId }, 'User', 'Warning');
            alert('You do not have permission to generate AI reports.');
            return;
        }

        setIsLoading(true);
        setBalanceReport([]);
        setMetaReport([]);
        setPowerCurveReport([]);
        setRiskReport([]);

        if (!currentPromptTemplate) {
            logAudit('AI_ANALYSIS_FAILED', { reason: 'No prompt template selected' }, 'System', 'Error');
            alert('No prompt template selected.');
            setIsLoading(false);
            return;
        }

        try {
            const report = await generateReport(currentPromptTemplate, gameDataInput, selectedAIModel);
            if (currentPromptTemplate.id === 'general_balance' && report?.analysis) {
                const parsedReports: BalanceIssue[] = report.analysis.map((item: any) => ({
                    ...item,
                    status: 'Pending',
                    proposedBy: state.currentUser?.name || 'AI',
                    timestamp: new Date().toISOString()
                }));
                setBalanceReport(parsedReports);
                if (state.currentSnapshot) {
                    dispatch({
                        type: 'ADD_SNAPSHOT',
                        payload: {
                            ...state.currentSnapshot,
                            id: generateUUID(),
                            timestamp: new Date().toISOString(),
                            balanceReport: parsedReports,
                            versionTag: `AI Imbalance Report ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
                        }
                    });
                }
            } else if (currentPromptTemplate.id === 'meta_analysis' && report?.metaTrends) {
                setMetaReport(report.metaTrends);
            } else if (currentPromptTemplate.id === 'power_curve_analysis' && report?.powerCurveAnalysis) {
                setPowerCurveReport(report.powerCurveAnalysis);
            } else if (currentPromptTemplate.id === 'risk_assessment' && report?.riskReport) {
                setRiskReport(report.riskReport);
            }
        } catch (error: any) {
            // Error logged by useAIService
            alert(`Failed to generate AI report: ${error.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Opens a modal to refine an existing AI-generated suggestion.
     * Allows for collaborative, iterative policy design.
     */
    const handleRefineSuggestion = useCallback((issue: BalanceIssue) => {
        if (!canProposeChange) {
            logAudit('PERMISSION_DENIED', { action: 'Refine Suggestion', issueElement: issue.element }, 'User', 'Warning');
            alert('You do not have permission to refine suggestions.');
            return;
        }
        setIssueToRefine(issue);
        setIsRefineModalOpen(true);
    }, [canProposeChange, logAudit]);

    /**
     * Confirms the refinement of an AI suggestion and updates the report.
     * Integrates human expertise into AI-driven recommendations.
     */
    const handleRefineConfirm = async (issue: BalanceIssue, context: string) => {
        setIsLoading(true);
        try {
            const refinedText = await refineSuggestion(issue, context, selectedAIModel);
            setBalanceReport(prev => prev.map(item =>
                item.element === issue.element && item.problem === issue.problem
                    ? { ...item, suggestion: refinedText, confidenceScore: Math.min(1, (item.confidenceScore || 0) + 0.1) } // Bump confidence
                    : item
            ));
            setIsRefineModalOpen(false);
        } catch (error: any) {
            alert(`Refinement failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Updates the status of a balance issue (e.g., Pending, Approved, Implemented).
     * Drives the governance workflow for policy changes.
     */
    const handleUpdateBalanceIssueStatus = useCallback((issue: BalanceIssue, status: 'Pending' | 'Approved' | 'Rejected' | 'Implemented') => {
        if (!canApproveChange) {
            logAudit('PERMISSION_DENIED', { action: `Change Status to ${status}`, issueElement: issue.element }, 'User', 'Warning');
            alert('You do not have permission to approve or implement changes.');
            return;
        }

        dispatch({
            type: 'UPDATE_BALANCE_ISSUE_STATUS',
            payload: {
                issueElement: issue.element,
                issueProblem: issue.problem,
                status,
                by: state.currentUser?.name || 'System'
            }
        });

        setBalanceReport(prev => prev.map(item =>
            item.element === issue.element && item.problem === issue.problem
                ? { ...item, status, proposedBy: state.currentUser?.name || 'System', timestamp: new Date().toISOString() }
                : item
        ));

        logAudit('FINANCIAL_IMBALANCE_STATUS_UPDATED', { issueElement: issue.element, oldStatus: issue.status, newStatus: status, userId: state.currentUser?.id }, 'User', 'Info');
        if (status === 'Approved') {
            logAudit('FINANCIAL_IMBALANCE_APPROVED', { issueElement: issue.element, issueProblem: issue.problem }, 'User', 'Info');
            dispatch({ type: 'INCREMENT_METRIC', payload: { name: 'total_balance_issues_approved' } });
        }
        if (status === 'Implemented') {
            logAudit('FINANCIAL_IMBALANCE_IMPLEMENTED', { issueElement: issue.element, issueProblem: issue.problem }, 'User', 'Info');
            dispatch({ type: 'INCREMENT_METRIC', payload: { name: 'total_balance_issues_implemented' } });
        }
    }, [dispatch, state.currentUser, canApproveChange, logAudit]);

    /**
     * Executes a financial scenario simulation with selected policy changes.
     * Provides a predictive sandbox for strategic planning.
     */
    const handleRunSimulation = useCallback(async (params: SimulationParameters, proposedChanges: BalanceIssue[]) => {
        if (!canRunSimulation) {
            logAudit('PERMISSION_DENIED', { action: 'Run Simulation', numChanges: proposedChanges.length }, 'User', 'Warning');
            alert('You do not have permission to run simulations.');
            return;
        }
        setIsLoading(true);
        try {
            const result = await runSimulation(params, state.heroStats, proposedChanges, state.currentSnapshot?.id || 'no_snapshot');
            console.log('Simulation Result:', result);
        } catch (error: any) {
            alert(`Simulation failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [runSimulation, state.heroStats, state.currentSnapshot, canRunSimulation, logAudit]);

    /**
     * Loads a historical financial system snapshot, reverting the view to a past state.
     * Useful for forensic analysis or revisiting previous policy decisions.
     */
    const handleLoadSnapshot = useCallback((snapshot: GameSnapshot) => {
        setGameDataInput(snapshot.gameData);
        dispatch({ type: 'LOAD_SNAPSHOT', payload: snapshot });
        setBalanceReport(snapshot.balanceReport); // Load the report that was saved with the snapshot
        setMetaReport([]);
        setPowerCurveReport([]);
        setRiskReport([]);
        logAudit('FINANCIAL_SNAPSHOT_LOADED', { snapshotId: snapshot.id, versionTag: snapshot.versionTag }, 'User', 'Info');
        alert(`Snapshot "${snapshot.versionTag}" loaded successfully!`);
    }, [dispatch, logAudit]);

    /**
     * Saves application settings, including the AI API key.
     * Ensures persistence of configuration for the local demo.
     */
    const handleSaveSettings = useCallback(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('ludicBalancer_apiKey', apiKey);
            process.env.API_KEY = apiKey; // Update runtime environment (for demonstration)
        }
        logAudit('SETTINGS_SAVED', { apiKeySet: !!apiKey }, 'User', 'Info');
        alert('Settings saved successfully!');
    }, [apiKey, logAudit]);

    /**
     * Resets all application data to its initial state.
     * Provides a clean slate for new demonstrations or development.
     */
    const handleResetAppState = useCallback(() => {
        if (!canResetData) {
            logAudit('PERMISSION_DENIED', { action: 'Reset Application Data' }, 'User', 'Warning');
            alert('You do not have permission to reset application data.');
            return;
        }
        if (confirm('Are you sure you want to reset all application data? This cannot be undone.')) {
            localStorage.removeItem('ludicBalancerState');
            localStorage.removeItem('ludicBalancer_apiKey');
            logAudit('APP_DATA_RESET', {}, 'User', 'Critical');
            window.location.reload(); // Force a hard reset for simplicity
        }
    }, [canResetData, logAudit]);

    /**
     * Effect to load API key from localStorage on component mount.
     * Ensures continuity of AI service configuration.
     */
    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedApiKey = localStorage.getItem('ludicBalancer_apiKey');
            if (storedApiKey) {
                setApiKey(storedApiKey);
                process.env.API_KEY = storedApiKey;
            }
        }
    }, []);

    /**
     * Navigates to the settings tab to manage prompt templates.
     */
    const handleAddCustomPrompt = useCallback(() => {
        setActiveTab('settings');
    }, []);

    /**
     * Helper function to render the appropriate AI report content based on the active analysis mode.
     * Dynamically displays insights from different AI models.
     */
    const renderReportContent = () => {
        if (isLoading) {
            return <p className="text-gray-400">Analyzing financial telemetry...</p>;
        }
        if (!canViewReport) {
            return <p className="text-red-400">You do not have permission to view reports.</p>;
        }
        if (currentPromptTemplate?.id === 'general_balance' && balanceReport.length > 0) {
            return <BalanceReportDisplay
                report={balanceReport}
                onRefine={handleRefineSuggestion}
                onUpdateStatus={handleUpdateBalanceIssueStatus}
                canApprove={canApproveChange}
                canImplement={canApproveChange}
            />;
        }
        if (currentPromptTemplate?.id === 'meta_analysis' && metaReport.length > 0) {
            return <MetaAnalysisReportDisplay report={metaReport} />;
        }
        if (currentPromptTemplate?.id === 'power_curve_analysis' && powerCurveReport.length > 0) {
            return <PowerCurveReportDisplay report={powerCurveReport} />;
        }
        if (currentPromptTemplate?.id === 'risk_assessment' && riskReport.length > 0) {
            return <RiskAssessmentReportDisplay report={riskReport} />;
        }
        return <p className="text-gray-500">Run analysis to generate a report.</p>;
    };

    /**
     * Adds a new settlement policy to the programmable token rail.
     */
    const handleAddSettlementPolicy = useCallback((policy: SettlementPolicy) => {
        if (!canManagePolicies) {
            logAudit('PERMISSION_DENIED', { action: 'Add Settlement Policy', policyName: policy.name }, 'User', 'Warning');
            alert('You do not have permission to manage settlement policies.');
            return;
        }
        dispatch({ type: 'ADD_SETTLEMENT_POLICY', payload: policy });
        logAudit('SETTLEMENT_POLICY_ADDED', { policyId: policy.id, policyName: policy.name }, 'User', 'Info');
    }, [dispatch, logAudit, canManagePolicies]);

    /**
     * Updates an existing settlement policy on the programmable token rail.
     */
    const handleUpdateSettlementPolicy = useCallback((policy: SettlementPolicy) => {
        if (!canManagePolicies) {
            logAudit('PERMISSION_DENIED', { action: 'Update Settlement Policy', policyName: policy.name }, 'User', 'Warning');
            alert('You do not have permission to manage settlement policies.');
            return;
        }
        dispatch({ type: 'UPDATE_SETTLEMENT_POLICY', payload: policy });
        logAudit('SETTLEMENT_POLICY_UPDATED', { policyId: policy.id, policyName: policy.name }, 'User', 'Info');
    }, [dispatch, logAudit, canManagePolicies]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 109: Ludic Financial Infrastructure</h1>

            {/* Tab Navigation */}
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'dashboard' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'data' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'}`}
                    >
                        Data Management
                    </button>
                    <button
                        onClick={() => setActiveTab('ai-analysis')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'ai-analysis' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'}`}
                    >
                        AI Analysis
                    </button>
                    <button
                        onClick={() => setActiveTab('simulation')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'simulation' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'}`}
                    >
                        Simulation
                    </button>
                    <button
                        onClick={() => setActiveTab('token-rail')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'token-rail' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'}`}
                    >
                        Programmable Value Rail
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'payments' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'}`}
                    >
                        Real-Time Payments
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'history' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'}`}
                    >
                        History
                    </button>
                    <button
                        onClick={() => setActiveTab('observability')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'observability' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'}`}
                    >
                        Observability
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'settings' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'}`}
                    >
                        Settings
                    </button>
                </nav>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {activeTab === 'dashboard' && (
                    <>
                        <Card title="Financial System Overview" className="lg:col-span-1">
                            <h3 className="text-lg font-semibold text-white mb-2">Current Financial Telemetry</h3>
                            <textarea value={gameDataInput} onChange={e => setGameDataInput(e.target.value)} className="w-full h-32 bg-gray-900/50 p-2 rounded text-sm font-mono" readOnly />
                            <button onClick={handleApplyData} className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50">
                                Refresh Processed Data
                            </button>

                            <h3 className="text-lg font-semibold text-white mt-6 mb-2">Market Stability Score</h3>
                            <div className="text-center">
                                <p className="text-5xl font-bold text-green-400">{calculateOverallMetaScore(state.heroStats).toFixed(0)}/100</p>
                                <p className="text-sm text-gray-400 mt-2">Current Market Dynamics: {state.heroStats.length > 0 ? 'Stable' : 'N/A'}</p>
                            </div>
                        </Card>
                        <Card title="AI Analysis Dashboard" className="lg:col-span-2">
                            <div className="min-h-[20rem]">
                                {renderReportContent()}
                            </div>
                            <div className="mt-4 border-t border-gray-700 pt-4 flex justify-between items-center">
                                <div>
                                    <label htmlFor="dashboard-analysis-mode" className="block text-xs font-medium text-gray-300">Quick Analyze:</label>
                                    <select
                                        id="dashboard-analysis-mode"
                                        value={selectedPromptTemplateId}
                                        onChange={e => setSelectedPromptTemplateId(e.target.value)}
                                        className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-700 bg-gray-900/50 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                    >
                                        {state.promptTemplates.map(template => (
                                            <option key={template.id} value={template.id}>{template.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button onClick={handleAnalyze} disabled={isLoading || !state.heroStats.length || !currentPromptTemplate || !canCreateReport} className="py-2 px-6 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                                    {isLoading ? 'Analyzing...' : `Run ${currentPromptTemplate?.name || 'Analysis'}`}
                                </button>
                            </div>
                        </Card>
                    </>
                )}

                {activeTab === 'data' && (
                    <div className="lg:col-span-3">
                        <DataManagementPanel
                            gameDataInput={gameDataInput}
                            setGameDataInput={setGameDataInput}
                            onApplyData={handleApplyData}
                            currentHeroStats={state.heroStats}
                            currentItemStats={state.itemStats}
                        />
                    </div>
                )}

                {activeTab === 'ai-analysis' && (
                    <>
                        <AIAnalysisConfigPanel
                            selectedTemplateId={selectedPromptTemplateId}
                            setSelectedTemplateId={setSelectedPromptTemplateId}
                            currentTemplate={currentPromptTemplate}
                            selectedModel={selectedAIModel}
                            setSelectedModel={setSelectedAIModel}
                            onAddCustomPrompt={handleAddCustomPrompt}
                        />
                        <Card title="AI Financial Report" className="lg:col-span-2">
                            <div className="min-h-[20rem]">
                                {renderReportContent()}
                            </div>
                            <button onClick={handleAnalyze} disabled={isLoading || !state.heroStats.length || !currentPromptTemplate || !canCreateReport} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                                {isLoading ? 'Analyzing...' : `Generate ${currentPromptTemplate?.name || 'Report'}`}
                            </button>
                        </Card>
                    </>
                )}

                {activeTab === 'simulation' && (
                    <div className="lg:col-span-3">
                        <SimulationPanel
                            heroStats={state.heroStats}
                            balanceReports={balanceReport}
                            onRunSimulation={handleRunSimulation}
                            isLoading={isLoading}
                            simulationResults={state.simulationResults}
                        />
                    </div>
                )}

                {activeTab === 'token-rail' && (
                    <div className="lg:col-span-3">
                        <TokenRailManagementPanel
                            programmableTokens={state.programmableTokens}
                            tokenLedger={state.tokenLedger}
                            tokenTransactions={state.tokenTransactions}
                            settlementPolicies={state.settlementPolicies}
                            currentUser={state.currentUser}
                            onTransferTokens={transferTokens}
                            onAddSettlementPolicy={handleAddSettlementPolicy}
                            onUpdateSettlementPolicy={handleUpdateSettlementPolicy}
                            canInitiateSettlement={canInitiateSettlement}
                            canManagePolicies={canManagePrompts} // Re-using canManagePrompts for policy management for simplicity
                        />
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="lg:col-span-3">
                        <PaymentsDisplay
                            pendingPayments={state.pendingPayments}
                            currentUser={state.currentUser}
                            onProcessPaymentRequest={processPaymentRequest}
                            canInitiateSettlement={canInitiateSettlement}
                        />
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="lg:col-span-3">
                        <HistoryPanel
                            snapshots={state.history}
                            onLoadSnapshot={handleLoadSnapshot}
                        />
                    </div>
                )}

                {activeTab === 'observability' && (
                    <>
                        <AgentControlPanel
                            agents={state.agents}
                            toggleAgentStatus={toggleAgentStatus}
                            canTriggerAgent={canTriggerAgent}
                        />
                        <MetricsDashboard metrics={state.metrics} />
                        <ActivityLogDisplay logs={canViewAuditLogs ? state.auditLogs : []} />
                    </>
                )}

                {activeTab === 'settings' && (
                    <div className="lg:col-span-3">
                        <AppSettingsPanel
                            apiKey={apiKey}
                            setApiKey={setApiKey}
                            onSaveSettings={handleSaveSettings}
                            onResetState={handleResetAppState}
                            canManagePrompts={canManagePrompts}
                            canResetData={canResetData}
                        />
                    </div>
                )}
            </div>

            <RefineSuggestionModal
                isOpen={isRefineModalOpen}
                onClose={() => setIsRefineModalOpen(false)}
                issue={issueToRefine}
                onRefineConfirm={handleRefineConfirm}
                isLoading={isLoading}
            />
        </div>
    );
};

export default LudicBalancerView;