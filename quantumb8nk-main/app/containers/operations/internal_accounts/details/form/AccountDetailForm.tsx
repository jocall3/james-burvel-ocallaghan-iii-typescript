// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field } from "formik";
import { AccountNumberTypeEnum } from "~/generated/dashboard/graphqlSchema";
import { makeOptionsFromEnum } from "~/app/utilities/selectUtilities";
import { Label, FieldGroup } from "~/common/ui-components";
import {
  FormikSelectField,
  FormikInputField,
  FormikErrorMessage,
} from "~/common/formik";
import {
  required,
  validAccountNumber,
} from "../../../../../../common/ui-components/validations";

const ACCOUNT_NUMBER_TYPE_OPTIONS = makeOptionsFromEnum(AccountNumberTypeEnum);

export const defaultAccountDetail = {
  accountNumberType: AccountNumberTypeEnum.Other,
  accountNumber: "",
};

function AccountDetailForm() {
  return (
    <div className="flex flex-col gap-y-6">
      <FieldGroup>
        <Label>Account Number Type</Label>
        <Field
          name="accountNumberType"
          component={FormikSelectField}
          options={ACCOUNT_NUMBER_TYPE_OPTIONS}
          validate={required}
        />
        <FormikErrorMessage name="accountNumberType" />
      </FieldGroup>
      <FieldGroup>
        <Label>Account Number</Label>
        <Field
          name="accountNumber"
          component={FormikInputField}
          validate={(value) => required(value) || validAccountNumber(value)}
        />
        <FormikErrorMessage name="accountNumber" />
      </FieldGroup>
    </div>
  );
}

export default AccountDetailForm;
