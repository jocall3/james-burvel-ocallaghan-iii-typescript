// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { FormikProps, Field } from "formik";
import React from "react";
import { FieldGroup, FieldsRow, Label } from "~/common/ui-components";
import FormikMultiSelectField from "~/common/formik/FormikMultiSelectField";
import { PaymentTypeEnum } from "~/generated/dashboard/graphqlSchema";
import { AccountCapabilityFormValues } from "./FormValues";

const ACH_SUBTYPE_OPTIONS = [
  {
    label: "CCD (Corporate Credit or Debit Entry)",
    value: "CCD",
  },
  {
    label: "PPD (Prearranged Payment and Deposit)",
    value: "PPD",
  },
  {
    label: "IAT (International ACH Transaction)",
    value: "IAT",
  },
  {
    label: "CTX (Corporate Trade Exchange)",
    value: "CTX",
  },
  {
    label: "WEB (Internet Initiated/Mobile Entry)",
    value: "WEB",
  },
  {
    label: "CIE (Customer Initiated Entry)",
    value: "CIE",
  },
  {
    label: "TEL (Truncated Entry Exchange)",
    value: "TEL",
  },
];

function validPaymentSubtypes(
  paymentType: AccountCapabilityFormValues["paymentType"],
) {
  // Cross Border payments currently do not allow any strict subtype validation.
  switch (paymentType) {
    case PaymentTypeEnum.Ach:
      return ACH_SUBTYPE_OPTIONS;
    default:
      return [];
  }
}

interface PaymentSubtypesFormSectionProps {
  form: FormikProps<AccountCapabilityFormValues>;
}

export default function PaymentSubtypesFormSection({
  form,
}: PaymentSubtypesFormSectionProps) {
  const subtypes = validPaymentSubtypes(form.values.paymentType);

  return (
    <FieldsRow columns={1}>
      <FieldGroup>
        <Label id="paymentSubtypes" fieldConditional="Optional">
          Payment Subtypes
        </Label>
        <p className="font-base text-xs text-gray-500">
          You <b>do not</b> need to specify payment subtypes (ie. SEC Codes) for
          ACH. By default, all codes are valid. <br />
          Note: CCD & PPD are system fallback values.
        </p>
        <Field
          id="paymentSubtypes"
          name="paymentSubtypes"
          options={subtypes}
          disabled={subtypes.length === 0}
          component={FormikMultiSelectField}
          placeholder="Default all values"
        />
      </FieldGroup>
    </FieldsRow>
  );
}
