import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { reduxForm, Field, change, formValueSelector } from "redux-form";
import { required, email } from "../../common/ui-components/validations";
import AccountingCategorySelect from "./AccountingCategorySelect";
import AccountingLedgerClassSelect from "./AccountingLedgerClassSelect";
import { loadLedgerEntities } from "../actions";
import ReduxCheckbox from "../../common/deprecated_redux/ReduxCheckbox";
import ReduxInputField from "../../common/deprecated_redux/ReduxInputField";
import {
  FieldGroup,
  FieldsRow,
  Label,
  SelectField,
  Tooltip,
  Button, // Added Button for applying suggestions
} from "../../common/ui-components";
import Gon from "../../common/utilities/gon";
import { useDispatchContext } from "../MessageProvider";

// This is a simulated external service integration for demonstration purposes.
// In a production environment, these would be actual API calls to Google Gemini,
// or other external data enrichment/KYC/financial intelligence platforms.
const aiExternalIntegrationService = {
  // Simulates Gemini enriching counterparty details based on email/name
  enrichCounterpartyDetails: async (inputEmail, inputName) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock logic for specific inputs
        if (inputEmail?.toLowerCase().includes("google.com")) {
          resolve({
            suggestedName: "Google LLC",
            suggestedIndustry: "Technology & AI Solutions",
            location: "Mountain View, CA, USA",
            website: "google.com",
            riskScore: "Low",
          });
        } else if (inputEmail?.toLowerCase().includes("openai.com")) {
          resolve({
            suggestedName: "OpenAI Inc.",
            suggestedIndustry: "Artificial Intelligence Research",
            location: "San Francisco, CA, USA",
            website: "openai.com",
            riskScore: "Low",
          });
        } else if (inputEmail?.toLowerCase().includes("fakemoneyco.xyz")) {
            resolve({
                suggestedName: "Fake Money Co.",
                suggestedIndustry: "High-Risk Investments",
                location: "Offshore",
                website: "fakemoneyco.xyz",
                riskScore: "High",
            });
        } else if (inputName?.toLowerCase().includes("acme corp")) {
            resolve({
                suggestedName: "ACME Corporation",
                suggestedIndustry: "Diversified Holdings",
                location: "Anytown, USA",
                website: "acmecorp.com",
                riskScore: "Medium",
            });
        }
        resolve(null); // No specific suggestion
      }, 1500); // Simulate API call delay
    });
  },

  // Simulates Gemini suggesting accounting categories/classes based on enriched details or input
  suggestAccountingMappings: async (counterpartyDetails) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (counterpartyDetails?.suggestedIndustry?.includes("Technology")) {
          return resolve({
            suggestedCategory: { value: "cloud_services", label: "Cloud Services (AI Recommendation)" },
            suggestedClass: { value: "ai_infrastructure", label: "AI Infrastructure (AI Recommendation)" },
          });
        } else if (counterpartyDetails?.suggestedIndustry?.includes("Investments") || counterpartyDetails?.riskScore === "High") {
          return resolve({
            suggestedCategory: { value: "financial_services", label: "Financial Services (AI Recommendation)" },
            suggestedClass: { value: "high_risk_vendors", label: "High Risk Vendors (AI Recommendation)" },
          });
        } else if (counterpartyDetails?.suggestedIndustry?.includes("Research")) {
            return resolve({
                suggestedCategory: { value: "r&d_expenditure", label: "R&D Expenditure (AI Recommendation)" },
                suggestedClass: { value: "innovation_labs", label: "Innovation Labs (AI Recommendation)" },
            });
        }
        resolve(null);
      }, 1800);
    });
  },

  // Simulates Gemini providing a comprehensive summary, compliance check, or risk assessment
  getCounterpartyInsights: async (counterpartyDetails) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const name = counterpartyDetails.name || counterpartyDetails.suggestedName || "unknown";
        const email = counterpartyDetails.email || "unknown";
        const industry = counterpartyDetails.suggestedIndustry || "unknown";
        const risk = counterpartyDetails.riskScore || "N/A";

        if (risk === "High") {
            resolve(`Gemini AI detected High Risk for ${name}. Industry: ${industry}. Further KYC/AML checks are strongly recommended. Potential red flags: jurisdiction mismatch, unusual business type. Proceed with caution.`);
        } else if (name === "Google LLC" || name === "OpenAI Inc.") {
            resolve(`Gemini AI Verified: ${name} is a reputable entity in '${industry}'. Seamless integration for payments. Risk Assessment: ${risk}.`);
        }
        resolve(`Gemini AI Scan for ${name} (${email}): Industry identified as '${industry}'. Risk Assessment: ${risk}. No immediate concerns. Smart mapping available for accounting.`);
      }, 2000);
    });
  }
};

const ledgerTypeOptions = [
  { value: "customer", label: "Customer" },
  { value: "vendor", label: "Vendor" },
];

function CounterpartyDetailsForm({
  accounting_category: accountingCategory,
  accounting_ledger_class: accountingLedgerClass,
  ledger_type: ledgerType,
  name, // Added name prop from Redux-form
  email, // Added email prop from Redux-form
  change: reduxChange,
  loadLedgerEntities: loadLedgerEntitiesFunc,
  newCounterpartyForm,
}) {
  const { dispatchError } = useDispatchContext();
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiCounterpartySuggestions, setAICounterpartySuggestions] = useState(null);
  const [aiAccountingSuggestions, setAIAccountingSuggestions] = useState(null);
  const [geminiInsights, setGeminiInsights] = useState("");

  const {
    ui: {
      ledger: {
        id: ledgerId = "",
        ledger_classes_enabled: ledgerClassesEnabled = false,
        auto_sync_counterparties_enabled: autoSyncCounterpartiesEnabled = false,
        gemini_integration_enabled: geminiIntegrationEnabled = true, // Assume enabled for this "epic" demo
      } = {},
    },
  } = Gon.gon ?? {};

  useEffect(() => {
    loadLedgerEntitiesFunc(
      { ledger_sync_type: ["account", "ledger_class"] },
      null,
      dispatchError,
    );
  }, [loadLedgerEntitiesFunc, dispatchError]);

  // AI Integration: Enrich counterparty details and get insights
  const triggerAIAssistant = useCallback(async () => {
    // Only trigger if Gemini is enabled and we have enough input
    if (!geminiIntegrationEnabled || (!email && !name)) {
      setAICounterpartySuggestions(null);
      setAIAccountingSuggestions(null);
      setGeminiInsights("");
      return;
    }

    setIsAILoading(true);
    setAICounterpartySuggestions(null); // Clear previous suggestions
    setAIAccountingSuggestions(null);
    setGeminiInsights("");

    try {
      const enrichedDetails = await aiExternalIntegrationService.enrichCounterpartyDetails(email, name);
      setAICounterpartySuggestions(enrichedDetails);

      const combinedDetails = { ...enrichedDetails, name, email }; // Pass current form values too
      const accountingSuggestions = await aiExternalIntegrationService.suggestAccountingMappings(combinedDetails);
      setAIAccountingSuggestions(accountingSuggestions);

      const insights = await aiExternalIntegrationService.getCounterpartyInsights(combinedDetails);
      setGeminiInsights(insights);

    } catch (error) {
      console.error("Gemini AI integration error:", error);
      dispatchError({ message: "Failed to get AI suggestions. Please try again." });
      setAICounterpartySuggestions(null);
      setAIAccountingSuggestions(null);
      setGeminiInsights("Gemini AI Assistant experienced an issue. Check network or try different details.");
    } finally {
      setIsAILoading(false);
    }
  }, [email, name, geminiIntegrationEnabled, dispatchError]);

  // Trigger AI when email or name changes, with a debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      triggerAIAssistant();
    }, 1000); // Debounce AI calls to prevent excessive API hits

    return () => {
      clearTimeout(handler);
    };
  }, [email, name, triggerAIAssistant]);


  const onAccountingCategoryChange = (value) => {
    reduxChange("accounting_category", value, false, false);
  };

  const onAccountingLedgerClassChange = (value) => {
    reduxChange("accounting_ledger_class", value, false, false);
  };

  const onledgerTypeChange = (value) => {
    reduxChange("ledger_type", value, false, false);
  };

  const applyAISuggestedName = () => {
    if (aiCounterpartySuggestions?.suggestedName) {
      reduxChange("name", aiCounterpartySuggestions.suggestedName, false, false);
    }
  };

  const applyAISuggestedCategory = () => {
    if (aiAccountingSuggestions?.suggestedCategory) {
      onAccountingCategoryChange(aiAccountingSuggestions.suggestedCategory.value);
    }
  };

  const applyAISuggestedLedgerClass = () => {
    if (aiAccountingSuggestions?.suggestedClass) {
      onAccountingLedgerClassChange(aiAccountingSuggestions.suggestedClass.value);
    }
  };

  return (
    <div className="form-section">
      {geminiIntegrationEnabled && (
        <div className="gemini-ai-assistant bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-indigo-300 rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden">
          <span className="absolute top-3 right-3 text-indigo-700 font-extrabold text-xs tracking-wider uppercase bg-white bg-opacity-70 px-3 py-1 rounded-full shadow-md">
            Powered by Gemini AI
          </span>
          <h3 className="text-3xl font-extrabold text-indigo-900 mb-3 flex items-center">
            <svg className="w-8 h-8 mr-3 text-blue-600 animate-pulse-slow" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
            CitiForge AI Co-Pilot
            {isAILoading && (
              <span className="ml-4 text-indigo-600 text-base font-semibold animate-bounce">
                Analyzing Counterparty...
              </span>
            )}
          </h3>
          <p className="text-md text-indigo-800 mb-4 leading-relaxed">
            Unleashing the power of Gemini AI to autonomously enrich counterparty data, streamline onboarding,
            and proactively suggest optimal accounting classifications for unparalleled efficiency.
          </p>
          {geminiInsights && (
            <div className={`bg-white bg-opacity-80 border-l-4 p-4 mt-4 rounded-lg shadow-inner ${aiCounterpartySuggestions?.riskScore === "High" ? 'border-red-500 text-red-800' : 'border-blue-500 text-blue-800'}`}>
              <p className="font-bold text-lg mb-1 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"></path></svg>
                AI Co-Pilot Insight:
              </p>
              <p className="text-sm">{geminiInsights}</p>
            </div>
          )}
          {aiCounterpartySuggestions && aiCounterpartySuggestions.suggestedName && (
            <div className="mt-5 p-4 bg-white bg-opacity-90 rounded-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-700">
                  AI-Enriched Name Suggestion: <span className="font-bold text-indigo-900">{aiCounterpartySuggestions.suggestedName}</span>
                </p>
                {aiCounterpartySuggestions.suggestedIndustry && (
                    <p className="text-xs text-gray-500 mt-1">Industry: {aiCounterpartySuggestions.suggestedIndustry}</p>
                )}
              </div>
              <Button size="medium" variant="primary" onClick={applyAISuggestedName} className="min-w-[150px]">
                Apply Smart Name
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mb-4 w-full mint-md:w-96"> {/* Enhanced width */}
        <FieldGroup>
          <Label id="name" className="text-lg font-semibold text-gray-800">Counterparty Name</Label>
          <Field
            name="name"
            type="text"
            component={ReduxInputField}
            validate={[required]}
            required
            placeholder={aiCounterpartySuggestions?.suggestedName || "Enter full legal counterparty name for AI enrichment"}
            className="text-lg p-3 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
          />
        </FieldGroup>
      </div>
      <FieldsRow centered={false} columns={2} gap={6} className="items-end"> {/* Increased gap */}
        <div className="mb-0 w-full mint-md:mb-4 mint-md:w-96">
          <FieldGroup>
            <Label id="email" className="text-lg font-semibold text-gray-800">Contact Email</Label>
            <Field
              name="email"
              type="text"
              component={ReduxInputField}
              validate={[email]}
              helpText="Leverage AI by providing an email for auto-discovery and pre-population of details."
              placeholder="e.g., vendor@example.com"
              className="text-lg p-3 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
            />
          </FieldGroup>
        </div>
        <div className="mb-2 flex items-center md:justify-start"> {/* Adjusted alignment */}
          <FieldGroup direction="left-to-right">
            <Field name="send_remittance_advice" component={ReduxCheckbox} className="h-5 w-5 text-blue-600 focus:ring-blue-500" />
            <Label className="ml-3 text-base font-medium text-gray-700">
                AI-Optimized Remittance Advice <Tooltip className="tooltip-holder" data-tip="Enable AI to personalize remittance advice with dynamic insights and sentiment analysis for stronger relationships." />
            </Label>
          </FieldGroup>
        </div>
      </FieldsRow>
      {ledgerId && (
        <div className="form-section mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            <span>Intelligent Accounting Defaults</span>
            <span className="addendum ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">AI-ASSISTED OPTIONAL</span>
            <Tooltip
              className="tooltip-holder"
              data-tip="These AI-driven accounting details will be pre-selected for maximum accuracy when creating a payment order involving this counterparty."
            />
          </h3>
          {geminiIntegrationEnabled && aiAccountingSuggestions && (
            <div className="gemini-accounting-suggestions p-5 bg-indigo-50 border-2 border-indigo-300 rounded-xl mb-6 shadow-md">
              <p className="text-md font-bold text-indigo-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6a2 2 0 00-2-2H5a2 2 0 00-2 2v13m7 0V6a2 2 0 012-2h2a2 2 0 012 2v13m-7 0H7m7 0h2M7 19h2m-7 0h2m-7 0H2a2 2 0 00-2 2v2a2 2 0 002 2h19a2 2 0 002-2v-2a2 2 0 00-2-2h-3"></path></svg>
                AI Co-Pilot's Recommended Accounting Mappings
              </p>
              {aiAccountingSuggestions.suggestedCategory && (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg mb-2 shadow-sm">
                  <p className="text-base text-gray-700">
                    Category: <span className="font-semibold text-indigo-900">{aiAccountingSuggestions.suggestedCategory.label}</span>
                  </p>
                  <Button size="small" variant="secondary" onClick={applyAISuggestedCategory} className="min-w-[80px]">
                    Apply
                  </Button>
                </div>
              )}
              {ledgerClassesEnabled && aiAccountingSuggestions.suggestedClass && (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-base text-gray-700">
                    Class: <span className="font-semibold text-indigo-900">{aiAccountingSuggestions.suggestedClass.label}</span>
                  </p>
                  <Button size="small" variant="secondary" onClick={applyAISuggestedLedgerClass} className="min-w-[80px]">
                    Apply
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="form-row flex flex-wrap md:flex-nowrap gap-6"> {/* Modernized flex layout */}
            <Field
              label="Accounting Category"
              helpText="The AI has analyzed your accounting system to provide context-aware category suggestions."
              component={AccountingCategorySelect}
              name="accounting_category"
              selectValue={accountingCategory}
              handleChange={onAccountingCategoryChange}
              className="w-full md:w-1/2"
            />
            {ledgerClassesEnabled && (
              <Field
                label="Accounting Class"
                helpText="AI-powered suggestions help you classify transactions with unprecedented accuracy."
                component={AccountingLedgerClassSelect}
                name="accounting_ledger_class"
                selectValue={accountingLedgerClass}
                handleChange={onAccountingLedgerClassChange}
                className="w-full md:w-1/2"
              />
            )}
          </div>
          {autoSyncCounterpartiesEnabled && newCounterpartyForm && (
            <div className="form-row flex mt-6">
              <FieldGroup direction="top-to-bottom" className="w-full md:w-1/2">
                <Label
                  helpText="The AI Co-Pilot can intelligently determine the best ledger type for seamless syncing."
                  id="ledger_type"
                  className="text-lg font-semibold text-gray-800"
                >
                  Ledger Type (AI Assisted)
                </Label>
                <SelectField
                  name="ledger_type"
                  handleChange={onledgerTypeChange}
                  selectValue={ledgerType}
                  options={ledgerTypeOptions}
                  className="p-3 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200"
                />
              </FieldGroup>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const selector = formValueSelector("counterparty");
function mapStateToProps(state) {
  return {
    name: selector(state, "name"), // Added name to props for AI
    email: selector(state, "email"), // Added email to props for AI
    accounting_category: selector(state, "accounting_category"),
    accounting_ledger_class: selector(state, "accounting_ledger_class"),
    ledger_type: selector(state, "ledger_type"),
  };
}

export default compose(
  connect(mapStateToProps, { change, loadLedgerEntities }),
  reduxForm({ form: "counterparty" }),
)(CounterpartyDetailsForm);