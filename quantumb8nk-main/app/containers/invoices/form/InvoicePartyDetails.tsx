// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field } from "formik";
import React from "react";

import {
  Heading,
  HorizontalRule,
  Label,
} from "../../../../common/ui-components";
import {
  FormikInputField,
  FormikNumberFormatField,
  FormikErrorMessage,
} from "../../../../common/formik";

export default function InvoicePartyDetails({
  title,
  nameFieldName,
  phoneFieldName,
  emailFieldName,
  websiteFieldName,
  onEmailChange,
}: {
  title: string;
  nameFieldName?: string;
  phoneFieldName?: string;
  emailFieldName: string;
  websiteFieldName?: string;
  onEmailChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="pb-8">
      <div className="flex justify-between">
        <div className="flex items-center">
          <div className="text-base">
            <Heading level="h2" size="m">
              {title}
            </Heading>
          </div>
          <span className="pl-2 pt-1 text-xs font-normal text-text-muted">
            Optional
          </span>
        </div>
      </div>
      <div className="pb-4 pt-2">
        <HorizontalRule />
      </div>
      {nameFieldName ? (
        <div className="flex items-center pb-4">
          <Label className="w-40">Name</Label>
          <div className="w-80">
            <Field component={FormikInputField} name={nameFieldName} />
          </div>
        </div>
      ) : null}
      {phoneFieldName ? (
        <div className="flex items-center pb-4">
          <Label className="w-40">Phone Number</Label>
          <div className="w-80">
            <Field
              component={FormikNumberFormatField}
              name={phoneFieldName}
              format="+1(###)-###-####"
              autocomplete="do-not-autofill"
              formattedValue
            />
          </div>
        </div>
      ) : null}
      <div className="flex items-center pb-4">
        <Label className="w-40">Email</Label>
        <div className="w-80">
          <Field
            component={FormikInputField}
            name={emailFieldName}
            onChange={onEmailChange}
          />
          <FormikErrorMessage name={emailFieldName} />
        </div>
      </div>
      {websiteFieldName ? (
        <div className="flex items-center pb-4">
          <Label className="w-40">Website</Label>
          <div className="w-80">
            <Field component={FormikInputField} name={websiteFieldName} />
            <FormikErrorMessage name={websiteFieldName} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
