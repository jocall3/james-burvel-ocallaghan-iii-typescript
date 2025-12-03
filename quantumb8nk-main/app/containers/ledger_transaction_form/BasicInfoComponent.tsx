// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field, FieldProps, FormikProps } from "formik";
import { FormValues } from "../../constants/ledger_transaction_form";
import {
  formatLocalDate,
  parseISOLocalDate,
} from "../../../common/utilities/formatDate";
import {
  FormikErrorMessage,
  FormikSelectField,
  FormikInputField,
} from "../../../common/formik";
import {
  DatePicker as ModernDatePicker,
  Label,
} from "../../../common/ui-components";

export default function BasicInfoComponent({
  isDisabledDate,
  isDisabledBasicInfo,
  showExternalId,
}: {
  isDisabledDate: boolean;
  isDisabledBasicInfo: boolean;
  showExternalId: boolean;
}) {
  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Posted", value: "posted" },
    { label: "Archived", value: "archived" },
  ];
  return (
    <div>
      <div className="form-row flex">
        <div className="w-1/3">
          <div>
            <Label id="status">Status</Label>
            <Field
              id="status"
              name="status"
              isDisabled={isDisabledBasicInfo}
              component={FormikSelectField}
              options={statusOptions}
            />
            <FormikErrorMessage name="status" />
          </div>
        </div>
        <Field>
          {({
            field,
            form,
          }: FieldProps<FormValues> & FormikProps<FormValues>) => (
            <div className="form-group">
              <ModernDatePicker
                name="date"
                input={{
                  onChange: (value: string | null) => {
                    if (value) void form.setFieldValue("effectiveDate", value);
                  },
                  value: field.value.effectiveDate,
                }}
                label="Effective Date"
                placeholder="Select a Date"
                dateFormatter={formatLocalDate}
                dateParser={parseISOLocalDate}
                disabled={isDisabledDate}
              />
            </div>
          )}
        </Field>
      </div>
      <div className="w-full pr-3">
        <Field
          id="description"
          name="description"
          label="Description"
          component={FormikInputField}
          disabled={isDisabledBasicInfo}
        />
      </div>
      {showExternalId && (
        <div className="mt-4">
          <div className="w-full pr-3">
            <Field
              id="externalId"
              name="externalId"
              label="External ID"
              component={FormikInputField}
              disabled={isDisabledBasicInfo}
            />
          </div>
          <FormikErrorMessage name="externalId" />
        </div>
      )}
    </div>
  );
}
