```typescript
/**
 * This module orchestrates the design and simulation of next-generation financial infrastructure blueprints.
 * It is a core component for transforming abstract digital finance strategies into actionable, auditable, and high-value deployment plans.
 * Business impact: Enables enterprises and governments to rapidly prototype, optimize, and deploy secure, intelligent, and compliant financial systems,
 * significantly reducing time-to-market for new financial products, increasing operational efficiency, and ensuring regulatory adherence in a multi-trillion-dollar digital economy.
 * It provides a strategic advantage by simulating complex financial ecosystems before costly real-world implementation.
 */
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';

// --- Core Data Models: Expanded for hyper-granular digital finance infrastructure blueprinting ---

/**
 * Represents the detailed structure and characteristics of a digital financial infrastructure network.
 * This includes high-speed data rails, distributed ledger technology nodes, and secure digital identity integration points.
 * Each sub-section is further detailed to reflect real-world financial planning parameters and performance indicators.
 */
export interface InfrastructureNetwork {
  /** Detailed digital transaction routing metrics, including various rail types and their capacities. */
  digitalTransactionRails: {
    highFrequencyRails: { bandwidthGbps: number; latencyMs: number; throughputTxPerSec: number; securityProtocols: string[] }[];
    programmableValueRails: { ledgerCapacityGB: number; smartContractExecutionRateTxPerSec: number; immutabilityScore: number }[];
    identityVerificationRails: { queryResponseTimeMs: number; biometricIntegrationRatePercent: number; cryptographicStandard: string }[];
    totalBandwidthTbps: number;
    transactionDensityPerSqKm: number;
  };
  /** Digital assets and tokenization infrastructure, covering various classes and their operational metrics. */
  digitalAssetTokenization: {
    tokenIssuancePlatforms: { count: number; assetClassesSupported: string[]; dailyIssuanceVolumeUSD: number; complianceScore: number; smartContractAuditLogs: string[] }[];
    nftLedgers: { totalUniqueAssets: number; transactionVolumeUSD: number; royaltiesEnforcementRate: number; interoperabilityScore: number }[];
    stablecoinGateways: { count: number; supportedCurrencies: string[]; dailySettlementVolumeUSD: number }[];
    cbdcIntegrationPoints: { count: number; networkLatencyMs: number; participantCount: number }[];
    totalTokenizedValueUSD: number;
    auditabilityScore: number;
    regulatoryComplianceIndex: number; // How well different asset classes comply
  };
  /** Critical utility infrastructure metrics for powering decentralized financial systems, ensuring resilience and sustainability. */
  dataCenterAndEnergyGrid: {
    computeCapacityPetaflops: number;
    storageCapacityPetaBytes: number;
    energyEfficiencyPUE: number; // Power Usage Effectiveness
    renewableEnergySupplyPercent: number; // % energy from renewables
    gridResilienceForDLTIndex: number; // Specific index for DLT uptime
    cyberSecurityPostureIndex: number; // Comprehensive security score
    backupPowerAutonomyHours: number;
  };
  /** Agentic intelligence and secure communication network integration. */
  agenticNetworkConnectivity: {
    secureMessagingProtocols: string[];
    agentNodeDensityPerSqKm: number;
    realTimeDecisionLatencyMs: number;
    federatedLearningCapability: boolean;
    digitalIdentityVerificationRate: number;
  };
  financialInfrastructureMaturityIndex: number; // Overall index
}

/**
 * Detailed profile of ESG (Environmental, Social, Governance) impact zones within the financial ecosystem blueprint,
 * crucial for sustainable finance and regulatory reporting. Includes green bond eligibility, social impact metrics, and governance overlays.
 */
export interface EsgImpactProfile {
  totalEsgInvestmentAreaSqKm: number; // Area influenced by ESG investments
  percentageOfProjectArea: number;
  greenBondEligibility: { count: number; avgValueMillionsUSD: number; focusAreas: string[]; annualEnvironmentalImpactReductionScore: number }[];
  socialImpactZones: { count: number; totalBeneficiaries: number; financialInclusionScore: number; communityEngagementScore: number }[];
  governanceComplianceOverlays: { type: string; areaSqKm: number; enforcementScore: number; auditFrequency: string }[];
  sustainableFinanceIndex: number;
  carbonOffsetPotentialTonsPerYear: number;
  digitalEthicsComplianceScore: number; // For AI and data usage
  socialEquityInvestmentScore: number; // Quality and quantity of social finance initiatives
}

/**
 * Detailed regulatory zoning and digital asset allocation, crucial for compliant financial infrastructure deployment and innovation control.
 * Breaks down digital asset use into very specific categories and sub-categories.
 */
export interface RegulatoryZoningDetails {
  digitalAssetZones: {
    securityTokenZones: { areaSqKm: number; registeredIssuances: number; avgMarketCapUSD: number };
    utilityTokenZones: { areaSqKm: number; activeProjects: number; dailyTxVolumeUSD: number };
    nftDigitalArtZones: { areaSqKm: number; uniqueCreators: number; avgRoyaltyYieldPercent: number };
    mixedDigitalAssetZones: { areaSqKm: number; interoperabilityIndex: number };
    totalDigitalAssetZoneAreaSqKm: number;
    avgTokenMarketCapIndex: number;
  };
  financialInnovationHubs: {
    regulatorySandboxes: { areaSqKm: number; authorizedProjects: number; successRatePercent: number };
    fintechLabs: { areaSqKm: number; startupCount: number; patentFilingRate: number };
    totalInnovationAreaSqKm: number;
    innovationVelocityIndex: number;
  };
  complianceCorridors: {
    amlKycIntegration: { areaSqKm: number; transactionMonitoringEfficiencyPercent: number };
    dataPrivacyZones: { areaSqKm: number; dataEncryptionStandard: string; privacyAuditScore: number };
    crossBorderSettlementZones: { areaSqKm: number; transactionVolumeUSD: number };
    totalComplianceCorridorAreaSqKm: number;
  };
  agenticControlZones: {
    autonomousFinanceZones: { areaSqKm: number; activeAgents: number; riskControlScore: number };
    governanceEnforcementZones: { areaSqKm: number; policyAdherenceRate: number };
    totalAgenticControlAreaSqKm: number;
  };
  specialEconomicDigitalZones: { type: string; areaSqKm: number; purpose: string; regulatoryExemptions: string }[];
  digitalSovereigntyBoundaryKm: number; // Conceptual boundary for digital jurisdiction
  digitalLicenseIssuanceRate: number; // Licenses per 1000 financial entities/year
}

/**
 * Comprehensive user and entity profile, including digital identity and financial behavior trends.
 * Crucial for personalized financial services and risk management.
 */
export interface DigitalIdentityProfile {
  totalRegisteredEntities: number;
  identityVerificationRatePerSec: number;
  kycLevelDistribution: { 'L1-basic': number; 'L2-standard': number; 'L3-enhanced': number; averageKycScore: number }; // percentages and median
  transactionBehaviorAnalytics: { highValue: number; highFrequency: number; lowRisk: number; fraudDetectionRate: number };
  digitalAdoptionRatePercent: number;
  crossBorderTransactionIndex: number;
  agenticIdentityDiversityIndex: number; // Diversity of agent roles
  securityCredentialStrengthDistribution: { basic: number; MFA: number; biometric: number; quantumResistant: number };
  financialLiteracyScoreAvg: number;
}

/**
 * Detailed report on the financial system's operational and environmental impact, and sustainability metrics.
 * Focuses on energy consumption, data integrity, and resilience against systemic shocks.
 */
export interface OperationalSustainabilityReport {
  dlcEnergyConsumptionPerTxKWh: number; // Distributed Ledger Consumption
  totalAnnualEnergyConsumptionGWh: number;
  dataIntegrityViolationRate: number; // Lower is better
  transactionFinalityLatencyMs: number; // Lower is better
  renewableEnergySourceIntegrationPercent: number; // Percentage of energy from renewables for infrastructure
  systemUptimePercent: number; // Reflects overall reliability
  carbonNeutralityTargetYear: number;
  cyberResilienceRating: 'low' | 'medium' | 'high' | 'critical';
  algorithmicBiasMitigationIndex: number; // For agentic systems
  dataSovereigntyComplianceIndex: number; // Added here for comprehensive environmental context
}

/**
 * Financial health and market indicators, critical for ecosystem stability and growth.
 * Covers liquidity, market depth, regulatory stability, and investor confidence.
 */
export interface FinancialMarketIndicators {
  digitalAssetLiquidityIndex: number;
  defiMarketCapGrowthPercent: number;
  stablecoinVelocityRate: number;
  regulatoryStabilityIndex: number; // Composite score of policy clarity and enforcement
  investorConfidenceIndex: number; // Composite score of market sentiment
  financialProductInnovationRate: number; // New products per quarter
  cybersecurityIncidentFrequencyPerYear: number;
  fraudDetectionEfficiencyPercent: number;
  systemicRiskFactor: number; // Based on interconnectedness and single points of failure
  crossBorderPaymentEfficiencyScore: number;
  financialInclusionProgressRate: number;
  programmableMoneyAdoptionIndex: number;
}

/**
 * Characterization of the system's operational and audit environment.
 * Helps in designing transparent and auditable financial systems.
 */
export interface OperationalAuditLandscape {
  auditTrailImmutabilityScore: number; // Score for cryptographic integrity of logs
  realTimeMonitoringCoveragePercent: number; // Percentage of transactions/events monitored
  governancePolicyEnforcementRate: number; // % of policies successfully enforced
  anomalyDetectionAccuracyPercent: number; // Accuracy of AI agents detecting anomalies
  messageIntegrityVerificationRate: number;
  concurrencyControlEfficiencyIndex: number;
  transactionReplayProtectionStatus: 'active' | 'passive' | 'none';
  idempotencyCoveragePercent: number; // % of critical operations that are idempotent
}

/**
 * Detailed digital value flow and transaction routing analysis for the financial infrastructure blueprint.
 * Crucial for optimizing settlement systems and reducing latency.
 */
export interface DigitalValueFlowAnalysis {
  peakTransactionVolumePerSec: number;
  realTimeSettlementRatePercent: number; // % of transactions settled in real-time
  crossChainInteroperabilityScore: 'low' | 'medium' | 'high' | 'excellent';
  averageTransactionLatencyMs: number;
  transactionThroughputCapacityTxPerSec: number;
  multiRailRoutingEfficiencyIndex: number; // How well the routing layer optimizes
  fraudPreventionBlockingRatePercent: number;
  predictiveRoutingAccuracyPercent: number; // Accuracy of choosing optimal rails
}

/**
 * Represents a full Financial Infrastructure Blueprint generated by the Urban Symphony Planner AI.
 * Now vastly expanded to include all detailed sub-interfaces, reflecting a comprehensive financial system.
 */
export interface FinancialInfrastructureBlueprint {
  blueprintId: string;
  name: string;
  description: string;
  timestamp: string;
  version: number;
  architectureDiagramUrl: string; // URL to a top-down system architecture image
  marketAdaptabilityScore: number; // How well elements adapt to market changes (0-1)
  operationalEfficiencyScore: number; // Resource use, transaction flow, service delivery (0-1)
  financialInclusionScore: number; // Access to financial services for all entities (0-1)
  overallSustainabilityScore: number; // Environmental, social, economic sustainability (0-1)
  systemicResilienceScore: number; // Ability to withstand and recover from shocks (0-1)
  innovationPotentialScore: number; // Integration of new tech and progressive policies (0-1)

  infrastructure: InfrastructureNetwork;
  esgImpact: EsgImpactProfile;
  regulatoryZoning: RegulatoryZoningDetails;
  digitalIdentity: DigitalIdentityProfile;
  operationalSustainability: OperationalSustainabilityReport;
  financialMarket: FinancialMarketIndicators;
  operationalAudit: OperationalAuditLandscape;
  digitalValueFlow: DigitalValueFlowAnalysis;

  // New metrics for visualization layers
  dataLayers: {
    digitalAssetDistributionMap: string; // URL to asset density heatmap image
    programmableValueRailsMap: string; // URL to programmable value rails image
    esgInvestmentOverlayMap: string; // URL to ESG overlay image
    agentActivityHeatmap: string; // URL to agent activity heatmap image
    digitalIdentityVerificationMap: string; // URL to digital identity verification map
    financialInnovationZonesMap: string; // URL to map of innovation hubs
    cyberSecurityRiskMap: string; // URL to map of cyber security risk hotspots
    realTimeSettlementFlowMap: string; // URL to settlement flow map
    dlcEnergyConsumptionMap: string; // URL to DLT energy consumption map
  };
  keyStrategicRecommendations: string[];
  criticalWarnings: string[];
  totalInvestmentEstimateMillionsUSD: number;
  deploymentPhases: {
    phaseName: string;
    durationMonths: number;
    budgetMillionsUSD: number;
    status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
    milestones: { name: string; targetDate: string; completionPercent: number; dependencies: string[] }[];
  }[];
  riskAssessment: { type: 'cybersecurity' | 'financial' | 'regulatory' | 'operational'; severity: 'low' | 'medium' | 'high'; description: string; mitigationStrategy: string }[];
  stakeholderFeedbackSummary: { positive: string[]; negative: string[]; actionItems: string[] };
}

/**
 * User-defined constraints for generating and refining financial infrastructure blueprints.
 * Expanded with more precise controls and options for strategic financial planning.
 */
export interface DesignConstraints {
  targetMarketEntities: { min: number; max: number; targetDigitalAdoptionRatePercent: number };
  deploymentScopeSqKm: { min: number; max: number; preferredArchitectureTopology: 'centralized' | 'decentralized' | 'hybrid' };
  esgInvestmentTargetPercent: number;
  realTimeSettlementCoverageTargetPercent: number;
  carbonNeutralityTargetYear: number;
  financialInclusionTargetIndex: number;
  regulatoryPreferences: {
    digitalAssetClassificationPreference: 'security-token-focused' | 'utility-token-focused' | 'nft-focused' | 'mixed';
    innovationHubFocus: 'regulatory-sandbox' | 'fintech-lab' | 'defi-focused';
    complianceStrictness: 'low' | 'medium' | 'high'; // How strictly compliance is enforced
  };
  dlcOptimizationFocus: 'energy-efficiency' | 'throughput' | 'security' | 'cost';
  socioEconomicFinancialGoals: {
    financialLiteracyImprovementPercent: number;
    microfinanceUptakeImprovementPercent: number;
    defiIntegrationEmphasis: 'low' | 'medium' | 'high';
    socialEquityInvestmentTargetIndex: number;
  };
  totalInvestmentCapMillionsUSD: number;
  deploymentTimelineMonths: number;
  criticalDeploymentZones: { name: string; type: 'digital-asset' | 'innovation-hub' | 'compliance' | 'agentic-control'; coordinates: string; investmentIntensity: 'low' | 'medium' | 'high' }[];
  cyberResilienceTargetRating: 'low' | 'medium' | 'high' | 'critical';
  dataSovereigntyComplianceLevel: 'local' | 'regional' | 'global';
  agenticAutomationTargetPercent: number;
  stakeholderEngagementStrategy: 'online-platform' | 'regulatory-workshops' | 'hybrid';
  disasterRecoveryStrategies: string[]; // e.g., 'multi-region failover', 'cold storage backups', 'immutable audit logs'
}

/**
 * Metadata for a financial infrastructure project, managing its name, history, and associated blueprints.
 */
export interface ProjectMetadata {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  currentBlueprintId: string | null; // ID of the currently active blueprint for this project
  blueprintHistory: { blueprintId: string; timestamp: string; notes: string; constraintsUsed: DesignConstraints }[];
  collaborators: { userId: string; role: 'viewer' | 'editor' | 'auditor' }[]; // Collaboration with role-based permissions
  status: 'active' | 'archived' | 'on-hold' | 'pending-approval';
  tags: string[];
  financialApprovalStatus: 'approved' | 'pending' | 'rejected'; // Added for financial context
  riskRating: 'low' | 'medium' | 'high' | 'critical'; // Added for financial context
}

/**
 * User profile with preferences, access levels, and KYC/AML status.
 * This is integral to the Digital Identity and Trust Layer, ensuring secure access and operations within the platform.
 */
export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  organization: string;
  preferences: {
    defaultCurrencyDisplay: 'USD' | 'EUR' | 'GBP';
    dashboardTheme: 'light' | 'dark';
    notificationSettings: { email: boolean; inApp: boolean; sms: boolean };
    dashboardLayout: 'compact' | 'expanded';
    dataPrivacyLevel: 'standard' | 'enhanced' | 'strict';
  };
  accessLevel: 'viewer' | 'editor' | 'admin' | 'super-admin' | 'compliance-officer' | 'security-auditor';
  kycLevel: 'L1' | 'L2' | 'L3'; // Know Your Customer verification level
  amlStatus: 'clean' | 'flagged' | 'under-review'; // Anti-Money Laundering status
  lastLogin: string;
}

// --- Mock API Service: Simulates a robust backend for handling complex digital finance infrastructure data ---
/**
 * `UrbanSymphonyApiService` provides a mock backend for managing financial infrastructure projects,
 * blueprints, user profiles, and simulating advanced AI planning and financial operations.
 * It stores data in-memory, reflecting a high-performance, resilient internal state.
 */
export class UrbanSymphonyApiService {
  private static instance: UrbanSymphonyApiService;
  private projects: ProjectMetadata[] = [];
  private blueprints: { [blueprintId: string]: FinancialInfrastructureBlueprint } = {};
  private users: { [userId: string]: UserProfile } = {};
  private nextBlueprintId = 1;
  private nextProjectId = 1;

  /**
   * Constructs the mock API service, initializing with robust dummy data.
   * This setup ensures a stable environment for demonstration and local development, mimicking a live system's complexity.
   */
  private constructor() {
    this.users['user-001'] = {
      userId: 'user-001', username: 'Alexandria Veldt', email: 'alexandria.veldt@fintech.corp', organization: 'Quantum Financial Group',
      preferences: { defaultCurrencyDisplay: 'USD', dashboardTheme: 'dark', notificationSettings: { email: true, inApp: true, sms: false }, dashboardLayout: 'expanded', dataPrivacyLevel: 'enhanced' },
      accessLevel: 'admin', kycLevel: 'L3', amlStatus: 'clean', lastLogin: new Date().toISOString()
    };
    this.createMockProject("NextGen Digital Exchange", {
      targetMarketEntities: { min: 500000, max: 1000000, targetDigitalAdoptionRatePercent: 75 },
      deploymentScopeSqKm: { min: 100, max: 200, preferredArchitectureTopology: 'decentralized' },
      esgInvestmentTargetPercent: 30,
      realTimeSettlementCoverageTargetPercent: 95,
      carbonNeutralityTargetYear: 2030,
      financialInclusionTargetIndex: 0.85,
      regulatoryPreferences: { digitalAssetClassificationPreference: 'security-token-focused', innovationHubFocus: 'regulatory-sandbox', complianceStrictness: 'high' },
      dlcOptimizationFocus: 'security',
      socioEconomicFinancialGoals: { financialLiteracyImprovementPercent: 10, microfinanceUptakeImprovementPercent: 15, defiIntegrationEmphasis: 'high', socialEquityInvestmentTargetIndex: 0.9 },
      totalInvestmentCapMillionsUSD: 15000,
      deploymentTimelineMonths: 240,
      criticalDeploymentZones: [
        { name: 'Global Settlement Core', type: 'digital-asset', coordinates: 'lat:34.05,lon:-118.25', investmentIntensity: 'high' },
        { name: 'Regulatory Sandbox East', type: 'innovation-hub', coordinates: 'lat:34.06,lon:-118.28', investmentIntensity: 'medium' }
      ],
      cyberResilienceTargetRating: 'critical',
      dataSovereigntyComplianceLevel: 'regional',
      agenticAutomationTargetPercent: 70,
      stakeholderEngagementStrategy: 'hybrid',
      disasterRecoveryStrategies: ['multi-region failover', 'immutable audit logs']
    }, this.users['user-001'].userId);
  }

  /**
   * Returns the singleton instance of the UrbanSymphonyApiService.
   * This guarantees a single, consistent state across the application, crucial for maintaining data integrity in a financial system.
   * @returns {UrbanSymphonyApiService} The singleton instance.
   */
  public static getInstance(): UrbanSymphonyApiService {
    if (!UrbanSymphonyApiService.instance) {
      UrbanSymphonyApiService.instance = new UrbanSymphonyApiService();
    }
    return UrbanSymphonyApiService.instance;
  }

  // --- Mock Data Generation Helpers: Highly detailed and influenced by financial constraints ---

  /**
   * Generates a random score within a realistic financial performance range, biased towards higher scores.
   * Ensures simulated success rates align with high-grade enterprise expectations.
   * @returns {number} A score between 0.65 and 0.98.
   */
  private generateRandomScore(min: number = 0.65, max: number = 0.98): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  }

  /**
   * Generates mock financial infrastructure data, simulating influence by strategic constraints.
   * This module creates a deterministic simulation of network performance and capacity.
   * @param {DesignConstraints} constraints - The design constraints provided by the user, interpreted for financial infrastructure.
   * @returns {InfrastructureNetwork} A mock InfrastructureNetwork object.
   */
  private generateInfrastructureBasedOnConstraints(constraints: DesignConstraints): InfrastructureNetwork {
    const settlementInfluence = constraints.realTimeSettlementCoverageTargetPercent / 100;
    const computeDensity = (constraints.deploymentScopeSqKm.min + constraints.deploymentScopeSqKm.max) / 200 * (1 + settlementInfluence);

    return {
      digitalTransactionRails: {
        highFrequencyRails: [{ bandwidthGbps: Math.floor(computeDensity * 100) + 500, latencyMs: parseFloat((Math.random() * 0.5 + 0.1).toFixed(2)), throughputTxPerSec: Math.floor(computeDensity * 10000) + 50000, securityProtocols: ['TLS1.3', 'Post-Quantum Crypto'] }],
        programmableValueRails: [{ ledgerCapacityGB: Math.floor(computeDensity * 200) + 1000, smartContractExecutionRateTxPerSec: Math.floor(computeDensity * 500) + 2000, immutabilityScore: this.generateRandomScore(0.9, 0.99) }],
        identityVerificationRails: [{ queryResponseTimeMs: parseFloat((Math.random() * 1 + 5).toFixed(1)), biometricIntegrationRatePercent: Math.min(95, settlementInfluence * 100 * 0.8), cryptographicStandard: 'FIPS 140-3' }],
        totalBandwidthTbps: parseFloat((computeDensity * 0.5 + 1).toFixed(2)),
        transactionDensityPerSqKm: parseFloat((computeDensity * 5).toFixed(2)),
      },
      digitalAssetTokenization: {
        tokenIssuancePlatforms: [{ count: Math.floor(settlementInfluence * 5) + 2, assetClassesSupported: ['Equities', 'Real Estate', 'Commodities'], dailyIssuanceVolumeUSD: Math.floor(settlementInfluence * 100000000) + 50000000, complianceScore: this.generateRandomScore(0.85, 0.99), smartContractAuditLogs: ['audit_log_2023_Q4.json'] }],
        nftLedgers: [{ totalUniqueAssets: Math.floor(settlementInfluence * 50000) + 10000, transactionVolumeUSD: Math.floor(settlementInfluence * 1000000) + 200000, royaltiesEnforcementRate: this.generateRandomScore(0.8, 0.95), interoperabilityScore: this.generateRandomScore(0.6, 0.9) }],
        stablecoinGateways: [{ count: Math.floor(settlementInfluence * 3) + 1, supportedCurrencies: ['USD', 'EUR', 'JPY'], dailySettlementVolumeUSD: Math.floor(settlementInfluence * 500000000) + 100000000 }],
        cbdcIntegrationPoints: [{ count: Math.floor(settlementInfluence * 2) + 1, networkLatencyMs: parseFloat((Math.random() * 0.2 + 0.05).toFixed(2)), participantCount: Math.floor(settlementInfluence * 100) + 50 }],
        totalTokenizedValueUSD: Math.floor(settlementInfluence * 1000000000) + 500000000,
        auditabilityScore: this.generateRandomScore(0.8, 0.95),
        regulatoryComplianceIndex: this.generateRandomScore(0.8, 0.9),
      },
      dataCenterAndEnergyGrid: {
        computeCapacityPetaflops: Math.floor(constraints.targetMarketEntities.max / 100000 * 5) + 100,
        storageCapacityPetaBytes: Math.floor(constraints.targetMarketEntities.max / 100000 * 10) + 200,
        energyEfficiencyPUE: parseFloat((1.1 + (1 - (constraints.carbonNeutralityTargetYear - new Date().getFullYear()) / 30) * 0.2).toFixed(2)), // PUE lower is better
        renewableEnergySupplyPercent: Math.min(100, 50 + (1 - (constraints.carbonNeutralityTargetYear - new Date().getFullYear()) / 30) * 50),
        gridResilienceForDLTIndex: this.generateRandomScore(0.9, 0.99),
        cyberSecurityPostureIndex: this.generateRandomScore(0.85, 0.99),
        backupPowerAutonomyHours: Math.floor(Math.random() * 24) + 48,
      },
      agenticNetworkConnectivity: {
        secureMessagingProtocols: ['Noise', 'MLS', 'Signal'],
        agentNodeDensityPerSqKm: parseFloat((Math.random() * 10 + 5).toFixed(1)),
        realTimeDecisionLatencyMs: parseFloat((Math.random() * 2 + 10).toFixed(1)),
        federatedLearningCapability: true,
        digitalIdentityVerificationRate: this.generateRandomScore(0.9, 0.99),
      },
      financialInfrastructureMaturityIndex: this.generateRandomScore(0.7, 0.95),
    };
  }

  /**
   * Generates mock ESG impact data, influenced by sustainable finance targets.
   * This module ensures compliance with green finance principles and robust impact reporting.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {EsgImpactProfile} A mock EsgImpactProfile object.
   */
  private generateEsgImpactBasedOnConstraints(constraints: DesignConstraints): EsgImpactProfile {
    const totalEsgAreaSqKm = ((constraints.deploymentScopeSqKm.min + constraints.deploymentScopeSqKm.max) / 2) * (constraints.esgInvestmentTargetPercent / 100);
    const carbonOffset = Math.min(100000, constraints.esgInvestmentTargetPercent * 1000 + (2050 - constraints.carbonNeutralityTargetYear) * 500);
    return {
      totalEsgInvestmentAreaSqKm: parseFloat(totalEsgAreaSqKm.toFixed(1)),
      percentageOfProjectArea: constraints.esgInvestmentTargetPercent,
      greenBondEligibility: [{
        count: Math.floor(totalEsgAreaSqKm / 10) + 2,
        avgValueMillionsUSD: Math.floor(Math.random() * 50) + 10,
        focusAreas: ['renewable energy', 'sustainable transport', 'green buildings'],
        annualEnvironmentalImpactReductionScore: this.generateRandomScore(0.75, 0.95)
      }],
      socialImpactZones: [{ count: Math.floor(totalEsgAreaSqKm / 15) + 1, totalBeneficiaries: Math.floor(Math.random() * 200000) + 50000, financialInclusionScore: constraints.financialInclusionTargetIndex || this.generateRandomScore(), communityEngagementScore: this.generateRandomScore(0.7, 0.9) }],
      governanceComplianceOverlays: [{ type: 'Data Governance', areaSqKm: parseFloat((totalEsgAreaSqKm * 0.4).toFixed(1)), enforcementScore: this.generateRandomScore(0.9, 0.99), auditFrequency: 'quarterly' }],
      sustainableFinanceIndex: this.generateRandomScore(0.7, 0.95),
      carbonOffsetPotentialTonsPerYear: Math.floor(carbonOffset),
      digitalEthicsComplianceScore: this.generateRandomScore(0.8, 0.95),
      socialEquityInvestmentScore: constraints.socioEconomicFinancialGoals.socialEquityInvestmentTargetIndex || this.generateRandomScore(0.7, 0.9),
    };
  }

  /**
   * Generates mock regulatory zoning data, heavily influenced by user regulatory preferences.
   * This module provides a deterministic simulation of policy enforcement and digital asset classification.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {RegulatoryZoningDetails} A mock RegulatoryZoningDetails object.
   */
  private generateRegulatoryZoningBasedOnConstraints(constraints: DesignConstraints): RegulatoryZoningDetails {
    const baseArea = (constraints.deploymentScopeSqKm.min + constraints.deploymentScopeSqKm.max) / 2;
    let digitalAssetArea = baseArea * 0.4;
    let innovationArea = baseArea * 0.15;
    let complianceArea = baseArea * 0.2;
    let agenticArea = baseArea * 0.1;
    let remainingArea = baseArea - (digitalAssetArea + innovationArea + complianceArea + agenticArea);

    if (remainingArea < 0) { // Adjust proportionally if sum exceeds total area
      const factor = baseArea / (digitalAssetArea + innovationArea + complianceArea + agenticArea - remainingArea);
      digitalAssetArea *= factor;
      innovationArea *= factor;
      complianceArea *= factor;
      agenticArea *= factor;
      remainingArea = 0;
    }

    const { digitalAssetClassificationPreference, innovationHubFocus, complianceStrictness } = constraints.regulatoryPreferences;

    // Adjust digital asset splits based on preference
    let securityT = 0.4, utilityT = 0.3, nftD = 0.2, mixedD = 0.1;
    if (digitalAssetClassificationPreference === 'security-token-focused') { securityT = 0.6; utilityT = 0.2; nftD = 0.1; mixedD = 0.1; }
    else if (digitalAssetClassificationPreference === 'utility-token-focused') { securityT = 0.2; utilityT = 0.6; nftD = 0.1; mixedD = 0.1; }
    else if (digitalAssetClassificationPreference === 'nft-focused') { securityT = 0.1; utilityT = 0.2; nftD = 0.6; mixedD = 0.1; }

    // Adjust innovation hub splits
    let sandboxF = 0.5, fintechL = 0.3, defiF = 0.2;
    if (innovationHubFocus === 'regulatory-sandbox') { sandboxF = 0.7; fintechL = 0.2; defiF = 0.1; }
    else if (innovationHubFocus === 'fintech-lab') { sandboxF = 0.2; fintechL = 0.7; defiF = 0.1; }
    else if (innovationHubFocus === 'defi-focused') { sandboxF = 0.1; fintechL = 0.2; defiF = 0.7; }

    const getMarketCap = (area: number, type: string) => {
      if (type === 'security') return Math.floor(area * 10000000); // 10M USD/sqkm
      return Math.floor(area * 5000000); // 5M USD/sqkm
    };

    return {
      digitalAssetZones: {
        securityTokenZones: { areaSqKm: parseFloat((digitalAssetArea * securityT).toFixed(2)), registeredIssuances: Math.floor(digitalAssetArea * securityT * 50), avgMarketCapUSD: getMarketCap(digitalAssetArea * securityT, 'security') },
        utilityTokenZones: { areaSqKm: parseFloat((digitalAssetArea * utilityT).toFixed(2)), activeProjects: Math.floor(digitalAssetArea * utilityT * 200), dailyTxVolumeUSD: Math.floor(digitalAssetArea * utilityT * 500000) },
        nftDigitalArtZones: { areaSqKm: parseFloat((digitalAssetArea * nftD).toFixed(2)), uniqueCreators: Math.floor(digitalAssetArea * nftD * 100), avgRoyaltyYieldPercent: parseFloat((Math.random() * 5 + 5).toFixed(1)) },
        mixedDigitalAssetZones: { areaSqKm: parseFloat((digitalAssetArea * mixedD).toFixed(2)), interoperabilityIndex: this.generateRandomScore(0.6, 0.9) },
        totalDigitalAssetZoneAreaSqKm: parseFloat(digitalAssetArea.toFixed(2)),
        avgTokenMarketCapIndex: this.generateRandomScore(0.7, 0.95),
      },
      financialInnovationHubs: {
        regulatorySandboxes: { areaSqKm: parseFloat((innovationArea * sandboxF).toFixed(2)), authorizedProjects: Math.floor(innovationArea * sandboxF * 10), successRatePercent: parseFloat((Math.random() * 20 + 70).toFixed(1)) },
        fintechLabs: { areaSqKm: parseFloat((innovationArea * fintechL).toFixed(2)), startupCount: Math.floor(innovationArea * fintechL * 50), patentFilingRate: parseFloat((Math.random() * 0.5 + 0.1).toFixed(1)) },
        totalInnovationAreaSqKm: parseFloat(innovationArea.toFixed(2)),
        innovationVelocityIndex: this.generateRandomScore(0.7, 0.95),
      },
      complianceCorridors: {
        amlKycIntegration: { areaSqKm: parseFloat((complianceArea * 0.4).toFixed(2)), transactionMonitoringEfficiencyPercent: complianceStrictness === 'high' ? this.generateRandomScore(0.9, 0.99) : this.generateRandomScore(0.7, 0.85) },
        dataPrivacyZones: { areaSqKm: parseFloat((complianceArea * 0.3).toFixed(2)), dataEncryptionStandard: 'AES-256', privacyAuditScore: complianceStrictness === 'high' ? this.generateRandomScore(0.9, 0.99) : this.generateRandomScore(0.7, 0.85) },
        crossBorderSettlementZones: { areaSqKm: parseFloat((complianceArea * 0.3).toFixed(2)), transactionVolumeUSD: Math.floor(Math.random() * 10000000) + 1000000 },
        totalComplianceCorridorAreaSqKm: parseFloat(complianceArea.toFixed(2)),
      },
      agenticControlZones: {
        autonomousFinanceZones: { areaSqKm: parseFloat((agenticArea * 0.7).toFixed(2)), activeAgents: Math.floor(agenticArea * 0.7 * 100), riskControlScore: this.generateRandomScore(0.8, 0.95) },
        governanceEnforcementZones: { areaSqKm: parseFloat((agenticArea * 0.3).toFixed(2)), policyAdherenceRate: this.generateRandomScore(0.9, 0.99) },
        totalAgenticControlAreaSqKm: parseFloat(agenticArea.toFixed(2)),
      },
      specialEconomicDigitalZones: [],
      digitalSovereigntyBoundaryKm: parseFloat((Math.sqrt(baseArea / Math.PI) * 2).toFixed(1)), // Mock radial boundary
      digitalLicenseIssuanceRate: Math.floor(Math.random() * 10) + 50,
    };
  }

  /**
   * Generates mock digital identity and user data based on constraints.
   * This module ensures a robust simulation of identity management and financial behavior.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {DigitalIdentityProfile} A mock DigitalIdentityProfile object.
   */
  private generateDigitalIdentityBasedOnConstraints(constraints: DesignConstraints): DigitalIdentityProfile {
    const totalEntities = Math.floor(Math.random() * (constraints.targetMarketEntities.max - constraints.targetMarketEntities.min)) + constraints.targetMarketEntities.min;
    const kycL3Rate = Math.min(60, 20 + constraints.financialInclusionTargetIndex * 50);

    return {
      totalRegisteredEntities: totalEntities,
      identityVerificationRatePerSec: parseFloat((Math.random() * 50 + 100).toFixed(1)),
      kycLevelDistribution: { 'L1-basic': 0.15, 'L2-standard': 0.25, 'L3-enhanced': kycL3Rate / 100, averageKycScore: this.generateRandomScore(0.7, 0.9) },
      transactionBehaviorAnalytics: { highValue: 0.1, highFrequency: 0.3, lowRisk: 0.8, fraudDetectionRate: this.generateRandomScore(0.9, 0.99) },
      digitalAdoptionRatePercent: constraints.targetMarketEntities.targetDigitalAdoptionRatePercent || parseFloat((Math.random() * 15 + 60).toFixed(1)),
      crossBorderTransactionIndex: this.generateRandomScore(0.3, 0.7),
      agenticIdentityDiversityIndex: this.generateRandomScore(0.5, 0.9),
      securityCredentialStrengthDistribution: { basic: 0.2, MFA: 0.6, biometric: 0.2, quantumResistant: 0.05 },
      financialLiteracyScoreAvg: constraints.socioEconomicFinancialGoals.financialLiteracyImprovementPercent ? parseFloat((this.generateRandomScore(0.6, 0.8) + constraints.socioEconomicFinancialGoals.financialLiteracyImprovementPercent / 1000).toFixed(2)) : this.generateRandomScore(0.6, 0.8),
    };
  }

  /**
   * Generates mock operational sustainability data, considering energy and data integrity targets.
   * This module validates the platform's commitment to ESG and operational excellence.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {OperationalSustainabilityReport} A mock OperationalSustainabilityReport object.
   */
  private generateOperationalSustainabilityBasedOnConstraints(constraints: DesignConstraints): OperationalSustainabilityReport {
    const dlcEnergy = parseFloat((Math.random() * 0.005 + 0.001).toFixed(4)) * (constraints.dlcOptimizationFocus === 'energy-efficiency' ? 0.8 : 1);
    const renewableShare = Math.min(95, 40 + (2050 - constraints.carbonNeutralityTargetYear) * 2 + (constraints.dlcOptimizationFocus === 'energy-efficiency' ? 10 : 0));
    return {
      dlcEnergyConsumptionPerTxKWh: parseFloat(dlcEnergy.toFixed(4)),
      totalAnnualEnergyConsumptionGWh: parseFloat((dlcEnergy * ((constraints.targetMarketEntities.min + constraints.targetMarketEntities.max) / 2) * 365 * 1000).toFixed(0)), // Simplified
      dataIntegrityViolationRate: parseFloat((Math.random() * 0.001).toFixed(4)),
      transactionFinalityLatencyMs: parseFloat((Math.random() * 50 + 100).toFixed(1)),
      renewableEnergySourceIntegrationPercent: parseFloat(renewableShare.toFixed(1)),
      systemUptimePercent: this.generateRandomScore(0.99, 0.999),
      carbonNeutralityTargetYear: constraints.carbonNeutralityTargetYear,
      cyberResilienceRating: constraints.cyberResilienceTargetRating,
      algorithmicBiasMitigationIndex: this.generateRandomScore(0.8, 0.95),
      dataSovereigntyComplianceIndex: this.generateRandomScore(0.7, 0.95),
    };
  }

  /**
   * Generates mock financial market indicators, strongly tied to strategic financial goals.
   * This module provides a comprehensive overview of the market's health and potential for growth.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {FinancialMarketIndicators} A mock FinancialMarketIndicators object.
   */
  private generateFinancialMarketBasedOnConstraints(constraints: DesignConstraints): FinancialMarketIndicators {
    const { financialLiteracyImprovementPercent, microfinanceUptakeImprovementPercent, defiIntegrationEmphasis, socialEquityInvestmentTargetIndex } = constraints.socioEconomicFinancialGoals;

    return {
      digitalAssetLiquidityIndex: this.generateRandomScore(0.7, 0.9) + (defiIntegrationEmphasis === 'high' ? 0.1 : 0),
      defiMarketCapGrowthPercent: parseFloat((Math.random() * 0.1 + 0.05).toFixed(2)) + (defiIntegrationEmphasis === 'high' ? 0.05 : 0),
      stablecoinVelocityRate: parseFloat((Math.random() * 0.5 + 1.5).toFixed(2)),
      regulatoryStabilityIndex: this.generateRandomScore(0.7, 0.9) + (constraints.regulatoryPreferences.complianceStrictness === 'high' ? 0.05 : 0),
      investorConfidenceIndex: this.generateRandomScore(0.7, 0.9) + (constraints.cyberResilienceTargetRating === 'critical' ? 0.05 : 0),
      financialProductInnovationRate: parseFloat((Math.random() * 0.5 + 0.1).toFixed(2)),
      cybersecurityIncidentFrequencyPerYear: Math.floor(Math.random() * 5) + 1,
      fraudDetectionEfficiencyPercent: this.generateRandomScore(0.95, 0.99),
      systemicRiskFactor: parseFloat((Math.random() * 0.1 + 0.05).toFixed(2)),
      crossBorderPaymentEfficiencyScore: this.generateRandomScore(0.75, 0.95),
      financialInclusionProgressRate: parseFloat((this.generateRandomScore(0.05, 0.1) + microfinanceUptakeImprovementPercent / 1000).toFixed(2)),
      programmableMoneyAdoptionIndex: this.generateRandomScore(0.6, 0.9),
    };
  }

  /**
   * Generates mock operational audit landscape data.
   * This module provides a transparent and auditable overview of system integrity.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {OperationalAuditLandscape} A mock OperationalAuditLandscape object.
   */
  private generateOperationalAuditBasedOnConstraints(constraints: DesignConstraints): OperationalAuditLandscape {
    const enforcementRate = Math.min(99, 80 + (constraints.regulatoryPreferences.complianceStrictness === 'high' ? 15 : 0));
    return {
      auditTrailImmutabilityScore: this.generateRandomScore(0.9, 0.99),
      realTimeMonitoringCoveragePercent: parseFloat((Math.random() * 10 + 85).toFixed(1)),
      governancePolicyEnforcementRate: parseFloat(enforcementRate.toFixed(1)),
      anomalyDetectionAccuracyPercent: this.generateRandomScore(0.9, 0.99),
      messageIntegrityVerificationRate: this.generateRandomScore(0.95, 0.999),
      concurrencyControlEfficiencyIndex: this.generateRandomScore(0.8, 0.95),
      transactionReplayProtectionStatus: 'active',
      idempotencyCoveragePercent: parseFloat((Math.random() * 5 + 90).toFixed(1)),
    };
  }

  /**
   * Generates mock digital value flow data, influenced by real-time settlement and throughput targets.
   * This module ensures optimal transaction routing and settlement efficiency.
   * @param {DesignConstraints} constraints - The design constraints.
   * @returns {DigitalValueFlowAnalysis} A mock DigitalValueFlowAnalysis object.
   */
  private generateDigitalValueFlowBasedOnConstraints(constraints: DesignConstraints): DigitalValueFlowAnalysis {
    const settlementRate = Math.min(99, 70 + (constraints.realTimeSettlementCoverageTargetPercent * 0.2));
    const latency = Math.max(10, 200 - (constraints.realTimeSettlementCoverageTargetPercent * 1.5) - (constraints.dlcOptimizationFocus === 'throughput' ? 50 : 0));
    return {
      peakTransactionVolumePerSec: Math.floor(Math.random() * 5000) + 10000,
      realTimeSettlementRatePercent: parseFloat(settlementRate.toFixed(1)),
      crossChainInteroperabilityScore: settlementRate > 90 ? 'excellent' : settlementRate > 75 ? 'high' : 'medium',
      averageTransactionLatencyMs: parseFloat(latency.toFixed(1)),
      transactionThroughputCapacityTxPerSec: Math.floor(Math.random() * 20000) + 50000,
      multiRailRoutingEfficiencyIndex: this.generateRandomScore(0.7, 0.95),
      fraudPreventionBlockingRatePercent: this.generateRandomScore(0.9, 0.99),
      predictiveRoutingAccuracyPercent: this.generateRandomScore(0.8, 0.95),
    };
  }

  /**
   * Generates a complete mock Financial Infrastructure Blueprint based on given constraints and project name.
   * Integrates all the sub-generation functions and calculates overall strategic scores.
   * @param {DesignConstraints} constraints - The design constraints for the blueprint.
   * @param {string} projectName - The name of the associated project.
   * @param {string} currentBlueprintIdForRefinement - Optional. If refining, the ID of the blueprint being refined.
   * @returns {FinancialInfrastructureBlueprint} A comprehensive FinancialInfrastructureBlueprint object.
   */
  private generateMockBlueprint(constraints: DesignConstraints, projectName: string = "Generated Blueprint", currentBlueprintIdForRefinement?: string): FinancialInfrastructureBlueprint {
    const blueprintId = currentBlueprintIdForRefinement ? `${currentBlueprintIdForRefinement}-R${new Date().getTime()}` : `BPRINT-${this.nextBlueprintId++}`;
    const baseScore = this.generateRandomScore();
    const architectureDiagramIndex = Math.floor(Math.random() * 5);
    const architectureDiagrams = [
      "https://images.unsplash.com/photo-1629904853893-c2c6d482b7bd?q=80&w=2000", // Abstract tech/network
      "https://images.unsplash.com/photo-1596556535565-d6c7d3d1a0b3?q=80&w=2000", // Circuit board
      "https://images.unsplash.com/photo-1542345336-221c5b6b1078?q=80&w=2000", // City map-like (repurposed)
      "https://images.unsplash.com/photo-1582239100185-3b95a896d85a?q=80&w=2000", // Futuristic network (repurposed)
      "https://images.unsplash.com/photo-1518005213695-dd71f30e61d8?q=80&w=2000" // Data flow visualization
    ];

    const infrastructure = this.generateInfrastructureBasedOnConstraints(constraints);
    const esgImpact = this.generateEsgImpactBasedOnConstraints(constraints);
    const regulatoryZoning = this.generateRegulatoryZoningBasedOnConstraints(constraints);
    const digitalIdentity = this.generateDigitalIdentityBasedOnConstraints(constraints);
    const operationalSustainability = this.generateOperationalSustainabilityBasedOnConstraints(constraints);
    const financialMarket = this.generateFinancialMarketBasedOnConstraints(constraints);
    const operationalAudit = this.generateOperationalAuditBasedOnConstraints(constraints);
    const digitalValueFlow = this.generateDigitalValueFlowBasedOnConstraints(constraints);

    // Score calculations based on generated data and constraints
    let marketAdaptabilityScore = (financialMarket.digitalAssetLiquidityIndex + financialMarket.regulatoryStabilityIndex + financialMarket.financialProductInnovationRate) / 3;
    let operationalEfficiencyScore = (infrastructure.financialInfrastructureMaturityIndex + operationalSustainability.systemUptimePercent + digitalValueFlow.multiRailRoutingEfficiencyIndex) / 3;
    let financialInclusionScore = (esgImpact.financialInclusionScore + digitalIdentity.financialLiteracyScoreAvg) / 2;
    let sustainabilityScore = (esgImpact.sustainableFinanceIndex + operationalSustainability.renewableEnergySourceIntegrationPercent / 100 + operationalSustainability.dlcEnergyConsumptionPerTxKWh * -100) / 3; // Inverting dlcEnergy for score
    let systemicResilienceScore = (1 - financialMarket.systemicRiskFactor) + (operationalSustainability.cyberResilienceRating === 'critical' ? 0.1 : 0); // Simplified
    let innovationPotentialScore = (regulatoryZoning.financialInnovationHubs.innovationVelocityIndex + financialMarket.defiMarketCapGrowthPercent);

    marketAdaptabilityScore = parseFloat(Math.min(0.99, marketAdaptabilityScore + Math.random() * 0.1 - 0.05).toFixed(2));
    operationalEfficiencyScore = parseFloat(Math.min(0.99, operationalEfficiencyScore + Math.random() * 0.1 - 0.05).toFixed(2));
    financialInclusionScore = parseFloat(Math.min(0.99, financialInclusionScore + Math.random() * 0.1 - 0.05).toFixed(2));
    sustainabilityScore = parseFloat(Math.min(0.99, sustainabilityScore + Math.random() * 0.1 - 0.05).toFixed(2));
    systemicResilienceScore = parseFloat(Math.min(0.99, systemicResilienceScore + Math.random() * 0.1 - 0.05).toFixed(2));
    innovationPotentialScore = parseFloat(Math.min(0.99, innovationPotentialScore + Math.random() * 0.1 - 0.05).toFixed(2));

    const keyStrategicRecommendations: string[] = [];
    const criticalWarnings: string[] = [];

    if (marketAdaptabilityScore < 0.75) keyStrategicRecommendations.push("Enhance interoperability frameworks for emerging digital asset classes.");
    if (operationalEfficiencyScore < 0.7) criticalWarnings.push("Potential for transaction bottlenecks or system inefficiencies detected. Review rail capacity.");
    if (financialInclusionScore < 0.8) keyStrategicRecommendations.push("Invest in microfinance digital channels and financial literacy programs.");
    if (operationalSustainability.dlcEnergyConsumptionPerTxKWh > 0.003) criticalWarnings.push("High DLT energy consumption identified. Prioritize green computing initiatives.");
    if (digitalValueFlow.averageTransactionLatencyMs > 150) keyStrategicRecommendations.push("Implement low-latency routing algorithms and edge computing nodes.");

    return {
      blueprintId,
      name: `${projectName} - ${blueprintId}`,
      description: `A highly detailed financial infrastructure blueprint generated by the Urban Symphony AI, meticulously balancing sustainability, operational efficiency, and market adaptability. Based on strategic project constraints and comprehensive digital finance models.`,
      timestamp: new Date().toISOString(),
      version: currentBlueprintIdForRefinement ? (this.blueprints[currentBlueprintIdForRefinement]?.version || 0) + 1 : 1,
      architectureDiagramUrl: architectureDiagrams[architectureDiagramIndex],
      marketAdaptabilityScore,
      operationalEfficiencyScore,
      financialInclusionScore,
      overallSustainabilityScore: sustainabilityScore,
      systemicResilienceScore,
      innovationPotentialScore,
      infrastructure,
      esgImpact,
      regulatoryZoning,
      digitalIdentity,
      operationalSustainability,
      financialMarket,
      operationalAudit,
      digitalValueFlow,
      dataLayers: {
        digitalAssetDistributionMap: "https://via.placeholder.com/1200x800/8A2BE2/FFFFFF?text=Digital+Asset+Distribution+Map",
        programmableValueRailsMap: "https://via.placeholder.com/1200x800/1E90FF/FFFFFF?text=Programmable+Value+Rails+Map",
        esgInvestmentOverlayMap: "https://via.placeholder.com/1200x800/32CD32/FFFFFF?text=ESG+Investment+Overlay",
        agentActivityHeatmap: "https://via.placeholder.com/1200x800/FFD700/FFFFFF?text=Agent+Activity+Heatmap",
        digitalIdentityVerificationMap: "https://via.placeholder.com/1200x800/DAA520/FFFFFF?text=Digital+Identity+Verification+Map",
        financialInnovationZonesMap: "https://via.placeholder.com/1200x800/FF6347/FFFFFF?text=Financial+Innovation+Zones+Map",
        cyberSecurityRiskMap: "https://via.placeholder.com/1200x800/DC143C/FFFFFF?text=Cyber+Security+Risk+Map",
        realTimeSettlementFlowMap: "https://via.placeholder.com/1200x800/00CED1/FFFFFF?text=Real-Time+Settlement+Flow+Map",
        dlcEnergyConsumptionMap: "https://via.placeholder.com/1200x800/8B008B/FFFFFF?text=DLT+Energy+Consumption+Map",
      },
      keyStrategicRecommendations,
      criticalWarnings,
      totalInvestmentEstimateMillionsUSD: constraints.totalInvestmentCapMillionsUSD || Math.floor(Math.random() * 20000) + 5000,
      deploymentPhases: [
        {
          phaseName: 'Phase 1: Architecture Design & Regulatory Approval',
          durationMonths: 6, budgetMillionsUSD: 250, status: 'completed',
          milestones: [{ name: 'Core DLT Architecture Finalized', targetDate: '2024-12-31', completionPercent: 100, dependencies: [] }]
        },
        {
          phaseName: 'Phase 2: Digital Identity & Programmable Value Rail Deployment',
          durationMonths: 18, budgetMillionsUSD: 5000, status: 'in-progress',
          milestones: [{ name: 'Real-time Settlement Engine Integration', targetDate: '2025-06-30', completionPercent: 45, dependencies: [] }]
        },
        {
          phaseName: 'Phase 3: Agentic Intelligence & Market Integration',
          durationMonths: 12, budgetMillionsUSD: 1500, status: 'planned',
          milestones: [{ name: 'Autonomous Compliance Agent Go-Live', targetDate: '2025-03-31', completionPercent: 0, dependencies: ['Real-time Settlement Engine Integration'] }]
        },
        {
          phaseName: 'Phase 4: Global Expansion & Advanced Analytics',
          durationMonths: 24, budgetMillionsUSD: 3000, status: 'planned',
          milestones: [{ name: 'Cross-Border Digital Asset Gateway Activation', targetDate: '2026-09-30', completionPercent: 0, dependencies: ['Autonomous Compliance Agent Go-Live'] }]
        }
      ],
      riskAssessment: [
        { type: 'cybersecurity', severity: 'medium', description: 'Advanced persistent threats targeting digital assets.', mitigationStrategy: 'Implement quantum-resistant cryptography and real-time threat intelligence.' },
        { type: 'financial', severity: 'low', description: 'Potential for budget overruns in phase 2.', mitigationStrategy: 'Implement strict financial oversight and staged funding releases with performance-based incentives.' }
      ],
      stakeholderFeedbackSummary: {
        positive: ['Strong emphasis on systemic resilience.', 'Innovative approach to programmable value.'],
        negative: ['Concerns about initial high energy consumption of DLT.', 'Request for more granular audit capabilities at agent level.'],
        actionItems: ['Review DLT consensus mechanisms for energy efficiency.', 'Develop enhanced agent audit logging module.']
      }
    };
  }

  // --- API Methods (Asynchronous operations with mock delays) ---

  /**
   * Retrieves all active financial infrastructure projects from the mock database.
   * Ensures only relevant, actionable projects are presented to users.
   * @returns {Promise<ProjectMetadata[]>} A promise that resolves to an array of projects.
   */
  public async getProjects(): Promise<ProjectMetadata[]> {
    return new Promise(res => setTimeout(() => res([...this.projects.filter(p => p.status === 'active' || p.status === 'pending-approval')]), 500));
  }

  /**
   * Retrieves a single financial infrastructure project by its ID.
   * Provides granular access to project specifics, vital for ongoing management and auditing.
   * @param {string} projectId - The ID of the project to retrieve.
   * @returns {Promise<ProjectMetadata | undefined>} A promise that resolves to the project or undefined if not found.
   */
  public async getProjectById(projectId: string): Promise<ProjectMetadata | undefined> {
    return new Promise(res => setTimeout(() => res(this.projects.find(p => p.id === projectId)), 300));
  }

  /**
   * Creates a new financial infrastructure project with initial strategic constraints and associates it with a user.
   * This method initiates the lifecycle of a high-value digital finance deployment.
   * @param {string} name - The name of the new project.
   * @param {DesignConstraints} initialConstraints - The initial strategic design constraints for the project.
   * @param {string} userId - The ID of the user creating the project.
   * @returns {Promise<ProjectMetadata>} A promise that resolves to the newly created project.
   */
  public async createProject(name: string, initialConstraints: DesignConstraints, userId: string): Promise<ProjectMetadata> {
    return new Promise(res => {
      setTimeout(() => {
        const newProject: ProjectMetadata = {
          id: `PROJ-${this.nextProjectId++}`,
          name,
          description: `Strategic financial infrastructure deployment for '${name}' initiated by ${this.users[userId]?.username || 'System Admin'}.`,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          currentBlueprintId: null,
          blueprintHistory: [],
          collaborators: [{ userId: userId, role: 'admin' }],
          status: 'active',
          tags: ['new-deployment', 'digital-finance'],
          financialApprovalStatus: 'pending', // Default for new projects
          riskRating: 'medium' // Default for new projects
        };
        this.projects.push(newProject);

        // Generate an initial blueprint for the new project
        this.generateFinancialInfrastructureBlueprint(newProject.id, initialConstraints, newProject.name, userId).then(initialBlueprint => {
          newProject.currentBlueprintId = initialBlueprint.blueprintId;
          newProject.blueprintHistory.push({ blueprintId: initialBlueprint.blueprintId, timestamp: initialBlueprint.timestamp, notes: 'Initial blueprint generation', constraintsUsed: initialConstraints });
          res({ ...newProject });
        });
      }, 1500);
    });
  }

  /**
   * Updates an existing financial infrastructure project with new metadata.
   * Critical for agile project management and adapting to evolving market conditions or regulatory changes.
   * @param {string} projectId - The ID of the project to update.
   * @param {Partial<ProjectMetadata>} updates - The partial object containing fields to update.
   * @returns {Promise<ProjectMetadata | undefined>} A promise that resolves to the updated project or undefined.
   */
  public async updateProject(projectId: string, updates: Partial<ProjectMetadata>): Promise<ProjectMetadata | undefined> {
    return new Promise(res => {
      setTimeout(() => {
        const projectIndex = this.projects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
          this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            ...updates,
            lastModified: new Date().toISOString(),
          };
          res({ ...this.projects[projectIndex] });
        } else {
          res(undefined);
        }
      }, 700);
    });
  }

  /**
   * Deletes a financial infrastructure project by its ID, including all associated blueprints.
   * This is a sensitive operation requiring appropriate access controls and audit logging.
   * @param {string} projectId - The ID of the project to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if deleted, false otherwise.
   */
  public async deleteProject(projectId: string): Promise<boolean> {
    return new Promise(res => {
      setTimeout(() => {
        const initialLength = this.projects.length;
        this.projects = this.projects.filter(p => p.id !== projectId);
        Object.keys(this.blueprints).forEach(blueprintId => {
          // Naive way to link blueprints, in real app, projects would hold blueprint IDs.
          // This ensures all derived blueprints are removed with the parent project.
          if (blueprintId.startsWith(projectId.replace('PROJ-', 'BPRINT-'))) {
            delete this.blueprints[blueprintId];
          }
        });
        res(this.projects.length < initialLength);
      }, 1000);
    });
  }

  /**
   * Generates a new financial infrastructure blueprint based on provided strategic constraints for a specific project.
   * Simulates a complex AI-driven design and optimization process, crucial for competitive advantage.
   * @param {string} projectId - The ID of the project.
   * @param {DesignConstraints} constraints - The strategic design constraints for the new blueprint.
   * @param {string} blueprintName - The name for the new blueprint.
   * @param {string} userId - The ID of the user requesting the blueprint.
   * @returns {Promise<FinancialInfrastructureBlueprint>} A promise that resolves to the newly generated FinancialInfrastructureBlueprint.
   */
  public async generateFinancialInfrastructureBlueprint(projectId: string, constraints: DesignConstraints, blueprintName?: string, userId?: string): Promise<FinancialInfrastructureBlueprint> {
    return new Promise(res => setTimeout(() => {
      const project = this.projects.find(p => p.id === projectId);
      if (!project) throw new Error("Project not found for blueprint generation. Ensure project integrity.");

      console.log(`Simulating advanced AI financial infrastructure blueprinting for project ${projectId} with constraints:`, constraints);
      const newBlueprint = this.generateMockBlueprint(constraints, blueprintName || project.name);

      project.blueprintHistory.push({ blueprintId: newBlueprint.blueprintId, timestamp: newBlueprint.timestamp, notes: `Blueprint generated (v${newBlueprint.version}) by ${userId || 'System Agent'}`, constraintsUsed: constraints });
      project.currentBlueprintId = newBlueprint.blueprintId;
      project.lastModified = new Date().toISOString();

      this.blueprints[newBlueprint.blueprintId] = newBlueprint;
      res(newBlueprint);
    }, 7000)); // Simulate a longer AI generation process for complex financial architectures
  }

  /**
   * Retrieves a financial infrastructure blueprint by its ID.
   * Provides immediate access to comprehensive design specifications and performance metrics.
   * @param {string} blueprintId - The ID of the blueprint to retrieve.
   * @returns {Promise<FinancialInfrastructureBlueprint | undefined>} A promise that resolves to the FinancialInfrastructureBlueprint or undefined.
   */
  public async getFinancialInfrastructureBlueprintById(blueprintId: string): Promise<FinancialInfrastructureBlueprint | undefined> {
    return new Promise(res => setTimeout(() => res(this.blueprints[blueprintId]), 1000));
  }

  /**
   * Retrieves the history of blueprints for a given project.
   * Essential for auditing changes, understanding evolution, and supporting regulatory compliance.
   * @param {string} projectId - The ID of the project.
   * @returns {Promise<{ blueprintId: string; timestamp: string; notes: string; constraintsUsed: DesignConstraints }[]>} A promise resolving to the blueprint history.
   */
  public async getBlueprintHistory(projectId: string): Promise<{ blueprintId: string; timestamp: string; notes: string; constraintsUsed: DesignConstraints }[]> {
    return new Promise(res => {
      setTimeout(() => {
        const project = this.projects.find(p => p.id === projectId);
        res(project ? [...project.blueprintHistory] : []);
      }, 500);
    });
  }

  /**
   * Refines an existing financial infrastructure blueprint based on new modifications to strategic constraints.
   * This creates a new, optimized version of the blueprint, crucial for iterative development and adaptation.
   * @param {string} blueprintId - The ID of the blueprint to refine.
   * @param {DesignConstraints} modifications - The modified strategic constraints.
   * @param {string} userId - The ID of the user refining the blueprint.
   * @returns {Promise<FinancialInfrastructureBlueprint>} A promise resolving to the refined FinancialInfrastructureBlueprint.
   */
  public async refineFinancialInfrastructureBlueprint(blueprintId: string, modifications: DesignConstraints, userId: string): Promise<FinancialInfrastructureBlueprint> {
    return new Promise(res => setTimeout(() => {
      const existingBlueprint = this.blueprints[blueprintId];
      if (!existingBlueprint) throw new Error("Blueprint not found for refinement. Ensure blueprint integrity.");

      console.log(`Refining blueprint ${blueprintId} with modifications:`, modifications);
      const refinedBlueprint = this.generateMockBlueprint(modifications, existingBlueprint.name, existingBlueprint.blueprintId);
      refinedBlueprint.name = `${existingBlueprint.name} (Refined v${refinedBlueprint.version})`;
      refinedBlueprint.description = `Refined from version ${existingBlueprint.version} based on updated strategic constraints. ${modifications ? `Specific adjustments include: ${JSON.stringify(modifications)}` : ''}`;

      this.blueprints[refinedBlueprint.blueprintId] = refinedBlueprint;

      // Update the project's blueprint history
      const project = this.projects.find(p => p.currentBlueprintId === blueprintId || p.blueprintHistory.some(h => h.blueprintId === blueprintId));
      if (project) {
        project.blueprintHistory.push({ blueprintId: refinedBlueprint.blueprintId, timestamp: refinedBlueprint.timestamp, notes: `Blueprint refined from v${existingBlueprint.version} to v${refinedBlueprint.version} by ${userId || 'System Agent'}`, constraintsUsed: modifications });
        project.currentBlueprintId = refinedBlueprint.blueprintId;
        project.lastModified = new Date().toISOString();
      }

      res(refinedBlueprint);
    }, 10000)); // Simulate an even longer refinement process for advanced financial optimization
  }

  /**
   * Retrieves user profile by ID, including sensitive KYC/AML status.
   * Essential for access control, compliance, and personalized financial service delivery.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<UserProfile | undefined>} A promise resolving to the user profile.
   */
  public async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return new Promise(res => setTimeout(() => res(this.users[userId]), 300));
  }

  /**
   * Updates user profile, with implications for access levels and compliance.
   * Securely manages changes to user identity and preferences, critical for the Digital Identity Layer.
   * @param {string} userId - The ID of the user.
   * @param {Partial<UserProfile>} updates - The updates to apply.
   * @returns {Promise<UserProfile | undefined>} A promise resolving to the updated user profile.
   */
  public async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    return new Promise(res => setTimeout(() => {
      if (this.users[userId]) {
        this.users[userId] = { ...this.users[userId], ...updates, lastLogin: new Date().toISOString() };
        res({ ...this.users[userId] });
      } else {
        res(undefined);
      }
    }, 500));
  }

  /**
   * Simulates a comprehensive evaluation for a given financial infrastructure blueprint.
   * This critical module runs deep analytics on various aspects of the system, providing actionable intelligence.
   * @param {string} blueprintId - The ID of the blueprint to simulate.
   * @param {'financial_performance' | 'regulatory_compliance' | 'security_audit' | 'operational_resilience' | 'esg_impact'} type - The type of simulation.
   * @param {object} parameters - Additional simulation parameters.
   * @returns {Promise<any>} A promise resolving to mock simulation results, mimicking complex analytical reports.
   */
  public async runComprehensiveSimulation(blueprintId: string, type: 'financial_performance' | 'regulatory_compliance' | 'security_audit' | 'operational_resilience' | 'esg_impact', parameters: object): Promise<any> {
    return new Promise(res => setTimeout(() => {
      const blueprint = this.blueprints[blueprintId];
      if (!blueprint) throw new Error("Blueprint not found for simulation. Ensure blueprint integrity.");

      let results: any = {
        simulationId: `SIM-${blueprintId}-${type}-${new Date().getTime()}`,
        timestamp: new Date().toISOString(),
        blueprintVersion: blueprint.version,
        simulatedType: type,
        inputParameters: parameters,
        status: 'completed',
        details: {},
        warnings: [],
        recommendations: [],
        auditLogLink: `https://mock.audit.log/sim-${blueprintId}-${type}` // Mock audit log link
      };

      // Elaborate mock results based on simulation type
      switch (type) {
        case 'financial_performance':
          results.details = {
            roiProjectionPercent: parseFloat((Math.random() * 0.15 + 0.1).toFixed(2)),
            transactionCostReductionPercent: parseFloat((Math.random() * 0.1 + 0.05).toFixed(2)),
            marketShareGrowthProjectionPercent: parseFloat((Math.random() * 0.08 + 0.03).toFixed(2)),
            newRevenueStreamPotentialMillionsUSD: parseFloat((Math.random() * 500) + 100).toFixed(0),
            operationalCostSavingsMillionsUSD: parseFloat((Math.random() * 100) + 20).toFixed(0),
            defiTVLIncreaseProjection: parseFloat((Math.random() * 0.2 + 0.05).toFixed(2)), // Total Value Locked
            assetLiquidityImprovementIndex: parseFloat((blueprint.financialMarket.digitalAssetLiquidityIndex * 1.1).toFixed(2)),
            financialProductLaunchVelocity: parseFloat((Math.random() * 0.5 + 1.5).toFixed(1)), // Products per quarter
          };
          if (results.details.roiProjectionPercent < 0.12) results.warnings.push("ROI projection is modest, consider optimizing asset allocation.");
          results.recommendations.push("Explore tokenization of illiquid assets to unlock new capital.");
          break;
        case 'regulatory_compliance':
          results.details = {
            amlKycAdherenceRatePercent: parseFloat((Math.random() * 0.05 + 0.94).toFixed(2)),
            dataPrivacyStandardComplianceScore: parseFloat((Math.random() * 0.1 + 0.88).toFixed(2)),
            newRegulationReadinessScore: parseFloat((Math.random() * 0.1 + 0.8).toFixed(2)),
            sanctionScreeningEffectivenessPercent: parseFloat((Math.random() * 0.02 + 0.98).toFixed(2)),
            jurisdictionalOverlapRiskFactor: parseFloat((Math.random() * 0.1 + 0.02).toFixed(2)),
            auditTrailIntegrityVerificationStatus: 'Verified',
            regulatoryReportingAutomationRatePercent: parseFloat((Math.random() * 0.1 + 0.85).toFixed(2)),
            licensingComplianceScore: parseFloat((Math.random() * 0.05 + 0.9).toFixed(2)),
          };
          if (results.details.amlKycAdherenceRatePercent < 0.95) results.warnings.push("Sub-optimal AML/KYC adherence detected, reinforce identity verification protocols.");
          results.recommendations.push("Integrate autonomous compliance agents for real-time policy enforcement.");
          break;
        case 'security_audit':
          results.details = {
            vulnerabilityExposureScore: parseFloat((Math.random() * 0.2 + 0.05).toFixed(2)),
            threatDetectionLatencyMs: parseFloat((Math.random() * 5 + 10).toFixed(1)),
            incidentResponseTimeHours: parseFloat((Math.random() * 4) + 1).toFixed(1),
            cryptographicIntegrityScore: parseFloat((Math.random() * 0.05 + 0.95).toFixed(2)),
            ddosMitigationEffectivenessPercent: parseFloat((Math.random() * 0.05 + 0.95).toFixed(2)),
            zeroTrustArchitectureMaturity: 'High',
            dataBreachPreventionRatePercent: parseFloat((Math.random() * 0.02 + 0.98).toFixed(2)),
            agentSecurityPostureAssessment: 'Excellent',
          };
          if (results.details.vulnerabilityExposureScore > 0.1) results.warnings.push("Identified critical vulnerabilities, urgent patch deployment recommended.");
          results.recommendations.push("Conduct periodic red-team exercises and implement post-quantum cryptographic upgrades.");
          break;
        case 'operational_resilience':
          results.details = {
            recoveryTimeObjectiveHours: Math.floor(Math.random() * 4) + 1,
            recoveryPointObjectiveSeconds: Math.floor(Math.random() * 300) + 60,
            faultToleranceRating: 'Excellent',
            systemRollbackCapabilityStatus: 'Automated',
            dataReplicationFactor: 3,
            networkOutageImpactScore: parseFloat((Math.random() * 0.1 + 0.01).toFixed(2)),
            loadBalancingEfficiencyIndex: parseFloat((Math.random() * 0.1 + 0.85).toFixed(2)),
            idempotentOperationCoverage: parseFloat((blueprint.operationalAudit.idempotencyCoveragePercent * 1.05).toFixed(1)),
          };
          if (results.details.recoveryTimeObjectiveHours > 2) results.warnings.push("Recovery Time Objective (RTO) exceeds target, enhance failover automation.");
          results.recommendations.push("Implement geo-distributed active-active architecture for critical components.");
          break;
        case 'esg_impact':
          results.details = {
            carbonFootprintReductionPercent: parseFloat((Math.random() * 0.1 + 0.05).toFixed(2)),
            renewableEnergyConsumptionRate: parseFloat((Math.random() * 0.1 + 0.85).toFixed(2)),
            socialEquityInvestmentImpactScore: parseFloat((Math.random() * 0.1 + 0.8).toFixed(2)),
            governanceTransparencyIndex: parseFloat((Math.random() * 0.08 + 0.88).toFixed(2)),
            greenBondAllocationEfficiencyPercent: parseFloat((Math.random() * 0.1 + 0.8).toFixed(2)),
            ethicalAIFrameworkAdoption: 'High',
            communityDevelopmentFundAllocationMillionsUSD: parseFloat((Math.random() * 50) + 10).toFixed(0),
            diversityInclusionMetricsImprovementPercent: parseFloat((Math.random() * 0.05 + 0.02).toFixed(2)),
          };
          if (results.details.carbonFootprintReductionPercent < 0.08) results.warnings.push("Carbon footprint reduction is below target, accelerate green energy transition.");
          results.recommendations.push("Integrate ESG data into all financial product risk assessments and reporting.");
          break;
      }
      res(results);
    }, 5000)); // Simulate a long, complex simulation process for deep financial analytics
  }
}

/** Global instance of the mock API service. */
export const urbanSymphonyApi = UrbanSymphonyApiService.getInstance();

// --- Context for Global State Management: Centralized state for the entire financial infrastructure application ---

/**
 * Defines the shape of the application's global state, accessible via context.
 * Includes authenticated user profile, current financial infrastructure project,
 * active blueprint, and global loading status, crucial for consistent UI and data flow.
 */
interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  currentProject: ProjectMetadata | null;
  setCurrentProject: React.Dispatch<React.SetStateAction<ProjectMetadata | null>>;
  activeBlueprint: FinancialInfrastructureBlueprint | null;
  setActiveBlueprint: React.Dispatch<React.SetStateAction<FinancialInfrastructureBlueprint | null>>;
  isLoadingGlobal: boolean;
  setIsLoadingGlobal: React.Dispatch<React.SetStateAction<boolean>>;
}

/** React Context for managing global application state for financial infrastructure planning. */
export const UrbanSymphonyContext = createContext<AppContextType | undefined>(undefined);

/**
 * Custom hook to easily access the Urban Symphony application context.
 * This ensures type safety and prevents common usage errors, centralizing data access patterns.
 * @returns {AppContextType} The application context.
 */
export const useUrbanSymphony = () => {
  const context = useContext(UrbanSymphonyContext);
  if (!context) {
    throw new Error('useUrbanSymphony must be used within an UrbanSymphonyProvider. This indicates a critical state management misconfiguration.');
  }
  return context;
};

/**
 * Provides the global state to its children components using React Context.
 * Initializes the default user, and attempts to load an initial project/blueprint,
 * establishing the foundational operational context for the entire platform.
 */
export const UrbanSymphonyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const storedUser = localStorage.getItem('usp-currentUser');
      return storedUser ? JSON.parse(storedUser) : {
        userId: 'user-001', username: 'Alexandria Veldt', email: 'alexandria.veldt@fintech.corp', organization: 'Quantum Financial Group',
        preferences: { defaultCurrencyDisplay: 'USD', dashboardTheme: 'dark', notificationSettings: { email: true, inApp: true, sms: false }, dashboardLayout: 'expanded', dataPrivacyLevel: 'enhanced' },
        accessLevel: 'admin', kycLevel: 'L3', amlStatus: 'clean', lastLogin: new Date().toISOString()
      };
    } catch (e) {
      console.error("Failed to parse user from localStorage, using default profile. Error:", e);
      return {
        userId: 'user-001', username: 'Alexandria Veldt', email: 'alexandria.veldt@fintech.corp', organization: 'Quantum Financial Group',
        preferences: { defaultCurrencyDisplay: 'USD', dashboardTheme: 'dark', notificationSettings: { email: true, inApp: true, sms: false }, dashboardLayout: 'expanded', dataPrivacyLevel: 'enhanced' },
        accessLevel: 'admin', kycLevel: 'L3', amlStatus: 'clean', lastLogin: new Date().toISOString()
      };
    }
  });
  const [currentProject, setCurrentProject] = useState<ProjectMetadata | null>(null);
  const [activeBlueprint, setActiveBlueprint] = useState<FinancialInfrastructureBlueprint | null>(null);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

  /** Effect to persist user settings to localStorage, ensuring consistent user experience across sessions. */
  useEffect(() => {
    localStorage.setItem('usp-currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  /** Effect to load initial project/blueprint data on component mount, establishing the platform's initial state. */
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingGlobal(true);
      try {
        const projects = await urbanSymphonyApi.getProjects();
        if (projects.length > 0) {
          const firstProject = projects[0];
          setCurrentProject(firstProject);
          if (firstProject.currentBlueprintId) {
            const blueprint = await urbanSymphonyApi.getFinancialInfrastructureBlueprintById(firstProject.currentBlueprintId);
            setActiveBlueprint(blueprint || null);
          }
        }
      } catch (error) {
        console.error("Failed to load initial project data:", error);
      } finally {
        setIsLoadingGlobal(false);
      }
    };
    loadInitialData();
  }, []);

  /** Memoized context value to prevent unnecessary re-renders, optimizing performance for a data-intensive application. */
  const contextValue = useMemo(() => ({
    currentUser, setCurrentUser,
    currentProject, setCurrentProject,
    activeBlueprint, setActiveBlueprint,
    isLoadingGlobal, setIsLoadingGlobal,
  }), [currentUser, currentProject, activeBlueprint, isLoadingGlobal]);

  return (
    <UrbanSymphonyContext.Provider value={contextValue}>
      {children}
    </UrbanSymphonyContext.Provider>
  );
};

// --- Helper Components & Utilities: Reusable UI elements for financial dashboard consistency ---

/**
 * A generic loading spinner component with an optional message.
 * Conveys system activity during critical financial infrastructure operations.
 * @param {object} props - The component props.
 * @param {string} [props.message="Processing Request..."] - The message to display alongside the spinner.
 * @returns {JSX.Element} The loading spinner JSX.
 */
export const ExportedLoadingSpinner: React.FC<{ message?: string }> = ({ message = "Processing Request..." }) => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mr-3"></div>
    <p className="text-lg text-gray-400">{message}</p>
  </div>
);

/**
 * Displays a critical financial or operational score with color coding based on its value.
 * Provides immediate visual feedback on system health and performance.
 * @param {object} props - The component props.
 * @param {string} props.label - The label for the score (e.g., "Market Adaptability Score").
 * @param {number} props.score - The numeric score (0-1).
 * @returns {JSX.Element} The score display JSX.
 */
export const ExportedScoreDisplay: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  const scoreColor = score >= 0.9 ? 'text-green-400' : score >= 0.75 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="text-center p-3 bg-gray-700 rounded-md border border-gray-600 shadow-sm">
      <p className={`text-4xl font-bold ${scoreColor}`}>{score.toFixed(2)}</p>
      <p className="text-sm text-gray-400 mt-2 uppercase tracking-wide">{label}</p>
    </div>
  );
};

/**
 * A styled title for sections within the financial infrastructure application.
 * Ensures clear delineation of complex data segments for enhanced user experience.
 * @param {object} props - The component props.
 * @param {string} props.title - The title text.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The section title JSX.
 */
export const ExportedSectionTitle: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
  <h2 className={`text-2xl font-bold mb-4 text-cyan-400 border-b border-gray-700 pb-3 ${className}`}>{title}</h2>
);

/**
 * A card for displaying a single key financial or operational metric.
 * Offers at-a-glance insight into critical performance indicators.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the metric.
 * @param {string | number} props.value - The value of the metric.
 * @param {string} [props.unit] - The unit for the value (e.g., "USD", "%").
 * @param {string} [props.description] - A brief description of the metric.
 * @returns {JSX.Element} The metric card JSX.
 */
export const ExportedMetricCard: React.FC<{ title: string; value: string | number; unit?: string; description?: string }> = ({ title, value, unit, description }) => (
  <div className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600">
    <h3 className="text-lg font-medium text-cyan-300 mb-2">{title}</h3>
    <p className="text-3xl font-bold text-white">{value} {unit && <span className="text-base font-normal text-gray-400">{unit}</span>}</p>
    {description && <p className="text-sm text-gray-400 mt-2">{description}</p>}
  </div>
);

/**
 * A progress bar component with a label and percentage display.
 * Visualizes progress towards key performance indicators or deployment milestones.
 * @param {object} props - The component props.
 * @param {number} props.progress - The current progress as a percentage (0-100).
 * @param {string} props.label - The label for the progress bar.
 * @returns {JSX.Element} The progress bar JSX.
 */
export const ExportedProgressBar: React.FC<{ progress: number; label: string }> = ({ progress, label }) => {
  const barColor = progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  const displayProgress = Math.max(0, Math.min(100, progress)); // Clamp between 0 and 100
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1 text-sm text-gray-300">
        <span>{label}</span>
        <span>{displayProgress.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2.5">
        <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${displayProgress}%` }}></div>
      </div>
    </div>
  );
};

// --- Feature Components: Detailed and expanded modules for different financial planning aspects ---

/**
 * Component for managing financial infrastructure projects: creating new projects, selecting existing ones,
 * and viewing/managing project history and details. Includes a comprehensive modal for new project creation.
 * This component is the primary interface for initiating and overseeing strategic financial deployments.
 */
export const ExportedProjectSelector: React.FC = () => {
  const { currentProject, setCurrentProject, setIsLoadingGlobal, activeBlueprint, setActiveBlueprint, currentUser } = useUrbanSymphony();
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectConstraints, setNewProjectConstraints] = useState<DesignConstraints>({
    targetMarketEntities: { min: 500000, max: 1000000, targetDigitalAdoptionRatePercent: 75 },
    deploymentScopeSqKm: { min: 100, max: 200, preferredArchitectureTopology: 'decentralized' },
    esgInvestmentTargetPercent: 30,
    realTimeSettlementCoverageTargetPercent: 95,
    carbonNeutralityTargetYear: 2030,
    financialInclusionTargetIndex: 0.85,
    regulatoryPreferences: { digitalAssetClassificationPreference: 'security-token-focused', innovationHubFocus: 'regulatory-sandbox', complianceStrictness: 'high' },
    dlcOptimizationFocus: 'security',
    socioEconomicFinancialGoals: { financialLiteracyImprovementPercent: 10, microfinanceUptakeImprovementPercent: 15, defiIntegrationEmphasis: 'high', socialEquityInvestmentTargetIndex: 0.9 },
    totalInvestmentCapMillionsUSD: 15000,
    deploymentTimelineMonths: 240,
    criticalDeploymentZones: [],
    cyberResilienceTargetRating: 'critical',
    dataSovereigntyComplianceLevel: 'regional',
    agenticAutomationTargetPercent: 70,
    stakeholderEngagementStrategy: 'hybrid',
    disasterRecoveryStrategies: ['multi-region failover', 'immutable audit logs']
  });
  const [blueprintHistory, setBlueprintHistory] = useState<{ blueprintId: string; timestamp: string; notes: string; constraintsUsed: DesignConstraints }[]>([]);
  const [showBlueprintHistoryDetail, setShowBlueprintHistoryDetail] = useState<string | null>(null);

  /**
   * Fetches all available financial infrastructure projects from the API and updates the state.
   * Ensures data integrity and real-time project status visibility.
   */
  const fetchProjects = useCallback(async () => {
    setIsLoadingGlobal(true);
    try {
      const fetchedProjects = await urbanSymphonyApi.getProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoadingGlobal(false);
    }
  }, [setIsLoadingGlobal]);

  /**
   * Handles selecting a project, loading its details and its current active blueprint.
   * Updates global project and active blueprint states, providing a consistent operational view.
   * @param {string} projectId - The ID of the project to select.
   */
  const handleSelectProject = useCallback(async (projectId: string) => {
    setIsLoadingGlobal(true);
    try {
      const project = await urbanSymphonyApi.getProjectById(projectId);
      if (project) {
        setCurrentProject(project);
        if (project.currentBlueprintId) {
          const blueprint = await urbanSymphonyApi.getFinancialInfrastructureBlueprintById(project.currentBlueprintId);
          setActiveBlueprint(blueprint || null);
        } else {
          setActiveBlueprint(null);
        }
        setBlueprintHistory(await urbanSymphonyApi.getBlueprintHistory(projectId));
      }
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setIsLoadingGlobal(false);
    }
  }, [setCurrentProject, setActiveBlueprint, setIsLoadingGlobal]);

  /**
   * Handles the creation of a new financial infrastructure project, including an initial blueprint generation.
   * This is a critical workflow for initiating new strategic digital finance initiatives.
   */
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setIsLoadingGlobal(true);
    try {
      const project = await urbanSymphonyApi.createProject(newProjectName, newProjectConstraints, currentUser.userId);
      setProjects(prev => [...prev, project]);
      setCurrentProject(project);
      if (project.currentBlueprintId) {
        const blueprint = await urbanSymphonyApi.getFinancialInfrastructureBlueprintById(project.currentBlueprintId);
        setActiveBlueprint(blueprint || null);
      }
      setBlueprintHistory(await urbanSymphonyApi.getBlueprintHistory(project.id));
      setNewProjectName('');
      setNewProjectDescription('');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Error creating project. Check console for details.");
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  /**
   * Handles deleting a financial infrastructure project after confirmation.
   * This action is irreversible and subject to stringent access controls and audit trails.
   * @param {string} projectId - The ID of the project to delete.
   */
  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (window.confirm("WARNING: Are you sure you want to permanently delete this project and all its associated financial infrastructure blueprints? This action cannot be undone and has significant financial implications.")) {
      setIsLoadingGlobal(true);
      try {
        const success = await urbanSymphonyApi.deleteProject(projectId);
        if (success) {
          setProjects(prev => prev.filter(p => p.id !== projectId));
          if (currentProject?.id === projectId) {
            setCurrentProject(null);
            setActiveBlueprint(null);
            setBlueprintHistory([]);
          }
          alert("Project deleted successfully. All associated blueprints removed.");
        } else {
          alert("Failed to delete project. Check system logs for details.");
        }
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert("Error deleting project. Check console for details.");
      } finally {
        setIsLoadingGlobal(false);
      }
    }
  }, [currentProject, setCurrentProject, setActiveBlueprint, setIsLoadingGlobal]);

  /**
   * Handles updating a project's name, reflecting changes in strategic titling or branding.
   * @param {string} projectId - The ID of the project to update.
   * @param {string} newName - The new name for the project.
   */
  const handleUpdateProjectName = useCallback(async (projectId: string, newName: string) => {
    if (!newName.trim()) return;
    setIsLoadingGlobal(true);
    try {
      const updatedProject = await urbanSymphonyApi.updateProject(projectId, { name: newName });
      if (updatedProject) {
        setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
        if (currentProject?.id === projectId) {
          setCurrentProject(updatedProject);
        }
        alert("Project name updated successfully.");
      }
    } catch (error) {
      console.error("Failed to update project name:", error);
      alert("Error updating project name. Check console for details.");
    } finally {
      setIsLoadingGlobal(false);
    }
  }, [currentProject, setCurrentProject, setIsLoadingGlobal]);

  /** Initial fetch of projects on component mount, populating the project selection dropdown. */
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /** Fetches blueprint history when the current project changes, ensuring auditability and traceability of design iterations. */
  useEffect(() => {
    if (currentProject) {
      urbanSymphonyApi.getBlueprintHistory(currentProject.id)
        .then(history => setBlueprintHistory(history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))) // Sort by newest
        .catch(console.error);
    } else {
      setBlueprintHistory([]);
    }
  }, [currentProject]);

  /** Helper to render constraint details for modal/history, ensuring transparent display of strategic parameters. */
  const renderConstraintDetails = (constraints: DesignConstraints) => (
    <div className="text-sm text-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto custom-scrollbar">
      <p><span className="font-semibold text-cyan-200">Market Entities:</span> {constraints.targetMarketEntities.min.toLocaleString()} - {constraints.targetMarketEntities.max.toLocaleString()}</p>
      <p><span className="font-semibold text-cyan-200">Deployment Scope:</span> {constraints.deploymentScopeSqKm.min} - {constraints.deploymentScopeSqKm.max} SqKm</p>
      <p><span className="font-semibold text-cyan-200">ESG Investment:</span> {constraints.esgInvestmentTargetPercent}%</p>
      <p><span className="font-semibold text-cyan-200">Real-Time Settlement:</span> {constraints.realTimeSettlementCoverageTargetPercent}%</p>
      <p><span className="font-semibold text-cyan-200">Carbon Neutrality:</span> {constraints.carbonNeutralityTargetYear}</p>
      <p><span className="font-semibold text-cyan-200">Fin. Inclusion:</span> {constraints.financialInclusionTargetIndex.toFixed(2)}</p>
      <p><span className="font-semibold text-cyan-200">Asset Class Pref.:</span> {constraints.regulatoryPreferences.digitalAssetClassificationPreference}</p>
      <p><span className="font-semibold text-cyan-200">DLC Opt. Focus:</span> {constraints.dlcOptimizationFocus}</p>
      <p><span className="font-semibold text-cyan-200">Investment Cap:</span> ${constraints.totalInvestmentCapMillionsUSD.toLocaleString()}M</p>
      <p><span className="font-semibold text-cyan-200">Timeline:</span> {constraints.deploymentTimelineMonths} months</p>
      <p className="col-span-full"><span className="font-semibold text-cyan-200">Goals:</span> {constraints.socioEconomicFinancialGoals.financialLiteracyImprovementPercent}% literacy, {constraints.socioEconomicFinancialGoals.microfinanceUptakeImprovementPercent}% microfinance improv.</p>
      {constraints.criticalDeploymentZones.length > 0 && <p className="col-span-full"><span className="font-semibold text-cyan-200">Critical Deployment Zones:</span> {constraints.criticalDeploymentZones.map(pa => pa.name).join(', ')}</p>}
    </div>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-xl border border-gray-700">
      <ExportedSectionTitle title="Financial Infrastructure Project Management & Strategic Overview" />
      <p className="text-gray-400 mb-6">Manage your digital finance infrastructure projects: create new initiatives, load existing blueprints, and track their strategic evolution and performance.</p>

      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-700 rounded-md shadow-inner">
        <label htmlFor="project-select" className="block text-gray-300 text-base font-bold min-w-[120px]">Active Project:</label>
        <select
          id="project-select"
          className="p-2.5 bg-gray-600 border border-gray-500 rounded-md text-white flex-grow min-w-48 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors"
          value={currentProject?.id || ''}
          onChange={(e) => handleSelectProject(e.target.value)}
          aria-label="Select current financial infrastructure project"
        >
          <option value="" disabled>Select a Project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2.5 px-5 bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold transition-colors shadow-md"
        >
          + New Project
        </button>
      </div>

      {currentProject && (
        <div className="mt-6 bg-gray-700 p-5 rounded-lg border border-gray-600 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-cyan-300">
              Project: {currentProject.name}
              <span className="text-sm text-gray-500 ml-3 font-normal">(ID: {currentProject.id})</span>
            </h3>
            <button
              onClick={() => handleDeleteProject(currentProject.id)}
              className="p-2 px-4 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-medium transition-colors"
              aria-label={`Delete project ${currentProject.name}`}
            >
              Delete Project
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-3">{currentProject.description || 'No description provided for this financial infrastructure project.'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-300 mb-5 border-t border-gray-600 pt-4">
            <p><strong>Created:</strong> {new Date(currentProject.createdAt).toLocaleDateString()} {new Date(currentProject.createdAt).toLocaleTimeString()}</p>
            <p><strong>Last Modified:</strong> {new Date(currentProject.lastModified).toLocaleDateString()} {new Date(currentProject.lastModified).toLocaleTimeString()}</p>
            <p><strong>Status:</strong> <span className={`font-semibold ${currentProject.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{currentProject.status.toUpperCase()}</span></p>
            <p><strong>Financial Approval:</strong> <span className={`font-semibold ${currentProject.financialApprovalStatus === 'approved' ? 'text-green-400' : currentProject.financialApprovalStatus === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>{currentProject.financialApprovalStatus.toUpperCase()}</span></p>
            <p><strong>Risk Rating:</strong> <span className={`font-semibold ${currentProject.riskRating === 'low' ? 'text-green-400' : currentProject.riskRating === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>{currentProject.riskRating.toUpperCase()}</span></p>
            <p><strong>Current Blueprint:</strong> <span className="text-green-300 font-semibold">{activeBlueprint?.name || 'N/A'}</span></p>
            <p className="col-span-full"><strong>Strategic Tags:</strong> {currentProject.tags.map(tag => <span key={tag} className="inline-block bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full mr-2">{tag}</span>)}</p>
            <p className="col-span-full"><strong>Collaborators:</strong> {currentProject.collaborators.map(c => <span key={c.userId} className="inline-block bg-indigo-700 text-white text-xs px-2 py-1 rounded-full mr-2">{c.userId} ({c.role})</span>)}</p>
          </div>

          <div className="mt-5 border-t border-gray-600 pt-5">
            <h4 className="font-bold text-lg text-cyan-300 mb-3 flex items-center">
              <span className="mr-2">📚</span>Blueprint History ({blueprintHistory.length})
            </h4>
            {blueprintHistory.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                {blueprintHistory.map((entry, index) => (
                  <li key={index} className="bg-gray-600 p-3 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm border border-gray-500">
                    <div className="flex-1 mr-4 mb-2 sm:mb-0">
                      <p className="text-gray-200 font-medium">{entry.notes}</p>
                      <p className="text-xs text-gray-400 flex items-center">
                        Blueprint ID: {entry.blueprintId} <span className="mx-2"> • </span> {new Date(entry.timestamp).toLocaleString()}
                        <button
                          onClick={() => setShowBlueprintHistoryDetail(showBlueprintHistoryDetail === entry.blueprintId ? null : entry.blueprintId)}
                          className="ml-3 text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
                          aria-expanded={showBlueprintHistoryDetail === entry.blueprintId}
                          aria-controls={`blueprint-history-details-${entry.blueprintId}`}
                        >
                          {showBlueprintHistoryDetail === entry.blueprintId ? 'Hide Details' : 'View Constraints'}
                        </button>
                      </p>
                      {showBlueprintHistoryDetail === entry.blueprintId && (
                        <div id={`blueprint-history-details-${entry.blueprintId}`} className="mt-3 bg-gray-700 p-3 rounded-md border border-gray-500">
                          <p className="font-semibold text-gray-200 mb-2">Strategic Constraints Applied:</p>
                          {renderConstraintDetails(entry.constraintsUsed as DesignConstraints)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        await handleSelectProject(currentProject.id); // Ensure project is current
                        const blueprintToView = await urbanSymphonyApi.getFinancialInfrastructureBlueprintById(entry.blueprintId);
                        setActiveBlueprint(blueprintToView || null);
                        alert(`Switched to Blueprint: ${entry.blueprintId}`);
                      }}
                      className="p-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-xs font-medium transition-colors self-start sm:self-auto"
                      aria-label={`Load blueprint ${entry.blueprintId}`}
                    >
                      Load Blueprint
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No blueprints generated yet for this project. Use the 'Design Constraints' tab to create your first financial infrastructure blueprint.</p>
            )}
          </div>
        </div>
      )}

      {/* New Project Modal - Vastly expanded for detailed initial financial infrastructure constraints */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-xl w-full max-w-4xl shadow-2xl border border-gray-700 overflow-hidden max-h-[90vh] flex flex-col">
            <h3 className="text-3xl font-bold mb-6 text-cyan-400 border-b border-gray-700 pb-4">Create New Financial Infrastructure Project</h3>
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
              <div className="mb-6">
                <label htmlFor="new-project-name" className="block text-gray-300 text-base font-bold mb-2">Project Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  id="new-project-name"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., 'Quantum Global Settlement Network 2077'"
                  aria-required="true"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="new-project-description" className="block text-gray-300 text-base font-bold mb-2">Project Description</label>
                <textarea
                  id="new-project-description"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors"
                  rows={3}
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="A brief overview of the financial infrastructure project's strategic scope, core objectives, and unique market challenges."
                ></textarea>
              </div>

              <ExportedSectionTitle title="Initial Strategic Constraints for Financial Blueprint" className="mt-6 mb-4" />
              <p className="text-gray-400 text-sm mb-4">Define the foundational parameters that will guide the AI's initial financial infrastructure blueprint generation.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Target Market Entities */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Target Market Entities (Min/Max)</label>
                  <input type="number" value={newProjectConstraints.targetMarketEntities.min} onChange={e => setNewProjectConstraints(prev => ({ ...prev, targetMarketEntities: { ...prev.targetMarketEntities, min: parseInt(e.target.value) || 0 } }))} placeholder="Min" className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <input type="number" value={newProjectConstraints.targetMarketEntities.max} onChange={e => setNewProjectConstraints(prev => ({ ...prev, targetMarketEntities: { ...prev.targetMarketEntities, max: parseInt(e.target.value) || 0 } }))} placeholder="Max" className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <label className="block text-gray-300 text-sm font-bold mt-2 mb-1">Target Digital Adoption Rate (%)</label>
                  <input type="number" step="0.1" value={newProjectConstraints.targetMarketEntities.targetDigitalAdoptionRatePercent} onChange={e => setNewProjectConstraints(prev => ({ ...prev, targetMarketEntities: { ...prev.targetMarketEntities, targetDigitalAdoptionRatePercent: parseFloat(e.target.value) || 0 } }))} placeholder="Adoption %" className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Deployment Scope */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Deployment Scope (Min/Max SqKm)</label>
                  <input type="number" value={newProjectConstraints.deploymentScopeSqKm.min} onChange={e => setNewProjectConstraints(prev => ({ ...prev, deploymentScopeSqKm: { ...prev.deploymentScopeSqKm, min: parseFloat(e.target.value) || 0 } }))} placeholder="Min" className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <input type="number" value={newProjectConstraints.deploymentScopeSqKm.max} onChange={e => setNewProjectConstraints(prev => ({ ...prev, deploymentScopeSqKm: { ...prev.deploymentScopeSqKm, max: parseFloat(e.target.value) || 0 } }))} placeholder="Max" className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <label className="block text-gray-300 text-sm font-bold mt-2 mb-1">Preferred Architecture Topology</label>
                  <select value={newProjectConstraints.deploymentScopeSqKm.preferredArchitectureTopology} onChange={e => setNewProjectConstraints(prev => ({ ...prev, deploymentScopeSqKm: { ...prev.deploymentScopeSqKm, preferredArchitectureTopology: e.target.value as any } }))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['centralized', 'decentralized', 'hybrid'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                {/* ESG Investment & Carbon Neutrality */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">ESG Investment Target (%)</label>
                  <input type="number" value={newProjectConstraints.esgInvestmentTargetPercent} onChange={e => setNewProjectConstraints(prev => ({ ...prev, esgInvestmentTargetPercent: parseFloat(e.target.value) || 0 } ))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <label className="block text-gray-300 text-sm font-bold mb-1">Carbon Neutrality Target Year</label>
                  <input type="number" value={newProjectConstraints.carbonNeutralityTargetYear} onChange={e => setNewProjectConstraints(prev => ({ ...prev, carbonNeutralityTargetYear: parseInt(e.target.value) || 0 } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Real-Time Settlement & Financial Inclusion */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Real-Time Settlement Coverage (%)</label>
                  <input type="number" value={newProjectConstraints.realTimeSettlementCoverageTargetPercent} onChange={e => setNewProjectConstraints(prev => ({ ...prev, realTimeSettlementCoverageTargetPercent: parseFloat(e.target.value) || 0 } ))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <label className="block text-gray-300 text-sm font-bold mb-1">Financial Inclusion Target Index</label>
                  <input type="number" step="0.01" min="0" max="1" value={newProjectConstraints.financialInclusionTargetIndex} onChange={e => setNewProjectConstraints(prev => ({ ...prev, financialInclusionTargetIndex: parseFloat(e.target.value) || 0 } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Regulatory Preferences */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-1">Digital Asset Classification Preference</label>
                  <select value={newProjectConstraints.regulatoryPreferences.digitalAssetClassificationPreference} onChange={e => setNewProjectConstraints(prev => ({ ...prev, regulatoryPreferences: { ...prev.regulatoryPreferences, digitalAssetClassificationPreference: e.target.value as any } }))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['security-token-focused', 'utility-token-focused', 'nft-focused', 'mixed'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <label className="block text-gray-300 text-sm font-bold mb-1">Innovation Hub Focus</label>
                  <select value={newProjectConstraints.regulatoryPreferences.innovationHubFocus} onChange={e => setNewProjectConstraints(prev => ({ ...prev, regulatoryPreferences: { ...prev.regulatoryPreferences, innovationHubFocus: e.target.value as any } }))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['regulatory-sandbox', 'fintech-lab', 'defi-focused'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <label className="block text-gray-300 text-sm font-bold mb-1">Compliance Strictness</label>
                  <select value={newProjectConstraints.regulatoryPreferences.complianceStrictness} onChange={e => setNewProjectConstraints(prev => ({ ...prev, regulatoryPreferences: { ...prev.regulatoryPreferences, complianceStrictness: e.target.value as any } }))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['low', 'medium', 'high'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                {/* DLT Optimization Focus & Cyber Resilience */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">DLT Optimization Focus</label>
                  <select value={newProjectConstraints.dlcOptimizationFocus} onChange={e => setNewProjectConstraints(prev => ({ ...prev, dlcOptimizationFocus: e.target.value as any } ))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['energy-efficiency', 'throughput', 'security', 'cost'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <label className="block text-gray-300 text-sm font-bold mb-1">Cyber Resilience Target Rating</label>
                  <select value={newProjectConstraints.cyberResilienceTargetRating} onChange={e => setNewProjectConstraints(prev => ({ ...prev, cyberResilienceTargetRating: e.target.value as any } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['low', 'medium', 'high', 'critical'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                {/* Investment Cap & Deployment Timeline */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Total Investment Cap (Millions USD)</label>
                  <input type="number" value={newProjectConstraints.totalInvestmentCapMillionsUSD} onChange={e => setNewProjectConstraints(prev => ({ ...prev, totalInvestmentCapMillionsUSD: parseFloat(e.target.value) || 0 } ))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
                  <label className="block text-gray-300 text-sm font-bold mb-1">Deployment Timeline (Months)</label>
                  <input type="number" value={newProjectConstraints.deploymentTimelineMonths} onChange={e => setNewProjectConstraints(prev => ({ ...prev, deploymentTimelineMonths: parseInt(e.target.value) || 0 } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Data Sovereignty & Agentic Automation */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Data Sovereignty Compliance Level</label>
                  <select value={newProjectConstraints.dataSovereigntyComplianceLevel} onChange={e => setNewProjectConstraints(prev => ({ ...prev, dataSovereigntyComplianceLevel: e.target.value as any } ))} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['local', 'regional', 'global'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <label className="block text-gray-300 text-sm font-bold mb-1">Agentic Automation Target (%)</label>
                  <input type="number" value={newProjectConstraints.agenticAutomationTargetPercent} onChange={e => setNewProjectConstraints(prev => ({ ...prev, agenticAutomationTargetPercent: parseFloat(e.target.value) || 0 } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Socio-Economic Financial Goals */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
                  <h4 className="block text-gray-300 text-sm font-bold mb-2">Socio-Economic Financial Goals</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <label className="block text-gray-400 text-xs font-medium mb-1">Financial Literacy Improvement (%)</label>
                      <input type="number" step="0.1" value={newProjectConstraints.socioEconomicFinancialGoals.financialLiteracyImprovementPercent} onChange={e => setNewProjectConstraints(prev => ({ ...prev, socioEconomicFinancialGoals: { ...prev.socioEconomicFinancialGoals, financialLiteracyImprovementPercent: parseFloat(e.target.value) || 0 } }))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs font-medium mb-1">Microfinance Uptake Improvement (%)</label>
                      <input type="number" step="0.1" value={newProjectConstraints.socioEconomicFinancialGoals.microfinanceUptakeImprovementPercent} onChange={e => setNewProjectConstraints(prev => ({ ...prev, socioEconomicFinancialGoals: { ...prev.socioEconomicFinancialGoals, microfinanceUptakeImprovementPercent: parseFloat(e.target.value) || 0 } }))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs font-medium mb-1">DeFi Integration Emphasis</label>
                      <select value={newProjectConstraints.socioEconomicFinancialGoals.defiIntegrationEmphasis} onChange={e => setNewProjectConstraints(prev => ({ ...prev, socioEconomicFinancialGoals: { ...prev.socioEconomicFinancialGoals, defiIntegrationEmphasis: e.target.value as any } }))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                        {['low', 'medium', 'high'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs font-medium mb-1">Social Equity Investment Target Index</label>
                      <input type="number" step="0.01" min="0" max="1" value={newProjectConstraints.socioEconomicFinancialGoals.socialEquityInvestmentTargetIndex} onChange={e => setNewProjectConstraints(prev => ({ ...prev, socioEconomicFinancialGoals: { ...prev.socioEconomicFinancialGoals, socialEquityInvestmentTargetIndex: parseFloat(e.target.value) || 0 } }))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                    </div>
                  </div>
                </div>
                {/* Critical Deployment Zones */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Critical Deployment Zones (Name, Type, Coordinates, Investment Intensity - one per line)</label>
                  <textarea
                    className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500"
                    rows={4}
                    value={newProjectConstraints.criticalDeploymentZones.map(p => `${p.name}, ${p.type}, ${p.coordinates}, ${p.investmentIntensity}`).join('\n')}
                    onChange={(e) => {
                      const zones = e.target.value.split('\n').map(line => {
                        const parts = line.split(',').map(p => p.trim());
                        return parts.length >= 4 ? { name: parts[0], type: parts[1] as any, coordinates: parts[2], investmentIntensity: parts[3] as any } : null;
                      }).filter(Boolean) as any;
                      setNewProjectConstraints(prev => ({ ...prev, criticalDeploymentZones: zones }));
                    }}
                    placeholder="Global Liquidity Hub, digital-asset, lat:X,lon:Y, high&#10;Regulatory Oversight Node, compliance, lat:A,lon:B, medium"
                  ></textarea>
                </div>
                {/* Disaster Recovery Strategies */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Disaster Recovery Strategies (comma-separated)</label>
                  <input type="text" value={newProjectConstraints.disasterRecoveryStrategies.join(', ')} onChange={e => setNewProjectConstraints(prev => ({ ...prev, disasterRecoveryStrategies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                {/* Stakeholder Engagement Strategy */}
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 text-sm font-bold mb-1">Stakeholder Engagement Strategy</label>
                  <select value={newProjectConstraints.stakeholderEngagementStrategy} onChange={e => setNewProjectConstraints(prev => ({ ...prev, stakeholderEngagementStrategy: e.target.value as any } ))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['online-platform', 'regulatory-workshops', 'hybrid'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 px-6 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="p-3 px-6 bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                Create Project & Initial Blueprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Component for defining detailed strategic constraints and triggering financial infrastructure blueprint generation or refinement.
 * Offers structured input fields for all parameters, enhancing user control over the AI-driven financial system design.
 */
export const ExportedConstraintEditor: React.FC = () => {
  const { currentProject, activeBlueprint, setCurrentProject, setIsLoadingGlobal, setActiveBlueprint, currentUser } = useUrbanSymphony();
  const [localConstraints, setLocalConstraints] = useState<DesignConstraints>(() => activeBlueprint && activeBlueprint.deploymentPhases.length > 0 && activeBlueprint.blueprintHistory.find(entry => entry.blueprintId === activeBlueprint.blueprintId)?.constraintsUsed ?
    activeBlueprint.blueprintHistory.find(entry => entry.blueprintId === activeBlueprint.blueprintId)!.constraintsUsed : {
    targetMarketEntities: { min: 500000, max: 1000000, targetDigitalAdoptionRatePercent: 75 },
    deploymentScopeSqKm: { min: 100, max: 200, preferredArchitectureTopology: 'decentralized' },
    esgInvestmentTargetPercent: 30,
    realTimeSettlementCoverageTargetPercent: 95,
    carbonNeutralityTargetYear: 2030,
    financialInclusionTargetIndex: 0.85,
    regulatoryPreferences: { digitalAssetClassificationPreference: 'security-token-focused', innovationHubFocus: 'regulatory-sandbox', complianceStrictness: 'high' },
    dlcOptimizationFocus: 'security',
    socioEconomicFinancialGoals: { financialLiteracyImprovementPercent: 10, microfinanceUptakeImprovementPercent: 15, defiIntegrationEmphasis: 'high', socialEquityInvestmentTargetIndex: 0.9 },
    totalInvestmentCapMillionsUSD: 15000,
    deploymentTimelineMonths: 240,
    criticalDeploymentZones: [],
    cyberResilienceTargetRating: 'critical',
    dataSovereigntyComplianceLevel: 'regional',
    agenticAutomationTargetPercent: 70,
    stakeholderEngagementStrategy: 'hybrid',
    disasterRecoveryStrategies: ['multi-region failover', 'immutable audit logs']
  });
  const [constraintsText, setConstraintsText] = useState('');

  /**
   * Updates local constraints when the active blueprint or current project changes.
   * If an active blueprint exists, it attempts to load its most recent constraints, maintaining design continuity.
   */
  useEffect(() => {
    if (activeBlueprint && currentProject) {
      const latestBlueprintEntry = currentProject.blueprintHistory.find(entry => entry.blueprintId === activeBlueprint.blueprintId);
      if (latestBlueprintEntry && latestBlueprintEntry.constraintsUsed) {
        setLocalConstraints(latestBlueprintEntry.constraintsUsed);
        const summary = `Target Market: ${latestBlueprintEntry.constraintsUsed.targetMarketEntities.min.toLocaleString()}-${latestBlueprintEntry.constraintsUsed.targetMarketEntities.max.toLocaleString()}, ESG: ${latestBlueprintEntry.constraintsUsed.esgInvestmentTargetPercent}%, Real-time Settlement: ${latestBlueprintEntry.constraintsUsed.realTimeSettlementCoverageTargetPercent}%, DLC Focus: ${latestBlueprintEntry.constraintsUsed.dlcOptimizationFocus}.`;
        setConstraintsText(summary);
      } else {
        console.warn("No specific constraints found for the active blueprint, using default/placeholder for financial infrastructure design.");
        setLocalConstraints({
          targetMarketEntities: { min: 500000, max: 1000000, targetDigitalAdoptionRatePercent: 70 },
          deploymentScopeSqKm: { min: 100, max: 200, preferredArchitectureTopology: 'hybrid' },
          esgInvestmentTargetPercent: 25,
          realTimeSettlementCoverageTargetPercent: 90,
          carbonNeutralityTargetYear: 2035,
          financialInclusionTargetIndex: 0.8,
          regulatoryPreferences: { digitalAssetClassificationPreference: 'mixed', innovationHubFocus: 'fintech-lab', complianceStrictness: 'medium' },
          dlcOptimizationFocus: 'throughput',
          socioEconomicFinancialGoals: { financialLiteracyImprovementPercent: 5, microfinanceUptakeImprovementPercent: 10, defiIntegrationEmphasis: 'medium', socialEquityInvestmentTargetIndex: 0.8 },
          totalInvestmentCapMillionsUSD: 10000,
          deploymentTimelineMonths: 180,
          criticalDeploymentZones: [],
          cyberResilienceTargetRating: 'high',
          dataSovereigntyComplianceLevel: 'regional',
          agenticAutomationTargetPercent: 50,
          stakeholderEngagementStrategy: 'online-platform',
          disasterRecoveryStrategies: ['multi-region failover']
        });
        setConstraintsText(`Target market: ${activeBlueprint.digitalIdentity.totalRegisteredEntities.toLocaleString()} entities, ESG focus: ${activeBlueprint.esgImpact.percentageOfProjectArea.toFixed(1)}%, high security protocols.`);
      }
    } else if (!currentProject) {
      setLocalConstraints({
        targetMarketEntities: { min: 250000, max: 750000, targetDigitalAdoptionRatePercent: 60 },
        deploymentScopeSqKm: { min: 50, max: 150, preferredArchitectureTopology: 'hybrid' },
        esgInvestmentTargetPercent: 20,
        realTimeSettlementCoverageTargetPercent: 80,
        carbonNeutralityTargetYear: 2040,
        financialInclusionTargetIndex: 0.7,
        regulatoryPreferences: { digitalAssetClassificationPreference: 'mixed', innovationHubFocus: 'fintech-lab', complianceStrictness: 'medium' },
        dlcOptimizationFocus: 'cost',
        socioEconomicFinancialGoals: { financialLiteracyImprovementPercent: 2, microfinanceUptakeImprovementPercent: 5, defiIntegrationEmphasis: 'low', socialEquityInvestmentTargetIndex: 0.7 },
        totalInvestmentCapMillionsUSD: 5_000,
        deploymentTimelineMonths: 120,
        criticalDeploymentZones: [],
        cyberResilienceTargetRating: 'medium',
        dataSovereigntyComplianceLevel: 'local',
        agenticAutomationTargetPercent: 30,
        stakeholderEngagementStrategy: 'online-platform',
        disasterRecoveryStrategies: []
      });
      setConstraintsText('');
    }
  }, [activeBlueprint, currentProject]);

  /**
   * Generic handler for updating nested strategic constraint values.
   * Ensures granular control over complex financial infrastructure parameters.
   * @param {string} field - Top-level field name.
   * @param {any} value - The new value.
   * @param {string} [subField] - Second-level field name.
   * @param {string} [subSubField] - Third-level field name.
   */
  const handleConstraintChange = useCallback((field: string, value: any, subField?: string, subSubField?: string) => {
    setLocalConstraints(prev => {
      if (!prev) return prev;
      let updated: any = { ...prev };
      if (subSubField) {
        updated[field] = { ...updated[field], [subField]: { ...updated[field][subField], [subSubField]: value } };
      } else if (subField) {
        updated[field] = { ...updated[field], [subField]: value };
      } else {
        updated[field] = value;
      }
      return updated;
    });
  }, []);

  /**
   * Triggers the generation of a new financial infrastructure blueprint based on current constraints.
   * This initiates an AI-driven design process, delivering a comprehensive system specification.
   */
  const handleGenerateBlueprint = async () => {
    if (!currentProject || !localConstraints) {
      alert("Please select a project and define strategic constraints before generating a financial blueprint.");
      return;
    }
    setIsLoadingGlobal(true);
    try {
      const generatedBlueprint = await urbanSymphonyApi.generateFinancialInfrastructureBlueprint(currentProject.id, localConstraints, currentProject.name, currentUser.userId);
      setActiveBlueprint(generatedBlueprint);
      const updatedProject = await urbanSymphonyApi.getProjectById(currentProject.id);
      if (updatedProject) setCurrentProject(updatedProject);
      alert(`New blueprint '${generatedBlueprint.name}' (v${generatedBlueprint.version}) generated successfully!`);
    } catch (error) {
      console.error("Error generating financial infrastructure blueprint:", error);
      alert("Failed to generate blueprint. See console for details.");
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  /**
   * Triggers the refinement of the current active financial infrastructure blueprint based on modified constraints.
   * This creates a new version, allowing for iterative optimization and adaptation to evolving requirements.
   */
  const handleRefineBlueprint = async () => {
    if (!currentProject || !activeBlueprint || !localConstraints) {
      alert("Please select an active blueprint and define strategic constraints for refinement.");
      return;
    }
    setIsLoadingGlobal(true);
    try {
      const refinedBlueprint = await urbanSymphonyApi.refineFinancialInfrastructureBlueprint(activeBlueprint.blueprintId, localConstraints, currentUser.userId);
      setActiveBlueprint(refinedBlueprint);
      const updatedProject = await urbanSymphonyApi.getProjectById(currentProject.id);
      if (updatedProject) setCurrentProject(updatedProject);
      alert(`Blueprint '${refinedBlueprint.name}' (v${refinedBlueprint.version}) refined successfully!`);
    } catch (error) {
      console.error("Error refining financial infrastructure blueprint:", error);
      alert("Failed to refine blueprint. See console for details.");
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  if (!currentProject) {
    return <div className="bg-gray-800 p-6 rounded-lg mb-8 text-center text-gray-400 border border-gray-700 shadow-xl">Please select or create a financial infrastructure project to define strategic constraints.</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-xl border border-gray-700">
      <ExportedSectionTitle title="Strategic Constraints & Input Parameters" />
      <p className="text-gray-400 mb-6">Specify the detailed strategic requirements and preferences for your digital financial infrastructure. The AI will interpret these parameters during blueprint generation and refinement, optimizing for performance, security, and compliance.</p>

      <div className="mb-6 bg-gray-700 p-4 rounded-md border border-gray-600 shadow-inner">
        <label htmlFor="constraints-textarea" className="block text-gray-300 text-base font-bold mb-2">High-Level Strategic Directive (Optional Free Text)</label>
        <textarea
          id="constraints-textarea"
          value={constraintsText}
          onChange={e => setConstraintsText(e.target.value)}
          placeholder="e.g., 'Design a robust, quantum-resistant global settlement network with a strong emphasis on ESG compliance and real-time cross-border payments. Prioritize autonomous risk management and transparent auditability.'"
          rows={5}
          className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors"
          aria-label="High-level strategic directive"
        />
        <p className="text-xs text-gray-500 mt-2">This free-text input provides overarching strategic guidance for the AI, complementing the granular structured parameters below.</p>
      </div>

      {localConstraints && (
        <>
          <h3 className="text-xl font-medium text-cyan-300 mb-4 border-b border-gray-700 pb-2">Granular Strategic Parameters: Precision Control</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar p-2 -mr-2">
            {/* Target Market Entities */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Target Market Entities (Min/Max)</label>
              <input type="number" value={localConstraints.targetMarketEntities.min} onChange={e => handleConstraintChange('targetMarketEntities', parseInt(e.target.value) || 0, 'min')} placeholder="Min" className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <input type="number" value={localConstraints.targetMarketEntities.max} onChange={e => handleConstraintChange('targetMarketEntities', parseInt(e.target.value) || 0, 'max')} placeholder="Max" className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <label className="block text-gray-300 text-sm font-bold mt-2 mb-1">Target Digital Adoption Rate (%)</label>
              <input type="number" step="0.1" value={localConstraints.targetMarketEntities.targetDigitalAdoptionRatePercent} onChange={e => handleConstraintChange('targetMarketEntities', parseFloat(e.target.value) || 0, 'targetDigitalAdoptionRatePercent')} placeholder="Adoption %" className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Deployment Scope & Architecture */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Deployment Scope (Min/Max SqKm)</label>
              <input type="number" value={localConstraints.deploymentScopeSqKm.min} onChange={e => handleConstraintChange('deploymentScopeSqKm', parseFloat(e.target.value) || 0, 'min')} placeholder="Min" className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <input type="number" value={localConstraints.deploymentScopeSqKm.max} onChange={e => handleConstraintChange('deploymentScopeSqKm', parseFloat(e.target.value) || 0, 'max')} placeholder="Max" className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <label className="block text-gray-300 text-sm font-bold mt-2 mb-1">Preferred Architecture Topology</label>
              <select value={localConstraints.deploymentScopeSqKm.preferredArchitectureTopology} onChange={e => handleConstraintChange('deploymentScopeSqKm', e.target.value, 'preferredArchitectureTopology')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['centralized', 'decentralized', 'hybrid'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {/* ESG Investment & Carbon Neutrality */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">ESG Investment Target (%)</label>
              <input type="number" value={localConstraints.esgInvestmentTargetPercent} onChange={e => handleConstraintChange('esgInvestmentTargetPercent', parseFloat(e.target.value) || 0)} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <label className="block text-gray-300 text-sm font-bold mb-1">Carbon Neutrality Target Year</label>
              <input type="number" value={localConstraints.carbonNeutralityTargetYear} onChange={e => handleConstraintChange('carbonNeutralityTargetYear', parseInt(e.target.value) || 0)} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Real-Time Settlement & Financial Inclusion */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Real-Time Settlement Coverage (%)</label>
              <input type="number" value={localConstraints.realTimeSettlementCoverageTargetPercent} onChange={e => handleConstraintChange('realTimeSettlementCoverageTargetPercent', parseFloat(e.target.value) || 0)} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <label className="block text-gray-300 text-sm font-bold mb-1">Financial Inclusion Target Index</label>
              <input type="number" step="0.01" value={localConstraints.financialInclusionTargetIndex} onChange={e => handleConstraintChange('financialInclusionTargetIndex', parseFloat(e.target.value) || 0)} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Regulatory Preferences - Digital Asset Classification */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Digital Asset Classification Preference</label>
              <select value={localConstraints.regulatoryPreferences.digitalAssetClassificationPreference} onChange={e => handleConstraintChange('regulatoryPreferences', e.target.value, 'digitalAssetClassificationPreference')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['security-token-focused', 'utility-token-focused', 'nft-focused', 'mixed'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {/* Regulatory Preferences - Innovation Hub Focus */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Innovation Hub Focus</label>
              <select value={localConstraints.regulatoryPreferences.innovationHubFocus} onChange={e => handleConstraintChange('regulatoryPreferences', e.target.value, 'innovationHubFocus')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['regulatory-sandbox', 'fintech-lab', 'defi-focused'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {/* Regulatory Preferences - Compliance Strictness */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Compliance Strictness</label>
              <select value={localConstraints.regulatoryPreferences.complianceStrictness} onChange={e => handleConstraintChange('regulatoryPreferences', e.target.value, 'complianceStrictness')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['low', 'medium', 'high'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {/* DLT Optimization Focus & Cyber Resilience */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">DLT Optimization Focus</label>
              <select value={localConstraints.dlcOptimizationFocus} onChange={e => handleConstraintChange('dlcOptimizationFocus', e.target.value)} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['energy-efficiency', 'throughput', 'security', 'cost'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <label className="block text-gray-300 text-sm font-bold mb-1">Cyber Resilience Target Rating</label>
              <select value={localConstraints.cyberResilienceTargetRating} onChange={e => handleConstraintChange('cyberResilienceTargetRating', e.target.value)} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['low', 'medium', 'high', 'critical'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {/* Investment Cap & Deployment Timeline */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Total Investment Cap (Millions USD)</label>
              <input type="number" value={localConstraints.totalInvestmentCapMillionsUSD} onChange={e => handleConstraintChange('totalInvestmentCapMillionsUSD', parseFloat(e.target.value) || 0)} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500" />
              <label className="block text-gray-300 text-sm font-bold mb-1">Deployment Timeline (Months)</label>
              <input type="number" value={localConstraints.deploymentTimelineMonths} onChange={e => handleConstraintChange('deploymentTimelineMonths', parseInt(e.target.value) || 0)} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Data Sovereignty & Agentic Automation */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Data Sovereignty Compliance Level</label>
              <select value={localConstraints.dataSovereigntyComplianceLevel} onChange={e => handleConstraintChange('dataSovereigntyComplianceLevel', e.target.value)} className="w-full p-2 mb-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['local', 'regional', 'global'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <label className="block text-gray-300 text-sm font-bold mb-1">Agentic Automation Target (%)</label>
              <input type="number" value={localConstraints.agenticAutomationTargetPercent} onChange={e => handleConstraintChange('agenticAutomationTargetPercent', parseFloat(e.target.value) || 0)} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Socio-Economic Financial Goals */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
              <h4 className="block text-gray-300 text-sm font-bold mb-2">Socio-Economic Financial Goals</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Financial Literacy Improvement (%)</label>
                  <input type="number" step="0.1" value={localConstraints.socioEconomicFinancialGoals.financialLiteracyImprovementPercent} onChange={e => handleConstraintChange('socioEconomicFinancialGoals', parseFloat(e.target.value) || 0, 'financialLiteracyImprovementPercent')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Microfinance Uptake Improvement (%)</label>
                  <input type="number" step="0.1" value={localConstraints.socioEconomicFinancialGoals.microfinanceUptakeImprovementPercent} onChange={e => handleConstraintChange('socioEconomicFinancialGoals', parseFloat(e.target.value) || 0, 'microfinanceUptakeImprovementPercent')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">DeFi Integration Emphasis</label>
                  <select value={localConstraints.socioEconomicFinancialGoals.defiIntegrationEmphasis} onChange={e => handleConstraintChange('socioEconomicFinancialGoals', e.target.value, 'defiIntegrationEmphasis')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                    {['low', 'medium', 'high'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1">Social Equity Investment Target Index</label>
                  <input type="number" step="0.01" min="0" max="1" value={localConstraints.socioEconomicFinancialGoals.socialEquityInvestmentTargetIndex} onChange={e => handleConstraintChange('socioEconomicFinancialGoals', parseFloat(e.target.value) || 0, 'socialEquityInvestmentTargetIndex')} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
                </div>
              </div>
            </div>
            {/* Critical Deployment Zones (Expanded input for demo) */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-gray-300 text-sm font-bold mb-2">Critical Deployment Zones (Name, Type, Coordinates, Investment Intensity - one per line)</label>
              <textarea
                className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500"
                rows={4}
                value={localConstraints.criticalDeploymentZones.map(p => `${p.name}, ${p.type}, ${p.coordinates}, ${p.investmentIntensity}`).join('\n')}
                onChange={(e) => {
                  const zones = e.target.value.split('\n').map(line => {
                    const parts = line.split(',').map(p => p.trim());
                    return parts.length >= 4 ? { name: parts[0], type: parts[1] as any, coordinates: parts[2], investmentIntensity: parts[3] as any } : null;
                  }).filter(Boolean) as any;
                  handleConstraintChange('criticalDeploymentZones', zones);
                }}
                placeholder="Global Liquidity Hub, digital-asset, lat:X,lon:Y, high&#10;Regulatory Oversight Node, compliance, lat:A,lon:B, medium"
              ></textarea>
            </div>
            {/* Disaster Recovery Strategies */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-gray-300 text-sm font-bold mb-2">Disaster Recovery Strategies (comma-separated)</label>
              <input type="text" value={localConstraints.disasterRecoveryStrategies.join(', ')} onChange={e => handleConstraintChange('disasterRecoveryStrategies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500" />
            </div>
            {/* Stakeholder Engagement Strategy */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <label className="block text-gray-300 text-sm font-bold mb-1">Stakeholder Engagement Strategy</label>
              <select value={localConstraints.stakeholderEngagementStrategy} onChange={e => handleConstraintChange('stakeholderEngagementStrategy', e.target.value)} className="w-full p-2 bg-gray-600 rounded-md text-white border-gray-500">
                {['online-platform', 'regulatory-workshops', 'hybrid'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-4 border-t border-gray-700">
        <button
          onClick={handleGenerateBlueprint}
          disabled={!currentProject || !localConstraints}
          className="flex-1 p-3 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md text-lg"
          aria-label="Generate a new financial infrastructure blueprint"
        >
          Generate New Financial Blueprint
        </button>
        <button
          onClick={handleRefineBlueprint}
          disabled={!currentProject || !activeBlueprint || !localConstraints}
          className="flex-1 p-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md text-lg"
          aria-label="Refine the current active financial infrastructure blueprint"
        >
          Refine Current Blueprint (v{activeBlueprint?.version || 0})
        </button>
      </div>
    </div>
  );
};

/**
 * Component for visualizing the active financial infrastructure blueprint, including various data layers
 * and a placeholder for advanced 3D architectural model integration.
 * This module provides unparalleled transparency and strategic insight into complex financial system designs.
 */
export const ExportedPlanVisualization: React.FC = () => {
  const { activeBlueprint } = useUrbanSymphony();
  const [activeLayer, setActiveLayer] = useState<keyof FinancialInfrastructureBlueprint['dataLayers'] | 'baseDiagram'>('baseDiagram');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [diagramOffset, setDiagramOffset] = useState({ x: 0, y: 0 }); // For drag/pan
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  /** Handles the start of a drag event on the architecture diagram. */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartDrag({ x: e.clientX - diagramOffset.x, y: e.clientY - diagramOffset.y });
  }, [diagramOffset]);

  /** Handles the drag movement for panning the architecture diagram. */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setDiagramOffset({ x: e.clientX - startDrag.x, y: e.clientY - startDrag.y });
  }, [isDragging, startDrag]);

  /** Handles the end of a drag event. */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /** Handles zooming the architecture diagram using the scroll wheel. */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 1.1;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let newZoom = zoomLevel;
    if (e.deltaY < 0) { // Zoom in
      newZoom = Math.min(3, zoomLevel * scaleFactor);
    } else { // Zoom out
      newZoom = Math.max(0.5, zoomLevel / scaleFactor);
    }

    // Adjust offset to zoom towards the mouse pointer
    const ratio = newZoom / zoomLevel;
    const newOffsetX = mouseX - (mouseX - diagramOffset.x) * ratio;
    const newOffsetY = mouseY - (mouseY - diagramOffset.y) * ratio;

    setZoomLevel(newZoom);
    setDiagramOffset({ x: newOffsetX, y: newOffsetY });
  }, [zoomLevel, diagramOffset]);

  if (!activeBlueprint) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg mb-8 text-center text-gray-400 border border-gray-700 shadow-xl">
        No active financial infrastructure blueprint to visualize. Please generate or select a blueprint from the 'Project Management' tab.
      </div>
    );
  }

  const blueprintLayers: { [key: string]: { label: string; url: string; isActive: boolean; description: string } } = {
    baseDiagram: { label: 'Base Architecture', url: activeBlueprint.architectureDiagramUrl, isActive: activeLayer === 'baseDiagram', description: 'The foundational logical and physical layout of the financial infrastructure.' },
    digitalAssetDistributionMap: { label: 'Digital Asset Distribution', url: activeBlueprint.dataLayers.digitalAssetDistributionMap, isActive: activeLayer === 'digitalAssetDistributionMap', description: 'Heatmap showing concentration and flow of various digital asset classes.' },
    programmableValueRailsMap: { label: 'Programmable Value Rails', url: activeBlueprint.dataLayers.programmableValueRailsMap, isActive: activeLayer === 'programmableValueRailsMap', description: 'Overlay of high-speed programmable value and settlement rails.' },
    esgInvestmentOverlayMap: { label: 'ESG Investment Zones', url: activeBlueprint.dataLayers.esgInvestmentOverlayMap, isActive: activeLayer === 'esgInvestmentOverlayMap', description: 'Visualization of areas prioritized for green bonds, social impact, and sustainable finance.' },
    agentActivityHeatmap: { label: 'Agent Activity Heatmap', url: activeBlueprint.dataLayers.agentActivityHeatmap, isActive: activeLayer === 'agentActivityHeatmap', description: 'Density map showing real-time activity and interaction points of intelligent automation agents.' },
    digitalIdentityVerificationMap: { label: 'Digital Identity Verification', url: activeBlueprint.dataLayers.digitalIdentityVerificationMap, isActive: activeLayer === 'digitalIdentityVerificationMap', description: 'Locations and density of KYC/AML verification nodes and digital identity integration points.' },
    financialInnovationZonesMap: { label: 'Financial Innovation Zones', url: activeBlueprint.dataLayers.financialInnovationZonesMap, isActive: activeLayer === 'financialInnovationZonesMap', description: 'Designated regulatory sandboxes, fintech labs, and DeFi innovation districts.' },
    cyberSecurityRiskMap: { label: 'Cyber Security Risk Map', url: activeBlueprint.dataLayers.cyberSecurityRiskMap, isActive: activeLayer === 'cyberSecurityRiskMap', description: 'Heatmap displaying areas of elevated cybersecurity risk or vulnerability within the infrastructure.' },
    realTimeSettlementFlowMap: { label: 'Real-Time Settlement Flow', url: activeBlueprint.dataLayers.realTimeSettlementFlowMap, isActive: activeLayer === 'realTimeSettlementFlowMap', description: 'Dynamic visualization of real-time payment and settlement transactions across the network.' },
    dlcEnergyConsumptionMap: { label: 'DLT Energy Consumption', url: activeBlueprint.dataLayers.dlcEnergyConsumptionMap, isActive: activeLayer === 'dlcEnergyConsumptionMap', description: 'Visualization of energy consumption hotspots related to Distributed Ledger Technology operations.' },
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-xl border border-gray-700">
      <ExportedSectionTitle title={`Financial Infrastructure Blueprint Visualization: ${activeBlueprint.name} (v${activeBlueprint.version})`} />
      <p className="text-gray-400 mb-6">Explore the generated financial infrastructure blueprint through interactive architecture diagrams and specialized data layers. Gain critical insights into its spatial organization, operational performance, and compliance posture.</p>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Diagram View */}
        <div className="flex-1 bg-gray-700 rounded-lg overflow-hidden relative shadow-lg h-[500px] xl:h-[700px] border border-gray-600">
          <div
            className="w-full h-full relative cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ overflow: 'hidden' }}
          >
            <img
              src={activeBlueprint.architectureDiagramUrl}
              alt="Generated Financial Infrastructure Blueprint Base Diagram"
              className="absolute top-0 left-0 object-cover"
              style={{
                width: `${100 * zoomLevel}%`,
                height: `${100 * zoomLevel}%`,
                transform: `translate(${diagramOffset.x}px, ${diagramOffset.y}px)`,
                pointerEvents: 'none',
              }}
            />
            {activeLayer !== 'baseDiagram' && blueprintLayers[activeLayer] && (
              <img
                src={blueprintLayers[activeLayer]?.url}
                alt={`${blueprintLayers[activeLayer]?.label} Overlay`}
                className="absolute top-0 left-0 object-contain mix-blend-overlay opacity-80"
                style={{
                  width: `${100 * zoomLevel}%`,
                  height: `${100 * zoomLevel}%`,
                  transform: `translate(${diagramOffset.x}px, ${diagramOffset.y}px)`,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>

          {/* Diagram Controls */}
          <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-75 text-white p-3 rounded-lg shadow-xl flex flex-col items-center space-y-2 z-10">
            <button
              onClick={() => { setZoomLevel(z => Math.min(3, z * 1.2)); setDiagramOffset({ x: diagramOffset.x * 1.2, y: diagramOffset.y * 1.2 }); }}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-bold w-full"
              aria-label="Zoom in diagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
            <span className="text-xs text-gray-400">{zoomLevel.toFixed(1)}x</span>
            <button
              onClick={() => { setZoomLevel(z => Math.max(0.5, z / 1.2)); setDiagramOffset({ x: diagramOffset.x / 1.2, y: diagramOffset.y / 1.2 }); }}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-bold w-full"
              aria-label="Zoom out diagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
            </button>
            <button
              onClick={() => { setZoomLevel(1); setDiagramOffset({ x: 0, y: 0 }); }}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-xs font-bold w-full mt-2"
              aria-label="Reset diagram zoom and position"
            >
              Reset View
            </button>
          </div>
        </div>

        {/* Layer Selection and Metadata */}
        <div className="w-full xl:w-80 p-5 bg-gray-700 rounded-lg shadow-lg border border-gray-600 flex-shrink-0">
          <h3 className="text-xl font-bold text-cyan-300 mb-4">Data Layers</h3>
          <p className="text-gray-400 text-sm mb-4">Toggle various data overlays to gain specific insights into your financial infrastructure blueprint.</p>
          <div className="space-y-3">
            {Object.entries(blueprintLayers).map(([key, layer]) => (
              <label key={key} className="flex items-center text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="blueprintLayer"
                  value={key}
                  checked={activeLayer === key}
                  onChange={() => setActiveLayer(key as keyof FinancialInfrastructureBlueprint['dataLayers'] | 'baseDiagram')}
                  className="form-radio h-4 w-4 text-cyan-500 bg-gray-600 border-gray-500 focus:ring-cyan-500 transition-colors"
                />
                <span className="ml-3 text-base">{layer.label}</span>
              </label>
            ))}
          </div>

          {activeLayer && blueprintLayers[activeLayer] && (
            <div className="mt-6 p-4 bg-gray-800 rounded-md border border-gray-700">
              <h4 className="font-semibold text-cyan-200 mb-2">{blueprintLayers[activeLayer]?.label}</h4>
              <p className="text-sm text-gray-400">{blueprintLayers[activeLayer]?.description}</p>
            </div>
          )}

          {/* Placeholder for 3D Model Integration */}
          <div className="mt-8 pt-5 border-t border-gray-600">
            <h3 className="text-xl font-bold text-cyan-300 mb-3">Advanced Architectural Visualization</h3>
            <p className="text-gray-400 text-sm italic">
              Integrating with external 3D rendering engines (e.g., Unity, Unreal Engine) for immersive, real-time architectural walk-throughs and detailed component inspections.
            </p>
            <button className="mt-4 w-full p-3 bg-blue-700 hover:bg-blue-800 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Launch 3D Architecture Model (Mock)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```