import { Field, useFormikContext } from "formik";
import React, { useState, useEffect } from "react";
import { FieldGroup, Label } from "../../common/ui-components";
import { CurrencyEnum } from "../../generated/dashboard/graphqlSchema";
import { FormikSelectField, FormikErrorMessage } from "../../common/formik";

// --- START: Simulate External AI/Gemini Integration ---
/**
 * Simulates fetching an AI-powered exchange rate from an external service (e.g., Gemini-powered API).
 * In a real-world scenario, this would be an actual API call to a backend endpoint
 * that leverages AI/ML models to provide optimized or predictive exchange rates.
 * It's designed to mimic commercial standards by being an async operation with simulated latency.
 */
async function fetchAIPoweredExchangeRate(
  fromCurrency: CurrencyEnum,
  toCurrency: CurrencyEnum
): Promise<string> {
  console.log(
    `[AIGlobalCurrencyExchange] Requesting AI-powered exchange rate for ${fromCurrency} to ${toCurrency}...`
  );
  // Simulate network delay and AI processing for a more realistic user experience
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1500 + 500));

  // In a real application, this would fetch actual, dynamic, AI-optimized data.
  // For this demonstration, we return a plausible, dynamic string, clearly indicating AI involvement.
  const baseRate = parseFloat((Math.random() * 0.5 + 0.75).toFixed(4)); // Base rate simulation
  const aiAdjustment = parseFloat((Math.random() * 0.05 - 0.025).toFixed(4)); // AI's slight adjustment
  const finalRate = (baseRate + aiAdjustment).toFixed(4);

  return `AI-Optimized Rate: 1 ${fromCurrency} = ${finalRate} ${toCurrency} (Powered by Gemini)`;
}
// --- END: Simulate External AI/Gemini Integration ---

const currencyOptions = Object.values(CurrencyEnum).map((value) => ({
  label: value,
  value,
}));

export interface AIPoweredCurrencyExchangeProps {
  sourceCurrencyFieldName?: string; // Field name for the primary currency selection
  targetCurrencyFieldName?: string; // Field name for the secondary currency selection (for exchange)
}

/**
 * An advanced currency exchange component that integrates with AI for optimized rate suggestions.
 * This component aims to elevate a standard currency selector into an intelligent exchange tool,
 * showcasing how external AI (like Gemini) can "spice up" core functionalities.
 */
function AIPoweredCurrencyExchange({
  sourceCurrencyFieldName = "sourceCurrency", // Default name for primary currency in Formik
  targetCurrencyFieldName = "targetCurrency", // Default name for target currency in Formik
}: AIPoweredCurrencyExchangeProps) {
  // Leverage Formik context to access and manage form values seamlessly
  const { values } = useFormikContext<any>();

  const sourceCurrency = values[sourceCurrencyFieldName] as CurrencyEnum;
  const targetCurrency = values[targetCurrencyFieldName] as CurrencyEnum;

  const [aiRateSuggestion, setAiRateSuggestion] = useState<string | null>(null);
  const [isLoadingAiRate, setIsLoadingAiRate] = useState<boolean>(false);

  // Effect to automatically fetch AI rate when source or target currencies change
  useEffect(() => {
    const getRate = async () => {
      if (sourceCurrency && targetCurrency && sourceCurrency !== targetCurrency) {
        setIsLoadingAiRate(true);
        setAiRateSuggestion("Fetching AI-optimized rate...");
        try {
          const rate = await fetchAIPoweredExchangeRate(sourceCurrency, targetCurrency);
          setAiRateSuggestion(rate);
        } catch (error) {
          console.error("Failed to fetch AI-powered rate:", error);
          setAiRateSuggestion("Error fetching AI-optimized rate. Please try again.");
        } finally {
          setIsLoadingAiRate(false);
        }
      } else if (!sourceCurrency || !targetCurrency) {
        setAiRateSuggestion(null); // Clear suggestion if not enough currencies are selected
      } else if (sourceCurrency === targetCurrency) {
        setAiRateSuggestion("Please select two different currencies for AI-powered insights.");
      }
    };

    getRate();
  }, [sourceCurrency, targetCurrency]); // Re-run effect whenever currencies change

  return (
    <>
      <FieldGroup key="sourceCurrencySelection">
        <Label id={sourceCurrencyFieldName}>Your Primary Currency (Source)</Label>
        <Field
          id={sourceCurrencyFieldName}
          name={sourceCurrencyFieldName}
          options={currencyOptions}
          component={FormikSelectField}
        />
        <FormikErrorMessage name={sourceCurrencyFieldName} />
      </FieldGroup>

      <FieldGroup key="targetCurrencySelection">
        <Label id={targetCurrencyFieldName}>Target Exchange Currency</Label>
        <Field
          id={targetCurrencyFieldName}
          name={targetCurrencyFieldName}
          options={currencyOptions}
          component={FormikSelectField}
        />
        <FormikErrorMessage name={targetCurrencyFieldName} />
      </FieldGroup>

      {/* Dedicated section for AI/External App integration insights, styled for impact */}
      <FieldGroup key="aiExchangeInsights">
        <Label id="aiInsightsHeader">AI-Powered Exchange Insights</Label>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#e3f2fd", // Softer blue for a modern, intelligent feel
            border: "1px solid #90caf9",
            borderRadius: "8px",
            marginBottom: "15px",
            minHeight: "60px", // Ensure visibility
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // Center text for better presentation
            color: "#1565c0", // Darker blue text for contrast
            fontWeight: "600", // Slightly bolder for emphasis
            fontSize: "1rem", // Readable font size
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Subtle shadow for depth
          }}
        >
          {isLoadingAiRate ? (
            // Animated loading state for a dynamic user experience
            <span
              style={{
                display: "inline-block",
                animation: "pulse 1.2s infinite ease-in-out",
                color: "#1976d2",
              }}
            >
              🚀 Loading AI-optimized insights from Gemini...
            </span>
          ) : (
            // Display AI suggestion or guidance
            aiRateSuggestion || "Select two different currencies above to unlock AI-powered insights!"
          )}
          {/* Inline CSS for the pulse animation to ensure it's executable */}
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.02); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#607d8b", textAlign: "center" }}>
          Leveraging cutting-edge AI for predictive exchange rates and strategic financial guidance.
        </p>
      </FieldGroup>
    </>
  );
}

export default AIPoweredCurrencyExchange;