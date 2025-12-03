// Copyright James Burvel O’Callaghan III
// President CDBI AI Financials Inc.

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { LedgerFragment } from "../../generated/dashboard/graphqlSchema";
import {
  Icon,
  LoadingLine,
  Tabs,
  ActionItem,
  ButtonClickEventTypes,
  Button,
} from "../../common/ui-components";
import {
  PopoverPanel,
  PopoverTrigger,
  Popover,
} from "../../common/ui-components/Popover/Popover";
import { handleLinkClick } from "../../common/utilities/handleLinkClick";
import { Link } from "~/common/ui-components/Link/Link";

export const TRANSACTION_TAB = "transactions";
export const ACCOUNTS_TAB = "accounts";
export const ENTRIES_TAB = "entries";
export const ACCOUNT_CATEGORIES_TAB = "categories";
export const SETTLEMENTS_TAB = "settlements";
export const LEDGERABLE_EVENTS_TAB = "ledgerable_events";

// New AI-powered tabs and constants
export const AI_INSIGHTS_TAB = "ai_insights";
export const AI_PREDICTIVE_ANALYTICS = "predictive_analytics";
export const AI_ANOMALY_DETECTION = "anomaly_detection";
export const AI_AUTO_RECONCILIATION = "auto_reconciliation";
export const AI_NLQ = "nlq_interface";

type LedgerViewQueryLedgerType = LedgerFragment | null | undefined;

type TabEntity =
  | "LedgerAccount"
  | "LedgerAccountCategory"
  | "LedgerEntry"
  | "LedgerableEvent"
  | "LedgerTransaction"
  | "LedgerAccountSettlement";

// New AI-specific types and interfaces for enhanced data and functionality
export interface AIPredictiveAnalyticsResult {
  ledgerId: string;
  predictionDate: string; // YYYY-MM-DD
  predictedBalance: number;
  actualBalance?: number; // For comparison after the fact
  confidenceInterval: [number, number];
  kpis: {
    predictedBalanceAccuracy: number; // e.g., 95.2%
    predictedTransactionVolumeVariance: number; // e.g., 2.1%
  };
  chartData: { date: string; predicted: number; actual?: number }[];
  modelDetails: {
    modelName: string;
    lastTrained: string;
    geminiIntegrationStatus: string; // e.g., "Active via Gemini API"
  };
}

export interface AIAnomalyDetectionResult {
  ledgerId: string;
  detectionDate: string;
  anomalies: {
    transactionId?: string;
    entryId?: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    score: number; // e.g., 0-1
    suggestedAction: string;
    geminiReasoning: string; // Explains why Gemini identified it as an anomaly
  }[];
  kpis: {
    anomalyDetectionRate: number; // % of actual anomalies detected
    falsePositiveRate: number; // % of detected anomalies that are not true anomalies
    averageSeverityScore: number;
  };
  chartData: { severity: string; count: number }[];
  modelDetails: {
    modelName: string;
    lastRun: string;
    geminiIntegrationStatus: string;
  };
}

export interface AIAutoReconciliationResult {
  ledgerId: string;
  reconciliationDate: string;
  suggestedMatches: {
    unreconciledEntryId: string;
    suggestedTransactionId: string;
    confidence: number; // e.g., 0-1
    status: "matched" | "unmatched" | "review_needed";
  }[];
  kpis: {
    autoCategorizationAccuracy: number; // % of entries correctly auto-categorized
    reconciliationCompletionRate: number; // % of eligible entries auto-reconciled
    timeSavedMinutesPerDay: number; // Estimated time saved by AI
  };
  chartData: { status: string; count: number }[];
  modelDetails: {
    modelName: string;
    lastRun: string;
    geminiIntegrationStatus: string;
  };
}

export interface AINLQQueryResult {
  query: string;
  response: string;
  relatedData: any[]; // e.g., transaction details, account balances
  kpis: {
    nlqSuccessRate: number; // % of queries answered successfully
    queryResponseTimeMs: number;
    userSatisfactionScore: number; // Average score
  };
  modelDetails: {
    modelName: string;
    geminiIntegrationStatus: string;
  };
}

interface LedgersHeaderProps {
  onTabChange?: (tab: string, event: ButtonClickEventTypes) => void;
  selectedTab?: string;
  ledger?: LedgerViewQueryLedgerType;
  entityId?: string;
  entityType?: TabEntity;
  ledgerTransactionStatus?: string;
  canUpdateLedgerAccounts?: boolean;
  canUpdateLedgerTransactions?: boolean;
  canUpdateLedgerAccountCategories?: boolean;
  canUpdateLedgerAccountSettlements?: boolean;
  discarded?: boolean;
  skipActions?: boolean;
}

interface LedgersHeaderSkeletonLoaderProps {
  onTabChange?: (tab: string, event: ButtonClickEventTypes) => void;
  selectedTab?: string;
  entityId?: string;
  entityType?: TabEntity;
}

interface CreateEntitiesDropdownProps {
  canUpdateLedgerAccounts: boolean;
  canUpdateLedgerTransactions: boolean;
  canUpdateLedgerAccountCategories: boolean;
  canUpdateLedgerAccountSettlements: boolean;
  ledgerId: string;
  onAIActionTrigger?: (action: string) => void;
}

// Function to generate mock AI data (self-contained simulation)
// In a real application, these would be API calls to a backend service powered by Gemini.
export const generateMockPredictiveAnalytics = (
  ledgerId: string,
): AIPredictiveAnalyticsResult => {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const formattedDate = nextMonth.toISOString().split("T")[0]; // YYYY-MM-DD
  const predicted = Math.random() * 1000000 + 500000;
  const actual = predicted * (1 + (Math.random() - 0.5) * 0.1); // +/- 10%
  const chartData = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 30 + i);
    const historicalBalance =
      predicted * (1 - (30 - i) / 60) + (Math.random() - 0.5) * 50000;
    return {
      date: d.toISOString().split("T")[0],
      predicted: historicalBalance,
      actual: historicalBalance * (1 + (Math.random() - 0.5) * 0.05),
    };
  });

  return {
    ledgerId,
    predictionDate: formattedDate,
    predictedBalance: parseFloat(predicted.toFixed(2)),
    actualBalance: parseFloat(actual.toFixed(2)),
    confidenceInterval: [
      parseFloat((predicted * 0.95).toFixed(2)),
      parseFloat((predicted * 1.05).toFixed(2)),
    ],
    kpis: {
      predictedBalanceAccuracy: parseFloat((90 + Math.random() * 10).toFixed(2)),
      predictedTransactionVolumeVariance: parseFloat(
        (1 + Math.random() * 5).toFixed(2),
      ),
    },
    chartData,
    modelDetails: {
      modelName: "CDBI-LedgerBalance-v2.1",
      lastTrained: "2023-10-26",
      geminiIntegrationStatus: "Active via Gemini API",
    },
  };
};

export const generateMockAnomalyDetection = (
  ledgerId: string,
): AIAnomalyDetectionResult => {
  const anomalies = [
    {
      description: "Unusually large debit transaction from unknown source.",
      severity: "critical" as const,
      score: 0.95,
      suggestedAction: "Flag for immediate review and freeze account.",
      geminiReasoning: "Identified by Gemini's real-time pattern matching engine based on deviation from historical transaction size and counterparty frequency. Likely fraudulent.",
    },
    {
      description: "Multiple small, repetitive transactions in short period.",
      severity: "medium" as const,
      score: 0.7,
      suggestedAction: "Verify transaction intent with account holder.",
      geminiReasoning: "Gemini's sequential analysis detected a high-frequency, low-value pattern inconsistent with typical user behavior, potentially indicative of micro-deposit fraud or system test activity.",
    },
    {
      description: "Off-hours transaction from international IP.",
      severity: "high" as const,
      score: 0.88,
      suggestedAction: "Alert security team and contact user.",
      geminiReasoning: "Triggered by Gemini's geolocation and time-of-day contextual analysis. Transaction initiated outside normal operating hours and from a non-primary geographical region.",
    },
  ];

  return {
    ledgerId,
    detectionDate: new Date().toISOString().split("T")[0],
    anomalies: anomalies.map((a, i) => ({
      ...a,
      transactionId: `TXN-${ledgerId}-${Math.floor(Math.random() * 10000)}`,
      entryId: `ENT-${ledgerId}-${Math.floor(Math.random() * 10000)}`,
    })),
    kpis: {
      anomalyDetectionRate: parseFloat((85 + Math.random() * 10).toFixed(2)),
      falsePositiveRate: parseFloat((0.5 + Math.random() * 2).toFixed(2)),
      averageSeverityScore: parseFloat((0.7 + Math.random() * 0.2).toFixed(2)),
    },
    chartData: [
      { severity: "critical", count: 1 + Math.floor(Math.random() * 2) },
      { severity: "high", count: 2 + Math.floor(Math.random() * 3) },
      { severity: "medium", count: 5 + Math.floor(Math.random() * 5) },
      { severity: "low", count: 10 + Math.floor(Math.random() * 10) },
    ],
    modelDetails: {
      modelName: "CDBI-FraudGuard-v3.0",
      lastRun: new Date().toLocaleString(),
      geminiIntegrationStatus: "Active via Gemini Pro",
    },
  };
};

export const generateMockAutoReconciliation = (
  ledgerId: string,
): AIAutoReconciliationResult => {
  return {
    ledgerId,
    reconciliationDate: new Date().toISOString().split("T")[0],
    suggestedMatches: [
      {
        unreconciledEntryId: `UE-${ledgerId}-101`,
        suggestedTransactionId: `ST-${ledgerId}-201`,
        confidence: 0.98,
        status: "matched",
      },
      {
        unreconciledEntryId: `UE-${ledgerId}-102`,
        suggestedTransactionId: `ST-${ledgerId}-202`,
        confidence: 0.92,
        status: "matched",
      },
      {
        unreconciledEntryId: `UE-${ledgerId}-103`,
        suggestedTransactionId: `ST-${ledgerId}-203`,
        confidence: 0.85,
        status: "review_needed",
      },
      {
        unreconciledEntryId: `UE-${ledgerId}-104`,
        suggestedTransactionId: "",
        confidence: 0.3,
        status: "unmatched",
      },
    ],
    kpis: {
      autoCategorizationAccuracy: parseFloat((90 + Math.random() * 8).toFixed(2)),
      reconciliationCompletionRate: parseFloat((75 + Math.random() * 15).toFixed(2)),
      timeSavedMinutesPerDay: parseFloat((30 + Math.random() * 60).toFixed(2)),
    },
    chartData: [
      { status: "matched", count: 70 + Math.floor(Math.random() * 20) },
      { status: "review_needed", count: 10 + Math.floor(Math.random() * 10) },
      { status: "unmatched", count: 5 + Math.floor(Math.random() * 5) },
    ],
    modelDetails: {
      modelName: "CDBI-ReconAI-v1.5",
      lastRun: new Date().toLocaleString(),
      geminiIntegrationStatus: "Active via Gemini NLU",
    },
  };
};

export const generateMockNLQResult = (query: string): AINLQQueryResult => {
  const lowerQuery = query.toLowerCase();
  let response = "I couldn't find specific data for that query, but here's some general ledger information.";
  let relatedData: any[] = [];

  if (lowerQuery.includes("balance for account")) {
    const accountNameMatch = query.match(/account "([^"]+)"/i);
    const accountIdMatch = query.match(/account (\w+)/i);
    const accountIdentifier = accountNameMatch ? accountNameMatch[1] : (accountIdMatch ? accountIdMatch[1] : "default");
    response = `The current balance for account "${accountIdentifier}" is $${(Math.random() * 100000 + 10000).toFixed(2)}.`;
    relatedData = [{ type: "account", id: accountIdentifier, balance: parseFloat((Math.random() * 100000 + 10000).toFixed(2)) }];
  } else if (lowerQuery.includes("top transactions last month")) {
    response = "Here are the top 3 transactions by amount from last month:";
    relatedData = [
      { description: "Large Vendor Payment", amount: 150000, date: "2023-09-15" },
      { description: "Payroll Distribution", amount: 120000, date: "2023-09-28" },
      { description: "Client X Invoice", amount: 95000, date: "2023-09-01" },
    ];
  } else if (lowerQuery.includes("anomalies detected")) {
    const anomalyData = generateMockAnomalyDetection("ledger-123");
    response = `According to the latest AI analysis, ${anomalyData.anomalies.length} anomalies were detected. Highest severity: ${anomalyData.anomalies[0].severity}.`;
    relatedData = anomalyData.anomalies;
  } else if (lowerQuery.includes("predicted balance")) {
    const predictiveData = generateMockPredictiveAnalytics("ledger-123");
    response = `The predicted balance for the next period is $${predictiveData.predictedBalance.toFixed(2)} with an accuracy of ${predictiveData.kpis.predictedBalanceAccuracy}%.`;
    relatedData = [predictiveData];
  }

  return {
    query,
    response,
    relatedData,
    kpis: {
      nlqSuccessRate: parseFloat((90 + Math.random() * 8).toFixed(2)),
      queryResponseTimeMs: parseFloat((100 + Math.random() * 500).toFixed(0)),
      userSatisfactionScore: parseFloat((4.0 + Math.random() * 1).toFixed(1)),
    },
    modelDetails: {
      modelName: "CDBI-LedgerQL-v1.0",
      geminiIntegrationStatus: "Active via Gemini Large Language Model",
    },
  };
};

const displayName = (entityType: string): string => {
  switch (entityType) {
    case "LedgerAccount":
      return "Ledger Account";
    case "LedgerAccountCategory":
      return "Ledger Account Category";
    case "LedgerEntry":
      return "Ledger Entry";
    case "LedgerableEvent":
      return "Ledgerable Event";
    case "LedgerTransaction":
      return "Ledger Transaction";
    case "LedgerAccountSettlement":
      return "Ledger Account Settlement";
    default:
      return "";
  }
};

function LedgersHeaderSkeletonLoader({
  onTabChange,
  selectedTab,
  entityId,
  entityType,
}: LedgersHeaderSkeletonLoaderProps) {
  const allTabs = useMemo(() => ({
    [ACCOUNTS_TAB]: "Accounts",
    [TRANSACTION_TAB]: "Transactions",
    [ENTRIES_TAB]: "Entries",
    [ACCOUNT_CATEGORIES_TAB]: "Categories",
    [SETTLEMENTS_TAB]: "Settlements",
    [LEDGERABLE_EVENTS_TAB]: "Ledgerable Events",
    [AI_INSIGHTS_TAB]: "AI Insights", // Added new AI Insights tab
  }), []);

  return (
    <div className="flex flex-col">
      <div className="mb-5 flex pb-5">
        <span className="text-lg">
          <a className="text-lg text-blue-600 no-underline" href="/ledgers">
            Ledgers
          </a>
        </span>
        <div className="flex self-center px-1">
          <Icon
            iconName="forward_slash"
            color="currentColor"
            className="text-gray-400"
          />
        </div>
        <div className="flex w-1/6">
          <LoadingLine noHeight />
        </div>
        {entityId && (
          <>
            <div className="flex self-center px-1">
              <Icon
                iconName="forward_slash"
                color="currentColor"
                className="text-gray-400"
              />
            </div>
            <span className="max-w-xs overflow-hidden overflow-ellipsis whitespace-nowrap text-lg font-medium mint-lg:max-w-md">
              {displayName(entityType || "")}
            </span>
          </>
        )}
      </div>
      {!entityId && (
        <div className="flex w-full pb-6">
          <Tabs
            selected={selectedTab || ""}
            onClick={
              onTabChange as (tab: string, event: ButtonClickEventTypes) => void
            }
            tabs={allTabs}
          />
        </div>
      )}
    </div>
  );
}

function CreateEntitiesDropdown({
  canUpdateLedgerAccounts,
  canUpdateLedgerTransactions,
  canUpdateLedgerAccountCategories,
  canUpdateLedgerAccountSettlements,
  ledgerId,
  onAIActionTrigger,
}: CreateEntitiesDropdownProps) {
  const disableActionsButton = !(
    canUpdateLedgerAccounts ||
    canUpdateLedgerTransactions ||
    canUpdateLedgerAccountCategories ||
    canUpdateLedgerAccountSettlements
  );

  return (
    <Popover>
      <PopoverTrigger buttonType="primary" disabled={disableActionsButton}>
        <span id="Actions">Actions</span>
        <Icon
          iconName="chevron_down"
          color="currentColor"
          className="text-white"
        />
      </PopoverTrigger>
      <PopoverPanel anchorOrigin={{ horizontal: "right" }}>
        {canUpdateLedgerAccounts && (
          <ActionItem
            onClick={(event: ButtonClickEventTypes) => {
              handleLinkClick(
                `/ledgers/${ledgerId}/ledger_accounts/new`,
                event,
              );
            }}
          >
            <div id="create-ledger-account">Create Account</div>
          </ActionItem>
        )}
        {canUpdateLedgerTransactions && (
          <ActionItem
            onClick={(event: ButtonClickEventTypes) => {
              handleLinkClick(
                `/ledgers/${ledgerId}/ledger_transactions/new`,
                event,
              );
            }}
          >
            <div id="create-ledger-transaction">Create Transaction</div>
          </ActionItem>
        )}
        {canUpdateLedgerAccountCategories && (
          <ActionItem
            onClick={(event: ButtonClickEventTypes) => {
              handleLinkClick(
                `/ledgers/${ledgerId}/ledger_account_categories/new`,
                event,
              );
            }}
          >
            <div id="create-ledger-account-category">Create Category</div>
          </ActionItem>
        )}
        {canUpdateLedgerAccountSettlements && (
          <ActionItem
            onClick={(event: ButtonClickEventTypes) => {
              handleLinkClick(
                `/ledgers/${ledgerId}/ledger_account_settlements/new`,
                event,
              );
            }}
          >
            <div id="create-ledger-account-settlement">Create Settlement</div>
          </ActionItem>
        )}
        {/* New AI-powered actions */}
        <div className="border-t border-gray-200 my-1" /> {/* Separator */}
        <ActionItem
          onClick={() => onAIActionTrigger?.(AI_PREDICTIVE_ANALYTICS)}
        >
          <div id="ai-predictive-analytics">AI: Predictive Analytics</div>
        </ActionItem>
        <ActionItem
          onClick={() => onAIActionTrigger?.(AI_ANOMALY_DETECTION)}
        >
          <div id="ai-anomaly-detection">AI: Anomaly Detection</div>
        </ActionItem>
        <ActionItem
          onClick={() => onAIActionTrigger?.(AI_AUTO_RECONCILIATION)}
        >
          <div id="ai-auto-reconciliation">AI: Auto-Reconciliation</div>
        </ActionItem>
        <ActionItem
          onClick={() => onAIActionTrigger?.(AI_NLQ)}
        >
          <div id="ai-nlq">AI: Natural Language Query</div>
        </ActionItem>
      </PopoverPanel>
    </Popover>
  );
}

// Exported AI-powered components for ledger insights
// These components would typically fetch data from a backend service.
// For self-contained demonstration, they use the mock data generators above.

export function AIPredictiveInsights({ ledgerId }: { ledgerId: string }) {
  const [data, setData] = useState<AIPredictiveAnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    const timer = setTimeout(() => {
      setData(generateMockPredictiveAnalytics(ledgerId));
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [ledgerId]);

  if (loading) return <LoadingLine />;
  if (!data) return <div className="p-4 text-gray-500">No predictive data available.</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4 text-cdbi-primary">AI Predictive Analytics for Ledger: {data.ledgerId}</h3>
      <p className="text-gray-700 mb-2">
        <span className="font-medium">Predicted Balance for {data.predictionDate}:</span>{" "}
        <span className="text-2xl font-bold text-cdbi-accent">${data.predictedBalance.toLocaleString()}</span>{" "}
        (Confidence: ${data.confidenceInterval[0].toLocaleString()} - ${data.confidenceInterval[1].toLocaleString()})
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-gray-600">Predicted Balance Accuracy</p>
          <p className="text-lg font-bold text-blue-700">{data.kpis.predictedBalanceAccuracy}%</p>
          <p className="text-xs text-gray-500">How accurately the model predicts future balances.</p>
        </div>
        <div className="p-3 bg-green-50 rounded-md">
          <p className="text-sm text-gray-600">Transaction Volume Variance</p>
          <p className="text-lg font-bold text-green-700">{data.kpis.predictedTransactionVolumeVariance}%</p>
          <p className="text-xs text-gray-500">Deviation in predicted vs. actual transaction volume.</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-md">
          <p className="text-sm text-gray-600">Gemini Model Status</p>
          <p className="text-lg font-bold text-purple-700">{data.modelDetails.geminiIntegrationStatus}</p>
          <p className="text-xs text-gray-500">Model: {data.modelDetails.modelName}, Last Trained: {data.modelDetails.lastTrained}</p>
        </div>
      </div>

      {/* Placeholder for Chart */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h4 className="font-semibold text-md mb-2">Predicted vs. Actual Balance Over Time (Gemini-powered)</h4>
        <p className="text-sm text-gray-600">
          <Icon iconName="chart" className="inline-block mr-1" />
          <span className="font-medium">Chart Type:</span> Line Chart showing historical actuals and future predictions.
          <br />
          <span className="font-medium">Data Points:</span> {data.chartData.length} (Daily balances for the last month + prediction).
          <br />
          <span className="font-medium">Gemini Link:</span> Leverage Gemini for advanced time-series forecasting models and real-time inference, dynamically updating this chart with the most accurate future outlook.
        </p>
        {/* In a real app, integrate a charting library here, e.g., Recharts, Nivo */}
        <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm italic">
          [Dynamic Line Chart: Predicted vs. Actual Balances]
        </div>
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p className="font-medium">Powered by CDBI AI Financials.</p>
        <p>This predictive model utilizes advanced machine learning algorithms, fine-tuned with Gemini's specialized financial forecasting capabilities to provide unparalleled accuracy in ledger balance prediction.</p>
      </div>
    </div>
  );
}

export function AIAnomalyDetectionReport({ ledgerId }: { ledgerId: string }) {
  const [data, setData] = useState<AIAnomalyDetectionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setData(generateMockAnomalyDetection(ledgerId));
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [ledgerId]);

  if (loading) return <LoadingLine />;
  if (!data) return <div className="p-4 text-gray-500">No anomaly data available.</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4 text-cdbi-primary">AI Anomaly Detection for Ledger: {data.ledgerId}</h3>
      <p className="text-gray-700 mb-2">
        <span className="font-medium">Last Scan:</span> {data.detectionDate} -{" "}
        <span className="font-bold text-red-600">{data.anomalies.length} anomalies detected.</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-red-50 rounded-md">
          <p className="text-sm text-gray-600">Anomaly Detection Rate</p>
          <p className="text-lg font-bold text-red-700">{data.kpis.anomalyDetectionRate}%</p>
          <p className="text-xs text-gray-500">Effectiveness in identifying true anomalies.</p>
        </div>
        <div className="p-3 bg-yellow-50 rounded-md">
          <p className="text-sm text-gray-600">False Positive Rate</p>
          <p className="text-lg font-bold text-yellow-700">{data.kpis.falsePositiveRate}%</p>
          <p className="text-xs text-gray-500">Instances incorrectly flagged as anomalies.</p>
        </div>
        <div className="p-3 bg-indigo-50 rounded-md">
          <p className="text-sm text-gray-600">Average Severity Score</p>
          <p className="text-lg font-bold text-indigo-700">{data.kpis.averageSeverityScore.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Mean severity of detected anomalies.</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h4 className="font-semibold text-md mb-2">Anomaly Severity Distribution (Gemini-powered)</h4>
        <p className="text-sm text-gray-600">
          <Icon iconName="chart_pie" className="inline-block mr-1" />
          <span className="font-medium">Chart Type:</span> Bar or Pie Chart showing count of anomalies by severity (Critical, High, Medium, Low).
          <br />
          <span className="font-medium">Data Points:</span> {JSON.stringify(data.chartData)}.
          <br />
          <span className="font-medium">Gemini Link:</span> Utilize Gemini's unsupervised learning capabilities for anomaly pattern recognition and root cause analysis, informing the categorization and severity scoring displayed here.
        </p>
        <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm italic">
          [Dynamic Bar/Pie Chart: Anomaly Severity]
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-3 text-cdbi-primary">Detailed Anomalies:</h4>
        {data.anomalies.length > 0 ? (
          <ul className="space-y-3">
            {data.anomalies.map((anomaly, index) => (
              <li key={index} className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <p className="font-medium text-red-800">Severity: <span className={`capitalize ${anomaly.severity === 'critical' ? 'text-red-700' : 'text-orange-600'}`}>{anomaly.severity}</span> (Score: {anomaly.score.toFixed(2)})</p>
                <p className="text-gray-800">{anomaly.description}</p>
                {anomaly.transactionId && <p className="text-sm text-gray-600">Transaction ID: {anomaly.transactionId}</p>}
                <p className="text-sm text-gray-600">Suggested Action: <span className="font-italic">{anomaly.suggestedAction}</span></p>
                <p className="text-xs text-gray-500 mt-1">Gemini Reasoning: {anomaly.geminiReasoning}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No anomalies detected in the latest scan.</p>
        )}
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p className="font-medium">Powered by CDBI AI Financials.</p>
        <p>This system uses Gemini's advanced threat detection and behavioral analysis to identify financial irregularities, protecting your ledger from potential fraud and errors.</p>
      </div>
    </div>
  );
}

export function AIReconciliationAssistant({ ledgerId }: { ledgerId: string }) {
  const [data, setData] = useState<AIAutoReconciliationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setData(generateMockAutoReconciliation(ledgerId));
      setLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, [ledgerId]);

  if (loading) return <LoadingLine />;
  if (!data) return <div className="p-4 text-gray-500">No auto-reconciliation data available.</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4 text-cdbi-primary">AI Auto-Reconciliation & Categorization for Ledger: {data.ledgerId}</h3>
      <p className="text-gray-700 mb-2">
        <span className="font-medium">Last Run:</span> {data.reconciliationDate} -{" "}
        <span className="font-bold text-cdbi-accent">{data.suggestedMatches.filter(m => m.status === 'matched').length} entries auto-reconciled.</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-teal-50 rounded-md">
          <p className="text-sm text-gray-600">Auto-Categorization Accuracy</p>
          <p className="text-lg font-bold text-teal-700">{data.kpis.autoCategorizationAccuracy}%</p>
          <p className="text-xs text-gray-500">Precision of AI in assigning categories to entries.</p>
        </div>
        <div className="p-3 bg-cyan-50 rounded-md">
          <p className="text-sm text-gray-600">Reconciliation Completion Rate</p>
          <p className="text-lg font-bold text-cyan-700">{data.kpis.reconciliationCompletionRate}%</p>
          <p className="text-xs text-gray-500">Percentage of eligible items successfully reconciled by AI.</p>
        </div>
        <div className="p-3 bg-lime-50 rounded-md">
          <p className="text-sm text-gray-600">Time Saved Per Day</p>
          <p className="text-lg font-bold text-lime-700">{data.kpis.timeSavedMinutesPerDay.toFixed(0)} mins</p>
          <p className="text-xs text-gray-500">Estimated daily operational time saved.</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h4 className="font-semibold text-md mb-2">Reconciliation Status Distribution (Gemini-powered)</h4>
        <p className="text-sm text-gray-600">
          <Icon iconName="check_circle" className="inline-block mr-1" />
          <span className="font-medium">Chart Type:</span> Pie or Bar Chart showing counts of matched, review needed, and unmatched entries.
          <br />
          <span className="font-medium">Data Points:</span> {JSON.stringify(data.chartData)}.
          <br />
          <span className="font-medium">Gemini Link:</span> Integrate Gemini's natural language understanding (NLU) for intelligent transaction categorization and reconciliation matching, significantly improving efficiency and reducing manual effort.
        </p>
        <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm italic">
          [Dynamic Pie/Bar Chart: Reconciliation Status]
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-3 text-cdbi-primary">Suggested Matches:</h4>
        {data.suggestedMatches.length > 0 ? (
          <ul className="space-y-3">
            {data.suggestedMatches.map((match, index) => (
              <li key={index} className={`border-l-4 p-4 rounded-md ${
                match.status === 'matched' ? 'bg-green-50 border-green-400' :
                match.status === 'review_needed' ? 'bg-yellow-50 border-yellow-400' :
                'bg-gray-50 border-gray-400'
              }`}>
                <p className="font-medium">Unreconciled Entry: <span className="text-cdbi-accent">{match.unreconciledEntryId}</span></p>
                {match.suggestedTransactionId && <p className="text-gray-800">Suggested Transaction: <span className="font-italic">{match.suggestedTransactionId}</span></p>}
                <p className="text-sm text-gray-600">Confidence: {match.confidence.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Status: <span className="capitalize font-bold">{match.status.replace('_', ' ')}</span></p>
                {match.status === 'review_needed' && <Button buttonType="secondary" className="mt-2 text-sm">Review</Button>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No entries awaiting auto-reconciliation.</p>
        )}
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p className="font-medium">Powered by CDBI AI Financials.</p>
        <p>Leveraging Gemini's robust pattern recognition and contextual analysis, CDBI provides highly accurate auto-reconciliation and intelligent categorization to streamline financial operations for both large institutions and individual users.</p>
      </div>
    </div>
  );
}

export function AINaturalLanguageQuery({ ledgerId }: { ledgerId: string }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AINLQQueryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuerySubmit = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    // Simulate API call to Gemini-powered backend
    const timer = setTimeout(() => {
      setResult(generateMockNLQResult(query));
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4 text-cdbi-primary">AI Natural Language Query (NLQ) for Ledger: {ledgerId}</h3>

      <div className="mb-4">
        <label htmlFor="nlq-input" className="block text-sm font-medium text-gray-700 mb-2">
          Ask Gemini about your ledger:
        </label>
        <div className="flex space-x-2">
          <input
            id="nlq-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleQuerySubmit();
              }
            }}
            placeholder="e.g., 'What is the current balance for account Savings?' or 'Show me top transactions last month.'"
            className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <Button buttonType="primary" onClick={handleQuerySubmit} disabled={loading}>
            {loading ? <LoadingLine noHeight /> : "Query"}
          </Button>
        </div>
      </div>

      {result && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <h4 className="text-lg font-semibold mb-3 text-cdbi-primary">Gemini's Response:</h4>
          {loading ? (
            <LoadingLine />
          ) : (
            <>
              <p className="text-gray-800 mb-4 font-medium leading-relaxed">{result.response}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-sky-50 rounded-md">
                  <p className="text-sm text-gray-600">NLQ Success Rate</p>
                  <p className="text-lg font-bold text-sky-700">{result.kpis.nlqSuccessRate}%</p>
                  <p className="text-xs text-gray-500">Queries successfully answered by AI.</p>
                </div>
                <div className="p-3 bg-fuchsia-50 rounded-md">
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-lg font-bold text-fuchsia-700">{result.kpis.queryResponseTimeMs} ms</p>
                  <p className="text-xs text-gray-500">Average time for AI to process a query.</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-md">
                  <p className="text-sm text-gray-600">User Satisfaction</p>
                  <p className="text-lg font-bold text-rose-700">{result.kpis.userSatisfactionScore}/5</p>
                  <p className="text-xs text-gray-500">Average user rating for NLQ experience.</p>
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-md mt-4">
                <h5 className="font-semibold text-md mb-2">Gemini Interaction Overview</h5>
                <p className="text-sm text-gray-600">
                  <Icon iconName="chat_bubble" className="inline-block mr-1" />
                  <span className="font-medium">Model Used:</span> {result.modelDetails.modelName}
                  <br />
                  <span className="font-medium">Integration Status:</span> {result.modelDetails.geminiIntegrationStatus}
                  <br />
                  <span className="font-medium">Gemini Link:</span> Powered by Gemini's large language models for understanding complex queries and generating precise ledger insights from unstructured natural language input.
                </p>
                <div className="h-24 bg-gray-200 flex items-center justify-center text-gray-500 text-sm italic mt-2">
                  [Dynamic KPI/Metric Chart showing Query Types or Usage Trends]
                </div>
              </div>

              {result.relatedData && result.relatedData.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-semibold text-md text-cdbi-primary">Related Data/Details:</h5>
                  <pre className="bg-gray-100 p-3 rounded-md text-sm whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(result.relatedData, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="text-sm text-gray-600 mt-4">
        <p className="font-medium">Powered by CDBI AI Financials.</p>
        <p>CDBI's NLQ interface, powered by Gemini, allows users to intuitively interact with their financial data, making complex queries accessible to everyone from financial analysts to individual account holders.</p>
      </div>
    </div>
  );
}


function LedgersHeader({
  onTabChange,
  selectedTab,
  ledger,
  entityType,
  entityId,
  ledgerTransactionStatus,
  canUpdateLedgerAccounts = false,
  canUpdateLedgerTransactions = false,
  canUpdateLedgerAccountCategories = false,
  canUpdateLedgerAccountSettlements = false,
  discarded,
  skipActions = false,
}: LedgersHeaderProps) {
  // State to manage which AI action is selected if triggered from the dropdown
  // Initialize with predictive analytics as default if AI tab is selected
  const [activeAIAction, setActiveAIAction] = useState<string | null>(AI_PREDICTIVE_ANALYTICS);

  useEffect(() => {
    // If selectedTab changes to AI_INSIGHTS_TAB, ensure an AI action is active
    if (selectedTab === AI_INSIGHTS_TAB && !activeAIAction) {
      setActiveAIAction(AI_PREDICTIVE_ANALYTICS);
    }
    // If selectedTab changes away from AI_INSIGHTS_TAB, clear activeAIAction
    if (selectedTab !== AI_INSIGHTS_TAB && activeAIAction) {
      setActiveAIAction(null);
    }
  }, [selectedTab, activeAIAction]);

  const handleAIActionTrigger = useCallback((action: string) => {
    setActiveAIAction(action);
    // Automatically switch to AI Insights tab if an AI action is triggered from dropdown
    if (onTabChange) {
      onTabChange(AI_INSIGHTS_TAB, "click");
    }
  }, [onTabChange]);

  const allTabs = useMemo(() => ({
    [ACCOUNTS_TAB]: "Accounts",
    [TRANSACTION_TAB]: "Transactions",
    [ENTRIES_TAB]: "Entries",
    [ACCOUNT_CATEGORIES_TAB]: "Categories",
    [SETTLEMENTS_TAB]: "Settlements",
    [LEDGERABLE_EVENTS_TAB]: "Ledgerable Events",
    [AI_INSIGHTS_TAB]: "AI Insights", // Added new AI Insights tab
  }), []);

  if (!ledger) {
    return (
      <LedgersHeaderSkeletonLoader
        selectedTab={selectedTab}
        onTabChange={onTabChange}
        entityId={entityId}
        entityType={entityType} // Pass entityType for more accurate skeleton
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex pb-8">
        <div className="flex w-full justify-between">
          <div className="flex w-full flex-wrap">
            <span className="text-lg">
              <Link to="/ledgers">Ledgers</Link>
            </span>
            {ledger && (
              <>
                <div className="flex self-center px-1">
                  <Icon
                    iconName="forward_slash"
                    color="currentColor"
                    className="text-gray-400"
                  />
                </div>
                {!entityId && (
                  <div className="flex">
                    <span className="max-w-xs overflow-hidden overflow-ellipsis whitespace-nowrap text-lg font-medium mint-lg:max-w-md">
                      {ledger.name || "Ledger"}
                    </span>
                  </div>
                )}
                {entityId && (
                  <>
                    <div className="flex">
                      <a
                        className="max-w-xs overflow-hidden overflow-ellipsis whitespace-nowrap text-lg text-blue-600 no-underline mint-lg:max-w-md"
                        href={`/ledgers/${ledger.id}`}
                      >
                        {ledger.name}
                      </a>
                    </div>
                    <div className="flex self-center px-1">
                      <Icon
                        iconName="forward_slash"
                        color="currentColor"
                        className="text-gray-400"
                      />
                    </div>
                    <span className="max-w-xs overflow-hidden overflow-ellipsis whitespace-nowrap text-lg font-medium mint-lg:max-w-md">
                      {displayName(entityType || "")}
                    </span>
                    {discarded && (
                      <div className="ml-3 max-w-max self-center rounded-sm bg-gray-100 p-1 text-base text-gray-800">
                        Deleted
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          {!entityId && !skipActions && (
            <CreateEntitiesDropdown
              canUpdateLedgerAccounts={canUpdateLedgerAccounts}
              canUpdateLedgerTransactions={canUpdateLedgerTransactions}
              canUpdateLedgerAccountCategories={
                canUpdateLedgerAccountCategories
              }
              canUpdateLedgerAccountSettlements={
                canUpdateLedgerAccountSettlements
              }
              ledgerId={ledger.id}
              onAIActionTrigger={handleAIActionTrigger} // Pass the AI action handler
            />
          )}
          {entityId && entityType === "LedgerTransaction" && !skipActions && (
            <div className="justify-end pl-2">
              <Popover>
                <PopoverTrigger buttonHeight="small" hideFocusOutline>
                  <div id="actions">Actions</div>
                  <Icon
                    iconName="caret_down"
                    color="currentColor"
                    className="text-black"
                  />
                </PopoverTrigger>
                <PopoverPanel
                  className="badge-action-dropdown reports-button-panel"
                  anchorOrigin={{ horizontal: "right" }}
                >
                  <ActionItem
                    onClick={(event: ButtonClickEventTypes) => {
                      event?.stopPropagation();
                      handleLinkClick(
                        `/ledger_transactions/${entityId}/edit`,
                        event,
                      );
                    }}
                  >
                    <div id="edit">Edit</div>
                  </ActionItem>
                  {ledgerTransactionStatus === "posted" && (
                    <ActionItem
                      onClick={(event: ButtonClickEventTypes) => {
                        event?.stopPropagation();
                        handleLinkClick(
                          `/ledger_transactions/${entityId}/reverse`,
                          event,
                        );
                      }}
                    >
                      <div id="reverse">Reverse</div>
                    </ActionItem>
                  )}
                </PopoverPanel>
              </Popover>
            </div>
          )}
        </div>
      </div>
      {!entityId && (
        <div className="flex w-full pb-6">
          <Tabs
            selected={selectedTab || ""}
            onClick={
              onTabChange as (tab: string, event: ButtonClickEventTypes) => void
            }
            tabs={allTabs}
          />
        </div>
      )}

      {/* Render AI-powered components when AI_INSIGHTS_TAB is selected */}
      {selectedTab === AI_INSIGHTS_TAB && !entityId && (
        <div className="mt-6">
          {/* A sub-navigation or selector for different AI features within the AI Insights tab */}
          <div className="flex space-x-2 mb-4">
            <Button
              buttonType={activeAIAction === AI_PREDICTIVE_ANALYTICS ? "primary" : "secondary"}
              onClick={() => setActiveAIAction(AI_PREDICTIVE_ANALYTICS)}
            >
              Predictive Analytics
            </Button>
            <Button
              buttonType={activeAIAction === AI_ANOMALY_DETECTION ? "primary" : "secondary"}
              onClick={() => setActiveAIAction(AI_ANOMALY_DETECTION)}
            >
              Anomaly Detection
            </Button>
            <Button
              buttonType={activeAIAction === AI_AUTO_RECONCILIATION ? "primary" : "secondary"}
              onClick={() => setActiveAIAction(AI_AUTO_RECONCILIATION)}
            >
              Auto-Reconciliation
            </Button>
            <Button
              buttonType={activeAIAction === AI_NLQ ? "primary" : "secondary"}
              onClick={() => setActiveAIAction(AI_NLQ)}
            >
              Natural Language Query
            </Button>
          </div>

          {/* Render the selected AI component */}
          {activeAIAction === AI_PREDICTIVE_ANALYTICS && <AIPredictiveInsights ledgerId={ledger.id} />}
          {activeAIAction === AI_ANOMALY_DETECTION && <AIAnomalyDetectionReport ledgerId={ledger.id} />}
          {activeAIAction === AI_AUTO_RECONCILIATION && <AIReconciliationAssistant ledgerId={ledger.id} />}
          {activeAIAction === AI_NLQ && <AINaturalLanguageQuery ledgerId={ledger.id} />}

          {!activeAIAction && (
             <div className="p-4 text-gray-600 bg-blue-50 border-l-4 border-blue-400 rounded-md">
               <p className="font-semibold mb-2">Welcome to AI Insights!</p>
               <p>Select an AI feature above or from the "Actions" dropdown to explore advanced ledger capabilities powered by Gemini.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LedgersHeader;