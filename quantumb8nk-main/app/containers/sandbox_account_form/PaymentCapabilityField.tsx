// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { Field } from "formik";
import React from "react";
import { camelCase } from "lodash";
import {
  DirectionEnum,
  PaymentTypeEnum,
} from "../../../generated/dashboard/graphqlSchema";
import FormikCheckboxField from "../../../common/formik/FormikCheckboxField";
import { PRETTY_PAYMENT_TYPE_MAPPING } from "../../constants";

export interface PaymentCapabilityFieldProps {
  paymentType: PaymentTypeEnum;
  directions: DirectionEnum[];
}

const prettyPaymentType = (paymentType: string) =>
  PRETTY_PAYMENT_TYPE_MAPPING[paymentType] || paymentType;

export default function PaymentCapabilityField({
  paymentType,
  directions,
}: PaymentCapabilityFieldProps) {
  const isDisabled = (direction: DirectionEnum) =>
    !directions.includes(direction);
  return (
    <tr>
      <td className="py-2 text-xs">{prettyPaymentType(paymentType)}</td>
      <td>
        <div className="flex justify-center">
          <Field
            id={`paymentCapabilities-${paymentType}-credit`}
            type="checkbox"
            name={`paymentCapabilities.${camelCase(paymentType)}`}
            value="credit"
            disabled={isDisabled("credit" as DirectionEnum)}
            component={FormikCheckboxField}
          />
        </div>
      </td>
      <td>
        <div className="flex justify-center">
          <Field
            id={`paymentCapabilities-${paymentType}-debit`}
            type="checkbox"
            name={`paymentCapabilities.${camelCase(paymentType)}`}
            value="debit"
            disabled={isDisabled("debit" as DirectionEnum)}
            component={FormikCheckboxField}
          />
        </div>
      </td>
    </tr>
  );
}
