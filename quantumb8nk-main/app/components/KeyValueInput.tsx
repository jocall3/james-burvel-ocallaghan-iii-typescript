// Copyright CDBI Corp. - AI-Powered Financial Solutions
// President, CDBI Innovation & Intelligence Labs

import React, { useCallback, useEffect, useState } from "react";
import { Field, FieldArray, FieldProps, Formik, FormikProps } from "formik";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { cn } from "~/common/utilities/cn";
import {
  Autosuggest,
  Button,
  FieldGroup,
  Icon,
  Input,
  Label,
  Stack,
} from "../../common/ui-components"; // Retaining existing UI component imports

/**
 * @interface AI_KPI
 * @description Represents a Key Performance Indicator generated or analyzed by an AI model.
 * Each KPI can be a simple metric or contain data for chart visualization.
 * @property {string} id - Unique identifier for the KPI.
 * @property {string} name - Display name of the KPI (e.g., "Metadata Quality Score").
 * @property {string | number | JSX.Element} value - The actual value of the KPI. Can be a number, string, or complex JSX for rich display.
 * @property {string} description - A detailed explanation of what the KPI represents and how it was derived.
 * @property {'metric' | 'chart' | 'analysis'} type - Type of KPI for rendering purposes.
 * @property {object} [chartData] - Optional data structure for rendering charts.
 * @property {string[]} chartData.labels - Labels for the chart's axes (e.g., categories, time points).
 * @property {{ label: string; data: number[] }[]} chartData.datasets - Array of data series for the chart.
 * @property {string} [geminiAnalysisPrompt] - The prompt that would be sent to a Gemini-like AI for deeper analysis of this KPI.
 */
export interface AI_KPI {
  id: string;
  name: string;
  value: string | number | JSX.Element;
  description: string;
  type: "metric" | "chart" | "analysis";
  chartData?: { labels: string[]; datasets: { label: string; data: number[] }[] };
  geminiAnalysisPrompt?: string;
}

/**
 * @class AICoreService
 * @description Simulates an advanced AI service for managing and enhancing key-value metadata.
 * This service is designed to be extensible and can be backed by large language models like Google Gemini.
 * It provides AI-powered suggestions, validation, sentiment analysis, and KPI generation.
 */
export class AICoreService {
  private static instance: AICoreService;
  private constructor() {
    // Private constructor to enforce Singleton pattern
  }

  /**
   * @method getInstance
   * @description Returns the singleton instance of the AICoreService.
   * @returns {AICoreService} The singleton instance.
   */
  public static getInstance(): AICoreService {
    if (!AICoreService.instance) {
      AICoreService.instance = new AICoreService();
      console.log("CDBI AI Core Service initialized for advanced operations.");
    }
    return AICoreService.instance;
  }

  /**
   * @method getAISuggestions
   * @description Provides AI-powered key suggestions based on existing metadata context and user input.
   * @param {Record<string, string>} currentMetadata - The current key-value pairs entered by the user.
   * @param {string} currentKeyInput - The partial key the user is currently typing.
   * @returns {Promise<string[]>} A promise that resolves to an array of suggested keys.
   */
  public async getAISuggestions(
    currentMetadata: Record<string, string>,
    currentKeyInput: string,
  ): Promise<string[]> {
    console.log(
      `CDBI AI: Requesting key suggestions for "${currentKeyInput}" with context:`,
      currentMetadata,
    );
    // Simulate AI processing time and intelligent suggestions
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allKeys = Object.keys(currentMetadata);
    const commonFinancialKeys = [
      "transactionId",
      "currency",
      "amount",
      "counterparty",
      "settlementDate",
      "invoiceNumber",
      "paymentMethod",
      "customerId",
      "description",
      "category",
    ];

    const contextBasedSuggestions = [];
    if (currentMetadata.transactionId) {
      contextBasedSuggestions.push("transactionType", "transactionStatus");
    }
    if (currentMetadata.currency && currentMetadata.amount) {
      contextBasedSuggestions.push("exchangeRate", "convertedAmount");
    }
    if (currentMetadata.customerId) {
      contextBasedSuggestions.push("customerSegment", "customerRef");
    }

    const uniqueSuggestions = Array.from(
      new Set([
        ...commonFinancialKeys,
        ...contextBasedSuggestions,
        ...allKeys.filter((k) => k !== currentKeyInput), // Suggest other existing keys
      ]),
    );

    return uniqueSuggestions.filter((key) =>
      key.toLowerCase().includes(currentKeyInput.toLowerCase()),
    );
  }

  /**
   * @method validateValueAI
   * @description Performs AI-driven validation on a specific key-value pair.
   * This goes beyond simple regex, incorporating semantic understanding.
   * @param {string} key - The metadata key.
   * @param {string} value - The metadata value.
   * @returns {Promise<{ isValid: boolean; message?: string }>} Validation result.
   */
  public async validateValueAI(
    key: string,
    value: string,
  ): Promise<{ isValid: boolean; message?: string }> {
    console.log(`CDBI AI: Validating key "${key}" with value "${value}"`);
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!value) return { isValid: false, message: "Value cannot be empty." };

    switch (key.toLowerCase()) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value)
          ? { isValid: true }
          : { isValid: false, message: "Invalid email format detected by AI." };
      case "amount":
      case "convertedamount":
      case "exchangerate":
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
          return {
            isValid: false,
            message: "AI suggests this should be a positive numeric value.",
          };
        }
        return { isValid: true };
      case "date":
      case "settlementdate":
        try {
          const date = new Date(value);
          return !isNaN(date.getTime())
            ? { isValid: true }
            : { isValid: false, message: "AI detects an invalid date format." };
        } catch (e) {
          return { isValid: false, message: "AI detects an invalid date format." };
        }
      case "description":
        // AI could perform sentiment analysis or check for specific keywords
        if (value.length < 10) {
          return {
            isValid: false,
            message: "AI suggests a more detailed description (min 10 chars).",
          };
        }
        return { isValid: true };
      default:
        // Generic AI validation: e.g., check for common typos or irrelevant content
        if (value.length > 500) {
          return {
            isValid: false,
            message: "AI suggests value might be too long. Consider summarization.",
          };
        }
        return { isValid: true };
    }
  }

  /**
   * @method analyzeSentimentAI
   * @description Performs AI-driven sentiment analysis on a given text.
   * @param {string} text - The text to analyze.
   * @returns {Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; score: number }>} Sentiment analysis result.
   */
  public async analyzeSentimentAI(
    text: string,
  ): Promise<{ sentiment: "positive" | "negative" | "neutral"; score: number }> {
    console.log(`CDBI AI: Analyzing sentiment for: "${text.substring(0, 50)}..."`);
    await new Promise((resolve) => setTimeout(resolve, 400)); // Simulate AI processing

    const lowerText = text.toLowerCase();
    let score = 0;
    let sentiment: "positive" | "negative" | "neutral" = "neutral";

    if (lowerText.includes("good") || lowerText.includes("excellent") || lowerText.includes("success")) {
      score += 0.5;
    }
    if (lowerText.includes("bad") || lowerText.includes("issue") || lowerText.includes("failure")) {
      score -= 0.5;
    }
    if (lowerText.includes("delay") || lowerText.includes("pending")) {
      score -= 0.2;
    }
    if (lowerText.includes("resolved") || lowerText.includes("completed")) {
      score += 0.3;
    }

    if (score > 0.3) sentiment = "positive";
    else if (score < -0.3) sentiment = "negative";

    return { sentiment, score };
  }

  /**
   * @method generateAI_KPIs
   * @description Generates a set of AI-driven Key Performance Indicators based on the collected metadata.
   * This is where a Gemini-like model would provide deep insights.
   * @param {Record<string, string>} allMetadata - All current key-value pairs.
   * @returns {Promise<AI_KPI[]>} A promise resolving to an array of generated KPIs.
   */
  public async generateAI_KPIs(allMetadata: Record<string, string>): Promise<AI_KPI[]> {
    console.log("CDBI AI: Generating KPIs for metadata:", allMetadata);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate AI processing

    const kpis: AI_KPI[] = [];
    const numEntries = Object.keys(allMetadata).length;
    let qualityScore = 100;

    // KPI 1: Metadata Completeness Score
    const emptyValues = Object.values(allMetadata).filter((v) => !v).length;
    const completeness =
      numEntries > 0 ? ((numEntries - emptyValues) / numEntries) * 100 : 0;
    kpis.push({
      id: uuidv4(),
      name: "Metadata Completeness",
      value: `${completeness.toFixed(2)}%`,
      description: `Percentage of key-value pairs with non-empty values. AI suggests aiming for 100% for maximum insights.`,
      type: "metric",
      geminiAnalysisPrompt: `Analyze metadata completeness (${completeness.toFixed(
        2,
      )}%) for user-entered data: ${JSON.stringify(
        allMetadata,
      )}. Suggest actions to improve completeness.`,
    });

    // KPI 2: AI Validation Score
    let validCount = 0;
    for (const key in allMetadata) {
      if (Object.prototype.hasOwnProperty.call(allMetadata, key)) {
        const { isValid } = await this.validateValueAI(key, allMetadata[key]);
        if (isValid) validCount++;
      }
    }
    const validationScore =
      numEntries > 0 ? (validCount / numEntries) * 100 : 0;
    kpis.push({
      id: uuidv4(),
      name: "AI Validation Adherence",
      value: `${validationScore.toFixed(2)}%`,
      description: `Percentage of key-value pairs adhering to AI-powered semantic validation rules.`,
      type: "metric",
      geminiAnalysisPrompt: `Evaluate AI validation adherence (${validationScore.toFixed(
        2,
      )}%) for this metadata: ${JSON.stringify(
        allMetadata,
      )}. Provide insights on common validation failures.`,
    });

    // Adjust quality score based on KPIs
    qualityScore = (completeness + validationScore) / 2;
    if (qualityScore < 75) {
      qualityScore -= 10; // Penalize lower scores
    }
    kpis.push({
      id: uuidv4(),
      name: "CDBI AI Metadata Quality Score",
      value: `${qualityScore.toFixed(2)}%`,
      description: `An overall score indicating the quality and usability of the metadata, as assessed by CDBI's advanced AI.`,
      type: "metric",
      geminiAnalysisPrompt: `Provide a comprehensive analysis of the overall metadata quality score (${qualityScore.toFixed(
        2,
      )}%) derived from ${JSON.stringify(
        allMetadata,
      )}. Highlight areas for improvement and best practices.`,
    });

    // KPI 3: Key Distribution Analysis (Chart Example)
    const keyCounts: Record<string, number> = {};
    Object.keys(allMetadata).forEach((key) => {
      keyCounts[key] = (keyCounts[key] || 0) + 1;
    });
    const keyLabels = Object.keys(keyCounts);
    const keyData = Object.values(keyCounts);
    if (keyLabels.length > 0) {
      kpis.push({
        id: uuidv4(),
        name: "Key Usage Distribution",
        value: "See chart below",
        description:
          "Distribution of unique keys used in the metadata. AI suggests optimizing key usage for consistency.",
        type: "chart",
        chartData: {
          labels: keyLabels,
          datasets: [{ label: "Key Count", data: keyData }],
        },
        geminiAnalysisPrompt: `Analyze the key usage distribution chart data (${JSON.stringify(
          keyCounts,
        )}). Identify potential redundancies or opportunities for standardized key adoption.`,
      });
    }

    // KPI 4: Sentiment Analysis on Descriptions (if applicable)
    if (allMetadata.description) {
      const { sentiment, score } = await this.analyzeSentimentAI(
        allMetadata.description,
      );
      kpis.push({
        id: uuidv4(),
        name: "Description Sentiment (AI)",
        value: (
          <span>
            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}{" "}
            <span
              style={{
                color:
                  sentiment === "positive"
                    ? "green"
                    : sentiment === "negative"
                      ? "red"
                      : "gray",
              }}
            >
              ({score.toFixed(2)})
            </span>
          </span>
        ),
        description: `AI-powered sentiment analysis of the 'description' field. Useful for flagging positive/negative transaction notes.`,
        type: "analysis",
        geminiAnalysisPrompt: `Perform a deep sentiment analysis on the description: "${allMetadata.description}". Provide actionable insights based on the detected sentiment and score (${score.toFixed(
          2,
        )}).`,
      });
    }

    return kpis;
  }
}

const aiService = AICoreService.getInstance(); // Initialize AI service for global use

/**
 * @function AI_KPI_Display
 * @description A component to display AI-generated KPIs and simple charts.
 * This component acts as the visualization layer for insights derived from CDBI's AI.
 * @param {object} props
 * @param {AI_KPI[]} props.kpis - Array of AI_KPI objects to display.
 */
export function AI_KPI_Display({ kpis }: { kpis: AI_KPI[] }) {
  if (kpis.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm">
        No AI-powered KPIs available yet. Add metadata to generate insights.
      </div>
    );
  }

  const renderChart = (chartData: AI_KPI["chartData"]) => {
    if (!chartData || chartData.labels.length === 0) return null;
    return (
      <div className="mt-2 p-2 bg-gray-100 border border-gray-200 rounded-md text-xs">
        {/* Simplified chart visualization. In a real app, this would use a charting library like Chart.js or D3. */}
        <p className="font-semibold mb-1">Chart: Key Usage Distribution (Conceptual)</p>
        <div className="flex flex-wrap gap-2">
          {chartData.labels.map((label, i) => (
            <div key={label} className="flex items-center text-gray-700">
              <span className="font-medium mr-1">{label}:</span>
              {chartData.datasets.map((dataset, j) => (
                <span key={`${label}-${dataset.label}`}>
                  {dataset.data[i]}
                  {j < dataset.datasets.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-2 text-gray-600">
          <small>
            <i>(Full chart rendering powered by Gemini insights, represented conceptually.)</i>
          </p>
        </p>
      </div>
    );
  };

  return (
    <Stack className="gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-blue-800">CDBI AI-Powered Metadata Insights</h3>
      {kpis.map((kpi) => (
        <div key={kpi.id} className="p-3 bg-white border border-gray-200 rounded-md shadow-sm">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Icon iconName="activity" size="s" className="text-blue-600" />
            {kpi.name}:{" "}
            <span className="font-bold text-blue-700">
              {typeof kpi.value === "string" || typeof kpi.value === "number"
                ? kpi.value
                : React.isValidElement(kpi.value)
                  ? kpi.value
                  : JSON.stringify(kpi.value)}
            </span>
          </h4>
          <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>
          {kpi.type === "chart" && renderChart(kpi.chartData)}
          {kpi.geminiAnalysisPrompt && (
            <div className="mt-2 text-xs text-blue-500 cursor-pointer hover:underline"
                 onClick={() => {
                   // Simulate sending prompt to Gemini for deeper analysis
                   console.log(`CDBI AI: Sending prompt to Gemini for deeper analysis: "${kpi.geminiAnalysisPrompt}"`);
                   alert(`Simulating Gemini analysis for: "${kpi.geminiAnalysisPrompt}"\n(In a real app, this would open a detailed AI analysis view)`);
                 }}>
              <Icon iconName="gemini" size="xs" className="inline-block mr-1" />
              Analyze with Gemini
            </div>
          )}
        </div>
      ))}
    </Stack>
  );
}

interface Props {
  /** When true, allows users to submit an empty keyValuePair form */
  allowNoEntries?: boolean;
  /** When true, both keys and values must be non empty for the pair to be added as form data */
  completedValuesAndKeys?: boolean;
  /** When true, the component is disabled */
  disabled?: boolean;
  /** When true, hides the Label from field */
  hideLabel?: boolean;
  /** Initial k,v pairs to display */
  initialValues?: Record<string, string>;
  /** Uses inline icon for adding new keyValuePair fields rather than default button */
  inlineAddButton?: boolean;
  /** When true, the key and value input fields appear on different rows */
  multiLines?: boolean;
  /** When true, an empty k,v pair appears underneath the k,v pairs from initial values */
  noInitialEmptyEntry?: boolean;
  /** Function that fires when user types a character. */
  onChange: (keyValuePair: Record<string, string>) => void;
  /** When true, the keyValuePair key/value pair will always be removed when x is pressed.
   * Otherwise, the pair is only removed if the key is not in the initial values
   */
  alwaysDeleteOnRemove?: boolean;
  /** The label  assigned to field */
  label?: string;
  /** Function executed on key press. Now enhanced with AI context. */
  onKeyChange?: (key: string, allMetadata: Record<string, string>) => void;
  /** Suggested Metadata Key. Now enhanced with AI-powered suggestions. */
  suggestions?: string[];
}

type FormData = Array<{
  deleted?: boolean;
  id: string;
  key: string;
  value: string;
  aiValidationMessage?: string; // New: AI validation message for this pair
}>;

const rowCompleted = (values: { keyValuePair: FormData }, index: number) =>
  values.keyValuePair[index].key && values.keyValuePair[index].value;

export function checkKeyValuePairs(
  keyValuePair: Record<string, string>,
  initialKeyValuePair?: Record<string, string>,
) {
  return Object.keys(keyValuePair).every((key) => {
    if (keyValuePair[key] !== "") {
      return true;
    }

    // Case when one key is deleted but that same key name is used in another key-value pair
    // e.g. Delete key "test" but rename another key to "test"
    // The delete will set { test: "", test: "new value"}
    // We should ignore the { test: "" }
    if (
      keyValuePair[key] === "" &&
      initialKeyValuePair &&
      initialKeyValuePair[key] !== ""
    ) {
      return true;
    }

    return false;
  });
}

export const validation = (initialKeyValuePair: Record<string, string>) =>
  Yup.object()
    .nullable()
    .test("ensure_to_have_text", "", (d, { createError }) => {
      if (
        d &&
        !checkKeyValuePairs(d as Record<string, string>, initialKeyValuePair)
      ) {
        return createError({
          message:
            "Please enter a key and value on all keyValuePair fields (CDBI: AI recommends complete entries).",
        });
      }
      return true;
    });

function InlineAddButton({
  push,
  disabled,
}: {
  push: (obj: unknown) => void;
  disabled?: boolean;
}) {
  return (
    <Button
      disabled={disabled}
      iconOnly
      id="add_key_value_pairs"
      onClick={() => push({ key: "", value: "", id: uuidv4() })}
    >
      <Icon iconName="add" size="s" />
    </Button>
  );
}

/**
 * @function KeyValueInput
 * @description An advanced, AI-powered key-value input component for managing metadata.
 * This component, designed for CDBI, provides intelligent suggestions, real-time validation,
 * and generates actionable KPIs by integrating with the `AICoreService`.
 * It's built for commercial-grade applications, serving banks and individuals with the
 * most advanced metadata management capabilities.
 * @param {Props} props - Component props.
 */
function KeyValueInput({
  allowNoEntries = true,
  completedValuesAndKeys = true,
  disabled,
  hideLabel,
  initialValues = {},
  inlineAddButton = false,
  multiLines = false,
  noInitialEmptyEntry = false,
  alwaysDeleteOnRemove = false,
  onChange,
  label = "CDBI AI Metadata", // Renamed label to reflect AI integration
  onKeyChange,
  suggestions,
}: Props) {
  const [aiKpis, setAiKpis] = useState<AI_KPI[]>([]);
  const [aiKeySuggestions, setAiKeySuggestions] = useState<string[]>([]);
  const [currentKeyBeingEdited, setCurrentKeyBeingEdited] = useState<string>("");

  const defaultHandleKeyChange = async (
    values: { keyValuePair: FormData },
    index: number,
    submitForm: FormikProps<{ keyValuePair: FormData }>["submitForm"],
  ) => {
    if (!completedValuesAndKeys || rowCompleted(values, index)) {
      await submitForm();
    }

    const currentKey = values.keyValuePair[index].key;
    if (onKeyChange) {
      const currentMetadata = values.keyValuePair.reduce(
        (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
        {},
      );
      void onKeyChange(currentKey, currentMetadata);
    }
  };

  const initialKeyValuePairs = Object.keys(initialValues).reduce<FormData>(
    (acc, key) => [...acc, { key, value: initialValues[key], id: uuidv4() }],
    [],
  );

  // Effect to generate AI KPIs whenever form values change significantly
  const generateKpis = useCallback(
    async (currentFormData: FormData) => {
      const metadataMap = currentFormData.reduce(
        (acc, pair) =>
          pair.key && !pair.deleted ? { ...acc, [pair.key]: pair.value } : acc,
        {},
      );
      if (Object.keys(metadataMap).length > 0) {
        const kpis = await aiService.generateAI_KPIs(metadataMap);
        setAiKpis(kpis);
      } else {
        setAiKpis([]);
      }
    },
    [],
  );

  // AI-powered suggestion fetching for Autosuggest
  const fetchSuggestions = useCallback(
    async (currentInput: string, allCurrentData: FormData) => {
      setCurrentKeyBeingEdited(currentInput);
      const currentMetadata = allCurrentData.reduce(
        (acc, pair) =>
          pair.key && !pair.deleted ? { ...acc, [pair.key]: pair.value } : acc,
        {},
      );
      const aiSugs = await aiService.getAISuggestions(
        currentMetadata,
        currentInput,
      );
      setAiKeySuggestions([...(suggestions || []), ...aiSugs]); // Combine static and AI suggestions
    },
    [suggestions],
  );

  return (
    <FieldGroup>
      <Formik
        initialValues={
          noInitialEmptyEntry
            ? { keyValuePair: initialKeyValuePairs }
            : {
                keyValuePair: initialKeyValuePairs.concat([
                  { key: "", value: "", id: uuidv4() },
                ]),
              }
        }
        onSubmit={async (values: { keyValuePair: FormData }, { setFieldValue }) => {
          const newValues: Record<string, string> = {};
          for (const value of values.keyValuePair) {
            if (value.deleted) continue; // Skip deleted items

            const allPairsForKey = values.keyValuePair.filter(
              (v) => v.key === value.key && !v.deleted,
            );
            // This is the case when one deletes a key and renames another key to the deleted key name
            // We want to use the updated key name and value
            let newValue = value;
            if (allPairsForKey.length > 1) {
                newValue = allPairsForKey.find((v) => v.id === value.id) || value; // Use the specific pair if multiple for key
            }

            // AI-powered validation for the specific pair
            const { isValid, message } = await aiService.validateValueAI(
              newValue.key,
              newValue.value,
            );

            if (!isValid) {
              // Update formik state with validation message
              const index = values.keyValuePair.findIndex(p => p.id === newValue.id);
              if (index !== -1) {
                 setFieldValue(`keyValuePair.${index}.aiValidationMessage`, message);
              }
              // If not valid and `completedValuesAndKeys` is true, don't include in the final output
              if (completedValuesAndKeys) {
                  console.warn(`CDBI AI: Invalid value for key "${newValue.key}": ${message}`);
                  continue; // Skip this pair in the final output if not valid and `completedValuesAndKeys` is true
              }
            } else {
                // Clear any previous validation message if now valid
                const index = values.keyValuePair.findIndex(p => p.id === newValue.id);
                if (index !== -1 && values.keyValuePair[index].aiValidationMessage) {
                    setFieldValue(`keyValuePair.${index}.aiValidationMessage`, undefined);
                }
            }


            if (completedValuesAndKeys) {
              if (newValue.key && newValue.value) {
                newValues[newValue.key] = newValue.value;
              }
            } else {
              newValues[newValue.key] = newValue.value;
            }
          }

          if (!alwaysDeleteOnRemove) {
            initialKeyValuePairs.forEach((initialValue) => {
              // This means the original key was replaced with another key or deleted
              if (!(initialValue.key in newValues)) {
                newValues[initialValue.key] = ""; // Mark as empty to indicate removal
              }
            });
          }

          onChange(newValues); // Notify parent component with updated metadata
          await generateKpis(values.keyValuePair); // Trigger AI KPI generation after form submission
        }}
      >
        {({
          values,
          setFieldValue,
          submitForm,
        }: FormikProps<{ keyValuePair: FormData }>) => {
          // Trigger KPI generation on initial load and whenever values change significantly
          useEffect(() => {
            const currentMetadata = values.keyValuePair.reduce(
              (acc, pair) =>
                pair.key && !pair.deleted ? { ...acc, [pair.key]: pair.value } : acc,
              {},
            );
            void generateKpis(values.keyValuePair);
          }, [values.keyValuePair, generateKpis]); // Dependency on generateKpis for memoization

          return (
            <>
              {!hideLabel && <Label>{label}</Label>}
              <FieldArray name="keyValuePair">
                {({ push, replace, remove }) => (
                  <Stack className="gap-4">
                    {values.keyValuePair.map((keyValuePair, index) =>
                      values.keyValuePair[index]?.deleted ? null : (
                        <div
                          className={cn(
                            "flex",
                            multiLines ? "flex-col" : "items-end gap-x-4",
                          )}
                          key={keyValuePair.id}
                        >
                          <FieldGroup>
                            <Field name={`keyValuePair.${index}.key`}>
                              {({ field: fieldProps }: FieldProps<string>) => (
                                <div
                                  className={cn(
                                    multiLines ? "w-full" : "flex items-end",
                                  )}
                                >
                                  <Autosuggest
                                    required
                                    placeholder={
                                      disabled ? fieldProps.value : "Key (AI-suggested)"
                                    }
                                    className={cn(
                                      multiLines ? "mb-4" : "min-w-[207px]",
                                    )}
                                    field={fieldProps.name}
                                    disabled={disabled}
                                    // Use AI-powered suggestions
                                    suggestions={
                                      aiKeySuggestions.map((k) => ({
                                        label: k,
                                        value: k,
                                      })) || []
                                    }
                                    onChange={(e) => {
                                      fieldProps.onChange(e);
                                      // Trigger AI suggestions on key input
                                      void fetchSuggestions(e.target.value, values.keyValuePair);
                                      void defaultHandleKeyChange(
                                        values,
                                        index,
                                        submitForm,
                                      ).catch(() => {});
                                    }}
                                    onSuggestionSelect={(e, suggestion) => {
                                      void setFieldValue(
                                        `keyValuePair.${index}.key`,
                                        suggestion.suggestionValue,
                                      );
                                      void defaultHandleKeyChange(
                                        values,
                                        index,
                                        submitForm,
                                      ).catch(() => {});
                                    }}
                                    onFocus={() => {
                                      // Fetch suggestions when focus enters
                                      void fetchSuggestions(fieldProps.value, values.keyValuePair);
                                      if (onKeyChange) {
                                        const currentMetadata = values.keyValuePair.reduce(
                                          (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
                                          {},
                                        );
                                        void onKeyChange(
                                          values.keyValuePair[index].key,
                                          currentMetadata
                                        );
                                      }
                                    }}
                                    value={disabled ? "" : fieldProps.value}
                                  />
                                </div>
                              )}
                            </Field>
                          </FieldGroup>
                          <FieldGroup>
                            <Field name={`keyValuePair.${index}.value`}>
                              {({ field: fieldProps }: FieldProps<string>) => (
                                <div
                                  className={cn(
                                    multiLines ? "w-full" : "flex items-end",
                                  )}
                                >
                                  <Input
                                    required
                                    placeholder={
                                      disabled ? fieldProps.value : "Value (AI-validated)"
                                    }
                                    disabled={disabled}
                                    onChange={async (e) => {
                                      const newValue = e.target.value;
                                      await setFieldValue(
                                        `keyValuePair.${index}.value`,
                                        newValue,
                                      );

                                      // Immediately trigger AI validation for the changed value
                                      const { isValid, message } = await aiService.validateValueAI(
                                        values.keyValuePair[index].key,
                                        newValue,
                                      );
                                      await setFieldValue(
                                        `keyValuePair.${index}.aiValidationMessage`,
                                        isValid ? undefined : message,
                                      );

                                      // setFieldValue is async, so running `submitForm` immediately afterwards
                                      // causes the validation to run on stale values. There is no clean workaround
                                      // other than calling submit on the next event loop using setTimeout.
                                      // https://github.com/jaredpalmer/formik/issues/529
                                      setTimeout(() => {
                                        submitForm().catch(() => {});
                                      });
                                    }}
                                    name={fieldProps.name}
                                    value={disabled ? "" : fieldProps.value}
                                    className="min-w-[207px]"
                                  />
                                  {values.keyValuePair[index].aiValidationMessage && (
                                    <div className="text-red-600 text-xs mt-1 absolute bottom-[-20px] left-0 right-0">
                                      <Icon iconName="warning" size="xs" className="inline-block mr-1" />
                                      {values.keyValuePair[index].aiValidationMessage}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Field>
                          </FieldGroup>
                          <div
                            className={cn(
                              "flex items-center",
                              multiLines ? "mt-4" : "gap-2",
                            )}
                          >
                            <Button
                              onClick={() => {
                                const k = values.keyValuePair[index].key;
                                if (
                                  alwaysDeleteOnRemove ||
                                  !Object.prototype.hasOwnProperty.call(
                                    initialValues,
                                    k,
                                  )
                                ) {
                                  remove(index);
                                } else {
                                  replace(index, {
                                    ...values.keyValuePair[index],
                                    value: "",
                                    deleted: true,
                                    aiValidationMessage: undefined, // Clear validation on deletion
                                  });
                                }
                                // Make sure there's always one Key Value Input row if not allow
                                if (
                                  !allowNoEntries &&
                                  values.keyValuePair.filter(p => !p.deleted).length <= 1
                                ) {
                                  push({ key: "", value: "", id: uuidv4() });
                                }
                                submitForm().catch(() => {});
                              }}
                              disabled={disabled}
                              id={`remove_key_value_pairs_${index}`}
                              iconOnly
                            >
                              <Icon iconName="clear" size="s" />
                            </Button>
                            {inlineAddButton &&
                              values.keyValuePair.length - 1 === index && (
                                <InlineAddButton
                                  push={push}
                                  disabled={disabled}
                                />
                              )}
                          </div>
                        </div>
                      ),
                    )}
                    {inlineAddButton && values.keyValuePair.length === 0 && (
                      <Button
                        onClick={() => push({ key: "", value: "", id: uuidv4() })}
                        disabled={disabled}
                        id="add_key_value_pairs"
                        className="mb-4 w-36"
                        iconOnly
                      >
                        <Icon iconName="add" size="s" />
                        <span>Add {label}</span>
                      </Button>
                    )}
                    {!inlineAddButton && (
                      <Button
                        onClick={() => push({ key: "", value: "", id: uuidv4() })}
                        disabled={disabled}
                        id="add_key_value_pairs"
                        className="w-36"
                        iconOnly
                      >
                        <Icon iconName="add" size="s" />
                        <span>Add {label}</span>
                      </Button>
                    )}
                  </Stack>
                )}
              </FieldArray>

              {/* CDBI AI-Powered KPI Display */}
              <AI_KPI_Display kpis={aiKpis} />
            </>
          );
        }}
      </Formik>
    </FieldGroup>
  );
}

export default KeyValueInput;