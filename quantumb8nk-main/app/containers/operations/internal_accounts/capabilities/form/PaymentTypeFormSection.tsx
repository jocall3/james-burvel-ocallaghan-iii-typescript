// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field, FormikProps } from "formik";
import React from "react";
import { FormikErrorMessage, FormikSelectField } from "~/common/formik";
import { OptionType } from "~/common/formik/FormikSelectField";
import {
  FieldsRow,
  FieldGroup,
  Label,
  SelectGroup,
} from "~/common/ui-components";
import {
  DirectionEnum,
  PaymentTypeEnum,
} from "~/generated/dashboard/graphqlSchema";
import { PAYMENT_TYPE_OPTIONS } from "~/app/constants";
import { AccountCapabilityFormValues } from "./FormValues";

interface PaymentTypeFormSectionProps {
  form: FormikProps<AccountCapabilityFormValues>;
  initialValues: AccountCapabilityFormValues;
}

export default function PaymentTypeFormSection({
  form,
  initialValues,
}: PaymentTypeFormSectionProps) {
  return (
    <FieldsRow columns={2}>
      <FieldGroup>
        <Label id="paymentType">Payment Type</Label>
        <Field
          id="paymentType"
          name="paymentType"
          placeholder="Select"
          options={PAYMENT_TYPE_OPTIONS}
          component={FormikSelectField}
          onChange={(option: OptionType | null) => {
            form.resetForm({
              values: {
                ...initialValues,
                paymentType: (option?.value as PaymentTypeEnum) || "",
              },
            });
          }}
        />
        <FormikErrorMessage name="paymentType" />
      </FieldGroup>
      <FieldGroup>
        <Label
          id="direction"
          helpText="Book, Wires, and Checks are generally always credit."
        >
          Direction
        </Label>
        <SelectGroup
          labelClasses="font-normal text-sm"
          selectOptions={[
            {
              text: "Credit",
              value: DirectionEnum.Credit,
              id: "credit_direction",
            },
            {
              text: "Debit",
              value: DirectionEnum.Debit,
              id: "debit_direction",
            },
          ]}
          value={form.values.direction || undefined}
          onChange={(value) => {
            void form.setFieldValue("direction", value);
          }}
        />
        <FormikErrorMessage name="direction" />
      </FieldGroup>
    </FieldsRow>
  );
}
