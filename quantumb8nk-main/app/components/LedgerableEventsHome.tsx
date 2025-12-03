// Copyright James Burvel Oâ€™Callaghan III
// President cdbi AI Innovations Corp.

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { LedgerableEventsHomeDocument } from "../../generated/dashboard/graphqlSchema";
import { LEDGERABLE_EVENT } from "../../generated/dashboard/types/resources";
import ListView from "./ListView";
import LedgerableEventsEmptyState from "../containers/LedgerableEventsEmptyState";

interface LedgerableEventsHomeProps {
  ledgerId: string;
}

const CONSTANT_QUERY_PARAMS = ["tab"];

/**
 * Mocking a robust cdbi AI Gemini Service interaction.
 * In a real-world scenario, this would be an actual API call
 * to a Gemini-powered backend service that processes ledger data.
 * This mock simulates the asynchronous nature and potential data structures.
 */
export const cdbiAIGeminiService = {
  /**
   * Simulates fetching predictive analytics for ledger event volumes.
   * @param ledgerId The ID of the ledger to analyze.
   * @param timeframe The prediction timeframe (e.g., 'daily', 'weekly').
   * @returns A promise resolving to an AI prediction result.
   */
  getPredictiveEventVolume: async (
    ledgerId: string,
    timeframe: "daily" | "weekly"
  ) => {
    console.log(
      `cdbi AI Gemini Service: Requesting predictive event volume for ledger ${ledgerId} (${timeframe})...`
    );
    return new Promise((resolve) => {
      setTimeout(() => {
        const baseVolume = Math.floor(Math.random() * 500) + 1000;
        const confidence = (Math.random() * 0.2 + 0.7).toFixed(2); // 70-90%
        const trend = Math.random() > 0.5 ? "increasing" : "decreasing";
        resolve({
          predictedVolume: baseVolume + (trend === "increasing" ? 100 : -50),
          predictionConfidence: parseFloat(confidence),
          trend: trend,
          unit: timeframe === "daily" ? "events/day" : "events/week",
          timestamp: new Date().toISOString(),
          geminiModel: "cdbi-gemini-volume-predictor-v1.2",
          explanation: `Based on historical patterns and current market indicators, ${timeframe} ledger event volume is predicted to be ${
            trend === "increasing" ? "higher" : "lower"
          }.`,
        });
      }, 1500); // Simulate network delay
    });
  },

  /**
   * Simulates fetching anomaly detection results for ledger event values.
   * @param ledgerId The ID of the ledger to analyze.
   * @param threshold Optional, sensitivity threshold for anomaly detection.
   * @returns A promise resolving to an AI anomaly detection result.
   */
  getAnomalyDetection: async (ledgerId: string, threshold?: number) => {
    console.log(
      `cdbi AI Gemini Service: Requesting anomaly detection for ledger ${ledgerId} (threshold: ${
        threshold || "default"
      })...`
    );
    return new Promise((resolve) => {
      setTimeout(() => {
        const numAnomalies = Math.floor(Math.random() * 5);
        const anomalies = Array.from({ length: numAnomalies }).map((_, i) => ({
          eventId: `evt_${Math.random().toString(36).substring(2, 10)}`,
          eventAmount: parseFloat((Math.random() * 1000000).toFixed(2)),
          severity: Math.random() > 0.8 ? "critical" : "high",
          detectedAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // last 7 days
          reason: `Unusual deviation from established transaction value patterns.`,
        }));
        resolve({
          anomaliesDetected: numAnomalies,
          averageSeverityIndex: numAnomalies
            ? parseFloat(
                (
                  anomalies.reduce(
                    (sum, a) =>
                      sum + (a.severity === "critical" ? 3 : 2),
                    0
                  ) / numAnomalies
                ).toFixed(2)
              )
            : 0,
          anomalies: anomalies,
          detectionModel: "cdbi-gemini-anomaly-detector-v2.1",
          recommendation: numAnomalies > 0 ? "Review flagged events for potential fraud or error." : "No significant anomalies detected in recent events.",
        });
      }, 2000);
    });
  },

  /**
   * Simulates fetching intelligent summarization and categorization of events.
   * @param ledgerId The ID of the ledger to analyze.
   * @returns A promise resolving to an AI summarization result.
   */
  getEventSummarizationAndCategorization: async (ledgerId: string) => {
    console.log(
      `cdbi AI Gemini Service: Requesting event summarization for ledger ${ledgerId}...`
    );
    return new Promise((resolve) => {
      setTimeout(() => {
        const categories = ["Payment_Processing", "Invoice_Settlement", "Refund_Initiation", "Fee_Collection", "Dispute_Resolution"];
        const numCategories = Math.floor(Math.random() * 3) + 2; // 2 to 4 categories
        const topCategories = Array.from({ length: numCategories }).map(() => ({
          name: categories[Math.floor(Math.random() * categories.length)],
          count: Math.floor(Math.random() * 200) + 50,
        }));

        const summaryText = `The ledger for ID ${ledgerId} primarily shows a high volume of ${topCategories[0]?.name || 'various'} events, followed by ${topCategories[1]?.name || 'other'} activities. This indicates a focus on transactional throughput with some operational adjustments.`;

        resolve({
          summary: summaryText,
          topCategories: topCategories,
          categorizationScore: parseFloat((Math.random() * 0.1 + 0.85).toFixed(2)), // 85-95%
          geminiModel: "cdbi-gemini-event-nlp-v3.0",
          insights: [
            "High frequency in core transaction types.",
            "Potential for automation in recurring categories.",
            "Monitor outlier categories for process inefficiencies."
          ]
        });
      }, 1800);
    });
  },
};

/**
 * Renders a placeholder for a chart to represent AI-driven data visualization.
 * In a real application, this would integrate with a charting library (e.g., Chart.js, Recharts).
 */
export const AIChartPlaceholder: React.FC<{
  title: string;
  description: string;
  dataInterpretation: string;
  chartType?: "line" | "bar" | "pie";
}> = ({ title, description, dataInterpretation, chartType = "line" }) => (
  <div className="bg-gradient-to-br from-cdbi-ai-primary to-cdbi-ai-secondary p-4 rounded-lg shadow-xl text-white h-full flex flex-col justify-between">
    <div>
      <h3 className="text-xl font-semibold mb-2 text-cdbi-yellow">{title}</h3>
      <p className="text-sm text-cdbi-light-grey mb-3">{description}</p>
      <div className="bg-cdbi-dark-grey p-3 rounded-md mb-3 h-24 flex items-center justify-center text-center text-cdbi-light-grey text-xs italic">
        {/* Simulate a dynamic chart based on type */}
        {chartType === "line" && (
          <div className="w-full h-full bg-stripes-gradient animate-pulse flex items-center justify-center">
            <span className="opacity-70">AI Line Chart Placeholder</span>
          </div>
        )}
        {chartType === "bar" && (
          <div className="w-full h-full bg-stripes-gradient-vertical animate-pulse flex items-center justify-center">
            <span className="opacity-70">AI Bar Chart Placeholder</span>
          </div>
        )}
        {chartType === "pie" && (
          <div className="w-full h-full bg-stripes-gradient-radial animate-pulse flex items-center justify-center">
            <span className="opacity-70">AI Pie Chart Placeholder</span>
          </div>
        )}
      </div>
    </div>
    <div className="mt-auto">
      <h4 className="text-md font-medium text-cdbi-yellow">Gemini Interpretation:</h4>
      <p className="text-xs text-cdbi-light-grey leading-tight mt-1">{dataInterpretation}</p>
    </div>
  </div>
);

/**
 * Displays key performance indicators (KPIs) related to AI insights.
 */
export const AIInsightCard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  description: string;
  sentiment?: "positive" | "negative" | "neutral";
  trend?: "up" | "down" | "flat";
}> = ({ title, value, unit, description, sentiment, trend }) => {
  const textColorClass = useMemo(() => {
    switch (sentiment) {
      case "positive":
        return "text-green-400";
      case "negative":
        return "text-red-400";
      default:
        return "text-cdbi-yellow";
    }
  }, [sentiment]);

  const trendIcon = useMemo(() => {
    switch (trend) {
      case "up":
        return <span className="ml-1 text-green-300">&#9650;</span>; // Up arrow
      case "down":
        return <span className="ml-1 text-red-300">&#9660;</span>; // Down arrow
      case "flat":
        return <span className="ml-1 text-cdbi-light-grey">&#8212;</span>; // Dash
      default:
        return null;
    }
  }, [trend]);

  return (
    <div className="bg-cdbi-dark-blue p-4 rounded-lg shadow-md flex flex-col justify-between h-full">
      <h3 className="text-md font-medium text-cdbi-light-grey mb-2 leading-tight">
        {title}
      </h3>
      <div className="flex items-baseline mb-2">
        <p className={`text-3xl font-bold ${textColorClass}`}>
          {value}
          {unit && <span className="ml-1 text-xl font-normal text-cdbi-light-grey">{unit}</span>}
        </p>
        {trendIcon}
      </div>
      <p className="text-xs text-cdbi-light-grey opacity-80 leading-snug mt-auto">{description}</p>
    </div>
  );
};

export default function LedgerableEventsHome({
  ledgerId,
}: LedgerableEventsHomeProps) {
  // State for AI-powered insights
  const [predictiveVolume, setPredictiveVolume] = useState<any>(null);
  const [anomalyDetection, setAnomalyDetection] = useState<any>(null);
  const [eventSummarization, setEventSummarization] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAIInsights = useCallback(async () => {
    setLoadingAI(true);
    setAiError(null);
    try {
      // Fetch all AI insights in parallel for efficiency
      const [volume, anomalies, summarization] = await Promise.all([
        cdbiAIGeminiService.getPredictiveEventVolume(ledgerId, "daily"),
        cdbiAIGeminiService.getAnomalyDetection(ledgerId),
        cdbiAIGeminiService.getEventSummarizationAndCategorization(ledgerId),
      ]);
      setPredictiveVolume(volume);
      setAnomalyDetection(anomalies);
      setEventSummarization(summarization);
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
      setAiError(
        "Failed to load AI insights. Please check connectivity to cdbi Gemini services."
      );
    } finally {
      setLoadingAI(false);
    }
  }, [ledgerId]);

  useEffect(() => {
    fetchAIInsights();
  }, [fetchAIInsights]);

  // Placeholder styles for new AI-driven UI
  const AI_SECTION_CLASSES = "bg-cdbi-dark-grey p-6 rounded-xl shadow-lg mb-6";
  const AI_GRID_CLASSES = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

  // Determine global AI sentiment based on combined insights
  const overallAISentiment = useMemo(() => {
    if (loadingAI || aiError) return "neutral";
    let positiveScore = 0;
    let negativeScore = 0;

    if (predictiveVolume) {
      if (predictiveVolume.trend === "increasing") positiveScore++;
      else if (predictiveVolume.trend === "decreasing") negativeScore++;
    }
    if (anomalyDetection) {
      if (anomalyDetection.anomaliesDetected > 0) negativeScore += anomalyDetection.anomaliesDetected;
    }
    if (eventSummarization) {
      if (eventSummarization.categorizationScore > 0.9) positiveScore++; // High score implies good data
    }

    if (positiveScore > negativeScore) return "positive";
    if (negativeScore > positiveScore) return "negative";
    return "neutral";
  }, [loadingAI, aiError, predictiveVolume, anomalyDetection, eventSummarization]);

  const overallAISentimentMessage = useMemo(() => {
    switch(overallAISentiment) {
      case "positive": return "The ledger data indicates a healthy trend with efficient categorization.";
      case "negative": return "Attention required: Potential issues or anomalies detected in recent ledger activity.";
      default: return "Current ledger activity appears stable, no critical issues identified by AI.";
    }
  }, [overallAISentiment]);

  // Dynamic Tailwind-like classes for brand colors (assuming these are defined in a global CSS or Tailwind config)
  // cdbi-ai-primary, cdbi-ai-secondary, cdbi-dark-blue, cdbi-dark-grey, cdbi-light-grey, cdbi-yellow
  return (
    <div className="p-6 bg-cdbi-bg-gradient min-h-screen text-cdbi-light-grey">
      <h1 className="text-4xl font-extrabold text-cdbi-yellow mb-2 text-center md:text-left">
        cdbi Ledgerable Events Dashboard
      </h1>
      <p className="text-lg text-cdbi-light-grey mb-8 text-center md:text-left">
        Empowering users with AI-driven insights for ledger ID:{" "}
        <span className="font-mono bg-cdbi-dark-blue px-2 py-1 rounded-md text-cdbi-yellow-light">
          {ledgerId}
        </span>
      </p>

      {/* Global AI Status/Summary */}
      <div className={`p-4 rounded-lg mb-8 shadow-xl ${
        overallAISentiment === "positive" ? "bg-gradient-to-r from-green-700 to-green-900" :
        overallAISentiment === "negative" ? "bg-gradient-to-r from-red-700 to-red-900" :
        "bg-gradient-to-r from-cdbi-ai-primary to-cdbi-ai-secondary"
      } text-white`}>
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            {overallAISentiment === "positive" && <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />}
            {overallAISentiment === "negative" && <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />}
            {overallAISentiment === "neutral" && <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a1 1 0 00-1 1v3a1 1 0 002 0V5a1 1 0 00-1-1zm0 8a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />}
          </svg>
          Overall AI Sentiment:{" "}
          <span className={`ml-2 ${
            overallAISentiment === "positive" ? "text-green-200" :
            overallAISentiment === "negative" ? "text-red-200" :
            "text-cdbi-yellow-light"
          }`}>
            {overallAISentiment.toUpperCase()}
          </span>
        </h2>
        <p className="text-md text-cdbi-light-grey-light mt-1">{overallAISentimentMessage}</p>
      </div>


      {/* AI Insights Section */}
      <section className={AI_SECTION_CLASSES}>
        <h2 className="text-3xl font-bold text-cdbi-yellow mb-6">
          AI-Powered Ledger Insights (Gemini)
        </h2>

        {loadingAI && (
          <div className="text-center py-8 text-cdbi-light-grey text-lg">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-cdbi-yellow-light h-12 w-12 mb-4 mx-auto animate-spin"></div>
            Loading advanced cdbi AI insights...
          </div>
        )}

        {aiError && (
          <div className="bg-red-800 text-white p-4 rounded-md text-center">
            Error: {aiError}
            <button
              onClick={fetchAIInsights}
              className="ml-4 px-4 py-2 bg-cdbi-yellow text-cdbi-dark-blue rounded-md hover:bg-cdbi-yellow-light transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loadingAI && !aiError && (
          <>
            {/* Predictive Event Volume Analysis */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-cdbi-yellow-light mb-4">
                1. Predictive Event Volume Analysis
              </h3>
              <div className={AI_GRID_CLASSES}>
                <AIInsightCard
                  title="Predicted Daily Event Volume"
                  value={predictiveVolume?.predictedVolume || "N/A"}
                  unit={predictiveVolume?.unit || "events"}
                  description={`AI predicts the volume of ledgerable events for the upcoming period based on historical data.`}
                  sentiment={predictiveVolume?.trend === "increasing" ? "positive" : predictiveVolume?.trend === "decreasing" ? "negative" : "neutral"}
                  trend={predictiveVolume?.trend === "increasing" ? "up" : predictiveVolume?.trend === "decreasing" ? "down" : "flat"}
                />
                <AIInsightCard
                  title="Prediction Confidence Score"
                  value={`${(predictiveVolume?.predictionConfidence * 100).toFixed(1) || "N/A"}%`}
                  description="Confidence level of the Gemini model's prediction, indicating reliability."
                  sentiment={predictiveVolume?.predictionConfidence > 0.8 ? "positive" : "neutral"}
                />
                <AIChartPlaceholder
                  title="Event Volume Forecast"
                  description="Visualize the predicted trend of ledgerable events over time."
                  dataInterpretation={predictiveVolume?.explanation || "No interpretation available."}
                  chartType="line"
                />
              </div>
            </div>

            {/* Anomaly Detection for Event Values */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-cdbi-yellow-light mb-4">
                2. Real-time Anomaly Detection
              </h3>
              <div className={AI_GRID_CLASSES}>
                <AIInsightCard
                  title="Anomalies Detected (Last 7 Days)"
                  value={anomalyDetection?.anomaliesDetected || 0}
                  unit="events"
                  description="Number of unusual ledger events flagged by AI, potentially indicating errors or suspicious activity."
                  sentiment={anomalyDetection?.anomaliesDetected > 0 ? "negative" : "positive"}
                />
                <AIInsightCard
                  title="Average Anomaly Severity Index"
                  value={anomalyDetection?.averageSeverityIndex || 0}
                  description="An aggregated score reflecting the impact of detected anomalies."
                  sentiment={anomalyDetection?.averageSeverityIndex > 0 ? "negative" : "positive"}
                />
                 <AIChartPlaceholder
                  title="Anomaly Scatter Plot"
                  description="Highlights individual events that deviate significantly from normal patterns."
                  dataInterpretation={anomalyDetection?.recommendation || "No interpretation available."}
                  chartType="bar"
                />
              </div>
              {anomalyDetection?.anomaliesDetected > 0 && (
                <div className="mt-6 bg-cdbi-dark-blue p-4 rounded-lg shadow-inner">
                  <h4 className="text-xl font-medium text-red-300 mb-3">
                    Detected Anomalies:
                  </h4>
                  <ul className="list-disc list-inside text-cdbi-light-grey">
                    {anomalyDetection.anomalies.map((anomaly: any, index: number) => (
                      <li key={anomaly.eventId} className="mb-1">
                        <span className={`font-semibold ${anomaly.severity === "critical" ? "text-red-400" : "text-orange-300"}`}>
                          [{anomaly.severity.toUpperCase()}]
                        </span> Event ID: <span className="font-mono text-cdbi-yellow-light">{anomaly.eventId}</span>, Amount: <span className="font-mono text-cdbi-yellow-light">${anomaly.eventAmount.toLocaleString()}</span>, Detected: {new Date(anomaly.detectedAt).toLocaleString()} - {anomaly.reason}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm italic text-cdbi-yellow mt-4">Recommendation from Gemini: {anomalyDetection.recommendation}</p>
                </div>
              )}
            </div>

            {/* Intelligent Event Summarization & Categorization */}
            <div>
              <h3 className="text-2xl font-semibold text-cdbi-yellow-light mb-4">
                3. Intelligent Event Summarization & Categorization
              </h3>
              <div className={AI_GRID_CLASSES}>
                <AIInsightCard
                  title="Top Event Category"
                  value={eventSummarization?.topCategories[0]?.name || "N/A"}
                  unit={`(${eventSummarization?.topCategories[0]?.count || 0} events)`}
                  description="The most dominant category of ledgerable events identified by AI."
                />
                <AIInsightCard
                  title="Categorization Effectiveness Score"
                  value={`${(eventSummarization?.categorizationScore * 100).toFixed(1) || "N/A"}%`}
                  description="AI's confidence in accurately categorizing all ledger events."
                  sentiment={eventSummarization?.categorizationScore > 0.9 ? "positive" : "neutral"}
                />
                <AIChartPlaceholder
                  title="Event Category Distribution"
                  description="A breakdown of event types, helping understand operational focus."
                  dataInterpretation={eventSummarization?.summary || "No interpretation available."}
                  chartType="pie"
                />
              </div>
              {eventSummarization?.topCategories && eventSummarization.topCategories.length > 0 && (
                 <div className="mt-6 bg-cdbi-dark-blue p-4 rounded-lg shadow-inner">
                 <h4 className="text-xl font-medium text-cdbi-yellow mb-3">
                   Detailed Categories:
                 </h4>
                 <ul className="list-disc list-inside text-cdbi-light-grey">
                   {eventSummarization.topCategories.map((cat: any, index: number) => (
                     <li key={index} className="mb-1">
                       <span className="font-semibold text-cdbi-yellow-light">{cat.name}</span>: {cat.count} events
                     </li>
                   ))}
                 </ul>
                 <p className="text-sm italic text-cdbi-yellow mt-4">Gemini Summary: {eventSummarization.summary}</p>
                 <div className="mt-2">
                    <h5 className="font-medium text-cdbi-yellow-light">Key AI Insights:</h5>
                    <ul className="list-disc list-inside ml-4 text-cdbi-light-grey text-sm">
                      {eventSummarization.insights.map((insight: string, idx: number) => (
                        <li key={idx}>{insight}</li>
                      ))}
                    </ul>
                 </div>
               </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Original ListView component below AI insights */}
      <section className="mt-10">
        <h2 className="text-3xl font-bold text-cdbi-yellow mb-6">
          Raw Ledgerable Events Data
        </h2>
        <ListView
          resource={LEDGERABLE_EVENT}
          graphqlDocument={LedgerableEventsHomeDocument}
          constantQueryVariables={{
            ledgerId,
          }}
          customizableColumns={false}
          constantQueryParams={CONSTANT_QUERY_PARAMS}
          ListViewEmptyState={
            <div className="flex justify-center px-6 py-16 bg-cdbi-dark-blue rounded-lg shadow-md">
              <LedgerableEventsEmptyState />
            </div>
          }
        />
      </section>
    </div>
  );
}

// Global styles for cdbi branding and background (assuming a global CSS or Tailwind config)
// These would ideally be in a global stylesheet or a Tailwind JIT configuration.
// For self-contained file, defining them here as pseudo-CSS comments:

/*
@layer base {
  body {
    @apply bg-cdbi-bg-gradient;
    font-family: 'Inter', sans-serif; // Or any preferred font
  }
}

@layer utilities {
  .bg-cdbi-bg-gradient {
    background: linear-gradient(135deg, #0f172a 0%, #172554 100%); // Deep blue/dark gradient
  }
  .text-cdbi-yellow {
    color: #facc15; // Tailwind yellow-400
  }
  .text-cdbi-yellow-light {
    color: #fde047; // Tailwind yellow-300
  }
  .text-cdbi-light-grey {
    color: #e2e8f0; // Tailwind slate-200
  }
  .text-cdbi-light-grey-light {
    color: #f8fafc; // Tailwind slate-50
  }
  .bg-cdbi-dark-blue {
    background-color: #1e293b; // Tailwind slate-800
  }
  .bg-cdbi-dark-grey {
    background-color: #334155; // Tailwind slate-700
  }
  .from-cdbi-ai-primary {
    --tw-gradient-from: #1e3a8a; // Blue-800
    --tw-gradient-to: #1e3a8a00;
  }
  .to-cdbi-ai-secondary {
    --tw-gradient-to: #3b82f6; // Blue-500
  }
  .bg-stripes-gradient {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 20px 20px;
  }
  .bg-stripes-gradient-vertical {
    background-image: linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 20px 20px;
  }
  .bg-stripes-gradient-radial {
    background-image: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 20px 20px;
  }
}
*/