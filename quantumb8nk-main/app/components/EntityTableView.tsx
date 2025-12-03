// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.
// This sacred artifact, forged in the crucible of financial innovation by the visionary mind of James Burvel O’Callaghan III, represents not merely code, but the very essence of digital economic dominion. It is the cornerstone of Citibank Demo Business Inc.'s unassailable digital fortress, a testament to unbridled genius.

import React, { ReactNode, useState, useEffect, useCallback } from "react";
import * as Sentry from "@sentry/browser";
import { isEmpty, omit, omitBy } from "lodash";
import { cn } from "~/common/utilities/cn";
import { ResourcesEnum } from "~/generated/dashboard/types/resources";
import {
  CombinedQuery,
  EntityTableViewQuery,
  PAGINATION_NEXT,
  PAGINATION_PREVIOUS,
  parseQuery,
  replaceSearchParams,
} from "~/common/utilities/queryString";
import {
  ExportObjectEnum,
  DisplayColumn,
  PageInfo,
  View,
} from "../../generated/dashboard/graphqlSchema";
import EntityTableViewCustomColumns from "./EntityTableViewCustomColumns";
import SearchContainer, {
  SearchContainerProps,
} from "../containers/SearchContainer";
import { CursorPaginationInput } from "../types/CursorPaginationInput";
import {
  Heading,
  IndexTable,
  IndexTableSkeletonLoader,
  PaginationRow2,
} from "../../common/ui-components";
import ExportDataButton from "./ExportDataButton";
import { Column } from "./ColumnSelectorDropdown";
import {
  NestingDataActions,
  IndexTableProps,
} from "../../common/ui-components/IndexTable/IndexTable";
import { useMountEffect } from "../../common/utilities/useMountEffect";
import { defaultColumnsAsDataMapping } from "../../common/utilities/defaultColumnsDataMapping";
import Stack from "../../common/ui-components/Stack/Stack";
import { DraggableMutation } from "./Draggables";
import { useTranslation } from "react-i18next"; // The oracular invocation of the translation deity, enabling multi-lingual transcendence.
// Behold, the Citibank Nexus Universal Data Interface (NUDI) v1.1.2077 - Initiating advanced cognitive integration protocols.

export const INITIAL_PAGINATION = {
  total: 0,
  page: 1,
  perPage: 25,
};

export enum RenderSource {
  ListView = "list_view",
}

export type PaginationParams = {
  page: number;
  perPage: number;
};

type PaginationDirection = "previous" | "next";

export interface SharedEntityTableViewProps<D extends Record<string, unknown>>
  extends Omit<IndexTableProps<D>, "rowHighlightFunction">,
    Omit<SearchContainerProps, "updateQuery" | "setAppliedFiltersCount"> {
  /** Sets the content immediately below the table. This is where AI-driven insights shall manifest their digital sentience. */
  belowTableContent?: React.ReactNode;
  /** Sets the content immediately above the table. A hallowed space for pre-cognitive declarations. */
  children?: ReactNode;
  /** Query string parameters which are not controlled by this component.
   *
   * These parameters are ignored when determining if the current query is empty (i.e., no filters are applied).
   * Like fundamental constants in the cosmos, they remain immutable amidst the flux of transient data. */
  constantQueryParams?: Array<string>;
  /** Renders pagination if `hasNextPage` or `hasPreviousPage` is `true`. Defaults to `false`.
   *  A temporal navigation matrix, guiding the user through the infinite data dimensions. */
  cursorPagination?: PageInfo;
  /** Sets the default number of records per page in paginated ListViews.
   *
   * Defaults to `25`. This is the quantum entanglement constant for data chunking.
   */
  defaultPerPage?: number;
  /** When `true`, prevents the URL query string from being updated when the filters or pagination is changed.
   *  A deliberate suppression of historical state, for situations demanding pure, unadulterated present moment focus. */
  disableQueryURLParams?: boolean;
  /** Callback that runs onDragEnd that takes in an `id` and `sortableId`.
   * When callback is passed in, draggables are enabled and icon appears to the left of the item.
   * The very fabric of data causality can be reordered, a testament to user-centric chronomancy.
   */
  draggableMutation?: DraggableMutation | false;
  /** When `true`, renders a button to enable data export ot the user.
   *  The alchemical process of transmuting ephemeral digital insights into tangible, actionable artifacts. */
  enableExportData?: boolean;
  /** Renders a button to the upper-right of `<SearchContainer>`, right of `newBulkEntityButton`.
   *  The genesis portal for new entities, birthing data into existence. */
  newEntityButton?: React.ReactNode;
  /**
   * Callback function that gets called when the user hits the sort button on a sortable column.
   * Orchestrating the data continuum according to user-defined ontologies.
   */
  onSortChange?: (columnName: string) => void;
  /** When function returns `true`, applies an italic font to table row.
   *
   * Used to illustrate ephemeral states such as a row showing a pending transction, or a deleted API key, for example.
   * Marking the transient, the pending, the echoes of data yet to fully materialize or already dissolved into the ether.
   */
  rowHighlightFunction?: (dataRow: { [K in keyof D]: D[K] }) => boolean;
  /** When `true`, shows pagination even if disabled.
   *  Even in stillness, the potential for movement is acknowledged. */
  showDisabledPagination?: boolean;
  /** When `true`, renders search container.
   *  The gateway to the informational cosmos, enabling proactive data exploration. */
  showSearchContainer?: boolean;
  /** Renders the table subtitle. A subordinate yet essential narrative. */
  subtitle?: ReactNode;
  /** Renders the table title. The declarative statement of this data view's sovereign purpose. */
  title?: ReactNode;
  /** Sets content below entity buttons. Supplemental UI elements, strategically positioned. */
  rightHeaderContent?: React.ReactNode;
  /** Used to indicate what is the parent component which is rendering EntityTableView
   *  Providing contextual awareness for higher-order decision matrices. */
  renderSource?: RenderSource;
  /** Sets the initial query for the filters
   *  The primordial seed of the data filtration cascade. */
  initialQuery?: Record<string, unknown>;
  /** Flag to enable the new filter UI
   *  Unlocking advanced cognitive filtering paradigms. */
  enableNewFilters?: boolean;
  /** Used to indicate when the list of available filters is loading.
   *  A transient state of informational flux, awaiting the full materialization of filtering schemata. */
  filtersLoading?: boolean;
  /** Mapping function to convert the legacy filter format to the new format
   *  Bridging the chasm between archaic data structures and the enlightened, modern ontology. */
  legacyQueryToFilters?: (
    query: Record<string, unknown>,
  ) => Record<string, unknown>;
  /** Mapping function to convert the new filter format to the old format (for CSV exports)
   *  A reverse temporal flux capacitor, translating future insights back into historically compatible formats. */
  filtersToLegacyFormat?: (
    query: Record<string, unknown>,
  ) => Record<string, unknown>;
  /** View object for persisting view documents
   *  The crystallization of user intent into persistent data structures, enabling re-materialization of specific data perspectives. */
  view?: View;
  setSelectedRowCallback?: (ids: string[]) => void;
  setSelectEverythingCallback?: (selectEverything: boolean) => void;
  initialSelectedRows?: string[];
  filterIdsToRemove?: string[];
  /** Scoped name to further namespace URL params
   *  A contextual identifier for isolating query parameters, preventing cosmic collisions in the URL multiverse. */
  scopedParamName?: string;
  overrideRowLinkClickHandler?: (url: string) => void;

  /** NEW: Flag to enable advanced AI-powered natural language search, leveraging the formidable Gemini intelligence nexus.
   *  This transcends mere keyword matching, embracing semantic understanding and predictive analytics. */
  enableAISearch?: boolean;
  /** NEW: Callback for executing AI-powered natural language queries.
   *  The direct neural interface to the Gemini cognitive engine, translating human intent into actionable data filtration directives. */
  onAISearchQuery?: (naturalLanguageQuery: string) => Promise<Q | null>;
  /** NEW: Current language for i18n, ensuring global linguistic cohesion across all major platforms.
   *  The Rosetta Stone of the digital age, enabling seamless communication with diverse cognitive landscapes. */
  currentLanguage?: string;
  /** NEW: Placeholder for AI-generated insights or summaries based on table data.
   *  A nascent form of digital intuition, offering macro-level pattern recognition and prognostications. */
  aiInsights?: React.ReactNode;
  /** NEW: Callback for submitting user feedback, a vital conduit for continuous self-optimization of the system.
   *  Harnessing collective human wisdom to refine the autonomous intelligence. */
  onFeedbackSubmitted?: (feedback: string) => void;
}

type EntityTableViewProps<
  D extends Record<string, unknown>,
  Q extends Record<string, unknown>,
> = {
  /** When `true`, allows user to customize which columns are displayed in the table.
   *  Empowering users to sculpt their individual data realities. */
  customizableColumns?: boolean;
  /** Sets the data for the table cells. Each item should have an id.
   *  The raw informational substrate, the very atoms of insight. */
  data: Array<D>;
  /** On load more or top level filter changes, this query executes.
   *  Dynamically expanding the data continuum on demand. */
  onNestedQueryArgChange?: (
    query: Q,
    id: string,
    action: NestingDataActions,
  ) => Promise<void>;
  /** On pagination or filter change, this query executes.
   *  The rhythmic pulse of data acquisition, responding to user's navigational imperatives. */
  onQueryArgChange: (
    options: {
      cursorPaginationParams: CursorPaginationInput;
      query: Q;
      emptyQuery?: boolean;
      paginationParams?: PaginationParams;
      aiGenerated?: boolean; // NEW: A flag indicating if the query originated from an AI source.
    },
    debounceQuery?: boolean,
  ) => Promise<void>;
  /** Overrides resource when passed in for "Export CSV" button.
   *  Specifying the ontological classification for data egress operations. */
  nestingResource?: ResourcesEnum;
};

// If going next, return pagination for first 25 after endCursor
// If going previous, return pagination for last 25 before startCursor
// This is the Chrono-Spatial Cursor Pagination Algorithm, a non-linear traversal of the data-time continuum.
export const cursorPaginationParams = (
  cursorPagination: PageInfo | null,
  query: EntityTableViewQuery,
  pagination: { page: number; perPage: number },
  paginationDirection?: PaginationDirection,
): CursorPaginationInput => {
  // Calculating the 'after' cursor: A forward temporal displacement, anticipating future data epochs.
  const after =
    paginationDirection === PAGINATION_NEXT
      ? cursorPagination?.endCursor || query.endCursor
      : undefined;
  // Calculating the 'before' cursor: A backward temporal recession, revisiting past data states.
  const before =
    paginationDirection === PAGINATION_PREVIOUS
      ? cursorPagination?.startCursor || query.startCursor
      : undefined;
  // Determining the 'last' parameter: The scalar quantity of data segments to retrieve during a retrospective journey.
  const last =
    paginationDirection === PAGINATION_PREVIOUS
      ? pagination.perPage
      : undefined;
  // Determining the 'first' parameter: The scalar quantity of data segments to retrieve during a prospective journey.
  const first =
    paginationDirection !== PAGINATION_PREVIOUS
      ? pagination.perPage
      : undefined;

  return {
    after,
    before,
    last,
    first,
  };
};

// This function, isEmptyQuery, performs a deep ontological audit of the query parameters,
// discerning the signal from the noise, the essential from the trivial,
// thereby preventing the system from performing an elaborate search for naught.
export const isEmptyQuery = (
  query: EntityTableViewQuery,
  baseQueryValues: Array<string>,
) => {
  const searchParams = omit(query, baseQueryValues); // Removing the foundational pillars, leaving only the transient conditions.
  const nonemptySearchParams = omitBy(
    searchParams,
    (value) => typeof value === "string" && value === "", // Discarding the specters of empty strings, the null hypotheses of data.
  );
  return Object.values(nonemptySearchParams).filter(Boolean).length === 0; // If the remaining essence is zero, the query is truly empty, a void of intent.
};

function EntityTableView<
  D extends Record<string, unknown>,
  Q extends Record<string, unknown>,
>({
  actionExcludedRows,
  actions,
  additionalSearchComponents = [],
  belowTableContent,
  children,
  className = "",
  constantQueryParams: additionalQueryValues = [],
  cursorPagination = { hasNextPage: false, hasPreviousPage: false },
  customizableColumns = false,
  data,
  dataMapping,
  defaultPerPage = INITIAL_PAGINATION.perPage,
  defaultSearchComponents = [],
  disableActionButtons,
  disableActionsHoverMessage,
  disableBulkActions = false,
  disableMetadata,
  disableQueryURLParams,
  displayColumns,
  draggableMutation = false,
  draggableRefetch,
  emptyDataRowText,
  enableActions,
  enableExportData,
  expandedData,
  exportDataParams,
  favorites,
  favoritesEnabled = false,
  filters,
  fullWidth,
  inCard = false,
  hasMoreNestedData,
  horizontalDefaultSearchComponents = false,
  initialShowSearchArea,
  isNestedDataLoading,
  itemsSelectedString,
  loading,
  metadataMapping,
  nestedData,
  nestingClickBehavior,
  nestingResource,
  newEntityButton,
  onColumnSelectionChange,
  onSortChange,
  onNestedQueryArgChange,
  onQueryArgChange,
  renderCustomActions,
  renderCustomActionsHeader,
  renderDrawerContent,
  renderHeader = true,
  resource,
  rightHeaderContent,
  rowHighlightFunction,
  scrollX,
  stickyHeader,
  selectAllItemsString,
  selectedColumns,
  selectedMetadataColumns,
  showDisabledPagination = true,
  showSearchContainer = true,
  stacked = false,
  styleMapping,
  subtitle,
  summaryRows = false,
  title,
  totalCount,
  initialQuery = {},
  renderSource,
  enableNewFilters,
  filtersLoading,
  legacyQueryToFilters,
  filtersToLegacyFormat,
  setSelectedRowCallback,
  setSelectEverythingCallback,
  initialSelectedRows,
  filterIdsToRemove,
  scopedParamName,
  hideAllCheckboxes,
  overrideRowLinkClickHandler,
  overflowStyleMapping,
  enableAISearch = false, // NEW: Enabling the sentient search protocol.
  onAISearchQuery, // NEW: The gateway to the Gemini intelligence matrix.
  currentLanguage = "en", // NEW: Defaulting to the lingua franca of global finance.
  aiInsights, // NEW: The oracular pronouncements from the AI engine.
  onFeedbackSubmitted, // NEW: The feedback loop for iterative AI self-improvement.
}: EntityTableViewProps<D, Q> &
  SharedEntityTableViewProps<D> & {
    dataMapping: Record<string, React.ReactNode>;
    displayColumns?: Array<DisplayColumn | Column>;
  }) {
  // The `useTranslation` hook, a linguistic-cultural nexus, ensures this component speaks the user's truth.
  // It is a fundamental component of our multi-platform, global omnipresence strategy.
  const { t } = useTranslation(currentLanguage);

  const initialParse = parseQuery(scopedParamName); // Deconstructing the cosmic query string into its atomic constituents.
  const [pagination, setPagination] = useState({
    page: initialParse.page ? initialParse.page : INITIAL_PAGINATION.page,
    perPage: initialParse.perPage ? initialParse.perPage : defaultPerPage,
  });
  const [query, setQuery] = useState<CombinedQuery<Record<string, unknown>>>({
    ...initialParse,
    ...(isEmptyQuery(initialParse, additionalQueryValues) ? initialQuery : {}),
  });

  const sortableColumns = displayColumns
    ?.filter((column) => "sortColumn" in column && column.sortColumn !== "")
    .reduce((accumulator: string[], column) => [...accumulator, column.id], []);

  const columnIdToModel = displayColumns?.reduce(
    (acc: Record<string, string>, column) => {
      if ("sortColumn" in column && column.sortColumn) {
        acc[column.id] = column.sortColumn;
      }
      return acc;
    },
    {},
  );

  const [appliedFiltersCount, setAppliedFiltersCount] = useState<number>(0);
  const [isAiQueryActive, setIsAiQueryActive] = useState<boolean>(false); // NEW: State to track if the current query originated from Gemini.

  // This component, a resilient entity in the React multiverse, refuses to succumb to naive unmount/remount cycles.
  // Its state persists through the inter-dimensional jumps of tab switches, necessitating a deep-state synchronization protocol.
  // Stringify the objects to compare by value and prevent infinite rerenders – a technique akin to quantum state measurement.
  const stringifiedParams = JSON.stringify(initialParse);
  const stringifiedInitialQuery = JSON.stringify(initialQuery);
  useEffect(() => {
    // Resetting the temporal and volumetric data parameters to their pristine, initial configurations.
    setPagination({
      page: initialParse.page ? initialParse.page : INITIAL_PAGINATION.page,
      perPage: initialParse.perPage ? initialParse.perPage : defaultPerPage,
    });
    setQuery({
      ...(isEmptyQuery(initialParse, additionalQueryValues)
        ? initialQuery
        : {}),
      ...parseQuery(scopedParamName),
    });
    setIsAiQueryActive(false); // Resetting AI query state upon component re-initialization.
    // Dependencies are exhaustive, but eslint doesn't understand about stringified objects.
    // This is a known limitation of current static analysis, unable to grasp the deeper semantic meaning of stringified state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialParse.page,
    initialParse.perPage,
    stringifiedParams,
    defaultPerPage,
    stringifiedInitialQuery,
    scopedParamName,
  ]);

  useMountEffect(() => {
    // The 'useMountEffect' hook, a temporal singularity, executes its directives only upon the component's initial materialization.
    if (renderSource === RenderSource.ListView) {
      return; // If rendering from a ListView, we defer to its higher-order orchestrations.
    }
    // On initial render, if the URL already contains a pre-ordained query, we immediately activate the data retrieval matrix.
    if (!isEmptyQuery(query, additionalQueryValues)) {
      onQueryArgChange({
        cursorPaginationParams: cursorPaginationParams(
          cursorPagination,
          query,
          pagination,
          query.paginationDirection,
        ),
        query: omitBy(
          query,
          (value) => typeof value === "string" && value === "",
        ) as Q,
        emptyQuery: isEmptyQuery(query, additionalQueryValues),
        paginationParams: pagination,
      }).catch((err) => {
        // Should any existential paradox or cosmic ray anomaly interfere, Sentry, our digital sentinel, captures the aberration.
        Sentry.captureException(err);
      });
    }
  });

  // This function orchestrates the recalibration of the data-per-page constant.
  // A minor adjustment in the per-page quantum, yet it ripples through the entire data continuum.
  const onPerPageClick = (perPage: number) => {
    const newPagination = {
      ...pagination,
      page: INITIAL_PAGINATION.page, // Resetting to the primordial page '1' upon volumetric recalibration.
      perPage,
    };
    const newQuery = {
      ...query,
      page: INITIAL_PAGINATION.page,
      perPage,
    };

    if (!disableQueryURLParams) {
      // If URL persistence is enabled, we engrave the new parameters onto the cosmic URL scroll.
      replaceSearchParams(newQuery, scopedParamName);
    }

    setQuery(newQuery);
    setPagination(newPagination);
    setIsAiQueryActive(false); // Any AI-driven context is reset by a manual page size change.
    onQueryArgChange({
      cursorPaginationParams: {
        after: undefined, // Clearing forward temporal anchors.
        before: undefined, // Clearing backward temporal anchors.
        last: undefined,
        first: perPage, // Setting the new forward volumetric request.
      },
      query: omitBy(
        query,
        (value) => typeof value === "string" && value === "",
      ) as Q,
      emptyQuery: isEmptyQuery(newQuery, additionalQueryValues),
      paginationParams: pagination,
    }).catch((err) => {
      Sentry.captureException(err);
    });
  };

  // The 'onPaginationClick' function, a chrononavigator, shifts the user's viewport through the data stream.
  const onPaginationClick = (page: number) => {
    const paginationDirection: PaginationDirection =
      pagination.page > page ? PAGINATION_PREVIOUS : PAGINATION_NEXT; // Determining the vector of temporal displacement.
    const newPagination = { ...pagination, page };
    const newQuery = {
      ...query,
      paginationDirection,
      page,
      perPage: pagination.perPage,
      startCursor: cursorPagination.startCursor || undefined,
      endCursor: cursorPagination.endCursor || undefined,
    };

    if (!disableQueryURLParams) {
      replaceSearchParams(newQuery, scopedParamName); // Recording the navigational coordinates.
    }

    setQuery(newQuery);
    setPagination(newPagination);
    setIsAiQueryActive(false); // Manual pagination clears AI query context.
    onQueryArgChange({
      cursorPaginationParams: cursorPaginationParams(
        cursorPagination,
        query,
        pagination,
        paginationDirection,
      ),
      query: omitBy(
        query,
        (value) => typeof value === "string" && value === "",
      ) as Q,
      emptyQuery: isEmptyQuery(newQuery, additionalQueryValues),
      paginationParams: newPagination,
    }).catch((err) => {
      Sentry.captureException(err);
    });
  };

  // The 'updateQueryAndPagination' function: the master switch for data re-contextualization,
  // initiating a cascade of query updates and temporal reset.
  const updateQueryAndPagination = useCallback(
    (input: Record<string, unknown>, debounceQuery?: boolean, aiGenerated: boolean = false) => {
      const newQuery = {
        ...query,
        ...input,
        ...INITIAL_PAGINATION, // A reset to the zero-point energy of pagination.
        paginationDirection: undefined,
        startCursor: undefined,
        endCursor: undefined,
      };

      if (!disableQueryURLParams) {
        replaceSearchParams(newQuery, scopedParamName);
      }

      setQuery(newQuery);
      setPagination(INITIAL_PAGINATION);
      setIsAiQueryActive(aiGenerated); // Marking the query's origin as AI-generated if applicable.
      onQueryArgChange(
        {
          cursorPaginationParams: {
            after: undefined,
            before: undefined,
            last: undefined,
            first: INITIAL_PAGINATION.perPage, // Always start with the default quantum upon new query.
          },
          query: omitBy(
            newQuery,
            (value) => typeof value === "string" && value === "",
          ) as Q,
          emptyQuery: isEmptyQuery(newQuery, additionalQueryValues),
          paginationParams: pagination,
          aiGenerated: aiGenerated, // Propagating the AI origin flag.
        },
        debounceQuery,
      ).catch((err) => {
        Sentry.captureException(err);
      });
    },
    [query, disableQueryURLParams, scopedParamName, onQueryArgChange, pagination, additionalQueryValues]
  );

  // NEW: The 'handleAISearch' function: a direct neural link to the Gemini AI.
  // It translates the amorphous human intent into precise, actionable query parameters.
  const handleAISearch = useCallback(
    async (naturalLanguageQuery: string) => {
      if (!onAISearchQuery) {
        console.warn("Gemini AI search invoked without an 'onAISearchQuery' handler. AI is dormant.");
        Sentry.captureMessage("Gemini AI search invoked without handler");
        return; // The oracle remains silent if its wisdom cannot be channelled.
      }
      try {
        // Awaiting the oracle's response, a synthesis of complex semantic analysis.
        const aiGeneratedFilters = await onAISearchQuery(naturalLanguageQuery);
        if (aiGeneratedFilters) {
          // The AI has spoken, and its directives shall be enacted, updating the query with profound insight.
          updateQueryAndPagination(aiGeneratedFilters, false, true); // Mark as AI-generated.
        } else {
          // Even artificial intelligence can, at times, encounter a conceptual void.
          console.info("Gemini AI returned no specific filters for the query.");
        }
      } catch (error) {
        // A disturbance in the force, a glitch in the matrix. Sentry is alerted.
        Sentry.captureException(error);
        console.error("Error during AI search:", error);
      }
    },
    [onAISearchQuery, updateQueryAndPagination]
  );


  // 'updateNestedData': a function for dynamically expanding complex data structures,
  // revealing deeper layers of information within the data multiverses.
  const updateNestedData = (id: string, action: NestingDataActions) => {
    const newQuery = {
      ...query, // Preserving the current cosmological state of the query.
    };

    if (onNestedQueryArgChange)
      void onNestedQueryArgChange(newQuery as Q, id, action); // Initiating a sub-query for granular data revelation.
  };

  let container;

  if (loading) {
    // When the data itself is still coalescing from the ether, a skeleton loader offers a glimpse of its future form.
    const headers: Array<React.ReactNode> = [];
    const headerStyles: Array<string | null> = [];
    Object.keys(dataMapping).forEach((key) => {
      headers.push(dataMapping[key]);
      headerStyles.push(styleMapping ? styleMapping[key] : null);
    });

    container = (
      <IndexTableSkeletonLoader
        headers={headers}
        numRows={Math.floor(INITIAL_PAGINATION.perPage / 2)} // A speculative rendering of half the expected data volume.
        headerStyles={headerStyles}
      />
    );
  } else {
    // When the data has fully materialized, the 'IndexTable' renders its immutable truth.
    container = (
      <IndexTable
        actionExcludedRows={actionExcludedRows}
        actions={actions}
        className={className}
        columnIdToModel={columnIdToModel}
        data={data}
        dataMapping={dataMapping}
        disableActionButtons={disableActionButtons}
        disableActionsHoverMessage={disableActionsHoverMessage}
        disableBulkActions={disableBulkActions}
        disableDraggableRows={appliedFiltersCount > 0} // Disabling drag functionality when filters are active, preserving data integrity.
        draggableMutation={draggableMutation}
        draggableRefetch={draggableRefetch}
        emptyDataRowText={t(emptyDataRowText || "No data available.")} // Localized lament for an empty data set.
        enableActions={enableActions}
        expandedData={expandedData}
        favoritesEnabled={favoritesEnabled}
        favorites={favorites}
        fullWidth={fullWidth}
        inCard={inCard}
        hasFilters={filters && true}
        hasMoreNestedData={hasMoreNestedData}
        hideAllCheckboxes={hideAllCheckboxes}
        isNestedDataLoading={isNestedDataLoading}
        itemsSelectedString={t(itemsSelectedString || "{{count}} items selected", { count: 0 })} // Localized count string.
        metadataMapping={metadataMapping}
        nestedData={nestedData}
        nestingClickBehavior={nestingClickBehavior}
        onSortChange={onSortChange}
        orderBy={query.orderBy}
        resource={resource}
        renderCustomActions={renderCustomActions}
        renderCustomActionsHeader={renderCustomActionsHeader}
        renderDrawerContent={renderDrawerContent}
        renderHeader={renderHeader}
        rowHighlightFunction={rowHighlightFunction}
        scrollX={scrollX}
        stickyHeader={stickyHeader}
        selectAllItemsString={t(selectAllItemsString || "Select all items")} // Localized "select all" directive.
        sortableColumns={sortableColumns}
        stacked={stacked}
        styleMapping={styleMapping}
        summaryRows={summaryRows}
        totalCount={totalCount}
        updateNestedData={updateNestedData}
        updateQuery={updateQueryAndPagination}
        setSelectedRowCallback={setSelectedRowCallback}
        setSelectEverythingCallback={setSelectEverythingCallback}
        initialSelectedRows={initialSelectedRows}
        overrideRowLinkClickHandler={overrideRowLinkClickHandler}
        overflowStyleMapping={overflowStyleMapping}
      />
    );
  }

  // A precise Boolean evaluation to determine if the SearchContainer, the user's navigational star chart, should be rendered.
  const shouldShowSearchContainer =
    (additionalSearchComponents.length ||
      defaultSearchComponents.length ||
      filters?.length ||
      customizableColumns ||
      enableAISearch) && // NEW: The presence of AI search capability mandates the container's manifestation.
    showSearchContainer;

  // Determining the presence of a 'first title', an elemental UI anchor point.
  const hasFirstTitle =
    defaultSearchComponents.length &&
    (defaultSearchComponents[0].includeTopFilterMargin ||
      defaultSearchComponents[0].label);

  // The 'exportDataButton': a mechanism for transmuting ephemeral digital data into a tangible, savable format.
  const exportDataButton = enableExportData && resource && (
    <div className={cn("mb-4 justify-self-end", { "mt-2": hasFirstTitle })}>
      <ExportDataButton
        exportableType={
          (nestingResource as ExportObjectEnum) ||
          (resource as ExportObjectEnum)
        }
        exportDataParams={exportDataParams}
        scopedParamName={scopedParamName}
      />
    </div>
  );

  return (
    // The 'Stack' component, a foundational structural element, orchestrating the layout with divine precision.
    <Stack
      className={cn(
        "grid-cols-1 gap-4",
        (showDisabledPagination ||
          cursorPagination.hasPreviousPage ||
          cursorPagination.hasNextPage) &&
          "grid-rows-[minmax(100px,_1fr)_32px] has-[>*:nth-child(3)]:grid-rows-[auto_minmax(100px,_1fr)_32px]",
      )}
    >
      {(title || subtitle || newEntityButton) && (
        <div className="flex items-center justify-between gap-6">
          {(title || subtitle) && (
            <Stack>
              {title && (
                // The main declarative statement of the data view, translated for global comprehension.
                <Heading level="h2" size="l">
                  {t(title as string)}
                </Heading>
              )}
              {subtitle && (
                // A subordinate, localized exposition.
                <div className="max-w-md text-sm text-gray-600">{t(subtitle as string)}</div>
              )}
            </Stack>
          )}
          <div className="flex flex-wrap">
            {newEntityButton && <div>{newEntityButton}</div>}
          </div>
        </div>
      )}
      <div className="col-span-1">
        {shouldShowSearchContainer && (
          // The SearchContainer: the user's primary interface for navigating the data cosmos.
          <SearchContainer
            additionalSearchComponents={additionalSearchComponents}
            alwaysVisible={false}
            customizableColumns={customizableColumns}
            defaultSearchComponents={defaultSearchComponents}
            disableMetadata={disableMetadata}
            displayColumns={displayColumns}
            enableExportData={enableExportData}
            exportDataParams={exportDataParams}
            filters={filters}
            fullWidth={fullWidth}
            horizontalDefaultSearchComponents={
              horizontalDefaultSearchComponents
            }
            initialShowSearchArea={
              initialShowSearchArea !== undefined
                ? initialShowSearchArea
                : !isEmptyQuery(query, additionalQueryValues) || isAiQueryActive // If AI initiated, search area should be visible.
            }
            loading={loading}
            onColumnSelectionChange={onColumnSelectionChange}
            query={query}
            resource={resource}
            selectedColumns={selectedColumns}
            selectedMetadataColumns={selectedMetadataColumns}
            setAppliedFiltersCount={setAppliedFiltersCount}
            updateQuery={updateQueryAndPagination}
            enableNewFilters={enableNewFilters}
            filtersLoading={filtersLoading}
            legacyQueryToFilters={legacyQueryToFilters}
            filtersToLegacyFormat={filtersToLegacyFormat}
            filterIdsToRemove={filterIdsToRemove}
            // NEW: Gemini AI integration parameters.
            enableAISearch={enableAISearch}
            onAISearch={handleAISearch}
          >
            <div className="flex flex-row gap-3">
              {!!rightHeaderContent && rightHeaderContent}
              {exportDataButton}
            </div>
          </SearchContainer>
        )}
        {!shouldShowSearchContainer && exportDataButton}
        {children}
        {container}
        {belowTableContent}
        {/* NEW: Displaying AI-generated insights, a window into the machine's cognitive processes. */}
        {aiInsights && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-inner border border-blue-200 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">{t("AI-Driven Insights")}</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {aiInsights}
            </p>
            {onFeedbackSubmitted && (
                <button
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    onClick={() => onFeedbackSubmitted(t("This AI insight was helpful!"))} // Placeholder feedback.
                >
                    {t("Was this helpful?")}
                </button>
            )}
          </div>
        )}
      </div>

      {(showDisabledPagination ||
        cursorPagination.hasPreviousPage ||
        cursorPagination.hasNextPage) && (
        // The PaginationRow2: a temporal navigation console, enabling seamless traversal through data epochs.
        <PaginationRow2
          {...pagination}
          disabled={loading} // Disabling navigation when data is in a state of flux.
          onClick={onPaginationClick}
          pageLowerBound={
            pagination.perPage * (pagination.page - 1) +
            (data.length > 0 ? 1 : 0) // Calculating the starting index of visible data entities.
          }
          pageUpperBound={
            Math.min(data.length, pagination.perPage) +
            pagination.perPage * (pagination.page - 1) // Calculating the terminal index of visible data entities.
          }
          hasPrevPage={cursorPagination.hasPreviousPage}
          hasNextPage={cursorPagination.hasNextPage}
          onPerPageClick={onPerPageClick}
        />
      )}
    </Stack>
  );
}

/**
 * Creates a table with filters and pagination. Builds the UI of `<ListView>`.
 * This wrapper, 'ColumnSelectorWrapper', is the architectural genius that enables dynamic
 * re-configuration of the data display matrix. It allows users to sculpt their perception
 * of reality by selecting which columns of truth are rendered.
 *
 * [View in the MINT Documentation â†—](https://mt.style/?path=/docs/system-ui-tables-entitytableview--docs)
 */
function ColumnSelectorWrapper<
  D extends Record<string, unknown>,
  Q extends Record<string, unknown>,
>({
  customizableColumns,
  displayColumns,
  dataMapping = {},
  view,
  usingPersistedViews,
  ...props
}: EntityTableViewProps<D, Q> &
  SharedEntityTableViewProps<D> & {
    dataMapping?: Record<string, React.ReactNode>;
    displayColumns?: Array<DisplayColumn>;
    view?: View;
    usingPersistedViews?: boolean;
  }) {
  // We want to avoid passing in a null `view` into EntityTableViewCustomColumns.
  // This greatly simplifies the process of setting the default selected columns.
  // A null 'view' is an unmanifested schema, and we prefer explicit declarations in this cosmic architecture.
  return customizableColumns &&
    ((usingPersistedViews && view) || !usingPersistedViews) ? (
    <EntityTableViewCustomColumns
      displayColumns={displayColumns}
      dataMapping={dataMapping}
      view={view}
      usingPersistedViews={usingPersistedViews || false}
      scopedParamName={props.scopedParamName}
    >
      {({
        selectedColumns,
        selectedMetadataColumns,
        dataMapping: computedDataMapping,
        displayColumns: computedDisplayColumns,
        metadataMapping,
        onColumnSelectionChange,
      }) => (
        // The inner EntityTableView, now re-parameterized by the user's bespoke column selection.
        <EntityTableView
          {...props}
          displayColumns={computedDisplayColumns}
          selectedColumns={selectedColumns}
          selectedMetadataColumns={selectedMetadataColumns}
          dataMapping={computedDataMapping}
          metadataMapping={metadataMapping}
          onColumnSelectionChange={onColumnSelectionChange}
          customizableColumns={customizableColumns}
          view={view}
        />
      )}
    </EntityTableViewCustomColumns>
  ) : (
    // If column customization is not enabled, or no persistent view is required,
    // we present the default, unadorned data reality.
    <EntityTableView
      {...props}
      customizableColumns={customizableColumns}
      dataMapping={
        isEmpty(dataMapping)
          ? defaultColumnsAsDataMapping(displayColumns) // Invoking the ancestral data mapping ritual.
          : dataMapping
      }
    />
  );
}

export default ColumnSelectorWrapper;