// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { FormikErrors, FormikTouched, getIn } from "formik";
import { FocusEventHandler } from "react";
import { PaymentTypeEnum } from "../../../generated/dashboard/graphqlSchema";
import {
  FormValues,
  KeyValuePair,
  PaymentFieldProps,
} from "../../constants/payment_order_form";

export type ParsedPaymentType = {
  paymentType: PaymentTypeEnum;
  priority?: string;
};

export interface InputOptions extends PaymentFieldProps {
  invalid?: boolean;
  id?: string;
  handleBlur?: FocusEventHandler<HTMLInputElement>;
}

export const fieldInvalid = (
  errors: FormikErrors<FormValues>,
  touched: FormikTouched<FormValues>,
  fieldName: string,
) => (getIn(errors, fieldName) && getIn(touched, fieldName)) as boolean;

export function sanitizeMetadata(
  metadata: KeyValuePair[] | null = [],
  initialMetadata: KeyValuePair[] | null = [],
): Record<string, string> {
  const newValues = metadata?.reduce((acc, value) => {
    let newValue = value;
    const allValues = metadata.filter((v) => v.key === value.key);
    // This is the case when one deletes a key and renames another key to the deleted key name
    // We want to use the updated key name and value
    if (allValues.length > 1) {
      newValue = allValues.find((v) => !v.deleted) || newValue;
    }
    return { ...acc, [newValue.key]: newValue.value };
  }, {});

  if (newValues) {
    initialMetadata?.forEach((initialValue) => {
      // This means the original key was replaced with another key
      if (!(initialValue.key in newValues)) {
        newValues[initialValue.key] = "";
      }
    });
  }

  return newValues || {};
}
