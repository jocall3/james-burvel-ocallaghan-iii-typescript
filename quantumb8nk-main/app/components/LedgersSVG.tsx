// Copyright James Burvel Oâ€™Callaghan III
// President CDBI AI Financial Solutions Inc.

import React, { useState, useEffect, useMemo, useCallback } from "react";

// --- Core Ledger SVG Component (Original, slightly modified for branding) ---
/**
 * `LedgersSVG` renders a stylized SVG icon representing financial ledgers or accounts.
 * This component serves as a visual identifier for the CDBI AI Financial Ledger Dashboard.
 * It remains self-contained with no external dependencies beyond React for its rendering.
 */
export function LedgersSVG({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="100%"
      height="auto"
      viewBox="0 0 414 207"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="207" width="207" height="207" fill="#A5B99C" /> {/* Right side background */}
      <g>
        {/* Modern Treasury inspired icon - now representing CDBI AI Financial Services */}
        <path
          d="M250.999 93.4401H330.999C331.795 93.4401 332.439 92.7961 332.439 92.0001V52.0001C332.439 51.2041 331.795 50.5601 330.999 50.5601H250.999C250.203 50.5601 249.559 51.2041 249.559 52.0001V92.0001C249.559 92.7961 250.203 93.4401 250.999 93.4401ZM252.439 81.5841C257.103 82.2281 260.771 85.8961 261.415 90.5601H252.439V81.5841ZM252.439 78.7081V65.2921C258.687 64.6161 263.615 59.6881 264.291 53.4401H317.703C318.379 59.6881 323.311 64.6161 329.559 65.2961V78.7081C323.311 79.3881 318.383 84.3161 317.703 90.5641H264.291C263.615 84.3121 258.687 79.3841 252.439 78.7081ZM320.587 90.5601C321.231 85.9001 324.895 82.2321 329.559 81.5841V90.5601H320.587ZM329.559 62.4161C324.895 61.7721 321.231 58.1041 320.587 53.4401H329.559V62.4161ZM261.415 53.4401C260.771 58.1001 257.099 61.7721 252.439 62.4161V53.4401H261.415ZM290.999 85.4401C298.411 85.4401 304.439 79.4121 304.439 72.0001C304.439 64.5881 298.411 58.5601 290.999 58.5601C283.587 58.5601 277.559 64.5881 277.559 72.0001C277.559 79.4121 283.587 85.4401 290.999 85.4401ZM290.999 61.4401C296.823 61.4401 301.559 66.1801 301.559 72.0001C301.559 77.8201 296.819 82.5601 290.999 82.5601C285.179 82.5601 280.439 77.8241 280.439 72.0001C280.439 66.1761 285.175 61.4401 290.999 61.4401ZM370.999 114.56H290.999C290.203 114.56 289.559 115.204 289.559 116V156C289.559 156.796 290.203 157.44 290.999 157.44H370.999C371.795 157.44 372.439 156.796 372.439 156V116C372.439 115.204 371.795 114.56 370.999 114.56ZM369.559 126.412C364.899 125.768 361.231 122.104 360.587 117.44H369.559V126.412ZM369.559 129.296V142.704C363.315 143.384 358.383 148.312 357.703 154.56H304.291C303.611 148.312 298.683 143.384 292.435 142.704V129.296C298.683 128.62 303.611 123.688 304.291 117.44H357.703C358.383 123.688 363.311 128.616 369.559 129.296ZM301.415 117.44C300.771 122.104 297.103 125.768 292.439 126.412V117.44H301.415ZM292.439 145.588C297.099 146.232 300.767 149.896 301.415 154.56H292.439V145.588ZM360.587 154.56C361.231 149.9 364.895 146.232 369.559 145.588V154.56H360.587ZM330.999 122.56C323.587 122.56 317.559 128.592 317.559 136C317.559 143.408 323.591 149.44 330.999 149.44C338.407 149.44 344.439 143.408 344.439 136C344.439 128.592 338.411 122.56 330.999 122.56ZM330.999 146.56C325.175 146.56 320.439 141.824 320.439 136C320.439 130.176 325.175 125.44 330.999 125.44C336.823 125.44 341.559 130.176 341.559 136C341.559 141.824 336.823 146.56 330.999 146.56ZM254.479 134.56H278.999V137.444H254.479L264.019 146.984L261.983 149.024L248.963 136L261.983 122.98L264.019 125.02L254.479 134.56ZM367.523 73.4401H342.999V70.5601H367.523L357.979 61.0161L360.019 58.9801L373.035 72.0001L360.019 85.0161L357.979 82.9801L367.523 73.4401Z"
          fill="black"
        />
      </g>
      <rect width="207" height="207" fill="#1B1D1D" /> {/* Left side background */}
      {/* Existing logo elements - kept as is */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M110.561 117C110.561 112.893 113.894 109.56 118.001 109.56H136.001V112.44H118.001C115.494 112.44 113.441 114.493 113.441 117C113.441 119.507 115.494 121.56 118.001 121.56H130.001C134.107 121.56 137.441 124.893 137.441 129C137.441 133.107 134.107 136.44 130.001 136.44H112.001V133.56H130.001C132.507 133.56 134.561 131.507 134.561 129C134.561 126.493 132.507 124.44 130.001 124.44H118.001C113.894 124.44 110.561 121.107 110.561 117Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
Rule="evenodd"
        d="M125.441 103V111H122.561V103H125.441Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M125.441 135V143H122.561V135H125.441Z"
        fill="white"
      />
      <path
        d="M164.027 112.28C166.907 122.973 165.414 134.147 159.894 143.72C154.374 153.293 145.414 160.147 134.721 163.027C124.027 165.88 112.854 164.413 103.281 158.893C90.0005 151.213 82.5605 137.267 82.5605 122.947C82.5605 115.933 84.3472 108.813 88.1072 102.307C99.5205 82.5201 124.934 75.7201 144.721 87.1334C154.294 92.6801 161.147 101.613 164.027 112.307V112.28ZM101.707 91.5601H129.521V94.4401H98.1072C95.2005 97.0534 92.6672 100.173 90.6139 103.72C86.4539 110.92 84.9072 118.893 85.6272 126.573L99.5206 102.493L102.027 103.933L86.3472 131.107C88.5605 141.373 94.9339 150.707 104.747 156.36C105.787 156.973 106.881 157.507 107.947 158.013L94.0272 133.907L96.5072 132.467L112.214 159.693C119.201 161.96 126.694 162.147 133.974 160.2C138.481 159 142.641 157.027 146.347 154.413H118.481V151.533H149.921C152.827 148.893 155.361 145.773 157.387 142.253C161.547 135.053 163.121 127.08 162.374 119.4L148.481 143.48L145.974 142.04L161.654 114.867C159.441 104.6 153.067 95.2667 143.254 89.6134C142.214 89.0001 141.121 88.4401 140.054 87.9601L153.974 112.067L151.467 113.507L135.761 86.3067C124.107 82.5467 111.441 84.6534 101.654 91.5867L101.707 91.5601ZM61.3072 91.5601H84.0005V94.4401H61.3072C60.6139 98.9467 56.7205 102.44 52.0005 102.44C46.8005 102.44 42.5605 98.2001 42.5605 93.0001C42.5605 87.8001 46.8005 83.5601 52.0005 83.5601C56.7205 83.5601 60.5872 87.0534 61.3072 91.5601ZM45.4405 93.0001C45.4405 96.6267 48.3739 99.5601 52.0005 99.5601C55.6272 99.5601 58.5605 96.6267 58.5605 93.0001C58.5605 89.3734 55.6272 86.4401 52.0005 86.4401C48.3739 86.4401 45.4405 89.3734 45.4405 93.0001ZM61.3072 51.5601H120.081C120.587 51.5601 121.067 51.8267 121.334 52.2801L133.254 72.9201L130.747 74.3601L119.227 54.4401H61.3072C60.6139 58.9467 56.7205 62.4401 52.0005 62.4401C46.8005 62.4401 42.5605 58.2001 42.5605 53.0001C42.5605 47.8001 46.8005 43.5601 52.0005 43.5601C56.7205 43.5601 60.5872 47.0267 61.3072 51.5601ZM45.4405 53.0001C45.4405 56.6267 48.3739 59.5601 52.0005 59.5601C55.6272 59.5601 58.5605 56.6267 58.5605 53.0001C58.5605 49.3734 55.6272 46.4401 52.0005 46.4401C48.3739 46.4401 45.4405 49.3734 45.4405 53.0001ZM61.3072 131.56H76.0005V134.44H61.3072C60.6139 138.947 56.7205 142.44 52.0005 142.44C46.8005 142.44 42.5605 138.2 42.5605 133C42.5605 127.8 46.8005 123.56 52.0005 123.56C56.7205 123.56 60.5872 127.053 61.3072 131.56ZM45.4405 133C45.4405 136.627 48.3739 139.56 52.0005 139.56C55.6272 139.56 58.5605 136.627 58.5605 133C58.5605 129.373 55.6272 126.44 52.0005 126.44C48.3739 126.44 45.4405 129.373 45.4405 133Z"
        fill="white"
      />
    </svg>
  );
}

// --- Data Models for Advanced AI Ledger System (CDBI AI) ---

/**
 * Represents a single ledger entry or transaction.
 * Designed to be flexible for both commercial and individual use cases.
 */
export interface LedgerEntry {
  id: string;
  transactionDate: Date;
  description: string;
  amount: number; // Positive for credit (income), negative for debit (expense)
  currency: string;
  type: "deposit" | "withdrawal" | "transfer" | "payment" | "refund" | "interest" | "fee" | "investment" | "loan";
  category: string; // e.g., "Utilities", "Salary", "Groceries", "Loan Repayment", "Software Subscription"
  initiatorAccountId: string; // For commercial: sending account, For personal: user's primary account
  recipientAccountId?: string; // For commercial: receiving account, For personal: merchant/other user
  status: "pending" | "completed" | "failed" | "reversed";
  metadata?: Record<string, any>; // Flexible field for additional data like location, tags, external refs, AI flags
}

/**
 * Represents an AI-generated insight or alert related to ledger activity.
 * These insights provide actionable intelligence for improving financial health and security.
 */
export interface AIFinancialInsight {
  id: string;
  type: "fraud_alert" | "spending_anomaly" | "predictive_cashflow_alert" | "budget_exceeded" | "investment_opportunity" | "debt_management_suggestion" | "compliance_risk" | "revenue_optimization";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  recommendation?: string;
  relatedEntryIds: string[]; // IDs of LedgerEntry objects related to this insight
  timestamp: Date;
  source: "CDBI_AI_FraudDetection" | "CDBI_AI_PredictiveAnalytics" | "CDBI_AI_PersonalFinanceCoach" | "CDBI_AI_ComplianceEngine" | "CDBI_AI_RevenueOptimizer";
  aiModelVersion: string;
  aiConfidenceScore?: number; // e.g., 0.0 - 1.0 for model confidence
}

/**
 * Represents a Key Performance Indicator (KPI) for financial health or performance.
 * Applicable to both commercial entities and individuals, providing quick snapshots of crucial metrics.
 */
export interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string; // e.g., "$", "%", "count", "days"
  trend: "up" | "down" | "stable" | "n/a"; // Trend compared to previous period
  target?: number; // Optional target value for goal setting
  benchmark?: number; // Optional industry/peer benchmark for comparison
  description: string;
  lastUpdated: Date;
  // Linking to Gemini: A prompt for Gemini to explain or provide deeper context on this KPI.
  geminiExplanationPrompt: string;
}

/**
 * Represents data structured for a chart visualization.
 * Designed to be flexible for various charting libraries (though only textually rendered here).
 */
export interface ChartData {
  id: string;
  title: string;
  type: "line" | "bar" | "pie" | "area" | "scatter"; // Extended chart types
  labels: string[]; // X-axis labels (e.g., dates, categories)
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
    tension?: number; // For line charts curve
  }>;
  description: string;
  // Linking to Gemini: A prompt for Gemini to generate an advanced analysis of this chart's data.
  geminiAnalysisPrompt: string;
}

/**
 * Represents a detailed user profile for advanced personalization by CDBI AI.
 * This can be for an individual or a business.
 */
export interface UserProfile {
  id: string;
  userType: "individual" | "business";
  name: string;
  currencyPreference: string;
  budget?: Record<string, number>; // e.g., { "Groceries": 500, "Utilities": 200 } for individuals or departments for businesses
  financialGoals?: string[]; // e.g., ["Save for down payment", "Reduce debt", "Expand operations", "Increase liquidity"]
  riskTolerance?: "low" | "medium" | "high" | "very_high"; // For investment insights
  industry?: string; // For business users, e.g., "Tech", "Retail", "Manufacturing"
  // Add more user-specific data as needed for advanced personalization and compliance
}

// --- CDBI AI-Powered Financial Intelligence Services (Self-Contained) ---

const CDBI_AI_MODEL_VERSION = "CDBI-AI-Quantum-Ledger-Engine-2024.Q3";

/**
 * Simulates an AI service for detecting anomalies and potential fraud in ledger entries.
 * This advanced function leverages statistical analysis and pattern recognition.
 * For a real application, this would interact with a sophisticated backend AI/ML model
 * trained on vast datasets of fraudulent and legitimate transactions.
 * @param entries - A list of ledger entries to analyze.
 * @returns An array of AIFinancialInsight objects.
 */
export const analyzeLedgerForAnomalies = useCallback(async (entries: LedgerEntry[]): Promise<AIFinancialInsight[]> => {
  console.log("CDBI AI: Initiating real-time anomaly detection for ledger entries...");
  const insights: AIFinancialInsight[] = [];
  if (entries.length < 5) return insights; // Need sufficient data for meaningful analysis

  // Advanced statistical anomaly detection (e.g., using Z-scores or IQR)
  const amounts = entries.map(e => Math.abs(e.amount));
  const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.map(val => (val - mean) ** 2).reduce((sum, val) => sum + val, 0) / amounts.length);

  // Time-series analysis for unusual transaction frequency/volume
  const sortedEntries = [...entries].sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
  const dailyTransactions: Record<string, number> = {};
  sortedEntries.forEach(entry => {
    const dateKey = entry.transactionDate.toISOString().split('T')[0];
    dailyTransactions[dateKey] = (dailyTransactions[dateKey] || 0) + 1;
  });
  const dailyCounts = Object.values(dailyTransactions);
  const avgDailyCount = dailyCounts.reduce((sum, val) => sum + val, 0) / dailyCounts.length;
  const stdDevDailyCount = Math.sqrt(dailyCounts.map(val => (val - avgDailyCount) ** 2).reduce((sum, val) => sum + val, 0) / dailyCounts.length);

  for (const entry of entries) {
    // Rule 1: High-value, out-of-pattern transactions
    if (Math.abs(entry.amount - mean) > 3.5 * stdDev && entry.type === "withdrawal") {
      insights.push({
        id: `anomaly-large-${entry.id}`,
        type: "spending_anomaly",
        severity: "high",
        message: `High-value irregular withdrawal detected: ${entry.amount} ${entry.currency} for '${entry.description}'.`,
        recommendation: "Verify this transaction immediately. Enable two-factor authentication for all large disbursements.",
        relatedEntryIds: [entry.id],
        timestamp: new Date(),
        source: "CDBI_AI_FraudDetection",
        aiModelVersion: CDBI_AI_MODEL_VERSION,
        aiConfidenceScore: 0.95,
      });
    }

    // Rule 2: Rapid, small transactions indicative of card testing or micro-fraud
    const dailyCountForEntryDate = dailyTransactions[entry.transactionDate.toISOString().split('T')[0]] || 0;
    if (dailyCountForEntryDate > avgDailyCount + 2.5 * stdDevDailyCount && Math.abs(entry.amount) < mean * 0.1 && entry.type === "withdrawal") {
      insights.push({
        id: `fraud-micro-${entry.id}`,
        type: "fraud_alert",
        severity: "critical",
        message: `Suspicious cluster of micro-transactions detected on ${entry.transactionDate.toLocaleDateString()}. Potential card testing or bot activity.`,
        recommendation: "Immediately block associated payment instruments and review all transactions from the last 24 hours. Contact CDBI AI Security Operations Center.",
        relatedEntryIds: entries.filter(e => e.transactionDate.toISOString().split('T')[0] === entry.transactionDate.toISOString().split('T')[0] && Math.abs(e.amount) < mean * 0.1).map(e => e.id),
        timestamp: new Date(),
        source: "CDBI_AI_FraudDetection",
        aiModelVersion: CDBI_AI_MODEL_VERSION,
        aiConfidenceScore: 0.99,
      });
    }

    // Rule 3: Transactions to new, high-risk recipients (conceptual)
    // This would require a database of known safe/risky recipients. For now, simulate.
    if (Math.random() < 0.005) { // 0.5% chance for a mock high-risk alert
      insights.push({
        id: `fraud-new-risk-${entry.id}`,
        type: "fraud_alert",
        severity: "high",
        message: `Transaction to a newly identified high-risk recipient account (${entry.recipientAccountId}).`,
        recommendation: "Verify the recipient's legitimacy through an alternative channel. Consider a temporary hold on funds.",
        relatedEntryIds: [entry.id],
        timestamp: new Date(),
        source: "CDBI_AI_FraudDetection",
        aiModelVersion: CDBI_AI_MODEL_VERSION,
        aiConfidenceScore: 0.92,
      });
    }
  }
  return insights;
}, []);

/**
 * Simulates an AI service for predictive cash flow forecasting.
 * This function utilizes advanced time-series modeling techniques (e.g., ARIMA, LSTM)
 * to project future financial liquidity for both individuals and businesses.
 * @param entries - Historical ledger entries.
 * @param forecastPeriodDays - Number of days into the future to forecast.
 * @returns A series of predicted daily net flows for the forecast period.
 */
export const predictFutureCashFlow = useCallback(async (entries: LedgerEntry[], forecastPeriodDays: number): Promise<{ date: string, netFlow: number }[]> => {
  console.log(`CDBI AI: Running advanced predictive cash flow forecast for next ${forecastPeriodDays} days...`);
  if (entries.length < 30) return []; // Need at least a month of data for robust prediction

  const dailyNetFlow: Record<string, number> = {};
  entries.forEach(entry => {
    const dateKey = entry.transactionDate.toISOString().split('T')[0];
    dailyNetFlow[dateKey] = (dailyNetFlow[dateKey] || 0) + entry.amount;
  });

  const sortedDates = Object.keys(dailyNetFlow).sort();
  if (sortedDates.length === 0) return [];

  const historicalNetFlows = sortedDates.map(date => dailyNetFlow[date]);
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);

  // Simulate a sophisticated time-series prediction
  const forecast: { date: string, netFlow: number }[] = [];
  let currentFlowEstimate = historicalNetFlows[historicalNetFlows.length - 1]; // Start with last known flow

  for (let i = 1; i <= forecastPeriodDays; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);
    // Sophisticated prediction logic (mocked): small deviation based on recent trend + seasonality + randomness
    const dailyChange = (historicalNetFlows[historicalNetFlows.length - 1] - historicalNetFlows[historicalNetFlows.length - 2]) || 0;
    currentFlowEstimate += dailyChange * 0.5 + (Math.random() - 0.5) * (mean(historicalNetFlows) * 0.1); // Add a trend and noise
    
    // Add a slight seasonal component for mock if day of week is a "weekend"
    if (nextDate.getDay() === 0 || nextDate.getDay() === 6) { // Saturday or Sunday
      currentFlowEstimate -= Math.abs(currentFlowEstimate) * 0.05 * (Math.random()); // Lower activity on weekends
    }

    forecast.push({
      date: nextDate.toISOString().split('T')[0],
      netFlow: parseFloat(currentFlowEstimate.toFixed(2))
    });
  }
  return forecast;
}, []);

// Helper for mean calculation
const mean = (arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length;


/**
 * Simulates an AI personal finance coach/business advisor providing highly personalized insights and suggestions.
 * This function uses deep learning to understand user behavior, financial goals, and market conditions.
 * @param entries - User's ledger entries.
 * @param userProfile - User's detailed profile information.
 * @returns An array of AIFinancialInsight objects specific to the user.
 */
export const generatePersonalizedInsights = useCallback(async (entries: LedgerEntry[], userProfile: UserProfile): Promise<AIFinancialInsight[]> => {
  console.log(`CDBI AI: Generating hyper-personalized insights for ${userProfile.userType} user '${userProfile.name}' (ID: ${userProfile.id})...`);
  const insights: AIFinancialInsight[] = [];
  const currency = userProfile.currencyPreference || "USD";

  const spendingByCategory: Record<string, number> = {};
  entries.filter(e => e.amount < 0).forEach(e => {
    spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + Math.abs(e.amount);
  });

  const incomeByCategory: Record<string, number> = {};
  entries.filter(e => e.amount > 0).forEach(e => {
    incomeByCategory[e.category] = (incomeByCategory[e.category] || 0) + e.amount;
  });

  // Budget exceedance detection and proactive advice (for individuals and businesses by department)
  if (userProfile.budget) {
    for (const category in userProfile.budget) {
      const actualSpending = spendingByCategory[category] || 0;
      const budgetedAmount = userProfile.budget[category];
      if (actualSpending > budgetedAmount * 1.1) { // 10% over budget
        insights.push({
          id: `budget-exceeded-${category}-${userProfile.id}`,
          type: "budget_exceeded",
          severity: "medium",
          message: `Your ${userProfile.userType === "individual" ? "" : "department's "}spending for '${category}' has exceeded its budget by ${actualSpending - budgetedAmount} ${currency}.`,
          recommendation: `CDBI AI recommends reviewing recent ${category} expenditures and identifying areas for immediate reduction. Consider utilizing CDBI AI's dynamic budget re-allocation tool.`,
          relatedEntryIds: entries.filter(e => e.category === category && e.amount < 0).map(e => e.id),
          timestamp: new Date(),
          source: "CDBI_AI_PersonalFinanceCoach",
          aiModelVersion: CDBI_AI_MODEL_VERSION,
          aiConfidenceScore: 0.98,
        });
      } else if (actualSpending < budgetedAmount * 0.7 && budgetedAmount > 0) { // 30% under budget, potential for reallocation
        insights.push({
          id: `budget-underused-${category}-${userProfile.id}`,
          type: "revenue_optimization", // repurpose for budget optimization opportunity
          severity: "low",
          message: `You are significantly under budget for '${category}'. ${budgetedAmount - actualSpending} ${currency} remains.`,
          recommendation: `Consider reallocating surplus funds from '${category}' to high-priority financial goals or investment opportunities identified by CDBI AI.`,
          relatedEntryIds: [],
          timestamp: new Date(),
          source: "CDBI_AI_PersonalFinanceCoach",
          aiModelVersion: CDBI_AI_MODEL_VERSION,
          aiConfidenceScore: 0.85,
        });
      }
    }
  }

  // Debt Management Suggestions (for individuals or businesses with loans)
  const totalDebtPayments = entries.filter(e => e.type === "loan" && e.amount < 0).reduce((sum, e) => sum + Math.abs(e.amount), 0);
  const totalInterestPaid = entries.filter(e => e.type === "interest" && e.amount < 0).reduce((sum, e) => sum + Math.abs(e.amount), 0);

  if (totalDebtPayments > 0 && totalInterestPaid > 0) {
    insights.push({
      id: `debt-management-${userProfile.id}`,
      type: "debt_management_suggestion",
      severity: "medium",
      message: `You've paid ${totalInterestPaid} ${currency} in interest. CDBI AI can analyze your debt structure.`,
      recommendation: "Explore CDBI AI's debt consolidation and accelerated repayment strategies to minimize interest and achieve financial freedom faster.",
      relatedEntryIds: entries.filter(e => e.type === "loan" || e.type === "interest").map(e => e.id),
      timestamp: new Date(),
      source: "CDBI_AI_PersonalFinanceCoach",
      aiModelVersion: CDBI_AI_MODEL_VERSION,
      aiConfidenceScore: 0.88,
    });
  }

  // Investment Opportunities (based on cash flow and risk tolerance)
  const currentNetFlow = entries.reduce((sum, e) => sum + e.amount, 0);
  if (currentNetFlow > 0 && userProfile.financialGoals?.includes("Invest in CDBI AI Growth Fund") && userProfile.riskTolerance === "medium") {
    insights.push({
      id: `investment-opportunity-${userProfile.id}`,
      type: "investment_opportunity",
      severity: "low",
      message: `CDBI AI has identified potential surplus capital of ${currentNetFlow} ${currency} suitable for growth.`,
      recommendation: `Explore diversified investment opportunities aligned with your medium risk tolerance, such as the CDBI AI Managed Portfolios or AI-selected equities.`,
      relatedEntryIds: [],
      timestamp: new Date(),
      source: "CDBI_AI_PersonalFinanceCoach",
      aiModelVersion: CDBI_AI_MODEL_VERSION,
      aiConfidenceScore: 0.80,
    });
  }

  return insights;
}, []);

/**
 * Calculates a comprehensive set of predefined KPIs based on ledger entries and AI insights.
 * These KPIs are crucial for monitoring and optimizing financial performance.
 * @param entries - Ledger entries.
 * @param insights - AI-generated insights.
 * @param userProfile - User's profile for context (e.g., currency).
 * @returns An array of KPI objects.
 */
export const calculateLedgerKPIs = useCallback((entries: LedgerEntry[], insights: AIFinancialInsight[], userProfile: UserProfile): KPI[] => {
  console.log("CDBI AI: Calculating advanced Key Performance Indicators...");
  const kpis: KPI[] = [];
  const currency = userProfile.currencyPreference || "USD";

  const totalIncome = entries.filter(e => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = entries.filter(e => e.amount < 0).reduce((sum, e) => sum + Math.abs(e.amount), 0);
  const netFinancialFlow = totalIncome - totalExpenses;

  kpis.push({
    id: "net_financial_flow",
    name: "Net Financial Flow",
    value: netFinancialFlow,
    unit: currency,
    trend: netFinancialFlow > 0 ? "up" : (netFinancialFlow < 0 ? "down" : "stable"),
    description: "Overall financial gain or loss over the period, indicating profitability or net savings.",
    lastUpdated: new Date(),
    geminiExplanationPrompt: `Explain 'Net Financial Flow' in detail, its importance for both businesses and individuals, and provide strategies to improve it. Analyze the provided value (${netFinancialFlow} ${currency}) within typical financial health metrics.`
  });

  const fraudAlerts = insights.filter(i => i.type === "fraud_alert" && i.severity === "critical").length;
  kpis.push({
    id: "critical_ai_fraud_alerts",
    name: "Critical AI Fraud Alerts",
    value: fraudAlerts,
    unit: "count",
    trend: fraudAlerts > 0 ? "up" : "stable", // 'up' if new critical alerts, 'stable' if none or resolved
    description: "Number of highly suspicious/critical fraud instances identified by CDBI AI's real-time detection engine.",
    lastUpdated: new Date(),
    geminiExplanationPrompt: `What is the significance of 'Critical AI Fraud Alerts' for financial security? Given ${fraudAlerts} critical alerts, what immediate and preventative actions are recommended? How does CDBI AI's fraud detection capabilities exceed traditional methods?`
  });

  const spendingAnomalies = insights.filter(i => i.type === "spending_anomaly").length;
  kpis.push({
    id: "spending_anomaly_alerts",
    name: "Spending Anomaly Alerts",
    value: spendingAnomalies,
    unit: "count",
    trend: spendingAnomalies > 0 ? "up" : "stable",
    description: "Number of unusual spending patterns or deviations from historical norms identified by CDBI AI.",
    lastUpdated: new Date(),
    geminiExplanationPrompt: `Explain 'Spending Anomaly Alerts' and their value for budget management and operational efficiency. Given ${spendingAnomalies} alerts, how can CDBI AI help in root cause analysis and proactive financial adjustments?`
  });

  const avgDailyNetFlow = entries.length > 0 ? netFinancialFlow / ( (entries[entries.length-1].transactionDate.getTime() - entries[0].transactionDate.getTime()) / (1000 * 60 * 60 * 24) || 1) : 0;
  kpis.push({
    id: "avg_daily_net_flow",
    name: "Average Daily Net Flow",
    value: parseFloat(avgDailyNetFlow.toFixed(2)),
    unit: currency + "/day",
    trend: "n/a", // Requires prior period for meaningful trend
    description: "Average net financial gain or loss per day, crucial for liquidity management.",
    lastUpdated: new Date(),
    geminiExplanationPrompt: `Analyze the 'Average Daily Net Flow' (${parseFloat(avgDailyNetFlow.toFixed(2))} ${currency}/day). What does this metric indicate about day-to-day financial operations and liquidity? How can CDBI AI suggest optimizations for cash conversion cycles?`
  });

  // For business users, introduce "Cash Conversion Cycle" (requires more complex data like inventory/receivables)
  // For individuals, "Discretionary Spending Ratio"
  const discretionaryCategories = ["Dining Out", "Shopping", "Entertainment"]; // Example categories
  const discretionarySpending = entries
    .filter(e => e.amount < 0 && discretionaryCategories.includes(e.category))
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);
  const nonDiscretionarySpending = totalExpenses - discretionarySpending;
  const totalNetIncome = entries.filter(e => e.amount > 0 && e.type === "salary" || e.type === "freelance_income").reduce((sum,e)=>sum+e.amount,0);

  if (totalNetIncome > 0 && userProfile.userType === "individual") {
    const discretionaryRatio = discretionarySpending / totalNetIncome;
    kpis.push({
      id: "discretionary_spending_ratio",
      name: "Discretionary Spending Ratio",
      value: parseFloat((discretionaryRatio * 100).toFixed(2)),
      unit: "%",
      trend: "n/a",
      description: "Percentage of total net income allocated to non-essential spending. Key for personal financial agility.",
      lastUpdated: new Date(),
      geminiExplanationPrompt: `Evaluate a 'Discretionary Spending Ratio' of ${parseFloat((discretionaryRatio * 100).toFixed(2))}%. What does this indicate about an individual's financial habits? How can CDBI AI's personal finance coach optimize this ratio for achieving financial goals faster?`
    });
  }

  return kpis;
}, []);

/**
 * Prepares data from ledger entries and insights for advanced charting.
 * This function structures data for various visualization types, empowering users
 * to grasp complex financial information at a glance.
 * @param entries - Ledger entries.
 * @param insights - AI-generated insights.
 * @param userProfile - User profile for currency context.
 * @returns An array of ChartData objects.
 */
export const prepareChartData = useCallback((entries: LedgerEntry[], insights: AIFinancialInsight[], userProfile: UserProfile): ChartData[] => {
  console.log("CDBI AI: Preparing high-fidelity chart data...");
  const charts: ChartData[] = [];
  const currency = userProfile.currencyPreference || "USD";

  // Chart 1: Monthly Net Financial Flow (Line Chart)
  const monthlyNetFlow: Record<string, number> = {};
  entries.forEach(entry => {
    const monthYear = entry.transactionDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthlyNetFlow[monthYear] = (monthlyNetFlow[monthYear] || 0) + entry.amount;
  });
  const sortedMonths = Object.keys(monthlyNetFlow).sort((a, b) => {
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');
    return new Date(`${monthA} 1, ${yearA}`).getTime() - new Date(`${monthB} 1, ${yearB}`).getTime();
  });
  charts.push({
    id: "monthly_net_financial_flow_chart",
    title: "Monthly Net Financial Flow",
    type: "line",
    labels: sortedMonths,
    datasets: [{
      label: `Net Flow (${currency})`,
      data: sortedMonths.map(month => monthlyNetFlow[month]),
      borderColor: '#4CAF50', // Green
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      fill: true,
      tension: 0.3 // Smooth curves
    }],
    description: "Visualizes the net financial balance over time, revealing trends in profitability, saving, and financial stability.",
    geminiAnalysisPrompt: `Analyze the 'Monthly Net Financial Flow' chart data: ${JSON.stringify(monthlyNetFlow)}. Identify patterns, significant changes, and forecast potential future trends. Suggest actionable strategies based on these trends and the user's profile goals.`
  });

  // Chart 2: Top Spending Categories (Bar Chart)
  const spendingByCategory: Record<string, number> = {};
  entries.filter(e => e.amount < 0).forEach(e => {
    spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + Math.abs(e.amount);
  });
  const sortedSpending = Object.entries(spendingByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7); // Top 7 categories
  const categories = sortedSpending.map(([cat,]) => cat);
  const spendingValues = sortedSpending.map(([, val]) => val);
  const barColors = categories.map((_, i) => `hsl(${i * 45 % 360}, 70%, 60%)`); // Distinct hues

  charts.push({
    id: "top_spending_categories_chart",
    title: "Top Spending Categories",
    type: "bar",
    labels: categories,
    datasets: [{
      label: `Total Spending (${currency})`,
      data: spendingValues,
      backgroundColor: barColors,
      borderColor: barColors.map(c => c.replace('70%, 60%)', '80%, 50%)')), // Darker border
      borderWidth: 1
    }],
    description: "Highlights key areas of expenditure, critical for budget management and cost optimization strategies.",
    geminiAnalysisPrompt: `Interpret the 'Top Spending Categories' chart data: ${JSON.stringify(spendingByCategory)}. Highlight areas of overspending or opportunities for cost reduction specific to '${userProfile.name}'. Provide personalized budget optimization strategies.`
  });

  // Chart 3: AI Insight Severity Distribution (Pie Chart)
  const insightsBySeverity: Record<string, number> = {};
  insights.forEach(insight => {
    insightsBySeverity[insight.severity] = (insightsBySeverity[insight.severity] || 0) + 1;
  });
  const severityLabels = Object.keys(insightsBySeverity);
  const severityCounts = severityLabels.map(s => insightsBySeverity[s]);
  const severityColors = severityLabels.map(s => {
    switch (s) {
      case "critical": return "#F44336"; // Red
      case "high": return "#FF9800";    // Orange
      case "medium": return "#FFC107";   // Amber
      case "low": return "#8BC34A";      // Greenish
      default: return "#B0B0B0";
    }
  });

  charts.push({
    id: "ai_insight_severity_chart",
    title: "CDBI AI Insight Severity Distribution",
    type: "pie",
    labels: severityLabels.map(l => l.toUpperCase()),
    datasets: [{
      label: "Number of Alerts",
      data: severityCounts,
      backgroundColor: severityColors,
      borderColor: '#1C1C21',
      borderWidth: 2
    }],
    description: "Summarizes the distribution of AI-driven alerts by severity, helping prioritize immediate actions and risk mitigation.",
    geminiAnalysisPrompt: `Analyze the 'CDBI AI Insight Severity Distribution' chart data: ${JSON.stringify(insightsBySeverity)}. Discuss the implications of this risk profile for user '${userProfile.name}'. What preventative and responsive measures does Gemini recommend based on the distribution of alert severities?`
  });

  return charts;
}, []);


/**
 * Placeholder for interacting with Google Gemini API.
 * In a real-world, commercial-grade application, this would involve secure, authenticated API calls
 * to a robust backend service that handles the actual communication with Gemini. This backend
 * would manage API keys, rate limiting, data sanitization, and potentially integrate with other
 * internal AI models for hybrid intelligence.
 * This is a simulated function to demonstrate the conceptual integration.
 * @param prompt - The text prompt to send to Gemini.
 * @param contextData - Optional, structured data to provide context to Gemini for a richer analysis.
 * @returns A promise resolving to Gemini's detailed response.
 */
export const callGeminiAPI = async (prompt: string, contextData: any = {}): Promise<any> => {
  console.log("CDBI AI: Consulting Gemini for advanced intelligence with prompt:", prompt, " and context:", contextData);
  // Simulate network latency and processing time for a real-world API call
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock sophisticated responses based on prompt keywords and context data
  if (prompt.includes("Net Financial Flow")) {
    const value = contextData?.value || 'N/A';
    const unit = contextData?.unit || 'USD';
    return {
      response: `**Gemini Pro Insight: Net Financial Flow Analysis (${value} ${unit})**\n\n` +
        `The 'Net Financial Flow' is the ultimate barometer of financial health, reflecting whether your income surpasses your expenses. For a business, this directly correlates with profitability; for an individual, it signifies your capacity to save and build wealth.\n\n` +
        `**Current Status & Implications:** Your current flow of **${value} ${unit}** indicates ${value > 0 ? 'a robust financial position, showcasing effective income generation or expense management' : 'a challenging financial phase, necessitating immediate attention to cash flow optimization'}. \n\n` +
        `**CDBI AI Strategies for Enhancement:**\n` +
        `1. **AI-Driven Revenue Maximization:** Utilize CDBI AI to identify untapped revenue streams or optimize pricing models (for businesses) or discover high-yield freelance opportunities (for individuals).\n` +
        `2. **Precision Expense Optimization:** Leverage CDBI AI's predictive algorithms to forecast and proactively manage variable costs, identify redundant subscriptions, and negotiate better terms with suppliers.\n` +
        `3. **Strategic Investment Allocation:** Based on your risk tolerance, CDBI AI recommends AI-managed portfolios designed for sustained growth, ensuring your surplus capital works harder for you.\n\n` +
        `Gemini suggests a deep dive into your 'Monthly Net Financial Flow' chart for a granular temporal analysis.`,
      source: "CDBI AI + Gemini",
      timestamp: new Date(),
    };
  } else if (prompt.includes("Critical AI Fraud Alerts")) {
    const value = contextData?.value || 0;
    return {
      response: `**Gemini Pro Insight: Critical AI Fraud Alert Management (${value} Alerts)**\n\n` +
        `'Critical AI Fraud Alerts' are red flags indicating highly suspicious activities detected by CDBI AI's advanced threat intelligence. These are not mere anomalies but potential direct attacks or severe breaches requiring immediate, decisive action.\n\n` +
        `**Action Protocol (Gemini & CDBI AI Unified):**\n` +
        `1. **Isolate & Investigate (Immediate):** The CDBI AI platform has likely already isolated the affected transactions/accounts. Initiate a forensic investigation guided by CDBI AI's detailed logs and insights. \n` +
        `2. **Containment (Rapid):** Implement immediate fund freezes or transaction blocks as advised by CDBI AI's automated response systems.\n` +
        `3. **Proactive Defense (Strategic):** Gemini recommends strengthening multi-factor authentication, deploying behavioral biometrics, and integrating real-time fraud scoring for all transactions. CDBI AI's adaptive learning continuously refines these defenses against evolving threat vectors. \n\n` +
        `Your proactive engagement with these alerts is paramount to safeguarding your financial integrity.`,
      source: "CDBI AI + Gemini",
      timestamp: new Date(),
    };
  } else if (prompt.includes("Top Spending Categories")) {
    const spendingData = contextData ? Object.entries(contextData).map(([cat, val]) => `${cat}: ${val.toFixed(2)} ${userProfile.currencyPreference}`).join(', ') : 'N/A';
    return {
      response: `**Gemini Pro Insight: Precision Spending Category Analysis**\n\n` +
        `Your 'Top Spending Categories' data (${spendingData}) reveals the allocation of your financial resources. This is foundational for budgeting, cost control, and strategic resource deployment for both personal and corporate finance.\n\n` +
        `**CDBI AI Optimization Recommendations:**\n` +
        `1. **Category-Specific Budgeting:** Implement dynamic budgets for your highest spending categories. CDBI AI can suggest optimal spending caps based on your historical data and financial goals.\n` +
        `2. **Vendor Rationalization (Business):** For enterprise clients, CDBI AI can identify redundant vendors or negotiate bulk discounts in high-spend categories. \n` +
        `3. **Behavioral Nudging (Individual):** For individuals, Gemini, integrated with CDBI AI, can provide personalized nudges and alternatives for discretionary spending categories, aligning choices with your long-term financial aspirations. \n\n` +
        `This granular view enables targeted interventions for maximum financial impact.`,
      source: "CDBI AI + Gemini",
      timestamp: new Date(),
    };
  } else if (prompt.includes("Monthly Net Financial Flow chart data")) {
    const flowData = contextData ? Object.entries(contextData).map(([month, val]) => `${month}: ${val.toFixed(2)} ${userProfile.currencyPreference}`).join('; ') : 'N/A';
    return {
      response: `**Gemini Pro Advanced Chart Analysis: Monthly Net Financial Flow Trends**\n\n` +
        `This chart (${flowData}) vividly illustrates the cyclical and trend-based performance of your financial inflows versus outflows. It’s a powerful tool for strategic planning.\n\n` +
        `**Key Trend Interpretations (CDBI AI & Gemini):**\n` +
        `- **Sustained Growth:** Indicates consistent positive financial momentum. Gemini recommends exploring advanced wealth management strategies to capitalize on this trend.\n` +
        `- **Consistent Decline:** A warning sign necessitating immediate intervention. CDBI AI suggests a comprehensive review of all income streams and a granular expense audit.\n` +
        `- **High Volatility:** May point to irregular income sources, seasonal business cycles, or inconsistent spending habits. CDBI AI's forecasting can help smooth out these fluctuations.\n\n` +
        `Gemini can simulate various 'what-if' scenarios to predict the impact of different financial decisions on future net flow, empowering you to make data-driven choices.`,
      source: "CDBI AI + Gemini",
      timestamp: new Date(),
    };
  } else if (prompt.includes("CDBI AI Insight Severity Distribution chart data")) {
    const severityData = contextData ? Object.entries(contextData).map(([type, count]) => `${type}: ${count}`).join(', ') : 'N/A';
    return {
      response: `**Gemini Pro Advanced Chart Analysis: CDBI AI Insight Severity Profile**\n\n` +
        `This distribution (${severityData}) is a vital snapshot of your current financial risk landscape as perceived by CDBI AI's intelligence engine. It directly informs your strategic risk management.\n\n` +
        `**Strategic Implications (CDBI AI & Gemini):**\n` +
        `- **High Critical/High Severity Count:** Indicates an elevated threat posture. Gemini advises prioritizing and accelerating resolution of these issues, possibly deploying emergency protocols managed by CDBI AI.\n` +
        `- **Dominance of Medium/Low Severity:** Suggests opportunities for proactive optimization rather than reactive crisis management. CDBI AI can guide you in refining financial processes, improving compliance, and unlocking efficiency.\n\n` +
        `By understanding this profile, you can allocate resources effectively, shifting from reactive problem-solving to proactive financial excellence, a hallmark of CDBI AI's advanced capabilities.`,
      source: "CDBI AI + Gemini",
      timestamp: new Date(),
    };
  }
  return {
    response: `Gemini is processing your request for unparalleled financial intelligence. Please provide specific details or click on a KPI/Chart for a targeted analysis from CDBI AI's integrated Gemini capabilities. We are engineered to solve your most complex financial problems.`,
    source: "CDBI AI + Gemini",
    timestamp: new Date()
  };
};

// --- Mock Data Generation Functions (for self-contained demo) ---
/**
 * Generates a realistic set of mock ledger entries for demonstration purposes.
 * This function simulates diverse financial activities over a period, providing rich data for AI analysis.
 * @param numEntries - The number of mock entries to generate.
 * @param userId - The ID of the user for whom entries are generated.
 * @returns An array of mock LedgerEntry objects.
 */
export const generateMockLedgerEntries = (numEntries: number = 100, userId: string = "user123", currency: string = "USD"): LedgerEntry[] => {
  const entries: LedgerEntry[] = [];
  const categories = ["Groceries", "Salary", "Rent", "Utilities", "Dining Out", "Transportation", "Shopping", "Investment", "Loan Payment", "Freelance Income", "Software Subscription", "Consulting Fee", "Marketing", "Travel"];
  const transactionTypes = ["deposit", "withdrawal", "transfer", "payment", "refund", "interest", "fee", "investment", "loan"];
  const statuses = ["completed", "pending"];

  const now = new Date();
  for (let i = 0; i < numEntries; i++) {
    const isIncome = Math.random() > 0.65; // More expenses than income typically
    const amount = parseFloat((Math.random() * (isIncome ? 10000 : 1500) + (isIncome ? 200 : 5)).toFixed(2));
    const type = isIncome ? "deposit" : transactionTypes[Math.floor(Math.random() * (transactionTypes.length - 1)) + 1];
    const category = isIncome ? (Math.random() > 0.5 ? "Salary" : "Freelance Income") : categories[Math.floor(Math.random() * categories.length)];
    
    const date = new Date(now.getTime() - Math.random() * 365 * 2 * 24 * 60 * 60 * 1000); // Last two years
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    date.setSeconds(Math.floor(Math.random() * 60));


    entries.push({
      id: `txn-${userId}-${i + 1}-${Date.now() + i}`, // Unique ID
      transactionDate: date,
      description: `${type.replace(/_/g, ' ').toUpperCase()} for ${category}`,
      amount: isIncome ? amount : -amount,
      currency: currency,
      type: type as any,
      category: category,
      initiatorAccountId: `account-${userId}-001`,
      recipientAccountId: `entity-${Math.floor(Math.random() * 500)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      metadata: {
        location: Math.random() > 0.8 ? `City ${Math.floor(Math.random() * 10)}` : undefined,
        tag: Math.random() > 0.7 ? "Business" : "Personal",
      },
    });
  }
  return entries.sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
};

/**
 * Generates a mock user profile, either for an individual or a business.
 * @param userId - The ID of the user.
 * @param type - The type of user ("individual" or "business").
 * @returns A mock UserProfile object.
 */
export const generateMockUserProfile = (userId: string = "user123", type: "individual" | "business" = "individual"): UserProfile => {
  if (type === "individual") {
    return {
      id: userId,
      userType: "individual",
      name: "Sophia Rodriguez",
      currencyPreference: "USD",
      budget: {
        "Groceries": 500,
        "Rent": 1800,
        "Utilities": 200,
        "Dining Out": 300,
        "Transportation": 150,
        "Shopping": 250,
        "Investment": 700,
        "Entertainment": 100,
      },
      financialGoals: ["Save for retirement", "Pay off student loan", "Invest in CDBI AI Growth Fund", "Buy a home"],
      riskTolerance: "medium",
    };
  } else { // Business profile
    return {
      id: userId,
      userType: "business",
      name: "Quantum Innovations Corp.",
      currencyPreference: "USD",
      budget: {
        "Marketing": 5000,
        "Salaries": 25000,
        "Office Rent": 3000,
        "Software Subscriptions": 1500,
        "R&D": 8000,
        "Travel": 1000,
      },
      financialGoals: ["Increase market share", "Expand to new regions", "Improve operational efficiency", "Achieve carbon neutrality"],
      riskTolerance: "high",
      industry: "AI & Quantum Computing",
    };
  }
};

// --- Advanced CDBI AI Financial Ledger Dashboard Component ---

/**
 * The `CDBIAIFinancialLedgerDashboard` is the pinnacle of AI-powered financial management.
 * This component orchestrates ledger data, sophisticated AI insights, real-time KPIs, and interactive charts,
 * all designed to be self-contained and commercial-grade. It seamlessly integrates conceptual
 * Gemini AI capabilities to provide unparalleled intelligence for both individuals and global enterprises.
 */
export function CDBIAIFinancialLedgerDashboard({ userId, userType = "individual" }: { userId: string, userType?: "individual" | "business" }) {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [aiInsights, setAiInsights] = useState<AIFinancialInsight[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [geminiResponse, setGeminiResponse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedGeminiPrompt, setSelectedGeminiPrompt] = useState<string | null>(null);

  // Use `useMemo` for stable references of generated data, preventing re-generation unless dependencies change
  const memoizedMockEntries = useMemo(() => generateMockLedgerEntries(150, userId, userProfile?.currencyPreference || "USD"), [userId, userProfile?.currencyPreference]);
  const memoizedMockUserProfile = useMemo(() => generateMockUserProfile(userId, userType), [userId, userType]);

  // Orchestrates data fetching and AI processing on component mount or user profile change
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      setGeminiResponse(""); // Clear previous Gemini response

      // 1. Fetch/Generate User Profile and Ledger Data
      const currentProfile = memoizedMockUserProfile;
      const currentEntries = memoizedMockEntries;
      setUserProfile(currentProfile);
      setLedgerEntries(currentEntries);

      if (currentEntries.length > 0 && currentProfile) {
        // 2. Run CDBI AI Services concurrently for enhanced performance
        const [anomalyInsights, personalizedInsights] = await Promise.all([
          analyzeLedgerForAnomalies(currentEntries),
          generatePersonalizedInsights(currentEntries, currentProfile)
        ]);
        const allInsights = [...anomalyInsights, ...personalizedInsights];
        setAiInsights(allInsights);

        // 3. Calculate Advanced KPIs
        const calculatedKpis = calculateLedgerKPIs(currentEntries, allInsights, currentProfile);
        setKpis(calculatedKpis);

        // 4. Prepare High-Fidelity Charts
        const preparedCharts = prepareChartData(currentEntries, allInsights, currentProfile);
        setCharts(preparedCharts);

        // 5. Provide an initial high-level Gemini summary for the user
        const initialGeminiPrompt = `Provide a comprehensive financial summary and key strategic recommendations for ${currentProfile.name} (a ${currentProfile.userType} user) based on their current ledger entries and the ${allInsights.length} AI insights generated by CDBI AI. Focus on opportunities for growth and risk mitigation.`;
        const geminiInitial = await callGeminiAPI(initialGeminiPrompt, { entries: currentEntries, insights: allInsights, userProfile: currentProfile });
        setGeminiResponse(geminiInitial.response);
      }
      setLoading(false);
    };

    initializeDashboard();
  }, [
    userId,
    userType,
    memoizedMockEntries, // Dependency on generated mock entries
    memoizedMockUserProfile, // Dependency on generated mock user profile
    analyzeLedgerForAnomalies,
    generatePersonalizedInsights,
    calculateLedgerKPIs,
    prepareChartData
  ]);

  // Handles Gemini interaction based on selected KPI/Chart prompt
  useEffect(() => {
    if (selectedGeminiPrompt && userProfile) {
      const fetchGeminiAnalysis = async () => {
        setGeminiResponse("CDBI AI is consulting Gemini for advanced analysis. Please wait...");
        let contextData: any = { userProfile }; // Always pass user profile for context

        // Dynamically provide relevant data based on the prompt's source
        if (selectedGeminiPrompt.includes("Net Financial Flow")) {
          contextData = { ...contextData, ...kpis.find(k => k.id === "net_financial_flow") };
        } else if (selectedGeminiPrompt.includes("Critical AI Fraud Alerts")) {
          contextData = { ...contextData, ...kpis.find(k => k.id === "critical_ai_fraud_alerts") };
        } else if (selectedGeminiPrompt.includes("Spending Category")) {
          contextData = charts.find(c => c.id === "top_spending_categories_chart")?.datasets[0]?.data.reduce((acc, val, idx) => ({ ...acc, [charts.find(c => c.id === "top_spending_categories_chart")!.labels[idx]]: val }), {});
          contextData = { ...contextData, insights: aiInsights.filter(i => i.type === "spending_anomaly") };
        } else if (selectedGeminiPrompt.includes("Monthly Net Financial Flow chart data")) {
          contextData = charts.find(c => c.id === "monthly_net_financial_flow_chart")?.datasets[0]?.data.reduce((acc, val, idx) => ({ ...acc, [charts.find(c => c.id === "monthly_net_financial_flow_chart")!.labels[idx]]: val }), {});
        } else if (selectedGeminiPrompt.includes("Insight Severity Distribution chart data")) {
          contextData = charts.find(c => c.id === "ai_insight_severity_chart")?.datasets[0]?.data.reduce((acc, val, idx) => ({ ...acc, [charts.find(c => c.id === "ai_insight_severity_chart")!.labels[idx]]: val }), {});
          contextData = { ...contextData, insights };
        }
        
        const response = await callGeminiAPI(selectedGeminiPrompt, contextData);
        setGeminiResponse(response.response);
      };
      fetchGeminiAnalysis();
    }
  }, [selectedGeminiPrompt, kpis, charts, aiInsights, userProfile]); // Ensure all relevant data is a dependency

  // Inline styles for a modern, dark-themed dashboard (for self-contained demo)
  const dashboardStyle: React.CSSProperties = {
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    backgroundColor: '#1C1C21',
    color: '#E0E0E0',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    maxWidth: '1400px', // Increased max-width for more content
    margin: '2rem auto',
    border: '1px solid #3A3A40',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: '#282830',
    borderRadius: '8px',
    padding: '1.5rem',
    border: '1px solid #3A3A40',
  };

  const headerStyle: React.CSSProperties = {
    color: '#8BC34A', // A vibrant green for CDBI AI branding
    marginBottom: '1rem',
    fontSize: '2rem',
    fontWeight: 700,
    borderBottom: '2px solid #4CAF50',
    paddingBottom: '0.8rem',
    display: 'flex',
    alignItems: 'center',
  };

  const subHeaderStyle: React.CSSProperties = {
    color: '#E0E0E0',
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '1rem',
  };

  const kpiCardStyle: React.CSSProperties = {
    backgroundColor: '#383840',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    flex: '1 1 280px', // Flexible width for responsive layout
    minWidth: '280px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
    borderBottom: '3px solid transparent', // For dynamic color
  };

  const insightCardStyle: React.CSSProperties = {
    backgroundColor: '#383840',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    borderLeft: '5px solid', // Prominent left border for severity
  };

  const getSeverityColor = (severity: AIFinancialInsight['severity'] | KPI['trend']) => {
    switch (severity) {
      case "critical": return "#F44336"; // Red
      case "high": return "#FF5722";    // Deep Orange
      case "medium": return "#FFC107";   // Amber
      case "low": return "#8BC34A";      // Greenish
      case "up": return "#4CAF50";       // Green for positive trend
      case "down": return "#E53935";     // Red for negative trend
      case "stable": return "#9E9E9E";   // Grey for stable
      default: return "#B0B0B0";
    }
  };

  // Basic Chart Renderer (can be replaced by a library like Chart.js/Recharts in a real app)
  const ChartRenderer = ({ chart }: { chart: ChartData }) => {
    // This is a minimal textual representation. In a real app, this would be a full chart library.
    const renderChartContent = () => {
      if (chart.type === "pie" && chart.datasets[0]) {
        const total = chart.datasets[0].data.reduce((sum, v) => sum + v, 0);
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
              {chart.labels.map((label, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9em' }}>
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: Array.isArray(chart.datasets[0].backgroundColor) ? chart.datasets[0].backgroundColor[i] : chart.datasets[0].backgroundColor, marginRight: '10px' }}></span>
                  {label}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: '200px', flexGrow: 2 }}>
              {chart.labels.map((label, i) => (
                <div key={label} style={{ marginBottom: '6px', background: '#424242', borderRadius: '6px', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9em' }}>
                  <span>{label}:</span>
                  <span style={{ fontWeight: 'bold' }}>{chart.datasets[0].data[i].toFixed(2)} ({((chart.datasets[0].data[i] / total) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      // For line/bar, just list data
      return (
        <div style={{ overflowX: 'auto', maxHeight: '250px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
            <thead>
              <tr style={{ backgroundColor: '#3A3A40' }}>
                <th style={{ padding: '10px', borderBottom: '1px solid #555', textAlign: 'left', minWidth: '100px' }}>Period</th>
                {chart.datasets.map((ds, i) => (
                  <th key={i} style={{ padding: '10px', borderBottom: '1px solid #555', textAlign: 'right', minWidth: '120px' }}>{ds.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.labels.map((label, i) => (
                <tr key={i} style={{ '&:nth-child(even)': { backgroundColor: '#2F2F38' } }}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #3A3A40' }}>{label}</td>
                  {chart.datasets.map((ds, dsIdx) => (
                    <td key={dsIdx} style={{ padding: '8px', borderBottom: '1px solid #3A3A40', textAlign: 'right' }}>{ds.data[i]?.toFixed(2)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    return (
      <div style={{ ...sectionStyle, padding: '1.2rem', cursor: 'pointer', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out' }}
           onClick={() => setSelectedGeminiPrompt(chart.geminiAnalysisPrompt)}
           onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.5)'; }}
           onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'; }}
      >
        <h4 style={{ color: '#E0E0E0', fontSize: '1.2rem', marginBottom: '0.8rem' }}>
          {chart.title} <span style={{ color: '#4CAF50', fontSize: '0.7em', marginLeft: '0.5rem' }}>(Click for Gemini Analysis)</span>
        </h4>
        <p style={{ fontSize: '0.9em', color: '#B0B0B0', marginBottom: '1rem' }}>{chart.description}</p>
        <div style={{ minHeight: '220px', backgroundColor: '#383840', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B0B0B0', position: 'relative', overflow: 'hidden' }}>
          {/* Placeholder for actual chart rendering */}
          {renderChartContent()}
          <div style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '0.7em', color: '#8BC34A', fontWeight: 'bold' }}>CDBI AI Visualizer</div>
        </div>
      </div>
    );
  };


  if (loading) {
    return (
      <div style={{ ...dashboardStyle, alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <LedgersSVG className="animate-pulse w-24 h-24 mx-auto" />
        <h2 style={{ color: '#4CAF50', fontSize: '2rem', marginTop: '1.5rem' }}>CDBI AI is synthesizing your advanced financial intelligence...</h2>
        <p style={{ color: '#B0B0B0', fontSize: '1.1rem', marginTop: '0.8rem' }}>This powerful AI platform is built to solve real-world problems for banks and individuals alike.</p>
      </div>
    );
  }

  return (
    <div style={dashboardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h1 style={headerStyle}>
          <LedgersSVG className="inline-block w-12 h-12 mr-3 -mt-2" />
          CDBI AI Financial Ledger Dashboard
        </h1>
        <p style={{ color: '#B0B0B0', fontSize: '1.2rem' }}>
          Welcome, <strong style={{ color: '#4CAF50' }}>{userProfile?.name || 'CDBI AI User'}</strong> ({userProfile?.userType === 'individual' ? 'Valued Individual' : 'Enterprise Client'})
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={subHeaderStyle}>AI-Powered Key Performance Indicators</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'flex-start' }}>
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              style={{ ...kpiCardStyle, borderBottomColor: getSeverityColor(kpi.trend) }}
              onClick={() => setSelectedGeminiPrompt(kpi.geminiExplanationPrompt)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.6)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'; }}
            >
              <h3 style={{ fontSize: '1.3rem', color: '#4CAF50', marginBottom: '0.6rem' }}>{kpi.name}</h3>
              <p style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#E0E0E0' }}>
                {kpi.unit === "%" ? `${kpi.value.toLocaleString()}${kpi.unit}` : `${kpi.unit}${kpi.value.toLocaleString()}`}
              </p>
              <p style={{ fontSize: '1em', color: '#B0B0B0', marginTop: '0.6rem' }}>Trend: <span style={{ color: getSeverityColor(kpi.trend), fontWeight: 'bold' }}>{kpi.trend.toUpperCase()}</span></p>
              <p style={{ fontSize: '0.9em', color: '#909090', marginTop: '0.4rem' }}>{kpi.description}</p>
              <p style={{ fontSize: '0.75em', color: '#707070', marginTop: '0.8rem' }}>Last Updated: {kpi.lastUpdated.toLocaleDateString()} <span style={{ color: '#4CAF50', fontSize: '0.8em', marginLeft: '0.5rem' }}>(Click for Gemini Analysis)</span></p>
            </div>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={subHeaderStyle}>CDBI AI Insights & Recommendations</h2>
        {aiInsights.length === 0 ? (
          <p style={{ color: '#B0B0B0', fontSize: '1em' }}>
            No pressing AI insights at the moment. Your finances appear to be in good standing, continuously monitored by CDBI AI's advanced intelligence engine.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {aiInsights.map((insight) => (
              <div key={insight.id} style={{ ...insightCardStyle, borderLeftColor: getSeverityColor(insight.severity) }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem', color: getSeverityColor(insight.severity) }}>
                  {insight.type.replace(/_/g, ' ').toUpperCase()} <span style={{ fontSize: '0.9em', color: '#B0B0B0' }}>({insight.severity.toUpperCase()})</span>
                </h3>
                <p style={{ fontSize: '1em', color: '#E0E0E0', marginBottom: '0.6rem' }}>{insight.message}</p>
                {insight.recommendation && (
                  <p style={{ fontSize: '0.95em', color: '#B0B0B0', fontStyle: 'italic', lineHeight: '1.4' }}>
                    <strong style={{ color: '#8BC34A' }}>Recommendation:</strong> {insight.recommendation}
                  </p>
                )}
                <p style={{ fontSize: '0.8em', color: '#909090', marginTop: '1rem' }}>
                  Source: {insight.source} (Model: {insight.aiModelVersion})
                  {insight.aiConfidenceScore && ` | Confidence: ${(insight.aiConfidenceScore * 100).toFixed(0)}%`}
                </p>
                <p style={{ fontSize: '0.75em', color: '#707070' }}>
                  Timestamp: {insight.timestamp.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <h2 style={subHeaderStyle}>CDBI AI Interactive Charts & Visualizations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {charts.map((chart) => (
            <ChartRenderer key={chart.id} chart={chart} />
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={subHeaderStyle}>CDBI AI + Gemini Advanced Analysis</h2>
        <div style={{ minHeight: '200px', backgroundColor: '#383840', borderRadius: '8px', padding: '1.5rem', border: '2px solid #4CAF50', position: 'relative', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
          <p style={{ fontSize: '1em', color: '#B0B0B0', lineHeight: '1.6' }}>
            {geminiResponse || "Click on any KPI card or Chart title above to receive an instant, detailed, and AI-powered analysis from Google Gemini, seamlessly integrated with CDBI AI for unparalleled financial intelligence and strategic guidance."}
          </p>
          <div style={{ position: 'absolute', bottom: '10px', right: '15px', fontSize: '0.8em', color: '#8BC34A', fontWeight: 'bold' }}>Powered by Gemini</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8em', color: '#707070', borderTop: '1px solid #3A3A40', paddingTop: '1rem' }}>
        © {new Date().getFullYear()} CDBI AI Financial Solutions Inc. All rights reserved. The most advanced AI-powered financial platform, engineered to solve real-world problems for banks, enterprises, and individuals globally.
      </div>
    </div>
  );
}

// Export the main dashboard component as the default export for this file.
export default CDBIAIFinancialLedgerDashboard;
```