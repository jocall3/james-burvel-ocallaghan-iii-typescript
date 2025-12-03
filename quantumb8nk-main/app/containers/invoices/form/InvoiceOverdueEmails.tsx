// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { Field, FieldArray } from "formik";
import {
  FieldGroup,
  Heading,
  HorizontalRule,
  Label,
  SelectField,
} from "../../../../common/ui-components";
import {
  FormikErrorMessage,
  FormikNumberFormatField,
} from "../../../../common/formik";

export default function InvoiceOverdueEmails({
  remindAfterOverdueDays,
}: {
  remindAfterOverdueDays: string[] | undefined;
}) {
  const [numberOfReminderEmails, setNumberOfReminderEmails] =
    React.useState<number>(remindAfterOverdueDays?.length || 0);

  const validateAmount = (value: number | string): string | undefined => {
    if (value > 365) {
      return "Maximum value is 365 days";
    }
    if (value !== "" && value < 1) {
      return "Minimum value is 1 day";
    }
    return undefined;
  };

  return (
    <div className="pt-4">
      <FieldArray name="remindAfterOverdueDays">
        {({ remove }) => (
          <div className="flex flex-col space-y-2 pb-10">
            <div className="flex justify-between">
              <div className="flex items-center">
                <Heading level="h2" size="l">
                  Overdue Email Notifications
                </Heading>
              </div>
            </div>
            <div className="pb-4 pt-2">
              <HorizontalRule />
            </div>
            <FieldGroup>
              <div className="flex items-center pb-4">
                <Label className="w-60 pb-2">Number of Reminder Emails</Label>
                <div className="w-80">
                  <SelectField
                    id="sendFromDomain"
                    selectValue={numberOfReminderEmails}
                    placeholder={0}
                    options={[
                      { value: 0, label: "0" },
                      { value: 1, label: "1" },
                      { value: 2, label: "2" },
                      { value: 3, label: "3" },
                    ]}
                    handleChange={(value: number) => {
                      if (value < numberOfReminderEmails) {
                        for (
                          let i = numberOfReminderEmails;
                          i > value;
                          i -= 1
                        ) {
                          remove(i - 1);
                        }
                      }
                      setNumberOfReminderEmails(value);
                    }}
                    required
                  />
                </div>
              </div>
            </FieldGroup>
            {Array.from(Array(numberOfReminderEmails).keys()).map(
              (index: number) => (
                <div className="flex items-center pb-4">
                  <Label className="pb-0.25 w-32">
                    Reminder email #{index + 1}
                  </Label>
                  <div className="w-100 pt-0.25 flex flex-row">
                    <div className="w-12 flex-none items-center pr-1">
                      <Field
                        component={FormikNumberFormatField}
                        required
                        format="###"
                        validate={validateAmount}
                        name={`remindAfterOverdueDays.${index}`}
                      />
                    </div>
                    <Label className="pb-1.5">days after due date</Label>
                    <FormikErrorMessage
                      className="pl-1 pt-1.5"
                      name={`remindAfterOverdueDays.${index}`}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </FieldArray>
    </div>
  );
}
