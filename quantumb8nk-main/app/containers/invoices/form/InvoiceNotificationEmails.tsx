// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { ReactNode } from "react";
import { Field, useFormikContext } from "formik";
import { Toggle } from "../../../../common/ui-components";

export default function InvoiceNotificationEmails({
  notificationsEnabled,
  children,
}: {
  notificationsEnabled: boolean;
  children: ReactNode;
}) {
  const { setFieldValue, values } = useFormikContext<{
    notificationsEnabled: boolean;
  }>();

  return (
    <div className="pb-4 pt-4">
      <div className="flex justify-between">
        <div className="flex flex-col pb-4">
          <Field
            id="enableNotificationEmailsToggle"
            name="notificationsEnabled"
            component={Toggle}
            toggleClassName="p-0"
            labelClassName="text-black ml-3"
            label="Enable email notifications"
            checked={notificationsEnabled}
            handleChange={() => {
              void setFieldValue(
                "notificationsEnabled",
                !values.notificationsEnabled,
              );
            }}
          />
          <p className="ml-8 text-xs text-text-muted">
            If enabled, the invoice’s counterparty and notification email
            addresses will be emailed about invoice status changes. You can add
            up to 20 emails to receive notifications about this invoice. A CSV
            can also optionally be attached to the email notifying the recipient
            of payment being due.
          </p>
        </div>
      </div>
      {notificationsEnabled && children}
    </div>
  );
}
