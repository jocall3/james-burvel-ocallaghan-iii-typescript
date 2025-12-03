// Copyright cdbi Inc.
// All rights reserved.

import React, { useState, useEffect, useCallback } from "react";
import {
  Icon,
  Popover,
  ActionItem,
  PopoverPanel,
  PopoverTrigger,
  ButtonClickEventTypes,
  Spinner, // Assuming Spinner is also available in ui-components or similar
  Modal, // Assuming Modal is also available in ui-components or similar
  Button, // Assuming Button is also available in ui-components or similar
  Input, // Assuming Input is also available in ui-components or similar
} from "../../common/ui-components";
import { handleLinkClick } from "../../common/utilities/handleLinkClick";

// --- cdbi AI-Powered Core Services ---

/**
 * Represents a Key Performance Indicator (KPI) for AI functions.
 * This structure would be sent to a visualization or analytics platform like Gemini.
 */
export interface AI_KPI {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  description?: string;
  timestamp: string;
  category: "efficiency" | "risk" | "customer_experience" | "operational";
  relatedFeature: string;
}

/**
 * Represents data for a chart to visualize AI insights.
 * This structure would be sent to a visualization platform like Gemini.
 */
export interface AI_ChartData {
  id: string;
  title: string;
  type: "bar" | "line" | "pie" | "gauge";
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }>;
  options?: any; // Chart.js or similar options
  timestamp: string;
  relatedFeature: string;
}

/**
 * Mocks the interaction with a powerful AI model like Google Gemini.
 * In a real-world scenario, this would involve API calls, authentication,
 * and structured data transmission.
 * @param data The KPI or ChartData to send to Gemini.
 */
export async function sendDataToGemini(data: AI_KPI | AI_ChartData): Promise<void> {
  console.log(`[cdbi AI] Sending data to Gemini for visualization and analysis:`, data);
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log(`[cdbi AI] Data sent successfully to Gemini for ${data.id}.`);
  // In a real application, this would involve a robust API client
  // e.g., fetch('/api/gemini-analytics', { method: 'POST', body: JSON.stringify(data) })
}

/**
 * `cdbiAIService` encapsulates all AI-driven functionalities for money movement.
 * This class simulates API calls to various sophisticated AI models,
 * tracking performance and generating KPIs and charts.
 * This is a conceptual implementation; actual AI models would be external.
 */
export class cdbiAIService {
  private static instance: cdbiAIService;

  private constructor() {}

  public static getInstance(): cdbiAIService {
    if (!cdbiAIService.instance) {
      cdbiAIService.instance = new cdbiAIService();
    }
    return cdbiAIService.instance;
  }

  /**
   * Simulates an AI-powered fraud detection pre-check for a payment.
   * Generates a risk score and a KPI.
   * @param transactionDetails Details of the proposed transaction.
   * @returns A promise resolving to a fraud analysis result.
   */
  public async performFraudPreCheck(transactionDetails: {
    amount: number;
    currency: string;
    recipient: string;
    type: string;
  }): Promise<{ riskScore: number; recommendation: string }> {
    console.log(`[cdbi AI] Performing fraud pre-check for:`, transactionDetails);
    // Simulate AI model processing time and complex logic
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let riskScore = 0;
    let recommendation = "Low Risk. Proceed with confidence.";

    // Example AI logic: higher risk for large amounts or new recipients
    if (transactionDetails.amount > 100000) riskScore += 30;
    if (transactionDetails.recipient.includes("unknown") || transactionDetails.recipient.includes("new_vendor"))
      riskScore += 20;
    if (transactionDetails.type === "international") riskScore += 10;

    riskScore = Math.min(riskScore + Math.floor(Math.random() * 20), 100); // Add some randomness

    if (riskScore > 70) {
      recommendation = "High Risk! Review transaction carefully or seek approval.";
    } else if (riskScore > 40) {
      recommendation = "Moderate Risk. Recommend secondary verification.";
    }

    const kpi: AI_KPI = {
      id: `fraud-check-${Date.now()}`,
      name: "Fraud Pre-check Risk Score",
      value: riskScore,
      unit: "%",
      description: `Risk score for transaction to ${transactionDetails.recipient}`,
      timestamp: new Date().toISOString(),
      category: "risk",
      relatedFeature: "AI Fraud Pre-check",
    };
    await sendDataToGemini(kpi);

    const chartData: AI_ChartData = {
      id: `fraud-score-distribution-${Date.now()}`,
      title: "Recent Fraud Risk Scores Distribution",
      type: "bar",
      labels: ["Low (0-40)", "Moderate (41-70)", "High (71-100)"],
      datasets: [
        {
          label: "Number of Transactions",
          data: [
            Math.floor(Math.random() * 50) + 10, // Placeholder data
            Math.floor(Math.random() * 20) + 5,
            Math.floor(Math.random() * 10) + (riskScore > 70 ? 3 : 0),
          ],
          backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
        },
      ],
      timestamp: new Date().toISOString(),
      relatedFeature: "AI Fraud Pre-check",
    };
    await sendDataToGemini(chartData);

    return { riskScore, recommendation };
  }

  /**
   * Provides AI-powered smart suggestions for payment creation based on historical data.
   * Generates a KPI on suggestion accuracy/usage.
   * @returns A promise resolving to a list of suggested payment types/recipients.
   */
  public async getSmartPaymentSuggestions(): Promise<
    Array<{ label: string; path: string; icon?: string; description?: string }>
  > {
    console.log("[cdbi AI] Generating smart payment suggestions...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const suggestions = [
      {
        label: "Pay cdbi Vendor: CloudAI Solutions (Recurring)",
        path: "/payment_orders/new?preset=vendor_cloud_ai",
        icon: "cloud",
        description: "AI detected this is a recurring monthly payment.",
      },
      {
        label: "Transfer to Personal Savings (Optimal Timing)",
        path: "/payment_orders/new?preset=personal_savings",
        icon: "savings",
        description: "AI suggests optimal timing for maximum interest accumulation.",
      },
      {
        label: "Pay Rent: Apartment Complex (Due Soon)",
        path: "/payment_orders/new?preset=rent",
        icon: "home",
        description: "Your rent payment is due in 3 days. AI can schedule it for you.",
      },
      {
        label: "Bulk Payout for Contractors (AI-Verified)",
        path: "/payment_orders/bulk_imports/new?preset=contractor_payout",
        icon: "group",
        description: "AI has verified all contractor invoices and payment details.",
      },
    ];

    const kpi: AI_KPI = {
      id: `suggestions-generated-${Date.now()}`,
      name: "Payment Suggestions Generated",
      value: suggestions.length,
      unit: "suggestions",
      description: "Number of smart payment suggestions provided to user.",
      timestamp: new Date().toISOString(),
      category: "customer_experience",
      relatedFeature: "AI Payment Suggestions",
    };
    await sendDataToGemini(kpi);

    const chartData: AI_ChartData = {
      id: `suggestion-usage-${Date.now()}`,
      title: "Smart Suggestion Usage Rate (Last 30 Days)",
      type: "gauge",
      labels: ["Usage"],
      datasets: [
        {
          label: "Percentage Used",
          data: [Math.floor(Math.random() * 40) + 30], // Example usage 30-70%
          backgroundColor: ["#03A9F4"],
        },
      ],
      options: {
        circumference: 180,
        rotation: -90,
        cutout: "70%",
        plugins: { legend: { display: false } },
      },
      timestamp: new Date().toISOString(),
      relatedFeature: "AI Payment Suggestions",
    };
    await sendDataToGemini(chartData);

    return suggestions;
  }

  /**
   * Predicts the cash flow impact of a proposed transaction using AI models.
   * Provides insights into future balances.
   * @param transactionDetails Details of the proposed transaction.
   * @returns A promise resolving to a cash flow prediction.
   */
  public async predictCashFlowImpact(transactionDetails: {
    amount: number;
    currency: string;
    futureDate?: string;
  }): Promise<{ projectedBalance: number; impactSummary: string; recommendation: string }> {
    console.log(`[cdbi AI] Predicting cash flow impact for:`, transactionDetails);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const currentBalance = 150000; // Mock current balance
    const projectedBalance = currentBalance - transactionDetails.amount + Math.random() * 500 - 250; // Add some AI flair
    let impactSummary = `This transaction will reduce your current balance to ${projectedBalance.toFixed(
      2,
    )} ${transactionDetails.currency}.`;
    let recommendation = "Balance remains healthy after this transaction.";

    if (projectedBalance < 10000) {
      impactSummary += " This brings your balance below a recommended threshold.";
      recommendation = "Consider transferring funds or delaying this payment if possible.";
    } else if (projectedBalance < 50000) {
      recommendation = "Your balance will be lower but still above critical levels.";
    }

    const kpi: AI_KPI = {
      id: `cash-flow-prediction-${Date.now()}`,
      name: "Projected Balance After Transaction",
      value: projectedBalance,
      unit: transactionDetails.currency,
      description: `Predicted balance for account after a ${transactionDetails.amount} ${transactionDetails.currency} transaction.`,
      timestamp: new Date().toISOString(),
      category: "operational",
      relatedFeature: "Predictive Cash Flow",
    };
    await sendDataToGemini(kpi);

    const chartData: AI_ChartData = {
      id: `cash-flow-projection-${Date.now()}`,
      title: "7-Day Cash Flow Projection",
      type: "line",
      labels: ["Today", "+1 Day", "+2 Days", "+3 Days", "+4 Days", "+5 Days", "+6 Days"],
      datasets: [
        {
          label: "Projected Balance",
          data: [
            currentBalance,
            currentBalance - transactionDetails.amount * 0.5,
            projectedBalance,
            projectedBalance + 1000,
            projectedBalance + 500,
            projectedBalance + 2000,
            projectedBalance + 1500,
          ].map((val) => parseFloat(val.toFixed(2))),
          borderColor: "#2196F3",
          backgroundColor: "rgba(33, 150, 243, 0.2)",
          fill: true,
        },
      ],
      timestamp: new Date().toISOString(),
      relatedFeature: "Predictive Cash Flow",
    };
    await sendDataToGemini(chartData);

    return { projectedBalance, impactSummary, recommendation };
  }

  /**
   * Uses Natural Language Processing (NLP) to parse a human-readable payment instruction.
   * This is a sophisticated AI function that converts text to structured data.
   * Generates a KPI on NLP parsing accuracy.
   * @param naturalLanguageInput The user's input string (e.g., "send $500 to John Doe for consulting fee").
   * @returns A promise resolving to a structured payment object.
   */
  public async parseNaturalLanguagePayment(
    naturalLanguageInput: string,
  ): Promise<{ amount: number; currency: string; recipient: string; memo: string; status: "parsed" | "needs_clarification" }> {
    console.log(`[cdbi AI] Parsing natural language input: "${naturalLanguageInput}"`);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simple NLP mock logic
    const amountMatch = naturalLanguageInput.match(/\$?(\d+(\.\d{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    const currency = naturalLanguageInput.includes("$") ? "USD" : "Unknown"; // Basic detection
    const recipientMatch = naturalLanguageInput.match(/to\s+([a-zA-Z\s]+?)(?:\s+for|$)/);
    const recipient = recipientMatch ? recipientMatch[1].trim() : "Unspecified";
    const memoMatch = naturalLanguageInput.match(/for\s+(.*)/);
    const memo = memoMatch ? memoMatch[1].trim() : "General Payment";

    const status: "parsed" | "needs_clarification" =
      amount > 0 && recipient !== "Unspecified" ? "parsed" : "needs_clarification";

    const kpi: AI_KPI = {
      id: `nlp-parse-${Date.now()}`,
      name: "NLP Payment Parsing Attempts",
      value: 1,
      unit: "attempt",
      description: `NLP attempt for input: "${naturalLanguageInput.substring(0, 50)}..."`,
      timestamp: new Date().toISOString(),
      category: "efficiency",
      relatedFeature: "Natural Language Payment",
    };
    await sendDataToGemini(kpi);

    const accuracyKPI: AI_KPI = {
      id: `nlp-accuracy-${Date.now()}`,
      name: "NLP Parsing Accuracy",
      value: status === "parsed" ? 95 : 60, // Mock accuracy
      unit: "%",
      description: "Overall accuracy of NLP parsing for payment instructions.",
      timestamp: new Date().toISOString(),
      category: "efficiency",
      relatedFeature: "Natural Language Payment",
    };
    await sendDataToGemini(accuracyKPI);

    return { amount, currency, recipient, memo, status };
  }
}

// --- cdbi React Components for AI Features ---

/**
 * Component to display a loading spinner for AI operations.
 */
export function AISpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <Spinner size="l" />
      <span className="ml-2 text-cdbi-primary-blue">cdbi AI is thinking...</span>
    </div>
  );
}

/**
 * Modal for AI Fraud Pre-check.
 */
export function AIFraudPreCheckModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [result, setResult] = useState<{ riskScore: number; recommendation: string } | null>(null);

  const aiService = cdbiAIService.getInstance();

  const handleCheck = async () => {
    setLoading(true);
    setResult(null);
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        alert("Please enter a valid amount.");
        setLoading(false);
        return;
      }
      const res = await aiService.performFraudPreCheck({
        amount: parsedAmount,
        currency,
        recipient,
        type: "domestic_transfer", // Simplified for demo
      });
      setResult(res);
    } catch (error) {
      console.error("Fraud pre-check failed:", error);
      alert("Failed to perform fraud check.");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setAmount("");
    setRecipient("");
    setCurrency("USD");
    setResult(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="cdbi AI Fraud Pre-check">
      <div className="p-4 space-y-4">
        {!result ? (
          <>
            <p className="text-sm text-gray-600">
              Our advanced cdbi AI will analyze your payment details for potential fraud risks before you commit.
            </p>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 1500.00"
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <Input
                id="currency"
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="e.g., USD"
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                Recipient Name/ID
              </label>
              <Input
                id="recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g., cdbi Solutions Inc."
                className="mt-1 block w-full"
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={onClose} buttonType="secondary" className="mr-2">
                Cancel
              </Button>
              <Button onClick={handleCheck} buttonType="primary" disabled={loading}>
                {loading ? <AISpinner /> : "Run AI Check"}
              </Button>
            </div>
          </>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-2">AI Fraud Analysis Result:</h3>
            <p className="text-md mb-1">
              Risk Score: <span className={`font-bold ${result.riskScore > 70 ? "text-red-600" : result.riskScore > 40 ? "text-yellow-600" : "text-green-600"}`}>{result.riskScore}%</span>
            </p>
            <p className="text-md mb-4">{result.recommendation}</p>
            <div className="flex justify-end">
              <Button onClick={onClose} buttonType="primary">
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * Modal for Natural Language Payment Assistant.
 */
export function AINLPPaymentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<
    { amount: number; currency: string; recipient: string; memo: string; status: "parsed" | "needs_clarification" } | null
  >(null);
  const aiService = cdbiAIService.getInstance();

  const handleParse = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await aiService.parseNaturalLanguagePayment(input);
      setResult(res);
    } catch (error) {
      console.error("NLP parsing failed:", error);
      alert("Failed to parse natural language input.");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setInput("");
    setResult(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const handleCreatePayment = (parsedResult: typeof result) => {
    if (parsedResult) {
      const queryParams = new URLSearchParams({
        amount: parsedResult.amount.toString(),
        currency: parsedResult.currency,
        recipient: parsedResult.recipient,
        memo: parsedResult.memo,
        source: "nlp_ai",
      }).toString();
      handleLinkClick(`/payment_orders/new?${queryParams}`, { preventDefault: () => {} } as ButtonClickEventTypes);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="cdbi AI Natural Language Payment">
      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-600">
          Describe your payment in plain English, and cdbi AI will structure it for you.
          <br />
          Example: "Send $500 USD to cdbi Technologies for software license."
        </p>
        <div>
          <label htmlFor="nlp-input" className="block text-sm font-medium text-gray-700">
            Your Payment Instruction
          </label>
          <Input
            id="nlp-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Pay $1200 to my landlord, John Smith, for this month's rent."
            className="mt-1 block w-full"
          />
        </div>
        {!result ? (
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} buttonType="secondary" className="mr-2">
              Cancel
            </Button>
            <Button onClick={handleParse} buttonType="primary" disabled={loading}>
              {loading ? <AISpinner /> : "Parse with AI"}
            </Button>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-2">AI Parsed Details:</h3>
            {result.status === "needs_clarification" && (
              <p className="text-yellow-600 mb-2">
                <Icon iconName="warning" size="s" className="inline-block mr-1" />
                cdbi AI needs more clarity. Please refine your input.
              </p>
            )}
            <p className="text-md mb-1">
              Amount: <span className="font-bold">{result.amount}</span>{" "}
              <span className="font-bold">{result.currency}</span>
            </p>
            <p className="text-md mb-1">
              Recipient: <span className="font-bold">{result.recipient}</span>
            </p>
            <p className="text-md mb-4">
              Memo: <span className="font-bold">{result.memo}</span>
            </p>
            <div className="flex justify-end">
              <Button onClick={resetState} buttonType="secondary" className="mr-2">
                Revise Input
              </Button>
              {result.status === "parsed" && (
                <Button onClick={() => handleCreatePayment(result)} buttonType="primary">
                  Create Payment Order
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * Component to display AI-powered smart payment suggestions.
 */
export function AISmartPaymentSuggestions({
  onSelectSuggestion,
}: {
  onSelectSuggestion: (path: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<
    Array<{ label: string; path: string; icon?: string; description?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const aiService = cdbiAIService.getInstance();

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await aiService.getSmartPaymentSuggestions();
        setSuggestions(res);
      } catch (error) {
        console.error("Failed to fetch AI suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [aiService]);

  return (
    <div className="p-2">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">
        <Icon iconName="ai" size="s" className="inline-block mr-1 text-cdbi-ai-purple" />
        cdbi AI Smart Suggestions:
      </h3>
      {loading ? (
        <AISpinner />
      ) : suggestions.length > 0 ? (
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <ActionItem
              key={index}
              onClick={(event: ButtonClickEventTypes) => {
                onSelectSuggestion(suggestion.path);
                event.preventDefault(); // Prevent default link behavior if handling internally
              }}
            >
              <div className="flex items-center">
                {suggestion.icon && <Icon iconName={suggestion.icon as any} size="s" className="mr-2 text-cdbi-ai-purple" />}
                <div>
                  <div className="font-medium text-gray-900">{suggestion.label}</div>
                  {suggestion.description && (
                    <div className="text-xs text-gray-500">{suggestion.description}</div>
                  )}
                </div>
              </div>
            </ActionItem>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No smart suggestions available at this time.</p>
      )}
    </div>
  );
}

/**
 * The main MoveMoneyDropdown component, enhanced with cdbi AI.
 */
export default function MoveMoneyDropdown() {
  const [isFraudModalOpen, setIsFraudModalOpen] = useState(false);
  const [isNLPModalOpen, setIsNLPModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handlePopoverClose = useCallback(() => {
    setIsPopoverOpen(false);
  }, []);

  const handleLinkClickAndClosePopover = useCallback(
    (path: string, event: ButtonClickEventTypes) => {
      handleLinkClick(path, event);
      handlePopoverClose();
    },
    [handlePopoverClose],
  );

  const aiService = cdbiAIService.getInstance();

  // Pre-calculate and display a quick AI insight if applicable
  const [quickCashFlowInsight, setQuickCashFlowInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    const getInsight = async () => {
      setInsightLoading(true);
      try {
        const currentAmount = 5000; // Example average payment
        const insight = await aiService.predictCashFlowImpact({
          amount: currentAmount,
          currency: "USD",
          futureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
        setQuickCashFlowInsight(
          `AI Cash Flow: Current balance adjusted to $${insight.projectedBalance.toFixed(2)}. ${insight.recommendation}`,
        );
      } catch (error) {
        console.error("Failed to get quick cash flow insight:", error);
        setQuickCashFlowInsight("AI Cash Flow: Unable to predict at this moment.");
      } finally {
        setInsightLoading(false);
      }
    };
    getInsight();
  }, [aiService]);

  return (
    <>
      <div id="move-money-dropdown" className="flex-end">
        <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger
            buttonType="primary"
            className="flex items-center justify-center space-x-2 bg-cdbi-primary-blue hover:bg-cdbi-primary-blue-dark active:bg-cdbi-primary-blue-active text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            <Icon iconName="payments" size="m" color="currentColor" />
            <span>Move Money with cdbi AI</span>
            <Icon iconName="chevron_down" size="s" color="currentColor" className="text-white ml-1" />
          </PopoverTrigger>
          <PopoverPanel anchorOrigin={{ horizontal: "right" }} className="w-80">
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">cdbi AI Insights</h3>
              {insightLoading ? (
                <AISpinner />
              ) : (
                quickCashFlowInsight && (
                  <p className="text-xs text-gray-700 leading-tight">
                    <Icon iconName="data_analytics" size="xs" className="inline-block mr-1 text-blue-500" />
                    {quickCashFlowInsight}
                  </p>
                )
              )}
            </div>

            <AISmartPaymentSuggestions
              onSelectSuggestion={(path) => handleLinkClickAndClosePopover(path, { preventDefault: () => {} } as ButtonClickEventTypes)}
            />

            <div className="p-2 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Standard Actions</h3>
              <ActionItem
                onClick={(event: ButtonClickEventTypes) => {
                  handleLinkClickAndClosePopover("/payment_orders/new", event);
                }}
              >
                <div id="create-payment-order" className="flex items-center">
                  <Icon iconName="send" size="s" className="mr-2 text-cdbi-action-icon" />
                  Create a Payment Order
                </div>
              </ActionItem>
              <ActionItem
                onClick={(event: ButtonClickEventTypes) => {
                  handleLinkClickAndClosePopover("/payment_orders/bulk_imports/new", event);
                }}
              >
                <div id="create-bulk-payment-order" className="flex items-center">
                  <Icon iconName="upload" size="s" className="mr-2 text-cdbi-action-icon" />
                  Create a Bulk Payment Order
                </div>
              </ActionItem>
              <ActionItem
                onClick={(event: ButtonClickEventTypes) => {
                  handleLinkClickAndClosePopover("/sweeps/new", event);
                }}
              >
                <div id="create-sweep-rule" className="flex items-center">
                  <Icon iconName="swap_horiz" size="s" className="mr-2 text-cdbi-action-icon" />
                  Create a Sweep Rule
                </div>
              </ActionItem>
            </div>

            <div className="p-2 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">AI-Powered Tools</h3>
              <ActionItem
                onClick={(event: ButtonClickEventTypes) => {
                  setIsFraudModalOpen(true);
                  event.preventDefault();
                  handlePopoverClose();
                }}
              >
                <div id="ai-fraud-precheck" className="flex items-center">
                  <Icon iconName="security" size="s" className="mr-2 text-red-500" />
                  AI Fraud Pre-check
                </div>
              </ActionItem>
              <ActionItem
                onClick={(event: ButtonClickEventTypes) => {
                  setIsNLPModalOpen(true);
                  event.preventDefault();
                  handlePopoverClose();
                }}
              >
                <div id="ai-nlp-payment" className="flex items-center">
                  <Icon iconName="voice_chat" size="s" className="mr-2 text-green-500" />
                  Natural Language Payment Assistant
                </div>
              </ActionItem>
              {/* Future AI tools could be added here, e.g., AI Optimized Routing, AI Predictive Scheduling */}
            </div>
          </PopoverPanel>
        </Popover>
      </div>

      <AIFraudPreCheckModal isOpen={isFraudModalOpen} onClose={() => setIsFraudModalOpen(false)} />
      <AINLPPaymentModal isOpen={isNLPModalOpen} onClose={() => setIsNLPModalOpen(false)} />
    </>
  );
}