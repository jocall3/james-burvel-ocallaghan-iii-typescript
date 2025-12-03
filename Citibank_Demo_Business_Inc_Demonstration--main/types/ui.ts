// types/ui.ts

/**
 * @description Defines every possible view/page in the application.
 * This enum is the single source of truth for navigation state.
 */
export enum View {
    // Personal Finance
    Dashboard = 'dashboard',
    TheNexus = 'the-nexus', // The 27th Module
    Transactions = 'transactions',
    SendMoney = 'send-money',
    Budgets = 'budgets',
    Investments = 'investments',
    PortfolioExplorer = 'portfolio-explorer',
    FinancialGoals = 'financial-goals',
    RewardsHub = 'rewards-hub',
    CreditHealth = 'credit-health',
    
    // AI & Platform
    AIAdvisor = 'ai-advisor',
    QuantumWeaver = 'quantum-weaver',
    QuantumOracle = 'quantum-oracle',
    AIAdStudio = 'ai-ad-studio',
    
    // Advanced Features
    Crypto = 'crypto',
    Marketplace = 'marketplace',
    Personalization = 'personalization',
    CardCustomization = 'card-customization',
    
    // Corporate Finance
    CorporateDashboard = 'corporate-dashboard',
    PaymentOrders = 'payment-orders',
    Counterparties = 'counterparties',
    Invoices = 'invoices',
    Compliance = 'compliance',
    AnomalyDetection = 'anomaly-detection',
    Payroll = 'payroll',

    // System & Settings
    Security = 'security',
    OpenBanking = 'open-banking',
    APIStatus = 'api-status',
    TheWinningVision = 'the-winning-vision',
    Settings = 'settings',

    // Constitutional Modules
    TheCharter = 'the-charter',
    FractionalReserve = 'fractional-reserve',
    FinancialInstrumentForge = 'financial-instrument-forge',

    // --- NEW FRAMEWORK VIEWS ---
    AgentMarketplace = 'agent-marketplace',
    Orchestration = 'orchestration',
    DataMesh = 'data-mesh',
    DataCommons = 'data-commons',
    Mainframe = 'mainframe',
    AIGovernance = 'ai-governance',
    AIRiskRegistry = 'ai-risk-registry',
    OSPO = 'ospo',
    CiCd = 'cicd',
    Inventions = 'inventions',
    Roadmap = 'roadmap',
    Connect = 'connect',

    // Demo Bank Platform Suite (Legacy Naming)
    DemoBankSocial = 'db-social',
    DemoBankERP = 'db-erp',
    DemoBankCRM = 'db-crm',
    DemoBankAPIGateway = 'db-api-gateway',
    DemoBankGraphExplorer = 'db-graph-explorer',
    DemoBankDBQL = 'db-dbql',
    DemoBankCloud = 'db-cloud',
    DemoBankIdentity = 'db-identity',
    DemoBankStorage = 'db-storage',
    DemoBankCompute = 'db-compute',
    DemoBankAIPlatform = 'db-ai-platform',
    DemoBankMachineLearning = 'db-ml',
    DemoBankDevOps = 'db-devops',
    DemoBankSecurityCenter = 'db-security-center',
    DemoBankComplianceHub = 'db-compliance-hub',
    DemoBankAppMarketplace = 'db-app-marketplace',
    DemoBankEvents = 'db-events',
    DemoBankLogicApps = 'db-logic-apps',
    DemoBankFunctions = 'db-functions',
    DemoBankDataFactory = 'db-data-factory',
    DemoBankAnalytics = 'db-analytics',
    DemoBankBI = 'db-bi',
    DemoBankIoTHub = 'db-iot-hub',
    DemoBankMaps = 'db-maps',
    DemoBankCommunications = 'db-communications',
    DemoBankCommerce = 'db-commerce',
    DemoBankTeams = 'db-teams',

    // --- Mega Dashboard ---
    // Security & Identity
    SecurityAccessControls = 'md-sec-access-controls',
    SecurityRoleManagement = 'md-sec-role-management',
    SecurityAuditLogs = 'md-sec-audit-logs',
    SecurityFraudDetection = 'md-sec-fraud-detection',
    SecurityThreatIntelligence = 'md-sec-threat-intelligence',
    // Finance & Banking
    FinanceCardManagement = 'md-fin-card-management',
    FinanceLoanApplications = 'md-fin-loan-applications',
    FinanceMortgages = 'md-fin-mortgages',
    FinanceInsuranceHub = 'md-fin-insurance-hub',
    FinanceTaxCenter = 'md-fin-tax-center',
    // Advanced Analytics
    AnalyticsPredictiveModels = 'md-an-predictive-models',
    AnalyticsRiskScoring = 'md-an-risk-scoring',
    AnalyticsSentimentAnalysis = 'md-an-sentiment-analysis',
    AnalyticsDataLakes = 'md-an-data-lakes',
    AnalyticsDataCatalog = 'md-an-data-catalog',
    // User & Client Tools
    UserClientOnboarding = 'md-uc-client-onboarding',
    UserClientKycAml = 'md-uc-kyc-aml',
    UserClientUserInsights = 'md-uc-user-insights',
    UserClientFeedbackHub = 'md-uc-feedback-hub',
    UserClientSupportDesk = 'md-uc-support-desk',
    // Developer & Integration
    DeveloperSandbox = 'md-dev-sandbox',
    DeveloperApiKeys = 'md-dev-api-keys',
    DeveloperSdkDownloads = 'md-dev-sdk-downloads',
    DeveloperWebhooks = 'md-dev-webhooks',
    DeveloperCliTools = 'md-dev-cli-tools',
    DeveloperExtensions = 'md-dev-extensions',
    // Ecosystem & Connectivity
    EcosystemPartnerHub = 'md-eco-partner-hub',
    EcosystemAffiliates = 'md-eco-affiliates',
    EcosystemIntegrationsMarketplace = 'md-eco-integrations-marketplace',
    EcosystemCrossBorderPayments = 'md-eco-cross-border-payments',
    EcosystemMultiCurrency = 'md-eco-multi-currency',
    // Digital Assets & Web3
    DigitalAssetsNftVault = 'md-da-nft-vault',
    DigitalAssetsTokenIssuance = 'md-da-token-issuance',
    DigitalAssetsSmartContracts = 'md-da-smart-contracts',
    DigitalAssetsDaoGovernance = 'md-da-dao-governance',
    DigitalAssetsOnChainAnalytics = 'md-da-on-chain-analytics',
    // Business & Growth
    BusinessSalesPipeline = 'md-bg-sales-pipeline',
    BusinessMarketingAutomation = 'md-bg-marketing-automation',
    BusinessGrowthInsights = 'md-bg-growth-insights',
    BusinessCompetitiveIntelligence = 'md-bg-competitive-intelligence',
    BusinessBenchmarking = 'md-bg-benchmarking',
    // Regulation & Legal
    RegulationLicensing = 'md-rl-licensing',
    RegulationDisclosures = 'md-rl-disclosures',
    RegulationLegalDocs = 'md-rl-legal-docs',
    RegulationRegulatorySandbox = 'md-rl-regulatory-sandbox',
    RegulationConsentManagement = 'md-rl-consent-management',
    // Infra & Ops
    InfraContainerRegistry = 'md-io-container-registry',
    InfraApiThrottling = 'md-io-api-throttling',
    InfraObservability = 'md-io-observability',
    InfraIncidentResponse = 'md-io-incident-response',
    InfraBackupRecovery = 'md-io-backup-recovery',

    // Constitutional Articles
    Article1 = 'article-1', Article2 = 'article-2', Article3 = 'article-3', Article4 = 'article-4', Article5 = 'article-5',
    
    // -- Blueprints --
    CrisisAIManager = 'bp-crisis-ai-manager',
    CognitiveLoadBalancer = 'bp-cognitive-load-balancer',
    HolographicMeetingScribe = 'bp-holographic-scribe',
    QuantumProofEncryptor = 'bp-quantum-encryptor',
    EtherealMarketplace = 'bp-ethereal-marketplace',
    AdaptiveUITailor = 'bp-adaptive-ui-tailor',
    UrbanSymphonyPlanner = 'bp-urban-symphony-planner',
    PersonalHistorianAI = 'bp-personal-historian',
    DebateAdversary = 'bp-debate-adversary',
    CulturalAssimilationAdvisor = 'bp-cultural-advisor',
    DynamicSoundscapeGenerator = 'bp-soundscape-generator',
    EmergentStrategyWargamer = 'bp-strategy-wargamer',
    EthicalGovernor = 'bp-ethical-governor',
    QuantumEntanglementDebugger = 'bp-quantum-debugger',
    LinguisticFossilFinder = 'bp-linguistic-fossil-finder',
    ChaosTheorist = 'bp-chaos-theorist',
    SelfRewritingCodebase = 'bp-self-rewriting-codebase',
}

/**
 * @description Defines the type of dynamic, reality-bending background effect.
 */
export type IllusionType = 'none' | 'aurora';


export enum WeaverStage {
    Pitch = 'pitch',
    Analysis = 'analysis',
    Test = 'test',
    FinalReview = 'final_review',
    Approved = 'approved',
    Error = 'error',
}
