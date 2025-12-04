import React, { useState, useContext, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { View } from './types';
import { DataContext } from './context/DataContext';
import FeatureGuard from './components/FeatureGuard';
import MetaDashboardView from './components/views/platform/MetaDashboardView';
import { ModalView } from './components/ModalView';

// --- NEW FRAMEWORK VIEWS ---
import AgentMarketplaceView from './components/views/platform/AgentMarketplaceView';
import OrchestrationView from './components/views/platform/OrchestrationView';
import DataMeshView from './components/views/platform/DataMeshView';
import DataCommonsView from './components/views/platform/DataCommonsView';
import MainframeView from './components/views/platform/MainframeView';
import AIGovernanceView from './components/views/platform/AIGovernanceView';
import AIRiskRegistryView from './components/views/platform/AIRiskRegistryView';
import OSPOView from './components/views/platform/OSPOView';
import CiCdView from './components/views/platform/CiCdView';
import InventionsView from './components/views/platform/InventionsView';
import RoadmapView from './components/views/platform/RoadmapView';
import ConnectView from './components/views/platform/DemoBankConnectView';
import EconomicSynthesisEngineView from './components/views/platform/EconomicSynthesisEngineView';
import TaskMatrixView from './components/views/productivity/TaskMatrixView';
import LedgerExplorerView from './components/views/platform/LedgerExplorerView';

// --- EXPANDED AI & COGNITIVE INFRASTRUCTURE VIEWS ---
import CognitiveServicesHubView from './components/views/platform/CognitiveServicesHubView';
import NeuroLinguisticCompilerView from './components/views/platform/NeuroLinguisticCompilerView';
import SelfOptimizingNetworkView from './components/views/platform/SelfOptimizingNetworkView';
import FederatedLearningView from './components/views/platform/FederatedLearningView';
import HyperpersonalizationEngineView from './components/views/platform/HyperpersonalizationEngineView';
import PredictiveAnalyticsSuiteView from './components/views/platform/PredictiveAnalyticsSuiteView';
import GenerativeAIStudioView from './components/views/platform/GenerativeAIStudioView';
import AIResourceOrchestratorView from './components/views/platform/AIResourceOrchestratorView';
import QuantumMachineLearningView from './components/views/platform/QuantumMachineLearningView';
import SemanticSearchEngineView from './components/views/platform/SemanticSearchEngineView';
import EthicalAIAuditTrailView from './components/views/platform/EthicalAIAuditTrailView';
import ExplainableAIInsightView from './components/views/platform/ExplainableAIInsightView';
import DigitalTwinManagementView from './components/views/platform/DigitalTwinManagementView';
import HumanAILoopOrchestratorView from './components/views/platform/HumanAILoopOrchestratorView';
import AutonomousAgentFrameworkView from './components/views/platform/AutonomousAgentFrameworkView';
import AIWorkloadSchedulerView from './components/views/platform/AIWorkloadSchedulerView';
import IntelligentAutomationCenterView from './components/views/platform/IntelligentAutomationCenterView';
import AIModelGovernanceView from './components/views/platform/AIModelGovernanceView';
import ReinforcementLearningLabView from './components/views/platform/ReinforcementLearningLabView';
import CognitiveDecisionSupportView from './components/views/platform/CognitiveDecisionSupportView';

// --- QUANTUM & ADVANCED COMPUTING VIEWS ---
import QuantumSimulationLabView from './components/views/platform/QuantumSimulationLabView';
import EntanglementFabricView from './components/views/platform/EntanglementFabricView';
import TopologicalQuantumComputingView from './components/views/platform/TopologicalQuantumComputingView';
import PhotonicQuantumNetworkView from './components/views/platform/PhotonicQuantumNetworkView';
import NeuromorphicComputingHubView from './components/views/platform/NeuromorphicComputingHubView';
import BiocomputingInterfaceView from './components/views/platform/BiocomputingInterfaceView';

// --- DECENTRALIZED & WEB3 ENTERPRISE VIEWS ---
import DecentralizedIdentityView from './components/views/platform/DecentralizedIdentityView';
import TokenomicsDesignStudioView from './components/views/platform/TokenomicsDesignStudioView';
import DAOOperatingSystemView from './components/views/platform/DAOOperatingSystemView';
import SmartContractAuditorView from './components/views/platform/SmartContractAuditorView';
import InterchainConnectivityView from './components/views/platform/InterchainConnectivityView';
import VerifiableCredentialsView from './components/views/platform/VerifiableCredentialsView';
import DecentralizedStorageGridView from './components/views/platform/DecentralizedStorageGridView';
import NFTFractionalizationView from './components/views/platform/NFTFractionalizationView';

// --- GLOBAL ECONOMIC & FINANCIAL STRATEGY VIEWS ---
import GeopoliticalRiskEngineView from './components/views/platform/GeopoliticalRiskEngineView';
import GlobalTradeOptimizerView from './components/views/platform/GlobalTradeOptimizerView';
import CarbonCreditExchangeView from './components/views/platform/CarbonCreditExchangeView';
import SovereignWealthAllocatorView from './components/views/platform/SovereignWealthAllocatorView';
import MacroEconomicSimulatorView from './components/views/platform/MacroEconomicSimulatorView';
import ResourceAllocationMatrixView from './components/views/platform/ResourceAllocationMatrixView';

// --- FOUNDATIONAL & LEGACY VIEWS ---
// Personal Finance Views
import DashboardView from './components/views/personal/DashboardView';
import TransactionsView from './components/views/personal/TransactionsView';
import SendMoneyView from './components/views/personal/SendMoneyView';
import BudgetsView from './components/views/personal/BudgetsView';
import InvestmentsView from './components/InvestmentsView';
import PortfolioExplorerView from './components/views/personal/PortfolioExplorerView';
import CryptoView from './components/views/personal/CryptoView';
import FinancialGoalsView from './components/views/personal/FinancialGoalsView';
import MarketplaceView from './components/views/personal/MarketplaceView';
import PersonalizationView from './components/views/personal/PersonalizationView';
import CardCustomizationView from './components/views/personal/CardCustomizationView';
import RewardsHubView from './components/views/personal/RewardsHubView';
import CreditHealthView from './components/views/personal/CreditHealthView';
import SecurityView from './components/views/personal/SecurityView';
import OpenBankingView from './components/views/personal/OpenBankingView';
import SettingsView from './components/views/personal/SettingsView';
import WellnessFinanceView from './components/views/personal/WellnessFinanceView';
import GenerationalWealthView from './components/views/personal/GenerationalWealthView';
import SustainableInvestmentsView from './components/views/personal/SustainableInvestmentsView';
import MicroLendingView from './components/views/personal/MicroLendingView';
import HyperPersonalBudgetView from './components/views/personal/HyperPersonalBudgetView';

// AI & Platform Views
import AIAdvisorView from './components/views/platform/AIAdvisorView';
import QuantumWeaverView from './components/views/platform/QuantumWeaverView';
import QuantumOracleView from './components/views/platform/QuantumOracleView';
import AIAdStudioView from './components/views/platform/AIAdStudioView';
import TheVisionView from './components/views/platform/TheVisionView';
import APIStatusView from './components/views/platform/APIStatusView';
import TheNexusView from './components/views/platform/TheNexusView'; // The 27th Module
import ConstitutionalArticleView from './components/views/platform/ConstitutionalArticleView';
import TheCharterView from './components/views/platform/TheCharterView';
import FractionalReserveView from './components/views/platform/FractionalReserveView';
import FinancialInstrumentForgeView from './components/views/platform/TheAssemblyView';

// Corporate Finance Views
import CorporateDashboardView from './components/views/corporate/CorporateDashboardView';
import PaymentOrdersView from './components/views/corporate/PaymentOrdersView';
import CounterpartiesView from './components/views/corporate/CounterpartiesView';
import InvoicesView from './components/views/corporate/InvoicesView';
import ComplianceView from './components/views/corporate/ComplianceView';
import AnomalyDetectionView from './components/views/corporate/AnomalyDetectionView';
import PayrollView from './components/views/corporate/PayrollView';
import SupplyChainFinanceView from './components/views/corporate/SupplyChainFinanceView';
import TreasuryOptimizationView from './components/views/corporate/TreasuryOptimizationView';
import AlgorithmicTradingView from './components/views/corporate/AlgorithmicTradingView';
import CorporateVenturesView from './components/views/corporate/CorporateVenturesView';
import PredictiveCashFlowView from './components/views/corporate/PredictiveCashFlowView';
import ESGReportingView from './components/views/corporate/ESGReportingView';

// Demo Bank Platform Views
import DemoBankSocialView from './components/views/platform/DemoBankSocialView';
import DemoBankERPView from './components/views/platform/DemoBankERPView';
import DemoBankCRMView from './components/views/platform/DemoBankCRMView';
import DemoBankAPIGatewayView from './components/views/platform/DemoBankAPIGatewayView';
import DemoBankGraphExplorerView from './components/views/platform/DemoBankGraphExplorerView';
import DemoBankDBQLView from './components/views/platform/DemoBankDBQLView';
import DemoBankCloudView from './components/views/platform/DemoBankCloudView';
import DemoBankIdentityView from './components/views/platform/DemoBankIdentityView';
import DemoBankStorageView from './components/views/platform/DemoBankStorageView';
import DemoBankComputerView from './components/views/platform/DemoBankComputerView';
import DemoBankAIPlatformView from './components/views/platform/DemoBankAIPlatformView';
import DemoBankMachineLearningView from './components/views/platform/DemoBankMachineLearningView';
import DemoBankDevOpsView from './components/views/platform/DemoBankDevOpsView';
import DemoBankSecurityCenterView from './components/views/platform/DemoBankSecurityCenterView';
import DemoBankComplianceHubView from './components/views/platform/DemoBankComplianceHubView';
import DemoBankAppMarketplaceView from './components/views/platform/DemoBankAppMarketplaceView';
import DemoBankEventsView from './components/views/platform/DemoBankEventsView';
import DemoBankLogicAppsView from './components/views/platform/DemoBankLogicAppsView';
import DemoBankFunctionsView from './components/views/platform/DemoBankFunctionsView';
import DemoBankDataFactoryView from './components/views/platform/DemoBankDataFactoryView';
import DemoBankAnalyticsView from './components/views/platform/DemoBankAnalyticsView';
import DemoBankBIView from './components/views/platform/DemoBankBIView';
import DemoBankIoTHubView from './components/views/platform/DemoBankIoTHubView';
import DemoBankMapsView from './components/views/platform/DemoBankMapsView';
import DemoBankCommunicationsView from './components/views/platform/DemoBankCommunicationsView';
import DemoBankCommerceView from './components/views/platform/DemoBankCommerceView';
import DemoBankTeamsView from './components/views/platform/DemoBankTeamsView';
import DemoBankCMSView from './components/views/platform/DemoBankCMSView';
import DemoBankLMSView from './components/views/platform/DemoBankLMSView';
import DemoBankHRISView from './components/views/platform/DemoBankHRISView';
import DemoBankProjectsView from './components/views/platform/DemoBankProjectsView';
import DemoBankLegalSuiteView from './components/views/platform/DemoBankLegalSuiteView';
import DemoBankSupplyChainView from './components/views/platform/DemoBankSupplyChainView';
import DemoBankPropTechView from './components/views/platform/DemoBankPropTechView';
import DemoBankGamingServicesView from './components/views/platform/DemoBankGamingServicesView';
import DemoBankBookingsView from './components/views/platform/DemoBankBookingsView';
import DemoBankCDPView from './components/views/platform/DemoBankCDPView';
import DemoBankQuantumServicesView from './components/views/platform/DemoBankQuantumServicesView';
import DemoBankBlockchainView from './components/views/platform/DemoBankBlockchainView';
import DemoBankGISView from './components/views/platform/DemoBankGISView';
import DemoBankRoboticsView from './components/views/platform/DemoBankRoboticsView';
import DemoBankSimulationsView from './components/views/platform/DemoBankSimulationsView';
import DemoBankVoiceServicesView from './components/views/platform/DemoBankVoiceServicesView';
import DemoBankSearchSuiteView from './components/views/platform/DemoBankSearchSuiteView';
import DemoBankDigitalTwinView from './components/views/platform/DemoBankDigitalTwinView';
import DemoBankWorkflowEngineView from './components/views/platform/DemoBankWorkflowEngineView';
import DemoBankObservabilityPlatformView from './components/views/platform/DemoBankObservabilityPlatformView';
import DemoBankFeatureManagementView from './components/views/platform/DemoBankFeatureManagementView';
import DemoBankExperimentationPlatformView from './components/views/platform/DemoBankExperimentationPlatformView';
import DemoBankLocalizationPlatformView from './components/views/platform/DemoBankLocalizationPlatformView';
import DemoBankFleetManagementView from './components/views/platform/DemoBankFleetManagementView';
import DemoBankKnowledgeBaseView from './components/views/platform/DemoBankKnowledgeBaseView';
import DemoBankMediaServicesView from './components/views/platform/DemoBankMediaServicesView';
import DemoBankEventGridView from './components/views/platform/DemoBankEventGridView';
import DemoBankApiManagementView from './components/views/platform/DemoBankApiManagementView';

// --- EXPANDED DEMO BANK PLATFORM SERVICES ---
import DemoBankHyperledgerFabricView from './components/views/platform/DemoBankHyperledgerFabricView';
import DemoBankFederatedIdentityView from './components/views/platform/DemoBankFederatedIdentityView';
import DemoBankAIEthicsMonitorView from './components/views/platform/DemoBankAIEthicsMonitorView';
import DemoBankGenerativeDataSuiteView from './components/views/platform/DemoBankGenerativeDataSuiteView';
import DemoBankQuantumSafeSecurityView from './components/views/platform/DemoBankQuantumSafeSecurityView';
import DemoBankEcosystemConnectorsView from './components/views/platform/DemoBankEcosystemConnectorsView';
import DemoBankRegulatorySandboxEnvView from './components/views/platform/DemoBankRegulatorySandboxEnvView';
import DemoBankPredictiveMaintenanceView from './components/views/platform/DemoBankPredictiveMaintenanceView';
import DemoBankCognitiveProcessAutomationView from './components/views/platform/DemoBankCognitiveProcessAutomationView';
import DemoBankSpatialComputingView from './components/views/platform/DemoBankSpatialComputingView';
import DemoBankBiometricAuthView from './components/views/platform/DemoBankBiometricAuthView';
import DemoBankNeuromorphicAnalyticsView from './components/views/platform/DemoBankNeuromorphicAnalyticsView';
import DemoBankDeFiIntegrationView from './components/views/platform/DemoBankDeFiIntegrationView';
import DemoBankCentralBankDigitalCurrencyView from './components/views/platform/DemoBankCentralBankDigitalCurrencyView';
import DemoBankUniversalBasicIncomeView from './components/views/platform/DemoBankUniversalBasicIncomeView';
import DemoBankDynamicPricingEngineView from './components/views/platform/DemoBankDynamicPricingEngineView';
import DemoBankSustainableFinanceView from './components/views/platform/DemoBankSustainableFinanceView';
import DemoBankImpactInvestmentView from './components/views/platform/DemoBankImpactInvestmentView';
import DemoBankMicroservicesOrchestrationView from './components/views/platform/DemoBankMicroservicesOrchestrationView';
import DemoBankEdgeComputingView from './components/views/platform/DemoBankEdgeComputingView';
import DemoBankAIOpsView from './components/views/platform/DemoBankAIOpsView';
import DemoBankChaosEngineeringView from './components/views/platform/DemoBankChaosEngineeringView';

// Mega Dashboard Views (no change, just for completeness)
import AccessControlsView from './components/views/megadashboard/security/AccessControlsView';
import RoleManagementView from './components/views/megadashboard/security/RoleManagementView';
import AuditLogsView from './components/views/megadashboard/security/AuditLogsView';
import FraudDetectionView from './components/views/megadashboard/security/FraudDetectionView';
import ThreatIntelligenceView from './components/views/megadashboard/security/ThreatIntelligenceView';
import CardManagementView from './components/views/megadashboard/finance/CardManagementView';
import LoanApplicationsView from './components/views/megadashboard/finance/LoanApplicationsView';
import MortgagesView from './components/views/megadashboard/finance/MortgagesView';
import InsuranceHubView from './components/views/megadashboard/finance/InsuranceHubView';
import TaxCenterView from './components/views/megadashboard/finance/TaxCenterView';
import PredictiveModelsView from './components/views/megadashboard/analytics/PredictiveModelsView';
import RiskScoringView from './components/views/megadashboard/analytics/RiskScoringView';
import SentimentAnalysisView from './components/views/megadashboard/analytics/SentimentAnalysisView';
import DataLakesView from './components/views/megadashboard/analytics/DataLakesView';
import DataCatalogView from './components/views/megadashboard/analytics/DataCatalogView';
import ClientOnboardingView from './components/views/megadashboard/userclient/ClientOnboardingView';
import KycAmlView from './components/views/megadashboard/userclient/KycAmlView';
import UserInsightsView from './components/views/megadashboard/userclient/UserInsightsView';
import FeedbackHubView from './components/views/megadashboard/userclient/FeedbackHubView';
import SupportDeskView from './components/views/megadashboard/userclient/SupportDeskView';
import SandboxView from './components/views/megadashboard/developer/SandboxView';
import SdkDownloadsView from './components/views/megadashboard/developer/SdkDownloadsView';
import WebhooksView from './components/views/megadashboard/developer/WebhooksView';
import CliToolsView from './components/views/megadashboard/developer/CliToolsView';
import ExtensionsView from './components/views/megadashboard/developer/ExtensionsView';
import ApiKeysView from './components/views/megadashboard/developer/ApiKeysView';
import ApiContractsView from './components/views/developer/ApiContractsView';
import PartnerHubView from './components/views/megadashboard/ecosystem/PartnerHubView';
import AffiliatesView from './components/views/megadashboard/ecosystem/AffiliatesView';
import IntegrationsMarketplaceView from './components/views/megadashboard/ecosystem/IntegrationsMarketplaceView';
import CrossBorderPaymentsView from './components/views/megadashboard/ecosystem/CrossBorderPaymentsView';
import MultiCurrencyView from './components/views/megadashboard/ecosystem/MultiCurrencyView';
import NftVaultView from './components/views/megadashboard/digitalassets/NftVaultView';
import TokenIssuanceView from './components/views/megadashboard/digitalassets/TokenIssuanceView';
import SmartContractsView from './components/views/megadashboard/digitalassets/SmartContractsView';
import DaoGovernanceView from './components/views/megadashboard/digitalassets/DaoGovernanceView';
import OnChainAnalyticsView from './components/views/megadashboard/digitalassets/OnChainAnalyticsView';
import SalesPipelineView from './components/views/megadashboard/business/SalesPipelineView';
import MarketingAutomationView from './components/views/megadashboard/business/MarketingAutomationView';
import GrowthInsightsView from './components/views/megadashboard/business/GrowthInsightsView';
import CompetitiveIntelligenceView from './components/views/megadashboard/business/CompetitiveIntelligenceView';
import BenchmarkingView from './components/views/megadashboard/business/BenchmarkingView';
import LicensingView from './components/views/megadashboard/regulation/LicensingView';
import DisclosuresView from './components/views/megadashboard/regulation/DisclosuresView';
import LegalDocsView from './components/views/megadashboard/regulation/LegalDocsView';
import RegulatorySandboxView from './components/views/megadashboard/regulation/RegulatorySandboxView';
import ConsentManagementView from './components/views/megadashboard/regulation/ConsentManagementView';
import ContainerRegistryView from './components/views/megadashboard/infra/ContainerRegistryView';
import ApiThrottlingView from './components/views/megadashboard/infra/ApiThrottlingView';
import ObservabilityView from './components/views/megadashboard/infra/ObservabilityView';
import IncidentResponseView from './components/views/megadashboard/infra/IncidentResponseView';
import BackupRecoveryView from './components/views/megadashboard/infra/BackupRecoveryView';

// --- EXPANDED MEGA DASHBOARD VIEWS ---
// Security & Identity Deep Dive
import ThreatModelingView from './components/views/megadashboard/security/ThreatModelingView';
import IdentityGovernanceView from './components/views/megadashboard/security/IdentityGovernanceView';
import QuantumSafeCryptoView from './components/views/megadashboard/security/QuantumSafeCryptoView';
import BiometricAuthenticationView from './components/views/megadashboard/security/BiometricAuthenticationView';
import SecurityScorecardView from './components/views/megadashboard/security/SecurityScorecardView';

// Finance & Banking Advanced Services
import StructuredFinanceView from './components/views/megadashboard/finance/StructuredFinanceView';
import DerivativeMarketView from './components/views/megadashboard/finance/DerivativeMarketView';
import AlternativeInvestmentsView from './components/views/megadashboard/finance/AlternativeInvestmentsView';
import PrivateEquityView from './components/views/megadashboard/finance/PrivateEquityView';
import RealEstateFinanceView from './components/views/megadashboard/finance/RealEstateFinanceView';

// Advanced Analytics & AI Insights
import CausalInferenceEngineView from './components/views/megadashboard/analytics/CausalInferenceEngineView';
import CounterfactualSimulatorView from './components/views/megadashboard/analytics/CounterfactualSimulatorView';
import GraphAnalyticsView from './components/views/megadashboard/analytics/GraphAnalyticsView';
import TimeSeriesForecastingView from './components/views/megadashboard/analytics/TimeSeriesForecastingView';
import ExplainableAIView from './components/views/megadashboard/analytics/ExplainableAIView';

// User & Client Engagement
import JourneyOrchestrationView from './components/views/megadashboard/userclient/JourneyOrchestrationView';
import CustomerLifetimeValueView from './components/views/megadashboard/userclient/CustomerLifetimeValueView';
import VoiceOfCustomerView from './components/views/megadashboard/userclient/VoiceOfCustomerView';
import CommunityManagementView from './components/views/megadashboard/userclient/CommunityManagementView';
import PredictiveSupportView from './components/views/megadashboard/userclient/PredictiveSupportView';

// Developer & Ecosystem Empowerment
import APIVersioningView from './components/views/megadashboard/developer/APIVersioningView';
import DevPortalAnalyticsView from './components/views/megadashboard/developer/DevPortalAnalyticsView';
import SDKGeneratorView from './components/views/megadashboard/developer/SDKGeneratorView';
import LowCodeNoCodeStudioView from './components/views/megadashboard/developer/LowCodeNoCodeStudioView';
import BountyProgramView from './components/views/megadashboard/developer/BountyProgramView';

// Ecosystem & Connectivity Evolution
import OpenBankingAPIManagerView from './components/views/megadashboard/ecosystem/OpenBankingAPIManagerView';
import PartnerOnboardingView from './components/views/megadashboard/ecosystem/PartnerOnboardingView';
import SupplyChainTraceabilityView from './components/views/megadashboard/ecosystem/SupplyChainTraceabilityView';
import GlobalPaymentsNetworkView from './components/views/megadashboard/ecosystem/GlobalPaymentsNetworkView';
import DigitalIdentityFederationView from './components/views/megadashboard/ecosystem/DigitalIdentityFederationView';

// Digital Assets & Web3 Advanced
import CentralBankDigitalCurrencySimulatorView from './components/views/megadashboard/digitalassets/CentralBankDigitalCurrencySimulatorView';
import MetaverseAssetRegistryView from './components/views/megadashboard/digitalassets/MetaverseAssetRegistryView';
import TokenizedRealWorldAssetsView from './components/views/megadashboard/digitalassets/TokenizedRealWorldAssetsView';
import Web3AnalyticsPlatformView from './components/views/megadashboard/digitalassets/Web3AnalyticsPlatformView';
import CrossChainInteroperabilityView from './components/views/megadashboard/digitalassets/CrossChainInteroperabilityView';

// Business & Growth Acceleration
import MarketSegmentationAIView from './components/views/megadashboard/business/MarketSegmentationAIView';
import ProductLedGrowthView from './components/views/megadashboard/business/ProductLedGrowthView';
import PricingStrategyEngineView from './components/views/megadashboard/business/PricingStrategyEngineView';
import AcquisitionChannelOptimizerView from './components/views/megadashboard/business/AcquisitionChannelOptimizerView';
import RetentionDynamicsView from './components/views/megadashboard/business/RetentionDynamicsView';

// Regulation & Legal Intelligence
import AIComplianceEngineView from './components/views/megadashboard/regulation/AIComplianceEngineView';
import GlobalRegulatoryWatchView from './components/views/megadashboard/regulation/GlobalRegulatoryWatchView';
import LegalContractAutomationView from './components/views/megadashboard/regulation/LegalContractAutomationView';
import EthicalAIReviewBoardView from './components/views/megadashboard/regulation/EthicalAIReviewBoardView';
import DataPrivacyManagementView from './components/views/megadashboard/regulation/DataPrivacyManagementView';

// Infra & Ops Resilience
import SiteReliabilityEngineeringView from './components/views/megadashboard/infra/SiteReliabilityEngineeringView';
import FinOpsCostOptimizationView from './components/views/megadashboard/infra/FinOpsCostOptimizationView';
import GreenCloudDashboardView from './components/views/megadashboard/infra/GreenCloudDashboardView';
import PredictiveScalingView from './components/views/megadashboard/infra/PredictiveScalingView';
import ResilienceEngineeringView from './components/views/megadashboard/infra/ResilienceEngineeringView';

// Blueprint imports
import CrisisAIManagerView from './components/views/blueprints/CrisisAIManagerView';
import CognitiveLoadBalancerView from './components/views/blueprints/CognitiveLoadBalancerView';
import HolographicMeetingScribeView from './components/views/blueprints/HolographicMeetingScribeView';
import QuantumProofEncryptorView from './components/views/blueprints/QuantumProofEncryptorView';
import EtherealMarketplaceView from './components/views/blueprints/EtherealMarketplaceView';
import AdaptiveUITailorView from './components/views/blueprints/AdaptiveUITailorView';
import UrbanSymphonyPlannerView from './components/views/blueprints/UrbanSymphonyPlannerView';
import PersonalHistorianAIView from './components/views/blueprints/PersonalHistorianAIView';
import DebateAdversaryView from './components/views/blueprints/DebateAdversaryView';
import CulturalAssimilationAdvisorView from './components/views/blueprints/CulturalAssimilationAdvisorView';
import DynamicSoundscapeGeneratorView from './components/views/blueprints/DynamicSoundscapeGeneratorView';
import EmergentStrategyWargamerView from './components/views/blueprints/EmergentStrategyWargamerView';
import EthicalGovernorView from './components/views/blueprints/EthicalGovernorView';
import QuantumEntanglementDebuggerView from './components/views/blueprints/QuantumEntanglementDebuggerView';
import LinguisticFossilFinderView from './components/views/blueprints/LinguisticFossilFinderView';
import ChaosTheoristView from './components/views/blueprints/ChaosTheoristView';
import SelfRewritingCodebaseView from './components/views/blueprints/SelfRewritingCodebaseView';

// Visionary Blueprint Imports
import GenerativeJurisprudenceView from './components/views/blueprints/GenerativeJurisprudenceView';
import AestheticEngineView from './components/views/blueprints/AestheticEngineView';
import NarrativeForgeView from './components/views/blueprints/NarrativeForgeView';
import WorldBuilderView from './components/views/blueprints/WorldBuilderView';
import SonicAlchemyView from './components/views/blueprints/SonicAlchemyView';
import AutonomousScientistView from './components/views/blueprints/AutonomousScientistView';
import ZeitgeistEngineView from './components/views/blueprints/ZeitgeistEngineView';
import CareerTrajectoryView from './components/views/blueprints/CareerTrajectoryView';
import LudicBalancerView from './components/views/blueprints/LudicBalancerView';
import HypothesisEngineView from './components/views/blueprints/HypothesisEngineView';
import LexiconClarifierView from './components/views/blueprints/LexiconClarifierView';
import CodeArcheologistView from './components/views/blueprints/CodeArcheologistView';

// --- HYPER-VISIONARY BLUEPRINT IMPORTS ---
import UniversalTranslatorView from './components/views/blueprints/UniversalTranslatorView';
import DreamSynthesizerView from './components/views/blueprints/DreamSynthesizerView';
import ChronosTemporalPredictorView from './components/views/blueprints/ChronosTemporalPredictorView';
import SentientInterfaceDesignerView from './components/views/blueprints/SentientInterfaceDesignerView';
import EcologicalNetworkBalancerView from './components/views/blueprints/EcologicalNetworkBalancerView';
import MultiverseExplorerView from './components/views/blueprints/MultiverseExplorerView';
import MetaCognitiveDebuggerView from './components/views/blueprints/MetaCognitiveDebuggerView';
import CollectiveConsciousnessAmplifierView from './components/views/blueprints/CollectiveConsciousnessAmplifierView';
import ExistentialRiskMitigatorView from './components/views/blueprints/ExistentialRiskMitigatorView';
import HyperdimensionalDataMapperView from './components/views/blueprints/HyperdimensionalDataMapperView';
import SelfEvolvingSystemArchitectView from './components/views/blueprints/SelfEvolvingSystemArchitectView';
import AlgorithmicMythosCreatorView from './components/views/blueprints/AlgorithmicMythosCreatorView';
import BioIntegratedFinanceView from './components/views/blueprints/BioIntegratedFinanceView';
import PlanetaryResourceAllocatorView from './components/views/blueprints/PlatentaryResourceAllocatorView';
import EmpathicAICompanionView from './components/views/blueprints/EmpathicAICompanionView';
import NeuralNetworkGardenerView from './components/views/blueprints/NeuralNetworkGardenerView';
import RealityComposerView from './components/views/blueprints/RealityComposerView';
import PredictiveGovernanceEngineView from './components/views/blueprints/PredictiveGovernanceEngineView';

// Global Components
import VoiceControl from './components/VoiceControl';
import GlobalChatbot from './components/GlobalChatbot';
import { useFeatureFlagContext } from './context/FeatureFlagContext'; // Assuming this new context exists or will be created
import GlobalNotificationCenter from './components/GlobalNotificationCenter'; // New global component
import UserSessionManager from './components/UserSessionManager'; // New global component

/**
 * @description The root component of the application.
 * It acts as a controller or router, managing the active view and rendering the
 * appropriate child component. It also orchestrates the main layout, including
 * the Sidebar, Header, and main content area. This application is designed
 * as a comprehensive, commercial-grade platform, integrating advanced AI,
 * blockchain, and future-forward financial and operational capabilities.
 * It emphasizes dynamic content delivery, feature control, and an intuitive,
 * powerful user experience suitable for a publisher edition.
 */
const App: React.FC = () => {
    const [activeView, setActiveView] = useState<View>(View.MetaDashboard);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [previousView, setPreviousView] = useState<View | null>(null);
    const dataContext = useContext(DataContext);
    // Assuming a FeatureFlagContext exists for dynamic feature enablement
    const { isFeatureEnabled } = useFeatureFlagContext(); // Use the assumed feature flag context

    const [modalView, setModalView] = useState<View | null>(null);
    const [modalPreviousView, setModalPreviousView] = useState<View | null>(null);

    const openModal = (view: View) => {
        setModalPreviousView(activeView); // The view we are coming from
        setModalView(view);
    };

    const closeModal = () => {
        setModalView(null);
    };

    if (!dataContext) {
        throw new Error("App must be used within a DataProvider");
    }

    const { customBackgroundUrl, activeIllusion, isLoading, error } = dataContext;

    const handleSetView = (view: View) => {
        if (view !== activeView) {
            setPreviousView(activeView);
            setActiveView(view);
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            }
        }
    };
    
    if (error) {
        return (
           <div className="fixed inset-0 bg-gray-950 z-50 flex items-center justify-center p-4">
               <div className="bg-gray-900 border border-red-700 rounded-xl p-8 max-w-lg text-center">
                   <h1 className="text-2xl font-bold text-red-400 mb-4">Connection Error</h1>
                   <p className="text-gray-400 mb-6">{error}</p>
                   <p className="text-xs text-gray-500">Please ensure the backend server is running. You may need to refresh the page after starting the server.</p>
               </div>
           </div>
       );
   }
    
    /**
     * @description The main view renderer. It uses a switch statement to determine
     * which page component to render based on the `activeView` state. This acts as
     * a sophisticated client-side router, dynamically loading and guarding access
     * to commercial-grade features.
     * @returns {React.ReactElement} The component for the currently active view.
     */
    const renderView = () => {
        if (isLoading && dataContext.transactions.length === 0) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="w-16 h-16 border-4 border-cyan-400 border-dashed rounded-full animate-spin"></div>
                    <p className="ml-4 text-cyan-400 text-lg font-semibold">Synthesizing reality...</p>
                </div>
            );
        }

        if (activeView.startsWith('article-')) {
            const articleNumber = parseInt(activeView.replace('article-', ''), 10);
            return <FeatureGuard view={activeView}><ConstitutionalArticleView articleNumber={articleNumber} /></FeatureGuard>;
        }
        
        switch (activeView) {
            // --- META & NEW FRAMEWORK VIEWS ---
            case View.MetaDashboard: return <MetaDashboardView openModal={openModal} />;
            case View.AgentMarketplace: return <FeatureGuard view={View.AgentMarketplace}><AgentMarketplaceView /></FeatureGuard>;
            case View.Orchestration: return <FeatureGuard view={View.Orchestration}><OrchestrationView /></FeatureGuard>;
            case View.DataMesh: return <FeatureGuard view={View.DataMesh}><DataMeshView /></FeatureGuard>;
            case View.DataCommons: return <FeatureGuard view={View.DataCommons}><DataCommonsView /></FeatureGuard>;
            case View.Mainframe: return <FeatureGuard view={View.Mainframe}><MainframeView /></FeatureGuard>;
            case View.AIGovernance: return <FeatureGuard view={View.AIGovernance}><AIGovernanceView /></FeatureGuard>;
            case View.AIRiskRegistry: return <FeatureGuard view={View.AIRiskRegistry}><AIRiskRegistryView /></FeatureGuard>;
            case View.OSPO: return <FeatureGuard view={View.OSPO}><OSPOView /></FeatureGuard>;
            case View.CiCd: return <FeatureGuard view={View.CiCd}><CiCdView /></FeatureGuard>;
            case View.Inventions: return <FeatureGuard view={View.Inventions}><InventionsView /></FeatureGuard>;
            case View.Roadmap: return <FeatureGuard view={View.Roadmap}><RoadmapView /></FeatureGuard>;
            case View.Connect: return <FeatureGuard view={View.Connect}><ConnectView /></FeatureGuard>;
            case View.EconomicSynthesisEngine: return <FeatureGuard view={View.EconomicSynthesisEngine}><EconomicSynthesisEngineView /></FeatureGuard>;
            case View.TaskMatrix: return <FeatureGuard view={View.TaskMatrix}><TaskMatrixView /></FeatureGuard>;
            case View.LedgerExplorer: return <FeatureGuard view={View.LedgerExplorer}><LedgerExplorerView /></FeatureGuard>;

            // --- EXPANDED AI & COGNITIVE INFRASTRUCTURE VIEWS ---
            case View.CognitiveServicesHub: return <FeatureGuard view={View.CognitiveServicesHub}><CognitiveServicesHubView /></FeatureGuard>;
            case View.NeuroLinguisticCompiler: return <FeatureGuard view={View.NeuroLinguisticCompiler}><NeuroLinguisticCompilerView /></FeatureGuard>;
            case View.SelfOptimizingNetwork: return <FeatureGuard view={View.SelfOptimizingNetwork}><SelfOptimizingNetworkView /></FeatureGuard>;
            case View.FederatedLearning: return <FeatureGuard view={View.FederatedLearning}><FederatedLearningView /></FeatureGuard>;
            case View.HyperpersonalizationEngine: return <FeatureGuard view={View.HyperpersonalizationEngine}><HyperpersonalizationEngineView /></FeatureGuard>;
            case View.PredictiveAnalyticsSuite: return <FeatureGuard view={View.PredictiveAnalyticsSuite}><PredictiveAnalyticsSuiteView /></FeatureGuard>;
            case View.GenerativeAIStudio: return <FeatureGuard view={View.GenerativeAIStudio}><GenerativeAIStudioView /></FeatureGuard>;
            case View.AIResourceOrchestrator: return <FeatureGuard view={View.AIResourceOrchestrator}><AIResourceOrchestratorView /></FeatureGuard>;
            case View.QuantumMachineLearning: return <FeatureGuard view={View.QuantumMachineLearning}><QuantumMachineLearningView /></FeatureGuard>;
            case View.SemanticSearchEngine: return <FeatureGuard view={View.SemanticSearchEngine}><SemanticSearchEngineView /></FeatureGuard>;
            case View.EthicalAIAuditTrail: return <FeatureGuard view={View.EthicalAIAuditTrail}><EthicalAIAuditTrailView /></FeatureGuard>;
            case View.ExplainableAIInsight: return <FeatureGuard view={View.ExplainableAIInsight}><ExplainableAIInsightView /></FeatureGuard>;
            case View.DigitalTwinManagement: return <FeatureGuard view={View.DigitalTwinManagement}><DigitalTwinManagementView /></FeatureGuard>;
            case View.HumanAILoopOrchestrator: return <FeatureGuard view={View.HumanAILoopOrchestrator}><HumanAILoopOrchestratorView /></FeatureGuard>;
            case View.AutonomousAgentFramework: return <FeatureGuard view={View.AutonomousAgentFramework}><AutonomousAgentFrameworkView /></FeatureGuard>;
            case View.AIWorkloadScheduler: return <FeatureGuard view={View.AIWorkloadScheduler}><AIWorkloadSchedulerView /></FeatureGuard>;
            case View.IntelligentAutomationCenter: return <FeatureGuard view={View.IntelligentAutomationCenter}><IntelligentAutomationCenterView /></FeatureGuard>;
            case View.AIModelGovernance: return <FeatureGuard view={View.AIModelGovernance}><AIModelGovernanceView /></FeatureGuard>;
            case View.ReinforcementLearningLab: return <FeatureGuard view={View.ReinforcementLearningLab}><ReinforcementLearningLabView /></FeatureGuard>;
            case View.CognitiveDecisionSupport: return <FeatureGuard view={View.CognitiveDecisionSupport}><CognitiveDecisionSupportView /></FeatureGuard>;

            // --- QUANTUM & ADVANCED COMPUTING VIEWS ---
            case View.QuantumSimulationLab: return <FeatureGuard view={View.QuantumSimulationLab}><QuantumSimulationLabView /></FeatureGuard>;
            case View.EntanglementFabric: return <FeatureGuard view={View.EntanglementFabric}><EntanglementFabricView /></FeatureGuard>;
            case View.TopologicalQuantumComputing: return <FeatureGuard view={View.TopologicalQuantumComputing}><TopologicalQuantumComputingView /></FeatureGuard>;
            case View.PhotonicQuantumNetwork: return <FeatureGuard view={View.PhotonicQuantumNetwork}><PhotonicQuantumNetworkView /></FeatureGuard>;
            case View.NeuromorphicComputingHub: return <FeatureGuard view={View.NeuromorphicComputingHub}><NeuromorphicComputingHubView /></FeatureGuard>;
            case View.BiocomputingInterface: return <FeatureGuard view={View.BiocomputingInterface}><BiocomputingInterfaceView /></FeatureGuard>;
            
            // --- DECENTRALIZED & WEB3 ENTERPRISE VIEWS ---
            case View.DecentralizedIdentity: return <FeatureGuard view={View.DecentralizedIdentity}><DecentralizedIdentityView /></FeatureGuard>;
            case View.TokenomicsDesignStudio: return <FeatureGuard view={View.TokenomicsDesignStudio}><TokenomicsDesignStudioView /></FeatureGuard>;
            case View.DAOOperatingSystem: return <FeatureGuard view={View.DAOOperatingSystem}><DAOOperatingSystemView /></FeatureGuard>;
            case View.SmartContractAuditor: return <FeatureGuard view={View.SmartContractAuditor}><SmartContractAuditorView /></FeatureGuard>;
            case View.InterchainConnectivity: return <FeatureGuard view={View.InterchainConnectivity}><InterchainConnectivityView /></FeatureGuard>;
            case View.VerifiableCredentials: return <FeatureGuard view={View.VerifiableCredentials}><VerifiableCredentialsView /></FeatureGuard>;
            case View.DecentralizedStorageGrid: return <FeatureGuard view={View.DecentralizedStorageGrid}><DecentralizedStorageGridView /></FeatureGuard>;
            case View.NFTFractionalization: return <FeatureGuard view={View.NFTFractionalization}><NFTFractionalizationView /></FeatureGuard>;

            // --- GLOBAL ECONOMIC & FINANCIAL STRATEGY VIEWS ---
            case View.GeopoliticalRiskEngine: return <FeatureGuard view={View.GeopoliticalRiskEngine}><GeopoliticalRiskEngineView /></FeatureGuard>;
            case View.GlobalTradeOptimizer: return <FeatureGuard view={View.GlobalTradeOptimizer}><GlobalTradeOptimizerView /></FeatureGuard>;
            case View.CarbonCreditExchange: return <FeatureGuard view={View.CarbonCreditExchange}><CarbonCreditExchangeView /></FeatureGuard>;
            case View.SovereignWealthAllocator: return <FeatureGuard view={View.SovereignWealthAllocator}><SovereignWealthAllocatorView /></FeatureGuard>;
            case View.MacroEconomicSimulator: return <FeatureGuard view={View.MacroEconomicSimulator}><MacroEconomicSimulatorView /></FeatureGuard>;
            case View.ResourceAllocationMatrix: return <FeatureGuard view={View.ResourceAllocationMatrix}><ResourceAllocationMatrixView /></FeatureGuard>;


            // --- FOUNDATIONAL & LEGACY VIEWS ---
            // Personal Finance
            case View.Dashboard: return <FeatureGuard view={View.Dashboard}><DashboardView setActiveView={handleSetView}/></FeatureGuard>;
            case View.Transactions: return <FeatureGuard view={View.Transactions}><TransactionsView /></FeatureGuard>;
            case View.SendMoney: return <FeatureGuard view={View.SendMoney}><SendMoneyView setActiveView={handleSetView} /></FeatureGuard>;
            case View.Budgets: return <FeatureGuard view={View.Budgets}><BudgetsView /></FeatureGuard>;
            case View.Investments: return <FeatureGuard view={View.Investments}><InvestmentsView /></FeatureGuard>;
            case View.PortfolioExplorer: return <FeatureGuard view={View.PortfolioExplorer}><PortfolioExplorerView /></FeatureGuard>;
            case View.Crypto: return <FeatureGuard view={View.Crypto}><CryptoView /></FeatureGuard>;
            case View.FinancialGoals: return <FeatureGuard view={View.FinancialGoals}><FinancialGoalsView /></FeatureGuard>;
            case View.Marketplace: return <FeatureGuard view={View.Marketplace}><MarketplaceView /></FeatureGuard>;
            case View.Personalization: return <FeatureGuard view={View.Personalization}><PersonalizationView /></FeatureGuard>;
            case View.CardCustomization: return <FeatureGuard view={View.CardCustomization}><CardCustomizationView /></FeatureGuard>;
            case View.RewardsHub: return <FeatureGuard view={View.RewardsHub}><RewardsHubView /></FeatureGuard>;
            case View.CreditHealth: return <FeatureGuard view={View.CreditHealth}><CreditHealthView /></FeatureGuard>;
            case View.Security: return <FeatureGuard view={View.Security}><SecurityView /></FeatureGuard>;
            case View.OpenBanking: return <FeatureGuard view={View.OpenBanking}><OpenBankingView /></FeatureGuard>;
            case View.Settings: return <FeatureGuard view={View.Settings}><SettingsView /></FeatureGuard>;
            case View.WellnessFinance: return <FeatureGuard view={View.WellnessFinance}><WellnessFinanceView /></FeatureGuard>;
            case View.GenerationalWealth: return <FeatureGuard view={View.GenerationalWealth}><GenerationalWealthView /></FeatureGuard>;
            case View.SustainableInvestments: return <FeatureGuard view={View.SustainableInvestments}><SustainableInvestmentsView /></FeatureGuard>;
            case View.MicroLending: return <FeatureGuard view={View.MicroLending}><MicroLendingView /></FeatureGuard>;
            case View.HyperPersonalBudget: return <FeatureGuard view={View.HyperPersonalBudget}><HyperPersonalBudgetView /></FeatureGuard>;
            
            // AI & Platform
            case View.TheNexus: return <FeatureGuard view={View.TheNexus}><TheNexusView /></FeatureGuard>;
            case View.AIAdvisor: return <FeatureGuard view={View.AIAdvisor}><AIAdvisorView previousView={previousView} /></FeatureGuard>;
            case View.QuantumWeaver: return <FeatureGuard view={View.QuantumWeaver}><QuantumWeaverView /></FeatureGuard>;
            case View.QuantumOracle: return <FeatureGuard view={View.QuantumOracle}><QuantumOracleView /></FeatureGuard>;
            case View.AIAdStudio: return <FeatureGuard view={View.AIAdStudio}><AIAdStudioView /></FeatureGuard>;
            case View.TheWinningVision: return <FeatureGuard view={View.TheWinningVision}><TheVisionView /></FeatureGuard>;
            case View.APIStatus: return <FeatureGuard view={View.APIStatus}><APIStatusView /></FeatureGuard>;
            
            // Corporate Finance
            case View.CorporateDashboard: return <FeatureGuard view={View.CorporateDashboard}><CorporateDashboardView setActiveView={handleSetView} /></FeatureGuard>;
            case View.PaymentOrders: return <FeatureGuard view={View.PaymentOrders}><PaymentOrdersView /></FeatureGuard>;
            case View.Counterparties: return <FeatureGuard view={View.Counterparties}><CounterpartiesView /></FeatureGuard>;
            case View.Invoices: return <FeatureGuard view={View.Invoices}><InvoicesView /></FeatureGuard>;
            case View.Compliance: return <FeatureGuard view={View.Compliance}><ComplianceView /></FeatureGuard>;
            case View.AnomalyDetection: return <FeatureGuard view={View.AnomalyDetection}><AnomalyDetectionView /></FeatureGuard>;
            case View.Payroll: return <FeatureGuard view={View.Payroll}><PayrollView /></FeatureGuard>;
            case View.SupplyChainFinance: return <FeatureGuard view={View.SupplyChainFinance}><SupplyChainFinanceView /></FeatureGuard>;
            case View.TreasuryOptimization: return <FeatureGuard view={View.TreasuryOptimization}><TreasuryOptimizationView /></FeatureGuard>;
            case View.AlgorithmicTrading: return <FeatureGuard view={View.AlgorithmicTrading}><AlgorithmicTradingView /></FeatureGuard>;
            case View.CorporateVentures: return <FeatureGuard view={View.CorporateVentures}><CorporateVenturesView /></FeatureGuard>;
            case View.PredictiveCashFlow: return <FeatureGuard view={View.PredictiveCashFlow}><PredictiveCashFlowView /></FeatureGuard>;
            case View.ESGReporting: return <FeatureGuard view={View.ESGReporting}><ESGReportingView /></FeatureGuard>;

            // Demo Bank Platform
            case View.DemoBankSocial: return <FeatureGuard view={View.DemoBankSocial}><DemoBankSocialView /></FeatureGuard>;
            case View.DemoBankERP: return <FeatureGuard view={View.DemoBankERP}><DemoBankERPView /></FeatureGuard>;
            case View.DemoBankCRM: return <FeatureGuard view={View.DemoBankCRM}><DemoBankCRMView /></FeatureGuard>;
            case View.DemoBankAPIGateway: return <FeatureGuard view={View.DemoBankAPIGateway}><DemoBankAPIGatewayView /></FeatureGuard>;
            case View.DemoBankGraphExplorer: return <FeatureGuard view={View.DemoBankGraphExplorer}><DemoBankGraphExplorerView /></FeatureGuard>;
            case View.DemoBankDBQL: return <FeatureGuard view={View.DemoBankDBQL}><DemoBankDBQLView /></FeatureGuard>;
            case View.DemoBankCloud: return <FeatureGuard view={View.DemoBankCloud}><DemoBankCloudView /></FeatureGuard>;
            case View.DemoBankIdentity: return <FeatureGuard view={View.DemoBankIdentity}><DemoBankIdentityView /></FeatureGuard>;
            case View.DemoBankStorage: return <FeatureGuard view={View.DemoBankStorage}><DemoBankStorageView /></FeatureGuard>;
            case View.DemoBankCompute: return <FeatureGuard view={View.DemoBankCompute}><DemoBankComputerView /></FeatureGuard>;
            case View.DemoBankAIPlatform: return <FeatureGuard view={View.DemoBankAIPlatform}><DemoBankAIPlatformView /></FeatureGuard>;
            case View.DemoBankMachineLearning: return <FeatureGuard view={View.DemoBankMachineLearning}><DemoBankMachineLearningView /></FeatureGuard>;
            case View.DemoBankDevOps: return <FeatureGuard view={View.DemoBankDevOps}><DemoBankDevOpsView /></FeatureGuard>;
            case View.DemoBankSecurityCenter: return <FeatureGuard view={View.DemoBankSecurityCenter}><DemoBankSecurityCenterView /></FeatureGuard>;
            case View.DemoBankComplianceHub: return <FeatureGuard view={View.DemoBankComplianceHub}><DemoBankComplianceHubView /></FeatureGuard>;
            case View.DemoBankAppMarketplace: return <FeatureGuard view={View.DemoBankAppMarketplace}><DemoBankAppMarketplaceView /></FeatureGuard>;
            case View.DemoBankEvents: return <FeatureGuard view={View.DemoBankEvents}><DemoBankEventsView /></FeatureGuard>;
            case View.DemoBankLogicApps: return <FeatureGuard view={View.DemoBankLogicApps}><DemoBankLogicAppsView /></FeatureGuard>;
            case View.DemoBankFunctions: return <FeatureGuard view={View.DemoBankFunctions}><DemoBankFunctionsView /></FeatureGuard>;
            case View.DemoBankDataFactory: return <FeatureGuard view={View.DemoBankDataFactory}><DemoBankDataFactoryView /></FeatureGuard>;
            case View.DemoBankAnalytics: return <FeatureGuard view={View.DemoBankAnalytics}><DemoBankAnalyticsView /></FeatureGuard>;
            case View.DemoBankBI: return <FeatureGuard view={View.DemoBankBI}><DemoBankBIView /></FeatureGuard>;
            case View.DemoBankIoTHub: return <FeatureGuard view={View.DemoBankIoTHub}><DemoBankIoTHubView /></FeatureGuard>;
            case View.DemoBankMaps: return <FeatureGuard view={View.DemoBankMaps}><DemoBankMapsView /></FeatureGuard>;
            case View.DemoBankCommunications: return <FeatureGuard view={View.DemoBankCommunications}><DemoBankCommunicationsView /></FeatureGuard>;
            case View.DemoBankCommerce: return <FeatureGuard view={View.DemoBankCommerce}><DemoBankCommerceView /></FeatureGuard>;
            case View.DemoBankTeams: return <FeatureGuard view={View.DemoBankTeams}><DemoBankTeamsView /></FeatureGuard>;
            case View.DemoBankCMS: return <FeatureGuard view={View.DemoBankCMS}><DemoBankCMSView /></FeatureGuard>;
            case View.DemoBankLMS: return <FeatureGuard view={View.DemoBankLMS}><DemoBankLMSView /></FeatureGuard>;
            case View.DemoBankHRIS: return <FeatureGuard view={View.DemoBankHRIS}><DemoBankHRISView /></FeatureGuard>;
            case View.DemoBankProjects: return <FeatureGuard view={View.DemoBankProjects}><DemoBankProjectsView /></FeatureGuard>;
            case View.DemoBankLegalSuite: return <FeatureGuard view={View.DemoBankLegalSuite}><DemoBankLegalSuiteView /></FeatureGuard>;
            case View.DemoBankSupplyChain: return <FeatureGuard view={View.DemoBankSupplyChain}><DemoBankSupplyChainView /></FeatureGuard>;
            case View.DemoBankPropTech: return <FeatureGuard view={View.DemoBankPropTech}><DemoBankPropTechView /></FeatureGuard>;
            case View.DemoBankGamingServices: return <FeatureGuard view={View.DemoBankGamingServices}><DemoBankGamingServicesView /></FeatureGuard>;
            case View.DemoBankBookings: return <FeatureGuard view={View.DemoBankBookings}><DemoBankBookingsView /></FeatureGuard>;
            case View.DemoBankCDP: return <FeatureGuard view={View.DemoBankCDP}><DemoBankCDPView /></FeatureGuard>;
            case View.DemoBankQuantumServices: return <FeatureGuard view={View.DemoBankQuantumServices}><DemoBankQuantumServicesView /></FeatureGuard>;
            case View.DemoBankBlockchain: return <FeatureGuard view={View.DemoBankBlockchain}><DemoBankBlockchainView /></FeatureGuard>;
            case View.DemoBankGIS: return <FeatureGuard view={View.DemoBankGIS}><DemoBankGISView /></FeatureGuard>;
            case View.DemoBankRobotics: return <FeatureGuard view={View.DemoBankRobotics}><DemoBankRoboticsView /></FeatureGuard>;
            case View.DemoBankSimulations: return <FeatureGuard view={View.DemoBankSimulations}><DemoBankSimulationsView /></FeatureGuard>;
            case View.DemoBankVoiceServices: return <FeatureGuard view={View.DemoBankVoiceServices}><DemoBankVoiceServicesView /></FeatureGuard>;
            case View.DemoBankSearchSuite: return <FeatureGuard view={View.DemoBankSearchSuite}><DemoBankSearchSuiteView /></FeatureGuard>;
            case View.DemoBankDigitalTwin: return <FeatureGuard view={View.DemoBankDigitalTwin}><DemoBankDigitalTwinView /></FeatureGuard>;
            case View.DemoBankWorkflowEngine: return <FeatureGuard view={View.DemoBankWorkflowEngine}><DemoBankWorkflowEngineView /></FeatureGuard>;
            case View.DemoBankObservabilityPlatform: return <FeatureGuard view={View.DemoBankObservabilityPlatform}><DemoBankObservabilityPlatformView /></FeatureGuard>;
            case View.DemoBankFeatureManagement: return <FeatureGuard view={View.DemoBankFeatureManagement}><DemoBankFeatureManagementView /></FeatureGuard>;
            case View.DemoBankExperimentationPlatform: return <FeatureGuard view={View.DemoBankExperimentationPlatform}><DemoBankExperimentationPlatformView /></FeatureGuard>;
            case View.DemoBankLocalizationPlatform: return <FeatureGuard view={View.DemoBankLocalizationPlatform}><DemoBankLocalizationPlatformView /></FeatureGuard>;
            case View.DemoBankFleetManagement: return <FeatureGuard view={View.DemoBankFleetManagement}><DemoBankFleetManagementView /></FeatureGuard>;
            case View.DemoBankKnowledgeBase: return <FeatureGuard view={View.DemoBankKnowledgeBase}><DemoBankKnowledgeBaseView /></FeatureGuard>;
            case View.DemoBankMediaServices: return <FeatureGuard view={View.DemoBankMediaServices}><DemoBankMediaServicesView /></FeatureGuard>;
            case View.DemoBankEventGrid: return <FeatureGuard view={View.DemoBankEventGrid}><DemoBankEventGridView /></FeatureGuard>;
            case View.DemoBankApiManagement: return <FeatureGuard view={View.DemoBankApiManagement}><DemoBankApiManagementView /></FeatureGuard>;

            // --- EXPANDED DEMO BANK PLATFORM SERVICES ---
            case View.DemoBankHyperledgerFabric: return <FeatureGuard view={View.DemoBankHyperledgerFabric}><DemoBankHyperledgerFabricView /></FeatureGuard>;
            case View.DemoBankFederatedIdentity: return <FeatureGuard view={View.DemoBankFederatedIdentity}><DemoBankFederatedIdentityView /></FeatureGuard>;
            case View.DemoBankAIEthicsMonitor: return <FeatureGuard view={View.DemoBankAIEthicsMonitor}><DemoBankAIEthicsMonitorView /></FeatureGuard>;
            case View.DemoBankGenerativeDataSuite: return <FeatureGuard view={View.DemoBankGenerativeDataSuite}><DemoBankGenerativeDataSuiteView /></FeatureGuard>;
            case View.DemoBankQuantumSafeSecurity: return <FeatureGuard view={View.DemoBankQuantumSafeSecurity}><DemoBankQuantumSafeSecurityView /></FeatureGuard>;
            case View.DemoBankEcosystemConnectors: return <FeatureGuard view={View.DemoBankEcosystemConnectors}><DemoBankEcosystemConnectorsView /></FeatureGuard>;
            case View.DemoBankRegulatorySandboxEnv: return <FeatureGuard view={View.DemoBankRegulatorySandboxEnv}><DemoBankRegulatorySandboxEnvView /></FeatureGuard>;
            case View.DemoBankPredictiveMaintenance: return <FeatureGuard view={View.DemoBankPredictiveMaintenance}><DemoBankPredictiveMaintenanceView /></FeatureGuard>;
            case View.DemoBankCognitiveProcessAutomation: return <FeatureGuard view={View.DemoBankCognitiveProcessAutomation}><DemoBankCognitiveProcessAutomationView /></FeatureGuard>;
            case View.DemoBankSpatialComputing: return <FeatureGuard view={View.DemoBankSpatialComputing}><DemoBankSpatialComputingView /></FeatureGuard>;
            case View.DemoBankBiometricAuth: return <FeatureGuard view={View.DemoBankBiometricAuth}><DemoBankBiometricAuthView /></FeatureGuard>;
            case View.DemoBankNeuromorphicAnalytics: return <FeatureGuard view={View.DemoBankNeuromorphicAnalytics}><DemoBankNeuromorphicAnalyticsView /></FeatureGuard>;
            case View.DemoBankDeFiIntegration: return <FeatureGuard view={View.DemoBankDeFiIntegration}><DemoBankDeFiIntegrationView /></FeatureGuard>;
            case View.DemoBankCentralBankDigitalCurrency: return <FeatureGuard view={View.DemoBankCentralBankDigitalCurrency}><DemoBankCentralBankDigitalCurrencyView /></FeatureGuard>;
            case View.DemoBankUniversalBasicIncome: return <FeatureGuard view={View.DemoBankUniversalBasicIncome}><DemoBankUniversalBasicIncomeView /></FeatureGuard>;
            case View.DemoBankDynamicPricingEngine: return <FeatureGuard view={View.DemoBankDynamicPricingEngine}><DemoBankDynamicPricingEngineView /></FeatureGuard>;
            case View.DemoBankSustainableFinance: return <FeatureGuard view={View.DemoBankSustainableFinance}><DemoBankSustainableFinanceView /></FeatureGuard>;
            case View.DemoBankImpactInvestment: return <FeatureGuard view={View.DemoBankImpactInvestment}><DemoBankImpactInvestmentView /></FeatureGuard>;
            case View.DemoBankMicroservicesOrchestration: return <FeatureGuard view={View.DemoBankMicroservicesOrchestration}><DemoBankMicroservicesOrchestrationView /></FeatureGuard>;
            case View.DemoBankEdgeComputing: return <FeatureGuard view={View.DemoBankEdgeComputing}><DemoBankEdgeComputingView /></FeatureGuard>;
            case View.DemoBankAIOps: return <FeatureGuard view={View.DemoBankAIOps}><DemoBankAIOpsView /></FeatureGuard>;
            case View.DemoBankChaosEngineering: return <FeatureGuard view={View.DemoBankChaosEngineering}><DemoBankChaosEngineeringView /></FeatureGuard>;


            // Mega Dashboard - Security & Identity
            case View.SecurityAccessControls: return <FeatureGuard view={View.SecurityAccessControls}><AccessControlsView /></FeatureGuard>;
            case View.SecurityRoleManagement: return <FeatureGuard view={View.SecurityRoleManagement}><RoleManagementView /></FeatureGuard>;
            case View.SecurityAuditLogs: return <FeatureGuard view={View.SecurityAuditLogs}><AuditLogsView /></FeatureGuard>;
            case View.SecurityFraudDetection: return <FeatureGuard view={View.SecurityFraudDetection}><FraudDetectionView /></FeatureGuard>;
            case View.SecurityThreatIntelligence: return <FeatureGuard view={View.SecurityThreatIntelligence}><ThreatIntelligenceView /></FeatureGuard>;
            case View.SecurityThreatModeling: return <FeatureGuard view={View.SecurityThreatModeling}><ThreatModelingView /></FeatureGuard>;
            case View.SecurityIdentityGovernance: return <FeatureGuard view={View.SecurityIdentityGovernance}><IdentityGovernanceView /></FeatureGuard>;
            case View.SecurityQuantumSafeCrypto: return <FeatureGuard view={View.SecurityQuantumSafeCrypto}><QuantumSafeCryptoView /></FeatureGuard>;
            case View.SecurityBiometricAuthentication: return <FeatureGuard view={View.SecurityBiometricAuthentication}><BiometricAuthenticationView /></FeatureGuard>;
            case View.SecurityScorecard: return <FeatureGuard view={View.SecurityScorecard}><SecurityScorecardView /></FeatureGuard>;

            // Mega Dashboard - Finance & Banking
            case View.FinanceCardManagement: return <FeatureGuard view={View.FinanceCardManagement}><CardManagementView /></FeatureGuard>;
            case View.FinanceLoanApplications: return <FeatureGuard view={View.FinanceLoanApplications}><LoanApplicationsView /></FeatureGuard>;
            case View.FinanceMortgages: return <FeatureGuard view={View.FinanceMortgages}><MortgagesView /></FeatureGuard>;
            case View.FinanceInsuranceHub: return <FeatureGuard view={View.FinanceInsuranceHub}><InsuranceHubView /></FeatureGuard>;
            case View.FinanceTaxCenter: return <FeatureGuard view={View.FinanceTaxCenter}><TaxCenterView /></FeatureGuard>;
            case View.FinanceStructuredFinance: return <FeatureGuard view={View.FinanceStructuredFinance}><StructuredFinanceView /></FeatureGuard>;
            case View.FinanceDerivativeMarket: return <FeatureGuard view={View.FinanceDerivativeMarket}><DerivativeMarketView /></FeatureGuard>;
            case View.FinanceAlternativeInvestments: return <FeatureGuard view={View.FinanceAlternativeInvestments}><AlternativeInvestmentsView /></FeatureGuard>;
            case View.FinancePrivateEquity: return <FeatureGuard view={View.FinancePrivateEquity}><PrivateEquityView /></FeatureGuard>;
            case View.FinanceRealEstateFinance: return <FeatureGuard view={View.FinanceRealEstateFinance}><RealEstateFinanceView /></FeatureGuard>;

            // Mega Dashboard - Advanced Analytics
            case View.AnalyticsPredictiveModels: return <FeatureGuard view={View.AnalyticsPredictiveModels}><PredictiveModelsView /></FeatureGuard>;
            case View.AnalyticsRiskScoring: return <FeatureGuard view={View.AnalyticsRiskScoring}><RiskScoringView /></FeatureGuard>;
            case View.AnalyticsSentimentAnalysis: return <FeatureGuard view={View.AnalyticsSentimentAnalysis}><SentimentAnalysisView /></FeatureGuard>;
            case View.AnalyticsDataLakes: return <FeatureGuard view={View.AnalyticsDataLakes}><DataLakesView /></FeatureGuard>;
            case View.AnalyticsDataCatalog: return <FeatureGuard view={View.AnalyticsDataCatalog}><DataCatalogView /></FeatureGuard>;
            case View.AnalyticsCausalInferenceEngine: return <FeatureGuard view={View.AnalyticsCausalInferenceEngine}><CausalInferenceEngineView /></FeatureGuard>;
            case View.AnalyticsCounterfactualSimulator: return <FeatureGuard view={View.AnalyticsCounterfactualSimulator}><CounterfactualSimulatorView /></FeatureGuard>;
            case View.AnalyticsGraphAnalytics: return <FeatureGuard view={View.AnalyticsGraphAnalytics}><GraphAnalyticsView /></FeatureGuard>;
            case View.AnalyticsTimeSeriesForecasting: return <FeatureGuard view={View.AnalyticsTimeSeriesForecasting}><TimeSeriesForecastingView /></FeatureGuard>;
            case View.AnalyticsExplainableAI: return <FeatureGuard view={View.AnalyticsExplainableAI}><ExplainableAIView /></FeatureGuard>;

            // Mega Dashboard - User & Client Tools
            case View.UserClientOnboarding: return <FeatureGuard view={View.UserClientOnboarding}><ClientOnboardingView /></FeatureGuard>;
            case View.UserClientKycAml: return <FeatureGuard view={View.UserClientKycAml}><KycAmlView /></FeatureGuard>;
            case View.UserClientUserInsights: return <FeatureGuard view={View.UserClientUserInsights}><UserInsightsView /></FeatureGuard>;
            case View.UserClientFeedbackHub: return <FeatureGuard view={View.UserClientFeedbackHub}><FeedbackHubView /></FeatureGuard>;
            case View.UserClientSupportDesk: return <FeatureGuard view={View.UserClientSupportDesk}><SupportDeskView /></FeatureGuard>;
            case View.UserClientJourneyOrchestration: return <FeatureGuard view={View.UserClientJourneyOrchestration}><JourneyOrchestrationView /></FeatureGuard>;
            case View.UserClientCustomerLifetimeValue: return <FeatureGuard view={View.UserClientCustomerLifetimeValue}><CustomerLifetimeValueView /></FeatureGuard>;
            case View.UserClientVoiceOfCustomer: return <FeatureGuard view={View.UserClientVoiceOfCustomer}><VoiceOfCustomerView /></FeatureGuard>;
            case View.UserClientCommunityManagement: return <FeatureGuard view={View.UserClientCommunityManagement}><CommunityManagementView /></FeatureGuard>;
            case View.UserClientPredictiveSupport: return <FeatureGuard view={View.UserClientPredictiveSupport}><PredictiveSupportView /></FeatureGuard>;

            // Mega Dashboard - Developer & Integration
            case View.DeveloperSandbox: return <FeatureGuard view={View.DeveloperSandbox}><SandboxView /></FeatureGuard>;
            case View.DeveloperSdkDownloads: return <FeatureGuard view={View.DeveloperSdkDownloads}><SdkDownloadsView /></FeatureGuard>;
            case View.DeveloperWebhooks: return <FeatureGuard view={View.DeveloperWebhooks}><WebhooksView /></FeatureGuard>;
            case View.DeveloperCliTools: return <FeatureGuard view={View.DeveloperCliTools}><CliToolsView /></FeatureGuard>;
            case View.DeveloperExtensions: return <FeatureGuard view={View.DeveloperExtensions}><ExtensionsView /></FeatureGuard>;
            case View.DeveloperApiKeys: return <FeatureGuard view={View.DeveloperApiKeys}><ApiKeysView /></FeatureGuard>;
            case View.DeveloperApiContracts: return <FeatureGuard view={View.DeveloperApiContracts}><ApiContractsView /></FeatureGuard>;
            case View.DeveloperAPIVersioning: return <FeatureGuard view={View.DeveloperAPIVersioning}><APIVersioningView /></FeatureGuard>;
            case View.DeveloperDevPortalAnalytics: return <FeatureGuard view={View.DeveloperDevPortalAnalytics}><DevPortalAnalyticsView /></FeatureGuard>;
            case View.DeveloperSDKGenerator: return <FeatureGuard view={View.DeveloperSDKGenerator}><SDKGeneratorView /></FeatureGuard>;
            case View.DeveloperLowCodeNoCodeStudio: return <FeatureGuard view={View.DeveloperLowCodeNoCodeStudio}><LowCodeNoCodeStudioView /></FeatureGuard>;
            case View.DeveloperBountyProgram: return <FeatureGuard view={View.DeveloperBountyProgram}><BountyProgramView /></FeatureGuard>;

            // Mega Dashboard - Ecosystem & Connectivity
            case View.EcosystemPartnerHub: return <FeatureGuard view={View.EcosystemPartnerHub}><PartnerHubView /></FeatureGuard>;
            case View.EcosystemAffiliates: return <FeatureGuard view={View.EcosystemAffiliates}><AffiliatesView /></FeatureGuard>;
            case View.EcosystemIntegrationsMarketplace: return <FeatureGuard view={View.EcosystemIntegrationsMarketplace}><IntegrationsMarketplaceView /></FeatureGuard>;
            case View.EcosystemCrossBorderPayments: return <FeatureGuard view={View.EcosystemCrossBorderPayments}><CrossBorderPaymentsView /></FeatureGuard>;
            case View.EcosystemMultiCurrency: return <FeatureGuard view={View.EcosystemMultiCurrency}><MultiCurrencyView /></FeatureGuard>;
            case View.EcosystemOpenBankingAPIManager: return <FeatureGuard view={View.EcosystemOpenBankingAPIManager}><OpenBankingAPIManagerView /></FeatureGuard>;
            case View.EcosystemPartnerOnboarding: return <FeatureGuard view={View.EcosystemPartnerOnboarding}><PartnerOnboardingView /></FeatureGuard>;
            case View.EcosystemSupplyChainTraceability: return <FeatureGuard view={View.EcosystemSupplyChainTraceability}><SupplyChainTraceabilityView /></FeatureGuard>;
            case View.EcosystemGlobalPaymentsNetwork: return <FeatureGuard view={View.EcosystemGlobalPaymentsNetwork}><GlobalPaymentsNetworkView /></FeatureGuard>;
            case View.EcosystemDigitalIdentityFederation: return <FeatureGuard view={View.EcosystemDigitalIdentityFederation}><DigitalIdentityFederationView /></FeatureGuard>;

            // Mega Dashboard - Digital Assets & Web3
            case View.DigitalAssetsNftVault: return <FeatureGuard view={View.DigitalAssetsNftVault}><NftVaultView /></FeatureGuard>;
            case View.DigitalAssetsTokenIssuance: return <FeatureGuard view={View.DigitalAssetsTokenIssuance}><TokenIssuanceView /></FeatureGuard>;
            case View.DigitalAssetsSmartContracts: return <FeatureGuard view={View.DigitalAssetsSmartContracts}><SmartContractsView /></FeatureGuard>;
            case View.DigitalAssetsDaoGovernance: return <FeatureGuard view={View.DigitalAssetsDaoGovernance}><DaoGovernanceView /></FeatureGuard>;
            case View.DigitalAssetsOnChainAnalytics: return <FeatureGuard view={View.DigitalAssetsOnChainAnalytics}><OnChainAnalyticsView /></FeatureGuard>;
            case View.DigitalAssetsCentralBankDigitalCurrencySimulator: return <FeatureGuard view={View.DigitalAssetsCentralBankDigitalCurrencySimulator}><CentralBankDigitalCurrencySimulatorView /></FeatureGuard>;
            case View.DigitalAssetsMetaverseAssetRegistry: return <FeatureGuard view={View.DigitalAssetsMetaverseAssetRegistry}><MetaverseAssetRegistryView /></FeatureGuard>;
            case View.DigitalAssetsTokenizedRealWorldAssets: return <FeatureGuard view={View.DigitalAssetsTokenizedRealWorldAssets}><TokenizedRealWorldAssetsView /></FeatureGuard>;
            case View.DigitalAssetsWeb3AnalyticsPlatform: return <FeatureGuard view={View.DigitalAssetsWeb3AnalyticsPlatform}><Web3AnalyticsPlatformView /></FeatureGuard>;
            case View.DigitalAssetsCrossChainInteroperability: return <FeatureGuard view={View.DigitalAssetsCrossChainInteroperability}><CrossChainInteroperabilityView /></FeatureGuard>;

            // Mega Dashboard - Business & Growth
            case View.BusinessSalesPipeline: return <FeatureGuard view={View.BusinessSalesPipeline}><SalesPipelineView /></FeatureGuard>;
            case View.BusinessMarketingAutomation: return <FeatureGuard view={View.BusinessMarketingAutomation}><MarketingAutomationView /></FeatureGuard>;
            case View.BusinessGrowthInsights: return <FeatureGuard view={View.BusinessGrowthInsights}><GrowthInsightsView /></FeatureGuard>;
            case View.BusinessCompetitiveIntelligence: return <FeatureGuard view={View.BusinessCompetitiveIntelligence}><CompetitiveIntelligenceView /></FeatureGuard>;
            case View.BusinessBenchmarking: return <FeatureGuard view={View.BusinessBenchmarking}><BenchmarkingView /></FeatureGuard>;
            case View.BusinessMarketSegmentationAI: return <FeatureGuard view={View.BusinessMarketSegmentationAI}><MarketSegmentationAIView /></FeatureGuard>;
            case View.BusinessProductLedGrowth: return <FeatureGuard view={View.BusinessProductLedGrowth}><ProductLedGrowthView /></FeatureGuard>;
            case View.BusinessPricingStrategyEngine: return <FeatureGuard view={View.BusinessPricingStrategyEngine}><PricingStrategyEngineView /></FeatureGuard>;
            case View.BusinessAcquisitionChannelOptimizer: return <FeatureGuard view={View.BusinessAcquisitionChannelOptimizer}><AcquisitionChannelOptimizerView /></FeatureGuard>;
            case View.BusinessRetentionDynamics: return <FeatureGuard view={View.BusinessRetentionDynamics}><RetentionDynamicsView /></FeatureGuard>;

            // Mega Dashboard - Regulation & Legal
            case View.RegulationLicensing: return <FeatureGuard view={View.RegulationLicensing}><LicensingView /></FeatureGuard>;
            case View.RegulationDisclosures: return <FeatureGuard view={View.RegulationDisclosures}><DisclosuresView /></FeatureGuard>;
            case View.RegulationLegalDocs: return <FeatureGuard view={View.RegulationLegalDocs}><LegalDocsView /></FeatureGuard>;
            case View.RegulationRegulatorySandbox: return <FeatureGuard view={View.RegulationRegulatorySandbox}><RegulatorySandboxView /></FeatureGuard>;
            case View.RegulationConsentManagement: return <FeatureGuard view={View.RegulationConsentManagement}><ConsentManagementView /></FeatureGuard>;
            case View.RegulationAIComplianceEngine: return <FeatureGuard view={View.RegulationAIComplianceEngine}><AIComplianceEngineView /></FeatureGuard>;
            case View.RegulationGlobalRegulatoryWatch: return <FeatureGuard view={View.RegulationGlobalRegulatoryWatch}><GlobalRegulatoryWatchView /></FeatureGuard>;
            case View.RegulationLegalContractAutomation: return <FeatureGuard view={View.RegulationLegalContractAutomation}><LegalContractAutomationView /></FeatureGuard>;
            case View.RegulationEthicalAIReviewBoard: return <FeatureGuard view={View.RegulationEthicalAIReviewBoard}><EthicalAIReviewBoardView /></FeatureGuard>;
            case View.RegulationDataPrivacyManagement: return <FeatureGuard view={View.RegulationDataPrivacyManagement}><DataPrivacyManagementView /></FeatureGuard>;

            // Mega Dashboard - Infra & Ops
            case View.InfraContainerRegistry: return <FeatureGuard view={View.InfraContainerRegistry}><ContainerRegistryView /></FeatureGuard>;
            case View.InfraApiThrottling: return <FeatureGuard view={View.InfraApiThrottling}><ApiThrottlingView /></FeatureGuard>;
            case View.InfraObservability: return <FeatureGuard view={View.InfraObservability}><ObservabilityView /></FeatureGuard>;
            case View.InfraIncidentResponse: return <FeatureGuard view={View.InfraIncidentResponse}><IncidentResponseView /></FeatureGuard>;
            case View.InfraBackupRecovery: return <FeatureGuard view={View.InfraBackupRecovery}><BackupRecoveryView /></FeatureGuard>;
            case View.InfraSiteReliabilityEngineering: return <FeatureGuard view={View.InfraSiteReliabilityEngineering}><SiteReliabilityEngineeringView /></FeatureGuard>;
            case View.InfraFinOpsCostOptimization: return <FeatureGuard view={View.InfraFinOpsCostOptimization}><FinOpsCostOptimizationView /></FeatureGuard>;
            case View.InfraGreenCloudDashboard: return <FeatureGuard view={View.InfraGreenCloudDashboard}><GreenCloudDashboardView /></FeatureGuard>;
            case View.InfraPredictiveScaling: return <FeatureGuard view={View.InfraPredictiveScaling}><PredictiveScalingView /></FeatureGuard>;
            case View.InfraResilienceEngineering: return <FeatureGuard view={View.InfraResilienceEngineering}><ResilienceEngineeringView /></FeatureGuard>;


            // Blueprints
            case View.CrisisAIManager: return <FeatureGuard view={View.CrisisAIManager}><CrisisAIManagerView /></FeatureGuard>;
            case View.CognitiveLoadBalancer: return <FeatureGuard view={View.CognitiveLoadBalancer}><CognitiveLoadBalancerView /></FeatureGuard>;
            case View.HolographicMeetingScribe: return <FeatureGuard view={View.HolographicMeetingScribe}><HolographicMeetingScribeView /></FeatureGuard>;
            case View.QuantumProofEncryptor: return <FeatureGuard view={View.QuantumProofEncryptor}><QuantumProofEncryptorView /></FeatureGuard>;
            case View.EtherealMarketplace: return <FeatureGuard view={View.EtherealMarketplace}><EtherealMarketplaceView /></FeatureGuard>;
            case View.AdaptiveUITailor: return <FeatureGuard view={View.AdaptiveUITailor}><AdaptiveUITailorView /></FeatureGuard>;
            case View.UrbanSymphonyPlanner: return <FeatureGuard view={View.UrbanSymphonyPlanner}><UrbanSymphonyPlannerView /></FeatureGuard>;
            case View.PersonalHistorianAI: return <FeatureGuard view={View.PersonalHistorianAI}><PersonalHistorianAIView /></FeatureGuard>;
            case View.DebateAdversary: return <FeatureGuard view={View.DebateAdversary}><DebateAdversaryView /></FeatureGuard>;
            case View.CulturalAssimilationAdvisor: return <FeatureGuard view={View.CulturalAssimilationAdvisor}><CulturalAssimilationAdvisorView /></FeatureGuard>;
            case View.DynamicSoundscapeGenerator: return <FeatureGuard view={View.DynamicSoundscapeGenerator}><DynamicSoundscapeGeneratorView /></FeatureGuard>;
            case View.EmergentStrategyWargamer: return <FeatureGuard view={View.EmergentStrategyWargamer}><EmergentStrategyWargamerView /></FeatureGuard>;
            case View.EthicalGovernor: return <FeatureGuard view={View.EthicalGovernor}><EthicalGovernorView /></FeatureGuard>;
            case View.QuantumEntanglementDebugger: return <FeatureGuard view={View.QuantumEntanglementDebugger}><QuantumEntanglementDebuggerView /></FeatureGuard>;
            case View.LinguisticFossilFinder: return <FeatureGuard view={View.LinguisticFossilFinder}><LinguisticFossilFinderView /></FeatureGuard>;
            case View.ChaosTheorist: return <FeatureGuard view={View.ChaosTheorist}><ChaosTheoristView /></FeatureGuard>;
            case View.SelfRewritingCodebase: return <FeatureGuard view={View.SelfRewritingCodebase}><SelfRewritingCodebaseView /></FeatureGuard>;
            
             // Visionary Blueprints
            case View.GenerativeJurisprudence: return <FeatureGuard view={View.GenerativeJurisprudence}><GenerativeJurisprudenceView /></FeatureGuard>;
            case View.AestheticEngine: return <FeatureGuard view={View.AestheticEngine}><AestheticEngineView /></FeatureGuard>;
            case View.NarrativeForge: return <FeatureGuard view={View.NarrativeForge}><NarrativeForgeView /></FeatureGuard>;
            case View.WorldBuilder: return <FeatureGuard view={View.WorldBuilder}><WorldBuilderView /></FeatureGuard>;
            case View.SonicAlchemy: return <FeatureGuard view={View.SonicAlchemy}><SonicAlchemyView /></FeatureGuard>;
            case View.AutonomousScientist: return <FeatureGuard view={View.AutonomousScientist}><AutonomousScientistView /></FeatureGuard>;
            case View.ZeitgeistEngine: return <FeatureGuard view={View.ZeitgeistEngine}><ZeitgeistEngineView /></FeatureGuard>;
            case View.CareerTrajectory: return <FeatureGuard view={View.CareerTrajectory}><CareerTrajectoryView /></FeatureGuard>;
            case View.LudicBalancer: return <FeatureGuard view={View.LudicBalancer}><LudicBalancerView /></FeatureGuard>;
            case View.HypothesisEngine: return <FeatureGuard view={View.HypothesisEngine}><HypothesisEngineView /></FeatureGuard>;
            case View.LexiconClarifier: return <FeatureGuard view={View.LexiconClarifier}><LexiconClarifierView /></FeatureGuard>;
            case View.CodeArcheologist: return <FeatureGuard view={View.CodeArcheologist}><CodeArcheologistView /></FeatureGuard>;

            // --- HYPER-VISIONARY BLUEPRINT VIEWS ---
            case View.UniversalTranslator: return <FeatureGuard view={View.UniversalTranslator}><UniversalTranslatorView /></FeatureGuard>;
            case View.DreamSynthesizer: return <FeatureGuard view={View.DreamSynthesizer}><DreamSynthesizerView /></FeatureGuard>;
            case View.ChronosTemporalPredictor: return <FeatureGuard view={View.ChronosTemporalPredictor}><ChronosTemporalPredictorView /></FeatureGuard>;
            case View.SentientInterfaceDesigner: return <FeatureGuard view={View.SentientInterfaceDesigner}><SentientInterfaceDesignerView /></FeatureGuard>;
            case View.EcologicalNetworkBalancer: return <FeatureGuard view={View.EcologicalNetworkBalancer}><EcologicalNetworkBalancerView /></FeatureGuard>;
            case View.MultiverseExplorer: return <FeatureGuard view={View.MultiverseExplorer}><MultiverseExplorerView /></FeatureGuard>;
            case View.MetaCognitiveDebugger: return <FeatureGuard view={View.MetaCognitiveDebugger}><MetaCognitiveDebuggerView /></FeatureGuard>;
            case View.CollectiveConsciousnessAmplifier: return <FeatureGuard view={View.CollectiveConsciousnessAmplifier}><CollectiveConsciousnessAmplifierView /></FeatureGuard>;
            case View.ExistentialRiskMitigator: return <FeatureGuard view={View.ExistentialRiskMitigator}><ExistentialRiskMitigatorView /></FeatureGuard>;
            case View.HyperdimensionalDataMapper: return <FeatureGuard view={View.HyperdimensionalDataMapper}><HyperdimensionalDataMapperView /></FeatureGuard>;
            case View.SelfEvolvingSystemArchitect: return <FeatureGuard view={View.SelfEvolvingSystemArchitect}><SelfEvolvingSystemArchitectView /></FeatureGuard>;
            case View.AlgorithmicMythosCreator: return <FeatureGuard view={View.AlgorithmicMythosCreator}><AlgorithmicMythosCreatorView /></FeatureGuard>;
            case View.BioIntegratedFinance: return <FeatureGuard view={View.BioIntegratedFinance}><BioIntegratedFinanceView /></FeatureGuard>;
            case View.PlanetaryResourceAllocator: return <FeatureGuard view={View.PlanetaryResourceAllocator}><PlatentaryResourceAllocatorView /></FeatureGuard>;
            case View.EmpathicAICompanion: return <FeatureGuard view={View.EmpathicAICompanion}><EmpathicAICompanionView /></FeatureGuard>;
            case View.NeuralNetworkGardener: return <FeatureGuard view={View.NeuralNetworkGardener}><NeuralNetworkGardenerView /></FeatureGuard>;
            case View.RealityComposer: return <FeatureGuard view={View.RealityComposer}><RealityComposerView /></FeatureGuard>;
            case View.PredictiveGovernanceEngine: return <FeatureGuard view={View.PredictiveGovernanceEngine}><PredictiveGovernanceEngineView /></FeatureGuard>;

            // Constitutional
            case View.TheCharter: return <FeatureGuard view={View.TheCharter}><TheCharterView /></FeatureGuard>;
            case View.FractionalReserve: return <FeatureGuard view={View.FractionalReserve}><FractionalReserveView /></FeatureGuard>;
            case View.FinancialInstrumentForge: return <FeatureGuard view={View.FinancialInstrumentForge}><FinancialInstrumentForgeView /></FeatureGuard>;

            default: return <MetaDashboardView openModal={openModal} />;
        }
    };

    const backgroundStyle = {
        backgroundImage: customBackgroundUrl ? `url(${customBackgroundUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
    };

    const IllusionLayer = () => {
        if (!activeIllusion || activeIllusion === 'none') return null;
        return <div className={`absolute inset-0 z-0 ${activeIllusion}-illusion`}></div>
    };

    return (
        <div className="relative min-h-screen bg-gray-950 text-gray-300 font-sans" style={backgroundStyle}>
            <IllusionLayer />
             <div className="relative z-10 flex min-h-screen bg-transparent">
                <Sidebar activeView={activeView} setActiveView={handleSetView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="flex-1 flex flex-col lg:ml-64">
                    <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} setActiveView={handleSetView} />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {renderView()}
                    </main>
                </div>
                {/* Global AI-powered components and system managers */}
                <VoiceControl setActiveView={handleSetView} />
                <GlobalChatbot />
                <GlobalNotificationCenter /> {/* New global notification system */}
                <UserSessionManager /> {/* Enhanced session management for premium features */}

                {modalView && (
                    <ModalView 
                        activeView={modalView}
                        previousView={modalPreviousView}
                        closeModal={closeModal}
                        openModal={openModal}
                    />
                )}
            </div>
        </div>
    );
};

export default App;