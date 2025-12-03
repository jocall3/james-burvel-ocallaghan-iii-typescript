// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field } from "formik";

import { ISO_CODES } from "../../../../constants";
import { AccountCapabilityFragment } from "../../../../../generated/dashboard/graphqlSchema";
import {
  FieldGroup,
  FieldsRow,
  Label,
} from "../../../../../common/ui-components";
import {
  FormikDatePicker,
  FormikErrorMessage,
} from "../../../../../common/formik";
import PaymentCurrencySelect from "../../../payment_order_form/PaymentCurrencySelect";

type PropTypes = {
  accountCapabilities?: Array<AccountCapabilityFragment>;
};

export default function CurrencyAndDates({ accountCapabilities }: PropTypes) {
  return (
    <FieldsRow>
      <div className="flex min-w-60 flex-col gap-y-2">
        <Label>Currency</Label>
        <Field
          id="currency"
          name="currency"
          component={PaymentCurrencySelect}
          options={ISO_CODES.map((code) => ({
            value: code,
            label: code,
          }))}
          classNamePrefix="react-select"
          className="currency-select"
          accountCapabilities={accountCapabilities}
        />
      </div>
      <FieldGroup>
        <Label>Due Date</Label>
        <Field component={FormikDatePicker} name="dueDate" fullWidth />
        <FormikErrorMessage name="dueDate" />
      </FieldGroup>
    </FieldsRow>
  );
}
