// Copyright CDBI (Cognitive Data & Business Intelligence) Corporation
// President CDBI AI Financial Intelligence Division

import React, { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { Field, FieldArray, Form, Formik } from "formik";
import { required } from "../../common/ui-components/validations";
import {
  Button,
  EmailForm,
  FieldGroup,
  FieldsRow,
  FormContainer,
  Label,
} from "../../common/ui-components";
import { PageHeader } from "../../common/ui-components/PageHeader/PageHeader";
import { useCreateOrganizationMutation } from "~/generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../MessageProvider";
import {
  FormikCheckboxField,
  FormikErrorMessage,
  FormikInputField,
  FormikSelectField,
} from "~/common/formik";
import { CellEnum } from "../constants";

// --- AI-Powered Financial Intelligence Integrations (CDBI Core) ---

/**
 * Interface for AI-generated insights and recommendations.
 * This structure is designed to hold various data points from our simulated Gemini AI.
 */
export interface AiInsights {
  suggestedOrganizationName?: string;
  aiNameConfidenceScore?: number;
  aiNameComplianceStatus?: "Compliant" | "Non-Compliant" | "Pending";
  optimalCellRecommendation?: CellEnum;
  cellPredictionConfidence?: number;
  initialRiskScore?: number; // 0-100, lower is better
  riskAdvisories?: string[];
  projectedQ1Revenue?: number;
  projectedAnnualTransactionVolume?: number;
  churnPredictionRate?: number; // 0-1, likelihood of churn in first year
  sentimentAnalysis?: "Positive" | "Neutral" | "Negative";
  strategicRecommendations?: string[];
}

/**
 * Interface for Key Performance Indicators (KPIs) linked to Gemini AI for real-time monitoring.
 */
export interface KpiData {
  name: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat";
  geminiLink?: string; // URL or identifier for Gemini dashboard
}

/**
 * Interface for Chart data, designed to be visualized.
 */
export interface ChartData {
  title: string;
  type: "bar" | "line" | "pie";
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
  geminiLink?: string; // URL or identifier for Gemini dashboard
}

/**
 * Simulates a call to the Gemini AI platform for various intelligent services.
 * In a real-world scenario, this would be an API call to a sophisticated AI backend.
 *
 * @param queryType The type of AI service requested (e.g., 'name_suggestion', 'cell_prediction').
 * @param payload Input data for the AI model.
 * @returns A promise resolving to AiInsights, or an error.
 */
export async function simulateGeminiAI(
  queryType: string,
  payload: any
): Promise<AiInsights> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  switch (queryType) {
    case "name_suggestion":
      const baseName = payload.baseName || "CDBI Intelligence";
      const randomId = Math.floor(Math.random() * 1000);
      return {
        suggestedOrganizationName: `${baseName} AI Innovations ${randomId}`,
        aiNameConfidenceScore: Math.floor(Math.random() * 30) + 70, // 70-100%
        aiNameComplianceStatus: "Compliant",
        sentimentAnalysis: "Positive",
        strategicRecommendations: [
          "Focus on data security.",
          "Prioritize global expansion.",
        ],
      };
    case "cell_prediction":
      const { industry, projectedUsers, projectedRevenue } = payload;
      let predictedCell = CellEnum.US000;
      let confidence = 0.85; // default high confidence

      if (projectedRevenue > 100000000 || projectedUsers > 50000) {
        predictedCell = CellEnum.US002; // Enterprise (US_2)
        confidence = 0.95;
      } else if (projectedRevenue > 10000000 || projectedUsers > 5000) {
        predictedCell = CellEnum.US001; // Mid Market
        confidence = 0.90;
      }

      return {
        optimalCellRecommendation: predictedCell,
        cellPredictionConfidence: Math.floor(confidence * 100),
      };
    case "risk_assessment_and_performance_prediction":
      const { organizationName, cell, adminEmails, industry: orgIndustry } = payload;
      const riskScore = Math.floor(Math.random() * 40) + 20; // 20-60
      const riskAdvisories =
        riskScore > 40
          ? ["Potential regulatory compliance risk in sector.", "Review admin email security protocols."]
          : ["Ensure robust data governance policies."];

      const projectedQ1Rev =
        cell === CellEnum.US002
          ? Math.floor(Math.random() * 500000) + 1000000
          : Math.floor(Math.random() * 100000) + 50000;
      const projectedAnnualTxVol =
        cell === CellEnum.US002
          ? Math.floor(Math.random() * 1000000) + 5000000
          : Math.floor(Math.random() * 100000) + 100000;
      const churnRate =
        cell === CellEnum.US000 ? 0.15 : cell === CellEnum.US001 ? 0.08 : 0.03;

      return {
        initialRiskScore: riskScore,
        riskAdvisories,
        projectedQ1Revenue: projectedQ1Rev,
        projectedAnnualTransactionVolume: projectedAnnualTxVol,
        churnPredictionRate: churnRate,
      };
    default:
      throw new Error(`Unknown AI query type: ${queryType}`);
  }
}

/**
 * Generates mock KPI data based on provided AI insights.
 * @param insights The AI-generated insights.
 * @returns An array of KpiData objects.
 */
export function generateKpisFromAiInsights(insights: AiInsights): KpiData[] {
  const kpis: KpiData[] = [];

  if (insights.aiNameConfidenceScore !== undefined) {
    kpis.push({
      name: "Org Name Confidence (AI)",
      value: insights.aiNameConfidenceScore,
      unit: "%",
      trend: "up",
      geminiLink: "/gemini/kpi/org-name-confidence",
    });
  }
  if (insights.cellPredictionConfidence !== undefined) {
    kpis.push({
      name: "Cell Prediction Confidence (AI)",
      value: insights.cellPredictionConfidence,
      unit: "%",
      trend: "up",
      geminiLink: "/gemini/kpi/cell-prediction-confidence",
    });
  }
  if (insights.initialRiskScore !== undefined) {
    kpis.push({
      name: "Initial Risk Score (AI)",
      value: insights.initialRiskScore,
      unit: "/100",
      trend: insights.initialRiskScore > 50 ? "up" : "down", // Higher score is worse
      geminiLink: "/gemini/kpi/initial-risk-score",
    });
  }
  if (insights.projectedQ1Revenue !== undefined) {
    kpis.push({
      name: "Projected Q1 Revenue (AI)",
      value: insights.projectedQ1Revenue.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      trend: "up",
      geminiLink: "/gemini/kpi/projected-q1-revenue",
    });
  }
  if (insights.churnPredictionRate !== undefined) {
    kpis.push({
      name: "Churn Prediction Rate (AI)",
      value: (insights.churnPredictionRate * 100).toFixed(2),
      unit: "%",
      trend: insights.churnPredictionRate > 0.1 ? "up" : "down", // Higher rate is worse
      geminiLink: "/gemini/kpi/churn-prediction-rate",
    });
  }

  return kpis;
}

/**
 * Generates mock Chart data based on provided AI insights.
 * @param insights The AI-generated insights.
 * @returns An array of ChartData objects.
 */
export function generateChartsFromAiInsights(insights: AiInsights): ChartData[] {
  const charts: ChartData[] = [];

  if (insights.projectedAnnualTransactionVolume !== undefined) {
    charts.push({
      title: "Projected Annual Transaction Volume (AI)",
      type: "bar",
      labels: ["Year 1", "Year 2", "Year 3"],
      datasets: [
        {
          label: "Volume",
          data: [
            insights.projectedAnnualTransactionVolume,
            insights.projectedAnnualTransactionVolume * 1.15, // 15% growth
            insights.projectedAnnualTransactionVolume * 1.3, // 30% growth
          ],
          backgroundColor: ["#4CAF50", "#8BC34A", "#CDDC39"],
          borderColor: ["#388E3C", "#689F38", "#AFB42B"],
        },
      ],
      geminiLink: "/gemini/chart/annual-tx-volume",
    });
  }

  if (insights.riskAdvisories && insights.riskAdvisories.length > 0) {
    charts.push({
      title: "Risk Advisory Distribution (AI)",
      type: "pie",
      labels: insights.riskAdvisories.map((_, i) => `Advisory ${i + 1}`),
      datasets: [
        {
          label: "Risk Factors",
          data: insights.riskAdvisories.map(() => 1), // Equal weight for simulation
          backgroundColor: ["#FFC107", "#FF9800", "#FF5722", "#F44336"],
          borderColor: ["#FFA000", "#F57C00", "#E64A19", "#D32F2F"],
        },
      ],
      geminiLink: "/gemini/chart/risk-advisory-distribution",
    });
  }

  return charts;
}

// --- End AI-Powered Financial Intelligence Integrations ---

export interface FormValues {
  organization_name?: string;
  send_emails_enabled?: [boolean];
  cell?: string;
  emails?: { key: string }[];
  // New AI-related fields
  industry?: string;
  projected_initial_users?: number;
  projected_annual_revenue?: number;
}

const CELL_OPTIONS = [
  {
    label: "Commercial, Free, Demo, or Dev/QA (default)",
    value: CellEnum.US000,
  },
  {
    label: "Mid Market",
    value: CellEnum.US001,
  },
  {
    label: "Enterprise (US_2)",
    value: CellEnum.US002,
  },
  {
    label: "Enterprise (US_5)",
    value: CellEnum.US005,
  },
];

const INDUSTRY_OPTIONS = [
  { label: "Financial Services", value: "financial_services" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Technology", value: "technology" },
  { label: "Retail", value: "retail" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Other", value: "other" },
];

function OrganizationForm() {
  const [createOrganization, { loading: submitting }] =
    useCreateOrganizationMutation();
  const { dispatchSuccess, dispatchError } = useDispatchContext();

  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [currentKpis, setCurrentKpis] = useState<KpiData[]>([]);
  const [currentCharts, setCurrentCharts] = useState<ChartData[]>([]);

  // Function to simulate sending data to Gemini for real-time monitoring
  const sendDataToGemini = (dataType: "KPI" | "Chart", data: any) => {
    console.log(`Sending ${dataType} data to Gemini for real-time analytics:`, data);
    // In a real application, this would be an API call to Gemini's monitoring endpoint.
    // For now, it's a console log.
  };

  async function onFormikSubmit(values: FormValues) {
    if (!values.organization_name || !values.cell) {
      dispatchError("Organization name and Cell Allocation are required.");
      return;
    }

    try {
      const result = await createOrganization({
        variables: {
          input: {
            organizationName: values.organization_name,
            sendEmailsEnabled: values.send_emails_enabled?.[0] || false,
            cell: values.cell,
            adminEmails: values.emails?.map((v) => v.key),
            // Optionally send AI-derived metadata for enhanced record-keeping
            aiPredictedCellConfidence: aiInsights?.cellPredictionConfidence,
            aiInitialRiskScore: aiInsights?.initialRiskScore,
          },
        },
      });

      if (result.data?.createOrganization?.organizationId) {
        dispatchSuccess("Organization successfully created by CDBI AI.");
        // After successful creation, trigger final AI insights capture for post-creation analytics
        if (aiInsights) {
          sendDataToGemini("KPI", generateKpisFromAiInsights(aiInsights));
          sendDataToGemini("Chart", generateChartsFromAiInsights(aiInsights));
        }
        window.location.href = "/admin"; // Redirect to admin page
      } else {
        dispatchError("Failed to create organization. Please try again.");
      }
    } catch (error: any) {
      dispatchError(`Error creating organization: ${error.message}`);
    }
  }

  const handleGenerateAiInsights = async (values: FormValues) => {
    setLoadingAi(true);
    setAiInsights(null);
    setCurrentKpis([]);
    setCurrentCharts([]);
    try {
      const nameSuggestion = await simulateGeminiAI("name_suggestion", {
        baseName: values.organization_name,
      });
      const cellPrediction = await simulateGeminiAI("cell_prediction", {
        industry: values.industry,
        projectedUsers: values.projected_initial_users,
        projectedRevenue: values.projected_annual_revenue,
      });
      const riskAndPerformance = await simulateGeminiAI("risk_assessment_and_performance_prediction", {
        organizationName: values.organization_name,
        cell: cellPrediction.optimalCellRecommendation, // Use predicted cell for more accurate risk/perf
        adminEmails: values.emails?.map(v => v.key) || [],
        industry: values.industry
      });

      const combinedInsights: AiInsights = {
        ...nameSuggestion,
        ...cellPrediction,
        ...riskAndPerformance,
      };

      setAiInsights(combinedInsights);

      const kpis = generateKpisFromAiInsights(combinedInsights);
      setCurrentKpis(kpis);
      sendDataToGemini("KPI", kpis); // Send KPIs to Gemini
      
      const charts = generateChartsFromAiInsights(combinedInsights);
      setCurrentCharts(charts);
      sendDataToGemini("Chart", charts); // Send Charts data to Gemini

    } catch (error: any) {
      dispatchError(`AI Insight generation failed: ${error.message}`);
      setAiInsights(null);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <Formik<FormValues>
      onSubmit={onFormikSubmit}
      initialValues={{
        emails: [],
        cell: CellEnum.US000,
        industry: INDUSTRY_OPTIONS[0].value,
        projected_initial_users: 1000,
        projected_annual_revenue: 1000000,
      }}
    >
      {({ handleSubmit, isValid, values, setFieldValue }) => (
        <PageHeader hideBreadCrumbs title="Create New Organization with AI Power">
          <Form>
            <FormContainer>
              <FieldsRow columns={1}>
                <FieldGroup>
                  <Label>Organization Name (AI-Enhanced)</Label>
                  <Field
                    name="organization_name"
                    type="text"
                    component={FormikInputField}
                    validate={required}
                  />
                  <FormikErrorMessage name="organization_name" />
                  {aiInsights?.suggestedOrganizationName && (
                    <div className="text-sm text-blue-600 mt-2 p-2 bg-blue-50 rounded">
                      <strong>AI Suggestion:</strong>{" "}
                      {aiInsights.suggestedOrganizationName} (Confidence:{" "}
                      {aiInsights.aiNameConfidenceScore}%)
                      <Button
                        buttonType="tertiary"
                        className="ml-2 text-xs"
                        onClick={() =>
                          setFieldValue(
                            "organization_name",
                            aiInsights.suggestedOrganizationName
                          )
                        }
                      >
                        Use AI Name
                      </Button>
                    </div>
                  )}
                </FieldGroup>
              </FieldsRow>

              <FieldsRow columns={1}>
                <FieldGroup direction="left-to-right">
                  <Field
                    name="send_emails_enabled"
                    type="checkbox"
                    value
                    component={FormikCheckboxField}
                  />
                  <Label
                    className="pl-2"
                    helpText="Leverage CDBI AI's secure communication protocols for email capabilities."
                  >
                    Send Emails Capability (AI-Secured)
                  </Label>
                </FieldGroup>
              </FieldsRow>

              {/* New AI Input Fields */}
              <FieldsRow columns={2}>
                <FieldGroup>
                  <Label>Industry (for AI context)</Label>
                  <Field
                    id="industry"
                    name="industry"
                    options={INDUSTRY_OPTIONS}
                    component={FormikSelectField}
                    validate={required}
                  />
                  <FormikErrorMessage name="industry" />
                </FieldGroup>
                <FieldGroup>
                  <Label>Projected Initial Users (for AI prediction)</Label>
                  <Field
                    name="projected_initial_users"
                    type="number"
                    component={FormikInputField}
                    validate={required}
                  />
                  <FormikErrorMessage name="projected_initial_users" />
                </FieldGroup>
              </FieldsRow>
              <FieldsRow columns={1}>
                <FieldGroup>
                  <Label>Projected Annual Revenue (for AI prediction)</Label>
                  <Field
                    name="projected_annual_revenue"
                    type="number"
                    component={FormikInputField}
                    validate={required}
                  />
                  <FormikErrorMessage name="projected_annual_revenue" />
                </FieldGroup>
              </FieldsRow>

              <FieldsRow columns={1}>
                <FieldGroup>
                  <Label>Cell Allocation (AI-Optimized)</Label>
                  <Label className="text-xs text-text-muted">
                    CDBI AI can recommend the optimal customer segment based on your inputs.
                  </Label>
                  <Field
                    id="cell"
                    name="cell"
                    options={CELL_OPTIONS}
                    component={FormikSelectField}
                    validate={required}
                  />
                  <FormikErrorMessage name="cell" />
                  {aiInsights?.optimalCellRecommendation && (
                    <div className="text-sm text-green-600 mt-2 p-2 bg-green-50 rounded">
                      <strong>AI Recommended Cell:</strong>{" "}
                      {
                        CELL_OPTIONS.find(
                          (opt) => opt.value === aiInsights.optimalCellRecommendation
                        )?.label
                      }{" "}
                      (Confidence: {aiInsights.cellPredictionConfidence}%)
                      <Button
                        buttonType="tertiary"
                        className="ml-2 text-xs"
                        onClick={() =>
                          setFieldValue("cell", aiInsights.optimalCellRecommendation)
                        }
                      >
                        Use AI Recommendation
                      </Button>
                    </div>
                  )}
                </FieldGroup>
              </FieldsRow>

              <FieldArray
                name="emails"
                render={(props) => <EmailForm {...props} />}
              />

              <FieldsRow columns={1}>
                <Button
                  buttonType="secondary"
                  onClick={() => handleGenerateAiInsights(values)}
                  disabled={loadingAi || submitting}
                  className="mr-2"
                >
                  {loadingAi ? (
                    <>
                      <ClipLoader size={16} color="#fff" className="mr-2" />
                      Generating AI Insights...
                    </>
                  ) : (
                    "Generate AI Insights & Predictions"
                  )}
                </Button>
              </FieldsRow>

              {/* Display AI Insights */}
              {aiInsights && (
                <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">
                    CDBI AI Insights & Predictions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiInsights.aiNameComplianceStatus && (
                      <p>
                        <strong>Name Compliance:</strong>{" "}
                        <span
                          className={`font-medium ${
                            aiInsights.aiNameComplianceStatus === "Compliant"
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {aiInsights.aiNameComplianceStatus}
                        </span>
                      </p>
                    )}
                    {aiInsights.initialRiskScore !== undefined && (
                      <p>
                        <strong>Initial Risk Score (AI):</strong>{" "}
                        <span
                          className={`font-medium ${
                            aiInsights.initialRiskScore > 50
                              ? "text-red-700"
                              : aiInsights.initialRiskScore > 30
                              ? "text-orange-700"
                              : "text-green-700"
                          }`}
                        >
                          {aiInsights.initialRiskScore}/100
                        </span>
                        {aiInsights.riskAdvisories &&
                          aiInsights.riskAdvisories.length > 0 && (
                            <span className="ml-2 text-xs text-gray-600 italic">
                              ({aiInsights.riskAdvisories.join("; ")})
                            </span>
                          )}
                      </p>
                    )}
                    {aiInsights.projectedQ1Revenue !== undefined && (
                      <p>
                        <strong>Projected Q1 Revenue (AI):</strong>{" "}
                        <span className="font-medium text-green-700">
                          {aiInsights.projectedQ1Revenue.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </span>
                      </p>
                    )}
                    {aiInsights.projectedAnnualTransactionVolume !== undefined && (
                      <p>
                        <strong>Projected Annual Tx Volume (AI):</strong>{" "}
                        <span className="font-medium text-green-700">
                          {aiInsights.projectedAnnualTransactionVolume.toLocaleString(
                            "en-US"
                          )}
                        </span>
                      </p>
                    )}
                    {aiInsights.churnPredictionRate !== undefined && (
                      <p>
                        <strong>Churn Prediction (AI):</strong>{" "}
                        <span
                          className={`font-medium ${
                            aiInsights.churnPredictionRate > 0.1
                              ? "text-red-700"
                              : "text-green-700"
                          }`}
                        >
                          {(aiInsights.churnPredictionRate * 100).toFixed(2)}% in first year
                        </span>
                      </p>
                    )}
                    {aiInsights.sentimentAnalysis && (
                      <p>
                        <strong>Sentiment Analysis (AI):</strong>{" "}
                        <span
                          className={`font-medium ${
                            aiInsights.sentimentAnalysis === "Positive"
                              ? "text-green-700"
                              : aiInsights.sentimentAnalysis === "Negative"
                              ? "text-red-700"
                              : "text-gray-700"
                          }`}
                        >
                          {aiInsights.sentimentAnalysis}
                        </span>
                      </p>
                    )}
                    {aiInsights.strategicRecommendations &&
                      aiInsights.strategicRecommendations.length > 0 && (
                        <div className="md:col-span-2">
                          <strong>Strategic Recommendations (AI):</strong>
                          <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                            {aiInsights.strategicRecommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Display KPIs */}
              {currentKpis.length > 0 && (
                <div className="mt-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">
                    Real-time KPIs (Linked to Gemini)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentKpis.map((kpi, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded shadow-sm text-center"
                      >
                        <p className="text-sm text-gray-600">{kpi.name}</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {kpi.value}
                          {kpi.unit && <span className="text-base ml-1">{kpi.unit}</span>}
                        </p>
                        <a
                          href={kpi.geminiLink || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-600 hover:underline mt-1 block"
                        >
                          View in Gemini &rarr;
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display Charts (Placeholder) */}
              {currentCharts.length > 0 && (
                <div className="mt-6 p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3">
                    AI Predictive Charts (Linked to Gemini)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentCharts.map((chart, index) => (
                      <div key={index} className="bg-white p-4 rounded shadow-sm">
                        <h4 className="font-semibold text-gray-800">{chart.title}</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          {/* In a real app, integrate a charting library like Chart.js or Recharts here */}
                          <strong className="block text-center mt-4 text-gray-500">
                            [{chart.type.toUpperCase()} CHART PLACEHOLDER]
                          </strong>
                          <ul className="text-xs mt-2 pl-4 list-disc">
                            {chart.datasets.map((dataset, dsIndex) => (
                              <li key={dsIndex}>
                                {dataset.label}: {dataset.data.join(", ")}
                              </li>
                            ))}
                          </ul>
                        </p>
                        <a
                          href={chart.geminiLink || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-orange-600 hover:underline mt-2 block text-right"
                        >
                          Analyze in Gemini &rarr;
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <FieldsRow columns={1} className="mt-6">
                <Button
                  id="create-org-btn"
                  buttonType="primary"
                  onClick={() => handleSubmit()}
                  disabled={submitting || !isValid || loadingAi}
                >
                  Create Organization (CDBI AI Verified)
                </Button>
                <ClipLoader loading={submitting} className="ml-2" />
              </FieldsRow>
            </FormContainer>
          </Form>
        </PageHeader>
      )}
    </Formik>
  );
}

export default OrganizationForm;