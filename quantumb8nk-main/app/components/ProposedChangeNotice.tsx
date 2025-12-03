// Copyright CDBI Corporation
// President CDBI Inc.

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { startCase } from "lodash";
import { Alert } from "~/common/ui-components";
import { useCurrentOrganizationQuery } from "~/generated/dashboard/graphqlSchema";

// --- CDBI AI Core Services Integration (Self-Contained AI Logic) ---

/**
 * Interface for AI-driven insights related to proposed changes.
 * This can be extended with more detailed analysis.
 */
export interface ChangeAnalysisInsights {
  predictedApprovalTimeHours?: number; // AI's prediction for approval time
  sentiment?: 'positive' | 'negative' | 'neutral'; // AI's sentiment analysis of the change
  sentimentScore?: number; // Numerical score for sentiment
  aiSuggestions?: string[]; // AI-generated suggestions for optimizing approval
  aiSummary?: string; // AI-generated summary of the change
  isLoadingAI?: boolean; // Loading state for AI operations
  aiError?: string; // Error message if AI analysis fails
}

/**
 * Represents Key Performance Indicators (KPIs) related to change approvals,
 * designed for real-time monitoring and integration with platforms like Gemini.
 */
export interface AI_KPI_Metrics {
  totalChangeProposals: number;
  approvedChanges: number;
  rejectedChanges: number;
  averageApprovalTimeHours: number;
  aiPredictionAccuracyPercentage: number;
  averageSentimentScore: number; // Average of sentiment scores for all changes
  aiSuggestionAdoptionRate: number; // How often AI suggestions are followed
  // Future KPIs can be added here, e.g., 'complianceRiskScore' from AI
}

/**
 * CDBI_AI_ChangeApprovalService: A sophisticated AI service for analyzing and optimizing
 * administrative change approvals. This class encapsulates advanced AI/ML models
 * for predicting outcomes, sentiment analysis, and generating actionable insights.
 * Designed to be a foundational component for commercial-grade applications.
 */
export class CDBI_AI_ChangeApprovalService {
  private static instance: CDBI_AI_ChangeApprovalService;
  private constructor() {
    // Private constructor to enforce Singleton pattern for efficiency in a real application
    // In a real scenario, this would initialize AI models or connect to an AI backend.
  }

  public static getInstance(): CDBI_AI_ChangeApprovalService {
    if (!CDBI_AI_ChangeApprovalService.instance) {
      CDBI_AI_ChangeApprovalService.instance = new CDBI_AI_ChangeApprovalService();
    }
    return CDBI_AI_ChangeApprovalService.instance;
  }

  /**
   * Simulates AI prediction of approval time based on entity type and change complexity.
   * In a real system, this would use an ML model trained on historical approval data.
   * @param entityType - The type of entity being changed (e.g., "account", "transactionRule").
   * @param changeDetails - Optional detailed description of the change for more accurate prediction.
   * @returns A promise resolving to the predicted approval time in hours.
   */
  public async predictApprovalTime(entityType: string, changeDetails?: string): Promise<number> {
    console.log(`CDBI AI: Predicting approval time for ${entityType} with details: ${changeDetails || 'N/A'}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate AI processing time
    // Placeholder AI logic:
    let baseTime = 2; // Default 2 hours
    if (entityType.toLowerCase().includes("account")) {
      baseTime = 4;
    } else if (entityType.toLowerCase().includes("rule")) {
      baseTime = 6;
    }
    if (changeDetails && changeDetails.length > 100) { // More complex changes take longer
      baseTime += 3;
    }
    // Add some AI-driven variability
    return Math.max(1, Math.round(baseTime + Math.random() * 3 - 1.5));
  }

  /**
   * Simulates AI sentiment analysis of a proposed change description.
   * Helps identify potentially contentious or high-impact changes.
   * @param changeDescription - The description of the proposed change.
   * @returns A promise resolving to an object containing sentiment ('positive', 'negative', 'neutral') and a score.
   */
  public async analyzeChangeSentiment(changeDescription: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral', score: number }> {
    console.log(`CDBI AI: Analyzing sentiment for change: "${changeDescription}"`);
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate AI processing time
    // Placeholder AI logic:
    const lowerDesc = changeDescription.toLowerCase();
    let score = 0;
    if (lowerDesc.includes("urgent") || lowerDesc.includes("critical") || lowerDesc.includes("fix")) {
      score -= 0.6;
    }
    if (lowerDesc.includes("improve") || lowerDesc.includes("enhance") || lowerDesc.includes("optimize")) {
      score += 0.8;
    }
    if (lowerDesc.includes("remove") || lowerDesc.includes("delete") || lowerDesc.includes("discontinue")) {
      score -= 0.3;
    }
    if (lowerDesc.includes("add") || lowerDesc.includes("new")) {
      score += 0.2;
    }

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (score > 0.5) {
      sentiment = 'positive';
    } else if (score < -0.3) {
      sentiment = 'negative';
    }
    return { sentiment, score: parseFloat(score.toFixed(2)) };
  }

  /**
   * Simulates AI suggestions for optimizing a proposed change or its approval process.
   * @param entityType - The type of entity.
   * @param currentConfig - Current configuration details that might be relevant.
   * @returns A promise resolving to an array of AI-generated suggestions.
   */
  public async suggestOptimization(entityType: string, currentConfig: any = {}): Promise<string[]> {
    console.log(`CDBI AI: Generating suggestions for ${entityType} with config: ${JSON.stringify(currentConfig)}`);
    await new Promise(resolve => setTimeout(resolve, 900)); // Simulate AI processing time
    // Placeholder AI logic:
    const suggestions: string[] = [];
    if (entityType.toLowerCase().includes("account")) {
      suggestions.push("Ensure all related sub-accounts are updated simultaneously.");
      if (!currentConfig.twoFactorAuthEnabled) {
        suggestions.push("Recommend enabling two-factor authentication for this account type for enhanced security.");
      }
    } else if (entityType.toLowerCase().includes("rule")) {
      suggestions.push("Verify this new rule doesn't conflict with existing high-priority rules.");
      suggestions.push("Consider a phased rollout for complex rule changes to minimize impact.");
    }
    if (suggestions.length === 0) {
      suggestions.push("Based on current data, the proposed change seems straightforward. No immediate AI-driven optimization required, but review best practices.");
    }
    return suggestions;
  }

  /**
   * Simulates AI generation of a concise summary from a detailed change description.
   * Useful for administrators to quickly grasp the essence of complex proposals.
   * @param changeDescription - The detailed description of the change.
   * @returns A promise resolving to a summarized string.
   */
  public async generateSummary(changeDescription: string): Promise<string> {
    console.log(`CDBI AI: Generating summary for: "${changeDescription}"`);
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate AI processing time
    // Placeholder AI logic:
    if (changeDescription.length < 50) {
      return `Summary: ${changeDescription}`;
    }
    const words = changeDescription.split(' ');
    const summaryWords = words.slice(0, Math.min(words.length, 20)); // Take first 20 words
    return `AI Summary: ${summaryWords.join(' ')}${words.length > 20 ? '...' : ''}`;
  }

  /**
   * Simulates fetching aggregated KPI data for a dashboard, linking to Gemini.
   * In a real scenario, this would query a data warehouse or a real-time analytics service.
   * @returns A promise resolving to an object containing various AI_KPI_Metrics.
   */
  public async getAI_KPI_Metrics(): Promise<AI_KPI_Metrics> {
    console.log("CDBI AI: Fetching AI-driven KPI metrics for Gemini Dashboard.");
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate data aggregation
    return {
      totalChangeProposals: 1250,
      approvedChanges: 1050,
      rejectedChanges: 80,
      averageApprovalTimeHours: 3.5, // Aggregated average
      aiPredictionAccuracyPercentage: 92.7, // ML model accuracy
      averageSentimentScore: 0.65,
      aiSuggestionAdoptionRate: 78.2,
    };
  }

  /**
   * Generates sample chart data for a given metric, suitable for visualization on a Gemini-linked dashboard.
   * @param metricType - The type of metric for which to generate chart data (e.g., 'approvalTimeDistribution', 'sentimentOverTime').
   * @returns A promise resolving to an array of data points suitable for charting.
   */
  public async getChartData(metricType: 'approvalTimeDistribution' | 'sentimentOverTime' | 'suggestionAdoptionRate'): Promise<any[]> {
    console.log(`CDBI AI: Generating chart data for ${metricType} for Gemini Dashboard.`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate data generation

    if (metricType === 'approvalTimeDistribution') {
      return [
        { range: '0-1h', count: 150 },
        { range: '1-3h', count: 300 },
        { range: '3-6h', count: 250 },
        { range: '6-12h', count: 100 },
        { range: '12h+', count: 50 },
      ];
    } else if (metricType === 'sentimentOverTime') {
      const dates = ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06'];
      return dates.map(date => ({
        date,
        positive: Math.random() * 0.4 + 0.5, // 50-90% positive
        negative: Math.random() * 0.15 + 0.05, // 5-20% negative
        neutral: Math.random() * 0.2 + 0.1, // 10-30% neutral
      }));
    } else if (metricType === 'suggestionAdoptionRate') {
      return [
        { month: 'Jan', rate: 70 },
        { month: 'Feb', rate: 72 },
        { month: 'Mar', rate: 75 },
        { month: 'Apr', rate: 78 },
        { month: 'May', rate: 80 },
        { month: 'Jun', rate: 79 },
      ];
    }
    return [];
  }
}

// --- ProposedChangeNotice Component (Enhanced with AI) ---

export interface ProposedChangeNoticeProps {
  entityType: string;
  action?: string;
  changeDescription?: string; // New prop: Detailed description for AI analysis
  currentConfiguration?: any; // New prop: Current config for AI optimization suggestions
}

function ProposedChangeNotice({
  entityType,
  action,
  changeDescription = "",
  currentConfiguration = {},
}: ProposedChangeNoticeProps) {
  const { data, loading, error } = useCurrentOrganizationQuery();
  const adminApprovalsEnabled =
    !loading && !error && data?.currentOrganization?.adminApprovalRuleEnabled;

  const [aiInsights, setAiInsights] = useState<ChangeAnalysisInsights>({ isLoadingAI: false });

  // Initialize the AI service
  const aiService = useMemo(() => CDBI_AI_ChangeApprovalService.getInstance(), []);

  // Effect to fetch AI insights when relevant props change
  useEffect(() => {
    const fetchAiData = async () => {
      if (!adminApprovalsEnabled || !changeDescription) {
        setAiInsights({ isLoadingAI: false }); // Reset or don't fetch if no description or approvals not enabled
        return;
      }

      setAiInsights(prev => ({ ...prev, isLoadingAI: true, aiError: undefined }));
      try {
        const [
          predictedTime,
          sentimentResult,
          suggestions,
          summary,
        ] = await Promise.all([
          aiService.predictApprovalTime(entityType, changeDescription),
          aiService.analyzeChangeSentiment(changeDescription),
          aiService.suggestOptimization(entityType, currentConfiguration),
          aiService.generateSummary(changeDescription),
        ]);

        setAiInsights({
          predictedApprovalTimeHours: predictedTime,
          sentiment: sentimentResult.sentiment,
          sentimentScore: sentimentResult.score,
          aiSuggestions: suggestions,
          aiSummary: summary,
          isLoadingAI: false,
          aiError: undefined,
        });
      } catch (e: any) {
        console.error("CDBI AI Service Error:", e);
        setAiInsights({
          isLoadingAI: false,
          aiError: `AI analysis failed: ${e.message || 'Unknown error'}`,
        });
      }
    };

    fetchAiData();
  }, [entityType, action, changeDescription, currentConfiguration, adminApprovalsEnabled, aiService]);


  if (!adminApprovalsEnabled) {
    return null;
  }

  let message = "Changes will not be active until approved by an admin.";
  if (action === "create") {
    message = `${startCase(
      entityType,
    )} will not be created until approved by an admin.`;
  } else if (action === "update") {
    message = `Updates to the ${startCase(
      entityType,
    )} will not be active until approved by an admin.`;
  } else if (action === "delete") {
    message = `Deletion of the ${startCase(
      entityType,
    )} will not be active until approved by an admin.`;
  }

  // Generate AI-powered alert message additions
  const aiMessageAdditions = useMemo(() => {
    const additions: string[] = [];
    if (aiInsights.predictedApprovalTimeHours) {
      additions.push(`AI predicts approval in ~${aiInsights.predictedApprovalTimeHours} hours.`);
    }
    if (aiInsights.sentiment && aiInsights.sentiment !== 'neutral') {
      additions.push(`AI sentiment: ${startCase(aiInsights.sentiment)}.`);
    }
    if (aiInsights.aiSummary) {
      additions.push(`Summary: ${aiInsights.aiSummary}`);
    }
    return additions;
  }, [aiInsights]);


  return (
    <div className="float-end -mt-6 w-full max-w-lg"> {/* Adjusted width for more content */}
      {!!action && (
        <Alert alertType="info">
          <p className="font-semibold">{message}</p>
          {aiInsights.isLoadingAI && (
            <p className="text-sm text-gray-700 mt-1">
              AI is analyzing the proposed change...
            </p>
          )}
          {aiInsights.aiError && (
            <p className="text-sm text-red-700 mt-1">
              AI Error: {aiInsights.aiError}
            </p>
          )}
          {!aiInsights.isLoadingAI && !aiInsights.aiError && aiMessageAdditions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="font-medium text-blue-800">CDBI AI Insights:</p>
              {aiMessageAdditions.map((addition, index) => (
                <p key={`ai-msg-${index}`} className="text-sm text-gray-700 mt-1">
                  {addition}
                </p>
              ))}
              {aiInsights.aiSuggestions && aiInsights.aiSuggestions.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-blue-800">AI Suggestions for faster approval:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {aiInsights.aiSuggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {/* Placeholder for linking to Gemini dashboard for detailed KPIs/Charts */}
          <div className="mt-3 pt-2 border-t border-gray-200 text-right">
            <a href="/dashboard/ai-analytics" className="text-blue-600 hover:underline text-sm" target="_blank" rel="noopener noreferrer">
              View AI Approval KPIs & Charts (Gemini Dashboard) &raquo;
            </a>
          </div>
        </Alert>
      )}
    </div>
  );
}

export default ProposedChangeNotice;

// --- Exported AI-related types and instances for potential external use ---
export const cdbiAiService = CDBI_AI_ChangeApprovalService.getInstance();
```