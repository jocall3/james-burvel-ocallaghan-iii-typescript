// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { startCase } from "lodash";
import React, { useMemo, useRef, useState } from "react";
import { useMountEffect } from "~/common/utilities/useMountEffect";
import { ActionItem, Icon, icons, Input } from "../../../common/ui-components";
import { FilterType } from "./util";

interface FilterSelectorProps {
  availableFilters: FilterType[];
  onFilterSelect: (selectedFilter: FilterType) => void;
}

/**
 * Renders the filter selecting state within `FilterSelectorDropdown`.
 */
function FilterSelector({
  availableFilters,
  onFilterSelect,
}: FilterSelectorProps) {
  const [searchForFilterValue, setSearchForFilterValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useMountEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  const listOfFilters = useMemo(() => {
    const sortedFilters = availableFilters.sort(
      (availableFilterA, availableFilterB) =>
        availableFilterA.rank - availableFilterB.rank,
    );

    const filtersMatchingSearch = sortedFilters.filter((sortedFilter) =>
      sortedFilter.name
        .toLowerCase()
        .includes(searchForFilterValue.toLowerCase()),
    );

    return filtersMatchingSearch.map((filterMatchingSearch) => (
      <ActionItem
        key={filterMatchingSearch.key}
        className="flex rounded-sm hover:bg-gray-25"
        hideFocusOutline
        onClick={() => {
          onFilterSelect(filterMatchingSearch);
        }}
      >
        <div className="flex items-center gap-2">
          <Icon
            size="s"
            iconName={filterMatchingSearch.icon as keyof typeof icons}
            className="text-gray-700"
            color="currentColor"
          />
          <span className="text-xs font-normal text-gray-700">
            {startCase(filterMatchingSearch.name)}
          </span>
        </div>
      </ActionItem>
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableFilters, searchForFilterValue]);

  return (
    <div className="flex h-full w-full flex-col rounded-sm bg-white">
      <Input
        placeholder="Search..."
        value={searchForFilterValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchForFilterValue(e.target.value);
        }}
        outline={false}
        name="filterSearch"
        className="px-4 text-xs"
        ref={inputRef}
      />
      <div className="rounded-b-sm border-t border-alpha-black-100 bg-white p-2">
        {listOfFilters.length ? (
          listOfFilters
        ) : (
          <p className="font-regular text-center text-xs text-gray-700">
            No Results Found.
          </p>
        )}
      </div>
    </div>
  );
}

export default FilterSelector;
