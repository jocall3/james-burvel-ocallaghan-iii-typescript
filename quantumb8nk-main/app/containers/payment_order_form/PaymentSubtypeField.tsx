// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useMemo } from "react";
import { ErrorMessage, Field, useFormikContext } from "formik";
import { cn } from "~/common/utilities/cn";
import { required } from "../../../common/ui-components/validations";
import { FormValues } from "../../constants/payment_order_form";
import {
  AccountCapabilityFragment,
  PaymentSubtypeEnum,
  PaymentTypeEnum,
} from "../../../generated/dashboard/graphqlSchema";
import { FieldGroup, Label, SelectField } from "../../../common/ui-components";
import { InputOptions, fieldInvalid } from "./PaymentOrderCreateUtils";
import { PRETTY_CROSS_BORDER_PAYMENT_SUBTYPE_OPTIONS } from "../../constants";

interface PaymentSubtypeProps extends InputOptions {
  accountCapabilities?: Array<AccountCapabilityFragment>;
}

function PaymentSubtype({
  accountCapabilities,
  field,
  form,
  invalid,
  id,
}: PaymentSubtypeProps) {
  const filteredPaymentSubtypeOptions = useMemo(() => {
    const capableSubtypes: PaymentSubtypeEnum[] =
      (accountCapabilities?.find(
        (capability) => capability.paymentType === PaymentTypeEnum.CrossBorder,
      )?.paymentSubtypes as PaymentSubtypeEnum[]) || [];

    // TODO (RAILS-2059): Until users set paymentSubtype for their Cross Border capability, we will show all subtypes
    if (capableSubtypes.length === 0) {
      return PRETTY_CROSS_BORDER_PAYMENT_SUBTYPE_OPTIONS;
    }

    return PRETTY_CROSS_BORDER_PAYMENT_SUBTYPE_OPTIONS.filter(
      (type) => capableSubtypes?.includes(type.value as PaymentSubtypeEnum),
    );
  }, [accountCapabilities]);

  return (
    <div className="flex w-full flex-col">
      <FieldGroup>
        <Label className="text-sm font-normal">Payment Subtype</Label>
        <SelectField
          id={id || undefined}
          // Currently only support cross border subtypes are supported
          handleChange={(value: PaymentTypeEnum) => {
            void form.setFieldValue(field.name, value);
          }}
          options={filteredPaymentSubtypeOptions}
          selectValue={field.value}
          classes={cn("flex-1 w-full react-select-container", {
            "border rounded border-red-500": invalid,
          })}
          name={field.name}
          placeholder="Select"
        />
        <ErrorMessage
          name={field.name}
          component="span"
          className="mt-1 text-xs text-text-critical"
        />
      </FieldGroup>
    </div>
  );
}

interface PaymentSubtypeFieldProps {
  accountCapabilities?: Array<AccountCapabilityFragment>;
}

function PaymentSubtypeField({
  accountCapabilities,
}: PaymentSubtypeFieldProps) {
  const {
    values: { paymentType, foreignExchangePaymentEnabled },
    errors,
    touched,
  } = useFormikContext<FormValues>();

  if (foreignExchangePaymentEnabled && paymentType !== PaymentTypeEnum.Wire) {
    return (
      <Field
        id="subtype"
        name="paymentSubtype"
        component={PaymentSubtype}
        accountCapabilities={accountCapabilities}
        validate={required}
        invalid={fieldInvalid(errors, touched, "subtype")}
      />
    );
  }

  return null;
}

export default PaymentSubtypeField;
