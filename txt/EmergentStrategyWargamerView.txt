import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- UTILITY TYPES & HELPER FUNCTIONS ---
export type ValueRange = [number, number]; // [min, max]

export const generateRandomNumber = (min: number, max: number, decimals: number = 0): number => {
  const factor = Math.pow(10, decimals);
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
};

export const formatCurrency = (amount: number, currency: string = '$'): string => {
  return `${currency}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const getMarketSentimentEmoji = (sentiment: number): string => {
  if (sentiment > 80) return '🚀';
  if (sentiment > 60) return '😊';
  if (sentiment > 40) return '😐';
  if (sentiment > 20) return '😟';
  return '📉';
};

export const weightedRandomPick = <T>(items: Array<{ item: T, weight: number }>): T => {
  const totalWeight = items.reduce((sum, { weight }) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  for (const { item, weight } of items) {
    if (random < weight) {
      return item;
    }
    random -= weight;
  }
  return items[0].item; // Fallback
};

export const calculateKPI = (value: number, target: number, higherIsBetter: boolean = true): 'good' | 'neutral' | 'bad' => {
  if (value === target) return 'neutral';
  if (higherIsBetter) {
    return value > target ? 'good' : 'bad';
  } else {
    return value < target ? 'good' : 'bad';
  }
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? Infinity : 0;
  return ((current - previous) / previous) * 100;
};

// --- CORE GAME INTERFACES ---

export interface ResourceAllocation {
  rd: number; // R&D budget percentage
  marketing: number; // Marketing budget percentage
  sales: number; // Sales budget percentage
  operations: number; // Operations efficiency budget percentage
  hr: number; // HR & Talent budget percentage
  customerService: number; // Customer Service budget percentage
  capitalInvestment: number; // Capital expenditure percentage
}

export interface ProductFeature {
  id: string;
  name: string;
  developmentCost: number;
  developmentTimeYears: number;
  marketImpact: ValueRange; // Range for potential market share boost
  customerSatisfactionBoost: ValueRange;
  innovationScore: number; // 0-100
  status: 'planned' | 'developing' | 'launched' | 'obsolete';
  launchYear?: number;
}

export interface ProductLine {
  id: string;
  name: string;
  type: 'AI_Platform' | 'FinTech_App' | 'Data_Analytics' | 'Consulting_Service';
  baseCost: number; // Per unit/customer operational cost
  basePrice: number;
  marketShare: number; // Market share for this specific product line
  customerCount: number;
  revenue: number;
  profit: number;
  features: ProductFeature[];
  innovationLevel: number; // 0-100, impacts adoption
  qualityScore: number; // 0-100
  lifecycleStage: 'introduction' | 'growth' | 'maturity' | 'decline';
  targetMarketSegmentIds: string[];
}

export interface MarketSegment {
  id: string;
  name: string;
  totalSize: number; // Total potential customers/revenue in this segment
  growthRate: ValueRange; // Annual growth rate range
  sensitivityToPrice: number; // 0-1, higher means more price-sensitive
  sensitivityToInnovation: number; // 0-1, higher means more innovation-driven
  currentPlayerPenetration: number; // Player's share of this segment
  competitorPenetration: { [competitorId: string]: number };
  customerLoyalty: number; // 0-100
}

export interface CompetitorProfile {
  id: string;
  name: string;
  description: string;
  marketShare: number;
  financialStrength: number; // 0-100
  innovationFocus: number; // 0-100
  marketingAggression: number; // 0-100
  strategy: 'innovate' | 'cost_leadership' | 'market_capture' | 'niche_focus';
  productOfferings: { id: string; name: string; type: ProductLine['type'] }[];
  recentActions: string[];
}

export interface PlayerStrategicDirective {
  overallFocus: 'innovation' | 'cost_reduction' | 'market_expansion' | 'customer_retention' | 'risk_management';
  resourceAllocation: ResourceAllocation;
  newProductDevelopment: {
    name: string;
    type: ProductLine['type'];
    targetMarketSegmentIds: string[];
    featuresToDevelop: string[]; // IDs of features
  }[];
  marketingCampaigns: {
    name: string;
    targetSegmentIds: string[];
    budget: number; // Absolute budget
    message: string;
  }[];
  pricingAdjustments: {
    productId: string;
    newPrice: number;
  }[];
  hrInitiatives: 'training' | 'hiring' | 'downsizing' | 'none';
  riskMitigation: string[]; // e.g., ['cybersecurity_investment', 'regulatory_compliance']
  targetAcquisitions: string[]; // Competitor IDs
  divestProductLines: string[]; // Product IDs
}

export interface FinancialStatement {
  revenue: number;
  cogs: number; // Cost of Goods Sold
  grossProfit: number;
  rdExpenses: number;
  marketingExpenses: number;
  salesExpenses: number;
  operationsExpenses: number;
  hrExpenses: number;
  customerServiceExpenses: number;
  depreciation: number;
  operatingProfit: number;
  interestExpenses: number;
  taxes: number;
  netProfit: number;
}

export interface BalanceSheet {
  cash: number;
  accountsReceivable: number;
  inventory: number;
  fixedAssets: number;
  totalAssets: number;
  accountsPayable: number;
  shortTermDebt: number;
  longTermDebt: number;
  totalLiabilities: number;
  equity: number;
  totalLiabilitiesAndEquity: number;
}

export interface CashFlowStatement {
  operatingActivities: number;
  investingActivities: number;
  financingActivities: number;
  netChangeInCash: number;
  beginningCash: number;
  endingCash: number;
}

export interface WargameCompanyState {
  id: string;
  name: string;
  yearEstablished: number;
  cash: number;
  marketShare: number;
  revenue: number;
  profit: number;
  employeeCount: number;
  rdBudget: number;
  marketingBudget: number;
  salesBudget: number;
  operationsBudget: number;
  hrBudget: number;
  customerServiceBudget: number;
  capitalInvestmentBudget: number;
  brandReputation: number; // 0-100
  customerSatisfaction: number; // 0-100
  productLines: ProductLine[];
  strategicFocus: PlayerStrategicDirective['overallFocus'];
  financials: {
    incomeStatement: FinancialStatement;
    balanceSheet: BalanceSheet;
    cashFlowStatement: CashFlowStatement;
  };
}

export interface YearEndReport {
  year: number;
  companyState: WargameCompanyState;
  competitorActions: string[];
  marketNewsEvents: string[];
  playerDecisionsSummary: PlayerStrategicDirective;
  kpis: {
    marketShareGrowth: number;
    revenueGrowth: number;
    profitMargin: number;
    customerAcquisitionCost: number; // hypothetical
    customerRetentionRate: number; // hypothetical
    innovationIndex: number; // hypothetical
    employeeMorale: number; // hypothetical
  };
  keyInsights: string[];
  recommendations: string[];
}

export interface GameState {
  currentYear: number;
  playerCompany: WargameCompanyState;
  competitors: CompetitorProfile[];
  marketSegments: MarketSegment[];
  historicalReports: YearEndReport[];
  globalMarketSentiment: number; // 0-100
}

// --- MOCK DATA GENERATION ---

export const generateInitialCompetitors = (): CompetitorProfile[] => [
  {
    id: 'comp1_finfuture',
    name: 'FinFuture Inc.',
    description: 'A large, established fintech player known for broad market reach and aggressive marketing.',
    marketShare: 35,
    financialStrength: 85,
    innovationFocus: 60,
    marketingAggression: 90,
    strategy: 'market_capture',
    productOfferings: [
      { id: 'prod_aiwallet', name: 'AI Wallet', type: 'FinTech_App' },
      { id: 'prod_corpfinance', name: 'Corporate Finance Suite', type: 'AI_Platform' },
    ],
    recentActions: [],
  },
  {
    id: 'comp2_innovatech',
    name: 'Innovatech Solutions',
    description: 'A challenger focused on bleeding-edge AI and data analytics, often first to market with new tech.',
    marketShare: 15,
    financialStrength: 60,
    innovationFocus: 95,
    marketingAggression: 50,
    strategy: 'innovate',
    productOfferings: [
      { id: 'prod_datapredict', name: 'Data Predictor AI', type: 'Data_Analytics' },
      { id: 'prod_edgeai', name: 'Edge AI Platform', type: 'AI_Platform' },
    ],
    recentActions: [],
  },
  {
    id: 'comp3_customercare',
    name: 'CustomerCare Co.',
    description: 'Known for exceptional customer service and strong loyalty, targets specific niche segments.',
    marketShare: 10,
    financialStrength: 70,
    innovationFocus: 40,
    marketingAggression: 60,
    strategy: 'niche_focus',
    productOfferings: [
      { id: 'prod_loyaltyapp', name: 'Loyalty Rewards App', type: 'FinTech_App' },
      { id: 'prod_smesupport', name: 'SME Consulting', type: 'Consulting_Service' },
    ],
    recentActions: [],
  },
];

export const generateInitialMarketSegments = (): MarketSegment[] => [
  {
    id: 'segment_consumer_mass',
    name: 'Mass Market Consumers',
    totalSize: 50000000,
    growthRate: [0.03, 0.07],
    sensitivityToPrice: 0.7,
    sensitivityToInnovation: 0.3,
    currentPlayerPenetration: 0.05,
    competitorPenetration: {
      'comp1_finfuture': 0.30,
      'comp2_innovatech': 0.05,
      'comp3_customercare': 0.08,
    },
    customerLoyalty: 60,
  },
  {
    id: 'segment_enterprise_smb',
    name: 'Small & Medium Businesses',
    totalSize: 5000000,
    growthRate: [0.05, 0.10],
    sensitivityToPrice: 0.5,
    sensitivityToInnovation: 0.6,
    currentPlayerPenetration: 0.02,
    competitorPenetration: {
      'comp1_finfuture': 0.15,
      'comp2_innovatech': 0.10,
      'comp3_customercare': 0.05,
    },
    customerLoyalty: 70,
  },
  {
    id: 'segment_enterprise_large',
    name: 'Large Enterprises',
    totalSize: 500000,
    growthRate: [0.02, 0.05],
    sensitivityToPrice: 0.3,
    sensitivityToInnovation: 0.8,
    currentPlayerPenetration: 0.01,
    competitorPenetration: {
      'comp1_finfuture': 0.10,
      'comp2_innovatech': 0.20,
      'comp3_customercare': 0.02,
    },
    customerLoyalty: 80,
  },
  {
    id: 'segment_developer_api',
    name: 'Developer & API Integrators',
    totalSize: 1000000,
    growthRate: [0.08, 0.15],
    sensitivityToPrice: 0.4,
    sensitivityToInnovation: 0.9,
    currentPlayerPenetration: 0.005,
    competitorPenetration: {
      'comp1_finfuture': 0.05,
      'comp2_innovatech': 0.15,
      'comp3_customercare': 0.01,
    },
    customerLoyalty: 75,
  },
];

export const generateInitialPlayerCompany = (): WargameCompanyState => {
  const initialProductFeatures: ProductFeature[] = [
    {
      id: 'core_data_analytics_v1',
      name: 'Basic Data Analytics',
      developmentCost: 500000,
      developmentTimeYears: 0,
      marketImpact: [0.01, 0.02],
      customerSatisfactionBoost: [5, 10],
      innovationScore: 40,
      status: 'launched',
      launchYear: 2024,
    },
    {
      id: 'core_fintech_app_v1',
      name: 'Basic Budgeting App',
      developmentCost: 750000,
      developmentTimeYears: 0,
      marketImpact: [0.015, 0.025],
      customerSatisfactionBoost: [7, 12],
      innovationScore: 50,
      status: 'launched',
      launchYear: 2024,
    },
    {
      id: 'next_gen_ai_feature_a',
      name: 'Predictive Spending AI (Planned)',
      developmentCost: 2000000,
      developmentTimeYears: 2,
      marketImpact: [0.03, 0.06],
      customerSatisfactionBoost: [15, 25],
      innovationScore: 80,
      status: 'planned',
    },
    {
      id: 'enterprise_api_integration_feature_b',
      name: 'Enterprise API Gateway (Planned)',
      developmentCost: 1500000,
      developmentTimeYears: 1,
      marketImpact: [0.02, 0.04],
      customerSatisfactionBoost: [10, 20],
      innovationScore: 70,
      status: 'planned',
    },
  ];

  const initialProductLines: ProductLine[] = [
    {
      id: 'player_fintech_suite',
      name: 'FinTech Suite Basic',
      type: 'FinTech_App',
      baseCost: 5,
      basePrice: 15,
      marketShare: 0.05,
      customerCount: 100000,
      revenue: 1500000,
      profit: 750000,
      features: initialProductFeatures.filter(f => f.id.includes('fintech')),
      innovationLevel: 55,
      qualityScore: 70,
      lifecycleStage: 'growth',
      targetMarketSegmentIds: ['segment_consumer_mass'],
    },
    {
      id: 'player_data_analytics',
      name: 'Data Insights Platform',
      type: 'Data_Analytics',
      baseCost: 20,
      basePrice: 50,
      marketShare: 0.02,
      customerCount: 10000,
      revenue: 500000,
      profit: 200000,
      features: initialProductFeatures.filter(f => f.id.includes('data_analytics')),
      innovationLevel: 60,
      qualityScore: 75,
      lifecycleStage: 'introduction',
      targetMarketSegmentIds: ['segment_enterprise_smb', 'segment_developer_api'],
    },
  ];

  const initialIncomeStatement: FinancialStatement = {
    revenue: 2000000,
    cogs: 800000,
    grossProfit: 1200000,
    rdExpenses: 200000,
    marketingExpenses: 300000,
    salesExpenses: 150000,
    operationsExpenses: 100000,
    hrExpenses: 200000,
    customerServiceExpenses: 50000,
    depreciation: 50000,
    operatingProfit: 150000,
    interestExpenses: 20000,
    taxes: 30000,
    netProfit: 100000,
  };

  const initialBalanceSheet: BalanceSheet = {
    cash: 5000000,
    accountsReceivable: 100000,
    inventory: 0,
    fixedAssets: 1000000,
    totalAssets: 6100000,
    accountsPayable: 50000,
    shortTermDebt: 200000,
    longTermDebt: 1000000,
    totalLiabilities: 1250000,
    equity: 4850000,
    totalLiabilitiesAndEquity: 6100000,
  };

  const initialCashFlowStatement: CashFlowStatement = {
    operatingActivities: 100000,
    investingActivities: -50000,
    financingActivities: 0,
    netChangeInCash: 50000,
    beginningCash: 4950000,
    endingCash: 5000000,
  };

  return {
    id: 'player_company',
    name: 'Nexus Innovations',
    yearEstablished: 2024,
    cash: 5000000,
    marketShare: 0.07, // 7% initial total market share
    revenue: 2000000,
    profit: 100000,
    employeeCount: 150,
    rdBudget: 200000,
    marketingBudget: 300000,
    salesBudget: 150000,
    operationsBudget: 100000,
    hrBudget: 200000,
    customerServiceBudget: 50000,
    capitalInvestmentBudget: 0,
    brandReputation: 65,
    customerSatisfaction: 70,
    productLines: initialProductLines,
    strategicFocus: 'innovation',
    financials: {
      incomeStatement: initialIncomeStatement,
      balanceSheet: initialBalanceSheet,
      cashFlowStatement: initialCashFlowStatement,
    },
  };
};

export const getInitialGameState = (): GameState => ({
  currentYear: 2024,
  playerCompany: generateInitialPlayerCompany(),
  competitors: generateInitialCompetitors(),
  marketSegments: generateInitialMarketSegments(),
  historicalReports: [],
  globalMarketSentiment: 60,
});

// --- SIMULATION ENGINE CORE ---

export class SimulationEngine {
  private gameState: GameState;
  private currentDirective: PlayerStrategicDirective | null = null;

  constructor(initialState: GameState) {
    this.gameState = JSON.parse(JSON.stringify(initialState)); // Deep copy
  }

  public setPlayerDirective(directive: PlayerStrategicDirective) {
    this.currentDirective = directive;
  }

  public async advanceYear(): Promise<YearEndReport> {
    if (!this.currentDirective) {
      throw new Error('Player strategic directive must be set before advancing year.');
    }

    const prevCompanyState = JSON.parse(JSON.stringify(this.gameState.playerCompany));
    const prevCompetitorStates = JSON.parse(JSON.stringify(this.gameState.competitors));
    const prevMarketSegments = JSON.parse(JSON.stringify(this.gameState.marketSegments));

    // 1. Apply Player's Strategic Directive
    this.applyPlayerStrategy(this.gameState.playerCompany, this.currentDirective);

    // 2. Simulate R&D Outcomes
    this.simulateRD(this.gameState.playerCompany);

    // 3. Simulate Competitor Actions & AI
    const competitorActions = this.simulateCompetitorActions(this.gameState.competitors, this.gameState.playerCompany, this.gameState.marketSegments);

    // 4. Simulate Market Dynamics & Customer Behavior
    this.simulateMarketDynamics(this.gameState.playerCompany, this.gameState.competitors, this.gameState.marketSegments, this.currentDirective, this.gameState.globalMarketSentiment);

    // 5. Simulate Marketing & Sales Effectiveness
    this.simulateMarketingAndSales(this.gameState.playerCompany, this.currentDirective, this.gameState.marketSegments);

    // 6. Simulate Operations and HR
    this.simulateOperationsAndHR(this.gameState.playerCompany, this.currentDirective);

    // 7. Generate Random News and Global Events
    const marketNewsEvents = this.generateMarketNewsEvents();
    this.applyGlobalEvents(marketNewsEvents);

    // 8. Calculate Financials
    this.calculateAllFinancials(this.gameState.playerCompany);

    // 9. Update Global Game State
    this.gameState.currentYear++;
    this.gameState.globalMarketSentiment = generateRandomNumber(
      Math.max(0, this.gameState.globalMarketSentiment - 10),
      Math.min(100, this.gameState.globalMarketSentiment + 10),
      0
    );

    // 10. Generate Year-End Report
    const yearEndReport = this.generateYearEndReport(
      prevCompanyState,
      prevCompetitorStates,
      prevMarketSegments,
      this.gameState.playerCompany,
      competitorActions,
      marketNewsEvents,
      this.currentDirective
    );
    this.gameState.historicalReports.push(yearEndReport);

    this.currentDirective = null; // Reset directive for next year
    return yearEndReport;
  }

  private applyPlayerStrategy(company: WargameCompanyState, directive: PlayerStrategicDirective) {
    company.strategicFocus = directive.overallFocus;

    // Allocate budgets based on percentages
    const totalBudget = company.cash * 0.2; // Example: 20% of cash as annual operational budget
    company.rdBudget = totalBudget * (directive.resourceAllocation.rd / 100);
    company.marketingBudget = totalBudget * (directive.resourceAllocation.marketing / 100);
    company.salesBudget = totalBudget * (directive.resourceAllocation.sales / 100);
    company.operationsBudget = totalBudget * (directive.resourceAllocation.operations / 100);
    company.hrBudget = totalBudget * (directive.resourceAllocation.hr / 100);
    company.customerServiceBudget = totalBudget * (directive.resourceAllocation.customerService / 100);
    company.capitalInvestmentBudget = totalBudget * (directive.resourceAllocation.capitalInvestment / 100);

    // Deduct budgets from cash (initial allocation)
    company.cash -= totalBudget;

    // Handle new product development (initial setup, actual launch happens after dev time)
    directive.newProductDevelopment.forEach(newProd => {
      const existingProduct = company.productLines.find(p => p.name === newProd.name);
      if (!existingProduct) {
        const productBaseCost = generateRandomNumber(10, 30);
        const productBasePrice = generateRandomNumber(40, 100);
        const newFeatures: ProductFeature[] = [];
        newProd.featuresToDevelop.forEach(featureId => {
          // Mock features being created or pulled from a global feature pool
          newFeatures.push({
            id: `${newProd.name}_${featureId}`,
            name: `Feature: ${featureId}`,
            developmentCost: generateRandomNumber(100000, 1000000),
            developmentTimeYears: generateRandomNumber(1, 3, 0),
            marketImpact: [0.01, 0.05],
            customerSatisfactionBoost: [5, 15],
            innovationScore: generateRandomNumber(60, 95),
            status: 'developing',
          });
        });

        company.productLines.push({
          id: `prod_${newProd.name.toLowerCase().replace(/\s/g, '_')}`,
          name: newProd.name,
          type: newProd.type,
          baseCost: productBaseCost,
          basePrice: productBasePrice,
          marketShare: 0,
          customerCount: 0,
          revenue: 0,
          profit: 0,
          features: newFeatures,
          innovationLevel: generateRandomNumber(50, 70),
          qualityScore: generateRandomNumber(60, 80),
          lifecycleStage: 'introduction',
          targetMarketSegmentIds: newProd.targetMarketSegmentIds,
        });
      }
    });

    // Handle pricing adjustments
    directive.pricingAdjustments.forEach(adjustment => {
      const product = company.productLines.find(p => p.id === adjustment.productId);
      if (product) {
        product.basePrice = adjustment.newPrice;
        // Impact customer satisfaction/market share immediately (simplified)
        const priceChangeEffect = (adjustment.newPrice - product.basePrice) / product.basePrice;
        product.customerCount *= (1 - priceChangeEffect * 0.1); // Small immediate effect
      }
    });

    // Handle divest product lines
    directive.divestProductLines.forEach(productId => {
      company.productLines = company.productLines.filter(p => p.id !== productId);
      // Simulate cash inflow from divestment
      company.cash += generateRandomNumber(500000, 2000000);
    });

    // Handle target acquisitions (simplified - just remove competitor)
    directive.targetAcquisitions.forEach(competitorId => {
      this.gameState.competitors = this.gameState.competitors.filter(c => c.id !== competitorId);
      // Simulate cash outflow
      company.cash -= generateRandomNumber(10000000, 50000000);
      company.brandReputation += generateRandomNumber(5, 15);
      // Add acquired products to player's portfolio (simplified)
      const acquiredComp = prevCompetitorStates.find(c => c.id === competitorId);
      if (acquiredComp) {
        acquiredComp.productOfferings.forEach(p => {
          company.productLines.push({
            id: `acquired_${p.id}`,
            name: `Acquired ${p.name}`,
            type: p.type,
            baseCost: generateRandomNumber(5, 20),
            basePrice: generateRandomNumber(20, 80),
            marketShare: generateRandomNumber(0.01, 0.03),
            customerCount: generateRandomNumber(50000, 200000),
            revenue: generateRandomNumber(1000000, 5000000),
            profit: generateRandomNumber(200000, 1000000),
            features: [], // Simplified: no specific features for acquired products initially
            innovationLevel: generateRandomNumber(40, 70),
            qualityScore: generateRandomNumber(60, 80),
            lifecycleStage: 'maturity',
            targetMarketSegmentIds: this.gameState.marketSegments.map(s => s.id), // All segments for simplicity
          });
        });
      }
    });
  }

  private simulateRD(company: WargameCompanyState) {
    company.rdBudget *= generateRandomNumber(0.8, 1.2); // Actual spend fluctuates

    company.productLines.forEach(product => {
      product.features.forEach(feature => {
        if (feature.status === 'developing') {
          feature.developmentTimeYears--;
          if (feature.developmentTimeYears <= 0) {
            feature.status = 'launched';
            feature.launchYear = this.gameState.currentYear + 1; // Launches next year
            company.innovationLevel = Math.min(100, company.innovationLevel + generateRandomNumber(feature.innovationScore / 20, feature.innovationScore / 10));
            company.customerSatisfaction = Math.min(100, company.customerSatisfaction + generateRandomNumber(feature.customerSatisfactionBoost[0], feature.customerSatisfactionBoost[1]));
          }
          company.rdBudget -= feature.developmentCost / feature.developmentTimeYears; // Spend a portion of cost
        }
      });
      // General innovation boost from RD budget
      product.innovationLevel = Math.min(100, product.innovationLevel + company.rdBudget / 500000 * generateRandomNumber(0.1, 0.5));
    });
    company.cash -= company.rdBudget;
  }

  private simulateMarketingAndSales(company: WargameCompanyState, directive: PlayerStrategicDirective, marketSegments: MarketSegment[]) {
    company.marketingBudget *= generateRandomNumber(0.8, 1.2);
    company.salesBudget *= generateRandomNumber(0.8, 1.2);

    let totalMarketShareGain = 0;
    let totalBrandReputationBoost = 0;

    // Apply general marketing budget effects
    totalBrandReputationBoost += (company.marketingBudget / 1000000) * generateRandomNumber(1, 3);
    company.brandReputation = Math.min(100, company.brandReputation + totalBrandReputationBoost);
    company.customerSatisfaction = Math.min(100, company.customerSatisfaction + (company.marketingBudget / 1000000) * generateRandomNumber(0.5, 1));

    // Apply specific marketing campaign effects
    directive.marketingCampaigns.forEach(campaign => {
      const effectiveBudget = campaign.budget * generateRandomNumber(0.8, 1.2);
      company.cash -= effectiveBudget; // Deduct campaign budget

      campaign.targetSegmentIds.forEach(segmentId => {
        const segment = marketSegments.find(s => s.id === segmentId);
        if (segment) {
          const campaignEffect = (effectiveBudget / 100000) * generateRandomNumber(0.001, 0.005); // Small market share gain per 100k budget
          segment.currentPlayerPenetration = Math.min(1, segment.currentPlayerPenetration + campaignEffect);
          totalMarketShareGain += campaignEffect;
          company.brandReputation = Math.min(100, company.brandReputation + campaignEffect * 100);
        }
      });
    });

    // Sales efforts translate to direct customer acquisition
    company.productLines.forEach(product => {
      product.targetMarketSegmentIds.forEach(segmentId => {
        const segment = marketSegments.find(s => s.id === segmentId);
        if (segment) {
          const acquisitionRate = (company.salesBudget / 1000000) * generateRandomNumber(0.01, 0.05) * segment.sensitivityToPrice * (company.brandReputation / 100) * (product.innovationLevel / 100);
          const potentialCustomers = segment.totalSize * (1 - segment.currentPlayerPenetration); // Customers not yet acquired by player
          const newCustomers = Math.min(potentialCustomers, potentialCustomers * acquisitionRate);
          product.customerCount += newCustomers;
          segment.currentPlayerPenetration += newCustomers / segment.totalSize; // Update segment penetration
          company.customerSatisfaction = Math.min(100, company.customerSatisfaction + (company.salesBudget / 1000000) * generateRandomNumber(0.1, 0.3));
        }
      });
    });

    company.cash -= (company.marketingBudget + company.salesBudget);
  }

  private simulateOperationsAndHR(company: WargameCompanyState, directive: PlayerStrategicDirective) {
    company.operationsBudget *= generateRandomNumber(0.8, 1.2);
    company.hrBudget *= generateRandomNumber(0.8, 1.2);

    // Operational efficiency impacts COGS and quality
    company.productLines.forEach(product => {
      product.baseCost *= (1 - (company.operationsBudget / 1000000) * generateRandomNumber(0.01, 0.03)); // Reduce cost
      product.qualityScore = Math.min(100, product.qualityScore + (company.operationsBudget / 1000000) * generateRandomNumber(0.5, 1.5));
    });

    // HR initiatives
    switch (directive.hrInitiatives) {
      case 'hiring':
        company.employeeCount = Math.round(company.employeeCount * generateRandomNumber(1.05, 1.15));
        company.hrBudget *= 1.2; // Increased HR spend
        company.customerSatisfaction = Math.min(100, company.customerSatisfaction + generateRandomNumber(2, 5));
        company.brandReputation = Math.min(100, company.brandReputation + generateRandomNumber(1, 3));
        break;
      case 'training':
        company.hrBudget *= 1.1; // Increased HR spend
        company.customerSatisfaction = Math.min(100, company.customerSatisfaction + generateRandomNumber(3, 7));
        company.productLines.forEach(p => p.qualityScore = Math.min(100, p.qualityScore + generateRandomNumber(2, 5)));
        break;
      case 'downsizing':
        company.employeeCount = Math.round(company.employeeCount * generateRandomNumber(0.85, 0.95));
        company.hrBudget *= 0.8; // Decreased HR spend
        company.customerSatisfaction = Math.max(0, company.customerSatisfaction - generateRandomNumber(5, 10));
        company.brandReputation = Math.max(0, company.brandReputation - generateRandomNumber(3, 7));
        break;
      case 'none':
      default:
        // Stable
        break;
    }

    // Customer service budget impacts satisfaction
    company.customerServiceBudget *= generateRandomNumber(0.8, 1.2);
    company.customerSatisfaction = Math.min(100, company.customerSatisfaction + (company.customerServiceBudget / 500000) * generateRandomNumber(0.5, 2));

    company.cash -= (company.operationsBudget + company.hrBudget + company.customerServiceBudget);
  }

  private simulateCompetitorActions(competitors: CompetitorProfile[], playerCompany: WargameCompanyState, marketSegments: MarketSegment[]): string[] {
    const actions: string[] = [];

    competitors.forEach(comp => {
      const rand = Math.random();
      comp.recentActions = []; // Clear previous actions

      let actionTaken = '';
      switch (comp.strategy) {
        case 'innovate':
          if (rand < 0.4) {
            actionTaken = `${comp.name} launched a new AI-driven feature for their leading product.`;
            comp.innovationFocus = Math.min(100, comp.innovationFocus + generateRandomNumber(5, 10));
            comp.marketShare += generateRandomNumber(0.005, 0.015);
            playerCompany.marketShare = Math.max(0, playerCompany.marketShare - generateRandomNumber(0.001, 0.005));
          } else if (rand < 0.7) {
            actionTaken = `${comp.name} announced a major investment in next-gen R&D.`;
            comp.financialStrength = Math.max(0, comp.financialStrength - generateRandomNumber(2, 5)); // Cost of investment
            comp.innovationFocus = Math.min(100, comp.innovationFocus + generateRandomNumber(2, 5));
          } else {
            actionTaken = `${comp.name} filed several new patents in AI.`;
            comp.innovationFocus = Math.min(100, comp.innovationFocus + generateRandomNumber(1, 3));
          }
          break;
        case 'cost_leadership':
          if (rand < 0.5) {
            actionTaken = `${comp.name} reduced prices across their core product lines by ${generateRandomNumber(5, 15, 0)}%.`;
            comp.marketShare += generateRandomNumber(0.008, 0.02);
            playerCompany.marketShare = Math.max(0, playerCompany.marketShare - generateRandomNumber(0.003, 0.01));
            playerCompany.productLines.forEach(p => p.basePrice *= generateRandomNumber(0.98, 1.02)); // Player might react
          } else {
            actionTaken = `${comp.name} announced new operational efficiency initiatives.`;
            comp.financialStrength = Math.min(100, comp.financialStrength + generateRandomNumber(1, 3));
          }
          break;
        case 'market_capture':
          if (rand < 0.6) {
            actionTaken = `${comp.name} launched an aggressive new marketing campaign targeting new customer segments.`;
            comp.marketingAggression = Math.min(100, comp.marketingAggression + generateRandomNumber(5, 10));
            comp.marketShare += generateRandomNumber(0.01, 0.03);
            playerCompany.marketShare = Math.max(0, playerCompany.marketShare - generateRandomNumber(0.005, 0.015));
          } else {
            actionTaken = `${comp.name} expanded into a new geographical market.`;
            comp.marketShare += generateRandomNumber(0.005, 0.01);
          }
          break;
        case 'niche_focus':
          if (rand < 0.5) {
            const nicheSegment = weightedRandomPick(marketSegments.filter(s => s.name.includes('Small') || s.name.includes('Developer')).map(s => ({ item: s, weight: 1 })));
            if (nicheSegment) {
              actionTaken = `${comp.name} intensified focus on the ${nicheSegment.name} segment with tailored offerings.`;
              comp.marketShare += generateRandomNumber(0.002, 0.008); // Smaller gains, but solidifies position
              playerCompany.marketShare = Math.max(0, playerCompany.marketShare - generateRandomNumber(0.0005, 0.002));
            }
          } else {
            actionTaken = `${comp.name} enhanced customer support for their specialized clientele.`;
            comp.financialStrength = Math.min(100, comp.financialStrength + generateRandomNumber(1, 2));
          }
          break;
      }
      if (actionTaken) {
        comp.recentActions.push(actionTaken);
        actions.push(`${comp.name}: ${actionTaken}`);
      }
      comp.marketShare = Math.max(0, Math.min(100, comp.marketShare + generateRandomNumber(-0.5, 0.5))); // General fluctuation
    });

    // Recalculate player market share based on competitor movement
    const totalCompetitorShare = competitors.reduce((sum, c) => sum + c.marketShare, 0);
    playerCompany.marketShare = 100 - totalCompetitorShare - generateRandomNumber(5, 15); // Assume some unclaimed or smaller player share

    // Ensure total market share doesn't exceed 100% (simple normalization)
    const totalCurrentShare = playerCompany.marketShare + totalCompetitorShare;
    if (totalCurrentShare > 100) {
      const overflow = totalCurrentShare - 100;
      playerCompany.marketShare -= overflow * 0.5;
      competitors.forEach(c => c.marketShare -= overflow * 0.5 / competitors.length);
    }
    playerCompany.marketShare = Math.max(0, playerCompany.marketShare);

    return actions;
  }

  private simulateMarketDynamics(company: WargameCompanyState, competitors: CompetitorProfile[], marketSegments: MarketSegment[], directive: PlayerStrategicDirective, globalSentiment: number) {
    marketSegments.forEach(segment => {
      // Segment growth
      segment.totalSize = Math.round(segment.totalSize * (1 + generateRandomNumber(segment.growthRate[0], segment.growthRate[1])));

      // General churn and acquisition dynamics
      let playerNetChange = 0;
      let totalSegmentPenetration = 0;

      // Player's market share in this segment
      const playerProductIdsInSegment = company.productLines
        .filter(p => p.targetMarketSegmentIds.includes(segment.id))
        .map(p => p.id);

      let playerSegmentCustomers = company.productLines
        .filter(p => playerProductIdsInSegment.includes(p.id))
        .reduce((sum, p) => sum + p.customerCount, 0);

      // Churn (based on satisfaction, quality, competitor activity)
      const churnRate = (100 - company.customerSatisfaction) / 200 + (100 - segment.customerLoyalty) / 300 + generateRandomNumber(0.01, 0.03);
      const churnedCustomers = playerSegmentCustomers * churnRate;
      playerNetChange -= churnedCustomers;

      // New acquisitions (from market growth, marketing campaigns, innovation)
      const innovationPull = (company.productLines.filter(p => playerProductIdsInSegment.includes(p.id)).reduce((sum, p) => sum + p.innovationLevel, 0) / playerProductIdsInSegment.length || 0) / 100;
      const marketingPush = (directive.marketingCampaigns.filter(c => c.targetSegmentIds.includes(segment.id)).reduce((sum, c) => sum + c.budget, 0) / 1000000);
      const salesEfficiency = (company.salesBudget / 1000000);

      const acquisitionRate = (innovationPull * segment.sensitivityToInnovation * 0.02) + (marketingPush * 0.01) + (salesEfficiency * 0.005) + (globalSentiment / 100 * 0.005);
      const potentialNewCustomers = Math.max(0, segment.totalSize - playerSegmentCustomers - Object.values(segment.competitorPenetration).reduce((a, b) => a + b, 0) * segment.totalSize);
      const newCustomers = potentialNewCustomers * acquisitionRate;
      playerNetChange += newCustomers;

      // Apply net change to products in segment (distribute proportionally)
      const totalInitialCustomerCountForSegment = company.productLines
        .filter(p => playerProductIdsInSegment.includes(p.id))
        .reduce((sum, p) => sum + p.customerCount, 0);

      if (totalInitialCustomerCountForSegment > 0) {
        company.productLines.forEach(product => {
          if (playerProductIdsInSegment.includes(product.id)) {
            const proportion = product.customerCount / totalInitialCustomerCountForSegment;
            product.customerCount = Math.max(0, product.customerCount + (playerNetChange * proportion));
            product.customerCount = Math.round(product.customerCount);
          }
        });
      } else if (playerNetChange > 0 && company.productLines.length > 0) {
        // If no products initially, but gain customers, assign to a random product
        const productToAssign = company.productLines.find(p => p.targetMarketSegmentIds.includes(segment.id)) || company.productLines[0];
        if (productToAssign) productToAssign.customerCount += Math.round(playerNetChange);
      }


      // Update segment penetration based on new customer counts
      playerSegmentCustomers = company.productLines
        .filter(p => playerProductIdsInSegment.includes(p.id))
        .reduce((sum, p) => sum + p.customerCount, 0);
      segment.currentPlayerPenetration = Math.min(1, playerSegmentCustomers / segment.totalSize);

      // Competitor segment penetration changes (simplified)
      for (const compId in segment.competitorPenetration) {
        segment.competitorPenetration[compId] = Math.max(0, Math.min(1, segment.competitorPenetration[compId] + generateRandomNumber(-0.005, 0.005)));
      }

      totalSegmentPenetration = segment.currentPlayerPenetration + Object.values(segment.competitorPenetration).reduce((a, b) => a + b, 0);
      // Normalize if over 100%
      if (totalSegmentPenetration > 1.0) {
        const excess = totalSegmentPenetration - 1.0;
        segment.currentPlayerPenetration -= excess / (Object.keys(segment.competitorPenetration).length + 1);
        for (const compId in segment.competitorPenetration) {
          segment.competitorPenetration[compId] -= excess / (Object.keys(segment.competitorPenetration).length + 1);
        }
      }
      segment.currentPlayerPenetration = Math.max(0, segment.currentPlayerPenetration);
      for (const compId in segment.competitorPenetration) {
        segment.competitorPenetration[compId] = Math.max(0, segment.competitorPenetration[compId]);
      }
    });

    // Update overall company market share based on product performance and segment penetration
    let newOverallMarketShare = 0;
    company.productLines.forEach(product => {
      product.revenue = product.customerCount * product.basePrice;
      product.profit = product.customerCount * (product.basePrice - product.baseCost);

      const productImpactOnMarketShare = product.customerCount / (marketSegments.reduce((sum, s) => sum + s.totalSize, 0) / company.productLines.length); // Very simplified
      newOverallMarketShare += productImpactOnMarketShare;
    });

    company.marketShare = newOverallMarketShare * 100; // Convert to percentage
    company.marketShare = Math.max(0, Math.min(100, company.marketShare)); // Clamp

    // Global sentiment impacts customer satisfaction and brand reputation
    company.customerSatisfaction = Math.min(100, company.customerSatisfaction + (globalSentiment - 50) / 10);
    company.brandReputation = Math.min(100, company.brandReputation + (globalSentiment - 50) / 15);
  }

  private generateMarketNewsEvents(): string[] {
    const events: string[] = [];
    const eventProb = Math.random();

    if (eventProb < 0.1) {
      events.push(`Major Tech Breakthrough: A new quantum computing standard could disrupt current AI infrastructure within 3-5 years.`);
      this.gameState.globalMarketSentiment = Math.max(0, this.gameState.globalMarketSentiment - generateRandomNumber(10, 20));
    } else if (eventProb < 0.2) {
      events.push(`Global Economic Boom: Analysts predict significant growth, boosting consumer spending power.`);
      this.gameState.globalMarketSentiment = Math.min(100, this.gameState.globalMarketSentiment + generateRandomNumber(10, 20));
    } else if (eventProb < 0.3) {
      events.push(`New Regulatory Scrutiny: Governments are increasing oversight on data privacy in the FinTech sector.`);
      this.gameState.globalMarketSentiment = Math.max(0, this.gameState.globalMarketSentiment - generateRandomNumber(5, 10));
    } else if (eventProb < 0.4) {
      events.push(`Talent Shortage Crisis: The demand for AI engineers continues to outpace supply, driving up salaries.`);
    } else if (eventProb < 0.5) {
      events.push(`Major Cybersecurity Incident: A prominent tech firm suffered a data breach, raising industry-wide concerns.`);
      this.gameState.playerCompany.brandReputation = Math.max(0, this.gameState.playerCompany.brandReputation - generateRandomNumber(3, 7)); // Player might get affected
      this.gameState.globalMarketSentiment = Math.max(0, this.gameState.globalMarketSentiment - generateRandomNumber(5, 10));
    } else if (eventProb < 0.6) {
      events.push(`Consumer Trust Rebound: Public confidence in digital finance solutions is at an all-time high.`);
      this.gameState.globalMarketSentiment = Math.min(100, this.gameState.globalMarketSentiment + generateRandomNumber(5, 10));
    } else if (eventProb < 0.7) {
      events.push(`Rise of New Market Segment: "Green Finance" initiatives are gaining traction, creating new opportunities.`);
    } else {
      events.push(`Routine Market Fluctuations: General stability observed, with minor shifts in sector performance.`);
    }

    return events;
  }

  private applyGlobalEvents(events: string[]) {
    // This method is primarily for direct state changes due to events
    // Most event impacts are already integrated into the `generateMarketNewsEvents`
    // and `simulateMarketDynamics` where globalSentiment is used.
    // Additional direct impacts could be added here if needed, e.g.,
    // if a specific event forces a direct change to a company's budget or product status.
  }

  private calculateAllFinancials(company: WargameCompanyState) {
    let totalRevenue = 0;
    let totalCogs = 0;
    company.productLines.forEach(p => {
      totalRevenue += p.revenue;
      totalCogs += p.customerCount * p.baseCost;
    });

    const incomeStatement: FinancialStatement = {
      revenue: totalRevenue,
      cogs: totalCogs,
      grossProfit: totalRevenue - totalCogs,
      rdExpenses: company.rdBudget,
      marketingExpenses: company.marketingBudget,
      salesExpenses: company.salesBudget,
      operationsExpenses: company.operationsBudget,
      hrExpenses: company.hrBudget,
      customerServiceExpenses: company.customerServiceBudget,
      depreciation: generateRandomNumber(50000, 100000), // Simplified
      operatingProfit: 0,
      interestExpenses: generateRandomNumber(10000, 30000), // Simplified
      taxes: 0,
      netProfit: 0,
    };
    incomeStatement.operatingProfit = incomeStatement.grossProfit - incomeStatement.rdExpenses - incomeStatement.marketingExpenses - incomeStatement.salesExpenses - incomeStatement.operationsExpenses - incomeStatement.hrExpenses - incomeStatement.customerServiceExpenses - incomeStatement.depreciation;
    incomeStatement.taxes = incomeStatement.operatingProfit > 0 ? incomeStatement.operatingProfit * generateRandomNumber(0.2, 0.3) : 0;
    incomeStatement.netProfit = incomeStatement.operatingProfit - incomeStatement.interestExpenses - incomeStatement.taxes;

    // Update company cash based on net profit (simplified - ignoring full cash flow)
    company.cash += incomeStatement.netProfit - incomeStatement.capitalInvestmentBudget;
    company.cash = Math.max(0, company.cash); // Cannot go below zero

    // Update company revenue and profit directly
    company.revenue = incomeStatement.revenue;
    company.profit = incomeStatement.netProfit;

    // Simplified Balance Sheet Update
    const balanceSheet: BalanceSheet = {
      ...company.financials.balanceSheet, // Start with previous year's balance sheet
      cash: company.cash,
      accountsReceivable: totalRevenue * generateRandomNumber(0.05, 0.1), // 5-10% of revenue outstanding
      fixedAssets: company.financials.balanceSheet.fixedAssets + incomeStatement.capitalInvestmentBudget - incomeStatement.depreciation,
    };
    balanceSheet.totalAssets = balanceSheet.cash + balanceSheet.accountsReceivable + balanceSheet.inventory + balanceSheet.fixedAssets;
    balanceSheet.accountsPayable = totalCogs * generateRandomNumber(0.02, 0.05); // 2-5% of COGS outstanding
    balanceSheet.shortTermDebt = company.financials.balanceSheet.shortTermDebt * generateRandomNumber(0.95, 1.05);
    balanceSheet.longTermDebt = company.financials.balanceSheet.longTermDebt * generateRandomNumber(0.98, 1.02);
    balanceSheet.totalLiabilities = balanceSheet.accountsPayable + balanceSheet.shortTermDebt + balanceSheet.longTermDebt;
    balanceSheet.equity = balanceSheet.totalAssets - balanceSheet.totalLiabilities;
    balanceSheet.totalLiabilitiesAndEquity = balanceSheet.totalLiabilities + balanceSheet.equity;


    // Simplified Cash Flow Statement
    const cashFlowStatement: CashFlowStatement = {
      beginningCash: company.financials.balanceSheet.cash,
      operatingActivities: incomeStatement.netProfit // Simplified: Net profit as a proxy
        + incomeStatement.depreciation // Add back non-cash expenses
        + (balanceSheet.accountsPayable - company.financials.balanceSheet.accountsPayable) // Change in AP
        - (balanceSheet.accountsReceivable - company.financials.balanceSheet.accountsReceivable), // Change in AR
      investingActivities: -incomeStatement.capitalInvestmentBudget,
      financingActivities: generateRandomNumber(-50000, 50000), // Simple debt repayment/issuance
      netChangeInCash: 0,
      endingCash: 0,
    };
    cashFlowStatement.netChangeInCash = cashFlowStatement.operatingActivities + cashFlowStatement.investingActivities + cashFlowStatement.financingActivities;
    cashFlowStatement.endingCash = cashFlowStatement.beginningCash + cashFlowStatement.netChangeInCash;

    company.financials = { incomeStatement, balanceSheet, cashFlowStatement };
  }

  private generateYearEndReport(
    prevCompany: WargameCompanyState,
    prevCompetitors: CompetitorProfile[],
    prevMarketSegments: MarketSegment[],
    currentCompany: WargameCompanyState,
    competitorActions: string[],
    marketNewsEvents: string[],
    directive: PlayerStrategicDirective
  ): YearEndReport {
    const marketShareGrowth = calculateGrowthRate(currentCompany.marketShare, prevCompany.marketShare);
    const revenueGrowth = calculateGrowthRate(currentCompany.revenue, prevCompany.revenue);
    const profitMargin = (currentCompany.profit / currentCompany.revenue) * 100;
    const customerAcquisitionCost = currentCompany.marketingBudget / (currentCompany.productLines.reduce((sum, p) => sum + p.customerCount, 0) - prevCompany.productLines.reduce((sum, p) => sum + p.customerCount, 0) || 1);
    const customerRetentionRate = Math.min(100, currentCompany.customerSatisfaction + generateRandomNumber(50, 80)); // Simplified
    const innovationIndex = currentCompany.productLines.reduce((sum, p) => sum + p.innovationLevel, 0) / currentCompany.productLines.length;
    const employeeMorale = currentCompany.customerSatisfaction; // Proxy for now

    const keyInsights: string[] = [];
    const recommendations: string[] = [];

    if (marketShareGrowth > 5) keyInsights.push('Significant market share growth achieved, outperforming competitors.');
    else if (marketShareGrowth < -2) keyInsights.push('Market share declined, indicating strong competitor pressure or ineffective strategy.');

    if (profitMargin > 10) keyInsights.push('Healthy profit margins reflect efficient operations and strong pricing power.');
    else if (profitMargin < 2) keyInsights.push('Low profit margins suggest cost issues or intense price competition.');

    if (innovationIndex > 70) keyInsights.push('Strong innovation pipeline driving future growth potential.');
    else if (innovationIndex < 50) keyInsights.push('Innovation lagging, risking obsolescence in a dynamic market.');

    if (currentCompany.cash < 0) keyInsights.push('Critical: Company is out of cash and requires immediate financing.');
    if (currentCompany.cash < 1000000 && prevCompany.cash >= 1000000) recommendations.push('Consider securing additional funding or divesting non-core assets to improve liquidity.');

    // Recommendations based on insights
    if (marketShareGrowth < 0 && directive.overallFocus !== 'market_expansion') {
      recommendations.push('Re-evaluate strategic focus: Market expansion initiatives may be necessary to counter competitor gains.');
    }
    if (currentCompany.customerSatisfaction < 60 && directive.hrInitiatives !== 'training') {
      recommendations.push('Invest in customer service training and product quality to boost satisfaction and reduce churn.');
    }
    if (currentCompany.rdBudget < 100000 && directive.overallFocus === 'innovation') {
      recommendations.push('Increase R&D allocation to align with innovation focus and remain competitive.');
    }

    return {
      year: this.gameState.currentYear,
      companyState: JSON.parse(JSON.stringify(currentCompany)),
      competitorActions,
      marketNewsEvents,
      playerDecisionsSummary: directive,
      kpis: {
        marketShareGrowth,
        revenueGrowth,
        profitMargin,
        customerAcquisitionCost,
        customerRetentionRate,
        innovationIndex,
        employeeMorale,
      },
      keyInsights,
      recommendations,
    };
  }
}

// --- REACT COMPONENTS FOR UI ---

export const StrategyInputForm: React.FC<{
  currentStrategy: PlayerStrategicDirective | null;
  onStrategyChange: (strategy: PlayerStrategicDirective) => void;
  companyCash: number;
  productLines: ProductLine[];
  marketSegments: MarketSegment[];
  competitors: CompetitorProfile[];
}> = ({ currentStrategy, onStrategyChange, companyCash, productLines, marketSegments, competitors }) => {
  const [overallFocus, setOverallFocus] = useState<PlayerStrategicDirective['overallFocus']>(currentStrategy?.overallFocus || 'innovation');
  const [rdAllocation, setRdAllocation] = useState(currentStrategy?.resourceAllocation.rd || 25);
  const [marketingAllocation, setMarketingAllocation] = useState(currentStrategy?.resourceAllocation.marketing || 25);
  const [salesAllocation, setSalesAllocation] = useState(currentStrategy?.resourceAllocation.sales || 15);
  const [operationsAllocation, setOperationsAllocation] = useState(currentStrategy?.resourceAllocation.operations || 10);
  const [hrAllocation, setHrAllocation] = useState(currentStrategy?.resourceAllocation.hr || 10);
  const [customerServiceAllocation, setCustomerServiceAllocation] = useState(currentStrategy?.resourceAllocation.customerService || 10);
  const [capitalInvestmentAllocation, setCapitalInvestmentAllocation] = useState(currentStrategy?.resourceAllocation.capitalInvestment || 5);

  const [newProductDevelopments, setNewProductDevelopments] = useState<PlayerStrategicDirective['newProductDevelopment']>(currentStrategy?.newProductDevelopment || []);
  const [marketingCampaigns, setMarketingCampaigns] = useState<PlayerStrategicDirective['marketingCampaigns']>(currentStrategy?.marketingCampaigns || []);
  const [pricingAdjustments, setPricingAdjustments] = useState<PlayerStrategicDirective['pricingAdjustments']>(currentStrategy?.pricingAdjustments || []);
  const [hrInitiatives, setHrInitiatives] = useState<PlayerStrategicDirective['hrInitiatives']>(currentStrategy?.hrInitiatives || 'none');
  const [riskMitigation, setRiskMitigation] = useState<PlayerStrategicDirective['riskMitigation']>(currentStrategy?.riskMitigation || []);
  const [targetAcquisitions, setTargetAcquisitions] = useState<PlayerStrategicDirective['targetAcquisitions']>(currentStrategy?.targetAcquisitions || []);
  const [divestProductLines, setDivestProductLines] = useState<PlayerStrategicDirective['divestProductLines']>(currentStrategy?.divestProductLines || []);

  const totalAllocation = rdAllocation + marketingAllocation + salesAllocation + operationsAllocation + hrAllocation + customerServiceAllocation + capitalInvestmentAllocation;
  const isAllocationValid = totalAllocation === 100;

  useEffect(() => {
    // Initialize with default or current strategy if none provided
    if (!currentStrategy) {
      onStrategyChange({
        overallFocus,
        resourceAllocation: { rd: rdAllocation, marketing: marketingAllocation, sales: salesAllocation, operations: operationsAllocation, hr: hrAllocation, customerService: customerServiceAllocation, capitalInvestment: capitalInvestmentAllocation },
        newProductDevelopment: newProductDevelopments,
        marketingCampaigns: marketingCampaigns,
        pricingAdjustments: pricingAdjustments,
        hrInitiatives: hrInitiatives,
        riskMitigation: riskMitigation,
        targetAcquisitions: targetAcquisitions,
        divestProductLines: divestProductLines,
      });
    }
  }, [currentStrategy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const updatedStrategy: PlayerStrategicDirective = {
      overallFocus,
      resourceAllocation: {
        rd: rdAllocation,
        marketing: marketingAllocation,
        sales: salesAllocation,
        operations: operationsAllocation,
        hr: hrAllocation,
        customerService: customerServiceAllocation,
        capitalInvestment: capitalInvestmentAllocation,
      },
      newProductDevelopment: newProductDevelopments,
      marketingCampaigns: marketingCampaigns,
      pricingAdjustments: pricingAdjustments,
      hrInitiatives: hrInitiatives,
      riskMitigation: riskMitigation,
      targetAcquisitions: targetAcquisitions,
      divestProductLines: divestProductLines,
    };
    onStrategyChange(updatedStrategy);
  }, [overallFocus, rdAllocation, marketingAllocation, salesAllocation, operationsAllocation, hrAllocation, customerServiceAllocation, capitalInvestmentAllocation,
    newProductDevelopments, marketingCampaigns, pricingAdjustments, hrInitiatives, riskMitigation, targetAcquisitions, divestProductLines, onStrategyChange]);

  const addCampaign = () => setMarketingCampaigns([...marketingCampaigns, { name: '', targetSegmentIds: [], budget: 0, message: '' }]);
  const removeCampaign = (index: number) => setMarketingCampaigns(marketingCampaigns.filter((_, i) => i !== index));
  const updateCampaign = (index: number, field: string, value: any) => {
    const updated = [...marketingCampaigns];
    (updated[index] as any)[field] = value;
    setMarketingCampaigns(updated);
  };

  const addPricingAdjustment = () => setPricingAdjustments([...pricingAdjustments, { productId: '', newPrice: 0 }]);
  const removePricingAdjustment = (index: number) => setPricingAdjustments(pricingAdjustments.filter((_, i) => i !== index));
  const updatePricingAdjustment = (index: number, field: string, value: any) => {
    const updated = [...pricingAdjustments];
    (updated[index] as any)[field] = value;
    setPricingAdjustments(updated);
  };

  const addNewProductDevelopment = () => setNewProductDevelopments([...newProductDevelopments, { name: '', type: 'AI_Platform', targetMarketSegmentIds: [], featuresToDevelop: [] }]);
  const removeNewProductDevelopment = (index: number) => setNewProductDevelopments(newProductDevelopments.filter((_, i) => i !== index));
  const updateNewProductDevelopment = (index: number, field: string, value: any) => {
    const updated = [...newProductDevelopments];
    (updated[index] as any)[field] = value;
    setNewProductDevelopments(updated);
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-4 text-sm">
      <h2 className="text-xl font-bold mb-3 text-cyan-200">Strategic Directive</h2>

      <div className="mb-4">
        <label htmlFor="overallFocus" className="block text-gray-300">Overall Company Focus:</label>
        <select id="overallFocus" value={overallFocus} onChange={e => setOverallFocus(e.target.value as PlayerStrategicDirective['overallFocus'])} className="w-full p-2 bg-gray-600 rounded mt-1 text-white">
          <option value="innovation">Innovation & R&D Leadership</option>
          <option value="cost_reduction">Cost Reduction & Efficiency</option>
          <option value="market_expansion">Market Expansion & Growth</option>
          <option value="customer_retention">Customer Retention & Satisfaction</option>
          <option value="risk_management">Risk Management & Stability</option>
        </select>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-300 mb-2">Resource Allocation (% of Total Budget)</h3>
        <p className={`text-xs mb-2 ${isAllocationValid ? 'text-green-400' : 'text-red-400'}`}>
          Total Allocated: {totalAllocation}% {isAllocationValid ? ' (Valid)' : ` (Invalid, must be 100%, currently ${100-totalAllocation}% off)`}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[{ label: 'R&D', value: rdAllocation, setter: setRdAllocation },
            { label: 'Marketing', value: marketingAllocation, setter: setMarketingAllocation },
            { label: 'Sales', value: salesAllocation, setter: setSalesAllocation },
            { label: 'Operations', value: operationsAllocation, setter: setOperationsAllocation },
            { label: 'HR & Talent', value: hrAllocation, setter: setHrAllocation },
            { label: 'Customer Service', value: customerServiceAllocation, setter: setCustomerServiceAllocation },
            { label: 'Capital Investment', value: capitalInvestmentAllocation, setter: setCapitalInvestmentAllocation },
          ].map((item, i) => (
            <div key={i} className="flex items-center">
              <label className="w-2/3 text-gray-400">{item.label}:</label>
              <input type="number" min="0" max="100" value={item.value} onChange={e => item.setter(Number(e.target.value))} className="w-1/3 p-1 bg-gray-600 rounded text-white text-right" />
              <span className="ml-1 text-gray-400">%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-300 mb-2">New Product Development</h3>
        {newProductDevelopments.map((prod, index) => (
          <div key={index} className="border border-gray-600 p-2 rounded mb-2">
            <input type="text" placeholder="Product Name" value={prod.name} onChange={e => updateNewProductDevelopment(index, 'name', e.target.value)} className="w-full p-1 bg-gray-600 rounded mb-1" />
            <select value={prod.type} onChange={e => updateNewProductDevelopment(index, 'type', e.target.value)} className="w-full p-1 bg-gray-600 rounded mb-1">
              <option value="AI_Platform">AI Platform</option>
              <option value="FinTech_App">FinTech App</option>
              <option value="Data_Analytics">Data Analytics</option>
              <option value="Consulting_Service">Consulting Service</option>
            </select>
            <select multiple value={prod.targetMarketSegmentIds} onChange={e => updateNewProductDevelopment(index, 'targetMarketSegmentIds', Array.from(e.target.selectedOptions, option => option.value))} className="w-full p-1 bg-gray-600 rounded mb-1 h-16">
              {marketSegments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="text" placeholder="Features (comma-separated IDs, e.g., 'PredictiveAI,API_Access')" value={prod.featuresToDevelop.join(',')} onChange={e => updateNewProductDevelopment(index, 'featuresToDevelop', e.target.value.split(',').map(f => f.trim()))} className="w-full p-1 bg-gray-600 rounded mb-1" />
            <button onClick={() => removeNewProductDevelopment(index)} className="mt-1 px-2 py-1 bg-red-600 text-white rounded text-xs">Remove Product</button>
          </div>
        ))}
        <button onClick={addNewProductDevelopment} className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm">+ Add New Product</button>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-300 mb-2">Marketing Campaigns</h3>
        {marketingCampaigns.map((campaign, index) => (
          <div key={index} className="border border-gray-600 p-2 rounded mb-2">
            <input type="text" placeholder="Campaign Name" value={campaign.name} onChange={e => updateCampaign(index, 'name', e.target.value)} className="w-full p-1 bg-gray-600 rounded mb-1" />
            <select multiple value={campaign.targetSegmentIds} onChange={e => updateCampaign(index, 'targetSegmentIds', Array.from(e.target.selectedOptions, option => option.value))} className="w-full p-1 bg-gray-600 rounded mb-1 h-16">
              {marketSegments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="number" placeholder="Budget ($)" value={campaign.budget} onChange={e => updateCampaign(index, 'budget', Number(e.target.value))} className="w-full p-1 bg-gray-600 rounded mb-1" />
            <textarea placeholder="Message / Slogan" value={campaign.message} onChange={e => updateCampaign(index, 'message', e.target.value)} rows={2} className="w-full p-1 bg-gray-600 rounded mb-1"></textarea>
            <button onClick={() => removeCampaign(index)} className="mt-1 px-2 py-1 bg-red-600 text-white rounded text-xs">Remove Campaign</button>
          </div>
        ))}
        <button onClick={addCampaign} className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm">+ Add Marketing Campaign</button>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-300 mb-2">Pricing Adjustments</h3>
        {pricingAdjustments.map((adj, index) => (
          <div key={index} className="border border-gray-600 p-2 rounded mb-2 flex items-center">
            <select value={adj.productId} onChange={e => updatePricingAdjustment(index, 'productId', e.target.value)} className="w-2/3 p-1 bg-gray-600 rounded mr-2">
              <option value="">Select Product</option>
              {productLines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" placeholder="New Price" value={adj.newPrice} onChange={e => updatePricingAdjustment(index, 'newPrice', Number(e.target.value))} className="w-1/3 p-1 bg-gray-600 rounded" />
            <button onClick={() => removePricingAdjustment(index)} className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-xs">Remove</button>
          </div>
        ))}
        <button onClick={addPricingAdjustment} className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm">+ Add Pricing Adjustment</button>
      </div>

      <div className="mb-4">
        <label htmlFor="hrInitiatives" className="block text-gray-300">HR Initiatives:</label>
        <select id="hrInitiatives" value={hrInitiatives} onChange={e => setHrInitiatives(e.target.value as PlayerStrategicDirective['hrInitiatives'])} className="w-full p-2 bg-gray-600 rounded mt-1 text-white">
          <option value="none">None</option>
          <option value="training">Invest in Employee Training</option>
          <option value="hiring">Aggressive Hiring Campaign</option>
          <option value="downsizing">Downsize Workforce</option>
        </select>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-300 mb-2">Risk Mitigation Focus</h3>
        <select multiple value={riskMitigation} onChange={e => setRiskMitigation(Array.from(e.target.selectedOptions, option => option.value))} className="w-full p-1 bg-gray-600 rounded h-20">
          <option value="cybersecurity_investment">Cybersecurity Investment</option>
          <option value="regulatory_compliance">Regulatory Compliance Enhancement</option>
          <option value="supply_chain_diversification">Supply Chain Diversification</option>
          <option value="market_research">Market Research & Foresight</option>
        </select>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-300 mb-2">Target Acquisitions (Competitors)</h3>
        <select multiple value={targetAcquisitions} onChange={e => setTargetAcquisitions(Array.from(e.target.selectedOptions, option => option.value))} className="w-full p-1 bg-gray-600 rounded h-20">
          {competitors.map(c => <option key={c.id} value={c.id}>{c.name} ({c.marketShare.toFixed(1)}%)</option>)}
        </select>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-300 mb-2">Divest Product Lines</h3>
        <select multiple value={divestProductLines} onChange={e => setDivestProductLines(Array.from(e.target.selectedOptions, option => option.value))} className="w-full p-1 bg-gray-600 rounded h-20">
          {productLines.map(p => <option key={p.id} value={p.id}>{p.name} (Revenue: {formatCurrency(p.revenue)})</option>)}
        </select>
      </div>
    </div>
  );
};

export const KpiDashboard: React.FC<{ company: WargameCompanyState; report?: YearEndReport; previousCompany?: WargameCompanyState }> = ({ company, report, previousCompany }) => {
  const getChangeIndicator = useCallback((current: number, previous: number, higherIsBetter: boolean = true) => {
    if (!previous) return '📊';
    const growth = calculateGrowthRate(current, previous);
    if (growth === 0) return '↔️';
    if (higherIsBetter) return growth > 0 ? '🔼' : '🔽';
    return growth < 0 ? '🔼' : '🔽';
  }, []);

  const getSentimentColor = useCallback((value: number) => {
    if (value > 75) return 'text-green-400';
    if (value > 50) return 'text-yellow-400';
    return 'text-red-400';
  }, []);

  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-4 text-sm">
      <h2 className="text-xl font-bold mb-3 text-emerald-200">Company KPIs - Year {company.yearEstablished}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-3 rounded-md">
          <p className="text-gray-400">Market Share</p>
          <p className="text-2xl font-bold text-white">{company.marketShare.toFixed(1)}% {previousCompany && <span className="text-sm">{getChangeIndicator(company.marketShare, previousCompany.marketShare)}</span>}</p>
          {report?.kpis.marketShareGrowth !== undefined && <p className={`text-xs ${report.kpis.marketShareGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>{report.kpis.marketShareGrowth.toFixed(1)}% Growth</p>}
        </div>
        <div className="bg-gray-800 p-3 rounded-md">
          <p className="text-gray-400">Revenue</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(company.revenue)} {previousCompany && <span className="text-sm">{getChangeIndicator(company.revenue, previousCompany.revenue)}</span>}</p>
          {report?.kpis.revenueGrowth !== undefined && <p className={`text-xs ${report.kpis.revenueGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>{report.kpis.revenueGrowth.toFixed(1)}% Growth</p>}
        </div>
        <div className="bg-gray-800 p-3 rounded-md">
          <p className="text-gray-400">Net Profit</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(company.profit)} {previousCompany && <span className="text-sm">{getChangeIndicator(company.profit, previousCompany.profit)}</span>}</p>
          {report?.kpis.profitMargin !== undefined && <p className={`text-xs ${report.kpis.profitMargin > 0 ? 'text-green-400' : 'text-red-400'}`}>{report.kpis.profitMargin.toFixed(1)}% Margin</p>}
        </div>
        <div className="bg-gray-800 p-3 rounded-md">
          <p className="text-gray-400">Cash Reserves</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(company.cash)} {previousCompany && <span className="text-sm">{getChangeIndicator(company.cash, previousCompany.cash)}</span>}</p>
          <p className={`text-xs ${company.cash < 1000000 ? 'text-red-400' : 'text-green-400'}`}>Current Liquidity</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-md">
          <p className="text-gray-400">Brand Reputation</p>
          <p className="text-2xl font-bold text-white">{company.brandReputation.toFixed(0)}% <span className={`text-sm ${getSentimentColor(company.brandReputation)}`}>{getMarketSentimentEmoji(company.brandReputation)}</span></p>
          {previousCompany && <p className={`text-xs ${getChangeIndicator(company.brandReputation, previousCompany.brandReputation) === '🔼' ? 'text-green-400' : getChangeIndicator(company.brandReputation, previousCompany.brandReputation) === '🔽' ? 'text-red-400' : 'text-gray-400'}`}>
            {calculateGrowthRate(company.brandReputation, previousCompany.brandReputation).toFixed(1)}%
          </p>}
        </div>
        <div className="bg-gray-800 p-3 rounded-md">
          <p className="text-gray-400">Customer Satisfaction</p>
          <p className="text-2xl font-bold text-white">{company.customerSatisfaction.toFixed(0)}% <span className={`text-sm ${getSentimentColor(company.customerSatisfaction)}`}>{getMarketSentimentEmoji(company.customerSatisfaction)}</span></p>
          {previousCompany && <p className={`text-xs ${getChangeIndicator(company.customerSatisfaction, previousCompany.customerSatisfaction) === '🔼' ? 'text-green-400' : getChangeIndicator(company.customerSatisfaction, previousCompany.customerSatisfaction) === '🔽' ? 'text-red-400' : 'text-gray-400'}`}>
            {calculateGrowthRate(company.customerSatisfaction, previousCompany.customerSatisfaction).toFixed(1)}%
          </p>}
        </div>
        <div className="bg-gray-800 p-3 rounded-md">
          <p className="text-gray-400">Innovation Index</p>
          <p className="text-2xl font-bold text-white">{report?.kpis.innovationIndex.toFixed(0) || '-'}/100</p>
          {previousCompany && <p className={`text-xs ${getChangeIndicator(report?.kpis.innovationIndex || 0, previousCompany.productLines.reduce((sum, p) => sum + p.innovationLevel, 0) / previousCompany.productLines.length) === '🔼' ? 'text-green-400' : getChangeIndicator(report?.kpis.innovationIndex || 0, previousCompany.productLines.reduce((sum, p) => sum + p.innovationLevel, 0) / previousCompany.productLines.length) === '🔽' ? 'text-red-400' : 'text-gray-400'}`}>
            {calculateGrowthRate(report?.kpis.innovationIndex || 0, previousCompany.productLines.reduce((sum, p) => sum + p.innovationLevel, 0) / previousCompany.productLines.length).toFixed(1)}%
          </p>}
        </div>
        <div className="bg-gray-800 p-3 rounded-md">
          <p className="text-gray-400">Employee Count</p>
          <p className="text-2xl font-bold text-white">{company.employeeCount}</p>
          {previousCompany && <p className={`text-xs ${getChangeIndicator(company.employeeCount, previousCompany.employeeCount) === '🔼' ? 'text-green-400' : getChangeIndicator(company.employeeCount, previousCompany.employeeCount) === '🔽' ? 'text-red-400' : 'text-gray-400'}`}>
            {calculateGrowthRate(company.employeeCount, previousCompany.employeeCount).toFixed(1)}%
          </p>}
        </div>
      </div>
    </div>
  );
};

export const FinancialReportSection: React.FC<{ company: WargameCompanyState }> = ({ company }) => {
  const { incomeStatement, balanceSheet, cashFlowStatement } = company.financials;

  const RenderStatement = ({ title, data }: { title: string; data: { [key: string]: number } }) => (
    <div className="mb-6 bg-gray-800 p-3 rounded-md">
      <h3 className="text-lg font-semibold mb-2 text-blue-300">{title}</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center border-b border-gray-700 pb-1">
            <span className="text-gray-400">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
            <span className={`font-mono ${value < 0 ? 'text-red-400' : 'text-white'}`}>{formatCurrency(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-4 text-sm">
      <h2 className="text-xl font-bold mb-3 text-blue-200">Financial Reports - Year {company.yearEstablished}</h2>
      <RenderStatement title="Income Statement" data={incomeStatement} />
      <RenderStatement title="Balance Sheet" data={balanceSheet} />
      <RenderStatement title="Cash Flow Statement" data={cashFlowStatement} />
    </div>
  );
};

export const ProductPortfolioSection: React.FC<{ company: WargameCompanyState }> = ({ company }) => {
  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-4 text-sm">
      <h2 className="text-xl font-bold mb-3 text-purple-200">Product Portfolio - Year {company.yearEstablished}</h2>
      {company.productLines.length === 0 && <p className="text-gray-400">No products currently in your portfolio.</p>}
      {company.productLines.map(product => (
        <div key={product.id} className="bg-gray-800 p-3 rounded-md mb-3 border border-gray-600">
          <h3 className="text-lg font-semibold text-purple-300 mb-1">{product.name} ({product.type})</h3>
          <p className="text-gray-400">Lifecycle Stage: <span className="font-medium text-white capitalize">{product.lifecycleStage}</span></p>
          <div className="grid grid-cols-2 gap-y-1 mt-2">
            <p>Customers: <span className="text-white">{product.customerCount.toLocaleString()}</span></p>
            <p>Market Share (Product): <span className="text-white">{(product.marketShare * 100).toFixed(2)}%</span></p>
            <p>Revenue: <span className="text-white">{formatCurrency(product.revenue)}</span></p>
            <p>Profit: <span className="text-white">{formatCurrency(product.profit)}</span></p>
            <p>Base Price: <span className="text-white">{formatCurrency(product.basePrice)}</span></p>
            <p>Base Cost: <span className="text-white">{formatCurrency(product.baseCost)}</span></p>
            <p>Innovation Level: <span className="text-white">{product.innovationLevel.toFixed(0)}/100</span></p>
            <p>Quality Score: <span className="text-white">{product.qualityScore.toFixed(0)}/100</span></p>
          </div>
          <div className="mt-3">
            <h4 className="font-semibold text-gray-300">Features:</h4>
            <ul className="list-disc list-inside text-gray-400">
              {product.features.map(feature => (
                <li key={feature.id} className="text-sm">
                  {feature.name} ({feature.status === 'launched' ? `Launched in ${feature.launchYear}` : `${feature.developmentTimeYears} years left`})
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${feature.status === 'launched' ? 'bg-green-700' : feature.status === 'developing' ? 'bg-yellow-700' : 'bg-gray-700'}`}>
                    {feature.status.toUpperCase()}
                  </span>
                </li>
              ))}
              {product.features.length === 0 && <li className="text-xs italic">No specific features defined.</li>}
            </ul>
          </div>
          <div className="mt-3">
            <h4 className="font-semibold text-gray-300">Target Markets:</h4>
            <ul className="list-disc list-inside text-gray-400 text-sm">
              {product.targetMarketSegmentIds.map(segmentId => {
                const segment = company.marketSegments.find(s => s.id === segmentId);
                return <li key={segmentId}>{segment ? segment.name : 'Unknown Segment'}</li>;
              })}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export const MarketAnalysisSection: React.FC<{ marketSegments: MarketSegment[]; globalMarketSentiment: number; playerCompany: WargameCompanyState; competitors: CompetitorProfile[] }> = ({ marketSegments, globalMarketSentiment, playerCompany, competitors }) => {
  const getOverallPenetration = (segment: MarketSegment): number => {
    let total = segment.currentPlayerPenetration;
    for (const compId in segment.competitorPenetration) {
      total += segment.competitorPenetration[compId];
    }
    return total;
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-4 text-sm">
      <h2 className="text-xl font-bold mb-3 text-orange-200">Market Analysis - Year {playerCompany.yearEstablished}</h2>
      <div className="mb-4">
        <p className="text-gray-300">Global Market Sentiment: <span className="font-bold text-white">{globalMarketSentiment}% {getMarketSentimentEmoji(globalMarketSentiment)}</span></p>
        <p className="text-gray-400 text-xs">A high sentiment indicates favorable market conditions; low indicates caution.</p>
      </div>

      <h3 className="text-lg font-semibold text-orange-300 mb-2">Market Segments</h3>
      {marketSegments.map(segment => (
        <div key={segment.id} className="bg-gray-800 p-3 rounded-md mb-3 border border-gray-600">
          <h4 className="font-semibold text-white mb-1">{segment.name}</h4>
          <div className="grid grid-cols-2 gap-y-1 text-gray-400">
            <p>Total Size: <span className="text-white">{segment.totalSize.toLocaleString()}</span></p>
            <p>Growth Rate: <span className="text-white">{(segment.growthRate[0] * 100).toFixed(1)}% - {(segment.growthRate[1] * 100).toFixed(1)}%</span></p>
            <p>Player Penetration: <span className="text-white">{(segment.currentPlayerPenetration * 100).toFixed(2)}%</span></p>
            <p>Overall Penetration: <span className="text-white">{(getOverallPenetration(segment) * 100).toFixed(2)}%</span></p>
            <p>Price Sensitivity: <span className="text-white">{(segment.sensitivityToPrice * 100).toFixed(0)}%</span></p>
            <p>Innovation Sensitivity: <span className="text-white">{(segment.sensitivityToInnovation * 100).toFixed(0)}%</span></p>
            <p>Customer Loyalty: <span className="text-white">{segment.customerLoyalty.toFixed(0)}%</span></p>
          </div>
          <div className="mt-2">
            <h5 className="font-semibold text-gray-300">Competitor Penetration:</h5>
            <ul className="list-disc list-inside text-gray-400 text-sm">
              {Object.entries(segment.competitorPenetration).map(([compId, penetration]) => {
                const competitor = competitors.find(c => c.id === compId);
                return (
                  <li key={compId}>{competitor?.name || compId}: <span className="text-white">{(penetration * 100).toFixed(2)}%</span></li>
                );
              })}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export const CompetitorIntelSection: React.FC<{ competitors: CompetitorProfile[]; playerCompany: WargameCompanyState }> = ({ competitors, playerCompany }) => {
  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-4 text-sm">
      <h2 className="text-xl font-bold mb-3 text-red-200">Competitor Intelligence - Year {playerCompany.yearEstablished}</h2>
      {competitors.map(comp => (
        <div key={comp.id} className="bg-gray-800 p-3 rounded-md mb-3 border border-gray-600">
          <h3 className="text-lg font-semibold text-red-300 mb-1">{comp.name}</h3>
          <p className="text-gray-400">{comp.description}</p>
          <div className="grid grid-cols-2 gap-y-1 mt-2 text-gray-400">
            <p>Market Share: <span className="text-white">{comp.marketShare.toFixed(1)}%</span></p>
            <p>Strategic Focus: <span className="text-white capitalize">{comp.strategy.replace('_', ' ')}</span></p>
            <p>Financial Strength: <span className="text-white">{comp.financialStrength.toFixed(0)}/100</span></p>
            <p>Innovation Focus: <span className="text-white">{comp.innovationFocus.toFixed(0)}/100</span></p>
            <p>Marketing Aggression: <span className="text-white">{comp.marketingAggression.toFixed(0)}/100</span></p>
          </div>
          <div className="mt-3">
            <h4 className="font-semibold text-gray-300">Product Offerings:</h4>
            <ul className="list-disc list-inside text-gray-400 text-sm">
              {comp.productOfferings.map(prod => (
                <li key={prod.id}>{prod.name} ({prod.type.replace('_', ' ')})</li>
              ))}
            </ul>
          </div>
          <div className="mt-3">
            <h4 className="font-semibold text-gray-300">Recent Actions:</h4>
            <ul className="list-disc list-inside text-gray-400 text-sm">
              {comp.recentActions.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
              {comp.recentActions.length === 0 && <li className="italic">No significant actions reported this year.</li>}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SimulationLogDetailedView: React.FC<{ historicalReports: YearEndReport[]; currentYear: number; isLoading: boolean }> = ({ historicalReports, currentYear, isLoading }) => {
  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-4 text-sm">
      <h2 className="text-xl font-bold mb-3 text-teal-200">Simulation Log & Historical Reports</h2>
      <div className="h-96 overflow-y-auto bg-gray-900 p-3 rounded-md">
        {historicalReports.length === 0 && <p className="text-gray-500">The simulation log will appear here after each year.</p>}
        {historicalReports.slice().reverse().map(report => ( // Show most recent first
          <div key={report.year} className="mb-4 pb-4 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-teal-300">Year: {report.year} (Report for {report.companyState.name})</h3>
            <p className="text-gray-300"><strong>Market Share:</strong> {report.companyState.marketShare.toFixed(1)}% ({report.kpis.marketShareGrowth.toFixed(1)}% change)</p>
            <p className="text-gray-300"><strong>Net Profit:</strong> {formatCurrency(report.companyState.profit)} ({report.kpis.profitMargin.toFixed(1)}% margin)</p>

            <div className="mt-2">
              <h4 className="font-semibold text-gray-400">Player Decisions Summary:</h4>
              <p className="text-gray-500 text-sm">Overall Focus: <span className="capitalize">{report.playerDecisionsSummary.overallFocus.replace('_', ' ')}</span></p>
              <p className="text-gray-500 text-sm">R&D Allocation: {report.playerDecisionsSummary.resourceAllocation.rd}%</p>
              <p className="text-gray-500 text-sm">Marketing Allocation: {report.playerDecisionsSummary.resourceAllocation.marketing}%</p>
              {/* Add more detailed decision summaries here */}
            </div>

            <div className="mt-2">
              <h4 className="font-semibold text-gray-400">Competitor Actions:</h4>
              <ul className="list-disc list-inside text-sm text-gray-500">
                {report.competitorActions.map((a, i) => <li key={i}>{a}</li>)}
                {report.competitorActions.length === 0 && <li className="italic">No major competitor actions reported.</li>}
              </ul>
            </div>
            <div className="mt-2">
              <h4 className="font-semibold text-gray-400">Market News & Events:</h4>
              <ul className="list-disc list-inside text-sm text-gray-500">
                {report.marketNewsEvents.map((e, i) => <li key={i}>{e}</li>)}
                {report.marketNewsEvents.length === 0 && <li className="italic">No significant market events this year.</li>}
              </ul>
            </div>
            <div className="mt-2">
              <h4 className="font-semibold text-gray-400">Key Insights:</h4>
              <ul className="list-disc list-inside text-sm text-yellow-300">
                {report.keyInsights.map((insight, i) => <li key={i}>{insight}</li>)}
                {report.keyInsights.length === 0 && <li className="italic text-gray-500">No specific insights generated.</li>}
              </ul>
            </div>
            <div className="mt-2">
              <h4 className="font-semibold text-gray-400">Recommendations:</h4>
              <ul className="list-disc list-inside text-sm text-blue-300">
                {report.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                {report.recommendations.length === 0 && <li className="italic text-gray-500">No specific recommendations at this time.</li>}
              </ul>
            </div>
          </div>
        ))}
        {isLoading && <p className="text-cyan-400">Simulating market response for Year {currentYear + 1}...</p>}
      </div>
    </div>
  );
};

export const ScenarioPlanningTool: React.FC = () => {
  const [scenarioName, setScenarioName] = useState('');
  const [impactDescription, setImpactDescription] = useState('');
  const [probability, setProbability] = useState(50);
  const [mitigationSteps, setMitigationSteps] = useState('');
  const [scenarios, setScenarios] = useState<{ name: string; impact: string; probability: number; mitigation: string; }[]>([]);

  const addScenario = () => {
    if (scenarioName && impactDescription) {
      setScenarios([...scenarios, { name: scenarioName, impact: impactDescription, probability, mitigation: mitigationSteps }]);
      setScenarioName('');
      setImpactDescription('');
      setProbability(50);
      setMitigationSteps('');
    }
  };

  const removeScenario = (index: number) => {
    setScenarios(scenarios.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-4 text-sm">
      <h2 className="text-xl font-bold mb-3 text-pink-200">Scenario Planning & Risk Management</h2>

      <div className="mb-4 p-3 bg-gray-800 rounded-md">
        <h3 className="font-semibold text-pink-300 mb-2">Create New Scenario/Risk</h3>
        <label className="block text-gray-300 mb-1">Scenario/Risk Name:</label>
        <input type="text" value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="e.g., Global Recession, New Competitor Entry" className="w-full p-2 bg-gray-600 rounded mb-2" />

        <label className="block text-gray-300 mb-1">Potential Impact:</label>
        <textarea value={impactDescription} onChange={e => setImpactDescription(e.target.value)} placeholder="Describe potential effects on market, financials, etc." rows={3} className="w-full p-2 bg-gray-600 rounded mb-2" />

        <label className="block text-gray-300 mb-1">Probability (%):</label>
        <input type="range" min="0" max="100" value={probability} onChange={e => setProbability(Number(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg accent-pink-500" />
        <span className="block text-right text-gray-400 mb-2">{probability}%</span>

        <label className="block text-gray-300 mb-1">Proposed Mitigation Steps:</label>
        <textarea value={mitigationSteps} onChange={e => setMitigationSteps(e.target.value)} placeholder="Actions to take if this scenario occurs." rows={3} className="w-full p-2 bg-gray-600 rounded mb-2" />

        <button onClick={addScenario} className="w-full p-2 bg-pink-600 text-white rounded disabled:opacity-50">Add Scenario/Risk</button>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-pink-300 mb-2">Defined Scenarios/Risks</h3>
        {scenarios.length === 0 && <p className="text-gray-400">No scenarios defined yet.</p>}
        {scenarios.map((scenario, index) => (
          <div key={index} className="bg-gray-800 p-3 rounded-md mb-2 border border-gray-600">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-semibold text-white">{scenario.name}</h4>
              <button onClick={() => removeScenario(index)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Remove</button>
            </div>
            <p className="text-gray-400 text-sm"><strong>Impact:</strong> {scenario.impact}</p>
            <p className="text-gray-400 text-sm"><strong>Probability:</strong> {scenario.probability}%</p>
            <p className="text-gray-400 text-sm"><strong>Mitigation:</strong> {scenario.mitigation || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AboutGameSection: React.FC = () => (
  <div className="bg-gray-700 p-4 rounded-lg text-sm text-gray-300">
    <h2 className="text-xl font-bold mb-3 text-cyan-200">About the Emergent Strategy Wargamer</h2>
    <p className="mb-2">
      This simulation is designed to help you explore business strategies in a dynamic, competitive market.
      You play as <span className="font-bold text-white">Nexus Innovations</span>, a growing FinTech/AI company.
    </p>
    <p className="mb-2">
      Each year, you define your strategic directive, allocating resources, launching products,
      and reacting to market conditions. The simulation engine processes your decisions,
      simulates competitor responses, market growth, and global events, then provides a
      detailed year-end report.
    </p>
    <p className="mb-2">
      The core idea is to observe how different strategic choices emerge and adapt over time,
      rather than following a fixed, long-term plan. Agility and responsiveness are key.
    </p>
    <p className="mb-2">
      <span className="font-semibold text-white">Key Metrics:</span> Market Share, Revenue, Profit,
      Brand Reputation, Customer Satisfaction, Innovation Index.
    </p>
    <p className="mb-2">
      <span className="font-semibold text-white">Your Goal:</span> Lead Nexus Innovations to become the dominant player in the FinTech/AI space,
      balancing growth, profitability, and innovation.
    </p>
    <p className="text-xs text-gray-500">
      *This is a highly simplified model for demonstration purposes. Real-world business strategy involves far greater complexity.*
    </p>
  </div>
);

// --- MAIN VIEW COMPONENT ---

const EmergentStrategyWargamerView: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState);
  const [currentStrategy, setCurrentStrategy] = useState<PlayerStrategicDirective | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'strategy' | 'kpis' | 'financials' | 'products' | 'market' | 'competitors' | 'log' | 'scenario' | 'about'>('strategy');

  // Memoize the simulation engine instance
  const simulationEngine = useMemo(() => new SimulationEngine(getInitialGameState()), []);

  useEffect(() => {
    // When game state initializes, also initialize current strategy with defaults
    if (!currentStrategy && gameState) {
      setCurrentStrategy({
        overallFocus: gameState.playerCompany.strategicFocus,
        resourceAllocation: { rd: 20, marketing: 20, sales: 15, operations: 15, hr: 10, customerService: 10, capitalInvestment: 10 },
        newProductDevelopment: [],
        marketingCampaigns: [],
        pricingAdjustments: [],
        hrInitiatives: 'none',
        riskMitigation: [],
        targetAcquisitions: [],
        divestProductLines: [],
      });
    }
  }, [gameState, currentStrategy]);

  const handleAdvanceYear = async () => {
    if (!currentStrategy) {
      alert('Please define your strategic directive before advancing the year.');
      return;
    }

    setIsLoading(true);
    try {
      simulationEngine.setPlayerDirective(currentStrategy);
      const newReport = await simulationEngine.advanceYear();

      setGameState(prev => {
        const updatedPlayerCompany = newReport.companyState;
        const updatedCompetitors = simulationEngine['gameState'].competitors; // Access updated competitors directly from engine
        const updatedMarketSegments = simulationEngine['gameState'].marketSegments; // Access updated market segments directly from engine

        return {
          ...prev,
          currentYear: newReport.year,
          playerCompany: updatedPlayerCompany,
          competitors: updatedCompetitors,
          marketSegments: updatedMarketSegments,
          historicalReports: [...prev.historicalReports, newReport],
          globalMarketSentiment: simulationEngine['gameState'].globalMarketSentiment,
        };
      });

      // Reset strategy for next year, potentially pre-filling with last year's if desired
      setCurrentStrategy({
        overallFocus: currentStrategy.overallFocus, // Keep previous focus by default
        resourceAllocation: { // Keep previous allocation by default, user can change
          rd: currentStrategy.resourceAllocation.rd,
          marketing: currentStrategy.resourceAllocation.marketing,
          sales: currentStrategy.resourceAllocation.sales,
          operations: currentStrategy.resourceAllocation.operations,
          hr: currentStrategy.resourceAllocation.hr,
          customerService: currentStrategy.resourceAllocation.customerService,
          capitalInvestment: currentStrategy.resourceAllocation.capitalInvestment,
        },
        newProductDevelopment: [], // New products need to be planned each year
        marketingCampaigns: [],
        pricingAdjustments: [],
        hrInitiatives: 'none',
        riskMitigation: [],
        targetAcquisitions: [],
        divestProductLines: [],
      });

    } catch (error) {
      console.error('Error simulating year:', error);
      alert('An error occurred during simulation. Check console for details.');
    } finally {
      setIsLoading(false);
      setActiveTab('log'); // Automatically switch to log to show results
    }
  };

  const currentYearReport = gameState.historicalReports[gameState.historicalReports.length - 1];
  const previousYearCompanyState = gameState.historicalReports.length > 1
    ? gameState.historicalReports[gameState.historicalReports.length - 2].companyState
    : undefined;

  const tabClasses = (tabName: string) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tabName ? 'bg-gray-700 text-cyan-400' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`;

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl max-w-7xl mx-auto my-8">
      <h1 className="text-3xl font-extrabold mb-4 text-center text-cyan-300">Emergent Strategy Wargamer: Nexus Innovations</h1>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <button onClick={handleAdvanceYear} disabled={isLoading || !currentStrategy || !currentStrategy.resourceAllocation || currentStrategy.resourceAllocation.rd + currentStrategy.resourceAllocation.marketing + currentStrategy.resourceAllocation.sales + currentStrategy.resourceAllocation.operations + currentStrategy.resourceAllocation.hr + currentStrategy.resourceAllocation.customerService + currentStrategy.resourceAllocation.capitalInvestment !== 100}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out">
          {isLoading ? 'Simulating...' : `Execute Strategy & Advance to Year ${gameState.currentYear + 1}`}
        </button>
        {(!currentStrategy || !currentStrategy.resourceAllocation || currentStrategy.resourceAllocation.rd + currentStrategy.resourceAllocation.marketing + currentStrategy.resourceAllocation.sales + currentStrategy.resourceAllocation.operations + currentStrategy.resourceAllocation.hr + currentStrategy.resourceAllocation.customerService + currentStrategy.resourceAllocation.capitalInvestment !== 100) && (
          <p className="text-red-400 text-sm mt-2">Resource allocation must sum to 100%.</p>
        )}
      </div>

      <div className="border-b border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-2" aria-label="Tabs">
          <button onClick={() => setActiveTab('strategy')} className={tabClasses('strategy')}>Strategy Input</button>
          <button onClick={() => setActiveTab('kpis')} className={tabClasses('kpis')}>KPI Dashboard</button>
          <button onClick={() => setActiveTab('financials')} className={tabClasses('financials')}>Financials</button>
          <button onClick={() => setActiveTab('products')} className={tabClasses('products')}>Products</button>
          <button onClick={() => setActiveTab('market')} className={tabClasses('market')}>Market Analysis</button>
          <button onClick={() => setActiveTab('competitors')} className={tabClasses('competitors')}>Competitor Intel</button>
          <button onClick={() => setActiveTab('log')} className={tabClasses('log')}>Simulation Log</button>
          <button onClick={() => setActiveTab('scenario')} className={tabClasses('scenario')}>Scenario Planning</button>
          <button onClick={() => setActiveTab('about')} className={tabClasses('about')}>About</button>
        </nav>
      </div>

      <div className="content-area">
        {activeTab === 'strategy' && (
          <StrategyInputForm
            currentStrategy={currentStrategy}
            onStrategyChange={setCurrentStrategy}
            companyCash={gameState.playerCompany.cash}
            productLines={gameState.playerCompany.productLines}
            marketSegments={gameState.marketSegments}
            competitors={gameState.competitors}
          />
        )}
        {activeTab === 'kpis' && (
          <KpiDashboard
            company={gameState.playerCompany}
            report={currentYearReport}
            previousCompany={previousYearCompanyState}
          />
        )}
        {activeTab === 'financials' && (
          <FinancialReportSection company={gameState.playerCompany} />
        )}
        {activeTab === 'products' && (
          <ProductPortfolioSection company={gameState.playerCompany} />
        )}
        {activeTab === 'market' && (
          <MarketAnalysisSection
            marketSegments={gameState.marketSegments}
            globalMarketSentiment={gameState.globalMarketSentiment}
            playerCompany={gameState.playerCompany}
            competitors={gameState.competitors}
          />
        )}
        {activeTab === 'competitors' && (
          <CompetitorIntelSection
            competitors={gameState.competitors}
            playerCompany={gameState.playerCompany}
          />
        )}
        {activeTab === 'log' && (
          <SimulationLogDetailedView
            historicalReports={gameState.historicalReports}
            currentYear={gameState.currentYear}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'scenario' && <ScenarioPlanningTool />}
        {activeTab === 'about' && <AboutGameSection />}
      </div>
    </div>
  );
};

export default EmergentStrategyWargamerView;