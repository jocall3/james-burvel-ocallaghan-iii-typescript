// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { FieldProps } from "formik";
import { get } from "lodash";
import sanitizeAmount from "../../../common/utilities/sanitizeAmount";
import { CurrencyInput } from "../../../common/ui-components";
import { AppliedFilterType } from "./util";

type FormikAmountSearchProps = FieldProps & {
  name: string;
  id: string;
  disabled: boolean;
  allowNegative: boolean;
  placeholder: string;
  exponent?: number;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: number | null,
  ) => void;
};

function FormikAmountSearch({
  form,
  field,
  id,
  disabled,
  allowNegative,
  placeholder,
  exponent = 2,
  onChange,
}: FormikAmountSearchProps) {
  let value: number | undefined;

  const formValues = form?.values as Record<string, AppliedFilterType["value"]>;
  const queryField = get(formValues, field.name) as number;

  if (queryField) {
    value = queryField / 10 ** exponent;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: number | null;
    if (allowNegative && event.target.value === "-") {
      newValue = null;
    } else {
      newValue = event.target.value
        ? sanitizeAmount(event.target.value, exponent)
        : null;
    }

    void form.setFieldValue(field.name, newValue);
    if (onChange) {
      onChange(event, newValue);
    }
  };

  return (
    <CurrencyInput
      required
      disabled={disabled}
      id={id}
      input={{
        value,
        onChange: handleChange,
        name: field.name,
        className: "h-[24px] text-xs",
      }}
      allowNegative={allowNegative}
      placeholder={placeholder}
      decimalScale={exponent}
    />
  );
}

export default FormikAmountSearch;
