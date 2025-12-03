// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { differenceWith, isEmpty, isEqual, isNil, omit, omitBy } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { Popover } from "@headlessui/react";
import { FieldArray, Formik } from "formik";
import invariant from "ts-invariant";
import { cn } from "~/common/utilities/cn";
import { parse } from "~/common/utilities/queryString";
import { ButtonClickEventTypes } from "~/common/ui-components";
import useViewDocument from "~/common/utilities/persisted_views/useViewDocument";
import { FILTER_AREA_EVENTS } from "~/common/constants/analytics";
import {
  AppliedFilterType,
  FilterType,
  metadataValueFromURLToState,
} from "./util";
import FilterPill from "./FilterPill";
import FilterSelectorDropdown, {
  PopoverTrigger,
} from "./FilterSelectorDropdown";
import useQueryParams from "./useQueryParams";
import {
  LogicalForm__InputTypeEnum,
  View,
  ViewDocumentTypeEnum,
  ResourceEnum,
} from "../../../generated/dashboard/graphqlSchema";
import { ACCOUNT_DATE_RANGE_FILTER_OPTIONS } from "../../containers/reconciliation/utils";
import { DateRangeValues } from "../../../common/ui-components/DateRangePicker/DateRangePicker";
import ColumnSelectorDropdown, {
  ColumnSelectorDropdownProps,
} from "../ColumnSelectorDropdown";
import ExportDataButton, { ExportDataButtonProps } from "../ExportDataButton";
import AppliedFilterDropdown from "./AppliedFilterDropdown";
import trackEvent from "../../../common/utilities/trackEvent";
import ClearFiltersButton from "../ClearFiltersButton";

const filterValues = (
  filtersFromURL: Record<string, unknown>,
  filtersFromViewDocument: Record<string, unknown>,
  defaultFilters: Record<string, unknown>,
) => {
  if (!isEmpty(filtersFromURL)) {
    return filtersFromURL;
  }
  if (!isEmpty(filtersFromViewDocument)) {
    return filtersFromViewDocument;
  }
  return defaultFilters;
};

/**
 * Finds the matching Filter entry for all keys in the
 * query string filters
 */
function enhanceFiltersFromURL(
  filters: Array<FilterType | AppliedFilterType>,
  filtersFromURL: Record<string, unknown>,
  filtersFromViewDocument: Record<string, unknown>,
) {
  const availableFilterNameToAvailableFiltersMap: Record<string, FilterType> =
    filters.reduce(
      (obj, item) => ({ ...obj, [item.key]: item }) as FilterType,
      {},
    );

  const defaultFilters = filters
    .filter((item) => item.default)
    .reduce(
      (obj, item) => ({
        ...obj,
        [item.key]: (item as AppliedFilterType).value,
      }),
      {},
    );

  const enhancedFiltersFromURL = Object.entries(
    filterValues(filtersFromURL, filtersFromViewDocument, defaultFilters),
  ).map(
    ([key, value]) =>
      ({
        ...availableFilterNameToAvailableFiltersMap[key],
        value,
      }) as AppliedFilterType,
  );

  return enhancedFiltersFromURL;
}

/**
 * Takes the filters from the query string and converts them
 * to a structure which matches the AppliedFilterType
 */
function parseURLForAppliedFilters(
  filters: FilterType[],
  filtersFromURL: Record<string, unknown>,
  filtersFromViewDocument: Record<string, unknown>,
  setAppliedFiltersCount: Dispatch<SetStateAction<number>>,
) {
  const enhancedFiltersFromURL = enhanceFiltersFromURL(
    filters,
    filtersFromURL,
    filtersFromViewDocument,
  );
  let appliedFiltersFromURL: AppliedFilterType[] = [];

  enhancedFiltersFromURL.forEach((enhancedFilter) => {
    if (enhancedFilter.hidden) {
      return;
    }
    switch (enhancedFilter.type) {
      case LogicalForm__InputTypeEnum.DateInput: {
        const dateFilter = ACCOUNT_DATE_RANGE_FILTER_OPTIONS.find(
          (dateFilterOption) =>
            isEqual(dateFilterOption.dateRange, enhancedFilter?.value),
        );

        const exactDateValue = enhancedFilter?.value as Omit<
          DateRangeValues,
          "dateRange"
        >;

        if (exactDateValue?.lte || exactDateValue?.gte || dateFilter) {
          appliedFiltersFromURL.push({
            ...enhancedFilter,
            id: uuidv4(),
          });
        }
        break;
      }
      case LogicalForm__InputTypeEnum.MetadataInput: {
        const metadataFilters = metadataValueFromURLToState(
          omit(enhancedFilter, ["value"]),
          enhancedFilter.value as string,
        );
        appliedFiltersFromURL = appliedFiltersFromURL.concat(metadataFilters);
        break;
      }
      default: {
        appliedFiltersFromURL.push({
          ...enhancedFilter,
          id: uuidv4(),
        });
        break;
      }
    }
  });

  setAppliedFiltersCount(appliedFiltersFromURL.length);

  return appliedFiltersFromURL;
}

/**
 * Determines what the available filters are based on what is already applied
 * in the query string.
 */
function parseURLForInitialAvailableFilters(
  filters: Array<FilterType | AppliedFilterType>,
  filtersFromURL: Record<string, unknown>,
  filtersFromViewDocument: Record<string, unknown>,
) {
  const enhancedFiltersFromURL = enhanceFiltersFromURL(
    filters,
    filtersFromURL,
    filtersFromViewDocument,
  );

  const availableFiltersFromURL = differenceWith(
    filters,
    enhancedFiltersFromURL,
    (filter, enhancedFilterFromURL) =>
      enhancedFilterFromURL.key === filter.key && !filter.repeatable,
  );

  return availableFiltersFromURL;
}

function completeMetadataValue(appliedFilter: AppliedFilterType) {
  return (
    typeof appliedFilter.value === "object" &&
    !Array.isArray(appliedFilter.value) &&
    !!appliedFilter.value?.value &&
    !!appliedFilter.value?.key
  );
}

function completeAmountValue(appliedFilter: AppliedFilterType) {
  return (
    appliedFilter.type === LogicalForm__InputTypeEnum.AmountInput &&
    typeof appliedFilter.value === "object" &&
    !Array.isArray(appliedFilter.value) &&
    (appliedFilter.value.gte !== null || appliedFilter.value.lte !== null)
  );
}

const shouldDebounceQuery = (filterType: LogicalForm__InputTypeEnum | null) =>
  !!filterType &&
  [
    LogicalForm__InputTypeEnum.AmountInput,
    LogicalForm__InputTypeEnum.MetadataInput,
    LogicalForm__InputTypeEnum.NumberInput,
    LogicalForm__InputTypeEnum.TextInput,
  ].includes(filterType);

export interface FilterAreaProps {
  filterName?: ResourceEnum;
  handleRefetch?: (
    queryParams: Record<string, unknown>,
    debounceQuery: boolean,
  ) => Promise<void> | void;
  filterIdsToRemove?: Array<string>;
  legacyQueryToFilters?: (
    query: Record<string, unknown>,
  ) => Record<string, unknown>;
  view?: View;
}

/**
 * A wrapper to manage the overall state of the FilterArea.
 * This form stores an array of AppliedFilters and is responsible for adding,
 * removing and updating the items in the list.
 */
function FilterAreaFormikWrapper({
  availableFilters,
  setAvailableFilters,
  onChange,
  initialValues,
  filterSelectorDropdownLabel,
  setAppliedFiltersCount = () => {},
}: {
  availableFilters: Array<FilterType>;
  setAvailableFilters: (filters: Array<FilterType>) => void;
  onChange: (
    change: { filters: Array<AppliedFilterType> },
    debounceQuery: boolean,
  ) => void;
  initialValues: Array<AppliedFilterType>;
  filterSelectorDropdownLabel?: string;
  setAppliedFiltersCount?: Dispatch<SetStateAction<number>>;
}) {
  // There isn't a good way of passing arguments into Formik's `onSubmit` handler
  // This value stores the type of the filter which triggered the onSubmit handler
  const changeFilterType = useRef<LogicalForm__InputTypeEnum | null>(null);
  const filterSelectorDropdownRef = useRef(null);

  function handleRemoveFilter(filter: AppliedFilterType) {
    if (!filter.repeatable) {
      setAvailableFilters([
        ...availableFilters,
        omit(filter, ["id", "value", "applying"]),
      ]);
    }
  }

  function handleAddFilter(filter: FilterType) {
    if (!filter.repeatable) {
      setAvailableFilters(
        availableFilters.filter(
          (availableFilter) => availableFilter.name !== filter.name,
        ),
      );
    }
  }

  function handleOnClose(
    remove: (index: number) => void,
    replace: (index: number, data: AppliedFilterType) => void,
    values: {
      filters: Array<AppliedFilterType>;
    },
    filter: AppliedFilterType,
    index: number,
    timeout?: number,
  ) {
    // If the value is empty when the user closes the filter input dropdown,
    // remove the filter pill
    if (
      filter.value == null ||
      (filter.type === LogicalForm__InputTypeEnum.MetadataInput &&
        !completeMetadataValue(filter)) ||
      (filter.type === LogicalForm__InputTypeEnum.AmountInput &&
        !completeAmountValue(filter))
    ) {
      handleRemoveFilter(filter);
      if (timeout) {
        // The delay here allows the filter selector dropdown
        // to open before the pill is removed
        setTimeout(() => remove(index), timeout);
      } else {
        remove(index);
      }
    } else {
      replace(index, {
        ...values.filters[index],
        applying: false,
      });
    }
  }

  function handleClearFilters(
    filters: AppliedFilterType[],
    handleSubmit: () => void,
    resetForm: (nextState: object) => void,
  ): void {
    setAvailableFilters([...availableFilters, ...filters]);
    resetForm({ values: { filters: [] } });
    handleSubmit();
  }

  return (
    <Formik
      initialValues={{
        filters: initialValues,
      }}
      onSubmit={(values) => {
        onChange(values, shouldDebounceQuery(changeFilterType.current));
        changeFilterType.current = null;
      }}
    >
      {({ values, handleSubmit, resetForm }) => (
        <FieldArray name="filters">
          {({ push, replace, remove }) => (
            <>
              {values.filters.map((filter, index) => (
                <AppliedFilterDropdown
                  key={index}
                  appliedFilter={filter}
                  filterSelectorDropdownRef={filterSelectorDropdownRef}
                  handleClickAddFilter={() =>
                    handleOnClose(remove, replace, values, filter, index, 100)
                  }
                  onChange={(newFilter) => {
                    replace(index, newFilter);
                    changeFilterType.current = newFilter.type;
                    setTimeout(handleSubmit);
                  }}
                  onClose={() =>
                    handleOnClose(remove, replace, values, filter, index)
                  }
                >
                  {({ popoverOpen }) => (
                    <FilterPill
                      appliedFilter={filter}
                      removeFilter={(e: ButtonClickEventTypes) => {
                        if (!popoverOpen) {
                          // Prevents a popover from another pill from automatically opening
                          e.stopPropagation();
                        }
                        remove(index);
                        handleRemoveFilter(filter);
                        setTimeout(handleSubmit);
                        setAppliedFiltersCount(values.filters.length - 1);
                      }}
                    />
                  )}
                </AppliedFilterDropdown>
              ))}
              <div className="flex">
                <FilterSelectorDropdown
                  ref={filterSelectorDropdownRef}
                  key="newFilter"
                  label={filterSelectorDropdownLabel}
                  availableFilters={availableFilters}
                  hideFilterText={values.filters.length > 0}
                  onFilterSelect={(filter) => {
                    push({
                      ...filter,
                      applying: true,
                    });
                    handleAddFilter(filter);
                    setAppliedFiltersCount(values.filters.length + 1);
                  }}
                />
                {values.filters.length > 0 && (
                  <ClearFiltersButton
                    onClick={() =>
                      handleClearFilters(
                        values.filters,
                        handleSubmit,
                        resetForm,
                      )
                    }
                  />
                )}
              </div>
            </>
          )}
        </FieldArray>
      )}
    </Formik>
  );
}

/**
 * Filters out values from the view document that are not part of the available filters.
 * This will occur if we remove a filter and the view documents in the database become stale.
 */
function parseViewDocumentFilters(
  viewDocumentFilters: Record<string, unknown>,
  filters: Array<FilterType | AppliedFilterType>,
) {
  return Object.keys(viewDocumentFilters).reduce((acc, filterId) => {
    if (filters.find(({ key }) => key === filterId)) {
      return {
        ...acc,
        [filterId]: viewDocumentFilters[filterId],
      };
    }
    return acc;
  }, {});
}

function FilterArea({
  filterName,
  filters,
  handleRefetch,
  filterIdsToRemove = [],
  legacyQueryToFilters,
  view,
  onChange,
  disableQueryURLParams,
  filterSelectorDropdownLabel,
  appliedFilters,
  setAppliedFiltersCount = () => {},
}: FilterAreaProps & {
  filters: FilterType[];
  onChange?: (data: object) => void;
  disableQueryURLParams?: boolean;
  filterSelectorDropdownLabel?: string;
  appliedFilters?: AppliedFilterType[];
  setAppliedFiltersCount?: Dispatch<SetStateAction<number>>;
}) {
  const { viewDocument, updateViewDocument } = useViewDocument(
    view,
    ViewDocumentTypeEnum.Filters,
  );
  const [getFilters, setFilters] = useQueryParams();
  // Handle cases where a user bookmarks a link with legacy style filters
  const legacyFormatFilters = legacyQueryToFilters
    ? omitBy(
        legacyQueryToFilters(parse(window.location.search)),
        (value) => isNil(value) || isEmpty(value),
      )
    : {};

  const filtersFromViewDocument = viewDocument
    ? parseViewDocumentFilters(
        JSON.parse(viewDocument.document) as Record<string, unknown>,
        filters,
      )
    : {};
  const filterFromURL = {
    ...legacyFormatFilters,
    ...getFilters(String(filterName)),
  };
  const appliedFilterKeys = appliedFilters?.map((a) => a.key) || [];
  const [availableFilters, setAvailableFilters] = useState<Array<FilterType>>(
    parseURLForInitialAvailableFilters(
      filters,
      filterFromURL,
      filtersFromViewDocument,
    )
      .filter((filter) => !filterIdsToRemove.includes(filter.key))
      .filter((filter) => !appliedFilterKeys.includes(filter.key)),
  );

  return (
    <FilterAreaFormikWrapper
      availableFilters={availableFilters}
      setAvailableFilters={setAvailableFilters}
      setAppliedFiltersCount={setAppliedFiltersCount}
      initialValues={
        appliedFilters ||
        parseURLForAppliedFilters(
          filters,
          filterFromURL,
          filtersFromViewDocument,
          setAppliedFiltersCount,
        )
      }
      filterSelectorDropdownLabel={filterSelectorDropdownLabel}
      // On change, convert the array of filters into a hash which can be consumed
      // by a graphql request
      onChange={(values, debounceQuery) => {
        // Combine metadata filter entries into a single hash
        const metadataFilters = values.filters
          .filter(
            (filter) =>
              filter.type === LogicalForm__InputTypeEnum.MetadataInput,
          )
          .reduce((acc, filter) => {
            invariant(
              typeof filter.value === "object" && !Array.isArray(filter.value),
            );
            const { key } = filter.value;
            invariant(typeof key === "string");
            return {
              ...acc,
              [key]: filter.value.value,
            };
          }, {});

        // Create a hash of hidden filters that are not part of the form state
        const hiddenFilters = Object.keys(filterFromURL).reduce((acc, key) => {
          if (filters.find((filter) => filter.key === key && !filter.hidden)) {
            return acc;
          }
          return {
            ...acc,
            [key]: filterFromURL[key],
          };
        }, {});

        // Create a combined filter hash with metadata, hidden filters and applied filters.
        const combinedFilters = values.filters
          .filter(
            (filter) =>
              filter.type !== LogicalForm__InputTypeEnum.MetadataInput,
          )
          .reduce(
            (acc, filter) => ({
              ...acc,
              [filter.key]: filter.value || undefined,
            }),
            {
              ...hiddenFilters,
              metadata: Object.keys(metadataFilters).length
                ? JSON.stringify(metadataFilters)
                : undefined,
            },
          );

        // Create an empty hash of all unused filters
        // This way the calling component can combine the change with an existing value.
        const emptyFilters = availableFilters
          .filter((filter) => !combinedFilters[filter.key])
          .reduce(
            (acc, filter) => ({
              ...acc,
              [filter.key]: undefined,
            }),
            {},
          );

        const updatedFiltersForTable = {
          ...combinedFilters,
          ...emptyFilters,
        };

        // Call handlers with fully combined hash
        if (!disableQueryURLParams) {
          setFilters(String(filterName), updatedFiltersForTable);
        }
        void updateViewDocument(JSON.stringify(updatedFiltersForTable));
        trackEvent(null, FILTER_AREA_EVENTS.FILTER_AREA_CHANGED, {
          ...updatedFiltersForTable,
        });
        if (handleRefetch)
          void handleRefetch(updatedFiltersForTable, debounceQuery);
        if (onChange) onChange(updatedFiltersForTable);
      }}
    />
  );
}

function FilterAreaContainer({
  leftContent,
  rightContent,
  fullWidth,
  constraintFilter,
}: {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  fullWidth?: boolean;
  constraintFilter?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between border-alpha-black-100 bg-background-default px-4 pt-3",
        fullWidth ? "border-l" : "rounded-t border-x border-t",
        constraintFilter && "rounded border",
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-3 pb-3">
        {leftContent}
      </div>
      <div className="flex gap-2 pb-3">{rightContent}</div>
    </div>
  );
}

/**
 * Wrapper to render the content even when we don't have filter records.
 */
function FilterAreaLoadingWrapper({
  filtersLoading,
  columnSelectorDropdownProps,
  exportDataButtonProps,
  filterName,
  filtersToLegacyFormat,
  view,
  customizableColumns,
  enableExportData,
  fullWidth,
  constraintFilter,
  onChange,
  disableQueryURLParams,
  filterSelectorDropdownLabel,
  appliedFilters,
  ...filterAreaProps
}: FilterAreaProps & {
  columnSelectorDropdownProps?: ColumnSelectorDropdownProps;
  exportDataButtonProps?: ExportDataButtonProps;
  filtersLoading?: boolean;
  filters: FilterType[] | undefined;
  filtersToLegacyFormat?: (
    query: Record<string, unknown>,
  ) => Record<string, unknown>;
  customizableColumns?: boolean;
  enableExportData?: boolean;
  fullWidth?: boolean;
  constraintFilter?: boolean;
  onChange?: (data: object) => void;
  disableQueryURLParams?: boolean;
  filterSelectorDropdownLabel?: string;
  appliedFilters?: AppliedFilterType[];
  setAppliedFiltersCount?: Dispatch<SetStateAction<number>>;
}) {
  return (
    <FilterAreaContainer
      leftContent={
        !filtersLoading && filterAreaProps.filters ? (
          <FilterArea
            {...filterAreaProps}
            filters={filterAreaProps.filters}
            filterName={filterName}
            view={view}
            onChange={onChange}
            disableQueryURLParams={disableQueryURLParams}
            filterSelectorDropdownLabel={filterSelectorDropdownLabel}
            appliedFilters={appliedFilters}
            setAppliedFiltersCount={filterAreaProps.setAppliedFiltersCount}
          />
        ) : (
          <Popover>
            <PopoverTrigger disabled />
          </Popover>
        )
      }
      rightContent={
        <>
          {customizableColumns && columnSelectorDropdownProps && (
            <ColumnSelectorDropdown
              {...columnSelectorDropdownProps}
              inFilters
            />
          )}
          {enableExportData && exportDataButtonProps && (
            <ExportDataButton
              {...exportDataButtonProps}
              buttonHeight="extra-small"
              filterName={filterName}
              filtersToLegacyFormat={filtersToLegacyFormat}
            />
          )}
        </>
      }
      fullWidth={Boolean(fullWidth)}
      constraintFilter={Boolean(constraintFilter)}
    />
  );
}

export default FilterAreaLoadingWrapper;
