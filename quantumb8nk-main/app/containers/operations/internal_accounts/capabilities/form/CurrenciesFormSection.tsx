// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field } from "formik";
import { FieldsRow, FieldGroup, Label } from "~/common/ui-components";
import FormikMultiSelectField from "~/common/formik/FormikMultiSelectField";
import { ISO_CODES } from "~/common/constants";
import { FormikCheckboxField, FormikErrorMessage } from "~/common/formik";

const currencyOptions = ISO_CODES.map((isoCode) => ({
  label: isoCode,
  value: isoCode,
}));

export default function CurrenciesFormSection() {
  return (
    <>
      <FieldsRow columns={1}>
        <FieldGroup>
          <Label fieldConditional="Optional">Currencies</Label>
          <p className="font-base text-xs text-gray-500">
            If you select &quot;Any Currency&quot; below, please still input
            your internal account’s currency.
          </p>
          <Field
            name="currencies"
            component={FormikMultiSelectField}
            options={currencyOptions}
          />
          <FormikErrorMessage name="currencies" />
        </FieldGroup>
      </FieldsRow>
      <FieldsRow columns={1}>
        <FieldGroup direction="left-to-right">
          <Field
            type="checkbox"
            id="anyCurrency"
            name="anyCurrency"
            component={FormikCheckboxField}
            value
          />
          <Label>Any currency?</Label>
        </FieldGroup>
      </FieldsRow>
    </>
  );
}
