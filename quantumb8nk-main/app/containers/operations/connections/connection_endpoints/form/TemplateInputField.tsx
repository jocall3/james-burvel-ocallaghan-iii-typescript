// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field } from "formik";
import React, { ReactNode } from "react";
import {
  FormikCheckboxField,
  FormikErrorMessage,
  FormikInputField,
  FormikSelectField,
  FormikTextareaField,
} from "~/common/formik";
import { FieldGroup, Label } from "~/common/ui-components";
import { ConnectionEndpointTemplateField } from "~/generated/dashboard/graphqlSchema";

const validateRequired = (value) =>
  value === undefined || value === null || value === ""
    ? "This field is required"
    : undefined;

export enum TemplateInputFieldType {
  CHECKBOX,
  TEXTAREA,
  SELECT_OR_INPUT,
}
interface TemplateInputFieldProps {
  fieldName: string;
  connectionEndpointTemplateField: ConnectionEndpointTemplateField | undefined;
  inputType?: TemplateInputFieldType;
}

function TemplateInputField({
  fieldName,
  connectionEndpointTemplateField,
  inputType = TemplateInputFieldType.SELECT_OR_INPUT,
}: TemplateInputFieldProps) {
  // If a field is not defined by a template, it's disabled by default.
  const { options, required, disabled } = connectionEndpointTemplateField || {
    disabled: true,
    required: false,
  };

  const fieldConditional = required ? undefined : "Optional";
  const validate = required ? validateRequired : undefined;

  let fieldComponent: ReactNode;

  switch (inputType) {
    case TemplateInputFieldType.CHECKBOX: {
      fieldComponent = (
        <Field
          name={fieldName}
          component={FormikCheckboxField}
          type="checkbox"
          disabled={disabled}
          value
        />
      );
      break;
    }
    case TemplateInputFieldType.TEXTAREA: {
      fieldComponent = (
        <Field
          name={fieldName}
          component={FormikTextareaField}
          disabled={disabled}
        />
      );
      break;
    }
    case TemplateInputFieldType.SELECT_OR_INPUT:
    default: {
      if (options) {
        const fieldOptions = options.map((option: string) => ({
          label: option,
          value: option,
        }));

        fieldComponent = (
          <Field
            name={fieldName}
            component={FormikSelectField}
            validate={validate}
            isDisabled={disabled}
            options={fieldOptions}
          />
        );
      } else {
        fieldComponent = (
          <Field
            name={fieldName}
            component={FormikInputField}
            validate={validate}
            disabled={disabled}
          />
        );
      }
    }
  }

  return (
    <FieldGroup>
      <Label fieldConditional={fieldConditional}>{fieldName}</Label>
      {fieldComponent}
      <FormikErrorMessage name={fieldName} />
    </FieldGroup>
  );
}

export default TemplateInputField;
