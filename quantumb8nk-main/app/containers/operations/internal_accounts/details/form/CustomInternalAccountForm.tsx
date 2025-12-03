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
import { CustomInternalAccountFormValues } from "./FormValues";
import InternalAccountFormSummary from "./InternalAccountFormSummary";

const DEFAULT_INITIAL_VALUES: CustomInternalAccountFormValues = {
  name: "",
  currency: CurrencyEnum.Usd,
  partyAddress: { ...defaultAddress },
};

const VALIDATION_SCHEMA = Yup.object({
  name: Yup.string().required("Name is required"),
  currency: Yup.string().required("Currency is required"),
});

interface InternalAccountFormProps {
  initialValues?: CustomInternalAccountFormValues;
  onSubmit: (data: CustomInternalAccountFormValues) => Promise<void>;
  connectionName: string;
  bankName?: string | null;
}

function CustomInternalAccountForm({
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
                <Label id="name">Name</Label>
                <Field name="name" component={FormikInputField} />
                <FormikErrorMessage name="name" />
              </FieldGroup>
            </FieldsRow>

            <FieldsRow>
              <CurrencySelector name="currency" />
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

export default CustomInternalAccountForm;
