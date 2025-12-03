// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import AddressFormSection from "~/app/components/AddressFormSection";
import {
  AddressFormValues,
  defaultAddress,
} from "~/common/formik/FormikAddressForm";
import { CurrencyEnum } from "~/generated/dashboard/graphqlSchema";
import { FieldGroup, Label, FieldsRow } from "~/common/ui-components";
import { FormikErrorMessage, FormikInputField } from "~/common/formik";
import CurrencySelector from "~/app/components/CurrencySelector";
import { InternalAccountFormValues } from "./FormValues";
import InternalAccountFormSummary from "./InternalAccountFormSummary";
import AccountDetailsFormSection from "./AccountDetailsFormSection";
import RoutingDetailsFormSection from "./RoutingDetailsFormSection";

const DEFAULT_INITIAL_VALUES: InternalAccountFormValues = {
  name: "",
  partyName: "",
  currency: CurrencyEnum.Usd,
  partyAddress: { ...defaultAddress },
  accountDetails: [],
  routingDetails: [],
};

const VALIDATION_SCHEMA = Yup.object({
  partyName: Yup.string().required("Party name is required"),
  currency: Yup.string().required("Currency is required"),
  name: Yup.string().nullable(),
});

interface InternalAccountFormProps {
  initialValues?: InternalAccountFormValues;
  onSubmit: (data: InternalAccountFormValues) => Promise<void>;
  connectionName: string;
  bankName?: string | null;
}

function InternalAccountForm({
  initialValues = DEFAULT_INITIAL_VALUES,
  onSubmit,
  connectionName,
  bankName,
}: InternalAccountFormProps) {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={VALIDATION_SCHEMA}
      validateOnMount
    >
      {({ setFieldValue, isSubmitting, isValid, values }) => (
        <Form className="grid grid-cols-[minmax(0,2fr),1fr] gap-4">
          <div>
            <FieldsRow>
              <FieldGroup>
                <Label
                  fieldConditional="Optional"
                  helpText="A nickname for the account, typically set by the customer"
                >
                  Name
                </Label>
                <Field name="name" component={FormikInputField} />
                <FormikErrorMessage name="name" />
              </FieldGroup>
            </FieldsRow>

            <FieldsRow>
              <FieldGroup>
                <Label id="partyName" helpText="The customer's legal name">
                  Party Name
                </Label>
                <Field name="partyName" component={FormikInputField} />
                <FormikErrorMessage name="partyName" />
              </FieldGroup>
            </FieldsRow>

            <FieldsRow>
              <CurrencySelector name="currency" />
            </FieldsRow>
            <FieldsRow columns={1}>
              <AccountDetailsFormSection
                accountDetails={values.accountDetails}
              />
            </FieldsRow>

            <FieldsRow columns={1}>
              <RoutingDetailsFormSection
                routingDetails={values.routingDetails}
              />
            </FieldsRow>
            <AddressFormSection
              id="partyAddress"
              addressType="Party"
              address={values.partyAddress}
              onAddressChange={(address: AddressFormValues) => {
                void setFieldValue("partyAddress", address);
              }}
            />
          </div>

          <InternalAccountFormSummary
            submitDisabled={isSubmitting || !isValid}
            connectionName={connectionName}
            bankName={bankName}
          />
        </Form>
      )}
    </Formik>
  );
}

export default InternalAccountForm;
