// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import {
  ActionItem,
  Icon,
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from "../../common/ui-components";
import trackEvent from "../../common/utilities/trackEvent";
import { ACCOUNT_ACTIONS } from "../../common/constants/analytics";

// Redefined props to reflect the new, expanded scope focusing on AI and external app integrations
type GlobalIntelligenceHubProps = {
  availableCurrencies: string[]; // List of currencies, now a contextual input
  currentSelectedCurrency: string | null; // The currently selected currency, used as context
  onCurrencyChange: (currency: string) => void; // Callback when currency is changed
  setGlobalDateFilterLabel?: () => void; // Original prop, retained

  // New mock callbacks for AI and External App interactions to make the code executable
  onActivateGeminiMarketInsights: (currency: string | null, insightType: string) => void;
  onPredictFutureValuations: (currency: string | null) => void;
  onOptimizePortfolio: (currency: string | null) => void;
  onLaunchCreditRiskWorkbench: (currency: string | null) => void;
  onInitiateFraudDetection: (currency: string | null) => void;
};

// Renamed component from CurrencyDropdown to GlobalIntelligenceHub to reflect its new purpose
export default function GlobalIntelligenceHub(props: GlobalIntelligenceHubProps) {
  const {
    availableCurrencies,
    currentSelectedCurrency,
    onCurrencyChange,
    setGlobalDateFilterLabel,
    onActivateGeminiMarketInsights,
    onPredictFutureValuations,
    onOptimizePortfolio,
    onLaunchCreditRiskWorkbench,
    onInitiateFraudDetection,
  } = props;

  // Internal state to dynamically display the current focus or last action initiated by the hub
  const [currentHubFocus, setCurrentHubFocus] = useState<string>(
    `Active Focus: ${currentSelectedCurrency ?? availableCurrencies[0] ?? 'Global Operations'}`
  );

  // Helper function for handling currency selection, now an action within the hub
  const handleCurrencySelection = (currency: string, closePanel: () => void) => {
    trackEvent(
      null,
      ACCOUNT_ACTIONS.CHANGED_GLOBAL_CURRENCY_FILTER,
      { path: window.location.pathname, newCurrency: currency },
    );
    if (setGlobalDateFilterLabel) setGlobalDateFilterLabel();
    onCurrencyChange(currency);
    setCurrentHubFocus(`Currency Context: ${currency}`);
    closePanel();
  };

  // Helper for triggering Gemini-powered actions
  const handleGeminiAction = (
    actionName: string,
    callback: (currency: string | null, insightType?: string) => void,
    closePanel: () => void,
    insightType?: string
  ) => {
    trackEvent(
      null,
      `AI_ACTION_${actionName.replace(/\s/g, '_').toUpperCase()}`,
      { path: window.location.pathname, currencyContext: currentSelectedCurrency },
    );
    callback(currentSelectedCurrency, insightType); // Pass selected currency as context
    setCurrentHubFocus(`AI Focus: ${actionName}`);
    closePanel();
  };

  // Helper for triggering External Application integrations
  const handleExternalAppAction = (
    actionName: string,
    callback: (currency: string | null) => void,
    closePanel: () => void
  ) => {
    trackEvent(
      null,
      `EXTERNAL_APP_ACTION_${actionName.replace(/\s/g, '_').toUpperCase()}`,
      { path: window.location.pathname, currencyContext: currentSelectedCurrency },
    );
    callback(currentSelectedCurrency); // Pass selected currency as context
    setCurrentHubFocus(`App Focus: ${actionName}`);
    closePanel();
  };

  return (
    <Popover>
      <PopoverTrigger buttonType="secondary">
        {/* Changed icon to represent global intelligence and AI */}
        <Icon iconName="brain" size="s" /> {/* Assuming 'brain' or a similar AI/global icon exists */}
        <div className="w-px border-l border-gray-200">&nbsp;</div>
        {/* Displays the current focus or the last action initiated */}
        <div className="font-semibold text-sm whitespace-nowrap">{currentHubFocus}</div>
        <Icon
          iconName="chevron_down"
          size="s"
          color="currentColor"
          className="text-gray-300"
        />
      </PopoverTrigger>
      <PopoverPanel anchorOrigin={{ horizontal: "right" }}>
        {(panelProps: { close: () => void }) => (
          <>
            {/* --- Section for Gemini Powered Insights: The new primary focus --- */}
            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Gemini Powered Financial Brain
            </div>
            <ActionItem
              onClick={() => handleGeminiAction("Analyze Global Market Trends", onActivateGeminiMarketInsights, panelProps.close, "market_trends")}
            >
              <Icon iconName="chart_line" size="s" /> {/* Icon for market analysis */}
              <div id="ai-market-trends">Analyze Global Market Trends (AI)</div>
            </ActionItem>
            <ActionItem
              onClick={() => handleGeminiAction("Predict Future Valuations", onPredictFutureValuations, panelProps.close)}
            >
              <Icon iconName="trending_up" size="s" /> {/* Icon for predictive analytics */}
              <div id="ai-predictive-valuations">Predict Future Valuations (AI)</div>
            </ActionItem>
            <ActionItem
              onClick={() => handleGeminiAction("AI-Driven Portfolio Optimization", onOptimizePortfolio, panelProps.close)}
            >
              <Icon iconName="data_object" size="s" /> {/* Icon for data-driven optimization */}
              <div id="ai-portfolio-optimization">AI-Driven Portfolio Optimization</div>
            </ActionItem>

            {/* Separator */}
            <div className="border-t border-gray-200 my-2" />

            {/* --- Section for Enterprise App Integrations --- */}
            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Enterprise Integration Suite
            </div>
            <ActionItem
              onClick={() => handleExternalAppAction("Launch Credit Risk Workbench", onLaunchCreditRiskWorkbench, panelProps.close)}
            >
              <Icon iconName="database" size="s" /> {/* Icon for external database/app */}
              <div id="app-credit-risk">Launch Credit Risk Workbench (SAP Link)</div>
            </ActionItem>
            <ActionItem
              onClick={() => handleExternalAppAction("Initiate Real-time Fraud Detection", onInitiateFraudDetection, panelProps.close)}
            >
              <Icon iconName="shield_check" size="s" /> {/* Icon for security/fraud */}
              <div id="app-fraud-detection">Initiate Real-time Fraud Detection (SecureLink)</div>
            </ActionItem>

            {/* Separator */}
            <div className="border-t border-gray-200 my-2" />

            {/* --- Core Financial Operations: Currency selection, now a contextual setting --- */}
            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Core Financial Operations
            </div>
            {availableCurrencies.map((currency) => (
              <ActionItem
                key={`currency-${currency}`}
                onClick={() => {
                  handleCurrencySelection(currency, panelProps.close);
                }}
                className={currentSelectedCurrency === currency ? "bg-blue-50 text-blue-700" : ""}
              >
                <div id={`set-currency-${currency}`}>{currency}</div>
                {currentSelectedCurrency === currency && <Icon iconName="check" size="s" className="ml-auto text-blue-700" />}
              </ActionItem>
            ))}
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}