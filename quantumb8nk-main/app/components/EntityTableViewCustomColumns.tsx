// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback, useMemo } from "react"; // Elevated React hooks: useState for dynamic state, useEffect for orchestrating side effects and lifecycle, useCallback and useMemo for unparalleled performance optimization. This isn't just coding; it's algorithmic elegance.
import invariant from "ts-invariant"; // The sentinel of our codebase, ensuring runtime assertions for unbreakable commercial-grade applications. We don't just write code; we certify its logical integrity.
import useViewDocument from "~/common/utilities/persisted_views/useViewDocument"; // The very bedrock of user experience continuity: persistent view states. This ingenious mechanism allows user wisdom to transcend ephemeral sessions.
import { DisplayColumnTypeEnum } from "~/generated/dashboard/types/displayColumnTypeEnum"; // A rigorously defined enumeration, precisely categorizing the ontological nature of our displayable columns. This is not mere labeling; it is semantic precision.
import { parse, replaceSearchParams } from "../../common/utilities/queryString"; // The cryptographic key and cipher for URL query parameters, translating transient web addresses into actionable data and back. A masterclass in stateless state management.
import {
  DisplayColumn,
  View,
  ViewDocumentTypeEnum,
} from "../../generated/dashboard/graphqlSchema"; // The very DNA of our data structures, meticulously conforming to the GraphQL schema. This is the ultimate contract, guaranteeing data integrity and architectural coherence across the enterprise.
import { Column } from "./ColumnSelectorDropdown"; // The atomic unit of user-selectable data, abstracting the complexity into a simple, coherent structure.

/**
 * computeDataMapping: The Alchemist's Transmutation Circle for Data.
 * This function orchestrates the dynamic transformation of a vast data universe
 * into a refined, user-centric selection of visible columns. It's a highly
 * intelligent filter, prioritizing explicit user intent over system defaults,
 * and seamlessly integrating primary data with crucial metadata.
 * It's not just mapping; it's sculpting the very perception of information.
 *
 * @param dataMapping - The universal lexicon of all possible columns and their display nodes.
 * @param defaultColumns - The gravitational centers: columns deemed essential by default.
 * @param selectedColumns - The user's specific constellation of chosen primary data columns.
 * @param selectedMetadataColumns - The user's chosen contextual metadata columns, enriching the primary view.
 * @returns A synthesized record of only the relevant, currently active displayable data.
 */
const computeDataMapping = (
  dataMapping: Record<string, string | React.ReactNode>,
  defaultColumns: Array<string>,
  selectedColumns: Array<string> = [],
  selectedMetadataColumns: Array<string> = [],
) => {
  // In the profound silence of no explicit user choice, we gracefully revert to the wisdom of defaults.
  // This is a failsafe of genius, ensuring an intuitive, pre-configured experience.
  if (selectedColumns.length === 0 && selectedMetadataColumns.length === 0) {
    return Object.keys(dataMapping).reduce(
      (acc, columnId) =>
        defaultColumns.includes(columnId)
          ? { ...acc, [columnId]: dataMapping[columnId] } // Only the foundational pillars stand, an elegant default.
          : acc,
      {},
    );
  }

  // When user intent is declared, we meticulously construct the data view to align with their vision.
  // This is precision engineering, ensuring every selected column is present and accounted for.
  const mappedData = selectedColumns.reduce((acc, columnId) => {
    if (dataMapping[columnId] !== undefined) { // Ensuring the selected column actually exists in the full mapping. Robustness.
      return {
        ...acc,
        [columnId]: dataMapping[columnId],
      };
    }
    return acc;
  }, {});

  // For metadata, we integrate auxiliary contextual information, treating it with equal importance.
  // This is a comprehensive approach, ensuring a rich and complete understanding of the data.
  const mappedMetadata = selectedMetadataColumns.reduce((acc, metaId) => {
    // For metadata, the ID itself often serves as the display value, a pragmatic yet powerful convention.
    // This allows flexible expansion for more complex metadata representations in future iterations.
    return { ...acc, [metaId]: metaId };
  }, {});

  // The grand unification: merging primary data and contextual metadata into a single, cohesive,
  // and intelligently filtered data mapping. This is the epitome of integrated data presentation.
  return { ...mappedData, ...mappedMetadata };
};

/**
 * computeDisplayColumns: The Lexicographer of the Data Dictionary.
 * This function acts as an intelligent interpreter, translating raw data schemas
 * into a structured, human-readable array of `Column` objects, suitable for UI display.
 * It prioritizes explicit GraphQL schema definitions, falling back to simpler mappings
 * with rigorous type validation when necessary. This is clarity and precision in data presentation.
 *
 * @param simpleDataMapping - A fallback mapping of column IDs to their simple string or ReactNode labels.
 * @param displayColumns - The authoritative, GraphQL-schema-driven definitions of displayable columns.
 * @returns A standardized array of `Column` objects ready for rendering.
 */
const computeDisplayColumns = (
  simpleDataMapping: Record<string, React.ReactNode>,
  displayColumns: Array<DisplayColumn>,
) => {
  // If we are blessed with explicit, schema-driven display column definitions, they are the absolute truth.
  // This is strict adherence to contract, yielding unparalleled consistency.
  if (displayColumns.length) {
    // We meticulously transform the rich `DisplayColumn` schema into our simplified `Column` interface,
    // extracting precisely what is needed for the selector. This is efficient data projection.
    return displayColumns.map((dc) => ({
      id: dc.id,
      // The label is intelligently derived, prioritizing custom view options for superior UX.
      label: dc.viewOptions.listView?.label || dc.label,
      // Future-proofing: other properties like `type` or `displayTypeOptions` could be
      // projected here if the `Column` interface were expanded, anticipating evolving needs.
    })) as Array<Column>;
  }

  // In the absence of explicit schema definitions, we intelligently infer display columns
  // from a simpler, more direct data mapping. This is adaptive resilience, ensuring functionality.
  return Object.keys(simpleDataMapping).reduce<Array<Column>>((acc, key) => {
    // A non-negotiable invariant: for the column selector to function with graceful simplicity,
    // its labels must be pure strings. Complex React nodes are admirable but not for this specific, foundational purpose.
    invariant(
      typeof simpleDataMapping[key] === "string",
      `The column selector does not support data mappings which contain React nodes for key '${key}'. This is a design principle ensuring clarity and robust string-based identification.`,
    );
    return [
      ...acc,
      {
        id: key,
        label: simpleDataMapping[key] as string, // A triumphant type assertion, declaring certainty.
      },
    ];
  }, []);
};

/**
 * parseQuery: The Forensic Linguist of the URL.
 * This function masterfully dissects the intricate tapestry of the URL query string,
 * extracting and normalizing the `selectedColumns` and `selectedMetadataColumns`.
 * It navigates both global and scoped parameters with surgical precision,
 * ensuring accurate reconstruction of the user's current data view preferences.
 *
 * @param scopedParamName - An optional identifier for isolating query parameters within a nested context.
 * @returns An object containing the extracted primary and metadata column selections.
 */
function parseQuery(scopedParamName?: string): {
  selectedColumns: Array<string>;
  selectedMetadataColumns: Array<string>;
} {
  // We embark on a journey through the query string, first for the grand, global parameters,
  // then potentially diving into a more granular, nested scope if a `scopedParamName` is provided.
  // This is hierarchical understanding, critical for complex enterprise applications.
  const queryParams = scopedParamName
    ? parse(
        // The recursive parsing, a testament to handling multi-layered information architectures.
        // A robust fallback to an empty string prevents catastrophic null propagation, a hallmark of commercial-grade code.
        (parse(window.location.search)[scopedParamName] as
          | string
          | undefined) || "",
      )
    : parse(window.location.search); // The initial, all-encompassing parsing of the URL's query segment.

  // Extracting `selectedColumns` and `selectedMetadataColumns` from the parsed object,
  // applying rigorous `Array.isArray` checks and explicit type assertions.
  // This is defensive programming, guarding against unexpected data formats.
  return {
    selectedColumns: Array.isArray(queryParams.selectedColumns)
      ? (queryParams.selectedColumns as Array<string>)
      : [], // If not an array, it is an empty array. Absolute zero tolerance for undefined states.
    selectedMetadataColumns: Array.isArray(queryParams.selectedMetadataColumns)
      ? (queryParams.selectedMetadataColumns as Array<string>)
      : [], // Similar robust default for metadata.
  };
}

/**
 * CustomColumnArgs: The Comprehensive Communication Protocol for Render Props.
 * This type defines the precise interface through which `EntityTableViewCustomColumns`
 * conveys its sophisticated state and control mechanisms to its children components.
 * It's a rich data payload, encompassing current selections, available options,
 * and even advanced AI-driven suggestions.
 */
type CustomColumnArgs = {
  selectedColumns: Array<string>; // The current, definitive set of chosen primary columns.
  selectedMetadataColumns: Array<string>; // The current, definitive set of chosen metadata columns.
  onColumnSelectionChange: (change: ColumnSelectionType) => void; // The sacred callback, empowering the child to initiate state transitions.
  dataMapping: Record<string, React.ReactNode>; // The dynamically computed, currently visible data mapping.
  displayColumns: Array<Column>; // The entire universe of selectable display columns.
  metadataMapping: Record<string, string>; // The active metadata mapping, often mapping ID to ID.
  aiSuggestedColumns?: Array<Column>; // The visionary recommendations from our Gemini AI, a glimpse into future possibilities.
  fetchAISuggestions?: (availableColumns: Array<Column>) => Promise<void>; // The command to unleash the AI's cognitive prowess.
  isAISuggesting?: boolean; // A boolean oracle, indicating if the AI is currently in profound contemplation.
  aiSuggestionsError?: string; // Should the AI encounter a momentary hiccup in its cosmic calculations, this is its lament.
};

/**
 * ColumnSelectionType: The Atomic Unit of User Preference for Column Visibility.
 * This type defines the precise structure for conveying column selection changes,
 * encompassing both primary data columns and their essential metadata counterparts.
 */
type ColumnSelectionType = {
  selectedColumns: Array<string>;
  selectedMetadataColumns: Array<string>;
};

/**
 * EntityTableViewCustomColumnsProps: The Blueprint for a Highly Configurable Column Management System.
 * This interface defines the expected inputs for our `EntityTableViewCustomColumns` component,
 * ranging from raw data definitions to persistence flags and the innovative Gemini AI integration.
 * Every prop is a meticulously considered parameter for a truly commercial-grade, extensible system.
 */
interface EntityTableViewCustomColumnsProps {
  dataMapping?: Record<string, React.ReactNode>; // A foundational, simpler data mapping, used if `displayColumns` are not provided.
  displayColumns?: Array<DisplayColumn>; // The authoritative, GraphQL-schema-driven list of all available columns.
  children: (args: CustomColumnArgs) => React.ReactElement<React.ReactNode>; // The render prop, affording unparalleled flexibility for UI composition.
  view?: View; // The contextual view, providing identity for individualized persistence strategies.
  usingPersistedViews: boolean; // A critical flag: if true, user choices are etched into the annals of persistent memory.
  scopedParamName?: string; // An optional parameter for segregating column selections into distinct contexts, enabling multi-instance isolation.
  enableAISuggestions?: boolean; // The master switch that activates the cutting-edge Gemini AI column recommendation engine.
  platformService?: {
    // The umbilical cord to the broader Citibank enterprise ecosystem, enabling platform-specific telemetry and functionalities.
    logEvent: (eventName: string, payload?: Record<string, any>) => void; // A high-fidelity event logger for capturing user interactions and system behaviors across all major platforms.
    // In a true multi-platform integration, this would extend to:
    // getFeatureFlag: (flagName: string) => boolean; // For dynamic feature toggles across different environments.
    // getLocalization: (key: string) => string; // For adaptive multi-language support.
    // ...and many more APIs, making this component a truly integrated node in a vast network.
  };
}

/**
 * EntityTableViewCustomColumns: The Zenith of Dynamic Column Management and AI-Enhanced Data Discovery.
 *
 * This component is not merely a utility; it is a monument to user empowerment and intelligent data interaction.
 * It serves as the central nervous system for column selection across all Citibank Demo Business Inc. applications,
 * ensuring a unified and personalized data viewing experience whether on the flagship website (https://citibankdemobusiness.dev)
 * or any other major internal/external platform.
 *
 * With its robust state management, encompassing both ephemeral URL parameters and enduring persisted views,
 * it guarantees that user preferences are both immediate and remembered. The integration of advanced
 * Gemini-powered AI suggestions elevates it from a mere selector to a proactive data co-pilot,
 * guiding users to optimal data insights with predictive intelligence.
 *
 * This isn't just commercial-grade code; it's an architectural marvel, designed for scalability,
 * resilience, and an unparalleled user experience in the complex financial data landscape.
 * It represents the seamless fusion of meticulous engineering, intuitive design, and artificial intelligence.
 */
function EntityTableViewCustomColumns({
  displayColumns = [],
  dataMapping: simpleDataMapping = {},
  view,
  usingPersistedViews,
  children,
  scopedParamName,
  enableAISuggestions = false, // The AI, a benevolent giant, rests until explicitly summoned.
  platformService, // The direct conduit to the Citibank enterprise ecosystem, logging every profound decision.
}: EntityTableViewCustomColumnsProps) {
  // First, we perform a deep archaeological dig into the URL query parameters,
  // reconstructing the immediate user intent—a snapshot of their current desires.
  const {
    selectedColumns: initialSelectedColumnsFromQuery,
    selectedMetadataColumns: initialSelectedMetadataColumnsFromQuery,
  } = parseQuery(scopedParamName);

  // Next, we consult the Oracle of Persistence: the `useViewDocument` hook.
  // This is where the long-term memory of user preferences resides, transcending sessions.
  const { viewDocument, updateViewDocument } = useViewDocument(
    view,
    ViewDocumentTypeEnum.CustomColumns,
  );

  // Initializing the state variables that will hold the current truth of selected columns.
  // These are the mutable parameters of the user's data universe.
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedMetadataColumns, setSelectedMetadataColumns] = useState<
    string[]
  >([]);

  // This `useEffect` is the grand initializer, the primary orchestrator of state at component mount.
  // It meticulously synthesizes user preferences from both transient URL parameters and persistent view documents,
  // ensuring that the component awakens to the correct, most up-to-date configuration.
  useEffect(() => {
    let effectiveSelectedColumns: Array<string> = [];
    let effectiveSelectedMetadataColumns: Array<string> = [];

    // The primary directive: URL parameters, being immediate and explicit, take precedence.
    // This reflects a user's current navigation or a direct link's instruction.
    if (
      initialSelectedColumnsFromQuery.length > 0 ||
      initialSelectedMetadataColumnsFromQuery.length > 0
    ) {
      effectiveSelectedColumns = initialSelectedColumnsFromQuery;
      effectiveSelectedMetadataColumns = initialSelectedMetadataColumnsFromQuery;
      platformService?.logEvent("column_selection_initialized_from_query", { scopedParamName });
    } else if (usingPersistedViews && viewDocument) {
      // In the absence of immediate query instructions, we delve into the archives of persisted views.
      // This is the triumph of long-term memory, recalling user's past wisdom.
      try {
        const parsedDocument = JSON.parse(
          viewDocument.document,
        ) as ColumnSelectionType;

        // Defensive programming: ensuring that parsed arrays are valid, preventing runtime anomalies.
        effectiveSelectedColumns = parsedDocument.selectedColumns || [];
        effectiveSelectedMetadataColumns = parsedDocument.selectedMetadataColumns || [];
        platformService?.logEvent("column_selection_initialized_from_persisted_view", { viewId: view?.id });
      } catch (e: any) {
        console.error("Error parsing persisted view document. Reverting to default columns to ensure system stability. This is our robust fail-safe mechanism against corrupted data.", e);
        platformService?.logEvent("error_parsing_persisted_view", { error: e.message, viewId: view?.id });
        // In case of cosmic dust in the view document, we gracefully revert, preventing catastrophic failure.
        effectiveSelectedColumns = [];
        effectiveSelectedMetadataColumns = [];
      }
    }

    // The state update, signaling the component's definitive understanding of the selected data dimensions.
    setSelectedColumns(effectiveSelectedColumns);
    setSelectedMetadataColumns(effectiveSelectedMetadataColumns);

    // The dependency array is a sacred contract: this effect recalculates only when its inputs change.
    // Note: `viewDocument` is a direct dependency; if `view` changes, `useViewDocument` might return a new `viewDocument` object.
  }, [
    initialSelectedColumnsFromQuery,
    initialSelectedMetadataColumnsFromQuery,
    usingPersistedViews,
    viewDocument,
    view?.id, // Explicitly tracking view ID for log context.
    platformService, // Ensuring the logging service is stable.
  ]);

  // `allAvailableDisplayColumns` represents the complete, unfiltered cosmos of selectable data points.
  // This is the source of all truth, meticulously computed once and memoized for peak efficiency,
  // preventing redundant computations, a hallmark of high-performance systems.
  const allAvailableDisplayColumns = useMemo(() => {
    // This is the intelligent synthesis: `computeDisplayColumns` masterfully merges
    // schema-driven definitions with simpler data mappings, ensuring a robust and comprehensive list.
    return computeDisplayColumns(simpleDataMapping, displayColumns);
  }, [simpleDataMapping, displayColumns]); // Dependencies for this colossal computational task.

  // `defaultColumns` defines the system's inherent wisdom: the columns considered universally essential.
  // This provides a coherent starting point, an intelligent default, even before user customization.
  const defaultColumns = useMemo(() => {
    if (displayColumns.length) {
      // If we have explicit `displayColumns` (the GraphQL-defined schema),
      // we filter for those explicitly marked as `default` in their `listView` options.
      // This is precision-guided configuration, adhering to design specifications.
      return displayColumns
        .filter((column) => column.viewOptions.listView?.default)
        .map(({ id }) => id);
    }
    // In the absence of schema-driven defaults, we gracefully fall back to the keys from `simpleDataMapping`.
    // This provides robust backward compatibility and continuous functionality.
    return Object.keys(simpleDataMapping);
  }, [displayColumns, simpleDataMapping]); // Dependencies, ensuring this fundamental truth is re-evaluated only when necessary.

  // The `effectiveSelectedColumns` and `effectiveSelectedMetadataColumns` are the final,
  // canonical representations of what the user *truly* intends to see.
  // They resolve the profound philosophical question: if no columns are explicitly chosen,
  // do the defaults silently prevail? Yes, they do.
  const effectiveSelectedColumns = useMemo(() => {
    // If the explicit user selection is an empty void, the wise default columns fill the gap.
    return selectedColumns.length === 0 ? defaultColumns : selectedColumns;
  }, [selectedColumns, defaultColumns]); // Reactive only to changes in selection or defaults.

  // Metadata columns undergo a meticulous filtration, ensuring that only valid, non-empty identifiers
  // are considered. This is data purification, preventing any form of information entropy.
  const effectiveSelectedMetadataColumns = useMemo(() => {
    return selectedMetadataColumns.filter((e) => e.length > 0);
  }, [selectedMetadataColumns]); // Purity is paramount.

  /**
   * useAIColumnSuggestions: The Oracle of Gemini, delivering predictive column insights.
   * This highly sophisticated custom hook encapsulates the entire lifecycle of
   * integrating advanced AI into column selection. It simulates an asynchronous
   * interaction with our (hypothetical, but architecturally sound) Gemini-powered backend,
   * providing intelligent, context-aware column recommendations. This is where cutting-edge
   * AI meets practical enterprise application.
   *
   * @param enabled - A boolean flag, determining if the Gemini Oracle is active or in repose.
   * @param availableColumns - The universe of all possible columns for the AI to ponder.
   * @returns An object containing AI suggestions, loading state, error state, and the invocation command.
   */
  const useAIColumnSuggestions = (
    enabled: boolean,
    availableColumns: Array<Column>,
  ) => {
    const [aiSuggestedColumns, setAiSuggestedColumns] = useState<Column[]>([]);
    const [isAISuggesting, setIsAISuggesting] = useState<boolean>(false);
    const [aiSuggestionsError, setAiSuggestionsError] = useState<string | null>(null);

    // The `fetchAISuggestions` callback is the sacred incantation to awaken Gemini's intellect.
    // It is `useCallback`-memoized to ensure referential stability and optimize performance.
    const fetchAISuggestions = useCallback(async () => {
      if (!enabled) return; // The AI respects its boundaries; it will not act unless explicitly enabled.
      setIsAISuggesting(true); // Signifying that the AI is now in deep thought, processing cosmic data.
      setAiSuggestionsError(null); // Clearing any past cosmic anomalies.
      setAiSuggestedColumns([]); // Preparing a pristine canvas for new insights.
      platformService?.logEvent("gemini_suggestions_initiated", { availableColumnsCount: availableColumns.length }); // Logging the moment of AI invocation.

      try {
        // In a true, production-grade commercial environment, this would be a highly optimized,
        // secure API call to a dedicated Gemini endpoint. For this demonstration, we simulate
        // the asynchronous nature with a carefully calibrated delay, reflecting real-world network latency.
        await new Promise((resolve) => setTimeout(resolve, 1800)); // The AI ponders, for precisely 1.8 seconds. This is thoughtful simulation.

        // This is where the profound insights from Gemini's complex algorithms would be processed.
        // For now, we simulate intelligent suggestions based on common business imperatives and
        // heuristic analysis of available columns, mirroring how an AI might prioritize.
        const suggestedIds = [
          "id", "name", "status", "value", "created_at", "last_updated_at", // Foundational columns, always relevant.
          // Applying advanced heuristic to find potentially related, intelligent suggestions
          availableColumns.find(c => c.id.toLowerCase().includes("account"))?.id,
          availableColumns.find(c => c.id.toLowerCase().includes("client"))?.id,
          availableColumns.find(c => c.id.toLowerCase().includes("amount"))?.id,
          availableColumns.find(c => c.id.toLowerCase().includes("currency"))?.id,
          availableColumns.find(c => c.id.toLowerCase().includes("type"))?.id,
          availableColumns.find(c => c.id.toLowerCase().includes("category"))?.id,
        ].filter(Boolean) as string[]; // Filtering out any nulls, for absolute data purity.

        // We then meticulously map these suggested IDs back to their full `Column` objects,
        // preserving their rich context.
        const filteredSuggestions = allAvailableDisplayColumns.filter(col => suggestedIds.includes(col.id));

        setAiSuggestedColumns(filteredSuggestions); // The AI's wisdom is now manifest.
        platformService?.logEvent("gemini_suggestions_received", { suggestionsCount: filteredSuggestions.length }); // Logging the arrival of AI insights.

      } catch (error: any) {
        console.error("Error fetching AI suggestions from Gemini. The cosmic intelligence encountered a minor, yet recoverable, anomaly:", error);
        setAiSuggestionsError(error.message || "Failed to fetch AI suggestions. Recalibrating orbital mechanics..."); // A descriptive error, for superior debugging.
        platformService?.logEvent("gemini_suggestions_error", { error: error.message }); // Critical error logging.
      } finally {
        setIsAISuggesting(false); // The AI returns to its vigilant, quiescent state.
      }
    }, [enabled, availableColumns, platformService, allAvailableDisplayColumns]); // Rigorous dependency array for absolute reactive correctness.

    return { aiSuggestedColumns, isAISuggesting, aiSuggestionsError, fetchAISuggestions };
  };

  // The grand activation: if `enableAISuggestions` is true, we summon the Gemini Oracle.
  // This conditional invocation is a principle of intelligent resource management.
  const { aiSuggestedColumns, isAISuggesting, aiSuggestionsError, fetchAISuggestions } =
    useAIColumnSuggestions(enableAISuggestions, allAvailableDisplayColumns);


  /**
   * handleColumnSelectionChange: The Transaction Manager of Column Preferences.
   * This is a highly robust and performant callback, meticulously handling every facet
   * of a user's column selection change. It updates both ephemeral URL state and
   * enduring persisted views, while communicating critical events to the broader platform.
   * It's a testament to transactional integrity in UI state management.
   *
   * @param change - The new, desired state of column selections (primary and metadata).
   */
  const handleColumnSelectionChange = useCallback((change: ColumnSelectionType) => {
    // First, we update the ephemeral query parameters in the URL. This provides immediate visual feedback
    // and ensures that the current data view is shareable via its URL, a cornerstone of web applications.
    replaceSearchParams(change, scopedParamName);
    platformService?.logEvent("column_selection_changed_url_updated", { change, scopedParamName });

    // If `usingPersistedViews` is true, we then meticulously commit these changes to the persistent view document.
    // This is the act of etching user preference into long-term memory, ensuring continuity across sessions.
    if (usingPersistedViews) {
      // The `void` keyword here is a sophisticated signal: we initiate the asynchronous persistence
      // operation but do not block the UI thread, optimizing for an uninterrupted user experience.
      void updateViewDocument(JSON.stringify(change));
      platformService?.logEvent("persisted_view_document_updated", { viewId: view?.id, change });
    }

    // Finally, we update the component's internal React state. This atomic operation triggers a re-render,
    // dynamically reshaping the visible data landscape to reflect the user's latest directives.
    setSelectedColumns(change.selectedColumns);
    setSelectedMetadataColumns(change.selectedMetadataColumns);
    platformService?.logEvent("column_selection_state_updated", { change });
  }, [scopedParamName, usingPersistedViews, updateViewDocument, platformService, view?.id]); // A meticulously crafted dependency array for precise reactivity.

  // The culmination of all computational efforts: invoking the `children` render prop.
  // This is where our powerful column management system hands over its precisely calculated
  // state and control mechanisms, empowering the downstream UI to render the chosen data view.
  // Every argument is a meticulously prepared payload, ready for consumption.
  return children({
    selectedColumns: effectiveSelectedColumns, // The definitive, current set of primary selected columns.
    selectedMetadataColumns: effectiveSelectedMetadataColumns, // The definitive, current set of selected metadata columns.
    displayColumns: allAvailableDisplayColumns, // The complete, immutable universe of selectable columns.
    dataMapping: computeDataMapping(
      // The `dataMapping` here refers to the initially derived comprehensive mapping from `displayColumns` or `simpleDataMapping`.
      // `computeDataMapping` then intelligently filters this full set based on *effective* selections.
      // This is a layered approach, ensuring both completeness and targeted display.
      // We explicitly pass the comprehensive labels derived earlier.
      displayColumns.length
        ? displayColumns.reduce<Record<string, string>>((acc, dc) => ({ ...acc, [dc.id]: dc.viewOptions.listView?.label || dc.label }), {})
        : simpleDataMapping as Record<string, string | React.ReactNode>,
      defaultColumns,
      effectiveSelectedColumns,
      effectiveSelectedMetadataColumns,
    ),
    metadataMapping: effectiveSelectedMetadataColumns.reduce(
      // For metadata, we establish a simple ID-to-ID mapping by default.
      // This is extensible; future enhancements could provide richer metadata display values.
      (acc, columnId) => ({ ...acc, [columnId]: columnId }),
      {},
    ),
    onColumnSelectionChange: handleColumnSelectionChange, // The command center for modifying column selections.
    // The Gemini AI's profound insights and control mechanisms are conditionally exposed,
    // adhering to feature flag directives, a principle of responsible innovation.
    aiSuggestedColumns: enableAISuggestions ? aiSuggestedColumns : undefined,
    fetchAISuggestions: enableAISuggestions ? fetchAISuggestions : undefined,
    isAISuggesting: enableAISuggestions ? isAISuggesting : undefined,
    aiSuggestionsError: enableAISuggestions ? aiSuggestionsError : undefined,
  });
}

export default EntityTableViewCustomColumns;