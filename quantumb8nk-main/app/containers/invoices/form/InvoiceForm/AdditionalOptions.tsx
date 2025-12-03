// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field, FormikProps } from "formik";
import React from "react";

import {
  Heading,
  HorizontalRule,
  Toggle,
} from "../../../../../common/ui-components";
import { FormikErrorMessage } from "../../../../../common/formik";
import InvoiceNotificationEmails from "../InvoiceNotificationEmails";
import InvoiceCSVAttachment from "../InvoiceCSVAttachment";
import InvoiceNotificationEmailAddresses from "../InvoiceNotificationEmailAdresses";
import { InvoiceFormValues } from "./types";
import InvoiceOverdueEmails from "../InvoiceOverdueEmails";

type PropTypes = {
  setFieldValue: FormikProps<InvoiceFormValues>["setFieldValue"];
  values: FormikProps<InvoiceFormValues>["values"];
  counterpartyEmail: string;
  isEditing: boolean | undefined;
};

export default function AdditionalOptions({
  setFieldValue,
  values,
  counterpartyEmail,
  isEditing,
}: PropTypes) {
  return (
    <>
      <Heading level="h1" size="l">
        Additional Options
      </Heading>
      <div className="pb-4 pt-2">
        <HorizontalRule />
      </div>
      {!isEditing && (
        <div className="flex flex-col">
          <div>
            <Field
              id="autoAdvance"
              name="autoAdvance"
              component={Toggle}
              toggleClassName="p-0"
              labelClassName="text-black ml-3"
              label="Enable auto advance"
              checked={values.autoAdvance}
              handleChange={() => {
                void setFieldValue("autoAdvance", !values.autoAdvance);
              }}
            />
          </div>
          <p className="ml-8 text-xs text-text-muted">
            If enabled, the invoice will be created and automatically issued. It
            cannot be modified afterwards. If the invoice fails to issue, the
            invoice will not be created.
          </p>
          <FormikErrorMessage className="ml-8" name="autoAdvance" />
        </div>
      )}
      <InvoiceNotificationEmails
        notificationsEnabled={values.notificationsEnabled}
      >
        <InvoiceNotificationEmailAddresses
          emails={values.notificationEmailAddresses}
          counterpartyEmail={values.recipientEmail || counterpartyEmail}
        />
        <InvoiceCSVAttachment
          oldFilename={values.csvAttachmentFilename || ""}
          oldLink={values.csvLink || ""}
        />
        <InvoiceOverdueEmails
          remindAfterOverdueDays={values.remindAfterOverdueDays}
        />
      </InvoiceNotificationEmails>
    </>
  );
}
