// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import isEmpty from "lodash/isEmpty";
import { FieldGroup, Label } from "../../common/ui-components";

// --- START: New components and services for "epic" integration ---

// Spinner component (minimal for demo)
const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Mock API service for demonstration purposes. In a commercial app,
// this would be a robust wrapper for actual Gemini API calls or a dedicated backend service.
const geminiLedgerApiService = {
  // Simulate fetching enriched or AI-recommended ledger classes.
  // Gemini could analyze current market trends, user's business type,
  // historical data, etc., to suggest highly relevant ledger classes.
  fetchSmartLedgerClasses: async (currentContext) => {
    console.log("Gemini API: Fetching smart ledger classes with context:", currentContext);
    return new Promise(resolve => {
      setTimeout(() => {
        // Mock data, potentially enriched or prioritized by Gemini
        const mockData = [
          { value: "expense_software_ai", label: "AI Software Subscriptions (Gemini Recommended)", description: "Categorized by Gemini for high relevance in tech operations." },
          { value: "revenue_consulting_ai", label: "Consulting Income (Smart-Suggested)", description: "Predicted frequent use based on business type and recent activity." },
          { value: "asset_ai_research_dev", label: "AI Research & Development (New Category)", description: "Emerging category based on industry trends analysis for innovative businesses." },
          { value: "liability_cloud_hosting", label: "Cloud Hosting & AI Infrastructure", description: "Essential for modern application development and scaling." },
          { value: "expense_travel_ai_summit", label: "AI Summit Travel (Event-specific)", description: "Automated suggestion for event-related expenses based on calendar integration." },
          { value: "equity_investments_ai", label: "AI & Tech Investments (High Growth)", description: "Proactive suggestion for strategic financial planning and portfolio diversification." },
          { value: "expense_marketing_digital_gemini", label: "Digital Marketing (Gemini Optimized)", description: "For campaigns leveraging advanced AI analytics and targeting." }
        ];
        resolve(mockData);
      }, 1500); // Simulate network delay for AI processing
    });
  },

  // Simulate an AI-driven validation or enrichment on selection.
  // Gemini could provide real-time risk assessments, compliance notes,
  // or suggest related actions based on the selected ledger class.
  validateAndEnrichSelection: async (selectedValue, context) => {
    console.log("Gemini API: Validating and enriching selection:", selectedValue, context);
    return new Promise(resolve => {
      setTimeout(() => {
        const enrichment = {
          riskScore: Math.floor(Math.random() * 5) + 1, // 1-5, AI-assessed risk
          complianceNotes: selectedValue.includes("AI") ? "Potential regulatory considerations for AI-related transactions. Consult legal counsel." : "Standard compliance noted.",
          suggestedActions: ["Review budget for category", "Set up recurring entry"]
        };
        if (selectedValue === "asset_ai_research_dev") {
          enrichment.suggestedActions.push("Apply for R&D tax credit (AI-specific)");
        }
        resolve(enrichment);
      }, 700);
    });
  }
};

// Custom SmartSelectField component to make the UI more engaging and informative.
// In an "epic" application, this could feature autocomplete, rich tooltips,
// visual indicators of AI recommendations, etc.
const SmartSelectField = ({
  selectValue,
  helpText,
  disabled,
  options,
  handleChange,
  name,
  onOptionSelected, // New prop for post-selection actions
  isLoading,
  aiInsights, // New prop for displaying AI insights
}) => {
  const handleInternalChange = useCallback((e) => {
    handleChange(e);
    if (onOptionSelected) {
      const selectedOption = options.find(opt => opt.value === e.target.value);
      if (selectedOption) {
        onOptionSelected(selectedOption);
      }
    }
  }, [handleChange, onOptionSelected, options]);

  const selectedOptionDescription = options.find(opt => opt.value === selectValue)?.description;

  return (
    <div>
      <select
        id={name}
        name={name}
        value={selectValue}
        onChange={handleInternalChange}
        disabled={disabled || isLoading}
        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${disabled || isLoading ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}`}
      >
        <option value="" disabled>
          {isLoading ? "Summoning Smart Options..." : "Select an AI-powered Ledger Class..."}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helpText && <p className="text-sm text-gray-500 mt-1">{helpText}</p>}
      {selectedOptionDescription && selectValue && (
        <p className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md text-sm text-gray-700">
          <span className="font-semibold text-blue-800">Description:</span> {selectedOptionDescription}
        </p>
      )}
      {aiInsights && selectValue && (
        <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg shadow-sm text-sm">
          <p className="font-bold text-lg text-purple-800 flex items-center mb-1">
            <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
            Gemini Insights for "{options.find(opt => opt.value === selectValue)?.label}":
          </p>
          <p className="mt-1"><span className="font-semibold text-purple-700">Risk Score:</span> <span className={`font-bold ${aiInsights.riskScore > 3 ? 'text-red-600' : 'text-green-600'}`}>{aiInsights.riskScore}/5</span></p>
          <p className="mt-1"><span className="font-semibold text-purple-700">Compliance Notes:</span> <span className="text-indigo-700">{aiInsights.complianceNotes}</span></p>
          {aiInsights.suggestedActions && aiInsights.suggestedActions.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold text-purple-700">Suggested Actions:</p>
              <ul className="list-disc list-inside text-indigo-700">
                {aiInsights.suggestedActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- END: New components and services for "epic" integration ---


function AccountingLedgerClassSelect({
  label,
  helpText,
  // `ledgerEntities` from Redux is now primarily for contextual data for Gemini
  // and as a potential fallback, rather than the primary source of options.
  ledgerEntities,
  input: { name, value: selectValue, onChange: handleChange },
  disabled,
}) {
  const [smartLedgerOptions, setSmartLedgerOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);

  // Effect to load options from the "Gemini-powered" service.
  // This replaces the static memoized options from the original code.
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      setAiInsights(null); // Clear previous insights when options reload
      try {
        // Use `ledgerEntities` as context for Gemini to personalize suggestions.
        // This is where external app data (CRM, ERP, etc.) would be aggregated for AI.
        const context = {
          existingLedgerClassNames: ledgerEntities.allIds.map(id => ledgerEntities.byId[id].data.name),
          businessType: "FinTech Demo Corp (Commercial Standard)", // Example dynamic context
          userRole: "Financial Analyst",
          recentTransactionsSummary: "High volume in cloud services and AI tooling."
        };
        const options = await geminiLedgerApiService.fetchSmartLedgerClasses(context);
        setSmartLedgerOptions(options);
      } catch (error) {
        console.error("Failed to fetch smart ledger classes from Gemini service:", error);
        // Fallback to local Redux options if Gemini integration fails,
        // ensuring robustness for commercial standards.
        const fallbackOptions = [];
        ledgerEntities.allIds.forEach((id) => {
          const ledgerEntity = ledgerEntities.byId[id];
          if (ledgerEntity.ledger_sync_type === "ledger_class") {
            const { id: value, data: { name: optionLabel } } = ledgerEntity;
            fallbackOptions.push({ value, label: `[Fallback] ${optionLabel}` });
          }
        });
        setSmartLedgerOptions(fallbackOptions);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [ledgerEntities.allIds, ledgerEntities.byId]); // Rerun if Redux ledger entities change (for context or fallback)

  // Effect to get AI insights when a ledger class is selected.
  // This demonstrates Gemini actively enhancing user interaction post-selection.
  useEffect(() => {
    if (selectValue) {
      const getInsights = async () => {
        setIsProcessingSelection(true);
        try {
          // Pass context to the AI for richer, transaction-specific insights.
          // This context could come from other form fields, user profile, etc.
          const context = {
            transactionAmount: "1000.00", // Example dynamic context
            currency: "USD",
            userLocation: "New York, USA",
            // Imagine more context like "invoice_id", "vendor_name" etc.
          };
          const insights = await geminiLedgerApiService.validateAndEnrichSelection(selectValue, context);
          setAiInsights(insights);
        } catch (error) {
          console.error("Failed to get AI insights for selection:", error);
          setAiInsights({ riskScore: "N/A", complianceNotes: "Could not retrieve AI insights due to service error.", suggestedActions: [] });
        } finally {
          setIsProcessingSelection(false);
        }
      };
      getInsights();
    } else {
      setAiInsights(null); // Clear insights if nothing is selected
    }
  }, [selectValue]); // Only re-run when the selected value changes


  // Handler for when an option is selected. This could trigger further "epic" features,
  // like pre-filling other form fields, triggering advanced workflows, or sending
  // feedback to the AI model for continuous improvement.
  const handleOptionSelected = useCallback(async (selectedOption) => {
    console.log("Option selected in SmartSelectField:", selectedOption);
    // Future expansion for "millions-worth" features:
    // - Triggering predictive autofill for other fields (e.g., description, project code)
    // - Initiating compliance checks in an external regulatory system
    // - Logging user choice for AI model reinforcement learning
    // - Opening a contextual side panel with relevant policies or FAQs
  }, []);

  return (
    <FieldGroup>
      <Label id={name}>{label}</Label>
      {isLoadingOptions ? (
        <div className="flex items-center justify-center p-4 border border-blue-200 rounded-lg bg-blue-50 text-blue-700 text-base shadow-sm">
          <Spinner /> <span className="ml-3 font-medium">Summoning AI-Powered Ledger Options... Please wait.</span>
        </div>
      ) : (
        <SmartSelectField
          selectValue={selectValue}
          helpText={isProcessingSelection ? "Processing Gemini's real-time insights for your selection..." : helpText}
          disabled={disabled || isProcessingSelection}
          options={smartLedgerOptions}
          handleChange={handleChange}
          name={name}
          onOptionSelected={handleOptionSelected}
          isLoading={isLoadingOptions || isProcessingSelection}
          aiInsights={aiInsights}
        />
      )}
    </FieldGroup>
  );
}

const mapStateToProps = (state) => ({
  ledgerEntities: state.ledgerEntities, // Still needed for fallback and AI context
});

export default connect(mapStateToProps, {})(AccountingLedgerClassSelect);