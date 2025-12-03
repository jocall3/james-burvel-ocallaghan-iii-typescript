// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { ErrorMessage } from "formik";
import React from "react";
import ReactTooltip from "react-tooltip";
import { PaymentFieldProps } from "../../constants/payment_order_form";
import { FieldGroup, Label, SelectGroup } from "../../../common/ui-components";

interface PaymentActionContainerProps {
  invalid: boolean;
}

function PaymentDirection({
  field,
  form,
  invalid,
}: PaymentFieldProps & PaymentActionContainerProps) {
  return (
    <div className="flex w-full flex-col">
      <FieldGroup>
        <div className="flex items-center">
          <Label id="action">Action</Label>
        </div>
        <span
          data-tip={
            form.values.foreignExchangePaymentEnabled
              ? "When foreign exchange payment is enabled, you cannot debit an international counterparty."
              : ""
          }
        >
          <SelectGroup
            labelClasses="font-normal text-sm"
            selectOptions={[
              {
                text: "Pay",
                value: "credit",
                id: "user_pilot_tour_payment_direction_credit",
              },
              {
                text: "Charge",
                value: "debit",
                id: "user_pilot_tour_payment_direction_debit",
              },
            ]}
            onChange={(value) => {
              void form.setFieldValue("direction", value);
            }}
            value={field.value}
            invalid={invalid}
            disabled={form.values.foreignExchangePaymentEnabled}
          />
          <ErrorMessage
            name={field.name}
            component="span"
            className="text-xs text-text-critical"
          />
        </span>
        <ReactTooltip
          data-place="bottom"
          place="bottom"
          data-type="dark"
          data-effect="float"
        />
      </FieldGroup>
    </div>
  );
}

export default PaymentDirection;
