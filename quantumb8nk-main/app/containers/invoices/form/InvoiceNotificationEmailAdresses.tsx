// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field, FieldArray } from "formik";
import {
  Button,
  Heading,
  HorizontalRule,
  Icon,
} from "../../../../common/ui-components";
import {
  FormikInputField,
  FormikErrorMessage,
} from "../../../../common/formik";

export default function InvoiceNotificationEmailAddresses({
  emails,
  counterpartyEmail,
}: {
  emails: string[];
  counterpartyEmail: string;
}) {
  const MAX_NOTIFICATION_EMAILS = 20;

  const canAddEmail =
    !emails ||
    emails.length === 0 ||
    (emails.length <= MAX_NOTIFICATION_EMAILS && !!emails[emails.length - 1]);
  return (
    <div className="pt-4">
      <FieldArray name="notificationEmailAddresses">
        {({ remove, push }) => (
          <>
            <div className="flex justify-between">
              <div className="flex items-center">
                <Heading level="h2" size="l">
                  Notification Recipients
                </Heading>
              </div>
              <Button onClick={() => push("")} disabled={!canAddEmail}>
                Add Email Address
              </Button>
            </div>
            <div className="pb-4 pt-2">
              <HorizontalRule />
            </div>
            <div className="w-80">
              {emails && emails.length > 0 ? (
                emails.map((email, index: number) => (
                  // we want to keep the array index here in one of the rare cases
                  // where it actually makes sense. React will lose focus if we
                  // set the key to the input since the input will be removed and
                  // rerendered. What we want is to keep the input stable between
                  // changes, so in this case we actually do want to key on the index.
                  <div className="group flex pb-4" key={index}>
                    <div className="w-80 pr-4">
                      <Field
                        component={FormikInputField}
                        name={`notificationEmailAddresses.${index}`}
                        disabled={counterpartyEmail && index === 0}
                      />
                      <FormikErrorMessage
                        name={`notificationEmailAddresses.${index}`}
                      />
                    </div>
                    {counterpartyEmail && index === 0 ? (
                      <div className="mt-1 flex h-6 w-6 hover:rounded hover:bg-gray-100">
                        (Counterparty)
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="mt-1 flex h-6 w-6 flex-none items-center justify-center hover:rounded hover:bg-gray-100"
                        onClick={() => remove(index)}
                      >
                        <div className="hidden group-hover:flex">
                          <Icon iconName="clear" />
                        </div>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="pb-4 text-gray-500">None</div>
              )}
            </div>
          </>
        )}
      </FieldArray>
    </div>
  );
}
