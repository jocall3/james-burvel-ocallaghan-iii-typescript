// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field, Form, Formik } from "formik";
import ReactTooltip from "react-tooltip";
import * as Yup from "yup";
import {
  FieldGroup,
  Label,
  FieldsRow,
  SelectValue,
  Tooltip,
} from "~/common/ui-components";
import {
  FormikErrorMessage,
  FormikInputField,
  FormikSelectField,
} from "~/common/formik";
import { CustomProcessingWindowFormValues } from "~/app/containers/operations/custom_processing_windows/form/FormValues";
import CustomProcessingWindowFormSummary from "./CustomProcessingFormSummary";

const DEFAULT_INTITIAL_VALUES: CustomProcessingWindowFormValues = {
  vendorConfigId: "",
  cutoffTime: "",
};

const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const CLOCK_TICK_REGEX = /^.*[05]$/;

const VALIDATION_SCHEMA = Yup.object({
  vendorConfigId: Yup.string().required("Config id is required"),
  cutoffTime: Yup.string()
    .required("Cutoff time is required")
    .matches(TIME_REGEX, "Cutoff time must match HH:MM format.")
    .matches(
      CLOCK_TICK_REGEX,
      "Cutoff time must match clock tick (5 minute increment starting from :00)",
    ),
});

interface CustomProcessingWindowFormProps {
  onSubmit: (data: CustomProcessingWindowFormValues) => Promise<void>;
  vendorConfigIdOptions: SelectValue[];
  initialValues?: CustomProcessingWindowFormValues;
  customProcessingWindowId?: string;
  connection: {
    id: string;
    name: string;
  };
}

function CustomProcessingWindowForm({
  onSubmit,
  vendorConfigIdOptions,
  initialValues = DEFAULT_INTITIAL_VALUES,
  customProcessingWindowId,
  connection,
}: CustomProcessingWindowFormProps) {
  const isEdit = !!customProcessingWindowId;

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={VALIDATION_SCHEMA}
      validateOnMount
    >
      {({ isSubmitting, isValid, values }) => (
        <Form className="grid grid-cols-[1fr,1fr] gap-4">
          <div>
            <FieldsRow>
              <FieldGroup>
                <Label>
                  <div>
                    Vendor Config ID
                    <ReactTooltip
                      id="vendorConfigId"
                      data-place="top"
                      data-type="dark"
                      data-effect="float"
                    />
                    <Tooltip
                      className="tooltip-holder"
                      data-for="vendorConfigId"
                      data-tip="Dropdown only includes kept vendor subscriptions."
                    />
                  </div>
                </Label>
                <Field
                  name="vendorConfigId"
                  component={FormikSelectField}
                  options={vendorConfigIdOptions}
                  isDisabled={isEdit}
                />
                <FormikErrorMessage name="vendorConfigId" />
              </FieldGroup>
            </FieldsRow>

            <FieldsRow>
              <FieldGroup>
                <Label>Cutoff Time</Label>
                <Field
                  name="cutoffTime"
                  placeholder="HH:MM"
                  component={FormikInputField}
                />
                <FormikErrorMessage name="cutoffTime" />
              </FieldGroup>
            </FieldsRow>
          </div>
          <CustomProcessingWindowFormSummary
            customProcessingWindowId={customProcessingWindowId}
            submitDisabled={isSubmitting || !isValid}
            customProcessingWindowFormValues={values}
            connection={connection}
          />
        </Form>
      )}
    </Formik>
  );
}

export default CustomProcessingWindowForm;
