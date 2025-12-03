// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field } from "formik";
import { FormikInputField, FormikErrorMessage } from "~/common/formik";
import { FieldsRow, FieldGroup, Label } from "~/common/ui-components";
import CategorizationMetadataValidation from "./CategorizationMetadataValidation";

function TransactionCategorizationRulePreLogicalFields() {
  const required = (value: string): string | undefined => {
    if (!value) {
      return "This field is required";
    }

    return undefined;
  };

  return (
    <FieldsRow columns={1}>
      <FieldGroup>
        <Label className="font-medium">Name</Label>
        <Field
          name="name"
          component={FormikInputField}
          placeholder="Name"
          validate={required}
        />
        <FormikErrorMessage name="name" className="text-xs" />
      </FieldGroup>
      <FieldGroup>
        <Label className="font-medium">Description</Label>
        <Field
          name="description"
          component={FormikInputField}
          placeholder="Description"
          optionalLabel="Optional"
        />
        <FormikErrorMessage name="description" className="text-xs" />
      </FieldGroup>
      <CategorizationMetadataValidation />
    </FieldsRow>
  );
}

export default TransactionCategorizationRulePreLogicalFields;
