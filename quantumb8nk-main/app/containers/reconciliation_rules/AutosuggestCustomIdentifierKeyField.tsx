// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field, FieldProps, getIn, useFormikContext } from "formik";
import React from "react";
import { FormikErrorMessage } from "~/common/formik";
import { Autosuggest } from "~/common/ui-components";
import useExpectedPaymentCustomIdentifierKeys, {
  SUGGESTION_LIST_SIZE,
} from "~/common/utilities/useExpectedPaymentCustomIdentifierKeys";
import { FormValues } from "~/app/components/logical_form/LogicalTypes";
import { cn } from "~/common/utilities/cn";

interface AutosuggestCustomIdentiferKeyFieldProps {
  fieldName: string;
  customIdentifierField: boolean;
  validateField: (value: string) => void;
}

function AutosuggestCustomIdentiferKeyField({
  fieldName,
  customIdentifierField,
  validateField,
}: AutosuggestCustomIdentiferKeyFieldProps) {
  const { setFieldValue, errors, touched } = useFormikContext<
    FormValues & { customFieldName?: string }
  >();

  const [customerIdentifierKeys, getCustomerIdentifierKeys] =
    useExpectedPaymentCustomIdentifierKeys();

  const onKeyChange = (key: string) => {
    // (mchaudhry05): On initial load Autosuggest returns
    // a number for key and it results in this query throwing
    // a 500
    if (customIdentifierField && typeof key !== "number") {
      void getCustomerIdentifierKeys({
        variables: {
          first: SUGGESTION_LIST_SIZE,
          key,
        },
      });
    }
  };

  return (
    <>
      <Field
        id={fieldName}
        name={fieldName}
        validate={validateField}
        validateOnChange
      >
        {({ field: fieldProps }: FieldProps<string>) => (
          <Autosuggest
            required
            placeholder={
              customIdentifierField
                ? "Enter path to key"
                : "Enter text to match"
            }
            field={fieldProps.name}
            suggestions={
              customerIdentifierKeys?.map((k) => ({
                label: k,
                value: k,
              })) || []
            }
            // Pass in an empty but truthy value to override the default styling of Autosuggest.
            className={cn(
              "mr-0",
              getIn(errors, fieldName) && getIn(touched, fieldName)
                ? "border border-red-500"
                : "",
            )}
            onChange={(e) => {
              fieldProps.onChange(e);
              onKeyChange(e.target.value);
            }}
            onSuggestionSelect={(e, suggestion) => {
              void setFieldValue(fieldName, suggestion.suggestionValue);
            }}
            onFocus={() => {
              onKeyChange(fieldProps.value);
            }}
            onBlur={(e) => {
              fieldProps.onBlur(e);
            }}
            value={fieldProps.value || ""}
          />
        )}
      </Field>
      <FormikErrorMessage name={fieldName} className="text-sm" />
    </>
  );
}

export default AutosuggestCustomIdentiferKeyField;
