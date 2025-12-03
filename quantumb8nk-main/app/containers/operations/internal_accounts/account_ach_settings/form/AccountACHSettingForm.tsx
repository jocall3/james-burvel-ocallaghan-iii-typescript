// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import {
  FieldGroup,
  Label,
  FieldsRow,
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionButton,
  AccordionPanel,
  Heading,
} from "~/common/ui-components";
import {
  FormikErrorMessage,
  FormikInputField,
  FormikSelectField,
} from "~/common/formik";
import { AccountACHSettingFormValues } from "./FormValues";
import AccountACHSettingFormSummary from "./AccountACHSettingFormSummary";

const IMMEDIATE_ORIGIN_REGEXP = /^(?:\s[a-zA-Z0-9-]{9}|[a-zA-Z0-9-]{9,10})$/;
const IMMEDIATE_DESTINATION_REGEXP = /^\d{9}$/;

const DEFAULT_INITIAL_VALUES: AccountACHSettingFormValues = {
  immediateOrigin: "",
  immediateOriginName: "",
  immediateDestination: "",
  immediateDestinationName: "",
  direction: null,
  connectionEndpointLabel: "",
};

const VALIDATION_SCHEMA = Yup.object({
  immediateOrigin: Yup.string()
    .required()
    .min(9)
    .max(10)
    .matches(
      IMMEDIATE_ORIGIN_REGEXP,
      "immediateOrigin must include only alpha-numeric characters, with an optional leading space",
    ),
  immediateOriginName: Yup.string().required(),
  immediateDestination: Yup.string()
    .required()
    .length(9)
    .matches(
      IMMEDIATE_DESTINATION_REGEXP,
      "immediateDestination should only include numeric characters.",
    ),
  immediateDestinationName: Yup.string().required(),
});

const DIRECTION_OPTIONS = [
  { value: null, label: "Credit + Debit" },
  { value: "credit", label: "Credit" },
  { value: "debit", label: "Debit" },
];

interface AccountACHSettingFormProps {
  onSubmit: (data: AccountACHSettingFormValues) => Promise<void>;
  initialValues?: AccountACHSettingFormValues;
  isEdit?: boolean;
}

function AccountACHSettingForm({
  onSubmit,
  initialValues = DEFAULT_INITIAL_VALUES,
  isEdit = false,
}: AccountACHSettingFormProps) {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={VALIDATION_SCHEMA}
      validateOnMount
    >
      {({ isSubmitting, isValid }) => (
        <Form className="grid grid-cols-[minmax(0,2fr),1fr] gap-4">
          <div>
            <FieldsRow>
              <FieldGroup>
                <Label>Direction</Label>
                <Field
                  name="direction"
                  component={FormikSelectField}
                  options={DIRECTION_OPTIONS}
                />
                <FormikErrorMessage name="direction" />
              </FieldGroup>
            </FieldsRow>

            <FieldsRow columns={2}>
              <FieldGroup>
                <Label>Immediate Origin</Label>
                <Field name="immediateOrigin" component={FormikInputField} />
                <FormikErrorMessage name="immediateOrigin" />
              </FieldGroup>

              <FieldGroup>
                <Label>Immediate Destination</Label>
                <Field
                  name="immediateDestination"
                  component={FormikInputField}
                />
                <FormikErrorMessage name="immediateDestination" />
              </FieldGroup>
            </FieldsRow>

            <FieldsRow columns={2}>
              <FieldGroup>
                <Label>Immediate Origin Name</Label>
                <Field
                  name="immediateOriginName"
                  component={FormikInputField}
                />
                <FormikErrorMessage name="immediateOriginName" />
              </FieldGroup>

              <FieldGroup>
                <Label>Immediate Destination Name</Label>
                <Field
                  name="immediateDestinationName"
                  component={FormikInputField}
                />
                <FormikErrorMessage name="immediateDestinationName" />
              </FieldGroup>
            </FieldsRow>

            <Accordion>
              <AccordionItem>
                <AccordionButton className="border-b px-0">
                  <Heading level="h2" size="l">
                    Additional Options
                  </Heading>
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel className="px-0">
                  <FieldsRow>
                    <FieldGroup>
                      <Label fieldConditional="Optional">
                        Connection Endpoint Label
                      </Label>
                      <Field
                        name="connectionEndpointLabel"
                        component={FormikInputField}
                      />
                      <FormikErrorMessage name="connectionEndpointLabel" />
                    </FieldGroup>
                  </FieldsRow>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </div>

          <AccountACHSettingFormSummary
            isEdit={isEdit}
            submitDisabled={isSubmitting || !isValid}
          />
        </Form>
      )}
    </Formik>
  );
}

export default AccountACHSettingForm;
