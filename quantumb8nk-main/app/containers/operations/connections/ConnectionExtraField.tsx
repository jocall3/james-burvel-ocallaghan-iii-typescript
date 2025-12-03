// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { FormFieldType } from "../../../../generated/dashboard/graphqlSchema";
import AttributeField from "./AttributeField";

export interface ConnectionExtraFieldProps {
  name: string;
  fields: FormFieldType[];
}

export default function ConnectionExtraField({
  name,
  fields,
}: ConnectionExtraFieldProps) {
  return (
    <table className="w-full">
      <colgroup>
        <col />
        <col className="w-full" />
      </colgroup>
      <tbody>
        {fields.map((field) => (
          <AttributeField
            key={field.name}
            label={field.label}
            name={`${name}.${field.name}`}
            inputType={field.inputType}
          />
        ))}
      </tbody>
    </table>
  );
}
