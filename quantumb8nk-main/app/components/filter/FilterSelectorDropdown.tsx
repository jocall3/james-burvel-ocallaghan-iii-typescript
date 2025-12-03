// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { forwardRef } from "react";
import { Popover as HeadlessPopover, Transition } from "@headlessui/react";
import { cn } from "~/common/utilities/cn";
import { FilterType } from "./util";
import { Icon, Popover, PopoverPanel } from "../../../common/ui-components";
import FilterSelector from "./FilterSelector";

interface FilterSelectorDropdownProps {
  availableFilters: Array<FilterType>;
  hideFilterText: boolean;
  onFilterSelect: (filter: FilterType) => void;
  label?: string;
}

interface PopoverTriggerProps {
  hideFilterText?: boolean;
  disabled?: boolean;
  label?: string;
}

export const PopoverTrigger = forwardRef(
  (
    { hideFilterText = false, disabled = false, label }: PopoverTriggerProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) => (
    <HeadlessPopover.Button
      id="filterButton"
      ref={ref}
      disabled={disabled}
      className={cn(
        "bg-white px-2 py-1",
        "grid-flow-col items-center justify-center gap-1 whitespace-nowrap ",
        "grid rounded-sm outline-none focus:outline-none " +
          "border bg-button-background-default " +
          "hover:border-gray-200 hover:bg-gray-25 active:border-gray-300 active:bg-gray-50 " +
          "focus:border-blue-500 focus:border-transparent focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:opacity-50 " +
          "font-medium disabled:cursor-not-allowed",
      )}
    >
      {label && <span className="text-xs text-gray-700">{label}</span>}
      <Icon
        iconName="filter_list"
        size="s"
        color="currentColor"
        className="text-gray-700"
      />
      {!hideFilterText && <span className="sr-only">Filter</span>}
    </HeadlessPopover.Button>
  ),
);

const FilterSelectorDropdown = forwardRef(
  (
    {
      availableFilters,
      hideFilterText,
      onFilterSelect,
      label,
    }: FilterSelectorDropdownProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) => (
    <Popover className="relative bg-white">
      <PopoverTrigger hideFilterText={hideFilterText} ref={ref} label={label} />
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        className="relative z-40"
      >
        <PopoverPanel className="max-h-96 w-60 overflow-y-scroll rounded-sm !border-gray-100 bg-white shadow">
          {({ close }) => (
            <FilterSelector
              availableFilters={availableFilters}
              onFilterSelect={(filter) => {
                (close as () => void)();
                // Adding a small delay opening the applied filter dropdown
                // allows for the closing animation to complete
                setTimeout(() => onFilterSelect(filter), 100);
              }}
            />
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  ),
);

export default FilterSelectorDropdown;
