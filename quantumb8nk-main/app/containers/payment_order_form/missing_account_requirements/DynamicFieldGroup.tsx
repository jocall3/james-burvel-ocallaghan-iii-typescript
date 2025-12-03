// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { FocusEventHandler } from "react";
import { useFormikContext, getIn } from "formik";
import {
  PaymentScenarios__GroupTypeEnum,
  Maybe,
  PaymentFieldGroup,
  PaymentScenarios__EntityTypeEnum,
} from "../../../../generated/dashboard/graphqlSchema";
import DynamicField from "./DynamicField";
import { FormValues } from "../../../constants/payment_order_form";

interface DynamicFieldGroupProps {
  paymentFieldGroup: PaymentFieldGroup;
  handleBlur: (e: FocusEventHandler<HTMLInputElement>) => void;
  fieldName: string;
  flattenedIndex: number;
}

function DynamicFieldGroup({
  paymentFieldGroup,
  handleBlur,
  fieldName,
  // This is the higher level index of all fields flattened to include fields in groups here
  flattenedIndex,
}: DynamicFieldGroupProps): JSX.Element {
  const { errors, touched, values } = useFormikContext<FormValues>();

  const atLeastOneValid = paymentFieldGroup.fields.some(
    (paymentField, index) => {
      let isTouched: boolean;
      let hasErrors: boolean;
      let value: Maybe<string> | undefined;
      if (
        paymentField?.entityType ===
        PaymentScenarios__EntityTypeEnum.AccountDetail
      ) {
        isTouched = getIn(
          touched,
          `additionalExternalAccountFields.accountDetails[${
            flattenedIndex + index
          }].accountNumber`,
        ) as boolean;
        hasErrors = getIn(
          errors,
          `additionalExternalAccountFields.accountDetails[${
            flattenedIndex + index
          }]`,
        ) as boolean;

        value =
          values.additionalExternalAccountFields?.accountDetails?.[
            flattenedIndex + index
          ]?.accountNumber;
      } else if (
        paymentField?.entityType ===
        PaymentScenarios__EntityTypeEnum.RoutingDetail
      ) {
        isTouched = getIn(
          touched,
          `additionalExternalAccountFields.routingDetails[${
            flattenedIndex + index
          }].routingNumber`,
        ) as boolean;
        hasErrors = getIn(
          errors,
          `additionalExternalAccountFields.routingDetails.[${
            flattenedIndex + index
          }]`,
        ) as boolean;
      } else {
        throw new Error("Entity Type Missing");
      }

      return isTouched && !hasErrors && value;
    },
  );

  const overrideValidate = (
    value: Maybe<string> | undefined,
  ): Maybe<string> | undefined => {
    switch (paymentFieldGroup.groupType) {
      case PaymentScenarios__GroupTypeEnum.AllOf: {
        if (!value) {
          return paymentFieldGroup.errorDescription ?? "This field is required";
        }
        return undefined;
      }
      case PaymentScenarios__GroupTypeEnum.AnyOf:
      case PaymentScenarios__GroupTypeEnum.OneOf: {
        if (!atLeastOneValid && !value) {
          return (
            paymentFieldGroup.errorDescription ?? "This field may be required"
          );
        }
        return undefined;
      }
      default:
        throw new Error("Group Type Missing");
    }
  };

  const fieldList = paymentFieldGroup.fields.map(
    (field, index): JSX.Element => (
      <DynamicField
        key={`${fieldName}[${flattenedIndex + index}].${field.field}_${
          field.type ?? ""
        }`}
        fieldName={`additionalExternalAccountFields.${
          field?.entityType === PaymentScenarios__EntityTypeEnum.AccountDetail
            ? "accountDetails"
            : "routingDetails"
        }`}
        overrideValidate={overrideValidate}
        paymentField={field}
        handleBlur={handleBlur}
        flattenedIndex={flattenedIndex + index}
      />
    ),
  );

  return <div>{fieldList}</div>;
}

export default DynamicFieldGroup;
