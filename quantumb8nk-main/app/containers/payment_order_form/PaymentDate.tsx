// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { ErrorMessage } from "formik";
import moment from "moment-timezone";
import { PaymentFieldProps } from "../../constants/payment_order_form";
import {
  formatISODateTime,
  parseISOLocalDate,
} from "../../../common/utilities/formatDate";
import {
  DatePicker as ModernDatePicker,
  FieldGroup,
  Label,
} from "../../../common/ui-components";
import useUserTimezone from "../../../common/utilities/useUserTimezone";

function PaymentDate({ field, form }: PaymentFieldProps) {
  function fieldHasError() {
    const meta: Record<string, boolean | string | []> = {};

    if (form.errors && form.touched && form.errors[field.name]) {
      meta.error = form.errors[field.name] as string;
      meta.touched = form.touched[field.name] as boolean;
    }

    return meta;
  }

  const userTimezone = useUserTimezone();

  return (
    <div className="flex flex-col">
      <FieldGroup>
        <Label>Payment Date</Label>
        <ModernDatePicker
          input={{
            onChange: (value: string | null) => {
              // if a user picks a date in the future it has to match
              // their timezone, otherwise the DatePicker is buggy
              // and picks previous day
              if (value)
                void form.setFieldValue(
                  "effectiveDate",
                  moment(value).tz(userTimezone).format("YYYY-MM-DD"),
                );
            },
            value: field.value,
            name: field.name,
          }}
          label=""
          placeholder="ASAP"
          labelClasses="font-normal text-sm"
          dateFormatter={formatISODateTime}
          dateParser={parseISOLocalDate}
          meta={fieldHasError()}
          fullWidth
          filterDate={(date) =>
            moment.tz(userTimezone).isSameOrBefore(date, "day")
          }
        />
        <ErrorMessage
          name="effectiveDate"
          component="span"
          className="mt-1 text-xs text-text-critical"
        />
      </FieldGroup>
    </div>
  );
}

export default PaymentDate;
