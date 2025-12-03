// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { FormikProps } from "formik";
import {
  Chip,
  Icon,
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from "../../../common/ui-components";
import MultiSelectDropdownPanel from "~/common/ui-components/MultiSelectDropdown/MultiSelectDropdownPanel";
import { cn } from "~/common/utilities/cn";

export default function MultiSelectDropdown({
  formikRef,
  fieldKey,
  options,
  placeholderText,
  initialValues,
}: {
  formikRef: React.RefObject<FormikProps<object>>;
  fieldKey: string;
  options: Array<{ value: string; label: string }>;
  placeholderText: string;
  initialValues?: string[];
}) {
  const [searchValue, setSearchValue] = useState("");
  const [currentValue, setCurrentValue] = useState(
    initialValues || ([] as string[]),
  );
  const formattedOptions = options.reduce((acc, curr) => {
    acc[curr.value] = curr.label;
    return acc;
  }, {});

  const initialLabels = initialValues?.length
    ? initialValues.map(
        (selectedLabel) => formattedOptions[selectedLabel] as string,
      )
    : [placeholderText];

  const [labels, setLabels] = useState(initialLabels);

  const onChangeAction = (selectedValues: Record<string, Array<string>>) => {
    let selectedValueArray = Object.keys(selectedValues).reduce<Array<string>>(
      (acc, key) => [...acc, ...selectedValues[key]],
      [],
    );

    // When setting permission sets only
    if (fieldKey.includes(".actions")) {
      // require "View" action if any other action is selected
      selectedValueArray =
        selectedValueArray.includes("read") || selectedValueArray.length === 0
          ? selectedValueArray
          : ["read", ...selectedValueArray];
    }
    setCurrentValue(selectedValueArray);
    if (selectedValueArray.length === 0) {
      setLabels([placeholderText]);
    } else {
      setLabels(selectedValueArray.map((e) => formattedOptions[e] as string));
    }
    void formikRef?.current?.setFieldValue(fieldKey, selectedValueArray);
  };

  return (
    <Popover className="w-full">
      <PopoverTrigger className="h-full min-h-8 w-full pr-1">
        {labels[0] === placeholderText ? (
          <span className={cn("flex w-full font-normal text-gray-500")}>
            {placeholderText}
          </span>
        ) : (
          <div className="flex w-full gap-1">
            {labels.map((label) => (
              <Chip key={label}>{label}</Chip>
            ))}
          </div>
        )}
        <Icon
          iconName="chevron_down"
          color="currentColor"
          className="text-gray-600"
        />
      </PopoverTrigger>
      <PopoverPanel className="max-h-96 overflow-y-auto">
        {(panelProps: { close: () => void }) => (
          <MultiSelectDropdownPanel
            onClose={panelProps.close}
            categories={[
              {
                id: "dropdown",
                items: options.map((o) => ({ id: o.value, label: o.label })),
                label: "",
              },
            ]}
            onChange={onChangeAction}
            initialValues={{
              dropdown: currentValue,
            }}
            onSearchValueChange={setSearchValue}
            searchValue={searchValue}
            className="border border-alpha-black-100"
          />
        )}
      </PopoverPanel>
    </Popover>
  );
}
