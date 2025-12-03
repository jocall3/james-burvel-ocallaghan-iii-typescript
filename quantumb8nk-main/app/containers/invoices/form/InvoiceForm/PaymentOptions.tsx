// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field, FormikProps } from "formik";
import React from "react";

import { required } from "../../../../../common/ui-components/validations";
import {
  Button,
  FieldGroup,
  FieldsRow,
  Heading,
  HorizontalRule,
  Label,
  Toggle,
} from "../../../../../common/ui-components";
import { AccountCapabilityFragment } from "../../../../../generated/dashboard/graphqlSchema";
import {
  FormikDatePicker,
  FormikErrorMessage,
  FormikSelectField,
} from "../../../../../common/formik";
import PaymentMethod from "../../../payment_order_form/PaymentMethod";
import CounterpartyAccountSelect from "../../../payment_order_form/CounterpartyAccountSelect";
import VirtualAccountSelect from "../../VirtualAccountSelect";

import {
  fieldInvalid,
  FALLBACK_PAYMENT_METHODS,
  paymentOptions,
} from "./utils";
import InvoiceTooltip from "./tooltip";
import { InvoiceFormValues } from "./types";

type PropTypes = {
  setFieldValue: FormikProps<InvoiceFormValues>["setFieldValue"];
  values: FormikProps<InvoiceFormValues>["values"];
  errors: FormikProps<InvoiceFormValues>["errors"];
  touched: FormikProps<InvoiceFormValues>["touched"];
  setDisablePaymentInitiation: (arg: boolean) => void;
  setDisableEnablePaymentCollection: (arg: boolean) => void;
  setShowPaymentFields: (arg: boolean) => void;
  accountCapabilities: Array<AccountCapabilityFragment> | undefined;
  disablePaymentInitation: boolean;
  disableEnablePaymentCollection: boolean;
  paymentFields: boolean;
};

export default function PaymentOptions({
  setFieldValue,
  values,
  errors,
  touched,
  setDisablePaymentInitiation,
  setDisableEnablePaymentCollection,
  setShowPaymentFields,
  disablePaymentInitation,
  disableEnablePaymentCollection,
  paymentFields,
  accountCapabilities,
}: PropTypes) {
  return (
    <>
      <Heading level="h1" size="l">
        Payment Options
      </Heading>
      <div className="pb-4 pt-2">
        <HorizontalRule />
      </div>
      <div className="flex flex-col space-y-2 pb-10">
        <div>
          <VirtualAccountSelect
            onChange={(value) => {
              void setFieldValue("virtualAccount", value);
            }}
            selectedValue={values.virtualAccount}
          />
          <p className="ml-8 pt-4 text-xs text-text-muted">
            When a virtual account is used, then the details of the virtual
            account will be displayed in place of the originating account
            details.
          </p>
        </div>
        <Field
          id="includePaymentFlowToggle"
          name="includePaymentFlow"
          component={Toggle}
          disabled={disableEnablePaymentCollection}
          toggleClassName="p-0"
          labelClassName="text-black ml-3"
          label="Enable payment collection"
          checked={values.includePaymentFlow}
          handleChange={() => {
            setDisablePaymentInitiation(!disablePaymentInitation);
            void setFieldValue(
              "includePaymentFlow",
              !values.includePaymentFlow,
            );
          }}
        />
        <p className="ml-8 text-xs text-text-muted">
          If enabled, the user will be able to enter their account information
          to complete the payment. The originating account must have ACH Debit
          capabilities in order to enable this option.
        </p>
      </div>
      <div className="flex flex-col pb-10">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="text-base">
              <Heading level="h2" size="m">
                Enable Auto-Payment
              </Heading>
            </div>
            <span className="pl-2 pt-1 text-xs font-normal text-text-muted">
              Optional
            </span>
          </div>
          <div className="pl-2">
            <Button
              buttonType="secondary"
              disabled={disablePaymentInitation}
              onClick={() => {
                void setFieldValue("initiatePayment", !values.initiatePayment);
                if (!disableEnablePaymentCollection) {
                  void setFieldValue("paymentEffectiveDate", null);
                  void setFieldValue("receivingAccountId", null);
                  void setFieldValue("paymentType", null);
                  void setFieldValue("fallbackPaymentMethod", null);
                }
                setDisableEnablePaymentCollection(
                  !disableEnablePaymentCollection,
                );
                setShowPaymentFields(!paymentFields);
              }}
            >
              {paymentFields ? "Cancel" : "Add Auto-Payment"}
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Automatically create a payment order that will initiate an ACH Debit
          for the invoice amount
        </p>
        <div className="pb-4 pt-2">
          <HorizontalRule />
        </div>
        {paymentFields ? (
          <div>
            <FieldsRow>
              <FieldGroup>
                <Label>Payment Effective Date</Label>
                <Field
                  component={FormikDatePicker}
                  validateOnChange={false}
                  name="paymentEffectiveDate"
                  minDate={new Date()}
                />
                <FormikErrorMessage name="paymentEffectiveDate" />
              </FieldGroup>
              <Field
                id="paymentType"
                name="paymentType"
                priorityName="priority"
                component={PaymentMethod}
                validateOnChange={false}
                accountCapabilities={accountCapabilities}
                customPaymentTypeOptions={paymentOptions}
                invalid={fieldInvalid(errors, touched, "paymentType")}
              />
            </FieldsRow>
            <FieldsRow>
              <FieldGroup>
                <Label
                  id="counterpartyAccountLabel"
                  className="text-sm font-normal"
                >
                  Counterparty Account
                  <InvoiceTooltip />
                </Label>
                <Field
                  id="receivingAccountId"
                  name="receivingAccountId"
                  component={CounterpartyAccountSelect}
                  validateOnChange={false}
                  key={values.counterpartyId || "counterpartyId"}
                  originatingAccount={values.originatingAccountId}
                  receivingAccountId={values.receivingAccountId}
                  counterpartyId={values.counterpartyId}
                  disabled={values.counterpartyId === null}
                  externalOnly
                  validate={required}
                  invalid={fieldInvalid(errors, touched, "receivingAccountId")}
                />
              </FieldGroup>
              <FieldGroup>
                <Label>Fallback Payment Method</Label>
                <Field
                  name="fallbackPaymentMethod"
                  component={FormikSelectField}
                  options={FALLBACK_PAYMENT_METHODS}
                />
              </FieldGroup>
            </FieldsRow>
          </div>
        ) : (
          <div className="pb-4 text-gray-500">None</div>
        )}
      </div>
    </>
  );
}
