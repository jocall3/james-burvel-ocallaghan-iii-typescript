// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useRef } from "react";
import { Field, Form, Formik, FormikProps } from "formik";
import * as yup from "yup";
import {
  DirectionEnum,
  PaymentFlow,
  useCreatePaymentFlowMutation,
  ExistingExternalAccountsFilterEnum,
  ExternalAccountCollectionEnum,
} from "../../../generated/dashboard/graphqlSchema";
import { Button, FieldGroup, Label } from "../../../common/ui-components";
import { isChecked } from "../../../app/utilities/CheckboxUtils";
import {
  FormikCheckboxField,
  FormikDatePicker,
  FormikErrorMessage,
  FormikInputField,
  FormikSelectField,
} from "../../../common/formik";
import FormikCounterpartyAsyncSelect, {
  CounterpartyOption,
} from "../../../common/formik/FormikCounterpartyAsyncSelect";
import useErrorBanner from "../../../common/utilities/useErrorBanner";
import FormikInternalAccountAsyncSelect, {
  InternalAccountOption,
} from "../../../common/formik/FormikInternalAccountAsyncSelect";

const DIRECTION_OPTIONS = [{ label: "Debit", value: DirectionEnum.Debit }];

const EXISTING_EXTERNAL_ACCOUNTS_FILTER_OPTIONS = [
  { label: "Verified", value: ExistingExternalAccountsFilterEnum.Verified },
];

const EXTERNAL_ACCOUNT_COLLECTION_OPTIONS = [
  { label: "Enabled", value: ExternalAccountCollectionEnum.Enabled },
  { label: "Disabled", value: ExternalAccountCollectionEnum.Disabled },
];

interface FormValues {
  amount: string;
  currency: string;
  direction: DirectionEnum;
  effectiveDateSelectionEnabled: boolean[];
  dueDate: null | string;
  counterparty?: CounterpartyOption;
  internalAccount?: InternalAccountOption;
  existingExternalAccountsFilter: null | ExistingExternalAccountsFilterEnum;
  externalAccountCollection: ExternalAccountCollectionEnum;
  filterCounterpartyExternalAccounts: boolean[];
}

interface CreatePaymentFlowFormProps {
  onSuccess: (externalAcccountFlow: PaymentFlow) => void;
}

function CreatePaymentFlowForm({ onSuccess }: CreatePaymentFlowFormProps) {
  const flashError = useErrorBanner();
  const formikRef = useRef<FormikProps<FormValues>>(null);

  const [createPaymentFlowMutation] = useCreatePaymentFlowMutation();

  const initialValues = {
    amount: "199",
    currency: "USD",
    direction: DirectionEnum.Debit,
    effectiveDateSelectionEnabled: [false],
    dueDate: null,
    counterparty: undefined,
    internalAccount: undefined,
    externalAccountCollection: ExternalAccountCollectionEnum.Enabled,
    existingExternalAccountsFilter: null,
    filterCounterpartyExternalAccounts: [false],
  };

  const validate = yup.object().shape({
    amount: yup.number().required("Amount is required"),
    currency: yup.string().required("Currency is required"),
    direction: yup.string().required("Direction is required"),
    counterparty: yup.object().required("Counterparty must be selected"),
    internalAccount: yup
      .object()
      .required("Originating account must be selected"),
  });

  const createPaymentFlow = async (formValues: FormValues) => {
    const { counterparty, internalAccount } = formValues;

    if (!counterparty) {
      flashError("Counterparty is required.");
      return;
    }
    if (!internalAccount) {
      flashError("Originating account is required.");
      return;
    }

    await createPaymentFlowMutation({
      variables: {
        input: {
          input: {
            amount: Number(formValues.amount),
            currency: formValues.currency,
            direction: formValues.direction,
            effectiveDateSelectionEnabled: isChecked(
              formValues.effectiveDateSelectionEnabled,
            ),
            dueDate: formValues.dueDate
              ? new Date(formValues.dueDate).toISOString()
              : null,
            counterpartyId: counterparty.value,
            originatingAccountId: internalAccount.value,
            existingExternalAccountsFilter:
              formValues.existingExternalAccountsFilter
                ? formValues.existingExternalAccountsFilter
                : null,
            externalAccountCollection: formValues.externalAccountCollection,
          },
        },
      },
      onCompleted: (data) => {
        const flow = data.createPaymentFlow?.paymentFlow;

        if (!flow) {
          const errorMsg = data.createPaymentFlow?.errors.join(",");
          flashError(errorMsg || "Error creating PaymentFlow.");
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
      onSubmit={createPaymentFlow}
      innerRef={formikRef}
      validationSchema={validate}
    >
      {({ isSubmitting, values, isValid }) => (
        <Form className="flex flex-col space-y-6">
          <div className="pb-1 text-base font-medium">Create PaymentFlow</div>
          <FieldGroup>
            <Label id="amount">Amount</Label>
            <Field id="amount" name="amount" component={FormikInputField} />
            <FormikErrorMessage name="amount" />
          </FieldGroup>

          <FieldGroup>
            <Label id="currency">Currency</Label>
            <Field id="currency" name="currency" component={FormikInputField} />
            <FormikErrorMessage name="currency" />
          </FieldGroup>

          <FieldGroup>
            <Label id="direction">Direction</Label>
            <Field
              id="direction"
              name="direction"
              component={FormikSelectField}
              options={DIRECTION_OPTIONS}
            />
            <FormikErrorMessage name="direction" />
          </FieldGroup>

          <FieldGroup>
            <Label>Effective Date Selection Enabled</Label>
            <Field
              component={FormikCheckboxField}
              type="checkbox"
              value
              name="effectiveDateSelectionEnabled"
            />
            <FormikErrorMessage name="effectiveDateSelectionEnabled" />
          </FieldGroup>
          <FieldGroup>
            <Label>Due Date (requires Effective Date Selection Enabled)</Label>
            <Field
              component={FormikDatePicker}
              name="dueDate"
              minDate={new Date()}
              disabled={!isChecked(values.effectiveDateSelectionEnabled)}
            />
            <FormikErrorMessage name="dueDate" />
          </FieldGroup>
          <FieldGroup>
            <Label id="internalAccount">Originating Account</Label>
            <FormikInternalAccountAsyncSelect />
            <FormikErrorMessage name="internalAccount" />
          </FieldGroup>
          <FieldGroup>
            <Label id="counterparty">Counterparty</Label>
            <FormikCounterpartyAsyncSelect />
            <FormikErrorMessage name="counterparty" />
          </FieldGroup>
          <FieldGroup>
            <Label>Filter Counterparty External Accounts?</Label>
            <Field
              component={FormikCheckboxField}
              type="checkbox"
              value
              name="filterCounterpartyExternalAccounts"
            />
            <FormikErrorMessage name="filterCounterpartyExternalAccounts" />
          </FieldGroup>
          {isChecked(values.filterCounterpartyExternalAccounts) && (
            <FieldGroup>
              <Label>
                Existing External Accounts Filter (requires Filter Counterparty
                External Accounts){" "}
              </Label>
              <Field
                id="existingExternalAccountsFilter"
                name="existingExternalAccountsFilter"
                component={FormikSelectField}
                options={EXISTING_EXTERNAL_ACCOUNTS_FILTER_OPTIONS}
                disabled={!isChecked(values.filterCounterpartyExternalAccounts)}
              />
              <FormikErrorMessage name="existingExternalAccountsFilter" />
            </FieldGroup>
          )}
          <FieldGroup>
            <Label>External Account Collection</Label>
            <Field
              id="externalAccountCollection"
              name="externalAccountCollection"
              component={FormikSelectField}
              options={EXTERNAL_ACCOUNT_COLLECTION_OPTIONS}
            />
            <FormikErrorMessage name="externalAccountCollection" />
          </FieldGroup>

          <div className="pt-2">
            <Button
              buttonType="primary"
              isSubmit
              disabled={!isValid || isSubmitting}
            >
              Create Payment Flow
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default CreatePaymentFlowForm;
