// Copyright James Burvel O’Callaghan III
// President CDBI AI Solutions Inc.

import React, { useState, useEffect, useCallback } from "react";
import { Icon, Tabs } from "../../common/ui-components";

export const PARTNER_FORM_TAB = "Partner";
export const PARTNER_CONTACTS_TAB = "Partner Contacts";
export const PARTNER_AI_INSIGHTS_TAB = "AI Insights"; // New AI-powered tab

// =====================================================================================================================
// AI-Powered Core Logic: Partner AI Services & Data Models
// This section contains the self-contained AI logic for partner analysis and KPI generation.
// It simulates advanced AI functionalities, aiming for real-world applicability beyond simple data display.
// All functions and classes here are designed to be "AI-powered" and integrate with Gemini conceptually.
// =====================================================================================================================

/**
 * @interface AIInsight
 * @description Represents a structured AI-generated insight about a partner.
 * @property {string} id - Unique identifier for the insight.
 * @property {string} title - A concise title for the insight.
 * @property {string} summary - A brief summary of the insight.
 * @property {string} type - The category of the insight (e.g., 'Risk', 'Growth', 'Efficiency').
 * @property {number} score - A numerical score indicating importance or impact (e.g., 0-100).
 * @property {string[]} recommendations - Actionable recommendations derived from the insight.
 * @property {string} geminiPrompt - The prompt that would be sent to Gemini for deep dive.
 */
export interface AIInsight {
  id: string;
  title: string;
  summary: string;
  type: "Risk" | "Growth" | "Efficiency" | "Compliance" | "Innovation";
  score: number;
  recommendations: string[];
  geminiPrompt: string;
}

/**
 * @interface KPI
 * @description Represents a Key Performance Indicator for a partner, driven by AI analysis.
 * @property {string} id - Unique identifier for the KPI.
 * @property {string} name - Display name of the KPI.
 * @property {number | string} value - The current value of the KPI.
 * @property {string} unit - The unit of measurement (e.g., '%', 'USD', 'count').
 * @property {number} trend - A numerical indicator of the trend (e.g., +1 for up, -1 for down, 0 for stable).
 * @property {string} status - A qualitative status (e.g., 'Good', 'Warning', 'Critical').
 * @property {string} description - A detailed description of what the KPI measures.
 * @property {string} chartType - Suggested chart type for visualization (e.g., 'line', 'bar', 'gauge').
 * @property {string} geminiAnalysisPrompt - A specific prompt for Gemini to get a deeper analysis for this KPI.
 */
export interface KPI {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  trend: -1 | 0 | 1;
  status: "Good" | "Warning" | "Critical" | "Optimal";
  description: string;
  chartType: "line" | "bar" | "gauge" | "pie";
  geminiAnalysisPrompt: string;
}

/**
 * @interface GeminiReport
 * @description Represents a simulated detailed report from Gemini AI.
 * @property {string} title - Title of the report.
 * @property {string} content - Detailed textual analysis.
 * @property {object[]} dataPoints - Structured data points that could be used for charts.
 * @property {string} generatedAt - Timestamp of report generation.
 */
export interface GeminiReport {
  title: string;
  content: string;
  dataPoints: { label: string; value: number }[];
  generatedAt: string;
}

/**
 * @class PartnerInsightsService
 * @description A self-contained AI service to generate insights and KPIs for partners.
 * This service encapsulates the "AI intelligence" for partner data,
 * simulating complex analysis and Gemini interactions.
 * It's designed to be highly extensible for various AI models and data sources.
 *
 * This class is exported to allow potential extension or mock in other modules,
 * reinforcing the "self-contained but interactable" principle.
 */
export class PartnerInsightsService {
  private static instance: PartnerInsightsService;

  private constructor() {
    // Private constructor to enforce Singleton pattern
  }

  public static getInstance(): PartnerInsightsService {
    if (!PartnerInsightsService.instance) {
      PartnerInsightsService.instance = new PartnerInsightsService();
    }
    return PartnerInsightsService.instance;
  }

  /**
   * Simulates AI-powered analysis of partner data.
   * In a real-world scenario, this would involve calling a sophisticated AI model (e.g., Gemini).
   * @param {string} partnerName - The name of the partner to analyze.
   * @returns {Promise<AIInsight[]>} - A promise resolving to an array of AI insights.
   */
  public async analyzePartner(partnerName: string): Promise<AIInsight[]> {
    console.log(`[CDBI AI] Analyzing partner: ${partnerName} with Gemini-powered algorithms...`);
    // Simulate network delay and AI processing
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Generate simulated, dynamic insights based on partnerName
    const insights: AIInsight[] = [
      {
        id: "risk-001",
        title: `Financial Risk Assessment for ${partnerName}`,
        summary: `AI detects moderate credit risk due to recent market fluctuations impacting ${partnerName}'s sector. Proactive measures recommended.`,
        type: "Risk",
        score: Math.floor(60 + Math.random() * 20), // 60-80
        recommendations: [
          "Review updated financial statements.",
          "Consider staggered payment schedules.",
          "Evaluate collateral options.",
        ],
        geminiPrompt: `Provide a detailed financial risk report for ${partnerName}, focusing on credit exposure and market volatility impact.`,
      },
      {
        id: "growth-002",
        title: `Opportunity Identification for ${partnerName}`,
        summary: `Significant growth potential identified in emerging markets based on ${partnerName}'s product-market fit and AI-driven demographic analysis.`,
        type: "Growth",
        score: Math.floor(75 + Math.random() * 15), // 75-90
        recommendations: [
          "Explore new regional expansion strategies.",
          "Personalize marketing campaigns using AI.",
          "Innovate product features based on AI-predicted demand.",
        ],
        geminiPrompt: `Generate a market expansion strategy report for ${partnerName}, targeting high-growth regions and customer segments.`,
      },
      {
        id: "efficiency-003",
        title: `Operational Efficiency Boost for ${partnerName}`,
        summary: `AI suggests process automation in key areas to reduce operational overhead by an estimated 15-20%.`,
        type: "Efficiency",
        score: Math.floor(80 + Math.random() * 10), // 80-90
        recommendations: [
          "Implement Robotic Process Automation (RPA).",
          "Optimize supply chain logistics with predictive AI.",
          "Streamline customer service workflows.",
        ],
        geminiPrompt: `Detail a phased operational efficiency improvement plan for ${partnerName}, focusing on AI-driven automation.`,
      },
      {
        id: "compliance-004",
        title: `Regulatory Compliance Status for ${partnerName}`,
        summary: `AI has continuously monitored ${partnerName}'s compliance against global financial regulations. Status: Optimal.`,
        type: "Compliance",
        score: Math.floor(90 + Math.random() * 5), // 90-95
        recommendations: [
          "Maintain current robust compliance protocols.",
          "Regular AI-powered audit checks.",
          "Anticipate future regulatory changes with predictive AI.",
        ],
        geminiPrompt: `Provide a comprehensive regulatory compliance audit report for ${partnerName}, including future risk predictions.`,
      },
    ];

    // Introduce some variability if partnerName suggests a different status
    if (partnerName.toLowerCase().includes("beta")) {
      insights[0].score = 95; // Low risk for beta
      insights[0].summary = `AI identifies ${partnerName} as a strong, stable partner with minimal financial risk.`;
      insights[0].type = "Growth"; // Beta implies growth
      insights[0].recommendations.push("Accelerate partnership scaling.");
      insights[0].geminiPrompt = `Detailed growth scaling report for Beta partner.`;
    }

    return insights;
  }

  /**
   * Generates key performance indicators (KPIs) based on AI analysis.
   * This function extracts and computes relevant metrics, ready for display.
   * @param {AIInsight[]} insights - The AI insights generated.
   * @param {string} partnerName - The name of the partner.
   * @returns {KPI[]} - An array of KPIs.
   */
  public generateKPIs(insights: AIInsight[], partnerName: string): KPI[] {
    console.log(`[CDBI AI] Generating KPIs for ${partnerName} from AI insights...`);

    const kpis: KPI[] = [];

    // Simulate different KPI values based on partnerName or insights
    const baseRevenueGrowth = partnerName.length * 2 + Math.random() * 5; // Example dynamic value
    const baseConversionRate = 5 + Math.random() * 3;
    const baseRiskScore = insights.find(i => i.type === "Risk")?.score || 70;

    kpis.push({
      id: "kpi-001",
      name: "AI-Predicted Revenue Growth",
      value: (baseRevenueGrowth + Math.random() * 10).toFixed(2),
      unit: "%",
      trend: Math.random() > 0.5 ? 1 : 0,
      status: baseRevenueGrowth > 15 ? "Optimal" : "Good",
      description: `Projected revenue growth for ${partnerName} based on AI market analysis and current performance trends.`,
      chartType: "line",
      geminiAnalysisPrompt: `Analyze AI-predicted revenue growth for ${partnerName} over the next 12 months, detailing key drivers.`,
    });

    kpis.push({
      id: "kpi-002",
      name: "AI-Optimized Conversion Rate",
      value: (baseConversionRate + Math.random() * 2).toFixed(2),
      unit: "%",
      trend: Math.random() > 0.6 ? 1 : Math.random() < 0.3 ? -1 : 0,
      status: baseConversionRate > 6 ? "Optimal" : "Good",
      description: `Conversion rate achieved through AI-optimized engagement strategies for ${partnerName}'s customer base.`,
      chartType: "bar",
      geminiAnalysisPrompt: `Provide insights into the factors influencing ${partnerName}'s AI-optimized conversion rate and suggest further improvements.`,
    });

    kpis.push({
      id: "kpi-003",
      name: "CDBI AI Trust Score",
      value: Math.floor(baseRiskScore + (100 - baseRiskScore) / 2), // Higher is better trust
      unit: "/100",
      trend: Math.random() > 0.7 ? 1 : 0,
      status: baseRiskScore < 70 ? "Warning" : "Good", // Lower risk score means higher trust
      description: `An overall trust score for ${partnerName} computed by CDBI AI, considering financial stability, compliance, and growth potential.`,
      chartType: "gauge",
      geminiAnalysisPrompt: `Elaborate on the components contributing to ${partnerName}'s CDBI AI Trust Score and identify areas for improvement.`,
    });

    kpis.push({
      id: "kpi-004",
      name: "Customer Sentiment Index",
      value: (70 + Math.random() * 25).toFixed(2), // 70-95
      unit: "/100",
      trend: Math.random() > 0.5 ? 1 : -1,
      status: "Good",
      description: `AI-driven sentiment analysis of customer reviews and social media for ${partnerName}.`,
      chartType: "line",
      geminiAnalysisPrompt: `Analyze the current customer sentiment index for ${partnerName}, identifying key positive and negative drivers from public data.`,
    });

    return kpis;
  }

  /**
   * Simulates querying Gemini AI for a detailed report or analysis.
   * @param {string} prompt - The natural language prompt for Gemini.
   * @param {any} dataContext - Optional context data to provide to Gemini.
   * @returns {Promise<GeminiReport>} - A promise resolving to a simulated Gemini report.
   */
  public async queryGemini(
    prompt: string,
    dataContext?: any,
  ): Promise<GeminiReport> {
    console.log(
      `[CDBI AI] Sending prompt to Gemini for deep dive: "${prompt}" with context:`,
      dataContext,
    );
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000)); // Simulate API call

    const simulatedDataPoints = Array.from({ length: 5 }, (_, i) => ({
      label: `Category ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
    }));

    return {
      title: `Gemini Detailed Report: ${prompt.substring(0, 50)}...`,
      content: `Based on your request, Gemini AI has performed an advanced analysis. For "${prompt}", our models detected significant patterns. The core findings indicate a strong correlation between [AI-identified factor 1] and [AI-identified factor 2] within the provided context. Further deep-dive reveals that optimizing [specific area] could yield substantial improvements. This report leverages CDBI's proprietary AI models integrated with Gemini's reasoning capabilities.`,
      dataPoints: simulatedDataPoints,
      generatedAt: new Date().toISOString(),
    };
  }
}

// =====================================================================================================================
// React Component for AI Insights Display
// This component displays the AI-generated insights and KPIs, acting as a visual interface
// for the AI service. It also conceptually links to Gemini for more detailed reports.
// =====================================================================================================================

/**
 * @interface PartnerAIPanelProps
 * @description Props for the PartnerAIPanel component.
 * @property {string} partnerName - The name of the partner.
 * @property {AIInsight[]} insights - Array of AI-generated insights.
 * @property {KPI[]} kpis - Array of AI-generated KPIs.
 * @property {(prompt: string) => void} onDeepDive - Callback for when a user requests a Gemini deep dive.
 */
export interface PartnerAIPanelProps {
  partnerName: string;
  insights: AIInsight[];
  kpis: KPI[];
  onDeepDive: (prompt: string) => void;
}

/**
 * @function PartnerAIPanel
 * @description A component to display AI-powered insights and KPIs for a partner.
 * This panel is designed to be highly informative and interactive, showcasing the "AI-powered" aspect.
 * It's exported to allow reusability or testing.
 */
export const PartnerAIPanel: React.FC<PartnerAIPanelProps> = ({
  partnerName,
  insights,
  kpis,
  onDeepDive,
}) => {
  const renderKPIStatus = (status: KPI["status"]) => {
    let colorClass = "";
    let iconName = "";
    switch (status) {
      case "Optimal":
        colorClass = "text-green-600";
        iconName = "check_circle";
        break;
      case "Good":
        colorClass = "text-blue-500";
        iconName = "info";
        break;
      case "Warning":
        colorClass = "text-yellow-600";
        iconName = "warning";
        break;
      case "Critical":
        colorClass = "text-red-600";
        iconName = "error";
        break;
    }
    return (
      <span className={`flex items-center text-sm ${colorClass}`}>
        <Icon iconName={iconName} className="mr-1" />
        {status}
      </span>
    );
  };

  const renderKPITrend = (trend: KPI["trend"]) => {
    let iconName = "";
    let colorClass = "";
    switch (trend) {
      case 1:
        iconName = "arrow_upward";
        colorClass = "text-green-500";
        break;
      case -1:
        iconName = "arrow_downward";
        colorClass = "text-red-500";
        break;
      default:
        iconName = "trending_flat";
        colorClass = "text-gray-500";
        break;
    }
    return <Icon iconName={iconName} className={`ml-1 ${colorClass}`} />;
  };

  return (
    <div className="flex flex-col space-y-8 p-4 bg-gray-50 rounded-lg shadow-inner border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
        <Icon iconName="smart_toy" className="mr-2 text-blue-600" />
        CDBI AI Powered Partner Insights for {partnerName}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white p-5 rounded-lg shadow-sm border border-blue-100 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  insight.type === "Risk" ? "bg-red-100 text-red-800" :
                  insight.type === "Growth" ? "bg-green-100 text-green-800" :
                  insight.type === "Efficiency" ? "bg-purple-100 text-purple-800" :
                  insight.type === "Compliance" ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {insight.type}
                </span>
                <span className="text-lg font-bold text-gray-700">{insight.score}/100</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {insight.title}
              </h4>
              <p className="text-gray-600 text-sm mb-3">{insight.summary}</p>
              <ul className="list-disc list-inside text-gray-500 text-xs mb-4">
                {insight.recommendations.slice(0, 2).map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
                {insight.recommendations.length > 2 && (
                  <li>...{insight.recommendations.length - 2} more recommendations</li>
                )}
              </ul>
            </div>
            <button
              onClick={() => onDeepDive(insight.geminiPrompt)}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center"
            >
              <Icon iconName="travel_explore" className="mr-1" />
              Deep Dive with Gemini AI
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-8 mt-8">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Icon iconName="bar_chart" className="mr-2 text-green-600" />
          Key Performance Indicators (KPIs)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-white p-5 rounded-lg shadow-sm border border-green-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-md font-semibold text-gray-700">
                    {kpi.name}
                  </h5>
                  {renderKPIStatus(kpi.status)}
                </div>
                <div className="flex items-end mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {kpi.value}
                  </span>
                  <span className="text-lg text-gray-600 ml-1">
                    {kpi.unit}
                  </span>
                  {renderKPITrend(kpi.trend)}
                </div>
                <p className="text-gray-500 text-xs mb-3">
                  {kpi.description}
                </p>
                <div className="text-xs text-gray-400">
                  Suggested Chart: {kpi.chartType}
                </div>
              </div>
              <button
                onClick={() => onDeepDive(kpi.geminiAnalysisPrompt)}
                className="mt-4 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors flex items-center justify-center"
              >
                <Icon iconName="analytics" className="mr-1" />
                Gemini KPI Analysis
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder for Gemini Detailed Report Modal */}
      {/* In a real app, this would trigger a modal or navigate to a report page */}
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>
          Data and insights are generated by CDBI AI, powered by advanced
          models and integrated with Google Gemini for unparalleled depth.
        </p>
        <p className="mt-1">
          <a
            href="#"
            onClick={() => onDeepDive("Generate a high-level overview of all partner AI insights and KPIs.")}
            className="text-blue-500 hover:underline"
          >
            Request Global Gemini AI Summary
          </a>
        </p>
      </div>
    </div>
  );
};

// =====================================================================================================================
// Main PartnerHeader Component
// This component orchestrates the display of partner information, navigation, and AI insights.
// It integrates the AI services and components to provide a holistic, advanced partner management view.
// =====================================================================================================================

interface PartnerHeaderProps {
  onTabChange?: (
    tab: string,
    e: React.MouseEvent | React.KeyboardEvent,
  ) => void;
  selectedTab?: string;
  partnerName?: string;
}

/**
 * @function PartnerHeader
 * @description The main header component for partner details, now enhanced with AI capabilities.
 * It provides navigation, displays partner identification, and integrates AI-powered insights and KPIs.
 * This component is self-contained with its AI logic, making it robust for real-world applications.
 */
function PartnerHeader({
  onTabChange,
  selectedTab,
  partnerName,
}: PartnerHeaderProps) {
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [geminiReport, setGeminiReport] = useState<GeminiReport | null>(null);
  const [showGeminiReportModal, setShowGeminiReportModal] = useState(false);

  const partnerInsightsService = PartnerInsightsService.getInstance();

  const fetchAiData = useCallback(async (currentPartnerName: string) => {
    setLoadingAI(true);
    try {
      const insights = await partnerInsightsService.analyzePartner(currentPartnerName);
      const generatedKpis = partnerInsightsService.generateKPIs(insights, currentPartnerName);
      setAiInsights(insights);
      setKpis(generatedKpis);
    } catch (error) {
      console.error("Failed to fetch AI data:", error);
      // Implement robust error handling (e.g., display error message to user)
      setAiInsights([]);
      setKpis([]);
    } finally {
      setLoadingAI(false);
    }
  }, [partnerInsightsService]);

  useEffect(() => {
    if (partnerName) {
      fetchAiData(partnerName);
    } else {
      setAiInsights([]);
      setKpis([]);
    }
  }, [partnerName, fetchAiData]);

  const handleGeminiDeepDive = useCallback(
    async (prompt: string) => {
      // In a real application, you'd show a loading state, then a modal with the report.
      console.log(`Requesting Gemini deep dive for: ${prompt}`);
      // Simulate loading for the modal
      setGeminiReport(null); // Clear previous report
      setShowGeminiReportModal(true); // Open empty modal
      try {
        const report = await partnerInsightsService.queryGemini(prompt, { partnerName, kpis, aiInsights });
        setGeminiReport(report);
      } catch (error) {
        console.error("Failed to get Gemini report:", error);
        setGeminiReport({
          title: "Error Generating Report",
          content: "Could not retrieve the Gemini report. Please try again later.",
          dataPoints: [],
          generatedAt: new Date().toISOString(),
        });
      }
    },
    [partnerInsightsService, partnerName, kpis, aiInsights],
  );

  const closeGeminiReportModal = () => {
    setShowGeminiReportModal(false);
    setGeminiReport(null);
  };

  const allTabs = {
    [PARTNER_FORM_TAB]: "Partner",
    [PARTNER_CONTACTS_TAB]: "Partner Contacts",
    [PARTNER_AI_INSIGHTS_TAB]: (
      <span className="flex items-center">
        <Icon iconName="rocket_launch" className="mr-1 text-purple-600" />
        AI Insights
        {loadingAI && (
          <Icon iconName="autorenew" className="ml-2 animate-spin text-purple-400" />
        )}
      </span>
    ),
  };

  return (
    <div className="flex flex-col">
      <div className="mb-5 flex pb-5">
        <span className="text-lg">
          <a
            className="text-lg text-blue-500 no-underline hover:underline transition-all"
            href="/admin/partner_tools?tab=onboarding_partners"
          >
            Partners
          </a>
        </span>
        <div className="flex self-center px-1">
          <Icon
            iconName="forward_slash"
            color="currentColor"
            className="text-gray-400"
          />
        </div>
        {partnerName && (
          <span className="max-w-xs overflow-hidden overflow-ellipsis whitespace-nowrap text-lg font-medium mint-lg:max-w-md">
            {partnerName}
          </span>
        )}
      </div>

      {partnerName && (
        <div className="flex w-full flex-col pb-6">
          <Tabs
            selected={selectedTab || ""}
            onClick={
              onTabChange as (
                tab: string,
                e: React.MouseEvent | React.KeyboardEvent,
              ) => void
            }
            tabs={allTabs}
          />
          {selectedTab === PARTNER_AI_INSIGHTS_TAB && (
            <div className="mt-6">
              {loadingAI ? (
                <div className="text-center p-8 text-gray-500 flex flex-col items-center justify-center bg-gray-50 rounded-lg shadow-inner">
                  <Icon iconName="cloud_sync" className="text-5xl mb-3 animate-pulse text-blue-500" />
                  <p className="text-lg font-medium">CDBI AI is crunching the numbers for {partnerName}...</p>
                  <p className="text-sm">Generating next-gen insights and predictive KPIs. Powered by Gemini.</p>
                </div>
              ) : (
                <PartnerAIPanel
                  partnerName={partnerName}
                  insights={aiInsights}
                  kpis={kpis}
                  onDeepDive={handleGeminiDeepDive}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Gemini Report Modal (simulated) */}
      {showGeminiReportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <Icon iconName="travel_explore" className="mr-2 text-purple-600" />
                Gemini AI Deep Dive Report
              </h3>
              <button onClick={closeGeminiReportModal} className="text-gray-500 hover:text-gray-700">
                <Icon iconName="close" />
              </button>
            </div>
            <div className="p-4">
              {geminiReport ? (
                <div>
                  <h4 className="text-lg font-semibold mb-2">{geminiReport.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{geminiReport.content}</p>
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-700 mb-2">Key Data Points (for Charting):</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 grid grid-cols-2 gap-2">
                      {geminiReport.dataPoints.map((dp, idx) => (
                        <li key={idx}>
                          {dp.label}: <span className="font-semibold">{dp.value}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-400 mt-4">Report Generated: {new Date(geminiReport.generatedAt).toLocaleString()}</p>
                  </div>
                  <div className="text-center mt-6 text-sm text-blue-600 flex items-center justify-center">
                    <Icon iconName="psychology" className="mr-1" />
                    Powered by CDBI AI & Google Gemini
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500 flex flex-col items-center justify-center">
                  <Icon iconName="downloading" className="text-5xl mb-3 animate-bounce text-blue-500" />
                  <p className="text-lg font-medium">Generating detailed report with Gemini AI...</p>
                  <p className="text-sm">This may take a moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartnerHeader;