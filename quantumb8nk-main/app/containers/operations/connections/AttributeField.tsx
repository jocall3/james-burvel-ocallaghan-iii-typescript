// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field } from "formik";
import { FormikInputField } from "../../../../common/formik";

export interface AttributeFieldProps {
  label: string;
  name: string;
  inputType: string;
}

export default function AttributeField({
  label,
  name,
  inputType,
}: AttributeFieldProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="pr-4">{label}</td>
      <td>
        {inputType === "text" && (
          <Field name={name} component={FormikInputField} />
        )}
        {inputType === "checkbox" && (
          <Field
            className="cursor-pointer align-middle"
            name={name}
            type="checkbox"
          />
        )}
      </td>
    </tr>
  );
}
