// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useRef } from "react";
import { Field, Form, Formik, FormikProps } from "formik";
import * as yup from "yup";
import {
  AccountCollectionFlow,
  PaymentTypeEnum,
  ReceivingCountriesEnum,
  useCreateAccountCollectionFlowMutation,
} from "../../../generated/dashboard/graphqlSchema";
import { Button, FieldGroup, Label } from "../../../common/ui-components";
import { FormikErrorMessage, FormikSelectField } from "../../../common/formik";
import FormikCounterpartyAsyncSelect, {
  CounterpartyOption,
} from "../../../common/formik/FormikCounterpartyAsyncSelect";
import useErrorBanner from "../../../common/utilities/useErrorBanner";

const PAYMENT_TYPE_OPTIONS = [
  { label: "ACH", value: PaymentTypeEnum.Ach },
  { label: "Wire", value: PaymentTypeEnum.Wire },
  { label: "Check", value: PaymentTypeEnum.Check },
];

// TODO: (@sohdas) add { label: "United Kingdom", value: "GBR" }
const RECEIVING_COUNTRY_OPTIONS = [
  { label: "United States", value: "USA" },
  { label: "Australia", value: "AUS" },
  { label: "Belgium", value: "BEL" },
  { label: "Canada", value: "CAN" },
  { label: "Chile", value: "CHL" },
  { label: "China", value: "CHN" },
  { label: "Colombia", value: "COL" },
  { label: "France", value: "FRA" },
  { label: "Germany", value: "DEU" },
  { label: "Hong Kong", value: "HKG" },
  { label: "India", value: "IND" },
  { label: "Ireland", value: "IRL" },
  { label: "Italy", value: "ITA" },
  { label: "Mexico", value: "MEX" },
  { label: "Netherlands", value: "NLD" },
  { label: "Peru", value: "PER" },
  { label: "Spain", value: "ESP" },
  { label: "United Kingdom", value: "GBR" },
];
interface FormValues {
  counterparty?: CounterpartyOption;
  paymentType: PaymentTypeEnum;
  receivingCountry: ReceivingCountriesEnum;
}

interface CreateAccountCollectionFlowFormProps {
  onSuccess: (accountCollectionFlow: AccountCollectionFlow) => void;
}

function CreateAccountCollectionFlowForm({
  onSuccess,
}: CreateAccountCollectionFlowFormProps) {
  const flashError = useErrorBanner();
  const formikRef = useRef<FormikProps<FormValues>>(null);

  const [createAccountCollectionFlowMutation] =
    useCreateAccountCollectionFlowMutation();

  const initialValues = {
    paymentType: PaymentTypeEnum.Ach as PaymentTypeEnum,
    counterparty: undefined,
    receivingCountry: ReceivingCountriesEnum.Usa as ReceivingCountriesEnum,
  };

  const validate = yup.object().shape({
    paymentType: yup.string().required("Payment Type must be selected"),
    counterparty: yup.object().required("Counterparty must be selected"),
    receivingCountry: yup
      .string()
      .required("Receiving Country must be selected"),
  });

  const createAccountCollectionFlow = async (formValues: FormValues) => {
    const { paymentType, counterparty, receivingCountry } = formValues;

    if (!paymentType) {
      flashError("Payment Type is required.");
      return;
    }

    if (!counterparty) {
      flashError("Counterparty is required.");
      return;
    }

    if (!receivingCountry) {
      flashError("Receiving Country is required.");
      return;
    }

    await createAccountCollectionFlowMutation({
      variables: {
        input: {
          input: {
            counterpartyId: counterparty.value,
            paymentTypes: [paymentType],
            receivingCountries: [receivingCountry],
          },
        },
      },
      onCompleted: (data) => {
        const flow = data.createAccountCollectionFlow?.accountCollectionFlow;

        if (!flow) {
          const errorMsg = data.createAccountCollectionFlow?.errors.join(",");
          flashError(errorMsg || "Error creating AccountCollectionFlow.");
        } else {
          onSuccess(flow);
        }
      },
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validateOnMount
      onSubmit={createAccountCollectionFlow}
      innerRef={formikRef}
      validationSchema={validate}
    >
      {({ isSubmitting, isValid }) => (
        <Form className="flex flex-col space-y-6">
          <div className="pb-1 text-base font-medium">
            Create AccountCollectionFlow
          </div>
          <FieldGroup>
            <Label id="paymentType">Payment Type</Label>
            <Field
              id="paymentType"
              name="paymentType"
              component={FormikSelectField}
              options={PAYMENT_TYPE_OPTIONS}
              closeMenuOnSelect
            />
            <FormikErrorMessage name="paymentType" />
          </FieldGroup>

          <FieldGroup>
            <Label id="receivingCountry">Receiving Country</Label>
            <Field
              id="receivingCountry"
              name="receivingCountry"
              component={FormikSelectField}
              options={RECEIVING_COUNTRY_OPTIONS}
              closeMenuOnSelect
            />
            <FormikErrorMessage name="receivingCountry" />
          </FieldGroup>

          <FieldGroup>
            <Label id="counterparty">Counterparty</Label>
            <FormikCounterpartyAsyncSelect />
            <FormikErrorMessage name="counterparty" />
          </FieldGroup>

          <div className="pt-2">
            <Button
              buttonType="primary"
              isSubmit
              disabled={!isValid || isSubmitting}
            >
              Create Account Collection Flow
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default CreateAccountCollectionFlowForm;
