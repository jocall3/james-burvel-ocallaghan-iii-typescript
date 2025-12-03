// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field } from "formik";
import React from "react";
import { Label } from "../../../common/ui-components";
import { FormikInputField, FormikErrorMessage } from "../../../common/formik";
import { FormValues } from "../../constants/user_invitation_form";

interface UserInvitationEmailFieldProps {
  values: FormValues;
}

function UserInvitationEmailField({ values }: UserInvitationEmailFieldProps) {
  return (
    <div className="form-row form-row-full flex py-2">
      <div className="grid grid-flow-row text-base font-medium">
        <Label id="email">Work email</Label>
        <Field
          name="email"
          component={FormikInputField}
          required
          disabled={values.mode !== "create"}
        />
        <FormikErrorMessage name="email" />
      </div>
    </div>
  );
}

export default UserInvitationEmailField;
