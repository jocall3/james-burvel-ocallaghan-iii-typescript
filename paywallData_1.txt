// data/platform/paywallData.ts
import { View } from '../../types';
import { FeatureDetails } from '../../types';

export const PAYWALL_DATA: Partial<Record<View, FeatureDetails>> = {
  // --- Personal Finance ---
  [View.Budgets]: { appName: "Allocatra™", price: 5, valuationLogic: "Helps households save 5–10% income", implementationEssentials: "Adaptive budgets, elastic envelopes, predictive alerts", scalability: "Families x3" },
  [View.Investments]: { appName: "CapitalVista™", price: 6, valuationLogic: "Improves investment decision quality", implementationEssentials: "Portfolio graphs, scenario tools, insights", scalability: "Investor networks x10" },
  [View.PortfolioExplorer]: { appName: "Portfolio Explorer™", price: 8, valuationLogic: "Provides institutional-grade portfolio analysis tools", implementationEssentials: "Treemap visualization, advanced filtering, multi-asset class support", scalability: "Family offices x5" },
  [View.FinancialGoals]: { appName: "Horizon Engine™", price: 7, valuationLogic: "Turns life goals → financial plans", implementationEssentials: "Goal-to-plan AI, milestone alerts, probability scoring", scalability: "Wealth mgmt x20" },
  [View.SendMoney]: { appName: "Remitrax™", price: 7, valuationLogic: "Cuts FX fees, instant remittance", implementationEssentials: "Cross-border rails, KYC/AML, AI routing", scalability: "Global migrant huge" },
  [View.RewardsHub]: { appName: "Incentivus™", price: 6, valuationLogic: "Rewards lift retention 20%", implementationEssentials: "Reward optimization AI, loyalty tracking, gamification", scalability: "Consumer SaaS massive" },

  // --- AI & Platform ---
  [View.AIAdvisor]: { appName: "Oraculum AI™", price: 20, valuationLogic: "Human advisors = $200–400/hr", implementationEssentials: "Financial planning AI, compliance guardrails, tax/treaty reasoning", scalability: "Wealth firms x500" },
  [View.QuantumWeaver]: { appName: "Loomis Quantum™", price: 25, valuationLogic: "Infra orchestration of APIs", implementationEssentials: "Multi-API orchestration, AI auto-wiring, resilience layer", scalability: "Infra exponential" },
  [View.QuantumOracle]: { appName: "The Oracle™", price: 30, valuationLogic: "Simulates financial futures to de-risk major life decisions, potentially saving thousands in mistakes.", implementationEssentials: "Full-state financial modeling, generative scenario analysis, recommendation engine.", scalability: "High-net-worth individuals, financial planners" },
  [View.AIAdStudio]: { appName: "AdAstra Studio™", price: 5, valuationLogic: "Cuts $500 wasted ad spend per campaign", implementationEssentials: "Gemini creative pipeline, ad API connectors, ROI forecaster", scalability: "Agencies x100" },
  [View.TheWinningVision]: { appName: "Futurum™", price: 10, valuationLogic: "Future-state simulation = strategy gold", implementationEssentials: "Scenario AI, trend forecast, narrative builder", scalability: "Exec adoption high" },
  
  // --- Advanced Personal ---
  [View.Crypto]: { appName: "Web3 Citadel™", price: 10, valuationLogic: "Securely bridges TradFi and DeFi, enabling new asset classes.", implementationEssentials: "WalletConnect integration, on-chain analytics, fiat on/off ramps.", scalability: "Crypto native users & institutions." },
  [View.Marketplace]: { appName: "Agora AI™", price: 12, valuationLogic: "Curated fintech upsell hub", implementationEssentials: "Vendor ranking AI, API contracts, one-click onboarding", scalability: "Network exponential" },
  [View.Personalization]: { appName: "PersonaMorph™", price: 5, valuationLogic: "Adaptive UX lifts engagement 30%", implementationEssentials: "User clustering AI, UX transformers, nudges", scalability: "Consumer scale huge" },
  [View.CardCustomization]: { appName: "PlastIQ™", price: 10, valuationLogic: "BIN sponsor replacements charge $50–100", implementationEssentials: "Card APIs, spend controls, dynamic CVV", scalability: "SMB x100" },

  // --- Corporate Finance ---
  [View.CorporateDashboard]: { appName: "Imperium Ops™", price: 25, valuationLogic: "Lawyers bill $500/hr for governance", implementationEssentials: "Resolution generator, compliance calendar, e-sign workflow", scalability: "Enterprise exponential" },
  [View.PaymentOrders]: { appName: "The Exchequer™", price: 20, valuationLogic: "Automates AP/AR workflows, saving significant man-hours.", implementationEssentials: "Multi-level approval engine, integration with accounting systems.", scalability: "Any business with payables." },
  [View.Counterparties]: { appName: "The Roster™", price: 15, valuationLogic: "Automates vendor verification and risk management.", implementationEssentials: "KYB checks, AML screening integration.", scalability: "Any business with vendors." },
  [View.Invoices]: { appName: "The Ledger™", price: 15, valuationLogic: "AI-powered invoice parsing and automated reconciliation.", implementationEssentials: "OCR technology, integration with ERPs.", scalability: "High-volume businesses." },
  [View.Compliance]: { appName: "The Magistrate™", price: 50, valuationLogic: "Automates compliance monitoring, reducing audit costs and legal risk.", implementationEssentials: "Rule engine, automated evidence collection.", scalability: "Regulated industries." },
  [View.AnomalyDetection]: { appName: "The Inquisitor™", price: 40, valuationLogic: "Prevents fraud and internal misuse before it scales.", implementationEssentials: "Behavioral analytics AI, real-time alerting.", scalability: "Any business with expenses." },
  [View.Payroll]: { appName: "The Stipend™", price: 20, valuationLogic: "Simplifies payroll runs and ensures compliance.", implementationEssentials: "Tax calculation engine, direct deposit integration.", scalability: "Any business with employees." },

  // --- Constitutional & System ---
  ...Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`article-${i + 1}`, {
    appName: "The Constitution™", price: 99, valuationLogic: "Access to the foundational legal and philosophical code of the platform.", implementationEssentials: "Full-text search, AI clause explainer.", scalability: "Legal scholars, investors, super-users."
  }])),

  // --- Demo Bank Platform & Mega Dashboard (All now paywalled) ---
  ...Object.values(View)
    .filter(v => v.startsWith('db-') || v.startsWith('md-') || v.startsWith('bp-'))
    .reduce((acc, v) => {
      acc[v] = {
        appName: `${v.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Suite`,
        price: Math.floor(Math.random() * 41) + 10, // Random price between 10-50
        valuationLogic: "Provides mission-critical operational capabilities for enterprise.",
        implementationEssentials: "AI-driven analytics, automation engine, secure data handling.",
        scalability: "Scales to enterprise needs."
      };
      return acc;
    }, {} as Partial<Record<View, FeatureDetails>>)
};