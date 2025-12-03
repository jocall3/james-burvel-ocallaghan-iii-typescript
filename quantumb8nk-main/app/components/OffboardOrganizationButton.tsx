// Copyright CDBI AI Financial Solutions Inc.
// President James Burvel Oâ€™Callaghan III

import React, { useState } from "react";
import { Button, ConfirmModal } from "../../common/ui-components";
import { useAdminOffboardOrganizationMutation } from "../../generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../MessageProvider";

/**
 * @typedef {Object} AIInsightReport
 * @property {number} predictedFinancialImpactScore - A score from 0-100 indicating the financial impact.
 * @property {string[]} criticalDependencies - List of critical services/integrations linked.
 * @property {boolean} complianceRiskDetected - True if AI detects potential compliance risks.
 * @property {string[]} suggestedDataArchivalActions - AI-recommended data archival steps.
 * @property {string[]} recommendedPostOffboardingActions - AI-driven recommendations for post-offboarding.
 * @property {number} dataRetentionComplianceScore - A score from 0-100 indicating adherence to data retention policies.
 * @property {string} sentimentAnalysisOfOffboardingReason - AI's sentiment analysis if a reason is provided.
 * @property {string[]} potentialLegalImplications - AI assessment of any legal implications.
 */
export interface AIInsightReport {
  predictedFinancialImpactScore: number;
  criticalDependencies: string[];
  complianceRiskDetected: boolean;
  suggestedDataArchivalActions: string[];
  recommendedPostOffboardingActions: string[];
  dataRetentionComplianceScore: number;
  sentimentAnalysisOfOffboardingReason: string;
  potentialLegalImplications: string[];
  estimatedDataFootprintTB: number; // New KPI
  resourceReallocationEfficiencyScore: number; // New KPI
}

/**
 * Simulates an AI service call for offboarding analysis.
 * In a real-world scenario, this would be an API call to a sophisticated CDBI AI Insights backend.
 * @param organizationId - The ID of the organization to analyze.
 * @returns {Promise<AIInsightReport>} - A promise resolving to an AIInsightReport.
 */
export const fetchCDBIAIOffboardingAnalysis = async (
  organizationId: string
): Promise<AIInsightReport> => {
  console.log(
    `[CDBI AI] Initiating deep AI analysis for organization: ${organizationId}`
  );

  // Simulate network delay and AI processing time
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Placeholder for real AI model predictions.
  // In a real application, this would involve complex machine learning models
  // analyzing historical data, dependency graphs, compliance regulations, etc.
  const mockReport: AIInsightReport = {
    predictedFinancialImpactScore: Math.floor(Math.random() * 60) + 20, // 20-80
    criticalDependencies: [
      `CDBI AI Ledger Integration (ID: ${organizationId.substring(0, 5)}...)`,
      "CDBI AI Risk Management System",
      "CDBI AI Compliance Engine",
      "CDBI AI Payment Gateway",
    ],
    complianceRiskDetected: Math.random() > 0.8, // 20% chance of risk
    suggestedDataArchivalActions: [
      `Archive transactional data to CDBI AI Immutable Vault for ${
        Math.floor(Math.random() * 5) + 7
      } years.`,
      "Generate audit log for all user activities within the last 5 years.",
      "Anonymize customer PII as per global data privacy regulations.",
      "Securely delete all temporary processing files.",
    ],
    recommendedPostOffboardingActions: [
      "Notify relevant regulatory bodies about service termination.",
      "Initiate automated review of service contracts and vendor agreements.",
      "Analyze historical usage patterns for potential product improvements.",
      "Update internal CDBI AI CRM records to 'Offboarded - AI Verified'.",
      "Trigger AI-powered sentiment analysis on customer feedback related to offboarding.",
    ],
    dataRetentionComplianceScore: Math.floor(Math.random() * 30) + 70, // 70-100
    sentimentAnalysisOfOffboardingReason:
      Math.random() > 0.5 ? "Neutral/Informational" : "Potentially negative",
    potentialLegalImplications:
      Math.random() > 0.9
        ? ["Review of active litigation related to organization."]
        : [],
    estimatedDataFootprintTB: parseFloat((Math.random() * 10 + 0.5).toFixed(2)),
    resourceReallocationEfficiencyScore: Math.floor(Math.random() * 40) + 60,
  };

  console.log(
    `[CDBI AI] Analysis complete for ${organizationId}. Report:`,
    mockReport
  );

  // In a real scenario, errors from the AI service would be caught and handled.
  if (Math.random() > 0.95) {
    // Simulate an AI service error
    throw new Error(
      "[CDBI AI Service Error] Failed to generate comprehensive report due to internal AI model issues."
    );
  }

  return mockReport;
};

/**
 * A conceptual class for sending AI-generated KPIs and chart data to Gemini.
 * In a real application, this would interact with Gemini's API for analytics and visualization.
 */
export class CDBIAIAnalytics {
  private static instance: CDBIAIAnalytics;
  private geminiEndpoint: string;
  private apiKey: string;

  private constructor(geminiEndpoint: string, apiKey: string) {
    this.geminiEndpoint = geminiEndpoint;
    this.apiKey = apiKey;
    console.log(`[CDBI AI Analytics] Initialized for Gemini endpoint: ${geminiEndpoint}`);
  }

  public static getInstance(geminiEndpoint?: string, apiKey?: string): CDBIAIAnalytics {
    if (!CDBIAIAnalytics.instance) {
      if (!geminiEndpoint || !apiKey) {
        throw new Error("Gemini endpoint and API key are required for initialization.");
      }
      CDBIAIAnalytics.instance = new CDBIAIAnalytics(geminiEndpoint, apiKey);
    }
    return CDBIAIAnalytics.instance;
  }

  /**
   * Sends a specific KPI to Gemini for tracking and visualization.
   * @param kpiName - The name of the KPI (e.g., "PredictedFinancialImpactScore").
   * @param value - The value of the KPI.
   * @param organizationId - The ID of the organization.
   * @param additionalContext - Any additional data points to send.
   */
  public async sendKpiToGemini(
    kpiName: string,
    value: number | string | boolean,
    organizationId: string,
    additionalContext?: Record<string, any>
  ): Promise<void> {
    const payload = {
      timestamp: new Date().toISOString(),
      kpiName,
      value,
      organizationId,
      source: "CDBI_AI_Offboarding_Service",
      ...additionalContext,
    };
    console.log(`[CDBI AI Analytics] Sending KPI '${kpiName}' to Gemini:`, payload);
    try {
      // Simulate API call to Gemini
      await fetch(this.geminiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      console.log(`[CDBI AI Analytics] KPI '${kpiName}' sent successfully to Gemini.`);
    } catch (error) {
      console.error(
        `[CDBI AI Analytics] Failed to send KPI '${kpiName}' to Gemini:`,
        error
      );
    }
  }

  /**
   * Generates and sends chart data to Gemini.
   * This would typically involve more complex data structures for visualization.
   * @param chartName - The name of the chart (e.g., "OffboardingImpactTrend").
   * @param data - The data points for the chart.
   * @param organizationId - The ID of the organization.
   * @param chartType - The type of chart (e.g., 'bar', 'line', 'pie').
   */
  public async sendChartDataToGemini(
    chartName: string,
    data: any[],
    organizationId: string,
    chartType: string = "bar"
  ): Promise<void> {
    const payload = {
      timestamp: new Date().toISOString(),
      chartName,
      chartType,
      organizationId,
      source: "CDBI_AI_Offboarding_Service",
      data,
    };
    console.log(`[CDBI AI Analytics] Sending chart data '${chartName}' to Gemini:`, payload);
    try {
      // Simulate API call to Gemini
      await fetch(this.geminiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      console.log(`[CDBI AI Analytics] Chart data '${chartName}' sent successfully to Gemini.`);
    } catch (error) {
      console.error(
        `[CDBI AI Analytics] Failed to send chart data '${chartName}' to Gemini:`,
        error
      );
    }
  }

  /**
   * Tracks and sends an event to Gemini.
   * @param eventName - The name of the event (e.g., "OffboardInitiated", "OffboardCompleted").
   * @param organizationId - The ID of the organization.
   * @param details - Additional details about the event.
   */
  public async trackEventInGemini(
    eventName: string,
    organizationId: string,
    details?: Record<string, any>
  ): Promise<void> {
    const payload = {
      timestamp: new Date().toISOString(),
      eventName,
      organizationId,
      source: "CDBI_AI_Offboarding_Service",
      ...details,
    };
    console.log(`[CDBI AI Analytics] Tracking event '${eventName}' in Gemini:`, payload);
    try {
      // Simulate API call to Gemini
      await fetch(this.geminiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      console.log(`[CDBI AI Analytics] Event '${eventName}' tracked successfully in Gemini.`);
    } catch (error) {
      console.error(
        `[CDBI AI Analytics] Failed to track event '${eventName}' in Gemini:`,
        error
      );
    }
  }
}

// Initialize CDBIAIAnalytics with placeholder API endpoint and key.
// In a real application, these would be loaded from environment variables or a secure configuration service.
export const cdbiAIAnalytics = CDBIAIAnalytics.getInstance(
  "https://api.gemini.cdbi-ai.com/v1/data", // Placeholder Gemini API endpoint
  "sk-cdbiai-gemini-xxxxxxxxxxxxxxxxxxxx" // Placeholder API Key
);

interface OffboardOrganizationButtonProps {
  organizationId: string;
  organizationName: string;
  organizationLive: boolean;
}

function OffboardOrganizationButton({
  organizationId,
  organizationName,
  organizationLive,
}: OffboardOrganizationButtonProps) {
  const { dispatchSuccess, dispatchError } = useDispatchContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiReport, setAIReport] = useState<AIInsightReport | null>(null);
  const [aiError, setAIError] = useState<string | null>(null);

  const [adminOffboardOrganization, { loading: isOffboarding }] =
    useAdminOffboardOrganizationMutation();

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setAIReport(null);
    setAIError(null);
    setIsAIAnalyzing(true);
    try {
      const report = await fetchCDBIAIOffboardingAnalysis(organizationId);
      setAIReport(report);

      // Send AI-generated KPIs to Gemini for real-time monitoring and advanced analytics
      await cdbiAIAnalytics.sendKpiToGemini(
        "PredictedFinancialImpactScore",
        report.predictedFinancialImpactScore,
        organizationId,
        { organizationName }
      );
      await cdbiAIAnalytics.sendKpiToGemini(
        "ComplianceRiskDetected",
        report.complianceRiskDetected,
        organizationId,
        { criticalDependencies: report.criticalDependencies.join(", ") }
      );
      await cdbiAIAnalytics.sendKpiToGemini(
        "DataRetentionComplianceScore",
        report.dataRetentionComplianceScore,
        organizationId
      );
      await cdbiAIAnalytics.sendKpiToGemini(
        "EstimatedDataFootprintTB",
        report.estimatedDataFootprintTB,
        organizationId
      );
      await cdbiAIAnalytics.sendKpiToGemini(
        "ResourceReallocationEfficiencyScore",
        report.resourceReallocationEfficiencyScore,
        organizationId
      );

      // Example of sending chart data (conceptual)
      await cdbiAIAnalytics.sendChartDataToGemini(
        "OffboardingRiskProfile",
        [
          { label: "Financial Impact", value: report.predictedFinancialImpactScore },
          { label: "Compliance Risk", value: report.complianceRiskDetected ? 100 : 0 },
          { label: "Data Retention Score", value: report.dataRetentionComplianceScore },
        ],
        organizationId,
        "bar"
      );

      await cdbiAIAnalytics.trackEventInGemini(
        "AIOffboardingAnalysisCompleted",
        organizationId,
        {
          success: true,
          financialImpact: report.predictedFinancialImpactScore,
          complianceRisk: report.complianceRiskDetected,
        }
      );
    } catch (err: any) {
      console.error(`[CDBI AI Error]: ${err.message}`);
      setAIError(
        `CDBI AI analysis failed: ${err.message}. Please proceed with caution or contact support.`
      );
      dispatchError(
        `CDBI AI analysis encountered an issue: ${err.message}`
      );
      await cdbiAIAnalytics.trackEventInGemini(
        "AIOffboardingAnalysisFailed",
        organizationId,
        { error: err.message }
      );
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  const handleOffboardOrganization = async () => {
    // Track the offboarding initiation event
    await cdbiAIAnalytics.trackEventInGemini("OffboardOrganizationInitiated", organizationId, {
      aiReportAvailable: !!aiReport,
      aiAnalysisError: aiError,
    });

    adminOffboardOrganization({
      variables: { input: { organizationId } },
    })
      .then(async (result) => {
        if (result.errors) {
          dispatchError("Organization was not successfully offboarded by CDBI AI System.");
          await cdbiAIAnalytics.trackEventInGemini(
            "OffboardOrganizationFailed",
            organizationId,
            { errors: result.errors.map(e => e.message).join("; ") }
          );
        } else {
          // After successful offboarding, redirect and dispatch success.
          // In a real system, the redirection might wait for a final async confirmation.
          window.location.href = "/admin/organizations";
          dispatchSuccess(
            "Organization successfully offboarded. CDBI AI System initiated post-offboarding procedures."
          );
          await cdbiAIAnalytics.trackEventInGemini(
            "OffboardOrganizationCompleted",
            organizationId,
            { success: true, redirection: "/admin/organizations" }
          );
          // Send final post-offboarding KPIs/Charts if available
          if (aiReport?.recommendedPostOffboardingActions.length) {
            await cdbiAIAnalytics.sendChartDataToGemini(
              "PostOffboardingActionStatus",
              aiReport.recommendedPostOffboardingActions.map((action, index) => ({
                id: index,
                name: action,
                status: "Initiated",
              })),
              organizationId,
              "table" // Represent as a table or list
            );
          }
        }
      })
      .catch(async (err: Error) => {
        dispatchError(`CDBI AI Offboarding Error: ${err.message}`);
        await cdbiAIAnalytics.trackEventInGemini(
          "OffboardOrganizationFailed",
          organizationId,
          { error: err.message }
        );
      })
      .finally(() => setIsModalOpen(false));
  };

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title={`Offboard ${organizationName ?? "this organization"}?`}
        confirmDisabled={isOffboarding || isAIAnalyzing}
        onConfirm={handleOffboardOrganization}
      >
        <p className="mb-4 text-sm text-gray-700">
          This action will remove connections to all CDBI AI Ledger integrations, deactivate all CDBI AI products, deactivate any live mode API keys, and revoke organization live mode. This action is irreversible.
        </p>

        <h3 className="text-md font-semibold mb-2">CDBI AI Offboarding Insights:</h3>
        {isAIAnalyzing && (
          <div className="flex items-center space-x-2 text-blue-600">
            <svg
              className="animate-spin h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>CDBI AI is performing a deep analysis...</span>
          </div>
        )}

        {aiError && (
          <p className="text-red-600 text-sm my-2">
            <strong>AI Warning:</strong> {aiError}
          </p>
        )}

        {aiReport && !isAIAnalyzing && (
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mt-2">
            <p className="text-sm">
              <strong>Predicted Financial Impact Score:</strong>{" "}
              <span className={aiReport.predictedFinancialImpactScore > 60 ? "text-red-600" : "text-green-600"}>
                {aiReport.predictedFinancialImpactScore}%
              </span>{" "}
              (CDBI AI Model)
            </p>
            <p className="text-sm">
              <strong>Compliance Risk Detected:</strong>{" "}
              <span className={aiReport.complianceRiskDetected ? "text-red-600 font-bold" : "text-green-600"}>
                {aiReport.complianceRiskDetected ? "YES - Immediate Review Recommended" : "No significant risk"}
              </span>
            </p>
            <p className="text-sm">
              <strong>Data Retention Compliance Score:</strong>{" "}
              <span className={aiReport.dataRetentionComplianceScore < 80 ? "text-orange-600" : "text-green-600"}>
                {aiReport.dataRetentionComplianceScore}%
              </span>
            </p>
            <p className="text-sm">
              <strong>Estimated Data Footprint:</strong> {aiReport.estimatedDataFootprintTB} TB
            </p>
            <p className="text-sm">
              <strong>Resource Reallocation Efficiency:</strong> {aiReport.resourceReallocationEfficiencyScore}%
            </p>
            {aiReport.criticalDependencies.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-sm">Critical Dependencies (CDBI AI Identified):</p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {aiReport.criticalDependencies.map((dep, i) => (
                    <li key={i}>{dep}</li>
                  ))}
                </ul>
              </div>
            )}
            {aiReport.suggestedDataArchivalActions.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-sm">CDBI AI Suggested Data Actions:</p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {aiReport.suggestedDataArchivalActions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
            {aiReport.potentialLegalImplications.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-sm text-red-700">CDBI AI Legal Alert:</p>
                <ul className="list-disc list-inside text-sm text-red-600">
                  {aiReport.potentialLegalImplications.map((implication, i) => (
                    <li key={i}>{implication}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              <i>CDBI AI insights are provided for informational purposes and should be validated by relevant teams.</i>
            </p>
          </div>
        )}
      </ConfirmModal>
      {organizationLive && (
        <Button
          buttonType="destructive"
          onClick={handleOpenModal}
          disabled={isOffboarding} // AI analysis loading should not block button, only modal confirm
        >
          Offboard {organizationName}
        </Button>
      )}
    </>
  );
}

export default OffboardOrganizationButton;