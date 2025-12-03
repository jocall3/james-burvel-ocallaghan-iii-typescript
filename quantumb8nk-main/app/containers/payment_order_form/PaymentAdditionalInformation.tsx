// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import {
  connect,
  ErrorMessage,
  Field,
  FormikErrors,
  FormikTouched,
} from "formik";
import React from "react";
import DateTimePicker from "~/common/ui-components/DateTimePicker/DateTimePicker";
import { FormValues } from "../../constants/payment_order_form";
import { maxLength } from "../../../common/ui-components/validations";
import {
  FieldGroup,
  FormSurface,
  Input,
  Label,
} from "../../../common/ui-components";
import { InputOptions } from "./PaymentOrderCreateUtils";

interface FormikContextProps {
  values: FormValues;
  errors: FormikErrors<FormValues>;
  touched: FormikTouched<FormValues>;
  fieldInvalid: (
    errors: FormikErrors<FormValues>,
    touched: FormikTouched<FormValues>,
    fieldName: string,
  ) => boolean;
  setFieldValue: (
    field: string,
    value: string | null,
    shouldValidate?: boolean | undefined,
  ) => Promise<void | FormikErrors<FormValues>>;
}

const MAX_STATEMENT_DESCRIPTOR_LENGTH = new Map([
  ["ach", 10],
  ["eft", 15],
  ["sen", 40],
  ["bacs", 18],
  ["au_becs", 18],
  ["signet", 40],
]);

export function maxStatementDescriptorLength(paymentType: string) {
  const length = MAX_STATEMENT_DESCRIPTOR_LENGTH.get(paymentType);

  if (length) {
    return maxLength(length);
  }

  return () => undefined;
}

function remittanceInformationLabel(paymentType: string) {
  if (paymentType === "ach") {
    return "Addenda Record";
  }

  if (paymentType === "wire") {
    return "Originator to Beneficiary Information (OBI)";
  }

  return "Remittance Information";
}

export function AdditionalInformationInput({
  field,
  form,
  invalid,
  id,
}: InputOptions) {
  return (
    <div className="flex flex-col">
      <Input
        id={id || undefined}
        name={field.name}
        onChange={(event) => {
          void form.setFieldValue(field.name, event.target.value);
        }}
        value={field.value || ""}
        invalid={invalid}
      />
    </div>
  );
}

function PaymentAdditionalInformation({
  values,
  errors,
  touched,
  fieldInvalid,
  setFieldValue,
}: FormikContextProps) {
  const paymentType = values.paymentType || "";

  return (
    <FormSurface
      heading="Additional Information"
      id="additionalInformation"
      optional
      addButtonProps={{}}
    >
      <div className="flex flex-col gap-4 pt-4">
        {/* Label should change to addenda record depending on payment type */}
        <FieldGroup direction="top-to-bottom">
          <Label id="statementDescriptorLabel">
            {paymentType === "check"
              ? "Memo Line"
              : "Bank Statement Description"}
          </Label>
          <span className="-mt-1 text-xs text-text-muted">
            Appears in bank statements for both parties
          </span>
          <ErrorMessage
            name="statementDescriptor"
            component="span"
            className="text-xs text-text-critical"
          />
          <Field
            id="statementDescriptor"
            name="statementDescriptor"
            component={AdditionalInformationInput}
            validate={maxStatementDescriptorLength(paymentType)}
            invalid={fieldInvalid(errors, touched, "statementDescriptor")}
          />
        </FieldGroup>
        <FieldGroup direction="top-to-bottom">
          <Label id="remittanceInformation">
            {remittanceInformationLabel(paymentType)}
          </Label>
          <span className="-mt-1 text-xs text-text-muted">
            Information for your counterparty
          </span>
          <ErrorMessage
            name="remittanceInformation"
            component="span"
            className="text-xs text-text-critical"
          />
          <Field
            id="remittanceInformation"
            name="remittanceInformation"
            component={AdditionalInformationInput}
            invalid={fieldInvalid(errors, touched, "remittanceInformation")}
          />
        </FieldGroup>
        <FieldGroup direction="top-to-bottom">
          <Label id="description">Internal Description</Label>
          <span className="-mt-1 text-xs text-text-muted">
            Not visible to counterparties
          </span>
          <ErrorMessage
            name="description"
            component="span"
            className="mt-1 text-xs text-text-critical"
          />
          <Field
            id="description"
            name="description"
            component={AdditionalInformationInput}
            invalid={fieldInvalid(errors, touched, "description")}
          />
        </FieldGroup>

        <FieldGroup>
          <Field
            id="processAfter"
            name="processAfter"
            component={DateTimePicker}
            dateLabel="Process After"
            timeLabel="Time of Day"
            onChange={(value: string) => {
              if (value) {
                void setFieldValue("processAfter", value);
              } else {
                void setFieldValue("processAfter", null);
              }
            }}
            invalid={fieldInvalid(errors, touched, "processAfter")}
            value={values.processAfter as string}
          />
          <ErrorMessage
            name="processAfter"
            component="span"
            className="text-xs text-text-critical"
          />
        </FieldGroup>
      </div>
    </FormSurface>
  );
}

export default connect(PaymentAdditionalInformation);
