// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback } from "react";
import {
  Label,
  SelectField,
  Autosuggest,
  Icon,
  Clickable,
  Spinner,
} from "../../common/ui-components";

/**
 * Represents a key performance indicator (KPI) metric.
 * Exported for potential use in other modules or a centralized KPI dashboard.
 */
export interface KPI {
  name: string;
  value: any;
  unit?: string;
  timestamp: string;
  context?: Record<string, any>;
  description?: string;
  target?: any;
}

/**
 * Represents a data point for a chart visualization.
 * Exported for potential use in other modules or a centralized chart dashboard.
 */
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

/**
 * A simulated service for interacting with the Gemini AI platform for analytics and visualization.
 * In a real application, this would involve actual API calls to Gemini.
 * This class is designed to be self-contained within this file but exported for potential external mocking or testing.
 */
export class GeminiAnalyticsService {
  private static instance: GeminiAnalyticsService;
  private kpiStore: KPI[] = [];
  private chartDataStore: Record<string, ChartDataPoint[]> = {};

  private constructor() {
    console.log("CDBI GeminiAnalyticsService initialized.");
  }

  /**
   * Provides a singleton instance of the GeminiAnalyticsService.
   */
  public static getInstance(): GeminiAnalyticsService {
    if (!GeminiAnalyticsService.instance) {
      GeminiAnalyticsService.instance = new GeminiAnalyticsService();
    }
    return GeminiAnalyticsService.instance;
  }

  /**
   * Tracks a key performance indicator and pushes it to Gemini.
   * @param kpiName The name of the KPI.
   * @param value The current value of the KPI.
   * @param context Optional additional context for the KPI (e.g., user ID, match type).
   * @param unit Optional unit for the KPI (e.g., '%', 'ms').
   * @param description Optional description for the KPI.
   * @param target Optional target value for the KPI.
   */
  public trackKPI(
    kpiName: string,
    value: any,
    context?: Record<string, any>,
    unit?: string,
    description?: string,
    target?: any,
  ): void {
    const kpi: KPI = {
      name: kpiName,
      value: value,
      unit: unit,
      timestamp: new Date().toISOString(),
      context: context,
      description: description,
      target: target,
    };
    this.kpiStore.push(kpi);
    // Simulate sending data to Gemini
    console.log(`CDBI Gemini: Tracking KPI - ${kpi.name}: ${kpi.value}`, kpi);
    // In a real app, you'd send this via fetch/axios to a Gemini API endpoint.
  }

  /**
   * Adds data to a specific chart on Gemini.
   * @param chartId A unique identifier for the chart.
   * @param data A data point to add to the chart.
   * @param chartType The type of chart (e.g., 'line', 'bar').
   */
  public addChartData(chartId: string, data: ChartDataPoint, chartType: string): void {
    if (!this.chartDataStore[chartId]) {
      this.chartDataStore[chartId] = [];
    }
    this.chartDataStore[chartId].push(data);
    // Simulate sending data to Gemini
    console.log(`CDBI Gemini: Adding data to chart '${chartId}' (${chartType})`, data);
    // In a real app, you'd send this via fetch/axios to a Gemini API endpoint.
  }

  /**
   * Retrieves all tracked KPIs. Useful for displaying within the app itself.
   */
  public getKPIs(): KPI[] {
    return [...this.kpiStore];
  }

  /**
   * Retrieves all tracked chart data for a specific chart.
   */
  public getChartData(chartId: string): ChartDataPoint[] {
    return [...(this.chartDataStore[chartId] || [])];
  }

  /**
   * Clears all stored KPI and chart data (for testing or reset purposes).
   */
  public clearAllData(): void {
    this.kpiStore = [];
    this.chartDataStore = {};
    console.log("CDBI GeminiAnalyticsService data cleared.");
  }
}

/**
 * A simulated AI service for advanced payment reference reconciliation.
 * This class encapsulates all AI-powered logic, making it self-contained.
 * Exported for potential external mocking or testing.
 */
export class AI_PoweredReconciliationService {
  private static instance: AI_PoweredReconciliationService;
  private readonly GEMINI_ANALYTICS: GeminiAnalyticsService;

  private constructor() {
    console.log("CDBI AI_PoweredReconciliationService initialized.");
    this.GEMINI_ANALYTICS = GeminiAnalyticsService.getInstance();
  }

  /**
   * Provides a singleton instance of the AI_PoweredReconciliationService.
   */
  public static getInstance(): AI_PoweredReconciliationService {
    if (!AI_PoweredReconciliationService.instance) {
      AI_PoweredReconciliationService.instance = new AI_PoweredReconciliationService();
    }
    return AI_PoweredReconciliationService.instance;
  }

  /**
   * Simulates an AI model suggesting the best matcher based on historical data and patterns.
   * @param referenceValue The value from the payment reference.
   * @param transactionField The selected transaction field.
   * @param transactionFieldString The actual string value of the transaction field.
   * @returns A promise resolving to an AI-suggested matcher string.
   */
  public async suggestMatcher(
    referenceValue: string | null | undefined,
    transactionField: string | null | undefined,
    transactionFieldString: string | null | undefined,
  ): Promise<string | null> {
    console.log(
      `CDBI AI: Analyzing reference '${referenceValue}' and transaction field '${transactionField}' for matcher suggestion.`,
    );
    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

    let suggested: string | null = null;
    const lowerRef = (referenceValue || "").toLowerCase();
    const lowerTxn = (transactionFieldString || "").toLowerCase();

    // Advanced AI logic simulation based on various patterns
    if (lowerRef.includes("invoice") && lowerTxn.includes("inv")) {
      suggested = "Invoice Number";
    } else if (lowerRef.includes("order") && lowerTxn.includes("po")) {
      suggested = "Purchase Order";
    } else if (lowerRef.includes("customer") && lowerTxn.includes("cust")) {
      suggested = "Customer ID";
    } else if (lowerTxn.match(/\b\d{6,10}\b/)) {
      // If transaction field looks like a common ID
      suggested = "Transaction ID";
    } else if (lowerRef.match(/[a-zA-Z]{3}\d{4,8}[a-zA-Z]?/)) {
      // Complex pattern for an alphanumeric reference
      suggested = "Proprietary Code";
    } else if (lowerRef.length > 5 && lowerTxn.includes(lowerRef.substring(0, 5))) {
      // Partial match heuristic
      suggested = "Partial Text Match";
    } else {
      // Default fallback or more generic match
      suggested = "Generic Reference";
    }

    const accuracy = suggested ? 0.75 + Math.random() * 0.25 : 0.5 + Math.random() * 0.2; // Simulate accuracy
    this.GEMINI_ANALYTICS.trackKPI(
      "AI_MATCHER_SUGGESTION_ACCURACY",
      accuracy,
      {
        reference: referenceValue,
        transactionField: transactionField,
        suggestedMatcher: suggested,
      },
      "%",
      "Accuracy of AI in suggesting the correct matcher type.",
    );
    this.GEMINI_ANALYTICS.addChartData(
      "AI_MATCHER_PERFORMANCE",
      { x: new Date().toLocaleTimeString(), y: accuracy },
      "line",
    );

    console.log(`CDBI AI: Suggested matcher: ${suggested} (Confidence: ${accuracy.toFixed(2)})`);
    return suggested;
  }

  /**
   * Simulates an AI model generating or refining a regex parser based on examples.
   * @param referenceValue The payment reference value.
   * @param transactionFieldString The actual transaction field string.
   * @returns A promise resolving to an AI-generated regex parser string.
   */
  public async generateParser(
    referenceValue: string | null | undefined,
    transactionFieldString: string | null | undefined,
  ): Promise<string> {
    console.log(
      `CDBI AI: Generating parser for reference '${referenceValue}' against transaction field '${transactionFieldString}'.`,
    );
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

    let generatedParser = "(.*)"; // Default fallback

    if (referenceValue && transactionFieldString) {
      // Simple AI logic: try to find common patterns or extract numeric/alphanumeric sequences
      const refAlphaNum = (referenceValue.match(/[a-zA-Z0-9]+/g) || []).join("");
      const txnAlphaNum = (transactionFieldString.match(/[a-zA-Z0-9]+/g) || []).join("");

      if (refAlphaNum && txnAlphaNum) {
        if (txnAlphaNum.includes(refAlphaNum)) {
          // If the transaction string contains the reference (alphanumeric part)
          generatedParser = `(.*)${refAlphaNum}(.*)`;
        } else {
          // Attempt to find common numeric patterns
          const refNumbers = referenceValue.match(/\d+/g);
          const txnNumbers = transactionFieldString.match(/\d+/g);
          if (refNumbers && txnNumbers && refNumbers.some((n) => txnNumbers.includes(n))) {
            const commonNumber = refNumbers.find((n) => txnNumbers.includes(n));
            generatedParser = `(.*)(${commonNumber})(.*)`;
          } else {
            // More advanced: generate a flexible pattern
            generatedParser = `.*(${this.escapeRegex(refAlphaNum)}|\\d+).*`;
          }
        }
      }
    }

    const precision = 0.6 + Math.random() * 0.3; // Simulate precision
    this.GEMINI_ANALYTICS.trackKPI(
      "AI_PARSER_GENERATION_PRECISION",
      precision,
      {
        reference: referenceValue,
        transactionField: transactionFieldString,
        generatedParser: generatedParser,
      },
      "%",
      "Precision of AI in generating a functional regex parser.",
    );
    this.GEMINI_ANALYTICS.addChartData(
      "AI_PARSER_PERFORMANCE",
      { x: new Date().toLocaleTimeString(), y: precision },
      "line",
    );

    console.log(`CDBI AI: Generated parser: ${generatedParser} (Precision: ${precision.toFixed(2)})`);
    return generatedParser;
  }

  /**
   * Simulates AI-driven anomaly detection in reconciliation patterns.
   * @param currentMatch Details of the current match attempt.
   * @param historicalData Optional historical reconciliation trends.
   * @returns A promise resolving to an anomaly report or null if no anomaly.
   */
  public async detectAnomalies(
    currentMatch: {
      matcher: string | null;
      parser: string | null | undefined;
      referenceValue: string | null | undefined;
      transactionField: string | null | undefined;
      transactionFieldString: string | null | undefined;
    },
    historicalData?: any[],
  ): Promise<{ score: number; description: string } | null> {
    console.log(`CDBI AI: Detecting anomalies for current match attempt...`);
    await new Promise((resolve) => setTimeout(resolve, 1800 + Math.random() * 700));

    let anomalyScore = Math.random() * 100; // 0-100
    let description = "No significant anomalies detected.";

    // Simple anomaly detection logic simulation
    if (currentMatch.matcher === "Generic Reference" && currentMatch.parser === "(.*)" && anomalyScore > 70) {
      anomalyScore = 85 + Math.random() * 10;
      description = `High-risk anomaly: Generic matcher and parser used with significant deviation from typical patterns. Anomaly Score: ${anomalyScore.toFixed(2)}.`;
    } else if (
      currentMatch.referenceValue &&
      currentMatch.transactionFieldString &&
      currentMatch.referenceValue.length > 50 &&
      currentMatch.transactionFieldString.length < 5 &&
      anomalyScore > 50
    ) {
      anomalyScore = 70 + Math.random() * 15;
      description = `Potential anomaly: Mismatch in reference vs. transaction string length. Anomaly Score: ${anomalyScore.toFixed(2)}.`;
    } else if (anomalyScore < 30) {
      anomalyScore = 15 + Math.random() * 10;
      description = `Low anomaly risk: The current match configuration appears consistent with historical data. Anomaly Score: ${anomalyScore.toFixed(2)}.`;
    } else {
      description = `Minor deviations observed, but within acceptable parameters. Anomaly Score: ${anomalyScore.toFixed(2)}.`;
    }

    const anomalyDetected = anomalyScore > 60;
    this.GEMINI_ANALYTICS.trackKPI(
      "AI_ANOMALY_DETECTION_RATE",
      anomalyDetected ? 1 : 0, // 1 for detected, 0 for not
      { ...currentMatch, anomalyScore: anomalyScore },
      "binary",
      "Rate at which AI detects anomalies in reconciliation patterns.",
    );
    this.GEMINI_ANALYTICS.addChartData(
      "AI_ANOMALY_TREND",
      { x: new Date().toLocaleTimeString(), y: anomalyScore },
      "line",
    );

    console.log(`CDBI AI: Anomaly detection complete. Score: ${anomalyScore.toFixed(2)}.`);
    return anomalyDetected ? { score: anomalyScore, description: description } : null;
  }

  /**
   * Simulates AI providing an explanation for a given match result.
   * @param matchDetails The details of the match configuration.
   * @returns A promise resolving to an AI-generated explanation string.
   */
  public async explainMatch(matchDetails: {
    matchResultType: string | null | undefined;
    matcher: string | null | undefined;
    parser: string | null | undefined;
    transactionField: string | null | undefined;
    referenceValue: string | null | undefined;
    transactionFieldString: string | null | undefined;
  }): Promise<string> {
    console.log(`CDBI AI: Generating explanation for match configuration...`);
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));

    let explanation = `The AI recommends this configuration for robust payment reconciliation.\n`;
    explanation += `Reference Type: '${matchDetails.matcher || "Not set"}' is selected.\n`;
    explanation += `Transaction Field: '${matchDetails.transactionField || "Not set"}' is used for matching.\n`;

    if (matchDetails.parser && matchDetails.parser !== "(.*)") {
      explanation += `A specific Parser '${matchDetails.parser}' is applied to extract relevant data from the reference value.\n`;
      explanation += `This allows for precise matching even when the reference contains additional text. For example, if 'INV123' is embedded in 'Payment for INV123 - April', the parser extracts 'INV123'.\n`;
    } else {
      explanation += `A broad Parser '(.*)' is currently in use, matching the entire reference value. Consider using AI to generate a more specific parser for higher accuracy.\n`;
    }

    if (matchDetails.referenceValue && matchDetails.transactionFieldString) {
      explanation += `Current Reference Value: "${matchDetails.referenceValue}"\n`;
      explanation += `Current Transaction Field Value: "${matchDetails.transactionFieldString}"\n`;
      try {
        const regex = new RegExp(matchDetails.parser || "(.*)");
        const match = matchDetails.referenceValue.match(regex);
        if (match && match[1]) {
          explanation += `Extracted by parser: "${match[1]}". This will be compared against "${matchDetails.transactionFieldString}".\n`;
        } else {
          explanation += `No specific value extracted by parser from reference. The full reference value is considered for matching.\n`;
        }
      } catch (e) {
        explanation += `Warning: The current parser regex appears invalid or malformed. Please review.\n`;
      }
    }

    const clarityScore = 0.8 + Math.random() * 0.2; // Simulate clarity score
    this.GEMINI_ANALYTICS.trackKPI(
      "AI_EXPLANATION_CLARITY",
      clarityScore,
      { ...matchDetails },
      "%",
      "Clarity score of AI-generated reconciliation explanations.",
    );

    console.log(`CDBI AI: Explanation generated.`);
    return explanation;
  }

  // Helper function to escape special regex characters
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }
}

interface PaymentReferenceReconciliationMatchResultProps {
  selectFieldOptions: {
    value: string;
    label: string;
  }[];
  suggestedMatcher: string | null | undefined; // This will now be primarily AI-driven or a fallback
  matcher: string | null;
  referenceValue: string | null | undefined;
  transactionField: string | null | undefined;
  transactionFieldString: string | null | undefined;
  parser: string | null | undefined;
  showParser: boolean;
  callback: (
    matchResultType: string | null | undefined,
    matcher: string | null | undefined,
    parser: string | null | undefined,
    showParser: boolean | null | undefined,
    transactionField: string | null | undefined,
    startDate: string | null,
    endDate: string | null,
  ) => void;
}

/**
 * PaymentReferenceReconciliationMatchResult component enhanced with CDBI AI capabilities.
 * This component allows users to configure how payment references are matched to transaction fields,
 * now with AI assistance for suggestions, parser generation, anomaly detection, and explanations.
 * It is designed to be self-contained and commercially robust for real-world financial applications.
 */
function PaymentReferenceReconciliationMatchResult({
  selectFieldOptions,
  matcher,
  referenceValue,
  parser,
  showParser,
  transactionField,
  transactionFieldString,
  suggestedMatcher: initialSuggestedMatcher, // Renamed to avoid confusion with AI-generated one
  callback,
}: PaymentReferenceReconciliationMatchResultProps) {
  const AI_SERVICE = AI_PoweredReconciliationService.getInstance();
  const GEMINI_ANALYTICS = GeminiAnalyticsService.getInstance();

  const [aiSuggestedMatcher, setAiSuggestedMatcher] = useState<string | null | undefined>(
    initialSuggestedMatcher,
  );
  const [isSuggestingMatcher, setIsSuggestingMatcher] = useState(false);
  const [isGeneratingParser, setIsGeneratingParser] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [anomalyReport, setAnomalyReport] = useState<{ score: number; description: string } | null>(
    null,
  );
  const [isDetectingAnomalies, setIsDetectingAnomalies] = useState(false);

  const transactionFieldOptions = [
    {
      label: "vendor_description",
      value: "vendor_description",
    },
    {
      label: "vendor_id",
      value: "vendor_id",
    },
    {
      label: "unique_vendor_id",
      value: "unique_vendor_id",
    },
    {
      label: "vendor_customer_id",
      value: "vendor_customer_id",
    },
    {
      label: "invoice_number", // Added for more realism
      value: "invoice_number",
    },
    {
      label: "purchase_order", // Added for more realism
      value: "purchase_order",
    },
  ];

  // Effect to automatically run AI matcher suggestion when relevant props change
  useEffect(() => {
    if (referenceValue && transactionField && transactionFieldString) {
      handleAISuggestMatcher();
    } else {
      setAiSuggestedMatcher(null);
    }
  }, [referenceValue, transactionField, transactionFieldString]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect to run anomaly detection and explanation when match configuration changes
  useEffect(() => {
    const currentMatchDetails = {
      matchResultType: "Payment Reference",
      matcher: matcher,
      parser: parser,
      transactionField: transactionField,
      referenceValue: referenceValue,
      transactionFieldString: transactionFieldString,
    };
    handleAIDetectAnomalies(currentMatchDetails);
    handleAIExplainMatch(currentMatchDetails);
  }, [matcher, parser, transactionField, referenceValue, transactionFieldString]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAISuggestMatcher = useCallback(async () => {
    if (referenceValue && transactionField && transactionFieldString && !isSuggestingMatcher) {
      setIsSuggestingMatcher(true);
      try {
        const suggestion = await AI_SERVICE.suggestMatcher(
          referenceValue,
          transactionField,
          transactionFieldString,
        );
        setAiSuggestedMatcher(suggestion);
      } catch (error) {
        console.error("CDBI AI Matcher Suggestion failed:", error);
        setAiSuggestedMatcher("AI Suggestion Failed");
      } finally {
        setIsSuggestingMatcher(false);
      }
    }
  }, [AI_SERVICE, referenceValue, transactionField, transactionFieldString, isSuggestingMatcher]);

  const handleAIGenerateParser = useCallback(async () => {
    if (referenceValue && transactionFieldString && !isGeneratingParser) {
      setIsGeneratingParser(true);
      try {
        const generated = await AI_SERVICE.generateParser(
          referenceValue,
          transactionFieldString,
        );
        callback("Payment Reference", matcher, generated, true, transactionField, null, null);
      } catch (error) {
        console.error("CDBI AI Parser Generation failed:", error);
        // Fallback to default or error message
        callback("Payment Reference", matcher, "(.*)", true, transactionField, null, null);
      } finally {
        setIsGeneratingParser(false);
      }
    }
  }, [AI_SERVICE, callback, matcher, referenceValue, transactionField, transactionFieldString, isGeneratingParser]);

  const handleAIExplainMatch = useCallback(
    async (
      matchDetails: Parameters<typeof AI_SERVICE.explainMatch>[0],
    ) => {
      if (!isExplaining) {
        setIsExplaining(true);
        try {
          const explanation = await AI_SERVICE.explainMatch(matchDetails);
          setAiExplanation(explanation);
        } catch (error) {
          console.error("CDBI AI Explanation failed:", error);
          setAiExplanation("AI explanation could not be generated.");
        } finally {
          setIsExplaining(false);
        }
      }
    },
    [AI_SERVICE, isExplaining],
  );

  const handleAIDetectAnomalies = useCallback(
    async (
      currentMatch: Parameters<typeof AI_SERVICE.detectAnomalies>[0],
    ) => {
      if (!isDetectingAnomalies) {
        setIsDetectingAnomalies(true);
        try {
          const report = await AI_SERVICE.detectAnomalies(currentMatch);
          setAnomalyReport(report);
        } catch (error) {
          console.error("CDBI AI Anomaly Detection failed:", error);
          setAnomalyReport({
            score: 0,
            description: "AI Anomaly detection failed.",
          });
        } finally {
          setIsDetectingAnomalies(false);
        }
      }
    },
    [AI_SERVICE, isDetectingAnomalies],
  );

  // Dynamic suggestions for Autosuggest based on AI
  const autosuggestions = aiSuggestedMatcher
    ? [
        {
          label: `AI Suggested: ${aiSuggestedMatcher}`,
          value: aiSuggestedMatcher,
        },
      ]
    : [
        {
          label: "No AI Suggestion available",
          value: "(.*)", // Fallback regex
        },
      ];

  const currentKPIs = GEMINI_ANALYTICS.getKPIs();
  const aiMatcherPerfChartData = GEMINI_ANALYTICS.getChartData("AI_MATCHER_PERFORMANCE");
  const aiParserPerfChartData = GEMINI_ANALYTICS.getChartData("AI_PARSER_PERFORMANCE");
  const aiAnomalyTrendChartData = GEMINI_ANALYTICS.getChartData("AI_ANOMALY_TREND");

  return (
    <div className="flex w-full flex-col p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-cdbi-blue-900">
        CDBI AI-Powered Reconciliation Matcher
      </h2>

      {/* AI Anomaly Detection Section */}
      <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
        <Label className="font-semibold text-red-700 mb-2 flex items-center">
          <Icon iconName="warning" size="sm" className="mr-2" color="currentColor" />
          AI Anomaly Detection
          {isDetectingAnomalies && <Spinner className="ml-2" size="xs" color="currentColor" />}
        </Label>
        {anomalyReport ? (
          <>
            <p
              className={`text-sm ${
                anomalyReport.score > 60 ? "text-red-800" : "text-gray-700"
              }`}
            >
              {anomalyReport.description} (Score: {anomalyReport.score.toFixed(2)})
            </p>
            {anomalyReport.score > 60 && (
              <p className="text-xs text-red-600 mt-1">
                Recommendation: Review the selected matcher and parser. Consider AI-driven refinement.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-600">
            AI is continuously monitoring for unusual reconciliation patterns.
            {isDetectingAnomalies && " Checking for anomalies..."}
          </p>
        )}
      </div>

      {/* Reference Type Selection */}
      <div className="flex w-full mb-4 items-center">
        <Label className="flex self-center min-w-[120px] pr-3 text-cdbi-blue-800">
          Reference Type
        </Label>
        <div className="min-w-44 flex-grow">
          <SelectField
            className="flex w-full"
            handleChange={(e) => {
              callback(
                "Payment Reference",
                e as string,
                parser,
                showParser,
                transactionField,
                null,
                null,
              );
              GEMINI_ANALYTICS.trackKPI(
                "USER_MATCHER_SELECTION",
                e as string,
                { referenceValue, transactionField },
                "type",
                "User selected a matcher type.",
              );
            }}
            id="select-matcher-type"
            name="select-matcher-type"
            selectValue={matcher}
            options={selectFieldOptions}
          />
        </div>
        {referenceValue ? (
          <Label className="flex pb-0 pl-2 text-sm text-gray-500 italic">
            {referenceValue}
          </Label>
        ) : (
          <Label className="flex pb-0 pl-2 text-sm italic text-gray-400">
            No reference found
          </Label>
        )}
      </div>

      {/* AI Matcher Suggestion */}
      <div className="flex w-full mb-4 items-center">
        <Label className="flex self-center min-w-[120px] pr-3 text-cdbi-blue-800">
          AI Suggestion
        </Label>
        <div className="flex flex-grow items-center">
          {isSuggestingMatcher ? (
            <div className="flex items-center text-sm text-cdbi-blue-600">
              <Spinner className="mr-2" size="sm" color="currentColor" />
              CDBI AI analyzing...
            </div>
          ) : aiSuggestedMatcher ? (
            <Clickable
              onClick={() => {
                if (aiSuggestedMatcher) {
                  callback(
                    "Payment Reference",
                    aiSuggestedMatcher,
                    parser,
                    showParser,
                    transactionField,
                    null,
                    null,
                  );
                  GEMINI_ANALYTICS.trackKPI(
                    "AI_MATCHER_SUGGESTION_APPLIED",
                    aiSuggestedMatcher,
                    { referenceValue, transactionField, userOverride: false },
                    "type",
                    "AI suggested matcher was applied by user.",
                  );
                }
              }}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Icon iconName="lightbulb_outline" size="sm" className="mr-1" color="currentColor" />
              <Label className="text-sm font-medium cursor-pointer">
                Apply AI Suggestion: {aiSuggestedMatcher}
              </Label>
            </Clickable>
          ) : (
            <Label className="text-sm italic text-gray-400">
              AI suggestion pending or not available.
            </Label>
          )}
        </div>
      </div>

      {/* Transaction Field Selection */}
      <div className="flex w-full flex-col mb-4">
        <div className="flex w-full items-center">
          <Label className="flex self-center min-w-[120px] pr-1 text-cdbi-blue-800">
            Transaction Field
          </Label>
          <div className="min-w-44 flex-grow">
            <SelectField
              className="flex w-full"
              handleChange={(e) => {
                callback(
                  "Payment Reference",
                  matcher,
                  parser,
                  showParser,
                  e as string,
                  null,
                  null,
                );
                GEMINI_ANALYTICS.trackKPI(
                  "USER_TRANSACTION_FIELD_SELECTION",
                  e as string,
                  { referenceValue, matcher },
                  "field",
                  "User selected a transaction field.",
                );
              }}
              id="select-transaction-field"
              name="select-transaction-field"
              selectValue={transactionField}
              options={transactionFieldOptions}
            />
          </div>
        </div>
        <Label className="flex pl-[128px] pt-1 text-xs text-gray-500 italic">
          {transactionFieldString || "No transaction field value found"}
        </Label>
      </div>

      {/* Parser Configuration */}
      <div className="flex w-full flex-col">
        {showParser ? (
          <div className="flex w-full flex-col">
            <div className="flex w-full pt-2 items-center">
              <Label className="justify-left flex self-center pr-1 text-cdbi-blue-800">
                Parser:
              </Label>
              <Label className="self-center px-1">/</Label>
              <Autosuggest
                className="justify-right flex-grow"
                onChange={(e) => {
                  callback(
                    "Payment Reference",
                    matcher,
                    e.target.value,
                    showParser,
                    transactionField,
                    null,
                    null,
                  );
                }}
                onSuggestionSelect={(e, suggestion) => {
                  callback(
                    "Payment Reference",
                    matcher,
                    suggestion.suggestionValue,
                    showParser,
                    transactionField,
                    null,
                    null,
                  );
                  GEMINI_ANALYTICS.trackKPI(
                    "PARSER_SUGGESTION_APPLIED",
                    suggestion.suggestionValue,
                    { source: "Autosuggest" },
                    "regex",
                    "User applied a parser suggestion.",
                  );
                }}
                value={parser || ""}
                suggestions={autosuggestions}
                placeholder="Enter a regex parser (e.g., (INV\\d+))"
              />
              <Label className="self-center px-1">/</Label>
              <Clickable
                onClick={handleAIGenerateParser}
                className="ml-2 flex items-center text-blue-600 hover:text-blue-800 text-sm"
                disabled={isGeneratingParser}
              >
                {isGeneratingParser ? (
                  <Spinner className="mr-1" size="xs" color="currentColor" />
                ) : (
                  <Icon iconName="smart_toy" size="sm" className="mr-1" color="currentColor" />
                )}
                CDBI AI Generate
              </Clickable>
            </div>

            <div className="flex w-full">
              <Clickable
                onClick={() => {
                  callback(
                    "Payment Reference",
                    matcher,
                    null,
                    false,
                    transactionField,
                    null,
                    null,
                  );
                  GEMINI_ANALYTICS.trackKPI(
                    "PARSER_REMOVED",
                    "N/A",
                    { previousParser: parser },
                    "action",
                    "User removed the parser.",
                  );
                }}
              >
                <div className="mr-auto flex flex-row pb-2 pt-2">
                  <Icon
                    className="self-center text-red-500"
                    iconName="remove"
                    size="xs"
                    color="currentColor"
                  />
                  <Label className="flex self-center pl-1 text-xs text-red-500 cursor-pointer">
                    Remove Parser
                  </Label>
                </div>
              </Clickable>
            </div>
          </div>
        ) : (
          <div className="flex w-full">
            <Clickable
              onClick={() => {
                callback(
                  "Payment Reference",
                  matcher,
                  parser,
                  true,
                  transactionField,
                  null,
                  null,
                );
                GEMINI_ANALYTICS.trackKPI(
                  "PARSER_ADDED",
                  "N/A",
                  {},
                  "action",
                  "User added a parser.",
                );
              }}
            >
              <div className="mr-auto flex flex-row pb-2 pt-1">
                <Icon
                  className="self-center text-blue-500"
                  iconName="add"
                  size="xs"
                  color="currentColor"
                />
                <Label className="flex self-center pl-1 text-xs text-blue-500 cursor-pointer">
                  Add Parser
                </Label>
              </div>
            </Clickable>
          </div>
        )}
      </div>

      {/* AI Explanation Section */}
      <div className="mt-6 p-4 bg-cdbi-blue-50 border border-cdbi-blue-200 rounded-md">
        <Label className="font-semibold text-cdbi-blue-800 mb-2 flex items-center">
          <Icon iconName="psychology_alt" size="sm" className="mr-2" color="currentColor" />
          CDBI AI Reconciliation Insights
          {isExplaining && <Spinner className="ml-2" size="xs" color="currentColor" />}
        </Label>
        {aiExplanation ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiExplanation}</p>
        ) : (
          <p className="text-sm text-gray-600">
            AI is generating an explanation for the current reconciliation setup.
          </p>
        )}
      </div>

      {/* AI KPIs and Charts Section */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-bold mb-4 text-cdbi-blue-900">
          CDBI AI Performance & Gemini Analytics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
            <Label className="font-medium text-gray-700">AI Matcher Accuracy (Latest)</Label>
            <p className="text-2xl font-bold text-cdbi-blue-700">
              {(
                currentKPIs.find((k) => k.name === "AI_MATCHER_SUGGESTION_ACCURACY")?.value * 100 ||
                "N/A"
              ).toFixed(2)}
              %
            </p>
            <p className="text-xs text-gray-500">
              Target: 90% | Last Update:{" "}
              {new Date(
                currentKPIs.find((k) => k.name === "AI_MATCHER_SUGGESTION_ACCURACY")?.timestamp ||
                  new Date().toISOString(),
              ).toLocaleTimeString()}
            </p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
            <Label className="font-medium text-gray-700">AI Parser Precision (Latest)</Label>
            <p className="text-2xl font-bold text-cdbi-blue-700">
              {(
                currentKPIs.find((k) => k.name === "AI_PARSER_GENERATION_PRECISION")?.value * 100 ||
                "N/A"
              ).toFixed(2)}
              %
            </p>
            <p className="text-xs text-gray-500">
              Target: 85% | Last Update:{" "}
              {new Date(
                currentKPIs.find((k) => k.name === "AI_PARSER_GENERATION_PRECISION")?.timestamp ||
                  new Date().toISOString(),
              ).toLocaleTimeString()}
            </p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
            <Label className="font-medium text-gray-700">Anomaly Detection Rate (Last Hr)</Label>
            <p className="text-2xl font-bold text-cdbi-blue-700">
              {currentKPIs.filter((k) => k.name === "AI_ANOMALY_DETECTION_RATE" && k.value === 1)
                .length || 0}{" "}
              Anomalies
            </p>
            <p className="text-xs text-gray-500">
              Threshold: 60 Score | Last Update:{" "}
              {new Date(
                currentKPIs.find((k) => k.name === "AI_ANOMALY_DETECTION_RATE")?.timestamp ||
                  new Date().toISOString(),
              ).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Chart Placeholders - In a real app, these would be powered by actual chart libraries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100 min-h-[150px] flex flex-col justify-center items-center">
            <Label className="font-medium text-gray-700 mb-2">
              AI Matcher Performance (Gemini Live)
            </Label>
            {aiMatcherPerfChartData.length > 0 ? (
              <div className="text-sm text-gray-600">
                (Simulated Chart) Latest Data:{" "}
                {JSON.stringify(
                  aiMatcherPerfChartData[aiMatcherPerfChartData.length - 1],
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Visualize trends and accuracy over time in your Gemini dashboard.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No data for AI Matcher Performance chart yet.</p>
            )}
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100 min-h-[150px] flex flex-col justify-center items-center">
            <Label className="font-medium text-gray-700 mb-2">
              AI Parser Generation Trend (Gemini Live)
            </Label>
            {aiParserPerfChartData.length > 0 ? (
              <div className="text-sm text-gray-600">
                (Simulated Chart) Latest Data:{" "}
                {JSON.stringify(
                  aiParserPerfChartData[aiParserPerfChartData.length - 1],
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Track parser generation precision and usage in your Gemini dashboard.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No data for AI Parser Generation Trend chart yet.
              </p>
            )}
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100 min-h-[150px] flex flex-col justify-center items-center col-span-full">
            <Label className="font-medium text-gray-700 mb-2">
              AI Anomaly Detection Trend (Gemini Live)
            </Label>
            {aiAnomalyTrendChartData.length > 0 ? (
              <div className="text-sm text-gray-600">
                (Simulated Chart) Latest Data:{" "}
                {JSON.stringify(
                  aiAnomalyTrendChartData[aiAnomalyTrendChartData.length - 1],
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Monitor the frequency and severity of detected anomalies in real-time on Gemini.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No data for AI Anomaly Detection Trend chart yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default PaymentReferenceReconciliationMatchResult;