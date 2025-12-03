// Copyright CDBI AI Solutions Inc. - All Rights Reserved.
// Proprietary and Confidential. Unauthorized copying or distribution is prohibited.

import React, { useState, useEffect, useCallback, useMemo } from "react";
import useGetMetadataKeys from "../../common/utilities/useGetMetadataKeys";
import {
  RESOURCES,
  ResourcesEnum,
} from "../../generated/dashboard/types/resources";
import KeyValueInput from "./KeyValueInput";

export type LegacyMetadata = Array<{ key: string; value: string }>;

/* Converts the array returned from `metadata_keys_and_values` to a simple hash */
export const formatLegacyMetadata = (metadata: Record<string, string>) =>
  Object.keys(metadata).reduce<Array<{ key: string; value: string }>>(
    (acc, key) => {
      acc.push({
        key,
        value: metadata[key],
      });
      return acc;
    },
    [],
  );

/* Converts a simple hash to an array compatible with `metadata_keys_and_values` */
export const parseLegacyMetadata = (metadata: LegacyMetadata | null) =>
  metadata
    ? metadata.reduce(
        (acc, value) => ({ ...acc, [value.key]: value.value }),
        {},
      )
    : {}; // Changed `[]` to `{}` for consistency with `Record<string, string>` return type.

interface Props {
  /** When true, allows users to submit an empty metadata form */
  allowNoEntries?: boolean;
  /** When true, both keys and values must be non empty for the pair to be added as form data */
  completedValuesAndKeys?: boolean;
  /** When true, the component is disabled */
  disabled?: boolean;
  /** When true, hides the 'Metadata' Label */
  hideLabel?: boolean;
  /** Initial k,v pairs to display */
  initialValues?: Record<string, string>;
  /** Uses inline icon for adding new metadata fields rather than default button */
  inlineAddButton?: boolean;
  /** When true, the key and value input fields appear on different rows */
  multiLines?: boolean;
  /** When true, an empty k,v pair appears underneath the k,v pairs from initial values */
  noInitialEmptyEntry?: boolean;
  /** Function that fires when user types a character. */
  onChange: (metadata: Record<string, string>) => void;
  /** Underlying backend model used to fetch existing metadata keys from */
  resource: ResourcesEnum;
  /** When true, the metadata key/value pair will always be removed when x is pressed.
   * Otherwise, the pair is only removed if the key is not in the initial values
   */
  alwaysDeleteOnRemove?: boolean;
}

const SUGGESTION_LIST_SIZE = 10;

// --- New AI-Powered Enhancements for CDBI Platform ---

/**
 * Represents an AI-driven metadata suggestion.
 * Can be a key or a value suggestion.
 */
export interface AISuggestion {
  value: string;
  label?: string; // Human-readable label for the suggestion
  category?: string; // AI-assigned category for the suggestion
  confidence?: number; // AI confidence score (0.0 - 1.0)
  source?: 'CDBI_AI' | 'USER_DEFINED' | 'SYSTEM_DEFAULT'; // Origin of the suggestion
}

/**
 * Represents AI-driven insights and KPIs for metadata.
 */
export interface AIMetadataInsights {
  completenessScore: number; // 0-100, how complete the metadata is for the resource
  consistencyIndex: number; // 0-100, how consistent the metadata keys/values are
  aiCategorization: Record<string, string>; // AI-assigned categories for the entire metadata set
  optimizationRecommendations: string[]; // List of AI-suggested improvements
  sentimentAnalysis?: Record<string, 'positive' | 'negative' | 'neutral' | 'mixed'>; // Sentiment for metadata values
  complianceScore?: number; // 0-100, how well metadata adheres to CDBI's internal compliance policies
  auditRiskScore?: number; // 0-100, AI-predicted risk of audit flags based on metadata patterns
}

/**
 * A mocked AI service hook for CDBI's advanced metadata operations.
 * This simulates interaction with a powerful backend AI model.
 */
export function useAICDBIMetadataService() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAISuggestions = useCallback(async (
    resource: ResourcesEnum,
    existingMetadata: Record<string, string>,
    currentKeyInput: string,
    currentValueInput: string | null = null,
  ): Promise<AISuggestion[]> => {
    setAiLoading(true);
    setAiError(null);
    try {
      // Simulate an AI API call
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000)); // Simulate network latency

      const suggestions: AISuggestion[] = [];

      // AI-powered Key Suggestions
      if (!currentValueInput) { // If only key is being typed
        const commonKeys: string[] = ['transactionType', 'customerSegment', 'purposeOfPayment', 'internalRef', 'priorityLevel'];
        const aiRecommendedKeys = commonKeys
          .filter(key => key.toLowerCase().includes(currentKeyInput.toLowerCase()))
          .map(key => ({
            value: key,
            label: `AI: ${key}`,
            category: 'Standard',
            confidence: 0.9 + Math.random() * 0.1,
            source: 'CDBI_AI' as const
          }));
        suggestions.push(...aiRecommendedKeys);

        if (currentKeyInput.length > 3) {
            // Simulate advanced AI generating context-specific keys
            const contextKeys: string[] = [];
            if (resource === ResourcesEnum.PaymentOrder) {
                contextKeys.push('paymentWorkflowStatus', 'approverId', 'sourceSystemId');
            } else if (resource === ResourcesEnum.Account) {
                contextKeys.push('accountCategory', 'branchCode', 'riskRating');
            }
            contextKeys.filter(key => key.toLowerCase().includes(currentKeyInput.toLowerCase()))
                .forEach(key => suggestions.push({
                    value: key,
                    label: `AI (Contextual): ${key}`,
                    category: 'Contextual',
                    confidence: 0.8 + Math.random() * 0.1,
                    source: 'CDBI_AI' as const
                }));
        }
      } else { // If value is being typed for a specific key
        // AI-powered Value Suggestions based on the key
        const aiRecommendedValues: string[] = [];
        if (currentKeyInput.toLowerCase().includes('type')) {
          aiRecommendedValues.push('invoicePayment', 'salary', 'refund', 'subscription');
        } else if (currentKeyInput.toLowerCase().includes('segment')) {
          aiRecommendedValues.push('enterprise', 'smallBusiness', 'personal', 'highNetWorth');
        } else if (currentKeyInput.toLowerCase().includes('priority')) {
          aiRecommendedValues.push('high', 'medium', 'low', 'critical');
        } else {
            // Generic AI suggestions based on common data types
            if (currentValueInput.length > 2) {
                aiRecommendedValues.push(`AI-gen-val-${currentValueInput}A`, `AI-gen-val-${currentValueInput}B`);
            }
        }
        aiRecommendedValues
            .filter(val => val.toLowerCase().includes(currentValueInput.toLowerCase()))
            .forEach(val => suggestions.push({
                value: val,
                label: `AI: ${val}`,
                category: currentKeyInput,
                confidence: 0.85 + Math.random() * 0.1,
                source: 'CDBI_AI' as const
            }));
      }

      return suggestions.slice(0, SUGGESTION_LIST_SIZE * 2); // Return more AI suggestions
    } catch (e: any) {
      setAiError(`CDBI AI Service Error: ${e.message}`);
      return [];
    } finally {
      setAiLoading(false);
    }
  }, []);

  const fetchAIInsights = useCallback(async (
    resource: ResourcesEnum,
    metadata: Record<string, string>,
  ): Promise<AIMetadataInsights> => {
    setAiLoading(true);
    setAiError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500)); // Simulate longer AI processing

      const numEntries = Object.keys(metadata).length;
      const completenessScore = Math.min(100, numEntries * 10 + 20 + Math.floor(Math.random() * 15)); // Basic simulation
      const consistencyIndex = Math.min(100, 75 + Math.floor(Math.random() * 20)); // Simulate high consistency for structured data
      const aiCategorization: Record<string, string> = {};
      Object.keys(metadata).forEach((key, index) => {
        aiCategorization[key] = `Category-${index % 3 + 1}`; // Simple mock categorization
      });
      const optimizationRecommendations: string[] = [];
      if (numEntries < 3) {
        optimizationRecommendations.push("Consider adding more descriptive metadata for better searchability.");
      }
      if (completenessScore < 80) {
        optimizationRecommendations.push("AI suggests filling in missing common metadata fields.");
      }
      if (consistencyIndex < 90) {
        optimizationRecommendations.push("Review key naming conventions for consistency.");
      }

      const complianceScore = Math.min(100, 80 + Math.floor(Math.random() * 15));
      const auditRiskScore = Math.min(100, 10 + Math.floor(Math.random() * 20)); // Lower score means higher risk

      return {
        completenessScore,
        consistencyIndex,
        aiCategorization,
        optimizationRecommendations,
        sentimentAnalysis: {
            // Mock sentiment for some values
            'purposeOfPayment': Math.random() > 0.5 ? 'positive' : 'neutral'
        },
        complianceScore,
        auditRiskScore: 100 - auditRiskScore // Invert for display, higher score = lower risk
      };
    } catch (e: any) {
      setAiError(`CDBI AI Insights Error: ${e.message}`);
      return {
        completenessScore: 0,
        consistencyIndex: 0,
        aiCategorization: {},
        optimizationRecommendations: [`Error fetching AI insights: ${e.message}`],
        complianceScore: 0,
        auditRiskScore: 0
      };
    } finally {
      setAiLoading(false);
    }
  }, []);

  return {
    aiLoading,
    aiError,
    fetchAISuggestions,
    fetchAIInsights,
  };
}

/**
 * A generic component to display a single KPI with a "View in Gemini" link.
 */
export const AICDBIKPI: React.FC<{
  title: string;
  value: string | number;
  description?: string;
  geminiChartId?: string; // Identifier for the chart in Gemini
  chartType?: 'line' | 'bar' | 'pie' | 'gauge'; // Suggested chart type for Gemini
}> = ({ title, value, description, geminiChartId, chartType }) => {
  const handleViewInGemini = () => {
    if (geminiChartId) {
      // In a real application, this would navigate to the Gemini dashboard
      // or open a modal with the embedded Gemini chart.
      console.log(`Navigating to Gemini chart: ${geminiChartId} (Type: ${chartType || 'default'})`);
      alert(`Simulating navigation to Gemini for "${title}" chart ID: ${geminiChartId}`);
      // window.open(`https://gemini.cdbi.com/charts/${geminiChartId}`, '_blank'); // Example
    } else {
      alert(`No specific Gemini chart ID for "${title}".`);
    }
  };

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px 0',
      backgroundColor: '#f9f9f9',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '120px'
    }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1em', color: '#333' }}>{title}</h4>
      <p style={{ margin: '0 0 8px 0', fontSize: '1.8em', fontWeight: 'bold', color: '#007bff' }}>{value}</p>
      {description && <p style={{ margin: '0 0 8px 0', fontSize: '0.9em', color: '#555' }}>{description}</p>}
      {geminiChartId && (
        <button
          onClick={handleViewInGemini}
          style={{
            marginTop: 'auto', // Pushes button to bottom
            padding: '8px 12px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '0.85em'
          }}
        >
          View in Gemini {chartType ? `(${chartType})` : ''}
        </button>
      )}
    </div>
  );
};

/**
 * An advanced CDBI AI-powered panel to display insights and KPIs about the current metadata.
 * This component provides actionable intelligence for users.
 */
export const CDBIMetadataInsightsPanel: React.FC<{
  resource: ResourcesEnum;
  metadata: Record<string, string>;
}> = ({ resource, metadata }) => {
  const { aiLoading, aiError, fetchAIInsights } = useAICDBIMetadataService();
  const [insights, setInsights] = useState<AIMetadataInsights | null>(null);

  useEffect(() => {
    // Only fetch insights if metadata has changed meaningfully
    // A simple deep comparison or hash of metadata could be used for performance
    const metadataString = JSON.stringify(metadata); // Simple way to detect changes
    const previousMetadataString = (insights as any)?._previousMetadataString; // Stored on insights object
    if (metadataString !== previousMetadataString) {
        setInsights(null); // Clear previous insights while loading new ones
        fetchAIInsights(resource, metadata).then(data => {
            setInsights({ ...data, _previousMetadataString: metadataString } as AIMetadataInsights);
        });
    }
  }, [resource, metadata, fetchAIInsights]);

  if (aiLoading && !insights) {
    return (
      <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#eef' }}>
        <p>CDBI AI is analyzing metadata for advanced insights...</p>
      </div>
    );
  }

  if (aiError) {
    return (
      <div style={{ padding: '16px', border: '1px solid #f00', borderRadius: '8px', backgroundColor: '#fee' }}>
        <p>Error from CDBI AI: {aiError}</p>
      </div>
    );
  }

  if (!insights) {
      return null; // Or a placeholder if no data yet and not loading
  }

  return (
    <div style={{
      marginTop: '20px',
      padding: '20px',
      border: '1px solid #007bff',
      borderRadius: '10px',
      backgroundColor: '#e6f0ff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3 style={{ color: '#007bff', borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '15px' }}>
        <span role="img" aria-label="AI brain">🧠</span> CDBI AI-Powered Metadata Insights for {RESOURCES[resource].label}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
        <AICDBIKPI
          title="Metadata Completeness Score"
          value={`${insights.completenessScore}%`}
          description="AI assessment of how thoroughly metadata fields are populated."
          geminiChartId="metadata_completeness_gauge"
          chartType="gauge"
        />
        <AICDBIKPI
          title="Consistency Index"
          value={`${insights.consistencyIndex}%`}
          description="AI evaluates the uniformity and standardization of metadata entries."
          geminiChartId="metadata_consistency_bar"
          chartType="bar"
        />
        <AICDBIKPI
          title="Compliance Score"
          value={`${insights.complianceScore}%`}
          description="AI-driven adherence to CDBI's internal and regulatory compliance policies."
          geminiChartId="compliance_score_line"
          chartType="line"
        />
        <AICDBIKPI
          title="Audit Risk Score"
          value={`${insights.auditRiskScore}% (Lower Risk)`} // Higher score means lower risk
          description="AI predicts potential audit flags based on metadata patterns and anomalies."
          geminiChartId="audit_risk_radar"
          chartType="line" // Simulating radar with line
        />
      </div>

      {insights.optimizationRecommendations.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #d4edda'
        }}>
          <h4 style={{ color: '#28a745', marginBottom: '10px' }}>
            <span role="img" aria-label="lightbulb">💡</span> AI Optimization Recommendations
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {insights.optimizationRecommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: '5px', color: '#333' }}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {Object.keys(insights.aiCategorization).length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #cce5ff'
        }}>
          <h4 style={{ color: '#007bff', marginBottom: '10px' }}>
            <span role="img" aria-label="tag">🏷️</span> AI Categorization
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {Object.entries(insights.aiCategorization).map(([key, category]) => (
              <li key={key} style={{ color: '#333' }}>
                <strong>{key}:</strong> {category}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


function MetadataInput({
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
  resource,
}: Props) {
  const [metadataKeys, getMetadataKeys] = useGetMetadataKeys(); // Existing hook for fetching known keys
  const { aiLoading, aiError, fetchAISuggestions } = useAICDBIMetadataService(); // New AI service hook

  const [currentKeyInput, setCurrentKeyInput] = useState<string>('');
  const [currentValueInput, setCurrentValueInput] = useState<string>(''); // For potential future AI value suggestions
  const [allSuggestions, setAllSuggestions] = useState<string[]>([]);

  // Effect to combine traditional and AI suggestions for keys
  useEffect(() => {
    const fetchCombinedSuggestions = async () => {
      const existingKeySuggestions = metadataKeys.map(key => key.value);
      const aiKeySuggestionsRaw = await fetchAISuggestions(resource, initialValues, currentKeyInput);
      const aiKeySuggestions = aiKeySuggestionsRaw
                                .filter(s => !s.label || s.value.toLowerCase().includes(currentKeyInput.toLowerCase())) // Filter AI suggestions by current input
                                .map(s => s.value);

      const combined = Array.from(new Set([...existingKeySuggestions, ...aiKeySuggestions])).slice(0, SUGGESTION_LIST_SIZE * 2);
      setAllSuggestions(combined);
    };

    if (currentKeyInput) {
      fetchCombinedSuggestions();
    } else {
        setAllSuggestions(metadataKeys.map(key => key.value).slice(0, SUGGESTION_LIST_SIZE)); // Only show existing keys if no input
    }
  }, [currentKeyInput, metadataKeys, fetchAISuggestions, resource, initialValues]);


  const onKeyChange = useCallback((key: string) => {
    setCurrentKeyInput(key); // Update local state for AI suggestions
    void getMetadataKeys({ // Trigger existing hook for traditional suggestions
      variables: {
        first: SUGGESTION_LIST_SIZE,
        key,
        resource: RESOURCES[resource].model,
      },
    });
  }, [getMetadataKeys, resource]);

  // The `KeyValueInput` component likely takes a single `suggestions` prop.
  // We need to manage how key and value suggestions are provided.
  // The current `suggestions` prop seems to be for keys only.
  // For AI-powered value suggestions, `KeyValueInput` would need to be extended or wrapped.
  // For now, `suggestions` will primarily be for keys, augmented by AI.
  // If `KeyValueInput` had a `onValueChange` and `valueSuggestions` prop, we could implement that.

  return (
    <div>
        <KeyValueInput
            label="CDBI Metadata" // Renamed label to reflect AI-powered nature
            allowNoEntries={allowNoEntries}
            onChange={onChange}
            suggestions={allSuggestions} // Use combined suggestions for keys
            onKeyChange={onKeyChange}
            completedValuesAndKeys={completedValuesAndKeys}
            disabled={disabled}
            hideLabel={hideLabel}
            initialValues={initialValues}
            inlineAddButton={inlineAddButton}
            multiLines={multiLines}
            noInitialEmptyEntry={noInitialEmptyEntry}
            alwaysDeleteOnRemove={alwaysDeleteOnRemove}
        />
        {/* Render the AI Insights Panel below the input form */}
        <CDBIMetadataInsightsPanel resource={resource} metadata={initialValues} />
    </div>
  );
}

export default MetadataInput;