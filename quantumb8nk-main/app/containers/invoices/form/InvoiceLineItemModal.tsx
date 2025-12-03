// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Formik, Field, FormikProps } from "formik";
import * as Yup from "yup";
import {
  FieldGroup,
  Label,
  ConfirmModal,
  CurrencyInput,
} from "../../../../common/ui-components";
import {
  FormikInputField,
  FormikErrorMessage,
  FormikNumberFormatField,
} from "../../../../common/formik";
import { CURRENCY_SYMBOLS_BY_ISO_CODE } from "../../../constants";
import { PaymentDirectionEnum } from "../../../../generated/dashboard/graphqlSchema";
import { getCurrencyDecimalScale } from "../../../../common/utilities/sanitizeAmount";

import { InvoiceLineItemFormValues } from "./InvoiceForm/types";

// Formats a sanitized amount (integer) into a string to display to the user.
export function formatSanitizedAmount(
  currency: string,
  sanitizedAmount: number | null,
  decimals?: number,
) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals || getCurrencyDecimalScale(currency),
  });

  // add back the decimals to the integer amount
  const amount = sanitizedAmount
    ? sanitizedAmount / 10 ** getCurrencyDecimalScale(currency)
    : 0;

  return formatter.format(amount);
}

function InvoiceLineItemModal({
  onConfirm,
  onRequestClose,
  currency,
  lineItem,
}: {
  onConfirm: (lineItem: InvoiceLineItemFormValues) => void;
  onRequestClose: () => void;
  currency: string;
  lineItem: InvoiceLineItemFormValues | null;
}) {
  const validate = Yup.object({
    name: Yup.string().required("Name is required"),
    quantity: Yup.number().nullable().required("Quantity is required"),
    unitAmount: Yup.number().nullable().required("Unit Amount is required"),
    direction: Yup.string().nullable().required("Direction is required"),
  });
  return (
    <Formik
      initialValues={
        lineItem || {
          name: "",
          description: "",
          direction: null,
          amount: null,
          quantity: null,
          unitAmount: null,
        }
      }
      validationSchema={validate}
      onSubmit={onConfirm}
    >
      {({
        values,
        setFieldValue,
        handleSubmit,
      }: FormikProps<InvoiceLineItemFormValues>) => (
        <ConfirmModal
          title="Add Line Item"
          isOpen
          confirmText="Save"
          setIsOpen={() => onRequestClose()}
          onConfirm={handleSubmit}
        >
          <div id="invoiceLineItemModal">
            <FieldGroup>
              <Label>Item Name</Label>
              <Field name="name" component={FormikInputField} />
              <FormikErrorMessage name="name" />
            </FieldGroup>
            <FieldGroup>
              <Label>Quantity</Label>
              <Field
                name="quantity"
                component={FormikNumberFormatField}
                autocomplete="do-not-autofill"
                decimalScale={0}
                fixedDecimalScale
                allowNegative={false}
              />
              <FormikErrorMessage name="quantity" />
            </FieldGroup>
            <FieldGroup>
              <Label>Unit Amount</Label>
              <Field
                name="unitAmount"
                component={CurrencyInput}
                prefix={
                  CURRENCY_SYMBOLS_BY_ISO_CODE[
                    currency as keyof typeof CURRENCY_SYMBOLS_BY_ISO_CODE
                  ]
                }
                input={{
                  name: "unitAmount",
                  value: values.unitAmount,
                }}
                allowNegative
                fixedDecimalScale={false}
                decimalScale={getCurrencyDecimalScale(currency) + 12}
                onValueChange={(inputValues: {
                  floatValue: number;
                  value: string;
                }) => {
                  void setFieldValue("unitAmount", inputValues.value);
                  void setFieldValue(
                    "direction",
                    inputValues.floatValue >= 0
                      ? PaymentDirectionEnum.Debit
                      : PaymentDirectionEnum.Credit,
                  );
                }}
              />
              <FormikErrorMessage name="unitAmount" />
            </FieldGroup>
            <FieldGroup>
              <Label>Amount</Label>
              <Field
                name="amount"
                component={FormikInputField}
                disabled
                value={
                  values.quantity && values.unitAmount
                    ? formatSanitizedAmount(
                        currency,
                        parseInt(values.quantity, 10) *
                          parseFloat(values.unitAmount) *
                          10 ** getCurrencyDecimalScale(currency),
                      )
                    : ""
                }
              />
            </FieldGroup>
            <FieldGroup>
              <Label fieldConditional="Optional">Description</Label>
              <Field name="description" component={FormikInputField} />
            </FieldGroup>
          </div>
        </ConfirmModal>
      )}
    </Formik>
  );
}

export default InvoiceLineItemModal;
