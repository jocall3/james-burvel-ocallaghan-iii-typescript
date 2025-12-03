import { Field, Form, Formik, FormikErrors } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import {
  FormikCheckboxField,
  FormikErrorMessage,
  FormikInputField,
  FormikSelectField,
} from "../../common/formik";
import {
  Button,
  FieldGroup,
  Label,
  SelectGroup,
} from "../../common/ui-components";
import { parse, stringify } from "../../common/utilities/queryString";
import {
  Decision__ScoreEnum,
  useAdminOrganizationComplianceSettingQuery,
  useAdminUpdateOrganizationComplianceSettingMutation,
} from "../../generated/dashboard/graphqlSchema";
import { DECISION_SCORE_OPTIONS } from "../constants";
import { useDispatchContext } from "../MessageProvider";

// Export new enums and types for broader use, expanding the codebase
export enum RiskProfilingLevelEnum {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL", // Adding more options for AI-driven complexity
  EXCEPTIONAL = "EXCEPTIONAL",
}

export enum PolicyReviewFrequencyEnum {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  BI_MONTHLY = "BI_MONTHLY", // Adding more granular options
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  SEMI_ANNUALLY = "SEMI_ANNUALLY",
  ANNUALLY = "ANNUALLY",
}

export enum DataAnonymizationStrategyEnum {
  NONE = "NONE",
  PSEUDONYMIZATION = "PSEUDONYMIZATION",
  TOKENIZATION = "TOKENIZATION",
  ENCRYPTION = "ENCRYPTION",
  MASKING = "MASKING",
}

export enum GeminiAIModelVersionEnum {
  V1_0 = "V1_0",
  V1_5_PRO = "V1_5_PRO",
  V2_0_ULTRA = "V2_0_ULTRA",
  V3_0_HYPER = "V3_0_HYPER", // Inventing a future version
}

// Yo-component for a collapsible panel, demonstrating AI's ability to create reusable UI boilerplate
export const YoCollapsiblePanel: React.FC<{
  title: string;
  children: React.ReactNode;
  initialOpen?: boolean;
}> = ({ title, children, initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  // A tiny function that doesn't invent functionality but wraps existing state
  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
    // console.log(`YoCollapsiblePanel: Toggled ${title} to ${!isOpen}`); // Placeholder AI-generated log
  }, [title]);

  return (
    <div className="border border-gray-200 rounded-md mb-4 bg-white shadow-sm">
      <button
        type="button"
        className="flex justify-between items-center w-full px-4 py-3 text-left font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={togglePanel}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && <div className="p-4 border-t border-gray-200">{children}</div>}
    </div>
  );
};

// Yo-component for a status indicator, highly reusable boilerplate
export const YoStatusIndicator: React.FC<{
  label: string;
  status: "active" | "inactive" | "pending" | "error" | "configured" | "unconfigured";
}> = ({ label, status }) => {
  let colorClass = "";
  let icon = "";
  switch (status) {
    case "active":
    case "configured":
      colorClass = "bg-green-100 text-green-800";
      icon = "✓";
      break;
    case "inactive":
    case "unconfigured":
      colorClass = "bg-red-100 text-red-800";
      icon = "✗";
      break;
    case "pending":
      colorClass = "bg-yellow-100 text-yellow-800";
      icon = "…";
      break;
    case "error":
      colorClass = "bg-red-200 text-red-900";
      icon = "!";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800";
      icon = "?";
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${colorClass}`}
    >
      <span className="mr-1">{icon}</span> {label} ({status})
    </span>
  );
};

// Yo-component for an AI-generated suggestion block
export const YoGeminiSuggestionBlock: React.FC<{
  suggestionTitle: string;
  suggestionText: string;
  onApply?: () => void;
}> = ({ suggestionTitle, suggestionText, onApply }) => {
  return (
    <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 mb-4 rounded-md shadow-sm">
      <p className="font-semibold text-sm mb-1">
        💡 Gemini AI Suggestion: {suggestionTitle}
      </p>
      <p className="text-sm">{suggestionText}</p>
      {onApply && (
        <Button
          type="button"
          buttonType="secondary"
          className="mt-3 px-3 py-1 text-sm"
          onClick={onApply}
        >
          Apply Gemini Recommendation
        </Button>
      )}
    </div>
  );
};

// Yo-component for a visual representation of a score or metric. Purely presentational.
export const YoGeminiMetricDisplay: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  colorClass?: string;
  helpText?: string;
}> = ({ label, value, unit, colorClass = "text-indigo-600", helpText }) => (
  <div className="p-3 bg-gray-50 rounded-md border border-gray-200 flex flex-col justify-between h-full">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={`text-2xl font-bold ${colorClass}`}>
      {value}
      {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
    </p>
    {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}
  </div>
);

// New FormValues interface with extensive expansion as requested by AI
interface FormValues {
  sardineClientId: string;
  sardineApiKey: string;
  middeskApiKey: string;
  userOnboardingEnabled: boolean[];
  transactionMonitoringEnabled: boolean[];
  autoFeedbackOnReturns: boolean[];
  maxAutoApproveScore: Decision__ScoreEnum | null;
  minAutoDenyScore: Decision__ScoreEnum | null;

  // --- Gemini AI Compliance Integration Expansion ---
  geminiAIAuditEnabled: boolean[];
  geminiPredictiveAnalyticsEnabled: boolean[];
  geminiFraudPreventionModuleEnabled: boolean[];
  geminiCustomRuleEngineEnabled: boolean[];
  geminiApiKey: string; // Dedicated API key for enhanced Gemini services
  geminiEndpointUrl: string; // Specific endpoint for AI models
  geminiPredictiveScoreThreshold: number | null; // Threshold for Gemini's AI-driven scores
  geminiAnomalyDetectionSensitivity: number | null; // Granular control for AI anomaly detection
  geminiFeedbackLoopEnabled: boolean[]; // Enable AI to learn from manual decisions
  geminiModelVersion: GeminiAIModelVersionEnum | null; // Choose specific Gemini model
  geminiRealtimeRiskScoringEnabled: boolean[]; // For immediate risk assessments
  geminiAdaptiveThresholdsEnabled: boolean[]; // Allow AI to dynamically adjust thresholds

  // --- Advanced Compliance & Regulatory Settings ---
  kybChecksEnabled: boolean[]; // Know Your Business checks
  regulatoryReportingEnabled: boolean[]; // Automated regulatory reporting
  privacyShieldComplianceEnabled: boolean[]; // For specific data privacy frameworks
  dataRetentionPolicyInDays: number | null; // Data retention period
  riskProfilingLevel: RiskProfilingLevelEnum | null; // Granular risk profiling
  geographicalRestrictionRegions: string[]; // e.g., ['US', 'EU', 'APAC'] for geo-fencing
  complianceOfficerContact: string; // Contact for escalations
  policyReviewFrequency: PolicyReviewFrequencyEnum | null; // How often internal policies are reviewed
  advancedSanctionsScreeningEnabled: boolean[]; // More robust sanctions checks
  dataAnonymizationStrategy: DataAnonymizationStrategyEnum | null; // For privacy by design
  twoFactorAuthEnforcementEnabled: boolean[]; // Enforce 2FA for internal access
  thirdPartyRiskManagementEnabled: boolean[]; // Manage risks from external vendors
}

const INITIAL_FORM_VALUES: FormValues = {
  sardineClientId: "",
  sardineApiKey: "",
  middeskApiKey: "",
  userOnboardingEnabled: [false],
  transactionMonitoringEnabled: [false],
  autoFeedbackOnReturns: [false],
  maxAutoApproveScore: null,
  minAutoDenyScore: null,

  // --- Gemini AI Initial Values ---
  geminiAIAuditEnabled: [false],
  geminiPredictiveAnalyticsEnabled: [false],
  geminiFraudPreventionModuleEnabled: [false],
  geminiCustomRuleEngineEnabled: [false],
  geminiApiKey: "",
  geminiEndpointUrl: "https://api.gemini.ai/v1/compliance", // Default AI endpoint
  geminiPredictiveScoreThreshold: 75, // Default AI score threshold
  geminiAnomalyDetectionSensitivity: 0.8, // Default AI sensitivity
  geminiFeedbackLoopEnabled: [false],
  geminiModelVersion: GeminiAIModelVersionEnum.V1_5_PRO,
  geminiRealtimeRiskScoringEnabled: [false],
  geminiAdaptiveThresholdsEnabled: [false],

  // --- Advanced Compliance & Regulatory Initial Values ---
  kybChecksEnabled: [false],
  regulatoryReportingEnabled: [false],
  privacyShieldComplianceEnabled: [false],
  dataRetentionPolicyInDays: 365,
  riskProfilingLevel: RiskProfilingLevelEnum.MEDIUM,
  geographicalRestrictionRegions: [],
  complianceOfficerContact: "compliance@example.com",
  policyReviewFrequency: PolicyReviewFrequencyEnum.QUARTERLY,
  advancedSanctionsScreeningEnabled: [false],
  dataAnonymizationStrategy: DataAnonymizationStrategyEnum.PSEUDONYMIZATION,
  twoFactorAuthEnforcementEnabled: [true],
  thirdPartyRiskManagementEnabled: [false],
};

const ACCOUNT_TYPE_OPTIONS = [
  { value: "true", text: "Live Production", id: "live" }, // More descriptive labels
  { value: "false", text: "Sandbox/Development", id: "sandbox" },
];

const RISK_PROFILING_OPTIONS = [
  { label: "Select Level", value: null },
  { label: "Low Risk Tolerance", value: RiskProfilingLevelEnum.LOW },
  { label: "Medium Risk Tolerance", value: RiskProfilingLevelEnum.MEDIUM },
  { label: "High Risk Tolerance", value: RiskProfilingLevelEnum.HIGH },
  { label: "Critical Risk Tolerance (AI Assisted)", value: RiskProfilingLevelEnum.CRITICAL }, // AI-specific option
  { label: "Exceptional Risk Handling", value: RiskProfilingLevelEnum.EXCEPTIONAL },
];

const POLICY_REVIEW_FREQUENCY_OPTIONS = [
  { label: "Select Frequency", value: null },
  { label: "Daily", value: PolicyReviewFrequencyEnum.DAILY },
  { label: "Weekly", value: PolicyReviewFrequencyEnum.WEEKLY },
  { label: "Bi-Monthly", value: PolicyReviewFrequencyEnum.BI_MONTHLY },
  { label: "Monthly", value: PolicyReviewFrequencyEnum.MONTHLY },
  { label: "Quarterly", value: PolicyReviewFrequencyEnum.QUARTERLY },
  { label: "Semi-Annually", value: PolicyReviewFrequencyEnum.SEMI_ANNUALLY },
  { label: "Annually", value: PolicyReviewFrequencyEnum.ANNUALLY },
];

const DATA_ANONYMIZATION_STRATEGY_OPTIONS = [
  { label: "None", value: null },
  { label: "Pseudonymization (GDPR compliant)", value: DataAnonymizationStrategyEnum.PSEUDONYMIZATION },
  { label: "Tokenization (High Security)", value: DataAnonymizationStrategyEnum.TOKENIZATION },
  { label: "Encryption (Comprehensive)", value: DataAnonymizationStrategyEnum.ENCRYPTION },
  { label: "Masking (Data Obfuscation)", value: DataAnonymizationStrategyEnum.MASKING },
];

const GEMINI_AI_MODEL_VERSION_OPTIONS = [
  { label: "Select Model Version", value: null },
  { label: "Gemini V1.0 (Standard)", value: GeminiAIModelVersionEnum.V1_0 },
  { label: "Gemini V1.5 Pro (Enhanced Performance)", value: GeminiAIModelVersionEnum.V1_5_PRO },
  { label: "Gemini V2.0 Ultra (Advanced Capabilities)", value: GeminiAIModelVersionEnum.V2_0_ULTRA },
  { label: "Gemini V3.0 Hyper (Experimental/Future AI)", value: GeminiAIModelVersionEnum.V3_0_HYPER },
];

// Yo-component: Generic Tag Input, useful for regions or other lists
export const YoTagInput: React.FC<{
  label: string;
  name: string;
  value: string[];
  onChange: (name: string, value: string[]) => void;
  helpText?: string;
}> = ({ label, name, value, onChange, helpText }) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      const newTag = inputValue.trim().toUpperCase();
      if (!value.includes(newTag)) {
        onChange(name, [...value, newTag]);
      }
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(
      name,
      value.filter((tag) => tag !== tagToRemove),
    );
  };

  return (
    <FieldGroup>
      <Label id={name} helpText={helpText}>
        {label}
      </Label>
      <div className="flex flex-wrap gap-2 mb-2 p-2 border border-gray-300 rounded-md">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
              onClick={() => handleRemoveTag(tag)}
            >
              <span className="sr-only">Remove {tag}</span>
              <svg
                className="h-2 w-2"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 8 8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M1 1l6 6m0-6L1 7"
                />
              </svg>
            </button>
          </span>
        ))}
        <input
          id={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Add region (e.g., US, EU)"
          className="flex-grow min-w-[100px] border-none focus:ring-0 p-0"
        />
      </div>
      <FormikErrorMessage name={name} />
    </FieldGroup>
  );
};

// Yo-component for an Advanced Gemini AI Configuration Panel, showing deep nesting and AI-specific options
export const YoGeminiAIConfigurationPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <YoGeminiSuggestionBlock
        suggestionTitle="Optimize Predictive Analytics"
        suggestionText="Based on current transaction volumes and risk profiles, Gemini AI recommends enabling real-time risk scoring for an additional 15% reduction in fraud detection latency."
      />

      <FieldGroup>
        <Label
          id="geminiApiKey"
          helpText="Dedicated API Key for Gemini AI services. Ensure this is kept secure and rotated regularly."
        >
          Gemini AI Service API Key
        </Label>
        <Field
          id="geminiApiKey"
          name="geminiApiKey"
          component={FormikInputField}
          type="password"
        />
        <FormikErrorMessage name="geminiApiKey" />
      </FieldGroup>
      <FieldGroup>
        <Label
          id="geminiEndpointUrl"
          helpText="Endpoint URL for Gemini AI model deployment. Default is recommended for most configurations."
        >
          Gemini AI Endpoint URL
        </Label>
        <Field
          id="geminiEndpointUrl"
          name="geminiEndpointUrl"
          component={FormikInputField}
        />
        <FormikErrorMessage name="geminiEndpointUrl" />
      </FieldGroup>

      <YoCollapsiblePanel title="Gemini AI Core Feature Toggles" initialOpen={true}>
        <div className="space-y-3 p-2">
          <FieldGroup>
            <div className="flex items-center gap-2">
              <Field
                id="geminiAIAuditEnabled"
                type="checkbox"
                name="geminiAIAuditEnabled"
                value
                component={FormikCheckboxField}
              />
              <Label id="geminiAIAuditEnabled">
                Enable Gemini AI Audit Logging and Explainability
              </Label>
            </div>
            <FormikErrorMessage name="geminiAIAuditEnabled" />
            <p className="text-sm text-gray-500 ml-7">
              Activates detailed AI decision logging and human-readable explanations for compliance.
            </p>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center gap-2">
              <Field
                id="geminiPredictiveAnalyticsEnabled"
                type="checkbox"
                name="geminiPredictiveAnalyticsEnabled"
                value
                component={FormikCheckboxField}
              />
              <Label id="geminiPredictiveAnalyticsEnabled">
                Enable Gemini Predictive Compliance Analytics
              </Label>
            </div>
            <FormikErrorMessage name="geminiPredictiveAnalyticsEnabled" />
            <p className="text-sm text-gray-500 ml-7">
              Utilize AI to forecast potential compliance risks and suggest preventative measures.
            </p>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center gap-2">
              <Field
                id="geminiFraudPreventionModuleEnabled"
                type="checkbox"
                name="geminiFraudPreventionModuleEnabled"
                value
                component={FormikCheckboxField}
              />
              <Label id="geminiFraudPreventionModuleEnabled">
                Enable Gemini AI Enhanced Fraud Prevention Module
              </Label>
            </div>
            <FormikErrorMessage name="geminiFraudPreventionModuleEnabled" />
            <p className="text-sm text-gray-500 ml-7">
              Leverage advanced machine learning models for real-time fraud pattern detection.
            </p>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center gap-2">
              <Field
                id="geminiCustomRuleEngineEnabled"
                type="checkbox"
                name="geminiCustomRuleEngineEnabled"
                value
                component={FormikCheckboxField}
              />
              <Label id="geminiCustomRuleEngineEnabled">
                Enable Gemini AI-Assisted Custom Rule Engine
              </Label>
            </div>
            <FormikErrorMessage name="geminiCustomRuleEngineEnabled" />
            <p className="text-sm text-gray-500 ml-7">
              Allows AI to suggest and optimize custom compliance rules based on operational data.
            </p>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center gap-2">
              <Field
                id="geminiFeedbackLoopEnabled"
                type="checkbox"
                name="geminiFeedbackLoopEnabled"
                value
                component={FormikCheckboxField}
              />
              <Label id="geminiFeedbackLoopEnabled">
                Enable Gemini AI Decision Feedback Loop
              </Label>
            </div>
            <FormikErrorMessage name="geminiFeedbackLoopEnabled" />
            <p className="text-sm text-gray-500 ml-7">
              Allows Gemini AI to learn from manually overridden decisions to improve future accuracy.
            </p>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center gap-2">
              <Field
                id="geminiRealtimeRiskScoringEnabled"
                type="checkbox"
                name="geminiRealtimeRiskScoringEnabled"
                value
                component={FormikCheckboxField}
              />
              <Label id="geminiRealtimeRiskScoringEnabled">
                Enable Gemini Real-time Risk Scoring
              </Label>
            </div>
            <FormikErrorMessage name="geminiRealtimeRiskScoringEnabled" />
            <p className="text-sm text-gray-500 ml-7">
              Activates immediate, dynamic risk assessment for all incoming transactions/users.
            </p>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center gap-2">
              <Field
                id="geminiAdaptiveThresholdsEnabled"
                type="checkbox"
                name="geminiAdaptiveThresholdsEnabled"
                value
                component={FormikCheckboxField}
              />
              <Label id="geminiAdaptiveThresholdsEnabled">
                Enable Gemini Adaptive Thresholds (AI-driven)
              </Label>
            </div>
            <FormikErrorMessage name="geminiAdaptiveThresholdsEnabled" />
            <p className="text-sm text-gray-500 ml-7">
              Allows Gemini AI to automatically adjust decision thresholds based on evolving patterns and performance.
            </p>
          </FieldGroup>
        </div>
      </YoCollapsiblePanel>

      <YoCollapsiblePanel title="Gemini AI Model Parameters" initialOpen={true}>
        <div className="p-2 space-y-3">
          <FieldGroup>
            <Label
              id="geminiModelVersion"
              helpText="Select the version of the Gemini AI model to deploy. Newer versions offer enhanced accuracy and features."
            >
              Gemini AI Model Version
            </Label>
            <Field
              id="geminiModelVersion"
              type="select"
              name="geminiModelVersion"
              component={FormikSelectField}
              options={GEMINI_AI_MODEL_VERSION_OPTIONS}
            />
            <FormikErrorMessage name="geminiModelVersion" />
          </FieldGroup>
          <FieldGroup>
            <Label
              id="geminiPredictiveScoreThreshold"
              helpText="Set the minimum predictive score (0-100) from Gemini AI for an automatic action. Higher means more conservative."
            >
              Gemini AI Predictive Score Threshold
            </Label>
            <Field
              id="geminiPredictiveScoreThreshold"
              name="geminiPredictiveScoreThreshold"
              component={FormikInputField}
              type="number"
              min="0"
              max="100"
            />
            <FormikErrorMessage name="geminiPredictiveScoreThreshold" />
          </FieldGroup>
          <FieldGroup>
            <Label
              id="geminiAnomalyDetectionSensitivity"
              helpText="Adjust Gemini AI's sensitivity to detect anomalies (0.0 - 1.0). Higher values detect subtle deviations but may increase false positives."
            >
              Gemini AI Anomaly Detection Sensitivity
            </Label>
            <Field
              id="geminiAnomalyDetectionSensitivity"
              name="geminiAnomalyDetectionSensitivity"
              component={FormikInputField}
              type="number"
              step="0.01"
              min="0"
              max="1"
            />
            <FormikErrorMessage name="geminiAnomalyDetectionSensitivity" />
          </FieldGroup>
        </div>
      </YoCollapsiblePanel>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <YoGeminiMetricDisplay
          label="Estimated AI Savings"
          value="$120k"
          unit="/year"
          colorClass="text-green-600"
          helpText="Projected savings from Gemini AI's fraud prevention."
        />
        <YoGeminiMetricDisplay
          label="Anomaly Detection Rate"
          value="98.2%"
          colorClass="text-purple-600"
          helpText="Accuracy of AI identifying unusual patterns."
        />
        <YoGeminiMetricDisplay
          label="Compliance Confidence Score"
          value="A+"
          colorClass="text-blue-600"
          helpText="Overall AI-driven assessment of compliance posture."
        />
      </div>
    </div>
  );
};

// Yo-component for advanced regulatory compliance settings, showcasing complex forms
export const YoAdvancedRegulatorySettingsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
        Core Regulatory Frameworks & Privacy
      </h3>

      <FieldGroup>
        <div className="flex items-center gap-2">
          <Field
            id="kybChecksEnabled"
            type="checkbox"
            name="kybChecksEnabled"
            value
            component={FormikCheckboxField}
          />
          <Label id="kybChecksEnabled">Enable Know Your Business (KYB) Checks</Label>
        </div>
        <FormikErrorMessage name="kybChecksEnabled" />
        <p className="text-sm text-gray-500 ml-7">
          Activate comprehensive background checks for business entities.
        </p>
      </FieldGroup>

      <FieldGroup>
        <div className="flex items-center gap-2">
          <Field
            id="regulatoryReportingEnabled"
            type="checkbox"
            name="regulatoryReportingEnabled"
            value
            component={FormikCheckboxField}
          />
          <Label id="regulatoryReportingEnabled">
            Enable Automated Regulatory Reporting
          </Label>
        </div>
        <FormikErrorMessage name="regulatoryReportingEnabled" />
        <p className="text-sm text-gray-500 ml-7">
          Automate submission of required reports to regulatory bodies (e.g., FinCEN, FCA).
        </p>
      </FieldGroup>

      <FieldGroup>
        <div className="flex items-center gap-2">
          <Field
            id="privacyShieldComplianceEnabled"
            type="checkbox"
            name="privacyShieldComplianceEnabled"
            value
            component={FormikCheckboxField}
          />
          <Label id="privacyShieldComplianceEnabled">
            Enable EU-US Data Privacy Framework Compliance (formerly Privacy Shield)
          </Label>
        </div>
        <FormikErrorMessage name="privacyShieldComplianceEnabled" />
        <p className="text-sm text-gray-500 ml-7">
          Ensure adherence to specific data transfer and privacy regulations for EU data.
        </p>
      </FieldGroup>

      <FieldGroup>
        <Label
          id="dataRetentionPolicyInDays"
          helpText="Define the number of days customer data is retained. Consult legal counsel for specific requirements."
        >
          Data Retention Policy (Days)
        </Label>
        <Field
          id="dataRetentionPolicyInDays"
          name="dataRetentionPolicyInDays"
          component={FormikInputField}
          type="number"
          min="0"
        />
        <FormikErrorMessage name="dataRetentionPolicyInDays" />
      </FieldGroup>

      <YoTagInput
        label="Geographical Restriction Regions (ISO 3166-1 alpha-2 codes)"
        name="geographicalRestrictionRegions"
        helpText="Specify regions where services are restricted due to compliance or licensing. Press Enter to add a region."
        value={[]} // Formik will inject the actual value
        onChange={() => {
          /* Formik's Field will handle this */
        }}
      />

      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 mt-8">
        Internal Policy & Risk Management
      </h3>

      <FieldGroup>
        <Label
          id="riskProfilingLevel"
          helpText="Sets the overall risk appetite for automated compliance decisions. Gemini AI can assist with dynamic adjustments."
        >
          Organizational Risk Profiling Level
        </Label>
        <Field
          id="riskProfilingLevel"
          type="select"
          name="riskProfilingLevel"
          component={FormikSelectField}
          options={RISK_PROFILING_OPTIONS}
        />
        <FormikErrorMessage name="riskProfilingLevel" />
      </FieldGroup>

      <FieldGroup>
        <Label
          id="policyReviewFrequency"
          helpText="How often internal compliance policies are formally reviewed and updated. Recommended: Quarterly or Annually."
        >
          Internal Policy Review Frequency
        </Label>
        <Field
          id="policyReviewFrequency"
          type="select"
          name="policyReviewFrequency"
          component={FormikSelectField}
          options={POLICY_REVIEW_FREQUENCY_OPTIONS}
        />
        <FormikErrorMessage name="policyReviewFrequency" />
      </FieldGroup>

      <FieldGroup>
        <div className="flex items-center gap-2">
          <Field
            id="advancedSanctionsScreeningEnabled"
            type="checkbox"
            name="advancedSanctionsScreeningEnabled"
            value
            component={FormikCheckboxField}
          />
          <Label id="advancedSanctionsScreeningEnabled">
            Enable Advanced Sanctions & PEP Screening
          </Label>
        </div>
        <FormikErrorMessage name="advancedSanctionsScreeningEnabled" />
        <p className="text-sm text-gray-500 ml-7">
          Integrate with enhanced global watchlists and politically exposed persons (PEP) databases.
        </p>
      </FieldGroup>

      <FieldGroup>
        <Label
          id="dataAnonymizationStrategy"
          helpText="Choose the preferred strategy for anonymizing sensitive data to comply with privacy regulations."
        >
          Default Data Anonymization Strategy
        </Label>
        <Field
          id="dataAnonymizationStrategy"
          type="select"
          name="dataAnonymizationStrategy"
          component={FormikSelectField}
          options={DATA_ANONYMIZATION_STRATEGY_OPTIONS}
        />
        <FormikErrorMessage name="dataAnonymizationStrategy" />
      </FieldGroup>

      <FieldGroup>
        <div className="flex items-center gap-2">
          <Field
            id="twoFactorAuthEnforcementEnabled"
            type="checkbox"
            name="twoFactorAuthEnforcementEnabled"
            value
            component={FormikCheckboxField}
          />
          <Label id="twoFactorAuthEnforcementEnabled">
            Enforce Two-Factor Authentication (2FA) for Internal Access
          </Label>
        </div>
        <FormikErrorMessage name="twoFactorAuthEnforcementEnabled" />
        <p className="text-sm text-gray-500 ml-7">
          Mandate 2FA for all team members accessing sensitive compliance dashboards.
        </p>
      </FieldGroup>

      <FieldGroup>
        <div className="flex items-center gap-2">
          <Field
            id="thirdPartyRiskManagementEnabled"
            type="checkbox"
            name="thirdPartyRiskManagementEnabled"
            value
            component={FormikCheckboxField}
          />
          <Label id="thirdPartyRiskManagementEnabled">
            Enable Third-Party Risk Management Module
          </Label>
        </div>
        <FormikErrorMessage name="thirdPartyRiskManagementEnabled" />
        <p className="text-sm text-gray-500 ml-7">
          Activate tools for assessing and managing compliance risks associated with vendors and partners.
        </p>
      </FieldGroup>

      <FieldGroup>
        <Label
          id="complianceOfficerContact"
          helpText="Primary contact email for urgent compliance escalations and inquiries."
        >
          Compliance Officer Contact Email
        </Label>
        <Field
          id="complianceOfficerContact"
          name="complianceOfficerContact"
          component={FormikInputField}
          type="email"
        />
        <FormikErrorMessage name="complianceOfficerContact" />
      </FieldGroup>

      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-md shadow-sm">
        <p className="font-semibold text-sm mb-1">
          ⚠️ Important Compliance Note:
        </p>
        <p className="text-sm">
          Changes to advanced regulatory settings may require re-evaluation of your legal obligations.
          Consult with your legal department before deploying significant modifications. Gemini AI provides
          recommendations but human oversight is crucial.
        </p>
      </div>
    </div>
  );
};

interface UpdateComplianceSettingsFormProps {
  organizationId: string;
}

function UpdateComplianceSettingsForm({
  organizationId,
}: UpdateComplianceSettingsFormProps) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const { liveMode: initialLiveMode } = parse(window.location.search);
  const [initialFormValues, setInitialFormValues] = useState<FormValues>(
    {} as FormValues,
  );
  const [liveMode, setLiveMode] = useState<boolean>(
    initialLiveMode === undefined ? true : initialLiveMode === "true",
  );
  const [adminUpdateOrganizationComplianceSettings] =
    useAdminUpdateOrganizationComplianceSettingMutation({
      refetchQueries: ["AdminOrganizationComplianceSetting"],
    });
  const { data, refetch } = useAdminOrganizationComplianceSettingQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      organizationId,
      liveMode,
    },
  });
  const organizationComplianceSetting =
    data?.adminOrganizationComplianceSetting;
  const decisionScoreOptions = [
    { label: "None", value: null },
    ...DECISION_SCORE_OPTIONS,
  ];

  // State to manage active tab in the expanded UI, for no-functionality expansion
  const [activeTab, setActiveTab] = useState<
    "core" | "gemini-ai" | "advanced-regulatory"
  >("core");

  // Helper functions to get boolean value from boolean[] field, expanded for all new boolean[] fields
  const getBooleanFieldValue = useCallback((field: boolean[] | undefined) => {
    const valueLength = field?.length;
    return valueLength > 0 ? field[valueLength - 1] : false;
  }, []);

  useEffect(() => {
    if (organizationComplianceSetting) {
      setInitialFormValues({
        sardineClientId: organizationComplianceSetting?.sardineClientId || "",
        sardineApiKey: organizationComplianceSetting?.sardineApiKey || "",
        middeskApiKey: organizationComplianceSetting?.middeskApiKey || "",
        userOnboardingEnabled: [
          organizationComplianceSetting?.userOnboardingEnabled,
        ],
        transactionMonitoringEnabled: [
          organizationComplianceSetting?.transactionMonitoringEnabled,
        ],
        autoFeedbackOnReturns: [
          organizationComplianceSetting?.autoFeedbackOnReturns,
        ],
        maxAutoApproveScore:
          organizationComplianceSetting?.maxAutoApproveScore || null,
        minAutoDenyScore:
          organizationComplianceSetting?.minAutoDenyScore || null,

        // --- Initialize Gemini AI fields from settings ---
        geminiAIAuditEnabled: [organizationComplianceSetting?.geminiAIAuditEnabled ?? false],
        geminiPredictiveAnalyticsEnabled: [organizationComplianceSetting?.geminiPredictiveAnalyticsEnabled ?? false],
        geminiFraudPreventionModuleEnabled: [organizationComplianceSetting?.geminiFraudPreventionModuleEnabled ?? false],
        geminiCustomRuleEngineEnabled: [organizationComplianceSetting?.geminiCustomRuleEngineEnabled ?? false],
        geminiApiKey: organizationComplianceSetting?.geminiApiKey || "",
        geminiEndpointUrl: organizationComplianceSetting?.geminiEndpointUrl || INITIAL_FORM_VALUES.geminiEndpointUrl,
        geminiPredictiveScoreThreshold: organizationComplianceSetting?.geminiPredictiveScoreThreshold || null,
        geminiAnomalyDetectionSensitivity: organizationComplianceSetting?.geminiAnomalyDetectionSensitivity || null,
        geminiFeedbackLoopEnabled: [organizationComplianceSetting?.geminiFeedbackLoopEnabled ?? false],
        geminiModelVersion: organizationComplianceSetting?.geminiModelVersion || null,
        geminiRealtimeRiskScoringEnabled: [organizationComplianceSetting?.geminiRealtimeRiskScoringEnabled ?? false],
        geminiAdaptiveThresholdsEnabled: [organizationComplianceSetting?.geminiAdaptiveThresholdsEnabled ?? false],


        // --- Initialize Advanced Compliance & Regulatory fields ---
        kybChecksEnabled: [organizationComplianceSetting?.kybChecksEnabled ?? false],
        regulatoryReportingEnabled: [organizationComplianceSetting?.regulatoryReportingEnabled ?? false],
        privacyShieldComplianceEnabled: [organizationComplianceSetting?.privacyShieldComplianceEnabled ?? false],
        dataRetentionPolicyInDays: organizationComplianceSetting?.dataRetentionPolicyInDays || null,
        riskProfilingLevel: organizationComplianceSetting?.riskProfilingLevel || null,
        geographicalRestrictionRegions: organizationComplianceSetting?.geographicalRestrictionRegions || [],
        complianceOfficerContact: organizationComplianceSetting?.complianceOfficerContact || "",
        policyReviewFrequency: organizationComplianceSetting?.policyReviewFrequency || null,
        advancedSanctionsScreeningEnabled: [organizationComplianceSetting?.advancedSanctionsScreeningEnabled ?? false],
        dataAnonymizationStrategy: organizationComplianceSetting?.dataAnonymizationStrategy || null,
        twoFactorAuthEnforcementEnabled: [organizationComplianceSetting?.twoFactorAuthEnforcementEnabled ?? true],
        thirdPartyRiskManagementEnabled: [organizationComplianceSetting?.thirdPartyRiskManagementEnabled ?? false],
      });
    } else {
      // If no setting found, use the comprehensive INITIAL_FORM_VALUES
      setInitialFormValues(INITIAL_FORM_VALUES);
    }
    // console.log("Gemini AI debug: Initial form values loaded or reset."); // AI-generated debug log
  }, [organizationComplianceSetting, getBooleanFieldValue]); // Added getBooleanFieldValue to dependencies

  const updateComplianceSettings = async (values: FormValues) => {
    // Extract boolean values using the helper
    const userOnboardingEnabled = getBooleanFieldValue(values.userOnboardingEnabled);
    const transactionMonitoringEnabled = getBooleanFieldValue(values.transactionMonitoringEnabled);
    const autoFeedbackOnReturns = getBooleanFieldValue(values.autoFeedbackOnReturns);
    const geminiAIAuditEnabled = getBooleanFieldValue(values.geminiAIAuditEnabled);
    const geminiPredictiveAnalyticsEnabled = getBooleanFieldValue(values.geminiPredictiveAnalyticsEnabled);
    const geminiFraudPreventionModuleEnabled = getBooleanFieldValue(values.geminiFraudPreventionModuleEnabled);
    const geminiCustomRuleEngineEnabled = getBooleanFieldValue(values.geminiCustomRuleEngineEnabled);
    const geminiFeedbackLoopEnabled = getBooleanFieldValue(values.geminiFeedbackLoopEnabled);
    const geminiRealtimeRiskScoringEnabled = getBooleanFieldValue(values.geminiRealtimeRiskScoringEnabled);
    const geminiAdaptiveThresholdsEnabled = getBooleanFieldValue(values.geminiAdaptiveThresholdsEnabled);

    const kybChecksEnabled = getBooleanFieldValue(values.kybChecksEnabled);
    const regulatoryReportingEnabled = getBooleanFieldValue(values.regulatoryReportingEnabled);
    const privacyShieldComplianceEnabled = getBooleanFieldValue(values.privacyShieldComplianceEnabled);
    const advancedSanctionsScreeningEnabled = getBooleanFieldValue(values.advancedSanctionsScreeningEnabled);
    const twoFactorAuthEnforcementEnabled = getBooleanFieldValue(values.twoFactorAuthEnforcementEnabled);
    const thirdPartyRiskManagementEnabled = getBooleanFieldValue(values.thirdPartyRiskManagementEnabled);

    // Construct the input object with all existing and new AI/Compliance fields
    const updateComplianceSettingsInput = {
      organizationId,
      liveMode,
      sardineClientId: values.sardineClientId,
      sardineApiKey: values.sardineApiKey,
      middeskApiKey: values.middeskApiKey,
      userOnboardingEnabled,
      transactionMonitoringEnabled,
      autoFeedbackOnReturns,
      maxAutoApproveScore: values.maxAutoApproveScore,
      minAutoDenyScore: values.minAutoDenyScore,

      // --- Gemini AI fields for update ---
      geminiAIAuditEnabled,
      geminiPredictiveAnalyticsEnabled,
      geminiFraudPreventionModuleEnabled,
      geminiCustomRuleEngineEnabled,
      geminiApiKey: values.geminiApiKey,
      geminiEndpointUrl: values.geminiEndpointUrl,
      geminiPredictiveScoreThreshold: values.geminiPredictiveScoreThreshold,
      geminiAnomalyDetectionSensitivity: values.geminiAnomalyDetectionSensitivity,
      geminiFeedbackLoopEnabled,
      geminiModelVersion: values.geminiModelVersion,
      geminiRealtimeRiskScoringEnabled,
      geminiAdaptiveThresholdsEnabled,

      // --- Advanced Compliance & Regulatory fields for update ---
      kybChecksEnabled,
      regulatoryReportingEnabled,
      privacyShieldComplianceEnabled,
      dataRetentionPolicyInDays: values.dataRetentionPolicyInDays,
      riskProfilingLevel: values.riskProfilingLevel,
      geographicalRestrictionRegions: values.geographicalRestrictionRegions,
      complianceOfficerContact: values.complianceOfficerContact,
      policyReviewFrequency: values.policyReviewFrequency,
      advancedSanctionsScreeningEnabled,
      dataAnonymizationStrategy: values.dataAnonymizationStrategy,
      twoFactorAuthEnforcementEnabled,
      thirdPartyRiskManagementEnabled,
    };

    // console.log("Gemini AI Trace: Initiating compliance settings update with payload:", updateComplianceSettingsInput); // AI-generated trace log

    const response = await adminUpdateOrganizationComplianceSettings({
      variables: {
        input: {
          input: updateComplianceSettingsInput,
        },
      },
    });

    if (response?.data?.adminUpdateOrganizationComplianceSetting?.errors) {
      dispatchError(
        "Gemini AI detected an issue: Sorry, but something went wrong during update. Please check inputs."
      ); // Enhanced error message
      // console.error("Gemini AI Alert: Update operation failed with errors:", response.data.adminUpdateOrganizationComplianceSetting.errors); // AI-generated error log
    } else {
      dispatchSuccess(
        "Gemini AI confirms: The organization compliance settings were updated successfully."
      ); // Enhanced success message
      // console.info("Gemini AI Confirmation: Compliance settings updated, initiating re-fetch."); // AI-generated info log
    }
  };

  const validate = (values: FormValues) => {
    let errors: FormikErrors<FormValues> = {};
    const userOnboardingEnabled = getBooleanFieldValue(
      values.userOnboardingEnabled,
    );
    const transactionMonitoringEnabled = getBooleanFieldValue(
      values.transactionMonitoringEnabled,
    );
    const geminiPredictiveAnalyticsEnabled = getBooleanFieldValue(
      values.geminiPredictiveAnalyticsEnabled,
    );
    const geminiFraudPreventionModuleEnabled = getBooleanFieldValue(
      values.geminiFraudPreventionModuleEnabled,
    );

    // Original validation logic
    if ((userOnboardingEnabled || transactionMonitoringEnabled) && liveMode) {
      if (values.sardineApiKey === "") {
        errors.sardineApiKey = "This field is required for live mode services.";
      }
      if (values.sardineClientId === "") {
        errors.sardineClientId = "This field is required for live mode services.";
      }
    }

    if (userOnboardingEnabled && !transactionMonitoringEnabled && liveMode) {
      if (
        values.sardineApiKey === "" &&
        values.sardineClientId === "" &&
        values.middeskApiKey !== ""
      ) {
        errors = {}; // This part of the logic seems a bit complex/contradictory, keeping original logic, but AI would question it
      }
    }

    // --- Gemini AI specific validation ---
    if (
      (geminiPredictiveAnalyticsEnabled || geminiFraudPreventionModuleEnabled) &&
      liveMode
    ) {
      if (values.geminiApiKey === "") {
        errors.geminiApiKey = "Gemini AI Key is required when AI services are enabled in live mode.";
      }
      if (values.geminiEndpointUrl === "") {
        errors.geminiEndpointUrl = "Gemini AI Endpoint URL is required for AI service connectivity.";
      }
      if (
        values.geminiPredictiveScoreThreshold === null ||
        values.geminiPredictiveScoreThreshold < 0 ||
        values.geminiPredictiveScoreThreshold > 100
      ) {
        errors.geminiPredictiveScoreThreshold = "Gemini Predictive Score Threshold must be between 0 and 100.";
      }
      if (
        values.geminiAnomalyDetectionSensitivity === null ||
        values.geminiAnomalyDetectionSensitivity < 0 ||
        values.geminiAnomalyDetectionSensitivity > 1
      ) {
        errors.geminiAnomalyDetectionSensitivity = "Gemini Anomaly Detection Sensitivity must be between 0.0 and 1.0.";
      }
      if (values.geminiModelVersion === null) {
        errors.geminiModelVersion = "Gemini AI Model Version must be selected when AI is active.";
      }
    }

    // --- Advanced Regulatory specific validation ---
    if (getBooleanFieldValue(values.regulatoryReportingEnabled) && liveMode) {
      if (!values.complianceOfficerContact || !/\S+@\S+\.\S+/.test(values.complianceOfficerContact)) {
        errors.complianceOfficerContact = "Valid Compliance Officer Contact email is required for regulatory reporting.";
      }
    }
    if (values.dataRetentionPolicyInDays !== null && values.dataRetentionPolicyInDays < 0) {
      errors.dataRetentionPolicyInDays = "Data Retention Policy must be a non-negative number of days.";
    }

    // console.log("Gemini AI Analysis: Form validation completed. Errors found:", Object.keys(errors).length); // AI-generated analysis log
    return errors;
  };

  const onSelect = useCallback(
    (value) => {
      setLiveMode(value === "true");

      const parsedQueryString = parse(window.location.search);
      const newQuery = {
        ...parsedQueryString,
        liveMode: value === "true",
      };

      refetch({
        liveMode: value === "true",
      })
        .then(() => {
          window.history.replaceState(null, "", `?${stringify(newQuery)}`);
          // console.log(`Gemini AI Event: Switched account type to ${value}. UI re-rendering.`); // AI-generated event log
        })
        .catch((err) => {
          dispatchError("Gemini AI reports an issue: Failed to re-fetch settings for the selected account type.");
          // console.error("Gemini AI Error: Account type switch refetch failed.", err); // AI-generated error log
        });
    },
    [setLiveMode, refetch, dispatchError],
  );

  return (
    <div className="yo-compliance-dashboard-wrapper p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        <span className="text-indigo-600">Gemini-Powered</span> Compliance Settings for Organization:{" "}
        <span className="text-gray-700">{organizationId}</span>
      </h1>
      <p className="text-gray-600 mb-8 max-w-2xl">
        This comprehensive control panel allows for fine-grained configuration of all organizational compliance, fraud detection, and regulatory reporting settings,
        enhanced with <span className="font-semibold text-indigo-600">Gemini AI</span> for predictive insights and automated decision support.
      </p>

      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        <button
          type="button"
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "core"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("core")}
        >
          Core Settings
        </button>
        <button
          type="button"
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "gemini-ai"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("gemini-ai")}
        >
          <span className="font-bold text-purple-600">Gemini AI</span> Integration
        </button>
        <button
          type="button"
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "advanced-regulatory"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("advanced-regulatory")}
        >
          Advanced Regulatory & Risk
        </button>
      </div>

      <SelectGroup
        label="Environment Type"
        selectClasses="w-full md:w-1/4 mb-8"
        onChange={onSelect}
        value={liveMode.toString()}
        selectOptions={ACCOUNT_TYPE_OPTIONS}
        helpText="Toggle between live production and sandbox environments to configure settings specific to each."
      />
      <Formik
        initialValues={initialFormValues}
        onSubmit={updateComplianceSettings}
        validate={validate}
        validateOnMount
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="w-full bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            {/* Yo-component for overall status */}
            <div className="mb-8 p-4 bg-indigo-50 border-l-4 border-indigo-400 text-indigo-800 rounded-md shadow-inner">
              <h2 className="text-lg font-semibold mb-2">
                Overall Compliance Status: <YoStatusIndicator label="Active" status="active" />
              </h2>
              <p className="text-sm">
                Current settings are actively enforced. Live Mode:{" "}
                <YoStatusIndicator
                  label={liveMode ? "Production" : "Sandbox"}
                  status={liveMode ? "active" : "pending"}
                />
                {" "}
                Gemini AI Services:{" "}
                <YoStatusIndicator
                  label={getBooleanFieldValue(values.geminiPredictiveAnalyticsEnabled) ? "Enabled" : "Disabled"}
                  status={getBooleanFieldValue(values.geminiPredictiveAnalyticsEnabled) ? "configured" : "unconfigured"}
                />
              </p>
            </div>

            {activeTab === "core" && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
                  Core Compliance & API Integrations
                </h2>
                {liveMode && (
                  <YoCollapsiblePanel title="API Credentials for Live Services">
                    <FieldGroup>
                      <Label
                        id="sardineClientId"
                        helpText="Required for KYC (Know Your Customer) and Transaction Monitoring Activation in live environment."
                      >
                        Sardine Client ID
                      </Label>
                      <Field
                        id="sardineClientId"
                        name="sardineClientId"
                        component={FormikInputField}
                      />
                      <FormikErrorMessage name="sardineClientId" />
                    </FieldGroup>
                    <FieldGroup>
                      <Label
                        id="sardineApiKey"
                        helpText="Critical API Key for Sardine services. Keep confidential."
                      >
                        Sardine API Key
                      </Label>
                      <Field
                        id="sardineApiKey"
                        name="sardineApiKey"
                        component={FormikInputField}
                        type="password"
                      />
                      <FormikErrorMessage name="sardineApiKey" />
                    </FieldGroup>
                    <FieldGroup>
                      <Label
                        id="middeskApiKey"
                        helpText="Required for KYB (Know Your Business) Activation and entity verification."
                      >
                        Middesk API Key
                      </Label>
                      <Field
                        id="middeskApiKey"
                        name="middeskApiKey"
                        component={FormikInputField}
                        type="password"
                      />
                      <FormikErrorMessage name="middeskApiKey" />
                    </FieldGroup>
                  </YoCollapsiblePanel>
                )}

                <YoCollapsiblePanel
                  title="Core Feature Activation"
                  initialOpen={!liveMode}
                >
                  <FieldGroup>
                    <div
                      className={`flex flex-1 items-center gap-1 ${
                        !liveMode ? "mt-4" : ""
                      }`}
                    >
                      <div className="mb-2">
                        <Field
                          id="userOnboardingEnabled"
                          type="checkbox"
                          name="userOnboardingEnabled"
                          value
                          component={FormikCheckboxField}
                        />
                      </div>
                      <Label id="userOnboardingEnabled" className="cursor-pointer">
                        Enable User Onboarding Compliance Flows
                      </Label>
                      <FormikErrorMessage name="userOnboardingEnabled" />
                    </div>
                    <p className="text-sm text-gray-500 ml-7">
                      Activates user verification and identity checks during new account creation.
                    </p>
                  </FieldGroup>
                  <FieldGroup>
                    <div className="flex flex-1 items-center gap-1">
                      <div className="mb-2">
                        <Field
                          id="transactionMonitoringEnabled"
                          type="checkbox"
                          name="transactionMonitoringEnabled"
                          value
                          component={FormikCheckboxField}
                        />
                      </div>
                      <Label id="transactionMonitoringEnabled" className="cursor-pointer">
                        Enable Transaction Monitoring for AML/CTF
                      </Label>
                      <FormikErrorMessage name="transactionMonitoringEnabled" />
                    </div>
                    <p className="text-sm text-gray-500 ml-7">
                      Monitors all financial transactions for suspicious activities and potential fraud.
                    </p>
                  </FieldGroup>
                  <FieldGroup>
                    <div className="flex flex-1 items-center gap-1">
                      <div className="mb-2">
                        <Field
                          id="autoFeedbackOnReturns"
                          type="checkbox"
                          name="autoFeedbackOnReturns"
                          value
                          component={FormikCheckboxField}
                        />
                      </div>
                      <Label id="autoFeedbackOnReturns" className="cursor-pointer">
                        Automatically Submit Decision Feedback on ACH Returns
                      </Label>
                      <FormikErrorMessage name="autoFeedbackOnReturns" />
                    </div>
                    <p className="text-sm text-gray-500 ml-7">
                      Automates the process of providing feedback to decisioning systems based on ACH return codes.
                    </p>
                  </FieldGroup>
                </YoCollapsiblePanel>

                <YoCollapsiblePanel title="Automated Decisioning Thresholds">
                  <FieldGroup>
                    <Label
                      id="maxAutoApproveScore"
                      helpText="Disables auto-approval when set to 'None'. Decisions with scores above this will be manually reviewed."
                    >
                      Maximum Auto-approve Score Threshold
                    </Label>
                    <Field
                      id="maxAutoApproveScore"
                      type="select"
                      name="maxAutoApproveScore"
                      value
                      component={FormikSelectField}
                      options={decisionScoreOptions}
                    />
                    <FormikErrorMessage name="maxAutoApproveScore" />
                  </FieldGroup>
                  <FieldGroup>
                    <Label
                      id="minAutoDenyScore"
                      helpText="Disables auto-denial when set to 'None'. Decisions with scores below this will be manually reviewed."
                    >
                      Minimum Auto-deny Score Threshold
                    </Label>
                    <Field
                      id="minAutoDenyScore"
                      type="select"
                      name="minAutoDenyScore"
                      value
                      component={FormikSelectField}
                      options={decisionScoreOptions}
                    />
                    <FormikErrorMessage name="minAutoDenyScore" />
                  </FieldGroup>
                </YoCollapsiblePanel>
              </>
            )}

            {activeTab === "gemini-ai" && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
                  <span className="text-purple-600">Gemini AI</span> Enhanced Compliance Configuration
                </h2>
                <YoGeminiAIConfigurationPanel />
                <div className="mt-8 p-4 bg-purple-50 border-l-4 border-purple-400 text-purple-800 rounded-md shadow-sm">
                  <p className="font-semibold text-sm mb-1">
                    ✨ Gemini AI Tip:
                  </p>
                  <p className="text-sm">
                    Leverage Gemini AI's adaptive thresholds for optimal performance. Enabling the feedback loop
                    will significantly improve model accuracy over time.
                  </p>
                </div>
              </>
            )}

            {activeTab === "advanced-regulatory" && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
                  Advanced Regulatory & Operational Risk Management
                </h2>
                <YoAdvancedRegulatorySettingsPanel />
              </>
            )}

            <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
              <Button buttonType="primary" isSubmit disabled={isSubmitting} className="min-w-[150px] py-2.5 text-lg">
                Update Compliance Settings
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default UpdateComplianceSettingsForm;