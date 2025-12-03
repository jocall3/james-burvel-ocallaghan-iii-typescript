// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useEffect, useRef } from "react";
import { Popover as HeadlessPopover } from "@headlessui/react";
import invariant from "ts-invariant";
import {
  LogicalForm__InputTypeEnum,
  TimeFormatEnum,
} from "~/generated/dashboard/graphqlSchema";
import { cn } from "~/common/utilities/cn";
import { AppliedFilterType } from "./util";
import { Popover, PopoverPanel } from "../../../common/ui-components";
import FilterInputTypeRenderer from "./FilterInputRenderer";

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideAlerter(
  ref: React.MutableRefObject<HTMLDivElement | null>,
  handler: () => void,
  handleClickAddFilter: () => void,
  shouldBindListener: boolean,
  filterSelectorDropdownRef: React.MutableRefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterSelectorDropdownRef?.current &&
        filterSelectorDropdownRef?.current.contains(event.target as Node)
      ) {
        handleClickAddFilter();
      } else if (ref?.current && !ref?.current.contains(event.target as Node)) {
        handler();
      }
    }

    if (shouldBindListener) {
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    return () => {};
  }, [
    ref,
    handler,
    shouldBindListener,
    filterSelectorDropdownRef,
    handleClickAddFilter,
  ]);
}

/**
 * Hook that alerts when the Enter or Escape key is pressed.
 * Prevents the default event action to prevent conflict with text inputs
 */
function useKeyPressAlerter(handler: () => void) {
  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        handler();
      }
    }

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handler]);
}

interface AppliedFilterDropdownProps {
  onChange: (filter: AppliedFilterType) => void;
  appliedFilter: AppliedFilterType;
  children: (args: { popoverOpen: boolean }) => React.ReactNode;
  onClose: () => void;
  filterSelectorDropdownRef: React.MutableRefObject<HTMLButtonElement | null>;
  handleClickAddFilter: () => void;
}

function AppliedFilterDropdownPanel({
  appliedFilter,
  onChange,
  onClose,
}: {
  onChange: (filter: AppliedFilterType) => void;
  appliedFilter: AppliedFilterType;
  onClose: () => void;
}) {
  // Close the dropdown when the user presses Escape or Enter
  useKeyPressAlerter(onClose);
  return (
    <FilterInputTypeRenderer
      appliedFilter={appliedFilter}
      onChange={onChange}
      onClose={onClose}
    />
  );
}

function isDateChange(
  type: LogicalForm__InputTypeEnum,
  change: AppliedFilterType,
  format: TimeFormatEnum,
) {
  if (LogicalForm__InputTypeEnum.DateInput !== type) {
    return false;
  }
  invariant(typeof change.value === "object" && !Array.isArray(change.value));
  return change.value.format === format;
}

function AppliedFilterDropdown({
  appliedFilter,
  children,
  onChange,
  onClose,
  filterSelectorDropdownRef,
  handleClickAddFilter,
}: AppliedFilterDropdownProps) {
  const wrapperRef = useRef(null);

  // Call the handler after closing the dropdown panel
  // This will either remove the filter pill (if the value is empty)
  // or remove the applying flag.
  function handleClickOutside() {
    onClose();
  }

  useOutsideAlerter(
    wrapperRef,
    handleClickOutside,
    handleClickAddFilter,
    appliedFilter.applying,
    filterSelectorDropdownRef,
  );

  return (
    <div
      ref={wrapperRef}
      data-dd-action-name={`applied filter dropdown: ${appliedFilter.name}`}
    >
      <Popover className="relative bg-white">
        {({ open }) => (
          <>
            <HeadlessPopover.Button className="outline-none">
              {children({ popoverOpen: open as boolean })}
            </HeadlessPopover.Button>
            <PopoverPanel
              className={cn(
                "w-60 rounded-sm bg-white shadow",
                appliedFilter.type ===
                  LogicalForm__InputTypeEnum.MultiAccountSelect &&
                  "border-none",
                appliedFilter.type !== LogicalForm__InputTypeEnum.DateInput &&
                  "max-h-96",
              )}
              // This forces the dropdown panel to be shown by default when applying a new filter
              staticPanel={appliedFilter.applying}
            >
              {({ close }) => (
                <AppliedFilterDropdownPanel
                  appliedFilter={appliedFilter}
                  onChange={(change) => {
                    // For Single Select style inputs, automatically close the popover
                    // after a selection has been made.
                    if (
                      [
                        LogicalForm__InputTypeEnum.SingleSelect,
                        LogicalForm__InputTypeEnum.CounterpartySelect,
                        LogicalForm__InputTypeEnum.InvoiceSelect,
                        LogicalForm__InputTypeEnum.ReconciliationRuleSelect,
                        LogicalForm__InputTypeEnum.PreviewReconciliationRuleSelect,
                      ].includes(appliedFilter.type) ||
                      // Duration format (i.e. "Past Week") are single select style
                      isDateChange(
                        appliedFilter.type,
                        change,
                        TimeFormatEnum.Duration,
                      )
                    ) {
                      (close as () => void)();
                      onChange({ ...change, applying: false });
                    } else if (
                      // Date style uses DateInput, only call onChange
                      // when the values change (rather than on every keystroke)
                      isDateChange(
                        appliedFilter.type,
                        change,
                        TimeFormatEnum.Date,
                      )
                    ) {
                      invariant(
                        typeof change.value === "object" &&
                          !Array.isArray(change.value),
                      );
                      invariant(
                        appliedFilter.value === undefined ||
                          (typeof appliedFilter.value === "object" &&
                            !Array.isArray(appliedFilter.value)),
                      );
                      if (
                        change.value.lte !== appliedFilter.value?.lte ||
                        change.value.gte !== appliedFilter.value?.gte
                      ) {
                        onChange(change);
                      }
                    } else {
                      onChange(change);
                    }
                  }}
                  onClose={() => {
                    (close as () => void)();
                    onClose();
                  }}
                />
              )}
            </PopoverPanel>
          </>
        )}
      </Popover>
    </div>
  );
}

export default AppliedFilterDropdown;
