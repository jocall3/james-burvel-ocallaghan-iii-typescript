// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import {
  Field,
  Form,
  Formik,
  FormikErrors,
  FormikOnSubmit,
  FormikValidate,
} from "formik";
import { SelectOption } from "../../../generated/dashboard/graphqlSchema";
import PaymentCapabilitiesFormSection from "./PaymentCapabilitiesFormSection";
import { FormValues } from "./types";
import {
  FormikErrorMessage,
  FormikInputField,
  FormikSelectField,
} from "../../../common/formik";
import { Button, FieldGroup, Label } from "../../../common/ui-components";

export type Validate = FormikValidate<FormValues>;
export type OnSubmit = FormikOnSubmit<FormValues>;
export type ValidateErrors = FormikErrors<FormValues>;

export interface Props {
  connectionIdOptions: SelectOption[];
  currencyOptions: SelectOption[];
  initialValues: FormValues;
  onSubmit: OnSubmit;
  validate: Validate;
}

export default function NewSandboxAccountForm({
  connectionIdOptions,
  currencyOptions,
  initialValues,
  onSubmit,
  validate,
}: Props) {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
    >
      {({ isSubmitting }) => (
        <Form>
          <FieldGroup>
            <Label id="name">Name</Label>
            <Field id="name" name="name" component={FormikInputField} />
            <FormikErrorMessage name="name" />
          </FieldGroup>
          <FieldGroup>
            <Label id="connectionId">Vendor</Label>
            <Field
              id="connectionId"
              name="connectionId"
              options={connectionIdOptions}
              component={FormikSelectField}
              isDisabled={connectionIdOptions.length === 1}
            />
            <FormikErrorMessage name="connectionId" />
          </FieldGroup>
          <FieldGroup>
            <Label id="accountNumber" fieldConditional="Optional">
              Account Number
            </Label>
            <Field
              id="accountNumber"
              name="accountNumber"
              component={FormikInputField}
            />
            <FormikErrorMessage name="accountNumber" />
          </FieldGroup>
          <FieldGroup>
            <Label id="currency">Currency</Label>
            <Field
              id="currency"
              name="currency"
              options={currencyOptions}
              component={FormikSelectField}
            />
            <FormikErrorMessage name="currency" />
          </FieldGroup>
          <PaymentCapabilitiesFormSection />
          <Button buttonType="primary" isSubmit disabled={isSubmitting}>
            Create
          </Button>
        </Form>
      )}
    </Formik>
  );
}
