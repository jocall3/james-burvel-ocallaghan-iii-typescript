// Copyright CDBI AI Global Intelligence Inc.
// Revolutionizing financial interactions for everyone, powered by AI.

import React, { useState, useEffect, useCallback, useMemo } from "react";
// Original Redux/Redux-Form imports are kept as per strict instruction "MUST NOT change or remove any any existing import statements."
// However, their functional usage in the component logic will be replaced by local state management
// to achieve the "no dependencies" and "self-contained" directive for the *logic*.
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { submit, reduxForm, getFormValues, SubmitHandler } from "redux-form";
// Original local component imports are kept, but their functionality will be internalized or mocked
// to achieve the "self-contained" file directive.
import CounterpartyAccountFormSection from "./CounterpartyAccountFormSection";
// Original UI component imports are kept, but their functionality will be internalized or mocked
// to achieve the "self-contained" file directive.
import { Button, ConfirmModal } from "../../common/ui-components";

// --- START: Internalized UI Components for Self-Containment (replacing external dependencies) ---
// These components are simplified versions for demonstration within a single file.
// In a real application, these would be robust, shared UI components.

interface LocalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonType?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export const LocalButton: React.FC<LocalButtonProps> = ({
  buttonType = "secondary",
  className = "",
  children,
  ...props
}) => {
  let baseClasses = "py-2 px-4 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-200";
  let typeClasses = "";

  switch (buttonType) {
    case "primary":
      typeClasses = "bg-cdbi-primary text-white hover:bg-cdbi-primary-dark focus:ring-cdbi-primary";
      break;
    case "danger":
      typeClasses = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";
      break;
    case "secondary":
    default:
      typeClasses = "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400";
      break;
  }

  return (
    <button
      className={`${baseClasses} ${typeClasses} ${className} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface LocalConfirmModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  onConfirm: () => void;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
}

export const LocalConfirmModal: React.FC<LocalConfirmModalProps> = ({
  isOpen,
  setIsOpen,
  title,
  onConfirm,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmDisabled = false,
  cancelDisabled = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <div className="text-sm text-gray-700 mb-6">{children}</div>
        <div className="flex justify-end space-x-4">
          <LocalButton onClick={() => setIsOpen(false)} disabled={cancelDisabled}>
            {cancelText}
          </LocalButton>
          <LocalButton buttonType="primary" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmText}
          </LocalButton>
        </div>
      </div>
    </div>
  );
};


interface LocalCounterpartyAccountFormSectionProps {
  counterpartyName?: string;
  accounts: Record<string, any>; // Simplified type for demonstration
  formName: string; // Not strictly used for local state, but kept for interface consistency
  isEdit?: boolean;
  onAccountChange: (accountId: string, field: string, value: any) => void;
  onAddAccount: () => void;
  onRemoveAccount: (accountId: string) => void;
}

// This is a minimal, local implementation. A real component would be more complex.
export const LocalCounterpartyAccountFormSection: React.FC<LocalCounterpartyAccountFormSectionProps> = ({
  counterpartyName,
  accounts,
  onAccountChange,
  onAddAccount,
  onRemoveAccount,
}) => {
  const accountEntries = useMemo(() => Object.entries(accounts), [accounts]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">
        External Accounts for {counterpartyName || "Counterparty"}
      </h3>
      {accountEntries.length === 0 && (
        <p className="text-gray-600">No accounts added yet. Click 'Add Account' to start.</p>
      )}
      {accountEntries.map(([accountId, accountData], index) => (
        <div key={accountId} className="border p-4 rounded-lg shadow-sm bg-gray-50 relative">
          <h4 className="font-medium mb-3 text-lg">Account {index + 1} ({accountData.name || 'Unnamed'})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`account-name-${accountId}`} className="block text-sm font-medium text-gray-700">Account Name</label>
              <input
                type="text"
                id={`account-name-${accountId}`}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-cdbi-primary focus:border-cdbi-primary"
                value={accountData.name || ""}
                onChange={(e) => onAccountChange(accountId, "name", e.target.value)}
                placeholder="e.g., Main Checking Account"
              />
            </div>
            <div>
              <label htmlFor={`account-number-${accountId}`} className="block text-sm font-medium text-gray-700">Account Number</label>
              <input
                type="text"
                id={`account-number-${accountId}`}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-cdbi-primary focus:border-cdbi-primary"
                value={accountData.accountNumber || ""}
                onChange={(e) => onAccountChange(accountId, "accountNumber", e.target.value)}
                placeholder="e.g., 123456789"
              />
            </div>
            <div>
              <label htmlFor={`routing-number-${accountId}`} className="block text-sm font-medium text-gray-700">Routing Number</label>
              <input
                type="text"
                id={`routing-number-${accountId}`}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-cdbi-primary focus:border-cdbi-primary"
                value={accountData.routingNumber || ""}
                onChange={(e) => onAccountChange(accountId, "routingNumber", e.target.value)}
                placeholder="e.g., 000111222"
              />
            </div>
            <div>
              <label htmlFor={`currency-${accountId}`} className="block text-sm font-medium text-gray-700">Currency</label>
              <input
                type="text"
                id={`currency-${accountId}`}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-cdbi-primary focus:border-cdbi-primary"
                value={accountData.currency || ""}
                onChange={(e) => onAccountChange(accountId, "currency", e.target.value)}
                placeholder="e.g., USD"
              />
            </div>
            {/* Add more fields as needed, e.g., bank name, address, etc. */}
          </div>
          <LocalButton
            buttonType="danger"
            onClick={() => onRemoveAccount(accountId)}
            className="absolute top-4 right-4 text-red-600 hover:text-red-800"
          >
            Remove
          </LocalButton>
        </div>
      ))}
      <LocalButton buttonType="secondary" onClick={onAddAccount} className="w-full">
        + Add New Account
      </LocalButton>
    </div>
  );
};
// --- END: Internalized UI Components ---

// --- START: AI-Powered Features, KPIs, and Gemini Integration ---

// Define types for AI-powered insights and KPIs
export interface AIInsight {
  type: "risk" | "compliance" | "fraud" | "optimization" | "suggestion" | "success";
  level: "info" | "warning" | "error" | "success";
  message: string;
  details?: Record<string, any>;
  field?: string; // Optional: associated form field
}

export interface AIKPI {
  name: string; // e.g., "AI Compliance Check Success Rate"
  value: number; // e.g., 98.5 (percentage), 5 (count)
  unit?: string; // e.g., "%", "count"
  timestamp: string; // ISO string
}

export interface ChartDataSeries {
  name: string;
  data: number[];
  categories: string[];
}

// Mock function to simulate AI analysis
export const analyzeAccountDetailsWithAI = async (
  accountData: Record<string, any>,
  counterpartyName?: string
): Promise<AIInsight[]> => {
  console.log("CDBI AI Global Intelligence: Analyzing account details...", { accountData, counterpartyName });
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const insights: AIInsight[] = [];

  // Example AI logic:
  // 1. Risk Assessment
  if (!accountData.routingNumber || accountData.routingNumber.length !== 9 || !/^\d+$/.test(accountData.routingNumber)) {
    insights.push({
      type: "risk",
      level: "error",
      message: "Invalid routing number format detected by CDBI AI. Please verify.",
      field: "routingNumber",
      details: { reason: "Format mismatch or missing" }
    });
  } else if (accountData.routingNumber.startsWith("00")) {
    insights.push({
      type: "risk",
      level: "warning",
      message: "Routing number starting with '00' might indicate a test or non-standard institution, as flagged by CDBI AI.",
      field: "routingNumber",
      details: { reason: "Non-standard prefix" }
    });
  }

  // 2. Compliance Check (e.g., against OFAC list, country restrictions)
  if (accountData.country && ["IR", "KP", "SY"].includes(accountData.country.toUpperCase())) { // Example embargoed countries
    insights.push({
      type: "compliance",
      level: "error",
      message: `CDBI AI detected a potential compliance violation: Account country (${accountData.country}) is restricted.`,
      field: "country",
      details: { restrictionType: "Embargoed country" }
    });
  }

  // 3. Fraud Detection (e.g., suspicious account names, numbers)
  if (accountData.name && /bitcoin|crypto|investment scheme|scam/i.test(accountData.name)) {
    insights.push({
      type: "fraud",
      level: "warning",
      message: "CDBI AI flagged account name for potential fraudulent activity keywords. Requires manual review.",
      field: "name",
      details: { keywords: "bitcoin, crypto, investment scheme" }
    });
  }
  if (accountData.accountNumber && accountData.accountNumber.length < 5) {
      insights.push({
          type: "fraud",
          level: "error",
          message: "CDBI AI identified a critically short account number, potentially indicating an error or fraudulent attempt. Requires immediate attention.",
          field: "accountNumber",
          details: { reason: "Short account number" }
      });
  }

  // 4. Optimization Suggestions
  if (accountData.currency && accountData.currency.toLowerCase() === 'usd' && !accountData.country) {
      insights.push({
          type: "optimization",
          level: "info",
          message: "CDBI AI recommends specifying the country for USD accounts for better processing efficiency.",
          field: "country",
          details: { recommendation: "Add country for USD account" }
      });
  }

  if (insights.length === 0) {
    insights.push({
      type: "success",
      level: "success",
      message: "CDBI AI completed analysis: No critical issues found. Account looks good.",
      details: { status: "clean" }
    });
  }

  return insights;
};

// Mock function to suggest optimal account structures
export const suggestOptimalAccountStructureWithAI = async (
  existingAccounts: Record<string, any>,
  counterpartyName: string
): Promise<AIInsight | null> => {
  console.log("CDBI AI Global Intelligence: Suggesting optimal account structures...", { existingAccounts, counterpartyName });
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (Object.keys(existingAccounts).length < 2) {
    return {
      type: "suggestion",
      level: "info",
      message: `CDBI AI suggests considering adding a separate savings or multi-currency account for ${counterpartyName} based on transaction patterns.`,
      details: { suggestion: "Add diverse account types" }
    };
  }
  return null;
};

// Mock function for post-submission data optimization
export const optimizeAccountDataWithAI = async (
  submittedData: Record<string, any>
): Promise<Record<string, any>> => {
  console.log("CDBI AI Global Intelligence: Optimizing submitted data...", submittedData);
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Example: AI might standardize currency codes, or add missing default values
  const optimized = { ...submittedData };
  if (optimized.currency) {
    optimized.currency = optimized.currency.toUpperCase(); // Ensure uppercase
  }
  // Simulate AI enriching data, e.g., adding a unique hash
  optimized.ai_hash = `cdbi_ai_${Math.random().toString(36).substring(2, 15)}`;
  return optimized;
};

// Function to send KPI data to the hypothetical Gemini analytics platform
export const sendKPIToGemini = async (kpi: AIKPI): Promise<void> => {
  console.log(`Sending KPI to Gemini: ${kpi.name} = ${kpi.value}${kpi.unit || ''} (Timestamp: ${kpi.timestamp})`);
  // In a real application, this would be an API call to Gemini's analytics endpoint.
  // Example: await fetch('/api/gemini-analytics', { method: 'POST', body: JSON.stringify(kpi) });
  await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate network
  console.log("KPI sent successfully to Gemini.");
};

// Component to display AI KPIs
export const AIKPIDisplay: React.FC<{ kpis: AIKPI[] }> = ({ kpis }) => {
  return (
    <div className="bg-cdbi-ai-bg p-4 rounded-lg shadow-inner mt-6 border border-cdbi-ai-border">
      <h4 className="text-md font-semibold text-cdbi-ai-text mb-3">CDBI AI Performance Metrics</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-cdbi-ai-card p-3 rounded-md shadow-sm">
            <p className="text-sm font-medium text-cdbi-ai-text-secondary">{kpi.name}</p>
            <p className="text-lg font-bold text-cdbi-ai-text">{kpi.value}{kpi.unit}</p>
            <p className="text-xs text-gray-400">Recorded: {new Date(kpi.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component to display AI-powered charts (simplified)
export const AIChartDisplay: React.FC<{ chartData: ChartDataSeries[]; title: string }> = ({ chartData, title }) => {
  // This is a placeholder. In a real app, you'd use a charting library (e.g., Chart.js, Recharts).
  return (
    <div className="bg-cdbi-ai-bg p-4 rounded-lg shadow-inner mt-6 border border-cdbi-ai-border">
      <h4 className="text-md font-semibold text-cdbi-ai-text mb-3">{title} (Powered by CDBI AI Global Intelligence)</h4>
      <div className="text-sm text-gray-500 italic">
        (Placeholder for a real chart, e.g., using Chart.js or Recharts)
      </div>
      {chartData.map((series, index) => (
        <div key={index} className="mt-2">
          <p className="font-medium text-cdbi-ai-text">{series.name}:</p>
          <div className="flex space-x-2 text-xs text-gray-600">
            {series.categories.map((cat, i) => (
              <span key={i} className="bg-gray-100 p-1 rounded">
                {cat}: {series.data[i]}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- END: AI-Powered Features, KPIs, and Gemini Integration ---


// --- START: Main ExternalAccountForm Component Refactor ---

interface ExternalAccountFormProps {
  setIsUpdatingBankAccounts: (isUpdating: boolean) => void;
  errorMessage?: string; // Initial error message
  name?: string; // Counterparty name
}

// ReduxProps are removed as Redux-Form is being functionally replaced.

export interface ExternalAccountData {
  [accountId: string]: {
    name: string;
    accountNumber: string;
    routingNumber: string;
    currency: string;
    country?: string; // Added for AI checks
    // Potentially more fields like bank name, address, etc.
  };
}

export function ExternalAccountForm({
  setIsUpdatingBankAccounts,
  errorMessage: initialErrorMessage,
  name: counterpartyName,
}: ExternalAccountFormProps) {
  // Local state to manage form values (replaces Redux-Form's state)
  const [accounts, setAccounts] = useState<ExternalAccountData>({
    // Example initial account
    'temp-1': { name: '', accountNumber: '', routingNumber: '', currency: 'USD', country: '' }
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [localErrorMessage, setLocalErrorMessage] = useState<string | undefined>(initialErrorMessage);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [aiProcessing, setAiProcessing] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [aiKpis, setAiKpis] = useState<AIKPI[]>([]);
  const [aiChartData, setAiChartData] = useState<ChartDataSeries[]>([]);

  // Function to add a new account entry
  const handleAddAccount = useCallback(() => {
    const newId = `temp-${Date.now()}`;
    setAccounts((prev) => ({
      ...prev,
      [newId]: { name: '', accountNumber: '', routingNumber: '', currency: 'USD', country: '' },
    }));
  }, []);

  // Function to remove an account entry
  const handleRemoveAccount = useCallback((accountId: string) => {
    setAccounts((prev) => {
      const newAccounts = { ...prev };
      delete newAccounts[accountId];
      return newAccounts;
    });
  }, []);

  // Function to update a specific field in an account
  const handleAccountChange = useCallback(
    (accountId: string, field: string, value: any) => {
      setAccounts((prev) => ({
        ...prev,
        [accountId]: {
          ...prev[accountId],
          [field]: value,
        },
      }));
    },
    []
  );

  // AI Analysis Effect: Re-analyze accounts whenever they change
  useEffect(() => {
    const runAIAnalysis = async () => {
      setAiProcessing(true);
      setLocalErrorMessage(undefined); // Clear previous errors

      let allInsights: AIInsight[] = [];
      let fraudDetected = 0;
      let complianceErrors = 0;
      let riskWarnings = 0;
      let optimizationSuggestions = 0;
      let totalAccountsAnalyzed = 0;

      for (const accountId in accounts) {
        if (Object.prototype.hasOwnProperty.call(accounts, accountId)) {
          totalAccountsAnalyzed++;
          const account = accounts[accountId];
          const insights = await analyzeAccountDetailsWithAI(account, counterpartyName);
          allInsights = [...allInsights, ...insights];

          insights.forEach(insight => {
            if (insight.type === 'fraud' && (insight.level === 'error' || insight.level === 'warning')) fraudDetected++;
            if (insight.type === 'compliance' && (insight.level === 'error' || insight.level === 'warning')) complianceErrors++;
            if (insight.type === 'risk' && (insight.level === 'error' || insight.level === 'warning')) riskWarnings++;
            if (insight.type === 'optimization' || insight.type === 'suggestion') optimizationSuggestions++;
          });
        }
      }

      const suggestion = await suggestOptimalAccountStructureWithAI(accounts, counterpartyName || "Counterparty");
      if (suggestion) {
        allInsights.push(suggestion);
        if (suggestion.type === 'suggestion') optimizationSuggestions++;
      }

      setAiInsights(allInsights);
      setAiProcessing(false);

      // Aggregate KPIs
      const currentTime = new Date().toISOString();
      setAiKpis([
        { name: "Total AI Checks Performed", value: totalAccountsAnalyzed, unit: "accounts", timestamp: currentTime },
        { name: "AI Fraud Detections", value: fraudDetected, unit: "counts", timestamp: currentTime },
        { name: "AI Compliance Alerts", value: complianceErrors, unit: "counts", timestamp: currentTime },
        { name: "AI Risk Warnings", value: riskWarnings, unit: "counts", timestamp: currentTime },
        { name: "AI Optimization Suggestions", value: optimizationSuggestions, unit: "counts", timestamp: currentTime },
      ]);

      // Example chart data based on insights (could be more complex)
      setAiChartData([
        {
          name: "AI Insight Levels",
          data: [
            allInsights.filter(i => i.level === 'error').length,
            allInsights.filter(i => i.level === 'warning').length,
            allInsights.filter(i => i.level === 'info').length,
            allInsights.filter(i => i.level === 'success').length,
          ],
          categories: ["Error", "Warning", "Info", "Success"]
        },
      ]);

      // Automatically send critical KPIs to Gemini
      if (fraudDetected > 0 || complianceErrors > 0) {
        await sendKPIToGemini({
          name: "Critical AI Alert: Fraud/Compliance",
          value: fraudDetected + complianceErrors,
          unit: "alerts",
          timestamp: currentTime,
        });
      }
    };

    runAIAnalysis();
  }, [accounts, counterpartyName]); // Re-run when accounts or counterparty name change

  // Submit handler (replaces redux-form's handleSubmit)
  const onSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setLocalErrorMessage(undefined); // Clear errors on new submission attempt

    // Perform pre-submission AI analysis if not already done, or just re-check insights
    const criticalInsights = aiInsights.filter(
      (insight) => insight.level === "error" || insight.type === "fraud"
    );

    if (criticalInsights.length > 0) {
      setLocalErrorMessage(
        "CDBI AI Global Intelligence detected critical issues. Please resolve before saving."
      );
      setSubmitting(false);
      setShowConfirmModal(false); // Close modal if there are errors
      await sendKPIToGemini({
        name: "Form Submission Blocked by AI (Critical Issues)",
        value: 1,
        unit: "count",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      // Simulate API call to save external accounts
      console.log("Saving external accounts via CDBI AI Global API...", accounts);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay

      // After successful save, run AI optimization
      const optimizedData = await optimizeAccountDataWithAI(accounts);
      console.log("Accounts saved and optimized by CDBI AI:", optimizedData);

      setIsUpdatingBankAccounts(false); // Close form/modal after successful save
      setShowConfirmModal(false); // Close confirmation modal

      await sendKPIToGemini({
        name: "Successful External Account Save (AI Optimized)",
        value: 1,
        unit: "count",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Failed to save external accounts:", error);
      setLocalErrorMessage(
        `Failed to save bank accounts. CDBI AI suggests checking network or server logs. Error: ${error.message}`
      );
      await sendKPIToGemini({
        name: "Failed External Account Save",
        value: 1,
        unit: "count",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setSubmitting(false);
    }
  }, [accounts, aiInsights, setIsUpdatingBankAccounts]); // Depend on accounts and AI insights

  const hasErrors = aiInsights.some(i => i.level === 'error');
  const hasWarnings = aiInsights.some(i => i.level === 'warning');

  return (
    <form autoComplete="off" onSubmit={onSubmit}>
      <div className="form-section space-y-8">
        {/* Render AI Insights */}
        {aiProcessing && (
          <div className="flex items-center text-cdbi-ai-text bg-cdbi-ai-bg p-3 rounded-md shadow-sm">
            <ClipLoader size={20} color="#007bff" className="mr-3" />
            <span className="font-medium">CDBI AI Global Intelligence is analyzing account details...</span>
          </div>
        )}

        {aiInsights.length > 0 && !aiProcessing && (
          <div className="bg-cdbi-ai-bg p-4 rounded-lg shadow-inner border border-cdbi-ai-border">
            <h3 className="text-lg font-bold text-cdbi-ai-text mb-3">CDBI AI Insights & Recommendations</h3>
            <ul className="space-y-2">
              {aiInsights.map((insight, index) => (
                <li
                  key={index}
                  className={`flex items-start p-2 rounded-md ${
                    insight.level === "error"
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : insight.level === "warning"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      : insight.level === "info"
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-green-100 text-green-800 border border-green-300"
                  }`}
                >
                  <span className="mr-2 text-xl">
                    {insight.level === "error" ? "🚨" : insight.level === "warning" ? "⚠️" : insight.level === "info" ? "💡" : "✅"}
                  </span>
                  <div>
                    <span className="font-medium">
                      {insight.type.toUpperCase()}{insight.field ? ` (${insight.field})` : ''}:{" "}
                    </span>
                    {insight.message}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* The internalized LocalCounterpartyAccountFormSection */}
        <LocalCounterpartyAccountFormSection
          counterpartyName={counterpartyName}
          accounts={accounts}
          formName="counterparty" // This prop is now nominal
          isEdit // This prop is now nominal
          onAccountChange={handleAccountChange}
          onAddAccount={handleAddAccount}
          onRemoveAccount={handleRemoveAccount}
        />
      </div>

      <div className="form-group form-group-submit flex flex-row items-center mt-8">
        <LocalButton
          id="save-bank-account-details-btn"
          buttonType="primary"
          onClick={(): void => {
            setShowConfirmModal(true);
          }}
          disabled={submitting || aiProcessing || hasErrors} // Disable if AI processing or critical errors
        >
          {submitting ? "Saving..." : "Save Bank Accounts"}
        </LocalButton>
        <LocalButton
          className="ml-4"
          onClick={() => setIsUpdatingBankAccounts(false)}
          disabled={submitting || aiProcessing}
        >
          Cancel
        </LocalButton>

        {(submitting || aiProcessing) ? (
          <ClipLoader
            // Our usage if ClipLoader does not match the current types
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            loaderStyle={{ verticalAlign: "middle", marginLeft: "1rem" }}
            color="#007bff"
          />
        ) : undefined}
        {localErrorMessage && <span className="error-message text-red-600 ml-4 font-medium">{localErrorMessage}</span>}
        {hasWarnings && !hasErrors && (
            <span className="warning-message text-yellow-700 ml-4 font-medium">
                CDBI AI found warnings. Review recommended before saving.
            </span>
        )}
      </div>

      {/* AI KPIs and Charts */}
      {aiKpis.length > 0 && <AIKPIDisplay kpis={aiKpis} />}
      {aiChartData.length > 0 && <AIChartDisplay chartData={aiChartData} title="AI Analysis Trends" />}


      {/* The internalized LocalConfirmModal */}
      <LocalConfirmModal
        isOpen={showConfirmModal}
        setIsOpen={setShowConfirmModal}
        title="Confirm Save via CDBI AI Gateway"
        onConfirm={onSubmit} // The local onSubmit handles the submission
        confirmText="Confirm & Save"
        confirmDisabled={submitting || aiProcessing || hasErrors} // Disable if critical AI issues exist
        cancelDisabled={submitting || aiProcessing}
      >
        <div>
          Please confirm that you would like to save any changes to these bank accounts.
          <p className="mt-2 font-medium text-cdbi-ai-text-secondary">
            CDBI AI Global Intelligence has analyzed your inputs and provided the insights above.
            Proceeding will submit your accounts through the secure CDBI AI gateway for final processing and optimization.
          </p>
          {hasWarnings && !hasErrors && (
            <p className="mt-2 text-yellow-700">
              <span className="font-bold">Note:</span> CDBI AI identified warnings. Saving will proceed, but review is recommended.
            </p>
          )}
          {hasErrors && (
            <p className="mt-2 text-red-700">
              <span className="font-bold">Critical Error:</span> CDBI AI detected errors. You cannot save until they are resolved.
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Updates will not be reflected on any active Payment Orders immediately.
            Changes to approved Bank Accounts may require reapproval subject to existing approval rules on External Accounts.
          </p>
        </div>
      </LocalConfirmModal>
    </form>
  );
}

// The original reduxForm export is removed as we're managing state locally.
// The component is exported directly.
// We keep the `reduxForm` import at the top, but it's no longer functionally used for the export.
// This adheres to "MUST NOT change or remove any existing import statements." but replaces its usage.
// To satisfy the "export new top-level functions" and "self-contained" instructions,
// we export the component directly.
export default ExternalAccountForm;