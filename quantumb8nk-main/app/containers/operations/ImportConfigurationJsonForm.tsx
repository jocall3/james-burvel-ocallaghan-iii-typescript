// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field, Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import {
  FormikErrorMessage,
  FormikTextareaField,
} from "../../../common/formik";
import { Button, Label } from "../../../common/ui-components";

const DEFAULT_INITIAL_VALUES: ImportFormValues = {
  configurationJson: "",
};

const isValidJson = (value?: string): boolean => {
  try {
    JSON.parse(value as string);
    return true;
  } catch (error) {
    return false;
  }
};

const hasKeys = (value?: string): boolean =>
  Object.keys(JSON.parse(value as string) as object).length === 0;

const VALIDATION_SCHEMA = Yup.object({
  configurationJson: Yup.string()
    .required("Configuration JSON is required")
    .test("is-valid-json", "Invalid JSON format", (value) => isValidJson(value))
    .test(
      "has-keys",
      "JSON cannot be empty",
      (value) => !isValidJson(value) || !hasKeys(value),
    ),
});

export interface ImportFormValues {
  configurationJson: string;
}

interface ImportConfigurationJsonFormProps {
  initialValues?: ImportFormValues;
  helpText: string;
  placeholder: string;
  onSubmit: (values: ImportFormValues) => Promise<void>;
}

function ImportConfigurationJsonForm({
  initialValues = DEFAULT_INITIAL_VALUES,
  helpText,
  placeholder,
  onSubmit,
}: ImportConfigurationJsonFormProps) {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={VALIDATION_SCHEMA}
      validateOnMount
    >
      {({ isValid, isSubmitting }) => (
        <Form className="grid grid-cols-[minmax(0,2fr),1fr] gap-4">
          <div>
            <Label id="configurationJson" helpText={helpText}>
              Configuration JSON
            </Label>
            <Field
              id="configurationJson"
              name="configurationJson"
              placeholder={placeholder}
              component={FormikTextareaField}
              rows={35}
              required
            />
            <FormikErrorMessage name="configurationJson" />
            <div className="pt-4">
              <Button
                buttonType="primary"
                isSubmit
                disabled={isSubmitting || !isValid}
              >
                Import
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default ImportConfigurationJsonForm;
