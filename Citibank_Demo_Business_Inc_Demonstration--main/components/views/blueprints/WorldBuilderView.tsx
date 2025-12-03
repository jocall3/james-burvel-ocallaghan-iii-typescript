/**
 * This module implements the Financial Blueprint Designer, a revolutionary AI-powered platform
 * for conceptualizing, modeling, and prototyping the next generation of digital financial infrastructure.
 * Business impact: It enables financial institutions to rapidly design and simulate complex
 * programmable value rails, intelligent automation agents, and robust digital identity frameworks,
 * significantly accelerating innovation cycles and reducing time-to-market for new financial products.
 * This system generates long-term business value by providing a strategic workbench for creating
 * highly secure, scalable, and auditable financial ecosystems, driving competitive advantage
 * and unlocking new revenue streams in the evolving digital economy.
 */
import React, { useState, useCallback, useMemo, useRef, useEffect, createContext, useContext, useReducer } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';

/**
 * Defines a high-level concept for a financial product or infrastructure solution.
 * This forms the foundational vision for new digital finance initiatives, guiding subsequent detailed design.
 * Commercial value: Establishes a clear, AI-assisted strategic direction for high-value financial innovations.
 */
export interface FinancialProductConcept {
    description: string;
    keyComponents: string[];
    marketOpportunity: string;
    imageUrl?: string; // Base64 encoded image representing the concept
}

/**
 * Defines a specific market segment or operational jurisdiction within the financial infrastructure.
 * These segments allow for granular policy application, compliance rules, and targeted service deployment.
 * Commercial value: Enables precise targeting of financial services, regulatory adherence, and optimized resource allocation.
 */
export interface MarketSegment {
    id: string;
    name: string;
    type: string; // e.g., Retail Payments, Institutional Lending, Derivative Markets, KYC/AML Zone
    regulatoryEnvironment: string; // e.g., Highly Regulated (EU), Emerging Market (APAC), Decentralized (Global)
    targetDemographics: string; // e.g., High-Net-Worth Individuals, SMEs, Retail Consumers, Interbank
    keyComplianceRequirements: string[];
    associatedProtocols: string[];
    uniqueMarketDynamics: string[]; // e.g., High liquidity, Volatility-prone, Emerging tech adoption
    description: string;
    imageUrl?: string;
    createdAt: number;
    updatedAt: number;
}

export type InfrastructureComponentType = 'Programmable Asset' | 'Automated Agent' | 'Data Feed' | 'Network Node' | 'Digital Identity Role' | 'Value Transfer Mechanism' | 'Protocol Integration' | 'Cryptographic Security Module';

/**
 * Base interface for all infrastructure components, providing fundamental metadata.
 * These components are the building blocks of any programmable financial solution.
 * Commercial value: Standardizes the definition and management of critical financial system elements.
 */
export interface BaseInfrastructureComponent {
    id: string;
    name: string;
    type: InfrastructureComponentType;
    description: string;
    criticality: 'Low' | 'Medium' | 'High' | 'Mission-Critical';
    tags: string[];
    imageUrl?: string;
    createdAt: number;
    updatedAt: number;
}

/**
 * Represents a definition for a programmable digital asset, such as a tokenized security or stablecoin.
 * This defines the properties and behaviors of value units within the system.
 * Commercial value: Facilitates the creation of new financial products, enabling fractional ownership and automated value exchange.
 */
export interface ProgrammableAssetDefinition extends BaseInfrastructureComponent {
    type: 'Programmable Asset';
    assetClass: string; // e.g., Equity, Debt, Commodity, Currency
    issuanceMechanism: string; // e.g., On-chain minting, Central bank digital currency
    transferRestrictions: string[]; // e.g., KYC-gated, Whitelist-only, Geographic restrictions
    settlementLayer: string; // e.g., Layer 1 Blockchain, Centralized Ledger, Payment Network
}

/**
 * Represents an intelligent automation agent, capable of observing, deciding, and acting within the financial ecosystem.
 * These agents perform tasks like risk assessment, compliance monitoring, or trade execution.
 * Commercial value: Automates complex financial processes, reducing operational costs, improving efficiency, and enhancing real-time responsiveness.
 */
export interface AutomatedAgentDefinition extends BaseInfrastructureComponent {
    type: 'Automated Agent';
    agentRole: 'Risk Monitor' | 'Compliance Officer' | 'Trade Executor' | 'Liquidity Provider' | 'Oracle Validator' | 'Fraud Detector';
    operationalScope: string; // e.g., Cross-market arbitrage, Real-time settlement, KYC verification
    decisionLogic: string[]; // e.g., Rules-based, Heuristic, AI-driven
    communicationProtocols: string[]; // e.g., Internal messaging bus, API endpoints
}

/**
 * Defines configurations for external data feeds, crucial for real-time financial operations.
 * Examples include market price oracles, identity verification services, or regulatory data streams.
 * Commercial value: Ensures data integrity and timeliness, powering informed decisions and accurate transaction processing.
 */
export interface DataFeedConfiguration extends BaseInfrastructureComponent {
    type: 'Data Feed';
    dataType: string; // e.g., Market Price, Identity Verification, Regulatory Update, FX Rates
    sourceProvider: string;
    updateFrequency: 'Real-time' | 'Hourly' | 'Daily' | 'Event-driven';
    validationMechanisms: string[]; // e.g., Multi-source consensus, Cryptographic attestation
}

/**
 * Describes the topology and specifications of a network node within the financial infrastructure.
 * This includes nodes for distributed ledgers, payment networks, or secure communication hubs.
 * Commercial value: Ensures the robustness, decentralization, and scalability of underlying network infrastructure.
 */
export interface NetworkNodeTopology extends BaseInfrastructureComponent {
    type: 'Network Node';
    nodeFunction: 'Validator' | 'Archival' | 'Payment Gateway' | 'Custodial Service' | 'Bridge Operator';
    networkType: 'DLT (Public)' | 'DLT (Private)' | 'Traditional Payment Network' | 'Secure Messaging Fabric';
    hostingEnvironment: string; // e.g., Cloud (AWS), On-premise, Hybrid
    securityProtocols: string[];
}

/**
 * Represents a digital identity role or persona within the system, defining access rights and capabilities.
 * This could be for individual users, institutional clients, auditors, or other automated services.
 * Commercial value: Forms the bedrock of secure access control and compliance, crucial for auditable financial operations.
 */
export interface DigitalIdentityRole extends BaseInfrastructureComponent {
    type: 'Digital Identity Role';
    roleCategory: 'Individual' | 'Institutional' | 'Regulatory' | 'System';
    authenticationMethod: string[]; // e.g., Multi-factor authentication, Biometric, Decentralized Identifiers (DIDs)
    authorizationPolicies: string[]; // e.g., Role-based, Attribute-based, Policy-as-Code
    dataPrivacyStandards: string; // e.g., GDPR, CCPA, HIPAA
    verificationLevel: 'Basic' | 'KYC/AML' | 'Institutional Verified';
}

/**
 * Describes mechanisms for transferring value across different rails or networks.
 * This includes bridge configurations, payment network adapters, or cross-chain settlement modules.
 * Commercial value: Enables seamless, efficient, and secure movement of value across disparate financial systems, reducing friction and cost.
 */
export interface ValueTransferMechanism extends BaseInfrastructureComponent {
    type: 'Value Transfer Mechanism';
    propulsionMechanism: string; // e.g., Atomic Swaps, Lightning Network, RTGS, Interledger Protocol
    interoperabilityScope: 'Cross-Chain' | 'Cross-Network' | 'Intra-Network';
    transactionCapacity: string; // e.g., "10,000 TPS", "High throughput for batch settlement"
    resilienceMeasures: string[]; // e.g., Idempotency, Retry logic with backoff, Circuit breakers
}

/**
 * Defines the integration schema for various protocols, such as DLTs, APIs, or messaging standards.
 * This ensures interoperability and data exchange between different parts of the financial ecosystem.
 * Commercial value: Bridges disparate systems, reducing integration complexities and enabling a unified financial architecture.
 */
export interface ProtocolIntegrationSchema extends BaseInfrastructureComponent {
    type: 'Protocol Integration';
    protocolStandard: string; // e.g., ISO 20022, FIX Protocol, ERC-20, Inter-Blockchain Communication (IBC)
    applicationLayer: string; // e.g., Payment Processing, Trade Execution, Regulatory Reporting
    complexityRating: 'Simple' | 'Moderate' | 'Advanced' | 'Cutting-Edge';
    securityConsiderations: string[];
}

/**
 * Represents a module for cryptographic security, such as Hardware Security Modules (HSM), key management systems, or zero-knowledge proof engines.
 * This ensures the integrity, confidentiality, and authenticity of financial transactions and data.
 * Commercial value: Provides fundamental security assurances, protecting high-value assets and sensitive data against sophisticated cyber threats.
 */
export interface CryptographicSecurityModule extends BaseInfrastructureComponent {
    type: 'Cryptographic Security Module';
    attestationMechanism: string; // e.g., Trusted Execution Environment (TEE), Multi-Party Computation (MPC)
    functionality: string[]; // e.g., Key generation, Digital signing, Data encryption, Secure multi-party computation
    securityAssuranceLevel: 'FIPS 140-2 Level 3' | 'Common Criteria EAL7' | 'Software-based';
    threatMitigation: string[];
}

export type AnyInfrastructureComponent = ProgrammableAssetDefinition | AutomatedAgentDefinition | DataFeedConfiguration | NetworkNodeTopology | DigitalIdentityRole | ValueTransferMechanism | ProtocolIntegrationSchema | CryptographicSecurityModule;

/**
 * Represents a document for regulatory compliance, audit trail narrative, or historical market analysis.
 * These entries provide contextual and auditable information for governance and reporting.
 * Commercial value: Ensures transparent compliance, robust auditing, and valuable insights for strategic decision-making.
 */
export interface RegulatoryComplianceDocument {
    id: string;
    title: string;
    type: 'Regulatory Filing' | 'Audit Report' | 'Legal Opinion' | 'Market Analysis' | 'Incident Post-Mortem' | 'Risk Assessment';
    content: string;
    relatedEntities: string[]; // IDs of related components, market segments, or other documents
    importance: 'Minor' | 'Standard' | 'Major' | 'Pivotal';
    imageUrl?: string; // Diagram or visualization
    createdAt: number;
    updatedAt: number;
}

/**
 * Defines a smart contract policy engine, outlining rules and logic for automated financial agreements.
 * These systems enable programmable finance with deterministic execution and auditable state changes.
 * Commercial value: Automates complex contractual agreements, reduces counterparty risk, and unlocks new forms of financial engineering.
 */
export interface SmartContractPolicyEngine {
    id: string;
    name: string;
    description: string;
    executionEnvironment: string; // e.g., Ethereum EVM, Hyperledger Fabric, Custom DSL
    policyRules: string[]; // e.g., "If A, then B; else C", "KYC required for transfers over $1M"
    exampleScenarios: string[];
    limitations: string[];
    integrationWithPlatform: string; // How does it affect settlement, agents?
    createdAt: number;
    updatedAt: number;
}

/**
 * Defines an interoperability framework, detailing how different protocols and systems connect.
 * This is crucial for creating a unified financial data fabric and value transfer network.
 * Commercial value: Eliminates data silos, facilitates seamless cross-system communication, and ensures network resilience and extensibility.
 */
export interface InteroperabilityFramework {
    id: string;
    name: string;
    description: string;
    keyStandards: string[]; // e.g., ISO 20022, REST APIs, GraphQL, gRPC, specific DLT connectors
    dataExchangeFormats: string[]; // e.g., JSON, XML, Protobuf
    securityMechanisms: string[]; // e.g., TLS, Mutual TLS, JWT, OAuth2
    impactOnLatency: string; // e.g., "Sub-millisecond for real-time settlement"
    createdAt: number;
    updatedAt: number;
}

/**
 * Represents a predefined operational scenario, such as a risk mitigation strategy, market stress test, or incident response plan.
 * These scenarios aid in testing and validating the resilience and effectiveness of the designed infrastructure.
 * Commercial value: Enhances platform resilience, reduces operational risk, and informs strategic adjustments to financial solutions.
 */
export interface OperationalScenario {
    id: string;
    title: string;
    summary: string;
    type: 'Risk Mitigation' | 'Compliance Audit' | 'Market Stress Test' | 'New Product Launch' | 'Fraud Detection' | 'Disaster Recovery';
    initiator: string; // e.g., "Chief Risk Officer", "System Monitoring Agent"
    goal: string;
    expectedOutcomes: string[];
    potentialChallenges: string[];
    relatedDocumentIds: string[];
    createdAt: number;
    updatedAt: number;
}

/**
 * Represents a complete project blueprint for a financial infrastructure solution.
 * It encapsulates all design elements, from high-level concepts to detailed component definitions.
 * Commercial value: Provides a comprehensive, auditable, and extensible blueprint for deploying enterprise-grade financial systems.
 */
export interface FinancialBlueprintProject {
    id: string;
    name: string;
    description: string;
    creatorId: string; // User ID
    createdAt: number;
    updatedAt: number;
    concept: FinancialProductConcept;
    marketSegments: MarketSegment[];
    components: AnyInfrastructureComponent[];
    documents: RegulatoryComplianceDocument[];
    policyEngines: SmartContractPolicyEngine[];
    interopFrameworks: InteroperabilityFramework[];
    operationalScenarios: OperationalScenario[];
    projectSettings: ProjectSettings;
    generationHistory: GenerationTask[]; // History of AI generations for this project
}

/**
 * Defines configuration settings specific to a financial blueprint project.
 * These settings control AI model usage, generation tone, and operational parameters.
 * Commercial value: Allows for tailored AI-driven development, optimizing for specific project needs and compliance standards.
 */
export interface ProjectSettings {
    aiModelPreference: string; // e.g., 'gemini-2.5-flash', 'gemini-1.5-pro'
    imageModelPreference: string; // e.g., 'imagen-4.0-generate-001'
    defaultTone: string; // e.g., 'Regulatory', 'Disruptive', 'Conservative'
    defaultPromptPrefix: string;
    defaultNegativePrompt: string; // For image generation, e.g., 'cartoonish, low-fidelity'
    autoSaveInterval: number; // in seconds
    collaborationEnabled: boolean;
    dataIntegrityChecksEnabled: boolean; // Toggle for enforcing schema validation
}

export type GenerationTaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Failed' | 'Cancelled';
export type GenerationTaskType = 'FinancialProductConcept' | 'MarketSegmentDetail' | 'ComponentDetail' | 'ComplianceDocument' | 'PolicyEngine' | 'InteropFramework' | 'OperationalScenario' | 'ImageGeneration' | 'Refinement';

/**
 * Records the details of an AI generation task, its status, and results.
 * This provides an auditable log of AI-assisted design decisions.
 * Commercial value: Ensures transparency, traceability, and accountability in AI-driven financial system design.
 */
export interface GenerationTask {
    id: string;
    projectId: string;
    type: GenerationTaskType;
    status: GenerationTaskStatus;
    prompt: string;
    generatedContent: any; // JSON or string result from AI
    error?: string;
    startTime: number;
    endTime?: number;
    targetId?: string; // ID of the specific item being generated/refined
    visualizationUrl?: string; // If it's an image generation task
}

/**
 * Stores user-specific preferences for the Financial Blueprint Designer interface.
 * This allows for personalized user experience and operational alerts.
 * Commercial value: Enhances user productivity, reduces cognitive load, and provides timely alerts for critical system thresholds.
 */
export interface UserPreferences {
    theme: 'dark' | 'light';
    defaultView: 'Dashboard' | 'Project Editor';
    notificationsEnabled: boolean;
    aiRateLimitWarningThreshold: number; // e.g., 80% of API limit for proactive alerts
    complianceReportingFrequency: 'Daily' | 'Weekly' | 'Monthly';
}

/**
 * Utility type for creating partial versions of interfaces, supporting incremental state updates.
 */
export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

// --- Mock Data & Helpers ---

const generateMockId = () => uuidv4();
const now = () => Date.now();

const initialFinancialPrompt = 'a real-time global payment network for cross-border settlements';

const initialFinancialProductConcept: FinancialProductConcept = {
    description: "A secure, real-time global payment network designed to facilitate instant cross-border settlements using tokenized assets. It leverages distributed ledger technology for transparency and immutability.",
    keyComponents: [
        "Programmable Stablecoin Assets",
        "Automated Compliance Agents",
        "Interoperability Gateways",
        "Digital Identity Verification Modules",
        "Cryptographic Key Management System"
    ],
    marketOpportunity: "Eliminate correspondent banking friction, reduce settlement times to seconds, and lower transaction costs for international trade and remittances. Target a multi-trillion dollar market opportunity in global payments.",
};

const initialMarketSegment: MarketSegment = {
    id: generateMockId(),
    name: "APAC Institutional FX",
    type: "Interbank Foreign Exchange",
    regulatoryEnvironment: "Highly Regulated (MAS, ASIC, HKMA)",
    targetDemographics: "Institutional Banks, Hedge Funds, Large Corporations in Asia-Pacific",
    keyComplianceRequirements: ["AML/CTF Reporting", "KYC for all participants", "Real-time Transaction Monitoring", "Data Sovereignty"],
    associatedProtocols: ["FIX Protocol", "ISO 20022", "Custom DLT-based Settlement Protocol"],
    uniqueMarketDynamics: ["High volume, low margin", "Latency-sensitive arbitrage", "Diverse currency pairs", "Complex multi-jurisdictional compliance"],
    description: "This segment focuses on high-volume, low-latency foreign exchange transactions between institutional players within the Asia-Pacific region. Strict regulatory frameworks and a diverse array of local currencies define its operational challenges and opportunities.",
    createdAt: now(),
    updatedAt: now(),
};

const initialComponent: ProgrammableAssetDefinition = {
    id: generateMockId(),
    name: "Interbank Settlement Token (IST)",
    type: "Programmable Asset",
    description: "A stablecoin pegged to a basket of major currencies, designed for instant, atomic settlement between participating financial institutions. Features built-in compliance logic.",
    criticality: "Mission-Critical",
    tags: ["stablecoin", "DLT", "settlement", "programmable"],
    assetClass: "Currency (Digital)",
    issuanceMechanism: "DLT-based, collateralized minting by central banks/authorized institutions",
    transferRestrictions: ["Whitelisted Institutional Accounts Only", "AML/CTF Flags"],
    settlementLayer: "Private/Permissioned DLT Network",
    createdAt: now(),
    updatedAt: now(),
};

const defaultProjectSettings: ProjectSettings = {
    aiModelPreference: 'gemini-2.5-flash',
    imageModelPreference: 'imagen-4.0-generate-001',
    defaultTone: 'Regulatory & Secure',
    defaultPromptPrefix: 'For a commercial-grade financial infrastructure platform, focusing on security and compliance, ',
    defaultNegativePrompt: 'cartoonish, informal, speculative, insecure, unregulated',
    autoSaveInterval: 120, // 2 minutes
    collaborationEnabled: false,
    dataIntegrityChecksEnabled: true,
};

const initialProject: FinancialBlueprintProject = {
    id: generateMockId(),
    name: "GlobalPayments 2.0 Blueprint",
    description: "A foundational blueprint for the next generation of global, real-time, programmable payment and settlement infrastructure.",
    creatorId: "financial-architect-alpha",
    createdAt: now(),
    updatedAt: now(),
    concept: initialFinancialProductConcept,
    marketSegments: [initialMarketSegment],
    components: [initialComponent],
    documents: [],
    policyEngines: [],
    interopFrameworks: [],
    operationalScenarios: [],
    projectSettings: defaultProjectSettings,
    generationHistory: [],
};

// --- Contexts for Global State Management ---
/**
 * Defines the application-wide state for the Financial Blueprint Designer.
 * This centralizes operational data, active projects, and user configurations.
 * Commercial value: Provides a single source of truth for the application, enabling consistent UI rendering and data management.
 */
interface AppState {
    financialBlueprintProjects: FinancialBlueprintProject[];
    activeProjectId: string | null;
    currentView: 'Dashboard' | 'Project Editor' | 'Settings' | 'Help';
    userPreferences: UserPreferences;
    generationQueue: GenerationTask[];
}

/**
 * Defines the actions that can be dispatched to modify the application state.
 * This action-based approach ensures predictable state transitions and easy debugging.
 * Commercial value: Enforces clear state management patterns, reducing bugs and improving maintainability for enterprise applications.
 */
type AppAction =
    | { type: 'SET_PROJECTS'; payload: FinancialBlueprintProject[] }
    | { type: 'ADD_PROJECT'; payload: FinancialBlueprintProject }
    | { type: 'UPDATE_PROJECT'; payload: FinancialBlueprintProject }
    | { type: 'DELETE_PROJECT'; payload: string }
    | { type: 'SET_ACTIVE_PROJECT'; payload: string | null }
    | { type: 'SET_VIEW'; payload: AppState['currentView'] }
    | { type: 'UPDATE_USER_PREFERENCES'; payload: DeepPartial<UserPreferences> }
    | { type: 'ADD_GENERATION_TASK'; payload: GenerationTask }
    | { type: 'UPDATE_GENERATION_TASK'; payload: GenerationTask }
    | { type: 'REMOVE_GENERATION_TASK'; payload: string };

/**
 * Reducer function for managing the application state, ensuring immutable updates.
 * This pattern is critical for complex applications requiring predictable state changes.
 * Commercial value: Provides a robust and scalable state management solution, enhancing application reliability and developer efficiency.
 */
const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'SET_PROJECTS':
            return { ...state, financialBlueprintProjects: action.payload };
        case 'ADD_PROJECT':
            return { ...state, financialBlueprintProjects: [...state.financialBlueprintProjects, action.payload] };
        case 'UPDATE_PROJECT':
            return {
                ...state,
                financialBlueprintProjects: state.financialBlueprintProjects.map(p =>
                    p.id === action.payload.id ? { ...p, ...action.payload, updatedAt: now() } : p
                ),
            };
        case 'DELETE_PROJECT':
            return {
                ...state,
                financialBlueprintProjects: state.financialBlueprintProjects.filter(p => p.id !== action.payload),
                activeProjectId: state.activeProjectId === action.payload ? null : state.activeProjectId,
            };
        case 'SET_ACTIVE_PROJECT':
            return { ...state, activeProjectId: action.payload };
        case 'SET_VIEW':
            return { ...state, currentView: action.payload };
        case 'UPDATE_USER_PREFERENCES':
            return { ...state, userPreferences: { ...state.userPreferences, ...action.payload } };
        case 'ADD_GENERATION_TASK':
            return { ...state, generationQueue: [...state.generationQueue, action.payload] };
        case 'UPDATE_GENERATION_TASK':
            return {
                ...state,
                generationQueue: state.generationQueue.map(task =>
                    task.id === action.payload.id ? { ...task, ...action.payload } : task
                ),
            };
        case 'REMOVE_GENERATION_TASK':
            return { ...state, generationQueue: state.generationQueue.filter(task => task.id !== action.payload) };
        default:
            return state;
    }
};

const initialAppState: AppState = {
    financialBlueprintProjects: [initialProject],
    activeProjectId: initialProject.id,
    currentView: 'Dashboard',
    userPreferences: {
        theme: 'dark',
        defaultView: 'Dashboard',
        notificationsEnabled: true,
        aiRateLimitWarningThreshold: 80,
        complianceReportingFrequency: 'Monthly',
    },
    generationQueue: [],
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | undefined>(undefined);

/**
 * Custom hook to access the application context, ensuring it's used within an AppProvider.
 * This provides a convenient and safe way to interact with global state.
 * Commercial value: Simplifies state access patterns, reducing boilerplate and potential runtime errors in complex UIs.
 */
const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

/**
 * Provides the application context to its children, managing global state and persistence.
 * This component acts as the central state hub for the entire application.
 * Commercial value: Enables robust state persistence and rehydration, ensuring a consistent user experience across sessions and preventing data loss.
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialAppState);

    useEffect(() => {
        const savedState = localStorage.getItem('financialBlueprintAppState');
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                dispatch({ type: 'SET_PROJECTS', payload: parsedState.financialBlueprintProjects });
                dispatch({ type: 'SET_ACTIVE_PROJECT', payload: parsedState.activeProjectId });
                dispatch({ type: 'SET_VIEW', payload: parsedState.currentView });
                dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: parsedState.userPreferences });
            } catch (e) {
                console.error("Failed to load state from localStorage", e);
            }
        }
    }, []);

    useEffect(() => {
        const { financialBlueprintProjects, activeProjectId, currentView, userPreferences } = state;
        localStorage.setItem('financialBlueprintAppState', JSON.stringify({ financialBlueprintProjects, activeProjectId, currentView, userPreferences }));
    }, [state.financialBlueprintProjects, state.activeProjectId, state.currentView, state.userPreferences]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

/**
 * A service wrapper for interacting with the Google GenAI models, abstracting API calls.
 * This provides a standardized interface for AI-powered content generation.
 * Commercial value: Centralizes AI communication, allows for easy model switching, and implements robust error handling for critical generation tasks.
 */
export class Aiservice {
    private ai: GoogleGenAI;
    private apiKey: string;

    /**
     * Constructs an AIService instance with a given API key.
     * @param apiKey The API key for Google GenAI.
     * @throws Error if the API key is not provided.
     */
    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error("API Key is required for GoogleGenAI. Ensure NEXT_PUBLIC_API_KEY is set.");
        }
        this.apiKey = apiKey;
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }

    /**
     * Calls a text-based AI model with a given prompt and an optional response schema.
     * Ensures structured JSON output when a schema is provided.
     * @param modelName The name of the AI model to use (e.g., 'gemini-1.5-pro').
     * @param prompt The input text prompt for the AI.
     * @param schema Optional JSON schema to enforce structured output.
     * @returns A Promise resolving to the AI-generated content (parsed JSON or raw text).
     * @throws Error if AI generation fails.
     */
    private async callModel(modelName: string, prompt: string, schema?: Type.OBJECT): Promise<any> {
        const config: any = { model: modelName, contents: [{ role: "user", parts: [{ text: prompt }] }] };
        if (schema) {
            config.generationConfig = { responseMimeType: "application/json", responseSchema: schema };
        } else {
            config.generationConfig = { responseMimeType: "text/plain" };
        }

        try {
            const response = await this.ai.models.generateContent(config);
            const textResponse = response.text();
            if (schema) {
                return JSON.parse(textResponse);
            }
            return textResponse;
        } catch (error) {
            console.error(`Error calling AI model ${modelName}:`, error);
            throw new Error(`AI generation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Calls an image generation AI model to create visualizations based on a prompt.
     * @param prompt The prompt describing the desired image.
     * @param modelName The name of the image generation model (default 'imagen-4.0-generate-001').
     * @returns A Promise resolving to the base64 encoded image URL.
     * @throws Error if image generation fails.
     */
    private async callImageModel(prompt: string, modelName: string = 'imagen-4.0-generate-001'): Promise<string> {
        try {
            const imageResponse = await this.ai.models.generateImages({
                model: modelName,
                prompt: prompt,
            });
            // Google GenAI imageBytes is a Uint8Array, needs conversion to Base64
            const imageBytes = imageResponse.generatedImages[0].image.imageBytes;
            if (!imageBytes) throw new Error("No imageBytes received.");
            const base64 = Buffer.from(imageBytes).toString('base64');
            return `data:image/jpeg;base64,${base64}`;
        } catch (error) {
            console.error(`Error calling Image model ${modelName}:`, error);
            throw new Error(`Image generation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generates a high-level concept for a financial product or infrastructure solution using AI.
     * @param prompt The user's input prompt describing the desired financial product.
     * @param modelName The AI model to use for text generation.
     * @returns A Promise resolving to the generated concept and an illustrative image URL.
     * Commercial value: Rapidly prototypes initial concepts, validating strategic direction and accelerating early-stage product development.
     */
    public async generateFinancialProductConcept(prompt: string, modelName: string): Promise<{ concept: FinancialProductConcept, imageUrl: string }> {
        const schema = {
            type: Type.OBJECT, properties: {
                description: { type: Type.STRING },
                keyComponents: { type: Type.ARRAY, items: { type: Type.STRING } },
                marketOpportunity: { type: Type.STRING }
            }
        };
        const fullPrompt = `You are an expert financial architect AI. Based on the user's prompt, generate a high-level description of a innovative financial product or infrastructure, a list of 3-5 key components required for its implementation, and a description of its commercial market opportunity and business impact. Return strictly in JSON format.
            **Prompt:** ${prompt}`;

        const concept = await this.callModel(modelName, fullPrompt, schema) as FinancialProductConcept;
        const imageUrl = await this.callImageModel(`conceptual rendering of ${concept.description}, secure digital finance infrastructure, global network, ultra-detailed`);

        return { concept, imageUrl };
    }

    /**
     * Generates detailed specifications for a market segment or operational jurisdiction.
     * @param financialProductConcept The overarching financial product concept.
     * @param prompt The user's input prompt for the specific market segment.
     * @param modelName The AI model to use.
     * @returns A Promise resolving to the generated market segment and an illustrative image URL.
     * Commercial value: Provides granular insights into market dynamics and regulatory environments, enabling precise market targeting and compliance strategy formulation.
     */
    public async generateMarketSegmentDetails(financialProductConcept: FinancialProductConcept, prompt: string, modelName: string): Promise<{ marketSegment: MarketSegment, imageUrl: string }> {
        const schema = {
            type: Type.OBJECT, properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                regulatoryEnvironment: { type: Type.STRING },
                targetDemographics: { type: Type.STRING },
                keyComplianceRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                associatedProtocols: { type: Type.ARRAY, items: { type: Type.STRING } },
                uniqueMarketDynamics: { type: Type.ARRAY, items: { type: Type.STRING } },
                description: { type: Type.STRING }
            }
        };
        const fullPrompt = `Given the financial product concept: "${financialProductConcept.description}", generate a detailed market segment based on the following prompt: "${prompt}". Include its name, type, regulatory environment, target demographics, 3-5 key compliance requirements, 3-5 associated protocols, 3-5 unique market dynamics, and a detailed description. Return strictly in JSON format.`;
        const marketSegmentData = await this.callModel(modelName, fullPrompt, schema) as Omit<MarketSegment, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl'>;
        const imageUrl = await this.callImageModel(`infographic visualization of ${marketSegmentData.name} market segment within a ${financialProductConcept.description} context, data overlay`);

        return {
            marketSegment: {
                id: generateMockId(),
                createdAt: now(),
                updatedAt: now(),
                ...marketSegmentData
            }, imageUrl
        };
    }

    /**
     * Generates detailed specifications for a specific infrastructure component.
     * @param financialProductConcept The overarching financial product concept.
     * @param marketSegment An optional specific market segment to contextualize the component.
     * @param componentType The type of infrastructure component to generate.
     * @param prompt The user's input prompt for the component.
     * @param modelName The AI model to use.
     * @returns A Promise resolving to the generated component and an illustrative image URL.
     * Commercial value: Accelerates the design of individual system modules, ensuring alignment with overall architecture and functional requirements.
     */
    public async generateInfrastructureComponentDetail(financialProductConcept: FinancialProductConcept, marketSegment: MarketSegment | null, componentType: InfrastructureComponentType, prompt: string, modelName: string): Promise<{ component: AnyInfrastructureComponent, imageUrl: string }> {
        let fullPrompt = `Given the financial product concept: "${financialProductConcept.description}", and potentially a specific market segment: ${marketSegment ? `"${marketSegment.description}"` : 'across the entire platform'}, generate a detailed "${componentType}" component based on the following prompt: "${prompt}".`;
        let schema: any;

        switch (componentType) {
            case 'Programmable Asset':
                schema = {
                    type: Type.OBJECT, properties: {
                        name: { type: Type.STRING }, description: { type: Type.STRING }, criticality: { type: Type.STRING }, tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        assetClass: { type: Type.STRING }, issuanceMechanism: { type: Type.STRING }, transferRestrictions: { type: Type.ARRAY, items: { type: Type.STRING } }, settlementLayer: { type: Type.STRING }
                    }
                };
                fullPrompt += ` Provide name, description, criticality, tags, asset class, issuance mechanism, transfer restrictions, and settlement layer.`;
                break;
            case 'Automated Agent':
                schema = {
                    type: Type.OBJECT, properties: {
                        name: { type: Type.STRING }, description: { type: Type.STRING }, criticality: { type: Type.STRING }, tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        agentRole: { type: Type.STRING }, operationalScope: { type: Type.STRING }, decisionLogic: { type: Type.ARRAY, items: { type: Type.STRING } }, communicationProtocols: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                };
                fullPrompt += ` Provide name, description, criticality, tags, agent role, operational scope, decision logic, and communication protocols.`;
                break;
            case 'Data Feed':
                schema = {
                    type: Type.OBJECT, properties: {
                        name: { type: Type.STRING }, description: { type: Type.STRING }, criticality: { type: Type.STRING }, tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        dataType: { type: Type.STRING }, sourceProvider: { type: Type.STRING }, updateFrequency: { type: Type.STRING }, validationMechanisms: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                };
                fullPrompt += ` Provide name, description, criticality, tags, data type, source provider, update frequency, and validation mechanisms.`;
                break;
            case 'Network Node':
                schema = {
                    type: Type.OBJECT, properties: {
                        name: { type: Type.STRING }, description: { type: Type.STRING }, criticality: { type: Type.STRING }, tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        nodeFunction: { type: Type.STRING }, networkType: { type: Type.STRING }, hostingEnvironment: { type: Type.STRING }, securityProtocols: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                };
                fullPrompt += ` Provide name, description, criticality, tags, node function, network type, hosting environment, and security protocols.`;
                break;
            case 'Digital Identity Role':
                schema = {
                    type: Type.OBJECT, properties: {
                        name: { type: Type.STRING }, description: { type: Type.STRING }, criticality: { type: Type.STRING }, tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        roleCategory: { type: Type.STRING }, authenticationMethod: { type: Type.ARRAY, items: { type: Type.STRING } }, authorizationPolicies: { type: Type.ARRAY, items: { type: Type.STRING } }, dataPrivacyStandards: { type: Type.STRING }, verificationLevel: { type: Type.STRING }
                    }
                };
                fullPrompt += ` Provide name, description, criticality, tags, role category, authentication methods, authorization policies, data privacy standards, and verification level.`;
                break;
            case 'Value Transfer Mechanism':
                schema = {
                    type: Type.OBJECT, properties: {
                        name: { type: Type.STRING }, description: { type: Type.STRING }, criticality: { type: Type.STRING }, tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        propulsionMechanism: { type: Type.STRING }, interoperabilityScope: { type: Type.STRING }, transactionCapacity: { type: Type.STRING }, resilienceMeasures: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                };
                fullPrompt += ` Provide name, description, criticality, tags, propulsion mechanism, interoperability scope, transaction capacity, and resilience measures.`;
                break;
            case 'Protocol Integration':
                schema = {
                    type: Type.OBJECT, properties: {
                        name: { type: Type.STRING }, description: { type: Type.STRING }, criticality: { type: Type.STRING }, tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        protocolStandard: { type: Type.STRING }, applicationLayer: { type: Type.STRING }, complexityRating: { type: Type.STRING }, securityConsiderations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                };
                fullPrompt += ` Provide name, description, criticality, tags, protocol standard, application layer, complexity rating, and security considerations.`;
                break;
            case 'Cryptographic Security Module':
                schema = {
                    type: Type.OBJECT, properties: {
                        name: { type: Type.STRING }, description: { type: Type.STRING }, criticality: { type: Type.STRING }, tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        attestationMechanism: { type: Type.STRING }, functionality: { type: Type.ARRAY, items: { type: Type.STRING } }, securityAssuranceLevel: { type: Type.STRING }, threatMitigation: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                };
                fullPrompt += ` Provide name, description, criticality, tags, attestation mechanism, functionality, security assurance level, and threat mitigation.`;
                break;
            default:
                throw new Error(`Unsupported component type: ${componentType}`);
        }

        fullPrompt += ` Return strictly in JSON format.`;
        const componentData = await this.callModel(modelName, fullPrompt, schema) as Omit<AnyInfrastructureComponent, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl' | 'type'>;
        const imageUrl = await this.callImageModel(`detailed conceptual diagram of a ${componentData.name} (${componentType}) within a ${financialProductConcept.description} infrastructure, professional technical drawing`);

        return {
            component: {
                id: generateMockId(),
                createdAt: now(),
                updatedAt: now(),
                type: componentType,
                ...componentData
            } as AnyInfrastructureComponent, imageUrl
        };
    }

    /**
     * Generates a regulatory compliance document or audit trail narrative using AI.
     * @param financialProductConcept The overarching financial product concept.
     * @param prompt The user's input prompt for the document.
     * @param modelName The AI model to use.
     * @returns A Promise resolving to the generated document and an optional illustrative image URL.
     * Commercial value: Streamlines the creation of essential compliance documentation and audit narratives, enhancing regulatory readiness and transparency.
     */
    public async generateRegulatoryComplianceDocument(financialProductConcept: FinancialProductConcept, prompt: string, modelName: string): Promise<{ document: RegulatoryComplianceDocument, imageUrl: string | undefined }> {
        const schema = {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING },
                content: { type: Type.STRING },
                relatedEntities: { type: Type.ARRAY, items: { type: Type.STRING } },
                importance: { type: Type.STRING }
            }
        };
        const fullPrompt = `Given the financial product concept: "${financialProductConcept.description}", generate a detailed regulatory compliance document or audit narrative based on the following prompt: "${prompt}". Include title, type (e.g., Regulatory Filing, Audit Report), detailed content, 2-3 related entities (names, not IDs), and importance. Return strictly in JSON format.`;
        const documentData = await this.callModel(modelName, fullPrompt, schema) as Omit<RegulatoryComplianceDocument, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl'>;
        let imageUrl: string | undefined;
        try {
            imageUrl = await this.callImageModel(`conceptual diagram illustrating "${documentData.title}" from a "${financialProductConcept.description}" setting, compliance report visualization`);
        } catch (error) {
            console.warn(`Failed to generate image for document "${documentData.title}":`, error);
        }

        return {
            document: {
                id: generateMockId(),
                createdAt: now(),
                updatedAt: now(),
                ...documentData
            }, imageUrl
        };
    }

    /**
     * Generates a smart contract policy engine definition using AI.
     * @param financialProductConcept The overarching financial product concept.
     * @param prompt The user's input prompt for the policy engine.
     * @param modelName The AI model to use.
     * @returns A Promise resolving to the generated policy engine.
     * Commercial value: Accelerates the design of deterministic, auditable programmable logic for automated financial operations, reducing legal and operational overhead.
     */
    public async generateSmartContractPolicyEngine(financialProductConcept: FinancialProductConcept, prompt: string, modelName: string): Promise<SmartContractPolicyEngine> {
        const schema = {
            type: Type.OBJECT, properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                executionEnvironment: { type: Type.STRING },
                policyRules: { type: Type.ARRAY, items: { type: Type.STRING } },
                exampleScenarios: { type: Type.ARRAY, items: { type: Type.STRING } },
                limitations: { type: Type.ARRAY, items: { type: Type.STRING } },
                integrationWithPlatform: { type: Type.STRING }
            }
        };
        const fullPrompt = `Given the financial product concept: "${financialProductConcept.description}", generate a detailed smart contract policy engine based on the following prompt: "${prompt}". Include its name, description, execution environment, 3-5 key policy rules, 3-5 example scenarios, 2-3 limitations, and how it integrates with the financial platform's settlement or agent layers. Return strictly in JSON format.`;
        const policyEngineData = await this.callModel(modelName, fullPrompt, schema) as Omit<SmartContractPolicyEngine, 'id' | 'createdAt' | 'updatedAt'>;

        return {
            id: generateMockId(),
            createdAt: now(),
            updatedAt: now(),
            ...policyEngineData
        };
    }

    /**
     * Generates an interoperability framework definition using AI.
     * @param financialProductConcept The overarching financial product concept.
     * @param prompt The user's input prompt for the framework.
     * @param modelName The AI model to use.
     * @returns A Promise resolving to the generated interoperability framework.
     * Commercial value: Facilitates the design of seamless data and value exchange mechanisms between disparate financial systems, improving system cohesion and reducing integration costs.
     */
    public async generateInteroperabilityFramework(financialProductConcept: FinancialProductConcept, prompt: string, modelName: string): Promise<InteroperabilityFramework> {
        const schema = {
            type: Type.OBJECT, properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                keyStandards: { type: Type.ARRAY, items: { type: Type.STRING } },
                dataExchangeFormats: { type: Type.ARRAY, items: { type: Type.STRING } },
                securityMechanisms: { type: Type.ARRAY, items: { type: Type.STRING } },
                impactOnLatency: { type: Type.STRING },
            }
        };
        const fullPrompt = `Given the financial product concept: "${financialProductConcept.description}", generate a detailed interoperability framework based on the following prompt: "${prompt}". Include its name, description, 3-5 key standards, 2-3 data exchange formats, 3-5 security mechanisms, and its expected impact on transaction latency. Return strictly in JSON format.`;
        const interopFrameworkData = await this.callModel(modelName, fullPrompt, schema) as Omit<InteroperabilityFramework, 'id' | 'createdAt' | 'updatedAt'>;

        return {
            id: generateMockId(),
            createdAt: now(),
            updatedAt: now(),
            ...interopFrameworkData
        };
    }

    /**
     * Generates an operational scenario or incident response plan using AI.
     * @param financialProductConcept The overarching financial product concept.
     * @param prompt The user's input prompt for the scenario.
     * @param modelName The AI model to use.
     * @returns A Promise resolving to the generated operational scenario.
     * Commercial value: Proactively identifies and mitigates risks, enhances system resilience, and supports comprehensive business continuity planning.
     */
    public async generateOperationalScenario(financialProductConcept: FinancialProductConcept, prompt: string, modelName: string): Promise<OperationalScenario> {
        const schema = {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                type: { type: Type.STRING },
                initiator: { type: Type.STRING },
                goal: { type: Type.STRING },
                expectedOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
                potentialChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
                relatedDocumentIds: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        };
        const fullPrompt = `Given the financial product concept: "${financialProductConcept.description}", generate a compelling operational scenario (e.g., risk mitigation, market stress test) based on the following prompt: "${prompt}". Include title, summary, type, initiator, goal, 2-3 expected outcomes, 2-3 potential challenges, and 1-2 related document references (IDs if available, otherwise just descriptions). Return strictly in JSON format.`;
        const scenarioData = await this.callModel(modelName, fullPrompt, schema) as Omit<OperationalScenario, 'id' | 'createdAt' | 'updatedAt'>;

        return {
            id: generateMockId(),
            createdAt: now(),
            updatedAt: now(),
            ...scenarioData
        };
    }
}

const aiService = new Aiservice(process.env.NEXT_PUBLIC_API_KEY as string);

/**
 * A reusable input component for forms, styled for the financial blueprint designer.
 * Commercial value: Provides a consistent, professional UI element, enhancing user experience and reducing development time.
 */
export const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-gray-300 text-sm font-bold mb-2">{label}</label>
        <input className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:ring-cyan-500 focus:border-cyan-500" {...props} />
    </div>
);

/**
 * A reusable textarea component for forms, styled for the financial blueprint designer.
 * Commercial value: Facilitates rich text input for detailed descriptions and policies, supporting comprehensive design documentation.
 */
export const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-gray-300 text-sm font-bold mb-2">{label}</label>
        <textarea className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:ring-cyan-500 focus:border-cyan-500" rows={props.rows || 3} {...props} />
    </div>
);

/**
 * A reusable select dropdown component for forms, styled for the financial blueprint designer.
 * Commercial value: Offers controlled input choices, ensuring data consistency and simplifying user interaction for critical selections.
 */
export const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: { value: string; label: string }[] }> = ({ label, options, ...props }) => (
    <div>
        <label className="block text-gray-300 text-sm font-bold mb-2">{label}</label>
        <select className="shadow border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:ring-cyan-500 focus:border-cyan-500" {...props}>
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

/**
 * A base button component with shared styling for the financial blueprint designer.
 * Commercial value: Ensures consistent UI across the platform, improving user navigation and brand recognition.
 */
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...props }) => (
    <button className={`py-2 px-4 rounded transition-all duration-200 disabled:opacity-50 ${className}`} {...props}>
        {children}
    </button>
);

/**
 * A primary action button, visually emphasizing critical user actions.
 * Commercial value: Guides users towards high-impact actions, streamlining workflows and accelerating task completion.
 */
export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" {...props} />
);

/**
 * A secondary action button, for less critical or alternative actions.
 * Commercial value: Provides clear visual hierarchy, preventing accidental clicks on destructive or non-primary actions.
 */
export const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <Button className="bg-gray-600 hover:bg-gray-500 text-white" {...props} />
);

/**
 * A button for destructive or irreversible actions, clearly indicating caution.
 * Commercial value: Minimizes human error in critical operations, protecting data integrity and system stability.
 */
export const DangerButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <Button className="bg-red-600 hover:bg-red-700 text-white" {...props} />
);

/**
 * A tab navigation button, indicating the currently active view.
 * Commercial value: Enables intuitive navigation between complex design sections, improving user productivity and reducing learning curves.
 */
export const TabButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }> = ({ active, children, ...props }) => (
    <Button
        className={`px-4 py-2 text-sm font-medium ${active ? 'bg-cyan-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} rounded-t-md`}
        {...props}
    >
        {children}
    </Button>
);

/**
 * A modal component for displaying dialogs or detailed editors.
 * Commercial value: Provides focused interaction contexts for editing sensitive configurations or reviewing detailed data, improving user accuracy.
 */
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="modal-body text-gray-300">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * An accordion component for collapsible content sections.
 * Commercial value: Organizes complex information into manageable sections, reducing cognitive overload and improving content discoverability.
 */
export const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-700 rounded-md mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full p-4 text-left text-white bg-gray-700 hover:bg-gray-600 rounded-md"
            >
                <span className="font-semibold text-lg">{title}</span>
                <span>{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-700 bg-gray-800 text-gray-300">
                    {children}
                </div>
            )}
        </div>
    );
};

/**
 * A modal for creating new financial blueprint projects.
 * Commercial value: Streamlines the project initiation process, enabling rapid prototyping of new financial solutions.
 */
export const CreateProjectModal: React.FC<{ isOpen: boolean; onClose: () => void; onCreate: (name: string, description: string) => void }> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if (name.trim()) {
            onCreate(name, description);
            setName('');
            setDescription('');
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Financial Blueprint Project">
            <div className="space-y-4">
                <FormInput label="Project Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., 'Real-time Global Payments Infrastructure'" />
                <FormTextarea label="Project Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief overview of your financial solution blueprint..." />
                <div className="flex justify-end space-x-2 mt-4">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={handleSubmit} disabled={!name.trim()}>Create Blueprint</PrimaryButton>
                </div>
            </div>
        </Modal>
    );
};

/**
 * Displays a summary card for a financial blueprint project, with actions for editing, deleting, and duplicating.
 * Commercial value: Provides an at-a-glance overview of strategic initiatives, simplifying project management and decision-making.
 */
export const ProjectCard: React.FC<{ project: FinancialBlueprintProject; onEdit: (id: string) => void; onDelete: (id: string) => void; onDuplicate: (id: string) => void }> = ({ project, onEdit, onDelete, onDuplicate }) => (
    <Card title={project.name} className="relative group hover:shadow-cyan-500/30 transition-shadow duration-300">
        <p className="text-sm text-gray-400 mb-2 truncate">{project.description || 'No description provided.'}</p>
        <p className="text-xs text-gray-500">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
        <p className="text-xs text-gray-500">Last Updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PrimaryButton onClick={() => onEdit(project.id)} className="!py-1 !px-2 text-xs">Edit</PrimaryButton>
            <SecondaryButton onClick={() => onDuplicate(project.id)} className="!py-1 !px-2 text-xs">Duplicate</SecondaryButton>
            <DangerButton onClick={() => onDelete(project.id)} className="!py-1 !px-2 text-xs">Delete</DangerButton>
        </div>
    </Card>
);

/**
 * The main dashboard view, displaying a list of all financial blueprint projects.
 * Commercial value: Serves as the central command center for managing all financial innovation initiatives, providing clear visibility and control.
 */
export const DashboardView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleCreateProject = useCallback((name: string, description: string) => {
        const newProject: FinancialBlueprintProject = {
            id: generateMockId(),
            name,
            description,
            creatorId: "financial-architect-alpha",
            createdAt: now(),
            updatedAt: now(),
            concept: { description: "An uninitialized financial product concept.", keyComponents: [], marketOpportunity: "" },
            marketSegments: [],
            components: [],
            documents: [],
            policyEngines: [],
            interopFrameworks: [],
            operationalScenarios: [],
            projectSettings: { ...defaultProjectSettings },
            generationHistory: [],
        };
        dispatch({ type: 'ADD_PROJECT', payload: newProject });
        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: newProject.id });
        dispatch({ type: 'SET_VIEW', payload: 'Project Editor' });
    }, [dispatch]);

    const handleEditProject = useCallback((projectId: string) => {
        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: projectId });
        dispatch({ type: 'SET_VIEW', payload: 'Project Editor' });
    }, [dispatch]);

    const handleDeleteProject = useCallback((projectId: string) => {
        if (window.confirm("Are you sure you want to delete this project blueprint? This action cannot be undone.")) {
            dispatch({ type: 'DELETE_PROJECT', payload: projectId });
        }
    }, [dispatch]);

    const handleDuplicateProject = useCallback((projectId: string) => {
        const projectToDuplicate = state.financialBlueprintProjects.find(p => p.id === projectId);
        if (projectToDuplicate) {
            const duplicatedProject: FinancialBlueprintProject = {
                ...projectToDuplicate,
                id: generateMockId(),
                name: `${projectToDuplicate.name} (Copy)`,
                createdAt: now(),
                updatedAt: now(),
                generationHistory: [],
            };
            dispatch({ type: 'ADD_PROJECT', payload: duplicatedProject });
            dispatch({ type: 'SET_ACTIVE_PROJECT', payload: duplicatedProject.id });
            dispatch({ type: 'SET_VIEW', payload: 'Project Editor' });
        }
    }, [state.financialBlueprintProjects, dispatch]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Financial Blueprint Projects</h2>
            <PrimaryButton onClick={() => setIsCreateModalOpen(true)} className="w-full">Design New Financial Solution Blueprint</PrimaryButton>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.financialBlueprintProjects.length === 0 ? (
                    <p className="text-gray-400 col-span-full text-center">No projects found. Start by designing a new one!</p>
                ) : (
                    state.financialBlueprintProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onEdit={handleEditProject}
                            onDelete={handleDeleteProject}
                            onDuplicate={handleDuplicateProject}
                        />
                    ))
                )}
            </div>
            <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateProject} />
        </div>
    );
};

/**
 * Displays a panel showing the queue and history of AI generation tasks for the active project.
 * Commercial value: Provides real-time visibility into AI-driven design progress, enabling project managers to track task completion and resource utilization.
 */
export const GenerationQueuePanel: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const activeProject = state.financialBlueprintProjects.find(p => p.id === state.activeProjectId);

    if (!activeProject) return <p className="text-gray-400">No active project blueprint selected.</p>;

    const projectTasks = state.generationQueue.filter(task => task.projectId === activeProject.id);

    return (
        <Card title="AI Generation Queue & History">
            {projectTasks.length === 0 ? (
                <p className="text-gray-400">No active or historical AI generation tasks for this blueprint.</p>
            ) : (
                <div className="space-y-4">
                    {projectTasks.map(task => (
                        <div key={task.id} className="p-3 bg-gray-700 rounded-md border border-gray-600">
                            <div className="flex justify-between items-center">
                                <h5 className="font-semibold text-cyan-300">{task.type} - {task.targetId ? `ID: ${task.targetId.substring(0, 8)}...` : 'New Item'}</h5>
                                <span className={`text-sm px-2 py-1 rounded-full ${
                                    task.status === 'InProgress' ? 'bg-blue-600' :
                                    task.status === 'Completed' ? 'bg-green-600' :
                                    task.status === 'Failed' ? 'bg-red-600' : 'bg-gray-500'
                                    }`}>
                                    {task.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Prompt: {task.prompt.substring(0, 100)}...</p>
                            {task.error && <p className="text-red-400 text-xs mt-1">Error: {task.error}</p>}
                            {task.visualizationUrl && (
                                <img src={task.visualizationUrl} alt="Generated visualization" className="mt-2 rounded-lg max-h-48 object-cover" />
                            )}
                            {task.status === 'Completed' && (
                                <SecondaryButton onClick={() => dispatch({ type: 'REMOVE_GENERATION_TASK', payload: task.id })} className="mt-2 !py-1 !px-2 text-xs">Clear from Queue</SecondaryButton>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};


/**
 * Provides an overview of the active financial blueprint project, including concept generation and project settings.
 * Commercial value: Centralizes high-level project information, allowing architects to define and refine the core vision and underlying operational parameters.
 */
export const ProjectOverviewPanel: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const activeProject = state.financialBlueprintProjects.find(p => p.id === state.activeProjectId);

    const [prompt, setPrompt] = useState(activeProject?.concept.description || initialFinancialPrompt);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeProject) {
            setPrompt(activeProject.concept.description || initialFinancialPrompt);
        }
    }, [activeProject]);

    const handleGenerate = async () => {
        if (!activeProject) return;

        setIsLoading(true);
        const taskId = generateMockId();
        dispatch({
            type: 'ADD_GENERATION_TASK',
            payload: {
                id: taskId,
                projectId: activeProject.id,
                type: 'FinancialProductConcept',
                status: 'InProgress',
                prompt: prompt,
                generatedContent: null,
                startTime: now(),
            }
        });

        try {
            const { concept, imageUrl } = await aiService.generateFinancialProductConcept(prompt, activeProject.projectSettings.aiModelPreference);

            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    concept: { ...concept, imageUrl },
                    generationHistory: [...activeProject.generationHistory, {
                        id: generateMockId(),
                        projectId: activeProject.id,
                        type: 'FinancialProductConcept',
                        status: 'Completed',
                        prompt: prompt,
                        generatedContent: { concept, imageUrl },
                        startTime: now(),
                        endTime: now(),
                        visualizationUrl: imageUrl,
                    }]
                }
            });
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Completed', generatedContent: { concept, imageUrl }, endTime: now(), visualizationUrl: imageUrl } });

        } catch (error) {
            console.error("Failed to generate financial product concept:", error);
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() } });
        } finally {
            setIsLoading(false);
        }
    };

    if (!activeProject) {
        return <p className="text-gray-400">Please select a project blueprint from the dashboard.</p>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Blueprint: {activeProject.name} - Overview</h2>
            <Card title="Financial Product Concept Prompt">
                <FormTextarea
                    label="Describe your desired financial product or infrastructure"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={5}
                    placeholder="e.g., 'a secure, real-time cross-border payment network leveraging tokenized assets'"
                />
                <PrimaryButton onClick={handleGenerate} disabled={isLoading} className="w-full mt-4">
                    {isLoading ? 'Generating Concept...' : 'Generate Financial Product Concept'}
                </PrimaryButton>
            </Card>

            {(activeProject.concept.description || isLoading) && (
                <Card title="Generated Financial Product Concept">
                    {isLoading ? <p>Building...</p> : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {activeProject.concept.imageUrl && (
                                <img src={activeProject.concept.imageUrl} alt="Generated financial product concept" className="rounded-lg aspect-video object-cover w-full h-auto max-h-[300px]"/>
                            )}
                            <div className="space-y-4">
                                <div><h4 className="font-semibold text-cyan-300">Description</h4><p className="text-sm text-gray-300">{activeProject.concept.description}</p></div>
                                <div><h4 className="font-semibold text-cyan-300">Key Components</h4><ul className="list-disc list-inside text-sm text-gray-300">{activeProject.concept.keyComponents.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></div>
                                <div><h4 className="font-semibold text-cyan-300">Market Opportunity</h4><p className="text-sm text-gray-300">{activeProject.concept.marketOpportunity}</p></div>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            <Accordion title="Project Settings">
                <ProjectSettingsEditor project={activeProject} />
            </Accordion>
        </div>
    );
};

/**
 * An editor component for managing project-specific settings such as AI model preferences and default prompts.
 * Commercial value: Provides granular control over AI behavior, allowing fine-tuning for specific financial contexts and regulatory compliance.
 */
export const ProjectSettingsEditor: React.FC<{ project: FinancialBlueprintProject }> = ({ project }) => {
    const { dispatch } = useAppContext();
    const [settings, setSettings] = useState(project.projectSettings);

    useEffect(() => {
        setSettings(project.projectSettings);
    }, [project.projectSettings]);

    const handleSettingChange = useCallback((key: keyof ProjectSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleSaveSettings = useCallback(() => {
        dispatch({ type: 'UPDATE_PROJECT', payload: { ...project, projectSettings: settings } });
        alert('Project settings saved!');
    }, [dispatch, project, settings]);

    return (
        <div className="space-y-4">
            <FormSelect
                label="Preferred AI Model (Text Generation)"
                value={settings.aiModelPreference}
                onChange={e => handleSettingChange('aiModelPreference', e.target.value)}
                options={[
                    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast)' },
                    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Powerful)' },
                ]}
            />
            <FormSelect
                label="Preferred AI Model (Image Generation)"
                value={settings.imageModelPreference}
                onChange={e => handleSettingChange('imageModelPreference', e.target.value)}
                options={[
                    { value: 'imagen-4.0-generate-001', label: 'Imagen 4.0' },
                ]}
            />
            <FormInput
                label="Default Tone for AI Generations"
                value={settings.defaultTone}
                onChange={e => handleSettingChange('defaultTone', e.target.value)}
                placeholder="e.g., 'Regulatory & Secure', 'Disruptive', 'Conservative'"
            />
            <FormTextarea
                label="Default AI Prompt Prefix"
                value={settings.defaultPromptPrefix}
                onChange={e => handleSettingChange('defaultPromptPrefix', e.target.value)}
                placeholder="e.g., 'For a commercial-grade financial infrastructure platform, focusing on security and compliance, '"
                rows={2}
            />
            <FormTextarea
                label="Default Negative Prompt (Image Generation)"
                value={settings.defaultNegativePrompt}
                onChange={e => handleSettingChange('defaultNegativePrompt', e.target.value)}
                placeholder="e.g., 'cartoonish, informal, speculative, insecure, unregulated'"
                rows={2}
            />
            <FormInput
                label="Auto-Save Interval (seconds)"
                type="number"
                value={settings.autoSaveInterval}
                onChange={e => handleSettingChange('autoSaveInterval', parseInt(e.target.value) || 0)}
            />
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={settings.collaborationEnabled}
                    onChange={e => handleSettingChange('collaborationEnabled', e.target.checked)}
                    className="mr-2 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
                />
                <label className="text-gray-300">Enable Collaboration (Conceptual)</label>
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={settings.dataIntegrityChecksEnabled}
                    onChange={e => handleSettingChange('dataIntegrityChecksEnabled', e.target.checked)}
                    className="mr-2 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
                />
                <label className="text-gray-300">Enable Data Integrity Checks (Conceptual)</label>
            </div>
            <PrimaryButton onClick={handleSaveSettings}>Save Settings</PrimaryButton>
        </div>
    );
};

/**
 * Manages the generation and editing of market segments and jurisdictional zones.
 * Commercial value: Enables targeted financial product development and ensures compliance with diverse global regulatory landscapes.
 */
export const MarketSegmentsPanel: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const activeProject = state.financialBlueprintProjects.find(p => p.id === state.activeProjectId);

    const [newSegmentPrompt, setNewSegmentPrompt] = useState('');
    const [isGeneratingSegment, setIsGeneratingSegment] = useState(false);
    const [selectedSegment, setSelectedSegment] = useState<MarketSegment | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleGenerateSegment = async () => {
        if (!activeProject || !activeProject.concept.description) {
            alert("Please generate a financial product concept first in the 'Overview' tab.");
            return;
        }
        if (!newSegmentPrompt.trim()) {
            alert("Please enter a prompt for the new market segment.");
            return;
        }

        setIsGeneratingSegment(true);
        const taskId = generateMockId();
        dispatch({
            type: 'ADD_GENERATION_TASK',
            payload: {
                id: taskId,
                projectId: activeProject.id,
                type: 'MarketSegmentDetail',
                status: 'InProgress',
                prompt: newSegmentPrompt,
                generatedContent: null,
                startTime: now(),
            }
        });

        try {
            const { marketSegment, imageUrl } = await aiService.generateMarketSegmentDetails(
                activeProject.concept,
                activeProject.projectSettings.defaultPromptPrefix + newSegmentPrompt,
                activeProject.projectSettings.aiModelPreference
            );
            marketSegment.imageUrl = imageUrl;

            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    marketSegments: [...activeProject.marketSegments, marketSegment],
                    generationHistory: [...activeProject.generationHistory, {
                        id: generateMockId(),
                        projectId: activeProject.id,
                        type: 'MarketSegmentDetail',
                        status: 'Completed',
                        prompt: newSegmentPrompt,
                        generatedContent: marketSegment,
                        startTime: now(),
                        endTime: now(),
                        targetId: marketSegment.id,
                        visualizationUrl: imageUrl,
                    }]
                }
            });
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Completed', generatedContent: marketSegment, endTime: now(), targetId: marketSegment.id, visualizationUrl: imageUrl } });
            setNewSegmentPrompt('');
        } catch (error) {
            console.error("Failed to generate market segment:", error);
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() } });
        } finally {
            setIsGeneratingSegment(false);
        }
    };

    const handleUpdateSegment = useCallback((updatedSegment: MarketSegment) => {
        if (!activeProject) return;
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: {
                ...activeProject,
                marketSegments: activeProject.marketSegments.map(b => b.id === updatedSegment.id ? { ...updatedSegment, updatedAt: now() } : b)
            }
        });
    }, [activeProject, dispatch]);

    const handleDeleteSegment = useCallback((segmentId: string) => {
        if (!activeProject) return;
        if (window.confirm("Are you sure you want to delete this market segment?")) {
            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    marketSegments: activeProject.marketSegments.filter(b => b.id !== segmentId)
                }
            });
        }
    }, [activeProject, dispatch]);

    if (!activeProject) return <p className="text-gray-400">No active project blueprint selected.</p>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Market Segments & Jurisdictions</h2>

            <Card title="Generate New Market Segment">
                <FormTextarea
                    label="Describe the market segment or jurisdiction you want to define"
                    value={newSegmentPrompt}
                    onChange={e => setNewSegmentPrompt(e.target.value)}
                    rows={4}
                    placeholder="e.g., 'The retail payment sector in Europe, with strong GDPR and PSD2 compliance requirements.'"
                />
                <PrimaryButton onClick={handleGenerateSegment} disabled={isGeneratingSegment} className="w-full mt-4">
                    {isGeneratingSegment ? 'Generating Market Segment...' : 'Generate New Market Segment'}
                </PrimaryButton>
            </Card>

            <Card title="Existing Market Segments">
                {activeProject.marketSegments.length === 0 ? (
                    <p className="text-gray-400">No market segments defined yet. Start by generating one!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeProject.marketSegments.map(segment => (
                            <div key={segment.id} className="bg-gray-700 rounded-lg overflow-hidden shadow-lg border border-gray-600 relative group">
                                {segment.imageUrl && <img src={segment.imageUrl} alt={segment.name} className="w-full h-32 object-cover" />}
                                <div className="p-4">
                                    <h4 className="font-semibold text-cyan-300 text-lg mb-1">{segment.name}</h4>
                                    <p className="text-sm text-gray-400 truncate">{segment.description}</p>
                                    <div className="flex space-x-2 mt-4">
                                        <SecondaryButton onClick={() => { setSelectedSegment(segment); setIsEditModalOpen(true); }} className="!py-1 !px-2 text-xs">View/Edit</SecondaryButton>
                                        <DangerButton onClick={() => handleDeleteSegment(segment.id)} className="!py-1 !px-2 text-xs">Delete</DangerButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {selectedSegment && (
                <MarketSegmentEditorModal
                    isOpen={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setSelectedSegment(null); }}
                    marketSegment={selectedSegment}
                    onSave={handleUpdateSegment}
                    financialProductConcept={activeProject.concept}
                    aiModelPreference={activeProject.projectSettings.aiModelPreference}
                    onAddTask={(task) => dispatch({ type: 'ADD_GENERATION_TASK', payload: task })}
                    onUpdateTask={(task) => dispatch({ type: 'UPDATE_GENERATION_TASK', payload: task })}
                />
            )}
        </div>
    );
};

/**
 * A modal for editing detailed specifications of a market segment, including AI-powered refinement.
 * Commercial value: Enables precise adjustments to market segment definitions, ensuring optimal alignment with business strategy and regulatory requirements.
 */
export const MarketSegmentEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    marketSegment: MarketSegment;
    onSave: (marketSegment: MarketSegment) => void;
    financialProductConcept: FinancialProductConcept;
    aiModelPreference: string;
    onAddTask: (task: GenerationTask) => void;
    onUpdateTask: (task: GenerationTask) => void;
}> = ({ isOpen, onClose, marketSegment, onSave, financialProductConcept, aiModelPreference, onAddTask, onUpdateTask }) => {
    const [editedSegment, setEditedSegment] = useState(marketSegment);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    useEffect(() => {
        setEditedSegment(marketSegment);
    }, [marketSegment]);

    const handleRefine = async () => {
        if (!refinePrompt.trim()) {
            alert("Please enter a refinement prompt.");
            return;
        }

        setIsRefining(true);
        const taskId = generateMockId();
        onAddTask({
            id: taskId,
            projectId: marketSegment.id,
            type: 'Refinement',
            status: 'InProgress',
            prompt: `Refine market segment "${marketSegment.name}": ${refinePrompt}`,
            generatedContent: null,
            startTime: now(),
            targetId: marketSegment.id,
        });

        try {
            const schema = {
                type: Type.OBJECT, properties: {
                    description: { type: Type.STRING },
                    keyComplianceRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                    associatedProtocols: { type: Type.ARRAY, items: { type: Type.STRING } },
                    uniqueMarketDynamics: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            };
            const fullPrompt = `Given the existing market segment details: Name: ${editedSegment.name}, Type: ${editedSegment.type}, Regulatory Environment: ${editedSegment.regulatoryEnvironment}, Target Demographics: ${editedSegment.targetDemographics}, Description: ${editedSegment.description}.
                                Refine its description, key compliance requirements, associated protocols, and unique market dynamics based on the prompt: "${refinePrompt}".
                                Ensure it still fits within the financial product concept: "${financialProductConcept.description}". Return strictly in JSON.`;

            const refinedData = await aiService['callModel'](aiModelPreference, fullPrompt, schema) as
                { description: string, keyComplianceRequirements: string[], associatedProtocols: string[], uniqueMarketDynamics: string[] };

            const updated = { ...editedSegment, ...refinedData, updatedAt: now() };
            onSave(updated);
            setEditedSegment(updated);
            setRefinePrompt('');

            onUpdateTask({ id: taskId, status: 'Completed', generatedContent: refinedData, endTime: now() });
        } catch (error) {
            console.error("Failed to refine market segment:", error);
            onUpdateTask({ id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() });
        } finally {
            setIsRefining(false);
        }
    };

    const handleSave = () => {
        onSave(editedSegment);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Market Segment: ${marketSegment.name}`}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {editedSegment.imageUrl && <img src={editedSegment.imageUrl} alt={editedSegment.name} className="w-full h-48 object-cover rounded-md mb-4" />}

                <FormInput label="Name" value={editedSegment.name} onChange={e => setEditedSegment(prev => ({ ...prev, name: e.target.value }))} />
                <FormInput label="Type" value={editedSegment.type} onChange={e => setEditedSegment(prev => ({ ...prev, type: e.target.value }))} />
                <FormInput label="Regulatory Environment" value={editedSegment.regulatoryEnvironment} onChange={e => setEditedSegment(prev => ({ ...prev, regulatoryEnvironment: e.target.value }))} />
                <FormInput label="Target Demographics" value={editedSegment.targetDemographics} onChange={e => setEditedSegment(prev => ({ ...prev, targetDemographics: e.target.value }))} />
                <FormTextarea label="Description" value={editedSegment.description} onChange={e => setEditedSegment(prev => ({ ...prev, description: e.target.value }))} rows={5} />

                <Accordion title="Key Compliance Requirements">
                    <FormTextarea label="Requirements (one per line)" value={editedSegment.keyComplianceRequirements.join('\n')} onChange={e => setEditedSegment(prev => ({ ...prev, keyComplianceRequirements: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))} />
                </Accordion>
                <Accordion title="Associated Protocols">
                    <FormTextarea label="Protocols (one per line)" value={editedSegment.associatedProtocols.join('\n')} onChange={e => setEditedSegment(prev => ({ ...prev, associatedProtocols: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))} />
                </Accordion>
                <Accordion title="Unique Market Dynamics">
                    <FormTextarea label="Dynamics (one per line)" value={editedSegment.uniqueMarketDynamics.join('\n')} onChange={e => setEditedSegment(prev => ({ ...prev, uniqueMarketDynamics: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))} />
                </Accordion>

                <h4 className="font-semibold text-cyan-300 mt-6">Refine with AI</h4>
                <FormTextarea
                    label="Refinement Prompt"
                    value={refinePrompt}
                    onChange={e => setRefinePrompt(e.target.value)}
                    rows={3}
                    placeholder="e.g., 'Emphasize the need for real-time fraud detection. Add requirements for cross-border data privacy adherence.'"
                />
                <PrimaryButton onClick={handleRefine} disabled={isRefining} className="w-full mt-4">
                    {isRefining ? 'Refining Market Segment...' : 'Refine Segment with AI'}
                </PrimaryButton>

                <div className="flex justify-end space-x-2 mt-6">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
                </div>
            </div>
        </Modal>
    );
};

/**
 * Manages the generation and editing of various infrastructure components.
 * Commercial value: Provides a granular control panel for defining all building blocks of the financial infrastructure, from programmable assets to digital identity roles, ensuring comprehensive system design.
 */
export const InfrastructureComponentsPanel: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const activeProject = state.financialBlueprintProjects.find(p => p.id === state.activeProjectId);

    const [componentType, setComponentType] = useState<InfrastructureComponentType>('Programmable Asset');
    const [componentPrompt, setComponentPrompt] = useState('');
    const [selectedMarketSegmentId, setSelectedMarketSegmentId] = useState<string | 'none'>('none');
    const [isGeneratingComponent, setIsGeneratingComponent] = useState(false);

    const [selectedComponent, setSelectedComponent] = useState<AnyInfrastructureComponent | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleGenerateComponent = async () => {
        if (!activeProject || !activeProject.concept.description) {
            alert("Please generate a financial product concept first in the 'Overview' tab.");
            return;
        }
        if (!componentPrompt.trim()) {
            alert("Please enter a prompt for the new component.");
            return;
        }

        setIsGeneratingComponent(true);
        const taskId = generateMockId();
        dispatch({
            type: 'ADD_GENERATION_TASK',
            payload: {
                id: taskId,
                projectId: activeProject.id,
                type: 'ComponentDetail',
                status: 'InProgress',
                prompt: componentPrompt,
                generatedContent: null,
                startTime: now(),
            }
        });

        try {
            const marketSegment = selectedMarketSegmentId !== 'none' ? activeProject.marketSegments.find(b => b.id === selectedMarketSegmentId) || null : null;
            const { component, imageUrl } = await aiService.generateInfrastructureComponentDetail(
                activeProject.concept,
                marketSegment,
                componentType,
                activeProject.projectSettings.defaultPromptPrefix + componentPrompt,
                activeProject.projectSettings.aiModelPreference
            );
            component.imageUrl = imageUrl;

            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    components: [...activeProject.components, component],
                    generationHistory: [...activeProject.generationHistory, {
                        id: generateMockId(),
                        projectId: activeProject.id,
                        type: 'ComponentDetail',
                        status: 'Completed',
                        prompt: componentPrompt,
                        generatedContent: component,
                        startTime: now(),
                        endTime: now(),
                        targetId: component.id,
                        visualizationUrl: imageUrl,
                    }]
                }
            });
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Completed', generatedContent: component, endTime: now(), targetId: component.id, visualizationUrl: imageUrl } });
            setComponentPrompt('');
        } catch (error) {
            console.error("Failed to generate component:", error);
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() } });
        } finally {
            setIsGeneratingComponent(false);
        }
    };

    const handleUpdateComponent = useCallback((updatedComponent: AnyInfrastructureComponent) => {
        if (!activeProject) return;
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: {
                ...activeProject,
                components: activeProject.components.map(a => a.id === updatedComponent.id ? { ...updatedComponent, updatedAt: now() } : a)
            }
        });
    }, [activeProject, dispatch]);

    const handleDeleteComponent = useCallback((componentId: string) => {
        if (!activeProject) return;
        if (window.confirm("Are you sure you want to delete this infrastructure component?")) {
            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    components: activeProject.components.filter(a => a.id !== componentId)
                }
            });
        }
    }, [activeProject, dispatch]);

    if (!activeProject) return <p className="text-gray-400">No active project blueprint selected.</p>;

    const componentTypes: { value: InfrastructureComponentType; label: string }[] = [
        { value: 'Programmable Asset', label: 'Programmable Asset' },
        { value: 'Automated Agent', label: 'Automated Agent' },
        { value: 'Data Feed', label: 'Data Feed' },
        { value: 'Network Node', label: 'Network Node' },
        { value: 'Digital Identity Role', label: 'Digital Identity Role' },
        { value: 'Value Transfer Mechanism', label: 'Value Transfer Mechanism' },
        { value: 'Protocol Integration', label: 'Protocol Integration' },
        { value: 'Cryptographic Security Module', label: 'Cryptographic Security Module' },
    ];

    const marketSegmentOptions = useMemo(() => [
        { value: 'none', label: 'Platform-wide' },
        ...activeProject.marketSegments.map(b => ({ value: b.id, label: b.name }))
    ], [activeProject.marketSegments]);

    const componentsGroupedByType = useMemo(() => {
        return activeProject.components.reduce((acc, component) => {
            if (!acc[component.type]) {
                acc[component.type] = [];
            }
            acc[component.type].push(component);
            return acc;
        }, {} as Record<InfrastructureComponentType, AnyInfrastructureComponent[]>);
    }, [activeProject.components]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Infrastructure Components Management</h2>

            <Card title="Generate New Component">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect label="Component Type" value={componentType} onChange={e => setComponentType(e.target.value as InfrastructureComponentType)} options={componentTypes} />
                    <FormSelect label="Associate with Market Segment" value={selectedMarketSegmentId} onChange={e => setSelectedMarketSegmentId(e.target.value)} options={marketSegmentOptions} />
                </div>
                <FormTextarea
                    label="Describe the infrastructure component you want to generate"
                    value={componentPrompt}
                    onChange={e => setComponentPrompt(e.target.value)}
                    rows={4}
                    placeholder="e.g., 'A high-throughput programmable stablecoin for interbank settlements', or 'An AI-powered compliance agent for real-time AML monitoring.'"
                    className="mt-4"
                />
                <PrimaryButton onClick={handleGenerateComponent} disabled={isGeneratingComponent} className="w-full mt-4">
                    {isGeneratingComponent ? 'Generating Component...' : 'Generate New Component'}
                </PrimaryButton>
            </Card>

            <Card title="Existing Components">
                {activeProject.components.length === 0 ? (
                    <p className="text-gray-400">No infrastructure components defined yet. Start by generating one!</p>
                ) : (
                    <div className="space-y-4">
                        {componentTypes.map(typeOption => {
                            const components = componentsGroupedByType[typeOption.value];
                            if (!components || components.length === 0) return null;
                            return (
                                <Accordion key={typeOption.value} title={`${typeOption.label} (${components.length})`} defaultOpen>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {components.map(component => (
                                            <div key={component.id} className="bg-gray-700 rounded-lg overflow-hidden shadow-lg border border-gray-600 relative group">
                                                {component.imageUrl && <img src={component.imageUrl} alt={component.name} className="w-full h-32 object-cover" />}
                                                <div className="p-4">
                                                    <h4 className="font-semibold text-cyan-300 text-lg mb-1">{component.name}</h4>
                                                    <p className="text-sm text-gray-400 truncate">{component.description}</p>
                                                    <div className="flex space-x-2 mt-4">
                                                        <SecondaryButton onClick={() => { setSelectedComponent(component); setIsEditModalOpen(true); }} className="!py-1 !px-2 text-xs">View/Edit</SecondaryButton>
                                                        <DangerButton onClick={() => handleDeleteComponent(component.id)} className="!py-1 !px-2 text-xs">Delete</DangerButton>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Accordion>
                            );
                        })}
                    </div>
                )}
            </Card>

            {selectedComponent && (
                <InfrastructureComponentEditorModal
                    isOpen={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setSelectedComponent(null); }}
                    component={selectedComponent}
                    onSave={handleUpdateComponent}
                    financialProductConcept={activeProject.concept}
                    aiModelPreference={activeProject.projectSettings.aiModelPreference}
                    onAddTask={(task) => dispatch({ type: 'ADD_GENERATION_TASK', payload: task })}
                    onUpdateTask={(task) => dispatch({ type: 'UPDATE_GENERATION_TASK', payload: task })}
                />
            )}
        </div>
    );
};

/**
 * A modal for detailed editing and AI-powered refinement of individual infrastructure components.
 * Commercial value: Provides deep configurability for critical system modules, ensuring optimal performance, security, and compliance.
 */
export const InfrastructureComponentEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    component: AnyInfrastructureComponent;
    onSave: (component: AnyInfrastructureComponent) => void;
    financialProductConcept: FinancialProductConcept;
    aiModelPreference: string;
    onAddTask: (task: GenerationTask) => void;
    onUpdateTask: (task: GenerationTask) => void;
}> = ({ isOpen, onClose, component, onSave, financialProductConcept, aiModelPreference, onAddTask, onUpdateTask }) => {
    const [editedComponent, setEditedComponent] = useState(component);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    useEffect(() => {
        setEditedComponent(component);
    }, [component]);

    const handleFieldChange = (field: string, value: any) => {
        setEditedComponent(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayFieldChange = (field: string, value: string) => {
        setEditedComponent(prev => ({ ...prev, [field]: value.split('\n').map(s => s.trim()).filter(Boolean) }));
    };

    const handleRefine = async () => {
        if (!refinePrompt.trim()) {
            alert("Please enter a refinement prompt.");
            return;
        }

        setIsRefining(true);
        const taskId = generateMockId();
        onAddTask({
            id: taskId,
            projectId: component.id,
            type: 'Refinement',
            status: 'InProgress',
            prompt: `Refine component "${component.name}": ${refinePrompt}`,
            generatedContent: null,
            startTime: now(),
            targetId: component.id,
        });

        try {
            const existingDetails = JSON.stringify(editedComponent);
            const fullPrompt = `Given the existing component details: ${existingDetails}.
                                Refine its description and specific attributes based on the prompt: "${refinePrompt}".
                                The component is of type "${component.type}". Ensure it still fits within the financial product concept: "${financialProductConcept.description}". Return strictly in JSON, only for the relevant fields for ${component.type}.`;

            // This is a simplified approach. A real refinement API would be more robust.
            // For now, let's just update description and related lists based on free-form AI response.
            // A more sophisticated approach would parse 'updatedAttributes' into specific fields.
            const refinedResponse = await aiService['callModel'](aiModelPreference, fullPrompt, { type: Type.OBJECT, properties: { newDescription: { type: Type.STRING }, updatedAttributes: { type: Type.STRING } } }) as { newDescription: string, updatedAttributes: string };

            const updated: AnyInfrastructureComponent = {
                ...editedComponent,
                description: refinedResponse.newDescription || editedComponent.description,
                updatedAt: now(),
            };
            onSave(updated);
            setEditedComponent(updated);
            setRefinePrompt('');

            onUpdateTask({ id: taskId, status: 'Completed', generatedContent: { newDescription: refinedResponse.newDescription }, endTime: now() });
        } catch (error) {
            console.error("Failed to refine component:", error);
            onUpdateTask({ id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() });
        } finally {
            setIsRefining(false);
        }
    };

    const handleSave = () => {
        onSave(editedComponent);
        onClose();
    };

    const renderSpecificFields = (component: AnyInfrastructureComponent) => {
        switch (component.type) {
            case 'Programmable Asset':
                const asset = component as ProgrammableAssetDefinition;
                return (
                    <>
                        <FormInput label="Asset Class" value={asset.assetClass} onChange={e => handleFieldChange('assetClass', e.target.value)} />
                        <FormInput label="Issuance Mechanism" value={asset.issuanceMechanism} onChange={e => handleFieldChange('issuanceMechanism', e.target.value)} />
                        <FormTextarea label="Transfer Restrictions (one per line)" value={asset.transferRestrictions.join('\n')} onChange={e => handleArrayFieldChange('transferRestrictions', e.target.value)} />
                        <FormInput label="Settlement Layer" value={asset.settlementLayer} onChange={e => handleFieldChange('settlementLayer', e.target.value)} />
                    </>
                );
            case 'Automated Agent':
                const agent = component as AutomatedAgentDefinition;
                return (
                    <>
                        <FormSelect label="Agent Role" value={agent.agentRole} onChange={e => handleFieldChange('agentRole', e.target.value)} options={[{ value: 'Risk Monitor', label: 'Risk Monitor' }, { value: 'Compliance Officer', label: 'Compliance Officer' }, { value: 'Trade Executor', label: 'Trade Executor' }, { value: 'Liquidity Provider', label: 'Liquidity Provider' }, { value: 'Oracle Validator', label: 'Oracle Validator' }, { value: 'Fraud Detector', label: 'Fraud Detector' }]} />
                        <FormInput label="Operational Scope" value={agent.operationalScope} onChange={e => handleFieldChange('operationalScope', e.target.value)} />
                        <FormTextarea label="Decision Logic (one per line)" value={agent.decisionLogic.join('\n')} onChange={e => handleArrayFieldChange('decisionLogic', e.target.value)} />
                        <FormTextarea label="Communication Protocols (one per line)" value={agent.communicationProtocols.join('\n')} onChange={e => handleArrayFieldChange('communicationProtocols', e.target.value)} />
                    </>
                );
            case 'Data Feed':
                const dataFeed = component as DataFeedConfiguration;
                return (
                    <>
                        <FormInput label="Data Type" value={dataFeed.dataType} onChange={e => handleFieldChange('dataType', e.target.value)} />
                        <FormInput label="Source Provider" value={dataFeed.sourceProvider} onChange={e => handleFieldChange('sourceProvider', e.target.value)} />
                        <FormSelect label="Update Frequency" value={dataFeed.updateFrequency} onChange={e => handleFieldChange('updateFrequency', e.target.value)} options={[{ value: 'Real-time', label: 'Real-time' }, { value: 'Hourly', label: 'Hourly' }, { value: 'Daily', label: 'Daily' }, { value: 'Event-driven', label: 'Event-driven' }]} />
                        <FormTextarea label="Validation Mechanisms (one per line)" value={dataFeed.validationMechanisms.join('\n')} onChange={e => handleArrayFieldChange('validationMechanisms', e.target.value)} />
                    </>
                );
            case 'Network Node':
                const node = component as NetworkNodeTopology;
                return (
                    <>
                        <FormSelect label="Node Function" value={node.nodeFunction} onChange={e => handleFieldChange('nodeFunction', e.target.value)} options={[{ value: 'Validator', label: 'Validator' }, { value: 'Archival', label: 'Archival' }, { value: 'Payment Gateway', label: 'Payment Gateway' }, { value: 'Custodial Service', label: 'Custodial Service' }, { value: 'Bridge Operator', label: 'Bridge Operator' }]} />
                        <FormSelect label="Network Type" value={node.networkType} onChange={e => handleFieldChange('networkType', e.target.value)} options={[{ value: 'DLT (Public)', label: 'DLT (Public)' }, { value: 'DLT (Private)', label: 'DLT (Private)' }, { value: 'Traditional Payment Network', label: 'Traditional Payment Network' }, { value: 'Secure Messaging Fabric', label: 'Secure Messaging Fabric' }]} />
                        <FormInput label="Hosting Environment" value={node.hostingEnvironment} onChange={e => handleFieldChange('hostingEnvironment', e.target.value)} />
                        <FormTextarea label="Security Protocols (one per line)" value={node.securityProtocols.join('\n')} onChange={e => handleArrayFieldChange('securityProtocols', e.target.value)} />
                    </>
                );
            case 'Digital Identity Role':
                const identity = component as DigitalIdentityRole;
                return (
                    <>
                        <FormSelect label="Role Category" value={identity.roleCategory} onChange={e => handleFieldChange('roleCategory', e.target.value)} options={[{ value: 'Individual', label: 'Individual' }, { value: 'Institutional', label: 'Institutional' }, { value: 'Regulatory', label: 'Regulatory' }, { value: 'System', label: 'System' }]} />
                        <FormTextarea label="Authentication Method (one per line)" value={identity.authenticationMethod.join('\n')} onChange={e => handleArrayFieldChange('authenticationMethod', e.target.value)} />
                        <FormTextarea label="Authorization Policies (one per line)" value={identity.authorizationPolicies.join('\n')} onChange={e => handleArrayFieldChange('authorizationPolicies', e.target.value)} />
                        <FormInput label="Data Privacy Standards" value={identity.dataPrivacyStandards} onChange={e => handleFieldChange('dataPrivacyStandards', e.target.value)} />
                        <FormSelect label="Verification Level" value={identity.verificationLevel} onChange={e => handleFieldChange('verificationLevel', e.target.value)} options={[{ value: 'Basic', label: 'Basic' }, { value: 'KYC/AML', label: 'KYC/AML' }, { value: 'Institutional Verified', label: 'Institutional Verified' }]} />
                    </>
                );
            case 'Value Transfer Mechanism':
                const vtm = component as ValueTransferMechanism;
                return (
                    <>
                        <FormInput label="Propulsion Mechanism" value={vtm.propulsionMechanism} onChange={e => handleFieldChange('propulsionMechanism', e.target.value)} />
                        <FormSelect label="Interoperability Scope" value={vtm.interoperabilityScope} onChange={e => handleFieldChange('interoperabilityScope', e.target.value)} options={[{ value: 'Cross-Chain', label: 'Cross-Chain' }, { value: 'Cross-Network', label: 'Cross-Network' }, { value: 'Intra-Network', label: 'Intra-Network' }]} />
                        <FormInput label="Transaction Capacity" value={vtm.transactionCapacity} onChange={e => handleFieldChange('transactionCapacity', e.target.value)} />
                        <FormTextarea label="Resilience Measures (one per line)" value={vtm.resilienceMeasures.join('\n')} onChange={e => handleArrayFieldChange('resilienceMeasures', e.target.value)} />
                    </>
                );
            case 'Protocol Integration':
                const pi = component as ProtocolIntegrationSchema;
                return (
                    <>
                        <FormInput label="Protocol Standard" value={pi.protocolStandard} onChange={e => handleFieldChange('protocolStandard', e.target.value)} />
                        <FormInput label="Application Layer" value={pi.applicationLayer} onChange={e => handleFieldChange('applicationLayer', e.target.value)} />
                        <FormSelect label="Complexity Rating" value={pi.complexityRating} onChange={e => handleFieldChange('complexityRating', e.target.value)} options={[{ value: 'Simple', label: 'Simple' }, { value: 'Moderate', label: 'Moderate' }, { value: 'Advanced', label: 'Advanced' }, { value: 'Cutting-Edge', label: 'Cutting-Edge' }]} />
                        <FormTextarea label="Security Considerations (one per line)" value={pi.securityConsiderations.join('\n')} onChange={e => handleArrayFieldChange('securityConsiderations', e.target.value)} />
                    </>
                );
            case 'Cryptographic Security Module':
                const csm = component as CryptographicSecurityModule;
                return (
                    <>
                        <FormInput label="Attestation Mechanism" value={csm.attestationMechanism} onChange={e => handleFieldChange('attestationMechanism', e.target.value)} />
                        <FormTextarea label="Functionality (one per line)" value={csm.functionality.join('\n')} onChange={e => handleArrayFieldChange('functionality', e.target.value)} />
                        <FormSelect label="Security Assurance Level" value={csm.securityAssuranceLevel} onChange={e => handleFieldChange('securityAssuranceLevel', e.target.value)} options={[{ value: 'FIPS 140-2 Level 3', label: 'FIPS 140-2 Level 3' }, { value: 'Common Criteria EAL7', label: 'Common Criteria EAL7' }, { value: 'Software-based', label: 'Software-based' }]} />
                        <FormTextarea label="Threat Mitigation (one per line)" value={csm.threatMitigation.join('\n')} onChange={e => handleArrayFieldChange('threatMitigation', e.target.value)} />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Component: ${component.name} (${component.type})`}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {editedComponent.imageUrl && <img src={editedComponent.imageUrl} alt={editedComponent.name} className="w-full h-48 object-cover rounded-md mb-4" />}

                <FormInput label="Name" value={editedComponent.name} onChange={e => handleFieldChange('name', e.target.value)} />
                <FormTextarea label="Description" value={editedComponent.description} onChange={e => handleFieldChange('description', e.target.value)} rows={5} />
                <FormSelect label="Criticality" value={editedComponent.criticality} onChange={e => handleFieldChange('criticality', e.target.value)} options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }, { value: 'Mission-Critical', label: 'Mission-Critical' }]} />
                <FormTextarea label="Tags (one per line)" value={editedComponent.tags.join('\n')} onChange={e => handleArrayFieldChange('tags', e.target.value)} />

                <h3 className="font-semibold text-white text-lg mt-6">Type Specific Details:</h3>
                {renderSpecificFields(editedComponent)}

                <h4 className="font-semibold text-cyan-300 mt-6">Refine with AI</h4>
                <FormTextarea
                    label="Refinement Prompt"
                    value={refinePrompt}
                    onChange={e => setRefinePrompt(e.target.value)}
                    rows={3}
                    placeholder="e.g., 'Enhance its security protocols to include post-quantum cryptography. Adjust its transaction capacity for higher scalability.'"
                />
                <PrimaryButton onClick={handleRefine} disabled={isRefining} className="w-full mt-4">
                    {isRefining ? 'Refining Component...' : 'Refine Component with AI'}
                </PrimaryButton>

                <div className="flex justify-end space-x-2 mt-6">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
                </div>
            </div>
        </Modal>
    );
};

/**
 * Manages the generation and editing of regulatory compliance documents and audit trail narratives.
 * Commercial value: Centralizes the management of critical compliance and audit information, enhancing transparency, accountability, and regulatory reporting capabilities.
 */
export const ComplianceDocumentsPanel: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const activeProject = state.financialBlueprintProjects.find(p => p.id === state.activeProjectId);

    const [newDocumentPrompt, setNewDocumentPrompt] = useState('');
    const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<RegulatoryComplianceDocument | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleGenerateDocument = async () => {
        if (!activeProject || !activeProject.concept.description) {
            alert("Please generate a financial product concept first in the 'Overview' tab.");
            return;
        }
        if (!newDocumentPrompt.trim()) {
            alert("Please enter a prompt for the new document.");
            return;
        }

        setIsGeneratingDocument(true);
        const taskId = generateMockId();
        dispatch({
            type: 'ADD_GENERATION_TASK',
            payload: {
                id: taskId,
                projectId: activeProject.id,
                type: 'ComplianceDocument',
                status: 'InProgress',
                prompt: newDocumentPrompt,
                generatedContent: null,
                startTime: now(),
            }
        });

        try {
            const { document, imageUrl } = await aiService.generateRegulatoryComplianceDocument(
                activeProject.concept,
                activeProject.projectSettings.defaultPromptPrefix + newDocumentPrompt,
                activeProject.projectSettings.aiModelPreference
            );
            document.imageUrl = imageUrl;

            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    documents: [...activeProject.documents, document],
                    generationHistory: [...activeProject.generationHistory, {
                        id: generateMockId(),
                        projectId: activeProject.id,
                        type: 'ComplianceDocument',
                        status: 'Completed',
                        prompt: newDocumentPrompt,
                        generatedContent: document,
                        startTime: now(),
                        endTime: now(),
                        targetId: document.id,
                        visualizationUrl: imageUrl,
                    }]
                }
            });
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Completed', generatedContent: document, endTime: now(), targetId: document.id, visualizationUrl: imageUrl } });
            setNewDocumentPrompt('');
        } catch (error) {
            console.error("Failed to generate compliance document:", error);
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() } });
        } finally {
            setIsGeneratingDocument(false);
        }
    };

    const handleUpdateDocument = useCallback((updatedDocument: RegulatoryComplianceDocument) => {
        if (!activeProject) return;
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: {
                ...activeProject,
                documents: activeProject.documents.map(l => l.id === updatedDocument.id ? { ...updatedDocument, updatedAt: now() } : l)
            }
        });
    }, [activeProject, dispatch]);

    const handleDeleteDocument = useCallback((documentId: string) => {
        if (!activeProject) return;
        if (window.confirm("Are you sure you want to delete this compliance document?")) {
            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    documents: activeProject.documents.filter(l => l.id !== documentId)
                }
            });
        }
    }, [activeProject, dispatch]);

    if (!activeProject) return <p className="text-gray-400">No active project blueprint selected.</p>;

    const documentsGroupedByType = useMemo(() => {
        return activeProject.documents.reduce((acc, entry) => {
            if (!acc[entry.type]) {
                acc[entry.type] = [];
            }
            acc[entry.type].push(entry);
            return acc;
        }, {} as Record<RegulatoryComplianceDocument['type'], RegulatoryComplianceDocument[]>);
    }, [activeProject.documents]);

    const documentTypes: { value: RegulatoryComplianceDocument['type']; label: string }[] = [
        { value: 'Regulatory Filing', label: 'Regulatory Filing' }, { value: 'Audit Report', label: 'Audit Report' }, { value: 'Legal Opinion', label: 'Legal Opinion' },
        { value: 'Market Analysis', label: 'Market Analysis' }, { value: 'Incident Post-Mortem', label: 'Incident Post-Mortem' }, { value: 'Risk Assessment', label: 'Risk Assessment' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Compliance & Audit Documents</h2>

            <Card title="Generate New Document">
                <FormTextarea
                    label="Describe the compliance document or audit narrative you want to generate"
                    value={newDocumentPrompt}
                    onChange={e => setNewDocumentPrompt(e.target.value)}
                    rows={4}
                    placeholder="e.g., 'An audit report detailing the transaction integrity of the interbank settlement token', or 'A regulatory filing for a new digital asset in the EU.'"
                />
                <PrimaryButton onClick={handleGenerateDocument} disabled={isGeneratingDocument} className="w-full mt-4">
                    {isGeneratingDocument ? 'Generating Document...' : 'Generate New Document'}
                </PrimaryButton>
            </Card>

            <Card title="Existing Documents">
                {activeProject.documents.length === 0 ? (
                    <p className="text-gray-400">No documents generated yet. Start by generating one!</p>
                ) : (
                    <div className="space-y-4">
                        {documentTypes.map(typeOption => {
                            const entries = documentsGroupedByType[typeOption.value];
                            if (!entries || entries.length === 0) return null;
                            return (
                                <Accordion key={typeOption.value} title={`${typeOption.label} (${entries.length})`} defaultOpen>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {entries.map(document => (
                                            <div key={document.id} className="bg-gray-700 rounded-lg overflow-hidden shadow-lg border border-gray-600 relative group">
                                                {document.imageUrl && <img src={document.imageUrl} alt={document.title} className="w-full h-32 object-cover" />}
                                                <div className="p-4">
                                                    <h4 className="font-semibold text-cyan-300 text-lg mb-1">{document.title}</h4>
                                                    <p className="text-sm text-gray-400 truncate">{document.content}</p>
                                                    <div className="flex space-x-2 mt-4">
                                                        <SecondaryButton onClick={() => { setSelectedDocument(document); setIsEditModalOpen(true); }} className="!py-1 !px-2 text-xs">View/Edit</SecondaryButton>
                                                        <DangerButton onClick={() => handleDeleteDocument(document.id)} className="!py-1 !px-2 text-xs">Delete</DangerButton>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Accordion>
                            );
                        })}
                    </div>
                )}
            </Card>

            {selectedDocument && (
                <ComplianceDocumentEditorModal
                    isOpen={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setSelectedDocument(null); }}
                    document={selectedDocument}
                    onSave={handleUpdateDocument}
                    financialProductConcept={activeProject.concept}
                    aiModelPreference={activeProject.projectSettings.aiModelPreference}
                    onAddTask={(task) => dispatch({ type: 'ADD_GENERATION_TASK', payload: task })}
                    onUpdateTask={(task) => dispatch({ type: 'UPDATE_GENERATION_TASK', payload: task })}
                />
            )}
        </div>
    );
};

/**
 * A modal for editing detailed specifications of a compliance document, including AI-powered refinement.
 * Commercial value: Ensures accuracy and completeness of regulatory filings and audit reports, minimizing compliance risks and potential penalties.
 */
export const ComplianceDocumentEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    document: RegulatoryComplianceDocument;
    onSave: (document: RegulatoryComplianceDocument) => void;
    financialProductConcept: FinancialProductConcept;
    aiModelPreference: string;
    onAddTask: (task: GenerationTask) => void;
    onUpdateTask: (task: GenerationTask) => void;
}> = ({ isOpen, onClose, document, onSave, financialProductConcept, aiModelPreference, onAddTask, onUpdateTask }) => {
    const [editedDocument, setEditedDocument] = useState(document);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    useEffect(() => {
        setEditedDocument(document);
    }, [document]);

    const handleFieldChange = (field: string, value: any) => {
        setEditedDocument(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayFieldChange = (field: string, value: string) => {
        setEditedDocument(prev => ({ ...prev, [field]: value.split('\n').map(s => s.trim()).filter(Boolean) }));
    };

    const handleRefine = async () => {
        if (!refinePrompt.trim()) {
            alert("Please enter a refinement prompt.");
            return;
        }

        setIsRefining(true);
        const taskId = generateMockId();
        onAddTask({
            id: taskId,
            projectId: document.id,
            type: 'Refinement',
            status: 'InProgress',
            prompt: `Refine compliance document "${document.title}": ${refinePrompt}`,
            generatedContent: null,
            startTime: now(),
            targetId: document.id,
        });

        try {
            const schema = {
                type: Type.OBJECT, properties: {
                    content: { type: Type.STRING },
                    relatedEntities: { type: Type.ARRAY, items: { type: Type.STRING } },
                }
            };
            const fullPrompt = `Given the existing compliance document: Title: ${editedDocument.title}, Type: ${editedDocument.type}, Content: ${editedDocument.content}.
                                Refine its content and update its related entities based on the prompt: "${refinePrompt}".
                                Ensure it still aligns with the financial product concept: "${financialProductConcept.description}". Return strictly in JSON.`;

            const refinedData = await aiService['callModel'](aiModelPreference, fullPrompt, schema) as
                { content: string, relatedEntities: string[] };

            const updated = { ...editedDocument, ...refinedData, updatedAt: now() };
            onSave(updated);
            setEditedDocument(updated);
            setRefinePrompt('');

            onUpdateTask({ id: taskId, status: 'Completed', generatedContent: refinedData, endTime: now() });
        } catch (error) {
            console.error("Failed to refine document:", error);
            onUpdateTask({ id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() });
        } finally {
            setIsRefining(false);
        }
    };

    const handleSave = () => {
        onSave(editedDocument);
        onClose();
    };

    const documentTypeOptions: { value: RegulatoryComplianceDocument['type']; label: string }[] = [
        { value: 'Regulatory Filing', label: 'Regulatory Filing' }, { value: 'Audit Report', label: 'Audit Report' }, { value: 'Legal Opinion', label: 'Legal Opinion' },
        { value: 'Market Analysis', label: 'Market Analysis' }, { value: 'Incident Post-Mortem', label: 'Incident Post-Mortem' }, { value: 'Risk Assessment', label: 'Risk Assessment' },
    ];

    const importanceOptions: { value: RegulatoryComplianceDocument['importance']; label: string }[] = [
        { value: 'Minor', label: 'Minor' }, { value: 'Standard', label: 'Standard' }, { value: 'Major', label: 'Major' }, { value: 'Pivotal', label: 'Pivotal' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Document: ${document.title}`}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {editedDocument.imageUrl && <img src={editedDocument.imageUrl} alt={editedDocument.title} className="w-full h-48 object-cover rounded-md mb-4" />}

                <FormInput label="Title" value={editedDocument.title} onChange={e => handleFieldChange('title', e.target.value)} />
                <FormSelect label="Type" value={editedDocument.type} onChange={e => handleFieldChange('type', e.target.value as RegulatoryComplianceDocument['type'])} options={documentTypeOptions} />
                <FormTextarea label="Content" value={editedDocument.content} onChange={e => handleFieldChange('content', e.target.value)} rows={8} />
                <FormTextarea label="Related Entities (one per line)" value={editedDocument.relatedEntities.join('\n')} onChange={e => handleArrayFieldChange('relatedEntities', e.target.value)} />
                <FormSelect label="Importance" value={editedDocument.importance} onChange={e => handleFieldChange('importance', e.target.value as RegulatoryComplianceDocument['importance'])} options={importanceOptions} />

                <h4 className="font-semibold text-cyan-300 mt-6">Refine with AI</h4>
                <FormTextarea
                    label="Refinement Prompt"
                    value={refinePrompt}
                    onChange={e => setRefinePrompt(e.target.value)}
                    rows={3}
                    placeholder="e.g., 'Elaborate on the data anonymization strategies required by GDPR. Add specific references to ISO 27001 standards.'"
                />
                <PrimaryButton onClick={handleRefine} disabled={isRefining} className="w-full mt-4">
                    {isRefining ? 'Refining Document...' : 'Refine Document with AI'}
                </PrimaryButton>

                <div className="flex justify-end space-x-2 mt-6">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
                </div>
            </div>
        </Modal>
    );
};

/**
 * Manages the generation and editing of smart contract policy engines and interoperability frameworks.
 * Commercial value: Facilitates the design of robust programmable value rails and ensures seamless connectivity between diverse financial systems.
 */
export const PolicyAndInteroperabilityPanel: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const activeProject = state.financialBlueprintProjects.find(p => p.id === state.activeProjectId);

    const [policyEnginePrompt, setPolicyEnginePrompt] = useState('');
    const [isGeneratingPolicyEngine, setIsGeneratingPolicyEngine] = useState(false);
    const [interopFrameworkPrompt, setInteropFrameworkPrompt] = useState('');
    const [isGeneratingInteropFramework, setIsGeneratingInteropFramework] = useState(false);

    const [selectedPolicyEngine, setSelectedPolicyEngine] = useState<SmartContractPolicyEngine | null>(null);
    const [isPolicyEngineModalOpen, setIsPolicyEngineModalOpen] = useState(false);
    const [selectedInteropFramework, setSelectedInteropFramework] = useState<InteroperabilityFramework | null>(null);
    const [isInteropFrameworkModalOpen, setIsInteropFrameworkModalOpen] = useState(false);

    const handleGeneratePolicyEngine = async () => {
        if (!activeProject || !activeProject.concept.description) {
            alert("Please generate a financial product concept first in the 'Overview' tab.");
            return;
        }
        if (!policyEnginePrompt.trim()) {
            alert("Please enter a prompt for the new smart contract policy engine.");
            return;
        }

        setIsGeneratingPolicyEngine(true);
        const taskId = generateMockId();
        dispatch({
            type: 'ADD_GENERATION_TASK',
            payload: {
                id: taskId,
                projectId: activeProject.id,
                type: 'PolicyEngine',
                status: 'InProgress',
                prompt: policyEnginePrompt,
                generatedContent: null,
                startTime: now(),
            }
        });

        try {
            const policyEngine = await aiService.generateSmartContractPolicyEngine(
                activeProject.concept,
                activeProject.projectSettings.defaultPromptPrefix + policyEnginePrompt,
                activeProject.projectSettings.aiModelPreference
            );

            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    policyEngines: [...activeProject.policyEngines, policyEngine],
                    generationHistory: [...activeProject.generationHistory, {
                        id: generateMockId(),
                        projectId: activeProject.id,
                        type: 'PolicyEngine',
                        status: 'Completed',
                        prompt: policyEnginePrompt,
                        generatedContent: policyEngine,
                        startTime: now(),
                        endTime: now(),
                        targetId: policyEngine.id,
                    }]
                }
            });
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Completed', generatedContent: policyEngine, endTime: now(), targetId: policyEngine.id } });
            setPolicyEnginePrompt('');
        } catch (error) {
            console.error("Failed to generate smart contract policy engine:", error);
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() } });
        } finally {
            setIsGeneratingPolicyEngine(false);
        }
    };

    const handleGenerateInteropFramework = async () => {
        if (!activeProject || !activeProject.concept.description) {
            alert("Please generate a financial product concept first in the 'Overview' tab.");
            return;
        }
        if (!interopFrameworkPrompt.trim()) {
            alert("Please enter a prompt for the new interoperability framework.");
            return;
        }

        setIsGeneratingInteropFramework(true);
        const taskId = generateMockId();
        dispatch({
            type: 'ADD_GENERATION_TASK',
            payload: {
                id: taskId,
                projectId: activeProject.id,
                type: 'InteropFramework',
                status: 'InProgress',
                prompt: interopFrameworkPrompt,
                generatedContent: null,
                startTime: now(),
            }
        });

        try {
            const interopFramework = await aiService.generateInteroperabilityFramework(
                activeProject.concept,
                activeProject.projectSettings.defaultPromptPrefix + interopFrameworkPrompt,
                activeProject.projectSettings.aiModelPreference
            );

            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    interopFrameworks: [...activeProject.interopFrameworks, interopFramework],
                    generationHistory: [...activeProject.generationHistory, {
                        id: generateMockId(),
                        projectId: activeProject.id,
                        type: 'InteropFramework',
                        status: 'Completed',
                        prompt: interopFrameworkPrompt,
                        generatedContent: interopFramework,
                        startTime: now(),
                        endTime: now(),
                        targetId: interopFramework.id,
                    }]
                }
            });
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Completed', generatedContent: interopFramework, endTime: now(), targetId: interopFramework.id } });
            setInteropFrameworkPrompt('');
        } catch (error) {
            console.error("Failed to generate interoperability framework:", error);
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() } });
        } finally {
            setIsGeneratingInteropFramework(false);
        }
    };

    const handleUpdatePolicyEngine = useCallback((updatedSystem: SmartContractPolicyEngine) => {
        if (!activeProject) return;
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: {
                ...activeProject,
                policyEngines: activeProject.policyEngines.map(s => s.id === updatedSystem.id ? { ...updatedSystem, updatedAt: now() } : s)
            }
        });
    }, [activeProject, dispatch]);

    const handleDeletePolicyEngine = useCallback((systemId: string) => {
        if (!activeProject) return;
        if (window.confirm("Are you sure you want to delete this smart contract policy engine?")) {
            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    policyEngines: activeProject.policyEngines.filter(s => s.id !== systemId)
                }
            });
        }
    }, [activeProject, dispatch]);

    const handleUpdateInteropFramework = useCallback((updatedSystem: InteroperabilityFramework) => {
        if (!activeProject) return;
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: {
                ...activeProject,
                interopFrameworks: activeProject.interopFrameworks.map(s => s.id === updatedSystem.id ? { ...updatedSystem, updatedAt: now() } : s)
            }
        });
    }, [activeProject, dispatch]);

    const handleDeleteInteropFramework = useCallback((systemId: string) => {
        if (!activeProject) return;
        if (window.confirm("Are you sure you want to delete this interoperability framework?")) {
            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    interopFrameworks: activeProject.interopFrameworks.filter(s => s.id !== systemId)
                }
            });
        }
    }, [activeProject, dispatch]);

    if (!activeProject) return <p className="text-gray-400">No active project blueprint selected.</p>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Smart Contract Policies & Interoperability</h2>

            <Accordion title="Smart Contract Policy Engines" defaultOpen>
                <Card title="Generate New Smart Contract Policy Engine">
                    <FormTextarea
                        label="Describe the smart contract policy engine you want to generate"
                        value={policyEnginePrompt}
                        onChange={e => setPolicyEnginePrompt(e.target.value)}
                        rows={4}
                        placeholder="e.g., 'A policy engine for a loan agreement, automatically enforcing collateral requirements and repayment schedules.'"
                    />
                    <PrimaryButton onClick={handleGeneratePolicyEngine} disabled={isGeneratingPolicyEngine} className="w-full mt-4">
                        {isGeneratingPolicyEngine ? 'Generating Policy Engine...' : 'Generate New Policy Engine'}
                    </PrimaryButton>
                </Card>

                <Card title="Existing Policy Engines" className="mt-6">
                    {activeProject.policyEngines.length === 0 ? (
                        <p className="text-gray-400">No smart contract policy engines defined yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {activeProject.policyEngines.map(engine => (
                                <div key={engine.id} className="p-4 bg-gray-700 rounded-md border border-gray-600">
                                    <h4 className="font-semibold text-cyan-300 text-lg mb-1">{engine.name}</h4>
                                    <p className="text-sm text-gray-400 truncate">{engine.description}</p>
                                    <div className="flex space-x-2 mt-4">
                                        <SecondaryButton onClick={() => { setSelectedPolicyEngine(engine); setIsPolicyEngineModalOpen(true); }} className="!py-1 !px-2 text-xs">View/Edit</SecondaryButton>
                                        <DangerButton onClick={() => handleDeletePolicyEngine(engine.id)} className="!py-1 !px-2 text-xs">Delete</DangerButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </Accordion>

            <Accordion title="Interoperability Frameworks" defaultOpen>
                <Card title="Generate New Interoperability Framework">
                    <FormTextarea
                        label="Describe the interoperability framework you want to generate"
                        value={interopFrameworkPrompt}
                        onChange={e => setInteropFrameworkPrompt(e.target.value)}
                        rows={4}
                        placeholder="e.g., 'A framework for seamless data exchange between a traditional banking system and a private DLT network using ISO 20022.'"
                    />
                    <PrimaryButton onClick={handleGenerateInteropFramework} disabled={isGeneratingInteropFramework} className="w-full mt-4">
                        {isGeneratingInteropFramework ? 'Generating Framework...' : 'Generate New Interoperability Framework'}
                    </PrimaryButton>
                </Card>

                <Card title="Existing Interoperability Frameworks" className="mt-6">
                    {activeProject.interopFrameworks.length === 0 ? (
                        <p className="text-gray-400">No interoperability frameworks defined yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {activeProject.interopFrameworks.map(framework => (
                                <div key={framework.id} className="p-4 bg-gray-700 rounded-md border border-gray-600">
                                    <h4 className="font-semibold text-cyan-300 text-lg mb-1">{framework.name}</h4>
                                    <p className="text-sm text-gray-400 truncate">{framework.description}</p>
                                    <div className="flex space-x-2 mt-4">
                                        <SecondaryButton onClick={() => { setSelectedInteropFramework(framework); setIsInteropFrameworkModalOpen(true); }} className="!py-1 !px-2 text-xs">View/Edit</SecondaryButton>
                                        <DangerButton onClick={() => handleDeleteInteropFramework(framework.id)} className="!py-1 !px-2 text-xs">Delete</DangerButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </Accordion>

            {selectedPolicyEngine && (
                <SmartContractPolicyEngineEditorModal
                    isOpen={isPolicyEngineModalOpen}
                    onClose={() => { setIsPolicyEngineModalOpen(false); setSelectedPolicyEngine(null); }}
                    policyEngine={selectedPolicyEngine}
                    onSave={handleUpdatePolicyEngine}
                    financialProductConcept={activeProject.concept}
                    aiModelPreference={activeProject.projectSettings.aiModelPreference}
                    onAddTask={(task) => dispatch({ type: 'ADD_GENERATION_TASK', payload: task })}
                    onUpdateTask={(task) => dispatch({ type: 'UPDATE_GENERATION_TASK', payload: task })}
                />
            )}

            {selectedInteropFramework && (
                <InteropFrameworkEditorModal
                    isOpen={isInteropFrameworkModalOpen}
                    onClose={() => { setIsInteropFrameworkModalOpen(false); setSelectedInteropFramework(null); }}
                    interopFramework={selectedInteropFramework}
                    onSave={handleUpdateInteropFramework}
                    financialProductConcept={activeProject.concept}
                    aiModelPreference={activeProject.projectSettings.aiModelPreference}
                    onAddTask={(task) => dispatch({ type: 'ADD_GENERATION_TASK', payload: task })}
                    onUpdateTask={(task) => dispatch({ type: 'UPDATE_GENERATION_TASK', payload: task })}
                />
            )}
        </div>
    );
};

/**
 * A modal for editing detailed specifications of a smart contract policy engine, including AI-powered refinement.
 * Commercial value: Ensures precise configuration of automated financial rules, minimizing operational risks and maximizing transactional integrity.
 */
export const SmartContractPolicyEngineEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    policyEngine: SmartContractPolicyEngine;
    onSave: (policyEngine: SmartContractPolicyEngine) => void;
    financialProductConcept: FinancialProductConcept;
    aiModelPreference: string;
    onAddTask: (task: GenerationTask) => void;
    onUpdateTask: (task: GenerationTask) => void;
}> = ({ isOpen, onClose, policyEngine, onSave, financialProductConcept, aiModelPreference, onAddTask, onUpdateTask }) => {
    const [editedEngine, setEditedEngine] = useState(policyEngine);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    useEffect(() => {
        setEditedEngine(policyEngine);
    }, [policyEngine]);

    const handleFieldChange = (field: string, value: any) => {
        setEditedEngine(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayFieldChange = (field: string, value: string) => {
        setEditedEngine(prev => ({ ...prev, [field]: value.split('\n').map(s => s.trim()).filter(Boolean) }));
    };

    const handleRefine = async () => {
        if (!refinePrompt.trim()) {
            alert("Please enter a refinement prompt.");
            return;
        }

        setIsRefining(true);
        const taskId = generateMockId();
        onAddTask({
            id: taskId,
            projectId: policyEngine.id,
            type: 'Refinement',
            status: 'InProgress',
            prompt: `Refine smart contract policy engine "${policyEngine.name}": ${refinePrompt}`,
            generatedContent: null,
            startTime: now(),
            targetId: policyEngine.id,
        });

        try {
            const schema = {
                type: Type.OBJECT, properties: {
                    description: { type: Type.STRING },
                    policyRules: { type: Type.ARRAY, items: { type: Type.STRING } },
                    exampleScenarios: { type: Type.ARRAY, items: { type: Type.STRING } },
                    limitations: { type: Type.ARRAY, items: { type: Type.STRING } },
                    integrationWithPlatform: { type: Type.STRING }
                }
            };
            const fullPrompt = `Given the existing smart contract policy engine details: Name: ${editedEngine.name}, Description: ${editedEngine.description}, Execution Environment: ${editedEngine.executionEnvironment}.
                                Refine its description, policy rules, example scenarios, limitations, and platform integration based on the prompt: "${refinePrompt}".
                                Ensure it still aligns with the financial product concept: "${financialProductConcept.description}". Return strictly in JSON.`;

            const refinedData = await aiService['callModel'](aiModelPreference, fullPrompt, schema) as
                { description: string, policyRules: string[], exampleScenarios: string[], limitations: string[], integrationWithPlatform: string };

            const updated = { ...editedEngine, ...refinedData, updatedAt: now() };
            onSave(updated);
            setEditedEngine(updated);
            setRefinePrompt('');

            onUpdateTask({ id: taskId, status: 'Completed', generatedContent: refinedData, endTime: now() });
        } catch (error) {
            console.error("Failed to refine policy engine:", error);
            onUpdateTask({ id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() });
        } finally {
            setIsRefining(false);
        }
    };

    const handleSave = () => {
        onSave(editedEngine);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Policy Engine: ${policyEngine.name}`}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <FormInput label="Name" value={editedEngine.name} onChange={e => handleFieldChange('name', e.target.value)} />
                <FormTextarea label="Description" value={editedEngine.description} onChange={e => handleFieldChange('description', e.target.value)} rows={5} />
                <FormInput label="Execution Environment" value={editedEngine.executionEnvironment} onChange={e => handleFieldChange('executionEnvironment', e.target.value)} />

                <Accordion title="Policy Rules">
                    <FormTextarea label="Rules (one per line)" value={editedEngine.policyRules.join('\n')} onChange={e => handleArrayFieldChange('policyRules', e.target.value)} />
                </Accordion>
                <Accordion title="Example Scenarios">
                    <FormTextarea label="Scenarios (one per line)" value={editedEngine.exampleScenarios.join('\n')} onChange={e => handleArrayFieldChange('exampleScenarios', e.target.value)} />
                </Accordion>
                <Accordion title="Limitations">
                    <FormTextarea label="Limitations (one per line)" value={editedEngine.limitations.join('\n')} onChange={e => handleArrayFieldChange('limitations', e.target.value)} />
                </Accordion>
                <FormTextarea label="Integration With Platform" value={editedEngine.integrationWithPlatform} onChange={e => handleFieldChange('integrationWithPlatform', e.target.value)} rows={3} />

                <h4 className="font-semibold text-cyan-300 mt-6">Refine with AI</h4>
                <FormTextarea
                    label="Refinement Prompt"
                    value={refinePrompt}
                    onChange={e => setRefinePrompt(e.target.value)}
                    rows={3}
                    placeholder="e.g., 'Add a new rule for dynamic fee adjustment based on network congestion. Clarify its role in fraud detection.'"
                />
                <PrimaryButton onClick={handleRefine} disabled={isRefining} className="w-full mt-4">
                    {isRefining ? 'Refining Policy Engine...' : 'Refine Policy Engine with AI'}
                </PrimaryButton>

                <div className="flex justify-end space-x-2 mt-6">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
                </div>
            </div>
        </Modal>
    );
};

/**
 * A modal for editing detailed specifications of an interoperability framework, including AI-powered refinement.
 * Commercial value: Allows for precise configuration of integration standards, ensuring optimal data flow and seamless value transfer between diverse financial systems.
 */
export const InteropFrameworkEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    interopFramework: InteroperabilityFramework;
    onSave: (interopFramework: InteroperabilityFramework) => void;
    financialProductConcept: FinancialProductConcept;
    aiModelPreference: string;
    onAddTask: (task: GenerationTask) => void;
    onUpdateTask: (task: GenerationTask) => void;
}> = ({ isOpen, onClose, interopFramework, onSave, financialProductConcept, aiModelPreference, onAddTask, onUpdateTask }) => {
    const [editedFramework, setEditedFramework] = useState(interopFramework);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    useEffect(() => {
        setEditedFramework(interopFramework);
    }, [interopFramework]);

    const handleFieldChange = (field: string, value: any) => {
        setEditedFramework(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayFieldChange = (field: string, value: string) => {
        setEditedFramework(prev => ({ ...prev, [field]: value.split('\n').map(s => s.trim()).filter(Boolean) }));
    };

    const handleRefine = async () => {
        if (!refinePrompt.trim()) {
            alert("Please enter a refinement prompt.");
            return;
        }

        setIsRefining(true);
        const taskId = generateMockId();
        onAddTask({
            id: taskId,
            projectId: interopFramework.id,
            type: 'Refinement',
            status: 'InProgress',
            prompt: `Refine interoperability framework "${interopFramework.name}": ${refinePrompt}`,
            generatedContent: null,
            startTime: now(),
            targetId: interopFramework.id,
        });

        try {
            const schema = {
                type: Type.OBJECT, properties: {
                    description: { type: Type.STRING },
                    keyStandards: { type: Type.ARRAY, items: { type: Type.STRING } },
                    dataExchangeFormats: { type: Type.ARRAY, items: { type: Type.STRING } },
                    securityMechanisms: { type: Type.ARRAY, items: { type: Type.STRING } },
                    impactOnLatency: { type: Type.STRING }
                }
            };
            const fullPrompt = `Given the existing interoperability framework details: Name: ${editedFramework.name}, Description: ${editedFramework.description}, Key Standards: ${editedFramework.keyStandards.join(', ')}.
                                Refine its description, key standards, data exchange formats, security mechanisms, and impact on latency based on the prompt: "${refinePrompt}".
                                Ensure it still aligns with the financial product concept: "${financialProductConcept.description}". Return strictly in JSON.`;

            const refinedData = await aiService['callModel'](aiModelPreference, fullPrompt, schema) as
                { description: string, keyStandards: string[], dataExchangeFormats: string[], securityMechanisms: string[], impactOnLatency: string };

            const updated = { ...editedFramework, ...refinedData, updatedAt: now() };
            onSave(updated);
            setEditedFramework(updated);
            setRefinePrompt('');

            onUpdateTask({ id: taskId, status: 'Completed', generatedContent: refinedData, endTime: now() });
        } catch (error) {
            console.error("Failed to refine interoperability framework:", error);
            onUpdateTask({ id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() });
        } finally {
            setIsRefining(false);
        }
    };

    const handleSave = () => {
        onSave(editedFramework);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Interoperability Framework: ${interopFramework.name}`}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <FormInput label="Name" value={editedFramework.name} onChange={e => handleFieldChange('name', e.target.value)} />
                <FormTextarea label="Description" value={editedFramework.description} onChange={e => handleFieldChange('description', e.target.value)} rows={5} />

                <Accordion title="Key Standards">
                    <FormTextarea label="Standards (one per line)" value={editedFramework.keyStandards.join('\n')} onChange={e => handleArrayFieldChange('keyStandards', e.target.value)} />
                </Accordion>
                <Accordion title="Data Exchange Formats">
                    <FormTextarea label="Formats (one per line)" value={editedFramework.dataExchangeFormats.join('\n')} onChange={e => handleArrayFieldChange('dataExchangeFormats', e.target.value)} />
                </Accordion>
                <Accordion title="Security Mechanisms">
                    <FormTextarea label="Mechanisms (one per line)" value={editedFramework.securityMechanisms.join('\n')} onChange={e => handleArrayFieldChange('securityMechanisms', e.target.value)} />
                </Accordion>
                <FormInput label="Impact On Latency" value={editedFramework.impactOnLatency} onChange={e => handleFieldChange('impactOnLatency', e.target.value)} />

                <h4 className="font-semibold text-cyan-300 mt-6">Refine with AI</h4>
                <FormTextarea
                    label="Refinement Prompt"
                    value={refinePrompt}
                    onChange={e => setRefinePrompt(e.target.value)}
                    rows={3}
                    placeholder="e.g., 'Focus on real-time data streaming capabilities. Add requirements for cryptographic proof of origin for all data exchanges.'"
                />
                <PrimaryButton onClick={handleRefine} disabled={isRefining} className="w-full mt-4">
                    {isRefining ? 'Refining Framework...' : 'Refine Framework with AI'}
                </PrimaryButton>

                <div className="flex justify-end space-x-2 mt-6">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
                </div>
            </div>
        </Modal>
    );
};

/**
 * Manages the generation and editing of operational scenarios.
 * Commercial value: Enables proactive risk assessment, comprehensive business continuity planning, and validation of new financial products under various conditions.
 */
export const OperationalScenariosPanel: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const activeProject = state.financialBlueprintProjects.find(p => p.id === state.activeProjectId);

    const [newScenarioPrompt, setNewScenarioPrompt] = useState('');
    const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);

    const handleGenerateScenario = async () => {
        if (!activeProject || !activeProject.concept.description) {
            alert("Please generate a financial product concept first in the 'Overview' tab.");
            return;
        }
        if (!newScenarioPrompt.trim()) {
            alert("Please enter a prompt for the new operational scenario.");
            return;
        }

        setIsGeneratingScenario(true);
        const taskId = generateMockId();
        dispatch({
            type: 'ADD_GENERATION_TASK',
            payload: {
                id: taskId,
                projectId: activeProject.id,
                type: 'OperationalScenario',
                status: 'InProgress',
                prompt: newScenarioPrompt,
                generatedContent: null,
                startTime: now(),
            }
        });

        try {
            const operationalScenario = await aiService.generateOperationalScenario(
                activeProject.concept,
                activeProject.projectSettings.defaultPromptPrefix + newScenarioPrompt,
                activeProject.projectSettings.aiModelPreference
            );

            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    operationalScenarios: [...activeProject.operationalScenarios, operationalScenario],
                    generationHistory: [...activeProject.generationHistory, {
                        id: generateMockId(),
                        projectId: activeProject.id,
                        type: 'OperationalScenario',
                        status: 'Completed',
                        prompt: newScenarioPrompt,
                        generatedContent: operationalScenario,
                        startTime: now(),
                        endTime: now(),
                        targetId: operationalScenario.id,
                    }]
                }
            });
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Completed', generatedContent: operationalScenario, endTime: now(), targetId: operationalScenario.id } });
            setNewScenarioPrompt('');
        } catch (error) {
            console.error("Failed to generate operational scenario:", error);
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() } });
        } finally {
            setIsGeneratingScenario(false);
        }
    };

    const handleUpdateScenario = useCallback((updatedScenario: OperationalScenario) => {
        if (!activeProject) return;
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: {
                ...activeProject,
                operationalScenarios: activeProject.operationalScenarios.map(q => q.id === updatedScenario.id ? { ...updatedScenario, updatedAt: now() } : q)
            }
        });
    }, [activeProject, dispatch]);

    const handleDeleteScenario = useCallback((scenarioId: string) => {
        if (!activeProject) return;
        if (window.confirm("Are you sure you want to delete this operational scenario?")) {
            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    operationalScenarios: activeProject.operationalScenarios.filter(q => q.id !== scenarioId)
                }
            });
        }
    }, [activeProject, dispatch]);

    if (!activeProject) return <p className="text-gray-400">No active project blueprint selected.</p>;

    const scenarioTypeOptions: { value: OperationalScenario['type']; label: string }[] = [
        { value: 'Risk Mitigation', label: 'Risk Mitigation' }, { value: 'Compliance Audit', label: 'Compliance Audit' }, { value: 'Market Stress Test', label: 'Market Stress Test' },
        { value: 'New Product Launch', label: 'New Product Launch' }, { value: 'Fraud Detection', label: 'Fraud Detection' }, { value: 'Disaster Recovery', label: 'Disaster Recovery' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Operational Scenarios & Simulations</h2>

            <Card title="Generate New Operational Scenario">
                <FormTextarea
                    label="Describe the operational scenario you want to generate"
                    value={newScenarioPrompt}
                    onChange={e => setNewScenarioPrompt(e.target.value)}
                    rows={4}
                    placeholder="e.g., 'A simulated liquidity crisis impacting multiple market segments, testing the resilience of automated agents and settlement rails.'"
                />
                <PrimaryButton onClick={handleGenerateScenario} disabled={isGeneratingScenario} className="w-full mt-4">
                    {isGeneratingScenario ? 'Generating Scenario...' : 'Generate New Operational Scenario'}
                </PrimaryButton>
            </Card>

            <Card title="Existing Operational Scenarios">
                {activeProject.operationalScenarios.length === 0 ? (
                    <p className="text-gray-400">No operational scenarios defined yet. Start by generating one!</p>
                ) : (
                    <div className="space-y-4">
                        {activeProject.operationalScenarios.map(scenario => (
                            <div key={scenario.id} className="bg-gray-700 rounded-lg shadow-lg border border-gray-600 p-4">
                                <h4 className="font-semibold text-cyan-300 text-lg mb-1">{scenario.title}</h4>
                                <p className="text-sm text-gray-400 mb-2">{scenario.summary}</p>
                                <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                                    <li><strong>Type:</strong> {scenario.type}</li>
                                    <li><strong>Initiator:</strong> {scenario.initiator}</li>
                                    <li><strong>Goal:</strong> {scenario.goal}</li>
                                    <li><strong>Expected Outcomes:</strong> {scenario.expectedOutcomes.join(', ') || 'None'}</li>
                                    <li><strong>Potential Challenges:</strong> {scenario.potentialChallenges.join(', ') || 'None'}</li>
                                </ul>
                                <div className="flex space-x-2 mt-4">
                                    <SecondaryButton onClick={() => { /* Implement editor modal for scenario */ }} className="!py-1 !px-2 text-xs">View/Edit</SecondaryButton>
                                    <DangerButton onClick={() => handleDeleteScenario(scenario.id)} className="!py-1 !px-2 text-xs">Delete</DangerButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

/**
 * Provides a conceptual panel for visualizing network topology and settlement flows.
 * Commercial value: Offers a strategic overview of the financial infrastructure, aiding in optimizing network design, identifying bottlenecks, and demonstrating system resilience.
 */
export const NetworkTopologyVisualizerPanel: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const activeProject = state.financialBlueprintProjects.find(p => p.id === state.activeProjectId);

    const [diagramPrompt, setDiagramPrompt] = useState('Generate a network topology diagram focusing on core DLT nodes, payment gateways, and data feeds.');
    const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
    const [generatedDiagramUrl, setGeneratedDiagramUrl] = useState<string | null>(null);

    const handleGenerateDiagram = async () => {
        if (!activeProject || !activeProject.concept.description) {
            alert("Please generate a financial product concept first in the 'Overview' tab.");
            return;
        }

        setIsGeneratingDiagram(true);
        setGeneratedDiagramUrl(null);
        const taskId = generateMockId();
        dispatch({
            type: 'ADD_GENERATION_TASK',
            payload: {
                id: taskId,
                projectId: activeProject.id,
                type: 'ImageGeneration',
                status: 'InProgress',
                prompt: `Generate a detailed architectural diagram for the financial infrastructure: "${activeProject.concept.description}". Focus on key components like DLT nodes, payment gateways, data feeds, and security modules. ${diagramPrompt}`,
                generatedContent: null,
                startTime: now(),
            }
        });

        try {
            const fullDiagramPrompt = `professional architectural diagram of a secure financial infrastructure, showing interconnected DLT nodes, payment rails, digital identity services, and intelligent agents. Technical schematic, high resolution, clean and clear labels. Based on: "${activeProject.concept.description}". Specific focus: "${diagramPrompt}"`;
            const imageUrl = await aiService['callImageModel'](fullDiagramPrompt, activeProject.projectSettings.imageModelPreference);
            setGeneratedDiagramUrl(imageUrl);

            dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                    ...activeProject,
                    generationHistory: [...activeProject.generationHistory, {
                        id: generateMockId(),
                        projectId: activeProject.id,
                        type: 'ImageGeneration',
                        status: 'Completed',
                        prompt: fullDiagramPrompt,
                        generatedContent: { imageUrl },
                        startTime: now(),
                        endTime: now(),
                        visualizationUrl: imageUrl,
                    }]
                }
            });
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Completed', generatedContent: { imageUrl }, endTime: now(), visualizationUrl: imageUrl } });
        } catch (error) {
            console.error("Failed to generate diagram:", error);
            dispatch({ type: 'UPDATE_GENERATION_TASK', payload: { id: taskId, status: 'Failed', error: (error as Error).message, endTime: now() } });
        } finally {
            setIsGeneratingDiagram(false);
        }
    };

    if (!activeProject) return <p className="text-gray-400">No active project blueprint selected.</p>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Network Topology & Settlement Flow Visualizer (Conceptual)</h2>
            <Card title="Generate Architectural Diagram">
                <FormTextarea
                    label="Describe the architectural diagram you want to generate"
                    value={diagramPrompt}
                    onChange={e => setDiagramPrompt(e.target.value)}
                    rows={5}
                    placeholder="e.g., 'Generate a diagram highlighting the secure messaging fabric and the routing of high-value payments across multiple DLTs.'"
                />
                <PrimaryButton onClick={handleGenerateDiagram} disabled={isGeneratingDiagram} className="w-full mt-4">
                    {isGeneratingDiagram ? 'Generating Diagram...' : 'Generate Architectural Diagram Image'}
                </PrimaryButton>
            </Card>

            {(isGeneratingDiagram || generatedDiagramUrl) && (
                <Card title="Generated Diagram Preview">
                    {isGeneratingDiagram ? <p>Generating architectural diagram...</p> : (
                        generatedDiagramUrl ? (
                            <img src={generatedDiagramUrl} alt="Generated Network Topology Diagram" className="rounded-lg w-full h-auto object-contain max-h-[600px]" />
                        ) : (
                            <p className="text-red-400">Failed to generate diagram image.</p>
                        )
                    )}
                </Card>
            )}

            <Card title="Interactive Visualization Features (Future Development)">
                <p className="text-gray-400">
                    This section will eventually host an interactive visualization tool where you can:
                </p>
                <ul className="list-disc list-inside text-gray-400 ml-4">
                    <li>Visualize network topology based on defined components and protocols.</li>
                    <li>Simulate real-time settlement flows and observe latency/throughput.</li>
                    <li>Trace data integrity and cryptographic trails across interconnected systems.</li>
                    <li>Map digital identities and access control policies to network nodes.</li>
                    <li>Identify potential single points of failure or compliance gaps.</li>
                    <li>Export visualization data to operational monitoring dashboards.</li>
                </ul>
                <p className="text-gray-500 mt-2">
                    (Currently, only static image generation for conceptual diagrams is supported.)
                </p>
            </Card>
        </div>
    );
};

/**
 * The main project editor view, providing navigation between different design panels.
 * Commercial value: Offers a comprehensive, organized workspace for architects to design and manage complex financial infrastructure blueprints, ensuring a structured approach to innovation.
 */
export const ProjectEditorView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const activeProject = state.financialBlueprintProjects.find(p => p.id === state.activeProjectId);
    const [activeSubPanel, setActiveSubPanel] = useState<'Overview' | 'Market Segments' | 'Components' | 'Compliance Docs' | 'Policies & Interop' | 'Operational Scenarios' | 'Network Viz' | 'Generation Queue'>('Overview');

    if (!activeProject) {
        return (
            <div className="text-center p-8 text-gray-300">
                <p className="text-xl mb-4">No financial blueprint project selected.</p>
                <PrimaryButton onClick={() => dispatch({ type: 'SET_VIEW', payload: 'Dashboard' })}>
                    Go to Dashboard
                </PrimaryButton>
            </div>
        );
    }

    const renderSubPanel = () => {
        switch (activeSubPanel) {
            case 'Overview': return <ProjectOverviewPanel />;
            case 'Market Segments': return <MarketSegmentsPanel />;
            case 'Components': return <InfrastructureComponentsPanel />;
            case 'Compliance Docs': return <ComplianceDocumentsPanel />;
            case 'Policies & Interop': return <PolicyAndInteroperabilityPanel />;
            case 'Operational Scenarios': return <OperationalScenariosPanel />;
            case 'Network Viz': return <NetworkTopologyVisualizerPanel />;
            case 'Generation Queue': return <GenerationQueuePanel />;
            default: return <p className="text-gray-400">Select a design panel.</p>;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint Editor: {activeProject.name}</h1>
            <div className="flex space-x-2 border-b border-gray-700 pb-2 overflow-x-auto">
                {['Overview', 'Market Segments', 'Components', 'Compliance Docs', 'Policies & Interop', 'Operational Scenarios', 'Network Viz', 'Generation Queue'].map(panel => (
                    <TabButton
                        key={panel}
                        active={activeSubPanel === panel}
                        onClick={() => setActiveSubPanel(panel as any)}
                    >
                        {panel}
                    </TabButton>
                ))}
            </div>
            <div className="mt-6">
                {renderSubPanel()}
            </div>
        </div>
    );
};

/**
 * Displays global application settings, allowing users to configure preferences and operational parameters.
 * Commercial value: Enables personalization of the platform, improves user efficiency, and provides control over system behavior.
 */
export const SettingsView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [userPrefs, setUserPrefs] = useState(state.userPreferences);

    useEffect(() => {
        setUserPrefs(state.userPreferences);
    }, [state.userPreferences]);

    const handleSave = () => {
        dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: userPrefs });
        alert('User preferences saved!');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Application Settings</h2>
            <Card title="User Preferences">
                <div className="space-y-4">
                    <FormSelect
                        label="Theme"
                        value={userPrefs.theme}
                        onChange={e => setUserPrefs(prev => ({ ...prev, theme: e.target.value as 'dark' | 'light' }))}
                        options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light (Future)' }]}
                    />
                    <FormSelect
                        label="Default View on Startup"
                        value={userPrefs.defaultView}
                        onChange={e => setUserPrefs(prev => ({ ...prev, defaultView: e.target.value as 'Dashboard' | 'Project Editor' }))}
                        options={[{ value: 'Dashboard', label: 'Dashboard' }, { value: 'Project Editor', label: 'Last Active Blueprint' }]}
                    />
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={userPrefs.notificationsEnabled}
                            onChange={e => setUserPrefs(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                            className="mr-2 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
                        />
                        <label className="text-gray-300">Enable Notifications</label>
                    </div>
                    <FormInput
                        label="AI Rate Limit Warning Threshold (%)"
                        type="number"
                        value={userPrefs.aiRateLimitWarningThreshold}
                        onChange={e => setUserPrefs(prev => ({ ...prev, aiRateLimitWarningThreshold: parseInt(e.target.value) || 0 }))}
                        min="0" max="100"
                    />
                    <FormSelect
                        label="Compliance Reporting Frequency"
                        value={userPrefs.complianceReportingFrequency}
                        onChange={e => setUserPrefs(prev => ({ ...prev, complianceReportingFrequency: e.target.value as 'Daily' | 'Weekly' | 'Monthly' }))}
                        options={[{ value: 'Daily', label: 'Daily' }, { value: 'Weekly', label: 'Weekly' }, { value: 'Monthly', label: 'Monthly' }]}
                    />
                    <PrimaryButton onClick={handleSave}>Save Preferences</PrimaryButton>
                </div>
            </Card>
        </div>
    );
};

/**
 * Provides help documentation and frequently asked questions for the Financial Blueprint Designer.
 * Commercial value: Reduces support costs, empowers users to self-serve solutions, and accelerates user adoption of complex financial design tools.
 */
export const HelpView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Help & Support</h2>
            <Card title="Getting Started">
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">Welcome to Financial Blueprint Designer!</h3>
                <p className="text-gray-300 mb-4">
                    This advanced application helps you rapidly prototype, model, and develop detailed blueprints for your digital financial infrastructure projects, powered by intelligent AI.
                </p>
                <ol className="list-decimal list-inside text-gray-300 space-y-2">
                    <li>Navigate to the <span className="font-semibold text-cyan-400">Dashboard</span> to see your existing project blueprints or create a new one.</li>
                    <li>In a new project, start by generating a <span className="font-semibold text-cyan-400">Financial Product Concept</span> in the Overview panel. This forms the strategic foundation of your solution.</li>
                    <li>Explore other panels like <span className="font-semibold text-cyan-400">Market Segments</span>, <span className="font-semibold text-cyan-400">Components</span>, and <span className="font-semibold text-cyan-400">Compliance Docs</span> to flesh out specific details of your financial infrastructure.</li>
                    <li>Utilize the AI generation features to create detailed specifications, diagrams, and strategic insights based on your prompts.</li>
                    <li>Customize your project's AI settings in the <span className="font-semibold text-cyan-400">Project Settings</span> accordion within the Overview.</li>
                    <li>Monitor ongoing AI tasks and their status in the <span className="font-semibold text-cyan-400">Generation Queue</span>.</li>
                </ol>
            </Card>
            <Card title="Troubleshooting & FAQ">
                <Accordion title="Q: My AI generation failed or returned an error.">
                    <p className="text-gray-300">
                        A: This can happen due to various reasons:
                        <ul className="list-disc list-inside ml-4 mt-2">
                            <li><strong>API Key Issues:</strong> Ensure your Google AI Studio API key is correctly configured and has sufficient quotas.</li>
                            <li><strong>Invalid Prompt:</strong> Sometimes overly complex, vague, or contradictory prompts can confuse the AI. Try simplifying or rephrasing with clear, specific financial terminology.</li>
                            <li><strong>Rate Limits:</strong> You might be hitting API rate limits. Wait a moment and try again.</li>
                            <li><strong>Network Issues:</strong> Check your internet connection.</li>
                        </ul>
                        Review the error message in the "Generation Queue" for more details.
                    </p>
                </Accordion>
                <Accordion title="Q: The generated diagrams or visualizations are not what I expected.">
                    <p className="text-gray-300">
                        A: Image generation models can be sensitive to phrasing.
                        <ul className="list-disc list-inside ml-4 mt-2">
                            <li><strong>Be Specific:</strong> Add more descriptive adjectives and details (e.g., "high-throughput DLT network with secure channels").</li>
                            <li><strong>Use Keywords:</strong> Include style keywords like "professional architectural diagram," "technical schematic," "clean and clear labels."</li>
                            <li><strong>Refine Prompts:</strong> Experiment with different wordings. You can adjust default negative prompts in Project Settings to exclude undesirable styles.</li>
                        </ul>
                    </p>
                </Accordion>
            </Card>
        </div>
    );
};

/**
 * The top-level component for the Financial Blueprint Designer application.
 * This component orchestrates the main navigation and view rendering.
 * Commercial value: Serves as the user's primary interface to a powerful financial innovation platform, providing a seamless and intuitive experience for designing advanced financial systems.
 */
export const WorldBuilderView: React.FC = () => {
    const { state, dispatch } = useAppContext();

    const currentViewComponent = useMemo(() => {
        switch (state.currentView) {
            case 'Dashboard':
                return <DashboardView />;
            case 'Project Editor':
                return <ProjectEditorView />;
            case 'Settings':
                return <SettingsView />;
            case 'Help':
                return <HelpView />;
            default:
                return <DashboardView />;
        }
    }, [state.currentView]);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h1 className="text-4xl font-extrabold text-cyan-400 tracking-wide">FinancialForge AI</h1>
                <nav className="flex space-x-4">
                    <TabButton active={state.currentView === 'Dashboard'} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'Dashboard' })}>Dashboard</TabButton>
                    <TabButton active={state.currentView === 'Project Editor'} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'Project Editor' })}>Blueprint Editor</TabButton>
                    <TabButton active={state.currentView === 'Settings'} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'Settings' })}>Settings</TabButton>
                    <TabButton active={state.currentView === 'Help'} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'Help' })}>Help</TabButton>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto py-8">
                {currentViewComponent}
            </main>

            <footer className="mt-12 text-center text-gray-500 text-sm border-t border-gray-800 pt-4">
                FinancialForge AI © {new Date().getFullYear()} - Powered by Google Gemini & Imagen. Crafting the Future of Finance.
            </footer>
        </div>
    );
};

/**
 * Wraps the main Financial Blueprint Designer component with the application's global state provider.
 * This ensures that all components within the designer have access to the shared application state.
 * Commercial value: Establishes a robust and consistent data layer for the entire design application, enabling seamless feature integration and scalability.
 */
const WrappedWorldBuilderView: React.FC = () => (
    <AppProvider>
        <WorldBuilderView />
    </AppProvider>
);

export default WrappedWorldBuilderView;