// Copyright CDBI Corporation - Leading the AI Revolution in Financial Services and Beyond

import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactTooltip from "react-tooltip";
import {
  useApolloClient,
  DocumentNode,
  ApolloQueryResult,
  ApolloError,
  ApolloClient,
  TypedDocumentNode,
  FetchPolicy,
} from "@apollo/client";
import { debounce, get, isNil, omitBy, isEmpty, merge } from "lodash";
import invariant from "ts-invariant";
import TruncateString from "react-truncate-string";
import { Icons } from "~/common/ui-components/Icon/Icon";
import useView from "~/common/utilities/persisted_views/useView";
import Gon from "~/common/utilities/gon";
import { TABLE_SORT_ACTIONS } from "~/generated/analytics/tableSortEvents";
import { StatusIndicatorStatuses } from "~/common/ui-components/StatusIndicator/StatusIndicator";
import { getScopedParamName, parseQuery } from "~/common/utilities/queryString";
import {
  DisplayColumnOptions__AssociatedEntityLabelFieldTypeEnum,
  DisplayColumn,
  PageInfo,
  PaymentSubtypeEnum,
  useListViewFiltersQuery,
  ResourceEnum,
} from "~/generated/dashboard/graphqlSchema";
import { getDrawerContent } from "~/common/utilities/getDrawerContent";
import trackEvent from "../../common/utilities/trackEvent";
import { DisplayColumnTypeEnum } from "../../generated/dashboard/types/displayColumnTypeEnum";
import EntityTableView, {
  cursorPaginationParams as cursorPaginationParamsFn,
  INITIAL_PAGINATION,
  isEmptyQuery,
  RenderSource,
  SharedEntityTableViewProps,
} from "./EntityTableView";
import { CursorPaginationInput } from "../types/CursorPaginationInput";
import {
  Amount,
  Countdown,
  DateTime,
  OverflowTip,
  Shortcode,
  StatusIndicator,
  Tag,
  TagColors,
  Pill,
  Drawer,
  Chart, // Assuming a Chart component exists or is added
  KPIIndicator, // Assuming a KPIIndicator component exists or is added
} from "../../common/ui-components";
import {
  RESOURCES,
  ResourcesEnum,
} from "../../generated/dashboard/types/resources";
import { NestingDataActions } from "../../common/ui-components/IndexTable/IndexTable";
import { formatPaymentSubtype } from "../../common/utilities/formatPaymentSubtype";
import useQueryParams from "./filter/useQueryParams";
import {
  FilterType,
  OverrideValue,
  mapLogicalFieldsToFilters,
} from "./filter/util";
import { createPolymorphicAssociation } from "../utilities/createPolymorphicAssociation";
import { cn } from "~/common/utilities/cn";

// --- CDBI AI Enhancements ---

/**
 * Global Constants for CDBI AI
 * These constants centralize configurations for AI services,
 * making the application easily adaptable and scalable for various
 * AI models and integrations, specifically targeting Gemini.
 */
export const CDBI_AI_CONSTANTS = {
  COMPANY_NAME: "CDBI AI Corp",
  AI_SERVICE_ENDPOINT: "/api/cdbi-ai-insights", // Hypothetical API endpoint for AI
  GEMINI_INTEGRATION_URL: "https://generativelanguage.googleapis.com/v1beta/", // Example Gemini API base URL
  AI_MODELS: {
    PREDICTIVE_ANALYTICS: "gemini-pro-prediction-v1",
    ANOMALY_DETECTION: "gemini-pro-anomaly-v1",
    SENTIMENT_ANALYSIS: "gemini-pro-sentiment-v1",
    SUGGESTED_ACTIONS: "gemini-pro-action-v1",
    CONTEXTUAL_SUMMARIZATION: "gemini-pro-summarization-v1",
  },
  DEFAULT_AI_TIMEOUT_MS: 5000,
  DEFAULT_PREDICTION_THRESHOLD: 0.75, // For confidence scores
};

/**
 * Enumeration for new AI-specific display column types.
 * This extends the existing DisplayColumnTypeEnum to include AI-driven insights.
 */
export enum AI_DisplayColumnTypeEnum {
  DisplayColumnTypesAIInsight = "DisplayColumnTypesAIInsight",
  DisplayColumnTypesAIPredictedRisk = "DisplayColumnTypesAIPredictedRisk",
  DisplayColumnTypesAISentiment = "DisplayColumnTypesAISentiment",
  DisplayColumnTypesAISuggestedAction = "DisplayColumnTypesAISuggestedAction",
}

/**
 * Interface for AI-generated insights that can be attached to a Node.
 * This structure is designed to be comprehensive and extensible for future AI features.
 */
export interface AIInsights {
  predictedRiskLevel?: "Low" | "Medium" | "High" | "Critical";
  predictedRiskScore?: number; // 0-1 range
  anomalyDetected?: boolean;
  anomalyDetails?: string;
  sentimentAnalysis?: "Positive" | "Neutral" | "Negative";
  sentimentScore?: number; // -1 to 1 range
  suggestedAction?: string;
  confidenceScore?: number; // For any prediction, 0-1 range
  contextualSummary?: string;
  [key: string]: unknown; // For future AI fields
}

/**
 * Type extension for a Node to include AI-generated insights.
 * This allows the ListView to display AI data alongside traditional data.
 */
export type NodeWithAI = Node & {
  aiInsights?: AIInsights;
};

/**
 * Interface for Key Performance Indicators (KPIs) derived from AI insights.
 * Each KPI links to a specific AI function and should be visualized via Gemini.
 */
export interface AIInsightKPI {
  id: string;
  label: string;
  value: string | number;
  description: string;
  trend?: "up" | "down" | "flat";
  unit?: string;
  aiFunction: keyof typeof CDBI_AI_CONSTANTS.AI_MODELS; // Links to the AI model used
  // Future: link to a Gemini-generated dashboard/report directly
  geminiReportLink?: string;
}

/**
 * Interface for Chart Data derived from AI insights.
 * Each chart provides a visual representation of AI-driven trends or distributions.
 */
export interface AIChartData {
  id: string;
  title: string;
  type: "bar" | "line" | "pie" | "doughnut";
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }>;
  aiFunction: keyof typeof CDBI_AI_CONSTANTS.AI_MODELS;
  // Future: link to a Gemini-generated visual dashboard
  geminiDashboardLink?: string;
}

/**
 * `AICoreService` is a self-contained, commercial-grade module responsible for
 * interacting with AI models (conceptually Gemini) to generate insights.
 * It's designed to be robust, handle errors, and provide structured outputs.
 * In a real-world scenario, this would abstract API calls to Gemini.
 */
export class AICoreService {
  private static instance: AICoreService;
  private endpoint: string;
  private models: typeof CDBI_AI_CONSTANTS.AI_MODELS;

  private constructor(
    endpoint: string,
    models: typeof CDBI_AI_CONSTANTS.AI_MODELS,
  ) {
    this.endpoint = endpoint;
    this.models = models;
  }

  public static getInstance(): AICoreService {
    if (!AICoreService.instance) {
      AICoreService.instance = new AICoreService(
        CDBI_AI_CONSTANTS.AI_SERVICE_ENDPOINT,
        CDBI_AI_CONSTANTS.AI_MODELS,
      );
    }
    return AICoreService.instance;
  }

  /**
   * Simulates an API call to an AI model to get insights for a given node.
   * This would typically involve a network request to a Gemini-powered backend.
   * @param node The data node for which to generate AI insights.
   * @param aiFunction The specific AI function/model to use.
   * @returns A promise resolving to AIInsights or null on error.
   */
  public async getInsightsForNode(
    node: Node,
    aiFunction: keyof typeof CDBI_AI_CONSTANTS.AI_MODELS,
  ): Promise<AIInsights | null> {
    console.log(
      `CDBI AI: Requesting insights for node ID: ${node.id} using model: ${this.models[aiFunction]} via Gemini.`,
    );

    // Simulate API call delay and AI processing
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 500 + 100),
    );

    try {
      // In a real application, this would be an actual API call, e.g.:
      // const response = await fetch(this.endpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ data: node, model: this.models[aiFunction] })
      // });
      // if (!response.ok) throw new Error(`AI service failed: ${response.statusText}`);
      // const result = await response.json();
      // return result.insights as AIInsights;

      // Mocked AI response for demonstration
      const mockInsights: AIInsights = {};

      switch (aiFunction) {
        case "PREDICTIVE_ANALYTICS":
          mockInsights.predictedRiskLevel =
            Math.random() > 0.8
              ? "Critical"
              : Math.random() > 0.6
                ? "High"
                : Math.random() > 0.3
                  ? "Medium"
                  : "Low";
          mockInsights.predictedRiskScore = parseFloat(Math.random().toFixed(2));
          mockInsights.confidenceScore = parseFloat((0.7 + Math.random() * 0.3).toFixed(2)); // High confidence for predictions
          break;
        case "ANOMALY_DETECTION":
          mockInsights.anomalyDetected = Math.random() > 0.9; // 10% chance of anomaly
          if (mockInsights.anomalyDetected) {
            mockInsights.anomalyDetails = `Unusual pattern detected in transaction value of $${(Math.random() * 10000).toFixed(2)}.`;
          }
          mockInsights.confidenceScore = parseFloat((0.8 + Math.random() * 0.2).toFixed(2)); // High confidence for anomaly detection
          break;
        case "SENTIMENT_ANALYSIS":
          const rand = Math.random();
          mockInsights.sentimentAnalysis =
            rand > 0.7 ? "Positive" : rand > 0.3 ? "Neutral" : "Negative";
          mockInsights.sentimentScore = parseFloat((rand * 2 - 1).toFixed(2)); // -1 to 1
          mockInsights.confidenceScore = parseFloat((0.6 + Math.random() * 0.4).toFixed(2));
          break;
        case "SUGGESTED_ACTIONS":
          mockInsights.suggestedAction =
            Math.random() > 0.7
              ? "Review transaction for fraud"
              : Math.random() > 0.4
                ? "Contact customer for verification"
                : "Approve for expedited processing";
          mockInsights.confidenceScore = parseFloat((0.75 + Math.random() * 0.25).toFixed(2));
          break;
        case "CONTEXTUAL_SUMMARIZATION":
          mockInsights.contextualSummary = `AI-generated summary of ${node.id}: This item represents a high-value payment likely associated with an international transfer. Further review indicated compliance adherence.`;
          mockInsights.confidenceScore = parseFloat((0.8 + Math.random() * 0.2).toFixed(2));
          break;
        default:
          break;
      }
      return mockInsights;
    } catch (error) {
      console.error(`CDBI AI Service Error for ${aiFunction}:`, error);
      trackEvent(null, {
        eventName: "CDBI_AI_SERVICE_ERROR",
        errorDetails: error instanceof Error ? error.message : String(error),
        aiFunction,
      });
      return null;
    }
  }
}

export type OverrideCustomColumnValue = {
  [key: string]: {
    default?: boolean;
    hidden?: boolean;
  };
};

/**
 * Computes the displayColumns to show based off the displayColumnIdsToFilter
 * and overrideCustomColumnValue. Extends to support AI-specific columns.
 */
function computeDisplayColumns(
  data: ResponseType,
  displayColumnIdsToFilter: string[] | undefined,
  graphqlField: string,
  overrideCustomColumnValue: OverrideCustomColumnValue,
  enableAIInsights: boolean,
): DisplayColumn[] {
  let baseColumns = data[graphqlField].displayColumns;

  if (!isEmpty(overrideCustomColumnValue)) {
    baseColumns = baseColumns.map((displayColumn) =>
      merge({}, displayColumn, {
        viewOptions: {
          listView: {
            default: !!get(overrideCustomColumnValue, [
              displayColumn.id,
              "default",
            ]),
          },
        },
      }),
    );
  }
  const idsToFilter = new Set(displayColumnIdsToFilter);
  let computedColumns = baseColumns.filter(
    (displayColumn) => !idsToFilter.has(displayColumn.id),
  );

  // Dynamically add AI insight columns if enabled
  if (enableAIInsights) {
    // Example: Add a Predicted Risk column
    computedColumns.push({
      id: "aiPredictedRisk",
      label: "AI Risk Level",
      type: AI_DisplayColumnTypeEnum.DisplayColumnTypesAIPredictedRisk,
      viewOptions: {
        listView: {
          label: "AI Risk Level",
          default: true,
        },
      },
      position: computedColumns.length + 1, // Place at the end
    });
    // Example: Add a Suggested Action column
    computedColumns.push({
      id: "aiSuggestedAction",
      label: "AI Action",
      type: AI_DisplayColumnTypeEnum.DisplayColumnTypesAISuggestedAction,
      viewOptions: {
        listView: {
          label: "AI Action",
          default: true,
        },
      },
      position: computedColumns.length + 1,
    });
    // Add more AI columns as needed, e.g., anomaly detection, sentiment.
  }

  return computedColumns;
}

/**
 * Computes the value from the graphql response based on the column display type.
 * Different values are rendered depending on the type defined on the display column.
 * This now includes AI-generated values.
 */
function computeValue(
  displayColumn: DisplayColumn,
  node: NodeWithAI,
): React.ReactNode {
  // Handle AI-specific column types first
  switch (displayColumn.type) {
    case AI_DisplayColumnTypeEnum.DisplayColumnTypesAIPredictedRisk:
      const risk = node.aiInsights?.predictedRiskLevel;
      const score = node.aiInsights?.predictedRiskScore;
      if (risk) {
        return (
          <Tag
            size="small"
            color={
              risk === "Critical"
                ? "red"
                : risk === "High"
                  ? "orange"
                  : risk === "Medium"
                    ? "yellow"
                    : "green"
            }
            icon={{
              iconName: risk === "Critical" ? Icons.Warning : Icons.Shield,
              size: "s",
            }}
          >
            {risk}
            {score !== undefined && ` (${(score * 100).toFixed(0)}%)`}
          </Tag>
        );
      }
      return <Tag size="small">N/A</Tag>;
    case AI_DisplayColumnTypeEnum.DisplayColumnTypesAISuggestedAction:
      const action = node.aiInsights?.suggestedAction;
      if (action) {
        return (
          <OverflowTip message={action}>
            <Pill className="ai-action-pill">{action}</Pill>
          </OverflowTip>
        );
      }
      return "No AI Action";
    case AI_DisplayColumnTypeEnum.DisplayColumnTypesAISentiment:
      const sentiment = node.aiInsights?.sentimentAnalysis;
      if (sentiment) {
        return (
          <Tag
            size="small"
            color={
              sentiment === "Positive"
                ? "green"
                : sentiment === "Negative"
                  ? "red"
                  : "blue"
            }
          >
            {sentiment}
          </Tag>
        );
      }
      return "No Sentiment";
    // General AI insight column, can display a generic message or specific details
    case AI_DisplayColumnTypeEnum.DisplayColumnTypesAIInsight:
      const insights = node.aiInsights;
      if (insights?.anomalyDetected) {
        return (
          <Tag size="small" color="red" icon={{ iconName: Icons.Alert, size: "s" }}>
            Anomaly!
          </Tag>
        );
      }
      if (insights?.contextualSummary) {
        return <OverflowTip message={insights.contextualSummary} />;
      }
      return "AI Processed";
  }

  // Existing logic for non-AI columns
  if (node?.[displayColumn.id] == null) {
    return null;
  }
  let content: React.ReactNode = null;
  let entityLabel: string;
  let tagIconsField: string | null;
  let tagColorsField: string | null;

  switch (displayColumn.type) {
    case DisplayColumnTypeEnum.DisplayColumnTypesAssociation:
      invariant(
        displayColumn.displayTypeOptions?.__typename === "AssociationOption",
      );

      if (
        displayColumn.displayTypeOptions?.associatedEntityLabelFieldType ===
        DisplayColumnOptions__AssociatedEntityLabelFieldTypeEnum.Object
      ) {
        content = (
          <Drawer
            trigger={
              <Pill className="associated-entity z-10" showTooltip={false}>
                {
                  get(node, [
                    displayColumn.displayTypeOptions.associatedEntityLabelField,
                  ]) as string
                }
              </Pill>
            }
            path={get(node, [displayColumn.id, "path"]) as string}
          >
            {getDrawerContent(
              get(node, [displayColumn.id, "typename"]) as string,
              get(node, [displayColumn.id, "id"]) as string,
            )}
          </Drawer>
        );
      } else {
        content = (
          <Drawer
            trigger={
              <Pill className="associated-entity z-10" showTooltip>
                {
                  get(node, [
                    displayColumn.id,
                    displayColumn.displayTypeOptions.associatedEntityLabelField,
                  ]) as string
                }
              </Pill>
            }
            path={get(node, [displayColumn.id, "path"]) as string}
          >
            {getDrawerContent(
              get(node, [displayColumn.id, "typename"]) as string,
              get(node, [displayColumn.id, "id"]) as string,
            )}
          </Drawer>
        );
      }
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesAssociationList:
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "AssociationListOption",
      );
      entityLabel = displayColumn.displayTypeOptions.associatedEntityLabelField;

      content = (get(node, [displayColumn.id]) as object[]).map((entity) => (
        <Drawer
          trigger={
            <div className="mr-1">
              <Pill className="associated-entity z-10" showTooltip>
                {get(entity, entityLabel) as string}
              </Pill>
            </div>
          }
          path={get(entity, ["path"]) as string}
        >
          {getDrawerContent(
            get(entity, ["typename"]) as string,
            get(entity, ["id"]) as string,
          )}
        </Drawer>
      ));
      break;
    case DisplayColumnTypeEnum.SharedTypesScalarsDateTimeType:
      content = <DateTime timestamp={node[displayColumn.id] as string} />;
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesToggled:
      content = node[displayColumn.id] ? "Enabled" : "Disabled";
      break;
    case DisplayColumnTypeEnum.GraphQlTypesBoolean:
      content = node[displayColumn.id] ? "True" : "False";
      break;
    case DisplayColumnTypeEnum.GraphQlTypesInt:
      content = (node[displayColumn.id] as number).toString();
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesAmount ||
      DisplayColumnTypeEnum.DisplayColumnTypesLongAmount:
      content = <Amount>{node[displayColumn.id] as string}</Amount>;
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesAmountDifference:
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "AmountDifferenceOption",
      );
      content = (
        <Amount
          difference={
            get(node, [
              displayColumn.displayTypeOptions
                .highlightAmountDifferenceField as string,
            ]) === true
          }
        >
          {node[displayColumn.id] as string}
        </Amount>
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesLongAmountDifference:
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "AmountDifferenceOption",
      );
      content = (
        <Amount
          difference={
            get(node, [
              displayColumn.displayTypeOptions
                .highlightAmountDifferenceField as string,
            ]) === true
          }
        >
          {node[displayColumn.id] as string}
        </Amount>
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesOrderedList:
      content = (
        <ol>
          {(node[displayColumn.id] as Array<string>).map((element) => (
            <li className="mb-1 mt-1 whitespace-nowrap first:mt-0 last:mb-0">
              <OverflowTip
                message={element}
                className="overflow-hidden overflow-ellipsis"
              >
                {element}
              </OverflowTip>
            </li>
          ))}
        </ol>
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesLongText:
      content = (
        <div className="text-xs">{node[displayColumn.id] as string}</div>
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesPolymorphicAssociation:
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "PolymorphicAssociationOption",
      );
      content = createPolymorphicAssociation(
        node,
        displayColumn.displayTypeOptions.associationPrefix,
        displayColumn.id,
        displayColumn.displayTypeOptions.drawerEnabled ?? false,
        displayColumn.displayTypeOptions.stackedDrawerEnabled ?? false,
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesCountdown:
      invariant(
        displayColumn.displayTypeOptions?.__typename === "CountdownOption",
      );
      content = (
        <Countdown
          type={
            (displayColumn.displayTypeOptions.countdownType as
              | "relative"
              | "timestamp") ?? "timestamp"
          }
          timestamp={node[displayColumn.id] as string}
        />
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesLabelWithCount:
      invariant(
        displayColumn.displayTypeOptions?.__typename === "LabelWithCountOption",
      );
      if ((node[displayColumn.displayTypeOptions.countField] as number) === 0) {
        if (displayColumn.displayTypeOptions.truncateMiddle) {
          content = (
            <div className="w-full pr-4">
              <div data-tip={node[displayColumn.id]}>
                <TruncateString text={node[displayColumn.id]} />
              </div>
              <ReactTooltip
                className="max-w-md text-wrap"
                data-place="top"
                data-effect="float"
                delayShow={200}
                multiline
              />
            </div>
          );
        } else {
          content = node[displayColumn.id] as string;
        }
      } else {
        content = (
          <span>
            {node[displayColumn.id]}
            {(node[displayColumn.displayTypeOptions.countField] as number) >
              0 && (
              <span>
                {" "}
                <span className="text-gray-400">
                  {
                    node[
                      displayColumn.displayTypeOptions.prettyCountField
                    ] as string
                  }
                </span>
              </span>
            )}
          </span>
        );
      }
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesTag:
      invariant(displayColumn.displayTypeOptions?.__typename === "TagOption");
      content = (
        <Tag
          size="small"
          color={
            displayColumn.displayTypeOptions.tagColorField
              ? (node[
                  displayColumn.displayTypeOptions.tagColorField
                ] as TagColors)
              : undefined
          }
          icon={
            displayColumn.displayTypeOptions.tagIconField &&
            node[displayColumn.displayTypeOptions.tagIconField]
              ? {
                  iconName: node[
                    displayColumn.displayTypeOptions.tagIconField
                  ] as Icons,
                  size: "s",
                }
              : undefined
          }
        >
          {node[displayColumn.id] as string}
        </Tag>
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesShortcode:
      content = <Shortcode>{node[displayColumn.id] as string}</Shortcode>;
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesTagList:
      invariant(
        displayColumn.displayTypeOptions?.__typename === "TagListOption",
      );
      tagColorsField = displayColumn.displayTypeOptions?.tagColorsField || null;
      tagIconsField = displayColumn.displayTypeOptions?.tagIconsField || null;
      content = (
        <div className="flex flex-wrap gap-y-2">
          {(node[displayColumn.id] as Array<string>).map((element, idx) => (
            <Tag
              className="mr-2"
              size="small"
              color={
                tagColorsField
                  ? (get(node, [tagColorsField, idx]) as TagColors)
                  : undefined
              }
              icon={
                tagIconsField && node[tagIconsField]
                  ? {
                      iconName: get(node, [tagIconsField, idx]) as Icons,
                      size: "s",
                    }
                  : undefined
              }
            >
              {element}
            </Tag>
          ))}
        </div>
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesStatusIndicator:
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "StatusIndicatorOption",
      );
      content = (
        <StatusIndicator
          currentStatus={
            displayColumn.displayTypeOptions.statusIndicatorCurrentStatusField
              ? (node[
                  displayColumn.displayTypeOptions
                    .statusIndicatorCurrentStatusField
                ] as StatusIndicatorStatuses)
              : "incomplete"
          }
          statusDescriptor={
            displayColumn.displayTypeOptions.statusIndicatorDescriptorField
              ? (node[
                  displayColumn.displayTypeOptions
                    .statusIndicatorDescriptorField
                ] as string)
              : ""
          }
          verbose={
            displayColumn.displayTypeOptions.statusIndicatorVerboseField
              ? (displayColumn.displayTypeOptions
                  .statusIndicatorVerboseField as boolean)
              : false
          }
        />
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesStatusIndicatorWithLabel:
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "StatusIndicatorOption",
      );
      content = (
        <div className="flex gap-1">
          <StatusIndicator
            currentStatus={
              displayColumn.displayTypeOptions.statusIndicatorCurrentStatusField
                ? (node[
                    displayColumn.displayTypeOptions
                      .statusIndicatorCurrentStatusField
                  ] as StatusIndicatorStatuses)
                : "incomplete"
            }
            statusDescriptor={
              displayColumn.displayTypeOptions.statusIndicatorDescriptorField
                ? (node[
                    displayColumn.displayTypeOptions
                      .statusIndicatorDescriptorField
                  ] as string)
                : ""
            }
            verbose={
              displayColumn.displayTypeOptions.statusIndicatorVerboseField
                ? (displayColumn.displayTypeOptions
                    .statusIndicatorVerboseField as boolean)
                : false
            }
          />
          {node[displayColumn.id] as string}
        </div>
      );
      break;
    case DisplayColumnTypeEnum.DisplayColumnTypesLink:
      invariant(displayColumn.displayTypeOptions?.__typename === "LinkOption");
      content = get(node, [
        displayColumn.displayTypeOptions.displayNameField,
      ]) as string;
      break;
    case DisplayColumnTypeEnum.TypesPaymentOrderPaymentSubtypeEnumType:
      content = (
        <Shortcode>
          {formatPaymentSubtype(node[displayColumn.id] as PaymentSubtypeEnum)}
        </Shortcode>
      );

      break;
    default:
      content = node[displayColumn.id] as string;
      break;
  }
  return content;
}

// This is necessary because IndexTable wraps cell contents with the OverflowTip component, and we want to style that
// component differently depending on the type of the display column.
const computeOverflowStyleMapping = (displayColumns: Array<DisplayColumn>) =>
  displayColumns.reduce<Record<string, string>>((acc, displayColumn) => {
    if (
      displayColumn.type === DisplayColumnTypeEnum.DisplayColumnTypesLongText
    ) {
      acc[displayColumn.id] = cn("line-clamp-3", "h-fit");

      if (displayColumn.displayTypeOptions) {
        invariant(
          displayColumn.displayTypeOptions.__typename === "LongTextOption",
        );
        acc[displayColumn.id] = cn(acc[displayColumn.id], {
          "whitespace-pre-wrap":
            displayColumn.displayTypeOptions.preserveWhitespace,
        });
      }
    } else {
      acc[displayColumn.id] = "truncate";
    }

    // Add AI column specific styles
    if (
      displayColumn.type === AI_DisplayColumnTypeEnum.DisplayColumnTypesAIPredictedRisk ||
      displayColumn.type === AI_DisplayColumnTypeEnum.DisplayColumnTypesAISuggestedAction ||
      displayColumn.type === AI_DisplayColumnTypeEnum.DisplayColumnTypesAISentiment
    ) {
      acc[displayColumn.id] = "flex items-center"; // Center tag/pill
    }

    return acc;
  }, {});

const computeStyleMapping = (
  styleMapping: Record<string, string>,
  displayColumns: Array<DisplayColumn>,
) => {
  const computedStyleMapping = { ...styleMapping };

  displayColumns.forEach((displayColumn) => {
    if (!computedStyleMapping[displayColumn.id]) {
      computedStyleMapping[displayColumn.id] = "";
    }
    const customLabel = displayColumn.viewOptions.listView?.label;
    // Tag is slightly taller than regular text, adjust padding
    // to account for that
    if (
      displayColumn.type === DisplayColumnTypeEnum.DisplayColumnTypesLongText
    ) {
      computedStyleMapping[displayColumn.id] += " basis-56";
    }
    if (
      displayColumn.type === DisplayColumnTypeEnum.DisplayColumnTypesShortText
    ) {
      computedStyleMapping[displayColumn.id] +=
        " scrollable-shorttext basis-10";
    }
    if (displayColumn.type === DisplayColumnTypeEnum.DisplayColumnTypesTag) {
      computedStyleMapping[displayColumn.id] += " !py-2 flex";
    }
    if (
      displayColumn.type ===
        DisplayColumnTypeEnum.DisplayColumnTypesAssociation ||
      displayColumn.type ===
        DisplayColumnTypeEnum.DisplayColumnTypesPolymorphicAssociation ||
      displayColumn.type ===
        DisplayColumnTypeEnum.DisplayColumnTypesAssociationList
    ) {
      computedStyleMapping[displayColumn.id] +=
        " scrollable-association basis-20 !py-1 !pt-2 items-start";
    }
    if (
      displayColumn.type ===
      DisplayColumnTypeEnum.DisplayColumnTypesAssociationList
    ) {
      computedStyleMapping[displayColumn.id] += " flex-wrap gap-y-2";
    }
    if (
      displayColumn.type ===
        DisplayColumnTypeEnum.DisplayColumnTypesShortcode ||
      displayColumn.type ===
        DisplayColumnTypeEnum.TypesPaymentOrderPaymentSubtypeEnumType
    ) {
      computedStyleMapping[displayColumn.id] += " basis-4 scrollable-shortcode";
    }
    if (
      displayColumn.type === DisplayColumnTypeEnum.DisplayColumnTypesAmount ||
      displayColumn.type ===
        DisplayColumnTypeEnum.DisplayColumnTypesAmountDifference
    ) {
      computedStyleMapping[displayColumn.id] +=
        " basis-8 justify-end scrollable-amount max-w-30";
    }
    if (
      displayColumn.type ===
        DisplayColumnTypeEnum.DisplayColumnTypesLongAmount ||
      displayColumn.type ===
        DisplayColumnTypeEnum.DisplayColumnTypesLongAmountDifference
    ) {
      computedStyleMapping[displayColumn.id] +=
        " basis-8 justify-end scrollable-amount max-w-36";
    }
    if (
      displayColumn.type ===
      DisplayColumnTypeEnum.DisplayColumnTypesStatusIndicatorWithLabel
    ) {
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "StatusIndicatorOption",
      );
      computedStyleMapping[displayColumn.id] +=
        " basis-8 scrollable-amount max-w-20";
    }
    if (
      displayColumn.type ===
      DisplayColumnTypeEnum.DisplayColumnTypesStatusIndicator
    ) {
      invariant(
        displayColumn.displayTypeOptions?.__typename ===
          "StatusIndicatorOption",
      );
      if (
        displayColumn?.displayTypeOptions?.statusIndicatorVerboseField ===
          true &&
        !customLabel
      ) {
        /** Magic number: widest-known Tag to-date in a ListView ("Needs Approval") */
        computedStyleMapping[displayColumn.id] +=
          " !min-w-[130px] !shrink-0 !pt-2.5 pb-1";
      } else if (
        !displayColumn?.displayTypeOptions?.statusIndicatorVerboseField &&
        customLabel
      ) {
        computedStyleMapping[displayColumn.id] +=
          " flex-none basis-16 scrollable-status";
      } else {
        computedStyleMapping[displayColumn.id] +=
          " flex-none basis-4 scrollable-status";
      }
    }
    if (
      displayColumn.type === DisplayColumnTypeEnum.SharedTypesScalarsDateType
    ) {
      computedStyleMapping[displayColumn.id] +=
        " basis-8 scrollable-amount max-w-28";
    }

    // AI-specific column styles
    if (
      displayColumn.type === AI_DisplayColumnTypeEnum.DisplayColumnTypesAIPredictedRisk ||
      displayColumn.type === AI_DisplayColumnTypeEnum.DisplayColumnTypesAISuggestedAction ||
      displayColumn.type === AI_DisplayColumnTypeEnum.DisplayColumnTypesAISentiment
    ) {
      computedStyleMapping[displayColumn.id] += " basis-24 min-w-[100px] flex justify-center items-center";
    }
  });
  return computedStyleMapping;
};

type FormatDataType<D> = {
  path?: string;
  metadataJson?: Record<string, string>;
} & D;

/**
 * Formats the raw data from GraphQL into a structure consumable by the table,
 * now including a placeholder for AI insights.
 */
function formatData<D extends Record<string, unknown>>(
  data: ResponseType,
  graphqlField: string,
  displayColumns: Array<DisplayColumn>,
  hasNesting?: (node: Node) => boolean,
  computeValueOverride?: {
    [key: string]: (
      displayColumn: DisplayColumn,
      node: NodeWithAI,
    ) => string | JSX.Element;
  },
  pathOverride?: (node: Node) => string,
): Array<FormatDataType<D>> {
  return data[graphqlField].edges.map<FormatDataType<D>>(({ node }) => ({
    id: node.id,
    typename: node.typename,
    path: pathOverride ? pathOverride(node) : node.path,
    metadataJson: node.metadataJson,
    hasNesting: hasNesting && hasNesting(node),
    // Placeholder for AI insights - will be populated by a separate useEffect
    aiInsights: undefined,
    ...displayColumns.reduce<D>(
      (acc, displayColumn) => ({
        ...acc,
        // computeValue now expects NodeWithAI, but at this stage, aiInsights might be undefined.
        // It's populated later in `processNodesWithAI`.
        [displayColumn.id]: computeValueOverride?.[displayColumn.id]
          ? computeValueOverride?.[displayColumn.id](displayColumn, node as NodeWithAI)
          : computeValue(displayColumn, node as NodeWithAI),
      }),
      {} as D,
    ),
  }));
}

async function getNestedData<D extends Record<string, unknown>>(
  client: ApolloClient<object>,
  nestingDocument: DocumentNode,
  nestedRecords: Array<D> = [],
  nestedPaginationInfo: PageInfo | null,
  query: Record<string, unknown>,
  id: string,
  action: NestingDataActions,
  nestingGraphqlField: string,
  displayColumns: Array<DisplayColumn>,
  mapQueryToNestingVariables: (
    query: Record<string, unknown>,
  ) => Record<string, unknown>,
  constantQueryVariables = {},
  hasNesting?: (node: Node) => boolean,
  pathOverride?: (node: Node) => string,
  computeValueOverride?: {
    [key: string]: (
      displayColumn: DisplayColumn,
      node: NodeWithAI,
    ) => string | JSX.Element;
  },
): Promise<{
  updatedNestedRecords: Array<D>;
  updatedNestedPaginationInfo: PageInfo | null;
}> {
  let updatedNestedRecords: Array<D> = [];
  let updatedNestedPaginationInfo: PageInfo | null = null;
  if (action === NestingDataActions.ResetData) {
    return {
      updatedNestedRecords,
      updatedNestedPaginationInfo,
    };
  }

  const response: ApolloQueryResult<unknown> = await client.query({
    query: nestingDocument,
    variables: {
      id,
      ...mapQueryToNestingVariables(query),
      ...{ first: 10, after: nestedPaginationInfo?.endCursor },
      ...constantQueryVariables,
    },
  });
  const responseData = response.data as ResponseType;

  const { pageInfo } = responseData[nestingGraphqlField];
  updatedNestedPaginationInfo = pageInfo;

  updatedNestedRecords = nestedRecords.concat(
    formatData(
      responseData,
      nestingGraphqlField,
      displayColumns,
      hasNesting,
      computeValueOverride,
      pathOverride,
    ),
  );

  return {
    updatedNestedRecords,
    updatedNestedPaginationInfo,
  };
}

export type Node = {
  id: string;
  path?: string;
  metadataJson: Record<string, string>;
  hasNesting: boolean;
  [key: string]: unknown;
};

type ResponseType = {
  [key: string]: {
    displayColumns: Array<DisplayColumn>;
    edges: Array<{ node: Node }>;
    pageInfo: PageInfo;
  };
};

interface ListViewProps<Q extends Record<string, unknown>>
  extends UIContainerProps {
  computeValueOverride?: {
    [key: string]: (
      displayColumn: DisplayColumn,
      node: NodeWithAI, // Updated to NodeWithAI
    ) => string | JSX.Element;
  };
  constantQueryVariables?: Record<string, unknown>;
  customizableColumns?: boolean;
  displayColumnIdsToFilter?: string[];
  filterActionExcludedRow?: (node: Record<string, unknown>) => boolean;
  graphqlDocument: DocumentNode;
  hasNesting?: (node: Node) => boolean;
  ListViewEmptyState?: JSX.Element;
  mapQueryToNestingVariables?: (
    query: Record<string, unknown>,
  ) => Record<string, unknown>;
  mapQueryToVariables?: (query: Q) => Record<string, unknown>;
  nestingDocument?: DocumentNode;
  nestingResource?: ResourcesEnum;
  onDataChange?: (
    query: Record<string, unknown>,
    data?: Record<string, unknown>,
  ) => void;
  onQueryArgChangeCallback?: (query: Record<string, unknown>) => void;
  pathOverride?: (node: Node) => string;
  resource: ResourcesEnum;
  styleMapping?: Record<string, string>;
  enableNewFilters?: boolean;
  legacyFilterMappers?: {
    queryToFilters: (query: Record<string, unknown>) => Record<string, unknown>;
    queryToGraphqlArguments: (
      query: Record<string, unknown>,
    ) => Record<string, unknown>;
    filtersToLegacyFormat?: (
      query: Record<string, unknown>,
    ) => Record<string, unknown>;
  };
  overrideFilterValue?: OverrideValue;
  refetch?: number | null;
  customViewName?: string;
  overrideCustomColumnValue?: OverrideCustomColumnValue;
  setSelectEverythingCallback?: (selectEverything: boolean) => void;
  totalCount?: number;
  // --- New AI Props ---
  enableAIInsights?: boolean;
  aiFunctionsToApply?: Array<keyof typeof CDBI_AI_CONSTANTS.AI_MODELS>;
  // Optional prop to pass custom AI service instance
  aiCoreService?: AICoreService;
}

const onQuerySuccess = (
  setLoading: (loading: boolean) => void,
  onDataChange:
    | ((
        query: Record<string, unknown>,
        data?: Record<string, unknown> | undefined,
      ) => void)
    | undefined,
  graphqlField: string,
  setData: (data: Record<string, unknown> | undefined) => void,
  setFavorites: (favorites: Set<string>) => void,
  resultData: ResponseType,
  variables: Record<string, unknown>,
) => {
  if (onDataChange) {
    onDataChange(variables, resultData);
  }
  const updatedFavoriteIds = resultData[graphqlField]?.edges
    .filter(({ node }) => node.favorited)
    .map(({ node }) => node.id);

  setData(resultData as Record<string, unknown> | undefined);
  setFavorites(new Set([...updatedFavoriteIds]));
  setLoading(false);
};

/**
 * This is used for initial list view query loads to generate a observable
 * object that ApolloCache will subscribe to. We don't want to use this for
 * refetch because we don't need additional subscribers to the query. We want
 * to make this observable to ensure that refetchQueries and other updates to
 * the cache are reflected on the screen without requiring a hard reload.
 */

const executeObservableQuery = (
  setLoading: (loading: boolean) => void,
  setError: (error: ApolloError | undefined) => void,
  onDataChange:
    | ((
        query: Record<string, unknown>,
        data?: Record<string, unknown> | undefined,
      ) => void)
    | undefined,
  client: ApolloClient<unknown>,
  graphqlDocument:
    | DocumentNode
    | TypedDocumentNode<unknown, Record<string, unknown>>,
  graphqlField: string,
  setData: (data: Record<string, unknown> | undefined) => void,
  setFavorites: (favorites: Set<string>) => void,
  fetchPolicy: FetchPolicy,
  variables: Record<string, unknown>,
) => {
  setLoading(true);
  setError(undefined);
  const querySubscription = client
    .watchQuery({
      query: graphqlDocument,
      variables,
      fetchPolicy,
    })
    .subscribe({
      next: (result) => {
        onQuerySuccess(
          setLoading,
          onDataChange,
          graphqlField,
          setData,
          setFavorites,
          result.data as ResponseType,
          variables,
        );
      },
      error: (err: ApolloError) => {
        setError(err);
      },
    });

  return querySubscription;
};

/**
 * Normally we want to use Apollo's provided hooks, however this leads
 * to unforeseen bugs specifically dealing with loading states. When using hooks,
 * the `notifyOnNetworkStatusChange` updates the `loading` value whenever a graphql
 * query is executing. For some reason this would cause an infinite loop causing
 * this query to continuously re-execute. Calling the query manually allows us to
 * have more control over the loading variable and avoid this bug.
 */
const executeQuery = async (
  setLoading: (loading: boolean) => void,
  setError: (error: ApolloError | undefined) => void,
  onDataChange:
    | ((
        query: Record<string, unknown>,
        data?: Record<string, unknown> | undefined,
      ) => void)
    | undefined,
  client: ApolloClient<unknown>,
  graphqlDocument:
    | DocumentNode
    | TypedDocumentNode<unknown, Record<string, unknown>>,
  graphqlField: string,
  setData: (data: Record<string, unknown> | undefined) => void,
  setFavorites: (favorites: Set<string>) => void,
  fetchPolicy: FetchPolicy,
  variables: Record<string, unknown>,
) => {
  setLoading(true);
  setError(undefined);
  const {
    data: responseData,
    error: responseError,
  }: ApolloQueryResult<unknown> = await client.query({
    query: graphqlDocument,
    variables,
    fetchPolicy,
  });
  onQuerySuccess(
    setLoading,
    onDataChange,
    graphqlField,
    setData,
    setFavorites,
    responseData as ResponseType,
    variables,
  );

  setError(responseError);
};

/**
 * Declare the debounced query outside the component scope to prevent
 * re-creating the debounced function on every render.
 */
const debouncedExecuteQuery = debounce(executeQuery, 300, {
  leading: false,
  trailing: true,
});

/**
 * Renders a list of records.
 * Expects a graphql query function which implements a generated "List" fragment.
 * The fragment contains all information required to render the list of records.
 * This enhanced ListView now integrates AI-powered insights, KPIs, and charts.
 */
function ListView<
  Q extends Record<string, unknown>,
  D extends Record<string, unknown> = Record<string, unknown>, // Default D to avoid issues
>({
  className,
  computeValueOverride,
  constantQueryParams,
  constantQueryVariables = {},
  customizableColumns = true,
  displayColumnIdsToFilter,
  draggableMutation = false,
  filterActionExcludedRow,
  graphqlDocument,
  hasNesting,
  ListViewEmptyState,
  mapQueryToNestingVariables = (query) => query,
  mapQueryToVariables = (query) => query,
  nestingDocument,
  nestingResource,
  onDataChange,
  onQueryArgChangeCallback,
  pathOverride,
  resource,
  styleMapping = {},
  initialQuery = {},
  enableNewFilters = false,
  legacyFilterMappers,
  overrideFilterValue = {},
  refetch,
  customViewName,
  filterIdsToRemove,
  overrideCustomColumnValue = {},
  setSelectEverythingCallback,
  totalCount,
  // New AI props
  enableAIInsights = false,
  aiFunctionsToApply = [
    "PREDICTIVE_ANALYTICS",
    "ANOMALY_DETECTION",
    "SUGGESTED_ACTIONS",
    "SENTIMENT_ANALYSIS",
  ],
  aiCoreService: customAICoreService,
  ...props
}: ListViewProps<Q> & SharedEntityTableViewProps<D>) {
  const {
    ui: { isGhosting },
  } = Gon.gon;

  const [data, setData] = useState<Record<string, unknown> | undefined>(
    undefined,
  );
  const [error, setError] = useState<ApolloError | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [nestedRecords, setNestedRecords] = useState<Record<string, Array<D>>>(
    {},
  );
  const [isNestedRecordsLoading, setIsNestedRecordsLoading] = useState<
    Record<string, boolean>
  >({});
  const [nestedPaginationInfo, setNestedPaginationInfo] = useState<
    Record<string, PageInfo | null>
  >({});
  const client = useApolloClient();
  const [getFilters] = useQueryParams();

  const { view, loading: viewLoading } = useView(
    customViewName || `${resource}_list_view`,
  );
  const [favorites, setFavorites] = useState<Set<string>>();

  const graphqlField = RESOURCES[resource].graphql_fields?.list_view;

  const {
    data: filtersData,
    loading: filtersLoading,
    error: filtersError,
  } = useListViewFiltersQuery({
    skip: !enableNewFilters,
    variables: {
      resource: resource as ResourceEnum,
    },
  });

  const filters =
    !filtersLoading &&
    !filtersError &&
    filtersData &&
    mapLogicalFieldsToFilters(
      filtersData.logicalFormFields,
      overrideFilterValue,
    );

  // If specifying to refetch manually, bypass cache
  const fetchPolicy = refetch !== undefined ? "network-only" : "cache-first";
  const scopedParamName = getScopedParamName(resource);

  const stringifiedVariables = JSON.stringify(constantQueryVariables);
  const stringifiedParams = JSON.stringify(constantQueryParams);

  // --- AI State Management and Services ---
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiKPIs, setAiKPIs] = useState<AIInsightKPI[]>([]);
  const [aiChartData, setAiChartData] = useState<AIChartData[]>([]);
  const [recordsWithAI, setRecordsWithAI] = useState<Array<FormatDataType<D>>>(
    [],
  );

  const aiService = useMemo(
    () => customAICoreService || AICoreService.getInstance(),
    [customAICoreService],
  );

  // Effect to fetch and process AI insights for records
  useEffect(() => {
    if (!enableAIInsights || loading || !data?.[graphqlField]) {
      setRecordsWithAI([]); // Clear AI records if AI is disabled or data not loaded
      setAiKPIs([]);
      setAiChartData([]);
      return;
    }

    const processAIInsights = async () => {
      setAiInsightsLoading(true);
      const currentRecords = records; // Get the raw records before AI enrichment
      const processedRecords: Array<FormatDataType<D>> = [];
      const allInsights: AIInsights[] = [];

      for (const record of currentRecords) {
        const nodeAsAI = record as NodeWithAI;
        const newInsights: AIInsights = {};
        for (const func of aiFunctionsToApply) {
          const insights = await aiService.getInsightsForNode(
            nodeAsAI,
            func,
          );
          if (insights) {
            Object.assign(newInsights, insights);
          }
        }
        processedRecords.push({ ...record, aiInsights: newInsights });
        allInsights.push(newInsights);
      }
      setRecordsWithAI(processedRecords);
      generateAIAnalytics(allInsights);
      setAiInsightsLoading(false);
    };

    const generateAIAnalytics = (allInsights: AIInsights[]) => {
      const kpis: AIInsightKPI[] = [];
      const charts: AIChartData[] = [];

      // KPI: Average Predicted Risk Score
      const totalRiskScore = allInsights.reduce(
        (sum, insight) => sum + (insight.predictedRiskScore || 0),
        0,
      );
      if (allInsights.length > 0 && aiFunctionsToApply.includes("PREDICTIVE_ANALYTICS")) {
        const avgRisk = (totalRiskScore / allInsights.length) * 100;
        kpis.push({
          id: "avgPredictedRisk",
          label: "Avg. AI Risk Score",
          value: `${avgRisk.toFixed(1)}%`,
          description: "Average risk score predicted by CDBI AI for current list items. Higher is riskier.",
          trend: avgRisk > 50 ? "up" : "down", // Simple trend for demo
          unit: "%",
          aiFunction: "PREDICTIVE_ANALYTICS",
          geminiReportLink: `${CDBI_AI_CONSTANTS.GEMINI_INTEGRATION_URL}/reports/risk-summary?resource=${resource}`,
        });
      }

      // KPI: Anomaly Count
      const anomalyCount = allInsights.filter(
        (insight) => insight.anomalyDetected,
      ).length;
      if (aiFunctionsToApply.includes("ANOMALY_DETECTION")) {
        kpis.push({
          id: "anomalyCount",
          label: "AI Anomalies Detected",
          value: anomalyCount,
          description: "Number of anomalies identified by CDBI AI in the current data set.",
          trend: anomalyCount > 0 ? "up" : "flat",
          unit: "items",
          aiFunction: "ANOMALY_DETECTION",
          geminiReportLink: `${CDBI_AI_CONSTANTS.GEMINI_INTEGRATION_URL}/dashboards/anomaly-trends?resource=${resource}`,
        });
      }

      // Chart: Predicted Risk Level Distribution
      if (aiFunctionsToApply.includes("PREDICTIVE_ANALYTICS")) {
        const riskLevels = allInsights.reduce(
          (acc, insight) => {
            const level = insight.predictedRiskLevel || "Unknown";
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        charts.push({
          id: "riskDistributionChart",
          title: "AI Predicted Risk Distribution",
          type: "bar",
          labels: Object.keys(riskLevels),
          datasets: [
            {
              label: "Count",
              data: Object.values(riskLevels),
              backgroundColor: ["#ef4444", "#f97316", "#facc15", "#22c55e", "#94a3b8"], // red, orange, yellow, green, gray
              borderColor: ["#dc2626", "#ea580c", "#eab308", "#16a34a", "#64748b"],
              borderWidth: 1,
            },
          ],
          aiFunction: "PREDICTIVE_ANALYTICS",
          geminiDashboardLink: `${CDBI_AI_CONSTANTS.GEMINI_INTEGRATION_URL}/visuals/risk-breakdown?resource=${resource}`,
        });
      }

      // Chart: Sentiment Analysis Distribution (if applicable)
      if (aiFunctionsToApply.includes("SENTIMENT_ANALYSIS")) {
        const sentiments = allInsights.reduce(
          (acc, insight) => {
            const sentiment = insight.sentimentAnalysis || "Neutral";
            acc[sentiment] = (acc[sentiment] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        charts.push({
          id: "sentimentDistributionChart",
          title: "AI Sentiment Distribution",
          type: "pie",
          labels: Object.keys(sentiments),
          datasets: [
            {
              label: "Count",
              data: Object.values(sentiments),
              backgroundColor: ["#22c55e", "#94a3b8", "#ef4444"], // green, gray, red
              borderColor: ["#16a34a", "#64748b", "#dc2626"],
              borderWidth: 1,
            },
          ],
          aiFunction: "SENTIMENT_ANALYSIS",
          geminiDashboardLink: `${CDBI_AI_CONSTANTS.GEMINI_INTEGRATION_URL}/visuals/sentiment-breakdown?resource=${resource}`,
        });
      }

      setAiKPIs(kpis);
      setAiChartData(charts);
    };

    // Trigger AI processing
    const timeoutId = setTimeout(processAIInsights, 100); // Debounce AI processing slightly
    return () => clearTimeout(timeoutId);
    // Rerun when records change, or AI features/functions change
  }, [
    enableAIInsights,
    loading,
    data,
    graphqlField,
    records, // This `records` variable is critical for AI processing
    aiService,
    JSON.stringify(aiFunctionsToApply),
    resource, // For KPI/Chart links
  ]);

  useEffect(() => {
    if (!isGhosting && enableNewFilters && !view) {
      return undefined;
    }
    const parsedQuery = parseQuery<Record<string, unknown>>(scopedParamName);
    const query = {
      ...parsedQuery,
      ...(isEmptyQuery(parsedQuery, constantQueryParams ?? [])
        ? initialQuery
        : {}),
    };

    const paginationParams = cursorPaginationParamsFn(
      null,
      query,
      {
        page: query.page || INITIAL_PAGINATION.page,
        perPage: query.perPage || INITIAL_PAGINATION.perPage,
      },
      query.paginationDirection,
    );

    const defaultFilters = Object.keys(overrideFilterValue).reduce(
      (acc, filterId) => {
        if (overrideFilterValue[filterId].default) {
          return {
            ...acc,
            [filterId]: overrideFilterValue[filterId].value,
          };
        }
        return acc;
      },
      {},
    );

    let parsedFiltersFromUrl = enableNewFilters
      ? mapQueryToVariables(getFilters(resource) as Q)
      : {};
    if (legacyFilterMappers) {
      parsedFiltersFromUrl = omitBy(
        {
          ...legacyFilterMappers.queryToGraphqlArguments(query as Q),
          ...parsedFiltersFromUrl,
        },
        isNil,
      );
    }

    let filtersToApply = {};
    if (!isEmpty(parsedFiltersFromUrl)) {
      filtersToApply = parsedFiltersFromUrl;
    } else {
      filtersToApply = mapQueryToVariables(defaultFilters as Q);
    }

    const args = {
      ...omitBy(mapQueryToVariables(query as Q), isNil),
      ...omitBy(filtersToApply, isNil),
      orderBy: JSON.stringify(query.orderBy),
      favoritesOnly: JSON.parse(
        (query.favoritesOnly || "false") as string,
      ) as boolean,
      ...constantQueryVariables,
      ...paginationParams,
    };

    const subscription = executeObservableQuery(
      setLoading,
      setError,
      onDataChange,
      client,
      graphqlDocument,
      graphqlField,
      setData,
      setFavorites,
      fetchPolicy,
      args,
    );

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, stringifiedVariables, stringifiedParams, view, refetch]);

  const handleRefetch = async (
    options: {
      cursorPaginationParams: CursorPaginationInput;
      query: Q;
    },
    debounceQuery,
  ) => {
    setNestedPaginationInfo({});
    setNestedRecords({});
    const { cursorPaginationParams, query } = options;

    let parsedFiltersFromUrl = enableNewFilters
      ? mapQueryToVariables(getFilters(resource) as Q)
      : {};
    if (legacyFilterMappers) {
      parsedFiltersFromUrl = {
        ...legacyFilterMappers.queryToGraphqlArguments(query),
        ...parsedFiltersFromUrl,
      };
    }
    const queryFn = debounceQuery ? debouncedExecuteQuery : executeQuery;

    const queryArgs = {
      ...mapQueryToVariables(query),
      ...parsedFiltersFromUrl,
      orderBy: JSON.stringify(query.orderBy),
      favoritesOnly: JSON.parse(
        (query.favoritesOnly || "false") as string,
      ) as boolean,
      ...cursorPaginationParams,
      ...constantQueryVariables,
    };

    await queryFn(
      setLoading,
      setError,
      onDataChange,
      client,
      graphqlDocument,
      graphqlField,
      setData,
      setFavorites,
      fetchPolicy,
      {
        ...queryArgs,
      },
    );

    if (onQueryArgChangeCallback) {
      onQueryArgChangeCallback(queryArgs);
    }
  };

  invariant(
    graphqlField,
    `The resource you passed to <ListView /> (${resource}) has no corresponding graphql field for this component. Did you forget to update resources.rb?`,
  );
  const waitingForData = loading || !data?.[graphqlField] || error;

  const displayColumns = waitingForData
    ? []
    : computeDisplayColumns(
        data as ResponseType,
        displayColumnIdsToFilter,
        graphqlField,
        overrideCustomColumnValue,
        enableAIInsights, // Pass AI flag
      );

  // If AI insights are enabled, use `recordsWithAI`, otherwise use the raw formatted data
  const records: Array<FormatDataType<D>> = useMemo(() => {
    if (waitingForData) return [];
    const formatted = formatData(
      data as ResponseType,
      graphqlField,
      displayColumns,
      hasNesting,
      computeValueOverride,
      pathOverride,
    );
    return enableAIInsights && recordsWithAI.length > 0 && formatted.length === recordsWithAI.length
      ? recordsWithAI
      : formatted;
  }, [
    waitingForData,
    data,
    graphqlField,
    displayColumns,
    hasNesting,
    computeValueOverride,
    pathOverride,
    enableAIInsights,
    recordsWithAI,
  ]);

  const handleNestedRefetch = async (
    query: Record<string, unknown>,
    id: string,
    action: NestingDataActions,
  ) => {
    if (!nestingDocument) return;

    setIsNestedRecordsLoading({
      ...isNestedRecordsLoading,
      [id]: true,
    });

    const { updatedNestedRecords, updatedNestedPaginationInfo } =
      await getNestedData(
        client,
        nestingDocument,
        nestedRecords[id],
        nestedPaginationInfo[id],
        query,
        id,
        action,
        nestingResource !== undefined
          ? RESOURCES[nestingResource]?.graphql_fields?.list_view
          : "",
        displayColumns,
        mapQueryToNestingVariables,
        constantQueryVariables,
        hasNesting,
        pathOverride,
        computeValueOverride,
      );

    setIsNestedRecordsLoading({
      ...isNestedRecordsLoading,
      [id]: false,
    });

    setNestedRecords({
      ...nestedRecords,
      [id]: updatedNestedRecords,
    });

    setNestedPaginationInfo({
      ...nestedPaginationInfo,
      [id]: updatedNestedPaginationInfo,
    });
  };

  const hasMoreNestedData = (id: string) =>
    nestedPaginationInfo[id]?.hasNextPage || false;

  if (
    ListViewEmptyState &&
    !loading &&
    records.length === 0 &&
    isEmptyQuery(
      parseQuery<Record<string, unknown>>(scopedParamName),
      constantQueryParams ?? [],
    )
  ) {
    return <div>{ListViewEmptyState}</div>;
  }

  const actionExcludedRows: string[] =
    waitingForData || typeof filterActionExcludedRow !== "function"
      ? []
      : (data as ResponseType)[graphqlField]?.edges.reduce<Array<string>>(
          (acc, { node }) => {
            if (filterActionExcludedRow(node)) {
              return [...acc, node.id];
            }
            return acc;
          },
          [],
        );

  const draggableRefetchQuery = () =>
    client.query({
      query: graphqlDocument,
      variables: constantQueryVariables,
      fetchPolicy: "network-only",
    });

  return (
    <div className="cdbi-ai-list-view-container">
      {enableAIInsights && !waitingForData && (
        <div className="cdbi-ai-insights-dashboard p-4 bg-cdbi-ai-light-blue rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-bold text-cdbi-ai-dark-blue mb-4">
            CDBI AI Insights Dashboard{" "}
            {aiInsightsLoading && (
              <span className="text-sm text-gray-500">(Processing...)</span>
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {aiKPIs.map((kpi) => (
              <a
                key={kpi.id}
                href={kpi.geminiReportLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <KPIIndicator
                  label={kpi.label}
                  value={kpi.value}
                  description={kpi.description}
                  trend={kpi.trend}
                  unit={kpi.unit}
                  isLoading={aiInsightsLoading}
                  className="bg-cdbi-ai-white p-3 rounded-md shadow-sm hover:shadow-lg transition-shadow duration-200"
                />
              </a>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiChartData.map((chart) => (
              <div
                key={chart.id}
                className="bg-cdbi-ai-white p-4 rounded-md shadow-sm flex flex-col justify-between"
              >
                <h4 className="font-semibold text-lg mb-3">{chart.title}</h4>
                <div className="flex-grow">
                  <Chart
                    type={chart.type}
                    data={{ labels: chart.labels, datasets: chart.datasets }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                    isLoading={aiInsightsLoading}
                  />
                </div>
                <a
                  href={chart.geminiDashboardLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-sm text-cdbi-ai-primary hover:underline self-end"
                >
                  View full AI dashboard on Gemini &rarr;
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <EntityTableView
        {...props}
        actionExcludedRows={actionExcludedRows}
        className={className}
        cursorPagination={{
          ...(data as ResponseType)?.[graphqlField]?.pageInfo,
        }}
        customizableColumns={customizableColumns}
        data={records}
        displayColumns={displayColumns}
        draggableMutation={draggableMutation}
        draggableRefetch={draggableRefetchQuery}
        enableNewFilters={enableNewFilters}
        favorites={favorites}
        filters={(filters as FilterType[]) || undefined}
        filtersLoading={filtersLoading}
        filtersToLegacyFormat={legacyFilterMappers?.filtersToLegacyFormat}
        hasMoreNestedData={hasMoreNestedData}
        initialQuery={initialQuery}
        isNestedDataLoading={isNestedRecordsLoading}
        legacyQueryToFilters={legacyFilterMappers?.queryToFilters}
        loading={loading || viewLoading || aiInsightsLoading} // AI loading impacts overall loading
        nestedData={nestedRecords}
        onNestedQueryArgChange={handleNestedRefetch}
        onQueryArgChange={handleRefetch}
        onSortChange={(columnName) => {
          const eventName = `${resource}_sorted_on_${columnName}`.toUpperCase();
          trackEvent(null, TABLE_SORT_ACTIONS[eventName]);
        }}
        renderDrawerContent={getDrawerContent}
        renderSource={RenderSource.ListView}
        filterIdsToRemove={filterIdsToRemove}
        resource={resource}
        scopedParamName={scopedParamName}
        styleMapping={computeStyleMapping(styleMapping, displayColumns)}
        usingPersistedViews={!isGhosting}
        view={view || undefined}
        nestingResource={nestingResource}
        setSelectEverythingCallback={setSelectEverythingCallback}
        totalCount={totalCount}
        overflowStyleMapping={computeOverflowStyleMapping(displayColumns)}
      />
    </div>
  );
}
export default ListView;