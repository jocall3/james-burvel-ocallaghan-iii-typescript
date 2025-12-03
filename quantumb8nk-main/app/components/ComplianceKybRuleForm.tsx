// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback, useMemo } from "react";
import { snakeCase } from "lodash";
import { Field, Form, Formik, FormikHelpers } from "formik";
import {
  Compliance__RuleActionEnum,
  RulePrimitivesEnum,
  useComplianceRuleViewQuery,
  useCreateComplianceRuleMutation,
  useDeleteComplianceRuleMutation,
  useUpdateComplianceRuleMutation,
} from "../../generated/dashboard/graphqlSchema";
import Button, {
  ButtonClickEventTypes,
} from "../../common/ui-components/Button/Button";
import {
  FieldGroup,
  FieldsRow,
  HorizontalRule,
  Label,
  // Assuming a TextareaField component exists in your ui-components
  // If not, you'd implement a simple <textarea> directly or create this component.
  TextareaField,
} from "../../common/ui-components";
import { FormikInputField, FormikSelectField } from "../../common/formik";
import { DECISION_SCORE_OPTIONS } from "../constants";
import ComplianceKybRuleConditionSection from "../containers/ComplianceKybRuleConditionSection";
import { useDispatchContext } from "../MessageProvider";
import { handleLinkClick } from "../../common/utilities/handleLinkClick";
// Assuming a Spinner component exists in your ui-components
import Spinner from "../../common/ui-components/Spinner/Spinner";

// --- New Types for AI Integration ---
type GemifiedRuleSuggestion = {
  name: string;
  conditions: DenormalizedRule[];
  operator: string;
  action: Compliance__RuleActionEnum;
  explanation: string;
  confidenceScore: number;
};

// --- Existing Types ---
type NormalizedRule = {
  field: string;
  operator: string;
  negate: string;
  value: string;
};

type DenormalizedRule = {
  field: string;
  operator: string;
  value: string;
};

type ConditionType = {
  operator: string;
  negate: boolean;
  value: NormalizedRule[];
};

type ComplianceKybRuleFormProps = {
  id: string;
  isEditForm: boolean;
};

type ComplianceKybFormValue = {
  name: string;
  conditions: DenormalizedRule[];
  operator: string;
  action: string;
};

// --- Mock AI Service Functions (Simulating Gemini Integration) ---
// These functions simulate calls to an external AI service like Gemini or your AI backend.
// In a real application, these would make actual API calls.
const simulateGeminiRuleGeneration = async (
  context: string,
): Promise<GemifiedRuleSuggestion[]> => {
  console.log(`Gemini is generating rules based on context: "${context}"...`);
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API latency

  // Mock data for AI-generated rules
  const mockSuggestions: GemifiedRuleSuggestion[] = [
    {
      name: `AI-Suggested Rule: High-Risk International New Entity (${context})`,
      conditions: [
        { field: "company_age_years", operator: RulePrimitivesEnum.Lt, value: "1" },
        {
          field: "primary_business_country",
          operator: `not_${RulePrimitivesEnum.Eql}`,
          value: "US",
        },
        {
          field: "sanction_list_match",
          operator: RulePrimitivesEnum.Eql,
          value: "true",
        },
      ],
      operator: "AND",
      action: Compliance__RuleActionEnum.Block,
      explanation:
        "This rule, crafted by Gemini's advanced risk models, targets new international entities exhibiting high-risk indicators, recommending immediate blocking to prevent potential illicit activities.",
      confidenceScore: 0.98,
    },
    {
      name: `AI-Suggested Rule: Elevated Transaction Volume Review (${context})`,
      conditions: [
        {
          field: "total_transaction_value_usd",
          operator: RulePrimitivesEnum.Gt,
          value: "250000",
        },
        {
          field: "industry_sector",
          operator: RulePrimitivesEnum.Eql,
          value: "cryptocurrency",
        },
      ],
      operator: "OR",
      action: Compliance__RuleActionEnum.Review,
      explanation:
        "Gemini's analysis indicates that large transaction volumes in specific high-fluctuation sectors like crypto warrant a manual review to ensure compliance with evolving AML regulations.",
      confidenceScore: 0.85,
    },
    {
      name: `AI-Suggested Rule: PEP-Related Entity Flag (${context})`,
      conditions: [
        {
          field: "beneficial_owner_pep_status",
          operator: RulePrimitivesEnum.Eql,
          value: "true",
        },
        {
          field: "transaction_source_country",
          operator: RulePrimitivesEnum.Eql,
          value: "BVI",
        },
      ],
      operator: "AND",
      action: Compliance__RuleActionEnum.Alert,
      explanation:
        "This rule is a proactive measure from Gemini to flag entities linked to Politically Exposed Persons (PEPs) with connections to known offshore financial centers, triggering a high-priority alert for compliance teams.",
      confidenceScore: 0.92,
    },
  ];
  return mockSuggestions;
};

const simulateGeminiNLPInterpretation = async (
  naturalLanguageRule: string,
): Promise<{ conditions: DenormalizedRule[]; operator: string }> => {
  console.log(
    `Gemini is interpreting natural language rule: "${naturalLanguageRule}"...`,
  );
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API latency

  // Mock interpretation logic based on keywords
  if (naturalLanguageRule.toLowerCase().includes("block companies from high-risk countries")) {
    return {
      conditions: [
        { field: "company_risk_score", operator: RulePrimitivesEnum.Gt, value: "0.8" },
        { field: "company_country_alpha2", operator: `not_${RulePrimitivesEnum.Eql}`, value: "US" },
        { field: "transaction_volume_usd", operator: RulePrimitivesEnum.Gt, value: "500000" },
      ],
      operator: "AND",
    };
  }
  if (naturalLanguageRule.toLowerCase().includes("review any entity with a p.e.p. link")) {
    return {
      conditions: [
        { field: "owner_is_pep", operator: RulePrimitivesEnum.Eql, value: "true" },
        { field: "kyc_level", operator: RulePrimitivesEnum.Eql, value: "basic" },
      ],
      operator: "OR",
    };
  }
  // Default fallback interpretation
  return {
    conditions: [
      {
        field: "natural_language_keyword_match",
        operator: RulePrimitivesEnum.Eql,
        value: naturalLanguageRule.split(" ").slice(0, 3).join("_").toLowerCase(),
      },
    ],
    operator: "OR",
  };
};

const simulatePredictiveComplianceScore = async (
  ruleName: string,
  conditions: DenormalizedRule[],
  action: Compliance__RuleActionEnum,
): Promise<{ score: number; impactDescription: string }> => {
  console.log("Gemini calculating predictive compliance score...");
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API latency

  const baseScore = 0.75; // Baseline compliance score impact
  let scoreModifier = 0;
  let impact = "This rule has a moderate, balanced impact on our overall compliance posture.";

  if (action === Compliance__RuleActionEnum.Block) {
    scoreModifier += 0.15;
    impact = "Implementing this rule is predicted by Gemini to significantly fortify our defenses against critical risks, leading to a strong uplift in compliance robustness.";
  } else if (action === Compliance__RuleActionEnum.Review) {
    scoreModifier += 0.07;
    impact = "Gemini forecasts that this rule will enhance our oversight capabilities, identifying more potential issues for manual review and improving the granularity of our compliance framework.";
  } else if (action === Compliance__RuleActionEnum.Alert) {
    scoreModifier += 0.05;
    impact = "This rule provides critical real-time alerts, which Gemini predicts will improve our responsiveness to emerging compliance threats without impacting throughput.";
  }

  // Example: conditions related to high-risk fields might increase impact
  if (conditions.some((c) => ["owner_country", "sanction_list_match", "pep_status"].includes(c.field))) {
    scoreModifier += 0.08;
    impact += " It specifically addresses high-impact regulatory areas, as identified by Gemini's risk intelligence.";
  }
  if (conditions.some((c) => c.value?.includes("crypto"))) {
    scoreModifier += 0.05;
    impact += " This rule is crucial for managing evolving risks in nascent financial sectors like cryptocurrency, according to Gemini.";
  }

  const finalScore = Math.min(1, Math.max(0, baseScore + scoreModifier));
  return {
    score: parseFloat(finalScore.toFixed(2)),
    impactDescription: impact,
  };
};

// --- Helper Functions (Existing) ---
function normalizeRules(conditions: DenormalizedRule[]) {
  return conditions?.map((condition) => {
    const { field, value, operator } = condition;
    return {
      field,
      operator: "equals", // This typically implies the UI focuses on equality/inequality
      negate: !(operator === RulePrimitivesEnum.Eql),
      value,
    };
  });
}

function denormalizeRules(conditions: NormalizedRule[]) {
  return conditions?.map((condition) => {
    const { field, value, negate } = condition;
    return {
      field,
      operator: negate
        ? `not_${RulePrimitivesEnum.Eql}`
        : RulePrimitivesEnum.Eql,
      value,
    };
  });
}

function ComplianceKybRuleForm({ id, isEditForm }: ComplianceKybRuleFormProps) {
  const [disable, setDisable] = useState<boolean>(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>("");
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);
  const [geminiSuggestions, setGeminiSuggestions] = useState<
    GemifiedRuleSuggestion[]
  >([]);
  const [
    complianceScore,
    setComplianceScore,
  ] = useState<{ score: number; impactDescription: string } | null>(null);

  const rulesPath = `/settings/compliance/kyb/rules`;
  const { dispatchError, dispatchSuccess } = useDispatchContext();

  const { data: queryData, loading: queryLoading } = useComplianceRuleViewQuery(
    {
      variables: {
        id,
      },
      skip: !isEditForm || !id, // Skip query if not in edit mode or no ID
    },
  );

  const [createComplianceRule] = useCreateComplianceRuleMutation();
  const [updateComplianceRule] = useUpdateComplianceRuleMutation();
  const [deleteComplianceRule] = useDeleteComplianceRuleMutation();

  const cancelRuleEdit = useCallback(
    (event: ButtonClickEventTypes) => {
      handleLinkClick(rulesPath, event);
    },
    [rulesPath],
  );

  const createRule = async (
    rule: ComplianceKybFormValue,
    { setSubmitting }: FormikHelpers<ComplianceKybFormValue>,
  ) => {
    setDisable(true);
    setSubmitting(true);

    const conditions = {
      operator: rule?.operator,
      negate: false, // This seems to be a fixed value in the original logic, assuming it's for the overall condition operator
      value: normalizeRules(rule.conditions),
    };

    try {
      const response = await createComplianceRule({
        variables: {
          input: {
            input: {
              name: rule.name,
              conditions: JSON.stringify(conditions),
              action: rule.action as Compliance__RuleActionEnum,
            },
          },
        },
      });

      if (response?.data?.createComplianceRule?.errors) {
        dispatchError(
          `Gemini reports an error: ${response?.data?.createComplianceRule?.errors.toString()}`,
        );
      } else {
        dispatchSuccess(
          "OmniRule forged successfully with Gemini's foresight!",
        );
        window.location.href = rulesPath;
      }
    } catch (error) {
      dispatchError(
        "A cosmic error occurred during OmniRule creation. Please try again.",
      );
    } finally {
      setDisable(false);
      setSubmitting(false);
    }
  };

  const updateRule = async (
    rule: ComplianceKybFormValue,
    { setSubmitting }: FormikHelpers<ComplianceKybFormValue>,
  ) => {
    setDisable(true);
    setSubmitting(true);

    const conditions = {
      operator: rule?.operator,
      negate: false,
      value: normalizeRules(rule?.conditions),
    };

    try {
      const response = await updateComplianceRule({
        variables: {
          input: {
            input: {
              id: queryData?.complianceRule?.id,
              name: rule?.name,
              conditions: JSON.stringify(conditions),
              action: rule?.action as Compliance__RuleActionEnum,
            },
          },
        },
      });

      if (response?.data?.updateComplianceRule?.errors) {
        dispatchError(
          `Gemini reports an error: ${response?.data?.updateComplianceRule?.errors.toString()}`,
        );
      } else {
        dispatchSuccess(
          "OmniRule meticulously updated with Gemini's intelligence!",
        );
        window.location.href = rulesPath;
      }
    } catch (error) {
      dispatchError("A glitch in the matrix during OmniRule update. Try again!");
    } finally {
      setDisable(false);
      setSubmitting(false);
    }
  };

  const deleteRule = async () => {
    setDisable(true);

    try {
      const response = await deleteComplianceRule({
        variables: {
          input: {
            input: {
              id,
            },
          },
        },
      });

      if (response?.data?.deleteComplianceRule?.errors?.length) {
        dispatchError(
          `Gemini detected an issue: ${response?.data?.deleteComplianceRule?.errors.toString()}`,
        );
      } else {
        dispatchSuccess(
          "OmniRule gracefully retired, maintaining our adaptable compliance framework!",
        );
        window.location.href = rulesPath;
      }
    } catch (error) {
      dispatchError(
        "We couldn't sever the OmniRule. Gemini is investigating. Please contact us if this persists.",
      );
    } finally {
      setDisable(false);
    }
  };

  const initialValues = useMemo((): ComplianceKybFormValue => {
    if (queryLoading) {
      // Return a default empty state while loading to avoid undefined access
      return {
        name: "",
        conditions: [{ field: "", operator: "", value: "" }],
        operator: "AND",
        action: "APPROVE",
      };
    }

    const conditions = queryData?.complianceRule
      ?.conditions as unknown as string;

    if (conditions) {
      try {
        const parsedCondition = JSON.parse(conditions) as ConditionType;
        const value = denormalizeRules(parsedCondition?.value);
        return {
          name: queryData?.complianceRule?.name || "",
          conditions: value,
          operator: parsedCondition?.operator || "AND", // Provide default if not present
          action: snakeCase(queryData?.complianceRule?.action || "APPROVE"), // Provide default
        };
      } catch (e) {
        console.error("Error parsing conditions from query data", e);
        dispatchError("Gemini encountered an error loading existing rule conditions.");
        // Fallback to empty if parsing fails
        return {
          name: queryData?.complianceRule?.name || "",
          conditions: [{ field: "", operator: "", value: "" }],
          operator: "AND",
          action: snakeCase(queryData?.complianceRule?.action || "APPROVE"),
        };
      }
    }
    return {
      name: "",
      conditions: [{ field: "", operator: "", value: "" }],
      operator: "AND", // Default operator for new rules
      action: "APPROVE", // Default action for new rules
    };
  }, [queryData, queryLoading, dispatchError]); // Dependencies for useMemo

  // --- Gemini Integration Logic ---

  const handleGeminiGenerateSuggestions = useCallback(
    async (ruleName: string) => {
      if (!ruleName.trim()) {
        dispatchError("Please provide an OmniRule Name for Gemini to analyze!");
        return;
      }
      setIsGeminiLoading(true);
      setGeminiSuggestions([]);
      try {
        const suggestions = await simulateGeminiRuleGeneration(ruleName);
        setGeminiSuggestions(suggestions);
        dispatchSuccess("Gemini has conjured innovative OmniRule suggestions!");
      } catch (error) {
        dispatchError("Gemini encountered a temporal anomaly. Try again!");
      } finally {
        setIsGeminiLoading(false);
      }
    },
    [dispatchError, dispatchSuccess],
  );

  const handleGeminiInterpretNaturalLanguage = useCallback(
    async (
      naturalLanguageText: string,
      setFieldValue: FormikHelpers<ComplianceKybFormValue>["setFieldValue"],
    ) => {
      if (!naturalLanguageText.trim()) {
        dispatchError("Please describe an OmniRule for Gemini to interpret!");
        return;
      }
      setIsGeminiLoading(true);
      try {
        const interpretation = await simulateGeminiNLPInterpretation(
          naturalLanguageText,
        );
        setFieldValue("conditions", interpretation.conditions);
        setFieldValue("operator", interpretation.operator);
        dispatchSuccess("Gemini decoded your intent into structured conditions!");
      } catch (error) {
        dispatchError("Gemini struggled with the dialect. Try rephrasing!");
      } finally {
        setIsGeminiLoading(false);
      }
    },
    [dispatchError, dispatchSuccess],
  );

  const handleCalculatePredictiveScore = useCallback(
    async (
      values: ComplianceKybFormValue,
      formikSetFieldValue: FormikHelpers<ComplianceKybFormValue>["setFieldValue"],
    ) => {
      setIsGeminiLoading(true); // Reusing for any AI operation
      setComplianceScore(null); // Clear previous score
      try {
        const scoreResult = await simulatePredictiveComplianceScore(
          values.name,
          values.conditions,
          values.action as Compliance__RuleActionEnum,
        );
        setComplianceScore(scoreResult);
        dispatchSuccess("Gemini calculated the future impact of this OmniRule!");
      } catch (error) {
        dispatchError("Gemini couldn't predict the future. The oracle is down.");
      } finally {
        setIsGeminiLoading(false);
      }
    },
    [dispatchError, dispatchSuccess],
  );

  if (queryLoading && isEditForm) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spinner />
        <p className="ml-4 text-xl font-extrabold text-blue-800 animate-pulse">
          Conjuring compliance wisdom...
        </p>
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, formikHelpers) => {
        if (isEditForm) {
          await updateRule(values, formikHelpers);
        } else {
          await createRule(values, formikHelpers);
        }
      }}
      enableReinitialize
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="space-y-8 p-8 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-3xl rounded-3xl border border-blue-200 backdrop-blur-sm">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-800 mb-8 pb-4 border-b-4 border-indigo-300 flex items-center">
            <span role="img" aria-label="sparkling-star" className="mr-4 text-5xl">
              🌟
            </span>
            Citibank OmniRule Creator: Gemini Intelligence Engine
          </h1>
          <p className="text-lg text-gray-700 mb-6 italic border-l-4 border-indigo-400 pl-4">
            "Harnessing the unparalleled power of Gemini AI to craft compliance rules so precise, so intelligent, they redefine financial security. We're not just building an app; we're architecting the future of regulatory excellence, worth millions in foresight and protection."
          </p>

          {/* Gemini AI Assistant Section */}
          <section className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 rounded-2xl shadow-inner-xl border border-purple-300 transform transition-all duration-300 hover:scale-[1.005]">
            <h2 className="text-3xl font-bold text-indigo-800 mb-5 flex items-center">
              <span role="img" aria-label="gemini-icon" className="mr-4 text-4xl">
                ✨
              </span>
              Gemini AI Compliance Copilot - Your Strategic Partner
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Leverage Gemini's unparalleled cognitive capabilities to not just define, but *discover* the most impactful compliance rules. From natural language interpretation to predictive modeling, Gemini is your co-pilot in navigating complex regulatory landscapes.
            </p>

            {/* Natural Language Rule Builder */}
            <FieldsRow columns={1}>
              <FieldGroup>
                <Label htmlFor="naturalLanguageRule" className="text-lg font-semibold text-indigo-700">
                  Natural Language OmniRule Builder: Speak Your Vision
                </Label>
                <TextareaField
                  id="naturalLanguageRule"
                  name="naturalLanguageRule" // This field is local to the component state
                  placeholder="e.g., 'Instantly block any new company registered in the Cayman Islands if their primary director has a negative media sentiment score above 0.7.' or 'Flag all transactions exceeding $1M for review if originating from a country with high financial crime risk.'"
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  className="min-h-[120px] p-4 text-lg border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all shadow-md"
                />
                <Button
                  buttonType="secondary"
                  onClick={() =>
                    handleGeminiInterpretNaturalLanguage(
                      naturalLanguageInput,
                      setFieldValue,
                    )
                  }
                  disabled={isGeminiLoading || !naturalLanguageInput.trim()}
                  className="mt-4 w-full text-lg px-6 py-3 font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-lg transition-all transform hover:scale-[1.01]"
                >
                  {isGeminiLoading ? (
                    <Spinner size="sm" className="mr-3" color="white" />
                  ) : (
                    <span role="img" aria-label="magic-wand" className="mr-3 text-2xl">
                      🪄
                    </span>
                  )}
                  Interpret OmniRule with Gemini Intelligence
                </Button>
              </FieldGroup>
            </FieldsRow>

            <HorizontalRule className="my-8 border-purple-400 border-dashed" />

            {/* AI Rule Suggestions */}
            <FieldsRow columns={1}>
              <FieldGroup>
                <Label className="text-lg font-semibold text-indigo-700">
                  AI-Powered OmniRule Suggestions: Unearth Hidden Risks
                </Label>
                <Button
                  buttonType="primary"
                  onClick={() => handleGeminiGenerateSuggestions(values.name)}
                  disabled={isGeminiLoading || !values.name.trim()}
                  className="mt-4 w-full text-lg px-6 py-3 font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-lg transition-all transform hover:scale-[1.01]"
                >
                  {isGeminiLoading ? (
                    <Spinner size="sm" className="mr-3" color="white" />
                  ) : (
                    <span role="img" aria-label="lightbulb" className="mr-3 text-2xl">
                      💡
                    </span>
                  )}
                  Generate AI OmniRule Suggestions for "{values.name || "[Enter Rule Name]"}"
                </Button>
                {isGeminiLoading && (
                  <p className="text-center text-indigo-600 mt-6 text-xl font-medium animate-pulse">
                    <Spinner className="mr-3" /> Gemini is meticulously crafting your next-gen OmniRules...
                  </p>
                )}
                {geminiSuggestions.length > 0 && (
                  <div className="mt-6 space-y-6">
                    <h3 className="text-2xl font-bold text-indigo-800">Gemini's Recommendations:</h3>
                    {geminiSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-6 border-2 border-indigo-400 rounded-xl bg-indigo-100 shadow-xl relative transform transition-all duration-200 hover:scale-[1.005] hover:shadow-2xl"
                      >
                        <span className="absolute top-3 right-4 text-sm font-bold text-indigo-700 bg-indigo-200 px-3 py-1 rounded-full">
                          AI Confidence: {(suggestion.confidenceScore * 100).toFixed(0)}%
                        </span>
                        <h3 className="font-extrabold text-indigo-900 text-xl mb-3">
                          {suggestion.name}
                        </h3>
                        <p className="text-base text-gray-800 mb-3 leading-relaxed">
                          <span className="font-semibold text-indigo-700">Gemini Insight:</span>{" "}
                          {suggestion.explanation}
                        </p>
                        <div className="text-sm text-gray-800 space-y-1 mt-4 border-t border-indigo-300 pt-3">
                          <p className="font-bold text-indigo-700">Conditions ({suggestion.operator}):</p>
                          <ul className="list-disc list-inside ml-4 text-base">
                            {suggestion.conditions.map((cond, cIndex) => (
                              <li key={cIndex} className="mb-1">
                                <span className="font-mono bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-sm">
                                  {cond.field} {cond.operator === RulePrimitivesEnum.Eql ? "EQUALS" : cond.operator.replace(`not_${RulePrimitivesEnum.Eql}`, "NOT EQUALS")} "{cond.value}"
                                </span>
                              </li>
                            ))}
                          </ul>
                          <p className="font-bold text-indigo-700 mt-2">Action: <span className="font-mono bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-sm">{suggestion.action}</span></p>
                        </div>
                        <Button
                          buttonType="tertiary"
                          onClick={() => {
                            setFieldValue("name", suggestion.name);
                            setFieldValue("conditions", suggestion.conditions);
                            setFieldValue("operator", suggestion.operator);
                            setFieldValue("action", snakeCase(suggestion.action));
                            dispatchSuccess("Gemini's suggestion applied! Refine its genius as needed.");
                            setGeminiSuggestions([]); // Clear suggestions after applying
                          }}
                          className="mt-6 px-6 py-3 text-xl text-indigo-800 bg-indigo-300 hover:bg-indigo-400 rounded-full font-bold shadow-md transition-all transform hover:scale-105"
                        >
                          <span role="img" aria-label="confirm" className="mr-2 text-2xl">
                            ✅
                          </span>
                          Deploy This Gemini OmniRule
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </FieldGroup>
            </FieldsRow>
          </section>
          {/* End Gemini AI Assistant Section */}

          <HorizontalRule className="my-8 border-gray-300" />

          <FieldsRow columns={3}>
            <FieldGroup>
              <Label>OmniRule Name</Label>
              <Field
                id="name"
                type="input"
                name="name"
                component={FormikInputField}
                className="p-3 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </FieldGroup>
          </FieldsRow>
          <HorizontalRule />
          <ComplianceKybRuleConditionSection />
          <HorizontalRule />
          <FieldsRow columns={2}>
            <FieldGroup>
              <Label className="pt-2">OmniRule Action</Label>
              <Field
                id="action"
                type="select"
                name="action"
                component={FormikSelectField}
                options={DECISION_SCORE_OPTIONS} // Re-using existing options, ideally this would be specific Compliance actions.
                className="p-3 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </FieldGroup>
            <FieldGroup>
              <Label className="pt-2 text-lg font-semibold text-blue-700">
                Compliance Impact Score (Gemini Predictive Analytics)
              </Label>
              <Button
                buttonType="tertiary"
                onClick={() => handleCalculatePredictiveScore(values, setFieldValue)}
                disabled={isGeminiLoading || !values.name.trim() || values.conditions.length === 0 || !values.action.trim()}
                className="w-full mt-2 text-lg px-6 py-3 font-semibold bg-green-600 text-white hover:bg-green-700 rounded-xl shadow-lg transition-all transform hover:scale-[1.01]"
              >
                {isGeminiLoading ? (
                  <Spinner size="sm" className="mr-3" color="white" />
                ) : (
                  <span role="img" aria-label="chart" className="mr-3 text-2xl">
                    📈
                  </span>
                )}
                Calculate Predictive OmniScore
              </Button>
              {complianceScore && (
                <div className="mt-4 p-5 bg-gradient-to-br from-blue-100 to-green-100 border border-blue-300 rounded-xl shadow-lg animate-fade-in-up">
                  <p className="text-xl font-extrabold text-blue-900 mb-2">
                    OmniScore:{" "}
                    <span
                      className={`font-extrabold ${
                        complianceScore.score > 0.85
                          ? "text-green-700"
                          : complianceScore.score > 0.7
                          ? "text-yellow-700"
                          : "text-red-700"
                      }`}
                    >
                      {(complianceScore.score * 100).toFixed(0)}%
                    </span>
                  </p>
                  <p className="text-base text-gray-800 leading-relaxed mt-2">
                    <span className="font-semibold text-blue-700">Gemini's Impact Analysis:</span>{" "}
                    {complianceScore.impactDescription}
                  </p>
                </div>
              )}
            </FieldGroup>
          </FieldsRow>

          <HorizontalRule className="my-8 border-gray-300" />

          <div className="flex flex-row space-x-6 justify-center">
            <Button
              buttonType="primary"
              isSubmit
              disabled={disable || isSubmitting || isGeminiLoading}
              className="px-8 py-4 text-xl font-bold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-1 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {isEditForm ? (
                <>
                  {isSubmitting ? (
                    <Spinner size="sm" className="mr-3" color="white" />
                  ) : (
                    <span role="img" aria-label="rocket" className="mr-3 text-2xl">
                      🚀
                    </span>
                  )}
                  Update OmniRule Now!
                </>
              ) : (
                <>
                  {isSubmitting ? (
                    <Spinner size="sm" className="mr-3" color="white" />
                  ) : (
                    <span role="img" aria-label="sparkles" className="mr-3 text-2xl">
                      ✨
                    </span>
                  )}
                  Create Epic OmniRule with Gemini!
                </>
              )}
            </Button>
            {isEditForm && (
              <Button
                buttonType="destructive"
                onClick={() => {
                  void deleteRule();
                }}
                disabled={disable || isSubmitting || isGeminiLoading}
                className="px-8 py-4 text-xl font-bold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
              >
                <span role="img" aria-label="trash" className="mr-3 text-2xl">
                  🗑️
                </span>
                Delete OmniRule Forever
              </Button>
            )}
            <Button
              onClick={(event: ButtonClickEventTypes) => cancelRuleEdit(event)}
              disabled={disable || isSubmitting || isGeminiLoading}
              className="px-8 py-4 text-xl font-bold rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50"
            >
              Cancel Mission
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default ComplianceKybRuleForm;